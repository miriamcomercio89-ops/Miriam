import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { STARTING_CASH } from '../data/catalog'
import { EVENT_POOL } from '../data/events'
import { hotelPlaceholderImage, getSubsidiary } from '../data/subsidiaries'
import { calcConstructionCost, simulateHotelDay } from '../lib/economy'
import { gameDay } from '../lib/format'
import type { BuildDraft, GameState, Hotel, LocationInsight, SpeedOption, WorldEvent } from '../types'

const STORAGE_KEY = 'orbis-hotels-group-save-v1'

type GameStore = GameState & {
  selectedHotelId: string | null
  buildLocation: LocationInsight | null
  showLanding: boolean
  tick: (deltaGameMinutes: number) => void
  setSpeed: (s: SpeedOption) => void
  skipDay: () => void
  startGame: () => void
  openBuildAt: (loc: LocationInsight) => void
  closeBuild: () => void
  selectHotel: (id: string | null) => void
  buildHotel: (draft: BuildDraft, loc: LocationInsight) => { ok: true } | { ok: false; error: string }
  persistLocal: () => void
  loadLocal: () => boolean
  exportSave: () => string
  importSave: (json: string) => { ok: true } | { ok: false; error: string }
  setCloudSlot: (id: string | null) => void
  getSnapshot: () => GameState
  hydrate: (state: GameState) => void
}

function initialState(): GameState {
  return {
    cash: STARTING_CASH,
    gameMinutes: 8 * 60, // start morning day 1
    speed: 1,
    hotels: [],
    activeEvents: [],
    lastEventRollDay: 0,
    cloudSlotId: null,
    started: false,
  }
}

