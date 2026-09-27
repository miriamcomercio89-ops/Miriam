import { ELEMENTS } from "../data/elements.js";
import { MAP_SIZE } from "./worldgen.js";

export function findDeposit(state, symbol) {
  const spawn = state.world.spawn;
  let best = null;
  let bestD = Infinity;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (state.world.tiles[y][x].deposit === symbol) {
        const d = (x - spawn.x) ** 2 + (y - spawn.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
  }
  return best;
}

export function focusDeposit(state, symbol) {
  const pos = findDeposit(state, symbol);
  if (!pos) return false;
  state.camera.x = pos.x + 0.5;
  state.camera.y = pos.y + 0.5;
  state.selected = { kind: "tile", x: pos.x, y: pos.y };
  return true;
}

export function isEarthNatural(el) {
  if (!el) return false;
  if (el.z === 43 || el.z === 61) return false;
  return el.z <= 92;
}

export function groupProgressOf(state, category, getItem) {
  const members = ELEMENTS.filter((e) => e.category === category && isEarthNatural(e));
  const owned = new Set();
  for (const [id, n] of Object.entries(state.inventory)) {
    if (n > 0) getItem(id)?.elements?.forEach((s) => owned.add(s));
  }
  for (const id of Object.keys(state.produced || {})) {
    getItem(id)?.elements?.forEach((s) => owned.add(s));
  }
  const have = members.filter((e) => owned.has(e.symbol)).length;
  return { have, total: members.length, done: members.length > 0 && have === members.length };
}

export function collectGroupBonuses(state, getItem) {
  if (!state.groupBonus) state.groupBonus = {};
  const cats = [...new Set(ELEMENTS.map((e) => e.category))];
  let gained = [];
  for (const cat of cats) {
    const p = groupProgressOf(state, cat, getItem);
    if (p.done && !state.groupBonus[cat]) {
      state.groupBonus[cat] = true;
      state.reputation = (state.reputation ?? 50) + 8;
      gained.push(cat);
    }
  }
  return gained;
}
