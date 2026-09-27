import { createWorld, tileKey } from "./worldgen.js";
import { BUILDINGS } from "../data/buildings.js";
import { unlockAllResearch } from "../data/research.js";

export function createGame(seed = 118, opts = {}) {
  const mode = opts.mode === "sandbox" ? "sandbox" : "normal";
  const world = createWorld(seed);
  const state = {
    version: 5,
    mode,
    seed,
    tick: 0,
    speed: 1,
    paused: false,
    menu: false,
    world,
    buildings: {},
    beltItems: [],
    inventory: {
      "plate-fe": 80,
      "plate-cu": 40,
      "wire-cu": 40,
      "el-c": 50,
      "gear-basic": 24,
      "glass-silica": 20,
      "ore-fe": 16,
      "ore-cu": 12,
      water: 10,
    },
    researched: { start: true },
    researching: null,
    scienceBuffer: {},
    produced: {},
    consumed: {},
    messages: [{ t: 0, text: "Ministerio de Industria · España. Extrae hierro o carbón y atiende los pedidos del mundo." }],
    camera: { x: world.spawn.x, y: world.spawn.y, zoom: 1 },
    selected: null,
    hover: null,
    build: { type: "extractor", dir: 0 },
    tutorialStep: 0,
    won: false,
    player: "ES",
    reputation: 50,
    orders: [],
    ordersCompleted: 0,
    undo: [],
    selection: [],
    clipboard: null,
    pasteMode: false,
    colorblind: false,
    muted: false,
    alerts: [],
    rates: {},
    prodSnap: {},
    rateHistory: [],
    groupBonus: {},
    pinned: null,
    pollution: 0,
    repEU: 50,
    headline: null,
    headlines: [],
    crisesSolved: 0,
  };
  if (mode === "sandbox") applySandbox(state);
  return state;
}

export function applySandbox(state) {
  state.mode = "sandbox";
  unlockAllResearch(state);
  const stock = sandboxStock();
  for (const [id, n] of Object.entries(stock)) {
    state.inventory[id] = Math.max(state.inventory[id] ?? 0, n);
  }
  state.messages = [
    { t: state.tick ?? 0, text: "Sandbox · todo desbloqueado. Miles de productos y todas las fábricas listos." },
  ];
}

export function sandboxStock() {
  const stock = {
    "plate-fe": 400,
    "plate-cu": 200,
    "plate-al": 120,
    "wire-cu": 200,
    "el-c": 200,
    "gear-basic": 120,
    "glass-silica": 120,
    "brick-fire": 80,
    brick: 40,
    steel: 200,
    stainless: 80,
    concrete: 80,
    "pipe-basic": 80,
    "motor-basic": 40,
    "circuit-basic": 40,
    "circuit-advanced": 20,
    "silicon-wafer": 20,
    nylon: 20,
    "can-al": 20,
    paper: 20,
    "magnet-nd": 12,
    "wind-blade": 8,
    beam: 20,
    duralumin: 20,
    "ore-fe": 80,
    "ore-cu": 80,
    "ore-si": 80,
    water: 80,
  };
  for (const def of Object.values(BUILDINGS)) {
    for (const [id, n] of Object.entries(def.cost || {})) {
      stock[id] = Math.max(stock[id] ?? 0, n * 40);
    }
  }
  return stock;
}

export function adoptGame(target, next) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, next);
}

export function addInventory(state, id, n) {
  if (!id || !n) return;
  state.inventory[id] = (state.inventory[id] ?? 0) + n;
  if (state.inventory[id] <= 0) delete state.inventory[id];
}

export function hasInventory(state, costs) {
  return Object.entries(costs).every(([id, n]) => (state.inventory[id] ?? 0) >= n);
}

export function payInventory(state, costs) {
  if (!hasInventory(state, costs)) return false;
  for (const [id, n] of Object.entries(costs)) addInventory(state, id, -n);
  return true;
}

export function pushMessage(state, text) {
  state.messages.unshift({ t: state.tick, text });
  state.messages = state.messages.slice(0, 8);
}

export function countBuilding(state, type) {
  return Object.values(state.buildings).filter((b) => b.type === type).length;
}

export function serialize(state) {
  return JSON.stringify({
    version: state.version,
    mode: state.mode || "normal",
    seed: state.seed,
    tick: state.tick,
    speed: state.speed,
    world: state.world,
    buildings: state.buildings,
    beltItems: state.beltItems,
    inventory: state.inventory,
    researched: state.researched,
    researching: state.researching,
    scienceBuffer: state.scienceBuffer,
    produced: state.produced,
    consumed: state.consumed,
    tutorialStep: state.tutorialStep,
    won: state.won,
    camera: state.camera,
    reputation: state.reputation,
    orders: state.orders,
    ordersCompleted: state.ordersCompleted,
    colorblind: state.colorblind,
    muted: state.muted,
    groupBonus: state.groupBonus,
    rates: state.rates,
    pinned: state.pinned,
    pollution: state.pollution,
    repEU: state.repEU,
    headline: state.headline,
    headlines: state.headlines,
    crisesSolved: state.crisesSolved,
  });
}

export function deserialize(json) {
  const data = JSON.parse(json);
  const fresh = createGame(data.seed);
  return {
    ...fresh,
    ...data,
    mode: data.mode === "sandbox" ? "sandbox" : "normal",
    menu: false,
    messages: [{ t: data.tick ?? 0, text: "Partida cargada." }],
    selected: null,
    hover: null,
    build: { type: "extractor", dir: 0 },
    paused: false,
    undo: [],
    selection: [],
    clipboard: null,
    pasteMode: false,
    alerts: [],
    rateHistory: data.rateHistory || [],
    orders: (data.orders || []).map((o) => {
      if ((o.status === "open" || o.status === "offer") && (data.tick ?? 0) >= (o.deadline ?? Infinity)) {
        return { ...o, status: "failed", closedAt: data.tick };
      }
      return o;
    }),
    pinned: data.pinned ?? null,
    pollution: data.pollution ?? 0,
    repEU: data.repEU ?? 50,
    headline: data.headline ?? null,
    headlines: data.headlines || [],
    crisesSolved: data.crisesSolved ?? 0,
  };
}

export function buildingAt(state, x, y) {
  return state.buildings[tileKey(x, y)] ?? null;
}

export function canAffordBuilding(state, type) {
  const def = BUILDINGS[type];
  return def && hasInventory(state, def.cost);
}
