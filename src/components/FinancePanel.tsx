import { useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatEUR, formatGameDay } from '../lib/format'
import { seasonLabel } from '../lib/economy'

export function FinancePanel() {
  const open = useGameStore((s) => s.showFinance)
  const setShowFinance = useGameStore((s) => s.setShowFinance)
  const ledger = useGameStore((s) => s.ledger)
  const cash = useGameStore((s) => s.cash)
  const hotels = useGameStore((s) => s.hotels)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)
  const [range, setRange] = useState<7 | 30>(7)

  const slice = useMemo(() => ledger.slice(-range), [ledger, range])
  const maxAbs = Math.max(1, ...slice.map((d) => Math.max(Math.abs(d.revenue), Math.abs(d.costs), Math.abs(d.net))))

  const ecoSummary = useMemo(() => {
    const codes = [...new Set(hotels.map((h) => h.countryCode.toUpperCase()))]
    if (!codes.length) return null
    let inf = 0
    let fx = 0
    for (const cc of codes) {
      const e = countryEconomy[cc] ?? { inflation: 0.0004, fx: 1, taxDrift: 1, touristDrift: 1 }
      inf += e.inflation
      fx += e.fx
    }
    return { inf: inf / codes.length, fx: fx / codes.length, n: codes.length }
  }, [hotels, countryEconomy])

  const avgRep =
    Object.values(reputation).length === 0
      ? 55
      : Object.values(reputation).reduce((a, b) => a + b, 0) / Object.values(reputation).length

  if (!open) return null

  return (
    <aside className="panel panel--finance">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Finanzas del grupo</p>
          <h2>Orbis Finance</h2>
          <p className="panel__meta">Caja {formatEUR(cash, true)} · {hotels.length} hoteles · reputación media {Math.round(avgRep)}</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowFinance(false)} aria-label="Cerrar">×</button>
      </div>

      <div className="panel__body">
        <div className="speed-group" style={{ marginBottom: '0.75rem' }}>
          <button type="button" className={range === 7 ? 'chip chip--active' : 'chip'} onClick={() => setRange(7)}>7 días</button>
          <button type="button" className={range === 30 ? 'chip chip--active' : 'chip'} onClick={() => setRange(30)}>30 días</button>
        </div>

        {slice.length === 0 ? (
          <p className="muted">Aún no hay liquidaciones diarias. Avanza el tiempo o salta un día.</p>
        ) : (
          <div className="chart">
            {slice.map((d) => (
              <div key={d.day} className="chart__col" title={formatGameDay(d.day)}>
                <div className="chart__bars">
                  <div className="chart__bar chart__bar--rev" style={{ height: `${(d.revenue / maxAbs) * 100}%` }} />
                  <div className="chart__bar chart__bar--cost" style={{ height: `${(d.costs / maxAbs) * 100}%` }} />
                  <div
                    className={`chart__bar ${d.net >= 0 ? 'chart__bar--net' : 'chart__bar--neg'}`}
                    style={{ height: `${(Math.abs(d.net) / maxAbs) * 100}%` }}
                  />
                </div>
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        )}

        <div className="legend">
          <span><i className="swatch swatch--rev" /> Ingresos</span>
          <span><i className="swatch swatch--cost" /> Costes</span>
          <span><i className="swatch swatch--net" /> Neto</span>
        </div>

        <div className="cost-box">
          {slice.slice(-3).reverse().map((d) => (
            <div key={d.day}>
              <span>
                {formatGameDay(d.day)} · {seasonLabel(d.season)}
                {d.tax > 0 ? ` · impuestos ${formatEUR(d.tax)}` : ''}
              </span>
              <strong className={d.net >= 0 ? 'pos' : 'neg'}>{formatEUR(d.net)}</strong>
            </div>
          ))}
        </div>

        <div className="cost-box" style={{ marginTop: '0.75rem' }}>
          <div>
            <span>Impuestos (rango)</span>
            <strong>{formatEUR(slice.reduce((s, d) => s + (d.tax ?? 0), 0))}</strong>
          </div>
          <div>
            <span>Impuestos de por vida (hoteles)</span>
            <strong>{formatEUR(hotels.reduce((s, h) => s + (h.lifetimeTax ?? 0), 0), true)}</strong>
          </div>
          {ecoSummary && (
            <>
              <div>
                <span>Inflación media ({ecoSummary.n} países)</span>
                <strong>{(ecoSummary.inf * 100).toFixed(3)}%/día</strong>
              </div>
              <div>
                <span>Tipo de cambio medio (×)</span>
                <strong>{ecoSummary.fx.toFixed(3)}</strong>
              </div>
            </>
          )}
        </div>

        <h3 className="mini-title">Reputación por país</h3>
        <div className="rep-list">
          {Object.entries(reputation)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([cc, val]) => (
              <div key={cc} className="rep-row">
                <span>{cc}</span>
                <div className="rep-bar"><i style={{ width: `${val}%` }} /></div>
                <strong>{Math.round(val)}</strong>
              </div>
            ))}
          {Object.keys(reputation).length === 0 && <p className="muted">Sin reputación regional todavía.</p>}
        </div>
      </div>
    </aside>
  )
}
