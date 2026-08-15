# Industry Manager v4

Simulador industrial **solo campaña** en el navegador: mapa OpenStreetMap, ciudades reales al hacer clic, fábricas con huecos, cadenas de suministro, clima local, parcelas, bolsa con órdenes limitadas y **miles de misiones** con progresión.

## Cómo jugar (escritorio)

1. Descarga el ZIP del juego y **descomprime** la carpeta.
2. Abre `index.html` con doble clic (Chrome / Edge / Firefox).
3. Elige rama: **Agro andaluz**, **Acero & metales** o **Chips & alta tech**.
4. Haz clic en el mapa → se detecta la ciudad (Nominatim) → funda la oficina.
5. Dibuja **parcelas** (panel Planta), mira el **clima** del sitio y construye.
6. Cumple misiones en **Campaña** (hay miles, se van desbloqueando).
7. En **Mercado**, abre la **bolsa** de un producto: gráfico + órdenes límite.

Truco: escribe `INDUSTRIA_TOTAL` para desbloquear todo (solo pruebas).

## Novedades v4

1. Briefings de capítulo + **~8100 misiones** de campaña con progresión por rama  
2. Elección de rama al empezar  
5. Parcelas industriales (polígono + capacidad de edificios)  
7. Clima local (temperatura / lluvia según latitud)  
13. Bolsa interactiva (histórico de precios + órdenes límite)  
+ UI a color, iconos por producto, más categorías (naval, aeroespacial, mobiliario, cosmética, juguetes, deporte, joyería, cerámica…)

## Controles

| Acción | Resultado |
|--------|-----------|
| Clic mapa | Detectar ciudad OSM |
| Panel Planta → Parcela | Dibujar suelo industrial |
| Panel Campaña | Misiones activas + briefings |
| Panel Mercado → Bolsa | Gráfico y órdenes límite |
| Espacio | Pausa |
| Ctrl+S | Guardar |

## Datos

- Generados con `node tools/generate-data.js` → `js/data/*.js`
- Misiones de campaña: `js/data/campaign_v4.js`
- Guardado: `localStorage` clave `industry_manager_save_v4`

## Requisitos

- Navegador de escritorio con JavaScript
- Internet (mapa OSM + geocodificación Nominatim)
