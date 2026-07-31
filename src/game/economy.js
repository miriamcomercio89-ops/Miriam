import { MONTHLY_EXPENSES, OFFICE } from './state.js';
import { defaultFloatDrawer, drawerTotalCents, formatEuro } from '../data/money.js';
import { gameDate, gameYmd, nextBusinessDayStart, closedReason } from './time.js';
import { processArrivingOrders } from './customers.js';
import { ensureDrawsResolved } from './draws.js';
import { getProduct } from '../data/products.js';
import { pushCloseSummary } from './closeHistory.js';

export function applyDailyExpenses(state) {
  const monthlyTotal = Object.values(MONTHLY_EXPENSES).reduce((a, b) => a + b, 0);
  const daily = Math.round(monthlyTotal / 22);
  state.finance.bankCents -= daily;
  state.finance.dayExpensesCents += daily;
  state.finance.ledger.push({
    id: `exp-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'expense',
    label: 'Gastos del local (prorrateo diario)',
    totalCents: -daily,
  });
  return state;
}

export function maybeApplyTaxes(state) {
  const d = gameDate(state);
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  if (![0, 3, 6, 9].includes(month) || day !== 20) return state;
  const base = Math.round(state.stats.totalSalesCents * 0.02);
  const iva = Math.round(base * 0.21);
  const irpf = Math.round(base * 0.15);
  const total = iva + irpf;
  state.finance.bankCents -= total;
  state.finance.ledger.push({
    id: `tax-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'tax',
    label: 'Liquidación trimestral IVA+IRPF',
    totalCents: -total,
  });
  state.dayLog.push({ at: state.clock.gameTimeMs, text: `Impuestos: ${formatEuro(total)}` });
  return state;
}

/** Totales del día por organización (LAE / ONCE / otros) */
export function dayOrgBreakdown(state) {
  const dayStart = new Date(gameDate(state));
  dayStart.setUTCHours(0, 0, 0, 0);
  const startMs = dayStart.getTime();
  const orgs = {
    LAE: { sales: 0, commission: 0, prizes: 0 },
    ONCE: { sales: 0, commission: 0, prizes: 0 },
    Otros: { sales: 0, commission: 0, prizes: 0 },
  };

  for (const e of state.finance.ledger) {
    if (e.at < startMs) continue;
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
  }
  return orgs;
}

export function settleOrganizations(state) {
  const orgs = dayOrgBreakdown(state);
  const laeRemit = orgs.LAE.sales - orgs.LAE.commission;
  const onceRemit = orgs.ONCE.sales - orgs.ONCE.commission;
  const otrosRemit = orgs.Otros.sales - orgs.Otros.commission;
  const prizesReimb = (orgs.LAE.prizes || 0) + (orgs.ONCE.prizes || 0) + (orgs.Otros.prizes || 0);

  state.finance.bankCents -= laeRemit + onceRemit + otrosRemit;
  state.finance.bankCents += prizesReimb;

  const settlement = {
    at: state.clock.gameTimeMs,
    lae: {
      sales: orgs.LAE.sales,
      commission: orgs.LAE.commission,
      remittance: laeRemit,
      prizesReimbursed: orgs.LAE.prizes,
    },
    once: {
      sales: orgs.ONCE.sales,
      commission: orgs.ONCE.commission,
      remittance: onceRemit,
      prizesReimbursed: orgs.ONCE.prizes,
    },
    otros: {
      sales: orgs.Otros.sales,
      commission: orgs.Otros.commission,
      remittance: otrosRemit,
      prizesReimbursed: orgs.Otros.prizes,
    },
    netBankDelta: prizesReimb - laeRemit - onceRemit - otrosRemit,
  };

  state.finance.ledger.push({
    id: `settle-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'settlement',
    label: 'Liquidación diaria LAE / ONCE / otros',
    settlement,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Liquidación LAE remesa ${formatEuro(laeRemit)} (com. ${formatEuro(orgs.LAE.commission)}) · ONCE remesa ${formatEuro(onceRemit)} (com. ${formatEuro(orgs.ONCE.commission)}) · reembolso premios ${formatEuro(prizesReimb)}`,
  });
  state.finance.lastSettlement = settlement;
  return settlement;
}

export function dayProfitBreakdown(state) {
  const commission = state.finance.dayCommissionCents || 0;
  const expenses = state.finance.dayExpensesCents || 0;
  const shortage = state.finance.dayShortageCents || 0;
  const surplus = state.finance.daySurplusCents || 0;
  return {
    salesCents: state.finance.daySalesCents || 0,
    commissionCents: commission,
    expensesCents: expenses,
    prizesPaidCents: state.finance.dayPrizesPaidCents || 0,
    prizesReimbursableCents: state.finance.dayPrizesReimbursableCents || 0,
    shortageCents: shortage,
    surplusCents: surplus,
    /** Comisiones − gastos − faltantes (+ sobrantes no suman a beneficio operativo) */
    profitCents: commission - expenses - shortage,
    orgs: dayOrgBreakdown(state),
  };
}

