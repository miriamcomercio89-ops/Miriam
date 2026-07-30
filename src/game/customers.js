import { getProduct, PRODUCTS } from '../data/products.js';
import { makeVisitor } from '../data/customers.js';
import { isOpenHours, gameDate, gameYmd } from './time.js';
import { startPayment } from './cash.js';
import { formatEuro } from '../data/money.js';
import { eventOn } from '../data/events.js';
import { checkTicket, ticketsForClient } from './tickets.js';
import { ensureDrawsResolved } from './draws.js';
import { hashSeed, mulberry32 } from './rng.js';

export function crowdFactor(state) {
  const d = gameDate(state);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  let f = 1;
  if (month === 12 || (month === 11 && day >= 15)) f += 0.8;
  if (month === 1 && day <= 10) f += 0.6;
  if (d.getUTCDay() === 5) f += 0.25;
  const ev = eventOn(gameYmd(state), state.events);
  if (ev) f += ev.crowd || 0;
  return f;
}

export function maybeSpawnCustomers(state) {
  if (!isOpenHours(state)) return state;
  if (['cash', 'close', 'tpv', 'prize-flow'].includes(state.ui.screen)) return state;

  ensureDrawsResolved(state);
  const now = state.clock.gameTimeMs;
  if (now < state.customers.nextSpawnAtMs) return state;

  // Si no hay cliente actual, sacar de cola o crear
  if (!state.customers.current) {
    if (state.customers.queue.length > 0) {
      state.customers.current = state.customers.queue.shift();
    } else {
      const client = pickArrivingClient(state);
      if (client) {
        attachIntent(state, client);
        state.customers.current = client;
      }
    }
    scheduleNextSpawn(state);
    return state;
  }

  // Ya hay alguien en mostrador → puede llegar gente a la cola (sin tope)
  if (Math.random() < 0.55) {
    const client = pickArrivingClient(state);
    if (client) {
      attachIntent(state, client);
      state.customers.queue.push(client);
    }
  }
  scheduleNextSpawn(state);
  return state;
}

function scheduleNextSpawn(state) {
  const factor = crowdFactor(state);
  const minMs = (16 * 1000) / factor;
  const maxMs = (70 * 1000) / factor;
  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + minMs + Math.random() * (maxMs - minMs);
}

function pickArrivingClient(state) {
  const rng = Math.random;
  // Peñas / abonados con menos frecuencia pero relevantes
  if (rng() < 0.08 && state.customers.abonados?.length) {
    const a = state.customers.abonados[Math.floor(rng() * state.customers.abonados.length)];
    return { ...a };
  }
  if (rng() < 0.06 && state.customers.penas?.length) {
    const a = state.customers.penas[Math.floor(rng() * state.customers.penas.length)];
    return { ...a };
  }
  if (rng() < 0.28 + (crowdFactor(state) - 1) * 0.08) return makeVisitor();

  const dow = gameDate(state).getUTCDay();
  const candidates = state.customers.regulars.filter((c) => {
    let chance = c.visitChance * crowdFactor(state);
    if (c.preferredDays?.includes(dow)) chance *= 2.2;
    return rng() < chance;
  });
  if (!candidates.length) {
    const list = state.customers.regulars;
    return { ...list[Math.floor(rng() * list.length)] };
  }
  return { ...candidates[Math.floor(rng() * candidates.length)] };
}

export function attachIntent(state, client) {
  const rng = Math.random;
  const owned = ticketsForClient(state, client.id);
  const checkable = owned.filter((t) => t.status === 'active' || (t.status === 'checked' && t.deferred));
  const claimable = owned.filter((t) => t.status === 'checked' && t.prizeCents > 0 && !t.paidAt);
  const managed = owned.filter((t) => t.status === 'managed');

  let roll = rng();
  if (claimable.length && roll < 0.28) {
    client.intent = 'claim';
    client.ticketFocus = claimable[Math.floor(rng() * claimable.length)];
    client.wishlist = [];
    client.note = `Viene a cobrar ${formatEuro(client.ticketFocus.prizeCents)}.`;
    return client;
  }
  if (managed.length && roll < 0.15) {
    client.intent = 'managed_ask';
    client.ticketFocus = managed[0];
    client.wishlist = [];
    client.note = 'Pregunta por su premio en gestión.';
    return client;
  }
  if (checkable.length && roll < 0.4) {
    const ticket = checkable[Math.floor(rng() * checkable.length)];
    client.intent = 'check';
    client.ticketFocus = ticket;
    client.wishlist = [];
    client.note = `Quiere comprobar ${ticket.productName}.`;
    return client;
  }
  if (isSpecialSeason(state) && rng() < 0.12) {
    client.intent = 'reserve_special';
    const m = gameDate(state).getUTCMonth() + 1;
    const productId = m === 1 ? 'lae-nino' : 'lae-navidad';
    const p = getProduct(productId);
    const qty = 1 + Math.floor(rng() * 4);
    client.wishlist = [{ productId: p.id, productName: p.name, qty, preferDictate: false }];
    client.note = `Encargo de ${p.name} ×${qty}`;
    return client;
  }

  client.intent = 'buy';
  client.wishlist = buildRichWishlist(state, client);
  client.note = client.line || 'Quiere varias cosas.';
  return client;
}

