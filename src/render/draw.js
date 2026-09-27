import { BUILDINGS, DIRS } from "../data/buildings.js";
import { ELEMENT_BY_SYMBOL, CATEGORIES } from "../data/elements.js";
import { ITEM_BY_ID } from "../data/catalog.js";
import { MAP_SIZE } from "../game/worldgen.js";
import { buildingAt } from "../game/state.js";

export const TILE = 48;

const TERRAIN = {
  dirt: "#4a3426",
  grass: "#1b4a2c",
  rock: "#3d4450",
  sand: "#9a7a3c",
  water: "#0284c7",
  brine: "#0e7490",
  oil: "#171717",
};

const SHAPE = {
  alkali: "square",
  alkaline: "diamond",
  transition: "hex",
  postTransition: "round",
  metalloid: "tri",
  nonmetal: "circle",
  halogen: "triDown",
  noble: "ring",
  lanthanide: "star",
  actinide: "cross",
  unknown: "circle",
};

export function worldToScreen(camera, x, y, canvas) {
  const z = camera.zoom;
  return {
    x: canvas.width / 2 + (x - camera.x) * TILE * z,
    y: canvas.height / 2 + (y - camera.y) * TILE * z,
  };
}

export function screenToWorld(camera, sx, sy, canvas) {
  const z = camera.zoom;
  return {
    x: Math.floor((sx - canvas.width / 2) / (TILE * z) + camera.x),
    y: Math.floor((sy - canvas.height / 2) / (TILE * z) + camera.y),
  };
}

export function drawWorld(ctx, state, canvas, hover, ghost, extras = {}) {
  const { camera } = state;
  const z = camera.zoom;
  const size = TILE * z;
  ctx.fillStyle = "#07090d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const topLeft = screenToWorld(camera, 0, 0, canvas);
  const botRight = screenToWorld(camera, canvas.width, canvas.height, canvas);
  const x0 = Math.max(0, topLeft.x - 1);
  const y0 = Math.max(0, topLeft.y - 1);
  const x1 = Math.min(MAP_SIZE - 1, botRight.x + 1);
  const y1 = Math.min(MAP_SIZE - 1, botRight.y + 1);
  const cb = state.colorblind;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const tile = state.world.tiles[y][x];
      const p = worldToScreen(camera, x, y, canvas);
      ctx.fillStyle = TERRAIN[tile.terrain] ?? "#222";
      ctx.fillRect(p.x, p.y, size + 0.5, size + 0.5);
      if (tile.deposit && tile.terrain !== "water" && tile.terrain !== "brine" && tile.terrain !== "oil") {
        drawElementLogo(ctx, p.x + size * 0.12, p.y + size * 0.1, size * 0.76, tile.deposit, cb);
      } else if (tile.terrain === "water") {
        ctx.fillStyle = "rgba(125, 211, 252, 0.25)";
        ctx.fillRect(p.x + size * 0.2, p.y + size * 0.35, size * 0.6, size * 0.18);
      }
    }
  }

  const selected = new Set((state.selection || []).map((s) => `${s.x},${s.y}`));

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const b = buildingAt(state, x, y);
      if (!b) continue;
      const p = worldToScreen(camera, x, y, canvas);
      drawBuilding(ctx, b, p.x, p.y, size, state);
      if (selected.has(`${x},${y}`)) {
        ctx.strokeStyle = "#5eead4";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 2, p.y + 2, size - 4, size - 4);
      }
    }
  }

  for (const it of state.beltItems) {
    if (it.x < x0 - 1 || it.y < y0 - 1 || it.x > x1 + 1 || it.y > y1 + 1) continue;
    const belt = buildingAt(state, it.x, it.y);
    const d = DIRS[belt?.dir ?? 0];
    const p = worldToScreen(camera, it.x + d.dx * it.t * 0.85, it.y + d.dy * it.t * 0.85, canvas);
    drawItem(ctx, it.itemId, p.x + size * 0.28, p.y + size * 0.28, size * 0.44);
  }

  if (extras.line) {
    for (const c of extras.line) {
      const p = worldToScreen(camera, c.x, c.y, canvas);
      ctx.globalAlpha = 0.4;
      drawBuilding(ctx, { type: "belt", dir: extras.lineDir ?? 0, progress: 0, input: {}, output: {} }, p.x, p.y, size, state);
      ctx.globalAlpha = 1;
    }
  }

  if (extras.paste) {
    for (const g of extras.paste) {
      const p = worldToScreen(camera, g.x, g.y, canvas);
      ctx.globalAlpha = 0.4;
      drawBuilding(ctx, { type: g.type, dir: g.dir, progress: 0, input: {}, output: {} }, p.x, p.y, size, state);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g.valid ? "#34d399" : "#fb7185";
      ctx.strokeRect(p.x + 1, p.y + 1, size - 2, size - 2);
    }
  }

  if (extras.selRect) {
    const a = worldToScreen(camera, extras.selRect.x0, extras.selRect.y0, canvas);
    const b = worldToScreen(camera, extras.selRect.x1 + 1, extras.selRect.y1 + 1, canvas);
    ctx.fillStyle = "rgba(94, 234, 212, 0.12)";
    ctx.strokeStyle = "#5eead4";
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  if (hover && hover.x >= 0) {
    const p = worldToScreen(camera, hover.x, hover.y, canvas);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 2, p.y + 2, size - 4, size - 4);
  }

  if (ghost && ghost.x >= 0 && !extras.line && !state.pasteMode) {
    const p = worldToScreen(camera, ghost.x, ghost.y, canvas);
    ctx.globalAlpha = 0.45;
    drawBuilding(ctx, { type: ghost.type, dir: ghost.dir, progress: 0, input: {}, output: {} }, p.x, p.y, size, state);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ghost.valid ? "#34d399" : "#fb7185";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 1, p.y + 1, size - 2, size - 2);
  }

  const origin = worldToScreen(camera, 0, 0, canvas);
  ctx.strokeStyle = "rgba(94, 234, 212, 0.25)";
  ctx.strokeRect(origin.x, origin.y, MAP_SIZE * size, MAP_SIZE * size);
}

