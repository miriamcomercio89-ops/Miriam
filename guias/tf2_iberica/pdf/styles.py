# -*- coding: utf-8 -*-
"""Estilos y tipografías PDF — moderno elegante granate/latón."""

from __future__ import annotations

from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from guias.tf2_iberica.criteria import COLORS

PAGE_W, PAGE_H = A4
MARGIN_L = 14 * mm
MARGIN_R = 14 * mm
MARGIN_T = 16 * mm
MARGIN_B = 12 * mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

C_GRANATE = HexColor(COLORS["granate"])
C_GRANATE_D = HexColor(COLORS["granate_dark"])
C_SLATE = HexColor(COLORS["slate"])
C_SLATE_M = HexColor(COLORS["slate_mid"])
C_CREAM = HexColor(COLORS["cream"])
C_PAPER = HexColor(COLORS["paper"])
C_BRASS = HexColor(COLORS["brass"])
C_INK = HexColor(COLORS["ink"])
C_MUTED = HexColor(COLORS["muted"])
C_CARD = HexColor(COLORS["card"])
C_ROW = HexColor(COLORS["row"])
C_WARN = HexColor(COLORS["warn"])
C_OK = HexColor(COLORS["ok"])
C_RAIL = HexColor(COLORS["line_rail"])
C_BUS = HexColor(COLORS["line_bus"])
C_TRAM = HexColor(COLORS["line_tram"])
C_METRO = HexColor(COLORS["line_metro"])
C_SHIP = HexColor(COLORS["line_ship"])
C_AIR = HexColor(COLORS["line_air"])
C_TRUCK = HexColor(COLORS["line_truck"])

_FONTS_READY = False


def register_fonts() -> None:
    global _FONTS_READY
    if _FONTS_READY:
        return
    pdfmetrics.registerFont(TTFont("Display", "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("Display-Bold", "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("Body-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Serif", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"))
    pdfmetrics.registerFont(TTFont("Serif-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"))
    _FONTS_READY = True


def wrap_text(c, text: str, font: str, size: float, max_width: float) -> list[str]:
    words = str(text).split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def mode_color(mode: str) -> Color:
    m = (mode or "").lower()
    if "bus" in m:
        return C_BUS
    if "tram" in m or "tranv" in m:
        return C_TRAM
    if "metro" in m:
        return C_METRO
    if "barco" in m or "mar" in m or "ferry" in m or "ship" in m or "puerto" in m:
        return C_SHIP
    if "avion" in m or "aéreo" in m or "aereo" in m or "air" in m:
        return C_AIR
    if "camion" in m or "camión" in m or "truck" in m:
        return C_TRUCK
    return C_RAIL
