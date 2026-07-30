/**
 * Loterías inventadas Álora / Málaga / Andalucía (v0.7).
 * Cada una con mecánica, premio, horario y sabor propios.
 */

function L(id, name, org, tpvCategory, priceCents, drawDays, extra = {}) {
  const short =
    extra.short ||
    name
      .replace(/^El |^La |^Sorteo /i, '')
      .split(/\s+/)
      .slice(0, 2)
      .join(' ');
  return {
    id,
    name,
    short,
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
    flavor: '',
    prizeTier: org === 'Local' ? 'small' : org === 'Provincial' ? 'mid' : 'big',
    fractionable: false,
    reintegro: org !== 'Local',
    minAge: 18,
    ...extra,
  };
}

const AUTONOMICAS = [
  L('and-fortuna', 'Andalucía Fortuna', 'Autonómica', 'Autonómicas', 100, [5], {
    numberMode: '5from40', short: 'A. Fortuna', prizeTier: 'big', flavor: 'Viernes de bote',
    trait: 'Clásico 5/40', topPrizeHint: 'hasta 250.000 €',
    description: "El clásico andaluz del viernes: 5 del 1–40 con bote que crece. Ideal para la peña del pueblo.",
  }),
  L('and-olivo', 'El Olivo de la Suerte', 'Autonómica', 'Autonómicas', 150, [2], {
    numberMode: '6from36', commissionRate: 0.09, short: 'Olivo', prizeTier: 'big', flavor: 'Aceite y suerte',
    trait: '6/36', topPrizeHint: 'hasta 180.000 €',
    description: "Seis números entre olivos. Martes tranquilo, premio serio.",
  }),
  L('and-costa', 'Sorteo Costa del Sol', 'Autonómica', 'Autonómicas', 200, [6], {
    numberMode: 'nacional', fractionable: true, short: 'Costa Sol', prizeTier: 'big', flavor: 'Décimo playero',
    trait: 'Décimo 5 cifras', topPrizeHint: 'hasta 400.000 €',
    description: "Décimo playero de 5 cifras. Sábados con olor a chiringuito.",
  }),
  L('and-guadalquivir', 'Guadalquivir Oro', 'Autonómica', 'Autonómicas', 120, [3], {
    numberMode: '4from30', drawHour: 19, short: 'Guadalquivir', prizeTier: 'mid', flavor: 'Río de oro',
    trait: '4/30', topPrizeHint: 'hasta 120.000 €',
    description: "Cuatro del 1–30 a las 19:00. El río trae suerte a media tarde.",
  }),
  L('and-sierra', 'Sierra Nevada Suerte', 'Autonómica', 'Autonómicas', 180, [4], {
    numberMode: '7from45', commissionRate: 0.085, short: 'Sierra N.', prizeTier: 'big', flavor: 'Nieve y números',
    trait: '7/45', topPrizeHint: 'hasta 300.000 €',
    description: "Siete del 1–45: nieve, sierra y un bote que asusta.",
  }),
  L('and-alhambra', 'Alhambra Premia', 'Autonómica', 'Autonómicas', 250, [5], {
    numberMode: 'colorball', short: 'Alhambra', prizeTier: 'big', flavor: 'Colores nazaríes',
    trait: '4/30 + color', topPrizeHint: 'hasta 500.000 €',
    description: "Cuatro números y una bola de color nazarí (rojo, verde, azul u oro).",
  }),
  L('and-rocio', 'Rocío de la Fortuna', 'Autonómica', 'Autonómicas', 100, [1], {
    numberMode: 'triplex', short: 'Rocío', prizeTier: 'mid', flavor: 'Romería en cifras',
    trait: '3 cifras', topPrizeHint: 'hasta 80.000 €',
    description: '3 cifras. Lunes.',
  }),
  L('and-feria', 'Feria Andaluza', 'Autonómica', 'Autonómicas', 150, [6], {
    numberMode: 'carta', short: 'Feria And.', prizeTier: 'mid', flavor: 'Cartas de feria',
    trait: 'Baraja española', topPrizeHint: 'hasta 150.000 €',
    description: '3 cartas (palo + valor). Sábados.',
  }),
  L('and-levante', 'Levante Andaluz', 'Autonómica', 'Autonómicas', 90, [2], {
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, short: 'Levante', prizeTier: 'small', flavor: 'Viento de este',
    trait: 'Doble 1–20', topPrizeHint: 'hasta 40.000 €',
    description: '2 números del 1 al 20. Terminal.',
  }),
  L('and-poniente', 'Poniente de Suerte', 'Autonómica', 'Autonómicas', 110, [4], {
    numberMode: 'ruleta', short: 'Poniente', prizeTier: 'mid', flavor: 'Ruleta atlántica',
    trait: 'Ruleta 0–36', topPrizeHint: 'hasta 200.000 €',
    description: 'Un número de ruleta (0–36). Jueves.',
  }),
  L('and-azahar', 'Azahar Premiado', 'Autonómica', 'Autonómicas', 160, [3], {
    short: 'Azahar', prizeTier: 'mid', flavor: 'Azahar de Sevilla', topPrizeHint: 'hasta 90.000 €',
    numberMode: 'fecha', trait: 'Día + mes',
    description: 'Elige día (1–31) y mes (1–12).',
  }),
  L('and-duende', 'Duende Andaluz', 'Autonómica', 'Autonómicas', 220, [5], {
    short: 'Duende', prizeTier: 'big', flavor: 'Cante jondo', topPrizeHint: 'hasta 350.000 €',
    numberMode: 'bingo75', commissionRate: 0.075, trait: 'Bingo 5/75',
    description: '5 números del 1 al 75.',
  }),
  L('and-sol', 'Sol de Andalucía', 'Autonómica', 'Autonómicas', 100, [1, 4], {
    short: 'Sol And.', prizeTier: 'mid', flavor: 'Hora del sol', topPrizeHint: 'hasta 110.000 €',
    numberMode: 'horaSuerte', trait: 'Hora HH:MM',
    description: 'Marca una hora (00:00–23:59). Lunes y jueves.',
  }),
  L('and-luna', 'Luna Mora', 'Autonómica', 'Autonómicas', 140, [6], {
    short: 'Luna Mora', prizeTier: 'mid', flavor: 'Noche andaluza', topPrizeHint: 'hasta 95.000 €',
    numberMode: 'pares', trait: 'Par / impar',
    description: '5 casillas par/impar. Sábados.',
  }),
  L('and-patio', 'Patio Cordobés', 'Autonómica', 'Autonómicas', 130, [2], {
    short: 'Patio', prizeTier: 'mid', flavor: 'Patios de Córdoba', topPrizeHint: 'hasta 70.000 €',
    numberMode: 'dados', trait: '3 dados',
    description: '3 dados (1–6). Martes.',
  }),
];

