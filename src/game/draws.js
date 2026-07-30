import { getProduct, CORE_DRAW_IDS } from '../data/products.js';
import { hashSeed, mulberry32, pickUnique, pickInt, pad5 } from './rng.js';
import { gameDate } from './time.js';

/** Hora del sorteo (UTC simulada = hora España simplificada) */
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

  if (productId === 'lae-primitiva' || productId === 'lae-bonoloto') {
    return {
      productId,
      ymd,
      numbers: pickUnique(rng, 6, 49),
      complementary: productId === 'lae-primitiva' ? pickInt(rng, 1, 49) : null,
      reintegro: pickInt(rng, 0, 9),
    };
  }
  if (productId === 'lae-euromillones') {
    return {
      productId,
      ymd,
      numbers: pickUnique(rng, 5, 50),
      stars: pickUnique(rng, 2, 12),
    };
  }
  if (productId === 'lae-nacional' || productId === 'lae-navidad' || productId === 'lae-nino') {
    return {
      productId,
      ymd,
      winningNumber: pad5(pickInt(rng, 0, 99999)),
      // premios aproximados por terminaciones
    };
  }
  if (productId === 'once-cupon') {
    return {
      productId,
      ymd,
      winningNumber: pad5(pickInt(rng, 0, 99999)),
    };
  }
  // inventadas: 5/40 estilo
  return {
    productId,
    ymd,
    numbers: pickUnique(rng, 5, 40),
  };
}

/**
 * Genera apuesta aleatoria (o semi-fija) para un producto.
 */
export function generateBetSelection(productId, rng) {
  const p = getProduct(productId);
  if (!p) return {};
  if (productId === 'lae-primitiva' || productId === 'lae-bonoloto') {
    return {
      numbers: pickUnique(rng, 6, 49),
      reintegro: pickInt(rng, 0, 9),
    };
  }
  if (productId === 'lae-euromillones') {
    return {
      numbers: pickUnique(rng, 5, 50),
      stars: pickUnique(rng, 2, 12),
    };
  }
  if (productId === 'lae-nacional' || productId === 'lae-navidad' || productId === 'lae-nino' || productId === 'once-cupon') {
    return { number: pad5(pickInt(rng, 0, 99999)) };
  }
  return { numbers: pickUnique(rng, 5, 40) };
}

/** Próximo día de sorteo (ymd) a partir de una fecha de juego */
export function nextDrawYmd(productId, fromDate) {
  const p = getProduct(productId);
  if (!p?.drawDays?.length) {
    // especiales: Navidad 22 dic, Niño 6 ene (simplificado)
    if (productId === 'lae-navidad') {
      const y = fromDate.getUTCFullYear();
      const target = new Date(Date.UTC(y, 11, 22));
      if (fromDate > target) return `${y + 1}-12-22`;
      return `${y}-12-22`;
    }
    if (productId === 'lae-nino') {
      const y = fromDate.getUTCMonth() === 0 && fromDate.getUTCDate() <= 6 ? fromDate.getUTCFullYear() : fromDate.getUTCFullYear() + 1;
      return `${y}-01-06`;
    }
    return null;
  }
  const d = new Date(fromDate.getTime());
  // Si aún no ha pasado la hora del sorteo hoy y hoy es día de sorteo, hoy
  for (let i = 0; i < 16; i++) {
    const dow = d.getUTCDay();
    if (p.drawDays.includes(dow)) {
      const hour = p.drawHour ?? DEFAULT_DRAW_HOUR;
      if (i > 0 || fromDate.getUTCHours() < hour) {
        return ymdFromDate(d);
      }
    }
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(0, 0, 0, 0);
  }
  return null;
}

/**
 * Asegura que existen resultados de sorteos cuya hora ya pasó.
 */
export function ensureDrawsResolved(state) {
  if (!state.draws) state.draws = {};
  const now = gameDate(state);
  const today = ymdFromDate(now);
  const hour = now.getUTCHours();

  const ids = [
    ...CORE_DRAW_IDS,
    'and-fortuna',
    'mal-premio',
    'alo-local',
    'lae-navidad',
    'lae-nino',
  ];

  // Resolver sorteos de los últimos 14 días + hoy si ya pasó la hora
  for (let back = 0; back <= 14; back++) {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() - back);
    d.setUTCHours(12, 0, 0, 0);
    const ymd = ymdFromDate(d);
    for (const productId of ids) {
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
        state.dayLog.push({
          at: state.clock.gameTimeMs,
          text: `Sorteo resuelto: ${p.name} (${ymd})`,
        });
      }
    }
  }
  return state;
}

export function getDraw(state, productId, ymd) {
  return state.draws?.[drawKey(productId, ymd)] || null;
}

export { drawKey, ymdFromDate };
