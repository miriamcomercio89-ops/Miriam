export type StaffLevel = 'basico' | 'estandar' | 'premium' | 'lujo'
export type GuestTarget = 'lujo' | 'negocios' | 'familiar' | 'parejas' | 'aventura' | 'wellness' | 'playa'
export type SpeedOption = 0 | 1 | 2 | 5
export type MapLayer = 'streets' | 'satellite' | 'hybrid'
export type MapMode = 'inspect' | 'build'
export type ProfitFilter = 'all' | 'profit' | 'loss' | 'new'
export type SeasonName = 'alta' | 'media' | 'baja'
export type RankMetric = 'net' | 'occupancy' | 'roi' | 'satisfaction'
export type HotelSort = 'name' | 'net' | 'occupancy' | 'city' | 'stars'
export type RoomMix = 'estandar' | 'mixto' | 'suites' | 'familiar'
export type BuildQuality = 'simple' | 'bueno' | 'alto' | 'lujo'
export type GreenLevel = 'ninguno' | 'basico' | 'avanzado' | 'elite'
export type ContractKind = 'empresa' | 'aerolinea' | 'evento' | 'gobierno' | 'deportes' | 'universidad'
export type SecurityLevel = 'bajo' | 'medio' | 'alto'
export type TechLevel = 'basico' | 'moderno' | 'futuro'
/** Régimen de comidas del hotel */
export type BoardRegime =
  | 'solo'
  | 'desayuno'
  | 'media'
  | 'completa'
  | 'ti'
  | 'ti_premium'
  | 'ti_gold'
  | 'ti_imperial'
/** Nivel 1–10 del club de fidelidad Orbis */
export type LoyaltyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type DesignFocus = 'vistas' | 'silencio' | 'fiesta' | 'trabajo' | 'familia'
export type BuffetType = 'ninguno' | 'continental' | 'americano' | 'tematico' | 'gourmet'
export type BarType = 'ninguno' | 'lobby' | 'azotea' | 'cocteleria' | 'beach_bar' | 'varios'
export type RestaurantConcept = 'ninguno' | 'buffet' | 'a_la_carta' | 'gourmet' | 'tematico' | 'mixto'

export interface Subsidiary {
  id: string
  name: string
  specialty: string
  tagline: string
  lore: string
  color: string
  accent: string
  letter: string
  beachAffinity: number
  costMultiplier: number
  demandBonus: number
  targets: GuestTarget[]
  minStars: number
  maxStars: number
  imageStyle: 'coast' | 'urban' | 'nature' | 'luxury' | 'family' | 'adventure'
}

export type HotelService =
  | 'spa' | 'piscina' | 'restaurante' | 'gimnasio' | 'parking' | 'wifi_premium'
  | 'all_inclusive' | 'kids_club' | 'playa_privada' | 'buceo' | 'golf' | 'casino'
  | 'helipuerto' | 'coworking' | 'room_service_24h' | 'concierge' | 'lavanderia'
  | 'transfer_aeropuerto' | 'bar_azotea' | 'yoga' | 'sauna' | 'teatro' | 'tienda'
  | 'mascotas' | 'ev_chargers' | 'biblioteca' | 'medico' | 'boda'
  | 'cine' | 'jardines' | 'mirador' | 'pista_padel' | 'guarderia_noche'

export interface LocationInsight {
  lat: number
  lng: number
  isLand: boolean
  displayName: string
  country: string
  countryCode: string
  city: string
  region: string
  tourismIndex: number
  beachScore: number
  costIndex: number
  taxRate: number
  climateLabel: string
  geoRegion: string
  notes: string[]
  confidence: number
  /** Proximidad a aeropuerto (0–100). Compat: puede faltar en datos viejos. */
  airportScore?: number
  /** Proximidad a estación tren/metro (0–100). */
  stationScore?: number
  touristTaxPerNight?: number
  greenTaxPerNight?: number
}

export interface CorporateContract {
  kind: ContractKind
  clientName: string
  blockedRooms: number
  ratePerNight: number
  daysRemaining: number
}

export interface HotelInsurance {
  active: boolean
  dailyCost: number
  /** 0-1 portion of bad-event cost absorbed */
  cover: number
}

