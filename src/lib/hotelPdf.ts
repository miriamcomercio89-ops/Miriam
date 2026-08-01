import { jsPDF } from 'jspdf'
import type { BuildDraft, Hotel, LocationInsight, Subsidiary } from '../types'
import {
  BOARD_REGIMES,
  GREEN_OPTIONS,
  QUALITY_OPTIONS,
  ROOM_MIX_OPTIONS,
  SECURITY_OPTIONS,
  SERVICE_CATALOG,
  STAFF_OPTIONS,
  TARGET_OPTIONS,
  TECH_OPTIONS,
} from '../data/catalog'
import { formatEUR } from './format'
import { getCountryRules } from './countryRules'

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

async function embedLogo(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
  try {
    doc.addImage(dataUrl, 'PNG', x, y, w, h)
  } catch {
    try {
      doc.addImage(dataUrl, 'JPEG', x, y, w, h)
    } catch {
      /* SVG data-urls: draw placeholder block */
      const [r, g, b] = [30, 60, 80]
      doc.setFillColor(r, g, b)
      doc.roundedRect(x, y, w, h, 4, 4, 'F')
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

export async function downloadHotelPdf(args: {
  hotel: Hotel
  sub: Subsidiary
  loc?: LocationInsight
  draft?: BuildDraft
  logoPng: string
  cost?: number
  financed?: number
}) {
  const { hotel, sub, logoPng, cost, financed } = args
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const [cr, cg, cb] = hexToRgb(sub.color)
  const [ar, ag, ab] = hexToRgb(sub.accent)
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 16

  doc.setFillColor(cr, cg, cb)
  doc.rect(0, 0, pageW, 42, 'F')
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 42, pageW, 3, 'F')

  await embedLogo(doc, logoPng, margin, 8, 26, 26)

  doc.setTextColor(247, 243, 234)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(hotel.name, margin + 30, 18, { maxWidth: pageW - margin * 2 - 30 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(sub.name, margin + 30, 26)
  doc.setFontSize(9)
  doc.text(`${'★'.repeat(hotel.stars)}  ·  ${hotel.rooms} habitaciones  ·  ${hotel.city}, ${hotel.country}`, margin + 30, 33)

  let y = 56
  const line = (label: string, value: string) => {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(cr, cg, cb)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 40, 50)
    const lines = doc.splitTextToSize(value, pageW - margin * 2 - 45)
    doc.text(lines, margin + 45, y)
    y += Math.max(7, lines.length * 5 + 2)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(cr, cg, cb)
  doc.text('Ficha del hotel', margin, y)
  y += 8

  line('Marca', sub.name)
  line('Especialidad', sub.specialty)
  line('Ubicación', `${hotel.city}${hotel.region ? `, ${hotel.region}` : ''} · ${hotel.country} (${hotel.countryCode})`)
  line('Coordenadas', `${hotel.lat.toFixed(5)}, ${hotel.lng.toFixed(5)}`)
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
    hotel.availableRegimes.map((id) => labelOf(BOARD_REGIMES, id)).join(', '),
  )
  line('Verde', labelOf(GREEN_OPTIONS, hotel.greenLevel))
  line('Seguridad', labelOf(SECURITY_OPTIONS, hotel.securityLevel))
  line('Tecnología', labelOf(TECH_OPTIONS, hotel.techLevel))
  line('Reuniones', String(hotel.meetingRooms))
  line('Parking', String(hotel.parkingSpots))
  line('Restaurante Nv.', String(hotel.restaurantLevel))
  line('Vistas mar', `${hotel.seaViewShare}%`)
  line('Servicios', serviceLabels(hotel.services) || '—')
  line('Turismo sitio', `${hotel.tourismIndex}/100`)
  line('Playa sitio', `${hotel.beachScore}/100`)
  line('Coste sitio', `×${hotel.costIndex}`)
  line('Impuesto', `${Math.round(hotel.taxRate * 100)}%`)
  const rules = getCountryRules(hotel.countryCode)
  line('Tasa turística', `${rules.touristTaxPerNight} €/hab. noche`)
  line('Reglas país', rules.rules.join(' · '))
  if (cost != null) line('Coste de obra', formatEUR(cost))
  if (financed && financed > 0) line('Financiado', formatEUR(financed))
  line('Precio noche', formatEUR(hotel.pricePerNight))
  line('Día de apertura', `Día ${hotel.builtAtGameDay}`)
  line('Tagline marca', sub.tagline)
  line('Lore marca', sub.lore)

  y += 4
  doc.setDrawColor(ar, ag, ab)
  doc.setLineWidth(0.6)
  doc.line(margin, y, pageW - margin, y)
  y += 8
  doc.setFontSize(8)
  doc.setTextColor(100, 110, 120)
  doc.text('Orbis Hotels Group · Ficha generada al construir', margin, y)

  const safe = hotel.name.replace(/[^\w-]+/g, '_').slice(0, 48)
  doc.save(`Orbis_${safe}.pdf`)
}
