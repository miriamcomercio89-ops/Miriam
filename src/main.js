import { BUILDINGS } from "./data/buildings.js";
import { ELEMENT_BY_SYMBOL, researchForElement } from "./data/elements.js";
import { isResearched } from "./data/research.js";
import { createGame, deserialize, serialize, buildingAt, canAffordBuilding } from "./game/state.js";
import { inMap } from "./game/worldgen.js";
import { TICK_MS, tick } from "./game/sim.js";
import { placeTracked, removeTracked, undoLast, bresenham, dirFromDelta, pushUndo } from "./game/history.js";
import { drawWorld, screenToWorld, drawMinimap } from "./render/draw.js";
import { bindUI, renderUI, closeModals, isModalOpen, openModal } from "./ui/ui.js";
import { sfx, setMuted, pulseAmbient } from "./audio/sound.js";
import { placeBuilding } from "./game/sim.js";
import { resolveSaveKey, writeSave } from "./game/saves.js";

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const mini = document.getElementById("minimap");
const miniCtx = mini.getContext("2d");

export const SAVE_KEY = resolveSaveKey();
const saved = localStorage.getItem(SAVE_KEY);
const game = saved ? safeLoad(saved) : createGame(118);

function safeLoad(json) {
  try {
    return deserialize(json);
  } catch {
    return createGame(118);
  }
}

const keys = new Set();
const mouse = {
  x: 0,
  y: 0,
  down: false,
  pan: false,
  lastX: 0,
  lastY: 0,
  belt: null,
  sel: null,
};
let hover = { x: 0, y: 0 };

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resize();
addEventListener("resize", resize);

bindUI(game, { saveKey: SAVE_KEY });

addEventListener("keydown", (e) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  keys.add(e.key.toLowerCase());
  if (e.key === "Escape") {
    game.pasteMode = false;
    game.selection = [];
    closeModals();
  }
  if (e.key === " ") {
    e.preventDefault();
    game.paused = !game.paused;
  }
  if (e.key === "r" || e.key === "R") {
    if (game.clipboard && game.pasteMode) rotateClipboard(game);
    else game.build.dir = (game.build.dir + 1) & 3;
  }
  if (e.key === "+" || e.key === "=") game.speed = Math.min(3, game.speed + 1);
  if (e.key === "-") game.speed = Math.max(1, game.speed - 1);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (undoLast(game)) sfx("remove");
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
    e.preventDefault();
    copySelection(game);
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    e.preventDefault();
    if (game.clipboard?.length) {
      game.pasteMode = true;
      sfx("copy");
    }
    return;
  }
  if (e.key === "p" || e.key === "P") openModal(game, "periodic");
  if (e.key === "t" || e.key === "T") openModal(game, "research");
  if (e.key === "e" || e.key === "E") openModal(game, "pedia");
  if (e.key === "h" || e.key === "H") openModal(game, "help");
  if (e.key === "o" || e.key === "O") openModal(game, "orders");
  if (e.key === "k" || e.key === "K") openModal(game, "rank");
  if (e.key === "l" || e.key === "L") openModal(game, "saves");
  if (e.key === "g" || e.key === "G") openModal(game, "stats");
  const nums = "1234567890";
  const idx = nums.indexOf(e.key);
  if (idx >= 0) {
    const list = Object.keys(BUILDINGS);
    if (list[idx]) game.build.type = list[idx];
  }
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  if (mouse.pan) {
    const z = game.camera.zoom * 48;
    game.camera.x -= (mouse.x - mouse.lastX) / z;
    game.camera.y -= (mouse.y - mouse.lastY) / z;
  }
  mouse.lastX = mouse.x;
  mouse.lastY = mouse.y;
  hover = screenToWorld(game.camera, mouse.x, mouse.y, logicalCanvas());
});

