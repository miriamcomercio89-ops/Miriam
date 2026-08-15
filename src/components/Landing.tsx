import { useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { parseImported } from '../lib/save'

export function Landing() {
  const startNew = useGameStore((s) => s.startNew)
  const continueSave = useGameStore((s) => s.continueSave)
  const importSave = useGameStore((s) => s.importSave)
  const hasSave = useGameStore((s) => s.hasSave)
  const nameRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const company = () => nameRef.current?.value.trim() || 'Grupo Paladar'

  return (
    <div className="landing">
      <div className="landing-card">
        <p className="muted">OpenStreetMap · Overpass · Nominatim</p>
        <h1>Mesa Mundial</h1>
        <p>
          Funda miles de restaurantes sobre el mapa real del mundo. Busca calles, adquiere locales
          OSM, clona marcas en 110 ciudades y deja que la red crezca sola.
        </p>
        <label className="muted" htmlFor="co">
          Nombre del grupo
        </label>
        <input id="co" ref={nameRef} className="field" defaultValue="Grupo Paladar" style={{ marginTop: 6 }} />
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => startNew(company())}>
            Nueva partida en Álora
          </button>
          <button type="button" className="btn" disabled={!hasSave} onClick={() => void continueSave()}>
            Continuar
          </button>
          <button type="button" className="btn" onClick={() => startNew(company(), true)}>
            Demo 1.000 locales
          </button>
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
            Importar JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              const data = parseImported(text)
              if (data) importSave(data)
            }}
          />
        </div>
        <p className="hint">
          Tiles y datos de © OpenStreetMap. La partida se guarda en este navegador (IndexedDB). Espacio
          pausa · F modo fundar · 1/2/3 velocidad.
        </p>
      </div>
    </div>
  )
}
