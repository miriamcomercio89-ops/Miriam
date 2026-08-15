import { useEffect } from 'react'
import { Landing } from './components/Landing'
import { TopBar } from './components/TopBar'
import { WorldMap } from './components/WorldMap'
import { SidePanel } from './components/SidePanel'
import { EventsBanner } from './components/EventsBanner'
import { useGameStore } from './store/gameStore'

export default function App() {
  const started = useGameStore((s) => s.started)
  const speed = useGameStore((s) => s.speed)
  const tick = useGameStore((s) => s.tick)
  const boot = useGameStore((s) => s.boot)
  const toast = useGameStore((s) => s.toast)
  const setToast = useGameStore((s) => s.setToast)

  useEffect(() => {
    void boot()
  }, [boot])

  useEffect(() => {
    if (!started || speed === 0) return
    const ms = speed === 1 ? 850 : speed === 4 ? 240 : 70
    const id = window.setInterval(() => tick(), ms)
    return () => window.clearInterval(id)
  }, [started, speed, tick])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(t)
  }, [toast, setToast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGameStore.getState()
      if (!s.started) return
      if (e.code === 'Space') {
        e.preventDefault()
        s.setSpeed(s.speed === 0 ? 1 : 0)
      }
      if (e.key === '1') s.setSpeed(1)
      if (e.key === '2') s.setSpeed(4)
      if (e.key === '3') s.setSpeed(16)
      if (e.key === 'f' || e.key === 'F') s.setMapMode('found')
      if (e.key === 'e' || e.key === 'E') s.setMapMode('explore')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!started) return <Landing />

  return (
    <div className="app">
      <TopBar />
      <WorldMap />
      <SidePanel />
      <EventsBanner />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
