#!/usr/bin/env python3
"""Horizon Restaurant Group — Plan unificado de construcción (5.000 fases).

Producto adicional (no sustituye ni al atlas mundial ni a los 50 planes de
expansión por marca): un único calendario de obra para todo el grupo, con
las 50 marcas mezcladas fase a fase, dividido en 5.000 fases de tamaño
parecido (~330 locales cada una). Empieza en la provincia de Málaga y avanza,
círculo a círculo (Andalucía, España, Europa, Asia, América, África,
Oceanía), con el mismo criterio "ciudades grandes y turismo real primero" que
el plan maestro (tools/build_expansion_plan.py) — pero con una variedad
aleatoria real dentro de cada zona (salteo local determinista por ciudad), de
forma que el orden no sea municipio a municipio estrictamente.

Cada fase es un PDF independiente con el periodo real de la fase (cadencia
fija para todo el grupo: 1 fase = 3 días naturales, desde enero de 2027, lo
que da un horizonte de ~41 años, coherente con las 500 fases mensuales de
cada marca) y, para cada local: marca, ciudad y país, dirección real de
OpenStreetMap, distrito, formato/aforo/m², accesibilidad real (metro, calle
peatonal, playa) e inversión TOTAL estimada (alquiler o compra + obra +
mobiliario + stock, ya sumados en una sola cifra) más el prompt de imagen de
la fachada. No incluye horario de apertura (no aporta a un plan de obra).

Todos los datos (población real, direcciones OSM, reparto de marcas por
cocina dominante, alquiler real por m² y ciudad) usan exactamente el mismo
motor que el atlas (tools/build_atlas.py), así que el total mundial
(~1,65 millones de locales) coincide con el atlas y con los planes por marca.

Salida: varios ZIP con las 5.000 fases repartidas por tamaño:
    /workspace/descargas/horizon_plan_construccion_NN_fAAAA-BBBB.zip

Uso:
    python3 tools/build_construction_plan.py
    python3 tools/build_construction_plan.py --phases 20 --limit-cities 4000  # prueba rápida
"""
from __future__ import annotations

import argparse
import datetime
import math
import os
import shutil
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402
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
N_PHASES = 5000
MAX_ZIP_BYTES = 150_000_000

PHASE_START = datetime.date(2027, 1, 1)
DAYS_PER_PHASE = 3
MONTHS_ES = B.MONTHS_ES

SIZE_RENT_MULT = {
    "ghost": 0.55, "food_hall": 1.35, "rooftop": 1.6, "local_mall": 1.25,
    "kiosco_playa": 0.9, "kiosco_estacion": 1.1, "drive_thru": 0.85,
    "bistro": 0.85, "local_grande": 1.15,
}

_CC_CONT = {}


def phase_period(phase_no: int):
    """Fase N -> (fecha inicio, fecha fin, etiqueta). Cadencia fija: 3 días/fase."""
    start = PHASE_START + datetime.timedelta(days=(phase_no - 1) * DAYS_PER_PHASE)
    end = start + datetime.timedelta(days=DAYS_PER_PHASE - 1)
    if start.year == end.year and start.month == end.month:
        label = f"{start.day}-{end.day} {MONTHS_ES[start.month - 1]} {start.year}"
    elif start.year == end.year:
        label = f"{start.day} {MONTHS_ES[start.month - 1]} - {end.day} {MONTHS_ES[end.month - 1]} {start.year}"
    else:
        label = f"{start.day} {MONTHS_ES[start.month - 1]} {start.year} - {end.day} {MONTHS_ES[end.month - 1]} {end.year}"
    return start, end, label


def jittered_score(c) -> float:
    """Igual que el criterio 'lógico' del plan maestro (ciudades grandes y costa real
    primero) pero con una variación aleatoria real y determinista por ciudad, para que
    dentro de cada zona el orden no sea estrictamente municipio a municipio."""
    base = city_priority_score(c)
    r = B.rng(B.h32(c["id"], "constructionorder"))
    return base * (0.7 + r() * 0.6)


