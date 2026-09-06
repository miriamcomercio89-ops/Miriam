# Saborama — Imperio Gastronómico

Videojuego de gestión en el navegador: la matriz **Saborama** y **50 filiales** (parte del nombre + especialidad) sobre el mapa real. Empiezas el **1 de enero de 2000** con 2.000.000 €.

Cada local tiene un **gerente IA** que fija carta y precios. Teselas **Esri/OSM** (sin API key). Logos en `img/filiales/`.

No hace falta servidor ni build. **Descomprime el ZIP**, entra en la carpeta (deben verse `index.html`, `js/`, `css/` y `vendor/`) y abre `index.html` en Chrome o Edge. No lo abras desde el visor de ZIP de Windows. El mapa necesita internet.

## Cómo jugar

1. Abre `index.html` (o sirve la carpeta: `python3 -m http.server 8080`).
2. **Nueva partida**.
3. Busca una ciudad, usa **Mi ubicación**, o navega el mapa.
4. Clic en tierra edificable: el juego consulta OSM (Photon/Nominatim) y rellena datos reales del lugar (dirección, país, población estimada, salarios, IVA, alquiler, zona horaria, competencia oculta).
5. Elige filial y formato: kiosco, local, **cocina fantasma**, flagship, **food hall** o estadio.
6. El tiempo corre: **1 minuto real = 1 hora de juego** (a 1×). Pausa, 2×–16× y **saltar día**.
7. Ficha del local: carta, personal, inventario, finanzas, **comprar el bajo**, reformar, marca, cerrar o vender.
8. Pestaña **Matriz**: libro de marca (firma, precios, alcohol). **Prensa**: periódico de la década y **anuario** el 31 de diciembre.

No se puede construir en océano, costas de agua, parques, reservas ni aeropuertos. La zonificación residencial alarga los permisos. Metro o calle peatonal (OSM) suben la demanda.

## Marcas

Cincuenta filiales con **carta larga** (packs extra por cocina). Un local = una marca, salvo food hall (hasta 3 invitadas). Incluye bares y alcohol.

## Simulación

- Ingresos en tiempo real según hora **local** del restaurante, población, riqueza del país (PIB 2000 inflado), calidad, limpieza, estrellas, precios y **competencia oculta** (no aparece en el mapa).
- Personal, alquiler, IVA, salarios mínimos e inflación por país.
- Eventos: inspecciones, ferias, inflación, apagones, críticos, huelgas, temporal.
- A zoom lejano el mapa agrega por **país** y **ciudad**; al acercar, **clusters con el logo de la marca** dominante. La simulación detallada se concentra en lo activo; con muchos miles de locales se agrega para no tumbar el navegador.

## Guardado

- Varias partidas (IndexedDB).
- Autoguardado.
- Exportar / importar JSON.

## Créditos de mapa

© [OpenStreetMap](https://www.openstreetmap.org/copyright) · teselas [Esri World Street Map](https://www.esri.com/) (sin API key) · geocodificación [Photon](https://photon.komoot.io/) (datos OSM). Respeta su política de uso: el juego limita las peticiones a ~1/s.
