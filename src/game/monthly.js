import { getProduct } from '../data/products.js';
import { formatEuro } from '../data/money.js';
import { gameDate } from './time.js';

/** Resumen mensual LAE / ONCE / otros a partir del ledger. */
export function buildMonthlyStatement(state, year, month) {
  // month 0-11
  const start = Date.UTC(year, month, 1, 0, 0, 0);
  const end = Date.UTC(year, month + 1, 1, 0, 0, 0);
  const orgs = {
    LAE: { sales: 0, commission: 0, prizes: 0, remittance: 0 },
    ONCE: { sales: 0, commission: 0, prizes: 0, remittance: 0 },
    Otros: { sales: 0, commission: 0, prizes: 0, remittance: 0 },
  };
  let expenses = 0;
  let supplier = 0;
  let shortage = 0;

  for (const e of state.finance.ledger || []) {
    if (e.at < start || e.at >= end) continue;
    if (e.type === 'sale' && e.items) {
      for (const item of e.items) {
        const p = getProduct(item.productId);
        const org = p?.org === 'LAE' || p?.org === 'ONCE' ? p.org : 'Otros';
        const total = item.unitCents * item.qty;
        const comm = Math.round(total * (p?.commissionRate || 0.05));
        orgs[org].sales += total;
        orgs[org].commission += comm;
      }
    }
    if (e.type === 'prize') {
      const org = e.org === 'LAE' || e.org === 'ONCE' ? e.org : 'Otros';
      orgs[org].prizes += e.totalCents || 0;
    }
    if (e.type === 'expense') expenses += Math.abs(e.totalCents || 0);
    if (e.type === 'supplier') supplier += Math.abs(e.totalCents || 0);
    if (e.type === 'shortage') shortage += Math.abs(e.totalCents || 0);
  }

  for (const org of Object.keys(orgs)) {
    orgs[org].remittance = orgs[org].sales - orgs[org].commission;
  }

  const label = new Date(Date.UTC(year, month, 1)).toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return {
    year,
    month,
    label,
    orgs,
    expenses,
    supplier,
    shortage,
    totalSales: orgs.LAE.sales + orgs.ONCE.sales + orgs.Otros.sales,
    totalCommission: orgs.LAE.commission + orgs.ONCE.commission + orgs.Otros.commission,
    totalPrizes: orgs.LAE.prizes + orgs.ONCE.prizes + orgs.Otros.prizes,
  };
}

export function currentMonthStatement(state) {
  const d = gameDate(state);
  return buildMonthlyStatement(state, d.getUTCFullYear(), d.getUTCMonth());
}

export function formatMonthlyLines(statement) {
  const s = statement;
  const lines = [
    `Liquidación mensual — ${s.label}`,
    '--------------------------------',
    `Ventas totales: ${formatEuro(s.totalSales)}`,
    `Comisiones: ${formatEuro(s.totalCommission)}`,
    `Premios pagados: ${formatEuro(s.totalPrizes)}`,
    `Gastos local: ${formatEuro(s.expenses)}`,
    `Proveedor: ${formatEuro(s.supplier)}`,
    `Faltantes: ${formatEuro(s.shortage)}`,
    '--------------------------------',
  ];
  for (const org of ['LAE', 'ONCE', 'Otros']) {
    const o = s.orgs[org];
    lines.push(`${org}`);
    lines.push(`  Ventas ${formatEuro(o.sales)} · Com. ${formatEuro(o.commission)}`);
    lines.push(`  Remesa ${formatEuro(o.remittance)} · Premios ${formatEuro(o.prizes)}`);
  }
  lines.push('--------------------------------');
  lines.push('Fan-made / no oficial · +18');
  return lines;
}
