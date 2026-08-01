import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatEUR, formatGameStamp } from '../lib/format'
import { getSeason, seasonLabel } from '../lib/economy'
import type { SpeedOption } from '../types'
import { SaveMenu } from './SaveMenu'

const SPEEDS: { value: SpeedOption; label: string; title: string }[] = [
  { value: 0, label: 'Pausa', title: 'Espacio' },
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
  const [moreOpen, setMoreOpen] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)

  function openPanel(fn: (v: boolean) => void) {
    fn(true)
    setMoreOpen(false)
  }

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
            +1 día
          </button>
        </div>
      </div>

      <nav className="topbar__nav" aria-label="Paneles">
        <button type="button" className="chip chip--key" title="Hoteles (H)" onClick={() => setShowHotels(true)}>
          Hoteles <kbd>H</kbd>
        </button>
        <button type="button" className="chip chip--key" title="Plan (P)" onClick={() => setShowPlan(true)}>
          Plan <kbd>P</kbd>
        </button>
        <button type="button" className="chip chip--key" title="Banco (B)" onClick={() => setShowBank(true)}>
          Banco <kbd>B</kbd>
        </button>
        <button type="button" className="chip" title="Dinero y fama" onClick={() => setShowFinance(true)}>
          Dinero
        </button>

        <div className={`topbar__dropdown ${moreOpen ? 'is-open' : ''}`}>
          <button type="button" className="chip" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>
            Más
          </button>
          {moreOpen && (
            <div className="topbar__menu" role="menu">
              <button type="button" role="menuitem" onClick={() => openPanel(setShowCountries)}>Países</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowNews)}>Noticias</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowRanking)}>Ranking</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowCompare)}>Comparar</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowStats)}>Stats</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowWeekly)}>Semanal</button>
              <button type="button" role="menuitem" onClick={() => openPanel(setShowLoan)}>Préstamos</button>
              <div className="topbar__menu-sep" />
              <button type="button" role="menuitem" onClick={() => setDebugOpen((v) => !v)}>
                Debug {debugOpen ? '▾' : '▸'}
              </button>
              {debugOpen && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={simulating}
                    onClick={() => {
                      if (!window.confirm('¿Añadir ~1000 hoteles de prueba?')) return
                      const res = generateDemo(1000)
                      if (!res.ok) window.alert(res.error)
                      setMoreOpen(false)
                    }}
                  >
                    Demo 1k
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={simulating}
                    onClick={() => {
                      if (!window.confirm('¿Añadir ~5000 hoteles de prueba? Puede ir más lento.')) return
                      const res = generateDemo(5000)
                      if (!res.ok) window.alert(res.error)
                      setMoreOpen(false)
                    }}
                  >
                    Demo 5k
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button type="button" className="chip" title="Sonido sí/no" onClick={toggleSound}>
          {soundEnabled ? 'Sonido' : 'Mudo'}
        </button>
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
      </nav>

      {simulating && <div className="sim-banner" role="status">{simProgress || 'Calculando…'}</div>}
      {saveToast && (
        <button type="button" className="save-toast" onClick={clearSaveToast} title="Cerrar aviso">
          {saveToast}
        </button>
      )}
    </header>
  )
}
