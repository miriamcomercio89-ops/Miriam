import { getProduct } from '../data/products.js';
import { pad5 } from './rng.js';
import { formatEuro } from '../data/money.js';

export const SHOWCASE_MIN = 10;
export const SHOWCASE_MAX = 20;

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
  if (!p || p.numberMode !== 'nacional') {
    state.ui.toast = 'Solo décimos con número nacional en escaparate';
    return state;
  }
  const digits = String(number || '').replace(/\D/g, '').padStart(5, '0').slice(-5);
  if (digits.length !== 5) {
    state.ui.toast = 'Indica un número de 5 cifras';
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
  ];
  for (const s of seeds) {
    if (state.showcase.length >= SHOWCASE_MAX) break;
    addShowcaseDecimo(state, s);
  }
  if (state.ui.toast?.startsWith('Escaparate:')) state.ui.toast = null;
  return state;
}
