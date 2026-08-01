import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { serviceLabel, staffLabel } from '../data/events'
import { TARGET_OPTIONS } from '../data/catalog'
import { formatEUR, formatPct } from '../lib/format'

export function HotelDetail() {
  const id = useGameStore((s) => s.selectedHotelId)
  const hotel = useGameStore((s) => s.hotels.find((h) => h.id === id))
  const selectHotel = useGameStore((s) => s.selectHotel)

  if (!hotel) return null
  const sub = getSubsidiary(hotel.subsidiaryId)
  const targetLabel = TARGET_OPTIONS.find((t) => t.id === hotel.target)?.label ?? hotel.target
  const net = hotel.lastDayRevenue - hotel.lastDayCosts

  return (
    <aside className="panel panel--detail">
      <div className="panel__head">
        <div className="detail-title">
          {sub && <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={40} height={40} />}
          <div>
            <p className="panel__eyebrow">{sub?.name ?? 'Filial'}</p>
            <h2>{hotel.name}</h2>
            <p className="panel__meta">
              {hotel.city}
              {hotel.region ? `, ${hotel.region}` : ''} · {hotel.country}
            </p>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => selectHotel(null)} aria-label="Cerrar">
          ×
        </button>
      </div>

      <img src={hotel.imageDataUrl} alt={hotel.name} className="hotel-hero-img" />

      <div className="insight-grid">
        <div><span>Estrellas</span><strong>{'★'.repeat(hotel.stars)}</strong></div>
        <div><span>Habitaciones</span><strong>{hotel.rooms}</strong></div>
        <div><span>Precio / noche</span><strong>{formatEUR(hotel.pricePerNight)}</strong></div>
        <div><span>Personal</span><strong>{staffLabel(hotel.staffLevel)}</strong></div>
        <div><span>Público</span><strong>{targetLabel}</strong></div>
        <div><span>Inversión</span><strong>{formatEUR(hotel.constructionCost, true)}</strong></div>
      </div>

      <div className="cost-box">
        <div>
          <span>Ocupación ayer</span>
          <strong>{hotel.lastDayOccupancy ? formatPct(hotel.lastDayOccupancy) : '—'}</strong>
        </div>
        <div>
          <span>Ingresos / día</span>
          <strong>{formatEUR(hotel.lastDayRevenue)}</strong>
        </div>
        <div>
          <span>Costes / día</span>
          <strong>{formatEUR(hotel.lastDayCosts)}</strong>
        </div>
        <div>
          <span>Neto / día</span>
          <strong className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net)}</strong>
        </div>
        <div>
          <span>Ingresos vida</span>
          <strong>{formatEUR(hotel.lifetimeRevenue, true)}</strong>
        </div>
        <div>
          <span>Huéspedes vida</span>
          <strong>{hotel.lifetimeGuests.toLocaleString('es-ES')}</strong>
        </div>
      </div>

      <div className="detail-block">
        <h3>Ubicación</h3>
        <p>
          Turismo {hotel.tourismIndex}/100 · Costa {hotel.beachScore}/100 · Coste local ×{hotel.costIndex} ·
          Impuestos {Math.round(hotel.taxRate * 100)}%
        </p>
        <p className="muted">
          {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)} · inaugurado día {hotel.builtAtGameDay}
        </p>
      </div>

      <div className="detail-block">
        <h3>Servicios</h3>
        <div className="tag-row">
          {hotel.services.map((s) => (
            <span key={s} className="tag">{serviceLabel(s)}</span>
          ))}
        </div>
      </div>

      {sub && (
        <div className="detail-block">
          <h3>Filial</h3>
          <p>{sub.specialty}. {sub.tagline}.</p>
        </div>
      )}
    </aside>
  )
}
