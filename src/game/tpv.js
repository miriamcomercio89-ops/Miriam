import { getProduct, PRODUCTS, TPV_CATEGORIES } from '../data/products.js';
import { generateBetSelection, nextDrawLabel } from './draws.js';
import { hashSeed, mulberry32 } from './rng.js';
import { formatEuro } from '../data/money.js';
import { validateShowcaseAgainstTpv } from './showcase.js';
import { gameDate } from './time.js';
import { numberAskSatisfied } from './numberAsks.js';
import { hotJackpots } from './jackpots.js';
import { onceExtraToday } from './notices.js';
import {
  emptySlots,
  slotsFromSelection,
  slotsFromDraft,
  selectionFromSlots,
  randomizeOneSlot,
  randomizeAllSlots,
} from './numberSlots.js';

/**
 * Sesión TPV: carrito multi-línea.
 */
export const CANCEL_REASONS = ['error', 'sin stock', 'cambio de idea', 'otro'];

export function openTpv(state, client) {
  state.ui.tpv = {
    clientId: client?.id || null,
    clientName: client?.name || 'Cliente',
    wishlist: client?.wishlist ? client.wishlist.map((w) => ({ ...w })) : [],
    category: 'LAE',
    lines: [],
    editingLineId: null,
    numberEntry: null,
    cancelPrompt: null, // { lineId }
    step: 'edit', // edit | receipt
    message: null,
    cancelledLines: [],
  };
  state.ui.screen = 'tpv';
  return state;
}

export function closeTpv(state) {
  state.ui.tpv = null;
  state.ui.screen = 'counter';
  return state;
}

export function setTpvCategory(state, category) {
  if (!state.ui.tpv) return state;
  state.ui.tpv.category = category;
  state.ui.tpv.message = null;
  return state;
}

