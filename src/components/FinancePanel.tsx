import { useMemo } from 'react'
import { BRANDS } from '../data/brands'
import { formatEUR, formatInt } from '../lib/format'
import { useGameStore } from '../store/gameStore'

export function FinancePanel() {
  const restaurants = useGameStore((s) => s.restaurants)
  const history = useGameStore((s) => s.history)
  const cash = useGameStore((s) => s.cash)

  const byBrand = useMemo(() => {
    return BRANDS.map((b) => {
      const list = restaurants.filter((r) => r.brandId === b.id && !r.closed)
      return {
        id: b.id,
        name: b.short,
        color: b.color,
        n: list.length,
        net: list.reduce((a, r) => a + r.lastNet, 0),
      }
    }).filter((x) => x.n > 0)
  }, [restaurants])

  const byCountry = useMemo(() => {
    const map = new Map<string, { n: number; net: number }>()
    for (const r of restaurants) {
      if (r.closed) continue
      const prev = map.get(r.country) ?? { n: 0, net: 0 }
      prev.n++
      prev.net += r.lastNet
      map.set(r.country, prev)
    }
    return [...map.entries()]
      .map(([country, v]) => ({ country, ...v }))
      .sort((a, b) => b.net - a.net)
      .slice(0, 12)
  }, [restaurants])

  const maxBar = Math.max(1, ...history.map((h) => Math.abs(h.net)))

  return (
    <div>
      <h3 className="serif">Finanzas</h3>
      <div className="card">
        <div className="row">
          <span className="muted">Caja</span>
          <b>{formatEUR(cash)}</b>
        </div>
        <div className="row">
          <span className="muted">Locales abiertos</span>
          <b>{formatInt(restaurants.filter((r) => !r.closed).length)}</b>
        </div>
      </div>
      <p className="muted">Resultado diario (últimos días)</p>
      <div className="bars">
        {history.slice(-28).map((h) => (
          <span
            key={h.day}
            title={`Día ${h.day}: ${formatEUR(h.net)}`}
            style={{
              height: `${Math.max(6, (Math.abs(h.net) / maxBar) * 100)}%`,
              background: h.net >= 0 ? '#7dbe6a' : '#e07060',
            }}
          />
        ))}
      </div>
      <h3 className="serif">Por marca</h3>
      {byBrand.map((b) => (
        <div key={b.id} className="row">
          <span>
            <i className="dot" style={{ background: b.color, display: 'inline-block', marginRight: 8 }} />
            {b.name} · {b.n}
          </span>
          <b>{formatEUR(b.net)}</b>
        </div>
      ))}
      <h3 className="serif">Por país</h3>
      {byCountry.map((c) => (
        <div key={c.country} className="row">
          <span>
            {c.country} · {c.n}
          </span>
          <b>{formatEUR(c.net)}</b>
        </div>
      ))}
    </div>
  )
}
