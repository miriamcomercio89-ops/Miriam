import { SCRATCH_CARDS } from './scratch.js';

/**
 * Catálogo v0.1 — sorteos core bien hechos + 10 rascas + inventadas.
 */
export const PRODUCTS = [
  {
    id: 'lae-nacional',
    name: 'Lotería Nacional',
    org: 'LAE',
    category: 'sorteo',
    priceCents: 3000,
    commissionRate: 0.04,
    drawDays: [4, 6],
    drawHour: 21,
    orderDays: 2,
    stockType: 'physical',
    checkable: true,
    description: 'Décimos de Lotería Nacional (jueves y sábado).',
  },
  {
    id: 'lae-navidad',
    name: 'Sorteo de Navidad',
    org: 'LAE',
    category: 'especial',
    priceCents: 20000,
    commissionRate: 0.04,
    drawDays: [],
    seasonMonths: [10, 11, 12],
    orderDays: 3,
    stockType: 'physical',
    checkable: true,
    description: 'El Gordo de Navidad (20 € el décimo).',
  },
  {
    id: 'lae-nino',
    name: 'Sorteo del Niño',
    org: 'LAE',
    category: 'especial',
    priceCents: 20000,
    commissionRate: 0.04,
    drawDays: [],
    seasonMonths: [12, 1],
    orderDays: 3,
    stockType: 'physical',
    checkable: true,
    description: 'Sorteo Extraordinario del Niño.',
  },
  {
    id: 'lae-primitiva',
    name: 'La Primitiva',
    org: 'LAE',
    category: 'sorteo',
    priceCents: 100,
    commissionRate: 0.055,
    drawDays: [3, 6],
    drawHour: 21,
    orderDays: 0,
    stockType: 'terminal',
    checkable: true,
    description: '6 números del 1 al 49 + reintegro. Miércoles y sábado.',
    bet: { pick: 6, from: 49, reintegro: true },
  },
  {
    id: 'lae-bonoloto',
    name: 'Bonoloto',
    org: 'LAE',
    category: 'sorteo',
    priceCents: 50,
    commissionRate: 0.055,
    drawDays: [1, 2, 3, 4, 5, 6],
    drawHour: 21,
    orderDays: 0,
    stockType: 'terminal',
    checkable: true,
    description: '6/49 de lunes a sábado. Precio 0,50 €.',
    bet: { pick: 6, from: 49, reintegro: true },
  },
  {
    id: 'lae-euromillones',
    name: 'Euromillones',
    org: 'LAE',
    category: 'sorteo',
    priceCents: 250,
    commissionRate: 0.055,
    drawDays: [2, 5],
    drawHour: 21,
    orderDays: 0,
    stockType: 'terminal',
    checkable: true,
    description: '5/50 + 2 estrellas. Martes y viernes. 2,50 €.',
    bet: { pickMain: 5, fromMain: 50, pickStars: 2, fromStars: 12 },
  },
  {
    id: 'once-cupon',
    name: 'Cupón Diario ONCE',
    org: 'ONCE',
    category: 'sorteo',
    priceCents: 200,
    commissionRate: 0.05,
    drawDays: [1, 2, 3, 4, 5],
    drawHour: 21,
    orderDays: 1,
    stockType: 'physical',
    checkable: true,
    description: 'Cupón ordinario de lunes a viernes.',
  },
  // Inventadas
  {
    id: 'and-fortuna',
    name: 'Andalucía Fortuna',
    org: 'Autonómica',
    category: 'inventada',
    priceCents: 100,
    commissionRate: 0.08,
    drawDays: [5],
    drawHour: 20,
    orderDays: 2,
    stockType: 'physical',
    checkable: true,
    description: 'Sorteo ficticio andaluz semanal.',
  },
  {
    id: 'mal-premio',
    name: 'Premio Málaga',
    org: 'Provincial',
    category: 'inventada',
    priceCents: 100,
    commissionRate: 0.1,
    drawDays: [4],
    drawHour: 20,
    orderDays: 2,
    stockType: 'physical',
    checkable: true,
    description: 'Lotería provincial inventada de Málaga.',
  },
  {
    id: 'alo-local',
    name: 'Álora Local',
    org: 'Local',
    category: 'inventada',
    priceCents: 50,
    commissionRate: 0.12,
    drawDays: [5],
    drawHour: 19,
    orderDays: 1,
    stockType: 'physical',
    checkable: true,
    description: 'Rifa local inventada de Álora.',
  },
  // 10 rascas
  ...SCRATCH_CARDS.map((c) => ({
    ...c,
    category: 'rasca',
    stockType: 'physical',
    checkable: true,
    instant: true,
    drawDays: [],
  })),
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByOrg() {
  const map = {};
  for (const p of PRODUCTS) {
    if (!map[p.org]) map[p.org] = [];
    map[p.org].push(p);
  }
  return map;
}

/** Productos de sorteo comprobables (no rasca) */
export const CORE_DRAW_IDS = [
  'lae-nacional',
  'lae-primitiva',
  'lae-bonoloto',
  'lae-euromillones',
  'once-cupon',
];
