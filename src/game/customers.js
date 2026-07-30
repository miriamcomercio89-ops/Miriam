import { getProduct, PRODUCTS } from '../data/products.js';
import { makeVisitor } from '../data/customers.js';
import { isOpenHours, gameDate, gameYmd } from './time.js';
import { startPayment } from './cash.js';
import { formatEuro } from '../data/money.js';
import { eventOn } from '../data/events.js';
import { checkTicket, ticketsForClient, pendingClaimTickets } from './tickets.js';
import { ensureDrawsResolved } from './draws.js';

/** Factor de afluencia por eventos / campañas */
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
  if (state.ui.screen === 'cash' || state.ui.screen === 'close' || state.ui.screen === 'prize-flow') return state;
  if (state.customers.current) return state;

  ensureDrawsResolved(state);

  const now = state.clock.gameTimeMs;
  if (now < state.customers.nextSpawnAtMs) return state;

  if (state.customers.queue.length > 0) {
    state.customers.current = state.customers.queue.shift();
    scheduleNextSpawn(state);
    return state;
  }

  const client = pickArrivingClient(state);
  if (client) {
    attachIntent(state, client);
    state.customers.current = client;
  }
  scheduleNextSpawn(state);
  return state;
}

function scheduleNextSpawn(state) {
  const factor = crowdFactor(state);
  const minMs = (18 * 1000) / factor;
  const maxMs = (80 * 1000) / factor;
  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + minMs + Math.random() * (maxMs - minMs);
}

function pickArrivingClient(state) {
  const rng = Math.random;
  const wantVisitor = rng() < 0.28 + (crowdFactor(state) - 1) * 0.08;
  if (wantVisitor) return makeVisitor();

  const dow = gameDate(state).getUTCDay();
  const candidates = state.customers.regulars.filter((c) => {
    let chance = c.visitChance * crowdFactor(state);
    if (c.preferredDays?.includes(dow)) chance *= 2.2;
    return rng() < chance;
  });
  if (candidates.length === 0) {
    const list = state.customers.regulars;
    return { ...list[Math.floor(rng() * list.length)] };
  }
  return { ...candidates[Math.floor(rng() * candidates.length)] };
}

/**
 * Intenciones: buy | check | claim | reserve_special
 */
export function attachIntent(state, client) {
  const rng = Math.random;
  const owned = ticketsForClient(state, client.id);
  const checkable = owned.filter((t) => t.status === 'active' || (t.status === 'checked' && t.deferred));
  const claimable = owned.filter((t) => t.status === 'checked' && t.prizeCents > 0 && !t.paidAt);
  const managed = owned.filter((t) => t.status === 'managed');

  // Probabilidades
  let roll = rng();
  const seasonReserve = isSpecialSeason(state) && rng() < 0.18;

  if (claimable.length && roll < 0.35) {
    const ticket = claimable[Math.floor(rng() * claimable.length)];
    client.intent = 'claim';
    client.ticketFocus = ticket;
    client.request = null;
    client.note = `Viene a cobrar un premio de ${formatEuro(ticket.prizeCents)}.`;
    return client;
  }
  if (managed.length && roll < 0.2) {
    client.intent = 'managed_ask';
    client.ticketFocus = managed[0];
    client.request = null;
    client.note = 'Pregunta por el estado de su premio en gestión.';
    return client;
  }
  if (checkable.length && roll < 0.45) {
    // Preferir tickets cuyo sorteo ya pasó o rascas
    const ready = checkable.filter((t) => t.kind === 'rasca' || t.status === 'active');
    const ticket = (ready.length ? ready : checkable)[Math.floor(rng() * (ready.length || checkable.length))];
    client.intent = 'check';
    client.ticketFocus = ticket;
    client.request = null;
    client.note = `Quiere comprobar ${ticket.productName} (${ticket.id}).`;
    return client;
  }
  if (seasonReserve) {
    const pid = gameDate(state).getUTCMonth() === 0 ? 'lae-nino' : 'lae-navidad';
    // Nov-dic navidad; ene niño
    const m = gameDate(state).getUTCMonth() + 1;
    const productId = m === 1 ? 'lae-nino' : 'lae-navidad';
    const p = getProduct(productId);
    client.intent = 'reserve_special';
    client.request = {
      productId: p.id,
      productName: p.name,
      qty: 1 + Math.floor(rng() * 3),
      unitCents: p.priceCents,
      totalCents: p.priceCents * (1 + Math.floor(rng() * 3)),
    };
    client.request.totalCents = client.request.unitCents * client.request.qty;
    client.note = `Encargo de ${p.name}.`;
    return client;
  }

  // Compra normal
  client.intent = 'buy';
  attachBuyRequest(state, client);
  return client;
}

function isSpecialSeason(state) {
  const m = gameDate(state).getUTCMonth() + 1;
  const d = gameDate(state).getUTCDate();
  if (m === 11 || m === 12) return true;
  if (m === 1 && d <= 10) return true;
  if (m === 10 && d >= 20) return true;
  return false;
}

