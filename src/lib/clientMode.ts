import { BOARD_REGIMES, SERVICE_CATALOG } from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import type {
  BoardRegime,
  ClientModeState,
  ClientNeedId,
  ClientNeeds,
  ClientRoomKind,
  ClientStay,
  GuestTarget,
  Hotel,
  HotelService,
} from '../types'

/** % de los ingresos del día del hotel donde te alojas → monedero cliente. */
export const CLIENT_CEO_CUT = 0.005
export const CLIENT_NIGHT_POINTS = 120
export const CLIENT_START_WALLET = 25_000

export const CLIENT_NEED_IDS: ClientNeedId[] = [
  'hambre',
  'sed',
  'energia',
  'sueno',
  'relax',
  'social',
  'higiene',
  'humor',
  'confort',
  'seguridad',
]

export const CLIENT_NEED_LABEL: Record<ClientNeedId, string> = {
  hambre: 'Hambre',
  sed: 'Sed',
  energia: 'Energía',
  sueno: 'Sueño',
  relax: 'Relax',
  social: 'Social',
  higiene: 'Higiene',
  humor: 'Humor',
  confort: 'Confort',
  seguridad: 'Seguridad',
}

export const CLIENT_LEVELS = [
  { level: 1, name: 'Huésped', points: 0, discount: 0 },
  { level: 2, name: 'Viajero', points: 200, discount: 0.02 },
  { level: 3, name: 'Habitual', points: 600, discount: 0.04 },
  { level: 4, name: 'Preferente', points: 1_500, discount: 0.06 },
  { level: 5, name: 'Elite', points: 3_500, discount: 0.08 },
  { level: 6, name: 'Platinum', points: 7_000, discount: 0.1 },
  { level: 7, name: 'Diamond', points: 14_000, discount: 0.12 },
  { level: 8, name: 'Ambassador', points: 28_000, discount: 0.14 },
  { level: 9, name: 'Legend', points: 55_000, discount: 0.16 },
  { level: 10, name: 'Imperial', points: 100_000, discount: 0.2 },
] as const

export function defaultClientNeeds(): ClientNeeds {
  return {
    hambre: 55,
    sed: 55,
    energia: 70,
    sueno: 65,
    relax: 50,
    social: 45,
    higiene: 60,
    humor: 60,
    confort: 55,
    seguridad: 70,
  }
}

export function defaultClientState(): ClientModeState {
  return {
    name: 'Viajero Orbis',
    prefs: [],
    wallet: CLIENT_START_WALLET,
    points: 0,
    level: 1,
    needs: defaultClientNeeds(),
    stay: null,
    passport: [],
    notifications: [],
    totalNights: 0,
    bookingHotelId: null,
  }
}

export function clientLevelFromPoints(points: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
  let lvl: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 1
  for (const t of CLIENT_LEVELS) {
    if (points >= t.points) lvl = t.level
  }
  return lvl
}

export function clientLevelInfo(level: number) {
  return CLIENT_LEVELS.find((t) => t.level === level) ?? CLIENT_LEVELS[0]
}

export function roomKindsForHotel(hotel: Hotel): { id: ClientRoomKind; label: string; mult: number }[] {
  const kinds: { id: ClientRoomKind; label: string; mult: number }[] = [
    { id: 'estandar', label: 'Habitación estándar', mult: 1 },
  ]
  if (hotel.roomMix === 'familiar' || hotel.roomMix === 'mixto' || hotel.target === 'familiar') {
    kinds.push({ id: 'familiar', label: 'Habitación familiar', mult: 1.18 })
  }
  if (hotel.roomMix === 'suites' || hotel.roomMix === 'mixto' || hotel.stars >= 4) {
    kinds.push({ id: 'suite', label: 'Suite', mult: 1.55 })
  }
  if (hotel.seaViewShare >= 15 || hotel.beachScore >= 50) {
    kinds.push({ id: 'vista_mar', label: 'Vista al mar', mult: 1.35 })
  }
  return kinds
}

export function boardOptionsForHotel(hotel: Hotel): BoardRegime[] {
  if (hotel.availableRegimes?.length) return hotel.availableRegimes
  return [hotel.boardRegime ?? 'solo']
}

