/** Medianoche UTC del 1 de enero de 2026: día 1 del juego. */
export const GAME_START_UTC = Date.UTC(2026, 0, 1)
export const GAME_START_LABEL = '1 de enero de 2026'

export function formatEUR(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(2)} mil M€`
  }
  if (compact && Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)} M€`
  }
  if (compact && Math.abs(n) >= 1_000) {
    return `${(n / 1_000).toFixed(1)} mil €`
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`
}

/** Fecha/hora del juego a partir de minutos (día 1 = 1 ene 2026). */
export function gameDateFromMinutes(gameMinutes: number): Date {
  return new Date(GAME_START_UTC + Math.max(0, gameMinutes) * 60_000)
}

/** Fecha civil del día absoluto del juego (día 1 = 1 ene 2026). */
export function gameDateFromDay(day: number): Date {
  const d = Math.max(1, Math.floor(day))
  return new Date(GAME_START_UTC + (d - 1) * 24 * 60 * 60_000)
}

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Fecha corta: «1 ene 2026». */
export function formatGameDay(day: number): string {
  return dateFmt.format(gameDateFromDay(day))
}

/** Reloj principal: «1 ene 2026 · 08:00». */
export function formatGameStamp(gameMinutes: number): string {
  const d = gameDateFromMinutes(gameMinutes)
  const hour = d.getUTCHours()
  const minute = d.getUTCMinutes()
  return `${dateFmt.format(d)} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function gameDay(gameMinutes: number): number {
  return Math.floor(gameMinutes / (60 * 24)) + 1
}
