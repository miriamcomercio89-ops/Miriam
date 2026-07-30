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
    },
    // ——— +10 rascas v0.3 ———
    {
      id: "rasca-bingo",
      name: "Bingo Instant\xE1neo",
      org: "LAE",
      priceCents: 200,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 15e5,
      prizes: [
        { cents: 200, p: 0.14 },
        { cents: 500, p: 0.05 },
        { cents: 2e3, p: 0.015 },
        { cents: 15e5, p: 4e-5 }
      ],
      description: "Bingo al instante. Hasta 15.000 \u20AC."
    },
    {
      id: "rasca-poker",
      name: "P\xF3ker de la Suerte",
      org: "LAE",
      priceCents: 200,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 18e5,
      prizes: [
        { cents: 200, p: 0.13 },
        { cents: 400, p: 0.05 },
        { cents: 2e3, p: 0.012 },
        { cents: 18e5, p: 35e-6 }
      ],
      description: "Jugada de p\xF3ker. Hasta 18.000 \u20AC."
    },
    {
      id: "rasca-fruta",
      name: "Frutas de la Fortuna",
      org: "LAE",
      priceCents: 100,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 5e5,
      prizes: [
        { cents: 100, p: 0.2 },
        { cents: 200, p: 0.07 },
        { cents: 1e3, p: 0.02 },
        { cents: 5e5, p: 6e-5 }
      ],
      description: "Cl\xE1sico de frutas."
    },
    {
      id: "rasca-20e",
      name: "M\xE1ximo 2.000.000 \u20AC",
      org: "LAE",
      priceCents: 2e3,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 2e8,
      prizes: [
        { cents: 2e3, p: 0.1 },
        { cents: 5e3, p: 0.03 },
        { cents: 5e4, p: 4e-3 },
        { cents: 2e8, p: 8e-6 }
      ],
      description: "Rasca premium 20 \u20AC."
    },
    {
      id: "rasca-10x",
      name: "\xD710 Instant\xE1neo",
      org: "LAE",
      priceCents: 1e3,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 5e7,
      prizes: [
        { cents: 1e3, p: 0.11 },
        { cents: 5e3, p: 0.025 },
        { cents: 25e3, p: 4e-3 },
        { cents: 5e7, p: 12e-6 }
      ],
      description: "Multiplica \xD710."
    },
    {
      id: "rasca-navidad",
      name: "Rasca de Navidad",
      org: "LAE",
      priceCents: 200,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 25e5,
      prizes: [
        { cents: 200, p: 0.15 },
        { cents: 500, p: 0.05 },
        { cents: 5e3, p: 8e-3 },
        { cents: 25e5, p: 3e-5 }
      ],
      description: "Edici\xF3n navide\xF1a."
    },
    {
      id: "rasca-once-oro",
      name: "Rasca ONCE de Oro",
      org: "ONCE",
      priceCents: 300,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 3e6,
      prizes: [
        { cents: 300, p: 0.12 },
        { cents: 600, p: 0.04 },
        { cents: 3e3, p: 0.01 },
        { cents: 3e6, p: 25e-6 }
      ],
      description: "Oro solidario."
    },
    {
      id: "rasca-once-estrella",
      name: "Estrella de la Suerte",
      org: "ONCE",
      priceCents: 200,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 22e5,
      prizes: [
        { cents: 200, p: 0.14 },
        { cents: 500, p: 0.05 },
        { cents: 2e3, p: 0.012 },
        { cents: 22e5, p: 3e-5 }
      ],
      description: "Encuentra la estrella."
    },
    {
      id: "rasca-once-verano",
      name: "Rasca Verano ONCE",
      org: "ONCE",
      priceCents: 200,
      commissionRate: 0.055,
      orderDays: 2,
      topPrizeCents: 2e6,
      prizes: [
        { cents: 200, p: 0.15 },
        { cents: 1e3, p: 0.03 },
        { cents: 2e6, p: 3e-5 }
      ],
      description: "Edici\xF3n verano."
    },
    {
      id: "rasca-lucky",
      name: "Lucky 7",
      org: "LAE",
      priceCents: 100,
      commissionRate: 0.06,
      orderDays: 2,
      topPrizeCents: 777e3,
      prizes: [
        { cents: 100, p: 0.17 },
        { cents: 700, p: 0.04 },
        { cents: 777e3, p: 5e-5 }
      ],
      description: "La suerte del 7."
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
    // ——— LAE ———
    {
      id: "lae-nacional",
      name: "Loter\xEDa Nacional",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 3e3,
      commissionRate: 0.04,
      drawDays: [4, 6],
      drawHour: 21,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "D\xE9cimos jueves y s\xE1bado."
    },
    {
      id: "lae-nacional-jueves",
      name: "Nacional (solo jueves)",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 3e3,
      commissionRate: 0.04,
      drawDays: [4],
      drawHour: 21,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "D\xE9cimo del sorteo del jueves."
    },
    {
      id: "lae-navidad",
      name: "Sorteo de Navidad",
      org: "LAE",
      tpvCategory: "LAE",
      category: "especial",
      priceCents: 2e4,
      commissionRate: 0.04,
      drawDays: [],
      seasonMonths: [10, 11, 12],
      orderDays: 3,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "El Gordo de Navidad."
    },
    {
      id: "lae-nino",
      name: "Sorteo del Ni\xF1o",
      org: "LAE",
      tpvCategory: "LAE",
      category: "especial",
      priceCents: 2e4,
      commissionRate: 0.04,
      drawDays: [],
      seasonMonths: [12, 1],
      orderDays: 3,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Sorteo del Ni\xF1o."
    },
    {
      id: "lae-primitiva",
      name: "La Primitiva",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 100,
      commissionRate: 0.055,
      drawDays: [3, 6],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "6from49",
      description: "6/49 + reintegro.",
      bet: { pick: 6, from: 49, reintegro: true }
    },
    {
      id: "lae-bonoloto",
      name: "Bonoloto",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 50,
      commissionRate: 0.055,
      drawDays: [1, 2, 3, 4, 5, 6],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "6from49",
      description: "6/49 L\u2013S.",
      bet: { pick: 6, from: 49, reintegro: true }
    },
    {
      id: "lae-euromillones",
      name: "Euromillones",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 250,
      commissionRate: 0.055,
      drawDays: [2, 5],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "euro",
      description: "5/50 + 2 estrellas.",
      bet: { pickMain: 5, fromMain: 50, pickStars: 2, fromStars: 12 }
    },
    {
      id: "lae-gordo-primitiva",
      name: "El Gordo de la Primitiva",
      org: "LAE",
      tpvCategory: "LAE",
      category: "sorteo",
      priceCents: 150,
      commissionRate: 0.055,
      drawDays: [0],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "gordo",
      description: "5/54 + clave. Domingos.",
      bet: { pick: 5, from: 54, claveFrom: 9 }
    },
    {
      id: "lae-quiniela",
      name: "La Quiniela",
      org: "LAE",
      tpvCategory: "LAE",
      category: "apuestas",
      priceCents: 75,
      commissionRate: 0.06,
      drawDays: [0],
      drawHour: 22,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "quiniela",
      description: "14 partidos 1X2 + pleno al 15."
    },
    {
      id: "lae-quinigol",
      name: "Quinigol",
      org: "LAE",
      tpvCategory: "LAE",
      category: "apuestas",
      priceCents: 100,
      commissionRate: 0.06,
      drawDays: [0],
      drawHour: 22,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "quinigol",
      description: "Goles 0/1/2/M en 6 partidos."
    },
    {
      id: "lae-lototurf",
      name: "Lototurf",
      org: "LAE",
      tpvCategory: "LAE",
      category: "apuestas",
      priceCents: 100,
      commissionRate: 0.06,
      drawDays: [0],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "lototurf",
      description: "Loter\xEDa + h\xEDpica."
    },
    // ——— ONCE ———
    {
      id: "once-cupon",
      name: "Cup\xF3n Diario ONCE",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "sorteo",
      priceCents: 200,
      commissionRate: 0.05,
      drawDays: [1, 2, 3, 4, 5],
      drawHour: 21,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Cup\xF3n L\u2013V."
    },
    {
      id: "once-cuponazo",
      name: "Cuponazo ONCE",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "especial",
      priceCents: 500,
      commissionRate: 0.05,
      drawDays: [5],
      drawHour: 21,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Viernes especial."
    },
    {
      id: "once-sueldazo",
      name: "Sueldazo Fin de Semana",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "especial",
      priceCents: 300,
      commissionRate: 0.05,
      drawDays: [0],
      drawHour: 21,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Sorteo dominical."
    },
    {
      id: "once-eurojackpot",
      name: "Eurojackpot",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "sorteo",
      priceCents: 200,
      commissionRate: 0.05,
      drawDays: [2, 5],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "eurojackpot",
      description: "5/50 + 2/12."
    },
    {
      id: "once-super-once",
      name: "Super Once",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "sorteo",
      priceCents: 100,
      commissionRate: 0.05,
      drawDays: [1, 2, 3, 4, 5, 6, 0],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "superonce",
      description: "Elige 5 n\xFAmeros del 1\u201349 (base)."
    },
    {
      id: "once-triplex",
      name: "Triplex",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "sorteo",
      priceCents: 50,
      commissionRate: 0.05,
      drawDays: [1, 2, 3, 4, 5, 6, 0],
      drawHour: 21,
      orderDays: 0,
      stockType: "terminal",
      checkable: true,
      needsNumbers: true,
      numberMode: "triplex",
      description: "3 cifras."
    },
    {
      id: "once-extra-verano",
      name: "Extraordinario ONCE Verano",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "especial",
      priceCents: 600,
      commissionRate: 0.05,
      drawDays: [],
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Sorteo extraordinario de verano."
    },
    {
      id: "once-extra-navidad",
      name: "Extraordinario ONCE Navidad",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "especial",
      priceCents: 600,
      commissionRate: 0.05,
      drawDays: [],
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Sorteo extraordinario de Navidad."
    },
    {
      id: "once-extra-dia",
      name: "Extraordinario D\xEDa de la ONCE",
      org: "ONCE",
      tpvCategory: "ONCE",
      category: "especial",
      priceCents: 600,
      commissionRate: 0.05,
      drawDays: [],
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "nacional",
      description: "Sorteo del D\xEDa de la ONCE."
    },
    // ——— Autonómicas / provinciales / locales inventadas ———
    {
      id: "and-fortuna",
      name: "Andaluc\xEDa Fortuna",
      org: "Auton\xF3mica",
      tpvCategory: "Auton\xF3micas",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.08,
      drawDays: [5],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Sorteo andaluz ficticio."
    },
    {
      id: "and-olivo",
      name: "El Olivo de la Suerte",
      org: "Auton\xF3mica",
      tpvCategory: "Auton\xF3micas",
      category: "inventada",
      priceCents: 150,
      commissionRate: 0.08,
      drawDays: [2],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Sorteo inventado andaluz."
    },
    {
      id: "and-costa",
      name: "Sorteo Costa del Sol",
      org: "Auton\xF3mica",
      tpvCategory: "Auton\xF3micas",
      category: "inventada",
      priceCents: 200,
      commissionRate: 0.08,
      drawDays: [6],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Bote regional ficticio."
    },
    {
      id: "mal-premio",
      name: "Premio M\xE1laga",
      org: "Provincial",
      tpvCategory: "Provinciales",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.1,
      drawDays: [4],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Provincial inventada."
    },
    {
      id: "mal-axarquia",
      name: "Axarqu\xEDa Premia",
      org: "Provincial",
      tpvCategory: "Provinciales",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.1,
      drawDays: [3],
      drawHour: 20,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Sorteo comarcal inventado."
    },
    {
      id: "alo-local",
      name: "\xC1lora Local",
      org: "Local",
      tpvCategory: "Locales",
      category: "inventada",
      priceCents: 50,
      commissionRate: 0.12,
      drawDays: [5],
      drawHour: 19,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Rifa local \xC1lora."
    },
    {
      id: "alo-hoya",
      name: "Hoya de M\xE1laga",
      org: "Local",
      tpvCategory: "Locales",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.1,
      drawDays: [3],
      drawHour: 19,
      orderDays: 2,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Sorteo del valle."
    },
    {
      id: "alo-chorro",
      name: "Suerte del Chorro",
      org: "Local",
      tpvCategory: "Locales",
      category: "inventada",
      priceCents: 100,
      commissionRate: 0.12,
      drawDays: [6],
      drawHour: 19,
      orderDays: 1,
      stockType: "physical",
      checkable: true,
      needsNumbers: true,
      numberMode: "5from40",
      description: "Rifa tur\xEDstica local inventada."
    },
    // ——— Rascas ———
    ...SCRATCH_CARDS.map((c) => ({
      ...c,
      tpvCategory: "Rascas",
      category: "rasca",
      stockType: "physical",
      checkable: true,
      instant: true,
      needsNumbers: false,
      drawDays: []
    }))
  ];
  var TPV_CATEGORIES = ["LAE", "ONCE", "Rascas", "Auton\xF3micas", "Provinciales", "Locales"];
  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }
  function productsByTpvCategory(cat) {
    return PRODUCTS.filter((p) => p.tpvCategory === cat);
  }
  var CORE_DRAW_IDS = [
    "lae-nacional",
    "lae-nacional-jueves",
    "lae-primitiva",
    "lae-bonoloto",
    "lae-euromillones",
    "lae-gordo-primitiva",
    "lae-quiniela",
    "lae-quinigol",
    "lae-lototurf",
    "once-cupon",
    "once-cuponazo",
    "once-sueldazo",
    "once-eurojackpot",
    "once-super-once",
    "once-triplex",
    "once-extra-verano",
    "once-extra-navidad",
    "once-extra-dia",
    "and-fortuna",
    "and-olivo",
    "and-costa",
    "mal-premio",
    "mal-axarquia",
    "alo-local",
    "alo-hoya",
    "alo-chorro",
    "lae-navidad",
    "lae-nino"
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
  function generateAbonadosAndPenas() {
    const base = generateRegularCustomers(60, 9090);
    const subs = [
      "Primitiva + Bonoloto semanal",
      "Euromillones martes y viernes",
      "Nacional del s\xE1bado",
      "Cup\xF3n ONCE diario",
      "Bonoloto diario"
    ];
    const abonados = base.slice(0, 40).map((c, i) => ({
      ...c,
      id: `abo-${i + 1}`,
      kind: "abonado",
      favoriteProduct: c.preferredProducts[0],
      subscription: subs[i % subs.length],
      prizesClaimed: [],
      orders: []
    }));
    const penaDefs = [
      ["pena-1", "Pe\xF1a El Desfiladero", "Calle Real", ["lae-euromillones", "lae-primitiva"], "Bote Euromillones", 24, [2, 5]],
      ["pena-2", "Pe\xF1a Virgen de Flores", "Plaza Baja", ["lae-nacional", "lae-navidad"], "Nacional jueves/s\xE1bado", 15, [4, 6]],
      ["pena-3", "Pe\xF1a del Chorro", "Camino de El Chorro", ["lae-bonoloto", "once-eurojackpot"], "Bonoloto diario", 30, [1, 2, 3, 4, 5]],
      ["pena-4", "Pe\xF1a Caminito", "Avenida de Andaluc\xEDa", ["lae-euromillones", "rasca-jackpot"], "Euromillones + rascas", 18, [2, 5]],
      ["pena-5", "Pe\xF1a San Juan", "Calle Veracruz", ["once-cuponazo", "lae-primitiva"], "Cuponazo viernes", 12, [5]],
      ["pena-6", "Pe\xF1a Hoya Dulce", "Calle Hoyo", ["lae-quiniela", "lae-bonoloto"], "Quiniela domingo", 20, [5, 0]],
      ["pena-7", "Pe\xF1a Estaci\xF3n", "Calle Estaci\xF3n", ["lae-nacional", "alo-local"], "D\xE9cimos locales", 10, [4]],
      ["pena-8", "Pe\xF1a Guadalhorce", "Calle Ancha", ["lae-gordo-primitiva", "lae-primitiva"], "Gordo + Primitiva", 22, [3, 6]]
    ];
    const penas = penaDefs.map(([id, name, street, prefs, subscription, members, preferredDays], i) => ({
      id,
      kind: "pena",
      name,
      regular: true,
      street,
      preferredProducts: prefs,
      visitChance: 0.1 + i % 3 * 0.02,
      prefersPayment: ["transfer", "cash", "bizum"][i % 3],
      trait: TRAITS[i % TRAITS.length],
      line: "Pedido para la pe\xF1a.",
      favoriteProduct: prefs[0],
      subscription,
      members,
      history: [],
      prizesClaimed: [],
      orders: [],
      preferredDays
    }));
    return { abonados, penas };
  }

  // src/data/events.js
  function aloraEventsForYear(year) {
    return {
      // Semana Santa orientativa (fechas fijas aprox. para gameplay; no litúrgicas exactas)
      [`${year}-03-28`]: { id: "ss-prev", name: "V\xEDspera Semana Santa", crowd: 0.4 },
      [`${year}-03-29`]: { id: "ss", name: "Semana Santa en \xC1lora", crowd: 0.75 },
      [`${year}-04-01`]: { id: "ss", name: "Semana Santa en \xC1lora", crowd: 0.8 },
      [`${year}-04-02`]: { id: "ss", name: "Jueves/Viernes Santo ambiente", crowd: 0.5 },
      // Feria
      [`${year}-06-12`]: { id: "feria-prep", name: "Preparativos Feria de \xC1lora", crowd: 0.3 },
      [`${year}-06-13`]: { id: "feria-prep", name: "Preparativos Feria de \xC1lora", crowd: 0.45 },
      [`${year}-06-14`]: { id: "feria", name: "Feria de \xC1lora", crowd: 0.95 },
      [`${year}-06-15`]: { id: "feria", name: "Feria de \xC1lora", crowd: 1.1 },
      [`${year}-06-16`]: { id: "feria", name: "Feria de \xC1lora", crowd: 1 },
      [`${year}-06-17`]: { id: "feria", name: "Cierre de Feria", crowd: 0.7 },
      [`${year}-06-23`]: { id: "san-juan-v", name: "V\xEDspera de San Juan", crowd: 0.55 },
      [`${year}-06-24`]: { id: "san-juan", name: "San Juan (\xC1lora)", crowd: 0.85, holidayAlso: true },
      [`${year}-08-15`]: { id: "verano", name: "Asunci\xF3n / verano en el pueblo", crowd: 0.35 },
      [`${year}-09-06`]: { id: "flores-prep", name: "Preparativos Virgen de Flores", crowd: 0.4 },
      [`${year}-09-07`]: { id: "flores-v\xEDspera", name: "V\xEDspera Virgen de Flores", crowd: 0.65 },
      [`${year}-09-08`]: { id: "virgen-flores", name: "Virgen de Flores (\xC1lora)", crowd: 1.05, holidayAlso: true },
      [`${year}-09-09`]: { id: "flores-octava", name: "Ambientaci\xF3n Virgen de Flores", crowd: 0.45 },
      [`${year}-10-12`]: { id: "puente", name: "Puente / fiesta nacional", crowd: 0.25 },
      [`${year}-11-01`]: { id: "santos", name: "Todos los Santos", crowd: 0.2 },
      // Navidad pueblo
      [`${year}-12-20`]: { id: "navidad-cola", name: "Colas de Navidad en \xC1lora", crowd: 0.9 },
      [`${year}-12-22`]: { id: "gordo", name: "D\xEDa del Gordo (ambiente)", crowd: 1.2 },
      [`${year}-12-23`]: { id: "navidad-cola", name: "\xDAltimos d\xE9cimos", crowd: 0.85 }
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

  // src/game/notices.js
  function todaysDrawNotices(state2) {
    const d = gameDate(state2);
    const dow = d.getUTCDay();
    const ymd2 = gameYmd(state2);
    const notices = [];
    const catalog = [
      { id: "lae-bonoloto", days: [1, 2, 3, 4, 5, 6], label: "Bonoloto" },
      { id: "lae-primitiva", days: [3, 6], label: "Primitiva" },
      { id: "lae-euromillones", days: [2, 5], label: "Euromillones" },
      { id: "lae-nacional", days: [4, 6], label: "Loter\xEDa Nacional" },
      { id: "lae-gordo-primitiva", days: [0], label: "Gordo de la Primitiva" },
      { id: "lae-quiniela", days: [0], label: "Quiniela" },
      { id: "once-cupon", days: [1, 2, 3, 4, 5], label: "Cup\xF3n ONCE" },
      { id: "once-cuponazo", days: [5], label: "Cuponazo" },
      { id: "once-eurojackpot", days: [2, 5], label: "Eurojackpot" },
      { id: "once-sueldazo", days: [0], label: "Sueldazo" }
    ];
    for (const c of catalog) {
      if (c.days.includes(dow)) notices.push(c.label);
    }
    if (ymd2.endsWith("-12-22")) notices.push("Sorteo de Navidad");
    if (ymd2.endsWith("-01-06")) notices.push("Sorteo del Ni\xF1o");
    for (const ex of state2.onceExtras || []) {
      if (ex.ymd === ymd2) notices.push(ex.name);
    }
    return notices;
  }
  function specialOrderDeadlines(state2) {
    const y = gameDate(state2).getUTCFullYear();
    const m = gameDate(state2).getUTCMonth() + 1;
    return {
      navidad: {
        productId: "lae-navidad",
        deliverBy: `${m <= 12 ? y : y}-12-21`,
        drawOn: `${y}-12-22`
      },
      nino: {
        productId: "lae-nino",
        deliverBy: m === 1 ? `${y}-01-05` : `${y + 1}-01-05`,
        drawOn: m === 1 ? `${y}-01-06` : `${y + 1}-01-06`
      }
    };
  }
  function createCalendarOrder(state2, { productId, qty, clientId, clientName, deliverBy }) {
    const p = getProduct(productId);
    if (!p) return null;
    const order = {
      id: `cal-${Date.now()}`,
      productId,
      productName: p.name,
      qty,
      clientId,
      clientName,
      arriveOnYmd: deliverBy,
      deliverBy,
      status: "pending",
      reserved: true,
      special: true,
      calendar: true
    };
    state2.orders.push(order);
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Encargo calendario: ${clientName} \xB7 ${p.name} \xD7${qty} (entrega ${deliverBy})`
    });
    return order;
  }
  function ensureOnceExtras(state2) {
    var _a;
    if ((_a = state2.onceExtras) == null ? void 0 : _a.length) return state2;
    const y = gameDate(state2).getUTCFullYear();
    state2.onceExtras = [
      { id: "once-extra-verano", name: "Extraordinario ONCE Verano", ymd: `${y}-07-15`, priceCents: 600 },
      { id: "once-extra-navidad", name: "Extraordinario ONCE Navidad", ymd: `${y}-12-28`, priceCents: 600 },
      { id: "once-extra-dia", name: "Extraordinario D\xEDa de la ONCE", ymd: `${y}-12-03`, priceCents: 600 }
    ];
    return state2;
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

  // src/game/jackpots.js
  var JACKPOT_GAMES = [
    { id: "lae-euromillones", name: "Euromillones", base: 17e8, min: 17e8, step: 5e8 },
    { id: "lae-primitiva", name: "Primitiva", base: 8e8, min: 14e7, step: 2e8 },
    { id: "lae-bonoloto", name: "Bonoloto", base: 4e7, min: 4e7, step: 2e7 },
    { id: "lae-gordo-primitiva", name: "Gordo Primitiva", base: 5e8, min: 5e8, step: 1e8 },
    { id: "once-eurojackpot", name: "Eurojackpot", base: 1e9, min: 1e9, step: 4e8 },
    { id: "once-cuponazo", name: "Cuponazo", base: 9e8, min: 9e8, step: 1e8 }
  ];
  function ensureJackpots(state2) {
    var _a;
    if (!state2.jackpots) state2.jackpots = {};
    const ymd2 = gameYmd(state2);
    const weekKey = weekId(gameDate(state2));
    if (state2.jackpots.weekKey === weekKey && Object.keys(state2.jackpots.values || {}).length) {
      return state2;
    }
    const rng = mulberry322(hashSeed("jackpot", weekKey));
    const values = {};
    for (const g of JACKPOT_GAMES) {
      const prev = ((_a = state2.jackpots.values) == null ? void 0 : _a[g.id]) || g.base;
      const roll = rng();
      let next;
      if (roll < 0.18) next = g.min;
      else if (roll < 0.55) next = prev + g.step;
      else next = prev + Math.floor(g.step * (0.5 + rng()));
      values[g.id] = Math.max(g.min, next);
    }
    state2.jackpots = { weekKey, updatedYmd: ymd2, values };
    return state2;
  }
  function weekId(d) {
    const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((tmp - yearStart) / 864e5 + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  function jackpotList(state2) {
    ensureJackpots(state2);
    return JACKPOT_GAMES.map((g) => ({
      id: g.id,
      name: g.name,
      cents: state2.jackpots.values[g.id] || g.base,
      label: formatEuro(state2.jackpots.values[g.id] || g.base)
    }));
  }
  function formatJackpotShort(cents) {
    if (cents >= 1e8) return `${(cents / 1e8).toFixed(1)} M\u20AC`;
    return formatEuro(cents);
  }

  // src/game/state.js
  var STARTING_BANK_CENTS = 95e4;
  var SAVE_VERSION = 4;
  var GAME_VERSION = "0.3";
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
    const { abonados, penas } = generateAbonadosAndPenas();
    const stock = {};
    for (const p of PRODUCTS) {
      if (p.stockType === "physical") {
        stock[p.id] = p.category === "rasca" ? 60 : p.id.includes("navidad") || p.id.includes("nino") ? 30 : 40;
      } else {
        stock[p.id] = null;
      }
    }
    const game = {
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
      office: { isOpen: true, openedToday: true, dayStarted: true },
      finance: {
        bankCents: STARTING_BANK_CENTS,
        drawer: float,
        floatTargetCents: drawerTotalCents(float),
        daySalesCents: 0,
        dayCommissionCents: 0,
        dayPrizesPaidCents: 0,
        dayPrizesReimbursableCents: 0,
        dayExpensesCents: 0,
        dayShortageCents: 0,
        changeErrorsToday: 0,
        lastSettlement: null,
        ledger: [],
        weeklySnapshots: []
      },
      jackpots: {},
      onceExtras: [],
      stock,
      orders: [],
      reservations: [],
      tickets: [],
      draws: {},
      prizeManagement: [],
      nextIds: { ticket: 1 },
      customers: {
        regulars: generateRegularCustomers(280),
        abonados,
        penas,
        queue: [],
        current: null,
        servedToday: 0,
        nextSpawnAtMs: start.getTime() + 10 * 1e3
      },
      settings: { music: true, sfx: true, autosaveMinutes: 2 },
      dayLog: [],
      holidays,
      events,
      stats: {
        totalSalesCents: 0,
        totalCustomers: 0,
        daysPlayed: 0,
        totalCommissionCents: 0,
        totalPrizesPaidCents: 0,
        totalShortageCents: 0
      },
      ui: {
        screen: "counter",
        toast: null,
        paymentSession: null,
        tpv: null,
        arqueo: null,
        lastTickets: [],
        lastCloseSummary: null,
        fichaId: null
      }
    };
    return finalizeNewGame(game);
  }
  function finalizeNewGame(state2) {
    ensureOnceExtras(state2);
    ensureJackpots(state2);
    return state2;
  }
  function migrateState(data) {
    if (!data) return createNewGame();
    if (!data.tickets) data.tickets = [];
    if (!data.draws) data.draws = {};
    if (!data.prizeManagement) data.prizeManagement = [];
    if (!data.events) data.events = buildAloraEvents(2025, 2032);
    if (!data.nextIds) data.nextIds = { ticket: 1 };
    if (!data.settings) data.settings = { music: true, sfx: true, autosaveMinutes: 2 };
    if (!data.customers.abonados || !data.customers.penas) {
      const { abonados, penas } = generateAbonadosAndPenas();
      data.customers.abonados = data.customers.abonados || abonados;
      data.customers.penas = data.customers.penas || penas;
    }
    if (!data.customers.queue) data.customers.queue = [];
    if (data.finance && data.finance.dayPrizesReimbursableCents == null) {
      data.finance.dayPrizesReimbursableCents = 0;
    }
    if (!data.stats) data.stats = {};
    data.stats.totalCommissionCents = data.stats.totalCommissionCents || 0;
    data.stats.totalPrizesPaidCents = data.stats.totalPrizesPaidCents || 0;
    data.stats.totalShortageCents = data.stats.totalShortageCents || 0;
    data.jackpots = data.jackpots || {};
    data.ui = data.ui || {};
    data.ui.tpv = null;
    data.ui.arqueo = null;
    data.version = SAVE_VERSION;
    data.gameVersion = GAME_VERSION;
    ensureOnceExtras(data);
    ensureJackpots(data);
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
  function maybeAutosave(state2, lastAutosaveRealMs2, intervalMs = 12e4) {
    var _a;
    const now = Date.now();
    if (now - lastAutosaveRealMs2 < intervalMs) return lastAutosaveRealMs2;
    const slot = ((_a = state2.meta) == null ? void 0 : _a.activeSlot) || 1;
    try {
      state2.meta.activeSlot = slot;
      saveToSlot(state2, slot);
    } catch (e) {
    }
    return now;
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
    switch (p.numberMode || productId) {
      case "6from49":
        return {
          productId,
          ymd: ymd2,
          numbers: pickUnique(rng, 6, 49),
          complementary: productId === "lae-primitiva" ? pickInt(rng, 1, 49) : null,
          reintegro: pickInt(rng, 0, 9)
        };
      case "euro":
      case "eurojackpot":
        return { productId, ymd: ymd2, numbers: pickUnique(rng, 5, 50), stars: pickUnique(rng, 2, 12) };
      case "gordo":
        return { productId, ymd: ymd2, numbers: pickUnique(rng, 5, 54), clave: pickInt(rng, 1, 9) };
      case "nacional":
        return {
          productId,
          ymd: ymd2,
          winningNumber: productId === "once-triplex" ? String(pickInt(rng, 0, 999)).padStart(3, "0") : pad5(pickInt(rng, 0, 99999))
        };
      case "triplex":
        return { productId, ymd: ymd2, winningNumber: String(pickInt(rng, 0, 999)).padStart(3, "0") };
      case "quiniela": {
        const column = Array.from({ length: 14 }, () => ["1", "X", "2"][pickInt(rng, 0, 2)]);
        return { productId, ymd: ymd2, column, pleno: ["0", "1", "2", "M"][pickInt(rng, 0, 3)] };
      }
      case "quinigol":
        return {
          productId,
          ymd: ymd2,
          goals: Array.from({ length: 6 }, () => ["0", "1", "2", "M"][pickInt(rng, 0, 3)])
        };
      case "superonce":
      case "lototurf":
        return { productId, ymd: ymd2, numbers: pickUnique(rng, 5, 49) };
      case "5from40":
      default:
        if (["once-cupon", "once-cuponazo", "once-sueldazo", "lae-nacional", "lae-nacional-jueves", "lae-navidad", "lae-nino"].includes(productId)) {
          return { productId, ymd: ymd2, winningNumber: pad5(pickInt(rng, 0, 99999)) };
        }
        return { productId, ymd: ymd2, numbers: pickUnique(rng, 5, 40) };
    }
  }
  function generateBetSelection(productId, rng) {
    const p = getProduct(productId);
    if (!p) return {};
    const mode = p.numberMode;
    if (mode === "6from49") {
      return { numbers: pickUnique(rng, 6, 49), reintegro: pickInt(rng, 0, 9) };
    }
    if (mode === "euro" || mode === "eurojackpot") {
      return { numbers: pickUnique(rng, 5, 50), stars: pickUnique(rng, 2, 12) };
    }
    if (mode === "gordo") {
      return { numbers: pickUnique(rng, 5, 54), clave: pickInt(rng, 1, 9) };
    }
    if (mode === "nacional") {
      return { number: pad5(pickInt(rng, 0, 99999)) };
    }
    if (mode === "triplex") {
      return { number: String(pickInt(rng, 0, 999)).padStart(3, "0") };
    }
    if (mode === "quiniela") {
      return {
        column: Array.from({ length: 14 }, () => ["1", "X", "2"][pickInt(rng, 0, 2)]),
        pleno: ["0", "1", "2", "M"][pickInt(rng, 0, 3)]
      };
    }
    if (mode === "quinigol") {
      return { goals: Array.from({ length: 6 }, () => ["0", "1", "2", "M"][pickInt(rng, 0, 3)]) };
    }
    if (mode === "superonce" || mode === "lototurf") {
      return { numbers: pickUnique(rng, 5, 49) };
    }
    if (mode === "5from40") {
      return { numbers: pickUnique(rng, 5, 40) };
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
    for (let i = 0; i < 21; i++) {
      const dow = d.getUTCDay();
      if (p.drawDays.includes(dow)) {
        const hour = (_b = p.drawHour) != null ? _b : DEFAULT_DRAW_HOUR;
        if (i > 0 || fromDate.getUTCHours() < hour) return ymdFromDate(d);
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
    for (let back = 0; back <= 21; back++) {
      const d = new Date(now.getTime());
      d.setUTCDate(d.getUTCDate() - back);
      d.setUTCHours(12, 0, 0, 0);
      const ymd2 = ymdFromDate(d);
      for (const productId of CORE_DRAW_IDS) {
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
        }
      }
    }
    return state2;
  }
  function getDraw(state2, productId, ymd2) {
    var _a;
    return ((_a = state2.draws) == null ? void 0 : _a[drawKey(productId, ymd2)]) || null;
  }
  function listDrawHistory(state2, limit = 60) {
    return Object.values(state2.draws || {}).sort((a, b) => a.ymd < b.ymd ? 1 : a.ymd > b.ymd ? -1 : a.productId.localeCompare(b.productId)).slice(0, limit);
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
        const ticket = buildTicket(state2, product, clientId, clientName, rng, item);
        ticket.saleMethod = method;
        state2.tickets.push(ticket);
        created.push(ticket);
      }
    }
    return created;
  }
  function buildTicket(state2, product, clientId, clientName, rng, item = {}) {
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
        hiddenPrizeCents: prize,
        selection: { code: `R${pad5(Math.floor(rng() * 1e5))}` }
      };
    }
    const drawYmd = nextDrawYmd(product.id, gameDate(state2));
    const selection = item.selection || generateBetSelection(product.id, rng);
    return {
      ...base,
      kind: "draw",
      drawYmd,
      selection,
      numberSource: item.numberSource || "random",
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
    if (id === "lae-euromillones" || id === "once-eurojackpot") {
      const hits2 = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
      const stars = (sel.stars || []).filter((n) => draw.stars.includes(n)).length;
      let prize2 = 0;
      if (hits2 === 5 && stars === 2) prize2 = id === "once-eurojackpot" ? 3e9 : 5e9;
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
    if (id === "lae-gordo-primitiva") {
      const hits2 = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
      const clave = sel.clave === draw.clave;
      let prize2 = 0;
      if (hits2 === 5 && clave) prize2 = 5e8;
      else if (hits2 === 5) prize2 = 8e5;
      else if (hits2 === 4 && clave) prize2 = 4e4;
      else if (hits2 === 4) prize2 = 8e3;
      else if (hits2 === 3 && clave) prize2 = 3e3;
      else if (hits2 === 3) prize2 = 1e3;
      else if (clave) prize2 = getProduct(id).priceCents;
      return { prizeCents: prize2, detail: prize2 ? `${hits2} + clave` : "Sin premio" };
    }
    if (id === "lae-quiniela") {
      const hits2 = (sel.column || []).filter((v, i) => v === (draw.column || [])[i]).length;
      let prize2 = 0;
      if (hits2 >= 14) prize2 = 2e8;
      else if (hits2 === 13) prize2 = 5e5;
      else if (hits2 === 12) prize2 = 2e4;
      else if (hits2 === 11) prize2 = 4e3;
      else if (hits2 === 10) prize2 = 1e3;
      return { prizeCents: prize2, detail: `${hits2} aciertos` };
    }
    if (id === "lae-quinigol") {
      const hits2 = (sel.goals || []).filter((v, i) => v === (draw.goals || [])[i]).length;
      const prize2 = hits2 === 6 ? 5e6 : hits2 === 5 ? 2e4 : hits2 === 4 ? 2e3 : 0;
      return { prizeCents: prize2, detail: `${hits2} partidos` };
    }
    if (id === "lae-nacional" || id === "lae-nacional-jueves" || id === "lae-navidad" || id === "lae-nino" || id === "once-cupon" || id === "once-cuponazo" || id === "once-sueldazo" || id === "once-triplex") {
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
      state2.finance.changeErrorsToday = (state2.finance.changeErrorsToday || 0) + 1;
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
    state2.stats.totalCommissionCents = (state2.stats.totalCommissionCents || 0) + commission;
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
    if (month >= 6 && month <= 9) f += 0.45;
    if (month === 10 && day >= 10 && day <= 14) f += 0.35;
    if (month === 12 && day >= 5 && day <= 9) f += 0.25;
    const ev = eventOn(gameYmd(state2), state2.events);
    if (ev) f += ev.crowd || 0;
    return f;
  }
  function isTouristSeason(state2) {
    const m = gameDate(state2).getUTCMonth() + 1;
    const d = gameDate(state2).getUTCDate();
    if (m >= 6 && m <= 9) return true;
    if (m === 10 && d >= 10 && d <= 14) return true;
    if (m === 12 && d >= 5 && d <= 9) return true;
    return false;
  }
  function maybeSpawnCustomers(state2) {
    if (!isOpenHours(state2)) return state2;
    if (["cash", "close", "tpv", "prize-flow"].includes(state2.ui.screen)) return state2;
    ensureDrawsResolved(state2);
    const now = state2.clock.gameTimeMs;
    if (now < state2.customers.nextSpawnAtMs) return state2;
    if (!state2.customers.current) {
      if (state2.customers.queue.length > 0) {
        state2.customers.current = state2.customers.queue.shift();
      } else {
        const client = pickArrivingClient(state2);
        if (client) {
          attachIntent(state2, client);
          state2.customers.current = client;
        }
      }
      scheduleNextSpawn(state2);
      return state2;
    }
    if (Math.random() < 0.55) {
      const client = pickArrivingClient(state2);
      if (client) {
        attachIntent(state2, client);
        state2.customers.queue.push(client);
      }
    }
    scheduleNextSpawn(state2);
    return state2;
  }
  function scheduleNextSpawn(state2) {
    const factor = crowdFactor(state2);
    const minMs = 16 * 1e3 / factor;
    const maxMs = 70 * 1e3 / factor;
    state2.customers.nextSpawnAtMs = state2.clock.gameTimeMs + minMs + Math.random() * (maxMs - minMs);
  }
  function pickArrivingClient(state2) {
    var _a, _b;
    const rng = Math.random;
    if (rng() < 0.08 && ((_a = state2.customers.abonados) == null ? void 0 : _a.length)) {
      const a = state2.customers.abonados[Math.floor(rng() * state2.customers.abonados.length)];
      return { ...a };
    }
    if (rng() < 0.06 && ((_b = state2.customers.penas) == null ? void 0 : _b.length)) {
      const a = state2.customers.penas[Math.floor(rng() * state2.customers.penas.length)];
      return { ...a };
    }
    const touristBoost = isTouristSeason(state2) ? 0.15 : 0;
    if (rng() < 0.28 + (crowdFactor(state2) - 1) * 0.08 + touristBoost) {
      const v = makeVisitor();
      if (isTouristSeason(state2) && rng() < 0.55) {
        v.street = "Turista (Caminito / El Chorro)";
        v.line = "De pasada por el Caminito, me llevo algo.";
        v.preferredProducts = ["rasca-jackpot", "lae-nacional", "alo-chorro", "rasca-once-verano"];
      }
      return v;
    }
    const dow = gameDate(state2).getUTCDay();
    const candidates = state2.customers.regulars.filter((c) => {
      var _a2;
      let chance = c.visitChance * crowdFactor(state2);
      if ((_a2 = c.preferredDays) == null ? void 0 : _a2.includes(dow)) chance *= 2.2;
      return rng() < chance;
    });
    if (!candidates.length) {
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
    if (claimable.length && roll < 0.28) {
      client.intent = "claim";
      client.ticketFocus = claimable[Math.floor(rng() * claimable.length)];
      client.wishlist = [];
      client.note = `Viene a cobrar ${formatEuro(client.ticketFocus.prizeCents)}.`;
      return client;
    }
    if (managed.length && roll < 0.15) {
      client.intent = "managed_ask";
      client.ticketFocus = managed[0];
      client.wishlist = [];
      client.note = "Pregunta por su premio en gesti\xF3n.";
      return client;
    }
    if (checkable.length && roll < 0.4) {
      const ticket = checkable[Math.floor(rng() * checkable.length)];
      client.intent = "check";
      client.ticketFocus = ticket;
      client.wishlist = [];
      client.note = `Quiere comprobar ${ticket.productName}.`;
      return client;
    }
    if (isSpecialSeason(state2) && rng() < 0.12) {
      client.intent = "reserve_special";
      const m = gameDate(state2).getUTCMonth() + 1;
      const productId = m === 1 ? "lae-nino" : "lae-navidad";
      const p = getProduct(productId);
      const qty = 1 + Math.floor(rng() * 4);
      client.wishlist = [{ productId: p.id, productName: p.name, qty, preferDictate: false }];
      client.note = `Encargo de ${p.name} \xD7${qty}`;
      return client;
    }
    client.intent = "buy";
    client.wishlist = buildRichWishlist(state2, client);
    client.note = client.line || "Quiere varias cosas.";
    return client;
  }
  function buildRichWishlist(state2, client) {
    var _a, _b, _c;
    const rng = mulberry322(hashSeed("wish", state2.clock.gameTimeMs, client.id, Math.floor(Math.random() * 1e9)));
    const templates = WISH_TEMPLATES;
    const tpl = templates[Math.floor(rng() * templates.length)];
    const lines = [];
    for (const slot of tpl) {
      if (rng() > ((_a = slot.p) != null ? _a : 1)) continue;
      let productId = slot.id;
      if (slot.pool) productId = slot.pool[Math.floor(rng() * slot.pool.length)];
      if (slot.usePref && ((_b = client.preferredProducts) == null ? void 0 : _b.length) && rng() < 0.55) {
        productId = client.preferredProducts[Math.floor(rng() * client.preferredProducts.length)];
      }
      const p = getProduct(productId);
      if (!p) continue;
      let qty = slot.qty || 1;
      if (typeof qty === "function") qty = qty(rng);
      if (client.kind === "pena") qty += 1 + Math.floor(rng() * 4);
      if (client.kind === "abonado") qty += Math.floor(rng() * 2);
      lines.push({
        productId: p.id,
        productName: p.name,
        qty: Math.max(1, qty),
        preferDictate: !!slot.dictate || client.trait === "pr\xE1ctica" && rng() < 0.35
      });
    }
    if (!lines.length) {
      const p = getProduct(((_c = client.preferredProducts) == null ? void 0 : _c[0]) || "lae-bonoloto");
      lines.push({ productId: p.id, productName: p.name, qty: 1, preferDictate: false });
    }
    return lines;
  }
  var POOLS = {
    lae: ["lae-primitiva", "lae-bonoloto", "lae-euromillones", "lae-nacional", "lae-gordo-primitiva", "lae-quiniela"],
    once: ["once-cupon", "once-cuponazo", "once-eurojackpot", "once-super-once", "once-triplex"],
    rasca: ["rasca-7-vidas", "rasca-multiplica", "rasca-diamante", "rasca-oro", "rasca-jackpot", "rasca-once-clasico"],
    auto: ["and-fortuna", "and-olivo", "and-costa"],
    prov: ["mal-premio", "mal-axarquia"],
    local: ["alo-local", "alo-hoya", "alo-chorro"]
  };
  var WISH_TEMPLATES = [
    [{ usePref: true, qty: (r) => 1 + Math.floor(r() * 3) }, { pool: POOLS.rasca, qty: (r) => 1 + Math.floor(r() * 4), p: 0.7 }],
    [{ id: "lae-euromillones", qty: 2, dictate: true }, { id: "lae-bonoloto", qty: (r) => 2 + Math.floor(r() * 6) }],
    [{ id: "lae-nacional", qty: 1 }, { pool: POOLS.once, qty: 1 }, { pool: POOLS.rasca, qty: 3 }],
    [{ id: "lae-primitiva", qty: 1, dictate: true }, { id: "lae-primitiva", qty: 1 }, { id: "lae-gordo-primitiva", qty: 1, p: 0.5 }],
    [{ id: "lae-quiniela", qty: 1, dictate: true }, { id: "lae-quinigol", qty: 1, p: 0.4 }, { pool: POOLS.rasca, qty: 2, p: 0.6 }],
    [{ pool: POOLS.once, qty: (r) => 1 + Math.floor(r() * 3) }, { id: "once-eurojackpot", qty: 1, dictate: true }],
    [{ pool: POOLS.auto, qty: 2 }, { pool: POOLS.local, qty: 1 }, { pool: POOLS.rasca, qty: 2 }],
    [{ pool: POOLS.prov, qty: 1 }, { id: "lae-bonoloto", qty: 4 }, { id: "alo-local", qty: 2 }],
    // peña-style big basket
    [
      { id: "lae-euromillones", qty: 5 },
      { id: "lae-primitiva", qty: 5, dictate: true },
      { id: "lae-nacional", qty: 2 },
      { pool: POOLS.rasca, qty: 10, p: 0.8 }
    ],
    [{ id: "once-super-once", qty: 3 }, { id: "once-triplex", qty: 2, dictate: true }, { pool: POOLS.rasca, qty: 1 }],
    [{ id: "lae-lototurf", qty: 1 }, { id: "lae-bonoloto", qty: 2 }, { pool: POOLS.local, qty: 1, p: 0.5 }],
    // many small random mixes
    ...Array.from({ length: 40 }, () => {
      const n = 1 + Math.floor(Math.random() * 4);
      return Array.from({ length: n }, () => {
        const pools = Object.values(POOLS);
        const pool = pools[Math.floor(Math.random() * pools.length)];
        return { pool, qty: 1 + Math.floor(Math.random() * 3), dictate: Math.random() < 0.25, p: 0.5 + Math.random() * 0.5 };
      });
    })
  ];
  function isSpecialSeason(state2) {
    const m = gameDate(state2).getUTCMonth() + 1;
    const d = gameDate(state2).getUTCDate();
    if (m === 11 || m === 12) return true;
    if (m === 1 && d <= 10) return true;
    if (m === 10 && d >= 20) return true;
    return false;
  }
  function dismissCurrent(state2, reason = "Cliente atendido") {
    state2.dayLog.push({ at: state2.clock.gameTimeMs, text: reason });
    state2.customers.current = null;
    return state2;
  }
  function reserveForCurrent(state2) {
    var _a, _b;
    const client = state2.customers.current;
    const items = ((_a = client == null ? void 0 : client.wishlist) == null ? void 0 : _a.length) ? client.wishlist : (client == null ? void 0 : client.request) ? [client.request] : [];
    if (!items.length) return state2;
    for (const w of items) {
      const p = getProduct(w.productId);
      if (!p) continue;
      const days = (_b = p.orderDays) != null ? _b : 2;
      const arrive = addBusinessDays(state2, days);
      state2.orders.push({
        id: `ord-${Date.now()}-${w.productId}`,
        productId: p.id,
        productName: p.name,
        qty: w.qty,
        clientId: client.id,
        clientName: client.name,
        arriveOnYmd: arrive,
        status: "pending",
        reserved: true,
        special: client.intent === "reserve_special"
      });
    }
    state2.ui.toast = "Reservas hechas sin cobro.";
    state2.customers.current = null;
    return state2;
  }
  function orderStock(state2, productId, qty) {
    var _a;
    const p = getProduct(productId);
    if (!p || p.stockType !== "physical") return state2;
    const arrive = addBusinessDays(state2, (_a = p.orderDays) != null ? _a : 2);
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
    state2.ui.toast = `Pedido ${p.name} \xD7${qty} \u2192 ${arrive}`;
    return state2;
  }
  function addBusinessDays(state2, days) {
    const d = gameDate(state2);
    let left = days;
    let guard = 0;
    while (left > 0 && guard++ < 400) {
      d.setUTCDate(d.getUTCDate() + 1);
      const ymd2 = d.toISOString().slice(0, 10);
      if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !state2.holidays[ymd2]) left--;
    }
    return d.toISOString().slice(0, 10);
  }
  function processArrivingOrders(state2) {
    const ymd2 = gameDate(state2).toISOString().slice(0, 10);
    for (const o of state2.orders) {
      if (o.status !== "pending" || o.arriveOnYmd > ymd2) continue;
      o.status = "arrived";
      if (!o.reserved) {
        state2.stock[o.productId] = (state2.stock[o.productId] || 0) + o.qty;
        state2.dayLog.push({ at: state2.clock.gameTimeMs, text: `Pedido recibido: ${o.productName} \xD7${o.qty}` });
      } else {
        state2.dayLog.push({
          at: state2.clock.gameTimeMs,
          text: `Encargo listo: ${o.clientName} \xB7 ${o.productName} \xD7${o.qty}`
        });
      }
    }
    return state2;
  }
  function checkCurrentTicket(state2) {
    const client = state2.customers.current;
    if (!(client == null ? void 0 : client.ticketFocus)) return state2;
    const result = checkTicket(state2, client.ticketFocus.id);
    client.checkResult = result;
    if (result.pending) state2.ui.toast = result.detail;
    else if (result.prizeCents > 0) {
      state2.ui.toast = `\xA1Ha tocado ${formatEuro(result.prizeCents)}!`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Comprobaci\xF3n: ${client.name} \xB7 PREMIO ${formatEuro(result.prizeCents)}`
      });
    } else {
      state2.ui.toast = "No ha tocado.";
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
    state2.stats.totalPrizesPaidCents = (state2.stats.totalPrizesPaidCents || 0) + amount;
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
    if (![0, 3, 6, 9].includes(month) || day !== 20) return state2;
    const base = Math.round(state2.stats.totalSalesCents * 0.02);
    const iva = Math.round(base * 0.21);
    const irpf = Math.round(base * 0.15);
    const total = iva + irpf;
    state2.finance.bankCents -= total;
    state2.finance.ledger.push({
      id: `tax-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "tax",
      label: "Liquidaci\xF3n trimestral IVA+IRPF",
      totalCents: -total
    });
    state2.dayLog.push({ at: state2.clock.gameTimeMs, text: `Impuestos: ${formatEuro(total)}` });
    return state2;
  }
  function dayOrgBreakdown(state2) {
    const dayStart = new Date(gameDate(state2));
    dayStart.setUTCHours(0, 0, 0, 0);
    const startMs = dayStart.getTime();
    const orgs = {
      LAE: { sales: 0, commission: 0, prizes: 0 },
      ONCE: { sales: 0, commission: 0, prizes: 0 },
      Otros: { sales: 0, commission: 0, prizes: 0 }
    };
    for (const e of state2.finance.ledger) {
      if (e.at < startMs) continue;
      if (e.type === "sale" && e.items) {
        for (const item of e.items) {
          const p = getProduct(item.productId);
          const org = (p == null ? void 0 : p.org) === "LAE" || (p == null ? void 0 : p.org) === "ONCE" ? p.org : "Otros";
          const total = item.unitCents * item.qty;
          const comm = Math.round(total * ((p == null ? void 0 : p.commissionRate) || 0.05));
          orgs[org].sales += total;
          orgs[org].commission += comm;
        }
      }
      if (e.type === "prize") {
        const org = e.org === "LAE" || e.org === "ONCE" ? e.org : "Otros";
        orgs[org].prizes += e.totalCents || 0;
      }
    }
    return orgs;
  }
  function settleOrganizations(state2) {
    const orgs = dayOrgBreakdown(state2);
    const laeRemit = orgs.LAE.sales - orgs.LAE.commission;
    const onceRemit = orgs.ONCE.sales - orgs.ONCE.commission;
    const otrosRemit = orgs.Otros.sales - orgs.Otros.commission;
    const prizesReimb = (orgs.LAE.prizes || 0) + (orgs.ONCE.prizes || 0) + (orgs.Otros.prizes || 0);
    state2.finance.bankCents -= laeRemit + onceRemit + otrosRemit;
    state2.finance.bankCents += prizesReimb;
    const settlement = {
      at: state2.clock.gameTimeMs,
      lae: {
        sales: orgs.LAE.sales,
        commission: orgs.LAE.commission,
        remittance: laeRemit,
        prizesReimbursed: orgs.LAE.prizes
      },
      once: {
        sales: orgs.ONCE.sales,
        commission: orgs.ONCE.commission,
        remittance: onceRemit,
        prizesReimbursed: orgs.ONCE.prizes
      },
      otros: {
        sales: orgs.Otros.sales,
        commission: orgs.Otros.commission,
        remittance: otrosRemit,
        prizesReimbursed: orgs.Otros.prizes
      },
      netBankDelta: prizesReimb - laeRemit - onceRemit - otrosRemit
    };
    state2.finance.ledger.push({
      id: `settle-${Date.now()}`,
      at: state2.clock.gameTimeMs,
      type: "settlement",
      label: "Liquidaci\xF3n diaria LAE / ONCE / otros",
      settlement
    });
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Liquidaci\xF3n LAE remesa ${formatEuro(laeRemit)} (com. ${formatEuro(orgs.LAE.commission)}) \xB7 ONCE remesa ${formatEuro(onceRemit)} (com. ${formatEuro(orgs.ONCE.commission)}) \xB7 reembolso premios ${formatEuro(prizesReimb)}`
    });
    state2.finance.lastSettlement = settlement;
    return settlement;
  }
  function dayProfitBreakdown(state2) {
    const commission = state2.finance.dayCommissionCents || 0;
    const expenses = state2.finance.dayExpensesCents || 0;
    return {
      salesCents: state2.finance.daySalesCents || 0,
      commissionCents: commission,
      expensesCents: expenses,
      prizesPaidCents: state2.finance.dayPrizesPaidCents || 0,
      prizesReimbursableCents: state2.finance.dayPrizesReimbursableCents || 0,
      profitCents: commission - expenses,
      orgs: dayOrgBreakdown(state2)
    };
  }
  function buildDayCloseSummary(state2) {
    const profit = dayProfitBreakdown(state2);
    return {
      date: gameYmd(state2),
      ...profit,
      drawerCents: drawerTotalCents(state2.finance.drawer),
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
    if (state2.finance.dayShortageCents) {
      state2.stats.totalShortageCents = (state2.stats.totalShortageCents || 0) + state2.finance.dayShortageCents;
    }
    state2.finance.daySalesCents = 0;
    state2.finance.dayCommissionCents = 0;
    state2.finance.dayPrizesPaidCents = 0;
    state2.finance.dayPrizesReimbursableCents = 0;
    state2.finance.dayExpensesCents = 0;
    state2.finance.dayShortageCents = 0;
    state2.finance.changeErrorsToday = 0;
    state2.customers.servedToday = 0;
    state2.customers.current = null;
    state2.customers.queue = [];
    state2.dayLog = [];
    state2.ui.lastTickets = [];
    state2.ui.tpv = null;
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
    processArrivingOrders(state2);
    ensureDrawsResolved(state2);
    state2.customers.nextSpawnAtMs = state2.clock.gameTimeMs + 2 * 60 * 1e3;
    state2.ui.screen = "counter";
    state2.ui.lastCloseSummary = summary;
    state2.dayLog.push({
      at: state2.clock.gameTimeMs,
      text: `Nuevo d\xEDa \xB7 ${OFFICE.businessName}. ${closedReason(state2) || "Abierta 08:00\u201320:00."}`
    });
    return { state: state2, summary };
  }

  // src/game/sounds.js
  var ctx;
  var musicNodes = null;
  var musicOn = true;
  var sfxOn = true;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function beep({ freq = 880, dur = 0.08, type = "sine", gain = 0.04, slideTo } = {}) {
    if (!sfxOn) return;
    try {
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), c.currentTime + dur);
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
    tpv: () => beep({ freq: 980, dur: 0.05, type: "square", gain: 0.03 }),
    cash: () => {
      beep({ freq: 880, dur: 0.07, type: "sine", gain: 0.04 });
      setTimeout(() => beep({ freq: 1175, dur: 0.09, type: "sine", gain: 0.035 }), 70);
    },
    drawer: () => beep({ freq: 180, dur: 0.12, type: "triangle", gain: 0.05, slideTo: 90 }),
    ticket: () => {
      beep({ freq: 1500, dur: 0.04, type: "square", gain: 0.02 });
      setTimeout(() => beep({ freq: 1200, dur: 0.04, type: "square", gain: 0.02 }), 50);
    },
    draw: () => {
      beep({ freq: 440, dur: 0.1 });
      setTimeout(() => beep({ freq: 554, dur: 0.1 }), 100);
      setTimeout(() => beep({ freq: 659, dur: 0.16 }), 200);
    },
    error: () => beep({ freq: 200, dur: 0.15, type: "sawtooth", gain: 0.03 }),
    success: () => {
      beep({ freq: 523, dur: 0.08 });
      setTimeout(() => beep({ freq: 659, dur: 0.08 }), 80);
      setTimeout(() => beep({ freq: 784, dur: 0.12 }), 160);
    },
    open: () => beep({ freq: 400, dur: 0.2, type: "triangle", gain: 0.04, slideTo: 800 })
  };
  function startMusic() {
    if (!musicOn || musicNodes) return;
    try {
      const c = ac();
      const master = c.createGain();
      master.gain.value = 0.035;
      master.connect(c.destination);
      const notes = [196, 247, 294, 330, 294, 247];
      const oscs = notes.map((freq, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.value = 0;
        o.connect(g);
        g.connect(master);
        o.start();
        const pulse = () => {
          if (!musicNodes) return;
          const t = c.currentTime;
          g.gain.cancelScheduledValues(t);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.15, t + 0.4);
          g.gain.linearRampToValueAtTime(0, t + 2.2);
          setTimeout(pulse, 2200 + i * 180);
        };
        setTimeout(pulse, i * 400);
        return { o, g };
      });
      musicNodes = { master, oscs };
    } catch (e) {
    }
  }
  function stopMusic() {
    if (!musicNodes) return;
    try {
      musicNodes.oscs.forEach(({ o }) => o.stop());
    } catch (e) {
    }
    musicNodes = null;
  }
  function setMusicEnabled(on) {
    musicOn = on;
    if (on) startMusic();
    else stopMusic();
  }
  function setSfxEnabled(on) {
    sfxOn = on;
  }
  function isMusicEnabled() {
    return musicOn;
  }

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

  // src/game/tpv.js
  var CANCEL_REASONS = ["error", "sin stock", "cambio de idea", "otro"];
  function openTpv(state2, client) {
    state2.ui.tpv = {
      clientId: (client == null ? void 0 : client.id) || null,
      clientName: (client == null ? void 0 : client.name) || "Cliente",
      wishlist: (client == null ? void 0 : client.wishlist) ? client.wishlist.map((w) => ({ ...w })) : [],
      category: "LAE",
      lines: [],
      editingLineId: null,
      numberEntry: null,
      cancelPrompt: null,
      // { lineId }
      step: "edit",
      // edit | receipt
      message: null,
      cancelledLines: []
    };
    state2.ui.screen = "tpv";
    return state2;
  }
  function closeTpv(state2) {
    state2.ui.tpv = null;
    state2.ui.screen = "counter";
    return state2;
  }
  function setTpvCategory(state2, category) {
    if (!state2.ui.tpv) return state2;
    state2.ui.tpv.category = category;
    state2.ui.tpv.message = null;
    return state2;
  }
  function lineId() {
    return `L-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
  }
  function addTpvProduct(state2, productId, { qty = 1, numberSource = "random" } = {}) {
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    const p = getProduct(productId);
    if (!p) return state2;
    const have = state2.stock[productId];
    if (p.stockType === "physical" && have != null && have < qty) {
      tpv.message = `Sin stock suficiente de ${p.name} (hay ${have}). Quita la l\xEDnea o reserva.`;
      return state2;
    }
    const rng = mulberry322(hashSeed("tpv", state2.clock.gameTimeMs, productId, tpv.lines.length));
    const selection = p.needsNumbers && numberSource === "random" ? generateBetSelection(productId, rng) : p.needsNumbers ? null : {};
    const line = {
      id: lineId(),
      productId: p.id,
      name: p.name,
      org: p.org,
      qty,
      unitCents: p.priceCents,
      numberSource,
      selection,
      needsNumbers: !!p.needsNumbers,
      numberMode: p.numberMode || null
    };
    tpv.lines.push(line);
    tpv.message = `A\xF1adido: ${p.name} \xD7${qty}`;
    if (p.needsNumbers && numberSource === "dictate") {
      tpv.numberEntry = {
        lineId: line.id,
        mode: p.numberMode,
        draft: "",
        productName: p.name
      };
    }
    return state2;
  }
  function removeTpvLine(state2, id) {
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    tpv.cancelPrompt = { lineId: id };
    tpv.message = "Elige motivo de cancelaci\xF3n";
    return state2;
  }
  function confirmCancelLine(state2, reason) {
    var _a;
    const tpv = state2.ui.tpv;
    if (!(tpv == null ? void 0 : tpv.cancelPrompt)) return state2;
    const id = tpv.cancelPrompt.lineId;
    const line = tpv.lines.find((l) => l.id === id);
    if (line) {
      tpv.cancelledLines.push({ ...line, reason: reason || "otro", at: state2.clock.gameTimeMs });
      tpv.lines = tpv.lines.filter((l) => l.id !== id);
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `TPV: cancelada l\xEDnea ${line.name} \xD7${line.qty} (${reason})`
      });
    }
    if (((_a = tpv.numberEntry) == null ? void 0 : _a.lineId) === id) tpv.numberEntry = null;
    tpv.cancelPrompt = null;
    tpv.message = `L\xEDnea cancelada: ${reason}`;
    return state2;
  }
  function dismissCancelPrompt(state2) {
    if (state2.ui.tpv) state2.ui.tpv.cancelPrompt = null;
    return state2;
  }
  function validateWishlist(tpv) {
    const wish = (tpv == null ? void 0 : tpv.wishlist) || [];
    const covered = [];
    const missing = [];
    const extras = [];
    const qtyByProduct = {};
    for (const l of (tpv == null ? void 0 : tpv.lines) || []) {
      qtyByProduct[l.productId] = (qtyByProduct[l.productId] || 0) + l.qty;
    }
    const used = { ...qtyByProduct };
    for (const w of wish) {
      const have = used[w.productId] || 0;
      if (have >= w.qty) {
        covered.push({ ...w, have });
        used[w.productId] = have - w.qty;
      } else if (have > 0) {
        missing.push({ ...w, have, need: w.qty - have });
        used[w.productId] = 0;
      } else {
        missing.push({ ...w, have: 0, need: w.qty });
      }
    }
    for (const [productId, left] of Object.entries(used)) {
      if (left > 0) {
        const p = getProduct(productId);
        extras.push({ productId, productName: (p == null ? void 0 : p.name) || productId, qty: left });
      }
    }
    return {
      covered,
      missing,
      extras,
      complete: missing.length === 0
    };
  }
  function setLineQty(state2, id, qty) {
    var _a;
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    const line = tpv.lines.find((l) => l.id === id);
    if (!line) return state2;
    const q = Math.max(1, Math.min(50, qty));
    const p = getProduct(line.productId);
    if ((p == null ? void 0 : p.stockType) === "physical") {
      const have = (_a = state2.stock[line.productId]) != null ? _a : 0;
      if (have < q) {
        tpv.message = `Solo hay ${have} de ${line.name}`;
        line.qty = Math.max(1, have);
        return state2;
      }
    }
    line.qty = q;
    return state2;
  }
  function applyDictatedNumbers(state2, text) {
    const tpv = state2.ui.tpv;
    if (!(tpv == null ? void 0 : tpv.numberEntry)) return state2;
    const line = tpv.lines.find((l) => l.id === tpv.numberEntry.lineId);
    if (!line) return state2;
    const parsed = parseDictatedNumbers(line.numberMode, text);
    if (!parsed.ok) {
      tpv.message = parsed.error;
      return state2;
    }
    line.selection = parsed.selection;
    if (parsed.selection.series) line.qty = 10;
    else if (parsed.selection.fractions && parsed.selection.fractions > 1) {
      line.qty = parsed.selection.fractions;
    }
    tpv.numberEntry = null;
    tpv.message = parsed.selection.series ? "Serie entera marcada (10 d\xE9cimos)" : "N\xFAmeros marcados";
    return state2;
  }
  function cancelNumberEntry(state2) {
    if (state2.ui.tpv) state2.ui.tpv.numberEntry = null;
    return state2;
  }
  function rerollLineNumbers(state2, id) {
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    const line = tpv.lines.find((l) => l.id === id);
    if (!(line == null ? void 0 : line.needsNumbers)) return state2;
    const rng = mulberry322(hashSeed("reroll", state2.clock.gameTimeMs, id));
    line.selection = generateBetSelection(line.productId, rng);
    line.numberSource = "random";
    tpv.message = "Combinaci\xF3n aleatoria nueva";
    return state2;
  }
  function startDictateLine(state2, id) {
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    const line = tpv.lines.find((l) => l.id === id);
    if (!(line == null ? void 0 : line.needsNumbers)) return state2;
    tpv.numberEntry = {
      lineId: line.id,
      mode: line.numberMode,
      draft: "",
      productName: line.name
    };
    return state2;
  }
  function parseDictatedNumbers(mode, text) {
    const raw = String(text || "").trim();
    if (!raw) return { ok: false, error: "Escribe los n\xFAmeros que dicta el cliente" };
    if (mode === "nacional" || mode === "triplex") {
      const serie = raw.match(/serie\s*(\d{5})/i);
      if (serie && mode === "nacional") {
        return {
          ok: true,
          selection: { number: serie[1], series: true, fractions: 10 }
        };
      }
      const pedrea = raw.match(/(\d{5})\s*(?:x|×|\*|decimos?|décimos?)?\s*(\d+)?/i);
      const digits = raw.replace(/\D/g, "");
      const need = mode === "triplex" ? 3 : 5;
      if (digits.length < need && !pedrea) return { ok: false, error: `Haz falta ${need} cifras` };
      const number = (pedrea ? pedrea[1] : digits.slice(0, need)).padStart(need, "0");
      const fractions = pedrea && pedrea[2] ? Math.max(1, Math.min(10, Number(pedrea[2]))) : 1;
      return { ok: true, selection: { number, fractions, series: false } };
    }
    if (mode === "6from49") {
      const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 49);
      const unique = [...new Set(nums)];
      if (unique.length < 6) return { ok: false, error: "Indica 6 n\xFAmeros del 1 al 49" };
      const reMatch = raw.match(/r\s*(\d)/i);
      const reintegro = reMatch ? Number(reMatch[1]) : unique[6] != null ? unique[6] % 10 : 0;
      return {
        ok: true,
        selection: { numbers: unique.slice(0, 6).sort((a, b) => a - b), reintegro }
      };
    }
    if (mode === "euro" || mode === "eurojackpot") {
      const parts = raw.split(/[★*|]/);
      const main = (parts[0] || "").split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 50);
      const stars = (parts[1] || "").split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 12);
      const uMain = [...new Set(main)];
      const uStars = [...new Set(stars)];
      if (uMain.length < 5 || uStars.length < 2) {
        return { ok: false, error: "Formato: 5 n\xFAmeros | 2 estrellas (ej. 1 2 3 4 5 | 6 7)" };
      }
      return {
        ok: true,
        selection: {
          numbers: uMain.slice(0, 5).sort((a, b) => a - b),
          stars: uStars.slice(0, 2).sort((a, b) => a - b)
        }
      };
    }
    if (mode === "gordo") {
      const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= 54);
      const unique = [...new Set(nums)];
      if (unique.length < 5) return { ok: false, error: "5 n\xFAmeros (1\u201354) y clave 1\u20139" };
      const clave = Number((raw.match(/clave\s*(\d)/i) || [])[1] || unique[5] || 1);
      return {
        ok: true,
        selection: { numbers: unique.slice(0, 5).sort((a, b) => a - b), clave: Math.min(9, Math.max(1, clave)) }
      };
    }
    if (mode === "quiniela") {
      const signs = raw.toUpperCase().replace(/[^1X2]/g, "");
      if (signs.length < 14) return { ok: false, error: "14 signos 1/X/2 (ej. 1X2112...)" };
      return { ok: true, selection: { column: signs.slice(0, 14).split(""), pleno: signs[14] || "1" } };
    }
    if (mode === "quinigol") {
      const g = raw.toUpperCase().replace(/[^012M]/g, "");
      if (g.length < 6) return { ok: false, error: "6 resultados 0/1/2/M" };
      return { ok: true, selection: { goals: g.slice(0, 6).split("") } };
    }
    if (mode === "superonce" || mode === "5from40" || mode === "lototurf") {
      const max = mode === "5from40" ? 40 : 49;
      const need = 5;
      const nums = raw.split(/[\s,;.-]+/).map(Number).filter((n) => n >= 1 && n <= max);
      const unique = [...new Set(nums)];
      if (unique.length < need) return { ok: false, error: `${need} n\xFAmeros del 1 al ${max}` };
      return { ok: true, selection: { numbers: unique.slice(0, need).sort((a, b) => a - b) } };
    }
    return { ok: false, error: "No se entiende la combinaci\xF3n" };
  }
  function tpvTotalCents(tpv) {
    return ((tpv == null ? void 0 : tpv.lines) || []).reduce((s, l) => s + l.unitCents * l.qty, 0);
  }
  function tpvReadyToCharge(tpv) {
    var _a, _b;
    if (!((_a = tpv == null ? void 0 : tpv.lines) == null ? void 0 : _a.length)) return { ok: false, error: "El ticket est\xE1 vac\xEDo" };
    for (const l of tpv.lines) {
      if (l.needsNumbers && !l.selection) {
        return { ok: false, error: `Faltan n\xFAmeros en ${l.name}` };
      }
    }
    if ((_b = tpv.wishlist) == null ? void 0 : _b.length) {
      const v = validateWishlist(tpv);
      if (!v.complete) {
        const miss = v.missing.map((m) => `${m.productName} (faltan ${m.need})`).join(", ");
        return { ok: false, error: `La petici\xF3n no est\xE1 completa: ${miss}. Puedes a\xF1adir de m\xE1s, pero no de menos.` };
      }
    }
    return { ok: true };
  }
  function goTpvReceipt(state2) {
    const tpv = state2.ui.tpv;
    if (!tpv) return state2;
    const ready = tpvReadyToCharge(tpv);
    if (!ready.ok) {
      tpv.message = ready.error;
      return state2;
    }
    tpv.step = "receipt";
    tpv.message = null;
    return state2;
  }
  function backTpvEdit(state2) {
    if (state2.ui.tpv) state2.ui.tpv.step = "edit";
    return state2;
  }
  function tpvToSaleItems(tpv) {
    return tpv.lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      qty: l.qty,
      unitCents: l.unitCents,
      org: l.org,
      selection: l.selection,
      numberSource: l.numberSource
    }));
  }
  function formatLineSelection(line) {
    const s = line.selection;
    if (!s) return "Sin marcar";
    if (s.number) {
      let t = `N\xBA ${s.number}`;
      if (s.series) t += " \xB7 serie entera";
      else if (s.fractions && s.fractions > 1) t += ` \xB7 ${s.fractions} d\xE9cimos`;
      else if (s.fractions === 1) t += " \xB7 1 d\xE9cimo";
      return t;
    }
    if (s.column) return `Columna ${s.column.join("")}`;
    if (s.goals) return `Goles ${s.goals.join("")}`;
    if (s.stars) return `${(s.numbers || []).join(",")} \u2605 ${s.stars.join(",")}`;
    if (s.clave != null) return `${(s.numbers || []).join(",")} clave ${s.clave}`;
    if (s.numbers) {
      const r = s.reintegro != null ? ` R${s.reintegro}` : "";
      return `${s.numbers.join(",")}${r}`;
    }
    return "\u2014";
  }

  // src/game/audit.js
  function startArqueo(state2, kind = "close") {
    state2.ui.arqueo = {
      kind,
      // open | close
      counted: emptyDrawer(),
      step: "count",
      message: null
    };
    state2.ui.screen = "arqueo";
    return state2;
  }
  function adjustArqueoCount(state2, denomId, delta) {
    const a = state2.ui.arqueo;
    if (!a) return state2;
    a.counted[denomId] = Math.max(0, (a.counted[denomId] || 0) + delta);
    a.message = null;
    return state2;
  }
  function confirmArqueo(state2) {
    const a = state2.ui.arqueo;
    if (!a) return state2;
    const expected = drawerTotalCents(state2.finance.drawer);
    const counted = countTotalCents(a.counted);
    const diff = counted - expected;
    a.result = { expected, counted, diff };
    a.step = "result";
    if (diff === 0) {
      a.message = "Arqueo correcto. La caja cuadra.";
      state2.finance.changeErrorsToday = state2.finance.changeErrorsToday || 0;
    } else if (diff < 0) {
      state2.finance.changeErrorsToday = (state2.finance.changeErrorsToday || 0) + 1;
      state2.finance.bankCents += diff;
      state2.finance.dayShortageCents = (state2.finance.dayShortageCents || 0) + Math.abs(diff);
      state2.finance.ledger.push({
        id: `short-${Date.now()}`,
        at: state2.clock.gameTimeMs,
        type: "shortage",
        label: `Faltante de caja (${a.kind})`,
        totalCents: diff
      });
      a.message = `Faltante de ${formatEuro(Math.abs(diff))}. Se ajusta del banco. Aviso sin cerrar el negocio.`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Faltante de caja: ${formatEuro(Math.abs(diff))} (${a.kind})`
      });
    } else {
      state2.finance.bankCents += diff;
      a.message = `Sobra ${formatEuro(diff)}. Se ingresa en el banco.`;
      state2.dayLog.push({
        at: state2.clock.gameTimeMs,
        text: `Sobrante de caja: ${formatEuro(diff)}`
      });
    }
    if (a.kind === "open" && expected < 1e3) {
      state2.finance.drawer = defaultFloatDrawer();
    }
    return state2;
  }
  function closeArqueo(state2) {
    var _a;
    const kind = (_a = state2.ui.arqueo) == null ? void 0 : _a.kind;
    state2.ui.arqueo = null;
    if (kind === "close") state2.ui.screen = "close";
    else state2.ui.screen = "counter";
    return state2;
  }
  function buildWeeklyStatement(state2) {
    const now = gameDate(state2);
    const weekAgo = new Date(now.getTime());
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    const fromMs = weekAgo.getTime();
    let sales = 0;
    let commission = 0;
    let prizes = 0;
    let expenses = 0;
    let shortage = 0;
    let settlements = 0;
    for (const e of state2.finance.ledger || []) {
      if (e.at < fromMs) continue;
      if (e.type === "sale") {
        sales += e.totalCents || 0;
        commission += e.commissionCents || 0;
      } else if (e.type === "prize") prizes += e.totalCents || 0;
      else if (e.type === "expense") expenses += Math.abs(e.totalCents || 0);
      else if (e.type === "shortage") shortage += Math.abs(e.totalCents || 0);
      else if (e.type === "settlement") settlements += 1;
    }
    return {
      fromYmd: weekAgo.toISOString().slice(0, 10),
      toYmd: gameYmd(state2),
      sales,
      commission,
      prizes,
      expenses,
      shortage,
      settlements,
      net: commission - expenses - shortage
    };
  }
  function isMonday(state2) {
    return gameDate(state2).getUTCDay() === 1;
  }

  // src/main.js
  var state = null;
  var toastTimer = null;
  var needsFullRender = true;
  var lastClockMinute = -1;
  var lastAutosaveRealMs = Date.now();
  var tpvKeysBound = false;
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
  function maybeStartMusic() {
    var _a, _b;
    if ((_a = state == null ? void 0 : state.settings) == null ? void 0 : _a.music) {
      setMusicEnabled(true);
      startMusic();
    } else if (state == null ? void 0 : state.settings) {
      setMusicEnabled(false);
    }
    if (((_b = state == null ? void 0 : state.settings) == null ? void 0 : _b.sfx) != null) setSfxEnabled(!!state.settings.sfx);
  }
  function loop() {
    var _a, _b, _c, _d, _e;
    if (state && state.ui.screen !== "menu") {
      advanceClock(state);
      ensureDrawsResolved(state);
      ensureJackpots(state);
      if (state.ui.screen === "counter") {
        const before = ((_a = state.customers.current) == null ? void 0 : _a.id) || null;
        const qBefore = ((_b = state.customers.queue) == null ? void 0 : _b.length) || 0;
        maybeSpawnCustomers(state);
        const after = ((_c = state.customers.current) == null ? void 0 : _c.id) || null;
        const qAfter = ((_d = state.customers.queue) == null ? void 0 : _d.length) || 0;
        if (before !== after || qBefore !== qAfter) needsFullRender = true;
      }
      const prevAutosave = lastAutosaveRealMs;
      lastAutosaveRealMs = maybeAutosave(state, lastAutosaveRealMs);
      if (lastAutosaveRealMs !== prevAutosave) {
        if ((_e = state.ui.toast) == null ? void 0 : _e.startsWith("Partida guardada")) state.ui.toast = null;
      }
      maybeMondayHint();
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
  function maybeMondayHint() {
    if (!state || !isMonday(state)) return;
    const ymd2 = gameYmd(state);
    if (state.ui.mondayHintYmd === ymd2) return;
    state.ui.mondayHintYmd = ymd2;
    showToast("Lunes: revisa el extracto semanal (men\xFA Extracto semanal).");
    needsFullRender = true;
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
    if (state.ui.screen === "tpv") return renderTpv();
    if (state.ui.screen === "close") return renderClose();
    if (state.ui.screen === "saves") return renderSavesInGame();
    if (state.ui.screen === "stock") return renderStock();
    if (state.ui.screen === "prize") return renderPrize();
    if (state.ui.screen === "draws") return renderDraws();
    if (state.ui.screen === "management") return renderManagement();
    if (state.ui.screen === "fichas") return renderFichas();
    if (state.ui.screen === "arqueo") return renderArqueo();
    if (state.ui.screen === "weekly") return renderWeekly();
    if (state.ui.screen === "stats") return renderStats();
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
  function dictateHint(mode) {
    const hints = {
      nacional: "5 cifras (ej. 45821)",
      triplex: "3 cifras (ej. 742)",
      "6from49": "6 n\xFAmeros 1\u201349 y reintegro (ej. 1 8 15 22 33 41 r3)",
      euro: "5 n\xFAmeros | 2 estrellas (ej. 1 2 3 4 5 | 6 7)",
      eurojackpot: "5 n\xFAmeros | 2 estrellas (ej. 1 2 3 4 5 | 6 7)",
      gordo: "5 n\xFAmeros 1\u201354 y clave (ej. 3 12 20 33 50 clave 7)",
      quiniela: "14 signos 1/X/2 (ej. 1X2112X12X121)",
      quinigol: "6 resultados 0/1/2/M",
      superonce: "5 n\xFAmeros del 1 al 49",
      "5from40": "5 n\xFAmeros del 1 al 40",
      lototurf: "5 n\xFAmeros del 1 al 49"
    };
    return hints[mode] || "Escribe la combinaci\xF3n dictada";
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
          Juego responsable \xB7 +18. Versi\xF3n ${GAME_VERSION}: TPV con ticket, arqueo, botes, extracto semanal y encargos de calendario.
        </p>
      </div>
    </div>
  `;
    document.getElementById("btn-new").onclick = () => {
      sfx.open();
      state = newGame();
      processArrivingOrders(state);
      ensureDrawsResolved(state);
      maybeStartMusic();
      state.ui.screen = "counter";
      lastAutosaveRealMs = Date.now();
      showToast("Bienvenida, Miriam. Versi\xF3n 0.3 lista. Abre el TPV para vender.");
      needsFullRender = true;
      render();
    };
    document.getElementById("import-file").onchange = async (e) => {
      var _a;
      const f = (_a = e.target.files) == null ? void 0 : _a[0];
      if (!f) return;
      try {
        state = await importGame(f);
        maybeStartMusic();
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
        maybeStartMusic();
        sfx.click();
        showToast(`Partida cargada (hueco ${slot})`);
        needsFullRender = true;
        render();
      };
    });
  }
  function drawNoticeBannerHTML() {
    const notices = todaysDrawNotices(state);
    if (!notices.length) return "";
    return `<div class="notice-banner">Hoy hay sorteo de: ${escapeHtml(notices.join(", "))}</div>`;
  }
  function jackpotStripHTML() {
    const list = jackpotList(state).slice(0, 4);
    if (!list.length) return "";
    return `<div class="jackpot-strip">${list.map((j) => `<span><strong>${escapeHtml(j.name)}</strong> ${escapeHtml(formatJackpotShort(j.cents))}</span>`).join("")}</div>`;
  }
  function touristHintHTML() {
    if (!isTouristSeason(state)) return "";
    return `<div class="muted" style="font-size:0.85rem;margin-top:4px">Temporada tur\xEDstica (Caminito / El Chorro): m\xE1s visitantes.</div>`;
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
        ${touristHintHTML()}
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
    ${drawNoticeBannerHTML()}
    ${jackpotStripHTML()}
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
    var _a, _b;
    const profit = dayProfitBreakdown(state);
    const openMgmt = (state.prizeManagement || []).filter((c) => c.status !== "settled").length;
    const musicOn2 = ((_a = state.settings) == null ? void 0 : _a.music) !== false && isMusicEnabled();
    return `
    <aside class="panel nav-side">
      <h3>Oficina</h3>
      <button class="btn" data-nav="counter">Mostrador</button>
      <button class="btn" data-nav="fichas">Abonados / Pe\xF1as</button>
      <button class="btn" data-nav="draws">Sorteos</button>
      <button class="btn" data-nav="prize">Pagar premio</button>
      <button class="btn" data-nav="management">Gesti\xF3n premios${openMgmt ? ` (${openMgmt})` : ""}</button>
      <button class="btn" data-nav="stock">Stock y pedidos</button>
      <button class="btn" data-nav="arqueo">Arqueo</button>
      <button class="btn" data-nav="weekly">Extracto semanal</button>
      <button class="btn" data-nav="stats">Estad\xEDsticas</button>
      <button class="btn" data-nav="close">Cierre y balance</button>
      <button class="btn" data-nav="saves">Guardar / exportar</button>
      <button class="btn" id="btn-music-toggle">${musicOn2 ? "\u266A M\xFAsica: ON" : "\u266A M\xFAsica: OFF"}</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:14px 0" />
      <div class="stat-row"><span>Banco</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
      <div class="stat-row"><span>Caja</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      <div class="stat-row"><span>Ventas hoy</span><strong>${formatEuro(state.finance.daySalesCents)}</strong></div>
      <div class="stat-row"><span>Comisi\xF3n hoy</span><strong>${formatEuro(profit.commissionCents)}</strong></div>
      <div class="stat-row"><span>Beneficio hoy*</span><strong>${formatEuro(profit.profitCents)}</strong></div>
      <div class="stat-row"><span>Clientes hoy</span><strong>${state.customers.servedToday}</strong></div>
      <div class="stat-row"><span>En cola</span><strong>${((_b = state.customers.queue) == null ? void 0 : _b.length) || 0}</strong></div>
      <div class="stat-row"><span>Velocidad</span><strong>${speedLabel(state.clock.speed, state.clock.paused)}</strong></div>
      <p class="muted" style="font-size:0.78rem;margin-top:8px">*Comisiones \u2212 gastos del d\xEDa</p>
    </aside>
  `;
  }
  function bindNav() {
    app.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.onclick = () => {
        sfx.click();
        const screen = btn.getAttribute("data-nav");
        if (screen === "fichas") state.ui.fichaId = null;
        if (screen === "arqueo") {
          startArqueo(state, "midday");
        } else {
          state.ui.screen = screen;
        }
        needsFullRender = true;
        render();
      };
    });
    const musicBtn = document.getElementById("btn-music-toggle");
    if (musicBtn) {
      musicBtn.onclick = () => {
        var _a;
        const next = !(((_a = state.settings) == null ? void 0 : _a.music) !== false && isMusicEnabled());
        state.settings = state.settings || {};
        state.settings.music = next;
        setMusicEnabled(next);
        if (next) startMusic();
        sfx.click();
        needsFullRender = true;
        render();
      };
    }
  }
  function queueHTML() {
    const queue = state.customers.queue || [];
    if (!queue.length) {
      return `<div class="muted" style="margin-top:8px">Cola vac\xEDa</div>`;
    }
    return `
    <div class="queue-list" style="margin-top:8px">
      ${queue.slice(0, 12).map((c, i) => {
      const kind = c.kind === "pena" ? "Pe\xF1a" : c.kind === "abonado" ? "Abonado" : c.regular ? "Habitual" : "Visitante";
      const wish = (c.wishlist || []).slice(0, 2).map((w) => w.productName).join(", ");
      return `<div class="queue-item"><strong>${i + 1}. ${escapeHtml(c.name)}</strong>
            <span class="muted"> \xB7 ${kind}${c.intent ? ` \xB7 ${escapeHtml(c.intent)}` : ""}</span>
            ${wish ? `<div class="muted">${escapeHtml(wish)}</div>` : ""}
          </div>`;
    }).join("")}
      ${queue.length > 12 ? `<div class="muted">\u2026 y ${queue.length - 12} m\xE1s</div>` : ""}
    </div>`;
  }
  function wishlistHTML(client) {
    const list = client.wishlist || [];
    if (!list.length) {
      if (client.request) {
        return `<ul class="wish-list"><li><strong>${escapeHtml(client.request.productName)}</strong> \xD7 ${client.request.qty}</li></ul>`;
      }
      return "";
    }
    return `<ul class="wish-list">${list.map(
      (w) => `<li>\u2022 <strong>${escapeHtml(w.productName)}</strong> \xD7 ${w.qty}${w.preferDictate ? ' <span class="muted">(dictado)</span>' : ""}</li>`
    ).join("")}</ul>`;
  }
  function calendarOrderButtonsHTML(prefix = "cal") {
    const d = specialOrderDeadlines(state);
    return `
    <div class="actions" style="margin-top:8px;flex-wrap:wrap">
      <button class="btn" id="btn-${prefix}-navidad" title="Entrega ${d.navidad.deliverBy}">Encargo Navidad</button>
      <button class="btn" id="btn-${prefix}-nino" title="Entrega ${d.nino.deliverBy}">Encargo Ni\xF1o</button>
    </div>`;
  }
  function bindCalendarOrderButtons(prefix, client) {
    const deadlines = specialOrderDeadlines(state);
    const make = (kind) => {
      var _a, _b;
      const d = deadlines[kind];
      const name = (client == null ? void 0 : client.name) || prompt("Nombre del cliente para el encargo:", "Cliente") || "Cliente";
      const qtyRaw = prompt(`Cantidad de ${((_a = getProduct(d.productId)) == null ? void 0 : _a.name) || kind}:`, "10");
      const qty = Math.max(1, Math.min(200, Number(qtyRaw) || 10));
      createCalendarOrder(state, {
        productId: d.productId,
        qty,
        clientId: (client == null ? void 0 : client.id) || null,
        clientName: name,
        deliverBy: d.deliverBy
      });
      sfx.success();
      showToast(`Encargo ${(_b = getProduct(d.productId)) == null ? void 0 : _b.name}: \xD7${qty} \xB7 entrega ${d.deliverBy}`);
      needsFullRender = true;
      render();
    };
    const nav = document.getElementById(`btn-${prefix}-navidad`);
    const nino = document.getElementById(`btn-${prefix}-nino`);
    if (nav) nav.onclick = () => make("navidad");
    if (nino) nino.onclick = () => make("nino");
  }
  function renderCounter() {
    var _a;
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
        ${isTouristSeason(state) ? '<p class="muted">Hay turistas del Caminito: m\xE1s cola y rascas.</p>' : ""}
        <div class="actions" style="margin-top:12px">
          <button class="btn" id="btn-arqueo-open">Arqueo de apertura</button>
        </div>
        ${calendarOrderButtonsHTML("counter")}
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
          ${client && isOpenHours(state) && !isClosedDay(state) ? `<div style="margin-top:12px" class="actions">
                  <button class="btn" id="btn-arqueo-open">Arqueo de apertura</button>
                </div>
                ${calendarOrderButtonsHTML("counter")}` : ""}
          <div style="margin-top:16px">
            <h3>Cola (${((_a = state.customers.queue) == null ? void 0 : _a.length) || 0})</h3>
            ${queueHTML()}
          </div>
          <div style="margin-top:16px">
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
    bindCalendarOrderButtons("counter", state.customers.current);
    const arqueoOpen = document.getElementById("btn-arqueo-open");
    if (arqueoOpen) {
      arqueoOpen.onclick = () => {
        sfx.click();
        startArqueo(state, "open");
        needsFullRender = true;
        render();
      };
    }
  }
  function renderClientPanel(client) {
    const intent = client.intent || "buy";
    const trait = client.trait ? ` \xB7 ${client.trait}` : "";
    const quote = client.line || client.note || "";
    const kindLabel = client.kind === "pena" ? "Pe\xF1a" : client.kind === "abonado" ? "Abonado" : client.regular ? "Habitual" : "Visitante";
    if (intent === "buy" || intent === "reserve_special") {
      const totalWish = (client.wishlist || []).reduce((s, w) => {
        const p = getProduct(w.productId);
        return s + ((p == null ? void 0 : p.priceCents) || 0) * w.qty;
      }, 0);
      return `
      <div class="client-card">
        <div class="muted">${kindLabel}${trait} \xB7 ${escapeHtml(client.street || "")}</div>
        <h3>${escapeHtml(client.name)}</h3>
        ${quote ? `<p class="muted">\u201C${escapeHtml(quote)}\u201D</p>` : ""}
        <p>${intent === "reserve_special" ? "Encargo / petici\xF3n:" : "Quiere:"}</p>
        ${wishlistHTML(client)}
        ${totalWish ? `<p class="muted">Estimado: ${formatEuro(totalWish)}</p>` : ""}
        <p class="muted">Pago preferido: ${payLabel(client.prefersPayment)}</p>
        <div class="actions">
          <button class="btn primary" id="btn-open-tpv">Abrir TPV</button>
          <button class="btn" id="btn-load-wish">Cargar petici\xF3n</button>
          ${intent === "reserve_special" ? `<button class="btn" id="btn-reserve">Reservar sin pagar</button>` : `<button class="btn" id="btn-reserve">Reservar sin pagar</button>`}
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
  function loadWishlistIntoTpv(client) {
    var _a;
    openTpv(state, client);
    const items = ((_a = client.wishlist) == null ? void 0 : _a.length) ? client.wishlist : client.request ? [client.request] : [];
    for (const w of items) {
      const src = w.preferDictate ? "dictate" : "random";
      for (let i = 0; i < (w.qty || 1); i++) {
        addTpvProduct(state, w.productId, { qty: 1, numberSource: src });
      }
    }
  }
  function bindClientActions() {
    const openTpvBtn = document.getElementById("btn-open-tpv");
    if (openTpvBtn) {
      openTpvBtn.onclick = () => {
        const client = state.customers.current;
        if (!client) return;
        sfx.tpv();
        openTpv(state, client);
        needsFullRender = true;
        render();
      };
    }
    const loadWish = document.getElementById("btn-load-wish");
    if (loadWish) {
      loadWish.onclick = () => {
        var _a;
        const client = state.customers.current;
        if (!client) return;
        sfx.tpv();
        loadWishlistIntoTpv(client);
        if ((_a = state.ui.tpv) == null ? void 0 : _a.message) showToast(state.ui.tpv.message);
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
  function wishlistValidationHTML(tpv) {
    var _a;
    if (!((_a = tpv == null ? void 0 : tpv.wishlist) == null ? void 0 : _a.length)) return "";
    const v = validateWishlist(tpv);
    const rows = [];
    for (const c of v.covered) {
      rows.push(
        `<div class="wish-ok">\u2713 ${escapeHtml(c.productName)} \xD7${c.qty}</div>`
      );
    }
    for (const m of v.missing) {
      rows.push(
        `<div class="wish-miss">\u2717 ${escapeHtml(m.productName)} \xB7 faltan ${m.need} (hay ${m.have})</div>`
      );
    }
    for (const e of v.extras) {
      rows.push(
        `<div class="wish-extra">+ Extra: ${escapeHtml(e.productName)} \xD7${e.qty}</div>`
      );
    }
    return `<div class="wish-panel" style="margin:10px 0">
    <strong>Petici\xF3n del cliente</strong>
    ${rows.join("") || '<div class="muted">Sin l\xEDneas a\xFAn</div>'}
  </div>`;
  }
  function cancelPromptHTML(tpv) {
    if (!(tpv == null ? void 0 : tpv.cancelPrompt)) return "";
    const line = tpv.lines.find((l) => l.id === tpv.cancelPrompt.lineId);
    return `<div class="dictate-box" style="margin:10px 0">
    <strong>Cancelar l\xEDnea${line ? `: ${escapeHtml(line.name)}` : ""}</strong>
    <p class="muted">Elige motivo</p>
    <div class="actions" style="flex-wrap:wrap">
      ${CANCEL_REASONS.map(
      (r) => `<button class="btn danger" data-cancel-reason="${escapeHtml(r)}">${escapeHtml(r)}</button>`
    ).join("")}
      <button class="btn ghost" id="btn-cancel-dismiss">No cancelar</button>
    </div>
  </div>`;
  }
  function resolveTpvClient(tpv) {
    var _a, _b, _c, _d;
    return ((_a = state.customers.current) == null ? void 0 : _a.id) === tpv.clientId ? state.customers.current : state.customers.regulars.find((c) => c.id === tpv.clientId) || ((_b = state.customers.abonados) == null ? void 0 : _b.find((c) => c.id === tpv.clientId)) || ((_c = state.customers.penas) == null ? void 0 : _c.find((c) => c.id === tpv.clientId)) || {
      id: tpv.clientId,
      name: tpv.clientName,
      prefersPayment: ((_d = state.customers.current) == null ? void 0 : _d.prefersPayment) || "cash"
    };
  }
  function confirmTpvCharge() {
    const tpv = state.ui.tpv;
    if (!tpv) return;
    const ready = tpvReadyToCharge(tpv);
    if (!ready.ok) {
      tpv.message = ready.error;
      sfx.error();
      needsFullRender = true;
      render();
      return;
    }
    const items = tpvToSaleItems(tpv);
    const client = resolveTpvClient(tpv);
    startPayment(state, { items, client });
    state.ui.tpv = null;
    sfx.drawer();
    needsFullRender = true;
    render();
  }
  function goTpvChargeOrReceipt() {
    var _a;
    const tpv = state.ui.tpv;
    if (!tpv) return;
    if (tpv.step === "receipt") {
      confirmTpvCharge();
      return;
    }
    goTpvReceipt(state);
    if (((_a = state.ui.tpv) == null ? void 0 : _a.step) !== "receipt") sfx.error();
    else sfx.scan();
    needsFullRender = true;
    render();
  }
  function renderTpvReceipt(tpv) {
    const total = tpvTotalCents(tpv);
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel" style="margin-top:16px;max-width:720px">
        <h2>Ticket de venta \xB7 ${escapeHtml(tpv.clientName || "Cliente")}</h2>
        <p class="muted">Revisa el ticket antes de cobrar. Puedes descargar PDF.</p>
        ${wishlistValidationHTML(tpv)}
        <div class="log" style="margin:12px 0">
          ${tpv.lines.map(
      (l) => `<div class="log-item"><strong>${escapeHtml(l.name)}</strong> \xD7${l.qty} \xB7 ${formatEuro(l.unitCents * l.qty)}
                ${l.needsNumbers ? `<div class="muted">${escapeHtml(formatLineSelection(l))}</div>` : ""}</div>`
    ).join("")}
        </div>
        <div class="total-box">Total<strong>${formatEuro(total)}</strong></div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" id="btn-tpv-pdf">PDF ticket</button>
          <button class="btn primary" id="btn-tpv-confirm-pay" style="min-height:52px">Confirmar cobro</button>
          <button class="btn ghost" id="btn-tpv-back-edit">Volver a editar</button>
        </div>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    document.getElementById("btn-tpv-pdf").onclick = () => {
      downloadSaleReceiptPdf({
        items: tpvToSaleItems(tpv),
        totalCents: total,
        clientName: tpv.clientName,
        method: "pendiente",
        tickets: []
      });
      sfx.click();
      showToast("PDF del ticket descargado");
    };
    document.getElementById("btn-tpv-confirm-pay").onclick = () => confirmTpvCharge();
    document.getElementById("btn-tpv-back-edit").onclick = () => {
      backTpvEdit(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
    ensureTpvKeyboard();
  }
  function renderTpv() {
    const tpv = state.ui.tpv;
    if (!tpv) {
      state.ui.screen = "counter";
      return render();
    }
    if (tpv.step === "receipt") return renderTpvReceipt(tpv);
    const cat = tpv.category || "LAE";
    const products = productsByTpvCategory(cat);
    const total = tpvTotalCents(tpv);
    const entry = tpv.numberEntry;
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">TPV \xB7 ${escapeHtml(tpv.clientName || "Cliente")}</h2>
            <p class="muted" style="margin:4px 0 0">F1\u2013F6 categor\xEDas \xB7 Enter cobrar \xB7 Esc atr\xE1s</p>
          </div>
          <button class="btn ghost" id="btn-tpv-back">Volver al mostrador</button>
        </div>
        ${tpv.message ? `<div class="error-box" style="margin:10px 0">${escapeHtml(tpv.message)}</div>` : ""}
        ${wishlistValidationHTML(tpv)}
        ${cancelPromptHTML(tpv)}
        ${entry ? `<div class="dictate-box">
                <strong>Dictado: ${escapeHtml(entry.productName || "")}</strong>
                <p class="muted">${escapeHtml(dictateHint(entry.mode))}</p>
                <textarea id="dictate-input" placeholder="N\xFAmeros que dicta el cliente\u2026">${escapeHtml(entry.draft || "")}</textarea>
                <div class="actions" style="margin-top:8px">
                  <button class="btn primary" id="btn-dictate-ok">Marcar n\xFAmeros</button>
                  <button class="btn ghost" id="btn-dictate-cancel">Cancelar dictado</button>
                </div>
              </div>` : ""}
        <div class="tpv-wrap">
          <div class="tpv-cats">
            ${TPV_CATEGORIES.map(
      (c, i) => `<button class="btn ${c === cat ? "primary" : ""}" data-tpv-cat="${c}">F${i + 1} ${escapeHtml(c)}</button>`
    ).join("")}
          </div>
          <div class="tpv-products">
            ${products.map((p) => {
      var _a;
      const stock = p.stockType === "physical" ? `Stock ${(_a = state.stock[p.id]) != null ? _a : 0}` : "Terminal";
      return `<div class="tpv-product">
                  <strong>${escapeHtml(p.name)}</strong>
                  <span>${formatEuro(p.priceCents)} \xB7 ${escapeHtml(stock)}</span>
                  <div class="actions" style="margin-top:8px;gap:6px">
                    <button class="btn primary" style="flex:1;min-height:42px;padding:8px" data-add-random="${p.id}">Aleatorio</button>
                    ${p.needsNumbers ? `<button class="btn" style="flex:1;min-height:42px;padding:8px" data-add-dictate="${p.id}">Dictado</button>` : `<button class="btn" style="flex:1;min-height:42px;padding:8px" data-add-random="${p.id}">+1</button>`}
                  </div>
                </div>`;
    }).join("")}
          </div>
          <aside class="tpv-cart">
            <h3 style="margin:0 0 8px">Ticket</h3>
            <div style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
              ${tpv.lines.length ? tpv.lines.map(
      (l) => `<div class="tpv-line">
                          <div><strong>${escapeHtml(l.name)}</strong> \xB7 ${formatEuro(l.unitCents * l.qty)}</div>
                          ${l.needsNumbers ? `<div class="muted">${escapeHtml(formatLineSelection(l))}</div>` : ""}
                          <div class="actions" style="margin-top:6px;gap:4px;flex-wrap:wrap">
                            <button class="btn" style="padding:6px 10px" data-qty="${l.id}" data-delta="-1">\u2212</button>
                            <strong style="min-width:1.5rem;text-align:center">${l.qty}</strong>
                            <button class="btn" style="padding:6px 10px" data-qty="${l.id}" data-delta="1">+</button>
                            ${l.needsNumbers ? `<button class="btn" style="padding:6px 10px" data-reroll="${l.id}">Aleat.</button>
                                   <button class="btn" style="padding:6px 10px" data-dictate-line="${l.id}">Dictar</button>` : ""}
                            <button class="btn danger" style="padding:6px 10px" data-remove="${l.id}">Quitar</button>
                          </div>
                        </div>`
    ).join("") : '<div class="muted">Carrito vac\xEDo. A\xF1ade productos.</div>'}
            </div>
            <div class="total-box" style="margin-top:8px">Total<strong>${formatEuro(total)}</strong></div>
            <div class="actions" style="margin-top:8px">
              <button class="btn primary" id="btn-tpv-charge" style="flex:1;min-height:52px;font-size:1.05rem">Cobrar</button>
              <button class="btn danger" id="btn-tpv-cancel" style="min-height:52px">Cancelar</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    ensureTpvKeyboard();
    document.getElementById("btn-tpv-back").onclick = () => {
      sfx.click();
      closeTpv(state);
      needsFullRender = true;
      render();
    };
    app.querySelectorAll("[data-tpv-cat]").forEach((btn) => {
      btn.onclick = () => {
        sfx.click();
        setTpvCategory(state, btn.getAttribute("data-tpv-cat"));
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-add-random]").forEach((btn) => {
      btn.onclick = () => {
        sfx.tpv();
        addTpvProduct(state, btn.getAttribute("data-add-random"), { numberSource: "random" });
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-add-dictate]").forEach((btn) => {
      btn.onclick = () => {
        sfx.tpv();
        addTpvProduct(state, btn.getAttribute("data-add-dictate"), { numberSource: "dictate" });
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-qty]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-qty");
        const delta = Number(btn.getAttribute("data-delta"));
        const line = tpv.lines.find((l) => l.id === id);
        if (!line) return;
        setLineQty(state, id, line.qty + delta);
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.onclick = () => {
        removeTpvLine(state, btn.getAttribute("data-remove"));
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-cancel-reason]").forEach((btn) => {
      btn.onclick = () => {
        confirmCancelLine(state, btn.getAttribute("data-cancel-reason"));
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    const dismissCancel = document.getElementById("btn-cancel-dismiss");
    if (dismissCancel) {
      dismissCancel.onclick = () => {
        dismissCancelPrompt(state);
        sfx.click();
        needsFullRender = true;
        render();
      };
    }
    app.querySelectorAll("[data-reroll]").forEach((btn) => {
      btn.onclick = () => {
        rerollLineNumbers(state, btn.getAttribute("data-reroll"));
        sfx.scan();
        needsFullRender = true;
        render();
      };
    });
    app.querySelectorAll("[data-dictate-line]").forEach((btn) => {
      btn.onclick = () => {
        startDictateLine(state, btn.getAttribute("data-dictate-line"));
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    const dictateOk = document.getElementById("btn-dictate-ok");
    if (dictateOk) {
      dictateOk.onclick = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
        const text = ((_a = document.getElementById("dictate-input")) == null ? void 0 : _a.value) || "";
        applyDictatedNumbers(state, text);
        if (((_c = (_b = state.ui.tpv) == null ? void 0 : _b.message) == null ? void 0 : _c.includes("Falta")) || ((_e = (_d = state.ui.tpv) == null ? void 0 : _d.message) == null ? void 0 : _e.includes("Indica")) || ((_g = (_f = state.ui.tpv) == null ? void 0 : _f.message) == null ? void 0 : _g.includes("Formato")) || ((_i = (_h = state.ui.tpv) == null ? void 0 : _h.message) == null ? void 0 : _i.includes("n\xFAmeros")) || ((_j = state.ui.tpv) == null ? void 0 : _j.numberEntry)) {
          sfx.error();
        } else {
          sfx.success();
        }
        needsFullRender = true;
        render();
      };
    }
    const dictateCancel = document.getElementById("btn-dictate-cancel");
    if (dictateCancel) {
      dictateCancel.onclick = () => {
        cancelNumberEntry(state);
        sfx.click();
        needsFullRender = true;
        render();
      };
    }
    document.getElementById("btn-tpv-charge").onclick = () => goTpvChargeOrReceipt();
    document.getElementById("btn-tpv-cancel").onclick = () => {
      sfx.click();
      closeTpv(state);
      showToast("TPV cancelado");
      needsFullRender = true;
      render();
    };
  }
  function ensureTpvKeyboard() {
    if (tpvKeysBound) return;
    tpvKeysBound = true;
    document.addEventListener("keydown", (e) => {
      var _a;
      if (!state || state.ui.screen !== "tpv" || !state.ui.tpv) return;
      const tpv = state.ui.tpv;
      const tag = (((_a = e.target) == null ? void 0 : _a.tagName) || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if (e.key === "Escape") {
        e.preventDefault();
        if (tpv.cancelPrompt) {
          dismissCancelPrompt(state);
        } else if (tpv.numberEntry) {
          cancelNumberEntry(state);
        } else if (tpv.step === "receipt") {
          backTpvEdit(state);
        } else {
          closeTpv(state);
          showToast("TPV cerrado");
        }
        needsFullRender = true;
        render();
        return;
      }
      if (e.key === "Enter" && !typing) {
        e.preventDefault();
        goTpvChargeOrReceipt();
        return;
      }
      if (!typing && /^F[1-6]$/.test(e.key)) {
        e.preventDefault();
        const idx = Number(e.key.slice(1)) - 1;
        const cat = TPV_CATEGORIES[idx];
        if (cat && tpv.step !== "receipt") {
          setTpvCategory(state, cat);
          sfx.click();
          needsFullRender = true;
          render();
        }
      }
    });
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const summary = buildDayCloseSummary(state);
    const orgs = summary.orgs || dayProfitBreakdown(state).orgs;
    const settle = summary.settlement || state.finance.lastSettlement;
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

          <h3 style="margin-top:18px">Desglose por organizaci\xF3n</h3>
          <div class="close-summary">
            ${["LAE", "ONCE", "Otros"].map((org) => {
      const o = (orgs == null ? void 0 : orgs[org]) || { sales: 0, commission: 0, prizes: 0 };
      return `<div class="stat-row"><span>${org} ventas</span><strong>${formatEuro(o.sales)}</strong></div>
                  <div class="stat-row"><span>${org} comisi\xF3n</span><strong>${formatEuro(o.commission)}</strong></div>
                  <div class="stat-row"><span>${org} premios</span><strong>${formatEuro(o.prizes || 0)}</strong></div>`;
    }).join("")}
          </div>

          <h3 style="margin-top:18px">Liquidaci\xF3n prevista / \xFAltima</h3>
          ${settle ? `<div class="close-summary">
                  <div class="stat-row"><span>LAE remesa</span><strong>${formatEuro(((_a = settle.lae) == null ? void 0 : _a.remittance) || 0)}</strong></div>
                  <div class="stat-row"><span>LAE comisi\xF3n retenida</span><strong>${formatEuro(((_b = settle.lae) == null ? void 0 : _b.commission) || 0)}</strong></div>
                  <div class="stat-row"><span>ONCE remesa</span><strong>${formatEuro(((_c = settle.once) == null ? void 0 : _c.remittance) || 0)}</strong></div>
                  <div class="stat-row"><span>ONCE comisi\xF3n retenida</span><strong>${formatEuro(((_d = settle.once) == null ? void 0 : _d.commission) || 0)}</strong></div>
                  <div class="stat-row"><span>Otros remesa</span><strong>${formatEuro(((_e = settle.otros) == null ? void 0 : _e.remittance) || 0)}</strong></div>
                  <div class="stat-row"><span>Reembolso premios</span><strong>${formatEuro(
      (((_f = settle.lae) == null ? void 0 : _f.prizesReimbursed) || 0) + (((_g = settle.once) == null ? void 0 : _g.prizesReimbursed) || 0) + (((_h = settle.otros) == null ? void 0 : _h.prizesReimbursed) || 0)
    )}</strong></div>
                </div>` : `<p class="muted">Se calcular\xE1 al cerrar el d\xEDa (ventas \u2212 comisi\xF3n por org, m\xE1s reembolso de premios).</p>
                <div class="close-summary">
                  <div class="stat-row"><span>LAE remesa estimada</span><strong>${formatEuro((((_i = orgs == null ? void 0 : orgs.LAE) == null ? void 0 : _i.sales) || 0) - (((_j = orgs == null ? void 0 : orgs.LAE) == null ? void 0 : _j.commission) || 0))}</strong></div>
                  <div class="stat-row"><span>ONCE remesa estimada</span><strong>${formatEuro((((_k = orgs == null ? void 0 : orgs.ONCE) == null ? void 0 : _k.sales) || 0) - (((_l = orgs == null ? void 0 : orgs.ONCE) == null ? void 0 : _l.commission) || 0))}</strong></div>
                  <div class="stat-row"><span>Otros remesa estimada</span><strong>${formatEuro((((_m = orgs == null ? void 0 : orgs.Otros) == null ? void 0 : _m.sales) || 0) - (((_n = orgs == null ? void 0 : orgs.Otros) == null ? void 0 : _n.commission) || 0))}</strong></div>
                </div>`}

          <p class="muted">*Beneficio \u2248 comisiones \u2212 gastos (antes de liquidar)</p>
          <p class="muted" style="margin-top:12px">Recomendado: haz el arqueo de caja antes de cerrar.</p>
          <div class="actions" style="margin-top:18px">
            <button class="btn" id="btn-arqueo-before-close">Arqueo de caja primero</button>
            <button class="btn accent" id="btn-do-close">Liquidar, balance y cerrar d\xEDa</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    document.getElementById("btn-arqueo-before-close").onclick = () => {
      sfx.click();
      startArqueo(state, "close");
      needsFullRender = true;
      render();
    };
    document.getElementById("btn-do-close").onclick = () => {
      const { summary: s } = closeDay(state);
      const slot = state.meta.activeSlot || 1;
      state.meta.activeSlot = slot;
      saveToSlot(state, slot);
      sfx.success();
      showToast(
        `D\xEDa cerrado \u2192 ${s.nextDay}. Beneficio ${formatEuro(s.profitCents)}. Liquidaci\xF3n hecha. Guardado hueco ${slot}.`
      );
      needsFullRender = true;
      render();
    };
  }
  function arqueoDenomEditor() {
    var _a;
    const counted = ((_a = state.ui.arqueo) == null ? void 0 : _a.counted) || {};
    return [
      ["Billetes", BILLS],
      ["Monedas", COINS]
    ].map(
      ([title, list]) => `
      <h3 style="margin-top:14px">${title}</h3>
      <div class="denom-grid">
        ${list.map((d) => {
        const n = counted[d.id] || 0;
        return `<div class="denom">
              <div class="label">${d.label}</div>
              <div class="row">
                <button data-arqueo="${d.id}" data-delta="-1">\u2212</button>
                <strong>${n}</strong>
                <button data-arqueo="${d.id}" data-delta="1">+</button>
              </div>
            </div>`;
      }).join("")}
      </div>`
    ).join("");
  }
  function renderArqueo() {
    const a = state.ui.arqueo;
    if (!a) {
      state.ui.screen = "counter";
      return render();
    }
    const kindLabel = a.kind === "open" ? "apertura" : a.kind === "close" ? "cierre" : "caja";
    let body;
    if (a.step === "result" && a.result) {
      const { expected, counted, diff } = a.result;
      body = `
      <div class="hero-counter">
        <h2>Resultado del arqueo</h2>
        <p>${escapeHtml(a.message || "")}</p>
      </div>
      <div class="close-summary">
        <div class="stat-row"><span>Esperado (caja)</span><strong>${formatEuro(expected)}</strong></div>
        <div class="stat-row"><span>Contado</span><strong>${formatEuro(counted)}</strong></div>
        <div class="stat-row"><span>Diferencia</span><strong>${formatEuro(diff)}</strong></div>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="btn primary" id="btn-arqueo-done">Cerrar arqueo</button>
      </div>`;
    } else {
      const counted = countTotalCents(a.counted);
      body = `
      <p class="muted">Cuenta billetes y monedas del caj\xF3n (${kindLabel}).</p>
      <div class="totals" style="margin:12px 0">
        <div class="total-box">Contado<strong>${formatEuro(counted)}</strong></div>
        <div class="total-box">En sistema<strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      </div>
      ${arqueoDenomEditor()}
      ${a.message ? `<div class="error-box" style="margin:10px 0">${escapeHtml(a.message)}</div>` : ""}
      <div class="actions" style="margin-top:16px">
        <button class="btn primary" id="btn-arqueo-confirm">Confirmar conteo</button>
        <button class="btn ghost" id="btn-arqueo-cancel">Cancelar</button>
      </div>`;
    }
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Arqueo de ${kindLabel}</h2>
          ${body}
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    app.querySelectorAll("[data-arqueo]").forEach((btn) => {
      btn.onclick = () => {
        adjustArqueoCount(state, btn.getAttribute("data-arqueo"), Number(btn.getAttribute("data-delta")));
        sfx.click();
        needsFullRender = true;
        render();
      };
    });
    const conf = document.getElementById("btn-arqueo-confirm");
    if (conf) {
      conf.onclick = () => {
        confirmArqueo(state);
        sfx.scan();
        needsFullRender = true;
        render();
      };
    }
    const done = document.getElementById("btn-arqueo-done");
    if (done) {
      done.onclick = () => {
        closeArqueo(state);
        sfx.success();
        needsFullRender = true;
        render();
      };
    }
    const cancel = document.getElementById("btn-arqueo-cancel");
    if (cancel) {
      cancel.onclick = () => {
        closeArqueo(state);
        sfx.click();
        needsFullRender = true;
        render();
      };
    }
  }
  function renderWeekly() {
    const w = buildWeeklyStatement(state);
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Extracto semanal</h2>
          <p class="muted">${w.fromYmd} \u2192 ${w.toYmd}${isMonday(state) ? " \xB7 Hoy es lunes (revisi\xF3n recomendada)" : ""}</p>
          <div class="close-summary">
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(w.sales)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(w.commission)}</strong></div>
            <div class="stat-row"><span>Premios</span><strong>${formatEuro(w.prizes)}</strong></div>
            <div class="stat-row"><span>Gastos</span><strong>${formatEuro(w.expenses)}</strong></div>
            <div class="stat-row"><span>Faltantes</span><strong>${formatEuro(w.shortage)}</strong></div>
            <div class="stat-row"><span>Liquidaciones</span><strong>${w.settlements}</strong></div>
            <div class="stat-row"><span>Neto (comisi\xF3n \u2212 gastos \u2212 faltantes)</span><strong>${formatEuro(w.net)}</strong></div>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
  }
  function renderStats() {
    var _a, _b;
    const s = state.stats || {};
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Estad\xEDsticas</h2>
          <p class="muted">Acumulado de la partida</p>
          <div class="close-summary">
            <div class="stat-row"><span>D\xEDas jugados</span><strong>${(_a = s.daysPlayed) != null ? _a : 0}</strong></div>
            <div class="stat-row"><span>Ventas totales</span><strong>${formatEuro(s.totalSalesCents || 0)}</strong></div>
            <div class="stat-row"><span>Comisiones totales</span><strong>${formatEuro(s.totalCommissionCents || 0)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(s.totalPrizesPaidCents || 0)}</strong></div>
            <div class="stat-row"><span>Faltantes de caja</span><strong>${formatEuro(s.totalShortageCents || 0)}</strong></div>
            <div class="stat-row"><span>Clientes atendidos</span><strong>${(_b = s.totalCustomers) != null ? _b : 0}</strong></div>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
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
        maybeStartMusic();
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
        maybeStartMusic();
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
          <div style="margin-bottom:14px">
            <h3 style="margin:0 0 6px">Encargos de calendario</h3>
            <p class="muted" style="margin:0 0 8px">Navidad / Ni\xF1o con fecha de entrega.</p>
            ${calendarOrderButtonsHTML("stock")}
          </div>
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
    bindCalendarOrderButtons("stock", state.customers.current);
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
  function formatDrawDetail(d) {
    let detail = "";
    if (d.numbers) detail = d.numbers.join(", ");
    if (d.stars) detail += ` \u2605 ${d.stars.join(", ")}`;
    if (d.reintegro != null) detail += ` \xB7 R${d.reintegro}`;
    if (d.clave != null) detail += ` \xB7 clave ${d.clave}`;
    if (d.winningNumber) detail = `N\xBA ${d.winningNumber}`;
    if (d.column) detail = `Columna ${d.column.join("")}${d.pleno ? ` \xB7 pleno ${d.pleno}` : ""}`;
    if (d.goals) detail = `Goles ${d.goals.join("")}`;
    if (d.complementary != null) detail += ` \xB7 C${d.complementary}`;
    return detail || "\u2014";
  }
  function renderDraws() {
    ensureDrawsResolved(state);
    const entries = listDrawHistory(state, 60);
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
      const p = getProduct(d.productId);
      return `<div class="log-item"><strong>${escapeHtml((p == null ? void 0 : p.name) || d.productId)}</strong> \xB7 ${d.ymd}<br/>${escapeHtml(formatDrawDetail(d))}</div>`;
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
  function findFicha(id) {
    return (state.customers.abonados || []).find((c) => c.id === id) || (state.customers.penas || []).find((c) => c.id === id) || null;
  }
  function renderFichas() {
    const abonados = state.customers.abonados || [];
    const penas = state.customers.penas || [];
    const detail = state.ui.fichaId ? findFicha(state.ui.fichaId) : null;
    let body;
    if (detail) {
      const favIds = detail.preferredProducts || (detail.favoriteProduct ? [detail.favoriteProduct] : []);
      const favNames = favIds.map((id) => {
        var _a;
        return ((_a = getProduct(id)) == null ? void 0 : _a.name) || id;
      });
      const history = [...detail.history || []].slice(-20).reverse();
      const prizes = detail.prizesClaimed || [];
      const orders = detail.orders || [];
      const clientOrders = (state.orders || []).filter((o) => o.clientId === detail.id).slice(-15).reverse();
      body = `
      <button class="btn ghost" id="btn-ficha-back" style="margin-bottom:12px">\u2190 Volver al listado</button>
      <h2>${escapeHtml(detail.name)}</h2>
      <p class="muted">${detail.kind === "pena" ? "Pe\xF1a" : "Abonado"}${detail.street ? ` \xB7 ${escapeHtml(detail.street)}` : ""}${detail.members ? ` \xB7 ${detail.members} socios` : ""}</p>
      <div class="close-summary" style="margin-top:12px">
        <div class="stat-row"><span>Suscripci\xF3n</span><strong>${escapeHtml(detail.subscription || "\u2014")}</strong></div>
        <div class="stat-row"><span>Pago preferido</span><strong>${payLabel(detail.prefersPayment || "cash")}</strong></div>
        <div class="stat-row"><span>Favoritos</span><strong>${escapeHtml(favNames.join(", ") || "\u2014")}</strong></div>
      </div>
      <h3 style="margin-top:16px">Historial de compras</h3>
      <div class="log">
        ${history.length ? history.map((h) => {
        var _a;
        const items = (h.items || []).map((i) => `${i.name || i.productId}\xD7${i.qty}`).join(", ");
        return `<div class="log-item">${formatEuro(h.totalCents || 0)} \xB7 ${escapeHtml(items || "venta")}${((_a = h.ticketIds) == null ? void 0 : _a.length) ? ` \xB7 tickets ${h.ticketIds.join(", ")}` : ""}</div>`;
      }).join("") : '<div class="muted">Sin compras registradas a\xFAn.</div>'}
      </div>
      <h3 style="margin-top:16px">Premios cobrados</h3>
      <div class="log">
        ${prizes.length ? prizes.map(
        (p) => `<div class="log-item">${escapeHtml(p.productName || p.id || "Premio")} \xB7 ${formatEuro(p.amountCents || p.prizeCents || 0)}</div>`
      ).join("") : '<div class="muted">Ning\xFAn premio cobrado en ficha.</div>'}
      </div>
      <h3 style="margin-top:16px">Pedidos / encargos</h3>
      <div class="log">
        ${orders.length || clientOrders.length ? [...orders, ...clientOrders].slice(0, 20).map(
        (o) => `<div class="log-item">${escapeHtml(o.productName || o.productId || "Pedido")} \xD7${o.qty || 1}${o.arriveOnYmd ? ` \xB7 ${o.arriveOnYmd}` : ""}${o.status ? ` \xB7 ${o.status}` : ""}</div>`
      ).join("") : '<div class="muted">Sin pedidos en ficha.</div>'}
      </div>
      <h3 style="margin-top:16px">Nuevo encargo calendario</h3>
      ${calendarOrderButtonsHTML("ficha")}
    `;
    } else {
      body = `
      <h2>Abonados y pe\xF1as</h2>
      <p class="muted">Fichas de clientes con suscripci\xF3n o pe\xF1a. Pulsa para ver detalle.</p>
      <h3 style="margin-top:14px">Abonados (${abonados.length})</h3>
      <div class="slot-grid">
        ${abonados.map(
        (a) => {
          var _a;
          return `<button class="slot" data-ficha="${a.id}" style="cursor:pointer;text-align:left;width:100%">
              <div>
                <strong>${escapeHtml(a.name)}</strong>
                <div class="muted">${escapeHtml(a.subscription || "")} \xB7 ${escapeHtml(((_a = getProduct(a.favoriteProduct)) == null ? void 0 : _a.name) || "")}</div>
              </div>
            </button>`;
        }
      ).join("")}
      </div>
      <h3 style="margin-top:18px">Pe\xF1as (${penas.length})</h3>
      <div class="slot-grid">
        ${penas.map(
        (p) => `<button class="slot" data-ficha="${p.id}" style="cursor:pointer;text-align:left;width:100%">
              <div>
                <strong>${escapeHtml(p.name)}</strong>
                <div class="muted">${escapeHtml(p.subscription || "")}${p.members ? ` \xB7 ${p.members} socios` : ""}</div>
              </div>
            </button>`
      ).join("")}
      </div>
    `;
    }
    app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">${body}</section>
      </div>
    </div>
    ${toastHTML()}
  `;
    bindTopbar();
    bindNav();
    if (detail) bindCalendarOrderButtons("ficha", detail);
    app.querySelectorAll("[data-ficha]").forEach((btn) => {
      btn.onclick = () => {
        sfx.click();
        state.ui.fichaId = btn.getAttribute("data-ficha");
        needsFullRender = true;
        render();
      };
    });
    const back = document.getElementById("btn-ficha-back");
    if (back) {
      back.onclick = () => {
        sfx.click();
        state.ui.fichaId = null;
        needsFullRender = true;
        render();
      };
    }
  }
  state = null;
  renderMenu();
  requestAnimationFrame(loop);
  window.__loterias = () => state;
})();
