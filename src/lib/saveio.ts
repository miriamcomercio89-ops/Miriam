import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate'
import type { GameState } from '../types'

export function compressSave(state: GameState): Uint8Array {
  const json = JSON.stringify(state)
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
  // Accept gzip or raw json
  if (file.name.endsWith('.gz') || file.name.endsWith('.orbis.gz') || (buf[0] === 0x1f && buf[1] === 0x8b)) {
    return decompressSave(buf)
  }
  return JSON.parse(new TextDecoder().decode(buf)) as GameState
}

export const SLOT_KEYS = ['orbis-slot-1', 'orbis-slot-2', 'orbis-slot-3'] as const

export function slotLabel(i: number): string {
  return `Partida ${i}`
}
