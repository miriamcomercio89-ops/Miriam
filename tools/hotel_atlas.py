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


def _pick(r, options):
    return options[int(r() * len(options)) % len(options)]


# ---------------------------------------------------------------------------
# Mucha más variedad para el PROMPT IMAGEN PRINCIPAL: hora del día, detalle
# arquitectónico según categoría, ambiente de temporada y gente/tráfico con
# muchas más variantes que antes — todo combinado con la ciudad, distrito,
# clima y arquitectura real ya calculados por build_atlas (arch_for/climate_for).
# ---------------------------------------------------------------------------
GENTE_POOL = [
    "un par de huéspedes con maletas en la entrada", "un botones junto a la puerta",
    "poca gente, sin aglomeración", "alguien saliendo con una maleta de ruedas",
    "una pareja consultando el móvil junto a la fachada", "un grupo pequeño bajando de un taxi",
    "un recepcionista saludando en la puerta", "un huésped haciendo una fotografía a la fachada",
    "un mozo de equipajes cargando un carro", "una familia con niños entrando al vestíbulo",
]
CALLE_POOL = [
    "algún coche o taxi aparcado cerca", "tráfico ligero al fondo",
    "una furgoneta de reparto pasando", "una bicicleta apoyada cerca",
    "un autobús turístico pasando de fondo", "una parada de taxis junto a la acera",
    "farolas urbanas encendidas", "macetas o jardineras junto a la entrada",
    "una bandera del hotel ondeando en un mástil", "arbolado de alineación frente a la fachada",
]
HORA_POOL = [
    "a media mañana, luz limpia", "a primera hora de la tarde",
    "con la luz dorada del atardecer", "recién amanecido, luz suave y rasante",
    "a mediodía con sol alto y sombras cortas", "al anochecer, con la fachada ya iluminada",
]
TEMPORADA_POOL = [
    "en plena temporada alta, ambiente animado", "en temporada baja, tranquilo y despejado",
    "con las terrazas exteriores ya montadas", "con la decoración de temporada discreta en la entrada",
    "recién limpio tras el turno de mañana", "con el toldo de la entrada desplegado",
]
DETALLE_TIER_POOL = {
    "economico": ["rótulo sencillo en la fachada", "acceso directo sin marquesina", "cartel luminoso básico junto a la puerta"],
    "medio": ["marquesina discreta sobre la entrada", "rótulo iluminado bien visible", "un toldo simple protegiendo la puerta"],
    "superior": ["marquesina amplia con el nombre iluminado", "un pequeño valet parking en la puerta", "banderines o macetones a ambos lados del acceso"],
    "lujo": ["alfombra roja o oscura en el acceso", "valet parking con uniforme de marca", "fuente decorativa o jardín de entrada cuidado"],
    "ultralujo": ["puerta con conserje de librea", "columnata o pórtico de acceso monumental", "flota de coches de cortesía visible en la puerta"],
}


