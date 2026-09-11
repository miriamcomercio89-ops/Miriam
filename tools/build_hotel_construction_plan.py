#!/usr/bin/env python3
"""Horizon Hotels — Plan de Construcción Real (etapas y fases).

El plan de construcción del grupo hotelero: un único calendario de obra con
las 50 marcas de Horizon Hotels mezcladas, dividido en tantas **etapas** como
hagan falta para cubrir el mundo — cada etapa consta de **1.000 hoteles** y se
divide, a su vez, en **20 fases de 50 hoteles** cada una (un PDF por fase,
organizados en una carpeta por etapa). Misma estructura que el plan de
construcción de Horizon Restaurant Group, adaptada a un mundo hotelero mucho
más concentrado en ciudades y zonas turísticas reales (~150.000-300.000
hoteles en total, casi ausente en pueblos pequeños sin ningún atractivo).

Orden de apertura (determinista, sin variedad aleatoria):

  1. Marbella (Málaga) — el primer hotel del plan, sede fundacional del grupo
     hotelero (destino turístico real de referencia en la Costa del Sol).
  2. Un resumen muy corto del resto de la provincia de Málaga: sus municipios
     de más peso hotelero real (turismo de costa verificado + tamaño).
  3. El resto de las ciudades del mundo (incluido el resto de Málaga,
     Andalucía y España) en una única clasificación global por potencial
     hotelero real (tamaño + turismo verificado) — sin agrupar por país ni
     continente.

Dentro de esa lista de ciudades, los hoteles no se abren agotando cada ciudad
antes de pasar a la siguiente: se abren **por rondas** (round-robin), igual
que en el plan de restaurantes, así que la etapa 1 ya cubre una amplia
variedad de países del mundo desde el principio.

No hay calendario de fechas: cada fase se identifica solo por su etapa y su
número de fase (1 a 20) dentro de ella. Cada hotel trae: marca (con logo),
ciudad y país, dirección real de OpenStreetMap, distrito, formato/habitaciones/
m², accesibilidad real (metro, calle peatonal, playa), ADR estimada e
inversión TOTAL estimada en una sola cifra (alquiler o compra + obra y
mobiliario) y el prompt de imagen de la fachada. No incluye horario de
apertura (calendario de obra, no de operación).

Salida: varios ZIP con las carpetas Etapa_NNNN/fase_NN.pdf repartidas por
tamaño:
    /workspace/descargas/horizon_hotels_plan_construccion_NN_eAAAA-BBBB.zip

Uso:
    python3 tools/build_hotel_construction_plan.py
    python3 tools/build_hotel_construction_plan.py --etapas 3 --limit-cities 3000  # prueba rápida
"""
from __future__ import annotations

import argparse
import math
import os
import shutil
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hotel_atlas as H  # noqa: E402
from build_expansion_plan import (  # noqa: E402
    Doc, fmt_n, fmt_eur,
    NAVY, CREAM, RED, GREEN, TEXT, GRAY, LIGHT,
    MARGIN, CONTENT_W, W, H as PAGE_H,
)
from build_brand_plans import (  # noqa: E402
    load_all_addresses, fmt_compact, split_boundaries, district_short,
)

ROOT = Path("/workspace")
OUT_DIR = ROOT / "descargas"
TMP_DIR = Path("/tmp/horizon_hotels_plan_construccion")
MAX_ZIP_BYTES = 150_000_000

N_POR_ETAPA = 1000
N_FASES_POR_ETAPA = 20
N_POR_FASE = N_POR_ETAPA // N_FASES_POR_ETAPA  # 50
TOP_MALAGA_N = 8
MAX_ROUNDS = 80  # tope real de hoteles por ciudad (hotel_atlas.n_hotels)

_CC_CONT = {}


def hotel_city_priority_score(c, ctx) -> float:
    return H.n_hotels(c, ctx) * (1.3 if ctx.get("coast_ok") else 1.0)


def build_city_order(all_cities, ctx_by_id):
    """Orden determinista de ciudades: Marbella, el top de la provincia de Málaga
    (turismo de costa real) y, después, todas las demás ciudades del mundo (incluido
    el resto de Málaga, Andalucía y España) en una sola clasificación global por
    potencial hotelero real."""
    es = [c for c in all_cities if c["cc"] == "ES"]
    malaga = [c for c in es if c["admin2"] == "Málaga"]
    marbella = next((c for c in malaga if c["name"] == "Marbella"), None)
    if marbella is None:
        raise SystemExit("No se encuentra Marbella (Málaga) en el listado de municipios reales.")

    top_malaga = sorted(
        [c for c in malaga if c["id"] != marbella["id"]],
        key=lambda c: -hotel_city_priority_score(c, ctx_by_id[c["id"]]),
    )[:TOP_MALAGA_N]

    chosen_ids = {marbella["id"]} | {c["id"] for c in top_malaga}
    resto = [c for c in all_cities if c["id"] not in chosen_ids]
    resto_sorted = sorted(resto, key=lambda c: -hotel_city_priority_score(c, ctx_by_id[c["id"]]))
    return [marbella] + top_malaga + resto_sorted


def build_round_robin_events(city_order, ctx_by_id):
    """Para cada ciudad calcula su secuencia de marcas (mismo motor que hotel_atlas) y
    su dirección real por hotel; luego intercala los hoteles por rondas (round-robin):
    1 hotel por ciudad y ronda, en el orden fijo de city_order, hasta agotar la ciudad
    con más hoteles. Devuelve (events, addr_for)."""
    per_city = []
    for c in city_order:
        ctx = ctx_by_id[c["id"]]
        n = H.n_hotels(c, ctx)
        if n <= 0:
            continue
        seq = H.pick_hotel_brand_sequence(c, n, ctx)
        used = set()
        addrs = [H.take_addr(c, used) for _ in range(n)]
        per_city.append((c, seq, addrs))

    events = []
    addr_for = {}
    for r in range(MAX_ROUNDS):
        found = False
        for c, seq, addrs in per_city:
            if r < len(seq):
                found = True
                events.append((c, r, seq[r]))
                addr_for[(c["id"], r)] = addrs[r]
        if not found:
            break
    return events, addr_for


