#!/usr/bin/env python3
"""Horizon Restaurant Group — atlas PDF por zona (cabecera + pueblos ~26 km).

Cada local lleva ficha con dirección, horario, alquiler/compra y un párrafo
de descripción (cómo es el local y dónde está).
"""
from __future__ import annotations

import argparse
import hashlib
import math
import re
import shutil
import unicodedata
from collections import defaultdict
from multiprocessing import Pool, cpu_count
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from osm_addresses import build_index, district_for

ROOT = Path("/workspace")
GEONAMES = Path("/tmp/geonames")
OUT_ROOT = Path("/tmp/horizon_atlas/Horizon_Atlas_Restaurantes")
HEAD_MIN_POP = 15000
RADIUS_KM = 26.0
CELL = 0.2  # ~22 km; vecinos ±3 cubren el radio también en latitud alta

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

COUNTRY_ES = {}
COUNTRY_RENT = {}


def load_world_js():
    text = (ROOT / "js/world.js").read_text()
    rows = re.findall(
        r'\["([A-Z]{2})","([^"]+)",(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+)\]',
        text,
    )
    for r in rows:
        COUNTRY_ES[r[0]] = r[1]
        COUNTRY_RENT[r[0]] = float(r[10])


ADMIN1_ES = {
    "Andalusia": "Andalucía",
    "Aragon": "Aragón",
    "Asturias": "Asturias",
    "Balearic Islands": "Islas Baleares",
    "Basque Country": "País Vasco",
    "Canary Islands": "Canarias",
    "Cantabria": "Cantabria",
    "Castille and Leon": "Castilla y León",
    "Castille-La Mancha": "Castilla-La Mancha",
    "Catalonia": "Cataluña",
    "Extremadura": "Extremadura",
    "Galicia": "Galicia",
    "La Rioja": "La Rioja",
    "Madrid": "Madrid",
    "Murcia": "Murcia",
    "Navarre": "Navarra",
    "Valencia": "Comunidad Valenciana",
    "Ceuta": "Ceuta",
    "Melilla": "Melilla",
}