export interface Hotel {
  id: string
  name: string
  subsidiaryId: string
  lat: number
  lng: number
  stars: number
  rooms: number
  pricePerNight: number
  services: HotelService[]
  staffLevel: StaffLevel
  target: GuestTarget
  imageDataUrl?: string
  imageKey: string
  country: string
  countryCode: string
  city: string
  region: string
  tourismIndex: number
  beachScore: number
  costIndex: number
  taxRate: number
  geoRegion: string
  /** Afinidad aeropuerto 0–100 (compat: default inferido). */
  airportScore?: number
  /** Afinidad estación 0–100. */
  stationScore?: number
  builtAtGameDay: number
  constructionCost: number
  lastDayRevenue: number
  lastDayCosts: number
  lastDayOccupancy: number
  lastDayTax: number
  lifetimeRevenue: number
  lifetimeCosts: number
  lifetimeGuests: number
  lifetimeTax: number
  satisfaction: number
  contract: CorporateContract | null
  insurance: HotelInsurance | null
  roomMix: RoomMix
  buildQuality: BuildQuality
  floors: number
  greenLevel: GreenLevel
  meetingRooms: number
  parkingSpots: number
  restaurantLevel: number
  openingPromoDays: number
  securityLevel: SecurityLevel
  techLevel: TechLevel
  breakfastIncluded: boolean
  seaViewShare: number
  loyaltyProgram: boolean
  vipTonight: boolean
  /** último día (juego) con VIP */
  lastVipDay: number
  /** Régimen por defecto / principal */
  boardRegime: BoardRegime
  /** Regímenes que ofrece el hotel (varios a la vez) */
  availableRegimes: BoardRegime[]
  /** 0–100 estado del edificio (desgaste) */
  condition: number
  lastRenovationDay: number
  /** Extras operativos */
  designFocus: DesignFocus
  /** Buffets activos (varios a la vez) */
  buffetTypes: BuffetType[]
  /** Bares activos (varios a la vez) */
  barTypes: BarType[]
  /** Conceptos de restaurante activos */
  restaurantConcepts: RestaurantConcept[]
  lateCheckout: boolean
  airportDesk: boolean
  quietHours: boolean
  bikeRental: boolean
  shuttleCity: boolean
  /** Si true, la IA no toca el precio */
  priceManual: boolean
  /** Hotel temporalmente cerrado */
  closed: boolean
}

export interface WorldEvent {
  id: string
  title: string
  description: string
  demandMultiplier: number
  costMultiplier: number
  scope: string
  season?: SeasonName | 'any'
  /** day-of-year windows for holidays, inclusive */
  dayFrom?: number
  dayTo?: number
  daysRemaining: number
  startedAtDay: number
}

export interface NewsItem {
  id: string
  day: number
  title: string
  body: string
  tone: 'good' | 'bad' | 'neutral'
}

export interface DayLedger {
  day: number
  revenue: number
  costs: number
  net: number
  cash: number
  loanPayment: number
  tax: number
  season: SeasonName
}

export interface LoanState {
  balance: number
  limit: number
  dailyRate: number
}

export interface CountryEconomy {
  inflation: number
  fx: number
  /** Multiplicador sobre impuesto base del país (políticas) */
  taxDrift: number
  /** Multiplicador sobre tasa turística */
  touristDrift: number
}

export interface BankDeposit {
  id: string
  amount: number
  daysLeft: number
  dailyRate: number
  createdDay: number
}

/** Modo de juego activo */
export type PlayMode = 'gerente' | 'cliente'

export type ClientNeedId =
  | 'hambre'
  | 'sed'
  | 'energia'
  | 'sueno'
  | 'relax'
  | 'social'
  | 'higiene'
  | 'humor'
  | 'confort'
  | 'seguridad'

export type ClientNeeds = Record<ClientNeedId, number>

export type ClientRoomKind = 'estandar' | 'familiar' | 'suite' | 'vista_mar'

export type ClientStayStatus = 'waitlist' | 'reserved' | 'checked_in' | 'checked_out'

export interface ClientStay {
  hotelId: string
  roomKind: ClientRoomKind
  boardRegime: BoardRegime
  status: ClientStayStatus
  reservedDay: number
  checkInMinutes?: number
  partner: boolean
  /** Precio total pareja por todas las noches (o 0 si canje). */
  pricePaid: number
  tipTotal: number
  /** Noches reservadas (compat: default 1). */
  nights: number
  /** Noches que quedan por liquidar estando checked_in. */
  nightsRemaining: number
  lateCheckout: boolean
  earlyCheckin: boolean
  upgraded: boolean
}

export interface ClientPassportStamp {
  countryCode: string
  subsidiaryId: string
  day: number
  /** SVG data-URL generado (compat: puede faltar). */
  selfie?: string
}

export type ClientMissionKind = 'daily' | 'weekly'

export interface ClientMission {
  id: string
  kind: ClientMissionKind
  title: string
  description: string
  progress: number
  target: number
  rewardPoints: number
  rewardWallet: number
  done: boolean
  claimed: boolean
  createdDay: number
}

export type ClientSpecialize = 'none' | 'spa' | 'playa' | 'negocios' | 'aventura' | 'gastronomia'

export interface ClientAppointment {
  id: string
  service: string
  label: string
  /** Minuto de juego absoluto de la cita. */
  atMinutes: number
  done: boolean
}