/** Texto claro de liquidación para UI/PDF. */
export function settlementExplain(settle) {
  if (!settle) return [];
  return [
    'Remesa = ventas − comisión retenida (sale del banco).',
    'Reembolso = premios que pagaste y te devuelve el organismo.',
    `LAE: ventas ${formatEuro(settle.lae?.sales || 0)} − com. ${formatEuro(settle.lae?.commission || 0)} → remesa ${formatEuro(settle.lae?.remittance || 0)}`,
    `ONCE: ventas ${formatEuro(settle.once?.sales || 0)} − com. ${formatEuro(settle.once?.commission || 0)} → remesa ${formatEuro(settle.once?.remittance || 0)}`,
    `Otros: ventas ${formatEuro(settle.otros?.sales || 0)} − com. ${formatEuro(settle.otros?.commission || 0)} → remesa ${formatEuro(settle.otros?.remittance || 0)}`,
    `Reembolso premios: ${formatEuro(
      (settle.lae?.prizesReimbursed || 0) +
        (settle.once?.prizesReimbursed || 0) +
        (settle.otros?.prizesReimbursed || 0),
    )}`,
    `Delta banco neto: ${formatEuro(settle.netBankDelta || 0)}`,
  ];
}

export function buildDayCloseSummary(state) {
  const profit = dayProfitBreakdown(state);
  return {
    date: gameYmd(state),
    ...profit,
    drawerCents: drawerTotalCents(state.finance.drawer),
    bankCents: state.finance.bankCents,
    customersServed: state.customers.servedToday,
    nextDay: nextBusinessDayStart(state).toISOString().slice(0, 10),
    nextDayReasonSkip: peekSkipReason(state),
    settlement: state.finance.lastSettlement || null,
    settlementNotes: settlementExplain(state.finance.lastSettlement),
  };
}

function peekSkipReason(state) {
  const cur = gameDate(state);
  const next = nextBusinessDayStart(state);
  const skipped = [];
  const d = new Date(cur.getTime());
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(8, 0, 0, 0);
  while (d < next) {
    const ymd = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    if (dow === 0) skipped.push(`${ymd} Domingo`);
    else if (dow === 6) skipped.push(`${ymd} Sábado`);
    else if (state.holidays[ymd]) skipped.push(`${ymd} ${state.holidays[ymd]}`);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return skipped;
}

export function closeDay(state) {
  ensureDrawsResolved(state);
  applyDailyExpenses(state);
  maybeApplyTaxes(state);
  const settlement = settleOrganizations(state);

  const summary = buildDayCloseSummary(state);
  summary.settlement = settlement;
  summary.settlementNotes = settlementExplain(settlement);
  pushCloseSummary(state, summary);
  state.stats.daysPlayed += 1;

  if (state.finance.dayShortageCents) {
    state.stats.totalShortageCents =
      (state.stats.totalShortageCents || 0) + state.finance.dayShortageCents;
  }
  if (state.finance.daySurplusCents) {
    state.stats.totalSurplusCents =
      (state.stats.totalSurplusCents || 0) + state.finance.daySurplusCents;
  }
  state.finance.daySalesCents = 0;
  state.finance.dayCommissionCents = 0;
  state.finance.dayPrizesPaidCents = 0;
  state.finance.dayPrizesReimbursableCents = 0;
  state.finance.dayExpensesCents = 0;
  state.finance.dayShortageCents = 0;
  state.finance.daySurplusCents = 0;
  state.finance.dayTipCents = 0;
  state.finance.changeErrorsToday = 0;
  state.customers.servedToday = 0;
  state.customers.current = null;
  state.customers.queue = [];
  state.dayLog = [];
  state.ui.lastTickets = [];
  state.ui.tpv = null;

  const float = drawerTotalCents(state.finance.drawer);
  if (float < state.finance.floatTargetCents * 0.5) {
    const need = state.finance.floatTargetCents - float;
    const take = Math.min(need, state.finance.bankCents);
    state.finance.bankCents -= take;
    state.finance.drawer = defaultFloatDrawer();
    state.ui.toast = `Fondo de caja repuesto (${formatEuro(take)}).`;
  }

  const next = nextBusinessDayStart(state);
  state.clock.gameTimeMs = next.getTime();
  state.clock.lastRealMs = Date.now();
  state.office.isOpen = true;

  processArrivingOrders(state);
  ensureDrawsResolved(state);
  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + 2 * 60 * 1000;
  state.ui.lastCloseSummary = summary;
  state.ui.screen = 'day-results';
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Nuevo día · ${OFFICE.businessName}. ${closedReason(state) || 'Abierta 08:00–20:00.'}`,
  });
  return { state, summary };
}
