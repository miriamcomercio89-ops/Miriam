import type { ClientNeedId, ClientNeeds, ClientModeState } from '../types'
import { applyNeedDelta } from './clientMode'

export type PartnerOrderId = 'paseo' | 'spa' | 'cena' | 'siesta' | 'selfie'

export type PartnerOrder = {
  id: PartnerOrderId
  label: string
  detail: string
  needs: Partial<Record<ClientNeedId, number>>
  /** También afecta un poco al jugador (pareja compartida). */
  playerShare: Partial<Record<ClientNeedId, number>>
}

export const PARTNER_ORDERS: PartnerOrder[] = [
  {
    id: 'paseo',
    label: 'Paseo juntos',
    detail: 'Vuelta por jardines o lobby.',
    needs: { social: 18, humor: 12, energia: -8, relax: 8 },
    playerShare: { social: 10, humor: 8, energia: -4 },
  },
  {
    id: 'spa',
    label: 'Que vaya al spa',
    detail: 'Circuito corto sin ti.',
    needs: { relax: 28, higiene: 10, energia: 6 },
    playerShare: { relax: 4, humor: 4 },
  },
  {
    id: 'cena',
    label: 'Cena ligera',
    detail: 'Snack o room service compartido.',
    needs: { hambre: 22, sed: 10, social: 10, humor: 8 },
    playerShare: { hambre: 10, social: 6 },
  },
  {
    id: 'siesta',
    label: 'Siesta',
    detail: 'Descanso en la habitación.',
    needs: { sueno: 24, energia: 12, social: -4 },
    playerShare: { sueno: 6, energia: 4 },
  },
  {
    id: 'selfie',
    label: 'Selfie de pareja',
    detail: 'Foto para el pasaporte emocional.',
    needs: { social: 14, humor: 16, confort: 6 },
    playerShare: { social: 10, humor: 12 },
  },
]

export const PARTNER_ORDERS_PER_NIGHT = 2

export function applyPartnerOrder(
  client: ClientModeState,
  orderId: PartnerOrderId,
): { ok: true; client: ClientModeState } | { ok: false; error: string } {
  if (client.partnerMode !== 'orders') {
    return { ok: false, error: 'Activa el modo «Órdenes» para la pareja.' }
  }
  if ((client.partnerOrdersLeft ?? 0) <= 0) {
    return { ok: false, error: 'Sin órdenes restantes esta noche (máx. 2).' }
  }
  const order = PARTNER_ORDERS.find((o) => o.id === orderId)
  if (!order) return { ok: false, error: 'Orden no válida.' }

  const partnerNeeds = applyNeedDelta(client.partnerNeeds, order.needs)
  const needs = applyNeedDelta(client.needs, order.playerShare)
  return {
    ok: true,
    client: {
      ...client,
      partnerNeeds,
      needs,
      partnerOrdersLeft: client.partnerOrdersLeft - 1,
      partnerOrdersUsedTonight: (client.partnerOrdersUsedTonight ?? 0) + 1,
      notifications: [
        `Pareja: ${order.label}. Quedan ${client.partnerOrdersLeft - 1} órdenes.`,
        ...client.notifications,
      ].slice(0, 12),
    },
  }
}

/** Si la pareja va en auto, mejora suave al liquidar la noche. */
export function autoPartnerNightNeeds(_needs: ClientNeeds): Partial<Record<ClientNeedId, number>> {
  return {
    social: 6,
    humor: 4,
    relax: 4,
    hambre: -6,
    energia: -4,
  }
}
