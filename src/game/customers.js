import { getProduct, PRODUCTS } from '../data/products.js';
import { makeVisitor } from '../data/customers.js';
import { isOpenHours, gameDate } from './time.js';
import { startPayment } from './cash.js';
import { formatEuro } from '../data/money.js';

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Factor de afluencia por eventos (Navidad, Niño, botes…) */
export function crowdFactor(state) {
  const d = gameDate(state);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  let f = 1;
  // Campaña Navidad
  if (month === 12 || (month === 11 && day >= 15)) f += 0.8;
  // Niño
  if (month === 1 && day <= 10) f += 0.6;
  // Euromillones viernes “bote” simulado ocasional
  if (d.getUTCDay() === 5) f += 0.25;
  return f;
}

export function maybeSpawnCustomers(state) {
  if (!isOpenHours(state)) return state;
  if (state.ui.screen === 'cash' || state.ui.screen === 'close') return state;
  if (state.customers.current) return state;

  const now = state.clock.gameTimeMs;
  if (now < state.customers.nextSpawnAtMs) return state;

  // Si hay cola, atender siguiente; si no, generar
  if (state.customers.queue.length > 0) {
    state.customers.current = state.customers.queue.shift();
    scheduleNextSpawn(state);
    return state;
  }

  const client = pickArrivingClient(state);
  if (client) {
    attachRequest(state, client);
    state.customers.current = client;
  }
  scheduleNextSpawn(state);
  return state;
}

function scheduleNextSpawn(state) {
  const factor = crowdFactor(state);
  // Entre ~20 s y ~90 s de juego (menos si hay afluencia)
  const minMs = (20 * 1000) / factor;
  const maxMs = (90 * 1000) / factor;
  const wait = minMs + Math.random() * (maxMs - minMs);
  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + wait;
}

function pickArrivingClient(state) {
  const rng = Math.random;
  // 70% habituales, 30% visitantes (ajustado por afluencia)
  const wantVisitor = rng() < 0.28 + (crowdFactor(state) - 1) * 0.1;
  if (wantVisitor) return makeVisitor();

  // Elegir habitual según visitChance
  const candidates = state.customers.regulars.filter((c) => rng() < c.visitChance * crowdFactor(state));
  if (candidates.length === 0) {
    // fallback: uno al azar
    const list = state.customers.regulars;
    return { ...list[Math.floor(rng() * list.length)] };
  }
  return { ...candidates[Math.floor(rng() * candidates.length)] };
}

/** Qué quiere comprar el cliente (gustos fijos con variación) */
export function attachRequest(state, client) {
  const rng = Math.random;
  const prefs = client.preferredProducts || [];
  let productId = prefs[Math.floor(rng() * prefs.length)];
  // 25% cambia de idea
  if (rng() < 0.25) {
    productId = PRODUCTS[Math.floor(rng() * PRODUCTS.length)].id;
  }
  const product = getProduct(productId) || PRODUCTS[0];
  let qty = 1;
  if (product.category === 'rasca') qty = 1 + Math.floor(rng() * 3);
  if (product.id === 'lae-nacional') qty = 1 + Math.floor(rng() * 2);
  if (product.id === 'lae-bonoloto' || product.id === 'lae-primitiva') qty = 1 + Math.floor(rng() * 4);

  client.request = {
    productId: product.id,
    productName: product.name,
    qty,
    unitCents: product.priceCents,
    totalCents: product.priceCents * qty,
  };
  return client;
}

export function sellToCurrent(state) {
  const client = state.customers.current;
  if (!client?.request) return state;
  const p = getProduct(client.request.productId);
  if (!p) return state;

  // Comprobar stock físico
  if (p.stockType === 'physical') {
    const have = state.stock[p.id] || 0;
    if (have < client.request.qty) {
      state.ui.toast = `No hay stock suficiente de ${p.name}. Puedes hacer un pedido/reserva.`;
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

/** Reserva sin pagar: pedido según plazo del producto */
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

export { formatEuro };
