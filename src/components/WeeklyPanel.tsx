import { useGameStore } from '../store/gameStore'
import { formatEUR, formatPct } from '../lib/format'

export function WeeklyPanel() {
  const open = useGameStore((s) => s.showWeekly)
  const setShowWeekly = useGameStore((s) => s.setShowWeekly)
  const reports = useGameStore((s) => s.weeklyReports)

  if (!open) return null

  return (
    <aside className="panel panel--finance">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Informe semanal</p>
          <h2>Resumen Orbis</h2>
          <p className="panel__meta">Cada 7 días · mejor país, peor hotel, impuestos y banco</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowWeekly(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        {reports.length === 0 ? (
          <p className="muted">Todavía no hay informe. Pasa una semana de juego.</p>
        ) : (
          reports.map((r) => (
            <article key={r.id} className="news-card news-card--neutral" style={{ marginBottom: '0.65rem' }}>
              <span>Día {r.day}</span>
              <strong>Informe semanal</strong>
              <p>{r.summary}</p>
              <div className="cost-box" style={{ marginTop: '0.5rem' }}>
                <div><span>Mejor país</span><strong className="pos">{r.bestCountry} · {formatEUR(r.bestCountryNet)}</strong></div>
                <div><span>Peor hotel</span><strong className="neg">{r.worstHotel} · {formatEUR(r.worstHotelNet)}</strong></div>
                <div><span>Impuestos del día</span><strong>{formatEUR(r.dayTax)}</strong></div>
                <div><span>En el banco</span><strong>{formatEUR(r.bankBalance, true)}</strong></div>
                <div><span>Hoteles</span><strong>{r.hotelCount}</strong></div>
                <div><span>Ocupación media</span><strong>{formatPct(r.avgOccupancy)}</strong></div>
                <div><span>Reformas IA</span><strong>{r.renovations}</strong></div>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  )
}
