/** Nombres y personalidad de clientes (sin slang andaluz) */

const FIRST_NAMES = [
  'Antonio', 'Manuel', 'José', 'Francisco', 'Juan', 'David', 'José Luis', 'Javier',
  'Carlos', 'Miguel', 'Rafael', 'Pedro', 'Ángel', 'Jesús', 'Luis', 'Alejandro',
  'María', 'Carmen', 'Ana', 'Isabel', 'Laura', 'Pilar', 'Dolores', 'Francisca',
  'Antonia', 'Josefa', 'Lucía', 'Elena', 'Sara', 'Paula', 'Cristina', 'Marta',
  'Rosa', 'Teresa', 'Patricia', 'Beatriz', 'Rocío', 'Inmaculada', 'Encarnación',
  'Soledad', 'Amparo', 'Remedios', 'Esperanza', 'Concepción', 'Mercedes',
  'Diego', 'Pablo', 'Sergio', 'Álvaro', 'Daniel', 'Adrián', 'Rubén', 'Iván',
  'Nuria', 'Silvia', 'Virginia', 'Alicia', 'Natalia', 'Irene', 'Claudia', 'Andrea',
];

const LAST_NAMES = [
  'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez',
  'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
  'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres',
  'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco',
  'Molina', 'Morales', 'Suárez', 'Ortega', 'Delgado', 'Castro', 'Ortiz',
  'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Núñez', 'Medina', 'Garrido', 'Cortes',
];

const STREETS = [
  'Calle Real', 'Calle Iglesia', 'Calle Ancha', 'Calle Nueva', 'Plaza Baja',
  'Calle Desfiladero', 'Camino de El Chorro', 'Calle Veracruz', 'Calle Lucena',
  'Avenida de Andalucía', 'Calle Estación', 'Calle Carrera', 'Calle Hoyo',
];

const PREFERENCES = [
  'lae-nacional', 'lae-primitiva', 'lae-bonoloto', 'lae-euromillones',
  'once-cupon', 'rasca-7-vidas', 'rasca-multiplica', 'rasca-diamante',
  'rasca-oro', 'rasca-jackpot', 'rasca-once-clasico', 'rasca-once-premium',
  'and-fortuna', 'alo-local', 'mal-premio', 'lae-navidad', 'lae-nino',
];

const TRAITS = [
  'constante', // viene días fijos
  'impulsiva', // cambia de producto
  'desconfiada', // pide comprobar mucho
  'generosa', // compra más cantidad
  'reservada', // habla poco
  'habladora', // comentario extra
  'suertuda', // cree en rachas
  'práctica', // va al grano
];

