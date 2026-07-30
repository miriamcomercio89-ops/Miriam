import { getProduct, CORE_DRAW_IDS } from '../data/products.js';
import { hashSeed, mulberry32, pickUnique, pickInt, pad5 } from './rng.js';
import { gameDate } from './time.js';

const DEFAULT_DRAW_HOUR = 21;
const COLORS = ['rojo', 'verde', 'azul', 'oro'];
const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
const VALORES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

function ymdFromDate(d) {
  return d.toISOString().slice(0, 10);
}

function drawKey(productId, ymd) {
  return `${productId}@${ymd}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function genByMode(mode, productId, ymd, rng) {
  switch (mode) {
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
      return { productId, ymd, winningNumber: pad5(pickInt(rng, 0, 99999)) };
    case 'triplex':
    case 'serieLocal':
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
      return { productId, ymd, numbers: pickUnique(rng, 5, 40) };
    case '4from30':
      return { productId, ymd, numbers: pickUnique(rng, 4, 30) };
    case '6from36':
      return { productId, ymd, numbers: pickUnique(rng, 6, 36) };
    case '7from45':
      return { productId, ymd, numbers: pickUnique(rng, 7, 45) };
    case '2from20':
      return { productId, ymd, numbers: pickUnique(rng, 2, 20) };
    case 'bingo75':
      return { productId, ymd, numbers: pickUnique(rng, 5, 75) };
    case 'colorball':
      return {
        productId,
        ymd,
        numbers: pickUnique(rng, 4, 30),
        color: COLORS[pickInt(rng, 0, COLORS.length - 1)],
      };
    case 'ruleta':
      return { productId, ymd, roulette: pickInt(rng, 0, 36) };
    case 'fecha':
      return { productId, ymd, day: pickInt(rng, 1, 28), month: pickInt(rng, 1, 12) };
    case 'horaSuerte':
      return {
        productId,
        ymd,
        hour: pickInt(rng, 0, 23),
        minute: pickInt(rng, 0, 59),
      };
    case 'pares':
      return {
        productId,
        ymd,
        parity: Array.from({ length: 5 }, () => (rng() < 0.5 ? 'P' : 'I')),
      };
    case 'dados':
      return {
        productId,
        ymd,
        dice: Array.from({ length: 3 }, () => pickInt(rng, 1, 6)),
      };
    case 'carta':
      return {
        productId,
        ymd,
        cards: Array.from({ length: 3 }, () => ({
          palo: PALOS[pickInt(rng, 0, 3)],
          valor: VALORES[pickInt(rng, 0, VALORES.length - 1)],
        })),
      };
    default:
      return { productId, ymd, numbers: pickUnique(rng, 5, 40) };
  }
}

export function generateDrawResult(productId, ymd) {
  const rng = mulberry32(hashSeed('draw', productId, ymd));
  const p = getProduct(productId);
  if (!p) return null;
  return genByMode(p.numberMode || productId, productId, ymd, rng);
}

export function generateBetSelection(productId, rng) {
  const p = getProduct(productId);
  if (!p) return {};
  const mode = p.numberMode;
  const draw = genByMode(mode, productId, 'bet', rng);
  // Convert draw-shaped result to selection shape
  if (draw.winningNumber != null) return { number: draw.winningNumber };
  if (draw.roulette != null) return { roulette: draw.roulette };
  if (draw.day != null) return { day: draw.day, month: draw.month };
  if (draw.hour != null) return { hour: draw.hour, minute: draw.minute };
  if (draw.parity) return { parity: draw.parity };
  if (draw.dice) return { dice: draw.dice };
  if (draw.cards) return { cards: draw.cards };
  if (draw.color) return { numbers: draw.numbers, color: draw.color };
  if (draw.races) return { races: draw.races, plus: draw.plus };
  if (draw.column) return { column: draw.column, pleno: draw.pleno };
  if (draw.goals) return { goals: draw.goals };
  if (draw.stars) return { numbers: draw.numbers, stars: draw.stars };
  if (draw.clave != null) return { numbers: draw.numbers, clave: draw.clave };
  if (draw.numbers) {
    const sel = { numbers: draw.numbers };
    if (draw.reintegro != null) sel.reintegro = draw.reintegro;
    return sel;
  }
  return {};
}

export function nextDrawYmd(productId, fromDate) {
  const p = getProduct(productId);
  if (!p?.drawDays?.length) {
    if (productId === 'lae-navidad' || productId === 'alo-navidad') {
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
      } else if (
        (productId === 'lae-navidad' || productId === 'alo-navidad') &&
        ymd.endsWith('-12-22')
      ) {
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

const DOW_LABEL = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** Texto corto: próximo sorteo del producto. */
export function nextDrawLabel(productId, fromDate = new Date()) {
  const p = getProduct(productId);
  if (!p) return '';
  const ymd = nextDrawYmd(productId, fromDate);
  if (!ymd) {
    if (p.seasonMonths?.length) return 'Temporada especial';
    return 'Sin sorteo programado';
  }
  const d = new Date(`${ymd}T12:00:00Z`);
  const dow = DOW_LABEL[d.getUTCDay()] || '';
  const hour = p.drawHour ?? DEFAULT_DRAW_HOUR;
  const today = fromDate.toISOString().slice(0, 10);
  if (ymd === today) return `Hoy ${String(hour).padStart(2, '0')}:00`;
  return `${dow} ${ymd.slice(8, 10)}/${ymd.slice(5, 7)} ${String(hour).padStart(2, '0')}:00`;
}

export function modeHint(mode) {
  const hints = {
    nacional: '5 cifras (ej. 45821) · serie 45821 · 45821 x2',
    triplex: '3 cifras (ej. 742)',
    serieLocal: '3 cifras 000–999',
    '6from49': '6 números 1–49 y reintegro',
    euro: '5 números | 2 estrellas',
    eurojackpot: '5 números | 2 estrellas',
    gordo: '5 números 1–54 y clave',
    quiniela: '14 signos 1/X/2',
    quinigol: '6 resultados 0/1/2/M',
    superonce: '5 números del 1 al 49',
    lototurf: '5 números del 1 al 49',
    quintuple: '5 caballos 1–20 + suplementaria',
    '5from40': '5 números del 1 al 40',
    '4from30': '4 números del 1 al 30',
    '6from36': '6 números del 1 al 36',
    '7from45': '7 números del 1 al 45',
    '2from20': '2 números del 1 al 20',
    bingo75: '5 números del 1 al 75',
    colorball: '4 números 1–30 y color (rojo/verde/azul/oro)',
    ruleta: 'Un número 0–36',
    fecha: 'Día y mes (ej. 8 9 o 08/09)',
    horaSuerte: 'Hora HH:MM (ej. 19:30)',
    pares: '5 letras P o I (ej. PIPII)',
    dados: '3 dados 1–6 (ej. 3 5 1)',
    carta: '3 cartas palo-valor (ej. oros-1 copas-10 bastos-12)',
  };
  return hints[mode] || 'Escribe la combinación dictada';
}

export { drawKey, ymdFromDate, pad2, COLORS, PALOS, VALORES };
