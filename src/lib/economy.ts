import type { SeasonName, Hotel, WorldEvent, LocationInsight, BuildDraft } from '../types'
import { SERVICE_CATALOG, STAFF_OPTIONS } from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'

/** Day of year 0-364 from game minutes */
export function dayOfYear(gameMinutes: number): number {
  const dayIndex = Math.floor(gameMinutes / (60 * 24))
  return ((dayIndex % 365) + 365) % 365
}

/** Northern meteorological-ish seasons; inverted for southern hemisphere */
export function getSeason(lat: number, gameMinutes: number): SeasonName {
  const d = dayOfYear(gameMinutes)
  // Dec–Feb 334-364 & 0-58, Mar–May 59-151, Jun–Aug 152-243, Sep–Nov 244-333
  let north: SeasonName
  if (d >= 152 && d <= 243) north = 'alta' // summer
  else if ((d >= 59 && d <= 151) || (d >= 244 && d <= 333)) north = 'media'
  else north = 'baja' // winter

  if (lat < 0) {
    if (north === 'alta') return 'baja'
    if (north === 'baja') return 'alta'
  }
  return north
}

export function seasonLabel(s: SeasonName): string {
  if (s === 'alta') return 'Temporada alta'
  if (s === 'media') return 'Temporada media'
  return 'Temporada baja'
}

export function seasonDemandMult(s: SeasonName): number {
  if (s === 'alta') return 1.16
  if (s === 'media') return 1.0
  return 0.84
}

export function fairPrice(hotel: Pick<Hotel, 'stars' | 'tourismIndex' | 'beachScore' | 'target' | 'services' | 'subsidiaryId' | 'staffLevel'>, season: SeasonName): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)
  let price =
    55 +
    hotel.stars * 58 +
    hotel.tourismIndex * 1.35 +
    hotel.beachScore * 0.7 +
    (sub?.costMultiplier ?? 1) * 25

  if (hotel.target === 'lujo') price *= 1.35
  if (hotel.target === 'negocios') price *= 1.12
  if (hotel.target === 'familiar') price *= 0.92
  if (hotel.target === 'playa') price *= 1.05
  if (hotel.services.includes('all_inclusive')) price *= 1.18
  if (hotel.services.includes('spa')) price += 18
  if (hotel.services.includes('playa_privada')) price += 25
  if (staff?.id === 'lujo') price *= 1.1
  if (staff?.id === 'basico') price *= 0.9

  if (season === 'alta') price *= 1.12
  if (season === 'baja') price *= 0.88

  return Math.round(clamp(price, 35, 2500))
}

/** Orbis Pricing AI: nudge price toward revenue-max given recent occupancy */
export function aiAdjustPrice(hotel: Hotel, season: SeasonName): number {
  const base = fairPrice(hotel, season)
  let price = hotel.pricePerNight || base
  const occ = hotel.lastDayOccupancy

  if (occ === 0 && hotel.lifetimeGuests === 0) {
    return base
  }

  if (occ > 0.88) price *= 1.04
  else if (occ > 0.75) price *= 1.015
  else if (occ < 0.35) price *= 0.94
  else if (occ < 0.5) price *= 0.97

  // Pull gently toward fair price so AI doesn't drift forever
  price = price * 0.85 + base * 0.15
  return Math.round(clamp(price, base * 0.55, base * 1.65))
}

export function calcConstructionCost(draft: BuildDraft, loc: LocationInsight): number {
  const sub = getSubsidiary(draft.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === draft.staffLevel)!
  const basePerRoom = 45_000 + draft.stars * 28_000
  const roomsCost = draft.rooms * basePerRoom
  const servicesCost = draft.services.reduce((sum, id) => {
    const s = SERVICE_CATALOG.find((x) => x.id === id)
    return sum + (s?.cost ?? 0)
  }, 0)
  const landPremium = 400_000 * loc.costIndex
  const tourismLand = 250_000 * (loc.tourismIndex / 100)
  const subMult = sub?.costMultiplier ?? 1
  const starMult = 1 + (draft.stars - 3) * 0.12
  return Math.round((roomsCost + servicesCost + landPremium + tourismLand) * subMult * staff.costMultiplier * starMult * loc.costIndex)
}

export function draftToTempHotel(
  draft: BuildDraft,
  loc: LocationInsight,
  gameMinutes: number,
  reputation: number,
): Hotel {
  const season = getSeason(loc.lat, gameMinutes)
  const temp: Hotel = {
    id: 'temp',
    name: draft.name,
    subsidiaryId: draft.subsidiaryId,
    lat: loc.lat,
    lng: loc.lng,
    stars: draft.stars,
    rooms: draft.rooms,
    pricePerNight: 100,
    services: draft.services,
    staffLevel: draft.staffLevel,
    target: draft.target,
    imageDataUrl: draft.imageDataUrl,
    country: loc.country,
    countryCode: loc.countryCode,
    city: loc.city,
    region: loc.region,
    tourismIndex: loc.tourismIndex,
    beachScore: loc.beachScore,
    costIndex: loc.costIndex,
    taxRate: loc.taxRate,
    geoRegion: loc.geoRegion,
    builtAtGameDay: 0,
    constructionCost: 0,
    lastDayRevenue: 0,
    lastDayCosts: 0,
    lastDayOccupancy: 0,
    lifetimeRevenue: 0,
    lifetimeCosts: 0,
    lifetimeGuests: 0,
    satisfaction: 70,
  }
  temp.pricePerNight = fairPrice(temp, season)
  // bake reputation into satisfaction baseline for estimate
  temp.satisfaction = clamp(55 + reputation * 0.35, 40, 95)
  return temp
}

