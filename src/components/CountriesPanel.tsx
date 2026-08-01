import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { buildCountryStats } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'

export function CountriesPanel() {
  const open = useGameStore((s) => s.showCountries)
  const setShowCountries = useGameStore((s) => s.setShowCountries)
  const hotels = useGameStore((s) => s.hotels)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)
  const setMapFocus = useGameStore((s) => s.setMapFocus)

  const rows = useMemo(
    () => buildCountryStats(hotels, reputation, countryEconomy),
    [hotels, reputation, countryEconomy],
  )

  if (!open) return null

  return (
    <aside className="panel panel--countries">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Por países</p>
          <h2>Tu red en el mundo</h2>
          <p className="panel__meta">{rows.length} países con hoteles Orbis</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowCountries(false)} aria-label="Cerrar">×</button>
      </div>
      <div className="panel__body">
        {rows.length === 0 ? (
          <p className="muted">Todavía no hay hoteles. Construye el primero.</p>
        ) : (
          <div className="country-list">
            {rows.map((c) => {
              const sample = hotels.find((h) => h.countryCode.toUpperCase() === c.code)
              return (
                <button
                  key={c.code}
                  type="button"
                  className="country-row"
                  title="Ir al mapa de este país"
                  onClick={() => {
                    if (sample) setMapFocus({ lat: sample.lat, lng: sample.lng, zoom: 5 })
                    setShowCountries(false)
                  }}
                >
                  <div>
                    <strong>{c.name}</strong>
                    <span>
                      {c.count} hoteles · {c.rooms.toLocaleString('es-ES')} habitaciones · fama {Math.round(c.fame)}
                    </span>
                  </div>
                  <div className="country-row__meta">
                    <em className={c.net >= 0 ? 'pos' : 'neg'}>{formatEUR(c.net, true)}/día</em>
                    <span>
                      Llenas {formatPct(c.occ)} · inflación {(c.inflation * 100).toFixed(2)}%/día · cambio ×{c.fx.toFixed(2)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
