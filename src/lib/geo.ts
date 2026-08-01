import type { LocationInsight } from '../types'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/** Lightweight cache to respect Nominatim rate limits */
const cache = new Map<string, LocationInsight>()

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`
}

const WATER_TYPES = new Set([
  'ocean',
  'sea',
  'bay',
  'strait',
  'fjord',
  'reef',
  'water',
  'river',
  'lake',
  'reservoir',
  'canal',
  'wetland',
  'lagoon',
])

const HIGH_TOURISM: Record<string, number> = {
  ES: 86, FR: 88, IT: 87, US: 82, GB: 78, PT: 80, GR: 84, TR: 79,
  TH: 85, ID: 83, MX: 84, AE: 86, JP: 81, AU: 80, BR: 76, EG: 74,
  HR: 82, MV: 92, SC: 90, CU: 78, DO: 81, JM: 80, NZ: 79, CA: 74,
  DE: 76, NL: 75, CH: 83, AT: 78, MA: 72, TN: 70, VN: 77, PH: 78,
  SG: 85, HK: 84, KR: 78, IN: 70, AR: 68, CL: 72, PE: 74, CO: 70,
  ZA: 73, KE: 71, TZ: 75, IS: 82, NO: 78, SE: 74, FI: 72, IE: 76,
  MT: 80, CY: 81, LU: 70, BE: 72, PL: 68, CZ: 74, HU: 73, DK: 73,
}

const HIGH_COST: Record<string, number> = {
  CH: 1.55, NO: 1.45, IS: 1.4, DK: 1.35, SE: 1.3, US: 1.28, GB: 1.25,
  AE: 1.22, SG: 1.35, JP: 1.25, AU: 1.22, FR: 1.18, DE: 1.15, NL: 1.18,
  ES: 1.05, IT: 1.08, PT: 0.95, GR: 0.92, TR: 0.78, TH: 0.72, ID: 0.65,
  MX: 0.75, BR: 0.8, EG: 0.6, IN: 0.55, VN: 0.58, PH: 0.6, MA: 0.7,
  HR: 0.9, MV: 1.35, SC: 1.3, NZ: 1.15, CA: 1.18, KR: 1.12, HK: 1.4,
}

const TAX: Record<string, number> = {
  ES: 0.12, FR: 0.14, IT: 0.13, DE: 0.11, US: 0.1, GB: 0.13, AE: 0.05,
  SG: 0.08, CH: 0.09, JP: 0.1, MX: 0.12, TH: 0.08, PT: 0.11, GR: 0.13,
}

export async function resolveLocation(lat: number, lng: number): Promise<LocationInsight> {
  const key = cacheKey(lat, lng)
  const hit = cache.get(key)
  if (hit) return hit

  const fallback = buildInsight(lat, lng, null)
  try {
    const url = `${NOMINATIM}?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1&extratags=1`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      cache.set(key, fallback)
      return fallback
    }
    const data = await res.json()
    const insight = buildInsight(lat, lng, data)
    cache.set(key, insight)
    return insight
  } catch {
    cache.set(key, fallback)
    return fallback
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInsight(lat: number, lng: number, data: any): LocationInsight {
  const address = data?.address ?? {}
  const cls = String(data?.class ?? '')
  const typ = String(data?.type ?? '').toLowerCase()
  const category = String(data?.category ?? '')
  const name = String(data?.name ?? data?.display_name ?? '')

  const isWater =
    cls === 'natural' && WATER_TYPES.has(typ) ||
    cls === 'highway' && typ === 'ferry' ||
    category === 'water' ||
    WATER_TYPES.has(typ) ||
    /ocean|sea|pacific|atlantic|indian ocean|mar\b|océano|oceano/i.test(name) && !address.country

  // If Nominatim returns almost nothing far from shore, treat open ocean as water
  const noLandSignals = !address.country && !address.state && !address.city && !address.town && !address.village
  const likelyOcean = noLandSignals && (isWater || !data)

  const country = address.country ?? (likelyOcean ? 'Aguas internacionales' : 'Territorio desconocido')
  const countryCode = String(address.country_code ?? '').toUpperCase() || 'XX'
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state ||
    (likelyOcean ? 'Alta mar' : 'Zona rural')
  const region = address.state || address.region || address.county || ''

  const beachScore = calcBeachScore(lat, lng, address, typ)
  const baseTourism = HIGH_TOURISM[countryCode] ?? 55
  const tourismIndex = clamp(
    baseTourism + beachScore * 0.15 + coastalLatitudeBonus(lat) * 8 - (likelyOcean ? 40 : 0),
    5,
    98,
  )
  const costIndex = HIGH_COST[countryCode] ?? 1
  const taxRate = TAX[countryCode] ?? 0.1
  const climateLabel = climateFromLat(lat)
  const notes: string[] = []
  if (beachScore >= 70) notes.push('Excelente potencial costero / vacacional')
  else if (beachScore >= 45) notes.push('Buena afinidad turística de costa')
  if (tourismIndex >= 80) notes.push('Destino de alta demanda internacional')
  if (costIndex >= 1.25) notes.push('Mercado de construcción caro')
  if (costIndex <= 0.75) notes.push('Costes de obra relativamente bajos')
  if (taxRate >= 0.13) notes.push('Fiscalidad hotelera elevada')

  return {
    lat,
    lng,
    isLand: !likelyOcean && !isWater,
    displayName: data?.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    country,
    countryCode,
    city,
    region,
    tourismIndex: Math.round(tourismIndex),
    beachScore: Math.round(beachScore),
    costIndex: Math.round(costIndex * 100) / 100,
    taxRate,
    climateLabel,
    notes,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcBeachScore(lat: number, lng: number, address: any, typ: string): number {
  let score = 35 + coastalLatitudeBonus(lat) * 25
  const place = `${address.city ?? ''} ${address.town ?? ''} ${address.suburb ?? ''} ${address.county ?? ''} ${typ}`.toLowerCase()
  if (/beach|playa|costa|coast|bay|marina|harbour|harbor|island|isla|cape|peninsula/.test(place)) score += 25
  if (/resort|tourist|turismo/.test(place)) score += 10
  // Mediterranean / Caribbean / SE Asia rough bands
  if (lat > 30 && lat < 46 && lng > -10 && lng < 37) score += 12 // Med
  if (lat > 10 && lat < 27 && lng > -90 && lng < -60) score += 14 // Caribbean
  if (lat > -12 && lat < 20 && lng > 95 && lng < 130) score += 12 // SE Asia
  if (Math.abs(lat) > 55) score -= 15
  return clamp(score, 5, 98)
}

function coastalLatitudeBonus(lat: number): number {
  const a = Math.abs(lat)
  if (a < 5) return 0.55
  if (a < 35) return 1
  if (a < 45) return 0.75
  if (a < 55) return 0.4
  return 0.15
}

function climateFromLat(lat: number): string {
  const a = Math.abs(lat)
  if (a < 15) return 'Tropical'
  if (a < 30) return 'Subtropical / cálido'
  if (a < 45) return 'Templado'
  if (a < 60) return 'Fresco / oceánico'
  return 'Frío / polar'
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
