import { SERVICE_CATALOG } from '../data/catalog'
import type { ClientMission, ClientNeedId, ClientNeeds, Hotel, HotelService } from '../types'
import { applyNeedDelta } from './clientMode'

export type ServiceAction = {
  id: string
  label: string
  detail: string
  cost: number
  minutes: number
  needs: Partial<Record<ClientNeedId, number>>
  points: number
  /** Si existe, al elegir la acción se abre el minijuego. */
  minigame?: boolean
}

export type ServiceScreen = {
  service: HotelService
  title: string
  intro: string
  hours: string
  actions: ServiceAction[]
}

function baseCost(service: HotelService, hotel: Hotel, mult = 1): number {
  const daily = SERVICE_CATALOG.find((s) => s.id === service)?.dailyCost ?? 80
  return Math.max(12, Math.round(daily * 0.28 * mult * (1 + hotel.stars * 0.06)))
}

/** Pantalla propia por cada servicio del catálogo. */
export function buildServiceScreen(service: HotelService, hotel: Hotel): ServiceScreen {
  const meta = SERVICE_CATALOG.find((s) => s.id === service)
  const title = meta?.label ?? service
  const c = (m = 1) => baseCost(service, hotel, m)

  const screens: Partial<Record<HotelService, Omit<ServiceScreen, 'service'>>> = {
    restaurante: {
      title,
      intro: hotel.restaurantConcepts?.length
        ? `Conceptos: ${hotel.restaurantConcepts.join(', ')}. Ambiente según el nivel de personal del hotel.`
        : 'Restaurante del hotel. Carta del día y servicio a mesa.',
      hours: 'Desayuno 7:00–11:00 · Comida 13:00–16:00 · Cena 19:00–23:00',
      actions: [
        { id: 'menu_dia', label: 'Menú del día', detail: 'Entrante, principal y postre.', cost: c(0.9), minutes: 55, needs: { hambre: 32, sed: 10, social: 6 }, points: 10 },
        { id: 'carta', label: 'A la carta', detail: 'Elige platos premium del chef.', cost: c(1.4), minutes: 75, needs: { hambre: 38, sed: 12, humor: 8, social: 8 }, points: 14 },
        { id: 'cena_pareja', label: 'Cena en pareja', detail: 'Mesa para dos con maridaje ligero.', cost: c(1.8), minutes: 90, needs: { hambre: 40, sed: 18, social: 20, humor: 12 }, points: 18 },
      ],
    },
    all_inclusive: {
      title,
      intro: 'Acceso a buffets y barras del régimen todo incluido.',
      hours: 'Buffet continuo 7:00–22:30 · Snacks 24h en zonas comunes',
      actions: [
        { id: 'buffet', label: 'Buffet completo', detail: 'Estaciones calientes y frías.', cost: c(0.5), minutes: 45, needs: { hambre: 42, sed: 25, confort: 8 }, points: 8 },
        { id: 'snack', label: 'Snack TI', detail: 'Bocadillo y bebida en snack bar.', cost: c(0.25), minutes: 20, needs: { hambre: 18, sed: 15 }, points: 4 },
      ],
    },
    bar_azotea: {
      title,
      intro: hotel.barTypes?.length ? `Bares: ${hotel.barTypes.join(', ')}.` : 'Bar con vistas y cócteles.',
      hours: '12:00–01:00 (última ronda 00:30)',
      actions: [
        { id: 'copa', label: 'Copa / cóctel', detail: 'Carta de autor.', cost: c(1.1), minutes: 30, needs: { sed: 22, social: 16, humor: 10, energia: -4 }, points: 9 },
        { id: 'atardecer', label: 'Atardecer en la azotea', detail: 'Mesa reservada al sol.', cost: c(1.5), minutes: 50, needs: { relax: 18, social: 14, humor: 14 }, points: 12 },
      ],
    },
    spa: {
      title,
      intro: 'Circuito wellness. Pide cita para tratamientos.',
      hours: '9:00–21:00 · Última cita 20:00',
      actions: [
        { id: 'circuito', label: 'Circuito de aguas', detail: 'Piscina termal, vapor y duchas.', cost: c(1), minutes: 60, needs: { relax: 28, higiene: 12, energia: 6 }, points: 12 },
        { id: 'masaje', label: 'Masaje 40 min', detail: 'Cita con terapeuta.', cost: c(1.8), minutes: 50, needs: { relax: 40, sueno: 10, energia: 8 }, points: 18 },
        { id: 'facial', label: 'Facial', detail: 'Tratamiento facial relajante.', cost: c(1.5), minutes: 45, needs: { relax: 22, higiene: 18, humor: 8 }, points: 14 },
      ],
    },
    sauna: {
      title,
      intro: 'Sauna seca o húmeda según el hotel.',
      hours: '8:00–22:00',
      actions: [
        { id: 'sesion', label: 'Sesión 20 min', detail: 'Incluye ducha fría.', cost: c(0.8), minutes: 25, needs: { relax: 22, higiene: 10, energia: -6 }, points: 7 },
      ],
    },
    piscina: {
      title,
      intro: 'Piscina del resort o azotea.',
      hours: '8:00–20:00 · Toallas en recepción de piscina',
      actions: [
        { id: 'bano', label: 'Baño y tumbona', detail: 'Hamaca reservada.', cost: c(0.6), minutes: 60, needs: { relax: 20, social: 8, energia: -8, higiene: -6 }, points: 6 },
        { id: 'clase', label: 'Aqua gym', detail: 'Clase grupal 30 min.', cost: c(0.9), minutes: 35, needs: { energia: -12, social: 12, humor: 10 }, points: 9 },
      ],
    },
    gimnasio: {
      title,
      intro: 'Sala de musculación y cardio.',
      hours: '6:00–23:00',
      actions: [
        { id: 'entreno', label: 'Entrenamiento', detail: '45 min de rutina.', cost: c(0.5), minutes: 45, needs: { energia: -18, hambre: -12, humor: 12 }, points: 8 },
      ],
    },
    yoga: {
      title,
      intro: 'Sala de yoga / mindfulness.',
      hours: '7:00–9:00 y 18:00–20:00',
      actions: [
        { id: 'clase', label: 'Clase de yoga', detail: 'Sesión guiada.', cost: c(0.9), minutes: 50, needs: { relax: 26, energia: 8, humor: 10 }, points: 10 },
      ],
    },
    kids_club: {
      title,
      intro: 'Actividades infantiles supervisadas (tu pareja puede acompañar).',
      hours: '10:00–18:00',
      actions: [
        {
          id: 'taller',
          label: 'Taller + busca',
          detail: 'Minijuego: encuentra 4 juguetes.',
          cost: c(0.7),
          minutes: 60,
          needs: { social: 16, humor: 12, energia: -6 },
          points: 8,
          minigame: true,
        },
      ],
    },
    guarderia_noche: {
      title,
      intro: 'Cuidado nocturno para que descanséis.',
      hours: '20:00–01:00',
      actions: [
        { id: 'noche', label: 'Reserva 3 h', detail: 'Personal cualificado.', cost: c(1.2), minutes: 30, needs: { relax: 18, energia: 12, social: 4 }, points: 10 },
      ],
    },
    playa_privada: {
      title,
      intro: 'Acceso a playa privada del hotel.',
      hours: '9:00–19:00 · Chiringuito según temporada',
      actions: [
        { id: 'hamaca', label: 'Hamaca y sombrilla', detail: 'Set completo en primera línea.', cost: c(1), minutes: 90, needs: { relax: 28, social: 10, energia: -10, higiene: -8 }, points: 11 },
        { id: 'paseo', label: 'Paseo al atardecer', detail: 'Orilla y fotos.', cost: c(0.4), minutes: 40, needs: { relax: 16, humor: 12, social: 8 }, points: 7 },
      ],
    },
    buceo: {
      title,
      intro: 'Centro de buceo del hotel.',
      hours: 'Salidas 9:30 y 14:30',
      actions: [
        {
          id: 'bautismo',
          label: 'Bautismo + tesoro',
          detail: 'Minijuego: busca 3 tesoros bajo el agua.',
          cost: c(2),
          minutes: 120,
          needs: { energia: -22, social: 14, humor: 18, hambre: -12 },
          points: 20,
          minigame: true,
        },
        { id: 'snorkel', label: 'Snorkel guiado', detail: 'Ruta costera (sin minijuego).', cost: c(1.1), minutes: 70, needs: { energia: -14, social: 10, humor: 12 }, points: 12 },
      ],
    },
    golf: {
      title,
      intro: 'Campo o green del resort.',
      hours: 'Tee times 8:00–17:00',
      actions: [
        {
          id: '9hoyos',
          label: '9 hoyos + swing',
          detail: 'Minijuego: para el medidor en la zona dorada.',
          cost: c(2.2),
          minutes: 150,
          needs: { energia: -20, social: 12, relax: 10, hambre: -10 },
          points: 16,
          minigame: true,
        },
      ],
    },
    casino: {
      title,
      intro: 'Salón de juegos del hotel.',
      hours: '18:00–04:00',
      actions: [
        {
          id: 'mesa',
          label: 'Ruleta',
          detail: 'Minijuego: apuesta a rojo, negro o verde.',
          cost: c(1.5),
          minutes: 45,
          needs: { social: 18, humor: 14, energia: -8, sed: -6 },
          points: 12,
          minigame: true,
        },
        {
          id: 'tragaperras',
          label: 'Tragaperras',
          detail: 'Minijuego: tres rodillos.',
          cost: c(1.1),
          minutes: 25,
          needs: { social: 10, humor: 12, energia: -6 },
          points: 9,
          minigame: true,
        },
      ],
    },
    helipuerto: {
      title,
      intro: 'Traslado o vuelo panorámico (si hay plaza).',
      hours: 'Bajo demanda · 10:00–18:00',
      actions: [
        {
          id: 'vuelo',
          label: 'Vuelo panorámico',
          detail: 'Minijuego: mantén el rumbo 20 s.',
          cost: c(4),
          minutes: 40,
          needs: { confort: 22, humor: 20, energia: -5 },
          points: 25,
          minigame: true,
        },
      ],
    },
    coworking: {
      title,
      intro: 'Zona de trabajo con Wi‑Fi premium.',
      hours: '7:00–22:00',
      actions: [
        { id: 'bloque', label: 'Bloque 2 h', detail: 'Escritorio y café.', cost: c(0.6), minutes: 120, needs: { energia: -12, social: -4, confort: 8 }, points: 6 },
      ],
    },
    room_service_24h: {
      title,
      intro: 'Comida a la habitación a cualquier hora.',
      hours: '24 horas',
      actions: [
        { id: 'cena_hab', label: 'Cena en habitación', detail: 'Para dos.', cost: c(1.3), minutes: 40, needs: { hambre: 30, sed: 14, confort: 14, energia: 4 }, points: 11 },
        { id: 'desayuno_hab', label: 'Desayuno en cama', detail: 'Bandeja para pareja.', cost: c(1), minutes: 25, needs: { hambre: 24, sed: 12, confort: 16, humor: 8 }, points: 9 },
      ],
    },
    concierge: {
      title,
      intro: 'Conserjería: peticiones y gestiones.',
      hours: '24 horas en recepción',
      actions: [
        { id: 'taxi', label: 'Pedir taxi', detail: 'Salida en 10–15 min.', cost: c(0.8), minutes: 15, needs: { confort: 10, seguridad: 8 }, points: 5 },
        { id: 'mesa', label: 'Reservar mesa', detail: 'Restaurante del hotel o externo.', cost: c(0.4), minutes: 10, needs: { confort: 12, humor: 6 }, points: 6 },
        { id: 'late', label: 'Late checkout', detail: 'Hasta las 14:00 si hay disponibilidad.', cost: c(1.2), minutes: 10, needs: { confort: 18, sueno: 8 }, points: 10 },
        { id: 'tickets', label: 'Entradas / tours', detail: 'Gestión de tickets locales.', cost: c(1), minutes: 20, needs: { social: 8, humor: 10, confort: 8 }, points: 8 },
      ],
    },
    lavanderia: {
      title,
      intro: 'Lavado y planchado express.',
      hours: 'Entrega en 4–6 h · 8:00–20:00',
      actions: [
        { id: 'express', label: 'Servicio express', detail: 'Mudada completa.', cost: c(1), minutes: 15, needs: { higiene: 22, confort: 10 }, points: 6 },
      ],
    },
    transfer_aeropuerto: {
      title,
      intro: 'Traslado privado al aeropuerto.',
      hours: 'Bajo reserva · 24 h',
      actions: [
        { id: 'ida', label: 'Transfer ida', detail: 'Vehículo para dos.', cost: c(1.6), minutes: 20, needs: { confort: 14, seguridad: 10, energia: 4 }, points: 8 },
      ],
    },
    tienda: {
      title,
      intro: 'Boutique y souvenirs Orbis.',
      hours: '10:00–21:00',
      actions: [
        { id: 'souvenir', label: 'Souvenir', detail: 'Detalle de la marca.', cost: c(1.2), minutes: 15, needs: { humor: 10, confort: 6 }, points: 5 },
      ],
    },
    biblioteca: {
      title,
      intro: 'Sala tranquila y lectura.',
      hours: '8:00–22:00',
      actions: [
        { id: 'leer', label: 'Sesión de lectura', detail: 'Rincón silencioso.', cost: c(0.2), minutes: 40, needs: { relax: 20, social: -4, energia: 4 }, points: 4 },
      ],
    },
    medico: {
      title,
      intro: 'Puesto médico / primeros auxilios.',
      hours: '9:00–19:00 · Urgencias vía recepción',
      actions: [
        { id: 'consulta', label: 'Consulta rápida', detail: 'Revisión básica.', cost: c(1.4), minutes: 25, needs: { seguridad: 28, energia: 8, humor: 4 }, points: 7 },
      ],
    },
    cine: {
      title,
      intro: 'Sala de cine del hotel.',
      hours: 'Pases 17:00, 20:00 y 22:30',
      actions: [
        {
          id: 'pase',
          label: 'Película + trivia',
          detail: 'Minijuego: 3 preguntas entre pase.',
          cost: c(0.9),
          minutes: 110,
          needs: { social: 12, relax: 16, humor: 14 },
          points: 10,
          minigame: true,
        },
      ],
    },
    jardines: {
      title,
      intro: 'Jardines y zonas verdes.',
      hours: 'Amanecer–anochecer',
      actions: [
        { id: 'paseo', label: 'Paseo por el jardín', detail: 'Ruta botánica corta.', cost: c(0.2), minutes: 35, needs: { relax: 16, humor: 8 }, points: 4 },
      ],
    },
    mirador: {
      title,
      intro: 'Mirador con vistas.',
      hours: 'Abierto · mejor al atardecer',
      actions: [
        { id: 'vistas', label: 'Rato en el mirador', detail: 'Fotos y silencio.', cost: c(0.3), minutes: 30, needs: { relax: 18, social: 6, humor: 10 }, points: 6 },
      ],
    },
    pista_padel: {
      title,
      intro: 'Pista de pádel.',
      hours: '8:00–22:00 · Alquiler de material',
      actions: [
        {
          id: 'partido',
          label: 'Partido + rally',
          detail: 'Minijuego: acierta 5 golpes a tiempo.',
          cost: c(1.3),
          minutes: 70,
          needs: { energia: -18, social: 16, humor: 12, hambre: -8 },
          points: 11,
          minigame: true,
        },
      ],
    },
    wifi_premium: {
      title,
      intro: 'Red Wi‑Fi de alta velocidad.',
      hours: '24 horas',
      actions: [
        { id: 'pase', label: 'Pase día', detail: 'Dispositivos ilimitados en habitación.', cost: c(0.4), minutes: 5, needs: { confort: 8 }, points: 2 },
      ],
    },
    parking: {
      title,
      intro: 'Aparcamiento del hotel.',
      hours: '24 horas',
      actions: [
        { id: 'plaza', label: 'Plaza cubierta', detail: 'Para vuestra estancia.', cost: c(0.7), minutes: 5, needs: { confort: 6, seguridad: 8 }, points: 2 },
      ],
    },
    mascotas: {
      title,
      intro: 'Servicios pet-friendly.',
      hours: 'Recepción 24 h',
      actions: [
        { id: 'kit', label: 'Kit mascota', detail: 'Cuenco, snacks y manta.', cost: c(0.8), minutes: 10, needs: { humor: 12, social: 8 }, points: 5 },
      ],
    },
    ev_chargers: {
      title,
      intro: 'Carga de vehículo eléctrico.',
      hours: '24 horas',
      actions: [
        { id: 'carga', label: 'Sesión de carga', detail: 'Hasta 80 %.', cost: c(0.9), minutes: 15, needs: { confort: 6, seguridad: 4 }, points: 3 },
      ],
    },
    boda: {
      title,
      intro: 'Salón de eventos / bodas (visita).',
      hours: 'Visitas 11:00–18:00',
      actions: [
        { id: 'visita', label: 'Visita al salón', detail: 'Tour con events manager.', cost: c(0.5), minutes: 40, needs: { social: 14, humor: 12 }, points: 6 },
      ],
    },
    teatro: {
      title,
      intro: 'Sala de espectáculos.',
      hours: 'Función 21:00 · Puertas 20:15',
      actions: [
        {
          id: 'entrada',
          label: 'Entrada + aplauso',
          detail: 'Minijuego: sigue el ritmo del público.',
          cost: c(1.4),
          minutes: 100,
          needs: { social: 16, humor: 18, relax: 8 },
          points: 14,
          minigame: true,
        },
      ],
    },
  }

  const built = screens[service]
  if (built) return { service, ...built }

  return {
    service,
    title,
    intro: meta ? `${meta.label} · grupo ${meta.group}.` : 'Servicio del hotel.',
    hours: 'Consultar recepción',
    actions: [
      {
        id: 'usar',
        label: `Usar ${title}`,
        detail: 'Experiencia estándar del servicio.',
        cost: c(1),
        minutes: 30,
        needs: { confort: 8, humor: 6 },
        points: 5,
      },
    ],
  }
}