export function calcGuestNightPrice(
  hotel: Hotel,
  room: ClientRoomKind,
  board: BoardRegime,
  level: number,
): number {
  const roomMult = roomKindsForHotel(hotel).find((r) => r.id === room)?.mult ?? 1
  const boardMult = BOARD_REGIMES.find((b) => b.id === board)?.priceMult ?? 1
  const disc = clientLevelInfo(level).discount
  // Pareja: ×1.7 (no ×2: cama compartida)
  const pair = 1.7
  const raw = hotel.pricePerNight * roomMult * boardMult * pair
  return Math.max(40, Math.round(raw * (1 - disc)))
}

export function hotelHasFreeRoom(hotel: Hotel): boolean {
  if (hotel.closed) return false
  const occ = hotel.lastDayOccupancy || 0.5
  const free = Math.floor(hotel.rooms * (1 - Math.min(0.99, occ)))
  return free >= 1 || occ < 0.97
}

export function visibleClientServices(hotel: Hotel): HotelService[] {
  return hotel.services.filter((id) => SERVICE_CATALOG.some((s) => s.id === id))
}

type NeedDelta = Partial<Record<ClientNeedId, number>>

const SERVICE_EFFECTS: Partial<Record<HotelService, NeedDelta>> = {
  restaurante: { hambre: 35, sed: 15, social: 8, humor: 5 },
  bar_azotea: { sed: 20, social: 18, relax: 8, humor: 10, energia: -5 },
  all_inclusive: { hambre: 40, sed: 30, humor: 12, confort: 8 },
  spa: { relax: 40, higiene: 15, energia: 10, sueno: 8 },
  sauna: { relax: 25, higiene: 10, energia: -5 },
  piscina: { relax: 20, social: 10, energia: -8, higiene: -5 },
  gimnasio: { energia: -15, hambre: -10, humor: 12, confort: 5 },
  yoga: { relax: 28, energia: 8, humor: 10 },
  kids_club: { social: 15, humor: 10, energia: -5 },
  playa_privada: { relax: 30, social: 12, energia: -10, higiene: -8 },
  buceo: { energia: -20, social: 15, humor: 18, hambre: -10 },
  golf: { social: 12, energia: -15, relax: 10 },
  casino: { social: 20, humor: 15, energia: -10, sed: -8 },
  coworking: { social: -5, energia: -10, confort: 5 },
  room_service_24h: { hambre: 28, sed: 15, confort: 12, energia: 5 },
  concierge: { confort: 15, seguridad: 10, humor: 8 },
  lavanderia: { higiene: 20, confort: 8 },
  transfer_aeropuerto: { confort: 10, seguridad: 8, energia: 5 },
  tienda: { humor: 8, confort: 5 },
  biblioteca: { relax: 18, social: -5, energia: 5 },
  medico: { seguridad: 25, energia: 10, humor: 5 },
  cine: { social: 10, relax: 15, humor: 12 },
  jardines: { relax: 15, humor: 8 },
  mirador: { relax: 20, social: 8, humor: 12 },
  pista_padel: { energia: -18, social: 15, humor: 12, hambre: -8 },
  guarderia_noche: { social: 5, relax: 15, energia: 10 },
  wifi_premium: { confort: 5 },
  parking: { confort: 5, seguridad: 5 },
  helipuerto: { confort: 20, humor: 15 },
  boda: { social: 25, humor: 15 },
  teatro: { social: 18, humor: 20, relax: 8 },
  mascotas: { social: 10, humor: 12 },
  ev_chargers: { confort: 5 },
}

export function applyNeedDelta(needs: ClientNeeds, delta: NeedDelta): ClientNeeds {
  const next = { ...needs }
  for (const id of CLIENT_NEED_IDS) {
    const d = delta[id] ?? 0
    next[id] = clamp(next[id] + d, 0, 100)
  }
  return next
}

/** Desgaste pasivo al avanzar el día (noche en el hotel). */
export function overnightNeeds(needs: ClientNeeds): ClientNeeds {
  return applyNeedDelta(needs, {
    hambre: -18,
    sed: -12,
    energia: 25,
    sueno: 35,
    relax: 5,
    social: -8,
    higiene: -10,
    humor: 2,
    confort: 8,
    seguridad: 5,
  })
}

export function useServiceEffect(service: HotelService, needs: ClientNeeds): ClientNeeds {
  return applyNeedDelta(needs, SERVICE_EFFECTS[service] ?? { humor: 5, confort: 5 })
}

export function serviceExtraCost(service: HotelService, hotel: Hotel): number {
  const base = SERVICE_CATALOG.find((s) => s.id === service)?.dailyCost ?? 50
  return Math.max(15, Math.round(base * 0.35 * (1 + hotel.stars * 0.08)))
}

