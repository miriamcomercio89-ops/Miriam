# -*- coding: utf-8 -*-
"""Renderizado de volúmenes PDF por década."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from guias.tf2_iberica import criteria as C
from guias.tf2_iberica.content.planner import MonthPlan
from guias.tf2_iberica.pdf.diagrams import draw_metro_schematic
from guias.tf2_iberica.pdf.styles import (
    CONTENT_W,
    C_BRASS,
    C_BUS,
    C_CARD,
    C_CREAM,
    C_GRANATE,
    C_GRANATE_D,
    C_INK,
    C_METRO,
    C_MUTED,
    C_OK,
    C_PAPER,
    C_RAIL,
    C_ROW,
    C_SHIP,
    C_SLATE,
    C_SLATE_M,
    C_WARN,
    MARGIN_B,
    MARGIN_L,
    MARGIN_R,
    MARGIN_T,
    PAGE_H,
    PAGE_W,
    mode_color,
    register_fonts,
    wrap_text,
)


class VolumeRenderer:
    def __init__(self, path: Path, start_year: int, end_year: int):
        register_fonts()
        self.path = path
        self.start_year = start_year
        self.end_year = end_year
        self.c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H))
        self.page_no = 0
        self.vol_label = f"Vol. {start_year}–{end_year}"

    def _new_page(self):
        if self.page_no:
            self.c.showPage()
        self.page_no += 1
        # background
        self.c.setFillColor(C_PAPER)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        self._header_footer()

    def _header_footer(self):
        c = self.c
        c.setFillColor(C_GRANATE_D)
        c.rect(0, PAGE_H - 11 * mm, PAGE_W, 11 * mm, fill=1, stroke=0)
        c.setFillColor(C_BRASS)
        c.rect(0, PAGE_H - 12 * mm, PAGE_W, 1.1 * mm, fill=1, stroke=0)
        c.setFillColor(C_CREAM)
        c.setFont("Body-Bold", 8)
        c.drawString(MARGIN_L, PAGE_H - 7 * mm, C.TITLE)
        c.setFont("Body", 7.5)
        c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 7 * mm, self.vol_label)

        c.setFillColor(C_CREAM)
        c.rect(0, 0, PAGE_W, 9 * mm, fill=1, stroke=0)
        c.setStrokeColor(C_BRASS)
        c.setLineWidth(0.6)
        c.line(MARGIN_L, 9 * mm, PAGE_W - MARGIN_R, 9 * mm)
        c.setFillColor(C_MUTED)
        c.setFont("Body", 6.5)
        c.drawString(MARGIN_L, 3.5 * mm, "Transport Fever 2 · Realismo histórico · Economía real · Pausa cada mes")
        c.drawRightString(PAGE_W - MARGIN_R, 3.5 * mm, f"Pág. {self.page_no}")

    def draw_cover(self, decade_summary: list[str]):
        self._new_page()
        c = self.c
        # hero band
        c.setFillColor(C_GRANATE)
        c.rect(0, PAGE_H * 0.42, PAGE_W, PAGE_H * 0.58 - 11 * mm, fill=1, stroke=0)
        c.setFillColor(C_BRASS)
        c.rect(0, PAGE_H * 0.42, PAGE_W, 2.5 * mm, fill=1, stroke=0)

        c.setFillColor(C_CREAM)
        c.setFont("Display", 11)
        c.drawString(MARGIN_L, PAGE_H - 28 * mm, "TRANSPORT FEVER 2")
        c.setFont("Display-Bold", 28)
        lines = wrap_text(c, C.TITLE, "Display-Bold", 28, CONTENT_W - 10 * mm)
        y = PAGE_H - 42 * mm
        for line in lines:
            c.drawString(MARGIN_L, y, line)
            y -= 12 * mm
        c.setFont("Serif", 12)
        c.drawString(MARGIN_L, y - 2 * mm, C.SUBTITLE)
        c.setFont("Body", 10)
        c.drawString(MARGIN_L, PAGE_H * 0.42 + 10 * mm, self.vol_label)

        y = PAGE_H * 0.42 - 12 * mm
        c.setFillColor(C_SLATE)
        c.setFont("Display-Bold", 14)
        c.drawString(MARGIN_L, y, "Calendario-resumen de la década")
        y -= 8 * mm
        c.setFont("Body", 8)
        c.setFillColor(C_INK)
        for item in decade_summary[:18]:
            for wl in wrap_text(c, "• " + item, "Body", 8, CONTENT_W):
                c.drawString(MARGIN_L, y, wl)
                y -= 4.2 * mm
                if y < MARGIN_B + 15 * mm:
                    break
            if y < MARGIN_B + 15 * mm:
                break

        # color legend
        y = MARGIN_B + 18 * mm
        c.setFont("Body-Bold", 7)
        c.setFillColor(C_SLATE)
        c.drawString(MARGIN_L, y, "Leyenda de modos")
        y -= 5 * mm
        legend = [
            ("Ferrocarril", C_RAIL),
            ("Bus", C_BUS),
            ("Metro/Tranvía", C_METRO),
            ("Barco", C_SHIP),
        ]
        x = MARGIN_L
        for label, col in legend:
            c.setFillColor(col)
            c.circle(x + 2 * mm, y + 1 * mm, 2.2, fill=1, stroke=0)
            c.setFillColor(C_INK)
            c.setFont("Body", 7)
            c.drawString(x + 5 * mm, y, label)
            x += 40 * mm

    def draw_criteria_page(self):
        self._new_page()
        c = self.c
        y = PAGE_H - MARGIN_T - 4 * mm
        c.setFillColor(C_GRANATE)
        c.setFont("Display-Bold", 16)
        c.drawString(MARGIN_L, y, "Pliego de criterios (estricto)")
        y -= 8 * mm
        rows = [
            ("Dificultad", C.DIFFICULTY),
            ("Economía", C.ECONOMY),
            ("Hub principal", C.MAIN_HUB),
            ("Sub-hubs", ", ".join(C.SUB_HUBS)),
            ("Industrias", C.INDUSTRY_MOD),
            ("Nombres industria", C.INDUSTRY_NAMES),
            ("Vía", C.TRACK_GAUGE),
            ("Ampliación", f"al {int(C.OCCUPANCY_EXPAND*100)} % ocupación"),
            ("Bus urbano", C.FREQ["bus_urbano"]),
            ("Regional", C.FREQ["regional"]),
            ("AVE", C.FREQ["ave"]),
            ("Reinversión", f"{int(C.REINVEST_NEW*100)}/{int(C.REINVEST_FLEET*100)}/{int(C.REINVEST_MAINT*100)}"),
            ("Señales", C.SIGNALS_MECH_MOD),
            ("Vía/catenaria", C.TRACKS_MOD),
        ]
        for k, v in rows:
            c.setFillColor(C_ROW if rows.index((k, v)) % 2 == 0 else C_CARD)
            c.rect(MARGIN_L, y - 5.5 * mm, CONTENT_W, 6.2 * mm, fill=1, stroke=0)
            c.setFillColor(C_GRANATE)
            c.setFont("Body-Bold", 7.5)
            c.drawString(MARGIN_L + 2 * mm, y - 3.5 * mm, k)
            c.setFillColor(C_INK)
            c.setFont("Body", 7)
            vv = v
            while c.stringWidth(vv, "Body", 7) > CONTENT_W - 48 * mm and len(vv) > 4:
                vv = vv[:-2] + "…"
            c.drawString(MARGIN_L + 42 * mm, y - 3.5 * mm, vv)
            y -= 6.4 * mm

        y -= 6 * mm
        c.setFillColor(C_SLATE)
        c.setFont("Display-Bold", 11)
        c.drawString(MARGIN_L, y, "Cómo usar cada mes")
        y -= 6 * mm
        steps = [
            "Pausa el juego el día 1 del mes.",
            "Lee contexto, objetivos y descargas Workshop del mes (solo si son nuevas).",
            "Ejecuta construcción (andenes, longitudes, industrias con ubicación relativa).",
            "Crea/ajusta líneas y flota; pide préstamo si falta dinero.",
            "Marca el checklist y guarda como AAAA-MM.",
            "Reanuda hasta el siguiente mes.",
        ]
        c.setFont("Body", 8)
        c.setFillColor(C_INK)
        for i, s in enumerate(steps, 1):
            for wl in wrap_text(c, f"{i}. {s}", "Body", 8, CONTENT_W):
                c.drawString(MARGIN_L, y, wl)
                y -= 4.3 * mm

    def _section(self, title: str, y: float, color=None) -> float:
        c = self.c
        color = color or C_GRANATE
        c.setFillColor(color)
        c.roundRect(MARGIN_L, y - 5.2 * mm, CONTENT_W, 6.2 * mm, 2, fill=1, stroke=0)
        c.setFillColor(C_CREAM)
        c.setFont("Body-Bold", 8)
        c.drawString(MARGIN_L + 2.5 * mm, y - 3.6 * mm, title.upper())
        return y - 8 * mm

    def _bullets(self, items: list[str], y: float, max_y: float, icon_color=None) -> float:
        c = self.c
        icon_color = icon_color or C_BRASS
        for item in items:
            lines = wrap_text(c, item, "Body", 7.2, CONTENT_W - 6 * mm)
            need = len(lines) * 3.8 * mm + 1.2 * mm
            if y - need < max_y:
                return -1  # signal overflow
            c.setFillColor(icon_color)
            c.circle(MARGIN_L + 1.8 * mm, y - 1 * mm, 1.3, fill=1, stroke=0)
            c.setFillColor(C_INK)
            c.setFont("Body", 7.2)
            for wl in lines:
                c.drawString(MARGIN_L + 5 * mm, y - 1.5 * mm, wl)
                y -= 3.8 * mm
            y -= 1.0 * mm
        return y

    def draw_month(self, plan: MonthPlan, show_diagram: bool):
        self._new_page()
        c = self.c
        y = PAGE_H - MARGIN_T - 2 * mm
        max_y = MARGIN_B + 12 * mm

        # month banner
        c.setFillColor(C_GRANATE)
        c.roundRect(MARGIN_L, y - 16 * mm, CONTENT_W, 17 * mm, 3, fill=1, stroke=0)
        c.setFillColor(C_BRASS)
        c.rect(MARGIN_L, y - 16 * mm, 3.2 * mm, 17 * mm, fill=1, stroke=0)
        c.setFillColor(C_CREAM)
        c.setFont("Display-Bold", 15)
        c.drawString(MARGIN_L + 6 * mm, y - 7 * mm, plan.label)
        c.setFont("Body", 8)
        c.drawString(MARGIN_L + 6 * mm, y - 12.5 * mm, f"{plan.title}  ·  {plan.company}")
        y -= 20 * mm

        # context
        c.setFillColor(C_SLATE)
        c.setFont("Body-Bold", 8)
        c.drawString(MARGIN_L, y, "Contexto")
        y -= 4.5 * mm
        c.setFillColor(C_INK)
        c.setFont("Body", 7.5)
        for wl in wrap_text(c, plan.context, "Body", 7.5, CONTENT_W):
            c.drawString(MARGIN_L, y, wl)
            y -= 4 * mm
            if y < max_y:
                break
        y -= 2 * mm

        sections = [
            ("Objetivos", plan.objectives, C_GRANATE),
            ("Descargas Workshop (nuevas)", [self._mod_line(m) for m in plan.mods_new], C_WARN),
            ("Construcción e infraestructura", plan.construction, C_SLATE),
            ("Líneas y servicios", plan.lines, C_RAIL),
            ("Flota y material", plan.fleet, C_BRASS),
            ("Industrias y mercancías", plan.industries, C_OK),
            ("Presupuesto", plan.budget, C_SLATE_M),
            ("Checklist de cierre", plan.checklist, C_GRANATE),
        ]
        if plan.warnings:
            sections.append(("Avisos de incompatibilidad", plan.warnings, C_WARN))

        for title, items, col in sections:
            if not items:
                continue
            if y < max_y + 25 * mm:
                self._new_page()
                y = PAGE_H - MARGIN_T - 2 * mm
                c.setFillColor(C_MUTED)
                c.setFont("Body", 7)
                c.drawString(MARGIN_L, y, f"Continuación · {plan.label}")
                y -= 6 * mm
            y = self._section(title, y, col)
            y2 = self._bullets(items, y, max_y, col)
            if y2 < 0:
                self._new_page()
                y = PAGE_H - MARGIN_T - 2 * mm
                c.setFillColor(C_MUTED)
                c.setFont("Body", 7)
                c.drawString(MARGIN_L, y, f"Continuación · {plan.label} · {title}")
                y -= 6 * mm
                y = self._bullets(items, y, max_y, col)
            else:
                y = y2
            y -= 1.5 * mm

        if show_diagram and y > max_y + 55 * mm:
            draw_metro_schematic(c, MARGIN_L, y, CONTENT_W, 52 * mm, plan.diagram_hint or "", plan.year)

    @staticmethod
    def _mod_line(m: dict) -> str:
        name = m.get("name", "")
        wid = m.get("id", "")
        extra = m.get("stats") or m.get("note") or ""
        role = m.get("role")
        mode = m.get("mode")
        parts = [f"«{name}»"]
        if wid:
            parts.append(f"Steam id {wid}")
        if mode:
            parts.append(f"modo {mode}")
        if role:
            parts.append(str(role))
        if extra:
            parts.append(str(extra))
        return " — ".join(parts)

    def save(self):
        self.c.save()


def decade_summary(plans: list[MonthPlan]) -> list[str]:
    out = []
    for p in plans:
        if p.month == 1 or (p.year * 12 + p.month) % 17 == 0:
            out.append(f"{p.label}: {p.title}")
        for m in p.mods_new[:1]:
            out.append(f"{p.label}: descargar «{m['name']}»")
    # unique preserve order
    seen = set()
    uniq = []
    for x in out:
        if x not in seen:
            seen.add(x)
            uniq.append(x)
    return uniq[:22]


def render_volume(path: Path, plans: list[MonthPlan], start_year: int, end_year: int) -> int:
    r = VolumeRenderer(path, start_year, end_year)
    r.draw_cover(decade_summary(plans))
    r.draw_criteria_page()
    for i, plan in enumerate(plans):
        show_diag = plan.month == 1 or plan.month == 7
        r.draw_month(plan, show_diagram=show_diag)
    r.save()
    return r.page_no
