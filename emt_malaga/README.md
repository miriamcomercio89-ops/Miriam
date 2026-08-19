# EMT Málaga — Pack de red CTS 2026

Red completa de **tranvía + autobús + nocturno** ambientada en una **Málaga inventada** sobre el **mapa base** de *City Transport Simulator 2026* (compatible con DLC Depot + Southern Route).

Operador ficticio: **EMT Málaga**.

## Contenido (`pdf/`)

| Archivo | Descripción |
|---------|-------------|
| `01_guia_sistema.pdf` | Identidad, zonas, tarifas, depósitos, leyenda |
| `02_paradas.pdf` | Listado maestro de paradas (nombres en español) |
| `03_plano_diurno.pdf` | Esquema de red diurna + índice |
| `04_plano_nocturno.pdf` | Esquema de red nocturna + índice |
| `05_fichas_tranvia.pdf` | Una página por línea T / TD / TC |
| `06_fichas_autobus.pdf` | Una página por línea de bus |
| `07_fichas_nocturno.pdf` | Una página por línea N |
| `08_flota.pdf` | Modelos CTS (base+DLC) y asignación |
| `09_checklist_cts.pdf` | Checklist para montarlo en el juego |

## Cómo regenerar

```bash
pip install reportlab
python3 generate_pdfs.py
```

## Datos editables

- `data/stops.py` — paradas
- `data/lines.py` — rutas, colores, frecuencias, vehículos
- `data/vehicles.py` — catálogo de flota CTS

## Resumen de red

- **12** líneas de tranvía (T1–T10, TD, TC)
- **20** líneas de autobús diurno (1–12, 14–18, 20, C1, E1)
- **8** líneas nocturnas (N1–N8)
- Paradas inventadas en español; topología alineada al mapa CTS
