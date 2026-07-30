# Ferrocarriles Alemania

Generador, documentación y diseño de una red ferroviaria **realista + ficticia** a escala nacional para **Nimby Rails**.

No forma parte del juego de loterías del repositorio: vive en esta carpeta como proyecto aparte.

## Qué hay ahora (fase A + bases)

- **82 operadores** con nombre en español, color único, logo SVG, zona (Lands), servicios y flota mixta
- **16 tipos de línea** con nomenclatura por prefijo (`AV`, `LD`, `RE`, `S`, `U`, `T`…)
- Color de línea = **color del operador**
- Catálogo de **flota moderna** orientado al Workshop de Nimby Rails
- Scaffold del **generador** de líneas (muestra + lotes)

## Estructura

```text
ferrocarriles-alemania/
  data/           # operators, line-types, fleet, hubs
  assets/logos/   # SVG por operador + index.html
  docs/           # diseño, operadores, nomenclatura, flota
  generator/      # motor y CLI
  scripts/        # build, logos, docs, stats
  output/         # muestras generadas
```

## Uso

Requiere Node.js ≥ 18.

```bash
cd ferrocarriles-alemania
npm run build           # regenera operators.json, logos y docs
npm run stats           # resumen numérico
npm run generate:sample # 250 líneas de ejemplo → output/lines-sample.json
node generator/cli.mjs batch 5000  # lote grande
```

## Documentación

- [Diseño del sistema](docs/DISENO.md)
- [Catálogo de operadores](docs/OPERADORES.md)
- [Nomenclatura](docs/NOMENCLATURA.md)
- [Flota Workshop](docs/FLOTA.md)
- [Galería de logos](assets/logos/index.html)

## Próximos pasos

1. Ampliar `hubs.json` a cientos/miles de estaciones reales + nodos ficticios
2. Reglas de trazado por corredor (no solo pares aleatorios de hubs)
3. Generación masiva (miles de líneas) con cuotas por tipo/Land
4. Guía de importación / workflow hacia una partida Nimby Rails
