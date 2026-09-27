import { ITEM_BY_ID, getItem } from "../data/catalog.js";
import { ELEMENT_BY_SYMBOL, CATEGORIES } from "../data/elements.js";
import { BUILDINGS } from "../data/buildings.js";

const SHAPE = {
  alkali: "square",
  alkaline: "diamond",
  transition: "hex",
  postTransition: "round",
  metalloid: "tri",
  nonmetal: "circle",
  halogen: "triDown",
  noble: "ring",
  lanthanide: "star",
  actinide: "cross",
  unknown: "circle",
};

const FORM_GLYPH = {
  ingot: "ingot",
  plate: "plate",
  wire: "wire",
  powder: "powder",
  foil: "foil",
  rod: "rod",
  pellet: "pellet",
  coil: "coil",
  bolt: "bolt",
};

const ANION_GLYPH = {
  ox: "oxide",
  diox: "oxide",
  oh: "hydroxide",
  cl: "salt",
  f: "salt",
  br: "salt",
  i: "salt",
  s: "sulfide",
  so4: "sulfate",
  no3: "nitrate",
  co3: "carbonate",
  po4: "phosphate",
  n: "nitride",
  c: "carbide",
  h: "hydride",
  si: "silicate",
  ac: "acetate",
};

const NAMED_GLYPH = {
  h2so4: "acid",
  hcl: "acid",
  hno3: "acid",
  h3po4: "acid",
  hf: "acid",
  nh3: "gas",
  nacl: "salt",
  naoh: "flask",
  koh: "flask",
  caco3: "rock",
  cao: "powder",
  "plastic-pe": "polymer",
  "plastic-pp": "polymer",
  "plastic-pvc": "polymer",
  "plastic-ps": "polymer",
  "plastic-pet": "polymer",
  nylon: "fiber",
  rubber: "tire",
  teflon: "polymer",
  "glass-silica": "glass",
  "brick-fire": "brick",
  "pipe-basic": "pipe",
  "gear-basic": "gear",
  "motor-basic": "motor",
  steel: "ingot",
  stainless: "ingot",
  bronze: "ingot",
  brass: "ingot",
  duralumin: "ingot",
  invar: "ingot",
  nichrome: "wire",
  solder: "drop",
  electrum: "ingot",
  alnico: "magnet",
  "titanium-alloy": "ingot",
  "tungsten-carbide": "pellet",
  "silicon-wafer": "wafer",
  "circuit-basic": "chip",
  "circuit-advanced": "chip",
  "magnet-nd": "magnet",
  "battery-li": "battery",
  "battery-nimh": "battery",
  "catalyst-pt": "catalyst",
  superwire: "superwire",
  "fuel-u": "fuel",
  "fuel-pu": "fuel",
  he3: "gas",
  "periodica-core": "core",
  cement: "powder",
  concrete: "brick",
  rebar: "rod",
  beam: "beam",
  rail: "rail",
  asphalt: "asphalt",
  container: "container",
  urea: "pellet",
  npk: "fertilizer",
  pesticide: "spray",
  herbicide: "leaf",
  soap: "soap",
  bleach: "flask",
  "can-al": "can",
  "bottle-glass": "bottle",
  "olive-oil": "olive",
  "canned-fish": "fish",
  "wine-bottle": "wine",
  paracetamol: "pill",
  ibuprofen: "pill",
  penicillin: "vial",
  saline: "drip",
  "vaccine-vial": "vial",
  syringe: "syringe",
  "glove-nitrile": "glove",
  "mask-surg": "mask",
  "implant-ti": "implant",
  "mri-coil": "mri",
  "dye-indigo": "dye",
  "dye-red": "dye",
  fabric: "fabric",
  denim: "fabric",
  "paint-white": "paint",
  "paint-blue": "paint",
  ink: "ink",
  "tile-ceramic": "tile",
  porcelain: "tile",
  "fiber-optic": "fiber",
  radio: "radio",
  "antenna-5g": "antenna",
  phone: "phone",
  server: "server",
  inverter: "inverter",
  charger: "charger",
  "grid-battery": "battery",
  "h2-tank": "tank",
  fuelcell: "fuelcell",
  tire: "tire",
  chassis: "chassis",
  "ev-car": "car",
  "train-car": "train",
  "ship-plate": "ship",
  "carbon-fiber": "fiber",
  kevlar: "fabric",
  "wind-blade": "blade",
  "scrap-fe": "scrap",
  "recycled-pe": "recycle",
  led: "led",
  sensor: "sensor",
  pcb: "chip",
  "hydrogen-peroxide": "flask",
  "activated-carbon": "powder",
  zeolite: "rock",
  "desal-membrane": "membrane",
  "oxygen-med": "gas",
  "neon-sign": "neon",
  "argon-weld": "weld",
  paper: "paper",
  cardboard: "paper",
  newsprint: "paper",
  beer: "beer",
  cider: "bottle",
  brick: "brick",
  window: "window",
  door: "door",
  insulation: "insulation",
  hull: "ship",
  crane: "crane",
  chip: "chip",
  photomask: "wafer",
  robot: "robot",
  drone: "drone",
  lens: "lens",
  laser: "laser",
  airframe: "plane",
  "jet-turbine": "turbine",
  airliner: "plane",
  precision: "watch",
  watch: "watch",
  "solar-panel": "solar",
  tgv: "train",
  "generic-meds": "pill",
  drip: "drip",
  textile: "fiber",
  "palm-oil": "olive",
  aspirin: "pill",
  insulin: "vial",
  bandage: "bandage",
  bread: "bread",
  cheese: "cheese",
  juice: "bottle",
  bike: "bike",
  bus: "bus",
  display: "display",
  transformer: "transformer",
  turbine: "turbine",
  satellite: "satellite",
  "hospital-kit": "kit",
  "school-kit": "kit",
  "aid-crate": "crate",
  "euro-pallet": "pallet",
};

const SCI_COLOR = {
  "sci-mining": "#fbbf24",
  "sci-metal": "#fb7185",
  "sci-chem": "#a78bfa",
  "sci-elec": "#38bdf8",
  "sci-atom": "#4ade80",
  "sci-frontier": "#e879f9",
  "sci-civic": "#fb7185",
  "sci-health": "#67e8f9",
};

