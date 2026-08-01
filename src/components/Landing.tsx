import { useGameStore } from '../store/gameStore'

export function Landing() {
  const startGame = useGameStore((s) => s.startGame)
  const loadLocal = useGameStore((s) => s.loadLocal)
  const hasSave = typeof localStorage !== 'undefined' && !!localStorage.getItem('orbis-hotels-group-save-v1')

  return (
    <div className="landing">
      <div className="landing__veil" />
      <div className="landing__content">
        <p className="landing__eyebrow">Simulador hotelero mundial</p>
        <h1 className="landing__brand">Orbis Hotels Group</h1>
        <p className="landing__lead">
          Dirige la expansión global de Orbis. Cincuenta filiales. Miles de hoteles.
          El mapa es tu tablero.
        </p>
        <div className="landing__actions">
          <button type="button" className="btn btn--primary" onClick={startGame}>
            Abrir el mapa
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
