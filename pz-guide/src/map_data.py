"""Map-faithful Knox Country data (PZwiki / B42 street fliers / POI coords).

Counts for Riverside suburbs (70) + gated (34) come from PZwiki Riverside.
Street names from PZwiki Street_names (B42 fliers / in-game map).
Business coords from PZwiki Riverside business tables.
B42.20 redesigned building interiors as unique — verify overlays on
map.projectzomboid.com or b42map.com if a pin shifted slightly.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Riverside streets (PZwiki Street_names)
# ---------------------------------------------------------------------------
RIVERSIDE_STREETS = [
    "Alan Rd.", "Cemetary Dr.", "Cushion Ln.", "Dogwood Rd.", "Easter Ln.",
    "Fern Rd.", "Granite St.", "Grove St.", "Higgs St.", "Ivan Rd.",
    "Kavanagh St.", "Kelly Dr.", "Kennedy St.", "Lakeshore Parkway",
    "Lemonscent Ln.", "Lincoln St.", "Long Branch Rd.", "Long Needle Rd.",
    "Main St.", "Maria Place", "Marvin Place", "Mary Court", "Mousetrap St.",
    "Nixon Ln.", "Ohio St.", "Olin Rd. (KY-163)", "Pine Court", "Pitts St.",
    "Rag Rd.", "Rock Ridge Rd.", "Rogers Ave.", "Sandy Rd.", "Sawyer Ln.",
    "Scenic Grove Rd.", "Station St.", "Summer Shade Rd.", "Sweet St.",
    "Sycamore Ln.", "Tidal Ln.", "Tim Cain Rd.", "Walnut St.", "Wilson Rd.",
]

# Known numbered addresses (fliers / wiki)
RIVERSIDE_ADDRESSES = {
    "Rock Ridge Rd. #160": ("6079x5304", "Fossoil / strip west"),
    "Rock Ridge Rd. #210": ("6084x5258", "Police Station approach"),
    "Rogers Ave. #15": ("6357x5311", "Nails & Nuts Tool Store"),
    "Kelly Dr. #8": ("6784x5329", "Gated community — flier block party"),
    "Long Branch Rd. #3": ("5174x5525", "West outskirts"),
    "Long Needle Rd. #6650": ("5440x5967", "Near Scenic Grove / industrial"),
    "Olin Rd. #739": ("5681x5747", "KY-163 south corridor"),
    "Olin Rd. #740": ("5579x5929", "KY-163 near factory"),
    "Lakeshore Parkway": ("5674x6489", "West Maple Country Club area"),
    "Wilson Rd. #575": ("4214x6264", "Far west corridor"),
    "Main St. / Rock Ridge": ("6125x5304", "Business district axis"),
}

# Wiki count — treat as target checkboxes (B42.20: confirm on Streets overlay)
RIVERSIDE_HOUSE_COUNT_SUBURBS = 70
RIVERSIDE_HOUSE_COUNT_GATED = 34

# Suburb house distribution by real streets (sums to 70)
# Geography: south of strip, west of gated fence, north of Olin industrial bend
RIVERSIDE_SUBURB_STREETS = [
    # Sector S-A — spawn / courts south-center (19)
    {"sector": "S-A", "street": "Pine Court", "houses": 5, "route": "Cul-de-sac: entrada → fondo → retorno", "risk": "bajo", "anchor": "6300x5600"},
    {"sector": "S-A", "street": "Mary Court", "houses": 5, "route": "Cul-de-sac horario", "risk": "bajo", "anchor": "6320x5620"},
    {"sector": "S-A", "street": "Marvin Place", "houses": 5, "route": "Norte→Sur, ambos lados", "risk": "bajo", "anchor": "6280x5580"},
    {"sector": "S-A", "street": "Maria Place", "houses": 4, "route": "Loop corto", "risk": "bajo", "anchor": "6260x5610"},
    # Sector S-B — west residential (17)
    {"sector": "S-B", "street": "Walnut St.", "houses": 5, "route": "Oeste→Este, lado norte luego sur", "risk": "bajo", "anchor": "6150x5550"},
    {"sector": "S-B", "street": "Granite St.", "houses": 4, "route": "Paralela a Walnut", "risk": "bajo", "anchor": "6120x5580"},
    {"sector": "S-B", "street": "Cemetary Dr.", "houses": 4, "route": "Hacia cementerio oeste", "risk": "bajo", "anchor": "5800x5350"},
    {"sector": "S-B", "street": "Ohio St.", "houses": 4, "route": "Eje local oeste", "risk": "bajo", "anchor": "6000x5500"},
    # Sector S-C — east toward gated OUTSIDE fence (11)
    {"sector": "S-C", "street": "Kennedy St.", "houses": 4, "route": "Hasta ver valla gated — NO entrar", "risk": "medio", "anchor": "6550x5450"},
    {"sector": "S-C", "street": "Lincoln St.", "houses": 4, "route": "Paralela a Kennedy", "risk": "medio", "anchor": "6580x5480"},
    {"sector": "S-C", "street": "Kavanagh St.", "houses": 3, "route": "Frontera este suburbios", "risk": "medio", "anchor": "6620x5500"},
    # Sector S-E — south-center (9)
    {"sector": "S-E", "street": "Grove St.", "houses": 3, "route": "Sur del colegio", "risk": "bajo", "anchor": "6400x5550"},
    {"sector": "S-E", "street": "Sweet St.", "houses": 3, "route": "Residencial sur-centro", "risk": "bajo", "anchor": "6380x5580"},
    {"sector": "S-E", "street": "Sycamore Ln.", "houses": 3, "route": "Lane sur", "risk": "bajo", "anchor": "6420x5600"},
    # Sector S-D — southwest / Olin approach (4)
    {"sector": "S-D", "street": "Dogwood Rd.", "houses": 2, "route": "Hacia Olin Rd.", "risk": "medio", "anchor": "5900x5700"},
    {"sector": "S-D", "street": "Fern Rd.", "houses": 2, "route": "Sur-oeste", "risk": "medio", "anchor": "5850x5750"},
    # Sector S-F/G — remaining (10)
    {"sector": "S-F", "street": "Summer Shade Rd.", "houses": 2, "route": "Sur-este", "risk": "bajo", "anchor": "6480x5750"},
    {"sector": "S-F", "street": "Easter Ln.", "houses": 2, "route": "Lane este-sur", "risk": "bajo", "anchor": "6500x5700"},
    {"sector": "S-G", "street": "Sandy Rd.", "houses": 2, "route": "Extensión sur", "risk": "medio", "anchor": "6200x5850"},
    {"sector": "S-G", "street": "Sawyer Ln.", "houses": 2, "route": "Extensión sur", "risk": "medio", "anchor": "6250x5900"},
    {"sector": "S-G", "street": "Nixon Ln.", "houses": 2, "route": "Lane sur", "risk": "bajo", "anchor": "6350x5800"},
]

# Gated: 34 houses — Kelly Dr confirmed; interiors labeled by loop order
RIVERSIDE_GATED_STREETS = [
    {"street": "Kelly Dr.", "houses": 12, "route": "Calle principal gated; #8 = 6784x5329", "risk": "alto", "anchor": "6784x5329"},
    {"street": "Gated Loop Norte (interior)", "houses": 8, "route": "Anillo interior norte horario", "risk": "alto", "anchor": "6720x5280"},
    {"street": "Gated Loop Sur (interior)", "houses": 8, "route": "Anillo interior sur antihorario", "risk": "alto", "anchor": "6720x5480"},
    {"street": "Gated Centro (BA-1 zone)", "houses": 6, "route": "Manzanas centrales — elige BA-1", "risk": "medio", "anchor": "6770x5320"},
]

RIVERSIDE_BUSINESSES = [
    # Community
    ("RV-PD", "Police Station", "Policía", "6081x5261", "210 Rock Ridge Rd.", "alto",
     ["Entrada", "Oficinas", "Celdas", "Storage/armory", "Parking"], "Firearms (únicas fiables del pueblo)"),
    ("RV-MAIL", "U.S. Mail Service", "Correos", "6315x5265", "Business strip", "medio",
     ["Zona pública", "Sorting", "Almacén", "Oficina"], "Candidata base temporal"),
    ("RV-SCHOOL", "School (Riverside)", "Escuela", "6443x5441", "Sur del strip (~6440x5450)", "alto",
     ["Parking", "Halls", "Aulas", "Library", "Clinic", "Gimnasio"], "Libros + clinic"),
    ("RV-CHURCH", "Church", "Iglesia", "6556x5308", "Este strip", "medio", ["Nave", "Trastienda"], ""),
    ("RV-CEM", "Cemetery", "Cementerio", "5710x5334", "Oeste", "bajo", ["Perímetro", "Capilla si hay"], "Patrulla errantes"),
    # Retail strip / named
    ("RV-ENIGMA", "Enigma Books", "Librería", "6429x5265", "Strip norte", "medio",
     ["Estanterías", "Mostrador", "Trastero"], "Skillbooks prioritarios"),
    ("RV-SAUCY", "Saucy", "Ropa", "6397x5266", "Strip", "medio", ["Tienda", "Trastero"], ""),
    ("RV-GIGA", "GigaMart", "Supermercado", "6515x5350", "Borde suburbios/comercial", "alto",
     ["Parking", "Pasillos", "Almacén", "Loading"], "Comida masiva"),
    ("RV-GOFLASH", "Go Flash", "Foto", "6191x5346", "Strip", "medio", ["Tienda", "Lab"], ""),
    ("RV-HIT", "Hit Vids!", "Vídeo", "6208x5344", "Strip", "medio", ["Tienda", "Trastero"], "VHS"),
    ("RV-LIQUOR", "Liquorty-Split", "Licorería", "6189x5368", "Strip", "medio", ["Tienda", "Almacén"], "Molotovs"),
    ("RV-HAIR", "Hair O Genesis", "Peluquería", "6411x5266", "Strip", "bajo", ["Salón", "Trastero"], ""),
    ("RV-NOURISH", "Nourish Food Mart", "Grocery", "6265x5264", "Strip", "medio", ["Pasillos", "Almacén"], ""),
    ("RV-PALM", "Palm Travel", "Agencia", "6421x5265", "Strip", "bajo", ["Oficina"], ""),
    ("RV-SEAT", "Seat Yourself Furniture", "Muebles", "6241x5267", "Strip", "medio", ["Sala", "Almacén"], "Carpentry mats"),
    ("RV-SHEBA", "Sheba Jewellers", "Joyería", "6473x5266", "Strip", "medio", ["Tienda", "Safe/storage"], ""),
    ("RV-HUGO", "Hugo Plush", "Ropa", "6257x5268", "Strip", "bajo", ["Tienda"], ""),
    ("RV-T4S", "Time 4 Sport", "Deportes", "6259x5266", "Strip", "medio", ["Tienda", "Trastero"], "Melee/sport weapons"),
    ("RV-LOLA", "Lola Limon", "Ropa", "6505x5266", "Strip este", "bajo", ["Tienda"], ""),
    ("RV-SPIT", "Spitfire Fashion", "Ropa", "6360x5311", "Rogers Ave area", "bajo", ["Tienda"], ""),
    ("RV-NAILS", "Nails & Nuts Tool Store", "Ferretería", "6359x5327", "15 Rogers Ave.", "medio",
     ["Tools aisle", "Mostrador", "Trastero"], "Sledge/axe/tools/seeds/gen mags"),
    ("RV-FOODM", "Food market (west)", "Grocery", "5970x5390", "Oeste comercial", "medio", ["Tienda", "Almacén"], ""),
    ("RV-COIN", "Coin Op Laundromat", "Lavandería", "6413x5333", "Strip", "bajo", ["Sala", "Trastero"], ""),
    ("RV-LAUND2", "Laundromat (west)", "Lavandería", "5952x5388", "Oeste", "bajo", ["Sala"], ""),
    ("RV-GEN", "General store (west)", "General", "5970x5356", "Oeste", "medio", ["Tienda", "Trastero"], ""),
    ("RV-STRIP", "Strip mall block", "Strip mall", "6450x5298", "Este strip", "alto",
     ["Locales planta baja", "Traseras"], "Limpia local por local"),
    ("RV-CHIRO", "Back To The Nurture Chiropractic", "Clínica", "6190x5355", "Strip", "medio", ["Consulta", "Office"], ""),
    ("RV-CLOTH", "Clothing store (Riverside)", "Ropa", "6358x5298", "Strip", "bajo", ["Tienda"], ""),
    ("RV-GROC2", "Grocery store (Riverside)", "Grocery", "6343x5296", "Strip", "medio", ["Tienda", "Almacén"], ""),
    ("RV-BAIT", "Morris' Bait Shop", "Pesca", "5916x5243", "Riverfront oeste", "bajo", ["Tienda", "Storage"], "Fishing gear"),
    ("RV-FOSSOIL", "Fossoil", "Gasolinera", "6078x5305", "160 Rock Ridge Rd.", "medio",
     ["Bombas", "Tienda", "Trastero"], "Gas + maps"),
    ("RV-SLIM", "Slimtax Accounting", "Oficina", "6359x5318", "Rogers Ave", "bajo", ["Oficina"], ""),
    ("RV-BANK", "Knox Bank", "Banco", "6504x5301", "Strip este", "alto", ["Lobby", "Offices", "Storage"], ""),
    ("RV-PHARM", "Pharmahug", "Farmacia", "6468x5266", "Strip", "medio",
     ["Ventas", "Pharmacy storage"], "Meds críticos"),
    # Food / entertainment
    ("RV-DOTTY", "Dotty 4 Donuts", "Donuts", "6491x5223", "Norte", "medio", ["Tienda", "Cocina"], ""),
    ("RV-BURG", "Burgers", "Café", "5961x5260", "Oeste river", "medio", ["Comedor", "Cocina"], ""),
    ("RV-MAMA", "Mama McFudgington's", "Bakery", "6483x5266", "Strip", "medio", ["Tienda", "Cocina"], ""),
    ("RV-SWEET", "Sweet Pea Restaurant", "Restaurante", "6192x5341", "Strip", "medio", ["Comedor", "Cocina"], ""),
    ("RV-CREPE", "Pile o' Crepe", "Restaurante", "6396x5303", "Strip", "medio", ["Comedor", "Cocina"], ""),
    ("RV-SPIFF", "Spiffo's", "Fast food", "6128x5309", "Junto Fossoil", "medio", ["Comedor", "Cocina", "Trastero"], ""),
    ("RV-JIMMY", "Jimmy's", "Restaurante", "6445x5265", "Strip", "medio", ["Comedor", "Cocina"], ""),
    ("RV-RIP", "Riparian Entertainment", "Bar/rest", "6380x5206", "Riverfront", "alto", ["Salón", "Barra", "Trastero"], ""),
    ("RV-BAR", "Bar (Riverside)", "Bar", "5964x5416", "Oeste ~5960x5420", "medio", ["Salón", "Barra", "Storage"], ""),
    ("RV-CHURN", "Churns-R-Us", "Heladería", "6472x5217", "Norte", "bajo", ["Tienda"], ""),
    ("RV-SUITES", "Riverside Suites", "Hotel", "6365x5255", "Strip hotel ~6350x5250", "alto",
     ["Recepción", "Pasillos", "Habitaciones P1-P3", "Laundry", "Storage"], "Habitación = checkbox"),
    ("RV-BOAT", "Riverwood Boat Club", "Club", "6560x5215", "Este river", "medio", ["Clubhouse", "Muelle"], ""),
    # Industrial / outskirts
    ("RV-ALS", "Al's Auto Shop", "Taller", "5436x5950", "SO industrial", "alto",
     ["Bay", "Office", "Parts"], "Mechanics"),
    ("RV-WRECK", "Wrecking yard", "Desguace", "5839x5391", "Oeste río", "medio",
     ["Gate", "Filas coches", "Office", "Orilla"], "15-25 vehículos tip."),
    ("RV-USTORE", "U-Store It", "Trasteros", "5540x6055", "SO ~5530x6060", "medio",
     ["Office", "Pasillos units"], "Generator rolls posibles"),
    ("RV-LECTRO", "Lectromax Manufacturing", "Fábrica", "5568x5914", "SO", "alto",
     ["Factory floor", "Warehouse", "Offices", "Lockers"], "Tools/sledge/industrial"),
    ("RV-GASNMORE", "Gas N More", "Gas", "5429x5870", "Cerca factory", "medio", ["Bombas", "Tienda"], ""),
    ("RV-DINER-SO", "Diner (SO)", "Diner", "5425x5907", "Cerca factory", "medio", ["Comedor", "Cocina"], ""),
    ("RV-WMCC", "West Maple Country Club", "Country Club", "5772x6416", "Sur / Lakeshore Pkwy", "alto",
     ["Parking", "Main hall", "Gym", "Ballroom", "Lockers", "Bar", "Pro shop", "Greens"], "Rich zombies"),
]

# Critical loot by volume phase
LOOT_BY_VOLUME = {
    "01": [
        ("Bolsa / hiking bag", "Casas spawn", "Capacidad loot"),
        ("Arma melee (bate/axe/crowbar)", "Casas / garajes", "Combate silencioso"),
        ("Comida + agua 2 días", "Cocinas spawn", "No morir día 1"),
        ("Hammer + nails", "Garajes / sheds", "Barricadas"),
        ("Spray paint", "Garajes / sheds / tiendas", "Sistema de marcado"),
    ],
    "02": [
        ("Sheet rope ×2+", "Armarios residenciales", "Escapes BA"),
        ("Screwdriver + jack", "Garajes", "Coches"),
        ("Skillbook Carpentry 1-2", "Estanterías casas", "Bases"),
        ("Mapa Riverside", "Coches / gas later", "Navegación"),
        ("Semillas / farming basics", "Garajes / sheds", "Mid-game food"),
    ],
    "03": [
        ("Vehículo van/pickup", "Garajes gated", "Loot runs"),
        ("Vehículo huida rápido", "Garajes gated", "Emergencias"),
        ("Gas cans llenos", "Garajes mansiones", "Logística"),
        ("Tools set completo", "Garajes (todos tienen)", "Crafting"),
        ("Generator (si spawnea)", "Garajes / sheds", "BA-1 power"),
    ],
    "04": [
        ("Sledgehammer", "Nails & Nuts 6359x5327", "Entradas / muro"),
        ("Skillbooks (todos)", "Enigma Books 6429x5265", "XP largo plazo"),
        ("Antibiotics / painkillers", "Pharmahug 6468x5266", "Heridas"),
        ("Comida no perecedera masiva", "GigaMart 6515x5350", "Meses de stash"),
        ("Firearms + ammo", "Police 6081x5261", "Únicas fiables RV"),
        ("Gas + town map", "Fossoil 6078x5305", "Fuel cache G"),
        ("Melee sport", "Time 4 Sport 6259x5266", "Armas backup"),
        ("Fishing gear", "Morris' Bait 5916x5243", "Río Ohio"),
    ],
    "05": [
        ("Generator + parts", "U-Store It / Lectromax", "Power BA"),
        ("Welding / propane / metal", "Lectromax / wrecking yard", "Metalwork"),
        ("Car parts + mechanics XP", "Al's Auto + junkyard", "Flota"),
        ("Gas SO", "Gas N More 5429x5870", "Cache sur"),
        ("Rich loot / possible shotgun", "West Maple CC 5772x6416", "Bonus riesgo"),
    ],
    "06": [
        ("Fuel roadside", "Gas estaciones corredor", "Hacia Brandenburg"),
        ("Farming / animals gear", "Farms Long Branch / Olin", "B42 animals"),
        ("Radio/electronics", "Radio relay 4843x6280", "Misc"),
    ],
    "07": [
        ("Map: Brandenburg", "Gas / gloveboxes", "Navegación"),
        ("Nails & Nuts Brandenburg", "Pondview Shopping Center ~1943x6361", "Tools"),
        ("Fossoil 582 Boyd Rd", "2059x6425", "Fuel"),
        ("Police Brandenburg", "~2043x5978", "Armas"),
    ],
    "08": [
        ("Gas Fallas Lake", "Main street FL", "Fuel"),
        ("Police Fallas Lake", "~7252x8378", "Armas ligeras"),
        ("Lake food / fishing", "Instalaciones lago", "Food"),
    ],
    "09": [
        ("Farm supply / tools", "Echo Creek farm supply", "Animals/crops"),
        ("Chicken farm loot", "Este EC", "Food/animals"),
        ("Gas EC", "Pueblo", "Fuel sur-oeste"),
    ],
    "10": [
        ("Map: Ekron", "Gas/glovebox", "Nav"),
        ("Pharmahug Ekron", "~402x9870", "Meds"),
        ("Fossoil 104 Haysville Rd", "~649x9923", "Fuel"),
        ("Steelworks industrial loot", "Planta Ekron", "Metal/tools"),
    ],
    "11": [
        ("Map: Irvington", "Gas KY-79", "Nav"),
        ("Pharmahug Irvington", "~2475x14478", "Meds"),
        ("Fossoil Irvington", "~2525x14484", "Fuel"),
        ("Police Irvington", "~2485x13940", "Armas"),
        ("Speedway tools/parts", "Irvington Speedway", "Mechanics"),
    ],
    "12": [
        ("Fire Station gear + base", "Rosewood FD", "BA-4"),
        ("Police Rosewood armory", "~8063x11737 (frente FD)", "Guns"),
        ("Fossoil 2838 Rosewood Rd", "~8312x12218", "Fuel"),
        ("Prison armor / weapons", "Kentucky State Pen", "Endgame prep"),
        ("School books", "Rosewood school", "XP"),
    ],
    "13": [
        ("Map: March Ridge", "Gas/glovebox", "Nav"),
        ("Pharmahug March Ridge", "~10143x12752", "Meds"),
        ("Food Market MR", "Centro", "Food"),
        ("Police MR (si usas)", "Business district", "Guns"),
    ],
    "14": [
        ("Fossoil 119 Dixie Hwy", "~10625x9762", "Fuel"),
        ("Muldraugh PD 230 Wilson St", "~10636x10408", "Guns"),
        ("Gun store / Sunstar zone", "Muldraugh", "Firearms techo"),
        ("McCoy Logging tools/gen", "West of town", "Industrial"),
        ("Cortman Medical", "Muldraugh", "Meds"),
        ("Warehouse BA-5 stash", "Norte industrial", "Base"),
    ],
    "15": [
        ("Gun store West Point", "Downtown", "Armas"),
        ("GigaMart WP", "Downtown", "Food"),
        ("Fossoil 205 Second St", "~12078x7142", "Fuel"),
        ("Police WP", "~11902x6945", "Guns"),
        ("Pharmahug WP", "~11929x6804 area", "Meds"),
        ("Hardware WP", "Downtown", "Tools"),
        ("AMZ steel loot", "Industrial WP", "Metal"),
    ],
    "16": [
        ("Fossoil Valley Station", "~12693x6534", "Fuel pre-LV"),
        ("Mapas Louisville 1-9", "Gas/gloveboxes/zombies", "Nav ciudad"),
        ("Full repair kit + spare tires", "Talleres VS/WP", "No quedar tirado"),
        ("Stock meds/ammo 2 semanas", "BA-7", "Invasión"),
    ],
    "17": [
        ("Fossoil LV industrial / Rockford", "West LV pins", "Fuel"),
        ("Pawn / storage staging", "West pins", "BA-8"),
        ("Quiet melee kit spares", "Residencial oeste", "Silencio"),
    ],
    "18": [
        ("Hospital meds endgame", "Louisville Hospital", "Trauma"),
        ("LVPD guns/armor", "PD / Detention", "Firepower"),
        ("Mall mega-loot", "Grand Ohio / mall", "Todo"),
        ("Pharmahug LV south", "Near hospital", "Meds"),
    ],
    "19": [
        ("East PD / guns", "East suburbs PD ~13783x2554", "Armas"),
        ("Mansions rich loot", "Fenced mansions ~14150x2610", "Vehicles/tools"),
        ("North mall / coastal Pharm", "North LV", "Cierre"),
    ],
    "20": [
        ("Verificar caches G intactos", "Todas las BA", "Patrulla"),
        ("Repuestos flota final", "BA-5/7/8", "Mantenimiento"),
        ("Skillbooks restantes", "Cualquier librería pendiente", "100% XP path"),
    ],
}


def suburb_total():
    return sum(s["houses"] for s in RIVERSIDE_SUBURB_STREETS)


def gated_total():
    return sum(s["houses"] for s in RIVERSIDE_GATED_STREETS)


assert suburb_total() == RIVERSIDE_HOUSE_COUNT_SUBURBS, suburb_total()
assert gated_total() == RIVERSIDE_HOUSE_COUNT_GATED, gated_total()
