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


def draw_venue_card(doc: "FaseDoc", idx: int, r: dict, fase_label: str, title: str):
    c = doc.c
    desc_lines = B.wrap(c, r["desc"], "DejaVu", 6.9, CONTENT_W - 44)
    addr_lines = B.wrap(c, r["address"], "DejaVu", 7.4, CONTENT_W - 44)
    need = 44 + 9 * len(desc_lines) + 9.5 * max(0, len(addr_lines) - 1)
    doc.ensure(need + 6, fase_label, title)
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

    doc.h2(f"Locales de la fase ({n_this})")
    for idx, r in enumerate(slice_records, 1):
        draw_venue_card(doc, idx, r, fase_label, title)

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
        "peatonal, playa) provienen de OpenStreetMap real. No se incluye horario: este documento es "
        "un calendario de obra, no de operación.",
        size=6.8, color=GRAY, leading=8.8,
    )
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
