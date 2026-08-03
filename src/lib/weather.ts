import type { SeasonName, WeatherInfo } from '../types'
import { dayOfYear } from './economyCore'

export function getWeather(lat: number, gameMinutes: number, hotelId: string): WeatherInfo {
  const d = dayOfYear(gameMinutes)
  const a = Math.abs(lat)
  const n = hash(hotelId + String(d))
  const seasonWarm = (lat >= 0 && d >= 120 && d <= 270) || (lat < 0 && (d < 60 || d > 300))

  if (a < 20) {
    if (n < 0.15) return { label: 'Tormenta tropical', detail: 'Lluvia fuerte. Menos ganas de salir.', demandMult: 0.88, costMult: 1.08 }
    if (n < 0.55) return { label: 'Soleado y húmedo', detail: 'Buen día de playa y piscina.', demandMult: 1.08, costMult: 1.04 }
    return { label: 'Nubes cálidas', detail: 'Calor suave con nubes.', demandMult: 1.02, costMult: 1.01 }
  }

  if (seasonWarm) {
    if (n < 0.12) return { label: 'Ola de calor', detail: 'Mucho calor. Sube el aire acondicionado.', demandMult: 1.05, costMult: 1.12 }
    if (n < 0.25) return { label: 'Lluvia de verano', detail: 'Chubascos. Algo menos de ocupación.', demandMult: 0.94, costMult: 1.03 }
    if (n < 0.7) return { label: 'Soleado', detail: 'Día claro, ideal para turismo.', demandMult: 1.1, costMult: 1.02 }
    return { label: 'Viento suave', detail: 'Buen tiempo con algo de viento.', demandMult: 1.03, costMult: 1.01 }
  }

  if (n < 0.18) return { label: 'Frío intenso', detail: 'Poca gente en la calle. Más calefacción.', demandMult: 0.86, costMult: 1.1 }
  if (n < 0.4) return { label: 'Lluvia fría', detail: 'Día gris. Más spa y restaurante.', demandMult: 0.92, costMult: 1.05 }
  if (n < 0.75) return { label: 'Nublado fresco', detail: 'Tiempo normal de temporada baja.', demandMult: 0.98, costMult: 1.02 }
  return { label: 'Soleado fresco', detail: 'Buen día para pasear.', demandMult: 1.04, costMult: 1.01 }
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return ((h >>> 0) % 1000) / 1000
}

export function seasonWord(s: SeasonName): string {
  if (s === 'alta') return 'Temporada alta'
  if (s === 'media') return 'Temporada media'
  return 'Temporada baja'
}
