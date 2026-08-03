import type { BoardRegime, Hotel, LoyaltyLevel, WeeklyReport } from '../types'
import { BOARD_REGIMES, LOYALTY_TIERS } from '../data/catalog'
import { clamp, pseudoNoise } from './economyCore'

function netOf(h: Hotel) {
  return h.lastDayRevenue - h.lastDayCosts
}

export function boardLabel(id: BoardRegime): string {
  return BOARD_REGIMES.find((b) => b.id === id)?.label ?? id
}

export function loyaltyFromPoints(points: number): LoyaltyLevel {
  let level: LoyaltyLevel = 1
  for (const t of LOYALTY_TIERS) {
    if (points >= t.points) level = t.level
  }
  return level
}

export function loyaltyInfo(level: LoyaltyLevel) {
  return LOYALTY_TIERS.find((t) => t.level === level) ?? LOYALTY_TIERS[0]
}

export function nextLoyaltyTier(level: LoyaltyLevel) {
  return LOYALTY_TIERS.find((t) => t.level === ((level + 1) as LoyaltyLevel)) ?? null
}

/** Desgaste diario + posible reforma IA. Devuelve coste de reforma. */
export function tickWearAndRenovate(hotel: Hotel, gameDayNow: number): number {
  const ageDays = Math.max(0, gameDayNow - hotel.builtAtGameDay)
  const wear = 0.04 + Math.min(0.12, ageDays / 20000) + hotel.stars * 0.005
  hotel.condition = clamp((hotel.condition ?? 100) - wear, 15, 100)

  const roll = pseudoNoise(hotel.id + 'reno', gameDayNow)
  const needs = hotel.condition < 58 || (hotel.condition < 72 && ageDays > 900)
  const wants = needs && roll < (hotel.condition < 40 ? 0.55 : 0.22)
  if (!wants) return 0

  const cost = Math.round(
    hotel.rooms * (280 + hotel.stars * 90) * hotel.costIndex * (hotel.buildQuality === 'lujo' ? 1.35 : 1),
  )
  hotel.condition = clamp(hotel.condition + 28 + roll * 18, 40, 100)
  hotel.lastRenovationDay = gameDayNow
  hotel.lifetimeCosts += cost
  hotel.lastDayCosts += cost
  return cost
}

export function makeWeeklyReport(args: {
  day: number
  hotels: Hotel[]
  bankBalance: number
  renovations: number
}): WeeklyReport {
  const byCountry = new Map<string, { name: string; net: number }>()
  let worst: Hotel | null = null
  let occSum = 0
  let tax = 0
  for (const h of args.hotels) {
    const net = netOf(h)
    tax += h.lastDayTax ?? 0
    occSum += h.lastDayOccupancy
    const cur = byCountry.get(h.countryCode) ?? { name: h.country, net: 0 }
    cur.net += net
    byCountry.set(h.countryCode, cur)
    if (!worst || net < netOf(worst)) worst = h
  }
  const countries = [...byCountry.values()].sort((a, b) => b.net - a.net)
  const best = countries[0]
  const avgOcc = args.hotels.length ? occSum / args.hotels.length : 0
  const summary = best
    ? `Mejor país: ${best.name}. Peor hotel: ${worst?.name ?? '—'}. Impuestos del día y estado del banco incluidos.`
    : 'Aún no hay hoteles que informar.'

  return {
    id: `week-${args.day}`,
    day: args.day,
    bestCountry: best?.name ?? '—',
    bestCountryNet: best?.net ?? 0,
    worstHotel: worst ? `${worst.name} (${worst.city})` : '—',
    worstHotelNet: worst ? netOf(worst) : 0,
    dayTax: tax,
    bankBalance: args.bankBalance,
    hotelCount: args.hotels.length,
    avgOccupancy: avgOcc,
    renovations: args.renovations,
    summary,
  }
}

export function buildGlobalStats(hotels: Hotel[]) {
  let revenue = 0
  let costs = 0
  let tax = 0
  let occ = 0
  let rooms = 0
  let insured = 0
  let renovating = 0
  const byRegime: Record<string, number> = {}
  for (const h of hotels) {
    revenue += h.lastDayRevenue
    costs += h.lastDayCosts
    tax += h.lastDayTax ?? 0
    occ += h.lastDayOccupancy
    rooms += h.rooms
    if (h.insurance?.active) insured++
    if ((h.condition ?? 100) < 60) renovating++
    const r = h.boardRegime ?? 'solo'
    byRegime[r] = (byRegime[r] ?? 0) + 1
  }
  const n = hotels.length || 1
  return {
    count: hotels.length,
    rooms,
    revenue,
    costs,
    net: revenue - costs,
    tax,
    avgOccupancy: hotels.length ? occ / n : 0,
    insured,
    lowCondition: renovating,
    byRegime,
    lifetimeTax: hotels.reduce((s, h) => s + (h.lifetimeTax ?? 0), 0),
    lifetimeGuests: hotels.reduce((s, h) => s + h.lifetimeGuests, 0),
  }
}
