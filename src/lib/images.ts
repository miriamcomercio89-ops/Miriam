import { getSubsidiary, hotelPlaceholderImage } from '../data/subsidiaries'
import { galleryImages } from './gallery'
import type { Hotel } from '../types'

export function resolveHotelImage(hotel: Pick<Hotel, 'imageDataUrl' | 'imageKey' | 'subsidiaryId' | 'name'>): string {
  if (hotel.imageDataUrl) return hotel.imageDataUrl
  const sub = getSubsidiary(hotel.subsidiaryId)
  if (!sub) return ''
  const [style, mood] = (hotel.imageKey || `${sub.imageStyle}:day`).split(':')
  const gallery = galleryImages(sub, hotel.name)
  const idx = mood === 'dusk' ? 1 : mood === 'night' ? 2 : mood === 'aerial' ? 3 : 0
  if (gallery[idx]) return gallery[idx]
  if (style) return gallery[0] ?? hotelPlaceholderImage(sub, hotel.name)
  return hotelPlaceholderImage(sub, hotel.name)
}

export function defaultImageKey(subsidiaryId: string): string {
  const sub = getSubsidiary(subsidiaryId)
  return `${sub?.imageStyle ?? 'coast'}:day`
}
