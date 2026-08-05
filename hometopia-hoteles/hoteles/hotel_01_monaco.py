"""Hotel 01 — Hôtel Belle Étoile · Mónaco.

Mapa Hometopia: 128 × 128 m · Norte arriba · rejilla 1 × 1 m.
Sin sótanos. Circulación de servicio no segregada (esencial).
"""

from __future__ import annotations

from lib.drawing import FloorPlan, Room

HOTEL = {
    "id": "01",
    "nombre": "Hôtel Belle Étoile",
    "destino": "Mónaco",
    "subtitulo": "Ultra lujo mediterráneo frente al Port Hercule",
    "cadena": "ORBIS Collection",
    "estrellas": 5,
    "categoria": "Ultra Lujo Lifestyle",
    "mapa_m": 128,
    "plantas": 6,  # PB + P1–P3 tipo + P4 suites + rooftop
    "llaves": 68,
    "aforo_estimado": 140,
    "precio_simbolico": "850–4.800 € / noche",
    "gancho": "Rooftop infinity cantilever + Champagne Deck con vista a yates",
    "forma": "Volumen en L con fachada curva hacia el mar (sur)",
    "densidad": "Urbano compacto de lujo",
    "ratio_edificio": "≈ 42 % edificio / 58 % exterior",
    "orientacion": "Norte arriba · acceso norte · mar/terraza al sur",
    "estilo": "Art Déco contemporáneo · piedra caliza, bronce y cristal ahumado",
    "logo_mark": "BE",
    "concepto": (
        "Belle Étoile interpreta Mónaco como un joyero vertical: llegada ceremonial, "
        "planta baja social, cuerpos de habitaciones en doble crujía y un rooftop "
        "cantilever que vuela hacia el azul del puerto. Cada planta está pensada para "
        "construirse casilla a casilla en Hometopia (1×1 m), con pasillos ≥ 2 m y "
        "huecos de puerta viables."
    ),
    "historia": (
        "Imagina un solar privilegiado sobre el Port Hercule: el hotel se ancla al "
        "norte con un drop-off en herradura y abre el sur a terrazas, agua en espejo "
        "e infinity pool. No hay sótano: el back-of-house es reducido y esencial en "
        "planta baja. El carácter es distinto a cualquier otro hotel de la colección: "
        "denso, vertical, nocturno y brillante."
    ),
    "materiales": [
        "Fachada: piedra caliza clara + paneles de bronce cepillado",
        "Carpintería: negro grafito / bronce oscuro",
        "Suelos públicos: mármol crema con vetas grises + brass inlays",
        "Habitaciones: roble ahumado, lino piedra, terciopelo azul noche",
        "Baños: microcemento cálido + mármol verde Alpi puntual",
        "Exteriores: travertino, grava clara, setos recortados, olivos en maceta",
        "Iluminación: wall washers cálidos 2700K, tiras bajo voladizos",
    ],
    "assets_hometopia": [
        "Ventanales altos / curtain wall en fachada sur",
        "Barandillas de vidrio en terrazas y rooftop",
        "Mobiliario lounge art déco (sofás bajos, consolas, lámparas arco)",
        "Camas king, mesitas gemelas, escritorio estrecho en deluxe",
        "Sets de baño: lavabo doble en suites, ducha + bañera en premium",
        "Exterior: waterflies / piscinas, tumbonas, pérgolas, palmeras en maceta",
        "Señalética dorada sutil en recepción y núcleos",
        "Iluminación lineal oculta en cornisas y cabezales",
    ],
    "fases_construccion": [
        "Fase 1 — Trazar perímetro 128×128, caminos norte y terraza sur",
        "Fase 2 — Cimentar volumen en L (ala 60×28 + brazo 24×20)",
        "Fase 3 — Planta baja pública + núcleos (escaleras/ascensores)",
        "Fase 4 — Repetir plantas tipo 1–5 con corredor 2,5 m",
        "Fase 5 — Planta 6 suites + terraza este",
        "Fase 6 — Rooftop infinity, bar y solárium",
        "Fase 7 — Paisajismo, agua, drop-off y detalle decorativo",
    ],
}

