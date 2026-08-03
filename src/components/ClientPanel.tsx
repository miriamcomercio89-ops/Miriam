import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { SERVICE_CATALOG, TARGET_OPTIONS, BOARD_REGIMES } from '../data/catalog'
import { formatEUR, gameDay } from '../lib/format'
import { resolveHotelImage } from '../lib/images'
import {
  CLIENT_NEED_IDS,
  CLIENT_NEED_LABEL,
  boardOptionsForHotel,
  clientLevelInfo,
  roomKindsForHotel,
  visibleClientServices,
  CLIENT_CEO_CUT,
  calcStayTotalPrice,
  earlyCheckinFee,
  lateCheckoutFee,
  calcGuestNightPrice,
  formatAppointmentClock,
} from '../lib/clientMode'
import {
  clientPerkInfo,
  type PointRedeemId,
} from '../lib/clientClub'
import { buildServiceScreen, FREE_NIGHT_POINTS } from '../lib/clientServices'
import { minigameForAction, LOBBY_ACTIVITIES, type MinigameId } from '../lib/clientMinigames'
import { lobbyEventForDay } from '../lib/clientLobbyEvents'
import { PARTNER_ORDERS, PARTNER_ORDERS_PER_NIGHT } from '../lib/clientPartner'
import { serviceHoursStatus, clockFromGameMinutes } from '../lib/clientHours'
import { ClientMinigame } from './ClientMinigame'
import { ClientClubHub } from './ClientClubHub'
import { ClientNightRecap } from './ClientNightRecap'
import type { BoardRegime, ClientRoomKind, GuestTarget, HotelService } from '../types'

