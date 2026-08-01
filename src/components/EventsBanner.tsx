import { useGameStore } from '../store/gameStore'

export function EventsBanner() {
  const events = useGameStore((s) => s.activeEvents)
  if (events.length === 0) return null

  return (
    <div className="events-banner" aria-live="polite">
      {events.map((e) => (
        <article key={e.id} className="event-card">
          <strong>{e.title}</strong>
          <p>{e.description}</p>
          <span>
            Demanda ×{e.demandMultiplier.toFixed(2)} · Costes ×{e.costMultiplier.toFixed(2)} ·{' '}
            {e.daysRemaining}d
          </span>
        </article>
      ))}
    </div>
  )
}
