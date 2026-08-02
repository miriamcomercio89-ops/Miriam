import { BOARD_REGIMES, SERVICE_CATALOG } from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import type {
  BoardRegime,
  ClientAppointment,
  ClientModeState,
  ClientNeedId,
  ClientNeeds,
  ClientPassportStamp,
  ClientRoomKind,
  ClientSpecialize,
  ClientStay,
  GuestTarget,
  Hotel,
  HotelService,
  BrandTourStamp,
  NightRecap,
  TravelDiaryEntry,
  WeatherInfo,
} from '../types'
import { clientPerkInfo, hotelSpecializeKind, specializeStayBonus } from './clientClub'
import { getWeather } from './weather'
import { getSeason } from './economyCore'
import { serviceLabelsForDiary } from './travelDiary'

/** % de los ingresos del día del hotel donde te alojas → monedero cliente. */
export const CLIENT_CEO_CUT = 0.005
export const CLIENT_NIGHT_POINTS = 120
export const CLIENT_START_WALLET = 25_000
export const BRAND_TOUR_BONUS = 80

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

/** @deprecated use CLIENT_LEVEL_PERKS / clientPerkInfo — se mantiene por compat. */
export const CLIENT_LEVELS = [
  { level: 1 as const, name: 'Huésped', points: 0, discount: 0 },
  { level: 2 as const, name: 'Viajero', points: 200, discount: 0.02 },
  { level: 3 as const, name: 'Habitual', points: 600, discount: 0.04 },
  { level: 4 as const, name: 'Preferente', points: 1_500, discount: 0.06 },
  { level: 5 as const, name: 'Elite', points: 3_500, discount: 0.08 },
  { level: 6 as const, name: 'Platinum', points: 7_000, discount: 0.1 },
  { level: 7 as const, name: 'Diamond', points: 14_000, discount: 0.12 },
  { level: 8 as const, name: 'Ambassador', points: 28_000, discount: 0.14 },
  { level: 9 as const, name: 'Legend', points: 55_000, discount: 0.16 },
  { level: 10 as const, name: 'Imperial', points: 100_000, discount: 0.2 },
]

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

export function defaultPartnerNeeds(): ClientNeeds {
  return {
    hambre: 50,
    sed: 52,
    energia: 68,
    sueno: 62,
    relax: 48,
    social: 55,
    higiene: 58,
    humor: 62,
    confort: 52,
    seguridad: 72,
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
    partnerNeeds: defaultPartnerNeeds(),
    stay: null,
    passport: [],
    notifications: [],
    totalNights: 0,
    bookingHotelId: null,
    stayServicesUsed: [],
    missions: [],
    missionsDay: 0,
    appointments: [],
    specialize: 'none',
    specializeNights: {},
    pointRedeems: [],
    lastDiary: null,
    diaries: [],
    brandTourLog: [],
    brandTourBonusDay: 0,
    lastNightRecap: null,
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
  return clientPerkInfo(level)
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
  specialize: ClientSpecialize = 'none',
): number {
  const roomMult = roomKindsForHotel(hotel).find((r) => r.id === room)?.mult ?? 1
  const boardMult = BOARD_REGIMES.find((b) => b.id === board)?.priceMult ?? 1
  const disc = clientLevelInfo(level).discount + specializeStayBonus(specialize, hotel).extraDiscount
  const pair = 1.7
  const raw = hotel.pricePerNight * roomMult * boardMult * pair
  return Math.max(40, Math.round(raw * (1 - Math.min(0.35, disc))))
}

export function calcStayTotalPrice(
  hotel: Hotel,
  room: ClientRoomKind,
  board: BoardRegime,
  level: number,
  nights: number,
  specialize: ClientSpecialize = 'none',
): number {
  const n = Math.max(1, Math.min(14, Math.round(nights)))
  return calcGuestNightPrice(hotel, room, board, level, specialize) * n
}

export function earlyCheckinFee(nightPrice: number, level: number): number {
  const disc = clientPerkInfo(level).earlyCheckinDiscount
  return Math.max(15, Math.round(nightPrice * 0.18 * (1 - disc)))
}

export function lateCheckoutFee(hotel: Hotel, nightPrice: number, level: number): number {
  const disc = clientPerkInfo(level).lateCheckoutDiscount
  const base = hotel.lateCheckout ? 0.12 : 0.28
  return Math.max(hotel.lateCheckout ? 0 : 20, Math.round(nightPrice * base * (1 - disc)))
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
  gimnasio: { energia: -15, hambre: -10, humor: 10 },
  yoga: { relax: 25, energia: 8 },
  kids_club: { social: 12, humor: 10 },
  playa_privada: { relax: 25, social: 10, energia: -10 },
  buceo: { energia: -20, social: 15, humor: 18, hambre: -10 },
  golf: { social: 12, energia: -15, relax: 10 },
  casino: { social: 20, humor: 15, energia: -10, sed: -8 },
  concierge: { confort: 15, seguridad: 10 },
  room_service_24h: { hambre: 28, sed: 12, confort: 18 },
  transfer_aeropuerto: { confort: 12, seguridad: 8 },
  cine: { social: 10, relax: 15, humor: 12 },
  teatro: { social: 16, humor: 18 },
  helipuerto: { confort: 20, humor: 15 },
  pista_padel: { energia: -18, social: 15, humor: 12, hambre: -8 },
  boda: { social: 25, humor: 15 },
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
    humor: -4,
    confort: 8,
    seguridad: 2,
  })
}

