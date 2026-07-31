# Ferrocarriles Alemania

Generador, documentación y diseño de una red ferroviaria **realista + ficticia** a escala nacional para **Nimby Rails**.

No forma parte del juego de loterías del repositorio: vive en esta carpeta como proyecto aparte.

## Estado actual

- **82 operadores** (español, color único, logo SVG, Lands, flota mixta)
- **16 tipos de línea** con nomenclatura por prefijo; color de línea = color del operador
- **847 trenes** en catálogo Workshop (bases + variantes de composición/livrea/aeropuerto)
- **568 hubs** (reales, metropolitanos y ficticios)
- **39 corredores** + generador por cuotas/proximidad
- **~9.800 líneas** en `output/lines-mass.json`
- Guía de importación a partida Nimby Rails

## Estructura

```text
ferrocarriles-alemania/
  data/           # operators, line-types, fleet, hubs, corridors
  assets/logos/   # SVG por operador + index.html
  docs/           # diseño, operadores, nomenclatura, flota, generador, importación
  generator/      # motor por corredor y CLI
  scripts/        # build / seeds / stats
  output/         # samples y lote masivo
```

## Uso

Requiere Node.js ≥ 18.

```bash
cd ferrocarriles-alemania
npm run build            # regenera fleet, hubs, operators, logos y docs
npm run stats
npm run generate:sample  # ~400 líneas
npm run generate:mass    # 8000 líneas → output/lines-mass.json
```

## Documentación

- [Diseño](docs/DISENO.md)
- [Operadores](docs/OPERADORES.md)
- [Nomenclatura](docs/NOMENCLATURA.md)
- [Flota](docs/FLOTA.md)
- [Generador](docs/GENERADOR.md)
- [Importación Nimby Rails](docs/IMPORTACION.md)
- [Galería de logos](assets/logos/index.html)
