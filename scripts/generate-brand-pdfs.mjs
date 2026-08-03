#!/usr/bin/env node
/**
 * Dossiers de marca Orbis (diseño editorial, logo SVG real, guía de construcción).
 * Uso: npm run marcas:pdfs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import { Resvg } from '@resvg/resvg-js'
import { buildSubsidiaryLogoSvg } from './brand-logo-svg.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public/marcas')

function parseSubsidiaries() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/subsidiaries.ts'), 'utf8')
  const specs = []
  // Cada filial declara color + accent propios en el objeto.
  const blockRe =
    /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*specialty:\s*'([^']+)',\s*tagline:\s*'([^']+)',\s*letter:\s*'([^']+)',\s*beachAffinity:\s*([0-9.]+),\s*costMultiplier:\s*([0-9.]+),\s*demandBonus:\s*([0-9.]+),\s*targets:\s*\[([^\]]*)\],\s*minStars:\s*(\d+),\s*maxStars:\s*(\d+),\s*lore:\s*'([^']+)',\s*imageStyle:\s*'([^']+)',\s*color:\s*'(#[0-9A-Fa-f]+)',\s*accent:\s*'(#[0-9A-Fa-f]+)'\s*\}/g
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
      color: m[14],
      accent: m[15],
    })
  }
  return specs
}

function logoSvg(sub, size = 512) {
  return buildSubsidiaryLogoSvg(sub, size)
}

function logoPng(sub, size = 512) {
  const jpgPath = path.join(ROOT, 'public/marcas/logos', `${sub.id}.jpg`)
  if (fs.existsSync(jpgPath)) {
    return fs.readFileSync(jpgPath)
  }
  const resvg = new Resvg(logoSvg(sub, size), {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

function brandGuide(sub) {
  const ideal = []
  const services = ['Wi‑Fi premium', 'Restaurante']
  const avoid = []
  const tips = []
  if (sub.beachAffinity >= 0.85) {
    ideal.push('Primera línea o score de playa ≥ 70', 'Destinos vacacionales / costa')
    services.push('Piscina', 'Playa privada', 'Spa')
    avoid.push('Interiores urbanos sin afinidad costera')
    tips.push('Sube el % de vistas al mar si el solar lo permite.')
  } else if (sub.beachAffinity <= 0.3) {
    ideal.push('Centros urbanos, hubs o montaña')
    services.push('Coworking', 'Gimnasio')
    avoid.push('Resorts de playa pura')
  } else {
    ideal.push('Ciudades costeras mixtas o destinos versátiles')
  }
  if (sub.targets.includes('negocios')) {
    ideal.push('Aeropuertos, ferias, distritos financieros')
    services.push('Coworking', 'Room service 24h')
    tips.push('Salas de reuniones y tech moderna suben la demanda MICE.')
  }
  if (sub.targets.includes('familiar')) {
    services.push('Kids club', 'Parking')
    tips.push('Parking amplio y régimen familiar mejoran ocupación.')
  }
  if (sub.targets.includes('wellness') || sub.imageStyle === 'luxury') {
    services.push('Spa', 'Sauna')
    tips.push('Calidad de edificio alta o lujo: coherente con la marca.')
  }
  if (sub.minStars >= 4) {
    avoid.push(`Construir por debajo de ${sub.minStars}★`)
    tips.push(`Mantén ${sub.minStars}–${sub.maxStars} estrellas.`)
  }
  if (sub.costMultiplier >= 1.3) {
    avoid.push('Presupuestos low-cost')
    tips.push('Marca premium: asume obra cara y personal alto.')
  }
  if (sub.costMultiplier <= 0.95) tips.push('Buena para volumen: muchos hoteles medianos.')
  tips.push('El precio por noche lo fija la IA tras abrir.')
  avoid.push('Ignorar la afinidad marca–solar del constructor')
  const u = (a) => [...new Set(a)]
  return { ideal: u(ideal), services: u(services), avoid: u(avoid), tips: u(tips) }
}

function footer(doc, sub, pageLabel) {
  const pageW = doc.page.width
  const pageH = doc.page.height
  doc.rect(0, pageH - 40, pageW, 40).fill(sub.color)
  doc.fillColor('#F7F3EA').font('Helvetica').fontSize(8)
  doc.text('Orbis Hotels Group · Dossier de marca', 40, pageH - 24, { continued: false })
  doc.fillColor(sub.accent)
  doc.text(pageLabel, 40, pageH - 24, { align: 'right', width: pageW - 80 })
}

function writeBrandPdf(sub, outPath) {
  const png = logoPng(sub, 640)
  const guide = brandGuide(sub)
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `${sub.name} · Orbis Hotels Group`,
      Author: 'Orbis Hotels Group',
      Subject: sub.specialty,
    },
  })
  const stream = fs.createWriteStream(outPath)
  doc.pipe(stream)
  const pageW = doc.page.width
  const pageH = doc.page.height
  const m = 40

  // —— Portada a sangre ——
  doc.rect(0, 0, pageW, pageH).fill(sub.color)
  doc.rect(0, pageH * 0.62, pageW, pageH * 0.38).fill(sub.accent)
  doc.opacity(0.12)
  doc.circle(pageW - 40, 80, 120).fill('#ffffff')
  doc.opacity(1)
  doc.image(png, (pageW - 140) / 2, 72, { width: 140, height: 140 })
  doc.fillColor('#F7F3EA').font('Helvetica-Bold').fontSize(11)
  doc.text('ORBIS HOTELS GROUP', m, 240, { align: 'center', width: pageW - m * 2 })
  doc.fontSize(28)
  doc.text(sub.name, m, 268, { align: 'center', width: pageW - m * 2 })
  doc.font('Helvetica').fontSize(13).fillColor('#F7F3EA')
  doc.text(sub.tagline, m + 30, 320, { align: 'center', width: pageW - m * 2 - 60 })
  doc.fontSize(10)
  doc.fillColor(sub.color)
  doc.text(sub.specialty, m, pageH * 0.7, { align: 'center', width: pageW - m * 2 })
  doc.font('Helvetica-Bold').fontSize(12)
  doc.text(
    `${'★'.repeat(sub.minStars)}${sub.minStars !== sub.maxStars ? ` – ${sub.maxStars}★` : ''}`,
    m,
    pageH * 0.76,
    { align: 'center', width: pageW - m * 2 },
  )
  doc.font('Helvetica').fontSize(9).fillColor(sub.color)
  doc.text('DOSSIER DE MARCA', m, pageH - 56, { align: 'center', width: pageW - m * 2 })

  // —— Página identidad ——
  doc.addPage()
  doc.rect(0, 0, pageW, 96).fill(sub.color)
  doc.rect(0, 96, pageW, 6).fill(sub.accent)
  doc.image(png, m, 18, { width: 60, height: 60 })
  doc.fillColor('#F7F3EA').font('Helvetica-Bold').fontSize(18)
  doc.text(sub.name, m + 72, 28, { width: pageW - m * 2 - 72 })
  doc.font('Helvetica').fontSize(10)
  doc.text('Identidad · Posicionamiento · Economía', m + 72, 54)

  let y = 120
  const h2 = (t) => {
    doc.fillColor(sub.color).font('Helvetica-Bold').fontSize(13)
    doc.text(t, m, y)
    y = doc.y + 6
    doc.moveTo(m, y).lineTo(pageW - m, y).lineWidth(1.2).strokeColor(sub.accent).stroke()
    y += 12
  }
  const row = (k, v) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(sub.color)
    doc.text(k, m, y, { width: 130 })
    doc.font('Helvetica').fillColor('#1c2430')
    doc.text(String(v), m + 135, y, { width: pageW - m * 2 - 135 })
    y = Math.max(doc.y, y) + 9
  }
  const swatch = (x, label, hex) => {
    doc.roundedRect(x, y, 70, 42, 8).fill(hex)
    doc.fillColor('#1c2430').font('Helvetica').fontSize(8)
    doc.text(`${label}\n${hex}`, x, y + 48, { width: 70, align: 'center' })
  }

  h2('Historia de marca')
  doc.font('Helvetica').fontSize(10).fillColor('#1c2430')
  doc.text(sub.lore, m, y, { width: pageW - m * 2, lineGap: 2 })
  y = doc.y + 16

  h2('Identidad visual')
  row('Monograma', sub.letter)
  row('Estilo visual', sub.imageStyle)
  row('ID interno', sub.id)
  y += 4
  swatch(m, 'Primario', sub.color)
  swatch(m + 90, 'Acento', sub.accent)
  y += 78

  h2('Posicionamiento')
  row('Especialidad', sub.specialty)
  row('Tagline', sub.tagline)
  row('Público', sub.targets.join(' · '))
  row('Estrellas', `${sub.minStars} – ${sub.maxStars}`)
  row('Afinidad playa', `${Math.round(sub.beachAffinity * 100)} / 100`)
  row('Coste de marca', `×${sub.costMultiplier}`)
  row('Bonus demanda', `+${Math.round(sub.demandBonus * 100)}%`)

  // Logo grande
  doc.image(png, pageW - m - 110, pageH - 180, { width: 100, height: 100 })
  footer(doc, sub, '02 · Identidad')

  // —— Página cómo construir ——
  doc.addPage()
  doc.rect(0, 0, pageW, 96).fill(sub.color)
  doc.rect(0, 96, pageW, 6).fill(sub.accent)
  doc.image(png, m, 18, { width: 60, height: 60 })
  doc.fillColor('#F7F3EA').font('Helvetica-Bold').fontSize(18)
  doc.text('Cómo construir esta marca', m + 72, 32, { width: pageW - m * 2 - 72 })
  doc.font('Helvetica').fontSize(10)
  doc.text('Solares · Servicios · Errores · Tips', m + 72, 56)

  y = 120
  const bullets = (title, items, color = '#1c2430') => {
    h2(title)
    for (const item of items) {
      doc.circle(m + 4, y + 4, 2.2).fill(sub.accent)
      doc.fillColor(color).font('Helvetica').fontSize(10)
      doc.text(item, m + 14, y, { width: pageW - m * 2 - 14 })
      y = doc.y + 6
    }
    y += 8
  }

  bullets('Solares ideales', guide.ideal)
  bullets('Servicios típicos recomendados', guide.services)
  bullets('Errores a evitar', guide.avoid, '#8a3030')
  bullets('Tips de construcción', guide.tips)

  // Caja resumen
  y = Math.min(y + 8, pageH - 160)
  doc.roundedRect(m, y, pageW - m * 2, 70, 12).fillOpacity(0.08).fill(sub.color).fillOpacity(1)
  doc.roundedRect(m, y, pageW - m * 2, 70, 12).strokeColor(sub.accent).lineWidth(1.2).stroke()
  doc.fillColor(sub.color).font('Helvetica-Bold').fontSize(11)
  doc.text('Resumen rápido', m + 14, y + 14)
  doc.font('Helvetica').fontSize(9).fillColor('#1c2430')
  doc.text(
    `${sub.name} · ${sub.minStars}–${sub.maxStars}★ · Coste ×${sub.costMultiplier} · Demanda +${Math.round(sub.demandBonus * 100)}% · Playa ${Math.round(sub.beachAffinity * 100)}/100`,
    m + 14,
    y + 34,
    { width: pageW - m * 2 - 28 },
  )

  footer(doc, sub, '03 · Construcción')

  doc.end()
  return new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

fs.mkdirSync(OUT, { recursive: true })
const brands = parseSubsidiaries()
if (!brands.length) {
  console.error('No se pudieron leer las marcas')
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
console.log(`\n${index.length} dossiers en public/marcas/`)
