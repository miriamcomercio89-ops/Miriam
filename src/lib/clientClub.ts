import type { ClientSpecialize, GuestTarget, Hotel, HotelService } from '../types'
import { getSubsidiary } from '../data/subsidiaries'

export type ClientLevelPerk = {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  name: string
  points: number
  discount: number
  /** Texto corto de beneficio visible. */
  perk: string
  lateCheckoutDiscount: number
  earlyCheckinDiscount: number
  spaPointsDiscount: number
  breakfastRedeemBonus: boolean
  upgradeDiscount: number
}

export const CLIENT_LEVEL_PERKS: ClientLevelPerk[] = [
  { level: 1, name: 'Huésped', points: 0, discount: 0, perk: 'Acceso Club Huésped', lateCheckoutDiscount: 0, earlyCheckinDiscount: 0, spaPointsDiscount: 0, breakfastRedeemBonus: false, upgradeDiscount: 0 },
  { level: 2, name: 'Viajero', points: 200, discount: 0.02, perk: '−2% noche', lateCheckoutDiscount: 0.05, earlyCheckinDiscount: 0, spaPointsDiscount: 0, breakfastRedeemBonus: false, upgradeDiscount: 0 },
  { level: 3, name: 'Habitual', points: 600, discount: 0.04, perk: '−4% noche · late −5%', lateCheckoutDiscount: 0.1, earlyCheckinDiscount: 0.05, spaPointsDiscount: 10, breakfastRedeemBonus: false, upgradeDiscount: 0.05 },
  { level: 4, name: 'Preferente', points: 1_500, discount: 0.06, perk: '−6% · canje desayuno más barato', lateCheckoutDiscount: 0.15, earlyCheckinDiscount: 0.08, spaPointsDiscount: 15, breakfastRedeemBonus: true, upgradeDiscount: 0.08 },
  { level: 5, name: 'Elite', points: 3_500, discount: 0.08, perk: '−8% · upgrade −8%', lateCheckoutDiscount: 0.2, earlyCheckinDiscount: 0.1, spaPointsDiscount: 20, breakfastRedeemBonus: true, upgradeDiscount: 0.1 },
  { level: 6, name: 'Platinum', points: 7_000, discount: 0.1, perk: '−10% · late −20%', lateCheckoutDiscount: 0.25, earlyCheckinDiscount: 0.12, spaPointsDiscount: 25, breakfastRedeemBonus: true, upgradeDiscount: 0.12 },
  { level: 7, name: 'Diamond', points: 14_000, discount: 0.12, perk: '−12% · spa en puntos', lateCheckoutDiscount: 0.3, earlyCheckinDiscount: 0.15, spaPointsDiscount: 35, breakfastRedeemBonus: true, upgradeDiscount: 0.15 },
  { level: 8, name: 'Ambassador', points: 28_000, discount: 0.14, perk: '−14% · early −15%', lateCheckoutDiscount: 0.35, earlyCheckinDiscount: 0.2, spaPointsDiscount: 40, breakfastRedeemBonus: true, upgradeDiscount: 0.18 },
  { level: 9, name: 'Legend', points: 55_000, discount: 0.16, perk: '−16% · upgrade −18%', lateCheckoutDiscount: 0.4, earlyCheckinDiscount: 0.25, spaPointsDiscount: 50, breakfastRedeemBonus: true, upgradeDiscount: 0.22 },
  { level: 10, name: 'Imperial', points: 100_000, discount: 0.2, perk: '−20% · máxima prioridad', lateCheckoutDiscount: 0.5, earlyCheckinDiscount: 0.3, spaPointsDiscount: 60, breakfastRedeemBonus: true, upgradeDiscount: 0.25 },
]

export function clientPerkInfo(level: number): ClientLevelPerk {
  return CLIENT_LEVEL_PERKS.find((t) => t.level === level) ?? CLIENT_LEVEL_PERKS[0]
}