def hotel_image_prompt(v, city) -> str:
    kind = "ciudad" if city["pop"] >= 20000 else "villa" if city["pop"] >= 5000 else "pueblo"
    pop = f"{city['pop']:,}".replace(",", ".")
    cr = rng(h32(city["id"], v["bid"], "clima_hotel"))
    clima = climate_for(city, cr)
    detalle_gente = _pick(cr, GENTE_POOL)
    detalle_calle = _pick(cr, CALLE_POOL)
    hora = _pick(cr, HORA_POOL)
    temporada = _pick(cr, TEMPORADA_POOL)
    detalle_tier = _pick(cr, DETALLE_TIER_POOL.get(v.get("tier") or "medio", DETALLE_TIER_POOL["medio"]))
    arch_txt = arch_for(city, cr)
    style = SEG_STYLE.get(v.get("segment") or "", "")
    marca_txt = f" Estilo propio de la marca: {style}." if style else ""
    stars_txt = "★" * int(v["stars"])
    return (
        "PROMPT IMAGEN PRINCIPAL: Fotografía fotorrealista a pie de calle de la fachada principal del hotel "
        f"«{v['brand']}» ({stars_txt}) en {city['name']}, {city['admin2']}, {city['admin1']} ({city['country']}). "
        f"{kind.capitalize()} de {pop} habitantes. Formato {v['htype_name'].lower()} "
        f"({v['rooms']} habitaciones), segmento {SEGMENTS[v['segment']]['name'].lower()}, categoría {v['tier_label'].lower()}. "
        f"Ubicación: {setting_for_hotel(v)}. Dirección de referencia: {v['address']}. "
        f"{arch_txt}.{marca_txt} {detalle_tier.capitalize()}, recepción entrevista tras puertas de cristal. "
        f"Ambiente: {clima}, {hora}, {temporada}, {detalle_gente}, {detalle_calle}. "
        f"El nombre «{v['brand']}» y el logotipo de la marca deben verse claramente en un rótulo o "
        "marquesina de la fachada, como en una ficha comercial de hotel. "
        "Óptica 35 mm, luz natural, sin texto extra en la imagen, "
        "sin restaurante independiente en primer plano, sin logotipos de otras cadenas hoteleras, "
        "sin personas identificables en primer plano, sin interior de habitación a pantalla completa."
    )


# ---------------------------------------------------------------------------
# Amenities activas por hotel (mismas 8 que hoteles/js/saborama.js AMENITIES,
# para que la ficha en PDF cuente la misma historia que el simulador),
# elegidas de forma determinista según segmento/categoría de estrellas.
# ---------------------------------------------------------------------------
AMENITY_DEFS = {
    "restaurante": {"name": "Restaurante interno", "icon": "restaurant"},
    "spa": {"name": "Spa / circuito wellness", "icon": "spa"},
    "piscina": {"name": "Piscina", "icon": "pool"},
    "gimnasio": {"name": "Gimnasio 24h", "icon": "gym"},
    "parking": {"name": "Parking cubierto", "icon": "parking"},
    "salones": {"name": "Salones de eventos", "icon": "meeting"},
    "playa_privada": {"name": "Playa privada", "icon": "beach"},
    "business_center": {"name": "Business center", "icon": "briefcase"},
}


def active_amenities(city, brand, htype) -> list[str]:
    r = rng(h32(city["id"], brand["id"], htype["id"], "amenities"))
    seg = brand["segment"]
    tidx = TIER_ORDER.index(brand["tier"])

    def chance(base, bonus=0.0):
        return r() < clamp(base + bonus + tidx * 0.09, 0.02, 0.96)

    out = []
    if chance(0.32, 0.38 if seg in ("playa", "todoincluido", "historico", "bienestar") else 0.05):
        out.append("restaurante")
    if chance(0.08, 0.45 if seg == "bienestar" else 0.18 if seg in ("todoincluido", "montana") else 0):
        out.append("spa")
    if chance(0.16, 0.5 if seg in ("playa", "todoincluido") else 0.22 if seg in ("bienestar", "aparthotel") else 0):
        out.append("piscina")
    if chance(0.2, 0.22 if seg in ("urbano", "aeropuerto") else 0):
        out.append("gimnasio")
    if chance(0.28, 0.25 if seg in ("aeropuerto", "rural", "montana", "playa") else -0.12 if seg == "boutique" else 0):
        out.append("parking")
    if chance(0.14, 0.34 if seg in ("urbano", "aeropuerto", "todoincluido") else 0.2 if seg == "bienestar" else 0):
        out.append("salones")
    if seg in ("playa", "todoincluido") and tidx >= 2 and r() < 0.55:
        out.append("playa_privada")
    if chance(0.1, 0.35 if seg == "urbano" else 0):
        out.append("business_center")
    return out


