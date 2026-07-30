/**
 * Eventos locales de Álora (aumentan afluencia y encargos).
 */
export function aloraEventsForYear(year) {
  return {
    [`${year}-06-13`]: { id: 'feria-prep', name: 'Preparativos Feria de Álora', crowd: 0.35 },
    [`${year}-06-14`]: { id: 'feria', name: 'Feria de Álora', crowd: 0.9 },
    [`${year}-06-15`]: { id: 'feria', name: 'Feria de Álora', crowd: 1.0 },
    [`${year}-06-16`]: { id: 'feria', name: 'Feria de Álora', crowd: 0.85 },
    [`${year}-06-24`]: { id: 'san-juan', name: 'San Juan (Álora)', crowd: 0.7, holidayAlso: true },
    [`${year}-09-07`]: { id: 'flores-víspera', name: 'Víspera Virgen de Flores', crowd: 0.5 },
    [`${year}-09-08`]: { id: 'virgen-flores', name: 'Virgen de Flores (Álora)', crowd: 0.95, holidayAlso: true },
    [`${year}-10-12`]: { id: 'puente', name: 'Puente / fiesta nacional', crowd: 0.2 },
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