function applyDays(state: GameState, days: number): Partial<GameState> {
  if (days <= 0) return {}
  let cash = state.cash
  let hotels = state.hotels.map((h) => ({ ...h }))
  let activeEvents = state.activeEvents.map((e) => ({ ...e }))
  let lastEventRollDay = state.lastEventRollDay
  const startDay = gameDay(state.gameMinutes)

  for (let d = 0; d < days; d++) {
    const currentDay = startDay + d

    // Expire / tick events
    activeEvents = activeEvents
      .map((e) => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
      .filter((e) => e.daysRemaining > 0)

    // Occasional new event
    if (currentDay - lastEventRollDay >= 5 + Math.floor(Math.random() * 6)) {
      lastEventRollDay = currentDay
      if (Math.random() < 0.55 && activeEvents.length < 3) {
        const pool = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
        const ev: WorldEvent = {
          ...pool,
          id: `${pool.id}-${currentDay}-${Math.random().toString(36).slice(2, 7)}`,
          daysRemaining: 3 + Math.floor(Math.random() * 5),
          startedAtDay: currentDay,
        }
        activeEvents = [...activeEvents, ev]
      }
    }

    hotels = hotels.map((h) => {
      const day = simulateHotelDay(h, activeEvents)
      cash += day.net
      return {
        ...h,
        lastDayRevenue: day.revenue,
        lastDayCosts: day.costs,
        lastDayOccupancy: day.occupancy,
        lifetimeRevenue: h.lifetimeRevenue + day.revenue,
        lifetimeCosts: h.lifetimeCosts + day.costs,
        lifetimeGuests: h.lifetimeGuests + day.guests,
      }
    })
  }

  return { cash, hotels, activeEvents, lastEventRollDay }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedHotelId: null,
  buildLocation: null,
  showLanding: true,

  tick: (deltaGameMinutes) => {
    const state = get()
    if (!state.started || state.speed === 0 || deltaGameMinutes <= 0) return
    const prevDay = gameDay(state.gameMinutes)
    const gameMinutes = state.gameMinutes + deltaGameMinutes
    const nextDay = gameDay(gameMinutes)
    const daysPassed = nextDay - prevDay
    const dayPatch = applyDays(state, daysPassed)
    set({ gameMinutes, ...dayPatch })
  },

  setSpeed: (speed) => set({ speed }),

  skipDay: () => {
    const state = get()
    if (!state.started) return
    const rem = 24 * 60 - (state.gameMinutes % (24 * 60))
    const advance = rem === 0 ? 24 * 60 : rem
    const gameMinutes = state.gameMinutes + advance
    const dayPatch = applyDays(state, 1)
    set({ gameMinutes, ...dayPatch })
  },

  startGame: () => set({ started: true, showLanding: false }),

  openBuildAt: (loc) => set({ buildLocation: loc, selectedHotelId: null }),
  closeBuild: () => set({ buildLocation: null }),
  selectHotel: (id) => set({ selectedHotelId: id, buildLocation: null }),

  buildHotel: (draft, loc) => {
    const state = get()
    if (!loc.isLand) return { ok: false, error: 'Solo se puede construir en tierra firme.' }
    const sub = getSubsidiary(draft.subsidiaryId)
    if (!sub) return { ok: false, error: 'Filial no válida.' }
    if (!draft.name.trim()) return { ok: false, error: 'El hotel necesita un nombre.' }
    if (draft.stars < sub.minStars || draft.stars > sub.maxStars) {
      return { ok: false, error: `Esta filial admite de ${sub.minStars} a ${sub.maxStars} estrellas.` }
    }
    const cost = calcConstructionCost(draft, loc)
    if (cost > state.cash) return { ok: false, error: 'Fondos insuficientes para esta construcción.' }

    const image =
      draft.imageDataUrl ||
      hotelPlaceholderImage(sub, draft.name.trim())

    const hotel: Hotel = {
      id: uuid(),
      name: draft.name.trim(),
      subsidiaryId: draft.subsidiaryId,
      lat: loc.lat,
      lng: loc.lng,
      stars: draft.stars,
      rooms: draft.rooms,
      pricePerNight: draft.pricePerNight,
      services: [...draft.services],
      staffLevel: draft.staffLevel,
      target: draft.target,
      imageDataUrl: image,
      country: loc.country,
      countryCode: loc.countryCode,
      city: loc.city,
      region: loc.region,
      tourismIndex: loc.tourismIndex,
      beachScore: loc.beachScore,
      costIndex: loc.costIndex,
      taxRate: loc.taxRate,
      builtAtGameDay: gameDay(state.gameMinutes),
      constructionCost: cost,
      lastDayRevenue: 0,
      lastDayCosts: 0,
      lastDayOccupancy: 0,
      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      lifetimeGuests: 0,
    }

    set({
      cash: state.cash - cost,
      hotels: [...state.hotels, hotel],
      buildLocation: null,
      selectedHotelId: hotel.id,
    })
    return { ok: true }
  },

  getSnapshot: () => {
    const s = get()
    return {
      cash: s.cash,
      gameMinutes: s.gameMinutes,
      speed: s.speed,
      hotels: s.hotels,
      activeEvents: s.activeEvents,
      lastEventRollDay: s.lastEventRollDay,
      cloudSlotId: s.cloudSlotId,
      started: s.started,
    }
  },

  hydrate: (state) => set({ ...state, showLanding: !state.started, selectedHotelId: null, buildLocation: null }),

  persistLocal: () => {
    const snap = get().getSnapshot()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap))
  },

  loadLocal: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw) as GameState
      get().hydrate(parsed)
      return true
    } catch {
      return false
    }
  },

  exportSave: () => JSON.stringify(get().getSnapshot(), null, 2),

  importSave: (json) => {
    try {
      const parsed = JSON.parse(json) as GameState
      if (!parsed || typeof parsed.cash !== 'number' || !Array.isArray(parsed.hotels)) {
        return { ok: false, error: 'Archivo de guardado no válido.' }
      }
      get().hydrate({ ...initialState(), ...parsed, started: true })
      return { ok: true }
    } catch {
      return { ok: false, error: 'No se pudo leer el JSON.' }
    }
  },

  setCloudSlot: (id) => set({ cloudSlotId: id }),
}))

export { STORAGE_KEY }
