#!/usr/bin/env python3
"""Genera los PDFs de planos hoteleros para Hometopia."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from lib.pdf_builder import generate_hotel_pdf  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Generar planos PDF Hometopia")
    parser.add_argument(
        "--hotel",
        default="01",
        help="ID de hotel a generar (por ahora: 01)",
    )
    args = parser.parse_args()

    if args.hotel == "01":
        from hoteles.hotel_01_monaco import HOTEL  # type: ignore
    else:
        print(f"Hotel {args.hotel} aún no disponible. Solo está el 01 (Mónaco).")
        return 1

    out = ROOT / "output" / f"{HOTEL['id']}_{_slug(HOTEL['nombre'])}_{_slug(HOTEL['destino'])}.pdf"
    path = generate_hotel_pdf(HOTEL, out)
    print(f"PDF generado: {path}")
    print(f"Peso: {path.stat().st_size / 1024:.1f} KB")
    return 0


def _slug(text: str) -> str:
    import unicodedata
    import re

    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_")
    return text


if __name__ == "__main__":
    raise SystemExit(main())
