import { ELEMENTS, elementItemId, researchForElement } from "./elements.js";

const items = [];
const recipes = [];
const byId = new Map();

function addItem(item) {
  if (byId.has(item.id)) return byId.get(item.id);
  const full = {
    stack: 200,
    elements: [],
    tags: [],
    ...item,
  };
  items.push(full);
  byId.set(full.id, full);
  return full;
}

function addRecipe(recipe) {
  recipes.push({
    time: 4,
    building: "reactor",
    research: "chemistry",
    ...recipe,
  });
}

function el(symbol) {
  return elementItemId(symbol);
}

function metalElements() {
  return ELEMENTS.filter((e) => e.metal && e.z <= 103);
}

function formableMetals() {
  return ELEMENTS.filter((e) => e.metal && e.abundance !== "ultra" && e.z < 104);
}

const ORE_NAMES = {
  Li: "Espodumena",
  Be: "Berilo",
  B: "Bórax",
  C: "Carbón / grafito",
  F: "Fluorita",
  Na: "Sal gema",
  Mg: "Magnesita",
  Al: "Bauxita",
  Si: "Cuarzo",
  P: "Apatito",
  S: "Pirita azufrosa",
  K: "Silvita",
  Ca: "Caliza",
  Ti: "Ilmenita",
  V: "Vanadinita",
  Cr: "Cromita",
  Mn: "Pirolusita",
  Fe: "Hematites",
  Co: "Cobalita",
  Ni: "Garnierita",
  Cu: "Calcopirita",
  Zn: "Blenda",
  As: "Arsenopirita",
  Sr: "Celestina",
  Zr: "Circón",
  Mo: "Molibdenita",
  Ag: "Argentita",
  Sn: "Casiterita",
  Sb: "Estibina",
  Ba: "Baritina",
  W: "Wolframita",
  Au: "Pepa de oro",
  Hg: "Cinabrio",
  Pb: "Galena",
  Bi: "Bismutina",
  Th: "Torianita",
  U: "Pechblenda",
};

function researchForMetal(el) {
  return researchForElement(el);
}

function seedItems() {
  addItem({
    id: "water",
    name: "Agua",
    kind: "fluid",
    color: "#38bdf8",
    research: "start",
    tags: ["fluido", "básico"],
    elements: ["H", "O"],
    desc: "Disolvente universal. Bómbala de lagos o condénsala.",
  });
  addItem({
    id: "brine",
    name: "Salmuera",
    kind: "fluid",
    color: "#7dd3fc",
    research: "fluids",
    tags: ["fluido"],
    elements: ["H", "O", "Na", "Cl"],
    desc: "Agua con sales disueltas. Fuente de cloro y sodio.",
  });
  addItem({
    id: "oil",
    name: "Petróleo crudo",
    kind: "fluid",
    color: "#334155",
    research: "fluids",
    tags: ["fluido", "orgánico"],
    elements: ["C", "H"],
    desc: "Mezcla de hidrocarburos. Destílalo en el reactor.",
  });
  addItem({
    id: "steam",
    name: "Vapor",
    kind: "fluid",
    color: "#e2e8f0",
    research: "fluids",
    tags: ["fluido"],
    elements: ["H", "O"],
  });

  for (const e of ELEMENTS) {
    addItem({
      id: el(e.symbol),
      name: `${e.name} (${e.symbol})`,
      kind: "element",
      color: e.color,
      research: researchForElement(e),
      tags: ["elemento", e.category, e.abundance],
      elements: [e.symbol],
      z: e.z,
      symbol: e.symbol,
      desc: `Elemento Z=${e.z}, masa ${e.mass}. ${e.radioactive ? "Radiactivo. " : ""}Fase natural: ${e.phase}.`,
    });

    if (ORE_NAMES[e.symbol] || (e.metal && e.abundance !== "ultra" && e.z < 96)) {
      const oreId = `ore-${e.symbol.toLowerCase()}`;
      addItem({
        id: oreId,
        name: ORE_NAMES[e.symbol] || `Mineral de ${e.name.toLowerCase()}`,
        kind: "ore",
        color: shade(e.color, -30),
        research: researchForElement(e),
        tags: ["mineral"],
        elements: [e.symbol],
        symbol: e.symbol,
        desc: `Yacimiento de ${e.name}. Fundir o lixiviar para obtener el elemento.`,
      });
    }
  }
}

