export const ERAS = [
  { id: "era-start", name: "Arranque", color: "#38bdf8" },
  { id: "era-metal", name: "Metalurgia", color: "#fbbf24" },
  { id: "era-chem", name: "Química", color: "#a78bfa" },
  { id: "era-org", name: "Orgánica", color: "#34d399" },
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
  R("start", "Kit de colonización", "era-start", {}, [], "Ya investigado: minería, hornos, cintas y laboratorio.", [
    "Extractores, hornos, cintas, almacenes, generador de carbón y laboratorio",
  ]),
  R(
    "logistics",
    "Logística básica",
    "era-start",
    { "sci-mining": 12 },
    ["start"],
    "Ensambladoras y piezas mecánicas para dejar de craftear a mano.",
    ["Ensambladora", "Motores y engranajes en serie"]
  ),
  R(
    "fluids",
    "Fluidos",
    "era-start",
    { "sci-mining": 16 },
    ["start"],
    "Bombas y tuberías simples. El agua es el primer reactivo universal.",
    ["Bomba", "Agua, salmuera y petróleo"]
  ),
  R(
    "metallurgy",
    "Metalurgia",
    "era-metal",
    { "sci-mining": 20 },
    ["logistics"],
    "Procesado de metales poco comunes: titanio, níquel, cinc, estaño…",
    ["Metales uncommon", "Placas y cables extra"]
  ),
  R(
    "steel",
    "Aceros",
    "era-metal",
    { "sci-mining": 18, "sci-metal": 8 },
    ["metallurgy"],
    "Alto horno y aleaciones estructurales.",
    ["Alto horno", "Acero, inoxidable, bronce, latón"]
  ),
  R(
    "advanced-metals",
    "Metales avanzados",
    "era-metal",
    { "sci-metal": 24 },
    ["steel"],
    "Tungsteno, platino, oro y el resto de metales raros.",
    ["Metales rare", "Catalizadores metálicos"]
  ),
  R(
    "chemistry",
    "Química inorgánica",
    "era-chem",
    { "sci-mining": 14, "sci-metal": 10 },
    ["fluids", "metallurgy"],
    "Óxidos, cloruros, ácidos y el reactor químico.",
    ["Reactor químico", "Ácidos y sales comunes"]
  ),
  R(
    "electrolysis",
    "Electrólisis",
    "era-chem",
    { "sci-chem": 12 },
    ["chemistry"],
    "Parte el agua y las sales. Hidrógeno y oxígeno a escala.",
    ["Electrolizador", "H₂, O₂, cloro, metales desde sales"]
  ),
  R(
    "advanced-chemistry",
    "Química avanzada",
    "era-chem",
    { "sci-chem": 28 },
    ["electrolysis"],
    "Halógenos pesados, fluoruros y sales especializadas.",
    ["Bromo, yodo, fluoruros", "Compuestos de alta reactividad"]
  ),
  R(
    "noble-gases",
    "Gases nobles",
    "era-chem",
    { "sci-chem": 20 },
    ["electrolysis"],
    "Neón, argón, kriptón y xenón para lámparas y atmósferas inertes.",
    ["Gases nobles", "Soldadura inerte"]
  ),
  R(
    "organics",
    "Química orgánica",
    "era-org",
    { "sci-chem": 16 },
    ["chemistry", "fluids"],
    "Hidrocarburos, alcoholes y la puerta a los polímeros.",
    ["Metano a dodecano", "Alcoholes y cetonas"]
  ),
  R(
    "polymers",
    "Polímeros",
    "era-org",
    { "sci-chem": 18, "sci-elec": 6 },
    ["organics"],
    "Plásticos, gomas y fibras a partir de monómeros.",
    ["Polietileno, PVC, nylon, caucho"]
  ),
  R(
    "solar",
    "Fotovoltaica",
    "era-elec",
    { "sci-metal": 16, "sci-elec": 8 },
    ["electrolysis"],
    "Silicio de grado solar y paneles.",
    ["Panel solar", "Plaquetas de silicio"]
  ),
  R(
    "electronics",
    "Electrónica",
    "era-elec",
    { "sci-elec": 20 },
    ["solar", "logistics"],
    "Circuitos, soldadura y sensores.",
    ["Circuitos básicos y avanzados"]
  ),
  R(
    "batteries",
    "Almacenamiento",
    "era-elec",
    { "sci-elec": 16, "sci-chem": 12 },
    ["electronics", "advanced-chemistry"],
    "Celdas de Li-ion, NiMH y más.",
    ["Baterías y celdas"]
  ),
  R(
    "rare-earths",
    "Tierras raras",
    "era-adv",
    { "sci-elec": 24, "sci-atom": 8 },
    ["advanced-metals", "electronics"],
    "Toda la serie de lantánidos: imanes, fósforos y láseres.",
    ["Lantánidos La–Lu", "Imanes de neodimio"]
  ),
  R(
    "catalysis",
    "Catálisis",
    "era-adv",
    { "sci-chem": 22, "sci-atom": 10 },
    ["advanced-metals", "organics"],
    "Acelera recetas con platino, paladio y zeolitas.",
    ["Catalizadores", "Rutas químicas más cortas"]
  ),
  R(
    "superconductors",
    "Superconductores",
    "era-adv",
    { "sci-atom": 20, "sci-elec": 16 },
    ["rare-earths", "electronics"],
    "Materiales de resistencia cero.",
    ["Cables superconductores", "Imanes de fusión"]
  ),
  R(
    "nuclear",
    "Era nuclear",
    "era-nuke",
    { "sci-atom": 28 },
    ["advanced-metals", "electrolysis"],
    "Uranio, torio, actínidos y el reactor.",
    ["Reactor nuclear", "Actínidos y combustibles"]
  ),
  R(
    "reprocessing",
    "Reprocesado",
    "era-nuke",
    { "sci-atom": 24 },
    ["nuclear"],
    "Ciclo de combustible y transmutación.",
    ["Plutonio", "Combustible reciclado"]
  ),
  R(
    "fusion",
    "Fusión",
    "era-nuke",
    { "sci-atom": 36, "sci-frontier": 8 },
    ["superconductors", "nuclear"],
    "Fusión civil en la Tierra: hidrógeno pesado en un tokamak. Sin lunas ni Helio-3 espacial.",
    ["Reactor de fusión terrestre", "Plasma de hidrógeno"]
  ),
  R(
    "frontier",
    "Elementos sintéticos",
    "era-end",
    { "sci-frontier": 20 },
    ["reprocessing"],
    "Los superpesados (Z>103) solo existen si los fabricas.",
    ["Rutherfordio a oganesón"]
  ),
  R(
    "periodica-core",
    "Núcleo de Periodica",
    "era-end",
    { "sci-frontier": 40 },
    ["fusion", "frontier"],
    "Victoria: ensambla un núcleo que usa casi toda la tabla.",
    ["Ítem de victoria", "Cinemática de cierre"]
  ),
];

export const RESEARCH_BY_ID = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));

export function isResearched(state, id) {
  if (id === "start") return true;
  return Boolean(state.researched[id]);
}

export function canResearch(state, node) {
  if (isResearched(state, node.id) || state.researching) return false;
  return node.requires.every((id) => isResearched(state, id));
}