export function logoSpec(itemOrId) {
  const item = typeof itemOrId === "string" ? getItem(itemOrId) : itemOrId;
  if (!item) return { family: "unknown", glyph: "box", color: "#94a3b8", badge: "?" };
  const color = item.color || "#94a3b8";
  if (item.kind === "element") {
    return { family: "element", glyph: "element", color, badge: item.symbol, symbol: item.symbol };
  }
  if (item.kind === "ore") {
    return { family: "ore", glyph: "ore", color, badge: item.symbol || item.id.slice(4, 6).toUpperCase(), symbol: item.symbol };
  }
  if (item.kind === "fluid") {
    const glyph = item.id === "steam" ? "steam" : item.id === "oil" ? "oil" : "drop";
    return { family: "fluid", glyph, color, badge: "" };
  }
  if (item.kind === "form") {
    const form = item.id.split("-")[0];
    return { family: "form", glyph: FORM_GLYPH[form] || "plate", color, badge: item.symbol || "", symbol: item.symbol };
  }
  if (item.kind === "alloy") {
    return { family: "alloy", glyph: "alloy", color, badge: (item.elements || []).slice(0, 2).join("") };
  }
  if (item.kind === "organic") {
    const glyph = item.id.startsWith("alc-") ? "alcohol" : "organic";
    return { family: "organic", glyph, color, badge: "" };
  }
  if (item.kind === "polymer") {
    return { family: "polymer", glyph: "polymer", color, badge: "" };
  }
  if (item.kind === "science") {
    return { family: "science", glyph: "science", color: SCI_COLOR[item.id] || "#f472b6", badge: item.id.replace("sci-", "").slice(0, 3) };
  }
  if (item.kind === "compound") {
    if (item.id.startsWith("hydrate-")) return { family: "compound", glyph: "hydrate", color, badge: "" };
    if (item.id.startsWith("pure-")) return { family: "form", glyph: "crystal", color, badge: item.elements?.[0] || "" };
    const prefix = item.id.split("-")[0];
    return { family: "compound", glyph: ANION_GLYPH[prefix] || "flask", color, badge: item.elements?.[0] || "" };
  }
  if (item.glyph) {
    return { family: "named", glyph: item.glyph, color, badge: "" };
  }
  if (NAMED_GLYPH[item.id]) {
    return { family: "named", glyph: NAMED_GLYPH[item.id], color, badge: "" };
  }
  return { family: item.kind || "named", glyph: inferGlyph(item), color, badge: "" };
}

function inferGlyph(item) {
  const id = item.id || "";
  const tags = item.tags || [];
  if (id.includes("bottle") || id.includes("wine") || id.includes("beer") || id.includes("juice")) return "bottle";
  if (id.includes("can")) return "can";
  if (id.includes("circuit") || id.includes("chip") || id.includes("pcb")) return "chip";
  if (id.includes("battery")) return "battery";
  if (id.includes("glass")) return "glass";
  if (id.includes("pipe")) return "pipe";
  if (id.includes("gear")) return "gear";
  if (id.includes("motor")) return "motor";
  if (tags.includes("ácido") || id.startsWith("h")) return "acid";
  if (tags.includes("polímero")) return "polymer";
  return "box";
}

export function drawItemLogo(ctx, id, x, y, s, opts = {}) {
  const item = ITEM_BY_ID.get(id);
  const spec = logoSpec(item || id);
  const pad = Math.max(1, s * 0.06);
  roundRect(ctx, x, y, s, s, s * 0.16);
  ctx.fillStyle = "#0b1220";
  ctx.fill();
  ctx.strokeStyle = spec.color;
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.stroke();

  if (spec.family === "element" && spec.symbol) {
    drawElementCard(ctx, x, y, s, spec.symbol, opts.colorblind);
    return;
  }

  const cx = x + s / 2;
  const cy = y + s / 2;
  const g = s * 0.72;
  drawGlyph(ctx, spec.glyph, spec.color, cx, cy, g);

  if (spec.badge && spec.family !== "science") {
    ctx.fillStyle = spec.color;
    ctx.font = `700 ${Math.max(6, s * 0.2)}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(spec.badge, x + s - pad * 1.4, y + s - pad);
  }
  if (spec.family === "science") {
    ctx.fillStyle = "#0b1220";
    ctx.font = `700 ${Math.max(6, s * 0.18)}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((spec.badge || "sci").toUpperCase(), cx, cy + s * 0.18);
  }
  if (opts.colorblind) {
    ctx.fillStyle = spec.color;
    drawShape(ctx, x + s * 0.78, y + s * 0.2, s * 0.08, familyShape(spec.family));
  }
}

function familyShape(family) {
  if (family === "ore") return "diamond";
  if (family === "fluid") return "circle";
  if (family === "form") return "square";
  if (family === "compound") return "tri";
  if (family === "organic" || family === "polymer") return "hex";
  if (family === "science") return "star";
  return "round";
}

