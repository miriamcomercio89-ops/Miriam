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

/** Genera horarios simulados para el día (hacia ida). */
export function generateSchedule(line: TransitLine, count = 12): string[] {
  const start = parseTime(line.firstDeparture);
  const end = parseTime(line.lastDeparture);
  const freq = line.frequencyMin;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const times: number[] = [];
  let t = start;

  // Si last < first, cruza medianoche
  const crossesMidnight = end < start;

  while (times.length < 80) {
    times.push(t);
    t += freq;
    if (!crossesMidnight && t > end) break;
    if (crossesMidnight) {
      const norm = t % (24 * 60);
      if (t > start + 24 * 60) break;
      if (norm > end && norm < start && t > start + freq) {
        // still in service overnight until end
      }
      if (t % (24 * 60) === end || (t > 24 * 60 && (t % (24 * 60)) > end)) break;
    }
  }

  // Próximas salidas desde "ahora"
  const upcoming = times
    .map((mins) => {
      let abs = mins;
      if (abs < nowMins - 60) abs += 24 * 60;
      return abs;
    })
    .filter((mins) => mins >= nowMins - 2)
    .slice(0, count)
    .map(formatTime);

  if (upcoming.length === 0) {
    return times.slice(0, count).map(formatTime);
  }
  return upcoming;
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
