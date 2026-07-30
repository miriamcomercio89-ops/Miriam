/**
 * Loterías inventadas centradas en Álora / Málaga / Andalucía (v0.4).
 * Más de 50 tipos (autonómicas, provinciales, locales).
 */

function L(id, name, org, tpvCategory, priceCents, drawDays, extra = {}) {
  return {
    id,
    name,
    org,
    tpvCategory,
    category: 'inventada',
    priceCents,
    commissionRate: org === 'Local' ? 0.12 : org === 'Provincial' ? 0.1 : 0.08,
    drawDays,
    drawHour: extra.drawHour ?? 20,
    orderDays: extra.orderDays ?? 2,
    stockType: 'physical',
    checkable: true,
    needsNumbers: true,
    numberMode: extra.numberMode || '5from40',
    description: extra.description || `${name} (inventada · ${org}).`,
    ...extra,
  };
}

/** Autonómicas andaluzas inventadas */
const AUTONOMICAS = [
  L('and-fortuna', 'Andalucía Fortuna', 'Autonómica', 'Autonómicas', 100, [5]),
  L('and-olivo', 'El Olivo de la Suerte', 'Autonómica', 'Autonómicas', 150, [2]),
  L('and-costa', 'Sorteo Costa del Sol', 'Autonómica', 'Autonómicas', 200, [6]),
  L('and-guadalquivir', 'Guadalquivir Oro', 'Autonómica', 'Autonómicas', 100, [3]),
  L('and-sierra', 'Sierra Nevada Suerte', 'Autonómica', 'Autonómicas', 150, [4]),
  L('and-alhambra', 'Alhambra Premia', 'Autonómica', 'Autonómicas', 200, [5]),
  L('and-rocio', 'Rocío de la Fortuna', 'Autonómica', 'Autonómicas', 100, [1]),
  L('and-feria', 'Feria Andaluza', 'Autonómica', 'Autonómicas', 150, [6]),
  L('and-levante', 'Levante Andaluz', 'Autonómica', 'Autonómicas', 100, [2]),
  L('and-poniente', 'Poniente de Suerte', 'Autonómica', 'Autonómicas', 100, [4]),
  L('and-azahar', 'Azahar Premiado', 'Autonómica', 'Autonómicas', 150, [3]),
  L('and-duende', 'Duende Andaluz', 'Autonómica', 'Autonómicas', 200, [5]),
  L('and-sol', 'Sol de Andalucía', 'Autonómica', 'Autonómicas', 100, [1, 4]),
  L('and-luna', 'Luna Mora', 'Autonómica', 'Autonómicas', 150, [6]),
  L('and-patio', 'Patio Cordobés', 'Autonómica', 'Autonómicas', 100, [2]),
];

/** Provinciales Málaga y comarcas cercanas inventadas */
const PROVINCIALES = [
  L('mal-premio', 'Premio Málaga', 'Provincial', 'Provinciales', 100, [4]),
  L('mal-axarquia', 'Axarquía Premia', 'Provincial', 'Provinciales', 100, [3]),
  L('mal-antequera', 'Antequera Fortuna', 'Provincial', 'Provinciales', 100, [2]),
  L('mal-ronda', 'Ronda de la Suerte', 'Provincial', 'Provinciales', 150, [5]),
  L('mal-marbella', 'Marbella Gold', 'Provincial', 'Provinciales', 200, [6]),
  L('mal-nerja', 'Nerja Balcón', 'Provincial', 'Provinciales', 100, [1]),
  L('mal-torre', 'Torremolinos Sol', 'Provincial', 'Provinciales', 100, [3]),
  L('mal-estepona', 'Estepona Orquídea', 'Provincial', 'Provinciales', 150, [4]),
  L('mal-fuengirola', 'Fuengirola Playa', 'Provincial', 'Provinciales', 100, [5]),
  L('mal-velez', 'Vélez-Málaga', 'Provincial', 'Provinciales', 100, [2]),
  L('mal-coin', 'Coín Valle', 'Provincial', 'Provinciales', 100, [6]),
  L('mal-alhaurin', 'Alhaurín Suerte', 'Provincial', 'Provinciales', 100, [3]),
  L('mal-cartama', 'Cártama Guadalhorce', 'Provincial', 'Provinciales', 100, [1]),
  L('mal-archidona', 'Archidona Peña', 'Provincial', 'Provinciales', 100, [4]),
  L('mal-torcal', 'Torcal Mágico', 'Provincial', 'Provinciales', 150, [5]),
  L('mal-caminito', 'Caminito del Rey', 'Provincial', 'Provinciales', 200, [6]),
  L('mal-chorro', 'Desfiladero del Chorro', 'Provincial', 'Provinciales', 150, [2]),
  L('mal-montes', 'Montes de Málaga', 'Provincial', 'Provinciales', 100, [3]),
];

