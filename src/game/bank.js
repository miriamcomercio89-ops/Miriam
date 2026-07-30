import {
  drawerTotalCents,
  makeChange,
  removeFromDrawer,
  addToDrawer,
  emptyDrawer,
  ALL_DENOMS,
  countTotalCents,
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

/**
 * Retirar del banco a caja.
 * countsOverride: { b5:2, e2:5, ... } — si se pasa, debe cuadrar con amountCents.
 */
export function withdrawBankToCash(state, amountCents, countsOverride = null) {
  const amt = Math.max(0, Math.round(amountCents));
  if (amt <= 0) {
    state.ui.toast = 'Importe no válido';
    return false;
  }
  if (state.finance.bankCents < amt) {
    state.ui.toast = 'Saldo de banco insuficiente';
    return false;
  }

  let give;
  if (countsOverride && typeof countsOverride === 'object') {
    const cleaned = emptyDrawer();
    for (const d of ALL_DENOMS) {
      cleaned[d.id] = Math.max(0, Math.floor(Number(countsOverride[d.id]) || 0));
    }
    const sum = countTotalCents(cleaned);
    if (sum !== amt) {
      state.ui.toast = `Las denominaciones suman ${formatEuro(sum)}, no ${formatEuro(amt)}`;
      return false;
    }
    if (sum <= 0) {
      state.ui.toast = 'Elige al menos una denominación';
      return false;
    }
    give = cleaned;
  } else {
    give = makeChange(bankVaultDrawer(), amt);
    if (!give) {
      state.ui.toast = 'No se pudo preparar el cambio';
      return false;
    }
  }

  state.finance.bankCents -= amt;
  state.finance.drawer = addToDrawer(state.finance.drawer, give);
  const parts = ALL_DENOMS.filter((d) => give[d.id] > 0)
    .map((d) => `${give[d.id]}×${d.label}`)
    .join(', ');
  state.finance.ledger.push({
    id: `wd-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'bank-withdraw',
    label: 'Retirada banco → caja (cambio)',
    totalCents: -amt,
    denoms: { ...give },
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Retirada a caja: ${formatEuro(amt)}${parts ? ` · ${parts}` : ''}`,
  });
  state.ui.toast = `Cambio recibido: ${formatEuro(amt)}${parts ? ` (${parts})` : ''}`;
  return true;
}
