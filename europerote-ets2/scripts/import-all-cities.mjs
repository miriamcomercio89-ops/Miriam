import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Import ALL in-game cities from ets2.online + every DLC/ProMods/addon JSON in data/raw.
 * IDs are latinized so Cyrillic/Greek/Georgian names never collapse to empty strings.
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
  "northern ireland": "Irlanda del Norte",
  northern_ireland: "Irlanda del Norte",
  nireland: "Irlanda del Norte",
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
  "faroe islands": "Islas Feroe",
  gibraltar: "Gibraltar",
  liecht: "Liechtenstein",
  liechtenstein: "Liechtenstein",
  iom: "Isla de Man",
  guernsey: "Guernsey",
  jersey: "Jersey",
};

const NOMBRE_ES = {
  Malaga: "Málaga",
  Málaga: "Málaga",
  Madrid: "Madrid",
  Barcelona: "Barcelona",
  Sevilla: "Sevilla",
  Seville: "Sevilla",
  Valencia: "València",
  València: "València",
  Lisboa: "Lisboa",
  Lisbon: "Lisboa",
  Porto: "Porto",
  Cordoba: "Córdoba",
  Córdoba: "Córdoba",
  Leon: "León",
  León: "León",
  Roma: "Roma",
  Rome: "Roma",
  Milano: "Milán",
  Milan: "Milán",
  Napoli: "Nápoles",
  Naples: "Nápoles",
  Torino: "Turín",
  Turin: "Turín",
  Venezia: "Venecia",
  Venice: "Venecia",
  Genova: "Génova",
  Genoa: "Génova",
  Firenze: "Florencia",
  Florence: "Florencia",
  Marseille: "Marsella",
  Bordeaux: "Burdeos",
  Paris: "París",
  Bruxelles: "Bruselas",
  Brussel: "Bruselas",
  Brussels: "Bruselas",
  Koln: "Colonia",
  Köln: "Colonia",
  Cologne: "Colonia",
  Munchen: "Múnich",
  München: "Múnich",
  Munich: "Múnich",
  Wien: "Viena",
  Vienna: "Viena",
  Praha: "Praga",
  Prague: "Praga",
  Warszawa: "Varsovia",
  Warsaw: "Varsovia",
  København: "Copenhague",
  Copenhagen: "Copenhague",
  Goteborg: "Gotemburgo",
  Göteborg: "Gotemburgo",
  Gothenburg: "Gotemburgo",
  Athina: "Atenas",
  Athens: "Atenas",
  Belgrade: "Belgrado",
  Sofia: "Sofía",
  Istanbul: "Estambul",
  Bucharest: "Bucarest",
  Bucureşti: "Bucarest",
  Bucuresti: "Bucarest",
  Reykjavik: "Reikiavík",
  Reykjavík: "Reikiavík",
  "Saint Petersburg": "San Petersburgo",
  "Sankt-Peterburg": "San Petersburgo",
};

const CYR = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "E", Ж: "Zh", З: "Z", И: "I", Й: "Y",
  К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F",
  Х: "H", Ц: "Ts", Ч: "Ch", Ш: "Sh", Щ: "Sch", Ъ: "", Ы: "Y", Ь: "", Э: "E", Ю: "Yu", Я: "Ya",
  ґ: "g", ї: "yi", є: "ye", і: "i", Ґ: "G", Ї: "Yi", Є: "Ye", І: "I",
};
const GR = {
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i", κ: "k", λ: "l",
  μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f",
  χ: "ch", ψ: "ps", ω: "o", ά: "a", έ: "e", ή: "i", ί: "i", ό: "o", ύ: "y", ώ: "o", ϊ: "i", ϋ: "y",
  Α: "A", Β: "B", Γ: "G", Δ: "D", Ε: "E", Ζ: "Z", Η: "I", Θ: "Th", Ι: "I", Κ: "K", Λ: "L",
  Μ: "M", Ν: "N", Ξ: "X", Ο: "O", Π: "P", Ρ: "R", Σ: "S", Τ: "T", Υ: "Y", Φ: "F", Χ: "Ch", Ψ: "Ps", Ω: "O",
};
const GEO = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l",
  მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k",
  ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

