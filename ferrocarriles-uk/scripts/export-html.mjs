import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), "catalog-assets");
const outDir = path.join(root, "output");
const webDir = path.join(root, "web");
const artifactDir = "/opt/cursor/artifacts";
const REPO = "miriamcomercio89-ops/Miriam";
const BRANCH = "cursor/red-ferroviaria-alemania-555a";
const gitSha = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
const CDN_REF = gitSha || BRANCH;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${CDN_REF}/ferrocarriles-uk/web`;
const CHUNK = 400;

const operators = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const corridors = JSON.parse(fs.readFileSync(path.join(root, "data/corridors.json"), "utf8"));
const routesPath = path.join(outDir, "lines-mass.json");
if (!fs.existsSync(routesPath)) {
  console.error("Falta output/lines-mass.json. Ejecuta npm run generate:mass primero.");
  process.exit(1);
}
const routesDoc = JSON.parse(fs.readFileSync(routesPath, "utf8"));
const hubById = Object.fromEntries(hubs.hubs.map((h) => [h.id, h]));

const routes = routesDoc.lines.map((l) => ({
  id: l.id,
  codigo: l.codigo,
  nombre: l.nombre,
  // descripción y unidades se reconstruyen en el cliente para aligerar la carga móvil
  tipo: l.tipo_id,
  prefijo: l.prefijo,
  op: l.operador_id,
  opn: l.operador_nombre,
  opSede: l.operador_sede || "",
  est: l.operador_estado,
  color: l.color,
  paradas: l.paradas_nombres || [],
  n: l.num_paradas,
  km: l.distancia_km,
  dur: l.duracion_min ?? null,
  vcom: l.velocidad_comercial_kmh ?? null,
  freq: l.frecuencia_min,
  svcDia: l.servicios_dia ?? null,
  primer: l.primer_tren || "",
  ultimo: l.ultimo_tren || "",
  dias: l.dias_servicio || "",
  clase: l.clase || "",
  pBase: l.precio_base ?? null,
  pKm: l.precio_por_km ?? null,
  pFull: l.precio_completo ?? null,
  moneda: l.moneda || "GBP",
  trenes: l.trenes_asignados ?? null,
  matId: l.material_id || (l.material && l.material[0]) || "",
  mat: l.material_nombre || "",
  matWs: l.material_workshop || "",
  bordo: l.servicios_bordo || [],
  corredor: l.corredor_id || "",
  origen_datos: l.origen_datos,
  patron: l.patron || "base",
  lands: l.lands || [],
  origen: hubById[l.origen]?.nombre || l.origen,
  destino: hubById[l.destino]?.nombre || l.destino,
}));

const ops = operators.operators.map((o) => ({
  id: o.id,
  nombre: o.nombre,
  corto: o.nombre_corto,
  tipo: o.tipo,
  estado: o.estado || "inventado",
  color: o.color,
  sede: o.sede,
  lands: o.lands,
  servicios: o.servicios,
  eslogan: o.eslogan || "",
  competencia: o.competencia,
  flota: (o.flota || []).slice(0, 10).map((f) => f.nombre),
}));

const logoMap = {};
for (const o of operators.operators) {
  const p = path.join(root, o.logo || "");
  if (o.logo && fs.existsSync(p)) {
    logoMap[o.id] = `data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(p)).toString("base64")}`;
  }
}

const chunks = [];
for (let i = 0; i < routes.length; i += CHUNK) chunks.push(routes.slice(i, i + CHUNK));

const meta = {
  generado: new Date().toISOString(),
  version: "0.4.0",
  chunks: chunks.length,
  chunkSize: CHUNK,
  resumen: {
    operadores: ops.length,
    por_estado: ops.reduce((a, o) => ((a[o.estado] = (a[o.estado] || 0) + 1), a), {}),
    hubs: hubs.total || hubs.hubs.length,
    rutas: routes.length,
    media_paradas: routesDoc.resumen?.media_paradas,
    distancia_total_km: routesDoc.resumen?.distancia_total_km,
  },
  landNames: Object.fromEntries((operators.lands || []).map((l) => [l.id, l.nombre])),
  tipoNames: Object.fromEntries(lineTypes.tipos.map((t) => [t.id, `${t.prefijo} · ${t.nombre}`])),
  corredorNames: Object.fromEntries(corridors.corredores.map((c) => [c.id, c.nombre])),
  ops,
  logos: logoMap,
};

const styles = fs.readFileSync(path.join(assets, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(assets, "app.js"), "utf8");
const shellOffline = fs.readFileSync(path.join(assets, "shell.html"), "utf8");
const bootShell = fs.readFileSync(path.join(assets, "boot-shell.html"), "utf8");

// --- web multiarchivo (móvil / CDN) ---
fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(path.join(webDir, "chunks"), { recursive: true });
fs.writeFileSync(path.join(webDir, "styles.css"), styles, "utf8");
fs.writeFileSync(path.join(webDir, "app.js"), app, "utf8");
fs.writeFileSync(path.join(webDir, "meta.json"), JSON.stringify(meta), "utf8");
chunks.forEach((c, i) => {
  fs.writeFileSync(path.join(webDir, "chunks", `routes-${i}.json`), JSON.stringify(c), "utf8");
});

const onlineHtml = bootShell
  .replaceAll("__BASE__", CDN_BASE)
  .replace("__STYLES__", styles)
  .replace("__APP__", app.replace(/<\/script/gi, "<\\/script"));
const localHtml = bootShell
  .replaceAll("__BASE__", ".")
  .replace("__STYLES__", styles)
  .replace("__APP__", app.replace(/<\/script/gi, "<\\/script"));
fs.writeFileSync(path.join(webDir, "index.html"), onlineHtml, "utf8");
fs.writeFileSync(path.join(webDir, "index-local.html"), localHtml, "utf8");

// landing mínima para abrir en el móvil
const landing = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Abrir Ferrocarriles UK</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:1.5rem;font-family:system-ui,sans-serif;
  background:linear-gradient(180deg,#efe7da,#f4efe6);color:#101820}
  .c{max-width:28rem;background:#fffaf3;border:1px solid #d9d0c2;border-radius:22px;padding:1.4rem;box-shadow:0 18px 40px rgba(0,0,0,.08)}
  h1{margin:0 0 .5rem;font-size:1.5rem}
  p{color:#6b645a;line-height:1.45}
  a.btn{display:block;text-align:center;margin-top:1rem;padding:.9rem 1rem;border-radius:14px;background:#0b6e4f;color:#fff;font-weight:700;text-decoration:none}
  .note{font-size:.85rem;margin-top:1rem}
</style>
</head>
<body>
<div class="c">
  <h1>UK Rail Atlas</h1>
  <p>En GitHub el archivo se ve como texto. Usa este botón para abrir la <strong>web interactiva</strong> en el móvil.</p>
  <a class="btn" href="https://htmlpreview.github.io/?https://github.com/${REPO}/blob/${BRANCH}/ferrocarriles-uk/web/index.html">Abrir catálogo interactivo</a>
  <p class="note">También puedes descargar el ZIP y abrir <code>catalogo-uk.html</code> en el navegador (Chrome/Safari → Archivos).</p>
</div>
</body>
</html>`;
fs.writeFileSync(path.join(webDir, "abrir.html"), landing, "utf8");
fs.writeFileSync(path.join(root, "ABRIR-EN-MOVIL.html"), landing, "utf8");

