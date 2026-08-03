import { useEffect, useRef, useState } from 'react'
import { useGameStore, STORAGE_KEY, LEGACY_STORAGE_KEYS } from '../store/gameStore'
import { idbHasSave, readCompressedFile } from '../lib/saveio'
import { GAME_START_LABEL } from '../lib/format'

const SAVE_KEYS = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]

function hasLocalStorageSave() {
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
  const [hasSave, setHasSave] = useState(hasLocalStorageSave())
  const [loadingContinue, setLoadingContinue] = useState(false)

  useEffect(() => {
    if (hasLocalStorageSave()) {
      setHasSave(true)
      return
    }
    void idbHasSave().then((ok) => setHasSave(ok))
  }, [])

  async function onContinue() {
    setLoadingContinue(true)
    setMsg(null)
    try {
      const ok = await loadLocal()
      if (!ok) {
        setMsg('No se encontró una partida guardada.')
        setHasSave(false)
        return
      }
      // Dar un frame tras hidratar (aún en landing) antes de montar el mapa
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })
      startGame()
    } catch {
      setMsg('No se pudo cargar la partida.')
    } finally {
      setLoadingContinue(false)
    }
  }

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
        <p className="landing__eyebrow">Juego de hoteles · v2.2.5</p>
        <h1 className="landing__brand">Orbis Hotels Group</h1>
        <p className="landing__lead">
          Construye hoteles en todo el mundo. 50 marcas. Muchos países.
          Equilibrio de cartera, club huésped unificado y guardado compatible.
          La partida empieza el {GAME_START_LABEL}.
        </p>
        <div className="landing__actions">
          <button type="button" className="btn btn--primary" onClick={() => newGame()}>
            Nueva partida
          </button>
          {hasSave && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={loadingContinue}
              onClick={() => void onContinue()}
            >
              {loadingContinue ? 'Cargando…' : 'Continuar partida'}
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
        {msg && <p className="landing__lead landing__msg">{msg}</p>}
        <p className="landing__keys">
          Atajos en partida: H hoteles · P plan · B banco · M menú · Espacio pausa · Esc cerrar
        </p>
        <p className="landing__keys">
          <a href="./constructor-guia.pdf" target="_blank" rel="noreferrer">
            Guía del constructor (PDF)
          </a>
        </p>
      </div>
    </div>
  )
}
