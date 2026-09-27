import { ORDER_COUNTRIES, PLAYER, COUNTRY_BY_CODE } from "../data/countries.js";
import { FEATURED_BY_ID, ORDER_POOL } from "../data/highlights.js";
import { getItem } from "../data/catalog.js";
import { isResearched } from "../data/research.js";
import {
  CITY_ORDERS,
  CRISES,
  EU_CODES,
  RANK_RIVALS,
  wantsFor,
  countryName,
  countryFlag,
} from "../data/diplomacy.js";
import { addInventory, pushMessage } from "./state.js";
import { sfx } from "../audio/sound.js";

let seq = 1;

export function availableOrderItems(state) {
  return ORDER_POOL.filter((p) => isResearched(state, p.research) && getItem(p.id));
}

function researchedItem(state, id) {
  const item = getItem(id);
  if (!item) return false;
  return !item.research || isResearched(state, item.research);
}

function pickFromPool(state, ids) {
  const ok = (ids || []).filter((id) => researchedItem(state, id));
  if (ok.length) return ok[Math.floor(Math.random() * ok.length)];
  const pool = availableOrderItems(state);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function sciFor(research) {
  if (["chemistry", "electrolysis", "advanced-chemistry", "organics", "agri", "pharma"].includes(research)) return "sci-chem";
  if (["electronics", "solar", "batteries", "telecom", "semicon", "robotics"].includes(research)) return "sci-elec";
  if (["rare-earths", "nuclear", "catalysis", "superconductors", "aviation"].includes(research)) return "sci-atom";
  if (["steel", "metallurgy", "advanced-metals", "construction"].includes(research)) return "sci-metal";
  if (["commerce", "eu-green", "forestry", "urban", "ceramics"].includes(research)) return "sci-civic";
  if (["medical", "pharma"].includes(research)) return "sci-health";
  return "sci-mining";
}

function poolMeta(itemId) {
  return ORDER_POOL.find((p) => p.id === itemId) || { min: 6, max: 16, research: getItem(itemId)?.research || "start" };
}

function usedKeys(state) {
  return new Set(
    state.orders
      .filter((o) => o.status === "open" || o.status === "offer")
      .map((o) => o.cityId || o.country)
  );
}

function nextId() {
  return `ord-${seq++}`;
}

function pushHeadline(state, text) {
  state.headline = text;
  state.headlines = [{ t: state.tick, text }, ...(state.headlines || [])].slice(0, 12);
}

export function spawnOrder(state, kind = "country") {
  if (kind === "city") return spawnCityOrder(state);
  if (kind === "crisis") return spawnCrisis(state);
  if (kind === "eu") return spawnEuOrder(state);
  return spawnCountryOrder(state);
}

function spawnCountryOrder(state) {
  const used = usedKeys(state);
  const countries = ORDER_COUNTRIES.filter((c) => !used.has(c.code));
  const list = countries.length ? countries : ORDER_COUNTRIES;
  const country = list[Math.floor(Math.random() * list.length)];
  const itemId = pickFromPool(state, wantsFor(country.code));
  if (!itemId) return null;
  return pushOffer(state, {
    kind: "country",
    country: country.code,
    itemId,
    eu: EU_CODES.includes(country.code),
  });
}

function spawnCityOrder(state) {
  const used = usedKeys(state);
  const cities = CITY_ORDERS.filter((c) => !used.has(c.id));
  const city = (cities.length ? cities : CITY_ORDERS)[Math.floor(Math.random() * (cities.length ? cities : CITY_ORDERS).length)];
  const itemId = pickFromPool(state, city.items);
  if (!itemId) return null;
  return pushOffer(state, {
    kind: "city",
    country: PLAYER.code,
    cityId: city.id,
    cityName: city.name,
    cityFlag: city.flag,
    itemId,
  });
}

function spawnEuOrder(state) {
  if (!isResearched(state, "commerce")) return spawnCountryOrder(state);
  const eu = ORDER_COUNTRIES.filter((c) => EU_CODES.includes(c.code));
  const country = eu[Math.floor(Math.random() * eu.length)];
  const itemId = pickFromPool(state, wantsFor(country.code));
  if (!itemId) return null;
  return pushOffer(state, {
    kind: "eu",
    country: country.code,
    itemId,
    eu: true,
    noteExtra: "Contrato UE.",
  });
}

export function spawnCrisis(state) {
  const c = CRISES[Math.floor(Math.random() * CRISES.length)];
  let itemId = researchedItem(state, c.item) ? c.item : pickFromPool(state, [c.item]);
  if (!itemId) itemId = pickFromPool(state, null);
  if (!itemId) return null;
  const city = c.city ? CITY_ORDERS.find((x) => x.id === c.where) : null;
  const order = pushOffer(state, {
    kind: "crisis",
    country: city ? PLAYER.code : c.where,
    cityId: city?.id,
    cityName: city?.name,
    cityFlag: city?.flag,
    itemId,
    amount: c.n,
    crisis: true,
    headline: c.headline,
    noteExtra: c.headline,
    deadlineTicks: 5000 + Math.floor(Math.random() * 2000),
    rep: 10,
    rewardN: Math.max(2, Math.round(c.n / 5)),
  });
  if (order) pushHeadline(state, c.headline);
  return order;
}

function pushOffer(state, spec) {
  const item = getItem(spec.itemId);
  if (!item) return null;
  const meta = poolMeta(spec.itemId);
  const feat = FEATURED_BY_ID[spec.itemId];
  const amount = spec.amount ?? meta.min + Math.floor(Math.random() * (meta.max - meta.min + 1));
  const deadlineTicks = spec.deadlineTicks ?? 9000 + Math.floor(Math.random() * 4000);
  const order = {
    id: nextId(),
    kind: spec.kind || "country",
    country: spec.country,
    cityId: spec.cityId || null,
    cityName: spec.cityName || null,
    cityFlag: spec.cityFlag || null,
    itemId: spec.itemId,
    amount,
    rewardSci: sciFor(item.research || meta.research),
    rewardN: spec.rewardN ?? Math.max(1, Math.round(amount / 8)),
    rep: spec.rep ?? (spec.kind === "eu" ? 7 : spec.kind === "city" ? 4 : 5),
    deadline: state.tick + deadlineTicks,
    status: "offer",
    note: spec.noteExtra || feat?.why || item.name,
    eu: Boolean(spec.eu),
    crisis: Boolean(spec.crisis),
    negotiated: false,
    headline: spec.headline || null,
  };
  state.orders.push(order);
  const who = labelOf(order);
  pushMessage(state, `${who} ofrece comprar ${amount}× ${item.name}.`);
  return order;
}

export function labelOf(order) {
  if (order.cityName) return `${order.cityFlag || "🏙️"} ${order.cityName}`;
  return `${countryFlag(order.country)} ${countryName(order.country)}`;
}

export function ensureOrders(state) {
  if (!state.orders) state.orders = [];
  state.orders = state.orders.filter((o) => {
    if (o.status === "open" || o.status === "offer") return true;
    return state.tick - (o.closedAt || 0) < 400;
  });
  const live = state.orders.filter((o) => o.status === "open" || o.status === "offer");
  while (live.length < 5) {
    const nCity = live.filter((o) => o.kind === "city").length;
    const nEu = live.filter((o) => o.kind === "eu").length;
    let kind = "country";
    if (nCity < 2) kind = "city";
    else if (isResearched(state, "commerce") && nEu < 1) kind = "eu";
    else if (Math.random() < 0.34) kind = "city";
    else if (isResearched(state, "commerce") && Math.random() < 0.28) kind = "eu";
    const made = spawnOrder(state, kind);
    if (!made) break;
    live.push(made);
  }
  const crises = live.filter((o) => o.kind === "crisis").length;
  if (crises < 1 && state.tick > 400 && state.tick % 700 === 40) {
    spawnCrisis(state);
  }
}

export function tickOrders(state) {
  ensureOrders(state);
  for (const o of state.orders) {
    if (o.status !== "open" && o.status !== "offer") continue;
    if (state.tick >= o.deadline) {
      const wasOffer = o.status === "offer";
      o.status = "failed";
      o.closedAt = state.tick;
      const hit = o.crisis ? 6 : wasOffer ? 1 : 3;
      state.reputation = Math.max(0, (state.reputation ?? 50) - hit);
      if (o.eu) state.repEU = Math.max(0, (state.repEU ?? 50) - 4);
      const item = getItem(o.itemId);
      pushMessage(state, `Pedido fallido: ${labelOf(o)} no recibió ${item?.name}.`);
      sfx("fail");
    }
  }
}

export function acceptOrder(state, orderId) {
  const o = state.orders.find((x) => x.id === orderId && x.status === "offer");
  if (!o) return false;
  o.status = "open";
  pushMessage(state, `Aceptado: ${labelOf(o)} espera ${o.amount}× ${getItem(o.itemId)?.name}.`);
  sfx("click");
  return true;
}

export function rejectOrder(state, orderId) {
  const o = state.orders.find((x) => x.id === orderId && x.status === "offer");
  if (!o) return false;
  o.status = "rejected";
  o.closedAt = state.tick;
  const hit = o.crisis ? 4 : 1;
  state.reputation = Math.max(0, (state.reputation ?? 50) - hit);
  if (o.eu) state.repEU = Math.max(0, (state.repEU ?? 50) - 2);
  pushMessage(state, `Rechazado el pedido de ${labelOf(o)}.`);
  sfx("fail");
  ensureOrders(state);
  return true;
}

export function negotiateOrder(state, orderId) {
  const o = state.orders.find((x) => x.id === orderId && (x.status === "offer" || x.status === "open"));
  if (!o || o.negotiated || o.crisis) return false;
  o.negotiated = true;
  o.amount = Math.max(1, Math.round(o.amount * 0.7));
  o.rewardN = Math.max(1, o.rewardN - 1);
  o.rep = Math.max(1, o.rep - 2);
  o.deadline += 4000;
  if (o.status === "offer") o.status = "open";
  pushMessage(state, `Negociado con ${labelOf(o)}: ahora ${o.amount}× y más plazo.`);
  sfx("click");
  return true;
}

function takeFromBuffers(state, itemId, amount) {
  let need = amount;
  const haveInv = state.inventory[itemId] ?? 0;
  const fromInv = Math.min(haveInv, need);
  if (fromInv) {
    addInventory(state, itemId, -fromInv);
    need -= fromInv;
  }
  if (need <= 0) return true;
  for (const b of Object.values(state.buildings)) {
    if (b.type !== "port" && b.type !== "chest") continue;
    const have = b.input[itemId] ?? 0;
    if (have <= 0) continue;
    const take = Math.min(have, need);
    b.input[itemId] -= take;
    if (b.input[itemId] <= 0) delete b.input[itemId];
    need -= take;
    if (need <= 0) return true;
  }
  if (need < amount) {
    if (fromInv) addInventory(state, itemId, fromInv);
    return false;
  }
  return false;
}

export function availableCount(state, itemId) {
  let n = state.inventory[itemId] ?? 0;
  for (const b of Object.values(state.buildings)) {
    if (b.type === "port" || b.type === "chest") n += b.input[itemId] ?? 0;
  }
  return n;
}

export function fulfillOrder(state, orderId) {
  const o = state.orders.find((x) => x.id === orderId && x.status === "open");
  if (!o) return false;
  if (availableCount(state, o.itemId) < o.amount) return false;
  if (!takeFromBuffers(state, o.itemId, o.amount)) return false;
  applyRewards(state, o);
  o.status = "done";
  o.closedAt = state.tick;
  const item = getItem(o.itemId);
  pushMessage(state, `Enviado a ${labelOf(o)}: ${o.amount}× ${item?.name}. +${o.rep} reputación.`);
  sfx("order");
  ensureOrders(state);
  return true;
}

function applyRewards(state, o) {
  let rep = o.rep;
  let sciN = o.rewardN;
  if (o.eu && isResearched(state, "eu-green")) {
    const dirty = (state.pollution ?? 0) > 16;
    if (dirty) {
      rep = Math.max(1, Math.ceil(rep / 2));
      state.repEU = Math.max(0, (state.repEU ?? 50) - 2);
      pushMessage(state, "Bruselas recorta el pago: demasiada contaminación.");
    } else {
      rep += 2;
      state.repEU = (state.repEU ?? 50) + 4;
    }
  } else if (o.eu) {
    state.repEU = (state.repEU ?? 50) + 2;
  }
  addInventory(state, o.rewardSci, sciN);
  state.reputation = (state.reputation ?? 50) + rep;
  state.ordersCompleted = (state.ordersCompleted ?? 0) + 1;
  if (o.crisis) state.crisesSolved = (state.crisesSolved ?? 0) + 1;
}

export function tryAutofillPorts(state) {
  const open = (state.orders || []).filter((o) => o.status === "open");
  for (const o of open) {
    if (availableCount(state, o.itemId) >= o.amount) fulfillOrder(state, o.id);
  }
}

export function worldRanking(state) {
  const spain =
    (state.reputation ?? 50) * 8 +
    (state.ordersCompleted ?? 0) * 22 +
    (state.repEU ?? 50) * 3 +
    (state.crisesSolved ?? 0) * 12 +
    Math.floor((state.tick || 0) / 180);
  const rows = [
    { code: PLAYER.code, name: PLAYER.name, flag: PLAYER.flag, score: spain, player: true },
    ...RANK_RIVALS.map((r, i) => ({
      code: r.code,
      name: countryName(r.code),
      flag: countryFlag(r.code),
      score: r.base + Math.floor((state.tick || 0) / 90) + ((i * 17 + (state.tick || 0)) % 37),
      player: false,
    })),
  ];
  rows.sort((a, b) => b.score - a.score);
  const rank = rows.findIndex((r) => r.player) + 1;
  return { rank, total: rows.length, rows };
}

export { COUNTRY_BY_CODE };