canvas.addEventListener("pointerdown", (e) => {
  mouse.lastX = mouse.x;
  mouse.lastY = mouse.y;
  if (e.button === 1) {
    mouse.pan = true;
    canvas.setPointerCapture(e.pointerId);
    return;
  }
  const pos = screenToWorld(game.camera, mouse.x, mouse.y, logicalCanvas());
  if (!inMap(pos.x, pos.y)) return;

  if (e.shiftKey && e.button === 0) {
    mouse.sel = { x0: pos.x, y0: pos.y };
    return;
  }

  if (e.button === 0 && game.pasteMode && game.clipboard) {
    pasteAt(game, pos.x, pos.y);
    return;
  }

  if (e.button === 0 && game.build.type === "belt" && !buildingAt(game, pos.x, pos.y)) {
    mouse.belt = { x0: pos.x, y0: pos.y };
    return;
  }

  if (e.button === 0) {
    const existing = buildingAt(game, pos.x, pos.y);
    if (existing) {
      game.selected = { kind: "building", building: existing, x: pos.x, y: pos.y };
      return;
    }
    const def = BUILDINGS[game.build.type];
    if (def.research && !isResearched(game, def.research)) return;
    const ok = placeTracked(game, game.build.type, pos.x, pos.y, game.build.dir);
    if (ok) {
      sfx("place");
      pulseAmbient(Object.keys(game.researched).length);
    } else {
      game.selected = { kind: "tile", x: pos.x, y: pos.y };
      if (!canAffordBuilding(game, game.build.type)) sfx("error");
    }
  }
  if (e.button === 2) {
    e.preventDefault();
    if (game.pasteMode) {
      game.pasteMode = false;
      return;
    }
    if (removeTracked(game, pos.x, pos.y)) sfx("remove");
  }
});

canvas.addEventListener("pointerup", (e) => {
  mouse.pan = false;
  const pos = hover;
  if (mouse.belt && e.button === 0) {
    const line = bresenham(mouse.belt.x0, mouse.belt.y0, pos.x, pos.y);
    const dir = dirFromDelta(pos.x - mouse.belt.x0, pos.y - mouse.belt.y0);
    const cells = [];
    for (const c of line) {
      if (placeTracked(game, "belt", c.x, c.y, dir)) cells.push(c);
    }
    if (cells.length) {
      game.undo = (game.undo || []).filter((a) => !(a.kind === "place" && cells.some((c) => c.x === a.x && c.y === a.y)));
      pushUndo(game, { kind: "line", cells });
      sfx("place");
    }
    mouse.belt = null;
  }
  if (mouse.sel && e.button === 0) {
    const x0 = Math.min(mouse.sel.x0, pos.x);
    const x1 = Math.max(mouse.sel.x0, pos.x);
    const y0 = Math.min(mouse.sel.y0, pos.y);
    const y1 = Math.max(mouse.sel.y0, pos.y);
    game.selection = Object.values(game.buildings).filter((b) => b.x >= x0 && b.x <= x1 && b.y >= y0 && b.y <= y1);
    mouse.sel = null;
  }
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    game.camera.zoom = Math.min(2.2, Math.max(0.45, game.camera.zoom * (e.deltaY > 0 ? 0.9 : 1.1)));
    hover = screenToWorld(game.camera, mouse.x, mouse.y, logicalCanvas());
  },
  { passive: false }
);

mini.addEventListener("pointerdown", (e) => {
  const r = mini.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 80;
  const y = ((e.clientY - r.top) / r.height) * 80;
  game.camera.x = x;
  game.camera.y = y;
});

function logicalCanvas() {
  return { width: innerWidth, height: innerHeight };
}

