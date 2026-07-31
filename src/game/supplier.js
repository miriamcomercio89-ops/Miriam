import { PRODUCTS, getProduct } from '../data/products.js';
import { gameDate, gameYmd } from './time.js';
import { formatEuro } from '../data/money.js';

/** Coste proveedor ≈ precio − comisión (margen oficina). */
export function supplierUnitCostCents(product) {
  const rate = product.commissionRate ?? 0.05;
  return Math.max(1, Math.round(product.priceCents * (1 - rate)));
}

function addBusinessDays(state, days) {
  const d = gameDate(state);
  let left = Math.max(1, days);
  let guard = 0;
  while (left > 0 && guard++ < 400) {
    d.setUTCDate(d.getUTCDate() + 1);
    const ymd = d.toISOString().slice(0, 10);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !state.holidays[ymd]) left--;
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Pedido a proveedor con coste y fecha de llegada.
 * Cobra el coste del banco al confirmar el pedido.
 */
export function placeSupplierOrder(state, productId, qty) {
  const p = getProduct(productId);
  if (!p || p.stockType !== 'physical') {
    state.ui.toast = 'Solo productos físicos se piden a proveedor';
    return state;
  }
  const q = Math.max(1, Math.min(200, Number(qty) || 20));
  const unitCost = supplierUnitCostCents(p);
  const totalCost = unitCost * q;
  if (state.finance.bankCents < totalCost) {
    state.ui.toast = `Banco insuficiente para pedido (${formatEuro(totalCost)})`;
    return state;
  }
  const arrive = addBusinessDays(state, p.orderDays ?? 2);
  state.finance.bankCents -= totalCost;
  state.orders.push({
    id: `sup-${Date.now()}`,
    productId,
    productName: p.name,
    qty: q,
    clientId: null,
    clientName: null,
    arriveOnYmd: arrive,
    status: 'pending',
    reserved: false,
    supplier: true,
    unitCostCents: unitCost,
    totalCostCents: totalCost,
    orderedOnYmd: gameYmd(state),
  });
  state.finance.ledger.push({
    id: `sup-pay-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'supplier',
    label: `Proveedor: ${p.name} ×${q}`,
    totalCents: -totalCost,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Pedido proveedor ${p.name} ×${q} · coste ${formatEuro(totalCost)} · llega ${arrive}`,
  });
  state.ui.toast = `Proveedor: ${p.name} ×${q} · ${formatEuro(totalCost)} · ${arrive}`;
  return state;
}

/** Inventario de rascas: avisos y reposición sugerida los lunes. */
export function mondayScratchInventory(state) {
  const rascas = PRODUCTS.filter((p) => p.category === 'rasca');
  const low = [];
  const report = [];
  for (const p of rascas) {
    const qty = state.stock[p.id] ?? 0;
    report.push({ productId: p.id, name: p.name, qty });
    if (qty < 15) low.push({ productId: p.id, name: p.name, qty });
  }
  state.ui.mondayScratchReport = {
    ymd: gameYmd(state),
    report,
    low,
  };
  return { report, low };
}

/** Reponer rascas bajos vía proveedor (lunes). */
export function restockLowScratches(state, targetQty = 40) {
  const { low } = mondayScratchInventory(state);
  if (!low.length) {
    state.ui.toast = 'Rascas OK: ninguno por debajo de 15';
    return state;
  }
  let n = 0;
  for (const item of low) {
    const need = Math.max(10, targetQty - item.qty);
    const before = state.finance.bankCents;
    placeSupplierOrder(state, item.productId, need);
    if (state.finance.bankCents < before) n += 1;
  }
  state.ui.toast = n
    ? `Lunes: pedidos de reposición de ${n} rascas enviados`
    : 'No se pudo reponer (revisa banco)';
  return state;
}
