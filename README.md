# Orbis Hotels Group

Simulador de construcción hotelera mundial. Dirige **Orbis Hotels Group**, una cadena con **50 filiales**, y construye hoteles en cualquier punto de tierra firme del mapa.

## Cómo jugar

1. Abre el mapa y haz clic en tierra firme.
2. Revisa el índice turístico, afinidad costera, coste local e impuestos.
3. Elige una filial y configura el hotel (estrellas, habitaciones, precio, servicios, personal, imagen…).
4. La construcción es instantánea y consume capital en euros.
5. El tiempo avanza en tiempo real: **1 minuto real = 1 hora de juego** (con pausa, x1, x2, x5 y saltar día).
6. Cada día de juego se liquidan ingresos, costes variables y eventos mundiales ocasionales.

## Desarrollo

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API de guardado en nube: http://localhost:8787

## Guardado

- Automático en el navegador
- Exportar / importar archivo JSON
- Nube local mediante código de partida (`/api/saves`)

## Stack

React + TypeScript + Vite + Leaflet (OpenStreetMap) + Zustand + Express
