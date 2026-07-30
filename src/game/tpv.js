import { getProduct, PRODUCTS } from '../data/products.js';
import { generateBetSelection } from './draws.js';
import { hashSeed, mulberry32 } from './rng.js';
import { formatEuro } from '../data/money.js';

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
export function addTpvProduct(state, productId, { qty = 1, numberSource = 'random' } = {}) {
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
  const selection =
    p.needsNumbers && numberSource === 'random' ? generateBetSelection(productId, rng) : p.needsNumbers ? null : {};

  const line = {
    id: lineId(),
    productId: p.id,
    name: p.name,
    org: p.org,
    qty,
    unitCents: p.priceCents,
    numberSource,
    selection,
    needsNumbers: !!p.needsNumbers,
    numberMode: p.numberMode || null,
  };
  tpv.lines.push(line);
  tpv.message = `Añadido: ${p.name} ×${qty}`;

  if (p.needsNumbers && numberSource === 'dictate') {
    tpv.numberEntry = {
      lineId: line.id,
      mode: p.numberMode,
      draft: '',
      productName: p.name,
    };
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

  const qtyByProduct = {};
  for (const l of tpv?.lines || []) {
    qtyByProduct[l.productId] = (qtyByProduct[l.productId] || 0) + l.qty;
  }
  const used = { ...qtyByProduct };

  for (const w of wish) {
    const have = used[w.productId] || 0;
    if (have >= w.qty) {
      covered.push({ ...w, have });
      used[w.productId] = have - w.qty;
    } else if (have > 0) {
      missing.push({ ...w, have, need: w.qty - have });
      used[w.productId] = 0;
    } else {
      missing.push({ ...w, have: 0, need: w.qty });
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
    complete: missing.length === 0,
  };
}

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

export function applyDictatedNumbers(state, text) {
  const tpv = state.ui.tpv;
  if (!tpv?.numberEntry) return state;
  const line = tpv.lines.find((l) => l.id === tpv.numberEntry.lineId);
  if (!line) return state;
  const parsed = parseDictatedNumbers(line.numberMode, text);
  if (!parsed.ok) {
    tpv.message = parsed.error;
    return state;
  }
  line.selection = parsed.selection;
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
  tpv.numberEntry = {
    lineId: line.id,
    mode: line.numberMode,
    draft: '',
    productName: line.name,
  };
  return state;
}

function parseDictatedNumbers(mode, text) {
  const raw = String(text || '').trim();
  if (!raw) return { ok: false, error: 'Escribe los números que dicta el cliente' };

  if (mode === 'nacional' || mode === 'triplex') {
    // Serie entera: "serie 12345" → 10 décimos del número
    const serie = raw.match(/serie\s*(\d{5})/i);
    if (serie && mode === 'nacional') {
      return {
        ok: true,
        selection: { number: serie[1], series: true, fractions: 10 },
      };
    }
    // Pedrea: "12345 x2" o "12345 2 décimos"
    const pedrea = raw.match(/(\d{5})\s*(?:x|×|\*|decimos?|décimos?)?\s*(\d+)?/i);
    const digits = raw.replace(/\D/g, '');
    const need = mode === 'triplex' ? 3 : 5;
    if (digits.length < need && !pedrea) return { ok: false, error: `Haz falta ${need} cifras` };
    const number = (pedrea ? pedrea[1] : digits.slice(0, need)).padStart(need, '0');
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

  if (mode === 'superonce' || mode === '5from40' || mode === 'lototurf') {
    const max = mode === '5from40' ? 40 : 49;
    const need = 5;
    const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= max);
    const unique = [...new Set(nums)];
    if (unique.length < need) return { ok: false, error: `${need} números del 1 al ${max}` };
    return { ok: true, selection: { numbers: unique.slice(0, need).sort((a, b) => a - b) } };
  }

  return { ok: false, error: 'No se entiende la combinación' };
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
  tpv.step = 'receipt';
  tpv.message = null;
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
  if (s.stars) return `${(s.numbers || []).join(',')} ★ ${s.stars.join(',')}`;
  if (s.clave != null) return `${(s.numbers || []).join(',')} clave ${s.clave}`;
  if (s.numbers) {
    const r = s.reintegro != null ? ` R${s.reintegro}` : '';
    return `${s.numbers.join(',')}${r}`;
  }
  return '—';
}

export { formatEuro };
