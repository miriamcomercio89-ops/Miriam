import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSubsidiary } from '../data/subsidiaries'
import { formatEUR, formatPct } from '../lib/format'
import { hotelNet, hotelRoi } from '../lib/economy'
import type { Hotel } from '../types'

function HotelColumn({ hotel, label }: { hotel: Hotel | undefined; label: string }) {
  if (!hotel) {
    return (
      <div className="compare-col">
        <h3>{label}</h3>
        <p className="muted">Elige un hotel desde la ficha o la lista.</p>
      </div>
    )
  }
  const sub = getSubsidiary(hotel.subsidiaryId)
  const net = hotelNet(hotel)
  return (
    <div className="compare-col">
      <h3>{label}</h3>
      <strong>{hotel.name}</strong>
      <span className="muted">
        {sub?.name} · {hotel.city}, {hotel.country}
      </span>
      <div className="cost-box">
        <div><span>Estrellas</span><strong>{'★'.repeat(hotel.stars)}</strong></div>
        <div><span>Habitaciones</span><strong>{hotel.rooms}</strong></div>
        <div><span>Precio / noche</span><strong>{formatEUR(hotel.pricePerNight)}</strong></div>
        <div><span>Ocupación</span><strong>{formatPct(hotel.lastDayOccupancy)}</strong></div>
        <div><span>Ingresos / día</span><strong>{formatEUR(hotel.lastDayRevenue)}</strong></div>
        <div><span>Gastos / día</span><strong>{formatEUR(hotel.lastDayCosts)}</strong></div>
        <div><span>Impuestos / día</span><strong>{formatEUR(hotel.lastDayTax)}</strong></div>
        <div><span>Ganancia / día</span><strong className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net)}</strong></div>
        <div><span>Satisfacción</span><strong>{Math.round(hotel.satisfaction)}</strong></div>
        <div><span>ROI</span><strong>{(hotelRoi(hotel) * 100).toFixed(1)}%</strong></div>
        <div><span>Impuesto país</span><strong>{Math.round(hotel.taxRate * 100)}%</strong></div>
        <div><span>Seguro IA</span><strong>{hotel.insurance?.active ? formatEUR(hotel.insurance.dailyCost) + '/día' : 'No'}</strong></div>
        <div><span>Obra</span><strong>{formatEUR(hotel.constructionCost, true)}</strong></div>
      </div>
    </div>
  )
}

export function ComparePanel() {
  const open = useGameStore((s) => s.showCompare)
  const setShowCompare = useGameStore((s) => s.setShowCompare)
  const compareIds = useGameStore((s) => s.compareIds)
  const hotels = useGameStore((s) => s.hotels)
  const setCompareSlot = useGameStore((s) => s.setCompareSlot)
  const focusHotel = useGameStore((s) => s.focusHotel)

  const a = useMemo(() => hotels.find((h) => h.id === compareIds[0]), [hotels, compareIds])
  const b = useMemo(() => hotels.find((h) => h.id === compareIds[1]), [hotels, compareIds])

  if (!open) return null

  return (
    <aside className="panel panel--finance" style={{ width: 'min(720px, 96vw)' }}>
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Comparar</p>
          <h2>Dos hoteles cara a cara</h2>
          <p className="panel__meta">Elige A y B desde la ficha del hotel o con estos selectores</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowCompare(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        <div className="field-row">
          <label className="field">
            <span>Hotel A</span>
            <select
              value={compareIds[0] ?? ''}
              onChange={(e) => setCompareSlot(0, e.target.value || null)}
            >
              <option value="">—</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Hotel B</span>
            <select
              value={compareIds[1] ?? ''}
              onChange={(e) => setCompareSlot(1, e.target.value || null)}
            >
              <option value="">—</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="compare-grid">
          <HotelColumn hotel={a} label="A" />
          <HotelColumn hotel={b} label="B" />
        </div>
        <div className="nav-row">
          {a && (
            <button type="button" className="btn btn--ghost" onClick={() => focusHotel(a.id)}>
              Ir a A
            </button>
          )}
          {b && (
            <button type="button" className="btn btn--ghost" onClick={() => focusHotel(b.id)}>
              Ir a B
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
