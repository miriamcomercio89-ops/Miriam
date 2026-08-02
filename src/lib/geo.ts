import type { LocationInsight } from '../types'
import { getCountryRules } from './countryRules'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'
const cache = new Map<string, LocationInsight>()

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`
}

const WATER_TYPES = new Set([
  'ocean', 'sea', 'bay', 'strait', 'fjord', 'reef', 'water', 'river', 'lake',
  'reservoir', 'canal', 'wetland', 'lagoon', 'pond', 'tidal_channel', 'shoal',
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

const REGION_COUNTRIES: Record<string, string[]> = {
  med: ['ES', 'FR', 'IT', 'GR', 'PT', 'HR', 'MT', 'CY', 'TR', 'TN', 'MA', 'EG', 'AL', 'ME', 'SI'],
  caribbean: ['CU', 'DO', 'JM', 'HT', 'BS', 'BB', 'TT', 'PR', 'MQ', 'GP', 'AW', 'CW', 'KY', 'TC'],
  seasia: ['TH', 'ID', 'VN', 'PH', 'MY', 'SG', 'KH', 'LA', 'MM', 'BN'],
  mideast: ['AE', 'SA', 'QA', 'BH', 'KW', 'OM', 'JO', 'IL', 'LB', 'IQ', 'IR'],
  europe: ['DE', 'GB', 'NL', 'BE', 'CH', 'AT', 'PL', 'CZ', 'HU', 'DK', 'SE', 'NO', 'FI', 'IE', 'LU'],
  americas: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO', 'EC', 'UY', 'CR', 'PA'],
  africa: ['ZA', 'KE', 'TZ', 'MA', 'EG', 'TN', 'SN', 'NG', 'GH', 'MU', 'SC', 'MV'],
  oceania: ['AU', 'NZ', 'FJ', 'PG', 'NC', 'PF'],
  eastasia: ['JP', 'KR', 'CN', 'HK', 'TW', 'MN'],
}

export function detectGeoRegion(lat: number, lng: number, countryCode: string): string {
  const cc = countryCode.toUpperCase()
  for (const [region, codes] of Object.entries(REGION_COUNTRIES)) {
    if (codes.includes(cc)) return region
  }
  // Fallback by coordinates
  if (lat > 30 && lat < 46 && lng > -10 && lng < 40) return 'med'
  if (lat > 10 && lat < 27 && lng > -90 && lng < -58) return 'caribbean'
  if (lat > -12 && lat < 22 && lng > 92 && lng < 140) return 'seasia'
  if (lat > 12 && lat < 36 && lng > 32 && lng < 60) return 'mideast'
  if (lat > 36 && lat < 72 && lng > -12 && lng < 40) return 'europe'
  if (lng < -30 && lng > -170 && lat < 72) return 'americas'
  if (lat < 0 && lng > 100) return 'oceania'
  if (lat > -35 && lat < 38 && lng > -20 && lng < 55) return 'africa'
  return 'global'
}

async function nominatim(lat: number, lng: number, zoom: number) {
  const url = `${NOMINATIM}?lat=${lat}&lon=${lng}&format=json&zoom=${zoom}&addressdetails=1&extratags=1&namedetails=1`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  return res.json()
}

function isWaterPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object') return true
  const d = data as Record<string, unknown>
  const address = (d.address ?? {}) as Record<string, string>
  const cls = String(d.class ?? '')
  const typ = String(d.type ?? '').toLowerCase()
  const category = String(d.category ?? '')
  const name = String(d.name ?? d.display_name ?? '')
  const addresstype = String(d.addresstype ?? '').toLowerCase()

  if (WATER_TYPES.has(typ) || WATER_TYPES.has(addresstype)) return true
  if (cls === 'natural' && WATER_TYPES.has(typ)) return true
  if (category === 'water' || cls === 'waterway') return true
  if (/^(ocean|sea|pacific|atlantic|indian ocean)$/i.test(typ)) return true

  const hasLand =
    !!(address.country || address.state || address.city || address.town || address.village ||
      address.municipality || address.county || address.suburb || address.hamlet ||
      address.road || address.pedestrian || address.island || address.archipelago)

  if (!hasLand) {
    if (/ocean|sea|pacific|atlantic|índico|indico|océano|oceano|mar\b/i.test(name)) return true
    // Open water often returns only named seas without country
    if (!address.country_code) return true
  }

  // Small islands still have country — treat as land
  return false
}

export async function resolveLocation(lat: number, lng: number): Promise<LocationInsight> {
  const key = cacheKey(lat, lng)
  const hit = cache.get(key)
  if (hit) return hit

  const fallback = buildInsight(lat, lng, null, 0.35)
  try {
    // Dual-zoom probe improves coast / offshore accuracy
    const [coarse, fine] = await Promise.all([
      nominatim(lat, lng, 8),
      nominatim(lat, lng, 14),
    ])

    const fineWater = isWaterPayload(fine)
    const coarseWater = isWaterPayload(coarse)
    const data = fine && !fineWater ? fine : coarse && !coarseWater ? coarse : fine ?? coarse

    // If either zoom clearly shows land with country, prefer land
    let isLand = true
    let confidence = 0.7
    if (fine && !fineWater) {
      isLand = true
      confidence = 0.92
    } else if (coarse && !coarseWater) {
      isLand = true
      confidence = 0.8
    } else if (fineWater && coarseWater) {
      isLand = false
      confidence = 0.9
    } else if (fineWater || coarseWater) {
      // Ambiguous coastline: offset sample inland-ish by tiny delta toward equator/pole heuristic
      const probeLat = lat + (lat >= 0 ? -0.02 : 0.02)
      const probe = await nominatim(probeLat, lng, 12)
      if (probe && !isWaterPayload(probe)) {
        isLand = true
        confidence = 0.65
      } else {
        isLand = false
        confidence = 0.75
      }
    }

    const insight = buildInsight(lat, lng, data, confidence)
    insight.isLand = isLand && insight.isLand
    if (!isLand) {
      insight.notes = ['Coordenada clasificada como agua / alta mar', ...insight.notes]
    }
    cache.set(key, insight)
    return insight
  } catch {
    cache.set(key, fallback)
    return fallback
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInsight(lat: number, lng: number, data: any, confidence: number): LocationInsight {
  const address = data?.address ?? {}
  const typ = String(data?.type ?? '').toLowerCase()
  const water = data ? isWaterPayload(data) : true

  const country = address.country ?? (water ? 'Aguas internacionales' : 'Territorio desconocido')
  const countryCode = String(address.country_code ?? '').toUpperCase() || 'XX'
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.island ||
    address.state ||
    (water ? 'Alta mar' : 'Zona rural')
  const region = address.state || address.region || address.county || ''
  const geoRegion = detectGeoRegion(lat, lng, countryCode)

  const beachScore = calcBeachScore(lat, lng, address, typ, geoRegion)
  const baseTourism = HIGH_TOURISM[countryCode] ?? 55
  const tourismIndex = clamp(
    baseTourism + beachScore * 0.15 + coastalLatitudeBonus(lat) * 8 - (water ? 40 : 0),
    5,
    98,
  )
  const costIndex = HIGH_COST[countryCode] ?? 1
  const countryRules = getCountryRules(countryCode)
  const taxRate = countryRules.taxRate
  const climateLabel = climateFromLat(lat)
  const notes: string[] = [...countryRules.rules]
  if (beachScore >= 70) notes.push('Excelente potencial costero / vacacional')
  else if (beachScore >= 45) notes.push('Buena afinidad turística de costa')
  if (tourismIndex >= 80) notes.push('Destino de alta demanda internacional')
  if (costIndex >= 1.25) notes.push('Mercado de construcción caro')
  if (costIndex <= 0.75) notes.push('Costes de obra relativamente bajos')
  if (taxRate >= 0.13) notes.push('Fiscalidad hotelera elevada')
  if (countryRules.touristTaxPerNight >= 3) {
    notes.push(`Tasa turística alta: ${countryRules.touristTaxPerNight} €/hab. noche`)
  } else if (countryRules.touristTaxPerNight > 0) {
    notes.push(`Tasa turística: ${countryRules.touristTaxPerNight} €/hab. noche`)
  }
  const place = `${address.city ?? ''} ${address.town ?? ''} ${address.suburb ?? ''} ${address.county ?? ''} ${address.island ?? ''} ${typ} ${data?.display_name ?? ''}`.toLowerCase()
  let airportScore = 12
  if (/airport|aeropuerto|aeroport|flughafen|aéroport|terminal|airfield/.test(place)) airportScore += 55
  if (/airport|aeropuerto/.test(city.toLowerCase())) airportScore += 20
  if (geoRegion === 'business' || /business|distrito financiero|downtown|centre-ville/.test(place)) airportScore += 8
  airportScore = clamp(airportScore + (tourismIndex > 70 ? 6 : 0), 0, 98)

  let stationScore = 10
  if (/station|estación|estacao|bahnhof|gare|metro|train|ferrocarril|rail/.test(place)) stationScore += 50
  if (/central|hauptbahnhof|union station/.test(place)) stationScore += 15
  stationScore = clamp(stationScore, 0, 98)

  const greenTax = countryRules.greenTaxPerNight ?? 0.5
  if (airportScore >= 50) notes.push(`Zona con buena conexión aérea (índice ${airportScore})`)
  if (stationScore >= 50) notes.push(`Buena conexión ferroviaria/metro (índice ${stationScore})`)
  if (greenTax >= 1) notes.push(`Tasa verde: ${greenTax} €/hab. noche`)

  if (geoRegion !== 'global') notes.push(`Región Orbis: ${geoRegionLabel(geoRegion)}`)

  return {
    lat,
    lng,
    isLand: !water,
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
    geoRegion,
    notes,
    confidence,
    airportScore: Math.round(airportScore),
    stationScore: Math.round(stationScore),
    touristTaxPerNight: countryRules.touristTaxPerNight,
    greenTaxPerNight: greenTax,
  }
}

export function geoRegionLabel(id: string): string {
  const map: Record<string, string> = {
    med: 'Mediterráneo',
    caribbean: 'Caribe',
    seasia: 'Sudeste asiático',
    mideast: 'Oriente Medio',
    europe: 'Europa',
    americas: 'Américas',
    africa: 'África',
    oceania: 'Oceanía',
    eastasia: 'Asia oriental',
    global: 'Global',
    coastal: 'Costera',
    business: 'Negocios',
    wellness: 'Wellness',
    'tourism-high': 'Alto turismo',
  }
  return map[id] ?? id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcBeachScore(lat: number, _lng: number, address: any, typ: string, geoRegion: string): number {
  let score = 35 + coastalLatitudeBonus(lat) * 25
  const place = `${address.city ?? ''} ${address.town ?? ''} ${address.suburb ?? ''} ${address.county ?? ''} ${address.island ?? ''} ${typ}`.toLowerCase()
  if (/beach|playa|costa|coast|bay|marina|harbour|harbor|island|isla|cape|peninsula|cove|shore/.test(place)) score += 28
  if (/resort|tourist|turismo/.test(place)) score += 10
  if (geoRegion === 'med' || geoRegion === 'caribbean' || geoRegion === 'seasia') score += 12
  if (geoRegion === 'oceania') score += 8
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
