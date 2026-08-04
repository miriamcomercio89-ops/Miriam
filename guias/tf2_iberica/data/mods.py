# -*- coding: utf-8 -*-
"""Mods Workshop y flotas por época (nombres completos para buscar en Steam)."""

from __future__ import annotations

# Mod base obligatorio desde el mes 0 / enero 1850
CORE_MODS = [
    {
        "name": "Akalipsia-Mod 25",
        "id": "3539897274",
        "when": (1850, 1),
        "note": "Industrias y mercancías de la guía. Cargar según instrucciones del autor.",
    },
    {
        "name": "Kaminari Numbers",
        "id": "2312549569",
        "when": (1850, 1),
        "note": "Numeración dinámica; dependencia frecuente de material RENFE.",
    },
    {
        "name": "Better Terrain Brushes",
        "id": "2073771981",
        "when": (1850, 1),
        "note": "Ayuda a modelar trazados en mapa megalómano.",
    },
    {
        "name": "Additional Bridges and Viaducts (JK Bridge Pack)",
        "id": "2797825680",
        "when": (1850, 1),
        "note": "Puentes para valles y costas.",
    },
    {
        "name": "DMA Road Stations",
        "id": "2107526936",
        "when": (1850, 1),
        "note": "Estaciones de bus/camión versátiles.",
    },
]

