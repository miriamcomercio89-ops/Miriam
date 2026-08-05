# ORBIS Collection — Planos de hoteles para Hometopia

Colección de **30 hoteles** con PDF editorial de lujo (español), pensados para construir en **Hometopia** sobre mapas de **128×128 m**, rejilla **1×1 m**, norte arriba.

## Estado

| # | Hotel | Destino | PDF |
|---|-------|---------|-----|
| 01 | Hôtel Belle Étoile | Mónaco | `output/01_Hotel_Belle_Etoile_Monaco.pdf` |
| 02–30 | Pendientes | — | Tras validar el #01 |

## Generar el PDF

```bash
cd hometopia-hoteles
pip install -r requirements.txt
python3 generate.py --hotel 01
```

## Contenido de cada PDF

- Portada e identidad (logo, paleta)
- Ficha técnica (estrellas, llaves, precio simbólico, gancho)
- Concepto y narrativa de destino
- Masterplan 128×128 con usos coloreados
- Plantas 2D clásicas con cotas, códigos y leyenda
- Inventario de habitaciones y tipologías
- Superficies, materiales y assets vanilla
- Guía de construcción por fases

## Criterios de juego

- Sin sótanos
- Pasillos ≥ 2 m (plantas tipo a 2,5 m)
- Baño en suite en todas las habitaciones
- Staff reducido y locales técnicos esenciales
- Hoteles **únicos** (cero repetición estructural entre destinos)
