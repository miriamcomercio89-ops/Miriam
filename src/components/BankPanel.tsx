import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { BANK_TERMS } from '../lib/economy'
import { formatEUR, formatGameDay } from '../lib/format'

export function BankPanel() {
  const open = useGameStore((s) => s.showBank)
  const setShowBank = useGameStore((s) => s.setShowBank)
  const cash = useGameStore((s) => s.cash)
  const deposits = useGameStore((s) => s.bankDeposits)
  const openDeposit = useGameStore((s) => s.openDeposit)
  const [amount, setAmount] = useState(1_000_000)
  const [term, setTerm] = useState<number>(30)
  const [msg, setMsg] = useState<string | null>(null)

  if (!open) return null

  const locked = deposits.reduce((s, d) => s + d.amount, 0)
  const termInfo = BANK_TERMS.find((t) => t.days === term)

  return (
    <aside className="panel panel--finance">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Banco Orbis</p>
          <h2>Depósitos a plazo</h2>
          <p className="panel__meta">
            Caja libre {formatEUR(cash, true)} · en depósitos {formatEUR(locked, true)}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowBank(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="panel__body">
        <p className="muted">
          Dejas dinero un tiempo fijo. Cada día gana un poco de interés. Al acabar el plazo vuelve a tu caja.
        </p>
        <label className="field">
          <span>Cantidad (€)</span>
          <input
            type="number"
            min={100000}
            step={100000}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        <label className="field">
          <span>Plazo</span>
          <select value={term} onChange={(e) => setTerm(Number(e.target.value))}>
            {BANK_TERMS.map((t) => (
              <option key={t.days} value={t.days}>
                {t.label} · ~{(t.dailyRate * 100 * 365).toFixed(1)}% año
              </option>
            ))}
          </select>
        </label>
        {termInfo && (
          <p className="confirm-note">
            Interés diario aprox. {formatEUR(Math.round(amount * termInfo.dailyRate))} sobre {formatEUR(amount)}.
          </p>
        )}
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => {
            const res = openDeposit(amount, term)
            setMsg(res.ok ? 'Depósito creado' : res.error)
          }}
        >
          Abrir depósito
        </button>
        {msg && <p className="save-msg">{msg}</p>}

        <h3 className="mini-title">Tus depósitos</h3>
        {deposits.length === 0 ? (
          <p className="muted">Ninguno todavía.</p>
        ) : (
          <div className="cost-box">
            {deposits.map((d) => (
              <div key={d.id}>
                <span>
                  Desde {formatGameDay(d.createdDay)} · quedan {d.daysLeft} días
                </span>
                <strong>{formatEUR(d.amount, true)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