def calc_hotel_calc(city, slot, bid_idx, rec, econ, ctx_by_id):
    brand = H.HBRANDS[bid_idx]
    ctx = ctx_by_id[city["id"]]
    seed_key = (city["id"], slot, brand["id"])
    r_h = H.rng(H.h32(*seed_key, "htype"))
    htype = H.htype_for(brand, r_h, city["pop"], ctx)
    calc = H.calc_hotel_invest(city, brand, htype, econ)
    dist = H.district_for(city, rec.get("lat", city["lat"]), rec.get("lon", city["lon"]), rec)
    return brand, htype, calc, dist


def build_full_record(city, slot, bid_idx, rec, econ, ctx_by_id):
    """Registro completo de un hotel (dirección real, distrito, inversión total, ADR,
    amenities, secciones 1-5 e imagen principal + secundarias) para su ficha A4 en el
    PDF de fase."""
    brand, htype, calc, dist = calc_hotel_calc(city, slot, bid_idx, rec, econ, ctx_by_id)
    address = rec.get("text") or f"{city['name']}, {city['country']}"
    v = {
        "bid": brand["id"], "brand": brand["name"], "segment": brand["segment"], "tier": brand["tier"],
        "tier_label": H.TIERS[brand["tier"]]["name"], "stars": brand["stars"],
        "htype_name": htype["name"], "rooms": htype["rooms"],
        "district": dist, "address": address,
        "metro": bool(rec.get("metro")), "ped": bool(rec.get("ped")), "beach": bool(rec.get("beach")),
    }
    desc = H.hotel_image_prompt(v, city)
    amenities = H.active_amenities(city, brand, htype)
    edificio = H.edificio_section(city, brand, htype, amenities)
    basico = H.basico_section(brand, htype)
    extras = H.extras_section(brand, htype)
    sustain_active, sustain_text = H.sustainability_info(brand)
    icons = H.feature_icons(htype["rooms"], brand, htype, amenities, edificio, sustain_active)
    secimgs = H.secondary_images(city, brand, htype, amenities)
    cont_code = _CC_CONT.get(city["cc"], "")
    cont_es = H.CONTINENT_ES.get(cont_code, "Europa")
    story = H.brand_story(brand, cont_es)
    return {
        "city": city["name"], "country": city["country"], "cc": city["cc"], "continent": cont_es,
        "admin1": city["admin1"], "admin2": city["admin2"], "pop": city["pop"],
        "bid": brand["id"], "brand": brand["name"], "segment": brand["segment"], "tier": brand["tier"],
        "stars": brand["stars"], "color": brand["color"], "color2": brand["color2"], "tagline": brand["tagline"],
        "tier_label": H.TIERS[brand["tier"]]["name"],
        "district": dist, "address": address,
        "metro": v["metro"], "ped": v["ped"], "beach": v["beach"],
        "htype_id": htype["id"], "htype_name": htype["name"], "rooms": htype["rooms"], "m2r": htype["m2r"],
        "owned": calc["owned"], "rent": calc["rent"], "price": calc["price"],
        "adr": calc["adr"], "total_inv": calc["total_inv"], "desc": desc,
        "amenities": amenities, "edificio": edificio, "basico": basico, "extras": extras,
        "sustain_active": sustain_active, "sustain_text": sustain_text,
        "icons": icons, "secimgs": secimgs, "story": story,
    }


def fixed_chunks(total: int, size: int):
    bounds = []
    start = 0
    while start < total:
        end = min(start + size, total)
        bounds.append((start, end))
        start = end
    return bounds or [(0, 0)]


def compute_fase_totals(ordered_events, addr_for, econ, fase_bounds, ctx_by_id):
    n_fases = len(fase_bounds)
    fase_invest = [0] * n_fases
    fase_first_cc = [[] for _ in range(n_fases)]
    seen_cc = set()
    for fi, (start, end) in enumerate(fase_bounds):
        s = 0
        for i in range(start, end):
            city, slot, bid_idx = ordered_events[i]
            cc = city["cc"]
            rec = addr_for.get((city["id"], slot)) or {}
            _, _, calc, _ = calc_hotel_calc(city, slot, bid_idx, rec, econ, ctx_by_id)
            s += calc["total_inv"]
            if cc not in seen_cc:
                seen_cc.add(cc)
                fase_first_cc[fi].append(cc)
        fase_invest[fi] = s
        if (fi + 1) % 2000 == 0:
            print(f"  … totales fase {fi + 1}/{n_fases}", flush=True)

    cum_before_invest = [0] * n_fases
    cum_before_count = [0] * n_fases
    running_invest = 0
    running_count = 0
    for fi, (start, end) in enumerate(fase_bounds):
        cum_before_invest[fi] = running_invest
        cum_before_count[fi] = running_count
        running_invest += fase_invest[fi]
        running_count += (end - start)
    return cum_before_invest, cum_before_count, fase_first_cc, running_invest, running_count


def fmt_eur_kpi(n: float) -> str:
    if abs(n) >= 1_000_000_000:
        return f"{n / 1e6:,.0f} M€".replace(",", ".")
    return fmt_eur(n)


