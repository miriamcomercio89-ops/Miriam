import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { marked } from "marked";

/** Prefer WeasyPrint (fiable). Chrome headless queda como respaldo. */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const docsDir = path.join(root, "docs");
const outHtml = path.join(root, "output", "ferrocarriles-alemania.html");
const outPdf = "/opt/cursor/artifacts/ferrocarriles-alemania.pdf";

const files = [
  "DISENO.md",
  "NOMENCLATURA.md",
  "OPERADORES.md",
  "FLOTA.md",
  "GENERADOR.md",
  "IMPORTACION.md",
];

function embedLogos(md) {
  return md.replace(/!\[logo\]\(\.\.\/assets\/logos\/([^)]+)\)/g, (_, file) => {
    const svgPath = path.join(root, "assets/logos", file);
    if (!fs.existsSync(svgPath)) return "";
    const svg = fs.readFileSync(svgPath, "utf8");
    const b64 = Buffer.from(svg).toString("base64");
    return `<img class="logo" alt="logo" src="data:image/svg+xml;base64,${b64}"/>`;
  });
}

const sections = files.map((f) => embedLogos(fs.readFileSync(path.join(docsDir, f), "utf8")));

const md = [
  "# Ferrocarriles Alemania",
  "",
  "Documentación de diseño, operadores, flota, generador e importación para Nimby Rails.",
  "",
  `Generado: ${new Date().toISOString().slice(0, 10)}`,
  "",
  "---",
  "",
  ...sections.flatMap((s, i) => (i === 0 ? [s] : ["", "---", "", s])),
].join("\n");

const body = marked.parse(md, { async: false });

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Ferrocarriles Alemania — Documentación</title>
  <style>
    @page { size: A4; margin: 14mm 12mm; }
    body {
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: #15202b;
      line-height: 1.45;
      font-size: 10.5pt;
      margin: 0;
      padding: 12px;
    }
    h1, h2, h3, h4 {
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.2;
      page-break-after: avoid;
      break-after: avoid;
    }
    h1 { font-size: 24pt; color: #0b3d91; margin: 0 0 0.35em; }
    h2 {
      font-size: 16pt;
      margin-top: 1.2em;
      border-bottom: 2px solid #0b3d91;
      padding-bottom: 0.15em;
      page-break-before: auto;
    }
    h3 { font-size: 12.5pt; margin-top: 1em; }
    hr { border: none; border-top: 1px solid #d7dee7; margin: 1.2em 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8pt;
      margin: 0.6em 0 1em;
    }
    th, td {
      border: 1px solid #d7dee7;
      padding: 0.28em 0.4em;
      vertical-align: top;
      text-align: left;
    }
    th { background: #eef3f8; }
    tr, h3, table { page-break-inside: avoid; break-inside: avoid; }
    code, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 8.5pt;
    }
    code { background: #f3f6f9; padding: 0.05em 0.25em; border-radius: 3px; }
    pre {
      background: #f3f6f9;
      padding: 0.7em;
      border-radius: 6px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    img.logo { width: 48px; height: 48px; vertical-align: middle; }
    blockquote {
      margin: 0.7em 0;
      padding: 0.15em 0.7em;
      border-left: 3px solid #0b3d91;
      color: #516070;
    }
    .cover {
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      page-break-after: always;
      break-after: page;
    }
    .cover p { font-size: 11.5pt; color: #516070; max-width: 36em; }
  </style>
</head>
<body>
  <section class="cover">
    <h1>Ferrocarriles Alemania</h1>
    <p>Documentación completa del sistema de diseño y generador de red para Nimby Rails: operadores, nomenclatura, flota, hubs, corredores e importación.</p>
    <p><strong>Idioma:</strong> español · <strong>Fecha:</strong> ${new Date().toISOString().slice(0, 10)}</p>
  </section>
  ${body}
</body>
</html>`;

fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.mkdirSync(path.dirname(outPdf), { recursive: true });
fs.writeFileSync(outHtml, html, "utf8");

const weasy = spawnSync(
  "weasyprint",
  [outHtml, outPdf],
  {
    encoding: "utf8",
    timeout: 180000,
    env: { ...process.env, PATH: `${process.env.HOME}/.local/bin:${process.env.PATH}` },
  }
);

if (weasy.status !== 0 || !fs.existsSync(outPdf)) {
  console.warn("WeasyPrint falló; intento Chrome headless…");
  console.warn(weasy.stderr || weasy.stdout || weasy.error);
  const userData = "/tmp/chrome-pdf-profile";
  fs.rmSync(userData, { recursive: true, force: true });
  fs.mkdirSync(userData, { recursive: true });
  const result = spawnSync(
    "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      `--user-data-dir=${userData}`,
      "--no-pdf-header-footer",
      "--virtual-time-budget=15000",
      `--print-to-pdf=${outPdf}`,
      `file://${outHtml}`,
    ],
    { encoding: "utf8", timeout: 120000 }
  );
  if (result.error) throw result.error;
}

if (!fs.existsSync(outPdf)) {
  throw new Error("No se generó el PDF");
}

for (const dest of [
  path.join(root, "ferrocarriles-alemania.pdf"),
  path.join("/workspace", "ferrocarriles-alemania.pdf"),
  path.join("/opt/cursor/artifacts", "ferrocarriles-alemania.pdf"),
]) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(outPdf, dest);
}

const size = fs.statSync(outPdf).size;
console.log(`PDF: ${outPdf}`);
console.log(`Tamaño: ${Math.round(size / 1024)} KB`);
console.log(`HTML: ${outHtml} (${Math.round(fs.statSync(outHtml).size / 1024)} KB)`);
