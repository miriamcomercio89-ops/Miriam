#!/usr/bin/env python3
"""Horizon Restaurant Group — Plan de Expansión Global (PDF).

Documento estratégico: empezamos en Cártama (Málaga) y nos expandimos en
círculos concéntricos hasta cubrir el mundo. Todos los números (municipios,
locales potenciales, direcciones, marcas) se calculan con el mismo motor de
datos del atlas (tools/build_atlas.py): población real de GeoNames, la
misma fórmula de nº de locales por población, el mismo reparto de marcas
por cocina dominante del país y los mismos formatos (kiosco, local,
flagship, food hall, estadio, kiosco de playa/estación, mall, drive-thru,
rooftop, cocina fantasma).

Uso:
    python3 tools/build_expansion_plan.py
    -> /workspace/descargas/horizon_plan_expansion.pdf
"""
from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402  (reutiliza fuentes, logos, datos y motor de venues)

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

ROOT = Path("/workspace")
OUT_PDF = ROOT / "descargas" / "horizon_plan_expansion.pdf"

W, H = A4
NAVY = (0.11, 0.21, 0.34)
CREAM = (0.96, 0.94, 0.88)
RED = (0.85, 0.25, 0.18)
GREEN = (0.11, 0.35, 0.30)
TEXT = (0.15, 0.18, 0.16)
GRAY = (0.42, 0.47, 0.44)
LIGHT = (0.90, 0.92, 0.895)

MX = 16 * mm / mm  # margen horizontal en pt (16pt, coherente con el atlas)
MARGIN = 16
CONTENT_W = W - 2 * MARGIN


def fmt_n(n) -> str:
    return f"{n:,.0f}".replace(",", ".")


def fmt_eur(n) -> str:
    return f"{n:,.0f} €".replace(",", ".")


class Doc:
    def __init__(self, path: Path):
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.page_no = 0
        self.phase = ""
        self.y = H

    # ---- páginas -------------------------------------------------
    def cover(self, title, subtitle, kicker):
        c = self.c
        c.setFillColorRGB(*NAVY)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 210, W, 5, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVuBold", 12)
        c.drawString(MARGIN, H - 90, kicker.upper())
        c.setFont("DejaVuBold", 30)
        for i, line in enumerate(title):
            c.drawString(MARGIN, H - 140 - i * 36, line)
        c.setFont("DejaVu", 13)
        y0 = H - 140 - len(title) * 36 - 26
        for line in subtitle:
            c.drawString(MARGIN, y0, line)
            y0 -= 18

        # logos de una muestra de marcas, en rejilla
        sample = ["olivo", "cinta", "seul", "roble", "empanada", "poke", "seda", "taco", "polar", "arena"]
        gx, gy, sz, gap = MARGIN, 90, 34, 12
        for i, bid in enumerate(sample):
            x = gx + i * (sz + gap)
            if x + sz > W - MARGIN:
                break
            c.setFillColorRGB(1, 1, 1)
            c.roundRect(x, gy, sz, sz, 5, fill=1, stroke=0)
            B.draw_logo(c, bid, x + 3, gy + 3, sz - 6)
        c.setFillColorRGB(0.75, 0.8, 0.78)
        c.setFont("DejaVu", 8.2)
        c.drawString(MARGIN, 62, "10 de las 50 marcas propias del grupo · el resto en la última página de este documento")
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, 28, "Horizon Restaurant Group  ·  Documento estratégico interno  ·  no distribuir fuera del grupo")

    def new_page(self, phase_label, title):
        c = self.c
        c.showPage()
        self.page_no += 1
        self.phase = phase_label
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*NAVY)
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
        c.drawString(MARGIN, 12, "Horizon Restaurant Group · Plan de Expansión Global · De Cártama al mundo")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))

    def ensure(self, need, phase_label=None, title=None):
        if self.y - need < 30:
            self.new_page(phase_label or self.phase, title or "(cont.)")

    def para(self, text, size=9.3, leading=12.6, color=TEXT, width=None, font="DejaVu"):
        c = self.c
        w = width or CONTENT_W
        c.setFont(font, size)
        c.setFillColorRGB(*color)
        for line in B.wrap(c, text, font, size, w):
            self.ensure(leading)
            c.drawString(MARGIN, self.y, line)
            self.y -= leading

    def gap(self, n=8):
        self.y -= n

    def h2(self, text, color=NAVY):
        c = self.c
        self.ensure(20)
        c.setFillColorRGB(*color)
        c.setFont("DejaVuBold", 12.5)
        c.drawString(MARGIN, self.y, text)
        self.y -= 16

    def bullets(self, items, size=9.1, leading=12.2):
        c = self.c
        for it in items:
            c.setFont(font := "DejaVu", size)
            lines = B.wrap(c, it, font, size, CONTENT_W - 12)
            self.ensure(leading * len(lines) + 2)
            c.setFillColorRGB(*RED)
            c.circle(MARGIN + 2.5, self.y + 3.2, 1.6, fill=1, stroke=0)
            c.setFillColorRGB(*TEXT)
            for j, line in enumerate(lines):
                c.drawString(MARGIN + 11, self.y, line)
                self.y -= leading

    def kpis(self, cards):
        """cards: lista de (valor, etiqueta)."""
        c = self.c
        n = len(cards)
        gap = 8
        cw = (CONTENT_W - gap * (n - 1)) / n
        h = 46
        self.ensure(h + 6)
        x = MARGIN
        for val, label in cards:
            c.setFillColorRGB(1, 1, 1)
            c.roundRect(x, self.y - h, cw, h, 5, fill=1, stroke=0)
            c.setFillColorRGB(*RED)
            c.rect(x, self.y - h, 3, h, fill=1, stroke=0)
            c.setFillColorRGB(*NAVY)
            c.setFont("DejaVuBold", 15)
            c.drawString(x + 10, self.y - 20, str(val))
            c.setFillColorRGB(*GRAY)
            c.setFont("DejaVu", 7.6)
            for k, line in enumerate(B.wrap(c, label, "DejaVu", 7.6, cw - 16)):
                c.drawString(x + 10, self.y - 32 - k * 9, line)
            x += cw + gap
        self.y -= h + 12

    def table(self, headers, rows, col_w, size=8.2, row_h=14.2, align=None, phase_label=None, title=None, total_row=None):
        c = self.c
        align = align or ["l"] * len(headers)

        def draw_header():
            self.ensure(row_h + 4)
            c.setFillColorRGB(*NAVY)
            c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("DejaVuBold", size)
            x = MARGIN + 5
            for h, w, a in zip(headers, col_w, align):
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, h)
                else:
                    c.drawString(x, self.y - row_h + 8, h)
                x += w
            self.y -= row_h

        draw_header()
        for i, row in enumerate(rows):
            if self.y - row_h < 30:
                self.new_page(phase_label or self.phase, (title or "(cont.)") + "  (cont.)")
                draw_header()
            if i % 2 == 1:
                c.setFillColorRGB(*LIGHT)
                c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(*TEXT)
            c.setFont("DejaVu", size)
            x = MARGIN + 5
            for val, w, a in zip(row, col_w, align):
                s = str(val)
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, s)
                else:
                    if c.stringWidth(s, "DejaVu", size) > w - 8:
                        while s and c.stringWidth(s + "…", "DejaVu", size) > w - 8:
                            s = s[:-1]
                        s += "…"
                    c.drawString(x, self.y - row_h + 8, s)
                x += w
            self.y -= row_h
        if total_row:
            self.ensure(row_h + 2)
            c.setFillColorRGB(*GREEN)
            c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("DejaVuBold", size)
            x = MARGIN + 5
            for val, w, a in zip(total_row, col_w, align):
                s = str(val)
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, s)
                else:
                    c.drawString(x, self.y - row_h + 8, s)
                x += w
            self.y -= row_h
        self.y -= 8

    def save(self):
        self.c.showPage()
        self.c.save()