def hex_to_rgb(hexstr: str):
    hexstr = (hexstr or "#335").lstrip("#")
    if len(hexstr) < 6:
        hexstr = (hexstr + "000000")[:6]
    return tuple(int(hexstr[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def draw_icon(c, kind, cx, cy, r, color):
    """Icono vectorial simple (sin depender de glifos de fuente/emoji)."""
    c.saveState()
    c.setFillColorRGB(*color)
    c.setStrokeColorRGB(*color)
    if kind == "bed":
        c.roundRect(cx - r, cy - r * 0.55, r * 2, r * 1.05, r * 0.25, fill=1, stroke=0)
        c.roundRect(cx - r * 0.85, cy + r * 0.05, r * 0.85, r * 0.5, r * 0.18, fill=1, stroke=0)
    elif kind == "meeting":
        c.ellipse(cx - r, cy - r * 0.5, cx + r, cy + r * 0.5, fill=1, stroke=0)
    elif kind == "restaurant":
        c.setLineWidth(1.1)
        c.line(cx - r * 0.55, cy - r, cx - r * 0.55, cy + r)
        for dx in (-r * 0.75, -r * 0.55, -r * 0.35):
            c.line(cx + dx, cy + r * 0.45, cx + dx, cy + r)
        c.line(cx + r * 0.55, cy - r, cx + r * 0.55, cy + r)
        c.ellipse(cx + r * 0.35, cy + r * 0.45, cx + r * 0.75, cy + r, fill=1, stroke=0)
    elif kind == "bar":
        p = c.beginPath()
        p.moveTo(cx - r, cy + r)
        p.lineTo(cx + r, cy + r)
        p.lineTo(cx, cy - r * 0.05)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.setLineWidth(1.2)
        c.line(cx, cy - r * 0.05, cx, cy - r * 0.65)
        c.line(cx - r * 0.5, cy - r * 0.65, cx + r * 0.5, cy - r * 0.65)
    elif kind == "gym":
        c.setLineWidth(max(1.4, r * 0.42))
        c.line(cx - r, cy, cx + r, cy)
        c.circle(cx - r, cy, r * 0.4, fill=1, stroke=0)
        c.circle(cx + r, cy, r * 0.4, fill=1, stroke=0)
    elif kind == "wifi":
        for i, h in enumerate((0.5, 0.85, 1.2)):
            bw = r * 0.4
            x = cx - r * 0.75 + i * bw * 1.6
            c.roundRect(x, cy - r * 0.9, bw, r * h, bw * 0.3, fill=1, stroke=0)
    elif kind == "shield":
        p = c.beginPath()
        p.moveTo(cx, cy + r)
        p.lineTo(cx + r * 0.85, cy + r * 0.5)
        p.lineTo(cx + r * 0.85, cy - r * 0.35)
        p.lineTo(cx, cy - r)
        p.lineTo(cx - r * 0.85, cy - r * 0.35)
        p.lineTo(cx - r * 0.85, cy + r * 0.5)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    elif kind == "leaf":
        c.ellipse(cx - r * 0.85, cy - r * 0.55, cx + r * 0.85, cy + r * 0.85, fill=1, stroke=0)
    elif kind == "briefcase":
        c.roundRect(cx - r, cy - r * 0.65, r * 2, r * 1.25, r * 0.2, fill=1, stroke=0)
        c.setLineWidth(1.1)
        c.rect(cx - r * 0.4, cy + r * 0.4, r * 0.8, r * 0.35, fill=0, stroke=1)
    elif kind == "roomservice":
        c.rect(cx - r, cy - r * 0.85, r * 2, r * 0.26, fill=1, stroke=0)
        c.ellipse(cx - r * 0.85, cy - r * 0.6, cx + r * 0.85, cy + r * 0.5, fill=1, stroke=0)
        c.circle(cx, cy + r * 0.7, r * 0.13, fill=1, stroke=0)
    elif kind == "concierge":
        p = c.beginPath()
        p.moveTo(cx - r * 0.8, cy)
        p.curveTo(cx - r * 0.8, cy + r, cx + r * 0.8, cy + r, cx + r * 0.8, cy)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.rect(cx - r, cy - r * 0.22, r * 2, r * 0.2, fill=1, stroke=0)
        c.circle(cx, cy + r, r * 0.13, fill=1, stroke=0)
    elif kind == "pool":
        c.setLineWidth(1.3)
        for dy in (-r * 0.4, r * 0.15, r * 0.7):
            p = c.beginPath()
            p.moveTo(cx - r, cy + dy)
            p.curveTo(cx - r * 0.4, cy + dy + r * 0.32, cx + r * 0.4, cy + dy - r * 0.32, cx + r, cy + dy)
            c.drawPath(p, fill=0, stroke=1)
    elif kind == "spa":
        p = c.beginPath()
        p.moveTo(cx, cy - r)
        p.curveTo(cx + r, cy - r * 0.2, cx + r * 0.5, cy + r, cx, cy + r)
        p.curveTo(cx - r * 0.5, cy + r, cx - r, cy - r * 0.2, cx, cy - r)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    elif kind == "parking":
        c.setLineWidth(1.1)
        c.circle(cx, cy, r, fill=0, stroke=1)
        c.setFont("DejaVuBold", r * 1.25)
        c.drawCentredString(cx, cy - r * 0.36, "P")
    elif kind == "beach":
        c.circle(cx, cy, r * 0.5, fill=1, stroke=0)
        c.setLineWidth(1.1)
        for a in range(0, 360, 45):
            rad = math.radians(a)
            x1, y1 = cx + r * 0.68 * math.cos(rad), cy + r * 0.68 * math.sin(rad)
            x2, y2 = cx + r * 1.05 * math.cos(rad), cy + r * 1.05 * math.sin(rad)
            c.line(x1, y1, x2, y2)
    elif kind == "pin":
        c.circle(cx, cy + r * 0.25, r * 0.55, fill=1, stroke=0)
        p = c.beginPath()
        p.moveTo(cx - r * 0.42, cy)
        p.lineTo(cx + r * 0.42, cy)
        p.lineTo(cx, cy - r * 0.85)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    else:
        c.circle(cx, cy, r * 0.55, fill=1, stroke=0)
    c.restoreState()


def dominant_zone(records) -> str:
    cnt = defaultdict(int)
    for r in records:
        cnt[r["country"]] += 1
    if not cnt:
        return "—"
    top = sorted(cnt.items(), key=lambda kv: -kv[1])[:2]
    return " y ".join(name for name, _ in top)


class FaseDoc(Doc):
    def header(self, fase_label, title, accent=NAVY):
        c = self.c
        self.page_no = 1
        self.phase = fase_label
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, PAGE_H, fill=1, stroke=0)
        c.setFillColorRGB(*accent)
        c.rect(0, PAGE_H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, PAGE_H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, PAGE_H - 20, fase_label.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, PAGE_H - 42, title)
        self._footer()
        self.y = PAGE_H - 74
        return self.y

    def _footer(self):
        c = self.c
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7.2)
        c.drawString(MARGIN, 12, "Horizon Hotels · Plan de Construcción Real")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))