BRANDS = [
    ("roble", "Horizon Grill", "asador y carnes", "luxury", "La parrilla de la casa matriz."),
    ("olivo", "Casa Oliva", "mediterránea española", "casual", "Aceite, huerta y mesa larga."),
    ("marea", "Maré", "pescado y mariscos", "casual", "La costa, sin adornos."),
    ("farol", "Sakura House", "japonesa izakaya", "casual", "Japón de diario, con farol."),
    ("nudo", "Tokyo Ramen", "ramen japonés", "casual", "Caldo largo, cola corta."),
    ("cinta", "Kumo Sushi", "sushi de lujo", "luxury", "Nube, cuchillo y pescado."),
    ("wok", "Dragon Wok", "china wok", "casual", "El wok no espera."),
    ("thai", "Bangkok Street", "tailandesa", "casual", "Dulce, ácido, picante, calle."),
    ("monzon", "Bombay Spice", "india", "casual", "Especias de ida y vuelta."),
    ("seul", "Seoul Kitchen", "coreana", "casual", "Parrilla, kimchi y banchan."),
    ("palazzo", "La Trattoria", "italiana", "casual", "La nonna, sin teatro."),
    ("vesubio", "Roma Pasta", "pasta italiana", "casual", "Pasta fresca, agua de Roma."),
    ("pizza", "Napoli 72", "pizza napolitana", "casual", "Horno a 72 horas de masa."),
    ("nieve", "Vesuvio", "pizza moderna", "casual", "Pizza moderna, lava de tomate."),
    ("empanada", "Buenos Aires 1870", "parrilla argentina", "casual", "Parrilla del ochenta setenta."),
    ("arena", "México Lindo", "mexicana de mesa", "casual", "México de mesa, no de paso."),
    ("bao", "Taco Norte", "tacos rápidos", "fast_food", "Taco de mostrador, norte."),
    ("jerk", "Havana", "caribeña cubana", "casual", "Son, cerdo y lima."),
    ("pampa", "Rio Brasa", "rodizio brasileño", "casual", "Rodizio que no se apaga."),
    ("ola", "Andes", "peruana", "casual", "Altura, lima y mar."),
    ("pho", "The Burger Lab", "hamburguesas", "casual", "Hamburguesa de laboratorio."),
    ("bufalo", "Horizon Burgers", "hamburguesas rápidas", "fast_food", "La rápida de la casa."),
    ("pollo", "Chicken District", "pollo frito", "fast_food", "El barrio del pollo crujiente."),
    ("dumpling", "Wing Factory", "alitas", "fast_food", "Alitas en cadena."),
    ("frankfurt", "Urban Dogs", "hot dog", "food_truck", "Perrito de acera."),
    ("carbon", "Fire & Smoke", "barbacoa", "casual", "Humo lento, hambre rápida."),
    ("gyros", "Route 66 Diner", "diner americano", "casual", "Neon, pie y café de jarra."),
    ("nord", "The Steak Room", "asador de lujo", "luxury", "La sala de la carne."),
    ("linterna", "Black Pepper", "cocina contemporánea", "casual", "Cocina contemporánea, pimienta negra."),
    ("mezze", "The Garden Table", "vegetariana", "casual", "La huerta se sienta."),
    ("poke", "Green Bowl", "poké y bowls", "casual", "Bowl verde, hambre clara."),
    ("falafel", "Fresh & Co.", "ensaladas", "fast_food", "Rápido y fresco."),
    ("alpina", "Pasta & Co.", "pasta rápida", "fast_food", "Pasta de mostrador."),
    ("eclipse", "Baker Street", "horno y brunch", "casual", "Horno, mantequilla y periódico."),
    ("cerveza", "Horizon Café", "café y desayunos", "casual", "El café de la matriz."),
    ("vermu", "Dolce Vita", "postres italianos", "casual", "Dulce, italiano, de vitrina."),
    ("tequila", "ChocoLab", "chocolate", "casual", "Cacao de laboratorio."),
    ("bodega", "Gelato Milano", "heladería", "casual", "Helado de manteca, no de prisa."),
    ("whisky", "Sweet Avenue", "pastelería", "casual", "La avenida del azúcar."),
    ("absenta", "Sunrise Brunch", "brunch", "casual", "El día empieza en mesa."),
    ("latitud", "Sky Lounge", "cócteles", "bar", "Azotea, hielo y skyline."),
    ("polar", "Horizon Rooftop", "rooftop de lujo", "luxury", "La vista de la matriz."),
    ("seda", "Noir", "alta cocina", "luxury", "Oscuro, preciso, contemporáneo."),
    ("etoile", "Élan", "alta cocina francesa", "luxury", "Francia, sin prisa."),
    ("rubi", "The Signature", "alta cocina firma", "luxury", "La firma del grupo."),
    ("mar", "Oceanic", "mariscos de lujo", "luxury", "El mar en mantel."),
    ("sakura", "Terra", "mediterránea de autor", "luxury", "Autor, huerta y Mediterráneo."),
    ("tropico", "Horizon Events", "banquetes", "casual", "Banquetes con sello Horizon."),
    ("doner", "Horizon Express", "comida de viaje", "fast_food", "Estación, aeropuerto, bandeja."),
    ("taco", "Horizon Market", "food hall", "casual", "Un hall, muchos fogones."),
]

SIZES = {
    "kiosco": ("Kiosco", 8, 22),
    "local": ("Local", 42, 140),
    "ghost": ("C. fantasma", 6, 38),
    "flagship": ("Flagship", 140, 480),
    "food_hall": ("Food hall", 168, 640),
    "estadio": ("Estadio", 480, 2800),
}

TIER_LABEL = {
    "food_truck": "Food truck",
    "fast_food": "Comida rápida",
    "casual": "Casual",
    "luxury": "Lujo",
    "bar": "Bar",
}



def h32(*parts) -> int:
    s = "|".join(str(p) for p in parts).encode("utf-8")
    return int.from_bytes(hashlib.sha256(s).digest()[:8], "little")


