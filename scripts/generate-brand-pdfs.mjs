#!/usr/bin/env node
/**
 * Genera un PDF por marca Orbis en public/marcas/
 * Uso: npm run marcas:pdfs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public/marcas')

// Importar datos compilados no aplica; duplicamos lectura del TS vía eval simple del array exportado
// Mejor: leer subsidiaries.ts con regex ligero O importar desde un JSON generado.
// Usamos el módulo TypeScript transpilado no disponible — parseamos el archivo fuente.

function parseSubsidiaries() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/subsidiaries.ts'), 'utf8')
  const paletteMatch = src.match(/const palette = \[([\s\S]*?)\]/)
  const palette = []
  if (paletteMatch) {
    const re = /\['(#[0-9A-Fa-f]+)',\s*'(#[0-9A-Fa-f]+)'\]/g
    let m
    while ((m = re.exec(paletteMatch[1]))) palette.push([m[1], m[2]])
  }

  const specs = []
  const blockRe =
    /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*specialty:\s*'([^']+)',\s*tagline:\s*'([^']+)',\s*letter:\s*'([^']+)',\s*beachAffinity:\s*([0-9.]+),\s*costMultiplier:\s*([0-9.]+),\s*demandBonus:\s*([0-9.]+),\s*targets:\s*\[([^\]]*)\],\s*minStars:\s*(\d+),\s*maxStars:\s*(\d+),\s*lore:\s*'([^']+)',\s*imageStyle:\s*'([^']+)'\s*\}/g
  let m
  while ((m = blockRe.exec(src))) {
    const targets = m[9]
      .split(',')
      .map((t) => t.trim().replace(/'/g, ''))
      .filter(Boolean)
    specs.push({
      id: m[1],
      name: m[2],
      specialty: m[3],
      tagline: m[4],
      letter: m[5],
      beachAffinity: Number(m[6]),
      costMultiplier: Number(m[7]),
      demandBonus: Number(m[8]),
      targets,
      minStars: Number(m[10]),
      maxStars: Number(m[11]),
      lore: m[12],
      imageStyle: m[13],
    })
  }
  return specs.map((s, i) => {
    const [color, accent] = palette[i % palette.length] ?? ['#0E6D7F', '#C4A35A']
    return { ...s, color, accent }
  })
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function drawLogo(doc, sub, x, y, size) {
  doc.save()
  doc.roundedRect(x, y, size, size, size * 0.22).fill(sub.color)
  doc.lineWidth(2.2)
  doc.strokeColor(sub.accent)
  doc.roundedRect(x + 4, y + 4, size - 8, size - 8, size * 0.18).stroke()
  doc.fillColor('#F7F3EA')
  doc.font('Helvetica-Bold')
  doc.fontSize(sub.letter.length > 1 ? size * 0.28 : size * 0.42)
  doc.text(sub.letter, x, y + size * 0.62, { width: size, align: 'center' })
  doc.restore()
}

function writeBrandPdf(sub, outPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `${sub.name} · Orbis Hotels Group`,
      Author: 'Orbis Hotels Group',
      Subject: sub.specialty,
    },
  })
  const stream = fs.createWriteStream(outPath)
  doc.pipe(stream)

  const pageW = doc.page.width

  // Hero band
  doc.rect(0, 0, pageW, 160).fill(sub.color)
  doc.rect(0, 160, pageW, 10).fill(sub.accent)
  drawLogo(doc, sub, 48, 36, 90)

  doc.fillColor('#F7F3EA')
  doc.font('Helvetica-Bold').fontSize(26)
  doc.text(sub.name, 160, 48, { width: pageW - 220 })
  doc.font('Helvetica').fontSize(12)
  doc.fillColor(sub.accent)
  doc.text(sub.tagline, 160, 88, { width: pageW - 220 })
  doc.fillColor('#F7F3EA')
  doc.fontSize(10)
  doc.text(sub.specialty, 160, 112, { width: pageW - 220 })
  doc.text(`${'★'.repeat(sub.minStars)}${sub.minStars !== sub.maxStars ? `–${'★'.repeat(sub.maxStars)}` : ''}  ·  Estilo ${sub.imageStyle}`, 160, 132)

  let y = 190
  const section = (title) => {
    doc.fillColor(sub.color).font('Helvetica-Bold').fontSize(14)
    doc.text(title, 48, y)
    y = doc.y + 8
    doc.moveTo(48, y).lineTo(pageW - 48, y).strokeColor(sub.accent).lineWidth(1.5).stroke()
    y += 12
  }
  const row = (k, v) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(sub.color)
    doc.text(k, 48, y, { width: 140, continued: false })
    doc.font('Helvetica').fillColor('#1a1a1a')
    doc.text(String(v), 190, y, { width: pageW - 240 })
    y = Math.max(doc.y, y) + 10
  }

  section('Identidad')
  row('ID interno', sub.id)
  row('Monograma', sub.letter)
  row('Color primario', sub.color)
  row('Color acento', sub.accent)
  row('Estilo visual', sub.imageStyle)

  section('Posicionamiento')
  row('Especialidad', sub.specialty)
  row('Tagline', sub.tagline)
  row('Lore', sub.lore)
  row('Público objetivo', sub.targets.join(', '))
  row('Estrellas', `${sub.minStars} – ${sub.maxStars}`)

  section('Economía de marca')
  row('Multiplicador de coste', `×${sub.costMultiplier}`)
  row('Bonus de demanda', `+${Math.round(sub.demandBonus * 100)}%`)
  row('Afinidad playa', `${Math.round(sub.beachAffinity * 100)}/100`)

  section('Guía de uso')
  const tips = []
  if (sub.beachAffinity >= 0.85) tips.push('Priorizar solares con score de playa alto.')
  if (sub.beachAffinity <= 0.3) tips.push('Encaja mejor en ciudad, montaña o interior.')
  if (sub.costMultiplier >= 1.3) tips.push('Marca premium: presupuestos de obra elevados.')
  if (sub.costMultiplier <= 0.95) tips.push('Buena para expansión rápida y volumen.')
  if (sub.minStars >= 4) tips.push('No construir por debajo de 4★.')
  if (sub.targets.includes('negocios')) tips.push('Valorar salas, tech y cercanía a hubs.')
  if (sub.targets.includes('familiar')) tips.push('Kids club, parking y régimen familiar ayudan.')
  if (sub.imageStyle === 'luxury') tips.push('Calidad de edificio alta o lujo recomendada.')
  tips.push('El precio por noche lo fija la IA tras la apertura.')
  for (const t of tips) {
    doc.circle(56, y + 4, 2).fill(sub.accent)
    doc.fillColor('#1a1a1a').font('Helvetica').fontSize(10)
    doc.text(t, 66, y, { width: pageW - 120 })
    y = doc.y + 6
  }

  // Footer strip
  doc.rect(0, doc.page.height - 36, pageW, 36).fill(sub.color)
  doc.fillColor('#F7F3EA').fontSize(9)
  doc.text('Orbis Hotels Group · Dossier de marca', 48, doc.page.height - 22)

  doc.end()
  return new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

fs.mkdirSync(OUT, { recursive: true })
const brands = parseSubsidiaries()
if (!brands.length) {
  console.error('No se pudieron leer las marcas de subsidiaries.ts')
  process.exit(1)
}

const index = []
for (const sub of brands) {
  const file = `${sub.id}.pdf`
  await writeBrandPdf(sub, path.join(OUT, file))
  index.push({ id: sub.id, name: sub.name, file: `marcas/${file}`, color: sub.color, accent: sub.accent })
  process.stdout.write('.')
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ total: index.length, items: index }, null, 2))
console.log(`\n${index.length} PDFs de marca en public/marcas/`)
