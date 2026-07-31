import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Rebuild stops.json from ETS2 base + DLC + ProMods/addon coordinate JSONs.
 * All entries are treated as real in-game cities (no inventadas).
 * Missing Iberia (and similar) cities get game X/Z estimated from OSM lat/lon
 * via affine fit against known Iberia coords.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawDir = path.join(root, "data/raw");

const PAIS_ES = {
  denmark: "Dinamarca",
  uk: "Reino Unido",
  netherlands: "Países Bajos",
  norway: "Noruega",
  germany: "Alemania",
  switzerland: "Suiza",
  poland: "Polonia",
  slovakia: "Eslovaquia",
  czech: "Chequia",
  belgium: "Bélgica",
  hungary: "Hungría",
  france: "Francia",
  sweden: "Suecia",
  austria: "Austria",
  luxembourg: "Luxemburgo",
  italy: "Italia",
  cyprus: "Chipre",
  moldova: "Moldavia",
  georgia: "Georgia",
  spain: "España",
  espana: "España",
  albania: "Albania",
  aland: "Åland",
  slovenia: "Eslovenia",
  slovenija: "Eslovenia",
  ukraine: "Ucrania",
  bosnia: "Bosnia y Herzegovina",
  finland: "Finlandia",
  croatia: "Croacia",
  iceland: "Islandia",
  israel: "Israel",
  jordan: "Jordania",
  russia: "Rusia",
  belarus: "Bielorrusia",
  romania: "Rumanía",
  bulgaria: "Bulgaria",
  serbia: "Serbia",
  turkey: "Turquía",
  lithuania: "Lituania",
  latvia: "Letonia",
  estonia: "Estonia",
  ireland: "Irlanda",
  portugal: "Portugal",
  greece: "Grecia",
  macedonia: "Macedonia del Norte",
  kosovo: "Kosovo",
  montenegro: "Montenegro",
  armenia: "Armenia",
  azerbaijan: "Azerbaiyán",
  morocco: "Marruecos",
  tunisia: "Túnez",
  egypt: "Egipto",
  kazakhstan: "Kazajistán",
  lebanon: "Líbano",
  syria: "Siria",
  saudi: "Arabia Saudí",
  saudia: "Arabia Saudí",
  iraq: "Irak",
  malta: "Malta",
  andorra: "Andorra",
  monaco: "Mónaco",
  greenland: "Groenlandia",
  svalbard: "Svalbard",
  westbank: "Cisjordania",
  faroe: "Islas Feroe",
  gibraltar: "Gibraltar",
  liecht: "Liechtenstein",
  iom: "Isla de Man",
  new_mexico: "Nuevo México",
};

const NOMBRE_ES = {
  Malaga: "Málaga",
  Madrid: "Madrid",
  Barcelona: "Barcelona",
  Sevilla: "Sevilla",
  Valencia: "València",
  "València": "València",
  Lisboa: "Lisboa",
  Porto: "Porto",
  Cordoba: "Córdoba",
  Leon: "León",
  "Gijón": "Gijón",
  Murcia: "Murcia",
  Zaragoza: "Zaragoza",
  Bilbao: "Bilbao",
  Napoli: "Nápoles",
  Roma: "Roma",
  Milano: "Milán",
  Torino: "Turín",
  Venezia: "Venecia",
  Marseille: "Marsella",
  Bordeaux: "Burdeos",
  Lyon: "Lyon",
  Paris: "París",
  Bruxelles: "Bruselas",
  Brussel: "Bruselas",
  Koln: "Colonia",
  "Köln": "Colonia",
  Munchen: "Múnich",
  "München": "Múnich",
  Wien: "Viena",
  Praha: "Praga",
  Warszawa: "Varsovia",
  "København": "Copenhague",
  Goteborg: "Göteborg",
  "Göteborg": "Göteborg",
  Athina: "Atenas",
};

