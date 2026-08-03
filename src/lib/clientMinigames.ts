import type { ClientNeedId, HotelService } from '../types'

export type MinigameId =
  | 'casino_ruleta'
  | 'casino_tragaperras'
  | 'golf_swing'
  | 'buceo_tesoro'
  | 'padel_rally'
  | 'cine_trivia'
  | 'heli_vuelo'
  | 'teatro_aplauso'
  | 'kids_busca'
  | 'spa_respirar'
  | 'piscina_brazada'
  | 'bar_coctel'
  | 'yoga_postura'
  | 'gym_reps'
  | 'playa_voley'
  | 'mirador_foto'
  | 'chef_pedido'
  | 'tienda_ganga'
  | 'baile_ritmo'

export type MinigameOutcome = {
  score: number
  walletDelta: number
  pointsDelta: number
  needsBonus: Partial<Record<ClientNeedId, number>>
  message: string
}

export const MINIGAME_LABEL: Record<MinigameId, string> = {
  casino_ruleta: 'Ruleta',
  casino_tragaperras: 'Tragaperras',
  golf_swing: 'Swing de golf',
  buceo_tesoro: 'Tesoro submarino',
  padel_rally: 'Rally de pádel',
  cine_trivia: 'Trivia de cine',
  heli_vuelo: 'Vuelo panorámico',
  teatro_aplauso: 'Ritmo del aplauso',
  kids_busca: 'Club infantil',
  spa_respirar: 'Respiración spa',
  piscina_brazada: 'Brazada perfecta',
  bar_coctel: 'Coctelería',
  yoga_postura: 'Equilibrio yoga',
  gym_reps: 'Serie de gym',
  playa_voley: 'Vóley playa',
  mirador_foto: 'Foto del mirador',
  chef_pedido: 'Pedido del chef',
  tienda_ganga: 'Ganga de boutique',
  baile_ritmo: 'Pista de baile',
}

/** Qué minijuego abre cada acción de servicio. */
export function minigameForAction(service: HotelService, actionId: string): MinigameId | null {
  if (service === 'casino' && (actionId === 'mesa' || actionId === 'ruleta')) return 'casino_ruleta'
  if (service === 'casino' && (actionId === 'tragaperras' || actionId === 'slots')) return 'casino_tragaperras'
  if (service === 'golf' && (actionId === '9hoyos' || actionId === 'swing')) return 'golf_swing'
  if (service === 'buceo' && (actionId === 'bautismo' || actionId === 'tesoro')) return 'buceo_tesoro'
  if (service === 'pista_padel' && (actionId === 'partido' || actionId === 'rally')) return 'padel_rally'
  if (service === 'cine' && (actionId === 'pase' || actionId === 'trivia')) return 'cine_trivia'
  if (service === 'helipuerto' && (actionId === 'vuelo' || actionId === 'panoramico')) return 'heli_vuelo'
  if (service === 'teatro' && (actionId === 'entrada' || actionId === 'aplauso')) return 'teatro_aplauso'
  if (service === 'kids_club' && (actionId === 'taller' || actionId === 'busca')) return 'kids_busca'
  if (service === 'spa' && actionId === 'respirar') return 'spa_respirar'
  if (service === 'piscina' && actionId === 'brazada') return 'piscina_brazada'
  if (service === 'bar_azotea' && actionId === 'coctel') return 'bar_coctel'
  if (service === 'yoga' && actionId === 'equilibrio') return 'yoga_postura'
  if (service === 'gimnasio' && actionId === 'serie') return 'gym_reps'
  if (service === 'playa_privada' && actionId === 'voley') return 'playa_voley'
  if (service === 'mirador' && actionId === 'foto') return 'mirador_foto'
  if (service === 'restaurante' && actionId === 'chef') return 'chef_pedido'
  if (service === 'tienda' && actionId === 'ganga') return 'tienda_ganga'
  if (service === 'concierge' && actionId === 'baile') return 'baile_ritmo'
  if (service === 'jardines' && actionId === 'baile') return 'baile_ritmo'
  return null
}

export function servicesWithMinigame(): HotelService[] {
  return [
    'casino',
    'golf',
    'buceo',
    'pista_padel',
    'cine',
    'spa',
    'piscina',
    'bar_azotea',
    'yoga',
    'gimnasio',
    'playa_privada',
    'mirador',
    'restaurante',
    'tienda',
    'teatro',
    'helipuerto',
    'kids_club',
    'concierge',
  ]
}

