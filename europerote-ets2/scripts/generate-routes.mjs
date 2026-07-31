import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isoOf } from "./pais-iso.mjs";

/**
 * EuroPerote generator v4
 * - Fewer clone routes (corridor dedupe)
 * - Tags: ferry, peaje, frontera
 * - Ida/vuelta for key nationals
 * - Only real cities (ets2.online / game)
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");
fs.mkdirSync(outDir, { recursive: true });

const stopsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/stops.json"), "utf8"));
const operator = JSON.parse(fs.readFileSync(path.join(root, "data/operator.json"), "utf8"));
const fleet = JSON.parse(fs.readFileSync(path.join(root, "data/fleet.json"), "utf8")).unidades;
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8")).tipos;
const addonsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/addons.json"), "utf8"));

const byId = Object.fromEntries(stopsDoc.stops.map((s) => [s.id, s]));
const tipoById = Object.fromEntries(lineTypes.map((t) => [t.id, t]));
const SCALE_KM = 0.019;

const reals = stopsDoc.stops.filter((s) => !s.parent && s.parada_tipo === "ciudad");
const TOLL_COUNTRIES = new Set([
  "Francia",
  "España",
  "Portugal",
  "Italia",
  "Polonia",
  "Croacia",
  "Grecia",
  "Turquía",
  "Hungría",
  "Eslovaquia",
  "Chequia",
  "Austria",
]);
const FERRY_COUNTRIES = new Set([
  "Reino Unido",
  "Irlanda",
  "Irlanda del Norte",
  "Francia",
  "Dinamarca",
  "Suecia",
  "Noruega",
  "Finlandia",
  "Alemania",
  "Países Bajos",
  "Bélgica",
  "Italia",
  "España",
  "Grecia",
  "Croacia",
  "Islandia",
  "Estonia",
  "Letonia",
  "Lituania",
  "Polonia",
  "Turquía",
  "Marruecos",
]);

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z) * SCALE_KM;
}
function pathKm(ids) {
  let k = 0;
  for (let i = 1; i < ids.length; i++) k += dist(byId[ids[i - 1]], byId[ids[i]]);
  return Math.round(k);
}
function countries(ids) {
  return [...new Set(ids.map((id) => byId[id]?.pais).filter(Boolean))];
}
function countryCodes(ids) {
  return [...new Set(ids.map((id) => isoOf(byId[id])))];
}
function uniqAddons(ids) {
  const set = new Set();
  for (const id of ids) for (const a of byId[id]?.addons || []) set.add(a);
  return [...set];
}

function pickFleet(tipoId, km) {
  const map = {
    reg: ["regional", "urbano"],
    exp: ["largo", "regional"],
    int: ["largo", "premium"],
    noc: ["largo", "premium"],
    tur: ["largo", "premium"],
    fer: ["largo", "regional"],
  };
  let pool = fleet.filter((u) => (map[tipoId] || ["regional"]).includes(u.clase));
  if (km > 800) pool = fleet.filter((u) => ["largo", "premium"].includes(u.clase));
  if (!pool.length) pool = fleet;
  return pool[Math.abs(km + tipoId.length * 17) % pool.length];
}

function pathToward(origin, dest, pool, opts = {}) {
  const {
    maxStops = 8,
    minHop = 30,
    maxHop = 320,
    minProgress = 12,
    allowHubDetour = true,
    maxDetourKm = 80,
  } = opts;
  if (!origin || !dest || origin.id === dest.id) return null;
  const straight = dist(origin, dest);
  if (straight < minHop * 0.6) return null;
  const chain = [origin.id];
  const used = new Set([origin.id, dest.id]);
  let cur = origin;
  while (chain.length < maxStops - 1) {
    const rem = dist(cur, dest);
    if (rem <= maxHop * 0.95) break;
    let best = null;
    let bestScore = Infinity;
    for (const c of pool) {
      if (used.has(c.id)) continue;
      const fromCur = dist(cur, c);
      if (fromCur < minHop || fromCur > maxHop) continue;
      const toDest = dist(c, dest);
      if (rem - toDest < minProgress) continue;
      const score = fromCur + toDest * 0.9;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (!best && allowHubDetour) {
      for (const c of pool) {
        if (used.has(c.id) || c.tier > 1) continue;
        const fromCur = dist(cur, c);
        if (fromCur < minHop || fromCur > maxDetourKm) continue;
        const toDest = dist(c, dest);
        if (toDest > rem * 1.12) continue;
        const score = fromCur * 1.15 + toDest;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
    }
    if (!best) break;
    chain.push(best.id);
    used.add(best.id);
    cur = best;
  }
  chain.push(dest.id);
  let backtracks = 0;
  for (let i = 1; i < chain.length - 1; i++) {
    if (dist(byId[chain[i]], dest) >= dist(byId[chain[i - 1]], dest) - 1) backtracks++;
  }
  if (backtracks > 1) return null;
  if (pathKm(chain) > straight * 1.9 + 60) return null;
  return chain;
}

function pathIsCoherent(ids, maxBacktracks = 0) {
  if (!ids || ids.length < 2) return false;
  const dest = byId[ids[ids.length - 1]];
  let backtracks = 0;
  for (let i = 1; i < ids.length - 1; i++) {
    if (dist(byId[ids[i]], dest) >= dist(byId[ids[i - 1]], dest) - 1) backtracks++;
  }
  if (backtracks > maxBacktracks) return false;
  if (pathKm(ids) > dist(byId[ids[0]], dest) * 2.1 + 80) return false;
  for (let i = 1; i < ids.length; i++) {
    if (dist(byId[ids[i - 1]], byId[ids[i]]) > 480) return false;
  }
  if (ids.length >= 4) {
    for (let i = 1; i < ids.length - 1; i++) {
      const a = byId[ids[i - 1]];
      const b = byId[ids[i]];
      const c = byId[ids[i + 1]];
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const bcx = c.x - b.x;
      const bcz = c.z - b.z;
      const mag = Math.hypot(abx, abz) * Math.hypot(bcx, bcz);
      if (mag > 1 && (abx * bcx + abz * bcz) / mag < -0.45) return false;
    }
  }
  return true;
}

/** Insert cities that lie along the A→B corridor to reach a richer stop list. */
function corridorStops(origin, dest, pool, maxStops = 8) {
  if (!origin || !dest || origin.id === dest.id) return null;
  const straight = dist(origin, dest);
  if (straight < 55) return [origin.id, dest.id];
  const ox = origin.x;
  const oz = origin.z;
  const dx = dest.x - ox;
  const dz = dest.z - oz;
  const len2 = dx * dx + dz * dz || 1;
  const maxOffKm = Math.min(110, Math.max(45, straight * 0.22));
  const candidates = [];
  for (const c of pool) {
    if (c.id === origin.id || c.id === dest.id) continue;
    const t = ((c.x - ox) * dx + (c.z - oz) * dz) / len2;
    if (t < 0.06 || t > 0.94) continue;
    const projX = ox + t * dx;
    const projZ = oz + t * dz;
    const off = Math.hypot(c.x - projX, c.z - projZ) * SCALE_KM;
    if (off > maxOffKm) continue;
    candidates.push({ c, t, off, score: t * 10 + off * 0.02 - (c.tier === 1 ? 0.4 : 0) });
  }
  candidates.sort((a, b) => a.t - b.t || a.off - b.off);
  const want = Math.min(maxStops - 2, Math.max(1, Math.round(straight / 140)));
  const picked = [];
  let lastT = -1;
  const minGap = Math.max(0.05, 0.9 / (want + 2));
  for (const cand of candidates) {
    if (cand.t - lastT < minGap) continue;
    picked.push(cand.c.id);
    lastT = cand.t;
    if (picked.length >= want) break;
  }
  // If still sparse, take evenly by t buckets
  if (picked.length < Math.min(want, 2) && candidates.length) {
    picked.length = 0;
    for (let k = 1; k <= want; k++) {
      const target = k / (want + 1);
      let best = null;
      let bestDiff = Infinity;
      for (const cand of candidates) {
        if (picked.includes(cand.c.id)) continue;
        const d = Math.abs(cand.t - target) + cand.off / 500;
        if (d < bestDiff) {
          bestDiff = d;
          best = cand;
        }
      }
      if (best) picked.push(best.c.id);
    }
    picked.sort((idA, idB) => {
      const ta = ((byId[idA].x - ox) * dx + (byId[idA].z - oz) * dz) / len2;
      const tb = ((byId[idB].x - ox) * dx + (byId[idB].z - oz) * dz) / len2;
      return ta - tb;
    });
  }
  return [origin.id, ...picked, dest.id];
}

