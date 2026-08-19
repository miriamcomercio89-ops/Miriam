# EMT Málaga — Pack de red CTS 2026

Red completa de **tranvía + autobús + nocturno** ambientada en una **Málaga inventada** sobre el **mapa base** de *City Transport Simulator 2026* (compatible con DLC Depot + Southern Route).

Operador ficticio: **EMT Málaga**. Paradas **100 % en español**.

## Contenido (`pdf/`)

| Archivo | Descripción |
|---------|-------------|
| `01_guia_sistema.pdf` | Identidad, zonas, tarifas, depósitos, leyenda |
| `02_paradas.pdf` | Listado maestro de paradas (español) |
| `03_plano_diurno.pdf` | Esquema de red diurna (mapa Netz) |
| `03b_planos_distrito.pdf` | Planos por distrito |
| `04_plano_nocturno.pdf` | Esquema de red nocturna |
| `05_fichas_tranvia.pdf` | Una página por línea T / TP |
| `06_fichas_autobus.pdf` | Buses + alimentadoras A1–A4 |
| `07_fichas_nocturno.pdf` | Una página por línea N |
| `08_flota.pdf` | Modelos CTS (base+DLC) y asignación |
| `09_checklist_cts.pdf` | Checklist + validación jugable |
| `10_calendario_operativo.pdf` | Verano / Feria / Navidad |
| `11_refuerzos_estadio.pdf` | Plan R-EST |
| `12_horarios_line_editor.pdf` | Plantillas de intervalo CTS |

## Descarga

- `EMT_Malaga_CTS2026_PDFs.zip` — solo PDFs  
- `EMT_Malaga_CTS2026_completo.zip` — PDFs + generador + datos  

## Cómo regenerar

```bash
pip install reportlab
python3 generate_pdfs.py
```

## Resumen de red

- **13** líneas de tranvía (T1–T10, TD, TC, **TP** patrimonial)
- **24** líneas de autobús diurno (incluye **A1–A4** midibús)
- **8** líneas nocturnas (N1–N8)
- Validación vs mapa Netz · zonas en fichas · horarios · calendario · refuerzos estadio
