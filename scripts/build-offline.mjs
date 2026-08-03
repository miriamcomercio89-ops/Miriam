#!/usr/bin/env node
/**
 * Build offline: un HTML + JS clásico (sin type=module) que abre a doble clic.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'offline')

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

await build({
  configFile: false,
  root: ROOT,
  base: './',
  plugins: [
    react(),
    {
      name: 'orbis-offline-no-worker',
      enforce: 'pre',
      resolveId(source) {
        if (
          source === '../lib/dayWorkerHost' ||
          source.endsWith('/dayWorkerHost') ||
          source.endsWith('/dayWorkerHost.ts')
        ) {
          return path.join(ROOT, 'src/lib/dayWorkerHost.offline.ts')
        }
        return null
      },
    },
  ],
  publicDir: path.join(ROOT, 'public'),
  build: {
    outDir: OUT,
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rollupOptions: {
      input: path.join(ROOT, 'src/main.tsx'),
      output: {
        format: 'iife',
        name: 'OrbisHotels',
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
        inlineDynamicImports: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})

// Vite puede dejar restos de assets/ (p. ej. worker). Solo queremos JS/CSS planos.
const assetsDir = path.join(OUT, 'assets')
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true })
}

// Copiar leaflet.css localmente
const leafletCssSrc = path.join(ROOT, 'node_modules/leaflet/dist/leaflet.css')
const leafletCssDest = path.join(OUT, 'leaflet.css')
if (fs.existsSync(leafletCssSrc)) {
  let css = fs.readFileSync(leafletCssSrc, 'utf8')
  css = css.replace(
    /url\((['"]?)images\//g,
    "url($1https://unpkg.com/leaflet@1.9.4/dist/images/",
  )
  fs.writeFileSync(leafletCssDest, css)
}

const appCss = fs.existsSync(path.join(OUT, 'app.css'))
  ? '<link rel="stylesheet" href="./app.css" />'
  : ''

const BUILD_ID = `a4-${Date.now().toString(36)}`

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="orbis-build" content="${BUILD_ID}" />
    <title>Orbis Hotels Group</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Outfit:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./leaflet.css" />
    ${appCss ? appCss.replace('href="./app.css"', `href="./app.css?v=${BUILD_ID}"`) : ''}
    <style>
      html, body, #root { margin: 0; height: 100%; background: #0b1f33; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <noscript>Activa JavaScript para jugar.</noscript>
    <script src="./app.js?v=${BUILD_ID}"></script>
  </body>
</html>
`

fs.writeFileSync(path.join(OUT, 'index.html'), html)

fs.writeFileSync(
  path.join(OUT, 'LEEME.txt'),
  `  Orbis Hotels Group — v2.2.6 (nombres de filiales canónicos)

IMPORTANTE: borra la carpeta antigua del escritorio antes de descomprimir.

1. Borra la carpeta "Orbis Hotels" antigua
2. Descomprime este ZIP de nuevo
3. Abre index.html

v2.2.6: nombres de las 50 filiales alineados (ids sin cambiar → partida compatible).
v2.2.5: constructor no se queda en Creando…
v2.2.4: mapa al cargar partida.
Necesitas internet para el mapa (teselas) y las fuentes.
`,
)

// Comprobar que no quedó type=module ni worker suelto
const appJs = fs.readFileSync(path.join(OUT, 'app.js'), 'utf8')
if (appJs.includes('assets/dayWorker') || /new Worker\(/.test(appJs)) {
  console.warn('Aviso: el bundle aún menciona Worker; en file:// no se usa.')
}
if (!appJs.includes('createRoot')) {
  console.error('ERROR: createRoot no está en app.js')
  process.exit(1)
}

console.log('Offline build listo en offline/')
console.log('Abre offline/index.html a doble clic.')
