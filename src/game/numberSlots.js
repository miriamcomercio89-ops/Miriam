/**
 * Casillas de entrada por número / cifra según numberMode.
 * Euromillones: 5 + 2 estrellas · Primitiva: 6 + reintegro · Nacional: 5 cifras…
 */

const COLORS = ['rojo', 'verde', 'azul', 'oro'];
const PALOS = ['oros', 'copas', 'espadas', 'bastos'];
const SIGN_1X2 = ['1', 'X', '2'];
const SIGN_GOL = ['0', '1', '2', 'M'];
const SIGN_PI = ['P', 'I'];

/**
 * @returns {{ id: string, label: string, group: string, min?: number, max?: number, type: string, choices?: string[], uniqueGroup?: string|null }[]}
 */
export function slotSchemaForMode(mode, productId = '') {
  switch (mode) {
    case 'nacional':
      return Array.from({ length: 5 }, (_, i) => ({
        id: `d${i}`,
        label: `Cifra ${i + 1}`,
        group: 'número',
        type: 'digit',
        min: 0,
        max: 9,
      }));
    case 'triplex':
    case 'serieLocal':
      return Array.from({ length: 3 }, (_, i) => ({
        id: `d${i}`,
        label: `Cifra ${i + 1}`,
        group: 'número',
        type: 'digit',
        min: 0,
        max: 9,
      }));
    case '6from49':
      return [
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `n${i}`,
          label: `N${i + 1}`,
          group: 'números',
          type: 'int',
          min: 1,
          max: 49,
          uniqueGroup: 'main',
        })),
        {
          id: 'reintegro',
          label: 'R',
          group: 'reintegro',
          type: 'digit',
          min: 0,
          max: 9,
        },
      ];
    case 'euro':
    case 'eurojackpot':
      return [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `n${i}`,
          label: `N${i + 1}`,
          group: 'números',
          type: 'int',
          min: 1,
          max: 50,
          uniqueGroup: 'main',
        })),
        ...Array.from({ length: 2 }, (_, i) => ({
          id: `s${i}`,
          label: `★${i + 1}`,
          group: 'estrellas',
          type: 'int',
          min: 1,
          max: 12,
          uniqueGroup: 'stars',
        })),
      ];
    case 'gordo':
      return [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `n${i}`,
          label: `N${i + 1}`,
          group: 'números',
          type: 'int',
          min: 1,
          max: 54,
          uniqueGroup: 'main',
        })),
        { id: 'clave', label: 'Clave', group: 'clave', type: 'int', min: 1, max: 9 },
      ];
    case 'quiniela':
      return [
        ...Array.from({ length: 14 }, (_, i) => ({
          id: `c${i}`,
          label: `P${i + 1}`,
          group: 'columna',
          type: 'choice',
          choices: SIGN_1X2,
        })),
        {
          id: 'pleno',
          label: 'Pleno',
          group: 'pleno',
          type: 'choice',
          choices: ['0', '1', '2', 'M'],
        },
      ];
    case 'quinigol':
      return Array.from({ length: 6 }, (_, i) => ({
        id: `g${i}`,
        label: `P${i + 1}`,
        group: 'goles',
        type: 'choice',
        choices: SIGN_GOL,
      }));
    case 'superonce':
    case 'lototurf':
      return Array.from({ length: 5 }, (_, i) => ({
        id: `n${i}`,
        label: `N${i + 1}`,
        group: 'números',
        type: 'int',
        min: 1,
        max: 49,
        uniqueGroup: 'main',
      }));
    case 'quintuple':
      return [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `r${i}`,
          label: `C${i + 1}`,
          group: 'carreras',
          type: 'int',
          min: 1,
          max: 20,
        })),
        { id: 'plus', label: '+', group: 'plus', type: 'int', min: 1, max: 20 },
      ];
    case '5from40':
      return poolSlots(5, 40);
    case '4from30':
      return poolSlots(4, 30);
    case '6from36':
      return poolSlots(6, 36);
    case '7from45':
      return poolSlots(7, 45);
    case '2from20':
      return poolSlots(2, 20);
    case 'bingo75':
      return poolSlots(5, 75);
    case 'colorball':
      return [
        ...poolSlots(4, 30),
        {
          id: 'color',
          label: 'Color',
          group: 'color',
          type: 'choice',
          choices: COLORS,
        },
      ];
    case 'ruleta':
      return [{ id: 'roulette', label: 'Nº', group: 'ruleta', type: 'int', min: 0, max: 36 }];
    case 'fecha':
      return [
        { id: 'day', label: 'Día', group: 'fecha', type: 'int', min: 1, max: 28 },
        { id: 'month', label: 'Mes', group: 'fecha', type: 'int', min: 1, max: 12 },
      ];
    case 'horaSuerte':
      return [
        { id: 'hour', label: 'Hora', group: 'hora', type: 'int', min: 0, max: 23 },
        { id: 'minute', label: 'Min', group: 'hora', type: 'int', min: 0, max: 59 },
      ];
    case 'pares':
      return Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        label: `${i + 1}`,
        group: 'paridad',
        type: 'choice',
        choices: SIGN_PI,
      }));
    case 'dados':
      return Array.from({ length: 3 }, (_, i) => ({
        id: `d${i}`,
        label: `D${i + 1}`,
        group: 'dados',
        type: 'int',
        min: 1,
        max: 6,
      }));
    case 'carta':
      return Array.from({ length: 3 }, (_, i) => [
        {
          id: `palo${i}`,
          label: `Palo ${i + 1}`,
          group: `carta${i + 1}`,
          type: 'choice',
          choices: PALOS,
        },
        {
          id: `val${i}`,
          label: `Valor ${i + 1}`,
          group: `carta${i + 1}`,
          type: 'choice',
          choices: ['1', '2', '3', '4', '5', '6', '7', '10', '11', '12'],
        },
      ]).flat();
    default:
      return [{ id: 'raw', label: 'Valor', group: 'dato', type: 'text' }];
  }
}

