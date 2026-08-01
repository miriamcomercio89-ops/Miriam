import { useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { readCompressedFile } from '../lib/saveio'

const SAVE_KEYS = [
  'orbis-hotels-group-save-v7',
  'orbis-hotels-group-save-v6',
  'orbis-hotels-group-save-v5',
  'orbis-hotels-group-save-v4',
  'orbis-hotels-group-save-v3',
  'orbis-hotels-group-save-v2',
  'orbis-hotels-group-save-v1',
]

function hasLocalSave() {
  if (typeof localStorage === 'undefined') return false
  return SAVE_KEYS.some((k) => !!localStorage.getItem(k))
}

export function Landing() {
  const startGame = useGameStore((s) => s.startGame)
  const loadLocal = useGameStore((s) => s.loadLocal)
  const newGame = useGameStore((s) => s.newGame)
  const importSave = useGameStore((s) => s.importSave)
  const importState = useGameStore((s) => s.importState)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const hasSave = hasLocalSave()

  async function onImport(file: File | null) {
    if (!file) return
    try {
      if (file.name.endsWith('.gz') || file.name.endsWith('.orbis.gz')) {
        const state = await readCompressedFile(file)
        const res = importState(state)
        setMsg(res.ok ? null : res.error)
        if (res.ok) startGame()
      } else {
        const text = await file.text()
        const res = importSave(text)
        setMsg(res.ok ? null : res.error)
        if (res.ok) startGame()
      }
    } catch {
      setMsg('No se pudo importar el archivo')
    }
  }

  return (
    <div className="landing">
      <div className="landing__veil" />
      <div className="landing__content">
        <p className="landing__eyebrow">Juego de hoteles · v0.6</p>
        <h1 className="landing__brand">Orbis Hotels Group</h1>
        <p className="landing__lead">
          Construye hoteles en todo el mundo. 50 marcas. Muchos países.
          La IA pone precios y contratos. Tú decides dónde crecer.
        </p>
        <div className="landing__actions">
          <button type="button" className="btn btn--primary" onClick={() => newGame()}>
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
          <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
            Importar partida
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json,.gz,.orbis.gz,application/gzip"
            hidden
            onChange={(e) => void onImport(e.target.files?.[0] ?? null)}
          />
        </div>
        {msg && <p className="landing__lead" style={{ marginTop: '1rem' }}>{msg}</p>}
        <p className="landing__lead" style={{ marginTop: '1.2rem', fontSize: '0.9rem', opacity: 0.8 }}>
          No abras index.html a doble clic. Usa <code>npm run dev</code> o sirve la carpeta <code>dist/</code>.
          Guía: <code>abrir.html</code>
        </p>
      </div>
    </div>
  )
}
