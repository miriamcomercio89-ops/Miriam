import type { ClientNeedId, HotelService } from '../types'

export type MinigameId = 'casino_ruleta' | 'golf_swing' | 'buceo_tesoro' | 'padel_rally' | 'cine_trivia'

export type MinigameOutcome = {
  score: number
  walletDelta: number
  pointsDelta: number
  needsBonus: Partial<Record<ClientNeedId, number>>
  message: string
}

export const MINIGAME_LABEL: Record<MinigameId, string> = {
  casino_ruleta: 'Ruleta',
  golf_swing: 'Swing de golf',
  buceo_tesoro: 'Tesoro submarino',
  padel_rally: 'Rally de pádel',
  cine_trivia: 'Trivia de cine',
}

/** Qué minijuego abre cada acción de servicio. */
export function minigameForAction(service: HotelService, actionId: string): MinigameId | null {
  if (service === 'casino' && (actionId === 'mesa' || actionId === 'ruleta')) return 'casino_ruleta'
  if (service === 'golf' && (actionId === '9hoyos' || actionId === 'swing')) return 'golf_swing'
  if (service === 'buceo' && (actionId === 'bautismo' || actionId === 'tesoro')) return 'buceo_tesoro'
  if (service === 'pista_padel' && (actionId === 'partido' || actionId === 'rally')) return 'padel_rally'
  if (service === 'cine' && (actionId === 'pase' || actionId === 'trivia')) return 'cine_trivia'
  return null
}

export function servicesWithMinigame(): HotelService[] {
  return ['casino', 'golf', 'buceo', 'pista_padel', 'cine']
}

/** Resultado de la ruleta tras elegir color. */
export function resolveCasinoSpin(
  pick: 'rojo' | 'negro' | 'verde',
  bet: number,
  roll = Math.random(),
): MinigameOutcome {
  const n = Math.floor(roll * 37) // 0–36
  const color: 'rojo' | 'negro' | 'verde' =
    n === 0 ? 'verde' : n % 2 === 0 ? 'negro' : 'rojo'
  const stake = Math.max(10, Math.round(bet))
  if (pick === color) {
    const mult = color === 'verde' ? 14 : 2
    const gross = stake * mult
    const net = gross - stake
    return {
      score: color === 'verde' ? 100 : 75,
      walletDelta: net,
      pointsDelta: color === 'verde' ? 40 : 18,
      needsBonus: { humor: 16, social: 10 },
      message: `Salió ${n} (${color}). Premio ${gross.toLocaleString('es-ES')} € (neto +${net.toLocaleString('es-ES')} €).`,
    }
  }
  return {
    score: 20,
    walletDelta: -stake,
    pointsDelta: 4,
    needsBonus: { humor: 4, social: 8, energia: -4 },
    message: `Salió ${n} (${color}). Pierdes la apuesta de ${stake.toLocaleString('es-ES')} €.`,
  }
}

/** Accuracy 0–1 del medidor de swing. */
export function resolveGolfSwing(accuracy: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, accuracy))
  const score = Math.round(a * 100)
  if (a >= 0.92) {
    return {
      score,
      walletDelta: 80,
      pointsDelta: 28,
      needsBonus: { humor: 18, social: 12, energia: -14 },
      message: '¡Eagle virtual! Swing perfecto.',
    }
  }
  if (a >= 0.7) {
    return {
      score,
      walletDelta: 30,
      pointsDelta: 16,
      needsBonus: { humor: 12, social: 10, energia: -16 },
      message: 'Buen golpe. Estás en el green.',
    }
  }
  if (a >= 0.4) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 8,
      needsBonus: { humor: 6, social: 8, energia: -18 },
      message: 'Rough. Recuperable, pero no es birdie.',
    }
  }
  return {
    score,
    walletDelta: 0,
    pointsDelta: 3,
    needsBonus: { humor: -4, social: 4, energia: -20 },
    message: 'Fuera de límites. Tu pareja calla educadamente.',
  }
}