/** Pareja: desgaste distinto (más social, menos control). */
export function overnightPartnerNeeds(needs: ClientNeeds): ClientNeeds {
  return applyNeedDelta(needs, {
    hambre: -16,
    sed: -14,
    energia: 20,
    sueno: 30,
    relax: 8,
    social: -4,
    higiene: -12,
    humor: -2,
    confort: 6,
    seguridad: 1,
  })
}

/** Clima y temporada mueven necesidades del huésped. */
export function weatherSeasonNeedDelta(
  weather: WeatherInfo,
  season: ReturnType<typeof getSeason>,
): NeedDelta {
  const label = weather.label.toLowerCase()
  const delta: NeedDelta = {}
  if (/calor|soleado y húmedo|ola de calor|tropical/.test(label)) {
    delta.sed = -14
    delta.energia = -8
    delta.higiene = -6
    delta.relax = -4
  }
  if (/lluvia|tormenta|chubasco|gris/.test(label)) {
    delta.confort = -10
    delta.humor = -6
    delta.relax = -8
    delta.sed = 4
  }
  if (/frío|nublado fresco|intenso/.test(label)) {
    delta.confort = -8
    delta.energia = -6
    delta.sueno = -5
  }
  if (season === 'alta') {
    delta.social = -4
    delta.seguridad = -3
  } else if (season === 'baja') {
    delta.relax = 4
    delta.social = 3
  }
  return delta
}

export function applyWeatherToClient(
  client: ClientModeState,
  hotel: Hotel,
  gameMinutes: number,
): ClientModeState {
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const season = getSeason(hotel.lat, gameMinutes)
  const delta = weatherSeasonNeedDelta(weather, season)
  const partnerDelta: NeedDelta = { ...delta }
  if (/lluvia|tormenta/.test(weather.label.toLowerCase())) {
    partnerDelta.relax = (partnerDelta.relax ?? 0) - 4
  }
  return {
    ...client,
    needs: applyNeedDelta(client.needs, delta),
    partnerNeeds: applyNeedDelta(client.partnerNeeds, partnerDelta),
    notifications: pushNote(
      client.notifications,
      `Clima en ${hotel.city}: ${weather.label}. ${weather.detail}`,
    ),
  }
}

export function useServiceEffect(needs: ClientNeeds, service: HotelService): ClientNeeds {
  return applyNeedDelta(needs, SERVICE_EFFECTS[service] ?? { confort: 5 })
}

/** La pareja recibe ~55% del efecto (tú controlas solo tu personaje). */
export function partnerShareDelta(delta: NeedDelta): NeedDelta {
  const out: NeedDelta = {}
  for (const [k, v] of Object.entries(delta)) {
    if (typeof v === 'number') out[k as ClientNeedId] = Math.round(v * 0.55)
  }
  return out
}

