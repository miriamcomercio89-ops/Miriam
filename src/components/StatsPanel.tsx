import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { buildGlobalStats, boardLabel, loyaltyInfo, nextLoyaltyTier } from '../lib/loyalty'
import { formatEUR, formatPct, formatGameDay } from '../lib/format'
import { BOARD_REGIMES, LOYALTY_TIERS } from '../data/catalog'

export function StatsPanel() {
  const open = useGameStore((s) => s.showStats)
  const setShowStats = useGameStore((s) => s.setShowStats)
  const hotels = useGameStore((s) => s.hotels)
  const loyaltyLevel = useGameStore((s) => s.loyaltyLevel)
  const loyaltyPoints = useGameStore((s) => s.loyaltyPoints)
  const ledger = useGameStore((s) => s.ledger)

  const stats = useMemo(() => buildGlobalStats(hotels), [hotels])
  const loyalty = loyaltyInfo(loyaltyLevel)
  const next = nextLoyaltyTier(loyaltyLevel)
  const maxNet = Math.max(1, ...ledger.slice(-14).map((d) => Math.abs(d.net)))

  if (!open) return null

  return (
    <aside className="panel panel--finance">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Estadísticas</p>
          <h2>Orbis en números</h2>
          <p className="panel__meta">
            {stats.count.toLocaleString('es-ES')} hoteles · {stats.rooms.toLocaleString('es-ES')} habitaciones
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowStats(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        <div className="cost-box">
          <div><span>Ocupación media</span><strong>{formatPct(stats.avgOccupancy)}</strong></div>
          <div><span>Ingresos / día</span><strong>{formatEUR(stats.revenue, true)}</strong></div>
          <div><span>Gastos / día</span><strong>{formatEUR(stats.costs, true)}</strong></div>
          <div><span>Ganancia / día</span><strong className={stats.net >= 0 ? 'pos' : 'neg'}>{formatEUR(stats.net, true)}</strong></div>
          <div><span>Impuestos / día</span><strong>{formatEUR(stats.tax, true)}</strong></div>
          <div><span>Impuestos vida</span><strong>{formatEUR(stats.lifetimeTax, true)}</strong></div>
          <div><span>Con seguro</span><strong>{stats.insured}</strong></div>
          <div><span>Estado bajo (&lt;60)</span><strong>{stats.lowCondition}</strong></div>
        </div>

        <h3 className="mini-title">Club Orbis · {loyalty.label}</h3>
        <p className="muted">
          {loyaltyPoints.toLocaleString('es-ES')} puntos (huéspedes de por vida)
          {next ? ` · siguiente nivel a ${next.points.toLocaleString('es-ES')}` : ' · nivel máximo'}
        </p>
        <div className="rep-list">
          {LOYALTY_TIERS.map((t) => (
            <div key={t.level} className="rep-row">
              <span>{t.level}. {t.name}</span>
              <div className="rep-bar">
                <i style={{ width: `${loyaltyLevel >= t.level ? 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        <h3 className="mini-title">Regímenes</h3>
        <div className="cost-box">
          {BOARD_REGIMES.map((b) => (
            <div key={b.id}>
              <span>{boardLabel(b.id)}</span>
              <strong>{stats.byRegime[b.id] ?? 0}</strong>
            </div>
          ))}
        </div>

        <h3 className="mini-title">Neto últimos días</h3>
        {ledger.length === 0 ? (
          <p className="muted">Avanza el tiempo para ver el gráfico.</p>
        ) : (
          <div className="chart">
            {ledger.slice(-14).map((d) => (
              <div key={d.day} className="chart__col" title={formatGameDay(d.day)}>
                <div className="chart__bars">
                  <div
                    className={`chart__bar ${d.net >= 0 ? 'chart__bar--net' : 'chart__bar--neg'}`}
                    style={{ height: `${(Math.abs(d.net) / maxNet) * 100}%` }}
                  />
                </div>
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