function buildPath(origin, dest, pool, opts = {}) {
  const maxStops = opts.maxStops || 8;
  let chain = pathToward(origin, dest, pool, opts);
  if (!chain || chain.length < Math.min(4, maxStops)) {
    const enriched = corridorStops(origin, dest, pool, maxStops);
    if (enriched && (!chain || enriched.length > chain.length)) chain = enriched;
  }
  if (!chain) chain = [origin.id, dest.id];
  return chain;
}

function tagsFor(ids, tipoId) {
  const tags = [];
  const paises = countries(ids);
  if (paises.length > 1) tags.push("frontera");
  if (tipoId === "fer") tags.push("ferry");
  else if (paises.some((p) => FERRY_COUNTRIES.has(p)) && paises.length > 1) {
    // likely sea/channel international
    const pair = new Set(paises);
    if (
      (pair.has("Reino Unido") && (pair.has("Francia") || pair.has("Bélgica") || pair.has("Países Bajos") || pair.has("Irlanda"))) ||
      (pair.has("Dinamarca") && pair.has("Suecia")) ||
      (pair.has("Italia") && (pair.has("Grecia") || pair.has("Albania") || pair.has("Croacia"))) ||
      (pair.has("España") && pair.has("Marruecos"))
    ) {
      tags.push("ferry");
    }
  }
  if (paises.some((p) => TOLL_COUNTRIES.has(p))) tags.push("peaje");
  return tags;
}