FLOOR_DENSITY = {
    "rooftop_skybar_hotel": 10, "business_torre": 9, "grand_hotel_lujo": 9, "urbano_grande": 9,
    "capsula_aeropuerto": 12, "suite_only_ultra": 6, "residencias_lujo": 7, "aeropuerto_plaza": 11,
    "resort_playa_grande": 35, "todo_incluido_mega": 45, "resort_playa_medio": 30, "golf_resort": 28,
    "hostal_pequeno": 6, "hostal_grande": 10, "motel_carretera": 12, "eco_lodge": 8,
    "refugio_montana": 8, "chalet_esqui": 7, "glamping_lujo": 3, "manor_historico": 7,
    "palacio_patrimonio": 6, "boutique_pequeno": 6, "design_loft": 7, "urbano_pequeno": 7,
    "urbano_mediano": 8, "aparthotel_estudio": 8, "spa_bienestar": 8, "termas_wellness": 7,
    "isla_privada": 20, "tren_crucero_tematico": 7,
}


def plantas_for(htype) -> int:
    density = FLOOR_DENSITY.get(htype["id"], 10)
    return max(1, min(45, round(htype["rooms"] / density)))


CALIDAD_BY_TIER = {
    "economico": ["Acabados funcionales y prácticos", "Construcción sencilla y bien mantenida"],
    "medio": ["Acabados de calidad estándar", "Buen nivel de acabados, mantenimiento correcto"],
    "superior": ["Acabados de calidad superior", "Materiales de gama alta en zonas comunes"],
    "lujo": ["Acabados de lujo", "Materiales nobles y diseño de interiorismo de firma"],
    "ultralujo": ["Acabados de altísimo lujo, materiales nobles", "Interiorismo de autor y materiales de primer nivel mundial"],
}
SEGURIDAD_BY_TIER = {
    "economico": "Seguridad estándar (recepción atendida)",
    "medio": "Seguridad estándar (recepción 24h)",
    "superior": "Seguridad alta (CCTV y control de accesos)",
    "lujo": "Seguridad alta con vigilancia permanente",
    "ultralujo": "Seguridad alta con vigilancia y control de accesos reforzado",
}
TECNOLOGIA_BY_TIER = {
    "economico": "WiFi básico gratuito",
    "medio": "WiFi rápido gratuito en todo el hotel",
    "superior": "Tecnología moderna, check-in digital",
    "lujo": "Domótica en habitaciones y check-in digital",
    "ultralujo": "Domótica avanzada, check-in privado y conserjería digital",
}
CLIENTES_POOL = {
    "urbano": ["viajeros de negocios", "turismo urbano de fin de semana", "grupos de congresos y ferias"],
    "aeropuerto": ["pasajeros en tránsito y escalas", "tripulaciones y personal de aerolíneas", "viajeros de última hora"],
    "playa": ["familias en vacaciones", "parejas de turismo de sol y playa", "grupos de turoperador"],
    "todoincluido": ["familias con niños", "grupos grandes y turoperadores", "parejas en luna de miel"],
    "boutique": ["parejas y viajeros individuales", "turismo de diseño y tendencias", "estancias cortas de ciudad"],
    "rural": ["turismo de naturaleza y desconexión", "parejas y grupos reducidos", "turismo de proximidad de fin de semana"],
    "montana": ["esquiadores y turismo de nieve", "senderistas y turismo de montaña en verano", "familias en vacaciones de invierno"],
    "bienestar": ["turismo de salud y relax", "parejas en escapadas de spa", "grupos de bienestar corporativo"],
    "aparthotel": ["estancias de media/larga duración", "familias en viaje", "profesionales desplazados"],
    "historico": ["turismo cultural y patrimonial", "parejas en escapadas románticas", "grupos organizados y visitas guiadas"],
}
REGIMEN_POOL = {
    "urbano": ["Solo alojamiento", "Alojamiento y desayuno"],
    "aeropuerto": ["Solo alojamiento"],
    "playa": ["Alojamiento y desayuno", "Media pensión", "Solo alojamiento"],
    "todoincluido": ["Todo incluido"],
    "boutique": ["Alojamiento y desayuno", "Solo alojamiento"],
    "rural": ["Alojamiento y desayuno", "Media pensión"],
    "montana": ["Media pensión", "Alojamiento y desayuno"],
    "bienestar": ["Alojamiento y desayuno", "Media pensión"],
    "aparthotel": ["Solo alojamiento"],
    "historico": ["Alojamiento y desayuno"],
}


