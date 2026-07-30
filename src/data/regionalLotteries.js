/**
 * Loterías inventadas Álora / Málaga / Andalucía (v0.5).
 * Cada una con mecánica, precio, horario y comisión propios.
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
    drawHour: 20,
    orderDays: 2,
    stockType: 'physical',
    checkable: true,
    needsNumbers: true,
    numberMode: '5from40',
    description: `${name} (inventada · ${org}).`,
    trait: '',
    topPrizeHint: '',
    fractionable: false,
    ...extra,
  };
}

const AUTONOMICAS = [
  L('and-fortuna', 'Andalucía Fortuna', 'Autonómica', 'Autonómicas', 100, [5], {
    numberMode: '5from40', trait: 'Clásico 5/40', topPrizeHint: 'Bote semanal',
    description: '5 números del 1 al 40. Viernes 20:00.',
  }),
  L('and-olivo', 'El Olivo de la Suerte', 'Autonómica', 'Autonómicas', 150, [2], {
    numberMode: '6from36', commissionRate: 0.09, trait: '6/36', topPrizeHint: 'Aceite de oro',
    description: '6 del 1–36. Martes.',
  }),
  L('and-costa', 'Sorteo Costa del Sol', 'Autonómica', 'Autonómicas', 200, [6], {
    numberMode: 'nacional', fractionable: true, trait: 'Décimo 5 cifras', topPrizeHint: 'Costa Gold',
    description: 'Número de 5 cifras. Sábados.',
  }),
  L('and-guadalquivir', 'Guadalquivir Oro', 'Autonómica', 'Autonómicas', 120, [3], {
    numberMode: '4from30', drawHour: 19, trait: '4/30', topPrizeHint: 'Lingote',
    description: '4 números del 1 al 30. Miércoles 19:00.',
  }),
  L('and-sierra', 'Sierra Nevada Suerte', 'Autonómica', 'Autonómicas', 180, [4], {
    numberMode: '7from45', commissionRate: 0.085, trait: '7/45', topPrizeHint: 'Cumbre',
    description: '7 números del 1 al 45. Jueves.',
  }),
  L('and-alhambra', 'Alhambra Premia', 'Autonómica', 'Autonómicas', 250, [5], {
    numberMode: 'colorball', trait: '4/30 + color', topPrizeHint: 'Nasrí',
    description: '4 del 1–30 y bola de color (rojo/verde/azul/oro).',
  }),
  L('and-rocio', 'Rocío de la Fortuna', 'Autonómica', 'Autonómicas', 100, [1], {
    numberMode: 'triplex', trait: '3 cifras', topPrizeHint: 'Romería',
    description: '3 cifras. Lunes.',
  }),
  L('and-feria', 'Feria Andaluza', 'Autonómica', 'Autonómicas', 150, [6], {
    numberMode: 'carta', trait: 'Baraja española', topPrizeHint: 'Reyes de oros',
    description: '3 cartas (palo + valor). Sábados.',
  }),
  L('and-levante', 'Levante Andaluz', 'Autonómica', 'Autonómicas', 90, [2], {
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Doble 1–20', topPrizeHint: 'Levante',
    description: '2 números del 1 al 20. Terminal.',
  }),
  L('and-poniente', 'Poniente de Suerte', 'Autonómica', 'Autonómicas', 110, [4], {
    numberMode: 'ruleta', trait: 'Ruleta 0–36', topPrizeHint: 'Pleno',
    description: 'Un número de ruleta (0–36). Jueves.',
  }),
  L('and-azahar', 'Azahar Premiado', 'Autonómica', 'Autonómicas', 160, [3], {
    numberMode: 'fecha', trait: 'Día + mes', topPrizeHint: 'Flor',
    description: 'Elige día (1–31) y mes (1–12).',
  }),
  L('and-duende', 'Duende Andaluz', 'Autonómica', 'Autonómicas', 220, [5], {
    numberMode: 'bingo75', commissionRate: 0.075, trait: 'Bingo 5/75', topPrizeHint: 'Duende mayor',
    description: '5 números del 1 al 75.',
  }),
  L('and-sol', 'Sol de Andalucía', 'Autonómica', 'Autonómicas', 100, [1, 4], {
    numberMode: 'horaSuerte', trait: 'Hora HH:MM', topPrizeHint: 'Mediodía',
    description: 'Marca una hora (00:00–23:59). Lunes y jueves.',
  }),
  L('and-luna', 'Luna Mora', 'Autonómica', 'Autonómicas', 140, [6], {
    numberMode: 'pares', trait: 'Par / impar', topPrizeHint: 'Luna llena',
    description: '5 casillas par/impar. Sábados.',
  }),
  L('and-patio', 'Patio Cordobés', 'Autonómica', 'Autonómicas', 130, [2], {
    numberMode: 'dados', trait: '3 dados', topPrizeHint: 'Patio de flores',
    description: '3 dados (1–6). Martes.',
  }),
];

const PROVINCIALES = [
  L('mal-premio', 'Premio Málaga', 'Provincial', 'Provinciales', 100, [4], {
    numberMode: '5from40', trait: 'Provincial 5/40', topPrizeHint: 'Capital',
    description: '5/40 provincial. Jueves.',
  }),
  L('mal-axarquia', 'Axarquía Premia', 'Provincial', 'Provinciales', 120, [3], {
    numberMode: '4from30', drawHour: 18, trait: '4/30 comarcal', topPrizeHint: 'Uva moscatel',
    description: '4 del 1–30. Miércoles 18:00.',
  }),
  L('mal-antequera', 'Antequera Fortuna', 'Provincial', 'Provinciales', 150, [2], {
    numberMode: 'nacional', fractionable: true, trait: 'Décimo antequerano', topPrizeHint: 'Torcal',
    description: '5 cifras. Martes.',
  }),
  L('mal-ronda', 'Ronda de la Suerte', 'Provincial', 'Provinciales', 180, [5], {
    numberMode: '6from36', trait: '6/36 serranía', topPrizeHint: 'Puente nuevo',
    description: '6 del 1–36. Viernes.',
  }),
  L('mal-marbella', 'Marbella Gold', 'Provincial', 'Provinciales', 300, [6], {
    numberMode: 'euro', stockType: 'terminal', orderDays: 0, commissionRate: 0.07,
    trait: '5/50 + 2 estrellas', topPrizeHint: 'Gold Mile',
    description: 'Estilo Euromillones local (terminal).',
  }),
  L('mal-nerja', 'Nerja Balcón', 'Provincial', 'Provinciales', 90, [1], {
    numberMode: 'triplex', trait: '3 cifras cuevas', topPrizeHint: 'Balcón de Europa',
    description: '3 cifras. Lunes.',
  }),
  L('mal-torre', 'Torremolinos Sol', 'Provincial', 'Provinciales', 110, [3], {
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Doble playa', topPrizeHint: 'Paseo',
    description: '2 del 1–20. Terminal.',
  }),
  L('mal-estepona', 'Estepona Orquídea', 'Provincial', 'Provinciales', 170, [4], {
    numberMode: 'colorball', trait: '4/30 + orquídea', topPrizeHint: 'Orquídea de oro',
    description: '4 números + color.',
  }),
  L('mal-fuengirola', 'Fuengirola Playa', 'Provincial', 'Provinciales', 100, [5], {
    numberMode: 'ruleta', trait: 'Ruleta costa', topPrizeHint: 'Sohail',
    description: 'Número 0–36. Viernes.',
  }),
  L('mal-velez', 'Vélez-Málaga', 'Provincial', 'Provinciales', 130, [2], {
    numberMode: 'fecha', trait: 'Fecha Axarquía', topPrizeHint: 'Fortaleza',
    description: 'Día y mes. Martes.',
  }),
  L('mal-coin', 'Coín Valle', 'Provincial', 'Provinciales', 80, [6], {
    numberMode: 'dados', trait: 'Dados del valle', topPrizeHint: 'Huerta',
    description: '3 dados. Sábados.',
  }),
  L('mal-alhaurin', 'Alhaurín Suerte', 'Provincial', 'Provinciales', 140, [3], {
    numberMode: '7from45', trait: '7/45 sierra', topPrizeHint: 'Jardín',
    description: '7 del 1–45. Miércoles.',
  }),
  L('mal-cartama', 'Cártama Guadalhorce', 'Provincial', 'Provinciales', 95, [1], {
    numberMode: 'pares', trait: 'Par/impar río', topPrizeHint: 'Guadalhorce',
    description: '5 casillas par/impar. Lunes.',
  }),
  L('mal-archidona', 'Archidona Peña', 'Provincial', 'Provinciales', 160, [4], {
    numberMode: 'carta', trait: 'Baraja peñera', topPrizeHint: 'Ochavada',
    description: '3 cartas españolas. Jueves.',
  }),
  L('mal-torcal', 'Torcal Mágico', 'Provincial', 'Provinciales', 200, [5], {
    numberMode: 'bingo75', trait: 'Bingo kárstico', topPrizeHint: 'Formaciones',
    description: '5/75. Viernes.',
  }),
  L('mal-caminito', 'Caminito del Rey', 'Provincial', 'Provinciales', 250, [6], {
    numberMode: 'horaSuerte', commissionRate: 0.11, trait: 'Hora desfiladero', topPrizeHint: 'Pasarela',
    description: 'Marca la hora de tu paseo. Sábados.',
  }),
  L('mal-chorro', 'Desfiladero del Chorro', 'Provincial', 'Provinciales', 150, [2], {
    numberMode: '6from36', drawHour: 21, trait: '6/36 embalse', topPrizeHint: 'Embalse',
    description: '6/36. Martes 21:00.',
  }),
  L('mal-montes', 'Montes de Málaga', 'Provincial', 'Provinciales', 115, [3], {
    numberMode: '4from30', trait: '4/30 montes', topPrizeHint: 'Mirador',
    description: '4 del 1–30. Miércoles.',
  }),
];

const LOCALES = [
  L('alo-local', 'Álora Local', 'Local', 'Locales', 50, [5], {
    numberMode: 'serieLocal', drawHour: 19, trait: 'Serie 000–999', topPrizeHint: 'Pueblo',
    description: 'Número local de 3 cifras. Viernes 19:00.',
  }),
  L('alo-hoya', 'Hoya de Málaga', 'Local', 'Locales', 100, [3], {
    numberMode: '5from40', trait: '5/40 valle', topPrizeHint: 'Hoya dulce',
    description: '5/40 de la Hoya. Miércoles.',
  }),
  L('alo-chorro', 'Suerte del Chorro', 'Local', 'Locales', 120, [6], {
    numberMode: 'nacional', fractionable: true, trait: 'Décimo turístico', topPrizeHint: 'Caminito',
    description: '5 cifras. Ideal turistas. Sábados.',
  }),
  L('alo-castillo', 'Castillo de Álora', 'Local', 'Locales', 100, [4], {
    numberMode: 'triplex', drawHour: 18, trait: '3 cifras castillo', topPrizeHint: 'Torre',
    description: '3 cifras. Jueves 18:00.',
  }),
  L('alo-flores', 'Virgen de Flores Lotería', 'Local', 'Locales', 150, [1], {
    numberMode: 'fecha', trait: 'Fecha patronal', topPrizeHint: 'Patrona',
    description: 'Rifa inventada de la patrona: día + mes.',
  }),
  L('alo-sanjuan', 'San Juan de Álora', 'Local', 'Locales', 80, [2], {
    numberMode: 'dados', trait: 'Dados de hogueras', topPrizeHint: 'Hoguera',
    description: '3 dados. Martes.',
  }),
  L('alo-estacion', 'Estación Guadalhorce', 'Local', 'Locales', 50, [5], {
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Andén 1–20', topPrizeHint: 'Tren',
    description: '2 números. Terminal de estación.',
  }),
  L('alo-plaza', 'Plaza Baja Premia', 'Local', 'Locales', 60, [3], {
    numberMode: 'ruleta', trait: 'Ruleta de plaza', topPrizeHint: 'Café',
    description: '0–36. Miércoles.',
  }),
  L('alo-real', 'Calle Real Suerte', 'Local', 'Locales', 70, [4], {
    numberMode: 'pares', trait: 'Par/impar calle', topPrizeHint: 'Portal',
    description: '5 casillas par/impar. Jueves.',
  }),
  L('alo-puente', 'Puente de Álora', 'Local', 'Locales', 110, [6], {
    numberMode: '4from30', trait: '4/30 puente', topPrizeHint: 'Arco',
    description: '4 del 1–30. Sábados.',
  }),
  L('alo-mirador', 'Mirador del Valle', 'Local', 'Locales', 130, [1], {
    numberMode: 'horaSuerte', trait: 'Hora del mirador', topPrizeHint: 'Atardecer',
    description: 'Elige la hora del atardecer.',
  }),
  L('alo-naranjo', 'Naranjo Dulce', 'Local', 'Locales', 40, [2], {
    numberMode: 'serieLocal', commissionRate: 0.14, trait: 'Serie barata', topPrizeHint: 'Naranja',
    description: 'Serie 000–999 a 0,40 €.',
  }),
  L('alo-aceite', 'Aceite de la Hoya', 'Local', 'Locales', 90, [5], {
    numberMode: 'colorball', trait: '4/30 + verde oliva', topPrizeHint: 'AOVE',
    description: '4 números + color (aceite).',
  }),
  L('alo-feria', 'Feria de Álora Rifa', 'Local', 'Locales', 150, [6], {
    numberMode: 'carta', trait: 'Baraja de feria', topPrizeHint: 'Caseta',
    description: '3 cartas. Sábado de feria.',
  }),
  L('alo-verano', 'Verano en el Pueblo', 'Local', 'Locales', 100, [3], {
    numberMode: 'bingo75', seasonMonths: [6, 7, 8], trait: 'Bingo verano', topPrizeHint: 'Terraza',
    description: '5/75. Más stock en verano.',
  }),
  L('alo-navidad', 'Navidad Aloreña', 'Local', 'Locales', 200, [], {
    numberMode: 'nacional', fractionable: true, seasonMonths: [11, 12], orderDays: 3,
    trait: 'Décimo navideño local', topPrizeHint: 'Gordo del pueblo',
    description: 'Sorteo local de Navidad (22 dic. inventado).',
  }),
  L('pue-pizarra', 'Pizarra Vecina', 'Local', 'Locales', 50, [4], {
    numberMode: 'triplex', trait: '3 cifras vecina', topPrizeHint: 'Pizarra',
    description: '3 cifras. Jueves.',
  }),
  L('pue-carratraca', 'Carratraca Termal', 'Local', 'Locales', 100, [2], {
    numberMode: '6from36', trait: '6/36 termal', topPrizeHint: 'Baños',
    description: '6/36. Martes.',
  }),
  L('pue-ardales', 'Ardales Embalse', 'Local', 'Locales', 110, [5], {
    numberMode: '7from45', trait: '7/45 embalse', topPrizeHint: 'Conde',
    description: '7 del 1–45. Viernes.',
  }),
  L('pue-elburgo', 'El Burgo Sierra', 'Local', 'Locales', 55, [1], {
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Doble sierra', topPrizeHint: 'Pinsapar',
    description: '2 del 1–20. Terminal.',
  }),
  L('pue-yunquera', 'Yunquera Pinsapo', 'Local', 'Locales', 100, [3], {
    numberMode: 'dados', trait: 'Dados pinsapo', topPrizeHint: 'Sierra de las Nieves',
    description: '3 dados. Miércoles.',
  }),
  L('pue-tolox', 'Tolox Fuente', 'Local', 'Locales', 45, [6], {
    numberMode: 'serieLocal', trait: 'Serie fuente', topPrizeHint: 'Agua',
    description: '000–999. Sábados.',
  }),
  L('pue-casarabonela', 'Casarabonela', 'Local', 'Locales', 75, [4], {
    numberMode: 'pares', trait: 'Par/impar blanca', topPrizeHint: 'Blanca',
    description: '5 casillas. Jueves.',
  }),
  L('pue-alozaima', 'Alozaina Pasera', 'Local', 'Locales', 85, [2], {
    numberMode: 'fecha', trait: 'Fecha de pasera', topPrizeHint: 'Uva pasa',
    description: 'Día + mes. Martes.',
  }),
  L('pue-guaro', 'Guaro Luna', 'Local', 'Locales', 95, [5], {
    numberMode: 'horaSuerte', trait: 'Hora lunar', topPrizeHint: 'Luna de Guaro',
    description: 'Marca una hora. Viernes.',
  }),
];

export const REGIONAL_LOTTERIES = [...AUTONOMICAS, ...PROVINCIALES, ...LOCALES];
export const REGIONAL_IDS = REGIONAL_LOTTERIES.map((p) => p.id);
export const REGIONAL_NUMBER_MODES = [...new Set(REGIONAL_LOTTERIES.map((p) => p.numberMode))];
