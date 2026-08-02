import { jsPDF } from 'jspdf'
import { getSubsidiary } from '../data/subsidiaries'
import { SERVICE_CATALOG } from '../data/catalog'
import type { TravelDiaryEntry } from '../types'
import { formatEUR, formatGameDay } from './format'

export function serviceLabelsForDiary(ids: string[]): string[] {
  return ids.map((id) => SERVICE_CATALOG.find((s) => s.id === id)?.label ?? id)
}

export async function downloadTravelDiaryPdf(entry: TravelDiaryEntry): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const brand = getSubsidiary(entry.subsidiaryId)
  const ink: [number, number, number] = [11, 31, 51]
  const gold: [number, number, number] = [201, 164, 92]

  doc.setFillColor(247, 243, 234)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setFillColor(...ink)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(247, 243, 234)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Diario de viaje · Orbis Hotels Group', 14, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(formatGameDay(entry.day), 14, 20)

  doc.setTextColor(...ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(entry.hotelName, 14, 44)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(
    `${entry.city} · ${entry.countryCode} · ${brand?.name ?? entry.subsidiaryId}`,
    14,
    52,
  )

  let y = 62
  const line = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...gold)
    doc.text(label, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...ink)
    doc.text(value, 55, y)
    y += 8
  }

  line('Noches', String(entry.nights))
  line('Habitación', entry.roomKind.replace(/_/g, ' '))
  line('Régimen', entry.boardRegime)
  line('Clima', `${entry.weatherLabel} — ${entry.weatherDetail}`)
  line('Propinas', formatEUR(entry.tipTotal))
  line('Notas', entry.pointsNote)

  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...gold)
  doc.text('Servicios usados', 14, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...ink)
  const services = entry.services.length ? entry.services.join(', ') : 'Ninguno registrado'
  const wrapped = doc.splitTextToSize(services, 180)
  doc.text(wrapped, 14, y)
  y += wrapped.length * 6 + 8

  if (entry.selfie) {
    try {
      const fmt = entry.selfie.includes('image/jpeg') ? 'JPEG' : 'PNG'
      doc.addImage(entry.selfie, fmt, 14, y, 32, 32)
      doc.setFontSize(9)
      doc.text('Sello pasaporte', 50, y + 16)
    } catch {
      /* ignore */
    }
  }

  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text('Club Huésped Orbis · recuerdo de estancia', 14, 290)

  doc.save(`diario-orbis-${entry.countryCode}-${entry.day}.pdf`)
}

export function downloadTravelDiaryPngFallback(entry: TravelDiaryEntry): void {
  // Si el PDF falla en algún entorno, al menos descargar JSON legible
  const blob = new Blob([JSON.stringify(entry, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `diario-orbis-${entry.day}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
