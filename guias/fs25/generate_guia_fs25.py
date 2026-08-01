#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera la Guía Completa FS25 en PDF (500 pasos × 2 páginas exactas)."""

from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent.parent))

from guias.fs25.assets.illustrations import make, pregenerate_all  # noqa: E402
from guias.fs25.content.steps_data import CHAPTERS, DLC_LIST, build_all_steps  # noqa: E402

OUT_PDF = ROOT / "Guia_FS25_500_Pasos.pdf"
ART_PDF = Path("/opt/cursor/artifacts/Guia_FS25_500_Pasos.pdf")

C_GREEN = HexColor("#1B4332")
C_GREEN2 = HexColor("#2D6A4F")
C_SAGE = HexColor("#74A57F")
C_GOLD = HexColor("#D4A017")
C_SKY = HexColor("#4A90A4")
C_PAPER = HexColor("#F2F5F3")
C_INK = HexColor("#212529")
C_MUTED = HexColor("#5C6770")
C_ROW = HexColor("#E7EEE9")
C_WARN = HexColor("#9B2226")
C_CARD = HexColor("#FFFFFF")
C_TIP = HexColor("#E8F1EA")
C_NEXT = HexColor("#E6F0F5")

PAGE_W, PAGE_H = A4
MARGIN_L = 14 * mm
MARGIN_R = 14 * mm
MARGIN_T = 18 * mm
MARGIN_B = 14 * mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R


def wrap_text(c: canvas.Canvas, text: str, font: str, size: float, max_width: float) -> list[str]:
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


def draw_header_footer(c: canvas.Canvas, page_no: int):
    c.setFillColor(C_GREEN)
    c.rect(0, PAGE_H - 12 * mm, PAGE_W, 12 * mm, fill=1, stroke=0)
    c.setFillColor(C_GOLD)
    c.rect(0, PAGE_H - 13 * mm, PAGE_W, 1 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(MARGIN_L, PAGE_H - 7.5 * mm, "Guía Completa Farming Simulator 25")
    c.setFont("Helvetica", 7.5)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 7.5 * mm, "Base + todos los DLC · Sin mods · Español")

    c.setFillColor(C_PAPER)
    c.rect(0, 0, PAGE_W, 10 * mm, fill=1, stroke=0)
    c.setStrokeColor(C_SAGE)
    c.setLineWidth(0.5)
    c.line(MARGIN_L, 10 * mm, PAGE_W - MARGIN_R, 10 * mm)
    c.setFillColor(C_MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(MARGIN_L, 4 * mm, "Zielonka → Kinlaig → Catuaí · Economía normal · Empezar de cero")
    c.drawRightString(PAGE_W - MARGIN_R, 4 * mm, f"Pág. {page_no}")


def draw_label(c, x, y, w, text, color=C_GREEN2, h=6.2 * mm):
    c.setFillColor(color)
    c.roundRect(x, y - h + 1.5 * mm, w, h, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 3 * mm, y - 3.2 * mm, text)
    return y - h - 1.5 * mm


def draw_paragraph(c, text, x, y, max_w, font="Helvetica", size=8.5, leading=11, color=C_INK, max_lines=12):
    c.setFillColor(color)
    c.setFont(font, size)
    lines = wrap_text(c, text, font, size, max_w)
    for i, line in enumerate(lines[:max_lines]):
        c.drawString(x, y, line)
        y -= leading
    if len(lines) > max_lines:
        c.drawString(x, y, "…")
        y -= leading
    return y


def draw_table(c, x, y, col_widths, headers, rows, row_h=5.2 * mm, max_rows=8):
    total_w = sum(col_widths)
    # header
    c.setFillColor(C_GREEN2)
    c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 7)
    cx = x
    for i, h in enumerate(headers):
        c.drawString(cx + 2 * mm, y - row_h + 1.6 * mm, str(h)[:40])
        cx += col_widths[i]
    y -= row_h
    c.setFont("Helvetica", 7)
    for r_i, row in enumerate(rows[:max_rows]):
        c.setFillColor(C_ROW if r_i % 2 else C_CARD)
        c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(C_SAGE)
        c.setLineWidth(0.3)
        c.rect(x, y - row_h, total_w, row_h, fill=0, stroke=1)
        c.setFillColor(C_INK)
        cx = x
        for i, cell in enumerate(row):
            txt = str(cell)
            while c.stringWidth(txt, "Helvetica", 7) > col_widths[i] - 3 * mm and len(txt) > 3:
                txt = txt[:-2] + "…"
            c.drawString(cx + 1.5 * mm, y - row_h + 1.6 * mm, txt)
            cx += col_widths[i]
        y -= row_h
    return y - 1.5 * mm


