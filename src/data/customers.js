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
  const base = generateRegularCustomers(60, 9090);
  const subs = [
    'Primitiva + Bonoloto semanal',
    'Euromillones martes y viernes',
    'Nacional del sábado',
    'Cupón ONCE diario',
    'Bonoloto diario',
  ];
  const abonados = base.slice(0, 40).map((c, i) => ({
    ...c,
    id: `abo-${i + 1}`,
    kind: 'abonado',
    favoriteProduct: c.preferredProducts[0],
    subscription: subs[i % subs.length],
    prizesClaimed: [],
    orders: [],
  }));
  const penaDefs = [
    ['pena-1', 'Peña El Desfiladero', 'Calle Real', ['lae-euromillones', 'lae-primitiva'], 'Bote Euromillones', 24, [2, 5]],
    ['pena-2', 'Peña Virgen de Flores', 'Plaza Baja', ['lae-nacional', 'lae-navidad'], 'Nacional jueves/sábado', 15, [4, 6]],
    ['pena-3', 'Peña del Chorro', 'Camino de El Chorro', ['lae-bonoloto', 'once-eurojackpot'], 'Bonoloto diario', 30, [1, 2, 3, 4, 5]],
    ['pena-4', 'Peña Caminito', 'Avenida de Andalucía', ['lae-euromillones', 'rasca-jackpot'], 'Euromillones + rascas', 18, [2, 5]],
    ['pena-5', 'Peña San Juan', 'Calle Veracruz', ['once-cuponazo', 'lae-primitiva'], 'Cuponazo viernes', 12, [5]],
    ['pena-6', 'Peña Hoya Dulce', 'Calle Hoyo', ['lae-quiniela', 'lae-bonoloto'], 'Quiniela domingo', 20, [5, 0]],
    ['pena-7', 'Peña Estación', 'Calle Estación', ['lae-nacional', 'alo-local'], 'Décimos locales', 10, [4]],
    ['pena-8', 'Peña Guadalhorce', 'Calle Ancha', ['lae-gordo-primitiva', 'lae-primitiva'], 'Gordo + Primitiva', 22, [3, 6]],
  ];
  const penas = penaDefs.map(([id, name, street, prefs, subscription, members, preferredDays], i) => ({
    id,
    kind: 'pena',
    name,
    regular: true,
    street,
    preferredProducts: prefs,
    visitChance: 0.1 + (i % 3) * 0.02,
    prefersPayment: ['transfer', 'cash', 'bizum'][i % 3],
    trait: TRAITS[i % TRAITS.length],
    line: 'Pedido para la peña.',
    favoriteProduct: prefs[0],
    subscription,
    members,
    history: [],
    prizesClaimed: [],
    orders: [],
    preferredDays,
  }));
  return { abonados, penas };
}

export { PREFERENCES, LINES, TRAITS };
