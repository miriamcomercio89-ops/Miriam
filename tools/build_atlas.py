#!/usr/bin/env python3
"""Horizon Restaurant Group — atlas PDF por zona (cabecera + pueblos ~26 km).

Cada local lleva ficha con dirección OSM, horario, alquiler/compra y un
PROMPT DE IMAGEN de la fachada (peatonal, playa, estación, mall, etc.).
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import math
import re
import shutil
import unicodedata
import zipfile
from collections import defaultdict
from multiprocessing import Pool, cpu_count
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
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

LOGO_DIR = ROOT / "img" / "filiales"
LOGO_CACHE = {}

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

TERRITORY_ES = {
    "AX": "Islas Åland", "BL": "San Bartolomé", "BQ": "Caribe Neerlandés", "BV": "Isla Bouvet",
    "CC": "Islas Cocos", "CK": "Islas Cook", "CW": "Curazao", "CX": "Isla de Navidad",
    "EH": "Sáhara Occidental", "FK": "Islas Malvinas", "FO": "Islas Feroe", "GF": "Guayana Francesa",
    "GG": "Guernsey", "GI": "Gibraltar", "GL": "Groenlandia", "GP": "Guadalupe", "GS": "Georgia del Sur",
    "GU": "Guam", "HK": "Hong Kong", "HM": "Islas Heard y McDonald", "IM": "Isla de Man",
    "IO": "Territorio Británico del Océano Índico", "JE": "Jersey", "KY": "Islas Caimán",
    "MF": "San Martín", "MO": "Macao", "MP": "Islas Marianas del Norte", "MQ": "Martinica",
    "MS": "Montserrat", "NC": "Nueva Caledonia", "NF": "Isla Norfolk", "NU": "Niue",
    "PF": "Polinesia Francesa", "PM": "San Pedro y Miquelón", "PN": "Islas Pitcairn",
    "PR": "Puerto Rico", "PS": "Palestina", "RE": "Reunión", "SH": "Santa Elena",
    "SJ": "Svalbard y Jan Mayen", "SS": "Sudán del Sur", "SX": "Sint Maarten",
    "TC": "Islas Turcas y Caicos", "TF": "Tierras Australes Francesas", "TK": "Tokelau",
    "TL": "Timor Oriental", "UM": "Islas menores de EE. UU.", "VA": "Ciudad del Vaticano",
    "VG": "Islas Vírgenes Británicas", "VI": "Islas Vírgenes de EE. UU.", "WF": "Wallis y Futuna",
    "XK": "Kosovo", "YT": "Mayotte", "AN": "Antillas Neerlandesas", "CS": "Serbia y Montenegro",
    "KM": "Comoras",
    "AG": "Antigua y Barbuda", "AS": "Samoa Americana", "AW": "Aruba", "BB": "Barbados",
    "BM": "Bermudas", "BS": "Bahamas", "DM": "Dominica", "FM": "Micronesia", "GD": "Granada",
    "KI": "Kiribati", "KN": "San Cristóbal y Nieves", "KP": "Corea del Norte",
    "LC": "Santa Lucía", "MH": "Islas Marshall", "NR": "Nauru", "PG": "Papúa Nueva Guinea",
    "PW": "Palaos", "SB": "Islas Salomón", "SC": "Seychelles", "ST": "Santo Tomé y Príncipe",
    "TV": "Tuvalu", "VC": "San Vicente y las Granadinas", "VU": "Vanuatu", "WS": "Samoa",
}

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


# Gustos dominantes por país (mismo modelo que el simulador, js/saborama.js::TASTE),
# usados para que la cocina más consumida en la zona predomine entre las 50 marcas.
TASTE_CC = {
    "ES": ["española", "tapas", "mediterránea", "brunch"],
    "PT": ["portuguesa", "mediterránea", "pescado"],
    "FR": ["francesa", "alta cocina", "mediterránea", "brunch"],
    "IT": ["italiana", "pizza", "alta cocina", "pasta", "postres"],
    "GR": ["griega", "mediterránea"],
    "TR": ["turca", "kebab"],
    "DE": ["alemana", "hot dog", "cerveza"],
    "GB": ["británica", "pescado", "pub", "brunch", "café"],
    "IE": ["británica", "pub"],
    "PL": ["polaca", "del este"],
    "RU": ["del este"],
    "US": ["americana", "hamburguesas", "barbacoa", "diner"],
    "CA": ["americana", "hamburguesas", "diner"],
    "MX": ["mexicana", "tex-mex", "tequila"],
    "AR": ["argentina", "empanadas", "parrilla"],
    "BR": ["brasileña", "parrilla"],
    "PE": ["peruana"],
    "CL": ["parrilla", "mediterránea"],
    "CO": ["empanadas"],
    "JP": ["japonesa", "sushi", "ramen", "izakaya", "kaiseki"],
    "KR": ["coreana"],
    "CN": ["china", "bao", "dim sum", "cantonesa", "wok"],
    "TW": ["china", "dim sum"],
    "HK": ["china", "dim sum", "cantonesa"],
    "TH": ["tailandesa"],
    "VN": ["vietnamita"],
    "IN": ["india"],
    "PK": ["india"],
    "ID": ["china"],
    "MY": ["china", "india"],
    "PH": ["china"],
    "SG": ["china", "india", "malasia"],
    "MA": ["marroquí", "magrebí"],
    "TN": ["magrebí", "mediterránea"],
    "DZ": ["magrebí"],
    "EG": ["levantina"],
    "LB": ["libanesa", "levantina", "mediterránea"],
    "JO": ["levantina"],
    "IL": ["levantina"],
    "AE": ["levantina", "india"],
    "SA": ["levantina"],
    "JM": ["caribeña"],
    "CU": ["caribeña", "cubana"],
    "DO": ["caribeña"],
    "TT": ["caribeña"],
    "AU": ["americana", "poké", "hawaiana"],
    "NZ": ["pescado"],
    "ZA": ["barbacoa"],
    "NG": ["caribeña"],
    "KE": ["caribeña"],
    "CH": ["suiza", "alpina", "francesa"],
    "AT": ["alpina"],
    "SE": ["nórdica"],
    "NO": ["nórdica", "pescado"],
    "DK": ["nórdica"],
    "FI": ["nórdica"],
    "NL": ["pub", "cerveza"],
    "BE": ["francesa", "cerveza"],
    "HU": ["del este"],
    "CZ": ["del este", "cerveza"],
    "RO": ["del este"],
}

# Tokens de sabor asociados a cada marca (BID) para casar con TASTE_CC.
BID_TASTE = {
    "roble": ["parrilla", "barbacoa", "alpina"],
    "olivo": ["española", "mediterránea", "tapas"],
    "marea": ["pescado", "nórdica"],
    "farol": ["japonesa", "izakaya"],
    "nudo": ["japonesa", "ramen"],
    "cinta": ["japonesa", "sushi"],
    "wok": ["china", "wok"],
    "thai": ["tailandesa", "vietnamita"],
    "monzon": ["india"],
    "seul": ["coreana"],
    "palazzo": ["italiana", "pasta"],
    "vesubio": ["italiana", "pasta"],
    "pizza": ["italiana", "pizza"],
    "nieve": ["italiana", "pizza"],
    "empanada": ["argentina", "parrilla", "empanadas"],
    "arena": ["mexicana"],
    "bao": ["mexicana", "tex-mex"],
    "jerk": ["caribeña", "cubana"],
    "pampa": ["brasileña", "parrilla"],
    "ola": ["peruana"],
    "pho": ["americana", "hamburguesas"],
    "bufalo": ["americana", "hamburguesas"],
    "pollo": ["americana"],
    "dumpling": ["americana"],
    "frankfurt": ["alemana", "hot dog", "del este", "cerveza", "polaca"],
    "carbon": ["barbacoa", "del este"],
    "gyros": ["americana", "diner"],
    "nord": ["parrilla", "alpina"],
    "linterna": [],
    "mezze": ["mediterránea", "levantina", "magrebí", "marroquí"],
    "poke": ["poké", "hawaiana"],
    "falafel": ["levantina", "magrebí"],
    "alpina": ["italiana", "pasta"],
    "eclipse": ["británica", "brunch"],
    "cerveza": ["café", "pub"],
    "vermu": ["italiana", "postres"],
    "tequila": [],
    "bodega": ["italiana"],
    "whisky": [],
    "absenta": ["brunch"],
    "latitud": [],
    "polar": [],
    "seda": ["alta cocina"],
    "etoile": ["francesa", "alta cocina"],
    "rubi": ["alta cocina"],
    "mar": ["pescado", "nórdica"],
    "sakura": ["mediterránea"],
    "tropico": [],
    "doner": ["turca", "kebab"],
    "taco": [],
}

MONSOON_CC = {"IN", "BD", "MM", "TH", "KH", "LA", "VN", "PH", "ID", "LK", "NP"}
MED_CC = {"ES", "PT", "IT", "GR", "HR", "FR", "MT", "CY", "TR", "TN", "MA"}
ARID_CC = {
    "SA", "AE", "QA", "KW", "BH", "OM", "YE", "IQ", "IR", "JO", "IL", "PS", "EG",
    "LY", "DZ", "TN", "MA", "MR", "SD", "TD", "NE", "ML", "DJ", "SO", "NA", "BW",
    "AU", "AF", "TM", "UZ", "TJ", "PK",
}
COLD_CC = {"RU", "CA", "IS", "GL", "FI", "NO", "SE", "MN", "KZ", "AK"}


ADMIN1_ES = {
    "Andalusia": "Andalucía",
    "Aragon": "Aragón",
    "Asturias": "Asturias",
    "Balearic Islands": "Islas Baleares",
    "Basque Country": "País Vasco",
    "Canary Islands": "Canarias",
    "Cantabria": "Cantabria",
    "Castille and Leon": "Castilla y León",
    "Castille and León": "Castilla y León",
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

ARCH_CC = {
    "AD": "granito pirenaico, pizarra y calle estrecha",
    "LU": "piedra y ensanche luxemburgués",
    "MT": "cal y piedra de Malta, persiana",
    "IS": "madera pintada, chapa y luz polar",
    "EE": "ensanche báltico, portal y ladrillo",
    "LV": "art nouveau de Riga o pueblo de madera",
    "LT": "ladrillo báltico y portal",
    "SK": "ensanche, portal y sillería",
    "SI": "alpino o mediterráneo esloveno",
    "RS": "ensanche, estuco y portal",
    "HR": "piedra dálmata o ensanche continental",
    "BG": "estuco, portal y calle de interior",
    "FR": "fachada francesa, piedra o zinc, persiana y balcón",
    "IT": "fachada italiana, persiana, estuco ocre o piedra",
    "PT": "azulejo, cal y persiana, luz atlántica",
    "DE": "ladrillo o entramado, alero y acera ancha",
    "AT": "sillería alpina o ensanche imperial",
    "CH": "madera, piedra y alero alpino",
    "BE": "ladrillo belga, escaparate estrecho",
    "NL": "ladrillo estrecho, canal o calle de bici",
    "GB": "ladrillo victoriano o high street británica",
    "IE": "fachada pintada, high street irlandesa",
    "US": "storefront americano, ladrillo o strip, letrero de caja",
    "CA": "storefront canadiense, ladrillo y nieve o arce",
    "MX": "cal, cantera y color mexicano, portón",
    "AR": "fachada porteña o de interior, persiana y reja",
    "BR": "modernista tropical o colonial, persiana y sombra",
    "CL": "sillar o madera, calle estrecha andina o costera",
    "CO": "balcón colonial, color y patio",
    "PE": "adobe, balcón de madera y cal limeña",
    "JP": "madera, noren y alero, calle estrecha",
    "KR": "hanok urbano o bloque contemporáneo, letrero vertical",
    "CN": "baja con letrero vertical, azulejo o hormigón cotidiano",
    "TW": "baja taiwanesa, toldo y letrero vertical",
    "HK": "bajo de torre, neón y acera estrecha",
    "IN": "baja colorida, toldo y tráfico de motos",
    "TH": "toldo, shophouse y humedad tropical",
    "VN": "shophouse estrecho, balcón y cableado",
    "ID": "shophouse, toldo y calle tropical",
    "MY": "shophouse malayo, persiana y porche",
    "SG": "shophouse o plinto de centro comercial, trópico urbano",
    "AU": "veranda, ladrillo y luz dura australiana",
    "NZ": "madera pintada, veranda y pueblo oceánico",
    "MA": "medina o ensanche, cal, persiana y sombra",
    "TN": "cal, azulejo y persiana magrebí",
    "EG": "bajo de calle densa, persiana y polvo claro",
    "TR": "persiana, sillería otomana o ensanche",
    "GR": "cal blanca, persiana azul o ensanche ateniense",
    "PL": "ensanche centroeuropeo, portal y ladrillo",
    "CZ": "sillería bohemia, portal y alero",
    "HU": "ensanche de Pest, estuco y portal",
    "RO": "estuco, portal y calle de interior",
    "RU": "portal soviético o ensanche, ladrillo y nieve",
    "UA": "ensanche de ladrillo, portal y acera ancha",
    "SE": "madera pintada o ladrillo, luz nórdica",
    "NO": "madera, muelle o calle de fiordo",
    "DK": "ladrillo danés, bicicleta y escaparate",
    "FI": "granito o madera, luz baja nórdica",
    "ZA": "veranda, ladrillo y luz alta",
    "NG": "baja de chapa y hormigón, toldo y calle densa",
    "KE": "baja de ciudad africana, toldo y acera irregular",
    "IL": "cal, persiana y piedra clara o ensanche",
    "AE": "plinto de mall o calle aclimatada, vidrio y sombra",
    "SA": "bajo contemporáneo, piedra clara y sombra",
    "PH": "toldo y baja tropical, acera irregular",
    "PK": "baja densa, toldo y letrero pintado",
    "BD": "baja de ciudad densa, toldo y humedad",
    "IR": "arco, ladrillo y persiana, bazar o ensanche",
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
    "kiosco_playa": ("Kiosco de playa", 6, 14),
    "kiosco_estacion": ("Kiosco de estación", 10, 18),
    "local_mall": ("Local de centro comercial", 36, 110),
    "drive_thru": ("Drive-thru", 24, 90),
    "rooftop": ("Rooftop", 90, 230),
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
                "country": COUNTRY_ES.get(cc) or TERRITORY_ES.get(cc, cc),
                "admin1": a1n or "—",
                "admin2": a2n or a1n or "—",
                "pop": pop,
            })
    return cities


def mark_mall_stadium(cities):
    """Como no hay POI de mall/estadio en el extracto OSM mundial disponible, se aproxima
    'hay un centro comercial o mercado real cerca' / 'hay un estadio real cerca' restringiendo
    esos formatos a las ciudades de mayor población de cada país (las que realmente los tienen)."""
    by_cc = defaultdict(list)
    for c in cities:
        by_cc[c["cc"]].append(c)
    for cc, group in by_cc.items():
        group.sort(key=lambda c: -c["pop"])
        n = len(group)
        mall_n = max(3, min(80, round(n * 0.06) + 3))
        stadium_n = max(1, min(14, round(n * 0.012) + 1))
        for c in group[:mall_n]:
            c["mall_ok"] = True
        for c in group[:stadium_n]:
            c["stadium_ok"] = True


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


def size_for(tier: str, r, pop: int, ctx: dict | None = None) -> str:
    ctx = ctx or {}
    dist = ctx.get("dist") or ""
    beach = bool(ctx.get("beach"))
    metro = bool(ctx.get("metro"))
    mall_ok = bool(ctx.get("mall_ok"))
    stadium_ok = bool(ctx.get("stadium_ok"))
    edge = dist in ("Poligono", "Industrial", "Norte", "Sur", "Este", "Oeste")
    central = dist in ("Centro", "Casco")

    allow = ["kiosco", "local"]
    if pop >= 3500:
        allow.append("ghost")
    if pop >= 22000:
        allow.append("flagship")
    if pop >= 70000 and mall_ok:
        allow.append("food_hall")
    if pop >= 220000 and stadium_ok:
        allow.append("estadio")
    if pop >= 35000 and mall_ok:
        allow.append("local_mall")
    if pop >= 15000 and edge:
        allow.append("drive_thru")
    if pop >= 300000 and central:
        allow.append("rooftop")
    if beach:
        allow.append("kiosco_playa")
    if metro:
        allow.append("kiosco_estacion")

    def pick(order):
        for sid in order:
            if sid in allow:
                return sid
        return "local"

    u = r()
    if tier == "luxury":
        return pick([
            "rooftop" if u < 0.16 else "",
            "estadio" if u < 0.26 else "",
            "flagship" if u < 0.62 else "",
            "local",
        ])
    if tier == "bar":
        return pick(["rooftop" if u < 0.24 else "", "flagship" if u < 0.4 else "", "local"])
    if tier == "food_truck":
        return pick([
            "kiosco_playa" if beach and u < 0.4 else "",
            "kiosco" if u < 0.65 else "",
            "ghost" if u < 0.85 else "",
            "local",
        ])
    if tier == "fast_food":
        return pick([
            "kiosco_playa" if beach and u < 0.22 else "",
            "kiosco_estacion" if metro and u < 0.4 else "",
            "kiosco" if u < 0.55 else "",
            "drive_thru" if u < 0.68 else "",
            "ghost" if u < 0.78 else "",
            "food_hall" if u < 0.85 else "",
            "local",
        ])
    # casual (mayoría de marcas)
    return pick([
        "kiosco_playa" if beach and u < 0.1 else "",
        "food_hall" if u < 0.14 else "",
        "local_mall" if u < 0.24 else "",
        "flagship" if u < 0.34 else "",
        "drive_thru" if u < 0.4 else "",
        "kiosco" if u < 0.5 else "",
        "local",
    ])


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
        "kiosco_playa": "Es un kiosco de playa (6 plazas, 14 m²): caseta o carrito en la arena, para llevar.",
        "kiosco_estacion": "Es un kiosco de estación (10 plazas, 18 m²): mostrador rápido para viajeros.",
        "local_mall": "Es un local de centro comercial (36 plazas, 110 m²) en galería interior, sin fachada a la calle.",
        "drive_thru": "Es un drive-thru (24 plazas, 90 m²) con carril de coche y ventanilla de recogida.",
        "rooftop": "Es un rooftop (90 plazas, 230 m²) en última planta, con vistas a la ciudad.",
    }.get(size_id, "Es un local de la red Horizon.")


def setting_for(v) -> str:
    d = v.get("district") or ""
    sid = v.get("size_id")
    if sid == "kiosco_playa":
        return "caseta o carrito de madera sobre la arena, sombrillas y toallas alrededor"
    if sid == "kiosco_estacion":
        return "mostrador dentro del vestíbulo de una estación de tren o metro, viajeros con maletas"
    if sid == "local_mall":
        return "local en galería interior de un centro comercial, suelo pulido, luz artificial, sin fachada exterior"
    if sid == "drive_thru":
        return "edificio bajo con carril de coche, ventanilla de recogida y señalética de carretera"
    if sid == "rooftop":
        return "terraza en la última planta de un edificio alto, barandilla de cristal y vistas al perfil de la ciudad"
    if d in ("Playa", "Arenal"):
        return "paseo marítimo, fachada frente a la playa, arena y luz de costa"
    if d == "Estacion":
        return "junto a una estación de tren, metro o cercanías, viajeros y marquesina"
    if d == "Casco":
        return "casco antiguo o centro histórico, calle estrecha peatonal"
    if d == "Universidad":
        return "entorno de campus, estudiantes y terrazas de mediodía"
    if d in ("Poligono", "Industrial"):
        return "polígono o naves, parking y tráfico de furgonetas"
    if sid == "food_hall":
        return "entrada de un food hall o mercado gastronómico, varios fogones a la vista"
    if sid == "ghost":
        return "bajo o nave de cocina fantasma, motos de reparto, sin sala al público"
    if sid == "kiosco":
        return "kiosco o puesto de calle, mostrador a la acera"
    if sid == "estadio":
        return "recinto de gran aforo junto a un recinto deportivo o ferial"
    if v.get("ped") and v.get("metro"):
        return "calle peatonal urbana con acceso de metro o cercanías cerca"
    if v.get("ped"):
        return "calle peatonal, terrazas, sin coches"
    if v.get("metro"):
        return "acera urbana a pocos metros de una estación"
    if d == "Centro":
        return "centro del municipio, plaza y comercio de paso"
    if d == "Residencial":
        return "barrio residencial, bajos entre viviendas"
    return "calle comercial cotidiana, bajo con escaparate a la vía"


def climate_for(city, r) -> str:
    cc = city.get("cc") or ""
    lat = abs(city.get("lat") or 0.0)
    if cc in ARID_CC and lat < 45:
        band = "árido"
    elif cc in COLD_CC and lat > 45:
        band = "frío"
    elif lat < 12:
        band = "ecuatorial"
    elif lat < 23.5:
        band = "tropical"
    elif cc in MED_CC:
        band = "mediterráneo"
    elif lat < 38:
        band = "subtropical"
    elif lat < 55:
        band = "templado"
    elif lat < 66:
        band = "frío"
    else:
        band = "polar"

    weather = {
        "ecuatorial": ["cielo cargado y húmedo", "sol de justicia entre nubes bajas", "acabado de chubasco cálido"],
        "tropical": ["calor húmedo y cielo despejado", "luz intensa de trópico", "nubes altas y bochorno"],
        "árido": ["calor seco y polvo claro en el aire", "cielo despejado sin una nube", "luz dura de desierto"],
        "mediterráneo": ["cielo azul y luz seca", "tarde templada sin viento", "sol suave de costa"],
        "subtropical": ["aire cálido y algo de humedad", "cielo mayormente despejado", "luz cálida de tarde"],
        "templado": ["cielo parcialmente nublado", "aire fresco de entretiempo", "llovizna reciente sobre el asfalto"],
        "frío": ["aire frío, abrigos y bufandas", "cielo gris de invierno", "resto de nieve sucia en la acera"],
        "polar": ["frío intenso y luz baja", "nieve reciente y aire muy seco", "cielo despejado y gélido"],
    }.get(band, ["cielo despejado"])

    veg = {
        "ecuatorial": "palmeras y vegetación exuberante al fondo",
        "tropical": "palmeras o vegetación tropical cercana",
        "árido": "vegetación escasa, alguna palmera aislada o ninguna",
        "mediterráneo": "algún ciprés, olivo o palmera de alineación",
        "subtropical": "arbolado de alineación denso",
        "templado": "arbolado de alineación caducifolio",
        "frío": "coníferas o árboles desnudos de invierno",
        "polar": "sin vegetación relevante, superficie helada",
    }.get(band, "arbolado urbano discreto")

    light = ["hora dorada", "mediodía de luz dura", "atardecer con cielo rosado", "última luz de la tarde", "luz suave de mañana"]
    hora = light[int(r() * len(light)) % len(light)]
    w = weather[int(r() * len(weather)) % len(weather)]
    return f"{hora}, {w}, {veg}"


def arch_for(city) -> str:
    a1 = city.get("admin1") or ""
    by_region = {
        "Andalucía": "arquitectura andaluza de cal blanca, rejas y toldo",
        "Cataluña": "ensanche o pueblo catalán, balcones y persiana",
        "Comunidad Valenciana": "fachada mediterránea, persiana y luz dura",
        "Galicia": "piedra granítica, alero y humedad atlántica",
        "País Vasco": "caserío urbano o ensanche, hierro y piedra",
        "Madrid": "granito y ladrillo madrileño, portal de inmueble",
        "Islas Baleares": "marés, persiana verde y luz de isla",
        "Canarias": "volcánico, cal y luz atlántica",
        "Murcia": "huerta y cal, persiana y sol",
        "Castilla y León": "sillería y alero castellano",
        "Castilla-La Mancha": "manchego, cal y ladrillo",
        "Aragón": "ladrillo y alero, calle de interior",
        "Asturias": "cornisa cantábrica, cristalera y humedad",
        "Cantabria": "soportal y piedra, costa o valle",
        "Navarra": "sillar y casco compacto",
        "La Rioja": "sillar y calle de bodega",
        "Extremadura": "granito y cal, plaza de interior",
        "Ceuta": "norte de África español, persiana y estrecho",
        "Melilla": "modernista menor y luz del Rif",
    }
    txt = by_region.get(a1) or ARCH_CC.get(city.get("cc") or "", "")
    if not txt:
        txt = "arquitectura local coherente con el municipio, sin resort"
    return txt[0].upper() + txt[1:] if txt else txt


def image_prompt(v, city) -> str:
    kind = "ciudad" if city["pop"] >= 20000 else "villa" if city["pop"] >= 5000 else "pueblo"
    pop = f"{city['pop']:,}".replace(",", ".")
    cr = rng(h32(city["id"], v["bid"], "clima"))
    clima = climate_for(city, cr)
    gente = ["un par de viandantes al fondo", "alguna persona caminando cerca", "poca gente, sin aglomeración", "un cliente entrando al local"]
    calle = ["algún coche aparcado cerca", "tráfico ligero al fondo", "una bicicleta apoyada cerca", "una moto de reparto pasando"]
    detalle_gente = gente[int(cr() * len(gente)) % len(gente)]
    detalle_calle = calle[int(cr() * len(calle)) % len(calle)]
    return (
        "PROMPT IMAGEN: Fotografía fotorrealista a pie de calle de la fachada del restaurante "
        f"«{v['brand']}» en {city['name']}, {city['admin2']}, {city['admin1']} ({city['country']}). "
        f"{kind.capitalize()} de {pop} habitantes. Formato {v['size_name'].lower()} "
        f"({v['seats']} plazas, {v['m2']} m²), cocina {v['cuisine']}, tramo {TIER_LABEL[v['tier']].lower()}. "
        f"Ubicación: {setting_for(v)}. Dirección de referencia: {v['address']}. "
        f"{arch_for(city)}. Ambiente: {clima}, {detalle_gente}, {detalle_calle}. "
        f"Rótulo claramente legible con el nombre «{v['brand']}». "
        "Óptica 35 mm, luz natural, sin texto extra en la imagen, "
        "sin hotel, sin resort, sin logotipos de otras cadenas, sin interior de comedor a pantalla completa."
    )


def take_addr(city, used: set) -> dict:
    pool = city.get("addrs") or []
    for rec in pool:
        key = rec.get("text") or ""
        if key and key not in used:
            used.add(key)
            return rec
    if pool:
        base = dict(pool[len(used) % len(pool)])
        n = len(used) + 1
        street = (base.get("street") or city["name"]).strip()
        txt = f"{street} s/n, local {n}, {city.get('postcode') or ''} {city['name']}, {city['admin2']}, {city['country']}"
        txt = re.sub(r"\s+", " ", txt).strip(" ,")
        used.add(txt)
        base["text"] = txt
        base["num"] = ""
        return base
    txt = f"{city['name']}, {city['admin2']}, {city['country']}"
    used.add(txt)
    return {"text": txt, "lat": city["lat"], "lon": city["lon"], "metro": False, "ped": False, "beach": False}


def brand_weight(bid: str, liked: set, jitter: float, boost: float = 3.2) -> float:
    w = 1.0
    toks = BID_TASTE.get(bid, [])
    if liked and any(t in liked for t in toks):
        w *= boost
    return w * jitter


def pick_brand_sequence(city, n) -> list[int]:
    """Ordena las 50 marcas para esta ciudad: más peso a la cocina dominante del país
    (predomina lo que más se consume en la zona) con variedad aleatoria real entre
    ciudades similares, y repite marcas populares si hacen falta más de 50 locales."""
    liked = set(TASTE_CC.get(city["cc"], []))
    pr = rng(h32(city["id"], "brandpick"))
    weights = [brand_weight(b[0], liked, 0.7 + pr() * 0.75) for b in BRANDS]
    pool = list(range(len(BRANDS)))
    order = []
    k = min(n, len(BRANDS))
    for _ in range(k):
        total = sum(weights[i] for i in pool)
        u = pr() * total
        acc = 0.0
        chosen = pool[-1]
        for idx in pool:
            acc += weights[idx]
            if u <= acc:
                chosen = idx
                break
        pool.remove(chosen)
        order.append(chosen)
    if n > len(BRANDS):
        # en las repeticiones (locales extra en grandes ciudades) la cocina dominante
        # del país se lleva la mayoría de los huecos, para que predomine de verdad.
        rep_weights = [brand_weight(b[0], liked, 0.8 + pr() * 0.5, boost=9.0) for b in BRANDS]
        total = sum(rep_weights)
        for _ in range(n - len(BRANDS)):
            u = pr() * total
            acc = 0.0
            chosen = len(BRANDS) - 1
            for idx, w in enumerate(rep_weights):
                acc += w
                if u <= acc:
                    chosen = idx
                    break
            order.append(chosen)
    return order


def make_venues(city, n):
    rent_ctry = COUNTRY_RENT.get(city["cc"], 40)
    pop_k = city["pop"] / 1000.0
    city_factor = min(2.8, max(0.55, math.log10(pop_k + 10) / 2.2))
    rent_idx = (rent_ctry / 72.0) * city_factor
    out = []
    used = set()
    sequence = pick_brand_sequence(city, n)
    for i, bi in enumerate(sequence):
        bid, name, cuisine, tier, tag = BRANDS[bi]
        r = rng(h32(city["id"], i, bid))
        rec = take_addr(city, used)
        addr = rec["text"]
        dist = district_for(city, rec["lat"], rec["lon"], rec)
        metro = bool(rec.get("metro"))
        ped = bool(rec.get("ped"))
        beach = bool(rec.get("beach"))
        ctx = {
            "dist": dist,
            "beach": beach,
            "metro": metro,
            "mall_ok": bool(city.get("mall_ok")),
            "stadium_ok": bool(city.get("stadium_ok")),
        }
        size_id = size_for(tier, r, city["pop"], ctx)
        if bid == "taco" and size_id not in ("food_hall",):
            size_id = "food_hall" if (city["pop"] >= 70000 and city.get("mall_ok")) else "local"
        sl, seats, m2 = SIZES[size_id]
        mult = {"ghost": 0.55, "food_hall": 1.35, "rooftop": 1.6, "local_mall": 1.25, "kiosco_playa": 0.9, "kiosco_estacion": 1.1, "drive_thru": 0.85}.get(size_id, 1.0)
        rent = max(180, int(round(m2 * 9 * rent_idx * mult)))
        owned = r() < 0.28
        guests = []
        if size_id == "food_hall":
            for g in range(2):
                other = BRANDS[(bi + 3 + g * 7) % len(BRANDS)]
                if other[1] != name:
                    guests.append(other[1])
        v = {
            "bid": bid,
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
            "lat": rec["lat"],
            "lon": rec["lon"],
            "metro": metro,
            "ped": ped,
            "rent": rent,
            "owned": owned,
            "price": int(round(rent * 108)),
            "community": int(round(rent * 0.08)),
            "hours": hours_for(tier, r),
            "guests": guests,
            "city_name": city["name"],
            "title": f"{name} · {city['name']} ({dist})",
        }
        v["desc"] = image_prompt(v, city)
        out.append(v)
    return out


def logo_img(bid: str):
    if bid in LOGO_CACHE:
        return LOGO_CACHE[bid]
    path = LOGO_DIR / f"{bid}.png"
    img = None
    if path.exists():
        try:
            from io import BytesIO
            from PIL import Image
            im = Image.open(path).convert("RGBA")
            im.thumbnail((72, 72))
            buf = BytesIO()
            im.save(buf, format="PNG", optimize=True)
            buf.seek(0)
            img = ImageReader(buf)
        except Exception:
            try:
                img = ImageReader(str(path))
            except Exception:
                img = None
    LOGO_CACHE[bid] = img
    return img


def draw_logo(c, bid, x, y, size):
    img = logo_img(bid)
    if not img:
        return False
    try:
        c.drawImage(img, x, y, width=size, height=size, mask="auto", preserveAspectRatio=True, anchor="c")
        return True
    except Exception:
        return False


def draw_footer(c, head, page, W):
    c.setFillColorRGB(0.4, 0.45, 0.42)
    c.setFont("DejaVu", 7)
    c.drawString(16, 10, f"Horizon Restaurant Group  |  {head['name']}")
    c.drawRightString(W - 16, 10, str(page))


def draw_zone_map(c, head, members, x, y, w, h):
    lats = [m["lat"] for m in members] or [head["lat"]]
    lons = [m["lon"] for m in members] or [head["lon"]]
    minla, maxla = min(lats), max(lats)
    minlo, maxlo = min(lons), max(lons)
    pad = 0.08
    if maxla - minla < 0.04:
        minla -= 0.04
        maxla += 0.04
    if maxlo - minlo < 0.04:
        minlo -= 0.04
        maxlo += 0.04
    minla -= pad
    maxla += pad
    minlo -= pad
    maxlo += pad
    c.setFillColorRGB(0.93, 0.95, 0.92)
    c.setStrokeColorRGB(0.11, 0.21, 0.34)
    c.setLineWidth(0.6)
    c.rect(x, y, w, h, fill=1, stroke=1)

    def xy(lat, lon):
        px = x + 6 + (lon - minlo) / (maxlo - minlo) * (w - 12)
        py = y + 6 + (lat - minla) / (maxla - minla) * (h - 12)
        return px, py

    c.setFillColorRGB(0.35, 0.45, 0.40)
    for m in members:
        if m["id"] == head["id"]:
            continue
        px, py = xy(m["lat"], m["lon"])
        c.circle(px, py, 2.2, fill=1, stroke=0)
    hx, hy = xy(head["lat"], head["lon"])
    c.setFillColorRGB(0.85, 0.25, 0.18)
    c.circle(hx, hy, 4.0, fill=1, stroke=0)
    c.setFillColorRGB(0.11, 0.21, 0.34)
    c.setFont("DejaVuBold", 6.5)
    c.drawString(min(hx + 6, x + w - 50), hy - 2, head["name"][:18])
    c.setFont("DejaVu", 5.5)
    c.setFillColorRGB(0.3, 0.35, 0.32)
    c.drawString(x + 5, y + 3, "Cabecera en rojo  ·  municipios cubiertos (~26 km)")


def new_page(c, head, page, W, H, subtitle=""):
    c.showPage()
    page[0] += 1
    y = H - 18
    c.setFillColorRGB(0.11, 0.21, 0.34)
    c.rect(0, y - 4, W, 22, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVu", 8)
    label = f"Horizon Restaurant Group  ·  {head['name']}"
    if subtitle:
        label += "  ·  " + subtitle
    c.drawString(16, y + 4, label[:110])
    draw_footer(c, head, page[0], W)
    return y - 18


def draw_header(c, head, members, part, nparts, nloc, y, W, H, page):
    c.setFillColorRGB(0.11, 0.21, 0.34)
    c.rect(0, y - 18, W, 40, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 14)
    title = head["name"] + (f"  ({part}/{nparts})" if nparts > 1 else "")
    c.drawString(16, y + 6, title)
    c.setFont("DejaVu", 8)
    c.drawString(16, y - 8, f"Horizon Restaurant Group  ·  {head['country']} / {head['admin1']} / {head['admin2']}")
    y -= 28
    map_h = 78
    draw_zone_map(c, head, members, 16, y - map_h, W - 32, map_h)
    y -= map_h + 10
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
    note = (
        "Direcciones reales de OpenStreetMap y código postal GeoNames. Metro/peatonal según OSM. "
        "El párrafo de cada ficha es un PROMPT de imagen (fachada según calle peatonal, playa, estación, etc.)."
    )
    for line in wrap(c, note, "DejaVu", 7, W - 32):
        c.drawString(16, y, line)
        y -= 9
    draw_footer(c, head, page[0], W)
    return y - 8


def draw_town_banner(c, city, y, W, H, head, page):
    need = 22
    if y < 40 + need:
        y = new_page(c, head, page, W, H, city["name"])
    c.setFillColorRGB(0.16, 0.32, 0.36)
    c.roundRect(12, y - 14, W - 24, 20, 4, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DejaVuBold", 9)
    pop = f"{city['pop']:,}".replace(",", ".")
    c.drawString(18, y - 8, f"{city['name']}  ·  {pop} hab.  ·  {city['admin2']}")
    return y - 24


def draw_venue(c, v, y, W, H, head, page):
    desc_lines = wrap(c, v["desc"], "DejaVu", 7.2, W - 44)
    need = 62 + 9 * len(desc_lines)
    if y < 28 + need:
        y = new_page(c, head, page, W, H, v.get("city_name") or "")
    c.setFillColorRGB(0.96, 0.94, 0.88)
    c.roundRect(12, y - need + 8, W - 24, need - 4, 6, fill=1, stroke=0)
    draw_logo(c, v.get("bid") or "", 16, y - 36, 28)
    text_x = 50
    c.setFillColorRGB(0.12, 0.14, 0.13)
    c.setFont("DejaVuBold", 10)
    c.drawString(text_x, y - 6, v["title"][:88])
    c.setFont("DejaVu", 7.5)
    c.setFillColorRGB(0.25, 0.35, 0.32)
    meta = f"{TIER_LABEL[v['tier']]}  ·  {v['size_name']}  ·  {v['seats']} pl  {v['m2']} m²"
    if v["guests"]:
        meta += "  ·  Inv: " + ", ".join(v["guests"])
    c.drawString(text_x, y - 18, meta[:100])
    c.setFillColorRGB(0.15, 0.18, 0.16)
    c.setFont("DejaVu", 7.4)
    c.drawString(text_x, y - 29, v["address"][:108])
    yy = y - 42
    c.setFillColorRGB(0.18, 0.22, 0.20)
    c.setFont("DejaVu", 7.2)
    for line in desc_lines:
        c.drawString(18, yy, line)
        yy -= 9
    acc = ("Metro/cercanías OSM" if v["metro"] else "Sin estación OSM cerca") + "  ·  " + (
        "Peatonal OSM" if v["ped"] else "No peatonal"
    )
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


def write_pdf(path: Path, head, members, sections, part, nparts):
    path.parent.mkdir(parents=True, exist_ok=True)
    W, H = A4
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"Horizon — {head['name']}")
    c.setAuthor("Horizon Restaurant Group")
    page = [1]
    nloc = sum(len(vs) for _m, vs in sections)
    y = H - 22
    y = draw_header(c, head, members, part, nparts, nloc, y, W, H, page)
    for city, venues in sections:
        y = draw_town_banner(c, city, y, W, H, head, page)
        for v in venues:
            y = draw_venue(c, v, y, W, H, head, page)
    draw_footer(c, head, page[0], W)
    c.save()


def chunk_sections(packed, per=28):
    chunks = []
    current = []
    ncur = 0
    for city, vs in packed:
        if not vs:
            continue
        if len(vs) > per:
            if current:
                chunks.append(current)
                current, ncur = [], 0
            for i in range(0, len(vs), per):
                chunks.append([(city, vs[i:i + per])])
            continue
        if current and ncur + len(vs) > per:
            chunks.append(current)
            current, ncur = [], 0
        current.append((city, vs))
        ncur += len(vs)
    if current:
        chunks.append(current)
    return chunks or [[]]


def build_head(args):
    head, members = args
    members = sorted(members, key=lambda m: (-m["pop"], m["name"]))
    packed = []
    nflat = 0
    for m in members:
        nv = n_venues(m["pop"])
        vs = make_venues(m, nv)
        packed.append((m, vs))
        nflat += len(vs)
    chunks = chunk_sections(packed, 28)
    nparts = len(chunks)
    folder = OUT_ROOT / safe_path(head["country"]) / safe_path(head["admin1"]) / safe_path(head["admin2"]) / safe_path(head["name"])
    base = "Horizon_" + slug(head["ascii"] or head["name"]).replace(" ", "_")
    paths = []
    index_rows = []
    for i, ch in enumerate(chunks, 1):
        fn = f"{base}_{i:02d}.pdf" if nparts > 1 else f"{base}.pdf"
        p = folder / fn
        write_pdf(p, head, members, ch, i, nparts)
        paths.append(str(p))
        for city, vs in ch:
            rel = str(p.relative_to(OUT_ROOT.parent))
            index_rows.append((city["name"], city["admin1"], city["admin2"], city["country"], len(vs), rel))
    return len(paths), nflat, index_rows


def write_city_index(rows, out_dir: Path):
    rows = sorted(rows, key=lambda r: (r[3], r[1], r[2], r[0]))
    csv_path = out_dir / "INDICE_CIUDADES.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["municipio", "ccaa_o_region", "provincia", "pais", "locales_en_pdf", "archivo"])
        for a, b, c, d, e, fn in rows:
            w.writerow([a, b, c, d, e, fn])
    pdf_path = out_dir / "INDICE_CIUDADES.pdf"
    W, H = A4
    cnv = canvas.Canvas(str(pdf_path), pagesize=A4)
    cnv.setTitle("Horizon — índice de ciudades")
    y = H - 28
    cnv.setFont("DejaVuBold", 14)
    cnv.drawString(16, y, "Horizon Restaurant Group — índice de ciudades")
    y -= 16
    cnv.setFont("DejaVu", 8)
    cnv.drawString(16, y, "Municipio → archivo PDF relativo a Horizon_Atlas_Restaurantes/")
    y -= 14
    cnv.setFont("DejaVuBold", 7)
    cnv.drawString(16, y, "Municipio")
    cnv.drawString(140, y, "Provincia")
    cnv.drawString(250, y, "País")
    cnv.drawString(340, y, "Archivo")
    y -= 10
    cnv.setFont("DejaVu", 6.8)
    page = 1
    for a, b, ctry_admin, d, e, fn in rows:
        if y < 22:
            cnv.showPage()
            page += 1
            y = H - 22
            cnv.setFont("DejaVu", 7)
            cnv.drawRightString(W - 16, 10, str(page))
            cnv.setFont("DejaVu", 6.8)
        cnv.drawString(16, y, str(a)[:28])
        cnv.drawString(140, y, str(ctry_admin)[:22])
        cnv.drawString(250, y, str(d)[:16])
        cnv.drawString(340, y, str(fn)[-48:])
        y -= 8
    cnv.save()
    return csv_path, pdf_path


def dir_bytes(p: Path) -> int:
    return sum(f.stat().st_size for f in p.rglob("*") if f.is_file())


def zip_add_path(zf: zipfile.ZipFile, path: Path, root: Path):
    if path.is_file():
        zf.write(path, path.relative_to(root).as_posix())
        return
    for f in path.rglob("*"):
        if f.is_file():
            zf.write(f, f.relative_to(root).as_posix())


def pack_units(country_dir: Path, max_bytes: int) -> list[tuple[Path, int]]:
    sz = dir_bytes(country_dir)
    if sz <= max_bytes:
        return [(country_dir, sz)]
    units = []
    for a1 in sorted([p for p in country_dir.iterdir() if p.is_dir()], key=lambda x: x.name):
        s1 = dir_bytes(a1)
        if s1 <= max_bytes:
            units.append((a1, s1))
            continue
        for a2 in sorted([p for p in a1.iterdir() if p.is_dir()], key=lambda x: x.name):
            units.append((a2, dir_bytes(a2)))
    return units or [(country_dir, sz)]


def pack_world_zips(base: Path, dest_dir: Path, max_bytes: int) -> list[Path]:
    atlas = base / "Horizon_Atlas_Restaurantes"
    extras = [p for p in (base / "INDICE_CIUDADES.csv", base / "INDICE_CIUDADES.pdf", base / "LEEME.txt") if p.exists()]
    countries = sorted([p for p in atlas.iterdir() if p.is_dir()], key=lambda p: p.name) if atlas.exists() else []
    units = []
    for cdir in countries:
        units.extend(pack_units(cdir, max_bytes))
    dest_dir.mkdir(parents=True, exist_ok=True)
    parts = []
    batch, bsz = [], 0

    def flush():
        nonlocal batch, bsz
        if not batch:
            return
        idx = len(parts) + 1
        zpath = dest_dir / f"horizon_atlas_mundo_{idx:02d}.zip"
        if zpath.exists():
            zpath.unlink()
        print("zipping", zpath, "folders", len(batch), "bytes~", bsz, flush=True)
        with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for extra in extras:
                zip_add_path(zf, extra, base)
            for folder, _sz in batch:
                zip_add_path(zf, folder, base)
        print("  wrote", zpath, "bytes", zpath.stat().st_size, flush=True)
        parts.append(zpath)
        batch, bsz = [], 0

    for folder, sz in units:
        if batch and bsz + sz > max_bytes:
            flush()
        batch.append((folder, sz))
        bsz += sz
        if sz > max_bytes:
            flush()
    flush()
    return parts


def main():
    global OUT_ROOT
    ap = argparse.ArgumentParser()
    ap.add_argument("--cc", default="", help="ISO country filter, e.g. ES")
    ap.add_argument("--exclude-cc", default="", help="comma ISO to skip, e.g. ES")
    ap.add_argument("--out", default="", help="output folder (contains Horizon_Atlas_Restaurantes/)")
    ap.add_argument("--limit-heads", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=max(1, cpu_count()))
    ap.add_argument("--zip", dest="make_zip", action="store_true")
    ap.add_argument("--max-zip-mb", type=int, default=1650)
    args = ap.parse_args()
    load_world_js()
    print("loading cities…")
    cities = load_cities()
    if args.cc:
        want = {x.strip().upper() for x in args.cc.split(",") if x.strip()}
        cities = [c for c in cities if c["cc"] in want]
    skip = {x.strip().upper() for x in (args.exclude_cc or "").split(",") if x.strip()}
    if skip:
        cities = [c for c in cities if c["cc"] not in skip]
        print("excluded", ",".join(sorted(skip)))
    print("cities", len(cities))
    mark_mall_stadium(cities)
    if args.out:
        OUT_ROOT = Path(args.out) / "Horizon_Atlas_Restaurantes"
    elif skip or not args.cc:
        OUT_ROOT = Path("/tmp/horizon_atlas_mundo") / "Horizon_Atlas_Restaurantes"
    print("out", OUT_ROOT)
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
    index_rows = []
    if args.jobs == 1 or len(work) < 8:
        for w in work:
            a, b, rows = build_head(w)
            n_pdf += a
            n_loc += b
            index_rows.extend(rows)
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(work)} zones  pdfs={n_pdf} locales={n_loc}", flush=True)
    else:
        with Pool(args.jobs) as pool:
            for a, b, rows in pool.imap_unordered(build_head, work, chunksize=4):
                n_pdf += a
                n_loc += b
                index_rows.extend(rows)
                done += 1
                if done % 100 == 0:
                    print(f"  {done}/{len(work)} zones  pdfs={n_pdf} locales={n_loc}", flush=True)
    csv_p, pdf_p = write_city_index(index_rows, OUT_ROOT.parent)
    leeme = OUT_ROOT.parent / "LEEME.txt"
    leeme.write_text(
        "HORIZON RESTAURANT GROUP — Atlas por zona (municipio cabecera + pueblos cercanos)\n"
        "================================================================================\n"
        "Pais / region o CCAA / provincia / cabecera /\n\n"
        "Cada carpeta de cabecera incluye los municipios de alrededor (~26 km).\n"
        "Cada municipio abre su propia sección en el PDF (no se corta a mitad de pueblo).\n"
        "Cada ficha: logo de marca, dirección OSM, metro/peatonal OSM, alquiler o compra,\n"
        "horario, y un PROMPT DE IMAGEN de la fachada (peatonal, playa, estación, mall, etc.).\n"
        "Índice: INDICE_CIUDADES.csv y INDICE_CIUDADES.pdf\n\n"
        f"Zonas: {len(work)}\nLocales: {n_loc}\nPDF: {n_pdf}\n",
        encoding="utf-8",
    )
    print("index", csv_p, pdf_p)
    print("done pdfs", n_pdf, "locales", n_loc)
    if args.make_zip:
        dest = Path("/workspace/descargas")
        dest.mkdir(parents=True, exist_ok=True)
        tag = (args.cc or "mundo").lower().replace(",", "_")
        if tag == "es" and not skip:
            zpath = dest / "horizon_atlas_espana.zip"
            if zpath.exists():
                zpath.unlink()
            print("zipping", zpath)
            shutil.make_archive(str(zpath.with_suffix("")), "zip", OUT_ROOT.parent)
            print("zip", zpath, "bytes", zpath.stat().st_size)
        else:
            max_bytes = args.max_zip_mb * 1024 * 1024
            parts = pack_world_zips(OUT_ROOT.parent, dest, max_bytes)
            extra = "\nPartes:\n" + "\n".join(f"  {p.name}  ({p.stat().st_size} bytes)" for p in parts) + "\n"
            leeme.write_text(leeme.read_text(encoding="utf-8") + extra, encoding="utf-8")
            print("zips", [p.name for p in parts])


if __name__ == "__main__":
    main()
