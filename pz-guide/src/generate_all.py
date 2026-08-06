#!/usr/bin/env python3
"""Generate the full Project Zomboid B42.20 total-clear PDF series."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "output"
sys.path.insert(0, str(ROOT))

from volumes_core import vol_00_indice, vol_01_protocolo
from volumes_riverside import vol_02_suburbios, vol_03_gated, vol_04_comercial, vol_05_oeste_cc
from volumes_west import (
    vol_06_corredor,
    vol_07_brandenburg,
    vol_08_fallas,
    vol_09_echo,
    vol_10_ekron,
    vol_11_irvington,
)
from volumes_classic import (
    vol_12_rosewood,
    vol_13_march,
    vol_14_muldraugh,
    vol_15_westpoint,
    vol_16_valley,
)
from volumes_louisville import (
    vol_17_lv_sw_west,
    vol_18_lv_central_south,
    vol_19_lv_east_north,
    vol_20_master,
)


VOLUMES = [
    ("00_Indice_Maestro_y_Orden.pdf", vol_00_indice),
    ("01_Protocolo_Personaje_y_Dias_1-14.pdf", vol_01_protocolo),
    ("02_Riverside_Suburbios_Sur_Casa_por_Casa.pdf", vol_02_suburbios),
    ("03_Riverside_Comunidad_Cerrada_BA1.pdf", vol_03_gated),
    ("04_Riverside_Distrito_Comercial_Norte.pdf", vol_04_comercial),
    ("05_Riverside_Industrial_y_Country_Club.pdf", vol_05_oeste_cc),
    ("06_Corredor_Oeste_Farms_Scenic_Grove.pdf", vol_06_corredor),
    ("07_Brandenburg_Ciudad_Completa.pdf", vol_07_brandenburg),
    ("08_Fallas_Lake_y_Doe_Valley.pdf", vol_08_fallas),
    ("09_Echo_Creek_Pueblo_y_Granjas.pdf", vol_09_echo),
    ("10_Ekron_Industrial_Steelworks.pdf", vol_10_ekron),
    ("11_Irvington_y_Speedway.pdf", vol_11_irvington),
    ("12_Rosewood_y_Prision.pdf", vol_12_rosewood),
    ("13_March_Ridge.pdf", vol_13_march),
    ("14_Muldraugh_y_Dixie.pdf", vol_14_muldraugh),
    ("15_West_Point.pdf", vol_15_westpoint),
    ("16_Valley_Station_y_Acceso_Louisville.pdf", vol_16_valley),
    ("17_Louisville_Suroeste_y_Oeste.pdf", vol_17_lv_sw_west),
    ("18_Louisville_Centro_y_Sur.pdf", vol_18_lv_central_south),
    ("19_Louisville_Este_y_Norte.pdf", vol_19_lv_east_north),
    ("20_Checklist_Maestro_y_Cierre_del_Mapa.pdf", vol_20_master),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    # clean previous pdfs
    for old in OUT.glob("*.pdf"):
        old.unlink()

    print(f"Generando {len(VOLUMES)} PDFs en {OUT} ...")
    for filename, fn in VOLUMES:
        path = OUT / filename
        print(f"  → {filename}")
        fn(str(path))
        size_kb = path.stat().st_size / 1024
        print(f"     {size_kb:.1f} KB")
    print("OK")


if __name__ == "__main__":
    main()
