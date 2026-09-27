import { createWorld, tileKey } from "./worldgen.js";
import { BUILDINGS } from "../data/buildings.js";

export function createGame(seed = 118) {
  const world = createWorld(seed);
  return {
    version: 1,
    seed,
    tick: 0,
    speed: 1,
    paused: false,
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
    messages: [{ t: 0, text: "Bienvenida a Periodica. Coloca un extractor sobre el hierro o el carbón." }],
    camera: { x: world.spawn.x, y: world.spawn.y, zoom: 1 },
    selected: null,
    hover: null,
    build: { type: "extractor", dir: 0 },
    tutorialStep: 0,
    won: false,
  };
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
  });
}

export function deserialize(json) {
  const data = JSON.parse(json);
  const fresh = createGame(data.seed);
  return {
    ...fresh,
    ...data,
    messages: [{ t: data.tick ?? 0, text: "Partida cargada." }],
    selected: null,
    hover: null,
    build: { type: "extractor", dir: 0 },
    paused: false,
  };
}

export function buildingAt(state, x, y) {
  return state.buildings[tileKey(x, y)] ?? null;
}

export function canAffordBuilding(state, type) {
  const def = BUILDINGS[type];
  return def && hasInventory(state, def.cost);
}
