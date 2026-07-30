import { MONTHLY_EXPENSES, OFFICE } from './state.js';
import { defaultFloatDrawer, drawerTotalCents, formatEuro } from '../data/money.js';
import { gameDate, gameYmd, nextBusinessDayStart, closedReason } from './time.js';
import { processArrivingOrders } from './customers.js';
import { ensureDrawsResolved } from './draws.js';
import { advancePrizeManagement } from './prizes.js';

/** Gastos diarios prorrateados */
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
  const taxMonths = [0, 3, 6, 9];
  if (!taxMonths.includes(month) || day !== 20) return state;

  const commissionQuarterApprox = Math.round(state.stats.totalSalesCents * 0.02);
  const iva = Math.round(commissionQuarterApprox * 0.21);
  const irpf = Math.round(commissionQuarterApprox * 0.15);
  const total = iva + irpf;
  state.finance.bankCents -= total;
  state.finance.ledger.push({
    id: `tax-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'tax',
    label: 'Liquidación trimestral (IVA + IRPF estimado)',
    totalCents: -total,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Impuestos trimestrales: ${formatEuro(total)}`,
  });
  return state;
}

/**
 * Liquidación diaria con SELAE / ONCE al cierre:
 * - Entregas ventas brutas menos comisión (la comisión se queda)
 * - Te reembolsan premios pequeños pagados del día
 */
export function settleOrganizations(state) {
  const byOrg = { LAE: { sales: 0, commission: 0, prizes: 0 }, ONCE: { sales: 0, commission: 0, prizes: 0 } };

  for (const e of state.finance.ledger) {
    if (e.type !== 'sale' || !e.items) continue;
    const dayStart = new Date(gameDate(state));
    dayStart.setUTCHours(0, 0, 0, 0);
    if (e.at < dayStart.getTime()) continue;
    for (const item of e.items) {
      // org from product name path — stored on ledger ideally; fallback via totals
    }
  }

  // Usar acumulados del día
  const sales = state.finance.daySalesCents || 0;
  const commission = state.finance.dayCommissionCents || 0;
  const prizesReimb = state.finance.dayPrizesReimbursableCents || 0;

  // Aprox: 70% LAE / 30% ONCE sobre ventas del día
  const laeSales = Math.round(sales * 0.7);
  const onceSales = sales - laeSales;
  const laeComm = Math.round(commission * 0.7);
  const onceComm = commission - laeComm;
  const laePrizes = Math.round(prizesReimb * 0.7);
  const oncePrizes = prizesReimb - laePrizes;

  const remittanceLAE = laeSales - laeComm;
  const remittanceONCE = onceSales - onceComm;

  // Pagas remesas desde banco+efectivo conceptualmente al banco
  state.finance.bankCents -= remittanceLAE + remittanceONCE;
  // Te reembolsan premios
  state.finance.bankCents += prizesReimb;

  const settlement = {
    at: state.clock.gameTimeMs,
    lae: { sales: laeSales, commission: laeComm, remittance: remittanceLAE, prizesReimbursed: laePrizes },
    once: { sales: onceSales, commission: onceComm, remittance: remittanceONCE, prizesReimbursed: oncePrizes },
    netBankDelta: prizesReimb - remittanceLAE - remittanceONCE,
  };

  state.finance.ledger.push({
    id: `settle-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'settlement',
    label: 'Liquidación diaria LAE/ONCE',
    settlement,
  });

  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Liquidación: remesas ${formatEuro(remittanceLAE + remittanceONCE)} · reembolso premios ${formatEuro(prizesReimb)} · te quedas comisiones ${formatEuro(commission)}`,
  });

  state.finance.lastSettlement = settlement;
  return settlement;
}

export function dayProfitBreakdown(state) {
  const commission = state.finance.dayCommissionCents || 0;
  const expenses = state.finance.dayExpensesCents || 0;
  // Beneficio operativo del día ≈ comisiones − gastos (premios reembolsables no cuentan como pérdida)
  const profit = commission - expenses;
  return {
    salesCents: state.finance.daySalesCents || 0,
    commissionCents: commission,
    expensesCents: expenses,
    prizesPaidCents: state.finance.dayPrizesPaidCents || 0,
    prizesReimbursableCents: state.finance.dayPrizesReimbursableCents || 0,
    profitCents: profit,
  };
}

export function buildDayCloseSummary(state) {
  const drawer = drawerTotalCents(state.finance.drawer);
  const profit = dayProfitBreakdown(state);
  return {
    date: gameYmd(state),
    ...profit,
    drawerCents: drawer,
    bankCents: state.finance.bankCents,
    customersServed: state.customers.servedToday,
    nextDay: nextBusinessDayStart(state).toISOString().slice(0, 10),
    nextDayReasonSkip: peekSkipReason(state),
    settlement: state.finance.lastSettlement || null,
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
  advancePrizeManagement(state);

  const summary = buildDayCloseSummary(state);
  summary.settlement = settlement;
  state.stats.daysPlayed += 1;

  state.finance.daySalesCents = 0;
  state.finance.dayCommissionCents = 0;
  state.finance.dayPrizesPaidCents = 0;
  state.finance.dayPrizesReimbursableCents = 0;
  state.finance.dayExpensesCents = 0;
  state.customers.servedToday = 0;
  state.customers.current = null;
  state.customers.queue = [];
  state.dayLog = [];
  state.ui.lastTickets = [];

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
  state.office.openedToday = true;

  processArrivingOrders(state);
  ensureDrawsResolved(state);

  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + 2 * 60 * 1000;
  state.ui.screen = 'counter';
  state.ui.lastCloseSummary = summary;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Nuevo día en ${OFFICE.businessName}. ${closedReason(state) || 'Abierta 08:00–20:00.'}`,
  });

  return { state, summary };
}
