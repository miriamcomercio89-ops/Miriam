import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");
fs.mkdirSync(outDir, { recursive: true });

const stopsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/stops.json"), "utf8"));
const operator = JSON.parse(fs.readFileSync(path.join(root, "data/operator.json"), "utf8"));
const fleet = JSON.parse(fs.readFileSync(path.join(root, "data/fleet.json"), "utf8")).unidades;
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8")).tipos;
const addonsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/addons.json"), "utf8"));

const stops = stopsDoc.stops;
const byId = Object.fromEntries(stops.map((s) => [s.id, s]));
const tipoById = Object.fromEntries(lineTypes.map((t) => [t.id, t]));

const SCALE_KM = 0.019; // game units → km approx

function dist(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz) * SCALE_KM;
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
  const classes = map[tipoId] || ["regional"];
  let pool = fleet.filter((u) => classes.includes(u.clase));
  if (km > 800) pool = fleet.filter((u) => ["largo", "premium"].includes(u.clase));
  if (!pool.length) pool = fleet;
  return pool[Math.abs(km + tipoId.length * 17) % pool.length];
}

function nearestPath(seedIds, maxStops = 8, maxHopKm = 280) {
  const used = new Set(seedIds);
  const path = [...seedIds];
  let cur = byId[seedIds[seedIds.length - 1]];
  while (path.length < maxStops) {
    let best = null;
    let bestD = Infinity;
    for (const s of stops) {
      if (used.has(s.id)) continue;
      const d = dist(cur, s);
      if (d < 8 || d > maxHopKm) continue;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (!best) break;
    path.push(best.id);
    used.add(best.id);
    cur = best;
  }
  return path;
}

function chainSorted(list, limit) {
  if (list.length < 2) return null;
  const start = list[0];
  const rest = list.slice(1).sort((a, b) => dist(start, a) - dist(start, b));
  const path = [start.id];
  let cur = start;
  const used = new Set([start.id]);
  for (const s of rest) {
    if (path.length >= limit) break;
    if (used.has(s.id)) continue;
    if (dist(cur, s) > 320) continue;
    path.push(s.id);
    used.add(s.id);
    cur = s;
  }
  return path.length >= 2 ? path : null;
}

const counters = Object.fromEntries(lineTypes.map((t) => [t.id, 0]));
const routes = [];
const seen = new Set();

function codeFor(tipoId) {
  counters[tipoId]++;
  const pref = tipoById[tipoId].prefijo;
  return `EP-${pref}${String(counters[tipoId]).padStart(4, "0")}`;
}

function fingerprint(ids, tipo) {
  return tipo + "|" + ids.join(">");
}

function describe(route) {
  const tipo = tipoById[route.tipo_id];
  const names = route.paradas_nombres;
  const origen = names[0];
  const destino = names[names.length - 1];
  const inter = names.slice(1, -1);
  const paises = route.paises;
  const addons = route.addons
    .map((id) => addonsDoc.addons.find((a) => a.id === id)?.nombre || id)
    .join("; ");
  const atraviesa =
    paises.length > 1
      ? ` Cruza ${paises.length} territorios ProMods (${paises.join(", ")}), con controles fronterizos y peajes posibles según el tramo.`
      : ` Circula íntegramente en ${paises[0]}, enlazando paradas urbanas, estaciones de viajeros y nodos de transferencia.`;
  const interTxt =
    inter.length === 0
      ? "Servicio casi directo, con paradas mínimas pensadas para acortar tiempo de viaje."
      : inter.length <= 3
        ? `Paradas intermedias en ${inter.join(", ")}.`
        : `Itinerario denso con ${inter.length} paradas intermedias: ${inter.slice(0, 6).join(", ")}${inter.length > 6 ? "…" : ""}.`;
  const material = route.material_nombre;
  const km = route.distancia_km;
  const tipExtra = {
    urb: "Pensada para moverse dentro de la misma ciudad o área metropolitana, con cabeceras en barrio, universidad, puerto o aeropuerto según el mapa.",
    brt: "Corredor de alta capacidad tipo BRT: prioridad visual de plataforma, pocas desviaciones y ritmo urbano constante.",
    reg: "Interurbano regional: une pueblos y ciudades cercanas siguiendo carreteras nacionales y autovías secundarias del mapa.",
    exp: "Express semirrápido: salta localidades menores para priorizar nodos de mayor demanda.",
    int: "Línea internacional EuroPerote: diseñada para viajes largos entre países, con trasbordo opcional en hubs fronterizos.",
    noc: "Servicio nocturno de media/larga distancia. Ideal para salir al anochecer y llegar de madrugada a la terminal destino.",
    tur: "Ruta turística panorámica: costa, fjords, montaña o patrimonio según el corredor. Ritmo más contemplativo.",
    ae: "Lanzadera aeroportuaria: ciudad/estación ↔ aeropuerto, con maletas y tiempo de conexión en mente.",
    fer: "Combinado ferry-bus: el itinerario asume embarque en terminal portuaria ProMods y continuación por carretera al otro lado.",
  }[route.tipo_id];

  return [
    `${tipo.nombre} ${route.codigo} de EuroPerote entre ${origen} y ${destino} (${km} km estimados sobre coordenadas de juego).`,
    tipExtra,
    interTxt + atraviesa,
    `Cobertura de mapa: ${addons || "ETS2 + ProMods"}.`,
    `Material típico asignado: ${material}. Un solo operador: EuroPerote.`,
    `Uso previsto: planificación de líneas, roleplay y recorridos in-game sobre ProMods completo y addons listados.`,
    names.length > 4
      ? `Cadena completa de paradas (${names.length}): ${names.join(" → ")}.`
      : `Paradas: ${names.join(" → ")}.`,
  ].join(" ");
}

function pushRoute(tipoId, ids, extra = {}) {
  if (!ids || ids.length < 2) return null;
  // sanitize missing
  ids = ids.filter((id) => byId[id]);
  if (ids.length < 2) return null;
  const fp = fingerprint(ids, tipoId);
  const fpRev = fingerprint([...ids].reverse(), tipoId);
  if (seen.has(fp) || seen.has(fpRev)) return null;
  seen.add(fp);
  const codigo = codeFor(tipoId);
  const km = pathKm(ids);
  const mat = pickFleet(tipoId, km);
  const nombres = ids.map((id) => byId[id].nombre);
  const route = {
    id: codigo.toLowerCase(),
    codigo,
    nombre: extra.nombre || `${nombres[0]} — ${nombres[nombres.length - 1]}`,
    tipo_id: tipoId,
    prefijo: tipoById[tipoId].prefijo,
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
    addons: uniqAddons(ids),
    patron: extra.patron || "base",
    origen_datos: extra.origen_datos || "generada",
    notas: extra.notas || "",
  };
  route.descripcion = describe(route);
  routes.push(route);
  return route;
}

// —— Index helpers ——
const cities = stops.filter((s) => s.parada_tipo === "ciudad" || (!s.parent && s.parada_tipo !== "aeropuerto"));
const byPais = {};
for (const s of cities) (byPais[s.pais] ||= []).push(s);

const childrenOf = {};
for (const s of stops) {
  if (s.parent) (childrenOf[s.parent] ||= []).push(s);
}

const hubs = cities.filter((s) => s.tier <= 2).sort((a, b) => a.tier - b.tier || a.nombre.localeCompare(b.nombre, "es"));
const airports = stops.filter((s) => s.parada_tipo === "aeropuerto");
const ports = stops.filter((s) => s.parada_tipo === "puerto");

// 1) Urban + BRT inside multi-stop cities
for (const [parentId, kids] of Object.entries(childrenOf)) {
  const parent = byId[parentId];
  if (!parent) continue;
  const nodes = [parent, ...kids];
  if (nodes.length < 2) continue;
  // Urban loops / lines
  const order = [parent, ...kids.sort((a, b) => a.parada_tipo.localeCompare(b.parada_tipo))];
  pushRoute("urb", order.map((s) => s.id), {
    nombre: `${parent.nombre} Urbano`,
    patron: "parador",
  });
  if (nodes.length >= 3) {
    const mid = [nodes[0], nodes[Math.floor(nodes.length / 2)], nodes[nodes.length - 1]];
    pushRoute("brt", mid.map((s) => s.id), {
      nombre: `${parent.nombre} BRT`,
      patron: "directo",
    });
  }
  // Airport shuttle
  const ap = kids.find((k) => k.parada_tipo === "aeropuerto");
  if (ap) {
    pushRoute("ae", [parent.id, ap.id], {
      nombre: `${parent.nombre} ↔ Aeropuerto`,
      patron: "directo",
    });
  }
}

// 2) Regional nearest-neighbor within each country
for (const [pais, list] of Object.entries(byPais)) {
  const sorted = [...list].sort((a, b) => a.z - b.z || a.x - b.x);
  // sliding windows
  for (let i = 0; i < sorted.length; i++) {
    const seed = sorted[i];
    const path = nearestPath([seed.id], 5 + (i % 4), pais === "Rusia" || pais === "Kazajistán" ? 420 : 260);
    if (path && path.length >= 3) {
      pushRoute("reg", path, { nombre: `Regional ${pais}: ${byId[path[0]].nombre} — ${byId[path[path.length - 1]].nombre}` });
    }
  }
  // longitude bands
  for (let i = 0; i < sorted.length - 4; i += 2) {
    const slice = sorted.slice(i, i + 6);
    const path = chainSorted(slice, 6);
    if (path) pushRoute("reg", path, { patron: "parador" });
  }
}

// 3) Express between hubs (same country + neighboring)
for (let i = 0; i < hubs.length; i++) {
  const a = hubs[i];
  const candidates = hubs
    .filter((b) => b.id !== a.id)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 40 && x.d < 900)
    .sort((x, y) => x.d - y.d)
    .slice(0, 6);
  for (const { b } of candidates) {
    // direct
    pushRoute("exp", [a.id, b.id], {
      nombre: `Express ${a.nombre} — ${b.nombre}`,
      patron: "directo",
    });
    // one intermediate
    const mid = cities
      .filter((c) => c.id !== a.id && c.id !== b.id)
      .map((c) => ({ c, score: dist(a, c) + dist(c, b) }))
      .filter((x) => x.score < dist(a, b) * 1.35 && dist(a, x.c) > 25)
      .sort((x, y) => x.score - y.score)[0];
    if (mid) {
      pushRoute("exp", [a.id, mid.c.id, b.id], {
        nombre: `Express ${a.nombre} — ${b.nombre} (vía ${mid.c.nombre})`,
        patron: "base",
      });
    }
  }
}

