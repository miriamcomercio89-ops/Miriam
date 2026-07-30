/** Nombres andaluces / españoles para clientes de Álora */

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
  'Cruz', 'Calvo', 'Gallego', 'León', 'Vidal', 'Lozano', 'Herrera', 'Peña',
];

const STREETS = [
  'Calle Real', 'Calle Iglesia', 'Calle Ancha', 'Calle Nueva', 'Plaza Baja',
  'Calle Desfiladero', 'Camino de El Chorro', 'Calle Veracruz', 'Calle Lucena',
  'Avenida de Andalucía', 'Calle Estación', 'Calle Carrera', 'Calle Hoyo',
];

const PREFERENCES = [
  'lae-nacional', 'lae-primitiva', 'lae-bonoloto', 'lae-euromillones',
  'lae-quiniela', 'once-cupon', 'once-cuponazo', 'once-eurojackpot',
  'rasca-multiplica', 'rasca-diamante', 'rasca-7-vidas', 'rasca-oro',
  'rasca-once-clasico', 'and-fortuna', 'alo-local', 'mal-premio',
  'lae-navidad', 'lae-nino', 'once-sueldazo', 'rasca-jackpot',
];

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

/**
 * Genera cientos de clientes habituales + plantilla de visitantes.
 */
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

    list.push({
      id: `reg-${i + 1}`,
      name,
      regular: true,
      street: pick(rng, STREETS),
      age: 18 + Math.floor(rng() * 62),
      preferredProducts: [...prefs],
      // 0–1: probabilidad relativa de aparecer un día laborable
      visitChance: 0.02 + rng() * 0.08,
      patience: 0.4 + rng() * 0.6,
      prefersPayment: pick(rng, ['cash', 'cash', 'cash', 'card', 'bizum', 'transfer']),
      history: [],
    });
  }
  return list;
}

export function makeVisitor(rng = Math.random) {
  const r = typeof rng === 'function' ? rng : () => Math.random();
  const name = `${pick(r, FIRST_NAMES)} ${pick(r, LAST_NAMES)}`;
  return {
    id: `vis-${Date.now()}-${Math.floor(r() * 1e6)}`,
    name,
    regular: false,
    street: 'De paso',
    age: 18 + Math.floor(r() * 50),
    preferredProducts: [pick(r, PREFERENCES), pick(r, PREFERENCES)],
    visitChance: 0,
    patience: 0.3 + r() * 0.5,
    prefersPayment: pick(r, ['cash', 'cash', 'card', 'bizum']),
    history: [],
  };
}

export { PREFERENCES, FIRST_NAMES };
