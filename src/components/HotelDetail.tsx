import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { serviceLabel, staffLabel } from '../data/events'
import {
  TARGET_OPTIONS,
  ROOM_MIX_OPTIONS,
  QUALITY_OPTIONS,
  GREEN_OPTIONS,
  SECURITY_OPTIONS,
  TECH_OPTIONS,
  BOARD_REGIMES,
} from '../data/catalog'
import { formatEUR, formatPct } from '../lib/format'
import { contractKindLabel, getSeason, seasonLabel } from '../lib/economy'
import { boardLabel } from '../lib/loyalty'
import { geoRegionLabel } from '../lib/geo'
import { resolveHotelImage } from '../lib/images'
import { getWeather } from '../lib/weather'

export function HotelDetail() {
  const id = useGameStore((s) => s.selectedHotelId)
  const hotel = useGameStore((s) => s.hotels.find((h) => h.id === id))
  const hotels = useGameStore((s) => s.hotels)
  const selectHotel = useGameStore((s) => s.selectHotel)
  const focusNextHotel = useGameStore((s) => s.focusNextHotel)
  const setCompareSlot = useGameStore((s) => s.setCompareSlot)
  const setShowCompare = useGameStore((s) => s.setShowCompare)
  const showHotelSpecs = useGameStore((s) => s.showHotelSpecs)
  const setShowHotelSpecs = useGameStore((s) => s.setShowHotelSpecs)
  const compareIds = useGameStore((s) => s.compareIds)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)
  const loyaltyLevel = useGameStore((s) => s.loyaltyLevel)

  if (!hotel) return null
  const sub = getSubsidiary(hotel.subsidiaryId)
  const targetLabel = TARGET_OPTIONS.find((t) => t.id === hotel.target)?.label ?? hotel.target
  const net = hotel.lastDayRevenue - hotel.lastDayCosts
  const season = seasonLabel(getSeason(hotel.lat, gameMinutes))
  const rep = reputation[hotel.countryCode] ?? 55
  const image = resolveHotelImage(hotel)
  const weather = getWeather(hotel.lat, gameMinutes, hotel.id)
  const eco = countryEconomy[hotel.countryCode]
  const idx = hotels.findIndex((h) => h.id === hotel.id)
  const condition = hotel.condition ?? 100

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

      <div className="speed-group" style={{ margin: '0 1rem 0.5rem' }}>
        <button type="button" className="chip" disabled={hotels.length < 2} onClick={() => focusNextHotel(-1)}>
          ← Anterior
        </button>
        <button type="button" className="chip" disabled={hotels.length < 2} onClick={() => focusNextHotel(1)}>
          Siguiente →
        </button>
        <button
          type="button"
          className={showHotelSpecs ? 'chip chip--active' : 'chip'}
          onClick={() => setShowHotelSpecs(!showHotelSpecs)}
          title="Ver opciones de construcción (solo lectura)"
        >
          Opciones
        </button>
        <span className="muted" style={{ fontSize: '0.75rem' }}>
          {idx + 1}/{hotels.length}
        </span>
      </div>

      <img src={image} alt={hotel.name} className="hotel-hero-img" />

      {hotel.vipTonight && (
        <p className="confirm-note" style={{ margin: '0.5rem 1rem' }}>
          Hoy hay un huésped VIP en este hotel.
        </p>
      )}

      <div className="insight-grid">
        <div><span>Estrellas</span><strong>{'★'.repeat(hotel.stars)}</strong></div>
        <div><span>Habitaciones</span><strong>{hotel.rooms}</strong></div>
        <div><span>Precio IA / noche</span><strong>{formatEUR(hotel.pricePerNight)}</strong></div>
        <div><span>Régimen</span><strong>{boardLabel(hotel.boardRegime ?? 'solo')}</strong></div>
        <div><span>Estado edificio</span><strong>{Math.round(condition)}/100</strong></div>
        <div><span>Satisfacción</span><strong>{Math.round(hotel.satisfaction)}/100</strong></div>
      </div>

      <div className="cost-box">
        <div><span>Habitaciones llenas</span><strong>{hotel.lastDayOccupancy ? formatPct(hotel.lastDayOccupancy) : '—'}</strong></div>
        <div><span>Ingresos / día</span><strong>{formatEUR(hotel.lastDayRevenue)}</strong></div>
        <div><span>Gastos / día</span><strong>{formatEUR(hotel.lastDayCosts)}</strong></div>
        <div><span>Impuestos / día</span><strong>{formatEUR(hotel.lastDayTax)}</strong></div>
        <div><span>Ganancia / día</span><strong className={net >= 0 ? 'pos' : 'neg'}>{formatEUR(net)}</strong></div>
        <div><span>Personal</span><strong>{staffLabel(hotel.staffLevel)}</strong></div>
        <div><span>Clientes</span><strong>{targetLabel}</strong></div>
        <div><span>Temporada</span><strong>{season}</strong></div>
      </div>

      {showHotelSpecs && (
        <div className="detail-block">
          <h3>Opciones de construcción (solo lectura)</h3>
          <p className="muted">No se puede cambiar después de crear el hotel.</p>
          <div className="cost-box">
            <div><span>Marca</span><strong>{sub?.name ?? '—'}</strong></div>
            <div><span>Estrellas</span><strong>{hotel.stars}</strong></div>
            <div><span>Habitaciones</span><strong>{hotel.rooms}</strong></div>
            <div><span>Personal</span><strong>{staffLabel(hotel.staffLevel)}</strong></div>
            <div><span>Clientes</span><strong>{targetLabel}</strong></div>
            <div><span>Habitaciones tipo</span><strong>{ROOM_MIX_OPTIONS.find((m) => m.id === hotel.roomMix)?.label}</strong></div>
            <div><span>Régimen</span><strong>{BOARD_REGIMES.find((b) => b.id === hotel.boardRegime)?.label}</strong></div>
            <div><span>Calidad</span><strong>{QUALITY_OPTIONS.find((q) => q.id === hotel.buildQuality)?.label}</strong></div>
            <div><span>Plantas</span><strong>{hotel.floors}</strong></div>
            <div><span>Plan verde</span><strong>{GREEN_OPTIONS.find((g) => g.id === hotel.greenLevel)?.label}</strong></div>
            <div><span>Seguridad</span><strong>{SECURITY_OPTIONS.find((s) => s.id === hotel.securityLevel)?.label}</strong></div>
            <div><span>Tecnología</span><strong>{TECH_OPTIONS.find((t) => t.id === hotel.techLevel)?.label}</strong></div>
            <div><span>Salas</span><strong>{hotel.meetingRooms}</strong></div>
            <div><span>Parking</span><strong>{hotel.parkingSpots}</strong></div>
            <div><span>Restaurante</span><strong>{hotel.restaurantLevel}</strong></div>
            <div><span>Vistas mar</span><strong>{hotel.seaViewShare}%</strong></div>
            <div><span>Desayuno</span><strong>{hotel.breakfastIncluded ? 'Sí' : 'No'}</strong></div>
            <div><span>Fidelidad hotel</span><strong>{hotel.loyaltyProgram ? 'Sí' : 'No'}</strong></div>
            <div><span>Club grupo</span><strong>Nivel {loyaltyLevel}</strong></div>
            <div><span>Última reforma</span><strong>{hotel.lastRenovationDay ? `día ${hotel.lastRenovationDay}` : '—'}</strong></div>
          </div>
          <div className="tag-row" style={{ marginTop: '0.5rem' }}>
            {hotel.services.map((s) => (
              <span key={s} className="tag">{serviceLabel(s)}</span>
            ))}
          </div>
        </div>
      )}

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
        </div>
      )}

      <div className="detail-block">
        <h3>Seguro (IA)</h3>
        {hotel.insurance?.active ? (
          <p>
            Activo · {formatEUR(hotel.insurance.dailyCost)}/día · cubre ~{Math.round(hotel.insurance.cover * 100)}%.
          </p>
        ) : (
          <p className="muted">Sin seguro hoy. La IA lo activa cuando hace falta.</p>
        )}
      </div>

      <div className="detail-block">
        <h3>Sitio</h3>
        <p>
          {geoRegionLabel(hotel.geoRegion)} · Turismo {hotel.tourismIndex}/100 · Playa {hotel.beachScore}/100 ·
          Coste ×{hotel.costIndex} · Impuestos {Math.round(hotel.taxRate * 100)}% · Fama {Math.round(rep)}
        </p>
      </div>

      {!showHotelSpecs && (
        <div className="detail-block">
          <h3>Servicios</h3>
          <div className="tag-row">
            {hotel.services.map((s) => (
              <span key={s} className="tag">{serviceLabel(s)}</span>
            ))}
          </div>
        </div>
      )}

      <div className="detail-block">
        <h3>Comparar</h3>
        <div className="speed-group">
          <button type="button" className="chip" onClick={() => { setCompareSlot(0, hotel.id); setShowCompare(true) }}>
            Como hotel A{compareIds[0] === hotel.id ? ' ✓' : ''}
          </button>
          <button type="button" className="chip" onClick={() => { setCompareSlot(1, hotel.id); setShowCompare(true) }}>
            Como hotel B{compareIds[1] === hotel.id ? ' ✓' : ''}
          </button>
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
