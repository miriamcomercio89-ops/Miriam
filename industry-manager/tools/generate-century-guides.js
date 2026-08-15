#!/usr/bin/env node
/**
 * 100 PDFs a color (2000–2099), 120 páginas/año (4 estaciones × 30 días).
 * Cada página: qué construir EXACTAMENTE y en qué casilla (x,y).
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'guias');
const DAYS_PER_YEAR = 120;
const DAYS_PER_SEASON = 30;

const SEASONS = [
  { id: 'primavera', name: 'Primavera', rgb: [0.45, 0.85, 0.55], olive: 1.1, wheat: 1.2, tourism: 0.9 },
  { id: 'verano', name: 'Verano', rgb: [0.99, 0.85, 0.2], olive: 0.85, wheat: 0.7, tourism: 1.45 },
  { id: 'otono', name: 'Otoño', rgb: [0.98, 0.65, 0.3], olive: 1.4, wheat: 1.0, tourism: 1.0 },
  { id: 'invierno', name: 'Invierno', rgb: [0.5, 0.7, 0.95], olive: 0.6, wheat: 0.4, tourism: 0.75 },
];

const TOWNS = [
  { name: 'Malaga', x: 26, y: 22 },
  { name: 'Torremolinos', x: 18, y: 24 },
  { name: 'Velez-Malaga', x: 34, y: 20 },
  { name: 'Antequera', x: 22, y: 12 },
  { name: 'Marbella', x: 40, y: 24 },
  { name: 'Ronda', x: 12, y: 10 },
];

const BUILD_NAMES = {
  hq: 'Sede',
  warehouse: 'Almacen',
  truck_depot: 'Deposito camiones',
  water_pump: 'Bomba de agua',
  lumberyard: 'Aserradero',
  orchard: 'Huerto naranja',
  olive_grove: 'Olivar',
  vineyard: 'Vinedo',
  wheat_farm: 'Trigal',
  cotton_farm: 'Algodonal',
  juice_plant: 'Planta de zumos',
  oil_press: 'Almazara',
  winery: 'Bodega',
  sawmill: 'Serreria',
  paper_mill: 'Papelera',
  mill: 'Molino',
  bakery: 'Panaderia',
  coal_mine: 'Mina carbon',
  iron_mine: 'Mina hierro',
  smelter: 'Fundicion',
  tool_shop: 'Taller herramientas',
  spinnery: 'Hilatura',
  loom: 'Telar',
  garment: 'Confeccion',
  oil_well: 'Pozo petroleo',
  refinery: 'Refineria',
  plastic_plant: 'Planta plastico',
  packaging: 'Envasado',
  road: 'Carretera',
};

const CHAINS = [
  {
    title: 'Citricos -> zumo',
    builds: [
      { building: 'hq', near: 'Malaga', dx: -6, dy: -4 },
      { building: 'warehouse', near: 'Malaga', dx: -4, dy: -5 },
      { building: 'water_pump', near: 'Malaga', dx: -1, dy: 4 },
      { building: 'orchard', near: 'Velez-Malaga', dx: -5, dy: -4 },
      { building: 'juice_plant', near: 'Malaga', dx: -7, dy: -3 },
      { building: 'road', near: 'Malaga', dx: -5, dy: -3 },
    ],
  },
  {
    title: 'Olivar -> aceite',
    builds: [
      { building: 'olive_grove', near: 'Antequera', dx: 5, dy: 4 },
      { building: 'olive_grove', near: 'Antequera', dx: 7, dy: 4 },
      { building: 'oil_press', near: 'Antequera', dx: 5, dy: 6 },
      { building: 'warehouse', near: 'Antequera', dx: 4, dy: 5 },
      { building: 'truck_depot', near: 'Antequera', dx: 3, dy: 5 },
    ],
  },
  {
    title: 'Bosque -> papel',
    builds: [
      { building: 'lumberyard', near: 'Ronda', dx: 5, dy: 4 },
      { building: 'sawmill', near: 'Ronda', dx: 7, dy: 4 },
      { building: 'paper_mill', near: 'Ronda', dx: 7, dy: 6 },
      { building: 'warehouse', near: 'Ronda', dx: 4, dy: 5 },
    ],
  },
  {
    title: 'Trigo -> pan',
    builds: [
      { building: 'wheat_farm', near: 'Antequera', dx: -6, dy: 4 },
      { building: 'mill', near: 'Antequera', dx: -6, dy: 6 },
      { building: 'bakery', near: 'Malaga', dx: 5, dy: -5 },
    ],
  },
  {
    title: 'Vino turismo',
    builds: [
      { building: 'vineyard', near: 'Marbella', dx: -5, dy: -5 },
      { building: 'winery', near: 'Marbella', dx: -5, dy: -3 },
      { building: 'warehouse', near: 'Marbella', dx: -7, dy: -4 },
    ],
  },
  {
    title: 'Metalurgia',
    builds: [
      { building: 'coal_mine', near: 'Ronda', dx: 5, dy: -4 },
      { building: 'iron_mine', near: 'Antequera', dx: -7, dy: -5 },
      { building: 'smelter', near: 'Antequera', dx: -5, dy: -5 },
      { building: 'tool_shop', near: 'Malaga', dx: 6, dy: -6 },
    ],
  },
  {
    title: 'Textil',
    builds: [
      { building: 'cotton_farm', near: 'Velez-Malaga', dx: 5, dy: -5 },
      { building: 'spinnery', near: 'Velez-Malaga', dx: 5, dy: -3 },
      { building: 'loom', near: 'Malaga', dx: -8, dy: -5 },
      { building: 'garment', near: 'Malaga', dx: -8, dy: -3 },
    ],
  },
  {
    title: 'Petroleo',
    builds: [
      { building: 'oil_well', near: 'Torremolinos', dx: -6, dy: -4 },
      { building: 'refinery', near: 'Torremolinos', dx: -6, dy: -2 },
      { building: 'plastic_plant', near: 'Malaga', dx: 7, dy: -3 },
      { building: 'packaging', near: 'Malaga', dx: 7, dy: -1 },
    ],
  },
];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seasonFor(day) {
  return SEASONS[Math.min(3, Math.floor((day - 1) / DAYS_PER_SEASON))];
}

function townByName(name) {
  return TOWNS.find((t) => t.name === name) || TOWNS[0];
}

function pageData(year, day) {
  const seed = year * 10000 + day * 31 + 7;
  const rnd = mulberry32(seed);
  const season = seasonFor(day);
  const age = year - 2000;
  let pool = CHAINS;
  if (age < 3) pool = CHAINS.filter((c) => /Citricos|Olivar|Bosque/.test(c.title));
  else if (age < 8) pool = CHAINS.filter((c) => !/Petroleo|Textil/.test(c.title));
  else if (age < 15) pool = CHAINS.filter((c) => !/Petroleo/.test(c.title));
  const chain = pool[Math.floor(rnd() * pool.length)] || CHAINS[0];
  const idx = (day + year) % chain.builds.length;
  const focus = chain.builds[idx];
  const focus2 = chain.builds[(idx + 1) % chain.builds.length];
  const t1 = townByName(focus.near);
  const t2 = townByName(focus2.near);
  const x = t1.x + focus.dx;
  const y = t1.y + focus.dy;
  const x2 = t2.x + focus2.dx;
  const y2 = t2.y + focus2.dy;
  let prod = 'zumo';
  if (season.id === 'verano') prod = rnd() > 0.4 ? 'zumo' : 'vino';
  else if (season.id === 'otono') prod = rnd() > 0.4 ? 'aceite' : 'vino';
  else if (season.id === 'invierno') prod = rnd() > 0.5 ? 'herramientas' : 'tablones';
  else prod = rnd() > 0.5 ? 'pan' : 'zumo';
  const cTown = TOWNS[Math.floor(rnd() * TOWNS.length)].name;
  const dayInSeason = ((day - 1) % DAYS_PER_SEASON) + 1;
  return {
    title: `${dayInSeason} ${season.name} ${year}`,
    season,
    chain: chain.title,
    build1: { name: BUILD_NAMES[focus.building] || focus.building, id: focus.building, x, y, town: focus.near },
    build2: { name: BUILD_NAMES[focus2.building] || focus2.building, id: focus2.building, x: x2, y: y2, town: focus2.near },
    contractQty: 8 + Math.floor(rnd() * 20),
    contractProd: prod,
    contractTown: cTown,
    tip:
      season.id === 'verano'
        ? 'Prioriza zumo/vino a costa (turismo alto).'
        : season.id === 'invierno'
          ? 'Agro flojo: empuja mineria y ferreteria.'
          : season.id === 'otono'
            ? 'Pico de olivar: multiplica almazaras.'
            : 'Buena ventana para trigo y citricos.',
  };
}

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function streamFor(p, year, day) {
  const [r, g, b] = p.season.rgb;
  const lines = [];
  const add = (x, y, size, text, rgb = [0.08, 0.1, 0.14]) => {
    lines.push('BT', `/F1 ${size} Tf`, `${rgb[0]} ${rgb[1]} ${rgb[2]} rg`, `${x} ${y} Td`, `(${esc(text)}) Tj`, 'ET');
  };

  // colored header bar
  lines.push(`${r} ${g} ${b} rg`, '40 780 515 40 re', 'f');
  // accent panels
  lines.push('0.15 0.35 0.55 rg', '40 560 515 120 re', 'f');
  lines.push('0.12 0.45 0.38 rg', '40 400 515 140 re', 'f');
  lines.push('0.45 0.25 0.12 rg', '40 250 515 130 re', 'f');
  lines.push('0.2 0.2 0.28 rg', '40 90 515 140 re', 'f');

  add(50, 792, 14, `Industry Manager ROI  |  Guia dia a dia  |  ${year}`, [0.1, 0.1, 0.1]);
  add(50, 755, 18, p.title, [0.08, 0.1, 0.14]);
  add(50, 730, 12, `Estacion: ${p.season.name}   ·   Dia ${day}/${DAYS_PER_YEAR}   ·   Cadena: ${p.chain}`, [0.15, 0.15, 0.18]);

  add(55, 650, 13, '1) CONSTRUYE HOY (OBLIGATORIO)', [1, 1, 1]);
  add(55, 628, 16, `Edificio: ${p.build1.name}`, [1, 0.95, 0.6]);
  add(55, 605, 14, `Casilla EXACTA: X=${p.build1.x}  Y=${p.build1.y}`, [1, 1, 1]);
  add(55, 585, 12, `Ancla: pueblo ${p.build1.town}  ·  id interno: ${p.build1.id}`, [0.85, 0.9, 1]);

  add(55, 510, 13, '2) SIGUIENTE PIEZA DE LA CADENA', [1, 1, 1]);
  add(55, 488, 15, `Edificio: ${p.build2.name}`, [0.7, 1, 0.85]);
  add(55, 465, 14, `Casilla EXACTA: X=${p.build2.x}  Y=${p.build2.y}`, [1, 1, 1]);
  add(55, 445, 12, `Ancla: ${p.build2.town}  ·  Conecta con carretera si aun no hay via`, [0.85, 1, 0.9]);
  add(55, 420, 11, 'Click herramienta Carretera y pinta el camino entre ambas casillas.', [0.8, 0.95, 0.9]);

  add(55, 350, 13, '3) CONTRATO SEMANAL DEL DIA', [1, 1, 1]);
  add(55, 325, 14, `Entrega ${p.contractQty} u. de ${p.contractProd} a ${p.contractTown}`, [1, 0.9, 0.75]);
  add(55, 300, 11, 'Plazo 7 dias. Fallar = -reputacion; si baja de 25, tiendas cerradas 10 dias.', [1, 0.85, 0.8]);
  add(55, 275, 11, 'Selecciona almacen/fabrica y pulsa Entregar en panel Contratos.', [1, 0.9, 0.85]);

  add(55, 200, 13, '4) TEMPORADA Y TRUCOS', [1, 1, 1]);
  add(55, 178, 11, p.tip, [0.9, 0.95, 1]);
  add(55, 155, 11, `Olivar x${p.season.olive} · Trigo x${p.season.wheat} · Turismo x${p.season.tourism}`, [0.85, 0.9, 1]);
  add(55, 132, 11, 'Dinero: PASTA_GORDA (+500k) · MILLON_EXPRESS (+1M) · SOCORRO_CAJA', [1, 0.92, 0.55]);
  add(55, 112, 11, 'I+D: INDUSTRIA_TOTAL · Reputacion: REPUTACION_MAX', [1, 0.92, 0.55]);
  add(50, 55, 9, 'Mapa 52x36 · Origen historico Malaga · Misma semilla que la guia in-game', [0.4, 0.45, 0.5]);

  return lines.join('\n');
}

function writeYearPdf(year, filePath) {
  const pageContents = [];
  for (let day = 1; day <= DAYS_PER_YEAR; day++) {
    pageContents.push(streamFor(pageData(year, day), year, day));
  }

  const chunks = [];
  let pos = 0;
  const write = (s) => {
    const buf = Buffer.from(s, 'binary');
    chunks.push(buf);
    pos += buf.length;
  };
  const objPos = {};
  const startObj = (n) => {
    objPos[n] = pos;
    write(`${n} 0 obj\n`);
  };
  const endObj = () => write('endobj\n');

  write('%PDF-1.4\n');
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  let next = 4;
  const pageIds = [];
  for (let i = 0; i < DAYS_PER_YEAR; i++) pageIds.push({ page: next++, content: next++ });

  startObj(catalogId);
  write(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\n`);
  endObj();
  startObj(pagesId);
  write(`<< /Type /Pages /Kids [${pageIds.map((p) => `${p.page} 0 R`).join(' ')}] /Count ${DAYS_PER_YEAR} >>\n`);
  endObj();
  startObj(fontId);
  write('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n');
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
  const total = next - 1;
  write(`xref\n0 ${total + 1}\n`);
  write('0000000000 65535 f \n');
  for (let i = 1; i <= total; i++) write(`${String(objPos[i]).padStart(10, '0')} 00000 n \n`);
  write(`trailer\n<< /Size ${total + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);
  fs.writeFileSync(filePath, Buffer.concat(chunks));
}

fs.mkdirSync(outDir, { recursive: true });
console.log('Generando 100 PDFs color con coordenadas exactas…');
const t0 = Date.now();
for (let year = 2000; year <= 2099; year++) {
  const f = path.join(outDir, `ano-${year}.pdf`);
  writeYearPdf(year, f);
  if (year % 10 === 0) console.log(' ', year);
}
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Guias color 2000–2099 (Rise of Industry)

Cada PDF tiene **120 paginas** (4 estaciones × 30 dias).
En cada dia indica **edificio exacto** y **casilla (X,Y)** anclada a pueblos de Malaga.

Trucos de dinero: PASTA_GORDA, MILLON_EXPRESS, SOCORRO_CAJA.
`
);
console.log(`OK ${((Date.now() - t0) / 1000).toFixed(1)}s → ${outDir}`);