/** Locales Álora y pueblos del entorno inventadas */
const LOCALES = [
  L('alo-local', 'Álora Local', 'Local', 'Locales', 50, [5], { drawHour: 19 }),
  L('alo-hoya', 'Hoya de Málaga', 'Local', 'Locales', 100, [3]),
  L('alo-chorro', 'Suerte del Chorro', 'Local', 'Locales', 100, [6]),
  L('alo-castillo', 'Castillo de Álora', 'Local', 'Locales', 100, [4]),
  L('alo-flores', 'Virgen de Flores Lotería', 'Local', 'Locales', 150, [1], { description: 'Rifa local inventada (patrona).' }),
  L('alo-sanjuan', 'San Juan de Álora', 'Local', 'Locales', 100, [2]),
  L('alo-estacion', 'Estación Guadalhorce', 'Local', 'Locales', 50, [5]),
  L('alo-plaza', 'Plaza Baja Premia', 'Local', 'Locales', 50, [3]),
  L('alo-real', 'Calle Real Suerte', 'Local', 'Locales', 50, [4]),
  L('alo-puente', 'Puente de Álora', 'Local', 'Locales', 100, [6]),
  L('alo-mirador', 'Mirador del Valle', 'Local', 'Locales', 100, [1]),
  L('alo-naranjo', 'Naranjo Dulce', 'Local', 'Locales', 50, [2]),
  L('alo-aceite', 'Aceite de la Hoya', 'Local', 'Locales', 100, [5]),
  L('alo-feria', 'Feria de Álora Rifa', 'Local', 'Locales', 150, [6]),
  L('alo-verano', 'Verano en el Pueblo', 'Local', 'Locales', 100, [3]),
  L('alo-navidad', 'Navidad Aloreña', 'Local', 'Locales', 200, [], { seasonMonths: [11, 12], orderDays: 3 }),
  L('pue-pizarra', 'Pizarra Vecina', 'Local', 'Locales', 50, [4]),
  L('pue-carratraca', 'Carratraca Termal', 'Local', 'Locales', 100, [2]),
  L('pue-ardales', 'Ardales Embalse', 'Local', 'Locales', 100, [5]),
  L('pue-elburgo', 'El Burgo Sierra', 'Local', 'Locales', 50, [1]),
  L('pue-yunquera', 'Yunquera Pinsapo', 'Local', 'Locales', 100, [3]),
  L('pue-tolox', 'Tolox Fuente', 'Local', 'Locales', 50, [6]),
  L('pue-casarabonela', 'Casarabonela', 'Local', 'Locales', 50, [4]),
  L('pue-alozaima', 'Alozaina Pasera', 'Local', 'Locales', 50, [2]),
  L('pue-guaro', 'Guaro Luna', 'Local', 'Locales', 50, [5]),
];

export const REGIONAL_LOTTERIES = [...AUTONOMICAS, ...PROVINCIALES, ...LOCALES];

export const REGIONAL_IDS = REGIONAL_LOTTERIES.map((p) => p.id);
