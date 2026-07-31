# Ferrocarriles UK

Diseño + generador de una red ferroviaria del **Reino Unido** para Nimby Rails.

## Contenido

- **101 operadores**: actuales (TOCs/open access/metro-tranvía), futuros e inventados (nombres en español)
- **16 tipos de línea** con nomenclatura por prefijo; color = color del operador
- Flota amplia orientada al Workshop
- Hubs UK + corredores (WCML, ECML, GWML, Elizabeth line, etc.)
- Miles de rutas con **lista completa de paradas**
- Catálogo navegable en **HTML** (no hace falta PDF)

## Uso

```bash
cd ferrocarriles-uk
npm run build
npm run generate:mass
npm run export:html
```

Abre `output/catalogo-uk.html` o `catalogo-uk.html`.

## Descargas

- HTML: `catalogo-uk.html`
- Datos: `data/operators.json`, `output/lines-mass.json`