export const SPECIALIZE_LABEL: Record<ClientSpecialize, string> = {
  none: 'Sin especializar',
  spa: 'Wellness / spa',
  playa: 'Playa y sol',
  negocios: 'Negocios',
  aventura: 'Aventura',
  gastronomia: 'Gastronomía',
}

export function hotelSpecializeKind(hotel: Hotel): Exclude<ClientSpecialize, 'none'> {
  if (hotel.services.includes('spa') || hotel.target === 'wellness') return 'spa'
  if (hotel.beachScore >= 55 || hotel.target === 'playa' || hotel.services.includes('playa_privada')) return 'playa'
  if (hotel.target === 'negocios' || hotel.services.includes('coworking') || hotel.airportDesk) return 'negocios'
  if (hotel.target === 'aventura' || hotel.services.includes('buceo') || hotel.services.includes('golf')) return 'aventura'
  if (hotel.services.includes('restaurante') || hotel.restaurantLevel >= 2) return 'gastronomia'
  const sub = getSubsidiary(hotel.subsidiaryId)
  if (sub?.targets.includes('wellness')) return 'spa'
  if (sub?.targets.includes('playa')) return 'playa'
  if (sub?.targets.includes('negocios')) return 'negocios'
  return 'gastronomia'
}

export function specializeMatchesHotel(
  specialize: ClientSpecialize,
  hotel: Hotel,
): boolean {
  if (specialize === 'none') return false
  return hotelSpecializeKind(hotel) === specialize
}

/** Bonus al dormir en hotel alineado con tu especialización. */
export function specializeStayBonus(specialize: ClientSpecialize, hotel: Hotel): {
  pointsMult: number
  extraDiscount: number
} {
  if (!specializeMatchesHotel(specialize, hotel)) return { pointsMult: 1, extraDiscount: 0 }
  return { pointsMult: 1.25, extraDiscount: 0.03 }
}

export type PointRedeemId = 'noche' | 'desayuno' | 'spa' | 'upgrade'

export type PointRedeem = {
  id: PointRedeemId
  label: string
  detail: string
  points: number
  /** Requiere estar reserved o checked_in según id. */
  needsStay: 'reserved' | 'checked_in' | 'any'
  needsService?: HotelService
}

export const POINT_REDEEMS: PointRedeem[] = [
  {
    id: 'noche',
    label: 'Noche gratis',
    detail: 'Pone el precio de la reserva a 0 € antes del check-in.',
    points: 400,
    needsStay: 'reserved',
  },
  {
    id: 'desayuno',
    label: 'Desayuno de cortesía',
    detail: 'Crédito gastronómico + hambre/sed (o −20 pts si eres Preferente+).',
    points: 80,
    needsStay: 'checked_in',
  },
  {
    id: 'spa',
    label: 'Bono spa',
    detail: 'Sesión de circuito (requiere spa en el hotel).',
    points: 120,
    needsStay: 'checked_in',
    needsService: 'spa',
  },
  {
    id: 'upgrade',
    label: 'Upgrade habitación',
    detail: 'Pasa a la mejor categoría disponible sin pagar diferencia.',
    points: 200,
    needsStay: 'any',
  },
]

export function redeemPointsCost(id: PointRedeemId, level: number): number {
  const base = POINT_REDEEMS.find((r) => r.id === id)?.points ?? 9999
  const perk = clientPerkInfo(level)
  if (id === 'desayuno' && perk.breakfastRedeemBonus) return Math.max(40, base - 20)
  if (id === 'spa') return Math.max(50, base - perk.spaPointsDiscount)
  if (id === 'upgrade') return Math.max(100, Math.round(base * (1 - perk.upgradeDiscount * 0.5)))
  return base
}

export function prefsHint(prefs: GuestTarget[]): string {
  if (!prefs.length) return 'Sin preferencias'
  return prefs.join(', ')
}
