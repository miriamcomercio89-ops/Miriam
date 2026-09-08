"""Assign real OSM streets/house numbers and GeoNames postcodes to each municipality."""
from __future__ import annotations

import gzip
import math
import pickle
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

OSM = Path("/tmp/osmnames")
GEONAMES = Path("/tmp/geonames")
CACHE = OSM / "addrs_by_city.pkl"

HIGHWAY_SKIP = {
    "motorway", "motorway_link", "trunk_link", "construction", "proposed",
    "cycleway", "path", "steps", "bridleway", "raceway", "platform",
    "corridor", "elevator", "bus_stop", "rest_area", "services",
    "turning_circle", "track", "escape", "busway",
}
SKIP_NAMES = {"solar", "service", "access", "unnamed", "sin nombre", "s/n"}
HWY_NUM = re.compile(r"^(A|AP|N|E|MA|M|C|D|B|GI|LU|OU|PO|CR|EX|CM|CL|BU|VA|SA|LE|P|S|SS|BI|NA|Z|TE|HU|L|T|CS|V|A7|A45)-?\d", re.I)
PREFIX = re.compile(
    r"^(calle|c/|c\.|avda\.?|avenida|paseo|pso\.|plaza|plaça|plazuela|"
    r"camino|camino de|carrera|carretera|cta\.|rúa|rua|rambla|pasaje|"
    r"ronda|glorieta|cuesta|bajada|travesía|travesia|urbanizaci[oó]n|"
    r"street|st\.|avenue|ave\.|road|rd\.|lane|drive|blvd|boulevard|"
    r"way|court|place|square|via|vía|rue|route|strada|via|"
    r"straße|strasse|ulica|ul\.|prospekt)\b",
    re.I,
)


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def cap_km(pop: int) -> float:
    return min(12.0, max(3.0, math.sqrt(max(pop, 1)) / 20.0))


def dist2_km(lat, lon, c) -> float:
    dy = (lat - c["lat"]) * 111.0
    dx = (lon - c["lon"]) * 111.0 * c["_cos"]
    return dx * dx + dy * dy


def spanish_street(name: str) -> str:
    n = re.sub(r"\s+", " ", name).strip()
    if not n:
        return n
    if PREFIX.search(n):
        return n[0].upper() + n[1:] if n[0].islower() else n
    return "Calle " + n


def format_addr(street: str, num: str, city: dict) -> str:
    cc = city["cc"]
    st = spanish_street(street) if cc == "ES" else re.sub(r"\s+", " ", street).strip()
    head = f"{st} {num}".strip() if num else st
    pc = city.get("postcode") or ""
    if cc == "ES":
        loc = f"{city['name']}, {city['admin2']}, {city['admin1']}, {city['country']}"
        return f"{head}, {pc} {loc}".replace("  ", " ").strip(", ")
    loc = f"{city['name']}, {city['admin2']}, {city['country']}"
    if pc:
        return f"{head}, {pc} {loc}"
    return f"{head}, {loc}"


def load_postcodes(cities: list[dict]) -> None:
    path = GEONAMES / "zip" / "allCountries.txt"
    if not path.exists():
        z = GEONAMES / "allCountries.zip"
        if z.exists():
            import zipfile
            zipfile.ZipFile(z).extract("allCountries.txt", GEONAMES / "zip")
    if not path.exists():
        return
    by_place = defaultdict(list)
    by_admin3 = defaultdict(list)
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        p = line.split("\t")
        if len(p) < 11:
            continue
        cc, pc, place = p[0], p[1], p[2]
        a3 = p[7] if len(p) > 7 else ""
        try:
            lat, lon = float(p[9]), float(p[10])
        except ValueError:
            continue
        rec = (pc, lat, lon, place)
        by_place[(cc, slug(place))].append(rec)
        if a3:
            by_admin3[(cc, slug(a3))].append(rec)

    def pick(c, pool):
        if not pool:
            return None
        # exact place name first
        sn = slug(c["name"])
        sa = slug(c.get("ascii") or "")
        exact = [r for r in pool if slug(r[3]) in {sn, sa}]
        use = exact or pool
        best = None
        bd = None
        for pc, lat, lon, _place in use:
            dy = lat - c["lat"]
            dx = (lon - c["lon"]) * math.cos(math.radians(c["lat"]))
            d = dy * dy + dx * dx
            key = (d, len(pc), pc)
            if bd is None or key < bd:
                best, bd = pc, key
        return best

    for c in cities:
        keys = [(c["cc"], slug(c["name"]))]
        if c.get("ascii"):
            keys.append((c["cc"], slug(c["ascii"])))
        pool = []
        for k in keys:
            pool.extend(by_place.get(k, []))
        pc = pick(c, pool)
        if not pc:
            pool = []
            for k in keys:
                pool.extend(by_admin3.get(k, []))
            pc = pick(c, pool)
        if pc:
            c["postcode"] = pc


