import type { SeasonName, Hotel, WorldEvent, LocationInsight, BuildDraft, CorporateContract, GuestTarget, StaffLevel, HotelService } from '../types'
import { SERVICE_CATALOG, STAFF_OPTIONS } from '../data/catalog'
import { getSubsidiary, SUBSIDIARY_COLOR } from '../data/subsidiaries'

const CLIENTS = [
  'Orbis Corporate Desk',
  'Aether Airlines Crew',
  'Norte Bank Travel',
  'Helios Pharma',
  'Atlas Logistics',
  'Vega Congress',
  'Lumen Media',
  'Pinnacle Consulting',
]

export function dayOfYear(gameMinutes: number): number {
  const dayIndex = Math.floor(gameMinutes / (60 * 24))
  return ((dayIndex % 365) + 365) % 365
}

export function getSeason(lat: number, gameMinutes: number): SeasonName {
  const d = dayOfYear(gameMinutes)
  let north: SeasonName
  if (d >= 152 && d <= 243) north = 'alta'
  else if ((d >= 59 && d <= 151) || (d >= 244 && d <= 333)) north = 'media'
  else north = 'baja'
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

export function fairPrice(
  hotel: Pick<Hotel, 'stars' | 'tourismIndex' | 'beachScore' | 'target' | 'services' | 'subsidiaryId' | 'staffLevel'>,
  season: SeasonName,
): number {
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

export function aiAdjustPrice(hotel: Hotel, season: SeasonName): number {
  const base = fairPrice(hotel, season)
  let price = hotel.pricePerNight || base
  const occ = hotel.lastDayOccupancy
  if (occ === 0 && hotel.lifetimeGuests === 0) return base
  if (occ > 0.88) price *= 1.04
  else if (occ > 0.75) price *= 1.015
  else if (occ < 0.35) price *= 0.94
  else if (occ < 0.5) price *= 0.97
  price = price * 0.85 + base * 0.15
  return Math.round(clamp(price, base * 0.55, base * 1.65))
}

/** Orbis Contracts AI */
export function aiManageContract(hotel: Hotel, season: SeasonName): CorporateContract | null {
  const existing = hotel.contract
  if (existing && existing.daysRemaining > 1) {
    return { ...existing, daysRemaining: existing.daysRemaining - 1 }
  }

  const fair = fairPrice(hotel, season)
  const wantsContract =
    hotel.target === 'negocios' ||
    hotel.subsidiaryId.includes('business') ||
    hotel.subsidiaryId.includes('congress') ||
    hotel.subsidiaryId.includes('airport') ||
    season === 'baja' ||
    hotel.lastDayOccupancy < 0.45

  const roll = pseudoNoise(hotel.id, hotel.builtAtGameDay + Math.round(hotel.pricePerNight))
  if (!wantsContract && roll > 0.22) return null
  if (wantsContract && roll > 0.72 && season === 'alta' && hotel.target !== 'negocios') return null

  const pct = hotel.target === 'negocios' ? 0.22 + roll * 0.2 : 0.1 + roll * 0.15
  const blocked = Math.max(5, Math.min(hotel.rooms - 10, Math.round(hotel.rooms * pct)))
  if (blocked < 5) return null

  return {
    clientName: CLIENTS[Math.floor(roll * CLIENTS.length)],
    blockedRooms: blocked,
    ratePerNight: Math.round(fair * (0.78 + roll * 0.12)),
    daysRemaining: 12 + Math.floor(roll * 24),
  }
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
  return Math.round(
    (roomsCost + servicesCost + landPremium + tourismLand) *
      subMult *
      staff.costMultiplier *
      starMult *
      loc.costIndex,
  )
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
    imageKey: draft.imageKey,
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
    satisfaction: clamp(55 + reputation * 0.35, 40, 95),
    contract: null,
  }
  temp.pricePerNight = fairPrice(temp, season)
  return temp
}

export function estimateDaily(
  draft: BuildDraft,
  loc: LocationInsight,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
) {
  return simulateHotelDay(draftToTempHotel(draft, loc, gameMinutes, reputation), events, gameMinutes, reputation)
}

export type DayResult = {
  occupancy: number
  revenue: number
  costs: number
  net: number
  guests: number
  price: number
  satisfaction: number
  season: SeasonName
  contract: CorporateContract | null
}

/** Fast path used in mass simulation */
export function simulateHotelDay(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
): DayResult {
  const season = getSeason(hotel.lat, gameMinutes)
  const contract = hotel.id === 'temp' ? hotel.contract : aiManageContract(hotel, season)
  const price = hotel.id === 'temp' ? hotel.pricePerNight : aiAdjustPrice(hotel, season)

  const blocked = contract ? Math.min(contract.blockedRooms, hotel.rooms - 1) : 0
  const openRooms = Math.max(1, hotel.rooms - blocked)

  const occupancyOpen = calcOccupancy(
    { ...hotel, pricePerNight: price, rooms: openRooms },
    events,
    season,
    reputation,
  )

  const contractRevenue = blocked * (contract?.ratePerNight ?? 0)
  const openRevenue = Math.round(openRooms * occupancyOpen * price)
  const revenue = contractRevenue + openRevenue
  const occupancy = (blocked + openRooms * occupancyOpen) / hotel.rooms
  const costs = Math.round(calcDailyCosts(hotel, events, revenue, blocked))
  const guests = Math.round(blocked + openRooms * occupancyOpen)
  const satisfactionDelta = occupancy * 8 + (hotel.stars - 3) * 0.8 - (costs > revenue ? 2 : 0) + (contract ? 0.5 : 0)
  const satisfaction = clamp(hotel.satisfaction * 0.92 + satisfactionDelta, 20, 99)

  return {
    occupancy,
    revenue,
    costs,
    net: revenue - costs,
    guests,
    price,
    satisfaction,
    season,
    contract,
  }
}

/**
 * In-place day simulation for large portfolios — mutates hotel fields, returns net cash delta.
 */
export function applyHotelDayInPlace(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
): number {
  const result = simulateHotelDay(hotel, events, gameMinutes, reputation)
  hotel.pricePerNight = result.price
  hotel.contract = result.contract
  hotel.lastDayRevenue = result.revenue
  hotel.lastDayCosts = result.costs
  hotel.lastDayOccupancy = result.occupancy
  hotel.lifetimeRevenue += result.revenue
  hotel.lifetimeCosts += result.costs
  hotel.lifetimeGuests += result.guests
  hotel.satisfaction = result.satisfaction
  return result.net
}

export function calcOccupancy(
  hotel: Hotel,
  events: WorldEvent[],
  season: SeasonName,
  reputation: number,
): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  let serviceBonus = 0
  for (let i = 0; i < hotel.services.length; i++) {
    const s = SERVICE_LOOKUP[hotel.services[i]]
    if (s) serviceBonus += s
  }

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

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!eventApplies(ev, hotel, season)) continue
    demand *= ev.demandMultiplier
  }

  const jitter = 1 + pseudoNoise(hotel.id, Math.round(hotel.pricePerNight + hotel.lastDayRevenue)) * 0.08 - 0.04
  demand *= jitter
  return clamp(demand, 0.08, 0.98)
}

