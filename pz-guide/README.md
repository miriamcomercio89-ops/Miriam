# Guía Limpieza Total — Project Zomboid B42.20

Serie de **21 PDFs A4** (~690 páginas) para limpiar Knox Country completo desde Riverside.

## Tu partida

- Sandbox · población alta · sin respawn · migración sí
- Solo · sin mods · spawn Riverside
- Objetivo: mapa 100% explorado y despejado, edificio por edificio

## Fidelidad al mapa (v2)

- Calles reales B42 (`Street_names` / fliers): Rock Ridge, Rogers Ave, Kelly Dr, North Main, Dixie Hwy…
- Riverside: **70** casas suburbios + **34** gated (PZwiki)
- POIs con coords wiki (Nails & Nuts, Pharmahug, Lectromax, Fossoil…)
- Esquemas con flechas de ruta + GATE / BA / RÍO
- **Loot crítico** por volumen (contenedores correctos; spawns no garantizados)

## Generar PDFs

```bash
pip install reportlab pypdf
python3 src/generate_all.py
```

Salida en `output/`. Empaquetado: `PZ_B42.20_Guia_Limpieza_Total.zip`.

## Orden

`00` índice → `01` protocolo → `02-05` Riverside → oeste B42 → sur → eje Dixie → Louisville `17-19` → `20` cierre.