const PROVINCIALES = [
  L('mal-premio', 'Premio Málaga', 'Provincial', 'Provinciales', 100, [4], {
    short: 'P. Málaga', prizeTier: 'mid', flavor: 'Capital de la Costa', topPrizeHint: 'hasta 100.000 €',
    numberMode: '5from40', trait: 'Provincial 5/40',
    description: "La provincial de los jueves. Cinco del 1–40 con sabor a capital.",
  }),
  L('mal-axarquia', 'Axarquía Premia', 'Provincial', 'Provinciales', 120, [3], {
    short: 'Axarquía', prizeTier: 'mid', flavor: 'Moscatel y sol', topPrizeHint: 'hasta 85.000 €',
    numberMode: '4from30', drawHour: 18, trait: '4/30 comarcal',
    description: '4 del 1–30. Miércoles 18:00.',
  }),
  L('mal-antequera', 'Antequera Fortuna', 'Provincial', 'Provinciales', 150, [2], {
    short: 'Antequera', prizeTier: 'mid', flavor: 'Décimo del Torcal', topPrizeHint: 'hasta 150.000 €',
    numberMode: 'nacional', fractionable: true, trait: 'Décimo antequerano',
    description: '5 cifras. Martes.',
  }),
  L('mal-ronda', 'Ronda de la Suerte', 'Provincial', 'Provinciales', 180, [5], {
    short: 'Ronda', prizeTier: 'mid', flavor: 'Puente y sierra', topPrizeHint: 'hasta 160.000 €',
    numberMode: '6from36', trait: '6/36 serranía',
    description: '6 del 1–36. Viernes.',
  }),
  L('mal-marbella', 'Marbella Gold', 'Provincial', 'Provinciales', 300, [6], {
    short: 'Marbella', prizeTier: 'big', flavor: 'Lujo terminal', topPrizeHint: 'hasta 2.000.000 €',
    numberMode: 'euro', stockType: 'terminal', orderDays: 0, commissionRate: 0.07,
    trait: '5/50 + 2 estrellas',
    description: 'Estilo Euromillones local (terminal).',
  }),
  L('mal-nerja', 'Nerja Balcón', 'Provincial', 'Provinciales', 90, [1], {
    short: 'Nerja', prizeTier: 'small', flavor: 'Balcón de Europa', topPrizeHint: 'hasta 45.000 €',
    numberMode: 'triplex', trait: '3 cifras cuevas',
    description: '3 cifras. Lunes.',
  }),
  L('mal-torre', 'Torremolinos Sol', 'Provincial', 'Provinciales', 110, [3], {
    short: 'Torre', prizeTier: 'small', flavor: 'Paseo marítimo', topPrizeHint: 'hasta 35.000 €',
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Doble playa',
    description: '2 del 1–20. Terminal.',
  }),
  L('mal-estepona', 'Estepona Orquídea', 'Provincial', 'Provinciales', 170, [4], {
    short: 'Estepona', prizeTier: 'mid', flavor: 'Orquídea costera', topPrizeHint: 'hasta 140.000 €',
    numberMode: 'colorball', trait: '4/30 + orquídea',
    description: '4 números + color.',
  }),
  L('mal-fuengirola', 'Fuengirola Playa', 'Provincial', 'Provinciales', 100, [5], {
    short: 'Fuengirola', prizeTier: 'mid', flavor: 'Ruleta de playa', topPrizeHint: 'hasta 120.000 €',
    numberMode: 'ruleta', trait: 'Ruleta costa',
    description: 'Número 0–36. Viernes.',
  }),
  L('mal-velez', 'Vélez-Málaga', 'Provincial', 'Provinciales', 130, [2], {
    short: 'Vélez', prizeTier: 'mid', flavor: 'Fecha de Axarquía', topPrizeHint: 'hasta 75.000 €',
    numberMode: 'fecha', trait: 'Fecha Axarquía',
    description: 'Día y mes. Martes.',
  }),
  L('mal-coin', 'Coín Valle', 'Provincial', 'Provinciales', 80, [6], {
    short: 'Coín', prizeTier: 'small', flavor: 'Huerta del valle', topPrizeHint: 'hasta 40.000 €',
    numberMode: 'dados', trait: 'Dados del valle',
    description: '3 dados. Sábados.',
  }),
  L('mal-alhaurin', 'Alhaurín Suerte', 'Provincial', 'Provinciales', 140, [3], {
    short: 'Alhaurín', prizeTier: 'mid', flavor: 'Jardín de Málaga', topPrizeHint: 'hasta 180.000 €',
    numberMode: '7from45', trait: '7/45 sierra',
    description: '7 del 1–45. Miércoles.',
  }),
  L('mal-cartama', 'Cártama Guadalhorce', 'Provincial', 'Provinciales', 95, [1], {
    short: 'Cártama', prizeTier: 'small', flavor: 'Orillas del río', topPrizeHint: 'hasta 50.000 €',
    numberMode: 'pares', trait: 'Par/impar río',
    description: '5 casillas par/impar. Lunes.',
  }),
  L('mal-archidona', 'Archidona Peña', 'Provincial', 'Provinciales', 160, [4], {
    short: 'Archidona', prizeTier: 'mid', flavor: 'Peña de la Ochavada', topPrizeHint: 'hasta 100.000 €',
    numberMode: 'carta', trait: 'Baraja peñera',
    description: '3 cartas españolas. Jueves.',
  }),
  L('mal-torcal', 'Torcal Mágico', 'Provincial', 'Provinciales', 200, [5], {
    short: 'Torcal', prizeTier: 'big', flavor: 'Piedra kárstica', topPrizeHint: 'hasta 220.000 €',
    numberMode: 'bingo75', trait: 'Bingo kárstico',
    description: '5/75. Viernes.',
  }),
  L('mal-caminito', 'Caminito del Rey', 'Provincial', 'Provinciales', 250, [6], {
    short: 'Caminito', prizeTier: 'big', flavor: 'Pasarelas y vértigo', topPrizeHint: 'hasta 280.000 €',
    numberMode: 'horaSuerte', commissionRate: 0.11, trait: 'Hora desfiladero',
    description: "Marca la hora de tu paseo por las pasarelas. Sábados de vértigo.",
  }),
  L('mal-chorro', 'Desfiladero del Chorro', 'Provincial', 'Provinciales', 150, [2], {
    short: 'El Chorro', prizeTier: 'mid', flavor: 'Embalse de noche', topPrizeHint: 'hasta 130.000 €',
    numberMode: '6from36', drawHour: 21, trait: '6/36 embalse',
    description: '6/36. Martes 21:00.',
  }),
  L('mal-montes', 'Montes de Málaga', 'Provincial', 'Provinciales', 115, [3], {
    short: 'Montes', prizeTier: 'mid', flavor: 'Mirador de pinos', topPrizeHint: 'hasta 70.000 €',
    numberMode: '4from30', trait: '4/30 montes',
    description: '4 del 1–30. Miércoles.',
  }),
];

