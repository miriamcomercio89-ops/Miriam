import type { LocationInsight } from '../types'

const SEARCH = 'https://nominatim.openstreetmap.org/search'

export interface PlaceHit {
  lat: number
  lng: number
  label: string
  type: string
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `${SEARCH}?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    type?: string
    class?: string
  }>
  return data.map((d) => ({
    lat: Number(d.lat),
    lng: Number(d.lon),
    label: d.display_name,
    type: d.type || d.class || 'place',
  }))
}

export function insightStub(lat: number, lng: number, label: string): Partial<LocationInsight> {
  return { lat, lng, displayName: label }
}