const counters = {};
const routes = [];
const seenExact = new Set();
const seenCorridor = new Map(); // key -> best route index

function nextNum(key) {
  counters[key] = (counters[key] || 0) + 1;
  return String(counters[key]).padStart(4, "0");
}

function makeCodigo(tipoId, ids) {
  const tipo = tipoById[tipoId].prefijo;
  const ccs = countryCodes(ids);
  const cc1 = isoOf(byId[ids[0]]);
  const cc2 = isoOf(byId[ids[ids.length - 1]]);
  if (ccs.length === 1) {
    const key = `${cc1}-${tipo}`;
    return `${cc1}-${tipo}-${nextNum(key)}`;
  }
  if (tipoId === "int") {
    const key = `INT-${cc1}-${cc2}`;
    return `INT-${cc1}-${cc2}-${nextNum(key)}`;
  }
  const key = `INT-${tipo}-${cc1}-${cc2}`;
  return `INT-${tipo}-${cc1}-${cc2}-${nextNum(key)}`;
}

function corridorKey(tipoId, ids) {
  const a = ids[0];
  const b = ids[ids.length - 1];
  const ends = [a, b].sort().join("|");
  // Allow direct, medium and long variants on the same corridor
  const bucket = ids.length <= 2 ? "d" : ids.length <= 5 ? "m" : "l";
  return `${tipoId}::${ends}::${bucket}`;
}

