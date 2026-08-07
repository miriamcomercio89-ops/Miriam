"""Volumes 12-16: Rosewood, March Ridge, Muldraugh, West Point, Valley Station."""

from __future__ import annotations

from pdf_engine import GuidePDF
from buildings import house, poi, residential_block, numbered_units, SHOP_ROOMS, WAREHOUSE_ROOMS, HOUSE_ROOMS_GARAGE
from theme import mm
from map_data import LOOT_BY_VOLUME


def vol_12_rosewood(path: str):
    pdf = GuidePDF(path, "12", "Rosewood + Kentucky State Penitentiary",
                   "North Main St · Rosewood Rd #2838 · Flaherty · Fiddler's Trail · BA-4")
    pdf.cover("VOLUMEN 12 — ROSEWOOD",
              ["Calles: North Main St, Rosewood Rd, Flaherty Rd, Justice Rd, Angel Rd…",
               "Fossoil 2838 Rosewood Rd ~8312x12218",
               "Fire Station BA-4 · Police frente FD ~8063x11737",
               "Prisión completa ala por ala"],
              {"Riesgo": "Bajo pueblo / Extremo prisión"})

    pdf.h1("Orden Rosewood")
    pdf.sector_map_schematic("Rosewood — calles reales",
        [["N Main N", "→", "FIRE", "PD", "→"],
         ["↓", "Town Hall", "→", "School", "→"],
         ["W res", "→", "Centro", "→", "E res"],
         ["Rosewood Rd", "→", "Fossoil S", "→", "Fiddler"],
         ["→", "PRISON ROAD", "→", "PENITENTIARY", "OK"]],
        "Pueblo completo ANTES de la prisión. Fossoil sur en Rosewood Rd.")
    pdf.h2("Calles documentadas (Street_names)")
    pdf.checkbox_grid([
        "North Main St.", "Rosewood Rd.", "Flaherty Rd.", "Fiddler's Trail (US-60 local)",
        "Angel Rd.", "Buck St.", "Justice Rd.", "Doctors Ln.", "Cartwheel St.",
        "Heartbreak Rd.", "Hamshank Rd.", "Mortimer St.", "Quiet Rd.", "Frederick Ln.",
    ], cols=2)
    pdf.loot_critical("12", LOOT_BY_VOLUME["12"])

    pdf.h1("Residencial")
    for name, pref, x, y, n in [
        ("Norte", "RW-N", 8400, 11350, 14),
        ("Oeste", "RW-W", 8200, 11550, 14),
        ("Este", "RW-E", 8700, 11550, 14),
        ("Sur", "RW-S", 8400, 11750, 16),
        ("Centro residencial", "RW-C", 8450, 11520, 10),
    ]:
        pdf.street_header(f"Rosewood residencial {name}", "impar→par", "bajo", pref)
        for b in residential_block(pref, f"Rosewood {name}", "mixto", 1, n, x, y, 13, 11, "bajo"):
            pdf.building_card(b)

    pdf.h1("POIs del pueblo")
    for b in [
        poi("RW-FIRE", "Fire Station Rosewood (BA-4)", "8450x11500", "Bomberos", "medio",
            ["Garage camiones", "Lockers", "Dormitorio/camas", "Kitchen", "Tower", "Yard"],
            "Una de las mejores bases vanilla. Instala BA-4 aquí."),
        poi("RW-PD", "Police Station Rosewood", "8470x11500", "Policía", "alto",
            ["Entrada", "Oficinas", "Armería", "Celdas", "Parking"],
            "Armas/ammo. Frente a fire station en layout clásico; confirma 42.20."),
        poi("RW-SCHOOL", "Schoolhouse / escuela", "8500x11650", "Escuela", "medio",
            ["Aulas", "Office", "Library", "Gimnasio si hay"], "Libros."),
        poi("RW-THALL", "Town Hall", "8420x11580", "Ayuntamiento", "medio",
            ["Lobby", "Oficinas", "Records", "Baños"], "Redesign 42.20 landmark."),
        poi("RW-GAS", "Gasolinera Rosewood", "8380x11480", "Gasolinera", "medio",
            ["Bombas", "Tienda"], "Map: Rosewood"),
        poi("RW-FOOD", "Grocery / Giga / food", "8520x11540", "Comida", "alto",
            ["Pasillos", "Almacén"], ""),
        poi("RW-BOOK", "Books / misc shops", "8480x11560", "Comercio", "medio", SHOP_ROOMS, ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("RW-ST", "Local Rosewood", 12, 8440, 11570, "medio", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h2("BA-4 checklist")
    pdf.checkbox_grid(["Camas fire station", "Stash tools/weapons", "Van en garage",
                       "Generator plan", "Nota BASE-4 FIRE", "Pueblo Rosewood OK"])

    pdf.h1("Kentucky State Penitentiary — limpiezala por ala")
    pdf.callout("PELIGRO MÁXIMO DEL SUR",
                "No entres sin: arma melee alta, backup firearm, chaleco si hay, 2 días de comida, "
                "sheet ropes, y BA-4 operativa. Limpia en sesiones cortas. Nunca dispares dentro si puedes evitarlo.")
    pdf.sector_map_schematic("Prisión",
        [["PARKING", "ADMIN", "VISIT"],
         ["YARD N", "CELL A", "CELL B"],
         ["YARD S", "CELL C", "CELL D"],
         ["INFIRM", "KITCHEN", "WORKSHOP"],
         ["SOLITARY", "LAUNDRY", "WAREHOUSE"]],
        "Orden: Parking→Admin→Visit→Yards→Cells A-D→servicios→solitary.")

    prison = [
        ("RW-P-PARK", "Parking / perimeter gates", ["Gate exterior", "Parking", "Torre vista", "Perímetro muro"]),
        ("RW-P-ADMIN", "Administration", ["Lobby", "Offices", "Records", "Warden", "Armory admin"]),
        ("RW-P-VISIT", "Visitation", ["Sala visitas", "Lockers", "Baños", "Control"]),
        ("RW-P-YARDN", "Yard norte", ["Yard abierto", "Bleachers", "Corner towers"]),
        ("RW-P-YARDS", "Yard sur", ["Yard abierto", "Rec corner", "Access doors"]),
        ("RW-P-CELLA", "Cell block A", ["Pasillo A1", "Celdas A1-A20", "Pasillo A2", "Celdas A21-A40", "Guard post"]),
        ("RW-P-CELLB", "Cell block B", ["Pasillo B1", "Celdas B1-B20", "Pasillo B2", "Celdas B21-B40", "Guard post"]),
        ("RW-P-CELLC", "Cell block C", ["Pasillo C1", "Celdas C1-C20", "Pasillo C2", "Celdas C21-C40", "Guard post"]),
        ("RW-P-CELLD", "Cell block D", ["Pasillo D1", "Celdas D1-D20", "Pasillo D2", "Celdas D21-D40", "Guard post"]),
        ("RW-P-INF", "Infirmary", ["Sala espera", "Camas", "Storage meds", "Office"]),
        ("RW-P-KIT", "Kitchen / mess", ["Cocina", "Despensa", "Comedor", "Freezers"]),
        ("RW-P-WORK", "Workshop", ["Taller", "Tools", "Storage"]),
        ("RW-P-SOL", "Solitary", ["Pasillo", "Celdas solitarias", "Control"]),
        ("RW-P-LAUN", "Laundry", ["Lavandería", "Storage"]),
        ("RW-P-WH", "Warehouse / loading", WAREHOUSE_ROOMS),
    ]
    for bid, name, rooms in prison:
        pdf.building_card(poi(bid, name, "8600x11700", "Prisión", "extremo", rooms,
                              "Marca cada ala en muro con spray L + código."))
    pdf.h2("Celdas — checklist ultra")
    cells = [f"Celda {block}{n:02d}" for block in "ABCD" for n in range(1, 41)]
    pdf.checkbox_grid(cells, cols=4)

    pdf.h1("Cierre Vol 12")
    pdf.checkbox_grid(["Rosewood pueblo OK", "BA-4 OK", "Prisión 100% celdas",
                       "ROSEWOOD+PRISON OK", "Listo March Ridge"])
    pdf.save()


def vol_13_march(path: str):
    pdf = GuidePDF(path, "13", "March Ridge — pueblo militar residencial",
                   "Centro ~9921x12603 · Fiddler's Trail access · Pharmahug")
    pdf.cover("VOLUMEN 13 — MARCH RIDGE",
              ["Layout housing militar", "Pharmahug ~10143x12752",
               "Acceso vía Fiddler's Trail desde Dixie Hwy", "Business district compacto"],
              {"Riesgo": "Medio"})
    pdf.sector_map_schematic("March Ridge",
        [["Fiddler", "→", "Gate/N", "→", "Housing N"],
         ["↓", "Food/Pharm", "→", "BD", "→"],
         ["Housing S", "→", "Housing E", "→", "OK"]],
        "Housing completo antes del business district denso.")
    pdf.loot_critical("13", LOOT_BY_VOLUME["13"])

    pdf.h1("Residencial / military housing")
    for b in residential_block("MR-R1", "March Ridge housing 1", "norte", 1, 16, 9800, 12450, 12, 10, "medio"):
        pdf.building_card(b)
    for b in residential_block("MR-R2", "March Ridge housing 2", "sur", 1, 16, 9800, 12700, 12, 10, "medio"):
        pdf.building_card(b)
    for b in residential_block("MR-R3", "March Ridge housing 3", "este", 1, 12, 10100, 12600, 12, 10, "medio"):
        pdf.building_card(b)

    pdf.h1("Business district compacto")
    for b in numbered_units("MR-BD", "Local March Ridge", 14, 9900, 12600, "alto", "Local", SHOP_ROOMS):
        pdf.building_card(b)
    for b in [
        poi("MR-GAS", "Gas March Ridge", "9950x12550", "Gasolinera", "medio", ["Bombas", "Tienda"], "Map: March Ridge"),
        poi("MR-FOOD", "Food / grocery", "9980x12620", "Comida", "alto", ["Pasillos", "Almacén"], ""),
        poi("MR-COM", "Community / office", "9920x12640", "Servicio", "medio", ["Lobby", "Oficinas"], ""),
    ]:
        pdf.building_card(b)

    pdf.h1("Cierre Vol 13")
    pdf.checkbox_grid(["Housing OK", "Business OK", "MARCH RIDGE TOTAL OK", "Listo Muldraugh"])
    pdf.save()


def vol_14_muldraugh(path: str):
    pdf = GuidePDF(path, "14", "Muldraugh + Dixie — eje central",
                   "Dixie Hwy · Wilson St PD · Old Mill Rd · Garnettsville · BA-5")
    pdf.cover("VOLUMEN 14 — MULDRAUGH",
              ["Eje Dixie Highway · Fossoil 119 Dixie Hwy ~10625x9762",
               "PD 230 Wilson St ~10636x10408 · Old Mill Rd a McCoy/Fallas",
               "Gun store / Sunstar · Cortman · warehouses norte BA-5",
               "Dixie Mobile Park @ Riverside Rd / Tioga Rd"],
              {"Riesgo": "Medio-Alto"})

    pdf.h1("Doctrina Muldraugh")
    pdf.p(
        "Pueblo largo norte-sur. Limpia en <b>bandas horizontales</b> (oeste→este) bajando o subiendo "
        "la highway. No limpies solo la carretera y dejes traseros llenos: la migración te castiga."
    )
    pdf.sector_map_schematic("Muldraugh — ejes reales",
        [["McCoy W", "→", "Old Mill", "→", "N IND BA-5"],
         ["↓", "N res", "→", "Dixie N", "→"],
         ["W.Garnettsville", "→", "Centro", "→", "Wilson PD"],
         ["↓", "S res", "→", "Fossoil 119", "→"],
         ["KY-60 pileup", "→", "DIXIE PARK", "Riverside Rd", "OK"]],
        "Sur→Centro→Norte. McCoy por Old Mill Rd. Dixie park al norte hacia WP.")
    pdf.h2("Calles / ejes documentados")
    pdf.checkbox_grid([
        "Dixie Highway (31W)", "Wilson St.", "Old Mill Road", "W. Garnettsville Road",
        "Riverside Road (a Dixie park)", "Tioga Road", "KY-60 interchange sur",
    ], cols=2)
    pdf.loot_critical("14", LOOT_BY_VOLUME["14"])

    # South to north residential bands
    for label, pref, x, y, n, risk in [
        ("Banda Sur residencial O/E", "MU-S", 11000, 10200, 20, "medio"),
        ("Banda Centro-sur", "MU-CS", 11000, 9900, 18, "medio"),
        ("Banda Centro", "MU-C", 11000, 9700, 18, "alto"),
        ("Banda Centro-norte", "MU-CN", 11000, 9500, 16, "medio"),
        ("Banda Norte residencial", "MU-N", 11000, 9300, 16, "medio"),
    ]:
        pdf.h1(label)
        for b in residential_block(pref, label, "ambos lados HWY", 1, n, x, y, 16, 0, risk):
            pdf.building_card(b)

    pdf.h1("POIs clave Muldraugh")
    for b in [
        poi("MU-GAS-S", "Gas sur / strip", "11150x10100", "Gasolinera", "medio", ["Bombas", "Tienda"], ""),
        poi("MU-GAS-N", "Gas norte", "11200x9400", "Gasolinera", "medio", ["Bombas", "Tienda"], ""),
        poi("MU-SPIF", "Spiffo's", "11180x9750", "Restaurante", "medio", ["Comedor", "Cocina", "Trastero"], ""),
        poi("MU-CORT", "Cortman Medical", "11220x9680", "Clínica", "alto",
            ["Recepción", "Consultas", "Storage meds"], "Meds críticos."),
        poi("MU-PD", "Muldraugh Police Department", "11160x9800", "Policía", "alto",
            ["Entrada", "Oficinas", "Armería", "Celdas"], "Firearms."),
        poi("MU-GUN", "Sunstar / gun store zone", "11240x9600", "Armería comercial", "extremo",
            ["Escaparate", "Sala ventas", "Trastero armas", "Parking"],
            "Uno de los POIs más peligrosos fuera de Louisville. Aísla y limpia en silencio."),
        poi("MU-FOOD", "Grocery / food stores", "11190x9720", "Comida", "alto", ["Pasillos", "Almacén"], ""),
        poi("MU-BOOK", "Books / shops strip", "11170x9740", "Comercio", "medio", SHOP_ROOMS, ""),
        poi("MU-HOTEL", "Hotel / motel", "11210x9650", "Hotel", "alto",
            ["Recepción", "Pasillos", "Habitaciones"], ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("MU-ST", "Local Muldraugh", 20, 11160, 9760, "alto", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("McCoy Logging + industrial norte")
    for b in [
        poi("MU-MCCOY", "McCoy Logging Warehouse", "10300x9400", "Logging", "alto",
            WAREHOUSE_ROOMS + ["Yard troncos", "Office McCoy"], "Tools, generators, gas."),
        poi("MU-WIND", "Warehouses norte (BA-5 candidata)", "11050x9200", "Warehouse", "alto",
            WAREHOUSE_ROOMS, "Elige una nave defendible como BA-5."),
    ]:
        pdf.building_card(b)
    for b in numbered_units("MU-WH", "Warehouse Muldraugh", 10, 10900, 9150, "alto", "Nave", WAREHOUSE_ROOMS):
        pdf.building_card(b)

    pdf.h1("BA-5")
    pdf.building_card(poi("MU-BA5", "BA-5 North warehouse", "11050x9180", "Base", "medio",
                          ["Nave stash", "Esquina cama", "Parking 2 vehículos", "Generator corner"],
                          "Nota BASE-5 MULD-N"))

    pdf.h1("Dixie Trailer Park")
    pdf.street_header("Dixie", "Office → filas de trailers", "bajo", "Sur de Muldraugh en Dixie Highway")
    pdf.building_card(poi("DX-OFF", "Dixie office central", "11650x8800", "Oficina", "medio",
                          ["Office", "Storage"], "Ajusta coords con mapa B42 si diverge."))
    for b in numbered_units("DX-T", "Trailer Dixie", 24, 11620, 8850, "bajo", "Caravana",
                            ["Entrada", "Interior", "Exterior"]):
        pdf.building_card(b)

    pdf.h1("Cierre Vol 14")
    pdf.checkbox_grid(["Bandas residenciales OK", "POIs OK", "Gun store OK", "McCoy OK",
                       "Warehouses OK", "BA-5 OK", "Dixie 24/24", "MULDRAUGH+DIXIE OK", "Listo West Point"])
    pdf.save()


def vol_15_westpoint(path: str):
    pdf = GuidePDF(path, "15", "West Point — limpieza total",
                   "Main St · 2nd–10th St · Clarke Way · Fossoil 205 Second St · BA-6")
    pdf.cover("VOLUMEN 15 — WEST POINT",
              ["Calles: Main St, 2nd–10th St, Clarke Way, Church St…",
               "Fossoil 205 Second St ~12078x7142 · Police ~11902x6945",
               "GigaMart · gun store · Pharmahug · AMZ steel",
               "BA-6 periferia oeste"],
              {"Riesgo": "Alto", "Estilo": "Máximo silencio"})

    pdf.callout("ALERTA MIGRACIÓN",
                "West Point es donde más se castiga disparar. Si abres fuego, puedes recontaminar "
                "manzanas enteras. Melee + kite. Opera desde BA-6 en la periferia, no desde el centro.")
    pdf.sector_map_schematic("West Point — calles",
        [["RÍO", "RÍO", "RÍO", "RÍO"],
         ["BA-6 W", "→", "Main St", "→"],
         ["↓", "3rd/PD", "→", "GIGA/GUN"],
         ["2nd/Fossoil", "→", "Clarke Way", "→"],
         ["AMZ E", "→", "School", "OK"]],
        "BA-6 primero. Main St núcleo. 2nd St sur = Fossoil.")
    pdf.h2("Calles documentadas")
    pdf.checkbox_grid([
        "Main St.", "2nd St.", "3rd St.", "4th St.", "5th St.", "6th St.",
        "7th St.", "8th St.", "9th St.", "10th St.", "Clarke Way", "Church St.",
        "Bulletin St.", "Cabin Rd.", "Dixie Highway",
    ], cols=3)
    pdf.loot_critical("15", LOOT_BY_VOLUME["15"])

    pdf.h1("BA-6 primero")
    pdf.building_card(house("WP-BA6", "BA-6 Casa periferia oeste West Point", "11200x6900", "medio", "2", True, True,
                            "Establece BA-6 ANTES de abrir el centro. Stash + cama + van + huida."))

    pdf.h1("Residencial por cuadrantes")
    for label, pref, x, y, n in [
        ("SO residencial", "WP-SW", 11350, 7100, 18),
        ("SE residencial", "WP-SE", 11750, 7100, 18),
        ("NO residencial", "WP-NW", 11350, 6700, 16),
        ("NE residencial", "WP-NE", 11750, 6700, 16),
        ("Centro residencial", "WP-CR", 11550, 6950, 14),
    ]:
        pdf.h1(label)
        for b in residential_block(pref, label, "manzana", 1, n, x, y, 12, 10, "alto"):
            pdf.building_card(b)

    pdf.h1("Comercial / POIs")
    for b in [
        poi("WP-GIGA", "GigaMart West Point", "11620x6800", "Supermercado", "extremo",
            ["Parking", "Front", "Pasillos A-D", "Almacén", "Loading"], "Trip loot a BA-6."),
        poi("WP-GUN", "Gun store West Point", "11600x6850", "Armería", "extremo",
            ["Entrada", "Ventas", "Trastero"], "Endgame prep."),
        poi("WP-HW", "Hardware", "11540x6880", "Ferretería", "alto", SHOP_ROOMS, ""),
        poi("WP-GAS-N", "Gas norte + strip", "11500x6700", "Gasolinera", "alto", ["Bombas", "Tienda", "Strip shops"], ""),
        poi("WP-SCHOOL", "Secondary school", "11700x7000", "Escuela", "alto",
            ["Alas aulas", "Gimnasio", "Library", "Parking"], "Books + possible firearms."),
        poi("WP-BANK", "Bank / offices", "11580x6920", "Oficinas", "alto", ["Lobby", "Oficinas", "Vault area"], ""),
        poi("WP-BAR", "Sunset Bar / hostelería", "11520x6900", "Bar", "alto", ["Salón", "Barra", "Trastero"], "Landmark 42.20."),
        poi("WP-ART", "Art gallery", "11640x6930", "Galería", "medio", ["Salas", "Storage"], "Landmark 42.20."),
        poi("WP-AMZ", "AMZ steel factory", "11850x7050", "Industria", "extremo",
            WAREHOUSE_ROOMS + ["Planta acero", "Yard"], "Identidad industrial WP."),
        poi("WP-PHARM", "Pharmacy / medical", "11560x6940", "Farmacia", "alto", SHOP_ROOMS, ""),
        poi("WP-PD", "Police West Point (si aplica)", "11590x6960", "Policía", "extremo",
            ["Entrada", "Armería", "Celdas"], ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("WP-ST", "Local West Point", 24, 11560, 6910, "alto", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("Riverfront West Point")
    for b in numbered_units("WP-RF", "Riverfront WP", 12, 11500, 6600, "alto", "Edificio orilla",
                            ["Orilla", "Interior", "Muelle"]):
        pdf.building_card(b)

    pdf.h1("Cierre Vol 15")
    pdf.checkbox_grid(["BA-6 OK", "Cuadrantes res OK", "GigaMart OK", "Gun store OK",
                       "School OK", "AMZ OK", "Riverfront OK", "WEST POINT TOTAL OK", "Listo Valley Station"])
    pdf.save()


def vol_16_valley(path: str):
    pdf = GuidePDF(path, "16", "Valley Station + acceso a Louisville",
                   "Dixie Hwy · Caroline Staunton / Bearcamp / Salt River · Fossoil VS · BA-7")
    pdf.cover("VOLUMEN 16 — VALLEY STATION",
              ["Centro ~13056x6031", "Fossoil Valley Station ~12693x6534",
               "Enlaces: Caroline Staunton Rd, Bearcamp Rd, Salt River Rd, Cub Rd→Mall",
               "BA-7 + prep mapas Louisville 1-9"],
              {"Riesgo": "Alto", "Siguiente": "Louisville Vol 17"})
    pdf.sector_map_schematic("Valley Station → LV",
        [["WP OK", "→", "Dixie N", "→", "Fossoil VS"],
         ["↓", "VS res", "→", "BA-7", "→"],
         ["Salt River", "→", "Exclusion", "→", "LV gates"],
         ["Cub Rd", "→", "Mall approach", "→", "Vol17"]],
        "No entres a Louisville sin loot crítico 16.")
    pdf.loot_critical("16", LOOT_BY_VOLUME["16"])

    pdf.h1("Valley Station limpieza")
    for b in residential_block("VS-R", "Valley Station residencial", "pueblo", 1, 20, 12900, 6000, 14, 12, "alto"):
        pdf.building_card(b)
    for b in [
        poi("VS-GAS", "Gas / rest corridor", "13050x6100", "Gasolinera", "alto", ["Bombas", "Tienda"], ""),
        poi("VS-SHOP", "Shops Valley Station", "13080x6030", "Comercio", "alto", SHOP_ROOMS, ""),
        poi("VS-WH", "Warehouses / roadside", "13150x6200", "Nave", "alto", WAREHOUSE_ROOMS, ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("VS-ST", "Local VS", 12, 13040, 6050, "alto", "Local", SHOP_ROOMS):
        pdf.building_card(b)
    for b in numbered_units(
        "VS-RD",
        "Roadside POI a Louisville",
        10,
        13200,
        5600,
        "alto",
        "POI",
        ["Exterior", "Interior"],
    ):
        pdf.building_card(b)

    pdf.h1("BA-7 y preparación Louisville")
    pdf.building_card(house("VS-BA7", "BA-7 Edge / Valley Station", "13100x5900", "alto", "2", True, True,
                            "Última base antes del muro. Stock masivo de melee, ammo, food, gas, sprays."))
    pdf.h2("Checklist de invasión Louisville")
    pdf.checkbox_grid([
        "West Point OK", "Valley Station OK", "2 vehículos full gas",
        "Reparaciones mechanics OK", "Armas melee 100% condition set",
        "Firearm + ammo solo emergencia", "Meds stock", "Spray 10+ latas",
        "Skillbooks key leídos", "Mapas Louisville 1-9 buscados",
        "Regla silencio aceptada", "Vol 17 listo",
    ])
    pdf.save()
