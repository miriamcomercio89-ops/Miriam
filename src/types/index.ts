export type StaffLevel = 'basico' | 'estandar' | 'premium' | 'lujo'
export type GuestTarget = 'lujo' | 'negocios' | 'familiar' | 'parejas' | 'aventura' | 'wellness' | 'playa'
export type SpeedOption = 0 | 1 | 2 | 5

export interface Subsidiary {
  id: string
  name: string
  specialty: string
  tagline: string
  color: string
  accent: string
  letter: string
  /** Affinity 0-1 for beach / coastal locations */
  beachAffinity: number
  /** Multiplier on construction cost */
  costMultiplier: number
  /** Bonus to occupancy demand */
  demandBonus: number
  /** Preferred guest targets */
  targets: GuestTarget[]
  minStars: number
  maxStars: number
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
  notes: string[]
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
  imageDataUrl: string
  country: string
  countryCode: string
  city: string
  region: string
  tourismIndex: number
  beachScore: number
  costIndex: number
  taxRate: number
  builtAtGameDay: number
  constructionCost: number
  /** Running stats */
  lastDayRevenue: number
  lastDayCosts: number
  lastDayOccupancy: number
  lifetimeRevenue: number
  lifetimeCosts: number
  lifetimeGuests: number
}

export interface WorldEvent {
  id: string
  title: string
  description: string
  /** Multiplier on global demand */
  demandMultiplier: number
  /** Multiplier on operating costs */
  costMultiplier: number
  /** Optional region filter (country code or 'global') */
  scope: string
  /** Game days remaining */
  daysRemaining: number
  startedAtDay: number
}

export interface GameState {
  cash: number
  gameMinutes: number
  speed: SpeedOption
  hotels: Hotel[]
  activeEvents: WorldEvent[]
  lastEventRollDay: number
  cloudSlotId: string | null
  started: boolean
}

export interface BuildDraft {
  name: string
  subsidiaryId: string
  stars: number
  rooms: number
  pricePerNight: number
  services: HotelService[]
  staffLevel: StaffLevel
  target: GuestTarget
  imageDataUrl: string
}
