# Heliora — Red de Transporte Mundial

Plano interactivo de la red de transporte público de **Heliora**, una mega-metrópolis inventada con la red más grande del mundo.

## Características

- Mapa esquema tipo plano de metro (SVG) con pan y zoom
- Menú lateral con todas las líneas agrupadas por modo
- Modos: Metro, Tren, Tranvía, Bus, Hyperloop, Ferry y Teleférico
- Horarios simulados y estado de servicio
- Vista **Pasajero** y **Operador** (ocupación, incidencias, notas)
- Interfaz en español

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`).

```bash
npm run build
npm run preview
```

## Stack

Vite + React + TypeScript. Todo el dato es simulado en el cliente; no hace falta backend.