WHITE = (1, 1, 1)
SB_W = 174  # ancho de la banda de marca a sangre en el lateral izquierdo de la ficha


def _fit_lines(c, text, font, size, width, max_lines):
    lines = H.wrap(c, text, font, size, width)
    if len(lines) <= max_lines:
        return lines
    lines = lines[:max_lines]
    last = lines[-1]
    while last and c.stringWidth(last + "…", font, size) > width:
        last = last[:-1]
    lines[-1] = last + "…"
    return lines


def draw_section(c, x, top_y, w, box_h, number, title, lines, accent_rgb):
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(x, top_y - box_h, w, box_h, 5, fill=1, stroke=0)
    c.setFillColorRGB(*accent_rgb)
    c.circle(x + 12, top_y - 11, 7.2, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 8.0)
    c.drawCentredString(x + 12, top_y - 13.6, str(number))
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 8.6)
    c.drawString(x + 23, top_y - 13.6, title)
    yy = top_y - 25
    c.setFont("DejaVu", 7.1)
    c.setFillColorRGB(*TEXT)
    for line in lines:
        for wl in _fit_lines(c, line, "DejaVu", 7.1, w - 14, 2):
            c.drawString(x + 9, yy, wl)
            yy -= 9.4


def draw_hotel_sidebar(c, r, top_y, bottom_y):
    color = hex_to_rgb(r.get("color") or "#234")
    c.saveState()
    c.setFillColorRGB(*color)
    c.rect(0, bottom_y, SB_W, top_y - bottom_y, fill=1, stroke=0)
    pad = 15
    y = top_y - 22
    # logo
    c.setFillColorRGB(*WHITE)
    c.roundRect(pad, y - 44, SB_W - pad * 2, 44, 6, fill=1, stroke=0)
    H.draw_logo(c, r["bid"], pad + 6, y - 40, 32)
    y -= 56
    accent = hex_to_rgb(r.get("color2") or "#caa24a")
    c.setFillColorRGB(*accent)
    c.setFont("DejaVuBold", 12.5)
    for line in _fit_lines(c, r["brand"].upper(), "DejaVuBold", 12.5, SB_W - pad * 2, 3):
        c.drawString(pad, y, line)
        y -= 14
    y -= 2
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVu", 7.6)
    c.drawString(pad, y, H.SEGMENTS[r["segment"]]["name"].upper())
    y -= 14
    c.setStrokeColorRGB(*accent)
    c.setLineWidth(1)
    c.line(pad, y, SB_W - pad, y)
    y -= 16
    c.setFillColorRGB(*accent)
    c.setFont("DejaVuBold", 13)
    c.drawString(pad, y, "★" * int(r["stars"]))
    y -= 13
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 8.4)
    c.drawString(pad, y, f"HOTEL DE {int(r['stars'])} ESTRELLAS")
    y -= 18
    c.setFont("DejaVu", 7.8)
    for line in _fit_lines(c, f"«{r['tagline']}»", "DejaVu", 7.8, SB_W - pad * 2, 2):
        c.drawString(pad, y, line)
        y -= 10.4
    y -= 8
    c.setFont("DejaVu", 6.9)
    for line in _fit_lines(c, r["story"], "DejaVu", 6.9, SB_W - pad * 2, 11):
        c.drawString(pad, y, line)
        y -= 9.1
    # skyline decorativo
    sky_y = bottom_y + 92
    c.setFillColorRGB(*accent)
    rgen = H.rng(H.h32(r["bid"], r["city"], "skyline"))
    bx = pad
    while bx < SB_W - pad - 6:
        bw = 8 + rgen() * 14
        bh = 14 + rgen() * 46
        c.setFillAlpha(0.35)
        c.rect(bx, sky_y, bw, bh, fill=1, stroke=0)
        bx += bw + 3
    c.setFillAlpha(1)
    # ubicación al pie
    yb = bottom_y + 70
    draw_icon(c, "pin", pad + 6, yb, 6, (1, 1, 1))
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(pad + 16, yb - 3, r["city"][:22])
    c.setFont("DejaVu", 6.8)
    yb -= 12
    for line in _fit_lines(c, f"{r['admin2']}, {r['admin1']} ({r['country']})", "DejaVu", 6.8, SB_W - pad * 2 - 6, 2):
        c.drawString(pad + 16, yb, line)
        yb -= 8.6
    c.setFont("DejaVu", 6.5)
    yb -= 4
    for line in _fit_lines(c, r["address"], "DejaVu", 6.5, SB_W - pad * 2, 3):
        c.drawString(pad, yb, line)
        yb -= 8.2
    c.restoreState()


