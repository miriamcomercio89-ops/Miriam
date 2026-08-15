import { BRANDS, brandById } from '../data/brands'
import { nearestCity } from '../data/cities'
import { foundCost } from '../lib/economy'
import { formatEUR } from '../lib/format'
import { useGameStore } from '../store/gameStore'

export function BuildPanel() {
  const pending = useGameStore((s) => s.pendingPlace)
  const hqLevel = useGameStore((s) => s.hqLevel)
  const upgrades = useGameStore((s) => s.upgrades)
  const cash = useGameStore((s) => s.cash)
  const confirmFound = useGameStore((s) => s.confirmFound)
  const setMapMode = useGameStore((s) => s.setMapMode)
  const brands = BRANDS.filter((b) => b.hqLevel <= hqLevel)

  if (!pending) {
    return (
      <div>
        <h3 className="serif">Fundar en el mapa</h3>
        <p className="muted">
          Activa <b>Fundar (clic)</b> y pulsa una calle de OpenStreetMap. Nominatim dirá el barrio y el
          país; no se puede abrir en el mar.
        </p>
        <button type="button" className="btn primary" onClick={() => setMapMode('found')}>
          Activar modo fundar
        </button>
      </div>
    )
  }

  const city = nearestCity(pending.lat, pending.lng)

  return (
    <div>
      <div className="card">
        <h3>Solar elegido</h3>
        <p>{pending.label}</p>
        <p className="muted">
          {pending.city} · {pending.country} ({pending.cc})
        </p>
      </div>
      {brands.map((b) => {
        const cost = foundCost(b.id, city, upgrades)
        return (
          <button
            key={b.id}
            type="button"
            className="rest-item"
            disabled={cash < cost}
            onClick={() => confirmFound(b.id)}
          >
            <span className="dot" style={{ background: b.color }} />
            <span>
              <b>{b.name}</b>
              <div className="muted">{b.blurb}</div>
            </span>
            <span>
              <b>{formatEUR(cost)}</b>
              <div className="muted">{b.seats} asientos</div>
            </span>
          </button>
        )
      })}
      <p className="muted">Coste ajustado al nivel de vida de {city.name} ({brandById(brands[0].id).name} como referencia de mercado).</p>
    </div>
  )
}
