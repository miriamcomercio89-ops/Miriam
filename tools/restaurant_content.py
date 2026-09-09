#!/usr/bin/env python3
"""Horizon Restaurant Group — motor de contenido enriquecido para la ficha A4
completa del Plan de Construcción Real (una página por local).

Es el equivalente restaurantero de tools/hotel_atlas.py: aquí solo se generan
DATOS (texto, precios, iconos, prompts de imagen secundaria...), nunca dibujo
de canvas — eso vive en tools/build_construction_plan.py, igual que
tools/hotel_atlas.py deja el dibujo a tools/build_hotel_construction_plan.py.

Todo es determinista (seed reproducible por ciudad + marca + dirección),
variado (pools de varias docenas de combinaciones) y en español. Reutiliza el
motor de ciudades / direcciones OSM / economía de tools/build_atlas.py (mismo
gaceteero GeoNames, mismas 50 marcas y 13 formatos, mismos datos económicos
de js/world.js) — NO toca build_atlas.py.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402

h32 = B.h32
rng = B.rng
TIER_LABEL = B.TIER_LABEL


def clamp(x, a, b):
    return max(a, min(b, x))


def _pick(r, options):
    return options[int(r() * len(options)) % len(options)]


def _pick_n_distinct(r, options, n):
    pool = list(options)
    n = min(n, len(pool))
    out = []
    for _ in range(n):
        idx = int(r() * len(pool)) % len(pool)
        out.append(pool.pop(idx))
    return out


def _hsl_to_hex(h, s, l):
    s /= 100.0
    l /= 100.0

    def k(n):
        return (n + h / 30) % 12

    a = s * min(l, 1 - l)

    def f(n):
        return l - a * max(-1, min(k(n) - 3, min(9 - k(n), 1)))

    return "#%02x%02x%02x" % (round(255 * f(0)), round(255 * f(8)), round(255 * f(4)))


# ---------------------------------------------------------------------------
# Color de marca determinista: las 50 marcas de tools/build_atlas.py no traen
# color propio (a diferencia de hoteles), así que se genera uno por marca a
# partir de su posición en BRANDS (ángulo dorado, igual criterio que hoteles)
# y de su tier (fast_food/casual/luxury/bar/food_truck) para variar
# saturación/luminosidad — más vivo y oscuro cuanto más premium.
# ---------------------------------------------------------------------------
TIER_ORDER_R = ["fast_food", "food_truck", "casual", "bar", "luxury"]
BID_INDEX = {b[0]: i for i, b in enumerate(B.BRANDS)}
BRAND_BY_BID = {b[0]: b for b in B.BRANDS}


def brand_color(bid: str, tier: str):
    idx = BID_INDEX.get(bid, 0)
    tidx = TIER_ORDER_R.index(tier) if tier in TIER_ORDER_R else 2
    hue = (idx * 137.508) % 360
    sat = 44 + tidx * 8
    light = 44 - tidx * 4
    color = _hsl_to_hex(hue, sat, max(24, light))
    if tidx >= 3:
        # tiers premium (bar/luxury): acento dorado fijo, con más contraste sobre fondos
        # oscuros y saturados que un tono de la misma familia de color (igual criterio
        # que hoteles con sus categorías de más estrellas).
        color2 = _hsl_to_hex(42, 55, 50)
    else:
        color2 = _hsl_to_hex((hue + 35) % 360, max(20, sat - 8), max(30, light + 6))
    return color, color2


# ---------------------------------------------------------------------------
# Familias de cocina: agrupa las ~40 cocinas distintas de BRANDS (columna
# `cuisine`) en 27 familias razonables para la Carta, cada una con su propio
# rango de precio base (€, tarifa "casual" en España antes de tier/ciudad) y
# su pool de 4-8 platos con etiqueta opcional (vegetariano/picante).
# ---------------------------------------------------------------------------
FAMILY_OF_BID = {
    "roble": "parrilla", "olivo": "mediterranea", "marea": "mariscos", "farol": "japonesa",
    "nudo": "ramen", "cinta": "japonesa", "wok": "china", "thai": "tailandesa",
    "monzon": "india", "seul": "coreana", "palazzo": "italiana", "vesubio": "italiana",
    "pizza": "italiana", "nieve": "italiana", "empanada": "parrilla", "arena": "mexicana",
    "bao": "mexicana", "jerk": "caribena", "pampa": "parrilla", "ola": "peruana",
    "pho": "hamburguesas", "bufalo": "hamburguesas", "pollo": "pollo_frito", "dumpling": "pollo_alitas",
    "frankfurt": "hot_dog", "carbon": "parrilla", "gyros": "diner", "nord": "parrilla",
    "linterna": "contemporanea", "mezze": "vegetariana", "poke": "vegetariana", "falafel": "vegetariana",
    "alpina": "italiana", "eclipse": "brunch", "cerveza": "brunch", "vermu": "pasteleria",
    "tequila": "pasteleria", "bodega": "pasteleria", "whisky": "pasteleria", "absenta": "brunch",
    "latitud": "coctel", "polar": "alta_cocina", "seda": "alta_cocina", "etoile": "alta_cocina",
    "rubi": "alta_cocina", "mar": "mariscos", "sakura": "alta_cocina", "tropico": "banquetes",
    "doner": "comida_viaje", "taco": "food_hall",
}

FAMILY_LABEL = {
    "parrilla": "Parrilla y asador", "mediterranea": "Mediterránea", "mariscos": "Mariscos y pescado",
    "japonesa": "Japonesa", "ramen": "Ramen y fideos", "china": "China / wok", "tailandesa": "Tailandesa",
    "india": "India / curry", "coreana": "Coreana", "italiana": "Italiana (pizza y pasta)",
    "mexicana": "Mexicana / tacos", "caribena": "Caribeña", "peruana": "Peruana",
    "hamburguesas": "Hamburguesas", "pollo_frito": "Pollo frito", "pollo_alitas": "Alitas",
    "hot_dog": "Hot dog", "diner": "Diner americano", "contemporanea": "Cocina contemporánea",
    "vegetariana": "Vegetariana / bowls", "brunch": "Brunch / café / pastelería",
    "pasteleria": "Pastelería / heladería", "coctel": "Cócteles / bar", "alta_cocina": "Alta cocina",
    "banquetes": "Banquetes / eventos", "comida_viaje": "Comida de viaje", "food_hall": "Food hall",
}

DISH_POOLS = {
    "parrilla": [
        ("Chuletón de vaca madurada", ""), ("Entrecot a la brasa", ""), ("Costillas glaseadas al carbón", "picante"),
        ("Solomillo a la parrilla", ""), ("Brocheta de solomillo y pimientos", ""), ("Picaña al punto de sal", ""),
        ("Costilla de cerdo ahumada 12 horas", ""), ("Parrillada mixta de la casa", ""),
    ],
    "mediterranea": [
        ("Ensalada de tomate y ventresca", ""), ("Berenjenas con miel de caña", "vegetariano"),
        ("Pulpo a la gallega", ""), ("Croquetas de jamón caseras", ""), ("Gazpacho andaluz", "vegetariano"),
        ("Paella de marisco para dos", ""), ("Boquerones en vinagre", ""), ("Tortilla de patatas con cebolla", "vegetariano"),
    ],
    "mariscos": [
        ("Gambas al ajillo", "picante"), ("Marisco de la ría al vapor", ""), ("Arroz caldoso de bogavante", ""),
        ("Almejas a la marinera", ""), ("Ostras frescas del día", ""), ("Cigalas a la plancha", ""),
        ("Zarzuela de pescado y marisco", ""),
    ],
    "japonesa": [
        ("Selección de nigiri del chef", ""), ("Sashimi de atún rojo", ""), ("Uramaki de salmón y aguacate", ""),
        ("Gyozas de cerdo", ""), ("Tempura de langostinos", ""), ("Tataki de atún con sésamo", ""),
        ("Sushi variado 16 piezas", ""), ("Edamame con sal marina", "vegetariano"),
    ],
    "ramen": [
        ("Ramen tonkotsu", ""), ("Ramen picante miso", "picante"), ("Ramen vegetal con setas shiitake", "vegetariano"),
        ("Gyozas al vapor", ""), ("Bao de panceta braseada", ""), ("Ramen de pollo y huevo marinado", ""),
    ],
    "china": [
        ("Wok de ternera con verduras", ""), ("Pollo agridulce", ""), ("Arroz tres delicias", ""),
        ("Dim sum variado", ""), ("Fideos salteados con gambas", ""), ("Pato laqueado", ""),
        ("Tofu picante Sichuan", "picante"),
    ],
    "tailandesa": [
        ("Pad thai de gambas", ""), ("Curry rojo de pollo", "picante"), ("Curry verde con tofu", "vegetariano"),
        ("Ensalada picante de papaya", "picante"), ("Rollitos de primavera", "vegetariano"), ("Arroz con curry amarillo", ""),
    ],
    "india": [
        ("Pollo tikka masala", ""), ("Curry de cordero", "picante"), ("Dal de lentejas", "vegetariano"),
        ("Naan de ajo", "vegetariano"), ("Samosas de verduras", "vegetariano"), ("Biryani de pollo", "picante"),
        ("Paneer tikka", "vegetariano"),
    ],
    "coreana": [
        ("Bibimbap de ternera", ""), ("Bulgogi a la parrilla", ""), ("Kimchi jjigae", "picante"),
        ("Pollo frito coreano picante", "picante"), ("Tteokbokki", "picante"), ("Banchan variado", "vegetariano"),
    ],
    "italiana": [
        ("Pizza margarita", "vegetariano"), ("Pizza cuatro quesos", "vegetariano"), ("Spaghetti carbonara", ""),
        ("Lasaña de la casa", ""), ("Risotto de setas", "vegetariano"), ("Tagliatelle al ragú", ""),
        ("Pizza diavola", "picante"), ("Burrata con tomate de temporada", "vegetariano"),
    ],
    "mexicana": [
        ("Tacos al pastor", "picante"), ("Guacamole con totopos", "vegetariano"), ("Burrito de ternera", ""),
        ("Quesadillas de queso", "vegetariano"), ("Enchiladas verdes", "picante"), ("Nachos con chili con carne", "picante"),
    ],
    "caribena": [
        ("Ropa vieja cubana", ""), ("Cerdo al jerk picante", "picante"), ("Arroz moro con plátano frito", "vegetariano"),
        ("Ceviche caribeño", ""), ("Yuca con mojo", "vegetariano"), ("Pollo guisado con especias", ""),
    ],
    "peruana": [
        ("Ceviche clásico de corvina", ""), ("Lomo saltado", ""), ("Causa limeña de pollo", ""),
        ("Arroz chaufa de mariscos", ""), ("Anticuchos de corazón", ""), ("Ají de gallina", "picante"),
    ],
    "hamburguesas": [
        ("Hamburguesa clásica con cheddar", ""), ("Hamburguesa doble bacon", ""), ("Hamburguesa vegetal", "vegetariano"),
        ("Patatas fritas con salsa de la casa", "vegetariano"), ("Hamburguesa picante jalapeño", "picante"), ("Onion rings", "vegetariano"),
    ],
    "pollo_frito": [
        ("Menú de pollo frito crujiente", ""), ("Pollo frito picante", "picante"), ("Tiras de pollo empanado", ""),
        ("Bocadillo de pollo crujiente", ""), ("Patatas fritas grandes", "vegetariano"), ("Nuggets de pollo", ""),
    ],
    "pollo_alitas": [
        ("Alitas BBQ", ""), ("Alitas picantes búfalo", "picante"), ("Alitas al ajillo", ""),
        ("Alitas miel y mostaza", ""), ("Patatas gajo con salsa ranch", "vegetariano"), ("Tabla mixta de alitas", "picante"),
    ],
    "hot_dog": [
        ("Perrito clásico americano", ""), ("Perrito con chili con carne", "picante"), ("Perrito de queso fundido", ""),
        ("Patatas fritas con kétchup", "vegetariano"), ("Perrito picante jalapeño", "picante"), ("Combo perrito y refresco", ""),
    ],
    "diner": [
        ("Hamburguesa de diner con beicon", ""), ("Tortitas con sirope de arce", "vegetariano"), ("Sándwich club", ""),
        ("Batido de vainilla", "vegetariano"), ("Costillas BBQ del diner", ""), ("Tarta de manzana casera", "vegetariano"),
    ],
    "contemporanea": [
        ("Steak tartar de la casa", ""), ("Huevo poché con trufa", "vegetariano"), ("Vieiras a la plancha", ""),
        ("Carrillera de ternera al vino tinto", ""), ("Tartar de atún picante", "picante"), ("Risotto cremoso de temporada", "vegetariano"),
    ],
    "vegetariana": [
        ("Bowl de quinoa y aguacate", "vegetariano"), ("Poké de salmón", ""), ("Ensalada de kale y frutos secos", "vegetariano"),
        ("Hummus con crudités", "vegetariano"), ("Buddha bowl vegano", "vegetariano"), ("Wrap de falafel", "vegetariano"),
        ("Bowl picante de tofu", "picante"),
    ],
    "brunch": [
        ("Tostada de aguacate y huevo", "vegetariano"), ("Huevos benedictinos", ""), ("Cruasán de mantequilla", "vegetariano"),
        ("Bol de yogur y granola", "vegetariano"), ("Tortitas con frutos rojos", "vegetariano"), ("Café con leche y bollería", "vegetariano"),
    ],
    "pasteleria": [
        ("Tarta de chocolate negro", "vegetariano"), ("Helado artesano de dos bolas", "vegetariano"), ("Cruasán relleno de crema", "vegetariano"),
        ("Cheesecake de frutos rojos", "vegetariano"), ("Copa de helado con sirope", "vegetariano"), ("Trufas de chocolate", "vegetariano"),
    ],
    "coctel": [
        ("Cóctel de autor de la casa", ""), ("Mojito clásico", ""), ("Negroni", ""),
        ("Gin tonic premium", ""), ("Margarita picante", "picante"), ("Tabla de aperitivos para compartir", ""),
    ],
    "alta_cocina": [
        ("Menú degustación del chef", ""), ("Foie micuit con reducción de Pedro Ximénez", ""), ("Rodaballo salvaje a la brasa", ""),
        ("Solomillo Wagyu", ""), ("Caviar con blinis", ""), ("Trufa negra de temporada", "vegetariano"),
        ("Bogavante a la parrilla con mantequilla de hierbas", ""),
    ],
    "banquetes": [
        ("Menú de banquete: entrante, principal y postre", ""), ("Cóctel de bienvenida y canapés", ""),
        ("Solomillo al horno para eventos", ""), ("Tarta de celebración a medida", "vegetariano"),
        ("Buffet de entrantes fríos y calientes", ""), ("Menú infantil de evento", "vegetariano"),
    ],
    "comida_viaje": [
        ("Bocadillo mixto para llevar", ""), ("Ensalada para llevar", "vegetariano"), ("Sándwich club de viaje", ""),
        ("Café y bollería de viaje", "vegetariano"), ("Wrap de pollo para llevar", ""), ("Menú combinado de viaje", ""),
    ],
    "food_hall": [
        ("Ración del puesto de tacos", "picante"), ("Bowl del puesto asiático", ""), ("Pizza al corte del puesto italiano", "vegetariano"),
        ("Burger del puesto americano", ""), ("Ensalada del puesto saludable", "vegetariano"), ("Ramen del puesto japonés", ""),
        ("Postre del puesto de dulces", "vegetariano"),
    ],
}

BASE_PRICE_RANGE = {
    "parrilla": (16, 32), "mediterranea": (8, 16), "mariscos": (15, 30), "japonesa": (10, 22),
    "ramen": (9, 14), "china": (7, 13), "tailandesa": (8, 14), "india": (8, 15), "coreana": (9, 16),
    "italiana": (8, 15), "mexicana": (6, 12), "caribena": (9, 16), "peruana": (10, 19),
    "hamburguesas": (7, 13), "pollo_frito": (5, 10), "pollo_alitas": (6, 11), "hot_dog": (4, 8),
    "diner": (7, 14), "contemporanea": (14, 26), "vegetariana": (7, 13), "brunch": (4, 10),
    "pasteleria": (3, 7), "coctel": (7, 14), "alta_cocina": (28, 60), "banquetes": (18, 38),
    "comida_viaje": (4, 9), "food_hall": (6, 13),
}

TIER_PRICE_MULT = {"fast_food": 0.72, "casual": 1.0, "luxury": 1.7, "bar": 1.15, "food_truck": 0.7}


def fmt_price(x: float) -> str:
    return f"{x:.2f}".replace(".", ",") + " €"


def carta_section(city, brand, size_id, econ, address: str = "") -> dict:
    """Carta de 3-4 platos con precio y un "plato estrella" destacado, determinista por
    ciudad+marca+dirección. El precio escala por tier de la marca y por el coste de vida
    real del país/ciudad (mismo multiplicador de alquiler que usa build_construction_plan
    para el resto de la inversión), así los precios suben de verdad en países caros."""
    bid, name, cuisine, tier, tagline = brand
    family = FAMILY_OF_BID.get(bid, "mediterranea")
    pool = DISH_POOLS.get(family) or DISH_POOLS["mediterranea"]
    lo, hi = BASE_PRICE_RANGE.get(family, (8, 16))
    tier_mult = TIER_PRICE_MULT.get(tier, 1.0)

    cc = city["cc"]
    rent_ctry = B.COUNTRY_RENT.get(cc, 40)
    pop_k = city["pop"] / 1000.0
    city_factor = clamp(math.log10(pop_k + 10) / 2.2, 0.55, 2.8)
    rent_idx = (rent_ctry / 72.0) * city_factor
    price_mult = clamp(0.45 + rent_idx * 0.55, 0.5, 3.0)

    r = rng(h32(city["id"], bid, address or city["name"], "carta"))
    n_platos = 4 if r() < 0.5 else 3
    chosen = _pick_n_distinct(r, pool, n_platos)

    platos = []
    for nombre, tag in chosen:
        jitter = 0.82 + r() * 0.46
        base_price = lo + r() * (hi - lo)
        price = base_price * tier_mult * price_mult * jitter
        price = max(1.5, round(price * 2) / 2.0)
        platos.append({"nombre": nombre, "precio": price, "estrella": False, "tag": tag})

    star_idx = int(r() * len(platos)) % len(platos)
    platos[star_idx]["estrella"] = True

    precios = [p["precio"] for p in platos]
    rango_precio = f"{fmt_price(min(precios))} - {fmt_price(max(precios))}"
    return {
        "platos": platos, "rango_precio": rango_precio,
        "tipo_cocina": cuisine, "family": family, "family_label": FAMILY_LABEL.get(family, cuisine),
    }


# ---------------------------------------------------------------------------
# 2) LOCAL (equivalente a "edificio" en hoteles): reforma, año, terraza,
#    aforo interior/exterior, accesibilidad, ambiente/ruido y estilo (ligado
#    al tier y reutilizando tools/build_atlas.BID_STYLE, ya existente).
# ---------------------------------------------------------------------------
CALIDAD_BY_TIER = {
    "fast_food": ["Reforma funcional y económica, mobiliario resistente", "Acabados sencillos pensados para rotación rápida"],
    "casual": ["Reforma de calidad media, buen mantenimiento", "Acabados correctos, ambiente cuidado sin grandes lujos"],
    "luxury": ["Interiorismo de diseño con materiales nobles", "Reforma de alto standing, mobiliario de firma"],
    "bar": ["Ambiente de diseño con iluminación cuidada", "Interiorismo de barra con materiales cálidos"],
    "food_truck": ["Vehículo o caseta bien mantenida, equipamiento básico", "Instalación móvil funcional y compacta"],
}
ACCESIBILIDAD_POOL = [
    "Acceso sin escalones y baño adaptado",
    "Entrada accesible, aseo estándar",
    "Acceso con un pequeño escalón de entrada",
    "Totalmente accesible, mesas y baño adaptados",
    "Acceso por rampa, sin baño adaptado",
    "Acceso algo limitado por el espacio reducido del local",
]
AMBIENTE_BY_TIER = {
    "fast_food": ["Ambiente informal y dinámico, ruido medio-alto", "Rotación rápida de mesas, ruido propio de mostrador"],
    "casual": ["Ambiente familiar y desenfadado, ruido moderado", "Ambiente de barrio, conversación fácil"],
    "luxury": ["Ambiente tranquilo y cuidado, conversación fácil", "Sala silenciosa, servicio pausado y atento"],
    "bar": ["Ambiente animado, música y ruido alto por la noche", "Ambiente nocturno, barra concurrida los fines de semana"],
    "food_truck": ["Ambiente informal al aire libre, ruido de calle", "Ambiente festivo de mercado o evento"],
}
_NO_TERRAZA_SIZES = {"ghost", "local_mall", "drive_thru", "kiosco_estacion", "estadio"}


def local_section(city, brand, size_id, seats, m2, rec) -> dict:
    bid, name, cuisine, tier, tagline = brand
    address = rec.get("text") or city["name"]
    r = rng(h32(city["id"], bid, address, "local"))

    anio_apertura = 1990 + int(r() * 35)
    reformado = r() < 0.42
    anio_reforma = None
    if reformado:
        anio_reforma = min(2025, anio_apertura + 4 + int(r() * (2025 - anio_apertura)))

    coast_like = bool(rec.get("beach")) or bool(city.get("coast_ok"))
    if size_id in _NO_TERRAZA_SIZES:
        terraza = False
    elif size_id in ("kiosco_playa", "rooftop"):
        terraza = True
    elif coast_like and r() < 0.68:
        terraza = True
    elif bool(rec.get("ped")) and r() < 0.4:
        terraza = True
    else:
        terraza = r() < 0.16

    if terraza:
        ext_pct = 0.2 + r() * 0.35
        seats_ext = max(2, int(round(seats * ext_pct)))
        seats_int = max(0, seats - seats_ext)
    else:
        seats_ext = 0
        seats_int = seats

    return {
        "calidad": _pick(r, CALIDAD_BY_TIER.get(tier, CALIDAD_BY_TIER["casual"])),
        "anio_apertura": anio_apertura, "anio_reforma": anio_reforma,
        "terraza": terraza, "seats_int": seats_int, "seats_ext": seats_ext,
        "accesibilidad": _pick(r, ACCESIBILIDAD_POOL),
        "ambiente": _pick(r, AMBIENTE_BY_TIER.get(tier, AMBIENTE_BY_TIER["casual"])),
        "estilo": B.BID_STYLE.get(bid, "decoración propia de la marca"),
    }


# ---------------------------------------------------------------------------
# 3) BÁSICO: personal aproximado, clientela habitual, horario habitual y tipo
#    de servicio (mesa/barra/mostrador/autoservicio), según tier y formato.
# ---------------------------------------------------------------------------
CLIENTELA_BY_TIER = {
    "fast_food": ["Trabajadores en su pausa de mediodía, estudiantes y familias con prisa",
                  "Público joven y de paso, pedidos rápidos para llevar"],
    "casual": ["Familias del barrio, grupos de amigos y comensales habituales",
               "Clientela de proximidad, celebraciones informales de fin de semana"],
    "luxury": ["Comensales de ocasión especial, ejecutivos y turismo gastronómico",
               "Clientela exigente que busca una experiencia gastronómica cuidada"],
    "bar": ["Grupos de amigos, after-work y ambiente de noche",
            "Clientela joven y nocturna, celebraciones y despedidas"],
    "food_truck": ["Público de paso en mercados y eventos", "Clientela ocasional, turistas y curiosos"],
}
HORARIO_BY_TIER = {
    "fast_food": ["Abierto todos los días, horario ininterrumpido de mediodía y noche", "Horario continuo de 10:00 a 24:00"],
    "casual": ["Servicio de comidas y cenas, cierra un día a la semana", "Horario partido de mediodía y noche, todos los días"],
    "luxury": ["Solo cenas y comidas con reserva, cerrado los lunes", "Servicio reducido de alta cocina, dos turnos por servicio"],
    "bar": ["Abre por la tarde y cierra de madrugada", "Horario nocturno, de 17:00 a 03:00"],
    "food_truck": ["Horario flexible según eventos y mercados", "Servicio de mediodía y tarde en ubicación variable"],
}
_MOSTRADOR_SIZES = {"kiosco", "kiosco_playa", "kiosco_estacion", "ghost", "drive_thru"}


def tipo_servicio_for(size_id: str, tier: str) -> str:
    if size_id in _MOSTRADOR_SIZES:
        return "Mostrador / autoservicio, para llevar o recoger"
    if size_id == "food_hall":
        return "Autoservicio en varios puestos de comida"
    if tier == "bar":
        return "Servicio de barra, con algunas mesas altas"
    if tier == "fast_food":
        return "Mostrador con recogida en mesa"
    return "Servicio de mesa con camareros"


def basico_section(brand, size_id, seats) -> dict:
    bid, name, cuisine, tier, tagline = brand
    r = rng(h32(bid, size_id, seats, "basico"))
    return {
        "personal_aprox": max(2, round(seats / 9)),
        "clientes": _pick(r, CLIENTELA_BY_TIER.get(tier, CLIENTELA_BY_TIER["casual"])),
        "horario": _pick(r, HORARIO_BY_TIER.get(tier, HORARIO_BY_TIER["casual"])),
        "tipo_servicio": tipo_servicio_for(size_id, tier),
    }


# ---------------------------------------------------------------------------
# 4) SERVICIOS: checklist variado según tier/tamaño/ubicación real.
# ---------------------------------------------------------------------------
def servicios_section(brand, size_id, seats, rec, city, local) -> list[str]:
    bid, name, cuisine, tier, tagline = brand
    r = rng(h32(city["id"], bid, rec.get("text") or city["name"], "servicios"))
    out = ["WiFi gratuito para clientes"]
    if local["terraza"]:
        out.append(f"Terraza con {local['seats_ext']} plazas exteriores")
    if seats >= 40 or size_id in ("food_hall", "local_grande", "flagship", "estadio"):
        out.append("Apto para grupos grandes y reservas de empresa")
    if tier in ("casual", "luxury") and r() < 0.7:
        out.append("Reservas por teléfono o app")
    if not rec.get("ped") and size_id not in ("local_mall", "kiosco_estacion") and r() < 0.55:
        out.append("Parking cercano")
    if "sin baño adaptado" not in local["accesibilidad"] and "limitado" not in local["accesibilidad"]:
        out.append("Acceso para sillas de ruedas")
    if tier in ("fast_food", "casual") and size_id != "ghost" and r() < 0.6:
        out.append("Apto para niños, con trona disponible")
    if tier in ("luxury", "bar") and r() < 0.32:
        out.append("Música en vivo algunas noches")
    if rec.get("metro") and r() < 0.5:
        out.append("A pocos minutos de metro o cercanías")
    if size_id == "ghost" and "Apto para grupos grandes y reservas de empresa" not in out:
        out.append("Solo delivery y recogida, sin sala para comer")
    return out[:8]


# ---------------------------------------------------------------------------
# 5) EXTRAS: 2-3 extras operativos variados, sin duplicados.
# ---------------------------------------------------------------------------
EXTRA_OPERATIVO_POOL = [
    "Delivery propio activo en la zona",
    "Delivery a través de plataformas asociadas",
    "Reservas online activas",
    "Menú del día de lunes a viernes",
    "Oferta de apertura con descuento el primer mes",
    "Evento de inauguración con degustación",
    "Programa de fidelidad con puntos por consumo",
    "Happy hour de tardeo entre semana",
    "Catering para eventos bajo petición",
    "Colaboración con apps de cupones de descuento",
    "Menú degustación los fines de semana",
    "Servicio de recogida en el propio local (click & collect)",
]


def extras_section(brand, size_id, rec, city) -> dict:
    bid, name, cuisine, tier, tagline = brand
    r = rng(h32(city["id"], bid, rec.get("text") or city["name"], "extras"))
    dias_oferta = _pick(r, [0, 0, 0, 0, 7, 14, 21, 30])
    n_extra = 3 if r() < 0.4 else 2
    ops = _pick_n_distinct(r, EXTRA_OPERATIVO_POOL, n_extra)
    delivery_activo = any(o.startswith("Delivery propio") or o.startswith("Delivery a través") for o in ops)
    return {"dias_oferta": dias_oferta, "operativo": ops, "delivery_activo": delivery_activo}


# ---------------------------------------------------------------------------
# 6) MARCA (historia/filosofía): familia de cocina + tier + acento regional,
#    igual patrón combinatorio que hotel_atlas.brand_story.
# ---------------------------------------------------------------------------
FAMILY_STORY = {
    "parrilla": ["El fuego y la brasa como seña de identidad: producto de calidad y cocción lenta, sin prisas.",
                 "La parrilla como ritual: carnes seleccionadas y el humo justo en cada mesa."],
    "mediterranea": ["Aceite, huerta y producto de mercado: la cocina mediterránea de toda la vida, sin artificios.",
                      "Recetas de siempre con producto de proximidad, para comer como en casa."],
    "mariscos": ["El mar servido sin adornos: producto fresco y cocinas que respetan la materia prima.",
                 "De la lonja a la mesa: mariscos y pescado de la máxima frescura posible."],
    "japonesa": ["Precisión y producto crudo de calidad: la tradición japonesa adaptada al día a día.",
                 "El corte, el arroz y el silencio de la barra: Japón de mesa, sin artificios."],
    "ramen": ["Caldo largo, cola corta: el ramen como comida reconfortante de todos los días.",
              "Fideos y caldo de cocción lenta, servidos rápido para el ritmo de la ciudad."],
    "china": ["El wok siempre al fuego vivo: cocina china rápida y de sabores intensos.",
              "Recetas del recetario chino más popular, adaptadas al gusto local."],
    "tailandesa": ["Dulce, ácido, picante y salado en equilibrio: la calle tailandesa en cada plato.",
                   "Especias frescas y wok rápido, con el picante como opción, no como obligación."],
    "india": ["Especiado de ida y vuelta: curries y panes recién hechos, con historia detrás.",
              "La ruta de las especias servida en mesa, de suave a muy picante."],
    "coreana": ["Parrilla, fermentados y banchan: la mesa coreana compartida, con mucho sabor.",
                "Picante controlado y producto fermentado, la nueva ola de cocina coreana de barrio."],
    "italiana": ["La trattoria de siempre: pasta fresca, horno de leña y producto italiano real.",
                 "Pizza y pasta sin atajos, con la sencillez como bandera de la cocina italiana."],
    "mexicana": ["El taco de verdad: maíz, picante moderado y salsas hechas en casa cada día.",
                 "México de mesa y de calle a la vez: sabor directo, sin postureo."],
    "caribena": ["Ritmo caribeño en el plato: especias, plátano y cocción lenta al estilo de la isla.",
                 "Sabor cubano y caribeño de fondo de olla, para comer con las manos si hace falta."],
    "peruana": ["Altura, mar y cítrico: la cocina peruana que fusiona tradición andina y costa.",
                "Ceviche, ají y producto de altura: Perú servido con precisión moderna."],
    "hamburguesas": ["La hamburguesa entendida como producto serio: carne de calidad y pan artesano.",
                      "Sin atajos en la carne ni en el pan: la hamburguesa que se toma en serio a sí misma."],
    "pollo_frito": ["Crujiente por fuera, jugoso por dentro: la receta de pollo frito de toda la vida.",
                    "Pollo frito rápido y consistente, la comida reconfortante de cada barrio."],
    "pollo_alitas": ["Alitas para compartir con las manos: salsas propias y punto de picante a elegir.",
                      "La cultura de las alitas americanas, con salsas de la casa y ambiente de partido."],
    "hot_dog": ["El perrito de acera reinventado: pan tostado, salchicha de calidad y salsas propias.",
                "Comida rápida honesta: perritos calientes bien hechos, sin complicarse."],
    "diner": ["El diner americano de carretera: tortitas, hamburguesas y café de jarra a cualquier hora.",
              "Neón, formica y clásicos americanos, sin pretensiones."],
    "contemporanea": ["Cocina de mercado con técnica actual: producto de temporada y platos que cambian con el año.",
                       "Contemporánea y de autor sin salir de precio razonable: técnica al servicio del producto."],
    "vegetariana": ["Verduras y legumbres como protagonistas, con mucho sabor y ninguna renuncia.",
                     "Bowls y platos vegetales pensados para comer bien, rápido y ligero."],
    "brunch": ["El desayuno tardío elevado a categoría propia: huevos, tostas y café de calidad.",
               "Brunch de fin de semana y desayunos de diario, con producto fresco de horno propio."],
    "pasteleria": ["Dulce hecho cada día en el propio obrador, sin conservantes de más.",
                   "La vitrina como escaparate: tartas, helados y bollería artesanal."],
    "coctel": ["La coctelería como espectáculo discreto: técnica clásica y producto de calidad en cada copa.",
               "Barra de autor con clásicos bien hechos y alguna creación propia de la casa."],
    "alta_cocina": ["Alta cocina de producto, técnica depurada y servicio de sala impecable.",
                    "Menús pensados como un relato: temporada, territorio y técnica en cada pase."],
    "banquetes": ["Eventos y banquetes resueltos con la misma exigencia que un servicio a la carta.",
                  "Bodas, comuniones y eventos de empresa con menús a medida y logística propia."],
    "comida_viaje": ["Comida rápida y honesta para quien viaja: bocadillos y menús listos para llevar.",
                      "Pensado para el tránsito: pedido rápido, calidad constante, sin sorpresas."],
    "food_hall": ["Varios fogones bajo el mismo techo: la variedad como propuesta de valor.",
                  "Un mercado gastronómico en miniatura, con opciones para todos los gustos en la mesa."],
}
TIER_STORY = {
    "fast_food": ["Formato rápido y accesible: precio ajustado y servicio ágil, sin renunciar al sabor.",
                  "Pensado para comer bien en poco tiempo y sin gastar de más."],
    "casual": ["El formato central del grupo: buena relación calidad-precio para el día a día.",
               "Cocina honesta y servicio cercano, el estándar de la marca para el público habitual."],
    "luxury": ["El nivel alto del grupo: producto premium, servicio de sala y una experiencia cuidada al detalle.",
               "Gastronomía de referencia, pensada para ocasiones que merecen una mesa especial."],
    "bar": ["Formato de barra y coctelería, pensado para el after-work y las noches de grupo.",
            "Ambiente social por encima de todo, con una carta pensada para compartir y beber bien."],
    "food_truck": ["Formato móvil y flexible, presente en mercados, eventos y zonas de alta rotación.",
                   "La propuesta más ágil del grupo: sin sala fija, pero con la misma receta de siempre."],
}
REGION_FLAVOR = {
    "Europa": ["Con producto de proximidad europeo y un servicio cuidado en cada detalle.",
               "Integrado en la vida de calle europea, con clientela de barrio y de paso a partes iguales."],
    "América del Norte y Central": ["Con el ritmo práctico y directo de Norteamérica: raciones generosas y servicio ágil.",
                                     "Pensado a la escala de las grandes ciudades y carreteras del continente."],
    "América del Sur": ["Con la calidez latinoamericana como seña de identidad del servicio de mesa.",
                         "Integrado en el ritmo de vida local, con producto de proximidad en cada plato."],
    "Asia": ["Con el estándar de precisión y servicio característico de la restauración asiática.",
             "Combinando la identidad Horizon con el detalle y la hospitalidad propios de la región."],
    "África": ["Con el color y la calidez propios de la restauración africana urbana.",
               "Integrado en el paisaje y las comunidades locales, con producto de la zona cuando es posible."],
    "Oceanía": ["Con el ritmo relajado y al aire libre característico de Oceanía.",
                "Pensado para un público que valora la naturalidad y la calidad del producto por igual."],
}


def brand_story(brand, cont_es: str) -> str:
    bid, name, cuisine, tier, tagline = brand
    family = FAMILY_OF_BID.get(bid, "mediterranea")
    r = rng(h32(bid, cont_es or "", "story"))
    s1 = _pick(r, FAMILY_STORY.get(family, [f"«{tagline}»"]))
    s2 = _pick(r, TIER_STORY.get(tier, TIER_STORY["casual"]))
    s3 = _pick(r, REGION_FLAVOR.get(cont_es, REGION_FLAVOR["Europa"]))
    return f"{s1} {s2} {s3}"


# ---------------------------------------------------------------------------
# 7) ICONOS de características (hasta 8) — usa los kinds reutilizados de
#    hoteles (wifi, parking, pin, briefcase, shield, leaf...) más los nuevos
#    kinds de restaurante que build_construction_plan.draw_icon añade:
#    dish, terrace, delivery, seats, ghostkitchen, foodtruck, cocktail.
# ---------------------------------------------------------------------------
def feature_icons(seats, m2, brand, size_id, rec, local, servicios, extras) -> list:
    bid, name, cuisine, tier, tagline = brand
    icons = [("dish", f"Cocina {cuisine}"), ("seats", f"{seats} plazas · {m2} m²")]
    if size_id == "ghost":
        icons.append(("ghostkitchen", "Cocina fantasma, solo delivery"))
    elif size_id == "food_truck" or (tier == "food_truck"):
        icons.append(("foodtruck", "Formato food truck / móvil"))
    if local["terraza"]:
        icons.append(("terrace", f"Terraza con {local['seats_ext']} plazas"))
    if extras.get("delivery_activo"):
        icons.append(("delivery", "Delivery a domicilio"))
    if tier == "bar":
        icons.append(("bar", "Coctelería de la casa"))
    icons.append(("wifi", "WiFi gratuito"))
    if any("Parking" in s for s in servicios):
        icons.append(("parking", "Parking cercano"))
    if any("grupos grandes" in s for s in servicios):
        icons.append(("briefcase", "Apto para grupos y empresas"))
    if any("sillas de ruedas" in s for s in servicios):
        icons.append(("shield", "Acceso adaptado"))
    if rec.get("beach") or size_id == "kiosco_playa":
        icons.append(("beach", "Frente de playa"))
    return icons[:8]


# ---------------------------------------------------------------------------
# 8) IMÁGENES SECUNDARIAS: 2-4 prompts según el FORMATO (size_id) del local.
# ---------------------------------------------------------------------------
_DEFAULT_IMGS = [
    ("Comedor", ["Interior del comedor con mesas puestas y luz natural entrando por el escaparate.",
                 "Sala del restaurante con clientes de espaldas, ambiente cálido y mesas ocupadas a medias."]),
    ("Barra", ["Detalle de la barra o el mostrador, con el género del día expuesto.",
               "Mostrador de pedidos con la carta iluminada al fondo."]),
    ("Plato", ["Plato emblemático de la casa servido en mesa, con luz cenital suave.",
               "Primer plano del plato estrella recién emplatado, sin cubiertos delante."]),
]
_GHOST_IMGS = [
    ("Cocina", ["Zona de producción de la cocina fantasma, varios cocineros trabajando en paralelo.",
                "Cocina industrial compacta con varias partidas trabajando pedidos de delivery a la vez."]),
    ("Delivery", ["Bolsas de reparto selladas y listas junto a la salida, esperando recogida.",
                  "Cajas térmicas de reparto apiladas junto a la puerta de salida de pedidos."]),
    ("Repartidor", ["Repartidor en moto o bicicleta recogiendo un pedido en la ventanilla de salida.",
                    "Repartidor con caja térmica de reparto recibiendo el pedido del cocinero."]),
]
_FOODHALL_IMGS = [
    ("Food hall", ["Vista general del food hall con varios puestos y fogones bajo el mismo techo.",
                   "Panorámica del mercado gastronómico con varios stands activos a la vez."]),
    ("Puesto", ["Uno de los puestos de comida del food hall, con su cocina abierta al público.",
                "Detalle de un stand concreto del food hall, cocinero sirviendo en el mostrador."]),
    ("Mesas", ["Zona de mesas compartidas del food hall, ambiente animado de mediodía.",
               "Mesas altas compartidas entre los distintos puestos del food hall."]),
]
_PLAYA_IMGS = [
    ("Mostrador", ["Mostrador de madera del kiosco de playa, instalado directamente sobre la arena.",
                   "Caseta de madera en la arena con la carta pintada a mano en un cartel."]),
    ("Clientes", ["Cliente en bañador comprando en el mostrador, con sombrillas al fondo.",
                  "Familia con toallas y sombrilla haciendo cola en el kiosco de playa."]),
    ("Vista al mar", ["Vista del mar en calma de fondo, con tumbonas alineadas junto al kiosco.",
                      "Panorámica de la playa con el kiosco en primer término y el mar al fondo."]),
]
_ESTACION_IMGS = [
    ("Mostrador", ["Mostrador rápido dentro del vestíbulo de la estación, con viajeros y maletas alrededor.",
                   "Kiosco de comida rápida junto al andén, cola corta de viajeros con equipaje."]),
    ("Viajeros", ["Panel de horarios de fondo y viajeros esperando con café para llevar.",
                  "Viajeros consultando el móvil junto al mostrador, maletas de ruedas cerca."]),
]
_MALL_IMGS = [
    ("Fachada", ["Fachada del local en la galería interior del centro comercial, suelo pulido y luz artificial.",
                 "Entrada del local en el pasillo del centro comercial, escaparate iluminado."]),
    ("Cola", ["Cola de clientes esperando en el pasillo del centro comercial, hora punta de mediodía.",
              "Pequeña cola ordenada frente al mostrador dentro del centro comercial."]),
    ("Escaparate", ["Escaparate iluminado con el menú y las fotos de los platos más pedidos.",
                    "Vitrina de productos expuestos junto al escaparate del local."]),
]
_DRIVETHRU_IMGS = [
    ("Carril", ["Carril de coche del drive-thru con la ventanilla de recogida al fondo.",
                "Vehículo esperando en el carril de pedido de un drive-thru, señalética visible."]),
    ("Menú digital", ["Cartel de menú digital iluminado junto al carril de pedido.",
                      "Pantalla de pedido con las fotos de los combos más populares."]),
    ("Recogida", ["Coche recogiendo el pedido en la ventanilla, empleado entregando la bolsa.",
                 "Ventanilla de recogida con un coche detenido y el conductor recibiendo su pedido."]),
]
_ROOFTOP_IMGS = [
    ("Terraza", ["Terraza de la última planta con vistas al perfil de la ciudad al atardecer.",
                "Rooftop con mesas junto a la barandilla de cristal, luces cálidas encendidas."]),
    ("Barra exterior", ["Barra exterior del rooftop con botellas iluminadas y coctelera en acción.",
                        "Camarero preparando una copa en la barra exterior del rooftop."]),
    ("Skyline", ["Mesas con vistas al skyline de la ciudad, luz dorada de atardecer.",
                "Panorámica nocturna de la ciudad desde la terraza, mesas ocupadas al fondo."]),
]
_BAR_IMGS = [
    ("Barra", ["Barra con botellas iluminadas en estantería retroiluminada, ambiente de noche.",
              "Detalle de la coctelera en pleno movimiento, luces cálidas de fondo."]),
    ("Coctelera", ["Camarero preparando un cóctel de autor con técnica de coctelería clásica.",
                  "Primer plano de una copa recién servida sobre la barra, hielo y guarnición cuidada."]),
    ("Ambiente", ["Ambiente nocturno del bar con clientes de espaldas y luces bajas.",
                 "Sala del bar a media luz, grupos de amigos alrededor de la barra."]),
]


def secondary_images(city, brand, size_id, rec) -> list:
    bid, name, cuisine, tier, tagline = brand
    r = rng(h32(city["id"], bid, rec.get("text") or city["name"], "secimg"))

    if size_id == "ghost":
        pool = _GHOST_IMGS
    elif size_id == "food_hall":
        pool = _FOODHALL_IMGS
    elif size_id == "kiosco_playa":
        pool = _PLAYA_IMGS
    elif size_id == "kiosco_estacion":
        pool = _ESTACION_IMGS
    elif size_id == "local_mall":
        pool = _MALL_IMGS
    elif size_id == "drive_thru":
        pool = _DRIVETHRU_IMGS
    elif size_id == "rooftop":
        pool = _ROOFTOP_IMGS
    elif tier == "bar":
        pool = _BAR_IMGS
    else:
        pool = _DEFAULT_IMGS

    out = []
    for label, variants in pool:
        out.append((label, _pick(r, variants)))
    return out[:4]