// 4) International long corridors (hub pairs different country)
for (let i = 0; i < hubs.length; i++) {
  const a = hubs[i];
  const foreign = hubs
    .filter((b) => b.pais !== a.pais)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 80 && x.d < 2200)
    .sort((x, y) => x.d - y.d)
    .slice(0, 5);
  for (const { b } of foreign) {
    // build geographic chain toward b
    const chain = [a.id];
    let cur = a;
    const used = new Set([a.id, b.id]);
    for (let step = 0; step < 8; step++) {
      const remaining = dist(cur, b);
      if (remaining < 120) break;
      let best = null;
      let bestScore = Infinity;
      for (const c of cities) {
        if (used.has(c.id)) continue;
        const toB = dist(c, b);
        const fromCur = dist(cur, c);
        if (fromCur < 30 || fromCur > 450) continue;
        if (toB >= remaining - 10) continue;
        const score = fromCur + toB * 0.85;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
      if (!best) break;
      chain.push(best.id);
      used.add(best.id);
      cur = best;
    }
    chain.push(b.id);
    pushRoute("int", chain, {
      nombre: `Internacional ${a.nombre} — ${b.nombre}`,
      patron: chain.length > 4 ? "parador" : "directo",
    });
    if (chain.length >= 4 && dist(a, b) > 400) {
      pushRoute("noc", chain, {
        nombre: `Nocturno ${a.nombre} — ${b.nombre}`,
        patron: "base",
      });
    }
  }
}