def _prepare_cities(cities: list[dict]):
    grid = defaultdict(list)
    by_name = defaultdict(list)
    gcell = 0.12
    for c in cities:
        c["_cos"] = math.cos(math.radians(c["lat"]))
        cap = cap_km(c["pop"])
        c["_cap2"] = cap * cap
        c["_want"] = max(12, min(96, int(round(c["pop"] / 900.0)) + 8))
        grid[(int(c["lat"] / gcell), int(c["lon"] / gcell))].append(c)
        by_name[(c["cc"].upper(), slug(c["name"]))].append(c)
        if c.get("ascii"):
            by_name[(c["cc"].upper(), slug(c["ascii"]))].append(c)
    return grid, by_name, gcell


def _nearest(lat, lon, grid, gcell, cc=None, osm_city=""):
    if osm_city:
        key = ((cc or "").upper(), slug(osm_city))
        # name match is applied by caller
    i, j = int(lat / gcell), int(lon / gcell)
    best, bd = None, 1e18
    for di in (-2, -1, 0, 1, 2):
        for dj in (-2, -1, 0, 1, 2):
            for c in grid[(i + di, j + dj)]:
                if cc and c["cc"].upper() != cc.upper():
                    continue
                d = dist2_km(lat, lon, c)
                if d <= c["_cap2"] and d < bd:
                    best, bd = c, d
    return best


def _name_city(osm_city, cc, lat, lon, by_name):
    if not osm_city or not cc:
        return None
    cands = by_name.get((cc.upper(), slug(osm_city)))
    if not cands:
        return None
    best, bd = None, 4.2 * 4.2
    for c in cands:
        d = dist2_km(lat, lon, c)
        if d < bd:
            best, bd = c, d
    return best


def _ok_street(name: str, typ: str) -> bool:
    if typ in HIGHWAY_SKIP:
        return False
    n = (name or "").strip()
    if len(n) < 3 or n.lower() in SKIP_NAMES:
        return False
    if HWY_NUM.match(n) and " " not in n:
        return False
    if "," in n:
        return False
    letters = "".join(c for c in n if c.isalpha())
    if len(letters) >= 8 and letters.isupper():
        return False
    return True


def _add(buckets, city, street, num, lat, lon, numbered: bool):
    b = buckets[city["id"]]
    if len(b) >= city["_want"]:
        return
    sl = street.lower()
    if not numbered and sl in city["_has_num"]:
        return
    key = (sl, (num or "").lower())
    if key in city["_seen"]:
        return
    city["_seen"].add(key)
    if numbered:
        city["_has_num"].add(sl)
    b.append({"street": street, "num": num or "", "lat": lat, "lon": lon, "numbered": numbered})


PED_NAME_KEYS = (
    "peatonal", "plaza", "plaça", "piazza", "paseo marítimo", "paseo maritimo", "rambla",
    "pedestrian", "walking street", "marktplatz", "woonstraat", "zone piétonne",
    "rue piétonne", "corso", "promenade",
)
STATION_NAME_KEYS = (
    "estación", "estacion", "station", "bahnhof", "gare", "stazione",
    "metro", "subway", "cercanías", "cercanias", "railway", "train station",
)
BEACH_NAME_KEYS = (
    "playa", "beach", "plage", "spiaggia", "strand", "praia", "arenal",
    "seafront", "waterfront", "paseo marítimo", "paseo maritimo", "lungomare",
)


