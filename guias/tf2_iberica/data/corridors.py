# -*- coding: utf-8 -*-
"""Corredores ferroviarios, marítimos y aéreos planificados."""

from __future__ import annotations

# (id, name, cities_in_order, start_year, kind, color_key)
RAIL_CORRIDORS = [
    ("C01", "Madrid–Aranjuez", ["Madrid", "Aranjuez"], 1851, "regional", "line_rail"),
    ("C02", "Madrid–Alcalá–Guadalajara–Zaragoza", ["Madrid", "Alcalá de Henares", "Guadalajara", "Zaragoza"], 1856, "magistral", "line_rail"),
    ("C03", "Madrid–Ávila–Valladolid–Burgos–Bilbao", ["Madrid", "Ávila", "Valladolid", "Burgos", "Bilbao"], 1863, "magistral", "line_rail"),
    ("C04", "Madrid–Alcázar–Córdoba–Sevilla–Cádiz", ["Madrid", "Ciudad Real", "Córdoba", "Sevilla", "Cádiz"], 1866, "magistral", "line_rail"),
    ("C05", "Madrid–Albacete–Alicante", ["Madrid", "Albacete", "Alicante"], 1858, "magistral", "line_rail"),
    ("C06", "Zaragoza–Lérida–Barcelona", ["Zaragoza", "Lérida", "Barcelona"], 1865, "magistral", "line_rail"),
    ("C07", "Valencia–Castellón–Tarragona–Barcelona", ["Valencia", "Castellón de la Plana", "Tarragona", "Barcelona"], 1878, "magistral", "line_rail"),
    ("C08", "Madrid–Segovia–Valladolid", ["Madrid", "Segovia", "Valladolid"], 1884, "regional", "line_rail"),
    ("C09", "León–Oviedo–Gijón", ["León", "Oviedo", "Gijón"], 1884, "regional", "line_rail"),
    ("C10", "Valladolid–Palencia–Santander", ["Valladolid", "Palencia", "Santander"], 1875, "regional", "line_rail"),
    ("C11", "Bilbao–San Sebastián–Bayona", ["Bilbao", "San Sebastián", "Bayona"], 1889, "internacional", "line_rail"),
    ("C12", "Zaragoza–Pamplona–San Sebastián", ["Zaragoza", "Pamplona", "San Sebastián"], 1890, "regional", "line_rail"),
    ("C13", "Madrid–Badajoz–Lisboa", ["Madrid", "Badajoz", "Évora", "Lisboa"], 1881, "internacional", "line_rail"),
    ("C14", "Sevilla–Huelva", ["Sevilla", "Huelva"], 1880, "regional", "line_rail"),
    ("C15", "Córdoba–Málaga", ["Córdoba", "Málaga"], 1877, "regional", "line_rail"),
    ("C16", "Alcázar–Jaen–Granada", ["Ciudad Real", "Jaen", "Granada"], 1895, "regional", "line_rail"),
    ("C17", "Murcia–Cartagena", ["Murcia", "Cartagena"], 1870, "regional", "line_rail"),
    ("C18", "Alicante–Murcia", ["Alicante", "Murcia"], 1884, "regional", "line_rail"),
    ("C19", "Barcelona–Gerona–Perpiñán", ["Barcelona", "Gerona", "Perpiñán"], 1878, "internacional", "line_rail"),
    ("C20", "León–Lugo–La Coruña", ["León", "Lugo", "La Coruña"], 1900, "magistral", "line_rail"),
    ("C21", "Monforte–Orense–Vigo", ["Orense", "Vigo"], 1905, "regional", "line_rail"),
    ("C22", "Santiago–La Coruña / Vigo", ["Santiago de Compostela", "La Coruña", "Vigo"], 1912, "regional", "line_rail"),
    ("C23", "Salamanca–Oporto", ["Salamanca", "Coímbra", "Oporto"], 1895, "internacional", "line_rail"),
    ("C24", "Lisboa–Coímbra–Oporto", ["Lisboa", "Leiria", "Coímbra", "Oporto"], 1865, "magistral", "line_rail"),
    ("C25", "Lisboa–Setúbal–Faro", ["Lisboa", "Setúbal", "Faro"], 1900, "regional", "line_rail"),
    ("C26", "Madrid–Cuenca–Valencia", ["Madrid", "Cuenca", "Valencia"], 1947, "regional", "line_rail"),
    ("C27", "Zaragoza–Logroño–Miranda–Bilbao", ["Zaragoza", "Logroño", "Bilbao"], 1880, "regional", "line_rail"),
    ("C28", "Pau–Toulouse–Carcasona–Perpiñán", ["Pau", "Toulouse", "Carcasona", "Perpiñán"], 1920, "francia", "line_rail"),
    ("C29", "AVE Madrid–Sevilla", ["Madrid", "Ciudad Real", "Córdoba", "Sevilla"], 1992, "ave", "line_rail"),
    ("C30", "AVE Madrid–Barcelona", ["Madrid", "Zaragoza", "Lérida", "Barcelona"], 2008, "ave", "line_rail"),
    ("C31", "AVE Madrid–Valencia", ["Madrid", "Cuenca", "Valencia"], 2010, "ave", "line_rail"),
    ("C32", "AVE Madrid–Málaga", ["Madrid", "Córdoba", "Málaga"], 2007, "ave", "line_rail"),
    ("C33", "AVE Madrid–Valladolid–León–Galicia", ["Madrid", "Valladolid", "León", "Santiago de Compostela"], 2015, "ave", "line_rail"),
    ("C34", "AVE Madrid–Alicante", ["Madrid", "Albacete", "Alicante"], 2013, "ave", "line_rail"),
    ("C35", "AVE Barcelona–Francia", ["Barcelona", "Gerona", "Perpiñán"], 2013, "ave", "line_rail"),
]

