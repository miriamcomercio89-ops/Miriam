import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), "catalog-assets");
const outDir = path.join(root, "output");
const artifactDir = "/opt/cursor/artifacts";

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
  desc: l.descripcion || "",
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
  trenesU: l.trenes_unidades || [],
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

const payload = {
  generado: new Date().toISOString(),
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
  routes,
  logos: logoMap,
};

const styles = fs.readFileSync(path.join(assets, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(assets, "app.js"), "utf8");
const shell = fs.readFileSync(path.join(assets, "shell.html"), "utf8");

const html = shell
  .replace("__STYLES__", styles)
  .replace("__DATA__", JSON.stringify(payload))
  .replace("__APP__", app);

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
  fs.writeFileSync(t, html, "utf8");
}

spawnSync("zip", ["-j", path.join(artifactDir, "ferrocarriles-uk-catalogo.zip"), path.join(root, "catalogo-uk.html")], {
  stdio: "inherit",
});
fs.copyFileSync(path.join(artifactDir, "ferrocarriles-uk-catalogo.zip"), path.join(root, "catalogo-uk.zip"));

console.log(`HTML interactivo: ${Math.round(html.length / 1024)} KB`);
console.log(`Rutas: ${routes.length} · Operadores: ${ops.length}`);
console.log(`Artifact: ${path.join(artifactDir, "ferrocarriles-uk.html")}`);
