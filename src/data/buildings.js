export const DIRS = [
  { id: 0, dx: 1, dy: 0, name: "este" },
  { id: 1, dx: 0, dy: 1, name: "sur" },
  { id: 2, dx: -1, dy: 0, name: "oeste" },
  { id: 3, dx: 0, dy: -1, name: "norte" },
];

function b(id, name, desc, extra = {}) {
  return {
    id,
    name,
    desc,
    color: "#94a3b8",
    icon: "▢",
    power: 10,
    category: "proceso",
    tab: extra.category || extra.tab || "talleres",
    cost: { "plate-fe": 10 },
    research: "start",
    rotatable: true,
    speed: 1,
    tier: 1,
    crafts: [id],
    ...extra,
    tab: extra.tab || extra.category || "talleres",
  };
}

export const BUILDINGS = {
  extractor: b("extractor", "Extractor", "Saca el elemento del yacimiento.", {
    color: "#38bdf8", icon: "⛏️", power: 10, category: "minería", tab: "mineria",
    cost: { "plate-fe": 8, "gear-basic": 2 }, rotatable: false, crafts: ["extractor"],
  }),
  extractor2: b("extractor2", "Extractor II", "El doble de rápido. Mismo yacimiento.", {
    color: "#7dd3fc", icon: "⛏️", power: 16, category: "minería", tab: "mineria",
    cost: { "plate-fe": 16, "gear-basic": 6, "motor-basic": 1 }, research: "industry-2",
    rotatable: false, speed: 1.8, tier: 2, crafts: ["extractor"], visual: "extractor",
  }),
  extractor3: b("extractor3", "Extractor III", "Tres veces más rápido.", {
    color: "#e0f2fe", icon: "⛏️", power: 24, category: "minería", tab: "mineria",
    cost: { "steel": 12, "motor-basic": 2, "circuit-basic": 2 }, research: "industry-3",
    rotatable: false, speed: 2.8, tier: 3, crafts: ["extractor"], visual: "extractor",
  }),
  pump: b("pump", "Bomba", "Agua, salmuera o petróleo.", {
    color: "#22d3ee", icon: "💧", power: 8, category: "minería", tab: "mineria",
    cost: { "plate-fe": 6, "pipe-basic": 4 }, research: "fluids", rotatable: false,
    crafts: ["pump"], waterOk: true,
  }),
  pump2: b("pump2", "Bomba II", "Bombea más líquido.", {
    color: "#67e8f9", icon: "💧", power: 12, category: "minería", tab: "mineria",
    cost: { "steel": 6, "pipe-basic": 8, "motor-basic": 1 }, research: "industry-2",
    rotatable: false, speed: 1.8, tier: 2, crafts: ["pump"], visual: "pump", waterOk: true,
  }),

  belt: b("belt", "Cinta", "Mueve ítems. Arrastra para trazar. R rota.", {
    color: "#fbbf24", icon: "➡️", power: 0, category: "logística", tab: "cintas",
    cost: { "plate-fe": 1, "gear-basic": 1 }, isBelt: true, beltSpeed: 0.14, crafts: ["belt"],
  }),
  belt2: b("belt2", "Cinta II", "Más rápida.", {
    color: "#f59e0b", icon: "➡️", power: 0, category: "logística", tab: "cintas",
    cost: { "steel": 1, "gear-basic": 1 }, research: "industry-2", isBelt: true,
    beltSpeed: 0.22, speed: 1.6, tier: 2, crafts: ["belt"], visual: "belt",
  }),
  belt3: b("belt3", "Cinta III", "La más rápida.", {
    color: "#ea580c", icon: "➡️", power: 0, category: "logística", tab: "cintas",
    cost: { "steel": 2, "motor-basic": 1 }, research: "industry-3", isBelt: true,
    beltSpeed: 0.32, speed: 2.2, tier: 3, crafts: ["belt"], visual: "belt",
  }),
  splitter: b("splitter", "Divisor", "Parte el flujo al frente y a los lados.", {
    color: "#f59e0b", icon: "🔀", power: 0, category: "logística", tab: "cintas",
    cost: { "plate-fe": 4, "gear-basic": 2 }, research: "logistics-2", isBelt: true, crafts: ["splitter"],
  }),
  filter: b("filter", "Filtro", "Solo deja pasar el ítem que elijas.", {
    color: "#fb7185", icon: "🧲", power: 0, category: "logística", tab: "cintas",
    cost: { "plate-fe": 3, "gear-basic": 2, "glass-silica": 1 }, research: "logistics-2",
    isBelt: true, crafts: ["filter"],
  }),
  underground: b("underground", "Subterránea", "Salta hasta 6 casillas.", {
    color: "#d97706", icon: "🚇", power: 0, category: "logística", tab: "cintas",
    cost: { "plate-fe": 4, "gear-basic": 2 }, research: "logistics-2", isBelt: true, crafts: ["underground"],
  }),
  chest: b("chest", "Almacén", "Guarda ítems. Las cintas entran y salen.", {
    color: "#94a3b8", icon: "📦", power: 0, category: "logística", tab: "cintas",
    cost: { "plate-fe": 8 }, storage: true, capacity: 200, crafts: ["chest"],
  }),
  warehouse: b("warehouse", "Nave", "Almacén grande.", {
    color: "#cbd5e1", icon: "🏭", power: 2, category: "logística", tab: "cintas",
    cost: { "steel": 16, "concrete": 8 }, research: "construction", storage: true,
    capacity: 600, crafts: ["chest"], visual: "chest",
  }),
  port: b("port", "Puerto", "Aduana: las cintas que llegan despachan pedidos.", {
    color: "#38bdf8", icon: "🚢", power: 6, category: "logística", tab: "cintas",
    cost: { "plate-fe": 20, "gear-basic": 6, "glass-silica": 8 }, research: "commerce",
    storage: true, capacity: 400, crafts: ["port"],
  }),

  furnace: b("furnace", "Horno", "Funde minerales y cuece lo simple.", {
    color: "#fb7185", icon: "🔥", power: 14, category: "proceso", tab: "hornos",
    cost: { "plate-fe": 10, "el-c": 8 }, crafts: ["furnace"],
  }),
  furnace2: b("furnace2", "Horno II", "Funde casi el doble de rápido.", {
    color: "#f43f5e", icon: "🔥", power: 22, category: "proceso", tab: "hornos",
    cost: { "steel": 12, "brick-fire": 8 }, research: "industry-2",
    speed: 1.8, tier: 2, crafts: ["furnace"], visual: "furnace",
  }),
  furnace3: b("furnace3", "Horno eléctrico", "El más rápido. Limpio.", {
    color: "#fda4af", icon: "🔥", power: 36, category: "proceso", tab: "hornos",
    cost: { "steel": 20, "circuit-basic": 4, "wire-cu": 12 }, research: "industry-3",
    speed: 2.8, tier: 3, crafts: ["furnace"], visual: "furnace",
  }),
  blast: b("blast", "Alto horno", "Aceros y aleaciones.", {
    color: "#f97316", icon: "🌋", power: 28, category: "proceso", tab: "hornos",
    cost: { "plate-fe": 20, "brick-fire": 12, "pipe-basic": 6 }, research: "steel", crafts: ["blast"],
  }),
  foundry: b("foundry", "Fundición", "Alto horno más ágil para aceros.", {
    color: "#fb923c", icon: "🌋", power: 36, category: "proceso", tab: "hornos",
    cost: { "steel": 18, "brick-fire": 16 }, research: "construction",
    speed: 1.6, crafts: ["blast"], visual: "blast",
  }),
  kiln: b("kiln", "Horno de cerámica", "Vidrio, ladrillo y azulejo más rápido.", {
    color: "#e879f9", icon: "🏺", power: 16, category: "proceso", tab: "hornos",
    cost: { "brick-fire": 8, "plate-fe": 8 }, research: "ceramics",
    speed: 1.7, crafts: ["furnace"], focus: ["start", "ceramics", "urban", "construction"], visual: "furnace",
  }),
  oven: b("oven", "Horno de pan", "Comida al horno.", {
    color: "#fbbf24", icon: "🍞", power: 12, category: "proceso", tab: "hornos",
    cost: { "glass-silica": 8, "plate-fe": 6 }, research: "food",
    speed: 1.8, crafts: ["furnace"], focus: ["food"], visual: "furnace",
  }),

  reactor: b("reactor", "Reactor químico", "Ácidos, sales y orgánicos.", {
    color: "#a78bfa", icon: "🧪", power: 22, category: "proceso", tab: "quimica",
    cost: { "plate-fe": 12, "glass-silica": 8, "pipe-basic": 8 }, research: "chemistry", crafts: ["reactor"],
  }),
  reactor2: b("reactor2", "Reactor II", "Química más rápida.", {
    color: "#8b5cf6", icon: "🧪", power: 32, category: "proceso", tab: "quimica",
    cost: { "stainless": 12, "glass-silica": 12, "pipe-basic": 12 }, research: "industry-2",
    speed: 1.8, tier: 2, crafts: ["reactor"], visual: "reactor",
  }),
  electrolyzer: b("electrolyzer", "Electrolizador", "Separa agua y sales con luz.", {
    color: "#60a5fa", icon: "⚡", power: 32, category: "proceso", tab: "quimica",
    cost: { "plate-cu": 10, "wire-cu": 16, "glass-silica": 6 }, research: "electrolysis", crafts: ["electrolyzer"],
  }),
  refinery: b("refinery", "Refinería", "Petróleo, plásticos y craqueo.", {
    color: "#818cf8", icon: "🛢️", power: 28, category: "proceso", tab: "quimica",
    cost: { "steel": 16, "pipe-basic": 12, "glass-silica": 8 }, research: "organics",
    speed: 1.7, crafts: ["reactor"], focus: ["organics", "polymers"],
  }),
  greenhouse: b("greenhouse", "Invernadero", "Fertilizantes y agroquímica.", {
    color: "#4ade80", icon: "🌿", power: 10, category: "proceso", tab: "quimica",
    cost: { "glass-silica": 16, "pipe-basic": 6 }, research: "agri",
    speed: 1.7, crafts: ["reactor"], focus: ["agri"],
  }),
  pharma: b("pharma", "Planta farma", "Medicinas y sueros.", {
    color: "#22d3ee", icon: "💊", power: 20, category: "proceso", tab: "quimica",
    cost: { "glass-silica": 14, "stainless": 8 }, research: "pharma",
    speed: 1.7, crafts: ["reactor", "assembler"], focus: ["pharma", "medical"],
  }),
  distillery: b("distillery", "Destilería", "Cerveza, sidra y mostos.", {
    color: "#f59e0b", icon: "🍺", power: 14, category: "proceso", tab: "quimica",
    cost: { "glass-silica": 10, "plate-cu": 4, "pipe-basic": 6 }, research: "brewing",
    speed: 1.8, crafts: ["reactor", "assembler"], focus: ["brewing", "food"],
  }),
  centrifuge: b("centrifuge", "Centrifugadora", "Ciclo nuclear.", {
    color: "#4ade80", icon: "☢️", power: 40, category: "proceso", tab: "quimica",
    cost: { "stainless": 20, "circuit-advanced": 4 }, research: "nuclear",
    speed: 1.6, crafts: ["assembler"], focus: ["nuclear", "reprocessing"],
  }),

  assembler: b("assembler", "Ensambladora", "Piezas, circuitos y máquinas.", {
    color: "#34d399", icon: "🛠️", power: 16, category: "proceso", tab: "talleres",
    cost: { "plate-fe": 14, "gear-basic": 6, "wire-cu": 10 }, research: "logistics", crafts: ["assembler"],
  }),
  assembler2: b("assembler2", "Ensambladora II", "Monta casi el doble.", {
    color: "#10b981", icon: "🛠️", power: 24, category: "proceso", tab: "talleres",
    cost: { "steel": 16, "gear-basic": 10, "circuit-basic": 2 }, research: "industry-2",
    speed: 1.8, tier: 2, crafts: ["assembler"], visual: "assembler",
  }),
  assembler3: b("assembler3", "Ensambladora III", "Línea automática.", {
    color: "#6ee7b7", icon: "🛠️", power: 34, category: "proceso", tab: "talleres",
    cost: { "steel": 24, "motor-basic": 4, "circuit-advanced": 2 }, research: "industry-3",
    speed: 2.8, tier: 3, crafts: ["assembler"], visual: "assembler",
  }),
  press: b("press", "Prensa", "Placas, engranajes y tornillos.", {
    color: "#2dd4bf", icon: "🗜️", power: 14, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "gear-basic": 4 }, research: "logistics",
    speed: 1.6, crafts: ["assembler"], focus: ["start", "logistics", "fluids"],
  }),
  foodPlant: b("foodPlant", "Planta alimentaria", "Latas, aceite, envases.", {
    color: "#facc15", icon: "🥫", power: 14, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "can-al": 8 }, research: "food",
    speed: 1.8, crafts: ["assembler"], focus: ["food"],
  }),
  textileMill: b("textileMill", "Telares", "Fibras, tintes y tejidos.", {
    color: "#a78bfa", icon: "🧵", power: 14, category: "proceso", tab: "talleres",
    cost: { "steel": 8, "nylon": 4 }, research: "textiles",
    speed: 1.8, crafts: ["assembler", "reactor"], focus: ["textiles", "pigments"],
  }),
  concretePlant: b("concretePlant", "Planta de hormigón", "Cemento, vigas, raíles.", {
    color: "#94a3b8", icon: "🧱", power: 18, category: "proceso", tab: "talleres",
    cost: { "steel": 14, "pipe-basic": 8 }, research: "construction",
    speed: 1.7, crafts: ["assembler", "furnace"], focus: ["construction", "urban"],
  }),
  recycler: b("recycler", "Recicladora", "Chatarra y plásticos de nuevo.", {
    color: "#34d399", icon: "♻️", power: 16, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "gear-basic": 6 }, research: "recycling",
    speed: 1.8, crafts: ["assembler", "reactor", "furnace"], focus: ["recycling"],
  }),
  chipFab: b("chipFab", "Sala blanca", "Chips, obleas y circuitos.", {
    color: "#38bdf8", icon: "💠", power: 28, category: "proceso", tab: "talleres",
    cost: { "steel": 16, "glass-silica": 12, "circuit-basic": 4 }, research: "semicon",
    speed: 1.8, crafts: ["assembler"], focus: ["electronics", "semicon", "solar", "telecom"],
  }),
  welder: b("welder", "Soldadora", "Coches, trenes y chasis.", {
    color: "#fb7185", icon: "🔧", power: 20, category: "proceso", tab: "talleres",
    cost: { "steel": 14, "motor-basic": 2 }, research: "mobility",
    speed: 1.7, crafts: ["assembler"], focus: ["mobility"],
  }),
  shipyard: b("shipyard", "Astillero", "Plancha naval y cascos.", {
    color: "#0ea5e9", icon: "🚢", power: 22, category: "proceso", tab: "talleres",
    cost: { "steel": 20, "beam": 6 }, research: "shipyard",
    speed: 1.6, crafts: ["assembler", "blast"], focus: ["shipyard", "mobility"],
  }),
  printer: b("printer", "Taller de precisión", "Relojes, lentes, robots.", {
    color: "#e879f9", icon: "🖨️", power: 18, category: "proceso", tab: "talleres",
    cost: { "stainless": 10, "circuit-basic": 4 }, research: "precision",
    speed: 1.7, crafts: ["assembler"], focus: ["precision", "optics", "robotics"],
  }),

  coalGen: b("coalGen", "Generador", "Quema carbono. Ensucia.", {
    color: "#64748b", icon: "⬛", power: -50, category: "energía", tab: "energia",
    cost: { "plate-fe": 16, "el-c": 10 }, rotatable: false, generator: true, fuel: "el-c", crafts: ["coalGen"],
  }),
  solar: b("solar", "Panel solar", "Energía limpia y constante.", {
    color: "#38bdf8", icon: "☀️", power: -18, category: "energía", tab: "energia",
    cost: { "glass-silica": 12, "wire-cu": 8, "ore-si": 4 }, research: "solar",
    rotatable: false, generator: true, crafts: ["solar"],
  }),
  wind: b("wind", "Aerogenerador", "Viento limpio, un poco más de luz.", {
    color: "#67e8f9", icon: "🌬️", power: -28, category: "energía", tab: "energia",
    cost: { "steel": 16, "wind-blade": 1, "magnet-nd": 1 }, research: "composites",
    rotatable: false, generator: true, crafts: ["wind"],
  }),
  nuclear: b("nuclear", "Reactor nuclear", "Mucha energía con uranio.", {
    color: "#4ade80", icon: "☢️", power: -240, category: "energía", tab: "energia",
    cost: { "plate-pb": 24, "plate-fe": 40, "circuit-advanced": 12 }, research: "nuclear",
    rotatable: false, generator: true, fuel: "fuel-u", crafts: ["nuclear"],
  }),

  lab: b("lab", "Laboratorio", "Come ciencia para investigar.", {
    color: "#f472b6", icon: "🔬", power: 18, category: "ciencia", tab: "ciencia",
    cost: { "plate-fe": 12, "glass-silica": 8, "wire-cu": 8 }, rotatable: false, crafts: ["lab"],
  }),
  lab2: b("lab2", "Laboratorio II", "Investiga más rápido.", {
    color: "#ec4899", icon: "🔬", power: 26, category: "ciencia", tab: "ciencia",
    cost: { "steel": 12, "glass-silica": 12, "circuit-basic": 4 }, research: "industry-2",
    rotatable: false, speed: 1.8, tier: 2, crafts: ["lab"], visual: "lab",
  }),
  lab3: b("lab3", "Laboratorio III", "Campus de investigación.", {
    color: "#f9a8d4", icon: "🔬", power: 36, category: "ciencia", tab: "ciencia",
    cost: { "steel": 20, "circuit-advanced": 4, "glass-silica": 16 }, research: "industry-3",
    rotatable: false, speed: 2.8, tier: 3, crafts: ["lab"], visual: "lab",
  }),

  pump3: b("pump3", "Bomba III", "Caudal máximo.", {
    color: "#a5f3fc", icon: "💧", power: 18, category: "minería", tab: "mineria",
    cost: { "steel": 10, "motor-basic": 2, "pipe-basic": 12 }, research: "industry-3",
    rotatable: false, speed: 2.8, tier: 3, crafts: ["pump"], visual: "pump", waterOk: true,
  }),
  quarry: b("quarry", "Cantera", "Saca minerales más rápido en tierra.", {
    color: "#94a3b8", icon: "🪨", power: 14, category: "minería", tab: "mineria",
    cost: { "steel": 10, "gear-basic": 4 }, research: "construction",
    rotatable: false, speed: 1.6, crafts: ["extractor"], visual: "extractor",
  }),
  smelter: b("smelter", "Fundidora", "Horno especializado en lingotes.", {
    color: "#f97316", icon: "🔥", power: 20, category: "proceso", tab: "hornos",
    cost: { "plate-fe": 14, "el-c": 10 }, research: "metallurgy",
    speed: 1.5, crafts: ["furnace"], focus: ["start", "metallurgy", "steel"], visual: "furnace",
  }),
  steelMill: b("steelMill", "Acería", "Aceros y aleaciones a gran ritmo.", {
    color: "#ea580c", icon: "🌋", power: 40, category: "proceso", tab: "hornos",
    cost: { "steel": 24, "brick-fire": 16, "pipe-basic": 8 }, research: "construction",
    speed: 1.9, crafts: ["blast"], visual: "blast",
  }),
  glassWorks: b("glassWorks", "Vidriera", "Vidrio, ventanas y lentes.", {
    color: "#67e8f9", icon: "🪟", power: 18, category: "proceso", tab: "hornos",
    cost: { "glass-silica": 16, "brick-fire": 8 }, research: "ceramics",
    speed: 1.7, crafts: ["furnace"], focus: ["start", "ceramics", "urban", "optics"], visual: "furnace",
  }),
  bakery: b("bakery", "Panadería", "Pan y horneados.", {
    color: "#f59e0b", icon: "🥖", power: 10, category: "proceso", tab: "hornos",
    cost: { "brick": 8, "plate-fe": 6 }, research: "food",
    speed: 1.9, crafts: ["furnace"], focus: ["food"], visual: "furnace",
  }),
  paperMill: b("paperMill", "Papelera", "Papel, cartón y prensa.", {
    color: "#e2e8f0", icon: "📄", power: 16, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "pipe-basic": 6 }, research: "forestry",
    speed: 1.8, crafts: ["assembler"], focus: ["forestry"],
  }),
  packingLine: b("packingLine", "Línea de envasado", "Latas, cajas y palés.", {
    color: "#fbbf24", icon: "📦", power: 14, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "can-al": 8 }, research: "food",
    speed: 1.8, crafts: ["assembler"], focus: ["food", "commerce"],
  }),
  paintShop: b("paintShop", "Pinturas", "Pigmentos y esmaltes.", {
    color: "#818cf8", icon: "🎨", power: 12, category: "proceso", tab: "talleres",
    cost: { "steel": 8, "glass-silica": 6 }, research: "pigments",
    speed: 1.7, crafts: ["assembler", "reactor"], focus: ["pigments"],
  }),
  batteryWorks: b("batteryWorks", "Fábrica de baterías", "Celdas y acumuladores.", {
    color: "#34d399", icon: "🔋", power: 22, category: "proceso", tab: "talleres",
    cost: { "steel": 14, "circuit-basic": 4 }, research: "batteries",
    speed: 1.8, crafts: ["assembler"], focus: ["batteries", "energy-grid"],
  }),
  autoWorks: b("autoWorks", "Planta de autos", "Coches, buses y camiones.", {
    color: "#fb7185", icon: "🚗", power: 24, category: "proceso", tab: "talleres",
    cost: { "steel": 20, "motor-basic": 3 }, research: "mobility",
    speed: 1.8, crafts: ["assembler"], focus: ["mobility"],
  }),
  hangar: b("hangar", "Hangar", "Aviones y satélites.", {
    color: "#38bdf8", icon: "✈️", power: 26, category: "proceso", tab: "talleres",
    cost: { "duralumin": 12, "beam": 6 }, research: "aviation",
    speed: 1.6, crafts: ["assembler"], focus: ["aviation"],
  }),
  clinic: b("clinic", "Planta sanitaria", "Kits, sueros y equipos.", {
    color: "#22d3ee", icon: "🏥", power: 16, category: "proceso", tab: "quimica",
    cost: { "glass-silica": 12, "stainless": 8 }, research: "medical",
    speed: 1.7, crafts: ["assembler", "reactor"], focus: ["medical", "pharma"],
  }),
  waterPlant: b("waterPlant", "Potabilizadora", "Agua, sales e hidrógeno.", {
    color: "#38bdf8", icon: "🚰", power: 20, category: "proceso", tab: "quimica",
    cost: { "pipe-basic": 12, "glass-silica": 8 }, research: "fluids",
    speed: 1.6, crafts: ["electrolyzer", "reactor", "pump"], focus: ["fluids", "electrolysis", "hydrogen"],
  }),
  gasPlant: b("gasPlant", "Planta de gases", "Nobles y atmósferas.", {
    color: "#a78bfa", icon: "🫧", power: 18, category: "proceso", tab: "quimica",
    cost: { "steel": 10, "pipe-basic": 8 }, research: "noble-gases",
    speed: 1.6, crafts: ["reactor"], focus: ["noble-gases"],
  }),
  commsHub: b("commsHub", "Central telecom", "Radio, fibra y 5G.", {
    color: "#60a5fa", icon: "📡", power: 16, category: "proceso", tab: "talleres",
    cost: { "steel": 10, "circuit-basic": 4 }, research: "telecom",
    speed: 1.7, crafts: ["assembler"], focus: ["telecom"],
  }),
  printShop: b("printShop", "Imprenta", "Libros, prensa y tinta.", {
    color: "#cbd5e1", icon: "📰", power: 12, category: "proceso", tab: "talleres",
    cost: { "steel": 8, "paper": 8 }, research: "forestry",
    speed: 1.7, crafts: ["assembler"], focus: ["forestry"],
  }),
  hydro: b("hydro", "Hidroeléctrica", "Energía limpia constante.", {
    color: "#22d3ee", icon: "🌊", power: -90, category: "energía", tab: "energia",
    cost: { "steel": 24, "concrete": 16, "pipe-basic": 8 }, research: "energy-grid",
    rotatable: false, generator: true, crafts: ["hydro"], visual: "solar",
  }),
  geothermal: b("geothermal", "Geotérmica", "Calor de la Tierra.", {
    color: "#f97316", icon: "🌋", power: -70, category: "energía", tab: "energia",
    cost: { "steel": 20, "pipe-basic": 12, "brick-fire": 8 }, research: "energy-grid",
    rotatable: false, generator: true, crafts: ["geothermal"], visual: "nuclear",
  }),
};

