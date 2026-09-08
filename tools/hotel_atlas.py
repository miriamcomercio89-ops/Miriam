#!/usr/bin/env python3
"""Horizon Hotels — motor de datos compartido (marcas, formatos, ciudades, direcciones
reales y prompts de imagen) para el plan de construcción de hoteles.

Reutiliza el motor de ciudades / direcciones OSM / economía de países de
tools/build_atlas.py (mismo gaceteero GeoNames, mismas direcciones reales de
OpenStreetMap, mismos datos económicos de js/world.js), pero con un catálogo
de marcas y formatos propio y una densidad mucho más concentrada en ciudades
y zonas turísticas reales: un mundo de ~150.000-300.000 hoteles, casi ausente
en pueblos pequeños sin ningún atractivo turístico (a diferencia del atlas de
restaurantes, que garantiza un mínimo hasta en el pueblo más pequeño).

Las 50 marcas y los 30 formatos de hotel son EXACTAMENTE los mismos (mismo
orden, mismos nombres, mismos colores, mismas habitaciones) que los definidos
en hoteles/js/brands.js y hoteles/js/sim.js, para que el plan de construcción
en PDF y el simulador cuenten la misma historia.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402  (ciudades, direcciones OSM, economía, clima, fuentes)

ROOT = Path("/workspace")
LOGO_DIR = ROOT / "hoteles" / "img" / "marcas"
LOGO_CACHE: dict = {}

# ---- Reexport del motor común (ciudades, direcciones, economía, clima) ----
h32 = B.h32
rng = B.rng
wrap = B.wrap
take_addr = B.take_addr
district_for = B.district_for
climate_for = B.climate_for
arch_for = B.arch_for
load_world_js = B.load_world_js
load_cities = B.load_cities
load_continents = B.load_continents
mark_mall_stadium = B.mark_mall_stadium
COUNTRY_ECON = B.COUNTRY_ECON
COUNTRY_RENT = B.COUNTRY_RENT
COUNTRY_ES = B.COUNTRY_ES
TERRITORY_ES = B.TERRITORY_ES
CONTINENT_ES = B.CONTINENT_ES
REGION_RISK = B.REGION_RISK
N_PHASES = B.N_PHASES
phase_period = B.phase_period


def clamp(x, a, b):
    return max(a, min(b, x))


# ---------------------------------------------------------------------------
# 50 marcas — idéntico algoritmo que hoteles/js/brands.js: 10 segmentos x 5
# categorías (estrellas), todas con el nombre Horizon, con la misma paleta de
# color determinista (ángulo dorado) y el mismo orden.
# ---------------------------------------------------------------------------
SEGMENTS = {
    "urbano": {"name": "Urbano / Negocios", "poi": ["urbano", "comercial"]},
    "aeropuerto": {"name": "Aeropuerto", "poi": ["aeropuerto"]},
    "playa": {"name": "Playa / Resort", "poi": ["playa"]},
    "todoincluido": {"name": "Todo incluido", "poi": ["playa", "turistico"]},
    "boutique": {"name": "Boutique / Diseño", "poi": ["turistico", "historico", "comercial"]},
    "rural": {"name": "Rural / Eco", "poi": ["rural"]},
    "montana": {"name": "Montaña / Nieve", "poi": ["rural", "turistico"]},
    "bienestar": {"name": "Bienestar / Spa", "poi": ["turistico", "rural", "urbano"]},
    "aparthotel": {"name": "Aparthotel / Estancias", "poi": ["urbano", "comercial"]},
    "historico": {"name": "Histórico / Patrimonio", "poi": ["historico", "turistico"]},
}

TIERS = {
    "economico": {"name": "Económico", "stars": 2, "adr": 0.42},
    "medio": {"name": "Medio", "stars": 3, "adr": 0.72},
    "superior": {"name": "Superior", "stars": 4, "adr": 1.15},
    "lujo": {"name": "Lujo", "stars": 5, "adr": 1.85},
    "ultralujo": {"name": "Ultralujo", "stars": 5, "adr": 3.1},
}

NAMES = {
    "urbano": {
        "economico": ("Horizon Urban Stay", "La ciudad, sin vueltas."),
        "medio": ("Horizon City Center", "En el centro de todo."),
        "superior": ("Horizon Business Tower", "Trabajo y descanso, en vertical."),
        "lujo": ("Horizon Metropolitan", "La metrópoli desde arriba."),
        "ultralujo": ("Horizon Imperial Tower", "El ático de la ciudad."),
    },
    "aeropuerto": {
        "economico": ("Horizon Airport Express", "Aterriza y descansa."),
        "medio": ("Horizon Airport Inn", "A un paso de la terminal."),
        "superior": ("Horizon Airport Plaza", "Escalas con estilo."),
        "lujo": ("Horizon Skyport Grand", "El lujo antes del vuelo."),
        "ultralujo": ("Horizon Aviator Suites", "Primera clase en tierra."),
    },
    "playa": {
        "economico": ("Horizon Beach Lodge", "Arena a pie de puerta."),
        "medio": ("Horizon Coral Bay", "La bahía es tuya."),
        "superior": ("Horizon Beach Resort", "Vacaciones de manual."),
        "lujo": ("Horizon Lagoon Palace", "Una laguna privada."),
        "ultralujo": ("Horizon Paradise Reserve", "El último paraíso."),
    },
    "todoincluido": {
        "economico": ("Horizon Fiesta Club", "Todo incluido, sin sorpresas."),
        "medio": ("Horizon Vacation Club", "Vacaciones sin cuentas."),
        "superior": ("Horizon All-Inclusive Resort", "Todo, de verdad todo."),
        "lujo": ("Horizon Paradiso Resort & Spa", "Todo incluido, todo lujo."),
        "ultralujo": ("Horizon Elite All-Inclusive", "El todo incluido de otro nivel."),
    },
    "boutique": {
        "economico": ("Horizon Studio Loft", "Diseño de bolsillo."),
        "medio": ("Horizon Atelier Hotel", "Cada habitación, una pieza."),
        "superior": ("Horizon Design House", "La casa del diseño."),
        "lujo": ("Horizon Muse Boutique", "Tu musa particular."),
        "ultralujo": ("Horizon Atelier Prestige", "Alta costura hotelera."),
    },
    "rural": {
        "economico": ("Horizon Country Stop", "El campo, sin prisa."),
        "medio": ("Horizon Green Lodge", "Verde hasta el horizonte."),
        "superior": ("Horizon Eco Retreat", "Desconecta de verdad."),
        "lujo": ("Horizon Nature Manor", "La naturaleza como lujo."),
        "ultralujo": ("Horizon Wilderness Sanctuary", "El santuario salvaje."),
    },
    "montana": {
        "economico": ("Horizon Alpine Lodge", "Nieve al alcance de todos."),
        "medio": ("Horizon Summit Inn", "Cerca de la cumbre."),
        "superior": ("Horizon Peak Resort", "El pico es tu terraza."),
        "lujo": ("Horizon Glacier Chalet", "Chimenea y glaciar."),
        "ultralujo": ("Horizon Alpine Majestic", "La majestuosidad alpina."),
    },
    "bienestar": {
        "economico": ("Horizon Wellness Stop", "Un respiro accesible."),
        "medio": ("Horizon Serenity Spa", "Serenidad de bolsillo."),
        "superior": ("Horizon Zen Retreat", "El equilibrio como servicio."),
        "lujo": ("Horizon Sanctuary Spa & Golf", "Cuerpo, mente y hándicap."),
        "ultralujo": ("Horizon Aurora Wellness Palace", "El bienestar hecho palacio."),
    },
    "aparthotel": {
        "economico": ("Horizon Home Stay", "Como en casa, sin serlo."),
        "medio": ("Horizon Suites Express", "Suites para quedarte."),
        "superior": ("Horizon Residences", "Tu residencia temporal."),
        "lujo": ("Horizon Grand Residences", "Grandes espacios, gran servicio."),
        "ultralujo": ("Horizon Sky Residences Prestige", "Residir por encima de todo."),
    },
    "historico": {
        "economico": ("Horizon Heritage Inn", "Historia con presupuesto."),
        "medio": ("Horizon Manor House", "La casa señorial de siempre."),
        "superior": ("Horizon Castle Hotel", "Dormir en un castillo."),
        "lujo": ("Horizon Palace Heritage", "El palacio recuperado."),
        "ultralujo": ("Horizon Royal Heritage Palace", "La corona del patrimonio."),
    },
}

SEG_ORDER = ["urbano", "aeropuerto", "playa", "todoincluido", "boutique", "rural", "montana", "bienestar", "aparthotel", "historico"]
TIER_ORDER = ["economico", "medio", "superior", "lujo", "ultralujo"]

SEG_STYLE = {
    "urbano": "torre o edificio de oficinas reconvertido en hotel, fachada de cristal y líneas rectas",
    "aeropuerto": "edificio funcional de tránsito junto a la terminal, rótulo alto visible desde la vía de acceso",
    "playa": "fachada blanca frente al mar, tumbonas alineadas y piscina desbordante junto a la arena",
    "todoincluido": "gran complejo vacacional con jardines tropicales, varias piscinas y pulseras de acceso",
    "boutique": "edificio singular restaurado, interiorismo cuidado visible ya desde la entrada",
    "rural": "construcción en piedra o madera integrada en el paisaje, huerta o establo cerca",
    "montana": "chalet de madera y piedra con tejado a dos aguas, nieve o pradera alpina alrededor",
    "bienestar": "arquitectura serena con jardines y columnas, circuito de spa entrevisto tras el cristal",
    "aparthotel": "edificio residencial con balcones, aspecto de apartamentos con recepción en la planta baja",
    "historico": "palacio, castillo o casa señorial restaurada, piedra vista y escudo o placa en la fachada",
}


def _slug(s: str) -> str:
    import re
    import unicodedata
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s


def _short(name: str) -> str:
    words = [w for w in name.replace("Horizon ", "", 1).split() if not (w in ("&", "/"))]
    return "".join(w[0] for w in words).upper()[:4]


def _hsl_to_hex(h, s, l):
    s /= 100.0
    l /= 100.0

    def k(n):
        return (n + h / 30) % 12

    a = s * min(l, 1 - l)

    def f(n):
        return l - a * max(-1, min(k(n) - 3, min(9 - k(n), 1)))

    return "#%02x%02x%02x" % (round(255 * f(0)), round(255 * f(8)), round(255 * f(4)))


def _palette_for(i, tier_id):
    hue = (i * 137.508) % 360
    tidx = TIER_ORDER.index(tier_id)
    sat = 42 + tidx * 8
    light = 46 - tidx * 4
    color = _hsl_to_hex(hue, sat, max(26, light))
    if tidx >= 3:
        color2 = _hsl_to_hex(42, 55, 46)
    else:
        color2 = _hsl_to_hex((hue + 35) % 360, sat - 8, max(22, light - 10))
    return color, color2


HBRANDS = []
_i = 0
for _seg in SEG_ORDER:
    for _tier in TIER_ORDER:
        _name, _tag = NAMES[_seg][_tier]
        _id = _slug(_name)
        _color, _color2 = _palette_for(_i, _tier)
        HBRANDS.append({
            "id": _id,
            "name": _name,
            "short": _short(_name),
            "segment": _seg,
            "tier": _tier,
            "stars": TIERS[_tier]["stars"],
            "adr": TIERS[_tier]["adr"],
            "color": _color,
            "color2": _color2,
            "tagline": _tag,
        })
        _i += 1
HBRAND_BY_ID = {b["id"]: b for b in HBRANDS}
HBRAND_INDEX = {b["id"]: i for i, b in enumerate(HBRANDS)}


# ---------------------------------------------------------------------------
# 30 formatos de hotel — idénticos a hoteles/js/sim.js HTYPES.
# ---------------------------------------------------------------------------
HTYPES = [
    {"id": "hostal_pequeno", "name": "Hostal pequeño", "rooms": 12, "m2r": 16, "star": (2, 3), "cost": 95000, "rentMult": 0.75},
    {"id": "hostal_grande", "name": "Hostal grande", "rooms": 30, "m2r": 16, "star": (2, 3), "cost": 220000, "rentMult": 0.8},
    {"id": "motel_carretera", "name": "Motel de carretera", "rooms": 24, "m2r": 20, "star": (2, 2), "cost": 190000, "rentMult": 0.55},
    {"id": "capsula_aeropuerto", "name": "Hotel cápsula de aeropuerto", "rooms": 60, "m2r": 7, "star": (2, 3), "cost": 260000, "rentMult": 1.3},
    {"id": "urbano_pequeno", "name": "Hotel urbano pequeño", "rooms": 25, "m2r": 22, "star": (3, 3), "cost": 310000, "rentMult": 1.0},
    {"id": "urbano_mediano", "name": "Hotel urbano mediano", "rooms": 60, "m2r": 24, "star": (3, 4), "cost": 780000, "rentMult": 1.05},
    {"id": "urbano_grande", "name": "Hotel urbano grande", "rooms": 120, "m2r": 24, "star": (3, 4), "cost": 1650000, "rentMult": 1.1},
    {"id": "aparthotel_estudio", "name": "Aparthotel de estudios", "rooms": 40, "m2r": 30, "star": (3, 3), "cost": 620000, "rentMult": 0.95},
    {"id": "boutique_pequeno", "name": "Hotel boutique", "rooms": 18, "m2r": 30, "star": (4, 5), "cost": 520000, "rentMult": 1.2},
    {"id": "business_torre", "name": "Torre de negocios", "rooms": 180, "m2r": 26, "star": (4, 4), "cost": 3200000, "rentMult": 1.2},
    {"id": "aeropuerto_plaza", "name": "Hotel de aeropuerto superior", "rooms": 150, "m2r": 26, "star": (4, 4), "cost": 2400000, "rentMult": 1.35},
    {"id": "resort_playa_medio", "name": "Resort de playa mediano", "rooms": 200, "m2r": 32, "star": (4, 4), "cost": 3400000, "rentMult": 1.15},
    {"id": "resort_playa_grande", "name": "Resort de playa grande", "rooms": 400, "m2r": 34, "star": (4, 5), "cost": 7200000, "rentMult": 1.2},
    {"id": "todo_incluido_mega", "name": "Mega resort todo incluido", "rooms": 600, "m2r": 34, "star": (4, 4), "cost": 10500000, "rentMult": 1.1},
    {"id": "spa_bienestar", "name": "Hotel spa & bienestar", "rooms": 80, "m2r": 34, "star": (4, 4), "cost": 1900000, "rentMult": 1.25},
    {"id": "golf_resort", "name": "Resort de golf", "rooms": 150, "m2r": 32, "star": (4, 4), "cost": 2800000, "rentMult": 1.15},
    {"id": "eco_lodge", "name": "Eco-lodge rural", "rooms": 20, "m2r": 26, "star": (3, 3), "cost": 260000, "rentMult": 0.6},
    {"id": "refugio_montana", "name": "Refugio de montaña", "rooms": 30, "m2r": 20, "star": (3, 3), "cost": 340000, "rentMult": 0.7},
    {"id": "chalet_esqui", "name": "Chalet de esquí de lujo", "rooms": 40, "m2r": 34, "star": (5, 5), "cost": 1350000, "rentMult": 1.1},
    {"id": "manor_historico", "name": "Casa señorial histórica", "rooms": 25, "m2r": 30, "star": (4, 4), "cost": 680000, "rentMult": 0.95},
    {"id": "palacio_patrimonio", "name": "Palacio patrimonio restaurado", "rooms": 60, "m2r": 36, "star": (5, 5), "cost": 3600000, "rentMult": 1.1},
    {"id": "design_loft", "name": "Hotel de diseño / loft", "rooms": 35, "m2r": 28, "star": (4, 4), "cost": 620000, "rentMult": 1.15},
    {"id": "grand_hotel_lujo", "name": "Gran hotel de lujo", "rooms": 250, "m2r": 40, "star": (5, 5), "cost": 9000000, "rentMult": 1.3},
    {"id": "suite_only_ultra", "name": "Hotel solo-suites ultralujo", "rooms": 60, "m2r": 55, "star": (5, 5), "cost": 4800000, "rentMult": 1.5},
    {"id": "residencias_lujo", "name": "Residencias con servicios (lujo)", "rooms": 90, "m2r": 48, "star": (5, 5), "cost": 5200000, "rentMult": 1.25},
    {"id": "rooftop_skybar_hotel", "name": "Torre skyline con rooftop", "rooms": 300, "m2r": 30, "star": (5, 5), "cost": 11500000, "rentMult": 1.4},
    {"id": "isla_privada", "name": "Resort de isla privada", "rooms": 50, "m2r": 60, "star": (5, 5), "cost": 6800000, "rentMult": 1.35},
    {"id": "termas_wellness", "name": "Balneario termal wellness ultralujo", "rooms": 70, "m2r": 42, "star": (5, 5), "cost": 4200000, "rentMult": 1.3},
    {"id": "tren_crucero_tematico", "name": "Hotel temático experiencial", "rooms": 45, "m2r": 30, "star": (4, 4), "cost": 980000, "rentMult": 1.1},
    {"id": "glamping_lujo", "name": "Glamping de lujo", "rooms": 15, "m2r": 40, "star": (4, 4), "cost": 320000, "rentMult": 0.5},
]
HTYPE_BY_ID = {t["id"]: t for t in HTYPES}

SEGMENT_HTYPE_BY_TIER = {
    "urbano": {
        "economico": ["hostal_pequeno", "hostal_grande"],
        "medio": ["urbano_pequeno", "hostal_grande"],
        "superior": ["urbano_mediano", "urbano_grande"],
        "lujo": ["urbano_grande", "business_torre"],
        "ultralujo": ["rooftop_skybar_hotel", "grand_hotel_lujo", "suite_only_ultra"],
    },
    "aeropuerto": {
        "economico": ["motel_carretera", "capsula_aeropuerto"],
        "medio": ["capsula_aeropuerto"],
        "superior": ["aeropuerto_plaza"],
        "lujo": ["aeropuerto_plaza"],
        "ultralujo": ["aeropuerto_plaza"],
    },
    "playa": {
        "economico": ["hostal_grande"],
        "medio": ["hostal_grande", "resort_playa_medio"],
        "superior": ["resort_playa_medio"],
        "lujo": ["resort_playa_grande"],
        "ultralujo": ["isla_privada", "resort_playa_grande"],
    },
    "todoincluido": {
        "economico": ["resort_playa_medio"],
        "medio": ["resort_playa_medio", "todo_incluido_mega"],
        "superior": ["todo_incluido_mega"],
        "lujo": ["todo_incluido_mega", "resort_playa_grande"],
        "ultralujo": ["resort_playa_grande", "isla_privada"],
    },
    "boutique": {
        "economico": ["hostal_pequeno"],
        "medio": ["boutique_pequeno"],
        "superior": ["design_loft", "boutique_pequeno", "tren_crucero_tematico"],
        "lujo": ["design_loft", "manor_historico"],
        "ultralujo": ["suite_only_ultra", "palacio_patrimonio"],
    },
    "rural": {
        "economico": ["eco_lodge"],
        "medio": ["eco_lodge"],
        "superior": ["eco_lodge", "refugio_montana"],
        "lujo": ["glamping_lujo"],
        "ultralujo": ["glamping_lujo"],
    },
    "montana": {
        "economico": ["refugio_montana"],
        "medio": ["refugio_montana"],
        "superior": ["refugio_montana"],
        "lujo": ["chalet_esqui"],
        "ultralujo": ["chalet_esqui"],
    },
    "bienestar": {
        "economico": ["hostal_grande"],
        "medio": ["spa_bienestar"],
        "superior": ["spa_bienestar", "golf_resort"],
        "lujo": ["golf_resort", "termas_wellness"],
        "ultralujo": ["termas_wellness"],
    },
    "aparthotel": {
        "economico": ["aparthotel_estudio"],
        "medio": ["aparthotel_estudio"],
        "superior": ["aparthotel_estudio"],
        "lujo": ["residencias_lujo"],
        "ultralujo": ["residencias_lujo"],
    },
    "historico": {
        "economico": ["hostal_pequeno"],
        "medio": ["manor_historico"],
        "superior": ["manor_historico"],
        "lujo": ["palacio_patrimonio"],
        "ultralujo": ["palacio_patrimonio"],
    },
}


# ---------------------------------------------------------------------------
# Densidad de hoteles por ciudad: mucho más concentrada que la de restaurantes
# (pueblos pequeños sin atractivo turístico se quedan, la mayoría, sin ninguno).
# ---------------------------------------------------------------------------
def n_hotels(city, ctx) -> int:
    pop = city["pop"]
    coast = bool(ctx.get("coast_ok"))
    mall = bool(ctx.get("mall_ok"))
    stadium = bool(ctx.get("stadium_ok"))
    university = bool(ctx.get("university_ok"))
    tourist = coast or mall or stadium or university

    if pop < 1500:
        base = 0.0
    elif pop < 5000:
        base = 0.24 if tourist else 0.0
    elif pop < 15000:
        base = 1.05 if tourist else 0.2
    elif pop < 50000:
        base = (pop / 16000.0) * (1.75 if tourist else 1.0)
    elif pop < 250000:
        base = (pop / 26000.0) * (1.6 if coast else 1.32 if tourist else 1.0)
    else:
        base = (pop / 37000.0) * (1.5 if coast else 1.22 if tourist else 1.0)

    r = rng(h32(city["id"], "nhotels"))
    base *= 0.72 + r() * 0.6
    n = int(round(base))
    if n == 0 and base > 0.24 and r() < base:
        n = 1
    cap = 70 if pop > 4_000_000 else 45
    return max(0, min(cap, n))


def _wealth_score(cc: str) -> float:
    ce = COUNTRY_ECON.get(cc) or {}
    gdppc = ce.get("gdppc", 15000.0)
    return clamp(math.log10(max(1000.0, gdppc) / 15000.0) / 1.1 + 1.0, 0.15, 2.4)


def _hub_rank(city) -> float:
    """0..1: qué probable es que esta ciudad sea un gran hub de negocios/turismo
    del país (usada como aproximación de 'tiene aeropuerto internacional' y para
    subir el peso de marcas urbano/aeropuerto/lujo en las grandes capitales)."""
    pop = city["pop"]
    if pop >= 3_000_000:
        return 1.0
    if pop >= 900_000:
        return 0.8
    if pop >= 300_000:
        return 0.55
    if pop >= 90_000:
        return 0.3
    return 0.12


def _segment_fit(seg: str, city, ctx) -> float:
    coast = bool(ctx.get("coast_ok"))
    mall = bool(ctx.get("mall_ok"))
    stadium = bool(ctx.get("stadium_ok"))
    university = bool(ctx.get("university_ok"))
    pop = city["pop"]
    hub = _hub_rank(city)
    mr = ctx.get("mountain_rural", 0.0)

    if seg == "urbano":
        return 0.6 + hub * 1.6 + (0.3 if mall else 0)
    if seg == "aeropuerto":
        return 0.15 + hub * 2.1
    if seg == "playa":
        return (1.5 if coast else 0.08) * (1.0 + 0.25 * min(1.0, pop / 200000.0))
    if seg == "todoincluido":
        return (1.1 if coast else 0.03) * (1.0 + 0.3 * min(1.0, pop / 120000.0))
    if seg == "boutique":
        return 0.35 + hub * 0.9 + (0.4 if (mall or university) else 0) + (0.3 if coast else 0)
    if seg == "rural":
        return 0.15 + mr * 1.8 + (0.5 if pop < 12000 else 0.05)
    if seg == "montana":
        return 0.05 + mr * 1.6
    if seg == "bienestar":
        return 0.3 + hub * 0.5 + mr * 0.6 + (0.2 if coast else 0)
    if seg == "aparthotel":
        return 0.3 + hub * 1.1 + (0.2 if stadium else 0)
    if seg == "historico":
        return 0.25 + (0.7 if (mall or university) else 0.2) + (0.15 if pop < 40000 else 0)
    return 0.3


_MOUNTAIN_CC = {
    "CH", "AT", "SI", "SK", "AD", "NP", "BT", "PE", "BO", "EC", "CO", "CL", "AR", "NZ", "NO",
    "IS", "GE", "AM", "KG", "TJ", "PK", "IN", "CN", "MX", "US", "CA", "FR", "IT", "ES", "DE",
    "RO", "BG", "MK", "ME", "AL", "GR", "JP", "ID", "PH", "RW", "UG", "KE", "ET",
}


def city_ctx(city, poi_idx=None) -> dict:
    ctx = {
        "coast_ok": bool(city.get("coast_ok")),
        "mall_ok": bool(city.get("mall_ok")),
        "stadium_ok": bool(city.get("stadium_ok")),
        "university_ok": bool(city.get("university_ok")),
        "station_ok": bool(city.get("station_ok")),
    }
    ctx["mountain_rural"] = 0.55 if city.get("cc") in _MOUNTAIN_CC and city["pop"] < 60000 else 0.08
    return ctx


def pick_hotel_brand_sequence(city, n, ctx) -> list[int]:
    """Ordena las 50 marcas para esta ciudad, con más peso a los segmentos que
    encajan de verdad con el lugar (playa real, hub urbano/aeropuerto real,
    pueblo rural/de montaña...) y a las categorías de estrellas acordes al
    nivel de riqueza del país, con variedad aleatoria real entre ciudades
    similares; repite marcas populares si hacen falta más de 50 hoteles."""
    pr = rng(h32(city["id"], "hbrandpick"))
    wealth = _wealth_score(city["cc"])
    seg_fit = {seg: _segment_fit(seg, city, ctx) for seg in SEG_ORDER}
    tier_w = {
        "economico": clamp(1.7 - wealth * 0.55, 0.35, 1.7),
        "medio": 1.15,
        "superior": clamp(0.55 + wealth * 0.55, 0.35, 1.9),
        "lujo": clamp(0.18 + wealth * 0.62, 0.08, 1.9),
        "ultralujo": clamp(0.05 + wealth * 0.42, 0.02, 1.4),
    }

    def weight(b, jitter):
        return max(0.02, seg_fit[b["segment"]] * tier_w[b["tier"]] * jitter)

    weights = [weight(b, 0.65 + pr() * 0.8) for b in HBRANDS]
    pool = list(range(len(HBRANDS)))
    order = []
    k = min(n, len(HBRANDS))
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
    if n > len(HBRANDS):
        rep_weights = [weight(b, 0.8 + pr() * 0.5) for b in HBRANDS]
        total = sum(rep_weights)
        for _ in range(n - len(HBRANDS)):
            u = pr() * total
            acc = 0.0
            chosen = len(HBRANDS) - 1
            for idx, w in enumerate(rep_weights):
                acc += w
                if u <= acc:
                    chosen = idx
                    break
            order.append(chosen)
    return order


def htype_for(brand, r, pop: int, ctx: dict) -> dict:
    pool_ids = SEGMENT_HTYPE_BY_TIER.get(brand["segment"], {}).get(brand["tier"]) or ["hostal_grande"]
    pool = [HTYPE_BY_ID[i] for i in pool_ids]
    if len(pool) == 1:
        return pool[0]
    pool_sorted = sorted(pool, key=lambda t: t["rooms"])
    scale = clamp(math.log10(max(1000, pop) / 8000.0) / 2.4 + r() * 0.5, 0.0, 1.0)
    idx = min(len(pool_sorted) - 1, int(scale * len(pool_sorted)))
    return pool_sorted[idx]


ES_WAGE_H = 4.2


def calc_hotel_invest(city, brand, htype, econ):
    cc = city["cc"]
    pop_k = city["pop"] / 1000.0
    city_factor = clamp(math.log10(pop_k + 10) / 2.2, 0.55, 2.8)
    rent_idx = (COUNTRY_RENT.get(cc, 40) / 72.0) * city_factor
    star_mul = 0.7 + max(htype["star"]) * 0.16
    base_mul = clamp(0.45 + rent_idx * 0.55, 0.4, 3.6)
    ce = econ.get(cc) or {"wage": 15.0}
    wage_scale = max(0.12, ce.get("wage", 15.0) / ES_WAGE_H)
    building = htype["cost"] * base_mul * wage_scale
    furniture = htype["rooms"] * 3200 * star_mul * wage_scale
    total_build = building + furniture
    rent_monthly = max(400, int(round(htype["rooms"] * htype["m2r"] * 7.5 * rent_idx * htype.get("rentMult", 1.0))))
    r_own = rng(h32(city["id"], brand["id"], htype["id"], "own"))
    owned = r_own() < 0.30
    purchase_price = int(round(rent_monthly * 130))
    alq_compra = purchase_price if owned else int(round(rent_monthly * 6))
    total_inv = int(round(alq_compra + total_build))
    adr = round(70 * brand["adr"] * (0.85 + wage_scale * 0.5), 1)
    return {
        "owned": owned, "rent": rent_monthly, "price": purchase_price,
        "total_inv": total_inv, "adr": adr,
    }


def setting_for_hotel(v) -> str:
    d = v.get("district") or ""
    seg = v.get("segment")
    if seg == "aeropuerto":
        return "junto a la carretera de acceso a la terminal aérea, autobuses lanzadera cerca"
    if seg == "playa" or seg == "todoincluido":
        return "primera línea de playa, paseo marítimo y arena a pocos metros de la entrada"
    if seg == "montana":
        return "ladera de montaña, telesilla o pista visible al fondo"
    if seg == "rural":
        return "camino rural entre fincas o bosque, sin tráfico"
    if d in ("Casco", "Centro") and seg in ("boutique", "historico"):
        return "casco antiguo o centro histórico, calle estrecha con comercio de paso"
    if v.get("ped") and v.get("metro"):
        return "calle peatonal urbana con acceso de metro o cercanías cerca"
    if v.get("ped"):
        return "calle peatonal, terrazas cercanas, sin coches"
    if v.get("metro"):
        return "acera urbana a pocos metros de una estación"
    if d == "Universidad":
        return "entorno de campus universitario, estudiantes y bicicletas"
    if d == "Residencial":
        return "barrio residencial tranquilo, edificios de viviendas alrededor"
    return "avenida urbana de uso cotidiano, tráfico moderado"


def hotel_image_prompt(v, city) -> str:
    kind = "ciudad" if city["pop"] >= 20000 else "villa" if city["pop"] >= 5000 else "pueblo"
    pop = f"{city['pop']:,}".replace(",", ".")
    cr = rng(h32(city["id"], v["bid"], "clima_hotel"))
    clima = climate_for(city, cr)
    gente = ["un par de huéspedes con maletas en la entrada", "un botones junto a la puerta", "poca gente, sin aglomeración", "alguien saliendo con una maleta de ruedas"]
    calle = ["algún coche o taxi aparcado cerca", "tráfico ligero al fondo", "una furgoneta de reparto pasando", "una bicicleta apoyada cerca"]
    detalle_gente = gente[int(cr() * len(gente)) % len(gente)]
    detalle_calle = calle[int(cr() * len(calle)) % len(calle)]
    arch_txt = arch_for(city, cr)
    style = SEG_STYLE.get(v.get("segment") or "", "")
    marca_txt = f" Estilo propio de la marca: {style}." if style else ""
    stars_txt = "★" * int(v["stars"])
    return (
        "PROMPT IMAGEN: Fotografía fotorrealista a pie de calle de la fachada principal del hotel "
        f"«{v['brand']}» ({stars_txt}) en {city['name']}, {city['admin2']}, {city['admin1']} ({city['country']}). "
        f"{kind.capitalize()} de {pop} habitantes. Formato {v['htype_name'].lower()} "
        f"({v['rooms']} habitaciones), segmento {SEGMENTS[v['segment']]['name'].lower()}, categoría {v['tier_label'].lower()}. "
        f"Ubicación: {setting_for_hotel(v)}. Dirección de referencia: {v['address']}. "
        f"{arch_txt}.{marca_txt} Entrada principal con rótulo del hotel y marquesina, recepción entrevista tras "
        f"puertas de cristal. Ambiente: {clima}, {detalle_gente}, {detalle_calle}. "
        f"Rótulo claramente legible con el nombre «{v['brand']}». "
        "Óptica 35 mm, luz natural, sin texto extra en la imagen, "
        "sin restaurante independiente en primer plano, sin logotipos de otras cadenas hoteleras, "
        "sin personas identificables en primer plano, sin interior de habitación a pantalla completa."
    )


def logo_img(bid: str):
    if bid in LOGO_CACHE:
        return LOGO_CACHE[bid]
    path = LOGO_DIR / f"{bid}.png"
    img = None
    if path.exists():
        try:
            from io import BytesIO

            from PIL import Image
            from reportlab.lib.utils import ImageReader

            im = Image.open(path).convert("RGBA")
            im.thumbnail((72, 72))
            buf = BytesIO()
            im.save(buf, format="PNG", optimize=True)
            buf.seek(0)
            img = ImageReader(buf)
        except Exception:
            try:
                from reportlab.lib.utils import ImageReader

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
