# Heliora — Red de Transporte Mundial (v0.1)

Plano interactivo de la red de transporte público de **Heliora**, una mega-metrópolis inventada.

## Características v0.1

- Mapa esquema tipo metro (SVG) con pan/zoom
- Menú lateral con todas las líneas (L / C / T + bus, hyperloop, ferry, teleférico)
- Planificador de viaje A→B con trasbordos
- Búsqueda de líneas y estaciones
- Leyenda de modos de transporte
- Zoom automático al seleccionar línea/estación/ruta
- Atajos: `Esc` cierra, `+` / `-` zoom
- Enlace compartible `?linea=L1`
- Modos Pasajero y Operador
- Horarios simulados · UI en español

## Abrir sin instalar nada

Usa la carpeta **`heliora-abrir-aqui/`** y haz doble clic en `index.html`.

> No abras el `index.html` de la raíz del proyecto: ese es solo para desarrollo y saldrá en blanco.

Para regenerar esa carpeta:

```bash
npm install
npm run build:standalone
```

## Desarrollo con Node

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Stack

Vite + React + TypeScript. Datos simulados en el cliente.