export function drawElementCard(ctx, x, y, s, symbol, colorblind = false) {
  const el = ELEMENT_BY_SYMBOL[symbol];
  const color = el?.color ?? "#94a3b8";
  const shape = SHAPE[el?.category] || "circle";
  ctx.fillStyle = "#0b1220";
  roundRect(ctx, x, y, s, s, s * 0.12);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.stroke();
  if (colorblind) {
    ctx.fillStyle = color;
    drawShape(ctx, x + s * 0.72, y + s * 0.22, s * 0.16, shape);
  }
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `600 ${Math.max(7, s * 0.2)}px "IBM Plex Sans", sans-serif`;
  ctx.fillText(el?.z ?? "", x + s * 0.1, y + s * 0.08);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.max(11, s * 0.38)}px "IBM Plex Sans", sans-serif`;
  ctx.fillText(symbol, x + s * 0.5, y + s * 0.58);
}

export function drawFactoryLogo(ctx, type, x, y, size, extras = {}) {
  const def = BUILDINGS[type];
  if (!def) return;
  const pad = size * 0.05;
  const tick = extras.tick || 0;
  roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.16);
  ctx.fillStyle = mixHex(def.color, "#0b1220", 0.28);
  ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.stroke();
  ctx.fillStyle = def.color;
  ctx.globalAlpha = 0.9;
  roundRect(ctx, x + pad, y + pad, size - pad * 2, size * 0.16, size * 0.1);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cx = x + size / 2;
  const cy = y + size / 2 + size * 0.05;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = Math.max(1.8, size * 0.045);
  ctx.shadowColor = def.color;
  ctx.shadowBlur = size * 0.08;
  drawFactoryGlyph(ctx, type, size * 1.15, tick, extras);
  ctx.restore();
}

function mixHex(color, base, amount) {
  const c = parseHex(color);
  const b = parseHex(base);
  if (!c || !b) return base;
  const m = (a, d) => Math.round(a * amount + d * (1 - amount));
  return `rgb(${m(c[0], b[0])},${m(c[1], b[1])},${m(c[2], b[2])})`;
}

function parseHex(hex) {
  const h = (hex || "").replace("#", "");
  if (h.length !== 6) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function drawFactoryGlyph(ctx, type, size, tick, extras) {
  const def = BUILDINGS[type];
  const kind = def?.visual || type;
  const s = size;
  if (kind === "extractor") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.18);
    ctx.lineTo(0, -s * 0.22);
    ctx.lineTo(s * 0.2, s * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.03, -s * 0.02, s * 0.06, s * 0.16);
  } else if (kind === "belt" || type === "splitter" || type === "filter" || type === "underground") {
    const dir = extras.dir ?? 0;
    const ang = (dir * Math.PI) / 2;
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, -s * 0.1);
    ctx.lineTo(s * 0.12, 0);
    ctx.lineTo(-s * 0.18, s * 0.1);
    ctx.closePath();
    ctx.fill();
    if (type === "splitter") {
      ctx.beginPath();
      ctx.moveTo(-s * 0.04, 0);
      ctx.lineTo(s * 0.16, -s * 0.14);
      ctx.moveTo(-s * 0.04, 0);
      ctx.lineTo(s * 0.16, s * 0.14);
      ctx.stroke();
    } else if (type === "filter") {
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.14);
      ctx.lineTo(s * 0.1, -s * 0.14);
      ctx.lineTo(s * 0.02, s * 0.12);
      ctx.lineTo(-s * 0.02, s * 0.12);
      ctx.closePath();
      ctx.stroke();
    } else if (type === "underground") {
      ctx.fillRect(-s * 0.2, -s * 0.06, s * 0.4, s * 0.12);
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(-s * 0.08, -s * 0.04, s * 0.16, s * 0.08);
    }
  } else if (kind === "furnace" || kind === "blast") {
    ctx.fillRect(-s * 0.16, -s * 0.04, s * 0.32, s * 0.2);
    if (kind === "blast") ctx.fillRect(-s * 0.1, -s * 0.22, s * 0.2, s * 0.18);
    ctx.fillStyle = `rgba(251, 146, 60, ${0.45 + 0.4 * Math.sin(tick / 6)})`;
    ctx.fillRect(-s * 0.1, 0.02 * s, s * 0.2, s * 0.1);
  } else if (kind === "coalGen") {
    ctx.fillRect(-s * 0.16, -s * 0.02, s * 0.32, s * 0.18);
    ctx.fillRect(s * 0.04, -s * 0.22, s * 0.1, s * 0.2);
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.26, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (kind === "pump") {
    ctx.fillRect(-s * 0.04, -s * 0.2, s * 0.08, s * 0.28);
    ctx.beginPath();
    ctx.arc(0, s * 0.12, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.beginPath();
    ctx.arc(0, s * 0.12, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "reactor") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.16);
    ctx.lineTo(s * 0.1, -s * 0.16);
    ctx.lineTo(s * 0.16, s * 0.16);
    ctx.lineTo(-s * 0.16, s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(167, 139, 250, 0.5)";
    ctx.fillRect(-s * 0.08, 0, s * 0.16, s * 0.12);
  } else if (kind === "electrolyzer") {
    ctx.fillRect(-s * 0.18, s * 0.04, s * 0.36, s * 0.12);
    ctx.fillRect(-s * 0.1, -s * 0.16, s * 0.05, s * 0.22);
    ctx.fillRect(s * 0.05, -s * 0.16, s * 0.05, s * 0.22);
    ctx.fillStyle = "#38bdf8";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(-s * 0.16, s * 0.06, s * 0.32, s * 0.08);
    ctx.globalAlpha = 1;
  } else if (kind === "assembler") {
    ctx.fillRect(-s * 0.16, s * 0.06, s * 0.32, s * 0.1);
    ctx.fillRect(-s * 0.03, -s * 0.16, s * 0.06, s * 0.24);
    ctx.fillRect(0, -s * 0.18, s * 0.16, s * 0.05);
    ctx.beginPath();
    ctx.arc(s * 0.16, -s * 0.16, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "lab") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.18);
    ctx.lineTo(s * 0.1, -s * 0.18);
    ctx.lineTo(s * 0.16, s * 0.16);
    ctx.lineTo(-s * 0.16, s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.04, -s * 0.08, s * 0.08, s * 0.16);
  } else if (kind === "chest") {
    ctx.fillRect(-s * 0.18, -s * 0.12, s * 0.36, s * 0.26);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.14, -s * 0.02, s * 0.28, s * 0.05);
  } else if (kind === "port") {
    ctx.fillRect(-s * 0.2, s * 0.02, s * 0.4, s * 0.12);
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, s * 0.02);
    ctx.lineTo(0, -s * 0.16);
    ctx.lineTo(s * 0.16, s * 0.02);
    ctx.fill();
    ctx.fillRect(-s * 0.03, -s * 0.22, s * 0.06, s * 0.12);
  } else if (kind === "solar") {
    ctx.fillRect(-s * 0.2, -s * 0.14, s * 0.4, s * 0.28);
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, 0);
    ctx.lineTo(s * 0.2, 0);
    ctx.moveTo(0, -s * 0.14);
    ctx.lineTo(0, s * 0.14);
    ctx.stroke();
  } else if (kind === "nuclear") {
    ctx.beginPath();
    ctx.arc(-s * 0.08, s * 0.08, s * 0.08, 0, Math.PI * 2);
    ctx.arc(s * 0.1, s * 0.08, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.04, -s * 0.18, s * 0.08, s * 0.2);
    ctx.beginPath();
    ctx.arc(0, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "refinery") {
    ctx.fillRect(-s * 0.18, s * 0.04, s * 0.36, s * 0.12);
    ctx.fillRect(-s * 0.14, -s * 0.2, s * 0.08, s * 0.26);
    ctx.fillRect(0.04 * s, -s * 0.12, s * 0.1, s * 0.18);
  } else if (type === "greenhouse") {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(s * 0.2, 0);
    ctx.lineTo(s * 0.2, s * 0.16);
    ctx.lineTo(-s * 0.2, s * 0.16);
    ctx.lineTo(-s * 0.2, 0);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "wind") {
    ctx.fillRect(-s * 0.03, -s * 0.04, s * 0.06, s * 0.22);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.04);
    ctx.lineTo(s * 0.2, -s * 0.16);
    ctx.moveTo(0, -s * 0.04);
    ctx.lineTo(-s * 0.18, -s * 0.14);
    ctx.moveTo(0, -s * 0.04);
    ctx.lineTo(0.02 * s, s * 0.18);
    ctx.stroke();
  } else if (type === "pharma" || type === "distillery") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.18);
    ctx.lineTo(s * 0.08, -s * 0.18);
    ctx.lineTo(s * 0.14, s * 0.16);
    ctx.lineTo(-s * 0.14, s * 0.16);
    ctx.closePath();
    ctx.fill();
  } else if (type === "chipFab" || type === "printer") {
    ctx.fillRect(-s * 0.16, -s * 0.16, s * 0.32, s * 0.32);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.08, -s * 0.08, s * 0.16, s * 0.16);
  } else if (type === "recycler") {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0.4, Math.PI * 1.6);
    ctx.stroke();
  } else if (type === "shipyard" || type === "welder") {
    ctx.fillRect(-s * 0.2, s * 0.04, s * 0.4, s * 0.1);
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, s * 0.04);
    ctx.lineTo(0, -s * 0.16);
    ctx.lineTo(s * 0.12, s * 0.04);
    ctx.fill();
  } else {
    ctx.font = `${Math.max(14, s * 0.32)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BUILDINGS[type]?.icon || "?", 0, 0);
  }
  if (def?.tier > 1) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f8fafc";
    ctx.font = `700 ${Math.max(9, s * 0.2)}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(def.tier), s * 0.24, -s * 0.22);
  }
}

function drawGlyph(ctx, glyph, color, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, s * 0.08);
  const g = glyphDrawers[glyph] || glyphDrawers.box;
  g(ctx, s, color);
  ctx.restore();
}

const glyphDrawers = {
  box(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.22, s * 0.44, s * 0.44);
  },
  ingot(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, -s * 0.08);
    ctx.lineTo(s * 0.2, -s * 0.16);
    ctx.lineTo(s * 0.28, s * 0.14);
    ctx.lineTo(-s * 0.2, s * 0.2);
    ctx.closePath();
    ctx.fill();
  },
  plate(ctx, s) {
    ctx.fillRect(-s * 0.3, -s * 0.16, s * 0.6, s * 0.32);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    ctx.fillRect(-s * 0.28, -s * 0.14, s * 0.2, s * 0.06);
    ctx.globalAlpha = 1;
  },
  wire(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, 0);
    for (let i = 0; i <= 6; i++) {
      ctx.lineTo(-s * 0.32 + (s * 0.64 * i) / 6, Math.sin(i) * s * 0.12);
    }
    ctx.stroke();
  },
  powder(ctx, s) {
    for (const [dx, r] of [[-0.16, 0.12], [0.02, 0.16], [0.2, 0.1]]) {
      ctx.beginPath();
      ctx.arc(s * dx, s * 0.08, s * r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  foil(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, -s * 0.18);
    ctx.lineTo(s * 0.1, -s * 0.22);
    ctx.lineTo(s * 0.28, s * 0.16);
    ctx.lineTo(-s * 0.08, s * 0.2);
    ctx.closePath();
    ctx.fill();
  },
  rod(ctx, s) {
    ctx.fillRect(-s * 0.08, -s * 0.3, s * 0.16, s * 0.6);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.3, s * 0.08, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  pellet(ctx, s) {
    for (const [dx, dy] of [[-0.14, -0.08], [0.12, -0.1], [0, 0.12]]) {
      ctx.beginPath();
      ctx.arc(s * dx, s * dy, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  coil(ctx, s) {
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      const t = i / 18;
      const a = t * Math.PI * 4;
      const r = s * (0.08 + t * 0.22);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  },
  bolt(ctx, s) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = Math.cos(a) * s * 0.16;
      const y = Math.sin(a) * s * 0.16 - s * 0.12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-s * 0.06, -s * 0.02, s * 0.12, s * 0.28);
  },
  ore(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.28);
    ctx.lineTo(s * 0.24, -s * 0.06);
    ctx.lineTo(s * 0.16, s * 0.22);
    ctx.lineTo(-s * 0.2, s * 0.2);
    ctx.lineTo(-s * 0.26, -s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.16);
    ctx.lineTo(s * 0.1, 0);
    ctx.lineTo(-s * 0.04, s * 0.04);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  drop(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.28);
    ctx.quadraticCurveTo(s * 0.24, s * 0.02, 0, s * 0.26);
    ctx.quadraticCurveTo(-s * 0.24, s * 0.02, 0, -s * 0.28);
    ctx.fill();
  },
  steam(ctx, s) {
    for (const [dx, dy] of [[-0.14, 0.08], [0.02, -0.04], [0.16, 0.1]]) {
      ctx.beginPath();
      ctx.ellipse(s * dx, s * dy, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  oil(ctx, s, color) {
    glyphDrawers.drop(ctx, s, color);
    ctx.fillStyle = "#0b1220";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-s * 0.08, -s * 0.04, s * 0.16, s * 0.16);
    ctx.globalAlpha = 1;
  },
  flask(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.28);
    ctx.lineTo(s * 0.08, -s * 0.28);
    ctx.lineTo(s * 0.08, -s * 0.08);
    ctx.lineTo(s * 0.22, s * 0.24);
    ctx.lineTo(-s * 0.22, s * 0.24);
    ctx.lineTo(-s * 0.08, -s * 0.08);
    ctx.closePath();
    ctx.fill();
  },
  acid(ctx, s, color) {
    glyphDrawers.flask(ctx, s, color);
    ctx.strokeStyle = "#fb7185";
    ctx.beginPath();
    ctx.moveTo(s * 0.16, -s * 0.22);
    ctx.lineTo(s * 0.26, -s * 0.08);
    ctx.stroke();
  },
  oxide(ctx, s, color) {
    glyphDrawers.flask(ctx, s, color);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  hydroxide: (ctx, s, c) => glyphDrawers.flask(ctx, s, c),
  salt(ctx, s) {
    ctx.beginPath();
    ctx.rect(-s * 0.14, -s * 0.14, s * 0.28, s * 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, 0);
    ctx.lineTo(s * 0.14, 0);
    ctx.moveTo(0, -s * 0.14);
    ctx.lineTo(0, s * 0.14);
    ctx.stroke();
  },
  sulfate: (ctx, s, c) => glyphDrawers.flask(ctx, s, c),
  nitrate: (ctx, s, c) => glyphDrawers.flask(ctx, s, c),
  carbonate: (ctx, s, c) => glyphDrawers.rock(ctx, s, c),
  phosphate: (ctx, s, c) => glyphDrawers.flask(ctx, s, c),
  sulfide: (ctx, s, c) => glyphDrawers.ore(ctx, s, c),
  nitride: (ctx, s, c) => glyphDrawers.crystal(ctx, s, c),
  carbide: (ctx, s, c) => glyphDrawers.pellet(ctx, s, c),
  hydride: (ctx, s, c) => glyphDrawers.gas(ctx, s, c),
  silicate: (ctx, s, c) => glyphDrawers.rock(ctx, s, c),
  acetate: (ctx, s, c) => glyphDrawers.organic(ctx, s, c),
  hydrate(ctx, s, color) {
    glyphDrawers.flask(ctx, s, color);
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(s * 0.18, -s * 0.18, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  crystal(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(s * 0.2, 0);
    ctx.lineTo(0, s * 0.3);
    ctx.lineTo(-s * 0.2, 0);
    ctx.closePath();
    ctx.fill();
  },
  rock(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.16);
    ctx.lineTo(-s * 0.1, -s * 0.18);
    ctx.lineTo(s * 0.16, -s * 0.1);
    ctx.lineTo(s * 0.22, s * 0.18);
    ctx.closePath();
    ctx.fill();
  },
  alloy(ctx, s, color) {
    ctx.fillRect(-s * 0.28, -s * 0.12, s * 0.28, s * 0.28);
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = shade(color, 50);
    ctx.fillRect(0, -s * 0.12, s * 0.28, s * 0.28);
    ctx.globalAlpha = 1;
  },
  organic(ctx, s) {
    hex(ctx, 0, 0, s * 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  },
  alcohol(ctx, s, color) {
    glyphDrawers.flask(ctx, s, color);
    ctx.font = `700 ${s * 0.28}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#0b1220";
    ctx.fillText("OH", 0, s * 0.08);
  },
  polymer(ctx, s) {
    for (const dx of [-0.18, 0, 0.18]) {
      ctx.beginPath();
      ctx.arc(s * dx, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, 0);
    ctx.lineTo(s * 0.18, 0);
    ctx.stroke();
  },
  science(ctx, s, color) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, -s * 0.22);
    ctx.lineTo(s * 0.16, -s * 0.22);
    ctx.lineTo(s * 0.2, s * 0.06);
    ctx.lineTo(0, s * 0.26);
    ctx.lineTo(-s * 0.2, s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(color, 40);
    ctx.fillRect(-s * 0.08, -s * 0.1, s * 0.16, s * 0.12);
  },
  gear(ctx, s) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.lineTo(Math.cos(a) * s * 0.28, Math.sin(a) * s * 0.28);
      ctx.lineTo(Math.cos(a + 0.2) * s * 0.18, Math.sin(a + 0.2) * s * 0.18);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  },
  motor(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.14, s * 0.4, s * 0.28);
    ctx.fillRect(s * 0.2, -s * 0.06, s * 0.1, s * 0.12);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-s * 0.08, -s * 0.2, s * 0.05, s * 0.08);
  },
  pipe(ctx, s) {
    ctx.fillRect(-s * 0.3, -s * 0.08, s * 0.6, s * 0.16);
    ctx.beginPath();
    ctx.ellipse(-s * 0.3, 0, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.3, 0, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  glass(ctx, s) {
    ctx.globalAlpha = 0.85;
    ctx.fillRect(-s * 0.2, -s * 0.22, s * 0.4, s * 0.44);
    ctx.strokeRect(-s * 0.2, -s * 0.22, s * 0.4, s * 0.44);
    ctx.globalAlpha = 1;
  },
  brick(ctx, s) {
    ctx.fillRect(-s * 0.26, -s * 0.18, s * 0.24, s * 0.14);
    ctx.fillRect(s * 0.02, -s * 0.18, s * 0.24, s * 0.14);
    ctx.fillRect(-s * 0.14, 0, s * 0.28, s * 0.14);
  },
  chip(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.16, s * 0.4, s * 0.32);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.1, -s * 0.06, s * 0.2, s * 0.12);
    ctx.fillStyle = "#fbbf24";
    for (const dx of [-0.22, 0.18]) ctx.fillRect(s * dx, -s * 0.1, s * 0.04, s * 0.2);
  },
  battery(ctx, s) {
    ctx.fillRect(-s * 0.14, -s * 0.18, s * 0.28, s * 0.4);
    ctx.fillRect(-s * 0.06, -s * 0.26, s * 0.12, s * 0.08);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.1, -s * 0.04, s * 0.2, s * 0.04);
  },
  magnet(ctx, s) {
    ctx.lineWidth = s * 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.fillRect(-s * 0.28, s * 0.04, s * 0.12, s * 0.16);
    ctx.fillRect(s * 0.16, s * 0.04, s * 0.12, s * 0.16);
  },
  wafer(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, 0);
    ctx.lineTo(s * 0.18, 0);
    ctx.moveTo(0, -s * 0.18);
    ctx.lineTo(0, s * 0.18);
    ctx.stroke();
  },
  bottle(ctx, s) {
    ctx.fillRect(-s * 0.06, -s * 0.3, s * 0.12, s * 0.12);
    ctx.fillRect(-s * 0.14, -s * 0.16, s * 0.28, s * 0.42);
  },
  can(ctx, s) {
    ctx.fillRect(-s * 0.14, -s * 0.2, s * 0.28, s * 0.4);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.2, s * 0.14, s * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  car(ctx, s) {
    ctx.fillRect(-s * 0.26, -s * 0.04, s * 0.52, s * 0.16);
    ctx.fillRect(-s * 0.1, -s * 0.16, s * 0.28, s * 0.14);
    ctx.beginPath();
    ctx.arc(-s * 0.14, s * 0.14, s * 0.07, 0, Math.PI * 2);
    ctx.arc(s * 0.16, s * 0.14, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  },
  bus(ctx, s, c) {
    ctx.fillRect(-s * 0.28, -s * 0.16, s * 0.56, s * 0.28);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.2, -s * 0.1, s * 0.12, s * 0.1);
    ctx.fillRect(0, -s * 0.1, s * 0.12, s * 0.1);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(-s * 0.16, s * 0.14, s * 0.06, 0, Math.PI * 2);
    ctx.arc(s * 0.16, s * 0.14, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  },
  bike(ctx, s) {
    ctx.beginPath();
    ctx.arc(-s * 0.16, s * 0.08, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.16, s * 0.08, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, s * 0.08);
    ctx.lineTo(0, -s * 0.08);
    ctx.lineTo(s * 0.16, s * 0.08);
    ctx.stroke();
  },
  train(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.14, s * 0.56, s * 0.22);
    ctx.fillRect(-s * 0.28, -s * 0.22, s * 0.16, s * 0.1);
    ctx.fillRect(-s * 0.22, s * 0.1, s * 0.08, s * 0.08);
    ctx.fillRect(s * 0.08, s * 0.1, s * 0.08, s * 0.08);
  },
  ship(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.04);
    ctx.lineTo(s * 0.28, s * 0.04);
    ctx.lineTo(s * 0.16, s * 0.2);
    ctx.lineTo(-s * 0.16, s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-s * 0.04, -s * 0.18, s * 0.08, s * 0.22);
  },
  plane(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.04, s * 0.56, s * 0.08);
    ctx.fillRect(-s * 0.04, -s * 0.16, s * 0.08, s * 0.32);
    ctx.fillRect(s * 0.16, -s * 0.12, s * 0.08, s * 0.08);
  },
  drone(ctx, s) {
    ctx.fillRect(-s * 0.1, -s * 0.06, s * 0.2, s * 0.12);
    for (const [dx, dy] of [[-0.22, -0.16], [0.22, -0.16], [-0.22, 0.16], [0.22, 0.16]]) {
      ctx.beginPath();
      ctx.arc(s * dx, s * dy, s * 0.07, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  robot(ctx, s) {
    ctx.fillRect(-s * 0.12, -s * 0.22, s * 0.24, s * 0.16);
    ctx.fillRect(-s * 0.16, -s * 0.04, s * 0.32, s * 0.24);
    ctx.fillRect(-s * 0.22, 0, s * 0.06, s * 0.16);
    ctx.fillRect(s * 0.16, 0, s * 0.06, s * 0.16);
  },
  phone(ctx, s) {
    ctx.fillRect(-s * 0.12, -s * 0.26, s * 0.24, s * 0.52);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.08, -s * 0.18, s * 0.16, s * 0.32);
  },
  radio(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.08, s * 0.4, s * 0.24);
    ctx.fillRect(-s * 0.02, -s * 0.26, s * 0.04, s * 0.18);
    ctx.beginPath();
    ctx.arc(-s * 0.08, 0.04 * s, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  },
  antenna(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.24);
    ctx.lineTo(0, -s * 0.24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, -s * 0.08);
    ctx.lineTo(0, -s * 0.2);
    ctx.lineTo(s * 0.16, -s * 0.08);
    ctx.stroke();
  },
  server(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.22, s * 0.4, s * 0.14);
    ctx.fillRect(-s * 0.2, -s * 0.04, s * 0.4, s * 0.14);
    ctx.fillRect(-s * 0.2, s * 0.14, s * 0.4, s * 0.1);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(s * 0.1, -s * 0.18, s * 0.04, s * 0.04);
  },
  solar(ctx, s) {
    ctx.fillRect(-s * 0.24, -s * 0.16, s * 0.48, s * 0.32);
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.16);
    ctx.lineTo(0, s * 0.16);
    ctx.moveTo(-s * 0.24, 0);
    ctx.lineTo(s * 0.24, 0);
    ctx.stroke();
  },
  turbine(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 3);
      ctx.fillRect(-s * 0.04, -s * 0.28, s * 0.08, s * 0.22);
      ctx.restore();
    }
  },
  tire(ctx, s) {
    ctx.lineWidth = s * 0.12;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  chassis(ctx, s) {
    ctx.strokeRect(-s * 0.26, -s * 0.12, s * 0.52, s * 0.24);
    ctx.fillRect(-s * 0.22, -s * 0.04, s * 0.44, s * 0.08);
  },
  fabric(ctx, s) {
    ctx.fillRect(-s * 0.24, -s * 0.2, s * 0.48, s * 0.4);
    ctx.strokeStyle = "#0b1220";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 0.08 * i, -s * 0.2);
      ctx.lineTo(s * 0.08 * i, s * 0.2);
      ctx.stroke();
    }
  },
  fiber(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.24, s * 0.16);
    ctx.quadraticCurveTo(0, -s * 0.28, s * 0.24, s * 0.16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.2);
    ctx.quadraticCurveTo(0, -s * 0.16, s * 0.2, s * 0.2);
    ctx.stroke();
  },
  dye(ctx, s, color) {
    glyphDrawers.drop(ctx, s, color);
    ctx.fillRect(-s * 0.16, s * 0.16, s * 0.32, s * 0.08);
  },
  paint(ctx, s, color) {
    ctx.fillRect(-s * 0.16, -s * 0.04, s * 0.32, s * 0.24);
    ctx.fillStyle = shade(color, 40);
    ctx.beginPath();
    ctx.arc(0, -s * 0.12, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  },
  ink(ctx, s, color) {
    glyphDrawers.drop(ctx, s, color);
  },
  tile(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.22, s * 0.2, s * 0.2);
    ctx.fillRect(s * 0.02, -s * 0.22, s * 0.2, s * 0.2);
    ctx.fillRect(-s * 0.22, 0.02 * s, s * 0.2, s * 0.2);
    ctx.fillRect(s * 0.02, 0.02 * s, s * 0.2, s * 0.2);
  },
  paper(ctx, s) {
    ctx.fillRect(-s * 0.18, -s * 0.24, s * 0.36, s * 0.48);
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.1);
    ctx.lineTo(s * 0.1, -s * 0.1);
    ctx.moveTo(-s * 0.1, 0);
    ctx.lineTo(s * 0.08, 0);
    ctx.stroke();
  },
  pill(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(-s * 0.08, 0, s * 0.16, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(s * 0.08, 0, s * 0.16, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  vial(ctx, s) {
    ctx.fillRect(-s * 0.08, -s * 0.26, s * 0.16, s * 0.1);
    ctx.fillRect(-s * 0.12, -s * 0.16, s * 0.24, s * 0.4);
  },
  syringe(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.05, s * 0.4, s * 0.1);
    ctx.fillRect(s * 0.12, -s * 0.02, s * 0.16, s * 0.04);
    ctx.fillRect(-s * 0.32, -s * 0.1, s * 0.08, s * 0.2);
  },
  drip(ctx, s, color) {
    glyphDrawers.drop(ctx, s, color);
    ctx.fillRect(-s * 0.04, -s * 0.32, s * 0.08, s * 0.12);
  },
  mask(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.26, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, 0);
    ctx.lineTo(-s * 0.34, -s * 0.08);
    ctx.moveTo(s * 0.26, 0);
    ctx.lineTo(s * 0.34, -s * 0.08);
    ctx.stroke();
  },
  glove(ctx, s) {
    ctx.fillRect(-s * 0.1, -s * 0.08, s * 0.2, s * 0.28);
    ctx.fillRect(-s * 0.2, -s * 0.16, s * 0.12, s * 0.18);
    ctx.fillRect(s * 0.08, -s * 0.16, s * 0.12, s * 0.18);
  },
  bandage(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.08, s * 0.56, s * 0.16);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.06, -s * 0.08, s * 0.12, s * 0.16);
  },
  implant(ctx, s) {
    ctx.fillRect(-s * 0.06, -s * 0.24, s * 0.12, s * 0.48);
    ctx.fillRect(-s * 0.16, -s * 0.08, s * 0.32, s * 0.12);
  },
  mri(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  },
  gas(ctx, s) {
    ctx.beginPath();
    ctx.arc(-s * 0.08, 0, s * 0.12, 0, Math.PI * 2);
    ctx.arc(s * 0.1, -s * 0.06, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.04, s * 0.1, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  },
  tank(ctx, s) {
    ctx.fillRect(-s * 0.16, -s * 0.22, s * 0.32, s * 0.46);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.22, s * 0.16, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  fuel(ctx, s, color) {
    glyphDrawers.pellet(ctx, s, color);
    ctx.strokeRect(-s * 0.2, -s * 0.22, s * 0.4, s * 0.44);
  },
  catalyst(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  superwire(ctx, s, color) {
    ctx.strokeStyle = "#38bdf8";
    glyphDrawers.wire(ctx, s, color);
  },
  core(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.font = `700 ${s * 0.28}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", 0, 1);
  },
  beam(ctx, s) {
    ctx.fillRect(-s * 0.3, -s * 0.08, s * 0.6, s * 0.16);
    ctx.fillRect(-s * 0.3, -s * 0.16, s * 0.08, s * 0.32);
    ctx.fillRect(s * 0.22, -s * 0.16, s * 0.08, s * 0.32);
  },
  rail(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.06, s * 0.56, s * 0.08);
    ctx.fillRect(-s * 0.2, s * 0.06, s * 0.08, s * 0.1);
    ctx.fillRect(s * 0.12, s * 0.06, s * 0.08, s * 0.1);
  },
  asphalt(ctx, s) {
    ctx.fillRect(-s * 0.28, -s * 0.08, s * 0.56, s * 0.16);
    ctx.strokeStyle = "#fbbf24";
    ctx.setLineDash([s * 0.08, s * 0.08]);
    ctx.beginPath();
    ctx.moveTo(-s * 0.24, 0);
    ctx.lineTo(s * 0.24, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  container(ctx, s) {
    ctx.fillRect(-s * 0.26, -s * 0.16, s * 0.52, s * 0.32);
    ctx.strokeStyle = "#0b1220";
    ctx.strokeRect(-s * 0.1, -s * 0.16, s * 0.2, s * 0.32);
  },
  fertilizer(ctx, s) {
    ctx.fillRect(-s * 0.16, -s * 0.04, s * 0.32, s * 0.24);
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.04);
    ctx.lineTo(0, -s * 0.24);
    ctx.lineTo(s * 0.1, -s * 0.04);
    ctx.fill();
  },
  spray(ctx, s) {
    ctx.fillRect(-s * 0.1, -s * 0.08, s * 0.2, s * 0.28);
    ctx.fillRect(-s * 0.04, -s * 0.24, s * 0.08, s * 0.16);
    ctx.beginPath();
    ctx.arc(s * 0.16, -s * 0.2, s * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  },
  leaf(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.14, s * 0.26, -0.4, 0, Math.PI * 2);
    ctx.fill();
  },
  soap(ctx, s) {
    roundRect(ctx, -s * 0.22, -s * 0.12, s * 0.44, s * 0.24, s * 0.08);
    ctx.fill();
  },
  olive(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, s * 0.04, s * 0.12, s * 0.18, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.02, -s * 0.22, s * 0.04, s * 0.12);
  },
  fish(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.2, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.16, 0);
    ctx.lineTo(s * 0.3, -s * 0.12);
    ctx.lineTo(s * 0.3, s * 0.12);
    ctx.fill();
  },
  wine(ctx, s, color) {
    glyphDrawers.bottle(ctx, s, color);
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(-s * 0.1, -s * 0.02, s * 0.2, s * 0.24);
  },
  beer(ctx, s, color) {
    glyphDrawers.bottle(ctx, s, color);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-s * 0.1, 0, s * 0.2, s * 0.22);
  },
  bread(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.26, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  cheese(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.16);
    ctx.lineTo(s * 0.22, s * 0.16);
    ctx.lineTo(s * 0.04, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0b1220";
    ctx.beginPath();
    ctx.arc(0, 0.02 * s, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
  },
  window(ctx, s) {
    ctx.strokeRect(-s * 0.2, -s * 0.22, s * 0.4, s * 0.44);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.22);
    ctx.lineTo(0, s * 0.22);
    ctx.moveTo(-s * 0.2, 0);
    ctx.lineTo(s * 0.2, 0);
    ctx.stroke();
  },
  door(ctx, s) {
    ctx.fillRect(-s * 0.16, -s * 0.26, s * 0.32, s * 0.52);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(s * 0.08, 0, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
  },
  insulation(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.2, s * 0.44, s * 0.4);
    ctx.strokeStyle = "#0b1220";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.22, -s * 0.16 + i * s * 0.1);
      ctx.lineTo(s * 0.22, -s * 0.08 + i * s * 0.1);
      ctx.stroke();
    }
  },
  hull(ctx, s, c) {
    glyphDrawers.ship(ctx, s, c);
  },
  crane(ctx, s) {
    ctx.fillRect(-s * 0.04, -s * 0.24, s * 0.08, s * 0.48);
    ctx.fillRect(-s * 0.04, -s * 0.24, s * 0.32, s * 0.06);
    ctx.fillRect(s * 0.24, -s * 0.18, s * 0.04, s * 0.16);
  },
  lens(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
  laser(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.06, s * 0.28, s * 0.12);
    ctx.fillStyle = "#fb7185";
    ctx.fillRect(s * 0.06, -s * 0.02, s * 0.24, s * 0.04);
  },
  watch(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 0.12);
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.1, 0.04 * s);
    ctx.stroke();
  },
  satellite(ctx, s) {
    ctx.fillRect(-s * 0.08, -s * 0.08, s * 0.16, s * 0.16);
    ctx.fillRect(-s * 0.28, -s * 0.04, s * 0.16, s * 0.08);
    ctx.fillRect(s * 0.12, -s * 0.04, s * 0.16, s * 0.08);
  },
  display(ctx, s) {
    ctx.fillRect(-s * 0.24, -s * 0.16, s * 0.48, s * 0.28);
    ctx.fillRect(-s * 0.04, s * 0.12, s * 0.08, s * 0.1);
  },
  led(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, -s * 0.04, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.04, s * 0.08, s * 0.03, s * 0.14);
    ctx.fillRect(s * 0.02, s * 0.08, s * 0.03, s * 0.14);
  },
  sensor(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  },
  inverter(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.16, s * 0.4, s * 0.32);
    ctx.font = `700 ${s * 0.22}px "IBM Plex Sans", sans-serif`;
    ctx.fillStyle = "#0b1220";
    ctx.textAlign = "center";
    ctx.fillText("~", 0, s * 0.04);
  },
  charger(ctx, s) {
    ctx.fillRect(-s * 0.1, -s * 0.2, s * 0.2, s * 0.36);
    ctx.fillRect(-s * 0.16, s * 0.16, s * 0.32, s * 0.08);
  },
  fuelcell(ctx, s, c) {
    glyphDrawers.battery(ctx, s, c);
  },
  transformer(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.08, s * 0.16, s * 0.24);
    ctx.fillRect(s * 0.06, -s * 0.08, s * 0.16, s * 0.24);
    ctx.fillRect(-s * 0.08, -s * 0.02, s * 0.16, s * 0.08);
  },
  blade(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(s * 0.1, s * 0.24);
    ctx.lineTo(-s * 0.1, s * 0.24);
    ctx.closePath();
    ctx.fill();
  },
  scrap(ctx, s) {
    ctx.fillRect(-s * 0.2, -s * 0.1, s * 0.22, s * 0.16);
    ctx.fillRect(0, 0, s * 0.2, s * 0.14);
    ctx.fillRect(-s * 0.04, -s * 0.2, s * 0.16, s * 0.1);
  },
  recycle(ctx, s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0.2, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.16);
    ctx.lineTo(s * 0.22, -s * 0.04);
    ctx.lineTo(s * 0.04, -s * 0.04);
    ctx.fill();
  },
  membrane(ctx, s) {
    ctx.strokeRect(-s * 0.22, -s * 0.2, s * 0.44, s * 0.4);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.1 + i * s * 0.1);
      ctx.lineTo(s * 0.18, -s * 0.1 + i * s * 0.1);
      ctx.stroke();
    }
  },
  neon(ctx, s) {
    ctx.strokeRect(-s * 0.24, -s * 0.14, s * 0.48, s * 0.28);
    ctx.font = `700 ${s * 0.22}px "IBM Plex Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Ne", 0, s * 0.04);
  },
  weld(ctx, s) {
    ctx.fillRect(-s * 0.24, s * 0.08, s * 0.48, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, s * 0.08);
    ctx.lineTo(s * 0.16, -s * 0.2);
    ctx.stroke();
  },
  kit(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.1, s * 0.44, s * 0.28);
    ctx.fillRect(-s * 0.08, -s * 0.2, s * 0.16, s * 0.12);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(-s * 0.12, 0, s * 0.24, s * 0.05);
  },
  crate(ctx, s) {
    ctx.fillRect(-s * 0.22, -s * 0.16, s * 0.44, s * 0.36);
    ctx.strokeStyle = "#0b1220";
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.16);
    ctx.lineTo(s * 0.22, s * 0.2);
    ctx.moveTo(s * 0.22, -s * 0.16);
    ctx.lineTo(-s * 0.22, s * 0.2);
    ctx.stroke();
  },
  pallet(ctx, s) {
    ctx.fillRect(-s * 0.26, -s * 0.08, s * 0.52, s * 0.06);
    ctx.fillRect(-s * 0.22, 0, s * 0.06, s * 0.14);
    ctx.fillRect(s * 0.16, 0, s * 0.06, s * 0.14);
  },
  hospital: (ctx, s, c) => glyphDrawers.kit(ctx, s, c),
};

