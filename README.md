# Orbis Hotels Group

Simulador de construcción hotelera mundial (**v0.2**). Dirige **Orbis Hotels Group**, una cadena con **50 filiales**, pensado para escalar a **más de 50.000 hoteles**.

## Novedades v0.2

- Buscador de ciudad/país (centra el mapa)
- Ranking top 25 (beneficio, ocupación, ROI, satisfacción)
- Lista de hoteles virtualizada (buscar / ordenar / ir al mapa)
- Contratos corporativos gestionados por IA
- Modos **Inspeccionar** / **Construir**
- Mini-ficha al pasar el cursor sobre un hotel
- Textos y tooltips en español
- Eventos ligados a temporada
- Logos y colores de filial más distintivos
- Mapa canvas + clustering para carteras masivas

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

React + TypeScript + Vite + Leaflet (canvas layer) + Zustand + TanStack Virtual + Express
