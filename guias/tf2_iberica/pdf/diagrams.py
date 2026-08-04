# -*- coding: utf-8 -*-
"""Diagramas esquemáticos tipo plano de metro."""

from __future__ import annotations

from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas

from guias.tf2_iberica.pdf.styles import (
    C_BRASS,
    C_CREAM,
    C_GRANATE,
    C_INK,
    C_METRO,
    C_MUTED,
    C_RAIL,
    C_SHIP,
    C_SLATE,
    C_AIR,
    C_BUS,
    wrap_text,
)


def draw_metro_schematic(c: Canvas, x: float, y: float, w: float, h: float, phase: str, year: int) -> float:
    """Dibuja un croquis de corredores; devuelve y inferior."""
    c.setFillColor(C_CREAM)
    c.roundRect(x, y - h, w, h, 4, fill=1, stroke=0)
    c.setStrokeColor(C_BRASS)
    c.setLineWidth(0.8)
    c.roundRect(x, y - h, w, h, 4, fill=0, stroke=1)

    c.setFillColor(C_GRANATE)
    c.setFont("Body-Bold", 8)
    c.drawString(x + 3 * mm, y - 5 * mm, f"Diagrama de fase · {year}")
    c.setFillColor(C_MUTED)
    c.setFont("Body", 7)
    c.drawString(x + 3 * mm, y - 8.5 * mm, (phase or "")[:70])

    # nodes layout depending on era
    hubs = _hubs_for_year(year)
    cx = x + w / 2
    cy = y - h / 2 - 2 * mm
    # draw lines from Madrid center
    colors = [C_RAIL, C_METRO, C_SHIP, C_AIR, C_BUS, C_BRASS]
    import math

    n = len(hubs)
    radius = min(w, h) * 0.32
    positions = []
    for i, name in enumerate(hubs):
        ang = -math.pi / 2 + i * 2 * math.pi / max(n, 1)
        px = cx + radius * math.cos(ang)
        py = cy + radius * math.sin(ang) * 0.75
        positions.append((name, px, py, colors[i % len(colors)]))

    # madrid center
    c.setStrokeColor(C_GRANATE)
    c.setLineWidth(2.2)
    for name, px, py, col in positions:
        c.setStrokeColor(col)
        c.line(cx, cy, px, py)

    c.setFillColor(C_GRANATE)
    c.circle(cx, cy, 4.2, fill=1, stroke=0)
    c.setFillColor(C_CREAM)
    c.setFont("Body-Bold", 6)
    c.drawCentredString(cx, cy - 1.5, "MAD")

    for name, px, py, col in positions:
        c.setFillColor(col)
        c.circle(px, py, 3.2, fill=1, stroke=0)
        c.setFillColor(C_INK)
        c.setFont("Body", 5.5)
        label = name[:10]
        c.drawCentredString(px, py - 6.5, label)

    # legend strip
    c.setFillColor(C_SLATE)
    c.setFont("Body", 5.5)
    c.drawString(x + 3 * mm, y - h + 3 * mm, "Esquema relativo (no escala) · hub Madrid · radios = corredores activos de la década")
    return y - h - 2 * mm


def _hubs_for_year(year: int) -> list[str]:
    base = ["Sevilla", "Valencia", "Barcelona", "Bilbao", "Valladolid"]
    if year >= 1880:
        base.append("Lisboa")
    if year >= 1890:
        base.append("Alicante")
    if year >= 1910:
        base.append("La Coruña")
    if year >= 1933:
        base.append("Palma")
    if year >= 1955:
        base.append("Argel")
    if year >= 1992:
        base = ["Sevilla AV", "Valencia", "Barcelona AV", "Málaga", "Bilbao", "Lisboa", "Vigo"]
    return base[:8]
