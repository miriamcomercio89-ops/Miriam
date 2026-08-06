"""Reusable PDF drawing engine for the Knox Country clear guide."""

from __future__ import annotations

from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

from theme import (
    PAGE,
    PAGE_W,
    PAGE_H,
    MARGIN_L,
    MARGIN_R,
    MARGIN_T,
    MARGIN_B,
    CONTENT_W,
    INK,
    INK_SOFT,
    PAPER,
    PAPER_ALT,
    TEAL,
    TEAL_DARK,
    CORAL,
    SUN,
    SAFE,
    DANGER,
    INFO,
    WHITE,
    LINE,
    CHIP_BG,
    RISK_COLORS,
    register_fonts,
)


class GuidePDF:
    def __init__(self, path: str, volume_code: str, volume_title: str, subtitle: str = ""):
        register_fonts()
        self.path = path
        self.volume_code = volume_code
        self.volume_title = volume_title
        self.subtitle = subtitle
        self.c = canvas.Canvas(path, pagesize=PAGE)
        self.page_num = 0
        self.y = PAGE_H - MARGIN_T
        self._styles = {
            "body": ParagraphStyle(
                "body",
                fontName="Body",
                fontSize=9.5,
                leading=13,
                textColor=INK,
            ),
            "small": ParagraphStyle(
                "small",
                fontName="Body",
                fontSize=8.2,
                leading=11,
                textColor=INK_SOFT,
            ),
        }
        self._draw_page_chrome(first=True)

    # --- chrome ---
    def _draw_page_chrome(self, first: bool = False):
        self.page_num += 1
        c = self.c
        c.setFillColor(PAPER)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

        # top accent bar
        c.setFillColor(TEAL)
        c.rect(0, PAGE_H - 6 * mm, PAGE_W, 6 * mm, fill=1, stroke=0)
        c.setFillColor(CORAL)
        c.rect(0, PAGE_H - 6 * mm, 28 * mm, 6 * mm, fill=1, stroke=0)

        # footer
        c.setFillColor(PAPER_ALT)
        c.rect(0, 0, PAGE_W, 11 * mm, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.line(MARGIN_L, 11 * mm, PAGE_W - MARGIN_R, 11 * mm)

        c.setFillColor(INK_SOFT)
        c.setFont("Mono", 7.5)
        c.drawString(MARGIN_L, 4.5 * mm, f"{self.volume_code}  ·  B42.20  ·  Limpieza total Knox Country")
        c.drawRightString(PAGE_W - MARGIN_R, 4.5 * mm, f"{self.page_num:02d}")

        if first:
            self.y = PAGE_H - MARGIN_T - 2 * mm
        else:
            self.y = PAGE_H - MARGIN_T - 4 * mm

    def new_page(self):
        self.c.showPage()
        self._draw_page_chrome(first=False)

    def ensure(self, needed: float):
        if self.y - needed < MARGIN_B + 4 * mm:
            self.new_page()

    def save(self):
        self.c.save()

    # --- typography helpers ---
    def cover(self, series: str, bullets: list[str], meta: dict):
        c = self.c
        # hero panel
        c.setFillColor(INK)
        c.roundRect(MARGIN_L, PAGE_H - 118 * mm, CONTENT_W, 96 * mm, 6, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.rect(MARGIN_L, PAGE_H - 30 * mm, CONTENT_W, 8 * mm, fill=1, stroke=0)
        c.setFillColor(CORAL)
        c.rect(MARGIN_L, PAGE_H - 30 * mm, 18 * mm, 8 * mm, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("MonoBold", 9)
        c.drawString(MARGIN_L + 5 * mm, PAGE_H - 27.5 * mm, series.upper())

        c.setFont("DisplayBold", 26)
        text_obj = c.beginText(MARGIN_L + 7 * mm, PAGE_H - 48 * mm)
        for line in self._wrap(self.volume_title, 28):
            text_obj.textLine(line)
        c.drawText(text_obj)

        c.setFont("Body", 11)
        c.setFillColor(HexSoft(TEAL))
        c.drawString(MARGIN_L + 7 * mm, PAGE_H - 78 * mm, self.subtitle)

        # meta chips
        chip_y = PAGE_H - 100 * mm
        x = MARGIN_L + 7 * mm
        for key, val in meta.items():
            w = self._chip(x, chip_y, f"{key}: {val}", TEAL, WHITE)
            x += w + 3 * mm

        # bullets
        self.y = PAGE_H - 128 * mm
        self.h2("Qué contiene este volumen")
        for b in bullets:
            self.bullet(b)

        self.spacer(4 * mm)
        self.callout(
            "REGLA DE ORO",
            "No avances de manzana hasta que CADA edificio tenga marca de limpio "
            "(spray + nota en mapa + checkbox de esta guía). Migración activa: "
            "las zonas limpias se recontaminan si dejas huecos o ruidos lejanos.",
            CORAL,
        )

    def h1(self, text: str):
        self.ensure(18 * mm)
        c = self.c
        c.setFillColor(TEAL)
        c.rect(MARGIN_L, self.y - 1.5 * mm, 3 * mm, 8 * mm, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("DisplayBold", 16)
        c.drawString(MARGIN_L + 6 * mm, self.y, text)
        self.y -= 10 * mm

    def h2(self, text: str):
        self.ensure(14 * mm)
        c = self.c
        c.setFillColor(CORAL)
        c.circle(MARGIN_L + 2 * mm, self.y + 2 * mm, 2 * mm, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("BodyBold", 11.5)
        c.drawString(MARGIN_L + 7 * mm, self.y, text)
        self.y -= 7 * mm

    def h3(self, text: str):
        self.ensure(10 * mm)
        c = self.c
        c.setFillColor(TEAL_DARK)
        c.setFont("BodyBold", 10)
        c.drawString(MARGIN_L, self.y, text)
        self.y -= 5.5 * mm

    def p(self, text: str, style: str = "body"):
        style_obj = self._styles[style]
        para = Paragraph(text.replace("\n", "<br/>"), style_obj)
        w, h = para.wrap(CONTENT_W, 2000)
        self.ensure(h + 2 * mm)
        para.drawOn(self.c, MARGIN_L, self.y - h)
        self.y -= h + 2.5 * mm

    def bullet(self, text: str):
        self.ensure(6 * mm)
        c = self.c
        c.setFillColor(TEAL)
        c.circle(MARGIN_L + 2.2 * mm, self.y + 1.5 * mm, 1.3 * mm, fill=1, stroke=0)
        para = Paragraph(text, self._styles["body"])
        w, h = para.wrap(CONTENT_W - 7 * mm, 2000)
        self.ensure(h + 1 * mm)
        para.drawOn(c, MARGIN_L + 6 * mm, self.y - h + 3.5 * mm)
        self.y -= h + 1.8 * mm

    def spacer(self, h: float):
        self.y -= h

    def hr(self):
        self.ensure(4 * mm)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.7)
        self.c.line(MARGIN_L, self.y, PAGE_W - MARGIN_R, self.y)
        self.y -= 4 * mm

    def callout(self, title: str, body: str, color=TEAL):
        para = Paragraph(body, self._styles["body"])
        w, h = para.wrap(CONTENT_W - 10 * mm, 2000)
        box_h = h + 12 * mm
        self.ensure(box_h + 2 * mm)
        c = self.c
        c.setFillColor(color)
        c.roundRect(MARGIN_L, self.y - box_h, CONTENT_W, box_h, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("BodyBold", 8.5)
        c.drawString(MARGIN_L + 4 * mm, self.y - 5 * mm, title)
        # use dark text on light inset
        c.setFillColor(WHITE)
        inset = Paragraph(
            f'<font color="white">{body}</font>',
            ParagraphStyle("callout", fontName="Body", fontSize=9, leading=12, textColor=WHITE),
        )
        iw, ih = inset.wrap(CONTENT_W - 10 * mm, 2000)
        inset.drawOn(c, MARGIN_L + 4 * mm, self.y - 7 * mm - ih)
        self.y -= box_h + 3 * mm

    def info_box(self, title: str, lines: list[str]):
        self.ensure(20 * mm)
        c = self.c
        h = 8 * mm + len(lines) * 5 * mm
        self.ensure(h)
        c.setFillColor(CHIP_BG)
        c.setStrokeColor(TEAL)
        c.setLineWidth(1)
        c.roundRect(MARGIN_L, self.y - h, CONTENT_W, h, 3, fill=1, stroke=1)
        c.setFillColor(TEAL_DARK)
        c.setFont("BodyBold", 9)
        c.drawString(MARGIN_L + 3 * mm, self.y - 5 * mm, title)
        c.setFont("Body", 8.5)
        c.setFillColor(INK)
        yy = self.y - 10 * mm
        for line in lines:
            c.drawString(MARGIN_L + 3 * mm, yy, line)
            yy -= 5 * mm
        self.y -= h + 3 * mm

    def checkbox(self, text: str, indent: float = 0):
        self.ensure(6 * mm)
        c = self.c
        x = MARGIN_L + indent
        c.setStrokeColor(INK)
        c.setLineWidth(1)
        c.rect(x, self.y - 0.5 * mm, 3.2 * mm, 3.2 * mm, fill=0, stroke=1)
        c.setFillColor(INK)
        c.setFont("Body", 8.8)
        c.drawString(x + 5 * mm, self.y, text)
        self.y -= 5.2 * mm

    def checkbox_grid(self, items: list[str], cols: int = 2):
        col_w = CONTENT_W / cols
        # process in rows
        i = 0
        while i < len(items):
            self.ensure(6 * mm)
            row_y = self.y
            for col in range(cols):
                if i + col >= len(items):
                    break
                x = MARGIN_L + col * col_w
                c = self.c
                c.setStrokeColor(INK)
                c.setLineWidth(0.9)
                c.rect(x, row_y - 0.5 * mm, 3 * mm, 3 * mm, fill=0, stroke=1)
                c.setFillColor(INK)
                c.setFont("Body", 8)
                label = items[i + col]
                if len(label) > 42:
                    label = label[:40] + "…"
                c.drawString(x + 4.5 * mm, row_y, label)
            self.y -= 5.2 * mm
            i += cols

    def risk_badge(self, risk: str, x: float, y: float):
        color = RISK_COLORS.get(risk.lower(), INK_SOFT)
        c = self.c
        c.setFillColor(color)
        c.roundRect(x, y - 1 * mm, 18 * mm, 5 * mm, 2, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("MonoBold", 7)
        c.drawCentredString(x + 9 * mm, y, risk.upper())

    def building_card(self, b: dict):
        """Draw a detailed building clear card with checkboxes."""
        rooms = b.get("rooms", [])
        notes = b.get("notes", "")
        base_h = 28 * mm + len(rooms) * 4.6 * mm + (6 * mm if notes else 0)
        self.ensure(base_h)

        c = self.c
        y0 = self.y
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.roundRect(MARGIN_L, y0 - base_h, CONTENT_W, base_h, 3, fill=1, stroke=1)

        # left risk stripe
        risk = b.get("risk", "medio")
        c.setFillColor(RISK_COLORS.get(risk, SUN))
        c.rect(MARGIN_L, y0 - base_h, 2.2 * mm, base_h, fill=1, stroke=0)

        # header
        c.setFillColor(INK)
        c.setFont("MonoBold", 9)
        c.drawString(MARGIN_L + 5 * mm, y0 - 5 * mm, b["id"])
        c.setFont("BodyBold", 9.5)
        c.drawString(MARGIN_L + 32 * mm, y0 - 5 * mm, b["name"])
        self.risk_badge(risk, PAGE_W - MARGIN_R - 20 * mm, y0 - 5 * mm)

        c.setFillColor(INK_SOFT)
        c.setFont("Mono", 7.5)
        meta = f"Coords ~{b.get('coords', '—')}  ·  {b.get('type', 'Edificio')}  ·  {b.get('floors', '1')} planta(s)"
        if b.get("garage"):
            meta += "  ·  Garaje"
        if b.get("basement"):
            meta += "  ·  Sótano posible (B42)"
        c.drawString(MARGIN_L + 5 * mm, y0 - 10 * mm, meta)

        c.setFillColor(INK)
        c.setFont("Body", 8)
        order = b.get("order", "Puerta principal → planta baja → planta alta → garaje → sótano → patio → marcado")
        c.drawString(MARGIN_L + 5 * mm, y0 - 15 * mm, f"Orden: {order}")

        # checkboxes row
        yy = y0 - 21 * mm
        checks = [
            "Exterior 360°",
            "Interior limpio",
            "Loot priorizado",
            "Spray LIMPIO",
            "Nota mapa",
            "Cerrado/seguro",
        ]
        for i, ch in enumerate(checks):
            cx = MARGIN_L + 5 * mm + (i % 3) * 58 * mm
            if i == 3:
                yy = y0 - 26 * mm
            if i >= 3:
                cx = MARGIN_L + 5 * mm + (i - 3) * 58 * mm
            c.setStrokeColor(INK)
            c.rect(cx, yy - 0.3 * mm, 2.8 * mm, 2.8 * mm, fill=0, stroke=1)
            c.setFont("Body", 7.5)
            c.setFillColor(INK)
            c.drawString(cx + 4 * mm, yy, ch)

        yy = y0 - 32 * mm
        c.setFont("BodyBold", 8)
        c.setFillColor(TEAL_DARK)
        c.drawString(MARGIN_L + 5 * mm, yy, "Habitaciones / zonas:")
        yy -= 5 * mm
        for room in rooms:
            c.setStrokeColor(INK)
            c.rect(MARGIN_L + 5 * mm, yy - 0.2 * mm, 2.6 * mm, 2.6 * mm, fill=0, stroke=1)
            c.setFillColor(INK)
            c.setFont("Body", 8)
            c.drawString(MARGIN_L + 10 * mm, yy, room)
            yy -= 4.6 * mm

        if notes:
            c.setFillColor(CORAL)
            c.setFont("BodyItalic", 7.5)
            c.drawString(MARGIN_L + 5 * mm, y0 - base_h + 3 * mm, f"Nota: {notes}")

        self.y = y0 - base_h - 3 * mm

    def street_header(self, street: str, direction: str, risk: str, summary: str):
        self.ensure(22 * mm)
        c = self.c
        h = 18 * mm
        c.setFillColor(INK)
        c.roundRect(MARGIN_L, self.y - h, CONTENT_W, h, 3, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.rect(MARGIN_L, self.y - h, 4 * mm, h, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("DisplayBold", 12)
        c.drawString(MARGIN_L + 7 * mm, self.y - 6 * mm, street)
        c.setFont("Mono", 8)
        c.drawString(MARGIN_L + 7 * mm, self.y - 11 * mm, f"Dirección de ruta: {direction}")
        c.setFont("Body", 8)
        c.drawString(MARGIN_L + 7 * mm, self.y - 15.5 * mm, summary)
        self.risk_badge(risk, PAGE_W - MARGIN_R - 20 * mm, self.y - 7 * mm)
        self.y -= h + 4 * mm

    def sector_map_schematic(self, title: str, cells: list[list[str]], legend: str = ""):
        """Simple ASCII-like grid schematic of a neighborhood block."""
        rows = len(cells)
        cols = max(len(r) for r in cells) if cells else 1
        cell_w = min(28 * mm, CONTENT_W / cols)
        cell_h = 8 * mm
        h = 10 * mm + rows * cell_h + (6 * mm if legend else 0)
        self.ensure(h + 2 * mm)
        c = self.c
        c.setFillColor(PAPER_ALT)
        c.roundRect(MARGIN_L, self.y - h, CONTENT_W, h, 3, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("BodyBold", 8.5)
        c.drawString(MARGIN_L + 3 * mm, self.y - 5 * mm, title)
        for r, row in enumerate(cells):
            for col, label in enumerate(row):
                x = MARGIN_L + 3 * mm + col * cell_w
                y = self.y - 8 * mm - (r + 1) * cell_h
                c.setFillColor(WHITE)
                c.setStrokeColor(TEAL)
                c.setLineWidth(0.8)
                c.roundRect(x, y, cell_w - 1.5 * mm, cell_h - 1.2 * mm, 2, fill=1, stroke=1)
                c.setFillColor(INK)
                c.setFont("Mono", 6.5)
                c.drawCentredString(x + (cell_w - 1.5 * mm) / 2, y + 2.8 * mm, label)
        if legend:
            c.setFillColor(INK_SOFT)
            c.setFont("Body", 7.5)
            c.drawString(MARGIN_L + 3 * mm, self.y - h + 2 * mm, legend)
        self.y -= h + 3 * mm

    def step(self, n: int, title: str, body: str):
        self.ensure(16 * mm)
        c = self.c
        c.setFillColor(CORAL)
        c.circle(MARGIN_L + 4 * mm, self.y - 1 * mm, 4 * mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("MonoBold", 9)
        c.drawCentredString(MARGIN_L + 4 * mm, self.y - 2.2 * mm, str(n))
        c.setFillColor(INK)
        c.setFont("BodyBold", 10)
        c.drawString(MARGIN_L + 11 * mm, self.y - 1 * mm, title)
        self.y -= 6 * mm
        self.p(body)

    def table(self, headers: list[str], rows: list[list[str]], col_widths: list[float] | None = None):
        cols = len(headers)
        if col_widths is None:
            col_widths = [CONTENT_W / cols] * cols
        row_h = 6.2 * mm
        self.ensure(row_h * (len(rows) + 1) + 2 * mm)
        c = self.c
        x0 = MARGIN_L
        # header
        c.setFillColor(INK)
        c.rect(x0, self.y - row_h, CONTENT_W, row_h, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("BodyBold", 7.5)
        x = x0
        for i, h in enumerate(headers):
            c.drawString(x + 1.5 * mm, self.y - 4.2 * mm, h)
            x += col_widths[i]
        self.y -= row_h
        for ri, row in enumerate(rows):
            self.ensure(row_h)
            c.setFillColor(PAPER_ALT if ri % 2 == 0 else WHITE)
            c.rect(x0, self.y - row_h, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColor(INK)
            c.setFont("Body", 7.3)
            x = x0
            for i, cell in enumerate(row):
                c.drawString(x + 1.5 * mm, self.y - 4.2 * mm, str(cell)[:48])
                x += col_widths[i]
            self.y -= row_h
        self.y -= 3 * mm

    def _chip(self, x, y, text, bg, fg):
        c = self.c
        c.setFont("MonoBold", 7)
        w = c.stringWidth(text, "MonoBold", 7) + 6 * mm
        c.setFillColor(bg)
        c.roundRect(x, y, w, 5.5 * mm, 2, fill=1, stroke=0)
        c.setFillColor(fg)
        c.drawString(x + 3 * mm, y + 1.5 * mm, text)
        return w

    def _wrap(self, text: str, max_chars: int) -> list[str]:
        words = text.split()
        lines, cur = [], ""
        for w in words:
            trial = (cur + " " + w).strip()
            if len(trial) <= max_chars:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines or [text]


def HexSoft(color):
    """Return a lightened version-ish by mixing toward white conceptually — just return TEAL for cover."""
    return TEAL
