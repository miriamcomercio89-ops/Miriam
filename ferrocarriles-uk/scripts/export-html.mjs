import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");
const artifactDir = "/opt/cursor/artifacts";

const operators = JSON.parse(fs.readFileSync(path.join(root, "data/operators.json"), "utf8"));
const hubs = JSON.parse(fs.readFileSync(path.join(root, "data/hubs.json"), "utf8"));
const lineTypes = JSON.parse(fs.readFileSync(path.join(root, "data/line-types.json"), "utf8"));
const routesPath = path.join(outDir, "lines-mass.json");
if (!fs.existsSync(routesPath)) {
  console.error("Falta output/lines-mass.json. Ejecuta npm run generate:mass primero.");
  process.exit(1);
}
const routesDoc = JSON.parse(fs.readFileSync(routesPath, "utf8"));

// Compact route payload for HTML
const routes = routesDoc.lines.map((l) => ({
  id: l.id,
  codigo: l.codigo,
  nombre: l.nombre,
  tipo: l.tipo_id,
  op: l.operador_id,
  opn: l.operador_nombre,
  est: l.operador_estado,
  color: l.color,
  paradas: l.paradas_nombres || l.paradas,
  n: l.num_paradas,
  km: l.distancia_km,
  freq: l.frecuencia_min,
  corredor: l.corredor_id,
  origen_datos: l.origen_datos,
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
  eslogan: o.eslogan,
  competencia: o.competencia,
  logo: o.logo,
  flota: (o.flota || []).slice(0, 8).map((f) => f.nombre),
}));

const landNames = Object.fromEntries((operators.lands || []).map((l) => [l.id, l.nombre]));
const tipoNames = Object.fromEntries(lineTypes.tipos.map((t) => [t.id, `${t.prefijo} · ${t.nombre}`]));

const payload = {
  generado: new Date().toISOString(),
  resumen: {
    operadores: ops.length,
    por_estado: ops.reduce((a, o) => ((a[o.estado] = (a[o.estado] || 0) + 1), a), {}),
    hubs: hubs.total || hubs.hubs.length,
    rutas: routes.length,
    media_paradas: routesDoc.resumen?.media_paradas,
    ...routesDoc.resumen,
  },
  landNames,
  tipoNames,
  ops,
  routes,
};

// Embed logos as tiny data-uri map for actuales list (optional: only ids)
const logoMap = {};
for (const o of operators.operators) {
  const p = path.join(root, o.logo || "");
  if (o.logo && fs.existsSync(p)) {
    logoMap[o.id] = `data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(p)).toString("base64")}`;
  }
}
payload.logos = logoMap;

