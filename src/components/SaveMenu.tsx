import { useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { cloudCreate, cloudLoad, cloudSave } from '../lib/cloud'

export function SaveMenu() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [slotInput, setSlotInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const persistLocal = useGameStore((s) => s.persistLocal)
  const exportSave = useGameStore((s) => s.exportSave)
  const importSave = useGameStore((s) => s.importSave)
  const getSnapshot = useGameStore((s) => s.getSnapshot)
  const hydrate = useGameStore((s) => s.hydrate)
  const cloudSlotId = useGameStore((s) => s.cloudSlotId)
  const setCloudSlot = useGameStore((s) => s.setCloudSlot)

  async function saveCloud() {
    try {
      const snap = getSnapshot()
      if (cloudSlotId) {
        await cloudSave(cloudSlotId, snap)
        setMsg(`Nube actualizada · código ${cloudSlotId}`)
      } else {
        const id = await cloudCreate(snap)
        setCloudSlot(id)
        persistLocal()
        setMsg(`Nueva partida en nube · código ${id}`)
      }
    } catch {
      setMsg('No se pudo guardar en la nube (¿API activa?)')
    }
  }

  async function loadCloud() {
    const id = (slotInput || cloudSlotId || '').trim()
    if (!id) {
      setMsg('Indica un código de partida')
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

  function downloadFile() {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orbis-hotels-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Archivo exportado')
  }

  function onImportFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = importSave(String(reader.result))
      setMsg(res.ok ? 'Partida importada' : res.error)
    }
    reader.readAsText(file)
  }

  return (
    <div className="save-menu">
      <button type="button" className="chip" onClick={() => setOpen((v) => !v)}>
        Guardar
      </button>
      {open && (
        <div className="save-popover">
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => {
              persistLocal()
              setMsg('Guardado en el navegador')
            }}
          >
            Guardar en navegador
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={downloadFile}>
            Exportar archivo JSON
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => fileRef.current?.click()}
          >
            Importar archivo JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
          />
          <hr />
          <button type="button" className="btn btn--ghost btn--block" onClick={saveCloud}>
            Guardar en nube {cloudSlotId ? `(${cloudSlotId})` : ''}
          </button>
          <div className="cloud-row">
            <input
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              placeholder="Código nube"
            />
            <button type="button" className="chip" onClick={loadCloud}>
              Cargar
            </button>
          </div>
          {msg && <p className="save-msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
