import type {
  HotelService,
  StaffLevel,
  GuestTarget,
  RoomMix,
  BuildQuality,
  GreenLevel,
} from '../types'

export const SERVICE_CATALOG: {
  id: HotelService
  label: string
  group: string
  cost: number
  demandBonus: number
  dailyCost: number
}[] = [
  { id: 'wifi_premium', label: 'WiFi rápido', group: 'Básico', cost: 40_000, demandBonus: 0.01, dailyCost: 80 },
  { id: 'parking', label: 'Aparcamiento', group: 'Básico', cost: 180_000, demandBonus: 0.01, dailyCost: 200 },
  { id: 'lavanderia', label: 'Lavandería', group: 'Básico', cost: 70_000, demandBonus: 0.005, dailyCost: 180 },
  { id: 'restaurante', label: 'Restaurante', group: 'Comida', cost: 650_000, demandBonus: 0.035, dailyCost: 1_800 },
  { id: 'bar_azotea', label: 'Bar en la azotea', group: 'Comida', cost: 380_000, demandBonus: 0.025, dailyCost: 750 },
  { id: 'all_inclusive', label: 'Todo incluido', group: 'Comida', cost: 1_200_000, demandBonus: 0.06, dailyCost: 4_500 },
  { id: 'piscina', label: 'Piscina', group: 'Ocio', cost: 420_000, demandBonus: 0.03, dailyCost: 600 },
  { id: 'spa', label: 'Spa', group: 'Ocio', cost: 850_000, demandBonus: 0.04, dailyCost: 1_200 },
  { id: 'sauna', label: 'Sauna', group: 'Ocio', cost: 210_000, demandBonus: 0.015, dailyCost: 280 },
  { id: 'gimnasio', label: 'Gimnasio', group: 'Ocio', cost: 280_000, demandBonus: 0.015, dailyCost: 350 },
  { id: 'yoga', label: 'Zona de yoga', group: 'Ocio', cost: 160_000, demandBonus: 0.02, dailyCost: 220 },
  { id: 'kids_club', label: 'Club infantil', group: 'Familia', cost: 320_000, demandBonus: 0.025, dailyCost: 700 },
  { id: 'mascotas', label: 'Admite mascotas', group: 'Familia', cost: 90_000, demandBonus: 0.015, dailyCost: 160 },
  { id: 'playa_privada', label: 'Playa privada', group: 'Playa', cost: 1_500_000, demandBonus: 0.07, dailyCost: 2_200 },
  { id: 'buceo', label: 'Centro de buceo', group: 'Playa', cost: 480_000, demandBonus: 0.03, dailyCost: 900 },
  { id: 'golf', label: 'Campo de golf', group: 'Lujo', cost: 2_200_000, demandBonus: 0.045, dailyCost: 3_000 },
  { id: 'casino', label: 'Casino', group: 'Lujo', cost: 3_500_000, demandBonus: 0.05, dailyCost: 5_500 },
  { id: 'helipuerto', label: 'Helipuerto', group: 'Lujo', cost: 2_800_000, demandBonus: 0.02, dailyCost: 1_500 },
  { id: 'boda', label: 'Salón de bodas', group: 'Eventos', cost: 520_000, demandBonus: 0.02, dailyCost: 400 },
  { id: 'teatro', label: 'Sala de espectáculos', group: 'Eventos', cost: 780_000, demandBonus: 0.025, dailyCost: 900 },
  { id: 'coworking', label: 'Zona de trabajo', group: 'Negocios', cost: 220_000, demandBonus: 0.015, dailyCost: 250 },
  { id: 'room_service_24h', label: 'Comida a la habitación 24h', group: 'Servicio', cost: 150_000, demandBonus: 0.02, dailyCost: 900 },
  { id: 'concierge', label: 'Conserjería', group: 'Servicio', cost: 90_000, demandBonus: 0.015, dailyCost: 400 },
  { id: 'transfer_aeropuerto', label: 'Traslado al aeropuerto', group: 'Servicio', cost: 120_000, demandBonus: 0.02, dailyCost: 500 },
  { id: 'tienda', label: 'Tienda del hotel', group: 'Extra', cost: 140_000, demandBonus: 0.01, dailyCost: 220 },
  { id: 'biblioteca', label: 'Biblioteca / sala tranquila', group: 'Extra', cost: 95_000, demandBonus: 0.01, dailyCost: 90 },
  { id: 'medico', label: 'Puesto médico', group: 'Extra', cost: 260_000, demandBonus: 0.01, dailyCost: 450 },
  { id: 'ev_chargers', label: 'Carga de coches eléctricos', group: 'Verde', cost: 180_000, demandBonus: 0.012, dailyCost: 120 },
  { id: 'cine', label: 'Sala de cine', group: 'Ocio', cost: 420_000, demandBonus: 0.02, dailyCost: 350 },
  { id: 'jardines', label: 'Jardines grandes', group: 'Extra', cost: 260_000, demandBonus: 0.015, dailyCost: 200 },
  { id: 'mirador', label: 'Mirador', group: 'Extra', cost: 190_000, demandBonus: 0.018, dailyCost: 80 },
  { id: 'pista_padel', label: 'Pista de pádel', group: 'Ocio', cost: 310_000, demandBonus: 0.016, dailyCost: 220 },
  { id: 'guarderia_noche', label: 'Guardería nocturna', group: 'Familia', cost: 240_000, demandBonus: 0.02, dailyCost: 380 },
]

