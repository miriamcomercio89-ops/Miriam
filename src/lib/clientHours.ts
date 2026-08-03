import type { HotelService } from '../types'

export type ServiceHoursStatus =
  | { open: true; surchargeMult: number; note: string }
  | { open: false; surchargeMult: 0; note: string; opensAt: string }

type Window = { start: number; end: number }

/** Ventanas en minutos del día [0, 1440). end < start = cruza medianoche. */
const HOURS: Partial<
  Record<
    HotelService,
    {
      windows: Window[]
      /** Si está fuera de ventana: cerrado (true) o recargo nocturno (false + mult). */
      closedOutside?: boolean
      nightMult?: number
      label: string
    }
  >
> = {
  restaurante: {
    windows: [
      { start: 7 * 60, end: 11 * 60 },
      { start: 13 * 60, end: 16 * 60 },
      { start: 19 * 60, end: 23 * 60 },
    ],
    closedOutside: true,
    label: 'Restaurante',
  },
  bar_azotea: {
    windows: [{ start: 12 * 60, end: 1 * 60 }],
    closedOutside: true,
    label: 'Bar',
  },
  spa: {
    windows: [{ start: 9 * 60, end: 21 * 60 }],
    closedOutside: true,
    label: 'Spa',
  },
  sauna: {
    windows: [{ start: 8 * 60, end: 22 * 60 }],
    closedOutside: true,
    label: 'Sauna',
  },
  piscina: {
    windows: [{ start: 8 * 60, end: 20 * 60 }],
    closedOutside: true,
    label: 'Piscina',
  },
  gimnasio: {
    windows: [{ start: 6 * 60, end: 23 * 60 }],
    closedOutside: false,
    nightMult: 1.15,
    label: 'Gimnasio',
  },
  tienda: {
    windows: [{ start: 10 * 60, end: 21 * 60 }],
    closedOutside: true,
    label: 'Tienda',
  },
  biblioteca: {
    windows: [{ start: 8 * 60, end: 22 * 60 }],
    closedOutside: true,
    label: 'Biblioteca',
  },
  medico: {
    windows: [{ start: 9 * 60, end: 19 * 60 }],
    closedOutside: false,
    nightMult: 1.4,
    label: 'Médico',
  },
  cine: {
    windows: [
      { start: 17 * 60, end: 18 * 60 },
      { start: 20 * 60, end: 21 * 60 },
      { start: 22 * 60 + 30, end: 23 * 60 + 30 },
    ],
    closedOutside: true,
    label: 'Cine',
  },
  teatro: {
    windows: [{ start: 20 * 60, end: 23 * 60 }],
    closedOutside: true,
    label: 'Teatro',
  },
  room_service_24h: {
    windows: [{ start: 0, end: 24 * 60 }],
    closedOutside: false,
    nightMult: 1.25,
    label: 'Room service',
  },
  all_inclusive: {
    windows: [{ start: 7 * 60, end: 22 * 60 + 30 }],
    closedOutside: false,
    nightMult: 1.1,
    label: 'Todo incluido',
  },
  lavanderia: {
    windows: [{ start: 8 * 60, end: 20 * 60 }],
    closedOutside: true,
    label: 'Lavandería',
  },
  kids_club: {
    windows: [{ start: 10 * 60, end: 18 * 60 }],
    closedOutside: true,
    label: 'Club infantil',
  },
  golf: {
    windows: [{ start: 8 * 60, end: 17 * 60 }],
    closedOutside: true,
    label: 'Golf',
  },
  casino: {
    windows: [{ start: 18 * 60, end: 4 * 60 }],
    closedOutside: true,
    label: 'Casino',
  },
  helipuerto: {
    windows: [{ start: 10 * 60, end: 18 * 60 }],
    closedOutside: true,
    label: 'Helipuerto',
  },
  buceo: {
    windows: [
      { start: 9 * 60 + 30, end: 12 * 60 },
      { start: 14 * 60 + 30, end: 17 * 60 },
    ],
    closedOutside: true,
    label: 'Buceo',
  },
  pista_padel: {
    windows: [{ start: 8 * 60, end: 22 * 60 }],
    closedOutside: true,
    label: 'Pádel',
  },
  coworking: {
    windows: [{ start: 7 * 60, end: 22 * 60 }],
    closedOutside: false,
    nightMult: 1.2,
    label: 'Coworking',
  },
}

function inWindow(minuteOfDay: number, w: Window): boolean {
  if (w.end > w.start) return minuteOfDay >= w.start && minuteOfDay < w.end
  // cruza medianoche
  return minuteOfDay >= w.start || minuteOfDay < w.end
}

function fmtMin(m: number): string {
  const x = ((m % 1440) + 1440) % 1440
  const h = Math.floor(x / 60)
  const min = x % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** Room service: recargo nocturno 00:00–06:00 aunque esté “24 h”. */
function roomServiceNight(minuteOfDay: number): boolean {
  return minuteOfDay < 6 * 60
}

export function serviceHoursStatus(service: HotelService, gameMinutes: number): ServiceHoursStatus {
  const minuteOfDay = ((Math.floor(gameMinutes) % 1440) + 1440) % 1440
  const cfg = HOURS[service]

  if (!cfg) {
    return { open: true, surchargeMult: 1, note: 'Abierto' }
  }

  if (service === 'room_service_24h') {
    if (roomServiceNight(minuteOfDay)) {
      return {
        open: true,
        surchargeMult: cfg.nightMult ?? 1.25,
        note: `Recargo nocturno ×${(cfg.nightMult ?? 1.25).toFixed(2)} (00:00–06:00)`,
      }
    }
    return { open: true, surchargeMult: 1, note: '24 h · tarifa normal' }
  }

  const openNow = cfg.windows.some((w) => inWindow(minuteOfDay, w))
  if (openNow) {
    return { open: true, surchargeMult: 1, note: `${cfg.label} abierto` }
  }

  if (cfg.closedOutside) {
    const next = cfg.windows[0]
    return {
      open: false,
      surchargeMult: 0,
      note: `${cfg.label} cerrado ahora`,
      opensAt: fmtMin(next.start),
    }
  }

  return {
    open: true,
    surchargeMult: cfg.nightMult ?? 1.2,
    note: `Fuera de horario · recargo ×${(cfg.nightMult ?? 1.2).toFixed(2)}`,
  }
}

export function clockFromGameMinutes(gameMinutes: number): string {
  const m = ((Math.floor(gameMinutes) % 1440) + 1440) % 1440
  return fmtMin(m)
}
