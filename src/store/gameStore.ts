import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { STARTING_CASH } from '../data/catalog'
import { getSubsidiary } from '../data/subsidiaries'
import {
  BANK_TERMS,
  calcConstructionCost,
  fairPrice,
  getSeason,
  reputationKey,
} from '../lib/economy'
import { generateDemoHotels } from '../lib/demoHotels'
import { defaultImageKey } from '../lib/images'
import { gameDay } from '../lib/format'
import {
  boardOptionsForHotel,
  createStayDraft,
  defaultClientState,
  migrateClientState,
  pushNote,
  roomKindsForHotel,
  clientLevelFromPoints,
  stampPassport,
  CLIENT_NIGHT_POINTS,
  applyNeedDelta,
  partnerShareDelta,
  earlyCheckinFee,
  lateCheckoutFee,
  calcGuestNightPrice,
  bestUpgradeRoom,
  applyWeatherToClient,
  formatAppointmentClock,
  applyBrandTour,
  buildTravelDiaryEntry,
  attachDiary,
  buildNightRecap,
  BRAND_TOUR_BONUS,
} from '../lib/clientMode'
import { serviceHoursStatus } from '../lib/clientHours'
import { getWeather } from '../lib/weather'
import { SLOT_KEYS, idbSave, tryLocalStorageSave, readLocalStorageSave, idbLoad, idbLoadHotelImages, mergeHotelImages } from '../lib/saveio'
import { applyDays } from '../lib/daySim'
import { defaultPersistedUi, migratePersistedUi } from '../lib/balance'
import { playBuildSound, playDaySound, playSellSound } from '../lib/sound'
import type { WorkerDayRequest, WorkerDayResponse } from '../workers/dayWorker'
import type {
  BankDeposit,
  BoardRegime,
  BuildDraft,
  ContractKind,
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
  PlayMode,
  ClientRoomKind,
  GuestTarget,
  HotelService,
} from '../types'
import {
  applyServiceAction,
  buildServiceScreen,
  bumpMissions,
  ensureMissions,
  type ServiceAction,
} from '../lib/clientServices'
import type { MinigameOutcome } from '../lib/clientMinigames'
import { minigameForAction, MINIGAME_LABEL } from '../lib/clientMinigames'
import { lobbyEventForDay } from '../lib/clientLobbyEvents'
import { applyPartnerOrder, PARTNER_ORDERS_PER_NIGHT } from '../lib/clientPartner'
import {
  POINT_REDEEMS,
  redeemPointsCost,
  type PointRedeemId,
} from '../lib/clientClub'

export const STORAGE_KEY = 'orbis-hotels-group-save-v15'
export const SAVE_VERSION = 15
export const IDB_SLOT_KEYS = ['slot-1', 'slot-2', 'slot-3'] as const

/** Claves legacy de localStorage (compat. hacia atrás). */
export const LEGACY_STORAGE_KEYS = [
  'orbis-hotels-group-save-v14',
  'orbis-hotels-group-save-v13',
  'orbis-hotels-group-save-v12',
  'orbis-hotels-group-save-v11',
  'orbis-hotels-group-save-v10',
  'orbis-hotels-group-save-v9',
  'orbis-hotels-group-save-v8',
  'orbis-hotels-group-save-v7',
  'orbis-hotels-group-save-v6',
  'orbis-hotels-group-save-v5',
  'orbis-hotels-group-save-v4',
  'orbis-hotels-group-save-v3',
  'orbis-hotels-group-save-v2',
  'orbis-hotels-group-save-v1',
] as const

type UiState = {
  selectedHotelId: string | null
  compareIds: [string | null, string | null]
  buildLocation: LocationInsight | null
  showLanding: boolean
  showFinance: boolean
  showLoan: boolean
  showBank: boolean
  showHotels: boolean
  showRanking: boolean
  showCountries: boolean
  showNews: boolean
  showCompare: boolean
  showStats: boolean
  showWeekly: boolean
  showHotelSpecs: boolean
  showPlan: boolean
  showPauseMenu: boolean
  mapLayer: MapLayer
  mapMode: MapMode
  mapFilters: MapFilters
  mapFocus: MapFocus | null
  rankMetric: RankMetric
  simulating: boolean
  simProgress: string
  saveToast: string | null
  /** Fuerza remount de Leaflet tras hidratar / nueva partida / Continuar. */
  mapEpoch: number
}

type GameStore = GameState &
  UiState & {
    tick: (deltaGameMinutes: number) => void
    setSpeed: (s: SpeedOption) => void
    skipDay: () => Promise<void>
    startGame: () => void
    newGame: () => void
    openBuildAt: (loc: LocationInsight) => void
    closeBuild: () => void
    selectHotel: (id: string | null) => void
    buildHotel: (
      draft: BuildDraft,
      loc: LocationInsight,
      opts?: { finance?: boolean },
    ) => { ok: true; hotel: Hotel; financed: number } | { ok: false; error: string }
    persistLocal: () => void
    loadLocal: () => Promise<boolean>
    exportSave: () => string
    importSave: (json: string) => { ok: true } | { ok: false; error: string }
    importState: (state: GameState) => { ok: true } | { ok: false; error: string }
    getSnapshot: () => GameState
    hydrate: (state: GameState) => void
    setShowFinance: (v: boolean) => void
    setShowLoan: (v: boolean) => void
    setShowBank: (v: boolean) => void
    setShowHotels: (v: boolean) => void
    setShowRanking: (v: boolean) => void
    setShowCountries: (v: boolean) => void
    setShowNews: (v: boolean) => void
    setShowCompare: (v: boolean) => void
    setShowStats: (v: boolean) => void
    setShowWeekly: (v: boolean) => void
    setShowHotelSpecs: (v: boolean) => void
    setShowPlan: (v: boolean) => void
    setShowPauseMenu: (v: boolean) => void
    setCompareSlot: (slot: 0 | 1, hotelId: string | null) => void
    clearSaveToast: () => void
    setMapLayer: (l: MapLayer) => void
    setMapMode: (m: MapMode) => void
    setMapFilters: (f: Partial<MapFilters>) => void
    setMapFocus: (f: MapFocus | null) => void
    setRankMetric: (m: RankMetric) => void
    focusHotel: (id: string) => void
    focusNextHotel: (dir: 1 | -1) => void
    toggleSound: () => void
    takeLoan: (amount: number) => { ok: true } | { ok: false; error: string }
    repayLoan: (amount: number) => { ok: true } | { ok: false; error: string }
    openDeposit: (amount: number, termDays: number) => { ok: true } | { ok: false; error: string }
    generateDemo: (count?: number) => { ok: true; added: number } | { ok: false; error: string }
    markPlanDone: (order: number) => void
    skipPlanHotel: (order: number) => void
    setPlanCursor: (order: number) => void
    closeAllPanels: () => void
    setGameName: (name: string) => void
    saveToSlot: (slot: 1 | 2 | 3) => Promise<void>
    loadFromSlot: (slot: 1 | 2 | 3) => Promise<boolean>
    setCloudSlot: (id: string | null) => void
    setHotelPrice: (id: string, price: number) => void
    setHotelPriceManual: (id: string, manual: boolean) => void
    setHotelBoard: (id: string, regime: BoardRegime) => void
    setHotelClosed: (id: string, closed: boolean) => void
    sellHotel: (id: string) => { ok: true; proceeds: number } | { ok: false; error: string }
    renovateHotel: (id: string) => { ok: true; cost: number } | { ok: false; error: string }
    setPlayMode: (mode: PlayMode) => void
    setClientName: (name: string) => void
    setClientPrefs: (prefs: GuestTarget[]) => void
    setClientBookingHotel: (id: string | null) => void
    clientReserve: (
      hotelId: string,
      roomKind: ClientRoomKind,
      board: BoardRegime,
      nights?: number,
    ) => { ok: true } | { ok: false; error: string }
    clientCancelReservation: () => void
    clientCheckIn: (opts?: {
      early?: boolean
    }) => { ok: true } | { ok: false; error: string }
    clientCheckOut: (opts?: {
      late?: boolean
    }) => { ok: true } | { ok: false; error: string }
    clientUseService: (
      service: HotelService,
      tip?: number,
      actionId?: string,
    ) => { ok: true } | { ok: false; error: string }
    clientBeginMinigame: (
      service: HotelService,
      tip: number,
      actionId: string,
    ) => { ok: true; entryCost: number } | { ok: false; error: string }
    clientBeginLobbyActivity: (
      id: import('../lib/clientMinigames').MinigameId,
      cost: number,
    ) => { ok: true; entryCost: number } | { ok: false; error: string }
    clientFinishMinigame: (
      outcome: import('../lib/clientMinigames').MinigameOutcome,
    ) => { ok: true } | { ok: false; error: string }
    clientClaimMission: (id: string) => { ok: true } | { ok: false; error: string }
    clientRedeemPoints: (id: PointRedeemId) => { ok: true } | { ok: false; error: string }
    /** @deprecated usa clientRedeemPoints('noche') */
    clientRedeemFreeNight: () => { ok: true } | { ok: false; error: string }
    clientOrderRoomServiceCart: (
      items: { actionId: string; qty: number }[],
      tip?: number,
    ) => { ok: true; total: number } | { ok: false; error: string }
    clientRefreshMissions: () => void
    clientClearNotes: () => void
    clientDismissStay: () => void
    clientDismissNightRecap: () => void
    setPartnerMode: (mode: 'auto' | 'orders') => void
    clientPartnerOrder: (id: import('../lib/clientPartner').PartnerOrderId) => { ok: true } | { ok: false; error: string }
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
    gameName: 'Mi partida Orbis',
    news: [],
    countryEconomy: {},
    bankDeposits: [],
    loyaltyLevel: 1,
    loyaltyPoints: 0,
    lastWeeklyReportDay: 0,
    weeklyReports: [],
    planDoneOrders: [],
    planCursor: 1,
    playMode: 'gerente',
    client: defaultClientState(),
    ui: defaultPersistedUi(),
  }
}

