import { getProduct, PRODUCTS, REGIONAL_IDS } from '../data/products.js';
import { makeVisitor } from '../data/customers.js';
import { isOpenHours, gameDate, gameYmd, BASE_SCALE } from './time.js';
import { startPayment } from './cash.js';
import { formatEuro } from '../data/money.js';
import { eventOn } from '../data/events.js';
import { checkTicket, ticketsForClient } from './tickets.js';
import { ensureDrawsResolved } from './draws.js';
import { hashSeed, mulberry32 } from './rng.js';
import { isBirthdayToday, matchesSanto } from '../data/birthdays.js';
import { hotJackpots, jackpotCrowdBonus } from './jackpots.js';
import { drawsHappeningNow } from './draws.js';
import { onceExtraToday } from './notices.js';
import { makeNumberAsk, numberAskLabel } from './numberAsks.js';

export function crowdFactor(state) {
  const d = gameDate(state);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  let f = 1;
  if (month === 12 || (month === 11 && day >= 15)) f += 0.8;
  if (month === 1 && day <= 10) f += 0.6;
  if (d.getUTCDay() === 5) f += 0.25;
  // Temporada turística El Chorro / Caminito: verano + puentes
  if (month >= 6 && month <= 9) f += 0.45;
  if (month === 10 && day >= 10 && day <= 14) f += 0.35;
  if (month === 12 && day >= 5 && day <= 9) f += 0.25;
  const ev = eventOn(gameYmd(state), state.events);
  if (ev) f += ev.crowd || 0;
  f += jackpotCrowdBonus(state);
  const live = drawsHappeningNow(state);
  if (live.some((x) => x.phase === 'live')) f += 0.35;
  else if (live.length) f += 0.15;
  return f;
}

export function arrivedReservedForClient(state, clientId) {
  return (state.orders || []).filter(
    (o) => o.reserved && o.status === 'arrived' && o.clientId === clientId,
  );
}