def draw_hotel_page(c, r, idx_in_fase, n_this):
    top_y = PAGE_H - 58
    bottom_y = 26
    draw_hotel_sidebar(c, r, top_y, bottom_y)

    rx0 = SB_W + 14
    rx1 = W - MARGIN
    rw = rx1 - rx0
    y = top_y - 8

    # ficha nº + ubicación real resumida
    c.setFillColorRGB(*GRAY)
    c.setFont("DejaVu", 7.2)
    c.drawString(rx0, y, f"Ficha {idx_in_fase} de {n_this} de esta fase  ·  {r['htype_name']} · {r['rooms']} habitaciones · " + district_short(r["district"]))
    y -= 14

    # 1) imagen principal (prompt)
    mi_h = 160
    c.setFillColorRGB(0.925, 0.94, 0.95)
    c.roundRect(rx0, y - mi_h, rw, mi_h, 6, fill=1, stroke=0)
    c.setDash(3, 2)
    c.setStrokeColorRGB(*GRAY)
    c.setLineWidth(0.8)
    c.roundRect(rx0, y - mi_h, rw, mi_h, 6, fill=0, stroke=1)
    c.setDash()
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(rx0 + 8, y - 12, "IMAGEN PRINCIPAL — PROMPT (fachada; deben verse el rótulo y el logo)")
    c.setFont("DejaVu", 6.5)
    c.setFillColorRGB(0.28, 0.32, 0.34)
    yy = y - 24
    for line in _fit_lines(c, r["desc"], "DejaVu", 6.5, rw - 16, 16):
        c.drawString(rx0 + 8, yy, line)
        yy -= 8.4
    c.setFillColorRGB(*NAVY)
    c.roundRect(rx0 + 8, y - mi_h + 6, 150, 16, 4, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 7.4)
    c.drawString(rx0 + 13, y - mi_h + 11, f"{r['brand']} {'★' * int(r['stars'])}"[:32])
    y -= mi_h + 10

    # 2) tira de iconos de características (2 columnas x 4 filas)
    icons = r["icons"]
    ic_h = 60
    col_w = rw / 2
    for i, (kind, label) in enumerate(icons[:8]):
        col = i % 2
        row = i // 2
        ix = rx0 + col * col_w + 8
        iy = y - 9 - row * 14.2
        draw_icon(c, kind, ix, iy, 5.2, GREEN)
        c.setFillColorRGB(*TEXT)
        c.setFont("DejaVu", 7.0)
        c.drawString(ix + 11, iy - 2.6, label[:44])
    y -= ic_h + 6

    # 3) imágenes secundarias (según amenities activas de este hotel)
    secimgs = r["secimgs"]
    n_si = max(1, len(secimgs))
    gap = 6
    si_w = (rw - gap * (n_si - 1)) / n_si
    si_img_h = 42
    si_h = si_img_h + 30
    for i, (cap, prompt) in enumerate(secimgs):
        sx = rx0 + i * (si_w + gap)
        c.setFillColorRGB(0.93, 0.93, 0.9)
        c.roundRect(sx, y - si_img_h, si_w, si_img_h, 4, fill=1, stroke=0)
        c.setFillColorRGB(0.62, 0.62, 0.58)
        c.setFont("DejaVu", 6.2)
        c.drawCentredString(sx + si_w / 2, y - si_img_h / 2 - 2, "FOTO / PROMPT")
        c.setFillColorRGB(*NAVY)
        c.setFont("DejaVuBold", 6.6)
        c.drawCentredString(sx + si_w / 2, y - si_img_h - 9, cap.upper()[:20])
        c.setFillColorRGB(0.35, 0.37, 0.34)
        c.setFont("DejaVu", 5.6)
        prompt_lines = _fit_lines(c, prompt, "DejaVu", 5.6, si_w - 4, 2)
        for j, line in enumerate(prompt_lines):
            c.drawCentredString(sx + si_w / 2, y - si_img_h - 18 - j * 6, line)
    y -= si_h + 10

    # 4) secciones numeradas 1-5
    accent = hex_to_rgb(r.get("color") or "#234")
    colA_x = rx0
    colB_x = rx0 + rw / 2 + 5
    col_w2 = rw / 2 - 5
    b = r["basico"]
    ed = r["edificio"]
    ex = r["extras"]
    money = (f"Compra estimada: {r['price']:,} €".replace(",", ".") if r["owned"]
             else f"Alquiler: {r['rent']:,} €/mes".replace(",", "."))

    h1 = 70
    draw_section(c, colA_x, y, col_w2, h1, 1, "MARCA", [r["story"][:150] + ("…" if len(r["story"]) > 150 else "")], accent)
    h2b = 95
    draw_section(c, colA_x, y - h1 - 6, col_w2, h2b, 2, "BÁSICO", [
        f"Estrellas: {int(r['stars'])} · Categoría {r['tier_label'].lower()}",
        f"Personal aprox.: {b['personal_aprox']} empleados",
        f"Tipo de clientes: {b['clientes']}",
        f"Régimen principal: {b['regimen']}",
    ], accent)

    h3 = 115
    ed_lines = [
        f"Calidad: {ed['calidad']}",
        f"Plantas: {ed['plantas']} · {ed['seguridad']}",
        f"Tecnología: {ed['tecnologia']}",
        f"Habitaciones con vistas: ~{ed['vista_pct']}%",
    ]
    if ed["salas_reuniones"]:
        ed_lines.append(f"{ed['salas_reuniones']} salas · hasta {ed['capacidad_max']} pers. · {ed['espacio_eventos']} m² eventos")
    if ed["nivel_restaurante"]:
        ed_lines.append(f"Nivel del restaurante: {ed['nivel_restaurante']}/5")
    draw_section(c, colB_x, y, col_w2, h3, 3, "EDIFICIO", ed_lines, accent)

    tidx = H.TIER_ORDER.index(r["tier"])
    h4 = 95
    serv_lines = ["WiFi rápido en todo el hotel"]
    if "parking" in r["amenities"]:
        serv_lines.append("Parking cubierto")
    serv_lines.append("Lavandería")
    if tidx >= 2:
        serv_lines.append("Comida a la habitación 24h")
    if r["segment"] in ("urbano", "aeropuerto", "aparthotel"):
        serv_lines.append("Zona de trabajo")
    if "gimnasio" in r["amenities"]:
        serv_lines.append("Gimnasio")
    if tidx >= 1:
        serv_lines.append("Conserjería 24h")
    draw_section(c, colB_x, y - h3 - 6, col_w2, h4, 4, "SERVICIOS", serv_lines, accent)

    y -= max(h1 + 6 + h2b, h3 + 6 + h4) + 8

    h5 = 80
    ex_lines = [
        f"Días de oferta de apertura: {ex['dias_oferta']}",
        f"Buffet: {ex['buffet']}",
        f"Bares: {ex['bares']}",
        f"Concepto de restaurante: {ex['concepto']}" if "restaurante" in r["amenities"] else "Concepto de restaurante: sin restaurante propio",
        f"Extras operativos: {', '.join(ex['operativo'])}",
    ]
    draw_section(c, rx0, y, rw, h5, 5, "EXTRAS", ex_lines, accent)
    y -= h5 + 10

    # 5) ubicación + sostenibilidad
    fh = 60
    fw = (rw - 8) / 2
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(rx0, y - fh, fw, fh, 5, fill=1, stroke=0)
    draw_icon(c, "pin", rx0 + 12, y - 13, 6, NAVY)
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(rx0 + 22, y - 15, "UBICACIÓN PRIVILEGIADA")
    c.setFont("DejaVu", 6.6)
    c.setFillColorRGB(*TEXT)
    yy = y - 27
    acc_bits = "  ·  ".join(filter(None, [
        "metro/cercanías" if r["metro"] else "", "calle peatonal" if r["ped"] else "", "frente de playa" if r["beach"] else "",
    ])) or "ubicación de uso cotidiano"
    for line in _fit_lines(c, f"{r['address']} — {acc_bits}.", "DejaVu", 6.6, fw - 16, 4):
        c.drawString(rx0 + 8, yy, line)
        yy -= 8.6

    sx2 = rx0 + fw + 8
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(sx2, y - fh, fw, fh, 5, fill=1, stroke=0)
    if r["sustain_active"]:
        draw_icon(c, "leaf", sx2 + 12, y - 13, 6, (0.2, 0.5, 0.28))
        c.setFillColorRGB(0.15, 0.4, 0.22)
        c.setFont("DejaVuBold", 7.6)
        c.drawString(sx2 + 22, y - 15, "COMPROMETIDOS CON LA SOSTENIBILIDAD")
        txt = r["sustain_text"]
    else:
        draw_icon(c, "leaf", sx2 + 12, y - 13, 6, GRAY)
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVuBold", 7.6)
        c.drawString(sx2 + 22, y - 15, "SOSTENIBILIDAD")
        txt = "Certificación ambiental en evaluación para este hotel."
    c.setFont("DejaVu", 6.6)
    c.setFillColorRGB(*TEXT)
    yy = y - 27
    for line in _fit_lines(c, txt, "DejaVu", 6.6, fw - 16, 4):
        c.drawString(sx2 + 8, yy, line)
        yy -= 8.6
    y -= fh + 8

    # 6) barra de inversión
    c.setFillColorRGB(*GREEN)
    c.rect(rx0, y - 17, rw, 17, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 7.4)
    c.drawString(rx0 + 6, y - 12, money)
    adr_str = f"{r['adr']:,.0f}".replace(",", ".") + " €/noche"
    c.drawRightString(rx1 - 6, y - 12, f"ADR: {adr_str}  ·  Inversión: {fmt_compact(r['total_inv'])}")


