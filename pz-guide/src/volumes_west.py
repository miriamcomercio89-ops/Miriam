"""Volumes 06-11: western B42 expansion corridor."""

from __future__ import annotations

from pdf_engine import GuidePDF
from buildings import house, poi, residential_block, numbered_units, SHOP_ROOMS, WAREHOUSE_ROOMS, HOUSE_ROOMS_GARAGE
from theme import mm
from map_data import LOOT_BY_VOLUME


def vol_06_corredor(path: str):
    pdf = GuidePDF(path, "06", "Corredor oeste: farms, Scenic Grove y radio",
                   "Long Branch · Long Needle · Scenic Grove Rd · Wilson Rd · Olin/KY-163")
    pdf.cover("VOLUMEN 06 — CORREDOR OESTE",
              ["Calles: Long Branch Rd #3, Long Needle Rd, Scenic Grove Rd, Wilson Rd #575.",
               "Scenic Grove @ KY-163 & Long Needle · Radio relay 4843x6280.",
               "Abandoned town / Tanglewood 4048x6154 · C.G.E. area.",
               "Loot crítico de fase rural."],
              {"Desde": "Riverside", "Hacia": "Brandenburg", "Riesgo": "Bajo-Medio"})

    pdf.sector_map_schematic(
        "Corredor oeste — ruta",
        [
            ["RV OK", "→", "Long Branch", "→", "Wilson Rd", "→"],
            ["↓", "Scenic Grove", "→", "Radio 4843", "→", "Abandoned"],
            ["→", "Doe Valley POIs", "→", "Road to BRAND", "→", "BA-2"],
        ],
        "Scenic Grove en esquina KY-163 / Long Needle. U-Store/factory del este de Long Needle ya en Vol 05.",
    )
    pdf.loot_critical("06", LOOT_BY_VOLUME["06"])

    pdf.h1("Doctrina rural")
    pdf.p(
        "En campo abierto la migración es traicionera: un combate largo atrae desde celdas vecinas. "
        "Limpia <b>granja completa</b> (casa + sheds + corrales + edge 30 tiles) antes de la siguiente."
    )

    pdf.h1("Ruta W-1 · Farms inmediatas al oeste de Riverside")
    for b in residential_block("W1-F", "Farm road oeste", "ambos lados", 1, 12, 5200, 5600, -40, 10, "bajo", True, "granja"):
        b["rooms"] = HOUSE_ROOMS_GARAGE + ["Granero", "Gallinero/ shed", "Campos perimetrales"]
        pdf.building_card(b)

    pdf.h1("Ruta W-2 · Scenic Grove Mobile Home Park")
    pdf.street_header("Scenic Grove", "Entrada → filas A-D", "medio", "Coords ~5350x6020")
    pdf.building_card(poi("W2-OFF", "Office / entrada del parque", "5350x6000", "Oficina", "medio",
                          ["Oficina", "Laundry", "Mailbox area"], ""))
    for b in numbered_units("W2-MH", "Mobile home", 28, 5320, 6020, "medio", "Caravana",
                            ["Escalón/entrada", "Salón-cocina", "Baño", "Dormitorio", "Exterior inmediato"]):
        pdf.building_card(b)
    pdf.checkbox_grid([f"Callejón parque fila {r} limpio" for r in "ABCD"], cols=2)

    pdf.h1("Ruta W-3 · Radio relay station")
    pdf.building_card(poi("W3-RADIO", "Radio relay station", "4843x6280", "Infraestructura", "medio",
                          ["Perímetro", "Edificio control", "Torre base", "Generator room", "Vehículos servicio"],
                          "POI aislado: limpia y marca, no hace falta base."))

    pdf.h1("Ruta W-4 · Abandoned town")
    pdf.street_header("Abandoned town", "Estructura por estructura", "medio", "Coords ~4048x6154")
    for b in numbered_units("W4-AT", "Abandoned structure", 14, 4040, 6140, "medio", "Ruina/edificio",
                            ["Exterior", "Interior", "Sótanos/escombros", "Yard"]):
        pdf.building_card(b)

    pdf.h1("Ruta W-5 · Doe Valley Forest POIs")
    pdf.p("Bosque entre Brandenburg, Riverside, Echo Creek y Doe Valley. Patrulla caminos y limpia CADA cabaña/POI.")
    for b in numbered_units("W5-DV", "Doe Valley POI/cabaña", 16, 4000, 7000, "bajo", "Cabaña",
                            ["Sendero acceso", "Cabaña", "Shed", "Alrededor 20 tiles"]):
        pdf.building_card(b)

    pdf.h1("Ruta W-6 · Casas de carretera restantes")
    for b in residential_block("W6-RD", "Carretera hacia Brandenburg", "ambos", 50, 15, 3500, 6000, -50, 5, "bajo", True, "roadside"):
        pdf.building_card(b)

    pdf.h1("Cierre Vol 06")
    pdf.checkbox_grid(["Farms W1 OK", "Scenic Grove 28/28", "Radio OK", "Abandoned town OK",
                       "Doe Valley POIs OK", "Roadside OK", "Nota CORREDOR-OESTE OK", "Listo Brandenburg"])
    pdf.save()


