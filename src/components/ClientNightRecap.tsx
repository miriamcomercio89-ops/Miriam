import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatEUR } from '../lib/format'

/** Cinemática breve al liquidar una noche (2–3 s). */
export function ClientNightRecap() {
  const recap = useGameStore((s) => s.client.lastNightRecap)
  const dismiss = useGameStore((s) => s.clientDismissNightRecap)
  const playMode = useGameStore((s) => s.playMode)

  useEffect(() => {
    if (!recap || playMode !== 'cliente') return
    const t = window.setTimeout(() => dismiss(), 2800)
    return () => window.clearTimeout(t)
  }, [recap, playMode, dismiss])

  if (!recap || playMode !== 'cliente') return null

  return (
    <div className="night-recap" role="dialog" aria-label="Fin de noche" onClick={() => dismiss()}>
      <div className="night-recap__card" onClick={(e) => e.stopPropagation()}>
        <p className="night-recap__eyebrow">Noche en Orbis</p>
        <h2 className="night-recap__title">{recap.hotelName}</h2>
        <p className="night-recap__city">{recap.city}</p>
        <p className="night-recap__weather">
          <strong>{recap.weatherLabel}</strong>
          <span>{recap.weatherDetail}</span>
        </p>
        <div className="night-recap__stats">
          <div>
            <span>Puntos</span>
            <strong>+{recap.points}</strong>
          </div>
          <div>
            <span>CEO</span>
            <strong>{formatEUR(recap.ceo)}</strong>
          </div>
          {recap.tourBonus > 0 && (
            <div>
              <span>Tour</span>
              <strong>+{recap.tourBonus}</strong>
            </div>
          )}
          <div>
            <span>Noche</span>
            <strong>
              {recap.nightsDone}/{recap.nightsTotal}
            </strong>
          </div>
        </div>
        <p className="night-recap__ceo">
          {recap.lastNight
            ? 'El CEO anota tu estancia en el pasaporte Orbis.'
            : 'El club te espera mañana con una misión fresca.'}
        </p>
        <button type="button" className="chip chip--active" onClick={() => dismiss()}>
          Continuar
        </button>
      </div>
    </div>
  )
}
