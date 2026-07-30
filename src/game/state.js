import { PRODUCTS } from '../data/products.js';
import { defaultFloatDrawer, emptyDrawer, drawerTotalCents } from '../data/money.js';
import { buildHolidayMap } from '../data/holidays.js';
import { generateRegularCustomers } from '../data/customers.js';
import { buildAloraEvents } from '../data/events.js';

/** Capital inicial medio (~10.000 € en banco + fondo de caja) */
export const STARTING_BANK_CENTS = 950000;
export const SAVE_VERSION = 2;
export const GAME_VERSION = '0.1';
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

  const stock = {};
  for (const p of PRODUCTS) {
    if (p.stockType === 'physical') {
      stock[p.id] =
        p.category === 'rasca' ? 50 : p.id.includes('navidad') || p.id.includes('nino') ? 25 : 35;
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
    office: {
      isOpen: true,
      openedToday: true,
      dayStarted: true,
    },
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
      queue: [],
      current: null,
      servedToday: 0,
      nextSpawnAtMs: start.getTime() + 12 * 1000,
    },
    dayLog: [],
    holidays,
    events,
    stats: {
      totalSalesCents: 0,
      totalCustomers: 0,
      daysPlayed: 0,
    },
    ui: {
      screen: 'counter',
      toast: null,
      paymentSession: null,
      lastTickets: [],
      lastCloseSummary: null,
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
  if (data.finance && data.finance.dayPrizesReimbursableCents == null) {
    data.finance.dayPrizesReimbursableCents = 0;
  }
  data.version = SAVE_VERSION;
  data.gameVersion = GAME_VERSION;
  return data;
}

export function emptyCounts() {
  return emptyDrawer();
}