def build_world_order(all_cities):
    """Orden geográfico completo del mundo: provincia de Málaga, resto de Andalucía,
    resto de España y, después, continente a continente (Europa, Asia, América del Norte
    y Central, América del Sur, África, Oceanía), país a país por locales potenciales y,
    dentro de cada país, ciudad a ciudad por el mismo criterio con salteo local."""
    es = [c for c in all_cities if c["cc"] == "ES"]
    andalucia = [c for c in es if c["admin1"] == "Andalucía"]
    malaga_prov = sorted([c for c in es if c["admin2"] == "Málaga"], key=lambda c: -jittered_score(c))
    andalucia_rest = sorted([c for c in andalucia if c["admin2"] != "Málaga"], key=lambda c: -jittered_score(c))
    es_rest = sorted([c for c in es if c["admin1"] != "Andalucía"], key=lambda c: -jittered_score(c))

    cont = B.load_continents()
    by_cc = defaultdict(list)
    for c in all_cities:
        by_cc[c["cc"]].append(c)
    country_nv = {cc: sum(B.n_venues(c["pop"]) for c in cs) for cc, cs in by_cc.items()}

    by_cont_cc = defaultdict(set)
    for cc in by_cc:
        by_cont_cc[cont.get(cc, "??")].add(cc)

    cont_order = ["EU", "AS", "NA", "SA", "AF", "OC"]
    seen_codes = set(cont_order)
    cont_order += sorted(set(by_cont_cc.keys()) - seen_codes)

    rest_world = []
    for code in cont_order:
        ccs = sorted(by_cont_cc.get(code, ()), key=lambda cc: -country_nv.get(cc, 0))
        for cc in ccs:
            if code == "EU" and cc == "ES":
                continue
            rest_world.extend(sorted(by_cc[cc], key=lambda c: -jittered_score(c)))

    return malaga_prov + andalucia_rest + es_rest + rest_world


def build_ordered_events_and_addr(cities_in_order):
    """Recorre el mundo en el orden final del plan y, para cada ciudad, reparte sus
    locales entre las 50 marcas (mismo motor que el atlas) asignando ya una dirección
    real de OSM a cada uno (sin repetir dentro de la misma ciudad si es posible).
    Devuelve (events, addr_for): events es la secuencia completa (ciudad, slot, marca)
    en el orden final del calendario único; addr_for mapea (city_id, slot) -> dirección."""
    events = []
    addr_for = {}
    for c in cities_in_order:
        n = B.n_venues(c["pop"])
        seq = B.pick_brand_sequence(c, n)
        used = set()
        for slot, bi in enumerate(seq):
            events.append((c, slot, bi))
            addr_for[(c["id"], slot)] = B.take_addr(c, used)
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
    """Registro completo de un local (dirección real, distrito, inversión total y prompt
    de imagen) para las tarjetas del PDF de fase."""
    bid, name, cuisine, tier, tag = B.BRANDS[bid_idx]
    calc = calc_size_invest(city, slot, bid_idx, rec, econ)
    address = rec.get("text") or f"{city['name']}, {city['country']}"
    v = {
        "bid": bid, "brand": name, "cuisine": cuisine, "tier": tier,
        "size_id": calc["size_id"], "size_name": calc["size_name"],
        "seats": calc["seats"], "m2": calc["m2"],
        "district": calc["dist"], "address": address,
        "metro": bool(rec.get("metro")), "ped": bool(rec.get("ped")), "beach": bool(rec.get("beach")),
    }
    desc = B.image_prompt(v, city)
    return {
        "city": city["name"], "country": city["country"], "cc": city["cc"],
        "admin1": city["admin1"], "admin2": city["admin2"], "pop": city["pop"],
        "bid": bid, "brand": name, "cuisine": cuisine, "tier": tier,
        "district": calc["dist"], "address": address,
        "metro": v["metro"], "ped": v["ped"], "beach": v["beach"],
        "size_id": calc["size_id"], "size_name": calc["size_name"],
        "seats": calc["seats"], "m2": calc["m2"],
        "owned": calc["owned"], "rent": calc["rent"], "price": calc["price"],
        "total_inv": calc["total_inv"], "desc": desc,
    }


