export type StaffLevel = 'basico' | 'estandar' | 'premium' | 'lujo'
export type GuestTarget = 'lujo' | 'negocios' | 'familiar' | 'parejas' | 'aventura' | 'wellness' | 'playa'
export type SpeedOption = 0 | 1 | 2 | 5
export type MapLayer = 'streets' | 'satellite' | 'hybrid'
export type MapMode = 'inspect' | 'build'
export type ProfitFilter = 'all' | 'profit' | 'loss' | 'new'
export type SeasonName = 'alta' | 'media' | 'baja'
export type RankMetric = 'net' | 'occupancy' | 'roi' | 'satisfaction'
export type HotelSort = 'name' | 'net' | 'occupancy' | 'city' | 'stars'

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
  | 'spa'
  | 'piscina'
  | 'restaurante'
  | 'gimnasio'
  | 'parking'
  | 'wifi_premium'
  | 'all_inclusive'
  | 'kids_club'
  | 'playa_privada'
  | 'buceo'
  | 'golf'
  | 'casino'
  | 'helipuerto'
  | 'coworking'
  | 'room_service_24h'
  | 'concierge'
  | 'lavanderia'
  | 'transfer_aeropuerto'
  | 'bar_azotea'
  | 'yoga'

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

/** AI-managed corporate room block */
export interface CorporateContract {
  clientName: string
  blockedRooms: number
  ratePerNight: number
  daysRemaining: number
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
  /** Custom upload only; otherwise resolved from imageKey */
  imageDataUrl?: string
  /** Gallery key e.g. coast:day */
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
  lifetimeRevenue: number
  lifetimeCosts: number
  lifetimeGuests: number
  satisfaction: number
  contract: CorporateContract | null
}

export interface WorldEvent {
  id: string
  title: string
  description: string
  demandMultiplier: number
  costMultiplier: number
  scope: string
  /** Optional season gate */
  season?: SeasonName | 'any'
  daysRemaining: number
  startedAtDay: number
}

export interface DayLedger {
  day: number
  revenue: number
  costs: number
  net: number
  cash: number
  loanPayment: number
  season: SeasonName
}

export interface LoanState {
  balance: number
  limit: number
  dailyRate: number
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
}

export interface MapFilters {
  subsidiaryId: string | 'all'
  minStars: number
  profit: ProfitFilter
}

export interface MapFocus {
  lat: number
  lng: number
  zoom?: number
  hotelId?: string
}
