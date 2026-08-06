import type { TransitLine } from './types';

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(mins: number): string {
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** Genera próximas salidas simuladas a partir de la hora actual. */
export function generateSchedule(line: TransitLine, count = 12): string[] {
  const start = parseTime(line.firstDeparture);
  const end = parseTime(line.lastDeparture);
  const freq = Math.max(1, line.frequencyMin);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const crossesMidnight = end <= start;

  const dayTimes: number[] = [];
  if (crossesMidnight) {
    for (let t = start; t < 24 * 60; t += freq) dayTimes.push(t);
    for (let t = 0; t <= end; t += freq) dayTimes.push(t);
  } else {
    for (let t = start; t <= end; t += freq) dayTimes.push(t);
  }

  const todayUpcoming = dayTimes.filter((t) => t >= nowMins);
  const result = [...todayUpcoming];

  if (result.length < count) {
    // Continuar con el ciclo del día siguiente
    for (const t of dayTimes) {
      result.push(t);
      if (result.length >= count) break;
    }
  }

  return result.slice(0, count).map(formatTime);
}

export function nextDepartures(line: TransitLine, n = 3): string[] {
  return generateSchedule(line, n);
}

export function delayLabel(line: TransitLine): string | null {
  if (line.status === 'normal') return null;
  if (line.status === 'suspendida') return 'Sin servicio';
  if (line.status === 'obras') return '+8–12 min';
  return '+4–7 min';
}

export function simulatedClock(): string {
  const d = new Date();
  return formatTime(d.getHours() * 60 + d.getMinutes());
}