// 5) Tourist coastal / scenic (ports + coastal countries)
const touristSeeds = ports.slice(0, 80);
for (const p of touristSeeds) {
  const path = nearestPath([p.id], 5, 220);
  if (path && path.length >= 3) {
    pushRoute("tur", path, {
      nombre: `Turístico ${byId[path[0]].nombre} — ${byId[path[path.length - 1]].nombre}`,
      patron: "parador",
      notas: "Itinerario costero / panorámico",
    });
  }
}

// 6) Ferry-bus: port to nearby foreign/coastal port
for (let i = 0; i < ports.length; i++) {
  const a = ports[i];
  const mates = ports
    .filter((b) => b.id !== a.id)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 60 && x.d < 1400)
    .sort((x, y) => x.d - y.d)
    .slice(0, 3);
  for (const { b } of mates) {
    const cityA = a.parent && byId[a.parent] ? byId[a.parent].id : a.id;
    const cityB = b.parent && byId[b.parent] ? byId[b.parent].id : b.id;
    pushRoute("fer", [cityA, a.id, b.id, cityB], {
      nombre: `Ferry-bus ${byId[cityA].nombre} — ${byId[cityB].nombre}`,
      patron: "base",
      notas: "Incluye tramo marítimo ProMods",
    });
  }
}