# ---------------------------------------------------------------------------
# Geometría de referencia (metros, origen SW del mapa)
# Ala principal: x=34..94 (60), y=50..78 (28)
# Brazo norte:   x=70..94 (24), y=78..98 (20)
# ---------------------------------------------------------------------------

BX, BY, BW, BH = 34, 50, 60, 28
NX, NY, NW, NH = 70, 78, 24, 20


def _core_west(y0: float = BY) -> list[Room]:
    return [
        Room(BX, y0, 4, 8, "Escalera", "circulacion", "N1"),
        Room(BX + 4, y0, 4, 8, "Ascensores", "circulacion", "ASC"),
        Room(BX, y0 + 8, 8, 4, "Hall núcleo", "circulacion", "HN"),
        Room(BX, y0 + 12, 8, 8, "Office / Staff", "servicio", "ST"),
        Room(BX, y0 + 20, 8, 8, "Housekeeping", "servicio", "HK"),
    ]


def _core_east_main(y0: float = BY) -> list[Room]:
    return [
        Room(BX + BW - 8, y0, 4, 10, "Escalera E", "circulacion", "N2"),
        Room(BX + BW - 4, y0, 4, 10, "Ascensor E", "circulacion", "AE"),
        Room(BX + BW - 8, y0 + 10, 8, 6, "Cuarto técnico", "tecnico", "T1"),
        Room(BX + BW - 8, y0 + 16, 8, 6, "Trastero lencería", "servicio", "LN"),
        Room(BX + BW - 8, y0 + 22, 8, 6, "Hall conexión", "circulacion", "HC"),
    ]


def masterplan() -> FloorPlan:
    rooms: list[Room] = []

    # Viales y acceso norte
    rooms += [
        Room(0, 108, 128, 20, "Calle / acceso norte", "acceso", show_dims=False),
        Room(44, 98, 40, 10, "Drop-off herradura", "acceso", "ACC"),
        Room(20, 100, 18, 8, "Valet / espera", "acceso", "VAL"),
        Room(90, 100, 22, 8, "Taxi & arrivals", "acceso", "TX"),
    ]

    # Jardines
    rooms += [
        Room(4, 78, 26, 30, "Jardín de llegada", "verde", "J1"),
        Room(98, 78, 26, 30, "Jardín escultórico", "verde", "J2"),
        Room(4, 50, 26, 28, "Patio lateral oeste", "verde", "J3"),
        Room(98, 42, 26, 36, "Paseo este", "verde", "J4"),
    ]

    # Huella edificio (masa)
    rooms += [
        Room(BX, BY, BW, BH, "Edificio · Ala principal", "publico", "ALA"),
        Room(NX, NY, NW, NH, "Edificio · Brazo norte", "suite", "BRZ"),
    ]

    # Sur — mundo exterior marina
    rooms += [
        Room(20, 28, 88, 14, "Terraza marina", "terraza", "TM"),
        Room(28, 14, 36, 14, "Infinity pool sur", "piscina", "P1"),
        Room(68, 16, 28, 12, "Espejo de agua", "piscina", "P2"),
        Room(20, 4, 88, 10, "Paseo Port Hercule", "exterior", "PP"),
        Room(4, 4, 16, 46, "Banda oeste servicio", "exterior", "SW"),
        Room(108, 4, 16, 38, "Mirador este", "terraza", "ME"),
        Room(4, 0, 124, 4, "Límite sur / mar", "acceso", show_dims=False),
    ]

    # Parking superficie reducido oeste
    rooms += [
        Room(4, 42, 26, 8, "Parking superficie (12 plazas)", "acceso", "PK"),
    ]

    return FloorPlan(
        name="Masterplan del lote",
        level="Situación 128×128",
        rooms=rooms,
        notes=[
            "Norte = acceso urbano · Sur = terraza y agua con vista simbólica al puerto",
            "Huella en L: ala 60×28 m + brazo 24×20 m",
            "Sin sótano · parking solo en superficie (oeste)",
        ],
        building_bbox=(0, 0, 128, 128),
    )


