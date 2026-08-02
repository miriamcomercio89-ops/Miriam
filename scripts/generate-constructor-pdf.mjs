#!/usr/bin/env node
/**
 * Guía del constructor Orbis — todo lo seleccionable, paso a paso.
 * Uso: npm run constructor:pdf
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public/constructor-guia.pdf')

const SEA = '#0E6D7F'
const GOLD = '#C4A35A'
const INK = '#1c2430'
const CREAM = '#F7F3EA'

function parseSubsidiaries() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/subsidiaries.ts'), 'utf8')
  const list = []
  const re =
    /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*specialty:\s*'([^']+)'[\s\S]*?minStars:\s*(\d+),\s*maxStars:\s*(\d+)/g
  let m
  while ((m = re.exec(src))) {
    list.push({
      id: m[1],
      name: m[2],
      specialty: m[3],
      minStars: Number(m[4]),
      maxStars: Number(m[5]),
    })
  }
  return list
}

function parseServiceCatalog() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/catalog.ts'), 'utf8')
  const groups = new Map()
  const re = /label:\s*'([^']+)',\s*group:\s*'([^']+)'/g
  let m
  while ((m = re.exec(src))) {
    const label = m[1]
    const group = m[2]
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group).push(label)
  }
  return groups
}

const BRANDS = parseSubsidiaries()
const SERVICE_GROUPS = parseServiceCatalog()

const STAFF = ['Poco personal', 'Personal normal', 'Mucho personal', 'Servicio de lujo']
const TARGETS = [
  'Clientes de lujo',
  'Viajes de trabajo',
  'Familias',
  'Parejas',
  'Aventura',
  'Descanso y spa',
  'Vacaciones de playa',
]
const ROOM_MIX = [
  'Habitaciones normales',
  'Mezcla (normal + suites)',
  'Casi todo suites',
  'Pensado para familias',
]
const BOARD = [
  'Solo alojamiento',
  'Alojamiento y desayuno',
  'Media pensión',
  'Pensión completa',
  'Todo incluido',
  'Todo incluido premium',
  'Todo incluido gold',
  'Todo incluido imperial',
]
const QUALITY = ['Acabados simples', 'Acabados buenos', 'Acabados altos', 'Acabados de lujo']
const GREEN = ['Sin plan verde', 'Plan verde básico', 'Plan verde fuerte', 'Hotel eco elite']
const SECURITY = ['Seguridad baja', 'Seguridad media', 'Seguridad alta']
const TECH = ['Tecnología simple', 'Tecnología moderna', 'Tecnología punta']
const DESIGN_FOCUS = [
  'Buenas vistas',
  'Mucho silencio',
  'Ambiente de fiesta',
  'Pensado para trabajar',
  'Pensado para familias',
]
const BUFFET = ['Buffet continental', 'Buffet americano', 'Buffet temático', 'Buffet gourmet']
const BAR = ['Bar de lobby', 'Bar en azotea', 'Coctelería', 'Beach bar', 'Varios bares (pack)']
const RESTAURANT = [
  'Restaurante buffet',
  'A la carta',
  'Gourmet / firma',
  'Temático',
  'Mixto (varios conceptos)',
]
const EXTRAS_BOOL = [
  'Desayuno incluido',
  'Salida tarde flexible',
  'Mostrador en aeropuerto',
  'Programa de fidelidad',
  'Horas de silencio',
  'Alquiler de bicis',
  'Bus al centro',
]

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function writePdf() {
  ensureDir(OUT)
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: 'Orbis Hotels Group · Guía del constructor',
      Author: 'Orbis Hotels Group',
      Subject: 'Constructor paso a paso',
    },
  })
  const stream = fs.createWriteStream(OUT)
  doc.pipe(stream)

  const pageW = doc.page.width
  const pageH = doc.page.height
  const m = 48

  const footer = (label) => {
    doc.save()
    doc.rect(0, pageH - 28, pageW, 28).fill(SEA)
    doc.fillColor(CREAM).font('Helvetica').fontSize(8)
    doc.text('Orbis Hotels Group · Guía del constructor', m, pageH - 17)
    doc.text(label, pageW - m, pageH - 17, { align: 'right' })
    doc.restore()
  }

  const ensureSpace = (need = 80) => {
    if (doc.y > pageH - need) {
      footer('…')
      doc.addPage()
      doc.y = m
    }
  }

  const h1 = (t) => {
    ensureSpace(60)
    doc.fillColor(SEA).font('Helvetica-Bold').fontSize(16)
    doc.text(t, m, doc.y)
    doc
      .moveTo(m, doc.y + 4)
      .lineTo(pageW - m, doc.y + 4)
      .lineWidth(1.5)
      .strokeColor(GOLD)
      .stroke()
    doc.moveDown(0.8)
  }

  const h2 = (t) => {
    ensureSpace(40)
    doc.fillColor(SEA).font('Helvetica-Bold').fontSize(12)
    doc.text(t, m, doc.y)
    doc.moveDown(0.35)
  }

  const para = (t) => {
    ensureSpace(36)
    doc.fillColor(INK).font('Helvetica').fontSize(9.5)
    doc.text(t, m, doc.y, { width: pageW - m * 2, lineGap: 2 })
    doc.moveDown(0.5)
  }

  const bullets = (items) => {
    doc.fillColor(INK).font('Helvetica').fontSize(9.5)
    for (const item of items) {
      ensureSpace(22)
      doc.text(`•  ${item}`, m + 6, doc.y, { width: pageW - m * 2 - 6 })
      doc.moveDown(0.22)
    }
    doc.moveDown(0.3)
  }

  const field = (tipo, nombre, detalle) => {
    ensureSpace(28)
    doc.fillColor(SEA).font('Helvetica-Bold').fontSize(9)
    doc.text(`${tipo} · ${nombre}`, m + 6, doc.y, { width: pageW - m * 2 - 6 })
    doc.fillColor(INK).font('Helvetica').fontSize(9)
    doc.text(detalle, m + 14, doc.y, { width: pageW - m * 2 - 14, lineGap: 1.5 })
    doc.moveDown(0.4)
  }

  // —— Portada ——
  doc.rect(0, 0, pageW, pageH).fill(SEA)
  doc.rect(0, pageH * 0.58, pageW, pageH * 0.42).fill(GOLD)
  doc.fillColor(CREAM).font('Helvetica-Bold').fontSize(11)
  doc.text('ORBIS HOTELS GROUP', m, 110, { align: 'center', width: pageW - m * 2 })
  doc.fontSize(24)
  doc.text('Guía del constructor', m, 150, { align: 'center', width: pageW - m * 2 })
  doc.font('Helvetica').fontSize(12)
  doc.text('Todo lo que puedes elegir o marcar, paso a paso', m, 200, {
    align: 'center',
    width: pageW - m * 2,
  })
  doc.fillColor(SEA).font('Helvetica').fontSize(10)
  doc.text(
    '1 Marca → 2 Básico → 3 Edificio → 4 Servicios → 5 Extras → 6 Foto → 7 Crear',
    m + 16,
    pageH * 0.7,
    { align: 'center', width: pageW - m * 2 - 32 },
  )

  // —— Índice ——
  doc.addPage()
  doc.y = m
  h1('Cómo usar esta guía')
  para(
    'El constructor abre al colocar un hotel en el mapa. Tiene 7 pasos. En cada uno puedes escribir valores, elegir en listas, mover deslizadores o marcar casillas. Esta guía lista exactamente lo que aparece en pantalla.',
  )
  bullets([
    'Paso 1 · Marca — eliges 1 de 50 filiales',
    'Paso 2 · Básico — nombre, estrellas, habitaciones, personal, clientes, mix, regímenes',
    'Paso 3 · Edificio — calidad, plantas, verde, seguridad, tech, salas, parking, restaurante, vistas, enfoque',
    'Paso 4 · Servicios — casillas del catálogo por grupos',
    'Paso 5 · Extras — promo, buffets, bares, restaurantes (varios) y casillas operativas',
    'Paso 6 · Foto — subir tu propia imagen (obligatorio)',
    'Paso 7 · Crear — revisar coste, financiar si hace falta, PDF del hotel, construir',
  ])
  footer('Índice')

  // —— PASO 1 ——
  doc.addPage()
  doc.y = m
  h1('Paso 1 · Marca')
  para(
    'Busca o elige una filial. Al pulsar una marca ves su ficha (especialidad, lore, estrellas, afinidad playa, coste, demanda). Puedes descargar el PDF de marca o pulsar «Usar esta marca».',
  )
  field('Texto', 'Buscar', 'Filtra las 50 filiales por nombre, especialidad, eslogan o lore.')
  field('Acción', 'Tarjeta de marca', 'Abre la ficha de esa filial.')
  field('Acción', 'Usar esta marca', 'Confirma la marca y pasa al paso Básico.')
  field('Acción', 'PDF de marca', 'Descarga el dossier editorial de la filial.')
  h2(`Las ${BRANDS.length} filiales (elige una)`)
  bullets(
    BRANDS.map(
      (b) => `${b.name} — ${b.specialty} (${b.minStars}–${b.maxStars}★)`,
    ),
  )
  footer('Paso 1')

  // —— PASO 2 ——
  doc.addPage()
  doc.y = m
  h1('Paso 2 · Básico')
  para('Define el perfil comercial del hotel y los regímenes de pensión.')
  field('Texto', 'Nombre del hotel', 'Hasta 80 caracteres.')
  field(
    'Deslizador',
    'Estrellas',
    'Rango limitado por la marca elegida (mín–máx de esa filial).',
  )
  field('Número', 'Habitaciones', 'De 20 a 2000.')
  h2('Lista · Personal (elige 1)')
  bullets(STAFF)
  h2('Lista · Tipo de clientes (elige 1)')
  bullets(TARGETS)
  h2('Lista · Tipo de habitaciones (elige 1)')
  bullets(ROOM_MIX)
  h2('Lista · Régimen principal (elige 1 entre los marcados abajo)')
  bullets(BOARD)
  h2('Casillas · Regímenes disponibles (marca varios)')
  para(
    'Marca todos los regímenes que ofrecerá el hotel. Debe quedar al menos uno. El régimen principal tiene que estar entre los marcados.',
  )
  bullets(BOARD)
  para('En pantalla verás el precio IA estimado por noche según estos datos.')
  footer('Paso 2')

  // —— PASO 3 ——
  doc.addPage()
  doc.y = m
  h1('Paso 3 · Edificio')
  para('Configura el edificio físico, seguridad, tech y el enfoque del hotel.')
  h2('Lista · Calidad del edificio (elige 1)')
  bullets(QUALITY)
  field('Deslizador', 'Plantas', 'De 1 a 40.')
  h2('Lista · Plan verde (elige 1)')
  bullets(GREEN)
  h2('Lista · Seguridad (elige 1)')
  bullets(SECURITY)
  h2('Lista · Tecnología (elige 1)')
  bullets(TECH)
  field('Número', 'Salas de reuniones', 'De 0 a 40.')
  field('Número', 'Plazas de parking', 'De 0 a 2000.')
  field('Deslizador', 'Nivel del restaurante', 'De 0 a 5 (calidad/capacidad del local, aparte del concepto gastronómico).')
  field('Deslizador', 'Habitaciones con vistas al mar', 'De 0% a 100%.')
  h2('Lista · Enfoque del hotel (elige 1)')
  bullets(DESIGN_FOCUS)
  footer('Paso 3')

  // —— PASO 4 ——
  doc.addPage()
  doc.y = m
  h1('Paso 4 · Servicios')
  para(
    'Marca con casillas todos los servicios que quieras. Puedes combinar varios de cada grupo. Cada uno suma coste de obra, demanda y gasto diario.',
  )
  for (const [group, items] of SERVICE_GROUPS.entries()) {
    h2(`Casillas · ${group}`)
    bullets(items)
  }
  footer('Paso 4')

  // —— PASO 5 ——
  doc.addPage()
  doc.y = m
  h1('Paso 5 · Extras')
  para('Oferta de apertura, gastronomía (varios a la vez) y extras operativos.')
  field('Deslizador', 'Días de oferta de apertura', 'De 0 a 30. Sube un poco la ocupación al abrir.')
  h2('Casillas · Buffets (marca todos los que quieras)')
  para('Si no marcas ninguno, el hotel no tiene buffet propio.')
  bullets(BUFFET)
  h2('Casillas · Bares (marca todos los que quieras)')
  para('Si no marcas ninguno, el hotel no tiene bar propio.')
  bullets(BAR)
  h2('Casillas · Conceptos de restaurante (marca todos los que quieras)')
  para('Independiente del «nivel de restaurante» del paso Edificio.')
  bullets(RESTAURANT)
  h2('Casillas · Extras operativos (marca los que quieras)')
  bullets(EXTRAS_BOOL)
  footer('Paso 5')

  // —— PASO 6 ——
  doc.addPage()
  doc.y = m
  h1('Paso 6 · Foto')
  para(
    'Obligatorio. No hay galería por defecto: tienes que subir tu propia imagen del hotel. Se comprime y se guarda con la partida (IndexedDB y archivo .orbis.gz).',
  )
  field('Archivo', 'Subir foto / Cambiar foto', 'Acepta cualquier imagen (JPG, PNG, etc.).')
  field('Acción', 'Quitar foto', 'Borra la imagen subida (no podrás pasar a Revisar sin foto).')
  para('Sin foto no se puede pasar al paso Crear ni construir el hotel.')
  footer('Paso 6')

  // —— PASO 7 ——
  doc.addPage()
  doc.y = m
  h1('Paso 7 · Crear (revisar)')
  para('Resumen de marca, coste, dinero, crédito, precio IA y ganancia diaria estimada.')
  field('Acción', 'Ver / ocultar desglose de obra', 'Lista líneas de coste y multiplicadores.')
  field(
    'Casilla',
    'Financiar con el crédito del grupo',
    'Solo si te falta dinero y hay crédito libre. La parte financiada pasa a deuda.',
  )
  field('Casilla', 'Descargar PDF del hotel al crear', 'Portada con tu foto a página completa + ficha.')
  field('Acción', 'Crear hotel', 'Construye el hotel en el mapa si hay caja (o financiación válida).')
  h2('Qué afecta al coste (recordatorio)')
  bullets([
    'Habitaciones, plantas extra, salas, parking, nivel de restaurante, vistas al mar',
    'Servicios marcados',
    'Montaje de régimen + cada buffet / bar / restaurante marcado',
    'Extras (late checkout, aeropuerto, bicis, shuttle, promo…)',
    'Solar (índice del sitio y turismo)',
    'Multiplicadores: marca, personal, mix, calidad, verde, seguridad, tech, régimen, estrellas, sitio',
  ])
  h2('Tras abrir')
  bullets([
    'La IA gestiona precio (salvo que luego pongas precio manual), contratos y seguro',
    'Puedes cambiar régimen, cerrar, reformar o vender desde la ficha del hotel',
    'Las fotos viajan con Guardar / Continuar / ranuras / .orbis.gz',
  ])
  footer('Paso 7')

  // —— Atajos ——
  doc.addPage()
  doc.y = m
  h1('Atajos del juego')
  bullets([
    'H — lista de hoteles',
    'P — plan de expansión',
    'B — banco',
    'M — menú de pausa',
    'Espacio — pausar / reanudar',
    'Esc — cerrar paneles o menú de pausa',
    '1 / 2 / 5 — velocidad del tiempo',
  ])
  para('La guía PDF del constructor también está enlazada desde el propio panel (Guía PDF) y desde la pantalla de inicio.')
  footer('Atajos')

  doc.end()
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(OUT))
    stream.on('error', reject)
  })
}

writePdf()
  .then((p) => {
    console.log('Escrito', p)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
