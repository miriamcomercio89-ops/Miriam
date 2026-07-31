import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * EuroPerote route generator v2
 * - Codes: EP-{TIPO}-{####}  (EP-REG-0001, EP-INT-0045, …)
 * - Names start with tipo
 * - Intercity only on real ProMods coords; invented = local near madre
 * - Paths: progress-to-destination + axis corridors
 * - Strict geography for EXP/INT (short hub detours allowed)
 */

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
const SCALE_KM = 0.019;

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

function isRealCity(s) {
  return s && !s.parent && s.origen_datos !== "inventada" && (s.parada_tipo === "ciudad" || s.parada_tipo === "pueblo");
}

function isLocalChild(s) {
  return s && s.parent && byId[s.parent] && isRealCity(byId[s.parent]);
}

/** Nearest real ProMods city (madre) for an invented place */
function nearestReal(s, reals) {
  let best = null;
  let bestD = Infinity;
  for (const r of reals) {
    const d = dist(s, r);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return { madre: best, d: bestD };
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

/**
 * Geographic path from A → B.
 * Each hop must reduce distance to destination (progress).
 * Optional short detour via hub (capital/port/airport parent city) if still progressing overall.
 */
function pathToward(origin, dest, pool, opts = {}) {
  const {
    maxStops = 10,
    minHop = 25,
    maxHop = 320,
    minProgress = 8,
    detourSlack = 0.12,
    allowHubDetour = true,
    maxDetourKm = 90,
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
      const progress = rem - toDest;
      if (progress < minProgress) continue; // must get closer to dest
      // avoid sharp zigzags: don't go farther from origin than needed
      const score = fromCur + toDest * 0.9;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }

    // optional hub detour: allow small non-progress hop to a tier-1 hub if next would progress
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

  // Validate monotonic progress (except one allowed hub detour)
  let backtracks = 0;
  for (let i = 1; i < chain.length - 1; i++) {
    const prev = byId[chain[i - 1]];
    const mid = byId[chain[i]];
    const d0 = dist(prev, dest);
    const d1 = dist(mid, dest);
    if (d1 >= d0 - 1) backtracks++;
  }
  if (backtracks > (allowHubDetour ? 1 : 0)) return null;

  const km = pathKm(chain);
  if (km > straight * 2.2 + 80) return null; // absurd detour
  if (chain.length < 2) return null;
  return chain;
}

/** Axis corridor: sort by coordinate, take contiguous window */
function corridorWindow(list, axis, start, len) {
  const sorted = [...list].sort((a, b) => (axis === "x" ? a.x - b.x : a.z - b.z) || a.nombre.localeCompare(b.nombre, "es"));
  const slice = sorted.slice(start, start + len);
  if (slice.length < 3) return null;
  // Ensure consecutive hops aren't insane
  const ids = [slice[0].id];
  for (let i = 1; i < slice.length; i++) {
    if (dist(slice[i - 1], slice[i]) > 380) break;
    ids.push(slice[i].id);
  }
  return ids.length >= 3 ? ids : null;
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
  const km = pathKm(ids);
  if (km > straight * 1.85 + 60) return false;
  for (let i = 1; i < ids.length; i++) {
    if (dist(byId[ids[i - 1]], byId[ids[i]]) > 420) return false;
  }
  // consecutive bearings shouldn't reverse sharply for 3+ stop paths
  if (ids.length >= 4) {
    for (let i = 1; i < ids.length - 1; i++) {
      const a = byId[ids[i - 1]];
      const b = byId[ids[i]];
      const c = byId[ids[i + 1]];
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const bcx = c.x - b.x;
      const bcz = c.z - b.z;
      const dot = abx * bcx + abz * bcz;
      const mag = Math.hypot(abx, abz) * Math.hypot(bcx, bcz);
      if (mag > 1 && dot / mag < -0.35) return false; // >~110° turn
    }
  }
  return true;
}

const counters = Object.fromEntries(lineTypes.map((t) => [t.id, 0]));
const routes = [];
const seen = new Set();

function codeFor(tipoId) {
  counters[tipoId]++;
  return `EP-${tipoById[tipoId].prefijo}-${String(counters[tipoId]).padStart(4, "0")}`;
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
      ? ` Cruza ${paises.length} territorios (${paises.join(", ")}); peajes y fronteras posibles según el mapa.`
      : ` Circula en ${paises[0]}, siguiendo un eje geográfico coherente entre nodos ProMods.`;
  const interTxt =
    inter.length === 0
      ? "Servicio directo, sin paradas intermedias."
      : inter.length <= 4
        ? `Paradas intermedias en orden geográfico: ${inter.join(", ")}.`
        : `Itinerario con ${inter.length} paradas en progresión hacia destino: ${inter.slice(0, 6).join(", ")}…`;
  const tipExtra = {
    urb: "Servicio urbano local: solo paradas de la misma ciudad (centro, barrio, universidad, puerto o aeropuerto).",
    brt: "Corredor BRT intramunicipal de alta capacidad.",
    reg: "Interurbano regional sobre ciudades con coordenadas reales ProMods, o enlace local inventado↔madre.",
    exp: "Express geográfico: avanza siempre hacia el destino, con desvío corto opcional por hub.",
    int: "Internacional con camino estricto origen→destino sin zigzags absurdos.",
    noc: "Nocturno sobre un corredor largo ya validado geográficamente.",
    tur: "Turístico a lo largo de un eje costero/portuario ordenado.",
    ae: "Lanzadera aeroportuaria corta y directa.",
    fer: "Ferry-bus: ciudad→puerto→puerto→ciudad en progresión marítima/carretera.",
  }[route.tipo_id];

  return [
    `${tipo.nombre} ${route.codigo} de EuroPerote entre ${origen} y ${destino} (${route.distancia_km} km estimados).`,
    tipExtra,
    interTxt + atraviesa,
    `Mapa: ${addons || "ETS2 + ProMods"}. Material: ${route.material_nombre}. Operador único: EuroPerote.`,
    names.length > 3 ? `Itinerario completo (${names.length}): ${names.join(" → ")}.` : `Paradas: ${names.join(" → ")}.`,
  ].join(" ");
}

function pushRoute(tipoId, ids, extra = {}) {
  ids = (ids || []).filter((id) => byId[id]);
  if (ids.length < 2) return null;
  if (!extra.skipCoherence && !pathIsCoherent(ids, extra.maxBacktracks ?? 0) && tipoId !== "urb" && tipoId !== "brt" && tipoId !== "ae") {
    if (tipoId !== "fer" || !extra.force) return null;
  }
  const fp = fingerprint(ids, tipoId);
  const fpRev = fingerprint([...ids].reverse(), tipoId);
  if (seen.has(fp) || seen.has(fpRev)) return null;
  seen.add(fp);

  const tipo = tipoById[tipoId];
  const nombres = ids.map((id) => byId[id].nombre);
  const km = pathKm(ids);
  const mat = pickFleet(tipoId, km);
  const codigo = codeFor(tipoId);
  const baseName = extra.nombreCore || `${nombres[0]} — ${nombres[nombres.length - 1]}`;
  const nombre = extra.nombre || `${tipo.nombre} ${baseName}`;

  const route = {
    id: codigo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    codigo,
    nombre,
    tipo_id: tipoId,
    prefijo: tipo.prefijo,
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
    origen_datos: extra.origen_datos || "generada-v2",
    eje: extra.eje || "",
    notas: extra.notas || "",
  };
  route.descripcion = describe(route);
  routes.push(route);
  return route;
}

// ——— pools ———
const reals = stops.filter(isRealCity);
const inventadas = stops.filter((s) => !s.parent && s.origen_datos === "inventada");
const childrenOf = {};
for (const s of stops) {
  if (s.parent && byId[s.parent]) (childrenOf[s.parent] ||= []).push(s);
}
const hubs = reals.filter((s) => s.tier <= 2).sort((a, b) => a.tier - b.tier || a.nombre.localeCompare(b.nombre, "es"));
const capitals = reals.filter((s) => s.tier === 1);
const airports = stops.filter((s) => s.parada_tipo === "aeropuerto" && isLocalChild(s));
const ports = stops.filter((s) => s.parada_tipo === "puerto" && isLocalChild(s));

const byPais = {};
for (const s of reals) (byPais[s.pais] ||= []).push(s);

// Madre map for invented
const madreOf = new Map();
for (const inv of inventadas) {
  const { madre, d } = nearestReal(inv, reals);
  if (madre && d < 220) madreOf.set(inv.id, { madre, d });
}

console.log(`Reales: ${reals.length} | Inventadas locales: ${madreOf.size} | Hubs: ${hubs.length}`);

// 1) URB + BRT + AER intramunicipales (reales e inventadas con hijas locales)
const urbanRoots = stops.filter((s) => !s.parent && (childrenOf[s.id] || []).length);
for (const city of urbanRoots) {
  const kids = childrenOf[city.id] || [];
  const order = [city, ...kids.sort((a, b) => a.parada_tipo.localeCompare(b.parada_tipo))];
  pushRoute("urb", order.map((s) => s.id), {
    nombreCore: city.nombre,
    patron: "parador",
    skipCoherence: true,
  });
  if (order.length >= 3) {
    pushRoute("brt", [order[0].id, order[Math.floor(order.length / 2)].id, order[order.length - 1].id], {
      nombreCore: city.nombre,
      patron: "directo",
      skipCoherence: true,
    });
  }
  const ap = kids.find((k) => k.parada_tipo === "aeropuerto");
  if (ap) {
    pushRoute("ae", [city.id, ap.id], {
      nombreCore: `${city.nombre}: ciudad ↔ aeropuerto`,
      patron: "directo",
      skipCoherence: true,
    });
  }
}

// 2) Inventadas solo locales: inventada → madre ProMods real (nunca encadenar inventadas entre sí)
for (const [invId, { madre, d }] of madreOf) {
  if (d < 8 || d > 180) continue;
  pushRoute("reg", [invId, madre.id], {
    nombreCore: `${byId[invId].nombre} — ${madre.nombre} (local)`,
    patron: "base",
    notas: "Enlace local inventado↔ciudad madre ProMods",
    skipCoherence: true,
  });
}

// 3) REGIONAL — axis corridors within country (endpoints + pathToward) and progressive pairs
for (const [pais, list] of Object.entries(byPais)) {
  if (list.length < 3) continue;
  for (const axis of ["z", "x"]) {
    const sorted = [...list].sort((a, b) => (axis === "x" ? a.x - b.x : a.z - b.z) || a.nombre.localeCompare(b.nombre, "es"));
    for (let win = 4; win <= 8; win++) {
      for (let i = 0; i + win <= sorted.length; i += Math.max(2, Math.floor(win / 2))) {
        const a = sorted[i];
        const b = sorted[i + win - 1];
        const chain = pathToward(a, b, list, {
          maxStops: Math.min(win, 7),
          maxHop: 300,
          minHop: 18,
          minProgress: 12,
          allowHubDetour: true,
          maxDetourKm: 65,
        });
        if (chain && chain.length >= 3) {
          pushRoute("reg", chain, {
            nombreCore: `${byId[chain[0]].nombre} — ${byId[chain[chain.length - 1]].nombre}`,
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
      if (chain) {
        pushRoute("reg", chain, {
          nombreCore: `${byId[chain[0]].nombre} — ${byId[chain[chain.length - 1]].nombre}`,
          patron: chain.length > 3 ? "parador" : "base",
          eje: `progresión ${pais}`,
        });
      }
    }
  }
}

// 4) EXPRESS — hub to hub, strict geography
for (let i = 0; i < hubs.length; i++) {
  const a = hubs[i];
  const candidates = hubs
    .filter((b) => b.id !== a.id)
    .map((b) => ({ b, d: dist(a, b) }))
    .filter((x) => x.d > 60 && x.d < 1100)
    .sort((x, y) => x.d - y.d)
    .slice(0, 8);

  for (const { b } of candidates) {
    // direct
    if (dist(a, b) <= 450) {
      pushRoute("exp", [a.id, b.id], {
        nombreCore: `${a.nombre} — ${b.nombre}`,
        patron: "directo",
      });
    }
    // with progressive intermediates from same-country or full reals
    const pool = a.pais === b.pais ? byPais[a.pais] : reals;
    const chain = pathToward(a, b, pool, {
      maxStops: a.pais === b.pais ? 5 : 7,
      maxHop: 380,
      minHop: 40,
      minProgress: 15,
      allowHubDetour: true,
      maxDetourKm: 100,
    });
    if (chain && chain.length >= 2) {
      pushRoute("exp", chain, {
        nombreCore: `${a.nombre} — ${b.nombre}`,
        patron: chain.length <= 3 ? "directo" : "base",
        eje: "hub-progresión",
        maxBacktracks: 1,
      });
    }
  }
}

// 5) INTERNATIONAL — different country, strict path on all reals
for (let i = 0; i < hubs.length; i++) {
  const a = hubs[i];
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
    if (!chain || chain.length < 2) continue;
    // must actually cross countries
    if (countries(chain).length < 2) continue;
    pushRoute("int", chain, {
      nombreCore: `${a.nombre} — ${b.nombre}`,
      patron: chain.length > 4 ? "parador" : "directo",
      eje: "internacional-progresión",
      maxBacktracks: 1,
    });
    if (pathKm(chain) > 450) {
      pushRoute("noc", chain, {
        nombreCore: `${a.nombre} — ${b.nombre}`,
        patron: "base",
        eje: "nocturno-internacional",
        maxBacktracks: 1,
      });
    }
  }
}

// 6) TOURIST — ports ordered along coast (by x then z), progressive
const portCities = [...new Set(ports.map((p) => p.parent).filter(Boolean))]
  .map((id) => byId[id])
  .filter(Boolean);
const portsSorted = [...portCities].sort((a, b) => a.x - b.x || a.z - b.z);
for (let i = 0; i + 3 < portsSorted.length; i += 2) {
  const slice = portsSorted.slice(i, i + 5);
  const path = [];
  for (const s of slice) {
    if (path.length && dist(byId[path[path.length - 1]], s) > 400) break;
    path.push(s.id);
  }
  if (path.length >= 3 && pathIsCoherent(path)) {
    pushRoute("tur", path, {
      nombreCore: `${byId[path[0]].nombre} — ${byId[path[path.length - 1]].nombre}`,
      patron: "parador",
      eje: "costa",
      notas: "Eje costero ordenado",
    });
  }
}

// 7) FERRY — port pairs with geographic progress; city-port-port-city
for (let i = 0; i < ports.length; i++) {
  const pa = ports[i];
  const cityA = byId[pa.parent];
  if (!cityA) continue;
  const mates = ports
    .filter((pb) => pb.id !== pa.id && pb.parent !== pa.parent)
    .map((pb) => ({ pb, d: dist(pa, pb) }))
    .filter((x) => x.d > 80 && x.d < 1200)
    .sort((x, y) => x.d - y.d)
    .slice(0, 2);
  for (const { pb } of mates) {
    const cityB = byId[pb.parent];
    if (!cityB) continue;
    const ids = [cityA.id, pa.id, pb.id, cityB.id];
    // ferry can skip normal coherence (sea hop) but cities should not zigzag wildly
    const roadish = dist(cityA, cityB);
    if (pathKm([cityA.id, cityB.id]) > roadish * 1.01) {
      /* ok */
    }
    pushRoute("fer", ids, {
      nombreCore: `${cityA.nombre} — ${cityB.nombre}`,
      patron: "base",
      notas: "Tramo ferry ProMods",
      force: true,
      skipCoherence: true,
    });
  }
}

// 8) Extra AER — nearby real city → airport (short, progressive)
for (const ap of airports) {
  const parent = byId[ap.parent];
  const near = reals
    .filter((c) => c.id !== parent?.id)
    .map((c) => ({ c, d: dist(ap, c) }))
    .filter((x) => x.d > 20 && x.d < 150)
    .sort((x, y) => x.d - y.d)
    .slice(0, 2);
  for (const { c } of near) {
    pushRoute("ae", [c.id, ap.id], {
      nombreCore: `${c.nombre} ↔ ${ap.nombre.replace(/^.*—\s*/, "")}`,
      patron: "directo",
      skipCoherence: true,
    });
  }
}

// 9) Extra long NOC from domestic express corridors > 500km
for (const r of [...routes]) {
  if (r.tipo_id === "exp" && r.distancia_km > 500 && r.paises.length === 1) {
    pushRoute("noc", r.paradas, {
      nombreCore: `${r.paradas_nombres[0]} — ${r.paradas_nombres[r.paradas_nombres.length - 1]}`,
      patron: "base",
      eje: "nocturno-nacional",
    });
  }
}

routes.sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));

const summary = {
  version: "2.0.0",
  generado: new Date().toISOString(),
  operador: operator,
  total_rutas: routes.length,
  total_paradas: stops.length,
  ciudades_reales: reals.length,
  inventadas_locales: madreOf.size,
  por_tipo: Object.fromEntries(lineTypes.map((t) => [t.id, routes.filter((r) => r.tipo_id === t.id).length])),
  codigos_ejemplo: routes.slice(0, 5).map((r) => r.codigo),
};

fs.writeFileSync(
  path.join(outDir, "lines-mass.json"),
  JSON.stringify({ version: summary.version, generado: summary.generado, total: routes.length, lines: routes })
);
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary.por_tipo, null, 2));
console.log(`Generated ${routes.length} routes | examples ${summary.codigos_ejemplo.join(", ")}`);
