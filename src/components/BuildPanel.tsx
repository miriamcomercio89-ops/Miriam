import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES, getSubsidiary, hotelPlaceholderImage, subsidiaryLogoSvg } from '../data/subsidiaries'
import { SERVICE_CATALOG, STAFF_OPTIONS, TARGET_OPTIONS } from '../data/catalog'
import { calcConstructionCost, estimateDaily, fairPrice, getSeason, seasonLabel } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import { galleryImages } from '../lib/gallery'
import { geoRegionLabel } from '../lib/geo'
import type { BuildDraft, HotelService, StaffLevel, GuestTarget } from '../types'

type Step = 'filial' | 'concepto' | 'servicios' | 'imagen' | 'confirmacion'

const STEPS: { id: Step; label: string }[] = [
  { id: 'filial', label: '1. Filial' },
  { id: 'concepto', label: '2. Concepto' },
  { id: 'servicios', label: '3. Servicios' },
  { id: 'imagen', label: '4. Imagen' },
  { id: 'confirmacion', label: '5. Confirmar' },
]

export function BuildPanel() {
  const loc = useGameStore((s) => s.buildLocation)
  const closeBuild = useGameStore((s) => s.closeBuild)
  const buildHotel = useGameStore((s) => s.buildHotel)
  const cash = useGameStore((s) => s.cash)
  const events = useGameStore((s) => s.activeEvents)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const reputation = useGameStore((s) => s.reputation)

  const [step, setStep] = useState<Step>('filial')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<BuildDraft | null>(null)
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    setStep('filial')
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
        s.tagline.toLowerCase().includes(q) ||
        s.lore.toLowerCase().includes(q),
    )
  }, [filter])

  if (!loc) return null

  const rep = reputation[loc.countryCode] ?? 55
  const season = getSeason(loc.lat, gameMinutes)

  function pickSubsidiary(id: string) {
    const sub = getSubsidiary(id)!
    const name = `${sub.name.replace('Orbis ', '')} ${loc!.city}`
    const next: BuildDraft = {
      name,
      subsidiaryId: id,
      stars: Math.min(Math.max(3, sub.minStars), sub.maxStars),
      rooms: 120,
      services: ['wifi_premium', 'restaurante'],
      staffLevel: 'estandar',
      target: sub.targets[0],
      imageDataUrl: hotelPlaceholderImage(sub, name),
    }
    setDraft(next)
    setGallery(galleryImages(sub, name))
    setStep('concepto')
    setError(null)
  }

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

  const cost = draft ? calcConstructionCost(draft, loc) : 0
  const estimate = draft ? estimateDaily(draft, loc, events, gameMinutes, rep) : null
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
          },
          season,
        )
      : 0

  const stepIdx = STEPS.findIndex((s) => s.id === step)

  return (
    <aside className="panel panel--build">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Nueva construcción</p>
          <h2>{loc.city}</h2>
          <p className="panel__meta">
            {loc.region ? `${loc.region} · ` : ''}
            {loc.country} · {geoRegionLabel(loc.geoRegion)}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={closeBuild} aria-label="Cerrar">
          ×
        </button>
      </div>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`stepper__item ${s.id === step ? 'is-active' : ''} ${i < stepIdx ? 'is-done' : ''}`}
            disabled={!draft && s.id !== 'filial'}
            onClick={() => {
              if (s.id === 'filial' || draft) setStep(s.id)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="insight-grid">
        <div><span>Turismo</span><strong>{loc.tourismIndex}/100</strong></div>
        <div><span>Costa</span><strong>{loc.beachScore}/100</strong></div>
        <div><span>Coste local</span><strong>×{loc.costIndex}</strong></div>
        <div><span>Reputación</span><strong>{Math.round(rep)}/100</strong></div>
        <div><span>Temporada</span><strong>{seasonLabel(season)}</strong></div>
        <div><span>Confianza geo</span><strong>{Math.round(loc.confidence * 100)}%</strong></div>
      </div>
      {loc.notes.length > 0 && (
        <ul className="notes">
          {loc.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      {step === 'filial' && (
        <div className="panel__body">
          <label className="field">
            <span>Elige filial (50)</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre, especialidad o lore…"
            />
          </label>
          <div className="filial-list">
            {filtered.map((s) => (
              <button key={s.id} type="button" className="filial-card" onClick={() => pickSubsidiary(s.id)}>
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

      {step === 'concepto' && draft && sub && (
        <div className="panel__body">
          <div className="filial-selected">
            <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={40} height={40} />
            <div>
              <strong>{sub.name}</strong>
              <span>{sub.specialty}</span>
              <em className="lore">{sub.lore}</em>
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
              <select
                value={draft.staffLevel}
                onChange={(e) => setDraft({ ...draft, staffLevel: e.target.value as StaffLevel })}
              >
                {STAFF_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Público objetivo</span>
              <select
                value={draft.target}
                onChange={(e) => setDraft({ ...draft, target: e.target.value as GuestTarget })}
              >
                {TARGET_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="ai-price-note">
            Precio / noche: gestiona la <strong>IA Orbis Pricing</strong> (estimado inicial {formatEUR(aiPrice)}).
          </p>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('filial')}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={() => setStep('servicios')}>Continuar</button>
          </div>
        </div>
      )}

      {step === 'servicios' && draft && (
        <div className="panel__body">
          <fieldset className="services">
            <legend>Servicios del hotel</legend>
            <div className="services__grid">
              {SERVICE_CATALOG.map((s) => (
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
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('concepto')}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={() => setStep('imagen')}>Continuar</button>
          </div>
        </div>
      )}

      {step === 'imagen' && draft && sub && (
        <div className="panel__body">
          <img src={draft.imageDataUrl} alt="Vista del hotel" className="hotel-preview" />
          <p className="panel__meta">Galería Orbis · {sub.imageStyle}</p>
          <div className="gallery-grid">
            {(gallery.length ? gallery : galleryImages(sub, draft.name)).map((src) => (
              <button
                key={src.slice(0, 80)}
                type="button"
                className={`gallery-thumb ${draft.imageDataUrl === src ? 'is-selected' : ''}`}
                onClick={() => setDraft({ ...draft, imageDataUrl: src })}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="image-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                const imgs = galleryImages(sub, draft.name)
                setGallery(imgs)
                setDraft({ ...draft, imageDataUrl: imgs[0] })
              }}
            >
              Regenerar galería
            </button>
            <label className="btn btn--ghost file-btn">
              Subir imagen
              <input type="file" accept="image/*" hidden onChange={(e) => onImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('servicios')}>Atrás</button>
            <button type="button" className="btn btn--primary" onClick={() => setStep('confirmacion')}>Revisar</button>
          </div>
        </div>
      )}

      {step === 'confirmacion' && draft && sub && estimate && (
        <div className="panel__body">
          <div className="confirm-card">
            <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={44} height={44} />
            <div>
              <strong>{draft.name}</strong>
              <span>{sub.name} · {'★'.repeat(draft.stars)} · {draft.rooms} hab.</span>
            </div>
          </div>
          <div className="cost-box">
            <div><span>Inversión</span><strong>{formatEUR(cost)}</strong></div>
            <div><span>Caja disponible</span><strong>{formatEUR(cash, true)}</strong></div>
            <div><span>Precio IA</span><strong>{formatEUR(aiPrice)}/noche</strong></div>
            <div><span>Ocupación est.</span><strong>{formatPct(estimate.occupancy)}</strong></div>
            <div><span>Ingresos / día</span><strong>{formatEUR(estimate.revenue)}</strong></div>
            <div><span>Neto / día est.</span><strong className={estimate.net >= 0 ? 'pos' : 'neg'}>{formatEUR(estimate.net)}</strong></div>
          </div>
          <p className="confirm-note">
            La construcción es instantánea e irreversible. El precio lo ajustará cada día la IA Orbis Pricing.
          </p>
          {error && <p className="error">{error}</p>}
          <div className="nav-row">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('imagen')}>Atrás</button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                const res = buildHotel(draft, loc)
                if (!res.ok) setError(res.error)
              }}
            >
              Confirmar y construir
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