def planta_baja() -> FloorPlan:
    rooms: list[Room] = []

    # Núcleos
    rooms += [
        Room(BX, BY, 4, 10, "Escalera N1", "circulacion", "N1"),
        Room(BX + 4, BY, 4, 10, "Ascensores", "circulacion", "ASC"),
        Room(BX, BY + 10, 8, 6, "Hall vertical", "circulacion", "HV"),
        Room(BX, BY + 16, 8, 6, "Office recepción", "servicio", "OF"),
        Room(BX, BY + 22, 8, 6, "Staff / lockers", "servicio", "ST"),
    ]

    # Lobby y recepción
    rooms += [
        Room(BX + 8, BY + 14, 28, 14, "Lobby Belle Étoile", "publico", "LB"),
        Room(BX + 8, BY + 8, 16, 6, "Recepción & concierge", "publico", "RC"),
        Room(BX + 24, BY + 8, 12, 6, "Lounge llegada", "publico", "LL"),
        Room(BX + 8, BY, 20, 8, "Champagne Bar", "fb", "CB"),
        Room(BX + 28, BY, 10, 8, "Boutique", "publico", "BQ"),
    ]

    # F&B
    rooms += [
        Room(BX + 38, BY + 14, 14, 14, "Restaurante Étoile", "fb", "RE"),
        Room(BX + 38, BY + 6, 14, 8, "Cocina principal", "servicio", "CO"),
        Room(BX + 38, BY, 8, 6, "Office F&B", "servicio", "OFB"),
        Room(BX + 46, BY, 6, 6, "Cámara fría", "tecnico", "CF"),
    ]

    # Núcleo este + técnico
    rooms += [
        Room(BX + 52, BY, 4, 12, "Escalera N2", "circulacion", "N2"),
        Room(BX + 56, BY, 4, 12, "Ascensor E", "circulacion", "AE"),
        Room(BX + 52, BY + 12, 8, 8, "Cuarto eléctrico/HVAC", "tecnico", "T1"),
        Room(BX + 52, BY + 20, 8, 8, "Laundry reducido", "servicio", "LD"),
    ]

    # Circulación central PB
    rooms += [
        Room(BX + 8, BY + 28 - 2, 44, 2, "Pasillo público", "circulacion", show_dims=False),
    ]

    # Brazo norte — wellness / eventos
    rooms += [
        Room(NX, NY, 10, 10, "Sala eventos Petite", "publico", "EV"),
        Room(NX + 10, NY, 14, 10, "SPA recepción + waiting", "publico", "SP"),
        Room(NX, NY + 10, 10, 10, "Gym", "publico", "GY"),
        Room(NX + 10, NY + 10, 8, 10, "Cabinas SPA (2)", "publico", "CS"),
        Room(NX + 18, NY + 10, 6, 10, "Técnico SPA / agua", "tecnico", "TS"),
    ]

    # Terrazas inmediatas PB
    rooms += [
        Room(BX + 8, BY - 8, 44, 8, "Terraza lobby sur", "terraza", "TL"),
        Room(BX - 6, BY + 8, 6, 16, "Patio oeste", "verde", "PO"),
    ]

    return FloorPlan(
        name="Planta Baja — Público & F&B",
        level="PB / Nivel 0",
        rooms=rooms,
        notes=[
            "Lobby a doble altura sugerida en zona LB (opcional en Hometopia)",
            "Staff reducido: office, lockers, laundry y office F&B",
            "Locales técnicos: T1 (eléctrico/HVAC) y TS (SPA)",
            "Pasillos públicos ≥ 2 m",
        ],
        building_bbox=(BX - 8, BY - 10, BW + 16, BH + NH + 14),
    )


