"""Volumes 02-05: Riverside — map-faithful streets, counts, POIs, loot."""

from __future__ import annotations

from pdf_engine import GuidePDF
from buildings import house, poi, SHOP_ROOMS, WAREHOUSE_ROOMS, HOUSE_ROOMS_GARAGE
from map_data import (
    RIVERSIDE_SUBURB_STREETS,
    RIVERSIDE_GATED_STREETS,
    RIVERSIDE_BUSINESSES,
    RIVERSIDE_ADDRESSES,
    RIVERSIDE_STREETS,
    RIVERSIDE_HOUSE_COUNT_SUBURBS,
    RIVERSIDE_HOUSE_COUNT_GATED,
    LOOT_BY_VOLUME,
)
from theme import mm


def _faith_note(pdf: GuidePDF):
    pdf.callout(
        "FIDELIDAD AL MAPA B42.20",
        "Calles = PZwiki Street_names (fliers B42 / mapa in-game). "
        "Conteos suburbios 70 + gated 34 = PZwiki Riverside. "
        "POIs/coords = tablas de negocios PZwiki. "
        "El redesign 42.20 hace interiores únicos: confirma en overlay Streets de "
        "map.projectzomboid.com / b42map.com si un pin se desplazó unos tiles.",
    )


def vol_02_suburbios(path: str):
    pdf = GuidePDF(
        path, "02",
        "Riverside — Suburbios sur (70 casas, calles reales)",
        "Conteo PZwiki · Calles B42 · Sin entrar al gated ni al strip",
    )
    pdf.cover(
        "VOLUMEN 02 — RIVERSIDE SUBURBIOS",
        [
            f"Exactamente {RIVERSIDE_HOUSE_COUNT_SUBURBS} casas fuera del gated (PZwiki).",
            "Orden por calles reales: Pine Court, Mary Court, Walnut, Kennedy…",
            "Esquemas con flechas de ruta; frontera GATE marcada.",
            "Loot crítico de fase antes de cerrar el volumen.",
        ],
        {"Casas": str(RIVERSIDE_HOUSE_COUNT_SUBURBS), "Gated": "Vol 03", "Strip": "Vol 04"},
    )
    _faith_note(pdf)

    pdf.h1("Mapa operativo suburbios (norte↑ = Ohio River / strip)")
    pdf.sector_map_schematic(
        "Riverside — frentes Vol 02",
        [
            ["RÍO", "STRIP Vol04", "STRIP Vol04", "CHURCH", "→", "GATE Vol03"],
            ["↓", "SCHOOL", "→", "S-C Kennedy", "→", "KELLY DR"],
            ["S-B Walnut", "→", "S-A Courts", "→", "S-E Grove", "GATED"],
            ["Cemetary", "→", "S-D Dogwood", "→", "S-F/G Sur", "↓"],
            ["WRECK Vol05", "OLIN Rd", "→", "LONG NEEDLE", "→", "CC Vol05"],
        ],
        "Ruta: S-A → S-B → S-C (parar en GATE) → S-E → S-D → S-F/G. No cruces GATE ni STRIP completo.",
    )

    pdf.h1("Direcciones conocidas (fliers / wiki)")
    pdf.table(
        ["Dirección", "Coords", "Nota"],
        [[k, v[0], v[1]] for k, v in RIVERSIDE_ADDRESSES.items()],
        [55 * mm, 40 * mm, 83 * mm],
    )

    pdf.loot_critical("02", LOOT_BY_VOLUME["02"])

    pdf.h1(f"Inventario casa por casa — total {RIVERSIDE_HOUSE_COUNT_SUBURBS}")
    pdf.p(
        f"Distribución por calles reales que suma <b>{RIVERSIDE_HOUSE_COUNT_SUBURBS}</b>. "
        "Cada casa tiene ID + ficha. Al terminar una calle: spray OK en esquina + nota mapa."
    )

    current_sector = None
    done = 0
    for block in RIVERSIDE_SUBURB_STREETS:
        if block["sector"] != current_sector:
            current_sector = block["sector"]
            pdf.h1(f"Sector {current_sector}")
            pdf.sector_map_schematic(
                f"Sector {current_sector} — orden de calles",
                [[b["street"][:14] for b in RIVERSIDE_SUBURB_STREETS if b["sector"] == current_sector]],
                f"Completa todas las casas del sector antes de abrir el siguiente.",
            )
        prefix = f"RV-{current_sector}-{block['street'][:3].upper()}"
        # cleaner prefix
        slug = "".join(ch for ch in block["street"].upper() if ch.isalnum())[:6]
        prefix = f"RV{current_sector[-1]}-{slug}"
        pdf.house_street_block(
            block["street"], block["houses"], prefix, block["anchor"], block["risk"], block["route"]
        )
        done += block["houses"]
        pdf.h3(f"Subtotal sector tras {block['street']}: casas acumuladas guía = {done}/{RIVERSIDE_HOUSE_COUNT_SUBURBS}")
        pdf.checkbox(f"Calle completa: {block['street']} ({block['houses']}/{block['houses']})")

    pdf.h1("Calles Riverside (lista completa Street_names)")
    pdf.p("Úsalas en el mapa in-game (overlay Streets). Las de este volumen están arriba; el resto aparecen en Vol 03-06.")
    pdf.checkbox_grid(RIVERSIDE_STREETS, cols=2)

    pdf.h1("POI suburbano embebido (limpiar si cae en tu frente)")
    pdf.building_card(
        poi(
            "RV-SCHOOL", "School (Riverside)", "6443x5441", "Escuela", "alto",
            ["Parking", "Halls", "Aulas", "Library 6430x5450", "Clinic 6450x5450", "Gimnasio"],
            "Sur del strip. Si al llegar aún no abriste comercial, límpiala aquí.",
        )
    )

    pdf.h1("Cierre Volumen 02")
    pdf.checkbox_grid([
        f"70/70 casas suburbios OK (acumulado guía={done})",
        "Ninguna casa dentro del GATE (eso es Vol 03)",
        "Strip comercial NO abierto aún (Vol 04)",
        "Loot crítico Vol 02 conseguido o anotado",
        "Notas mapa por sector S-A…S-G",
        "Listo Vol 03 Comunidad cerrada",
    ])
    pdf.save()