def compute_phase_totals(ordered_events, addr_for, econ, bounds):
    """Una única pasada secuencial (barata: sin texto de dirección ni prompt de imagen)
    sobre los ~1,65 millones de locales para obtener, fase a fase, la inversión exacta y
    los países que entran por primera vez — así los workers que renderizan en paralelo no
    necesitan coordinarse entre sí para mostrar cifras acumuladas correctas."""
    n_phases = len(bounds)
    phase_invest = [0] * n_phases
    phase_first_cc = [[] for _ in range(n_phases)]
    seen_cc = set()
    for pi, (start, end) in enumerate(bounds):
        s = 0
        for i in range(start, end):
            city, slot, bid_idx = ordered_events[i]
            cc = city["cc"]
            rec = addr_for.get((city["id"], slot)) or {}
            calc = calc_size_invest(city, slot, bid_idx, rec, econ)
            s += calc["total_inv"]
            if cc not in seen_cc:
                seen_cc.add(cc)
                phase_first_cc[pi].append(cc)
        phase_invest[pi] = s
        if (pi + 1) % 500 == 0:
            print(f"  … totales fase {pi + 1}/{n_phases}", flush=True)

    cum_before_invest = [0] * n_phases
    cum_before_count = [0] * n_phases
    running_invest = 0
    running_count = 0
    for pi, (start, end) in enumerate(bounds):
        cum_before_invest[pi] = running_invest
        cum_before_count[pi] = running_count
        running_invest += phase_invest[pi]
        running_count += (end - start)
    return phase_invest, cum_before_invest, cum_before_count, phase_first_cc, running_invest, running_count


def fmt_eur_kpi(n: float) -> str:
    """Para las tarjetas KPI: a partir de 1.000 M€ la cifra completa con separadores de
    miles ya no cabe en el ancho de la tarjeta (ni de la página, en las últimas fases, con
    más de 300.000 M€ acumulados); a partir de ahí se expresa en millones enteros."""
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


class PhaseDoc(Doc):
    def header(self, phase_label, title, accent=NAVY):
        c = self.c
        self.page_no = 1
        self.phase = phase_label
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*accent)
        c.rect(0, H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, H - 20, phase_label.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, H - 42, title)
        self._footer()
        self.y = H - 74
        return self.y

    def _footer(self):
        c = self.c
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7.2)
        c.drawString(MARGIN, 12, "Horizon Restaurant Group · Plan unificado de construcción (5.000 fases)")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))


