import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { STARTING_CASH } from '../data/catalog'
import { EVENT_POOL } from '../data/events'
import { hotelPlaceholderImage, getSubsidiary } from '../data/subsidiaries'
import {
  calcConstructionCost,
  fairPrice,
  getSeason,
  reputationKey,
  simulateHotelDay,
  updateReputation,
} from '../lib/economy'
import { gameDay } from '../lib/format'
import { playBuildSound, playDaySound } from '../lib/sound'
import type {
  BuildDraft,
  DayLedger,
  GameState,
  Hotel,
  LoanState,
  LocationInsight,
  MapFilters,
  MapLayer,
  SpeedOption,
  WorldEvent,
} from '../types'

export const STORAGE_KEY = 'orbis-hotels-group-save-v2'
export const SAVE_VERSION = 2

type UiState = {
  selectedHotelId: string | null
  buildLocation: LocationInsight | null
  showLanding: boolean
  showFinance: boolean
  showLoan: boolean
  mapLayer: MapLayer
  mapFilters: MapFilters
}

type GameStore = GameState &
  UiState & {
    tick: (deltaGameMinutes: number) => void
    setSpeed: (s: SpeedOption) => void
    skipDay: () => void
    startGame: () => void
    newGame: () => void
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
    setShowFinance: (v: boolean) => void
    setShowLoan: (v: boolean) => void
    setMapLayer: (l: MapLayer) => void
    setMapFilters: (f: Partial<MapFilters>) => void
    toggleSound: () => void
    takeLoan: (amount: number) => { ok: true } | { ok: false; error: string }
    repayLoan: (amount: number) => { ok: true } | { ok: false; error: string }
  }

function defaultLoan(): LoanState {
  return { balance: 0, limit: 400_000_000, dailyRate: 0.00035 }
}

function initialState(): GameState {
  return {
    version: SAVE_VERSION,
    cash: STARTING_CASH,
    gameMinutes: 8 * 60,
    speed: 1,
    hotels: [],
    activeEvents: [],
    lastEventRollDay: 0,
    cloudSlotId: null,
    started: false,
    reputation: {},
    loan: defaultLoan(),
    ledger: [],
    soundEnabled: true,
  }
}

function migrate(raw: Partial<GameState> & { cash?: number }): GameState {
  const base = initialState()
  const hotels = (raw.hotels ?? []).map((h) => ({
    ...h,
    satisfaction: h.satisfaction ?? 70,
    geoRegion: h.geoRegion ?? 'global',
  }))
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    hotels,
    reputation: raw.reputation ?? {},
    loan: raw.loan ?? defaultLoan(),
    ledger: raw.ledger ?? [],
    soundEnabled: raw.soundEnabled ?? true,
  }
}