def basico_section(brand, htype) -> dict:
    r = rng(h32(brand["id"], htype["id"], "basico"))
    seg = brand["segment"]
    return {
        "clientes": _pick(r, CLIENTES_POOL.get(seg, ["turismo general"])),
        "regimen": _pick(r, REGIMEN_POOL.get(seg, ["Solo alojamiento"])),
        "personal_aprox": max(3, round(htype["rooms"] / 7)),
    }


def edificio_section(city, brand, htype, amenities) -> dict:
    r = rng(h32(city["id"], brand["id"], htype["id"], "edificio"))
    tidx = TIER_ORDER.index(brand["tier"])
    nivel_rest = clamp(tidx + 1 + (1 if r() < 0.15 else 0) - (1 if r() < 0.1 else 0), 1, 5) if "restaurante" in amenities else 0
    salas = 0
    capacidad = 0
    espacio_ev = 0
    if "salones" in amenities:
        salas = max(1, min(30, round(htype["rooms"] / 22)))
        capacidad = salas * (35 + int(r() * 30))
        espacio_ev = int(capacidad * (1.4 + r() * 0.5))
    seg = brand["segment"]
    if seg in ("playa", "todoincluido", "isla_privada"):
        vista_pct = 45 + int(r() * 45)
    elif seg in ("montana",):
        vista_pct = 40 + int(r() * 50)
    elif seg in ("urbano", "aeropuerto"):
        vista_pct = 8 + int(r() * 28)
    elif seg in ("boutique", "historico"):
        vista_pct = 15 + int(r() * 30)
    else:
        vista_pct = 20 + int(r() * 35)
    return {
        "calidad": _pick(r, CALIDAD_BY_TIER[brand["tier"]]),
        "plantas": plantas_for(htype),
        "seguridad": SEGURIDAD_BY_TIER[brand["tier"]],
        "tecnologia": TECNOLOGIA_BY_TIER[brand["tier"]],
        "salas_reuniones": salas,
        "capacidad_max": capacidad,
        "espacio_eventos": espacio_ev,
        "nivel_restaurante": nivel_rest,
        "vista_pct": vista_pct,
    }


BUFFET_POOL = {
    "todoincluido": ["Buffet internacional en varios turnos", "Buffet temático rotativo con showcooking"],
    "playa": ["Buffet variado con showcooking frente al mar", "Buffet mediterráneo con producto local"],
    "urbano": ["Buffet continental / a la carta según ocupación", "Desayuno buffet exprés para viajeros de negocios"],
    "boutique": ["Desayuno a la carta de producto de proximidad", "Brunch de fin de semana con productos artesanos"],
    "historico": ["Desayuno a la carta con repostería tradicional de la zona", "Buffet clásico servido en el salón histórico"],
}
BARES_BY_TIER = {
    "economico": ["Cafetería en recepción", "Sin bar propio"],
    "medio": ["Bar de lobby sencillo", "Cafetería con barra de desayunos"],
    "superior": ["Bar de lobby", "Bar de lobby y terraza exterior"],
    "lujo": ["Bar de lobby y bar en azotea", "Coctelería de autor y bar de lobby"],
    "ultralujo": ["Bar de lobby, bar en azotea y bodega privada", "Coctelería de autor con carta de champagne"],
}
CONCEPTO_REST_POOL = ["A la carta", "Gourmet de autor", "Buffet", "Show cooking", "Cocina de mercado", "Fusión internacional"]
EXTRA_OPERATIVO_POOL = [
    "Programa de fidelidad Horizon Rewards", "Spa de pago por uso para no alojados",
    "Servicio de guardería bajo petición", "Alquiler de bicicletas o material deportivo",
    "Transporte al aeropuerto bajo petición", "Servicio de lavandería exprés",
    "Actividades y animación para niños", "Excursiones y experiencias locales concertadas",
]


