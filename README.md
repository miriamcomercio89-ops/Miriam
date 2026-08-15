# Mesa Mundial

Simulador de imperio gastronómico sobre el **mapa real del mundo** (OpenStreetMap). Funda miles de restaurantes, adquiere locales existentes vía Overpass y gestiona marcas, caja y expansión automática.

## Cómo jugar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

- **Nueva partida en Álora** — empiezas en el Valle del Guadalhorce con caja para los primeros locales.
- **Demo 1.000 locales** — siembra ~1000 restaurantes en 110 ciudades para ver el canvas y la simulación a escala.
- **Continuar / JSON** — IndexedDB + exportar/importar partida.

### Mapa OSM

| Acción | Qué hace |
| --- | --- |
| Buscar ciudad | Nominatim (Photon de respaldo) centra el mapa |
| Fundar (clic) | Reverse geocoding; no permite abrir en el mar |
| Scout OSM | Overpass lista `restaurant`, `fast_food`, `cafe`, `bar`, `pub` en la vista |
| Clic en anillo dorado | Adquiere ese nodo/way OSM con tu marca |
| Fundación masiva | 1–250 locales por ciudad; prioriza puntos OSM y rellena en espiral |
| Expansión automática | Recorre el plan de ciudades (Álora → mundo) si compras la mejora HQ |

Tiles: Carto Voyager (datos © [OpenStreetMap](https://www.openstreetmap.org/copyright)). Satélite: Esri World Imagery.

### Economía

- 12 marcas (Callejero, Café Paladar, La Tasca, Tapeo, Horno 800, Fuego Burger, Masa Madre, Wok Norte, VerdeVivo, Brasa, Nori, Casa Paladar).
- Coste de apertura según nivel de vida de la ciudad.
- Cada día de juego: cubiertos, ticket, género, nómina, alquiler y competencia local.
- HQ en Álora: niveles, central de compras, academia, delivery, dark kitchens, estrellas, IPO.
- Eventos: crítico, inspección, viral, huelga, feria, alquileres…

Atajos: `Espacio` pausa · `1` `2` `3` velocidad · `F` fundar · `E` explorar.

## Atribución

Usa APIs públicas de OSM. Respeta las políticas de uso de [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) y [Overpass](https://overpass-api.de/). El juego limita peticiones (~1/s en geocodificación) y cachea scout por bounding box.

## Stack

Vite · React 19 · Leaflet · Zustand. Todo corre en el navegador; no hace falta backend.
