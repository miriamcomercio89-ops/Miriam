#!/usr/bin/env python3
"""Horizon Restaurant Group — Plan de expansión por marca (50 marcas x 500 fases).

Cada una de las 50 marcas propias tiene su propio calendario de apertura,
dividido en 500 fases. Cada fase es un PDF independiente con:

  - El periodo de la fase (mismo calendario mensual para las 50 marcas: la
    Fase N de cualquier marca cae siempre en el mismo mes).
  - Los locales que esa marca abre en esa fase, muy salteados por el mundo
    (aleatorio real: se puede volver a abrir en una ciudad ya visitada).
  - La inversión estimada de cada local: alquiler/compra, obra, mobiliario
    y stock inicial, más el acumulado de la marca hasta esa fase.
  - Los países nuevos en los que la marca entra en esa fase, con una nota
    de riesgo legal/fiscal (impuesto de sociedades, IVA, región).

Los locales y su reparto de marca/ciudad usan exactamente el mismo motor de
datos que el atlas (tools/build_atlas.py): población real de GeoNames y el
mismo algoritmo de cocina dominante por país (pick_brand_sequence), así que
el total mundial (~1,65 millones de locales) coincide con el atlas.

Salida: 50 ZIP, uno por marca, con sus 500 PDF de fase:
    /workspace/descargas/horizon_plan_marca_<bid>.zip

Uso:
    python3 tools/build_brand_plans.py             # las 50 marcas
    python3 tools/build_brand_plans.py --brands roble,olivo --phases 5  # prueba rápida
"""
from __future__ import annotations

import argparse
import math
import random
import shutil
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402
from build_expansion_plan import (  # noqa: E402
    Doc, fmt_n, fmt_eur, NAVY, CREAM, RED, GREEN, TEXT, GRAY, LIGHT,
    MARGIN, CONTENT_W, W, H,
)

ROOT = Path("/workspace")
OUT_DIR = ROOT / "descargas"
TMP_ROOT = Path("/tmp/horizon_plan_marcas")
N_PHASES = B.N_PHASES
ES_WAGE = 4.2  # €/h de España, referencia del modelo (js/world.js)
CONSTR_EUR_M2 = 950.0
FURN_EUR_M2 = 300.0
STOCK_EUR_SEAT = 140.0

CONTINENT_ES = B.CONTINENT_ES
REGION_RISK = B.REGION_RISK
_CC_CONT = {}

FONT_SIZE = 7.8


def fmt_compact(n: float) -> str:
    if n >= 1_000_000:
        return f"{n / 1e6:.2f} M€".replace(".", ",")
    if n >= 1000:
        return f"{n / 1000:.0f} k€"
    return f"{n:.0f} €"


def split_boundaries(total: int, parts: int):
    base, rem = divmod(total, parts)
    bounds, start = [], 0
    for i in range(parts):
        size = base + (1 if i < rem else 0)
        bounds.append((start, start + size))
        start += size
    return bounds


def load_all_addresses(cities, poi_idx=None):
    """Carga direcciones reales de OpenStreetMap para TODO el mundo, reutilizando los mismos
    índices/caché que ya usó el atlas (España aparte, resto del mundo aparte), y las deja
    colgadas de cada ciudad en city['addrs'] — igual que hace build_atlas.main(). Además, si
    se pasa el índice de POI reales mundiales (tools/global_poi.py), añade a cada dirección
    playa/estación/mall/universidad/polígono reales en cualquier país del mundo."""
    es = [c for c in cities if c["cc"] == "ES"]
    world = [c for c in cities if c["cc"] != "ES"]
    addrs = {}
    if es:
        addrs.update(B.build_index(es))
    if world:
        addrs.update(B.build_index(world))
    for c in cities:
        c["addrs"] = addrs.get(c["id"], [])
    if poi_idx is not None:
        import global_poi as G
        G.annotate_addresses(cities, poi_idx)


