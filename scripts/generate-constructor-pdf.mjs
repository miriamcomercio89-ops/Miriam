#!/usr/bin/env node
/**
 * Guía del constructor Orbis v1.0 — todas las opciones del catálogo.
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

const STEPS = [
  {
    id: 'Marca',
    body: 'Elige la filial Orbis. Cada marca tiene estrellas mín/máx, afinidad de playa, coste y demanda propios. La afinidad marca–solar aparece en el constructor.',
  },
  {
    id: 'Básico',
    body: 'Nombre, estrellas, habitaciones, plantas, clientela objetivo, mix de habitaciones y calidad de acabados. Define el perfil del hotel.',
  },
  {
    id: 'Edificio',
    body: 'Personal, plan verde, seguridad, tecnología, salas de reunión, parking, nivel de restaurante y % de vistas al mar.',
  },
  {
    id: 'Servicios',
    body: 'Activa servicios del catálogo (WiFi, spa, playa, eventos…). Cada uno suma coste de obra, demanda y coste diario.',
  },
  {
    id: 'Extras',
    body: 'Enfoque de diseño; buffets, bares y restaurantes (puedes marcar varios a la vez); regímenes de pensión y extras (late checkout, shuttle…).',
  },
  {
    id: 'Foto',
    body: 'Galería generada por marca/clima o foto propia. Se usa en ficha y PDF del hotel.',
  },
  {
    id: 'Crear',
    body: 'Revisa el desglose de obra. Puedes pagar al contado o financiar parte. Tras abrir, la IA fija precio y contratos (salvo precio manual).',
  },
]

const SERVICE_GROUPS = {
  Básico: ['WiFi rápido', 'Aparcamiento', 'Lavandería'],
  Comida: ['Restaurante', 'Bar en la azotea', 'Todo incluido'],
  Ocio: ['Piscina', 'Spa', 'Sauna', 'Gimnasio', 'Zona de yoga', 'Sala de cine', 'Pista de pádel'],
  Familia: ['Club infantil', 'Admite mascotas', 'Guardería nocturna'],
  Playa: ['Playa privada', 'Centro de buceo'],
  Lujo: ['Campo de golf', 'Casino', 'Helipuerto'],
  Eventos: ['Salón de bodas', 'Sala de espectáculos'],
  Negocios: ['Zona de trabajo'],
  Servicio: ['Comida a la habitación 24h', 'Conserjería', 'Traslado al aeropuerto'],
  Extra: ['Tienda del hotel', 'Biblioteca / sala tranquila', 'Puesto médico', 'Jardines grandes', 'Mirador'],
  Verde: ['Carga de coches eléctricos'],
}

const STAFF = [
  'Poco personal',
  'Personal normal',
  'Mucho personal',
  'Servicio de lujo',
]

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

const QUALITY = [
  'Acabados simples',
  'Acabados buenos',
  'Acabados altos',
  'Acabados de lujo',
]

const GREEN = [
  'Sin plan verde',
  'Plan verde básico',
  'Plan verde fuerte',
  'Hotel eco elite',
]

const DESIGN_FOCUS = [
  'Buenas vistas',
  'Mucho silencio',
  'Ambiente de fiesta',
  'Pensado para trabajar',
  'Pensado para familias',
]

const BUFFET = [
  'Sin buffet',
  'Buffet continental',
  'Buffet americano',
  'Buffet temático',
  'Buffet gourmet',
]

const BAR = [
  'Sin bar',
  'Bar de lobby',
  'Bar en azotea',
  'Coctelería',
  'Beach bar',
  'Varios bares',
]

const RESTAURANT = [
  'Sin restaurante propio',
  'Restaurante buffet',
  'A la carta',
  'Gourmet / firma',
  'Temático',
  'Mixto (varios conceptos)',
]

const SECURITY = ['Seguridad baja', 'Seguridad media', 'Seguridad alta']

const TECH = ['Tecnología simple', 'Tecnología moderna', 'Tecnología punta']

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

const EXTRAS = [
  'Late checkout — salida tarde',
  'Mostrador en aeropuerto',
  'Horas de silencio',
  'Alquiler de bicicletas',
  'Shuttle a la ciudad',
  'Precio manual (la IA no cambia el precio)',
  'Hotel cerrado temporalmente',
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
      Subject: 'Constructor v1.0',
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
    doc.text('Orbis Hotels Group · Guía del constructor v1.0', m, pageH - 17)
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
    doc.moveTo(m, doc.y + 4).lineTo(pageW - m, doc.y + 4).lineWidth(1.5).strokeColor(GOLD).stroke()
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
    doc.moveDown(0.55)
  }

  const bullets = (items) => {
    doc.fillColor(INK).font('Helvetica').fontSize(9.5)
    for (const item of items) {
      ensureSpace(24)
      doc.text(`•  ${item}`, m + 6, doc.y, { width: pageW - m * 2 - 6 })
      doc.moveDown(0.25)
    }
    doc.moveDown(0.35)
  }

  // Portada
  doc.rect(0, 0, pageW, pageH).fill(SEA)
  doc.rect(0, pageH * 0.58, pageW, pageH * 0.42).fill(GOLD)
  doc.fillColor(CREAM).font('Helvetica-Bold').fontSize(11)
  doc.text('ORBIS HOTELS GROUP', m, 120, { align: 'center', width: pageW - m * 2 })
  doc.fontSize(26)
  doc.text('Guía del constructor', m, 160, { align: 'center', width: pageW - m * 2 })
  doc.font('Helvetica').fontSize(12)
  doc.text('Todas las opciones · v1.0', m, 210, { align: 'center', width: pageW - m * 2 })
  doc.fillColor(SEA).font('Helvetica').fontSize(10)
  doc.text(
    'Pasos Marca → Básico → Edificio → Servicios → Extras → Foto → Crear.\nConsulta esta guía mientras diseñas tu red hotelera.',
    m + 20,
    pageH * 0.68,
    { align: 'center', width: pageW - m * 2 - 40, lineGap: 4 },
  )

  // Pasos
  doc.addPage()
  doc.y = m
  h1('Pasos del constructor')
  para('El panel de construcción guía el hotel en siete pasos. Cada paso afecta coste de obra, demanda y costes diarios.')
  for (const step of STEPS) {
    h2(step.id)
    para(step.body)
  }
  footer('Pasos')

  // Servicios
  doc.addPage()
  doc.y = m
  h1('Catálogo de servicios')
  para('Agrupados por categoría. Activa los que encajen con la marca y el solar.')
  for (const [group, items] of Object.entries(SERVICE_GROUPS)) {
    h2(group)
    bullets(items)
  }
  footer('Servicios')

  // Personal / clientela / edificio
  doc.addPage()
  doc.y = m
  h1('Personal, clientela y edificio')
  h2('Niveles de personal (STAFF)')
  bullets(STAFF)
  h2('Clientela objetivo (TARGETS)')
  bullets(TARGETS)
  h2('Mix de habitaciones (ROOM_MIX)')
  bullets(ROOM_MIX)
  h2('Calidad de acabados (QUALITY)')
  bullets(QUALITY)
  h2('Plan verde (GREEN)')
  bullets(GREEN)
  h2('Seguridad (SECURITY)')
  bullets(SECURITY)
  h2('Tecnología (TECH)')
  bullets(TECH)
  footer('Edificio')

  // Extras gastronómicos y diseño
  doc.addPage()
  doc.y = m
  h1('Diseño, comida y pensión')
  h2('Enfoque de diseño (DESIGN_FOCUS)')
  bullets(DESIGN_FOCUS)
  h2('Buffets (marca varios)')
  bullets(BUFFET)
  para('En el constructor puedes activar varios buffets a la vez; cada uno suma coste, demanda y gasto diario.')
  h2('Bares (marca varios)')
  bullets(BAR)
  para('Combina lobby, azotea, coctelería, beach bar u otros según el hotel.')
  h2('Restaurantes (varios conceptos)')
  bullets(RESTAURANT)
  para('Activa uno o varios conceptos (buffet, a la carta, gourmet…). El nivel de restaurante del edificio es independiente.')
  h2('Regímenes de pensión (BOARD_REGIMES)')
  bullets(BOARD)
  para('Puedes ofrecer varios regímenes a la vez; el principal define el precio base y el coste diario de F&B.')
  footer('Extras')

  // Booleanos + finanzas
  doc.addPage()
  doc.y = m
  h1('Extras operativos y finanzas')
  h2('Extras booleanos')
  bullets(EXTRAS)
  h2('Nota financiera')
  para(
    'El desglose de obra suma solar, edificio, servicios, cada buffet/bar/restaurante marcado y multiplicadores de calidad, personal, verde, seguridad y tech. Si no hay caja suficiente, el constructor permite financiar una parte (préstamo del grupo). Tras abrir, los ingresos diarios dependen de ocupación, precio (IA o manual), régimen, impuestos del país y tasa turística.',
  )
  para(
    'Consejos: alinea marca y clientela; no sobrecargues servicios de lujo en marcas low-cost; usa el plan del grupo y la guía de marcas (PDF) para priorizar destinos.',
  )
  h2('Atajos útiles')
  bullets([
    'H — lista de hoteles',
    'P — plan de expansión',
    'B — banco',
    'M — menú de pausa',
    'Espacio — pausar / reanudar',
    'Esc — cerrar paneles o menú',
  ])
  footer('Finanzas')

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