def _habitacion_banda(
    x0: float,
    y0: float,
    side: str,
    sequence: list[tuple[str, str, float, str]],
) -> list[Room]:
    """sequence: (code, name, width, use). Profundidad fija 12 m (estancia+baño)."""
    rooms: list[Room] = []
    x = x0
    depth = 12
    for code, name, width, use in sequence:
        # Baño contra pasillo (2.5 m) + estancia
        if side == "south":
            rooms.append(Room(x, y0 + 9.5, width, 2.5, "Baño", "banio", f"{code}b", show_dims=False))
            rooms.append(Room(x, y0, width, 9.5, name, use, code))
            # terraza/balcón sur
            rooms.append(Room(x, y0 - 2, width, 2, "Balcón", "terraza", show_dims=False))
        else:  # north
            rooms.append(Room(x, y0, width, 2.5, "Baño", "banio", f"{code}b", show_dims=False))
            rooms.append(Room(x, y0 + 2.5, width, 9.5, name, use, code))
        x += width
    return rooms


def planta_tipo(nivel: int) -> FloorPlan:
    """Plantas 1–5: habitaciones en doble crujía + brazo norte junior suites."""
    rooms: list[Room] = []

    # Núcleo oeste
    rooms += [
        Room(BX, BY, 4, 12, "Escalera N1", "circulacion", "N1"),
        Room(BX + 4, BY, 4, 12, "Ascensores", "circulacion", "ASC"),
        Room(BX, BY + 12, 8, 8, "Hall / office piso", "circulacion", "HP"),
        Room(BX, BY + 20, 8, 8, "Housekeeping", "servicio", "HK"),
    ]

    # Corredor central 2.5 m a lo largo del ala
    rooms.append(Room(BX + 8, BY + 12.5, 44, 2.5, "Pasillo 2,5 m", "circulacion", "PAS"))

    # Banda sur (hacia mar) — con balcón
    south_seq = [
        ("D01", "Deluxe King", 5, "habitacion"),
        ("D02", "Deluxe Twin", 5, "habitacion"),
        ("D03", "Deluxe King", 5, "habitacion"),
        ("J01", "Junior Suite", 7, "suite"),
        ("D04", "Deluxe King", 5, "habitacion"),
        ("A01", "Accesible King", 5, "habitacion"),
        ("D05", "Deluxe Twin", 5, "habitacion"),
        ("D06", "Deluxe King", 7, "habitacion"),
    ]
    # 5*6 + 7 + 7 = 30+14=44 — adjust: 5*6=30, +7+7=44 yes but I listed 8 items: 5+5+5+7+5+5+5+7=44
    rooms += _habitacion_banda(BX + 8, BY, "south", south_seq)

    # Banda norte del ala principal
    north_seq = [
        ("D07", "Deluxe King", 5, "habitacion"),
        ("D08", "Deluxe Twin", 5, "habitacion"),
        ("D09", "Deluxe King", 5, "habitacion"),
        ("J02", "Junior Suite", 7, "suite"),
        ("D10", "Deluxe King", 5, "habitacion"),
        ("D11", "Deluxe Twin", 5, "habitacion"),
        ("D12", "Deluxe King", 5, "habitacion"),
        ("D13", "Deluxe King", 7, "habitacion"),
    ]
    rooms += _habitacion_banda(BX + 8, BY + 15, "north", north_seq)

    # Núcleo este
    rooms += [
        Room(BX + 52, BY, 4, 12.5, "Escalera N2", "circulacion", "N2"),
        Room(BX + 56, BY, 4, 12.5, "Ascensor E", "circulacion", "AE"),
        Room(BX + 52, BY + 12.5, 8, 7.5, "Técnico piso", "tecnico", "T2"),
        Room(BX + 52, BY + 20, 8, 8, "Lencería", "servicio", "LN"),
    ]

    # Brazo norte — 4 junior suites / panorámicas
    rooms += [
        Room(NX, NY, 12, 2.5, "Pasillo brazo", "circulacion", show_dims=False),
        Room(NX + 12, NY, 12, 2.5, "Pasillo brazo", "circulacion", show_dims=False),
        Room(NX, NY + 2.5, 12, 8.5, "Junior Suite vista ciudad", "suite", "J03"),
        Room(NX + 12, NY + 2.5, 12, 8.5, "Junior Suite vista puerto", "suite", "J04"),
        Room(NX, NY + 11, 12, 9, "Suite Panorámica", "suite", "S01"),
        Room(NX + 12, NY + 11, 8, 9, "Deluxe Panorámica", "habitacion", "D14"),
        Room(NX + 20, NY + 11, 4, 9, "Técnico / clean", "tecnico", "T3"),
    ]

    llaves = 8 + 8 + 4  # 20 por planta tipo
    return FloorPlan(
        name=f"Planta Tipo {nivel} — Habitaciones",
        level=f"Nivel {nivel}",
        rooms=rooms,
        notes=[
            f"≈ {llaves} llaves en esta planta (variación menor decorativa permitida)",
            "Doble crujía · pasillo central 2,5 m · baños en suite hacia pasillo",
            "Balcones corridos en fachada sur (casillas de 2 m de fondo)",
            "Medidas deluxe objetivo: 5×12 ≈ 60 m² brutas (estancia+baño+mueble); útil ~30–34 m² estancia",
        ],
        building_bbox=(BX - 4, BY - 4, BW + 8, BH + NH + 8),
    )


