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
  SECURITY_OPTIONS,
  TECH_OPTIONS,
  BOARD_REGIMES,
  LOYALTY_TIERS,
} from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import { getSeason, seasonDemandMult, clamp, pseudoNoise, reputationKey, dayOfYear } from './economyCore'
import { getWeather } from './weather'
import { holidayCostMult, holidayDemandMult } from './holidays'
import { tickWearAndRenovate } from './loyalty'
import type { HotelInsurance, MapFilters } from '../types'

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
  hotel: Pick<
    Hotel,
    | 'stars'
    | 'tourismIndex'
    | 'beachScore'
    | 'target'
    | 'services'
    | 'subsidiaryId'
    | 'staffLevel'
    | 'buildQuality'
    | 'roomMix'
    | 'boardRegime'
  >,
  season: SeasonName,
): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)
  const quality = QUALITY_OPTIONS.find((q) => q.id === (hotel.buildQuality ?? 'bueno'))
  const mix = ROOM_MIX_OPTIONS.find((m) => m.id === (hotel.roomMix ?? 'estandar'))
  const board = BOARD_REGIMES.find((b) => b.id === (hotel.boardRegime ?? 'solo'))
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
  price *= board?.priceMult ?? 1
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

export function aiManageInsurance(hotel: Hotel, season: SeasonName): HotelInsurance | null {
  const existing = hotel.insurance
  const roll = pseudoNoise(hotel.id + 'ins', hotel.builtAtGameDay + Math.round(hotel.rooms))
  const risk = hotel.beachScore / 200 + (season === 'alta' ? 0.08 : 0) + hotel.stars * 0.01
  const wants = risk + roll * 0.2 > 0.35 || hotel.tourismIndex > 85
  if (!wants && !(existing?.active && roll < 0.7)) return null
  const daily = Math.round(hotel.rooms * (0.8 + hotel.stars * 0.35) * (1 + hotel.beachScore / 200))
  return { active: true, dailyCost: daily, cover: 0.35 + Math.min(0.4, hotel.stars * 0.05) }
}

/** VIP muy raro: ~0.15% de hoteles/día */
export function rollVipTonight(hotel: Hotel, day: number): boolean {
  const roll = pseudoNoise(hotel.id + 'vip', day)
  return roll < 0.0015
}

