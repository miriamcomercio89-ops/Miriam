# Guía Red Ibérica 1850–2050 (Transport Fever 2)

PDF mes a mes (enero 1850 → diciembre 2050), volúmenes por década, estilo moderno elegante.

## Generar

```bash
pip install reportlab pillow
python3 guias/tf2_iberica/generate_all.py
# prueba rápida:
python3 guias/tf2_iberica/generate_all.py --decade 1850
python3 guias/tf2_iberica/generate_all.py --limit-months 3
```

## Salida

- `guias/tf2_iberica/output/Red_Iberica_YYYY-YYYY.pdf` — un PDF por década (+ 2050)
- `guias/tf2_iberica/output/Red_Iberica_1850-2050.zip` — todos los volúmenes

## Criterios

Ver `criteria.py` (hub Madrid, Akalipsia-Mod 25, realismo histórico, economía real, préstamos relativos, una página+ por mes).