export function serviceExtraCost(service: HotelService, hotel: Hotel): number {
  const daily = SERVICE_CATALOG.find((s) => s.id === service)?.dailyCost ?? 80
  return Math.max(12, Math.round(daily * 0.28 * (1 + hotel.stars * 0.06)))
}

export function pushNote(list: string[], note: string): string[] {
  return [note, ...list].slice(0, 12)
}

export function passportSelfieSvg(countryCode: string, day: number): string {
  const cc = (countryCode || 'XX').toUpperCase().slice(0, 3)
  const hue = (cc.charCodeAt(0) * 17 + (cc.charCodeAt(1) || 0) * 9 + day * 3) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="hsl(${hue},42%,28%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},35%,18%)"/>
    </linearGradient></defs>
    <rect width="96" height="96" rx="10" fill="url(#g)"/>
    <circle cx="48" cy="38" r="16" fill="hsl(${hue},25%,78%)"/>
    <ellipse cx="48" cy="72" rx="26" ry="18" fill="hsl(${hue},22%,70%)"/>
    <text x="48" y="14" text-anchor="middle" fill="#f7f3ea" font-size="9" font-family="Georgia,serif">${cc}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function stampPassport(
  passport: ClientModeState['passport'],
  hotel: Hotel,
  day: number,
): ClientModeState['passport'] {
  const exists = passport.some(
    (p) => p.countryCode === hotel.countryCode && p.subsidiaryId === hotel.subsidiaryId,
  )
  if (exists) {
    return passport.map((p) =>
      p.countryCode === hotel.countryCode && p.subsidiaryId === hotel.subsidiaryId && !p.selfie
        ? { ...p, selfie: passportSelfieSvg(p.countryCode, p.day) }
        : p,
    )
  }
  const stamp: ClientPassportStamp = {
    countryCode: hotel.countryCode,
    subsidiaryId: hotel.subsidiaryId,
    day,
    selfie: passportSelfieSvg(hotel.countryCode, day),
  }
  return [stamp, ...passport].slice(0, 80)
}

function migrateAppointments(raw: unknown): ClientAppointment[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, i) => {
      if (typeof item === 'string') {
        return {
          id: `legacy-${i}`,
          service: 'spa',
          label: item,
          atMinutes: 0,
          done: false,
        } satisfies ClientAppointment
      }
      if (item && typeof item === 'object') {
        const o = item as Partial<ClientAppointment>
        return {
          id: o.id ?? `apt-${i}`,
          service: o.service ?? 'spa',
          label: o.label ?? 'Cita',
          atMinutes: typeof o.atMinutes === 'number' ? o.atMinutes : 0,
          done: Boolean(o.done),
        } satisfies ClientAppointment
      }
      return null
    })
    .filter(Boolean) as ClientAppointment[]
}

function migrateStay(raw: Partial<ClientStay> | null | undefined): ClientStay | null {
  if (!raw || !raw.hotelId) return null
  const nights = typeof raw.nights === 'number' && raw.nights > 0 ? Math.min(14, raw.nights) : 1
  const nightsRemaining =
    typeof raw.nightsRemaining === 'number' && raw.nightsRemaining >= 0
      ? Math.min(nights, raw.nightsRemaining)
      : raw.status === 'checked_in'
        ? nights
        : nights
  return {
    hotelId: raw.hotelId,
    roomKind: (raw.roomKind as ClientRoomKind) ?? 'estandar',
    boardRegime: (raw.boardRegime as BoardRegime) ?? 'solo',
    status: (raw.status as ClientStay['status']) ?? 'reserved',
    reservedDay: raw.reservedDay ?? 1,
    checkInMinutes: raw.checkInMinutes,
    partner: raw.partner !== false,
    pricePaid: typeof raw.pricePaid === 'number' ? raw.pricePaid : 0,
    tipTotal: typeof raw.tipTotal === 'number' ? raw.tipTotal : 0,
    nights,
    nightsRemaining,
    lateCheckout: Boolean(raw.lateCheckout),
    earlyCheckin: Boolean(raw.earlyCheckin),
    upgraded: Boolean(raw.upgraded),
  }
}