def cache_path(cities: list[dict]) -> Path:
    only_es = bool(cities) and all(c["cc"] == "ES" for c in cities)
    if only_es:
        return CACHE
    return OSM / f"addrs_world_v7_{len(cities)}.pkl"


def cache_version(cities: list[dict]) -> int:
    only_es = bool(cities) and all(c["cc"] == "ES" for c in cities)
    return 6 if only_es else 7


def build_index(cities: list[dict]) -> dict:
    cpath = cache_path(cities)
    ver = cache_version(cities)
    if cpath.exists():
        data = pickle.loads(cpath.read_bytes())
        if data.get("n") == len(cities) and data.get("ids") == (cities[0]["id"], cities[-1]["id"]) and data.get("v") == ver:
            print("address cache hit", cpath)
            return data["buckets"]
    print("indexing postcodes…")
    load_postcodes(cities)
    for c in cities:
        c["_seen"] = set()
        c["_has_num"] = set()
    grid, by_name, gcell = _prepare_cities(cities)
    buckets = defaultdict(list)

    only_es = bool(cities) and all(c["cc"] == "ES" for c in cities)
    peds, stations, beaches = [], [], []
    if not only_es:
        hn = OSM / "planet-latest_housenumbers.tsv.gz"
        if hn.exists():
            print("indexing OSM house numbers…")
            n = 0
            with gzip.open(hn, "rt", encoding="utf-8", errors="replace") as f:
                f.readline()
                for line in f:
                    n += 1
                    p = line.rstrip("\n").split("\t")
                    if len(p) < 6:
                        continue
                    street, num = p[2].strip(), p[3].strip()
                    if not street or not num or not _ok_street(street, "residential"):
                        continue
                    try:
                        lon, lat = float(p[4]), float(p[5])
                    except ValueError:
                        continue
                    city = _nearest(lat, lon, grid, gcell)
                    if city is None:
                        continue
                    _add(buckets, city, street, num, lat, lon, True)
                    if n % 8_000_000 == 0:
                        print(f"  housenumbers {n:,}", flush=True)
            print("  housenumbers done", n)

        geo = OSM / "planet-latest_geonames.tsv.gz"
        print("indexing OSM streets and access…")
        n = 0
        with gzip.open(geo, "rt", encoding="utf-8", errors="replace") as f:
            f.readline()
            for line in f:
                n += 1
                p = line.rstrip("\n").split("\t")
                if len(p) < 16:
                    continue
                cls, typ = p[4], p[5]
                try:
                    lon, lat = float(p[6]), float(p[7])
                except ValueError:
                    continue
                if cls == "highway" and typ in ("pedestrian", "living_street"):
                    peds.append((lat, lon))
                elif cls == "railway" and typ in ("station", "halt", "subway_entrance"):
                    stations.append((lat, lon))
                elif cls == "public_transport" and typ == "station":
                    stations.append((lat, lon))
                elif cls in ("natural", "leisure") and typ == "beach":
                    beaches.append((lat, lon))
                if cls != "highway":
                    continue
                name, osm_city, cc = p[0], p[11], p[15]
                if not _ok_street(name, typ):
                    continue
                city = _name_city(osm_city, cc, lat, lon, by_name)
                if city is None:
                    city = _nearest(lat, lon, grid, gcell, cc=cc.upper() if cc else None)
                if city is None:
                    continue
                _add(buckets, city, name, "", lat, lon, False)
                if n % 5_000_000 == 0:
                    print(f"  streets {n:,}  ped={len(peds):,} st={len(stations):,} beach={len(beaches):,}", flush=True)
        print("  streets done", n, "ped", len(peds), "station", len(stations), "beach", len(beaches))

    es_cities = [c for c in cities if c["cc"] == "ES"]
    if es_cities:
        print("overlay current Spain OpenStreetMap…")
        for c in es_cities:
            buckets[c["id"]].clear()
            c["_seen"].clear()
            c["_has_num"].clear()
        overlay_spain(es_cities, buckets, grid, gcell, by_name)

    out = {}
    got = 0
    for c in cities:
        rows = buckets.get(c["id"], [])
        rows.sort(key=lambda r: (not r["numbered"], r["street"], r["num"]))
        addrs = []
        seen_txt = set()
        for r in rows:
            txt = format_addr(r["street"], r["num"], c)
            if txt in seen_txt:
                continue
            seen_txt.add(txt)
            addrs.append({
                "text": txt,
                "lat": r["lat"],
                "lon": r["lon"],
                "street": r["street"],
                "num": r.get("num") or "",
                "metro": False,
                "ped": False,
                "beach": False,
            })
        if not addrs:
            pc = c.get("postcode") or ""
            loc = f"{c['name']}, {c['admin2']}, {c['admin1']}, {c['country']}"
            if c["cc"] != "ES":
                loc = f"{c['name']}, {c['admin2']}, {c['country']}"
            txt = f"{pc} {loc}".strip() if pc else loc
            addrs.append({
                "text": txt,
                "lat": c["lat"],
                "lon": c["lon"],
                "street": "",
                "num": "",
                "metro": False,
                "ped": False,
                "beach": False,
            })
        out[c["id"]] = addrs
        if len(addrs) > 1 or addrs[0]["text"] != format_addr(c["name"], "", c):
            got += 1
        c.pop("_seen", None)
        c.pop("_has_num", None)
        c.pop("_cos", None)
        c.pop("_cap2", None)
        c.pop("_want", None)
    if not only_es and (peds or stations or beaches):
        print("annotating world metro/peatonal/playa…")
        annotate_from_points(out, cities, peds, stations, beaches)
    if es_cities:
        annotate_access(out, es_cities)
    for rows in out.values():
        for rec in rows:
            st = (rec.get("street") or rec.get("text") or "").lower()
            if any(k in st for k in PED_NAME_KEYS):
                rec["ped"] = True
            if any(k in st for k in STATION_NAME_KEYS):
                rec["metro"] = True
            if any(k in st for k in BEACH_NAME_KEYS):
                rec["beach"] = True
    print(f"cities with OSM streets: {got}/{len(cities)}")
    cpath.parent.mkdir(parents=True, exist_ok=True)
    cpath.write_bytes(pickle.dumps({"v": ver, "n": len(cities), "ids": (cities[0]["id"], cities[-1]["id"]), "buckets": out}, protocol=4))
    print("address cache wrote", cpath)
    return out