function ghost() {
  if (isModalOpen() || game.pasteMode || !inMap(hover.x, hover.y)) return null;
  const def = BUILDINGS[game.build.type];
  const tile = game.world.tiles[hover.y]?.[hover.x];
  let valid = !buildingAt(game, hover.x, hover.y) && canAffordBuilding(game, game.build.type);
  if (def.research && !isResearched(game, def.research)) valid = false;
  if (game.build.type === "extractor") {
    const el = tile?.deposit ? ELEMENT_BY_SYMBOL[tile.deposit] : null;
    valid = valid && Boolean(el) && tile.terrain !== "water" && isResearched(game, researchForElement(el));
  }
  if (game.build.type === "pump") valid = valid && (tile?.terrain === "water" || tile?.terrain === "brine" || tile?.terrain === "oil");
  return { type: game.build.type, dir: game.build.dir, x: hover.x, y: hover.y, valid };
}

function copySelection(state) {
  if (!state.selection?.length) return;
  const minx = Math.min(...state.selection.map((b) => b.x));
  const miny = Math.min(...state.selection.map((b) => b.y));
  state.clipboard = state.selection.map((b) => ({ type: b.type, dir: b.dir, dx: b.x - minx, dy: b.y - miny }));
  sfx("copy");
  state.messages.unshift({ t: state.tick, text: `Copiados ${state.clipboard.length} edificios. Ctrl+V para pegar.` });
}

function rotateClipboard(state) {
  state.clipboard = state.clipboard.map((c) => ({
    type: c.type,
    dir: (c.dir + 1) & 3,
    dx: -c.dy,
    dy: c.dx,
  }));
}

function pasteAt(state, x, y) {
  const cells = [];
  for (const c of state.clipboard) {
    const px = x + c.dx;
    const py = y + c.dy;
    if (placeBuilding(state, c.type, px, py, c.dir)) cells.push({ x: px, y: py });
  }
  if (cells.length) {
    pushUndo(state, { kind: "paste", cells });
    sfx("place");
  } else sfx("error");
}

function extras() {
  const out = {};
  if (mouse.belt) {
    out.line = bresenham(mouse.belt.x0, mouse.belt.y0, hover.x, hover.y);
    out.lineDir = dirFromDelta(hover.x - mouse.belt.x0, hover.y - mouse.belt.y0);
  }
  if (mouse.sel) {
    out.selRect = {
      x0: Math.min(mouse.sel.x0, hover.x),
      y0: Math.min(mouse.sel.y0, hover.y),
      x1: Math.max(mouse.sel.x0, hover.x),
      y1: Math.max(mouse.sel.y0, hover.y),
    };
  }
  if (game.pasteMode && game.clipboard) {
    out.paste = game.clipboard.map((c) => ({
      ...c,
      x: hover.x + c.dx,
      y: hover.y + c.dy,
      valid: inMap(hover.x + c.dx, hover.y + c.dy) && !buildingAt(game, hover.x + c.dx, hover.y + c.dy),
    }));
  }
  return out;
}

let acc = 0;
let last = performance.now();
let uiAcc = 0;

function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  const pan = 8 / (game.camera.zoom * 48);
  if (keys.has("w") || keys.has("arrowup")) game.camera.y -= pan * dt;
  if (keys.has("s") || keys.has("arrowdown")) game.camera.y += pan * dt;
  if (keys.has("a") || keys.has("arrowleft")) game.camera.x -= pan * dt;
  if (keys.has("d") || keys.has("arrowright")) game.camera.x += pan * dt;

  acc += dt;
  while (acc >= TICK_MS) {
    tick(game);
    if (game.tick > 0 && game.tick % 600 === 0) {
      writeSave(SAVE_KEY, serialize(game));
    }
    acc -= TICK_MS;
  }

  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  drawWorld(ctx, game, logicalCanvas(), hover, ghost(), extras());
  if (mini.width !== 168) {
    mini.width = 168;
    mini.height = 168;
  }
  drawMinimap(miniCtx, game, mini.width, mini.height);

  uiAcc += dt;
  if (uiAcc > 200) {
    renderUI(game);
    uiAcc = 0;
  }
  requestAnimationFrame(frame);
}

setMuted(Boolean(game.muted));
renderUI(game);
requestAnimationFrame(frame);
