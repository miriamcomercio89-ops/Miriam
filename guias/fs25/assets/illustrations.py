# -*- coding: utf-8 -*-
"""Ilustraciones procedurales para la guía FS25."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent / "generated"
OUT.mkdir(parents=True, exist_ok=True)

GREEN = (27, 67, 50)
GREEN2 = (45, 106, 79)
SAGE = (116, 165, 127)
GOLD = (212, 160, 23)
SKY = (74, 144, 164)
SOIL = (121, 85, 72)
WHEAT = (218, 184, 90)
PAPER = (242, 245, 243)
WHITE = (255, 255, 255)
INK = (33, 37, 41)


def _canvas(w=900, h=360, bg=PAPER):
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    return img, d


def _banner(d, w, title_color=GREEN):
    d.rectangle([0, 0, w, 46], fill=title_color)
    d.rectangle([0, 46, w, 52], fill=GOLD)


@lru_cache(maxsize=32)
def make(kind: str) -> str:
    path = OUT / f"{kind}.png"
    if path.exists():
        return str(path)
    fn = {
        "flujo": draw_flujo,
        "mapa": draw_mapa,
        "contrato": draw_contrato,
        "ciclo": draw_ciclo,
        "suelo": draw_suelo,
        "expansion": draw_expansion,
        "logistica": draw_logistica,
        "forraje": draw_forraje,
        "animales": draw_animales,
        "produccion": draw_produccion,
        "forestal": draw_forestal,
        "especial": draw_especial,
        "dlc": draw_dlc,
        "kinlaig": draw_kinlaig,
        "imperio": draw_imperio,
        "portada": draw_portada,
        "icon_wheat": draw_icon_wheat,
    }.get(kind, draw_flujo)
    img = fn()
    img.save(path, "PNG", optimize=True)
    return str(path)


def draw_portada():
    img, d = _canvas(1200, 1600, GREEN)
    # cielo degradado simulado
    for y in range(0, 700):
        t = y / 700
        col = (
            int(27 + (135 - 27) * t),
            int(67 + (206 - 67) * t),
            int(50 + (235 - 50) * t),
        )
        d.line([(0, y), (1200, y)], fill=col)
    # colinas
    d.ellipse([-200, 520, 700, 1100], fill=GREEN2)
    d.ellipse([400, 560, 1400, 1200], fill=GREEN)
    # sol
    d.ellipse([860, 120, 1040, 300], fill=GOLD)
    # campo de surcos
    d.rectangle([0, 900, 1200, 1600], fill=SOIL)
    for i in range(0, 1200, 28):
        d.line([(i, 900), (i - 80, 1600)], fill=(101, 67, 54), width=3)
    # trigales
    for x in range(40, 1160, 18):
        h = 80 + (x * 3) % 40
        d.line([(x, 900), (x, 900 - h)], fill=WHEAT, width=3)
        d.ellipse([x - 4, 900 - h - 8, x + 4, 900 - h + 4], fill=GOLD)
    # tractor silueta
    d.rounded_rectangle([180, 780, 420, 900], radius=18, fill=(40, 40, 40))
    d.ellipse([190, 860, 270, 940], fill=(20, 20, 20))
    d.ellipse([330, 870, 400, 940], fill=(20, 20, 20))
    d.rectangle([300, 720, 380, 780], fill=(50, 50, 50))
    return img


def draw_flujo():
    img, d = _canvas()
    _banner(d, 900)
    boxes = [(40, 100, "PLAN"), (250, 100, "ACCIÓN"), (460, 100, "CONTROL"), (670, 100, "AHORRO")]
    for x, y, t in boxes:
        d.rounded_rectangle([x, y, x + 180, y + 120], radius=16, fill=WHITE, outline=GREEN2, width=3)
        d.rectangle([x, y, x + 180, y + 36], fill=GREEN2)
    for x in (220, 430, 640):
        d.polygon([(x, 150), (x + 20, 160), (x, 170)], fill=GOLD)
    # base path
    d.rounded_rectangle([40, 260, 860, 330], radius=12, fill=SAGE)
    return img


def draw_mapa():
    img, d = _canvas()
    _banner(d, 900, SKY)
    d.rectangle([40, 70, 860, 330], fill=(210, 228, 220), outline=GREEN, width=2)
    # campos
    fields = [(60, 90, 220, 180), (240, 90, 420, 200), (440, 90, 640, 170),
              (60, 200, 200, 310), (220, 220, 480, 310), (500, 190, 700, 310),
              (660, 90, 840, 180), (720, 200, 840, 310)]
    for i, (x1, y1, x2, y2) in enumerate(fields):
        d.rectangle([x1, y1, x2, y2], fill=WHEAT if i % 2 == 0 else SAGE, outline=GREEN2)
    # pueblo
    d.rectangle([470, 120, 530, 160], fill=(180, 80, 70))
    d.polygon([(460, 120), (500, 90), (540, 120)], fill=(120, 50, 40))
    # rio
    d.line([(100, 320), (300, 250), (500, 280), (800, 230)], fill=SKY, width=8)
    return img


def draw_contrato():
    img, d = _canvas()
    _banner(d, 900, (155, 34, 38))
    d.rounded_rectangle([60, 80, 840, 320], radius=18, fill=WHITE, outline=(155, 34, 38), width=3)
    for i, y in enumerate(range(110, 280, 36)):
        d.rectangle([90, y, 810, y + 22], fill=PAPER if i % 2 == 0 else (255, 244, 230))
    d.ellipse([700, 200, 800, 300], outline=GOLD, width=8)
    d.line([(730, 250), (760, 280), (790, 220)], fill=GREEN2, width=8)
    return img


def draw_ciclo():
    img, d = _canvas()
    _banner(d, 900)
    cx, cy, r = 450, 200, 110
    labels = ["LABOREO", "SIEMBRA", "ABONO", "COSECHA"]
    colors = [SOIL, SAGE, GOLD, WHEAT]
    for i, (lab, col) in enumerate(zip(labels, colors)):
        a0 = 90 + i * 90
        d.pieslice([cx - r, cy - r, cx + r, cy + r], a0, a0 + 88, fill=col, outline=GREEN)
    d.ellipse([cx - 48, cy - 48, cx + 48, cy + 48], fill=WHITE)
    return img


def draw_suelo():
    img, d = _canvas()
    _banner(d, 900, SOIL)
    layers = [(70, SOIL), (130, (141, 110, 99)), (190, (160, 140, 90)), (250, SAGE), (300, WHEAT)]
    y = 70
    for h, col in layers:
        d.rectangle([40, y, 860, y + 48], fill=col)
        y += 48
    for x in range(60, 840, 40):
        d.ellipse([x, 300, x + 16, 320], fill=GOLD)
    return img


def draw_expansion():
    img, d = _canvas()
    _banner(d, 900, GREEN2)
    for i, x in enumerate((50, 250, 450, 650)):
        size = 120 + i * 20
        d.rectangle([x, 100, x + size, 280], fill=SAGE if i < 3 else WHEAT, outline=GREEN, width=2)
        if i:
            d.line([x - 20, 190, x, 190], fill=GOLD, width=6)
    return img


def draw_logistica():
    img, d = _canvas()
    _banner(d, 900, SKY)
    d.rectangle([50, 200, 850, 230], fill=(90, 90, 90))
    # silo
    d.rectangle([80, 90, 160, 200], fill=(200, 200, 200), outline=GREEN)
    d.ellipse([80, 70, 160, 110], fill=(180, 180, 180))
    # truck
    d.rounded_rectangle([300, 150, 520, 210], radius=8, fill=(40, 60, 90))
    d.rectangle([520, 165, 580, 210], fill=(30, 30, 30))
    d.ellipse([330, 200, 380, 250], fill=(20, 20, 20))
    d.ellipse([470, 200, 520, 250], fill=(20, 20, 20))
    d.ellipse([540, 200, 580, 245], fill=(20, 20, 20))
    # market
    d.rectangle([700, 110, 820, 200], fill=(180, 80, 70))
    d.polygon([(690, 110), (760, 70), (830, 110)], fill=GOLD)
    return img


def draw_forraje():
    img, d = _canvas()
    _banner(d, 900, (92, 128, 1))
    d.rectangle([40, 70, 860, 330], fill=(196, 220, 160))
    for x in range(50, 850, 12):
        d.line([(x, 250), (x + 3, 120)], fill=GREEN2, width=2)
    # bales
    for i, x in enumerate((120, 220, 320)):
        d.ellipse([x, 240, x + 70, 300], fill=WHEAT, outline=GOLD, width=3)
    d.rectangle([500, 180, 780, 300], fill=SOIL)
    d.rectangle([500, 160, 780, 185], fill=(60, 60, 60))
    return img


def draw_animales():
    img, d = _canvas()
    _banner(d, 900, (155, 34, 38))
    d.rectangle([40, 80, 860, 320], fill=(235, 222, 200))
    # barn
    d.rectangle([80, 140, 280, 280], fill=(160, 70, 60))
    d.polygon([(70, 140), (180, 80), (290, 140)], fill=(100, 40, 35))
    # animals simple
    for x in (360, 460, 560):
        d.ellipse([x, 200, x + 70, 250], fill=(90, 90, 90))
        d.ellipse([x + 50, 190, x + 85, 225], fill=(70, 70, 70))
    for x in (680, 740, 800):
        d.ellipse([x, 230, x + 30, 260], fill=(240, 240, 240), outline=(200, 200, 200))
    return img


def draw_produccion():
    img, d = _canvas()
    _banner(d, 900, (187, 62, 3))
    # factory
    d.rectangle([80, 140, 320, 300], fill=(120, 120, 130))
    d.rectangle([120, 80, 160, 140], fill=(90, 90, 100))
    d.rectangle([200, 60, 240, 140], fill=(90, 90, 100))
    d.ellipse([110, 40, 170, 90], fill=(180, 180, 180))
    d.ellipse([190, 20, 250, 80], fill=(180, 180, 180))
    # arrows and pallets
    d.polygon([(340, 200), (400, 180), (400, 220)], fill=GOLD)
    for i, x in enumerate((430, 520, 610)):
        d.rectangle([x, 180, x + 70, 250], fill=WHEAT if i % 2 == 0 else SAGE, outline=GREEN)
    d.polygon([(700, 200), (760, 180), (760, 220)], fill=GOLD)
    d.rectangle([780, 150, 860, 280], fill=(180, 80, 70))
    return img


def draw_forestal():
    img, d = _canvas()
    _banner(d, 900, (61, 64, 91))
    d.rectangle([0, 260, 900, 360], fill=SOIL)
    for x in (80, 160, 240, 320, 400):
        d.rectangle([x + 20, 160, x + 40, 270], fill=(90, 60, 40))
        d.ellipse([x, 80, x + 60, 180], fill=GREEN2)
    d.rectangle([520, 200, 820, 250], fill=(100, 70, 40))
    d.ellipse([540, 230, 600, 290], fill=(30, 30, 30))
    d.ellipse([760, 230, 820, 290], fill=(30, 30, 30))
    return img


def draw_especial():
    img, d = _canvas()
    _banner(d, 900, (106, 153, 78))
    colors = [(230, 120, 80), (240, 200, 80), (120, 180, 90), (200, 90, 90), (160, 100, 180)]
    for i, col in enumerate(colors):
        x = 50 + i * 170
        d.rounded_rectangle([x, 90, x + 150, 300], radius=20, fill=col)
        d.rectangle([x + 20, 200, x + 130, 280], fill=WHITE)
    return img


def draw_dlc():
    img, d = _canvas()
    _banner(d, 900, (0, 119, 182))
    for i in range(6):
        x = 40 + (i % 3) * 290
        y = 80 + (i // 3) * 130
        d.rounded_rectangle([x, y, x + 270, y + 110], radius=14, fill=WHITE, outline=(0, 119, 182), width=3)
        d.rectangle([x, y, x + 18, y + 110], fill=GOLD)
    return img


def draw_kinlaig():
    img, d = _canvas()
    _banner(d, 900, (2, 62, 138))
    # hills + sea
    for y in range(70, 200):
        d.line([(0, y), (900, y)], fill=(120 + y // 3, 160 + y // 5, 200))
    d.ellipse([-100, 140, 500, 360], fill=GREEN2)
    d.ellipse([300, 160, 1000, 400], fill=GREEN)
    d.rectangle([0, 250, 900, 360], fill=SKY)
    for x in range(0, 900, 30):
        d.arc([x, 260, x + 40, 300], 0, 180, fill=WHITE, width=2)
    # boat
    d.polygon([(600, 280), (720, 280), (700, 310), (620, 310)], fill=(40, 40, 40))
    d.rectangle([650, 230, 665, 280], fill=(80, 50, 30))
    return img


def draw_imperio():
    img, d = _canvas()
    _banner(d, 900, (55, 6, 23))
    # trophy / crown farm
    d.polygon([(450, 80), (500, 140), (480, 140), (520, 210), (380, 210), (420, 140), (400, 140)], fill=GOLD)
    d.rectangle([100, 230, 800, 310], fill=GREEN2)
    for x in (150, 300, 450, 600, 720):
        d.rectangle([x, 190, x + 50, 230], fill=SAGE)
    return img


def draw_icon_wheat():
    img, d = _canvas(256, 256, WHITE)
    d.rectangle([0, 0, 256, 256], fill=GREEN)
    for i in range(7):
        x = 128
        y1 = 220 - i * 18
        d.line([(x, 230), (x, 40)], fill=WHEAT, width=6)
        d.ellipse([x - 14, 40 + i * 8, x + 14, 70 + i * 8], fill=GOLD)
    return img


def pregenerate_all():
    kinds = [
        "flujo", "mapa", "contrato", "ciclo", "suelo", "expansion", "logistica",
        "forraje", "animales", "produccion", "forestal", "especial", "dlc",
        "kinlaig", "imperio", "portada", "icon_wheat",
    ]
    return {k: make(k) for k in kinds}


if __name__ == "__main__":
    paths = pregenerate_all()
    print(f"Generadas {len(paths)} ilustraciones en {OUT}")