export function drawElementLogo(ctx, x, y, s, symbol, colorblind = false) {
  const el = ELEMENT_BY_SYMBOL[symbol];
  const color = el?.color ?? "#94a3b8";
  const shape = SHAPE[el?.category] || "circle";
  ctx.fillStyle = "#0b1220";
  roundRect(ctx, x, y, s, s, s * 0.12);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.stroke();
  if (colorblind) {
    ctx.fillStyle = color;
    drawShape(ctx, x + s * 0.72, y + s * 0.22, s * 0.16, shape);
  }
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `600 ${Math.max(7, s * 0.2)}px "IBM Plex Sans", sans-serif`;
  ctx.fillText(el?.z ?? "", x + s * 0.1, y + s * 0.08);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.max(11, s * 0.38)}px "IBM Plex Sans", sans-serif`;
  ctx.fillText(symbol, x + s * 0.5, y + s * 0.58);
}

function drawShape(ctx, cx, cy, r, shape) {
  ctx.beginPath();
  if (shape === "square") ctx.rect(cx - r, cy - r, r * 2, r * 2);
  else if (shape === "diamond") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
  } else if (shape === "tri") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.closePath();
  } else if (shape === "triDown") {
    ctx.moveTo(cx - r, cy - r);
    ctx.lineTo(cx + r, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.closePath();
  } else if (shape === "cross") {
    ctx.rect(cx - r * 0.35, cy - r, r * 0.7, r * 2);
    ctx.rect(cx - r, cy - r * 0.35, r * 2, r * 0.7);
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawBuilding(ctx, b, x, y, size, state) {
  const def = BUILDINGS[b.type];
  if (!def) return;
  const pad = size * 0.08;
  const tick = state.tick || 0;
  roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.1);
  ctx.fillStyle = "#101826";
  ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  const cx = x + size / 2;
  const cy = y + size / 2;

  if (b.type === "belt") {
    const d = DIRS[b.dir ?? 0];
    ctx.fillStyle = "#fbbf24";
    const shift = ((tick * 0.15) % 1) * size * 0.15;
    for (let i = -1; i < 2; i++) {
      const ox = d.dx * (i * size * 0.18 + shift);
      const oy = d.dy * (i * size * 0.18 + shift);
      ctx.beginPath();
      ctx.moveTo(cx + ox - d.dy * size * 0.12, cy + oy - d.dx * size * 0.12);
      ctx.lineTo(cx + ox + d.dx * size * 0.14, cy + oy + d.dy * size * 0.14);
      ctx.lineTo(cx + ox + d.dy * size * 0.12, cy + oy + d.dx * size * 0.12);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = def.color;
  if (b.type === "extractor") {
    ctx.strokeStyle = def.color;
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, size * 0.16);
    ctx.lineTo(0, -size * 0.2);
    ctx.lineTo(size * 0.18, size * 0.16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, size * 0.08, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.type === "furnace" || b.type === "blast") {
    ctx.fillRect(-size * 0.16, -size * 0.1, size * 0.32, size * 0.22);
    ctx.fillStyle = `rgba(251, 146, 60, ${0.4 + 0.4 * Math.sin(tick / 6)})`;
    ctx.fillRect(-size * 0.1, -size * 0.02, size * 0.2, size * 0.1);
  } else if (b.type === "coalGen") {
    ctx.fillRect(-size * 0.14, -size * 0.06, size * 0.28, size * 0.18);
    ctx.fillRect(size * 0.06, -size * 0.2, size * 0.08, size * 0.16);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(size * 0.1, -size * 0.24, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (b.type === "lab") {
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.16);
    ctx.lineTo(size * 0.1, -size * 0.16);
    ctx.lineTo(size * 0.14, size * 0.16);
    ctx.lineTo(-size * 0.14, size * 0.16);
    ctx.closePath();
    ctx.fill();
  } else if (b.type === "chest") {
    ctx.fillRect(-size * 0.16, -size * 0.12, size * 0.32, size * 0.24);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-size * 0.12, -size * 0.02, size * 0.24, size * 0.04);
  } else if (b.type === "solar") {
    ctx.fillRect(-size * 0.18, -size * 0.14, size * 0.36, size * 0.28);
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, 0);
    ctx.lineTo(size * 0.18, 0);
    ctx.moveTo(0, -size * 0.14);
    ctx.lineTo(0, size * 0.14);
    ctx.stroke();
  } else if (b.type === "nuclear") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.font = `700 ${size * 0.16}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☢", 0, 1);
  } else if (b.type === "pump") {
    ctx.fillRect(-size * 0.04, -size * 0.18, size * 0.08, size * 0.3);
    ctx.beginPath();
    ctx.arc(0, size * 0.12, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.font = `${Math.max(14, size * 0.28)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.icon, 0, 0);
  }
  ctx.restore();

  if (b.progress > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + pad, y + size - pad * 2.2, (size - pad * 2) * Math.min(1, b.progress), pad * 0.9);
  }
  const outId = Object.keys(b.output ?? {})[0];
  if (outId) drawItem(ctx, outId, x + size * 0.62, y + size * 0.62, size * 0.26);
}

function drawItem(ctx, id, x, y, s) {
  const item = ITEM_BY_ID.get(id);
  if (item?.symbol && ELEMENT_BY_SYMBOL[item.symbol]) {
    drawElementLogo(ctx, x, y, s, item.symbol, false);
    return;
  }
  ctx.fillStyle = item?.color ?? "#e2e8f0";
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b0f14";
  ctx.font = `700 ${Math.max(8, s * 0.36)}px "IBM Plex Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item?.name?.slice(0, 2) ?? "?", x + s / 2, y + s / 2);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawMinimap(ctx, state, w, h) {
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);
  const tw = w / MAP_SIZE;
  const th = h / MAP_SIZE;
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const t = state.world.tiles[y][x];
      if (t.deposit && ELEMENT_BY_SYMBOL[t.deposit]) ctx.fillStyle = ELEMENT_BY_SYMBOL[t.deposit].color;
      else ctx.fillStyle = TERRAIN[t.terrain] || "#222";
      ctx.fillRect(x * tw, y * th, tw + 0.4, th + 0.4);
    }
  }
  ctx.fillStyle = "#fff";
  for (const b of Object.values(state.buildings)) {
    ctx.fillRect(b.x * tw, b.y * th, Math.max(1.5, tw), Math.max(1.5, th));
  }
  const vis = 14 / state.camera.zoom;
  ctx.strokeStyle = "#5eead4";
  ctx.strokeRect((state.camera.x - vis / 2) * tw, (state.camera.y - vis / 2) * th, vis * tw, vis * th);
}

export { CATEGORIES };
