import type { OsmSite, PlaceHit, ReversePlace } from '../types'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const PHOTON = 'https://photon.komoot.io/api/'
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const WATER = new Set([
  'ocean',
  'sea',
  'bay',
  'strait',
  'water',
  'river',
  'lake',
  'reservoir',
  'canal',
  'wetland',
  'lagoon',
  'pond',
])

let lastNom = 0
async function throttleNom() {
  const wait = 1100 - (Date.now() - lastNom)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastNom = Date.now()
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const q = query.trim()
  if (q.length < 2) return []
  try {
    await throttleNom()
    const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=7&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = (await res.json()) as Array<{
        lat: string
        lon: string
        display_name: string
        address?: Record<string, string>
      }>
      if (data.length) {
        return data.map((d) => ({
          lat: Number(d.lat),
          lng: Number(d.lon),
          label: d.display_name,
          city: d.address?.city || d.address?.town || d.address?.village || d.address?.municipality,
          country: d.address?.country,
          cc: d.address?.country_code?.toUpperCase(),
        }))
      }
    }
  } catch {
    /* fallback photon */
  }
  try {
    const res = await fetch(`${PHOTON}?q=${encodeURIComponent(q)}&limit=7`)
    if (!res.ok) return []
    const data = (await res.json()) as {
      features?: Array<{
        geometry: { coordinates: [number, number] }
        properties: { name?: string; city?: string; country?: string; countrycode?: string }
      }>
    }
    return (data.features ?? []).map((f) => ({
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      label: [f.properties.name, f.properties.city, f.properties.country].filter(Boolean).join(', '),
      city: f.properties.city || f.properties.name,
      country: f.properties.country,
      cc: f.properties.countrycode?.toUpperCase(),
    }))
  } catch {
    return []
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReversePlace> {
  const fallback: ReversePlace = {
    lat,
    lng,
    label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: 'Localidad',
    country: 'Desconocido',
    cc: 'XX',
    water: false,
  }
  try {
    await throttleNom()
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=16&addressdetails=1`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return fallback
    const d = (await res.json()) as {
      display_name?: string
      name?: string
      category?: string
      type?: string
      addresstype?: string
      address?: Record<string, string>
    }
    const addr = d.address ?? {}
    const typ = String(d.type ?? d.addresstype ?? '').toLowerCase()
    const water = WATER.has(typ) || d.category === 'waterway'
    return {
      lat,
      lng,
      label: d.display_name || fallback.label,
      city: addr.city || addr.town || addr.village || addr.municipality || addr.suburb || d.name || 'Localidad',
      country: addr.country || 'Desconocido',
      cc: (addr.country_code || 'xx').toUpperCase(),
      water,
    }
  } catch {
    return fallback
  }
}

export interface BBox {
  south: number
  west: number
  north: number
  east: number
}

const osmCache = new Map<string, OsmSite[]>()

function bboxKey(b: BBox) {
  return [b.south, b.west, b.north, b.east].map((n) => n.toFixed(3)).join(',')
}

export async function scoutRestaurants(bbox: BBox, limit = 400): Promise<OsmSite[]> {
  const key = bboxKey(bbox)
  const hit = osmCache.get(key)
  if (hit) return hit

  const q = `[out:json][timeout:22];
(
  node["amenity"~"restaurant|fast_food|cafe|bar|pub|food_court"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  way["amenity"~"restaurant|fast_food|cafe|bar|pub|food_court"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
);
out center ${limit};`

  for (const endpoint of OVERPASS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: `data=${encodeURIComponent(q)}`,
      })
      if (!res.ok) continue
      const data = (await res.json()) as {
        elements?: Array<{
          id: number
          type: string
          lat?: number
          lon?: number
          center?: { lat: number; lon: number }
          tags?: Record<string, string>
        }>
      }
      const sites: OsmSite[] = []
      for (const el of data.elements ?? []) {
        const lat = el.lat ?? el.center?.lat
        const lon = el.lon ?? el.center?.lon
        if (lat == null || lon == null) continue
        const tags = el.tags ?? {}
        sites.push({
          osmId: `${el.type}/${el.id}`,
          name: tags.name || tags.brand || `Local OSM ${el.id}`,
          amenity: tags.amenity || 'restaurant',
          lat,
          lng: lon,
          city: tags['addr:city'],
          cuisine: tags.cuisine,
        })
        if (sites.length >= limit) break
      }
      osmCache.set(key, sites)
      return sites
    } catch {
      /* try next endpoint */
    }
  }
  return []
}

export async function scoutCity(lat: number, lng: number, radiusDeg = 0.045, limit = 250): Promise<OsmSite[]> {
  return scoutRestaurants(
    {
      south: lat - radiusDeg,
      west: lng - radiusDeg,
      north: lat + radiusDeg,
      east: lng + radiusDeg,
    },
    limit,
  )
}

export const AMENITY_LABEL: Record<string, string> = {
  restaurant: 'Restaurante',
  fast_food: 'Comida rápida',
  cafe: 'Café',
  bar: 'Bar',
  pub: 'Pub',
  food_court: 'Food court',
}