def build_brand_events(cities):
    """Reparte cada ciudad del mundo entre las 50 marcas con el mismo motor que el atlas
    (pick_brand_sequence) y asigna, a cada local, una dirección real de OSM (mismo orden y
    misma lógica de no-repetición por ciudad que build_atlas.make_venues).
    Devuelve (events_by_brand, addr_for): events_by_brand es una lista de 50 listas de
    (city, slot); addr_for mapea (city_id, slot) -> registro de dirección real."""
    events_by_brand = [[] for _ in B.BRANDS]
    addr_for = {}
    for c in cities:
        n = B.n_venues(c["pop"])
        seq = B.pick_brand_sequence(c, n)
        used = set()
        for slot, bi in enumerate(seq):
            events_by_brand[bi].append((c, slot))
            addr_for[(c["id"], slot)] = B.take_addr(c, used)
    return events_by_brand, addr_for


def build_brand_records(bid_idx: int, events: list, addr_for: dict, econ: dict):
    """Aleatoriza el orden mundial de apertura de una marca (aleatorio real, muy salteado,
    con posibilidad de volver a abrir en una ciudad ya visitada) y calcula, para cada local,
    dirección real, formato, descripción (prompt de imagen) e inversión estimada
    (alquiler/compra + obra + mobiliario + stock inicial) — los mismos datos que el atlas."""
    bid, name, cuisine, tier, tag = B.BRANDS[bid_idx]
    ev = list(events)
    rnd = random.Random(B.h32(bid, "shuffle-order"))
    rnd.shuffle(ev)

    records = []
    seen_cc = set()
    for slot_i, (city, slot) in enumerate(ev):
        cc = city["cc"]
        first_for_cc = cc not in seen_cc
        seen_cc.add(cc)

        seed_key = (city["id"], slot, bid)
        rec = addr_for.get((city["id"], slot)) or {}
        address = rec.get("text") or f"{city['name']}, {city['country']}"
        metro = bool(rec.get("metro"))
        ped = bool(rec.get("ped"))
        beach = bool(rec.get("beach"))
        dist = B.district_for(city, rec.get("lat", city["lat"]), rec.get("lon", city["lon"]), rec)

        ctx = {
            "dist": dist, "beach": beach, "metro": metro,
            "mall_ok": bool(city.get("mall_ok")), "stadium_ok": bool(city.get("stadium_ok")),
        }
        r_size = B.rng(B.h32(*seed_key, "size"))
        size_id = B.size_for(tier, r_size, city["pop"], ctx)
        if bid == "taco" and size_id != "food_hall":
            size_id = "food_hall" if (city["pop"] >= 70000 and city.get("mall_ok")) else "local"
        sl = B.SIZES[size_id][0]
        seats, m2 = B.size_jitter(size_id, r_size)

        rent_ctry = B.COUNTRY_RENT.get(cc, 40)
        pop_k = city["pop"] / 1000.0
        city_factor = min(2.8, max(0.55, math.log10(pop_k + 10) / 2.2))
        rent_idx = (rent_ctry / 72.0) * city_factor
        mult = {
            "ghost": 0.55, "food_hall": 1.35, "rooftop": 1.6, "local_mall": 1.25,
            "kiosco_playa": 0.9, "kiosco_estacion": 1.1, "drive_thru": 0.85,
            "bistro": 0.85, "local_grande": 1.15,
        }.get(size_id, 1.0)
        rent = max(180, int(round(m2 * 9 * rent_idx * mult)))

        r_own = B.rng(B.h32(*seed_key, "own"))
        owned = r_own() < 0.28
        purchase_price = int(round(rent * 108))
        r_hours = B.rng(B.h32(*seed_key, "hours"))
        hours = B.hours_for(tier, r_hours)

        ce = econ.get(cc) or {"wage": 15.0}
        wage_scale = max(0.12, ce.get("wage", 15.0) / ES_WAGE)
        construction = int(round(m2 * CONSTR_EUR_M2 * wage_scale))
        furniture = int(round(m2 * FURN_EUR_M2 * wage_scale))
        stock = int(round(seats * STOCK_EUR_SEAT * wage_scale))
        alq_compra = purchase_price if owned else int(round(rent * 6))
        total_inv = alq_compra + construction + furniture + stock

        v = {
            "bid": bid, "brand": name, "cuisine": cuisine, "tier": tier,
            "size_id": size_id, "size_name": sl, "seats": seats, "m2": m2,
            "district": dist, "address": address, "metro": metro, "ped": ped, "beach": beach,
        }
        desc = B.image_prompt(v, city)

        records.append({
            "city": city["name"], "country": city["country"], "cc": cc,
            "admin1": city["admin1"], "admin2": city["admin2"], "pop": city["pop"],
            "district": dist, "address": address, "metro": metro, "ped": ped, "beach": beach,
            "hours": hours,
            "size_id": size_id, "size_name": sl, "seats": seats, "m2": m2,
            "owned": owned, "rent": rent, "price": purchase_price,
            "alq_compra": alq_compra, "construction": construction,
            "furniture": furniture, "stock": stock, "total_inv": total_inv,
            "first_for_cc": first_for_cc, "desc": desc,
        })
    return records, bid, name, cuisine, tier, tag


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
        c.drawString(MARGIN, 12, f"Horizon Restaurant Group · {self.brand_name} · Plan de expansión por marca")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))