function applyDays(state: GameState, days: number): Partial<GameState> & { _dayClosed?: boolean } {
  if (days <= 0) return {}
  let cash = state.cash
  let hotels = state.hotels.map((h) => ({ ...h }))
  let activeEvents = state.activeEvents.map((e) => ({ ...e }))
  let lastEventRollDay = state.lastEventRollDay
  let reputation = { ...state.reputation }
  let loan = { ...state.loan }
  let ledger = [...state.ledger]
  const startDay = gameDay(state.gameMinutes)
  let dayClosed = false

  for (let d = 0; d < days; d++) {
    const currentDay = startDay + d
    const minutesAtDay = (currentDay - 1) * 24 * 60 + 12 * 60

    activeEvents = activeEvents
      .map((e) => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
      .filter((e) => e.daysRemaining > 0)

    if (currentDay - lastEventRollDay >= 5 + Math.floor(Math.random() * 6)) {
      lastEventRollDay = currentDay
      if (Math.random() < 0.6 && activeEvents.length < 3) {
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

    let dayRevenue = 0
    let dayCosts = 0
    hotels = hotels.map((h) => {
      const rep = reputation[reputationKey(h.countryCode)] ?? 55
      const day = simulateHotelDay(h, activeEvents, minutesAtDay, rep)
      dayRevenue += day.revenue
      dayCosts += day.costs
      cash += day.net
      reputation[reputationKey(h.countryCode)] = updateReputation(rep, day.net, day.occupancy, day.satisfaction)
      return {
        ...h,
        pricePerNight: day.price,
        lastDayRevenue: day.revenue,
        lastDayCosts: day.costs,
        lastDayOccupancy: day.occupancy,
        lifetimeRevenue: h.lifetimeRevenue + day.revenue,
        lifetimeCosts: h.lifetimeCosts + day.costs,
        lifetimeGuests: h.lifetimeGuests + day.guests,
        satisfaction: day.satisfaction,
      }
    })

    // Loan interest + minimum service
    let loanPayment = 0
    if (loan.balance > 0) {
      const interest = Math.round(loan.balance * loan.dailyRate)
      const principal = Math.min(loan.balance, Math.max(5000, Math.round(loan.balance * 0.001)))
      loanPayment = interest + principal
      cash -= loanPayment
      loan = { ...loan, balance: Math.max(0, loan.balance - principal) }
      dayCosts += loanPayment
    }

    const season = getSeason(20, minutesAtDay) // global label approximate
    ledger.push({
      day: currentDay,
      revenue: dayRevenue,
      costs: dayCosts,
      net: dayRevenue - dayCosts,
      cash,
      loanPayment,
      season,
    })
    if (ledger.length > 60) ledger = ledger.slice(-60)
    dayClosed = true
  }

  return { cash, hotels, activeEvents, lastEventRollDay, reputation, loan, ledger, _dayClosed: dayClosed }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedHotelId: null,
  buildLocation: null,
  showLanding: true,
  showFinance: false,
  showLoan: false,
  mapLayer: 'streets',
  mapFilters: { subsidiaryId: 'all', minStars: 1, profit: 'all' },

  tick: (deltaGameMinutes) => {
    const state = get()
    if (!state.started || state.speed === 0 || deltaGameMinutes <= 0) return
    const prevDay = gameDay(state.gameMinutes)
    const gameMinutes = state.gameMinutes + deltaGameMinutes
    const nextDay = gameDay(gameMinutes)
    const daysPassed = nextDay - prevDay
    const dayPatch = applyDays(state, daysPassed)
    const { _dayClosed, ...patch } = dayPatch
    set({ gameMinutes, ...patch })
    if (_dayClosed) playDaySound(get().soundEnabled)
  },

  setSpeed: (speed) => set({ speed }),

  skipDay: () => {
    const state = get()
    if (!state.started) return
    const rem = 24 * 60 - (state.gameMinutes % (24 * 60))
    const advance = rem === 0 ? 24 * 60 : rem
    const gameMinutes = state.gameMinutes + advance
    const dayPatch = applyDays(state, 1)
    const { _dayClosed, ...patch } = dayPatch
    set({ gameMinutes, ...patch })
    if (_dayClosed) playDaySound(get().soundEnabled)
  },

  startGame: () => set({ started: true, showLanding: false }),

  newGame: () => {
    set({
      ...initialState(),
      started: true,
      showLanding: false,
      selectedHotelId: null,
      buildLocation: null,
      showFinance: false,
      showLoan: false,
    })
    localStorage.removeItem(STORAGE_KEY)
  },

  openBuildAt: (loc) => set({ buildLocation: loc, selectedHotelId: null }),
  closeBuild: () => set({ buildLocation: null }),
  selectHotel: (id) => set({ selectedHotelId: id, buildLocation: id ? null : get().buildLocation }),

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
    const available = state.cash + (state.loan.limit - state.loan.balance)
    if (cost > state.cash) {
      return { ok: false, error: 'Fondos insuficientes. Puedes abrir crédito en Préstamos.' }
    }
    void available

    const season = getSeason(loc.lat, state.gameMinutes)
    const image = draft.imageDataUrl || hotelPlaceholderImage(sub, draft.name.trim())
    const seedHotel = {
      stars: draft.stars,
      tourismIndex: loc.tourismIndex,
      beachScore: loc.beachScore,
      target: draft.target,
      services: draft.services,
      subsidiaryId: draft.subsidiaryId,
      staffLevel: draft.staffLevel,
    }
    const price = fairPrice(seedHotel, season)
    const rep = state.reputation[reputationKey(loc.countryCode)] ?? 55

    const hotel: Hotel = {
      id: uuid(),
      name: draft.name.trim(),
      subsidiaryId: draft.subsidiaryId,
      lat: loc.lat,
      lng: loc.lng,
      stars: draft.stars,
      rooms: draft.rooms,
      pricePerNight: price,
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
      geoRegion: loc.geoRegion,
      builtAtGameDay: gameDay(state.gameMinutes),
      constructionCost: cost,
      lastDayRevenue: 0,
      lastDayCosts: 0,
      lastDayOccupancy: 0,
      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      lifetimeGuests: 0,
      satisfaction: clamp(60 + rep * 0.25, 45, 90),
    }

    set({
      cash: state.cash - cost,
      hotels: [...state.hotels, hotel],
      buildLocation: null,
      selectedHotelId: hotel.id,
    })
    playBuildSound(state.soundEnabled)
    return { ok: true }
  },

  getSnapshot: () => {
    const s = get()
    return {
      version: SAVE_VERSION,
      cash: s.cash,
      gameMinutes: s.gameMinutes,
      speed: s.speed,
      hotels: s.hotels,
      activeEvents: s.activeEvents,
      lastEventRollDay: s.lastEventRollDay,
      cloudSlotId: s.cloudSlotId,
      started: s.started,
      reputation: s.reputation,
      loan: s.loan,
      ledger: s.ledger,
      soundEnabled: s.soundEnabled,
    }
  },

  hydrate: (state) =>
    set({
      ...migrate(state),
      showLanding: !state.started,
      selectedHotelId: null,
      buildLocation: null,
      showFinance: false,
      showLoan: false,
    }),

  persistLocal: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get().getSnapshot()))
  },

  loadLocal: () => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('orbis-hotels-group-save-v1')
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw) as GameState
      get().hydrate(migrate(parsed))
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
      get().hydrate({ ...migrate(parsed), started: true })
      return { ok: true }
    } catch {
      return { ok: false, error: 'No se pudo leer el JSON.' }
    }
  },

  setCloudSlot: (id) => set({ cloudSlotId: id }),
  setShowFinance: (v) => set({ showFinance: v, showLoan: v ? false : get().showLoan }),
  setShowLoan: (v) => set({ showLoan: v, showFinance: v ? false : get().showFinance }),
  setMapLayer: (mapLayer) => set({ mapLayer }),
  setMapFilters: (f) => set({ mapFilters: { ...get().mapFilters, ...f } }),
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),

  takeLoan: (amount) => {
    const { loan, cash } = get()
    const room = loan.limit - loan.balance
    if (amount <= 0) return { ok: false, error: 'Importe no válido.' }
    if (amount > room) return { ok: false, error: `Crédito disponible: ${room.toLocaleString('es-ES')} €` }
    set({
      cash: cash + amount,
      loan: { ...loan, balance: loan.balance + amount },
    })
    return { ok: true }
  },

  repayLoan: (amount) => {
    const { loan, cash } = get()
    if (amount <= 0) return { ok: false, error: 'Importe no válido.' }
    if (amount > cash) return { ok: false, error: 'No hay caja suficiente.' }
    if (amount > loan.balance) return { ok: false, error: 'El importe supera la deuda.' }
    set({
      cash: cash - amount,
      loan: { ...loan, balance: loan.balance - amount },
    })
    return { ok: true }
  },
}))

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export type { DayLedger }
