/** RNG determinista (Mulberry32) */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(...parts) {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickUnique(rng, count, from) {
  const pool = Array.from({ length: from }, (_, i) => i + 1);
  const out = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}

export function pickInt(rng, min, maxInclusive) {
  return min + Math.floor(rng() * (maxInclusive - min + 1));
}

/** Formatea número de Lotería Nacional a 5 dígitos */
export function pad5(n) {
  return String(n).padStart(5, '0');
}
