import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES } from '../data/subsidiaries'
import { PlaceSearch } from './PlaceSearch'
import type { MapLayer, MapMode, ProfitFilter } from '../types'

export function MapToolbar() {
  const layer = useGameStore((s) => s.mapLayer)
  const setMapLayer = useGameStore((s) => s.setMapLayer)
  const mode = useGameStore((s) => s.mapMode)
  const setMapMode = useGameStore((s) => s.setMapMode)
  const filters = useGameStore((s) => s.mapFilters)
  const setMapFilters = useGameStore((s) => s.setMapFilters)

  const layers: { id: MapLayer; label: string; title: string }[] = [
    { id: 'streets', label: 'Calles', title: 'Mapa de calles OpenStreetMap' },
    { id: 'satellite', label: 'Satélite', title: 'Imagen satélite' },
    { id: 'hybrid', label: 'Híbrido', title: 'Satélite con etiquetas' },
  ]

  const modes: { id: MapMode; label: string; title: string }[] = [
    { id: 'inspect', label: 'Inspeccionar', title: 'Clic en hoteles para ver ficha (no construye)' },
    { id: 'build', label: 'Construir', title: 'Clic en tierra firme para abrir construcción' },
  ]

  const profits: { id: ProfitFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'profit', label: 'En beneficio' },
    { id: 'loss', label: 'En pérdidas' },
    { id: 'new', label: 'Sin liquidar' },
  ]

  return (
    <div className="map-toolbar">
      <PlaceSearch />
      <div className="map-toolbar__group">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={mode === m.id ? 'chip chip--active' : 'chip'}
            title={m.title}
            onClick={() => setMapMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="map-toolbar__group">
        {layers.map((l) => (
          <button
            key={l.id}
            type="button"
            className={layer === l.id ? 'chip chip--active' : 'chip'}
            title={l.title}
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
          title="Mostrar solo una filial"
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
          title="Filtrar por estrellas mínimas"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}+ ★</option>
          ))}
        </select>
        <select
          value={filters.profit}
          onChange={(e) => setMapFilters({ profit: e.target.value as ProfitFilter })}
          aria-label="Filtro resultado"
          title="Filtrar por resultado del último día"
        >
          {profits.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
