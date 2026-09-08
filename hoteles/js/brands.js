/* Horizon Hotels — 50 marcas hoteleras del grupo, todas bajo el nombre Horizon.
   Cada marca combina una categoría (estrellas) y un segmento (estilo/ubicación),
   igual que en Horizon Restaurant Group se combinaba tramo + cocina. */
(function (global) {
  /* ---- Segmentos: estilo/ubicación de la marca ---- */
  const SEGMENTS = {
    urbano: { id: "urbano", name: "Urbano / Negocios", poi: ["urbano", "comercial"], desc: "hotel de ciudad orientado a viajeros de negocios y estancias cortas" },
    aeropuerto: { id: "aeropuerto", name: "Aeropuerto", poi: ["aeropuerto"], desc: "hotel de tránsito junto a terminales aéreas, pensado para escalas y madrugadas" },
    playa: { id: "playa", name: "Playa / Resort", poi: ["playa"], desc: "resort vacacional frente al mar, con piscina y zona de solárium" },
    todoincluido: { id: "todoincluido", name: "Todo incluido", poi: ["playa", "turistico"], desc: "complejo vacacional de régimen todo incluido para familias y grupos" },
    boutique: { id: "boutique", name: "Boutique / Diseño", poi: ["turistico", "historico", "comercial"], desc: "hotel boutique de interiorismo cuidado, en edificio singular" },
    rural: { id: "rural", name: "Rural / Eco", poi: ["rural"], desc: "alojamiento rural o eco-lodge integrado en el paisaje natural" },
    montana: { id: "montana", name: "Montaña / Nieve", poi: ["rural", "turistico"], desc: "hotel o chalet de montaña junto a pistas de esquí o rutas alpinas" },
    bienestar: { id: "bienestar", name: "Bienestar / Spa", poi: ["turistico", "rural", "urbano"], desc: "hotel-balneario centrado en spa, circuitos termales y desconexión" },
    aparthotel: { id: "aparthotel", name: "Aparthotel / Estancias", poi: ["urbano", "comercial"], desc: "apartamentos con servicios hoteleros para estancias medias y largas" },
    historico: { id: "historico", name: "Histórico / Patrimonio", poi: ["historico", "turistico"], desc: "edificio histórico restaurado (palacio, castillo o casa señorial) reconvertido en hotel" },
  };

  /* ---- Categorías: de económico a ultralujo ---- */
  const TIERS = {
    economico: { id: "economico", name: "Económico", stars: 2, adr: 0.42, hours: "24h" },
    medio: { id: "medio", name: "Medio", stars: 3, adr: 0.72, hours: "24h" },
    superior: { id: "superior", name: "Superior", stars: 4, adr: 1.15, hours: "24h" },
    lujo: { id: "lujo", name: "Lujo", stars: 5, adr: 1.85, hours: "24h" },
    ultralujo: { id: "ultralujo", name: "Ultralujo", stars: 5, adr: 3.1, hours: "24h" },
  };

  /* name[seg][tier] — nombre + gancho comercial de cada una de las 50 marcas */
  const NAMES = {
    urbano: {
      economico: ["Horizon Urban Stay", "La ciudad, sin vueltas."],
      medio: ["Horizon City Center", "En el centro de todo."],
      superior: ["Horizon Business Tower", "Trabajo y descanso, en vertical."],
      lujo: ["Horizon Metropolitan", "La metrópoli desde arriba."],
      ultralujo: ["Horizon Imperial Tower", "El ático de la ciudad."],
    },
    aeropuerto: {
      economico: ["Horizon Airport Express", "Aterriza y descansa."],
      medio: ["Horizon Airport Inn", "A un paso de la terminal."],
      superior: ["Horizon Airport Plaza", "Escalas con estilo."],
      lujo: ["Horizon Skyport Grand", "El lujo antes del vuelo."],
      ultralujo: ["Horizon Aviator Suites", "Primera clase en tierra."],
    },
    playa: {
      economico: ["Horizon Beach Lodge", "Arena a pie de puerta."],
      medio: ["Horizon Coral Bay", "La bahía es tuya."],
      superior: ["Horizon Beach Resort", "Vacaciones de manual."],
      lujo: ["Horizon Lagoon Palace", "Una laguna privada."],
      ultralujo: ["Horizon Paradise Reserve", "El último paraíso."],
    },
    todoincluido: {
      economico: ["Horizon Fiesta Club", "Todo incluido, sin sorpresas."],
      medio: ["Horizon Vacation Club", "Vacaciones sin cuentas."],
      superior: ["Horizon All-Inclusive Resort", "Todo, de verdad todo."],
      lujo: ["Horizon Paradiso Resort & Spa", "Todo incluido, todo lujo."],
      ultralujo: ["Horizon Elite All-Inclusive", "El todo incluido de otro nivel."],
    },
    boutique: {
      economico: ["Horizon Studio Loft", "Diseño de bolsillo."],
      medio: ["Horizon Atelier Hotel", "Cada habitación, una pieza."],
      superior: ["Horizon Design House", "La casa del diseño."],
      lujo: ["Horizon Muse Boutique", "Tu musa particular."],
      ultralujo: ["Horizon Atelier Prestige", "Alta costura hotelera."],
    },
    rural: {
      economico: ["Horizon Country Stop", "El campo, sin prisa."],
      medio: ["Horizon Green Lodge", "Verde hasta el horizonte."],
      superior: ["Horizon Eco Retreat", "Desconecta de verdad."],
      lujo: ["Horizon Nature Manor", "La naturaleza como lujo."],
      ultralujo: ["Horizon Wilderness Sanctuary", "El santuario salvaje."],
    },
    montana: {
      economico: ["Horizon Alpine Lodge", "Nieve al alcance de todos."],
      medio: ["Horizon Summit Inn", "Cerca de la cumbre."],
      superior: ["Horizon Peak Resort", "El pico es tu terraza."],
      lujo: ["Horizon Glacier Chalet", "Chimenea y glaciar."],
      ultralujo: ["Horizon Alpine Majestic", "La majestuosidad alpina."],
    },
    bienestar: {
      economico: ["Horizon Wellness Stop", "Un respiro accesible."],
      medio: ["Horizon Serenity Spa", "Serenidad de bolsillo."],
      superior: ["Horizon Zen Retreat", "El equilibrio como servicio."],
      lujo: ["Horizon Sanctuary Spa & Golf", "Cuerpo, mente y hándicap."],
      ultralujo: ["Horizon Aurora Wellness Palace", "El bienestar hecho palacio."],
    },
    aparthotel: {
      economico: ["Horizon Home Stay", "Como en casa, sin serlo."],
      medio: ["Horizon Suites Express", "Suites para quedarte."],
      superior: ["Horizon Residences", "Tu residencia temporal."],
      lujo: ["Horizon Grand Residences", "Grandes espacios, gran servicio."],
      ultralujo: ["Horizon Sky Residences Prestige", "Residir por encima de todo."],
    },
    historico: {
      economico: ["Horizon Heritage Inn", "Historia con presupuesto."],
      medio: ["Horizon Manor House", "La casa señorial de siempre."],
      superior: ["Horizon Castle Hotel", "Dormir en un castillo."],
      lujo: ["Horizon Palace Heritage", "El palacio recuperado."],
      ultralujo: ["Horizon Royal Heritage Palace", "La corona del patrimonio."],
    },
  };

  const SEG_ORDER = ["urbano", "aeropuerto", "playa", "todoincluido", "boutique", "rural", "montana", "bienestar", "aparthotel", "historico"];
  const TIER_ORDER = ["economico", "medio", "superior", "lujo", "ultralujo"];

  function slug(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function short(name) {
    const words = name.replace(/^Horizon\s+/, "").split(/\s+/).filter((w) => !/^[&/]$/.test(w));
    return words.map((w) => w[0]).join("").toUpperCase().slice(0, 4);
  }

  /* Paleta determinista por índice (ángulo dorado) para 50 colores bien
     repartidos y a la vez ligados a la categoría: cuanto más alta la gama,
     más saturado/oscuro y con acento dorado en color2. */
  function paletteFor(i, tierId) {
    const hue = (i * 137.508) % 360;
    const tierIdx = TIER_ORDER.indexOf(tierId);
    const sat = 42 + tierIdx * 8; // económico más apagado, ultralujo más vivo
    const light = 46 - tierIdx * 4;
    const color = hslToHex(hue, sat, Math.max(26, light));
    const color2 = tierIdx >= 3 ? hslToHex(42, 55, 46) /* dorado */ : hslToHex((hue + 35) % 360, sat - 8, Math.max(22, light - 10));
    return { color, color2 };
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
    return "#" + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  const BRANDS = [];
  let i = 0;
  for (const seg of SEG_ORDER) {
    for (const tier of TIER_ORDER) {
      const [name, tagline] = NAMES[seg][tier];
      const id = slug(name);
      const { color, color2 } = paletteFor(i, tier);
      BRANDS.push({
        id,
        name,
        short: short(name),
        segment: seg,
        tier, // economico|medio|superior|lujo|ultralujo
        stars: TIERS[tier].stars,
        adr: TIERS[tier].adr,
        color,
        color2,
        tagline,
      });
      i++;
    }
  }

  function logoSvg(b) {
    const font = b.short.length > 3 ? 15 : 18;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs><linearGradient id="g${b.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${b.color}"/><stop offset="1" stop-color="${b.color2}"/>
      </linearGradient></defs>
      <rect width="64" height="64" rx="16" fill="url(#g${b.id})"/>
      <text x="32" y="38" text-anchor="middle" font-family="Georgia, serif" font-size="${font}" font-weight="700" fill="#fff">${b.short}</text>
    </svg>`;
  }

  BRANDS.forEach((b) => {
    b.logoFile = "img/marcas/" + b.id + ".png";
    b.logo = `<img src="${b.logoFile}" alt="${b.name}" width="64" height="64" onerror="this.onerror=null;this.src='${U.svgToDataUri(logoSvg(b))}'">`;
  });

  const BY_ID = new Map(BRANDS.map((b) => [b.id, b]));

  global.BRAND = {
    list: BRANDS,
    SEGMENTS,
    TIERS,
    get(id) {
      return BY_ID.get(id);
    },
    segments: SEG_ORDER.map((s) => SEGMENTS[s]),
    tiers: TIERS,
  };
})(window);
