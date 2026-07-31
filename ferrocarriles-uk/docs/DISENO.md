# Diseño del sistema ferroviario — Alemania

## Objetivo

Recrear una red **supercompleta** en el Alemania para Nimby Rails:

- Base **realista** (corredores, nodos y jerarquía reconocibles).
- Miles de **líneas nuevas ficticias** que densifican la red.
- **101 operadores** con marca en español, color y logo.
- Flota moderna mixta inspirada en el Workshop de Nimby Rails.
- Solo **pasajeros**.

## Principios

1. **Marca por operador**: color y logo definen la identidad visual de cada línea.
2. **Tipo por prefijo**: la nomenclatura comunica el producto (AV, RE, S…).
3. **Competencia mixta**: hay operadores dominantes locales y varios compitiendo en ejes gordos.
4. **Flota mixta**: cada operador usa varias series; no hay monocultivo de material.
5. **Escalabilidad**: el generador produce lotes enormes a partir de hubs + reglas.

## Capas de red

| Capa | Tipos | Rol |
| --- | --- | --- |
| Troncal AV/LD | AV, LD, PX, N | Larga distancia nacional/internacional |
| Interregional | IR, RE | Puentes entre Lands y ciudades medias |
| Regional/local | RB, RL, TUR | Cobertura y ramales |
| Metropolitana | S, OR, MC, AE | Alta frecuencia periurbana |
| Urbana | U, T, TT | Metro, tranvía, tram-train |

## Distribución de operadores

| Tipo | Cantidad | Notas |
| --- | --- | --- |
| nacional | 16 | Ejes federales y competencia abierta |
| internacional | 2 | Enlaces Francia/Benelux/Alpes/Polonia/Chequia |
| especializado | 12 | Nocturno, turismo, aeropuerto, ferias, universidades |
| regional | 33 | 1–3 por Land + operadores transversales |
| metropolitano | 19 | S-Bahn de grandes áreas |
| urbano | 19 | Metro y tranvía |

## Lands cubiertos

| Código | Land | Capital |
| --- | --- | --- |
| `be` | Berlín | Berlín |
| `bb` | Brandeburgo | Potsdam |
| `mv` | Mecklemburgo-Pomerania Occidental | Schwerin |
| `sh` | Schleswig-Holstein | Kiel |
| `hh` | Hamburgo | Hamburgo |
| `ni` | Baja Sajonia | Hannover |
| `hb` | Bremen | Bremen |
| `nw` | Renania del Norte-Westfalia | Düsseldorf |
| `he` | Hesse | Wiesbaden |
| `rp` | Renania-Palatinado | Maguncia |
| `sl` | Sarre | Sarrebruck |
| `bw` | Baden-Wurtemberg | Stuttgart |
| `by` | Baviera | Múnich |
| `th` | Turingia | Erfurt |
| `sn` | Sajonia | Dresde |
| `st` | Sajonia-Anhalt | Magdeburgo |

## Flota

- Unidades catalogadas: **847** (179 base + 668 variantes)
- Asignación: automática según servicios del operador (ver `data/operators.json` → `flota`)
- Colecciones Workshop recomendadas: ver `data/fleet.json`

## Hubs y corredores

- Estaciones/hubs: **440**
- Corredores: **28**
- Detalle: `data/hubs.json`, `data/corridors.json`

## Generador

Entrada:

- `data/operators.json`
- `data/line-types.json`
- `data/hubs.json`
- `data/fleet.json`
- `data/corridors.json`

Salida:

- `output/lines-sample.json` (muestra)
- `output/lines-mass.json` (lote masivo)
- `output/*-summary.json`

## Fases

| Fase | Estado | Contenido |
| --- | --- | --- |
| A | Hecha | Catálogo operadores + logos + colores + zonas |
| B | Hecha | Nomenclatura y tipos de línea |
| C | Hecha | Catálogo flota ampliado (cientos) + asignación mixta |
| D | Hecha | Generador por corredor + cuotas |
| E | Hecha | Hubs densificados + miles de líneas |
| F | Hecha | Guía de importación a partida Nimby Rails |
