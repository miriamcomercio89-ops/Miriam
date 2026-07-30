import { getProduct, PRODUCTS } from '../data/products.js';
import { pad5 } from './rng.js';
import { formatEuro } from '../data/money.js';

export const SHOWCASE_MIN = 10;
export const SHOWCASE_MAX = 24;

/** Productos que caben en escaparate (décimo / fractionable). */
export function showcaseableProducts() {
  return PRODUCTS.filter((p) => p.numberMode === 'nacional' || p.fractionable);
}

/** Escaparate de décimos de administración (números a la vista). */
export function ensureShowcase(state) {
  if (!Array.isArray(state.showcase)) state.showcase = [];
  return state;
}

export function addShowcaseDecimo(state, { productId = 'lae-nacional', number, qty = 1, note = '' } = {}) {
  ensureShowcase(state);
  if (state.showcase.length >= SHOWCASE_MAX) {
    state.ui.toast = `Escaparate lleno (máx. ${SHOWCASE_MAX})`;
    return state;
  }
  const p = getProduct(productId);
  if (!p || (p.numberMode !== 'nacional' && !p.fractionable)) {
    state.ui.toast = 'Solo décimos con número (nacional / fractionable) en escaparate';
    return state;
  }
  const need = p.numberMode === 'serieLocal' || p.numberMode === 'triplex' ? 3 : 5;
  const digits = String(number || '').replace(/\D/g, '').padStart(need, '0').slice(-need);
  if (digits.length !== need) {
    state.ui.toast = `Indica un número de ${need} cifras`;
    return state;
  }
  const q = Math.max(1, Math.min(10, Number(qty) || 1));
  state.showcase.push({
    id: `sc-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    productId: p.id,
    productName: p.name,
    number: digits,
    qty: q,
    note: String(note || '').slice(0, 60),
    unitCents: p.priceCents,
  });
  state.ui.toast = `Escaparate: ${p.name} nº ${digits} ×${q}`;
  return state;
}

export function removeShowcaseDecimo(state, id) {
  ensureShowcase(state);
  state.showcase = state.showcase.filter((d) => d.id !== id);
  state.ui.toast = 'Décimo quitado del escaparate';
  return state;
}

/** Vende un décimo del escaparate al cliente actual vía TPV (añade línea). */
export function sellShowcaseToTpv(state, showcaseId) {
  const tpv = state.ui.tpv;
  ensureShowcase(state);
  const item = state.showcase.find((d) => d.id === showcaseId);
  if (!tpv || !item) {
    state.ui.toast = 'Abre el TPV y elige un décimo del escaparate';
    return state;
  }
  const p = getProduct(item.productId);
  if (!p) return state;
  const have = state.stock[item.productId];
  if (p.stockType === 'physical' && have != null && have < item.qty) {
    tpv.message = `Sin stock de ${p.name} para el escaparate`;
    return state;
  }
  tpv.lines.push({
    id: `L-${Date.now()}-${Math.floor(Math.random() * 1e5)}`,
    productId: p.id,
    name: `${p.name} (escaparate)`,
    org: p.org,
    qty: item.qty,
    unitCents: p.priceCents,
    numberSource: 'dictate',
    selection: { number: item.number, fractions: item.qty, series: false },
    needsNumbers: true,
    numberMode: p.numberMode,
    fromShowcaseId: item.id,
  });
  state.showcase = state.showcase.filter((d) => d.id !== item.id);
  tpv.message = `Escaparate → ticket: nº ${item.number} ×${item.qty} (${formatEuro(p.priceCents * item.qty)})`;
  return state;
}

export function seedDefaultShowcase(state) {
  ensureShowcase(state);
  if (state.showcase.length) return state;
  const seeds = [
    { productId: 'lae-nacional', number: '45821', qty: 1, note: 'Admin' },
    { productId: 'lae-nacional', number: '12345', qty: 2, note: 'Rincón' },
    { productId: 'lae-nacional', number: '77777', qty: 1, note: 'Vitrina' },
    { productId: 'lae-nacional-jueves', number: '09090', qty: 1, note: 'Jueves' },
    { productId: 'lae-nacional', number: '33333', qty: 1, note: '' },
    { productId: 'lae-nacional', number: '68024', qty: 1, note: 'Álora' },
    { productId: 'lae-nacional', number: '20260', qty: 1, note: '' },
    { productId: 'lae-nacional', number: '11111', qty: 1, note: 'Serie corta' },
    { productId: 'lae-nacional', number: '55555', qty: 1, note: '' },
    { productId: 'lae-nacional', number: '88888', qty: 1, note: 'Vitrina' },
    { productId: 'lae-nacional', number: pad5(13000), qty: 1, note: 'Pueblo' },
    { productId: 'lae-nacional', number: '24680', qty: 1, note: '' },
    { productId: 'and-costa', number: '29001', qty: 1, note: 'Costa' },
    { productId: 'alo-chorro', number: '13013', qty: 1, note: 'Turismo' },
    { productId: 'mal-antequera', number: '29200', qty: 1, note: 'Torcal' },
    { productId: 'alo-navidad', number: '25122', qty: 1, note: 'Nav. local' },
    { productId: 'lae-navidad', number: '45821', qty: 1, note: 'Gordo' },
  ];
  for (const s of seeds) {
    if (state.showcase.length >= SHOWCASE_MAX) break;
    addShowcaseDecimo(state, s);
  }
  if (state.ui.toast?.startsWith('Escaparate:')) state.ui.toast = null;
  return state;
}

/**
 * Valida líneas del TPV frente al escaparate:
 * - números que parecen de vitrina pero ya no están → aviso
 * - venta de escaparate OK si fromShowcaseId o número aún listado
 */
export function validateShowcaseAgainstTpv(state, tpv) {
  ensureShowcase(state);
  const inVitrine = new Set((state.showcase || []).map((d) => `${d.productId}:${d.number}`));
  const warnings = [];
  const ok = [];
  for (const line of tpv?.lines || []) {
    const num = line.selection?.number;
    if (!num || (line.numberMode !== 'nacional' && !getProduct(line.productId)?.fractionable)) continue;
    const key = `${line.productId}:${num}`;
    const stillThere = inVitrine.has(key);
    if (line.fromShowcaseId) {
      ok.push({ lineId: line.id, number: num, note: 'Vendido desde escaparate' });
      continue;
    }
    // Si el jugador marcó a mano un número que está (o estuvo tipicamente) en vitrina
    if (stillThere) {
      warnings.push({
        lineId: line.id,
        number: num,
        level: 'info',
        message: `nº ${num} sigue en escaparate: quítalo de la vitrina al cobrar o véndelo desde Escaparate.`,
      });
    } else if (line.name?.includes('escaparate') || line._wasShowcase) {
      warnings.push({
        lineId: line.id,
        number: num,
        level: 'warn',
        message: `nº ${num} ya no está en el escaparate.`,
      });
    }
  }
  return { warnings, ok, hasBlocking: false };
}

export function findShowcaseByNumber(state, productId, number) {
  ensureShowcase(state);
  const digits = String(number || '').replace(/\D/g, '');
  return (state.showcase || []).find(
    (d) => d.productId === productId && d.number === digits.padStart(d.number.length, '0').slice(-d.number.length),
  );
}