def render_fase_pdf(path, etapa_no, n_etapas, fase_no, slice_records, cum_count_before, cum_invest_before,
                     first_cc_list, total_world_count, total_world_invest):
    n_this = len(slice_records)
    invest_this = sum(r["total_inv"] for r in slice_records)
    cum_count = cum_count_before + n_this
    cum_invest = cum_invest_before + invest_this
    pct = 100.0 * cum_count / total_world_count if total_world_count else 0.0

    fase_label = f"Etapa {etapa_no} de {n_etapas} · Fase {fase_no} de {N_FASES_POR_ETAPA}"
    title = "Plan de Construcción Real — Horizon Hotels"
    doc = FaseDoc(path)
    doc.header(fase_label, title)
    c = doc.c
    c.setFillColorRGB(*GRAY)
    c.setFont("DejaVu", 8.2)
    c.drawString(
        MARGIN, doc.y - 2,
        f"Zona predominante de esta fase: {dominant_zone(slice_records)}  ·  50 marcas mezcladas, sin horario",
    )
    doc.y -= 14

    doc.kpis([
        (str(n_this), "Hoteles de esta fase"),
        (fmt_n(cum_count), "Hoteles acumulados del grupo"),
        (fmt_eur_kpi(invest_this), "Inversión de esta fase"),
        (fmt_eur_kpi(cum_invest), "Inversión acumulada del grupo"),
    ])
    doc.para(
        f"Progreso del plan mundial: {pct:.4f}% de los {fmt_n(total_world_count)} hoteles potenciales de "
        f"Horizon Hotels ({fmt_eur_kpi(total_world_invest)} de inversión total estimada al cierre de todas las etapas).",
        size=8.2, color=GRAY,
    )
    doc.gap(4)

    if first_cc_list:
        doc.h2(f"Países nuevos en esta fase ({len(first_cc_list)})")
        for cc in first_cc_list[:6]:
            ce = H.COUNTRY_ECON.get(cc, {})
            tax = ce.get("tax")
            vat = ce.get("vat")
            ccont = _CC_CONT.get(cc, "")
            cont = H.CONTINENT_ES.get(ccont, "—")
            cname = H.COUNTRY_ES.get(cc) or H.TERRITORY_ES.get(cc, cc)
            fisc = f"IS {tax * 100:.0f}% · IVA {vat * 100:.0f}%" if tax is not None else "fiscalidad no disponible"
            doc.para(f"• {cname} ({cont}): {fisc}. {H.REGION_RISK.get(ccont, '')}", size=8.4, leading=11.2)
        if len(first_cc_list) > 6:
            doc.para(f"… y {len(first_cc_list) - 6} país(es) más en esta misma fase.", size=8.2, color=GRAY)
        doc.gap(4)

    doc.h2(f"Hoteles de la fase ({n_this}) — ficha completa en las páginas siguientes")
    doc.para(
        "Cada hotel de esta fase tiene su propia ficha de una página completa (formato A4), con marca y logo, "
        "prompt de imagen principal de fachada, imágenes secundarias según sus amenities activas, iconos de "
        "características, las 5 secciones (Marca, Básico, Edificio, Servicios, Extras), ubicación real y sello "
        "de sostenibilidad cuando aplica.",
        size=8.4, leading=11.4,
    )
    doc.gap(4)

    c = doc.c
    doc.ensure(20, fase_label, title)
    c.setFillColorRGB(*GREEN)
    c.rect(MARGIN, doc.y - 16, CONTENT_W, 16, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 8.6)
    c.drawString(MARGIN + 6, doc.y - 11, f"TOTAL fase: {n_this} hoteles")
    c.drawRightString(W - MARGIN - 6, doc.y - 11, f"Inversión: {fmt_eur(invest_this)}")
    doc.y -= 22
    doc.para(
        "\"Compra\" = precio estimado del edificio; en caso contrario, alquiler (fianza y primeros meses). "
        "La inversión total incluye alquiler/compra inicial, obra y mobiliario, ajustados al coste laboral "
        "real del país (una sola cifra por hotel). La ADR (tarifa media diaria) es una estimación inicial "
        "orientativa según la marca y el nivel de precios del país. Dirección y accesibilidad (metro, calle "
        "peatonal, playa) provienen de OpenStreetMap real. Amenities, secciones y prompts de imagen son "
        "estimaciones generadas de forma determinista a partir de la marca, el formato y la ubicación real; "
        "no se incluye horario, este documento es un calendario de obra, no de operación.",
        size=6.8, color=GRAY, leading=8.8,
    )

    for idx, r in enumerate(slice_records, 1):
        c.showPage()
        doc.page_no += 1
        doc.phase = f"{fase_label} · Hotel {idx} de {n_this}"
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, PAGE_H, fill=1, stroke=0)
        c.setFillColorRGB(*NAVY)
        c.rect(0, PAGE_H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, PAGE_H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, PAGE_H - 20, doc.phase.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, PAGE_H - 42, f"{r['brand']} — {r['city']} ({r['country']})"[:70])
        doc._footer()
        draw_hotel_page(c, r, idx, n_this)

    doc.save()