const SERVICE_LOOKUP: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((s) => [s.id, s.demandBonus]),
)
const SERVICE_DAILY: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((s) => [s.id, s.dailyCost]),
)

function calcDailyCosts(hotel: Hotel, events: WorldEvent[], revenue: number, blockedRooms: number): number {
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  let serviceDaily = 0
  for (let i = 0; i < hotel.services.length; i++) {
    serviceDaily += SERVICE_DAILY[hotel.services[i]] ?? 0
  }
  const payroll = hotel.rooms * staff.dailyPerRoom
  const maintenance = hotel.rooms * (12 + hotel.stars * 6) * hotel.costIndex
  const utilities = hotel.rooms * (8 + hotel.stars * 3)
  const contractAdmin = blockedRooms * 4
  const tax = revenue * hotel.taxRate
  let total = payroll + serviceDaily + maintenance + utilities + tax + contractAdmin

  const season = 'media' as SeasonName
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!eventApplies(ev, hotel, season)) continue
    total *= ev.costMultiplier
  }
  return total
}

export function eventApplies(ev: WorldEvent, hotel: Hotel, season: SeasonName): boolean {
  if (ev.season && ev.season !== 'any' && ev.season !== season) return false
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

export function hotelNet(h: Hotel): number {
  return h.lastDayRevenue - h.lastDayCosts
}

export function hotelRoi(h: Hotel): number {
  if (h.constructionCost <= 0) return 0
  return (h.lifetimeRevenue - h.lifetimeCosts) / h.constructionCost
}

export function aggregatePortfolio(hotels: Hotel[]) {
  let revenue = 0
  let costs = 0
  let rooms = 0
  let occ = 0
  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]
    revenue += h.lastDayRevenue
    costs += h.lastDayCosts
    rooms += h.rooms
    occ += h.lastDayOccupancy
  }
  return {
    revenue,
    costs,
    net: revenue - costs,
    rooms,
    occupancy: hotels.length === 0 ? 0 : occ / hotels.length,
    count: hotels.length,
  }
}

export function filterHotels(
  hotels: Hotel[],
  filters: { subsidiaryId: string | 'all'; minStars: number; profit: string },
): Hotel[] {
  const out: Hotel[] = []
  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]
    if (filters.subsidiaryId !== 'all' && h.subsidiaryId !== filters.subsidiaryId) continue
    if (h.stars < filters.minStars) continue
    if (filters.profit === 'profit' && hotelNet(h) <= 0 && h.lifetimeGuests > 0) continue
    if (filters.profit === 'loss' && (hotelNet(h) >= 0 || h.lifetimeGuests === 0)) continue
    if (filters.profit === 'new' && h.lifetimeGuests > 0) continue
    out.push(h)
  }
  return out
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pseudoNoise(id: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}

// re-export color helper usage for map canvas
export function hotelDotColor(subsidiaryId: string): string {
  return SUBSIDIARY_COLOR[subsidiaryId] ?? '#C4A35A'
}

export type { GuestTarget, StaffLevel, HotelService }
