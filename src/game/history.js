import { BUILDINGS } from "../data/buildings.js";
import { tileKey } from "./worldgen.js";
import { addInventory, buildingAt } from "./state.js";
import { placeBuilding, removeBuilding } from "./sim.js";

export function pushUndo(state, action) {
  if (!state.undo) state.undo = [];
  state.undo.push(action);
  if (state.undo.length > 80) state.undo.shift();
}

export function placeTracked(state, type, x, y, dir) {
  const ok = placeBuilding(state, type, x, y, dir);
  if (ok) pushUndo(state, { kind: "place", x, y });
  return ok;
}

export function removeTracked(state, x, y) {
  const b = buildingAt(state, x, y);
  if (!b) return false;
  const snap = {
    type: b.type,
    x: b.x,
    y: b.y,
    dir: b.dir,
    recipe: b.recipe,
    input: { ...b.input },
    output: { ...b.output },
    fuel: b.fuel,
  };
  const ok = removeBuilding(state, x, y);
  if (ok) pushUndo(state, { kind: "remove", snap });
  return ok;
}

export function undoLast(state) {
  const a = (state.undo || []).pop();
  if (!a) return false;
  if (a.kind === "place" || a.kind === "line" || a.kind === "paste") {
    const cells = a.cells || [{ x: a.x, y: a.y }];
    for (const c of cells) {
      const b = buildingAt(state, c.x, c.y);
      if (!b) continue;
      const def = BUILDINGS[b.type];
      if (def) {
        for (const [id, n] of Object.entries(def.cost)) addInventory(state, id, n);
      }
      for (const [id, n] of Object.entries({ ...b.input, ...b.output })) addInventory(state, id, n);
      delete state.buildings[tileKey(c.x, c.y)];
    }
    return true;
  }
  if (a.kind === "remove" && a.snap) {
    const s = a.snap;
    const def = BUILDINGS[s.type];
    if (def) {
      for (const [id, n] of Object.entries(def.cost)) addInventory(state, id, -Math.ceil(n * 0.6));
    }
    state.buildings[tileKey(s.x, s.y)] = {
      ...s,
      progress: 0,
      powered: false,
      input: { ...s.input },
      output: { ...s.output },
    };
    return true;
  }
  return false;
}

export function bresenham(x0, y0, x1, y1) {
  const pts = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    pts.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    if (pts.length > 80) break;
  }
  return pts;
}

export function dirFromDelta(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 0 : 2;
  return dy >= 0 ? 1 : 3;
}
