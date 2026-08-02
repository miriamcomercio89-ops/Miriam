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
  settleClientNight,
  clientLevelFromPoints,
  stampPassport,
  CLIENT_NIGHT_POINTS,
} from '../lib/clientMode'
import { SLOT_KEYS, idbSave, tryLocalStorageSave, readLocalStorageSave, idbLoad, idbLoadHotelImages, mergeHotelImages } from '../lib/saveio'
import { applyDays } from '../lib/daySim'
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
  FREE_NIGHT_POINTS,
  type ServiceAction,
} from '../lib/clientServices'

export const STORAGE_KEY = 'orbis-hotels-group-save-v10'
export const SAVE_VERSION = 10
export const IDB_SLOT_KEYS = ['slot-1', 'slot-2', 'slot-3'] as const

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
    ) => { ok: true } | { ok: false; error: string }
    clientCancelReservation: () => void
    clientCheckIn: () => { ok: true } | { ok: false; error: string }
    clientCheckOut: () => { ok: true } | { ok: false; error: string }
    clientUseService: (
      service: HotelService,
      tip?: number,
      actionId?: string,
    ) => { ok: true } | { ok: false; error: string }
    clientClaimMission: (id: string) => { ok: true } | { ok: false; error: string }
    clientRedeemFreeNight: () => { ok: true } | { ok: false; error: string }
    clientRefreshMissions: () => void
    clientClearNotes: () => void
    clientDismissStay: () => void
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
    playMode: raw.playMode === 'cliente' ? 'cliente' : 'gerente',
    client: migrateClientState(raw.client),
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
    },
    mapFocus: null,
    rankMetric: 'net',
    simulating: false,
    simProgress: '',
    saveToast: null,

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

  startGame: () => set({ started: true, showLanding: false }),

  newGame: () => {
    set({
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
    })
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
    }
  },

  hydrate: (state) =>
    set({
      ...migrate(state),
      showLanding: !state.started,
      selectedHotelId: null,
      compareIds: [null, null],
      buildLocation: null,
      ...closePanelsExcept({}),
      mapFocus: null,
      simulating: false,
    }),

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
      'orbis-hotels-group-save-v9',
      'orbis-hotels-group-save-v8',
      'orbis-hotels-group-save-v7',
      'orbis-hotels-group-save-v6',
      'orbis-hotels-group-save-v5',
      'orbis-hotels-group-save-v4',
      'orbis-hotels-group-save-v3',
      'orbis-hotels-group-save-v2',
      'orbis-hotels-group-save-v1',
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

  setPlayMode: (mode) => {
    const state = get()
    if (mode === 'cliente' && state.hotels.length === 0) {
      set({
        saveToast: 'Modo Cliente: construye al menos un hotel primero.',
      })
      window.setTimeout(() => {
        if (useGameStore.getState().saveToast?.startsWith('Modo Cliente')) {
          useGameStore.setState({ saveToast: null })
        }
      }, 3200)
      return
    }
    const day = gameDay(state.gameMinutes)
    const missions = mode === 'cliente' ? ensureMissions(state.client.missions, state.client.missionsDay, day) : null
    set({
      playMode: mode,
      ...closePanelsExcept({}),
      selectedHotelId: mode === 'gerente' ? state.selectedHotelId : null,
      buildLocation: mode === 'cliente' ? null : state.buildLocation,
      client: {
        ...state.client,
        bookingHotelId: mode === 'cliente' ? state.client.bookingHotelId : null,
        ...(missions
          ? { missions: missions.missions, missionsDay: missions.missionsDay }
          : {}),
      },
      mapMode: mode === 'cliente' ? 'inspect' : state.mapMode,
    })
  },

  setClientName: (name) => set({ client: { ...get().client, name: name.slice(0, 40) || 'Viajero Orbis' } }),

  setClientPrefs: (prefs) => set({ client: { ...get().client, prefs } }),

  setClientBookingHotel: (id) => set({ client: { ...get().client, bookingHotelId: id } }),

  clientReserve: (hotelId, roomKind, board) => {
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
    const stay = createStayDraft(hotel, roomKind, board, day, state.client.level)
    const price = stay.pricePaid
    if (state.client.wallet < price && stay.status === 'reserved') {
      return { ok: false, error: `Necesitas ${price.toLocaleString('es-ES')} € en tu monedero.` }
    }
    const note =
      stay.status === 'waitlist'
        ? `${hotel.name} está completo o cerrado. Entraste en lista de espera.`
        : `Reserva esta noche en ${hotel.name} · ${price.toLocaleString('es-ES')} € (pareja).`
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

  clientCheckIn: () => {
    const state = get()
    const stay = state.client.stay
    if (!stay) return { ok: false, error: 'No hay reserva.' }
    if (stay.status === 'waitlist') return { ok: false, error: 'Sigues en lista de espera.' }
    if (stay.status === 'checked_in') return { ok: false, error: 'Ya estás dentro.' }
    if (stay.status === 'checked_out') return { ok: false, error: 'La estancia ya terminó.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    if (!hotel) return { ok: false, error: 'Hotel no encontrado.' }
    if (hotel.closed) return { ok: false, error: 'El hotel está cerrado.' }
    const price = stay.pricePaid
    if (price > 0 && state.client.wallet < price) {
      return { ok: false, error: `Faltan ${(price - state.client.wallet).toLocaleString('es-ES')} €.` }
    }
    // Pago al grupo + ocupación simbólica
    set({
      cash: state.cash + price,
      client: {
        ...state.client,
        wallet: state.client.wallet - price,
        stay: { ...stay, status: 'checked_in', checkInMinutes: state.gameMinutes },
        stayServicesUsed: [],
        notifications: pushNote(
          state.client.notifications,
          `Check-in en ${hotel.name}. Habitación ${stay.roomKind.replace('_', ' ')}. Tu pareja te acompaña.`,
        ),
      },
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

  clientCheckOut: () => {
    const state = get()
    const stay = state.client.stay
    if (!stay || stay.status !== 'checked_in') return { ok: false, error: 'No estás alojado.' }
    const hotel = state.hotels.find((h) => h.id === stay.hotelId)
    const day = gameDay(state.gameMinutes)
    let client = {
      ...state.client,
      stay: { ...stay, status: 'checked_out' as const },
      stayServicesUsed: [],
      appointments: [],
      notifications: pushNote(
        state.client.notifications,
        hotel ? `Check-out de ${hotel.name}. Gracias por tu estancia.` : 'Check-out hecho.',
      ),
    }
    if (hotel) {
      const add = Math.round(CLIENT_NIGHT_POINTS * 0.25)
      client = {
        ...client,
        passport: stampPassport(client.passport, hotel, day),
        points: client.points + add,
        level: clientLevelFromPoints(client.points + add),
      }
    }
    set({ client })
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

    const cost = action.cost + Math.max(0, tip)
    if (state.client.wallet < cost) return { ok: false, error: 'No te llega el monedero.' }

    const needs = applyServiceAction(state.client.needs, action)
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

    const appointments =
      service === 'spa' && (action.id === 'masaje' || action.id === 'facial')
        ? [`${action.label} · ${hotel.name}`, ...state.client.appointments].slice(0, 6)
        : state.client.appointments

    const note =
      service === 'concierge'
        ? `Conserjería: ${action.label}.`
        : `${screen.title}: ${action.label} (${action.minutes} min).`

    set({
      cash: state.cash + cost,
      client: {
        ...state.client,
        wallet: state.client.wallet - cost,
        needs,
        points: state.client.points + pts,
        level: clientLevelFromPoints(state.client.points + pts),
        stay: { ...stay, tipTotal: stay.tipTotal + Math.max(0, tip) },
        stayServicesUsed: used,
        missions,
        appointments,
        notifications: pushNote(state.client.notifications, tip ? `${note} Propina ${tip} €.` : note),
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

  clientRedeemFreeNight: () => {
    const state = get()
    if (state.client.points < FREE_NIGHT_POINTS) {
      return { ok: false, error: `Necesitas ${FREE_NIGHT_POINTS} puntos.` }
    }
    if (!state.client.stay || state.client.stay.status !== 'reserved') {
      return { ok: false, error: 'Haz una reserva esta noche y canjea antes del check-in.' }
    }
    const stay = { ...state.client.stay, pricePaid: 0 }
    const points = state.client.points - FREE_NIGHT_POINTS
    set({
      client: {
        ...state.client,
        points,
        level: clientLevelFromPoints(points),
        stay,
        notifications: pushNote(
          state.client.notifications,
          `Noche canjeada con ${FREE_NIGHT_POINTS} puntos. Check-in gratis.`,
        ),
      },
    })
    return { ok: true }
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
}))

async function runSkipDays(days: number, gameMinutes: number) {
  const state = useGameStore.getState()
  if (state.simulating || days <= 0) {
    useGameStore.setState({ gameMinutes })
    return
  }
  useGameStore.setState({
    simulating: true,
    simProgress: `Calculando ${days > 1 ? 'días' : 'el día'}… (${state.hotels.length.toLocaleString('es-ES')} hoteles)`,
  })
  try {
    const result = await runDaysInWorker(state, days)
    let hotels = result.hotels
    let cash = result.cash
    let client = state.client
    const startDay = gameDay(state.gameMinutes)
    for (let d = 0; d < days; d++) {
      const day = startDay + d
      const stampsBefore = client.passport.length
      const nightsBefore = client.totalNights
      const settled = settleClientNight(client, hotels, day)
      client = settled.client
      hotels = settled.hotels
      cash += settled.hotelRevenue
      if (client.totalNights > nightsBefore) {
        client = {
          ...client,
          missions: bumpMissions(client.missions, (m) => m.id.includes('d-night-') || m.id.includes('w-nights-')),
        }
      }
      if (client.passport.length > stampsBefore) {
        client = {
          ...client,
          missions: bumpMissions(client.missions, (m) => m.id.includes('w-brands-') || m.description.includes('sellos')),
        }
      }
      const refreshed = ensureMissions(client.missions, client.missionsDay, day)
      client = { ...client, missions: refreshed.missions, missionsDay: refreshed.missionsDay }
    }
    useGameStore.setState({
      gameMinutes,
      cash,
      hotels,
      client,
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
