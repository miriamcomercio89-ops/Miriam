import { HQ_UPGRADES, BRANDS } from '../data/brands'
import { formatEUR } from '../lib/format'
import { useGameStore } from '../store/gameStore'

export function HqPanel() {
  const hqLevel = useGameStore((s) => s.hqLevel)
  const upgrades = useGameStore((s) => s.upgrades)
  const cash = useGameStore((s) => s.cash)
  const buyUpgrade = useGameStore((s) => s.buyUpgrade)
  const upgradeHq = useGameStore((s) => s.upgradeHq)
  const nextCost = Math.round(180000 * hqLevel ** 1.45)
  const lockedBrands = BRANDS.filter((b) => b.hqLevel > hqLevel)

  return (
    <div>
      <h3 className="serif">Sede · Álora</h3>
      <p className="muted">
        Nivel {hqLevel} / 6. Subir el HQ desbloquea marcas (Horno, Fuego, Nori, Casa Paladar…) y mejoras
        de red.
      </p>
      <button type="button" className="btn primary" disabled={cash < nextCost || hqLevel >= 6} onClick={upgradeHq}>
        Ampliar HQ · {formatEUR(nextCost)}
      </button>
      {lockedBrands.length > 0 && (
        <p className="muted">Próximas marcas: {lockedBrands.map((b) => b.short).join(', ')}</p>
      )}
      {HQ_UPGRADES.map((u) => {
        const owned = upgrades.includes(u.id)
        const locked = hqLevel < u.levelReq
        return (
          <div key={u.id} className="card">
            <div className="row">
              <b>{u.name}</b>
              <span className="muted">{owned ? 'activa' : formatEUR(u.cost)}</span>
            </div>
            <p className="muted">{u.desc}</p>
            {!owned && (
              <button
                type="button"
                className="btn"
                disabled={locked || cash < u.cost}
                onClick={() => buyUpgrade(u.id)}
              >
                {locked ? `Requiere HQ ${u.levelReq}` : 'Comprar'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