def vol_03_gated(path: str):
    pdf = GuidePDF(
        path, "03",
        "Riverside — Comunidad cerrada (34 casas)",
        "Kelly Dr #8 · BA-1 · Conteo PZwiki gated = 34",
    )
    pdf.cover(
        "VOLUMEN 03 — GATED COMMUNITY",
        [
            f"{RIVERSIDE_HOUSE_COUNT_GATED} mansiones dentro del perímetro (PZwiki).",
            "Kelly Dr. #8 @ 6784x5329 (flier July 4th Block Party).",
            "Ancla comunidad ~6695x5418 / pocket ~6770x5320.",
            "Instalar BA-1 + loot crítico de fase.",
        ],
        {"Casas": "34", "Calle clave": "Kelly Dr.", "BA": "BA-1"},
    )
    _faith_note(pdf)

    pdf.h1("Asalto con gates y BA")
    pdf.sector_map_schematic(
        "Gated Community — ruta",
        [
            ["FUERA S-C", "→", "GATE IN", "→", "Kelly Dr N", "→"],
            ["↓", "Loop N 8", "→", "Centro BA1", "→", "Loop N"],
            ["Loop S 8", "←", "BA-1", "→", "Kelly Dr S", "↓"],
            ["→", "Loop S", "→", "GATE OUT", "X GATE2", "X GATE3"],
        ],
        "Entra por UN solo GATE. Sella el resto (X). BA-1 en zona centro. 34 casas total.",
    )

    pdf.step(1, "Recon perímetro", "Cuenta gates desde fuera. Marca X en los que no usarás.")
    pdf.step(2, "GATE IN", "Limpia 20 tiles alrededor. Entra. Cierra tras de ti.")
    pdf.step(3, "Kelly Dr.", "Calle principal documentada; incluye #8 @ 6784x5329.")
    pdf.step(4, "Loops interiores", "Norte luego sur, casa por casa hasta 34.")
    pdf.step(5, "BA-1", "Mansión central defendible + garaje + sheet rope.")
    pdf.step(6, "Sello", "Gates secundarios barricados; nota RV-GATED 34/34.")

    pdf.loot_critical("03", LOOT_BY_VOLUME["03"])

    pdf.h1(f"34 casas — inventario fiel")
    done = 0
    for block in RIVERSIDE_GATED_STREETS:
        slug = "".join(ch for ch in block["street"].upper() if ch.isalnum())[:6]
        prefix = f"RVG-{slug}"
        pdf.house_street_block(
            block["street"], block["houses"], prefix, block["anchor"], block["risk"], block["route"]
        )
        done += block["houses"]
        pdf.checkbox(f"Bloque OK: {block['street']} ({block['houses']} casas)")

    pdf.h1("Base Avanzada #1")
    pdf.building_card(
        house(
            "RV-G-BA1", "BA-1 Mansión central (Kelly Dr / loop centro)",
            "6770x5320", "medio", "2", True, True,
            "Todos los garajes del gated son gold. Elige vista a un solo GATE.",
            HOUSE_ROOMS_GARAGE + ["Stash P1", "Cama", "Parking van+huida", "Generator corner"],
        )
    )
    pdf.checkbox_grid([
        "BA-1 cama", "BA-1 stash 2 semanas", "Van + huida", "Gas cache G",
        "Sprays stock", "Sheet rope escape", "Nota BASE-1 GATED", "Gates X sellados",
    ])

    pdf.h1("Cierre Vol 03")
    pdf.checkbox_grid([
        f"34/34 casas gated (acumulado={done})",
        "Kelly Dr #8 limpia",
        "BA-1 operativa",
        "Loot crítico 03",
        "Listo Vol 04 strip comercial",
    ])
    pdf.save()