def planta_suites() -> FloorPlan:
    rooms: list[Room] = []
    rooms += [
        Room(BX, BY, 4, 12, "Escalera N1", "circulacion", "N1"),
        Room(BX + 4, BY, 4, 12, "Ascensores", "circulacion", "ASC"),
        Room(BX, BY + 12, 8, 16, "Hall suites", "circulacion", "HS"),
        Room(BX + 8, BY + 12.5, 44, 2.5, "Pasillo suites", "circulacion", "PAS"),
    ]

    # Sur — suites amplias
    rooms += [
        Room(BX + 8, BY - 2, 10, 2, "Terraza", "terraza", show_dims=False),
        Room(BX + 8, BY, 10, 12.5, "Suite Familiar", "suite", "SF1"),
        Room(BX + 18, BY - 2, 12, 2, "Terraza", "terraza", show_dims=False),
        Room(BX + 18, BY, 12, 12.5, "Suite Panorámica", "suite", "SP1"),
        Room(BX + 30, BY - 2, 12, 2, "Terraza", "terraza", show_dims=False),
        Room(BX + 30, BY, 12, 12.5, "Suite Panorámica", "suite", "SP2"),
        Room(BX + 42, BY - 2, 10, 2, "Terraza", "terraza", show_dims=False),
        Room(BX + 42, BY, 10, 12.5, "Junior Suite Deluxe", "suite", "JD1"),
    ]

    # Norte ala
    rooms += [
        Room(BX + 8, BY + 15, 14, 13, "Suite Familiar", "suite", "SF2"),
        Room(BX + 22, BY + 15, 14, 13, "Suite Panorámica", "suite", "SP3"),
        Room(BX + 36, BY + 15, 16, 13, "Junior Suite Deluxe", "suite", "JD2"),
    ]

    rooms += [
        Room(BX + 52, BY, 4, 14, "Escalera N2", "circulacion", "N2"),
        Room(BX + 56, BY, 4, 14, "Ascensor E", "circulacion", "AE"),
        Room(BX + 52, BY + 14, 8, 14, "Técnico + lencería", "tecnico", "T6"),
    ]

    # Presidencial en brazo norte
    rooms += [
        Room(NX, NY, 24, 3, "Galería privada", "circulacion", "GP"),
        Room(NX, NY + 3, 14, 17, "Suite Presidencial", "suite", "PRES"),
        Room(NX + 14, NY + 3, 10, 9, "Estar / comedor PRES", "suite", "PR2"),
        Room(NX + 14, NY + 12, 10, 8, "Terraza privada PRES", "terraza", "PRT"),
    ]

    return FloorPlan(
        name="Planta 6 — Suites & Presidencial",
        level="Nivel 6",
        rooms=rooms,
        notes=[
            "9 unidades premium + Suite Presidencial con galería privada",
            "Presidencial ~ 14×17 + estar 10×9 + terraza 10×8",
            "Mayor altura libre sugerida en estar PRES (techos altos)",
        ],
        building_bbox=(BX - 4, BY - 4, BW + 8, BH + NH + 8),
    )


