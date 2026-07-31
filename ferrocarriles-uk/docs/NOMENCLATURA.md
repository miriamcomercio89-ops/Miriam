# Nomenclatura de líneas

## Regla general

```text
CODIGO_PUBLICO = {PREFIJO}{NUMERO}
```

- El **prefijo** indica el **tipo de servicio**.
- El **número** es único dentro de ese prefijo a escala nacional (excepto S/U/T, locales al área; el generador guarda `codigo_interno`).
- El **color** de la línea es siempre el del **operador**, no del tipo.

## Tipos

| Prefijo | Tipo | Vmax obj. | Ámbito | Rango nº |
| --- | --- | --- | --- | --- |
| `AV` | Alta velocidad | 300 km/h | nacional, internacional | 1–199 |
| `LD` | Larga distancia | 200 km/h | nacional, internacional | 1–999 |
| `IR` | Interregional | 160 km/h | multiregional | 1–999 |
| `RE` | Regional exprés | 160 km/h | regional | 1–2999 |
| `RB` | Regional básico | 120 km/h | regional, local | 1–4999 |
| `S` | Cercanías | 140 km/h | metropolitano | 1–99 |
| `U` | Metro | 80 km/h | urbano | 1–99 |
| `T` | Tranvía | 70 km/h | urbano | 1–199 |
| `TT` | Tranvía-tren | 100 km/h | metropolitano, regional | 1–299 |
| `AE` | Aeropuerto exprés | 160 km/h | metropolitano | 1–49 |
| `N` | Nocturno | 160 km/h | nacional, internacional | 1–199 |
| `TUR` | Turístico | 100 km/h | regional, turistico | 1–199 |
| `OR` | Orbital | 120 km/h | metropolitano | 1–49 |
| `PX` | Premium exprés | 230 km/h | nacional | 1–99 |
| `MC` | Metropolitano cruzado | 140 km/h | metropolitano | 1–199 |
| `RL` | Ramal local | 100 km/h | local | 1–2999 |

## Ejemplos

| Código | Significado |
| --- | --- |
| `AV12` | Alta velocidad nº 12 |
| `LD340` | Larga distancia nº 340 |
| `RE1205` | Regional exprés nº 1205 |
| `S3` | Cercanías línea 3 (área local) |
| `U2` | Metro línea 2 |
| `TT14` | Tranvía-tren 14 |
| `AE4` | Aeropuerto exprés 4 |
| `N7` | Nocturno 7 |
| `TUR22` | Turístico 22 |
| `RL880` | Ramal local 880 |

## Metadatos de línea (generador)

Cada línea generada incluye:

- `codigo`, `codigo_interno`
- `tipo_id`, `operador_id`
- `color` (copiado del operador)
- `origen`, `destino`, `via` (estaciones)
- `frecuencia_min`
- `material` (ids de flota)
- `origen_datos`: `real` | `ficticia` | `hibrida`
