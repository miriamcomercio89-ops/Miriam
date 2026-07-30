/**
 * Festivos España + Andalucía + Málaga/Álora (aprox. realistas).
 * Incluye cálculo de Semana Santa (Viernes Santo).
 */

function easterSunday(year) {
  // Algoritmo de Meeus/Jones/Butcher
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Festivos fijos nacionales / autonómicos / locales por año */
export function holidaysForYear(year) {
  const fixed = [
    [`${year}-01-01`, 'Año Nuevo'],
    [`${year}-01-06`, 'Reyes'],
    [`${year}-02-28`, 'Día de Andalucía'],
    [`${year}-05-01`, 'Fiesta del Trabajo'],
    [`${year}-08-15`, 'Asunción de la Virgen'],
    [`${year}-10-12`, 'Fiesta Nacional de España'],
    [`${year}-11-01`, 'Todos los Santos'],
    [`${year}-12-06`, 'Día de la Constitución'],
    [`${year}-12-08`, 'Inmaculada Concepción'],
    [`${year}-12-25`, 'Navidad'],
    // Locales Álora / Málaga (orientativos)
    [`${year}-06-24`, 'San Juan (Álora)'],
    [`${year}-09-08`, 'Virgen de Flores (Álora)'],
  ];

  const easter = easterSunday(year);
  const goodFriday = addDays(easter, -2);
  const maundyThursday = addDays(easter, -3); // festivo en Andalucía

  const movable = [
    [ymd(maundyThursday), 'Jueves Santo'],
    [ymd(goodFriday), 'Viernes Santo'],
  ];

  return Object.fromEntries([...fixed, ...movable]);
}

export function buildHolidayMap(startYear, endYear) {
  const map = {};
  for (let y = startYear; y <= endYear; y++) {
    Object.assign(map, holidaysForYear(y));
  }
  return map;
}

export function isHoliday(ymdStr, holidayMap) {
  return Boolean(holidayMap[ymdStr]);
}

export function holidayName(ymdStr, holidayMap) {
  return holidayMap[ymdStr] || null;
}
