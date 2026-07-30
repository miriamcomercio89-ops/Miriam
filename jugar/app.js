(() => {
  // src/data/scratch.js
  var SCRATCH_CARDS = [
    {
      id: "rasca-7-vidas",
      name: "7 Vidas",
      org: "LAE",
      priceCents: 100,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 7e5,
      prizes: [
        { cents: 100, p: 0.18 },
        { cents: 200, p: 0.08 },
        { cents: 500, p: 0.04 },
        { cents: 1e3, p: 0.015 },
        { cents: 5e3, p: 4e-3 },
        { cents: 7e5, p: 5e-5 }
      ],
      description: "Rasca cl\xE1sico. Gana hasta 7.000 \u20AC."
    },
    {
      id: "rasca-multiplica",
      name: "Multiplica",
      org: "LAE",
      priceCents: 100,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 1e6,
      prizes: [
        { cents: 100, p: 0.16 },
        { cents: 200, p: 0.07 },
        { cents: 500, p: 0.035 },
        { cents: 2e3, p: 0.01 },
        { cents: 1e4, p: 2e-3 },
        { cents: 1e6, p: 4e-5 }
      ],
      description: "Multiplica tu suerte. Hasta 10.000 \u20AC."
    },
    {
      id: "rasca-cruz",
      name: "La Cruz",
      org: "LAE",
      priceCents: 100,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 5e5,
      prizes: [
        { cents: 100, p: 0.2 },
        { cents: 200, p: 0.06 },
        { cents: 500, p: 0.03 },
        { cents: 1e3, p: 0.012 },
        { cents: 5e5, p: 6e-5 }
      ],
      description: "Encuentra la cruz premiada."
    },
    {
      id: "rasca-diamante",
      name: "Diamante",
      org: "LAE",
      priceCents: 200,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 2e6,
      prizes: [
        { cents: 200, p: 0.15 },
        { cents: 400, p: 0.06 },
        { cents: 1e3, p: 0.03 },
        { cents: 5e3, p: 8e-3 },
        { cents: 2e4, p: 15e-4 },
        { cents: 2e6, p: 3e-5 }
      ],
      description: "Brilla el diamante. Hasta 20.000 \u20AC."
    },
    {
      id: "rasca-oro",
      name: "Al Oro",
      org: "LAE",
      priceCents: 200,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 25e5,
      prizes: [
        { cents: 200, p: 0.14 },
        { cents: 500, p: 0.05 },
        { cents: 1e3, p: 0.025 },
        { cents: 1e4, p: 4e-3 },
        { cents: 25e5, p: 25e-6 }
      ],
      description: "Ve a por el oro. Hasta 25.000 \u20AC."
    },
    {
      id: "rasca-triple",
      name: "Triple",
      org: "LAE",
      priceCents: 300,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 3e6,
      prizes: [
        { cents: 300, p: 0.13 },
        { cents: 600, p: 0.05 },
        { cents: 1500, p: 0.02 },
        { cents: 9e3, p: 5e-3 },
        { cents: 3e6, p: 2e-5 }
      ],
      description: "Tres oportunidades. Hasta 30.000 \u20AC."
    },
    {
      id: "rasca-jackpot",
      name: "Jackpot",
      org: "LAE",
      priceCents: 500,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 5e6,
      prizes: [
        { cents: 500, p: 0.12 },
        { cents: 1e3, p: 0.05 },
        { cents: 2500, p: 0.02 },
        { cents: 25e3, p: 3e-3 },
        { cents: 5e6, p: 15e-6 }
      ],
      description: "El jackpot instant\xE1neo. Hasta 50.000 \u20AC."
    },
    {
      id: "rasca-once-clasico",
      name: "Rasca ONCE Cl\xE1sico",
      org: "ONCE",
      priceCents: 100,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 1e6,
      prizes: [
        { cents: 100, p: 0.17 },
        { cents: 200, p: 0.07 },
        { cents: 500, p: 0.03 },
        { cents: 2e3, p: 8e-3 },
        { cents: 1e6, p: 4e-5 }
      ],
      description: "Rasca solidario cl\xE1sico."
    },
    {
      id: "rasca-once-x5",
      name: "Rasca ONCE \xD75",
      org: "ONCE",
      priceCents: 200,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 2e6,
      prizes: [
        { cents: 200, p: 0.14 },
        { cents: 500, p: 0.05 },
        { cents: 1e3, p: 0.025 },
        { cents: 1e4, p: 3e-3 },
        { cents: 2e6, p: 3e-5 }
      ],
      description: "Multiplica \xD75. Hasta 20.000 \u20AC."
    },
    {
      id: "rasca-once-premium",
      name: "Rasca ONCE Premium",
      org: "ONCE",
      priceCents: 500,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 1e7,
      prizes: [
        { cents: 500, p: 0.11 },
        { cents: 1e3, p: 0.04 },
        { cents: 5e3, p: 0.015 },
        { cents: 5e4, p: 2e-3 },
        { cents: 1e7, p: 1e-5 }
      ],
      description: "Premium. Hasta 100.000 \u20AC."
    }
  ];
  function rollScratchPrize(card, rng) {
    let r = rng();
    for (const tier of card.prizes) {
      if (r < tier.p) return tier.cents;
      r -= tier.p;
    }
    return 0;
  }

  // src/data/products.js
  var PRODUCTS = [
    {
      id: "lae-nacional",
      name: "Loter\xEDa Nacional",
      org: "LAE",
      category: "sorteo",
      priceCents: 3e3,
      commissionRate: 0.04,
      drawDays: [4, 6],
      drawHour: 21,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      description: "D\xE9cimos de Loter\xEDa Nacional (jueves y s\xE1bado)."
    },
    {
      id: "lae-navidad",
      name: "Sorteo de Navidad",
      org: "LAE",
      category: "especial",
      priceCents: 2e4,
      commissionRate: 0.04,
      drawDays: [],
      seasonMonths: [10, 11, 12],
      orderDays: 3,
      stockType: "physical",
      checkable: true,
      description: "El Gordo de Navidad (20 \u20AC el d\xE9cimo)."
    },
    {
      id: "lae-nino",
      name: "Sorteo del Ni\xF1o",
      org: "LAE",
      category: "especial",
      priceCents: 2e4,
      commissionRate: 0.04,
      drawDays: [],
      seasonMonths: [12, 1],
      orderDays: 3,
      stockType: "physical",
      checkable: true,
      description: "Sorteo Extraordinario del Ni\xF1o."
    },
    {
      id: "lae-primitiva",
      name: "La Primitiva",
      org: "LAE",
      category: "sorteo",
      priceCents: 100,
      commissionRate: 0.055,
      drawDays: [3, 6],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      description: "6 n\xFAmeros del 1 al 49 + reintegro. Mi\xE9rcoles y s\xE1bado.",
      bet: { pick: 6, from: 49, reintegro: true }
    },
    {
      id: "lae-bonoloto",
      name: "Bonoloto",
      org: "LAE",
      category: "sorteo",
      priceCents: 50,
      commissionRate: 0.055,
      drawDays: [1, 2, 3, 4, 5, 6],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      description: "6/49 de lunes a s\xE1bado. Precio 0,50 \u20AC.",
      bet: { pick: 6, from: 49, reintegro: true }
    },
    {
      id: "lae-euromillones",
      name: "Euromillones",
      org: "LAE",
      category: "sorteo",
      priceCents: 250,
      commissionRate: 0.055,
      drawDays: [2, 5],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      description: "5/50 + 2 estrellas. Martes y viernes. 2,50 \u20AC.",
      bet: { pickMain: 5, fromMain: 50, pickStars: 2, fromStars: 12 }
    },
    {
      id: "once-cupon",
      name: "Cup\xF3n Diario ONCE",
      org: "ONCE",
      category: "sorteo",
      priceCents: 200,
      commissionRate: 0.05,
      drawDays: [1, 2, 3, 4, 5],
      drawHour: 21,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      description: "Cup\xF3n ordinario de lunes a viernes."
    },
    // Inventadas
    {
      id: "and-fortuna",
      name: "Andaluc\xEDa Fortuna",
      org: "Auton\xF3mica",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.08,
      drawDays: [5],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      description: "Sorteo ficticio andaluz semanal."
    },
    {
      id: "mal-premio",
      name: "Premio M\xE1laga",
      org: "Provincial",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.1,
      drawDays: [4],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      description: "Loter\xEDa provincial inventada de M\xE1laga."
    },
    {
      id: "alo-local",
      name: "\xC1lora Local",
      org: "Local",
      category: "inventada",
      priceCents: 50,
      commissionRate: 0.12,
      drawDays: [5],
      drawHour: 19,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      description: "Rifa local inventada de \xC1lora."
    },
    // 10 rascas
    ...SCRATCH_CARDS.map((c) => ({
      ...c,
      category: "rasca",
      stockType: "physical",
      checkable: true,
      instant: true,
      drawDays: []
    }))
  ];
  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }
  var CORE_DRAW_IDS = [
    "lae-nacional",
    "lae-primitiva",
    "lae-bonoloto",
    "lae-euromillones",
    "once-cupon"
  ];

  // src/data/money.js
  var COINS = [
    { id: "c1", label: "1 c\xE9nt.", cents: 1, kind: "coin" },
    { id: "c2", label: "2 c\xE9nt.", cents: 2, kind: "coin" },
    { id: "c5", label: "5 c\xE9nt.", cents: 5, kind: "coin" },
    { id: "c10", label: "10 c\xE9nt.", cents: 10, kind: "coin" },
    { id: "c20", label: "20 c\xE9nt.", cents: 20, kind: "coin" },
    { id: "c50", label: "50 c\xE9nt.", cents: 50, kind: "coin" },
    { id: "e1", label: "1 \u20AC", cents: 100, kind: "coin" },
    { id: "e2", label: "2 \u20AC", cents: 200, kind: "coin" }
  ];
  var BILLS = [
    { id: "b5", label: "5 \u20AC", cents: 500, kind: "bill" },
    { id: "b10", label: "10 \u20AC", cents: 1e3, kind: "bill" },
    { id: "b20", label: "20 \u20AC", cents: 2e3, kind: "bill" },
    { id: "b50", label: "50 \u20AC", cents: 5e3, kind: "bill" },
    { id: "b100", label: "100 \u20AC", cents: 1e4, kind: "bill" },
    { id: "b200", label: "200 \u20AC", cents: 2e4, kind: "bill" },
    { id: "b500", label: "500 \u20AC", cents: 5e4, kind: "bill" }
  ];
  var ALL_DENOMS = [...BILLS, ...COINS];
  function emptyDrawer() {
    const d = {};
    for (const x of ALL_DENOMS) d[x.id] = 0;
    return d;
  }
  function defaultFloatDrawer() {
    return {
      b5: 10,
      b10: 8,
      b20: 6,
      b50: 2,
      b100: 0,
      b200: 0,
      b500: 0,
      e2: 15,
      e1: 20,
      c50: 20,
      c20: 25,
      c10: 30,
      c5: 40,
      c2: 50,
      c1: 50
    };
  }
  function drawerTotalCents(drawer) {
    return ALL_DENOMS.reduce((sum, d) => sum + (drawer[d.id] || 0) * d.cents, 0);
  }
  function countTotalCents(counts) {
    return ALL_DENOMS.reduce((sum, d) => sum + (counts[d.id] || 0) * d.cents, 0);
  }
  function formatEuro(cents) {
    const n = (cents / 100).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR"
    });
    return n;
  }
  function makeChange(drawer, changeCents) {
    if (changeCents < 0) return null;
    if (changeCents === 0) return emptyDrawer();
    const sorted = [...ALL_DENOMS].sort((a, b) => b.cents - a.cents);
    const result = emptyDrawer();
    let remaining = changeCents;
    const temp = { ...drawer };
    for (const d of sorted) {
      const available = temp[d.id] || 0;
      const need = Math.floor(remaining / d.cents);
      const take = Math.min(available, need);
      if (take > 0) {
        result[d.id] = take;
        remaining -= take * d.cents;
        temp[d.id] -= take;
      }
    }
    if (remaining !== 0) return null;
    return result;
  }
  function addToDrawer(drawer, counts) {
    const next = { ...drawer };
    for (const d of ALL_DENOMS) {
      next[d.id] = (next[d.id] || 0) + (counts[d.id] || 0);
    }
    return next;
  }
  function removeFromDrawer(drawer, counts) {
    const next = { ...drawer };
    for (const d of ALL_DENOMS) {
      const n = (next[d.id] || 0) - (counts[d.id] || 0);
      if (n < 0) return null;
      next[d.id] = n;
    }
    return next;
  }

  // src/data/holidays.js
  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = (h + l - 7 * m + 114) % 31 + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }
  function ymd(date) {
    return date.toISOString().slice(0, 10);
  }
  function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }
  function holidaysForYear(year) {
    const fixed = [
      [`${year}-01-01`, "A\xF1o Nuevo"],
      [`${year}-01-06`, "Reyes"],
      [`${year}-02-28`, "D\xEDa de Andaluc\xEDa"],
      [`${year}-05-01`, "Fiesta del Trabajo"],
      [`${year}-08-15`, "Asunci\xF3n de la Virgen"],
      [`${year}-10-12`, "Fiesta Nacional de Espa\xF1a"],
      [`${year}-11-01`, "Todos los Santos"],
      [`${year}-12-06`, "D\xEDa de la Constituci\xF3n"],
      [`${year}-12-08`, "Inmaculada Concepci\xF3n"],
      [`${year}-12-25`, "Navidad"],
      // Locales Álora / Málaga (orientativos)
      [`${year}-06-24`, "San Juan (\xC1lora)"],
      [`${year}-09-08`, "Virgen de Flores (\xC1lora)"]
    ];
    const easter = easterSunday(year);
    const goodFriday = addDays(easter, -2);
    const maundyThursday = addDays(easter, -3);
    const movable = [
      [ymd(maundyThursday), "Jueves Santo"],
      [ymd(goodFriday), "Viernes Santo"]
    ];
    return Object.fromEntries([...fixed, ...movable]);
  }
  function buildHolidayMap(startYear, endYear) {
    const map = {};
    for (let y = startYear; y <= endYear; y++) {
      Object.assign(map, holidaysForYear(y));
    }
    return map;
  }
  function isHoliday(ymdStr, holidayMap) {
    return Boolean(holidayMap[ymdStr]);
  }
  function holidayName(ymdStr, holidayMap) {
    return holidayMap[ymdStr] || null;
  }

  // src/data/customers.js
  var FIRST_NAMES = [
    "Antonio",
    "Manuel",
    "Jos\xE9",
    "Francisco",
    "Juan",
    "David",
    "Jos\xE9 Luis",
    "Javier",
    "Carlos",
    "Miguel",
    "Rafael",
    "Pedro",
    "\xC1ngel",
    "Jes\xFAs",
    "Luis",
    "Alejandro",
    "Mar\xEDa",
    "Carmen",
    "Ana",
    "Isabel",
    "Laura",
    "Pilar",
    "Dolores",
    "Francisca",
    "Antonia",
    "Josefa",
    "Luc\xEDa",
    "Elena",
    "Sara",
    "Paula",
    "Cristina",
    "Marta",
    "Rosa",
    "Teresa",
    "Patricia",
    "Beatriz",
    "Roc\xEDo",
    "Inmaculada",
    "Encarnaci\xF3n",
    "Soledad",
    "Amparo",
    "Remedios",
    "Esperanza",
    "Concepci\xF3n",
    "Mercedes",
    "Diego",
    "Pablo",
    "Sergio",
    "\xC1lvaro",
    "Daniel",
    "Adri\xE1n",
    "Rub\xE9n",
    "Iv\xE1n",
    "Nuria",
    "Silvia",
    "Virginia",
    "Alicia",
    "Natalia",
    "Irene",
    "Claudia",
    "Andrea"
  ];
  var LAST_NAMES = [
    "Garc\xEDa",
    "Gonz\xE1lez",
    "Rodr\xEDguez",
    "Fern\xE1ndez",
    "L\xF3pez",
    "Mart\xEDnez",
    "S\xE1nchez",
    "P\xE9rez",
    "G\xF3mez",
    "Mart\xEDn",
    "Jim\xE9nez",
    "Ruiz",
    "Hern\xE1ndez",
    "D\xEDaz",
    "Moreno",
    "Mu\xF1oz",
    "\xC1lvarez",
    "Romero",
    "Alonso",
    "Guti\xE9rrez",
    "Navarro",
    "Torres",
    "Dom\xEDnguez",
    "V\xE1zquez",
    "Ramos",
    "Gil",
    "Ram\xEDrez",
    "Serrano",
    "Blanco",
    "Molina",
    "Morales",
    "Su\xE1rez",
    "Ortega",
    "Delgado",
    "Castro",
    "Ortiz",
    "Rubio",
    "Mar\xEDn",
    "Sanz",
    "Iglesias",
    "N\xFA\xF1ez",
    "Medina",
    "Garrido",
    "Cortes"
  ];
  var STREETS = [
    "Calle Real",
    "Calle Iglesia",
    "Calle Ancha",
    "Calle Nueva",
    "Plaza Baja",
    "Calle Desfiladero",
    "Camino de El Chorro",
    "Calle Veracruz",
    "Calle Lucena",
    "Avenida de Andaluc\xEDa",
    "Calle Estaci\xF3n",
    "Calle Carrera",
    "Calle Hoyo"
  ];
  var PREFERENCES = [
    "lae-nacional",
    "lae-primitiva",
    "lae-bonoloto",
    "lae-euromillones",
    "once-cupon",
    "rasca-7-vidas",
    "rasca-multiplica",
    "rasca-diamante",
    "rasca-oro",
    "rasca-jackpot",
    "rasca-once-clasico",
    "rasca-once-premium",
    "and-fortuna",
    "alo-local",
    "mal-premio",
    "lae-navidad",
    "lae-nino"
  ];
  var TRAITS = [
    "constante",
    // viene días fijos
    "impulsiva",
    // cambia de producto
    "desconfiada",
    // pide comprobar mucho
    "generosa",
    // compra más cantidad
    "reservada",
    // habla poco
    "habladora",
    // comentario extra
    "suertuda",
    // cree en rachas
    "pr\xE1ctica"
    // va al grano
  ];
  var LINES = {
    constante: ["Como cada semana.", "Paso a por lo de siempre."],
    impulsiva: ["Al final me llevo otra cosa.", "He cambiado de idea."],
    desconfiada: ["\xBFMe lo puedes comprobar bien?", "Quiero asegurarme."],
    generosa: ["Ponme un poco m\xE1s.", "Hoy me animo."],
    reservada: ["Buenos d\xEDas.", "Esto, gracias."],
    habladora: ["Menuda ma\xF1ana lleva el pueblo.", "\xBFHay mucho movimiento hoy?"],
    suertuda: ["Hoy me siento bien.", "A ver si hay suerte."],
    pr\u00E1ctica: ["Vamos al grano.", "\xBFCu\xE1nto es?"]
  };
  function mulberry32(a) {
    return function() {
      let t = a += 1831565813;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }
  function generateRegularCustomers(count = 280, seed = 2026) {
    const rng = mulberry32(seed);
    const used = /* @__PURE__ */ new Set();
    const list = [];
    for (let i = 0; i < count; i++) {
      let name;
      let tries = 0;
      do {
        name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)} ${pick(rng, LAST_NAMES)}`;
        tries++;
      } while (used.has(name) && tries < 20);
      used.add(name);
      const prefs = /* @__PURE__ */ new Set();
      const nPrefs = 1 + Math.floor(rng() * 3);
      for (let p = 0; p < nPrefs; p++) prefs.add(pick(rng, PREFERENCES));
      const trait = pick(rng, TRAITS);
      const preferredDays = [];
      const nDays = 1 + Math.floor(rng() * 3);
      for (let d = 0; d < nDays; d++) preferredDays.push(1 + Math.floor(rng() * 5));
      list.push({
        id: `reg-${i + 1}`,
        name,
        regular: true,
        street: pick(rng, STREETS),
        age: 18 + Math.floor(rng() * 62),
        preferredProducts: [...prefs],
        visitChance: 0.02 + rng() * 0.08,
        patience: 0.4 + rng() * 0.6,
        prefersPayment: pick(rng, ["cash", "cash", "cash", "card", "bizum", "transfer"]),
        trait,
        preferredDays,
        line: pick(rng, LINES[trait]),
        history: []
      });
    }
    return list;
  }
  function makeVisitor(rng = Math.random) {
    const r = typeof rng === "function" ? rng : () => Math.random();
    const trait = pick(r, TRAITS);
    return {
      id: `vis-${Date.now()}-${Math.floor(r() * 1e6)}`,
      name: `${pick(r, FIRST_NAMES)} ${pick(r, LAST_NAMES)}`,
      regular: false,
      street: "De paso",
      age: 18 + Math.floor(r() * 50),
      preferredProducts: [pick(r, PREFERENCES), pick(r, PREFERENCES)],
      visitChance: 0,
      patience: 0.3 + r() * 0.5,
      prefersPayment: pick(r, ["cash", "cash", "card", "bizum"]),
      trait,
      preferredDays: [],
      line: pick(r, LINES[trait]),
      history: []
    };
  }

  // src/data/events.js
  function aloraEventsForYear(year) {
    return {
      [`${year}-06-13`]: { id: "feria-prep", name: "Preparativos Feria de \xC1lora", crowd: 0.35 },
      [`${year}-06-14`]: { id: "feria", name: "Feria de \xC1lora", crowd: 0.9 },
      [`${year}-06-15`]: { id: "feria", name: "Feria de \xC1lora", crowd: 1 },
      [`${year}-06-16`]: { id: "feria", name: "Feria de \xC1lora", crowd: 0.85 },
      [`${year}-06-24`]: { id: "san-juan", name: "San Juan (\xC1lora)", crowd: 0.7, holidayAlso: true },
      [`${year}-09-07`]: { id: "flores-v\xEDspera", name: "V\xEDspera Virgen de Flores", crowd: 0.5 },
      [`${year}-09-08`]: { id: "virgen-flores", name: "Virgen de Flores (\xC1lora)", crowd: 0.95, holidayAlso: true },
      [`${year}-10-12`]: { id: "puente", name: "Puente / fiesta nacional", crowd: 0.2 }
    };
  }
  function buildAloraEvents(startYear, endYear) {
    const map = {};
    for (let y = startYear; y <= endYear; y++) Object.assign(map, aloraEventsForYear(y));
    return map;
  }
  function eventOn(ymd2, events) {
    return (events == null ? void 0 : events[ymd2]) || null;
  }

  // src/game/state.js
  var STARTING_BANK_CENTS = 95e4;
  var SAVE_VERSION = 2;
  var GAME_VERSION = "0.1";
  var SLOT_COUNT = 3;
  var STORAGE_PREFIX = "loterias-alora-slot-";
  var OFFICE = {
    openHour: 8,
    closeHour: 20,
    town: "\xC1lora",
    province: "M\xE1laga",
    population: 13e3,
    employee: "Miriam",
    businessName: "Loter\xEDas \xC1lora"
  };
  var MONTHLY_EXPENSES = {
    rent: 65e3,
    electricity: 12e3,
    water: 3500,
    internet: 4500,
    insurance: 8e3,
    cleaning: 6e3,
    supplies: 4e3
  };
  function createNewGame(options = {}) {
    const start = options.startDate ? new Date(options.startDate) : new Date(Date.UTC(2026, 0, 7, 8, 0, 0));
    while (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
      start.setUTCDate(start.getUTCDate() + 1);
    }
    start.setUTCHours(8, 0, 0, 0);
    const float = defaultFloatDrawer();
    const holidays = buildHolidayMap(2025, 2032);
    const events = buildAloraEvents(2025, 2032);
    const stock = {};
    for (const p of PRODUCTS) {
      if (p.stockType === "physical") {
        stock[p.id] = p.category === "rasca" ? 50 : p.id.includes("navidad") || p.id.includes("nino") ? 25 : 35;
      } else {
        stock[p.id] = null;
      }
    }
    return {
      version: SAVE_VERSION,
      gameVersion: GAME_VERSION,
      meta: {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        playerName: OFFICE.employee,
        businessName: OFFICE.businessName,
        town: OFFICE.town
      },
      clock: {
        gameTimeMs: start.getTime(),
        speed: 1,
        paused: false,
        lastRealMs: Date.now()
      },
      office: {
        isOpen: true,
        openedToday: true,
        dayStarted: true
      },
      finance: {
        bankCents: STARTING_BANK_CENTS,
        drawer: float,
        floatTargetCents: drawerTotalCents(float),
        daySalesCents: 0,
        dayCommissionCents: 0,
        dayPrizesPaidCents: 0,
        dayPrizesReimbursableCents: 0,
        dayExpensesCents: 0,
        lastSettlement: null,
        ledger: []
      },
      stock,
      orders: [],
      reservations: [],
      tickets: [],
      draws: {},
      prizeManagement: [],
      nextIds: { ticket: 1 },
      customers: {
        regulars: generateRegularCustomers(280),
        queue: [],
        current: null,
        servedToday: 0,
        nextSpawnAtMs: start.getTime() + 12 * 1e3
      },
      dayLog: [],
      holidays,
      events,
      stats: {
        totalSalesCents: 0,
        totalCustomers: 0,
        daysPlayed: 0
      },
      ui: {
        screen: "counter",
        toast: null,
        paymentSession: null,
        lastTickets: [],
        lastCloseSummary: null
      }
    };
  }
  function migrateState(data) {
    if (!data) return createNewGame();
    if (!data.tickets) data.tickets = [];
    if (!data.draws) data.draws = {};
    if (!data.prizeManagement) data.prizeManagement = [];
    if (!data.events) data.events = buildAloraEvents(2025, 2032);
    if (!data.nextIds) data.nextIds = { ticket: 1 };
    if (data.finance && data.finance.dayPrizesReimbursableCents == null) {
      data.finance.dayPrizesReimbursableCents = 0;
    }
    data.version = SAVE_VERSION;
    data.gameVersion = GAME_VERSION;
    return data;
  }

  // src/game/time.js
  var BASE_SCALE = 0.25;
  function advanceClock(state2, nowRealMs = Date.now()) {
    const clock = state2.clock;
    if (clock.paused || clock.speed === 0) {
      clock.lastRealMs = nowRealMs;
      return state2;
    }
    const elapsed = Math.max(0, nowRealMs - clock.lastRealMs);
    const gameDelta = elapsed * BASE_SCALE * clock.speed;
    clock.gameTimeMs += gameDelta;
    clock.lastRealMs = nowRealMs;
    return state2;
  }
  function setSpeed(state2, speed) {
    state2.clock.speed = speed;
    state2.clock.paused = speed === 0;
    state2.clock.lastRealMs = Date.now();
    return state2;
  }
  function gameDate(state2) {
    return new Date(state2.clock.gameTimeMs);
  }
  function gameYmd(state2) {
    return gameDate(state2).toISOString().slice(0, 10);
  }
  function formatGameClock(state2) {
    const d = gameDate(state2);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  function isWeekend(state2) {
    const day = gameDate(state2).getUTCDay();
    return day === 0 || day === 6;
  }
  function isClosedDay(state2) {
    if (isWeekend(state2)) return true;
    return isHoliday(gameYmd(state2), state2.holidays);
  }
  function closedReason(state2) {
    if (isWeekend(state2)) {
      return gameDate(state2).getUTCDay() === 6 ? "S\xE1bado" : "Domingo";
    }
    const name = holidayName(gameYmd(state2), state2.holidays);
    if (name) return `Festivo: ${name}`;
    return null;
  }
  function isOpenHours(state2) {
    if (isClosedDay(state2)) return false;
    const h = gameDate(state2).getUTCHours() + gameDate(state2).getUTCMinutes() / 60;
    return h >= OFFICE.openHour && h < OFFICE.closeHour;
  }
  function nextBusinessDayStart(state2) {
    const d = gameDate(state2);
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(OFFICE.openHour, 0, 0, 0);
    let guard = 0;
    while (guard++ < 370) {
      const ymd2 = d.toISOString().slice(0, 10);
      const dow = d.getUTCDay();
      const closed = dow === 0 || dow === 6 || isHoliday(ymd2, state2.holidays);
      if (!closed) break;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return d;
  }
  function speedLabel(speed, paused) {
    if (paused || speed === 0) return "Pausa";
    if (speed === 1) return "Normal";
    if (speed === 15) return "R\xE1pido";
    if (speed === 60) return "Muy r\xE1pido";
    return `${speed}\xD7`;
  }

  // src/game/save.js
  function slotKey(slot) {
    return `${STORAGE_PREFIX}${slot}`;
  }
  function listSlots() {
    var _a, _b, _c;
    const slots = [];
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const raw = localStorage.getItem(slotKey(i));
      if (!raw) {
        slots.push({ slot: i, empty: true });
        continue;
      }
      try {
        const data = JSON.parse(raw);
        slots.push({
          slot: i,
          empty: false,
          meta: data.meta,
          gameTimeMs: (_a = data.clock) == null ? void 0 : _a.gameTimeMs,
          bankCents: (_b = data.finance) == null ? void 0 : _b.bankCents,
          daysPlayed: (_c = data.stats) == null ? void 0 : _c.daysPlayed,
          gameVersion: data.gameVersion || "0.0"
        });
      } catch (e) {
        slots.push({ slot: i, empty: true, corrupt: true });
      }
    }
    return slots;
  }
  function saveToSlot(state2, slot) {
    state2.meta.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    state2.version = SAVE_VERSION;
    localStorage.setItem(slotKey(slot), JSON.stringify(state2));
    state2.ui.toast = `Partida guardada en hueco ${slot}`;
    return state2;
  }
  function loadFromSlot(slot) {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    const data = migrateState(JSON.parse(raw));
    data.clock.lastRealMs = Date.now();
    data.ui = data.ui || { screen: "counter", toast: null, paymentSession: null };
    data.ui.paymentSession = null;
    data.ui.screen = "counter";
    return data;
  }
  function exportGame(state2) {
    const payload = {
      ...state2,
      meta: { ...state2.meta, exportedAt: (/* @__PURE__ */ new Date()).toISOString() }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ymd2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    a.href = url;
    a.download = `loterias-alora-${ymd2}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function importGame(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = migrateState(JSON.parse(reader.result));
          if (!data.clock || !data.finance) throw new Error("Archivo no v\xE1lido");
          data.clock.lastRealMs = Date.now();
          data.ui = data.ui || {};
          data.ui.paymentSession = null;
          data.ui.screen = "counter";
          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  function newGame() {
    return createNewGame();
  }

  // src/game/rng.js
  function mulberry322(seed) {
    let a = seed >>> 0;
    return function() {
      let t = a += 1831565813;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashSeed(...parts) {
    let h = 2166136261;
    const s = parts.join("|");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function pickUnique(rng, count, from) {
    const pool = Array.from({ length: from }, (_, i) => i + 1);
    const out = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rng() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out.sort((a, b) => a - b);
  }
  function pickInt(rng, min, maxInclusive) {
    return min + Math.floor(rng() * (maxInclusive - min + 1));
  }
  function pad5(n) {
    return String(n).padStart(5, "0");
  }

  // src/game/draws.js
  var DEFAULT_DRAW_HOUR = 21;
  function ymdFromDate(d) {
    return d.toISOString().slice(0, 10);
  }
  function drawKey(productId, ymd2) {
    return `${productId}@${ymd2}`;
  }
  function generateDrawResult(productId, ymd2) {
    const rng = mulberry322(hashSeed("draw", productId, ymd2));
    const p = getProduct(productId);
    if (!p) return null;
    if (productId === "lae-primitiva" || productId === "lae-bonoloto") {
      return {
        productId,
        ymd: ymd2,
        numbers: pickUnique(rng, 6, 49),
        complementary: productId === "lae-primitiva" ? pickInt(rng, 1, 49) : null,
        reintegro: pickInt(rng, 0, 9)
      };
    }
    if (productId === "lae-euromillones") {
      return {
        productId,
        ymd: ymd2,
        numbers: pickUnique(rng, 5, 50),
        stars: pickUnique(rng, 2, 12)
      };
    }
    if (productId === "lae-nacional" || productId === "lae-navidad" || productId === "lae-nino") {
      return {
        productId,
        ymd: ymd2,
        winningNumber: pad5(pickInt(rng, 0, 99999))
        // premios aproximados por terminaciones
      };
    }
    if (productId === "once-cupon") {
      return {
        productId,
        ymd: ymd2,
        winningNumber: pad5(pickInt(rng, 0, 99999))
      };
    }
    return {
      productId,
      ymd: ymd2,
      numbers: pickUnique(rng, 5, 40)
    };
  }
  function generateBetSelection(productId, rng) {
    const p = getProduct(productId);
    if (!p) return {};
    if (productId === "lae-primitiva" || productId === "lae-bonoloto") {
      return {
        numbers: pickUnique(rng, 6, 49),
        reintegro: pickInt(rng, 0, 9)
      };
    }
    if (productId === "lae-euromillones") {
      return {
        numbers: pickUnique(rng, 5, 50),
        stars: pickUnique(rng, 2, 12)
      };
    }
    if (productId === "lae-nacional" || productId === "lae-navidad" || productId === "lae-nino" || productId === "once-cupon") {
      return { number: pad5(pickInt(rng, 0, 99999)) };
    }
    return { numbers: pickUnique(rng, 5, 40) };
  }
  function nextDrawYmd(productId, fromDate) {
    var _a, _b;
    const p = getProduct(productId);
    if (!((_a = p == null ? void 0 : p.drawDays) == null ? void 0 : _a.length)) {
      if (productId === "lae-navidad") {
        const y = fromDate.getUTCFullYear();
        const target = new Date(Date.UTC(y, 11, 22));
        if (fromDate > target) return `${y + 1}-12-22`;
        return `${y}-12-22`;
      }
      if (productId === "lae-nino") {
        const y = fromDate.getUTCMonth() === 0 && fromDate.getUTCDate() <= 6 ? fromDate.getUTCFullYear() : fromDate.getUTCFullYear() + 1;
        return `${y}-01-06`;
      }
      return null;
    }
    const d = new Date(fromDate.getTime());
    for (let i = 0; i < 16; i++) {
      const dow = d.getUTCDay();
      if (p.drawDays.includes(dow)) {
        const hour = (_b = p.drawHour) != null ? _b : DEFAULT_DRAW_HOUR;
        if (i > 0 || fromDate.getUTCHours() < hour) {
          return ymdFromDate(d);
        }
      }
      d.setUTCDate(d.getUTCDate() + 1);
      d.setUTCHours(0, 0, 0, 0);
    }
    return null;
  }
  function ensureDrawsResolved(state2) {
    var _a, _b;
    if (!state2.draws) state2.draws = {};
    const now = gameDate(state2);
    const today = ymdFromDate(now);
    const hour = now.getUTCHours();
    const ids = [
      ...CORE_DRAW_IDS,
      "and-fortuna",
      "mal-premio",
      "alo-local",
      "lae-navidad",
      "lae-nino"
    ];
    for (let back = 0; back <= 14; back++) {
      const d = new Date(now.getTime());
      d.setUTCDate(d.getUTCDate() - back);
      d.setUTCHours(12, 0, 0, 0);
      const ymd2 = ymdFromDate(d);
      for (const productId of ids) {
        const p = getProduct(productId);
        if (!p) continue;
        const key = drawKey(productId, ymd2);
        if (state2.draws[key]) continue;
        let shouldResolve = false;
        if ((_a = p.drawDays) == null ? void 0 : _a.length) {
          if (!p.drawDays.includes(d.getUTCDay())) continue;
          const drawHour = (_b = p.drawHour) != null ? _b : DEFAULT_DRAW_HOUR;
          if (ymd2 < today) shouldResolve = true;
          else if (ymd2 === today && hour >= drawHour) shouldResolve = true;
        } else if (productId === "lae-navidad" && ymd2.endsWith("-12-22")) {
          shouldResolve = ymd2 < today || ymd2 === today && hour >= 21;
        } else if (productId === "lae-nino" && ymd2.endsWith("-01-06")) {
          shouldResolve = ymd2 < today || ymd2 === today && hour >= 21;
        }
        if (shouldResolve) {
          state2.draws[key] = generateDrawResult(productId, ymd2);
          state2.dayLog.push({
            at: state2.clock.gameTimeMs,
            text: `Sorteo resuelto: ${p.name} (${ymd2})`
          });
        }
      }
    }
    return state2;
  }
  function getDraw(state2, productId, ymd2) {
    var _a;
    return ((_a = state2.draws) == null ? void 0 : _a[drawKey(productId, ymd2)]) || null;
  }

  // src/game/tickets.js
  var LARGE_PRIZE_CENTS = 2e5;
  var HUGE_PRIZE_CENTS = 15e5;
  var ticketSeq = 1;
  function nextTicketId(state2) {
    state2.nextIds = state2.nextIds || { ticket: 1 };
    return `T-${state2.nextIds.ticket++}`;
  }
  function createTicketsFromSale(state2, { items, clientId, clientName, method }) {
    if (!state2.tickets) state2.tickets = [];
    const created = [];
    const rng = mulberry322(hashSeed("sale", state2.clock.gameTimeMs, clientId || "x", ticketSeq++));
    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      for (let q = 0; q < item.qty; q++) {
        const ticket = buildTicket(state2, product, clientId, clientName, rng);
        ticket.saleMethod = method;
        state2.tickets.push(ticket);
        created.push(ticket);
      }
    }
    return created;
  }
  function buildTicket(state2, product, clientId, clientName, rng) {
    const id = nextTicketId(state2);
    const base = {
      id,
      productId: product.id,
      productName: product.name,
      org: product.org,
      clientId,
      clientName,
      createdAt: state2.clock.gameTimeMs,
      priceCents: product.priceCents,
      status: "active",
      // active | checked | paid | managed | void
      prizeCents: 0,
      checkedAt: null,
      paidAt: null
    };
    if (product.category === "rasca") {
      const card = SCRATCH_CARDS.find((c) => c.id === product.id);
      const prize = card ? rollScratchPrize(card, rng) : 0;
      return {
        ...base,
        kind: "rasca",
        // premio oculto hasta comprobación
        hiddenPrizeCents: prize,
        selection: { code: `R${pad5(Math.floor(rng() * 1e5))}` }
      };
    }
    const drawYmd = nextDrawYmd(product.id, gameDate(state2));
    const selection = generateBetSelection(product.id, rng);
    return {
      ...base,
      kind: "draw",
      drawYmd,
      selection,
      hiddenPrizeCents: null
    };
  }
  function evaluateDrawPrize(ticket, draw) {
    if (!draw) return { prizeCents: 0, detail: "Sorteo a\xFAn no celebrado" };
    const id = ticket.productId;
    const sel = ticket.selection || {};
    if (id === "lae-primitiva" || id === "lae-bonoloto") {
      const hits2 = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
      const reintegroHit = sel.reintegro === draw.reintegro;
      let prize2 = 0;
      let detail = `${hits2} aciertos`;
      if (hits2 === 6) prize2 = id === "lae-primitiva" ? 8e7 : 4e7;
      else if (hits2 === 5) prize2 = id === "lae-primitiva" ? 12e4 : 4e4;
      else if (hits2 === 4) prize2 = 2500;
      else if (hits2 === 3) prize2 = 800;
      else if (reintegroHit) {
        prize2 = getProduct(id).priceCents;
        detail = "Reintegro";
      } else detail = "Sin premio";
      return { prizeCents: prize2, detail, hits: hits2 };
    }
    if (id === "lae-euromillones") {
      const hits2 = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
      const stars = (sel.stars || []).filter((n) => draw.stars.includes(n)).length;
      let prize2 = 0;
      if (hits2 === 5 && stars === 2) prize2 = 5e9;
      else if (hits2 === 5 && stars === 1) prize2 = 25e6;
      else if (hits2 === 5) prize2 = 4e6;
      else if (hits2 === 4 && stars === 2) prize2 = 15e4;
      else if (hits2 === 4 && stars === 1) prize2 = 25e3;
      else if (hits2 === 3 && stars === 2) prize2 = 8e3;
      else if (hits2 === 3 && stars === 1) prize2 = 1200;
      else if (hits2 === 2 && stars === 2) prize2 = 1500;
      else if (hits2 === 3) prize2 = 1e3;
      else if (hits2 === 1 && stars === 2) prize2 = 800;
      else if (stars === 2) prize2 = 600;
      const detail = prize2 ? `${hits2}+${stars} estrellas` : "Sin premio";
      return { prizeCents: prize2, detail, hits: hits2, stars };
    }
    if (id === "lae-nacional" || id === "lae-navidad" || id === "lae-nino" || id === "once-cupon") {
      const mine = String(sel.number || "");
      const win = String(draw.winningNumber || "");
      let prize2 = 0;
      let detail = "Sin premio";
      if (mine === win) {
        prize2 = id === "once-cupon" ? 35e6 : id === "lae-nacional" ? 3e7 : 4e8;
        detail = "N\xFAmero completo";
      } else if (mine.slice(-4) === win.slice(-4)) {
        prize2 = id === "once-cupon" ? 5e4 : 1e5;
        detail = "4 \xFAltimas cifras";
      } else if (mine.slice(-3) === win.slice(-3)) {
        prize2 = id === "once-cupon" ? 2e3 : 1e4;
        detail = "3 \xFAltimas cifras";
      } else if (mine.slice(-2) === win.slice(-2)) {
        prize2 = id === "once-cupon" ? 400 : 3e3;
        detail = "2 \xFAltimas cifras (aproximaci\xF3n)";
      } else if (mine.slice(-1) === win.slice(-1)) {
        prize2 = getProduct(id).priceCents;
        detail = "Reintegro (\xFAltima cifra)";
      }
      return { prizeCents: prize2, detail };
    }
    const hits = (sel.numbers || []).filter((n) => (draw.numbers || []).includes(n)).length;
    const table = { 5: 5e5, 4: 2e4, 3: 2e3, 2: 200 };
    const prize = table[hits] || 0;
    return { prizeCents: prize, detail: prize ? `${hits} aciertos` : "Sin premio", hits };
  }
  function checkTicket(state2, ticketId) {
    const ticket = state2.tickets.find((t) => t.id === ticketId);
    if (!ticket) return { ok: false, message: "Ticket no encontrado" };
    if (ticket.status === "paid") return { ok: false, message: "Este premio ya est\xE1 pagado", ticket };
    if (ticket.status === "managed") return { ok: false, message: "Premio en gesti\xF3n", ticket };
    if (ticket.kind === "rasca") {
      ticket.prizeCents = ticket.hiddenPrizeCents || 0;
      ticket.checkedAt = state2.clock.gameTimeMs;
      ticket.status = "checked";
      ticket.checkDetail = ticket.prizeCents ? `Premio rasca ${formatEuro(ticket.prizeCents)}` : "Sin premio";
      return {
        ok: true,
        ticket,
        prizeCents: ticket.prizeCents,
        detail: ticket.checkDetail,
        large: ticket.prizeCents >= LARGE_PRIZE_CENTS
      };
    }
    const draw = getDraw(state2, ticket.productId, ticket.drawYmd);
    if (!draw) {
      return {
        ok: true,
        ticket,
        prizeCents: 0,
        pending: true,
        detail: `Sorteo del ${ticket.drawYmd} a\xFAn no celebrado`
      };
    }
    const result = evaluateDrawPrize(ticket, draw);
    ticket.prizeCents = result.prizeCents;
    ticket.checkedAt = state2.clock.gameTimeMs;
    ticket.status = "checked";
    ticket.checkDetail = result.detail;
    return {
      ok: true,
      ticket,
      prizeCents: result.prizeCents,
      detail: result.detail,
      large: result.prizeCents >= LARGE_PRIZE_CENTS,
      huge: result.prizeCents >= HUGE_PRIZE_CENTS
    };
  }
  function ticketsForClient(state2, clientId) {
    return (state2.tickets || []).filter((t) => t.clientId === clientId);
  }
  function formatSelection(ticket) {
    const s = ticket.selection || {};
    if (ticket.kind === "rasca") return `C\xF3digo ${s.code || "\u2014"}`;
    if (s.number) return `N\xBA ${s.number}`;
    if (s.stars) return `${(s.numbers || []).join(", ")} \u2605 ${(s.stars || []).join(", ")}`;
    if (s.numbers) {
      const extra = s.reintegro != null ? ` \xB7 R${s.reintegro}` : "";
      return `${(s.numbers || []).join(", ")}${extra}`;
    }
    return "\u2014";
  }

  // src/game/cash.js
  function startPayment(state2, { items, client, purpose = "sale" }) {
    const totalCents = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
    state2.ui.paymentSession = {
      purpose,
      clientId: (client == null ? void 0 : client.id) || null,
      clientName: (client == null ? void 0 : client.name) || "Cliente",
      preferredPayment: (client == null ? void 0 : client.prefersPayment) || "cash",
      items,
      totalCents,
      method: null,
      // cash | card | bizum | transfer
      tendered: emptyDrawer(),
      // lo que da el cliente
      changeGiven: emptyDrawer(),
      // lo que eliges devolver
      step: "method",
      // method | cash-tender | cash-change | done
      error: null
    };
    state2.ui.screen = "cash";
    return state2;
  }
  function selectPaymentMethod(state2, method) {
    const ps = state2.ui.paymentSession;
    if (!ps) return state2;
    ps.method = method;
    ps.error = null;
    if (method === "cash") {
      ps.step = "cash-tender";
      ps.tendered = emptyDrawer();
      ps.changeGiven = emptyDrawer();
    } else {
      completeNonCash(state2);
    }
    return state2;
  }
  function completeNonCash(state2) {
    const ps = state2.ui.paymentSession;
    applySaleAccounting(state2, ps, ps.method);
    ps.step = "done";
    state2.ui.toast = `Cobrado ${formatEuro(ps.totalCents)} por ${labelMethod(ps.method)}`;
    finishSaleSideEffects(state2);
  }
  function adjustTender(state2, denomId, delta) {
    const ps = state2.ui.paymentSession;
    if (!ps || ps.step !== "cash-tender") return state2;
    const next = Math.max(0, (ps.tendered[denomId] || 0) + delta);
    ps.tendered[denomId] = next;
    ps.error = null;
    return state2;
  }
  function confirmTender(state2) {
    const ps = state2.ui.paymentSession;
    if (!ps) return state2;
    const given = countTotalCents(ps.tendered);
    if (given < ps.totalCents) {
      ps.error = `Falta dinero. Entregado ${formatEuro(given)}, total ${formatEuro(ps.totalCents)}.`;
      return state2;
    }
    const changeNeeded = given - ps.totalCents;
    ps.changeNeededCents = changeNeeded;
    const suggestion = makeChange(state2.finance.drawer, changeNeeded);
    ps.changeGiven = suggestion || emptyDrawer();
    ps.step = "cash-change";
    ps.error = null;
    if (!suggestion && changeNeeded > 0) {
      ps.error = "No hay suficiente cambio en caja para la sugerencia. Elige el cambio a mano.";
    }
    return state2;
  }
  function adjustChange(state2, denomId, delta) {
    const ps = state2.ui.paymentSession;
    if (!ps || ps.step !== "cash-change") return state2;
    const next = Math.max(0, (ps.changeGiven[denomId] || 0) + delta);
    const available = (state2.finance.drawer[denomId] || 0) + (ps.tendered[denomId] || 0);
    if (next > available) {
      ps.error = "No hay tantas piezas de esa denominaci\xF3n.";
      return state2;
    }
    ps.changeGiven[denomId] = next;
    ps.error = null;
    return state2;
  }
  function confirmChange(state2) {
    const ps = state2.ui.paymentSession;
    if (!ps) return state2;
    const changeNeeded = ps.changeNeededCents || 0;
    const changeSum = countTotalCents(ps.changeGiven);
    if (changeSum !== changeNeeded) {
      ps.error = `El cambio no cuadra. Debes devolver ${formatEuro(changeNeeded)} y tienes ${formatEuro(changeSum)}. Corrige y vuelve a intentar.`;
      return state2;
    }
    let drawer = addToDrawer(state2.finance.drawer, ps.tendered);
    drawer = removeFromDrawer(drawer, ps.changeGiven);
    if (!drawer) {
      ps.error = "No hay suficientes billetes/monedas en caja para ese cambio.";
      return state2;
    }
    state2.finance.drawer = drawer;
    applySaleAccounting(state2, ps, "cash");
    ps.step = "done";
    state2.ui.toast = changeNeeded ? `Venta OK. Cambio: ${formatEuro(changeNeeded)}` : `Venta OK. Importe exacto.`;
    finishSaleSideEffects(state2);
    return state2;
  }
  function applySaleAccounting(state2, ps, method) {
    const commission = Math.round(
      ps.items.reduce((s, i) => {
        const p = getProduct(i.productId);
        const rate = (p == null ? void 0 : p.commissionRate) || 0.05;
        return s + i.unitCents * i.qty * rate;
      }, 0)
    );
    state2.finance.daySalesCents += ps.totalCents;
    state2.finance.dayCommissionCents += commission;
    state2.stats.totalSalesCents += ps.totalCents;
    if (method !== "cash") {
      state2.finance.bankCents += ps.totalCents;
    }
    state2.finance.ledger.push({
      id: `led-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "sale",
      method,
      totalCents: ps.totalCents,
      commissionCents: commission,
      items: ps.items,
      clientName: ps.clientName
    });
  }
  function finishSaleSideEffects(state2) {
    var _a;
    const ps = state2.ui.paymentSession;
    for (const item of ps.items) {
      const p = getProduct(item.productId);
      if (p && p.stockType === "physical" && state2.stock[item.productId] != null) {
        state2.stock[item.productId] = Math.max(0, (state2.stock[item.productId] || 0) - item.qty);
      }
    }
    const tickets = createTicketsFromSale(state2, {
      items: ps.items,
      clientId: ps.clientId,
      clientName: ps.clientName,
      method: ps.method
    });
    ps.createdTickets = tickets;
    state2.ui.lastTickets = tickets;
    const client = state2.customers.regulars.find((c) => c.id === ps.clientId) || (((_a = state2.customers.current) == null ? void 0 : _a.id) === ps.clientId ? state2.customers.current : null);
    if (client) {
      client.history.push({
        at: state2.clock.gameTimeMs,
        items: ps.items,
        totalCents: ps.totalCents,
        ticketIds: tickets.map((t) => t.id)
      });
    }
    state2.stats.totalCustomers += 1;
    state2.customers.servedToday += 1;
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Venta a ${ps.clientName}: ${formatEuro(ps.totalCents)} (${labelMethod(ps.method)}) \xB7 ${tickets.length} ticket(s)`
    });
  }
  function closePaymentSession(state2) {
    state2.ui.paymentSession = null;
    state2.customers.current = null;
    state2.ui.screen = "counter";
    return state2;
  }
  function cancelPayment(state2) {
    state2.ui.paymentSession = null;
    state2.ui.screen = "counter";
    state2.ui.toast = "Cobro cancelado";
    return state2;
  }
  function payPrize(state2, { amountCents, clientName, method = "cash", note = "" }) {
    if (amountCents <= 0) {
      state2.ui.toast = "Importe no v\xE1lido";
      return false;
    }
    if (method === "cash") {
      const total = drawerTotalCents(state2.finance.drawer);
      if (total < amountCents) {
        state2.ui.toast = "No hay suficiente efectivo en caja. Usa banco/transferencia.";
        return false;
      }
      const give = makeChange(state2.finance.drawer, amountCents);
      if (!give) {
        state2.ui.toast = "No se puede componer el importe con las denominaciones actuales. Usa transferencia.";
        return false;
      }
      const next = removeFromDrawer(state2.finance.drawer, give);
      if (!next) return false;
      state2.finance.drawer = next;
    } else {
      if (state2.finance.bankCents < amountCents) {
        state2.ui.toast = "No hay saldo suficiente en el banco.";
        return false;
      }
      state2.finance.bankCents -= amountCents;
    }
    state2.finance.dayPrizesPaidCents += amountCents;
    state2.finance.ledger.push({
      id: `prize-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "prize",
      method,
      totalCents: amountCents,
      clientName,
      note
    });
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Premio pagado a ${clientName || "cliente"}: ${formatEuro(amountCents)} (${method})`
    });
    state2.ui.toast = `Premio pagado: ${formatEuro(amountCents)}`;
    return true;
  }
  function labelMethod(m) {
    return {
      cash: "efectivo",
      card: "tarjeta",
      bizum: "Bizum",
      transfer: "transferencia"
    }[m] || m;
  }

  // src/game/customers.js
  function crowdFactor(state2) {
    const d = gameDate(state2);
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    let f = 1;
    if (month === 12 || month === 11 && day >= 15) f += 0.8;
    if (month === 1 && day <= 10) f += 0.6;
    if (d.getUTCDay() === 5) f += 0.25;
    const ev = eventOn(gameYmd(state2), state2.events);
    if (ev) f += ev.crowd || 0;
    return f;
  }
  function maybeSpawnCustomers(state2) {
    if (!isOpenHours(state2)) return state2;
    if (state2.ui.screen === "cash" || state2.ui.screen === "close" || state2.ui.screen === "prize-flow") return state2;
    if (state2.customers.current) return state2;
    ensureDrawsResolved(state2);
    const now = state2.clock.gameTimeMs;
    if (now < state2.customers.nextSpawnAtMs) return state2;
    if (state2.customers.queue.length > 0) {
      state2.customers.current = state2.customers.queue.shift();
      scheduleNextSpawn(state2);
      return state2;
    }
    const client = pickArrivingClient(state2);
    if (client) {
      attachIntent(state2, client);
      state2.customers.current = client;
    }
    scheduleNextSpawn(state2);
    return state2;
  }
  function scheduleNextSpawn(state2) {
    const factor = crowdFactor(state2);
    const minMs = 18 * 1e3 / factor;
    const maxMs = 80 * 1e3 / factor;
    state2.customers.nextSpawnAtMs = state2.clock.gameTimeMs + minMs + Math.random() * (maxMs - minMs);
  }
  function pickArrivingClient(state2) {
    const rng = Math.random;
    const wantVisitor = rng() < 0.28 + (crowdFactor(state2) - 1) * 0.08;
    if (wantVisitor) return makeVisitor();
    const dow = gameDate(state2).getUTCDay();
    const candidates = state2.customers.regulars.filter((c) => {
      var _a;
      let chance = c.visitChance * crowdFactor(state2);
      if ((_a = c.preferredDays) == null ? void 0 : _a.includes(dow)) chance *= 2.2;
      return rng() < chance;
    });
    if (candidates.length === 0) {
      const list = state2.customers.regulars;
      return { ...list[Math.floor(rng() * list.length)] };
    }
    return { ...candidates[Math.floor(rng() * candidates.length)] };
  }
  function attachIntent(state2, client) {
    const rng = Math.random;
    const owned = ticketsForClient(state2, client.id);
    const checkable = owned.filter((t) => t.status === "active" || t.status === "checked" && t.deferred);
    const claimable = owned.filter((t) => t.status === "checked" && t.prizeCents > 0 && !t.paidAt);
    const managed = owned.filter((t) => t.status === "managed");
    let roll = rng();
    const seasonReserve = isSpecialSeason(state2) && rng() < 0.18;
    if (claimable.length && roll < 0.35) {
      const ticket = claimable[Math.floor(rng() * claimable.length)];
      client.intent = "claim";
      client.ticketFocus = ticket;
      client.request = null;
      client.note = `Viene a cobrar un premio de ${formatEuro(ticket.prizeCents)}.`;
      return client;
    }
    if (managed.length && roll < 0.2) {
      client.intent = "managed_ask";
      client.ticketFocus = managed[0];
      client.request = null;
      client.note = "Pregunta por el estado de su premio en gesti\xF3n.";
      return client;
    }
    if (checkable.length && roll < 0.45) {
      const ready = checkable.filter((t) => t.kind === "rasca" || t.status === "active");
      const ticket = (ready.length ? ready : checkable)[Math.floor(rng() * (ready.length || checkable.length))];
      client.intent = "check";
      client.ticketFocus = ticket;
      client.request = null;
      client.note = `Quiere comprobar ${ticket.productName} (${ticket.id}).`;
      return client;
    }
    if (seasonReserve) {
      const pid = gameDate(state2).getUTCMonth() === 0 ? "lae-nino" : "lae-navidad";
      const m = gameDate(state2).getUTCMonth() + 1;
      const productId = m === 1 ? "lae-nino" : "lae-navidad";
      const p = getProduct(productId);
      client.intent = "reserve_special";
      client.request = {
        productId: p.id,
        productName: p.name,
        qty: 1 + Math.floor(rng() * 3),
        unitCents: p.priceCents,
        totalCents: p.priceCents * (1 + Math.floor(rng() * 3))
      };
      client.request.totalCents = client.request.unitCents * client.request.qty;
      client.note = `Encargo de ${p.name}.`;
      return client;
    }
    client.intent = "buy";
    attachBuyRequest(state2, client);
    return client;
  }
  function isSpecialSeason(state2) {
    const m = gameDate(state2).getUTCMonth() + 1;
    const d = gameDate(state2).getUTCDate();
    if (m === 11 || m === 12) return true;
    if (m === 1 && d <= 10) return true;
    if (m === 10 && d >= 20) return true;
    return false;
  }
  function attachBuyRequest(state2, client) {
    const rng = Math.random;
    const prefs = client.preferredProducts || [];
    let productId = prefs[Math.floor(rng() * prefs.length)];
    if (client.trait === "impulsiva" || rng() < 0.25) {
      productId = PRODUCTS[Math.floor(rng() * PRODUCTS.length)].id;
    }
    const product = getProduct(productId) || PRODUCTS[0];
    let qty = 1;
    if (product.category === "rasca") qty = 1 + Math.floor(rng() * 3);
    if (product.id === "lae-nacional") qty = 1 + Math.floor(rng() * 2);
    if (product.id === "lae-bonoloto" || product.id === "lae-primitiva") qty = 1 + Math.floor(rng() * 4);
    if (client.trait === "generosa") qty += 1 + Math.floor(rng() * 2);
    client.request = {
      productId: product.id,
      productName: product.name,
      qty,
      unitCents: product.priceCents,
      totalCents: product.priceCents * qty
    };
    client.note = client.line || "";
  }
  function sellToCurrent(state2) {
    const client = state2.customers.current;
    if (!(client == null ? void 0 : client.request)) return state2;
    const p = getProduct(client.request.productId);
    if (!p) return state2;
    if (p.stockType === "physical") {
      const have = state2.stock[p.id] || 0;
      if (have < client.request.qty) {
        state2.ui.toast = `No hay stock de ${p.name}. Puedes reservar/pedir.`;
        return state2;
      }
    }
    const items = [
      {
        productId: p.id,
        name: p.name,
        qty: client.request.qty,
        unitCents: p.priceCents
      }
    ];
    return startPayment(state2, { items, client, purpose: "sale" });
  }
  function dismissCurrent(state2, reason = "Cliente atendido") {
    state2.customers.current = null;
    state2.dayLog.push({ at: state2.clock.gameTimeMs, text: reason });
    return state2;
  }
  function reserveForCurrent(state2) {
    var _a;
    const client = state2.customers.current;
    if (!(client == null ? void 0 : client.request)) return state2;
    const p = getProduct(client.request.productId);
    if (!p) return state2;
    const days = (_a = p.orderDays) != null ? _a : 2;
    const arrive = addBusinessDays(state2, days);
    const order = {
      id: `ord-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      qty: client.request.qty,
      clientId: client.id,
      clientName: client.name,
      arriveOnYmd: arrive,
      status: "pending",
      reserved: true,
      special: client.intent === "reserve_special"
    };
    state2.orders.push(order);
    state2.reservations.push(order);
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Reserva para ${client.name}: ${p.name} \xD7${client.request.qty} (llegada ${arrive})`
    });
    state2.ui.toast = `Reserva hecha. Llegar\xE1 el ${arrive}. Sin cobro ahora.`;
    state2.customers.current = null;
    return state2;
  }
  function orderStock(state2, productId, qty) {
    var _a;
    const p = getProduct(productId);
    if (!p || p.stockType !== "physical") return state2;
    const days = (_a = p.orderDays) != null ? _a : 2;
    const arrive = addBusinessDays(state2, days);
    state2.orders.push({
      id: `ord-${Date.now()}`,
      productId,
      productName: p.name,
      qty,
      clientId: null,
      clientName: null,
      arriveOnYmd: arrive,
      status: "pending",
      reserved: false
    });
    state2.ui.toast = `Pedido de ${p.name} \xD7${qty}. Llegada ${arrive}.`;
    return state2;
  }
  function addBusinessDays(state2, days) {
    const d = gameDate(state2);
    let left = days;
    let guard = 0;
    while (left > 0 && guard++ < 400) {
      d.setUTCDate(d.getUTCDate() + 1);
      const dow = d.getUTCDay();
      const ymd2 = d.toISOString().slice(0, 10);
      const hol = state2.holidays[ymd2];
      if (dow !== 0 && dow !== 6 && !hol) left--;
    }
    return d.toISOString().slice(0, 10);
  }
  function processArrivingOrders(state2) {
    const ymd2 = gameDate(state2).toISOString().slice(0, 10);
    for (const o of state2.orders) {
      if (o.status !== "pending") continue;
      if (o.arriveOnYmd <= ymd2) {
        o.status = "arrived";
        if (!o.reserved) {
          state2.stock[o.productId] = (state2.stock[o.productId] || 0) + o.qty;
          state2.dayLog.push({
            at: state2.clock.gameTimeMs,
            text: `Pedido recibido: ${o.productName} \xD7${o.qty}`
          });
        } else {
          state2.dayLog.push({
            at: state2.clock.gameTimeMs,
            text: `Encargo listo para ${o.clientName}: ${o.productName} \xD7${o.qty}`
          });
        }
      }
    }
    return state2;
  }
  function checkCurrentTicket(state2) {
    const client = state2.customers.current;
    if (!(client == null ? void 0 : client.ticketFocus)) return state2;
    const result = checkTicket(state2, client.ticketFocus.id);
    client.checkResult = result;
    if (result.pending) {
      state2.ui.toast = result.detail;
    } else if (result.prizeCents > 0) {
      state2.ui.toast = `\xA1Ha tocado ${formatEuro(result.prizeCents)}! (${result.detail})`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Comprobaci\xF3n: ${client.name} \xB7 ${result.ticket.productName} \xB7 PREMIO ${formatEuro(result.prizeCents)}`
      });
    } else {
      state2.ui.toast = `No ha tocado. ${result.detail || ""}`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Comprobaci\xF3n: ${client.name} \xB7 sin premio`
      });
    }
    client.ticketFocus = result.ticket || client.ticketFocus;
    return state2;
  }

  // src/game/prizes.js
  function payTicketPrize(state2, ticketId, { method = "cash", defer = false } = {}) {
    const ticket = state2.tickets.find((t) => t.id === ticketId);
    if (!ticket) return { ok: false, message: "Ticket no encontrado" };
    if (ticket.status === "paid") return { ok: false, message: "Ya pagado" };
    if (ticket.prizeCents <= 0) return { ok: false, message: "No hay premio" };
    if (defer) {
      ticket.status = "checked";
      ticket.deferred = true;
      state2.ui.toast = `Premio de ${formatEuro(ticket.prizeCents)} pendiente de cobro. El cliente puede volver otro d\xEDa.`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Premio diferido: ${ticket.clientName} \xB7 ${formatEuro(ticket.prizeCents)} (${ticket.productName})`
      });
      return { ok: true, deferred: true, ticket };
    }
    if (ticket.prizeCents >= LARGE_PRIZE_CENTS) {
      return startPrizeManagement(state2, ticket);
    }
    return paySmallPrize(state2, ticket, method);
  }
  function paySmallPrize(state2, ticket, method) {
    const amount = ticket.prizeCents;
    if (method === "cash") {
      const total = drawerTotalCents(state2.finance.drawer);
      if (total < amount) {
        return { ok: false, message: "No hay efectivo suficiente. Usa transferencia o difiere el pago." };
      }
      const give = makeChange(state2.finance.drawer, amount);
      if (!give) {
        return { ok: false, message: "No se puede componer el efectivo. Usa transferencia o difiere." };
      }
      const next = removeFromDrawer(state2.finance.drawer, give);
      if (!next) return { ok: false, message: "Error de caja" };
      state2.finance.drawer = next;
    } else {
      if (state2.finance.bankCents < amount) {
        return { ok: false, message: "Saldo de banco insuficiente. Difiere el pago o gestiona." };
      }
      state2.finance.bankCents -= amount;
    }
    ticket.status = "paid";
    ticket.paidAt = state2.clock.gameTimeMs;
    ticket.paidMethod = method;
    state2.finance.dayPrizesPaidCents += amount;
    state2.finance.dayPrizesReimbursableCents = (state2.finance.dayPrizesReimbursableCents || 0) + amount;
    state2.finance.ledger.push({
      id: `prize-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "prize",
      method,
      totalCents: amount,
      ticketId: ticket.id,
      clientName: ticket.clientName,
      org: ticket.org
    });
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Premio pagado: ${ticket.clientName} \xB7 ${formatEuro(amount)} \xB7 ${ticket.productName}`
    });
    state2.ui.toast = `Premio pagado: ${formatEuro(amount)}`;
    return { ok: true, ticket, amount };
  }
  function startPrizeManagement(state2, ticket) {
    if (!state2.prizeManagement) state2.prizeManagement = [];
    const existing = state2.prizeManagement.find((m) => m.ticketId === ticket.id && m.status === "open");
    if (existing) {
      state2.ui.toast = "Este premio ya est\xE1 en gesti\xF3n.";
      return { ok: true, managed: true, case: existing };
    }
    const level = ticket.prizeCents >= HUGE_PRIZE_CENTS ? "huge" : "large";
    const caseItem = {
      id: `pm-${Date.now()}`,
      ticketId: ticket.id,
      clientName: ticket.clientName,
      productName: ticket.productName,
      org: ticket.org,
      amountCents: ticket.prizeCents,
      level,
      status: "open",
      // open | submitted | settled
      createdAt: state2.clock.gameTimeMs,
      note: level === "huge" ? "Premio muy elevado: formalizar con SELAE/ONCE. No se paga de caja." : "Premio elevado: gestionar cobro. No sale entero de tu caja."
    };
    state2.prizeManagement.push(caseItem);
    ticket.status = "managed";
    ticket.managementId = caseItem.id;
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Gesti\xF3n de premio ${level}: ${ticket.clientName} \xB7 ${formatEuro(ticket.prizeCents)}`
    });
    state2.ui.toast = `Premio de ${formatEuro(ticket.prizeCents)} enviado a gesti\xF3n.`;
    return { ok: true, managed: true, case: caseItem };
  }
  function advancePrizeManagement(state2) {
    for (const c of state2.prizeManagement || []) {
      if (c.status === "open") {
        c.status = "submitted";
        c.submittedAt = state2.clock.gameTimeMs;
      } else if (c.status === "submitted") {
        c.status = "settled";
        c.settledAt = state2.clock.gameTimeMs;
        const ticket = state2.tickets.find((t) => t.id === c.ticketId);
        if (ticket) {
          ticket.status = "paid";
          ticket.paidAt = state2.clock.gameTimeMs;
          ticket.paidMethod = "managed";
        }
        state2.dayLog.push({
          at: state2.clock.gameTimeMs,
          text: `Premio gestionado liquidado: ${c.clientName} \xB7 ${formatEuro(c.amountCents)} (paga ${c.org})`
        });
      }
    }
  }

  // src/game/economy.js
  function applyDailyExpenses(state2) {
    const monthlyTotal = Object.values(MONTHLY_EXPENSES).reduce((a, b) => a + b, 0);
    const daily = Math.round(monthlyTotal / 22);
    state2.finance.bankCents -= daily;
    state2.finance.dayExpensesCents += daily;
    state2.finance.ledger.push({
      id: `exp-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "expense",
      label: "Gastos del local (prorrateo diario)",
      totalCents: -daily
    });
    return state2;
  }
  function maybeApplyTaxes(state2) {
    const d = gameDate(state2);
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    const taxMonths = [0, 3, 6, 9];
    if (!taxMonths.includes(month) || day !== 20) return state2;
    const commissionQuarterApprox = Math.round(state2.stats.totalSalesCents * 0.02);
    const iva = Math.round(commissionQuarterApprox * 0.21);
    const irpf = Math.round(commissionQuarterApprox * 0.15);
    const total = iva + irpf;
    state2.finance.bankCents -= total;
    state2.finance.ledger.push({
      id: `tax-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "tax",
      label: "Liquidaci\xF3n trimestral (IVA + IRPF estimado)",
      totalCents: -total
    });
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Impuestos trimestrales: ${formatEuro(total)}`
    });
    return state2;
  }
  function settleOrganizations(state2) {
    const byOrg = { LAE: { sales: 0, commission: 0, prizes: 0 }, ONCE: { sales: 0, commission: 0, prizes: 0 } };
    for (const e of state2.finance.ledger) {
      if (e.type !== "sale" || !e.items) continue;
      const dayStart = new Date(gameDate(state2));
      dayStart.setUTCHours(0, 0, 0, 0);
      if (e.at < dayStart.getTime()) continue;
      for (const item of e.items) {
      }
    }
    const sales = state2.finance.daySalesCents || 0;
    const commission = state2.finance.dayCommissionCents || 0;
    const prizesReimb = state2.finance.dayPrizesReimbursableCents || 0;
    const laeSales = Math.round(sales * 0.7);
    const onceSales = sales - laeSales;
    const laeComm = Math.round(commission * 0.7);
    const onceComm = commission - laeComm;
    const laePrizes = Math.round(prizesReimb * 0.7);
    const oncePrizes = prizesReimb - laePrizes;
    const remittanceLAE = laeSales - laeComm;
    const remittanceONCE = onceSales - onceComm;
    state2.finance.bankCents -= remittanceLAE + remittanceONCE;
    state2.finance.bankCents += prizesReimb;
    const settlement = {
      at: state2.clock.gameTimeMs,
      lae: { sales: laeSales, commission: laeComm, remittance: remittanceLAE, prizesReimbursed: laePrizes },
      once: { sales: onceSales, commission: onceComm, remittance: remittanceONCE, prizesReimbursed: oncePrizes },
      netBankDelta: prizesReimb - remittanceLAE - remittanceONCE
    };
    state2.finance.ledger.push({
      id: `settle-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "settlement",
      label: "Liquidaci\xF3n diaria LAE/ONCE",
      settlement
    });
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Liquidaci\xF3n: remesas ${formatEuro(remittanceLAE + remittanceONCE)} \xB7 reembolso premios ${formatEuro(prizesReimb)} \xB7 te quedas comisiones ${formatEuro(commission)}`
    });
    state2.finance.lastSettlement = settlement;
    return settlement;
  }
  function dayProfitBreakdown(state2) {
    const commission = state2.finance.dayCommissionCents || 0;
    const expenses = state2.finance.dayExpensesCents || 0;
    const profit = commission - expenses;
    return {
      salesCents: state2.finance.daySalesCents || 0,
      commissionCents: commission,
      expensesCents: expenses,
      prizesPaidCents: state2.finance.dayPrizesPaidCents || 0,
      prizesReimbursableCents: state2.finance.dayPrizesReimbursableCents || 0,
      profitCents: profit
    };
  }
  function buildDayCloseSummary(state2) {
    const drawer = drawerTotalCents(state2.finance.drawer);
    const profit = dayProfitBreakdown(state2);
    return {
      date: gameYmd(state2),
      ...profit,
      drawerCents: drawer,
      bankCents: state2.finance.bankCents,
      customersServed: state2.customers.servedToday,
      nextDay: nextBusinessDayStart(state2).toISOString().slice(0, 10),
      nextDayReasonSkip: peekSkipReason(state2),
      settlement: state2.finance.lastSettlement || null
    };
  }
  function peekSkipReason(state2) {
    const cur = gameDate(state2);
    const next = nextBusinessDayStart(state2);
    const skipped = [];
    const d = new Date(cur.getTime());
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(8, 0, 0, 0);
    while (d < next) {
      const ymd2 = d.toISOString().slice(0, 10);
      const dow = d.getUTCDay();
      if (dow === 0) skipped.push(`${ymd2} Domingo`);
      else if (dow === 6) skipped.push(`${ymd2} S\xE1bado`);
      else if (state2.holidays[ymd2]) skipped.push(`${ymd2} ${state2.holidays[ymd2]}`);
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return skipped;
  }
  function closeDay(state2) {
    ensureDrawsResolved(state2);
    applyDailyExpenses(state2);
    maybeApplyTaxes(state2);
    const settlement = settleOrganizations(state2);
    advancePrizeManagement(state2);
    const summary = buildDayCloseSummary(state2);
    summary.settlement = settlement;
    state2.stats.daysPlayed += 1;
    state2.finance.daySalesCents = 0;
    state2.finance.dayCommissionCents = 0;
    state2.finance.dayPrizesPaidCents = 0;
    state2.finance.dayPrizesReimbursableCents = 0;
    state2.finance.dayExpensesCents = 0;
    state2.customers.servedToday = 0;
    state2.customers.current = null;
    state2.customers.queue = [];
    state2.dayLog = [];
    state2.ui.lastTickets = [];
    const float = drawerTotalCents(state2.finance.drawer);
    if (float < state2.finance.floatTargetCents * 0.5) {
      const need = state2.finance.floatTargetCents - float;
      const take = Math.min(need, state2.finance.bankCents);
      state2.finance.bankCents -= take;
      state2.finance.drawer = defaultFloatDrawer();
      state2.ui.toast = `Fondo de caja repuesto (${formatEuro(take)}).`;
    }
    const next = nextBusinessDayStart(state2);
    state2.clock.gameTimeMs = next.getTime();
    state2.clock.lastRealMs = Date.now();
    state2.office.isOpen = true;
    state2.office.openedToday = true;
    processArrivingOrders(state2);
    ensureDrawsResolved(state2);
    state2.customers.nextSpawnAtMs = state2.clock.gameTimeMs + 2 * 60 * 1e3;
    state2.ui.screen = "counter";
    state2.ui.lastCloseSummary = summary;
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Nuevo d\xEDa en ${OFFICE.businessName}. ${closedReason(state2) || "Abierta 08:00\u201320:00."}`
    });
    return { state: state2, summary };
  }

  // src/game/sounds.js
  var ctx;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function beep({ freq = 880, dur = 0.08, type = "sine", gain = 0.04, slideTo } = {}) {
    try {
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.value = gain;
      g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur);
    } catch (e) {
    }
  }
  var sfx = {
    click: () => beep({ freq: 620, dur: 0.04, type: "triangle", gain: 0.03 }),
    scan: () => beep({ freq: 1400, dur: 0.06, type: "square", gain: 0.025 }),
    cash: () => {
      beep({ freq: 880, dur: 0.07, type: "sine", gain: 0.04 });
      setTimeout(() => beep({ freq: 1175, dur: 0.09, type: "sine", gain: 0.035 }), 70);
    },
    error: () => beep({ freq: 200, dur: 0.15, type: "sawtooth", gain: 0.03 }),
    success: () => {
      beep({ freq: 523, dur: 0.08 });
      setTimeout(() => beep({ freq: 659, dur: 0.08 }), 80);
      setTimeout(() => beep({ freq: 784, dur: 0.12 }), 160);
    },
    open: () => beep({ freq: 400, dur: 0.2, type: "triangle", gain: 0.04, slideTo: 800 })
  };

  // src/game/pdf.js
  function downloadTicketPdf(ticket, business = OFFICE) {
    const lines = [
      business.businessName,
      `${business.town} \xB7 ${business.employee}`,
      "--------------------------------",
      `Ticket ${ticket.id}`,
      ticket.productName,
      `Cliente: ${ticket.clientName || "\u2014"}`,
      `Apuesta: ${formatSelection(ticket)}`,
      ticket.drawYmd ? `Sorteo: ${ticket.drawYmd}` : "Rasca / instant\xE1neo",
      `Precio: ${formatEuro(ticket.priceCents)}`,
      ticket.checkedAt != null ? `Comprobado: ${ticket.checkDetail || ""} \xB7 ${formatEuro(ticket.prizeCents || 0)}` : "Pendiente de comprobar",
      "--------------------------------",
      "Fan-made / no oficial \xB7 +18",
      "Juego responsable"
    ];
    const pdf = buildSimplePdf(lines);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function downloadSaleReceiptPdf({ items, totalCents, clientName, method, tickets }) {
    const lines = [
      OFFICE.businessName,
      `\xC1lora \xB7 Miriam`,
      "======== TICKET DE VENTA ========",
      `Cliente: ${clientName || "\u2014"}`,
      `Pago: ${method}`,
      "--------------------------------",
      ...items.map((i) => `${i.name} x${i.qty}  ${formatEuro(i.unitCents * i.qty)}`),
      "--------------------------------",
      `TOTAL  ${formatEuro(totalCents)}`
    ];
    if (tickets == null ? void 0 : tickets.length) {
      lines.push("Tickets:");
      for (const t of tickets) {
        lines.push(`- ${t.id} ${t.productName} ${formatSelection(t)}`);
      }
    }
    lines.push("Fan-made / no oficial \xB7 +18");
    const pdf = buildSimplePdf(lines);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `venta-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function buildSimplePdf(lines) {
    const escaped = lines.map((l) => escapePdfText(String(l).slice(0, 90)));
    let y = 800;
    const contentParts = ["BT /F1 11 Tf 50 800 Td"];
    escaped.forEach((line, i) => {
      if (i === 0) contentParts.push(`(${line}) Tj`);
      else contentParts.push(`0 -16 Td (${line}) Tj`);
    });
    contentParts.push("ET");
    const stream = contentParts.join("\n");
    const objects = [];
    objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
    objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
    objects.push(
      "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n"
    );
    objects.push(`4 0 obj<< /Length ${stream.length} >>stream
${stream}
endstream
endobj
`);
    objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n");
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (const obj of objects) {
      offsets.push(pdf.length);
      pdf += obj;
    }
    const xrefPos = pdf.length;
    pdf += `xref
0 ${objects.length + 1}
`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n 
`;
    }
    pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefPos}
