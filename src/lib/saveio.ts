import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate'
import type { GameState, Hotel } from '../types'

const IDB_NAME = 'orbis-hotels-db'
const IDB_STORE = 'saves'
const IDB_KEY = 'main'

/** Quita fotos pesadas para partidas enormes (se regeneran por imageKey). */
export function compactState(state: GameState): GameState {
  const hotels = state.hotels.map((h) => {
    if (!h.imageDataUrl || h.imageDataUrl.length < 800) return h
    const { imageDataUrl: _drop, ...rest } = h
    return rest as Hotel
  })
  return { ...state, hotels }
}

export function compressSave(state: GameState): Uint8Array {
  const json = JSON.stringify(compactState(state))
  return gzipSync(strToU8(json), { level: 6 })
}

export function decompressSave(bytes: Uint8Array): GameState {
  const json = strFromU8(gunzipSync(bytes))
  return JSON.parse(json) as GameState
}

export function downloadCompressedSave(state: GameState, filename: string) {
  const bytes = compressSave(state)
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: 'application/gzip',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.orbis.gz') ? filename : `${filename}.orbis.gz`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readCompressedFile(file: File): Promise<GameState> {
  const buf = new Uint8Array(await file.arrayBuffer())
  if (file.name.endsWith('.gz') || file.name.endsWith('.orbis.gz') || (buf[0] === 0x1f && buf[1] === 0x8b)) {
    return decompressSave(buf)
  }
  return JSON.parse(new TextDecoder().decode(buf)) as GameState
}

export const SLOT_KEYS = ['orbis-slot-1', 'orbis-slot-2', 'orbis-slot-3'] as const

export function slotLabel(i: number): string {
  return `Partida ${i}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Guardado grande en IndexedDB (mejor para miles de hoteles). */
export async function idbSave(state: GameState, key = IDB_KEY): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(compactState(state), key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function idbLoad(key = IDB_KEY): Promise<GameState | null> {
  const db = await openDb()
  const result = await new Promise<GameState | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(key)
    req.onsuccess = () => resolve((req.result as GameState) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return result
}

export function tryLocalStorageSave(key: string, state: GameState): boolean {
  const compact = compactState(state)
  try {
    localStorage.setItem(key, JSON.stringify(compact))
    return true
  } catch {
    try {
      // Último intento: sin ledger largo ni noticias
      const slim = {
        ...compact,
        ledger: compact.ledger.slice(-14),
        news: compact.news.slice(0, 12),
      }
      localStorage.setItem(key, JSON.stringify(slim))
      return true
    } catch {
      return false
    }
  }
}
