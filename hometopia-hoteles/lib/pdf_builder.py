"""Constructor PDF editorial de lujo para un hotel Hometopia."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas

from .drawing import (
    FloorPlan,
    draw_grid,
    draw_north_arrow,
    draw_rooms,
    draw_scale_bar,
    draw_use_legend,
)
from .theme import (
    GOLD,
    GOLD_SOFT,
    INK,
    MUTED,
    NAVY,
    PAPER,
    RULE,
    STONE,
    TEAL,
    WHITE,
    register_fonts,
)


class HotelPDF:
    def __init__(self, hotel: dict[str, Any], output: Path):
        self.h = hotel
        self.output = Path(output)
        self.fonts = register_fonts()
        self.page = 0
        # A3 apaisado para planos; portada A4 vertical
        self.plan_size = landscape(A3)
        self.cover_size = A4
        self.c: Canvas | None = None

    def build(self) -> Path:
        self.output.parent.mkdir(parents=True, exist_ok=True)
        self.c = Canvas(str(self.output), pagesize=self.cover_size)
        self.c.setTitle(f"{self.h['nombre']} · {self.h['destino']} — Planos Hometopia")
        self.c.setAuthor("ORBIS Collection")
        self.c.setSubject("Manual de planos y guía de construcción para Hometopia")
        self.c.setCreator("ORBIS Hoteles · generador editorial")
        self._cover()
        self._ficha()
        self._concepto()
        self._logo_identidad()
        for floor in self.h["floors"]:
            self._floor_page(floor)
        self._inventario()
        self._superficies_materiales()
        self._guia_hometopia()
        self.c.save()
        return self.output

    # --- chrome -----------------------------------------------------------
    def _new_page(self, size=None, header_section: str = "", header_title: str = ""):
        assert self.c is not None
        if self.page > 0:
            self.c.showPage()
        self.page += 1
        size = size or self.cover_size
        self.c.setPageSize(size)
        w, h = size
        # fondo papel
        self.c.setFillColor(PAPER)
        self.c.rect(0, 0, w, h, stroke=0, fill=1)
        if header_section:
            self._header(w, h, header_section, header_title)
        self._footer(w)
        return w, h

    def _header(self, w, h, section, title):
        c = self.c
        c.setFillColor(NAVY)
        c.rect(0, h - 48, w, 48, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.rect(0, h - 50, w, 2.5, stroke=0, fill=1)
        c.setFillColor(GOLD_SOFT)
        c.setFont(self.fonts["sans"], 8)
        c.drawString(28, h - 18, section.upper())
        c.setFillColor(WHITE)
        c.setFont(self.fonts["serif"], 15)
        c.drawString(28, h - 36, title)
        c.setFont(self.fonts["sans"], 7)
        c.setFillColor(GOLD)
        c.drawRightString(w - 28, h - 22, f"{self.h['nombre']} · {self.h['destino']}")

    def _footer(self, w, left: float = 28):
        c = self.c
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.line(left, 22, w - 28, 22)
        c.setFillColor(MUTED)
        c.setFont(self.fonts["sans"], 7)
        c.drawString(left, 10, "ORBIS Collection · Planos Hometopia · Uso personal de construcción")
        c.drawRightString(w - 28, 10, f"Pág. {self.page}")

    # --- pages ------------------------------------------------------------
    def _cover(self):
        w, h = self._new_page(self.cover_size)
        c = self.c
        # reescribir footer con margen que respeta la banda
        c.setFillColor(PAPER)
        c.rect(0, 0, w, 26, stroke=0, fill=1)
        self._footer(w, left=56)
        # banda lateral
        c.setFillColor(NAVY)
        c.rect(0, 0, 42, h, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.rect(42, 0, 3, h, stroke=0, fill=1)

        # marca
        c.setFillColor(NAVY)
        c.circle(w / 2, h - 160, 46, stroke=0, fill=1)
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.5)
        c.circle(w / 2, h - 160, 46, stroke=1, fill=0)
        c.setFillColor(GOLD)
        c.setFont(self.fonts["serif_bold"], 22)
        c.drawCentredString(w / 2, h - 168, self.h["logo_mark"])

        c.setFillColor(MUTED)
        c.setFont(self.fonts["sans"], 9)
        c.drawCentredString(w / 2, h - 230, self.h["cadena"].upper())

        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 32)
        c.drawCentredString(w / 2, h - 280, self.h["nombre"])
        c.setFont(self.fonts["serif"], 16)
        c.setFillColor(TEAL)
        c.drawCentredString(w / 2, h - 308, self.h["destino"])

        c.setStrokeColor(GOLD)
        c.setLineWidth(1)
        c.line(w / 2 - 70, h - 325, w / 2 + 70, h - 325)

        c.setFillColor(INK)
        c.setFont(self.fonts["sans"], 10)
        c.drawCentredString(w / 2, h - 350, self.h["subtitulo"])

        # ficha breve
        y = h - 410
        datos = [
            f"{self.h['estrellas']}★ · {self.h['categoria']}",
            f"{self.h['llaves']} llaves · aforo ~{self.h['aforo_estimado']} pax",
            f"Mapa {self.h['mapa_m']}×{self.h['mapa_m']} m · {self.h['plantas']} niveles",
            f"Precio simbólico: {self.h['precio_simbolico']}",
        ]
        c.setFont(self.fonts["sans"], 9)
        for line in datos:
            c.drawCentredString(w / 2, y, line)
            y -= 16

        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 11)
        c.drawCentredString(w / 2, 120, "Manual de planos + guía de construcción")
        c.setFillColor(MUTED)
        c.setFont(self.fonts["sans"], 8)
        c.drawCentredString(w / 2, 100, "Español · Rejilla 1×1 m · Norte arriba · Hometopia vanilla")
        c.setFillColor(GOLD)
        c.setFont(self.fonts["sans_bold"], 8)
        c.drawCentredString(w / 2, 70, f"HOTEL {self.h['id']} / 30")

    def _ficha(self):
        w, h = self._new_page(self.cover_size, "01 · Ficha técnica", "Datos del hotel")
        c = self.c
        x, y = 36, h - 80
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 18)
        c.drawString(x, y, self.h["nombre"])
        y -= 18
        c.setFillColor(TEAL)
        c.setFont(self.fonts["sans"], 10)
        c.drawString(x, y, f"{self.h['destino']} · {self.h['cadena']}")

        y -= 30
        pairs = [
            ("Categoría", f"{self.h['estrellas']}★ {self.h['categoria']}"),
            ("Llaves / aforo", f"{self.h['llaves']} · ~{self.h['aforo_estimado']} huéspedes"),
            ("Precio simbólico", self.h["precio_simbolico"]),
            ("Forma", self.h["forma"]),
            ("Densidad", self.h["densidad"]),
            ("Ocupación lote", self.h["ratio_edificio"]),
            ("Orientación", self.h["orientacion"]),
            ("Gancho", self.h["gancho"]),
            ("Estilo", self.h["estilo"]),
            ("Mapa juego", f"{self.h['mapa_m']}×{self.h['mapa_m']} m · sin sótano · vanilla"),
        ]
        for label, value in pairs:
            c.setFillColor(GOLD)
            c.setFont(self.fonts["sans_bold"], 8)
            c.drawString(x, y, label.upper())
            c.setFillColor(INK)
            c.setFont(self.fonts["sans"], 9)
            self._wrap_text(value, x + 110, y - 1, w - x - 140, 11)
            y -= 28
            c.setStrokeColor(RULE)
            c.line(x, y + 12, w - 36, y + 12)

    def _concepto(self):
        w, h = self._new_page(self.cover_size, "02 · Concepto", "Historia y atmósfera")
        c = self.c
        x, y = 36, h - 84
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 14)
        c.drawString(x, y, "Concepto")
        y -= 18
        y = self._wrap_text(self.h["concepto"], x, y, w - 72, 13, font=self.fonts["sans"], size=9, color=INK)
        y -= 22
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 14)
        c.drawString(x, y, "Narrativa de destino")
        y -= 18
        y = self._wrap_text(self.h["historia"], x, y, w - 72, 13, font=self.fonts["sans"], size=9, color=INK)

        y -= 28
        c.setFillColor(STONE)
        c.roundRect(x, y - 150, w - 72, 150, 6, stroke=0, fill=1)
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x + 14, y - 24, "Decisiones de diseño (esta entrega)")
        bullets = [
            "Único: volumen en L + rooftop cantilever (no se repetirá en otros hoteles)",
            "Urbano compacto: ~42 % huella / 58 % exteriores ceremoniales",
            "3 plantas tipo + planta suites + rooftop · 68 llaves",
            "Staff reducido en PB · locales técnicos esenciales · sin circulaciones segregadas",
            "Pasillos 2,5 m · baño en suite · balcones en fachada sur",
        ]
        yy = y - 44
        c.setFont(self.fonts["sans"], 8.5)
        c.setFillColor(INK)
        for b in bullets:
            c.drawString(x + 16, yy, "◆  " + b)
            yy -= 18

    def _logo_identidad(self):
        w, h = self._new_page(self.cover_size, "03 · Identidad", "Logo, color y señalética")
        c = self.c
        # logo grande
        c.setFillColor(NAVY)
        c.circle(120, h - 180, 58, stroke=0, fill=1)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2)
        c.circle(120, h - 180, 58, stroke=1, fill=0)
        c.setFillColor(GOLD)
        c.setFont(self.fonts["serif_bold"], 28)
        c.drawCentredString(120, h - 190, self.h["logo_mark"])

        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 16)
        c.drawString(210, h - 150, self.h["nombre"])
        c.setFont(self.fonts["sans"], 9)
        c.setFillColor(MUTED)
        c.drawString(210, h - 168, f"{self.h['cadena']} · {self.h['destino']}")
        c.setFillColor(INK)
        y = self._wrap_text(
            "Logotipo circular navy con monograma dorado. Usar en marquesina, "
            "vajilla, keycards y señalética de núcleos. Tipografía de display serif "
            "para nombre; sans para datos técnicos.",
            210,
            h - 190,
            w - 250,
            12,
            size=9,
        )

        # swatches
        y = h - 280
        c.setFont(self.fonts["serif"], 12)
        c.setFillColor(NAVY)
        c.drawString(36, y, "Paleta del hotel")
        swatches = [
            (NAVY, "Navy Port", "#0B1F33"),
            (GOLD, "Champagne Gold", "#C6A75E"),
            (TEAL, "Méditerranée", "#1F6F78"),
            (STONE, "Caliza", "#EDE7DB"),
            (PAPER, "Papier", "#F7F4EE"),
        ]
        x = 36
        for color, name, hexv in swatches:
            c.setFillColor(color)
            c.rect(x, y - 70, 70, 50, stroke=0, fill=1)
            c.setStrokeColor(NAVY)
            c.rect(x, y - 70, 70, 50, stroke=1, fill=0)
            c.setFillColor(INK)
            c.setFont(self.fonts["sans_bold"], 7)
            c.drawString(x, y - 84, name)
            c.setFont(self.fonts["sans"], 7)
            c.setFillColor(MUTED)
            c.drawString(x, y - 96, hexv)
            x += 85

        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(36, y - 130, "Aplicaciones rápidas en Hometopia")
        tips = [
            "Marquesina entrada: letras metálicas + luz cálida indirecta",
            "Uniformidad: navy en textiles públicos · oro solo en detalles",
            "Habitaciones: azul noche en cabezal · maderas ahumadas",
            "Exterior: piedra clara + agua + vegetación contenida (macetas/olivos)",
        ]
        yy = y - 150
        c.setFont(self.fonts["sans"], 9)
        c.setFillColor(INK)
        for t in tips:
            c.drawString(40, yy, "•  " + t)
            yy -= 16

    def _floor_page(self, floor: FloorPlan):
        w, h = self._new_page(self.plan_size, "Plano · " + floor.level, floor.name)
        c = self.c

        # área de dibujo
        bbox = floor.building_bbox or (0, 0, 128, 128)
        bx, by, bw, bh = bbox
        # margen interior
        left, right, bottom, top = 40, 210, 50, 70
        avail_w = w - left - right
        avail_h = h - bottom - top - 48
        scale = min(avail_w / bw, avail_h / bh)
        # origen de dibujo (SW)
        ox = left + (avail_w - bw * scale) / 2
        oy = bottom + 20

        draw_grid(c, ox, oy, bw, bh, scale, major_every=10 if bw >= 80 else 5)

        # convertir rooms a coords relativas al bbox
        rel_rooms = []
        for r in floor.rooms:
            rr = type(r)(
                x=r.x - bx,
                y=r.y - by,
                w=r.w,
                h=r.h,
                name=r.name,
                use=r.use,
                code=r.code,
                note=r.note,
                show_dims=r.show_dims,
            )
            # clip soft: only draw if intersects bbox
            if rr.x + rr.w < 0 or rr.y + rr.h < 0 or rr.x > bw or rr.y > bh:
                continue
            rel_rooms.append(rr)

        draw_rooms(c, rel_rooms, ox, oy, scale, bh)
        draw_north_arrow(c, ox + bw * scale - 24, oy + bh * scale - 30, 26)
        draw_scale_bar(c, ox, oy - 28, meters=10 if bw < 90 else 20, scale_pt_per_m=scale)

        # panel derecho
        px = w - 195
        py = h - 80
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 11)
        c.drawString(px, py, "Información de planta")
        py -= 14
        c.setFont(self.fonts["sans"], 8)
        c.setFillColor(INK)
        c.drawString(px, py, f"Nivel: {floor.level}")
        py -= 12
        c.drawString(px, py, f"Ventana mapa: {bw:.0f}×{bh:.0f} m")
        py -= 12
        c.drawString(px, py, f"Origen ventana (SW): x={bx:.0f}, y={by:.0f}")
        py -= 18

        uses = sorted({r.use for r in floor.rooms})
        py = draw_use_legend(c, px, py, uses) - 10

        c.setFillColor(NAVY)
        c.setFont(self.fonts["sans_bold"], 8)
        c.drawString(px, py, "Notas")
        py -= 12
        c.setFont(self.fonts["sans"], 7.5)
        c.setFillColor(INK)
        for note in floor.notes:
            py = self._wrap_text("• " + note, px, py, 170, 10, size=7.5) - 4

        # cotas globales
        c.setFillColor(MUTED)
        c.setFont(self.fonts["sans"], 7)
        c.drawString(left, 32, "Coordenadas en metros · origen SW del lote completo (0,0) · Norte arriba")

    def _inventario(self):
        w, h = self._new_page(self.cover_size, "04 · Inventario", "Habitaciones y tipologías")
        c = self.c
        x, y = 36, h - 78
        c.setFillColor(INK)
        c.setFont(self.fonts["sans"], 9)
        c.drawString(x, y, f"Total llaves: {self.h['llaves']}  ·  Baño en suite en todas  ·  Medidas útiles objetivo")
        y -= 22

        # table header
        cols = [x, x + 130, x + 175, x + 210]
        c.setFillColor(NAVY)
        c.rect(x - 4, y - 4, w - 68, 18, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont(self.fonts["sans_bold"], 8)
        c.drawString(cols[0], y, "Tipología")
        c.drawString(cols[1], y, "m² útiles")
        c.drawString(cols[2], y, "Uds.")
        c.drawString(cols[3], y, "Notas")
        y -= 20

        c.setFont(self.fonts["sans"], 8)
        for i, row in enumerate(self.h["inventario"]):
            bg = STONE if i % 2 == 0 else PAPER
            c.setFillColor(bg)
            c.rect(x - 4, y - 4, w - 68, 18, stroke=0, fill=1)
            c.setFillColor(INK)
            c.drawString(cols[0], y, row["tipo"])
            c.drawString(cols[1], y, str(row["m2_util"]))
            c.drawString(cols[2], y, str(row["ud"]))
            c.drawString(cols[3], y, row["notas"][:55])
            y -= 18

        y -= 16
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x, y, "Criterios de medida (Hometopia)")
        y -= 16
        rules = [
            "Casilla base = 1×1 m. Muros interiores ≈ 1 casilla cuando sea necesario para puertas.",
            "Pasillo habitaciones = 2,5 m (nunca < 2 m).",
            "Deluxe: módulo típico 5×12 m brutos (estancia + baño + frente). Útiles ~28–32 m².",
            "Junior Suite: módulo 7×12 m brutos · útiles ~42 m².",
            "Balcón sur: franja de 2 m continua en plantas tipo.",
            "Accesible: radio de giro ~1,5 m en estancia y baño; puerta ≥ 2 casillas libres de muro.",
        ]
        c.setFont(self.fonts["sans"], 8.5)
        c.setFillColor(INK)
        for r in rules:
            y = self._wrap_text("• " + r, x, y, w - 72, 11, size=8.5) - 3

    def _superficies_materiales(self):
        w, h = self._new_page(self.cover_size, "05 · Superficies & materiales", "Cuadro y acabados")
        c = self.c
        x, y = 36, h - 78
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x, y, "Cuadro de superficies")
        y -= 18
        for name, area in self.h["superficies"]:
            c.setFillColor(INK)
            c.setFont(self.fonts["sans"], 9)
            c.drawString(x, y, name)
            c.drawRightString(w - 40, y, f"{area:,.0f} m²".replace(",", "."))
            y -= 8
            c.setStrokeColor(RULE)
            c.line(x, y, w - 40, y)
            y -= 12

        y -= 10
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x, y, "Materiales y estilo decorativo")
        y -= 16
        c.setFont(self.fonts["sans"], 9)
        c.setFillColor(INK)
        for m in self.h["materiales"]:
            y = self._wrap_text("◆  " + m, x, y, w - 72, 12, size=9) - 4

    def _guia_hometopia(self):
        w, h = self._new_page(self.cover_size, "06 · Guía Hometopia", "Fases, assets y checklist")
        c = self.c
        x, y = 36, h - 78
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x, y, "Fases de construcción")
        y -= 16
        c.setFont(self.fonts["sans"], 9)
        c.setFillColor(INK)
        for i, fase in enumerate(self.h["fases_construccion"], 1):
            y = self._wrap_text(f"{i}. {fase}", x, y, w - 72, 12, size=9) - 4

        y -= 14
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 12)
        c.drawString(x, y, "Assets / mobiliario sugerido (vanilla)")
        y -= 16
        c.setFont(self.fonts["sans"], 9)
        c.setFillColor(INK)
        for a in self.h["assets_hometopia"]:
            y = self._wrap_text("• " + a, x, y, w - 72, 12, size=9) - 3

        y -= 14
        c.setFillColor(STONE)
        c.roundRect(x - 4, 40, w - 64, y - 20, 6, stroke=0, fill=1)
        c.setFillColor(NAVY)
        c.setFont(self.fonts["serif"], 11)
        c.drawString(x + 10, y - 10, "Checklist final")
        checks = [
            "Norte del plano = norte del solar en juego",
            "Rejilla mental 1 m respetada en muros y pasillos",
            "Núcleos verticales alineados en todas las plantas",
            "PB social completa antes de subir habitaciones",
            "Rooftop como remate visual (gancho Belle Étoile)",
            "Paleta navy/gold/teal coherente en decoración",
        ]
        yy = y - 28
        c.setFont(self.fonts["sans"], 8.5)
        c.setFillColor(INK)
        for ch in checks:
            c.drawString(x + 12, yy, "☐  " + ch)
            yy -= 14

    # --- helpers ----------------------------------------------------------
    def _wrap_text(self, text, x, y, max_w, leading, font=None, size=9, color=None) -> float:
        c = self.c
        font = font or self.fonts["sans"]
        if color is not None:
            c.setFillColor(color)
        c.setFont(font, size)
        words = text.split()
        line = ""
        for word in words:
            trial = (line + " " + word).strip()
            if c.stringWidth(trial, font, size) <= max_w:
                line = trial
            else:
                c.drawString(x, y, line)
                y -= leading
                line = word
        if line:
            c.drawString(x, y, line)
            y -= leading
        return y


def generate_hotel_pdf(hotel: dict[str, Any], output: Path) -> Path:
    return HotelPDF(hotel, output).build()
