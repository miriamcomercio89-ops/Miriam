export type MapMode = 'explore' | 'found' | 'scout'
export type Speed = 0 | 1 | 4 | 16
export type PanelId = 'list' | 'build' | 'scout' | 'mass' | 'finance' | 'hq' | 'help' | null

export interface Brand {
  id: string
  name: string
  short: string
  cuisine: string
  color: string
  accent: string
  foundCost: number
  seats: number
  ticket: number
  foodPct: number
  wagePerSeat: number
  quality: number
  hqLevel: number
  blurb: string
}

export interface WorldCity {
  id: string
  name: string
  country: string
  cc: string
  lat: number
  lng: number
  col: number
  tourism: number
  popM: number
}

export interface OsmSite {
  osmId: string
  name: string
  amenity: string
  lat: number
  lng: number
  city?: string
  cuisine?: string
}

export interface Restaurant {
  id: string
  name: string
  brandId: string
  lat: number
  lng: number
  city: string
  country: string
  cc: string
  osmId?: string
  seats: number
  quality: number
  foundedDay: number
  closed: boolean
  lastCovers: number
  lastRev: number
  lastCost: number
  lastNet: number
  stars: number
}

export interface DailySnap {
  day: number
  cash: number
  rev: number
  cost: number
  net: number
  founded: number
  closed: number
}

export interface GameEvent {
  id: string
  day: number
  title: string
  body: string
  tone: 'good' | 'bad' | 'info'
}

export interface HqUpgrade {
  id: string
  name: string
  desc: string
  cost: number
  levelReq: number
}

export interface GameState {
  version: 1
  company: string
  started: boolean
  day: number
  hour: number
  cash: number
  hqLevel: number
  upgrades: string[]
  restaurants: Restaurant[]
  usedOsm: string[]
  history: DailySnap[]
  events: GameEvent[]
  autoExpand: boolean
  autoBrand: string
  autoCount: number
  autoCityIndex: number
}

export interface PlaceHit {
  lat: number
  lng: number
  label: string
  city?: string
  country?: string
  cc?: string
}

export interface ReversePlace {
  lat: number
  lng: number
  label: string
  city: string
  country: string
  cc: string
  water: boolean
}

export interface MapFocus {
  lat: number
  lng: number
  zoom?: number
}
