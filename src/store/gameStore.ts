import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { STARTING_CASH } from '../data/catalog'
import { EVENT_POOL } from '../data/events'
import { getSubsidiary } from '../data/subsidiaries'
import {
  applyHotelDayInPlace,
  calcConstructionCost,
  fairPrice,
  getSeason,
  reputationKey,
  updateReputation,
} from '../lib/economy'
import { defaultImageKey } from '../lib/images'
import { gameDay } from '../lib/format'
import { playBuildSound, playDaySound } from '../lib/sound'
import type {
  BuildDraft,
  GameState,
  Hotel,
  LoanState,
  LocationInsight,
  MapFilters,
  MapFocus,
  MapLayer,
  MapMode,
  RankMetric,
  SpeedOption,
  WorldEvent,
} from '../types'

export const STORAGE_KEY = 'orbis-hotels-group-save-v3'
export const SAVE_VERSION = 3

type UiState = {
  selectedHotelId: string | null
  buildLocation: LocationInsight | null
  showLanding: boolean
  showFinance: boolean
  showLoan: boolean
  showHotels: boolean
  showRanking: boolean
  mapLayer: MapLayer
  mapMode: MapMode
  mapFilters: MapFilters
  mapFocus: MapFocus | null
  rankMetric: RankMetric
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
    setShowHotels: (v: boolean) => void
    setShowRanking: (v: boolean) => void
    setMapLayer: (l: MapLayer) => void
    setMapMode: (m: MapMode) => void
    setMapFilters: (f: Partial<MapFilters>) => void
    setMapFocus: (f: MapFocus | null) => void
    setRankMetric: (m: RankMetric) => void
    focusHotel: (id: string) => void
    toggleSound: () => void
    takeLoan: (amount: number) => { ok: true } | { ok: false; error: string }
    repayLoan: (amount: number) => { ok: true } | { ok: false; error: string }
    closeAllPanels: () => void
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
  const hotels = (raw.hotels ?? []).map((h) => {
    const anyH = h as Hotel & { imageDataUrl?: string }
    return {
      ...anyH,
      satisfaction: anyH.satisfaction ?? 70,
      geoRegion: anyH.geoRegion ?? 'global',
      imageKey: anyH.imageKey || defaultImageKey(anyH.subsidiaryId),
      contract: anyH.contract ?? null,
      // Drop huge legacy inline images from mass saves unless custom upload marker needed
      imageDataUrl: anyH.imageDataUrl?.startsWith('data:image/svg') ? undefined : anyH.imageDataUrl,
    } as Hotel
  })
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
  // Shallow-clone hotel objects once; mutate fields in place for speed
  const hotels = state.hotels.map((h) => ({ ...h, services: h.services, contract: h.contract ? { ...h.contract } : null }))
  let activeEvents = state.activeEvents.map((e) => ({ ...e }))
  let lastEventRollDay = state.lastEventRollDay
  const reputation = { ...state.reputation }
  let loan = { ...state.loan }
  let ledger = state.ledger.slice()
  const startDay = gameDay(state.gameMinutes)
  let dayClosed = false

  for (let d = 0; d < days; d++) {
    const currentDay = startDay + d
    const minutesAtDay = (currentDay - 1) * 24 * 60 + 12 * 60
    const globalSeason = getSeason(20, minutesAtDay)

    activeEvents = activeEvents
      .map((e) => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
      .filter((e) => e.daysRemaining > 0)

    if (currentDay - lastEventRollDay >= 5 + Math.floor(Math.random() * 6)) {
      lastEventRollDay = currentDay
      if (Math.random() < 0.62 && activeEvents.length < 3) {
        const seasonal = EVENT_POOL.filter((p) => !p.season || p.season === 'any' || p.season === globalSeason)
        const pool = seasonal[Math.floor(Math.random() * seasonal.length)] ?? EVENT_POOL[0]
        const ev: WorldEvent = {
          ...pool,
          id: `${pool.id}-${currentDay}-${Math.random().toString(36).slice(2, 7)}`,
          daysRemaining: 3 + Math.floor(Math.random() * 5),
          startedAtDay: currentDay,
        }
        activeEvents.push(ev)
      }
    }

    let dayRevenue = 0
    let dayCosts = 0
    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      const key = reputationKey(h.countryCode)
      const rep = reputation[key] ?? 55
      const net = applyHotelDayInPlace(h, activeEvents, minutesAtDay, rep)
      dayRevenue += h.lastDayRevenue
      dayCosts += h.lastDayCosts
      cash += net
      reputation[key] = updateReputation(rep, net, h.lastDayOccupancy, h.satisfaction)
    }

    let loanPayment = 0
    if (loan.balance > 0) {
      const interest = Math.round(loan.balance * loan.dailyRate)
      const principal = Math.min(loan.balance, Math.max(5000, Math.round(loan.balance * 0.001)))
      loanPayment = interest + principal
      cash -= loanPayment
      loan = { ...loan, balance: Math.max(0, loan.balance - principal) }
      dayCosts += loanPayment
    }

    ledger.push({
      day: currentDay,
      revenue: dayRevenue,
      costs: dayCosts,
      net: dayRevenue - dayCosts,
      cash,
      loanPayment,
      season: globalSeason,
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
  showHotels: false,
  showRanking: false,
  mapLayer: 'streets',
  mapMode: 'inspect',
  mapFilters: { subsidiaryId: 'all', minStars: 1, profit: 'all' },
  mapFocus: null,
  rankMetric: 'net',

  tick: (deltaGameMinutes) => {
    const state = get()
    if (!state.started || state.speed === 0 || deltaGameMinutes <= 0) return
    const prevDay = gameDay(state.gameMinutes)
    const gameMinutes = state.gameMinutes + deltaGameMinutes
    const nextDay = gameDay(gameMinutes)
    const { _dayClosed, ...patch } = applyDays(state, nextDay - prevDay)
    set({ gameMinutes, ...patch })
    if (_dayClosed) playDaySound(get().soundEnabled)
  },

  setSpeed: (speed) => set({ speed }),

  skipDay: () => {
    const state = get()
    if (!state.started) return
    const rem = 24 * 60 - (state.gameMinutes % (24 * 60))
    const advance = rem === 0 ? 24 * 60 : rem
    const { _dayClosed, ...patch } = applyDays(state, 1)
    set({ gameMinutes: state.gameMinutes + advance, ...patch })
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
      showHotels: false,
      showRanking: false,
      mapMode: 'inspect',
      mapFocus: null,
    })
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('orbis-hotels-group-save-v2')
    localStorage.removeItem('orbis-hotels-group-save-v1')
  },

  openBuildAt: (loc) => set({ buildLocation: loc, selectedHotelId: null, showHotels: false, showRanking: false }),
  closeBuild: () => set({ buildLocation: null }),
  selectHotel: (id) =>
    set({
      selectedHotelId: id,
      buildLocation: id ? null : get().buildLocation,
      showFinance: false,
      showLoan: false,
    }),

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
    if (cost > state.cash) {
      return { ok: false, error: 'Fondos insuficientes. Puedes abrir crédito en Préstamos.' }
    }

    const season = getSeason(loc.lat, state.gameMinutes)
    const seed = {
      stars: draft.stars,
      tourismIndex: loc.tourismIndex,
      beachScore: loc.beachScore,
      target: draft.target,
      services: draft.services,
      subsidiaryId: draft.subsidiaryId,
      staffLevel: draft.staffLevel,
    }
    const price = fairPrice(seed, season)
    const rep = state.reputation[reputationKey(loc.countryCode)] ?? 55
    const customImage =
      draft.imageDataUrl && !draft.imageDataUrl.includes('image/svg+xml') ? draft.imageDataUrl : undefined

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
      imageDataUrl: customImage,
      imageKey: draft.imageKey || defaultImageKey(draft.subsidiaryId),
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
      contract: null,
    }

    set({
      cash: state.cash - cost,
      hotels: [...state.hotels, hotel],
      buildLocation: null,
      selectedHotelId: hotel.id,
      mapMode: 'inspect',
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
      showHotels: false,
      showRanking: false,
      mapFocus: null,
    }),

  persistLocal: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().getSnapshot()))
    } catch {
      // Quota exceeded with huge saves — try compacting by stripping optional fields already handled
      console.warn('No se pudo guardar: almacenamiento lleno')
    }
  },

  loadLocal: () => {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem('orbis-hotels-group-save-v2') ??
      localStorage.getItem('orbis-hotels-group-save-v1')
    if (!raw) return false
    try {
      get().hydrate(migrate(JSON.parse(raw) as GameState))
      return true
    } catch {
      return false
    }
  },

  exportSave: () => JSON.stringify(get().getSnapshot()),

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
  setShowFinance: (v) => set({ showFinance: v, showLoan: false, showHotels: false, showRanking: false }),
  setShowLoan: (v) => set({ showLoan: v, showFinance: false, showHotels: false, showRanking: false }),
  setShowHotels: (v) => set({ showHotels: v, showFinance: false, showLoan: false, showRanking: false }),
  setShowRanking: (v) => set({ showRanking: v, showFinance: false, showLoan: false, showHotels: false }),
  setMapLayer: (mapLayer) => set({ mapLayer }),
  setMapMode: (mapMode) => set({ mapMode, buildLocation: mapMode === 'inspect' ? null : get().buildLocation }),
  setMapFilters: (f) => set({ mapFilters: { ...get().mapFilters, ...f } }),
  setMapFocus: (mapFocus) => set({ mapFocus }),
  setRankMetric: (rankMetric) => set({ rankMetric }),
  focusHotel: (id) => {
    const h = get().hotels.find((x) => x.id === id)
    if (!h) return
    set({
      selectedHotelId: id,
      mapFocus: { lat: h.lat, lng: h.lng, zoom: 10, hotelId: id },
      buildLocation: null,
      showHotels: false,
      showRanking: false,
    })
  },
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
  closeAllPanels: () =>
    set({
      buildLocation: null,
      selectedHotelId: null,
      showFinance: false,
      showLoan: false,
      showHotels: false,
      showRanking: false,
    }),

  takeLoan: (amount) => {
    const { loan, cash } = get()
    const room = loan.limit - loan.balance
    if (amount <= 0) return { ok: false, error: 'Importe no válido.' }
    if (amount > room) return { ok: false, error: `Crédito disponible insuficiente.` }
    set({ cash: cash + amount, loan: { ...loan, balance: loan.balance + amount } })
    return { ok: true }
  },

  repayLoan: (amount) => {
    const { loan, cash } = get()
    if (amount <= 0) return { ok: false, error: 'Importe no válido.' }
    if (amount > cash) return { ok: false, error: 'No hay caja suficiente.' }
    if (amount > loan.balance) return { ok: false, error: 'El importe supera la deuda.' }
    set({ cash: cash - amount, loan: { ...loan, balance: loan.balance - amount } })
    return { ok: true }
  },
}))

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
