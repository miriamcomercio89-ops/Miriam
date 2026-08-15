# Industry Manager v8

Campaña industrial de **100 años** (1 ene 2000 → 2099) partiendo de **Málaga**. Navegador only: descomprime y abre `index.html`.

## Descarga ZIP

https://github.com/miriamcomercio89-ops/Miriam/archive/refs/heads/cursor/industry-manager-b124.zip

## Novedades v8

- **Calendario real** desde 2000 · botón **▶▶ +1 día** (salta exactamente un día)
- **466 edificios únicos** (sin Mk1/Mk2) · **tienda por pestañas** por categoría
- **Dashboard vibrante** con foco del día y tiles de color
- **Misiones locales** generadas desde tus ciudades OSM
- **DJ bioma** procedural (Web Audio, mucha variedad)
- **100 PDFs** en `/guias/ano-YYYY.pdf` — **una página completa por cada día** del año
- Guía in-game alineada con los PDF (misma semilla)
- Objetivo: **dominar cada ítem** del catálogo (~11k) con máxima variedad diaria

## Truco

`INDUSTRIA_TOTAL`

## Regenerar datos / guías

```bash
node tools/generate-data.js
node tools/generate-century-guides.js
```
