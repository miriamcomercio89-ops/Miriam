import { PRODUCTS } from '../data/products.js';
import { defaultFloatDrawer, emptyDrawer, drawerTotalCents } from '../data/money.js';
import { buildHolidayMap } from '../data/holidays.js';
import { generateRegularCustomers, generateAbonadosAndPenas } from '../data/customers.js';
import { buildAloraEvents } from '../data/events.js';
import { ensureCustomerBirthdays } from '../data/birthdays.js';
import { ensureOnceExtras } from './notices.js';
import { ensureJackpots } from './jackpots.js';
import { seedDefaultShowcase, ensureShowcase } from './showcase.js';

export const STARTING_BANK_CENTS = 950000;
export const SAVE_VERSION = 12;
export const GAME_VERSION = '1.2';
export const SLOT_COUNT = 3;
export const STORAGE_PREFIX = 'loterias-alora-slot-';
export const HIGH_PRIZE_ALERT_CENTS = 200000; // 2.000 €

export const OFFICE = {
  openHour: 8,
  closeHour: 20,
  town: 'Álora',
  province: 'Málaga',
  population: 13000,
  employee: 'Miriam',
  businessName: 'Loterías Álora',
};

export const MONTHLY_EXPENSES = {
  rent: 65000,
  electricity: 12000,
  water: 3500,
  internet: 4500,
  insurance: 8000,
  cleaning: 6000,
  supplies: 4000,
};

export function createNewGame(options = {}) {
  const start = options.startDate ? new Date(options.startDate) : new Date(Date.UTC(2026, 0, 7, 8, 0, 0));
  while (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
    start.setUTCDate(start.getUTCDate() + 1);
  }
  start.setUTCHours(8, 0, 0, 0);

  const float = defaultFloatDrawer();
  const holidays = buildHolidayMap(2025, 2032);
  const events = buildAloraEvents(2025, 2032);
  const { abonados, penas } = generateAbonadosAndPenas();

  const stock = {};
  for (const p of PRODUCTS) {
    if (p.stockType === 'physical') {
      stock[p.id] =
        p.category === 'rasca' ? 60 : p.id.includes('navidad') || p.id.includes('nino') ? 30 : 40;
    } else {
      stock[p.id] = null;
    }
  }

  const game = {
    version: SAVE_VERSION,
    gameVersion: GAME_VERSION,
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerName: OFFICE.employee,
      businessName: OFFICE.businessName,
      town: OFFICE.town,
    },
    clock: {
      gameTimeMs: start.getTime(),
      speed: 1,
      paused: false,
      lastRealMs: Date.now(),
    },
    office: { isOpen: true, openedToday: true, dayStarted: true },
    finance: {
      bankCents: STARTING_BANK_CENTS,
      drawer: float,
      floatTargetCents: drawerTotalCents(float),
      daySalesCents: 0,
      dayCommissionCents: 0,
      dayPrizesPaidCents: 0,
      dayPrizesReimbursableCents: 0,
      dayExpensesCents: 0,
      dayShortageCents: 0,
      daySurplusCents: 0,
      arqueoLog: [],
      changeErrorsToday: 0,
      lastSettlement: null,
      ledger: [],
      weeklySnapshots: [],
    },
    jackpots: {},
    onceExtras: [],
    stock,
    orders: [],
    reservations: [],
    tickets: [],
    draws: {},
    prizeManagement: [],
    nextIds: { ticket: 1 },
    customers: {
      regulars: generateRegularCustomers(280),
      abonados,
      penas,
      queue: [],
      current: null,
      servedToday: 0,
      nextSpawnAtMs: start.getTime() + 10 * 1000,
    },
    settings: {
      music: true,
      sfx: true,
      autosaveMinutes: 2,
      theme: 'light',
      musicVolume: 0.45,
      sfxVolume: 0.7,
      fontScale: 1,
      defaultSpeed: 1,
    },
    showcase: [],
    closeHistory: [],
    dayLog: [],
    holidays,
    events,
    stats: {
      totalSalesCents: 0,
      totalCustomers: 0,
      daysPlayed: 0,
      totalCommissionCents: 0,
      totalPrizesPaidCents: 0,
      totalShortageCents: 0,
      totalSurplusCents: 0,
      highPrizesAlerted: 0,
    },
    ui: {
      screen: 'counter',
      toast: null,
      paymentSession: null,
      tpv: null,
      arqueo: null,
      lastTickets: [],
      lastCloseSummary: null,
      fichaId: null,
      highPrizeAlert: null,
      mondayScratchReport: null,
      lastAutosaveAt: null,
      lastAutosaveSlot: null,
      scratchReveal: null,
      penaDayYmd: null,
      penaDayNotice: null,
      lowCashAlert: null,
      lowCashAlertYmd: null,
      pauseSummary: null,
      productSheet: null,
    },
  };
  game.clock.speed = game.settings.defaultSpeed;
  return finalizeNewGame(game);
}