export function calcConstructionCost(draft: BuildDraft, loc: LocationInsight): number {
  const sub = getSubsidiary(draft.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === draft.staffLevel)!
  const mix = ROOM_MIX_OPTIONS.find((m) => m.id === draft.roomMix)!
  const quality = QUALITY_OPTIONS.find((q) => q.id === draft.buildQuality)!
  const green = GREEN_OPTIONS.find((g) => g.id === draft.greenLevel)!
  const security = SECURITY_OPTIONS.find((s) => s.id === draft.securityLevel)!
  const tech = TECH_OPTIONS.find((t) => t.id === draft.techLevel)!
  const board = BOARD_REGIMES.find((b) => b.id === draft.boardRegime)!

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
  const seaViewCost = draft.rooms * (draft.seaViewShare / 100) * 12_000
  const boardSetup = draft.rooms * board.dailyPerRoom * 40
  const extras =
    (draft.buffet ? 80_000 : 0) +
    (draft.lateCheckout ? 25_000 : 0) +
    (draft.airportDesk ? 60_000 : 0) +
    (draft.breakfastIncluded || draft.boardRegime !== 'solo' ? 55_000 : 0) +
    (draft.loyaltyProgram ? 40_000 : 0) +
    (draft.quietHours ? 15_000 : 0) +
    (draft.bikeRental ? 35_000 : 0) +
    (draft.shuttleCity ? 70_000 : 0) +
    draft.openingPromoDays * 8_000

  const landPremium = 400_000 * loc.costIndex
  const tourismLand = 250_000 * (loc.tourismIndex / 100)
  const subMult = sub?.costMultiplier ?? 1
  const starMult = 1 + (draft.stars - 3) * 0.12

  return Math.round(
    (roomsCost +
      servicesCost +
      floorsCost +
      meetingCost +
      parkingCost +
      restaurantCost +
      seaViewCost +
      boardSetup +
      extras +
      landPremium +
      tourismLand) *
      subMult *
      staff.costMultiplier *
      mix.costMult *
      quality.costMult *
      green.costMult *
      security.costMult *
      tech.costMult *
      board.costMult *
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
    lastDayTax: 0,
    lifetimeRevenue: 0,
    lifetimeCosts: 0,
    lifetimeGuests: 0,
    lifetimeTax: 0,
    satisfaction: clamp(55 + reputation * 0.35, 40, 95),
    contract: null,
    insurance: null,
    roomMix: draft.roomMix,
    buildQuality: draft.buildQuality,
    floors: draft.floors,
    greenLevel: draft.greenLevel,
    meetingRooms: draft.meetingRooms,
    parkingSpots: draft.parkingSpots,
    restaurantLevel: draft.restaurantLevel,
    openingPromoDays: draft.openingPromoDays,
    securityLevel: draft.securityLevel,
    techLevel: draft.techLevel,
    breakfastIncluded: draft.breakfastIncluded || draft.boardRegime !== 'solo',
    seaViewShare: draft.seaViewShare,
    loyaltyProgram: draft.loyaltyProgram,
    vipTonight: false,
    lastVipDay: 0,
    boardRegime: draft.boardRegime,
    availableRegimes: [...draft.availableRegimes],
    condition: 100,
    lastRenovationDay: 0,
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
  loyaltyLevel = 1,
) {
  return simulateHotelDay(
    draftToTempHotel(draft, loc, gameMinutes, reputation),
    events,
    gameMinutes,
    reputation,
    economy,
    1,
    loyaltyLevel,
  )
}

export type DayResult = {
  occupancy: number
  revenue: number
  costs: number
  tax: number
  net: number
  guests: number
  price: number
  satisfaction: number
  season: SeasonName
  contract: CorporateContract | null
  insurance: HotelInsurance | null
  vipTonight: boolean
}

export function simulateHotelDay(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
  economy?: CountryEconomy,
  gameDayNow = 1,
  loyaltyLevel = 1,
): DayResult {
  const season = getSeason(hotel.lat, gameMinutes)
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const contract = hotel.id === 'temp' ? hotel.contract : aiManageContract(hotel, season)
  const insurance = hotel.id === 'temp' ? hotel.insurance : aiManageInsurance(hotel, season)
  const vipTonight = hotel.id === 'temp' ? false : rollVipTonight(hotel, gameDayNow)
  const board = BOARD_REGIMES.find((b) => b.id === (hotel.boardRegime ?? 'solo'))
  const loyalty = LOYALTY_TIERS.find((t) => t.level === loyaltyLevel) ?? LOYALTY_TIERS[0]
  let price = hotel.id === 'temp' ? hotel.pricePerNight : aiAdjustPrice(hotel, season)

  const fx = economy?.fx ?? 1
  const inflation = economy?.inflation ?? 0
  price = Math.round(price * fx * (board?.priceMult ?? 1) ** 0.15)
  if (vipTonight) price = Math.round(price * 1.35)

  const blocked = contract ? Math.min(contract.blockedRooms, hotel.rooms - 1) : 0
  const openRooms = Math.max(1, hotel.rooms - blocked)
  const holidayDemand = holidayDemandMult(gameMinutes, hotel.geoRegion, hotel.countryCode)
  const holidayCost = holidayCostMult(gameMinutes, hotel.geoRegion, hotel.countryCode)
  const conditionMod = 0.82 + ((hotel.condition ?? 100) / 100) * 0.2

  let occupancyOpen = calcOccupancy(
    { ...hotel, pricePerNight: price, rooms: openRooms },
    events,
    season,
    reputation,
  )
  occupancyOpen = clamp(
    occupancyOpen *
      weather.demandMult *
      holidayDemand *
      conditionMod *
      (1 + (board?.demandBonus ?? 0)) *
      (hotel.loyaltyProgram ? 1 + loyalty.demandBonus : 1),
    0.08,
    0.98,
  )
  if ((hotel.openingPromoDays ?? 0) > 0) occupancyOpen = clamp(occupancyOpen * 1.08, 0.08, 0.98)
  if (hotel.breakfastIncluded || (hotel.boardRegime && hotel.boardRegime !== 'solo')) {
    occupancyOpen = clamp(occupancyOpen * 1.015, 0.08, 0.98)
  }
  if (hotel.seaViewShare > 20) occupancyOpen = clamp(occupancyOpen * (1 + hotel.seaViewShare / 2000), 0.08, 0.98)
  if (vipTonight) occupancyOpen = clamp(occupancyOpen * 1.12, 0.08, 0.98)

  const contractRevenue = blocked * (contract?.ratePerNight ?? 0) * fx
  const openRevenue = Math.round(openRooms * occupancyOpen * price)
  let revenue = Math.round(contractRevenue + openRevenue)
  if (vipTonight) revenue = Math.round(revenue * 1.25)

  const occupancy = (blocked + openRooms * occupancyOpen) / hotel.rooms
  const tax = Math.round(revenue * hotel.taxRate)
  let costs = calcDailyCosts(hotel, events, revenue, blocked, inflation, insurance)
  costs = Math.round(costs * weather.costMult * holidayCost * fx)
  const guests = Math.round(blocked + openRooms * occupancyOpen)
  const security = SECURITY_OPTIONS.find((s) => s.id === (hotel.securityLevel ?? 'medio'))
  const tech = TECH_OPTIONS.find((t) => t.id === (hotel.techLevel ?? 'basico'))
  const satisfactionDelta =
    occupancy * 8 +
    (hotel.stars - 3) * 0.8 -
    (costs > revenue ? 2 : 0) +
    (contract ? 0.5 : 0) +
    (weather.demandMult - 1) * 4 +
    (vipTonight ? 6 : 0) +
    ((hotel.condition ?? 100) - 70) * 0.05 +
    (security?.demandBonus ?? 0) * 20 +
    (tech?.demandBonus ?? 0) * 15
  const satisfaction = clamp(hotel.satisfaction * 0.92 + satisfactionDelta, 20, 99)

  return {
    occupancy,
    revenue,
    costs,
    tax,
    net: revenue - costs,
    guests,
    price,
    satisfaction,
    season,
    contract,
    insurance,
    vipTonight,
  }
}

export function applyHotelDayInPlace(
  hotel: Hotel,
  events: WorldEvent[],
  gameMinutes: number,
  reputation: number,
  economy?: CountryEconomy,
  gameDayNow = 1,
  loyaltyLevel = 1,
): { net: number; renovationCost: number } {
  const result = simulateHotelDay(hotel, events, gameMinutes, reputation, economy, gameDayNow, loyaltyLevel)
  hotel.pricePerNight = result.price
  hotel.contract = result.contract
  hotel.insurance = result.insurance
  hotel.vipTonight = result.vipTonight
  if (result.vipTonight) hotel.lastVipDay = gameDayNow
  hotel.lastDayRevenue = result.revenue
  hotel.lastDayCosts = result.costs
  hotel.lastDayOccupancy = result.occupancy
  hotel.lastDayTax = result.tax
  hotel.lifetimeRevenue += result.revenue
  hotel.lifetimeCosts += result.costs
  hotel.lifetimeGuests += result.guests
  hotel.lifetimeTax += result.tax
  hotel.satisfaction = result.satisfaction
  if (hotel.openingPromoDays > 0) hotel.openingPromoDays -= 1
  const renovationCost = hotel.id === 'temp' ? 0 : tickWearAndRenovate(hotel, gameDayNow)
  return { net: result.net - renovationCost, renovationCost }
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

  const security = SECURITY_OPTIONS.find((s) => s.id === (hotel.securityLevel ?? 'medio'))
  const tech = TECH_OPTIONS.find((t) => t.id === (hotel.techLevel ?? 'basico'))

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
    (security?.demandBonus ?? 0) +
    (tech?.demandBonus ?? 0) +
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
  insurance: HotelInsurance | null,
): number {
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const green = GREEN_OPTIONS.find((g) => g.id === (hotel.greenLevel ?? 'ninguno'))
  const security = SECURITY_OPTIONS.find((s) => s.id === (hotel.securityLevel ?? 'medio'))
  const tech = TECH_OPTIONS.find((t) => t.id === (hotel.techLevel ?? 'basico'))
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
  const securityDaily = hotel.rooms * (security?.daily ?? 0.9)
  const techDaily = hotel.rooms * (tech?.id === 'futuro' ? 2.2 : tech?.id === 'moderno' ? 1.1 : 0.4)
  const board = BOARD_REGIMES.find((b) => b.id === (hotel.boardRegime ?? 'solo'))
  const boardDaily = hotel.rooms * (board?.dailyPerRoom ?? 0)
  const conditionMaint = hotel.rooms * (2.5 + (100 - (hotel.condition ?? 100)) * 0.08)
  const extrasDaily =
    (hotel.breakfastIncluded && (hotel.boardRegime ?? 'solo') === 'solo' ? hotel.rooms * 2.5 : 0) +
    (hotel.loyaltyProgram ? 120 : 0) +
    hotel.rooms * (hotel.seaViewShare / 100) * 0.8
  const contractAdmin = blockedRooms * 4
  const insuranceCost = insurance?.active ? insurance.dailyCost : 0
  const tax = revenue * hotel.taxRate
  let total =
    payroll +
    serviceDaily +
    maintenance +
    utilities +
    floorsCost +
    meetingCost +
    parkingCost +
    securityDaily +
    techDaily +
    boardDaily +
    conditionMaint +
    extrasDaily +
    insuranceCost +
    tax +
    contractAdmin
  total *= 1 - (green?.costSave ?? 0)
  total *= 1 + inflation

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!eventApplies(ev, hotel, 'media')) continue
    let mult = ev.costMultiplier
    if (mult > 1 && insurance?.active) {
      mult = 1 + (mult - 1) * (1 - insurance.cover)
    }
    total *= mult
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

export function filterHotels(hotels: Hotel[], filters: MapFilters, gameDay = 1): Hotel[] {
  const out: Hotel[] = []
  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]
    if (filters.subsidiaryId !== 'all' && h.subsidiaryId !== filters.subsidiaryId) continue
    if (h.stars < filters.minStars) continue
    if (filters.countryCode !== 'all' && h.countryCode.toUpperCase() !== filters.countryCode.toUpperCase()) continue
    if (filters.insured === 'yes' && !h.insurance?.active) continue
    if (filters.insured === 'no' && h.insurance?.active) continue
    if (filters.vipRecent && !h.vipTonight && (h.lastVipDay ?? 0) < gameDay - 14) continue
    if (filters.lowCondition && (h.condition ?? 100) >= 60) continue
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
      tax: number
      taxRate: number
      lifetimeTax: number
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
      tax: 0,
      taxRate: h.taxRate,
      lifetimeTax: 0,
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
    cur.tax += h.lastDayTax ?? 0
    cur.lifetimeTax += h.lifetimeTax ?? 0
    cur.taxRate = h.taxRate
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
  dayTax?: number
  bankInterest?: number
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

  const insured = args.hotels.filter((h) => h.insurance?.active).length
  if (insured > 0 && args.day % 3 === 0) {
    items.push({
      id: `ins-${args.day}`,
      day: args.day,
      title: 'Seguros Orbis (IA)',
      body: `La IA mantiene seguro activo en ${insured} hoteles para cubrir imprevistos.`,
      tone: 'neutral',
    })
  }

  const vips = args.hotels.filter((h) => h.vipTonight)
  for (const h of vips.slice(0, 2)) {
    items.push({
      id: `vip-${h.id}-${args.day}`,
      day: args.day,
      title: 'Huésped VIP',
      body: `Una visita muy especial en ${h.name} (${h.city}). Sube el prestigio y los ingresos de hoy.`,
      tone: 'good',
    })
  }

  if ((args.dayTax ?? 0) > 0 && args.day % 2 === 0) {
    items.push({
      id: `tax-${args.day}`,
      day: args.day,
      title: 'Impuestos del día',
      body: `El grupo ha pagado impuestos en los países donde opera.`,
      tone: 'neutral',
    })
  }

  if ((args.bankInterest ?? 0) > 0) {
    items.push({
      id: `bank-${args.day}`,
      day: args.day,
      title: 'Banco Orbis',
      body: `Tus depósitos a plazo han generado intereses hoy.`,
      tone: 'good',
    })
  }

  const topTaxCountry = [...args.hotels]
    .reduce<Record<string, { name: string; tax: number }>>((acc, h) => {
      const k = h.countryCode
      acc[k] = acc[k] ?? { name: h.country, tax: 0 }
      acc[k].tax += h.lastDayTax ?? 0
      return acc
    }, {})
  const taxRows = Object.values(topTaxCountry).sort((a, b) => b.tax - a.tax)
  if (taxRows[0] && taxRows[0].tax > 0 && args.day % 4 === 0) {
    items.push({
      id: `tax-country-${args.day}`,
      day: args.day,
      title: `Impuestos en ${taxRows[0].name}`,
      body: `Hoy ese país concentra la mayor factura fiscal del grupo.`,
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

  const lowOcc = [...args.hotels].sort((a, b) => a.lastDayOccupancy - b.lastDayOccupancy)[0]
  if (lowOcc && lowOcc.lastDayOccupancy > 0 && lowOcc.lastDayOccupancy < 0.35 && args.day % 3 === 1) {
    items.push({
      id: `empty-${args.day}`,
      day: args.day,
      title: 'Hotel casi vacío',
      body: `${lowOcc.name} en ${lowOcc.city} tiene pocas habitaciones llenas. La IA bajará el precio.`,
      tone: 'bad',
    })
  }

  return items.slice(0, 10)
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

/** Depósitos a plazo del Banco Orbis */
export const BANK_TERMS = [
  { days: 7, dailyRate: 0.00045, label: '7 días' },
  { days: 30, dailyRate: 0.0007, label: '30 días' },
  { days: 90, dailyRate: 0.00095, label: '90 días' },
] as const

export function tickBankDeposits(
  deposits: import('../types').BankDeposit[],
  cash: number,
  _day: number,
): { deposits: import('../types').BankDeposit[]; cash: number; interestPaid: number } {
  let nextCash = cash
  let interestPaid = 0
  const next: import('../types').BankDeposit[] = []
  for (const d of deposits) {
    const interest = Math.round(d.amount * d.dailyRate)
    interestPaid += interest
    const amount = d.amount + interest
    const daysLeft = d.daysLeft - 1
    if (daysLeft <= 0) {
      nextCash += amount
    } else {
      next.push({ ...d, amount, daysLeft })
    }
  }
  return { deposits: next, cash: nextCash, interestPaid }
}