SEA_ROUTES = [
    ("S01", "Cádiz–Tánger espíritu / Cádiz–Argel", ["Cádiz", "Argel"], 1860, "ferry"),
    ("S02", "Barcelona–Palma", ["Barcelona", "Palma de Mallorca"], 1870, "ferry"),
    ("S03", "Valencia–Palma", ["Valencia", "Palma de Mallorca"], 1880, "ferry"),
    ("S04", "Alicante–Argel", ["Alicante", "Argel"], 1890, "ferry"),
    ("S05", "Almería–Melilla espíritu / Almería–Mostagem", ["Almería", "Mostagem"], 1910, "ferry"),
    ("S06", "Bilbao–Santander–Gijón cabotaje", ["Bilbao", "Santander", "Gijón"], 1865, "cabotaje"),
    ("S07", "Vigo–Lisboa–Cádiz Atlántico", ["Vigo", "Lisboa", "Cádiz"], 1885, "cabotaje"),
    ("S08", "Barcelona–Marsella espíritu / Barcelona–Perpiñán costa", ["Barcelona", "Perpiñán"], 1900, "cabotaje"),
    ("S09", "Palma–Manacor no; Palma–Barcelona refuerzo", ["Palma de Mallorca", "Barcelona"], 1950, "ferry"),
    ("S10", "Argel–Mostagem–Khemis (cabotaje argelino)", ["Argel", "Mostagem"], 1925, "cabotaje"),
]

AIR_ROUTES = [
    ("A01", "Madrid–Barcelona", ["Madrid", "Barcelona"], 1933, "hub"),
    ("A02", "Madrid–Lisboa", ["Madrid", "Lisboa"], 1940, "hub"),
    ("A03", "Madrid–Sevilla", ["Madrid", "Sevilla"], 1945, "domestic"),
    ("A04", "Madrid–Palma", ["Madrid", "Palma de Mallorca"], 1950, "turismo"),
    ("A05", "Barcelona–Palma", ["Barcelona", "Palma de Mallorca"], 1952, "turismo"),
    ("A06", "Madrid–Argel", ["Madrid", "Argel"], 1955, "internacional"),
    ("A07", "Madrid–Toulouse", ["Madrid", "Toulouse"], 1960, "internacional"),
    ("A08", "Madrid–Málaga", ["Madrid", "Málaga"], 1965, "turismo"),
    ("A09", "Lisboa–Oporto", ["Lisboa", "Oporto"], 1948, "domestic"),
    ("A10", "Barcelona–Valencia", ["Barcelona", "Valencia"], 1970, "domestic"),
    ("A11", "Madrid–Vigo / La Coruña", ["Madrid", "Vigo"], 1980, "domestic"),
    ("A12", "Madrid–Bilbao", ["Madrid", "Bilbao"], 1960, "domestic"),
]


def corridors_starting(year: int, month: int):
    # activate in January of start_year mostly; some mid-year via milestones
    out = []
    for c in RAIL_CORRIDORS:
        if c[3] == year and month in (1, 4, 7, 10):
            # distribute across quarters
            q = {1: 1, 4: 2, 7: 3, 10: 4}[month]
            idx = int(c[0][1:]) % 4 + 1
            if idx == q or (year == c[3] and month == 1 and idx == 1):
                out.append(c)
    for c in RAIL_CORRIDORS:
        if c[3] == year and month == 1 and c not in out:
            # ensure all appear at least in January of their year if not quarter-matched
            if int(c[0][1:]) % 4 == 0:
                out.append(c)
    return out
