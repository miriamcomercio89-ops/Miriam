import { useGameStore } from '../store/gameStore'

export function Landing() {
  const startGame = useGameStore((s) => s.startGame)
  const loadLocal = useGameStore((s) => s.loadLocal)
  const newGame = useGameStore((s) => s.newGame)
  const hasSave =
    typeof localStorage !== 'undefined' &&
    (!!localStorage.getItem('orbis-hotels-group-save-v4') ||
      !!localStorage.getItem('orbis-hotels-group-save-v3') ||
      !!localStorage.getItem('orbis-hotels-group-save-v2') ||
      !!localStorage.getItem('orbis-hotels-group-save-v1'))

  return (
    <div className="landing">
      <div className="landing__veil" />
      <div className="landing__content">
        <p className="landing__eyebrow">Juego de hoteles · v0.3</p>
        <h1 className="landing__brand">Orbis Hotels Group</h1>
        <p className="landing__lead">
          Construye hoteles en todo el mundo. 50 marcas. Muchos países.
          La IA pone precios y contratos. Tú decides dónde crecer.
        </p>
        <div className="landing__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              newGame()
            }}
          >
            Nueva partida
          </button>
          {hasSave && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                loadLocal()
                startGame()
              }}
            >
              Continuar partida
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
