# -*- coding: utf-8 -*-
"""Generador de PDFs EMT Málaga – CTS 2026 (A4 vertical, estilo moderno)."""

from __future__ import annotations

import os
import sys
from collections import defaultdict
from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, Flowable, HRFlowable, ListFlowable, ListItem,
)
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
PDF_DIR = ROOT / "pdf"
sys.path.insert(0, str(ROOT))

from data import (
    STOPS, VEHICLES, DEPOTS, LINES, ZONES, FARES, BRAND, lines_by_mode, stop_name,
    CALENDAR, EVENT_REINFORCEMENTS, LINE_VALIDATION, MAP_XY, DISTRICTS, VALIDATION_NOTES,
    day_templates, segment_times_min, apply_calendar_factor,
)


PAGE_W, PAGE_H = A4
MARGIN = 14 * mm


def hex_color(h: str) -> HexColor:
    return HexColor(h)


def register_fonts():
    candidates = [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
        ("/usr/share/fonts/truetype/freefont/FreeSans.ttf", "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"),
    ]
    for reg, bold in candidates:
        if os.path.exists(reg) and os.path.exists(bold):
            pdfmetrics.registerFont(TTFont("EMT", reg))
            pdfmetrics.registerFont(TTFont("EMT-Bold", bold))
            return "EMT", "EMT-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_B = register_fonts()


def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name="CoverTitle", fontName=FONT_B, fontSize=28, leading=32,
                         textColor=hex_color(BRAND["primary"]), alignment=TA_LEFT, spaceAfter=6))
    s.add(ParagraphStyle(name="CoverSub", fontName=FONT, fontSize=12, leading=16,
                         textColor=hex_color(BRAND["muted"]), spaceAfter=4))
    s.add(ParagraphStyle(name="H1", fontName=FONT_B, fontSize=16, leading=20,
                         textColor=hex_color(BRAND["primary"]), spaceBefore=8, spaceAfter=6))
    s.add(ParagraphStyle(name="H2", fontName=FONT_B, fontSize=12, leading=15,
                         textColor=hex_color(BRAND["ink"]), spaceBefore=6, spaceAfter=4))
    s.add(ParagraphStyle(name="Body", fontName=FONT, fontSize=9, leading=12,
                         textColor=hex_color(BRAND["ink"]), spaceAfter=3))
    s.add(ParagraphStyle(name="Small", fontName=FONT, fontSize=8, leading=10,
                         textColor=hex_color(BRAND["muted"])))
    s.add(ParagraphStyle(name="Tiny", fontName=FONT, fontSize=7, leading=9,
                         textColor=hex_color(BRAND["muted"])))
    s.add(ParagraphStyle(name="Stop", fontName=FONT, fontSize=8.5, leading=11,
                         textColor=hex_color(BRAND["ink"])))
    s.add(ParagraphStyle(name="StopHub", fontName=FONT_B, fontSize=8.5, leading=11,
                         textColor=hex_color(BRAND["primary"])))
    s.add(ParagraphStyle(name="CodeBig", fontName=FONT_B, fontSize=36, leading=40,
                         textColor=white, alignment=TA_CENTER))
    s.add(ParagraphStyle(name="White", fontName=FONT, fontSize=9, leading=12, textColor=white))
    s.add(ParagraphStyle(name="WhiteB", fontName=FONT_B, fontSize=11, leading=14, textColor=white))
    s.add(ParagraphStyle(name="Center", fontName=FONT, fontSize=9, leading=12, alignment=TA_CENTER))
    return s


S = styles()


ICON_LABELS = {
    "correspondencia": "↔ corr.",
    "accesible": "♿",
    "cultura": "cultura",
    "universidad": "univ.",
    "turismo": "turismo",
    "parque": "parque",
    "deporte": "deporte",
    "hospital": "hospital",
    "deposito": "depósito",
}


def correspondences(stop_id: str, exclude_line: str | None = None) -> list[str]:
    codes = []
    for lid, line in LINES.items():
        if exclude_line and lid == exclude_line:
            continue
        if stop_id in line["stops"]:
            codes.append(line["code"])
    # unique preserve order
    seen = set()
    out = []
    for c in codes:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return out


class ColorBar(Flowable):
    def __init__(self, color: str, width=None, height=8):
        Flowable.__init__(self)
        self.color = hex_color(color)
        self._width = width
        self.height = height

    def wrap(self, availWidth, availHeight):
        self.width = self._width or availWidth
        return self.width, self.height

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.roundRect(0, 0, self.width, self.height, 3, fill=1, stroke=0)


class LineBadge(Flowable):
    def __init__(self, code: str, color: str, text_color: str = "#FFFFFF", w=28, h=18):
        Flowable.__init__(self)
        self.code = code
        self.color = hex_color(color)
        self.text_color = hex_color(text_color)
        self.w = w
        self.h = h

    def wrap(self, availWidth, availHeight):
        return self.w, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.roundRect(0, 0, self.w, self.h, 3, fill=1, stroke=0)
        c.setFillColor(self.text_color)
        c.setFont(FONT_B, 9 if len(self.code) <= 2 else 7)
        c.drawCentredString(self.w / 2, 5, self.code)