function attachBuyRequest(state, client) {
  const rng = Math.random;
  const prefs = client.preferredProducts || [];
  let productId = prefs[Math.floor(rng() * prefs.length)];
  if (client.trait === 'impulsiva' || rng() < 0.25) {
    productId = PRODUCTS[Math.floor(rng() * PRODUCTS.length)].id;
  }
  const product = getProduct(productId) || PRODUCTS[0];
  let qty = 1;
  if (product.category === 'rasca') qty = 1 + Math.floor(rng() * 3);
  if (product.id === 'lae-nacional') qty = 1 + Math.floor(rng() * 2);
  if (product.id === 'lae-bonoloto' || product.id === 'lae-primitiva') qty = 1 + Math.floor(rng() * 4);
  if (client.trait === 'generosa') qty += 1 + Math.floor(rng() * 2);

  client.request = {
    productId: product.id,
    productName: product.name,
    qty,
    unitCents: product.priceCents,
    totalCents: product.priceCents * qty,
  };
  client.note = client.line || '';
}

export function sellToCurrent(state) {
  const client = state.customers.current;
  if (!client?.request) return state;
  const p = getProduct(client.request.productId);
  if (!p) return state;

  if (p.stockType === 'physical') {
    const have = state.stock[p.id] || 0;
    if (have < client.request.qty) {
      state.ui.toast = `No hay stock de ${p.name}. Puedes reservar/pedir.`;
      return state;
    }
  }

  const items = [
    {
      productId: p.id,
      name: p.name,
      qty: client.request.qty,
      unitCents: p.priceCents,
    },
  ];
  return startPayment(state, { items, client, purpose: 'sale' });
}

export function dismissCurrent(state, reason = 'Cliente atendido') {
  state.customers.current = null;
  state.dayLog.push({ at: state.clock.gameTimeMs, text: reason });
  return state;
}

export function reserveForCurrent(state) {
  const client = state.customers.current;
  if (!client?.request) return state;
  const p = getProduct(client.request.productId);
  if (!p) return state;

  const days = p.orderDays ?? 2;
  const arrive = addBusinessDays(state, days);
  const order = {
    id: `ord-${Date.now()}`,
    productId: p.id,
    productName: p.name,
    qty: client.request.qty,
    clientId: client.id,
    clientName: client.name,
    arriveOnYmd: arrive,
    status: 'pending',
    reserved: true,
    special: client.intent === 'reserve_special',
  };
  state.orders.push(order);
  state.reservations.push(order);
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Reserva para ${client.name}: ${p.name} ×${client.request.qty} (llegada ${arrive})`,
  });
  state.ui.toast = `Reserva hecha. Llegará el ${arrive}. Sin cobro ahora.`;
  state.customers.current = null;
  return state;
}

export function orderStock(state, productId, qty) {
  const p = getProduct(productId);
  if (!p || p.stockType !== 'physical') return state;
  const days = p.orderDays ?? 2;
  const arrive = addBusinessDays(state, days);
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
  state.ui.toast = `Pedido de ${p.name} ×${qty}. Llegada ${arrive}.`;
  return state;
}

function addBusinessDays(state, days) {
  const d = gameDate(state);
  let left = days;
  let guard = 0;
  while (left > 0 && guard++ < 400) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    const ymd = d.toISOString().slice(0, 10);
    const hol = state.holidays[ymd];
    if (dow !== 0 && dow !== 6 && !hol) left--;
  }
  return d.toISOString().slice(0, 10);
}

export function processArrivingOrders(state) {
  const ymd = gameDate(state).toISOString().slice(0, 10);
  for (const o of state.orders) {
    if (o.status !== 'pending') continue;
    if (o.arriveOnYmd <= ymd) {
      o.status = 'arrived';
      if (!o.reserved) {
        state.stock[o.productId] = (state.stock[o.productId] || 0) + o.qty;
        state.dayLog.push({
          at: state.clock.gameTimeMs,
          text: `Pedido recibido: ${o.productName} ×${o.qty}`,
        });
      } else {
        state.dayLog.push({
          at: state.clock.gameTimeMs,
          text: `Encargo listo para ${o.clientName}: ${o.productName} ×${o.qty}`,
        });
      }
    }
  }
  return state;
}

/** Comprobar el ticket que trae el cliente actual */
export function checkCurrentTicket(state) {
  const client = state.customers.current;
  if (!client?.ticketFocus) return state;
  const result = checkTicket(state, client.ticketFocus.id);
  client.checkResult = result;
  if (result.pending) {
    state.ui.toast = result.detail;
  } else if (result.prizeCents > 0) {
    state.ui.toast = `¡Ha tocado ${formatEuro(result.prizeCents)}! (${result.detail})`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Comprobación: ${client.name} · ${result.ticket.productName} · PREMIO ${formatEuro(result.prizeCents)}`,
    });
  } else {
    state.ui.toast = `No ha tocado. ${result.detail || ''}`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Comprobación: ${client.name} · sin premio`,
    });
  }
  // refrescar referencia
  client.ticketFocus = result.ticket || client.ticketFocus;
  return state;
}

export { formatEuro, pendingClaimTickets };
