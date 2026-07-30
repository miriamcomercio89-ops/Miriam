import {
  drawerTotalCents,
  makeChange,
  removeFromDrawer,
  addToDrawer,
  emptyDrawer,
  ALL_DENOMS,
  formatEuro,
} from '../data/money.js';

/** Cajón virtual abundante para componer retiradas del banco. */
function bankVaultDrawer() {
  const d = emptyDrawer();
  for (const x of ALL_DENOMS) d[x.id] = 500;
  return d;
}

/** Llevar efectivo de caja al banco. */
export function depositCashToBank(state, amountCents) {
  const amt = Math.max(0, Math.round(amountCents));
  if (amt <= 0) {
    state.ui.toast = 'Importe no válido';
    return false;
  }
  if (drawerTotalCents(state.finance.drawer) < amt) {
    state.ui.toast = 'No hay tanto efectivo en caja';
    return false;
  }
  const give = makeChange(state.finance.drawer, amt);
  if (!give) {
    state.ui.toast = 'No se puede componer ese importe con las denominaciones de caja';
    return false;
  }
  const next = removeFromDrawer(state.finance.drawer, give);
  if (!next) return false;
  state.finance.drawer = next;
  state.finance.bankCents += amt;
  state.finance.ledger.push({
    id: `dep-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'bank-deposit',
    label: 'Ingreso caja → banco',
    totalCents: amt,
  });
  state.dayLog.push({ at: state.clock.gameTimeMs, text: `Ingreso a banco: ${formatEuro(amt)}` });
  state.ui.toast = `Ingresados ${formatEuro(amt)} al banco`;
  return true;
}

/** Retirar del banco a caja (pedir cambio). */
export function withdrawBankToCash(state, amountCents) {
  const amt = Math.max(0, Math.round(amountCents));
  if (amt <= 0) {
    state.ui.toast = 'Importe no válido';
    return false;
  }
  if (state.finance.bankCents < amt) {
    state.ui.toast = 'Saldo de banco insuficiente';
    return false;
  }
  const give = makeChange(bankVaultDrawer(), amt);
  if (!give) {
    state.ui.toast = 'No se pudo preparar el cambio';
    return false;
  }
  state.finance.bankCents -= amt;
  state.finance.drawer = addToDrawer(state.finance.drawer, give);
  state.finance.ledger.push({
    id: `wd-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'bank-withdraw',
    label: 'Retirada banco → caja (cambio)',
    totalCents: -amt,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Retirada a caja (cambio): ${formatEuro(amt)}`,
  });
  state.ui.toast = `Cambio recibido: ${formatEuro(amt)}`;
  return true;
}
