# Horizon Restaurant Group

Videojuego de gestión en el navegador: la matriz **Horizon Restaurant Group** y **50 marcas** independientes (de la comida rápida a la alta cocina) sobre el mapa real. Empiezas el **1 de enero de 2000** con 2.000.000 €.

Cada local tiene un **gerente IA** que gestiona el sitio entero según su habilidad. En un **food hall**, cada puesto tiene su propio gerente, carta y P&L. El impuesto de **sociedades** se cobra sobre el beneficio; la **inflación** (y los brotes) suben alquiler, salarios y género.

No hace falta servidor ni build. **Descomprime el ZIP**, entra en la carpeta (deben verse `index.html`, `js/`, `css/` y `vendor/`) y abre `index.html` en Chrome o Edge. No lo abras desde el visor de ZIP de Windows. El mapa necesita internet.

**Descarga:** [horizon_simulador.zip](https://media.githubusercontent.com/media/miriamcomercio89-ops/Miriam/cursor/meridiano-imperio-gastronomico-d2e2/descargas/horizon_simulador.zip)

## Cómo jugar

1. Abre `index.html` (o sirve la carpeta: `python3 -m http.server 8080`).
2. **Nueva partida**.
3. Busca una ciudad, usa **Mi ubicación**, o navega el mapa.
4. Clic en tierra edificable: el juego consulta OSM (Photon/Nominatim) y rellena datos reales del lugar.
5. Elige marca y formato: kiosco, local, **cocina fantasma**, flagship, **food hall** (puestos con gerente propio) o estadio.
6. El tiempo corre: **1 minuto real = 1 hora de juego** (a 1×). Pausa, 2×–16× y **saltar día**.
7. Ficha del local: foto y descripción, carta, personal, inventario, finanzas, **comprar el bajo**, reformar, marca, cerrar o vender.
8. Pestaña **Matriz**: libro de marca, **préstamos** y **trucos de caja**. **Prensa**: periódico de la década y **anuario** el 31 de diciembre.

No se puede construir en océano, costas de agua, parques ni reservas. Metro o calle peatonal (OSM) suben la demanda.

## Marcas

Cincuenta filiales con identidad propia (carta, tramo y colores). Un local = una marca, salvo food hall (hasta 3 invitadas). **Horizon Market** es el concepto de food hall; **Horizon Express**, el de estaciones y aeropuertos.

## Simulación

- Ingresos en tiempo real según hora **local**, población, riqueza del país, calidad, limpieza, estrellas, precios y **competencia oculta**.
- Personal, alquiler, IVA, **impuesto de sociedades**, salarios e inflación por país (los brotes inflacionarios suben costes de verdad).
- Eventos: inspecciones, ferias, inflación, apagones, críticos, huelgas, temporal.

## Guardado

- Varias partidas (localStorage + IndexedDB), incluidas las fotos que subas a cada local.
- Autoguardado.
- Exportar / importar JSON (botones ⤓/⤒ de la cabecera): crea un archivo real en tu disco que sobrevive a cualquier borrado de caché o datos del navegador.
- **Copia de seguridad automática en disco** (botón 🛡 de la cabecera, Chrome/Edge de escritorio): eliges una vez un archivo en tu PC y, desde entonces, cada guardado se escribe también ahí solo. Ese archivo vive fuera del navegador, así que **nunca lo borra "limpiar caché" ni "borrar datos del sitio"**; si el navegador te pide reconfirmar el permiso tras un borrado, el botón se pone en ámbar — un clic y sigue igual, sin perder nada. En navegadores sin esta API (Firefox, Safari) usa Exportar (⤓) de cuando en cuando como copia externa.

## Atlas de locales y plan de expansión

PDFs de todo el mundo (dirección OSM, mapa de zona, logo y prompt de fachada para generar la foto), el plan de expansión global maestro de Horizon (empezando en la provincia de Málaga —con el piloto de Cártama— y expandiéndose por orden lógico y realista, ciudades grandes y zonas turísticas primero, con el directorio completo de los 147.884 municipios del mundo) y el plan de expansión de cada una de las 50 marcas propias (500 fases, un PDF por fase): ver [descargas/README.md](descargas/README.md).

## Créditos de mapa

© [OpenStreetMap](https://www.openstreetmap.org/copyright) · teselas OSM Carto en ciudad · imágenes [Esri World Imagery](https://www.esri.com/) al alejar · geocodificación [Photon](https://photon.komoot.io/).