def extras_section(brand, htype) -> dict:
    r = rng(h32(brand["id"], htype["id"], "extras"))
    seg = brand["segment"]
    dias_oferta = _pick(r, [0, 0, 0, 0, 7, 14, 21, 30])
    op1 = _pick(r, EXTRA_OPERATIVO_POOL)
    rest = [x for x in EXTRA_OPERATIVO_POOL if x != op1]
    op2 = _pick(r, rest)
    return {
        "dias_oferta": dias_oferta,
        "buffet": _pick(r, BUFFET_POOL.get(seg, ["Buffet continental"])),
        "bares": _pick(r, BARES_BY_TIER[brand["tier"]]),
        "concepto": _pick(r, CONCEPTO_REST_POOL),
        "operativo": [op1, op2],
    }


SUSTAIN_BASE_PROB = {"rural": 0.75, "montana": 0.55, "bienestar": 0.5, "boutique": 0.35, "historico": 0.3}
SUSTAIN_TEXT_POOL = [
    "Plan verde fuerte: medidas de eficiencia energética, reducción de residuos y consumo responsable de agua.",
    "Comprometidos con la sostenibilidad: iluminación LED, gestión de residuos y proveedores locales de proximidad.",
    "Sello de turismo responsable: ahorro energético, reducción de plásticos de un solo uso y compra de cercanía.",
    "Certificación ambiental en curso: optimización de consumos y programa de reciclaje integral.",
]


def sustainability_info(brand):
    r = rng(h32(brand["id"], "sustain"))
    tidx = TIER_ORDER.index(brand["tier"])
    base = SUSTAIN_BASE_PROB.get(brand["segment"], 0.22) + tidx * 0.05
    active = r() < clamp(base, 0.05, 0.85)
    return active, _pick(r, SUSTAIN_TEXT_POOL)


def feature_icons(rooms, brand, htype, amenities, edificio, sustain_active) -> list:
    tidx = TIER_ORDER.index(brand["tier"])
    icons = [("bed", f"{rooms} habitaciones y suites")]
    if edificio["salas_reuniones"] > 0:
        icons.append(("meeting", f"{edificio['salas_reuniones']} salas de reuniones y eventos"))
    if "restaurante" in amenities:
        icons.append(("restaurant", f"Restaurante nivel {edificio['nivel_restaurante']}"))
    if tidx >= 3:
        icons.append(("bar", "Bar de lobby y bar en azotea" if htype["id"] in ("rooftop_skybar_hotel", "grand_hotel_lujo") else "Bar de lobby"))
    elif tidx == 2:
        icons.append(("bar", "Bar de lobby"))
    if "gimnasio" in amenities:
        icons.append(("gym", "Gimnasio 24h"))
    icons.append(("wifi", "WiFi rápido en todo el hotel"))
    if tidx >= 2:
        icons.append(("shield", "Seguridad alta"))
    if sustain_active:
        icons.append(("leaf", "Plan verde fuerte"))
    if brand["segment"] in ("urbano", "aeropuerto", "aparthotel"):
        icons.append(("briefcase", "Zona de trabajo"))
    if tidx >= 2:
        icons.append(("roomservice", "Comida a la habitación 24h"))
    if tidx >= 1:
        icons.append(("concierge", "Conserjería 24h"))
    if "piscina" in amenities:
        icons.append(("pool", "Piscina"))
    if "spa" in amenities:
        icons.append(("spa", "Spa / circuito wellness"))
    if "parking" in amenities:
        icons.append(("parking", "Parking cubierto"))
    if "playa_privada" in amenities:
        icons.append(("beach", "Playa privada"))
    if "business_center" in amenities:
        icons.append(("briefcase", "Business center"))
    return icons[:8]


