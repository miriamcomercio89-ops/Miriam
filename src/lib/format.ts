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

export function formatGameStamp(gameMinutes: number): string {
  const totalHours = Math.floor(gameMinutes / 60)
  const day = Math.floor(totalHours / 24) + 1
  const hour = totalHours % 24
  const minute = Math.floor(gameMinutes % 60)
  return `Día ${day} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function gameDay(gameMinutes: number): number {
  return Math.floor(gameMinutes / (60 * 24)) + 1
}