# Vehículos / infra: year, month, workshop_name, workshop_id, mode, role, stats
# stats: capacity hint, speed, cost note
FLEET = [
    # 1850s — vapor inicial / Mataró
    (1850, 1, "'La Mataró' 1-1-1", "2024121058", "tren", "pasajeros pioneros", "40–60 km/h · composición corta"),
    (1850, 2, "RENFE stations (base mod)", "2986525888", "infra", "estaciones", "base de estaciones españolas"),
    (1850, 3, "Spanish mediterraean style station 1 (Station+Depot)", "2542146583", "infra", "estación+depósito", "estilo mediterráneo"),
    (1850, 6, "XIXth modular station roof", "2288230992", "infra", "cubiertas", "andenes cubiertos s. XIX"),
    (1851, 2, "RENFE old coaches pack 1 (Ex-MZA)", "2531665539", "tren", "coches pasajeros", "coches madera MZA"),
    (1852, 4, "RENFE Old cargo wagons", "2539049739", "tren", "mercancías", "vagones época"),
    (1854, 3, "GSSR/RENFE 1-3-0 Locomotives", "2430627692", "tren", "mixta", "vapor 1-3-0"),
    (1856, 5, "Renfe 0-3-0 Mamouth Locomotives", "2452770587", "tren", "mercancías", "80 km/h · 485 kW clase"),
    (1858, 8, "Spanish Norte/MZA/RENFE Foudres cargo waggons", "2452718217", "tren", "líquidos/barricas", "foudres"),
    # 1860–80
    (1860, 1, "Spanish Mechanical Signals (MZA, NORTE and RENFE)", "2606426734", "infra", "señales", "señales mecánicas realistas"),
    (1862, 4, "RENFE 0-4-0 series 0200 to 2300", "2519619997", "tren", "maniobras/mercancías", "0-4-0"),
    (1865, 6, "Modular Station Roof", "1976935178", "infra", "andenes", "cubiertas modulares"),
    (1870, 3, "RENFE 0-2-0 (Ex-MZA 602-607)", "2512929681", "tren", "maniobras", "50 km/h · 211 kW · desde 1880 hist."),
    (1871, 5, "Alstom Citadis 302", "2826937228", "tranvia", "urbano", "usar más adelante; anotar descarga al abrir tranvía moderno"),
    (1875, 2, "RENFE old coaches pack 2 (Ex-Norte)", "2764765672", "tren", "pasajeros Norte", "coches Norte"),
    (1878, 9, "Spanish mediterraean Ex-NORTE stations.", "2568586983", "infra", "estaciones Norte", "estilo Norte"),
    (1880, 4, "NORTE/RENFE Stations (Catalonia region)", "3033346808", "infra", "Cataluña", "estaciones regionales"),
    (1885, 7, "MZA/RENFE(Catalonia Region)", "2986526052", "infra", "MZA Cataluña", "pack regional"),
    (1890, 3, "NORTE 1700 / Renfe 0-3-0 Mamouth Locomotives", "2452770587", "tren", "mercancías", "serie Norte 1700 / mamut"),
    (1895, 6, "Asset Set - Bagage", "2080126713", "infra", "andén", "detalles de andén"),
    # 1900–1925
    (1900, 2, "NORTE 4000 Mastodon/RENFE 240-4000", "2788179644", "tren", "expreso/mercancías", "mastodonte Norte"),
    (1905, 4, "NORTE 3000 Pacific/RENFE 231-4000", "2761006821", "tren", "expreso", "Pacific Norte"),
    (1910, 6, "NORTE 4200/RENFE 242-0400", "2828748536", "tren", "montaña", "4200 Norte"),
    (1915, 3, "MADRID-DELICIAS Railway station (Station+Depots+Roundhouse)", "2903000891", "infra", "Madrid", "Delicias + cocheras"),
    (1919, 10, "NORTE/RENFE Burgos Main station", "2744108071", "infra", "Burgos", "estación principal"),
    (1925, 1, "MZA 1700 series (RENFE 2-4-1 2000 series)", "2557086900", "tren", "expreso", "MZA 1700 icónica"),
    (1928, 4, "NORTE/RENFE 6100 (RENFE 261)", "2520988277", "tren", "eléctrica", "primera eléctrica Norte"),
    (1928, 6, "Spanish tracks and catenary (MZA, NORTE, RENFE y ADIF)", "3375850390", "infra", "vía+catenaria", "electrificación"),
    (1929, 2, "RENFE/NORTE 270/271", "2625761603", "tren", "eléctrica", "270/271"),
    # 1930–1950
    (1933, 1, "IBERIA: historical fleet", "1997085076", "avion", "pasajeros", "flota Iberia histórica"),
    (1941, 1, "RENFE 241-2200 (Atomicas)", "2492444927", "tren", "expreso", "atómicas MTM"),
    (1943, 4, "RENFE 5000/6000 coaches", "2799136056", "tren", "coches", "coches metálicos"),
    (1944, 6, "RENFE 1-4-1 2100 to 2400 (Mikados)", "2583772310", "tren", "mixta", "Mikados"),
    (1948, 3, "RENFE series 274 (Ex-7400)", "2548772625", "tren", "eléctrica", "7400/274"),
    (1950, 5, "MZA/RENFE Renault ZO railcar (9150-9154)", "2778565088", "tren", "automotor", "Renault ZO"),
    (1952, 8, "NORTE/RENFE Ganz railcar (9155 Series)", "2733124713", "tren", "automotor", "Ganz"),
    (1954, 4, "RENFE 597 series (TER)", "3446067934", "tren", "rápido diésel", "120 km/h · TER Fiat"),
    (1955, 2, "Renault ABJ (RENFE 9300/590 series)", "2971215396", "tren", "automotor", "ABJ"),
    (1956, 6, "RENFE series 316 (Ex-1600)", "2783498755", "tren", "diésel", "1600/316"),
    (1958, 9, "RENFE 307 diesel locomotives", "2374690827", "tren", "maniobras diésel", "307"),
    (1959, 3, "PEGASO 1065 Europa", "2900518649", "camion", "mercancías", "Pegaso 1065"),
    # 1960–1980
    (1960, 4, "40 ton truck - Spanish brands", "1982960475", "camion", "pesado", "marcas españolas"),
    (1962, 7, "RENFE UT-300 (433 Series )", "2792218056", "tren", "cercanías eléctrica", "UT-300"),
    (1964, 2, "RENFE 7600 series (276)", "2874019204", "tren", "eléctrica mercancías", "276"),
    (1965, 5, "EBRO B series", "3291933829", "camion", "medio", "Ebro B"),
    (1966, 8, "Renfe coaches 5000 series (First model)", "2423535014", "tren", "coches", "5000"),
    (1968, 3, "Spanish RENFE cargo waggons series 300000", "2439835617", "tren", "mercancías", "300000"),
    (1970, 1, "Pack Series 269", "2181619254", "tren", "eléctrica", "269 Japonesas base"),
    (1970, 2, "Renfe 269 'Japaneses'", "2154222688", "tren", "eléctrica", "269"),
    (1972, 6, "RENFE 313/CP 1320 series", "2465868346", "tren", "diésel Iberia", "313 / CP 1320"),
    (1974, 4, "Renfe 250", "2169502149", "tren", "eléctrica", "250"),
    (1975, 9, "JorgeNB96's Classic Gas stations (50s-80s)", "2897635591", "infra", "ambiente", "gasolineras época"),
    (1976, 3, "Renfe 444", "2199176061", "tren", "regional eléctrico", "444"),
    (1978, 5, "RENFE Faos hopper wagons (T-172000)", "2572979562", "tren", "tolvas", "Faos"),
    (1979, 8, "RENFE unified boxcars J-41000/46000 (Glm)", "2847766707", "tren", "cerrados", "Glm"),
    # 1980–1995
    (1980, 2, "Renfe Signal Lights Pack", "2370554967", "infra", "señales", "luces RENFE"),
    (1982, 4, "RENFE Rail Crossings 2.0", "2950107118", "infra", "pasos a nivel", "cruces"),
    (1984, 6, "Renfe 9000 Series", "2177835198", "tren", "talgo/largo", "9000"),
    (1987, 3, "Renfe - Adif 310 series", "3459475233", "tren", "maniobras diésel", "110 km/h · 816 kW"),
    (1988, 9, "Renfe 450", "2239014471", "tren", "cercanías dos pisos", "140 km/h · UT450"),
    (1989, 4, "Renfe Class 446/7", "3188746996", "tren", "cercanías", "446/447"),
    (1989, 8, "Renfe 451", "2244221325", "tren", "cercanías", "451"),
    (1990, 2, "Eurofima Coaches, BASE Set", "2061685027", "tren", "coches", "Eurofima base"),
    (1990, 3, "Eurofima Coaches, RENFE Set", "2098423175", "tren", "coches RENFE", "Eurofima RENFE"),
    (1992, 4, "Renfe AVE & Euromed (class 100 & 101)", "2023155009", "tren", "AVE/Euromed", "S100/S101"),
    (1992, 5, "Renfe S100/S101 PACK 1", "2672236416", "tren", "AVE", "pack S100"),
    (1992, 6, "Spanish Tracks and Catenaries (MZA, NORTE, RENFE and ADIF). EXTENDED", "3375852220", "infra", "AVE vía", "catenaria extendida"),
    (1993, 2, "S100-S101 DUPLEX Renfe", "2581124493", "tren", "AVE duplex", "duplex"),
    (1994, 7, "ALSA Mercedes-Benz Tourismo (MA BB 1400)", "2899509692", "bus", "largo recorrido", "ALSA Tourismo"),
    (1995, 3, "Mercedes-Benz Tourismo (MA BB 1400)", "2027024335", "bus", "base Tourismo", "dependencia ALSA"),
    (1995, 8, "Renfe Talgo 6", "2336631871", "tren", "largo recorrido", "Talgo VI"),
    # 2000–2020
    (2000, 4, "Mercedes-Benz O530 Citaro", "2951562475", "bus", "urbano", "Citaro"),
    (2001, 6, "Barcelona Citaro Pack 1", "3115281577", "bus", "Barcelona", "Citaro BCN"),
    (2002, 3, "Pack Series 253", "2271421858", "tren", "mercancías eléctrica", "253"),
    (2002, 4, "Renfe 253", "2268001178", "tren", "mercancías", "253"),
    (2003, 5, "Renfe 252", "2343841331", "tren", "eléctrica", "252"),
    (2004, 2, "Renfe 462-465 series «Civia»", "2920653422", "tren", "cercanías", "120 km/h · Civia"),
    (2005, 6, "Renfe AVANT S104 y Alaris UT490", "2773199087", "tren", "Avant/Alaris", "S104 / 490"),
    (2005, 8, "RENFE 490 Pendolino (Alaris)", "3391522147", "tren", "Alaris", "Pendolino"),
    (2006, 4, "Laagrss Transfesa", "2783723195", "tren", "intermodal", "Transfesa"),
    (2007, 9, "Renfe AVE 102-112 Series", "2991362685", "tren", "AVE", "102/112"),
    (2008, 3, "Renfe S103 PACK 1", "2582317901", "tren", "AVE", "S103 Velaro"),
    (2009, 5, "333.3 Renfe Mercancías Pack", "2805628069", "tren", "mercancías diésel", "333.3"),
    (2010, 2, "Bombardier Traxx 2", "1952075958", "tren", "mercancías EU", "Traxx"),
    (2011, 6, "Renfe 470-440R series", "2935271588", "tren", "regional", "470/440R"),
    (2012, 4, "Renfe series 596 «Tamagochi»", "2919011987", "tren", "regional diésel", "596"),
    (2012, 8, "Renfe 594 series", "2942158843", "tren", "regional", "594"),
    (2013, 3, "TALGO Series VII", "3222243488", "tren", "Talgo VII", "Talgo 7"),
    (2014, 5, "RENFE S130 series", "3234258983", "tren", "híbrido AVE", "S130"),
    (2015, 2, "Mercedes-Benz Citaro C2", "2027045851", "bus", "urbano", "Citaro C2"),
    (2015, 3, "Mercedes-Benz Citaro C2 (G)", "2028364492", "bus", "articulado", "Citaro G"),
    (2016, 6, "ALSA Mercedes-Benz Tourismo M", "2899510083", "bus", "largo", "Tourismo M ALSA"),
    (2017, 4, "Airbus A319/A320/A321 Dependencies", "2614178153", "avion", "deps", "dependencias Airbus"),
    (2017, 5, "Airbus A319/A320/A321 Vueling", "2920780038", "avion", "lowcost", "Vueling"),
    (2018, 2, "Airbus A319/A320 Volotea", "2904499625", "avion", "regional", "Volotea"),
    (2018, 8, "TGV-D Ouigo Spain", "2315692111", "tren", "lowcost AV", "Ouigo"),
    (2019, 4, "EuroDual Concept Renfe", "2287986592", "tren", "híbrida mercancías", "EuroDual"),
    (2020, 6, "S109 IRYO", "2769164305", "tren", "AV competencia", "Iryo S109"),
    (2021, 3, "Renfe S114", "2903033220", "tren", "Avant", "S114"),
    (2022, 5, "Advanced modular harbour", "2914927626", "infra", "puertos", "muelles modulares"),
    (2023, 8, "UT435", "3045890614", "tren", "cercanías histórica/rehab", "UT435"),
    (2024, 4, "Renfe Serie 453", "3147129614", "tren", "cercanías nueva", "453"),
    (2025, 1, "Spanish Light Signals (MZA, NORTE, RENFE and ADIF)", "3147762742", "infra", "señales luminosas", "ADIF moderno"),
    (2030, 6, "Frecciarossa 1000", "2008905054", "tren", "AV internacional", "usar en corredores EU si falta material"),
    (2040, 1, "TGV-Duplex & TGV-RD", "1976692437", "tren", "AV Francia", "enlaces Toulouse/Perpiñán"),
]

# Vehículos vanilla / genéricos por modo cuando aún no hay mod
VANILLA_FALLBACK = {
    "bus": "Autobús de época del juego (vanilla) hasta disponer de mod español",
    "camion": "Camión de época vanilla / 40 ton truck - Spanish brands cuando exista",
    "barco": "Barco de vapor / vapor costero vanilla; luego ferry moderno vanilla",
    "avion": "Avión de época vanilla hasta IBERIA: historical fleet (1933)",
    "tranvia": "Tranvía de época vanilla hasta Citadis / packs urbanos",
    "metro": "Unidad de metro vanilla / cercanías eléctrica adaptada",
}


def mods_for_month(year: int, month: int):
    out = []
    for m in CORE_MODS:
        if m["when"] == (year, month):
            out.append(m)
    for item in FLEET:
        y, mo, name, wid, mode, role, stats = item
        if y == year and mo == month:
            out.append({
                "name": name,
                "id": wid,
                "mode": mode,
                "role": role,
                "stats": stats,
                "when": (y, mo),
            })
    return out


def fleet_introduced_before(year: int, month: int):
    prev = []
    for item in FLEET:
        y, mo, name, wid, mode, role, stats = item
        if (y, mo) < (year, month):
            prev.append(item)
    return prev