def vol_04_comercial(path: str):
    pdf = GuidePDF(
        path, "04",
        "Riverside — Distrito comercial (POIs reales)",
        "Rock Ridge Rd · Rogers Ave · negocios PZwiki con coords",
    )
    pdf.cover(
        "VOLUMEN 04 — BUSINESS DISTRICT",
        [
            "Todos los negocios nombrados de Riverside con coordenadas wiki.",
            "Eje Rock Ridge Rd / Main St / Rogers Ave #15 (Nails & Nuts).",
            "Police 210 Rock Ridge · Fossoil 160 Rock Ridge · Pharmahug · Enigma · GigaMart.",
            "Loot crítico de fase (sledge, books, meds, guns, gas).",
        ],
        {"Riesgo": "Alto", "Base": "Operar desde BA-1", "Río": "Norte"},
    )
    _faith_note(pdf)

    pdf.h1("Ruta del strip (anti-migración)")
    pdf.sector_map_schematic(
        "Business district — orden de bloques",
        [
            ["RÍO", "RÍO", "RÍO", "RÍO", "BOAT", "RÍO"],
            ["BAIT", "→", "FOSSOIL", "→", "SPIFFO", "→"],
            ["PD 210", "→", "MAIL", "→", "ROGERS#15", "→"],
            ["↓", "SUITES", "→", "ENIGMA", "→", "PHARMA"],
            ["BAR W", "→", "GIGA", "→", "BANK", "CHURCH"],
            ["↑ BA-1", "SCHOOL S", "←", "STRIP MALL", "←", "GATE"],
        ],
        "Orden: Fossoil/PD oeste → Rogers Ave (Nails & Nuts) → Suites → Enigma/Pharmahug → GigaMart → riverfront este. Duerme en BA-1.",
    )

    pdf.loot_critical("04", LOOT_BY_VOLUME["04"])

    # Split businesses: commercial vs industrial (industrial in vol 05)
    industrial_ids = {"RV-ALS", "RV-WRECK", "RV-USTORE", "RV-LECTRO", "RV-GASNMORE", "RV-DINER-SO", "RV-WMCC", "RV-CEM"}
    # Cemetery can stay in 04 or 05 - west edge; include in 04 west block
    commercial = [b for b in RIVERSIDE_BUSINESSES if b[0] not in industrial_ids or b[0] == "RV-CEM"]
    # Actually cemetery in industrial_ids - remove from industrial for vol05 list
    commercial = [b for b in RIVERSIDE_BUSINESSES if b[0] not in {
        "RV-ALS", "RV-WRECK", "RV-USTORE", "RV-LECTRO", "RV-GASNMORE", "RV-DINER-SO", "RV-WMCC"
    }]

    pdf.h1("POIs comerciales / servicios — ficha por ficha")
    pdf.p(f"{len(commercial)} edificios de negocio/servicio documentados para este volumen.")

    # Group by rough block using x coordinate
    def block_of(coords: str) -> str:
        x = int(coords.split("x")[0])
        if x < 6000:
            return "B1 Oeste river / bar"
        if x < 6200:
            return "B2 Rock Ridge / PD / Fossoil"
        if x < 6400:
            return "B3 Centro strip / Rogers / Suites"
        if x < 6550:
            return "B4 Este Enigma / Pharma / Giga"
        return "B5 Far este church / boat"

    from collections import defaultdict
    groups = defaultdict(list)
    for row in commercial:
        groups[block_of(row[3])].append(row)

    for bname in sorted(groups.keys()):
        pdf.h1(bname)
        pdf.street_header(bname, "POI a POI, sin saltar escaparates", "alto", "Silencio total — migración ON")
        for bid, name, btype, coords, addr, risk, rooms, notes in groups[bname]:
            pdf.building_card(
                poi(bid, f"{name} — {addr}", coords, btype, risk, rooms, notes)
            )

    pdf.h1("Riverside Suites — habitaciones")
    pdf.checkbox_grid(
        [f"Suites hab {f}{u:02d}" for f in (1, 2, 3) for u in range(1, 11)], cols=3
    )

    pdf.h1("Cierre Vol 04")
    pdf.checkbox_grid([
        "Police OK", "Fossoil OK", "Nails & Nuts OK", "Enigma OK", "Pharmahug OK",
        "GigaMart OK", "Suites 100%", "School OK (si no en Vol02)",
        "Loot crítico 04", "Strip sin marcas P", "Listo Vol 05",
    ])
    pdf.save()


