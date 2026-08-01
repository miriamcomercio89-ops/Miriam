# Orbis Hotels Group

Simulador de construcción hotelera mundial (**v0.1**). Dirige **Orbis Hotels Group**, una cadena con **50 filiales**, y construye hoteles en cualquier punto de tierra firme del mapa.

## Novedades v0.1

- Temporadas por hemisferio
- Precio por noche gestionado por IA Orbis Pricing
- Filtros de mapa (filial, estrellas, resultado)
- Confirmación de construcción en 5 pasos
- Finanzas del grupo (7/30 días) y reputación por país
- Línea de crédito / préstamos
- Capas calles / satélite / híbrido
- Mejor detección tierra/agua
- Logos de filial en el mapa + clustering suave
- Sonidos, atajos (`Espacio`, `1`/`2`/`5`, `Esc`) y nueva partida
- Más eventos regionales y lore de filiales
- Galería de imágenes Orbis por tipología

## Cómo jugar

1. Nueva partida o continuar.
2. Clic en tierra firme → ficha del lugar.
3. Elige filial y configura el hotel en pasos (concepto, servicios, imagen, confirmación).
4. El precio lo fija y ajusta la IA cada día.
5. Tiempo real: **1 minuto real = 1 hora de juego**.

## Desarrollo

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API de guardado: http://localhost:8787

## Atajos

| Tecla | Acción |
|-------|--------|
| Espacio | Pausa / reanudar |
| 1 / 2 / 5 | Velocidad |
| Esc | Cerrar paneles |

## Stack

React + TypeScript + Vite + Leaflet + MarkerCluster + Zustand + Express