export function migrateClientState(raw: Partial<ClientModeState> | undefined): ClientModeState {
  const base = defaultClientState()
  if (!raw) return base
  const specializeNights = { ...(raw.specializeNights ?? {}) }
  return {
    ...base,
    ...raw,
    prefs: Array.isArray(raw.prefs) ? (raw.prefs as GuestTarget[]) : [],
    needs: { ...defaultClientNeeds(), ...(raw.needs ?? {}) },
    partnerNeeds: { ...defaultPartnerNeeds(), ...((raw as { partnerNeeds?: ClientNeeds }).partnerNeeds ?? {}) },
    passport: Array.isArray(raw.passport)
      ? raw.passport.map((p) => ({
          ...p,
          selfie: p.selfie ?? passportSelfieSvg(p.countryCode, p.day),
        }))
      : [],
    notifications: Array.isArray(raw.notifications) ? raw.notifications : [],
    stay: migrateStay(raw.stay ?? null),
    level: clientLevelFromPoints(raw.points ?? 0),
    stayServicesUsed: Array.isArray(raw.stayServicesUsed) ? raw.stayServicesUsed : [],
    missions: Array.isArray(raw.missions) ? raw.missions : [],
    missionsDay: typeof raw.missionsDay === 'number' ? raw.missionsDay : 0,
    appointments: migrateAppointments(raw.appointments),
    specialize: (raw.specialize as ClientSpecialize) ?? 'none',
    specializeNights,
    pointRedeems: Array.isArray(raw.pointRedeems) ? raw.pointRedeems : [],
    lastDiary: raw.lastDiary ?? null,
    diaries: migrateDiaries(raw),
    brandTourLog: migrateBrandTourLog(raw.brandTourLog),
    brandTourBonusDay: typeof raw.brandTourBonusDay === 'number' ? raw.brandTourBonusDay : 0,
    lastNightRecap: raw.lastNightRecap ?? null,
  }
}

function migrateDiaries(raw: Partial<ClientModeState>): TravelDiaryEntry[] {
  const list = Array.isArray(raw.diaries) ? [...raw.diaries] : []
  if (raw.lastDiary && !list.some((d) => d.id === raw.lastDiary!.id)) {
    list.unshift(raw.lastDiary)
  }
  return list.slice(0, 40)
}

function migrateBrandTourLog(raw: BrandTourStamp[] | undefined): BrandTourStamp[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((s) => ({
      day: s.day,
      subsidiaryId: s.subsidiaryId,
      hotelId: s.hotelId,
      hotelName: s.hotelName,
      lat: s.lat,
      lng: s.lng,
      geoRegion: s.geoRegion,
    }))
    .slice(-40)
}

function bumpSpecialize(
  specializeNights: ClientModeState['specializeNights'],
  specialize: ClientSpecialize,
  hotel: Hotel,
): { specializeNights: ClientModeState['specializeNights']; specialize: ClientSpecialize } {
  const kind = hotelSpecializeKind(hotel)
  const next = { ...specializeNights, [kind]: (specializeNights[kind] ?? 0) + 1 }
  let best: ClientSpecialize = specialize
  let bestN = specialize === 'none' ? 0 : (next[specialize as Exclude<ClientSpecialize, 'none'>] ?? 0)
  for (const [k, v] of Object.entries(next)) {
    if ((v ?? 0) >= 3 && (v ?? 0) > bestN) {
      best = k as ClientSpecialize
      bestN = v ?? 0
    }
  }
  return { specializeNights: next, specialize: best }
}

