import { SERVICE_CATALOG, STAFF_OPTIONS } from './catalog'
import type { WorldEvent } from '../types'

export const EVENT_POOL: Omit<WorldEvent, 'daysRemaining' | 'startedAtDay'>[] = [
  {
    id: 'summer-boom',
    title: 'Boom de temporada alta',
    description: 'Oleada turística global. Sube la demanda en destinos vacacionales.',
    demandMultiplier: 1.18,
    costMultiplier: 1.05,
    scope: 'global',
  },
  {
    id: 'fuel-spike',
    title: 'Subida del combustible',
    description: 'Los costes operativos y de transfer aumentan en todo el grupo.',
    demandMultiplier: 0.97,
    costMultiplier: 1.12,
    scope: 'global',
  },
  {
    id: 'currency-calm',
    title: 'Estabilidad cambiaria',
    description: 'El turismo internacional se anima con tipos de cambio favorables.',
    demandMultiplier: 1.08,
    costMultiplier: 0.98,
    scope: 'global',
  },
  {
    id: 'coastal-festival',
    title: 'Festival costero internacional',
    description: 'Eventos en franjas litorales impulsan ocupación playera.',
    demandMultiplier: 1.14,
    costMultiplier: 1.04,
    scope: 'coastal',
  },
  {
    id: 'business-dip',
    title: 'Pausa en viajes corporativos',
    description: 'Menos congresos; los hoteles de negocios notan la merma.',
    demandMultiplier: 0.92,
    costMultiplier: 1.0,
    scope: 'business',
  },
  {
    id: 'wellness-wave',
    title: 'Ola wellness',
    description: 'Crece la demanda de spas, termas y retiros.',
    demandMultiplier: 1.1,
    costMultiplier: 1.03,
    scope: 'wellness',
  },
  {
    id: 'storm-season',
    title: 'Temporada de tormentas',
    description: 'Cancelaciones parciales en costas expuestas y sobrecoste de mantenimiento.',
    demandMultiplier: 0.88,
    costMultiplier: 1.15,
    scope: 'coastal',
  },
  {
    id: 'viral-destination',
    title: 'Destino viral',
    description: 'Las redes impulsan reservas improvisadas en ubicaciones con alto índice turístico.',
    demandMultiplier: 1.2,
    costMultiplier: 1.08,
    scope: 'tourism-high',
  },
  {
    id: 'staff-shortage',
    title: 'Tensión en el mercado laboral',
    description: 'Encarece el personal cualificado en toda la red.',
    demandMultiplier: 1.0,
    costMultiplier: 1.1,
    scope: 'global',
  },
  {
    id: 'cruise-synergy',
    title: 'Sinergia con cruceros',
    description: 'Escalas extras llenan hoteles portuarios y costeros.',
    demandMultiplier: 1.12,
    costMultiplier: 1.02,
    scope: 'coastal',
  },
]

export function serviceLabel(id: string): string {
  return SERVICE_CATALOG.find((s) => s.id === id)?.label ?? id
}

export function staffLabel(id: string): string {
  return STAFF_OPTIONS.find((s) => s.id === id)?.label ?? id
}
