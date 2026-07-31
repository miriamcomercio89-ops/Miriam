import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isoOf } from "./pais-iso.mjs";

/**
 * EuroPerote generator v3
 * - Codes: national CC-TIPO-#### | international INT-[TIPO-]CC1-CC2-####
 * - Only real ProMods cities (no invented stops)
 * - Geographic progress + axis corridors
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

/** Solo ciudades/pueblos reales ProMods (coords de juego, no inventadas). */
const reals = stopsDoc.stops.filter(
  (s) => s.origen_datos !== "inventada" && !s.parent && (s.parada_tipo === "ciudad" || s.parada_tipo === "pueblo")
);

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z) * SCALE_KM;
}
function pathKm(ids) {
  let k = 0;
  for (let i = 1; i < ids.length; i++) k += dist(byId[ids[i - 1]], byId[ids[i]]);
  return Math.round(k);
}
function uniqAddons(ids) {
  const set = new Set();
  for (const id of ids) for (const a of byId[id]?.addons || []) set.add(a);
  return [...set];
}
function countries(ids) {
  return [...new Set(ids.map((id) => byId[id]?.pais).filter(Boolean))];
}
function countryCodes(ids) {
  return [...new Set(ids.map((id) => isoOf(byId[id])))];
}

function pickFleet(tipoId, km) {
  const map = {
    urb: ["urbano"],
    brt: ["urbano"],
    reg: ["regional", "urbano"],
    exp: ["largo", "regional"],
    int: ["largo", "premium"],
    noc: ["largo", "premium"],
    tur: ["largo", "premium"],
    ae: ["regional", "urbano"],
    fer: ["largo", "regional"],
  };
  let pool = fleet.filter((u) => (map[tipoId] || ["regional"]).includes(u.clase));
  if (km > 800) pool = fleet.filter((u) => ["largo", "premium"].includes(u.clase));
  if (!pool.length) pool = fleet;
  return pool[Math.abs(km + tipoId.length * 17) % pool.length];
}

function pathToward(origin, dest, pool, opts = {}) {
  const {
    maxStops = 10,
    minHop = 25,
    maxHop = 320,
    minProgress = 8,
    allowHubDetour = true,
    maxDetourKm = 90,
    detourSlack = 0.12,
  } = opts;
  if (!origin || !dest || origin.id === dest.id) return null;
  const straight = dist(origin, dest);
  if (straight < minHop * 0.5) return null;

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
        if (toDest > rem + rem * detourSlack) continue;
        const score = fromCur * 1.2 + toDest;
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
  if (backtracks > (allowHubDetour ? 1 : 0)) return null;
  if (pathKm(chain) > straight * 2.2 + 80) return null;
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
  const straight = dist(byId[ids[0]], dest);
  if (pathKm(ids) > straight * 1.85 + 60) return false;
  for (let i = 1; i < ids.length; i++) {
    if (dist(byId[ids[i - 1]], byId[ids[i]]) > 420) return false;
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
      if (mag > 1 && (abx * bcx + abz * bcz) / mag < -0.35) return false;
    }
  }
  return true;
}

const counters = {};
const routes = [];
const seen = new Set();

function nextNum(key) {
  counters[key] = (counters[key] || 0) + 1;
  return String(counters[key]).padStart(4, "0");
}

