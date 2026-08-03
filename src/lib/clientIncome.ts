import type { ClientModeState, ClientSpecialize, Hotel, WeatherInfo } from '../types'
import { specializeStayBonus } from './clientClub'
import type { LobbyEvent } from './clientLobbyEvents'

/** Corte base sobre ingresos del hotel donde duermes (CEO huésped). */
export const CLIENT_HOTEL_CUT = 0.004
/** Corte sobre el beneficio neto positivo de toda la cadena Orbis. */
export const CLIENT_CHAIN_CUT = 0.00035
/** Suelo diario de dietas de viaje (aunque la cadena vaya mal). */
export const CLIENT_BASE_STIPEND = 45

export type IncomeFactor = {
  id: string
  label: string
  amount: number
}

export type ClientNightIncome = {
  total: number
  factors: IncomeFactor[]
  hotelCut: number
  chainCut: number
  stipend: number
}

function chainDayNet(hotels: Hotel[]): number {
  let n = 0
  for (const h of hotels) {
    if (h.closed) continue
    n += (h.lastDayRevenue ?? 0) - (h.lastDayCosts ?? 0) - (h.lastDayTax ?? 0)
  }
  return n
}

function chainDayRevenue(hotels: Hotel[]): number {
  let n = 0
  for (const h of hotels) {
    if (h.closed) continue
    n += Math.max(0, h.lastDayRevenue ?? 0)
  }
  return n
}

/**
 * Ingresos del cliente al liquidar una noche.
 * Factores: hotel, cadena, nivel club, ocupación, clima, especialización,
 * pareja (órdenes), evento de lobby, estrellas y noches totales.
 */
export function calcClientNightIncome(args: {
  client: ClientModeState
  hotel: Hotel
  hotels: Hotel[]
  weather: WeatherInfo
  lobbyEvent: LobbyEvent | null
  partnerOrdersUsed: number
}): ClientNightIncome {
  const { client, hotel, hotels, weather, lobbyEvent, partnerOrdersUsed } = args
  const factors: IncomeFactor[] = []

  const stipend = CLIENT_BASE_STIPEND + client.level * 8
  factors.push({ id: 'stipend', label: `Dieta nv.${client.level}`, amount: stipend })

  const hotelRev = Math.max(0, hotel.lastDayRevenue ?? 0)
  const hotelCut = Math.round(hotelRev * CLIENT_HOTEL_CUT)
  factors.push({ id: 'hotel', label: `CEO hotel (${(CLIENT_HOTEL_CUT * 100).toFixed(1)}%)`, amount: hotelCut })

  const chainNet = chainDayNet(hotels)
  const chainRev = chainDayRevenue(hotels)
  const chainCut = Math.round(Math.max(0, chainNet) * CLIENT_CHAIN_CUT + Math.max(0, chainRev) * 0.00008)
  factors.push({
    id: 'chain',
    label: `Cadena Orbis (${hotels.filter((h) => !h.closed).length} hoteles)`,
    amount: chainCut,
  })

  const occ = hotel.lastDayOccupancy ?? 0.5
  const occBonus = Math.round(28 * Math.max(0, occ - 0.45) * 2)
  if (occBonus > 0) {
    factors.push({ id: 'occ', label: `Ocupación ${Math.round(occ * 100)}%`, amount: occBonus })
  }

  const starBonus = Math.round(hotel.stars * 6 + (hotel.satisfaction ?? 70) * 0.15)
  factors.push({ id: 'stars', label: `${hotel.stars}★ · satisfacción`, amount: starBonus })

  const weatherMult =
    weather.demandMult >= 1.05 ? 1.12 : weather.demandMult <= 0.9 ? 0.88 : 1
  const weatherAmt = Math.round((stipend + hotelCut) * (weatherMult - 1))
  if (weatherAmt !== 0) {
    factors.push({
      id: 'weather',
      label: weather.label,
      amount: weatherAmt,
    })
  }

  const spec = specializeStayBonus(client.specialize, hotel)
  const specAmt = Math.round((hotelCut + stipend) * (spec.pointsMult - 1) * 0.6)
  if (specAmt !== 0) {
    factors.push({
      id: 'spec',
      label: `Especialización ${client.specialize === 'none' ? '—' : client.specialize}`,
      amount: Math.max(0, specAmt),
    })
  }

  const loyaltyAmt = Math.round(client.totalNights * 0.4 + client.passport.length * 1.2)
  if (loyaltyAmt > 0) {
    factors.push({ id: 'loyalty', label: 'Pasaporte / noches', amount: loyaltyAmt })
  }

  const partnerAmt =
    client.partnerMode === 'orders'
      ? 12 + partnerOrdersUsed * 18
      : 8
  factors.push({
    id: 'partner',
    label:
      client.partnerMode === 'orders'
        ? `Pareja (${partnerOrdersUsed} órdenes)`
        : 'Pareja (auto)',
    amount: partnerAmt,
  })

  if (lobbyEvent) {
    const ev = Math.round(lobbyEvent.incomeBonus)
    factors.push({ id: 'event', label: lobbyEvent.title, amount: ev })
  }

  const total = Math.max(15, factors.reduce((s, f) => s + f.amount, 0))
  return {
    total,
    factors,
    hotelCut,
    chainCut,
    stipend,
  }
}

export function specializeLabel(s: ClientSpecialize): string {
  return s
}