function poolSlots(count, max) {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${i}`,
    label: `N${i + 1}`,
    group: 'números',
    type: 'int',
    min: 1,
    max,
    uniqueGroup: 'main',
  }));
}

export function emptySlots(mode, productId) {
  return slotSchemaForMode(mode, productId).map((s) => ({ ...s, value: '' }));
}

/** Rellena casillas desde una selection o draft de texto. */
export function slotsFromSelection(mode, productId, selection) {
  const slots = emptySlots(mode, productId);
  if (!selection) return slots;

  if (mode === 'nacional' || mode === 'triplex' || mode === 'serieLocal') {
    const num = String(selection.number || '').replace(/\D/g, '');
    const need = mode === 'nacional' ? 5 : 3;
    const padded = num.padStart(need, '0').slice(-need);
    for (let i = 0; i < need; i++) slots[i].value = padded[i] ?? '';
    return slots;
  }

  if (selection.numbers && Array.isArray(selection.numbers)) {
    const main = slots.filter((s) => s.uniqueGroup === 'main' || (s.id.startsWith('n') && s.group === 'números'));
    selection.numbers.forEach((n, i) => {
      if (main[i]) main[i].value = String(n);
    });
  }
  if (selection.stars) {
    selection.stars.forEach((n, i) => {
      const s = slots.find((x) => x.id === `s${i}`);
      if (s) s.value = String(n);
    });
  }
  if (selection.reintegro != null) {
    const s = slots.find((x) => x.id === 'reintegro');
    if (s) s.value = String(selection.reintegro);
  }
  if (selection.clave != null) {
    const s = slots.find((x) => x.id === 'clave');
    if (s) s.value = String(selection.clave);
  }
  if (selection.column) {
    selection.column.forEach((c, i) => {
      const s = slots.find((x) => x.id === `c${i}`);
      if (s) s.value = String(c);
    });
  }
  if (selection.pleno != null) {
    const s = slots.find((x) => x.id === 'pleno');
    if (s) s.value = String(selection.pleno);
  }
  if (selection.goals) {
    selection.goals.forEach((g, i) => {
      const s = slots.find((x) => x.id === `g${i}`);
      if (s) s.value = String(g);
    });
  }
  if (selection.races) {
    selection.races.forEach((r, i) => {
      const s = slots.find((x) => x.id === `r${i}`);
      if (s) s.value = String(r);
    });
  }
  if (selection.plus != null) {
    const s = slots.find((x) => x.id === 'plus');
    if (s) s.value = String(selection.plus);
  }
  if (selection.color) {
    const s = slots.find((x) => x.id === 'color');
    if (s) s.value = selection.color;
  }
  if (selection.roulette != null) {
    const s = slots.find((x) => x.id === 'roulette');
    if (s) s.value = String(selection.roulette);
  }
  if (selection.day != null) {
    const d = slots.find((x) => x.id === 'day');
    const m = slots.find((x) => x.id === 'month');
    if (d) d.value = String(selection.day);
    if (m) m.value = String(selection.month);
  }
  if (selection.hour != null) {
    const h = slots.find((x) => x.id === 'hour');
    const mi = slots.find((x) => x.id === 'minute');
    if (h) h.value = String(selection.hour);
    if (mi) mi.value = String(selection.minute);
  }
  if (selection.parity) {
    selection.parity.forEach((p, i) => {
      const s = slots.find((x) => x.id === `p${i}`);
      if (s) s.value = String(p);
    });
  }
  if (selection.dice) {
    selection.dice.forEach((d, i) => {
      const s = slots.find((x) => x.id === `d${i}`);
      if (s) s.value = String(d);
    });
  }
  if (selection.cards) {
    selection.cards.forEach((c, i) => {
      const palo = slots.find((x) => x.id === `palo${i}`);
      const val = slots.find((x) => x.id === `val${i}`);
      if (palo) palo.value = c.palo;
      if (val) val.value = String(c.valor);
    });
  }
  return slots;
}

/** Prefill desde draft de texto (petición del cliente). */
export function slotsFromDraft(mode, productId, draft) {
  const text = String(draft || '').trim();
  if (!text) return emptySlots(mode, productId);
  if (mode === 'nacional' || mode === 'triplex' || mode === 'serieLocal') {
    const digits = text.replace(/\D/g, '');
    const need = mode === 'nacional' ? 5 : 3;
    if (digits.length >= need) {
      return slotsFromSelection(mode, productId, { number: digits.slice(0, need) });
    }
  }
  // Números separados
  const nums = text.split(/[\s,;|★*]+/).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length) {
    const slots = emptySlots(mode, productId);
    let ni = 0;
    for (const s of slots) {
      if (s.type === 'int' || s.type === 'digit') {
        if (nums[ni] != null) {
          s.value = String(nums[ni]);
          ni += 1;
        }
      }
    }
    return slots;
  }
  return emptySlots(mode, productId);
}

export function selectionFromSlots(mode, productId, slots) {
  const byId = Object.fromEntries(slots.map((s) => [s.id, s]));
  const val = (id) => String(byId[id]?.value ?? '').trim();
  const intVal = (id) => {
    const n = Number(val(id));
    return Number.isFinite(n) ? n : NaN;
  };

  const requireFilled = () => {
    for (const s of slots) {
      if (s.value === '' || s.value == null) {
        return { ok: false, error: `Falta rellenar: ${s.label}` };
      }
    }
    return null;
  };

  if (mode === 'nacional' || mode === 'triplex' || mode === 'serieLocal') {
    const miss = requireFilled();
    if (miss) return miss;
    const number = slots.map((s) => s.value).join('');
    return { ok: true, selection: { number, fractions: 1, series: false } };
  }

  if (mode === '6from49') {
    const miss = requireFilled();
    if (miss) return miss;
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      const n = intVal(`n${i}`);
      if (n < 1 || n > 49) return { ok: false, error: 'Números entre 1 y 49' };
      numbers.push(n);
    }
    if (new Set(numbers).size < 6) return { ok: false, error: 'Los 6 números deben ser distintos' };
    const reintegro = intVal('reintegro');
    if (reintegro < 0 || reintegro > 9) return { ok: false, error: 'Reintegro 0–9' };
    return {
      ok: true,
      selection: { numbers: [...numbers].sort((a, b) => a - b), reintegro },
    };
  }

  if (mode === 'euro' || mode === 'eurojackpot') {
    const miss = requireFilled();
    if (miss) return miss;
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const n = intVal(`n${i}`);
      if (n < 1 || n > 50) return { ok: false, error: 'Números entre 1 y 50' };
      numbers.push(n);
    }
    const stars = [];
    for (let i = 0; i < 2; i++) {
      const n = intVal(`s${i}`);
      if (n < 1 || n > 12) return { ok: false, error: 'Estrellas entre 1 y 12' };
      stars.push(n);
    }
    if (new Set(numbers).size < 5) return { ok: false, error: 'Los 5 números deben ser distintos' };
    if (new Set(stars).size < 2) return { ok: false, error: 'Las 2 estrellas deben ser distintas' };
    return {
      ok: true,
      selection: {
        numbers: [...numbers].sort((a, b) => a - b),
        stars: [...stars].sort((a, b) => a - b),
      },
    };
  }

  if (mode === 'gordo') {
    const miss = requireFilled();
    if (miss) return miss;
    const numbers = [];
    for (let i = 0; i < 5; i++) {
      const n = intVal(`n${i}`);
      if (n < 1 || n > 54) return { ok: false, error: 'Números 1–54' };
      numbers.push(n);
    }
    if (new Set(numbers).size < 5) return { ok: false, error: 'Números distintos' };
    const clave = intVal('clave');
    if (clave < 1 || clave > 9) return { ok: false, error: 'Clave 1–9' };
    return { ok: true, selection: { numbers: [...numbers].sort((a, b) => a - b), clave } };
  }

  if (mode === 'quiniela') {
    const miss = requireFilled();
    if (miss) return miss;
    const column = [];
    for (let i = 0; i < 14; i++) column.push(val(`c${i}`).toUpperCase());
    return { ok: true, selection: { column, pleno: val('pleno').toUpperCase() } };
  }

  if (mode === 'quinigol') {
    const miss = requireFilled();
    if (miss) return miss;
    return { ok: true, selection: { goals: slots.map((s) => s.value.toUpperCase()) } };
  }

  const pools = {
    superonce: [5, 49],
    lototurf: [5, 49],
    '5from40': [5, 40],
    '4from30': [4, 30],
    '6from36': [6, 36],
    '7from45': [7, 45],
    '2from20': [2, 20],
    bingo75: [5, 75],
  };
  if (pools[mode]) {
    const [need, max] = pools[mode];
    const miss = requireFilled();
    if (miss) return miss;
    const numbers = [];
    for (let i = 0; i < need; i++) {
      const n = intVal(`n${i}`);
      if (n < 1 || n > max) return { ok: false, error: `Números 1–${max}` };
      numbers.push(n);
    }
    if (new Set(numbers).size < need) return { ok: false, error: 'Números distintos' };
    return { ok: true, selection: { numbers: [...numbers].sort((a, b) => a - b) } };
  }

  if (mode === 'quintuple') {
    const miss = requireFilled();
    if (miss) return miss;
    const races = [];
    for (let i = 0; i < 5; i++) {
      const n = intVal(`r${i}`);
      if (n < 1 || n > 20) return { ok: false, error: 'Caballos 1–20' };
      races.push(n);
    }
    const plus = intVal('plus');
    if (plus < 1 || plus > 20) return { ok: false, error: 'Suplementaria 1–20' };
    return { ok: true, selection: { races, plus } };
  }

  if (mode === 'colorball') {
    const miss = requireFilled();
    if (miss) return miss;
    const numbers = [];
    for (let i = 0; i < 4; i++) {
      const n = intVal(`n${i}`);
      if (n < 1 || n > 30) return { ok: false, error: 'Números 1–30' };
      numbers.push(n);
    }
    if (new Set(numbers).size < 4) return { ok: false, error: 'Números distintos' };
    return {
      ok: true,
      selection: { numbers: [...numbers].sort((a, b) => a - b), color: val('color').toLowerCase() },
    };
  }

  if (mode === 'ruleta') {
    const miss = requireFilled();
    if (miss) return miss;
    const n = intVal('roulette');
    if (n < 0 || n > 36) return { ok: false, error: '0–36' };
    return { ok: true, selection: { roulette: n } };
  }

  if (mode === 'fecha') {
    const miss = requireFilled();
    if (miss) return miss;
    return { ok: true, selection: { day: intVal('day'), month: intVal('month') } };
  }

  if (mode === 'horaSuerte') {
    const miss = requireFilled();
    if (miss) return miss;
    return { ok: true, selection: { hour: intVal('hour'), minute: intVal('minute') } };
  }

  if (mode === 'pares') {
    const miss = requireFilled();
    if (miss) return miss;
    return { ok: true, selection: { parity: slots.map((s) => s.value.toUpperCase()) } };
  }

  if (mode === 'dados') {
    const miss = requireFilled();
    if (miss) return miss;
    return { ok: true, selection: { dice: slots.map((s) => Number(s.value)) } };
  }

  if (mode === 'carta') {
    const miss = requireFilled();
    if (miss) return miss;
    const cards = [];
    for (let i = 0; i < 3; i++) {
      cards.push({ palo: val(`palo${i}`), valor: Number(val(`val${i}`)) });
    }
    return { ok: true, selection: { cards } };
  }

  return { ok: false, error: 'Modo no soportado en casillas' };
}

function usedInGroup(slots, uniqueGroup, exceptId) {
  return new Set(
    slots
      .filter((s) => s.uniqueGroup === uniqueGroup && s.id !== exceptId && s.value !== '')
      .map((s) => Number(s.value)),
  );
}

/** Genera un valor aleatorio válido para una casilla (respeta únicos). */
export function randomizeOneSlot(slots, index, rng = Math.random) {
  const s = slots[index];
  if (!s) return slots;
  const next = slots.map((x) => ({ ...x }));
  const target = next[index];

  if (target.type === 'choice' && target.choices?.length) {
    target.value = target.choices[Math.floor(rng() * target.choices.length)];
    return next;
  }

  const min = target.min ?? 0;
  const max = target.max ?? 9;
  const used = target.uniqueGroup ? usedInGroup(next, target.uniqueGroup, target.id) : new Set();
  const pool = [];
  for (let n = min; n <= max; n++) {
    if (!used.has(n)) pool.push(n);
  }
  if (!pool.length) {
    target.value = String(min + Math.floor(rng() * (max - min + 1)));
  } else {
    target.value = String(pool[Math.floor(rng() * pool.length)]);
  }
  return next;
}

export function randomizeAllSlots(slots, rng = Math.random) {
  let next = slots.map((x) => ({ ...x, value: '' }));
  for (let i = 0; i < next.length; i++) {
    next = randomizeOneSlot(next, i, rng);
  }
  return next;
}

export function slotsSummary(slots) {
  const groups = new Map();
  for (const s of slots) {
    if (!groups.has(s.group)) groups.set(s.group, []);
    groups.get(s.group).push(s);
  }
  return [...groups.entries()]
    .map(([g, arr]) => `${g}: ${arr.map((a) => a.value || '·').join(' ')}`)
    .join(' · ');
}
