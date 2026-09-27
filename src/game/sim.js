import { BUILDINGS, DIRS } from "../data/buildings.js";
import { ITEM_BY_ID, RECIPES } from "../data/catalog.js";
import { RESEARCH_BY_ID, isResearched } from "../data/research.js";
import { ELEMENT_BY_SYMBOL, researchForElement } from "../data/elements.js";
import { inMap, tileKey } from "./worldgen.js";
import { addInventory, buildingAt, pushMessage } from "./state.js";
import { ensureOrders, tickOrders } from "./orders.js";
import { collectGroupBonuses } from "./focus.js";
import { getItem } from "../data/catalog.js";

const TPS = 20;
export const TICK_MS = 1000 / TPS;

export function tick(state) {
  if (state.paused) return;
  const steps = Math.max(1, state.speed);
  for (let i = 0; i < steps; i++) stepOnce(state);
}

function stepOnce(state) {
  state.tick += 1;
  const power = computePower(state);
  state.power = power;
  const sat =
    power.demand <= 0 ? 1 : Math.min(1, Math.max(0.28, power.produced / power.demand));
  state.power.satisfaction = sat;

  for (const b of Object.values(state.buildings)) {
    if (b.type === "belt" || b.type === "chest") continue;
    stepMachine(state, b, sat);
  }
  stepBelts(state);
  deliverOutputs(state);
  pullInputs(state);
  if (state.researching) stepResearch(state);
  if (state.tick % 20 === 0) sampleRates(state);
  if (state.tick % 15 === 0) state.alerts = collectAlerts(state);
  if (state.tick === 1 || state.tick % 80 === 0) {
    tickOrders(state);
    const gained = collectGroupBonuses(state, getItem);
    for (const cat of gained) pushMessage(state, `Grupo completo en la Tierra: ${cat}. +8 reputación.`);
  }
  if (state.tick === 2) ensureOrders(state);
  if (!state.won && (state.produced["periodica-core"] ?? 0) > 0) {
    state.won = true;
    pushMessage(state, "Has ensamblado el Núcleo de Periodica. La tabla es tuya.");
  }
}

function sampleRates(state) {
  const now = state.produced || {};
  const prev = state.prodSnap || {};
  const rates = {};
  for (const [id, n] of Object.entries(now)) {
    const d = n - (prev[id] || 0);
    if (d > 0) rates[id] = d * 60;
  }
  state.rates = rates;
  state.prodSnap = { ...now };
  state.rateHistory = [{ t: state.tick, rates }, ...(state.rateHistory || [])].slice(0, 24);
}

export function collectAlerts(state) {
  const alerts = [];
  for (const b of Object.values(state.buildings)) {
    const def = BUILDINGS[b.type];
    if (!def) continue;
    if (def.generator && def.fuel && !b.powered) {
      alerts.push({ level: "warn", text: `${def.name} sin combustible (${b.x},${b.y})` });
    }
    if (["furnace", "blast", "reactor", "electrolyzer", "assembler"].includes(b.type)) {
      if (!b.recipe) alerts.push({ level: "info", text: `${def.name} sin receta (${b.x},${b.y})` });
      const full = Object.values(b.output || {}).some((n) => n >= 28);
      if (full) alerts.push({ level: "warn", text: `${def.name} con la salida llena (${b.x},${b.y})` });
    }
  }
  for (const o of state.orders || []) {
    if (o.status === "open" && o.deadline - state.tick < 1200) {
      const item = getItem(o.itemId);
      alerts.push({ level: "urgent", text: `Pedido urgente de ${o.country}: ${item?.name}` });
    }
  }
  return alerts.slice(0, 8);
}

function computePower(state) {
  let produced = 0;
  let demand = 0;
  for (const b of Object.values(state.buildings)) {
    const def = BUILDINGS[b.type];
    if (!def) continue;
    if (def.generator) {
      if (b.type === "solar") {
        produced += -def.power;
        b.powered = true;
      } else if (def.fuel) {
        if ((b.fuel ?? 0) > 0) {
          b.fuel -= 1 / (TPS * 8);
          produced += -def.power;
          b.powered = true;
        } else if ((b.input[def.fuel] ?? 0) > 0) {
          b.input[def.fuel] -= 1;
          b.fuel = 1;
          produced += -def.power;
          b.powered = true;
        } else {
          b.powered = false;
        }
      }
    } else if (def.power > 0) {
      demand += def.power;
    }
  }
  return { produced, demand };
}

function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}