/** National: CC-TIPO-#### | International: INT-CC1-CC2-#### or INT-TIPO-CC1-CC2-#### */
function makeCodigo(tipoId, ids) {
  const tipo = tipoById[tipoId].prefijo;
  const ccs = countryCodes(ids);
  const international = ccs.length > 1;
  const cc1 = isoOf(byId[ids[0]]);
  const cc2 = isoOf(byId[ids[ids.length - 1]]);
  if (!international) {
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

function fingerprint(ids, tipo) {
  return tipo + "|" + ids.join(">");
}

function describe(route) {
  const tipo = tipoById[route.tipo_id];
  const names = route.paradas_nombres;
  const inter = names.slice(1, -1);
  const paises = route.paises;
  const addons = route.addons
    .map((id) => addonsDoc.addons.find((a) => a.id === id)?.nombre || id)
    .join("; ");
  const atraviesa =
    paises.length > 1
      ? ` Cruza ${paises.length} países (${paises.join(", ")}).`
      : ` Recorrido nacional en ${paises[0]}.`;
  const interTxt =
    inter.length === 0
      ? "Servicio directo."
      : `Paradas reales ProMods en orden geográfico: ${inter.join(", ")}.`;
  return [
    `${tipo.nombre} ${route.codigo} de EuroPerote entre ${names[0]} y ${names[names.length - 1]} (${route.distancia_km} km).`,
    "Todas las paradas son ciudades/pueblos reales del mapa ProMods.",
    interTxt + atraviesa,
    `Mapa: ${addons || "ProMods"}. Material: ${route.material_nombre}. Operador: EuroPerote.`,
    `Itinerario (${names.length}): ${names.join(" → ")}.`,
  ].join(" ");
}

function pushRoute(tipoId, ids, extra = {}) {
  ids = (ids || []).filter((id) => {
    const s = byId[id];
    return s && s.origen_datos !== "inventada" && !s.parent;
  });
  if (ids.length < 2) return null;
  if (!extra.skipCoherence && !pathIsCoherent(ids, extra.maxBacktracks ?? 0)) return null;

  const fp = fingerprint(ids, tipoId);
  const fpRev = fingerprint([...ids].reverse(), tipoId);
  if (seen.has(fp) || seen.has(fpRev)) return null;
  seen.add(fp);

  const tipo = tipoById[tipoId];
  const nombres = ids.map((id) => byId[id].nombre);
  const km = pathKm(ids);
  const mat = pickFleet(tipoId, km);
  const codigo = makeCodigo(tipoId, ids);
  const ccs = countryCodes(ids);
  const nombre =
    extra.nombre ||
    `${tipo.nombre} ${nombres[0]} — ${nombres[nombres.length - 1]}`;

  const route = {
    id: codigo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    codigo,
    nombre,
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
    patron: extra.patron || "base",
    origen_datos: "promods-real",
    eje: extra.eje || "",
    notas: extra.notas || "",
  };
  route.descripcion = describe(route);
  routes.push(route);
  return route;
}

const byPais = {};
for (const s of reals) (byPais[s.pais] ||= []).push(s);
const hubs = reals.filter((s) => s.tier <= 2).sort((a, b) => a.tier - b.tier || a.nombre.localeCompare(b.nombre, "es"));

console.log(`Ciudades reales ProMods: ${reals.length} | Hubs: ${hubs.length}`);

// REG — corredores por eje + progresión (solo reales, mismo país)
for (const [pais, list] of Object.entries(byPais)) {
  if (list.length < 3) continue;
  for (const axis of ["z", "x"]) {
    const sorted = [...list].sort((a, b) => (axis === "x" ? a.x - b.x : a.z - b.z) || a.nombre.localeCompare(b.nombre, "es"));
    for (let win = 4; win <= 8; win++) {
      for (let i = 0; i + win <= sorted.length; i += Math.max(2, Math.floor(win / 2))) {
        const chain = pathToward(sorted[i], sorted[i + win - 1], list, {
          maxStops: Math.min(win, 7),
          maxHop: 300,
          minHop: 18,
          minProgress: 12,
          allowHubDetour: true,
          maxDetourKm: 65,
        });
        if (chain?.length >= 3) {
          pushRoute("reg", chain, {
            patron: "parador",
            eje: axis === "z" ? `norte-sur ${pais}` : `este-oeste ${pais}`,
          });
        }
      }
    }
  }
  const sorted = [...list].sort((a, b) => a.z - b.z || a.x - b.x);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 2; j < Math.min(sorted.length, i + 7); j++) {
      const chain = pathToward(sorted[i], sorted[j], list, {
        maxStops: 6,
        maxHop: 280,
        minHop: 20,
        allowHubDetour: true,
        maxDetourKm: 70,
      });
      if (chain) pushRoute("reg", chain, { patron: chain.length > 3 ? "parador" : "base", eje: `progresión ${pais}` });
    }
  }
}

// EXP — hubs, estrictos
for (const a of hubs) {
  const candidates = hubs
    .filter((b) => b.id !== a.id)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 60 && x.d < 1100)
    .sort((x, y) => x.d - y.d)
    .slice(0, 8);
  for (const { b } of candidates) {
    if (dist(a, b) <= 450 && a.pais === b.pais) {
      pushRoute("exp", [a.id, b.id], { patron: "directo" });
    }
    const pool = a.pais === b.pais ? byPais[a.pais] : reals;
    const chain = pathToward(a, b, pool, {
      maxStops: a.pais === b.pais ? 5 : 7,
      maxHop: 380,
      minHop: 40,
      minProgress: 15,
      allowHubDetour: true,
      maxDetourKm: 100,
    });
    if (chain) pushRoute("exp", chain, { patron: chain.length <= 3 ? "directo" : "base", eje: "hub", maxBacktracks: 1 });
  }
}