def footer(canv: canvas.Canvas, doc):
    canv.saveState()
    canv.setFillColor(hex_color(BRAND["primary"]))
    canv.rect(0, 0, PAGE_W, 10 * mm, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont(FONT, 7)
    canv.drawString(MARGIN, 4 * mm, f"{BRAND['operator']}  ·  {BRAND['system']}")
    canv.drawRightString(PAGE_W - MARGIN, 4 * mm, f"pág. {doc.page}")
    canv.restoreState()


def header_band(canv: canvas.Canvas, title: str):
    canv.saveState()
    canv.setFillColor(hex_color(BRAND["primary"]))
    canv.rect(0, PAGE_H - 16 * mm, PAGE_W, 16 * mm, fill=1, stroke=0)
    canv.setFillColor(hex_color(BRAND["secondary"]))
    canv.rect(0, PAGE_H - 17.5 * mm, PAGE_W, 1.5 * mm, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont(FONT_B, 11)
    canv.drawString(MARGIN, PAGE_H - 10 * mm, title)
    canv.setFont(FONT, 8)
    canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 10 * mm, BRAND["operator"])
    canv.restoreState()


def make_doc(path: Path, title: str, top_margin=22 * mm):
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=top_margin,
        bottomMargin=16 * mm,
        title=title,
        author=BRAND["operator"],
    )
    return doc


def on_page(title: str):
    def _fn(canv, doc):
        header_band(canv, title)
        footer(canv, doc)
    return _fn