def rng(seed: int):
    x = seed & 0xFFFFFFFF
    def n():
        nonlocal x
        x = (1664525 * x + 1013904223) & 0xFFFFFFFF
        return x / 4294967296
    return n


def haversine(a, b):
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^\w\s.-]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s or "Zona"


def safe_path(s: str) -> str:
    s = (s or "Zona").replace("/", "-").replace("\\", "-").replace("\0", "").strip()
    return s[:90] or "Zona"


def wrap(c: canvas.Canvas, text: str, font: str, size: float, max_w: float) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if c.stringWidth(t, font, size) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def load_admin(path: Path, key_cols=2):
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line or line.startswith("#"):
            continue
        p = line.split("\t")
        if len(p) < 2:
            continue
        out[p[0]] = p[1]
    return out


def load_cities():
    admin1 = load_admin(GEONAMES / "admin1CodesASCII.txt")
    admin2 = load_admin(GEONAMES / "admin2Codes.txt")
    cities = []
    with open(GEONAMES / "cities1000.txt", encoding="utf-8", errors="replace") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) < 19:
                continue
            pop = int(p[14] or 0)
            if pop < 1000:
                continue
            cc = p[8]
            a1 = p[10]
            a2 = p[11]
            a1n = admin1.get(f"{cc}.{a1}", a1 or "—")
            a1n = ADMIN1_ES.get(a1n, a1n)
            a2n = admin2.get(f"{cc}.{a1}.{a2}", a2 or a1n)
            a2n = re.sub(r"^(Provincia de |Province of |Departamento de |Department of |Municipio de )", "", a2n)
            cities.append({
                "id": int(p[0]),
                "name": p[1],
                "ascii": p[2] or p[1],
                "lat": float(p[4]),
                "lon": float(p[5]),
                "cc": cc,
                "country": COUNTRY_ES.get(cc, cc),
                "admin1": a1n or "—",
                "admin2": a2n or a1n or "—",
                "pop": pop,
            })
    return cities


def cluster(cities):
    cities = sorted(cities, key=lambda c: (-c["pop"], c["id"]))
    grid = defaultdict(list)
    heads = []

    def cells_near(lat, lon):
        i, j = int(lat / CELL), int(lon / CELL)
        lat_scale = max(0.15, abs(math.cos(math.radians(lat))))
        dj_span = max(3, int(RADIUS_KM / (111.0 * CELL * lat_scale)) + 1)
        di_span = max(3, int(RADIUS_KM / (111.0 * CELL)) + 1)
        for di in range(-di_span, di_span + 1):
            for dj in range(-dj_span, dj_span + 1):
                yield i + di, j + dj

    def nearest_head(c, max_km):
        pt = (c["lat"], c["lon"])
        best, bd = None, max_km
        for key in cells_near(c["lat"], c["lon"]):
            for h in grid[key]:
                d = haversine(pt, (h["lat"], h["lon"]))
                if d < bd:
                    best, bd = h, d
        return best

    for c in cities:
        if c["pop"] >= HEAD_MIN_POP:
            heads.append(c)
            grid[(int(c["lat"] / CELL), int(c["lon"] / CELL))].append(c)
        elif nearest_head(c, RADIUS_KM) is None:
            heads.append(c)
            grid[(int(c["lat"] / CELL), int(c["lon"] / CELL))].append(c)

    loc = {}
    by_id = {h["id"]: h for h in heads}
    for c in cities:
        if c["id"] in by_id:
            loc[c["id"]] = c["id"]
            continue
        h = nearest_head(c, RADIUS_KM)
        loc[c["id"]] = h["id"] if h else c["id"]
        if h is None:
            heads.append(c)
            grid[(int(c["lat"] / CELL), int(c["lon"] / CELL))].append(c)
            by_id[c["id"]] = c
    return heads, loc


def n_venues(pop: int) -> int:
    return max(6, min(64, int(round(pop / 1800.0))))