function lineId() {
  return `L-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
}

/**
 * Añade producto al carrito.
 * numberSource: 'random' | 'dictate'
 */
export function addTpvProduct(
  state,
  productId,
  { qty = 1, numberSource = 'random', selection: forcedSelection = undefined, fromShowcaseId = null } = {},
) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const p = getProduct(productId);
  if (!p) return state;

  const have = state.stock[productId];
  if (p.stockType === 'physical' && have != null && have < qty) {
    tpv.message = `Sin stock suficiente de ${p.name} (hay ${have}). Quita la línea o reserva.`;
    return state;
  }

  const rng = mulberry32(hashSeed('tpv', state.clock.gameTimeMs, productId, tpv.lines.length));
  let selection;
  if (forcedSelection) selection = { ...forcedSelection };
  else if (p.needsNumbers && numberSource === 'random') selection = generateBetSelection(productId, rng);
  else if (p.needsNumbers) selection = null;
  else selection = {};

  const line = {
    id: lineId(),
    productId: p.id,
    name: fromShowcaseId ? `${p.name} (escaparate)` : p.name,
    org: p.org,
    qty,
    unitCents: p.priceCents,
    numberSource: forcedSelection ? 'dictate' : numberSource,
    selection,
    needsNumbers: !!p.needsNumbers,
    numberMode: p.numberMode || null,
    fromShowcaseId: fromShowcaseId || undefined,
  };
  line.nextDraw = nextDrawLabel(p.id, gameDate(state));
  tpv.lines.push(line);
  const next = line.nextDraw ? ` · próximo ${line.nextDraw}` : '';
  tpv.message = `Añadido: ${p.name} ×${qty}${next}`;

  if (p.needsNumbers && numberSource === 'dictate' && !forcedSelection) {
    tpv.numberEntry = makeNumberEntry(line, p.numberMode, null, '');
  } else if (p.needsNumbers && forcedSelection && numberSource === 'dictate') {
    // Ya tiene selection; no abrir casillas salvo que falte algo
  }
  return state;
}

export function removeTpvLine(state, id) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  tpv.cancelPrompt = { lineId: id };
  tpv.message = 'Elige motivo de cancelación';
  return state;
}

export function confirmCancelLine(state, reason) {
  const tpv = state.ui.tpv;
  if (!tpv?.cancelPrompt) return state;
  const id = tpv.cancelPrompt.lineId;
  const line = tpv.lines.find((l) => l.id === id);
  if (line) {
    tpv.cancelledLines.push({ ...line, reason: reason || 'otro', at: state.clock.gameTimeMs });
    tpv.lines = tpv.lines.filter((l) => l.id !== id);
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `TPV: cancelada línea ${line.name} ×${line.qty} (${reason})`,
    });
  }
  if (tpv.numberEntry?.lineId === id) tpv.numberEntry = null;
  tpv.cancelPrompt = null;
  tpv.message = `Línea cancelada: ${reason}`;
  return state;
}

export function dismissCancelPrompt(state) {
  if (state.ui.tpv) state.ui.tpv.cancelPrompt = null;
  return state;
}

/** Compara wishlist del cliente con líneas del TPV */
export function validateWishlist(tpv) {
  const wish = tpv?.wishlist || [];
  const covered = [];
  const missing = [];
  const extras = [];
  const numberMismatches = [];

  const qtyByProduct = {};
  for (const l of tpv?.lines || []) {
    qtyByProduct[l.productId] = (qtyByProduct[l.productId] || 0) + l.qty;
  }
  const used = { ...qtyByProduct };

  for (const w of wish) {
    const have = used[w.productId] || 0;
    const askLabel = w.askLabel || w.numberAsk?.label || '';
    if (have >= w.qty) {
      covered.push({ ...w, have, askLabel });
      used[w.productId] = have - w.qty;
    } else if (have > 0) {
      missing.push({ ...w, have, need: w.qty - have, askLabel });
      used[w.productId] = 0;
    } else {
      missing.push({ ...w, have: 0, need: w.qty, askLabel });
    }
    // Comprobar cifras si hay líneas del producto
    if (w.numberAsk && have > 0) {
      const lines = (tpv.lines || []).filter((l) => l.productId === w.productId);
      for (const line of lines) {
        const sat = numberAskSatisfied(w.numberAsk, line);
        if (!sat.ok) {
          numberMismatches.push({
            productId: w.productId,
            productName: w.productName,
            askLabel,
            reason: sat.reason,
            lineId: line.id,
          });
        }
      }
    }
  }
  for (const [productId, left] of Object.entries(used)) {
    if (left > 0) {
      const p = getProduct(productId);
      extras.push({ productId, productName: p?.name || productId, qty: left });
    }
  }
  return {
    covered,
    missing,
    extras,
    numberMismatches,
    complete: missing.length === 0,
    numbersOk: numberMismatches.length === 0,
  };
}

/** Atajos del día: botes calientes, extras ONCE, favoritos por día de semana */
export function dailyTpvShortcuts(state) {
  const d = gameDate(state);
  const dow = d.getUTCDay();
  const byDow = {
    1: ['lae-bonoloto', 'once-cupon', 'lae-primitiva'],
    2: ['lae-euromillones', 'lae-bonoloto', 'once-cupon'],
    3: ['lae-bonoloto', 'lae-nacional', 'once-super-once'],
    4: ['lae-nacional', 'lae-primitiva', 'once-cupon'],
    5: ['once-cuponazo', 'lae-bonoloto', 'lae-euromillones'],
    6: ['lae-nacional', 'lae-gordo-primitiva', 'once-sueldazo'],
    0: ['lae-gordo-primitiva', 'once-sueldazo', 'lae-quiniela'],
  };
  const ids = [...(byDow[dow] || byDow[1])];
  for (const j of hotJackpots(state).slice(0, 2)) {
    if (!ids.includes(j.id)) ids.unshift(j.id);
  }
  for (const ex of onceExtraToday(state)) {
    if (!ids.includes(ex.id)) ids.unshift(ex.id);
  }
  return ids
    .map((id) => getProduct(id))
    .filter(Boolean)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.short || p.name,
      fullName: p.name,
      priceCents: p.priceCents,
      category: p.tpvCategory,
    }));
}

export { TPV_CATEGORIES };

export function setLineQty(state, id, qty) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const line = tpv.lines.find((l) => l.id === id);
  if (!line) return state;
  const q = Math.max(1, Math.min(50, qty));
  const p = getProduct(line.productId);
  if (p?.stockType === 'physical') {
    const have = state.stock[line.productId] ?? 0;
    if (have < q) {
      tpv.message = `Solo hay ${have} de ${line.name}`;
      line.qty = Math.max(1, have);
      return state;
    }
  }
  line.qty = q;
  return state;
}

function makeNumberEntry(line, mode, selection, draft) {
  let slots;
  if (selection) slots = slotsFromSelection(mode, line.productId, selection);
  else if (draft) slots = slotsFromDraft(mode, line.productId, draft);
  else slots = emptySlots(mode, line.productId);
  return {
    lineId: line.id,
    mode,
    draft: draft || '',
    productName: line.name,
    productId: line.productId,
    slots,
  };
}

export function applyDictatedNumbers(state, text) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry) return state;
  const line = tpv.lines.find((l) => l.id === tpv.numberEntry.lineId);
  if (!line) return state;
  // Preferir casillas si existen
  if (tpv.numberEntry.slots?.length && !text) {
    return applyNumberSlots(state);
  }
  const parsed = parseDictatedNumbers(line.numberMode, text);
  if (!parsed.ok) {
    tpv.message = parsed.error;
    return state;
  }
  line.selection = parsed.selection;
  line.numberSource = 'dictate';
  if (parsed.selection.series) line.qty = 10;
  else if (parsed.selection.fractions && parsed.selection.fractions > 1) {
    line.qty = parsed.selection.fractions;
  }
  tpv.numberEntry = null;
  tpv.message = parsed.selection.series
    ? 'Serie entera marcada (10 décimos)'
    : 'Números marcados';
  return state;
}

/** Confirma la combinación desde las casillas. */
export function applyNumberSlots(state) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry?.slots) return state;
  const line = tpv.lines.find((l) => l.id === tpv.numberEntry.lineId);
  if (!line) return state;
  const parsed = selectionFromSlots(line.numberMode, line.productId, tpv.numberEntry.slots);
  if (!parsed.ok) {
    tpv.message = parsed.error;
    return state;
  }
  line.selection = parsed.selection;
  line.numberSource = 'dictate';
  if (parsed.selection.series) line.qty = 10;
  else if (parsed.selection.fractions && parsed.selection.fractions > 1) {
    line.qty = parsed.selection.fractions;
  }
  tpv.numberEntry = null;
  tpv.message = 'Números marcados en casillas';
  return state;
}

export function setNumberEntrySlot(state, slotIndex, value) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry?.slots) return state;
  const slots = tpv.numberEntry.slots.map((s) => ({ ...s }));
  const s = slots[slotIndex];
  if (!s) return state;
  let v = String(value ?? '');
  if (s.type === 'digit') v = v.replace(/\D/g, '').slice(-1);
  else if (s.type === 'int') v = v.replace(/[^\d]/g, '').slice(0, 3);
  else if (s.type === 'choice') v = v;
  s.value = v;
  tpv.numberEntry.slots = slots;
  tpv.numberEntry.draft = slots.map((x) => x.value).filter(Boolean).join(' ');
  return state;
}

export function randomizeNumberEntrySlot(state, slotIndex) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry?.slots) return state;
  const rng = mulberry32(hashSeed('slot', state.clock.gameTimeMs, slotIndex, Math.random()));
  tpv.numberEntry.slots = randomizeOneSlot(tpv.numberEntry.slots, slotIndex, rng);
  tpv.numberEntry.draft = tpv.numberEntry.slots.map((x) => x.value).filter(Boolean).join(' ');
  tpv.message = `Casilla ${tpv.numberEntry.slots[slotIndex]?.label || ''} aleatoria`;
  return state;
}

export function randomizeAllNumberEntrySlots(state) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry?.slots) return state;
  const rng = mulberry32(hashSeed('slots-all', state.clock.gameTimeMs, Math.random()));
  tpv.numberEntry.slots = randomizeAllSlots(tpv.numberEntry.slots, rng);
  tpv.numberEntry.draft = tpv.numberEntry.slots.map((x) => x.value).join(' ');
  tpv.message = 'Combinación generada casilla a casilla';
  return state;
}

export function clearNumberEntrySlots(state) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry) return state;
  tpv.numberEntry.slots = emptySlots(tpv.numberEntry.mode, tpv.numberEntry.productId);
  tpv.numberEntry.draft = '';
  tpv.message = 'Casillas vacías';
  return state;
}

export function cancelNumberEntry(state) {
  if (state.ui.tpv) state.ui.tpv.numberEntry = null;
  return state;
}

export function rerollLineNumbers(state, id) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const line = tpv.lines.find((l) => l.id === id);
  if (!line?.needsNumbers) return state;
  const rng = mulberry32(hashSeed('reroll', state.clock.gameTimeMs, id));
  line.selection = generateBetSelection(line.productId, rng);
  line.numberSource = 'random';
  tpv.message = 'Combinación aleatoria nueva';
  return state;
}

export function startDictateLine(state, id) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const line = tpv.lines.find((l) => l.id === id);
  if (!line?.needsNumbers) return state;
  // Preferencia del wishlist si hay numberAsk
  const wish = (tpv.wishlist || []).find((w) => w.productId === line.productId);
  const draft = wish?.numberAsk?.draftHint || wish?.askLabel || '';
  const preselect = wish?.numberAsk?.selection || line.selection || null;
  tpv.numberEntry = makeNumberEntry(line, line.numberMode, preselect, draft);
  return state;
}

function parseDictatedNumbers(mode, text) {
  const raw = String(text || '').trim();
  if (!raw) return { ok: false, error: 'Escribe los números que dicta el cliente' };

  if (mode === 'nacional' || mode === 'triplex' || mode === 'serieLocal') {
    const need = mode === 'nacional' ? 5 : 3;
    const serie = raw.match(/serie\s*(\d{3,5})/i);
    if (serie && mode === 'nacional') {
      return {
        ok: true,
        selection: { number: serie[1].padStart(5, '0').slice(-5), series: true, fractions: 10 },
      };
    }
    const pedrea = raw.match(/(\d{3,5})\s*(?:x|×|\*|decimos?|décimos?)?\s*(\d+)?/i);
    const digits = raw.replace(/\D/g, '');
    if (digits.length < need && !pedrea) return { ok: false, error: `Haz falta ${need} cifras` };
    const number = (pedrea ? pedrea[1] : digits.slice(0, need)).padStart(need, '0').slice(-need);
    const fractions = pedrea && pedrea[2] ? Math.max(1, Math.min(10, Number(pedrea[2]))) : 1;
    return { ok: true, selection: { number, fractions, series: false } };
  }

  if (mode === '6from49') {
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 49);
    const unique = [...new Set(nums)];
    if (unique.length < 6) return { ok: false, error: 'Indica 6 números del 1 al 49' };
    const reMatch = raw.match(/r\s*(\d)/i);
    const reintegro = reMatch ? Number(reMatch[1]) : unique[6] != null ? unique[6] % 10 : 0;
    return {
      ok: true,
      selection: { numbers: unique.slice(0, 6).sort((a, b) => a - b), reintegro },
    };
  }

  if (mode === 'euro' || mode === 'eurojackpot') {
    const parts = raw.split(/[★*|]/);
    const main = (parts[0] || '')
      .split(/[\s,;.-]+/)
      .map(Number)
      .filter((n) => n >= 1 && n <= 50);
    const stars = (parts[1] || '')
      .split(/[\s,;.-]+/)
      .map(Number)
      .filter((n) => n >= 1 && n <= 12);
    const uMain = [...new Set(main)];
    const uStars = [...new Set(stars)];
    if (uMain.length < 5 || uStars.length < 2) {
      return { ok: false, error: 'Formato: 5 números | 2 estrellas (ej. 1 2 3 4 5 | 6 7)' };
    }
    return {
      ok: true,
      selection: {
        numbers: uMain.slice(0, 5).sort((a, b) => a - b),
        stars: uStars.slice(0, 2).sort((a, b) => a - b),
      },
    };
  }

  if (mode === 'gordo') {
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 54);
    const unique = [...new Set(nums)];
    if (unique.length < 5) return { ok: false, error: '5 números (1–54) y clave 1–9' };
    const clave = Number((raw.match(/clave\s*(\d)/i) || [])[1] || unique[5] || 1);
    return {
      ok: true,
      selection: { numbers: unique.slice(0, 5).sort((a, b) => a - b), clave: Math.min(9, Math.max(1, clave)) },
    };
  }

  if (mode === 'quiniela') {
    const signs = raw.toUpperCase().replace(/[^1X2]/g, '');
    if (signs.length < 14) return { ok: false, error: '14 signos 1/X/2 (ej. 1X2112...)' };
    return { ok: true, selection: { column: signs.slice(0, 14).split(''), pleno: signs[14] || '1' } };
  }

  if (mode === 'quinigol') {
    const g = raw.toUpperCase().replace(/[^012M]/g, '');
    if (g.length < 6) return { ok: false, error: '6 resultados 0/1/2/M' };
    return { ok: true, selection: { goals: g.slice(0, 6).split('') } };
  }

  const poolModes = {
    superonce: [5, 49],
    lototurf: [5, 49],
    '5from40': [5, 40],
    '4from30': [4, 30],
    '6from36': [6, 36],
    '7from45': [7, 45],
    '2from20': [2, 20],
    bingo75: [5, 75],
  };
  if (poolModes[mode]) {
    const [need, max] = poolModes[mode];
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= max);
    const unique = [...new Set(nums)];
    if (unique.length < need) return { ok: false, error: `${need} números del 1 al ${max}` };
    return { ok: true, selection: { numbers: unique.slice(0, need).sort((a, b) => a - b) } };
  }

  if (mode === 'quintuple') {
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 20);
    if (nums.length < 6) return { ok: false, error: '5 caballos (1–20) + suplementaria' };
    return {
      ok: true,
      selection: { races: nums.slice(0, 5), plus: nums[5] },
    };
  }

  if (mode === 'colorball') {
    const colorMatch = raw.match(/(rojo|verde|azul|oro)/i);
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 30);
    const unique = [...new Set(nums)];
    if (unique.length < 4 || !colorMatch) {
      return { ok: false, error: '4 números 1–30 y color (rojo/verde/azul/oro)' };
    }
    return {
      ok: true,
      selection: { numbers: unique.slice(0, 4).sort((a, b) => a - b), color: colorMatch[1].toLowerCase() },
    };
  }

  if (mode === 'ruleta') {
    const n = Number(raw.replace(/\D/g, ''));
    if (Number.isNaN(n) || n < 0 || n > 36) return { ok: false, error: 'Número 0–36' };
    return { ok: true, selection: { roulette: n } };
  }

  if (mode === 'fecha') {
    const m = raw.match(/(\d{1,2})\D+(\d{1,2})/);
    if (!m) return { ok: false, error: 'Día y mes (ej. 8 9)' };
    const day = Math.min(31, Math.max(1, Number(m[1])));
    const month = Math.min(12, Math.max(1, Number(m[2])));
    return { ok: true, selection: { day, month } };
  }

  if (mode === 'horaSuerte') {
    const m = raw.match(/(\d{1,2})\D+(\d{1,2})/);
    if (!m) return { ok: false, error: 'Hora HH:MM (ej. 19:30)' };
    const hour = Math.min(23, Math.max(0, Number(m[1])));
    const minute = Math.min(59, Math.max(0, Number(m[2])));
    return { ok: true, selection: { hour, minute } };
  }

  if (mode === 'pares') {
    const signs = raw.toUpperCase().replace(/[^PI]/g, '');
    if (signs.length < 5) return { ok: false, error: '5 letras P o I (ej. PIPII)' };
    return { ok: true, selection: { parity: signs.slice(0, 5).split('') } };
  }

  if (mode === 'dados') {
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 6);
    if (nums.length < 3) return { ok: false, error: '3 dados 1–6' };
    return { ok: true, selection: { dice: nums.slice(0, 3) } };
  }

  if (mode === 'carta') {
    const parts = raw.toLowerCase().match(/(oros|copas|espadas|bastos)\s*[-:]?\s*(\d{1,2})/g);
    if (!parts || parts.length < 3) {
      return { ok: false, error: '3 cartas (ej. oros-1 copas-10 bastos-12)' };
    }
    const cards = parts.slice(0, 3).map((p) => {
      const m = p.match(/(oros|copas|espadas|bastos)\s*[-:]?\s*(\d{1,2})/);
      return { palo: m[1], valor: Number(m[2]) };
    });
    return { ok: true, selection: { cards } };
  }

  return { ok: false, error: 'No se entiende la combinación' };
}

/** Fracciones / serie / pedrea en líneas de décimo. */
export function setLineFraction(state, lineId, fractions) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const line = tpv.lines.find((l) => l.id === lineId);
  if (!line) return state;
  const p = getProduct(line.productId);
  if (!p || (p.numberMode !== 'nacional' && !p.fractionable)) {
    tpv.message = 'Este producto no admite fracciones';
    return state;
  }
  if (!line.selection) line.selection = { number: '00000' };
  const f = Math.max(1, Math.min(10, Number(fractions) || 1));
  line.selection.fractions = f;
  line.selection.series = f === 10;
  line.qty = f;
  tpv.message = f === 10 ? 'Serie entera (10 décimos)' : f === 1 ? '1 décimo' : `Pedrea ×${f}`;
  return state;
}

export function setLineSeries(state, lineId) {
  return setLineFraction(state, lineId, 10);
}

/** Deshacer la última línea del ticket (sin motivo de cancelación). */
export function undoLastTpvLine(state) {
  const tpv = state.ui.tpv;
  if (!tpv?.lines?.length) {
    if (tpv) tpv.message = 'No hay líneas que deshacer';
    return state;
  }
  const last = tpv.lines.pop();
  if (tpv.numberEntry?.lineId === last.id) tpv.numberEntry = null;
  if (tpv.cancelPrompt?.lineId === last.id) tpv.cancelPrompt = null;
  tpv.message = `Deshecho: ${last.name} ×${last.qty}`;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `TPV: deshacer última línea ${last.name} ×${last.qty}`,
  });
  return state;
}

/** Añade líneas del abono del cliente (confirmación Miriam). */
export function confirmAbonoOnTpv(state) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const client =
    state.customers.current ||
    state.customers.abonados?.find((a) => a.id === tpv.clientId) ||
    state.customers.penas?.find((a) => a.id === tpv.clientId);
  if (!client) {
    tpv.message = 'No hay cliente de abono en esta sesión';
    return state;
  }
  if (client.kind !== 'abonado' && client.kind !== 'pena') {
    tpv.message = 'Este cliente no tiene abono / peña';
    return state;
  }
  const fav = client.favoriteProduct || client.preferredProducts?.[0];
  const p = getProduct(fav);
  if (!p) {
    tpv.message = 'No hay producto de abono configurado';
    return state;
  }
  const qty = client.kind === 'pena' ? 5 : client.abonoQty || 2;
  addTpvProduct(state, p.id, { qty, numberSource: 'random' });
  tpv.message = `Abono confirmado: ${p.name} ×${qty}`;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Abono confirmado TPV: ${client.name} · ${p.name} ×${qty}`,
  });
  const src =
    client.kind === 'abonado'
      ? state.customers.abonados?.find((a) => a.id === client.id)
      : state.customers.penas?.find((a) => a.id === client.id);
  if (src) {
    src.lastAbonoAt = state.clock.gameTimeMs;
    src.abonosConfirmed = (src.abonosConfirmed || 0) + 1;
  }
  return state;
}