/** Miles de combinaciones posibles vía plantillas + RNG */
export function buildRichWishlist(state, client) {
  const rng = mulberry32(hashSeed('wish', state.clock.gameTimeMs, client.id, Math.floor(Math.random() * 1e9)));
  const templates = WISH_TEMPLATES;
  const tpl = templates[Math.floor(rng() * templates.length)];
  const lines = [];

  for (const slot of tpl) {
    if (rng() > (slot.p ?? 1)) continue;
    let productId = slot.id;
    if (slot.pool) productId = slot.pool[Math.floor(rng() * slot.pool.length)];
    // Preferencias del cliente
    if (slot.usePref && client.preferredProducts?.length && rng() < 0.55) {
      productId = client.preferredProducts[Math.floor(rng() * client.preferredProducts.length)];
    }
    const p = getProduct(productId);
    if (!p) continue;
    let qty = slot.qty || 1;
    if (typeof qty === 'function') qty = qty(rng);
    if (client.kind === 'pena') qty += 1 + Math.floor(rng() * 4);
    if (client.kind === 'abonado') qty += Math.floor(rng() * 2);
    lines.push({
      productId: p.id,
      productName: p.name,
      qty: Math.max(1, qty),
      preferDictate: !!slot.dictate || (client.trait === 'práctica' && rng() < 0.35),
    });
  }

  if (!lines.length) {
    const p = getProduct(client.preferredProducts?.[0] || 'lae-bonoloto');
    lines.push({ productId: p.id, productName: p.name, qty: 1, preferDictate: false });
  }
  return lines;
}

const POOLS = {
  lae: ['lae-primitiva', 'lae-bonoloto', 'lae-euromillones', 'lae-nacional', 'lae-gordo-primitiva', 'lae-quiniela'],
  once: ['once-cupon', 'once-cuponazo', 'once-eurojackpot', 'once-super-once', 'once-triplex'],
  rasca: ['rasca-7-vidas', 'rasca-multiplica', 'rasca-diamante', 'rasca-oro', 'rasca-jackpot', 'rasca-once-clasico'],
  auto: ['and-fortuna', 'and-olivo', 'and-costa'],
  prov: ['mal-premio', 'mal-axarquia'],
  local: ['alo-local', 'alo-hoya', 'alo-chorro'],
};

const WISH_TEMPLATES = [
  [{ usePref: true, qty: (r) => 1 + Math.floor(r() * 3) }, { pool: POOLS.rasca, qty: (r) => 1 + Math.floor(r() * 4), p: 0.7 }],
  [{ id: 'lae-euromillones', qty: 2, dictate: true }, { id: 'lae-bonoloto', qty: (r) => 2 + Math.floor(r() * 6) }],
  [{ id: 'lae-nacional', qty: 1 }, { pool: POOLS.once, qty: 1 }, { pool: POOLS.rasca, qty: 3 }],
  [{ id: 'lae-primitiva', qty: 1, dictate: true }, { id: 'lae-primitiva', qty: 1 }, { id: 'lae-gordo-primitiva', qty: 1, p: 0.5 }],
  [{ id: 'lae-quiniela', qty: 1, dictate: true }, { id: 'lae-quinigol', qty: 1, p: 0.4 }, { pool: POOLS.rasca, qty: 2, p: 0.6 }],
  [{ pool: POOLS.once, qty: (r) => 1 + Math.floor(r() * 3) }, { id: 'once-eurojackpot', qty: 1, dictate: true }],
  [{ pool: POOLS.auto, qty: 2 }, { pool: POOLS.local, qty: 1 }, { pool: POOLS.rasca, qty: 2 }],
  [{ pool: POOLS.prov, qty: 1 }, { id: 'lae-bonoloto', qty: 4 }, { id: 'alo-local', qty: 2 }],
  // peña-style big basket
  [
    { id: 'lae-euromillones', qty: 5 },
    { id: 'lae-primitiva', qty: 5, dictate: true },
    { id: 'lae-nacional', qty: 2 },
    { pool: POOLS.rasca, qty: 10, p: 0.8 },
  ],
  [{ id: 'once-super-once', qty: 3 }, { id: 'once-triplex', qty: 2, dictate: true }, { pool: POOLS.rasca, qty: 1 }],
  [{ id: 'lae-lototurf', qty: 1 }, { id: 'lae-bonoloto', qty: 2 }, { pool: POOLS.local, qty: 1, p: 0.5 }],
  // many small random mixes
  ...Array.from({ length: 40 }, () => {
    const n = 1 + Math.floor(Math.random() * 4);
    return Array.from({ length: n }, () => {
      const pools = Object.values(POOLS);
      const pool = pools[Math.floor(Math.random() * pools.length)];
      return { pool, qty: 1 + Math.floor(Math.random() * 3), dictate: Math.random() < 0.25, p: 0.5 + Math.random() * 0.5 };
    });
  }),
];

