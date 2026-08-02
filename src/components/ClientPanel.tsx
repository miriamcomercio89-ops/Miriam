import { useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { SERVICE_CATALOG, TARGET_OPTIONS, BOARD_REGIMES } from '../data/catalog'
import { formatEUR } from '../lib/format'
import { resolveHotelImage } from '../lib/images'
import {
  CLIENT_NEED_IDS,
  CLIENT_NEED_LABEL,
  boardOptionsForHotel,
  clientLevelInfo,
  roomKindsForHotel,
  visibleClientServices,
  serviceExtraCost,
  CLIENT_CEO_CUT,
} from '../lib/clientMode'
import type { BoardRegime, ClientRoomKind, GuestTarget, HotelService } from '../types'

export function ClientPanel() {
  const playMode = useGameStore((s) => s.playMode)
  const hotels = useGameStore((s) => s.hotels)
  const client = useGameStore((s) => s.client)
  const setPlayMode = useGameStore((s) => s.setPlayMode)
  const setClientName = useGameStore((s) => s.setClientName)
  const setClientPrefs = useGameStore((s) => s.setClientPrefs)
  const setClientBookingHotel = useGameStore((s) => s.setClientBookingHotel)
  const clientReserve = useGameStore((s) => s.clientReserve)
  const clientCancelReservation = useGameStore((s) => s.clientCancelReservation)
  const clientCheckIn = useGameStore((s) => s.clientCheckIn)
  const clientCheckOut = useGameStore((s) => s.clientCheckOut)
  const clientUseService = useGameStore((s) => s.clientUseService)
  const clientClearNotes = useGameStore((s) => s.clientClearNotes)
  const clientDismissStay = useGameStore((s) => s.clientDismissStay)
  const [msg, setMsg] = useState<string | null>(null)
  const [roomKind, setRoomKind] = useState<ClientRoomKind>('estandar')
  const [board, setBoard] = useState<BoardRegime>('solo')
  const [tip, setTip] = useState(0)
  const [serviceFocus, setServiceFocus] = useState<HotelService | null>(null)

  const hotel = useMemo(() => {
    const id = client.stay?.hotelId ?? client.bookingHotelId
    return hotels.find((h) => h.id === id) ?? null
  }, [hotels, client.stay, client.bookingHotelId])

  if (playMode !== 'cliente') return null

  const level = clientLevelInfo(client.level)
  const stay = client.stay
  const inStay = stay?.status === 'checked_in'
  const rooms = hotel ? roomKindsForHotel(hotel) : []
  const boards = hotel ? boardOptionsForHotel(hotel) : []
  const services = hotel ? visibleClientServices(hotel) : []
  const sub = hotel ? getSubsidiary(hotel.subsidiaryId) : null
  const image = hotel ? resolveHotelImage(hotel) : ''

  function togglePref(id: GuestTarget) {
    const has = client.prefs.includes(id)
    setClientPrefs(has ? client.prefs.filter((p) => p !== id) : [...client.prefs, id])
  }

  function doReserve() {
    if (!hotel) {
      setMsg('Elige un hotel en el mapa.')
      return
    }
    const res = clientReserve(hotel.id, roomKind, board)
    setMsg(res.ok ? null : res.error)
  }

  function doCheckIn() {
    const res = clientCheckIn()
    setMsg(res.ok ? null : res.error)
  }

  function doService(id: HotelService) {
    const res = clientUseService(id, tip)
    setMsg(res.ok ? null : res.error)
    if (res.ok) setServiceFocus(id)
  }

  // Pantalla de estancia a pantalla completa (sin mapa de fondo)
  if (inStay && hotel) {
    return (
      <div className="client-stay">
        <header className="client-stay__head">
          <div>
            <p className="panel__eyebrow">Club Huésped Orbis · {level.name}</p>
            <h2>{hotel.name}</h2>
            <p className="panel__meta">
              {hotel.city} · {sub?.name} · Habitación {stay.roomKind.replace('_', ' ')} · pareja
            </p>
          </div>
          <button type="button" className="chip" onClick={() => setPlayMode('gerente')}>
            Gerente
          </button>
        </header>

        <div className="client-stay__grid">
          <div className="client-stay__photo">
            <img src={image} alt={hotel.name} />
          </div>

          <div className="client-stay__needs">
            <h3>Tus necesidades</h3>
            <div className="client-needs">
              {CLIENT_NEED_IDS.map((id) => (
                <div key={id} className="client-needs__row">
                  <span>{CLIENT_NEED_LABEL[id]}</span>
                  <div className="client-needs__bar">
                    <i style={{ width: `${client.needs[id]}%` }} />
                  </div>
                  <em>{Math.round(client.needs[id])}</em>
                </div>
              ))}
            </div>
            <div className="cost-box" style={{ marginTop: '0.75rem' }}>
              <div>
                <span>Monedero</span>
                <strong>{formatEUR(client.wallet)}</strong>
              </div>
              <div>
                <span>Puntos</span>
                <strong>{client.points.toLocaleString('es-ES')}</strong>
              </div>
              <div>
                <span>Nivel</span>
                <strong>
                  {client.level} · {level.name}
                </strong>
              </div>
              <div>
                <span>Salario CEO</span>
                <strong>{(CLIENT_CEO_CUT * 100).toFixed(1)}% ingresos del hotel / noche</strong>
              </div>
            </div>
          </div>

          <div className="client-stay__services">
            <h3>Servicios del hotel</h3>
            <label className="field">
              <span>Propina al usar servicio (€)</span>
              <input type="number" min={0} max={500} value={tip} onChange={(e) => setTip(Number(e.target.value) || 0)} />
            </label>
            <div className="client-service-list">
              {services.length === 0 ? (
                <p className="muted">Este hotel no tiene servicios extra configurados.</p>
              ) : (
                services.map((id) => {
                  const meta = SERVICE_CATALOG.find((s) => s.id === id)
                  const cost = serviceExtraCost(id, hotel)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`client-service ${serviceFocus === id ? 'is-active' : ''}`}
                      onClick={() => doService(id)}
                    >
                      <strong>{meta?.label ?? id}</strong>
                      <span>
                        {meta?.group} · {formatEUR(cost)}
                        {['spa', 'restaurante', 'concierge'].includes(id) ? ' · detalle' : ''}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            {serviceFocus === 'spa' && hotel.services.includes('spa') && (
              <div className="client-detail-card">
                <h4>Spa</h4>
                <p>Circuito de aguas, sauna si existe, y masaje de 40 min. Reserva en recepción del spa.</p>
                <p className="muted">Efecto: relax, higiene y algo de energía.</p>
              </div>
            )}
            {(serviceFocus === 'restaurante' || serviceFocus === 'all_inclusive') && (
              <div className="client-detail-card">
                <h4>Gastronomía</h4>
                <p>
                  {hotel.restaurantConcepts?.length
                    ? `Carta: ${hotel.restaurantConcepts.join(', ')}.`
                    : 'Restaurante del hotel.'}{' '}
                  {hotel.buffetTypes?.length ? `Buffets: ${hotel.buffetTypes.join(', ')}.` : ''}{' '}
                  Horario orientativo: desayuno 7–11 · comida 13–16 · cena 19–23.
                </p>
              </div>
            )}
            {serviceFocus === 'concierge' && hotel.services.includes('concierge') && (
              <div className="client-detail-card">
                <h4>Conserjería</h4>
                <p>Pide taxi, mesa, entradas o late checkout. El personal del hotel te atiende según su nivel de staffing.</p>
              </div>
            )}

            {msg && <p className="error">{msg}</p>}
            <div className="speed-group" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const res = clientCheckOut()
                  setMsg(res.ok ? null : res.error)
                }}
              >
                Check-out
              </button>
            </div>
          </div>
        </div>

        {client.notifications[0] && (
          <p className="client-toast" onClick={() => clientClearNotes()}>
            {client.notifications[0]}
          </p>
        )}
      </div>
    )
  }

  // Panel lateral: perfil + reserva
  return (
    <aside className="panel panel--client">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Club Huésped Orbis</p>
          <h2>Cliente</h2>
          <p className="panel__meta">
            Nv.{client.level} {level.name} · {client.points.toLocaleString('es-ES')} pts · {formatEUR(client.wallet)}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setPlayMode('gerente')} aria-label="Volver a gerente" title="Gerente">
          ×
        </button>
      </div>

      <div className="panel__body">
        {hotels.length === 0 ? (
          <p className="error">Construye al menos un hotel en modo Gerente.</p>
        ) : (
          <>
            <label className="field">
              <span>Tu nombre</span>
              <input value={client.name} onChange={(e) => setClientName(e.target.value)} />
            </label>

            <p className="mini-title">Preferencias</p>
            <div className="speed-group" style={{ marginBottom: '0.75rem' }}>
              {TARGET_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={client.prefs.includes(t.id) ? 'chip chip--active' : 'chip'}
                  onClick={() => togglePref(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="muted">Viajas en pareja (no la controlas).</p>

            <div className="cost-box">
              <div>
                <span>Noches</span>
                <strong>{client.totalNights}</strong>
              </div>
              <div>
                <span>Sellos pasaporte</span>
                <strong>{client.passport.length}</strong>
              </div>
              <div>
                <span>Descuento nivel</span>
                <strong>{Math.round(level.discount * 100)}%</strong>
              </div>
            </div>

            {CLIENT_NEED_IDS.slice(0, 5).map((id) => (
              <div key={id} className="client-needs__row" style={{ padding: '0 0 0.25rem' }}>
                <span>{CLIENT_NEED_LABEL[id]}</span>
                <div className="client-needs__bar">
                  <i style={{ width: `${client.needs[id]}%` }} />
                </div>
              </div>
            ))}

            <p className="mini-title">Reservar esta noche</p>
            <p className="muted">Clic en un hotel del mapa para elegirlo.</p>

            {hotel && sub && (
              <div className="filial-selected" style={{ marginTop: '0.5rem' }}>
                <img className="filial-logo filial-logo--md" src={subsidiaryLogoSvg(sub, 128)} alt="" />
                <div>
                  <strong>{hotel.name}</strong>
                  <span>
                    {sub.name} · {hotel.city} · {'★'.repeat(hotel.stars)}
                  </span>
                </div>
              </div>
            )}

            {hotel && (
              <>
                <label className="field">
                  <span>Habitación</span>
                  <select
                    value={roomKind}
                    onChange={(e) => setRoomKind(e.target.value as ClientRoomKind)}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Régimen</span>
                  <select value={board} onChange={(e) => setBoard(e.target.value as BoardRegime)}>
                    {boards.map((id) => (
                      <option key={id} value={id}>
                        {BOARD_REGIMES.find((b) => b.id === id)?.label ?? id}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {stay && stay.status !== 'checked_out' ? (
              <div className="detail-block" style={{ padding: 0 }}>
                <p>
                  Estado: <strong>{stay.status}</strong>
                  {stay.status === 'waitlist' ? ' (automática)' : ''}
                </p>
                <p className="muted">Precio pareja: {formatEUR(stay.pricePaid)}</p>
                <div className="speed-group">
                  {stay.status === 'reserved' && (
                    <button type="button" className="btn btn--primary" onClick={doCheckIn}>
                      Check-in
                    </button>
                  )}
                  {stay.status !== 'checked_in' && (
                    <button type="button" className="btn btn--ghost" onClick={() => clientCancelReservation()}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="speed-group">
                <button type="button" className="btn btn--primary" disabled={!hotel} onClick={doReserve}>
                  Reservar esta noche
                </button>
                {hotel && (
                  <button type="button" className="chip" onClick={() => setClientBookingHotel(null)}>
                    Quitar hotel
                  </button>
                )}
              </div>
            )}

            {stay?.status === 'checked_out' && (
              <button type="button" className="chip" style={{ marginTop: '0.5rem' }} onClick={() => clientDismissStay()}>
                Cerrar estancia anterior
              </button>
            )}

            {msg && <p className="error">{msg}</p>}

            {client.notifications.length > 0 && (
              <div className="news-list" style={{ marginTop: '0.75rem', maxHeight: 160 }}>
                {client.notifications.slice(0, 4).map((n, i) => (
                  <article key={`${i}-${n.slice(0, 12)}`} className="news-card news-card--neutral">
                    <p>{n}</p>
                  </article>
                ))}
                <button type="button" className="linkish" onClick={() => clientClearNotes()}>
                  Limpiar avisos
                </button>
              </div>
            )}

            {client.passport.length > 0 && (
              <>
                <p className="mini-title">Pasaporte</p>
                <div className="tag-row">
                  {client.passport.slice(0, 12).map((p) => {
                    const brand = getSubsidiary(p.subsidiaryId)
                    return (
                      <span key={`${p.countryCode}-${p.subsidiaryId}`} className="tag">
                        {p.countryCode} · {brand?.letter ?? '?'}
                      </span>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
