import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outCities = path.join(root, "output/cities-real.json");
const geoPath = path.join(root, "data/cities-geo.json");

const { cities } = JSON.parse(fs.readFileSync(outCities, "utf8"));
const prev = fs.existsSync(geoPath) ? JSON.parse(fs.readFileSync(geoPath, "utf8")) : { cities: [] };
const byId = Object.fromEntries((prev.cities || []).map((c) => [c.id, c]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Manual overrides for ambiguous / game-specific names */
const OVERRIDES = {
  "ciudadreal": { lat: 38.9861, lon: -3.9291 },
  "kaliningrad": { lat: 54.7104, lon: 20.4522 },
  "gdansk": { lat: 54.352, lon: 18.6466 },
  "hookofholland": { lat: 51.977, lon: 4.133 },
  "newcastleupon-tyne": { lat: 54.9783, lon: -1.6178 },
  "newcastle-upon-tyne": { lat: 54.9783, lon: -1.6178 },
};

async function geocodeOpenMeteo(name, countryCode) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=es&name=" +
    encodeURIComponent(name) +
    (countryCode && countryCode !== "XX" ? "&countryCode=" + encodeURIComponent(countryCode) : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  return { lat: hit.latitude, lon: hit.longitude, display: `${hit.name}, ${hit.country || ""}`.trim() };
}

async function geocodeNominatim(name, pais) {
  const q = `${name}, ${pais}`;
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(q);
  const res = await fetch(url, {
    headers: { "User-Agent": "EuroPerote-Catalog/1.0 (github.com/miriamcomercio89-ops/Miriam)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.[0]) return null;
  return { lat: Number(data[0].lat), lon: Number(data[0].lon), display: data[0].display_name };
}

const out = [];
let ok = 0;
let fail = 0;
let cached = 0;

for (let i = 0; i < cities.length; i++) {
  const c = cities[i];
  if (byId[c.id]?.lat != null && byId[c.id]?.lon != null) {
    out.push({ ...c, lat: byId[c.id].lat, lon: byId[c.id].lon, geo_display: byId[c.id].geo_display, geo_fuente: "cache" });
    cached++;
    continue;
  }
  if (OVERRIDES[c.id]) {
    const g = OVERRIDES[c.id];
    out.push({ ...c, lat: g.lat, lon: g.lon, geo_display: c.nombre, geo_fuente: "override" });
    ok++;
    continue;
  }

  let g = null;
  try {
    g = await geocodeOpenMeteo(c.nombre_juego || c.nombre, c.iso);
    if (!g) g = await geocodeOpenMeteo(c.nombre, c.iso);
    if (!g) {
      g = await geocodeNominatim(c.nombre_juego || c.nombre, c.pais);
      await sleep(1100);
    } else {
      await sleep(80);
    }
  } catch (e) {
    console.warn("ERR", c.nombre, e.message || e);
    await sleep(500);
  }

  if (!g) {
    fail++;
    out.push({ ...c, lat: null, lon: null, geo_fuente: "miss" });
    console.warn("MISS", c.nombre, c.pais);
  } else {
    ok++;
    out.push({ ...c, lat: g.lat, lon: g.lon, geo_display: g.display, geo_fuente: "api" });
    if (ok % 20 === 0) console.log(`[${i + 1}/${cities.length}] ok=${ok} fail=${fail}`);
  }

  if (i % 40 === 0) {
    fs.writeFileSync(geoPath, JSON.stringify({ generado: new Date().toISOString(), cities: out }, null, 2));
  }
}

const geocoded = out.filter((c) => c.lat != null).length;
fs.writeFileSync(
  geoPath,
  JSON.stringify({ generado: new Date().toISOString(), total: out.length, geocoded, cities: out }, null, 2)
);
console.log({ total: out.length, ok, cached, fail, geocoded });
