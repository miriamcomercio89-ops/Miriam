import type { WorldEvent } from '../types'
import { dayOfYear } from './economyCore'

/** Fiestas fijas del año (día del año 0-364) */
export const HOLIDAY_DEFS: Omit<WorldEvent, 'daysRemaining' | 'startedAtDay' | 'id'>[] = [
  {
    title: 'Navidad global',
    description: 'Muchas reservas de fin de año. Suben precios y ocupación.',
    demandMultiplier: 1.22,
    costMultiplier: 1.08,
    scope: 'global',
    dayFrom: 349,
    dayTo: 364,
  },
  {
    title: 'Año Nuevo',
    description: 'Fiestas y viajes cortos en casi todo el mundo.',
    demandMultiplier: 1.18,
    costMultiplier: 1.1,
    scope: 'global',
    dayFrom: 0,
    dayTo: 5,
  },
  {
    title: 'San Valentín',
    description: 'Parejas reservan escapadas románticas.',
    demandMultiplier: 1.12,
    costMultiplier: 1.03,
    scope: 'global',
    dayFrom: 44,
    dayTo: 46,
  },
  {
    title: 'Semana de puentes',
    description: 'Viajes cortos en Europa.',
    demandMultiplier: 1.14,
    costMultiplier: 1.04,
    scope: 'europe',
    dayFrom: 120,
    dayTo: 130,
  },
  {
    title: 'Verano mediterráneo',
    description: 'Pico fuerte de playa en el Mediterráneo.',
    demandMultiplier: 1.2,
    costMultiplier: 1.07,
    scope: 'med',
    dayFrom: 170,
    dayTo: 230,
  },
  {
    title: 'Carnaval caribeño',
    description: 'Fiestas y hoteles llenos en el Caribe.',
    demandMultiplier: 1.25,
    costMultiplier: 1.09,
    scope: 'caribbean',
    dayFrom: 40,
    dayTo: 55,
  },
  {
    title: 'Festival de luces Asia',
    description: 'Turismo cultural alto en Asia oriental.',
    demandMultiplier: 1.16,
    costMultiplier: 1.05,
    scope: 'eastasia',
    dayFrom: 300,
    dayTo: 320,
  },
]

export function activeHolidays(gameMinutes: number): Omit<WorldEvent, 'daysRemaining' | 'startedAtDay'>[] {
  const d = dayOfYear(gameMinutes)
  return HOLIDAY_DEFS.filter((h) => {
    if (h.dayFrom == null || h.dayTo == null) return false
    if (h.dayFrom <= h.dayTo) return d >= h.dayFrom && d <= h.dayTo
    return d >= h.dayFrom || d <= h.dayTo
  }).map((h) => ({ ...h, id: `holiday-${h.title}` }))
}

export function holidayDemandMult(gameMinutes: number, geoRegion: string, countryCode: string): number {
  let m = 1
  for (const h of activeHolidays(gameMinutes)) {
    if (h.scope === 'global' || h.scope === geoRegion || h.scope === countryCode.toLowerCase()) {
      m *= h.demandMultiplier
    }
  }
  return m
}

export function holidayCostMult(gameMinutes: number, geoRegion: string, countryCode: string): number {
  let m = 1
  for (const h of activeHolidays(gameMinutes)) {
    if (h.scope === 'global' || h.scope === geoRegion || h.scope === countryCode.toLowerCase()) {
      m *= h.costMultiplier
    }
  }
  return m
}
