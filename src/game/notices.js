import { getProduct, PRODUCTS } from '../data/products.js';
import { gameDate, gameYmd } from './time.js';

/** Avisos de sorteos que tocan hoy (LAE/ONCE + inventadas). */
export function todaysDrawNotices(state) {
  const d = gameDate(state);
  const dow = d.getUTCDay();
  const ymd = gameYmd(state);
  const notices = [];
  const seen = new Set();

  const push = (label) => {
    if (!label || seen.has(label)) return;
    seen.add(label);
    notices.push(label);
  };

  for (const p of PRODUCTS) {
    if (p.category === 'rasca' || p.instant) continue;
    if (p.drawDays?.length && p.drawDays.includes(dow)) {
      push(p.short || p.name);
    }
  }
  if (ymd.endsWith('-12-22')) {
    push('Sorteo de Navidad');
    push('Navidad Aloreña');
  }
  if (ymd.endsWith('-01-06')) push('Sorteo del Niño');

  for (const ex of state.onceExtras || []) {
    if (ex.ymd === ymd) push(ex.name);
  }
  return notices;
}

/** Detalle enriquecido para banner (hora si hay). */
export function todaysDrawDetails(state) {
  const d = gameDate(state);
  const dow = d.getUTCDay();
  const ymd = gameYmd(state);
  const list = [];
  for (const p of PRODUCTS) {
    if (p.category === 'rasca' || p.instant) continue;
    if (p.drawDays?.length && p.drawDays.includes(dow)) {
      const hour = p.drawHour ?? 21;
      list.push({
        id: p.id,
        name: p.short || p.name,
        hour,
        org: p.org,
        trait: p.trait || '',
      });
    }
  }
  if (ymd.endsWith('-12-22')) {
    list.push({ id: 'lae-navidad', name: 'Navidad', hour: 21, org: 'LAE', trait: '' });
  }
  if (ymd.endsWith('-01-06')) {
    list.push({ id: 'lae-nino', name: 'El Niño', hour: 21, org: 'LAE', trait: '' });
  }
  list.sort((a, b) => a.hour - b.hour || a.name.localeCompare(b.name));
  return list;
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

const ONCE_EXTRA_IDS = new Set(['once-extra-verano', 'once-extra-navidad', 'once-extra-dia']);

/** Extraordinarios ONCE solo se venden el día del sorteo (y víspera). */
export function isOnceExtraSellable(state, productId) {
  if (!ONCE_EXTRA_IDS.has(productId)) return true;
  const ymd = gameYmd(state);
  return (state.onceExtras || []).some((ex) => {
    if (ex.id !== productId) return false;
    if (ex.ymd === ymd) return true;
    // Víspera
    const d = new Date(`${ex.ymd}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10) === ymd;
  });
}

export function onceExtraToday(state) {
  const ymd = gameYmd(state);
  return (state.onceExtras || []).filter((ex) => {
    if (ex.ymd === ymd) return true;
    const d = new Date(`${ex.ymd}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10) === ymd;
  });
}
