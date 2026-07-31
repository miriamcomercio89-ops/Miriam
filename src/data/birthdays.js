/**
 * Cumpleaños de clientes (día/mes) y santoral orientativo (gameplay).
 */

export const SANTOS = {
  '01-01': ['Manuel', 'Jesús'],
  '01-06': ['Reyes', 'Gaspar'],
  '01-17': ['Antonio'],
  '02-14': ['Valentín'],
  '03-19': ['José'],
  '04-23': ['Jorge'],
  '05-15': ['Isidro'],
  '06-13': ['Antonio'],
  '06-24': ['Juan', 'Juan'],
  '07-25': ['Santiago', 'Jaime'],
  '08-15': ['María', 'Asunción'],
  '09-08': ['María', 'Carmen'],
  '09-29': ['Miguel', 'Rafael', 'Gabriel'],
  '10-12': ['Pilar'],
  '11-01': ['Todos'],
  '11-30': ['Andrés'],
  '12-06': ['Nicolás'],
  '12-08': ['Inmaculada', 'Concepción'],
  '12-13': ['Lucía'],
  '12-25': ['Navidad'],
};

export function mmddFromYmd(ymd) {
  return ymd?.slice(5, 10) || '';
}

export function assignBirthday(rng) {
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function ensureCustomerBirthdays(list, seedBase = 4242) {
  if (!list?.length) return list;
  let i = 0;
  for (const c of list) {
    if (c.birthday) continue;
    // Deterministic-ish from id hash
    let h = seedBase + i++;
    const id = String(c.id || '');
    for (let k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
    const month = 1 + (h % 12);
    const day = 1 + ((h >>> 4) % 28);
    c.birthday = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return list;
}

export function santosToday(ymd) {
  const key = mmddFromYmd(ymd);
  return SANTOS[key] || [];
}

export function isBirthdayToday(client, ymd) {
  if (!client?.birthday) return false;
  return client.birthday === mmddFromYmd(ymd);
}

export function matchesSanto(client, ymd) {
  const names = santosToday(ymd);
  if (!names.length || names[0] === 'Todos' || names[0] === 'Navidad' || names[0] === 'Reyes') {
    return names[0] === 'Todos' || names[0] === 'Navidad';
  }
  const first = String(client.name || '').split(/\s+/)[0];
  return names.some((n) => first === n || first.startsWith(n));
}

export function birthdayBanner(state, ymd) {
  const mmdd = mmddFromYmd(ymd);
  const santos = santosToday(ymd);
  const parts = [];
  if (santos.length) parts.push(`Santoral: ${santos.join(', ')}`);
  const birthdays = [];
  for (const list of [state.customers.regulars, state.customers.abonados]) {
    for (const c of list || []) {
      if (c.birthday === mmdd) birthdays.push(c.name);
    }
  }
  if (birthdays.length) {
    parts.push(`Cumpleaños: ${birthdays.slice(0, 4).join(', ')}${birthdays.length > 4 ? '…' : ''}`);
  }
  return parts.join(' · ');
}
