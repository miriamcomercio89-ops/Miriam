# -*- coding: utf-8 -*-
"""
PDF completo — Línea 2 de tranvía (Straßenbahnnetz).
Fuente: documento Carl B. / captura del usuario.
Paradas actuales (variante vienesa) → nombres EMT Málaga (español)
+ equivalencia al nombre del mapa base CTS cuando aplica.
"""

from pathlib import Path
from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, Flowable, HRFlowable,
)
from reportlab.pdfgen import canvas
import os

OUT = Path(__file__).resolve().parent / "lineas" / "linea_02_tranvia.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

# --- Identidad línea ---
LINE = {
    "code": "2",
    "mode": "Tranvía",
    "name": "Colinas del Oeste – Plaza del Nuevo Norte",
    "name_old": "Dornbach → Friedrich-Engels-Platz",
    "color": "#0077C8",
    "text": "#FFFFFF",
    "kind": "Diametral / oeste–centro–norte",
    "service": "05:45 – 00:00",
    "distance_km": 8.6,
    "runtime_min": 31,
    "headway_peak": 7,
    "headway_off": 12,
    "headway_eve": 15,
    "demand": "Alta",
    "target_load": "70–85 %",
    "fleet_units": 12,
    "vehicles": [
        ("ULF B1 (Viena)", "Base", 180, "principal"),
        ("GT8N Mannheim", "DLC GT8N", 180, "refuerzo alta demanda"),
    ],
    "depot": "Depot Süd / Depósito Sur",
    "zones": ["A", "B", "C"],
    "notes": (
        "Une el extremo oeste (Colinas / Dornbach) con el Nuevo Norte pasando por el casco: "
        "Ayuntamiento, Alcázar, Arco del Este y Puerto. En el plano se ve como trazo que entra "
        "desde la izquierda, recorre el anillo sureste/este y remonta al norte. "
        "Varias paradas con correspondencia tipo metro (icono U)."
    ),
}

# Paradas en orden: (nombre_actual_plano, nombre_ES, nombre_CTS_mapa, u_bahn, zona, hub)
# Nombres ES coherentes con Línea 1 donde hay paradas compartidas.
STOPS = [
    ("Dornbach", "Colinas del Oeste", "Schmiedegasse", False, "C", True),
    ("Sandleitengasse", "Camino de las Dunas", "Fakultätsstraße", False, "B", False),
    ("Babenbergerring", "Paseo de los Naranjos", "Igor-Yurkevic-Platz", False, "A", True),
    ("Rathausplatz", "Plaza del Ayuntamiento", "Rathausplatz", True, "A", True),
    ("Weihburggasse", "Fuente Blanca", "Wasserturm", False, "A", False),
    ("Johann-Strauß-Gasse", "Calle del Violinista", "Ringbibliothek", False, "A", False),
    ("Schloss Tramau", "Alcázar del Sol", "Am Schlosspark", False, "A", True),
    ("Taborstraße", "Calle del Tablero", "Sommerfeldgarten", True, "B", False),
    ("Hetzendorfer Straße / Tramauer Allee", "Museo del Barrio", "Heimatmuseum", False, "B", False),
    ("Julius-Raab-Platz", "Plaza del Mediodía", "Bernhardsplatz", False, "A", False),
    ("Stubentor", "Arco del Este", "Oberer Ring", True, "A", True),
    ("Schwedenplatz", "Plaza del Puerto", "Kaiserpark", True, "A", True),
    ("Höchstädtplatz", "Plaza Alta Norte", "Baumannstraße", False, "B", False),
    ("Friedrich-Engels-Platz", "Plaza del Nuevo Norte", "Freimutplatz", False, "C", True),
]

BRAND = {"primary": "#003D6B", "secondary": "#00A3A1", "accent": "#E85D4C", "ink": "#1A1A1A", "muted": "#5C6670"}


def fonts():
    pairs = [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
         "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
    ]
    for r, b in pairs:
        if os.path.exists(r) and os.path.exists(b):
            pdfmetrics.registerFont(TTFont("EMT", r))
            pdfmetrics.registerFont(TTFont("EMT-Bold", b))
            return "EMT", "EMT-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_B = fonts()
PAGE_W, PAGE_H = A4
MARGIN = 14 * mm


