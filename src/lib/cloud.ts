import type { GameState } from '../types'

const API = '/api/saves'

export async function cloudSave(slotId: string, state: GameState): Promise<void> {
  const res = await fetch(`${API}/${encodeURIComponent(slotId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error('Error al guardar en la nube')
}

export async function cloudLoad(slotId: string): Promise<GameState> {
  const res = await fetch(`${API}/${encodeURIComponent(slotId)}`)
  if (!res.ok) throw new Error('Partida en la nube no encontrada')
  return res.json()
}

export async function cloudCreate(state: GameState): Promise<string> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error('No se pudo crear hueco en la nube')
  const data = await res.json()
  return data.id as string
}