function migrateHotel(h: Hotel): Hotel {
  const anyH = h as Hotel & {
    buffet?: boolean
    buffetType?: string
    barType?: string
    restaurantConcept?: string
  }
  return {
    ...anyH,
    satisfaction: anyH.satisfaction ?? 70,
    geoRegion: anyH.geoRegion ?? 'global',
    imageKey: anyH.imageKey || defaultImageKey(anyH.subsidiaryId),
    contract: anyH.contract
      ? {
          ...anyH.contract,
          kind: ((anyH.contract as { kind?: string }).kind ?? 'empresa') as ContractKind,
        }
      : null,
    insurance: anyH.insurance ?? null,
    roomMix: anyH.roomMix ?? 'estandar',
    buildQuality: anyH.buildQuality ?? 'bueno',
    floors: anyH.floors ?? 4,
    greenLevel: anyH.greenLevel ?? 'ninguno',
    meetingRooms: anyH.meetingRooms ?? 0,
    parkingSpots: anyH.parkingSpots ?? 20,
    restaurantLevel: anyH.restaurantLevel ?? 1,
    openingPromoDays: anyH.openingPromoDays ?? 0,
    lastDayTax: anyH.lastDayTax ?? 0,
    lifetimeTax: anyH.lifetimeTax ?? 0,
    securityLevel: anyH.securityLevel ?? 'medio',
    techLevel: anyH.techLevel ?? 'basico',
    breakfastIncluded: anyH.breakfastIncluded ?? false,
    seaViewShare: anyH.seaViewShare ?? 0,
    loyaltyProgram: anyH.loyaltyProgram ?? false,
    vipTonight: anyH.vipTonight ?? false,
    lastVipDay: anyH.lastVipDay ?? 0,
    boardRegime: anyH.boardRegime ?? (anyH.breakfastIncluded ? 'desayuno' : 'solo'),
    availableRegimes:
      anyH.availableRegimes?.length
        ? anyH.availableRegimes
        : [anyH.boardRegime ?? (anyH.breakfastIncluded ? 'desayuno' : 'solo')],
    condition: anyH.condition ?? 100,
    lastRenovationDay: anyH.lastRenovationDay ?? 0,
    imageDataUrl: anyH.imageDataUrl?.startsWith('data:image/svg') ? undefined : anyH.imageDataUrl,
    designFocus: anyH.designFocus ?? 'vistas',
    buffetTypes: normalizeFbList(
      anyH.buffetTypes,
      anyH.buffetType ?? (anyH.buffet ? 'continental' : undefined),
    ),
    barTypes: normalizeFbList(anyH.barTypes, anyH.barType),
    restaurantConcepts: normalizeFbList(
      anyH.restaurantConcepts,
      anyH.restaurantConcept ?? (anyH.restaurantLevel > 0 ? 'a_la_carta' : undefined),
    ),
    lateCheckout: anyH.lateCheckout ?? false,
    airportDesk: anyH.airportDesk ?? false,
    quietHours: anyH.quietHours ?? false,
    bikeRental: anyH.bikeRental ?? false,
    shuttleCity: anyH.shuttleCity ?? false,
    priceManual: anyH.priceManual ?? false,
    closed: anyH.closed ?? false,
    airportScore: anyH.airportScore,
    stationScore: anyH.stationScore,
  }
}

function normalizeFbList<T extends string>(arr: T[] | undefined, legacy?: T | string): T[] {
  if (Array.isArray(arr) && arr.length) {
    return [...new Set(arr.filter((id) => id && id !== 'ninguno'))] as T[]
  }
  if (legacy && legacy !== 'ninguno') return [legacy as T]
  return []
}

function migrate(raw: Partial<GameState> & { cash?: number }): GameState {
  const base = initialState()
  const hotels = (raw.hotels ?? []).map(migrateHotel)
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    hotels,
    reputation: raw.reputation ?? {},
    loan: raw.loan ?? defaultLoan(),
    ledger: (raw.ledger ?? []).map((d) => ({ ...d, tax: d.tax ?? 0 })),
    soundEnabled: raw.soundEnabled ?? true,
    gameName: raw.gameName ?? 'Mi partida Orbis',
    news: raw.news ?? [],
    countryEconomy: Object.fromEntries(
      Object.entries(raw.countryEconomy ?? {}).map(([k, v]) => [
        k,
        {
          inflation: v.inflation ?? 0.0004,
          fx: v.fx ?? 1,
          taxDrift: v.taxDrift ?? 1,
          touristDrift: v.touristDrift ?? 1,
        },
      ]),
    ),
    bankDeposits: raw.bankDeposits ?? [],
    loyaltyLevel: raw.loyaltyLevel ?? 1,
    loyaltyPoints: raw.loyaltyPoints ?? hotels.reduce((s, h) => s + h.lifetimeGuests, 0),
    lastWeeklyReportDay: raw.lastWeeklyReportDay ?? 0,
    weeklyReports: raw.weeklyReports ?? [],
    planDoneOrders: Array.isArray(raw.planDoneOrders) ? raw.planDoneOrders : [],
    planCursor: typeof raw.planCursor === 'number' && raw.planCursor > 0 ? raw.planCursor : 1,
    playMode: 'gerente',
    client: migrateClientState(raw.client),
    ui: migratePersistedUi(raw.ui),
  }
}

import { createDayWorker } from '../lib/dayWorkerHost'

let worker: Worker | null = null
let workerBusy = false
let workerFailed = false

function canUseWorker(): boolean {
  if (workerFailed) return false
  if (typeof window === 'undefined') return false
  // file:// bloquea workers módulo y type=module
  if (window.location?.protocol === 'file:') return false
  return typeof Worker !== 'undefined'
}

