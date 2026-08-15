import { brandById } from '../data/brands'
import { nearestCity } from '../data/cities'
import type { Restaurant, WorldCity } from '../types'

export function foundCost(brandId: string, city: WorldCity, upgrades: string[]): number {
  const b = brandById(brandId)
  let cost = b.foundCost * city.col
  if (upgrades.includes('dark') && ['street', 'noodle', 'burger'].includes(brandId)) cost *= 0.85
  if (city.popM < 0.05) cost *= 0.72
  return Math.round(cost)
}

export function dailyPnl(
  r: Restaurant,
  city: WorldCity,
  upgrades: string[],
  competition: number,
): { covers: number; rev: number; cost: number; net: number } {
  if (r.closed) return { covers: 0, rev: 0, cost: 18 * city.col, net: -18 * city.col }
  const b = brandById(r.brandId)
  const quality = Math.min(100, r.quality + (upgrades.includes('academia') ? 4 : 0) + r.stars * 3)
  const qMult = 0.55 + quality / 140
  const tour = 0.55 + city.tourism / 180
  const pop = Math.min(1.45, 0.55 + Math.log10(city.popM * 1000 + 8) / 4)
  const brandFit = brandCityFit(b.id, city)
  const demand = 42 * pop * tour * brandFit * qMult * (0.55 + Math.random() * 0.18)
  const pressure = Math.max(0.42, 1 - competition * 0.18)
  const turns = 2.15 + (upgrades.includes('delivery') ? 0.35 : 0) + (b.id === 'cafe' || b.id === 'bakery' ? 0.5 : 0)
  const cap = r.seats * turns
  const covers = Math.max(4, Math.min(cap, demand * pressure))
  const ticket = b.ticket * city.col * (0.92 + quality / 400) * (1 + r.stars * 0.08)
  const rev = covers * ticket
  const food = rev * (b.foodPct - (upgrades.includes('compras') ? 0.08 : 0))
  const wages = r.seats * b.wagePerSeat * city.col
  const rent = b.foundCost * 0.00055 * city.col * (1 + competition * 0.15)
  const cost = food + wages + rent + 40 * city.col
  const net = rev - cost
  return { covers, rev, cost, net }
}

function brandCityFit(brandId: string, city: WorldCity): number {
  const cc = city.cc
  if (brandId === 'tasca' || brandId === 'tapas') return cc === 'ES' || cc === 'PT' || cc === 'AR' || cc === 'MX' ? 1.22 : 0.86
  if (brandId === 'sushi') return ['JP', 'US', 'SG', 'HK', 'KR', 'AU'].includes(cc) ? 1.2 : city.col > 1.1 ? 1.05 : 0.82
  if (brandId === 'fine') return city.tourism > 80 && city.col > 0.9 ? 1.18 : 0.7
  if (brandId === 'vegan') return city.col > 1.05 || ['DE', 'GB', 'NL', 'US', 'AU', 'SE'].includes(cc) ? 1.16 : 0.84
  if (brandId === 'street') return city.popM > 1 ? 1.15 : 1
  if (brandId === 'bbq') return ['US', 'AR', 'BR', 'AU', 'MX'].includes(cc) ? 1.18 : 0.9
  return 1
}

export function competitionAt(lat: number, lng: number, all: Restaurant[], extraOsm = 0): number {
  let n = extraOsm * 0.15
  for (const r of all) {
    if (r.closed) continue
    const d = (r.lat - lat) ** 2 + (r.lng - lng) ** 2
    if (d < 0.0008) n += 1
    else if (d < 0.004) n += 0.35
  }
  return Math.min(6, n)
}

export function cityOfRestaurant(r: Restaurant): WorldCity {
  return nearestCity(r.lat, r.lng)
}

export function spiralPoint(lat: number, lng: number, index: number): { lat: number; lng: number } {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const r = 0.0065 * Math.sqrt(index + 1) * (1 + (index % 5) * 0.12)
  const a = index * golden
  const dLat = r * Math.cos(a)
  const dLng = (r * Math.sin(a)) / Math.max(0.25, Math.cos((lat * Math.PI) / 180))
  return { lat: lat + dLat, lng: lng + dLng }
}