def draw_box(c, x, y, w, h, fill, stroke=None):
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(0.8)
        c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
    else:
        c.roundRect(x, y, w, h, 4, fill=1, stroke=0)


def draw_cover(c: canvas.Canvas):
    c.setFillColor(C_GREEN)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(C_GREEN2)
    c.rect(0, PAGE_H * 0.42, PAGE_W, PAGE_H * 0.16, fill=1, stroke=0)
    c.setFillColor(C_GOLD)
    c.rect(0, PAGE_H * 0.42 - 2.5 * mm, PAGE_W, 2.5 * mm, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 35 * mm, "FARMING SIMULATOR 25")
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 48 * mm, "GUÍA COMPLETA EN 500 PASOS")

    c.setFont("Helvetica", 10)
    lines = [
        "Partida desde cero · Economía normal · Un jugador · PC",
        "Mapa base: Zielonka · Expansiones: Kinlaig y Catuaí",
        "Contenido oficial + todos los DLC · Sin mods · Español",
        "Cada paso = 2 páginas detalladas con tablas e ilustraciones",
    ]
    y = PAGE_H - 68 * mm
    for line in lines:
        c.drawCentredString(PAGE_W / 2, y, line)
        y -= 6 * mm

    img = make("portada")
    iw, ih = 105 * mm, 140 * mm
    c.drawImage(img, (PAGE_W - iw) / 2, 28 * mm, width=iw, height=ih, mask="auto")
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(PAGE_W / 2, 18 * mm, "Progresión mixta: contratos → campos → forraje → animales → fábricas → DLC → mapas expansion")
    c.showPage()


def draw_intro_pages(c: canvas.Canvas, start_page: int = 2) -> int:
    """2 páginas de introducción. Devuelve el siguiente número de página."""
    page = start_page

    # Intro page 1
    draw_header_footer(c, page)
    y = PAGE_H - MARGIN_T - 2 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "CÓMO USAR ESTA GUÍA", C_GREEN, 7 * mm)
    y -= 2 * mm
    intro = (
        "Esta guía está pensada para PC, con experiencia en FS anteriores, modo Empezar de cero, "
        "economía normal, un jugador, sin mods, con todos los DLC oficiales. El mapa de aprendizaje "
        "principal es Zielonka (2×2 km, Europa Central): campos rectangulares, rutas cortas, 9 producciones "
        "y granjas con potencial ganadero. Más adelante abrirás Kinlaig (Highlands Fishing) y Catuaí "
        "(Beans & Alpacas). Hay 500 pasos; cada uno ocupa exactamente 2 páginas."
    )
    y = draw_paragraph(c, intro, MARGIN_L, y, CONTENT_W, size=9, leading=12, max_lines=8)
    y -= 3 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "REGLAS DE ORO", C_GOLD)
    y -= 1 * mm
    rules = [
        "1) No compres máquina sin uso repetido previsto (alquila en contratos al inicio).",
        "2) Mira siempre el historial de precios antes de vender lotes grandes.",
        "3) Mantén colchón para semillas + abono + combustible de al menos un ciclo.",
        "4) El HUD de campo (cal, abono, hierbas) no es opcional si quieres máximo rendimiento.",
        "5) Expande hectáreas solo si tu logística de cosecha (remolques) aguanta el pico.",
        "6) Forraje estable ANTES de vacas. Gallinas primero. Procesado después de cash flow.",
        "7) Los DLC anchos (NEXAT, Plains) llegan cuando ya tienes bloques grandes.",
    ]
    for r in rules:
        y = draw_paragraph(c, r, MARGIN_L, y, CONTENT_W, size=8.5, leading=11, max_lines=2)
        y -= 0.8 * mm

    y -= 2 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "CAPÍTULOS (500 PASOS)")
    y -= 1 * mm
    rows = [(f"{a}–{b}", name) for a, b, name, _ in CHAPTERS]
    y = draw_table(c, MARGIN_L, y, [28 * mm, CONTENT_W - 28 * mm], ["Pasos", "Capítulo"], rows, max_rows=14)
    c.showPage()
    page += 1

    # Intro page 2
    draw_header_footer(c, page)
    y = PAGE_H - MARGIN_T - 2 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "DLC OFICIALES CUBIERTOS", C_SKY, 7 * mm)
    y -= 1 * mm
    y = draw_table(
        c, MARGIN_L, y, [58 * mm, CONTENT_W - 58 * mm],
        ["DLC", "Contenido clave"], DLC_LIST, row_h=5.4 * mm, max_rows=12,
    )
    y -= 3 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "ESTRUCTURA DE CADA PASO", C_GREEN2)
    y -= 1 * mm
    struct = [
        "Página A — Objetivo, contexto, procedimiento numerado paso a paso y tip rápido.",
        "Página B — Tablas de maquinaria y economía, checklist, errores, consejos, esquema visual y avance.",
        "Los datos de precios/rendimientos son orientativos (economía normal). Confirma siempre en el menú del juego.",
        "No saltes capítulos enteros: la guía asume hábitos, flota y colchón del bloque anterior.",
    ]
    for s in struct:
        y = draw_paragraph(c, "• " + s, MARGIN_L, y, CONTENT_W, size=8.5, leading=11, max_lines=3)
        y -= 1 * mm

    y -= 2 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "MAPA RECOMENDADO: ZIELONKA", C_GREEN)
    y -= 1 * mm
    y = draw_paragraph(
        c,
        "Elegido porque equilibras mezcla (cereal, animales, producciones, forestal) empezando sin nada. "
        "Campos fáciles de unir, distancias cortas y curva de progreso limpia hacia maquinaria DLC ancha. "
        "Kinlaig y Catuaí se abordan en los capítulos finales como operaciones adicionales.",
        MARGIN_L, y, CONTENT_W, size=8.5, leading=11, max_lines=5,
    )
    y -= 3 * mm
    try:
        c.drawImage(make("mapa"), MARGIN_L, max(MARGIN_B + 4 * mm, y - 42 * mm), width=CONTENT_W, height=40 * mm, mask="auto")
    except Exception:
        pass
    c.showPage()
    return page + 1


