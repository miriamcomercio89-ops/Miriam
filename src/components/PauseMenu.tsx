import { useGameStore } from '../store/gameStore'

export function PauseMenu() {
  const show = useGameStore((s) => s.showPauseMenu)
  const setShowPauseMenu = useGameStore((s) => s.setShowPauseMenu)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const persistLocal = useGameStore((s) => s.persistLocal)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const gameName = useGameStore((s) => s.gameName)

  if (!show) return null

  function continueGame() {
    setShowPauseMenu(false)
    setSpeed(1)
  }

  function save() {
    persistLocal()
  }

  function backToMenu() {
    if (!window.confirm('¿Volver al menú? Se guardará la partida actual.')) return
    persistLocal()
    useGameStore.setState({
      started: false,
      showLanding: true,
      showPauseMenu: false,
      speed: 0,
    })
  }

  return (
    <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Menú de pausa">
      <div className="pause-menu panel">
        <p className="panel__eyebrow">Pausa</p>
        <h2>{gameName || 'Orbis Hotels Group'}</h2>
        <p className="panel__meta">Partida en pausa</p>
        <div className="pause-menu__actions">
          <button type="button" className="btn btn--primary btn--block" onClick={continueGame}>
            Continuar
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={save}>
            Guardar
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={toggleSound}>
            {soundEnabled ? 'Sonido: activado' : 'Sonido: silenciado'}
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={backToMenu}>
            Volver al menú
          </button>
        </div>
        <p className="pause-menu__hint">Esc cierra · M abre el menú</p>
      </div>
    </div>
  )
}