export function pushNote(list: string[], msg: string, max = 8): string[] {
  return [msg, ...list].slice(0, max)
}

export function stampPassport(
  passport: ClientModeState['passport'],
  hotel: Hotel,
  day: number,
): ClientModeState['passport'] {
  const exists = passport.some(
    (p) => p.countryCode === hotel.countryCode && p.subsidiaryId === hotel.subsidiaryId,
  )
  if (exists) return passport
  return [{ countryCode: hotel.countryCode, subsidiaryId: hotel.subsidiaryId, day }, ...passport].slice(0, 80)
}

export function migrateClientState(raw: Partial<ClientModeState> | undefined): ClientModeState {
  const base = defaultClientState()
  if (!raw) return base
  return {
    ...base,
    ...raw,
    prefs: Array.isArray(raw.prefs) ? (raw.prefs as GuestTarget[]) : [],
    needs: { ...defaultClientNeeds(), ...(raw.needs ?? {}) },
    passport: Array.isArray(raw.passport) ? raw.passport : [],
    notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    stay: raw.stay ?? null,
    level: clientLevelFromPoints(raw.points ?? 0),
  }
}

/** Liquidación de una noche de estancia (tras simular el día del hotel). */
export function settleClientNight(
  client: ClientModeState,
  hotels: Hotel[],
  day: number,
): { client: ClientModeState; hotels: Hotel[]; hotelRevenue: number } {
  const stay = client.stay
  if (!stay || (stay.status !== 'checked_in' && stay.status !== 'reserved' && stay.status !== 'waitlist')) {
    return { client, hotels, hotelRevenue: 0 }
  }

  let nextHotels = hotels
  let next = { ...client, needs: { ...client.needs }, passport: [...client.passport] }

  // Lista de espera automática
  if (stay.status === 'waitlist') {
    const hotel = hotels.find((h) => h.id === stay.hotelId)
    if (hotel && hotelHasFreeRoom(hotel) && !hotel.closed) {
      next.stay = { ...stay, status: 'reserved' }
      next.notifications = pushNote(next.notifications, `Hay plaza en ${hotel.name}. Ya puedes hacer check-in.`)
    }
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  if (stay.status === 'reserved') {
    // Noche sin check-in: la reserva caduca
    next.stay = null
    next.notifications = pushNote(next.notifications, 'Tu reserva de anoche caducó sin check-in.')
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  // checked_in → salario CEO, puntos de noche, necesidades, checkout (la noche ya se pagó al check-in)
  const idx = hotels.findIndex((h) => h.id === stay.hotelId)
  if (idx < 0) {
    next.stay = null
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  const hotel = hotels[idx]
  const ceo = Math.round(Math.max(0, hotel.lastDayRevenue) * CLIENT_CEO_CUT)
  next.wallet += ceo
  next.points += CLIENT_NIGHT_POINTS
  next.level = clientLevelFromPoints(next.points)
  next.totalNights += 1
  next.needs = overnightNeeds(next.needs)
  next.passport = stampPassport(next.passport, hotel, day)
  next.notifications = pushNote(
    next.notifications,
    `Noche en ${hotel.name}: +${CLIENT_NIGHT_POINTS} pts · salario CEO ${ceo.toLocaleString('es-ES')} € (${(CLIENT_CEO_CUT * 100).toFixed(1)}% ingresos del hotel).`,
  )
  next.stay = { ...stay, status: 'checked_out' }

  return { client: next, hotels: nextHotels, hotelRevenue: 0 }
}

export function prefsMatchHotel(prefs: GuestTarget[], hotel: Hotel): number {
  if (!prefs.length) return 0
  let n = 0
  if (prefs.includes(hotel.target)) n += 2
  const sub = getSubsidiary(hotel.subsidiaryId)
  for (const p of prefs) {
    if (sub?.targets.includes(p)) n += 1
  }
  return n
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export function createStayDraft(
  hotel: Hotel,
  roomKind: ClientRoomKind,
  board: BoardRegime,
  day: number,
  level: number,
): ClientStay {
  const free = hotelHasFreeRoom(hotel) && !hotel.closed
  return {
    hotelId: hotel.id,
    roomKind,
    boardRegime: board,
    status: free ? 'reserved' : 'waitlist',
    reservedDay: day,
    partner: true,
    pricePaid: calcGuestNightPrice(hotel, roomKind, board, level),
    tipTotal: 0,
  }
}
