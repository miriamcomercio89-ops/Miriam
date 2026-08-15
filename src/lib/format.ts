export function formatEUR(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)} mil M€`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)} M€`
  if (abs >= 10_000) return `${sign}${(abs / 1000).toFixed(1)} k€`
  return `${sign}${abs.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('es-ES')
}

export function gameDate(day: number): string {
  const start = Date.UTC(2026, 8, 1)
  const d = new Date(start + (day - 1) * 86400000)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}
