/**
 * Tablón del pueblo — anuncios de Álora (v0.8).
 */
import { eventOn } from './events.js';
import { santosToday, birthdayBanner } from './birthdays.js';
import { getProduct } from './products.js';
import { todaysDrawDetails } from '../game/notices.js';
import { jackpotList } from '../game/jackpots.js';

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

  // Sorteos de hoy (reales)
  const draws = todaysDrawDetails(state);
  if (draws.length) {
    const byHour = {};
    for (const d of draws) {
      const h = d.hour ?? 21;
      if (!byHour[h]) byHour[h] = [];
      byHour[h].push(d);
    }
    const hours = Object.keys(byHour)
      .map(Number)
      .sort((a, b) => a - b);
    for (const h of hours) {
      const list = byHour[h];
      const names = list.map((d) => d.name).join(', ');
      const traits = list
        .filter((d) => d.trait)
        .slice(0, 4)
        .map((d) => `${d.name}: ${d.trait}`)
        .join(' · ');
      items.push({
        id: `draws-${ymd}-${h}`,
        kind: 'sorteo',
        title: `Hoy a las ${String(h).padStart(2, '0')}:00`,
        body: `${names}${traits ? ` · ${traits}` : ''}`,
      });
    }
  } else {
    items.push({
      id: `draws-none-${ymd}`,
      kind: 'sorteo',
      title: 'Sin sorteos programados hoy',
      body: 'Fin de semana o festivo de juegos: aprovecha para encargos y escaparate.',
    });
  }

  // Botes altos
  const jacks = jackpotList(state)
    .filter((j) => j.cents >= 2000000000)
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 4);
  if (jacks.length) {
    items.push({
      id: `jackpots-${ymd}`,
      kind: 'bote',
      title: 'Botes que tiran',
      body: jacks.map((j) => `${j.name} ${j.label}`).join(' · '),
    });
  }

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

  // Stock bajo (aviso oficina)
  const lowStock = Object.entries(state.stock || {})
    .filter(([, q]) => q != null && q <= 6)
    .slice(0, 4);
  if (lowStock.length) {
    const names = lowStock
      .map(([id, q]) => `${getProduct(id)?.short || getProduct(id)?.name || id} (${q})`)
      .join(' · ');
    items.push({
      id: `stock-${ymd}`,
      kind: 'stock',
      title: 'Inventario bajo',
      body: `Revisa pedidos: ${names}`,
    });
  }

  // Tip Miriam del día (rotativo)
  const tips = [
    'Si piden terminación, dicta el número completo antes de cobrar.',
    'Cuponazo los viernes: deja cambio menudos preparado.',
    'Premios de 400 € o más: papeleo breve aunque pagues de caja.',
    'Escaparate: rotula bien los décimos que más miran.',
    'Bizum a veces falla: ten plan B en efectivo.',
    'Los botes altos llenan la cola: ten rascas a mano.',
    'Al cerrar, imprime el PDF del día y exporta la partida.',
  ];
  const tipIdx = Number(ymd.replace(/\D/g, '')) % tips.length;
  items.push({
    id: `tip-${ymd}`,
    kind: 'tip',
    title: 'Consejo Miriam',
    body: tips[tipIdx],
  });

  // Frase del pueblo
  const pueblo = [
    'Hoy hay mercado: más vecinos al mediodía.',
    'Si hace calor, piden agua… y un rasca.',
    'Partido esta noche: Quiniela y Quinigol al acecho.',
    'Autobús del Caminito: turistas con tarjeta.',
    'Cola de la panadería se pasa a la administración.',
  ];
  items.push({
    id: `pueblo-${ymd}`,
    kind: 'pueblo',
    title: 'Álora hoy',
    body: pueblo[Number(ymd.slice(-2)) % pueblo.length],
  });

  // Extraordinarios / especiales
  const day = Number(ymd.slice(8, 10));
  if (month === 12 && day >= 1 && day <= 22) {
    items.push({
      id: 'gordo-count',
      kind: 'especial',
      title: 'Cuenta atrás del Gordo',
      body: `Faltan días para el 22. Prioriza encargos y series.`,
    });
  }

  return items;
}