# ------------------------------------------------------------------
# Recopilación de datos reales (mismo motor que el atlas)
# ------------------------------------------------------------------

def gather_data():
    B.load_world_js()
    all_cities = B.load_cities()
    es = [c for c in all_cities if c["cc"] == "ES"]
    B.mark_mall_stadium(es)
    addrs = B.build_index(es)
    for c in es:
        c["addrs"] = addrs.get(c["id"], [])

    heads, loc = B.cluster(es)
    by_id = {c["id"]: c for c in es}
    groups = defaultdict(list)
    for cid, hid in loc.items():
        groups[hid].append(by_id[cid])

    cartama = next(c for c in es if c["name"] == "Cártama")
    cartama_venues = B.make_venues(cartama, B.n_venues(cartama["pop"]))

    zone_members = sorted(groups.get(cartama["id"], []), key=lambda c: -c["pop"])

    near_heads = []
    for h in heads:
        d = B.haversine((cartama["lat"], cartama["lon"]), (h["lat"], h["lon"]))
        if d <= 35:
            near_heads.append((d, h))
    near_heads.sort(key=lambda x: x[0])

    malaga_prov = [c for c in es if c["admin2"] == "Málaga"]
    andalucia = [c for c in es if c["admin1"] == "Andalucía"]

    by_prov_and = defaultdict(list)
    for c in andalucia:
        by_prov_and[c["admin2"]].append(c)

    by_ccaa = defaultdict(list)
    for c in es:
        by_ccaa[c["admin1"]].append(c)

    cont = B.load_continents()

    by_cc = defaultdict(list)
    for c in all_cities:
        by_cc[c["cc"]].append(c)

    country_stats = {}
    for cc, cs in by_cc.items():
        nv = sum(B.n_venues(c["pop"]) for c in cs)
        country_stats[cc] = (len(cs), nv, B.COUNTRY_ES.get(cc) or B.TERRITORY_ES.get(cc, cc))

    by_cont = defaultdict(list)
    for cc, (nmuni, nv, name) in country_stats.items():
        by_cont[cont.get(cc, "??")].append((nv, nmuni, cc, name))

    # Reparto mundial de las 50 marcas (mismo motor que el atlas y que el plan por marca):
    # cuántos locales le tocan a cada marca en el conjunto de los ~148.000 municipios del mundo.
    brand_counts = [0] * len(B.BRANDS)
    for c in all_cities:
        n = B.n_venues(c["pop"])
        for bi in B.pick_brand_sequence(c, n):
            brand_counts[bi] += 1

    return {
        "cartama": cartama,
        "cartama_venues": cartama_venues,
        "zone_members": zone_members,
        "near_heads": near_heads,
        "groups": groups,
        "malaga_prov": malaga_prov,
        "andalucia": andalucia,
        "by_prov_and": by_prov_and,
        "by_ccaa": by_ccaa,
        "es": es,
        "by_cont": by_cont,
        "all_cities": all_cities,
        "by_cc": by_cc,
        "cont": cont,
        "brand_counts": brand_counts,
    }