type ActiveMini = {
  id: MinigameId
  service: HotelService
  actionId: string
  entryCost: number
}

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
  const clientBeginMinigame = useGameStore((s) => s.clientBeginMinigame)
  const clientBeginLobbyActivity = useGameStore((s) => s.clientBeginLobbyActivity)
  const clientFinishMinigame = useGameStore((s) => s.clientFinishMinigame)
  const clientClaimMission = useGameStore((s) => s.clientClaimMission)
  const clientRedeemPoints = useGameStore((s) => s.clientRedeemPoints)
  const clientClearNotes = useGameStore((s) => s.clientClearNotes)
  const clientDismissStay = useGameStore((s) => s.clientDismissStay)
  const clientOrderRoomServiceCart = useGameStore((s) => s.clientOrderRoomServiceCart)
  const setPartnerMode = useGameStore((s) => s.setPartnerMode)
  const clientPartnerOrder = useGameStore((s) => s.clientPartnerOrder)
  const gameMinutes = useGameStore((s) => s.gameMinutes)

  const [msg, setMsg] = useState<string | null>(null)
  const [roomKind, setRoomKind] = useState<ClientRoomKind>('estandar')
  const [board, setBoard] = useState<BoardRegime>('solo')
  const [tip, setTip] = useState(0)
  const [nights, setNights] = useState(1)
  const [serviceFocus, setServiceFocus] = useState<HotelService | null>(null)
  const [mini, setMini] = useState<ActiveMini | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [sideTab, setSideTab] = useState<'viaje' | 'club'>('viaje')
  const [stayTab, setStayTab] = useState<'actividad' | 'servicios' | 'pareja' | 'club'>('actividad')

  const hotel = useMemo(() => {
    const stay = client.stay
    const activeStay = stay && stay.status !== 'checked_out'
    const id = activeStay ? stay.hotelId : client.bookingHotelId
    return id ? hotels.find((h) => h.id === id) ?? null : null
  }, [hotels, client.stay, client.bookingHotelId])

  const serviceScreen = useMemo(() => {
    if (!hotel || !serviceFocus) return null
    return buildServiceScreen(serviceFocus, hotel)
  }, [hotel, serviceFocus])

  const day = gameDay(gameMinutes)
  const lobbyEvent = lobbyEventForDay(day)
  const lobbyPriceMult = lobbyEvent.priceMult

  const sortedLobby = useMemo(() => {
    const featured = new Set(lobbyEvent.featured)
    return [...LOBBY_ACTIVITIES].sort((a, b) => {
      const af = featured.has(a.id) ? 0 : 1
      const bf = featured.has(b.id) ? 0 : 1
      return af - bf
    })
  }, [lobbyEvent])

  // Atajos 1–9 en estancia (animación / servicios)
  useEffect(() => {
    if (playMode !== 'cliente') return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const st = useGameStore.getState()
      if (st.playMode !== 'cliente' || st.client.stay?.status !== 'checked_in') return
      if (e.key === '9') {
        setStayTab('pareja')
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= 8) {
        e.preventDefault()
        setStayTab('actividad')
        const act = sortedLobby[n - 1]
        if (!act) return
        const res = st.clientBeginLobbyActivity(act.id, act.cost)
        if (!res.ok) {
          setMsg(res.error)
          return
        }
        setMsg(null)
        setMini({ id: act.id, service: 'concierge', actionId: 'lobby', entryCost: res.entryCost })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playMode, sortedLobby])

  if (playMode !== 'cliente') return null

  const level = clientLevelInfo(client.level)
  const currentPerk = clientPerkInfo(client.level)
  const stay = client.stay
  const inStay = stay?.status === 'checked_in'
  const rooms = hotel ? roomKindsForHotel(hotel) : []
  const boards = hotel ? boardOptionsForHotel(hotel) : []
  const services = hotel ? visibleClientServices(hotel) : []
  const sub = hotel ? getSubsidiary(hotel.subsidiaryId) : null
  const image = hotel ? resolveHotelImage(hotel) : ''

  // Pricing for reserve form
  const nightPrice = hotel ? calcGuestNightPrice(hotel, roomKind, board, client.level, client.specialize) : 0
  const totalPrice = hotel ? calcStayTotalPrice(hotel, roomKind, board, client.level, nights, client.specialize) : 0
  const earlyFee = hotel ? earlyCheckinFee(nightPrice, client.level) : 0

  // Pricing for active stay
  const stayNightPrice =
    hotel && stay
      ? calcGuestNightPrice(hotel, stay.roomKind, stay.boardRegime, client.level, client.specialize)
      : 0
  const lateFee = hotel && stay ? lateCheckoutFee(hotel, stayNightPrice, client.level) : 0

  function togglePref(id: GuestTarget) {
    const has = client.prefs.includes(id)
    setClientPrefs(has ? client.prefs.filter((p) => p !== id) : [...client.prefs, id])
  }

  function doReserve() {
    if (!hotel) {
      setMsg('Elige un hotel en el mapa.')
      return
    }
    const res = clientReserve(hotel.id, roomKind, board, nights)
    setMsg(res.ok ? null : res.error)
  }

  function doCheckIn(early = false) {
    const res = clientCheckIn(early ? { early: true } : undefined)
    setMsg(res.ok ? null : res.error)
  }

  function doCheckOut(late = false) {
    const res = clientCheckOut(late ? { late: true } : undefined)
    setMsg(res.ok ? null : res.error)
    setServiceFocus(null)
  }

  function doAction(actionId: string) {
    if (!serviceFocus) return
    if (serviceFocus === 'room_service_24h') {
      setCart((c) => ({ ...c, [actionId]: (c[actionId] ?? 0) + 1 }))
      setMsg(null)
      return
    }
    const mg = minigameForAction(serviceFocus, actionId)
    const action = serviceScreen?.actions.find((a) => a.id === actionId)
    if (mg && action?.minigame) {
      const res = clientBeginMinigame(serviceFocus, tip, actionId)
      if (!res.ok) {
        setMsg(res.error)
        return
      }
      setMsg(null)
      setMini({ id: mg, service: serviceFocus, actionId, entryCost: res.entryCost })
      return
    }
    const res = clientUseService(serviceFocus, tip, actionId)
    setMsg(res.ok ? null : res.error)
  }

  function doOrderCart() {
    const items = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([actionId, qty]) => ({ actionId, qty }))
    const res = clientOrderRoomServiceCart(items, tip)
    if (res.ok) {
      setCart({})
      setMsg(null)
    } else {
      setMsg(res.error)
    }
  }

  function doClaim(id: string) {
    const res = clientClaimMission(id)
    setMsg(res.ok ? null : res.error)
  }

  function doRedeem(id: PointRedeemId) {
    const res = clientRedeemPoints(id)
    setMsg(res.ok ? null : res.error)
  }

  function doLobby(id: MinigameId, cost: number) {
    const res = clientBeginLobbyActivity(id, cost)
    if (!res.ok) {
      setMsg(res.error)
      return
    }
    setMsg(null)
    setMini({ id, service: 'concierge', actionId: 'lobby', entryCost: res.entryCost })
  }

  function clearHotelSelection() {
    setClientBookingHotel(null)
    setMsg(null)
  }

  function doPartnerOrder(id: (typeof PARTNER_ORDERS)[number]['id']) {
    const res = clientPartnerOrder(id)
    setMsg(res.ok ? null : res.error)
  }

  const clubHub = <ClientClubHub onRedeem={doRedeem} onMsg={setMsg} />

  const incomeBlock = client.lastIncome ? (
    <div className="client-income">
      <p className="mini-title">Último ingreso nocturno</p>
      <p className="client-income__total">{formatEUR(client.lastIncome.total)}</p>
      <ul>
        {client.lastIncome.factors.map((f) => (
          <li key={f.id}>
            <span>{f.label}</span>
            <strong>{formatEUR(f.amount)}</strong>
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: '0.75rem' }}>
        Ganas según hotel, cadena Orbis, ocupación, clima, nivel, pareja y evento del día.
      </p>
    </div>
  ) : (
    <div className="client-income client-income--empty">
      <p className="mini-title">Ingresos del huésped</p>
      <p className="muted">
        Cada noche cobras dieta + corte del hotel + parte de lo que genera toda tu cadena.
      </p>
    </div>
  )

  const partnerNeedsBlock = (
    <div className="client-partner-needs" style={{ marginTop: '0.75rem' }}>
      <p className="mini-title" style={{ marginBottom: '0.25rem' }}>
        Estado pareja&ensp;
        <span className="muted" style={{ fontSize: '0.75em', fontWeight: 400 }}>
          NPC
        </span>
      </p>
      {CLIENT_NEED_IDS.slice(0, 5).map((id) => (
        <div key={id} className="client-needs__row" style={{ fontSize: '0.8em' }}>
          <span>{CLIENT_NEED_LABEL[id]}</span>
          <div className="client-needs__bar">
            <i style={{ width: `${client.partnerNeeds[id]}%`, opacity: 0.65 }} />
          </div>
          <em>{Math.round(client.partnerNeeds[id])}</em>
        </div>
      ))}
    </div>
  )

  const partnerBlock = (
    <div className="client-partner-panel">
      <div className="client-partner-panel__mode">
        <p className="mini-title">Pareja</p>
        <div className="speed-group">
          <button
            type="button"
            className={client.partnerMode === 'auto' ? 'chip chip--active' : 'chip'}
            onClick={() => setPartnerMode('auto')}
          >
            Auto
          </button>
          <button
            type="button"
            className={client.partnerMode === 'orders' ? 'chip chip--active' : 'chip'}
            onClick={() => setPartnerMode('orders')}
          >
            Órdenes ({client.partnerOrdersLeft}/{PARTNER_ORDERS_PER_NIGHT})
          </button>
        </div>
      </div>
      {client.partnerMode === 'orders' ? (
        <div className="client-partner-orders">
          {PARTNER_ORDERS.map((o) => (
            <button
              key={o.id}
              type="button"
              className="client-lobby__card"
              disabled={client.partnerOrdersLeft <= 0}
              onClick={() => doPartnerOrder(o.id)}
            >
              <strong>{o.label}</strong>
              <span>{o.detail}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="muted">La pareja actúa sola cada noche (bonus menor de ingresos).</p>
      )}
      {partnerNeedsBlock}
    </div>
  )

  const eventBanner = (
    <div className={`client-event client-event--${lobbyEvent.tone}`}>
      <div>
        <p className="client-event__eyebrow">Evento del día</p>
        <strong>{lobbyEvent.title}</strong>
        <span>{lobbyEvent.detail}</span>
      </div>
      <em>
        ×{lobbyEvent.priceMult.toFixed(2)} precios
        {lobbyEvent.incomeBonus > 0 ? ` · +${lobbyEvent.incomeBonus} €/noche` : ''}
      </em>
    </div>
  )

  const lobbyBlock = (
    <div className="client-lobby">
      {eventBanner}
      <h3>Animación del resort</h3>
      <p className="muted">Teclas 1–8 · destacados del evento primero</p>
      <div className="client-lobby__grid">
        {sortedLobby.map((a, i) => {
          const featured = lobbyEvent.featured.includes(a.id)
          const cost = Math.round(a.cost * lobbyPriceMult)
          return (
            <button
              key={a.id}
              type="button"
              className={`client-lobby__card${featured ? ' is-featured' : ''}`}
              onClick={() => doLobby(a.id, a.cost)}
            >
              <strong>
                <kbd>{i + 1}</kbd> {a.label}
              </strong>
              <span>{a.detail}</span>
              <em>
                {formatEUR(cost)} · +{a.points} pts
                {featured ? ' · destacado' : ''}
              </em>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Shared blocks ────────────────────────────────────────────────────────────

  const missionsBlock = (
    <div className="client-missions">
      <h3>Misiones</h3>
      {client.missions.length === 0 ? (
        <p className="muted">Sin misiones activas. Entra al modo Cliente o avanza un día.</p>
      ) : (
        <ul className="client-missions__list">
          {client.missions.map((m) => (
            <li key={m.id} className={`client-mission ${m.done ? 'is-done' : ''} ${m.claimed ? 'is-claimed' : ''}`}>
              <div>
                <strong>
                  {m.kind === 'weekly' ? 'Semanal' : 'Diaria'} · {m.title}
                </strong>
                <span>{m.description}</span>
                <em>
                  {m.progress}/{m.target} · +{m.rewardPoints} pts · {formatEUR(m.rewardWallet)}
                </em>
              </div>
              {m.done && !m.claimed ? (
                <button type="button" className="chip chip--active" onClick={() => doClaim(m.id)}>
                  Cobrar
                </button>
              ) : m.claimed ? (
                <span className="client-mission__tag">Cobrada</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <p className="muted client-missions__hint">
        Canje noche gratis: {FREE_NIGHT_POINTS} pts (reserva → canje → check-in).
      </p>
    </div>
  )

  const notesBlock =
    client.notifications.length > 0 ? (
      <div className="client-notes">
        {client.notifications.slice(0, 5).map((n, i) => (
          <article key={`${i}-${n.slice(0, 16)}`} className="client-notes__item">
            <p>{n}</p>
          </article>
        ))}
        <button type="button" className="linkish" onClick={() => clientClearNotes()}>
          Limpiar avisos
        </button>
      </div>
    ) : null

  const miniOverlay = mini ? (
    <ClientMinigame
      id={mini.id}
      entryCost={mini.entryCost}
      wallet={client.wallet}
      onCancel={() => setMini(null)}
      onDone={(outcome) => {
        const res = clientFinishMinigame(outcome)
        setMsg(res.ok ? null : res.error)
        setMini(null)
      }}
    />
  ) : null

  // ── Stay fullscreen view ─────────────────────────────────────────────────────

  if (inStay && hotel) {
    return (
      <div className="client-stay">
        <ClientNightRecap />
        {miniOverlay}
        <header className="client-stay__head">
          <div>
            <p className="panel__eyebrow">
              Club Huésped Orbis · {level.name} · {currentPerk.perk}
            </p>
            <h2>{hotel.name}</h2>
            <p className="panel__meta">
              {hotel.city} · {sub?.name} · Habitación {stay.roomKind.replace('_', ' ')} · pareja
              {' · '}
              {stay.nights} noches · {stay.nightsRemaining} restantes
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
                <span>Corte hotel</span>
                <strong>{(CLIENT_CEO_CUT * 100).toFixed(1)}% + cadena</strong>
              </div>
            </div>

            {incomeBlock}

            {client.appointments.length > 0 && (
              <div className="client-appointments">
                <h3>Citas</h3>
                <ul>
                  {client.appointments.map((a) => (
                    <li key={a.id} className={a.done ? 'muted' : ''}>
                      <strong>{formatAppointmentClock(a.atMinutes)}</strong>
                      {' · '}
                      {a.label}
                      {a.done ? ' ✓' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missionsBlock}
          </div>

          <div className="client-stay__services">
            <div className="client-stay__tabs" role="tablist">
              {(
                [
                  ['actividad', 'Actividad'],
                  ['servicios', 'Servicios'],
                  ['pareja', 'Pareja'],
                  ['club', 'Club'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  className={stayTab === id ? 'chip chip--active' : 'chip'}
                  onClick={() => setStayTab(id)}
                >
                  {label}
                  {id === 'actividad' ? ' · 1-8' : id === 'pareja' ? ' · 9' : ''}
                </button>
              ))}
            </div>

            {stayTab === 'actividad' && lobbyBlock}
            {stayTab === 'pareja' && partnerBlock}
            {stayTab === 'club' && clubHub}
            {stayTab === 'servicios' && (
              <>
            <h3>{serviceScreen ? serviceScreen.title : 'Servicios del hotel'}</h3>
            <label className="field">
              <span>Propina al usar servicio (€)</span>
              <input
                type="number"
                min={0}
                max={500}
                value={tip}
                onChange={(e) => setTip(Number(e.target.value) || 0)}
              />
            </label>

            {serviceScreen ? (
              <div className="client-service-screen">
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setServiceFocus(null)
                    setCart({})
                  }}
                >
                  ← Todos los servicios
                </button>
                <p className="client-service-screen__intro">{serviceScreen.intro}</p>
                <p className="client-service-screen__hours">
                  {serviceScreen.hours} · ahora {clockFromGameMinutes(gameMinutes)}
                </p>
                {(() => {
                  const hs = serviceHoursStatus(serviceFocus!, gameMinutes)
                  return (
                    <p className={hs.open ? 'muted' : 'error'} style={{ margin: '0 0 0.5rem' }}>
                      {hs.open ? hs.note : `${hs.note} · abre ${hs.opensAt}`}
                    </p>
                  )
                })()}
                <div className="client-action-list">
                  {serviceScreen.actions.map((a) => (
                    <button key={a.id} type="button" className="client-action" onClick={() => doAction(a.id)}>
                      <strong>
                        {a.label}
                        {a.minigame ? ' · minijuego' : ''}
                        {serviceFocus === 'room_service_24h' ? ' · +carrito' : ''}
                      </strong>
                      <span>{a.detail}</span>
                      <em>
                        {formatEUR(a.cost)}
                        {tip > 0 && serviceFocus !== 'room_service_24h' ? ` + ${formatEUR(tip)} propina` : ''} ·{' '}
                        {a.minutes} min · +{a.points} pts
                        {cart[a.id] ? ` · x${cart[a.id]}` : ''}
                      </em>
                    </button>
                  ))}
                </div>
                {serviceFocus === 'room_service_24h' && (
                  <div className="client-cart" style={{ marginTop: '0.75rem' }}>
                    <p className="mini-title">Carrito room service</p>
                    {Object.keys(cart).length === 0 ? (
                      <p className="muted">Añade platos con +carrito.</p>
                    ) : (
                      <>
                        <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.1rem', fontSize: '0.8rem' }}>
                          {Object.entries(cart).map(([id, qty]) => {
                            const a = serviceScreen.actions.find((x) => x.id === id)
                            return (
                              <li key={id}>
                                {a?.label ?? id} ×{qty}{' '}
                                <button
                                  type="button"
                                  className="linkish"
                                  onClick={() =>
                                    setCart((c) => {
                                      const n = { ...c }
                                      delete n[id]
                                      return n
                                    })
                                  }
                                >
                                  quitar
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="speed-group">
                          <button type="button" className="btn btn--primary" onClick={doOrderCart}>
                            Pedir carrito
                          </button>
                          <button type="button" className="chip" onClick={() => setCart({})}>
                            Vaciar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="client-service-list">
                {services.length === 0 ? (
                  <p className="muted">Este hotel no tiene servicios extra configurados.</p>
                ) : (
                  services.map((id) => {
                    const meta = SERVICE_CATALOG.find((s) => s.id === id)
                    const preview = buildServiceScreen(id, hotel)
                    const from = preview.actions[0]?.cost ?? 0
                    const hasMini = preview.actions.some((a) => a.minigame)
                    return (
                      <button
                        key={id}
                        type="button"
                        className="client-service"
                        onClick={() => {
                          setServiceFocus(id)
                          setMsg(null)
                        }}
                      >
                        <strong>{meta?.label ?? id}</strong>
                        <span>
                          {meta?.group} · desde {formatEUR(from)} · {preview.actions.length} opciones
                          {hasMini ? ' · minijuego' : ''}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
              </>
            )}

            {msg && <p className="error">{msg}</p>}
            {notesBlock}

            <div className="speed-group" style={{ marginTop: '0.75rem' }}>
              <button type="button" className="btn btn--primary" onClick={() => doCheckOut(false)}>
                Check-out
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => doCheckOut(true)}
                title={`Cargo: ${formatEUR(lateFee)}`}
              >
                Salida tardía (+{formatEUR(lateFee)})
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

  // ── Side panel (pre-stay) ────────────────────────────────────────────────────

  return (
    <aside className="panel panel--client">
      <ClientNightRecap />
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Club Huésped Orbis</p>
          <h2>Cliente</h2>
          <p className="panel__meta">
            Nv.{client.level} {level.name} · {client.points.toLocaleString('es-ES')} pts ·{' '}
            {formatEUR(client.wallet)}
          </p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setPlayMode('gerente')}
          aria-label="Volver a gerente"
          title="Gerente"
        >
          ×
        </button>
      </div>

      <div className="panel__body">
        {hotels.length === 0 ? (
          <p className="error">Construye al menos un hotel en modo Gerente.</p>
        ) : (
          <>
            <div className="client-side-tabs" role="tablist">
              <button
                type="button"
                className={sideTab === 'viaje' ? 'chip chip--active' : 'chip'}
                onClick={() => setSideTab('viaje')}
              >
                Viaje
              </button>
              <button
                type="button"
                className={sideTab === 'club' ? 'chip chip--active' : 'chip'}
                onClick={() => setSideTab('club')}
              >
                Club / ingresos
              </button>
            </div>

            {sideTab === 'club' ? (
              <>
                {incomeBlock}
                {eventBanner}
                {clubHub}
                {missionsBlock}
              </>
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
            <p className="muted">Viajas en pareja · cambia a Órdenes tras el check-in.</p>

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
              <div>
                <span>Beneficio</span>
                <strong>{currentPerk.perk}</strong>
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

            {partnerNeedsBlock}

            <p className="mini-title">Reservar hotel</p>
            <p className="muted">Clic en el mapa para elegir · clic de nuevo o vacío para quitar</p>

            {hotel && sub && (
              <div className="filial-selected client-hotel-pick">
                <img className="filial-logo filial-logo--md" src={subsidiaryLogoSvg(sub, 128)} alt="" />
                <div>
                  <strong>{hotel.name}</strong>
                  <span>
                    {sub.name} · {hotel.city} · {'★'.repeat(hotel.stars)}
                  </span>
                </div>
                {!stay || stay.status === 'checked_out' ? (
                  <button type="button" className="chip" onClick={clearHotelSelection}>
                    Quitar
                  </button>
                ) : null}
              </div>
            )}

            {hotel && (!stay || stay.status === 'checked_out') && (
              <>
                <label className="field">
                  <span>Habitación</span>
                  <select value={roomKind} onChange={(e) => setRoomKind(e.target.value as ClientRoomKind)}>
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
                <label className="field">
                  <span>Noches (1–14)</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={nights}
                    onChange={(e) =>
                      setNights(Math.max(1, Math.min(14, Number(e.target.value) || 1)))
                    }
                  />
                </label>
                <p className="muted" style={{ fontSize: '0.82em' }}>
                  Estimación: <strong>{formatEUR(totalPrice)}</strong>
                  {' '}({nights} noches · {formatEUR(nightPrice)}/noche pareja)
                </p>
              </>
            )}

            {stay && stay.status !== 'checked_out' ? (
              <div className="detail-block" style={{ padding: 0 }}>
                <p>
                  Estado:{' '}
                  <strong>{stay.status === 'waitlist' ? 'lista de espera' : stay.status}</strong>
                  {stay.status === 'waitlist' ? ' (automática)' : ''}
                </p>
                <p className="muted">
                  Precio pareja: {stay.pricePaid === 0 ? 'Canjeada (0 €)' : formatEUR(stay.pricePaid)}
                  {' · '}{stay.nights} noches
                </p>
                <div className="speed-group">
                  {stay.status === 'reserved' && (
                    <>
                      <button type="button" className="btn btn--primary" onClick={() => doCheckIn(false)}>
                        Check-in
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => doCheckIn(true)}
                        title={`Early check-in: +${formatEUR(earlyFee)}`}
                      >
                        Entrada anticipada (+{formatEUR(earlyFee)})
                      </button>
                      {stay.pricePaid > 0 && client.points >= FREE_NIGHT_POINTS && (
                        <button type="button" className="chip" onClick={() => doRedeem('noche')}>
                          Canjear noche ({FREE_NIGHT_POINTS} pts)
                        </button>
                      )}
                    </>
                  )}
                  {stay.status === 'waitlist' && (
                    <p className="muted">
                      Si se libera una habitación al pasar el día, pasarás a reserved.
                    </p>
                  )}
                  {stay.status !== 'checked_in' && (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => clientCancelReservation()}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="speed-group">
                <button type="button" className="btn btn--primary" disabled={!hotel} onClick={doReserve}>
                  Reservar
                </button>
                {hotel && (
                  <button type="button" className="chip" onClick={clearHotelSelection}>
                    Quitar hotel
                  </button>
                )}
              </div>
            )}

            {stay?.status === 'checked_out' && (
              <button
                type="button"
                className="chip"
                style={{ marginTop: '0.5rem' }}
                onClick={() => clientDismissStay()}
              >
                Cerrar estancia anterior
              </button>
            )}

            {msg && <p className="error">{msg}</p>}
            {notesBlock}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