def size_for(tier: str, r) -> str:
    u = r()
    if tier == "luxury":
        return "estadio" if u < 0.18 else "flagship" if u < 0.55 else "local"
    if tier == "food_truck":
        return "kiosco" if u < 0.45 else "ghost" if u < 0.7 else "local"
    if tier == "fast_food":
        return "kiosco" if u < 0.28 else "ghost" if u < 0.5 else "food_hall" if u < 0.62 else "local"
    if tier == "bar":
        return "flagship" if u < 0.25 else "local"
    if u < 0.12:
        return "food_hall"
    if u < 0.22:
        return "flagship"
    if u < 0.38:
        return "kiosco"
    return "local"


def hours_for(tier: str, r):
    days = ["D", "L", "M", "X", "J", "V", "S"]
    if tier == "luxury":
        row = {d: "13:00-16:00" for d in days}
        row["L"] = "cerr."
        return row
    if tier == "bar":
        return {d: "17:00-03:00" for d in days}
    if tier == "food_truck":
        row = {d: "11:00-23:00" for d in days}
        if r() < 0.5:
            row["L"] = "cerr."
            for d in days:
                if d != "L":
                    row[d] = "13:00-16:00"
        return row
    if r() < 0.18:
        return {d: "00:00-24:00" for d in days}
    if r() < 0.35:
        row = {d: "10:00-24:00" for d in days}
        row["V"] = "10:00-02:00"
        row["S"] = "10:00-02:00"
        row["D"] = "10:00-02:00"
        return row
    if tier == "fast_food":
        return {d: "10:00-24:00" for d in days}
    row = {d: "12:00-23:00" for d in days}
    if r() < 0.4:
        row["L"] = "cerr."
    return row


def district_copy(dist: str) -> str:
    return {
        "Playa": "junto al mar, con terraza y ambiente de paseo marítimo",
        "Arenal": "en el arenal y las calles que bajan a la playa",
        "Casco": "en el casco antiguo, entre vecinos de toda la vida y comercio de paso",
        "Centro": "en el centro del pueblo, a un paso de la plaza y los servicios",
        "Estacion": "junto a la estación, pensado para viajeros y recados rápidos",
        "Universidad": "junto al campus, con menú de mediodía y horario de estudiantes",
        "Poligono": "en polígono, con parking y servicio a trabajadores de la zona",
        "Industrial": "en zona industrial, de almuerzo de empresa y entrega a domicilio",
        "Residencial": "en barrio residencial, para familias de la zona",
        "Ensanche": "en el ensanche, en una calle de tráfico diario",
        "Norte": "en el norte del municipio, en trama urbana consolidada",
        "Sur": "en el sur del municipio, entre viviendas y comercio de barrio",
        "Este": "en el este del municipio, en una calle con paso constante",
        "Oeste": "en el oeste del municipio, cerca de viviendas y talleres",
    }.get(dist, "en una calle del municipio, de uso cotidiano")


def format_copy(size_id: str) -> str:
    return {
        "kiosco": "Es un kiosco pequeño (8 plazas, 22 m²): mostrador, para llevar y poco espacio de sala.",
        "local": "Es un local de barrio (42 plazas, 140 m²) con cocina, sala y escaparate a la calle.",
        "ghost": "Es una cocina fantasma (6 plazas, 38 m²): casi sin sala, centrada en delivery y recogida.",
        "flagship": "Es un flagship (140 plazas, 480 m²), el formato grande de la marca en la zona.",
        "food_hall": "Es un food hall (168 plazas, 640 m²) con varios fogones bajo el mismo techo.",
        "estadio": "Es un recinto tipo estadio (480 plazas, 2.800 m²) para eventos y gran afluencia.",
    }.get(size_id, "Es un local de la red Horizon.")