def S():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("H1", fontName=FONT_B, fontSize=18, leading=22,
                              textColor=HexColor(BRAND["primary"]), spaceAfter=6))
    styles.add(ParagraphStyle("H2", fontName=FONT_B, fontSize=12, leading=15,
                              textColor=HexColor(BRAND["ink"]), spaceBefore=8, spaceAfter=4))
    styles.add(ParagraphStyle("Body", fontName=FONT, fontSize=9, leading=12,
                              textColor=HexColor(BRAND["ink"]), spaceAfter=3))
    styles.add(ParagraphStyle("Small", fontName=FONT, fontSize=8, leading=10,
                              textColor=HexColor(BRAND["muted"])))
    styles.add(ParagraphStyle("Tiny", fontName=FONT, fontSize=7, leading=9,
                              textColor=HexColor(BRAND["ink"])))
    styles.add(ParagraphStyle("TinyM", fontName=FONT, fontSize=7, leading=9,
                              textColor=HexColor(BRAND["muted"])))
    styles.add(ParagraphStyle("White", fontName=FONT, fontSize=9, leading=12, textColor=white))
    styles.add(ParagraphStyle("Center", fontName=FONT_B, fontSize=28, leading=32,
                              textColor=white, alignment=TA_CENTER))
    return styles


STY = S()


class Bar(Flowable):
    def __init__(self, color, h=5):
        Flowable.__init__(self)
        self.color = HexColor(color)
        self.h = h

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.h

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.roundRect(0, 0, self.width, self.h, 2, fill=1, stroke=0)


class LineSchematic(Flowable):
    def __init__(self, height=42 * mm):
        Flowable.__init__(self)
        self.height = height

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(HexColor("#F0F4F8"))
        c.roundRect(0, 0, w, h, 4, fill=1, stroke=0)
        # horizontal spine
        y = h * 0.55
        c.setStrokeColor(HexColor(LINE["color"]))
        c.setLineWidth(4)
        c.line(8, y, w - 8, y)
        n = len(STOPS)
        for i, st in enumerate(STOPS):
            x = 8 + (w - 16) * (i / (n - 1))
            hub = st[5]
            c.setFillColor(white)
            c.setStrokeColor(HexColor(LINE["color"]))
            c.setLineWidth(1.2)
            r = 4 if hub else 2.5
            c.circle(x, y, r, fill=1, stroke=1)
            if st[3]:  # U
                c.setFillColor(HexColor("#0077C8"))
                c.circle(x, y + 9, 3.5, fill=1, stroke=0)
                c.setFillColor(white)
                c.setFont(FONT_B, 5)
                c.drawCentredString(x, y + 7.5, "U")
            # label every few
            if i == 0 or i == n - 1 or hub and i % 2 == 0:
                c.setFillColor(HexColor(BRAND["ink"]))
                c.setFont(FONT, 5)
                label = st[1][:18]
                c.saveState()
                c.translate(x, y - 12)
                c.rotate(-35)
                c.drawString(0, 0, label)
                c.restoreState()


def footer(canv, doc):
    canv.saveState()
    canv.setFillColor(HexColor(LINE["color"]))
    canv.rect(0, 0, PAGE_W, 9 * mm, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont(FONT, 7)
    canv.drawString(MARGIN, 3.5 * mm, f"EMT Málaga  ·  Línea {LINE['code']}  ·  {LINE['name']}")
    canv.drawRightString(PAGE_W - MARGIN, 3.5 * mm, f"pág. {doc.page}")
    canv.restoreState()


def header(canv, doc):
    canv.saveState()
    canv.setFillColor(HexColor(BRAND["primary"]))
    canv.rect(0, PAGE_H - 14 * mm, PAGE_W, 14 * mm, fill=1, stroke=0)
    canv.setFillColor(HexColor(BRAND["secondary"]))
    canv.rect(0, PAGE_H - 15.5 * mm, PAGE_W, 1.5 * mm, fill=1, stroke=0)
    canv.setFillColor(white)
    canv.setFont(FONT_B, 10)
    canv.drawString(MARGIN, PAGE_H - 9 * mm, "Ficha completa de línea")
    canv.setFont(FONT, 8)
    canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 9 * mm, "EMT Málaga · CTS 2026")
    canv.restoreState()


def segment_times(runtime, n):
    segs = n - 1
    base, rem = divmod(runtime, segs)
    out = [max(1, base)] * segs
    mid = segs // 2
    for i in range(rem):
        out[(mid + i) % segs] += 1
    return out