/** found = peces/tesoros encontrados (0–3), timeLeft ratio 0–1 */
export function resolveDive(found: number, timeLeftRatio: number): MinigameOutcome {
  const f = Math.max(0, Math.min(3, found))
  const score = Math.round((f / 3) * 70 + timeLeftRatio * 30)
  if (f >= 3) {
    return {
      score,
      walletDelta: 60,
      pointsDelta: 30,
      needsBonus: { humor: 20, social: 12, energia: -18, hambre: -10 },
      message: 'Recogiste los 3 tesoros del arrecife.',
    }
  }
  if (f >= 2) {
    return {
      score,
      walletDelta: 20,
      pointsDelta: 16,
      needsBonus: { humor: 12, social: 10, energia: -16 },
      message: `Encontraste ${f} de 3. Buena inmersión.`,
    }
  }
  if (f >= 1) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 8,
      needsBonus: { humor: 6, social: 8, energia: -14 },
      message: 'Un solo hallazgo. El instructor sonríe igual.',
    }
  }
  return {
    score: Math.max(5, score),
    walletDelta: 0,
    pointsDelta: 4,
    needsBonus: { humor: 2, energia: -12 },
    message: 'Sin tesoro, pero saliste sano del agua.',
  }
}

/** hits acertados de 5 */
export function resolvePadel(hits: number): MinigameOutcome {
  const h = Math.max(0, Math.min(5, hits))
  const score = Math.round((h / 5) * 100)
  if (h >= 5) {
    return {
      score,
      walletDelta: 40,
      pointsDelta: 24,
      needsBonus: { humor: 18, social: 16, energia: -20, hambre: -8 },
      message: 'Rally perfecto. ¡6–0 imaginario!',
    }
  }
  if (h >= 3) {
    return {
      score,
      walletDelta: 15,
      pointsDelta: 14,
      needsBonus: { humor: 12, social: 12, energia: -18 },
      message: `${h}/5 golpes limpios. Buen partido.`,
    }
  }
  return {
    score,
    walletDelta: 0,
    pointsDelta: 6,
    needsBonus: { humor: 6, social: 8, energia: -16 },
    message: `${h}/5. La red ganó algún punto.`,
  }
}

export type TriviaQ = { q: string; options: string[]; correct: number }

export const CINE_TRIVIA: TriviaQ[] = [
  {
    q: 'En el cine del hotel, ¿qué suele mejorar la noche?',
    options: ['Palomitas compartidas', 'Revisar el ledger', 'Subastar el hotel'],
    correct: 0,
  },
  {
    q: 'Un buen tráiler…',
    options: ['Dura 40 minutos', 'Cuenta sin spoilear el final', 'Sustituye a la película'],
    correct: 1,
  },
  {
    q: 'Si la sala está llena, lo educado es…',
    options: ['Hablar alto', 'Silenciar el móvil', 'Grabar toda la película'],
    correct: 1,
  },
]

export function resolveTrivia(correctCount: number): MinigameOutcome {
  const n = Math.max(0, Math.min(3, correctCount))
  const score = Math.round((n / 3) * 100)
  if (n === 3) {
    return {
      score,
      walletDelta: 25,
      pointsDelta: 22,
      needsBonus: { humor: 16, relax: 12, social: 10 },
      message: 'Trivia perfecta. El acomodador aplaude en silencio.',
    }
  }
  if (n === 2) {
    return {
      score,
      walletDelta: 10,
      pointsDelta: 12,
      needsBonus: { humor: 12, relax: 10, social: 8 },
      message: '2/3. Buena noche de cine.',
    }
  }
  return {
    score: Math.max(15, score),
    walletDelta: 0,
    pointsDelta: 6,
    needsBonus: { humor: 8, relax: 12, social: 6 },
    message: `${n}/3. La película igual te gustó.`,
  }
}
