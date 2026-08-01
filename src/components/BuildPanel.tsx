import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SUBSIDIARIES, getSubsidiary, hotelPlaceholderImage, subsidiaryLogoSvg } from '../data/subsidiaries'
import { SERVICE_CATALOG, STAFF_OPTIONS, TARGET_OPTIONS } from '../data/catalog'
import { calcConstructionCost, estimateDaily } from '../lib/economy'
import { formatEUR, formatPct } from '../lib/format'
import type { BuildDraft, HotelService, StaffLevel, GuestTarget } from '../types'

export function BuildPanel() {
  const loc = useGameStore((s) => s.buildLocation)
  const closeBuild = useGameStore((s) => s.closeBuild)
  const buildHotel = useGameStore((s) => s.buildHotel)
  const cash = useGameStore((s) => s.cash)
  const events = useGameStore((s) => s.activeEvents)

  const [step, setStep] = useState<'filial' | 'params'>('filial')
  const [filter, setFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<BuildDraft | null>(null)

  useEffect(() => {
    setStep('filial')
    setFilter('')
    setError(null)
    setDraft(null)
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

  if (!loc) return null

  function pickSubsidiary(id: string) {
    const sub = getSubsidiary(id)!
    const name = `${sub.name.split(' ').slice(-1)[0]} ${loc!.city}`
    setDraft({
      name,
      subsidiaryId: id,
      stars: Math.min(Math.max(3, sub.minStars), sub.maxStars),
      rooms: 120,
      pricePerNight: 140 + sub.minStars * 30,
      services: ['wifi_premium', 'restaurante'],
      staffLevel: 'estandar',
      target: sub.targets[0],
      imageDataUrl: hotelPlaceholderImage(sub, name),
    })
    setStep('params')
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
    reader.onload = () => {
      setDraft({ ...draft, imageDataUrl: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  function regenerateImage() {
    if (!draft) return
    const sub = getSubsidiary(draft.subsidiaryId)
    if (!sub) return
    setDraft({ ...draft, imageDataUrl: hotelPlaceholderImage(sub, draft.name) })
  }

  const cost = draft ? calcConstructionCost(draft, loc) : 0
  const estimate = draft ? estimateDaily(draft, loc, events) : null
  const sub = draft ? getSubsidiary(draft.subsidiaryId) : null

  return (
    <aside className="panel panel--build">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Nueva construcción</p>
          <h2>{loc.city}</h2>
          <p className="panel__meta">
            {loc.region ? `${loc.region} · ` : ''}
            {loc.country}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={closeBuild} aria-label="Cerrar">
          ×
        </button>
      </div>

      <div className="insight-grid">
        <div><span>Turismo</span><strong>{loc.tourismIndex}/100</strong></div>
        <div><span>Costa</span><strong>{loc.beachScore}/100</strong></div>
        <div><span>Coste local</span><strong>×{loc.costIndex}</strong></div>
        <div><span>Impuestos</span><strong>{Math.round(loc.taxRate * 100)}%</strong></div>
        <div><span>Clima</span><strong>{loc.climateLabel}</strong></div>
        <div><span>Coords</span><strong>{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</strong></div>
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
              placeholder="Buscar por nombre o especialidad…"
            />
          </label>
          <div className="filial-list">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className="filial-card"
                onClick={() => pickSubsidiary(s.id)}
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

      {step === 'params' && draft && sub && (
        <div className="panel__body">
          <button type="button" className="linkish" onClick={() => setStep('filial')}>
            ← Cambiar filial
          </button>
          <div className="filial-selected">
            <img src={subsidiaryLogoSvg(sub, 48)} alt="" width={40} height={40} />
            <div>
              <strong>{sub.name}</strong>
              <span>{sub.specialty}</span>
            </div>
          </div>

          <label className="field">
            <span>Nombre del hotel</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              maxLength={80}
            />
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
              <span>Precio / noche (€)</span>
              <input
                type="number"
                min={30}
                max={5000}
                value={draft.pricePerNight}
                onChange={(e) =>
                  setDraft({ ...draft, pricePerNight: Math.max(30, Number(e.target.value) || 30) })
                }
              />
            </label>
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
          </div>

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

          <fieldset className="services">
            <legend>Servicios</legend>
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

          <div className="image-block">
            <img src={draft.imageDataUrl} alt="Vista del hotel" className="hotel-preview" />
            <div className="image-actions">
              <button type="button" className="btn btn--ghost" onClick={regenerateImage}>
                Generar imagen Orbis
              </button>
              <label className="btn btn--ghost file-btn">
                Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className="cost-box">
            <div>
              <span>Inversión</span>
              <strong>{formatEUR(cost)}</strong>
            </div>
            <div>
              <span>Disponible</span>
              <strong>{formatEUR(cash, true)}</strong>
            </div>
            {estimate && (
              <>
                <div>
                  <span>Ocupación est.</span>
                  <strong>{formatPct(estimate.occupancy)}</strong>
                </div>
                <div>
                  <span>Neto / día est.</span>
                  <strong className={estimate.net >= 0 ? 'pos' : 'neg'}>{formatEUR(estimate.net)}</strong>
                </div>
              </>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              const res = buildHotel(draft, loc)
              if (!res.ok) setError(res.error)
            }}
          >
            Construir ahora
          </button>
        </div>
      )}
    </aside>
  )
}
