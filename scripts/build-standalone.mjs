#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';

mkdirSync('jugar', { recursive: true });

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'jugar/app.js',
  format: 'iife',
  target: ['es2018'],
  logLevel: 'info',
});

const css = readFileSync('jugar/app.css', 'utf8');
const js = readFileSync('jugar/app.js', 'utf8');

const folderHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loterías Álora — Miriam</title>
    <link rel="stylesheet" href="app.css" />
  </head>
  <body>
    <div id="app"><p style="font-family:sans-serif;padding:24px">Cargando Loterías Álora…</p></div>
    <script src="app.js"></script>
    <noscript><p style="padding:24px;font-family:sans-serif">Activa JavaScript para jugar.</p></noscript>
  </body>
</html>
`;

writeFileSync('jugar/index.html', folderHtml);

// UN SOLO ARCHIVO: CSS + JS incrustados (funciona con doble clic, sin carpetas)
const single = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Loterías Álora — Miriam</title>
<style>
${css}
</style>
</head>
<body>
<div id="app"><p style="font-family:sans-serif;padding:24px;color:#1a2b33">Cargando Loterías Álora…</p></div>
<script>
try {
${js}
} catch (err) {
  document.getElementById('app').innerHTML =
    '<div style="font-family:sans-serif;padding:32px;max-width:640px;margin:40px auto;background:#fff3f3;border:1px solid #e7b6b6;border-radius:12px">' +
    '<h1 style="color:#a33b3b">Error al cargar el juego</h1>' +
    '<p>Copia este mensaje y envíalo para poder ayudarte:</p>' +
    '<pre style="white-space:pre-wrap">' + String(err && err.stack || err) + '</pre>' +
    '</div>';
  console.error(err);
}
</script>
<noscript><p style="padding:24px;font-family:sans-serif">Activa JavaScript para jugar a Loterías Álora.</p></noscript>
</body>
</html>
`;

writeFileSync('ABRE-EL-JUEGO.html', single);
writeFileSync('LOTERIAS-ALORA.html', single);

console.log('Listo:');
console.log('  - LOTERIAS-ALORA.html  (un solo archivo, ábrelo con doble clic)');
console.log('  - ABRE-EL-JUEGO.html    (igual, todo incluido)');
console.log('  - jugar/index.html     (versión en carpeta)');
