# EMT Málaga — Pack de red CTS 2026

Red de **tranvía + autobús + nocturno** ambientada en Málaga inventada sobre el **mapa base** de CTS 2026.

Cada parada documenta **ambos nombres**:
- **CTS (mapa)** = nombre alemán/ficción que ves en el juego  
- **EMT Málaga** = nombre nuevo en español para renombrar

## Descarga

- `EMT_Malaga_CTS2026_PDFs.zip`
- `EMT_Malaga_CTS2026_completo.zip`

Enlaces GitHub (rama del PR):
- https://github.com/miriamcomercio89-ops/Miriam/raw/cursor/emt-malaga-cts2026-7972/emt_malaga/EMT_Malaga_CTS2026_PDFs.zip
- https://github.com/miriamcomercio89-ops/Miriam/raw/cursor/emt-malaga-cts2026-7972/emt_malaga/EMT_Malaga_CTS2026_completo.zip

## PDFs

| Archivo | Contenido |
|---------|-----------|
| 01 | Guía |
| 02 | Paradas CTS ↔ español |
| **02b** | **Checklist renombrado ☐** |
| 03 / 03b | Planos diurno + distritos |
| 04 | Plano nocturno |
| 05–07 | Fichas T / bus / N (dual name) |
| 08 | Flota |
| 09 | Checklist CTS |
| 10 | Calendario |
| 11 / **11b** | R-EST estadio / **R-FERIA** |
| 12 | Horarios Line Editor |
| **13** | **Fichas hubs / correspondencias** |

## Red

- 13 tranvías (T1–T10, TD, TC, TP)
- Buses diurnos + A1–A4 + **U1/U2 escolar-uni (solo lectivo)**
- 8 nocturnos
- Planes R-EST y R-FERIA

```bash
pip install reportlab
python3 generate_pdfs.py
```
