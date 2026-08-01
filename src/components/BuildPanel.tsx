import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES, getSubsidiary, subsidiaryLogoSvg } from '../data/subsidiaries'
import {
  SERVICE_CATALOG,
  STAFF_OPTIONS,
  TARGET_OPTIONS,
  ROOM_MIX_OPTIONS,
  QUALITY_OPTIONS,
  GREEN_OPTIONS,
  DESIGN_FOCUS,
  SECURITY_OPTIONS,
  TECH_OPTIONS,
} from '../data/catalog'
import { calcConstructionCost, estimateDaily, fairPrice, getSeason, seasonLabel } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import { galleryImages } from '../lib/gallery'
import { geoRegionLabel } from '../lib/geo'
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
} from '../types'

type Step = 'marca' | 'basico' | 'edificio' | 'servicios' | 'extras' | 'foto' | 'revisar'

const STEPS: { id: Step; label: string }[] = [
  { id: 'marca', label: '1. Marca' },
  { id: 'basico', label: '2. Básico' },
  { id: 'edificio', label: '3. Edificio' },
  { id: 'servicios', label: '4. Servicios' },
  { id: 'extras', label: '5. Extras' },
  { id: 'foto', label: '6. Foto' },
  { id: 'revisar', label: '7. Crear' },
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
    buffet: false,
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
  }
}