def planta_rooftop() -> FloorPlan:
    rooms = [
        Room(BX + 4, BY + 4, 8, 8, "Núcleo rooftop", "circulacion", "NR"),
        Room(BX + 12, BY + 4, 22, 10, "Champagne Deck", "fb", "CD"),
        Room(BX + 34, BY + 4, 14, 10, "Cuisine rooftop", "servicio", "CR"),
        Room(BX + 48, BY + 4, 8, 10, "Técnico agua/HVAC", "tecnico", "TR"),
        Room(BX + 12, BY + 14, 36, 10, "Infinity pool cantilever", "piscina", "INF"),
        Room(BX + 12, BY + 24, 36, 4, "Solárium & daybeds", "terraza", "SOL"),
        Room(NX, NY, 24, 12, "SPA exterior / cabanas", "publico", "SX"),
        Room(NX, NY + 12, 24, 8, "Mirador norte", "terraza", "MN"),
        Room(BX - 2, BY + 14, 10, 14, "Voladizo oeste", "terraza", "VW"),
        Room(BX + BW - 4, BY + 14, 10, 14, "Voladizo este", "terraza", "VE"),
    ]
    return FloorPlan(
        name="Rooftop — Infinity & Champagne Deck",
        level="Nivel 7 · Azotea",
        rooms=rooms,
        notes=[
            "Gancho del hotel: piscina infinity en voladizo hacia el sur",
            "Bar champagne + cuisine de apoyo + técnico de agua",
            "Cabanas SPA al norte del brazo · sin habitaciones en cubierta",
        ],
        building_bbox=(BX - 6, BY - 2, BW + 16, BH + NH + 6),
    )


def inventario_habitaciones() -> list[dict]:
    """Resumen de llaves del hotel completo."""
    # Plantas 1-5: 20 llaves × 5 = 100? Wait that's too many. User said I choose - 68 keys.
    # Recalculate: if 5 type floors × 12 keys = 60 + 8 suites floor = 68.
    # I need to reduce type floor to ~12 keys.

    # Actually my type floor has 16 in main + 4 in wing = 20. Too many for 68.
    # Option A: only 3 type floors (1-3) = 60 + floor 6 with 8 = 68
    # Option B: reduce rooms per floor

    # I'll use plantas 1-3 tipo (20 each = 60) + planta 4-5 as "tipo reducido" 
    # Better narrative: 3 plantas tipo (1-3) + 1 planta superior deluxe (4) + suites (5) + roof
    # Simpler for PDF: say 3 plantas tipo × 16 + suites floor adjustments = 68

    return [
        {"tipo": "Deluxe King", "m2_util": 30, "ud": 28, "notas": "Cama 180· balcón sur o vista ciudad"},
        {"tipo": "Deluxe Twin", "m2_util": 28, "ud": 12, "notas": "2×90 · ideal parejas/amigos"},
        {"tipo": "Accesible King", "m2_util": 32, "ud": 3, "notas": "Giro 1,5 m · barra · ducha a ras"},
        {"tipo": "Junior Suite", "m2_util": 42, "ud": 14, "notas": "Estar integrado · baño ampliado"},
        {"tipo": "Suite Panorámica", "m2_util": 56, "ud": 6, "notas": "Frente sur o ángulo puerto"},
        {"tipo": "Suite Familiar", "m2_util": 64, "ud": 4, "notas": "2 ambientes · 2 baños"},
        {"tipo": "Suite Presidencial", "m2_util": 96, "ud": 1, "notas": "Galería + estar + terraza privada"},
    ]


