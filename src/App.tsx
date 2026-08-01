import { useEffect } from 'react'
import { Landing } from './components/Landing'
import { TopBar } from './components/TopBar'
import { WorldMap } from './components/WorldMap'
import { BuildPanel } from './components/BuildPanel'
import { HotelDetail } from './components/HotelDetail'
import { EventsBanner } from './components/EventsBanner'
import { FinancePanel } from './components/FinancePanel'
import { LoanPanel } from './components/LoanPanel'
import { BankPanel } from './components/BankPanel'
import { ComparePanel } from './components/ComparePanel'
import { StatsPanel } from './components/StatsPanel'
import { WeeklyPanel } from './components/WeeklyPanel'
import { MapToolbar } from './components/MapToolbar'
import { HotelListPanel } from './components/HotelListPanel'
import { RankingPanel } from './components/RankingPanel'
import { CountriesPanel } from './components/CountriesPanel'
import { NewsPanel } from './components/NewsPanel'
import { useGameStore } from './store/gameStore'
import { REAL_MS_PER_GAME_MINUTE } from './data/catalog'
import { playClickSound } from './lib/sound'
import './index.css'

export default function App() {
  const showLanding = useGameStore((s) => s.showLanding)
  const started = useGameStore((s) => s.started)
  const speed = useGameStore((s) => s.speed)
  const tick = useGameStore((s) => s.tick)
  const persistLocal = useGameStore((s) => s.persistLocal)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const closeAllPanels = useGameStore((s) => s.closeAllPanels)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const simulating = useGameStore((s) => s.simulating)

  useEffect(() => {
    if (!started || speed === 0 || simulating) return
    const id = window.setInterval(() => tick(speed), REAL_MS_PER_GAME_MINUTE)
    return () => window.clearInterval(id)
  }, [started, speed, tick, simulating])

  useEffect(() => {
    if (!started) return
    const id = window.setInterval(() => persistLocal(), 20000)
    return () => window.clearInterval(id)
  }, [started, persistLocal])

  useEffect(() => {
    const onHide = () => {
      if (useGameStore.getState().started) persistLocal()
    }
    window.addEventListener('beforeunload', onHide)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('beforeunload', onHide)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [persistLocal])

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.code === 'Space') {
        e.preventDefault()
        const cur = useGameStore.getState().speed
        setSpeed(cur === 0 ? 1 : 0)
        playClickSound(soundEnabled)
      } else if (e.key === '1') setSpeed(1)
      else if (e.key === '2') setSpeed(2)
      else if (e.key === '5') setSpeed(5)
      else if (e.key === 'Escape') closeAllPanels()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, setSpeed, closeAllPanels, soundEnabled])

  if (showLanding) return <Landing />

  return (
    <div className="app">
      <TopBar />
      <EventsBanner />
      <main className="stage">
        <WorldMap />
        <MapToolbar />
        <BuildPanel />
        <HotelDetail />
        <FinancePanel />
        <LoanPanel />
        <BankPanel />
        <ComparePanel />
        <StatsPanel />
        <WeeklyPanel />
        <HotelListPanel />
        <RankingPanel />
        <CountriesPanel />
        <NewsPanel />
      </main>
    </div>
  )
}
