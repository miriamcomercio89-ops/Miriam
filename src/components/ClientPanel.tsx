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
  CLIENT_CEO_CUT,
  calcStayTotalPrice,
  earlyCheckinFee,
  lateCheckoutFee,
  calcGuestNightPrice,
  formatAppointmentClock,
} from '../lib/clientMode'
import {
  CLIENT_LEVEL_PERKS,
  POINT_REDEEMS,
  redeemPointsCost,
  SPECIALIZE_LABEL,
  clientPerkInfo,
  type PointRedeemId,
} from '../lib/clientClub'
import { buildServiceScreen, FREE_NIGHT_POINTS } from '../lib/clientServices'
import { minigameForAction, type MinigameId } from '../lib/clientMinigames'
import { ClientMinigame } from './ClientMinigame'
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
  const clientFinishMinigame = useGameStore((s) => s.clientFinishMinigame)
  const clientClaimMission = useGameStore((s) => s.clientClaimMission)
  const clientRedeemPoints = useGameStore((s) => s.clientRedeemPoints)
  const clientClearNotes = useGameStore((s) => s.clientClearNotes)
  const clientDismissStay = useGameStore((s) => s.clientDismissStay)

  const [msg, setMsg] = useState<string | null>(null)
  const [roomKind, setRoomKind] = useState<ClientRoomKind>('estandar')
  const [board, setBoard] = useState<BoardRegime>('solo')
  const [tip, setTip] = useState(0)
  const [nights, setNights] = useState(1)
  const [showLevels, setShowLevels] = useState(false)
  const [serviceFocus, setServiceFocus] = useState<HotelService | null>(null)
  const [mini, setMini] = useState<ActiveMini | null>(null)

  const hotel = useMemo(() => {
    const id = client.stay?.hotelId ?? client.bookingHotelId
    return hotels.find((h) => h.id === id) ?? null
  }, [hotels, client.stay, client.bookingHotelId])

  const serviceScreen = useMemo(() => {
    if (!hotel || !serviceFocus) return null
    return buildServiceScreen(serviceFocus, hotel)
  }, [hotel, serviceFocus])

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

  function doClaim(id: string) {
    const res = clientClaimMission(id)
    setMsg(res.ok ? null : res.error)
  }

  function doRedeem(id: PointRedeemId) {
    const res = clientRedeemPoints(id)
    setMsg(res.ok ? null : res.error)
  }

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

  /** Compact needs block for the NPC partner. */
  const partnerNeedsBlock = (
    <div className="client-partner-needs" style={{ marginTop: '0.75rem' }}>
      <p className="mini-title" style={{ marginBottom: '0.25rem' }}>
        Pareja (NPC)&ensp;
        <span className="muted" style={{ fontSize: '0.75em', fontWeight: 400 }}>
          Solo controlas tu personaje
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

  /** Expandable table of all club levels with discount and perk text. */
  const levelsTable = (
    <div className="client-levels" style={{ marginTop: '0.75rem' }}>
      <button type="button" className="linkish" onClick={() => setShowLevels((v) => !v)}>
        {showLevels ? '▲ Ocultar niveles Club' : '▼ Ver niveles Club Huésped'}
      </button>
      {showLevels && (
        <table
          style={{ width: '100%', fontSize: '0.77em', marginTop: '0.4rem', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Nivel</th>
              <th style={{ textAlign: 'right' }}>Desc.</th>
              <th style={{ textAlign: 'left', paddingLeft: '0.5rem' }}>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            {CLIENT_LEVEL_PERKS.map((p) => {
              const isCurrent = p.level === client.level
              return (
                <tr
                  key={p.level}
                  style={{
                    background: isCurrent ? 'rgba(255,200,50,0.15)' : undefined,
                    fontWeight: isCurrent ? 700 : undefined,
                  }}
                >
                  <td>{p.name}</td>
                  <td style={{ textAlign: 'right' }}>{Math.round(p.discount * 100)}%</td>
                  <td style={{ paddingLeft: '0.5rem', color: 'var(--muted, #888)' }}>{p.perk}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )

  /** Specialization summary. */
  const specBlock = (
    <div className="client-specialize" style={{ marginTop: '0.75rem' }}>
      <p className="mini-title" style={{ marginBottom: '0.15rem' }}>Especialización</p>
      <p style={{ fontSize: '0.85em' }}>
        <strong>{SPECIALIZE_LABEL[client.specialize]}</strong>
        {client.specialize !== 'none' && (
          <span className="muted">
            {' '}· {client.specializeNights[client.specialize] ?? 0} noches
          </span>
        )}
      </p>
      {Object.keys(client.specializeNights).length > 0 && (
        <div
          style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.75em', marginTop: '0.2rem' }}
        >
          {(Object.entries(client.specializeNights) as [string, number | undefined][])
            .filter(([, v]) => (v ?? 0) > 0)
            .map(([k, v]) => (
              <span key={k} className="tag">
                {(SPECIALIZE_LABEL as Record<string, string>)[k] ?? k}: {v}n
              </span>
            ))}
        </div>
      )}
    </div>
  )

  /** All point-redeem options with per-level cost and redeem button. */
  const redeemsBlock = (
    <div className="client-redeems" style={{ marginTop: '0.75rem' }}>
      <p className="mini-title" style={{ marginBottom: '0.25rem' }}>Canjear puntos</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {POINT_REDEEMS.map((r) => {
          const cost = redeemPointsCost(r.id, client.level)
          const already = client.pointRedeems.includes(r.id)
          const canAfford = client.points >= cost
          return (
            <div
              key={r.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82em' }}
            >
              <div style={{ flex: 1 }}>
                <strong>{r.label}</strong>
                <span className="muted"> · {cost} pts</span>
                <span className="muted" style={{ display: 'block', fontSize: '0.9em' }}>
                  {r.detail}
                </span>
              </div>
              <button
                type="button"
                className={already ? 'chip' : 'chip chip--active'}
                disabled={already || !canAfford}
                onClick={() => doRedeem(r.id)}
                style={{ flexShrink: 0 }}
              >
                {already ? 'Canjeado' : 'Canjear'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── Stay fullscreen view ─────────────────────────────────────────────────────

  if (inStay && hotel) {
    return (
      <div className="client-stay">
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

            {partnerNeedsBlock}

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

            {specBlock}

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

            {redeemsBlock}
            {missionsBlock}
          </div>

          <div className="client-stay__services">
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
                <button type="button" className="linkish" onClick={() => setServiceFocus(null)}>
                  ← Todos los servicios
                </button>
                <p className="client-service-screen__intro">{serviceScreen.intro}</p>
                <p className="client-service-screen__hours">{serviceScreen.hours}</p>
                <div className="client-action-list">
                  {serviceScreen.actions.map((a) => (
                    <button key={a.id} type="button" className="client-action" onClick={() => doAction(a.id)}>
                      <strong>
                        {a.label}
                        {a.minigame ? ' · minijuego' : ''}
                      </strong>
                      <span>{a.detail}</span>
                      <em>
                        {formatEUR(a.cost)}
                        {tip > 0 ? ` + ${formatEUR(tip)} propina` : ''} · {a.minutes} min · +{a.points} pts
                      </em>
                    </button>
                  ))}
                </div>
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

            {specBlock}

            {levelsTable}

            {missionsBlock}

            {redeemsBlock}

            <p className="mini-title">Reservar</p>
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
                  Estimación:{' '}
                  <strong>{formatEUR(totalPrice)}</strong>
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
                  <button type="button" className="chip" onClick={() => setClientBookingHotel(null)}>
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

            {client.passport.length > 0 && (
              <>
                <p className="mini-title">Pasaporte</p>
                <div className="tag-row">
                  {client.passport.slice(0, 12).map((p) => {
                    const brand = getSubsidiary(p.subsidiaryId)
                    return (
                      <span
                        key={`${p.countryCode}-${p.subsidiaryId}`}
                        className="tag"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {p.selfie && (
                          <img
                            src={p.selfie}
                            alt=""
                            width={40}
                            height={40}
                            style={{ borderRadius: 4, verticalAlign: 'middle' }}
                          />
                        )}
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