ROOM_PROMPT_BY_TIER = {
    "economico": ["Habitación funcional con cama doble, mobiliario sencillo y buena luz natural.",
                  "Habitación compacta y bien aprovechada, baño sencillo y ropa de cama básica."],
    "medio": ["Habitación cómoda con cama queen, escritorio y baño completo renovado.",
              "Habitación luminosa con mobiliario actual y baño con ducha moderna."],
    "superior": ["Habitación amplia con vistas, ropa de cama de calidad y zona de estar.",
                 "Habitación superior con balcón, minibar y baño con bañera o ducha efecto lluvia."],
    "lujo": ["Suite luminosa con materiales nobles, zona de estar separada y detalles de diseño.",
             "Suite de lujo con vestidor, baño en mármol y vistas privilegiadas."],
    "ultralujo": ["Suite de gran formato con acabados de altísimo lujo, terraza privada y vistas panorámicas.",
                  "Suite presidencial con salón propio, mayordomo y baño de mármol con jacuzzi."],
}
POOL_PROMPT_BY_SEG = {
    "playa": ["Piscina frente al mar con tumbonas alineadas y vista abierta al horizonte."],
    "todoincluido": ["Piscina central del complejo con toboganes y zona infantil separada."],
    "montana": ["Piscina interior climatizada con grandes ventanales hacia la nieve."],
    "urbano": ["Piscina en azotea con tumbonas y vistas al perfil de la ciudad."],
    "default": ["Piscina exterior con tumbonas alineadas y vegetación mediterránea alrededor."],
}
RESTAURANT_PROMPT_BY_TIER = {
    "economico": "Comedor sencillo con mesas puestas para el desayuno buffet.",
    "medio": "Restaurante luminoso con mesas puestas y buffet de desayuno variado.",
    "superior": "Restaurante de ambiente cuidado con mesas bien vestidas y servicio de sala.",
    "lujo": "Restaurante de diseño con iluminación cálida y mesas con mantelería de calidad.",
    "ultralujo": "Restaurante gourmet con decoración de autor, cristalería fina y servicio de sala impecable.",
}
SPA_PROMPT = "Circuito de spa con piscina climatizada, tumbonas y ambiente relajado de vapor suave."
MEETING_PROMPT = "Sala de reuniones moderna con mesa de juntas, pantalla y luz natural."
LOBBY_PROMPT_BY_TIER = {
    "economico": "Recepción sencilla con mostrador funcional y zona de espera básica.",
    "medio": "Lobby acogedor con mostrador de recepción y zona de sofás.",
    "superior": "Lobby amplio y luminoso con mostrador de mármol y zona de estar elegante.",
    "lujo": "Lobby de diseño con techos altos, iluminación cálida y detalles de autor.",
    "ultralujo": "Gran lobby monumental con lámparas de autor, mármol y personal de recepción uniformado.",
}
INTERIOR_DESIGN_PROMPT = "Detalle de interiorismo cuidado: mobiliario de diseño, textura y color propios de la marca."
NATURE_PROMPT = "Entorno natural del hotel: jardín, huerta o bosque cercano, luz suave de tarde."
CHECKIN_PROMPT = "Mostrador de check-in rápido junto a la terminal, con paneles de vuelos al fondo."
KITCHEN_PROMPT = "Cocina equipada del apartamento, con electrodomésticos completos y buena luz."
BEACH_PRIVATE_PROMPT = "Playa privada del hotel con tumbonas y sombrillas de marca alineadas."