function stepMachine(state, b, sat) {
  const def = BUILDINGS[b.type];
  if (!def || def.generator) {
    if (def?.generator && def.fuel) tryPullFuel(state, b, def.fuel);
    return;
  }
  if (b.type === "lab") {
    stepLab(state, b, sat);
    return;
  }

  let recipe = b.recipe ? recipeById(b.recipe) : null;
  if (!recipe) recipe = autoRecipe(state, b);
  if (!recipe) return;
  if (recipe.research && !isResearched(state, recipe.research)) return;

  if (recipe.deposit) {
    const tile = state.world.tiles[b.y][b.x];
    const ok =
      tile.deposit === recipe.deposit ||
      (recipe.deposit === "water" && tile.terrain === "water") ||
      (recipe.building === "extractor" && tile.deposit && tile.deposit === recipe.deposit);
    if (!ok) return;
    if (tile.reserve !== undefined && tile.reserve <= 0 && tile.reserve !== 9999) return;
  }

  if (!canStart(b, recipe) && (b.progress ?? 0) <= 0) return;
  if ((b.progress ?? 0) <= 0) {
    if (!consumeInputs(b, recipe)) return;
  }
  b.progress = (b.progress ?? 0) + (sat * 1) / (recipe.time * TPS);
  if (b.progress >= 1) {
    if (!canOutput(b, recipe)) {
      b.progress = 0.99;
      return;
    }
    giveOutput(state, b, recipe);
    if (recipe.deposit) {
      const tile = state.world.tiles[b.y][b.x];
      if (tile.reserve && tile.reserve < 9000) tile.reserve -= 1;
    }
    b.progress = 0;
  }
}

function autoRecipe(state, b) {
  if (b.type === "extractor" || b.type === "pump") {
    const tile = state.world.tiles[b.y][b.x];
    const dep = tile.deposit || (tile.terrain === "water" ? "water" : null);
    if (!dep) return null;
    const found = RECIPES.find((r) => r.building === b.type && r.deposit === dep);
    if (found) b.recipe = found.id;
    return found ?? null;
  }
  const options = RECIPES.filter((r) => r.building === b.type && !r.science && !r.deposit);
  const match = options.find((r) => r.inputs.every((i) => (b.input[i.id] ?? 0) >= i.n));
  if (match) b.recipe = match.id;
  return match ?? null;
}

function canStart(b, recipe) {
  return recipe.inputs.every((i) => (b.input[i.id] ?? 0) >= i.n);
}

function consumeInputs(b, recipe) {
  if (!canStart(b, recipe)) return false;
  for (const i of recipe.inputs) {
    b.input[i.id] -= i.n;
    if (b.input[i.id] <= 0) delete b.input[i.id];
  }
  return true;
}

function canOutput(b, recipe) {
  const outs = [recipe.output, recipe.output2].filter((o) => o && o.id && o.n);
  return outs.every((o) => (b.output[o.id] ?? 0) + o.n <= 30);
}

function giveOutput(state, b, recipe) {
  const outs = [recipe.output, recipe.output2].filter((o) => o && o.id && o.n);
  for (const o of outs) {
    b.output[o.id] = (b.output[o.id] ?? 0) + o.n;
    state.produced[o.id] = (state.produced[o.id] ?? 0) + o.n;
  }
}

function tryPullFuel(state, b, fuel) {
  if ((b.input[fuel] ?? 0) >= 8) return;
  pullFromNeighbors(state, b, fuel, 1);
}

function stepLab(state, b, sat) {
  if (!state.researching) return;
  const node = RESEARCH_BY_ID[state.researching.id];
  if (!node) return;
  const needed = Object.keys(node.cost);
  if (!needed.length) return;
  let took = false;
  for (const id of needed) {
    if ((b.input[id] ?? 0) > 0) {
      b.input[id] -= 1;
      state.scienceBuffer[id] = (state.scienceBuffer[id] ?? 0) + 1;
      took = true;
      break;
    }
  }
  if (took) b.progress = Math.min(1, (b.progress ?? 0) + sat * 0.15);
  else b.progress = Math.max(0, (b.progress ?? 0) - 0.02);
}

function stepResearch(state) {
  const node = RESEARCH_BY_ID[state.researching.id];
  if (!node) {
    state.researching = null;
    return;
  }
  const done = Object.entries(node.cost).every(([id, n]) => (state.scienceBuffer[id] ?? 0) >= n);
  if (!done) return;
  for (const [id, n] of Object.entries(node.cost)) {
    state.scienceBuffer[id] -= n;
  }
  state.researched[node.id] = true;
  pushMessage(state, `Investigación completada: ${node.name}.`);
  state.researching = null;
}

