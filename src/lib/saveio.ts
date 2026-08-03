import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'
import type { GameState, Hotel } from '../types'

const IDB_NAME = 'orbis-hotels-db'
const IDB_VERSION = 2
const IDB_STORE = 'saves'
const IDB_IMAGES = 'hotel-images'
export const IDB_MAIN_KEY = 'main'

/** Quita fotos del JSON liviano (localStorage). Las fotos viven en IndexedDB. */
export function compactState(state: GameState): GameState {
  const hotels = state.hotels.map((h) => {
    if (!h.imageDataUrl || h.imageDataUrl.length < 800) return h
    const { imageDataUrl: _drop, ...rest } = h
    return rest as Hotel
  })
  return { ...state, hotels }
}

/** Estado completo con fotos (para export / IDB meta+images). */
export function fullState(state: GameState): GameState {
  return state
}

export function compressSave(state: GameState, keepImages = true): Uint8Array {
  const payload = keepImages ? state : compactState(state)
  const json = JSON.stringify(payload)
  return gzipSync(strToU8(json), { level: 6 })
}

export function decompressSave(bytes: Uint8Array): GameState {
  const json = strFromU8(gunzipSync(bytes))
  return JSON.parse(json) as GameState
}

export function downloadCompressedSave(state: GameState, filename: string) {
  // Export incluye fotos de hoteles
  const bytes = compressSave(state, true)
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
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
      if (!db.objectStoreNames.contains(IDB_IMAGES)) db.createObjectStore(IDB_IMAGES)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function imagesKey(saveKey: string) {
  return `${saveKey}::images`
}

/** Guarda mapa hotelId → dataURL de foto. */
export async function idbSaveHotelImages(
  hotels: Hotel[],
  saveKey = IDB_MAIN_KEY,
): Promise<number> {
  const db = await openDb()
  const map: Record<string, string> = {}
  let n = 0
  for (const h of hotels) {
    if (h.imageDataUrl && h.imageDataUrl.length > 32 && !h.imageDataUrl.includes('image/svg+xml')) {
      map[h.id] = h.imageDataUrl
      n++
    }
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_IMAGES, 'readwrite')
    tx.objectStore(IDB_IMAGES).put(map, imagesKey(saveKey))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  return n
}

export async function idbLoadHotelImages(saveKey = IDB_MAIN_KEY): Promise<Record<string, string>> {
  try {
    const db = await openDb()
    const result = await new Promise<Record<string, string> | null>((resolve, reject) => {
      const tx = db.transaction(IDB_IMAGES, 'readonly')
      const req = tx.objectStore(IDB_IMAGES).get(imagesKey(saveKey))
      req.onsuccess = () => resolve((req.result as Record<string, string>) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result ?? {}
  } catch {
    return {}
  }
}

export function mergeHotelImages(state: GameState, images: Record<string, string>): GameState {
  if (!images || !Object.keys(images).length) return state
  return {
    ...state,
    hotels: state.hotels.map((h) => {
      const img = images[h.id]
      if (!img) return h
      return { ...h, imageDataUrl: img }
    }),
  }
}

/** Guardado grande en IndexedDB: meta + fotos de hoteles. */
export async function idbSave(state: GameState, key = IDB_MAIN_KEY): Promise<void> {
  const db = await openDb()
  // Meta sin fotos en el blob principal (más estable); fotos en store aparte
  const meta = compactState(state)
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([IDB_STORE, IDB_IMAGES], 'readwrite')
    tx.objectStore(IDB_STORE).put(meta, key)
    const map: Record<string, string> = {}
    for (const h of state.hotels) {
      if (h.imageDataUrl && h.imageDataUrl.length > 32 && !h.imageDataUrl.includes('image/svg+xml')) {
        map[h.id] = h.imageDataUrl
      }
    }
    tx.objectStore(IDB_IMAGES).put(map, imagesKey(key))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function idbLoad(key = IDB_MAIN_KEY): Promise<GameState | null> {
  try {
    const db = await openDb()
    const meta = await new Promise<GameState | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve((req.result as GameState) ?? null)
      req.onerror = () => reject(req.error)
    })
    if (!meta) {
      db.close()
      return null
    }
    const images = await new Promise<Record<string, string>>((resolve, reject) => {
      const tx = db.transaction(IDB_IMAGES, 'readonly')
      const req = tx.objectStore(IDB_IMAGES).get(imagesKey(key))
      req.onsuccess = () => resolve((req.result as Record<string, string>) ?? {})
      req.onerror = () => reject(req.error)
    })
    db.close()
    return mergeHotelImages(meta, images)
  } catch {
    return null
  }
}

export async function idbHasSave(key = IDB_MAIN_KEY): Promise<boolean> {
  const state = await idbLoad(key)
  return !!(state && typeof state.cash === 'number' && Array.isArray(state.hotels))
}

export function tryLocalStorageSave(key: string, state: GameState): boolean {
  // localStorage siempre sin fotos (cuota); IndexedDB lleva las fotos
  const compact = compactState(state)
  try {
    localStorage.setItem(key, JSON.stringify(compact))
    return true
  } catch {
    try {
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

export function readLocalStorageSave(keys: string[]): GameState | null {
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      return JSON.parse(raw) as GameState
    } catch {
      /* next */
    }
  }
  return null
}

/** Comprime foto de hotel a JPEG razonable para miles de partidas. */
export async function compressHotelPhoto(dataUrl: string, maxSide = 1280, quality = 0.82): Promise<string> {
  if (!dataUrl || dataUrl.includes('image/svg')) return dataUrl
  return new Promise((resolve) => {
    const img = new Image()
    const done = (v: string) => {
      window.clearTimeout(timer)
      resolve(v)
    }
    const timer = window.setTimeout(() => done(dataUrl), 10000)
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          done(dataUrl)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        done(canvas.toDataURL('image/jpeg', quality))
      } catch {
        done(dataUrl)
      }
    }
    img.onerror = () => done(dataUrl)
    img.src = dataUrl
  })
}