function hex(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawShape(ctx, cx, cy, r, shape) {
  ctx.beginPath();
  if (shape === "square") ctx.rect(cx - r, cy - r, r * 2, r * 2);
  else if (shape === "diamond") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
  } else if (shape === "tri") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.closePath();
  } else if (shape === "triDown") {
    ctx.moveTo(cx - r, cy - r);
    ctx.lineTo(cx + r, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.closePath();
  } else if (shape === "hex") {
    hex(ctx, cx, cy, r);
  } else if (shape === "star") {
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (shape === "cross") {
    ctx.rect(cx - r * 0.35, cy - r, r * 0.7, r * 2);
    ctx.rect(cx - r, cy - r * 0.35, r * 2, r * 0.7);
  } else if (shape === "ring") {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.fill();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shade(hex, amt) {
  const n = String(hex || "#888888").replace("#", "");
  if (n.length < 6) return hex;
  const num = parseInt(n, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (num & 255) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const urlCache = new Map();

function makeCanvas(w, h) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function itemLogoUrl(id, size = 56) {
  const key = `i:${id}:${size}`;
  if (urlCache.has(key)) return urlCache.get(key);
  const c = makeCanvas(size, size);
  if (!c) {
    const spec = logoSpec(id);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.16}" fill="#0b1220" stroke="${spec.color}"/><text x="50%" y="54%" text-anchor="middle" fill="${spec.color}" font-size="${size * 0.32}" font-family="sans-serif">${spec.badge || spec.glyph.slice(0, 2)}</text></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    urlCache.set(key, url);
    return url;
  }
  drawItemLogo(c.getContext("2d"), id, 0, 0, size);
  const url = c.toDataURL("image/png");
  urlCache.set(key, url);
  return url;
}

export function factoryLogoUrl(type, size = 72) {
  const key = `f:${type}:${size}`;
  if (urlCache.has(key)) return urlCache.get(key);
  const c = makeCanvas(size, size);
  if (!c) {
    const def = BUILDINGS[type];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="10" fill="#101826" stroke="${def?.color || "#888"}"/><text x="50%" y="56%" text-anchor="middle" font-size="${size * 0.4}">${def?.icon || "?"}</text></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    urlCache.set(key, url);
    return url;
  }
  drawFactoryLogo(c.getContext("2d"), type, 0, 0, size, { tick: 0, dir: 0 });
  const url = c.toDataURL("image/png");
  urlCache.set(key, url);
  return url;
}

export function logoImg(id, cls = "logo") {
  if (!id) return "";
  const item = getItem(id);
  const name = item?.name || id;
  return `<img class="${cls}" alt="${name}" title="${name}" src="${itemLogoUrl(id)}" width="28" height="28" />`;
}

export function factoryImg(type, cls = "logo factory-logo") {
  const def = BUILDINGS[type];
  const name = def?.name || type;
  return `<img class="${cls}" alt="${name}" title="${name}" src="${factoryLogoUrl(type)}" width="36" height="36" />`;
}

export { CATEGORIES, SHAPE };
