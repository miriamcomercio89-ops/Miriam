"""Utilidades de dibujo: rejilla 1×1 m, habitaciones, norte y leyendas."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, List, Optional, Sequence, Tuple

from reportlab.lib.colors import Color, black, white
from reportlab.pdfgen.canvas import Canvas

from .theme import GOLD, GOLD_SOFT, INK, MUTED, NAVY, USE_COLORS, USE_LABELS, WHITE


@dataclass
class Room:
    x: float
    y: float
    w: float
    h: float
    name: str
    use: str
    code: str = ""
    note: str = ""
    show_dims: bool = True

    @property
    def area(self) -> float:
        return self.w * self.h

    @property
    def label(self) -> str:
        if self.code:
            return f"{self.code}\n{self.name}\n{self.w:.0f}×{self.h:.0f} m · {self.area:.0f} m²"
        return f"{self.name}\n{self.w:.0f}×{self.h:.0f} m · {self.area:.0f} m²"


@dataclass
class FloorPlan:
    name: str
    level: str
    rooms: List[Room] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)
    building_bbox: Optional[Tuple[float, float, float, float]] = None  # x,y,w,h


def draw_north_arrow(c: Canvas, x: float, y: float, size: float = 28) -> None:
    c.saveState()
    c.setStrokeColor(NAVY)
    c.setFillColor(NAVY)
    c.setLineWidth(1.2)
    c.line(x, y - size * 0.55, x, y + size * 0.35)
    path = c.beginPath()
    path.moveTo(x, y + size * 0.55)
    path.lineTo(x - size * 0.18, y + size * 0.18)
    path.lineTo(x + size * 0.18, y + size * 0.18)
    path.close()
    c.drawPath(path, fill=1, stroke=0)
    c.setFont("Orbis-sans_bold", 8)
    c.drawCentredString(x, y + size * 0.62, "N")
    c.restoreState()


def draw_scale_bar(c: Canvas, x: float, y: float, meters: int, scale_pt_per_m: float) -> None:
    c.saveState()
    width = meters * scale_pt_per_m
    c.setStrokeColor(NAVY)
    c.setFillColor(NAVY)
    c.setLineWidth(1)
    c.rect(x, y, width, 4, stroke=1, fill=0)
    mid = meters // 2
    c.setFillColor(NAVY)
    c.rect(x, y, mid * scale_pt_per_m, 4, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Orbis-sans", 7)
    c.drawString(x, y - 10, "0")
    c.drawCentredString(x + mid * scale_pt_per_m, y - 10, str(mid))
    c.drawRightString(x + width, y - 10, f"{meters} m")
    c.setFont("Orbis-sans", 6.5)
    c.setFillColor(MUTED)
    c.drawString(x, y + 8, "Escala gráfica · casilla = 1×1 m")
    c.restoreState()


def draw_grid(
    c: Canvas,
    origin_x: float,
    origin_y: float,
    width_m: float,
    height_m: float,
    scale: float,
    major_every: int = 10,
) -> None:
    c.saveState()
    # fondo
    c.setFillColor(WHITE)
    c.rect(origin_x, origin_y, width_m * scale, height_m * scale, stroke=0, fill=1)

    # rejilla fina
    c.setStrokeColor(Color(0.85, 0.83, 0.78))
    c.setLineWidth(0.25)
    for i in range(int(width_m) + 1):
        x = origin_x + i * scale
        c.line(x, origin_y, x, origin_y + height_m * scale)
    for j in range(int(height_m) + 1):
        y = origin_y + j * scale
        c.line(origin_x, y, origin_x + width_m * scale, y)

    # rejilla mayor
    c.setStrokeColor(Color(0.72, 0.70, 0.64))
    c.setLineWidth(0.7)
    for i in range(0, int(width_m) + 1, major_every):
        x = origin_x + i * scale
        c.line(x, origin_y, x, origin_y + height_m * scale)
    for j in range(0, int(height_m) + 1, major_every):
        y = origin_y + j * scale
        c.line(origin_x, y, origin_x + width_m * scale, y)

    # marco
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.4)
    c.rect(origin_x, origin_y, width_m * scale, height_m * scale, stroke=1, fill=0)

    # cotas perimetrales
    c.setFillColor(MUTED)
    c.setFont("Orbis-sans", 6)
    for i in range(0, int(width_m) + 1, major_every):
        c.drawCentredString(origin_x + i * scale, origin_y - 9, str(i))
    for j in range(0, int(height_m) + 1, major_every):
        c.drawRightString(origin_x - 4, origin_y + j * scale - 2, str(j))
    c.restoreState()


def draw_rooms(
    c: Canvas,
    rooms: Sequence[Room],
    origin_x: float,
    origin_y: float,
    scale: float,
    map_h: float,
    font_name: str = "Orbis-sans",
    min_label_area: float = 8.0,
) -> None:
    """Dibuja habitaciones. Coordenadas en metros con origen SW (abajo-izquierda), Y crece al norte."""
    c.saveState()
    for room in rooms:
        color = USE_COLORS.get(room.use, USE_COLORS["vacio"])
        px = origin_x + room.x * scale
        py = origin_y + room.y * scale
        pw = room.w * scale
        ph = room.h * scale

        c.setFillColor(color)
        c.setStrokeColor(NAVY)
        c.setLineWidth(0.7)
        c.rect(px, py, pw, ph, stroke=1, fill=1)

        # etiqueta
        if room.area >= min_label_area and min(pw, ph) >= 14:
            c.setFillColor(INK)
            size = 6.2 if room.area < 20 else 7.0
            if min(pw, ph) < 22:
                size = 5.5
            c.setFont(font_name, size)
            text = room.name if room.area < 16 else room.label
            lines = text.split("\n")
            total_h = len(lines) * (size + 1.2)
            ty = py + ph / 2 + total_h / 2 - size
            for line in lines:
                c.drawCentredString(px + pw / 2, ty, line[:42])
                ty -= size + 1.2
        elif room.code:
            c.setFillColor(INK)
            c.setFont("Orbis-sans_bold", 6)
            c.drawCentredString(px + pw / 2, py + ph / 2 - 2, room.code)
    c.restoreState()


def draw_use_legend(
    c: Canvas,
    x: float,
    y: float,
    uses: Iterable[str],
    title: str = "Leyenda de usos",
) -> float:
    c.saveState()
    c.setFillColor(NAVY)
    c.setFont("Orbis-sans_bold", 8)
    c.drawString(x, y, title)
    yy = y - 14
    for use in uses:
        c.setFillColor(USE_COLORS.get(use, WHITE))
        c.setStrokeColor(NAVY)
        c.setLineWidth(0.6)
        c.rect(x, yy - 2, 10, 10, stroke=1, fill=1)
        c.setFillColor(INK)
        c.setFont("Orbis-sans", 7)
        c.drawString(x + 14, yy, USE_LABELS.get(use, use))
        yy -= 13
    c.restoreState()
    return yy


def draw_section_header(c: Canvas, width: float, height: float, section: str, title: str, fonts: dict) -> None:
    c.setFillColor(NAVY)
    c.rect(0, height - 42, width, 42, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(0, height - 44, width, 2.2, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont(fonts["sans"], 8)
    c.drawString(36, height - 18, section.upper())
    c.setFont(fonts["serif"], 16)
    c.drawString(36, height - 34, title)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(width - 120, height - 28, width - 36, height - 28)
    c.setFont(fonts["sans"], 7)
    c.setFillColor(GOLD_SOFT)
    c.drawRightString(width - 36, height - 22, "ORBIS · Hometopia")