def describe(v, city) -> str:
    kind = "ciudad" if city["pop"] >= 20000 else "villa" if city["pop"] >= 5000 else "pueblo"
    acceso = []
    if v["metro"] and v["ped"]:
        acceso.append("Se llega a pie por zona peatonal y hay metro o cercanías cerca")
    elif v["ped"]:
        acceso.append("Está en calle peatonal; el cliente llega andando")
    elif v["metro"]:
        acceso.append("Tiene parada de metro o tren cerca, útil para delivery y comida de paso")
    else:
        acceso.append("Se llega en coche o autobús; no es zona peatonal")
    art = "una" if kind in ("ciudad", "villa") else "un"
    if v["owned"]:
        negocio = f"El bajo se ofrece en compra ({v['price']:,} €; comunidad {v['community']} €/mes)".replace(",", ".")
    else:
        negocio = f"El bajo está en alquiler ({v['rent']:,} €/mes)".replace(",", ".")
    pop = f"{city['pop']:,}".replace(",", ".")
    return (
        f"{v['brand']} abre este {v['size_name'].lower()} {district_copy(v['district'])} de {city['name']}, "
        f"{art} {kind} de {pop} habitantes en {city['admin2']}, {city['admin1']} ({city['country']}). "
        f"La dirección es {v['address']}. "
        f"Cocina {v['cuisine']}, tramo {TIER_LABEL[v['tier']].lower()}. {v['tagline']} {format_copy(v['size_id'])} "
        f"{acceso[0]}. {negocio}."
    )


def make_venues(city, n):
    rent_ctry = COUNTRY_RENT.get(city["cc"], 40)
    pop_k = city["pop"] / 1000.0
    city_factor = min(2.8, max(0.55, math.log10(pop_k + 10) / 2.2))
    rent_idx = (rent_ctry / 72.0) * city_factor
    out = []
    for i in range(n):
        bid, name, cuisine, tier, tag = BRANDS[i % len(BRANDS)]
        r = rng(h32(city["id"], i, bid))
        size_id = size_for(tier, r)
        if bid == "taco":
            size_id = "food_hall"
        sl, seats, m2 = SIZES[size_id]
        pool = city.get("addrs") or []
        rec = pool[i % len(pool)] if pool else {
            "text": f"{city['name']}, {city['admin2']}, {city['country']}",
            "lat": city["lat"],
            "lon": city["lon"],
        }
        addr = rec["text"]
        dist = district_for(city, rec["lat"], rec["lon"])
        metro = r() < (0.72 if city["pop"] > 80000 else 0.22 if city["pop"] > 15000 else 0.08)
        ped = r() < (0.55 if city["cc"] == "ES" else 0.18)
        mult = 0.55 if size_id == "ghost" else 1.35 if size_id == "food_hall" else 1.0
        rent = max(180, int(round(m2 * 9 * rent_idx * mult)))
        owned = r() < 0.28
        guests = []
        if size_id == "food_hall":
            for g in range(2):
                other = BRANDS[(i + 3 + g * 7) % len(BRANDS)][1]
                if other != name:
                    guests.append(other)
        v = {
            "brand": name,
            "cuisine": cuisine,
            "tier": tier,
            "tagline": tag,
            "size_id": size_id,
            "size_name": sl,
            "seats": seats,
            "m2": m2,
            "district": dist,
            "address": addr,
            "metro": metro,
            "ped": ped,
            "rent": rent,
            "owned": owned,
            "price": int(round(rent * 108)),
            "community": int(round(rent * 0.08)),
            "hours": hours_for(tier, r),
            "guests": guests,
            "title": f"{name} · {city['name']} ({dist})",
        }
        v["desc"] = describe(v, city)
        out.append(v)
    return out