# -------------------- 01 GUÍA --------------------
def build_guia():
    path = PDF_DIR / "01_guia_sistema.pdf"
    doc = make_doc(path, "Guía del sistema")
    story = []

    story.append(Paragraph(BRAND["operator"], S["CoverTitle"]))
    story.append(Paragraph(BRAND["system"], S["CoverSub"]))
    story.append(Paragraph(
        "Ambientación: Málaga inventada sobre el mapa base de City Transport Simulator 2026 "
        "(+ DLC Depot / Southern Route). Solo tranvía y autobús. Red diurna + red nocturna.",
        S["Body"]))
    story.append(ColorBar(BRAND["accent"], height=4))
    story.append(Spacer(1, 8))

    story.append(Paragraph("1. Identidad visual", S["H1"]))
    story.append(Paragraph(
        f"Primario <font color='{BRAND['primary']}'><b>■</b></font> {BRAND['primary']} · "
        f"Secundario <font color='{BRAND['secondary']}'><b>■</b></font> {BRAND['secondary']} · "
        f"Acento <font color='{BRAND['accent']}'><b>■</b></font> {BRAND['accent']}. "
        "Cada línea tiene color propio (ver fichas).",
        S["Body"]))

    story.append(Paragraph("2. Zonas tarifarias", S["H1"]))
    zdata = [[Paragraph("<b>Zona</b>", S["Small"]), Paragraph("<b>Nombre</b>", S["Small"]),
              Paragraph("<b>Notas</b>", S["Small"])]]
    for zid, z in ZONES.items():
        zdata.append([
            Paragraph(f"<font color='{z['color']}'><b>{zid}</b></font>", S["Body"]),
            Paragraph(z["name"], S["Body"]),
            Paragraph(z["fare_note"], S["Small"]),
        ])
    t = Table(zdata, colWidths=[20 * mm, 55 * mm, 95 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), FONT_B),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [hex_color("#FFFFFF"), hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("BOX", (0, 0), (-1, -1), 0.4, hex_color(BRAND["primary"])),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3. Tarifas (ficción EMT)", S["H1"]))
    fdata = [[Paragraph("<b>Producto</b>", S["Small"]), Paragraph("<b>Precio</b>", S["Small"])]]
    for f in FARES.values():
        fdata.append([Paragraph(f["name"], S["Body"]), Paragraph(f["price"], S["Body"])])
    ft = Table(fdata, colWidths=[120 * mm, 50 * mm])
    ft.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["secondary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#F0FAFA")]),
        ("BOX", (0, 0), (-1, -1), 0.4, hex_color(BRAND["secondary"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(ft)

    story.append(Paragraph("4. Depósitos y cocheras", S["H1"]))
    for d in DEPOTS.values():
        story.append(Paragraph(
            f"<b>{d['name']}</b> — parada: {stop_name(d['stop'])} · modos: {', '.join(d['modes'])}. {d['note']}",
            S["Body"]))

    story.append(Paragraph("5. Leyenda de símbolos", S["H1"]))
    for k, v in ICON_LABELS.items():
        story.append(Paragraph(f"• <b>{v}</b> — {k}", S["Body"]))
    story.append(Paragraph("• <b>Hub</b> — intercambiador principal", S["Body"]))
    story.append(Paragraph("• Códigos: T… = tranvía · 1–20 / C1 / E1 = bus diurno · N… = nocturno", S["Body"]))

    story.append(Paragraph("6. Inventario de la red", S["H1"]))
    n_tram = len(lines_by_mode("tram"))
    n_bus = len(lines_by_mode("bus"))
    n_night = len(lines_by_mode("night"))
    story.append(Paragraph(
        f"<b>{n_tram}</b> líneas de tranvía · <b>{n_bus}</b> de autobús diurno · "
        f"<b>{n_night}</b> nocturnas · <b>{len(STOPS)}</b> paradas · "
        f"<b>{len(VEHICLES)}</b> modelos de vehículo CTS.",
        S["Body"]))

    story.append(Paragraph("7. Documentos de este pack", S["H1"]))
    docs = [
        "01_guia_sistema.pdf — esta guía",
        "02_paradas.pdf — listado maestro de paradas (100 % español)",
        "03_plano_diurno.pdf — esquema de red diurna (mapa Netz)",
        "03b_planos_distrito.pdf — planos por distrito",
        "04_plano_nocturno.pdf — esquema de red nocturna",
        "05_fichas_tranvia.pdf — una página por línea T / TP",
        "06_fichas_autobus.pdf — buses + alimentadoras A1–A4",
        "07_fichas_nocturno.pdf — una página por línea N",
        "08_flota.pdf — catálogo de vehículos y asignación",
        "09_checklist_cts.pdf — checklist + validación jugable",
        "10_calendario_operativo.pdf — verano / feria / navidad",
        "11_refuerzos_estadio.pdf — plan R-EST",
        "12_horarios_line_editor.pdf — plantillas de intervalo CTS",
    ]
    for d in docs:
        story.append(Paragraph(f"• {d}", S["Body"]))

    story.append(Spacer(1, 10))
    story.append(Paragraph("© Pack de diseño para uso en CTS 2026 · Ficción / no oficial EMT", S["Tiny"]))

    doc.build(story, onFirstPage=on_page("Guía del sistema"), onLaterPages=on_page("Guía del sistema"))
    return path


# -------------------- 02 PARADAS --------------------
def build_paradas():
    path = PDF_DIR / "02_paradas.pdf"
    doc = make_doc(path, "Paradas")
    story = []
    story.append(Paragraph("Listado maestro de paradas", S["H1"]))
    story.append(Paragraph(
        "Nombres inventados en español (ambientación Málaga). La columna «ancla» es solo referencia "
        "interna de topología del mapa CTS; no hace falta usarla en el juego.",
        S["Body"]))

    # group by district
    by_dist = defaultdict(list)
    for sid, st in STOPS.items():
        by_dist[st["district"]].append((sid, st))

    for dist in sorted(by_dist.keys()):
        story.append(Paragraph(dist, S["H2"]))
        rows = [[
            Paragraph("<b>Nombre</b>", S["Tiny"]),
            Paragraph("<b>Z</b>", S["Tiny"]),
            Paragraph("<b>T/B</b>", S["Tiny"]),
            Paragraph("<b>Hub</b>", S["Tiny"]),
            Paragraph("<b>Iconos</b>", S["Tiny"]),
            Paragraph("<b>Líneas</b>", S["Tiny"]),
        ]]
        for sid, st in sorted(by_dist[dist], key=lambda x: x[1]["name"]):
            icons = " ".join(ICON_LABELS.get(i, i) for i in st["icons"]) or "—"
            modes = ("T" if st["tram"] else "") + ("B" if st["bus"] else "")
            corr = ", ".join(correspondences(sid)[:12])
            if len(correspondences(sid)) > 12:
                corr += "…"
            rows.append([
                Paragraph(st["name"], S["Tiny"]),
                Paragraph(st["zone"], S["Tiny"]),
                Paragraph(modes, S["Tiny"]),
                Paragraph("sí" if st["hub"] else "—", S["Tiny"]),
                Paragraph(icons, S["Tiny"]),
                Paragraph(corr, S["Tiny"]),
            ])
        tbl = Table(rows, colWidths=[48 * mm, 8 * mm, 10 * mm, 10 * mm, 28 * mm, 66 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
            ("FONTSIZE", (0, 0), (-1, -1), 7),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 4))

    doc.build(story, onFirstPage=on_page("Paradas"), onLaterPages=on_page("Paradas"))
    return path


# -------------------- PLANOS ESQUEMA --------------------

class NetworkSchematic(Flowable):
    """Esquema alineado a coordenadas del mapa Netz CTS 2026."""

    def __init__(self, mode_filter: set[str], height=165 * mm, district_filter=None):
        Flowable.__init__(self)
        self.mode_filter = mode_filter
        self.height = height
        self.district_filter = district_filter

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        return self.width, self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(hex_color("#0B1F33"))
        c.roundRect(0, 0, w, h, 6, fill=1, stroke=0)
        # district wash
        for dname, d in DISTRICTS.items():
            if self.district_filter and dname not in self.district_filter:
                continue
            x0, y0, x1, y1 = d["box"]
            col = hex_color(d["color"])
            c.setFillColor(Color(col.red, col.green, col.blue, alpha=0.18))
            c.rect(x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h, fill=1, stroke=0)
            c.setFillColor(hex_color("#D6E4F0"))
            c.setFont(FONT_B, 7)
            c.drawString(x0 * w + 4, y1 * h - 10, dname)

        lines = [L for L in LINES.values() if L["mode"] in self.mode_filter]
        for L in lines:
            pts = []
            for sid in L["stops"]:
                if sid in MAP_XY:
                    if self.district_filter:
                        dist = STOPS[sid]["district"]
                        if dist not in self.district_filter and not STOPS[sid].get("hub"):
                            # still draw if hub or keep continuity
                            pass
                    pts.append(MAP_XY[sid])
            if len(pts) < 2:
                continue
            c.setStrokeColor(hex_color(L["color"]))
            c.setLineWidth(1.8)
            c.setLineCap(1)
            path = c.beginPath()
            path.moveTo(pts[0][0] * w, pts[0][1] * h)
            for pt in pts[1:]:
                path.lineTo(pt[0] * w, pt[1] * h)
            c.drawPath(path, stroke=1, fill=0)

        # stops
        drawn = set()
        for L in lines:
            for sid in L["stops"]:
                if sid in drawn or sid not in MAP_XY:
                    continue
                drawn.add(sid)
                x, y = MAP_XY[sid]
                px, py = x * w, y * h
                hub = STOPS[sid].get("hub")
                c.setFillColor(white)
                c.setStrokeColor(hex_color("#F5A623" if hub else "#FFFFFF"))
                c.setLineWidth(1)
                if hub:
                    c.rect(px - 3.5, py - 3.5, 7, 7, fill=1, stroke=1)
                else:
                    c.circle(px, py, 2.2, fill=1, stroke=1)

        # legend codes
        c.setFont(FONT_B, 6)
        x0, y0 = 6, h - 12
        for L in lines:
            c.setFillColor(hex_color(L["color"]))
            c.roundRect(x0, y0 - 2, 14, 9, 2, fill=1, stroke=0)
            c.setFillColor(hex_color(L.get("text_color", "#FFFFFF")))
            c.drawCentredString(x0 + 7, y0, L["code"])
            x0 += 16
            if x0 > w - 18:
                x0 = 6
                y0 -= 12


def build_plano(mode_filter: set[str], filename: str, title: str):
    path = PDF_DIR / filename
    doc = make_doc(path, title)
    story = []
    story.append(Paragraph(title, S["H1"]))
    story.append(Paragraph(
        "Esquema conceptual (no escala geográfica). Los trazados unen hubs del sistema; "
        "detalle de paradas en las fichas de línea.",
        S["Body"]))
    story.append(Spacer(1, 4))
    story.append(NetworkSchematic(mode_filter))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Índice de líneas", S["H2"]))
    rows = [[Paragraph("<b>Cód.</b>", S["Tiny"]), Paragraph("<b>Nombre</b>", S["Tiny"]),
             Paragraph("<b>Tipo</b>", S["Tiny"]), Paragraph("<b>Cabeceras</b>", S["Tiny"])]]
    for L in LINES.values():
        if L["mode"] not in mode_filter:
            continue
        rows.append([
            LineBadge(L["code"], L["color"], L.get("text_color", "#FFFFFF"), 22, 12),
            Paragraph(L["name"], S["Tiny"]),
            Paragraph(L["kind"], S["Tiny"]),
            Paragraph(f"{stop_name(L['from'])} → {stop_name(L['to'])}", S["Tiny"]),
        ])
    tbl = Table(rows, colWidths=[18 * mm, 48 * mm, 22 * mm, 82 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
    ]))
    story.append(tbl)
    doc.build(story, onFirstPage=on_page(title), onLaterPages=on_page(title))
    return path


# -------------------- FICHAS --------------------
def build_line_sheet(L: dict) -> list:
    story = []
    # header block
    header_data = [[
        Paragraph(f"<font color='{L.get('text_color', '#FFFFFF')}' size='28'><b>{L['code']}</b></font>", S["Center"]),
        Paragraph(
            f"<font color='{L.get('text_color', '#FFFFFF')}'><b>{L['name']}</b><br/>"
            f"{stop_name(L['from'])}  →  {stop_name(L['to'])}<br/>"
            f"{L['mode'].upper()} · {L['kind']} · color {L['color']}</font>",
            S["White"]),
    ]]
    ht = Table(header_data, colWidths=[32 * mm, 138 * mm])
    ht.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), hex_color(L["color"])),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    story.append(ht)
    story.append(Spacer(1, 6))

    # meta grid
    veh_names = ", ".join(VEHICLES[v]["name"] for v in L["vehicles"])
    cap = max(VEHICLES[v]["capacity"] for v in L["vehicles"])
    depot = DEPOTS[L["depot"]]["name"]
    meta = [
        [Paragraph("<b>Servicio</b>", S["Tiny"]), Paragraph(L["service"], S["Tiny"]),
         Paragraph("<b>Distancia</b>", S["Tiny"]), Paragraph(f"{L['distance_km']} km", S["Tiny"])],
        [Paragraph("<b>Tiempo</b>", S["Tiny"]), Paragraph(f"{L['runtime_min']} min", S["Tiny"]),
         Paragraph("<b>Demanda</b>", S["Tiny"]), Paragraph(L["demand"], S["Tiny"])],
        [Paragraph("<b>Frec. punta</b>", S["Tiny"]), Paragraph(f"cada {L['headway_peak_min']} min", S["Tiny"]),
         Paragraph("<b>Valle</b>", S["Tiny"]), Paragraph(f"cada {L['headway_off_min']} min", S["Tiny"])],
        [Paragraph("<b>Noche/tarde</b>", S["Tiny"]), Paragraph(
            f"cada {L['headway_eve_min']} min" if L["headway_eve_min"] else "—", S["Tiny"]),
         Paragraph("<b>Ocupación obj.</b>", S["Tiny"]), Paragraph(L["target_load"], S["Tiny"])],
        [Paragraph("<b>Flota</b>", S["Tiny"]), Paragraph(f"{L['fleet_units']} coches", S["Tiny"]),
         Paragraph("<b>Cap. máx.</b>", S["Tiny"]), Paragraph(f"{cap} pax", S["Tiny"])],
        [Paragraph("<b>Depósito</b>", S["Tiny"]), Paragraph(depot, S["Tiny"]),
         Paragraph("<b>Paradas</b>", S["Tiny"]), Paragraph(str(len(L["stops"])), S["Tiny"])],
    ]
    mt = Table(meta, colWidths=[28 * mm, 57 * mm, 28 * mm, 57 * mm])
    mt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), hex_color("#F0F4F8")),
        ("BOX", (0, 0), (-1, -1), 0.4, hex_color(L["color"])),
        ("INNERGRID", (0, 0), (-1, -1), 0.2, hex_color("#D0D7DE")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(mt)
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Vehículos asignados:</b> {veh_names}", S["Body"]))
    story.append(Paragraph(L["notes"], S["Small"]))

    # Zonas del recorrido (mejora 11)
    zones_on_line = []
    for sid in L["stops"]:
        z = STOPS[sid]["zone"]
        if z not in zones_on_line:
            zones_on_line.append(z)
    zbits = []
    for z in zones_on_line:
        zbits.append(f"<font color='{ZONES[z]['color']}'><b>■ Zona {z}</b></font> {ZONES[z]['name']}")
    story.append(Paragraph("<b>Zonas tarifarias:</b> " + "  ·  ".join(zbits), S["Body"]))

    # Validación mapa Netz (mejora 1)
    playable, valnote = LINE_VALIDATION.get(L["code"], ("ok", "Alineada a hubs del mapa; verificar vías en CTS."))
    badge = "JUGABLE" if playable == "ok" else "REVISAR EN CTS"
    bcol = BRAND["secondary"] if playable == "ok" else BRAND["accent"]
    story.append(Paragraph(f"<font color='{bcol}'><b>[{badge}]</b></font> {valnote}", S["Small"]))
    story.append(Spacer(1, 3))
    story.append(ColorBar(L["color"], height=3))
    story.append(Spacer(1, 3))

    story.append(Paragraph("Recorrido, zonas, tiempos y correspondencias", S["H2"]))
    segs = segment_times_min(L["runtime_min"], len(L["stops"]))
    rows = [[
        Paragraph("<b>#</b>", S["Tiny"]),
        Paragraph("<b>Parada</b>", S["Tiny"]),
        Paragraph("<b>Z</b>", S["Tiny"]),
        Paragraph("<b>+min</b>", S["Tiny"]),
        Paragraph("<b>Correspondencias</b>", S["Tiny"]),
    ]]
    for i, sid in enumerate(L["stops"], 1):
        st = STOPS[sid]
        style = S["StopHub"] if st["hub"] else S["Stop"]
        corr = [c for c in correspondences(sid) if c != L["code"]]
        corr_txt = ", ".join(corr[:8]) + ("…" if len(corr) > 8 else "")
        dmin = "—" if i == 1 else str(segs[i - 2])
        # zone colored
        zcol = ZONES[st["zone"]]["color"]
        rows.append([
            Paragraph(str(i), S["Tiny"]),
            Paragraph(st["name"], style),
            Paragraph(f"<font color='{zcol}'><b>{st['zone']}</b></font>", S["Tiny"]),
            Paragraph(dmin, S["Tiny"]),
            Paragraph(corr_txt or "—", S["Tiny"]),
        ])

    ct = Table(rows, colWidths=[7 * mm, 52 * mm, 8 * mm, 10 * mm, 93 * mm])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(L["color"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), hex_color(L.get("text_color", "#FFFFFF"))),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#F7F4EF")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 1.2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.2),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(L["color"])),
    ]))
    story.append(ct)

    story.append(Spacer(1, 3))
    story.append(Paragraph(
        f"<b>Checklist CTS:</b> línea «{L['code']}» · HEX {L['color']} · "
        f"{stop_name(L['from'])} / {stop_name(L['to'])} · "
        f"{', '.join(L['vehicles'])} · punta {L['headway_peak_min']} min · {depot}.",
        S["Tiny"]))
    story.append(PageBreak())
    return story