TIER_ACCENT = {"luxury": (0.30, 0.24, 0.10), "bar": (0.14, 0.22, 0.36), "food_truck": (0.35, 0.22, 0.14)}


def render_phase_pdf(path: Path, bid, name, cuisine, tier, tag, phase_no, slice_records,
                      cum_count_before, cum_invest_before):
    year, month, period_label = B.phase_period(phase_no)
    n_this = len(slice_records)
    invest_this = sum(r["total_inv"] for r in slice_records)
    cum_count = cum_count_before + n_this
    cum_invest = cum_invest_before + invest_this

    doc = PhaseDoc(path)
    doc.brand_name = name
    accent = TIER_ACCENT.get(tier, NAVY)
    doc.header(
        f"Fase {phase_no} de {N_PHASES} · {period_label}",
        f"{name} — {cuisine} ({B.TIER_LABEL.get(tier, tier)})",
        accent=accent,
    )
    c = doc.c
    c.setFillColorRGB(1, 1, 1)
    c.roundRect(MARGIN, doc.y - 30, 34, 30, 5, fill=1, stroke=0)
    B.draw_logo(c, bid, MARGIN + 4, doc.y - 27, 24)
    c.setFillColorRGB(*GRAY)
    c.setFont("DejaVu", 8.4)
    c.drawString(MARGIN + 42, doc.y - 12, tag)
    c.drawString(MARGIN + 42, doc.y - 23, f"Aperturas muy salteadas por el mundo · orden aleatorio (fase #{phase_no})")
    doc.y -= 40

    doc.kpis([
        (str(n_this), "Locales abiertos esta fase"),
        (fmt_n(cum_count), "Locales acumulados de la marca"),
        (fmt_eur(invest_this), "Inversión de la fase"),
        (fmt_eur(cum_invest), "Inversión acumulada de la marca"),
    ])

    new_cc = []
    seen = set()
    for r in slice_records:
        if r["first_for_cc"] and r["cc"] not in seen:
            seen.add(r["cc"])
            new_cc.append(r)
    if new_cc:
        doc.h2(f"Países nuevos en esta fase ({len(new_cc)})")
        for r in new_cc[:6]:
            ce = B.COUNTRY_ECON.get(r["cc"], {})
            tax = ce.get("tax")
            vat = ce.get("vat")
            ccont = _CC_CONT.get(r["cc"], "")
            cont = CONTINENT_ES.get(ccont, "—")
            fisc = f"IS {tax * 100:.0f}% · IVA {vat * 100:.0f}%" if tax is not None else "fiscalidad no disponible"
            doc.para(f"• {r['country']} ({cont}): {fisc}. {REGION_RISK.get(ccont, '')}", size=8.4, leading=11.2)
        if len(new_cc) > 6:
            doc.para(f"… y {len(new_cc) - 6} país(es) más en esta misma fase.", size=8.2, color=GRAY)
        doc.gap(4)

    doc.h2(f"Locales de la fase {phase_no} ({n_this})")
    phase_label = f"Fase {phase_no} de {N_PHASES} · {period_label}"
    title = f"{name} — fase {phase_no}"
    for idx, r in enumerate(slice_records, 1):
        draw_venue_card(doc, idx, r, bid, phase_label, title)

    c = doc.c
    doc.ensure(20, phase_label, title + "  (cont.)")
    c.setFillColorRGB(*GREEN)
    c.rect(MARGIN, doc.y - 16, CONTENT_W, 16, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 8.6)
    c.drawString(MARGIN + 6, doc.y - 11, f"TOTAL fase {phase_no}: {n_this} locales")
    c.drawRightString(W - MARGIN - 6, doc.y - 11, f"Inversión: {fmt_eur(invest_this)}")
    doc.y -= 22
    doc.para(
        "\"C\" = compra del local (precio estimado); en caso contrario, alquiler (fianza y primeros meses). "
        "Obra, mobiliario y stock inicial son estimaciones por m² / plaza ajustadas al coste laboral del país. "
        "Dirección y accesibilidad (metro/cercanías, calle peatonal, playa) provienen de OpenStreetMap real.",
        size=6.9, color=GRAY, leading=9,
    )
    doc.save()
    return cum_count, cum_invest


