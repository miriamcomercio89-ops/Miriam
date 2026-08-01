import { getSubsidiary, hotelPlaceholderImage } from '../data/subsidiaries'
import { galleryImages, type GalleryMood } from './gallery'
import type { Hotel } from '../types'

const MOOD_INDEX: Record<string, number> = {
  day: 0,
  dusk: 1,
  night: 2,
  aerial: 3,
  sunny: 4,
  storm: 5,
  spring: 6,
  winter: 7,
}

export function resolveHotelImage(
  hotel: Pick<Hotel, 'imageDataUrl' | 'imageKey' | 'subsidiaryId' | 'name' | 'geoRegion'>,
): string {
  if (hotel.imageDataUrl) return hotel.imageDataUrl
  const sub = getSubsidiary(hotel.subsidiaryId)
  if (!sub) return ''
  const [, moodRaw] = (hotel.imageKey || `${sub.imageStyle}:day`).split(':')
  const mood = (moodRaw || 'day') as GalleryMood
  const gallery = galleryImages(sub, hotel.name, hotel.geoRegion || sub.imageStyle)
  const idx = MOOD_INDEX[mood] ?? 0
  return gallery[idx] ?? gallery[0] ?? hotelPlaceholderImage(sub, hotel.name)
}

export function defaultImageKey(subsidiaryId: string): string {
  const sub = getSubsidiary(subsidiaryId)
  return `${sub?.imageStyle ?? 'coast'}:day`
}