def vol_05_oeste_cc(path: str):
    pdf = GuidePDF(
        path, "05",
        "Riverside — Industrial SO + West Maple CC",
        "Olin Rd (KY-163) · Long Needle · Lakeshore Parkway · Lectromax",
    )
    pdf.cover(
        "VOLUMEN 05 — CIERRE RIVERSIDE",
        [
            "Lectromax Manufacturing 5568x5914 · U-Store It 5540x6055.",
            "Al's Auto 5436x5950 · Wrecking yard 5839x5391 · Gas N More.",
            "West Maple Country Club 5772x6416 / Lakeshore Parkway.",
            "Certificación Riverside total + loot crítico industrial.",
        ],
        {"Eje": "Olin Rd KY-163", "Sur": "Country Club", "Salida": "Vol 06"},
    )
    _faith_note(pdf)

    pdf.h1("Ruta SO")
    pdf.sector_map_schematic(
        "Industrial + Country Club",
        [
            ["BA-1", "→", "OLIN Rd", "→", "↓ factory", "LONG NEEDLE"],
            ["WRECK", "→", "ALS AUTO", "→", "LECTROMAX", "→"],
            ["↓", "GAS N MORE", "→", "U-STORE", "→", "DINER"],
            ["→", "LAKESHORE", "→", "WMCC GATE", "→", "GREENS"],
            ["SCENIC Vol06", "←", "KY-163 S", "←", "CC DONE", "OK"],
        ],
        "Baja por Olin Rd (KY-163). Factory/storage antes que Country Club. Scenic Grove = Vol 06.",
    )

    pdf.loot_critical("05", LOOT_BY_VOLUME["05"])

    industrial = [b for b in RIVERSIDE_BUSINESSES if b[0] in {
        "RV-ALS", "RV-WRECK", "RV-USTORE", "RV-LECTRO", "RV-GASNMORE", "RV-DINER-SO", "RV-WMCC"
    }]

    pdf.h1("POIs industriales y Country Club")
    for bid, name, btype, coords, addr, risk, rooms, notes in industrial:
        pdf.building_card(poi(bid, f"{name} — {addr}", coords, btype, risk, rooms, notes))

    pdf.h1("U-Store It — units")
    pdf.checkbox_grid(
        [f"Unit {row}{n:02d}" for row in "ABCD" for n in range(1, 13)], cols=4
    )

    pdf.h1("Wrecking yard — vehículos")
    pdf.checkbox_grid([f"Vehículo desguace {i:02d}/25" for i in range(1, 26)], cols=2)

    pdf.h1("West Maple — checklist campus")
    pdf.checkbox_grid([
        "Parking limpio", "Main hall", "Gym", "Ballroom", "Lockers",
        "Bar", "Pro shop", "Maintenance", "Greens A", "Greens B",
        "Spray WMCC OK", "Nota mapa COUNTRY CLUB OK",
    ])

    pdf.h1("Certificación Riverside TOTAL")
    pdf.checkbox_grid([
        "Vol02: 70 casas suburbios",
        "Vol03: 34 casas gated + BA-1",
        "Vol04: strip POIs wiki",
        "Vol05: Lectromax/U-Store/Al's/Wreck/CC",
        "Loot crítico 02-05",
        "Nota RIVERSIDE TOTAL OK",
        "Listo Vol 06 corredor oeste",
    ])
    pdf.save()