export function applyServiceAction(needs: ClientNeeds, action: ServiceAction): ClientNeeds {
  return applyNeedDelta(needs, action.needs)
}

/** Coste en puntos de una noche gratis (canje). */
export const FREE_NIGHT_POINTS = 400

export function makeMissionsForDay(day: number): ClientMission[] {
  const seed = day % 7
  const dailyPool: Omit<ClientMission, 'createdDay'>[] = [
    {
      id: `d-night-${day}`,
      kind: 'daily',
      title: 'Dormir fuera',
      description: 'Completa 1 noche con check-in.',
      progress: 0,
      target: 1,
      rewardPoints: 80,
      rewardWallet: 500,
      done: false,
      claimed: false,
    },
    {
      id: `d-svc-${day}`,
      kind: 'daily',
      title: 'Probar servicios',
      description: 'Usa 3 servicios distintos en tu estancia.',
      progress: 0,
      target: 3,
      rewardPoints: 60,
      rewardWallet: 300,
      done: false,
      claimed: false,
    },
    {
      id: `d-spa-${day}`,
      kind: 'daily',
      title: 'Momento wellness',
      description: seed % 2 === 0 ? 'Usa el spa o la sauna.' : 'Come en el restaurante o room service.',
      progress: 0,
      target: 1,
      rewardPoints: 50,
      rewardWallet: 200,
      done: false,
      claimed: false,
    },
    {
      id: `d-play-${day}`,
      kind: 'daily',
      title: 'Jugar un rato',
      description: 'Completa 1 minijuego (casino, golf, buceo, pádel o cine).',
      progress: 0,
      target: 1,
      rewardPoints: 70,
      rewardWallet: 250,
      done: false,
      claimed: false,
    },
  ]

  // keep only 3 dailies rotating: night + svc + (spa OR play)
  const rotated =
    seed % 2 === 0
      ? [dailyPool[0], dailyPool[1], dailyPool[3]]
      : [dailyPool[0], dailyPool[1], dailyPool[2]]
  const dailyChosen = rotated

  const weekly: ClientMission[] = []
  if (day % 7 === 1 || day === 1) {
    weekly.push({
      id: `w-nights-${Math.floor(day / 7)}`,
      kind: 'weekly',
      title: 'Semana viajera',
      description: 'Acumula 3 noches esta semana.',
      progress: 0,
      target: 3,
      rewardPoints: 250,
      rewardWallet: 2_000,
      done: false,
      claimed: false,
      createdDay: day,
    })
    weekly.push({
      id: `w-brands-${Math.floor(day / 7)}`,
      kind: 'weekly',
      title: 'Coleccionista',
      description: 'Consigue 2 sellos de pasaporte nuevos.',
      progress: 0,
      target: 2,
      rewardPoints: 200,
      rewardWallet: 1_000,
      done: false,
      claimed: false,
      createdDay: day,
    })
  }

  return [...dailyChosen.map((m) => ({ ...m, createdDay: day })), ...weekly]
}

export function ensureMissions(missions: ClientMission[], missionsDay: number, day: number): {
  missions: ClientMission[]
  missionsDay: number
} {
  if (missionsDay === day && missions.length) return { missions, missionsDay }
  const weeklyKeep = missions.filter((m) => m.kind === 'weekly' && !m.claimed)
  const fresh = makeMissionsForDay(day)
  const dailies = fresh.filter((m) => m.kind === 'daily')
  const weeklies = missionsDay === 0 || day % 7 === 1 ? fresh.filter((m) => m.kind === 'weekly') : weeklyKeep
  return { missions: [...dailies, ...weeklies], missionsDay: day }
}

export function bumpMissions(
  missions: ClientMission[],
  predicate: (m: ClientMission) => boolean,
  amount = 1,
): ClientMission[] {
  return missions.map((m) => {
    if (m.claimed || m.done || !predicate(m)) return m
    const progress = Math.min(m.target, m.progress + amount)
    return { ...m, progress, done: progress >= m.target }
  })
}
