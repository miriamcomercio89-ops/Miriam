import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function contrastText(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? "#111827" : "#FFFFFF";
}

function mark(estilo, fg) {
  switch (estilo) {
    case "flecha":
      return `<polygon points="22,64 78,32 78,48 110,48 110,80 78,80 78,96" fill="${fg}"/>`;
    case "rayo":
      return `<polygon points="70,18 40,70 62,70 50,118 96,58 72,58" fill="${fg}"/>`;
    case "ola":
      return `<path d="M18 78 C38 48, 54 48, 74 78 S110 108, 122 78" fill="none" stroke="${fg}" stroke-width="10" stroke-linecap="round"/>`;
    case "diamante":
      return `<polygon points="64,20 108,64 64,108 20,64" fill="${fg}"/>`;
    case "anillo":
      return `<circle cx="64" cy="64" r="34" fill="none" stroke="${fg}" stroke-width="12"/>`;
    case "circulos":
      return `<circle cx="44" cy="64" r="18" fill="${fg}"/><circle cx="84" cy="64" r="18" fill="${fg}" opacity="0.7"/>`;
    case "malla":
      return `<g stroke="${fg}" stroke-width="8" fill="none"><rect x="28" y="28" width="72" height="72" rx="8"/><line x1="64" y1="28" x2="64" y2="100"/><line x1="28" y1="64" x2="100" y2="64"/></g>`;
    case "luna":
      return `<path d="M78 28 A36 36 0 1 0 78 100 A26 26 0 1 1 78 28 Z" fill="${fg}"/>`;
    case "rio":
      return `<path d="M24 40 C48 40, 48 88, 72 88 S96 40, 120 40" fill="none" stroke="${fg}" stroke-width="12" stroke-linecap="round"/>`;
    case "puente":
      return `<g fill="none" stroke="${fg}" stroke-width="8"><path d="M16 84 H112"/><path d="M28 84 Q64 28 100 84"/><line x1="40" y1="84" x2="40" y2="64"/><line x1="64" y1="84" x2="64" y2="48"/><line x1="88" y1="84" x2="88" y2="64"/></g>`;
    case "arbol":
      return `<g fill="${fg}"><polygon points="64,18 96,70 32,70"/><rect x="56" y="70" width="16" height="28"/></g>`;
    case "valle":
      return `<polyline points="16,88 48,40 64,64 88,28 112,88" fill="none" stroke="${fg}" stroke-width="10" stroke-linejoin="round"/>`;
    case "pico":
      return `<polygon points="20,96 52,36 64,56 84,24 116,96" fill="${fg}"/>`;
    case "escudo":
      return `<path d="M64 18 L104 34 V66 C104 92 64 110 64 110 C64 110 24 92 24 66 V34 Z" fill="${fg}"/>`;
    case "hex":
      return `<polygon points="64,18 104,40 104,88 64,110 24,88 24,40" fill="${fg}"/>`;
    case "ancla":
      return `<g fill="none" stroke="${fg}" stroke-width="8" stroke-linecap="round"><circle cx="64" cy="34" r="10"/><line x1="64" y1="44" x2="64" y2="96"/><path d="M36 72 Q64 104 92 72"/><line x1="48" y1="60" x2="80" y2="60"/></g>`;
    case "corazon":
      return `<path d="M64 104 C20 74 24 36 48 36 C58 36 64 46 64 46 C64 46 70 36 80 36 C104 36 108 74 64 104 Z" fill="${fg}"/>`;
    case "isla":
      return `<g fill="${fg}"><ellipse cx="64" cy="88" rx="40" ry="12"/><path d="M40 88 Q52 40 64 40 Q76 40 88 88 Z"/></g>`;
    case "hoja":
      return `<path d="M64 20 C96 40 104 84 64 112 C24 84 32 40 64 20 Z" fill="${fg}"/><line x1="64" y1="36" x2="64" y2="100" stroke="${contrastText(fg) === "#FFFFFF" ? "#14532D" : "#ECFDF5"}" stroke-width="4"/>`;
    case "estrella":
      return `<polygon points="64,16 74,50 110,50 82,72 92,106 64,84 36,106 46,72 18,50 54,50" fill="${fg}"/>`;
    case "u":
      return `<path d="M34 28 V70 C34 92 94 92 94 70 V28" fill="none" stroke="${fg}" stroke-width="16" stroke-linecap="round"/>`;
    case "t":
      return `<g fill="${fg}"><rect x="28" y="28" width="72" height="16" rx="4"/><rect x="56" y="40" width="16" height="60" rx="4"/></g>`;
    case "ala":
      return `<path d="M20 72 L64 28 L108 72 L88 72 L64 48 L40 72 Z" fill="${fg}"/>`;
    case "marco":
      return `<g fill="none" stroke="${fg}" stroke-width="8"><rect x="28" y="28" width="72" height="72" rx="6"/><rect x="44" y="44" width="40" height="40" rx="2"/></g>`;
    case "libro":
      return `<g fill="${fg}"><path d="M28 28 H60 V100 H28 C36 88 36 40 28 28 Z"/><path d="M100 28 H68 V100 H100 C92 88 92 40 100 28 Z"/></g>`;
    case "sol":
      return `<g fill="${fg}"><circle cx="64" cy="64" r="22"/><g stroke="${fg}" stroke-width="8" stroke-linecap="round"><line x1="64" y1="18" x2="64" y2="30"/><line x1="64" y1="98" x2="64" y2="110"/><line x1="18" y1="64" x2="30" y2="64"/><line x1="98" y1="64" x2="110" y2="64"/><line x1="32" y1="32" x2="40" y2="40"/><line x1="96" y1="96" x2="88" y2="88"/><line x1="96" y1="32" x2="88" y2="40"/><line x1="32" y1="96" x2="40" y2="88"/></g></g>`;
    case "dragon":
      return `<path d="M20 80 C36 40, 60 28, 84 40 C96 20, 112 36, 100 52 C116 60, 110 88, 88 84 C72 104, 40 100, 28 84 Z" fill="${fg}"/>`;
    case "barra":
    default:
      return `<g fill="${fg}"><rect x="22" y="54" width="84" height="20" rx="6"/><rect x="22" y="30" width="28" height="12" rx="4"/><rect x="78" y="86" width="28" height="12" rx="4"/></g>`;
  }
}