// INT + NOC internacionales
for (const a of hubs) {
  const foreign = hubs
    .filter((b) => b.pais !== a.pais)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 100 && x.d < 2000)
    .sort((x, y) => x.d - y.d)
    .slice(0, 6);
  for (const { b } of foreign) {
    const chain = pathToward(a, b, reals, {
      maxStops: 9,
      maxHop: 420,
      minHop: 45,
      minProgress: 20,
      allowHubDetour: true,
      maxDetourKm: 110,
    });
    if (!chain || countries(chain).length < 2) continue;
    pushRoute("int", chain, { patron: chain.length > 4 ? "parador" : "directo", maxBacktracks: 1 });
    if (pathKm(chain) > 450) {
      pushRoute("noc", chain, { patron: "base", eje: "nocturno-internacional", maxBacktracks: 1 });
    }
  }
}

// TUR — ciudades costeras reales (tier<=2 cerca de extremos / addons norte-sur), eje por x
const coastalHint = reals.filter((s) => s.tier <= 2);
const byX = [...coastalHint].sort((a, b) => a.x - b.x);
for (let i = 0; i + 4 < byX.length; i += 3) {
  const a = byX[i];
  const b = byX[Math.min(byX.length - 1, i + 4)];
  if (a.pais === b.pais) {
    const chain = pathToward(a, b, byPais[a.pais] || reals, {
      maxStops: 6,
      maxHop: 350,
      minHop: 30,
      minProgress: 15,
      allowHubDetour: true,
    });
    if (chain?.length >= 3) pushRoute("tur", chain, { patron: "parador", eje: "turístico", maxBacktracks: 0 });
  }
}

// FER — solo entre ciudades reales de países distintos (sin puertos inventados)
const seaCountries = new Set([
  "Dinamarca",
  "Suecia",
  "Noruega",
  "Finlandia",
  "Reino Unido",
  "Francia",
  "Italia",
  "España",
  "Croacia",
  "Grecia",
  "Polonia",
  "Alemania",
  "Países Bajos",
  "Bélgica",
  "Irlanda",
  "Islandia",
  "Estonia",
  "Letonia",
  "Lituania",
]);
const seaHubs = hubs.filter((h) => seaCountries.has(h.pais));
for (const a of seaHubs) {
  const mates = seaHubs
    .filter((b) => b.pais !== a.pais)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 80 && x.d < 900)
    .sort((x, y) => x.d - y.d)
    .slice(0, 2);
  for (const { b } of mates) {
    pushRoute("fer", [a.id, b.id], { patron: "directo", skipCoherence: true, notas: "Enlace ferry-bus entre ciudades reales" });
  }
}

// NOC nacionales largos
for (const r of [...routes]) {
  if (r.tipo_id === "exp" && r.nacional && r.distancia_km > 500) {
    pushRoute("noc", r.paradas, { patron: "base", eje: "nocturno-nacional", maxBacktracks: 1 });
  }
}

routes.sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));

const summary = {
  version: "3.0.0",
  generado: new Date().toISOString(),
  operador: operator,
  total_rutas: routes.length,
  ciudades_reales: reals.length,
  solo_promods_real: true,
  por_tipo: Object.fromEntries(lineTypes.map((t) => [t.id, routes.filter((r) => r.tipo_id === t.id).length])),
  codigos_ejemplo: routes.slice(0, 8).map((r) => r.codigo),
  nacionales: routes.filter((r) => r.nacional).length,
  internacionales: routes.filter((r) => !r.nacional).length,
};

fs.writeFileSync(
  path.join(outDir, "lines-mass.json"),
  JSON.stringify({ version: summary.version, generado: summary.generado, total: routes.length, lines: routes })
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
      tier: s.tier,
      addons: s.addons,
    })),
  })
);
console.log(JSON.stringify(summary.por_tipo, null, 2));
console.log(`Generated ${routes.length} | examples: ${summary.codigos_ejemplo.join(", ")}`);