/** Actividades de lobby siempre disponibles en estancia (animación del resort). */
export const LOBBY_ACTIVITIES: {
  id: MinigameId
  label: string
  detail: string
  cost: number
  points: number
}[] = [
  { id: 'baile_ritmo', label: 'Pista de baile', detail: 'Sigue el ritmo en el lobby.', cost: 18, points: 10 },
  { id: 'bar_coctel', label: 'Happy hour', detail: 'Mezcla el cóctel de la casa.', cost: 22, points: 12 },
  { id: 'cine_trivia', label: 'Trivia del resort', detail: '3 preguntas rápidas.', cost: 12, points: 8 },
  { id: 'kids_busca', label: 'Búsqueda del tesoro', detail: 'Animación familiar en el hall.', cost: 10, points: 8 },
  { id: 'spa_respirar', label: 'Mini mindfulness', detail: 'Respiración guiada 30 s.', cost: 8, points: 6 },
  { id: 'gym_reps', label: 'Reto fitness', detail: 'Serie cronometrada en el gym corner.', cost: 14, points: 9 },
  { id: 'mirador_foto', label: 'Foto souvenir', detail: 'Captura el momento en el mirador.', cost: 15, points: 10 },
  { id: 'tienda_ganga', label: 'Oferta flash', detail: 'Atrapa la ganga de boutique.', cost: 16, points: 8 },
]

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

export function resolveSlots(matches: number): MinigameOutcome {
  const m = Math.max(0, Math.min(3, matches))
  if (m === 3) {
    return {
      score: 100,
      walletDelta: 120,
      pointsDelta: 30,
      needsBonus: { humor: 20, social: 12 },
      message: '¡Jackpot! Tres iguales.',
    }
  }
  if (m === 2) {
    return {
      score: 60,
      walletDelta: 25,
      pointsDelta: 12,
      needsBonus: { humor: 10, social: 8 },
      message: 'Dos iguales. Premio menor.',
    }
  }
  return {
    score: 20,
    walletDelta: -15,
    pointsDelta: 4,
    needsBonus: { humor: 4, social: 6, energia: -4 },
    message: 'Sin premio en tragaperras (−15 € de fichas).',
  }
}

export function resolveHeli(holdRatio: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, holdRatio))
  const score = Math.round(a * 100)
  if (a >= 0.75) {
    return {
      score,
      walletDelta: 40,
      pointsDelta: 28,
      needsBonus: { humor: 22, confort: 16, energia: -6 },
      message: 'Rumbo estable. Vistas de postal.',
    }
  }
  if (a >= 0.4) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 14,
      needsBonus: { humor: 12, confort: 10, energia: -8 },
      message: 'Turbulencias leves, pero llegaste.',
    }
  }
  return {
    score,
    walletDelta: 0,
    pointsDelta: 6,
    needsBonus: { humor: 4, confort: 4, energia: -10, seguridad: -6 },
    message: 'El piloto toma el control. Mejor no mirar abajo.',
  }
}

export function resolveTeatro(hits: number): MinigameOutcome {
  const h = Math.max(0, Math.min(6, hits))
  const score = Math.round((h / 6) * 100)
  return {
    score,
    walletDelta: h >= 5 ? 20 : 0,
    pointsDelta: 6 + h * 2,
    needsBonus: { humor: 8 + h * 2, social: 10 + h, relax: 6 },
    message: h >= 5 ? 'Ovación. El teatro vibra.' : `Aplaudiste a tiempo ${h}/6.`,
  }
}

export function resolveKids(found: number): MinigameOutcome {
  const f = Math.max(0, Math.min(4, found))
  return {
    score: Math.round((f / 4) * 100),
    walletDelta: f >= 4 ? 15 : 0,
    pointsDelta: 5 + f * 3,
    needsBonus: { humor: 8 + f * 2, social: 10 + f, energia: -4 },
    message: f >= 4 ? 'Todos los juguetes. El kids club aplaude.' : `Encontraste ${f}/4 juguetes.`,
  }
}

function scoreHold(ratio: number, good: MinigameOutcome, mid: MinigameOutcome, bad: MinigameOutcome): MinigameOutcome {
  if (ratio >= 0.75) return good
  if (ratio >= 0.4) return mid
  return bad
}

export function resolveSpaBreath(holdRatio: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, holdRatio))
  return scoreHold(
    a,
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 18,
      needsBonus: { relax: 28, energia: 10, humor: 8 },
      message: 'Respiración profunda. El spa te nota más calmado.',
    },
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 10,
      needsBonus: { relax: 16, energia: 4 },
      message: 'Buena sesión. Aún te queda tensión en los hombros.',
    },
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 5,
      needsBonus: { relax: 8 },
      message: 'Cortaste pronto. Mañana lo intentas otra vez.',
    },
  )
}