def draw_venue_card(doc: "PhaseDoc", idx: int, r: dict, phase_label: str, title: str):
    c = doc.c
    desc_lines = B.wrap(c, r["desc"], "DejaVu", 6.9, CONTENT_W - 44)
    addr_lines = B.wrap(c, r["address"], "DejaVu", 7.4, CONTENT_W - 44)
    need = 44 + 9 * len(desc_lines) + 9.5 * max(0, len(addr_lines) - 1)
    doc.ensure(need + 6, phase_label, title)
    y = doc.y
    c.setFillColorRGB(0.965, 0.955, 0.915)
    c.roundRect(MARGIN, y - need + 4, CONTENT_W, need - 4, 6, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.roundRect(MARGIN + 4, y - 32, 28, 28, 5, fill=1, stroke=0)
    B.draw_logo(c, r["bid"], MARGIN + 8, y - 29, 20)
    text_x = MARGIN + 40
    c.setFillColorRGB(*TEXT)
    c.setFont("DejaVuBold", 9.0)
    header = f"{idx}. {r['brand']} — {r['city']} ({r['country']}) · {r['size_name']}"
    c.drawString(text_x, y - 8, header[:104])
    c.setFillColorRGB(*GREEN)
    c.setFont("DejaVu", 7.3)
    meta = f"{r['cuisine']} · {r['seats']} pl · {r['m2']} m²  ·  " + district_short(r["district"])
    c.drawString(text_x, y - 19, meta[:118])
    c.setFillColorRGB(*TEXT)
    c.setFont("DejaVu", 7.4)
    yy = y - 30
    for line in addr_lines[:2]:
        c.drawString(text_x, yy, line)
        yy -= 9.5
    acc = "  ·  ".join(filter(None, [
        "Metro/cercanías OSM" if r["metro"] else "",
        "Calle peatonal" if r["ped"] else "",
        "Frente de playa" if r["beach"] else "",
    ])) or "Calle de uso cotidiano"
    money = (f"Compra {r['price']:,} €".replace(",", ".") if r["owned"]
             else f"Alquiler {r['rent']:,} €/mes".replace(",", "."))
    line = f"{acc}  ·  {money}  ·  Inversión total: {fmt_compact(r['total_inv'])}"
    c.setFont("DejaVuBold", 7.1)
    c.setFillColorRGB(*GREEN)
    c.drawString(text_x, yy, line[:160])
    yy -= 11
    c.setFont("DejaVu", 6.9)
    c.setFillColorRGB(0.30, 0.32, 0.30)
    for dl in desc_lines:
        c.drawString(MARGIN + 6, yy, dl)
        yy -= 9
    doc.y = yy - 6


def render_phase_pdf(path, phase_no, n_phases, slice_records, cum_count_before, cum_invest_before,
                      first_cc_list, total_world_count, total_world_invest):
    start, end, period_label = phase_period(phase_no)
    n_this = len(slice_records)
    invest_this = sum(r["total_inv"] for r in slice_records)
    cum_count = cum_count_before + n_this
    cum_invest = cum_invest_before + invest_this
    pct = 100.0 * cum_count / total_world_count if total_world_count else 0.0

    doc = PhaseDoc(path)
    doc.header(
        f"Fase {phase_no} de {n_phases} · {period_label}",
        "Plan unificado de construcción — Horizon Restaurant Group",
    )
    c = doc.c
    c.setFillColorRGB(*GRAY)
    c.setFont("DejaVu", 8.2)
    c.drawString(
        MARGIN, doc.y - 2,
        f"Zona predominante: {dominant_zone(slice_records)}  ·  cadencia: 1 fase = {DAYS_PER_PHASE} días naturales, "
        "misma marca única para las 50 marcas",
    )
    doc.y -= 14

    doc.kpis([
        (str(n_this), "Locales de esta fase"),
        (fmt_n(cum_count), "Locales acumulados del grupo"),
        (fmt_eur_kpi(invest_this), "Inversión de esta fase"),
        (fmt_eur_kpi(cum_invest), "Inversión acumulada del grupo"),
    ])
    doc.para(
        f"Progreso del plan mundial: {pct:.2f}% de los {fmt_n(total_world_count)} locales potenciales del grupo "
        f"Horizon ({fmt_eur(total_world_invest)} de inversión total estimada al cierre de las 5.000 fases).",
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

    doc.h2(f"Locales de la fase {phase_no} ({n_this})")
    phase_label = f"Fase {phase_no} de {n_phases} · {period_label}"
    title = "Plan unificado de construcción (cont.)"
    for idx, r in enumerate(slice_records, 1):
        draw_venue_card(doc, idx, r, phase_label, title)

    c = doc.c
    doc.ensure(20, phase_label, title)
    c.setFillColorRGB(*GREEN)
    c.rect(MARGIN, doc.y - 16, CONTENT_W, 16, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 8.6)
    c.drawString(MARGIN + 6, doc.y - 11, f"TOTAL fase {phase_no}: {n_this} locales")
    c.drawRightString(W - MARGIN - 6, doc.y - 11, f"Inversión: {fmt_eur(invest_this)}")
    doc.y -= 22
    doc.para(
        "\"Compra\" = precio estimado del local; en caso contrario, alquiler (fianza y primeros meses). "
        "La inversión total incluye alquiler/compra inicial, obra, mobiliario y stock de arranque, "
        "ajustados al coste laboral real del país (una sola cifra por local; el detalle completo por "
        "partidas está en horizon_plan_marca_<código>.zip). Dirección y accesibilidad (metro, calle "
        "peatonal, playa) provienen de OpenStreetMap real. No se incluye horario: este documento es "
        "un calendario de obra, no de operación.",
        size=6.8, color=GRAY, leading=8.8,
    )
    doc.save()


_ORDERED_EVENTS = None
_ADDR_FOR = None
_ECON = None


def render_phase_batch(phase_start_no, phase_end_no, n_phases, bounds, cum_before_invest, cum_before_count,
                        first_cc_lists, total_world_count, total_world_invest, tmp_dir: Path):
    events = _ORDERED_EVENTS
    addr_for = _ADDR_FOR
    econ = _ECON
    for phase_no in range(phase_start_no, phase_end_no + 1):
        pi = phase_no - 1
        start, end = bounds[pi]
        slice_records = [
            build_full_record(*events[i], addr_for.get((events[i][0]["id"], events[i][1])) or {}, econ)
            for i in range(start, end)
        ]
        path = tmp_dir / f"fase_{phase_no:04d}.pdf"
        render_phase_pdf(
            path, phase_no, n_phases, slice_records,
            cum_before_count[pi], cum_before_invest[pi], first_cc_lists[pi],
            total_world_count, total_world_invest,
        )
    return phase_start_no, phase_end_no


def _worker(args):
    return render_phase_batch(*args)


def pack_construction_zips(tmp_dir: Path, dest_dir: Path, max_bytes: int) -> list[Path]:
    files = sorted(tmp_dir.glob("fase_*.pdf"))
    dest_dir.mkdir(parents=True, exist_ok=True)
    parts = []
    batch, bsz = [], 0

    def flush():
        nonlocal batch, bsz
        if not batch:
            return
        idx = len(parts) + 1
        first_no = int(batch[0].stem.split("_")[1])
        last_no = int(batch[-1].stem.split("_")[1])
        zpath = dest_dir / f"horizon_plan_construccion_{idx:02d}_f{first_no:04d}-{last_no:04d}.zip"
        if zpath.exists():
            zpath.unlink()
        print("zipping", zpath, "fases", len(batch), "bytes~", bsz, flush=True)
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for p in batch:
                zf.write(p, arcname=f"horizon_plan_construccion/{p.name}")
        print("  wrote", zpath, "bytes", zpath.stat().st_size, flush=True)
        parts.append(zpath)
        batch, bsz = [], 0

    for p in files:
        sz = p.stat().st_size
        if batch and bsz + sz > max_bytes:
            flush()
        batch.append(p)
        bsz += sz
        if sz > max_bytes:
            flush()
    flush()
    return parts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--phases", type=int, default=N_PHASES)
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
    poi_idx = B.mark_mall_stadium(cities)
    print(f"Ciudades cargadas: {len(cities)}", flush=True)
    print("cargando direcciones reales de OpenStreetMap…", flush=True)
    load_all_addresses(cities, poi_idx)

    print("calculando orden geográfico único (Málaga -> Andalucía -> España -> mundo)…", flush=True)
    order = build_world_order(cities)
    events, addr_for = build_ordered_events_and_addr(order)
    print(f"Locales totales en el calendario unificado: {len(events)}", flush=True)

    _ORDERED_EVENTS = events
    _ADDR_FOR = addr_for
    _ECON = B.COUNTRY_ECON

    n_phases = args.phases
    bounds = split_boundaries(len(events), n_phases)

    print("calculando inversión y países nuevos por fase (pasada rápida)…", flush=True)
    phase_invest, cum_before_invest, cum_before_count, phase_first_cc, total_invest, total_count = \
        compute_phase_totals(events, addr_for, _ECON, bounds)
    print(f"Inversión total del plan: {fmt_eur(total_invest)} en {fmt_n(total_count)} locales", flush=True)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    TMP_DIR.mkdir(parents=True)

    n_chunks = max(1, args.workers * args.chunks_per_worker)
    chunk_bounds = split_boundaries(n_phases, min(n_chunks, n_phases))
    tasks = [
        (start + 1, end, n_phases, bounds, cum_before_invest, cum_before_count, phase_first_cc,
         total_count, total_invest, TMP_DIR)
        for start, end in chunk_bounds
    ]

    print(f"Renderizando {n_phases} fases en {len(tasks)} lotes con {args.workers} procesos…", flush=True)
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