function neighbor(x, y, dir) {
  const d = DIRS[dir];
  return { x: x + d.dx, y: y + d.dy };
}

function stepBelts(state) {
  const occupancy = new Map();
  for (const it of state.beltItems) {
    const k = tileKey(it.x, it.y);
    occupancy.set(k, (occupancy.get(k) ?? 0) + 1);
  }

  for (const it of state.beltItems) {
    const belt = buildingAt(state, it.x, it.y);
    if (!belt || belt.type !== "belt") {
      it.dead = true;
      continue;
    }
    it.t += 0.14;
    if (it.t < 1) continue;
    const next = neighbor(it.x, it.y, belt.dir);
    if (!inMap(next.x, next.y)) {
      it.t = 0.99;
      continue;
    }
    const dest = buildingAt(state, next.x, next.y);
    if (dest?.type === "belt") {
      const nk = tileKey(next.x, next.y);
      if ((occupancy.get(nk) ?? 0) >= 2) {
        it.t = 0.99;
        continue;
      }
      occupancy.set(tileKey(it.x, it.y), (occupancy.get(tileKey(it.x, it.y)) ?? 1) - 1);
      occupancy.set(nk, (occupancy.get(nk) ?? 0) + 1);
      it.x = next.x;
      it.y = next.y;
      it.t = 0;
      continue;
    }
    if (dest && dest.type !== "belt") {
      if (acceptItem(dest, it.itemId)) {
        it.dead = true;
        continue;
      }
    }
    it.t = 0.99;
  }
  state.beltItems = state.beltItems.filter((it) => !it.dead);
}

function acceptItem(b, itemId) {
  const def = BUILDINGS[b.type];
  if (!def) return false;
  if (b.type === "chest") {
    const total = Object.values(b.input).reduce((a, n) => a + n, 0);
    if (total >= 200) return false;
    b.input[itemId] = (b.input[itemId] ?? 0) + 1;
    return true;
  }
  if (def.generator && def.fuel === itemId) {
    b.input[itemId] = (b.input[itemId] ?? 0) + 1;
    return true;
  }
  if (b.type === "lab") {
    if (!itemId.startsWith("sci-")) return false;
    b.input[itemId] = (b.input[itemId] ?? 0) + 1;
    return true;
  }
  const recipe = b.recipe ? recipeById(b.recipe) : null;
  const wanted = recipe ? recipe.inputs.some((i) => i.id === itemId) : true;
  if (!wanted) return false;
  if ((b.input[itemId] ?? 0) >= 20) return false;
  b.input[itemId] = (b.input[itemId] ?? 0) + 1;
  return true;
}

function deliverOutputs(state) {
  for (const b of Object.values(state.buildings)) {
    if (b.type === "belt" || b.type === "chest") continue;
    const keys = Object.keys(b.output);
    if (!keys.length) continue;
    const destPos = neighbor(b.x, b.y, b.dir ?? 0);
    const dest = buildingAt(state, destPos.x, destPos.y);
    for (const id of keys) {
      if (b.output[id] <= 0) continue;
      if (dest?.type === "belt") {
        const n = state.beltItems.filter((it) => it.x === destPos.x && it.y === destPos.y).length;
        if (n >= 2) continue;
        state.beltItems.push({ x: destPos.x, y: destPos.y, t: 0, itemId: id });
        b.output[id] -= 1;
        if (b.output[id] <= 0) delete b.output[id];
        break;
      }
      if (dest?.type === "chest" && acceptItem(dest, id)) {
        b.output[id] -= 1;
        if (b.output[id] <= 0) delete b.output[id];
        break;
      }
    }
  }
}

function pullInputs(state) {
  for (const b of Object.values(state.buildings)) {
    if (b.type === "belt" || b.type === "chest") continue;
    const recipe = b.recipe ? recipeById(b.recipe) : null;
    if (recipe) {
      for (const inp of recipe.inputs) {
        if ((b.input[inp.id] ?? 0) >= 8) continue;
        pullFromNeighbors(state, b, inp.id, 1);
      }
    } else if (b.type === "lab") {
      pullFromNeighbors(state, b, null, 1, (id) => id.startsWith("sci-"));
    }
  }
}