export function finalizeNewGame(state) {
  ensureOnceExtras(state);
  ensureJackpots(state);
  seedDefaultShowcase(state);
  ensureCustomerBirthdays(state.customers.regulars);
  ensureCustomerBirthdays(state.customers.abonados);
  return state;
}

export function migrateState(data) {
  if (!data) return createNewGame();
  if (!data.tickets) data.tickets = [];
  if (!data.draws) data.draws = {};
  if (!data.prizeManagement) data.prizeManagement = [];
  if (!data.events) data.events = buildAloraEvents(2025, 2032);
  else Object.assign(data.events, buildAloraEvents(2025, 2032));
  if (!data.nextIds) data.nextIds = { ticket: 1 };
  if (!data.settings) data.settings = {};
  data.settings = {
    music: data.settings.music !== false,
    sfx: data.settings.sfx !== false,
    autosaveMinutes: data.settings.autosaveMinutes || 2,
    theme: data.settings.theme || 'light',
    musicVolume: data.settings.musicVolume ?? 0.45,
    sfxVolume: data.settings.sfxVolume ?? 0.7,
    fontScale: data.settings.fontScale || 1,
    defaultSpeed: data.settings.defaultSpeed ?? 1,
  };
  if (!data.customers.abonados || !data.customers.penas) {
    const { abonados, penas } = generateAbonadosAndPenas();
    data.customers.abonados = data.customers.abonados || abonados;
    data.customers.penas = data.customers.penas || penas;
  }
  if (!data.customers.queue) data.customers.queue = [];
  if (data.finance && data.finance.dayPrizesReimbursableCents == null) {
    data.finance.dayPrizesReimbursableCents = 0;
  }
  if (!data.stats) data.stats = {};
  data.stats.totalCommissionCents = data.stats.totalCommissionCents || 0;
  data.stats.totalPrizesPaidCents = data.stats.totalPrizesPaidCents || 0;
  data.stats.totalShortageCents = data.stats.totalShortageCents || 0;
  data.stats.totalSurplusCents = data.stats.totalSurplusCents || 0;
  data.stats.highPrizesAlerted = data.stats.highPrizesAlerted || 0;
  if (data.finance) {
    data.finance.daySurplusCents = data.finance.daySurplusCents || 0;
    data.finance.arqueoLog = data.finance.arqueoLog || [];
  }
  // Migrar casos de gestión antiguos + papeleo v1.0
  for (const c of data.prizeManagement || []) {
    if (c.status === 'open' && !c.note) {
      c.note = 'Pendiente documentar y presentar.';
    }
    if (!c.paperwork) c.paperwork = {};
  }
  data.ui = data.ui || {};
  data.ui.bankWithdrawCounts = data.ui.bankWithdrawCounts || null;
  data.onceExtras = data.onceExtras || [];
  data.jackpots = data.jackpots || {};
  data.stock = data.stock || {};
  for (const p of PRODUCTS) {
    if (p.stockType === 'physical' && data.stock[p.id] == null) {
      data.stock[p.id] =
        p.category === 'rasca' ? 40 : p.id.includes('navidad') || p.id.includes('nino') ? 20 : 25;
    } else if (p.stockType !== 'physical' && data.stock[p.id] === undefined) {
      data.stock[p.id] = null;
    }
  }
  ensureShowcase(data);
  if (!data.showcase.length) seedDefaultShowcase(data);
  if (!Array.isArray(data.closeHistory)) data.closeHistory = [];
  ensureCustomerBirthdays(data.customers.regulars);
  ensureCustomerBirthdays(data.customers.abonados);
  for (const a of data.customers.abonados || []) {
    if (a.abonoQty == null) a.abonoQty = 2;
    if (a.abonosConfirmed == null) a.abonosConfirmed = 0;
  }
  data.ui = data.ui || {};
  // v1.0: no borrar TPV / arqueo / cobro / cola — el guardado es absoluto
  if (data.ui.tpv === undefined) data.ui.tpv = null;
  if (data.ui.arqueo === undefined) data.ui.arqueo = null;
  if (data.ui.paymentSession === undefined) data.ui.paymentSession = null;
  if (!data.customers.current && data.customers.current !== null) data.customers.current = null;
  if (!Array.isArray(data.dayLog)) data.dayLog = [];
  if (!Array.isArray(data.reservations)) data.reservations = [];
  if (!Array.isArray(data.weeklySnapshots)) data.weeklySnapshots = [];
  if (!data.archive) data.archive = { tickets: [], ledger: [] };
  data.version = SAVE_VERSION;
  data.gameVersion = GAME_VERSION;
  ensureOnceExtras(data);
  ensureJackpots(data);
  return data;
}

export function emptyCounts() {
  return emptyDrawer();
}