function getWorker(): Worker | null {
  if (!canUseWorker()) return null
  if (!worker) {
    worker = createDayWorker()
    if (!worker) {
      workerFailed = true
      return null
    }
    worker.addEventListener('error', () => {
      workerFailed = true
      worker = null
    })
  }
  return worker
}

function runDaysOnMain(state: GameState, days: number): WorkerDayResponse {
  return applyDays(
    {
      cash: state.cash,
      gameMinutes: state.gameMinutes,
      hotels: state.hotels,
      activeEvents: state.activeEvents,
      lastEventRollDay: state.lastEventRollDay,
      reputation: state.reputation,
      loan: state.loan,
      ledger: state.ledger,
      countryEconomy: state.countryEconomy,
      news: state.news,
      bankDeposits: state.bankDeposits,
      loyaltyLevel: state.loyaltyLevel,
      loyaltyPoints: state.loyaltyPoints,
      lastWeeklyReportDay: state.lastWeeklyReportDay,
      weeklyReports: state.weeklyReports,
    },
    days,
  )
}

function runDaysInWorker(state: GameState, days: number): Promise<WorkerDayResponse> {
  const w = getWorker()
  if (!w) return Promise.resolve(runDaysOnMain(state, days))

  return new Promise((resolve, reject) => {
    if (workerBusy) {
      reject(new Error('busy'))
      return
    }
    workerBusy = true
    const onMsg = (ev: MessageEvent<WorkerDayResponse>) => {
      if (ev.data?.type !== 'applyDaysResult') return
      w.removeEventListener('message', onMsg)
      w.removeEventListener('error', onErr)
      workerBusy = false
      resolve(ev.data)
    }
    const onErr = () => {
      w.removeEventListener('message', onMsg)
      w.removeEventListener('error', onErr)
      workerBusy = false
      workerFailed = true
      worker = null
      // Fallback al hilo principal
      resolve(runDaysOnMain(state, days))
    }
    w.addEventListener('message', onMsg)
    w.addEventListener('error', onErr)
    const payload: WorkerDayRequest = {
      type: 'applyDays',
      days,
      state: {
        cash: state.cash,
        gameMinutes: state.gameMinutes,
        hotels: state.hotels,
        activeEvents: state.activeEvents,
        lastEventRollDay: state.lastEventRollDay,
        reputation: state.reputation,
        loan: state.loan,
        ledger: state.ledger,
        countryEconomy: state.countryEconomy,
        news: state.news,
        bankDeposits: state.bankDeposits,
        loyaltyLevel: state.loyaltyLevel,
        loyaltyPoints: state.loyaltyPoints,
        lastWeeklyReportDay: state.lastWeeklyReportDay,
        weeklyReports: state.weeklyReports,
      },
    }
    try {
      w.postMessage(payload)
    } catch {
      onErr()
    }
  })
}

