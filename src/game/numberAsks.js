import { getProduct } from '../data/products.js';
import { pad5 } from './rng.js';

/**
 * Peticiones de números del cliente: miles de variantes (aleatorio, cifras, terminaciones…).
 * kind: random | dictate | ending | starts | contains | birth | lucky | series | fractions | reintegro | stars | phone | house | pedrea | mirror | custom
 */

const ENDINGS = [
  '00', '11', '22', '25', '33', '44', '50', '55', '66', '69', '70', '75', '77', '88', '99',
  '07', '13', '17', '21', '27', '37', '41', '47', '61', '71', '81', '91',
];
const STARTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '12', '13', '17', '19', '21', '25', '28'];
const LUCKY_PHRASES = [
  'los de siempre',
  'los del santo',
  'los del cumpleaños',
  'los de la boda',
  'los del DNI',
  'los del teléfono',
  'los de la casa',
  'los de la matrícula',
  'los del pueblo',
  'los de la peña',
  'los que soñé anoche',
  'los de la nieta',
  'los del abuelo',
  'los del Caminito',
  'los de la feria',
];

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function digits(rng, n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(rng() * 10);
  return s;
}

/** Genera una petición de números acorde al producto. */
export function makeNumberAsk(product, rng, client = null) {
  const p = typeof product === 'string' ? getProduct(product) : product;
  if (!p?.needsNumbers) {
    return { kind: 'none', label: 'Sin números', preferDictate: false };
  }
  const mode = p.numberMode || 'nacional';
  const roll = rng();

  // ~28% aleatorio terminal
  if (roll < 0.28) {
    return {
      kind: 'random',
      label: pick(rng, [
        'Aleatorio del terminal',
        'Lo que salga',
        'Al azar, por favor',
        'El que diga la máquina',
        'Sorpresa',
        'Cualquiera, que tenga suerte',
      ]),
      preferDictate: false,
    };
  }

  // Nacional / triplex / serie local
  if (mode === 'nacional' || mode === 'triplex' || mode === 'serieLocal') {
    const need = mode === 'nacional' ? 5 : 3;
    const sub = rng();
    if (sub < 0.18) {
      const end = pick(rng, ENDINGS);
      return {
        kind: 'ending',
        label: `Que termine en ${end}`,
        preferDictate: true,
        hint: end,
        draftHint: `…${end}`,
      };
    }
    if (sub < 0.3) {
      const start = pick(rng, STARTS);
      return {
        kind: 'starts',
        label: `Que empiece por ${start}`,
        preferDictate: true,
        hint: start,
        draftHint: start,
      };
    }
    if (sub < 0.4) {
      const d = String(Math.floor(rng() * 10));
      return {
        kind: 'contains',
        label: `Que lleve el ${d} (alguna cifra)`,
        preferDictate: true,
        hint: d,
      };
    }
    if (sub < 0.5 && client?.name) {
      const year = 1950 + Math.floor(rng() * 55);
      const mm = 1 + Math.floor(rng() * 12);
      const dd = 1 + Math.floor(rng() * 28);
      const num = pad5(String(dd) + String(mm).padStart(2, '0') + String(year).slice(-1));
      return {
        kind: 'birth',
        label: `Fecha especial ${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}`,
        preferDictate: true,
        selection: { number: num.slice(0, need).padStart(need, '0'), fractions: 1, series: false },
        draftHint: num.slice(0, need),
      };
    }
    if (sub < 0.58) {
      const phone = digits(rng, need);
      return {
        kind: 'phone',
        label: `Cifras del móvil …${phone.slice(-3)}`,
        preferDictate: true,
        selection: { number: phone, fractions: 1, series: false },
        draftHint: phone,
      };
    }
    if (sub < 0.64) {
      const house = String(1 + Math.floor(rng() * 120)).padStart(need, '0').slice(-need);
      return {
        kind: 'house',
        label: `Número de casa ${Number(house)}`,
        preferDictate: true,
        selection: { number: house, fractions: 1, series: false },
        draftHint: house,
      };
    }
    if (sub < 0.72 && mode === 'nacional') {
      const num = digits(rng, 5);
      return {
        kind: 'series',
        label: `Serie entera del ${num}`,
        preferDictate: true,
        selection: { number: num, series: true, fractions: 10 },
        draftHint: `serie ${num}`,
      };
    }
    if (sub < 0.8 && mode === 'nacional') {
      const num = digits(rng, 5);
      const fr = 2 + Math.floor(rng() * 4);
      return {
        kind: 'fractions',
        label: `${fr} décimos del ${num}`,
        preferDictate: true,
        selection: { number: num, fractions: fr, series: false },
        draftHint: `${num} x${fr}`,
      };
    }
    if (sub < 0.86) {
      const a = digits(rng, need);
      const mirror = a.split('').reverse().join('');
      return {
        kind: 'mirror',
        label: `Capicúa o casi: ${a}`,
        preferDictate: true,
        selection: { number: rng() < 0.5 ? a : mirror.slice(0, need).padStart(need, '0'), fractions: 1, series: false },
        draftHint: a,
      };
    }
    if (sub < 0.92) {
      const num = digits(rng, need);
      return {
        kind: 'pedrea',
        label: `Pedrea del ${num}`,
        preferDictate: true,
        selection: { number: num, fractions: 1, series: false },
        draftHint: num,
      };
    }
    const num = digits(rng, need);
    return {
      kind: 'dictate',
      label: `Dicta el ${num}`,
      preferDictate: true,
      selection: { number: num, fractions: 1, series: false },
      draftHint: num,
    };
  }

  // 6/49 Primitiva / Bonoloto
  if (mode === '6from49') {
    if (rng() < 0.35) {
      return { kind: 'random', label: 'Aleatoria 6/49', preferDictate: false };
    }
    const nums = [];
    while (nums.length < 6) {
      const n = 1 + Math.floor(rng() * 49);
      if (!nums.includes(n)) nums.push(n);
    }
    nums.sort((a, b) => a - b);
    const re = Math.floor(rng() * 10);
    if (rng() < 0.4) {
      return {
        kind: 'reintegro',
        label: `Combinación con reintegro ${re}`,
        preferDictate: true,
        selection: { numbers: nums, reintegro: re, complementario: 1 + Math.floor(rng() * 49) },
        draftHint: `${nums.join(' ')} r${re}`,
      };
    }
    return {
      kind: 'lucky',
      label: pick(rng, LUCKY_PHRASES),
      preferDictate: true,
      selection: { numbers: nums, reintegro: re },
      draftHint: nums.join(' '),
    };
  }

  // Euromillones
  if (mode === 'euro' || mode === 'eurojackpot') {
    if (rng() < 0.3) return { kind: 'random', label: 'Aleatorio Europa', preferDictate: false };
    const mainMax = mode === 'euro' ? 50 : 50;
    const starMax = mode === 'euro' ? 12 : 12;
    const main = [];
    while (main.length < 5) {
      const n = 1 + Math.floor(rng() * mainMax);
      if (!main.includes(n)) main.push(n);
    }
    main.sort((a, b) => a - b);
    const stars = [];
    while (stars.length < 2) {
      const n = 1 + Math.floor(rng() * starMax);
      if (!stars.includes(n)) stars.push(n);
    }
    stars.sort((a, b) => a - b);
    if (rng() < 0.45) {
      return {
        kind: 'stars',
        label: `Estrellas ${stars.join(' y ')}`,
        preferDictate: true,
        selection: { numbers: main, stars },
        draftHint: `${main.join(' ')} * ${stars.join(' ')}`,
      };
    }
    return {
      kind: 'dictate',
      label: pick(rng, LUCKY_PHRASES),
      preferDictate: true,
      selection: { numbers: main, stars },
      draftHint: `${main.join(' ')} * ${stars.join(' ')}`,
    };
  }

  // Gordo / quiniela / etc. → dictado genérico o aleatorio
  if (rng() < 0.4) {
    return { kind: 'random', label: 'Aleatorio', preferDictate: false };
  }
  return {
    kind: 'dictate',
    label: pick(rng, [...LUCKY_PHRASES, 'Yo te digo los números', 'Apunta lo que te diga', 'Combinación mía']),
    preferDictate: true,
  };
}

