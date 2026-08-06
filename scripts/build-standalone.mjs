import * as esbuild from 'esbuild';
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'heliora-abrir-aqui');

mkdirSync(outDir, { recursive: true });

/** Inyecta CSS en el JS para que funcione abriendo el HTML sin servidor */
const cssInjectPlugin = {
  name: 'css-inject',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, (args) => {
      const css = readFileSync(args.path, 'utf8');
      return {
        contents: `
          (() => {
            const style = document.createElement('style');
            style.textContent = ${JSON.stringify(css)};
            document.head.appendChild(style);
          })();
        `,
        loader: 'js',
      };
    });
  },
};

await esbuild.build({
  entryPoints: [join(root, 'src/main.tsx')],
  bundle: true,
  outfile: join(outDir, 'heliora.js'),
  format: 'iife',
  platform: 'browser',
  target: ['es2018'],
  jsx: 'automatic',
  plugins: [cssInjectPlugin],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: true,
  logLevel: 'info',
});

copyFileSync(join(root, 'public/favicon.svg'), join(outDir, 'favicon.svg'));

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Heliora — plano interactivo de la red de transporte público más grande del mundo" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" rel="stylesheet" />
    <title>Heliora — Red de Transporte Mundial</title>
    <style>
      html, body, #root { margin: 0; height: 100%; width: 100%; }
      body { font-family: Manrope, system-ui, sans-serif; background: #eef1f4; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./heliora.js"></script>
  </body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), html, 'utf8');
writeFileSync(
  join(outDir, 'LEEEME.txt'),
  `HELIORA v0.1 — Cómo abrir
========================

1. Haz doble clic en index.html
2. Se abrirá en tu navegador (Chrome, Edge, Firefox…)

No hace falta instalar nada ni usar la terminal.

Si ves página en blanco al abrir el index.html de la carpeta del código fuente,
es normal: ese archivo es solo para desarrollo con Node.
Usa SIEMPRE esta carpeta "heliora-abrir-aqui".
`,
  'utf8',
);

console.log('Standalone listo en heliora-abrir-aqui/');
