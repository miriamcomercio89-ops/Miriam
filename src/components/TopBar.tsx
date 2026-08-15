import { PlaceSearch } from './PlaceSearch'
import { useGameStore } from '../store/gameStore'
import { formatEUR, formatInt, gameDate } from '../lib/format'
import { exportJson } from '../lib/save'

export function TopBar() {
  const company = useGameStore((s) => s.company)
  const cash = useGameStore((s) => s.cash)
  const day = useGameStore((s) => s.day)
  const hour = useGameStore((s) => s.hour)
  const restaurants = useGameStore((s) => s.restaurants)
  const speed = useGameStore((s) => s.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const persist = useGameStore((s) => s.persist)
  const saveBusy = useGameStore((s) => s.saveBusy)

  const open = restaurants.filter((r) => !r.closed).length
  const countries = new Set(restaurants.map((r) => r.cc)).size
  const net = restaurants.reduce((a, r) => a + r.lastNet, 0)

  return (
    <header className="topbar">
      <div className="brand-mark">
        <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden>
          <rect width="64" height="64" rx="12" fill="#2a1812" />
          <circle cx="32" cy="36" r="14" fill="none" stroke="#e8c47a" strokeWidth="3" />
        </svg>
        <div>
          <strong>{company}</strong>
          <span>Mesa Mundial · OSM</span>
        </div>
      </div>
      <div className="kpis">
        <div className={`kpi ${cash < 0 ? 'bad' : 'good'}`}>
          <small>Caja</small>
          <b>{formatEUR(cash)}</b>
        </div>
        <div className="kpi">
          <small>Locales</small>
          <b>{formatInt(open)}</b>
        </div>
        <div className="kpi">
          <small>Países</small>
          <b>{countries}</b>
        </div>
        <div className={`kpi ${net >= 0 ? 'good' : 'bad'}`}>
          <small>Neto/día</small>
          <b>{formatEUR(net)}</b>
        </div>
        <div className="kpi">
          <small>Fecha</small>
          <b>
            {gameDate(day)} · {String(hour).padStart(2, '0')}:00
          </b>
        </div>
      </div>
      <PlaceSearch />
      <div className="speeds">
        {([0, 1, 4, 16] as const).map((v) => (
          <button key={v} type="button" className={speed === v ? 'on' : ''} onClick={() => setSpeed(v)}>
            {v === 0 ? 'II' : `${v}×`}
          </button>
        ))}
        <button type="button" className="btn" onClick={() => void persist()} disabled={saveBusy}>
          {saveBusy ? '…' : 'Guardar'}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            const s = useGameStore.getState()
            exportJson({
              version: 1,
              company: s.company,
              started: s.started,
              day: s.day,
              hour: s.hour,
              cash: s.cash,
              hqLevel: s.hqLevel,
              upgrades: s.upgrades,
              restaurants: s.restaurants,
              usedOsm: s.usedOsm,
              history: s.history,
              events: s.events,
              autoExpand: s.autoExpand,
              autoBrand: s.autoBrand,
              autoCount: s.autoCount,
              autoCityIndex: s.autoCityIndex,
            })
          }}
        >
          JSON
        </button>
      </div>
    </header>
  )
}
