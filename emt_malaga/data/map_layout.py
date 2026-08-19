# -*- coding: utf-8 -*-
"""Coordenadas esquemáticas alineadas al mapa Netz de CTS 2026 (vista del juego).
Origen: esquina inferior izquierda. Y crece hacia el norte (arriba en pantalla).
Basado en la captura: eje N–S central, bucle NE, diagonal, cocheras SO, corredor E.
"""

# sid -> (x, y) en 0..1
MAP_XY = {
    # --- CENTRO (cuadrados / hubs densos) ---
    "plaza_opera": (0.48, 0.52),
    "ayuntamiento": (0.44, 0.56),
    "ayuntamiento_lado": (0.42, 0.54),
    "ayuntamiento_juzgados": (0.46, 0.50),
    "universidad": (0.54, 0.58),
    "anillo_norte": (0.50, 0.64),
    "plaza_puerto": (0.58, 0.54),
    "arco_este": (0.56, 0.48),
    "teatro_anillo": (0.46, 0.58),
    "plaza_kreisky": (0.48, 0.55),
    "anillo_baben": (0.45, 0.53),
    "calle_strauss": (0.43, 0.49),
    "fuente_blanca": (0.44, 0.51),
    "castillo_tramau": (0.41, 0.47),
    "plaza_matz": (0.40, 0.44),
    "plaza_raab": (0.55, 0.50),
    "plaza_radetzky": (0.60, 0.56),
    "muelle_sal": (0.54, 0.60),
    "plaza_schwarz": (0.52, 0.46),
    "plaza_bauern": (0.47, 0.42),
    "est_central": (0.48, 0.40),
    "est_norte": (0.52, 0.43),
    "calle_doerfel": (0.50, 0.45),

    # --- OESTE / NO (ramales arriba-izquierda) ---
    "colinas_oeste": (0.18, 0.72),
    "sandleiten": (0.28, 0.66),
    "ottakring": (0.24, 0.62),
    "distrito_oeste": (0.30, 0.58),
    "iglesia_memoria": (0.26, 0.54),
    "palacio_deportes": (0.32, 0.52),
    "hospital_general": (0.36, 0.50),
    "plaza_broda": (0.38, 0.52),
    "colonia_marx": (0.22, 0.70),

    # --- NORTE ---
    "plaza_hoech": (0.52, 0.78),
    "plaza_engels": (0.54, 0.88),
    "centro_salud_norte": (0.48, 0.82),
    "calle_czar": (0.46, 0.76),
    "calle_albrecht": (0.44, 0.70),
    "calle_gatter": (0.40, 0.66),
    "calle_bara": (0.34, 0.64),
    "calle_gunold": (0.30, 0.60),

    # --- SUR / EJE CENTRAL ---
    "plaza_fadinger": (0.42, 0.28),
    "plaza_concordia": (0.54, 0.26),
    "plaza_gellert": (0.56, 0.30),
    "calle_braun": (0.54, 0.34),
    "plaza_enk": (0.52, 0.36),
    "cinturon_obrero": (0.50, 0.38),
    "deposito_favoriten": (0.58, 0.32),
    "calle_laxen": (0.48, 0.34),
    "calle_rax": (0.46, 0.22),
    "meidling": (0.36, 0.30),
    "nussdorfer": (0.38, 0.34),
    "niederhof": (0.34, 0.36),
    "calle_tabor": (0.38, 0.40),
    "museo_barrio": (0.40, 0.38),

    # --- ESTE (marrón/verde/amarillo derecha) ---
    "alameda_prater": (0.72, 0.62),
    "avenida_marek": (0.70, 0.58),
    "plaza_columbus": (0.66, 0.54),
    "kaiserebersdorf": (0.78, 0.34),
    "calle_svetel": (0.74, 0.40),
    "matadero": (0.70, 0.38),
    "plaza_koessler": (0.74, 0.42),
    "calle_natterer": (0.78, 0.46),
    "muelle_comercio": (0.82, 0.48),
    "estadio": (0.86, 0.50),
    "cementerio_1": (0.88, 0.58),
    "cementerio_2": (0.84, 0.56),
    "calle_mona": (0.80, 0.52),
    "lindenbauer": (0.82, 0.44),
    "florian_hed": (0.80, 0.38),
    "pohlgasse": (0.64, 0.48),

    # --- BARRIOS BUS ---
    "calle_popper": (0.46, 0.36),
    "calle_huetten": (0.50, 0.32),
    "plaza_kress": (0.54, 0.28),
    "calle_karmarsch": (0.60, 0.24),
    "plaza_kepler": (0.58, 0.22),
    "calle_muehl": (0.56, 0.24),
    "pressgasse": (0.36, 0.38),
    "wolfgang_matz": (0.38, 0.36),
    "wolfgang_stein": (0.40, 0.34),
    "reinprecht": (0.40, 0.32),
    "spenger": (0.44, 0.30),
    "escuela_mandl": (0.42, 0.36),

    # --- COCHERAS / LABERINTO SO (gris abajo-izquierda en el mapa) ---
    "torres_sur": (0.28, 0.12),
    "mirador_levante": (0.32, 0.14),
    "paseo_calima": (0.30, 0.16),
    "plaza_biznaga": (0.34, 0.18),
    "avenida_boqueron": (0.36, 0.16),
    "jardines_malagueta": (0.38, 0.14),
    "polideportivo_sur": (0.40, 0.16),
    "deposito_sur_bus": (0.34, 0.20),
}

DISTRICTS = {
    "Centro": {"color": "#003D6B", "box": (0.40, 0.40, 0.62, 0.66)},
    "Norte": {"color": "#1B6CA8", "box": (0.40, 0.66, 0.60, 0.92)},
    "Oeste": {"color": "#2E8B57", "box": (0.14, 0.48, 0.40, 0.78)},
    "Sur": {"color": "#C8102E", "box": (0.34, 0.20, 0.62, 0.42)},
    "Este": {"color": "#BC6C25", "box": (0.62, 0.30, 0.92, 0.66)},
    "Extensión Sur": {"color": "#5C6670", "box": (0.22, 0.08, 0.44, 0.22)},
}

# Validación jugabilidad vs topología del mapa Netz (captura CTS)
# ok = alineado a corredores visibles; revisar = posible pero comprobar vías; bus_ok = solo bus
VALIDATION_NOTES = {
    "tram_spine_ns": "Eje verde N–S del mapa: usar para T1/TC/tramos centrales.",
    "tram_loop_ne": "Bucle púrpura NE: T2/T10/alameda/parque.",
    "tram_diagonal": "Diagonal cian: TD / T9 semi-rápida.",
    "tram_west": "Ramales azul/naranja NO: T3/T4/T8/T2 oeste.",
    "tram_east": "Corredor marrón/verde E: T5/T6/estadio.",
    "bus_sw_labyrinth": "Laberinto gris SO = cocheras + Torres del Sur: SOLO bus (11/12/17/A*).",
    "square_hubs": "Iconos cuadrados = hubs de trasbordo prioritarios.",
}
