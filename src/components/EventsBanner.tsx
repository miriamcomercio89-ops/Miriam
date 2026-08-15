import { useGameStore } from '../store/gameStore'
import { gameDate } from '../lib/format'

export function EventsBanner() {
  const ev = useGameStore((s) => s.events[0])
  const n = useGameStore((s) => s.restaurants.length)
  if (!ev) {
    return (
      <div className="ticker">
        <span className="tone-info">Mesa Mundial</span>
        <span className="muted">{n} locales en el mapa OSM</span>
      </div>
    )
  }
  return (
    <div className="ticker">
      <span className={`tone-${ev.tone}`}>{ev.title}</span>
      <span>
        {gameDate(ev.day)} — {ev.body}
      </span>
    </div>
  )
}