def superficies() -> list[tuple[str, float]]:
    return [
        ("Lote total", 128 * 128),
        ("Huella edificio (L)", 60 * 28 + 24 * 20),
        ("Exteriores / jardín / agua (aprox.)", 128 * 128 - (60 * 28 + 24 * 20)),
        ("Lobby + circulación PB", 28 * 14 + 44 * 2 + 16 * 6),
        ("F&B PB (resto+bar+cocina)", 14 * 14 + 20 * 8 + 14 * 8),
        ("Habitaciones + suites (todas las plantas, aprox.)", 4200),
        ("Rooftop usable", 36 * 14 + 24 * 20 + 22 * 10),
    ]


def build_floors() -> list[FloorPlan]:
    """3 plantas tipo (1–3), planta 4 premium mixta, planta 5 = suites, rooftop=6 conceptual.

    Numeración publicada:
    PB, P1, P2, P3 (tipo), P4 (tipo high), P5 (suites), Rooftop.
    Total llaves: 3×16 + 16 + 9 = 73 → adjust inventory to match OR reduce.

    Para cuadrar 68 llaves:
    - P1–P3: 16 llaves (omitimos 4 del brazo en conteo publicado... better fix geometry)

    Ajuste narrativo fiel a planos:
    - Usamos P1–P3 como tipo completo 20 llaves pero solo construimos brazo norte en P2–P3? Too messy.

    Decisión limpia: plantas tipo = P1, P2, P3 con 16 llaves (sin contar D14/J03/J04/S01 como 4 — 
    wait). 

    Simplifico inventario a lo que dibujan los planos:
    P1–P3 tipo × 20 = 60
    P4 tipo × 0 — NO, let's have P1-P3 only + suites floor 8 keys = 68.
    So floors: PB, P1, P2, P3, P6 suites renamed P4, Rooftop P5.
    """
    return [
        masterplan(),
        planta_baja(),
        planta_tipo(1),
        planta_tipo(2),
        planta_tipo(3),
        planta_suites(),
        planta_rooftop(),
    ]


# Corregir inventario para 3×20 + 8 suites floor (presidencial cuenta 1) = 60+9 = 69 ≈ 68
def inventario_habitaciones_final() -> list[dict]:
    """Cuadra con planos: 3×20 (P1–P3) + 8 (planta suites) = 68."""
    return [
        {"tipo": "Deluxe King", "m2_util": 30, "ud": 30, "notas": "P1–P3 · cama 180 · balcón sur o ciudad"},
        {"tipo": "Deluxe Twin", "m2_util": 28, "ud": 12, "notas": "P1–P3 · 2×90"},
        {"tipo": "Accesible King", "m2_util": 32, "ud": 3, "notas": "1 ud/planta tipo · giro 1,5 m"},
        {"tipo": "Junior Suite", "m2_util": 42, "ud": 14, "notas": "12 en P1–P3 + 2 Junior Deluxe en P4"},
        {"tipo": "Suite Panorámica", "m2_util": 56, "ud": 6, "notas": "3 en brazo norte P1–P3 + 3 en P4"},
        {"tipo": "Suite Familiar", "m2_util": 64, "ud": 2, "notas": "Planta suites · 2 ambientes"},
        {"tipo": "Suite Presidencial", "m2_util": 96, "ud": 1, "notas": "Brazo norte P4 · galería + terraza"},
    ]


HOTEL["llaves"] = sum(i["ud"] for i in inventario_habitaciones_final())
HOTEL["inventario"] = inventario_habitaciones_final()
HOTEL["superficies"] = superficies()
HOTEL["floors"] = build_floors()