_ORDERED_EVENTS = None
_ADDR_FOR = None
_ECON = None
_CTX_BY_ID = None


def render_etapa_batch(etapa_start_no, etapa_end_no, n_etapas, etapa_bounds, fase_bounds_by_etapa,
                        cum_before_invest, cum_before_count, first_cc_lists,
                        total_world_count, total_world_invest, tmp_dir: Path):
    events = _ORDERED_EVENTS
    addr_for = _ADDR_FOR
    econ = _ECON
    ctx_by_id = _CTX_BY_ID
    for etapa_no in range(etapa_start_no, etapa_end_no + 1):
        ei = etapa_no - 1
        e_start, _e_end = etapa_bounds[ei]
        etapa_dir = tmp_dir / f"Etapa_{etapa_no:04d}"
        etapa_dir.mkdir(parents=True, exist_ok=True)
        for fase_no, (rel_start, rel_end) in enumerate(fase_bounds_by_etapa[ei], 1):
            start, end = e_start + rel_start, e_start + rel_end
            slice_records = [
                build_full_record(*events[i], addr_for.get((events[i][0]["id"], events[i][1])) or {}, econ, ctx_by_id)
                for i in range(start, end)
            ]
            path = etapa_dir / f"fase_{fase_no:02d}.pdf"
            render_fase_pdf(
                path, etapa_no, n_etapas, fase_no, slice_records,
                cum_before_count[ei][fase_no - 1], cum_before_invest[ei][fase_no - 1], first_cc_lists[ei][fase_no - 1],
                total_world_count, total_world_invest,
            )
    return etapa_start_no, etapa_end_no


def _worker(args):
    return render_etapa_batch(*args)


def dir_bytes(p: Path) -> int:
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file())


