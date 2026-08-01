import { useGameStore } from '../store/gameStore'
import { formatEUR, formatGameStamp } from '../lib/format'
import { getSeason, seasonLabel } from '../lib/economy'
import type { SpeedOption } from '../types'
import { SaveMenu } from './SaveMenu'

const SPEEDS: { value: SpeedOption; label: string }[] = [
  { value: 0, label: 'Pausa' },
  { value: 1, label: 'x1' },
  { value: 2, label: 'x2' },
  { value: 5, label: 'x5' },
]

export function TopBar() {
  const cash = useGameStore((s) => s.cash)
  const gameMinutes = useGameStore((s) => s.gameMinutes)
  const speed = useGameStore((s) => s.speed)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const skipDay = useGameStore((s) => s.skipDay)
  const hotels = useGameStore((s) => s.hotels)
  const loan = useGameStore((s) => s.loan)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const setShowFinance = useGameStore((s) => s.setShowFinance)
  const setShowLoan = useGameStore((s) => s.setShowLoan)
  const newGame = useGameStore((s) => s.newGame)
  const season = seasonLabel(getSeason(20, gameMinutes))

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark" aria-hidden />
        <div>
          <strong>Orbis Hotels Group</strong>
          <span className="topbar__sub">{hotels.length} hoteles · {season}</span>
        </div>
      </div>

      <div className="topbar__cash" title="Tesorería del grupo">
        {formatEUR(cash, true)}
        {loan.balance > 0 && <small className="topbar__debt">Deuda {formatEUR(loan.balance, true)}</small>}
      </div>

      <div className="topbar__time">
        <span className="topbar__stamp">{formatGameStamp(gameMinutes)}</span>
        <div className="speed-group" role="group" aria-label="Velocidad">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={speed === s.value ? 'chip chip--active' : 'chip'}
              onClick={() => setSpeed(s.value)}
            >
              {s.label}
            </button>
          ))}
          <button type="button" className="chip" onClick={skipDay}>Saltar día</button>
        </div>
      </div>

      <div className="speed-group">
        <button type="button" className="chip" onClick={() => setShowFinance(true)}>Finanzas</button>
        <button type="button" className="chip" onClick={() => setShowLoan(true)}>Préstamos</button>
        <button type="button" className="chip" onClick={toggleSound}>{soundEnabled ? 'Sonido' : 'Mudo'}</button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (window.confirm('¿Empezar una nueva partida? Se borrará el guardado local actual.')) newGame()
          }}
        >
          Nueva
        </button>
        <SaveMenu />
      </div>
    </header>
  )
}