export function estimateDaily(
  draft: BuildDraft,
  loc: LocationInsight,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
) {
  const fake = draftToTempHotel(draft, loc, gameMinutes, reputation)
  return simulateHotelDay(fake, events, gameMinutes, reputation)
}

export function simulateHotelDay(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
) {
  const season = getSeason(hotel.lat, gameMinutes)
  const price = hotel.id === 'temp' ? hotel.pricePerNight : aiAdjustPrice(hotel, season)
  const priced = { ...hotel, pricePerNight: price }
  const occupancy = calcOccupancy(priced, events, season, reputation)
  const revenue = Math.round(priced.rooms * occupancy * priced.pricePerNight)
  const costs = Math.round(calcDailyCosts(priced, events, revenue))
  const guests = Math.round(priced.rooms * occupancy)
  const satisfactionDelta = occupancy * 8 + (priced.stars - 3) * 0.8 - (costs > revenue ? 2 : 0)
  const satisfaction = clamp(hotel.satisfaction * 0.92 + satisfactionDelta, 20, 99)
  return { occupancy, revenue, costs, net: revenue - costs, guests, price, satisfaction, season }
}

export function calcOccupancy(
  hotel: Hotel,
  events: WorldEvent[],
  season: SeasonName,
  reputation: number,
): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const serviceBonus = hotel.services.reduce((sum, id) => {
    const s = SERVICE_CATALOG.find((x) => x.id === id)
    return sum + (s?.demandBonus ?? 0)
  }, 0)

  let demand =
    0.38 +
    hotel.tourismIndex / 220 +
    hotel.stars * 0.035 +
    serviceBonus +
    staff.demandBonus +
    (sub?.demandBonus ?? 0) +
    (reputation - 50) / 280 +
    (hotel.satisfaction - 70) / 350

  demand *= seasonDemandMult(season)

  if (sub) {
    demand += sub.beachAffinity * (hotel.beachScore / 100) * 0.2
    if (sub.targets.includes(hotel.target)) demand += 0.04
    else demand -= 0.03
  }

  const ideal = fairPrice(hotel, season)
  const priceRatio = hotel.pricePerNight / Math.max(40, ideal)
  if (priceRatio > 1) demand -= Math.min(0.38, (priceRatio - 1) * 0.4)
  else demand += Math.min(0.14, (1 - priceRatio) * 0.22)

  if (hotel.target === 'playa') demand += hotel.beachScore / 400
  if (hotel.target === 'negocios') demand += hotel.tourismIndex > 60 ? 0.03 : -0.02
  if (hotel.target === 'wellness' && hotel.services.includes('spa')) demand += 0.03
  if (hotel.target === 'familiar' && hotel.services.includes('kids_club')) demand += 0.03

  for (const ev of events) {
    if (!eventApplies(ev, hotel)) continue
    demand *= ev.demandMultiplier
  }

  const jitter = 1 + pseudoNoise(hotel.id, Math.round(hotel.pricePerNight + hotel.lastDayRevenue)) * 0.08 - 0.04
  demand *= jitter

  return clamp(demand, 0.08, 0.98)
}

function calcDailyCosts(hotel: Hotel, events: WorldEvent[], revenue: number): number {
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const serviceDaily = hotel.services.reduce((sum, id) => {
    const s = SERVICE_CATALOG.find((x) => x.id === id)
    return sum + (s?.dailyCost ?? 0)
  }, 0)
  const payroll = hotel.rooms * staff.dailyPerRoom
  const maintenance = hotel.rooms * (12 + hotel.stars * 6) * hotel.costIndex
  const utilities = hotel.rooms * (8 + hotel.stars * 3)
  const tax = revenue * hotel.taxRate
  let total = payroll + serviceDaily + maintenance + utilities + tax

  for (const ev of events) {
    if (!eventApplies(ev, hotel)) continue
    total *= ev.costMultiplier
  }
  return total
}

export function eventApplies(ev: WorldEvent, hotel: Hotel): boolean {
  if (ev.scope === 'global') return true
  if (ev.scope === 'coastal') return hotel.beachScore >= 45
  if (ev.scope === 'business') {
    return hotel.target === 'negocios' || hotel.subsidiaryId.includes('business') || hotel.subsidiaryId.includes('congress')
  }
  if (ev.scope === 'wellness') {
    return hotel.target === 'wellness' || hotel.services.includes('spa') || hotel.services.includes('yoga')
  }
  if (ev.scope === 'tourism-high') return hotel.tourismIndex >= 65
  if (ev.scope === hotel.geoRegion) return true
  if (ev.scope.length === 2) return hotel.countryCode.toLowerCase() === ev.scope.toLowerCase()
  return false
}

export function reputationKey(countryCode: string): string {
  return (countryCode || 'XX').toUpperCase()
}

export function updateReputation(
  current: number,
  hotelNet: number,
  occupancy: number,
  satisfaction: number,
): number {
  let next = current
  next += (satisfaction - 70) * 0.04
  next += (occupancy - 0.55) * 4
  if (hotelNet > 0) next += 0.15
  else next -= 0.35
  return clamp(next, 5, 99)
}

export function aggregatePortfolio(hotels: Hotel[]) {
  const revenue = hotels.reduce((s, h) => s + h.lastDayRevenue, 0)
  const costs = hotels.reduce((s, h) => s + h.lastDayCosts, 0)
  const rooms = hotels.reduce((s, h) => s + h.rooms, 0)
  const occ =
    hotels.length === 0 ? 0 : hotels.reduce((s, h) => s + h.lastDayOccupancy, 0) / hotels.length
  return { revenue, costs, net: revenue - costs, rooms, occupancy: occ, count: hotels.length }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pseudoNoise(id: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}
