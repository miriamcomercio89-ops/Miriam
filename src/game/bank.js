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
import { gameYmd } from './time.js';
import { isMonday } from './audit.js';

/** Fondo de cambio típico del lunes (monedas + billetes pequeños). */
export const MONDAY_FLOAT_COUNTS = {
  b5: 10,
  b10: 6,
  b20: 4,
  b50: 0,
  b100: 0,
  b200: 0,
  b500: 0,
  e2: 25,
  e1: 30,
  c50: 25,
  c20: 30,
  c10: 35,
  c5: 40,
  c2: 50,
  c1: 50,
};

export function mondayFloatCents() {
  return countTotalCents(MONDAY_FLOAT_COUNTS);
}

export function mondayFloatDoneToday(state) {
  return state.ui?.mondayFloatYmd === gameYmd(state);
}

/**
 * Retirada de fondo de cambio del lunes: monedas concretas del banco a caja.
 * Una vez por lunes.
 */
export function withdrawMondayFloat(state) {
  if (!isMonday(state)) {
    state.ui.toast = 'El fondo de cambio programado es los lunes.';
    return false;
  }
  if (mondayFloatDoneToday(state)) {
    state.ui.toast = 'Ya retiraste el fondo de cambio de este lunes.';
    return false;
  }
  const amt = mondayFloatCents();
  const ok = withdrawBankToCash(state, amt, { ...emptyDrawer(), ...MONDAY_FLOAT_COUNTS });
  if (ok) {
    state.ui.mondayFloatYmd = gameYmd(state);
    state.ui.toast = `Fondo de cambio del lunes: ${formatEuro(amt)} en monedas y billetes pequeños.`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Fondo de cambio lunes: ${formatEuro(amt)}`,
    });
  }
  return ok;
}

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