export function BuildPanel() {
  const loc = useGameStore((s) => s.buildLocation)
  const closeBuild = useGameStore((s) => s.closeBuild)
  const buildHotel = useGameStore((s) => s.buildHotel)
  const cash = useGameStore((s) => s.cash)
  const events = useGameStore((s) => s.activeEvents)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)
  const countryEconomy = useGameStore((s) => s.countryEconomy)

  const [step, setStep] = useState<Step>('marca')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<BuildDraft | null>(null)
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    setStep('marca')
    setFilter('')
    setError(null)
    setDraft(null)
    setGallery([])
  }, [loc?.lat, loc?.lng])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return SUBSIDIARIES
    return SUBSIDIARIES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q),
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

  if (!loc) return null

  const rep = reputation[loc.countryCode] ?? 55
  const season = getSeason(loc.lat, gameMinutes)
  const eco = countryEconomy[loc.countryCode]
  const cost = draft ? calcConstructionCost(draft, loc) : 0
  const estimate = draft ? estimateDaily(draft, loc, events, gameMinutes, rep, eco) : null
  const sub = draft ? getSubsidiary(draft.subsidiaryId) : null
  const aiPrice =
    draft && sub
      ? fairPrice(
          {
            stars: draft.stars,
            tourismIndex: loc.tourismIndex,
            beachScore: loc.beachScore,
            target: draft.target,
            services: draft.services,
            subsidiaryId: draft.subsidiaryId,
            staffLevel: draft.staffLevel,
            buildQuality: draft.buildQuality,
            roomMix: draft.roomMix,
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

  return (
    <aside className="panel panel--build">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Nuevo hotel</p>
          <h2>{loc.city}</h2>
          <p className="panel__meta">
            {loc.country} · {geoRegionLabel(loc.geoRegion)}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={closeBuild} aria-label="Cerrar" title="Cerrar">
          ×
        </button>
      </div>

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

      <div className="insight-grid">
        <div><span>Turismo</span><strong>{loc.tourismIndex}/100</strong></div>
        <div><span>Playa</span><strong>{loc.beachScore}/100</strong></div>
        <div><span>Coste del sitio</span><strong>×{loc.costIndex}</strong></div>
        <div><span>Fama en el país</span><strong>{Math.round(rep)}/100</strong></div>
        <div><span>Temporada</span><strong>{seasonLabel(season)}</strong></div>
        <div><span>Impuestos país</span><strong>{Math.round(loc.taxRate * 100)}%</strong></div>
        <div><span>Cambio local</span><strong>×{(eco?.fx ?? 1).toFixed(2)}</strong></div>
      </div>

      {step === 'marca' && (
        <div className="panel__body">
          <label className="field">
            <span>Elige la marca (hay 50)</span>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar marca…" />
          </label>
          <div className="filial-list">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className="filial-card"
                onClick={() => {
                  const d = emptyDraft(s.id, loc.city)
                  setDraft(d)
                  setGallery(galleryImages(s, d.name))
                  setStep('basico')
                  setError(null)
                }}
              >
                <img src={subsidiaryLogoSvg(s, 48)} alt="" width={40} height={40} />
                <div>
                  <strong>{s.name}</strong>
                  <span>{s.specialty}</span>
                  <em>{s.tagline}</em>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'basico' && draft && sub && (
        <div className="panel__body">
          <div className="filial-selected">
            <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={40} height={40} />
            <div>
              <strong>{sub.name}</strong>
              <span>{sub.specialty}</span>
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
          <p className="ai-price-note">
            El precio por noche lo pone solo la IA (ahora unos {formatEUR(aiPrice)}).
          </p>
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
            <span>Plantas del edificio ({draft.floors})</span>
            <input
              type="range"
              min={1}
              max={40}
              value={draft.floors}
              onChange={(e) => setDraft({ ...draft, floors: Number(e.target.value) })}
            />
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
              <select
                value={draft.securityLevel}
                onChange={(e) => setDraft({ ...draft, securityLevel: e.target.value as SecurityLevel })}
              >
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
              <input
                type="number"
                min={0}
                max={40}
                value={draft.meetingRooms}
                onChange={(e) => setDraft({ ...draft, meetingRooms: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
            <label className="field">
              <span>Plazas de parking</span>
              <input
                type="number"
                min={0}
                max={2000}
                value={draft.parkingSpots}
                onChange={(e) => setDraft({ ...draft, parkingSpots: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
          </div>
          <label className="field">
            <span>Nivel del restaurante (0–5)</span>
            <input
              type="range"
              min={0}
              max={5}
              value={draft.restaurantLevel}
              onChange={(e) => setDraft({ ...draft, restaurantLevel: Number(e.target.value) })}
            />
            <strong className="range-val">{draft.restaurantLevel}</strong>
          </label>
          <label className="field">
            <span>Habitaciones con vistas al mar ({draft.seaViewShare}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={draft.seaViewShare}
              onChange={(e) => setDraft({ ...draft, seaViewShare: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Enfoque del hotel</span>
            <select
              value={draft.designFocus}
              onChange={(e) => setDraft({ ...draft, designFocus: e.target.value as BuildDraft['designFocus'] })}
            >
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
                    <input
                      type="checkbox"
                      checked={draft.services.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                    />
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
            <input
              type="range"
              min={0}
              max={30}
              value={draft.openingPromoDays}
              onChange={(e) => setDraft({ ...draft, openingPromoDays: Number(e.target.value) })}
            />
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.breakfastIncluded}
              onChange={(e) => setDraft({ ...draft, breakfastIncluded: e.target.checked })}
            />
            <span>Desayuno incluido</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.buffet}
              onChange={(e) => setDraft({ ...draft, buffet: e.target.checked })}
            />
            <span>Buffet incluido</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.lateCheckout}
              onChange={(e) => setDraft({ ...draft, lateCheckout: e.target.checked })}
            />
            <span>Salida tarde flexible</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.airportDesk}
              onChange={(e) => setDraft({ ...draft, airportDesk: e.target.checked })}
            />
            <span>Mostrador en aeropuerto</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.loyaltyProgram}
              onChange={(e) => setDraft({ ...draft, loyaltyProgram: e.target.checked })}
            />
            <span>Programa de fidelidad</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.quietHours}
              onChange={(e) => setDraft({ ...draft, quietHours: e.target.checked })}
            />
            <span>Horas de silencio</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.bikeRental}
              onChange={(e) => setDraft({ ...draft, bikeRental: e.target.checked })}
            />
            <span>Alquiler de bicis</span>
          </label>
          <label className="check block-check">
            <input
              type="checkbox"
              checked={draft.shuttleCity}
              onChange={(e) => setDraft({ ...draft, shuttleCity: e.target.checked })}
            />
            <span>Bus al centro</span>
          </label>
          <p className="confirm-note">
            Estos extras suben el coste. El seguro del hotel lo gestiona sola la IA después de abrir.
          </p>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={goNext}>Seguir</button>
          </div>
        </div>
      )}

      {step === 'foto' && draft && sub && (
        <div className="panel__body">
          <img src={draft.imageDataUrl} alt="Foto del hotel" className="hotel-preview" />
          <p className="panel__meta">Elige una foto de la galería Orbis o sube la tuya</p>
          <div className="gallery-grid">
            {(gallery.length ? gallery : galleryImages(sub, draft.name)).map((src, idx) => {
              const moods = ['day', 'dusk', 'night', 'aerial'] as const
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
                const imgs = galleryImages(sub, draft.name)
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
          <div className="confirm-card">
            <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={44} height={44} />
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
            <div><span>Precio IA</span><strong>{formatEUR(aiPrice)}/noche</strong></div>
            <div><span>Habitaciones llenas (est.)</span><strong>{formatPct(estimate.occupancy)}</strong></div>
            <div><span>Ingresos / día</span><strong>{formatEUR(estimate.revenue)}</strong></div>
            <div><span>Ganancia / día</span><strong className={estimate.net >= 0 ? 'pos' : 'neg'}>{formatEUR(estimate.net)}</strong></div>
          </div>
          <p className="confirm-note">
            Se construye al momento. Luego no se puede cambiar. Precio, contratos y seguro los gestiona la IA.
            Impuestos del país: {Math.round(loc.taxRate * 100)}%.
          </p>
          {error && <p className="error">{error}</p>}
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={goBack}>Atrás</button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                const res = buildHotel(draft, loc)
                if (!res.ok) setError(res.error)
              }}
            >
              Crear hotel
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
