# -*- coding: utf-8 -*-
"""Layout desde coordenadas de stops (alineado a mapas Netz/Tram/Bus)."""

from .stops import STOPS

MAP_XY = {sid: st["xy"] for sid, st in STOPS.items() if "xy" in st}

DISTRICTS = {
    "Centro": {"color": "#003D6B", "box": (0.38, 0.42, 0.58, 0.72)},
    "Norte": {"color": "#1B6CA8", "box": (0.32, 0.72, 0.78, 0.96)},
    "Oeste": {"color": "#2E8B57", "box": (0.08, 0.48, 0.34, 0.72)},
    "Sur": {"color": "#C8102E", "box": (0.38, 0.08, 0.64, 0.42)},
    "Este": {"color": "#BC6C25", "box": (0.58, 0.28, 0.86, 0.72)},
    "Extensión Sur": {"color": "#5C6670", "box": (0.26, 0.08, 0.46, 0.20)},
}

VALIDATION_NOTES = {
    "tram_layer": "Capa Tram: ejes Schneider–Lichterallee, Schmiedegasse, Weidensee, Depot Süd, Nakamura.",
    "bus_layer": "Capa Bus: Industriestraße, Busbahnhof, Roßmarkt, Pinakothek, Falkenberg.",
    "square_hubs": "Iconos cuadrados = hubs (Hauptbahnhof, Busbahnhof, Universität, Rathaus…).",
    "dlc_sw": "Extensión SO / cocheras = solo bus (11/12/17/A*).",
}