/** Texto corto para UI / wishlist */
export function numberAskLabel(ask) {
  if (!ask || ask.kind === 'none') return '';
  return ask.label || ask.kind;
}

/** ¿La línea TPV satisface la petición de números? (heurística) */
export function numberAskSatisfied(ask, line) {
  if (!ask || ask.kind === 'none' || ask.kind === 'random') {
    return { ok: true, soft: true };
  }
  if (!line?.selection) return { ok: false, reason: 'Sin marcar' };
  if (ask.kind === 'random') {
    return { ok: line.numberSource === 'random', reason: 'Pedía aleatorio' };
  }
  const s = line.selection;
  if (ask.selection) {
    if (ask.selection.number && s.number && ask.selection.number !== s.number) {
      return { ok: false, reason: `Pedía ${ask.selection.number}` };
    }
    if (ask.selection.series && !s.series) return { ok: false, reason: 'Pedía serie' };
    if (ask.selection.fractions && s.fractions && ask.selection.fractions !== s.fractions) {
      return { ok: false, reason: `Pedía ${ask.selection.fractions} décimos` };
    }
    if (ask.selection.numbers && s.numbers) {
      const a = [...ask.selection.numbers].sort().join(',');
      const b = [...s.numbers].sort().join(',');
      if (a !== b) return { ok: false, reason: 'Combinación distinta' };
    }
  }
  if (ask.kind === 'ending' && ask.hint && s.number && !String(s.number).endsWith(ask.hint)) {
    return { ok: false, reason: `Debe terminar en ${ask.hint}` };
  }
  if (ask.kind === 'starts' && ask.hint && s.number && !String(s.number).startsWith(ask.hint)) {
    return { ok: false, reason: `Debe empezar por ${ask.hint}` };
  }
  if (ask.kind === 'contains' && ask.hint && s.number && !String(s.number).includes(ask.hint)) {
    return { ok: false, reason: `Debe llevar el ${ask.hint}` };
  }
  // Dictado genérico: basta con tener números marcados (no aleatorio forzoso)
  if (ask.preferDictate && line.numberSource === 'random' && !ask.selection) {
    return { ok: true, soft: true, reason: 'Marcado aleatorio (acepta)' };
  }
  return { ok: true };
}