def build_fichas(mode: str, filename: str, title: str):
    path = PDF_DIR / filename
    doc = make_doc(path, title, top_margin=20 * mm)
    story = []
    for lid, L in LINES.items():
        if L["mode"] == mode:
            story.extend(build_line_sheet(L))
    if story and isinstance(story[-1], PageBreak):
        story.pop()
    doc.build(story, onFirstPage=on_page(title), onLaterPages=on_page(title))
    return path


# -------------------- FLOTA --------------------
def build_flota():
    path = PDF_DIR / "08_flota.pdf"
    doc = make_doc(path, "Flota")
    story = []
    story.append(Paragraph("Catálogo de flota CTS 2026", S["H1"]))
    story.append(Paragraph(
        "Modelos concretos del juego (base + DLCs). Asignación por línea según demanda y tipología.",
        S["Body"]))

    # vehicles table
    rows = [[
        Paragraph("<b>Modelo</b>", S["Tiny"]),
        Paragraph("<b>Tipo</b>", S["Tiny"]),
        Paragraph("<b>m</b>", S["Tiny"]),
        Paragraph("<b>Cap.</b>", S["Tiny"]),
        Paragraph("<b>Origen</b>", S["Tiny"]),
        Paragraph("<b>Rol</b>", S["Tiny"]),
        Paragraph("<b>Líneas</b>", S["Tiny"]),
    ]]
    usage = defaultdict(list)
    for L in LINES.values():
        for v in L["vehicles"]:
            usage[v].append(L["code"])

    for vid, v in VEHICLES.items():
        rows.append([
            Paragraph(v["name"], S["Tiny"]),
            Paragraph(v["type"], S["Tiny"]),
            Paragraph(str(v["length_m"]), S["Tiny"]),
            Paragraph(str(v["capacity"]), S["Tiny"]),
            Paragraph(v["source"], S["Tiny"]),
            Paragraph(v["role"], S["Tiny"]),
            Paragraph(", ".join(usage.get(vid, ["—"])), S["Tiny"]),
        ])
    tbl = Table(rows, colWidths=[48 * mm, 12 * mm, 10 * mm, 12 * mm, 32 * mm, 28 * mm, 28 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
    ]))
    story.append(tbl)

    story.append(Paragraph("Resumen de coches por modo", S["H2"]))
    tram_units = sum(L["fleet_units"] for L in LINES.values() if L["mode"] == "tram")
    bus_units = sum(L["fleet_units"] for L in LINES.values() if L["mode"] == "bus")
    night_units = sum(L["fleet_units"] for L in LINES.values() if L["mode"] == "night")
    story.append(Paragraph(
        f"Tranvía: <b>{tram_units}</b> coches · Bus diurno: <b>{bus_units}</b> · "
        f"Nocturno (compartible con diurno): <b>{night_units}</b> turnos. "
        "En el juego puedes reutilizar flota diurna para nocturnos.",
        S["Body"]))

    doc.build(story, onFirstPage=on_page("Flota"), onLaterPages=on_page("Flota"))
    return path


