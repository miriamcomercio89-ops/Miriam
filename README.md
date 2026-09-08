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
- **Copia de seguridad automática en disco** (botón 🛡 de la cabecera, Chrome/Edge de escritorio): eliges una vez un archivo en tu PC y, desde entonces, cada guardado se escribe también ahí solo. Ese archivo vive fuera del navegador, así que **nunca lo borra "limpiar caché" ni "borrar datos del sitio"**; si el navegador te pide reconfirmar el permiso tras un borrado, el botón se pone en ámbar — un clic y sigue igual, sin perder nada. En navegadores sin esta API (Firefox, Safari) el mismo botón activa una **descarga periódica automática** del guardado a tu carpeta de Descargas (cada varios minutos), así que el respaldo en disco también funciona ahí.
- Al empezar o cargar una partida, si el autoguardado en disco no está activo todavía, aparece un aviso abajo con un botón **Activar** para encenderlo con un solo clic (se puede descartar con "Ahora no" y no vuelve a molestar).

## Atlas de locales y plan de expansión

PDFs de todo el mundo (dirección OSM, mapa de zona, logo y prompt de fachada para generar la foto), el plan de expansión global maestro de Horizon (empezando en la provincia de Málaga —con el piloto de Cártama— y expandiéndose por orden lógico y realista, ciudades grandes y zonas turísticas primero, con el directorio completo de los 147.884 municipios del mundo), el plan de expansión de cada una de las 50 marcas propias (500 fases, un PDF por fase) y el Plan de Construcción Real definitivo del grupo (50 marcas mezcladas, etapas de 1.000 locales divididas en 20 fases de 50, empezando en Álora y abriendo por rondas —1 local por ciudad del mundo antes de abrir el segundo— para cubrir casi todo el planeta ya en la primera etapa): ver [descargas/README.md](descargas/README.md).

## Horizon Hotels — el mismo simulador, ahora de hoteles

Segundo videojuego independiente en la carpeta [`hoteles/`](hoteles/): la misma mecánica (mapa real, gerente IA por local, impuesto de sociedades, inflación real, autoguardado en disco, buscador de direcciones, iconos grandes, foto A4 con zoom) pero para una cadena hotelera — **Horizon Hotels**, con **50 marcas propias** (10 segmentos × 5 categorías de estrellas, todas con el nombre Horizon) y **30 formatos** de hotel (de un hostal de 12 habitaciones a un mega-resort todo incluido de 600). Se juega con **ocupación (%), ADR y RevPAR** en lugar de tickets y comensales: el personal (recepción, pisos, mantenimiento, dirección) y las amenities (piscina, spa, gimnasio, restaurante interno, parking…) suben la demanda y el precio. Empiezas el 1 de enero de 2000 con 5.000.000 €.

**Descarga:** [horizon_hotels_simulador.zip](https://media.githubusercontent.com/media/miriamcomercio89-ops/Miriam/cursor/simulador-mejoras-iconos-busqueda-rentabilidad-d2e2/descargas/horizon_hotels_simulador.zip) — descomprime, entra en la carpeta `hoteles/` (deben verse `index.html`, `js/`, `css/`, `vendor/` e `img/`) y abre `index.html` en Chrome o Edge.

Trae también su propio **Plan de Construcción Real**: mismo formato que el de restaurantes (etapas de 1.000 hoteles divididas en 20 fases de 50), empezando en **Marbella** y expandiéndose por rondas a las ciudades y zonas turísticas reales del mundo — un universo mucho más concentrado (~160.000 hoteles, casi ausente en pueblos pequeños sin atractivo turístico). Ver [descargas/README.md](descargas/README.md#horizon-hotels).

## Créditos de mapa

© [OpenStreetMap](https://www.openstreetmap.org/copyright) · teselas OSM Carto en ciudad · imágenes [Esri World Imagery](https://www.esri.com/) al alejar · geocodificación [Photon](https://photon.komoot.io/).
