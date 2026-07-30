import { PRODUCTS } from '../data/products.js';
import { defaultFloatDrawer, emptyDrawer, drawerTotalCents } from '../data/money.js';
import { buildHolidayMap } from '../data/holidays.js';
import { generateRegularCustomers } from '../data/customers.js';

/** Capital inicial medio (~10.000 € en banco + fondo de caja) */
export const STARTING_BANK_CENTS = 950000; // 9.500 €
export const SAVE_VERSION = 1;
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

/** Gastos mensuales aproximados del local (en céntimos) */
export const MONTHLY_EXPENSES = {
  rent: 65000, // 650 €
  electricity: 12000,
  water: 3500,
  internet: 4500,
  insurance: 8000,
  cleaning: 6000,
  supplies: 4000,
};

export function createNewGame(options = {}) {
  const start = options.startDate ? new Date(options.startDate) : new Date(Date.UTC(2026, 0, 7, 8, 0, 0));
  // Ajustar al primer día laborable
  while (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
    start.setUTCDate(start.getUTCDate() + 1);
  }
  start.setUTCHours(8, 0, 0, 0);

  const float = defaultFloatDrawer();
  const holidays = buildHolidayMap(2025, 2032);

  const stock = {};
  for (const p of PRODUCTS) {
    if (p.stockType === 'physical') {
      stock[p.id] = p.category === 'rasca' ? 40 : p.id.includes('navidad') || p.id.includes('nino') ? 20 : 30;
    } else {
      // Terminal: sin stock físico (null = ilimitado; evita Infinity en JSON)
      stock[p.id] = null;
    }
  }

  return {
    version: SAVE_VERSION,
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerName: OFFICE.employee,
      businessName: OFFICE.businessName,
      town: OFFICE.town,
    },
    clock: {
      /** Fecha/hora de juego en ms UTC */
      gameTimeMs: start.getTime(),
      /** Multiplicador sobre la base 0.25 (4× más lento). 0 = pausa */
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
      dayExpensesCents: 0,
      ledger: [],
    },
    stock,
    orders: [], // { id, productId, qty, clientId?, clientName?, arriveOnYmd, status }
    reservations: [],
    customers: {
      regulars: generateRegularCustomers(280),
      queue: [],
      current: null,
      servedToday: 0,
      nextSpawnAtMs: start.getTime() + 12 * 1000, // primer cliente ~12 s de juego
    },
    dayLog: [],
    holidays,
    stats: {
      totalSalesCents: 0,
      totalCustomers: 0,
      daysPlayed: 0,
    },
    ui: {
      screen: 'counter', // menu | counter | cash | close | saves
      toast: null,
      paymentSession: null,
    },
  };
}

export function emptyCounts() {
  return emptyDrawer();
}