/** Liquidación de una noche de estancia (tras simular el día del hotel). */
export function settleClientNight(
  client: ClientModeState,
  hotels: Hotel[],
  day: number,
  gameMinutes = day * 24 * 60,
): { client: ClientModeState; hotels: Hotel[]; hotelRevenue: number } {
  const stay = client.stay
  if (!stay || (stay.status !== 'checked_in' && stay.status !== 'reserved' && stay.status !== 'waitlist')) {
    return { client, hotels, hotelRevenue: 0 }
  }

  const nextHotels = hotels
  let next = {
    ...client,
    needs: { ...client.needs },
    partnerNeeds: { ...client.partnerNeeds },
    passport: [...client.passport],
  }

  if (stay.status === 'waitlist') {
    const hotel = hotels.find((h) => h.id === stay.hotelId)
    if (hotel && hotelHasFreeRoom(hotel) && !hotel.closed) {
      next.stay = { ...stay, status: 'reserved' }
      next.notifications = pushNote(next.notifications, `Hay plaza en ${hotel.name}. Ya puedes hacer check-in.`)
    }
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  if (stay.status === 'reserved') {
    next.stay = null
    next.notifications = pushNote(next.notifications, 'Tu reserva caducó sin check-in.')
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  const idx = hotels.findIndex((h) => h.id === stay.hotelId)
  if (idx < 0) {
    next.stay = null
    return { client: next, hotels: nextHotels, hotelRevenue: 0 }
  }

  const hotel = hotels[idx]
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const season = getSeason(hotel.lat, gameMinutes)
  const wDelta = weatherSeasonNeedDelta(weather, season)

  const ceo = Math.round(Math.max(0, hotel.lastDayRevenue) * CLIENT_CEO_CUT)
  const specBonus = specializeStayBonus(next.specialize, hotel)
  const nightPts = Math.round(CLIENT_NIGHT_POINTS * specBonus.pointsMult)
  const tourBefore = next.brandTourBonusDay
  next.wallet += ceo
  next.points += nightPts
  next.level = clientLevelFromPoints(next.points)
  next.totalNights += 1
  next.needs = applyNeedDelta(overnightNeeds(next.needs), wDelta)
  next.partnerNeeds = applyNeedDelta(overnightPartnerNeeds(next.partnerNeeds), wDelta)
  next.passport = stampPassport(next.passport, hotel, day)
  next = applyBrandTour(next, hotel, day)
  const tourBonus = next.brandTourBonusDay === day && tourBefore !== day ? BRAND_TOUR_BONUS : 0
  const spec = bumpSpecialize(next.specializeNights, next.specialize, hotel)
  next.specializeNights = spec.specializeNights
  next.specialize = spec.specialize

  const remaining = Math.max(0, (stay.nightsRemaining ?? 1) - 1)
  const nightsDone = stay.nights - remaining
  const lastNight = remaining <= 0
  next.lastNightRecap = buildNightRecap({
    hotel,
    weather,
    points: nightPts,
    ceo,
    tourBonus,
    day,
    nightsDone,
    nightsTotal: stay.nights || 1,
    lastNight,
  })

  if (remaining > 0) {
    next.stayServicesUsed = []
    next.pointRedeems = next.pointRedeems.filter((id) => id === 'noche')
    next.appointments = next.appointments.map((a) =>
      a.atMinutes <= gameMinutes ? { ...a, done: true } : a,
    )
    next.stay = { ...stay, nightsRemaining: remaining }
    next.notifications = pushNote(
      next.notifications,
      `Noche ${nightsDone}/${stay.nights} en ${hotel.name}: +${nightPts} pts · CEO ${ceo.toLocaleString('es-ES')} € · ${weather.label}. Quedan ${remaining}.`,
    )
  } else {
    const diary = buildTravelDiaryEntry(next, hotel, day, gameMinutes, stay.nights || 1)
    next = attachDiary(next, diary)
    next.stayServicesUsed = []
    next.pointRedeems = next.pointRedeems.filter((id) => id === 'noche')
    next.appointments = []
    next.stay = { ...stay, nightsRemaining: 0, status: 'checked_out' }
    next.notifications = pushNote(
      next.notifications,
      `Última noche en ${hotel.name}: +${nightPts} pts · CEO ${ceo.toLocaleString('es-ES')} €. Check-out automático.`,
    )
  }

  return { client: next, hotels: nextHotels, hotelRevenue: 0 }
}

export function buildNightRecap(args: {
  hotel: Hotel
  weather: WeatherInfo
  points: number
  ceo: number
  tourBonus: number
  day: number
  nightsDone: number
  nightsTotal: number
  lastNight: boolean
}): NightRecap {
  return {
    hotelName: args.hotel.name,
    city: args.hotel.city,
    weatherLabel: args.weather.label,
    weatherDetail: args.weather.detail,
    points: args.points,
    ceo: args.ceo,
    tourBonus: args.tourBonus,
    day: args.day,
    nightsDone: args.nightsDone,
    nightsTotal: args.nightsTotal,
    lastNight: args.lastNight,
  }
}

export function applyBrandTour(
  client: ClientModeState,
  hotel: Hotel,
  day: number,
): ClientModeState {
  const stamp: BrandTourStamp = {
    day,
    subsidiaryId: hotel.subsidiaryId,
    hotelId: hotel.id,
    hotelName: hotel.name,
    lat: hotel.lat,
    lng: hotel.lng,
    geoRegion: hotel.geoRegion,
  }
  const log = [...(client.brandTourLog ?? []), stamp]
    .filter((x) => x.day >= day - 6)
    .slice(-24)
  let next: ClientModeState = { ...client, brandTourLog: log }
  const brands = new Set(log.map((x) => x.subsidiaryId))
  if (brands.size >= 2 && client.brandTourBonusDay !== day) {
    const points = next.points + BRAND_TOUR_BONUS
    next = {
      ...next,
      points,
      level: clientLevelFromPoints(points),
      brandTourBonusDay: day,
      notifications: pushNote(
        next.notifications,
        `Tour de marca: ${brands.size} marcas distintas en 7 días · +${BRAND_TOUR_BONUS} pts.`,
      ),
    }
  }
  return next
}

export function buildTravelDiaryEntry(
  client: ClientModeState,
  hotel: Hotel,
  day: number,
  gameMinutes: number,
  nights: number,
): TravelDiaryEntry {
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const stamp = client.passport.find(
    (p) => p.countryCode === hotel.countryCode && p.subsidiaryId === hotel.subsidiaryId,
  )
  return {
    id: `diary-${hotel.id}-${day}`,
    hotelName: hotel.name,
    city: hotel.city,
    countryCode: hotel.countryCode,
    subsidiaryId: hotel.subsidiaryId,
    nights: Math.max(1, nights),
    services: serviceLabelsForDiary(client.stayServicesUsed),
    weatherLabel: weather.label,
    weatherDetail: weather.detail,
    selfie: stamp?.selfie,
    day,
    tipTotal: client.stay?.tipTotal ?? 0,
    pointsNote: `Estancia · Club nv.${client.level}`,
    roomKind: client.stay?.roomKind ?? 'estandar',
    boardRegime: client.stay?.boardRegime ?? 'solo',
  }
}

export function attachDiary(client: ClientModeState, entry: TravelDiaryEntry): ClientModeState {
  return {
    ...client,
    lastDiary: entry,
    diaries: [entry, ...(client.diaries ?? []).filter((d) => d.id !== entry.id)].slice(0, 40),
    notifications: pushNote(
      client.notifications,
      `Diario de viaje listo: ${entry.hotelName}. Puedes descargarlo en PDF.`,
    ),
  }
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
  nights = 1,
  specialize: ClientSpecialize = 'none',
): ClientStay {
  const free = hotelHasFreeRoom(hotel) && !hotel.closed
  const n = Math.max(1, Math.min(14, Math.round(nights)))
  return {
    hotelId: hotel.id,
    roomKind,
    boardRegime: board,
    status: free ? 'reserved' : 'waitlist',
    reservedDay: day,
    partner: true,
    pricePaid: calcStayTotalPrice(hotel, roomKind, board, level, n, specialize),
    tipTotal: 0,
    nights: n,
    nightsRemaining: n,
    lateCheckout: false,
    earlyCheckin: false,
    upgraded: false,
  }
}

export function bestUpgradeRoom(hotel: Hotel, current: ClientRoomKind): ClientRoomKind | null {
  const rooms = roomKindsForHotel(hotel)
  const order: ClientRoomKind[] = ['estandar', 'familiar', 'vista_mar', 'suite']
  const curIdx = order.indexOf(current)
  for (let i = order.length - 1; i > curIdx; i--) {
    if (rooms.some((r) => r.id === order[i])) return order[i]
  }
  return null
}

export function formatAppointmentClock(atMinutes: number): string {
  const m = ((atMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}
