import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES } from '../data/subsidiaries'
import type { MapLayer, ProfitFilter } from '../types'

export function MapToolbar() {
  const layer = useGameStore((s) => s.mapLayer)
  const setMapLayer = useGameStore((s) => s.setMapLayer)
  const filters = useGameStore((s) => s.mapFilters)
  const setMapFilters = useGameStore((s) => s.setMapFilters)

  const layers: { id: MapLayer; label: string }[] = [
    { id: 'streets', label: 'Calles' },
    { id: 'satellite', label: 'Satélite' },
    { id: 'hybrid', label: 'Híbrido' },
  ]

  const profits: { id: ProfitFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'profit', label: 'En beneficio' },
    { id: 'loss', label: 'En pérdidas' },
    { id: 'new', label: 'Sin liquidar' },
  ]

  return (
    <div className="map-toolbar">
      <div className="map-toolbar__group">
        {layers.map((l) => (
          <button
            key={l.id}
            type="button"
            className={layer === l.id ? 'chip chip--active' : 'chip'}
            onClick={() => setMapLayer(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="map-toolbar__group map-toolbar__filters">
        <select
          value={filters.subsidiaryId}
          onChange={(e) => setMapFilters({ subsidiaryId: e.target.value as typeof filters.subsidiaryId })}
          aria-label="Filtrar filial"
        >
          <option value="all">Todas las filiales</option>
          {SUBSIDIARIES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={filters.minStars}
          onChange={(e) => setMapFilters({ minStars: Number(e.target.value) })}
          aria-label="Estrellas mínimas"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ ★</option>
          ))}
        </select>
        <select
          value={filters.profit}
          onChange={(e) => setMapFilters({ profit: e.target.value as ProfitFilter })}
          aria-label="Filtro resultado"
        >
          {profits.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
