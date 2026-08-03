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
  {
    title: 'Semana Santa',
    description: 'Vacaciones de Pascua: viajes culturales y de playa.',
    demandMultiplier: 1.18,
    costMultiplier: 1.06,
    scope: 'europe',
    dayFrom: 85,
    dayTo: 100,
  },
  {
    title: 'Semana Santa mediterránea',
    description: 'Puente largo en el Mediterráneo: hoteles y costas llenas.',
    demandMultiplier: 1.2,
    costMultiplier: 1.07,
    scope: 'med',
    dayFrom: 85,
    dayTo: 100,
  },
  {
    title: 'Verano Américas',
    description: 'Vacaciones escolares y turismo familiar en América.',
    demandMultiplier: 1.16,
    costMultiplier: 1.05,
    scope: 'americas',
    dayFrom: 165,
    dayTo: 230,
  },
  {
    title: 'Golden Week',
    description: 'Semana dorada: muchos viajes internos en Asia oriental.',
    demandMultiplier: 1.22,
    costMultiplier: 1.08,
    scope: 'eastasia',
    dayFrom: 115,
    dayTo: 125,
  },
  {
    title: 'Midsummer',
    description: 'Noches blancas y escapadas nórdicas / europeas.',
    demandMultiplier: 1.15,
    costMultiplier: 1.04,
    scope: 'europe',
    dayFrom: 165,
    dayTo: 175,
  },
  {
    title: 'Diwali',
    description: 'Festival de luces: turismo y viajes familiares en India y SE Asia.',
    demandMultiplier: 1.17,
    costMultiplier: 1.05,
    scope: 'seasia',
    dayFrom: 295,
    dayTo: 310,
  },
  {
    title: 'Diwali India',
    description: 'Festival de luces y viajes familiares en India.',
    demandMultiplier: 1.18,
    costMultiplier: 1.05,
    scope: 'in',
    dayFrom: 295,
    dayTo: 310,
  },
  {
    title: 'Thanksgiving USA',
    description: 'Fin de semana largo de Acción de Gracias en Estados Unidos.',
    demandMultiplier: 1.2,
    costMultiplier: 1.06,
    scope: 'us',
    dayFrom: 325,
    dayTo: 332,
  },
  {
    title: 'Ramadán',
    description: 'Temporada especial en Oriente Medio: ritmo distinto y viajes familiares.',
    demandMultiplier: 1.1,
    costMultiplier: 1.04,
    scope: 'mideast',
    dayFrom: 70,
    dayTo: 100,
  },
  {
    title: 'Año Nuevo chino',
    description: 'Gran movilidad en Asia oriental a inicios de año.',
    demandMultiplier: 1.24,
    costMultiplier: 1.1,
    scope: 'eastasia',
    dayFrom: 20,
    dayTo: 35,
  },
  {
    title: 'Carnaval de Brasil',
    description: 'Fiestas masivas y hoteles llenos en Brasil y América.',
    demandMultiplier: 1.28,
    costMultiplier: 1.12,
    scope: 'americas',
    dayFrom: 40,
    dayTo: 55,
  },
  {
    title: 'Vuelta al cole',
    description: 'Fin de verano europeo: última ola de viajes antes del curso.',
    demandMultiplier: 1.12,
    costMultiplier: 1.03,
    scope: 'europe',
    dayFrom: 235,
    dayTo: 250,
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