def secondary_images(city, brand, htype, amenities) -> list:
    r = rng(h32(city["id"], brand["id"], htype["id"], "secimg"))
    tier = brand["tier"]
    seg = brand["segment"]
    out = [("Habitaciones", _pick(r, ROOM_PROMPT_BY_TIER[tier]))]
    candidates = []
    if "piscina" in amenities:
        candidates.append(("Piscina", _pick(r, POOL_PROMPT_BY_SEG.get(seg, POOL_PROMPT_BY_SEG["default"]))))
    if seg in ("boutique", "historico"):
        candidates.append(("Interiorismo", INTERIOR_DESIGN_PROMPT))
    if seg in ("rural", "montana"):
        candidates.append(("Entorno natural", NATURE_PROMPT))
    if seg == "aeropuerto":
        candidates.append(("Check-in / lounge", CHECKIN_PROMPT))
    if seg == "aparthotel":
        candidates.append(("Cocina equipada", KITCHEN_PROMPT))
    if "playa_privada" in amenities:
        candidates.append(("Playa privada", BEACH_PRIVATE_PROMPT))
    if "restaurante" in amenities:
        candidates.append(("Restaurante", RESTAURANT_PROMPT_BY_TIER[tier]))
    if "spa" in amenities:
        candidates.append(("Spa / wellness", SPA_PROMPT))
    if "salones" in amenities:
        candidates.append(("Salón de reuniones", MEETING_PROMPT))
    candidates.append(("Bar de lobby", LOBBY_PROMPT_BY_TIER[tier]))
    out.extend(candidates[:3])
    return out[:4]


