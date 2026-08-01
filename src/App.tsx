import { useEffect } from 'react'
import { Landing } from './components/Landing'
import { TopBar } from './components/TopBar'
import { WorldMap } from './components/WorldMap'
import { BuildPanel } from './components/BuildPanel'
import { HotelDetail } from './components/HotelDetail'
import { EventsBanner } from './components/EventsBanner'
import { useGameStore } from './store/gameStore'
import { REAL_MS_PER_GAME_MINUTE } from './data/catalog'
import './index.css'

export default function App() {
  const showLanding = useGameStore((s) => s.showLanding)
  const started = useGameStore((s) => s.started)
  const speed = useGameStore((s) => s.speed)
  const tick = useGameStore((s) => s.tick)
  const persistLocal = useGameStore((s) => s.persistLocal)

  useEffect(() => {
    if (!started || speed === 0) return
    const id = window.setInterval(() => {
      tick(speed)
    }, REAL_MS_PER_GAME_MINUTE)
    return () => window.clearInterval(id)
  }, [started, speed, tick])

  useEffect(() => {
    if (!started) return
    const id = window.setInterval(() => persistLocal(), 15000)
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

  if (showLanding) return <Landing />

  return (
    <div className="app">
      <TopBar />
      <EventsBanner />
      <main className="stage">
        <WorldMap />
        <BuildPanel />
        <HotelDetail />
      </main>
    </div>
  )
}
