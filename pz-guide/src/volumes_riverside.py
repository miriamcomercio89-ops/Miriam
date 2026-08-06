"""Volumes 02-05: complete Riverside clearing."""

from __future__ import annotations

from pdf_engine import GuidePDF
from buildings import house, poi, residential_block, numbered_units, SHOP_ROOMS, WAREHOUSE_ROOMS, HOUSE_ROOMS_GARAGE
from theme import mm


def _intro(pdf: GuidePDF, phase: str, goal: str):
    pdf.h1(f"Objetivo de fase: {phase}")
    pdf.p(goal)
    pdf.callout(
        "REGLA DE FRENTE",
        "Termina cada CALLE (ambos lados) antes de abrir la siguiente. "
        "Si abandonas a mitad, marca P (parcial) y anota el ID exacto donde paraste.",
    )


def vol_02_suburbios(path: str):
    pdf = GuidePDF(
        path,
        "02",
        "Riverside — Suburbios sur (casa por casa)",
        "Primera zona de limpieza total · Densidad baja-media",
    )
    pdf.cover(
        "VOLUMEN 02 — RIVERSIDE SUR",
        [
            "7 sectores residenciales + POIs de borde.",
            "Orden calle por calle desde el spawn hacia el este/oeste.",
            "Fichas de edificio con habitaciones y marcado.",
            "No entrar aún a Gated Community ni Business District.",
        ],
        {"Centro ~": "6300x5668", "Riesgo": "Bajo→Medio", "BA": "Temporal en spawn"},
    )
    _intro(
        pdf,
        "Suburbios sur",
        "Limpiar todas las viviendas al sur del strip comercial y al oeste/este del eje central, "
        "excluyendo la Comunidad Cerrada (Vol 03) y el Country Club (Vol 05). "
        "Al terminar, Riverside residencial 'común' debe estar OK.",
    )

    pdf.h1("Mapa de sectores (orden)")
    pdf.sector_map_schematic(
        "Suburbios Riverside — vista operativa (norte↑ hacia business district)",
        [
            ["COMERCIAL (Vol04)", "COMERCIAL (Vol04)", "GATED (Vol03)"],
            ["S-B Oeste", "S-A Spawn", "S-C Este cercano"],
            ["S-D Sur-oeste", "S-E Sur-centro", "S-F Sur-este"],
            ["IND/STORAGE Vol05", "S-G Extensión sur", "HACIA COUNTRY CLUB"],
        ],
        "Empieza S-A → S-B → S-C → S-E → S-D → S-F → S-G. No subas al comercial.",
    )

    # Sector A
    pdf.h1("Sector S-A — Barrio Spawn")
    pdf.street_header(
        "S-A · Manzana Spawn Norte",
        "Oeste → Este por la acera norte, luego Este → Oeste por la sur",
        "bajo",
        "Casas del spawn y adyacentes. Aprende el SOP aquí.",
    )
    pdf.sector_map_schematic(
        "S-A manzana 1",
        [
            ["A01", "A02", "A03", "A04", "A05"],
            ["CALLE LOCAL", "CALLE LOCAL", "CALLE LOCAL", "CALLE LOCAL", "CALLE LOCAL"],
            ["A06", "A07", "A08", "A09", "A10"],
        ],
        "Limpia fila norte A01→A05, luego fila sur A06→A10.",
    )
    for b in residential_block("RV-SA-N", "Calle Spawn N", "lado norte", 101, 5, 6280, 5580, 14, 0, "bajo"):
        pdf.building_card(b)
    for b in residential_block("RV-SA-S", "Calle Spawn S", "lado sur", 102, 5, 6280, 5610, 14, 0, "bajo"):
        pdf.building_card(b)

    pdf.street_header(
        "S-A · Manzana Spawn Este",
        "Norte → Sur en cul-de-sac",
        "bajo",
        "Cierra el bolsillo este del spawn antes de salir del sector.",
    )
    for b in residential_block("RV-SA-E", "Cul-de-sac Este", "anillo", 201, 8, 6340, 5570, 0, 12, "bajo"):
        pdf.building_card(b)
    pdf.h2("Cierre S-A")
    pdf.checkbox_grid(
        [
            "Todas las casas S-A con spray L",
            "Nota mapa: RV-S-A OK",
            "Coches driveway revisados",
            "Zombis calle 0 visibles",
            "Stash temporal creado",
            "Listo S-B",
        ]
    )

    # Sector B
    pdf.h1("Sector S-B — Suburbios oeste")
    pdf.street_header(
        "S-B · Calle residencial oeste (paralela al eje)",
        "Sur → Norte, luego retorno por atrás",
        "bajo",
        "Acercamiento controlado hacia ferretería/gas, sin entrar al strip.",
    )
    for b in residential_block("RV-SB-1", "Residencial Oeste 1", "este", 11, 10, 6100, 5600, 0, 14, "bajo"):
        pdf.building_card(b)
    for b in residential_block("RV-SB-2", "Residencial Oeste 2", "oeste", 12, 10, 6070, 5600, 0, 14, "bajo"):
        pdf.building_card(b)

    pdf.street_header(
        "S-B · Mini-plaza de barrio",
        "Entrada única desde sur",
        "medio",
        "Si hay tienda de conveniencia / buzones / small shop, trátarlo como POI.",
    )
    pdf.building_card(
        poi(
            "RV-SB-POI-01",
            "Tienda de barrio / conveniencia (si presente en layout 42.20)",
            "6120x5550",
            "Comercio menor",
            "medio",
            SHOP_ROOMS,
            "Si el redesign movió el POI, busca el comercio más cercano al sector y usa este ID igual.",
        )
    )
    for b in residential_block("RV-SB-3", "Trasplaza Oeste", "ambos", 31, 6, 6140, 5520, 12, 0, "bajo"):
        pdf.building_card(b)
    pdf.h2("Cierre S-B")
    pdf.checkbox_grid(
        [
            "S-B residencial OK",
            "POI barrio limpio o N/A marcado",
            "Nota mapa RV-S-B OK",
            "Sin zombis en calles S-B",
            "Ruta a S-C planificada",
            "Gas cache G si hay sobrante",
        ]
    )

    # Sector C
    pdf.h1("Sector S-C — Este cercano (antes del gated)")
    pdf.street_header(
        "S-C · Frontera con Comunidad Cerrada",
        "Oeste → Este hasta ver verjas del gated",
        "medio",
        "NO entres al gated. Solo limpia casas fuera de la valla.",
    )
    pdf.callout(
        "FRONTERA VOL 03",
        "Cuando veas la valla/iron gate de la comunidad cerrada: DETENTE. "
        "Ese interior es Volumen 03. Marca las casas exteriores y sella S-C.",
    )
    for b in residential_block("RV-SC-1", "Avenida Este Cercano", "norte", 401, 9, 6500, 5480, 13, 0, "medio", True, "mixta"):
        pdf.building_card(b)
    for b in residential_block("RV-SC-2", "Avenida Este Cercano", "sur", 402, 9, 6500, 5515, 13, 0, "medio"):
        pdf.building_card(b)
    for b in residential_block("RV-SC-3", "Calle secundaria S-C", "loop", 501, 7, 6550, 5550, 10, 8, "bajo"):
        pdf.building_card(b)

    # Sector E then D then F then G
    pdf.h1("Sector S-E — Sur-centro")
    pdf.street_header("S-E · Residencial sur del eje", "Este → Oeste", "bajo", "Zona generalmente calmada; buen farming de XP melee.")
    for b in residential_block("RV-SE-1", "Sur-centro 1", "norte", 601, 12, 6240, 5720, 12, 0, "bajo"):
        pdf.building_card(b)
    for b in residential_block("RV-SE-2", "Sur-centro 2", "sur", 602, 12, 6240, 5755, 12, 0, "bajo"):
        pdf.building_card(b)

    pdf.h1("Sector S-D — Sur-oeste hacia industrial")
    pdf.street_header(
        "S-D · Transición a factories/storage",
        "Norte → Sur",
        "medio",
        "Más zombis errantes. No abras naves (Vol 05).",
    )
    for b in residential_block("RV-SD-1", "Sur-oeste residencial", "este", 701, 8, 5900, 5750, 0, 13, "medio"):
        pdf.building_card(b)
    for b in residential_block("RV-SD-2", "Sur-oeste residencial", "oeste", 702, 8, 5865, 5750, 0, 13, "medio"):
        pdf.building_card(b)
    pdf.building_card(
        house(
            "RV-SD-FARM-01",
            "Casa de campo / farmhouse borde S-D",
            "5693x5740",
            "medio",
            "2",
            True,
            True,
            "POI conocido de abandoned farmhouses en suroeste. Loot tools/seeds.",
            HOUSE_ROOMS_GARAGE + ["Granero / shed", "Corral exterior"],
        )
    )

    pdf.h1("Sector S-F — Sur-este")
    pdf.street_header("S-F · Bolsillo sur-este", "Loop horario", "bajo", "Cierra casas antes de country club road.")
    for b in residential_block("RV-SF-1", "Sur-este loop", "anillo", 801, 10, 6450, 5800, 11, 9, "bajo"):
        pdf.building_card(b)

    pdf.h1("Sector S-G — Extensión sur")
    pdf.street_header(
        "S-G · Casas dispersas hacia Country Club",
        "Norte → Sur por la carretera",
        "medio",
        "Limpia viviendas a ambos lados. El campus del club es Vol 05.",
    )
    for b in residential_block("RV-SG-1", "Road to Country Club", "este", 901, 6, 6000, 6000, 0, 40, "medio", True, "rural"):
        pdf.building_card(b)
    for b in residential_block("RV-SG-2", "Road to Country Club", "oeste", 902, 6, 5960, 6000, 0, 40, "medio", True, "rural"):
        pdf.building_card(b)

    pdf.h1("POIs menores embebidos en suburbios")
    for b in [
        poi("RV-S-POI-SCH", "Escuela / complex escolar (sur del strip)", "6380x5450", "Escuela", "alto",
            ["Parking", "Entrada", "Aulas ala A", "Aulas ala B", "Gimnasio", "Cafetería", "Oficinas", "Biblioteca"],
            "Si está en tu layout 42.20 dentro del borde sur-comercial, límpiala AHORA. Si cae en comercial, pásala a Vol 04."),
        poi("RV-S-POI-POST", "Post Office (candidato base temporal)", "6320x5400", "Servicio", "medio",
            ["Entrada", "Zona pública", "Sorting room", "Almacén", "Oficina", "Azotea"],
            "Solo si está accesible sin abrir todo el business district."),
    ]:
        pdf.building_card(b)

    pdf.h1("Checklist de cierre Volumen 02")
    pdf.checkbox_grid(
        [
            "S-A OK", "S-B OK", "S-C OK (sin gated)", "S-D OK",
            "S-E OK", "S-F OK", "S-G casas OK", "Escuela hecha o diferida anotada",
            "Spray SECTOR OK en esquinas", "Notas mapa actualizadas",
            "0 edificios con marca P", "Listo Volumen 03",
        ]
    )
    pdf.save()


