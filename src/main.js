import { BUILDINGS } from "./data/buildings.js";
import { ELEMENT_BY_SYMBOL, researchForElement } from "./data/elements.js";
import { isResearched } from "./data/research.js";
import { createGame, deserialize, serialize, buildingAt, canAffordBuilding } from "./game/state.js";
import { inMap } from "./game/worldgen.js";
import { TICK_MS, tick, placeBuilding, removeBuilding } from "./game/sim.js";
import { drawWorld, screenToWorld } from "./render/draw.js";
import { bindUI, renderUI, closeModals, isModalOpen, openModal } from "./ui/ui.js";

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "periodica-save-v2";
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
const mouse = { x: 0, y: 0, down: false, pan: false, lastX: 0, lastY: 0 };
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

bindUI(game);

addEventListener("keydown", (e) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  keys.add(e.key.toLowerCase());
  if (e.key === "Escape") closeModals();
  if (e.key === " " ) {
    e.preventDefault();
    game.paused = !game.paused;
  }
  if (e.key === "r" || e.key === "R") game.build.dir = (game.build.dir + 1) & 3;
  if (e.key === "+" || e.key === "=") game.speed = Math.min(3, game.speed + 1);
  if (e.key === "-") game.speed = Math.max(1, game.speed - 1);
  if (e.key === "p" || e.key === "P") openModal(game, "periodic");
  if (e.key === "t" || e.key === "T") openModal(game, "research");
  if (e.key === "e" || e.key === "E") openModal(game, "pedia");
  if (e.key === "h" || e.key === "H") openModal(game, "help");
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
  if (e.button === 0) {
    const existing = buildingAt(game, pos.x, pos.y);
    if (existing) {
      game.selected = { kind: "building", building: existing, x: pos.x, y: pos.y };
      return;
    }
    const def = BUILDINGS[game.build.type];
    if (def.research && !isResearched(game, def.research)) return;
    const ok = placeBuilding(game, game.build.type, pos.x, pos.y, game.build.dir);
    if (!ok) {
      game.selected = { kind: "tile", x: pos.x, y: pos.y };
      if (!canAffordBuilding(game, game.build.type)) {
        game.messages.unshift({ t: game.tick, text: "No te llegan los materiales para ese edificio." });
      }
    }
  }
  if (e.button === 2) {
    e.preventDefault();
    removeBuilding(game, pos.x, pos.y);
  }
});

canvas.addEventListener("pointerup", () => {
  mouse.pan = false;
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const before = game.camera.zoom;
    game.camera.zoom = Math.min(2.2, Math.max(0.45, game.camera.zoom * (e.deltaY > 0 ? 0.9 : 1.1)));
    if (game.camera.zoom !== before) hover = screenToWorld(game.camera, mouse.x, mouse.y, logicalCanvas());
  },
  { passive: false }
);

function logicalCanvas() {
  return { width: innerWidth, height: innerHeight };
}

function ghost() {
  if (isModalOpen() || !inMap(hover.x, hover.y)) return null;
  const def = BUILDINGS[game.build.type];
  const tile = game.world.tiles[hover.y]?.[hover.x];
  let valid = !buildingAt(game, hover.x, hover.y) && canAffordBuilding(game, game.build.type);
  if (def.research && !isResearched(game, def.research)) valid = false;
  if (game.build.type === "extractor") {
    const el = tile?.deposit ? ELEMENT_BY_SYMBOL[tile.deposit] : null;
    valid =
      valid &&
      Boolean(el) &&
      tile.terrain !== "water" &&
      isResearched(game, researchForElement(el));
  }
  if (game.build.type === "pump") valid = valid && (tile?.terrain === "water" || tile?.terrain === "brine" || tile?.terrain === "oil");
  return { type: game.build.type, dir: game.build.dir, x: hover.x, y: hover.y, valid };
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
      localStorage.setItem(SAVE_KEY, serialize(game));
    }
    acc -= TICK_MS;
  }

  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  drawWorld(ctx, game, logicalCanvas(), hover, ghost());

  uiAcc += dt;
  if (uiAcc > 200) {
    renderUI(game);
    uiAcc = 0;
  }
  requestAnimationFrame(frame);
}

renderUI(game);
requestAnimationFrame(frame);
