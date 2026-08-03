import type { Hotel, MapFilters, MapFocus, MapLayer, MapMode, PersistedUi, RankMetric } from '../types'

export function defaultPersistedUi(): PersistedUi {
  return {
    mapLayer: 'streets',
    mapMode: 'inspect',
    mapFilters: {
      subsidiaryId: 'all',
      minStars: 1,
      profit: 'all',
      countryCode: 'all',
      insured: 'all',
      vipRecent: false,
      lowCondition: false,
      clientStayFilter: 'all',
    },
    mapFocus: null,
    selectedHotelId: null,
    rankMetric: 'net',
    lastSimMs: 0,
    lastSimHotels: 0,
  }
}

export function migratePersistedUi(raw: Partial<PersistedUi> | undefined): PersistedUi {
  const base = defaultPersistedUi()
  if (!raw) return base
  const filters: MapFilters = {
    ...base.mapFilters,
    ...(raw.mapFilters ?? {}),
    clientStayFilter: raw.mapFilters?.clientStayFilter ?? 'all',
  }
  return {
    mapLayer: (raw.mapLayer as MapLayer) ?? base.mapLayer,
    mapMode: (raw.mapMode as MapMode) ?? base.mapMode,
    mapFilters: filters,
    mapFocus: (raw.mapFocus as MapFocus | null) ?? null,
    selectedHotelId: raw.selectedHotelId ?? null,
    rankMetric: (raw.rankMetric as RankMetric) ?? 'net',
    lastSimMs: typeof raw.lastSimMs === 'number' ? raw.lastSimMs : 0,
    lastSimHotels: typeof raw.lastSimHotels === 'number' ? raw.lastSimHotels : 0,
  }
}

/**
 * Presión suave de cartera: muchos hoteles en el mismo país
 * se restan un poco de ocupación (evita dinero infinito temprano
 * y la “muerte” por no microgestionar cada uno).
 */
export function portfolioOccupancyPressure(hotels: Hotel[], hotel: Hotel): number {
  let sameCountry = 0
  let sameBrand = 0
  const n = hotels.length
  for (let i = 0; i < n; i++) {
    const h = hotels[i]
    if (h.id === hotel.id || h.closed) continue
    if (h.countryCode === hotel.countryCode) sameCountry++
    if (h.subsidiaryId === hotel.subsidiaryId) sameBrand++
  }
  // Suave: máx −12% país, −5% misma marca
  const countryHit = Math.min(0.12, sameCountry * 0.01)
  const brandHit = Math.min(0.05, sameBrand * 0.008)
  // Con pocos hoteles, ligero empujón (curva de aprendizaje)
  const earlyBoost = n <= 3 ? 1.03 : n <= 8 ? 1.015 : 1
  return earlyBoost * (1 - countryHit - brandHit)
}

/** Coste operativo extra muy suave con cartera grande (escala). */
export function portfolioCostPressure(hotelCount: number): number {
  if (hotelCount <= 10) return 1
  if (hotelCount <= 40) return 1 + (hotelCount - 10) * 0.002
  if (hotelCount <= 200) return 1.06 + (hotelCount - 40) * 0.0008
  return Math.min(1.22, 1.188 + (hotelCount - 200) * 0.00015)
}
