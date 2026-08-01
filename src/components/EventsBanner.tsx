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
      isHoliday: true,
    })),
    ...events.map((e) => ({ ...e, isHoliday: false })),
  ]

  if (all.length === 0) return null

  return (
    <div className="events-banner" aria-live="polite">
      {all.map((e) => (
        <article key={e.id} className="event-card">
          <strong>
            {e.isHoliday ? 'Fiesta · ' : ''}
            {e.title}
          </strong>
          <p>{e.description}</p>
          <span>
            Demanda ×{e.demandMultiplier.toFixed(2)} · Costes ×{e.costMultiplier.toFixed(2)}
            {!e.isHoliday ? ` · ${e.daysRemaining}d` : ''}
          </span>
        </article>
      ))}
    </div>
  )
}