/** Iberia DLC official list (wiki) */
const IBERIA = [
  ["A Coruña", "spain"],
  ["Albacete", "spain"],
  ["Algeciras", "spain"],
  ["Almaraz", "spain"],
  ["Almería", "spain"],
  ["Badajoz", "spain"],
  ["Bailén", "spain"],
  ["Barcelona", "spain"],
  ["Beja", "portugal"],
  ["Bilbao", "spain"],
  ["Burgos", "spain"],
  ["Ciudad Real", "spain"],
  ["Coimbra", "portugal"],
  ["Córdoba", "spain"],
  ["Cortiçadas de Lavre", "portugal"],
  ["El Ejido", "spain"],
  ["Évora", "portugal"],
  ["Faro", "portugal"],
  ["Gijón", "spain"],
  ["Granada", "spain"],
  ["Guarda", "portugal"],
  ["Huelva", "spain"],
  ["León", "spain"],
  ["Lisboa", "portugal"],
  ["Lleida", "spain"],
  ["Madrid", "spain"],
  ["Málaga", "spain"],
  ["Mengíbar", "spain"],
  ["Murcia", "spain"],
  ["Navia", "spain"],
  ["O Barco", "spain"],
  ["Olhão", "portugal"],
  ["Pamplona", "spain"],
  ["Ponte de Sor", "portugal"],
  ["Port de Sagunt", "spain"],
  ["Porto", "portugal"],
  ["Puertollano", "spain"],
  ["Salamanca", "spain"],
  ["Santander", "spain"],
  ["Setúbal", "portugal"],
  ["Sevilla", "spain"],
  ["Sines", "portugal"],
  ["Soria", "spain"],
  ["Tarragona", "spain"],
  ["Teruel", "spain"],
  ["València", "spain"],
  ["Valladolid", "spain"],
  ["Vandellòs", "spain"],
  ["Vigo", "spain"],
  ["Vila-real", "spain"],
  ["Zaragoza", "spain"],
];

const ORIGEN_BY_FILE = {
  cities_default: "ets2-base",
  cities: "ets2-merged",
  cities_fr: "ets2-dlc-france",
  cities_italy_map: "ets2-dlc-italia",
  cities_btbs: "ets2-dlc-baltic",
  cities_east: "ets2-dlc-going-east",
  cities_north: "ets2-dlc-scandinavia",
  cities_tsm: "ets2-dlc-iberia-partial",
  cities_promods_2: "promods",
  "cities_promods_2.50": "promods",
  cities_default_promods: "promods",
  cities_promods_me: "promods-middle-east",
  "cities_rusmap_2.0": "rusmap",
  cities_egypt: "egypt-addon",
  cities_kz: "promods-great-steppe",
  cities_project_balkans: "balkans-addon",
  "cities_project_balkans_2.2": "balkans-addon",
  cities_balkan_e: "balkans-addon",
  cities_corsica: "ets2-dlc-france",
};

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function origenFromFile(file) {
  const base = file.replace(/\.json$/, "");
  for (const [k, v] of Object.entries(ORIGEN_BY_FILE)) {
    if (base.startsWith(k) || base.includes(k.replace("cities_", ""))) return v;
  }
  if (base.includes("promods")) return "promods";
  if (base.includes("rusmap")) return "rusmap";
  return "ets2-dlc";
}

function addonFor(origen, country) {
  if (origen.startsWith("promods-middle")) return ["promods-middle-east"];
  if (origen.includes("steppe") || origen.includes("kz")) return ["promods-great-steppe"];
  if (origen.includes("rusmap")) return ["rusmap"];
  if (origen.includes("balkan")) return ["balkans-addon"];
  if (origen.includes("egypt")) return ["egypt-addon"];
  if (origen.startsWith("promods")) return ["promods"];
  if (origen.startsWith("ets2")) return ["ets2+promods"];
  return ["ets2+promods"];
}