def pack_construction_zips(tmp_dir: Path, dest_dir: Path, max_bytes: int) -> list[Path]:
    etapa_dirs = sorted(tmp_dir.glob("Etapa_*"), key=lambda p: p.name)
    dest_dir.mkdir(parents=True, exist_ok=True)
    parts = []
    batch, bsz = [], 0

    def flush():
        nonlocal batch, bsz
        if not batch:
            return
        idx = len(parts) + 1
        first_no = int(batch[0].name.split("_")[1])
        last_no = int(batch[-1].name.split("_")[1])
        zpath = dest_dir / f"horizon_hotels_plan_construccion_{idx:02d}_e{first_no:04d}-{last_no:04d}.zip"
        if zpath.exists():
            zpath.unlink()
        print("zipping", zpath, "etapas", len(batch), "bytes~", bsz, flush=True)
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for d in batch:
                for f in sorted(d.rglob("*.pdf")):
                    zf.write(f, arcname=f"horizon_hotels_plan_construccion/{d.name}/{f.name}")
        print("  wrote", zpath, "bytes", zpath.stat().st_size, flush=True)
        parts.append(zpath)
        batch, bsz = [], 0

    for d in etapa_dirs:
        sz = dir_bytes(d)
        if batch and bsz + sz > max_bytes:
            flush()
        batch.append(d)
        bsz += sz
        if sz > max_bytes:
            flush()
    flush()
    return parts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--etapas", type=int, default=0, help="limita el nº de etapas (0 = todas)")
    ap.add_argument("--workers", type=int, default=max(1, os.cpu_count() or 1))
    ap.add_argument("--chunks-per-worker", type=int, default=6)
    ap.add_argument("--limit-cities", type=int, default=0, help="para pruebas rápidas")
    args = ap.parse_args()

    H.load_world_js()
    global _CC_CONT, _ORDERED_EVENTS, _ADDR_FOR, _ECON, _CTX_BY_ID
    _CC_CONT = H.load_continents()
    cities = H.load_cities()
    if args.limit_cities:
        cities = sorted(cities, key=lambda c: -c["pop"])[: args.limit_cities]
        if not any(c["name"] == "Marbella" and c["cc"] == "ES" for c in cities):
            all_cities = H.load_cities()
            marbella = next(c for c in all_cities if c["name"] == "Marbella" and c["cc"] == "ES")
            cities.append(marbella)
    poi_idx = H.mark_mall_stadium(cities)
    print(f"Ciudades cargadas: {len(cities)}", flush=True)
    print("cargando direcciones reales de OpenStreetMap…", flush=True)
    load_all_addresses(cities, poi_idx)

    ctx_by_id = {c["id"]: H.city_ctx(c, poi_idx) for c in cities}
    _CTX_BY_ID = ctx_by_id

    print("calculando orden de ciudades (Marbella -> top Málaga -> resto del mundo por potencial hotelero real)…", flush=True)
    city_order = build_city_order(cities, ctx_by_id)
    print("intercalando hoteles por rondas (round-robin, 1 hotel por ciudad y ronda)…", flush=True)
    events, addr_for = build_round_robin_events(city_order, ctx_by_id)
    print(f"Hoteles totales en el calendario unificado: {len(events)}", flush=True)

    _ORDERED_EVENTS = events
    _ADDR_FOR = addr_for
    _ECON = H.COUNTRY_ECON

    etapa_bounds = fixed_chunks(len(events), N_POR_ETAPA)
    if args.etapas:
        etapa_bounds = etapa_bounds[: args.etapas]
    n_etapas = len(etapa_bounds)
    fase_bounds_by_etapa = [split_boundaries(end - start, N_FASES_POR_ETAPA) for start, end in etapa_bounds]

    fase_bounds_global = []
    for (e_start, _e_end), fbs in zip(etapa_bounds, fase_bounds_by_etapa):
        for rel_start, rel_end in fbs:
            fase_bounds_global.append((e_start + rel_start, e_start + rel_end))

    print(f"{n_etapas} etapas x {N_FASES_POR_ETAPA} fases = {len(fase_bounds_global)} PDF de fase", flush=True)
    print("calculando inversión y países nuevos por fase (pasada rápida)…", flush=True)
    cum_before_invest_flat, cum_before_count_flat, fase_first_cc_flat, total_invest, total_count = \
        compute_fase_totals(events, addr_for, _ECON, fase_bounds_global, ctx_by_id)
    print(f"Inversión total del plan: {fmt_eur(total_invest)} en {fmt_n(total_count)} hoteles", flush=True)

    cum_before_invest, cum_before_count, fase_first_cc = [], [], []
    p = 0
    for fbs in fase_bounds_by_etapa:
        k = len(fbs)
        cum_before_invest.append(cum_before_invest_flat[p:p + k])
        cum_before_count.append(cum_before_count_flat[p:p + k])
        fase_first_cc.append(fase_first_cc_flat[p:p + k])
        p += k

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    TMP_DIR.mkdir(parents=True)

    n_chunks = max(1, args.workers * args.chunks_per_worker)
    etapa_chunk_bounds = split_boundaries(n_etapas, min(n_chunks, n_etapas))
    tasks = [
        (start + 1, end, n_etapas, etapa_bounds, fase_bounds_by_etapa,
         cum_before_invest, cum_before_count, fase_first_cc,
         total_count, total_invest, TMP_DIR)
        for start, end in etapa_chunk_bounds
    ]

    print(f"Renderizando {n_etapas} etapas en {len(tasks)} lotes con {args.workers} procesos…", flush=True)
    from multiprocessing import Pool
    if args.workers == 1:
        for t in tasks:
            r = _worker(t)
            print("  lote listo:", r, flush=True)
    else:
        with Pool(processes=args.workers) as pool:
            for r in pool.imap_unordered(_worker, tasks):
                print("  lote listo:", r, flush=True)

    print("empaquetando ZIP…", flush=True)
    parts = pack_construction_zips(TMP_DIR, OUT_DIR, MAX_ZIP_BYTES)
    shutil.rmtree(TMP_DIR, ignore_errors=True)

    total_size = sum(p.stat().st_size for p in parts)
    print(f"Listo: {len(parts)} ZIP, {total_size / 1e6:.1f} MB en total", flush=True)
    for p in parts:
        print(" -", p.name, f"{p.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
