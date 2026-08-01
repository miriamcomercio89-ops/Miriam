/** Shared pure helpers used by main thread and worker (no DOM). */
export type SeasonName = 'alta' | 'media' | 'baja'

export function dayOfYear(gameMinutes: number): number {
  const dayIndex = Math.floor(gameMinutes / (60 * 24))
  return ((dayIndex % 365) + 365) % 365
}

export function getSeason(lat: number, gameMinutes: number): SeasonName {
  const d = dayOfYear(gameMinutes)
  let north: SeasonName
  if (d >= 152 && d <= 243) north = 'alta'
  else if ((d >= 59 && d <= 151) || (d >= 244 && d <= 333)) north = 'media'
  else north = 'baja'
  if (lat < 0) {
    if (north === 'alta') return 'baja'
    if (north === 'baja') return 'alta'
  }
  return north
}

export function seasonDemandMult(s: SeasonName): number {
  if (s === 'alta') return 1.16
  if (s === 'media') return 1.0
  return 0.84
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function pseudoNoise(id: string, salt: number): number {
  let h = salt | 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}

export function reputationKey(countryCode: string): string {
  return (countryCode || 'XX').toUpperCase()
}
