#!/usr/bin/env python3
"""Horizon Restaurant Group — Plan de Construcción Real (etapas y fases).

El plan definitivo de construcción del grupo: sustituye al plan unificado de
5.000 fases anterior. Un único calendario de obra con las 50 marcas
mezcladas, dividido en tantas **etapas** como hagan falta para cubrir el
mundo — cada etapa consta de **1.000 locales** y se divide, a su vez, en
**20 fases de 50 locales** cada una (un PDF por fase, organizados en una
carpeta por etapa).

Orden de apertura (determinista, sin variedad aleatoria):

  1. Álora (Málaga) — el primer local del plan.
  2. Un resumen muy corto del resto de la provincia de Málaga: sus 10
     municipios de más peso (población real y turismo de costa verificado).
  3. El resto de las ciudades del mundo (incluido el resto de Málaga,
     Andalucía y España) en una única clasificación global por tamaño y
     turismo real — sin agrupar por país ni continente, así que una gran
     ciudad extranjera compite directamente con Madrid o Barcelona por su
     posición en el calendario.

Dentro de esa lista de ciudades, los locales no se abren agotando cada
ciudad antes de pasar a la siguiente: se abren **por rondas** (round-robin).
En la ronda 0 se abre 1 local en cada ciudad del mundo, en el orden de arriba;
solo cuando ya hay un primer local en (casi) todas las ciudades del planeta
empieza la ronda 1 (segundo local en las que tengan más de uno), y así hasta
la ronda 63 (el máximo de locales por ciudad, ver build_atlas.n_venues). Con
esto, la etapa 1 (locales 1-1.000) ya cubre unas 1.000 ciudades distintas de
casi todos los países del mundo — "dominando" el mapa desde el principio — y
las rondas siguientes van rellenando cada ciudad ya abierta con más locales.

No hay calendario de fechas: cada fase se identifica solo por su etapa y su
número de fase (1 a 20) dentro de ella.

Cada local trae: marca (con logo), ciudad y país, dirección real de
OpenStreetMap, distrito, formato/aforo/m², accesibilidad real (metro, calle
peatonal, playa), inversión TOTAL estimada en una sola cifra (alquiler o
compra + obra + mobiliario + stock) y el prompt de imagen de la fachada. No
incluye horario de apertura (calendario de obra, no de operación).

Todos los datos (población real, direcciones OSM, reparto de marcas por
cocina dominante, alquiler real por m² y ciudad) usan el mismo motor que el
atlas (tools/build_atlas.py), así que el total mundial (~1,65 millones de
locales) coincide con el atlas y con los planes por marca.

Salida: varios ZIP con las carpetas Etapa_NNNN/fase_NN.pdf repartidas por
tamaño:
    /workspace/descargas/horizon_plan_construccion_NN_eAAAA-BBBB.zip

Uso:
    python3 tools/build_construction_plan.py
    python3 tools/build_construction_plan.py --etapas 3 --limit-cities 3000  # prueba rápida
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
import build_atlas as B  # noqa: E402
import restaurant_content as RC  # noqa: E402  (contenido enriquecido de la ficha A4: local, básico, servicios, carta, extras, marca, iconos, imágenes secundarias)
from build_expansion_plan import (  # noqa: E402
    Doc, fmt_n, fmt_eur, city_priority_score,
    NAVY, CREAM, RED, GREEN, TEXT, GRAY, LIGHT,
    MARGIN, CONTENT_W, W, H,
)
from build_brand_plans import (  # noqa: E402
    load_all_addresses, fmt_compact, split_boundaries, district_short,
    ES_WAGE, CONSTR_EUR_M2, FURN_EUR_M2, STOCK_EUR_SEAT,
)

ROOT = Path("/workspace")
OUT_DIR = ROOT / "descargas"
TMP_DIR = Path("/tmp/horizon_plan_construccion")
MAX_ZIP_BYTES = 150_000_000

N_POR_ETAPA = 1000
N_FASES_POR_ETAPA = 20
N_POR_FASE = N_POR_ETAPA // N_FASES_POR_ETAPA  # 50
TOP_MALAGA_N = 10
MAX_ROUNDS = 64  # tope real de locales por ciudad (build_atlas.n_venues)

SIZE_RENT_MULT = {
    "ghost": 0.55, "food_hall": 1.35, "rooftop": 1.6, "local_mall": 1.25,
    "kiosco_playa": 0.9, "kiosco_estacion": 1.1, "drive_thru": 0.85,
    "bistro": 0.85, "local_grande": 1.15,
}

_CC_CONT = {}


def build_city_order(all_cities):
    """Orden determinista de ciudades: Álora, el top-10 de la provincia de Málaga y,
    después, todas las demás ciudades del mundo (incluido el resto de Málaga, Andalucía
    y España) en una sola clasificación global por tamaño y turismo real."""
    es = [c for c in all_cities if c["cc"] == "ES"]
    malaga = [c for c in es if c["admin2"] == "Málaga"]
    alora = next((c for c in malaga if c["name"] in ("Álora", "Alora")), None)
    if alora is None:
        raise SystemExit("No se encuentra Álora (Málaga) en el listado de municipios reales.")

    top_malaga = sorted(
        [c for c in malaga if c["id"] != alora["id"]],
        key=lambda c: -city_priority_score(c),
    )[:TOP_MALAGA_N]

    chosen_ids = {alora["id"]} | {c["id"] for c in top_malaga}
    resto = [c for c in all_cities if c["id"] not in chosen_ids]
    resto_sorted = sorted(resto, key=lambda c: -city_priority_score(c))
    return [alora] + top_malaga + resto_sorted


def build_round_robin_events(city_order):
    """Para cada ciudad calcula su secuencia de marcas (mismo motor que el atlas) y su
    dirección real por local; luego intercala los locales por rondas (round-robin): 1
    local por ciudad y ronda, en el orden fijo de city_order, hasta agotar la ciudad con
    más locales (máx. 64). Devuelve (events, addr_for): events es la secuencia final
    (ciudad, slot, marca); addr_for mapea (city_id, slot) -> dirección real."""
    per_city = []
    for c in city_order:
        n = B.n_venues(c["pop"])
        seq = B.pick_brand_sequence(c, n)
        used = set()
        addrs = [B.take_addr(c, used) for _ in range(n)]
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


def calc_size_invest(city, slot, bid_idx, rec, econ):
    """Formato, aforo/m² e inversión total estimada de un local — mismas fórmulas que
    build_brand_plans.build_brand_records, sin generar todavía el texto de dirección ni
    el prompt de imagen (para poder calcular totales acumulados sin ese coste)."""
    bid, name, cuisine, tier, tag = B.BRANDS[bid_idx]
    cc = city["cc"]
    dist = B.district_for(city, rec.get("lat", city["lat"]), rec.get("lon", city["lon"]), rec)
    ctx = {
        "dist": dist, "beach": bool(rec.get("beach")),
        "mall_ok": bool(city.get("mall_ok")), "stadium_ok": bool(city.get("stadium_ok")),
    }
    seed_key = (city["id"], slot, bid)
    r_size = B.rng(B.h32(*seed_key, "size"))
    size_id = B.size_for(tier, r_size, city["pop"], ctx)
    if bid == "taco" and size_id != "food_hall":
        size_id = "food_hall" if (city["pop"] >= 70000 and city.get("mall_ok")) else "local"
    seats, m2 = B.size_jitter(size_id, r_size)

    rent_ctry = B.COUNTRY_RENT.get(cc, 40)
    pop_k = city["pop"] / 1000.0
    city_factor = min(2.8, max(0.55, math.log10(pop_k + 10) / 2.2))
    rent_idx = (rent_ctry / 72.0) * city_factor
    mult = SIZE_RENT_MULT.get(size_id, 1.0)
    rent = max(180, int(round(m2 * 9 * rent_idx * mult)))

    r_own = B.rng(B.h32(*seed_key, "own"))
    owned = r_own() < 0.28
    purchase_price = int(round(rent * 108))

    ce = econ.get(cc) or {"wage": 15.0}
    wage_scale = max(0.12, ce.get("wage", 15.0) / ES_WAGE)
    construction = int(round(m2 * CONSTR_EUR_M2 * wage_scale))
    furniture = int(round(m2 * FURN_EUR_M2 * wage_scale))
    stock = int(round(seats * STOCK_EUR_SEAT * wage_scale))
    alq_compra = purchase_price if owned else int(round(rent * 6))
    total_inv = alq_compra + construction + furniture + stock

    return {
        "dist": dist, "size_id": size_id, "size_name": B.SIZES[size_id][0],
        "seats": seats, "m2": m2, "owned": owned, "rent": rent, "price": purchase_price,
        "total_inv": total_inv,
    }


def build_full_record(city, slot, bid_idx, rec, econ):
    """Registro completo de un local (dirección real, distrito, inversión total, prompt
    de imagen principal, y todo el contenido enriquecido — marca, básico, local, servicios,
    carta y extras — de tools/restaurant_content.py) para su ficha A4 en el PDF de fase."""
    brand = B.BRANDS[bid_idx]
    bid, name, cuisine, tier, tag = brand
    calc = calc_size_invest(city, slot, bid_idx, rec, econ)
    address = rec.get("text") or f"{city['name']}, {city['country']}"
    size_id, seats, m2 = calc["size_id"], calc["seats"], calc["m2"]
    v = {
        "bid": bid, "brand": name, "cuisine": cuisine, "tier": tier,
        "size_id": size_id, "size_name": calc["size_name"],
        "seats": seats, "m2": m2,
        "district": calc["dist"], "address": address,
        "metro": bool(rec.get("metro")), "ped": bool(rec.get("ped")), "beach": bool(rec.get("beach")),
    }
    desc = B.image_prompt(v, city)

    local = RC.local_section(city, brand, size_id, seats, m2, rec)
    basico = RC.basico_section(brand, size_id, seats)
    servicios = RC.servicios_section(brand, size_id, seats, rec, city, local)
    extras = RC.extras_section(brand, size_id, rec, city)
    carta = RC.carta_section(city, brand, size_id, econ, address)
    icons = RC.feature_icons(seats, m2, brand, size_id, rec, local, servicios, extras)
    secimgs = RC.secondary_images(city, brand, size_id, rec)
    color, color2 = RC.brand_color(bid, tier)
    cont_code = _CC_CONT.get(city["cc"], "")
    cont_es = B.CONTINENT_ES.get(cont_code, "Europa")
    story = RC.brand_story(brand, cont_es)

    return {
        "city": city["name"], "country": city["country"], "cc": city["cc"], "continent": cont_es,
        "admin1": city["admin1"], "admin2": city["admin2"], "pop": city["pop"],
        "bid": bid, "brand": name, "cuisine": cuisine, "tier": tier, "tagline": tag,
        "tier_label": B.TIER_LABEL.get(tier, tier), "color": color, "color2": color2,
        "district": calc["dist"], "address": address,
        "metro": v["metro"], "ped": v["ped"], "beach": v["beach"],
        "size_id": size_id, "size_name": calc["size_name"],
        "seats": seats, "m2": m2,
        "owned": calc["owned"], "rent": calc["rent"], "price": calc["price"],
        "total_inv": calc["total_inv"], "desc": desc,
        "local": local, "basico": basico, "servicios": servicios, "extras": extras, "carta": carta,
        "icons": icons, "secimgs": secimgs, "story": story,
    }


def fixed_chunks(total: int, size: int):
    """Trocea en bloques EXACTOS de `size` elementos (salvo el último, que se queda con
    el resto) — así cada etapa tiene siempre 1.000 locales, salvo la última."""
    bounds = []
    start = 0
    while start < total:
        end = min(start + size, total)
        bounds.append((start, end))
        start = end
    return bounds or [(0, 0)]


def compute_fase_totals(ordered_events, addr_for, econ, fase_bounds):
    """Pasada secuencial barata (sin texto de dirección ni prompt de imagen) sobre los
    ~1,65 millones de locales para obtener, fase a fase, la inversión exacta y los países
    que entran por primera vez — así los workers en paralelo no necesitan coordinarse
    entre sí para mostrar cifras acumuladas correctas."""
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
            calc = calc_size_invest(city, slot, bid_idx, rec, econ)
            s += calc["total_inv"]
            if cc not in seen_cc:
                seen_cc.add(cc)
                fase_first_cc[fi].append(cc)
        fase_invest[fi] = s
        if (fi + 1) % 5000 == 0:
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
    """Para las tarjetas KPI: a partir de 1.000 M€ la cifra completa con separadores de
    miles ya no cabe en el ancho de la tarjeta ni de la página; se expresa en millones."""
    if abs(n) >= 1_000_000_000:
        return f"{n / 1e6:,.0f} M€".replace(",", ".")
    return fmt_eur(n)


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
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*accent)
        c.rect(0, H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, H - 20, fase_label.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, H - 42, title)
        self._footer()
        self.y = H - 74
        return self.y

    def _footer(self):
        c = self.c
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7.2)
        c.drawString(MARGIN, 12, "Horizon Restaurant Group · Plan de Construcción Real")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))


# ---------------------------------------------------------------------------
# Ficha A4 completa por local — mismo diseño que draw_hotel_page de
# tools/build_hotel_construction_plan.py, adaptado a restaurantes (6 secciones
# en vez de 5, con la CARTA como sección nueva). Utilidades replicadas de ese
# módulo (hex_to_rgb, draw_icon, _fit_lines, draw_section) porque
# build_hotel_construction_plan.py no expone nada importable y no debe tocarse.
# ---------------------------------------------------------------------------
WHITE = (1, 1, 1)
SB_W = 174  # ancho de la banda de marca a sangre en el lateral izquierdo de la ficha


def hex_to_rgb(hexstr: str):
    hexstr = (hexstr or "#335").lstrip("#")
    if len(hexstr) < 6:
        hexstr = (hexstr + "000000")[:6]
    return tuple(int(hexstr[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def draw_icon(c, kind, cx, cy, r, color):
    """Icono vectorial simple (sin depender de glifos de fuente/emoji). Incluye los kinds
    reutilizados de hoteles (wifi, parking, pin, briefcase, shield, leaf, beach, bar) más
    los nuevos de restaurantes: dish, terrace, delivery, seats, ghostkitchen, foodtruck."""
    c.saveState()
    c.setFillColorRGB(*color)
    c.setStrokeColorRGB(*color)
    if kind == "dish":
        # tenedor (izquierda, con tres púas) y cuchara (derecha) — icono de "cocina/plato"
        c.setLineWidth(1.1)
        c.line(cx - r * 0.55, cy - r, cx - r * 0.55, cy + r)
        for dx in (-r * 0.75, -r * 0.55, -r * 0.35):
            c.line(cx + dx, cy + r * 0.45, cx + dx, cy + r)
        c.line(cx + r * 0.55, cy - r, cx + r * 0.55, cy + r)
        c.ellipse(cx + r * 0.35, cy + r * 0.45, cx + r * 0.75, cy + r, fill=1, stroke=0)
    elif kind == "seats":
        for dx in (-r * 0.55, r * 0.55):
            c.roundRect(cx + dx - r * 0.32, cy - r * 0.7, r * 0.64, r * 1.0, r * 0.15, fill=1, stroke=0)
            c.roundRect(cx + dx - r * 0.4, cy + r * 0.25, r * 0.8, r * 0.35, r * 0.12, fill=1, stroke=0)
    elif kind == "terrace":
        p = c.beginPath()
        p.moveTo(cx, cy + r)
        p.lineTo(cx + r * 0.95, cy + r * 0.1)
        p.lineTo(cx - r * 0.95, cy + r * 0.1)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.setLineWidth(1.3)
        c.line(cx, cy + r * 0.1, cx, cy - r)
        c.line(cx - r * 0.45, cy - r, cx + r * 0.45, cy - r)
    elif kind == "delivery":
        c.roundRect(cx - r * 0.95, cy - r * 0.5, r * 1.3, r * 0.95, r * 0.15, fill=1, stroke=0)
        p = c.beginPath()
        p.moveTo(cx + r * 0.35, cy - r * 0.5)
        p.lineTo(cx + r * 0.95, cy - r * 0.5)
        p.lineTo(cx + r * 1.15, cy - r * 0.05)
        p.lineTo(cx + r * 0.35, cy - r * 0.05)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.circle(cx - r * 0.45, cy - r * 0.6, r * 0.26, fill=1, stroke=0)
        c.circle(cx + r * 0.65, cy - r * 0.6, r * 0.26, fill=1, stroke=0)
    elif kind == "ghostkitchen":
        c.roundRect(cx - r * 0.85, cy - r * 0.75, r * 1.7, r * 1.1, r * 0.15, fill=0, stroke=1)
        c.setLineWidth(1.3)
        p = c.beginPath()
        p.moveTo(cx - r * 0.35, cy + r * 0.6)
        p.lineTo(cx + r * 0.45, cy + r * 0.6)
        p.lineTo(cx + r * 0.15, cy + r * 1.0)
        c.drawPath(p, fill=0, stroke=1)
    elif kind == "foodtruck":
        c.roundRect(cx - r, cy - r * 0.45, r * 1.35, r * 0.9, r * 0.12, fill=1, stroke=0)
        p = c.beginPath()
        p.moveTo(cx + r * 0.35, cy - r * 0.45)
        p.lineTo(cx + r * 0.95, cy - r * 0.45)
        p.lineTo(cx + r * 1.15, cy - r * 0.05)
        p.lineTo(cx + r * 0.35, cy - r * 0.05)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        c.circle(cx - r * 0.5, cy - r * 0.6, r * 0.24, fill=1, stroke=0)
        c.circle(cx + r * 0.65, cy - r * 0.6, r * 0.24, fill=1, stroke=0)
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


def _fit_lines(c, text, font, size, width, max_lines):
    lines = B.wrap(c, text, font, size, width)
    if len(lines) <= max_lines:
        return lines
    lines = lines[:max_lines]
    last = lines[-1]
    while last and c.stringWidth(last + "…", font, size) > width:
        last = last[:-1]
    lines[-1] = last + "…"
    return lines


def draw_section(c, x, top_y, w, box_h, number, title, lines, accent_rgb):
    """Caja numerada con título y líneas de texto — igual que en hoteles, pero con un
    tope defensivo adicional: si el contenido (líneas ya envueltas a 2 sub-líneas cada
    una) no cabe en box_h, se recorta con "…" en vez de desbordar visualmente sobre la
    sección siguiente. Con 6 secciones por ficha (una más que en hoteles) el margen es
    más ajustado, así que esta protección evita cualquier solape aunque un texto salga
    más largo de lo previsto."""
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
    min_y = top_y - box_h + 4
    c.setFont("DejaVu", 7.1)
    c.setFillColorRGB(*TEXT)
    for line in lines:
        for wl in _fit_lines(c, line, "DejaVu", 7.1, w - 14, 2):
            if yy < min_y:
                return
            c.drawString(x + 9, yy, wl)
            yy -= 9.4


def draw_restaurant_sidebar(c, r, top_y, bottom_y):
    color = hex_to_rgb(r.get("color") or "#234")
    c.saveState()
    c.setFillColorRGB(*color)
    c.rect(0, bottom_y, SB_W, top_y - bottom_y, fill=1, stroke=0)
    pad = 15
    y = top_y - 22
    c.setFillColorRGB(*WHITE)
    c.roundRect(pad, y - 44, SB_W - pad * 2, 44, 6, fill=1, stroke=0)
    B.draw_logo(c, r["bid"], pad + 6, y - 40, 32)
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
    c.drawString(pad, y, r["cuisine"].upper())
    y -= 14
    c.setStrokeColorRGB(*accent)
    c.setLineWidth(1)
    c.line(pad, y, SB_W - pad, y)
    y -= 16
    c.setFillColorRGB(*accent)
    c.setFont("DejaVuBold", 9.4)
    c.drawString(pad, y, r["tier_label"].upper())
    y -= 16
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
    rgen = B.rng(B.h32(r["bid"], r["city"], "skyline"))
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


def draw_restaurant_page(c, r, idx_in_fase, n_this):
    top_y = H - 58
    bottom_y = 26
    draw_restaurant_sidebar(c, r, top_y, bottom_y)

    rx0 = SB_W + 14
    rx1 = W - MARGIN
    rw = rx1 - rx0
    y = top_y - 8

    # ficha nº + ubicación real resumida
    c.setFillColorRGB(*GRAY)
    c.setFont("DejaVu", 7.2)
    c.drawString(rx0, y, f"Ficha {idx_in_fase} de {n_this} de esta fase  ·  {r['size_name']} · {r['seats']} plazas · " + district_short(r["district"]))
    y -= 14

    # 1) imagen principal (prompt)
    mi_h = 150
    c.setFillColorRGB(0.925, 0.94, 0.95)
    c.roundRect(rx0, y - mi_h, rw, mi_h, 6, fill=1, stroke=0)
    c.setDash(3, 2)
    c.setStrokeColorRGB(*GRAY)
    c.setLineWidth(0.8)
    c.roundRect(rx0, y - mi_h, rw, mi_h, 6, fill=0, stroke=1)
    c.setDash()
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(rx0 + 8, y - 12, "IMAGEN PRINCIPAL — PROMPT (fachada; debe verse el rótulo con el nombre)")
    c.setFont("DejaVu", 6.5)
    c.setFillColorRGB(0.28, 0.32, 0.34)
    yy = y - 24
    for line in _fit_lines(c, r["desc"], "DejaVu", 6.5, rw - 16, 14):
        c.drawString(rx0 + 8, yy, line)
        yy -= 8.4
    c.setFillColorRGB(*NAVY)
    c.roundRect(rx0 + 8, y - mi_h + 6, 150, 16, 4, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 7.4)
    c.drawString(rx0 + 13, y - mi_h + 11, r["brand"][:32])
    y -= mi_h + 8

    # 2) tira de iconos de características (2 columnas x 4 filas)
    icons = r["icons"]
    ic_h = 58
    col_w = rw / 2
    for i, (kind, label) in enumerate(icons[:8]):
        col = i % 2
        row = i // 2
        ix = rx0 + col * col_w + 8
        iy = y - 9 - row * 14.0
        draw_icon(c, kind, ix, iy, 5.2, GREEN)
        c.setFillColorRGB(*TEXT)
        c.setFont("DejaVu", 7.0)
        c.drawString(ix + 11, iy - 2.6, label[:44])
    y -= ic_h + 6

    # 3) imágenes secundarias (2-4, según el formato/tamaño del local)
    secimgs = r["secimgs"]
    n_si = max(1, len(secimgs))
    gap = 6
    si_w = (rw - gap * (n_si - 1)) / n_si
    si_img_h = 36
    si_h = si_img_h + 28
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
    y -= si_h + 8

    # 4) secciones numeradas 1-4 en dos columnas (1 MARCA/2 BÁSICO, 3 LOCAL/4 SERVICIOS)
    accent = hex_to_rgb(r.get("color") or "#234")
    colA_x = rx0
    colB_x = rx0 + rw / 2 + 5
    col_w2 = rw / 2 - 5
    lo = r["local"]
    ba = r["basico"]
    ex = r["extras"]

    h1 = 55
    story_txt = r["story"]
    draw_section(c, colA_x, y, col_w2, h1, 1, "MARCA", [story_txt[:130] + ("…" if len(story_txt) > 130 else "")], accent)

    h2b = 92
    draw_section(c, colB_x, y, col_w2, h2b, 2, "BÁSICO", [
        f"Categoría: {r['tier_label']} · {ba['tipo_servicio']}",
        f"Personal aprox.: {ba['personal_aprox']} empleados",
        f"Clientela: {ba['clientes']}",
        f"Horario habitual: {ba['horario']}",
    ], accent)

    h3 = 92
    reforma_txt = f"Abierto en {lo['anio_apertura']}" + (f", reformado en {lo['anio_reforma']}" if lo["anio_reforma"] else ", sin grandes reformas")
    aforo_txt = (f"Aforo: {lo['seats_int']} interior + {lo['seats_ext']} terraza" if lo["terraza"]
                 else f"Aforo: {r['seats']} plazas, todo interior")
    draw_section(c, colA_x, y - h1 - 6, col_w2, h3, 3, "LOCAL", [
        f"{lo['calidad']}. {reforma_txt}.",
        aforo_txt,
        f"{lo['accesibilidad']}. {lo['ambiente']}",
        f"Estilo: {lo['estilo']}",
    ], accent)

    h4 = 92
    serv_lines = list(r["servicios"])[:5]
    draw_section(c, colB_x, y - h2b - 6, col_w2, h4, 4, "SERVICIOS", serv_lines, accent)

    y -= max(h1 + 6 + h3, h2b + 6 + h4) + 8

    # 5) CARTA — sección propia con listado de platos y precio, plato estrella destacado
    carta = r["carta"]
    n_platos = len(carta["platos"])
    h5 = 26 + n_platos * 11 + 12
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(rx0, y - h5, rw, h5, 5, fill=1, stroke=0)
    c.setFillColorRGB(*accent)
    c.circle(rx0 + 12, y - 11, 7.2, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 8.0)
    c.drawCentredString(rx0 + 12, y - 13.6, "5")
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 8.6)
    price_label = f"Rango de precio: {carta['rango_precio']}"
    price_w = c.stringWidth(price_label, "DejaVu", 6.9) + 12
    title_max_w = (rx1 - 9) - (rx0 + 23) - price_w
    title_txt = f"CARTA — {carta['family_label']} ({r['cuisine']})"
    for wl in _fit_lines(c, title_txt, "DejaVuBold", 8.6, max(title_max_w, 40), 1):
        c.drawString(rx0 + 23, y - 13.6, wl)
    c.setFont("DejaVu", 6.9)
    c.setFillColorRGB(*GRAY)
    c.drawRightString(rx1 - 9, y - 13.6, price_label)
    yy = y - 25
    for p in carta["platos"]:
        if p["estrella"]:
            c.setFillColorRGB(0.99, 0.93, 0.72)
            c.roundRect(rx0 + 6, yy - 8.2, rw - 12, 11.6, 3, fill=1, stroke=0)
        name = ("★ " if p["estrella"] else "") + p["nombre"] + (f" ({p['tag']})" if p["tag"] else "")
        c.setFillColorRGB(*TEXT)
        c.setFont("DejaVuBold" if p["estrella"] else "DejaVu", 7.2)
        for wl in _fit_lines(c, name, "DejaVuBold" if p["estrella"] else "DejaVu", 7.2, rw - 90, 1):
            c.drawString(rx0 + 10, yy, wl)
        c.setFillColorRGB(*GREEN)
        c.setFont("DejaVuBold", 7.4)
        c.drawRightString(rx1 - 10, yy, RC.fmt_price(p["precio"]))
        yy -= 11
    y -= h5 + 8

    # 6) EXTRAS — extras operativos de apertura
    h6 = 54
    ex_lines = [
        f"Días de oferta de apertura: {ex['dias_oferta']}" if ex["dias_oferta"] else "Sin oferta especial de apertura",
        "Extras: " + ", ".join(ex["operativo"]),
    ]
    draw_section(c, rx0, y, rw, h6, 6, "EXTRAS", ex_lines, accent)
    y -= h6 + 8

    # 7) ubicación + rango de precio / tipo de servicio
    fh = 52
    fw = (rw - 8) / 2
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(rx0, y - fh, fw, fh, 5, fill=1, stroke=0)
    draw_icon(c, "pin", rx0 + 12, y - 13, 6, NAVY)
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(rx0 + 22, y - 15, "UBICACIÓN REAL")
    c.setFont("DejaVu", 6.6)
    c.setFillColorRGB(*TEXT)
    yy = y - 27
    acc_bits = "  ·  ".join(filter(None, [
        "metro/cercanías" if r["metro"] else "", "calle peatonal" if r["ped"] else "", "frente de playa" if r["beach"] else "",
    ])) or "ubicación de uso cotidiano"
    for line in _fit_lines(c, f"{r['address']} — {acc_bits}.", "DejaVu", 6.6, fw - 16, 3):
        c.drawString(rx0 + 8, yy, line)
        yy -= 8.6

    sx2 = rx0 + fw + 8
    c.setFillColorRGB(0.975, 0.968, 0.94)
    c.roundRect(sx2, y - fh, fw, fh, 5, fill=1, stroke=0)
    draw_icon(c, "dish", sx2 + 12, y - 13, 6, GREEN)
    c.setFillColorRGB(*NAVY)
    c.setFont("DejaVuBold", 7.6)
    c.drawString(sx2 + 22, y - 15, "DATO DE INTERÉS")
    c.setFont("DejaVu", 6.6)
    c.setFillColorRGB(*TEXT)
    yy = y - 27
    dato_txt = (
        f"Plato estrella: {next((p['nombre'] for p in carta['platos'] if p['estrella']), carta['platos'][0]['nombre'])}, "
        f"a {RC.fmt_price(next((p['precio'] for p in carta['platos'] if p['estrella']), carta['platos'][0]['precio']))}. "
        f"Rango de la carta: {carta['rango_precio']}."
    )
    for line in _fit_lines(c, dato_txt, "DejaVu", 6.6, fw - 16, 3):
        c.drawString(sx2 + 8, yy, line)
        yy -= 8.6
    y -= fh + 6

    # 8) barra de inversión
    c.setFillColorRGB(*GREEN)
    c.rect(rx0, y - 17, rw, 17, fill=1, stroke=0)
    c.setFillColorRGB(*WHITE)
    c.setFont("DejaVuBold", 7.4)
    money = (f"Compra estimada: {r['price']:,} €".replace(",", ".") if r["owned"]
             else f"Alquiler: {r['rent']:,} €/mes".replace(",", "."))
    c.drawString(rx0 + 6, y - 12, money)
    c.drawRightString(rx1 - 6, y - 12, f"Inversión total: {fmt_compact(r['total_inv'])}")


def render_fase_pdf(path, etapa_no, n_etapas, fase_no, slice_records, cum_count_before, cum_invest_before,
                     first_cc_list, total_world_count, total_world_invest):
    n_this = len(slice_records)
    invest_this = sum(r["total_inv"] for r in slice_records)
    cum_count = cum_count_before + n_this
    cum_invest = cum_invest_before + invest_this
    pct = 100.0 * cum_count / total_world_count if total_world_count else 0.0

    fase_label = f"Etapa {etapa_no} de {n_etapas} · Fase {fase_no} de {N_FASES_POR_ETAPA}"
    title = "Plan de Construcción Real — Horizon Restaurant Group"
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
        (str(n_this), "Locales de esta fase"),
        (fmt_n(cum_count), "Locales acumulados del grupo"),
        (fmt_eur_kpi(invest_this), "Inversión de esta fase"),
        (fmt_eur_kpi(cum_invest), "Inversión acumulada del grupo"),
    ])
    doc.para(
        f"Progreso del plan mundial: {pct:.4f}% de los {fmt_n(total_world_count)} locales potenciales del grupo "
        f"Horizon ({fmt_eur_kpi(total_world_invest)} de inversión total estimada al cierre de todas las etapas).",
        size=8.2, color=GRAY,
    )
    doc.gap(4)

    if first_cc_list:
        doc.h2(f"Países nuevos en esta fase ({len(first_cc_list)})")
        for cc in first_cc_list[:6]:
            ce = B.COUNTRY_ECON.get(cc, {})
            tax = ce.get("tax")
            vat = ce.get("vat")
            ccont = _CC_CONT.get(cc, "")
            cont = B.CONTINENT_ES.get(ccont, "—")
            cname = B.COUNTRY_ES.get(cc) or B.TERRITORY_ES.get(cc, cc)
            fisc = f"IS {tax * 100:.0f}% · IVA {vat * 100:.0f}%" if tax is not None else "fiscalidad no disponible"
            doc.para(f"• {cname} ({cont}): {fisc}. {B.REGION_RISK.get(ccont, '')}", size=8.4, leading=11.2)
        if len(first_cc_list) > 6:
            doc.para(f"… y {len(first_cc_list) - 6} país(es) más en esta misma fase.", size=8.2, color=GRAY)
        doc.gap(4)

    doc.h2(f"Locales de la fase ({n_this}) — ficha completa en las páginas siguientes")
    doc.para(
        "Cada local de esta fase tiene su propia ficha de una página completa (formato A4), con marca y "
        "logo, prompt de imagen principal de fachada, imágenes secundarias según su formato, iconos de "
        "características, las 6 secciones (Marca, Básico, Local, Servicios, Carta, Extras), ubicación "
        "real y un dato de interés (plato estrella y rango de precio de la carta).",
        size=8.4, leading=11.4,
    )
    doc.gap(4)

    c = doc.c
    doc.ensure(20, fase_label, title)
    c.setFillColorRGB(*GREEN)
    c.rect(MARGIN, doc.y - 16, CONTENT_W, 16, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 8.6)
    c.drawString(MARGIN + 6, doc.y - 11, f"TOTAL fase: {n_this} locales")
    c.drawRightString(W - MARGIN - 6, doc.y - 11, f"Inversión: {fmt_eur(invest_this)}")
    doc.y -= 22
    doc.para(
        "\"Compra\" = precio estimado del local; en caso contrario, alquiler (fianza y primeros meses). "
        "La inversión total incluye alquiler/compra inicial, obra, mobiliario y stock de arranque, "
        "ajustados al coste laboral real del país (una sola cifra por local; el detalle completo por "
        "partidas está en horizon_plan_marca_<código>.zip). Dirección y accesibilidad (metro, calle "
        "peatonal, playa) provienen de OpenStreetMap real; los precios de la carta se ajustan al coste "
        "de vida real de cada país y ciudad. No se incluye horario semanal (horario habitual aproximado "
        "en la sección Básico): este documento es un calendario de obra, no de operación.",
        size=6.8, color=GRAY, leading=8.8,
    )

    for idx, r in enumerate(slice_records, 1):
        c.showPage()
        doc.page_no += 1
        doc.phase = f"{fase_label} · Local {idx} de {n_this}"
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*NAVY)
        c.rect(0, H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, H - 20, doc.phase.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, H - 42, f"{r['brand']} — {r['city']} ({r['country']})"[:70])
        doc._footer()
        draw_restaurant_page(c, r, idx, n_this)

    doc.save()


_ORDERED_EVENTS = None
_ADDR_FOR = None
_ECON = None


def render_etapa_batch(etapa_start_no, etapa_end_no, n_etapas, etapa_bounds, fase_bounds_by_etapa,
                        cum_before_invest, cum_before_count, first_cc_lists,
                        total_world_count, total_world_invest, tmp_dir: Path):
    events = _ORDERED_EVENTS
    addr_for = _ADDR_FOR
    econ = _ECON
    for etapa_no in range(etapa_start_no, etapa_end_no + 1):
        ei = etapa_no - 1
        e_start, _e_end = etapa_bounds[ei]
        etapa_dir = tmp_dir / f"Etapa_{etapa_no:04d}"
        etapa_dir.mkdir(parents=True, exist_ok=True)
        for fase_no, (rel_start, rel_end) in enumerate(fase_bounds_by_etapa[ei], 1):
            start, end = e_start + rel_start, e_start + rel_end
            slice_records = [
                build_full_record(*events[i], addr_for.get((events[i][0]["id"], events[i][1])) or {}, econ)
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
        zpath = dest_dir / f"horizon_plan_construccion_{idx:02d}_e{first_no:04d}-{last_no:04d}.zip"
        if zpath.exists():
            zpath.unlink()
        print("zipping", zpath, "etapas", len(batch), "bytes~", bsz, flush=True)
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for d in batch:
                for f in sorted(d.rglob("*.pdf")):
                    zf.write(f, arcname=f"horizon_plan_construccion/{d.name}/{f.name}")
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

    B.load_world_js()
    global _CC_CONT, _ORDERED_EVENTS, _ADDR_FOR, _ECON
    _CC_CONT = B.load_continents()
    cities = B.load_cities()
    if args.limit_cities:
        cities = sorted(cities, key=lambda c: -c["pop"])[: args.limit_cities]
        if not any(c["name"] in ("Álora", "Alora") and c["cc"] == "ES" for c in cities):
            all_cities = B.load_cities()
            alora = next(c for c in all_cities if c["name"] in ("Álora", "Alora") and c["cc"] == "ES")
            cities.append(alora)
    poi_idx = B.mark_mall_stadium(cities)
    print(f"Ciudades cargadas: {len(cities)}", flush=True)
    print("cargando direcciones reales de OpenStreetMap…", flush=True)
    load_all_addresses(cities, poi_idx)

    print("calculando orden de ciudades (Álora -> top Málaga -> resto del mundo por tamaño real)…", flush=True)
    city_order = build_city_order(cities)
    print("intercalando locales por rondas (round-robin, 1 local por ciudad y ronda)…", flush=True)
    events, addr_for = build_round_robin_events(city_order)
    print(f"Locales totales en el calendario unificado: {len(events)}", flush=True)

    _ORDERED_EVENTS = events
    _ADDR_FOR = addr_for
    _ECON = B.COUNTRY_ECON

    etapa_bounds = fixed_chunks(len(events), N_POR_ETAPA)
    if args.etapas:
        etapa_bounds = etapa_bounds[: args.etapas]
    n_etapas = len(etapa_bounds)
    fase_bounds_by_etapa = [split_boundaries(end - start, N_FASES_POR_ETAPA) for start, end in etapa_bounds]

    # Límites de fase en índice global (para la pasada de totales)
    fase_bounds_global = []
    for (e_start, _e_end), fbs in zip(etapa_bounds, fase_bounds_by_etapa):
        for rel_start, rel_end in fbs:
            fase_bounds_global.append((e_start + rel_start, e_start + rel_end))

    print(f"{n_etapas} etapas x {N_FASES_POR_ETAPA} fases = {len(fase_bounds_global)} PDF de fase", flush=True)
    print("calculando inversión y países nuevos por fase (pasada rápida)…", flush=True)
    cum_before_invest_flat, cum_before_count_flat, fase_first_cc_flat, total_invest, total_count = \
        compute_fase_totals(events, addr_for, _ECON, fase_bounds_global)
    print(f"Inversión total del plan: {fmt_eur(total_invest)} en {fmt_n(total_count)} locales", flush=True)

    # Reagrupa las listas planas (por fase global) en listas por etapa (20 fases cada una)
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
