import { jsPDF } from 'jspdf'
import type { BuildDraft, Hotel, LocationInsight, Subsidiary } from '../types'
import {
  BOARD_REGIMES,
  BUFFET_OPTIONS,
  BAR_OPTIONS,
  DESIGN_FOCUS,
  GREEN_OPTIONS,
  QUALITY_OPTIONS,
  RESTAURANT_CONCEPTS,
  ROOM_MIX_OPTIONS,
  SECURITY_OPTIONS,
  SERVICE_CATALOG,
  STAFF_OPTIONS,
  TARGET_OPTIONS,
  TECH_OPTIONS,
} from '../data/catalog'
import { formatEUR } from './format'
import { getCountryRules } from './countryRules'
import { calcConstructionBreakdown } from './economy'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function labelOf<T extends { id: string; label: string }>(list: T[], id: string) {
  return list.find((x) => x.id === id)?.label ?? id
}

function serviceLabels(ids: string[]) {
  return ids
    .map((id) => SERVICE_CATALOG.find((s) => s.id === id)?.label ?? id)
    .join(', ')
}

async function embedImage(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
  if (!dataUrl) return false
  const fmt = dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
  try {
    doc.addImage(dataUrl, fmt, x, y, w, h)
    return true
  } catch {
    try {
      doc.addImage(dataUrl, fmt === 'PNG' ? 'JPEG' : 'PNG', x, y, w, h)
      return true
    } catch {
      return false
    }
  }
}

/** Convierte SVG data-URL a PNG data-URL via canvas (para jsPDF). */
export async function svgDataUrlToPng(svgDataUrl: string, size = 256): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(svgDataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, size, size)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(svgDataUrl)
    img.src = svgDataUrl
  })
}

export async function anyImageToPng(dataUrl: string, maxW = 1200): Promise<string | null> {
  if (!dataUrl) return null
  if (dataUrl.includes('image/svg')) return svgDataUrlToPng(dataUrl, maxW > 800 ? 800 : maxW)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

/** Recorta al ratio A4 (cover) para portada a sangre. */
export async function anyImageToCoverA4(dataUrl: string, longSide = 1800): Promise<string | null> {
  if (!dataUrl) return null
  const prepared = dataUrl.includes('image/svg')
    ? await svgDataUrlToPng(dataUrl, longSide)
    : dataUrl
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const targetRatio = 210 / 297
      let sw = img.width
      let sh = img.height
      let sx = 0
      let sy = 0
      const srcRatio = sw / sh
      if (srcRatio > targetRatio) {
        sw = Math.round(sh * targetRatio)
        sx = Math.round((img.width - sw) / 2)
      } else {
        sh = Math.round(sw / targetRatio)
        sy = Math.round((img.height - sh) / 2)
      }
      const outH = longSide
      const outW = Math.round(outH * targetRatio)
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => resolve(null)
    img.src = prepared
  })
}

function drawFooter(doc: jsPDF, sub: Subsidiary, label: string) {
  const [cr, cg, cb] = hexToRgb(sub.color)
  const [ar, ag, ab] = hexToRgb(sub.accent)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(cr, cg, cb)
  doc.rect(0, pageH - 14, pageW, 14, 'F')
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, pageH - 16, pageW, 2, 'F')
  doc.setTextColor(247, 243, 234)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Orbis Hotels Group · Ficha de hotel', 14, pageH - 5)
  doc.text(label, pageW - 14, pageH - 5, { align: 'right' })
}