function pullFromNeighbors(state, b, itemId, count, pred) {
  for (const d of DIRS) {
    const x = b.x + d.dx;
    const y = b.y + d.dy;
    const other = buildingAt(state, x, y);
    if (!other) continue;
    if (other.type === "chest") {
      const keys = itemId ? [itemId] : Object.keys(other.input);
      for (const id of keys) {
        if (pred && !pred(id)) continue;
        if ((other.input[id] ?? 0) > 0) {
          other.input[id] -= 1;
          if (other.input[id] <= 0) delete other.input[id];
          b.input[id] = (b.input[id] ?? 0) + 1;
          return true;
        }
      }
    }
    if (other.type === "belt") {
      const idx = state.beltItems.findIndex((it) => it.x === x && it.y === y && (!itemId || it.itemId === itemId) && (!pred || pred(it.itemId)));
      if (idx >= 0) {
        const it = state.beltItems[idx];
        state.beltItems.splice(idx, 1);
        b.input[it.itemId] = (b.input[it.itemId] ?? 0) + 1;
        return true;
      }
    }
  }
  return false;
}

export function placeBuilding(state, type, x, y, dir) {
  if (!inMap(x, y)) return false;
  if (buildingAt(state, x, y)) return false;
  const def = BUILDINGS[type];
  if (!def) return false;
  if (def.research && !isResearched(state, def.research)) return false;
  const tile = state.world.tiles[y][x];
  if (type === "extractor") {
    if (!tile.deposit || tile.terrain === "water" || tile.terrain === "brine" || tile.terrain === "oil") return false;
    const el = ELEMENT_BY_SYMBOL[tile.deposit];
    if (el && !isResearched(state, researchForElement(el))) return false;
  }
  if (type === "pump" && tile.terrain !== "water" && tile.terrain !== "brine" && tile.terrain !== "oil" && tile.deposit !== "water") {
    return false;
  }
  if (["furnace", "blast", "reactor", "electrolyzer", "assembler", "lab", "chest", "coalGen", "solar", "nuclear"].includes(type)) {
    if (tile.terrain === "water" || tile.terrain === "brine" || tile.terrain === "oil") return false;
  }
  if (!payCost(state, def.cost)) return false;
  const b = {
    type,
    x,
    y,
    dir: def.rotatable ? dir : 0,
    recipe: null,
    progress: 0,
    input: {},
    output: {},
    fuel: 0,
    powered: false,
  };
  if (type === "extractor" || type === "pump") autoRecipe(state, b);
  if (type === "coalGen" && (state.inventory["el-c"] ?? 0) > 0) {
    const n = Math.min(10, state.inventory["el-c"]);
    addInventory(state, "el-c", -n);
    b.input["el-c"] = n;
  }
  state.buildings[tileKey(x, y)] = b;
  return true;
}

function payCost(state, cost) {
  for (const [id, n] of Object.entries(cost)) {
    if ((state.inventory[id] ?? 0) < n) return false;
  }
  for (const [id, n] of Object.entries(cost)) addInventory(state, id, -n);
  return true;
}

export function removeBuilding(state, x, y) {
  const b = buildingAt(state, x, y);
  if (!b) return false;
  const def = BUILDINGS[b.type];
  if (def) {
    for (const [id, n] of Object.entries(def.cost)) addInventory(state, id, Math.ceil(n * 0.6));
  }
  for (const [id, n] of Object.entries({ ...b.input, ...b.output })) addInventory(state, id, n);
  delete state.buildings[tileKey(x, y)];
  state.beltItems = state.beltItems.filter((it) => !(it.x === x && it.y === y));
  if (state.selected && state.selected.x === x && state.selected.y === y) state.selected = null;
  return true;
}

export function handCraft(state, recipe, times = 1) {
  if (recipe.deposit) return 0;
  if (recipe.research && !isResearched(state, recipe.research)) return 0;
  let made = 0;
  for (let i = 0; i < times; i++) {
    if (!recipe.inputs.every((inp) => (state.inventory[inp.id] ?? 0) >= inp.n)) break;
    for (const inp of recipe.inputs) addInventory(state, inp.id, -inp.n);
    if (recipe.output?.id && recipe.output.n) {
      addInventory(state, recipe.output.id, recipe.output.n);
      state.produced[recipe.output.id] = (state.produced[recipe.output.id] ?? 0) + recipe.output.n;
    }
    if (recipe.output2?.id && recipe.output2.n) addInventory(state, recipe.output2.id, recipe.output2.n);
    made += 1;
  }
  return made;
}

export function startResearch(state, id) {
  const node = RESEARCH_BY_ID[id];
  if (!node || state.researched[id] || state.researching) return false;
  if (!node.requires.every((r) => isResearched(state, r))) return false;
  if (!Object.keys(node.cost).length) {
    state.researched[id] = true;
    return true;
  }
  state.researching = { id, started: state.tick };
  pushMessage(state, `Investigando: ${node.name}. Lleva ciencia a un laboratorio.`);
  return true;
}

export { recipeById, acceptItem };
