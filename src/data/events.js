/**
 * Eventos locales de Álora ampliados (v0.4: más fiestas y ambiente).
 */
export function aloraEventsForYear(year) {
  return {
    // Semana Santa orientativa (fechas fijas aprox. para gameplay; no litúrgicas exactas)
    [`${year}-03-28`]: { id: 'ss-prev', name: 'Víspera Semana Santa', crowd: 0.4 },
    [`${year}-03-29`]: { id: 'ss', name: 'Semana Santa en Álora', crowd: 0.75 },
    [`${year}-04-01`]: { id: 'ss', name: 'Semana Santa en Álora', crowd: 0.8 },
    [`${year}-04-02`]: { id: 'ss', name: 'Jueves/Viernes Santo ambiente', crowd: 0.5 },

    [`${year}-05-01`]: { id: 'mayo', name: 'Fiesta del Trabajo / puente', crowd: 0.3 },
    [`${year}-05-15`]: { id: 'isidro', name: 'San Isidro (ambiente rural)', crowd: 0.35 },

    // Feria
    [`${year}-06-12`]: { id: 'feria-prep', name: 'Preparativos Feria de Álora', crowd: 0.3 },
    [`${year}-06-13`]: { id: 'feria-prep', name: 'Preparativos Feria de Álora', crowd: 0.45 },
    [`${year}-06-14`]: { id: 'feria', name: 'Feria de Álora', crowd: 0.95 },
    [`${year}-06-15`]: { id: 'feria', name: 'Feria de Álora', crowd: 1.1 },
    [`${year}-06-16`]: { id: 'feria', name: 'Feria de Álora', crowd: 1.0 },
    [`${year}-06-17`]: { id: 'feria', name: 'Cierre de Feria', crowd: 0.7 },

    [`${year}-06-23`]: { id: 'san-juan-v', name: 'Víspera de San Juan', crowd: 0.55 },
    [`${year}-06-24`]: { id: 'san-juan', name: 'San Juan (Álora)', crowd: 0.85, holidayAlso: true },

    [`${year}-07-16`]: { id: 'carmen', name: 'Virgen del Carmen (Costa)', crowd: 0.4 },
    [`${year}-07-25`]: { id: 'santiago', name: 'Santiago / verano en el valle', crowd: 0.45 },

    [`${year}-08-15`]: { id: 'verano', name: 'Asunción / verano en el pueblo', crowd: 0.35 },
    [`${year}-08-19`]: { id: 'caminito', name: 'Jornada turística Caminito', crowd: 0.55 },

    [`${year}-09-06`]: { id: 'flores-prep', name: 'Preparativos Virgen de Flores', crowd: 0.4 },
    [`${year}-09-07`]: { id: 'flores-víspera', name: 'Víspera Virgen de Flores', crowd: 0.65 },
    [`${year}-09-08`]: { id: 'virgen-flores', name: 'Virgen de Flores (Álora)', crowd: 1.05, holidayAlso: true },
    [`${year}-09-09`]: { id: 'flores-octava', name: 'Ambientación Virgen de Flores', crowd: 0.45 },

    [`${year}-10-12`]: { id: 'puente', name: 'Puente / fiesta nacional', crowd: 0.25 },
    [`${year}-10-31`]: { id: 'víspera-santos', name: 'Víspera de Todos los Santos', crowd: 0.25 },
    [`${year}-11-01`]: { id: 'santos', name: 'Todos los Santos', crowd: 0.2 },

    [`${year}-11-25`]: { id: 'pre-navidad', name: 'Primeros encargos de Navidad', crowd: 0.35 },

    // Navidad pueblo
    [`${year}-12-06`]: { id: 'constitucion', name: 'Puente de la Constitución', crowd: 0.4 },
    [`${year}-12-08`]: { id: 'inmaculada', name: 'Inmaculada / ambiente navideño', crowd: 0.5 },
    [`${year}-12-20`]: { id: 'navidad-cola', name: 'Colas de Navidad en Álora', crowd: 0.9 },
    [`${year}-12-22`]: { id: 'gordo', name: 'Día del Gordo (ambiente)', crowd: 1.2 },
    [`${year}-12-23`]: { id: 'navidad-cola', name: 'Últimos décimos', crowd: 0.85 },
    [`${year}-12-28`]: { id: 'inocentes', name: 'Santos Inocentes (ambiente)', crowd: 0.3 },
  };
}

export function buildAloraEvents(startYear, endYear) {
  const map = {};
  for (let y = startYear; y <= endYear; y++) Object.assign(map, aloraEventsForYear(y));
  return map;
}

export function eventOn(ymd, events) {
  return events?.[ymd] || null;
}
