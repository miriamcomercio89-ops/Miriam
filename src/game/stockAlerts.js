import { PRODUCTS } from '../data/products.js';

const LOW_THRESHOLDS = {
  rasca: 8,
  default: 10,
  navidad: 6,
};

export function stockCriticalList(state) {
  const list = [];
  for (const p of PRODUCTS) {
    if (p.stockType !== 'physical') continue;
    const qty = state.stock?.[p.id];
    if (qty == null) continue;
    let thr = LOW_THRESHOLDS.default;
    if (p.category === 'rasca') thr = LOW_THRESHOLDS.rasca;
    if (p.id.includes('navidad') || p.id.includes('nino')) thr = LOW_THRESHOLDS.navidad;
    if (qty <= thr) {
      list.push({
        id: p.id,
        name: p.name,
        qty,
        thr,
        critical: qty <= Math.max(2, Math.floor(thr / 2)),
        category: p.tpvCategory,
      });
    }
  }
  list.sort((a, b) => a.qty - b.qty);
  return list;
}

export function pendingOrdersSummary(state) {
  const pending = (state.orders || []).filter((o) => o.status === 'pending');
  const arrived = (state.orders || []).filter((o) => o.status === 'arrived');
  return { pending, arrived, pendingCount: pending.length, arrivedCount: arrived.length };
}

export function stockAlertBanner(state) {
  const crit = stockCriticalList(state).filter((x) => x.critical);
  if (!crit.length) return null;
  const names = crit
    .slice(0, 3)
    .map((c) => `${c.name} (${c.qty})`)
    .join(' · ');
  return `Stock crítico: ${names}${crit.length > 3 ? ` (+${crit.length - 3})` : ''}`;
}