function loadRawCities() {
  const map = new Map();
  for (const file of fs.readdirSync(rawDir).filter((f) => f.endsWith(".json"))) {
    // skip non-city dumps
    if (file.includes("ats") || file.includes("japan") || file.includes("open_spaces") || file.includes("wa.json") || file.includes("ut.json") || file.includes("yks") || file.includes("srm") || file.includes("old") || file.includes("nm.json")) {
      // still allow nm? skip ATS regions
      if (/ats|japan|open_spaces|_wa\.|_ut\.|yks|srm|old|nm\.json/.test(file)) continue;
    }
    let j;
    try {
      j = JSON.parse(fs.readFileSync(path.join(rawDir, file), "utf8"));
    } catch {
      continue;
    }
    let list = j.citiesList || j.cities || (Array.isArray(j) ? j : []);
    if (Array.isArray(list) && list.length && Array.isArray(list[0])) list = list.flat();
    const origen = origenFromFile(file);
    for (const c of list) {
      if (!c?.gameName) continue;
      const id = slug(c.gameName);
      const x = Number(c.x);
      const y = Number(c.y);
      const z = Number(c.z);
      if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
      const country = String(c.country || "").toLowerCase();
      if (country === "new_mexico") continue; // ATS
      const realName = c.realName || c.gameName;
      const nombre = NOMBRE_ES[realName] || realName;
      const prev = map.get(id);
      // Prefer DLC-specific / newer sources over sparse ones
      const score = (origen.includes("iberia") ? 50 : 0) + (origen.includes("dlc") ? 20 : 0) + (origen.includes("promods") ? 10 : 0) + (file.includes("2.50") ? 5 : 0);
      if (!prev || score >= (prev._score || 0)) {
        map.set(id, {
          id,
          nombre,
          nombre_juego: realName,
          gameName: c.gameName,
          pais: PAIS_ES[country] || country,
          pais_id: country === "espana" ? "spain" : country,
          x,
          y: Number.isFinite(y) ? y : 50,
          z,
          addons: addonFor(origen, country),
          tier: /madrid|paris|berlin|london|roma|lisboa|warszawa|wien|stockholm|oslo|amsterdam/i.test(realName) ? 1 : 2,
          origen_datos: origen.startsWith("promods") || origen.includes("rusmap") || origen.includes("balkan") || origen.includes("egypt") || origen.includes("steppe") ? origen : "ets2-dlc",
          parada_tipo: "ciudad",
          _score: score,
          _src: file,
        });
      }
    }
  }
  return map;
}

function findByName(map, name) {
  const s = slug(name);
  for (const c of map.values()) {
    if (slug(c.nombre) === s || slug(c.nombre_juego) === s || slug(c.gameName) === s || slug(c.id) === s) return c;
  }
  // common aliases
  const aliases = {
    malaga: ["malaga"],
    cordoba: ["cordoba"],
    leon: ["leon"],
    valencia: ["valencia", "valència"],
    "a-coruna": ["a-coruna", "coruna", "la-coruna"],
    evora: ["evora", "évora"],
    setubal: ["setubal", "setúbal"],
    olhao: ["olhao", "olhão"],
  };
  for (const c of map.values()) {
    const keys = [slug(c.nombre), slug(c.nombre_juego), slug(c.gameName), slug(c.id)];
    if (keys.includes(s)) return c;
    for (const [canon, list] of Object.entries(aliases)) {
      if (list.includes(s) && keys.some((k) => list.includes(k) || k === canon)) return c;
    }
  }
  return null;
}

async function geocode(name, countryCode) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=es&name=" +
    encodeURIComponent(name) +
    (countryCode ? "&countryCode=" + countryCode : "");
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  return { lat: hit.latitude, lon: hit.longitude };
}

