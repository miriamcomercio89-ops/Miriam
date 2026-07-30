import {
  ALL_DENOMS,
  BILLS,
  COINS,
  countTotalCents,
  drawerTotalCents,
  emptyDrawer,
  formatEuro,
  defaultFloatDrawer,
} from '../data/money.js';
import { gameDate, gameYmd } from './time.js';

/**
 * Arqueo guiado: el jugador cuenta billetes/monedas.
 */
export function startArqueo(state, kind = 'close') {
  state.ui.arqueo = {
    kind, // open | close
    counted: emptyDrawer(),
    step: 'count',
    message: null,
  };
  state.ui.screen = 'arqueo';
  return state;
}

export function adjustArqueoCount(state, denomId, delta) {
  const a = state.ui.arqueo;
  if (!a) return state;
  a.counted[denomId] = Math.max(0, (a.counted[denomId] || 0) + delta);
  a.message = null;
  return state;
}

export function confirmArqueo(state) {
  const a = state.ui.arqueo;
  if (!a) return state;
  const expected = drawerTotalCents(state.finance.drawer);
  const counted = countTotalCents(a.counted);
  const diff = counted - expected;

  a.result = { expected, counted, diff };
  a.step = 'result';

  if (diff === 0) {
    a.message = 'Arqueo correcto. La caja cuadra.';
    state.finance.changeErrorsToday = state.finance.changeErrorsToday || 0;
  } else if (diff < 0) {
    // Faltante
    state.finance.changeErrorsToday = (state.finance.changeErrorsToday || 0) + 1;
    state.finance.bankCents += diff; // restar del banco (diff negativo)
    state.finance.dayShortageCents = (state.finance.dayShortageCents || 0) + Math.abs(diff);
    state.finance.ledger.push({
      id: `short-${Date.now()}`,
      at: state.clock.gameTimeMs,
      type: 'shortage',
      label: `Faltante de caja (${a.kind})`,
      totalCents: diff,
    });
    a.message = `Faltante de ${formatEuro(Math.abs(diff))}. Se ajusta del banco. Aviso sin cerrar el negocio.`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Faltante de caja: ${formatEuro(Math.abs(diff))} (${a.kind})`,
    });
  } else {
    // Sobrante: se ingresa a banco
    state.finance.bankCents += diff;
    a.message = `Sobra ${formatEuro(diff)}. Se ingresa en el banco.`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Sobrante de caja: ${formatEuro(diff)}`,
    });
  }

  // Tras arqueo de apertura, opcionalmente reponer float si vacío
  if (a.kind === 'open' && expected < 1000) {
    state.finance.drawer = defaultFloatDrawer();
  }

  return state;
}

export function closeArqueo(state) {
  const kind = state.ui.arqueo?.kind;
  state.ui.arqueo = null;
  if (kind === 'close') state.ui.screen = 'close';
  else state.ui.screen = 'counter';
  return state;
}

/** Extracto semanal de beneficio */
export function buildWeeklyStatement(state) {
  const now = gameDate(state);
  const weekAgo = new Date(now.getTime());
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const fromMs = weekAgo.getTime();

  let sales = 0;
  let commission = 0;
  let prizes = 0;
  let expenses = 0;
  let shortage = 0;
  let settlements = 0;

  for (const e of state.finance.ledger || []) {
    if (e.at < fromMs) continue;
    if (e.type === 'sale') {
      sales += e.totalCents || 0;
      commission += e.commissionCents || 0;
    } else if (e.type === 'prize') prizes += e.totalCents || 0;
    else if (e.type === 'expense') expenses += Math.abs(e.totalCents || 0);
    else if (e.type === 'shortage') shortage += Math.abs(e.totalCents || 0);
    else if (e.type === 'settlement') settlements += 1;
  }

  return {
    fromYmd: weekAgo.toISOString().slice(0, 10),
    toYmd: gameYmd(state),
    sales,
    commission,
    prizes,
    expenses,
    shortage,
    settlements,
    net: commission - expenses - shortage,
  };
}

export function isMonday(state) {
  return gameDate(state).getUTCDay() === 1;
}

export { BILLS, COINS, ALL_DENOMS, formatEuro, drawerTotalCents, countTotalCents };
