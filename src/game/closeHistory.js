/** Histórico de cierres (últimos N días). */

export const CLOSE_HISTORY_MAX = 14;

export function ensureCloseHistory(state) {
  if (!Array.isArray(state.closeHistory)) state.closeHistory = [];
  return state;
}

export function pushCloseSummary(state, summary) {
  ensureCloseHistory(state);
  state.closeHistory.unshift({
    date: summary.date,
    salesCents: summary.salesCents,
    commissionCents: summary.commissionCents,
    profitCents: summary.profitCents,
    prizesPaidCents: summary.prizesPaidCents,
    expensesCents: summary.expensesCents,
    customersServed: summary.customersServed,
    bankCents: summary.bankCents,
    drawerCents: summary.drawerCents,
    nextDay: summary.nextDay,
    settlement: summary.settlement
      ? {
          laeRemit: summary.settlement.lae?.remittance || 0,
          onceRemit: summary.settlement.once?.remittance || 0,
          otrosRemit: summary.settlement.otros?.remittance || 0,
        }
      : null,
  });
  if (state.closeHistory.length > CLOSE_HISTORY_MAX) {
    state.closeHistory.length = CLOSE_HISTORY_MAX;
  }
  return state;
}

export function recentCloses(state, n = 7) {
  ensureCloseHistory(state);
  return state.closeHistory.slice(0, n);
}