export const STAFF_OPTIONS: {
  id: StaffLevel
  label: string
  costMultiplier: number
  demandBonus: number
  dailyPerRoom: number
}[] = [
  { id: 'basico', label: 'Poco personal', costMultiplier: 0.9, demandBonus: -0.03, dailyPerRoom: 18 },
  { id: 'estandar', label: 'Personal normal', costMultiplier: 1, demandBonus: 0, dailyPerRoom: 28 },
  { id: 'premium', label: 'Mucho personal', costMultiplier: 1.2, demandBonus: 0.04, dailyPerRoom: 45 },
  { id: 'lujo', label: 'Servicio de lujo', costMultiplier: 1.45, demandBonus: 0.08, dailyPerRoom: 72 },
]

export const TARGET_OPTIONS: { id: GuestTarget; label: string }[] = [
  { id: 'lujo', label: 'Clientes de lujo' },
  { id: 'negocios', label: 'Viajes de trabajo' },
  { id: 'familiar', label: 'Familias' },
  { id: 'parejas', label: 'Parejas' },
  { id: 'aventura', label: 'Aventura' },
  { id: 'wellness', label: 'Descanso y spa' },
  { id: 'playa', label: 'Vacaciones de playa' },
]

export const ROOM_MIX_OPTIONS: { id: RoomMix; label: string; costMult: number; demandBonus: number }[] = [
  { id: 'estandar', label: 'Habitaciones normales', costMult: 1, demandBonus: 0 },
  { id: 'mixto', label: 'Mezcla (normal + suites)', costMult: 1.12, demandBonus: 0.02 },
  { id: 'suites', label: 'Casi todo suites', costMult: 1.35, demandBonus: 0.04 },
  { id: 'familiar', label: 'Pensado para familias', costMult: 1.08, demandBonus: 0.025 },
]

export const QUALITY_OPTIONS: { id: BuildQuality; label: string; costMult: number; demandBonus: number }[] = [
  { id: 'simple', label: 'Acabados simples', costMult: 0.85, demandBonus: -0.02 },
  { id: 'bueno', label: 'Acabados buenos', costMult: 1, demandBonus: 0 },
  { id: 'alto', label: 'Acabados altos', costMult: 1.22, demandBonus: 0.035 },
  { id: 'lujo', label: 'Acabados de lujo', costMult: 1.5, demandBonus: 0.06 },
]

export const GREEN_OPTIONS: { id: GreenLevel; label: string; costMult: number; demandBonus: number; costSave: number }[] = [
  { id: 'ninguno', label: 'Sin plan verde', costMult: 1, demandBonus: 0, costSave: 0 },
  { id: 'basico', label: 'Plan verde básico', costMult: 1.06, demandBonus: 0.015, costSave: 0.03 },
  { id: 'avanzado', label: 'Plan verde fuerte', costMult: 1.14, demandBonus: 0.03, costSave: 0.06 },
  { id: 'elite', label: 'Hotel eco elite', costMult: 1.25, demandBonus: 0.045, costSave: 0.1 },
]

