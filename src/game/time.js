import { OFFICE } from './state.js';
import { isHoliday, holidayName } from '../data/holidays.js';

/**
 * Escala base: 1 segundo real = 1 minuto de juego
 * (= 1 minuto real = 1 hora de juego).
 * (1_000 ms reales → 60_000 ms de juego → factor 60)
 * speed multiplica: 1 normal, 2 rápido, 4 muy rápido.
 */
export const BASE_SCALE = 60;

export function advanceClock(state, nowRealMs = Date.now()) {
  const clock = state.clock;
  if (clock.paused || clock.speed === 0) {
    clock.lastRealMs = nowRealMs;
    return state;
  }
  const elapsed = Math.max(0, nowRealMs - clock.lastRealMs);
  const gameDelta = elapsed * BASE_SCALE * clock.speed;
  clock.gameTimeMs += gameDelta;
  clock.lastRealMs = nowRealMs;
  return state;
}

export function setSpeed(state, speed) {
  // speed: 0 pausa, 1 normal, 2 rápido, 4 muy rápido
  state.clock.speed = speed;
  state.clock.paused = speed === 0;
  state.clock.lastRealMs = Date.now();
  return state;
}

export function togglePause(state) {
  if (state.clock.paused) {
    state.clock.paused = false;
    if (state.clock.speed === 0) state.clock.speed = 1;
  } else {
    state.clock.paused = true;
  }
  state.clock.lastRealMs = Date.now();
  return state;
}

export function gameDate(state) {
  return new Date(state.clock.gameTimeMs);
}

export function gameYmd(state) {
  return gameDate(state).toISOString().slice(0, 10);
}

export function formatGameDateTime(state) {
  const d = gameDate(state);
  return d.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatGameClock(state) {
  const d = gameDate(state);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function weekdayName(state) {
  const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return names[gameDate(state).getUTCDay()];
}

export function isWeekend(state) {
  const day = gameDate(state).getUTCDay();
  return day === 0 || day === 6;
}

export function isClosedDay(state) {
  if (isWeekend(state)) return true;
  return isHoliday(gameYmd(state), state.holidays);
}

export function closedReason(state) {
  if (isWeekend(state)) {
    return gameDate(state).getUTCDay() === 6 ? 'Sábado' : 'Domingo';
  }
  const name = holidayName(gameYmd(state), state.holidays);
  if (name) return `Festivo: ${name}`;
  return null;
}

export function isOpenHours(state) {
  if (isClosedDay(state)) return false;
  const h = gameDate(state).getUTCHours() + gameDate(state).getUTCMinutes() / 60;
  return h >= OFFICE.openHour && h < OFFICE.closeHour;
}

/** Siguiente día laborable a las 08:00 */
export function nextBusinessDayStart(state) {
  const d = gameDate(state);
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(OFFICE.openHour, 0, 0, 0);
  let guard = 0;
  while (guard++ < 370) {
    const ymd = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const closed = dow === 0 || dow === 6 || isHoliday(ymd, state.holidays);
    if (!closed) break;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

export function speedLabel(speed, paused) {
  if (paused || speed === 0) return 'Pausa';
  if (speed === 1) return 'Normal (1 s = 1 min)';
  if (speed === 2) return 'Rápido (1 s = 2 min)';
  if (speed === 4) return 'Muy rápido (1 s = 4 min)';
  // Compat saves antiguos
  if (speed === 15) return 'Rápido';
  if (speed === 60) return 'Muy rápido';
  return `${speed}×`;
}

/** Normaliza velocidades antiguas (15/60) a 2/4 */
export function normalizeSpeed(speed) {
  if (speed === 15) return 2;
  if (speed === 60) return 4;
  if (speed === 0 || speed === 1 || speed === 2 || speed === 4) return speed;
  return 1;
}