// --- HTML offline monolítico (sigue disponible) ---
const offlinePayload = { ...meta, routes };
delete offlinePayload.chunks;
delete offlinePayload.chunkSize;
const offlineHtml = shellOffline
  .replace("__STYLES__", styles)
  .replace("__DATA__", JSON.stringify(offlinePayload))
  .replace(
    "__APP__",
    // en offline los datos ya están embebidos; el boot async detecta CATALOG_DATA
    `window.CATALOG_DATA = window.CATALOG_DATA || null;\n` + app
  );

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

const targets = [
  path.join(outDir, "catalogo-uk.html"),
  path.join(root, "catalogo-uk.html"),
  path.join(artifactDir, "ferrocarriles-uk.html"),
  path.join("/workspace", "ferrocarriles-uk.html"),
];
for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, offlineHtml, "utf8");
}

spawnSync(
  "zip",
  [
    "-r",
    path.join(artifactDir, "ferrocarriles-uk-catalogo.zip"),
    path.join(root, "catalogo-uk.html"),
    path.join(root, "ABRIR-EN-MOVIL.html"),
    path.join(webDir, "index.html"),
    path.join(webDir, "abrir.html"),
  ],
  { stdio: "inherit" }
);
// zip web completa para uso local con servidor
spawnSync("zip", ["-r", path.join(root, "catalogo-uk.zip"), "catalogo-uk.html", "ABRIR-EN-MOVIL.html", "web"], {
  cwd: root,
  stdio: "inherit",
});
fs.copyFileSync(path.join(root, "catalogo-uk.zip"), path.join(artifactDir, "ferrocarriles-uk-catalogo.zip"));

const previewUrl = `https://htmlpreview.github.io/?https://github.com/${REPO}/blob/${BRANCH}/ferrocarriles-uk/web/index.html`;
const openUrl = `https://htmlpreview.github.io/?https://github.com/${REPO}/blob/${BRANCH}/ferrocarriles-uk/ABRIR-EN-MOVIL.html`;

console.log(`HTML offline: ${Math.round(offlineHtml.length / 1024)} KB`);
console.log(`Web chunks: ${chunks.length} × ~${CHUNK} rutas`);
console.log(`Rutas: ${routes.length} · Operadores: ${ops.length}`);
console.log(`CDN: ${CDN_BASE}/index.html`);
console.log(`Móvil (interactivo): ${previewUrl}`);
console.log(`Landing móvil: ${openUrl}`);
