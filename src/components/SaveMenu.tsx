import { useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { cloudCreate, cloudLoad, cloudSave } from '../lib/cloud'
import { downloadCompressedSave, readCompressedFile, SLOT_KEYS, slotLabel } from '../lib/saveio'

export function SaveMenu() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [slotInput, setSlotInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const persistLocal = useGameStore((s) => s.persistLocal)
  const exportSave = useGameStore((s) => s.exportSave)
  const importSave = useGameStore((s) => s.importSave)
  const importState = useGameStore((s) => s.importState)
  const getSnapshot = useGameStore((s) => s.getSnapshot)
  const hydrate = useGameStore((s) => s.hydrate)
  const cloudSlotId = useGameStore((s) => s.cloudSlotId)
  const setCloudSlot = useGameStore((s) => s.setCloudSlot)
  const gameName = useGameStore((s) => s.gameName)
  const setGameName = useGameStore((s) => s.setGameName)
  const saveToSlot = useGameStore((s) => s.saveToSlot)
  const loadFromSlot = useGameStore((s) => s.loadFromSlot)

  async function saveCloud() {
    try {
      const snap = getSnapshot()
      if (cloudSlotId) {
        await cloudSave(cloudSlotId, snap)
        setMsg(`Guardado en la nube · código ${cloudSlotId}`)
      } else {
        const id = await cloudCreate(snap)
        setCloudSlot(id)
        persistLocal()
        setMsg(`Nueva partida en nube · código ${id}`)
      }
    } catch {
      setMsg('No se pudo guardar en la nube')
    }
  }

  async function loadCloud() {
    const id = (slotInput || cloudSlotId || '').trim()
    if (!id) {
      setMsg('Escribe un código')
      return
    }
    try {
      const state = await cloudLoad(id)
      hydrate({ ...state, cloudSlotId: id, started: true })
      setCloudSlot(id)
      setMsg(`Partida ${id} cargada`)
    } catch {
      setMsg('Código no encontrado')
    }
  }

  function downloadJson() {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${gameName.replace(/\s+/g, '-').toLowerCase() || 'orbis'}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Archivo JSON listo')
  }

  function downloadGz() {
    downloadCompressedSave(getSnapshot(), `${gameName.replace(/\s+/g, '-').toLowerCase() || 'orbis'}.orbis.gz`)
    setMsg('Archivo comprimido listo (más ligero)')
  }

  async function onImportFile(file: File | null) {
    if (!file) return
    try {
      if (file.name.endsWith('.gz') || file.name.endsWith('.orbis.gz')) {
        const state = await readCompressedFile(file)
        const res = importState(state)
        setMsg(res.ok ? 'Partida importada' : res.error)
      } else {
        const text = await file.text()
        const res = importSave(text)
        setMsg(res.ok ? 'Partida importada' : res.error)
      }
    } catch {
      setMsg('No se pudo importar el archivo')
    }
  }

  return (
    <div className="save-menu">
      <button type="button" className="chip" onClick={() => setOpen((v) => !v)} title="Guardar y cargar">
        Guardar
      </button>
      {open && (
        <div className="save-popover">
          <label className="field">
            <span>Nombre de la partida</span>
            <input value={gameName} onChange={(e) => setGameName(e.target.value)} maxLength={40} />
          </label>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => {
              persistLocal()
              setMsg('Guardado en el navegador')
            }}
          >
            Guardar rápido
          </button>

          <p className="mini-title">Huecos 1 / 2 / 3</p>
          {[1, 2, 3].map((slot) => {
            const key = SLOT_KEYS[slot - 1]
            const has = typeof localStorage !== 'undefined' && !!localStorage.getItem(key)
            return (
              <div key={slot} className="slot-row">
                <span>{slotLabel(slot)}{has ? ' · ocupado' : ' · vacío'}</span>
                <button type="button" className="chip" onClick={() => { saveToSlot(slot as 1 | 2 | 3); setMsg(`Guardado en ${slotLabel(slot)}`) }}>
                  Guardar
                </button>
                <button
                  type="button"
                  className="chip"
                  disabled={!has}
                  onClick={() => setMsg(loadFromSlot(slot as 1 | 2 | 3) ? `Cargada ${slotLabel(slot)}` : 'Hueco vacío')}
                >
                  Cargar
                </button>
              </div>
            )
          })}

          <hr />
          <button type="button" className="btn btn--ghost btn--block" onClick={downloadGz}>
            Exportar comprimido
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={downloadJson}>
            Exportar JSON
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => fileRef.current?.click()}>
            Importar archivo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json,.gz,.orbis.gz,application/gzip"
            hidden
            onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
          />
          <hr />
          <button type="button" className="btn btn--ghost btn--block" onClick={() => void saveCloud()}>
            Nube {cloudSlotId ? `(${cloudSlotId})` : ''}
          </button>
          <div className="cloud-row">
            <input value={slotInput} onChange={(e) => setSlotInput(e.target.value)} placeholder="Código nube" />
            <button type="button" className="chip" onClick={() => void loadCloud()}>Cargar</button>
          </div>
          {msg && <p className="save-msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
