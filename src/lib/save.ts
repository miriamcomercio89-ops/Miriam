import type { GameState } from '../types'

const DB = 'mesa-mundial'
const STORE = 'saves'
const KEY = 'slot-1'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveState(state: GameState): Promise<void> {
  const compact: GameState = {
    ...state,
    events: state.events.slice(0, 40),
    history: state.history.slice(-60),
  }
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(compact, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    try {
      localStorage.setItem('mesa-mundial-save', JSON.stringify(compact))
    } catch {
      /* quota */
    }
  }
}

export async function loadState(): Promise<GameState | null> {
  try {
    const db = await openDb()
    const data = await new Promise<GameState | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve((req.result as GameState) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    if (data?.version === 1) return data
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem('mesa-mundial-save')
    if (!raw) return null
    const data = JSON.parse(raw) as GameState
    return data.version === 1 ? data : null
  } catch {
    return null
  }
}

export function exportJson(state: GameState): void {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `mesa-mundial-dia-${state.day}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function parseImported(text: string): GameState | null {
  try {
    const data = JSON.parse(text) as GameState
    if (data?.version !== 1 || !Array.isArray(data.restaurants)) return null
    return data
  } catch {
    return null
  }
}
