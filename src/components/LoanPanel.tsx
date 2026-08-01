import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatEUR } from '../lib/format'

export function LoanPanel() {
  const open = useGameStore((s) => s.showLoan)
  const setShowLoan = useGameStore((s) => s.setShowLoan)
  const loan = useGameStore((s) => s.loan)
  const cash = useGameStore((s) => s.cash)
  const takeLoan = useGameStore((s) => s.takeLoan)
  const repayLoan = useGameStore((s) => s.repayLoan)
  const [amount, setAmount] = useState(50_000_000)
  const [msg, setMsg] = useState<string | null>(null)

  if (!open) return null

  const available = loan.limit - loan.balance
  const annualApprox = loan.dailyRate * 365 * 100

  return (
    <aside className="panel panel--loan">
      <div className="panel__head">
        <div>
          <p className="panel__eyebrow">Crédito corporativo</p>
          <h2>Línea Orbis</h2>
          <p className="panel__meta">Interés diario ~{(loan.dailyRate * 100).toFixed(3)}% (≈ {annualApprox.toFixed(1)}% anual)</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowLoan(false)} aria-label="Cerrar">×</button>
      </div>
      <div className="panel__body">
        <div className="cost-box">
          <div><span>Deuda</span><strong>{formatEUR(loan.balance, true)}</strong></div>
          <div><span>Disponible</span><strong>{formatEUR(available, true)}</strong></div>
          <div><span>Límite</span><strong>{formatEUR(loan.limit, true)}</strong></div>
          <div><span>Caja</span><strong>{formatEUR(cash, true)}</strong></div>
        </div>
        <label className="field">
          <span>Importe (€)</span>
          <input
            type="number"
            min={1_000_000}
            step={1_000_000}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        <div className="nav-row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              const r = takeLoan(amount)
              setMsg(r.ok ? `Crédito recibido: ${formatEUR(amount)}` : r.error)
            }}
          >
            Disponer
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              const r = repayLoan(Math.min(amount, loan.balance, cash))
              setMsg(r.ok ? 'Amortización realizada' : r.error)
            }}
          >
            Amortizar
          </button>
        </div>
        {msg && <p className="save-msg">{msg}</p>}
        <p className="confirm-note">
          Cada día se cobra interés y una amortización mínima automática sobre el saldo.
        </p>
      </div>
    </aside>
  )
}
