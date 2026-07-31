import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), "catalog-assets");
const outDir = path.join(root, "output");
const webDir = path.join(root, "web");
const REPO = "miriamcomercio89-ops/Miriam";
const BRANCH = "cursor/red-ferroviaria-alemania-555a";
const gitRoot = path.resolve(root, "..");
const gitSha = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", cwd: gitRoot }).stdout.trim();
const CDN_REF = process.env.EUROPEROTE_CDN_REF || gitSha || BRANCH;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${CDN_REF}/europerote-ets2/web`;
const CHUNK = 500;

const operator = JSON.parse(fs.readFileSync(path.join(root, "data/operator.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const addonsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/addons.json"), "utf8"));
const mapProjection = JSON.parse(fs.readFileSync(path.join(root, "data/map-projection.json"), "utf8"));
const summary = JSON.parse(fs.readFileSync(path.join(outDir, "summary.json"), "utf8"));
const citiesDoc = JSON.parse(fs.readFileSync(path.join(outDir, "cities-real.json"), "utf8"));
const routesDoc = JSON.parse(fs.readFileSync(path.join(outDir, "lines-mass.json"), "utf8"));

const routes = routesDoc.lines.map((l) => ({
  id: l.id,
  codigo: l.codigo,
  nombre: l.nombre,
  desc: l.descripcion,
  tipo: l.tipo_id,
  prefijo: l.prefijo,
  nacional: !!l.nacional,
  op: l.operador_id,
  opn: l.operador_nombre,
  color: l.color,
  paradas: l.paradas_nombres || [],
  paradaIds: l.paradas || [],
  n: l.num_paradas,
  km: l.distancia_km,
  matId: l.material_id,
  mat: l.material_nombre,
  paises: l.paises || [],
  paisCodes: l.pais_codes || [],
  addons: l.addons || [],
  etiquetas: l.etiquetas || [],
  tags: l.etiquetas || [],
  patron: l.patron || "base",
  sentido: l.sentido || "ida",
  origen: (l.paradas_nombres || [])[0] || "",
  destino: (l.paradas_nombres || []).slice(-1)[0] || "",
}));

const cities = (citiesDoc.cities || []).map((c) => ({
  id: c.id,
  nombre: c.nombre,
  nombre_juego: c.nombre_juego,
  pais: c.pais,
  iso: c.iso,
  x: c.x,
  z: c.z,
  map_x: c.map_x ?? c.x,
  map_y: c.map_y ?? c.z,
  lat: c.lat ?? null,
  lon: c.lon ?? null,
  tier: c.tier,
  addons: c.addons || [],
  con_ruta: !!c.con_ruta,
}));

fs.mkdirSync(path.join(webDir, "chunks"), { recursive: true });
for (const f of fs.readdirSync(path.join(webDir, "chunks"))) {
  fs.unlinkSync(path.join(webDir, "chunks", f));
}

const chunks = [];
for (let i = 0; i < routes.length; i += CHUNK) {
  const part = routes.slice(i, i + CHUNK);
  const idx = chunks.length;
  fs.writeFileSync(path.join(webDir, "chunks", `routes-${idx}.json`), JSON.stringify(part));
  chunks.push(idx);
}

fs.writeFileSync(path.join(webDir, "cities.json"), JSON.stringify({ total: cities.length, cities }));

let pdfs = null;
const pdfIndex = path.join(webDir, "pdfs/index.json");
if (fs.existsSync(pdfIndex)) pdfs = JSON.parse(fs.readFileSync(pdfIndex, "utf8"));

const meta = {
  version: "4.0.0",
  generado: new Date().toISOString(),
  total: routes.length,
  chunks: chunks.length,
  chunkSize: CHUNK,
  cities: cities.length,
  cobertura_pct: summary.cobertura_pct,
  solo_promods_real: true,
  operador: operator,
  tipoNames: Object.fromEntries(lineTypes.tipos.map((t) => [t.id, t.nombre])),
  addonNames: Object.fromEntries(addonsDoc.addons.map((a) => [a.id, a.nombre])),
  mapProjection,
  cdnBase: CDN_BASE,
  commit: CDN_REF,
};
fs.writeFileSync(path.join(webDir, "meta.json"), JSON.stringify(meta, null, 2));

const styles = fs.readFileSync(path.join(assets, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(assets, "app.js"), "utf8");
const shell = fs.readFileSync(path.join(assets, "shell.html"), "utf8");

const htmlCdn = shell
  .replace("__STYLES__", styles)
  .replace("__APP__", app)
  .replace("__CDN_BASE__", CDN_BASE);
fs.writeFileSync(path.join(webDir, "index.html"), htmlCdn);

const inlineData = `window.CATALOG_DATA = ${JSON.stringify({
  ...meta,
  routes: routes.slice(0, 25),
  cities: cities.slice(0, 50),
  pdfs,
})};`;
fs.writeFileSync(
  path.join(webDir, "index-local.html"),
  shell.replace("__STYLES__", styles).replace("__APP__", inlineData + "\n" + app).replace("__CDN_BASE__", "")
);
fs.writeFileSync(path.join(webDir, "app.js"), app);
fs.writeFileSync(path.join(webDir, "styles.css"), styles);

const LIVE_URL = process.env.EUROPEROTE_LIVE_URL || "https://flashy-ion-6tew1ep.shipstatic.com";
const cdnIndex = `https://cdn.jsdelivr.net/gh/${REPO}@${CDN_REF}/europerote-ets2/web/index.html`;
const abrir = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Abrir EuroPerote</title>
<meta http-equiv="refresh" content="0;url=${LIVE_URL}/"/>
<style>body{font-family:system-ui;margin:0;padding:1.25rem;background:#0a1628;color:#e8eef6;line-height:1.45}a{color:#F2A900;font-weight:700}.card{background:#13233d;border-radius:16px;padding:1rem;margin:1rem 0}code{word-break:break-all;font-size:.85rem}</style>
</head><body>
<h1>EuroPerote</h1>
<p>Catálogo con mapa ProMods (ets2.online).</p>
<div class="card">
<p><strong>Abrir en el PC (recomendado):</strong><br/>
<a href="${LIVE_URL}/">${LIVE_URL}/</a></p>
<p>Copia y pega el enlace en Chrome/Edge/Firefox. No uses htmlpreview ni el enlace de jsDelivr del HTML (el navegador lo muestra como texto).</p>
</div>
<div class="card">
<p>Rutas: ${routes.length} · Ciudades: ${cities.length} · Cobertura: ${summary.cobertura_pct}%</p>
<p>Commit: <code>${CDN_REF}</code></p>
</div>
</body></html>`;
fs.writeFileSync(path.join(root, "ABRIR-EN-MOVIL.html"), abrir);
fs.writeFileSync(path.join(webDir, "ABRIR.html"), abrir);
fs.writeFileSync(path.join(webDir, "LIVE_URL.txt"), LIVE_URL + "\n");
console.log(`Export OK: ${routes.length} routes, ${cities.length} cities, ${chunks.length} chunks`);
console.log(`Abrir en PC: ${LIVE_URL}/`);
