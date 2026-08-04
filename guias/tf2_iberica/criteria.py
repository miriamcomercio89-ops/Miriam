# -*- coding: utf-8 -*-
"""Pliego de criterios bloqueados — Red Ibérica 1850–2050."""

TITLE = "Red Ibérica 1850–2050"
SUBTITLE = "Guía mes a mes · Transport Fever 2 · España y entornos"
DIFFICULTY = "Media"
ECONOMY = "Real (préstamos sin límite si hace falta)"
GAME_VERSION = "Última versión, sin DLC"
UI_LANG = "Español"
TRACK_GAUGE = "Vía común del juego (sin anchos mixtos)"
INDUSTRY_MOD = "Akalipsia-Mod 25 (Steam Workshop id 3539897274)"
INDUSTRY_NAMES = "Solo español"
STRICT = True
PAUSE_EACH_MONTH = True
DEMOLISH_OK = True
OWN_ROAD_NETWORK = True
BUILD_INDUSTRIES_MANUAL = True
BUY_LOCKED_INDUSTRIES_FROM_START = True
MAIL = True
AI_COMPANIES = False  # monopolio
STATION_NAMES = "Modernos"

# Hubs
MAIN_HUB = "Madrid"
SUB_HUBS = ["Barcelona", "Lisboa", "Sevilla", "Bilbao", "Valencia", "Oporto", "Zaragoza"]

# Frecuencias objetivo
FREQ = {
    "bus_urbano": "cada 6–8 min",
    "tranvia": "cada 8–10 min",
    "metro": "cada 4–6 min",
    "cercanias": "cada 20–30 min",
    "regional": "cada 45–60 min",
    "largo_recorrido": "cada 2–3 h",
    "ave": "cada 60–90 min",
    "ferry": "2–4 salidas/día",
    "avion_hub": "6–12 vuelos/día por ruta",
    "camion_local": "lanzadera continua / idle bajo",
}

OCCUPANCY_EXPAND = 0.75  # ampliar al 75 %

# Andenes por época (nº andenes sugerido, longitud m)
PLATFORM_ERA = [
    (1850, 2, 100),
    (1870, 3, 140),
    (1890, 4, 180),
    (1910, 5, 220),
    (1940, 6, 260),
    (1970, 8, 300),
    (1992, 8, 400),  # AVE
    (2010, 10, 400),
]

# Electrificación
ELECTRIFY_PILOT = 1925  # Norte / cercanías Madrid
ELECTRIFY_MAJOR = 1955
ELECTRIFY_DEFAULT = 1985
AVE_START = 1992

# Señalización
SIGNALS_MECH_MOD = "Spanish Mechanical Signals (MZA, NORTE and RENFE)"
SIGNALS_LIGHT_MOD = "Spanish Light Signals (MZA, NORTE, RENFE and ADIF)"
TRACKS_MOD = "Spanish tracks and catenary (MZA, NORTE, RENFE y ADIF)"
TRACKS_EXT_MOD = "Spanish Tracks and Catenaries (MZA, NORTE, RENFE and ADIF). EXTENDED"

# Metro / tranvía
METRO_CITIES = {
    "Madrid": 1919,
    "Barcelona": 1924,
    "Lisboa": 1959,
    "Valencia": 1988,
    "Bilbao": 1995,
    "Sevilla": 2009,
    "Málaga": 2014,
    "Palma de Mallorca": 2007,
}
TRAM_CITIES = {
    "Madrid": 1871,
    "Barcelona": 1872,
    "Valencia": 1876,
    "Bilbao": 1876,
    "Lisboa": 1873,
    "Sevilla": 1887,
    "Zaragoza": 1885,
    "Málaga": 1891,
    "Granada": 1904,
    "Tenerife": None,  # no en lista
}

# Expansión geográfica (fases)
EXPANSION_PHASES = [
    "Castilla y hub Madrid",
    "Corredor MZA (este/sureste)",
    "Corredor Norte (Meseta–Cantábrico)",
    "Andalucía",
    "Arco Mediterráneo",
    "Galicia y Atlántico",
    "Portugal",
    "Pirineos / Francia",
    "Baleares (ferry + aire)",
    "Magreb (Argelia)",
    "Alta velocidad y metros",
    "Red completa 2050",
]

# Reinversión
REINVEST_NEW = 0.55
REINVEST_FLEET = 0.25
REINVEST_MAINT = 0.20

# Colores PDF
COLORS = {
    "granate": "#7A1F2B",
    "granate_dark": "#4E1219",
    "slate": "#2F3A42",
    "slate_mid": "#5A6770",
    "cream": "#F4EFE6",
    "paper": "#FAF7F2",
    "brass": "#B08D57",
    "ink": "#1C1C1C",
    "muted": "#6B737A",
    "line_rail": "#7A1F2B",
    "line_bus": "#2F6F4E",
    "line_tram": "#8B5A2B",
    "line_metro": "#1F4E79",
    "line_ship": "#1A6B7A",
    "line_air": "#5C4D7A",
    "line_truck": "#6B5B3A",
    "warn": "#8C2F39",
    "ok": "#2F6F4E",
    "card": "#FFFFFF",
    "row": "#EFE8DC",
}

MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
