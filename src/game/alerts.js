import { drawerTotalCents, formatEuro } from '../data/money.js';
import { gameDate, gameYmd } from './time.js';

/** Umbral de caja baja (por defecto mitad del float objetivo o 80 €). */
export function lowCashThreshold(state) {
  const target = state.finance.floatTargetCents || 16000;
  return Math.max(8000, Math.round(target * 0.45));
}

/** Aviso a media mañana si la caja está baja (una vez al día). */
export function maybeLowCashAlert(state) {
  if (!state?.office?.isOpen) return false;
  const d = gameDate(state);
  const hour = d.getUTCHours();
  if (hour < 10 || hour >= 14) return false;
  const ymd = gameYmd(state);
  if (state.ui.lowCashAlertYmd === ymd) return false;
  const total = drawerTotalCents(state.finance.drawer);
  const thr = lowCashThreshold(state);
  if (total >= thr) return false;
  state.ui.lowCashAlertYmd = ymd;
  state.ui.lowCashAlert = {
    at: state.clock.gameTimeMs,
    drawerCents: total,
    thresholdCents: thr,
  };
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `⚠ Caja baja: ${formatEuro(total)} (umbral ${formatEuro(thr)}). Considera retirar cambio del banco.`,
  });
  state.ui.toast = `Caja baja: ${formatEuro(total)}. Ve a Caja ↔ banco.`;
  return true;
}

export function dismissLowCashAlert(state) {
  if (state.ui) state.ui.lowCashAlert = null;
  return state;
}
