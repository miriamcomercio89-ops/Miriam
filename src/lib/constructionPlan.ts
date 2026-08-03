/**
 * Plan de construcción en el juego (listas por zona).
 * Los PDF quedan fuera del simulador.
 */
export type PlanIndexItem = {
  order: number
  region: string
  country: string
  countryCode: string
  count: number
  orderStart: number
  orderEnd: number
}

export type PlanHotel = {
  order: number
  realHotel: string
  name: string
  city: string
  subsidiaryName: string
  stars: number
  rooms: number
  lat?: number
  lng?: number
  website?: string
  imageUrl?: string
}

export type PlanIndex = {
  totalHotels: number
  totalRegions: number
  totalCountries: number
  items: PlanIndexItem[]
}

let cachedIndex: PlanIndex | null = null

export async function loadPlanIndex(): Promise<PlanIndex | null> {
  if (cachedIndex) return cachedIndex
  try {
    const res = await fetch('./plan/index.json')
    if (!res.ok) return null
    cachedIndex = (await res.json()) as PlanIndex
    return cachedIndex
  } catch {
    return null
  }
}

export async function loadRegionHotels(order: number): Promise<PlanHotel[]> {
  const n = String(order).padStart(3, '0')
  try {
    const res = await fetch(`./plan/regions/${n}.json`)
    if (!res.ok) return []
    const data = (await res.json()) as { hotels?: PlanHotel[] }
    return data.hotels ?? []
  } catch {
    return []
  }
}
