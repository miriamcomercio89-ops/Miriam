import type {
  BuildDraft,
  CorporateContract,
  ContractKind,
  CountryEconomy,
  Hotel,
  LocationInsight,
  NewsItem,
  SeasonName,
  WorldEvent,
} from '../types'
import {
  SERVICE_CATALOG,
  STAFF_OPTIONS,
  ROOM_MIX_OPTIONS,
  QUALITY_OPTIONS,
  GREEN_OPTIONS,
} from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import { getSeason, seasonDemandMult, clamp, pseudoNoise, reputationKey, dayOfYear } from './economyCore'
import { getWeather } from './weather'

export { getSeason, dayOfYear, reputationKey, clamp }
export { seasonWord as seasonLabel } from './weather'

const CLIENTS: Record<ContractKind, string[]> = {
  empresa: ['Norte Bank Travel', 'Helios Pharma', 'Pinnacle Consulting', 'Lumen Media', 'Atlas Logistics'],
  aerolinea: ['Aether Airlines Crew', 'SkyLink Layover', 'Orbis Air Partners', 'NubeJet Crew Rest'],
  evento: ['Vega Congress', 'World Fair Desk', 'Expo Host Desk', 'Summit Rooms Co'],
  gobierno: ['Misión Diplomática', 'Agencia Pública de Viajes', 'Delegación Oficial'],
  deportes: ['Club Atlético Tour', 'Liga Viajes Pro', 'Maratón Host City'],
  universidad: ['Campus Exchange', 'Uni Global Stay', 'Academia Summer Desk'],
}

export function fairPrice(
  hotel: Pick<Hotel, 'stars' | 'tourismIndex' | 'beachScore' | 'target' | 'services' | 'subsidiaryId' | 'staffLevel' | 'buildQuality' | 'roomMix'>,
  season: SeasonName,
): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)
  const quality = QUALITY_OPTIONS.find((q) => q.id === (hotel.buildQuality ?? 'bueno'))
  const mix = ROOM_MIX_OPTIONS.find((m) => m.id === (hotel.roomMix ?? 'estandar'))
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
  price *= quality?.costMult ?? 1
  price *= 1 + (mix?.demandBonus ?? 0)
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

export function aiManageContract(hotel: Hotel, season: SeasonName): CorporateContract | null {
  const existing = hotel.contract
  if (existing && existing.daysRemaining > 1) {
    return { ...existing, daysRemaining: existing.daysRemaining - 1 }
  }

  const fair = fairPrice(hotel, season)
  const roll = pseudoNoise(hotel.id, hotel.builtAtGameDay + Math.round(hotel.pricePerNight))
  const kind = pickContractKind(hotel, season, roll)
  if (!kind) return null

  const pct =
    kind === 'gobierno' ? 0.18 + roll * 0.12 :
    kind === 'aerolinea' ? 0.14 + roll * 0.16 :
    kind === 'evento' ? 0.2 + roll * 0.2 :
    kind === 'deportes' ? 0.16 + roll * 0.14 :
    kind === 'universidad' ? 0.12 + roll * 0.1 :
    0.15 + roll * 0.18

  const blocked = Math.max(5, Math.min(hotel.rooms - 10, Math.round(hotel.rooms * pct)))
  if (blocked < 5) return null

  const discount =
    kind === 'gobierno' ? 0.72 :
    kind === 'universidad' ? 0.7 :
    kind === 'aerolinea' ? 0.76 :
    kind === 'evento' ? 0.82 :
    0.78

  const names = CLIENTS[kind]
  return {
    kind,
    clientName: names[Math.floor(roll * names.length)],
    blockedRooms: blocked,
    ratePerNight: Math.round(fair * (discount + roll * 0.1)),
    daysRemaining: kind === 'evento' ? 4 + Math.floor(roll * 8) : 12 + Math.floor(roll * 24),
  }
}