# -------------------- CHECKLIST --------------------
def build_checklist():
    path = PDF_DIR / "09_checklist_cts.pdf"
    doc = make_doc(path, "Checklist CTS")
    story = []
    story.append(Paragraph("Checklist para montar la red en CTS 2026", S["H1"]))
    story.append(Paragraph(
        "Orden recomendado: renombrar paradas → crear líneas T → buses → nocturnos → "
        "asignar vehículos → frecuencias → probar hubs.",
        S["Body"]))

    story.append(Paragraph("A. Preparación", S["H2"]))
    for step in [
        "Operador: EMT Málaga",
        "Ciudad/marca: colores primario #003D6B, secundario #00A3A1, acento #E85D4C",
        "Renombrar las 80+ paradas según 02_paradas.pdf",
        "Marcar hubs y depósitos (Favorita, Cocheras Sur, Oeste, Norte)",
    ]:
        story.append(Paragraph(f"☐  {step}", S["Body"]))

    story.append(Paragraph("B. Líneas (crear en este orden)", S["H2"]))
    rows = [[
        Paragraph("<b>☐</b>", S["Tiny"]),
        Paragraph("<b>Cód.</b>", S["Tiny"]),
        Paragraph("<b>Color</b>", S["Tiny"]),
        Paragraph("<b>Cabeceras</b>", S["Tiny"]),
        Paragraph("<b>Vehículo 1º</b>", S["Tiny"]),
        Paragraph("<b>Frec. punta</b>", S["Tiny"]),
    ]]
    for L in LINES.values():
        rows.append([
            Paragraph("☐", S["Tiny"]),
            LineBadge(L["code"], L["color"], L.get("text_color", "#FFFFFF"), 22, 11),
            Paragraph(L["color"], S["Tiny"]),
            Paragraph(f"{stop_name(L['from'])} → {stop_name(L['to'])}", S["Tiny"]),
            Paragraph(VEHICLES[L["vehicles"][0]]["name"], S["Tiny"]),
            Paragraph(f"{L['headway_peak_min']} min", S["Tiny"]),
        ])
    tbl = Table(rows, colWidths=[8 * mm, 16 * mm, 22 * mm, 58 * mm, 52 * mm, 18 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
    ]))
    story.append(tbl)

    story.append(Paragraph("C. Validación en juego (mapa Netz)", S["H2"]))
    for step in [
        "Renombrar TODAS las paradas a español (02_paradas.pdf) — sin nombres alemanes",
        "Comprobar T solo en vías de tranvía; laberinto gris SO = solo bus (A1/11/12/17)",
        "Hubs cuadrados del centro: Ópera, Ayuntamiento, Anillo, Puerto, Estaciones",
        "Líneas marcadas REVISAR: T8 (bucle) y T9 (exprés)",
        "Activar TP (patrimonial) con E1/GT6",
        "Alimentadoras A1–A4 con MAN A47",
        "Días de partido: plan R-EST (PDF 11)",
        "Aplicar calendario verano/feria/navidad (PDF 10)",
        "Cargar plantillas de intervalo del PDF 12 en Line Editor",
    ]:
        story.append(Paragraph(f"☐  {step}", S["Body"]))

    story.append(Paragraph("D. Tabla de validación rápida", S["H2"]))
    vrows = [[Paragraph("<b>Línea</b>", S["Tiny"]), Paragraph("<b>Estado</b>", S["Tiny"]),
              Paragraph("<b>Nota</b>", S["Tiny"])]]
    for code, (st, note) in LINE_VALIDATION.items():
        vrows.append([
            Paragraph(code, S["Tiny"]),
            Paragraph("OK" if st == "ok" else "REVISAR", S["Tiny"]),
            Paragraph(note, S["Tiny"]),
        ])
    vt = Table(vrows, colWidths=[18 * mm, 18 * mm, 134 * mm])
    vt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
    ]))
    story.append(vt)

    doc.build(story, onFirstPage=on_page("Checklist CTS"), onLaterPages=on_page("Checklist CTS"))
    return path


