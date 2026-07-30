import { PRODUCTS } from '../data/products.js';
import { defaultFloatDrawer, emptyDrawer, drawerTotalCents } from '../data/money.js';
import { buildHolidayMap } from '../data/holidays.js';
import { generateRegularCustomers, generateAbonadosAndPenas } from '../data/customers.js';
import { buildAloraEvents } from '../data/events.js';

export const STARTING_BANK_CENTS = 950000;
export const SAVE_VERSION = 3;
export const GAME_VERSION = '0.2';
export const SLOT_COUNT = 3;
export const STORAGE_PREFIX = 'loterias-alora-slot-';

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

  return {
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
      lastSettlement: null,
      ledger: [],
    },
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
    settings: { music: true, sfx: true },
    dayLog: [],
    holidays,
    events,
    stats: { totalSalesCents: 0, totalCustomers: 0, daysPlayed: 0 },
    ui: {
      screen: 'counter',
      toast: null,
      paymentSession: null,
      tpv: null,
      lastTickets: [],
      lastCloseSummary: null,
      fichaId: null,
    },
  };
}

export function migrateState(data) {
  if (!data) return createNewGame();
  if (!data.tickets) data.tickets = [];
  if (!data.draws) data.draws = {};
  if (!data.prizeManagement) data.prizeManagement = [];
  if (!data.events) data.events = buildAloraEvents(2025, 2032);
  if (!data.nextIds) data.nextIds = { ticket: 1 };
  if (!data.settings) data.settings = { music: true, sfx: true };
  if (!data.customers.abonados || !data.customers.penas) {
    const { abonados, penas } = generateAbonadosAndPenas();
    data.customers.abonados = data.customers.abonados || abonados;
    data.customers.penas = data.customers.penas || penas;
  }
  if (!data.customers.queue) data.customers.queue = [];
  if (data.finance && data.finance.dayPrizesReimbursableCents == null) {
    data.finance.dayPrizesReimbursableCents = 0;
  }
  data.ui = data.ui || {};
  data.ui.tpv = null;
  data.version = SAVE_VERSION;
  data.gameVersion = GAME_VERSION;
  return data;
}

export function emptyCounts() {
  return emptyDrawer();
}
