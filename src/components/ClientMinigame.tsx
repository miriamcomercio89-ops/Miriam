import { useEffect, useRef, useState } from 'react'
import { formatEUR } from '../lib/format'
import {
  CINE_TRIVIA,
  MINIGAME_LABEL,
  resolveCasinoSpin,
  resolveDive,
  resolveGolfSwing,
  resolveHeli,
  resolveKids,
  resolvePadel,
  resolveSlots,
  resolveTeatro,
  resolveTrivia,
  type MinigameId,
  type MinigameOutcome,
} from '../lib/clientMinigames'

type Props = {
  id: MinigameId
  entryCost: number
  wallet: number
  onDone: (outcome: MinigameOutcome) => void
  onCancel: () => void
}

export function ClientMinigame({ id, entryCost, wallet, onDone, onCancel }: Props) {
  return (
    <div className="minigame" role="dialog" aria-modal="true" aria-label={MINIGAME_LABEL[id]}>
      <div className="minigame__panel">
        <header className="minigame__head">
          <div>
            <p className="panel__eyebrow">Minijuego</p>
            <h3>{MINIGAME_LABEL[id]}</h3>
            <p className="muted">Entrada ya pagada: {formatEUR(entryCost)}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="minigame__body">
          {id === 'casino_ruleta' && <CasinoGame wallet={wallet} onDone={onDone} />}
          {id === 'casino_tragaperras' && <SlotsGame wallet={wallet} onDone={onDone} />}
          {id === 'golf_swing' && <GolfGame onDone={onDone} />}
          {id === 'buceo_tesoro' && <DiveGame onDone={onDone} />}
          {id === 'padel_rally' && <PadelGame onDone={onDone} />}
          {id === 'cine_trivia' && <TriviaGame onDone={onDone} />}
          {id === 'heli_vuelo' && <HeliGame onDone={onDone} />}
          {id === 'teatro_aplauso' && <TeatroGame onDone={onDone} />}
          {id === 'kids_busca' && <KidsGame onDone={onDone} />}
        </div>
      </div>
    </div>
  )
}

function CasinoGame({ wallet, onDone }: { wallet: number; onDone: (o: MinigameOutcome) => void }) {
  const [pick, setPick] = useState<'rojo' | 'negro' | 'verde' | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [angle, setAngle] = useState(0)
  const [bet, setBet] = useState(50)
  const [err, setErr] = useState<string | null>(null)

  function spin() {
    if (!pick || spinning) return
    if (wallet < bet) {
      setErr('No te llega el monedero para esa apuesta.')
      return
    }
    setErr(null)
    setSpinning(true)
    const extra = 720 + Math.floor(Math.random() * 360)
    setAngle((a) => a + extra)
    window.setTimeout(() => {
      onDone(resolveCasinoSpin(pick, bet))
    }, 1600)
  }

  return (
    <div className="mg-casino">
      <div className="mg-casino__wheel" style={{ transform: `rotate(${angle}deg)` }} aria-hidden>
        <span>0</span>
      </div>
      <p>Elige color y apuesta (se descuenta del monedero si pierdes).</p>
      <div className="speed-group">
        {(['rojo', 'negro', 'verde'] as const).map((c) => (
          <button
            key={c}
            type="button"
            className={pick === c ? 'chip chip--active' : 'chip'}
            onClick={() => setPick(c)}
            disabled={spinning}
          >
            {c}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Apuesta fichas (€) · disponible {formatEUR(wallet)}</span>
        <input
          type="number"
          min={10}
          max={Math.max(10, Math.min(500, wallet))}
          value={bet}
          disabled={spinning}
          onChange={(e) => setBet(Math.max(10, Number(e.target.value) || 10))}
        />
      </label>
      <p className="muted">Rojo/negro ×2 · Verde ×14.</p>
      {err && <p className="error">{err}</p>}
      <button type="button" className="btn btn--primary" disabled={!pick || spinning} onClick={spin}>
        {spinning ? 'Girando…' : 'Girar ruleta'}
      </button>
    </div>
  )
}

function GolfGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const [pos, setPos] = useState(0)
  const [locked, setLocked] = useState(false)
  const dir = useRef(1)

  useEffect(() => {
    if (locked) return
    const id = window.setInterval(() => {
      setPos((p) => {
        let next = p + dir.current * 2.2
        if (next >= 100) {
          dir.current = -1
          next = 100
        } else if (next <= 0) {
          dir.current = 1
          next = 0
        }
        return next
      })
    }, 16)
    return () => window.clearInterval(id)
  }, [locked])

  function hit() {
    if (locked) return
    setLocked(true)
    const sweet = 72
    const accuracy = 1 - Math.min(1, Math.abs(pos - sweet) / 72)
    window.setTimeout(() => onDone(resolveGolfSwing(accuracy)), 450)
  }

  return (
    <div className="mg-golf">
      <p>Para el medidor cerca de la zona dorada.</p>
      <div className="mg-golf__track">
        <i className="mg-golf__sweet" />
        <b className="mg-golf__needle" style={{ left: `${pos}%` }} />
      </div>
      <button type="button" className="btn btn--primary" disabled={locked} onClick={hit}>
        {locked ? '¡Swing!' : 'Pegar'}
      </button>
    </div>
  )
}

function DiveGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const cells = 9
  const [treasure] = useState(() => {
    const set = new Set<number>()
    while (set.size < 3) set.add(Math.floor(Math.random() * cells))
    return set
  })
  const [found, setFound] = useState<number[]>([])
  const foundRef = useRef<number[]>([])
  const [miss, setMiss] = useState(0)
  const [left, setLeft] = useState(12)
  const done = useRef(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id)
          if (!done.current) {
            done.current = true
            onDone(resolveDive(foundRef.current.length, 0))
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [onDone])

  function tap(i: number) {
    if (done.current || foundRef.current.includes(i) || left <= 0) return
    if (treasure.has(i)) {
      const next = [...foundRef.current, i]
      foundRef.current = next
      setFound(next)
      if (next.length >= 3) {
        done.current = true
        onDone(resolveDive(3, left / 12))
      }
    } else {
      setMiss((m) => m + 1)
    }
  }

  return (
    <div className="mg-dive">
      <p>
        Encuentra 3 tesoros · oxígeno {left}s · fallos {miss}
      </p>
      <div className="mg-dive__grid">
        {Array.from({ length: cells }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`mg-dive__cell ${found.includes(i) ? 'is-found' : ''}`}
            onClick={() => tap(i)}
          >
            {found.includes(i) ? '◆' : '~'}
          </button>
        ))}
      </div>
    </div>
  )
}

function PadelGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const total = 5
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const hitsRef = useRef(0)
  const [zone, setZone] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const inZone = useRef(false)
  const finished = useRef(false)
  const roundRef = useRef(0)

  useEffect(() => {
    if (finished.current || round >= total) return
    inZone.current = false
    setZone(false)
    setFlash(null)
    let endTimer = 0
    const start = window.setTimeout(() => {
      inZone.current = true
      setZone(true)
      endTimer = window.setTimeout(() => {
        if (!inZone.current) return
        inZone.current = false
        setZone(false)
        setFlash('¡Red!')
        window.setTimeout(() => advance(false), 350)
      }, 650)
    }, 400 + Math.random() * 700)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(endTimer)
    }
  }, [round])

  function advance(hit: boolean) {
    if (finished.current) return
    const nextHits = hitsRef.current + (hit ? 1 : 0)
    hitsRef.current = nextHits
    setHits(nextHits)
    const nextRound = roundRef.current + 1
    roundRef.current = nextRound
    if (nextRound >= total) {
      finished.current = true
      onDone(resolvePadel(nextHits))
      return
    }
    setRound(nextRound)
  }

  function swing() {
    if (finished.current) return
    if (inZone.current) {
      setFlash('¡Bien!')
      inZone.current = false
      setZone(false)
      window.setTimeout(() => advance(true), 280)
    } else {
      setFlash('Temprano')
      window.setTimeout(() => advance(false), 280)
    }
  }

  return (
    <div className="mg-padel">
      <p>
        Golpe {Math.min(round + 1, total)}/{total} · aciertos {hits}
      </p>
      <div className={`mg-padel__court ${zone ? 'is-hot' : ''}`}>
        <span>{flash ?? (zone ? '¡YA!' : 'Espera…')}</span>
      </div>
      <button type="button" className="btn btn--primary" onClick={swing} disabled={finished.current}>
        Pegar
      </button>
    </div>
  )
}

function TriviaGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)

  function answer(option: number) {
    const q = CINE_TRIVIA[idx]
    const nextCorrect = correct + (option === q.correct ? 1 : 0)
    if (idx + 1 >= CINE_TRIVIA.length) {
      onDone(resolveTrivia(nextCorrect))
      return
    }
    setCorrect(nextCorrect)
    setIdx(idx + 1)
  }

  const q = CINE_TRIVIA[idx]
  return (
    <div className="mg-trivia">
      <p className="mg-trivia__q">
        {idx + 1}/{CINE_TRIVIA.length}. {q.q}
      </p>
      <div className="client-action-list">
        {q.options.map((opt, i) => (
          <button key={opt} type="button" className="client-action" onClick={() => answer(i)}>
            <strong>{opt}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

const SLOT_SYM = ['◆', '●', '▲', '★', '◇']

function SlotsGame({ wallet, onDone }: { wallet: number; onDone: (o: MinigameOutcome) => void }) {
  const [reels, setReels] = useState([0, 1, 2])
  const [spinning, setSpinning] = useState(false)

  function spin() {
    if (spinning) return
    if (wallet < 15) {
      onDone(resolveSlots(0))
      return
    }
    setSpinning(true)
    const next = [0, 1, 2].map(() => Math.floor(Math.random() * SLOT_SYM.length))
    setReels(next)
    window.setTimeout(() => {
      const [a, b, c] = next
      const matches = a === b && b === c ? 3 : a === b || b === c || a === c ? 2 : 0
      onDone(resolveSlots(matches))
    }, 900)
  }

  return (
    <div className="mg-slots">
      <div className="mg-slots__reels">
        {reels.map((r, i) => (
          <span key={i}>{SLOT_SYM[r]}</span>
        ))}
      </div>
      <p className="muted">Fichas 15 € si no hay premio parcial.</p>
      <button type="button" className="btn btn--primary" disabled={spinning} onClick={spin}>
        {spinning ? 'Girando…' : 'Tirar'}
      </button>
    </div>
  )
}

function HeliGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const [inZone, setInZone] = useState(false)
  const [held, setHeld] = useState(0)
  const heldRef = useRef(0)
  const done = useRef(false)
  const holding = useRef(false)

  useEffect(() => {
    let t = 0
    const id = window.setInterval(() => {
      t += 1
      const ok = t % 5 < 3
      setInZone(ok)
      if (holding.current && ok) {
        heldRef.current += 1
        setHeld(heldRef.current)
      }
      if (t >= 20 && !done.current) {
        done.current = true
        onDone(resolveHeli(heldRef.current / 12))
      }
    }, 500)
    return () => window.clearInterval(id)
  }, [onDone])

  return (
    <div className="mg-heli">
      <p>Mantén pulsado cuando el horizonte esté estable ({held}/12).</p>
      <div className={`mg-heli__horizon ${inZone ? 'is-ok' : ''}`}>{inZone ? 'Estable' : 'Turbulencia'}</div>
      <button
        type="button"
        className="btn btn--primary"
        onMouseDown={() => {
          holding.current = true
        }}
        onMouseUp={() => {
          holding.current = false
        }}
        onMouseLeave={() => {
          holding.current = false
        }}
        onTouchStart={() => {
          holding.current = true
        }}
        onTouchEnd={() => {
          holding.current = false
        }}
      >
        Mantener rumbo
      </button>
    </div>
  )
}

function TeatroGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const [hits, setHits] = useState(0)
  const [round, setRound] = useState(0)
  const [hot, setHot] = useState(false)
  const hotRef = useRef(false)
  const hitsRef = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    if (finished.current || round >= 6) return
    hotRef.current = false
    setHot(false)
    const start = window.setTimeout(() => {
      hotRef.current = true
      setHot(true)
      const end = window.setTimeout(() => {
        hotRef.current = false
        setHot(false)
        setRound((r) => {
          const n = r + 1
          if (n >= 6 && !finished.current) {
            finished.current = true
            onDone(resolveTeatro(hitsRef.current))
          }
          return n
        })
      }, 700)
      return () => window.clearTimeout(end)
    }, 350 + Math.random() * 600)
    return () => window.clearTimeout(start)
  }, [round, onDone])

  function clap() {
    if (finished.current) return
    if (hotRef.current) {
      hitsRef.current += 1
      setHits(hitsRef.current)
      hotRef.current = false
      setHot(false)
    }
  }

  return (
    <div className="mg-teatro">
      <p>
        Aplausos {hits}/6 · ronda {Math.min(round + 1, 6)}/6
      </p>
      <div className={`mg-padel__court ${hot ? 'is-hot' : ''}`}>
        <span>{hot ? '¡APLAUDE!' : '…'}</span>
      </div>
      <button type="button" className="btn btn--primary" onClick={clap}>
        Aplaudir
      </button>
    </div>
  )
}

function KidsGame({ onDone }: { onDone: (o: MinigameOutcome) => void }) {
  const [toys] = useState(() => {
    const s = new Set<number>()
    while (s.size < 4) s.add(Math.floor(Math.random() * 12))
    return s
  })
  const [found, setFound] = useState<number[]>([])
  const done = useRef(false)

  function tap(i: number) {
    if (done.current || found.includes(i)) return
    if (!toys.has(i)) return
    const next = [...found, i]
    setFound(next)
    if (next.length >= 4) {
      done.current = true
      onDone(resolveKids(4))
    }
  }

  return (
    <div className="mg-kids">
      <p>Encuentra 4 juguetes ({found.length}/4).</p>
      <div className="mg-dive__grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`mg-dive__cell ${found.includes(i) ? 'is-found' : ''}`}
            onClick={() => tap(i)}
          >
            {found.includes(i) ? '★' : '?'}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="chip"
        onClick={() => {
          if (!done.current) {
            done.current = true
            onDone(resolveKids(found.length))
          }
        }}
      >
        Terminar
      </button>
    </div>
  )
}
