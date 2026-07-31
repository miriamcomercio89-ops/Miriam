# Ferrocarriles UK

Diseño + generador de una red ferroviaria del **Reino Unido** para Nimby Rails.

## Contenido

- **101 operadores**: actuales (TOCs/open access/metro-tranvía), futuros e inventados (nombres en español)
- **16 tipos de línea** con nomenclatura por prefijo; color = color del operador
- Flota amplia orientada al Workshop
- Hubs UK + corredores (WCML, ECML, GWML, Elizabeth line, etc.)
- Miles de rutas con **lista completa de paradas**
- Catálogo navegable en **HTML** (no hace falta PDF)

## Descargas / móvil

**Importante:** el enlace “Raw” de GitHub muestra el archivo como texto. En el móvil abre esta URL (web interactiva):

- Catálogo interactivo: https://htmlpreview.github.io/?https://github.com/miriamcomercio89-ops/Miriam/blob/6fd2cc15fca00e418f28d13b737e002d7b1f2ee4/ferrocarriles-uk/web/index.html
- Landing: https://htmlpreview.github.io/?https://github.com/miriamcomercio89-ops/Miriam/blob/6fd2cc15fca00e418f28d13b737e002d7b1f2ee4/ferrocarriles-uk/ABRIR-EN-MOVIL.html

Offline: descarga  y abre  en el navegador.

## Uso

```bash
cd ferrocarriles-uk
npm run build
npm run generate:mass
npm run export:html
```

Abre `web/index-local.html` con un servidor local, o `catalogo-uk.html` (todo en un archivo).
