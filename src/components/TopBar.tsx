import { useGameStore } from '../store/gameStore'
import { formatEUR, formatGameStamp } from '../lib/format'
import { getSeason, seasonLabel } from '../lib/economy'
import type { SpeedOption } from '../types'
import { SaveMenu } from './SaveMenu'

const SPEEDS: { value: SpeedOption; label: string; title: string }[] = [
  { value: 0, label: 'Pausa', title: 'Tecla Espacio' },
  { value: 1, label: 'x1', title: 'Tecla 1' },
  { value: 2, label: 'x2', title: 'Tecla 2' },
  { value: 5, label: 'x5', title: 'Tecla 5' },
]

export function TopBar() {
  const cash = useGameStore((s) => s.cash)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const speed = useGameStore((s) => s.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const skipDay = useGameStore((s) => s.skipDay)
  const hotels = useGameStore((s) => s.hotels)
  const loan = useGameStore((s) => s.loan)
  const bankDeposits = useGameStore((s) => s.bankDeposits)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const setShowFinance = useGameStore((s) => s.setShowFinance)
  const setShowLoan = useGameStore((s) => s.setShowLoan)
  const setShowBank = useGameStore((s) => s.setShowBank)
  const setShowHotels = useGameStore((s) => s.setShowHotels)
  const setShowRanking = useGameStore((s) => s.setShowRanking)
  const setShowCountries = useGameStore((s) => s.setShowCountries)
  const setShowNews = useGameStore((s) => s.setShowNews)
  const setShowCompare = useGameStore((s) => s.setShowCompare)
  const setShowStats = useGameStore((s) => s.setShowStats)
  const setShowWeekly = useGameStore((s) => s.setShowWeekly)
  const setShowPlan = useGameStore((s) => s.setShowPlan)
  const generateDemo = useGameStore((s) => s.generateDemo)
  const newGame = useGameStore((s) => s.newGame)
  const gameName = useGameStore((s) => s.gameName)
  const simulating = useGameStore((s) => s.simulating)
  const simProgress = useGameStore((s) => s.simProgress)
  const saveToast = useGameStore((s) => s.saveToast)
  const clearSaveToast = useGameStore((s) => s.clearSaveToast)
  const loyaltyLevel = useGameStore((s) => s.loyaltyLevel)
  const season = seasonLabel(getSeason(20, gameMinutes))
  const bankLocked = bankDeposits.reduce((s, d) => s + d.amount, 0)

  return (
    <header className="topbar">
      <div className="topbar__brand" title={gameName}>
        <span className="topbar__mark" aria-hidden />
        <div>
          <strong>Orbis Hotels Group</strong>
          <span className="topbar__sub">
            {hotels.length.toLocaleString('es-ES')} hoteles · {season} · Club Nv.{loyaltyLevel}
          </span>
        </div>
      </div>

      <div className="topbar__cash" title="Dinero del grupo">
        {formatEUR(cash, true)}
        {loan.balance > 0 && <small className="topbar__debt">Deuda {formatEUR(loan.balance, true)}</small>}
        {bankLocked > 0 && <small className="topbar__debt">Banco {formatEUR(bankLocked, true)}</small>}
      </div>

      <div className="topbar__time">
        <span className="topbar__stamp">{formatGameStamp(gameMinutes)}</span>
        <div className="speed-group" role="group" aria-label="Velocidad">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={speed === s.value ? 'chip chip--active' : 'chip'}
              title={s.title}
              disabled={simulating}
              onClick={() => setSpeed(s.value)}
            >
              {s.label}
            </button>
          ))}
          <button type="button" className="chip" title="Pasar al día siguiente" disabled={simulating} onClick={() => void skipDay()}>
            Saltar día
          </button>
        </div>
      </div>

      <div className="speed-group">
        <button type="button" className="chip" title="Ver países e impuestos" onClick={() => setShowCountries(true)}>Países</button>
        <button type="button" className="chip" title="Noticias Orbis" onClick={() => setShowNews(true)}>Noticias</button>
        <button type="button" className="chip" title="Lista de hoteles" onClick={() => setShowHotels(true)}>Hoteles</button>
        <button type="button" className="chip" title="Mejores hoteles" onClick={() => setShowRanking(true)}>Ranking</button>
        <button type="button" className="chip" title="Comparar dos hoteles" onClick={() => setShowCompare(true)}>Comparar</button>
        <button type="button" className="chip" title="Estadísticas globales" onClick={() => setShowStats(true)}>Stats</button>
        <button type="button" className="chip" title="Informe semanal" onClick={() => setShowWeekly(true)}>Semanal</button>
        <button type="button" className="chip" title="Plan de construcción" onClick={() => setShowPlan(true)}>Plan</button>
        <button type="button" className="chip" title="Dinero y fama" onClick={() => setShowFinance(true)}>Dinero</button>
        <button type="button" className="chip" title="Depósitos a plazo" onClick={() => setShowBank(true)}>Banco</button>
        <button type="button" className="chip" title="Pedir o devolver crédito" onClick={() => setShowLoan(true)}>Préstamos</button>
        <button
          type="button"
          className="chip"
          title="Añadir ~1000 hoteles de prueba"
          disabled={simulating}
          onClick={() => {
            if (!window.confirm('¿Añadir unos 1000 hoteles de prueba?')) return
            const res = generateDemo(1000)
            if (!res.ok) window.alert(res.error)
          }}
        >
          Demo 1k
        </button>
        <button
          type="button"
          className="chip"
          title="Prueba de rendimiento con muchos hoteles"
          disabled={simulating}
          onClick={() => {
            if (!window.confirm('¿Añadir unos 5000 hoteles de prueba? Puede ir más lento.')) return
            const res = generateDemo(5000)
            if (!res.ok) window.alert(res.error)
          }}
        >
          Demo 5k
        </button>
        <button type="button" className="chip" title="Sonido sí/no" onClick={toggleSound}>{soundEnabled ? 'Sonido' : 'Mudo'}</button>
        <button
          type="button"
          className="chip"
          title="Empezar de cero"
          onClick={() => {
            if (window.confirm('¿Nueva partida? Se borrará el guardado rápido actual.')) newGame()
          }}
        >
          Nueva
        </button>
        <SaveMenu />
      </div>

      {simulating && <div className="sim-banner" role="status">{simProgress || 'Calculando…'}</div>}
      {saveToast && (
        <button type="button" className="save-toast" onClick={clearSaveToast} title="Cerrar aviso">
          {saveToast}
        </button>
      )}
    </header>
  )
}
