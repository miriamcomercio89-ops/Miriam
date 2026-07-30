#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';

mkdirSync('jugar', { recursive: true });

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'jugar/app.js',
  format: 'iife',
  target: ['es2018'],
  logLevel: 'info',
});

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loterías Álora — Miriam</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="app.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="app.js"></script>
  </body>
</html>
`;

writeFileSync('jugar/index.html', html);

// Acceso directo en la raíz del ZIP
writeFileSync(
  'ABRE-EL-JUEGO.html',
  html
    .replace('href="app.css"', 'href="jugar/app.css"')
    .replace('src="app.js"', 'src="jugar/app.js"'),
);

console.log('Listo: abre ABRE-EL-JUEGO.html o jugar/index.html');