const LINES = {
  constante: ['Como cada semana.', 'Paso a por lo de siempre.'],
  impulsiva: ['Al final me llevo otra cosa.', 'He cambiado de idea.'],
  desconfiada: ['¿Me lo puedes comprobar bien?', 'Quiero asegurarme.'],
  generosa: ['Ponme un poco más.', 'Hoy me animo.'],
  reservada: ['Buenos días.', 'Esto, gracias.'],
  habladora: ['Menuda mañana lleva el pueblo.', '¿Hay mucho movimiento hoy?'],
  suertuda: ['Hoy me siento bien.', 'A ver si hay suerte.'],
  práctica: ['Vamos al grano.', '¿Cuánto es?'],
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateRegularCustomers(count = 280, seed = 2026) {
  const rng = mulberry32(seed);
  const used = new Set();
  const list = [];

  for (let i = 0; i < count; i++) {
    let name;
    let tries = 0;
    do {
      name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)} ${pick(rng, LAST_NAMES)}`;
      tries++;
    } while (used.has(name) && tries < 20);
    used.add(name);

    const prefs = new Set();
    const nPrefs = 1 + Math.floor(rng() * 3);
    for (let p = 0; p < nPrefs; p++) prefs.add(pick(rng, PREFERENCES));

    const trait = pick(rng, TRAITS);
    const preferredDays = [];
    const nDays = 1 + Math.floor(rng() * 3);
    for (let d = 0; d < nDays; d++) preferredDays.push(1 + Math.floor(rng() * 5)); // L-V

    list.push({
      id: `reg-${i + 1}`,
      name,
      regular: true,
      street: pick(rng, STREETS),
      age: 18 + Math.floor(rng() * 62),
      preferredProducts: [...prefs],
      visitChance: 0.02 + rng() * 0.08,
      patience: 0.4 + rng() * 0.6,
      prefersPayment: pick(rng, ['cash', 'cash', 'cash', 'card', 'bizum', 'transfer']),
      trait,
      preferredDays,
      line: pick(rng, LINES[trait]),
      history: [],
    });
  }
  return list;
}

export function makeVisitor(rng = Math.random) {
  const r = typeof rng === 'function' ? rng : () => Math.random();
  const trait = pick(r, TRAITS);
  return {
    id: `vis-${Date.now()}-${Math.floor(r() * 1e6)}`,
    name: `${pick(r, FIRST_NAMES)} ${pick(r, LAST_NAMES)}`,
    regular: false,
    street: 'De paso',
    age: 18 + Math.floor(r() * 50),
    preferredProducts: [pick(r, PREFERENCES), pick(r, PREFERENCES)],
    visitChance: 0,
    patience: 0.3 + r() * 0.5,
    prefersPayment: pick(r, ['cash', 'cash', 'card', 'bizum']),
    trait,
    preferredDays: [],
    line: pick(r, LINES[trait]),
    history: [],
  };
}

export function generateAbonadosAndPenas() {
  const base = generateRegularCustomers(40, 9090);
  const abonados = base.slice(0, 18).map((c, i) => ({
    ...c,
    id: `abo-${i + 1}`,
    kind: 'abonado',
    favoriteProduct: c.preferredProducts[0],
    subscription: 'Primitiva + Bonoloto semanal',
    prizesClaimed: [],
    orders: [],
  }));
  const penas = [
    {
      id: 'pena-1',
      kind: 'pena',
      name: 'Peña El Desfiladero',
      regular: true,
      street: 'Calle Real',
      preferredProducts: ['lae-euromillones', 'lae-primitiva', 'lae-nacional'],
      visitChance: 0.15,
      prefersPayment: 'transfer',
      trait: 'generosa',
      line: 'Para la peña, como cada semana.',
      favoriteProduct: 'lae-euromillones',
      subscription: 'Bote compartido Euromillones',
      members: 24,
      history: [],
      prizesClaimed: [],
      orders: [],
      preferredDays: [2, 5],
    },
    {
      id: 'pena-2',
      kind: 'pena',
      name: 'Peña Virgen de Flores',
      regular: true,
      street: 'Plaza Baja',
      preferredProducts: ['lae-nacional', 'lae-navidad', 'alo-local'],
      visitChance: 0.12,
      prefersPayment: 'cash',
      trait: 'constante',
      line: 'Décimos para la peña.',
      favoriteProduct: 'lae-nacional',
      subscription: 'Nacional jueves/sábado',
      members: 15,
      history: [],
      prizesClaimed: [],
      orders: [],
      preferredDays: [4, 6],
    },
    {
      id: 'pena-3',
      kind: 'pena',
      name: 'Peña del Chorro',
      regular: true,
      street: 'Camino de El Chorro',
      preferredProducts: ['lae-bonoloto', 'once-eurojackpot', 'rasca-jackpot'],
      visitChance: 0.1,
      prefersPayment: 'bizum',
      trait: 'habladora',
      line: 'Hoy venimos con lista larga.',
      favoriteProduct: 'lae-bonoloto',
      subscription: 'Bonoloto diario compartido',
      members: 30,
      history: [],
      prizesClaimed: [],
      orders: [],
      preferredDays: [1, 2, 3, 4, 5],
    },
  ];
  return { abonados, penas };
}

export { PREFERENCES, LINES, TRAITS };
