import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { hotelNet, hotelRoi } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import type { RankMetric } from '../types'

const METRICS: { id: RankMetric; label: string }[] = [
  { id: 'net', label: 'Beneficio día' },
  { id: 'occupancy', label: 'Ocupación' },
  { id: 'roi', label: 'ROI vida' },
  { id: 'satisfaction', label: 'Satisfacción' },
]

export function RankingPanel() {
  const open = useGameStore((s) => s.showRanking)
  const setShowRanking = useGameStore((s) => s.setShowRanking)
  const hotels = useGameStore((s) => s.hotels)
  const metric = useGameStore((s) => s.rankMetric)
  const setRankMetric = useGameStore((s) => s.setRankMetric)
  const focusHotel = useGameStore((s) => s.focusHotel)

  const top = useMemo(() => {
    const scored = hotels.map((h) => {
      let score = 0
      if (metric === 'net') score = hotelNet(h)
      else if (metric === 'occupancy') score = h.lastDayOccupancy
      else if (metric === 'roi') score = hotelRoi(h)
      else score = h.satisfaction
      return { h, score }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 25)
  }, [hotels, metric])

  if (!open) return null

  return (
    <aside className="panel panel--rank">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Rendimiento</p>
          <h2>Ranking Orbis</h2>
          <p className="panel__meta">Top 25 · clic para ir al mapa</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowRanking(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        <div className="speed-group" style={{ marginBottom: '0.75rem' }}>
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={metric === m.id ? 'chip chip--active' : 'chip'}
              onClick={() => setRankMetric(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <ol className="rank-list">
          {top.map(({ h, score }, i) => {
            const sub = getSubsidiary(h.subsidiaryId)
            const label =
              metric === 'net'
                ? formatEUR(score)
                : metric === 'occupancy'
                  ? formatPct(score)
                  : metric === 'roi'
                    ? `${(score * 100).toFixed(1)}%`
                    : `${Math.round(score)}`
            return (
              <li key={h.id}>
                <button type="button" className="rank-row" onClick={() => focusHotel(h.id)}>
                  <span className="rank-pos">{i + 1}</span>
                  {sub && <img src={subsidiaryLogoSvg(sub, 36)} alt="" width={28} height={28} />}
                  <div>
                    <strong>{h.name}</strong>
                    <span>
                      {h.city} · {sub?.name}
                    </span>
                  </div>
                  <em>{label}</em>
                </button>
              </li>
            )
          })}
        </ol>
        {hotels.length === 0 && <p className="muted">Todavía no hay hoteles en la red.</p>}
      </div>
    </aside>
  )
}
