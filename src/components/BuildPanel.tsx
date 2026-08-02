import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES, getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import { getCountryRules } from '../lib/countryRules'
import {
  SERVICE_CATALOG,
  STAFF_OPTIONS,
  TARGET_OPTIONS,
  ROOM_MIX_OPTIONS,
  QUALITY_OPTIONS,
  GREEN_OPTIONS,
  DESIGN_FOCUS,
  BUFFET_OPTIONS,
  BAR_OPTIONS,
  RESTAURANT_CONCEPTS,
  SECURITY_OPTIONS,
  TECH_OPTIONS,
  BOARD_REGIMES,
} from '../data/catalog'
import { calcConstructionCost, calcConstructionBreakdown, estimateDaily, fairPrice, getSeason, seasonLabel } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import { galleryImages } from '../lib/gallery'
import { geoRegionLabel } from '../lib/geo'
import { evaluateSiteFit } from '../lib/siteFit'
import { downloadHotelPdf, svgDataUrlToPng } from '../lib/hotelPdf'
import type {
  BuildDraft,
  HotelService,
  StaffLevel,
  GuestTarget,
  RoomMix,
  BuildQuality,
  GreenLevel,
  SecurityLevel,
  TechLevel,
  BoardRegime,
  Subsidiary,
} from '../types'

type Step = 'marca' | 'basico' | 'edificio' | 'servicios' | 'extras' | 'foto' | 'revisar'