def vol_07_brandenburg(path: str):
    pdf = GuidePDF(path, "07", "Brandenburg (B42) — ciudad completa",
                   "Boyd Rd Fossoil · Pondview Shopping · Police ~2043x5978 · BA-2")
    pdf.cover("VOLUMEN 07 — BRANDENBURG",
              ["Centro ~2314x6253", "Fossoil 582 Boyd Rd 2059x6425",
               "Nails & Nuts Pondview ~1943x6361 · Police ~2043x5978",
               "Zona tornado SE · BA-2"],
              {"Riesgo": "Medio", "Mapa item": "Brandenburg"})

    pdf.h1("Orden de sectores Brandenburg")
    pdf.sector_map_schematic("Brandenburg overview",
        [["RÍO", "RÍO", "RÍO", "RÍO"],
         ["B-NW", "→", "B-N COM", "→"],
         ["↓", "PD/CENTRO", "→", "B-NE"],
         ["B-W", "→", "PONDVIEW", "→"],
         ["FOSSOIL", "→", "B-S TORNADO", "BA-2"]],
        "Orden: residencial N → centro/PD → Pondview/Nails&Nuts → Fossoil Boyd Rd → tornado SE.")
    pdf.loot_critical("07", LOOT_BY_VOLUME["07"])

    for sector, prefix, x, y, n, risk in [
        ("B-N Residencial norte", "BR-N", 2200, 6100, 16, "bajo"),
        ("B-NE Este residencial", "BR-NE", 2500, 6150, 12, "bajo"),
        ("B-NW Oeste residencial", "BR-NW", 2000, 6150, 10, "bajo"),
        ("B-E Este", "BR-E", 2600, 6300, 12, "medio"),
        ("B-W Oeste", "BR-W", 1900, 6300, 12, "medio"),
        ("B-SE Sur-este", "BR-SE", 2500, 6500, 10, "medio"),
        ("B-SW Sur-oeste", "BR-SW", 2000, 6500, 10, "medio"),
    ]:
        pdf.h1(sector)
        pdf.street_header(sector, "Calle por calle, lado impar→par", risk, f"Prefijo {prefix}")
        for b in residential_block(prefix, sector, "mixto", 1, n, x, y, 14, 10, risk):
            pdf.building_card(b)

    pdf.h1("B-CENTRO · Comercial / servicios")
    for b in [
        poi("BR-C-GAS", "Gasolinera Brandenburg", "2350x6200", "Gasolinera", "medio",
            ["Bombas", "Tienda", "Trastero"], "Busca Map: Brandenburg"),
        poi("BR-C-SHOP1", "Bloque tiendas centro #1", "2320x6220", "Comercio", "medio", SHOP_ROOMS, ""),
        poi("BR-C-SHOP2", "Bloque tiendas centro #2", "2380x6220", "Comercio", "medio", SHOP_ROOMS, ""),
        poi("BR-C-FOOD", "Grocery / food store", "2340x6250", "Supermercado", "alto",
            ["Parking", "Pasillos", "Almacén", "Office"], ""),
        poi("BR-C-PUB", "Bar / restaurant", "2300x6260", "Hostelería", "medio",
            ["Salón", "Cocina", "Trastero"], ""),
        poi("BR-C-SVC", "Servicios municipales / office", "2280x6240", "Oficina", "medio",
            ["Lobby", "Oficinas", "Storage"], ""),
        poi("BR-C-FIRE", "Fire / emergency (si presente)", "2400x6210", "Emergencias", "alto",
            ["Garage", "Lockers", "Office", "Tower/yard"], "Confirma en mapa B42."),
        poi("BR-C-POL", "Police / security (si presente)", "2420x6230", "Policía", "alto",
            ["Entrada", "Office", "Armería/storage", "Celdas"], ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("BR-C-ST", "Local centro", 12, 2310, 6280, "medio", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("B-S · Zona devastada por tornado")
    pdf.callout("ZONA TORNADO",
                "SE de Brandenburg tiene casas destruidas/dañadas. Cada estructura cuenta. "
                "Trata ruinas como edificios: perímetro + interior accesible + marque L o RUINA-CLEAR.")
    for b in numbered_units("BR-T", "Estructura zona tornado", 20, 2400, 6600, "medio", "Casa/ruina",
                            ["Escombros perímetro", "Interior accesible", "Sótanos expuestos", "Vehículos aplastados"]):
        pdf.building_card(b)

    pdf.h1("Riverfront Brandenburg")
    for b in numbered_units("BR-RF", "Riverfront BR", 8, 2200, 6000, "medio", "Edificio orilla",
                            ["Orilla", "Edificio", "Muelle/yard"]):
        pdf.building_card(b)

    pdf.h1("BA-2")
    pdf.building_card(house("BR-BA2", "BA-2 Casa reforzada Brandenburg", "2314x6253", "medio", "2", True, True,
                            "Lejos de tornado zone. Stash + cama + 1 van."))
    pdf.checkbox_grid(["BA-2 cama", "BA-2 stash", "BA-2 vehículo", "Nota BASE-2 BRAND", "Brandenburg mapa item guardado"])

    pdf.h1("Cierre Vol 07")
    pdf.checkbox_grid(["Residencial N/E/W/S OK", "Centro OK", "Tornado 20/20", "Riverfront OK",
                       "BA-2 OK", "BRANDENBURG TOTAL OK", "Listo Vol 08"])
    pdf.save()


def vol_08_fallas(path: str):
    pdf = GuidePDF(path, "08", "Fallas Lake + Doe Valley (sur de Riverside)",
                   "Old Mill Rd corridor · Police FL ~7252x8378 · lago")
    pdf.cover("VOLUMEN 08 — FALLAS LAKE",
              ["Centro ~7348x8371", "Police Fallas Lake ~7252x8378",
               "Acceso desde Muldraugh vía Old Mill Road", "Doe Valley farms"],
              {"Riesgo": "Bajo-Medio"})
    pdf.sector_map_schematic("Fallas Lake ruta",
        [["Old Mill", "→", "FL N res", "→", "PD FL"],
         ["↓", "Centro/Gas", "→", "Lago", "→"],
         ["Doe Valley", "→", "Cabañas", "→", "Sur OK"]],
        "Limpia pueblo antes de cabañas del lago.")
    pdf.loot_critical("08", LOOT_BY_VOLUME["08"])

    pdf.h1("Fallas Lake — residencial")
    for b in residential_block("FL-R", "Fallas Lake residencial", "pueblo", 1, 20, 7200, 8200, 12, 10, "bajo"):
        pdf.building_card(b)
    pdf.h1("Fallas Lake — comercial / servicios")
    for b in [
        poi("FL-GAS", "Gas / servicios FL", "7350x8350", "Gasolinera", "medio", ["Bombas", "Tienda"], ""),
        poi("FL-SHOP", "Tiendas lago", "7380x8370", "Comercio", "medio", SHOP_ROOMS, ""),
        poi("FL-LAKE", "Instalaciones del lago", "7400x8450", "Ocio", "medio",
            ["Muelle", "Rental/office", "Almacén barcas", "Orilla norte", "Orilla sur"],
            "Patrulla completa de orillas."),
    ]:
        pdf.building_card(b)
    for b in numbered_units("FL-CAB", "Cabaña lago", 12, 7450, 8500, "bajo", "Cabaña",
                            ["Acceso", "Interior", "Muelle privado"]):
        pdf.building_card(b)

    pdf.h1("Doe Valley farms restantes")
    for b in residential_block("DV-F", "Doe Valley farm", "rural", 1, 14, 6800, 7800, -30, 25, "bajo", True, "granja"):
        b["rooms"] = HOUSE_ROOMS_GARAGE + ["Granero", "Campos"]
        pdf.building_card(b)

    pdf.h1("Cierre Vol 08")
    pdf.checkbox_grid(["Fallas residencial OK", "Fallas comercial OK", "Cabañas 12/12",
                       "Doe Valley farms OK", "FALLAS+DV OK", "Listo Echo Creek"])
    pdf.save()


def vol_09_echo(path: str):
    pdf = GuidePDF(path, "09", "Echo Creek (B42) — pueblo rural completo",
                   "Centro ~4235x11069 · BA-3 · Granjas este · KY-60 corridor")
    pdf.cover("VOLUMEN 09 — ECHO CREEK",
              ["Pueblo pequeño + granjas + chicken farm este",
               "Acceso vía KY-60 desde eje Dixie", "BA-3"],
              {"Riesgo": "Bajo", "Spawn posible": "Sí (sandbox)"})
    pdf.sector_map_schematic("Echo Creek",
        [["KY-60", "→", "Pueblo EC", "→", "Farm supply"],
         ["↓", "Chicken E", "→", "BA-3", "→"],
         ["Granjas S", "→", "Campos", "→", "OK"]],
        "Pueblo primero, chicken farm este, luego granjas.")
    pdf.loot_critical("09", LOOT_BY_VOLUME["09"])

    pdf.h1("Pueblo Echo Creek")
    for b in residential_block("EC-R", "Echo Creek residencial", "pueblo", 1, 18, 4150, 11000, 14, 12, "bajo"):
        pdf.building_card(b)
    for b in [
        poi("EC-GAS", "Gas / general store EC", "4235x11069", "Comercio", "medio", SHOP_ROOMS + ["Bombas si hay"], ""),
        poi("EC-DINER", "Diner / café", "4260x11080", "Hostelería", "bajo", ["Comedor", "Cocina", "Trastero"], ""),
        poi("EC-CHURCH", "Iglesia / community (si hay)", "4200x11120", "Comunidad", "bajo",
            ["Nave", "Trastienda", "Patio"], ""),
        poi("EC-SVC", "Talleres / farm supply", "4280x11100", "Suministros", "medio",
            ["Tienda", "Yard", "Shed"], "Tools y farming loot."),
    ]:
        pdf.building_card(b)

    pdf.h1("Chicken farm este")
    pdf.building_card(poi("EC-CHICK", "Chicken farm este", "4500x11050", "Granja avícola", "medio",
                          ["Casa granja", "Gallineros A", "Gallineros B", "Almacén feed", "Silos/ sheds", "Perímetro campos"],
                          "Animales B42: decide si capturas o ignoras; igual limpia zombis."))
    for b in residential_block("EC-F", "Granjas Echo Creek", "este-sur", 1, 12, 4400, 11200, 20, 30, "bajo", True, "granja"):
        pdf.building_card(b)

    pdf.h1("BA-3")
    pdf.building_card(house("EC-BA3", "BA-3 Granja este Echo Creek", "4480x11080", "bajo", "2", True, True,
                            "Buena para animals/farming mid-run."))
    pdf.checkbox_grid(["EC pueblo OK", "Chicken farm OK", "Granjas 12/12", "BA-3 OK", "ECHO CREEK TOTAL OK"])
    pdf.save()


def vol_10_ekron(path: str):
    pdf = GuidePDF(path, "10", "Ekron (B42) — industrial / steelworks",
                   "Haysville Rd Fossoil · Pharmahug plaza · tren bloqueado")
    pdf.cover("VOLUMEN 10 — EKRON",
              ["Centro ~1020x9838", "Fossoil 104 Haysville Rd ~649x9923",
               "Pharmahug plaza este vías ~402x9870", "Steelworks + tren cortado"],
              {"Riesgo": "Medio-Alto", "Mapa": "Ekron"})

    pdf.callout("TREN BLOQUEADO",
                "Un tren roto corta la main street. Solo hay conexión útil más al norte entre "
                "oeste y este del pueblo. Planifica la ruta de van con eso en mente.")
    pdf.sector_map_schematic("Ekron",
        [["N bridge", "→", "Este res", "→", "Pharmahug"],
         ["↓", "TREN X", "X", "Main St", "→"],
         ["Oeste res", "→", "Steelworks", "→", "Fossoil S"]],
        "Usa conexión norte. No intentes cruzar el tren.")
    pdf.loot_critical("10", LOOT_BY_VOLUME["10"])

    pdf.h1("Residencial este / oeste")
    for b in residential_block("EK-E", "Ekron este residencial", "este", 1, 14, 1200, 9800, 12, 10, "medio"):
        pdf.building_card(b)
    for b in residential_block("EK-W", "Ekron oeste residencial", "oeste", 1, 14, 800, 9800, 12, 10, "medio"):
        pdf.building_card(b)

    pdf.h1("Comercial / main street")
    for b in numbered_units("EK-MS", "Main street local", 14, 1000, 9820, "alto", "Local", SHOP_ROOMS):
        pdf.building_card(b)
    for b in [
        poi("EK-GAS", "Gasolinera Ekron", "1050x9780", "Gasolinera", "medio", ["Bombas", "Tienda"], "Map: Ekron"),
        poi("EK-FOOD", "Grocery / supply", "1100x9840", "Comida", "alto", ["Pasillos", "Almacén"], ""),
    ]:
        pdf.building_card(b)

    pdf.h1("Industrial / steelworks")
    for b in [
        poi("EK-STEEL", "Steelworks / planta principal", "1020x9900", "Industria pesada", "alto",
            WAREHOUSE_ROOMS + ["Hornos/área industrial", "Lockers", "Yard ferrocarril"],
            "Máximo silencio. Mucho metalworking loot."),
        poi("EK-FACT2", "Nave industrial secundaria", "950x9950", "Nave", "alto", WAREHOUSE_ROOMS, ""),
        poi("EK-YARD", "Rail / storage yard", "1100x9920", "Yard", "alto",
            ["Vías", "Contenedores", "Office yard"], ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("EK-IND", "Nave Ekron", 8, 900, 10000, "alto", "Nave", WAREHOUSE_ROOMS):
        pdf.building_card(b)

    pdf.h1("Cierre Vol 10")
    pdf.checkbox_grid(["Residencial E/W OK", "Main street OK", "Steelworks OK",
                       "Naves 8/8", "EKRON TOTAL OK", "Listo Irvington"])
    pdf.save()


def vol_11_irvington(path: str):
    pdf = GuidePDF(path, "11", "Irvington + Speedway (B42 sur-oeste)",
                   "KY-79 · Fossoil · Pharmahug · Police ~2485x13940 · Speedway")
    pdf.cover("VOLUMEN 11 — IRVINGTON",
              ["Centro ~2729x13797 · eje Kentucky 79",
               "Fossoil ~2525x14484 · Pharmahug ~2475x14478",
               "Police ~2485x13940 · Speedway al norte",
               "Factory farms este"],
              {"Riesgo": "Medio", "Mapa": "Irvington"})

    pdf.sector_map_schematic("Irvington",
        [["Speedway", "←", "N ind", "←", "KY-79 N"],
         ["↓", "PD", "→", "Res N", "→"],
         ["Res W", "→", "Centro", "→", "Res E"],
         ["Plaza SO", "→", "Fossoil", "→", "Farms E"]],
        "Residencial primero; plaza SO y Speedway después.")
    pdf.loot_critical("11", LOOT_BY_VOLUME["11"])

    pdf.h1("Orden Irvington")
    pdf.step(1, "Residencial este", "Manzanas bajas densidad, casa por casa.")
    pdf.step(2, "Residencial oeste", "Hasta el borde de campos.")
    pdf.step(3, "Norte servicios/industrial", "Más densidad.")
    pdf.step(4, "Plaza comercial SO", "Shopping plaza.")
    pdf.step(5, "Speedway", "Complejo completo.")
    pdf.step(6, "Factory farms este", "Granjas industriales/livestock.")

    pdf.h1("Residencial")
    for b in residential_block("IR-E", "Irvington este", "residencial", 1, 22, 2900, 13700, 14, 12, "bajo"):
        pdf.building_card(b)
    for b in residential_block("IR-W", "Irvington oeste", "residencial", 1, 22, 2400, 13700, 14, 12, "bajo"):
        pdf.building_card(b)
    for b in residential_block("IR-S", "Irvington sur", "residencial", 1, 16, 2700, 14100, 14, 12, "medio"):
        pdf.building_card(b)
    for b in residential_block("IR-N", "Irvington norte residencial", "norte", 1, 14, 2700, 13450, 14, 10, "medio"):
        pdf.building_card(b)

    pdf.h1("Comercial / público / industrial norte")
    for b in [
        poi("IR-PLAZA", "Shopping plaza SO", "2500x14050", "Plaza", "alto",
            ["Parking", "Ancla store", "Locales A", "Locales B", "Locales C", "Trasera"],
            "Población más alta en SO outskirts."),
        poi("IR-GAS", "Gas KY79", "2750x13750", "Gasolinera", "medio", ["Bombas", "Tienda"], "Map: Irvington"),
        poi("IR-PUB", "Escuela/iglesia/servicios", "2800x13680", "Público", "medio",
            ["Edificio principal", "Anexos", "Parking"], "Confirma tipo exacto en mapa B42."),
        poi("IR-IND", "Infra industrial norte", "2750x13400", "Industrial", "alto", WAREHOUSE_ROOMS, ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("IR-ST", "Local Irvington", 16, 2720, 13820, "medio", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("Irvington Speedway")
    pdf.building_card(poi("IR-SPEED", "Irvington Speedway complex", "2720x13200", "Speedway", "alto",
                          ["Acceso carretera", "Parking masivo A", "Parking masivo B", "Tribunas",
                           "Pit area", "Track perimetral", "Concession / shops", "Office / media",
                           "Garajes equipos", "Almacenes"],
                          "Trata el óvalo como perímetro a patrullar. Mata TODOS los errantes del track."))
    pdf.checkbox_grid([f"Sector track {i:02d}/12 limpio" for i in range(1, 13)] +
                      [f"Pit box {i:02d}" for i in range(1, 9)], cols=2)

    pdf.h1("Factory farms este")
    for b in numbered_units("IR-FF", "Factory farm este", 10, 3200, 13800, "medio", "Granja industrial",
                            ["Casa/office", "Naves animales", "Silos", "Campos", "Perímetro"]):
        pdf.building_card(b)

    pdf.h1("Cierre Vol 11")
    pdf.checkbox_grid(["Residencial E/W/S/N OK", "Plaza OK", "Speedway OK", "Factory farms OK",
                       "IRVINGTON TOTAL OK", "Flanco SO sellado", "Listo Rosewood Vol 12"])
    pdf.save()
