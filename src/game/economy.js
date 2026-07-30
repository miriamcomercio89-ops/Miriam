import { MONTHLY_EXPENSES, OFFICE } from './state.js';
import { defaultFloatDrawer, drawerTotalCents, formatEuro } from '../data/money.js';
import { gameDate, gameYmd, nextBusinessDayStart, closedReason } from './time.js';
import { processArrivingOrders } from './customers.js';

/** Gastos diarios prorrateados + cobro mensual el día 1 laborable del mes */
export function applyDailyExpenses(state) {
  const monthlyTotal = Object.values(MONTHLY_EXPENSES).reduce((a, b) => a + b, 0);
  // ~22 días laborables/mes
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

  const d = gameDate(state);
  if (d.getUTCDate() === 1 || isFirstBusinessDayOfMonth(state)) {
    // Asiento informativo de desglose mensual (ya prorrateado; no doblar)
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Recordatorio mensual: alquiler ${formatEuro(MONTHLY_EXPENSES.rent)}, luz, agua, internet, seguro, limpieza, material.`,
    });
  }
  return state;
}

function isFirstBusinessDayOfMonth(state) {
  const d = gameDate(state);
  if (d.getUTCDate() > 5) return false;
  // Simplificado: si es día 1–3 y laborable
  return d.getUTCDate() <= 3;
}

/**
 * Impuestos trimestrales simplificados pero “completos” en el sentido de juego:
 * IRPF/retenciones + IVA estimado sobre comisiones.
 */
export function maybeApplyTaxes(state) {
  const d = gameDate(state);
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  // 20 de enero, abril, julio, octubre
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
    text: `Impuestos trimestrales: ${formatEuro(total)} (IVA ${formatEuro(iva)} + IRPF ${formatEuro(irpf)})`,
  });
  return state;
}

/** Resumen de cierre del día */
export function buildDayCloseSummary(state) {
  const drawer = drawerTotalCents(state.finance.drawer);
  return {
    date: gameYmd(state),
    salesCents: state.finance.daySalesCents,
    commissionCents: state.finance.dayCommissionCents,
    prizesPaidCents: state.finance.dayPrizesPaidCents,
    expensesCents: state.finance.dayExpensesCents,
    drawerCents: drawer,
    bankCents: state.finance.bankCents,
    customersServed: state.customers.servedToday,
    nextDay: nextBusinessDayStart(state).toISOString().slice(0, 10),
    nextDayReasonSkip: peekSkipReason(state),
  };
}

function peekSkipReason(state) {
  // Info si se saltan días
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

/** Ejecuta cierre: balance, gastos, salto al siguiente laborable 08:00 */
export function closeDay(state) {
  applyDailyExpenses(state);
  maybeApplyTaxes(state);

  const summary = buildDayCloseSummary(state);
  state.stats.daysPlayed += 1;

  // Reset día
  state.finance.daySalesCents = 0;
  state.finance.dayCommissionCents = 0;
  state.finance.dayPrizesPaidCents = 0;
  state.finance.dayExpensesCents = 0;
  state.customers.servedToday = 0;
  state.customers.current = null;
  state.customers.queue = [];
  state.dayLog = [];

  // Reponer fondo de cambio si hace falta (simplificado: avisar)
  const float = drawerTotalCents(state.finance.drawer);
  if (float < state.finance.floatTargetCents * 0.5) {
    const need = state.finance.floatTargetCents - float;
    const take = Math.min(need, state.finance.bankCents);
    state.finance.bankCents -= take;
    // Reponer de forma simple: reset a float por defecto y ajustar banco
    state.finance.drawer = defaultFloatDrawer();
    state.ui.toast = `Fondo de caja repuesto desde el banco (${formatEuro(take)}).`;
  }

  // Saltar al siguiente día laborable 08:00
  const next = nextBusinessDayStart(state);
  state.clock.gameTimeMs = next.getTime();
  state.clock.lastRealMs = Date.now();
  state.office.isOpen = true;
  state.office.openedToday = true;

  processArrivingOrders(state);

  state.customers.nextSpawnAtMs = state.clock.gameTimeMs + 2 * 60 * 1000;
  state.ui.screen = 'counter';
  state.ui.lastCloseSummary = summary;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Nuevo día en ${OFFICE.businessName}. ${closedReason(state) ? 'Cerrado: ' + closedReason(state) : 'Oficina abierta 08:00–20:00.'}`,
  });

  return { state, summary };
}
