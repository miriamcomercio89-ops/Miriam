import { ORDER_COUNTRIES } from "../data/countries.js";
import { FEATURED_BY_ID, ORDER_POOL } from "../data/highlights.js";
import { getItem } from "../data/catalog.js";
import { isResearched } from "../data/research.js";
import { addInventory, pushMessage } from "./state.js";
import { sfx } from "../audio/sound.js";

let seq = 1;

export function availableOrderItems(state) {
  return ORDER_POOL.filter((p) => isResearched(state, p.research) && getItem(p.id));
}

export function spawnOrder(state) {
  const pool = availableOrderItems(state);
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const used = new Set(state.orders.filter((o) => o.status === "open").map((o) => o.country));
  const countries = ORDER_COUNTRIES.filter((c) => !used.has(c.code));
  const list = countries.length ? countries : ORDER_COUNTRIES;
  const country = list[Math.floor(Math.random() * list.length)];
  const amount = pick.min + Math.floor(Math.random() * (pick.max - pick.min + 1));
  const item = getItem(pick.id);
  const feat = FEATURED_BY_ID[pick.id];
  const order = {
    id: `ord-${seq++}`,
    country: country.code,
    itemId: pick.id,
    amount,
    rewardSci: pick.research === "start" ? "sci-mining" : sciFor(pick.research),
    rewardN: Math.max(1, Math.round(amount / 8)),
    rep: pick.research === "start" ? 3 : 5,
    deadline: state.tick + 1800 + Math.floor(Math.random() * 900),
    status: "open",
    note: feat?.why || item?.name || pick.id,
  };
  state.orders.push(order);
  pushMessage(state, `${country.flag} ${country.name} pide ${amount}× ${item.name}.`);
  return order;
}

function sciFor(research) {
  if (["chemistry", "electrolysis", "advanced-chemistry", "organics"].includes(research)) return "sci-chem";
  if (["electronics", "solar", "batteries"].includes(research)) return "sci-elec";
  if (["rare-earths", "nuclear", "catalysis", "superconductors"].includes(research)) return "sci-atom";
  if (["steel", "metallurgy", "advanced-metals"].includes(research)) return "sci-metal";
  return "sci-mining";
}

export function ensureOrders(state) {
  if (!state.orders) state.orders = [];
  state.orders = state.orders.filter((o) => o.status === "open" || state.tick - (o.closedAt || 0) < 400);
  const open = state.orders.filter((o) => o.status === "open").length;
  for (let i = open; i < 4; i++) spawnOrder(state);
}

export function tickOrders(state) {
  ensureOrders(state);
  for (const o of state.orders) {
    if (o.status !== "open") continue;
    if (state.tick >= o.deadline) {
      o.status = "failed";
      o.closedAt = state.tick;
      state.reputation = Math.max(0, (state.reputation ?? 50) - 3);
      const item = getItem(o.itemId);
      pushMessage(state, `Pedido fallido: ${o.country} no recibió ${item?.name}.`);
      sfx("fail");
    }
  }
}

export function fulfillOrder(state, orderId) {
  const o = state.orders.find((x) => x.id === orderId && x.status === "open");
  if (!o) return false;
  if ((state.inventory[o.itemId] ?? 0) < o.amount) return false;
  addInventory(state, o.itemId, -o.amount);
  addInventory(state, o.rewardSci, o.rewardN);
  state.reputation = (state.reputation ?? 50) + o.rep;
  state.ordersCompleted = (state.ordersCompleted ?? 0) + 1;
  o.status = "done";
  o.closedAt = state.tick;
  const item = getItem(o.itemId);
  pushMessage(state, `Enviado a ${o.country}: ${o.amount}× ${item?.name}. +${o.rep} reputación.`);
  sfx("order");
  ensureOrders(state);
  return true;
}