def draw_header(c, head, members, part, nparts, nloc, y, W):
    c.setFillColorRGB(0.11, 0.21, 0.34)
    c.rect(0, y - 18, W, 40, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 14)
    title = head["name"] + (f"  ({part}/{nparts})" if nparts > 1 else "")
    c.drawString(16, y + 6, title)
    c.setFont("DejaVu", 8)
    c.drawString(16, y - 8, f"Horizon Restaurant Group  ·  {head['country']} / {head['admin1']} / {head['admin2']}")
    y -= 28
    c.setFillColorRGB(0.15, 0.18, 0.16)
    c.setFont("DejaVu", 8)
    names = ", ".join(m["name"] for m in members[:18])
    if len(members) > 18:
        names += "…"
    c.drawString(16, y, f"{len(members)} municipios  |  {nloc} locales este cuaderno")
    y -= 11
    c.setFont("DejaVu", 7.5)
    for line in wrap(c, "Cubre: " + names, "DejaVu", 7.5, W - 32):
        c.drawString(16, y, line)
        y -= 10
    c.setFillColorRGB(0.35, 0.4, 0.38)
    c.setFont("DejaVu", 7)
    for line in wrap(
        c,
        "Direcciones reales de OpenStreetMap (calle del municipio y número si consta) y código postal GeoNames. "
        "Cada ficha: cómo es el local, dónde está, metro/peatonal, alquiler o compra y horario.",
        "DejaVu",
        7,
        W - 32,
    ):
        c.drawString(16, y, line)
        y -= 9
    return y - 8


def draw_venue(c, v, y, W, H):
    desc_lines = wrap(c, v["desc"], "DejaVu", 7.4, W - 36)
    need = 58 + 9 * len(desc_lines)
    if y < 28 + need:
        c.showPage()
        y = H - 18
        c.setFillColorRGB(0.11, 0.21, 0.34)
        c.rect(0, y - 4, W, 22, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8)
        c.drawString(16, y + 4, "Horizon Restaurant Group  ·  continúa")
        y -= 18
    c.setFillColorRGB(0.96, 0.94, 0.88)
    c.roundRect(12, y - need + 8, W - 24, need - 4, 6, fill=1, stroke=0)
    c.setFillColorRGB(0.12, 0.14, 0.13)
    c.setFont("DejaVuBold", 10)
    c.drawString(18, y - 6, v["title"][:92])
    c.setFont("DejaVu", 7.5)
    c.setFillColorRGB(0.25, 0.35, 0.32)
    meta = f"{TIER_LABEL[v['tier']]}  ·  {v['size_name']}  ·  {v['seats']} pl  {v['m2']} m²"
    if v["guests"]:
        meta += "  ·  Inv: " + ", ".join(v["guests"])
    c.drawString(18, y - 18, meta[:110])
    c.setFillColorRGB(0.15, 0.18, 0.16)
    c.setFont("DejaVu", 7.4)
    c.drawString(18, y - 29, v["address"][:118])
    yy = y - 40
    c.setFillColorRGB(0.18, 0.22, 0.20)
    for line in desc_lines:
        c.drawString(18, yy, line)
        yy -= 9
    acc = ("Metro" if v["metro"] else "Sin metro") + "  ·  " + ("Peatonal" if v["ped"] else "No peatonal")
    if v["owned"]:
        money = f"Compra {v['price']:,} €   com.{v['community']}/mes".replace(",", ".")
    else:
        money = f"Alquiler {v['rent']:,} €/mes".replace(",", ".")
    c.setFont("DejaVuBold", 7.2)
    c.setFillColorRGB(0.11, 0.35, 0.30)
    c.drawString(18, yy - 2, acc + "  ·  " + money)
    hrs = "   ".join(f"{d} {v['hours'][d]}" for d in ["D", "L", "M", "X", "J", "V", "S"])
    c.setFont("DejaVu", 6.8)
    c.setFillColorRGB(0.25, 0.28, 0.26)
    c.drawString(18, yy - 13, hrs)
    return yy - 22


def write_pdf(path: Path, head, members, venues, part, nparts):
    path.parent.mkdir(parents=True, exist_ok=True)
    W, H = A4
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"Horizon — {head['name']}")
    c.setAuthor("Horizon Restaurant Group")
    y = H - 22
    y = draw_header(c, head, members, part, nparts, len(venues), y, W)
    for v in venues:
        y = draw_venue(c, v, y, W, H)
    c.setFont("DejaVu", 7)
    c.setFillColorRGB(0.4, 0.45, 0.42)
    c.drawString(16, 12, f"Horizon Restaurant Group  |  {head['name']}  |  cabecera {head['name']}")
    c.save()


