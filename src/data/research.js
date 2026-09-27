export const ERAS = [
  { id: "era-start", name: "Arranque", color: "#38bdf8" },
  { id: "era-metal", name: "Metalurgia", color: "#fbbf24" },
  { id: "era-chem", name: "Química", color: "#a78bfa" },
  { id: "era-org", name: "Orgánica", color: "#34d399" },
  { id: "era-civic", name: "País", color: "#fb7185" },
  { id: "era-elec", name: "Electrónica", color: "#60a5fa" },
  { id: "era-adv", name: "Materiales", color: "#f472b6" },
  { id: "era-nuke", name: "Nuclear", color: "#4ade80" },
  { id: "era-end", name: "Frontera", color: "#e879f9" },
];

const R = (id, name, era, cost, requires, desc, unlocks) => ({
  id,
  name,
  era,
  cost,
  requires,
  desc,
  unlocks,
});

export const RESEARCH = [
  R("start", "Kit de colonización", "era-start", {}, [], "Minería, hornos, cintas y laboratorio.", [
    "Extractor, horno, cinta, almacén, generador, laboratorio",
  ]),
  R("logistics", "Logística básica", "era-start", { "sci-mining": 12 }, ["start"], "Ensambladoras y piezas.", [
    "Ensambladora",
  ]),
  R("logistics-2", "Logística avanzada", "era-start", { "sci-mining": 20 }, ["logistics"], "Divisores, filtros y cintas subterráneas.", [
    "Divisor, filtro, subterránea",
  ]),
  R("industry-2", "Fábricas II", "era-start", { "sci-mining": 24, "sci-metal": 8 }, ["logistics", "steel"], "Extractores, hornos y ensambladoras de nivel 2.", [
    "Máquinas II",
  ]),
  R("industry-3", "Fábricas III", "era-elec", { "sci-elec": 20, "sci-metal": 16 }, ["industry-2", "electronics"], "Líneas automáticas de nivel 3.", [
    "Máquinas III",
  ]),
  R("fluids", "Fluidos", "era-start", { "sci-mining": 16 }, ["start"], "Bombas y agua.", ["Bomba"]),
  R("metallurgy", "Metalurgia", "era-metal", { "sci-mining": 20 }, ["logistics"], "Metales poco comunes.", ["Ti, Ni, Zn, Sn"]),
  R("steel", "Aceros", "era-metal", { "sci-mining": 18, "sci-metal": 8 }, ["metallurgy"], "Alto horno y aleaciones.", [
    "Acero, inoxidable, bronce, latón",
  ]),
  R("construction", "Construcción", "era-metal", { "sci-metal": 16 }, ["steel"], "Cemento, hormigón, raíles y vigas.", [
    "Obra civil",
  ]),
  R("advanced-metals", "Metales avanzados", "era-metal", { "sci-metal": 24 }, ["steel"], "W, Pt, Au y raros.", [
    "Catalizadores metálicos",
  ]),
  R("chemistry", "Química inorgánica", "era-chem", { "sci-mining": 14, "sci-metal": 10 }, ["fluids", "metallurgy"], "Ácidos y reactor.", [
    "Reactor",
  ]),
  R("electrolysis", "Electrólisis", "era-chem", { "sci-chem": 12 }, ["chemistry"], "Agua y sales.", ["Electrolizador"]),
  R("advanced-chemistry", "Química avanzada", "era-chem", { "sci-chem": 28 }, ["electrolysis"], "Halógenos pesados.", [
    "Fluoruros",
  ]),
  R("noble-gases", "Gases nobles", "era-chem", { "sci-chem": 20 }, ["electrolysis"], "Neón a xenón.", ["Atmósferas inertes"]),
  R("agri", "Agroquímica", "era-chem", { "sci-chem": 18 }, ["chemistry"], "Haber-Bosch, fertilizantes NPK.", [
    "Urea, NPK, pesticidas",
  ]),
  R("organics", "Química orgánica", "era-org", { "sci-chem": 16 }, ["chemistry", "fluids"], "Hidrocarburos y alcoholes.", [
    "Craqueo",
  ]),
  R("polymers", "Polímeros", "era-org", { "sci-chem": 18, "sci-elec": 6 }, ["organics"], "Plásticos y gomas.", [
    "PE, PVC, nylon",
  ]),
  R("textiles", "Textil", "era-org", { "sci-chem": 14 }, ["polymers"], "Fibras, tintes y tejidos.", ["Moda e industria"]),
  R("food", "Alimentación", "era-org", { "sci-chem": 12 }, ["organics", "agri"], "Conservas, aceite, envases.", [
    "Cadena alimentaria",
  ]),
  R("pharma", "Farmacia", "era-org", { "sci-chem": 22, "sci-health": 8 }, ["organics", "advanced-chemistry"], "Principios activos.", [
    "Paracetamol, penicilina",
  ]),
  R("pigments", "Pigmentos", "era-org", { "sci-chem": 14 }, ["chemistry", "advanced-metals"], "Blancos, azules, tintas.", [
    "TiO₂, cobalto",
  ]),
  R("commerce", "Comercio exterior", "era-civic", { "sci-mining": 14, "sci-civic": 8 }, ["logistics-2"], "Puerto y aduana.", [
    "Puerto de exportación",
  ]),
  R("eu-green", "Pacto verde europeo", "era-civic", { "sci-civic": 16, "sci-chem": 8 }, ["commerce", "solar"], "Normas UE: el carbón penaliza, el sol suma.", [
    "Reputación europea",
  ]),
  R("ceramics", "Cerámica", "era-civic", { "sci-civic": 10, "sci-metal": 8 }, ["construction"], "Azulejos y loza.", ["Valencia y Sevilla"]),
  R("recycling", "Reciclaje", "era-civic", { "sci-civic": 14 }, ["eu-green"], "Chatarra y plásticos de nuevo a la cinta.", [
    "Economía circular",
  ]),
  R("forestry", "Papel y celulosa", "era-civic", { "sci-civic": 10 }, ["commerce"], "Pasta, cartón y prensa.", [
    "Papel",
  ]),
  R("brewing", "Bodega y cervecería", "era-civic", { "sci-civic": 8 }, ["food"], "Mostos, cerveza y sidra.", [
    "Bebidas",
  ]),
  R("urban", "Urbanismo", "era-civic", { "sci-civic": 12, "sci-metal": 6 }, ["construction", "commerce"], "Vivienda, ventanas y ladrillo.", [
    "Ciudad",
  ]),
  R("shipyard", "Astillero", "era-civic", { "sci-civic": 12, "sci-metal": 10 }, ["construction", "mobility"], "Buques y plancha naval.", [
    "Navantia",
  ]),
  R("solar", "Fotovoltaica", "era-elec", { "sci-metal": 16, "sci-elec": 8 }, ["electrolysis"], "Paneles.", ["Solar"]),
  R("electronics", "Electrónica", "era-elec", { "sci-elec": 20 }, ["solar", "logistics"], "Circuitos.", ["PCB"]),
  R("batteries", "Almacenamiento", "era-elec", { "sci-elec": 16, "sci-chem": 12 }, ["electronics", "advanced-chemistry"], "Celdas.", [
    "Li-ion",
  ]),
  R("telecom", "Telecom", "era-elec", { "sci-elec": 18 }, ["electronics"], "Radio, fibra, 5G.", ["Antenas"]),
  R("energy-grid", "Red eléctrica", "era-elec", { "sci-elec": 16, "sci-civic": 8 }, ["solar", "commerce"], "Inversores y estaciones.", [
    "Red",
  ]),
  R("hydrogen", "Valle del hidrógeno", "era-elec", { "sci-chem": 16, "sci-elec": 10 }, ["electrolysis", "energy-grid"], "H₂ y pilas.", [
    "Hidrógeno verde",
  ]),
  R("medical", "Tecnología médica", "era-elec", { "sci-health": 16, "sci-elec": 8 }, ["pharma", "electronics"], "Equipos de hospital.", [
    "Resonancia, implantes",
  ]),
  R("mobility", "Movilidad", "era-elec", { "sci-elec": 14, "sci-metal": 12 }, ["electronics", "polymers"], "Coche, tren, neumático.", [
    "SEAT y Renfe",
  ]),
  R("rare-earths", "Tierras raras", "era-adv", { "sci-elec": 24, "sci-atom": 8 }, ["advanced-metals", "electronics"], "Lantánidos.", [
    "Imanes",
  ]),
  R("catalysis", "Catálisis", "era-adv", { "sci-chem": 22, "sci-atom": 10 }, ["advanced-metals", "organics"], "Platino y zeolitas.", [
    "Rutas cortas",
  ]),
  R("semicon", "Semiconductores", "era-elec", { "sci-elec": 22 }, ["electronics"], "Fotolitografía y chips.", ["Chip"]),
  R("robotics", "Robótica", "era-elec", { "sci-elec": 20, "sci-metal": 8 }, ["electronics", "mobility"], "Brazos, drones y automatización.", [
    "Robot",
  ]),
  R("optics", "Óptica", "era-elec", { "sci-elec": 14 }, ["telecom", "solar"], "Lentes, láseres y vidrio fino.", ["Lente"]),
  R("composites", "Composites", "era-adv", { "sci-atom": 12, "sci-elec": 10 }, ["polymers", "advanced-metals"], "Carbono y kevlar.", [
    "Aero y eólica",
  ]),
  R("aviation", "Aviación", "era-adv", { "sci-atom": 10, "sci-metal": 16 }, ["composites", "advanced-metals"], "Fuselaje y turbinas en tierra.", [
    "Airbus ibérico",
  ]),
  R("precision", "Instrumental de precisión", "era-adv", { "sci-atom": 8, "sci-health": 6 }, ["medical", "electronics"], "Metrología y relojería.", [
    "Suiza",
  ]),
  R("superconductors", "Superconductores", "era-adv", { "sci-atom": 20, "sci-elec": 16 }, ["rare-earths", "electronics"], "Resistencia cero.", [
    "Cables",
  ]),
  R("nuclear", "Era nuclear", "era-nuke", { "sci-atom": 28 }, ["advanced-metals", "electrolysis"], "Uranio civil.", [
    "Reactor",
  ]),
  R("reprocessing", "Reprocesado", "era-nuke", { "sci-atom": 24 }, ["nuclear"], "Ciclo de combustible.", ["Pu"]),
  R("fusion", "Fusión", "era-nuke", { "sci-atom": 36, "sci-frontier": 8 }, ["superconductors", "nuclear"], "Tokamak en la Tierra.", [
    "ITER ibérico",
  ]),
  R("frontier", "Elementos sintéticos", "era-end", { "sci-frontier": 20 }, ["reprocessing"], "Z>103 en laboratorio.", [
    "Superpesados",
  ]),
  R("periodica-core", "Núcleo de Periodica", "era-end", { "sci-frontier": 40 }, ["fusion", "frontier"], "Victoria industrial.", [
    "Cierre",
  ]),
];

export const RESEARCH_BY_ID = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));

export function isResearched(state, id) {
  if (id === "start") return true;
  if (state?.mode === "sandbox") return true;
  return Boolean(state?.researched?.[id]);
}

export function unlockAllResearch(state) {
  state.researched = Object.fromEntries(RESEARCH.map((r) => [r.id, true]));
  state.researching = null;
}

export function canResearch(state, node) {
  if (isResearched(state, node.id) || state.researching) return false;
  return node.requires.every((id) => isResearched(state, id));
}