function isSpecialSeason(state) {
  const m = gameDate(state).getUTCMonth() + 1;
  const d = gameDate(state).getUTCDate();
  if (m === 11 || m === 12) return true;
  if (m === 1 && d <= 10) return true;
  if (m === 10 && d >= 20) return true;
  return false;
}

export function sellToCurrent(state) {
  // Compat: abrir TPV
  return state;
}

export function dismissCurrent(state, reason = 'Cliente atendido') {
  state.dayLog.push({ at: state.clock.gameTimeMs, text: reason });
  state.customers.current = null;
  return state;
}

export function reserveForCurrent(state) {
  const client = state.customers.current;
  const items = client?.wishlist?.length
    ? client.wishlist
    : client?.request
      ? [client.request]
      : [];
  if (!items.length) return state;
  for (const w of items) {
    const p = getProduct(w.productId);
    if (!p) continue;
    const days = p.orderDays ?? 2;
    const arrive = addBusinessDays(state, days);
    state.orders.push({
      id: `ord-${Date.now()}-${w.productId}`,
      productId: p.id,
      productName: p.name,
      qty: w.qty,
      clientId: client.id,
      clientName: client.name,
      arriveOnYmd: arrive,
      status: 'pending',
      reserved: true,
      special: client.intent === 'reserve_special',
    });
  }
  state.ui.toast = 'Reservas hechas sin cobro.';
  state.customers.current = null;
  return state;
}

export function orderStock(state, productId, qty) {
  const p = getProduct(productId);
  if (!p || p.stockType !== 'physical') return state;
  const arrive = addBusinessDays(state, p.orderDays ?? 2);
  state.orders.push({
    id: `ord-${Date.now()}`,
    productId,
    productName: p.name,
    qty,
    clientId: null,
    clientName: null,
    arriveOnYmd: arrive,
    status: 'pending',
    reserved: false,
  });
  state.ui.toast = `Pedido ${p.name} ×${qty} → ${arrive}`;
  return state;
}

function addBusinessDays(state, days) {
  const d = gameDate(state);
  let left = days;
  let guard = 0;
  while (left > 0 && guard++ < 400) {
    d.setUTCDate(d.getUTCDate() + 1);
    const ymd = d.toISOString().slice(0, 10);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !state.holidays[ymd]) left--;
  }
  return d.toISOString().slice(0, 10);
}

export function processArrivingOrders(state) {
  const ymd = gameDate(state).toISOString().slice(0, 10);
  for (const o of state.orders) {
    if (o.status !== 'pending' || o.arriveOnYmd > ymd) continue;
    o.status = 'arrived';
    if (!o.reserved) {
      state.stock[o.productId] = (state.stock[o.productId] || 0) + o.qty;
      state.dayLog.push({ at: state.clock.gameTimeMs, text: `Pedido recibido: ${o.productName} ×${o.qty}` });
    } else {
      state.dayLog.push({
        at: state.clock.gameTimeMs,
        text: `Encargo listo: ${o.clientName} · ${o.productName} ×${o.qty}`,
      });
    }
  }
  return state;
}

export function checkCurrentTicket(state) {
  const client = state.customers.current;
  if (!client?.ticketFocus) return state;
  const result = checkTicket(state, client.ticketFocus.id);
  client.checkResult = result;
  if (result.pending) state.ui.toast = result.detail;
  else if (result.prizeCents > 0) {
    state.ui.toast = `¡Ha tocado ${formatEuro(result.prizeCents)}!`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Comprobación: ${client.name} · PREMIO ${formatEuro(result.prizeCents)}`,
    });
  } else {
    state.ui.toast = 'No ha tocado.';
  }
  client.ticketFocus = result.ticket || client.ticketFocus;
  return state;
}

export { formatEuro };
