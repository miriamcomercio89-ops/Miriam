import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadPlanIndex, loadRegionHotels, type PlanHotel, type PlanIndex } from '../lib/constructionPlan'

export function PlanPanel() {
  const show = useGameStore((s) => s.showPlan)
  const setShow = useGameStore((s) => s.setShowPlan)
  const planDoneOrders = useGameStore((s) => s.planDoneOrders)
  const planCursor = useGameStore((s) => s.planCursor)
  const markPlanDone = useGameStore((s) => s.markPlanDone)
  const skipPlanHotel = useGameStore((s) => s.skipPlanHotel)
  const setPlanCursor = useGameStore((s) => s.setPlanCursor)
  const setMapFocus = useGameStore((s) => s.setMapFocus)

  const [index, setIndex] = useState<PlanIndex | null>(null)
  const [hotels, setHotels] = useState<PlanHotel[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    void loadPlanIndex().then((idx) => {
      setIndex(idx)
      if (!idx) setErr('No está el índice del plan en /plan/index.json')
    })
  }, [show])

  const region = useMemo(() => {
    if (!index) return null
    return index.items.find((i) => planCursor >= i.orderStart && planCursor <= i.orderEnd)
      ?? index.items.find((i) => i.orderStart >= planCursor)
      ?? index.items[0]
  }, [index, planCursor])

  useEffect(() => {
    if (!show || !region) return
    setLoading(true)
    setErr(null)
    void loadRegionHotels(region.order).then((list) => {
      setHotels(list)
      setLoading(false)
      if (!list.length) {
        setErr('No hay fichas de esta zona en el juego todavía.')
      }
    })
  }, [show, region?.order])

  const doneSet = useMemo(() => new Set(planDoneOrders), [planDoneOrders])
  const doneCount = planDoneOrders.length
  const total = index?.totalHotels ?? 0
  const current = hotels.find((h) => h.order === planCursor) ?? hotels.find((h) => !doneSet.has(h.order))

  if (!show) return null

  return (
    <aside className="panel panel--plan" role="dialog" aria-label="Plan de construcción">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Plan de construcción</p>
          <h2>Siguiente hotel</h2>
          <p className="panel__meta">
            Hechos {doneCount.toLocaleString('es-ES')} / {total.toLocaleString('es-ES') || '—'}
          </p>
        </div>
        <button type="button" className="chip" onClick={() => setShow(false)}>Cerrar</button>
      </div>
      <div className="panel__body">
        {region && (
          <p className="plan-region">
            Zona #{region.order}: <strong>{region.region}</strong> · {region.country}
            <br />
            Hoteles de la zona: {region.count} · Orden #{region.orderStart}–#{region.orderEnd}
          </p>
        )}
        {loading && <p>Cargando fichas…</p>}
        {err && <p className="plan-warn">{err}</p>}
        {current && (
          <div className="plan-card">
            <p className="plan-order">#{current.order}</p>
            <p className="plan-buy">Compra: {current.realHotel}</p>
            <p className="plan-new">Nuevo: {current.name}</p>
            <p className="mini">
              {current.city} · {current.subsidiaryName} · {current.stars}★ · {current.rooms} hab.
            </p>
            {current.website && (
              <p className="mini">
                <a href={current.website} target="_blank" rel="noreferrer">Web del hotel</a>
              </p>
            )}
            <div className="plan-actions">
              <button type="button" className="btn btn--primary" onClick={() => markPlanDone(current.order)}>
                Marcar hecho
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => skipPlanHotel(current.order)}>
                Saltar
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  if (current.lat != null && current.lng != null) {
                    setMapFocus({ lat: current.lat, lng: current.lng, zoom: 12 })
                    setShow(false)
                  }
                }}
                disabled={current.lat == null}
              >
                Ir al mapa
              </button>
            </div>
          </div>
        )}
        <div className="plan-actions" style={{ marginTop: '0.75rem' }}>
          {region && index && (
            <button
              type="button"
              className="chip"
              onClick={() => {
                const next = index.items.find((i) => i.order === region.order + 1)
                if (next) setPlanCursor(next.orderStart)
              }}
            >
              Siguiente zona
            </button>
          )}
        </div>
        {hotels.length > 0 && (
          <ul className="plan-list">
            {hotels.slice(0, 40).map((h) => (
              <li key={h.order} className={doneSet.has(h.order) ? 'done' : h.order === planCursor ? 'current' : ''}>
                <button type="button" className="plan-list__btn" onClick={() => setPlanCursor(h.order)}>
                  #{h.order} {doneSet.has(h.order) ? '✓ ' : ''}
                  {h.realHotel} → {h.city}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
