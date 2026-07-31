import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "output");
const pdfDir = path.join(root, "web/pdfs");
fs.mkdirSync(pdfDir, { recursive: true });

const routes = JSON.parse(fs.readFileSync(path.join(outDir, "lines-mass.json"), "utf8")).lines;
const citiesDoc = JSON.parse(fs.readFileSync(path.join(outDir, "cities-real.json"), "utf8"));
const cities = citiesDoc.cities;
const byId = Object.fromEntries(cities.map((c) => [c.id, c]));

const TYPE_COLORS = {
  urb: "#27ae60",
  brt: "#f1c40f",
  reg: "#2980b9",
  exp: "#e67e22",
  int: "#8e44ad",
  noc: "#2c3e50",
  tur: "#c0392b",
  ae: "#16a085",
  fer: "#1abc9c",
};
const TYPE_NAMES = {
  urb: "Urbano",
  brt: "BRT",
  reg: "Regional",
  exp: "Express",
  int: "Internacional",
  noc: "Nocturno",
  tur: "Turístico",
  ae: "Aeropuerto",
  fer: "Ferry-bus",
};

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const byPais = {};
for (const c of cities) (byPais[c.pais] ||= []).push(c);

const index = [];

async function writeCountryPdf(pais, list) {
  const national = routes.filter((r) => r.nacional && r.paises[0] === pais);
  const international = routes.filter((r) => !r.nacional && (r.paises || []).includes(pais));
  const all = [...national, ...international];
  if (!all.length || list.length < 2) return null;

  const xs = list.map((c) => c.x);
  const zs = list.map((c) => c.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const pad = 0.08;
  const dx = Math.max(maxX - minX, 1);
  const dz = Math.max(maxZ - minZ, 1);

  const file = path.join(pdfDir, `mapa-${slug(pais)}.pdf`);
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36 });
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  const W = doc.page.width - 72;
  const H = doc.page.height - 120;
  const ox = 36;
  const oy = 72;

  function proj(c) {
    const px = ox + ((c.x - minX) / dx) * (1 - 2 * pad) * W + pad * W;
    // invert Z so north (more negative z often) — use z increasing downward in game often south
    const py = oy + ((c.z - minZ) / dz) * (1 - 2 * pad) * H + pad * H;
    return { px, py };
  }

  doc.fillColor("#0B3D91").fontSize(18).text(`EuroPerote — ${pais}`, 36, 28, { continued: false });
  doc.fillColor("#555").fontSize(9).text(`${all.length} rutas · ${list.length} ciudades · colores por tipo`, 36, 50);

  // legend
  let lx = 36;
  const ly = doc.page.height - 28;
  for (const [tid, color] of Object.entries(TYPE_COLORS)) {
    const n = all.filter((r) => r.tipo_id === tid).length;
    if (!n) continue;
    doc.rect(lx, ly - 8, 10, 10).fill(color);
    doc.fillColor("#333").fontSize(7).text(`${TYPE_NAMES[tid] || tid} (${n})`, lx + 14, ly - 7);
    lx += 78;
  }

  // routes
  for (const r of all) {
    const color = TYPE_COLORS[r.tipo_id] || "#666";
    const pts = (r.paradas || []).map((id) => byId[id]).filter(Boolean).map(proj);
    if (pts.length < 2) continue;
    doc.save();
    doc.strokeColor(color).lineWidth(r.tipo_id === "int" || r.tipo_id === "exp" ? 1.4 : 0.9).opacity(0.55);
    doc.moveTo(pts[0].px, pts[0].py);
    for (let i = 1; i < pts.length; i++) doc.lineTo(pts[i].px, pts[i].py);
    doc.stroke();
    doc.restore();
  }

  // cities
  for (const c of list) {
    const { px, py } = proj(c);
    doc.circle(px, py, 2.2).fill("#0B3D91");
  }
  // labels for major
  doc.fillColor("#111").fontSize(6);
  for (const c of list.filter((x) => x.tier === 1 || list.length < 25).slice(0, 40)) {
    const { px, py } = proj(c);
    doc.text(c.nombre, px + 3, py - 3, { width: 70, lineBreak: false });
  }

  // route list page
  doc.addPage({ size: "A4", layout: "portrait", margin: 40 });
  doc.fillColor("#0B3D91").fontSize(16).text(`Rutas en ${pais}`, { underline: false });
  doc.moveDown(0.5);
  doc.fillColor("#333").fontSize(8);
  const sorted = all.sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));
  for (const r of sorted.slice(0, 180)) {
    const tags = (r.etiquetas || []).join(", ");
    const line = `${r.codigo}  ${r.nombre}  ·  ${r.km || r.distancia_km} km  ·  ${(r.paradas_nombres || []).join(" → ")}${tags ? "  [" + tags + "]" : ""}`;
    doc.text(line, { width: 515 });
  }
  if (sorted.length > 180) doc.text(`… y ${sorted.length - 180} rutas más.`);

  doc.end();
  await new Promise((res, rej) => {
    stream.on("finish", res);
    stream.on("error", rej);
  });
  return { pais, file: `pdfs/mapa-${slug(pais)}.pdf`, rutas: all.length, ciudades: list.length };
}

const paises = Object.keys(byPais).sort((a, b) => a.localeCompare(b, "es"));
for (const pais of paises) {
  const info = await writeCountryPdf(pais, byPais[pais]);
  if (info) {
    index.push(info);
    console.log("PDF", pais, info.rutas);
  }
}

fs.writeFileSync(path.join(pdfDir, "index.json"), JSON.stringify({ generado: new Date().toISOString(), mapas: index }, null, 2));
console.log("PDFs", index.length);
