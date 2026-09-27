import { ELEMENTS } from "../data/elements.js";

export const MAP_SIZE = 80;

export function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld(seed = 118) {
  const rand = mulberry32(seed);
  const tiles = [];
  for (let y = 0; y < MAP_SIZE; y++) {
    const row = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      const n = noise(x, y, seed);
      let terrain = "dirt";
      if (n > 0.72) terrain = "rock";
      else if (n < 0.28) terrain = "water";
      else if (n < 0.34) terrain = "sand";
      else terrain = rand() > 0.45 ? "grass" : "dirt";
      row.push({ terrain, deposit: null, reserve: 0 });
    }
    tiles.push(row);
  }

  sprinkleLiquid(tiles, rand, "water", 0.02, (t) => t.terrain === "water");
  sprinklePools(tiles, rand, "brine", 4, 3);
  sprinklePools(tiles, rand, "oil", 5, 2);

  const cx = 18;
  const cy = 18;
  placeBlob(tiles, cx + 2, cy + 1, "Fe", 3, 900);
  placeBlob(tiles, cx - 2, cy + 4, "C", 3, 1100);
  placeBlob(tiles, cx + 6, cy - 2, "Cu", 2, 700);
  placeBlob(tiles, cx - 4, cy - 1, "Si", 2, 700);
  placeBlob(tiles, cx + 3, cy + 7, "Ca", 2, 500);
  placeBlob(tiles, cx + 8, cy + 5, "Al", 2, 500);
  forceWater(tiles, cx + 10, cy + 2, 2);

  for (const el of ELEMENTS) {
    if (["Fe", "C", "Cu", "Si", "Ca", "Al"].includes(el.symbol)) continue;
    const count =
      el.abundance === "common" ? 3 : el.abundance === "uncommon" ? 2 : el.abundance === "rare" ? 1 : rand() < 0.35 ? 1 : 0;
    for (let i = 0; i < count; i++) {
      const x = 8 + Math.floor(rand() * (MAP_SIZE - 16));
      const y = 8 + Math.floor(rand() * (MAP_SIZE - 16));
      const r = el.abundance === "common" ? 2 : 1;
      const reserve = el.abundance === "common" ? 600 : el.abundance === "uncommon" ? 360 : 180;
      placeBlob(tiles, x, y, el.symbol, r, reserve);
    }
  }

  return { seed, tiles, size: MAP_SIZE, spawn: { x: cx, y: cy } };
}

function noise(x, y, seed) {
  const s = Math.sin(x * 0.21 + seed * 0.01) + Math.cos(y * 0.17 + seed * 0.013);
  const t = Math.sin((x + y) * 0.09 + seed * 0.02) * 0.5;
  return (s + t + 2.5) / 5;
}

function placeBlob(tiles, cx, cy, symbol, radius, reserve) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inMap(x, y)) continue;
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d <= radius * radius + 0.2) {
        const t = tiles[y][x];
        if (t.terrain === "water") continue;
        t.deposit = symbol;
        t.reserve = reserve;
        if (t.terrain === "grass") t.terrain = "dirt";
      }
    }
  }
}

function forceWater(tiles, cx, cy, radius) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inMap(x, y)) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) {
        tiles[y][x].terrain = "water";
        tiles[y][x].deposit = null;
      }
    }
  }
}

function sprinklePools(tiles, rand, kind, count, radius) {
  for (let i = 0; i < count; i++) {
    const x = 10 + Math.floor(rand() * (MAP_SIZE - 20));
    const y = 10 + Math.floor(rand() * (MAP_SIZE - 20));
    for (let yy = y - radius; yy <= y + radius; yy++) {
      for (let xx = x - radius; xx <= x + radius; xx++) {
        if (!inMap(xx, yy)) continue;
        if ((xx - x) ** 2 + (yy - y) ** 2 <= radius * radius) {
          tiles[yy][xx].terrain = kind;
          tiles[yy][xx].deposit = kind;
          tiles[yy][xx].reserve = 5000;
        }
      }
    }
  }
}

function sprinkleLiquid(tiles, rand, kind, chance, pred) {
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      if (pred(tiles[y][x]) && rand() < chance) {
        tiles[y][x].deposit = kind;
        tiles[y][x].reserve = 9999;
      }
    }
  }
}

export function inMap(x, y) {
  return x >= 0 && y >= 0 && x < MAP_SIZE && y < MAP_SIZE;
}

export function tileKey(x, y) {
  return `${x},${y}`;
}