export function tpvTotalCents(tpv) {
  return (tpv?.lines || []).reduce((s, l) => s + l.unitCents * l.qty, 0);
}

export function tpvReadyToCharge(tpv) {
  if (!tpv?.lines?.length) return { ok: false, error: 'El ticket está vacío' };
  for (const l of tpv.lines) {
    if (l.needsNumbers && !l.selection) {
      return { ok: false, error: `Faltan números en ${l.name}` };
    }
  }
  if (tpv.wishlist?.length) {
    const v = validateWishlist(tpv);
    if (!v.complete) {
      const miss = v.missing.map((m) => `${m.productName} (faltan ${m.need})`).join(', ');
      return { ok: false, error: `La petición no está completa: ${miss}. Puedes añadir de más, pero no de menos.` };
    }
    if (!v.numbersOk && v.numberMismatches?.length) {
      const n = v.numberMismatches[0];
      return {
        ok: false,
        error: `Cifras: ${n.productName} — ${n.askLabel || 'petición'} (${n.reason}). Corrige o dicta de nuevo.`,
      };
    }
  }
  return { ok: true };
}

export function goTpvReceipt(state) {
  const tpv = state.ui.tpv;
  if (!tpv) return state;
  const ready = tpvReadyToCharge(tpv);
  if (!ready.ok) {
    tpv.message = ready.error;
    return state;
  }
  const sc = validateShowcaseAgainstTpv(state, tpv);
  tpv.showcaseWarnings = sc.warnings;
  if (sc.warnings.length) {
    tpv.message = sc.warnings.map((w) => w.message).join(' · ');
  }
  tpv.step = 'receipt';
  if (!sc.warnings.length) tpv.message = null;
  return state;
}