function latinize(s) {
  return [...String(s)]
    .map((ch) => CYR[ch] || GR[ch] || GEO[ch] || ch)
    .join("");
}

function slugify(s) {
  const base = latinize(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "city";
}

function paisEs(country) {
  const key = String(country || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  return PAIS_ES[key] || PAIS_ES[key.replace(/_/g, " ")] || (country ? String(country) : "Desconocido");
}

function paisId(country) {
  const key = String(country || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  if (key === "espana") return "spain";
  if (key === "liecht") return "liechtenstein";
  if (key === "nireland" || key === "northern_ireland" || key === "northern ireland") return "northern_ireland";
  return key || "xx";
}

function nombreEs(name) {
  return NOMBRE_ES[name] || name;
}

function tierOf(name) {
  return /madrid|par[ií]s|berlin|london|roma|rome|lisboa|lisbon|warszawa|warsaw|wien|vienna|stockholm|oslo|amsterdam|istanbul|estambul|moscow|mosc[uú]|belgrade|belgrado|budapest|prague|praha|athens|athina|sof[ií]a|bucarest|bucharest|warsaw|kyiv|kiev/i.test(
    name
  )
    ? 1
    : 2;
}

function addonFor(origen) {
  if (!origen) return ["ets2+promods"];
  if (origen.includes("middle") || origen.includes("me")) return ["promods-middle-east"];
  if (origen.includes("steppe") || origen.includes("kz")) return ["promods-great-steppe"];
  if (origen.includes("rusmap")) return ["rusmap"];
  if (origen.includes("balkan")) return ["balkans-addon"];
  if (origen.includes("egypt")) return ["egypt-addon"];
  if (origen.startsWith("promods")) return ["promods"];
  return ["ets2+promods"];
}

function origenFromFile(file) {
  const base = file.replace(/\.json$/i, "");
  if (base.includes("promods_me")) return "promods-middle-east";
  if (base.includes("promods")) return "promods";
  if (base.includes("rusmap")) return "rusmap";
  if (base.includes("balkan")) return "balkans-addon";
  if (base.includes("egypt")) return "egypt-addon";
  if (base.includes("kz")) return "promods-great-steppe";
  if (base.includes("italy")) return "ets2-dlc-italia";
  if (base.includes("_fr") || base.includes("corsica")) return "ets2-dlc-france";
  if (base.includes("btbs")) return "ets2-dlc-baltic";
  if (base.includes("east")) return "ets2-dlc-going-east";
  if (base.includes("north")) return "ets2-dlc-scandinavia";
  if (base.includes("tsm")) return "ets2-dlc-iberia-partial";
  return "ets2-dlc";
}

function uniqueId(base, used) {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n++}`;
  }
  used.add(id);
  return id;
}

function nearExisting(list, x, z, thresh = 900) {
  for (const c of list) {
    if (Math.hypot(c.x - x, c.z - z) < thresh) return c;
  }
  return null;
}

function loadOnline() {
  const jsPath = path.join(rawDir, "ets2online-cities.js");
  const jsonPath = path.join(rawDir, "ets2online-cities.json");
  let cities = [];
  if (fs.existsSync(jsPath)) {
    const t = fs.readFileSync(jsPath, "utf8");
    const m = t.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!m) throw new Error("No se pudo parsear ets2online-cities.js");
    cities = Function(`"use strict"; return (${m[1]});`)();
  } else if (fs.existsSync(jsonPath)) {
    cities = JSON.parse(fs.readFileSync(jsonPath, "utf8")).cities;
  } else {
    throw new Error("Falta data/raw/ets2online-cities.js");
  }

  const used = new Set();
  const out = [];
  for (const c of cities) {
    const en = c.LocalizedNames?.en_us || c.LocalizedNames?.en_gb || c.Name;
    const es = c.LocalizedNames?.es_es || c.LocalizedNames?.es_la || en;
    const id = uniqueId(slugify(en), used);
    const country = String(c.Country || "").toLowerCase();
    if (country === "new_mexico") continue;
    out.push({
      id,
      nombre: nombreEs(es),
      nombre_juego: en,
      nombre_original: c.Name,
      gameName: slugify(en).replace(/-/g, ""),
      pais: paisEs(country),
      pais_id: paisId(country),
      country_code: c.CountryCode || "",
      x: Number(c.X),
      y: 0,
      z: Number(c.Y),
      map_x: Number(c.X),
      map_y: Number(c.Y),
      addons: ["ets2+promods"],
      tier: tierOf(en + " " + es),
      origen_datos: "ets2.online",
      parada_tipo: "ciudad",
    });
  }
  return { stops: out, used };
}

function loadRawExtras(existing, used) {
  const added = [];
  for (const file of fs.readdirSync(rawDir)) {
    if (!file.endsWith(".json")) continue;
    if (file.startsWith("ets2online")) continue;
    if (/nm\.json|new_mexico|ats|japan|open_spaces/.test(file)) continue;
    let j;
    try {
      j = JSON.parse(fs.readFileSync(path.join(rawDir, file), "utf8"));
    } catch {
      continue;
    }
    const list = j.citiesList || j.cities || [];
    const origen = origenFromFile(file);
    for (const c of list) {
      if (!c?.gameName && !c?.realName) continue;
      const country = String(c.country || "").toLowerCase();
      if (country === "new_mexico") continue;
      const x = Number(c.x);
      const z = Number(c.z);
      if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
      if (nearExisting(existing, x, z, 900)) continue;
      const realName = c.realName || c.gameName;
      const en = latinize(realName);
      const idBase = slugify(c.gameName || en || realName);
      if (!idBase || idBase === "city") continue;
      const id = uniqueId(idBase, used);
      const stop = {
        id,
        nombre: nombreEs(realName),
        nombre_juego: en || realName,
        nombre_original: realName,
        gameName: c.gameName || idBase,
        pais: paisEs(country),
        pais_id: paisId(country),
        country_code: "",
        x,
        y: Number(c.y) || 0,
        z,
        map_x: x,
        map_y: z,
        addons: addonFor(origen),
        tier: tierOf(realName),
        origen_datos: origen.startsWith("ets2") ? "ets2-dlc" : origen,
        parada_tipo: "ciudad",
        _src: file,
      };
      existing.push(stop);
      added.push(stop);
    }
  }
  return added;
}

function main() {
  const { stops, used } = loadOnline();
  console.log("ets2.online:", stops.length);
  const extras = loadRawExtras(stops, used);
  console.log("extras DLC/ProMods:", extras.length);

  // Normalize leftover bad country labels
  for (const s of stops) {
    if (s.pais === "espana" || s.pais_id === "espana") {
      s.pais = "España";
      s.pais_id = "spain";
    }
    if (s.pais === "kazakhstan" || s.pais_id === "kazakhstan") {
      s.pais = "Kazajistán";
      s.pais_id = "kazakhstan";
    }
    if (s.pais === "liecht" || s.pais_id === "liecht") {
      s.pais = "Liechtenstein";
      s.pais_id = "liechtenstein";
    }
    delete s._src;
  }

  stops.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const doc = {
    version: "0.6.0",
    total: stops.length,
    fuente: "https://ets2.online/map/ets2pro + DLC/ProMods JSON",
    generado: new Date().toISOString(),
    stops,
  };
  fs.writeFileSync(path.join(root, "data/stops.json"), JSON.stringify(doc, null, 2));

  const byPais = {};
  for (const s of stops) byPais[s.pais] = (byPais[s.pais] || 0) + 1;
  console.log("TOTAL", stops.length);
  console.log(
    Object.entries(byPais)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v}`)
      .join(", ")
  );
  for (const q of ["Málaga", "Belgrado", "Sofía", "Roma", "Génova", "Estambul"]) {
    console.log(q, "→", stops.find((s) => s.nombre === q || s.nombre.includes(q))?.id);
  }
}

main();
