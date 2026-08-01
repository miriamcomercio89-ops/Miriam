import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { serviceLabel, staffLabel } from '../data/events'
import { TARGET_OPTIONS, ROOM_MIX_OPTIONS, QUALITY_OPTIONS, GREEN_OPTIONS } from '../data/catalog'
import { formatEUR, formatPct } from '../lib/format'
import { contractKindLabel, getSeason, seasonLabel } from '../lib/economy'
import { geoRegionLabel } from '../lib/geo'
import { resolveHotelImage } from '../lib/images'
import { getWeather } from '../lib/weather'

export function HotelDetail() {
  const id = useGameStore((s) => s.selectedHotelId)
  const hotel = useGameStore((s) => s.hotels.find((h) => h.id === id))
  const selectHotel = useGameStore((s) => s.selectHotel)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)

  if (!hotel) return null
  const sub = getSubsidiary(hotel.subsidiaryId)
  const targetLabel = TARGET_OPTIONS.find((t) => t.id === hotel.target)?.label ?? hotel.target
  const net = hotel.lastDayRevenue - hotel.lastDayCosts
  const season = seasonLabel(getSeason(hotel.lat, gameMinutes))
  const rep = reputation[hotel.countryCode] ?? 55
  const image = resolveHotelImage(hotel)
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const eco = countryEconomy[hotel.countryCode]

  return (
    <aside className="panel panel--detail">
      <div className="panel__head">
        <div className="detail-title">
          {sub && <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={40} height={40} />}
          <div>
            <p className="panel__eyebrow">{sub?.name ?? 'Marca'}</p>
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
        <div><span>Precio IA / noche</span><strong>{formatEUR(hotel.pricePerNight)}</strong></div>
        <div><span>Personal</span><strong>{staffLabel(hotel.staffLevel)}</strong></div>
        <div><span>Clientes</span><strong>{targetLabel}</strong></div>
        <div><span>Satisfacción</span><strong>{Math.round(hotel.satisfaction)}/100</strong></div>
      </div>

      <div className="cost-box">
        <div><span>Habitaciones llenas</span><strong>{hotel.lastDayOccupancy ? formatPct(hotel.lastDayOccupancy) : '—'}</strong></div>
        <div><span>Ingresos / día</span><strong>{formatEUR(hotel.lastDayRevenue)}</strong></div>
        <div><span>Gastos / día</span><strong>{formatEUR(hotel.lastDayCosts)}</strong></div>
        <div><span>Ganancia / día</span><strong className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net)}</strong></div>
        <div><span>Fama en el país</span><strong>{Math.round(rep)}</strong></div>
        <div><span>Temporada</span><strong>{season}</strong></div>
      </div>

      <div className="detail-block">
        <h3>Tiempo de hoy</h3>
        <p>
          <strong>{weather.label}</strong> — {weather.detail}
        </p>
        <p className="muted">
          Efecto en demanda ×{weather.demandMult.toFixed(2)} · gastos ×{weather.costMult.toFixed(2)}
          {eco ? ` · cambio ×${eco.fx.toFixed(2)} · inflación ${(eco.inflation * 100).toFixed(2)}%/día` : ''}
        </p>
      </div>

      {hotel.contract && (
        <div className="detail-block">
          <h3>Contrato IA · {contractKindLabel(hotel.contract.kind)}</h3>
          <p>
            {hotel.contract.clientName}: {hotel.contract.blockedRooms} habitaciones a{' '}
            {formatEUR(hotel.contract.ratePerNight)}/noche · quedan {hotel.contract.daysRemaining} días
          </p>
          <p className="muted">La IA abre y cierra estos contratos sola (empresas, aerolíneas, eventos, gobierno…).</p>
        </div>
      )}

      <div className="detail-block">
        <h3>Edificio</h3>
        <p>
          {QUALITY_OPTIONS.find((q) => q.id === hotel.buildQuality)?.label ?? 'Acabados'} ·{' '}
          {ROOM_MIX_OPTIONS.find((m) => m.id === hotel.roomMix)?.label ?? 'Habitaciones'} · {hotel.floors} plantas ·{' '}
          {GREEN_OPTIONS.find((g) => g.id === hotel.greenLevel)?.label ?? 'Plan verde'} · {hotel.meetingRooms} salas ·{' '}
          {hotel.parkingSpots} parking
        </p>
      </div>

      <div className="detail-block">
        <h3>Sitio</h3>
        <p>
          {geoRegionLabel(hotel.geoRegion)} · Turismo {hotel.tourismIndex}/100 · Playa {hotel.beachScore}/100 ·
          Coste ×{hotel.costIndex} · Impuestos {Math.round(hotel.taxRate * 100)}%
        </p>
        <p className="muted">
          {hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)} · creado día {hotel.builtAtGameDay} · obra{' '}
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
          <h3>Marca</h3>
          <p>{sub.specialty}. {sub.tagline}.</p>
          <p className="muted">{sub.lore}</p>
        </div>
      )}
    </aside>
  )
}