export const DESIGN_FOCUS = [
  { id: 'vistas' as const, label: 'Buenas vistas' },
  { id: 'silencio' as const, label: 'Mucho silencio' },
  { id: 'fiesta' as const, label: 'Ambiente de fiesta' },
  { id: 'trabajo' as const, label: 'Pensado para trabajar' },
  { id: 'familia' as const, label: 'Pensado para familias' },
]

export const SECURITY_OPTIONS = [
  { id: 'bajo' as const, label: 'Seguridad baja', costMult: 0.97, demandBonus: -0.01, daily: 0.4 },
  { id: 'medio' as const, label: 'Seguridad media', costMult: 1, demandBonus: 0.01, daily: 0.9 },
  { id: 'alto' as const, label: 'Seguridad alta', costMult: 1.08, demandBonus: 0.025, daily: 1.8 },
]

export const TECH_OPTIONS = [
  { id: 'basico' as const, label: 'Tecnología simple', costMult: 0.95, demandBonus: -0.01 },
  { id: 'moderno' as const, label: 'Tecnología moderna', costMult: 1.05, demandBonus: 0.02 },
  { id: 'futuro' as const, label: 'Tecnología punta', costMult: 1.15, demandBonus: 0.035 },
]

export const BOARD_REGIMES = [
  { id: 'solo' as const, label: 'Solo alojamiento', costMult: 1, demandBonus: 0, dailyPerRoom: 0, priceMult: 1 },
  { id: 'desayuno' as const, label: 'Alojamiento y desayuno', costMult: 1.04, demandBonus: 0.02, dailyPerRoom: 3.5, priceMult: 1.06 },
  { id: 'media' as const, label: 'Media pensión', costMult: 1.1, demandBonus: 0.035, dailyPerRoom: 9, priceMult: 1.14 },
  { id: 'completa' as const, label: 'Pensión completa', costMult: 1.18, demandBonus: 0.05, dailyPerRoom: 16, priceMult: 1.22 },
  { id: 'ti' as const, label: 'Todo incluido', costMult: 1.28, demandBonus: 0.07, dailyPerRoom: 28, priceMult: 1.32 },
  { id: 'ti_premium' as const, label: 'Todo incluido premium', costMult: 1.4, demandBonus: 0.09, dailyPerRoom: 38, priceMult: 1.42 },
  { id: 'ti_gold' as const, label: 'Todo incluido gold', costMult: 1.55, demandBonus: 0.11, dailyPerRoom: 52, priceMult: 1.55 },
  { id: 'ti_imperial' as const, label: 'Todo incluido imperial', costMult: 1.75, demandBonus: 0.14, dailyPerRoom: 72, priceMult: 1.72 },
]

/** Club Orbis · 10 niveles (puntos = huéspedes de por vida del grupo) */
export const LOYALTY_TIERS = [
  { level: 1 as const, name: 'Visitante', points: 0, demandBonus: 0, label: 'Nivel 1 · Visitante' },
  { level: 2 as const, name: 'Huésped', points: 800, demandBonus: 0.01, label: 'Nivel 2 · Huésped' },
  { level: 3 as const, name: 'Amigo Orbis', points: 3_000, demandBonus: 0.018, label: 'Nivel 3 · Amigo Orbis' },
  { level: 4 as const, name: 'Viajero', points: 10_000, demandBonus: 0.025, label: 'Nivel 4 · Viajero' },
  { level: 5 as const, name: 'Explorador', points: 30_000, demandBonus: 0.032, label: 'Nivel 5 · Explorador' },
  { level: 6 as const, name: 'Embajador', points: 80_000, demandBonus: 0.04, label: 'Nivel 6 · Embajador' },
  { level: 7 as const, name: 'Élite', points: 200_000, demandBonus: 0.048, label: 'Nivel 7 · Élite' },
  { level: 8 as const, name: 'Platino', points: 500_000, demandBonus: 0.055, label: 'Nivel 8 · Platino' },
  { level: 9 as const, name: 'Diamante', points: 1_200_000, demandBonus: 0.065, label: 'Nivel 9 · Diamante' },
  { level: 10 as const, name: 'Imperial', points: 3_000_000, demandBonus: 0.08, label: 'Nivel 10 · Imperial' },
]

export const STARTING_CASH = 750_000_000
export const REAL_MS_PER_GAME_MINUTE = 1000
