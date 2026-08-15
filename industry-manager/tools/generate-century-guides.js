#!/usr/bin/env node
/**
 * Genera 100 PDFs (2000–2099), una página completa por día del año.
 * Contenido alineado con IM.GuideEngine (misma semilla).
 * Uso: node tools/generate-century-guides.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'guias');
const dataDir = path.join(root, 'js', 'data');

function loadDataFile(name) {
  const code = fs.readFileSync(path.join(dataDir, name), 'utf8');
  const sandbox = { window: { IM_DATA: {} }, console };
  sandbox.window.IM_DATA = sandbox.window.IM_DATA || {};
  vm.runInNewContext(code, sandbox);
  return sandbox.window.IM_DATA;
}

const itemsData = loadDataFile('items.js');
const buildingsData = loadDataFile('buildings.js');
const items = itemsData.items || [];
const buildings = (buildingsData.buildings || []).filter((b) => !/Mk\d/i.test(b.name));

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysInYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
}

function dateFromDayOfYear(year, dayOfYear) {
  const months = [31, daysInYear(year) === 366 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = Math.max(1, dayOfYear);
  for (let m = 0; m < 12; m++) {
    if (d <= months[m]) return { month: m + 1, day: d };
    d -= months[m];
  }
  return { month: 12, day: months[11] };
}

const ROADMAP = [
  { from: 0, to: 2, ring: 'Málaga y Costa del Sol', focus: 'Agro, lonja, puerto y primera industria ligera' },
  { from: 3, to: 7, ring: 'Andalucía', focus: 'Aceite, vino, metales, cemento y hubs regionales' },
  { from: 8, to: 14, ring: 'España peninsular', focus: 'Corredor mediterráneo, norte industrial y Madrid' },
  { from: 15, to: 24, ring: 'Europa occidental', focus: 'Puertos UE, química, auto y electrónica' },
  { from: 25, to: 39, ring: 'Mediterráneo ampliado', focus: 'Magreb, Adriático, Egeo y cadenas cortas' },
  { from: 40, to: 59, ring: 'Atlántico y América', focus: 'Commodities, graneles y ensamblaje' },
  { from: 60, to: 79, ring: 'Asia-Pacífico', focus: 'Electrónica, semicon, logística container' },
  { from: 80, to: 99, ring: 'Dominio global', focus: 'Cada categoría del catálogo, circularidad y marca' },
];

const CITIES = [
  'Málaga', 'Sevilla', 'Algeciras', 'Almería', 'Granada', 'Córdoba', 'Cádiz', 'Huelva', 'Jaén',
  'Valencia', 'Barcelona', 'Bilbao', 'Vigo', 'Madrid', 'Zaragoza', 'Lisboa', 'Marsella', 'Róterdam',
  'Hamburgo', 'Génova', 'Nápoles', 'Atenas', 'Casablanca', 'Tánger', 'Estambul', 'Nueva York',
  'Santos', 'Houston', 'Shanghái', 'Singapur', 'Busán', 'Tokio', 'Dubái', 'Ciudad del Cabo', 'Sídney',
];

const ACTIONS = [
  'Construye tipología única (tienda por pestañas)',
  'Instala máquina + receta en un hueco libre',
  'Compra inputs baratos en bolsa / mercado',
  'Vende excedente con calidad ≥ objetivo',
  'Abre o refuerza ruta logística desde la ciudad ancla',
  'Investiga una tech alineada con el foco del día',
  'Revisa OEE y cuellos de botella de la planta',
  'Firma o cumple un contrato B2B',
  'Reduce polución / gana créditos verdes',
  'Crea o especializa una filial',
  'Exporta vía hub portuario o ferroviario',
  'Automatiza compra/venta del ítem foco',
];

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function ringForYear(year) {
  const y = year - 2000;
  return ROADMAP.find((r) => y >= r.from && y <= r.to) || ROADMAP[ROADMAP.length - 1];
}

function pageContent(year, day) {
  const seed = year * 10000 + day * 17 + 2000;
  const rnd = mulberry32(seed);
  const ring = ringForYear(year);
  const cityPool = Math.min(CITIES.length, 6 + Math.floor((year - 2000) / 3));
  const city = CITIES[Math.floor(rnd() * cityPool)];
  const pickItems = [];
  const n = 4 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const it = items[Math.floor(rnd() * items.length)];
    if (it && !pickItems.find((x) => x.id === it.id)) pickItems.push(it);
  }
  const absDay = (year - 2000) * 366 + day;
  const coverItem = items[absDay % items.length];
  if (coverItem && !pickItems.find((x) => x.id === coverItem.id)) pickItems.unshift(coverItem);
  const b1 = buildings[Math.floor(rnd() * buildings.length)];
  const b2 = buildings[Math.floor(rnd() * buildings.length)];
  const actions = [];
  const used = new Set();
  while (actions.length < 4) {
    const a = ACTIONS[Math.floor(rnd() * ACTIONS.length)];
    if (!used.has(a)) {
      used.add(a);
      actions.push(a);
    }
  }
  const dt = dateFromDayOfYear(year, day);
  const mood = ['agresivo mercado', 'consolidación', 'expansión geográfica', 'calidad total', 'logística', 'I+D', 'circular'][Math.floor(rnd() * 7)];
  return {
    title: `${dt.day} de ${MONTHS[dt.month - 1]} de ${year}`,
    ring: ring.ring,
    focus: ring.focus,
    city,
    mood,
    items: pickItems.map((i) => `${i.name} [${i.category}]`),
    cover: coverItem ? coverItem.name : '—',
    buildings: [b1, b2].filter(Boolean).map((b) => b.name),
    actions,
    tip: `Partida histórica desde Málaga. Ancla del día: ${city}. Modo: ${mood}. Dominio de catálogo: ${coverItem?.name || '—'}.`,
  };
}

function pdfEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** PDF mínimo Latin-1 / WinAnsi — translitera acentos para Helvetica */
function toWinAnsi(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?');
}