function closePanelsExcept(keep: Partial<UiState>): Partial<UiState> {
  return {
    showFinance: false,
    showLoan: false,
    showBank: false,
    showHotels: false,
    showRanking: false,
    showCountries: false,
    showNews: false,
    showCompare: false,
    showStats: false,
    showWeekly: false,
    showHotelSpecs: false,
    showPlan: false,
    showPauseMenu: false,
    ...keep,
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedHotelId: null,
  compareIds: [null, null],
  buildLocation: null,
  showLanding: true,
  showFinance: false,
  showLoan: false,
  showBank: false,
  showHotels: false,
  showRanking: false,
  showCountries: false,
  showNews: false,
  showCompare: false,
  showStats: false,
  showWeekly: false,
    showHotelSpecs: false,
    showPlan: false,
    showPauseMenu: false,
    mapLayer: 'streets',
    mapMode: 'inspect',
    mapFilters: {
      subsidiaryId: 'all',
      minStars: 1,
      profit: 'all',
      countryCode: 'all',
      insured: 'all',
      vipRecent: false,
      lowCondition: false,
      clientStayFilter: 'all',
    },
    mapFocus: null,
    rankMetric: 'net',
    simulating: false,
    simProgress: '',
    saveToast: null,
    mapEpoch: 0,

  tick: (deltaGameMinutes) => {
    const state = get()
    if (!state.started || state.speed === 0 || deltaGameMinutes <= 0 || state.simulating) return
    const prevDay = gameDay(state.gameMinutes)
    const gameMinutes = state.gameMinutes + deltaGameMinutes
    const nextDay = gameDay(gameMinutes)
    const days = nextDay - prevDay
    if (days <= 0) {
      set({ gameMinutes })
      return
    }
    void runSkipDays(days, gameMinutes)
  },

  setSpeed: (speed) => set({ speed }),

  skipDay: async () => {
    const state = get()
    if (!state.started || state.simulating) return
    const rem = 24 * 60 - (state.gameMinutes % (24 * 60))
    const advance = rem === 0 ? 24 * 60 : rem
    await runSkipDays(1, state.gameMinutes + advance)
  },

  startGame: () =>
    set((s) => ({
      started: true,
      showLanding: false,
      mapFocus: null,
      selectedHotelId: null,
      mapMode: 'inspect',
      mapLayer: 'streets',
      simulating: false,
      mapEpoch: s.mapEpoch + 1,
    })),

  newGame: () => {
    set((s) => ({
      ...initialState(),
      started: true,
      showLanding: false,
      selectedHotelId: null,
      compareIds: [null, null],
      buildLocation: null,
      ...closePanelsExcept({}),
      mapMode: 'inspect',
      mapFocus: null,
      simulating: false,
      mapEpoch: s.mapEpoch + 1,
    }))
    localStorage.removeItem(STORAGE_KEY)
  },

  openBuildAt: (loc) =>
    set({
      buildLocation: loc,
      selectedHotelId: null,
      ...closePanelsExcept({}),
    }),
  closeBuild: () => set({ buildLocation: null }),
  selectHotel: (id) =>
    set({
      selectedHotelId: id,
      buildLocation: id ? null : get().buildLocation,
      showFinance: false,
      showLoan: false,
      showBank: false,
    }),

  buildHotel: (draft, loc, opts) => {
    const state = get()
    if (!loc.isLand) return { ok: false, error: 'Solo se puede construir en tierra.' }
    const sub = getSubsidiary(draft.subsidiaryId)
    if (!sub) return { ok: false, error: 'Marca no válida.' }
    if (!draft.name.trim()) return { ok: false, error: 'Pon un nombre al hotel.' }
    if (!draft.imageDataUrl || draft.imageDataUrl.length < 40 || draft.imageDataUrl.includes('image/svg+xml')) {
      return { ok: false, error: 'Sube una foto propia del hotel antes de construir.' }
    }
    if (draft.stars < sub.minStars || draft.stars > sub.maxStars) {
      return { ok: false, error: `Esta marca admite de ${sub.minStars} a ${sub.maxStars} estrellas.` }
    }
    const cost = calcConstructionCost(draft, loc)
    const shortfall = Math.max(0, cost - state.cash)
    let financed = 0
    let cash = state.cash
    let loan = state.loan
    if (shortfall > 0) {
      if (!opts?.finance) {
        return {
          ok: false,
          error: `Faltan ${Math.round(shortfall).toLocaleString('es-ES')} €. Activa financiación o pide un préstamo.`,
        }
      }
      const room = loan.limit - loan.balance
      if (shortfall > room) {
        return {
          ok: false,
          error: `Ni con el crédito disponible (${Math.round(room).toLocaleString('es-ES')} €) te llega.`,
        }
      }
      financed = shortfall
      cash += financed
      loan = { ...loan, balance: loan.balance + financed }
    }

    const season = getSeason(loc.lat, state.gameMinutes)
    const price = fairPrice(
      {
        stars: draft.stars,
        tourismIndex: loc.tourismIndex,
        beachScore: loc.beachScore,
        target: draft.target,
        services: draft.services,
        subsidiaryId: draft.subsidiaryId,
        staffLevel: draft.staffLevel,
        buildQuality: draft.buildQuality,
        roomMix: draft.roomMix,
        boardRegime: draft.boardRegime,
      },
      season,
    )
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
      airportScore: loc.airportScore ?? 0,
      stationScore: loc.stationScore ?? 0,
      builtAtGameDay: gameDay(state.gameMinutes),
      constructionCost: cost,
      lastDayRevenue: 0,
      lastDayCosts: 0,
      lastDayOccupancy: 0,
      lastDayTax: 0,
      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      lifetimeGuests: 0,
      lifetimeTax: 0,
      satisfaction: clamp(60 + rep * 0.25, 45, 90),
      contract: null,
      insurance: null,
      roomMix: draft.roomMix,
      buildQuality: draft.buildQuality,
      floors: draft.floors,
      greenLevel: draft.greenLevel,
      meetingRooms: draft.meetingRooms,
      parkingSpots: draft.parkingSpots,
      restaurantLevel: draft.restaurantLevel,
      openingPromoDays: draft.openingPromoDays,
      securityLevel: draft.securityLevel,
      techLevel: draft.techLevel,
      breakfastIncluded: draft.breakfastIncluded || draft.boardRegime !== 'solo',
      seaViewShare: draft.seaViewShare,
      loyaltyProgram: draft.loyaltyProgram,
      vipTonight: false,
      lastVipDay: 0,
      boardRegime: draft.boardRegime,
      availableRegimes: [...draft.availableRegimes],
      condition: 100,
      lastRenovationDay: 0,
      designFocus: draft.designFocus,
      buffetTypes: [...draft.buffetTypes],
      barTypes: [...draft.barTypes],
      restaurantConcepts: [...draft.restaurantConcepts],
      lateCheckout: draft.lateCheckout,
      airportDesk: draft.airportDesk,
      quietHours: draft.quietHours,
      bikeRental: draft.bikeRental,
      shuttleCity: draft.shuttleCity,
      priceManual: false,
      closed: false,
    }

    set({
      cash: cash - cost,
      loan,
      hotels: [...state.hotels, hotel],
      buildLocation: null,
      selectedHotelId: hotel.id,
      mapMode: 'inspect',
    })
    playBuildSound(state.soundEnabled)
    return { ok: true, hotel, financed }
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
      gameName: s.gameName,
      news: s.news,
      countryEconomy: s.countryEconomy,
      bankDeposits: s.bankDeposits,
      loyaltyLevel: s.loyaltyLevel,
      loyaltyPoints: s.loyaltyPoints,
      lastWeeklyReportDay: s.lastWeeklyReportDay,
      weeklyReports: s.weeklyReports,
      planDoneOrders: s.planDoneOrders,
      planCursor: s.planCursor,
      playMode: s.playMode,
      client: s.client,
      ui: {
        mapLayer: s.mapLayer,
        mapMode: s.mapMode,
        mapFilters: s.mapFilters,
        // No persistir mapFocus: al cargar provocaba flyTo antes de que el mapa tuviera tamaño
        mapFocus: null,
        selectedHotelId: null,
        rankMetric: s.rankMetric,
        lastSimMs: s.ui?.lastSimMs ?? 0,
        lastSimHotels: s.ui?.lastSimHotels ?? 0,
      },
    }
  },

  hydrate: (state) => {
    const m = migrate(state)
    set((s) => {
      // Si seguimos en el landing, NO montar el mapa aquí: startGame() lo hace
      // en un único paint (igual que Nueva partida). Montar durante hydrate
      // con la partida pesada deja Leaflet en negro.
      const onLanding = s.showLanding
      return {
        ...m,
        started: onLanding ? false : true,
        showLanding: onLanding,
        selectedHotelId: null,
        compareIds: [null, null],
        buildLocation: null,
        ...closePanelsExcept({}),
        mapLayer: 'streets',
        mapMode: 'inspect',
        mapFilters: m.ui.mapFilters,
        mapFocus: null,
        rankMetric: m.ui.rankMetric,
        simulating: false,
        simProgress: '',
        mapEpoch: onLanding ? s.mapEpoch : s.mapEpoch + 1,
      }
    })
  },

  persistLocal: () => {
    const snap = get().getSnapshot()
    const json = JSON.stringify(snap)
    const bytes = json.length
    const ok = tryLocalStorageSave(STORAGE_KEY, snap)
    void idbSave(snap).catch(() => {})
    const size =
      bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`
    set({
      saveToast: ok
        ? `Guardado · ${size}`
        : `Guardado local (IndexedDB) · ${size}`,
    })
    window.setTimeout(() => {
      if (useGameStore.getState().saveToast?.startsWith('Guardado')) {
        useGameStore.setState({ saveToast: null })
      }
    }, 3200)
  },

  loadLocal: async () => {
    // Prefer IndexedDB: incluye fotos de hoteles
    const fromIdb = await idbLoad()
    if (fromIdb) {
      try {
        get().hydrate(migrate(fromIdb))
        return true
      } catch {
        /* fall through */
      }
    }
    const fromLs = readLocalStorageSave([
      STORAGE_KEY,
      ...LEGACY_STORAGE_KEYS,
    ])
    if (!fromLs) return false
    try {
      const images = await idbLoadHotelImages()
      get().hydrate(migrate(mergeHotelImages(fromLs, images)))
      return true
    } catch {
      try {
        get().hydrate(migrate(fromLs))
        return true
      } catch {
        return false
      }
    }
  },

  exportSave: () => JSON.stringify(get().getSnapshot()),

  importSave: (json) => {
    try {
      const parsed = JSON.parse(json) as GameState
      return get().importState(parsed)
    } catch {
      return { ok: false, error: 'No se pudo leer el archivo.' }
    }
  },

  importState: (parsed) => {
    if (!parsed || typeof parsed.cash !== 'number' || !Array.isArray(parsed.hotels)) {
      return { ok: false, error: 'Archivo no válido.' }
    }
    get().hydrate({ ...migrate(parsed), started: true })
    return { ok: true }
  },

  setCloudSlot: (id) => set({ cloudSlotId: id }),
  setShowFinance: (v) => set(closePanelsExcept({ showFinance: v })),
  setShowLoan: (v) => set(closePanelsExcept({ showLoan: v })),
  setShowBank: (v) => set(closePanelsExcept({ showBank: v })),
  setShowHotels: (v) => set(closePanelsExcept({ showHotels: v })),
  setShowRanking: (v) => set(closePanelsExcept({ showRanking: v })),
  setShowCountries: (v) => set(closePanelsExcept({ showCountries: v })),
  setShowNews: (v) => set(closePanelsExcept({ showNews: v })),
  setShowCompare: (v) => set(closePanelsExcept({ showCompare: v })),
  setShowStats: (v) => set(closePanelsExcept({ showStats: v })),
  setShowWeekly: (v) => set(closePanelsExcept({ showWeekly: v })),
  setShowHotelSpecs: (v) => set({ showHotelSpecs: v }),
  setShowPlan: (v) => set(closePanelsExcept({ showPlan: v })),
  setShowPauseMenu: (v) => set({ showPauseMenu: v }),
  setCompareSlot: (slot, hotelId) => {
    const ids = [...get().compareIds] as [string | null, string | null]
    ids[slot] = hotelId
    set({ compareIds: ids, showCompare: true })
  },
  clearSaveToast: () => set({ saveToast: null }),
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
      ...closePanelsExcept({}),
    })
  },
  focusNextHotel: (dir) => {
    const { hotels, selectedHotelId } = get()
    if (hotels.length === 0) return
    const idx = hotels.findIndex((h) => h.id === selectedHotelId)
    const next = hotels[(idx < 0 ? 0 : idx + dir + hotels.length) % hotels.length]
    get().focusHotel(next.id)
  },
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
  closeAllPanels: () =>
    set({
      buildLocation: null,
      selectedHotelId: null,
      showPauseMenu: false,
      ...closePanelsExcept({}),
    }),
  setGameName: (gameName) => set({ gameName }),

  saveToSlot: async (slot) => {
    const key = SLOT_KEYS[slot - 1]
    const idbKey = IDB_SLOT_KEYS[slot - 1]
    const snap = get().getSnapshot()
    tryLocalStorageSave(key, snap)
    await idbSave(snap, idbKey).catch(() => {})
    get().persistLocal()
  },

  loadFromSlot: async (slot) => {
    const key = SLOT_KEYS[slot - 1]
    const idbKey = IDB_SLOT_KEYS[slot - 1]
    const fromIdb = await idbLoad(idbKey)
    if (fromIdb) {
      try {
        get().hydrate({ ...migrate(fromIdb), started: true })
        return true
      } catch {
        /* fall through */
      }
    }
    const raw = localStorage.getItem(key)
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw) as GameState
      const images = await idbLoadHotelImages(idbKey)
      get().hydrate({ ...migrate(mergeHotelImages(parsed, images)), started: true })
      return true
    } catch {
      return false
    }
  },

  setHotelPrice: (id, price) => {
    const p = Math.round(Math.min(2500, Math.max(35, price)))
    set({
      hotels: get().hotels.map((h) =>
        h.id === id ? { ...h, pricePerNight: p, priceManual: true } : h,
      ),
    })
  },

  setHotelPriceManual: (id, manual) => {
    set({
      hotels: get().hotels.map((h) => (h.id === id ? { ...h, priceManual: manual } : h)),
    })
  },

  setHotelBoard: (id, regime) => {
    set({
      hotels: get().hotels.map((h) => {
        if (h.id !== id) return h
        const available = h.availableRegimes.includes(regime)
          ? h.availableRegimes
          : [...h.availableRegimes, regime]
        return {
          ...h,
          boardRegime: regime,
          availableRegimes: available,
          breakfastIncluded: regime !== 'solo' ? true : h.breakfastIncluded,
        }
      }),
    })
  },

  setHotelClosed: (id, closed) => {
    set({
      hotels: get().hotels.map((h) =>
        h.id === id ? { ...h, closed, contract: closed ? null : h.contract } : h,
      ),
    })
  },

  sellHotel: (id) => {
    const state = get()
    const hotel = state.hotels.find((h) => h.id === id)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    const netLifetime = hotel.lifetimeRevenue - hotel.lifetimeCosts
    const conditionFactor = 0.55 + ((hotel.condition ?? 100) / 100) * 0.35
    const proceeds = Math.max(
      50_000,
      Math.round(hotel.constructionCost * 0.62 * conditionFactor + Math.max(0, netLifetime) * 0.08),
    )
    playSellSound(state.soundEnabled)
    set({
      cash: state.cash + proceeds,
      hotels: state.hotels.filter((h) => h.id !== id),
      selectedHotelId: state.selectedHotelId === id ? null : state.selectedHotelId,
      compareIds: state.compareIds.map((c) => (c === id ? null : c)) as [string | null, string | null],
    })
    return { ok: true, proceeds }
  },

  renovateHotel: (id) => {
    const state = get()
    const hotel = state.hotels.find((h) => h.id === id)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    const wear = Math.max(0, 100 - (hotel.condition ?? 100))
    const cost = Math.round(hotel.rooms * (180 + hotel.stars * 90) * hotel.costIndex * (0.4 + wear / 100))
    if (cost > state.cash) {
      return { ok: false, error: `Faltan ${Math.round(cost - state.cash).toLocaleString('es-ES')} €.` }
    }
    const day = gameDay(state.gameMinutes)
    set({
      cash: state.cash - cost,
      hotels: state.hotels.map((h) =>
        h.id === id
          ? {
              ...h,
              condition: 100,
              lastRenovationDay: day,
              satisfaction: Math.min(99, h.satisfaction + 4),
            }
          : h,
      ),
    })
    playBuildSound(state.soundEnabled)
    return { ok: true, cost }
  },

  takeLoan: (amount) => {
    const { loan, cash } = get()
    const room = loan.limit - loan.balance
    if (amount <= 0) return { ok: false, error: 'Cantidad no válida.' }
    if (amount > room) return { ok: false, error: 'No queda tanto crédito.' }
    set({ cash: cash + amount, loan: { ...loan, balance: loan.balance + amount } })
    return { ok: true }
  },

  repayLoan: (amount) => {
    const { loan, cash } = get()
    if (amount <= 0) return { ok: false, error: 'Cantidad no válida.' }
    if (amount > cash) return { ok: false, error: 'No hay dinero suficiente.' }
    if (amount > loan.balance) return { ok: false, error: 'Es más de lo que debes.' }
    set({ cash: cash - amount, loan: { ...loan, balance: loan.balance - amount } })
    return { ok: true }
  },

  openDeposit: (amount, termDays) => {
    const { cash, bankDeposits, gameMinutes } = get()
    const term = BANK_TERMS.find((t) => t.days === termDays)
    if (!term) return { ok: false, error: 'Plazo no válido.' }
    if (amount < 100_000) return { ok: false, error: 'Mínimo 100.000 €.' }
    if (amount > cash) return { ok: false, error: 'No hay dinero suficiente.' }
    const dep: BankDeposit = {
      id: uuid(),
      amount: Math.round(amount),
      daysLeft: term.days,
      dailyRate: term.dailyRate,
      createdDay: gameDay(gameMinutes),
    }
    set({ cash: cash - amount, bankDeposits: [...bankDeposits, dep] })
    return { ok: true }
  },

  generateDemo: (count = 1000) => {
    const state = get()
    if (state.simulating) return { ok: false, error: 'Espera a que termine el cálculo del día.' }
    const day = gameDay(state.gameMinutes)
    const added = generateDemoHotels(count, day)
    set({ hotels: [...state.hotels, ...added] })
    return { ok: true, added: added.length }
  },

  markPlanDone: (order) => {
    const done = new Set(get().planDoneOrders)
    done.add(order)
    const next = order + 1
    set({ planDoneOrders: [...done].sort((a, b) => a - b), planCursor: next })
  },

  skipPlanHotel: (order) => {
    set({ planCursor: order + 1 })
  },

  setPlanCursor: (order) => set({ planCursor: Math.max(1, order) }),

  setPlayMode: (_mode) => {
    // Modo Cliente retirado de la UI: siempre gerente.
    set({ playMode: 'gerente' })
  },

  setClientName: (name) => set({ client: { ...get().client, name: name.slice(0, 40) || 'Viajero Orbis' } }),

  setClientPrefs: (prefs) => set({ client: { ...get().client, prefs } }),

  setClientBookingHotel: (id) => {
    const state = get()
    const stay = state.client.stay
    const clearStay = stay?.status === 'checked_out'
    set({
      selectedHotelId: null,
      client: {
        ...state.client,
        bookingHotelId: id,
        stay: clearStay ? null : stay,
      },
    })
  },

  clientReserve: (hotelId, roomKind, board, nights = 1) => {
    const state = get()
    if (state.playMode !== 'cliente') return { ok: false, error: 'Activa el modo Cliente.' }
    if (state.client.stay && state.client.stay.status !== 'checked_out') {
      return { ok: false, error: 'Ya tienes una reserva o estancia activa.' }
    }
    const hotel = state.hotels.find((h) => h.id === hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    const rooms = roomKindsForHotel(hotel)
    if (!rooms.some((r) => r.id === roomKind)) return { ok: false, error: 'Tipo de habitación no disponible.' }
    const boards = boardOptionsForHotel(hotel)
    if (!boards.includes(board)) return { ok: false, error: 'Régimen no disponible en este hotel.' }
    const day = gameDay(state.gameMinutes)
    const n = Math.max(1, Math.min(14, Math.round(nights)))
    const stay = createStayDraft(
      hotel,
      roomKind,
      board,
      day,
      state.client.level,
      n,
      state.client.specialize,
    )
    const price = stay.pricePaid
    if (state.client.wallet < price && stay.status === 'reserved') {
      return { ok: false, error: `Necesitas ${price.toLocaleString('es-ES')} € en tu monedero.` }
    }
    const note =
      stay.status === 'waitlist'
        ? `${hotel.name} está completo o cerrado. Entraste en lista de espera.`
        : `Reserva ${n} noche${n > 1 ? 's' : ''} en ${hotel.name} · ${price.toLocaleString('es-ES')} € (pareja).`
    set({
      client: {
        ...state.client,
        stay,
        bookingHotelId: hotelId,
        notifications: pushNote(state.client.notifications, note),
      },
      mapFocus: { lat: hotel.lat, lng: hotel.lng, zoom: 11 },
    })
    return { ok: true }
  },

  clientCancelReservation: () => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status === 'checked_in') return
    set({
      client: {
        ...state.client,
        stay: null,
        notifications: pushNote(state.client.notifications, 'Reserva cancelada (gratis).'),
      },
    })
  },

  clientCheckIn: (opts) => {
    const state = get()
    const stay = state.client.stay
    if (!stay) return { ok: false, error: 'No hay reserva.' }
    if (stay.status === 'waitlist') return { ok: false, error: 'Sigues en lista de espera.' }
    if (stay.status === 'checked_in') return { ok: false, error: 'Ya estás dentro.' }
    if (stay.status === 'checked_out') return { ok: false, error: 'La estancia ya terminó.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    if (hotel.closed) return { ok: false, error: 'El hotel está cerrado.' }
    const early = Boolean(opts?.early)
    const nightPrice = calcGuestNightPrice(
      hotel,
      stay.roomKind,
      stay.boardRegime,
      state.client.level,
      state.client.specialize,
    )
    const earlyFee = early ? earlyCheckinFee(nightPrice, state.client.level) : 0
    const price = stay.pricePaid + earlyFee
    if (price > 0 && state.client.wallet < price) {
      return { ok: false, error: `Faltan ${(price - state.client.wallet).toLocaleString('es-ES')} €.` }
    }
    let client = applyWeatherToClient(
      {
        ...state.client,
        wallet: state.client.wallet - price,
        stay: {
          ...stay,
          status: 'checked_in' as const,
          checkInMinutes: state.gameMinutes,
          nightsRemaining: stay.nightsRemaining || stay.nights || 1,
          earlyCheckin: early || stay.earlyCheckin,
        },
        stayServicesUsed: [],
        pointRedeems: [],
        partnerOrdersLeft: PARTNER_ORDERS_PER_NIGHT,
        partnerOrdersUsedTonight: 0,
        lobbyEventId: lobbyEventForDay(gameDay(state.gameMinutes)).id,
        lobbyEventDay: gameDay(state.gameMinutes),
        notifications: pushNote(
          state.client.notifications,
          `Check-in en ${hotel.name}${early ? ` (early +${earlyFee} €)` : ''}. ${stay.nights} noche${stay.nights > 1 ? 's' : ''}. Evento: ${lobbyEventForDay(gameDay(state.gameMinutes)).title}.`,
        ),
      },
      hotel,
      state.gameMinutes,
    )
    set({
      cash: state.cash + price,
      client,
      hotels: state.hotels.map((h) =>
        h.id === hotel.id
          ? {
              ...h,
              lastDayRevenue: h.lastDayRevenue + price,
              lifetimeRevenue: h.lifetimeRevenue + price,
              lifetimeGuests: h.lifetimeGuests + 2,
            }
          : h,
      ),
    })
    return { ok: true }
  },

  clientCheckOut: (opts) => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'No estás alojado.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    const day = gameDay(state.gameMinutes)
    const late = Boolean(opts?.late)
    let lateFee = 0
    if (hotel && late) {
      const nightPrice = calcGuestNightPrice(
        hotel,
        stay.roomKind,
        stay.boardRegime,
        state.client.level,
        state.client.specialize,
      )
      lateFee = lateCheckoutFee(hotel, nightPrice, state.client.level)
      if (lateFee > 0 && state.client.wallet < lateFee) {
        return { ok: false, error: `Late checkout cuesta ${lateFee.toLocaleString('es-ES')} €.` }
      }
    }
    let client: import('../types').ClientModeState = {
      ...state.client,
      wallet: state.client.wallet - lateFee,
      stay: { ...stay, status: 'checked_out' as const, lateCheckout: late || stay.lateCheckout },
      appointments: [],
      notifications: pushNote(
        state.client.notifications,
        hotel
          ? `Check-out de ${hotel.name}${late ? (lateFee ? ` (late +${lateFee} €)` : ' (late incluido)') : ''}. Gracias por tu estancia.`
          : 'Check-out hecho.',
      ),
    }
    if (hotel) {
      const add = Math.round(CLIENT_NIGHT_POINTS * 0.25)
      const weather = getWeather(hotel.lat, state.gameMinutes, hotel.id)
      const tourBefore = client.brandTourBonusDay
      const diary = buildTravelDiaryEntry(client, hotel, day, state.gameMinutes, stay.nights || 1)
      client = {
        ...client,
        passport: stampPassport(client.passport, hotel, day),
        points: client.points + add,
        level: clientLevelFromPoints(client.points + add),
      }
      client = applyBrandTour(client, hotel, day)
      const tourBonus = client.brandTourBonusDay === day && tourBefore !== day ? BRAND_TOUR_BONUS : 0
      client = attachDiary(client, diary)
      client = {
        ...client,
        stayServicesUsed: [],
        lastNightRecap: buildNightRecap({
          hotel,
          weather,
          points: add,
          ceo: 0,
          tourBonus,
          day,
          nightsDone: stay.nights || 1,
          nightsTotal: stay.nights || 1,
          lastNight: true,
        }),
      }
    } else {
      client = { ...client, stayServicesUsed: [] }
    }
    set({
      cash: state.cash + lateFee,
      client,
    })
    return { ok: true }
  },

  clientUseService: (service, tip = 0, actionId) => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'Haz check-in primero.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    if (!hotel.services.includes(service)) return { ok: false, error: 'Este hotel no ofrece ese servicio.' }

    const screen = buildServiceScreen(service, hotel)
    let action: ServiceAction | undefined = screen.actions.find((a) => a.id === actionId)
    if (!action) action = screen.actions[0]
    if (!action) return { ok: false, error: 'Sin acciones disponibles.' }
    if (action.minigame || minigameForAction(service, action.id)) {
      return { ok: false, error: 'Esa acción abre un minijuego.' }
    }

    const hours = serviceHoursStatus(service, state.gameMinutes)
    if (!hours.open) {
      return { ok: false, error: `${hours.note}. Abre a las ${hours.opensAt}.` }
    }

    const cost = Math.round((action.cost + Math.max(0, tip)) * hours.surchargeMult)
    if (state.client.wallet < cost) return { ok: false, error: 'No te llega el monedero.' }

    const needs = applyServiceAction(state.client.needs, action)
    const partnerNeeds = applyNeedDelta(state.client.partnerNeeds, partnerShareDelta(action.needs))
    const used = state.client.stayServicesUsed.includes(service)
      ? state.client.stayServicesUsed
      : [...state.client.stayServicesUsed, service]
    const pts = action.points + Math.round(tip / 20)
    let missions = state.client.missions
    if (used.length > state.client.stayServicesUsed.length) {
      missions = bumpMissions(missions, (m) => m.id.includes('d-svc-') || m.description.includes('3 servicios'))
    }
    if (service === 'spa' || service === 'sauna') {
      missions = bumpMissions(missions, (m) => m.description.toLowerCase().includes('spa') || m.description.toLowerCase().includes('sauna'))
    }
    if (service === 'restaurante' || service === 'room_service_24h' || service === 'all_inclusive') {
      missions = bumpMissions(
        missions,
        (m) => m.description.toLowerCase().includes('restaurante') || m.description.toLowerCase().includes('room service'),
      )
    }

    let appointments = state.client.appointments
    if (service === 'spa' && (action.id === 'masaje' || action.id === 'facial' || action.id === 'circuito')) {
      const atMinutes = state.gameMinutes + Math.max(30, action.minutes)
      appointments = [
        {
          id: uuid(),
          service,
          label: `${action.label} · ${hotel.name}`,
          atMinutes,
          done: false,
        },
        ...appointments,
      ].slice(0, 8)
    }

    const note =
      service === 'concierge'
        ? `Conserjería: ${action.label}.`
        : `${screen.title}: ${action.label} (${action.minutes} min)${hours.surchargeMult > 1 ? ` · ${hours.note}` : ''}.`

    set({
      cash: state.cash + cost,
      client: {
        ...state.client,
        wallet: state.client.wallet - cost,
        needs,
        partnerNeeds,
        points: state.client.points + pts,
        level: clientLevelFromPoints(state.client.points + pts),
        stay: { ...stay, tipTotal: stay.tipTotal + Math.max(0, tip) },
        stayServicesUsed: used,
        missions,
        appointments,
        notifications: pushNote(
          state.client.notifications,
          tip
            ? `${note} Propina ${tip} €.`
            : appointments[0] && appointments[0].atMinutes > state.gameMinutes && service === 'spa'
              ? `${note} Cita a las ${formatAppointmentClock(appointments[0].atMinutes)}.`
              : note,
        ),
      },
    })
    return { ok: true }
  },

  clientBeginMinigame: (service, tip = 0, actionId) => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'Haz check-in primero.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    if (!hotel.services.includes(service)) return { ok: false, error: 'Este hotel no ofrece ese servicio.' }
    const screen = buildServiceScreen(service, hotel)
    const action = screen.actions.find((a) => a.id === actionId)
    if (!action) return { ok: false, error: 'Acción no encontrada.' }
    if (!action.minigame && !minigameForAction(service, action.id)) {
      return { ok: false, error: 'No hay minijuego para esta acción.' }
    }
    const hours = serviceHoursStatus(service, state.gameMinutes)
    if (!hours.open) {
      return { ok: false, error: `${hours.note}. Abre a las ${hours.opensAt}.` }
    }
    const cost = Math.round((action.cost + Math.max(0, tip)) * hours.surchargeMult)
    if (state.client.wallet < cost) return { ok: false, error: 'No te llega el monedero.' }

    const needs = applyServiceAction(state.client.needs, action)
    const partnerNeeds = applyNeedDelta(state.client.partnerNeeds, partnerShareDelta(action.needs))
    const used = state.client.stayServicesUsed.includes(service)
      ? state.client.stayServicesUsed
      : [...state.client.stayServicesUsed, service]
    const pts = action.points + Math.round(tip / 20)
    let missions = state.client.missions
    if (used.length > state.client.stayServicesUsed.length) {
      missions = bumpMissions(missions, (m) => m.id.includes('d-svc-') || m.description.includes('3 servicios'))
    }

    set({
      cash: state.cash + cost,
      client: {
        ...state.client,
        wallet: state.client.wallet - cost,
        needs,
        partnerNeeds,
        points: state.client.points + pts,
        level: clientLevelFromPoints(state.client.points + pts),
        stay: { ...stay, tipTotal: stay.tipTotal + Math.max(0, tip) },
        stayServicesUsed: used,
        missions,
        notifications: pushNote(
          state.client.notifications,
          `Minijuego: ${action.label} en ${screen.title}. Entrada ${cost.toLocaleString('es-ES')} €.`,
        ),
      },
    })
    return { ok: true, entryCost: cost }
  },

  clientBeginLobbyActivity: (id, cost) => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'Haz check-in primero.' }
    const day = gameDay(state.gameMinutes)
    const ev = lobbyEventForDay(day)
    const fee = Math.max(0, Math.round(cost * ev.priceMult))
    if (state.client.wallet < fee) return { ok: false, error: 'No te llega el monedero.' }
    const activity = MINIGAME_LABEL[id] ?? id
    set({
      cash: state.cash + fee,
      client: {
        ...state.client,
        wallet: state.client.wallet - fee,
        lobbyEventId: ev.id,
        lobbyEventDay: day,
        notifications: pushNote(
          state.client.notifications,
          `Animación: ${activity} (${ev.title}). Entrada ${fee.toLocaleString('es-ES')} €.`,
        ),
      },
    })
    return { ok: true, entryCost: fee }
  },

  clientFinishMinigame: (outcome: MinigameOutcome) => {
    const state = get()
    if (!state.client.stay || state.client.stay.status !== 'checked_in') {
      return { ok: false, error: 'No hay estancia activa.' }
    }
    if (outcome.walletDelta < 0 && state.client.wallet + outcome.walletDelta < 0) {
      return { ok: false, error: 'No te llega el monedero para esa apuesta.' }
    }
    const needs = applyNeedDelta(state.client.needs, outcome.needsBonus)
    const points = state.client.points + Math.max(0, outcome.pointsDelta)
    const missions = bumpMissions(
      state.client.missions,
      (m) => m.id.includes('d-play-') || m.description.toLowerCase().includes('minijuego'),
    )
    const hotelRev = Math.max(0, -Math.min(0, outcome.walletDelta))
    set({
      cash: state.cash + hotelRev,
      client: {
        ...state.client,
        wallet: state.client.wallet + outcome.walletDelta,
        needs,
        points,
        level: clientLevelFromPoints(points),
        missions,
        notifications: pushNote(state.client.notifications, outcome.message),
      },
    })
    return { ok: true }
  },

  clientClaimMission: (id) => {
    const state = get()
    const m = state.client.missions.find((x) => x.id === id)
    if (!m) return { ok: false, error: 'Misión no encontrada.' }
    if (!m.done) return { ok: false, error: 'Aún no está completa.' }
    if (m.claimed) return { ok: false, error: 'Ya cobrada.' }
    const points = state.client.points + m.rewardPoints
    set({
      client: {
        ...state.client,
        points,
        level: clientLevelFromPoints(points),
        wallet: state.client.wallet + m.rewardWallet,
        missions: state.client.missions.map((x) => (x.id === id ? { ...x, claimed: true } : x)),
        notifications: pushNote(
          state.client.notifications,
          `Misión «${m.title}»: +${m.rewardPoints} pts y ${m.rewardWallet.toLocaleString('es-ES')} €.`,
        ),
      },
    })
    return { ok: true }
  },

  clientRedeemPoints: (id) => {
    const state = get()
    const def = POINT_REDEEMS.find((r) => r.id === id)
    if (!def) return { ok: false, error: 'Canje no válido.' }
    const cost = redeemPointsCost(id, state.client.level)
    if (state.client.points < cost) return { ok: false, error: `Necesitas ${cost} puntos.` }
    const stay = state.client.stay
    if (def.needsStay === 'reserved' && (!stay || stay.status !== 'reserved')) {
      return { ok: false, error: 'Haz una reserva y canjea antes del check-in.' }
    }
    if (def.needsStay === 'checked_in' && (!stay || stay.status !== 'checked_in')) {
      return { ok: false, error: 'Haz check-in primero.' }
    }
    if (def.needsStay === 'any' && (!stay || (stay.status !== 'reserved' && stay.status !== 'checked_in'))) {
      return { ok: false, error: 'Necesitas una reserva o estancia activa.' }
    }
    const hotel = stay ? state.hotels.find((h) => h.id === stay.hotelId) : null
    if (def.needsService && hotel && !hotel.services.includes(def.needsService)) {
      return { ok: false, error: 'Este hotel no tiene ese servicio.' }
    }
    if (state.client.pointRedeems.includes(id) && id !== 'noche') {
      return { ok: false, error: 'Ya usaste ese canje en esta estancia.' }
    }

    let client = {
      ...state.client,
      points: state.client.points - cost,
      level: clientLevelFromPoints(state.client.points - cost),
      pointRedeems: [...state.client.pointRedeems, id],
    }

    if (id === 'noche' && stay) {
      client = {
        ...client,
        stay: { ...stay, pricePaid: 0 },
        notifications: pushNote(client.notifications, `Noche canjeada con ${cost} pts. Check-in gratis.`),
      }
    } else if (id === 'desayuno') {
      client = {
        ...client,
        needs: applyNeedDelta(client.needs, { hambre: 28, sed: 14, humor: 6 }),
        partnerNeeds: applyNeedDelta(client.partnerNeeds, { hambre: 20, sed: 10, humor: 4 }),
        notifications: pushNote(client.notifications, `Desayuno de cortesía (−${cost} pts).`),
      }
    } else if (id === 'spa') {
      client = {
        ...client,
        needs: applyNeedDelta(client.needs, { relax: 30, higiene: 12, energia: 6 }),
        partnerNeeds: applyNeedDelta(client.partnerNeeds, { relax: 16, higiene: 6 }),
        notifications: pushNote(client.notifications, `Bono spa canjeado (−${cost} pts).`),
      }
    } else if (id === 'upgrade' && stay && hotel) {
      const nextRoom = bestUpgradeRoom(hotel, stay.roomKind)
      if (!nextRoom) return { ok: false, error: 'No hay upgrade disponible.' }
      client = {
        ...client,
        stay: { ...stay, roomKind: nextRoom, upgraded: true },
        needs: applyNeedDelta(client.needs, { confort: 18, humor: 10 }),
        notifications: pushNote(
          client.notifications,
          `Upgrade a ${nextRoom.replace('_', ' ')} (−${cost} pts).`,
        ),
      }
    }

    set({ client })
    return { ok: true }
  },

  clientRedeemFreeNight: () => get().clientRedeemPoints('noche'),

  clientOrderRoomServiceCart: (items, tip = 0) => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'Haz check-in primero.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    if (!hotel.services.includes('room_service_24h')) {
      return { ok: false, error: 'Este hotel no tiene room service.' }
    }
    const hours = serviceHoursStatus('room_service_24h', state.gameMinutes)
    if (!hours.open) return { ok: false, error: hours.note }
    const screen = buildServiceScreen('room_service_24h', hotel)
    const lines: { label: string; cost: number; needs: ServiceAction['needs']; points: number }[] = []
    for (const it of items) {
      const qty = Math.max(1, Math.min(8, Math.round(it.qty)))
      const action = screen.actions.find((a) => a.id === it.actionId)
      if (!action) return { ok: false, error: `Plato no válido: ${it.actionId}` }
      for (let i = 0; i < qty; i++) {
        lines.push({
          label: action.label,
          cost: Math.round(action.cost * hours.surchargeMult),
          needs: action.needs,
          points: action.points,
        })
      }
    }
    if (!lines.length) return { ok: false, error: 'El carrito está vacío.' }
    const subtotal = lines.reduce((s, l) => s + l.cost, 0) + Math.max(0, tip)
    if (state.client.wallet < subtotal) return { ok: false, error: 'No te llega el monedero.' }

    let needs = state.client.needs
    let partnerNeeds = state.client.partnerNeeds
    let pts = Math.round(tip / 20)
    for (const line of lines) {
      needs = applyNeedDelta(needs, line.needs)
      partnerNeeds = applyNeedDelta(partnerNeeds, partnerShareDelta(line.needs))
      pts += line.points
    }
    const used: HotelService[] = state.client.stayServicesUsed.includes('room_service_24h')
      ? state.client.stayServicesUsed
      : [...state.client.stayServicesUsed, 'room_service_24h']
    let missions = state.client.missions
    if (used.length > state.client.stayServicesUsed.length) {
      missions = bumpMissions(missions, (m) => m.id.includes('d-svc-') || m.description.includes('3 servicios'))
    }
    missions = bumpMissions(
      missions,
      (m) => m.description.toLowerCase().includes('restaurante') || m.description.toLowerCase().includes('room service'),
    )
    const names = lines.map((l) => l.label).join(', ')
    set({
      cash: state.cash + subtotal,
      client: {
        ...state.client,
        wallet: state.client.wallet - subtotal,
        needs,
        partnerNeeds,
        points: state.client.points + pts,
        level: clientLevelFromPoints(state.client.points + pts),
        stay: { ...stay, tipTotal: stay.tipTotal + Math.max(0, tip) },
        stayServicesUsed: used,
        missions,
        notifications: pushNote(
          state.client.notifications,
          `Room service (${lines.length}): ${names}. ${subtotal.toLocaleString('es-ES')} €${hours.surchargeMult > 1 ? ` · ${hours.note}` : ''}.`,
        ),
      },
    })
    return { ok: true, total: subtotal }
  },

  clientRefreshMissions: () => {
    const state = get()
    const day = gameDay(state.gameMinutes)
    const { missions, missionsDay } = ensureMissions([], 0, day)
    set({ client: { ...state.client, missions, missionsDay } })
  },

  clientClearNotes: () => set({ client: { ...get().client, notifications: [] } }),

  clientDismissStay: () => {
    const stay = get().client.stay
    if (!stay || stay.status === 'checked_in') return
    set({ client: { ...get().client, stay: null } })
  },

  clientDismissNightRecap: () => {
    const c = get().client
    if (!c.lastNightRecap) return
    set({ client: { ...c, lastNightRecap: null } })
  },

  setPartnerMode: (mode) => {
    const c = get().client
    set({
      client: {
        ...c,
        partnerMode: mode,
        partnerOrdersLeft: mode === 'orders' ? PARTNER_ORDERS_PER_NIGHT : c.partnerOrdersLeft,
        notifications: pushNote(
          c.notifications,
          mode === 'orders'
            ? `Pareja en modo órdenes (${PARTNER_ORDERS_PER_NIGHT}/noche).`
            : 'Pareja en modo automático.',
        ),
      },
    })
  },

  clientPartnerOrder: (id) => {
    const res = applyPartnerOrder(get().client, id)
    if (!res.ok) return res
    set({ client: res.client })
    return { ok: true }
  },
}))

async function runSkipDays(days: number, gameMinutes: number) {
  const state = useGameStore.getState()
  if (state.simulating || days <= 0) {
    useGameStore.setState({ gameMinutes })
    return
  }
  const hotelCount = state.hotels.length
  const t0 = performance.now()
  useGameStore.setState({
    simulating: true,
    simProgress: `Calculando ${days > 1 ? `${days} días` : 'el día'}… (${hotelCount.toLocaleString('es-ES')} hoteles)`,
  })
  try {
    const result = await runDaysInWorker(state, days)
    const hotels = result.hotels
    const cash = result.cash
    const elapsed = Math.max(1, Math.round(performance.now() - t0))
    const ui = {
      ...(state.ui ?? defaultPersistedUi()),
      lastSimMs: elapsed,
      lastSimHotels: hotelCount,
    }
    useGameStore.setState({
      gameMinutes,
      cash,
      hotels,
      ui,
      activeEvents: result.activeEvents,
      lastEventRollDay: result.lastEventRollDay,
      reputation: result.reputation,
      loan: result.loan,
      ledger: result.ledger,
      countryEconomy: result.countryEconomy,
      news: result.news,
      bankDeposits: result.bankDeposits,
      loyaltyLevel: result.loyaltyLevel,
      loyaltyPoints: result.loyaltyPoints,
      lastWeeklyReportDay: result.lastWeeklyReportDay,
      weeklyReports: result.weeklyReports,
      simulating: false,
      simProgress: '',
    })
    if (result.dayClosed) playDaySound(useGameStore.getState().soundEnabled)
  } catch {
    useGameStore.setState({
      simulating: false,
      simProgress: 'Error al calcular. Intenta otra vez.',
      gameMinutes,
    })
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