export async function downloadHotelPdf(args: {
  hotel: Hotel
  sub: Subsidiary
  loc?: LocationInsight
  draft?: BuildDraft
  logoPng: string
  cost?: number
  financed?: number
  photoDataUrl?: string
}) {
  const { hotel, sub, loc, draft, logoPng, cost, financed, photoDataUrl } = args
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const [cr, cg, cb] = hexToRgb(sub.color)
  const [ar, ag, ab] = hexToRgb(sub.accent)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const rules = getCountryRules(hotel.countryCode)

  // Página 1: foto a sangre completa
  const photoSrc = photoDataUrl || hotel.imageDataUrl
  let photoPng: string | null = null
  if (photoSrc) photoPng = await anyImageToCoverA4(photoSrc, 1800)

  if (photoPng) {
    doc.setFillColor(12, 18, 28)
    doc.rect(0, 0, pageW, pageH, 'F')
    await embedImage(doc, photoPng, 0, 0, pageW, pageH)
    doc.setFillColor(cr, cg, cb)
    doc.rect(0, pageH - 42, pageW, 42, 'F')
    doc.setFillColor(ar, ag, ab)
    doc.rect(0, pageH - 44, pageW, 2.5, 'F')
    await embedImage(doc, logoPng, margin, pageH - 36, 22, 22)
    doc.setTextColor(247, 243, 234)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(hotel.name, margin + 28, pageH - 26, { maxWidth: pageW - margin * 2 - 28 })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(
      `${sub.name}  ·  ${'★'.repeat(hotel.stars)}  ·  ${hotel.city}, ${hotel.country}`,
      margin + 28,
      pageH - 16,
      { maxWidth: pageW - margin * 2 - 28 },
    )
    doc.addPage()
  } else {
    // Sin foto: cabecera clásica en página 1
    doc.setFillColor(cr, cg, cb)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setFillColor(ar, ag, ab)
    doc.rect(0, 48, pageW, 4, 'F')
    await embedImage(doc, logoPng, margin, 8, 32, 32)
    doc.setTextColor(247, 243, 234)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(hotel.name, margin + 38, 18, { maxWidth: pageW - margin * 2 - 38 })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(sub.name, margin + 38, 26)
    doc.setFontSize(8)
    doc.text(
      `${'★'.repeat(hotel.stars)}  ·  ${hotel.rooms} hab.  ·  ${hotel.city}, ${hotel.country}`,
      margin + 38,
      33,
    )
    doc.setFontSize(7)
    doc.text('FICHA DE HOTEL', margin + 38, 40)
  }

  // Página de ficha (o continuación sin foto)
  let y = photoPng ? 18 : 60

  if (photoPng) {
    doc.setFillColor(cr, cg, cb)
    doc.rect(0, 0, pageW, 28, 'F')
    doc.setFillColor(ar, ag, ab)
    doc.rect(0, 28, pageW, 2.5, 'F')
    await embedImage(doc, logoPng, margin, 5, 18, 18)
    doc.setTextColor(247, 243, 234)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(hotel.name, margin + 24, 13, { maxWidth: pageW - margin * 2 - 24 })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`${sub.name} · Ficha de hotel`, margin + 24, 20)
    y = 40
  }

  const section = (title: string) => {
    if (y > pageH - 40) {
      drawFooter(doc, sub, '…')
      doc.addPage()
      y = 18
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(cr, cg, cb)
    doc.text(title, margin, y)
    y += 3
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 6
  }

  const line = (label: string, value: string) => {
    if (y > pageH - 28) {
      drawFooter(doc, sub, '…')
      doc.addPage()
      y = 18
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(cr, cg, cb)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(28, 36, 48)
    const lines = doc.splitTextToSize(value, pageW - margin * 2 - 42)
    doc.text(lines, margin + 42, y)
    y += Math.max(5.5, lines.length * 4.2 + 1.5)
  }

  const labelsOf = (catalog: { id: string; label: string }[], ids: string[] | undefined) => {
    if (!ids?.length) return 'Ninguno'
    return ids.map((id) => labelOf(catalog, id)).join(', ')
  }

  // Bloque ubicación / mapa conceptual
  section('Ubicación')
  doc.setFillColor(247, 249, 250)
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, 'F')
  doc.setDrawColor(ar, ag, ab)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(cr, cg, cb)
  doc.text(`${hotel.city}${hotel.region ? `, ${hotel.region}` : ''}`, margin + 4, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 50, 60)
  doc.setFontSize(8)
  doc.text(`${hotel.country} (${hotel.countryCode})`, margin + 4, y + 14)
  doc.text(`Coords  ${hotel.lat.toFixed(5)}, ${hotel.lng.toFixed(5)}`, margin + 4, y + 20)
  doc.text(
    `Turismo ${hotel.tourismIndex}/100 · Playa ${hotel.beachScore}/100 · Coste sitio ×${hotel.costIndex}`,
    margin + 88,
    y + 14,
    { maxWidth: pageW - margin * 2 - 100 },
  )
  doc.setFillColor(cr, cg, cb)
  doc.circle(pageW - margin - 12, y + 14, 6, 'F')
  doc.setFillColor(ar, ag, ab)
  doc.circle(pageW - margin - 12, y + 14, 2.2, 'F')
  y += 34

  section('País · fiscalidad y reglas')
  line('Impuesto hotelero', `${Math.round((hotel.taxRate || rules.taxRate) * 100)}%`)
  line('Tasa turística', `${rules.touristTaxPerNight} € / habitación ocupada · noche`)
  line('Reglas locales', rules.rules.join(' · '))

  section('Operación')
  line('Marca', sub.name)
  line('Estrellas', String(hotel.stars))
  line('Habitaciones', String(hotel.rooms))
  line('Plantas', String(hotel.floors))
  line('Calidad', labelOf(QUALITY_OPTIONS, hotel.buildQuality))
  line('Mix hab.', labelOf(ROOM_MIX_OPTIONS, hotel.roomMix))
  line('Personal', labelOf(STAFF_OPTIONS, hotel.staffLevel))
  line('Clientela', labelOf(TARGET_OPTIONS, hotel.target))
  line('Régimen', labelOf(BOARD_REGIMES, hotel.boardRegime))
  line(
    'Rég. disponibles',
    (hotel.availableRegimes?.length ? hotel.availableRegimes : [hotel.boardRegime])
      .map((id) => labelOf(BOARD_REGIMES, id))
      .join(', '),
  )
  line('Enfoque diseño', labelOf(DESIGN_FOCUS, hotel.designFocus))
  line('Buffets', labelsOf(BUFFET_OPTIONS, hotel.buffetTypes))
  line('Bares', labelsOf(BAR_OPTIONS, hotel.barTypes))
  line('Restaurantes', labelsOf(RESTAURANT_CONCEPTS, hotel.restaurantConcepts))
  line('Verde', labelOf(GREEN_OPTIONS, hotel.greenLevel))
  line('Seguridad', labelOf(SECURITY_OPTIONS, hotel.securityLevel))
  line('Tecnología', labelOf(TECH_OPTIONS, hotel.techLevel))
  line('Reuniones', String(hotel.meetingRooms))
  line('Parking', String(hotel.parkingSpots))
  line('Restaurante Nv.', String(hotel.restaurantLevel))
  line('Vistas mar', `${hotel.seaViewShare}%`)
  line('Late checkout', hotel.lateCheckout ? 'Sí' : 'No')
  line('Mostrador aeropuerto', hotel.airportDesk ? 'Sí' : 'No')
  line('Horas de silencio', hotel.quietHours ? 'Sí' : 'No')
  line('Alquiler bicis', hotel.bikeRental ? 'Sí' : 'No')
  line('Shuttle ciudad', hotel.shuttleCity ? 'Sí' : 'No')
  line('Precio manual', hotel.priceManual ? 'Sí (IA no toca)' : 'No (IA)')
  line('Cerrado', hotel.closed ? 'Sí' : 'No')
  line('Servicios', serviceLabels(hotel.services) || '—')
  line('Precio noche', formatEUR(hotel.pricePerNight))
  line('Apertura', `Día ${hotel.builtAtGameDay}`)

  section('Inversión')
  const totalCost = cost ?? hotel.constructionCost
  line('Coste de obra', formatEUR(totalCost))
  if (financed && financed > 0) line('Financiado', formatEUR(financed))
  if (draft && loc) {
    const br = calcConstructionBreakdown(draft, loc)
    for (const l of br.lines.slice(0, 8)) {
      line(l.label, formatEUR(l.amount))
    }
  }

  drawFooter(doc, sub, sub.letter)
  const safe = hotel.name.replace(/[^\w-]+/g, '_').slice(0, 48)
  doc.save(`Orbis_${safe}.pdf`)
}
