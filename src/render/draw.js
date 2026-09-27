import { BUILDINGS, DIRS } from "../data/buildings.js";
import { ELEMENT_BY_SYMBOL } from "../data/elements.js";
import { ITEM_BY_ID } from "../data/catalog.js";
import { MAP_SIZE } from "../game/worldgen.js";
import { buildingAt } from "../game/state.js";

export const TILE = 48;

const TERRAIN = {
  dirt: "#3f2f22",
  grass: "#1f3d2a",
  rock: "#3d4450",
  sand: "#8a7040",
  water: "#0c4a6e",
  brine: "#155e75",
  oil: "#1c1917",
};

export function worldToScreen(camera, x, y, canvas) {
  const z = camera.zoom;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return {
    x: cx + (x - camera.x) * TILE * z,
    y: cy + (y - camera.y) * TILE * z,
  };
}

export function screenToWorld(camera, sx, sy, canvas) {
  const z = camera.zoom;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return {
    x: Math.floor((sx - cx) / (TILE * z) + camera.x),
    y: Math.floor((sy - cy) / (TILE * z) + camera.y),
  };
}

export function drawWorld(ctx, state, canvas, hover, ghost) {
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

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const tile = state.world.tiles[y][x];
      const p = worldToScreen(camera, x, y, canvas);
      ctx.fillStyle = TERRAIN[tile.terrain] ?? "#222";
      ctx.fillRect(p.x, p.y, size + 0.5, size + 0.5);
      if (tile.deposit && tile.terrain !== "water" && tile.terrain !== "brine" && tile.terrain !== "oil") {
        drawDeposit(ctx, p.x, p.y, size, tile.deposit);
      }
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.015)";
        ctx.fillRect(p.x, p.y, size + 0.5, size + 0.5);
      }
    }
  }

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const b = buildingAt(state, x, y);
      if (!b) continue;
      const p = worldToScreen(camera, x, y, canvas);
      drawBuilding(ctx, b, p.x, p.y, size, state);
    }
  }

  for (const it of state.beltItems) {
    if (it.x < x0 - 1 || it.y < y0 - 1 || it.x > x1 + 1 || it.y > y1 + 1) continue;
    const belt = buildingAt(state, it.x, it.y);
    const dir = belt?.dir ?? 0;
    const d = DIRS[dir];
    const p = worldToScreen(camera, it.x + d.dx * it.t * 0.85, it.y + d.dy * it.t * 0.85, canvas);
    drawItem(ctx, it.itemId, p.x + size * 0.28, p.y + size * 0.28, size * 0.44);
  }

  if (hover && hover.x >= 0) {
    const p = worldToScreen(camera, hover.x, hover.y, canvas);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 2, p.y + 2, size - 4, size - 4);
  }

  if (ghost && ghost.x >= 0) {
    const p = worldToScreen(camera, ghost.x, ghost.y, canvas);
    ctx.globalAlpha = 0.45;
    drawBuilding(ctx, { type: ghost.type, dir: ghost.dir, x: ghost.x, y: ghost.y, progress: 0, input: {}, output: {} }, p.x, p.y, size, state);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ghost.valid ? "#34d399" : "#fb7185";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 1, p.y + 1, size - 2, size - 2);
  }

  drawGridEdge(ctx, camera, canvas, size);
}

function drawGridEdge(ctx, camera, canvas, size) {
  const origin = worldToScreen(camera, 0, 0, canvas);
  ctx.strokeStyle = "rgba(94, 234, 212, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(origin.x, origin.y, MAP_SIZE * size, MAP_SIZE * size);
}

function drawDeposit(ctx, x, y, size, symbol) {
  const el = ELEMENT_BY_SYMBOL[symbol];
  const color = el?.color ?? "#94a3b8";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.18);
  ctx.lineTo(x + size * 0.78, y + size * 0.7);
  ctx.lineTo(x + size * 0.22, y + size * 0.7);
  ctx.closePath();
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#0b0f14";
  ctx.font = `700 ${Math.max(9, size * 0.22)}px "IBM Plex Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(symbol, x + size * 0.5, y + size * 0.62);
}

function drawBuilding(ctx, b, x, y, size, state) {
  const def = BUILDINGS[b.type];
  if (!def) return;
  const pad = size * 0.08;
  roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.12);
  ctx.fillStyle = def.isBelt ? "#1e2937" : "#111827";
  ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (def.isBelt) {
    const d = DIRS[b.dir ?? 0];
    ctx.fillStyle = def.color;
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.beginPath();
    ctx.moveTo(cx - d.dy * size * 0.18, cy - d.dx * size * 0.18);
    ctx.lineTo(cx + d.dx * size * 0.22, cy + d.dy * size * 0.22);
    ctx.lineTo(cx + d.dy * size * 0.18, cy + d.dx * size * 0.18);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.fillStyle = def.color;
  ctx.font = `${Math.max(12, size * 0.32)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(def.icon, x + size / 2, y + size / 2 - size * 0.04);

  if (b.progress > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(x + pad, y + size - pad * 2.2, (size - pad * 2) * Math.min(1, b.progress), pad * 0.9);
  }

  const outId = Object.keys(b.output ?? {})[0];
  if (outId) drawItem(ctx, outId, x + size * 0.62, y + size * 0.62, size * 0.28);
}

function drawItem(ctx, id, x, y, s) {
  const item = ITEM_BY_ID.get(id);
  ctx.fillStyle = item?.color ?? "#e2e8f0";
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0b0f14";
  ctx.font = `700 ${Math.max(8, s * 0.38)}px "IBM Plex Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = item?.symbol ?? item?.name?.slice(0, 2) ?? "?";
  ctx.fillText(label, x + s / 2, y + s / 2 + 0.5);
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
