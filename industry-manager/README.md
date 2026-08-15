# Industry Manager

Simulador tycoon industrial en el navegador (HTML/CSS/JS, sin build).

## Cómo jugar

1. Abre `industry-manager/index.html` en un navegador de escritorio.
2. Usa el **mapa OpenStreetMap** (Leaflet) para elegir hubs industriales.
3. Construye edificios, instala máquinas en slots, compra/vende en el mercado, investiga y completa misiones.

## Escala temporal

- **1 minuto real = 1 hora de juego**
- Controles: pausa, 1×, 2×, 5×, 10×

## Contenido (generado)

El catálogo se genera con taxonomía industrial contemporánea (español):

```bash
node tools/generate-data.js
```

Incluye miles de ítems, recetas, edificios, tecnologías, misiones y competidores IA.

## Truco I+D

En **Ajustes**, código: `INDUSTRIA_TOTAL` — desbloquea todas las tecnologías.

## Guardado

`localStorage` automático + guardado manual / exportar JSON.