def build_head(args):
    head, members = args
    members = sorted(members, key=lambda m: (-m["pop"], m["name"]))
    all_v = []
    packed = []
    for m in members:
        nv = n_venues(m["pop"])
        vs = make_venues(m, nv)
        all_v.extend(vs)
        packed.append((m, vs))
    per = 28
    chunks = [all_v[i:i + per] for i in range(0, len(all_v), per)] or [[]]
    nparts = len(chunks)
    folder = OUT_ROOT / safe_path(head["country"]) / safe_path(head["admin1"]) / safe_path(head["admin2"]) / safe_path(head["name"])
    base = "Horizon_" + slug(head["ascii"] or head["name"]).replace(" ", "_")
    paths = []
    # rewrite chunks grouped by original order of packed venues
    flat = []
    for m, vs in packed:
        for v in vs:
            v["_city"] = m["name"]
            flat.append(v)
    chunks = [flat[i:i + per] for i in range(0, max(len(flat), 1), per)]
    nparts = len(chunks)
    for i, ch in enumerate(chunks, 1):
        fn = f"{base}_{i:02d}.pdf" if nparts > 1 else f"{base}.pdf"
        p = folder / fn
        write_pdf(p, head, members, ch, i, nparts)
        paths.append(str(p))
    return len(paths), len(flat)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cc", default="", help="ISO country filter, e.g. ES")
    ap.add_argument("--limit-heads", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=max(1, cpu_count()))
    args = ap.parse_args()
    load_world_js()
    print("loading cities…")
    cities = load_cities()
    if args.cc:
        cities = [c for c in cities if c["cc"] == args.cc.upper()]
    print("cities", len(cities))
    print("real OSM addresses…")
    addrs = build_index(cities)
    for c in cities:
        c["addrs"] = addrs.get(c["id"], [])
    print("clustering…")
    heads, loc = cluster(cities)
    by_id = {c["id"]: c for c in cities}
    groups = defaultdict(list)
    for cid, hid in loc.items():
        groups[hid].append(by_id[cid])
    work = [(by_id[hid], groups[hid]) for hid in groups]
    work.sort(key=lambda x: -x[0]["pop"])
    if args.limit_heads:
        work = work[: args.limit_heads]
    print("zones", len(work), "jobs", args.jobs)
    OUT_ROOT.parent.mkdir(parents=True, exist_ok=True)
    if OUT_ROOT.exists():
        shutil.rmtree(OUT_ROOT)
    n_pdf = n_loc = 0
    done = 0
    if args.jobs == 1 or len(work) < 8:
        for w in work:
            a, b = build_head(w)
            n_pdf += a
            n_loc += b
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(work)} zones  pdfs={n_pdf} locales={n_loc}", flush=True)
    else:
        with Pool(args.jobs) as pool:
            for a, b in pool.imap_unordered(build_head, work, chunksize=8):
                n_pdf += a
                n_loc += b
                done += 1
                if done % 200 == 0:
                    print(f"  {done}/{len(work)} zones  pdfs={n_pdf} locales={n_loc}", flush=True)
    leeme = OUT_ROOT.parent / "LEEME.txt"
    leeme.write_text(
        "HORIZON RESTAURANT GROUP — Atlas por zona (municipio cabecera + pueblos cercanos)\n"
        "================================================================================\n"
        "Pais / region o CCAA / provincia / cabecera /\n\n"
        "Cada carpeta de cabecera incluye los municipios de alrededor (~26 km).\n"
        "Cada local tiene descripción de cómo es y dónde se encuentra.\n"
        "Las direcciones son reales: calles (y números si constan) de OpenStreetMap\n"
        "del propio municipio, con código postal GeoNames.\n\n"
        f"Zonas: {len(work)}\nLocales: {n_loc}\nPDF: {n_pdf}\n",
        encoding="utf-8",
    )
    print("done pdfs", n_pdf, "locales", n_loc)


if __name__ == "__main__":
    main()