def vol_03_gated(path: str):
    pdf = GuidePDF(
        path,
        "03",
        "Riverside — Comunidad cerrada (este)",
        "Base Avanzada #1 · Loot alto · Densidad media-alta",
    )
    pdf.cover(
        "VOLUMEN 03 — GATED COMMUNITY",
        [
            "Limpieza mansión por mansión dentro del perímetro.",
            "Instalación de BA-1.",
            "Garajes y vehículos raros.",
            "Sello completo del este de Riverside.",
        ],
        {"Coords ~": "6695x5418 / 6770x5320", "Riesgo": "Medio-Alto", "BA-1": "Aquí"},
    )
    _intro(
        pdf,
        "Comunidad cerrada",
        "Entra por UNA sola puerta/gate. Limpia el perímetro interior primero, luego manzanas "
        "interiores en espiral hacia el centro. Elige una mansión central como BA-1.",
    )

    pdf.h1("Plan de asalto")
    pdf.step(1, "Recon desde fuera", "Camina el perímetro exterior. Cuenta gates. No abras todas.")
    pdf.step(2, "Gate principal", "Limpia 20 tiles alrededor del gate elegido. Marca X en gates no usados.")
    pdf.step(3, "Anillo perimetral interior", "Casas que dan a la valla, en sentido horario.")
    pdf.step(4, "Calles interiores", "Una calle completa por sesión.")
    pdf.step(5, "Elegir BA-1", "Mansión central, 2 plantas, garaje, buena línea de fuga.")
    pdf.step(6, "Sello", "Todos los gates cerrados/barricados salvo 1 controlado.")

    pdf.sector_map_schematic(
        "Gated — anillos",
        [
            ["G1", "G2", "G3", "G4", "G5", "G6"],
            ["G18", "I1", "I2", "I3", "I4", "G7"],
            ["G17", "I10", "BA1", "I5", "I6", "G8"],
            ["G16", "I9", "I8", "I7", "G10", "G9"],
            ["G15", "G14", "G13", "G12", "G11", "GATE"],
        ],
        "G = anillo perimetral, I = interior, BA1 = base. Orden: G1→G18, luego I1→I10, luego BA1.",
    )

    pdf.h1("Anillo perimetral G (18 mansiones)")
    for b in residential_block(
        "RV-G", "Gated Perímetro", "anillo horario", 1, 18, 6620, 5280, 18, 8, "alto", True, "mansión"
    ):
        b["risk"] = "alto"
        b["rooms"] = HOUSE_ROOMS_GARAGE + ["Sala de estar amplia", "Walk-in closet", "Patio vallado"]
        b["notes"] = "Rich zombies posibles. Revisa joyas/armas en dormitorio principal."
        pdf.building_card(b)

    pdf.h1("Interior I (10 mansiones)")
    for b in residential_block(
        "RV-GI", "Gated Interior", "calles internas", 100, 10, 6700, 5340, 16, 12, "medio", True, "mansión"
    ):
        pdf.building_card(b)

    pdf.h1("Base Avanzada #1")
    pdf.building_card(
        house(
            "RV-G-BA1",
            "BA-1 Mansión central (elige la más defendible)",
            "6770x5320",
            "medio",
            "2",
            True,
            True,
            "Fortifica ventanas calle. Deja trasera con sheet rope. Stash en planta alta.",
            HOUSE_ROOMS_GARAGE
            + [
                "Zona stash (crate wall)",
                "Cama + alarma visual",
                "Parking BA (1 van + 1 huida)",
                "Generator shed / lateral",
            ],
        )
    )
    pdf.h2("Checklist BA-1")
    pdf.checkbox_grid(
        [
            "Cama colocada",
            "Agua (lluvia/pot + río trips)",
            "Comida 2 semanas",
            "Tools set completo",
            "Spray paints stock",
            "Generator + gas (si tienes)",
            "Vehículo van",
            "Vehículo huida",
            "Puertas barricadas selectivas",
            "Nota mapa BASE-1 GATED",
            "Sheet rope escape",
            "Libros skill en estantería",
        ]
    )

    pdf.h1("Cierre Volumen 03")
    pdf.checkbox_grid(
        [
            "18 perimetrales L",
            "10 interiores L",
            "BA-1 operativa",
            "Gates secundarios sellados",
            "Nota RV-GATED OK",
            "Listo Vol 04 (comercial)",
        ]
    )
    pdf.save()


