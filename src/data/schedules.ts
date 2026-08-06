import type { TransitLine } from './types';
import { frequencyMultiplier, periodFromMinutes, type DayPeriod } from './time';

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(mins: number): string {
  const m = ((Math.floor(mins) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function effectiveFrequency(line: TransitLine, simMinutes: number): number {
  const period = periodFromMinutes(simMinutes);
  const mult = frequencyMultiplier(period, line.mode);
  // Nocturnos (N*) solo tienen sentido de noche; de día mantienen intervalo largo
  if (line.busFamily === 'N' && period !== 'noche') {
    return Math.max(line.frequencyMin, 45);
  }
  return Math.max(2, Math.round(line.frequencyMin * mult));
}

/** Próximas salidas a partir del reloj simulado */
export function generateSchedule(
  line: TransitLine,
  simMinutes: number,
  count = 12,
): string[] {
  if (line.status === 'suspendida') return [];

  const start = parseTime(line.firstDeparture);
  const end = parseTime(line.lastDeparture);
  const freq = effectiveFrequency(line, simMinutes);
  const nowMins = Math.floor(simMinutes);
  const crossesMidnight = end <= start;

  const dayTimes: number[] = [];
  if (crossesMidnight) {
    for (let t = start; t < 24 * 60; t += freq) dayTimes.push(t);
    for (let t = 0; t <= end; t += freq) dayTimes.push(t);
  } else {
    for (let t = start; t <= end; t += freq) dayTimes.push(t);
  }

  // Ajuste por retrasos/obras: desplazar salidas
  const slip = line.status === 'retrasos' ? 5 : line.status === 'obras' ? 10 : 0;
  const adjusted = dayTimes.map((t) => (t + slip) % (24 * 60));

  const upcoming = adjusted.filter((t) => t >= nowMins);
  const result = [...upcoming];
  if (result.length < count) {
    for (const t of adjusted) {
      result.push(t);
      if (result.length >= count) break;
    }
  }
  return result.slice(0, count).map(formatTime);
}

export function nextDepartures(line: TransitLine, simMinutes: number, n = 3): string[] {
  return generateSchedule(line, simMinutes, n);
}

/** Minutos hasta la próxima salida (null si suspendida / fuera de servicio largo) */
export function minutesUntilNext(line: TransitLine, simMinutes: number): number | null {
  const next = generateSchedule(line, simMinutes, 1)[0];
  if (!next) return null;
  const nextMins = parseTime(next);
  const now = Math.floor(simMinutes);
  let diff = nextMins - now;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export function delayLabel(line: TransitLine): string | null {
  if (line.status === 'normal') return null;
  if (line.status === 'suspendida') return 'Sin servicio';
  if (line.status === 'obras') return '+8–12 min';
  return '+4–7 min';
}

export function formatCountdown(mins: number | null): string {
  if (mins == null) return '—';
  if (mins <= 0) return 'En andén';
  if (mins === 1) return '1 min';
  return `${mins} min`;
}

export function periodLabel(simMinutes: number): DayPeriod {
  return periodFromMinutes(simMinutes);
}
