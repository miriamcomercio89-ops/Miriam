import { getProduct, CORE_DRAW_IDS } from '../data/products.js';
import { hashSeed, mulberry32, pickUnique, pickInt, pad5 } from './rng.js';
import { gameDate } from './time.js';

const DEFAULT_DRAW_HOUR = 21;

function ymdFromDate(d) {
  return d.toISOString().slice(0, 10);
}

function drawKey(productId, ymd) {
  return `${productId}@${ymd}`;
}

export function generateDrawResult(productId, ymd) {
  const rng = mulberry32(hashSeed('draw', productId, ymd));
  const p = getProduct(productId);
  if (!p) return null;

  switch (p.numberMode || productId) {
    case '6from49':
      return {
        productId,
        ymd,
        numbers: pickUnique(rng, 6, 49),
        complementary: productId === 'lae-primitiva' ? pickInt(rng, 1, 49) : null,
        reintegro: pickInt(rng, 0, 9),
      };
    case 'euro':
    case 'eurojackpot':
      return { productId, ymd, numbers: pickUnique(rng, 5, 50), stars: pickUnique(rng, 2, 12) };
    case 'gordo':
      return { productId, ymd, numbers: pickUnique(rng, 5, 54), clave: pickInt(rng, 1, 9) };
    case 'nacional':
      return {
        productId,
        ymd,
        winningNumber: productId === 'once-triplex' ? String(pickInt(rng, 0, 999)).padStart(3, '0') : pad5(pickInt(rng, 0, 99999)),
      };
    case 'triplex':
      return { productId, ymd, winningNumber: String(pickInt(rng, 0, 999)).padStart(3, '0') };
    case 'quiniela': {
      const column = Array.from({ length: 14 }, () => ['1', 'X', '2'][pickInt(rng, 0, 2)]);
      return { productId, ymd, column, pleno: ['0', '1', '2', 'M'][pickInt(rng, 0, 3)] };
    }
    case 'quinigol':
      return {
        productId,
        ymd,
        goals: Array.from({ length: 6 }, () => ['0', '1', '2', 'M'][pickInt(rng, 0, 3)]),
      };
    case 'superonce':
    case 'lototurf':
      return { productId, ymd, numbers: pickUnique(rng, 5, 49) };
    case 'quintuple':
      return {
        productId,
        ymd,
        races: Array.from({ length: 5 }, () => pickInt(rng, 1, 20)),
        plus: pickInt(rng, 1, 20),
      };
    case '5from40':
    default:
      if (['once-cupon', 'once-cuponazo', 'once-sueldazo', 'lae-nacional', 'lae-nacional-jueves', 'lae-navidad', 'lae-nino'].includes(productId)) {
        return { productId, ymd, winningNumber: pad5(pickInt(rng, 0, 99999)) };
      }
      return { productId, ymd, numbers: pickUnique(rng, 5, 40) };
  }
}

export function generateBetSelection(productId, rng) {
  const p = getProduct(productId);
  if (!p) return {};
  const mode = p.numberMode;

  if (mode === '6from49') {
    return { numbers: pickUnique(rng, 6, 49), reintegro: pickInt(rng, 0, 9) };
  }
  if (mode === 'euro' || mode === 'eurojackpot') {
    return { numbers: pickUnique(rng, 5, 50), stars: pickUnique(rng, 2, 12) };
  }
  if (mode === 'gordo') {
    return { numbers: pickUnique(rng, 5, 54), clave: pickInt(rng, 1, 9) };
  }
  if (mode === 'nacional') {
    return { number: pad5(pickInt(rng, 0, 99999)) };
  }
  if (mode === 'triplex') {
    return { number: String(pickInt(rng, 0, 999)).padStart(3, '0') };
  }
  if (mode === 'quiniela') {
    return {
      column: Array.from({ length: 14 }, () => ['1', 'X', '2'][pickInt(rng, 0, 2)]),
      pleno: ['0', '1', '2', 'M'][pickInt(rng, 0, 3)],
    };
  }
  if (mode === 'quinigol') {
    return { goals: Array.from({ length: 6 }, () => ['0', '1', '2', 'M'][pickInt(rng, 0, 3)]) };
  }
  if (mode === 'superonce' || mode === 'lototurf') {
    return { numbers: pickUnique(rng, 5, 49) };
  }
  if (mode === 'quintuple') {
    return {
      races: Array.from({ length: 5 }, () => pickInt(rng, 1, 20)),
      plus: pickInt(rng, 1, 20),
    };
  }
  if (mode === '5from40') {
    return { numbers: pickUnique(rng, 5, 40) };
  }
  return { numbers: pickUnique(rng, 5, 40) };
}

export function nextDrawYmd(productId, fromDate) {
  const p = getProduct(productId);
  if (!p?.drawDays?.length) {
    if (productId === 'lae-navidad') {
      const y = fromDate.getUTCFullYear();
      const target = new Date(Date.UTC(y, 11, 22));
      if (fromDate > target) return `${y + 1}-12-22`;
      return `${y}-12-22`;
    }
    if (productId === 'lae-nino') {
      const y =
        fromDate.getUTCMonth() === 0 && fromDate.getUTCDate() <= 6
          ? fromDate.getUTCFullYear()
          : fromDate.getUTCFullYear() + 1;
      return `${y}-01-06`;
    }
    return null;
  }
  const d = new Date(fromDate.getTime());
  for (let i = 0; i < 21; i++) {
    const dow = d.getUTCDay();
    if (p.drawDays.includes(dow)) {
      const hour = p.drawHour ?? DEFAULT_DRAW_HOUR;
      if (i > 0 || fromDate.getUTCHours() < hour) return ymdFromDate(d);
    }
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(0, 0, 0, 0);
  }
  return null;
}

export function ensureDrawsResolved(state) {
  if (!state.draws) state.draws = {};
  const now = gameDate(state);
  const today = ymdFromDate(now);
  const hour = now.getUTCHours();

  for (let back = 0; back <= 21; back++) {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() - back);
    d.setUTCHours(12, 0, 0, 0);
    const ymd = ymdFromDate(d);
    for (const productId of CORE_DRAW_IDS) {
      const p = getProduct(productId);
      if (!p) continue;
      const key = drawKey(productId, ymd);
      if (state.draws[key]) continue;

      let shouldResolve = false;
      if (p.drawDays?.length) {
        if (!p.drawDays.includes(d.getUTCDay())) continue;
        const drawHour = p.drawHour ?? DEFAULT_DRAW_HOUR;
        if (ymd < today) shouldResolve = true;
        else if (ymd === today && hour >= drawHour) shouldResolve = true;
      } else if (productId === 'lae-navidad' && ymd.endsWith('-12-22')) {
        shouldResolve = ymd < today || (ymd === today && hour >= 21);
      } else if (productId === 'lae-nino' && ymd.endsWith('-01-06')) {
        shouldResolve = ymd < today || (ymd === today && hour >= 21);
      }
      if (shouldResolve) {
        state.draws[key] = generateDrawResult(productId, ymd);
      }
    }
  }
  return state;
}

export function getDraw(state, productId, ymd) {
  return state.draws?.[drawKey(productId, ymd)] || null;
}

export function listDrawHistory(state, limit = 60) {
  return Object.values(state.draws || {})
    .sort((a, b) => (a.ymd < b.ymd ? 1 : a.ymd > b.ymd ? -1 : a.productId.localeCompare(b.productId)))
    .slice(0, limit);
}

export { drawKey, ymdFromDate };