def n_v(cities):
    return sum(B.n_venues(c["pop"]) for c in cities)


def n_pop(cities):
    return sum(c["pop"] for c in cities)


# ------------------------------------------------------------------
# Construcción del documento
# ------------------------------------------------------------------

def build():
    d = gather_data()
    doc = Doc(OUT_PDF)

    total_world = n_v(d["all_cities"])
    total_muni_world = len(d["all_cities"])

    doc.cover(
        title=["PLAN DE EXPANSIÓN", "GLOBAL"],
        subtitle=[
            "De Cártama al mundo: 12 formatos de local, 50 marcas propias",
            f"y un mapa de {fmt_n(total_muni_world)} municipios en todos los países.",
        ],
        kicker="Horizon Restaurant Group",
    )

    # ---------------- Visión ----------------
    doc.new_page("Visión", "Por qué empezamos en Cártama")
    doc.para(
        "Horizon Restaurant Group nace en Cártama (Málaga, Andalucía) como laboratorio de marca: "
        "un municipio de tamaño medio, bien conectado con la capital y la Costa del Sol, con casco "
        "histórico, ensanche y polígonos, donde probar a la vez formato de calle, food truck y "
        "flagship antes de escalar a las cabeceras de zona vecinas."
    )
    doc.gap(4)
    doc.para(
        "La expansión sigue círculos concéntricos: del municipio a su zona natural (≈26 km, el mismo "
        "radio que agrupa los cuadernos del atlas), de la zona a la provincia, de la provincia a la "
        "comunidad autónoma, de España al continente y del continente al resto del mundo. En cada "
        "salto se reutiliza el mismo motor de asignación: tamaño del local según población real, "
        "formato según el distrito real del municipio (playa, estación, polígono, centro comercial, "
        "azotea de gran ciudad) y mezcla de marcas ponderada por la cocina que más se consume en cada país."
    )
    doc.gap(10)
    doc.h2("Hoja de ruta en una tabla")
    phase_rows = [
        ["Fase 0", "Cártama (piloto)", fmt_n(B.n_venues(d["cartama"]["pop"])) + " locales"],
        ["Fase 1", "Zona Cártama (≈26 km)", fmt_n(n_v(d["zone_members"])) + " locales"],
        ["Fase 2", "Costa del Sol / área de Málaga", fmt_n(sum(n_v(d["groups"].get(h["id"], [])) for _, h in d["near_heads"])) + " locales"],
        ["Fase 3", "Provincia de Málaga", fmt_n(n_v(d["malaga_prov"])) + " locales"],
        ["Fase 4", "Andalucía", fmt_n(n_v(d["andalucia"])) + " locales"],
        ["Fase 5", "España", fmt_n(n_v(d["es"])) + " locales"],
        ["Fase 6", "Europa (resto)", fmt_n(sum(x[0] for x in d["by_cont"].get("EU", [])) - n_v(d["es"])) + " locales"],
        ["Fase 7", "Asia y Oriente Medio", fmt_n(sum(x[0] for x in d["by_cont"].get("AS", []))) + " locales"],
        ["Fase 8", "América del Norte y Central", fmt_n(sum(x[0] for x in d["by_cont"].get("NA", []))) + " locales"],
        ["Fase 9", "América del Sur", fmt_n(sum(x[0] for x in d["by_cont"].get("SA", []))) + " locales"],
        ["Fase 10", "África", fmt_n(sum(x[0] for x in d["by_cont"].get("AF", []))) + " locales"],
        ["Fase 11", "Oceanía → cobertura mundial total", fmt_n(total_world) + " locales"],
    ]
    doc.table(["Fase", "Ámbito", "Objetivo de locales"], phase_rows, [55, 330, CONTENT_W - 55 - 330], align=["l", "l", "r"])

    # ---------------- Modelo de formatos ----------------
    doc.new_page("Modelo", "Cómo decidimos el formato de cada local")
    doc.para(
        "En cada municipio, el tamaño y el formato del local no se eligen a mano: dependen de la "
        "población real (GeoNames) y de si existe de verdad esa característica en el municipio, según "
        "OpenStreetMap (calle peatonal, playa, estación de metro o tren). Este es el catálogo de formatos "
        "que ya usa el motor del atlas y que replicamos en cada fase de esta expansión:"
    )
    doc.gap(6)
    size_rows = []
    for sid, (label, seats, m2) in B.SIZES.items():
        cond = {
            "kiosco": "Población mínima; formato de entrada en cualquier municipio",
            "local": "Formato base, disponible en cualquier municipio",
            "ghost": "Desde ≈3.500 hab.: cocina fantasma centrada en delivery",
            "flagship": "Desde ≈22.000 hab.: buque insignia de la marca en la zona",
            "food_hall": "Desde ≈70.000 hab. y solo en las ciudades más grandes del país",
            "estadio": "Desde ≈220.000 hab. y solo en las ciudades más grandes del país",
            "kiosco_playa": "Solo si hay playa real cerca (OSM)",
            "kiosco_estacion": "Solo si hay metro/cercanías real cerca (OSM)",
            "local_mall": "Desde ≈35.000 hab., en ciudades con centro comercial",
            "drive_thru": "Desde ≈15.000 hab., en polígono o periferia con tráfico",
            "rooftop": "Desde ≈300.000 hab., en el centro de grandes ciudades",
        }.get(sid, "")
        size_rows.append([label, f"{seats} pl", f"{m2} m²", cond])
    doc.table(
        ["Formato", "Aforo", "Superficie", "Condición real de asignación"],
        size_rows,
        [110, 45, 55, CONTENT_W - 110 - 45 - 55],
        align=["l", "r", "r", "l"],
    )
    doc.gap(4)
    doc.para(
        "Además, las 50 marcas del grupo no se reparten igual en todos los países: en cada uno pesa más "
        "la cocina que de verdad se consume allí (japonesa en Japón, india en India, mediterránea y "
        "tapas en España, barbacoa y hamburguesas en Estados Unidos…), con variedad aleatoria real entre "
        "municipios de tamaño parecido."
    )

    # ---------------- Fase 0: Cártama ----------------
    doc.new_page("Fase 0 · El origen", "Cártama (Málaga, Andalucía)")
    c0 = d["cartama"]
    doc.kpis([
        (fmt_n(c0["pop"]), "Habitantes (Cártama)"),
        (str(len(d["cartama_venues"])), "Locales piloto"),
        (fmt_n(sum(v["rent"] for v in d["cartama_venues"] if not v["owned"])), "Alquiler agregado / mes"),
        (str(sum(1 for v in d["cartama_venues"] if v["owned"])), "Locales en propiedad"),
    ])
    doc.para(
        "Cártama es el municipio de partida: casco antiguo, ensanche del este y una estación de "
        "cercanías propia (Estación de Cártama), a 19 km de Málaga capital. La cocina dominante en "
        "España es mediterránea, tapas y brunch, así que el primer lote de locales prioriza esas "
        "marcas y añade algo de lujo y comida rápida para completar la oferta del pueblo."
    )
    doc.gap(4)
    rows = []
    for v in d["cartama_venues"]:
        rows.append([
            v["brand"], v["cuisine"], v["size_name"], f"{v['seats']} pl", v["district"],
            ("Compra " + fmt_eur(v["price"])) if v["owned"] else ("Alq. " + fmt_eur(v["rent"]) + "/mes"),
        ])
    doc.table(
        ["Marca", "Cocina", "Formato", "Aforo", "Barrio", "Inversión"],
        rows,
        [95, 105, 62, 40, 55, CONTENT_W - 95 - 105 - 62 - 40 - 55],
        align=["l", "l", "l", "r", "l", "r"],
        title="Cártama",
    )

    # ---------------- Fase 1: Zona Cártama ----------------
    doc.new_page("Fase 1 · Zona natural (≈26 km)", "Cártama y sus pueblos vecinos")
    zrows = [[c["name"], B.ADMIN1_ES.get(c["admin1"], c["admin1"]), fmt_n(c["pop"]), str(B.n_venues(c["pop"]))] for c in d["zone_members"]]
    doc.table(
        ["Municipio", "Provincia", "Habitantes", "Locales"],
        zrows,
        [160, 120, 100, CONTENT_W - 160 - 120 - 100],
        align=["l", "l", "r", "r"],
        total_row=["TOTAL zona Cártama", f"{len(d['zone_members'])} municipios", fmt_n(n_pop(d["zone_members"])), str(n_v(d["zone_members"]))],
    )
    doc.para(
        "Álora, Pizarra, Estación de Cártama y Almogía completan la primera corona: municipios a menos "
        "de 26 km que ya comparten proveedores, personal y clientela con Cártama. Es la misma zona que "
        "agruparía un solo cuaderno del atlas."
    )

    # ---------------- Fase 2: Costa del Sol ----------------
    doc.new_page("Fase 2 · Área metropolitana", "Costa del Sol y área de Málaga (≈35 km)")
    crows = []
    tot_muni = tot_vv = tot_pp = 0
    for dist, h in d["near_heads"]:
        members = d["groups"].get(h["id"], [])
        nmuni, nv, pop = len(members), n_v(members), n_pop(members)
        tot_muni += nmuni
        tot_vv += nv
        tot_pp += pop
        crows.append([h["name"], f"{dist:.0f} km", str(nmuni), fmt_n(pop), str(nv)])
    doc.table(
        ["Cabecera de zona", "Distancia", "Municipios", "Habitantes", "Locales"],
        crows,
        [140, 65, 75, 100, CONTENT_W - 140 - 65 - 75 - 100],
        align=["l", "r", "r", "r", "r"],
        total_row=["TOTAL área metropolitana", "", str(tot_muni), fmt_n(tot_pp), str(tot_vv)],
    )
    doc.para(
        "Con Málaga capital, Marbella, Mijas, Fuengirola, Torremolinos y Benalmádena como cabeceras "
        "grandes, esta corona añade formatos que Cártama no tiene: kiosco de playa en el litoral, "
        "flagship y food hall en Málaga capital, y el primer rooftop del grupo si la ciudad supera el "
        "umbral de población."
    )

    # ---------------- Fase 3: Málaga provincia ----------------
    doc.new_page("Fase 3 · Provincia", "Málaga completa")
    mp = d["malaga_prov"]
    doc.kpis([
        (str(len(mp)), "Municipios"),
        (fmt_n(n_pop(mp)), "Habitantes"),
        (str(n_v(mp)), "Locales potenciales"),
    ])
    top_mp = sorted(mp, key=lambda c: (-B.n_venues(c["pop"]), -c["pop"]))[:16]
    doc.table(
        ["Municipio", "Habitantes", "Locales"],
        [[c["name"], fmt_n(c["pop"]), str(B.n_venues(c["pop"]))] for c in top_mp],
        [260, 140, CONTENT_W - 260 - 140],
        align=["l", "r", "r"],
    )
    doc.para("Los 16 municipios con más locales potenciales de la provincia; el resto —hasta " + str(len(mp)) + "— completa la cobertura de barrio a barrio.")

    # ---------------- Fase 4: Andalucía ----------------
    doc.new_page("Fase 4 · Comunidad autónoma", "Andalucía completa")
    an = d["andalucia"]
    doc.kpis([
        (str(len(an)), "Municipios"),
        (fmt_n(n_pop(an)), "Habitantes"),
        (str(n_v(an)), "Locales potenciales"),
    ])
    prov_rows = []
    for prov, cs in sorted(d["by_prov_and"].items(), key=lambda kv: -n_v(kv[1])):
        prov_rows.append([prov, str(len(cs)), fmt_n(n_pop(cs)), str(n_v(cs))])
    doc.table(
        ["Provincia", "Municipios", "Habitantes", "Locales"],
        prov_rows,
        [160, 110, 130, CONTENT_W - 160 - 110 - 130],
        align=["l", "r", "r", "r"],
        total_row=["TOTAL Andalucía", str(len(an)), fmt_n(n_pop(an)), str(n_v(an))],
    )

    # ---------------- Fase 5: España ----------------
    doc.new_page("Fase 5 · País", "España completa")
    es = d["es"]
    doc.kpis([
        (str(len(es)), "Municipios"),
        (fmt_n(n_pop(es)), "Habitantes"),
        (str(n_v(es)), "Locales potenciales"),
        (f"×{n_v(es) / max(1, B.n_venues(c0['pop'])):,.0f}".replace(",", "."), "Crecimiento desde Cártama"),
    ])
    ccaa_rows = []
    for ccaa, cs in sorted(d["by_ccaa"].items(), key=lambda kv: -n_v(kv[1])):
        ccaa_rows.append([B.ADMIN1_ES.get(ccaa, ccaa), str(len(cs)), fmt_n(n_pop(cs)), str(n_v(cs))])
    doc.table(
        ["Comunidad autónoma", "Municipios", "Habitantes", "Locales"],
        ccaa_rows,
        [175, 105, 120, CONTENT_W - 175 - 105 - 120],
        align=["l", "r", "r", "r"],
        total_row=["TOTAL España", str(len(es)), fmt_n(n_pop(es)), str(n_v(es))],
    )

    # ---------------- Fases 6-11: continentes ----------------
    cont_defs = [
        ("Fase 6 · Continente", "Europa (resto, sin España)", "EU", True),
        ("Fase 7 · Continente", "Asia y Oriente Medio", "AS", False),
        ("Fase 8 · Continente", "América del Norte y Central", "NA", False),
        ("Fase 9 · Continente", "América del Sur", "SA", False),
        ("Fase 10 · Continente", "África", "AF", False),
        ("Fase 11 · Continente", "Oceanía", "OC", False),
    ]
    for phase_label, title, code, exclude_es in cont_defs:
        doc.new_page(phase_label, title)
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if exclude_es:
            lst = [x for x in lst if x[2] != "ES"]
        tot_v = sum(x[0] for x in lst)
        tot_m = sum(x[1] for x in lst)
        doc.kpis([
            (str(len(lst)), "Países"),
            (fmt_n(tot_m), "Municipios"),
            (fmt_n(tot_v), "Locales potenciales"),
        ])
        rows = [[name, cc, fmt_n(nmuni), fmt_n(nv)] for nv, nmuni, cc, name in lst[:18]]
        doc.table(
            ["País", "ISO", "Municipios", "Locales"],
            rows,
            [200, 45, 110, CONTENT_W - 200 - 45 - 110],
            align=["l", "l", "r", "r"],
            total_row=["TOTAL " + title, "", fmt_n(tot_m), fmt_n(tot_v)],
        )
        if len(lst) > 18:
            doc.para(f"Se muestran los 18 países con más locales potenciales; el resto —hasta {len(lst)}— completa la cobertura continental.")

    # ---------------- Cierre: mundo ----------------
    doc.new_page("Cierre del círculo", "Cobertura mundial total")
    doc.kpis([
        (fmt_n(total_muni_world), "Municipios"),
        (fmt_n(total_world), "Locales potenciales"),
        ("50", "Marcas propias"),
        ("11", "Formatos de local"),
    ])
    doc.para(
        "El punto de llegada es el mismo modelo que hoy alimenta el atlas mundial de Horizon: "
        f"{fmt_n(total_world)} locales potenciales en {fmt_n(total_muni_world)} municipios de todos los "
        "países, cada uno con dirección real de OpenStreetMap, tamaño según su población, formato según "
        "las características reales de la ciudad y mezcla de marcas ponderada por la cocina que más se "
        "consume en esa zona."
    )
    doc.gap(6)
    doc.h2("Progresión acumulada, fase a fase")
    cum_rows = []
    acc = 0
    seq = [
        ("Fase 0", B.n_venues(c0["pop"])),
        ("Fase 1", n_v(d["zone_members"])),
        ("Fase 2", sum(n_v(d["groups"].get(h["id"], [])) for _, h in d["near_heads"])),
        ("Fase 3", n_v(d["malaga_prov"])),
        ("Fase 4", n_v(d["andalucia"])),
        ("Fase 5", n_v(d["es"])),
        ("Fase 6", n_v(d["es"]) + sum(x[0] for x in d["by_cont"].get("EU", []) if x[2] != "ES")),
    ]
    running_extra = seq[-1][1]
    for label, code in [("Fase 7", "AS"), ("Fase 8", "NA"), ("Fase 9", "SA"), ("Fase 10", "AF"), ("Fase 11", "OC")]:
        running_extra += sum(x[0] for x in d["by_cont"].get(code, []))
        seq.append((label, running_extra))
    labels_scope = [
        "Cártama", "Zona Cártama", "Costa del Sol", "Prov. Málaga", "Andalucía", "España",
        "+ Europa", "+ Asia/O. Medio", "+ América N/C", "+ América del Sur", "+ África", "Mundo completo",
    ]
    for (label, cumval), scope in zip(seq, labels_scope):
        pct = 100.0 * cumval / total_world
        cum_rows.append([label, scope, fmt_n(cumval), f"{pct:.1f}%"])
    doc.table(
        ["Fase", "Alcance acumulado", "Locales acumulados", "% del objetivo mundial"],
        cum_rows,
        [70, 170, 140, CONTENT_W - 70 - 170 - 140],
        align=["l", "l", "r", "r"],
    )

    # ---------------- Riesgos y palancas ----------------
    doc.new_page("Estrategia", "Riesgos y palancas de la expansión")
    doc.h2("Palancas a favor")
    doc.bullets([
        "El motor de datos es el mismo en todas las fases: no hay que rediseñar el modelo al cruzar fronteras, solo cambia el país de entrada.",
        "La cocina dominante por país ya prioriza sabores locales, lo que reduce el riesgo de lanzar una marca equivocada en el primer lote.",
        "Los formatos ligados a la ciudad real (playa, estación, mall, polígono, azotea) evitan sobreconstruir formatos caros donde no hay demanda para ellos.",
        "Cada fase reutiliza la infraestructura de la anterior: proveedores, personal formado y conocimiento de marca de la zona vecina.",
    ])
    doc.gap(6)
    doc.h2("Riesgos a vigilar")
    doc.bullets([
        "Food hall y estadio se aproximan a partir de la población de la ciudad, no de un mercado o estadio verificado uno a uno; conviene validar sobre el terreno antes de construir esos formatos concretos.",
        "La estacionalidad turística de la Costa del Sol (fase 2) puede distorsionar la demanda real frente a la estimada por población censada.",
        "En mercados con alquileres muy altos (grandes capitales asiáticas y norteamericanas) el ritmo de apertura debe ajustarse al flujo de caja, no solo al mapa.",
        "La normativa local de licencias y horarios varía mucho entre fases; cada salto de país requiere validación legal propia antes de firmar el primer local.",
    ])

    # ---------------- Del plan regional al calendario por marca ----------------
    labele = B.phase_period(B.N_PHASES)[2]
    total_brand_target = sum(d["brand_counts"])
    doc.new_page("Ejecución", "Del plan regional al calendario por marca")
    total_pdfs = fmt_n(50 * B.N_PHASES)
    doc.para(
        f"Las fases 0 a 11 reparten el territorio (de Cártama al mundo); a partir de aquí, cada una de "
        f"las 50 marcas propias ejecuta ese reparto con su propio calendario de apertura, dividido en "
        f"{B.N_PHASES} fases — un PDF por fase, {total_pdfs} documentos en total, entregados en 50 ZIP "
        "(uno por marca, con sus 500 fases dentro)."
    )
    doc.gap(4)
    doc.para(
        "El orden de apertura dentro de cada marca es aleatorio real y muy salteado por el mundo: no "
        "sigue el orden geográfico de este documento, así que una marca puede abrir en Londres, seguir "
        "por doce ciudades de otros continentes y volver a abrir en Londres varias fases después. Lo "
        "único fijo es el calendario: la fase N cae siempre en el mismo mes para las 50 marcas, así que "
        "los planes son comparables fase a fase."
    )
    doc.gap(8)
    doc.kpis([
        (B.phase_period(1)[2], "Fase 1 (inicio del calendario)"),
        (str(B.N_PHASES), "Fases por marca"),
        ("50", "Marcas · calendario propio"),
        (f"{50 * B.N_PHASES:,}".replace(",", "."), "PDF de fase en total"),
    ])
    doc.gap(4)
    doc.h2("Calendario común")
    cal_rows = [
        ["Cadencia", "1 fase = 1 mes natural, igual para las 50 marcas"],
        ["Fase 1", B.phase_period(1)[2]],
        [f"Fase {B.N_PHASES}", labele],
        ["Duración total del calendario", f"{B.N_PHASES} meses (~{B.N_PHASES / 12:.0f} años)"],
        ["Locales del modelo (50 marcas, 500 fases)", fmt_n(total_brand_target)],
        ["Ritmo medio por marca y fase", f"≈{total_brand_target / 50 / B.N_PHASES:.0f} locales/fase"],
        ["Ritmo medio del grupo (50 marcas) por fase", f"≈{total_brand_target / B.N_PHASES:.0f} locales/mes"],
    ]
    doc.table(["Parámetro", "Valor"], cal_rows, [230, CONTENT_W - 230], align=["l", "l"])
    doc.gap(4)
    doc.para(
        "El total de 500 fases por marca reparte, en cada una, los locales que le corresponden a esa "
        "marca según la cocina dominante de cada país (igual que en el atlas): unas marcas de comida "
        "rápida superan los 38.000 locales a lo largo del calendario; algunas marcas de lujo, más "
        "selectivas, se quedan cerca de los 30.000. El detalle exacto de cada marca está en el anexo "
        "final de este documento y, fase a fase, en su propio ZIP."
    )

    # ---------------- Modelo de inversión ----------------
    doc.new_page("Ejecución", "Modelo de inversión por local")
    doc.para(
        "Cada local de los PDF de fase por marca lleva cuatro partidas de inversión estimada, calculadas "
        "a partir del tamaño real del formato (m² y aforo) y del nivel de costes del país (salario/hora "
        "de js/world.js, la misma fuente que usa el simulador para sueldos e inflación):"
    )
    doc.gap(4)
    doc.bullets([
        "Alquiler / Compra: el 72% de los locales se abren en alquiler (fianza + 6 meses de renta); el resto se compra, a un precio ≈ alquiler mensual × 108 (misma fórmula que el simulador).",
        "Obra: ≈950 €/m² en España, escalado por el salario/hora del país frente al de España (4,2 €/h).",
        "Mobiliario: ≈300 €/m² en España, con el mismo escalado por coste laboral del país.",
        "Stock inicial: ≈140 €/plaza en España (materia prima, vajilla, uniformes de arranque), también escalado.",
    ], size=8.6, leading=12)
    doc.gap(6)
    doc.h2("Ejemplo: un Local (42 plazas, 140 m²) en tres países")
    ex_rows = []
    for cc, m2, seats in [("ES", 140, 42), ("US", 140, 42), ("IN", 140, 42)]:
        ce = B.COUNTRY_ECON.get(cc, {"wage": 15.0, "name": cc})
        scale = max(0.12, ce["wage"] / 4.2)
        obra = m2 * 950 * scale
        mob = m2 * 300 * scale
        stock = seats * 140 * scale
        ex_rows.append([ce["name"], f"{ce['wage']:.1f} €/h", fmt_eur(obra), fmt_eur(mob), fmt_eur(stock), fmt_eur(obra + mob + stock)])
    doc.table(
        ["País", "Salario/h", "Obra", "Mobiliario", "Stock inicial", "Subtotal*"],
        ex_rows,
        [120, 65, 90, 90, 90, CONTENT_W - 120 - 65 - 90 - 90 - 90],
        align=["l", "r", "r", "r", "r", "r"],
    )
    doc.para("* Subtotal de obra + mobiliario + stock inicial; no incluye alquiler/compra del local.", size=7.6, color=GRAY)

    # ---------------- Marco legal y fiscal por continente ----------------
    doc.new_page("Marco legal", "Riesgos legales, fiscales y de tipo de cambio por continente")
    doc.para(
        "Cada vez que una marca entra por primera vez en un país nuevo, su PDF de fase incluye esta "
        "misma nota de riesgo, con el impuesto de sociedades y el IVA reales del país (js/world.js). "
        "Aquí va el resumen por continente, con los tres países de más peso de cada uno."
    )
    doc.gap(6)
    cont_order = [("EU", "Europa"), ("AS", "Asia"), ("NA", "América del Norte y Central"),
                  ("SA", "América del Sur"), ("AF", "África"), ("OC", "Oceanía")]
    for code, cname in cont_order:
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if not lst:
            continue
        doc.h2(cname)
        doc.para(B.REGION_RISK.get(code, ""), size=8.8, leading=11.8)
        doc.gap(2)
        top3 = lst[:3]
        rows = []
        for nv, nmuni, cc, name in top3:
            ce = B.COUNTRY_ECON.get(cc, {})
            tax = ce.get("tax")
            vat = ce.get("vat")
            rows.append([
                name,
                f"{tax * 100:.0f}%" if tax is not None else "—",
                f"{vat * 100:.0f}%" if vat is not None else "—",
                fmt_n(nv),
            ])
        doc.table(
            ["País de referencia", "Imp. sociedades", "IVA", "Locales potenciales"],
            rows,
            [200, 110, 90, CONTENT_W - 200 - 110 - 90],
            align=["l", "r", "r", "r"],
        )
        doc.gap(6)

    # ---------------- Directorio mundial de municipios ----------------
    doc.new_page("Directorio mundial", "Todos los municipios del mundo, país a país")
    doc.para(
        f"Listado completo de los {fmt_n(total_muni_world)} municipios del mundo con población registrada "
        "en GeoNames — el mismo universo que alimenta el atlas y el reparto de las 50 marcas — ordenado "
        "de forma jerárquica y geográfica: continente, país (de mayor a menor tamaño) y, dentro de cada "
        "país, municipio de mayor a menor población. Es la base territorial completa sobre la que se "
        "construye el calendario aleatorio de cada marca."
    )
    doc.gap(6)
    for code, cname in cont_order:
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if not lst:
            continue
        doc.new_page("Directorio mundial", cname)
        tot_nv = sum(x[0] for x in lst)
        tot_nm = sum(x[1] for x in lst)
        doc.kpis([
            (str(len(lst)), "Países"),
            (fmt_n(tot_nm), "Municipios"),
            (fmt_n(tot_nv), "Locales potenciales"),
        ])
        for nv, nmuni, cc, name in lst:
            cs = sorted(d["by_cc"].get(cc, []), key=lambda c: -c["pop"])
            if not cs:
                continue
            doc.h2(f"{name}  ·  {nmuni} municipios  ·  {fmt_n(nv)} locales potenciales")
            rows = [[c["name"], c["admin1"], fmt_n(c["pop"]), str(B.n_venues(c["pop"]))] for c in cs]
            doc.table(
                ["Municipio", "Región", "Habitantes", "Locales"],
                rows,
                [190, 175, 100, CONTENT_W - 190 - 175 - 100],
                size=7.4,
                align=["l", "l", "r", "r"],
                phase_label=f"Directorio mundial · {cname}",
                title=name,
                total_row=[f"TOTAL {name}", f"{nmuni} municipios", fmt_n(n_pop(cs)), fmt_n(nv)],
            )
            doc.gap(4)

    # ---------------- Portafolio de marcas ----------------
    doc.new_page("Anexo", "Portafolio de las 50 marcas")
    doc.para(
        "Las mismas 50 marcas viajan por todas las fases; lo que cambia es su peso relativo según la "
        "cocina dominante de cada país y el formato disponible en cada municipio. El número bajo cada "
        "marca es su objetivo total a lo largo de sus 500 fases (mismo reparto que el atlas mundial); "
        "el detalle fase a fase está en horizon_plan_marca_<código>.zip."
    )
    doc.gap(6)
    c = doc.c
    cols = 5
    cell_w = CONTENT_W / cols
    cell_h = 82
    x0, y0 = MARGIN, doc.y
    pos = 0  # índice relativo a la página actual de la rejilla (se reinicia en cada salto de página)
    for idx, (bid, name, cuisine, tier, tag) in enumerate(B.BRANDS):
        col = pos % cols
        row = pos // cols
        if row * cell_h > y0 - 30:
            doc.new_page("Anexo", "Portafolio de las 50 marcas (cont.)")
            x0, y0 = MARGIN, doc.y
            pos = 0
            col, row = 0, 0
        x = x0 + col * cell_w
        y = y0 - row * cell_h
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x + 2, y - cell_h + 6, cell_w - 4, cell_h - 8, 4, fill=1, stroke=0)
        B.draw_logo(c, bid, x + 8, y - 30, 22)
        c.setFillColorRGB(*NAVY)
        c.setFont("DejaVuBold", 8)
        c.drawString(x + 34, y - 16, name[:20])
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7)
        cuisine_lines = B.wrap(c, cuisine, "DejaVu", 7, cell_w - 40)
        c.drawString(x + 34, y - 26, cuisine_lines[0] if cuisine_lines else cuisine)
        c.setFillColorRGB(*GREEN)
        c.setFont("DejaVuBold", 7.2)
        c.drawString(x + 8, y - 40, f"{fmt_n(d['brand_counts'][idx])} locales · 500 fases")
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 6.2)
        c.drawString(x + 8, y - 51, f"horizon_plan_marca_{bid}.zip")
        c.setFillColorRGB(*RED)
        c.setFont("DejaVu", 6.6)
        c.drawString(x + 8, y - cell_h + 14, B.TIER_LABEL.get(tier, tier))
        pos += 1
    doc.y = y0 - (((pos - 1) // cols) + 1) * cell_h

    doc.save()
    print("PDF escrito:", OUT_PDF, OUT_PDF.stat().st_size, "bytes", "páginas~", doc.page_no + 2)


if __name__ == "__main__":
    build()
