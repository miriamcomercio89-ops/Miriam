"""Volumes 17-20: Louisville districts + master checklist."""

from __future__ import annotations

from pdf_engine import GuidePDF
from buildings import house, poi, residential_block, numbered_units, SHOP_ROOMS, WAREHOUSE_ROOMS, HOUSE_ROOMS_GARAGE
from theme import mm
from map_data import LOOT_BY_VOLUME


def _lv_rules(pdf: GuidePDF):
    pdf.callout(
        "REGLAS LOUISVILLE",
        "1) Un bloque por sesión. 2) Nunca tiroteos sostenidos. 3) Entra y sal por la misma ruta. "
        "4) Marca L siempre. 5) Si la migración empuja, retrocede a BA y resetea. "
        "6) High-rises: planta por planta con checkboxes. 7) Sótanos B42 = edificio nuevo.",
    )


def vol_17_lv_sw_west(path: str):
    pdf = GuidePDF(path, "17", "Louisville — Suroeste y Oeste",
                   "Dixie→S 1st / KY-1394 · Farnly · Rockford Ln · Manslick · BA-8")
    pdf.cover("VOLUMEN 17 — LV SO/OESTE",
              ["Entrada Dixie Hwy → South 1st St / KY-1394 pileup",
               "Farnly Rd / Lower Ridge Rd borde exclusion",
               "Fossoil 4 Rockford Ln ~12442x3535 · industrial west",
               "BA-8 west edge ~12030x2590"],
              {"Riesgo": "Extremo", "Mapas": "LV SW / West / NW"})
    _lv_rules(pdf)
    pdf.sector_map_schematic("Louisville fase 1 — acceso oeste",
        [
            ["VALLEY", "→", "Dixie N", "→", "Exclusion"],
            ["↓", "Farnly Rd", "→", "GATE LV", "→"],
            ["BA-8", "→", "West res", "→", "Rockford"],
            ["↓", "SW res", "→", "Ind W", "→"],
            ["KY-1394", "→", "S 1st St", "→", "Vol18"],
        ],
        "Map items: Louisville Southwest / West / Northwest. Un distrito por sesión.")
    pdf.h2("Ejes documentados")
    pdf.checkbox_grid([
        "Dixie Highway (término N)", "South 1st Street", "KY-1394", "Farnly Road",
        "Lower Ridge Road", "Rockford Ln.", "Bourbon Way (oeste)", "Industry Road (hacia PD)",
    ], cols=2)
    pdf.loot_critical("17", LOOT_BY_VOLUME["17"])

    pdf.h1("Acceso y sello de entrada")
    pdf.step(1, "Recon muro/gates", "Identifica punto de entrada. Limpia 50 tiles a cada lado.")
    pdf.step(2, "BA-8", "Casa/nave justo dentro o fuera del borde oeste. No profundices sin BA-8.")
    pdf.step(3, "Primer barrio SO", "Manzanas más cercanas al acceso. Compacta.")
    pdf.building_card(house("LV-BA8", "BA-8 Louisville West edge", "12030x2590", "alto", "2", True, True,
                            "West riverside house area es candidata. Fortifica y stash."))

    pdf.h1("LV-SW · Southwest residencial")
    for b in residential_block("LV-SW-R", "Louisville SW residencial", "manzanas", 1, 30, 12200, 3200, 14, 12, "extremo"):
        pdf.building_card(b)
    pdf.h1("LV-SW · Southwest comercial/industrial")
    for b in numbered_units("LV-SW-C", "Local/nave SW", 20, 12300, 3400, "extremo", "Local/Nave", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("LV-W · West residencial")
    for b in residential_block("LV-W-R", "Louisville West residencial", "manzanas", 1, 28, 12100, 2500, 14, 12, "extremo"):
        pdf.building_card(b)
    for b in [
        poi("LV-W-PAWN", "Pawn shop (base candidate)", "12370x1480", "Pawn", "extremo", SHOP_ROOMS, ""),
        poi("LV-W-STOR", "Storage / U-Store zone west-central", "13660x1620", "Storage", "alto",
            ["Office", "Units rows"], "Si cae más al este, hazlo en Vol 18; si lo tocas ahora, márcalo aquí."),
    ]:
        pdf.building_card(b)
    for b in numbered_units("LV-W-ST", "Local West", 18, 12250, 2200, "extremo", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("LV-NW borde · Northwest approach")
    for b in residential_block("LV-NW-R", "Louisville NW residencial borde", "norte-oeste", 1, 16, 12000, 1800, 14, 12, "extremo"):
        pdf.building_card(b)
    for b in numbered_units("LV-NW-RF", "West river structures", 10, 11950, 2000, "extremo", "Riverfront",
                            ["Orilla", "Edificio", "Muelle"]):
        pdf.building_card(b)

    pdf.h1("High-rises / multi-planta del sector (si aparecen)")
    pdf.p("Cada torre del SO/Oeste usa esta ficha repetible. Asigna ID LV-SW-Txx / LV-W-Txx.")
    for t in range(1, 7):
        rooms = [f"Planta {f:02d} — pasillo" for f in range(0, 9)] + [f"Planta {f:02d} — aptos" for f in range(0, 9)] + ["Azotea", "Sótanos/parking"]
        pdf.building_card(poi(f"LV-W-T{t:02d}", f"Torre/multi-planta West/SW #{t}", "12400x2400", "Torre", "extremo", rooms,
                              "No saltes plantas. Una sesión = máximo 2-3 plantas."))

    pdf.h1("Cierre Vol 17")
    pdf.checkbox_grid(["BA-8 OK", "SW res OK", "SW com OK", "West res OK", "NW borde OK",
                       "Torres sector OK", "Nota LV-SW-WEST OK", "Listo Vol 18"])
    pdf.save()


def vol_18_lv_central_south(path: str):
    pdf = GuidePDF(path, "18", "Louisville — Centro y Sur",
                   "Industry Rd PD · Manslick · Hospital · Mall · BA-9")
    pdf.cover("VOLUMEN 18 — LV CENTRO/SUR",
              ["Mapas: Central / South / Southeast",
               "LVPD 635 Industry Rd ~12496x1615",
               "Fossoil 3259 Manslick Rd ~12910x3028 · Hospital / Mall",
               "BA-9 south-central"],
              {"Riesgo": "Extremo"})
    _lv_rules(pdf)
    pdf.sector_map_schematic("Louisville fase 2 — centro/sur",
        [
            ["Vol17 OK", "→", "S suburbs", "→", "Manslick"],
            ["↓", "Hospital", "→", "BA-9", "→"],
            ["Industry Rd", "→", "LVPD", "→", "Downtown"],
            ["↓", "Mall", "→", "SE res", "→"],
            ["Funeral", "→", "Riding", "→", "Vol19"],
        ],
        "Hospital y PD = raids quirúrgicos. Mall = tienda por tienda.")
    pdf.loot_critical("18", LOOT_BY_VOLUME["18"])

    pdf.building_card(house("LV-BA9", "BA-9 South-central safehouse", "12900x2800", "extremo", "2", True, True,
                            "Base intermedia. Nunca duermas deep downtown sin escape claro."))

    pdf.h1("LV-S · South residencial")
    for b in residential_block("LV-S-R", "Louisville South residencial", "sur", 1, 28, 12800, 3000, 14, 12, "extremo"):
        pdf.building_card(b)
    pdf.h1("LV-SE · Southeast residencial")
    for b in residential_block("LV-SE-R", "Louisville SE residencial", "sureste", 1, 24, 13500, 3000, 14, 12, "extremo"):
        pdf.building_card(b)

    pdf.h1("LV-C · Central / downtown blocks")
    pdf.street_header("Downtown", "Bloque a bloque, nunca diagonal", "extremo", "Map: Louisville Central")
    for b in numbered_units("LV-C-BK", "Bloque downtown", 24, 12900, 2200, "extremo", "Bloque",
                            ["Acera N", "Acera E", "Acera S", "Acera W",
                             "Locales planta baja", "Accesos superiores", "Callejón trasero"]):
        pdf.building_card(b)

    pdf.h1("POIs críticos centro/sur")
    for b in [
        poi("LV-HOSP", "Louisville Hospital", "13050x2100", "Hospital", "extremo",
            ["Entrada ER", "Lobby", "Ala A plantas", "Ala B plantas", "Quirófanos/clinics",
             "Farmacia hospital", "Almacén meds", "Parking estructura", "Azotea"],
            "Sesiones cortísimas. Meds endgame."),
        poi("LV-PD", "Louisville Police Department", "12980x2150", "Policía", "extremo",
            ["Entrada", "Oficinas", "Armería", "Celdas", "Garage unidades", "Evidence/storage"],
            "Firearms/armor. Trata como raid quirúrgico."),
        poi("LV-MALL", "Louisville Mall", "13200x2400", "Mall", "extremo",
            ["Parking exterior", "Entradas", "Pasillo central", "Ala tiendas 1", "Ala tiendas 2",
             "Ala tiendas 3", "Food court", "Anclas", "Backrooms", "Tejado accesos"],
            "El POI más peligroso típico. Vacía tienda por tienda con lista abajo."),
        poi("LV-FUNERAL", "Sunset Pines Funeral Home", "13160x1520", "Funeraria", "alto",
            ["Lobby", "Chapels", "Morgue rooms", "Office"], ""),
        poi("LV-RIDE", "Riding school campus", "13040x2820", "Campus", "alto",
            ["Office", "Stables", "Arenas", "Parking"], ""),
        poi("LV-GIGA", "Large grocery / mega comercial sur", "13100x2900", "Comida", "extremo",
            ["Parking", "Pasillos", "Almacén"], ""),
    ]:
        pdf.building_card(b)

    pdf.h2("Mall — tiendas individuales")
    pdf.checkbox_grid([f"Mall store {i:02d}" for i in range(1, 41)], cols=4)

    pdf.h1("Torres centro")
    for t in range(1, 9):
        rooms = [f"P{f:02d} pasillo+aptos" for f in range(0, 12)] + ["Azotea", "Parking sótano"]
        pdf.building_card(poi(f"LV-C-T{t:02d}", f"Torre Central #{t}", "12970x2230", "Torre", "extremo", rooms, ""))

    pdf.h1("Cierre Vol 18")
    pdf.checkbox_grid(["BA-9 OK", "South OK", "SE OK", "Downtown blocks OK", "Hospital OK",
                       "PD OK", "Mall 40/40", "Torres centro OK", "LV-CENTRO-SUR OK", "Listo Vol 19"])
    pdf.save()


def vol_19_lv_east_north(path: str):
    pdf = GuidePDF(path, "19", "Louisville — Este y Norte",
                   "East PD · mansions · Grand Ohio Mall coast · BA-10")
    pdf.cover("VOLUMEN 19 — LV ESTE/NORTE",
              ["Mapas: East / Northeast / North",
               "East PD ~13783x2554 · Fenced mansions ~14150x2610",
               "Pharmahug north coast / Grand Ohio Mall area",
               "Cierre total Louisville"],
              {"Riesgo": "Extremo"})
    _lv_rules(pdf)
    pdf.sector_map_schematic("Louisville fase 3 — este/norte",
        [
            ["Vol18 OK", "→", "East res", "→", "East PD"],
            ["↓", "Mansions", "→", "Far East", "→"],
            ["BA-10", "→", "NE res", "→", "N river"],
            ["↓", "N com", "→", "Mall N", "→"],
            ["Coast Pharm", "→", "Leafhill", "→", "LV TOTAL"],
        ],
        "Cierra este antes que norte denso. Mansions = gated protocol.")
    pdf.loot_critical("19", LOOT_BY_VOLUME["19"])

    pdf.building_card(house("LV-BA10", "BA-10 East safehouse", "13800x2400", "extremo", "2", True, True,
                            "Para operaciones del este. No abandones BA-8/9 aún."))

    pdf.h1("LV-E · East residencial")
    for b in residential_block("LV-E-R", "Louisville East residencial", "este", 1, 30, 13800, 2300, 14, 12, "extremo"):
        pdf.building_card(b)
    pdf.h1("LV-FE · Far East")
    for b in residential_block("LV-FE-R", "Louisville Far East", "far east", 1, 22, 14500, 2400, 14, 12, "extremo"):
        pdf.building_card(b)
    for b in numbered_units("LV-E-ST", "Local East", 16, 13900, 2200, "extremo", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("Mansiones valladas / wealthy east")
    pdf.building_card(poi("LV-E-MAN", "Fenced mansions cluster", "14150x2610", "Mansiones", "extremo",
                          ["Perímetro valla", "Gate", "Mansiones internas"], "Limpia como gated community."))
    for b in residential_block("LV-E-M", "Mansion East", "interior cluster", 1, 14, 14100, 2550, 16, 12, "extremo", True, "mansión"):
        pdf.building_card(b)

    pdf.h1("LV-N · North + Northeast")
    for b in residential_block("LV-N-R", "Louisville North residencial", "norte", 1, 24, 12900, 1500, 14, 12, "extremo"):
        pdf.building_card(b)
    for b in residential_block("LV-NE-R", "Louisville NE residencial", "noreste", 1, 20, 13800, 1500, 14, 12, "extremo"):
        pdf.building_card(b)
    for b in numbered_units("LV-N-RF", "North riverfront LV", 14, 12800, 1200, "extremo", "Riverfront",
                            ["Orilla", "Edificio", "Muelle/park"]):
        pdf.building_card(b)

    pdf.h1("POIs norte/este restantes")
    for b in [
        poi("LV-N-COM", "Comercial norte", "13000x1600", "Comercio", "extremo", SHOP_ROOMS, ""),
        poi("LV-E-IND", "Industrial este", "14200x2100", "Industrial", "extremo", WAREHOUSE_ROOMS, ""),
        poi("LV-NE-PARK", "Park / campus norte-este", "13600x1400", "Exterior", "alto",
            ["Accesos", "Edificios parque", "Perímetro"], ""),
    ]:
        pdf.building_card(b)
    for b in numbered_units("LV-N-ST", "Local North", 14, 13050, 1700, "extremo", "Local", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("Torres este/norte")
    for t in range(1, 7):
        rooms = [f"P{f:02d}" for f in range(0, 10)] + ["Azotea", "Sótano"]
        pdf.building_card(poi(f"LV-E-T{t:02d}", f"Torre East/North #{t}", "14000x2000", "Torre", "extremo", rooms, ""))

    pdf.h1("Certificación Louisville")
    pdf.checkbox_grid([
        "Map Louisville SW OK", "West OK", "Central OK", "South OK", "SE OK",
        "East OK", "Far East OK", "North OK", "NE OK", "NW OK",
        "Hospital OK", "PD OK", "Mall OK", "Mansions OK", "Riverfront total OK",
        "Torres todas OK", "0 marcas P en LV", "Nota LOUISVILLE TOTAL OK",
        "BA-8/9/10 mantenidas o retiradas con orden", "Listo Vol 20 cierre mapa",
    ])
    pdf.save()


def vol_20_master(path: str):
    pdf = GuidePDF(path, "20", "Checklist maestro y cierre del mapa",
                   "Certificación final Knox Country · B42.20")
    pdf.cover("VOLUMEN 20 — CIERRE TOTAL",
              ["Checklist de todas las regiones",
               "POIs rurales huérfanos",
               "Protocolo de re-barrido anti-migración",
               "Certificado de mapa limpio"],
              {"Meta": "0 zombis / 0 edificios sin cubrir"})
    pdf.loot_critical("20", LOOT_BY_VOLUME["20"])
    pdf.sector_map_schematic("Re-barrido — orden inverso",
        [
            ["LV E/N", "←", "LV C/S", "←", "LV SW"],
            ["↑", "Valley", "←", "WP", "←"],
            ["Muld", "←", "March", "←", "Rose"],
            ["↑", "Irving", "←", "Ekron", "←"],
            ["Echo", "←", "Fallas", "←", "Brand"],
            ["↑", "Corredor", "←", "Riverside", "HOME"],
        ],
        "Solo exterminio + verificar sprays L. Sin loot runs largos.")

    pdf.h1("Re-barrido anti-migración (obligatorio)")
    pdf.p(
        "Aunque no hay respawn, la migración puede haber movido zombis a zonas 'OK'. "
        "Haz un <b>re-barrido ligero</b> de cada región en orden inverso (Louisville → Riverside) "
        "antes de certificar. No loot: solo exterminio y verificación de sprays L."
    )
    pdf.table(
        ["Orden re-barrido", "Región", "Método"],
        [
            ["1", "Louisville 17-19", "Coche lento + paradas por distrito"],
            ["2", "Valley Station / WP", "Calles principales + POIs"],
            ["3", "Muldraugh / Dixie", "Highway bands"],
            ["4", "March Ridge / Rosewood / Prison", "Pueblo + perímetro prisión"],
            ["5", "Irvington / Ekron / Echo", "Loops rurales"],
            ["6", "Fallas / Doe Valley", "Lago + farms"],
            ["7", "Brandenburg / corredor", "Tornado zone revisit"],
            ["8", "Riverside total", "Confirmación final home"],
        ],
        [30 * mm, 70 * mm, 78 * mm],
    )

    pdf.h1("POIs rurales / huérfanos finales")
    pdf.p("Lista de captura para cualquier estructura entre ciudades que se te haya escapado.")
    for b in numbered_units("ORPH", "POI huérfano / roadside / forest", 40, 8000, 8000, "medio", "POI",
                            ["Acceso", "Interior", "Sheds", "20-tile perimeter"]):
        pdf.building_card(b)

    pdf.h1("Checklist maestro por volumen")
    vols = [
        "01 Protocolo", "02 Riverside suburbios", "03 Gated + BA-1", "04 Comercial RV",
        "05 Industrial+CC RV", "06 Corredor oeste", "07 Brandenburg", "08 Fallas+DV",
        "09 Echo Creek", "10 Ekron", "11 Irvington+Speedway", "12 Rosewood+Prison",
        "13 March Ridge", "14 Muldraugh+Dixie", "15 West Point", "16 Valley Station",
        "17 LV SW/West", "18 LV Centro/Sur", "19 LV Este/Norte", "Re-barrido anti-migración",
    ]
    pdf.checkbox_grid([f"VOL {v} CERTIFICADO" for v in vols], cols=1)

    pdf.h1("Bases avanzadas — estado final")
    pdf.checkbox_grid([
        "BA-1 Gated RV", "BA-2 Brandenburg", "BA-3 Echo Creek", "BA-4 Fire Station",
        "BA-5 Muldraugh N", "BA-6 West Point W", "BA-7 Valley Station",
        "BA-8 LV West", "BA-9 LV South-central", "BA-10 LV East",
    ])

    pdf.h1("Certificado de mapa limpio")
    pdf.info_box("CONDICIONES DE VICTORIA DE CAMPAÑA", [
        "Todos los volúmenes 02-19 cerrados",
        "Re-barrido anti-migración completado",
        "40/40 huérfanos revisados (o N/A justificados en notas)",
        "Ningún edificio con marca P",
        "Notas de mapa regionales en OK",
        "Riverside home sigue siendo retaguardia segura",
    ])
    pdf.spacer(4 * mm)
    pdf.p("<b>Firma del superviviente:</b> ______________________  <b>Día de juego:</b> ________")
    pdf.p("<b>Notas finales:</b> ___________________________________________________________")
    pdf.callout(
        "CAMPAÑA COMPLETADA",
        "Si llegaste aquí con el mapa sellado: has hecho una limpieza total de Knox Country en B42.20. "
        "Mantén patrullas ocasionales por migración y celebra en el río de Riverside.",
    )
    pdf.save()