# ---------------------------------------------------------------------------
# Historia / filosofía de marca (sección "1. MARCA" de la ficha): se combinan
# 3 frases independientes (segmento + categoría + acento regional) elegidas
# por hotel, lo que da miles de combinaciones distintas ancladas siempre en
# el segmento, la categoría de estrellas y el continente real del hotel.
# ---------------------------------------------------------------------------
SEG_STORY = {
    "urbano": [
        "Pensado para quien viaja por trabajo pero no quiere renunciar a nada: ubicación central, tecnología ágil y un servicio que no hace esperar.",
        "La versión Horizon de la ciudad que nunca se detiene: check-in exprés, zonas de trabajo bien resueltas y todo a un paso a pie.",
        "Un refugio urbano eficiente, con la ciudad y sus reuniones a la vuelta de la esquina.",
        "Diseñado para estancias cortas y agenda apretada: todo lo esencial, sin fricciones.",
    ],
    "aeropuerto": [
        "La escala se convierte en descanso real: insonorización, horarios flexibles y un servicio pensado para el jet lag.",
        "A minutos de la terminal, con check-in y check-out pensados para vuelos a cualquier hora.",
        "El primer y el último hotel del viaje: rápido, práctico y siempre despierto.",
    ],
    "playa": [
        "El mar como vecino: la marca que convierte cada estancia en vacaciones de verdad.",
        "Frente a la arena, con la brisa como amenity principal y el reloj puesto en modo vacaciones.",
        "Vacaciones de sol y playa sin sorpresas: la promesa de Horizon en primera línea de costa.",
        "Una fachada blanca, una piscina desbordante y el horizonte marino como paisaje constante.",
    ],
    "todoincluido": [
        "Todo resuelto de antemano: comida, bebida y ocio incluidos, para no tener que pensar en nada durante la estancia.",
        "Pensado para familias y grupos: pulsera puesta y vacaciones sin sorpresas en la factura final.",
        "El concepto todo incluido llevado al extremo Horizon: variedad, animación y servicio sin límites.",
    ],
    "boutique": [
        "Cada propiedad es distinta: interiorismo propio, historias locales y un servicio a medida que no se replica en cadena.",
        "Hoteles con carácter, pensados para quien busca diseño y personalidad antes que tamaño.",
        "La colección más íntima del grupo: pocas habitaciones, mucho detalle.",
    ],
    "rural": [
        "Desconexión de verdad: ritmo lento, producto de la zona y silencio como principal lujo.",
        "La naturaleza como amenity principal: paisaje, kilómetro cero y una arquitectura que respeta el entorno.",
        "Pensado para quien busca aire limpio y distancia real de la rutina.",
    ],
    "montana": [
        "Chimenea, nieve y vistas: el refugio de montaña de la marca para el después del esquí.",
        "Pensado para el frío de verdad: madera, piedra y calor de hogar tras un día en la pista.",
        "La montaña como paisaje constante, en invierno de nieve y en verano de senderismo.",
    ],
    "bienestar": [
        "El equilibrio como servicio: circuitos de spa, gastronomía saludable y un ritmo pensado para desconectar.",
        "Pensado para cuidar el cuerpo y la mente, con tratamientos y espacios diseñados para el descanso activo.",
        "La promesa de bienestar de Horizon: agua, calma y un programa a medida de cada huésped.",
    ],
    "aparthotel": [
        "Como en casa, pero con servicio de hotel: cocina propia, espacio real y flexibilidad para estancias largas.",
        "Pensado para quien se muda temporalmente de ciudad: espacio, autonomía y limpieza regular incluida.",
        "El punto medio entre el hotel y el hogar, para estancias de días, semanas o meses.",
    ],
    "historico": [
        "Un edificio con historia propia, restaurado con respeto y convertido en hotel sin perder su carácter.",
        "Piedra, escudo y memoria: la marca que convierte el patrimonio en experiencia de huésped.",
        "Dormir dentro de la historia local, con todas las comodidades de un hotel Horizon actual.",
    ],
}
TIER_STORY = {
    "economico": [
        "Categoría económica: precio ajustado y lo esencial bien resuelto, sin extras que no se necesitan.",
        "Pensado para viajar más veces gastando menos, sin renunciar a la limpieza y la seguridad de la marca.",
    ],
    "medio": [
        "Categoría media: la relación calidad-precio que sostiene la mayoría de los viajes de Horizon Hotels.",
        "El estándar Horizon para el viajero habitual: cómodo, fiable y sin sorpresas.",
    ],
    "superior": [
        "Categoría superior: un escalón por encima en servicio, espacio y detalle, para quien quiere algo más.",
        "Pensado para quien valora el confort añadido sin llegar al lujo absoluto.",
    ],
    "lujo": [
        "Categoría de lujo: materiales, servicio y espacio pensados para una estancia memorable.",
        "El nivel alto de la marca, con atención personalizada y detalles que se notan desde la llegada.",
    ],
    "ultralujo": [
        "Ultralujo: la experiencia más alta del grupo, sin límite de detalle ni de servicio personalizado.",
        "La cúspide de Horizon Hotels: exclusividad real, servicio de mayordomo y materiales de referencia mundial.",
    ],
}
REGION_FLAVOR = {
    "Europa": [
        "Con el acento hospitalario europeo: producto de proximidad y un servicio cuidado en cada detalle.",
        "Integrado en el tejido urbano europeo, con arquitectura que dialoga con el entorno histórico.",
    ],
    "América del Norte": [
        "Con el ritmo práctico norteamericano: eficiencia, tecnología y servicio ágil de principio a fin.",
        "Pensado a la escala de los grandes destinos de Norteamérica, con espacio y confort generosos.",
    ],
    "América del Sur": [
        "Con la calidez latinoamericana como seña de identidad del servicio.",
        "Integrado en el paisaje y el ritmo de vida local, con producto de proximidad en cada rincón.",
    ],
    "Asia": [
        "Con el estándar de servicio y precisión característico de la hostelería asiática.",
        "Combinando la identidad Horizon con el detalle y la hospitalidad propios de la región.",
    ],
    "Oriente Medio": [
        "Con el sentido de la hospitalidad y el lujo característico de la región.",
        "Integrado en el skyline y el ritmo de la región, con un servicio pensado para superar expectativas.",
    ],
    "África": [
        "Con el color y la calidez africana presentes en cada detalle del hotel.",
        "Integrado en el paisaje y las comunidades locales, con producto y artesanía de la zona.",
    ],
    "Oceanía": [
        "Con el ritmo relajado y al aire libre característico de Oceanía.",
        "Pensado para un huésped que busca naturaleza y calidad de vida en igual medida.",
    ],
}


def brand_story(brand, cont_es: str) -> str:
    r = rng(h32(brand["id"], cont_es or "", "story"))
    s1 = _pick(r, SEG_STORY.get(brand["segment"], ["Un hotel de la familia Horizon."]))
    s2 = _pick(r, TIER_STORY[brand["tier"]])
    s3 = _pick(r, REGION_FLAVOR.get(cont_es, REGION_FLAVOR["Europa"]))
    return f"{s1} {s2} {s3}"


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
