import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { activeHolidays } from '../lib/holidays'

export function EventsBanner() {
  const events = useGameStore((s) => s.activeEvents)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const holidays = useMemo(() => activeHolidays(gameMinutes), [gameMinutes])

  const all = [
    ...holidays.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      demandMultiplier: h.demandMultiplier,
      costMultiplier: h.costMultiplier,
      daysRemaining: 1,
      isHoliday: true as const,
      scope: h.scope,
    })),
    ...events.map((e) => ({ ...e, isHoliday: false as const, scope: e.scope })),
  ]

  if (all.length === 0) return null

  return (
    <div className="events-banner" aria-live="polite">
      {holidays.length > 0 && (
        <div className="events-banner__holidays" aria-label="Fiestas activas">
          <span className="events-banner__label">Fiestas</span>
          {holidays.map((h) => (
            <span key={h.id} className="holiday-chip" title={h.description}>
              {h.title}
              <em>×{h.demandMultiplier.toFixed(2)}</em>
            </span>
          ))}
        </div>
      )}
      {all.map((e) => (
        <article key={e.id} className={e.isHoliday ? 'event-card event-card--holiday' : 'event-card'}>
          <strong>
            {e.isHoliday ? 'Fiesta · ' : 'Evento · '}
            {e.title}
          </strong>
          <p>{e.description}</p>
          <span>
            Demanda ×{e.demandMultiplier.toFixed(2)} · Costes ×{e.costMultiplier.toFixed(2)}
            {e.isHoliday ? ` · ${e.scope}` : ` · ${e.daysRemaining}d`}
          </span>
        </article>
      ))}
    </div>
  )
}
