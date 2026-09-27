# Periodica

Juego de fábricas en el navegador, inspirado en Factorio pero más guiado: **los 118 elementos de la tabla periódica** son recursos, y a partir de ellos se generan **miles de minerales, lingotes, sales, ácidos, aleaciones, plásticos y piezas**.

No hace falta saber programar. Si puedes abrir una terminal y copiar dos comandos, puedes jugar.

## Cómo jugar (en tu ordenador)

Necesitas [Node.js](https://nodejs.org/) (versión 20 o superior). Luego, en esta carpeta:

```bash
npm install
npm run dev
```

Abre la dirección que aparezca (normalmente `http://localhost:5173`). La partida se guarda en el navegador con el botón **Guardar**.

## Controles

| Acción | Cómo |
| --- | --- |
| Colocar edificio | Clic izquierdo |
| Recoger edificio | Clic derecho (devuelve el 60% del coste) |
| Rotar cintas / salida | `R` |
| Mover cámara | `WASD` o arrastrar con el botón central |
| Zoom | Rueda del ratón |
| Tabla periódica | `P` |
| Investigación | `T` |
| Enciclopedia de recetas | `E` (incluye crafteo a mano) |
| Pausa / velocidad | Espacio, `+` / `-` |

## Idea del juego

1. Aterrizas junto a yacimientos de **hierro, carbón, cobre y silicio**.
2. Extraes, fundes y montas cintas. Todo viaja por cinta, también el agua envasada: más simple que tuberías.
3. Los **laboratorios** comen paquetes de ciencia y abren eras: metalurgia, química, orgánica, electrónica, tierras raras, nuclear y frontera.
4. El objetivo opcional es fabricar el **Núcleo de Periodica**, que pide circuitos, superconductores, imanes de neodimio y combustible de uranio.

La tabla periódica es un mapa de progreso: color si ya tienes el elemento, borde si hay yacimiento en el mundo.

## Qué hay ahora mismo

- 118 elementos, yacimientos procedurales y rareza (común → sintético).
- Miles de productos; la UI destaca ~30 con nombre e historia, más el árbol “desde cero”.
- Juegas como **España**. El resto de países de la Tierra envían pedidos.
- Tabla periódica como tablero: clic en un elemento para ir a su yacimiento. Completar un grupo da reputación.
- Cintas arrastrables, copiar/pegar (Ctrl+C/V), deshacer (Ctrl+Z), alertas, stats, daltonismo, sonido y minimapa.
- Logos/símbolos de elemento en el mapa (casilla tipo tabla periódica).
- Árbol de investigación por eras, enciclopedia y crafteo a mano.

## Ideas para más adelante

Estas son mejoras que encajan con un Periodica más grande, si quieres seguir:

1. **Logística inteligente** — drones, trenes y peticiones (“quiero 200 ácido sulfúrico”) en lugar de solo cintas.
2. **Planos y copiar-pegar** — seleccionar una fábrica y repetirla, esencial cuando las cadenas crecen.
3. **Planetas y lunas** — cada cuerpo con una firma elemental distinta (Helio-3 en la luna, tierras raras en un asteroide).
4. **Contaminación y clima** — los ácidos y el carbón manchan el mapa; los filtros y la química verde son otra rama.
5. **Modo historia** — una colonia en Álora / la Tierra que te pide envíos concretos (medicinas, aleaciones, chips).
6. **Multijugador cooperativo** — dos personas, una tabla.
7. **Editor de recetas** — que alguien sin código pueda añadir un compuesto real y su ruta.
8. **Sonido y música reactiva** — el ritmo cambia según la era científica.
9. **Simulación más fiel** — estados de oxidación, catalizadores que se gastan, isótopos.
10. **Accesibilidad** — daltonismo (los grupos ya van por color), narración de la tabla, tutorial paso a paso con flechas.

## Desarrollo

```bash
npm test      # catálogo, recetas y mundo inicial
npm run build
```