def vol_04_comercial(path: str):
    pdf = GuidePDF(
        path,
        "04",
        "Riverside — Distrito comercial norte",
        "Mayor densidad de Riverside · Strip + riverfront",
    )
    pdf.cover(
        "VOLUMEN 04 — BUSINESS DISTRICT",
        [
            "Limpieza POI por POI del strip norte.",
            "Police, pharmacy, books, Gigamart, motel, offices.",
            "Ruta anti-migración: de oeste a este, un bloque cada vez.",
            "Riverfront completo.",
        ],
        {"Riesgo": "Alto", "Estilo": "Silencio total", "Base": "Operar desde BA-1"},
    )
    _intro(
        pdf,
        "Distrito comercial",
        "Vuelve siempre a dormir a BA-1. No bases aquí hasta que el strip esté OK. "
        "Población alta + migración: un tiroteo puede rellenar calles ya limpias.",
    )

    pdf.h1("Orden de bloques comerciales")
    pdf.table(
        ["Orden", "Bloque", "Coords ~", "Riesgo"],
        [
            ["1", "Gas / hardware oeste", "6084x5309", "Medio"],
            ["2", "Police + alrededores", "6082x5261", "Alto"],
            ["3", "Pharmacy + Enigma Books", "strip central", "Medio"],
            ["4", "Offices / toy / strip shops", "6450x5310", "Alto"],
            ["5", "Motel / hotel", "6350x5250", "Alto"],
            ["6", "Gigamart borde", "este strip", "Alto"],
            ["7", "Hit Vids / Fossoil este", "este", "Medio"],
            ["8", "Riverside bar + yards", "5960x5420", "Medio"],
            ["9", "Riverfront restante", "todo el norte", "Medio"],
        ],
        [18 * mm, 70 * mm, 45 * mm, 45 * mm],
    )

    blocks = [
        ("Bloque C-1 · Gasolinera / Hardware oeste", [
            poi("RV-C-GAS-W", "Gasolinera oeste + dock pesca", "6084x5309", "Gasolinera", "medio",
                ["Islas de combustible", "Tienda", "Trastero", "Baño", "Dock / orilla"],
                "Prioridad: gas cans, maps, snacks. Dock = fishing tiles."),
            poi("RV-C-HW", "Ferretería / hardware store", "6060x5320", "Ferretería", "medio",
                SHOP_ROOMS + ["Pasillo tools", "Semillas / farming", "Generator magazines"],
                "Day-1 priority histórica. Aún crítica si no lo looteaste."),
        ]),
        ("Bloque C-2 · Policía", [
            poi("RV-C-PD", "Police Station Riverside", "6082x5261", "Policía", "alto",
                ["Entrada", "Recepción", "Oficinas", "Celdas", "Armería / storage", "Parking trasero"],
                "Únicas firearms fiables del pueblo. Silencio extremo. Loot y sella."),
        ]),
        ("Bloque C-3 · Salud y libros", [
            poi("RV-C-PHARM", "Pharmacy", "6200x5300", "Farmacia", "medio", SHOP_ROOMS + ["Nevera meds"],
                "Antibiotics, painkillers, vitamins."),
            poi("RV-C-BOOKS", "Enigma Books (junto pharmacy)", "6215x5300", "Librería", "medio",
                ["Entrada", "Estanterías skillbooks", "Mostrador", "Trastero"],
                "Vacía skillbooks: Carpentry, Metalwork, Mechanics, First Aid, Foraging."),
        ]),
        ("Bloque C-4 · Offices / strip shops", [
            poi("RV-C-OFF-1", "Office block / toy store strip", "6450x5310", "Oficinas/tiendas", "alto",
                ["Escaparate 1", "Escaparate 2", "Oficinas planta 1", "Oficinas planta 2", "Almacén"],
                "Limpia tienda por tienda; no saltes escaparates."),
            poi("RV-C-OFF-2", "Bloque oficinas adyacente", "6480x5290", "Oficinas", "alto",
                ["Lobby", "Cubículos", "Sala reuniones", "Baños", "Azotea"], ""),
            poi("RV-C-SHOP-1", "Tienda ropa / misc strip #1", "6400x5320", "Comercio", "medio", SHOP_ROOMS, ""),
            poi("RV-C-SHOP-2", "Tienda misc strip #2", "6420x5320", "Comercio", "medio", SHOP_ROOMS, ""),
            poi("RV-C-SHOP-3", "Tienda misc strip #3", "6440x5320", "Comercio", "medio", SHOP_ROOMS, ""),
        ]),
        ("Bloque C-5 · Motel", [
            poi("RV-C-MOTEL", "Motel / hotel multi-planta", "6350x5250", "Motel", "alto",
                ["Recepción", "Pasillo planta 1", "Habitaciones 101-110", "Pasillo planta 2",
                 "Habitaciones 201-210", "Planta 3 si existe", "Laundry / storage", "Parking"],
                "Habitación = checkbox mental. Usa IDs RV-C-MOT-Rxx si necesitas lista aparte."),
        ]),
    ]

    # expand motel rooms as individual cards
    for title, items in blocks:
        pdf.h1(title)
        pdf.street_header(title, "Entrada menos densa → núcleo", "alto", "Una estructura a la vez")
        for b in items:
            pdf.building_card(b)

    pdf.h1("Motel — habitaciones individuales (checklist ultra)")
    motel_rooms = [f"Habitación {floor}{unit:02d}" for floor in (1, 2, 3) for unit in range(1, 11)]
    pdf.checkbox_grid(motel_rooms, cols=3)

    pdf.h1("Bloque C-6 · Gigamart")
    pdf.building_card(
        poi(
            "RV-C-GIGA",
            "GigaMart Riverside (borde suburbios/comercial)",
            "6550x5400",
            "Supermercado",
            "alto",
            [
                "Parking perimetral",
                "Entrada automática",
                "Cajas / front",
                "Pasillos comida A",
                "Pasillos comida B",
                "Higiene / cleaning",
                "Electrónica / misc",
                "Almacén trasero",
                "Oficina manager",
                "Loading bay",
            ],
            "Entrada por loading bay suele ser más controlable. Saca comida a la van en trips.",
        )
    )

    pdf.h1("Bloque C-7 · Este comercial")
    for b in [
        poi("RV-C-FOS", "Fossoil / gas este", "6650x5380", "Gasolinera", "medio",
            ["Bombas", "Tienda", "Trastero", "Oficina"], "Fuel cache G."),
        poi("RV-C-HIT", "Hit Vids!", "6670x5390", "Video store", "medio", SHOP_ROOMS, "Entertainment + possible VHS."),
    ]:
        pdf.building_card(b)

    pdf.h1("Bloque C-8 · Bar y yards oeste")
    for b in [
        poi("RV-C-BAR", "Riverside Bar", "5960x5420", "Bar", "medio",
            ["Entrada", "Salón", "Barra", "Trastero alcohol", "Baños", "Trastienda"],
            "Ruido alto si rompes cristales. Melee only."),
        poi("RV-C-YARD", "West wreck / office yard", "5800x5420", "Yard/office", "medio",
            ["Office", "Yard vehículos", "Shed"], "Revisa vehículos abandonados."),
    ]:
        pdf.building_card(b)

    pdf.h1("Bloque C-9 · Riverfront restante")
    pdf.p(
        "Recorre TODA la orilla del Ohio River en el borde norte de Riverside. "
        "Cada edificio que toque riverfront debe tener ID y marca L. "
        "Usa la siguiente lista genérica + añade IDs si el redesign 42.20 añadió estructuras únicas."
    )
    for b in numbered_units("RV-C-RF", "Riverfront structure", 12, 5900, 5200, "medio", "Edificio riverfront",
                            ["Exterior orilla", "Entrada", "Interior", "Muelle/patio"]):
        pdf.building_card(b)

    # remaining small shops filler for strip completeness
    pdf.h1("Escaparates restantes del strip (forzado)")
    for b in numbered_units("RV-C-ST", "Strip shop", 16, 6300, 5310, "alto", "Local comercial", SHOP_ROOMS):
        pdf.building_card(b)

    pdf.h1("Cierre Volumen 04")
    pdf.checkbox_grid(
        [
            "C-1 OK", "C-2 OK", "C-3 OK", "C-4 OK", "C-5 motel 100%",
            "C-6 Gigamart OK", "C-7 OK", "C-8 OK", "C-9 riverfront OK",
            "Strip shops 16/16", "Nota RV-COMERCIAL OK", "Sin marcas P",
            "BA-1 intacta", "Listo Vol 05",
        ]
    )
    pdf.save()