# -------------------- 03b PLANOS POR DISTRITO (6) --------------------
def build_planos_distrito():
    path = PDF_DIR / "03b_planos_distrito.pdf"
    doc = make_doc(path, "Planos por distrito")
    story = []
    story.append(Paragraph("Planos por distrito (mapa Netz CTS)", S["H1"]))
    story.append(Paragraph(
        "Coordenadas alineadas a la captura del juego: eje N–S central, bucle NE, "
        "diagonal, corredor este, laberinto gris SO (cocheras/Torres del Sur).",
        S["Body"]))
    for note in VALIDATION_NOTES.values():
        story.append(Paragraph(f"• {note}", S["Small"]))
    story.append(Spacer(1, 4))

    # full overview
    story.append(Paragraph("Vista general diurna", S["H2"]))
    story.append(NetworkSchematic({"tram", "bus"}, height=140 * mm))
    story.append(PageBreak())

    for dname in ["Centro", "Norte", "Oeste", "Sur", "Este", "Extensión Sur"]:
        story.append(Paragraph(f"Distrito: {dname}", S["H1"]))
        story.append(NetworkSchematic({"tram", "bus", "night"}, height=145 * mm,
                                      district_filter={dname}))
        # stops in district
        stops = [(sid, st) for sid, st in STOPS.items() if st["district"] == dname]
        stops.sort(key=lambda x: x[1]["name"])
        story.append(Paragraph(f"{len(stops)} paradas en {dname}", S["H2"]))
        for sid, st in stops[:40]:
            hub = " ★" if st["hub"] else ""
            story.append(Paragraph(
                f"• <b>{st['name']}</b>{hub} · Zona {st['zone']} · "
                f"{', '.join(correspondences(sid)[:8]) or '—'}",
                S["Tiny"]))
        story.append(PageBreak())

    if story and isinstance(story[-1], PageBreak):
        story.pop()
    doc.build(story, onFirstPage=on_page("Planos distrito"), onLaterPages=on_page("Planos distrito"))
    return path


