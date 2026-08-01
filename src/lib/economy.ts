import { SERVICE_CATALOG, STAFF_OPTIONS } from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import type { BuildDraft, Hotel, LocationInsight, WorldEvent } from '../types'

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

export function estimateDaily(draft: BuildDraft, loc: LocationInsight, events: WorldEvent[]) {
  const fakeHotel = draftToTempHotel(draft, loc)
  return simulateHotelDay(fakeHotel, events)
}

function draftToTempHotel(draft: BuildDraft, loc: LocationInsight): Hotel {
  return {
    id: 'temp',
    name: draft.name,
    subsidiaryId: draft.subsidiaryId,
    lat: loc.lat,
    lng: loc.lng,
    stars: draft.stars,
    rooms: draft.rooms,
    pricePerNight: draft.pricePerNight,
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
    builtAtGameDay: 0,
    constructionCost: 0,
    lastDayRevenue: 0,
    lastDayCosts: 0,
    lastDayOccupancy: 0,
    lifetimeRevenue: 0,
    lifetimeCosts: 0,
    lifetimeGuests: 0,
  }
}

export function simulateHotelDay(hotel: Hotel, events: WorldEvent[]) {
  const occupancy = calcOccupancy(hotel, events)
  const revenue = Math.round(hotel.rooms * occupancy * hotel.pricePerNight)
  const costs = Math.round(calcDailyCosts(hotel, events, revenue))
  const guests = Math.round(hotel.rooms * occupancy)
  return { occupancy, revenue, costs, net: revenue - costs, guests }
}

export function calcOccupancy(hotel: Hotel, events: WorldEvent[]): number {
  const sub = getSubsidiary(hotel.subsidiaryId)
  const staff = STAFF_OPTIONS.find((s) => s.id === hotel.staffLevel)!
  const serviceBonus = hotel.services.reduce((sum, id) => {
    const s = SERVICE_CATALOG.find((x) => x.id === id)
    return sum + (s?.demandBonus ?? 0)
  }, 0)

  let demand =
    0.42 +
    hotel.tourismIndex / 220 +
    hotel.stars * 0.035 +
    serviceBonus +
    staff.demandBonus +
    (sub?.demandBonus ?? 0)

  // Beach / specialty fit
  if (sub) {
    demand += sub.beachAffinity * (hotel.beachScore / 100) * 0.2
    if (sub.targets.includes(hotel.target)) demand += 0.04
    else demand -= 0.03
  }

  // Price sensitivity vs stars
  const fairPrice = 60 + hotel.stars * 55 + hotel.tourismIndex * 1.2 + hotel.beachScore * 0.8
  const priceRatio = hotel.pricePerNight / Math.max(40, fairPrice)
  if (priceRatio > 1) demand -= Math.min(0.35, (priceRatio - 1) * 0.35)
  else demand += Math.min(0.12, (1 - priceRatio) * 0.2)

  // Target niches
  if (hotel.target === 'playa') demand += hotel.beachScore / 400
  if (hotel.target === 'negocios') demand += hotel.tourismIndex > 60 ? 0.03 : -0.02
  if (hotel.target === 'wellness' && hotel.services.includes('spa')) demand += 0.03
  if (hotel.target === 'familiar' && hotel.services.includes('kids_club')) demand += 0.03

  // Events
  for (const ev of events) {
    if (!eventApplies(ev, hotel)) continue
    demand *= ev.demandMultiplier
  }

  // Soft randomness for life-like variance (±4%)
  const jitter = 1 + pseudoNoise(hotel.id, hotel.lastDayRevenue) * 0.08 - 0.04
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

function eventApplies(ev: WorldEvent, hotel: Hotel): boolean {
  if (ev.scope === 'global') return true
  if (ev.scope === 'coastal') return hotel.beachScore >= 45
  if (ev.scope === 'business') return hotel.target === 'negocios' || hotel.subsidiaryId.includes('business') || hotel.subsidiaryId.includes('congress')
  if (ev.scope === 'wellness') return hotel.target === 'wellness' || hotel.services.includes('spa') || hotel.services.includes('yoga')
  if (ev.scope === 'tourism-high') return hotel.tourismIndex >= 65
  if (ev.scope.length === 2) return hotel.countryCode.toLowerCase() === ev.scope.toLowerCase()
  return true
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pseudoNoise(id: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}

export function aggregatePortfolio(hotels: Hotel[]) {
  const revenue = hotels.reduce((s, h) => s + h.lastDayRevenue, 0)
  const costs = hotels.reduce((s, h) => s + h.lastDayCosts, 0)
  const rooms = hotels.reduce((s, h) => s + h.rooms, 0)
  const occ =
    hotels.length === 0
      ? 0
      : hotels.reduce((s, h) => s + h.lastDayOccupancy, 0) / hotels.length
  return { revenue, costs, net: revenue - costs, rooms, occupancy: occ, count: hotels.length }
}