const STEPS: { id: Step; label: string }[] = [
  { id: 'marca', label: 'Marca' },
  { id: 'basico', label: 'Básico' },
  { id: 'edificio', label: 'Edificio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'extras', label: 'Extras' },
  { id: 'foto', label: 'Foto' },
  { id: 'revisar', label: 'Crear' },
]

function emptyDraft(subId: string, city: string): BuildDraft {
  const sub = getSubsidiary(subId)!
  const name = `${sub.name.replace('Orbis ', '')} ${city}`
  const imgs = galleryImages(sub, name)
  return {
    name,
    subsidiaryId: subId,
    stars: Math.min(Math.max(3, sub.minStars), sub.maxStars),
    rooms: 120,
    services: ['wifi_premium', 'restaurante', 'parking'],
    staffLevel: 'estandar',
    target: sub.targets[0],
    imageDataUrl: imgs[0],
    imageKey: `${sub.imageStyle}:day`,
    roomMix: 'estandar',
    buildQuality: 'bueno',
    floors: 4,
    greenLevel: 'basico',
    meetingRooms: 1,
    parkingSpots: 40,
    restaurantLevel: 1,
    openingPromoDays: 7,
    designFocus: 'vistas',
    buffetType: 'continental',
    barType: 'lobby',
    restaurantConcept: 'a_la_carta',
    lateCheckout: true,
    airportDesk: false,
    securityLevel: 'medio',
    techLevel: 'moderno',
    breakfastIncluded: true,
    seaViewShare: 10,
    loyaltyProgram: false,
    quietHours: false,
    bikeRental: false,
    shuttleCity: false,
    boardRegime: 'desayuno',
    availableRegimes: ['solo', 'desayuno', 'media', 'completa'],
  }
}

function brandPdfHref(id: string) {
  return `./marcas/${id}.pdf`
}

export function BuildPanel() {
  const loc = useGameStore((s) => s.buildLocation)
  const closeBuild = useGameStore((s) => s.closeBuild)
  const buildHotel = useGameStore((s) => s.buildHotel)
  const cash = useGameStore((s) => s.cash)
  const loan = useGameStore((s) => s.loan)
  const events = useGameStore((s) => s.activeEvents)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)
  const loyaltyLevel = useGameStore((s) => s.loyaltyLevel)

  const [step, setStep] = useState<Step>('marca')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<BuildDraft | null>(null)
  const [gallery, setGallery] = useState<string[]>([])
  const [previewBrand, setPreviewBrand] = useState<Subsidiary | null>(null)
  const [useFinance, setUseFinance] = useState(false)
  const [downloadPdf, setDownloadPdf] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showCostDetail, setShowCostDetail] = useState(false)

  useEffect(() => {
    setStep('marca')
    setFilter('')
    setError(null)
    setDraft(null)
    setGallery([])
    setPreviewBrand(null)
    setUseFinance(false)
    setDownloadPdf(true)
    setShowCostDetail(false)
  }, [loc?.lat, loc?.lng])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return SUBSIDIARIES
    return SUBSIDIARIES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.lore.toLowerCase().includes(q),
    )
  }, [filter])

  const serviceGroups = useMemo(() => {
    const map = new Map<string, typeof SERVICE_CATALOG>()
    for (const s of SERVICE_CATALOG) {
      const arr = map.get(s.group) ?? []
      arr.push(s)
      map.set(s.group, arr)
    }
    return [...map.entries()]
  }, [])

  const fit = useMemo(() => {
    if (!loc || !draft) return null
    const s = getSubsidiary(draft.subsidiaryId)
    return s ? evaluateSiteFit(s, loc) : null
  }, [loc, draft])

  const previewFit = useMemo(() => {
    if (!loc || !previewBrand) return null
    return evaluateSiteFit(previewBrand, loc)
  }, [loc, previewBrand])

  if (!loc) return null
  const site = loc

  const rep = reputation[site.countryCode] ?? 55
  const season = getSeason(site.lat, gameMinutes)
  const eco = countryEconomy[site.countryCode]
  const cost = draft ? calcConstructionCost(draft, site) : 0
  const breakdown = draft ? calcConstructionBreakdown(draft, site) : null
  const estimate = draft ? estimateDaily(draft, site, events, gameMinutes, rep, eco, loyaltyLevel) : null
  const sub = draft ? getSubsidiary(draft.subsidiaryId) : null
  const shortfall = Math.max(0, cost - cash)
  const creditLeft = Math.max(0, loan.limit - loan.balance)
  const canFinance = shortfall > 0 && shortfall <= creditLeft
  const canAfford = cost <= cash || (useFinance && canFinance)
  const aiPrice =
    draft && sub
      ? fairPrice(
          {
            stars: draft.stars,
            tourismIndex: site.tourismIndex,
            beachScore: site.beachScore,
            target: draft.target,
            services: draft.services,
            subsidiaryId: draft.subsidiaryId,
            staffLevel: draft.staffLevel,
            buildQuality: draft.buildQuality,
            roomMix: draft.roomMix,
            boardRegime: draft.boardRegime,
          },
          season,
        )
      : 0

  const stepIdx = STEPS.findIndex((s) => s.id === step)

  function toggleService(id: HotelService) {
    if (!draft) return
    setDraft({
      ...draft,
      services: draft.services.includes(id)
        ? draft.services.filter((s) => s !== id)
        : [...draft.services, id],
    })
  }

  function onImageFile(file: File | null) {
    if (!file || !draft) return
    const reader = new FileReader()
    reader.onload = () => setDraft({ ...draft, imageDataUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  function goNext() {
    const order = STEPS.map((s) => s.id)
    const i = order.indexOf(step)
    if (i < order.length - 1) setStep(order[i + 1])
  }

  function goBack() {
    const order = STEPS.map((s) => s.id)
    const i = order.indexOf(step)
    if (i > 0) setStep(order[i - 1])
  }

  function pickBrand(s: Subsidiary) {
    const d = emptyDraft(s.id, site.city)
    setDraft(d)
    setGallery(galleryImages(s, d.name, site.climateLabel || site.geoRegion || s.imageStyle))
    setPreviewBrand(null)
    setStep('basico')
    setError(null)
  }

  async function onCreate() {
    if (!draft) return
    setBusy(true)
    setError(null)
    const res = buildHotel(draft, site, { finance: useFinance && shortfall > 0 })
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
      return
    }
    if (downloadPdf) {
      try {
        const brand = getSubsidiary(res.hotel.subsidiaryId)
        if (brand) {
          const logoPng = await svgDataUrlToPng(subsidiaryLogoSvg(brand, 256), 256)
          await downloadHotelPdf({
            hotel: res.hotel,
            sub: brand,
            loc: site,
            draft,
            logoPng,
            cost: res.hotel.constructionCost,
            financed: res.financed,
            photoDataUrl: draft.imageDataUrl,
          })
        }
      } catch {
        /* PDF opcional */
      }
    }
    setBusy(false)
  }

  return (
    <aside className="panel panel--build">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Constructor</p>
          <h2>{loc.city}</h2>
          <p className="panel__meta">
            {loc.country} · {geoRegionLabel(loc.geoRegion)} ·{' '}
            <a href="./constructor-guia.pdf" target="_blank" rel="noreferrer">
              Guía PDF
            </a>
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={closeBuild} aria-label="Cerrar" title="Cerrar">
          ×
        </button>
      </div>

      <div className="build-costbar" aria-live="polite">
        <div>
          <span>Obra</span>
          <strong>{draft ? formatEUR(cost, true) : '—'}</strong>
        </div>
        <div>
          <span>Caja</span>
          <strong>{formatEUR(cash, true)}</strong>
        </div>
        <div className={draft ? (canAfford ? 'is-ok' : 'is-bad') : ''}>
          <span>Saldo</span>
          <strong>
            {!draft
              ? '—'
              : shortfall <= 0
                ? 'Te llega'
                : canFinance
                  ? `Faltan ${formatEUR(shortfall, true)}`
                  : `Sin crédito (${formatEUR(shortfall, true)})`}
          </strong>
        </div>
        {estimate && (
          <div>
            <span>Est. / día</span>
            <strong className={estimate.net >= 0 ? 'pos' : 'neg'}>{formatEUR(estimate.net, true)}</strong>
          </div>
        )}
        {breakdown && (
          <button
            type="button"
            className="build-costbar__toggle"
            onClick={() => setShowCostDetail((v) => !v)}
          >
            {showCostDetail ? 'Ocultar desglose' : 'Ver desglose'}
          </button>
        )}
      </div>

      {showCostDetail && breakdown && (
        <div className="build-breakdown">
          <ul>
            {breakdown.lines.map((l) => (
              <li key={l.id}>
                <span>{l.label}</span>
                <strong>{formatEUR(l.amount, true)}</strong>
              </li>
            ))}
          </ul>
          <p className="build-breakdown__sub">
            Subtotal {formatEUR(breakdown.subtotal, true)}
          </p>
          {breakdown.multipliers.length > 0 && (
            <ul className="build-breakdown__mult">
              {breakdown.multipliers.map((m) => (
                <li key={m.id}>
                  <span>{m.label}</span>
                  <strong>×{m.factor.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          )}
          <p className="build-breakdown__total">
            Total <strong>{formatEUR(breakdown.total, true)}</strong>
          </p>
        </div>
      )}

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`stepper__item ${s.id === step ? 'is-active' : ''} ${i < stepIdx ? 'is-done' : ''}`}
            disabled={!draft && s.id !== 'marca'}
            onClick={() => {
              if (s.id === 'marca' || draft) setStep(s.id)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="insight-grid insight-grid--build">
        <div><span>Turismo</span><strong>{loc.tourismIndex}/100</strong></div>
        <div><span>Playa</span><strong>{loc.beachScore}/100</strong></div>
        <div><span>Coste sitio</span><strong>×{loc.costIndex}</strong></div>
        <div><span>Fama</span><strong>{Math.round(rep)}/100</strong></div>
        <div><span>Temporada</span><strong>{seasonLabel(season)}</strong></div>
        <div><span>Impuestos</span><strong>{Math.round(loc.taxRate * 100)}%</strong></div>
        <div><span>Tasa turística</span><strong>{getCountryRules(loc.countryCode).touristTaxPerNight} €/hab.</strong></div>
        <div><span>Cambio</span><strong>×{(eco?.fx ?? 1).toFixed(2)}</strong></div>
      </div>

      {fit && step !== 'marca' && (
        <div className={`build-fit build-fit--${fit.level}`}>
          <strong>Afinidad marca–sitio: {fit.score}/100 ({fit.level})</strong>
          {fit.warnings.map((w) => (
            <p key={w} className="build-fit__warn">{w}</p>
          ))}
          {fit.tips.slice(0, 2).map((t) => (
            <p key={t} className="build-fit__tip">{t}</p>
          ))}
        </div>
      )}

      {step === 'marca' && (
        <div className="panel__body build-marca">
          {previewBrand ? (
            <div className="brand-sheet" style={{ ['--brand' as string]: previewBrand.color, ['--accent' as string]: previewBrand.accent }}>
              <img
                className="brand-sheet__logo"
                src={subsidiaryLogoSvg(previewBrand, 256)}
                alt=""
                width={168}
                height={168}
              />
              <div className="brand-sheet__body">
                <p className="panel__eyebrow">{previewBrand.specialty}</p>
                <h3>{previewBrand.name}</h3>
                <p className="brand-sheet__tag">{previewBrand.tagline}</p>
                <p className="brand-sheet__lore">{previewBrand.lore}</p>
                <ul className="brand-sheet__meta">
                  <li>Estrellas {previewBrand.minStars}–{previewBrand.maxStars}</li>
                  <li>Público: {previewBrand.targets.join(', ')}</li>
                  <li>Afinidad playa {Math.round(previewBrand.beachAffinity * 100)}%</li>
                  <li>Coste marca ×{previewBrand.costMultiplier}</li>
                  <li>Demanda +{Math.round(previewBrand.demandBonus * 100)}%</li>
                  <li>Estilo {previewBrand.imageStyle}</li>
                </ul>
                {previewFit && (
                  <div className={`build-fit build-fit--${previewFit.level}`}>
                    <strong>En este solar: {previewFit.score}/100 ({previewFit.level})</strong>
                    {previewFit.warnings.map((w) => (
                      <p key={w} className="build-fit__warn">{w}</p>
                    ))}
                  </div>
                )}
                <div className="nav-row">
                  <button type="button" className="btn btn--ghost" onClick={() => setPreviewBrand(null)}>
                    Volver al listado
                  </button>
                  <a className="btn btn--ghost" href={brandPdfHref(previewBrand.id)} download target="_blank" rel="noreferrer">
                    PDF de marca
                  </a>
                  <button type="button" className="btn btn--primary" onClick={() => pickBrand(previewBrand)}>
                    Usar esta marca
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <label className="field">
                <span>Elige marca · 50 filiales</span>
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por nombre, especialidad…" />
              </label>
              <div className="filial-list filial-list--xl">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="filial-card filial-card--xl"
                    onClick={() => setPreviewBrand(s)}
                  >
                    <img className="filial-logo filial-logo--xl" src={subsidiaryLogoSvg(s, 256)} alt="" width={112} height={112} />
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.specialty}</span>
                      <em>{s.tagline}</em>
                      <small>{'★'.repeat(s.minStars)}{s.minStars !== s.maxStars ? `–${s.maxStars}★` : ''}</small>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 'basico' && draft && sub && (
        <div className="panel__body">
          <div className="filial-selected filial-selected--xl">
            <img className="filial-logo filial-logo--xl" src={subsidiaryLogoSvg(sub, 256)} alt="" width={112} height={112} />
            <div>
              <strong>{sub.name}</strong>
              <span>{sub.specialty}</span>
              <em>{sub.lore}</em>
              <a className="linkish" href={brandPdfHref(sub.id)} download target="_blank" rel="noreferrer">
                Descargar PDF de marca
              </a>
            </div>
          </div>
          <label className="field">
            <span>Nombre del hotel</span>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={80} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Estrellas ({sub.minStars}–{sub.maxStars})</span>
              <input
                type="range"
                min={sub.minStars}
                max={sub.maxStars}
                value={draft.stars}
                onChange={(e) => setDraft({ ...draft, stars: Number(e.target.value) })}
              />
              <strong className="range-val">{'★'.repeat(draft.stars)}</strong>
            </label>
            <label className="field">
              <span>Habitaciones</span>
              <input
                type="number"
                min={20}
                max={2000}
                value={draft.rooms}
                onChange={(e) => setDraft({ ...draft, rooms: Math.max(20, Number(e.target.value) || 20) })}
              />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Personal</span>
              <select value={draft.staffLevel} onChange={(e) => setDraft({ ...draft, staffLevel: e.target.value as StaffLevel })}>
                {STAFF_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tipo de clientes</span>
              <select value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value as GuestTarget })}>
                {TARGET_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Tipo de habitaciones</span>
            <select value={draft.roomMix} onChange={(e) => setDraft({ ...draft, roomMix: e.target.value as RoomMix })}>
              {ROOM_MIX_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Régimen principal (precio IA)</span>
            <select
              value={draft.boardRegime}
              onChange={(e) => {
                const boardRegime = e.target.value as BoardRegime
                const available = draft.availableRegimes.includes(boardRegime)
                  ? draft.availableRegimes
                  : [...draft.availableRegimes, boardRegime]
                setDraft({
                  ...draft,
                  boardRegime,
                  availableRegimes: available,
                  breakfastIncluded: boardRegime !== 'solo' ? true : draft.breakfastIncluded,
                })
              }}
            >
              {BOARD_REGIMES.filter((o) => draft.availableRegimes.includes(o.id)).map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <fieldset className="services">
            <legend>Regímenes disponibles</legend>
            <div className="services__grid">
              {BOARD_REGIMES.map((o) => (
                <label key={o.id} className="check">
                  <input
                    type="checkbox"
                    checked={draft.availableRegimes.includes(o.id)}
                    onChange={() => {
                      const has = draft.availableRegimes.includes(o.id)
                      let availableRegimes = has
                        ? draft.availableRegimes.filter((x) => x !== o.id)
                        : [...draft.availableRegimes, o.id]
                      if (availableRegimes.length === 0) availableRegimes = ['solo']
                      const boardRegime = availableRegimes.includes(draft.boardRegime)
                        ? draft.boardRegime
                        : availableRegimes[0]
                      setDraft({
                        ...draft,
                        availableRegimes,
                        boardRegime,
                        breakfastIncluded: boardRegime !== 'solo' ? true : draft.breakfastIncluded,
                      })
                    }}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="ai-price-note">Precio IA estimado: {formatEUR(aiPrice)}/noche</p>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('marca')}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Seguir</button>
          </div>
        </div>
      )}

      {step === 'edificio' && draft && (
        <div className="panel__body">
          <label className="field">
            <span>Calidad del edificio</span>
            <select value={draft.buildQuality} onChange={(e) => setDraft({ ...draft, buildQuality: e.target.value as BuildQuality })}>
              {QUALITY_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Plantas ({draft.floors})</span>
            <input type="range" min={1} max={40} value={draft.floors} onChange={(e) => setDraft({ ...draft, floors: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Plan verde</span>
            <select value={draft.greenLevel} onChange={(e) => setDraft({ ...draft, greenLevel: e.target.value as GreenLevel })}>
              {GREEN_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>Seguridad</span>
              <select value={draft.securityLevel} onChange={(e) => setDraft({ ...draft, securityLevel: e.target.value as SecurityLevel })}>
                {SECURITY_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tecnología</span>
              <select value={draft.techLevel} onChange={(e) => setDraft({ ...draft, techLevel: e.target.value as TechLevel })}>
                {TECH_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Salas de reuniones</span>
              <input type="number" min={0} max={40} value={draft.meetingRooms} onChange={(e) => setDraft({ ...draft, meetingRooms: Math.max(0, Number(e.target.value) || 0) })} />
            </label>
            <label className="field">
              <span>Plazas de parking</span>
              <input type="number" min={0} max={2000} value={draft.parkingSpots} onChange={(e) => setDraft({ ...draft, parkingSpots: Math.max(0, Number(e.target.value) || 0) })} />
            </label>
          </div>
          <label className="field">
            <span>Nivel del restaurante (0–5)</span>
            <input type="range" min={0} max={5} value={draft.restaurantLevel} onChange={(e) => setDraft({ ...draft, restaurantLevel: Number(e.target.value) })} />
            <strong className="range-val">{draft.restaurantLevel}</strong>
          </label>
          <label className="field">
            <span>Habitaciones con vistas al mar ({draft.seaViewShare}%)</span>
            <input type="range" min={0} max={100} value={draft.seaViewShare} onChange={(e) => setDraft({ ...draft, seaViewShare: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Enfoque del hotel</span>
            <select value={draft.designFocus} onChange={(e) => setDraft({ ...draft, designFocus: e.target.value as BuildDraft['designFocus'] })}>
              {DESIGN_FOCUS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Seguir</button>
          </div>
        </div>
      )}

      {step === 'servicios' && draft && (
        <div className="panel__body">
          {serviceGroups.map(([group, items]) => (
            <fieldset key={group} className="services">
              <legend>{group}</legend>
              <div className="services__grid">
                {items.map((s) => (
                  <label key={s.id} className="check">
                    <input type="checkbox" checked={draft.services.includes(s.id)} onChange={() => toggleService(s.id)} />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Seguir</button>
          </div>
        </div>
      )}

      {step === 'extras' && draft && (
        <div className="panel__body">
          <label className="field">
            <span>Días de oferta de apertura ({draft.openingPromoDays})</span>
            <input type="range" min={0} max={30} value={draft.openingPromoDays} onChange={(e) => setDraft({ ...draft, openingPromoDays: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Tipo de buffet</span>
            <select value={draft.buffetType} onChange={(e) => setDraft({ ...draft, buffetType: e.target.value as BuildDraft['buffetType'] })}>
              {BUFFET_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Bares</span>
            <select value={draft.barType} onChange={(e) => setDraft({ ...draft, barType: e.target.value as BuildDraft['barType'] })}>
              {BAR_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Concepto de restaurante</span>
            <select value={draft.restaurantConcept} onChange={(e) => setDraft({ ...draft, restaurantConcept: e.target.value as BuildDraft['restaurantConcept'] })}>
              {RESTAURANT_CONCEPTS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          {([
            ['breakfastIncluded', 'Desayuno incluido'],
            ['lateCheckout', 'Salida tarde flexible'],
            ['airportDesk', 'Mostrador en aeropuerto'],
            ['loyaltyProgram', 'Programa de fidelidad'],
            ['quietHours', 'Horas de silencio'],
            ['bikeRental', 'Alquiler de bicis'],
            ['shuttleCity', 'Bus al centro'],
          ] as const).map(([key, label]) => (
            <label key={key} className="check block-check">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
              />
              <span>{label}</span>
            </label>
          ))}
          <p className="confirm-note">Buffet, bares y restaurante suben coste y demanda. El seguro lo gestiona la IA al abrir.</p>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Seguir</button>
          </div>
        </div>
      )}

      {step === 'foto' && draft && sub && (
        <div className="panel__body">
          <img src={draft.imageDataUrl} alt="Foto del hotel" className="hotel-preview" />
          <p className="panel__meta">Galería Orbis o sube la tuya</p>
          <div className="gallery-grid">
            {(gallery.length ? gallery : galleryImages(sub, draft.name, loc.climateLabel || loc.geoRegion)).map((src, idx) => {
              const moods = ['day', 'dusk', 'night', 'aerial', 'sunny', 'storm', 'spring', 'winter'] as const
              const key = `${sub.imageStyle}:${moods[idx] ?? 'day'}`
              return (
                <button
                  key={key}
                  type="button"
                  className={`gallery-thumb ${draft.imageKey === key ? 'is-selected' : ''}`}
                  onClick={() => setDraft({ ...draft, imageDataUrl: src, imageKey: key })}
                >
                  <img src={src} alt="" />
                </button>
              )
            })}
          </div>
          <div className="image-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                const imgs = galleryImages(sub, draft.name, loc.climateLabel || loc.geoRegion)
                setGallery(imgs)
                setDraft({ ...draft, imageDataUrl: imgs[0], imageKey: `${sub.imageStyle}:day` })
              }}
            >
              Nuevas fotos
            </button>
            <label className="btn btn--ghost file-btn">
              Subir foto
              <input type="file" accept="image/*" hidden onChange={(e) => onImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Revisar</button>
          </div>
        </div>
      )}

      {step === 'revisar' && draft && sub && estimate && (
        <div className="panel__body">
          <div className="confirm-card confirm-card--xl">
            <img className="filial-logo filial-logo--xl" src={subsidiaryLogoSvg(sub, 256)} alt="" width={112} height={112} />
            <div>
              <strong>{draft.name}</strong>
              <span>
                {sub.name} · {'★'.repeat(draft.stars)} · {draft.rooms} hab. · {draft.floors} plantas
              </span>
            </div>
          </div>
          <div className="cost-box">
            <div><span>Coste de obra</span><strong>{formatEUR(cost)}</strong></div>
            <div><span>Dinero disponible</span><strong>{formatEUR(cash, true)}</strong></div>
            <div><span>Crédito libre</span><strong>{formatEUR(creditLeft, true)}</strong></div>
            <div><span>Precio IA</span><strong>{formatEUR(aiPrice)}/noche</strong></div>
            <div><span>Ocupación est.</span><strong>{formatPct(estimate.occupancy)}</strong></div>
            <div><span>Ganancia / día</span><strong className={estimate.net >= 0 ? 'pos' : 'neg'}>{formatEUR(estimate.net)}</strong></div>
          </div>

          {shortfall > 0 && (
            <label className={`finance-box ${canFinance ? '' : 'is-blocked'}`}>
              <input
                type="checkbox"
                checked={useFinance}
                disabled={!canFinance}
                onChange={(e) => setUseFinance(e.target.checked)}
              />
              <span>
                {canFinance
                  ? `Financiar ${formatEUR(shortfall, true)} con el crédito del grupo (quedará como deuda).`
                  : `No hay crédito suficiente para cubrir ${formatEUR(shortfall, true)}.`}
              </span>
            </label>
          )}

          <label className="check block-check">
            <input type="checkbox" checked={downloadPdf} onChange={(e) => setDownloadPdf(e.target.checked)} />
            <span>Descargar PDF del hotel al crear</span>
          </label>

          <p className="confirm-note">
            Se construye al momento. Precio, contratos y seguro los gestiona la IA.
            Impuestos: {Math.round(loc.taxRate * 100)}%.
          </p>
          {error && <p className="error">{error}</p>}
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy || !canAfford}
              onClick={() => void onCreate()}
            >
              {busy ? 'Creando…' : 'Crear hotel'}
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
