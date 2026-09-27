import { getItem } from "../data/catalog.js";
import { BUILDINGS, buildingSpeed } from "../data/buildings.js";

const RAW = new Set(["element", "ore", "fluid"]);

export function recipeFor(itemId) {
  const item = getItem(itemId);
  if (!item) return null;
  return (item.recipes || []).find((r) => r.output?.id === itemId && !r.science) || item.recipes?.[0] || null;
}

/** Máquinas de velocidad 1 que hacen `perMin` ítems/minuto. */
export function machinesFor(recipe, perMin, speed = 1) {
  if (!recipe) return 0;
  const out = recipe.output?.n || 1;
  const perMachine = (60 / Math.max(0.2, recipe.time)) * out * speed;
  return Math.max(1, Math.ceil(perMin / perMachine - 1e-9));
}

export function planFactory(itemId, perMin, seen = new Set(), depth = 0) {
  const item = getItem(itemId);
  if (!item || !perMin || perMin <= 0) return null;
  const recipe = recipeFor(itemId);
  const raw = !recipe || recipe.deposit || RAW.has(item.kind) || depth > 8 || seen.has(itemId);
  if (raw) {
    return {
      itemId,
      name: item.name,
      perMin: roundRate(perMin),
      machines: recipe?.deposit ? machinesFor(recipe, perMin, 1) : 0,
      building: recipe?.building || null,
      raw: true,
      inputs: [],
    };
  }
  const next = new Set(seen);
  next.add(itemId);
  const out = recipe.output?.n || 1;
  const mk1 = machinesFor(recipe, perMin, 1);
  const mk2 = machinesFor(recipe, perMin, 1.8);
  const mk3 = machinesFor(recipe, perMin, 2.8);
  return {
    itemId,
    name: item.name,
    perMin: roundRate(perMin),
    machines: mk1,
    mk2,
    mk3,
    building: recipe.building,
    time: recipe.time,
    raw: false,
    inputs: recipe.inputs.map((inp) =>
      planFactory(inp.id, perMin * (inp.n / out), next, depth + 1)
    ).filter(Boolean),
  };
}

function roundRate(n) {
  return Math.round(n * 100) / 100;
}

export function flattenPlan(node, acc = new Map()) {
  if (!node) return acc;
  if (node.building && node.machines > 0 && !node.raw) {
    const prev = acc.get(node.itemId) || { ...node, machines: 0, mk2: 0, mk3: 0, perMin: 0 };
    prev.machines += node.machines;
    prev.mk2 += node.mk2 || 0;
    prev.mk3 += node.mk3 || 0;
    prev.perMin = roundRate(prev.perMin + node.perMin);
    acc.set(node.itemId, prev);
  } else if (node.raw && node.building === "extractor") {
    const prev = acc.get(node.itemId) || { ...node, machines: 0, perMin: 0 };
    prev.machines += node.machines;
    prev.perMin = roundRate(prev.perMin + node.perMin);
    acc.set(node.itemId, prev);
  }
  for (const child of node.inputs || []) flattenPlan(child, acc);
  return acc;
}

export function buildingName(id) {
  return BUILDINGS[id]?.name || id;
}

export function speedOf(type) {
  return buildingSpeed(type);
}
