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
  boardRegime: BoardRegime
  /** 0–100 estado del edificio (desgaste) */
  condition: number
  lastRenovationDay: number
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
}

export interface BankDeposit {
  id: string
  amount: number
  daysLeft: number
  dailyRate: number
  createdDay: number
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
  designFocus: 'vistas' | 'silencio' | 'fiesta' | 'trabajo' | 'familia'
  buffet: boolean
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
}

export interface MapFilters {
  subsidiaryId: string | 'all'
  minStars: number
  profit: ProfitFilter
  countryCode: string | 'all'
  insured: 'all' | 'yes' | 'no'
  vipRecent: boolean
  lowCondition: boolean
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
