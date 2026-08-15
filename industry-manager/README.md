# Industry Manager v3 — Campaña

Tycoon industrial en el navegador. **Solo modo campaña.**

## Cómo jugar

1. Abre `index.html`.
2. Empiezas con **100.000.000 €** y **cero plantas**.
3. **Haz click en el mapa**: el juego consulta OpenStreetMap (Nominatim), detecta la ciudad real y funda tu oficina.
4. Busca ciudades con el cuadro de búsqueda del mapa.
5. Sigue **Campaña**, **Cadenas** y misiones.

## Cambios v3

- Construcción libre en el mapa (sin ciudades inventadas)
- Nombres en **español de España** (p. ej. **aceituna**, no «oliva» como fruto)
- Campaña por capítulos + cadenas mena→producto
- Planificador de fábrica, B2B, blueprints, auto-expansión
- Niebla industrial, divisas, políticas por país, estaciones
- Mantenimiento de máquinas + auto-reparación
- Semiconductores / baterías, **8.196 ítems**
- Mercado/IA en Web Worker
- Script de balance: `node tools/balance-sim.js`

## Truco I+D

`INDUSTRIA_TOTAL`

## Nota OSM

La detección de ciudad requiere red (Nominatim, 1 petición/s). Si falla, se usa un paraje por coordenadas.
