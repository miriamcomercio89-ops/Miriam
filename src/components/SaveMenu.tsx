import { useEffect, useRef, useState } from 'react'
import { useGameStore, IDB_SLOT_KEYS } from '../store/gameStore'
import { downloadCompressedSave, idbHasSave, readCompressedFile, SLOT_KEYS, slotLabel } from '../lib/saveio'

export function SaveMenu() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [slotOccupied, setSlotOccupied] = useState<[boolean, boolean, boolean]>([false, false, false])
  const fileRef = useRef<HTMLInputElement>(null)
  const persistLocal = useGameStore((s) => s.persistLocal)
  const exportSave = useGameStore((s) => s.exportSave)
  const importSave = useGameStore((s) => s.importSave)
  const importState = useGameStore((s) => s.importState)
  const getSnapshot = useGameStore((s) => s.getSnapshot)
  const gameName = useGameStore((s) => s.gameName)
  const setGameName = useGameStore((s) => s.setGameName)
  const saveToSlot = useGameStore((s) => s.saveToSlot)
  const loadFromSlot = useGameStore((s) => s.loadFromSlot)

  async function refreshSlots() {
    const flags = await Promise.all(
      ([1, 2, 3] as const).map(async (slot) => {
        const key = SLOT_KEYS[slot - 1]
        if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) return true
        return idbHasSave(IDB_SLOT_KEYS[slot - 1])
      }),
    )
    setSlotOccupied([flags[0], flags[1], flags[2]])
  }

  useEffect(() => {
    if (open) void refreshSlots()
  }, [open])

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

  async function onSaveSlot(slot: 1 | 2 | 3) {
    await saveToSlot(slot)
    setMsg(`Guardado en ${slotLabel(slot)}`)
    void refreshSlots()
  }

  async function onLoadSlot(slot: 1 | 2 | 3) {
    const ok = await loadFromSlot(slot)
    setMsg(ok ? `Cargada ${slotLabel(slot)}` : 'Hueco vacío')
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

          <p className="mini-title">Ranuras locales (navegador)</p>
          <p className="muted" style={{ fontSize: '0.75rem', margin: '0 0 0.5rem' }}>
            Las fotos de los hoteles se guardan en IndexedDB con la partida (también en el .orbis.gz).
          </p>
          {[1, 2, 3].map((slot) => {
            const has = slotOccupied[slot - 1]
            return (
              <div key={slot} className="slot-row">
                <span>
                  {slotLabel(slot)}
                  {has ? ' · ocupado' : ' · vacío'}
                </span>
                <button type="button" className="chip" onClick={() => void onSaveSlot(slot as 1 | 2 | 3)}>
                  Guardar
                </button>
                <button
                  type="button"
                  className="chip"
                  disabled={!has}
                  onClick={() => void onLoadSlot(slot as 1 | 2 | 3)}
                >
                  Cargar
                </button>
              </div>
            )
          })}

          <hr />
          <button type="button" className="btn btn--ghost btn--block" onClick={downloadGz}>
            Descargar partida (.orbis.gz)
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={downloadJson}>
            Descargar JSON
          </button>
          <button type="button" className="btn btn--ghost btn--block" onClick={() => fileRef.current?.click()}>
            Cargar partida desde archivo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json,.gz,.orbis.gz,application/gzip"
            hidden
            onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
          />
          {msg && <p className="save-msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}