%%EOF`;
    return pdf;
  }
  function escapePdfText(s) {
    return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  // src/main.js
  var state = null;
  var toastTimer = null;
  var needsFullRender = true;
  var lastClockMinute = -1;
  var app = document.getElementById("app");
  function showToast(msg) {
    if (!state) return;
    state.ui.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (state) state.ui.toast = null;
      needsFullRender = true;
      render();
    }, 3500);
  }
  function loop() {
    var _a, _b;
    if (state && state.ui.screen !== "menu") {
      advanceClock(state);
      ensureDrawsResolved(state);
      if (state.ui.screen === "counter") {
        const before = ((_a = state.customers.current) == null ? void 0 : _a.id) || null;
        maybeSpawnCustomers(state);
        const after = ((_b = state.customers.current) == null ? void 0 : _b.id) || null;
        if (before !== after) needsFullRender = true;
      }
      const minute = Math.floor(state.clock.gameTimeMs / 6e4);
      if (needsFullRender) {
        render();
        needsFullRender = false;
        lastClockMinute = minute;
      } else {
        renderClockOnly();
        if (state.ui.screen === "counter" && minute !== lastClockMinute) {
          lastClockMinute = minute;
          const hint = document.getElementById("crowd-hint");
          if (hint) hint.textContent = crowdHint();
          const evEl = document.getElementById("event-banner");
          if (evEl) evEl.textContent = eventBannerText();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  function renderClockOnly() {
    const el = document.getElementById("live-clock");
    const st = document.getElementById("live-status");
    if (!el || !state) return;
    el.textContent = formatGameClock(state);
    if (st) {
      const open = isOpenHours(state) && !isClosedDay(state);
      st.textContent = open ? "Abierta" : closedReason(state) || "Fuera de horario";
      st.className = `status-pill ${open ? "open" : "closed"}`;
    }
  }
  function render() {
    if (!state || state.ui.screen === "menu") return renderMenu();
    if (state.ui.screen === "cash") return renderCash();
    if (state.ui.screen === "close") return renderClose();
    if (state.ui.screen === "saves") return renderSavesInGame();
    if (state.ui.screen === "stock") return renderStock();
    if (state.ui.screen === "prize") return renderPrize();
    if (state.ui.screen === "draws") return renderDraws();
    if (state.ui.screen === "management") return renderManagement();
    return renderCounter();
  }
  function escapeHtml(s) {
    return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  function toastHTML() {
    var _a;
    if (!((_a = state == null ? void 0 : state.ui) == null ? void 0 : _a.toast)) return "";
    return `<div class="toast">${escapeHtml(state.ui.toast)}</div>`;
  }
  function payLabel(m) {
    return { cash: "efectivo", card: "tarjeta", bizum: "Bizum", transfer: "transferencia", managed: "gesti\xF3n" }[m] || m;
  }
  function crowdHint() {
    const d = gameDate(state);
    const m = d.getUTCMonth() + 1;
    const ev = eventOn(gameYmd(state), state.events);
    if (ev) return `alta (${ev.name})`;
    if (m === 12) return "mucha (Navidad)";
    if (m === 1 && d.getUTCDate() <= 10) return "alta (El Ni\xF1o)";
    if (d.getUTCDay() === 5) return "media-alta (Euromillones)";
    return "normal";
  }
  function eventBannerText() {
    const ev = eventOn(gameYmd(state), state.events);
    return ev ? `Evento en \xC1lora: ${ev.name}` : "";
  }
  function renderMenu() {
    const slots = listSlots();
    app.innerHTML = `
    <div class="menu-screen">
      <div class="menu-card">
        <div class="muted">\xC1lora \xB7 M\xE1laga \xB7 v${GAME_VERSION}</div>
        <h1>Loter\xEDas \xC1lora</h1>
        <p class="tagline">Simulador realista de mostrador. T\xFA eres Miriam, la \xFAnica empleada.</p>
        <div class="actions">
          <button class="btn primary" id="btn-new">Nueva partida</button>
          <label class="btn ghost" style="cursor:pointer">
            Importar archivo
            <input id="import-file" type="file" accept="application/json" hidden />
          </label>
        </div>
        <h3 style="margin-top:22px;font-family:var(--font-display);color:var(--brand-deep)">Partidas guardadas</h3>
        <div class="slot-grid">
          ${slots.map((s) => {
      var _a;
      if (s.empty) {
        return `<div class="slot"><div><strong>Hueco ${s.slot}</strong><div class="muted">Vac\xEDo</div></div></div>`;
      }
      const when = s.gameTimeMs ? new Date(s.gameTimeMs).toLocaleString("es-ES", { timeZone: "UTC" }) : "";
      return `<div class="slot">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${when} \xB7 D\xEDa ${(_a = s.daysPlayed) != null ? _a : 0} \xB7 v${s.gameVersion || "?"}</div>
                </div>
                <div class="actions">
                  <button class="btn primary" data-load="${s.slot}">Continuar</button>
                </div>
              </div>`;
    }).join("")}
        </div>
        <p class="disclaimer">
          Fan-made / no oficial. Nombres de Loter\xEDas y Apuestas del Estado y ONCE usados solo con fines de simulaci\xF3n.
          Juego responsable \xB7 +18. Versi\xF3n ${GAME_VERSION}: sorteos, comprobaciones, rascas, liquidaciones y tickets PDF.
        </p>
      </div>
    </div>
  `;
    document.getElementById("btn-new").onclick = () => {
      sfx.open();
      state = newGame();
      processArrivingOrders(state);
      ensureDrawsResolved(state);
      state.ui.screen = "counter";
      showToast("Bienvenida, Miriam. Versi\xF3n 0.1 lista.");
      needsFullRender = true;
      render();
    };
    document.getElementById("import-file").onchange = async (e) => {
      var _a;
      const f = (_a = e.target.files) == null ? void 0 : _a[0];
      if (!f) return;
      try {
        state = await importGame(f);
        showToast("Partida importada");
        sfx.success();
        needsFullRender = true;
        render();
      } catch (e2) {
        sfx.error();
        alert("No se pudo importar el archivo");
      }
    };
    app.querySelectorAll("[data-load]").forEach((btn) => {
      btn.onclick = () => {
        const slot = Number(btn.getAttribute("data-load"));
        state = loadFromSlot(slot);
        if (!state) return;
        sfx.click();
        showToast(`Partida cargada (hueco ${slot})`);
        needsFullRender = true;
        render();
      };
    });
  }
  function topbarHTML() {
    const d = gameDate(state);
    const dateStr = d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    });
    const open = isOpenHours(state) && !isClosedDay(state);
    const speed = state.clock.paused ? 0 : state.clock.speed;
    const ev = eventBannerText();
    return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-name">Loter\xEDas \xC1lora</div>
        <div class="brand-sub">Miriam \xB7 \xC1lora \xB7 v${GAME_VERSION}${ev ? ` \xB7 ${escapeHtml(ev)}` : ""}</div>
      </div>
      <div class="clock-block">
        <div class="clock-time" id="live-clock">${formatGameClock(state)}</div>
        <div class="clock-date">${dateStr}</div>
        <div id="live-status" class="status-pill ${open ? "open" : "closed"}">${open ? "Abierta" : closedReason(state) || "Fuera de horario"}</div>
      </div>
      <div class="speed-controls">
        <button class="btn ${speed === 0 ? "active" : ""}" data-speed="0">Pausa</button>
        <button class="btn ${speed === 1 ? "active" : ""}" data-speed="1">Normal</button>
        <button class="btn ${speed === 15 ? "active" : ""}" data-speed="15">R\xE1pido</button>
        <button class="btn ${speed === 60 ? "active" : ""}" data-speed="60">Muy r\xE1pido</button>
      </div>
    </header>
  `;
  }
  function bindTopbar() {
    app.querySelectorAll("[data-speed]").forEach((btn) => {
      btn.onclick = () => {
        sfx.click();
        setSpeed(state, Number(btn.getAttribute("data-speed")));
        needsFullRender = true;
        render();
      };
    });
  }
  function sideNav() {
    const profit = dayProfitBreakdown(state);
    const openMgmt = (state.prizeManagement || []).filter((c) => c.status !== "settled").length;
    return `
    <aside class="panel nav-side">
      <h3>Oficina</h3>
      <button class="btn" data-nav="counter">Mostrador</button>
      <button class="btn" data-nav="draws">Sorteos</button>
      <button class="btn" data-nav="prize">Pagar premio</button>
      <button class="btn" data-nav="management">Gesti\xF3n premios${openMgmt ? ` (${openMgmt})` : ""}</button>
      <button class="btn" data-nav="stock">Stock y pedidos</button>
      <button class="btn" data-nav="close">Cierre y balance</button>
      <button class="btn" data-nav="saves">Guardar / exportar</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:14px 0" />
      <div class="stat-row"><span>Banco</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
      <div class="stat-row"><span>Caja</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      <div class="stat-row"><span>Ventas hoy</span><strong>${formatEuro(state.finance.daySalesCents)}</strong></div>
      <div class="stat-row"><span>Comisi\xF3n hoy</span><strong>${formatEuro(profit.commissionCents)}</strong></div>
      <div class="stat-row"><span>Beneficio hoy*</span><strong>${formatEuro(profit.profitCents)}</strong></div>
      <div class="stat-row"><span>Clientes hoy</span><strong>${state.customers.servedToday}</strong></div>
      <div class="stat-row"><span>Velocidad</span><strong>${speedLabel(state.clock.speed, state.clock.paused)}</strong></div>
      <p class="muted" style="font-size:0.78rem;margin-top:8px">*Comisiones \u2212 gastos del d\xEDa</p>
    </aside>
  `;
  }
  function bindNav() {
    app.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.onclick = () => {
        sfx.click();
        state.ui.screen = btn.getAttribute("data-nav");
        needsFullRender = true;
        render();
      };
    });
  }
  function renderCounter() {
    const client = state.customers.current;
    const ev = eventBannerText();
    let clientBlock;
    if (!isOpenHours(state) || isClosedDay(state)) {
      clientBlock = `
      <div class="hero-counter">
        <h2>Oficina cerrada</h2>
        <p>${closedReason(state) || "Fuera de horario (08:00\u201320:00)."}</p>
      </div>`;
    } else if (!client) {
      clientBlock = `
      <div class="hero-counter">
        <h2>Mostrador listo</h2>
        <p>Esperando clientes\u2026 Afluencia <span id="crowd-hint">${crowdHint()}</span>
        ${ev ? `\xB7 <span id="event-banner">${escapeHtml(ev)}</span>` : '<span id="event-banner"></span>'}</p>
      </div>`;
    } else {
      clientBlock = renderClientPanel(client);
    }
    const log = [...state.dayLog].slice(-12).reverse();
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout">
        ${sideNav()}
        <section class="panel counter-stage">
          ${clientBlock}
          <div>
            <h3>Registro del d\xEDa</h3>
            <div class="log">
              ${log.length ? log.map((l) => `<div class="log-item">${escapeHtml(l.text)}</div>`).join("") : '<div class="muted">A\xFAn no hay movimientos.</div>'}
            </div>
          </div>
        </section>
        <aside class="panel">
          <h3>Hoy</h3>
          <div class="stat-row"><span>Tickets emitidos</span><strong>${(state.tickets || []).length}</strong></div>
          <div class="stat-row"><span>Pedidos pendientes</span><strong>${state.orders.filter((o) => o.status === "pending").length}</strong></div>
          <div class="stat-row"><span>Afluencia</span><strong>\xD7${crowdFactor(state).toFixed(1)}</strong></div>
          <p class="disclaimer" style="margin-top:16px">Fan-made \xB7 no oficial \xB7 +18 \xB7 v${GAME_VERSION}</p>
        </aside>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    bindClientActions();
  }
  function renderClientPanel(client) {
    const intent = client.intent || "buy";
    const trait = client.trait ? ` \xB7 ${client.trait}` : "";
    const quote = client.line || client.note || "";
    if (intent === "buy" || intent === "reserve_special") {
      const req = client.request;
      return `
      <div class="client-card">
        <div class="muted">${client.regular ? "Habitual" : "Visitante"}${trait} \xB7 ${escapeHtml(client.street || "")}</div>
        <h3>${escapeHtml(client.name)}</h3>
        ${quote ? `<p class="muted">\u201C${escapeHtml(quote)}\u201D</p>` : ""}
        <p>${intent === "reserve_special" ? "Encargo:" : "Quiere:"} <strong>${escapeHtml(req.productName)}</strong> \xD7 ${req.qty}
          \u2014 ${formatEuro(req.totalCents)}</p>
        <p class="muted">Pago preferido: ${payLabel(client.prefersPayment)}</p>
        <div class="actions">
          ${intent === "reserve_special" ? `<button class="btn primary" id="btn-reserve">Reservar sin pagar</button>` : `<button class="btn primary" id="btn-sell">Vender y cobrar</button>
                 <button class="btn" id="btn-reserve">Reservar sin pagar</button>`}
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
    }
    if (intent === "check") {
      const t = client.ticketFocus;
      const result = client.checkResult;
      return `
      <div class="client-card">
        <div class="muted">Comprobaci\xF3n${trait}</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Trae <strong>${escapeHtml(t.productName)}</strong> (${t.id})</p>
        <p class="muted">${formatSelection(t)}${t.drawYmd ? ` \xB7 Sorteo ${t.drawYmd}` : ""}</p>
        ${result ? `<div class="${result.prizeCents ? "total-box" : "error-box"}" style="margin:10px 0">
                ${result.pending ? escapeHtml(result.detail) : result.prizeCents ? `\xA1Premio: ${formatEuro(result.prizeCents)}! (${escapeHtml(result.detail || "")})` : `Sin premio. ${escapeHtml(result.detail || "")}`}
              </div>` : ""}
        <div class="actions">
          ${!result ? `<button class="btn primary" id="btn-check">Comprobar</button>` : result.prizeCents > 0 ? `<button class="btn primary" id="btn-pay-now">Pagar ahora</button>
                   <button class="btn" id="btn-defer">Cobrar otro d\xEDa</button>
                   <button class="btn accent" id="btn-manage">Gestionar (premio grande)</button>` : `<button class="btn primary" id="btn-done-check">Listo</button>`}
          <button class="btn" id="btn-pdf-ticket">PDF ticket</button>
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
    }
    if (intent === "claim") {
      const t = client.ticketFocus;
      return `
      <div class="client-card">
        <div class="muted">Cobro de premio${trait}</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Premio pendiente: <strong>${formatEuro(t.prizeCents)}</strong> \xB7 ${escapeHtml(t.productName)}</p>
        <div class="actions">
          <button class="btn primary" id="btn-pay-now">Pagar ahora</button>
          <button class="btn" id="btn-defer">Seguir pendiente</button>
          <button class="btn accent" id="btn-manage">Pasar a gesti\xF3n</button>
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
    }
    if (intent === "managed_ask") {
      const t = client.ticketFocus;
      const mgmt = (state.prizeManagement || []).find((m) => m.ticketId === t.id);
      return `
      <div class="client-card">
        <div class="muted">Consulta de gesti\xF3n</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Premio en gesti\xF3n: <strong>${formatEuro(t.prizeCents)}</strong></p>
        <p class="muted">Estado: ${(mgmt == null ? void 0 : mgmt.status) || "en tr\xE1mite"} \xB7 ${escapeHtml((mgmt == null ? void 0 : mgmt.note) || "")}</p>
        <div class="actions">
          <button class="btn primary" id="btn-done-check">Explicar y despedir</button>
        </div>
      </div>`;
    }
    return `<div class="client-card"><h3>${escapeHtml(client.name)}</h3><button class="btn" id="btn-skip">Despedir</button></div>`;
  }
  function bindClientActions() {
    const sell = document.getElementById("btn-sell");
    if (sell) {
      sell.onclick = () => {
        sfx.scan();
        sellToCurrent(state);
        if (state.ui.toast) showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    }
    const reserve = document.getElementById("btn-reserve");
    if (reserve) {
      reserve.onclick = () => {
        sfx.click();
        reserveForCurrent(state);
        showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    }
    const skip = document.getElementById("btn-skip");
    if (skip) {
      skip.onclick = () => {
        var _a;
        sfx.click();
        const name = ((_a = state.customers.current) == null ? void 0 : _a.name) || "Cliente";
        dismissCurrent(state, `${name} se va`);
        state.customers.current = null;
        needsFullRender = true;
        render();
      };
    }
    const check = document.getElementById("btn-check");
    if (check) {
      check.onclick = () => {
        sfx.scan();
        checkCurrentTicket(state);
        showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    }
    const done = document.getElementById("btn-done-check");
    if (done) {
      done.onclick = () => {
        state.customers.current = null;
        needsFullRender = true;
        render();
      };
    }
    const payNow = document.getElementById("btn-pay-now");
    if (payNow) {
      payNow.onclick = () => {
        var _a, _b;
        const t = (_a = state.customers.current) == null ? void 0 : _a.ticketFocus;
        if (!t) return;
        const res = payTicketPrize(state, t.id, { method: "cash" });
        if (!res.ok && ((_b = res.message) == null ? void 0 : _b.includes("efectivo"))) {
          const res2 = payTicketPrize(state, t.id, { method: "transfer" });
          if (!res2.ok) {
            sfx.error();
            showToast(res2.message || res.message);
          } else {
            sfx.cash();
            showToast(state.ui.toast);
            state.customers.current = null;
          }
        } else if (!res.ok) {
          sfx.error();
          showToast(res.message);
        } else {
          sfx.cash();
          showToast(state.ui.toast);
          if (!res.deferred) state.customers.current = null;
        }
        needsFullRender = true;
        render();
      };
    }
    const defer = document.getElementById("btn-defer");
    if (defer) {
      defer.onclick = () => {
        var _a;
        const t = (_a = state.customers.current) == null ? void 0 : _a.ticketFocus;
        if (!t) return;
        payTicketPrize(state, t.id, { defer: true });
        sfx.click();
        showToast(state.ui.toast);
        state.customers.current = null;
        needsFullRender = true;
        render();
      };
    }
    const manage = document.getElementById("btn-manage");
    if (manage) {
      manage.onclick = () => {
        var _a;
        const t = (_a = state.customers.current) == null ? void 0 : _a.ticketFocus;
        if (!t) return;
        startPrizeManagement(state, t);
        sfx.click();
        showToast(state.ui.toast);
        state.customers.current = null;
        needsFullRender = true;
        render();
      };
    }
    const pdfBtn = document.getElementById("btn-pdf-ticket");
    if (pdfBtn) {
      pdfBtn.onclick = () => {
        var _a;
        const t = (_a = state.customers.current) == null ? void 0 : _a.ticketFocus;
        if (!t) return;
        downloadTicketPdf(t);
        sfx.click();
        showToast("PDF del ticket descargado");
      };
    }
  }
  function renderCash() {
    const ps = state.ui.paymentSession;
    if (!ps) {
      state.ui.screen = "counter";
      return render();
    }
    const tendered = countTotalCents(ps.tendered);
    const changeSum = countTotalCents(ps.changeGiven || {});
    let body = "";
    if (ps.step === "method") {
      body = `
      <p>Cliente: <strong>${escapeHtml(ps.clientName)}</strong> \xB7 Prefiere ${payLabel(ps.preferredPayment)}</p>
      <div class="totals" style="margin:12px 0">
        <div class="total-box">Total a cobrar<strong>${formatEuro(ps.totalCents)}</strong></div>
      </div>
      <div class="method-grid">
        <button class="btn primary" data-method="cash">Efectivo</button>
        <button class="btn" data-method="card">Tarjeta</button>
        <button class="btn" data-method="bizum">Bizum</button>
        <button class="btn" data-method="transfer">Transferencia</button>
      </div>`;
    } else if (ps.step === "cash-tender") {
      body = `
      <p>Marca lo que entrega el cliente.</p>
      <div class="totals">
        <div class="total-box">A cobrar<strong>${formatEuro(ps.totalCents)}</strong></div>
        <div class="total-box">Entregado<strong>${formatEuro(tendered)}</strong></div>
        <div class="total-box">Cambio<strong>${formatEuro(Math.max(0, tendered - ps.totalCents))}</strong></div>
      </div>
      ${denomEditor("tender")}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-tender">Continuar al cambio</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>`;
    } else if (ps.step === "cash-change") {
      body = `
      <p>Elige el cambio exacto.</p>
      <div class="totals">
        <div class="total-box">A devolver<strong>${formatEuro(ps.changeNeededCents || 0)}</strong></div>
        <div class="total-box">Selecci\xF3n<strong>${formatEuro(changeSum)}</strong></div>
        <div class="total-box">En caja<strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      </div>
      ${denomEditor("change")}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-change">Confirmar cobro</button>
        <button class="btn" id="btn-back-tender">Volver</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>`;
    } else if (ps.step === "done") {
      const tickets = ps.createdTickets || [];
      body = `
      <div class="hero-counter">
        <h2>Cobro completado</h2>
        <p>${escapeHtml(ps.clientName)} \xB7 ${formatEuro(ps.totalCents)} \xB7 ${payLabel(ps.method)}</p>
      </div>
      <h3>Tickets emitidos</h3>
      <div class="log">
        ${tickets.map(
        (t) => `<div class="log-item"><strong>${t.id}</strong> \xB7 ${escapeHtml(t.productName)} \xB7 ${escapeHtml(formatSelection(t))}${t.drawYmd ? ` \xB7 sorteo ${t.drawYmd}` : ""}
              <button class="btn" style="padding:4px 8px;margin-left:8px" data-pdf="${t.id}">PDF</button>
              </div>`
      ).join("") || '<div class="muted">Sin tickets</div>'}
      </div>
      <div class="actions" style="margin-top:12px">
        <button class="btn" id="btn-pdf-sale">PDF venta</button>
        <button class="btn primary" id="btn-next-client">Siguiente</button>
      </div>`;
    }
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel cash-screen" style="margin-top:16px">
        <h2>Caja</h2>
        <div class="muted">${ps.items.map((i) => `${i.name} \xD7${i.qty}`).join(" \xB7 ")}</div>
        ${ps.error ? `<div class="error-box" style="margin:10px 0">${escapeHtml(ps.error)}</div>` : ""}
        ${body}
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    app.querySelectorAll("[data-method]").forEach((btn) => {
      btn.onclick = () => {
        selectPaymentMethod(state, btn.getAttribute("data-method"));
        sfx.click();
        if (state.ui.toast) showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-adj]").forEach((btn) => {
      btn.onclick = () => {
        const kind = btn.getAttribute("data-adj");
        const id = btn.getAttribute("data-id");
        const delta = Number(btn.getAttribute("data-delta"));
        if (kind === "tender") adjustTender(state, id, delta);
        else adjustChange(state, id, delta);
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    const ct = document.getElementById("btn-confirm-tender");
    if (ct)
      ct.onclick = () => {
        var _a;
        confirmTender(state);
        ((_a = state.ui.paymentSession) == null ? void 0 : _a.error) ? sfx.error() : sfx.scan();
        needsFullRender = true;
        render();
      };
    const cc = document.getElementById("btn-confirm-change");
    if (cc)
      cc.onclick = () => {
        var _a;
        confirmChange(state);
        if ((_a = state.ui.paymentSession) == null ? void 0 : _a.error) sfx.error();
        else {
          sfx.cash();
          if (state.ui.toast) showToast(state.ui.toast);
        }
        needsFullRender = true;
        render();
      };
    const back = document.getElementById("btn-back-tender");
    if (back)
      back.onclick = () => {
        state.ui.paymentSession.step = "cash-tender";
        state.ui.paymentSession.error = null;
        needsFullRender = true;
        render();
      };
    const cancel = document.getElementById("btn-cancel-pay");
    if (cancel)
      cancel.onclick = () => {
        cancelPayment(state);
        needsFullRender = true;
        render();
      };
    const next = document.getElementById("btn-next-client");
    if (next)
      next.onclick = () => {
        closePaymentSession(state);
        sfx.success();
        needsFullRender = true;
        render();
      };
    const pdfSale = document.getElementById("btn-pdf-sale");
    if (pdfSale)
      pdfSale.onclick = () => {
        downloadSaleReceiptPdf({
          items: ps.items,
          totalCents: ps.totalCents,
          clientName: ps.clientName,
          method: payLabel(ps.method),
          tickets: ps.createdTickets
        });
        sfx.click();
        showToast("PDF de venta descargado");
      };
    app.querySelectorAll("[data-pdf]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-pdf");
        const t = (ps.createdTickets || []).find((x) => x.id === id);
        if (t) downloadTicketPdf(t);
        sfx.click();
      };
    });
  }
  function denomEditor(kind) {
    const ps = state.ui.paymentSession;
    const counts = kind === "tender" ? ps.tendered : ps.changeGiven;
    return [
      ["Billetes", BILLS],
      ["Monedas", COINS]
    ].map(
      ([title, list]) => `
      <h3 style="margin-top:14px">${title}</h3>
      <div class="denom-grid">
        ${list.map((d) => {
        const n = counts[d.id] || 0;
        return `<div class="denom">
              <div class="label">${d.label}</div>
              <div class="row">
                <button data-adj="${kind}" data-id="${d.id}" data-delta="-1">\u2212</button>
                <strong>${n}</strong>
                <button data-adj="${kind}" data-id="${d.id}" data-delta="1">+</button>
              </div>
            </div>`;
      }).join("")}
      </div>`
    ).join("");
  }
  function renderClose() {
    const summary = buildDayCloseSummary(state);
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Cierre y balance</h2>
          <p class="muted">Al confirmar: gastos del d\xEDa, liquidaci\xF3n LAE/ONCE, avance de gestiones de premios y salto al siguiente laborable.</p>
          <div class="close-summary">
            <div class="stat-row"><span>Fecha</span><strong>${summary.date}</strong></div>
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(summary.salesCents)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(summary.commissionCents)}</strong></div>
            <div class="stat-row"><span>Beneficio del d\xEDa*</span><strong>${formatEuro(summary.profitCents)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(summary.prizesPaidCents)}</strong></div>
            <div class="stat-row"><span>Gastos (al cerrar)</span><strong>${formatEuro(summary.expensesCents)}</strong></div>
            <div class="stat-row"><span>Caj\xF3n</span><strong>${formatEuro(summary.drawerCents)}</strong></div>
            <div class="stat-row"><span>Banco</span><strong>${formatEuro(summary.bankCents)}</strong></div>
            <div class="stat-row"><span>Clientes</span><strong>${summary.customersServed}</strong></div>
            <div class="stat-row"><span>Siguiente laborable</span><strong>${summary.nextDay}</strong></div>
          </div>
          <p class="muted">*Beneficio \u2248 comisiones \u2212 gastos (antes de liquidar)</p>
          <div class="actions" style="margin-top:18px">
            <button class="btn accent" id="btn-do-close">Liquidar, balance y cerrar d\xEDa</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    document.getElementById("btn-do-close").onclick = () => {
      const { summary: s } = closeDay(state);
      const slot = state.meta.activeSlot || 1;
      state.meta.activeSlot = slot;
      saveToSlot(state, slot);
      sfx.success();
      const settle = s.settlement;
      showToast(
        `D\xEDa cerrado \u2192 ${s.nextDay}. Beneficio ${formatEuro(s.profitCents)}. Liquidaci\xF3n hecha. Guardado hueco ${slot}.`
      );
      needsFullRender = true;
      render();
    };
  }
  function renderSavesInGame() {
    const slots = listSlots();
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Guardar / exportar</h2>
          <div class="slot-grid">
            ${slots.map(
      (s) => {
        var _a;
        return `
              <div class="slot">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${s.empty ? "Vac\xEDo" : `D\xEDas ${(_a = s.daysPlayed) != null ? _a : 0} \xB7 v${s.gameVersion || "?"}`}</div>
                </div>
                <div class="actions">
                  <button class="btn primary" data-save="${s.slot}">Guardar aqu\xED</button>
                  ${s.empty ? "" : `<button class="btn" data-load="${s.slot}">Cargar</button>`}
                </div>
              </div>`;
      }
    ).join("")}
          </div>
          <div class="actions" style="margin-top:12px">
            <button class="btn" id="btn-export">Exportar JSON</button>
            <label class="btn ghost" style="cursor:pointer">Importar<input id="import-file" type="file" accept="application/json" hidden /></label>
            <button class="btn danger" id="btn-menu">Volver al men\xFA</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    app.querySelectorAll("[data-save]").forEach((btn) => {
      btn.onclick = () => {
        const slot = Number(btn.getAttribute("data-save"));
        state.meta.activeSlot = slot;
        saveToSlot(state, slot);
        sfx.success();
        showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-load]").forEach((btn) => {
      btn.onclick = () => {
        state = loadFromSlot(Number(btn.getAttribute("data-load")));
        sfx.click();
        showToast("Partida cargada");
        needsFullRender = true;
        render();
      };
    });
    document.getElementById("btn-export").onclick = () => {
      exportGame(state);
      showToast("Exportado");
    };
    document.getElementById("import-file").onchange = async (e) => {
      var _a;
      const f = (_a = e.target.files) == null ? void 0 : _a[0];
      if (!f) return;
      try {
        state = await importGame(f);
        showToast("Importado");
        needsFullRender = true;
        render();
      } catch (e2) {
        alert("Archivo no v\xE1lido");
      }
    };
    document.getElementById("btn-menu").onclick = () => {
      if (confirm("\xBFVolver al men\xFA? Guarda antes si hace falta.")) {
        state = null;
        renderMenu();
      }
    };
  }
  function renderStock() {
    const physical = PRODUCTS.filter((p) => p.stockType === "physical");
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Stock y pedidos</h2>
          <div class="stock-list">
            ${physical.map((p) => {
      var _a;
      const qty = (_a = state.stock[p.id]) != null ? _a : 0;
      return `<div class="stock-item">
                  <span><strong>${escapeHtml(p.name)}</strong> <span class="muted">(${p.org})</span></span>
                  <span>${qty}
                    <button class="btn" style="padding:4px 8px;margin-left:8px" data-order="${p.id}">Pedir 20</button>
                  </span>
                </div>`;
    }).join("")}
          </div>
          <h3 style="margin-top:18px">Pedidos / reservas</h3>
          <div class="log">
            ${state.orders.length ? state.orders.slice().reverse().slice(0, 40).map(
      (o) => `<div class="log-item">${o.status}${o.special ? " \xB7 ENCARGO" : ""} \xB7 ${escapeHtml(o.productName)} \xD7${o.qty} \xB7 ${o.arriveOnYmd}${o.clientName ? ` \xB7 ${escapeHtml(o.clientName)}` : ""}</div>`
    ).join("") : '<div class="muted">Sin pedidos.</div>'}
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    app.querySelectorAll("[data-order]").forEach((btn) => {
      btn.onclick = () => {
        orderStock(state, btn.getAttribute("data-order"), 20);
        showToast(state.ui.toast);
        needsFullRender = true;
        render();
      };
    });
  }
  function renderPrize() {
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Pagar premio (manual)</h2>
          <p class="muted">Para premios sueltos. Los de ticket se gestionan en el mostrador al comprobar.</p>
          <label>Cliente<br/><input id="prize-name" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" /></label>
          <label>Importe (\u20AC)<br/><input id="prize-amount" type="number" min="0.01" step="0.01" value="5" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" /></label>
          <div class="actions">
            <button class="btn primary" id="btn-prize-cash">Efectivo</button>
            <button class="btn" id="btn-prize-transfer">Transferencia</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    const doPay = (method) => {
      const name = document.getElementById("prize-name").value.trim() || "Cliente";
      const cents = Math.round(parseFloat(document.getElementById("prize-amount").value || "0") * 100);
      const ok = payPrize(state, { amountCents: cents, clientName: name, method });
      ok ? sfx.cash() : sfx.error();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
    document.getElementById("btn-prize-cash").onclick = () => doPay("cash");
    document.getElementById("btn-prize-transfer").onclick = () => doPay("transfer");
  }
  function renderDraws() {
    ensureDrawsResolved(state);
    const entries = Object.values(state.draws || {}).sort((a, b) => a.ymd < b.ymd ? 1 : -1).slice(0, 40);
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Sorteos resueltos</h2>
          <p class="muted">Se resuelven solos a la hora del sorteo (aprox. 21:00). Nacional, Primitiva, Bonoloto, Euromillones, Cup\xF3n ONCE\u2026</p>
          <div class="log">
            ${entries.length ? entries.map((d) => {
      const p = PRODUCTS.find((x) => x.id === d.productId);
      let detail = "";
      if (d.numbers) detail = d.numbers.join(", ");
      if (d.stars) detail += ` \u2605 ${d.stars.join(", ")}`;
      if (d.reintegro != null) detail += ` \xB7 R${d.reintegro}`;
      if (d.winningNumber) detail = `N\xBA ${d.winningNumber}`;
      return `<div class="log-item"><strong>${escapeHtml((p == null ? void 0 : p.name) || d.productId)}</strong> \xB7 ${d.ymd}<br/>${escapeHtml(detail)}</div>`;
    }).join("") : '<div class="muted">A\xFAn no hay sorteos. Avanza el tiempo hasta despu\xE9s de las 21:00.</div>'}
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
  }
  function renderManagement() {
    const list = [...state.prizeManagement || []].reverse();
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Gesti\xF3n de premios grandes</h2>
          <p class="muted">No se pagan de tu caja. Al cerrar d\xEDas avanzan: abierto \u2192 presentado \u2192 liquidado (paga LAE/ONCE).</p>
          <div class="log">
            ${list.length ? list.map(
      (c) => `<div class="log-item"><strong>${escapeHtml(c.clientName)}</strong> \xB7 ${formatEuro(c.amountCents)} \xB7 ${escapeHtml(c.productName)}<br/>
                        Estado: <strong>${c.status}</strong> (${c.level}) \xB7 ${escapeHtml(c.note || "")}</div>`
    ).join("") : '<div class="muted">No hay casos de gesti\xF3n.</div>'}
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
  }
  state = null;
  renderMenu();
  requestAnimationFrame(loop);
  window.__loterias = () => state;
})();