# -------------------- 10 CALENDARIO (15) --------------------
def build_calendario():
    path = PDF_DIR / "10_calendario_operativo.pdf"
    doc = make_doc(path, "Calendario operativo")
    story = []
    story.append(Paragraph("Calendario operativo EMT Málaga", S["H1"]))
    story.append(Paragraph(
        "Los factores multiplican el intervalo (headway). Factor 0,75 = un 25 % más de frecuencias.",
        S["Body"]))

    rows = [[
        Paragraph("<b>Temporada</b>", S["Tiny"]),
        Paragraph("<b>Tranvía</b>", S["Tiny"]),
        Paragraph("<b>Bus</b>", S["Tiny"]),
        Paragraph("<b>Noche</b>", S["Tiny"]),
        Paragraph("<b>Notas</b>", S["Tiny"]),
    ]]
    for cal in CALENDAR.values():
        rows.append([
            Paragraph(cal["name"], S["Tiny"]),
            Paragraph(str(cal["tram_factor"]), S["Tiny"]),
            Paragraph(str(cal["bus_factor"]), S["Tiny"]),
            Paragraph(str(cal["night_factor"]), S["Tiny"]),
            Paragraph(cal["notes"], S["Tiny"]),
        ])
    tbl = Table(rows, colWidths=[42 * mm, 16 * mm, 16 * mm, 16 * mm, 80 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#EEF3F7")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["primary"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Ejemplo: T1 en cada temporada (intervalo punta)", S["H2"]))
    t1 = LINES["T1"]
    erows = [[Paragraph("<b>Temporada</b>", S["Tiny"]), Paragraph("<b>Punta</b>", S["Tiny"]),
              Paragraph("<b>Valle</b>", S["Tiny"]), Paragraph("<b>Tarde</b>", S["Tiny"])]]
    for cal in CALENDAR.values():
        if cal["name"].startswith("Día de partido"):
            continue
        f = cal["tram_factor"]
        erows.append([
            Paragraph(cal["name"], S["Tiny"]),
            Paragraph(f"{apply_calendar_factor(t1['headway_peak_min'], f)} min", S["Tiny"]),
            Paragraph(f"{apply_calendar_factor(t1['headway_off_min'], f)} min", S["Tiny"]),
            Paragraph(f"{apply_calendar_factor(t1['headway_eve_min'], f)} min", S["Tiny"]),
        ])
    et = Table(erows, colWidths=[70 * mm, 30 * mm, 30 * mm, 30 * mm])
    et.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hex_color(BRAND["secondary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#F0FAFA")]),
        ("BOX", (0, 0), (-1, -1), 0.3, hex_color(BRAND["secondary"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(et)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Feria: ampliar TP (Turística Patrimonial) 09:00–22:00. "
        "Nochevieja: N8 continua 23:00–06:00. Verano: reforzar 11/17 hacia Torres del Sur.",
        S["Body"]))

    doc.build(story, onFirstPage=on_page("Calendario"), onLaterPages=on_page("Calendario"))
    return path


# -------------------- 11 REFUERZOS ESTADIO (3) --------------------
def build_refuerzos():
    path = PDF_DIR / "11_refuerzos_estadio.pdf"
    doc = make_doc(path, "Refuerzos Estadio")
    story = []
    plan = EVENT_REINFORCEMENTS["R-EST"]
    story.append(Paragraph(plan["name"], S["H1"]))
    story.append(Paragraph(f"<b>Activación:</b> {plan['trigger']}", S["Body"]))
    story.append(Paragraph(
        "Paradas clave: " + ", ".join(stop_name(s) for s in plan["special_stops"]),
        S["Body"]))
    story.append(Spacer(1, 6))

    for code, info in plan["lines"].items():
        L = LINES[code]
        story.append(ColorBar(L["color"], height=5))
        story.append(Spacer(1, 3))
        story.append(Paragraph(f"<b>{code} — {L['name']}</b>", S["H2"]))
        story.append(Paragraph(
            f"Intervalo refuerzo: <b>cada {info['headway_peak_min']} min</b> "
            f"(base {L['headway_peak_min']} min) · "
            f"+{info['extra_units']} coches · {info['note']}",
            S["Body"]))
        story.append(Paragraph(
            f"Vehículos: {', '.join(VEHICLES[v]['name'] for v in L['vehicles'])}",
            S["Small"]))
        story.append(Paragraph(
            f"Recorrido: {' → '.join(stop_name(s) for s in L['stops'][:8])}…",
            S["Tiny"]))
        story.append(Spacer(1, 6))

    story.append(Paragraph("Checklist día de partido", S["H2"]))
    for s in [
        "Avisar depósitos Sur / Extensión Sur 3 h antes",
        "Poner destinos «Estadio Costa del Sol» en T6 / 5 / 9",
        "Habilitar andenes extras en Muelle del Comercio y Calle de los Tilos",
        "Tras el pitido final: mantener T6+9 durante 90 min; activar N5 si >23:00",
        "Desactivar plan R-EST cuando la ocupación baje de 40 % en dos salidas seguidas",
    ]:
        story.append(Paragraph(f"☐  {s}", S["Body"]))

    doc.build(story, onFirstPage=on_page("Refuerzos Estadio"), onLaterPages=on_page("Refuerzos Estadio"))
    return path


# -------------------- 12 HORARIOS (2) --------------------
def build_horarios():
    path = PDF_DIR / "12_horarios_line_editor.pdf"
    doc = make_doc(path, "Horarios Line Editor")
    story = []
    story.append(Paragraph("Plantillas de horario para Line Editor CTS", S["H1"]))
    story.append(Paragraph(
        "Usa el intervalo de cada franja. Las salidas listadas son desde cabecera A "
        "(primera parada). En CTS: Line Editor → Timetable Generator.",
        S["Body"]))

    # one compact page-ish blocks; group by mode
    for mode, title in [("tram", "Tranvía"), ("bus", "Autobús"), ("night", "Nocturno")]:
        story.append(Paragraph(title, S["H1"]))
        for lid, L in LINES.items():
            if L["mode"] != mode:
                continue
            tpl = day_templates(L)
            story.append(Paragraph(
                f"<font color='{L['color']}'><b>■ {L['code']}</b></font> {L['name']} · "
                f"servicio {tpl['servicio']}",
                S["H2"]))
            bands = []
            for key in ("punta_am", "valle", "punta_pm", "tarde_noche"):
                b = tpl[key]
                sample = ", ".join(b["salidas"][:6])
                if len(b["salidas"]) > 6:
                    sample += "…"
                bands.append([
                    Paragraph(key.replace("_", " "), S["Tiny"]),
                    Paragraph(b["ventana"], S["Tiny"]),
                    Paragraph(f"{b['intervalo_min']} min", S["Tiny"]),
                    Paragraph(sample or "—", S["Tiny"]),
                ])
            ht = Table(
                [[Paragraph("<b>Franja</b>", S["Tiny"]), Paragraph("<b>Ventana</b>", S["Tiny"]),
                  Paragraph("<b>Intervalo</b>", S["Tiny"]), Paragraph("<b>Salidas (muestra)</b>", S["Tiny"])]]
                + bands,
                colWidths=[28 * mm, 28 * mm, 22 * mm, 92 * mm],
            )
            ht.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), hex_color(L["color"])),
                ("TEXTCOLOR", (0, 0), (-1, 0), hex_color(L.get("text_color", "#FFFFFF"))),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, hex_color("#F5F7FA")]),
                ("BOX", (0, 0), (-1, -1), 0.25, hex_color(L["color"])),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
            ]))
            story.append(ht)
            story.append(Spacer(1, 4))
        story.append(PageBreak())

    if story and isinstance(story[-1], PageBreak):
        story.pop()
    doc.build(story, onFirstPage=on_page("Horarios"), onLaterPages=on_page("Horarios"))
    return path


