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
const CHUNK = 350;

const operator = JSON.parse(fs.readFileSync(path.join(root, "data/operator.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const addonsDoc = JSON.parse(fs.readFileSync(path.join(root, "data/addons.json"), "utf8"));
const geoDoc = JSON.parse(fs.readFileSync(path.join(root, "data/cities-geo.json"), "utf8"));
const routesPath = path.join(outDir, "lines-mass.json");
if (!fs.existsSync(routesPath)) {
  console.error("Falta output/lines-mass.json. Ejecuta npm run generate primero.");
  process.exit(1);
}
const routesDoc = JSON.parse(fs.readFileSync(routesPath, "utf8"));

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
  patron: l.patron || "base",
  origen: (l.paradas_nombres || [])[0] || "",
  destino: (l.paradas_nombres || []).slice(-1)[0] || "",
}));

const cities = (geoDoc.cities || []).map((c) => ({
  id: c.id,
  nombre: c.nombre,
  nombre_juego: c.nombre_juego,
  pais: c.pais,
  iso: c.iso,
  lat: c.lat,
  lon: c.lon,
  tier: c.tier,
  addons: c.addons || [],
}));

fs.mkdirSync(path.join(webDir, "chunks"), { recursive: true });
// clean old chunks beyond new count later
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

const meta = {
  version: "3.0.0",
  generado: new Date().toISOString(),
  total: routes.length,
  chunks: chunks.length,
  chunkSize: CHUNK,
  cities: cities.length,
  solo_promods_real: true,
  operador: operator,
  tipoNames: Object.fromEntries(lineTypes.tipos.map((t) => [t.id, t.nombre])),
  addonNames: Object.fromEntries(addonsDoc.addons.map((a) => [a.id, a.nombre])),
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
  routes: routes.slice(0, 30),
  cities: cities.slice(0, 40),
})};`;
const htmlLocal = shell
  .replace("__STYLES__", styles)
  .replace("__APP__", inlineData + "\n" + app)
  .replace("__CDN_BASE__", "");
fs.writeFileSync(path.join(webDir, "index-local.html"), htmlLocal);

fs.writeFileSync(path.join(webDir, "app.js"), app);
fs.writeFileSync(path.join(webDir, "styles.css"), styles);

const abrir = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Abrir EuroPerote en el móvil</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:1.25rem;background:#0a1628;color:#e8eef6;line-height:1.45}
a{color:#F2A900;font-weight:700}
.card{background:#13233d;border-radius:16px;padding:1rem;margin:1rem 0}
code{word-break:break-all;font-size:.85rem}
</style>
</head>
<body>
<h1>EuroPerote</h1>
<p>Catálogo ProMods (solo ciudades reales) con mapa OpenStreetMap. Operador: <strong>EuroPerote</strong>.</p>
<div class="card">
<p><strong>Enlace móvil (htmlpreview + commit fijado):</strong></p>
<p><a href="https://htmlpreview.github.io/?https://github.com/${REPO}/blob/${CDN_REF}/europerote-ets2/web/index.html">Abrir catálogo</a></p>
<p>Si el preview falla, espera 1–2 min a que jsDelivr indexe el commit <code>${CDN_REF}</code>.</p>
</div>
<p>Rutas: ${routes.length} · Ciudades reales: ${cities.length}</p>
</body>
</html>`;
fs.writeFileSync(path.join(root, "ABRIR-EN-MOVIL.html"), abrir);

console.log(`Export OK: ${routes.length} routes, ${cities.length} cities, ${chunks.length} chunks, CDN ${CDN_BASE}`);
