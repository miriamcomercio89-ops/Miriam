# Diseño del sistema ferroviario — Alemania

## Objetivo

Recrear una red **supercompleta** en Alemania para Nimby Rails:

- Base **realista** (corredores, nodos y jerarquía reconocibles).
- Miles de **líneas nuevas ficticias** que densifican la red.
- **82 operadores** con marca en español, color y logo.
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
| nacional | 10 | Ejes federales y competencia abierta |
| especializado | 8 | Nocturno, turismo, aeropuerto, ferias, universidades |
| internacional | 1 | Enlaces Francia/Benelux/Alpes/Polonia/Chequia |
| regional | 35 | 1–3 por Land + operadores transversales |
| metropolitano | 12 | S-Bahn de grandes áreas |
| urbano | 16 | Metro y tranvía |

## Lands cubiertos

| Código | Land | Capital |
| --- | --- | --- |
| `bw` | Baden-Wurtemberg | Stuttgart |
| `by` | Baviera | Múnich |
| `be` | Berlín | Berlín |
| `bb` | Brandeburgo | Potsdam |
| `hb` | Bremen | Bremen |
| `hh` | Hamburgo | Hamburgo |
| `he` | Hesse | Wiesbaden |
| `mv` | Mecklemburgo-Pomerania Occidental | Schwerin |
| `ni` | Baja Sajonia | Hannover |
| `nw` | Renania del Norte-Westfalia | Düsseldorf |
| `rp` | Renania-Palatinado | Maguncia |
| `sl` | Sarre | Sarrebruck |
| `sn` | Sajonia | Dresde |
| `st` | Sajonia-Anhalt | Magdeburgo |
| `sh` | Schleswig-Holstein | Kiel |
| `th` | Turingia | Erfurt |

## Flota

- Unidades catalogadas: **847** (179 base + 668 variantes)
- Asignación: automática según servicios del operador (ver `data/operators.json` → `flota`)
- Colecciones Workshop recomendadas: ver `data/fleet.json`

## Hubs y corredores

- Estaciones/hubs: **568**
- Corredores: **39**
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