export function markPickupDelivered(state, clientId) {
  let n = 0;
  for (const o of state.orders || []) {
    if (o.reserved && o.status === 'arrived' && o.clientId === clientId) {
      o.status = 'delivered';
      o.deliveredAt = state.clock.gameTimeMs;
      n += 1;
    }
  }
  if (n) {
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Encargo(s) entregado(s): ${n} pedido(s)`,
    });
  }
  return n;
}

export function isTouristSeason(state) {
  const m = gameDate(state).getUTCMonth() + 1;
  const d = gameDate(state).getUTCDate();
  if (m >= 6 && m <= 9) return true;
  if (m === 10 && d >= 10 && d <= 14) return true;
  if (m === 12 && d >= 5 && d <= 9) return true;
  return false;
}

export function maybeSpawnCustomers(state) {
  if (!isOpenHours(state)) return state;
  if (['cash', 'close', 'tpv', 'prize-flow'].includes(state.ui.screen)) return state;

  ensureDrawsResolved(state);
  processArrivingOrders(state);
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

/**
 * Ritmo real deseado (como con el BASE_SCALE antiguo 0.25):
 * ~64–280 s reales entre llegadas a velocidad Normal.
 * Se convierte a tiempo de juego con BASE_SCALE para que, al acelerar el día,
 * no lleguen clientes cada pocos segundos reales.
 */
const SPAWN_MIN_REAL_MS = 64_000;
const SPAWN_MAX_REAL_MS = 280_000;

function scheduleNextSpawn(state) {
  const factor = Math.max(0.35, crowdFactor(state));
  const minMs = (SPAWN_MIN_REAL_MS * BASE_SCALE) / factor;
  const maxMs = (SPAWN_MAX_REAL_MS * BASE_SCALE) / factor;
  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + minMs + Math.random() * (maxMs - minMs);
}

/** Viernes: turno de peña (pedido grande, transferencia). */
export function maybeSpawnPenaDay(state) {
  const d = gameDate(state);
  if (d.getUTCDay() !== 5) return null; // viernes
  const ymd = gameYmd(state);
  if (state.ui.penaDayYmd === ymd) return null;
  if (!state.customers.penas?.length) return null;
  if (rngGate(0.55) === false) return null;
  state.ui.penaDayYmd = ymd;
  const pena = state.customers.penas[Math.floor(Math.random() * state.customers.penas.length)];
  const client = { ...pena, intent: 'pena_day', prefersPayment: 'transfer' };
  const prefs = pena.preferredProducts?.length ? pena.preferredProducts : ['lae-euromillones'];
  client.wishlist = prefs.map((productId) => {
    const p = getProduct(productId);
    return {
      productId,
      productName: p?.name || productId,
      qty: 4 + Math.floor(Math.random() * 6),
      preferDictate: Math.random() < 0.3,
    };
  });
  client.wishlist.push({
    productId: 'lae-nacional',
    productName: getProduct('lae-nacional')?.name || 'Nacional',
    qty: 2,
    preferDictate: false,
  });
  client.note = `Turno de peña: ${pena.subscription || 'pedido semanal'}. Pagan por transferencia.`;
  client.line = 'Venimos a por lo de la peña.';
  state.ui.penaDayNotice = {
    title: `Hoy: turno ${pena.name}`,
    body: 'Pedido grande · preferencia transferencia. Confirma en TPV.',
  };
  return client;
}

function rngGate(p) {
  return Math.random() < p;
}

function pickArrivingClient(state) {
  const penaDay = maybeSpawnPenaDay(state);
  if (penaDay && !state.customers.current && !(state.customers.queue || []).some((c) => c.intent === 'pena_day')) {
    return penaDay;
  }

  const rng = Math.random;
  const ymd = gameYmd(state);

  // Clientes con encargo llegado: vienen a recoger
  if (rng() < 0.22) {
    const waitingIds = [
      ...new Set(
        (state.orders || [])
          .filter((o) => o.reserved && o.status === 'arrived' && o.clientId)
          .map((o) => o.clientId),
      ),
    ];
    if (waitingIds.length) {
      const id = waitingIds[Math.floor(rng() * waitingIds.length)];
      const src =
        state.customers.regulars.find((c) => c.id === id) ||
        state.customers.abonados?.find((c) => c.id === id) ||
        state.customers.penas?.find((c) => c.id === id);
      if (src) return { ...src, _forcePickup: true };
      const ord = (state.orders || []).find((o) => o.clientId === id);
      return {
        id,
        name: ord?.clientName || 'Cliente',
        kind: 'visitante',
        street: 'Álora',
        visitChance: 1,
        preferredProducts: [ord?.productId].filter(Boolean),
        prefersPayment: 'cash',
        _forcePickup: true,
      };
    }
  }
  // Cumpleaños / santoral: prioridad suave
  if (rng() < 0.12) {
    const specials = (state.customers.regulars || []).filter(
      (c) => isBirthdayToday(c, ymd) || matchesSanto(c, ymd),
    );
    if (specials.length) {
      const c = { ...specials[Math.floor(rng() * specials.length)] };
      c.specialDay = isBirthdayToday(c, ymd) ? 'birthday' : 'santo';
      return c;
    }
  }
  // Peñas / abonados con menos frecuencia pero relevantes
  if (rng() < 0.1 && state.customers.abonados?.length) {
    const a = state.customers.abonados[Math.floor(rng() * state.customers.abonados.length)];
    return { ...a };
  }
  if (rng() < 0.06 && state.customers.penas?.length) {
    const a = state.customers.penas[Math.floor(rng() * state.customers.penas.length)];
    return { ...a };
  }
  const touristBoost = isTouristSeason(state) ? 0.15 : 0;
  if (rng() < 0.28 + (crowdFactor(state) - 1) * 0.08 + touristBoost) {
    const v = makeVisitor();
    if (isTouristSeason(state) && rng() < 0.55) {
      v.street = 'Turista (Caminito / El Chorro)';
      v.line = 'De pasada por el Caminito, me llevo algo.';
      v.preferredProducts = ['rasca-jackpot', 'lae-nacional', 'alo-chorro', 'rasca-once-verano'];
    }
    return v;
  }

  const dow = gameDate(state).getUTCDay();
  const candidates = state.customers.regulars.filter((c) => {
    let chance = c.visitChance * crowdFactor(state);
    if (c.preferredDays?.includes(dow)) chance *= 2.2;
    if (isBirthdayToday(c, ymd) || matchesSanto(c, ymd)) chance *= 3;
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
  const pickups = arrivedReservedForClient(state, client.id);
  const liveDraws = drawsHappeningNow(state);
  const checkBoost = liveDraws.length ? 0.35 : 0;

  // Recogida de encargo (prioridad alta)
  if (client._forcePickup || (pickups.length && rng() < 0.85)) {
    client.intent = 'pickup';
    client.pickupOrders = pickups;
    client.wishlist = pickups.map((o) => ({
      productId: o.productId,
      productName: o.productName,
      qty: o.qty,
      preferDictate: false,
      fromPickup: true,
      orderId: o.id,
    }));
    client.note = `Viene a recoger su encargo: ${pickups.map((o) => `${o.productName} ×${o.qty}`).join(', ')}.`;
    client.line = '¿Ha llegado lo mío?';
    return client;
  }

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
  if (checkable.length && roll < 0.4 + checkBoost) {
    // En hora de sorteo, priorizar tickets de esos juegos
    let pool = checkable;
    if (liveDraws.length) {
      const liveIds = new Set(liveDraws.map((d) => d.id));
      const hot = checkable.filter((t) => liveIds.has(t.productId));
      if (hot.length) pool = hot;
    }
    const ordered = [...pool].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const chain = ordered.slice(0, Math.min(ordered.length, 1 + Math.floor(rng() * 3)));
    client.intent = 'check';
    client.checkQueue = chain.map((t) => t.id);
    client.ticketFocus = chain[0];
    client.checkIndex = 0;
    client.wishlist = [];
    const liveNote = liveDraws.length ? ' · ¡Está saliendo el sorteo!' : '';
    client.note =
      chain.length > 1
        ? `Quiere comprobar ${chain.length} tickets (${chain.map((t) => t.productName).join(', ')}).${liveNote}`
        : `Quiere comprobar ${chain[0].productName}.${liveNote}`;
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

  if (client.intent === 'pena_day') {
    client.note = client.note || 'Turno de peña.';
    return client;
  }

  // Abonado / peña: viene a por su abono (Miriam confirma en TPV)
  if ((client.kind === 'abonado' || client.kind === 'pena') && rng() < 0.55) {
    const p = getProduct(client.favoriteProduct || client.preferredProducts?.[0]);
    const qty = client.kind === 'pena' ? 5 : client.abonoQty || 2;
    client.intent = 'abono';
    client.wishlist = p
      ? [{ productId: p.id, productName: p.name, qty, preferDictate: false }]
      : [];
    client.note =
      client.kind === 'pena'
        ? `Peña: confirmar abono «${client.subscription || p?.name || ''}» ×${qty}`
        : `Abono: confirmar «${client.subscription || p?.name || ''}» ×${qty}`;
    if (client.specialDay === 'birthday') client.note += ' · ¡Cumpleaños!';
    return client;
  }

  // Pedir número del escaparate
  if ((state.showcase || []).length && rng() < 0.16) {
    const sc = state.showcase[Math.floor(rng() * state.showcase.length)];
    client.intent = 'showcase_ask';
    client.wishlist = [
      {
        productId: sc.productId,
        productName: sc.productName,
        qty: Math.min(sc.qty, 1 + Math.floor(rng() * 2)),
        preferDictate: true,
        showcaseId: sc.id,
        showcaseNumber: sc.number,
        note: `nº ${sc.number} del escaparate`,
      },
    ];
    client.note = `Quiere el nº ${sc.number} de ${sc.productName} (escaparate).`;
    client.line = `¿Me dejas el ${sc.number} de la vitrina?`;
    return client;
  }

  client.intent = 'buy';
  client.wishlist = buildRichWishlist(state, client);
  client.note = client.line || 'Quiere varias cosas.';
  if (client.specialDay === 'birthday') client.note = `¡Hoy es su cumpleaños! ${client.note}`;
  else if (client.specialDay === 'santo') client.note = `Santoral · ${client.note}`;
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
    const forceDictate = !!slot.dictate || (client.trait === 'práctica' && rng() < 0.35);
    lines.push(decorateWishLine(p, Math.max(1, qty), rng, client, forceDictate));
  }

  // Botes altos: más gente pide ese juego
  const hot = hotJackpots(state);
  if (hot.length && rng() < 0.42) {
    const pick = hot[Math.floor(rng() * hot.length)];
    const p = getProduct(pick.id);
    if (p) {
      const qty = pick.veryHot ? 2 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 2);
      const line = decorateWishLine(p, qty, rng, client, rng() < 0.45);
      line.note = `Bote ${pick.label}`;
      lines.unshift(line);
    }
  }

  // Extraordinarios ONCE del día
  const extras = onceExtraToday(state);
  if (extras.length && rng() < 0.55) {
    const ex = extras[Math.floor(rng() * extras.length)];
    const p = getProduct(ex.id);
    if (p) {
      const line = decorateWishLine(p, 1 + Math.floor(rng() * 2), rng, client, rng() < 0.4);
      line.note = 'Extraordinario hoy';
      lines.unshift(line);
    }
  }

  if (!lines.length) {
    const p = getProduct(client.preferredProducts?.[0] || 'lae-bonoloto');
    lines.push(decorateWishLine(p, 1, rng, client, false));
  }
  return lines;
}

function decorateWishLine(p, qty, rng, client, forceDictate) {
  const ask = makeNumberAsk(p, rng, client);
  if (forceDictate && ask.kind === 'random') {
    // Forzar alguna variante de dictado
    const again = makeNumberAsk(p, () => 0.5 + rng() * 0.49, client);
    return {
      productId: p.id,
      productName: p.name,
      qty,
      preferDictate: true,
      numberAsk: again,
      askLabel: numberAskLabel(again),
    };
  }
  return {
    productId: p.id,
    productName: p.name,
    qty,
    preferDictate: !!ask.preferDictate,
    numberAsk: ask,
    askLabel: numberAskLabel(ask),
  };
}

const REGIONAL_AUTO = (REGIONAL_IDS || []).filter((id) => id.startsWith('and-'));
const REGIONAL_PROV = (REGIONAL_IDS || []).filter((id) => id.startsWith('mal-'));
const REGIONAL_LOCAL = (REGIONAL_IDS || []).filter((id) => id.startsWith('alo-') || id.startsWith('pue-'));

const POOLS = {
  lae: [
    'lae-primitiva',
    'lae-bonoloto',
    'lae-euromillones',
    'lae-nacional',
    'lae-gordo-primitiva',
    'lae-quiniela',
    'lae-lototurf',
    'lae-quintuple',
  ],
  once: ['once-cupon', 'once-cuponazo', 'once-eurojackpot', 'once-super-once', 'once-triplex'],
  rasca: ['rasca-7-vidas', 'rasca-multiplica', 'rasca-diamante', 'rasca-oro', 'rasca-jackpot', 'rasca-once-clasico'],
  auto: REGIONAL_AUTO.length ? REGIONAL_AUTO : ['and-fortuna', 'and-olivo', 'and-costa'],
  prov: REGIONAL_PROV.length ? REGIONAL_PROV : ['mal-premio', 'mal-axarquia'],
  local: REGIONAL_LOCAL.length ? REGIONAL_LOCAL : ['alo-local', 'alo-hoya', 'alo-chorro'],
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
  [{ id: 'lae-quintuple', qty: 1, dictate: true }, { id: 'lae-lototurf', qty: 1, p: 0.6 }, { pool: POOLS.rasca, qty: 2, p: 0.5 }],
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
    if (result.large || result.huge) {
      state.ui.highPrizeAlert = {
        ticketId: result.ticket?.id || client.ticketFocus?.id,
        clientName: client.name,
        productName: client.ticketFocus?.productName,
        amountCents: result.prizeCents,
        at: state.clock.gameTimeMs,
      };
      state.stats.highPrizesAlerted = (state.stats.highPrizesAlerted || 0) + 1;
    }
  } else {
    state.ui.toast = 'No ha tocado.';
  }
  client.ticketFocus = result.ticket || client.ticketFocus;
  return state;
}

/** Pasa al siguiente ticket de la cadena de comprobación (si hay). */
export function advanceCheckQueue(state) {
  const client = state.customers.current;
  if (!client?.checkQueue?.length) return { advanced: false, done: true };
  const idx = (client.checkIndex || 0) + 1;
  if (idx >= client.checkQueue.length) {
    return { advanced: false, done: true, remaining: 0 };
  }
  const nextId = client.checkQueue[idx];
  const ticket = (state.tickets || []).find((t) => t.id === nextId);
  if (!ticket) return { advanced: false, done: true };
  client.checkIndex = idx;
  client.ticketFocus = ticket;
  client.checkResult = null;
  client.note = `Siguiente ticket (${idx + 1}/${client.checkQueue.length}): ${ticket.productName}`;
  state.ui.toast = client.note;
  return {
    advanced: true,
    done: false,
    remaining: client.checkQueue.length - idx - 1,
    index: idx,
    total: client.checkQueue.length,
  };
}

export function checkQueueProgress(client) {
  if (!client?.checkQueue?.length) return null;
  return {
    index: client.checkIndex || 0,
    total: client.checkQueue.length,
    remaining: Math.max(0, client.checkQueue.length - (client.checkIndex || 0) - 1),
  };
}

export { formatEuro };