def main():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    paths = []
    print("Generando 01 guía…")
    paths.append(build_guia())
    print("Generando 02 paradas…")
    paths.append(build_paradas())
    print("Generando 03 plano diurno…")
    paths.append(build_plano({"tram", "bus"}, "03_plano_diurno.pdf", "Plano red diurna"))
    print("Generando 03b planos distrito…")
    paths.append(build_planos_distrito())
    print("Generando 04 plano nocturno…")
    paths.append(build_plano({"night"}, "04_plano_nocturno.pdf", "Plano red nocturna"))
    print("Generando 05 fichas tranvía…")
    paths.append(build_fichas("tram", "05_fichas_tranvia.pdf", "Fichas tranvía"))
    print("Generando 06 fichas autobús…")
    paths.append(build_fichas("bus", "06_fichas_autobus.pdf", "Fichas autobús"))
    print("Generando 07 fichas nocturno…")
    paths.append(build_fichas("night", "07_fichas_nocturno.pdf", "Fichas nocturno"))
    print("Generando 08 flota…")
    paths.append(build_flota())
    print("Generando 09 checklist…")
    paths.append(build_checklist())
    print("Generando 10 calendario…")
    paths.append(build_calendario())
    print("Generando 11 refuerzos…")
    paths.append(build_refuerzos())
    print("Generando 12 horarios…")
    paths.append(build_horarios())
    print("OK:")
    for pth in paths:
        print(" ", pth, f"({pth.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
