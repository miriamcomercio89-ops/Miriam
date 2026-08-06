export type DayPeriod = 'punta' | 'valle' | 'noche';

export const PERIOD_LABELS: Record<DayPeriod, string> = {
  punta: 'Hora punta',
  valle: 'Hora valle',
  noche: 'Nocturno',
};

/** Minutos desde medianoche → periodo operativo realista (costa sur) */
export function periodFromMinutes(mins: number): DayPeriod {
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = m / 60;
  // Punta mañana 7–9:30, mediodía 13:30–15:30, tarde 18–20:30
  if ((h >= 7 && h < 9.5) || (h >= 13.5 && h < 15.5) || (h >= 18 && h < 20.5)) {
    return 'punta';
  }
  // Noche / madrugada
  if (h >= 23 || h < 5.5) return 'noche';
  return 'valle';
}

/** Multiplicador de intervalo (1 = frecuencia base). Punta = más frecuente. */
export function frequencyMultiplier(period: DayPeriod, mode: string): number {
  if (period === 'punta') {
    if (mode === 'metro' || mode === 'tranvia') return 0.65;
    if (mode === 'bus') return 0.75;
    if (mode === 'cercanias') return 0.85;
    return 0.8;
  }
  if (period === 'noche') {
    if (mode === 'metro') return 1.8;
    if (mode === 'bus') return 2.2;
    if (mode === 'tranvia') return 2.0;
    if (mode === 'cercanias') return 2.5;
    return 2.0;
  }
  return 1;
}

/** Ocupación estimada 0–100 según periodo */
export function occupancyForPeriod(base: number, period: DayPeriod): number {
  const factor = period === 'punta' ? 1.35 : period === 'noche' ? 0.45 : 0.85;
  return Math.max(5, Math.min(98, Math.round(base * factor)));
}

export function formatClock(mins: number): string {
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function parseClock(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}