export function backTpvEdit(state) {
  if (state.ui.tpv) state.ui.tpv.step = 'edit';
  return state;
}

/** Convierte carrito TPV a items de cobro */
export function tpvToSaleItems(tpv) {
  return tpv.lines.map((l) => ({
    productId: l.productId,
    name: l.name,
    qty: l.qty,
    unitCents: l.unitCents,
    org: l.org,
    selection: l.selection,
    numberSource: l.numberSource,
  }));
}

export function formatLineSelection(line) {
  const s = line.selection;
  if (!s) return 'Sin marcar';
  if (s.number) {
    let t = `Nº ${s.number}`;
    if (s.series) t += ' · serie entera';
    else if (s.fractions && s.fractions > 1) t += ` · ${s.fractions} décimos`;
    else if (s.fractions === 1) t += ' · 1 décimo';
    return t;
  }
  if (s.column) return `Columna ${s.column.join('')}`;
  if (s.goals) return `Goles ${s.goals.join('')}`;
  if (s.races) return `Carreras ${s.races.join('-')}${s.plus != null ? ` +${s.plus}` : ''}`;
  if (s.color) return `${(s.numbers || []).join(',')} · ${s.color}`;
  if (s.roulette != null) return `Ruleta ${s.roulette}`;
  if (s.day != null) return `Fecha ${s.day}/${s.month}`;
  if (s.hour != null) {
    return `Hora ${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
  }
  if (s.parity) return `Par/Impar ${s.parity.join('')}`;
  if (s.dice) return `Dados ${s.dice.join('-')}`;
  if (s.cards) return `Cartas ${s.cards.map((c) => `${c.palo}-${c.valor}`).join(' ')}`;
  if (s.stars) return `${(s.numbers || []).join(',')} ★ ${s.stars.join(',')}`;
  if (s.clave != null) return `${(s.numbers || []).join(',')} clave ${s.clave}`;
  if (s.numbers) {
    const r = s.reintegro != null ? ` R${s.reintegro}` : '';
    return `${s.numbers.join(',')}${r}`;
  }
  return '—';
}

export { formatEuro };