const json = JSON.stringify(payload);
const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Ferrocarriles UK — Operadores y rutas</title>
<style>
  :root {
    --bg: #0f172a; --panel: #1e293b; --ink: #e2e8f0; --muted: #94a3b8;
    --line: #334155; --accent: #38bdf8; --good: #4ade80; --warn: #fbbf24; --bad: #fb7185;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: "Segoe UI", system-ui, sans-serif;
    background: linear-gradient(180deg, #0b1224, #0f172a 30%, #111827);
    color: var(--ink); min-height: 100vh;
  }
  header {
    padding: 1.25rem 1.25rem 0.75rem; border-bottom: 1px solid var(--line);
    background: rgba(15,23,42,.9); position: sticky; top: 0; z-index: 5;
    backdrop-filter: blur(8px);
  }
  h1 { margin: 0 0 .35rem; font-size: 1.45rem; letter-spacing: .02em; }
  .sub { color: var(--muted); font-size: .92rem; }
  .tabs { display: flex; gap: .5rem; margin-top: .9rem; flex-wrap: wrap; }
  .tab {
    border: 1px solid var(--line); background: var(--panel); color: var(--ink);
    padding: .45rem .8rem; border-radius: 999px; cursor: pointer; font-weight: 600;
  }
  .tab.active { background: var(--accent); color: #082f49; border-color: transparent; }
  main { padding: 1rem 1.25rem 3rem; max-width: 1200px; margin: 0 auto; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: .6rem; margin: 1rem 0 1.2rem; }
  .stat { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: .75rem; }
  .stat b { display: block; font-size: 1.25rem; }
  .stat span { color: var(--muted); font-size: .8rem; }
  .toolbar { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
  input, select {
    background: var(--panel); color: var(--ink); border: 1px solid var(--line);
    border-radius: 10px; padding: .55rem .7rem; min-width: 160px;
  }
  input { flex: 1; min-width: 220px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: .75rem; }
  .card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
    padding: .85rem; display: flex; gap: .75rem; align-items: flex-start;
  }
  .card img { width: 56px; height: 56px; border-radius: 12px; flex: 0 0 auto; }
  .badge {
    display: inline-block; font-size: .72rem; font-weight: 700; padding: .15rem .45rem;
    border-radius: 999px; margin-right: .25rem; text-transform: uppercase;
  }
  .actual { background: #14532d; color: #bbf7d0; }
  .futuro { background: #854d0e; color: #fde68a; }
  .inventado { background: #4c1d95; color: #ddd6fe; }
  .swatch { width: 12px; height: 12px; border-radius: 999px; display: inline-block; margin-right: .35rem; vertical-align: middle; }
  table { width: 100%; border-collapse: collapse; font-size: .9rem; }
  th, td { border-bottom: 1px solid var(--line); padding: .55rem .4rem; text-align: left; vertical-align: top; }
  th { color: var(--muted); font-size: .78rem; position: sticky; top: 70px; background: #0f172a; }
  tr:hover td { background: rgba(56,189,248,.06); }
  .stops { color: var(--muted); font-size: .82rem; line-height: 1.35; }
  .stops strong { color: var(--ink); }
  .pager { display: flex; gap: .5rem; align-items: center; margin: .8rem 0; flex-wrap: wrap; }
  button {
    background: var(--panel); color: var(--ink); border: 1px solid var(--line);
    border-radius: 10px; padding: .45rem .75rem; cursor: pointer; font-weight: 600;
  }
  button:disabled { opacity: .4; cursor: not-allowed; }
  .hidden { display: none !important; }
  .muted { color: var(--muted); }
  details { margin-top: .25rem; }
  summary { cursor: pointer; color: var(--accent); }
</style>
</head>
<body>
<header>
  <h1>Ferrocarriles del Reino Unido</h1>
  <div class="sub">Operadores actuales, futuros e inventados · miles de rutas con todas las paradas</div>
  <div class="tabs">
    <button class="tab active" data-tab="ops">Operadores</button>
    <button class="tab" data-tab="routes">Rutas</button>
  </div>
</header>
<main>
  <div class="stats" id="stats"></div>

  <section id="view-ops">
    <div class="toolbar">
      <input id="op-q" placeholder="Buscar operador…"/>
      <select id="op-estado">
        <option value="">Todos los estados</option>
        <option value="actual">Actuales</option>
        <option value="futuro">Futuros</option>
        <option value="inventado">Inventados</option>
      </select>
      <select id="op-tipo">
        <option value="">Todos los tipos</option>
      </select>
    </div>
    <div class="grid" id="ops-grid"></div>
  </section>

  <section id="view-routes" class="hidden">
    <div class="toolbar">
      <input id="rt-q" placeholder="Buscar ruta, operador o estación…"/>
      <select id="rt-estado">
        <option value="">Estado operador</option>
        <option value="actual">Actual</option>
        <option value="futuro">Futuro</option>
        <option value="inventado">Inventado</option>
      </select>
      <select id="rt-tipo">
        <option value="">Tipo de línea</option>
      </select>
    </div>
    <div class="pager">
      <button id="prev">Anterior</button>
      <span id="pageinfo" class="muted"></span>
      <button id="next">Siguiente</button>
    </div>
    <div style="overflow:auto">
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Ruta</th><th>Operador</th><th>Tipo</th><th>Paradas</th><th>Km</th>
          </tr>
        </thead>
        <tbody id="rt-body"></tbody>
      </table>
    </div>
  </section>
</main>
<script>
const DATA = ${json};
const PAGE = 100;
let page = 0;
let filteredRoutes = DATA.routes;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderStats() {
  const r = DATA.resumen;
  const pe = r.por_estado || {};
  document.getElementById('stats').innerHTML = [
    ['Operadores', r.operadores],
    ['Actuales', pe.actual || 0],
    ['Futuros', pe.futuro || 0],
    ['Inventados', pe.inventado || 0],
    ['Hubs', r.hubs],
    ['Rutas', r.rutas || r.total],
    ['Media paradas', r.media_paradas ?? '—'],
  ].map(([k,v]) => '<div class="stat"><b>'+esc(v)+'</b><span>'+esc(k)+'</span></div>').join('');
}

function fillSelects() {
  const tipos = [...new Set(DATA.ops.map(o => o.tipo))].sort();
  document.getElementById('op-tipo').innerHTML += tipos.map(t => '<option value="'+esc(t)+'">'+esc(t)+'</option>').join('');
  const lt = Object.entries(DATA.tipoNames);
  document.getElementById('rt-tipo').innerHTML += lt.map(([k,v]) => '<option value="'+esc(k)+'">'+esc(v)+'</option>').join('');
}

function renderOps() {
  const q = document.getElementById('op-q').value.trim().toLowerCase();
  const est = document.getElementById('op-estado').value;
  const tipo = document.getElementById('op-tipo').value;
  const list = DATA.ops.filter(o => {
    if (est && o.estado !== est) return false;
    if (tipo && o.tipo !== tipo) return false;
    if (!q) return true;
    const lands = (o.lands||[]).map(id => DATA.landNames[id] || id).join(' ');
    return (o.nombre + ' ' + o.corto + ' ' + o.sede + ' ' + lands).toLowerCase().includes(q);
  });
  document.getElementById('ops-grid').innerHTML = list.map(o => {
    const lands = (o.lands||[]).map(id => DATA.landNames[id] || id).join(', ');
    const logo = DATA.logos[o.id] ? '<img src="'+DATA.logos[o.id]+'" alt=""/>' : '<div class="swatch" style="width:56px;height:56px;border-radius:12px;background:'+esc(o.color)+'"></div>';
    return '<article class="card">'+logo+'<div><div><span class="swatch" style="background:'+esc(o.color)+'"></span><strong>'+esc(o.nombre)+'</strong> <span class="muted">('+esc(o.corto)+')</span></div><div><span class="badge '+esc(o.estado)+'">'+esc(o.estado)+'</span><span class="badge" style="background:#334155">'+esc(o.tipo)+'</span></div><div class="muted" style="margin-top:.35rem">'+esc(o.sede)+' · '+esc(lands)+'</div><div class="muted">'+esc(o.eslogan||'')+'</div><div class="muted">Servicios: '+esc((o.servicios||[]).join(', '))+'</div>'+(o.flota?.length?'<details><summary>Flota</summary><div class="muted">'+esc(o.flota.join(' · '))+'</div></details>':'')+'</div></article>';
  }).join('');
}

function applyRouteFilter() {
  const q = document.getElementById('rt-q').value.trim().toLowerCase();
  const est = document.getElementById('rt-estado').value;
  const tipo = document.getElementById('rt-tipo').value;
  filteredRoutes = DATA.routes.filter(r => {
    if (est && r.est !== est) return false;
    if (tipo && r.tipo !== tipo) return false;
    if (!q) return true;
    const stops = (r.paradas||[]).join(' ');
    return (r.codigo + ' ' + r.nombre + ' ' + r.opn + ' ' + stops).toLowerCase().includes(q);
  });
  page = 0;
  renderRoutes();
}

function renderRoutes() {
  const total = filteredRoutes.length;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  if (page >= pages) page = pages - 1;
  const slice = filteredRoutes.slice(page * PAGE, page * PAGE + PAGE);
  document.getElementById('pageinfo').textContent = 'Página '+(page+1)+' / '+pages+' · '+total+' rutas';
  document.getElementById('prev').disabled = page <= 0;
  document.getElementById('next').disabled = page >= pages - 1;
  document.getElementById('rt-body').innerHTML = slice.map(r => {
    const stops = (r.paradas||[]);
    const stopHtml = stops.map((s,i) => i===0||i===stops.length-1 ? '<strong>'+esc(s)+'</strong>' : esc(s)).join(' → ');
    return '<tr><td><span class="swatch" style="background:'+esc(r.color)+'"></span><code>'+esc(r.codigo)+'</code></td><td>'+esc(r.nombre)+'<div class="stops">'+stopHtml+'</div></td><td>'+esc(r.opn)+'<div><span class="badge '+esc(r.est)+'">'+esc(r.est)+'</span></div></td><td>'+esc(DATA.tipoNames[r.tipo]||r.tipo)+'</td><td>'+esc(r.n)+'</td><td>'+esc(r.km)+'</td></tr>';
  }).join('');
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('view-ops').classList.toggle('hidden', tab !== 'ops');
    document.getElementById('view-routes').classList.toggle('hidden', tab !== 'routes');
  });
});
['op-q','op-estado','op-tipo'].forEach(id => document.getElementById(id).addEventListener('input', renderOps));
['rt-q','rt-estado','rt-tipo'].forEach(id => document.getElementById(id).addEventListener('input', applyRouteFilter));
document.getElementById('prev').onclick = () => { page--; renderRoutes(); };
document.getElementById('next').onclick = () => { page++; renderRoutes(); };

renderStats();
fillSelects();
renderOps();
applyRouteFilter();
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });
const outHtml = path.join(outDir, "catalogo-uk.html");
const artifactHtml = path.join(artifactDir, "ferrocarriles-uk.html");
fs.writeFileSync(outHtml, html, "utf8");
fs.writeFileSync(artifactHtml, html, "utf8");
fs.writeFileSync(path.join(root, "catalogo-uk.html"), html, "utf8");
fs.writeFileSync(path.join("/workspace", "ferrocarriles-uk.html"), html, "utf8");

console.log(`HTML: ${outHtml}`);
console.log(`Artifact: ${artifactHtml}`);
console.log(`Tamaño: ${Math.round(fs.statSync(outHtml).size / 1024)} KB`);
console.log(`Rutas embebidas: ${routes.length}`);
console.log(`Operadores: ${ops.length}`);
