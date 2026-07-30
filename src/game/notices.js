import { getProduct } from '../data/products.js';
import { gameDate, gameYmd } from './time.js';

/** Avisos de sorteos que tocan hoy (o esta noche) */
export function todaysDrawNotices(state) {
  const d = gameDate(state);
  const dow = d.getUTCDay();
  const ymd = gameYmd(state);
  const notices = [];

  const catalog = [
    { id: 'lae-bonoloto', days: [1, 2, 3, 4, 5, 6], label: 'Bonoloto' },
    { id: 'lae-primitiva', days: [3, 6], label: 'Primitiva' },
    { id: 'lae-euromillones', days: [2, 5], label: 'Euromillones' },
    { id: 'lae-nacional', days: [4, 6], label: 'Lotería Nacional' },
    { id: 'lae-gordo-primitiva', days: [0], label: 'Gordo de la Primitiva' },
    { id: 'lae-quiniela', days: [0], label: 'Quiniela' },
    { id: 'once-cupon', days: [1, 2, 3, 4, 5], label: 'Cupón ONCE' },
    { id: 'once-cuponazo', days: [5], label: 'Cuponazo' },
    { id: 'once-eurojackpot', days: [2, 5], label: 'Eurojackpot' },
    { id: 'once-sueldazo', days: [0], label: 'Sueldazo' },
  ];

  for (const c of catalog) {
    if (c.days.includes(dow)) notices.push(c.label);
  }
  if (ymd.endsWith('-12-22')) notices.push('Sorteo de Navidad');
  if (ymd.endsWith('-01-06')) notices.push('Sorteo del Niño');

  // Extraordinarios ONCE programados en state
  for (const ex of state.onceExtras || []) {
    if (ex.ymd === ymd) notices.push(ex.name);
  }
  return notices;
}

/**
 * Encargos especiales con fechas objetivo (Navidad / Niño).
 */
export function specialOrderDeadlines(state) {
  const y = gameDate(state).getUTCFullYear();
  const m = gameDate(state).getUTCMonth() + 1;
  return {
    navidad: {
      productId: 'lae-navidad',
      deliverBy: `${m <= 12 ? y : y}-12-21`,
      drawOn: `${y}-12-22`,
    },
    nino: {
      productId: 'lae-nino',
      deliverBy: m === 1 ? `${y}-01-05` : `${y + 1}-01-05`,
      drawOn: m === 1 ? `${y}-01-06` : `${y + 1}-01-06`,
    },
  };
}

export function createCalendarOrder(state, { productId, qty, clientId, clientName, deliverBy }) {
  const p = getProduct(productId);
  if (!p) return null;
  const order = {
    id: `cal-${Date.now()}`,
    productId,
    productName: p.name,
    qty,
    clientId,
    clientName,
    arriveOnYmd: deliverBy,
    deliverBy,
    status: 'pending',
    reserved: true,
    special: true,
    calendar: true,
  };
  state.orders.push(order);
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Encargo calendario: ${clientName} · ${p.name} ×${qty} (entrega ${deliverBy})`,
  });
  return order;
}

/** Genera 2–3 extraordinarios ONCE al año en el estado */
export function ensureOnceExtras(state) {
  if (state.onceExtras?.length) return state;
  const y = gameDate(state).getUTCFullYear();
  state.onceExtras = [
    { id: 'once-extra-verano', name: 'Extraordinario ONCE Verano', ymd: `${y}-07-15`, priceCents: 600 },
    { id: 'once-extra-navidad', name: 'Extraordinario ONCE Navidad', ymd: `${y}-12-28`, priceCents: 600 },
    { id: 'once-extra-dia', name: 'Extraordinario Día de la ONCE', ymd: `${y}-12-03`, priceCents: 600 },
  ];
  return state;
}