def build():
    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=20 * mm, bottomMargin=14 * mm,
        title=f"Línea {LINE['code']} — {LINE['name']}",
        author="EMT Málaga",
    )
    story = []

    # ===== PORTADA LÍNEA =====
    head = [[
        Paragraph(f"<font color='{LINE['text']}' size='32'><b>{LINE['code']}</b></font>", STY["Center"]),
        Paragraph(
            f"<font color='{LINE['text']}'><b>{LINE['mode']} · {LINE['name']}</b><br/>"
            f"Antes: {LINE['name_old']}<br/>"
            f"{LINE['kind']} · color {LINE['color']}</font>",
            STY["White"]),
    ]]
    ht = Table(head, colWidths=[28 * mm, 142 * mm])
    ht.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor(LINE["color"])),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(ht)
    story.append(Spacer(1, 6))
    story.append(Paragraph(LINE["notes"], STY["Body"]))
    story.append(Spacer(1, 4))
    story.append(LineSchematic())
    story.append(Paragraph("Esquema de la línea (rojo) · círculo azul U = correspondencia metro en el plano original", STY["TinyM"]))

    # ===== DATOS OPERATIVOS =====
    story.append(Paragraph("1. Datos operativos", STY["H2"]))
    meta = [
        ["Servicio", LINE["service"], "Distancia", f"{LINE['distance_km']} km"],
        ["Tiempo recorrido", f"{LINE['runtime_min']} min", "Demanda", LINE["demand"]],
        ["Frec. punta", f"cada {LINE['headway_peak']} min", "Valle", f"cada {LINE['headway_off']} min"],
        ["Tarde/noche", f"cada {LINE['headway_eve']} min", "Ocupación obj.", LINE["target_load"]],
        ["Coches", str(LINE["fleet_units"]), "Depósito", LINE["depot"]],
        ["Zonas", " + ".join(LINE["zones"]), "Paradas", str(len(STOPS))],
    ]
    mrows = []
    for a, b, c, d in meta:
        mrows.append([
            Paragraph(f"<b>{a}</b>", STY["Tiny"]), Paragraph(b, STY["Tiny"]),
            Paragraph(f"<b>{c}</b>", STY["Tiny"]), Paragraph(d, STY["Tiny"]),
        ])
    mt = Table(mrows, colWidths=[32 * mm, 53 * mm, 32 * mm, 53 * mm])
    mt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F7F4EF")),
        ("BOX", (0, 0), (-1, -1), 0.6, HexColor(LINE["color"])),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, HexColor("#D0D7DE")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(mt)

    # ===== VEHÍCULOS =====
    story.append(Paragraph("2. Vehículos CTS 2026", STY["H2"]))
    vrows = [[
        Paragraph("<b>Modelo</b>", STY["Tiny"]),
        Paragraph("<b>Origen</b>", STY["Tiny"]),
        Paragraph("<b>Cap.</b>", STY["Tiny"]),
        Paragraph("<b>Rol</b>", STY["Tiny"]),
    ]]
    for name, src, cap, role in LINE["vehicles"]:
        vrows.append([
            Paragraph(name, STY["Tiny"]), Paragraph(src, STY["Tiny"]),
            Paragraph(str(cap), STY["Tiny"]), Paragraph(role, STY["Tiny"]),
        ])
    vt = Table(vrows, colWidths=[55 * mm, 40 * mm, 20 * mm, 55 * mm])
    vt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor(BRAND["primary"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#EEF3F7")]),
        ("BOX", (0, 0), (-1, -1), 0.4, HexColor(BRAND["primary"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(vt)

    # ===== HORARIOS =====
    story.append(Paragraph("3. Plantilla de intervalos (Line Editor)", STY["H2"]))
    bands = [
        ("Punta mañana", "07:00–09:30", LINE["headway_peak"]),
        ("Valle", "09:30–16:30", LINE["headway_off"]),
        ("Punta tarde", "16:30–20:00", LINE["headway_peak"]),
        ("Tarde/noche", "20:00–00:15", LINE["headway_eve"]),
    ]
    brows = [[Paragraph("<b>Franja</b>", STY["Tiny"]),
              Paragraph("<b>Ventana</b>", STY["Tiny"]),
              Paragraph("<b>Intervalo</b>", STY["Tiny"]),
              Paragraph("<b>Ej. salidas cabecera Colinas</b>", STY["Tiny"])]]
    for name, win, hw in bands:
        # sample departures
        samples = []
        # parse rough
        start = win.split("–")[0]
        h, m = map(int, start.split(":"))
        mins = h * 60 + m
        for _ in range(5):
            samples.append(f"{mins // 60:02d}:{mins % 60:02d}")
            mins += hw
        brows.append([
            Paragraph(name, STY["Tiny"]), Paragraph(win, STY["Tiny"]),
            Paragraph(f"cada {hw} min", STY["Tiny"]),
            Paragraph(", ".join(samples) + "…", STY["Tiny"]),
        ])
    bt = Table(brows, colWidths=[32 * mm, 32 * mm, 28 * mm, 78 * mm])
    bt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor(LINE["color"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#FDF2F2")]),
        ("BOX", (0, 0), (-1, -1), 0.4, HexColor(LINE["color"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(bt)

    story.append(Paragraph("4. Temporadas (multiplican el intervalo)", STY["H2"]))
    story.append(Paragraph(
        "Laborable ×1,0 · Verano ×1,15 · Feria ×0,75 (refuerzo hacia Colinas del Oeste) · "
        "Navidad ×0,90 · Día de partido: sin cambio directo (viajeros al estadio usan otras líneas).",
        STY["Body"]))

    story.append(PageBreak())

    # ===== NOMBRES =====
    story.append(Paragraph("5. Nombres de paradas (viejo → nuevo)", STY["H1"]))
    story.append(Paragraph(
        "Renombra en CTS con la columna <b>EMT Málaga</b>. "
        "Si tu mapa muestra el nombre alemán base, usa la columna <b>CTS mapa</b>.",
        STY["Body"]))
    story.append(Bar(LINE["color"], 3))
    story.append(Spacer(1, 4))

    segs = segment_times(LINE["runtime_min"], len(STOPS))
    rows = [[
        Paragraph("<b>#</b>", STY["Tiny"]),
        Paragraph("<b>Nombre actual (plano)</b>", STY["Tiny"]),
        Paragraph("<b>EMT Málaga (español)</b>", STY["Tiny"]),
        Paragraph("<b>CTS mapa (si aplica)</b>", STY["Tiny"]),
        Paragraph("<b>U</b>", STY["Tiny"]),
        Paragraph("<b>Z</b>", STY["Tiny"]),
        Paragraph("<b>+min</b>", STY["Tiny"]),
    ]]
    for i, (old, new, cts, u, z, hub) in enumerate(STOPS, 1):
        style_new = STY["Tiny"]
        rows.append([
            Paragraph(str(i), STY["Tiny"]),
            Paragraph(old, STY["TinyM"]),
            Paragraph(f"<b>{new}</b>" + (" ★" if hub else ""), STY["Tiny"]),
            Paragraph(cts, STY["TinyM"]),
            Paragraph("U" if u else "—", STY["Tiny"]),
            Paragraph(z, STY["Tiny"]),
            Paragraph("—" if i == 1 else str(segs[i - 2]), STY["Tiny"]),
        ])
    rt = Table(rows, colWidths=[8 * mm, 38 * mm, 40 * mm, 42 * mm, 8 * mm, 8 * mm, 12 * mm])
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor(LINE["color"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#F7F4EF")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.4, HexColor(LINE["color"])),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
    ]))
    story.append(rt)
    story.append(Paragraph("★ = hub / intercambiador recomendado", STY["TinyM"]))

    # ===== CORRESPONDENCIAS SUGERIDAS =====
    story.append(Paragraph("6. Correspondencias en hubs de esta línea", STY["H2"]))
    hubs_txt = [
        ("Colinas del Oeste", "Cabecera oeste; enlace a buses del Olivar y cocheras oeste."),
        ("Paseo de los Naranjos", "Entrada al casco; correspondencia con Línea 1 y circulares."),
        ("Plaza del Ayuntamiento", "Hub central; buses al Perchel / estación."),
        ("Alcázar del Sol", "Punto turístico; cruce con L1 en tramo casco."),
        ("Arco del Este", "Salida del anillo hacia este/norte; muchas correspondencias."),
        ("Plaza del Puerto", "Muelle / este; enlace a Estadio en otras líneas."),
        ("Plaza del Nuevo Norte", "Cabecera norte; Hospital Norte y Polígono en buses."),
    ]
    for h, t in hubs_txt:
        story.append(Paragraph(f"• <b>{h}</b> — {t}", STY["Body"]))

    # ===== CHECKLIST =====
    story.append(Paragraph("7. Checklist CTS para esta línea", STY["H2"]))
    checks = [
        f"Crear línea código «{LINE['code']}» (o T2) color HEX {LINE['color']}",
        "Renombrar las 14 paradas con la columna EMT Málaga (mismas que L1 si ya existen)",
        "Cabeceras: Colinas del Oeste ↔ Plaza del Nuevo Norte",
        "Asignar ULF B1 (principal) + GT8N (refuerzo)",
        f"Intervalo punta {LINE['headway_peak']} min · valle {LINE['headway_off']} min · tarde {LINE['headway_eve']} min",
        f"Servicio {LINE['service']} · depósito {LINE['depot']}",
        "Comprobar vía continua oeste → anillo → norte en el mapa Tram",
        "Probar recorrido completo en Free Roam antes de activar IA",
        "Añadir a Timetable Generator las 4 franjas de la sección 3",
    ]
    for c in checks:
        story.append(Paragraph(f"☐  {c}", STY["Body"]))

    story.append(Spacer(1, 8))
    story.append(Bar(BRAND["secondary"], 3))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Siguiente paso: cuando valides esta línea, pásame la Línea 6 (o la siguiente del documento) "
        "y te genero su PDF completo con el mismo formato.",
        STY["Small"]))

    doc.build(story, onFirstPage=lambda c, d: (header(c, d), footer(c, d)),
              onLaterPages=lambda c, d: (header(c, d), footer(c, d)))
    return OUT


if __name__ == "__main__":
    path = build()
    print(path, path.stat().st_size // 1024, "KB")