export function resolveSwimStroke(accuracy: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, accuracy))
  const score = Math.round(a * 100)
  if (a >= 0.85) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 16,
      needsBonus: { energia: -12, humor: 14, higiene: -4 },
      message: 'Brazada limpia. El socorrista asiente.',
    }
  }
  if (a >= 0.5) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 9,
      needsBonus: { energia: -14, humor: 8 },
      message: 'Ritmo correcto, aunque chapoteaste un poco.',
    }
  }
  return {
    score,
    walletDelta: 0,
    pointsDelta: 4,
    needsBonus: { energia: -16, humor: 4 },
    message: 'Trago de agua incluido. La pareja ríe.',
  }
}

export function resolveCocktail(correct: number): MinigameOutcome {
  const n = Math.max(0, Math.min(4, correct))
  return {
    score: Math.round((n / 4) * 100),
    walletDelta: n >= 4 ? 12 : 0,
    pointsDelta: 6 + n * 3,
    needsBonus: { social: 8 + n * 2, humor: 10 + n, sed: -6, energia: -4 },
    message: n >= 4 ? 'Cóctel de la casa perfecto.' : `${n}/4 ingredientes en orden.`,
  }
}

export function resolveYoga(holdRatio: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, holdRatio))
  return scoreHold(
    a,
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 16,
      needsBonus: { relax: 24, energia: 8, humor: 10 },
      message: 'Postura estable. Namasté del instructor.',
    },
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 9,
      needsBonus: { relax: 14, energia: 4 },
      message: 'Temblor leve, pero aguantaste.',
    },
    {
      score: Math.round(a * 100),
      walletDelta: 0,
      pointsDelta: 4,
      needsBonus: { relax: 6, energia: -4 },
      message: 'Caíste de la postura. Esterilla al rescate.',
    },
  )
}

export function resolveGymReps(reps: number): MinigameOutcome {
  const r = Math.max(0, Math.min(20, reps))
  const score = Math.round((r / 20) * 100)
  return {
    score,
    walletDelta: r >= 16 ? 10 : 0,
    pointsDelta: 4 + Math.floor(r / 2),
    needsBonus: { energia: -10 - Math.floor(r / 3), humor: 6 + Math.floor(r / 3), hambre: -6 },
    message: r >= 16 ? `¡${r} reps! Marca personal del hotel.` : `${r} repeticiones. Buen sudor.`,
  }
}

export function resolveBeachVolley(hits: number): MinigameOutcome {
  return resolvePadel(hits)
}

export function resolveMiradorShot(accuracy: number): MinigameOutcome {
  const a = Math.max(0, Math.min(1, accuracy))
  const score = Math.round(a * 100)
  if (a >= 0.88) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 20,
      needsBonus: { humor: 18, relax: 12, social: 8 },
      message: 'Foto de portada. Luz dorada perfecta.',
    }
  }
  if (a >= 0.55) {
    return {
      score,
      walletDelta: 0,
      pointsDelta: 11,
      needsBonus: { humor: 10, relax: 8 },
      message: 'Buen encuadre. Un poco movida, pero vale.',
    }
  }
  return {
    score,
    walletDelta: 0,
    pointsDelta: 5,
    needsBonus: { humor: 4, relax: 4 },
    message: 'Dedo en el objetivo. Borras y repites.',
  }
}

export function resolveChefOrder(correct: number): MinigameOutcome {
  const n = Math.max(0, Math.min(3, correct))
  return {
    score: Math.round((n / 3) * 100),
    walletDelta: n === 3 ? 15 : 0,
    pointsDelta: 8 + n * 4,
    needsBonus: { hambre: 10 + n * 6, social: 8, humor: 8 + n * 2 },
    message: n === 3 ? 'Pedido impecable. El chef sonríe.' : `${n}/3 platos recordados.`,
  }
}

export function resolveShopDeal(caught: boolean): MinigameOutcome {
  if (caught) {
    return {
      score: 100,
      walletDelta: 20,
      pointsDelta: 14,
      needsBonus: { humor: 14, confort: 8, social: 6 },
      message: 'Ganga atrapada. Descuento aplicado en boutique.',
    }
  }
  return {
    score: 25,
    walletDelta: 0,
    pointsDelta: 4,
    needsBonus: { humor: 4 },
    message: 'Se te escapó la oferta flash.',
  }
}

export function resolveDance(hits: number): MinigameOutcome {
  const h = Math.max(0, Math.min(8, hits))
  return {
    score: Math.round((h / 8) * 100),
    walletDelta: h >= 7 ? 15 : 0,
    pointsDelta: 5 + h * 2,
    needsBonus: { social: 10 + h, humor: 12 + h, energia: -8 - Math.floor(h / 2) },
    message: h >= 7 ? 'La pista es tuya.' : `Aciertos de ritmo: ${h}/8.`,
  }
}
