#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera todos los volúmenes PDF Red Ibérica 1850–2050 y el ZIP final."""

from __future__ import annotations

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
sys.path.insert(0, str(REPO))

from guias.tf2_iberica.content.planner import (  # noqa: E402
    build_all_months,
    decade_starts,
    plans_for_decade,
)
from guias.tf2_iberica.pdf.renderer import render_volume  # noqa: E402

OUT = ROOT / "output"
ART = Path("/opt/cursor/artifacts")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--decade", type=int, default=None, help="Solo una década (ej. 1850)")
    ap.add_argument("--limit-months", type=int, default=None, help="Limitar meses (prueba)")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)

    print("Planificando 1850-01 → 2050-12…")
    plans = build_all_months()
    if args.limit_months:
        plans = plans[: args.limit_months]
        print(f"Limitado a {len(plans)} meses (prueba)")

    decades = decade_starts()
    if args.decade:
        decades = [args.decade]

    pdfs: list[Path] = []
    for start in decades:
        end = start if start == 2050 else start + 9
        subset = plans_for_decade(plans, start)
        if not subset:
            continue
        name = f"Red_Iberica_{start}-{end}.pdf"
        path = OUT / name
        print(f"Renderizando {name} ({len(subset)} meses)…")
        pages = render_volume(path, subset, start, end)
        print(f"  → {pages} páginas")
        pdfs.append(path)
        # copy to artifacts individually for browsing
        shutil.copy2(path, ART / name)

    zip_path = OUT / "Red_Iberica_1850-2050.zip"
    print(f"Empaquetando {zip_path.name}…")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        # README dentro del zip
        readme = (
            "Red Ibérica 1850–2050 — Transport Fever 2\n"
            "========================================\n"
            "Volúmenes por década (A4 vertical, español).\n"
            "Juega en pausa el día 1 de cada mes y sigue la ficha.\n"
            "Mods: busca en Steam Workshop el nombre exacto indicado el mes en que aparece.\n"
            "Industrias: Akalipsia-Mod 25 (id 3539897274).\n"
        )
        zf.writestr("LEEME.txt", readme)
        for p in pdfs:
            zf.write(p, arcname=p.name)

    shutil.copy2(zip_path, ART / zip_path.name)
    print(f"OK: {len(pdfs)} PDFs + ZIP en {OUT} y {ART}")


if __name__ == "__main__":
    main()