export interface ClientModeState {
  name: string
  prefs: GuestTarget[]
  wallet: number
  points: number
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  needs: ClientNeeds
  /** Necesidades de la pareja (NPC). */
  partnerNeeds: ClientNeeds
  stay: ClientStay | null
  passport: ClientPassportStamp[]
  notifications: string[]
  totalNights: number
  bookingHotelId: string | null
  stayServicesUsed: HotelService[]
  missions: ClientMission[]
  missionsDay: number
  appointments: ClientAppointment[]
  specialize: ClientSpecialize
  /** Noches acumuladas por especialización. */
  specializeNights: Partial<Record<Exclude<ClientSpecialize, 'none'>, number>>
  /** Canjes de puntos usados (ids) esta estancia / hoy. */
  pointRedeems: string[]
  /** Último diario de viaje (check-out). Compat: puede faltar. */
  lastDiary: TravelDiaryEntry | null
  /** Historial corto de diarios. */
  diaries: TravelDiaryEntry[]
  /** Noches recientes por marca (tour 7 días). */
  brandTourLog: BrandTourStamp[]
  /** Día en que ya se cobró el bonus de tour. */
  brandTourBonusDay: number
  /** Último recap de noche (cinemática). Compat: puede faltar. */
  lastNightRecap: NightRecap | null
}

/** Entrada del diario de viaje (A4). */
export interface TravelDiaryEntry {
  id: string
  hotelName: string
  city: string
  countryCode: string
  subsidiaryId: string
  nights: number
  services: string[]
  weatherLabel: string
  weatherDetail: string
  selfie?: string
  day: number
  tipTotal: number
  pointsNote: string
  roomKind: string
  boardRegime: string
}

export interface BrandTourStamp {
  day: number
  subsidiaryId: string
  hotelId?: string
  hotelName?: string
  lat?: number
  lng?: number
  geoRegion?: string
}

/** Resumen breve al liquidar una noche (cinemática 2–3 s). */
export interface NightRecap {
  hotelName: string
  city: string
  weatherLabel: string
  weatherDetail: string
  points: number
  ceo: number
  tourBonus: number
  day: number
  nightsDone: number
  nightsTotal: number
  lastNight: boolean
}

/** UI persistida en el save (compat: defaults si falta). */
export interface PersistedUi {
  mapLayer: MapLayer
  mapMode: MapMode
  mapFilters: MapFilters
  mapFocus: MapFocus | null
  selectedHotelId: string | null
  rankMetric: RankMetric
  /** Última simulación: ms y nº hoteles (rendimiento). */
  lastSimMs: number
  lastSimHotels: number
}

export interface GameState {
  version: number
  cash: number
  gameMinutes: number
  speed: SpeedOption
  hotels: Hotel[]
  activeEvents: WorldEvent[]
  lastEventRollDay: number
  cloudSlotId: string | null
  started: boolean
  reputation: Record<string, number>
  loan: LoanState
  ledger: DayLedger[]
  soundEnabled: boolean
  gameName: string
  news: NewsItem[]
  countryEconomy: Record<string, CountryEconomy>
  bankDeposits: BankDeposit[]
  /** Nivel global del club Orbis (1–10) */
  loyaltyLevel: LoyaltyLevel
  loyaltyPoints: number
  lastWeeklyReportDay: number
  weeklyReports: WeeklyReport[]
  /** Órdenes globales del plan marcados como construidos */
  planDoneOrders: number[]
  /** Siguiente hotel del plan a construir */
  planCursor: number
  /** Gerente o Cliente */
  playMode: PlayMode
  client: ClientModeState
  /** Preferencias de mapa / selección (v2.0+). */
  ui: PersistedUi
}

export interface WeeklyReport {
  id: string
  day: number
  bestCountry: string
  bestCountryNet: number
  worstHotel: string
  worstHotelNet: number
  dayTax: number
  bankBalance: number
  hotelCount: number
  avgOccupancy: number
  renovations: number
  summary: string
}

export interface BuildDraft {
  name: string
  subsidiaryId: string
  stars: number
  rooms: number
  services: HotelService[]
  staffLevel: StaffLevel
  target: GuestTarget
  imageDataUrl: string
  imageKey: string
  roomMix: RoomMix
  buildQuality: BuildQuality
  floors: number
  greenLevel: GreenLevel
  meetingRooms: number
  parkingSpots: number
  restaurantLevel: number
  openingPromoDays: number
  designFocus: DesignFocus
  buffetTypes: BuffetType[]
  barTypes: BarType[]
  restaurantConcepts: RestaurantConcept[]
  lateCheckout: boolean
  airportDesk: boolean
  securityLevel: SecurityLevel
  techLevel: TechLevel
  breakfastIncluded: boolean
  seaViewShare: number
  loyaltyProgram: boolean
  quietHours: boolean
  bikeRental: boolean
  shuttleCity: boolean
  boardRegime: BoardRegime
  availableRegimes: BoardRegime[]
}

export interface MapFilters {
  subsidiaryId: string | 'all'
  minStars: number
  profit: ProfitFilter
  countryCode: string | 'all'
  insured: 'all' | 'yes' | 'no'
  vipRecent: boolean
  lowCondition: boolean
  /** Solo modo Cliente: dormidos / marcas pendientes. */
  clientStayFilter: 'all' | 'slept' | 'pending_brands'
}

export interface MapFocus {
  lat: number
  lng: number
  zoom?: number
  hotelId?: string
}

export interface WeatherInfo {
  label: string
  detail: string
  demandMult: number
  costMult: number
}