function describe(route) {
  const tipo = tipoById[route.tipo_id];
  const names = route.paradas_nombres;
  const inter = names.slice(1, -1);
  const tagTxt = route.etiquetas.length
    ? ` Etiquetas: ${route.etiquetas.map((t) => ({ frontera: "frontera", peaje: "peaje", ferry: "ferry" }[t] || t)).join(", ")}.`
    : "";
  return [
    `${tipo.nombre} ${route.codigo} de EuroPerote entre ${names[0]} y ${names[names.length - 1]} (${route.distancia_km} km).`,
    "Paradas reales del mapa ETS2/ProMods (fuente ets2.online).",
    inter.length ? `Intermedias: ${inter.join(", ")}.` : "Servicio directo.",
    route.paises.length > 1 ? `Países: ${route.paises.join(", ")}.` : `Nacional en ${route.paises[0]}.`,
    tagTxt,
    `Material: ${route.material_nombre}. Operador: EuroPerote.`,
    `Itinerario: ${names.join(" → ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function pushRoute(tipoId, ids, extra = {}) {
  ids = (ids || []).filter((id) => byId[id]);
  if (ids.length < 2) return null;
  if (!extra.skipCoherence && !pathIsCoherent(ids, extra.maxBacktracks ?? 0)) return null;

  const fp = tipoId + "|" + ids.join(">");
  const fpRev = tipoId + "|" + [...ids].reverse().join(">");
  if (seenExact.has(fp) || seenExact.has(fpRev)) return null;

  const cKey = corridorKey(tipoId, ids);
  const km = pathKm(ids);
  const existingIdx = seenCorridor.get(cKey);
  if (existingIdx != null) {
    const prev = routes[existingIdx];
    // Prefer richer itineraries (more stops) when km stays reasonable
    const better =
      ids.length > prev.num_paradas
        ? km <= prev.distancia_km * 1.35 + 40
        : ids.length === prev.num_paradas && km < prev.distancia_km;
    if (!better) return null;
    seenExact.delete(prev.tipo_id + "|" + prev.paradas.join(">"));
    seenExact.delete(prev.tipo_id + "|" + [...prev.paradas].reverse().join(">"));
    routes[existingIdx] = null;
  }

  seenExact.add(fp);
  const tipo = tipoById[tipoId];
  const nombres = ids.map((id) => byId[id].nombre);
  const mat = pickFleet(tipoId, km);
  const codigo = makeCodigo(tipoId, ids);
  const ccs = countryCodes(ids);
  const etiquetas = tagsFor(ids, tipoId);
  const route = {
    id: codigo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    codigo,
    nombre: extra.nombre || `${tipo.nombre} ${nombres[0]} — ${nombres[nombres.length - 1]}`,
    tipo_id: tipoId,
    prefijo: tipo.prefijo,
    nacional: ccs.length === 1,
    operador_id: operator.id,
    operador_nombre: operator.nombre,
    color: operator.color,
    color_secundario: operator.color_secundario,
    paradas: ids,
    paradas_nombres: nombres,
    num_paradas: ids.length,
    distancia_km: km,
    material_id: mat.id,
    material_nombre: mat.nombre,
    paises: countries(ids),
    pais_codes: ccs,
    addons: uniqAddons(ids),
    etiquetas,
    patron: extra.patron || "base",
    sentido: extra.sentido || "ida",
    origen_datos: "ets2.online",
    eje: extra.eje || "",
  };
  route.descripcion = describe(route);
  const idx = routes.length;
  routes.push(route);
  seenCorridor.set(cKey, idx);
  return route;
}

const byPais = {};
for (const s of reals) (byPais[s.pais] ||= []).push(s);

// Rank cities by local density + name importance → tier 1/2/3 and degree budget
const MAJOR_NAME =
  /madrid|barcelona|lisboa|lisbon|porto|paris|lyon|marseille|marsella|berlin|hamburg|m[uü]nchen|munich|colonia|k[oö]ln|cologne|frankfurt|london|manchester|birmingham|glasgow|edinburgh|amsterdam|rotterdam|brussel|bruselas|brussels|wien|vienna|roma|rome|mil[aá]n|milan|napoles|naples|tur[ií]n|turin|varsovia|warsaw|warszawa|prague|praha|budapest|bucarest|bucharest|sof[ií]a|belgrade|belgrado|zagreb|atenas|athens|athina|estambul|istanbul|ankara|helsinki|stockholm|oslo|copenhague|copenhagen|k[oø]benhavn|dubl[ií]n|dublin|reykjav|mosc[uú]|moscow|kyiv|kiev|minsk|riga|tallinn|vilnius|warsaw|gothenburg|gotemburgo|g[oö]teborg|sevilla|val[eè]ncia|m[aá]laga|bilbao|zaragoza|granada|murcia|santiago|porto|faro|coimbra|bordeaux|burdeos|toulouse|nice|niza|strasbourg|lille|nantes|rennes|genoa|g[eé]nova|florencia|florence|firenze|bologna|palermo|catania|bari|verona|venice|venecia|venezia|zurich|geneva|ginebra|basel|bern|innsbruck|salzburg|graz|linz|bratislava|kosice|krakow|krak[oó]w|gdansk|wroclaw|poznan|lodz|katowice|cluj|timisoara|iasi|constanta|plovdiv|varna|burgas|skopje|tirana|pristina|podgorica|sarajevo|ljubljana|split|rijeka|thessaloniki|patras|heraklion|nicosia|lefkosia|beirut|tel.?aviv|jerusalem|amman|cairo|casablanca|tanger|rabat|tunis|algiers|yerevan|baku|tbilisi|batumi|almaty|astana|kaliningrad|saint.?petersburg|sankt|novosibirsk|samara|kazan|rostov|voronezh|volgograd/i;

function localDegree(city, radiusKm = 220) {
  let n = 0;
  for (const o of byPais[city.pais] || []) {
    if (o.id === city.id) continue;
    if (dist(city, o) <= radiusKm) n++;
  }
  return n;
}

for (const s of reals) {
  const deg = localDegree(s);
  s._deg = deg;
  if (MAJOR_NAME.test(s.nombre) || MAJOR_NAME.test(s.nombre_juego || "")) s.tier = 1;
  else if (deg >= 7) s.tier = 2;
  else s.tier = 3;
}

const hubs = [...reals].sort((a, b) => a.tier - b.tier || b._deg - a._deg || a.nombre.localeCompare(b.nombre, "es"));
const tier1 = hubs.filter((h) => h.tier === 1);
const tier2 = hubs.filter((h) => h.tier === 2);
const majorHubs = tier1.concat(tier2.slice(0, 220));

function linkBudget(city) {
  if (city.tier === 1) return 8;
  if (city.tier === 2) return 5;
  return 2;
}

console.log(`Ciudades: ${reals.length} | Hubs: ${majorHubs.length} | Tier1: ${tier1.length} | Tier2: ${tier2.length} | Tier3: ${hubs.filter((h) => h.tier === 3).length}`);

// REG — denser corridors with more stops
for (const [pais, list] of Object.entries(byPais)) {
  if (list.length < 3) continue;
  for (const axis of ["z", "x"]) {
    const sorted = [...list].sort((a, b) => (axis === "x" ? a.x - b.x : a.z - b.z));
    for (let win = 5; win <= 11; win++) {
      const step = win <= 7 ? 2 : 3;
      for (let i = 0; i + win <= sorted.length; i += step) {
        const chain = buildPath(sorted[i], sorted[i + win - 1], list, {
          maxStops: Math.min(win, 12),
          maxHop: 280,
          minHop: 18,
          minProgress: 10,
          maxDetourKm: 90,
        });
        if (chain?.length >= 3) {
          pushRoute("reg", chain, { patron: "parador", eje: `${axis}-${pais}`, maxBacktracks: 1 });
        }
      }
    }
  }
  if (list.length >= 8) {
    const sorted = [...list].sort((a, b) => a.z - b.z);
    const chain = buildPath(sorted[0], sorted[sorted.length - 1], list, {
      maxStops: 12,
      maxHop: 320,
      minHop: 25,
      minProgress: 12,
      maxDetourKm: 110,
    });
    if (chain?.length >= 5) pushRoute("reg", chain, { patron: "eje-nacional", maxBacktracks: 1 });
  }
}

// Local feeders: every city → nearest hubs, with intermediates when far
for (const city of reals) {
  const budget = linkBudget(city);
  const nearHubs = majorHubs
    .filter((h) => h.id !== city.id && (h.pais === city.pais || city.tier === 1))
    .map((h) => ({ h, d: dist(city, h) }))
    .filter((x) => x.d > 20 && x.d < (city.tier === 1 ? 650 : 360))
    .sort((a, b) => a.d - b.d)
    .slice(0, budget);
  for (const { h, d } of nearHubs) {
    const pool = city.pais === h.pais ? byPais[city.pais] || reals : reals;
    const maxStops = d > 350 ? 10 : d > 200 ? 7 : d > 100 ? 5 : 3;
    const chain = buildPath(city, h, pool, {
      maxStops,
      maxHop: 300,
      minHop: 18,
      minProgress: 10,
      maxDetourKm: 95,
    });
    if (chain?.length >= 2) {
      pushRoute(chain.length >= 4 ? "reg" : d < 120 ? "reg" : "exp", chain, {
        patron: "feeder",
        maxBacktracks: 1,
        skipCoherence: chain.length === 2,
      });
    }
  }
}

// EXP — more connections for larger cities (prefer multi-stop)
for (const a of majorHubs) {
  const n = linkBudget(a);
  const candidates = majorHubs
    .filter((b) => b.id !== a.id)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 80 && x.d < (a.tier === 1 ? 1000 : 750))
    .sort((x, y) => x.d - y.d)
    .slice(0, n);
  for (const { b, d } of candidates) {
    const pool = a.pais === b.pais ? byPais[a.pais] : reals;
    const chain = buildPath(a, b, pool, {
      maxStops: a.pais === b.pais ? 7 : 9,
      maxHop: 380,
      minHop: 35,
      minProgress: 14,
      maxDetourKm: 110,
    });
    if (chain) pushRoute("exp", chain, { maxBacktracks: 1, eje: "hub", skipCoherence: chain.length === 2 && d < 150 });
  }
}

// INT — capitals and big hubs
for (const a of tier1.concat(majorHubs.filter((h) => h._deg >= 8).slice(0, 80))) {
  const foreign = majorHubs
    .filter((b) => b.pais !== a.pais)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 100 && x.d < (a.tier === 1 ? 1800 : 1400))
    .sort((x, y) => x.d - y.d)
    .slice(0, a.tier === 1 ? 6 : 3);
  for (const { b } of foreign) {
    const chain = buildPath(a, b, reals, {
      maxStops: 10,
      maxHop: 420,
      minHop: 40,
      minProgress: 16,
      maxDetourKm: 120,
    });
    if (!chain || countries(chain).length < 2) continue;
    pushRoute("int", chain, { maxBacktracks: 1 });
    if (pathKm(chain) > 450) pushRoute("noc", chain, { maxBacktracks: 1, eje: "nocturno" });
  }
}

// FER — coastal pairs
const seaHubs = majorHubs.filter((h) => FERRY_COUNTRIES.has(h.pais));
for (const a of seaHubs.filter((h) => h.tier <= 2)) {
  const mates = seaHubs
    .filter((b) => b.pais !== a.pais)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 80 && x.d < 750)
    .sort((x, y) => x.d - y.d)
    .slice(0, a.tier === 1 ? 2 : 1);
  for (const { b } of mates) {
    pushRoute("fer", [a.id, b.id], { skipCoherence: true, patron: "directo" });
  }
}

// TUR — scenic multi-stop within country
const byX = [...majorHubs].sort((a, b) => a.x - b.x);
for (let i = 0; i + 6 < byX.length; i += 5) {
  if (byX[i].pais !== byX[i + 5].pais) continue;
  const chain = buildPath(byX[i], byX[i + 5], byPais[byX[i].pais] || reals, {
    maxStops: 8,
    maxHop: 300,
    minHop: 30,
    minProgress: 14,
  });
  if (chain?.length >= 4) pushRoute("tur", chain, { patron: "parador", maxBacktracks: 1 });
}

// Ida/vuelta for nationals with many stops
const baseSnapshot = routes
  .filter(Boolean)
  .filter((r) => r.nacional && (r.tipo_id === "reg" || r.tipo_id === "exp") && r.num_paradas >= 3);
for (const r of baseSnapshot.slice(0, 700)) {
  pushRoute(r.tipo_id, [...r.paradas].reverse(), {
    nombre: `${tipoById[r.tipo_id].nombre} ${r.paradas_nombres.at(-1)} — ${r.paradas_nombres[0]}`,
    sentido: "vuelta",
    patron: r.patron,
    maxBacktracks: 1,
    skipCoherence: false,
  });
}

// Coverage fill — every real city gets at least one route
{
  const coveredTmp = new Set();
  for (const r of routes.filter(Boolean)) for (const id of r.paradas) coveredTmp.add(id);
  const uncovered = reals.filter((s) => !coveredTmp.has(s.id));
  const anchors = reals.filter((s) => coveredTmp.has(s.id) && s.tier <= 2);
  const poolAnchors = anchors.length ? anchors : majorHubs;
  for (const city of uncovered) {
    const nearest = [...poolAnchors]
      .filter((h) => h.id !== city.id)
      .map((h) => ({ h, d: dist(city, h) }))
      .filter((x) => x.d > 8 && x.d < 1200)
      .sort((a, b) => a.d - b.d)[0];
    if (!nearest) {
      // last resort: nearest real city in same country then any
      const same = (byPais[city.pais] || []).filter((h) => h.id !== city.id);
      const fall =
        same
          .map((h) => ({ h, d: dist(city, h) }))
          .sort((a, b) => a.d - b.d)[0] ||
        reals
          .filter((h) => h.id !== city.id)
          .map((h) => ({ h, d: dist(city, h) }))
          .sort((a, b) => a.d - b.d)[0];
      if (!fall) continue;
      const tipo = city.pais === fall.h.pais ? "reg" : "int";
      pushRoute(tipo, [city.id, fall.h.id], {
        skipCoherence: true,
        patron: "cobertura",
        maxBacktracks: 2,
      });
      coveredTmp.add(city.id);
      continue;
    }
    const sameCountry = city.pais === nearest.h.pais;
    const chain =
      pathToward(city, nearest.h, sameCountry ? byPais[city.pais] || reals : reals, {
        maxStops: 5,
        maxHop: 380,
        minHop: 20,
        minProgress: 10,
        maxDetourKm: 100,
      }) || [city.id, nearest.h.id];
    const tipo = sameCountry ? (pathKm(chain) < 280 ? "reg" : "exp") : "int";
    pushRoute(tipo, chain, {
      skipCoherence: true,
      patron: "cobertura",
      maxBacktracks: 2,
    });
    coveredTmp.add(city.id);
  }
}

const finalRoutes = routes.filter(Boolean).sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));

// coverage
const covered = new Set();
for (const r of finalRoutes) for (const id of r.paradas) covered.add(id);

const summary = {
  version: "4.0.0",
  generado: new Date().toISOString(),
  operador: operator,
  total_rutas: finalRoutes.length,
  ciudades_reales: reals.length,
  ciudades_con_ruta: covered.size,
  cobertura_pct: Math.round((1000 * covered.size) / Math.max(reals.length, 1)) / 10,
  solo_promods_real: true,
  por_tipo: Object.fromEntries(lineTypes.map((t) => [t.id, finalRoutes.filter((r) => r.tipo_id === t.id).length])),
  con_etiquetas: {
    ferry: finalRoutes.filter((r) => r.etiquetas.includes("ferry")).length,
    peaje: finalRoutes.filter((r) => r.etiquetas.includes("peaje")).length,
    frontera: finalRoutes.filter((r) => r.etiquetas.includes("frontera")).length,
  },
  codigos_ejemplo: finalRoutes.slice(0, 8).map((r) => r.codigo),
};

fs.writeFileSync(
  path.join(outDir, "lines-mass.json"),
  JSON.stringify({ version: summary.version, generado: summary.generado, total: finalRoutes.length, lines: finalRoutes })
);
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(
  path.join(outDir, "cities-real.json"),
  JSON.stringify({
    total: reals.length,
    cities: reals.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      nombre_juego: s.nombre_juego,
      pais: s.pais,
      pais_id: s.pais_id,
      iso: isoOf(s),
      x: s.x,
      z: s.z,
      map_x: s.map_x ?? s.x,
      map_y: s.map_y ?? s.z,
      tier: s.tier,
      addons: s.addons,
      con_ruta: covered.has(s.id),
    })),
  })
);
console.log(JSON.stringify(summary.por_tipo, null, 2));
console.log(`Generated ${finalRoutes.length} | coverage ${summary.cobertura_pct}% | tags`, summary.con_etiquetas);