def draw_step_page_a(c: canvas.Canvas, step: dict, page_no: int):
    draw_header_footer(c, page_no)
    y = PAGE_H - MARGIN_T - 1 * mm

    # step header band
    draw_box(c, MARGIN_L, y - 16 * mm, CONTENT_W, 16 * mm, C_CARD, C_SAGE)
    c.setFillColor(C_GOLD)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN_L + 3 * mm, y - 7 * mm, f"PASO {step['n']:03d}")
    c.setFillColor(C_MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(PAGE_W - MARGIN_R - 3 * mm, y - 5 * mm, step["capitulo"])
    c.setFillColor(C_GREEN)
    c.setFont("Helvetica-Bold", 11)
    title_lines = wrap_text(c, step["titulo"], "Helvetica-Bold", 11, CONTENT_W - 8 * mm)
    c.drawString(MARGIN_L + 3 * mm, y - 13 * mm, title_lines[0][:90])
    y -= 19 * mm

    if step.get("nota_dlc"):
        y = draw_label(c, MARGIN_L, y, CONTENT_W, f"DLC: {step['nota_dlc']}", C_SKY, 5.8 * mm)
        y -= 1 * mm

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "OBJETIVO", C_GOLD)
    y -= 0.5 * mm
    y = draw_paragraph(c, step["objetivo"], MARGIN_L, y, CONTENT_W, size=8.7, leading=11.2, max_lines=3)
    y -= 2 * mm

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "CONTEXTO Y POR QUÉ IMPORTA", C_GREEN)
    y -= 0.5 * mm
    y = draw_paragraph(c, step["contexto"], MARGIN_L, y, CONTENT_W, size=8.3, leading=10.8, max_lines=5)
    y -= 2.2 * mm

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "PROCEDIMIENTO DETALLADO (HAZLO EN ESTE ORDEN)", C_GREEN2)
    y -= 1 * mm
    proc = step.get("procedimiento") or []
    # enrich with extra actionable lines if short
    extra_lines = [
        f"Checkpoint: confirma que el mes de juego y tu liquidez permiten ejecutar «{step['titulo']}».",
        "Si algo sale mal (atasco, máquina rota, precio hundido), pausa, guarda y corrige antes de seguir gastando.",
        "Al cerrar el paso, actualiza tu bloc: dinero, ha, animales, cadenas activas y próximo cuello de botella.",
    ]
    full_proc = list(proc) + extra_lines
    for i, item in enumerate(full_proc[:14], 1):
        y = draw_paragraph(
            c, f"{i}. {item}", MARGIN_L, y, CONTENT_W,
            font="Helvetica", size=7.9, leading=10.2, max_lines=2,
        )
        y -= 0.4 * mm
        if y < MARGIN_B + 28 * mm:
            break

    # tip box fixed near bottom
    tip = (step.get("consejos") or ["Guarda antes de cada gasto grande."])[0]
    box_h = 16 * mm
    box_y = MARGIN_B + 4 * mm
    draw_box(c, MARGIN_L, box_y, CONTENT_W, box_h, C_TIP, C_SAGE)
    c.setFillColor(C_GREEN2)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(MARGIN_L + 3 * mm, box_y + box_h - 5 * mm, "TIP RÁPIDO")
    draw_paragraph(c, tip, MARGIN_L + 3 * mm, box_y + box_h - 10 * mm, CONTENT_W - 6 * mm, size=8, leading=10, max_lines=2)
    c.showPage()