export const BUILDING_LIST = Object.values(BUILDINGS);

export const BUILDING_TABS = [
  { id: "mineria", name: "Minería" },
  { id: "cintas", name: "Cintas" },
  { id: "hornos", name: "Hornos" },
  { id: "quimica", name: "Química" },
  { id: "talleres", name: "Talleres" },
  { id: "energia", name: "Energía" },
  { id: "ciencia", name: "Ciencia" },
];

export const BUILDING_CATEGORIES = ["minería", "proceso", "logística", "energía", "ciencia"];

export function craftsOf(type) {
  const def = BUILDINGS[type];
  return def?.crafts || [type];
}

export function canCraftRecipe(type, recipe) {
  if (!recipe || !BUILDINGS[type]) return false;
  if (!craftsOf(type).includes(recipe.building)) return false;
  const focus = BUILDINGS[type].focus;
  if (!focus?.length) return true;
  return focus.includes(recipe.research) || focus.includes(recipe.output?.id);
}

export function buildingSpeed(type) {
  return BUILDINGS[type]?.speed || 1;
}

export function isConveyorType(type) {
  return Boolean(BUILDINGS[type]?.isBelt);
}

export function isConveyor(b) {
  return Boolean(b && BUILDINGS[b.type]?.isBelt);
}

export function isStorage(b) {
  return Boolean(b && BUILDINGS[b.type]?.storage);
}

export function isExtractorKind(type) {
  return craftsOf(type).includes("extractor");
}

export function isPumpKind(type) {
  return craftsOf(type).includes("pump");
}

export function isLabKind(type) {
  return craftsOf(type).includes("lab");
}
