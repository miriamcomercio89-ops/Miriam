"""Puntos de interés reales en todo el mundo (no solo España), para sustituir las
aproximaciones por población por presencia real de mercado/mall, estadio, universidad,
polígono industrial, estación de tren y línea de costa.

Fuentes:
  - GeoNames `allCountries.txt` (gaceteero mundial, gratuito): S.MALL, S.STDM, S.UNIV,
    L.INDS, S.RSTN/S.RSTP.
  - Natural Earth `ne_10m_coastline` (línea de costa mundial, gratuita) para el flag de
    playa/frente de mar real en cualquier país (el extracto de calles OSM mundial no
    trae polígonos de playa con nombre, así que se aproxima con distancia a la costa).
"""
from __future__ import annotations

import math
import pickle
from collections import defaultdict
from pathlib import Path

OSM = Path("/tmp/osmnames")
GEONAMES_FULL = OSM / "geonames_allcountries.txt"
COASTLINE_SHP = OSM / "ne_coastline" / "ne_10m_coastline.shp"
CACHE = OSM / "global_poi_v1.pkl"

# (feature class, feature code) -> categoría
FEATURE_CODES = {
    ("S", "MALL"): "mall",
    ("S", "STDM"): "stadium",
    ("S", "UNIV"): "university",
    ("L", "INDS"): "industrial",
    ("S", "RSTN"): "station",
    ("S", "RSTP"): "station",
}


def _load_geonames_points() -> dict[str, list[tuple[float, float]]]:
    out: dict[str, list[tuple[float, float]]] = defaultdict(list)
    if not GEONAMES_FULL.exists():
        return out
    with GEONAMES_FULL.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) < 8:
                continue
            cat = FEATURE_CODES.get((p[6], p[7]))
            if not cat:
                continue
            try:
                lat, lon = float(p[4]), float(p[5])
            except ValueError:
                continue
            out[cat].append((lat, lon))
    return out


def _load_coastline() -> list[tuple[float, float]]:
    if not COASTLINE_SHP.exists():
        return []
    import shapefile

    sf = shapefile.Reader(str(COASTLINE_SHP))
    pts: list[tuple[float, float]] = []
    for shp in sf.shapes():
        pts.extend((lat, lon) for lon, lat in shp.points)
    return pts


def load_all() -> dict[str, list[tuple[float, float]]]:
    """Devuelve {"mall": [...], "stadium": [...], "university": [...], "industrial": [...],
    "station": [...], "coast": [...]} — listas de (lat, lon) reales, cacheadas en disco."""
    if CACHE.exists():
        print("caché de POI reales mundiales", CACHE)
        return pickle.loads(CACHE.read_bytes())
    print("indexando POI reales mundiales (GeoNames + costa)…")
    data = dict(_load_geonames_points())
    data["coast"] = _load_coastline()
    for k in ("mall", "stadium", "university", "industrial", "station", "coast"):
        data.setdefault(k, [])
        print(f"  {k}: {len(data[k]):,} puntos reales")
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_bytes(pickle.dumps(data, protocol=4))
    return data


def _pt_grid(pts, cell=0.12):
    g = defaultdict(list)
    for lat, lon in pts:
        g[(int(lat / cell), int(lon / cell))].append((lat, lon))
    return g, cell


def _nearest_km(lat, lon, grid, cell, max_km):
    if not grid:
        return None
    i, j = int(lat / cell), int(lon / cell)
    best = None
    cap = max_km * max_km
    cos = math.cos(math.radians(lat))
    span = max(1, int(max_km / (111.0 * cell)) + 1)
    for di in range(-span, span + 1):
        for dj in range(-span, span + 1):
            for plat, plon in grid.get((i + di, j + dj), ()):
                dy = (plat - lat) * 111.0
                dx = (plon - lon) * 111.0 * cos
                d2 = dx * dx + dy * dy
                if d2 <= cap and (best is None or d2 < best):
                    best = d2
    return math.sqrt(best) if best is not None else None


class GlobalPoiIndex:
    """Índice en memoria (grid) para consultar la distancia real más cercana a un tipo
    de POI mundial, con caché de resultados por radio."""

    def __init__(self, data: dict[str, list[tuple[float, float]]]):
        self.grids = {}
        for k, pts in data.items():
            cell = 0.35 if k in ("mall", "stadium", "coast") else 0.12
            self.grids[k] = _pt_grid(pts, cell)

    def nearest_km(self, kind: str, lat: float, lon: float, max_km: float):
        grid, cell = self.grids.get(kind, ({}, 0.12))
        return _nearest_km(lat, lon, grid, cell, max_km)

    def near(self, kind: str, lat: float, lon: float, max_km: float) -> bool:
        return self.nearest_km(kind, lat, lon, max_km) is not None


def annotate_cities(cities: list[dict], idx: "GlobalPoiIndex") -> None:
    """Marca cada ciudad con flags reales de presencia (mall_ok/stadium_ok/university_ok/
    industrial_ok/coast_ok/station_ok) dentro de su radio metropolitano real, sustituyendo
    la aproximación por ranking de población."""
    from osm_addresses import cap_km

    n_ok = defaultdict(int)
    for c in cities:
        cap = cap_km(c["pop"])
        for kind, key in (
            ("mall", "mall_ok"), ("stadium", "stadium_ok"), ("university", "university_ok"),
            ("industrial", "industrial_ok"), ("coast", "coast_ok"), ("station", "station_ok"),
        ):
            ok = idx.near(kind, c["lat"], c["lon"], cap)
            c[key] = ok
            if ok:
                n_ok[key] += 1
    print("  presencia real por ciudad:", ", ".join(f"{k}={v:,}" for k, v in sorted(n_ok.items())))


def annotate_addresses(cities: list[dict], idx: "GlobalPoiIndex") -> None:
    """Añade a cada dirección real (city['addrs']) los flags de proximidad real a mercado/
    mall, universidad y polígono industrial (para distritos), y refuerza playa/estación con
    datos mundiales reales además de los ya calculados con OSM."""
    RADII = {"mall": 1.0, "university": 1.2, "industrial": 1.3, "coast": 1.3, "station": 0.6}
    n = defaultdict(int)
    for c in cities:
        for rec in c.get("addrs") or []:
            lat, lon = rec.get("lat", c["lat"]), rec.get("lon", c["lon"])
            if idx.near("coast", lat, lon, RADII["coast"]):
                rec["beach"] = True
                n["beach"] += 1
            if idx.near("station", lat, lon, RADII["station"]):
                rec["metro"] = True
                n["metro"] += 1
            rec["mall_near"] = idx.near("mall", lat, lon, RADII["mall"])
            rec["university_near"] = idx.near("university", lat, lon, RADII["university"])
            rec["industrial_near"] = idx.near("industrial", lat, lon, RADII["industrial"])
            for k in ("mall_near", "university_near", "industrial_near"):
                if rec[k]:
                    n[k] += 1
    print("  presencia real por dirección:", ", ".join(f"{k}={v:,}" for k, v in sorted(n.items())))
