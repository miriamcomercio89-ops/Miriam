/**
 * Tablón del pueblo — anuncios de Álora (v0.5).
 */
import { eventOn } from './events.js';
import { santosToday, birthdayBanner } from './birthdays.js';
import { getProduct } from './products.js';

export function buildTownBoard(state, ymd) {
  const items = [];
  const ev = eventOn(ymd, state.events);
  if (ev) {
    items.push({
      id: `ev-${ymd}`,
      kind: 'evento',
      title: ev.name,
      body: 'Hay más afluencia en la administración. Prepara cambio y stock.',
    });
  }

  const santos = santosToday(ymd);
  if (santos.length) {
    items.push({
      id: `santo-${ymd}`,
      kind: 'santoral',
      title: `Santoral: ${santos.join(', ')}`,
      body: 'Pueden pasar vecinos a por “lo del santo”.',
    });
  }

  const bday = birthdayBanner(state, ymd);
  if (bday.includes('Cumpleaños')) {
    items.push({
      id: `bday-${ymd}`,
      kind: 'cumple',
      title: 'Cumpleaños en el pueblo',
      body: bday,
    });
  }

  // Sorteos de hoy
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  const drawsToday = [];
  for (const p of state._productsCache || []) {
    /* filled by caller if needed */
  }
  void drawsToday;

  items.push({
    id: 'aviso-responsable',
    kind: 'aviso',
    title: 'Juego responsable',
    body: 'Solo mayores de 18. Fan-made / no oficial.',
  });

  const month = Number(ymd.slice(5, 7));
  if (month === 12 || month === 11) {
    items.push({
      id: 'navidad-board',
      kind: 'rifa',
      title: 'Encargos de Navidad',
      body: 'Recuerda los plazos de décimos de Navidad y El Niño.',
    });
  }
  if (month >= 6 && month <= 9) {
    items.push({
      id: 'turismo',
      kind: 'turismo',
      title: 'Temporada Caminito / El Chorro',
      body: 'Turistas piden rascas y Suerte del Chorro. Tarjeta al día.',
    });
  }

  // Rifa local inventada rotativa
  const localIds = ['alo-feria', 'alo-flores', 'alo-local', 'mal-caminito'];
  const idx = Number(ymd.replace(/\D/g, '')) % localIds.length;
  const pid = localIds[idx];
  const p = getProduct(pid);
  if (p) {
    items.push({
      id: `rifa-${pid}`,
      kind: 'rifa',
      title: `Rifa / sorteo: ${p.name}`,
      body: `${p.description || p.trait || ''} · ${p.topPrizeHint ? `Premio orientativo: ${p.topPrizeHint}` : ''}`,
    });
  }

  // Peña del día (si toca)
  if (state.ui?.penaDayNotice) {
    items.push({
      id: 'pena-day',
      kind: 'pena',
      title: state.ui.penaDayNotice.title,
      body: state.ui.penaDayNotice.body,
    });
  }

  return items;
}
