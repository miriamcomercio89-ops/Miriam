import type { Subsidiary } from '../types'

/** Guía de construcción por marca (UI + PDFs). */
export function brandBuildGuide(sub: Subsidiary): {
  idealSites: string[]
  typicalServices: string[]
  avoid: string[]
  buildTips: string[]
} {
  const idealSites: string[] = []
  const typicalServices: string[] = ['wifi_premium', 'restaurante']
  const avoid: string[] = []
  const buildTips: string[] = []

  if (sub.beachAffinity >= 0.85) {
    idealSites.push('Primera línea o score de playa ≥ 70')
    idealSites.push('Destinos vacacionales / costa')
    typicalServices.push('piscina', 'playa_privada', 'spa')
    avoid.push('Interiores urbanos sin afinidad costera')
    buildTips.push('Sube el % de vistas al mar si el solar lo permite.')
  } else if (sub.beachAffinity <= 0.3) {
    idealSites.push('Centros urbanos, hubs de negocios o montaña')
    typicalServices.push('coworking', 'gimnasio')
    avoid.push('Resorts de playa pura (poca sinergia de marca)')
  } else {
    idealSites.push('Ciudades costeras mixtas o destinos versátiles')
  }

  if (sub.targets.includes('negocios')) {
    idealSites.push('Cerca de aeropuertos, ferias o distritos financieros')
    typicalServices.push('coworking', 'room_service_24h', 'transfer_aeropuerto')
    buildTips.push('Salas de reuniones y tech moderna suben la demanda MICE.')
  }
  if (sub.targets.includes('familiar')) {
    typicalServices.push('kids_club', 'piscina', 'parking')
    buildTips.push('Parking amplio y régimen familiar mejoran ocupación.')
  }
  if (sub.targets.includes('wellness') || sub.imageStyle === 'luxury') {
    typicalServices.push('spa', 'sauna', 'yoga')
    buildTips.push('Calidad de edificio alta o lujo: coherente con la marca.')
  }
  if (sub.targets.includes('aventura')) {
    typicalServices.push('buceo', 'gimnasio')
    idealSites.push('Entornos naturales, islas o destinos activos')
  }
  if (sub.minStars >= 4) {
    avoid.push(`Construir por debajo de ${sub.minStars}★`)
    buildTips.push(`Mantén ${sub.minStars}–${sub.maxStars} estrellas.`)
  }
  if (sub.costMultiplier >= 1.3) {
    avoid.push('Presupuestos low-cost: la marca se devalúa')
    buildTips.push('Marca premium: asume obra cara y personal alto.')
  }
  if (sub.costMultiplier <= 0.95) {
    buildTips.push('Buena para volumen: muchos hoteles medianos.')
  }
  if (sub.id === 'airport-gate') {
    idealSites.push('Entorno aeroportuario / zonas de escala')
    avoid.push('Resorts de playa alejados de hubs')
  }

  buildTips.push(`Estrellas permitidas: ${sub.minStars}–${sub.maxStars}.`)
  buildTips.push('El precio por noche lo fija la IA tras abrir.')
  avoid.push('Ignorar la afinidad marca–solar del constructor')

  const uniq = (arr: string[]) => [...new Set(arr)]
  return {
    idealSites: uniq(idealSites),
    typicalServices: uniq(typicalServices),
    avoid: uniq(avoid),
    buildTips: uniq(buildTips),
  }
}

export function typicalServiceLabels(ids: string[], catalog: { id: string; label: string }[]): string {
  return ids.map((id) => catalog.find((c) => c.id === id)?.label ?? id).join(', ')
}