def draw_step_page_b(c: canvas.Canvas, step: dict, page_no: int):
    draw_header_footer(c, page_no)
    y = PAGE_H - MARGIN_T - 1 * mm

    c.setFillColor(C_GREEN)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(MARGIN_L, y, f"Paso {step['n']:03d} · Ficha operativa")
    y -= 3 * mm
    c.setFillColor(C_MUTED)
    c.setFont("Helvetica", 7.5)
    tlines = wrap_text(c, step["titulo"], "Helvetica", 7.5, CONTENT_W)
    c.drawString(MARGIN_L, y, tlines[0])
    y -= 5 * mm

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "MAQUINARIA / HERRAMIENTAS")
    y -= 0.5 * mm
    maq = step.get("maquinaria") or [("—", "—", "—")]
    y = draw_table(
        c, MARGIN_L, y,
        [62 * mm, 38 * mm, CONTENT_W - 100 * mm],
        ["Equipo", "Adquisición", "Notas"], maq, max_rows=5,
    )

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "ECONOMÍA Y NÚMEROS", C_GOLD)
    y -= 0.5 * mm
    eco = step.get("economia") or [("—", "—", "—")]
    y = draw_table(
        c, MARGIN_L, y,
        [55 * mm, 42 * mm, CONTENT_W - 97 * mm],
        ["Concepto", "Valor / rango", "Comentario"], eco, max_rows=5,
    )

    if step.get("tabla_extra"):
        title = (step.get("tabla_extra_titulo") or "REFERENCIA").upper()[:48]
        y = draw_label(c, MARGIN_L, y, CONTENT_W, title, C_SKY)
        y -= 0.5 * mm
        extra = []
        for row in step["tabla_extra"][:6]:
            if isinstance(row, (list, tuple)) and len(row) >= 2:
                extra.append((row[0], row[1]))
            else:
                extra.append((str(row), ""))
        y = draw_table(
            c, MARGIN_L, y,
            [55 * mm, CONTENT_W - 55 * mm],
            ["Elemento", "Detalle"], extra, max_rows=6,
        )

    # checklist + errors columns
    y -= 1 * mm
    col_w = (CONTENT_W - 4 * mm) / 2
    left_x = MARGIN_L
    right_x = MARGIN_L + col_w + 4 * mm
    y_left = draw_label(c, left_x, y, col_w, "CHECKLIST", C_GREEN2, 5.6 * mm)
    y_right = draw_label(c, right_x, y, col_w, "ERRORES A EVITAR", C_WARN, 5.6 * mm)
    y_left -= 0.5 * mm
    y_right -= 0.5 * mm
    for item in (step.get("checklist") or [])[:6]:
        y_left = draw_paragraph(c, f"☐ {item}", left_x, y_left, col_w, size=7.4, leading=9.5, max_lines=2)
    for item in (step.get("errores") or [])[:5]:
        y_right = draw_paragraph(c, f"• {item}", right_x, y_right, col_w, size=7.4, leading=9.5, max_lines=2)
    y = min(y_left, y_right) - 2 * mm

    y = draw_label(c, MARGIN_L, y, CONTENT_W, "CONSEJOS PRO", C_GREEN)
    y -= 0.5 * mm
    for tip in (step.get("consejos") or [])[:3]:
        y = draw_paragraph(c, f"★ {tip}", MARGIN_L, y, CONTENT_W, size=7.5, leading=9.6, max_lines=2)
        y -= 0.3 * mm

    # illustration
    y -= 1 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "ESQUEMA VISUAL", C_SKY, 5.4 * mm)
    img_h = 28 * mm
    img_y = max(MARGIN_B + 18 * mm, y - img_h - 1 * mm)
    try:
        c.drawImage(make(step.get("diagrama") or "flujo"), MARGIN_L, img_y, width=CONTENT_W, height=img_h, mask="auto")
    except Exception:
        pass

    # next box
    nxt = step.get("siguiente") or "Continúa al siguiente paso numerado."
    draw_box(c, MARGIN_L, MARGIN_B + 3 * mm, CONTENT_W, 12 * mm, C_NEXT, C_SKY)
    c.setFillColor(C_SKY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(MARGIN_L + 3 * mm, MARGIN_B + 11 * mm, "SIGUIENTE")
    draw_paragraph(c, nxt, MARGIN_L + 3 * mm, MARGIN_B + 6.5 * mm, CONTENT_W - 6 * mm, size=7.5, leading=9, max_lines=2)
    c.showPage()


def draw_epilogue(c: canvas.Canvas, page_no: int):
    draw_header_footer(c, page_no)
    y = PAGE_H - MARGIN_T - 2 * mm
    y = draw_label(c, MARGIN_L, y, CONTENT_W, "EPÍLOGO — PASO 500 COMPLETADO", C_GREEN, 7 * mm)
    y -= 2 * mm
    text = (
        "Has recorrido 500 pasos: del bolsillo vacío en Zielonka a un holding multi-mapa con cereal, forraje, "
        "animales, fábricas, forestal, cultivos especiales y DLC oficiales (MacDon, NEXAT, Plains & Prairies, "
        "Straw Harvest, Mercedes, Highlands Fishing, Vredo, SKY, Emergency, Beans & Alpacas, etc.). "
        "El método —contratos, colchón, HUD, precios, logística y ROI— es tu verdadero tractor principal. "
        "Guarda esta PDF junto a tus saves y úsala como checklist vivo. Ahora elige un reto libre: mega-bloque, "
        "100 vacas, café en Catuaí, flota NEXAT o imperio pesquero en Kinlaig."
    )
    y = draw_paragraph(c, text, MARGIN_L, y, CONTENT_W, size=9, leading=12, max_lines=10)
    y -= 4 * mm
    try:
        c.drawImage(make("imperio"), MARGIN_L, max(MARGIN_B + 20 * mm, y - 50 * mm), width=CONTENT_W, height=48 * mm, mask="auto")
    except Exception:
        pass
    c.setFillColor(C_MUTED)
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(PAGE_W / 2, MARGIN_B + 8 * mm, "Fin · Guía Completa FS25 · 500 pasos · Base + todos los DLC · Sin mods")
    c.showPage()


def build_pdf(output: Path = OUT_PDF, limit: int | None = None) -> Path:
    print("Generando ilustraciones...")
    pregenerate_all()
    print("Construyendo pasos...")
    steps = build_all_steps()
    if limit:
        steps = steps[:limit]
        print(f"Modo prueba: {limit} pasos")

    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=A4)
    c.setTitle("Guía Completa Farming Simulator 25 — 500 Pasos")
    c.setAuthor("Guía FS25")
    c.setSubject("Farming Simulator 25 guía completa con todos los DLC")

    print("Portada e introducción...")
    draw_cover(c)
    page = draw_intro_pages(c, start_page=2)

    total = len(steps)
    for i, step in enumerate(steps, 1):
        if i == 1 or i % 25 == 0 or i == total:
            print(f"  Paso {i}/{total} (páginas PDF ~{page}-{page+1})...")
        draw_step_page_a(c, step, page)
        page += 1
        draw_step_page_b(c, step, page)
        page += 1

    draw_epilogue(c, page)
    c.save()
    size_mb = output.stat().st_size / 1024 / 1024
    expected_pages = 1 + 2 + total * 2 + 1  # cover + intro2 + steps + epilogue
    print(f"PDF escrito: {output}")
    print(f"Tamaño: {size_mb:.1f} MB · Páginas esperadas: {expected_pages}")
    return output


if __name__ == "__main__":
    lim = None
    if len(sys.argv) > 1 and sys.argv[1].startswith("--limit="):
        lim = int(sys.argv[1].split("=", 1)[1])
    path = build_pdf(OUT_PDF, limit=lim)
    ART_PDF.parent.mkdir(parents=True, exist_ok=True)
    ART_PDF.write_bytes(path.read_bytes())
    print(f"Copia en artifacts: {ART_PDF}")
