# Plan de construcción Orbis

**Estado:** listado de países/zonas listo · **PDFs aún no generados**

## Resumen

| | |
|--|--|
| Hoteles totales | **10.000** |
| Países / territorios | **162** |
| Zonas (PDF futuro) | **393** |
| Empieza por | Costa del Sol (Málaga) |

## Cómo se reparte

1. Primero se asignan los hoteles **por país** (peso según turismo / stock hotelero mundial).
2. Si un país tiene pocos hoteles → **1 zona** (el país entero).
3. Si tiene muchos → se **subdivide en regiones** turísticas reales.

España queda en torno al **4%** del total (no concentrada como antes).

## Archivos

- [`REGIONES.md`](./REGIONES.md) — tabla legible de países y zonas
- [`REGIONES.json`](./REGIONES.json) — datos para el generador de PDFs
- Regenerar listado: `npm run plan:regions`

Los PDF antiguos de la carpeta `pdfs/` / `indices/` corresponden a un plan anterior (50k) y **no** se usan hasta que confirmes este reparto.
