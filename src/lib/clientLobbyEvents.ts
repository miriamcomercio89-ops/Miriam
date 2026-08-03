import type { MinigameId } from './clientMinigames'

export type LobbyEventId =
  | 'noche_latina'
  | 'mercado_local'
  | 'tormenta'
  | 'noche_jazz'
  | 'dia_spa'
  | 'feria_gastro'
  | 'olympics_mini'
  | 'silent_disco'

export type LobbyEvent = {
  id: LobbyEventId
  title: string
  detail: string
  /** Multiplicador de precios de animación / servicios de ocio. */
  priceMult: number
  /** Bonus fijo al ingreso nocturno del cliente (€). */
  incomeBonus: number
  /** Minijuegos destacados del día (prioridad en lobby). */
  featured: MinigameId[]
  /** Tint CSS suave. */
  tone: 'warm' | 'cool' | 'storm' | 'gold'
}

const POOL: LobbyEvent[] = [
  {
    id: 'noche_latina',
    title: 'Noche latina',
    detail: 'Baile y cócteles en el lobby. La pista está a tope.',
    priceMult: 1.1,
    incomeBonus: 35,
    featured: ['baile_ritmo', 'bar_coctel'],
    tone: 'warm',
  },
  {
    id: 'mercado_local',
    title: 'Mercado local',
    detail: 'Puestos de artesanía y gangas en el hall.',
    priceMult: 0.9,
    incomeBonus: 22,
    featured: ['tienda_ganga', 'chef_pedido'],
    tone: 'gold',
  },
  {
    id: 'tormenta',
    title: 'Alerta tormenta',
    detail: 'Actividades indoor reforzadas. Outdoor con recargo.',
    priceMult: 1.25,
    incomeBonus: 18,
    featured: ['cine_trivia', 'spa_respirar', 'teatro_aplauso'],
    tone: 'storm',
  },
  {
    id: 'noche_jazz',
    title: 'Noche de jazz',
    detail: 'Trío en vivo y cócteles lentos.',
    priceMult: 1.05,
    incomeBonus: 28,
    featured: ['bar_coctel', 'teatro_aplauso'],
    tone: 'cool',
  },
  {
    id: 'dia_spa',
    title: 'Día wellness',
    detail: 'Descuentos en respiración y yoga del resort.',
    priceMult: 0.85,
    incomeBonus: 20,
    featured: ['spa_respirar', 'yoga_postura'],
    tone: 'cool',
  },
  {
    id: 'feria_gastro',
    title: 'Feria gastronómica',
    detail: 'Chefs invitados y retos de pedido.',
    priceMult: 1.15,
    incomeBonus: 40,
    featured: ['chef_pedido', 'bar_coctel'],
    tone: 'warm',
  },
  {
    id: 'olympics_mini',
    title: 'Mini olimpiadas',
    detail: 'Retos fitness y vóley en zonas comunes.',
    priceMult: 1,
    incomeBonus: 30,
    featured: ['gym_reps', 'playa_voley', 'piscina_brazada'],
    tone: 'gold',
  },
  {
    id: 'silent_disco',
    title: 'Silent disco',
    detail: 'Auriculares en el jardín y ritmo libre.',
    priceMult: 1.08,
    incomeBonus: 26,
    featured: ['baile_ritmo', 'mirador_foto'],
    tone: 'warm',
  },
]

export function lobbyEventForDay(day: number): LobbyEvent {
  const i = ((day % POOL.length) + POOL.length) % POOL.length
  return POOL[i]
}

export function ensureLobbyEvent(
  current: LobbyEvent | null,
  eventDay: number,
  day: number,
): { event: LobbyEvent; eventDay: number } {
  if (current && eventDay === day) return { event: current, eventDay }
  return { event: lobbyEventForDay(day), eventDay: day }
}