function shade(hex, amt) {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const FORMS = [
  { id: "ingot", name: "Lingote", building: "furnace", time: 3, tag: "lingote" },
  { id: "plate", name: "Placa", building: "furnace", time: 2, tag: "placa" },
  { id: "wire", name: "Cable", building: "assembler", time: 2, tag: "cable" },
  { id: "powder", name: "Polvo", building: "assembler", time: 2, tag: "polvo" },
  { id: "foil", name: "Lámina", building: "assembler", time: 2, tag: "lámina" },
  { id: "rod", name: "Barra", building: "assembler", time: 2, tag: "barra" },
  { id: "pellet", name: "Pellet", building: "assembler", time: 2, tag: "pellet" },
  { id: "coil", name: "Bobina", building: "assembler", time: 2, tag: "bobina" },
  { id: "bolt", name: "Tornillería", building: "assembler", time: 2, tag: "tornillo" },
];

function addMetalForms() {
  for (const e of formableMetals()) {
    const res = researchForMetal(e);
    const elementId = el(e.symbol);
    const oreId = `ore-${e.symbol.toLowerCase()}`;
    const hasOre = byId.has(oreId);

    if (hasOre) {
      addRecipe({
        id: `smelt-${e.symbol.toLowerCase()}`,
        name: `Fundir ${e.name.toLowerCase()}`,
        building: "furnace",
        time: 3.5,
        research: res,
        inputs: [
          { id: oreId, n: 1 },
          { id: el("C"), n: 1 },
        ],
        output: { id: elementId, n: 1 },
      });
    }

    let prev = elementId;
    for (const form of FORMS) {
      const id = `${form.id}-${e.symbol.toLowerCase()}`;
      addItem({
        id,
        name: `${form.name} de ${e.name.toLowerCase()}`,
        kind: "form",
        color: e.color,
        research: res,
        tags: [form.tag, "metal"],
        elements: [e.symbol],
        symbol: e.symbol,
        desc: `${form.name} industrial de ${e.name}.`,
      });
      addRecipe({
        id: `make-${id}`,
        name: `Fabricar ${form.name.toLowerCase()} de ${e.name.toLowerCase()}`,
        building: form.building,
        time: form.time,
        research: form.id === "ingot" || form.id === "plate" ? res : res === "start" ? "logistics" : res,
        inputs: [{ id: prev, n: 1 }],
        output: { id, n: form.id === "wire" || form.id === "foil" ? 2 : 1 },
      });
      if (form.id === "ingot") prev = id;
    }
  }
}

const ANIONS = [
  { id: "ox", name: "óxido", extra: "O", nExtra: 1, research: "chemistry", building: "furnace" },
  { id: "diox", name: "dióxido", extra: "O", nExtra: 2, research: "chemistry", building: "furnace" },
  { id: "oh", name: "hidróxido", extra: "O", nExtra: 1, extra2: "H", research: "chemistry", building: "reactor" },
  { id: "cl", name: "cloruro", extra: "Cl", nExtra: 2, research: "chemistry", building: "reactor" },
  { id: "f", name: "fluoruro", extra: "F", nExtra: 2, research: "advanced-chemistry", building: "reactor" },
  { id: "br", name: "bromuro", extra: "Br", nExtra: 2, research: "advanced-chemistry", building: "reactor" },
  { id: "i", name: "yoduro", extra: "I", nExtra: 2, research: "advanced-chemistry", building: "reactor" },
  { id: "s", name: "sulfuro", extra: "S", nExtra: 1, research: "chemistry", building: "furnace" },
  { id: "so4", name: "sulfato", extra: "S", nExtra: 1, extra2: "O", nExtra2: 4, research: "chemistry", building: "reactor" },
  { id: "no3", name: "nitrato", extra: "N", nExtra: 1, extra2: "O", nExtra2: 3, research: "chemistry", building: "reactor" },
  { id: "co3", name: "carbonato", extra: "C", nExtra: 1, extra2: "O", nExtra2: 3, research: "chemistry", building: "reactor" },
  { id: "po4", name: "fosfato", extra: "P", nExtra: 1, extra2: "O", nExtra2: 4, research: "chemistry", building: "reactor" },
  { id: "n", name: "nitruro", extra: "N", nExtra: 1, research: "advanced-chemistry", building: "reactor" },
  { id: "c", name: "carburo", extra: "C", nExtra: 1, research: "steel", building: "blast" },
  { id: "h", name: "hidruro", extra: "H", nExtra: 2, research: "electrolysis", building: "reactor" },
  { id: "si", name: "silicato", extra: "Si", nExtra: 1, extra2: "O", nExtra2: 3, research: "chemistry", building: "furnace" },
  { id: "ac", name: "acetato", extra: "C", nExtra: 2, extra2: "O", nExtra2: 2, research: "organics", building: "reactor" },
];

function addCompounds() {
  const hosts = ELEMENTS.filter(
    (e) => (e.metal || e.category === "metalloid") && e.z < 104 && e.abundance !== "ultra"
  );

  for (const e of hosts) {
    for (const an of ANIONS) {
      if (e.symbol === an.extra) continue;
      const id = `${an.id}-${e.symbol.toLowerCase()}`;
      const elements = [e.symbol, an.extra];
      if (an.extra2) elements.push(an.extra2);
      addItem({
        id,
        name: `${capitalize(an.name)} de ${e.name.toLowerCase()}`,
        kind: "compound",
        color: mix(e.color, "#94a3b8"),
        research: an.research,
        tags: ["compuesto", an.name],
        elements,
        desc: `Compuesto ${an.name} de ${e.name}.`,
      });
      const inputs = [
        { id: el(e.symbol), n: 1 },
        { id: el(an.extra), n: an.nExtra },
      ];
      if (an.extra2) inputs.push({ id: el(an.extra2), n: an.nExtra2 || 1 });
      addRecipe({
        id: `syn-${id}`,
        name: `Sintetizar ${an.name} de ${e.name.toLowerCase()}`,
        building: an.building,
        time: 4,
        research: an.research,
        inputs,
        output: { id, n: 1 },
      });
    }
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mix(a, b) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = (((pa >> 16) + (pb >> 16)) / 2) | 0;
  const g = ((((pa >> 8) & 255) + ((pb >> 8) & 255)) / 2) | 0;
  const bl = (((pa & 255) + (pb & 255)) / 2) | 0;
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

const NAMED = [
  ["h2so4", "Ácido sulfúrico", ["H", "S", "O"], "chemistry", "reactor", [{ id: el("S"), n: 1 }, { id: el("O"), n: 2 }, { id: "water", n: 1 }]],
  ["hcl", "Ácido clorhídrico", ["H", "Cl"], "chemistry", "reactor", [{ id: el("H"), n: 1 }, { id: el("Cl"), n: 1 }]],
  ["hno3", "Ácido nítrico", ["H", "N", "O"], "chemistry", "reactor", [{ id: el("N"), n: 1 }, { id: el("O"), n: 2 }, { id: "water", n: 1 }]],
  ["h3po4", "Ácido fosfórico", ["H", "P", "O"], "chemistry", "reactor", [{ id: el("P"), n: 1 }, { id: el("O"), n: 2 }, { id: "water", n: 1 }]],
  ["hf", "Ácido fluorhídrico", ["H", "F"], "advanced-chemistry", "reactor", [{ id: el("H"), n: 1 }, { id: el("F"), n: 1 }]],
  ["nh3", "Amoníaco", ["N", "H"], "chemistry", "reactor", [{ id: el("N"), n: 1 }, { id: el("H"), n: 3 }]],
  ["nacl", "Cloruro sódico", ["Na", "Cl"], "chemistry", "reactor", [{ id: el("Na"), n: 1 }, { id: el("Cl"), n: 1 }]],
  ["naoh", "Sosa cáustica", ["Na", "O", "H"], "electrolysis", "electrolyzer", [{ id: "nacl", n: 1 }, { id: "water", n: 1 }]],
  ["koh", "Potasa cáustica", ["K", "O", "H"], "electrolysis", "electrolyzer", [{ id: el("K"), n: 1 }, { id: "water", n: 1 }]],
  ["caco3", "Carbonato cálcico", ["Ca", "C", "O"], "chemistry", "furnace", [{ id: el("Ca"), n: 1 }, { id: el("C"), n: 1 }, { id: el("O"), n: 3 }]],
  ["cao", "Cal viva", ["Ca", "O"], "chemistry", "furnace", [{ id: "caco3", n: 1 }]],
  ["plastic-pe", "Polietileno", ["C", "H"], "organics", "reactor", [{ id: "oil", n: 2 }]],
  ["glass-silica", "Vidrio de sílice", ["Si", "O"], "start", "furnace", [{ id: "ore-si", n: 2 }, { id: el("C"), n: 1 }]],
  ["brick-fire", "Ladrillo refractario", ["Al", "Si", "O"], "steel", "furnace", [{ id: "ox-al", n: 1 }, { id: "ox-si", n: 1 }]],
  ["pipe-basic", "Tubería", ["Fe"], "fluids", "assembler", [{ id: "plate-fe", n: 2 }]],
  ["gear-basic", "Engranaje", ["Fe"], "start", "assembler", [{ id: "plate-fe", n: 2 }]],
  ["motor-basic", "Motor", ["Fe", "Cu"], "logistics", "assembler", [{ id: "gear-basic", n: 1 }, { id: "wire-cu", n: 4 }, { id: "plate-fe", n: 2 }]],
  ["steel", "Acero", ["Fe", "C"], "steel", "blast", [{ id: "ingot-fe", n: 4 }, { id: el("C"), n: 1 }]],
  ["stainless", "Acero inoxidable", ["Fe", "Cr", "Ni"], "steel", "blast", [{ id: "steel", n: 3 }, { id: el("Cr"), n: 1 }, { id: el("Ni"), n: 1 }]],
  ["bronze", "Bronce", ["Cu", "Sn"], "steel", "blast", [{ id: "ingot-cu", n: 3 }, { id: "ingot-sn", n: 1 }]],
  ["brass", "Latón", ["Cu", "Zn"], "steel", "blast", [{ id: "ingot-cu", n: 3 }, { id: "ingot-zn", n: 1 }]],
  ["duralumin", "Duraluminio", ["Al", "Cu"], "steel", "blast", [{ id: "ingot-al", n: 4 }, { id: "ingot-cu", n: 1 }]],
  ["invar", "Invar", ["Fe", "Ni"], "advanced-metals", "blast", [{ id: "ingot-fe", n: 3 }, { id: "ingot-ni", n: 2 }]],
  ["nichrome", "Nicrom", ["Ni", "Cr"], "advanced-metals", "blast", [{ id: "ingot-ni", n: 3 }, { id: "ingot-cr", n: 1 }]],
  ["solder", "Estaño de soldar", ["Sn", "Pb"], "electronics", "assembler", [{ id: "ingot-sn", n: 3 }, { id: "ingot-pb", n: 2 }]],
  ["electrum", "Electro", ["Au", "Ag"], "advanced-metals", "blast", [{ id: "ingot-au", n: 1 }, { id: "ingot-ag", n: 1 }]],
  ["alnico", "Alnico", ["Al", "Ni", "Co"], "advanced-metals", "blast", [{ id: "ingot-al", n: 1 }, { id: "ingot-ni", n: 1 }, { id: "ingot-co", n: 1 }]],
  ["titanium-alloy", "Aleación de titanio", ["Ti", "Al", "V"], "advanced-metals", "blast", [{ id: "ingot-ti", n: 4 }, { id: "ingot-al", n: 1 }, { id: el("V"), n: 1 }]],
  ["tungsten-carbide", "Carburo de wolframio", ["W", "C"], "advanced-metals", "blast", [{ id: el("W"), n: 1 }, { id: el("C"), n: 1 }]],
  ["silicon-wafer", "Oblea de silicio", ["Si"], "solar", "assembler", [{ id: "ore-si", n: 1 }, { id: el("P"), n: 1 }]],
  ["circuit-basic", "Circuito básico", ["Cu", "Si"], "electronics", "assembler", [{ id: "silicon-wafer", n: 1 }, { id: "wire-cu", n: 4 }, { id: "plastic-pe", n: 1 }]],
  ["circuit-advanced", "Circuito avanzado", ["Cu", "Si", "Au"], "electronics", "assembler", [{ id: "circuit-basic", n: 2 }, { id: "wire-au", n: 2 }, { id: "solder", n: 1 }]],
  ["magnet-nd", "Imán de neodimio", ["Nd", "Fe", "B"], "rare-earths", "assembler", [{ id: el("Nd"), n: 2 }, { id: "ingot-fe", n: 1 }, { id: el("B"), n: 1 }]],
  ["battery-li", "Batería de litio", ["Li", "Co", "O"], "batteries", "assembler", [{ id: el("Li"), n: 2 }, { id: "ox-co", n: 1 }, { id: "foil-al", n: 1 }]],
  ["battery-nimh", "Batería NiMH", ["Ni", "H"], "batteries", "assembler", [{ id: "ingot-ni", n: 2 }, { id: el("H"), n: 2 }, { id: "oh-ni", n: 1 }]],
  ["catalyst-pt", "Catalizador de platino", ["Pt"], "catalysis", "assembler", [{ id: "powder-pt", n: 1 }, { id: "powder-al", n: 2 }]],
  ["superwire", "Cable superconductor", ["Y", "Ba", "Cu", "O"], "superconductors", "assembler", [{ id: "ox-y", n: 1 }, { id: "ox-ba", n: 2 }, { id: "ox-cu", n: 3 }]],
  ["fuel-u", "Combustible de uranio", ["U"], "nuclear", "assembler", [{ id: el("U"), n: 2 }, { id: "pipe-basic", n: 1 }]],
  ["fuel-pu", "Combustible de plutonio", ["Pu"], "reprocessing", "assembler", [{ id: el("Pu"), n: 1 }, { id: el("U"), n: 1 }]],
  ["he3", "Helio-3", ["He"], "fusion", "reactor", [{ id: el("H"), n: 4 }]],
  ["periodica-core", "Núcleo de Periodica", ["Fe", "Cu", "Si", "U", "Nd"], "periodica-core", "assembler", [
    { id: "circuit-advanced", n: 8 },
    { id: "superwire", n: 4 },
    { id: "magnet-nd", n: 4 },
    { id: "fuel-u", n: 2 },
    { id: "stainless", n: 10 },
  ]],
  ["cement", "Cemento", ["Ca", "Si", "O"], "construction", "furnace", [{ id: "cao", n: 2 }, { id: "ore-si", n: 1 }]],
  ["concrete", "Hormigón", ["Ca", "Si"], "construction", "assembler", [{ id: "cement", n: 2 }, { id: "water", n: 1 }]],
  ["rebar", "Armadura", ["Fe"], "construction", "assembler", [{ id: "steel", n: 2 }]],
  ["beam", "Viga", ["Fe"], "construction", "assembler", [{ id: "steel", n: 3 }]],
  ["rail", "Carril", ["Fe"], "construction", "assembler", [{ id: "steel", n: 2 }, { id: el("C"), n: 1 }]],
  ["asphalt", "Asfalto", ["C", "H"], "construction", "reactor", [{ id: "oil", n: 2 }, { id: "el-c", n: 1 }]],
  ["container", "Contenedor", ["Fe"], "construction", "assembler", [{ id: "steel", n: 4 }]],
  ["urea", "Urea", ["C", "N", "H", "O"], "agri", "reactor", [{ id: "nh3", n: 2 }, { id: el("C"), n: 1 }]],
  ["npk", "Fertilizante NPK", ["N", "P", "K"], "agri", "reactor", [{ id: "urea", n: 1 }, { id: "h3po4", n: 1 }, { id: el("K"), n: 1 }]],
  ["pesticide", "Pesticida", ["C", "Cl"], "agri", "reactor", [{ id: "hcl", n: 1 }, { id: "hc-benceno", n: 1 }]],
  ["herbicide", "Herbicida", ["C", "N"], "agri", "reactor", [{ id: "nh3", n: 1 }, { id: "alc-metanol", n: 1 }]],
  ["soap", "Jabón", ["Na", "C"], "food", "reactor", [{ id: "naoh", n: 1 }, { id: "oil", n: 1 }]],
  ["bleach", "Lejía", ["Na", "Cl", "O"], "food", "electrolyzer", [{ id: "nacl", n: 1 }, { id: "water", n: 1 }]],
  ["can-al", "Lata de aluminio", ["Al"], "food", "assembler", [{ id: "plate-al", n: 1 }]],
  ["bottle-glass", "Botella de vidrio", ["Si"], "food", "furnace", [{ id: "glass-silica", n: 1 }]],
  ["olive-oil", "Aceite de oliva envasado", ["C", "H"], "food", "assembler", [{ id: "bottle-glass", n: 1 }, { id: "oil", n: 1 }]],
  ["canned-fish", "Conserva de pescado", ["Al", "C"], "food", "assembler", [{ id: "can-al", n: 1 }, { id: "nacl", n: 1 }]],
  ["wine-bottle", "Vino embotellado", ["Si"], "food", "assembler", [{ id: "bottle-glass", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["paracetamol", "Paracetamol", ["C", "N", "O"], "pharma", "reactor", [{ id: "hc-benceno", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["ibuprofen", "Ibuprofeno", ["C", "H", "O"], "pharma", "reactor", [{ id: "hc-tolueno", n: 1 }, { id: "hcl", n: 1 }]],
  ["penicillin", "Penicilina", ["C", "N", "S"], "pharma", "reactor", [{ id: "nh3", n: 1 }, { id: el("S"), n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["saline", "Suero fisiológico", ["Na", "Cl"], "pharma", "reactor", [{ id: "nacl", n: 1 }, { id: "water", n: 2 }]],
  ["vaccine-vial", "Vial de vacuna", ["Si"], "pharma", "assembler", [{ id: "glass-silica", n: 1 }, { id: "saline", n: 1 }]],
  ["syringe", "Jeringuilla", ["Si", "C"], "medical", "assembler", [{ id: "glass-silica", n: 1 }, { id: "plastic-pe", n: 1 }]],
  ["glove-nitrile", "Guante de nitrilo", ["C"], "medical", "assembler", [{ id: "rubber", n: 1 }]],
  ["mask-surg", "Mascarilla", ["C"], "medical", "assembler", [{ id: "plastic-pp", n: 1 }]],
  ["implant-ti", "Implante de titanio", ["Ti"], "medical", "assembler", [{ id: "titanium-alloy", n: 1 }, { id: "stainless", n: 1 }]],
  ["mri-coil", "Bobina de resonancia", ["Cu", "Nb"], "medical", "assembler", [{ id: "superwire", n: 1 }, { id: "circuit-advanced", n: 1 }]],
  ["dye-indigo", "Índigo sintético", ["C", "N"], "textiles", "reactor", [{ id: "nh3", n: 1 }, { id: "hc-benceno", n: 1 }]],
  ["dye-red", "Rojo azoico", ["C", "N"], "textiles", "reactor", [{ id: "hno3", n: 1 }, { id: "hc-benceno", n: 1 }]],
  ["fabric", "Tejido técnico", ["C"], "textiles", "assembler", [{ id: "nylon", n: 2 }, { id: "dye-indigo", n: 1 }]],
  ["denim", "Denim", ["C"], "textiles", "assembler", [{ id: "fabric", n: 1 }, { id: "dye-indigo", n: 1 }]],
  ["paint-white", "Pintura blanca", ["Ti", "O"], "pigments", "reactor", [{ id: "diox-ti", n: 1 }, { id: "plastic-pe", n: 1 }]],
  ["paint-blue", "Azul cobalto", ["Co", "O"], "pigments", "reactor", [{ id: "ox-co", n: 1 }, { id: "glass-silica", n: 1 }]],
  ["ink", "Tinta", ["C"], "pigments", "reactor", [{ id: "el-c", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["tile-ceramic", "Azulejo", ["Si", "Al"], "ceramics", "furnace", [{ id: "ox-al", n: 1 }, { id: "ox-si", n: 1 }]],
  ["porcelain", "Porcelana", ["Si", "Al"], "ceramics", "furnace", [{ id: "tile-ceramic", n: 1 }, { id: "glass-silica", n: 1 }]],
  ["fiber-optic", "Fibra óptica", ["Si"], "telecom", "assembler", [{ id: "glass-silica", n: 2 }, { id: "plastic-pe", n: 1 }]],
  ["radio", "Radio", ["Cu", "Si"], "telecom", "assembler", [{ id: "circuit-basic", n: 1 }, { id: "wire-cu", n: 2 }]],
  ["antenna-5g", "Antena 5G", ["Cu", "Al"], "telecom", "assembler", [{ id: "circuit-advanced", n: 1 }, { id: "duralumin", n: 1 }]],
  ["phone", "Teléfono", ["Si", "Li"], "telecom", "assembler", [{ id: "circuit-advanced", n: 1 }, { id: "battery-li", n: 1 }, { id: "glass-silica", n: 1 }]],
  ["server", "Servidor", ["Si", "Cu"], "telecom", "assembler", [{ id: "circuit-advanced", n: 2 }, { id: "plate-al", n: 2 }]],
  ["inverter", "Inversor", ["Si", "Cu"], "energy-grid", "assembler", [{ id: "circuit-basic", n: 1 }, { id: "wire-cu", n: 4 }]],
  ["charger", "Punto de recarga", ["Cu"], "energy-grid", "assembler", [{ id: "inverter", n: 1 }, { id: "steel", n: 1 }]],
  ["grid-battery", "Batería de red", ["Li"], "energy-grid", "assembler", [{ id: "battery-li", n: 4 }, { id: "inverter", n: 1 }]],
  ["h2-tank", "Tanque de hidrógeno", ["Fe", "H"], "hydrogen", "assembler", [{ id: "steel", n: 2 }, { id: el("H"), n: 4 }]],
  ["fuelcell", "Pila de combustible", ["Pt", "H"], "hydrogen", "assembler", [{ id: "catalyst-pt", n: 1 }, { id: "circuit-basic", n: 1 }]],
  ["tire", "Neumático", ["C"], "mobility", "assembler", [{ id: "rubber", n: 2 }, { id: "steel", n: 1 }]],
  ["chassis", "Chasis", ["Fe"], "mobility", "assembler", [{ id: "steel", n: 3 }, { id: "motor-basic", n: 1 }]],
  ["ev-car", "Coche eléctrico", ["Li", "Fe"], "mobility", "assembler", [{ id: "chassis", n: 1 }, { id: "battery-li", n: 2 }, { id: "tire", n: 4 }]],
  ["train-car", "Coche de tren", ["Fe"], "mobility", "assembler", [{ id: "rail", n: 2 }, { id: "motor-basic", n: 2 }, { id: "stainless", n: 2 }]],
  ["ship-plate", "Plancha naval", ["Fe"], "mobility", "blast", [{ id: "steel", n: 4 }]],
  ["carbon-fiber", "Fibra de carbono", ["C"], "composites", "reactor", [{ id: "el-c", n: 3 }, { id: "nylon", n: 1 }]],
  ["kevlar", "Kevlar", ["C", "N"], "composites", "reactor", [{ id: "nylon", n: 2 }, { id: "nh3", n: 1 }]],
  ["wind-blade", "Pala eólica", ["C"], "composites", "assembler", [{ id: "carbon-fiber", n: 2 }, { id: "magnet-nd", n: 1 }]],
  ["scrap-fe", "Chatarra de hierro", ["Fe"], "recycling", "assembler", [{ id: "plate-fe", n: 1 }]],
  ["recycled-pe", "PE reciclado", ["C"], "recycling", "reactor", [{ id: "plastic-pe", n: 2 }]],
  ["led", "LED", ["Ga", "N"], "electronics", "assembler", [{ id: "circuit-basic", n: 1 }, { id: el("Ga"), n: 1 }]],
  ["sensor", "Sensor", ["Si"], "electronics", "assembler", [{ id: "circuit-basic", n: 1 }, { id: "silicon-wafer", n: 1 }]],
  ["pcb", "Placa de circuito", ["Cu", "Si"], "electronics", "assembler", [{ id: "circuit-basic", n: 1 }, { id: "plastic-pe", n: 1 }]],
  ["hydrogen-peroxide", "Agua oxigenada", ["H", "O"], "advanced-chemistry", "reactor", [{ id: "water", n: 1 }, { id: el("O"), n: 1 }]],
  ["activated-carbon", "Carbón activo", ["C"], "recycling", "furnace", [{ id: el("C"), n: 2 }]],
  ["zeolite", "Zeolita", ["Si", "Al"], "catalysis", "furnace", [{ id: "ox-si", n: 1 }, { id: "ox-al", n: 1 }]],
  ["desal-membrane", "Membrana de ósmosis", ["C"], "hydrogen", "assembler", [{ id: "plastic-pe", n: 2 }, { id: "zeolite", n: 1 }]],
  ["oxygen-med", "Oxígeno medicinal", ["O"], "medical", "electrolyzer", [{ id: "water", n: 2 }]],
  ["neon-sign", "Neón publicitario", ["Ne"], "noble-gases", "assembler", [{ id: el("Ne"), n: 1 }, { id: "glass-silica", n: 1 }]],
  ["argon-weld", "Argón de soldadura", ["Ar"], "noble-gases", "assembler", [{ id: el("Ar"), n: 1 }, { id: "pipe-basic", n: 1 }]],
  ["paper", "Papel", ["C"], "forestry", "assembler", [{ id: el("C"), n: 2 }, { id: "water", n: 1 }]],
  ["cardboard", "Cartón", ["C"], "forestry", "assembler", [{ id: "paper", n: 2 }]],
  ["newsprint", "Papel de prensa", ["C"], "forestry", "assembler", [{ id: "paper", n: 1 }, { id: "ink", n: 1 }]],
  ["beer", "Cerveza", ["C", "H"], "brewing", "reactor", [{ id: "alc-etanol", n: 1 }, { id: "water", n: 2 }, { id: "bottle-glass", n: 1 }]],
  ["cider", "Sidra", ["C"], "brewing", "assembler", [{ id: "alc-etanol", n: 1 }, { id: "bottle-glass", n: 1 }]],
  ["brick", "Ladrillo", ["Si", "Al"], "urban", "furnace", [{ id: "ox-al", n: 1 }, { id: "ox-si", n: 1 }, { id: "cao", n: 1 }]],
  ["window", "Ventana", ["Si"], "urban", "assembler", [{ id: "glass-silica", n: 2 }, { id: "plate-al", n: 1 }]],
  ["door", "Puerta de acero", ["Fe"], "urban", "assembler", [{ id: "steel", n: 2 }, { id: "gear-basic", n: 1 }]],
  ["insulation", "Aislante", ["C"], "urban", "assembler", [{ id: "plastic-pe", n: 2 }, { id: "glass-silica", n: 1 }]],
  ["hull", "Casco de buque", ["Fe"], "shipyard", "blast", [{ id: "ship-plate", n: 3 }, { id: "beam", n: 2 }]],
  ["crane", "Grúa portuaria", ["Fe"], "shipyard", "assembler", [{ id: "steel", n: 4 }, { id: "motor-basic", n: 2 }]],
  ["chip", "Chip", ["Si"], "semicon", "assembler", [{ id: "silicon-wafer", n: 2 }, { id: "circuit-basic", n: 1 }]],
  ["photomask", "Fotomáscara", ["Si"], "semicon", "assembler", [{ id: "glass-silica", n: 1 }, { id: "circuit-advanced", n: 1 }]],
  ["robot", "Robot industrial", ["Fe", "Si"], "robotics", "assembler", [{ id: "motor-basic", n: 2 }, { id: "circuit-advanced", n: 1 }, { id: "sensor", n: 1 }]],
  ["drone", "Dron", ["Al", "Si"], "robotics", "assembler", [{ id: "duralumin", n: 2 }, { id: "circuit-basic", n: 1 }, { id: "battery-li", n: 1 }]],
  ["lens", "Lente", ["Si"], "optics", "furnace", [{ id: "glass-silica", n: 2 }, { id: el("B"), n: 1 }]],
  ["laser", "Láser", ["Ga"], "optics", "assembler", [{ id: "led", n: 1 }, { id: "lens", n: 1 }, { id: "circuit-basic", n: 1 }]],
  ["airframe", "Fuselaje", ["Al"], "aviation", "assembler", [{ id: "duralumin", n: 4 }, { id: "carbon-fiber", n: 2 }]],
  ["jet-turbine", "Turbina", ["Ni"], "aviation", "assembler", [{ id: "ingot-ni", n: 3 }, { id: "titanium-alloy", n: 1 }, { id: "motor-basic", n: 1 }]],
  ["airliner", "Avión comercial", ["Al"], "aviation", "assembler", [{ id: "airframe", n: 1 }, { id: "jet-turbine", n: 2 }, { id: "circuit-advanced", n: 2 }]],
  ["precision", "Instrumento de precisión", ["Fe"], "precision", "assembler", [{ id: "stainless", n: 1 }, { id: "circuit-basic", n: 1 }]],
  ["watch", "Reloj", ["Au"], "precision", "assembler", [{ id: "precision", n: 1 }, { id: "ingot-au", n: 1 }]],
  ["solar-panel", "Módulo solar", ["Si"], "solar", "assembler", [{ id: "silicon-wafer", n: 2 }, { id: "glass-silica", n: 2 }, { id: "wire-cu", n: 2 }]],
  ["tgv", "Tren de alta velocidad", ["Fe"], "mobility", "assembler", [{ id: "train-car", n: 1 }, { id: "inverter", n: 1 }, { id: "rail", n: 2 }]],
  ["generic-meds", "Medicamento genérico", ["C"], "pharma", "assembler", [{ id: "paracetamol", n: 1 }, { id: "bottle-glass", n: 1 }]],
  ["drip", "Gotero hospitalario", ["C"], "medical", "assembler", [{ id: "plastic-pe", n: 1 }, { id: "saline", n: 1 }]],
  ["textile", "Hilatura", ["C"], "textiles", "assembler", [{ id: "nylon", n: 1 }]],
  ["palm-oil", "Aceite de palma", ["C", "H"], "food", "reactor", [{ id: "oil", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["aspirin", "Aspirina", ["C", "O"], "pharma", "reactor", [{ id: "hc-benceno", n: 1 }, { id: "h2so4", n: 1 }]],
  ["insulin", "Insulina", ["C", "N"], "pharma", "reactor", [{ id: "nh3", n: 2 }, { id: "alc-etanol", n: 1 }, { id: "glass-silica", n: 1 }]],
  ["bandage", "Venda", ["C"], "medical", "assembler", [{ id: "textile", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ["bread", "Pan industrial", ["C"], "food", "furnace", [{ id: "urea", n: 1 }, { id: "water", n: 1 }]],
  ["cheese", "Queso", ["C"], "food", "assembler", [{ id: "nacl", n: 1 }, { id: "can-al", n: 1 }]],
  ["juice", "Zumo envasado", ["C"], "food", "assembler", [{ id: "bottle-glass", n: 1 }, { id: "water", n: 1 }]],
  ["bike", "Bicicleta", ["Fe"], "mobility", "assembler", [{ id: "steel", n: 2 }, { id: "tire", n: 2 }, { id: "gear-basic", n: 2 }]],
  ["bus", "Autobús", ["Fe"], "mobility", "assembler", [{ id: "chassis", n: 2 }, { id: "tire", n: 6 }, { id: "glass-silica", n: 2 }]],
  ["display", "Pantalla", ["Si"], "electronics", "assembler", [{ id: "glass-silica", n: 1 }, { id: "led", n: 2 }, { id: "circuit-basic", n: 1 }]],
  ["transformer", "Transformador", ["Fe", "Cu"], "energy-grid", "assembler", [{ id: "ingot-fe", n: 2 }, { id: "wire-cu", n: 8 }]],
  ["turbine", "Turbina eólica", ["Fe"], "composites", "assembler", [{ id: "wind-blade", n: 3 }, { id: "steel", n: 4 }, { id: "magnet-nd", n: 1 }]],
  ["satellite", "Satélite", ["Al", "Si"], "aviation", "assembler", [{ id: "duralumin", n: 2 }, { id: "solar-panel", n: 2 }, { id: "circuit-advanced", n: 2 }]],
  ["hospital-kit", "Kit hospitalario", ["Si"], "medical", "assembler", [{ id: "syringe", n: 2 }, { id: "mask-surg", n: 2 }, { id: "saline", n: 1 }]],
  ["school-kit", "Kit escolar", ["C"], "urban", "assembler", [{ id: "paper", n: 4 }, { id: "glass-silica", n: 1 }]],
  ["aid-crate", "Caja humanitaria", ["Fe"], "food", "assembler", [{ id: "can-al", n: 4 }, { id: "npk", n: 1 }, { id: "bottle-glass", n: 2 }]],
  ["euro-pallet", "Palé de exportación", ["Fe"], "commerce", "assembler", [{ id: "steel", n: 1 }, { id: "container", n: 1 }]],
];

function addNamed() {
  for (const [id, name, elements, research, building, inputs] of NAMED) {
    addItem({
      id,
      name,
      kind: "named",
      color: byId.get(el(elements[0]))?.color ?? "#e2e8f0",
      research,
      tags: ["clave"],
      elements,
      desc: `${name}. Pieza clave de la progresión.`,
    });
    addRecipe({
      id: `make-${id}`,
      name: `Fabricar ${name.toLowerCase()}`,
      building,
      time: 5,
      research,
      inputs,
      output: { id, n: 1 },
    });
  }
}

function addAlloysGenerated() {
  const pairs = [
    ["Fe", "Mn"],
    ["Fe", "V"],
    ["Fe", "Mo"],
    ["Fe", "W"],
    ["Cu", "Ni"],
    ["Cu", "Al"],
    ["Cu", "Be"],
    ["Al", "Mg"],
    ["Al", "Si"],
    ["Al", "Zn"],
    ["Ti", "Al"],
    ["Ti", "Mo"],
    ["Ni", "Fe"],
    ["Ni", "Mo"],
    ["Co", "Cr"],
    ["Zn", "Al"],
    ["Sn", "Cu"],
    ["Pb", "Sb"],
    ["Ag", "Cu"],
    ["Au", "Cu"],
    ["Au", "Ni"],
    ["Mg", "Zn"],
    ["Mg", "Li"],
    ["Zr", "Sn"],
    ["Nb", "Ti"],
    ["Ta", "W"],
    ["Cr", "Fe"],
    ["Mn", "Cu"],
    ["W", "Re"],
    ["Pt", "Ir"],
    ["Pt", "Rh"],
    ["Pd", "Ag"],
  ];
  for (const [a, b] of pairs) {
    const ea = ELEMENTS.find((e) => e.symbol === a);
    const eb = ELEMENTS.find((e) => e.symbol === b);
    if (!ea || !eb) continue;
    const id = `alloy-${a.toLowerCase()}-${b.toLowerCase()}`;
    addItem({
      id,
      name: `Aleación ${a}–${b}`,
      kind: "alloy",
      color: mix(ea.color, eb.color),
      research: "steel",
      tags: ["aleación"],
      elements: [a, b],
      desc: `Aleación binaria de ${ea.name} y ${eb.name}.`,
    });
    addRecipe({
      id: `make-${id}`,
      name: `Fundir aleación ${a}–${b}`,
      building: "blast",
      time: 6,
      research: "steel",
      inputs: [
        { id: `ingot-${a.toLowerCase()}`, n: 2 },
        { id: `ingot-${b.toLowerCase()}`, n: 1 },
      ],
      output: { id, n: 2 },
    });
  }
}

function addOrganics() {
  const chains = [
    [1, "Metano", "CH₄"],
    [2, "Etano", "C₂H₆"],
    [2, "Etileno", "C₂H₄"],
    [2, "Acetileno", "C₂H₂"],
    [3, "Propano", "C₃H₈"],
    [3, "Propileno", "C₃H₆"],
    [4, "Butano", "C₄H₁₀"],
    [5, "Pentano", "C₅H₁₂"],
    [6, "Hexano", "C₆H₁₄"],
    [6, "Benceno", "C₆H₆"],
    [7, "Heptano", "C₇H₁₆"],
    [7, "Tolueno", "C₇H₈"],
    [8, "Octano", "C₈H₁₈"],
    [8, "Xileno", "C₈H₁₀"],
    [9, "Nonano", "C₉H₂₀"],
    [10, "Decano", "C₁₀H₂₂"],
    [12, "Dodecano", "C₁₂H₂₆"],
    [13, "Tridecano", "C₁₃H₂₈"],
    [14, "Tetradecano", "C₁₄H₃₀"],
    [16, "Hexadecano", "C₁₆H₃₄"],
    [18, "Octadecano", "C₁₈H₃₈"],
  ];
  for (const [n, name, formula] of chains) {
    const id = `hc-${name.toLowerCase()}`;
    addItem({
      id,
      name: `${name} (${formula})`,
      kind: "organic",
      color: "#334155",
      research: "organics",
      tags: ["orgánico", "hidrocarburo"],
      elements: ["C", "H"],
      desc: `Hidrocarburo ${formula}.`,
    });
    addRecipe({
      id: `make-${id}`,
      name: `Obtener ${name.toLowerCase()}`,
      building: "reactor",
      time: 3 + n * 0.2,
      research: "organics",
      inputs: [
        { id: "oil", n: 1 },
        { id: el("H"), n: 1 },
      ],
      output: { id, n: 1 },
    });
  }

  const alcohols = ["Metanol", "Etanol", "Propanol", "Butanol", "Fenol", "Glicerol"];
  for (const name of alcohols) {
    const id = `alc-${name.toLowerCase()}`;
    addItem({
      id,
      name,
      kind: "organic",
      color: "#67e8f9",
      research: "organics",
      tags: ["orgánico", "alcohol"],
      elements: ["C", "H", "O"],
    });
    addRecipe({
      id: `make-${id}`,
      name: `Sintetizar ${name.toLowerCase()}`,
      building: "reactor",
      time: 5,
      research: "organics",
      inputs: [
        { id: "oil", n: 1 },
        { id: "water", n: 1 },
      ],
      output: { id, n: 1 },
    });
  }

  const plastics = [
    ["plastic-pe", "Polietileno", "hc-etileno"],
    ["plastic-pp", "Polipropileno", "hc-propileno"],
    ["plastic-pvc", "PVC", "hc-etileno"],
    ["plastic-ps", "Poliestireno", "hc-benceno"],
    ["plastic-pet", "PET", "alc-etanol"],
    ["nylon", "Nylon", "alc-butanol"],
    ["rubber", "Caucho sintético", "hc-butano"],
    ["teflon", "Teflón", "el-f"],
  ];
  for (const [id, name, src] of plastics) {
    addItem({
      id,
      name,
      kind: "polymer",
      color: "#e2e8f0",
      research: "polymers",
      tags: ["polímero"],
      elements: ["C", "H"],
    });
    addRecipe({
      id: `make-${id}`,
      name: `Polimerizar ${name}`,
      building: "reactor",
      time: 6,
      research: "polymers",
      inputs: [
        { id: src, n: 2 },
        { id: "catalyst-pt", n: 0 },
      ].filter((x) => x.n > 0 || x.id !== "catalyst-pt"),
      output: { id, n: 2 },
    });
  }

  addRecipe({
    id: "crack-oil",
    name: "Craquear petróleo",
    building: "reactor",
    time: 4,
    research: "organics",
    inputs: [{ id: "oil", n: 2 }],
    output: { id: "hc-etileno", n: 2 },
  });
}

function addScience() {
  const packs = [
    ["sci-mining", "Ciencia de minería", "start", "furnace", [{ id: "plate-fe", n: 2 }, { id: el("C"), n: 1 }]],
    ["sci-metal", "Ciencia de metalurgia", "metallurgy", "assembler", [{ id: "plate-cu", n: 2 }, { id: "gear-basic", n: 1 }]],
    ["sci-chem", "Ciencia química", "chemistry", "reactor", [{ id: "h2so4", n: 1 }, { id: "glass-silica", n: 1 }]],
    ["sci-elec", "Ciencia electrónica", "electronics", "assembler", [{ id: "circuit-basic", n: 1 }, { id: "wire-cu", n: 2 }]],
    ["sci-atom", "Ciencia atómica", "rare-earths", "assembler", [{ id: "circuit-advanced", n: 1 }, { id: el("U"), n: 1 }]],
    ["sci-frontier", "Ciencia de frontera", "frontier", "assembler", [{ id: "superwire", n: 1 }, { id: "magnet-nd", n: 1 }]],
    ["sci-civic", "Ciencia cívica", "logistics-2", "assembler", [{ id: "glass-silica", n: 1 }, { id: "gear-basic", n: 1 }]],
    ["sci-health", "Ciencia de la salud", "organics", "assembler", [{ id: "glass-silica", n: 1 }, { id: "alc-etanol", n: 1 }]],
  ];
  for (const [id, name, research, building, inputs] of packs) {
    addItem({
      id,
      name,
      kind: "science",
      color: "#f472b6",
      research,
      tags: ["ciencia"],
      elements: [],
      desc: "Paquete de investigación. Entrégalo a un laboratorio.",
    });
    addRecipe({
      id: `make-${id}`,
      name: `Empaquetar ${name.toLowerCase()}`,
      building,
      time: 5,
      research,
      inputs,
      output: { id, n: 1 },
    });
  }
}

function addElectrolysis() {
  addRecipe({
    id: "split-water",
    name: "Electrólisis del agua",
    building: "electrolyzer",
    time: 4,
    research: "electrolysis",
    inputs: [{ id: "water", n: 2 }],
    output: { id: el("H"), n: 2 },
    output2: { id: el("O"), n: 1 },
  });
  addRecipe({
    id: "split-brine",
    name: "Electrólisis de salmuera",
    building: "electrolyzer",
    time: 5,
    research: "electrolysis",
    inputs: [{ id: "brine", n: 2 }],
    output: { id: el("Cl"), n: 1 },
    output2: { id: "naoh", n: 1 },
  });
}

function addHydratesAndPurities() {
  const hosts = metalElements().filter((e) => e.abundance !== "ultra" && e.z < 84);
  for (const e of hosts) {
    const base = `so4-${e.symbol.toLowerCase()}`;
    if (!byId.has(base)) continue;
    const id = `hydrate-${e.symbol.toLowerCase()}`;
    addItem({
      id,
      name: `Sulfato hidratado de ${e.name.toLowerCase()}`,
      kind: "compound",
      color: mix(e.color, "#38bdf8"),
      research: "chemistry",
      tags: ["compuesto", "hidrato"],
      elements: [e.symbol, "S", "O", "H"],
    });
    addRecipe({
      id: `make-${id}`,
      name: `Hidratar sulfato de ${e.name.toLowerCase()}`,
      building: "reactor",
      time: 3,
      research: "chemistry",
      inputs: [
        { id: base, n: 1 },
        { id: "water", n: 2 },
      ],
      output: { id, n: 1 },
    });

    const pureId = `pure-${e.symbol.toLowerCase()}`;
    addItem({
      id: pureId,
      name: `${e.name} de alta pureza`,
      kind: "form",
      color: shade(e.color, 40),
      research: e.abundance === "common" ? "electrolysis" : researchForMetal(e),
      tags: ["puro"],
      elements: [e.symbol],
    });
    addRecipe({
      id: `make-${pureId}`,
      name: `Purificar ${e.name.toLowerCase()}`,
      building: "electrolyzer",
      time: 6,
      research: "electrolysis",
      inputs: [
        { id: el(e.symbol), n: 2 },
        { id: "h2so4", n: 1 },
      ],
      output: { id: pureId, n: 1 },
    });
  }
}

function addSyntheticSuperheavies() {
  for (const e of ELEMENTS.filter((elmt) => elmt.z >= 104)) {
    addRecipe({
      id: `synth-${e.symbol.toLowerCase()}`,
      name: `Sintetizar ${e.name}`,
      building: "reactor",
      time: 20,
      research: "frontier",
      inputs: [
        { id: el("U"), n: 1 },
        { id: el("Ca"), n: 1 },
        { id: "sci-frontier", n: 1 },
      ],
      output: { id: el(e.symbol), n: 1 },
    });
  }
}

function addLabRecipes() {
  const packs = ["sci-mining", "sci-metal", "sci-chem", "sci-elec", "sci-atom", "sci-frontier", "sci-civic", "sci-health"];
  for (const p of packs) {
    addRecipe({
      id: `lab-${p}`,
      name: `Investigar con ${p}`,
      building: "lab",
      time: 6,
      research: "start",
      inputs: [{ id: p, n: 1 }],
      output: { id: p, n: 0 },
      science: p,
    });
  }
}

function addExtractorRecipes() {
  for (const e of ELEMENTS) {
    const oreId = `ore-${e.symbol.toLowerCase()}`;
    const out = e.symbol === "C" || e.phase === "gas" || !byId.has(oreId) ? el(e.symbol) : oreId;
    addRecipe({
      id: `extract-${e.symbol.toLowerCase()}`,
      name: `Extraer ${e.name.toLowerCase()}`,
      building: "extractor",
      time: e.abundance === "common" ? 2.5 : e.abundance === "uncommon" ? 4 : e.abundance === "rare" ? 6 : 10,
      research: researchForElement(e),
      inputs: [],
      output: { id: out, n: 1 },
      deposit: e.symbol,
    });
  }
  addRecipe({
    id: "pump-water",
    name: "Bombear agua",
    building: "pump",
    time: 1.5,
    research: "fluids",
    inputs: [],
    output: { id: "water", n: 1 },
    deposit: "water",
  });
  addRecipe({
    id: "pump-brine",
    name: "Bombear salmuera",
    building: "pump",
    time: 2,
    research: "fluids",
    inputs: [],
    output: { id: "brine", n: 1 },
    deposit: "brine",
  });
  addRecipe({
    id: "pump-oil",
    name: "Bombear petróleo",
    building: "pump",
    time: 3,
    research: "fluids",
    inputs: [],
    output: { id: "oil", n: 1 },
    deposit: "oil",
  });
}

function pruneInvalidRecipes() {
  const valid = [];
  for (const r of recipes) {
    const inputsOk = r.inputs.every((i) => byId.has(i.id));
    const outOk = !r.output?.id || byId.has(r.output.id);
    const out2Ok = !r.output2?.id || byId.has(r.output2.id);
    if (inputsOk && outOk && out2Ok) valid.push(r);
  }
  recipes.length = 0;
  recipes.push(...valid);
}

function indexRecipes() {
  for (const item of items) item.recipes = [];
  for (const r of recipes) {
    if (r.output?.id && byId.has(r.output.id)) byId.get(r.output.id).recipes.push(r);
    if (r.output2?.id && byId.has(r.output2.id)) byId.get(r.output2.id).recipes.push(r);
  }
}

seedItems();
addMetalForms();
addCompounds();
addNamed();
addAlloysGenerated();
addOrganics();
addScience();
addElectrolysis();
addHydratesAndPurities();
addSyntheticSuperheavies();
addLabRecipes();
addExtractorRecipes();
pruneInvalidRecipes();
indexRecipes();

export const ITEMS = items;
export const RECIPES = recipes;
export const ITEM_BY_ID = byId;

export function getItem(id) {
  return byId.get(id);
}

export function recipesForBuilding(type) {
  return recipes.filter((r) => r.building === type && !r.science);
}

export function labRecipes() {
  return recipes.filter((r) => r.building === "lab");
}

export function searchItems(query, limit = 80) {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, limit);
  const out = [];
  for (const item of items) {
    if (
      item.name.toLowerCase().includes(q) ||
      item.id.includes(q) ||
      item.elements.some((e) => e.toLowerCase() === q) ||
      item.tags.some((t) => t.includes(q))
    ) {
      out.push(item);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export const CATALOG_STATS = {
  items: items.length,
  recipes: recipes.length,
  elements: ELEMENTS.length,
};