function buildPageStream(p, year, day, totalDays) {
  const lines = [
    'Industry Manager — Guia del siglo (2000-2099)',
    `Ano ${year} · Dia ${day}/${totalDays}`,
    '',
    p.title,
    '',
    `Anillo: ${p.ring}`,
    `Foco: ${p.focus}`,
    `Ciudad ancla: ${p.city}`,
    `Modo: ${p.mood}`,
    '',
    p.tip,
    '',
    'Items a dominar hoy:',
    ...p.items.map((x, i) => `  ${i + 1}. ${x}`),
    '',
    `Cobertura catalogo: ${p.cover}`,
    '',
    'Edificios sugeridos (unicos, sin Mk):',
    ...p.buildings.map((x, i) => `  ${i + 1}. ${x}`),
    '',
    'Acciones del dia:',
    ...p.actions.map((x, i) => `  ${i + 1}. ${x}`),
    '',
    'Objetivo del siglo: dominar CADA item del catalogo con maxima variedad diaria.',
    'Tienda por pestanas · Saltar 1 dia · Misiones OSM · DJ bioma.',
  ].map(toWinAnsi);

  let y = 800;
  const parts = ['BT', '/F1 11 Tf', '14 TL', '50 800 Td'];
  lines.forEach((line, idx) => {
    const size = idx === 3 ? 16 : idx === 0 ? 10 : 11;
    if (idx === 0) parts.push(`/F1 ${size} Tf`);
    if (idx === 3) parts.push(`/F1 ${size} Tf`);
    if (idx === 4) parts.push('/F1 11 Tf');
    parts.push(`(${pdfEscape(line)}) Tj`, 'T*');
  });
  parts.push('ET');
  return parts.join('\n');
}

function writeYearPdf(year, filePath) {
  const days = daysInYear(year);
  const objects = [];
  const add = (content) => {
    objects.push(content);
    return objects.length;
  };

  // We'll build pages first as content strings, then assemble with offsets
  const pageContents = [];
  for (let day = 1; day <= days; day++) {
    const p = pageContent(year, day);
    pageContents.push(buildPageStream(p, year, day, days));
  }

  // Object 1: Catalog
  // Object 2: Pages
  // Then for each page: page obj + content obj
  // Font object at end

  const chunks = [];
  const offsets = [0];
  let pos = 0;
  const write = (s) => {
    const buf = Buffer.from(s, 'binary');
    chunks.push(buf);
    pos += buf.length;
  };

  write('%PDF-1.4\n');

  const objPositions = {};
  const startObj = (num) => {
    objPositions[num] = pos;
    write(`${num} 0 obj\n`);
  };
  const endObj = () => write('endobj\n');

  const fontId = 3;
  const pagesId = 2;
  const catalogId = 1;
  let nextId = 4;
  const pageIds = [];

  // Pre-assign ids: each page needs pageDict + content
  for (let i = 0; i < days; i++) {
    pageIds.push({ page: nextId++, content: nextId++ });
  }

  startObj(catalogId);
  write(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\n`);
  endObj();

  startObj(pagesId);
  write(`<< /Type /Pages /Kids [${pageIds.map((p) => `${p.page} 0 R`).join(' ')}] /Count ${days} >>\n`);
  endObj();

  startObj(fontId);
  write('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n');
  endObj();

  pageIds.forEach((ids, i) => {
    const stream = pageContents[i];
    startObj(ids.page);
    write(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Contents ${ids.content} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\n`
    );
    endObj();
    startObj(ids.content);
    write(`<< /Length ${Buffer.byteLength(stream, 'binary')} >>\nstream\n${stream}\nendstream\n`);
    endObj();
  });

  const xrefPos = pos;
  const totalObjs = nextId - 1;
  write(`xref\n0 ${totalObjs + 1}\n`);
  write('0000000000 65535 f \n');
  for (let i = 1; i <= totalObjs; i++) {
    write(`${String(objPositions[i]).padStart(10, '0')} 00000 n \n`);
  }
  write(`trailer\n<< /Size ${totalObjs + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  fs.writeFileSync(filePath, Buffer.concat(chunks));
}

fs.mkdirSync(outDir, { recursive: true });
console.log(`Items: ${items.length} · Buildings (sin Mk): ${buildings.length}`);
console.log('Generando 100 PDFs…');

const t0 = Date.now();
for (let year = 2000; year <= 2099; year++) {
  const file = path.join(outDir, `ano-${year}.pdf`);
  writeYearPdf(year, file);
  const size = fs.statSync(file).size;
  console.log(`  ${year}: ${daysInYear(year)} páginas · ${(size / 1024).toFixed(0)} KB`);
}

// Índice README
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Guías del siglo (2000–2099)

Partida histórica desde **Málaga** (1 ene 2000).
Cada PDF \`ano-YYYY.pdf\` tiene **una página completa por cada día** del año.

- Objetivo: dominar **cada ítem** del catálogo con máxima variedad diaria.
- Misma semilla que la guía in-game (panel Guías).
- Generado con \`node tools/generate-century-guides.js\`.

Descarga del juego + guías:
https://github.com/miriamcomercio89-ops/Miriam/archive/refs/heads/cursor/industry-manager-b124.zip
`
);

console.log(`Listo en ${((Date.now() - t0) / 1000).toFixed(1)}s → ${outDir}`);