SPAIN_PBF = OSM / "spain-latest.osm.pbf"
SPAIN_EXTRACT = OSM / "spain_extract_v2.pkl"


def _way_centroid(w):
    lats, lons = [], []
    try:
        for n in w.nodes:
            loc = n.location
            if loc.valid():
                lats.append(loc.lat)
                lons.append(loc.lon)
    except Exception:
        return None
    if not lats:
        return None
    return sum(lats) / len(lats), sum(lons) / len(lons)


def _spain_extract():
    if SPAIN_EXTRACT.exists():
        print("  spain extract cache", SPAIN_EXTRACT)
        return pickle.loads(SPAIN_EXTRACT.read_bytes())
    import osmium

    class H(osmium.SimpleHandler):
        def __init__(self):
            super().__init__()
            self.streets = []
            self.houses = []
            self.peds = []
            self.stations = []
            self.beaches = []
            self.n_way = 0
            self.n_node = 0

        def way(self, w):
            self.n_way += 1
            pt = None
            hw = w.tags.get("highway")
            name = w.tags.get("name")
            if hw and name and _ok_street(name, hw):
                pt = _way_centroid(w)
                if pt:
                    self.streets.append((name, pt[0], pt[1]))
                    if hw in ("pedestrian", "living_street"):
                        self.peds.append(pt)
            if hw in ("pedestrian", "living_street"):
                if pt is None:
                    pt = _way_centroid(w)
                if pt:
                    self.peds.append(pt)
            rail = w.tags.get("railway")
            if rail in ("station", "halt") or w.tags.get("station") == "subway" or w.tags.get("public_transport") == "station":
                if pt is None:
                    pt = _way_centroid(w)
                if pt:
                    self.stations.append(pt)
            if w.tags.get("natural") == "beach" or w.tags.get("leisure") == "beach":
                if pt is None:
                    pt = _way_centroid(w)
                if pt:
                    self.beaches.append(pt)

        def node(self, n):
            self.n_node += 1
            loc = n.location
            if not loc.valid():
                return
            lat, lon = loc.lat, loc.lon
            num = n.tags.get("addr:housenumber")
            street = n.tags.get("addr:street")
            if num and street and _ok_street(street, "residential"):
                self.houses.append((street, num, lat, lon))
            rail = n.tags.get("railway")
            if rail in ("station", "halt", "subway_entrance") or n.tags.get("station") == "subway":
                self.stations.append((lat, lon))
            elif n.tags.get("public_transport") == "station" and n.tags.get("amenity") != "bus_station":
                self.stations.append((lat, lon))
            if n.tags.get("natural") == "beach" or n.tags.get("leisure") == "beach":
                self.beaches.append((lat, lon))

    print("  parsing", SPAIN_PBF)
    h = H()
    h.apply_file(str(SPAIN_PBF), locations=True, idx="flex_mem")
    print(
        f"  spain ways {h.n_way:,} streets {len(h.streets):,} house {len(h.houses):,} "
        f"ped {len(h.peds):,} station {len(h.stations):,} beach {len(h.beaches):,}"
    )
    data = {
        "streets": h.streets,
        "houses": h.houses,
        "peds": h.peds,
        "stations": h.stations,
        "beaches": h.beaches,
    }
    SPAIN_EXTRACT.write_bytes(pickle.dumps(data, protocol=4))
    return data


