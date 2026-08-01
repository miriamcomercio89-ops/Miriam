import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { serviceLabel, staffLabel } from '../data/events'
import { TARGET_OPTIONS } from '../data/catalog'
import { formatEUR, formatPct } from '../lib/format'
import { getSeason, seasonLabel } from '../lib/economy'
import { geoRegionLabel } from '../lib/geo'
import { resolveHotelImage } from '../lib/images'

export function HotelDetail() {
  const id = useGameStore((s) => s.selectedHotelId)
  const hotel = useGameStore((s) => s.hotels.find((h) => h.id === id))
  const selectHotel = useGameStore((s) => s.selectHotel)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)

  if (!hotel) return null
  const sub = getSubsidiary(hotel.subsidiaryId)
  const targetLabel = TARGET_OPTIONS.find((t) => t.id === hotel.target)?.label ?? hotel.target
  const net = hotel.lastDayRevenue - hotel.lastDayCosts
  const season = seasonLabel(getSeason(hotel.lat, gameMinutes))
  const rep = reputation[hotel.countryCode] ?? 55
  const image = resolveHotelImage(hotel)

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
        <button type="button" className="icon-btn" onClick={() => selectHotel(null)} aria-label="Cerrar" title="Cerrar (Esc)">
          ×
        </button>
      </div>

      <img src={image} alt={hotel.name} className="hotel-hero-img" />

      <div className="insight-grid">
        <div><span>Estrellas</span><strong>{'★'.repeat(hotel.stars)}</strong></div>
        <div><span>Habitaciones</span><strong>{hotel.rooms}</strong></div>
        <div><span>Precio IA / noche</span><strong title="Gestionado por Orbis Pricing AI">{formatEUR(hotel.pricePerNight)}</strong></div>
        <div><span>Personal</span><strong>{staffLabel(hotel.staffLevel)}</strong></div>
        <div><span>Público</span><strong>{targetLabel}</strong></div>
        <div><span>Satisfacción</span><strong>{Math.round(hotel.satisfaction)}/100</strong></div>
      </div>

      <div className="cost-box">
        <div><span>Ocupación</span><strong>{hotel.lastDayOccupancy ? formatPct(hotel.lastDayOccupancy) : '—'}</strong></div>
        <div><span>Ingresos / día</span><strong>{formatEUR(hotel.lastDayRevenue)}</strong></div>
        <div><span>Costes / día</span><strong>{formatEUR(hotel.lastDayCosts)}</strong></div>
        <div><span>Neto / día</span><strong className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net)}</strong></div>
        <div><span>Reputación país</span><strong>{Math.round(rep)}</strong></div>
        <div><span>Temporada local</span><strong>{season}</strong></div>
      </div>

      {hotel.contract && (
        <div className="detail-block">
          <h3>Contrato corporativo (IA)</h3>
          <p>
            {hotel.contract.clientName}: {hotel.contract.blockedRooms} hab. a{' '}
            {formatEUR(hotel.contract.ratePerNight)}/noche · {hotel.contract.daysRemaining} días restantes
          </p>
          <p className="muted">La IA Orbis Contracts abre, renueva o cierra estos bloques automáticamente.</p>
        </div>
      )}

      <div className="detail-block">
        <h3>Ubicación</h3>
        <p>
          {geoRegionLabel(hotel.geoRegion)} · Turismo {hotel.tourismIndex}/100 · Costa {hotel.beachScore}/100 ·
          Coste ×{hotel.costIndex} · Impuestos {Math.round(hotel.taxRate * 100)}%
        </p>
        <p className="muted">
          {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)} · día {hotel.builtAtGameDay} · inversión{' '}
          {formatEUR(hotel.constructionCost, true)}
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
          <p className="muted">{sub.lore}</p>
        </div>
      )}
    </aside>
  )
}
