import type { HotelService, StaffLevel, GuestTarget } from '../types'

export const SERVICE_CATALOG: {
  id: HotelService
  label: string
  cost: number
  demandBonus: number
  dailyCost: number
}[] = [
  { id: 'spa', label: 'Spa', cost: 850_000, demandBonus: 0.04, dailyCost: 1_200 },
  { id: 'piscina', label: 'Piscina', cost: 420_000, demandBonus: 0.03, dailyCost: 600 },
  { id: 'restaurante', label: 'Restaurante', cost: 650_000, demandBonus: 0.035, dailyCost: 1_800 },
  { id: 'gimnasio', label: 'Gimnasio', cost: 280_000, demandBonus: 0.015, dailyCost: 350 },
  { id: 'parking', label: 'Parking', cost: 180_000, demandBonus: 0.01, dailyCost: 200 },
  { id: 'wifi_premium', label: 'WiFi premium', cost: 40_000, demandBonus: 0.01, dailyCost: 80 },
  { id: 'all_inclusive', label: 'Todo incluido', cost: 1_200_000, demandBonus: 0.06, dailyCost: 4_500 },
  { id: 'kids_club', label: 'Kids club', cost: 320_000, demandBonus: 0.025, dailyCost: 700 },
  { id: 'playa_privada', label: 'Playa privada', cost: 1_500_000, demandBonus: 0.07, dailyCost: 2_200 },
  { id: 'buceo', label: 'Centro de buceo', cost: 480_000, demandBonus: 0.03, dailyCost: 900 },
  { id: 'golf', label: 'Golf', cost: 2_200_000, demandBonus: 0.045, dailyCost: 3_000 },
  { id: 'casino', label: 'Casino', cost: 3_500_000, demandBonus: 0.05, dailyCost: 5_500 },
  { id: 'helipuerto', label: 'Helipuerto', cost: 2_800_000, demandBonus: 0.02, dailyCost: 1_500 },
  { id: 'coworking', label: 'Coworking', cost: 220_000, demandBonus: 0.015, dailyCost: 250 },
  { id: 'room_service_24h', label: 'Room service 24h', cost: 150_000, demandBonus: 0.02, dailyCost: 900 },
  { id: 'concierge', label: 'Concierge', cost: 90_000, demandBonus: 0.015, dailyCost: 400 },
  { id: 'lavanderia', label: 'Lavandería', cost: 70_000, demandBonus: 0.005, dailyCost: 180 },
  { id: 'transfer_aeropuerto', label: 'Transfer aeropuerto', cost: 120_000, demandBonus: 0.02, dailyCost: 500 },
  { id: 'bar_azotea', label: 'Bar en azotea', cost: 380_000, demandBonus: 0.025, dailyCost: 750 },
  { id: 'yoga', label: 'Yoga / wellness deck', cost: 160_000, demandBonus: 0.02, dailyCost: 220 },
]

export const STAFF_OPTIONS: {
  id: StaffLevel
  label: string
  costMultiplier: number
  demandBonus: number
  dailyPerRoom: number
}[] = [
  { id: 'basico', label: 'Básico', costMultiplier: 0.9, demandBonus: -0.03, dailyPerRoom: 18 },
  { id: 'estandar', label: 'Estándar', costMultiplier: 1, demandBonus: 0, dailyPerRoom: 28 },
  { id: 'premium', label: 'Premium', costMultiplier: 1.2, demandBonus: 0.04, dailyPerRoom: 45 },
  { id: 'lujo', label: 'Lujo', costMultiplier: 1.45, demandBonus: 0.08, dailyPerRoom: 72 },
]

export const TARGET_OPTIONS: { id: GuestTarget; label: string }[] = [
  { id: 'lujo', label: 'Lujo' },
  { id: 'negocios', label: 'Negocios' },
  { id: 'familiar', label: 'Familiar' },
  { id: 'parejas', label: 'Parejas' },
  { id: 'aventura', label: 'Aventura' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'playa', label: 'Playa / vacaciones' },
]

export const STARTING_CASH = 750_000_000
export const REAL_MS_PER_GAME_MINUTE = 1000 // at speed 1: 1 real second = 1 game minute; 1 real min = 1 game hour