def _pt_grid(pts, cell=0.02):
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


def annotate_from_points(out, cities, peds, stations, beaches):
    ped_g, pc = _pt_grid(peds or [])
    st_g, sc = _pt_grid(stations or [])
    be_g, bc = _pt_grid(beaches or [])
    n_m = n_p = n_b = 0
    for c in cities:
        for rec in out.get(c["id"], []):
            lat, lon = rec["lat"], rec["lon"]
            if _nearest_km(lat, lon, ped_g, pc, 0.14) is not None:
                rec["ped"] = True
                n_p += 1
            if _nearest_km(lat, lon, st_g, sc, 0.55) is not None:
                rec["metro"] = True
                n_m += 1
            bk = _nearest_km(lat, lon, be_g, bc, 1.2)
            if bk is not None:
                rec["beach"] = True
                rec["beach_km"] = bk
                n_b += 1
    print(f"  access flags metro={n_m} ped={n_p} beach={n_b}")


def annotate_access(out, es_cities):
    if not SPAIN_PBF.exists() and not SPAIN_EXTRACT.exists():
        return
    try:
        data = _spain_extract()
    except Exception as e:
        print("  access extract failed", e)
        return
    annotate_from_points(out, es_cities, data.get("peds") or [], data.get("stations") or [], data.get("beaches") or [])


def overlay_spain(es_cities, buckets, grid, gcell, by_name):
    if not SPAIN_PBF.exists():
        print("  missing", SPAIN_PBF, "— skip overlay")
        return
    data = _spain_extract()
    for street, num, lat, lon in data["houses"]:
        if not _ok_street(street, "residential"):
            continue
        city = _nearest(lat, lon, grid, gcell, cc="ES")
        if city is None:
            continue
        _add(buckets, city, street, num, lat, lon, True)
    for name, lat, lon in data["streets"]:
        if not _ok_street(name, "residential"):
            continue
        city = _nearest(lat, lon, grid, gcell, cc="ES")
        if city is None:
            continue
        _add(buckets, city, name, "", lat, lon, False)
    print("  spain overlay done")


def district_for(city, lat, lon, rec=None) -> str:
    rec = rec or {}
    dy = (lat - city["lat"]) * 111.0
    dx = (lon - city["lon"]) * 111.0 * math.cos(math.radians(city["lat"]))
    dist = math.hypot(dx, dy)
    if rec.get("beach"):
        return "Arenal" if (rec.get("beach_km") or 1) < 0.4 else "Playa"
    if rec.get("ped") and dist < 0.7:
        return "Casco"
    if rec.get("metro"):
        return "Estacion"
    if rec.get("university_near"):
        return "Universidad"
    if rec.get("industrial_near"):
        return "Poligono"
    if dist < 0.45:
        return "Centro"
    if abs(dy) >= abs(dx):
        return "Norte" if dy > 0 else "Sur"
    return "Este" if dx > 0 else "Oeste"