// 7) Extra airport links from nearby cities
for (const ap of airports) {
  const parent = ap.parent ? byId[ap.parent] : null;
  const nearCities = cities
    .filter((c) => !parent || c.id !== parent.id)
    .map((c) => ({ c, d: dist(ap, c) }))
    .filter((x) => x.d > 15 && x.d < 180)
    .sort((x, y) => x.d - y.d)
    .slice(0, 3);
  for (const { c } of nearCities) {
    pushRoute("ae", [c.id, ap.id], {
      nombre: `${c.nombre} ↔ ${ap.nombre}`,
      patron: "directo",
    });
  }
}

// 8) Dense filler: every city to its 2 nearest neighbors (short regional)
for (const c of cities) {
  const near = cities
    .filter((o) => o.id !== c.id && o.pais === c.pais)
    .map((o) => ({ o, d: dist(c, o) }))
    .filter((x) => x.d > 12 && x.d < 200)
    .sort((x, y) => x.d - y.d)
    .slice(0, 2);
  if (near.length === 2) {
    pushRoute("reg", [near[0].o.id, c.id, near[1].o.id], { patron: "parador" });
  } else if (near.length === 1) {
    pushRoute("reg", [c.id, near[0].o.id], { patron: "base" });
  }
}

// Sort by code
routes.sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));

const summary = {
  version: "1.0.0",
  generado: new Date().toISOString(),
  operador: operator,
  total_rutas: routes.length,
  total_paradas: stops.length,
  por_tipo: Object.fromEntries(lineTypes.map((t) => [t.id, routes.filter((r) => r.tipo_id === t.id).length])),
  por_pais_origen: {},
};
for (const r of routes) {
  const p = r.paises[0] || "?";
  summary.por_pais_origen[p] = (summary.por_pais_origen[p] || 0) + 1;
}

fs.writeFileSync(path.join(outDir, "lines-mass.json"), JSON.stringify({ version: summary.version, generado: summary.generado, total: routes.length, lines: routes }));
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary.por_tipo, null, 2));
console.log(`Generated ${routes.length} routes; stops ${stops.length}`);
