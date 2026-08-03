import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatEUR } from '../lib/format'

/** Cinemática breve al liquidar una noche (2–3 s). */
export function ClientNightRecap() {
  const recap = useGameStore((s) => s.client.lastNightRecap)
  const income = useGameStore((s) => s.client.lastIncome)
  const dismiss = useGameStore((s) => s.clientDismissNightRecap)
  const playMode = useGameStore((s) => s.playMode)

  useEffect(() => {
    if (!recap || playMode !== 'cliente') return
    const t = window.setTimeout(() => dismiss(), 3200)
    return () => window.clearTimeout(t)
  }, [recap, playMode, dismiss])

  if (!recap || playMode !== 'cliente') return null

  const pay = recap.income ?? recap.ceo

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
            <span>Ingresos</span>
            <strong>{formatEUR(pay)}</strong>
          </div>
          <div>
            <span>Puntos</span>
            <strong>+{recap.points}</strong>
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
        {recap.incomeNote && <p className="night-recap__ceo">{recap.incomeNote}</p>}
        {income && income.factors.length > 0 && (
          <ul className="night-recap__factors">
            {income.factors.slice(0, 5).map((f) => (
              <li key={f.id}>
                <span>{f.label}</span>
                <strong>{formatEUR(f.amount)}</strong>
              </li>
            ))}
          </ul>
        )}
        <p className="night-recap__ceo">
          {recap.lastNight
            ? 'El CEO anota tu estancia en el pasaporte Orbis.'
            : 'Tu corte de cadena y hotel ya está en el monedero.'}
        </p>
        <button type="button" className="chip chip--active" onClick={() => dismiss()}>
          Continuar
        </button>
      </div>
    </div>
  )
}
