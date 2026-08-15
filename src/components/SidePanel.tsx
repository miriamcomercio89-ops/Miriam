import { useMemo, useState } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { useGameStore } from '../store/gameStore'
import { formatEUR } from '../lib/format'
import { BuildPanel } from './BuildPanel'
import { MassPanel } from './MassPanel'
import { FinancePanel } from './FinancePanel'
import { HqPanel } from './HqPanel'
import { HelpPanel } from './HelpPanel'
import { AMENITY_LABEL } from '../lib/osm'
import type { PanelId } from '../types'

const TABS: { id: PanelId; label: string }[] = [
  { id: 'list', label: 'Red' },
  { id: 'build', label: 'Abrir' },
  { id: 'scout', label: 'OSM' },
  { id: 'mass', label: 'Masiva' },
  { id: 'finance', label: 'Finanzas' },
  { id: 'hq', label: 'HQ' },
  { id: 'help', label: 'Guía' },
]

export function SidePanel() {
  const panel = useGameStore((s) => s.panel) ?? 'list'
  const setPanel = useGameStore((s) => s.setPanel)

  return (
    <aside className="side">
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`chip ${panel === t.id ? 'on' : ''}`} onClick={() => setPanel(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="side-body">
        {panel === 'list' && <ListPanel />}
        {panel === 'build' && <BuildPanel />}
        {panel === 'scout' && <ScoutPanel />}
        {panel === 'mass' && <MassPanel />}
        {panel === 'finance' && <FinancePanel />}
        {panel === 'hq' && <HqPanel />}
        {panel === 'help' && <HelpPanel />}
      </div>
    </aside>
  )
}

function ListPanel() {
  const restaurants = useGameStore((s) => s.restaurants)
  const selectedId = useGameStore((s) => s.selectedId)
  const setSelected = useGameStore((s) => s.setSelected)
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('all')

  const list = useMemo(() => {
    const query = q.toLowerCase()
    return restaurants
      .filter((r) => (brand === 'all' ? true : r.brandId === brand))
      .filter((r) => `${r.name} ${r.city} ${r.country}`.toLowerCase().includes(query))
      .sort((a, b) => b.lastNet - a.lastNet)
      .slice(0, 400)
  }, [restaurants, q, brand])

  const selected = restaurants.find((r) => r.id === selectedId)

  return (
    <div>
      <div className="filters">
        <input className="field" placeholder="Filtrar…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="all">Todas las marcas</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.short}
            </option>
          ))}
        </select>
      </div>
      {selected && <RestaurantCard id={selected.id} />}
      <p className="muted">
        {list.length} de {restaurants.length} locales (orden por beneficio)
      </p>
      {list.map((r) => (
        <button
          key={r.id}
          type="button"
          className="rest-item"
          onClick={() => {
            setSelected(r.id)
            setMapFocus({ lat: r.lat, lng: r.lng, zoom: 15 })
          }}
        >
          <span className="dot" style={{ background: brandById(r.brandId).color }} />
          <span>
            <b>{r.name}</b>
            <div className="muted">
              {r.city} · {r.closed ? 'cerrado' : `${r.seats} asientos`}
            </div>
          </span>
          <span className={r.lastNet >= 0 ? 'kpi good' : 'kpi bad'}>
            <b>{formatEUR(r.lastNet)}</b>
          </span>
        </button>
      ))}
    </div>
  )
}

function RestaurantCard({ id }: { id: string }) {
  const r = useGameStore((s) => s.restaurants.find((x) => x.id === id))
  const upgradeSeats = useGameStore((s) => s.upgradeSeats)
  const upgradeQuality = useGameStore((s) => s.upgradeQuality)
  const toggleClosed = useGameStore((s) => s.toggleClosed)
  const sellRestaurant = useGameStore((s) => s.sellRestaurant)
  if (!r) return null
  const b = brandById(r.brandId)
  return (
    <div className="card">
      <h3>{r.name}</h3>
      <p className="muted">
        {b.name} · {r.city}, {r.country}
        {r.osmId ? ` · OSM ${r.osmId}` : ''}
        {r.stars ? ` · ${'★'.repeat(r.stars)}` : ''}
      </p>
      <div className="grid2">
        <div>
          <small className="muted">Cubiertos</small>
          <div>{Math.round(r.lastCovers)}</div>
        </div>
        <div>
          <small className="muted">Calidad</small>
          <div>{r.quality}</div>
        </div>
        <div>
          <small className="muted">Ingresos</small>
          <div>{formatEUR(r.lastRev)}</div>
        </div>
        <div>
          <small className="muted">Neto</small>
          <div>{formatEUR(r.lastNet)}</div>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn" onClick={() => upgradeSeats(r.id)}>
          +Asientos
        </button>
        <button type="button" className="btn" onClick={() => upgradeQuality(r.id)}>
          Cocina
        </button>
        <button type="button" className="btn" onClick={() => toggleClosed(r.id)}>
          {r.closed ? 'Reabrir' : 'Cerrar'}
        </button>
        <button type="button" className="btn danger" onClick={() => sellRestaurant(r.id)}>
          Vender
        </button>
      </div>
    </div>
  )
}

function ScoutPanel() {
  const sites = useGameStore((s) => s.osmSites)
  const scoutBusy = useGameStore((s) => s.scoutBusy)
  const acquireOsm = useGameStore((s) => s.acquireOsm)
  const autoBrand = useGameStore((s) => s.autoBrand)
  const setMapFocus = useGameStore((s) => s.setMapFocus)
  const hqLevel = useGameStore((s) => s.hqLevel)
  const brands = BRANDS.filter((b) => b.hqLevel <= hqLevel)
  const [brand, setBrand] = useState(autoBrand)

  return (
    <div>
      <p className="muted">
        Pulsa <b>Scout OSM</b> en el mapa (Overpass). Los anillos dorados son restaurantes, cafés y bares
        reales. Clic para adquirirlos con la marca elegida.
      </p>
      <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {scoutBusy && <p>Consultando Overpass…</p>}
      <p className="muted">{sites.length} candidatos en vista</p>
      {sites.slice(0, 80).map((s) => (
        <button
          key={s.osmId}
          type="button"
          className="rest-item"
          onClick={() => {
            setMapFocus({ lat: s.lat, lng: s.lng, zoom: 17 })
            acquireOsm(s, brand)
          }}
        >
          <span className="dot" style={{ background: '#e8c47a' }} />
          <span>
            <b>{s.name}</b>
            <div className="muted">
              {AMENITY_LABEL[s.amenity] || s.amenity}
              {s.cuisine ? ` · ${s.cuisine}` : ''}
            </div>
          </span>
          <span className="muted">tomar</span>
        </button>
      ))}
    </div>
  )
}