/** Fit x = a*lon + b*lat + c ; z = d*lon + e*lat + f */
function fitAffine(samples) {
  // samples: {lat,lon,x,z}
  // solve with normal equations for 3 params each
  function solve(getY) {
    // X beta = y with columns [lon, lat, 1]
    let XtX = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    let XtY = [0, 0, 0];
    for (const s of samples) {
      const row = [s.lon, s.lat, 1];
      const y = getY(s);
      for (let i = 0; i < 3; i++) {
        XtY[i] += row[i] * y;
        for (let j = 0; j < 3; j++) XtX[i][j] += row[i] * row[j];
      }
    }
    // Gaussian elimination 3x3
    const A = XtX.map((r, i) => [...r, XtY[i]]);
    for (let i = 0; i < 3; i++) {
      let piv = i;
      for (let r = i + 1; r < 3; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
      [A[i], A[piv]] = [A[piv], A[i]];
      const div = A[i][i] || 1e-9;
      for (let c = i; c < 4; c++) A[i][c] /= div;
      for (let r = 0; r < 3; r++) {
        if (r === i) continue;
        const f = A[r][i];
        for (let c = i; c < 4; c++) A[r][c] -= f * A[i][c];
      }
    }
    return [A[0][3], A[1][3], A[2][3]];
  }
  return { x: solve((s) => s.x), z: solve((s) => s.z) };
}

function applyAffine(fit, lat, lon) {
  const [a, b, c] = fit.x;
  const [d, e, f] = fit.z;
  return { x: a * lon + b * lat + c, z: d * lon + e * lat + f };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const map = loadRawCities();
  console.log("Loaded from JSON:", map.size);

  // Build Iberia affine from known cities
  const iberiaKnown = [];
  for (const [name, country] of IBERIA) {
    const hit = findByName(map, name) || findByName(map, name.replace("á", "a").replace("ñ", "n"));
    if (!hit) continue;
    if (hit.pais_id !== "spain" && hit.pais_id !== "portugal" && hit.pais !== "España" && hit.pais !== "Portugal") {
      // still ok if name matched
    }
    const cc = country === "spain" ? "ES" : "PT";
    const g = await geocode(name.replace("València", "Valencia").replace("Málaga", "Malaga"), cc);
    await sleep(60);
    if (!g) continue;
    iberiaKnown.push({ name, lat: g.lat, lon: g.lon, x: hit.x, z: hit.z, id: hit.id });
  }
  console.log("Iberia calibration samples:", iberiaKnown.length);
  const fit = iberiaKnown.length >= 6 ? fitAffine(iberiaKnown) : null;

  let added = 0;
  for (const [name, country] of IBERIA) {
    if (findByName(map, name)) continue;
    if (!fit) break;
    const cc = country === "spain" ? "ES" : "PT";
    const g = await geocode(name.replace("València", "Valencia"), cc);
    await sleep(60);
    if (!g) {
      console.warn("No geo for", name);
      continue;
    }
    const { x, z } = applyAffine(fit, g.lat, g.lon);
    const id = slug(name);
    map.set(id, {
      id,
      nombre: name,
      nombre_juego: name,
      gameName: id,
      pais: country === "spain" ? "España" : "Portugal",
      pais_id: country,
      x: Math.round(x * 10) / 10,
      y: 50,
      z: Math.round(z * 10) / 10,
      addons: ["ets2+promods"],
      tier: /Madrid|Lisboa|Barcelona|Porto|Sevilla|Málaga|València/.test(name) ? 1 : 2,
      origen_datos: "ets2-dlc-iberia",
      parada_tipo: "ciudad",
      coords_estimadas: true,
      _score: 40,
      _src: "iberia-affine",
    });
    added++;
    console.log("+ Iberia", name, Math.round(x), Math.round(z));
  }

  // Promote inventadas that match real names? We rebuild clean — drop inventadas.
  const stops = [...map.values()].map((s) => {
    const { _score, _src, ...rest } = s;
    return rest;
  });
  stops.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const doc = {
    version: "0.3.0",
    total: stops.length,
    generado: new Date().toISOString(),
    nota: "Ciudades reales ETS2 (base+DLC) + ProMods/addons. Iberia completa (coords de juego o estimadas por ajuste geográfico).",
    stops,
  };
  fs.writeFileSync(path.join(root, "data/stops.json"), JSON.stringify(doc, null, 2));

  const byPais = {};
  for (const s of stops) byPais[s.pais] = (byPais[s.pais] || 0) + 1;
  console.log("TOTAL", stops.length, "iberia added", added);
  console.log(
    "ES",
    stops.filter((s) => s.pais === "España").length,
    "PT",
    stops.filter((s) => s.pais === "Portugal").length
  );
  console.log("Malaga?", stops.find((s) => /m[aá]laga/i.test(s.nombre)));
  console.log(
    Object.entries(byPais)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, v]) => k + ":" + v)
      .join(", ")
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