const LOCALES = [
  L('alo-local', 'Álora Local', 'Local', 'Locales', 50, [5], {
    short: 'Álora Loc.', prizeTier: 'small', flavor: 'Serie del pueblo', topPrizeHint: 'hasta 15.000 €',
    numberMode: 'serieLocal', drawHour: 19, trait: 'Serie 000–999',
    description: "Serie del pueblo 000–999. Viernes a las 19:00 en la Plaza.",
  }),
  L('alo-hoya', 'Hoya de Málaga', 'Local', 'Locales', 100, [3], {
    short: 'Hoya', prizeTier: 'small', flavor: 'Valle dulce', topPrizeHint: 'hasta 40.000 €',
    numberMode: '5from40', trait: '5/40 valle',
    description: '5/40 de la Hoya. Miércoles.',
  }),
  L('alo-chorro', 'Suerte del Chorro', 'Local', 'Locales', 120, [6], {
    short: 'S. Chorro', prizeTier: 'mid', flavor: 'Décimo turístico', topPrizeHint: 'hasta 90.000 €',
    numberMode: 'nacional', fractionable: true, trait: 'Décimo turístico',
    description: "Décimo turístico de 5 cifras. El favorito de quien viene del Caminito.",
  }),
  L('alo-castillo', 'Castillo de Álora', 'Local', 'Locales', 100, [4], {
    short: 'Castillo', prizeTier: 'small', flavor: 'Torre del homenaje', topPrizeHint: 'hasta 25.000 €',
    numberMode: 'triplex', drawHour: 18, trait: '3 cifras castillo',
    description: '3 cifras. Jueves 18:00.',
  }),
  L('alo-flores', 'Virgen de Flores Lotería', 'Local', 'Locales', 150, [1], {
    short: 'V. Flores', prizeTier: 'mid', flavor: 'Patrona de Álora', topPrizeHint: 'hasta 60.000 €',
    numberMode: 'fecha', trait: 'Fecha patronal',
    description: "Rifa de la patrona: elige día y mes. Lunes con devoción.",
  }),
  L('alo-sanjuan', 'San Juan de Álora', 'Local', 'Locales', 80, [2], {
    short: 'San Juan', prizeTier: 'small', flavor: 'Hogueras de junio', topPrizeHint: 'hasta 30.000 €',
    numberMode: 'dados', trait: 'Dados de hogueras',
    description: '3 dados. Martes.',
  }),
  L('alo-estacion', 'Estación Guadalhorce', 'Local', 'Locales', 50, [5], {
    short: 'Estación', prizeTier: 'small', flavor: 'Andén Guadalhorce', topPrizeHint: 'hasta 20.000 €',
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Andén 1–20',
    description: '2 números. Terminal de estación.',
  }),
  L('alo-plaza', 'Plaza Baja Premia', 'Local', 'Locales', 60, [3], {
    short: 'Plaza Baja', prizeTier: 'small', flavor: 'Café y ruleta', topPrizeHint: 'hasta 22.000 €',
    numberMode: 'ruleta', trait: 'Ruleta de plaza',
    description: '0–36. Miércoles.',
  }),
  L('alo-real', 'Calle Real Suerte', 'Local', 'Locales', 70, [4], {
    short: 'C. Real', prizeTier: 'small', flavor: 'Portales pares', topPrizeHint: 'hasta 18.000 €',
    numberMode: 'pares', trait: 'Par/impar calle',
    description: '5 casillas par/impar. Jueves.',
  }),
  L('alo-puente', 'Puente de Álora', 'Local', 'Locales', 110, [6], {
    short: 'Puente', prizeTier: 'small', flavor: 'Arco sobre el río', topPrizeHint: 'hasta 35.000 €',
    numberMode: '4from30', trait: '4/30 puente',
    description: '4 del 1–30. Sábados.',
  }),
  L('alo-mirador', 'Mirador del Valle', 'Local', 'Locales', 130, [1], {
    short: 'Mirador', prizeTier: 'mid', flavor: 'Atardecer en el valle', topPrizeHint: 'hasta 55.000 €',
    numberMode: 'horaSuerte', trait: 'Hora del mirador',
    description: 'Elige la hora del atardecer.',
  }),
  L('alo-naranjo', 'Naranjo Dulce', 'Local', 'Locales', 40, [2], {
    short: 'Naranjo', prizeTier: 'small', flavor: 'Serie barata dulce', topPrizeHint: 'hasta 8.000 €',
    numberMode: 'serieLocal', commissionRate: 0.14, trait: 'Serie barata',
    description: 'Serie 000–999 a 0,40 €.',
  }),
  L('alo-aceite', 'Aceite de la Hoya', 'Local', 'Locales', 90, [5], {
    short: 'Aceite', prizeTier: 'small', flavor: 'Verde oliva', topPrizeHint: 'hasta 45.000 €',
    numberMode: 'colorball', trait: '4/30 + verde oliva',
    description: '4 números + color (aceite).',
  }),
  L('alo-feria', 'Feria de Álora Rifa', 'Local', 'Locales', 150, [6], {
    short: 'Feria Álora', prizeTier: 'mid', flavor: 'Caseta y baraja', topPrizeHint: 'hasta 70.000 €',
    numberMode: 'carta', trait: 'Baraja de feria',
    description: '3 cartas. Sábado de feria.',
  }),
  L('alo-verano', 'Verano en el Pueblo', 'Local', 'Locales', 100, [3], {
    short: 'Verano', prizeTier: 'mid', flavor: 'Bingo de terraza', topPrizeHint: 'hasta 80.000 €',
    numberMode: 'bingo75', seasonMonths: [6, 7, 8], trait: 'Bingo verano',
    description: '5/75. Más stock en verano.',
  }),
  L('alo-navidad', 'Navidad Aloreña', 'Local', 'Locales', 200, [], {
    short: 'Nav. Álora', prizeTier: 'big', flavor: 'Gordo del pueblo', topPrizeHint: 'hasta 200.000 €',
    numberMode: 'nacional', fractionable: true, seasonMonths: [11, 12], orderDays: 3,
    trait: 'Décimo navideño local',
    description: "El Gordo inventado del pueblo. Encarga con tiempo en noviembre.",
  }),
  L('pue-pizarra', 'Pizarra Vecina', 'Local', 'Locales', 50, [4], {
    short: 'Pizarra', prizeTier: 'small', flavor: 'Vecina del valle', topPrizeHint: 'hasta 12.000 €',
    numberMode: 'triplex', trait: '3 cifras vecina',
    description: '3 cifras. Jueves.',
  }),
  L('pue-carratraca', 'Carratraca Termal', 'Local', 'Locales', 100, [2], {
    short: 'Carratraca', prizeTier: 'mid', flavor: 'Baños termales', topPrizeHint: 'hasta 65.000 €',
    numberMode: '6from36', trait: '6/36 termal',
    description: '6/36. Martes.',
  }),
  L('pue-ardales', 'Ardales Embalse', 'Local', 'Locales', 110, [5], {
    short: 'Ardales', prizeTier: 'mid', flavor: 'Embalse Conde', topPrizeHint: 'hasta 95.000 €',
    numberMode: '7from45', trait: '7/45 embalse',
    description: '7 del 1–45. Viernes.',
  }),
  L('pue-elburgo', 'El Burgo Sierra', 'Local', 'Locales', 55, [1], {
    short: 'El Burgo', prizeTier: 'small', flavor: 'Pinsapar terminal', topPrizeHint: 'hasta 18.000 €',
    numberMode: '2from20', stockType: 'terminal', orderDays: 0, trait: 'Doble sierra',
    description: '2 del 1–20. Terminal.',
  }),
  L('pue-yunquera', 'Yunquera Pinsapo', 'Local', 'Locales', 100, [3], {
    short: 'Yunquera', prizeTier: 'small', flavor: 'Dados de la sierra', topPrizeHint: 'hasta 28.000 €',
    numberMode: 'dados', trait: 'Dados pinsapo',
    description: '3 dados. Miércoles.',
  }),
  L('pue-tolox', 'Tolox Fuente', 'Local', 'Locales', 45, [6], {
    short: 'Tolox', prizeTier: 'small', flavor: 'Fuente del pueblo', topPrizeHint: 'hasta 10.000 €',
    numberMode: 'serieLocal', trait: 'Serie fuente',
    description: '000–999. Sábados.',
  }),
  L('pue-casarabonela', 'Casarabonela', 'Local', 'Locales', 75, [4], {
    short: 'Casarabonela', prizeTier: 'small', flavor: 'Blanca de la sierra', topPrizeHint: 'hasta 16.000 €',
    numberMode: 'pares', trait: 'Par/impar blanca',
    description: '5 casillas. Jueves.',
  }),
  L('pue-alozaima', 'Alozaina Pasera', 'Local', 'Locales', 85, [2], {
    short: 'Alozaina', prizeTier: 'small', flavor: 'Pasera de uva', topPrizeHint: 'hasta 24.000 €',
    numberMode: 'fecha', trait: 'Fecha de pasera',
    description: 'Día + mes. Martes.',
  }),
  L('pue-guaro', 'Guaro Luna', 'Local', 'Locales', 95, [5], {
    short: 'Guaro', prizeTier: 'small', flavor: 'Luna de Guaro', topPrizeHint: 'hasta 32.000 €',
    numberMode: 'horaSuerte', trait: 'Hora lunar',
    description: 'Marca una hora. Viernes.',
  }),
];

export const REGIONAL_LOTTERIES = [...AUTONOMICAS, ...PROVINCIALES, ...LOCALES];
export const REGIONAL_IDS = REGIONAL_LOTTERIES.map((p) => p.id);
export const REGIONAL_NUMBER_MODES = [...new Set(REGIONAL_LOTTERIES.map((p) => p.numberMode))];
