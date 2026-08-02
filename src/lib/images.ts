import { getSubsidiary, hotelPlaceholderImage } from '../data/subsidiaries'
import type { Hotel } from '../types'

export function resolveHotelImage(
  hotel: Pick<Hotel, 'imageDataUrl' | 'imageKey' | 'subsidiaryId' | 'name' | 'geoRegion'>,
): string {
  if (hotel.imageDataUrl && !hotel.imageDataUrl.includes('image/svg+xml')) return hotel.imageDataUrl
  const sub = getSubsidiary(hotel.subsidiaryId)
  if (!sub) return ''
  // Sin foto subida: placeholder de marca (no galería procedural)
  return hotelPlaceholderImage(sub, hotel.name)
}

export function defaultImageKey(subsidiaryId: string): string {
  const sub = getSubsidiary(subsidiaryId)
  return `${sub?.imageStyle ?? 'coast'}:upload`
}