export function renderLogo(op) {
  const bg = op.color;
  const fg = op.color_secundario || contrastText(bg);
  const text = contrastText(bg);
  const initials = op.nombre_corto.slice(0, 3);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 128 128" role="img" aria-label="${op.nombre}">
  <rect width="128" height="128" rx="24" fill="${bg}"/>
  <g transform="translate(0,-6)">${mark(op.logo_estilo, fg)}</g>
  <rect x="16" y="96" width="96" height="22" rx="8" fill="${fg}" opacity="0.95"/>
  <text x="64" y="112" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="${bg}">${initials}</text>
  <title>${op.nombre}</title>
</svg>
`;
}

export function generateLogos(operators, outDir = path.join(root, "assets/logos")) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const op of operators) {
    const file = path.join(outDir, `${op.id}.svg`);
    fs.writeFileSync(file, renderLogo(op), "utf8");
    op.logo = `assets/logos/${op.id}.svg`;
  }
  // Index sheet
  const tiles = operators
    .map(
      (op) => `<a href="${op.id}.svg" title="${op.nombre}">
  <figure>
    <img src="${op.id}.svg" alt="${op.nombre}" width="96" height="96"/>
    <figcaption>${op.nombre_corto}<br/><small>${op.nombre}</small></figcaption>
  </figure>
</a>`
    )
    .join("\n");
  const index = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Logos — Ferrocarriles Alemania</title>
  <style>
    body{font-family:Georgia,serif;background:#0f172a;color:#e2e8f0;margin:0;padding:2rem}
    h1{font-weight:600;letter-spacing:.02em}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:1rem}
    a{color:inherit;text-decoration:none}
    figure{margin:0;background:#1e293b;border-radius:16px;padding:1rem;text-align:center}
    figcaption{margin-top:.6rem;font-size:.85rem;line-height:1.3}
    small{opacity:.75}
  </style>
</head>
<body>
  <h1>Logos de operadores</h1>
  <p>${operators.length} marcas generadas para la red ferroviaria alemana.</p>
  <div class="grid">
${tiles}
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir, "index.html"), index, "utf8");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("generate-logos.mjs")) {
  const operatorsPath = path.join(root, "data/operators.json");
  if (!fs.existsSync(operatorsPath)) {
    console.error("Falta data/operators.json. Ejecuta npm run build primero.");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(operatorsPath, "utf8"));
  generateLogos(data.operators);
  fs.writeFileSync(operatorsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Logos: ${data.operators.length} SVG en assets/logos/`);
}