def draw_venue_card(doc: "PhaseDoc", idx: int, r: dict, bid: str, phase_label: str, title: str):
    c = doc.c
    desc_lines = B.wrap(c, r["desc"], "DejaVu", 6.9, CONTENT_W - 44)
    addr_lines = B.wrap(c, r["address"], "DejaVu", 7.4, CONTENT_W - 44)
    need = 60 + 9 * len(desc_lines) + 9.5 * max(0, len(addr_lines) - 1)
    doc.ensure(need + 6, phase_label, title + "  (cont.)")
    y = doc.y
    c.setFillColorRGB(0.965, 0.955, 0.915)
    c.roundRect(MARGIN, y - need + 4, CONTENT_W, need - 4, 6, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.roundRect(MARGIN + 4, y - 32, 28, 28, 5, fill=1, stroke=0)
    B.draw_logo(c, bid, MARGIN + 8, y - 29, 20)
    text_x = MARGIN + 40
    c.setFillColorRGB(*TEXT)
    c.setFont("DejaVuBold", 9.0)
    header = f"{idx}. {r['city']} ({r['country']}) — {r['size_name']}"
    c.drawString(text_x, y - 8, header[:96])
    c.setFillColorRGB(*GREEN)
    c.setFont("DejaVu", 7.3)
    meta = f"{r['seats']} pl · {r['m2']} m²  ·  " + district_short(r["district"])
    c.drawString(text_x, y - 19, meta[:112])
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
    money = (
        (f"Compra {r['price']:,} €".replace(",", ".") if r["owned"] else f"Alquiler {r['rent']:,} €/mes".replace(",", "."))
    )
    c.setFont("DejaVuBold", 7.1)
    c.setFillColorRGB(*GREEN)
    c.drawString(text_x, yy, (acc + "  ·  " + money)[:118])
    yy -= 10.5
    hrs = "  ".join(f"{d} {r['hours'][d]}" for d in ["D", "L", "M", "X", "J", "V", "S"])
    c.setFont("DejaVu", 6.6)
    c.setFillColorRGB(*GRAY)
    c.drawString(text_x, yy, hrs[:140])
    yy -= 11
    inv = (
        f"Inversión — {'Compra' if r['owned'] else 'Alq.'}: {fmt_compact(r['alq_compra'])}  ·  "
        f"Obra: {fmt_compact(r['construction'])}  ·  Mobiliario: {fmt_compact(r['furniture'])}  ·  "
        f"Stock: {fmt_compact(r['stock'])}  ·  Total: {fmt_compact(r['total_inv'])}"
    )
    c.setFont("DejaVuBold", 7.0)
    c.setFillColorRGB(*NAVY)
    c.drawString(text_x, yy, inv[:150])
    yy -= 11
    c.setFont("DejaVu", 6.9)
    c.setFillColorRGB(0.30, 0.32, 0.30)
    for line in desc_lines:
        c.drawString(MARGIN + 6, yy, line)
        yy -= 9
    doc.y = yy - 6


def district_short(dist: str) -> str:
    return {
        "Playa": "junto a la playa", "Arenal": "en el arenal",
        "Casco": "casco antiguo", "Centro": "centro del municipio",
        "Estacion": "junto a la estación", "Universidad": "junto al campus",
        "Poligono": "polígono industrial", "Industrial": "zona industrial",
        "Residencial": "barrio residencial", "Norte": "zona norte",
        "Sur": "zona sur", "Este": "zona este", "Oeste": "zona oeste",
    }.get(dist, "calle del municipio")


_EVENTS_BY_BRAND = None
_ADDR_FOR = None
_ECON = None


def process_brand(bid_idx: int, n_phases: int, tmp_dir: Path):
    econ = _ECON if _ECON is not None else B.COUNTRY_ECON
    events_by_brand = _EVENTS_BY_BRAND
    records, bid, name, cuisine, tier, tag = build_brand_records(bid_idx, events_by_brand[bid_idx], _ADDR_FOR, econ)
    total = len(records)
    bounds = split_boundaries(total, n_phases)

    brand_dir = tmp_dir / bid
    brand_dir.mkdir(parents=True, exist_ok=True)

    cum_count = 0
    cum_invest = 0
    for i, (start, end) in enumerate(bounds):
        phase_no = i + 1
        sl = records[start:end]
        path = brand_dir / f"fase_{phase_no:03d}.pdf"
        cum_count, cum_invest = render_phase_pdf(
            path, bid, name, cuisine, tier, tag, phase_no, sl, cum_count, cum_invest,
        )

    zip_path = OUT_DIR / f"horizon_plan_marca_{bid}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for i in range(1, n_phases + 1):
            p = brand_dir / f"fase_{i:03d}.pdf"
            zf.write(p, arcname=f"{name.replace(' ', '_')}/fase_{i:03d}.pdf")
    shutil.rmtree(brand_dir)
    return bid, name, total, cum_count, cum_invest, zip_path.stat().st_size


def _worker(bid_idx, n_phases):
    return process_brand(bid_idx, n_phases, TMP_ROOT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--brands", default="", help="lista de bids separados por coma (por defecto: las 50)")
    ap.add_argument("--phases", type=int, default=N_PHASES)
    ap.add_argument("--workers", type=int, default=max(1, __import__("os").cpu_count() or 1))
    args = ap.parse_args()

    B.load_world_js()
    global _CC_CONT, _EVENTS_BY_BRAND, _ADDR_FOR, _ECON
    _CC_CONT = B.load_continents()
    cities = B.load_cities()
    poi_idx = B.mark_mall_stadium(cities)
    print(f"Ciudades cargadas: {len(cities)}")
    print("cargando direcciones reales de OpenStreetMap…")
    load_all_addresses(cities, poi_idx)

    _EVENTS_BY_BRAND, _ADDR_FOR = build_brand_events(cities)
    _ECON = B.COUNTRY_ECON
    total_events = sum(len(e) for e in _EVENTS_BY_BRAND)
    print(f"Locales totales repartidos entre las 50 marcas: {total_events}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_ROOT.mkdir(parents=True, exist_ok=True)

    wanted = [b.strip() for b in args.brands.split(",") if b.strip()] or None
    idxs = [i for i, b in enumerate(B.BRANDS) if wanted is None or b[0] in wanted]

    from multiprocessing import Pool
    n_workers = max(1, min(args.workers, len(idxs)))
    if n_workers == 1:
        results = [_worker(i, args.phases) for i in idxs]
    else:
        with Pool(processes=n_workers) as pool:
            results = pool.starmap(_worker, [(i, args.phases) for i in idxs])

    for bid, name, total, cum_count, cum_invest, size in results:
        print(
            f"[{bid}] {name}: {total} locales en {args.phases} fases -> "
            f"{fmt_eur(cum_invest)} inversión total, ZIP {size / 1e6:.1f} MB"
        )

    shutil.rmtree(TMP_ROOT, ignore_errors=True)


if __name__ == "__main__":
    main()
