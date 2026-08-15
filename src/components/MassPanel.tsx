import { useState } from 'react'
import { BRANDS } from '../data/brands'
import { CITIES } from '../data/cities'
import { foundCost } from '../lib/economy'
import { formatEUR } from '../lib/format'
import { useGameStore } from '../store/gameStore'

export function MassPanel() {
  const hqLevel = useGameStore((s) => s.hqLevel)
  const upgrades = useGameStore((s) => s.upgrades)
  const cash = useGameStore((s) => s.cash)
  const bulkFound = useGameStore((s) => s.bulkFound)
  const scoutBusy = useGameStore((s) => s.scoutBusy)
  const autoExpand = useGameStore((s) => s.autoExpand)
  const autoBrand = useGameStore((s) => s.autoBrand)
  const autoCount = useGameStore((s) => s.autoCount)
  const setAuto = useGameStore((s) => s.setAuto)
  const restaurants = useGameStore((s) => s.restaurants)

  const brands = BRANDS.filter((b) => b.hqLevel <= hqLevel)
  const [cityId, setCityId] = useState('malaga')
  const [brandId, setBrandId] = useState(brands[0]?.id ?? 'tasca')
  const [count, setCount] = useState(25)
  const [useOsm, setUseOsm] = useState(true)
  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[1]
  const unit = foundCost(brandId, city, upgrades)
  const maxByCash = Math.max(0, Math.floor(cash / unit))
  const n = Math.min(count, maxByCash)
  const owned = restaurants.filter((r) => r.city === city.name).length

  return (
    <div>
      <h3 className="serif">Fundación masiva</h3>
      <p className="muted">
        Oleadas de 10 a 250 locales por ciudad. Si Overpass responde, se usan coordenadas reales de
        restaurantes OSM; el resto se reparte en espiral urbana.
      </p>
      <label className="muted">Ciudad</label>
      <select className="field" value={cityId} onChange={(e) => setCityId(e.target.value)}>
        {CITIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}, {c.country}
          </option>
        ))}
      </select>
      <div className="grid2" style={{ marginTop: 8 }}>
        <label>
          <span className="muted">Marca</span>
          <select className="field" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="muted">Cantidad ({n})</span>
          <input
            className="field"
            type="number"
            min={1}
            max={250}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(250, Number(e.target.value) || 1)))}
          />
        </label>
      </div>
      <label className="row" style={{ margin: '10px 0' }}>
        <span>Preferir puntos OSM (Overpass)</span>
        <input type="checkbox" checked={useOsm} onChange={(e) => setUseOsm(e.target.checked)} />
      </label>
      <p>
        Ya hay <b>{owned}</b> en {city.name}. Coste estimado <b>{formatEUR(unit * n)}</b> · máximo con caja{' '}
        {maxByCash}.
      </p>
      <button
        type="button"
        className="btn primary"
        disabled={scoutBusy || n < 1}
        onClick={() => void bulkFound(cityId, brandId, n, useOsm)}
      >
        {scoutBusy ? 'Consultando OSM…' : `Fundar ${n} en ${city.name}`}
      </button>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Plan mundial automático</h3>
        <p className="muted">
          Recorre las {CITIES.length} ciudades ancla empezando por Álora. Requiere la mejora HQ
          «Expansión automática».
        </p>
        <label className="row">
          <span>Activo</span>
          <input
            type="checkbox"
            checked={autoExpand}
            onChange={(e) => setAuto({ autoExpand: e.target.checked })}
            disabled={!upgrades.includes('auto')}
          />
        </label>
        <div className="grid2">
          <select className="field" value={autoBrand} onChange={(e) => setAuto({ autoBrand: e.target.value })}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.short}
              </option>
            ))}
          </select>
          <input
            className="field"
            type="number"
            min={1}
            max={40}
            value={autoCount}
            onChange={(e) => setAuto({ autoCount: Math.max(1, Math.min(40, Number(e.target.value) || 1)) })}
          />
        </div>
        <p className="muted">Locales por ciudad y día (si hay caja).</p>
      </div>
    </div>
  )
}