function pickContractKind(hotel: Hotel, season: SeasonName, roll: number): ContractKind | null {
  const businessy =
    hotel.target === 'negocios' ||
    hotel.subsidiaryId.includes('business') ||
    hotel.subsidiaryId.includes('congress') ||
    hotel.subsidiaryId.includes('airport')

  if (hotel.services.includes('boda') && roll < 0.2) return 'evento'
  if (hotel.meetingRooms >= 4 && roll < 0.35) return 'evento'
  if (hotel.subsidiaryId.includes('airport') && roll < 0.55) return 'aerolinea'
  if (businessy && season === 'baja' && roll < 0.65) return roll < 0.25 ? 'gobierno' : 'empresa'
  if (hotel.target === 'aventura' && roll < 0.22) return 'deportes'
  if (hotel.target === 'familiar' && season === 'alta' && roll < 0.18) return 'universidad'
  if (hotel.lastDayOccupancy < 0.4 && roll < 0.5) return businessy ? 'empresa' : 'aerolinea'
  if (businessy && roll < 0.4) return 'empresa'
  if (season === 'baja' && roll < 0.28) return 'gobierno'
  return null
}

export function calcConstructionCost(draft: BuildDraft, loc: LocationInsight): number {
  const sub = getSubsidiary(draft.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === draft.staffLevel)!
  const mix = ROOM_MIX_OPTIONS.find((m) => m.id === draft.roomMix)!
  const quality = QUALITY_OPTIONS.find((q) => q.id === draft.buildQuality)!
  const green = GREEN_OPTIONS.find((g) => g.id === draft.greenLevel)!

  const basePerRoom = 45_000 + draft.stars * 28_000
  const roomsCost = draft.rooms * basePerRoom
  const servicesCost = draft.services.reduce((sum, id) => {
    const s = SERVICE_CATALOG.find((x) => x.id === id)
    return sum + (s?.cost ?? 0)
  }, 0)
  const floorsCost = Math.max(0, draft.floors - 3) * 180_000
  const meetingCost = draft.meetingRooms * 95_000
  const parkingCost = draft.parkingSpots * 4_500
  const restaurantCost = draft.restaurantLevel * 120_000
  const extras =
    (draft.buffet ? 80_000 : 0) +
    (draft.lateCheckout ? 25_000 : 0) +
    (draft.airportDesk ? 60_000 : 0) +
    draft.openingPromoDays * 8_000

  const landPremium = 400_000 * loc.costIndex
  const tourismLand = 250_000 * (loc.tourismIndex / 100)
  const subMult = sub?.costMultiplier ?? 1
  const starMult = 1 + (draft.stars - 3) * 0.12

  return Math.round(
    (roomsCost + servicesCost + floorsCost + meetingCost + parkingCost + restaurantCost + extras + landPremium + tourismLand) *
      subMult *
      staff.costMultiplier *
      mix.costMult *
      quality.costMult *
      green.costMult *
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
    roomMix: draft.roomMix,
    buildQuality: draft.buildQuality,
    floors: draft.floors,
    greenLevel: draft.greenLevel,
    meetingRooms: draft.meetingRooms,
    parkingSpots: draft.parkingSpots,
    restaurantLevel: draft.restaurantLevel,
    openingPromoDays: draft.openingPromoDays,
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
  economy?: CountryEconomy,
) {
  return simulateHotelDay(
    draftToTempHotel(draft, loc, gameMinutes, reputation),
    events,
    gameMinutes,
    reputation,
    economy,
  )
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

export function simulateHotelDay(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
  economy?: CountryEconomy,
): DayResult {
  const season = getSeason(hotel.lat, gameMinutes)
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const contract = hotel.id === 'temp' ? hotel.contract : aiManageContract(hotel, season)
  let price = hotel.id === 'temp' ? hotel.pricePerNight : aiAdjustPrice(hotel, season)

  const fx = economy?.fx ?? 1
  const inflation = economy?.inflation ?? 0
  price = Math.round(price * fx)

  const blocked = contract ? Math.min(contract.blockedRooms, hotel.rooms - 1) : 0
  const openRooms = Math.max(1, hotel.rooms - blocked)

  let occupancyOpen = calcOccupancy(
    { ...hotel, pricePerNight: price, rooms: openRooms },
    events,
    season,
    reputation,
  )
  occupancyOpen = clamp(occupancyOpen * weather.demandMult, 0.08, 0.98)
  if ((hotel.openingPromoDays ?? 0) > 0) occupancyOpen = clamp(occupancyOpen * 1.08, 0.08, 0.98)

  const contractRevenue = blocked * (contract?.ratePerNight ?? 0) * fx
  const openRevenue = Math.round(openRooms * occupancyOpen * price)
  const revenue = Math.round(contractRevenue + openRevenue)
  const occupancy = (blocked + openRooms * occupancyOpen) / hotel.rooms
  let costs = calcDailyCosts(hotel, events, revenue, blocked, inflation)
  costs = Math.round(costs * weather.costMult * fx)
  const guests = Math.round(blocked + openRooms * occupancyOpen)
  const satisfactionDelta =
    occupancy * 8 + (hotel.stars - 3) * 0.8 - (costs > revenue ? 2 : 0) + (contract ? 0.5 : 0) + (weather.demandMult - 1) * 4
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

export function applyHotelDayInPlace(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
  economy?: CountryEconomy,
): number {
  const result = simulateHotelDay(hotel, events, gameMinutes, reputation, economy)
  hotel.pricePerNight = result.price
  hotel.contract = result.contract
  hotel.lastDayRevenue = result.revenue
  hotel.lastDayCosts = result.costs
  hotel.lastDayOccupancy = result.occupancy
  hotel.lifetimeRevenue += result.revenue
  hotel.lifetimeCosts += result.costs
  hotel.lifetimeGuests += result.guests
  hotel.satisfaction = result.satisfaction
  if (hotel.openingPromoDays > 0) hotel.openingPromoDays -= 1
  return result.net
}

const SERVICE_LOOKUP: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((s) => [s.id, s.demandBonus]),
)
const SERVICE_DAILY: Record<string, number> = Object.fromEntries(
  SERVICE_CATALOG.map((s) => [s.id, s.dailyCost]),
)

export function calcOccupancy(
  hotel: Hotel,
  events: WorldEvent[],
  season: SeasonName,
  reputation: number,
): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const mix = ROOM_MIX_OPTIONS.find((m) => m.id === (hotel.roomMix ?? 'estandar'))
  const quality = QUALITY_OPTIONS.find((q) => q.id === (hotel.buildQuality ?? 'bueno'))
  const green = GREEN_OPTIONS.find((g) => g.id === (hotel.greenLevel ?? 'ninguno'))

  let serviceBonus = 0
  for (let i = 0; i < hotel.services.length; i++) {
    serviceBonus += SERVICE_LOOKUP[hotel.services[i]] ?? 0
  }

  let demand =
    0.38 +
    hotel.tourismIndex / 220 +
    hotel.stars * 0.035 +
    serviceBonus +
    staff.demandBonus +
    (sub?.demandBonus ?? 0) +
    (reputation - 50) / 280 +
    (hotel.satisfaction - 70) / 350 +
    (mix?.demandBonus ?? 0) +
    (quality?.demandBonus ?? 0) +
    (green?.demandBonus ?? 0) +
    Math.min(0.03, (hotel.meetingRooms ?? 0) * 0.004) +
    Math.min(0.02, (hotel.restaurantLevel ?? 0) * 0.006)

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

function calcDailyCosts(
  hotel: Hotel,
  events: WorldEvent[],
  revenue: number,
  blockedRooms: number,
  inflation: number,
): number {
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const green = GREEN_OPTIONS.find((g) => g.id === (hotel.greenLevel ?? 'ninguno'))
  let serviceDaily = 0
  for (let i = 0; i < hotel.services.length; i++) {
    serviceDaily += SERVICE_DAILY[hotel.services[i]] ?? 0
  }
  const payroll = hotel.rooms * staff.dailyPerRoom
  const maintenance = hotel.rooms * (12 + hotel.stars * 6) * hotel.costIndex
  const utilities = hotel.rooms * (8 + hotel.stars * 3)
  const floorsCost = Math.max(0, (hotel.floors ?? 3) - 3) * 40
  const meetingCost = (hotel.meetingRooms ?? 0) * 35
  const parkingCost = (hotel.parkingSpots ?? 0) * 1.2
  const contractAdmin = blockedRooms * 4
  const tax = revenue * hotel.taxRate
  let total = payroll + serviceDaily + maintenance + utilities + floorsCost + meetingCost + parkingCost + tax + contractAdmin
  total *= 1 - (green?.costSave ?? 0)
  total *= 1 + inflation

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!eventApplies(ev, hotel, 'media')) continue
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

export function defaultCountryEconomy(): CountryEconomy {
  return { inflation: 0.0004, fx: 1 }
}

export function tickCountryEconomies(
  current: Record<string, CountryEconomy>,
  hotels: Hotel[],
): Record<string, CountryEconomy> {
  const next = { ...current }
  const seen = new Set<string>()
  for (const h of hotels) {
    const cc = reputationKey(h.countryCode)
    if (seen.has(cc)) continue
    seen.add(cc)
    const cur = next[cc] ?? defaultCountryEconomy()
    const drift = (pseudoNoise(cc, h.builtAtGameDay) - 0.5) * 0.00015
    const fxDrift = (pseudoNoise(cc + 'fx', Math.round(h.pricePerNight)) - 0.5) * 0.004
    next[cc] = {
      inflation: clamp(cur.inflation + drift, 0.00005, 0.002),
      fx: clamp(cur.fx + fxDrift, 0.7, 1.45),
    }
  }
  return next
}

export function buildCountryStats(hotels: Hotel[], reputation: Record<string, number>, economy: Record<string, CountryEconomy>) {
  const map = new Map<
    string,
    {
      code: string
      name: string
      count: number
      rooms: number
      revenue: number
      costs: number
      net: number
      occ: number
      fame: number
      inflation: number
      fx: number
    }
  >()

  for (const h of hotels) {
    const code = reputationKey(h.countryCode)
    const cur = map.get(code) ?? {
      code,
      name: h.country,
      count: 0,
      rooms: 0,
      revenue: 0,
      costs: 0,
      net: 0,
      occ: 0,
      fame: reputation[code] ?? 55,
      inflation: economy[code]?.inflation ?? 0.0004,
      fx: economy[code]?.fx ?? 1,
    }
    cur.count++
    cur.rooms += h.rooms
    cur.revenue += h.lastDayRevenue
    cur.costs += h.lastDayCosts
    cur.net += hotelNet(h)
    cur.occ += h.lastDayOccupancy
    map.set(code, cur)
  }

  return [...map.values()]
    .map((c) => ({ ...c, occ: c.count ? c.occ / c.count : 0 }))
    .sort((a, b) => b.net - a.net)
}

export function makeNewsFromDay(args: {
  day: number
  events: WorldEvent[]
  hotels: Hotel[]
  net: number
  season: SeasonName
}): NewsItem[] {
  const items: NewsItem[] = []
  for (const ev of args.events) {
    items.push({
      id: `ev-${ev.id}`,
      day: args.day,
      title: ev.title,
      body: ev.description,
      tone: ev.demandMultiplier >= 1 ? 'good' : ev.demandMultiplier < 0.95 ? 'bad' : 'neutral',
    })
  }

  const withContract = args.hotels.filter((h) => h.contract).length
  if (withContract > 0) {
    items.push({
      id: `contracts-${args.day}`,
      day: args.day,
      title: 'Contratos de la IA',
      body: `Hoy hay ${withContract} hoteles con habitaciones reservadas por empresas, aerolíneas u otros grupos.`,
      tone: 'neutral',
    })
  }

  if (args.net > 0) {
    items.push({
      id: `net-good-${args.day}`,
      day: args.day,
      title: 'Buen día para Orbis',
      body: `El grupo gana dinero hoy. Temporada: ${args.season}.`,
      tone: 'good',
    })
  } else if (args.hotels.length > 0) {
    items.push({
      id: `net-bad-${args.day}`,
      day: args.day,
      title: 'Día difícil',
      body: 'Hoy el grupo gasta más de lo que cobra. Revisa hoteles en pérdidas.',
      tone: 'bad',
    })
  }

  const top = [...args.hotels].sort((a, b) => hotelNet(b) - hotelNet(a))[0]
  if (top && hotelNet(top) > 0) {
    items.push({
      id: `star-${args.day}`,
      day: args.day,
      title: 'Hotel estrella del día',
      body: `${top.name} en ${top.city} lidera las ganancias de hoy.`,
      tone: 'good',
    })
  }

  return items.slice(0, 6)
}

export function contractKindLabel(kind: ContractKind): string {
  const map: Record<ContractKind, string> = {
    empresa: 'Empresa',
    aerolinea: 'Aerolínea',
    evento: 'Evento',
    gobierno: 'Gobierno',
    deportes: 'Deportes',
    universidad: 'Universidad',
  }
  return map[kind]
}