def vol_05_oeste_cc(path: str):
    pdf = GuidePDF(
        path,
        "05",
        "Riverside — Oeste industrial + Country Club",
        "Cierre total de Riverside · Junkyard · Factory · West Maple CC",
    )
    pdf.cover(
        "VOLUMEN 05 — CIERRE RIVERSIDE",
        [
            "Junkyard, storage units, factory, farms suroeste.",
            "West Maple Country Club campus completo.",
            "Certificación: Riverside 100% limpio.",
        ],
        {"Riesgo": "Medio→Alto", "Salida": "Hacia Vol 06 oeste"},
    )
    _intro(
        pdf,
        "Industrial oeste + Country Club",
        "Con el comercial sellado, limpia la retaguardia industrial y el sur extremo. "
        "Al cerrar este volumen, Riverside completo queda OK y puedes expandir campaña.",
    )

    pdf.h1("I-1 · Junkyard (oeste)")
    pdf.building_card(
        poi(
            "RV-I-JUNK",
            "Junkyard ribereño",
            "5600x5400",
            "Desguace",
            "medio",
            [
                "Gate entrada",
                "Perímetro chain-link",
                "Zona coches fila A",
                "Zona coches fila B",
                "Zona coches fila C",
                "Office / trailer",
                "Pilas de scrap",
                "Esquina río (pesca)",
            ],
            "15-25 vehículos. Metalworking gold. Refuerza fence si usas como BA secundaria.",
        )
    )
    pdf.checkbox_grid([f"Vehículo junkyard slot {i:02d} revisado" for i in range(1, 26)], cols=2)

    pdf.h1("I-2 · Storage units")
    pdf.building_card(
        poi(
            "RV-I-STOR",
            "Storage center / units",
            "5530x6060",
            "Trasteros",
            "medio",
            ["Office", "Gate interior", "Pasillo A", "Pasillo B", "Pasillo C", "Pasillo D"],
            "Cada unit es un checkbox abajo.",
        )
    )
    pdf.checkbox_grid([f"Unit A{i:02d}" for i in range(1, 13)] + [f"Unit B{i:02d}" for i in range(1, 13)]
                      + [f"Unit C{i:02d}" for i in range(1, 13)] + [f"Unit D{i:02d}" for i in range(1, 13)], cols=4)

    pdf.h1("I-3 · Factory + warehouses")
    pdf.building_card(
        poi(
            "RV-I-FACT",
            "Factory suroeste",
            "5570x5899",
            "Fábrica",
            "alto",
            WAREHOUSE_ROOMS + ["Sala máquinas", "Lockers", "Tejado"],
            "Propane, welding, parts. Ruido de combate atrae desde S-D — ya debería estar limpio.",
        )
    )
    for b in numbered_units("RV-I-WH", "Warehouse lote", 6, 5500, 5850, "alto", "Nave", WAREHOUSE_ROOMS):
        pdf.building_card(b)

    pdf.h1("I-4 · Diner y POIs suroeste")
    for b in [
        poi("RV-I-DINER", "Diner suroeste", "5650x5900", "Restaurante", "medio",
            ["Entrada", "Comedor", "Barra", "Cocina", "Trastero"], ""),
        house("RV-I-FARM-02", "Abandoned farmhouse cluster #2", "5720x5820", "medio", "2", True, True,
              "Revisa sheds y campos."),
        house("RV-I-FARM-03", "Abandoned farmhouse cluster #3", "5780x5880", "medio", "1-2", True, True, ""),
    ]:
        pdf.building_card(b)

    pdf.h1("CC · West Maple Country Club (sur)")
    pdf.street_header(
        "Country Club campus",
        "Carretera de acceso → parking → edificio principal → anexos → campo",
        "alto",
        "Rich zombies. No disparar. Limpiar campus completo.",
    )
    pdf.sector_map_schematic(
        "Country Club",
        [
            ["ROAD", "PARKING", "PARKING"],
            ["PRO SHOP", "MAIN HALL", "GYM"],
            ["LOCKER", "BALLROOM", "BAR"],
            ["ANNEX", "GREEN", "SHED"],
        ],
        "Coords campus ~5750x6440 / 5755x6445",
    )
    for b in [
        poi("RV-CC-PARK", "Parking Country Club", "5750x6400", "Parking", "alto",
            ["Fila norte", "Fila sur", "Borde arbolado"], "Limpia zombis de parking antes del hall."),
        poi("RV-CC-MAIN", "Main hall / clubhouse", "5755x6445", "Club", "alto",
            ["Entrada", "Lobby", "Comedor", "Cocina", "Oficinas admin", "Pasillos", "Baños"],
            "Núcleo del campus."),
        poi("RV-CC-GYM", "Gym / recreación", "5780x6440", "Gimnasio", "alto",
            ["Sala máquinas", "Almacén sport", "Vestuarios"], ""),
        poi("RV-CC-BALL", "Ballroom", "5760x6460", "Salón", "alto",
            ["Salón principal", "Trastienda", "Bar lateral"], ""),
        poi("RV-CC-LOCK", "Locker rooms", "5740x6460", "Vestuarios", "alto",
            ["Lockers hombres", "Lockers mujeres", "Duchas", "Storage"], ""),
        poi("RV-CC-BAR", "Bar del club", "5770x6475", "Bar", "alto",
            ["Barra", "Mesas", "Trastero"], "Rich loot clothing/jewelry possible."),
        poi("RV-CC-PRO", "Pro shop", "5720x6420", "Tienda", "medio", SHOP_ROOMS, ""),
        poi("RV-CC-ANNEX", "Annex / maintenance", "5700x6480", "Mantenimiento", "medio",
            ["Taller", "Shed herramientas", "Depósito"], ""),
        poi("RV-CC-GREEN", "Campo / greens exteriores", "5800x6550", "Exterior", "medio",
            ["Fairway zona A", "Fairway zona B", "Borde arbolado", "Caseta remota"],
            "Patrulla visual completa; mata errantes."),
    ]:
        pdf.building_card(b)

    pdf.h1("Certificación Riverside total")
    pdf.p("Solo marca esto si Vol 02+03+04+05 están cerrados al 100%.")
    pdf.checkbox_grid(
        [
            "Suburbios sur OK",
            "Gated OK + BA-1",
            "Comercial OK",
            "Junkyard OK",
            "Storage OK",
            "Factory/warehouses OK",
            "Country Club OK",
            "Farms suroeste OK",
            "Riverfront OK",
            "0 marcas P en Riverside",
            "Nota mapa: RIVERSIDE TOTAL OK",
            "Spray grande en BA-1: RV 100",
            "Vehículos listos para Vol 06",
            "Fuel caches G inventariados",
        ]
    )
    pdf.callout(
        "SIGUIENTE",
        "Abre Volumen 06 — Corredor oeste (farms, Scenic Grove, radio relay, abandoned town) "
        "hacia Brandenburg. No vayas a West Point todavía.",
    )
    pdf.save()
