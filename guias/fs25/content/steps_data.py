# -*- coding: utf-8 -*-
"""Definición estructurada de los 500 pasos de la guía FS25."""

from __future__ import annotations

# Datos de cultivos (economía normal, valores orientativos wiki FS25)
CROPS = {
    "trigo": {"rendimiento": 17800, "precio": 1011, "semillas": 308, "siembra": "09-10", "cosecha": "07-08", "tipo": "cereal"},
    "cebada": {"rendimiento": 19200, "precio": 938, "semillas": 265, "siembra": "09-10", "cosecha": "06-08", "tipo": "cereal"},
    "avena": {"rendimiento": 11400, "precio": 1596, "semillas": 340, "siembra": "03-04", "cosecha": "07-08", "tipo": "cereal"},
    "colza": {"rendimiento": 11600, "precio": 1808, "semillas": 7, "siembra": "08-09", "cosecha": "07-08", "tipo": "oleaginosa"},
    "maiz": {"rendimiento": 18400, "precio": 1139, "semillas": 53, "siembra": "04-05", "cosecha": "08-11", "tipo": "cereal"},
    "girasol": {"rendimiento": 10400, "precio": 2018, "semillas": 143, "siembra": "03-04", "cosecha": "10-11", "tipo": "oleaginosa"},
    "soja": {"rendimiento": 9000, "precio": 2333, "semillas": 214, "siembra": "04-05", "cosecha": "10-11", "tipo": "leguminosa"},
    "sorgo": {"rendimiento": 16400, "precio": 1290, "semillas": 35, "siembra": "04-05", "cosecha": "08-09", "tipo": "cereal"},
    "patata": {"rendimiento": 82600, "precio": 666, "semillas": 3733, "siembra": "03-04", "cosecha": "08-10", "tipo": "raiz"},
    "remolacha": {"rendimiento": 115600, "precio": 516, "semillas": 34, "siembra": "03-04", "cosecha": "10-11", "tipo": "raiz"},
    "algodon": {"rendimiento": 9940, "precio": 3755, "semillas": 50, "siembra": "02-03", "cosecha": "10-11", "tipo": "especial"},
    "cana": {"rendimiento": 226800, "precio": 357, "semillas": 12000, "siembra": "03-04", "cosecha": "10-11", "tipo": "especial"},
    "arroz": {"rendimiento": 13200, "precio": 3300, "semillas": 156, "siembra": "04-05", "cosecha": "08-09", "tipo": "especial"},
    "arroz_largo": {"rendimiento": 18000, "precio": 1589, "semillas": 500, "siembra": "04", "cosecha": "09", "tipo": "especial"},
    "espinacas": {"rendimiento": 46200, "precio": 659, "semillas": 10, "siembra": "03-05", "cosecha": "todo el año", "tipo": "hortaliza"},
    "guisantes": {"rendimiento": 9600, "precio": 3119, "semillas": 250, "siembra": "03-04", "cosecha": "07-09", "tipo": "hortaliza"},
    "judias": {"rendimiento": 13950, "precio": 2160, "semillas": 280, "siembra": "04-06", "cosecha": "08-11", "tipo": "hortaliza"},
    "zanahoria": {"rendimiento": 154000, "precio": 395, "semillas": 10, "siembra": "04-07", "cosecha": "08-11", "tipo": "hortaliza"},
    "chirivia": {"rendimiento": 139000, "precio": 392, "semillas": 10, "siembra": "04-06", "cosecha": "08-11", "tipo": "hortaliza"},
    "remolacha_roja": {"rendimiento": 115600, "precio": 366, "semillas": 40, "siembra": "04-06", "cosecha": "08-11", "tipo": "hortaliza"},
    "cebolla": {"rendimiento": 70000, "precio": 750, "semillas": 5, "siembra": "03-04", "cosecha": "08-09", "tipo": "hortaliza"},
    "uva": {"rendimiento": 18400, "precio": 1808, "semillas": "plantación", "siembra": "03-05", "cosecha": "09-10", "tipo": "permanent"},
    "aceituna": {"rendimiento": 18400, "precio": 1808, "semillas": "plantación", "siembra": "03-06", "cosecha": "10", "tipo": "permanent"},
    "hierba": {"rendimiento": 87400, "precio": 135, "semillas": 160, "siembra": "03-11", "cosecha": "todo el año", "tipo": "forraje"},
    "rabanito": {"rendimiento": 9000, "precio": 0, "semillas": 340, "siembra": "03-10", "cosecha": "abono verde", "tipo": "cubre"},
    "chopo": {"rendimiento": 56400, "precio": 119, "semillas": 1500, "siembra": "03-08", "cosecha": "ciclo largo", "tipo": "especial"},
}

DLC_LIST = [
    ("MacDon Pack", "Segado en andana (swathing) y cabezales MacDon"),
    ("New Holland CR11 Gold Edition", "Cosechadora CR11 edición dorada"),
    ("NEXAT Pack", "Sistema Wide-Span NEXAT con módulos intercambiables"),
    ("Plains & Prairies Pack", "Maquinaria norteamericana Ford, Versatile, Salford, GEA"),
    ("Straw Harvest Pack", "Paja, pellets KRONE / Bressel und Lade"),
    ("Mercedes-Benz Trucks Pack", "Camiones Actros/Arocs, MB-trac, Unimog, hooklift"),
    ("Highlands Fishing Expansion", "Mapa Kinlaig, pesca, cebollas, highland cattle"),
    ("JCB World's Fastest Tractor", "Tractor récord hasta ~247 km/h"),
    ("Vredo Pack", "Resiembra de praderas, purines y jabalíes"),
    ("Emergency Pack", "Misiones de emergencia y vehículos de bomberos"),
    ("SKY Agriculture Pack", "Sembradoras/equipos SKY con suciedad mejorada"),
    ("Beans & Alpacas Expansion", "Mapa Catuaí, café, alpacas, brahman, pigmento/resina"),
]

CHAPTERS = [
    (1, 25, "Fundamentos y partida desde cero", "#1B4332"),
    (26, 55, "Contratos: tu primer motor económico", "#2D6A4F"),
    (56, 90, "Primera tierra y primer ciclo de cereal", "#40916C"),
    (91, 130, "Suelo, fertilización y rendimiento máximo", "#52B788"),
    (131, 170, "Expansión de campos y rotaciones", "#74C69D"),
    (171, 210, "Almacenamiento, logística y ventas", "#1B4965"),
    (211, 250, "Forraje, henificación y ensilado", "#5C8001"),
    (251, 300, "Ganadería completa", "#9B2226"),
    (301, 345, "Cadenas de producción", "#BB3E03"),
    (346, 380, "Silvicultura y biomasa", "#3D405B"),
    (381, 420, "Cultivos especiales y hortícolas", "#6A994E"),
    (421, 455, "DLC de maquinaria avanzada", "#0077B6"),
    (456, 485, "Highlands Fishing y Kinlaig", "#023E8A"),
    (486, 500, "Imperio final, Catuaí y cierre", "#370617"),
]


def money(n: int | float) -> str:
    return f"{int(n):,}".replace(",", ".") + " $"


def _base_step(n: int, titulo: str, capitulo: str, objetivo: str, **kwargs) -> dict:
    return {
        "n": n,
        "titulo": titulo,
        "capitulo": capitulo,
        "objetivo": objetivo,
        "contexto": kwargs.get("contexto", ""),
        "procedimiento": kwargs.get("procedimiento", []),
        "maquinaria": kwargs.get("maquinaria", []),
        "economia": kwargs.get("economia", []),
        "checklist": kwargs.get("checklist", []),
        "consejos": kwargs.get("consejos", []),
        "errores": kwargs.get("errores", []),
        "tabla_extra": kwargs.get("tabla_extra"),
        "tabla_extra_titulo": kwargs.get("tabla_extra_titulo", ""),
        "diagrama": kwargs.get("diagrama", "flujo"),
        "nota_dlc": kwargs.get("nota_dlc", ""),
        "siguiente": kwargs.get("siguiente", ""),
    }


def build_all_steps() -> list[dict]:
    steps: list[dict] = []
    builders = [
        build_fundamentos,       # 1-25
        build_contratos,         # 26-55
        build_primer_ciclo,      # 56-90
        build_suelo,             # 91-130
        build_expansion,         # 131-170
        build_logistica,         # 171-210
        build_forraje,           # 211-250
        build_ganaderia,         # 251-300
        build_produccion,        # 301-345
        build_silvicultura,      # 346-380
        build_especiales,        # 381-420
        build_dlc_maquinaria,    # 421-455
        build_kinlaig,           # 456-485
        build_imperio,           # 486-500
    ]
    for b in builders:
        steps.extend(b())
    assert len(steps) == 500, f"Se esperaban 500 pasos, hay {len(steps)}"
    for i, s in enumerate(steps, 1):
        assert s["n"] == i, f"Paso desordenado: esperado {i}, hay {s['n']}"
    return steps


def chapter_for(n: int) -> str:
    for a, b, name, _ in CHAPTERS:
        if a <= n <= b:
            return name
    return "General"


# ---------------------------------------------------------------------------
# 1-25 Fundamentos
# ---------------------------------------------------------------------------
def build_fundamentos() -> list[dict]:
    c = "Fundamentos y partida desde cero"
    out = []
    specs = [
        (1, "Preparar PC y verificar DLC instalados",
         "Confirmar que Farming Simulator 25 y todos tus DLC están listos antes de crear la partida.",
         "Empezar sin DLC activos rompe la progresión de esta guía (swathing, NEXAT, Kinlaig, etc.)."),
        (2, "Elegir mapa: Zielonka como base ideal",
         "Crear la partida en Zielonka: mapa europeo compacto, ideal para empezar sin nada y crecer en mezcla.",
         "Zielonka (2×2 km) equilibra campos rectangulares, granjas con gallineros, 9 producciones y puntos de venta cercanos."),
        (3, "Modo de juego: Empezar de cero + economía normal",
         "Configurar la nueva partida exactamente como pediste: sin tierra, sin maquinaria, economía normal, un jugador.",
         "No elijas Nuevo Granjero: esa modalidad da granja y equipos y anula el desafío de esta guía."),
        (4, "Ajustes de crecimiento y estaciones",
         "Dejar crecimiento estacional activado (recomendado) y entender el calendario de siembra/cosecha.",
         "Con estaciones, los precios y ventanas de cultivo son realistas; sin ellas la guía de rotaciones pierde sentido."),
        (5, "Dificultad económica y préstamos",
         "Fijar economía normal, revisar límite de préstamo y coste de intereses antes del primer gasto.",
         "El préstamo es herramienta, no muleta: úsalo para tierra o un tractor barato, no para maquinaria cara de impulso."),
        (6, "Recorrido inicial del mapa sin vehículo",
         "Explorar a pie o con el vehículo inicial (si aparece alguno de servicio) los puntos clave de Zielonka.",
         "Localiza: tienda de vehículos, concesionario de animales, silos/puntos de venta, talleres y granjas en venta."),
        (7, "Menú Esc: producción, finanzas, precios y mapa",
         "Dominar las pestañas Esc que usarás cientos de veces: precios, finanzas, producción, contratos y mapa.",
         "Los precios cambian; nunca vendas a ciegas. Esta guía te enseñará a mirar el historial antes de cada viaje."),
        (8, "Sistema de contratos: visión general",
         "Abrir el menú de contratos y entender tipos, recompensa, plazo y opción de alquilar maquinaria.",
         "Los contratos son tu sueldo inicial cuando no tienes campos propios."),
        (9, "Tienda de vehículos y filtros útiles",
         "Aprender a filtrar por potencia, categoría, marca y precio; marcar favoritos mentales para compras futuras.",
         "Con todos los DLC la tienda es enorme: filtrar evita comprar el equipo equivocado."),
        (10, "Alquiler vs compra vs leasing mental",
         "Interiorizar cuándo alquilar (contratos), cuándo comprar usado/barato y cuándo esperar.",
         "Al inicio: alquilar casi siempre. Comprar solo herramientas que uses 3+ veces por mes de juego."),
        (11, "Trabajadores AI y costes por hora",
         "Entender cómo contratar ayudantes, su consumo de combustible y cuándo merecen la pena.",
         "Un AI en un campo pequeño puede costar más de lo que ahorras; en campos grandes es oro."),
        (12, "Combustible, mantenimiento y taller",
         "Localizar gasolineras/talleres y crear el hábito de revisar desgaste antes de jornadas largas.",
         "Una cosechadora rota a mitad de campo te hace perder la ventana de precios altos."),
        (13, "Construcción: modo build y categorías",
         "Abrir el menú de construcción y memorizar silos, cobertizos, corrales, producciones e invernaderos.",
         "En Empezar de cero construirás tu granja pieza a pieza; no compres producciones caras el día 1."),
        (14, "Terrenos en venta: mapa de farmland",
         "Activar la capa de terrenos y anotar precios de parcelas pequeñas cerca de la tienda/contratos.",
         "Tu primera compra debe ser barata, accesible y cultivable con tractor pequeño."),
        (15, "HUD de campo: estado del suelo",
         "Aprender a leer necesidades de cal, fertilización, plagas, rastrojos y estado de cultivo.",
         "El HUD es tu agrónomo: si no lo miras, regalas rendimiento."),
        (16, "Calendario de cultivos base",
         "Memorizar las ventanas del trigo/cebada/colza/maíz: serán tu núcleo económico temprano.",
         "Trigo/cebada se siembran en otoño; maíz/soja en primavera. Planifica el año completo."),
        (17, "Puntos de venta de Zielonka",
         "Visitar mentalmente: Grain Pool, molino, supermercado, lácteos, mercado agrícola, biomasa, dealer.",
         "Cada producto tiene sitios óptimos; la distancia cuenta en tiempo y combustible."),
        (18, "Producciones del mapa (aún sin comprarlas)",
         "Revisar las 9 producciones: panadería, biogás, cemento, pianos, patatas, conservas, aserradero, sopas, hilandería.",
         "No las compres aún. Primero genera caja con contratos y cereal."),
        (19, "Plan económico de los primeros 30 días",
         "Definir meta: X contratos → primer tractor → primera parcela → primer cereal de otoño o primavera.",
         "Sin plan gastarás el préstamo en un equipo que no puedes alimentar de trabajo."),
        (20, "Checklist pre-partida definitiva",
         "Cerrar ajustes: Zielonka, Empezar de cero, economía normal, estaciones on, sin mods, DLC on.",
         "Guarda la partida con nombre claro: FS25_Zielonka_Cero_v1."),
        (21, "Crear la partida y primer guardado",
         "Generar el save, pausar, y hacer un guardado manual de seguridad.",
         "Acostúmbrate a guardar antes de compras grandes y al terminar cada sesión."),
        (22, "Orientación norte y rutas principales",
         "Marcar en el mapa las carreteras que unen tienda, taller y posibles parcelas baratas.",
         "Perderse con un remolque lleno cuesta dinero y nervios."),
        (23, "Definir tu identidad de granja mixta",
         "Decidir el orden de esta guía: contratos → cereal → forraje → animales → producciones → DLC/mapas.",
         "Es exactamente la mezcla que pediste: beneficio + inmersión + contenido completo."),
        (24, "Reglas de oro de la guía (imprímelas mentalmente)",
         "Nunca dejes dinero ocioso sin meta; nunca compres máquina sin contrato/uso; siempre mira precios.",
         "Estas tres reglas te llevarán del cero al imperio sin mods."),
        (25, "Cierre del capítulo fundamentos",
         "Validar que entiendes menús, mapa, contratos y plan de 30 días antes de ganar el primer euro.",
         "A partir del paso 26 empiezas a facturar con contratos reales."),
    ]
    detail_procs = {
        1: [
            "Abre el launcher/Steam/Epic y verifica que FS25 está actualizado.",
            "En la biblioteca/DLC, confirma MacDon, NEXAT, Plains & Prairies, Straw Harvest, Mercedes, Highlands, Vredo, SKY, Emergency, Beans & Alpacas, CR11 Gold, JCB WFT.",
            "Arranca el juego y entra a tienda en cualquier save de prueba: filtra marcas Ford, Mercedes, MacDon, NEXAT, Vredo, SKY.",
            "Si falta un DLC, instálalo/actívalo antes de crear la partida definitiva de esta guía.",
            "Desactiva mods en el gestor: esta guía es 100 % oficial.",
            "Anota la versión/parche del juego en tu bloc para repetir tests si algo cambia.",
            "Cierra el save de prueba sin pisar tu futura partida principal.",
            "Solo cuando la tienda muestre el parque DLC completo, pasa al paso 2.",
        ],
        2: [
            "En Nueva partida, abre la selección de mapas.",
            "Elige Zielonka (mapa europeo Central, 2×2 km).",
            "Observa la vista previa: campos alargados, pueblo, granjas con potencial de gallineros.",
            "Descarta Hutan Pantai como primer save (arroz/asia: mejor más tarde) y Riverbend si quieres rutas más cortas al inicio.",
            "Confirma Zielonka y continúa a modos de juego.",
            "Marca mentalmente que Kinlaig/Catuaí se abrirán en capítulos DLC, no ahora.",
            "Si conocías Zielonka de FS22 Premium, aprovecha esa memoria de rutas.",
            "No crees aún la partida: falta configurar modo económico (paso 3).",
        ],
        3: [
            "Selecciona Empezar de cero / Farm from scratch (sin tierra ni flota).",
            "Economía: Normal. Jugadores: 1. Sin multiplayer.",
            "Evita Nuevo Granjero (te regala granja) y no subas a Expert si quieres la curva de esta guía.",
            "Revisa préstamo inicial mostrado en la pantalla de resumen.",
            "Nombra la partida: FS25_Zielonka_Cero.",
            "Confirma que estaciones/crecimiento quedan alineados con el paso 4.",
            "Crea la partida solo cuando los pasos 3–4–5 estén claros (puedes avanzar y ajustar).",
            "Si te equivocas de modo, borra el save y repite: no 'apañes' un Nuevo Granjero.",
        ],
    }
    for n, titulo, objetivo, contexto in specs:
        proc = detail_procs.get(n, [
            f"Ejecuta concretamente: {titulo}.",
            f"Objetivo del paso: {objetivo}",
            "Abre los menús/mapas necesarios y no improvises fuera de este foco.",
            "Anota dinero, préstamo y mes de juego antes y después del paso.",
            "Completa el checklist de la página 2 antes de avanzar.",
            "Si el paso cambia configuración o compras, guarda manualmente.",
            "Compara el resultado con el contexto: debe tener sentido económico.",
            "Deja el hub/menú ordenado para el siguiente paso de la secuencia.",
        ])
        maquinaria = [
            ("N/A o vehículo de servicio", "—", "Solo orientación"),
            ("Menú Esc / Mapa", "—", "Uso continuo"),
        ]
        economia = [
            ("Dinero inicial (Empezar de cero)", "Muy bajo / limitado", "No malgastar"),
            ("Préstamo disponible", "Según dificultad normal", "Usar con plan"),
            ("Coste de error típico", "Pérdida de tiempo / intereses", "Evitable"),
        ]
        checklist = [
            "DLC visibles en tienda (MacDon, NEXAT, Mercedes, etc.)",
            "Mapa Zielonka seleccionado / cargado",
            "Economía normal confirmada",
            "Estaciones/crecimiento entendidos",
            "Guardado manual creado",
        ]
        consejos = [
            "Si vienes de FS22, los menús son familiares pero hay arroz, espinacas, producciones nuevas y DLC distintos.",
            "Zielonka premia rutas cortas: elige parcelas cerca de silos para el early game.",
            "No actives mods aunque la comunidad los recomiende: esta guía es 100 % oficial + DLC.",
        ]
        errores = [
            "Empezar en Nuevo Granjero por costumbre.",
            "Comprar un tractor de 200+ CV el primer día.",
            "Ignorar el menú de precios durante semanas.",
            "Jugar sin estaciones y luego no entender rotaciones.",
        ]
        siguiente = "Paso siguiente: continúa la secuencia numerada sin saltar capítulos."
        if n == 25:
            siguiente = "Paso 26: primer contrato pagado y alquiler de equipo."
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=maquinaria, economia=economia, checklist=checklist,
            consejos=consejos, errores=errores, diagrama="mapa" if n in (2, 6, 14, 17) else "flujo",
            tabla_extra=[(d, desc) for d, desc in DLC_LIST] if n == 1 else (
                [("Trigo", "09-10 → 07-08"), ("Cebada", "09-10 → 06-08"), ("Colza", "08-09 → 07-08"),
                 ("Maíz", "04-05 → 08-11"), ("Soja", "04-05 → 10-11")] if n == 16 else None
            ),
            tabla_extra_titulo="DLC instalados (referencia)" if n == 1 else ("Calendario rápido" if n == 16 else ""),
            siguiente=siguiente,
        ))
    return out


# ---------------------------------------------------------------------------
# 26-55 Contratos
# ---------------------------------------------------------------------------
def build_contratos() -> list[dict]:
    c = "Contratos: tu primer motor económico"
    tipos = [
        ("cosecha de cereal", "Harvester + cabezal + remolque", 4500, 9000),
        ("siega de hierba", "Segadora + tractor", 2000, 4500),
        ("henificación", "Segadora + hileradora + empacadora", 3500, 7000),
        ("fertilización", "Abonadora o pulverizador", 1800, 4000),
        ("siembra", "Sembradora + tractor", 2500, 5500),
        ("laboreo / cultivado", "Cultivador o grada", 2000, 4800),
        ("arado", "Arado + tractor con lastre", 2200, 5000),
        ("transporte de mercancía", "Camión o tractor + remolque", 1500, 6000),
        ("tala / transporte forestal", "Tala + remolque forestal", 4000, 12000),
        ("piedras / preparación", "Recogepiedras o rodillo", 1200, 3000),
    ]
    out = []
    for i, n in enumerate(range(26, 56)):
        tipo, equipo, lo, hi = tipos[i % len(tipos)]
        fase = "arranque" if n < 36 else ("consolidación" if n < 46 else "aceleración")
        titulo = f"Contrato de {tipo} ({fase})"
        if n == 26:
            titulo = "Abrir menú de contratos y filtrar por cercanía"
        elif n == 27:
            titulo = "Leer ficha completa: plazo, pago y alquiler"
        elif n == 28:
            titulo = "Alquilar maquinaria del contrato sin miedo"
        elif n == 29:
            titulo = "Primer contrato simple de fertilización o siega"
        elif n == 55:
            titulo = "Meta de caja: fondo para tractor y parcela"
        objetivo = f"Completar y cobrar un ciclo de trabajo orientado a {tipo}, optimizando tiempo y alquiler."
        contexto = (
            f"En fase de {fase} los contratos de {tipo} suelen pagar entre {money(lo)} y {money(hi)} "
            f"según tamaño del campo y dificultad. Equipo típico a alquilar: {equipo}."
        )
        proc = [
            "Abre Esc → Contratos y ordena por recompensa o distancia desde tu posición.",
            f"Selecciona un contrato de {tipo} cuyo campo esté cerca de una carretera principal.",
            "Lee el plazo restante: si queda poco tiempo y el campo es grande, descártalo.",
            "Activa Alquilar maquinaria si no tienes el equipo; anota el coste de alquiler vs pago.",
            "Acepta solo si (pago − alquiler − combustible estimado) > margen mínimo de 1.000 $.",
            "Ve al punto de recogida del equipo alquilado, engancha y conduce al campo marcado.",
            "Configura anchura de trabajo, controlo de profundidad/altura y contrata AI solo si el campo es grande.",
            "Trabaja el campo completo; verifica el 100 % en el contador del contrato.",
            "Entrega o finaliza según tipo (cosecha → volcado en trailer del cliente / punto indicado).",
            "Devuelve o abandona el alquiler correctamente y cobra. Guarda la partida.",
            "Anota en tu bloc: tipo, pago neto, minutos reales invertidos y si repetirías ese tipo.",
            "Encadena 1–2 contratos similares en la misma zona antes de cambiar de tipo.",
        ]
        maquinaria = [
            (equipo.split("+")[0].strip(), "Alquiler de contrato", "Obligatorio si no lo tienes"),
            ("Tractor 80–140 CV", "Alquiler / futuro propio", "Base de casi todo"),
            ("Remolque (si aplica)", "Alquiler", "No sobrecargar en pendientes"),
        ]
        economia = [
            ("Pago bruto estimado", f"{money(lo)} – {money(hi)}", "Según ha"),
            ("Alquiler típico", "15–40 % del pago", "Revisar siempre"),
            ("Combustible + tiempo", "Variable", "Prioriza cercanía"),
            ("Beneficio objetivo neto", "≥ 1.000 $", "Si no, cambia de contrato"),
        ]
        checklist = [
            "Contrato aceptado con margen neto positivo",
            "Equipo alquilado localizado",
            "Campo trabajado al 100 %",
            "Pago cobrado y anotado",
            "Guardado realizado",
        ]
        consejos = [
            "Los contratos de fertilizar/sembrar son excelentes para aprender sin arruinar tus campos.",
            "La tala paga bien pero es lenta; déjala para cuando tengas mejor ruta o grúa forestal propia.",
            "Si un contrato pide cabezal de maíz y solo hay cereal, no improvises: eliges mal el filtro.",
        ]
        errores = [
            "Aceptar 5 contratos a la vez y que expiren.",
            "Olvidar que el alquiler se cobra aunque falles el plazo.",
            "Dejar la cosechadora alquilada sin combustible a mitad de campo.",
            "Hacer contratos al otro lado del mapa con remolque lento.",
        ]
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=maquinaria, economia=economia, checklist=checklist,
            consejos=consejos, errores=errores, diagrama="contrato",
            tabla_extra=[(t[0], f"{money(t[2])}–{money(t[3])}") for t in tipos],
            tabla_extra_titulo="Rangos orientativos de pago por tipo",
            siguiente="Siguiente contrato o, si ya tienes caja, paso de compra de tractor/parcela.",
        ))
    return out


# ---------------------------------------------------------------------------
# 56-90 Primer ciclo
# ---------------------------------------------------------------------------
def build_primer_ciclo() -> list[dict]:
    c = "Primera tierra y primer ciclo de cereal"
    out = []
    titles = {
        56: "Calcular presupuesto para tractor + parcela",
        57: "Elegir primera parcela barata en Zielonka",
        58: "Comprar el terreno y visitarlo en persona",
        59: "Comprar primer tractor económico (80–120 CV)",
        60: "Comprar o alquilar cultivador ligero",
        61: "Sembradora asequible o alquiler puntual",
        62: "Remolque pequeño de cereal",
        63: "Semillas y fertilizante: primera compra en tienda",
        64: "Analizar estado del campo recién comprado",
        65: "Recoger piedras si el campo lo requiere",
        66: "Encalar si el HUD lo pide",
        67: "Laboreo: cultivador vs arado en el primer campo",
        68: "Primera siembra de cereal (trigo o cebada)",
        69: "Rodillo opcional tras siembra",
        70: "Primera fertilización (estado 50 %)",
        71: "Control de malas hierbas",
        72: "Segunda fertilización (estado 100 %)",
        73: "Vigilancia hasta madurez",
        74: "Alquilar cosechadora para la primera cosecha",
        75: "Cosechar el campo completo",
        76: "Gestionar paja (dejar / empacar / picar)",
        77: "Transportar grano al punto de venta o silo",
        78: "Vender en pico de precio o almacenar",
        79: "Balance del primer ciclo completo",
        80: "Reinvertir beneficios: mejor cabezal o abonadora",
        81: "Segundo campo pequeño contiguo",
        82: "Sincronizar dos campos en la misma ventana",
        83: "Introducir colza en la rotación temprana",
        84: "Introducir avena u otro cereal de primavera",
        85: "Comparativa económica trigo vs cebada vs colza",
        86: "Comprar abonadora propia (hito)",
        87: "Comprar sembradora propia (hito)",
        88: "Dejar de alquilar cultivador: compra justificada",
        89: "Plan del año 1 completo en papel",
        90: "Cierre del primer ciclo: granja cerealista viva",
    }
    for n in range(56, 91):
        titulo = titles[n]
        cultivo = "trigo" if n % 3 == 0 else ("cebada" if n % 3 == 1 else "colza")
        data = CROPS[cultivo]
        objetivo = f"Avanzar el ciclo cerealista: {titulo.lower()}."
        contexto = (
            f"Referencia {cultivo}: rendimiento ~{data['rendimiento']} l/ha, precio medio ~{money(data['precio'])}/1000l, "
            f"siembra {data['siembra']}, cosecha {data['cosecha']}. En Zielonka prioriza parcelas accesibles y rectas."
        )
        proc = [
            f"Revisa tu dinero y préstamo antes de ejecutar: «{titulo}».",
            "Abre el mapa de terrenos / tienda según corresponda a este hito.",
            "Si compras equipo: filtra por precio y potencia compatible con tu tractor actual.",
            "Si trabajas campo: lee el HUD completo (cal, abono, hierbas, madurez, piedras).",
            f"Aplica la acción agronómica del paso sobre el cultivo objetivo ({cultivo} u otro cereal activo).",
            "Usa AI solo si la pasada es larga y recta; vigila cabeceros y esquinas.",
            "Controla combustible y desgaste a mitad de trabajo.",
            "Al terminar, verifica el estado del campo y que no queden franjas sin trabajar.",
            "Actualiza tu contabilidad: gasto, ingreso esperado y próximo mes crítico.",
            "Guarda y evalúa si puedes encadenar el siguiente hito del ciclo sin ahogarte en intereses.",
        ]
        maquinaria = [
            ("Tractor 80–140 CV", "Propio / meta", "Base del early game"),
            ("Cultivador 3–4 m", "Alquiler→compra", "Preparación lecho"),
            ("Sembradora cereal", "Alquiler→compra", "Compatible semillas"),
            ("Cosechadora + cabezal", "Alquiler inicial", "Comprar mucho más tarde"),
            ("Remolque 8–20 m³", "Propio pronto", "Logística mínima"),
        ]
        ha = 1.0
        ingreso = data["rendimiento"] * data["precio"] / 1000 * ha
        economia = [
            ("Ingreso bruto orient. 1 ha", money(ingreso), f"A precio medio {cultivo}"),
            ("Semillas 1 ha", f"~{data['semillas']} l", "Comprar con margen"),
            ("Fertilizante 2 estados", "Coste medio", "Imprescindible"),
            ("Alquiler cosecha", "Alto al inicio", "Aún rentable"),
        ]
        checklist = [
            "Dinero suficiente antes de gastar",
            "Acción del paso completada al 100 %",
            "HUD del campo actualizado",
            "Finanzas anotadas",
            "Guardado OK",
        ]
        consejos = [
            "No compres cosechadora propia hasta tener varios campos y muchas horas de uso.",
            "La colza paga bien pero el ciclo y la logística son distintos; introdúcela cuando domines trigo/cebada.",
            "Campos contiguos ahorran más dinero que un campo grande lejos.",
        ]
        errores = [
            "Arar siempre: a veces cultivador basta y ahorras tiempo.",
            "Sembrar fuera de ventana con estaciones activas.",
            "Vender todo el grano en el peor mes de precios.",
            "Comprar remolque enorme sin tractor que lo mueva con soltura.",
        ]
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=maquinaria, economia=economia, checklist=checklist,
            consejos=consejos, errores=errores, diagrama="ciclo",
            tabla_extra=[(k, f"{v['siembra']} → {v['cosecha']} | {money(v['precio'])}")
                         for k, v in list(CROPS.items())[:8]],
            tabla_extra_titulo="Cereales y oleaginosas clave",
            siguiente="Continúa el ciclo hasta el paso 90 y luego optimiza suelo.",
        ))
    return out


# ---------------------------------------------------------------------------
# 91-130 Suelo
# ---------------------------------------------------------------------------
def build_suelo() -> list[dict]:
    c = "Suelo, fertilización y rendimiento máximo"
    topics = [
        "Leer todos los iconos del HUD de campo",
        "Mapa de cal: cuándo y cómo encalar",
        "Comprar esparcidor de cal económico",
        "Calcular cal necesaria por hectárea",
        "Encalar varios campos en una sola ruta",
        "Fertilización estado 1: abonadora sólida",
        "Fertilización con pulverizador líquido",
        "Purines y estiércol como abono barato",
        "Comprar cisterna pequeña de purín",
        "Complementar abono orgánico + mineral",
        "Malas hierbas: azada mecánica temprana",
        "Herbicida con pulverizador",
        "Momento óptimo del weeding",
        "Piedras: generadas tras arar profundo",
        "Recogepiedras: compra vs alquiler",
        "Rastrojos y mulching tras cosecha",
        "Picadora de rastrojo / mulcher",
        "Arado: cuándo es obligatorio (después de maíz/patata etc.)",
        "Cultivador: lecho de siembra estándar",
        "Grada rápida para grandes superficies",
        "Subsuelo / deep loosener en compactación",
        "Rodillo: germinación y piedras pequeñas",
        "Cubre cultivos: rábano oleaginoso",
        "Sembrar rábano y cultivarlo en floración",
        "Efecto del abono verde en el siguiente cultivo",
        "Riego: cuándo aplica (según cultivo/mapa)",
        "Estados de fertilización 0–100 % explicados",
        "Plagas y tratamiento (si aparecen)",
        "Humedad visual y planificación de labores",
        "Trabajar de noche: luces y AI",
        "GPS/asistentes de paralelo (si disponibles)",
        "Solapes y cabeceros: técnica de conducción",
        "Anchuras compatibles tractor-aperos",
        "Lastres y presión de ruedas (básico)",
        "Neumáticos: campo vs carretera",
        "Consumo de combustible por tipo de labor",
        "Mantenimiento preventivo de aperos",
        "Checklist de campo listo para sembrar",
        "Checklist de campo listo para cosechar",
        "Rutina mensual de mantenimiento de suelos",
    ]
    out = []
    for i, n in enumerate(range(91, 131)):
        titulo = topics[i]
        objetivo = f"Dominar la gestión de suelo: {titulo.lower()}."
        contexto = (
            "El rendimiento máximo en economía normal exige: cal OK, fertilización 100 %, sin hierbas, "
            "laboreo correcto y, cuando aplique, mulch/abono verde. Cada franja olvidada es dinero perdido."
        )
        proc = [
            f"Enfoca la sesión exclusivamente en: {titulo}.",
            "Selecciona 1–2 campos propios como laboratorio de práctica.",
            "Abre el HUD y anota el estado actual de cal, abono y hierbas.",
            "Elige la herramienta correcta (propia o alquilada) y configúrala.",
            "Realiza la pasada completa sin dejar islas sin tratar.",
            "Vuelve a leer el HUD: confirma que el indicador cambió como esperabas.",
            "Si usas AI, revisa bordes y esquinas manualmente después.",
            "Registra coste de consumibles (cal, abono, herbicida) por hectárea.",
            "Compara el coste con el incremento de rendimiento esperado.",
            "Estandariza esta labor como parte de tu rutina antes de cada siembra/cosecha.",
        ]
        maquinaria = [
            ("Esparcidor de cal", "Compra temprana", "Uso recurrente"),
            ("Abonadora / pulverizador", "Prioritaria", "2 pasadas/ciclo"),
            ("Weeder / herbicida", "Según hierba", "No descuidar"),
            ("Mulcher", "Media prioridad", "Bonus de rendimiento"),
            ("Recogepiedras", "Según arado", "Evita daños"),
        ]
        economia = [
            ("Coste cal / ha", "Bajo", "Alto ROI"),
            ("Coste abono completo", "Medio", "Imprescindible"),
            ("Pérdida sin abonar", "Hasta ~50 % yield", "Inaceptable"),
            ("Mulch / abono verde", "Bajo-medio", "Bonus estable"),
        ]
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=maquinaria, economia=economia,
            checklist=["HUD leído", "Labor completada", "Consumibles restock", "Coste anotado", "Guardado"],
            consejos=[
                "Haz rutas de cal/abono por zona para no cruzar el mapa 10 veces.",
                "El estiércol de tus futuros animales reducirá la factura de abono mineral.",
                "Si arases mucho, presupuesta recogepiedras o evita arar cuando no haga falta.",
            ],
            errores=[
                "Sembrar con cal en rojo.",
                "Dejar hierbas hasta que ahoguen el cultivo.",
                "Aplicar herbicida pensando que fertiliza (o viceversa).",
                "Olvidar el mulch cuando buscas máximo yield.",
            ],
            diagrama="suelo",
            siguiente="Tras el paso 130, expande superficie con rotaciones serias.",
        ))
    return out


# ---------------------------------------------------------------------------
# 131-170 Expansión
# ---------------------------------------------------------------------------
def build_expansion() -> list[dict]:
    c = "Expansión de campos y rotaciones"
    out = []
    for n in range(131, 171):
        idx = n - 131
        titulo = [
            "Mapa de precios de farmland actualizado",
            "Comprar segunda parcela estratégica",
            "Comprar tercera parcela y unificar rutas",
            "Eliminar setos/límites para unir campos (si procede)",
            "Diseñar bloques de 2–4 ha manejables",
            "Rotación A: cereal → colza → cereal",
            "Rotación B: maíz → soja → cereal",
            "Rotación C: root crop → cereal → cover",
            "Planificar un año completo mes a mes",
            "Sembrar campos en oleadas (no todos el mismo día)",
            "Comprar tractor mediano 140–200 CV",
            "Duplicar remolques para no parar la cosecha",
            "Segundo juego de aperos para AI paralelo",
            "Contratar AI en dos campos a la vez",
            "Gestión de tráfico en caminos estrechos de Zielonka",
            "Comprar parcela con acceso a silo cercano",
            "Vender parcela mala / demasiado cara de mantener",
            "Introducir girasol en la rotación",
            "Introducir sorgo",
            "Introducir soja como cash crop",
            "Maíz grano vs maíz forrajero (decisión)",
            "Reservar 1 campo solo para experimentos",
            "Seguro mental: nunca gastar toda la liquidez",
            "Objetivo de hectáreas año 1 vs año 2",
            "Comprar cosechadora usada/económica (primer owned)",
            "Cabezal de cereal propio",
            "Cabezal de maíz (cuando entres en maíz)",
            "Upgrade de sembradora de precisión",
            "Grada rápida para bloques grandes",
            "Pulverizador autopropulsado (evaluación)",
            "Comparar coste/ha propio vs contratos externos",
            "Dejar de hacer contratos low-pay",
            "Mantener 2–3 contratos top como extra",
            "Crear hub: cobertizo central de aperos",
            "Iluminación y gasolinera en tu granja",
            "Silo propio pequeño (primer storage)",
            "Extensión de silo",
            "Organizar semillas/fertilizantes en big bags",
            "Checklist de expansión sostenible",
            "Cierre: de granja micro a pequeña empresa agrícola",
        ][idx]
        objetivo = f"Escalar la superficie y la organización: {titulo.lower()}."
        contexto = (
            "La expansión inteligente no es comprar el campo más grande, sino el que mejor encaja en tus rutas, "
            "rotaciones y capacidad de cosecha. Un cuello de botella típico es 1 cosechadora / 1 remolque."
        )
        proc = [
            f"Ejecuta el hito de expansión: {titulo}.",
            "Revisa liquidez: reserva siempre un colchón para semillas+abono+combustible del mes.",
            "Si compras tierra: visita bordes, entradas y distancia a silo/venta.",
            "Si unes campos: asegúrate de que la nueva forma sigue siendo trabajable con tus anchuras.",
            "Actualiza el plan de rotación escrito (cultivo actual → siguiente).",
            "Reasigna AI y flota para el nuevo tamaño de bloque.",
            "Simula la cosecha pico: ¿te da tiempo en ventana de precios?",
            "Ajusta compras de logística (trailers) antes de comprar más hectáreas.",
            "Mide beneficio/ha del último ciclo y compáralo con el objetivo.",
            "Guarda y renombra el save si alcanzaste un hito (p.ej. 10 ha propias).",
        ]
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=[
                ("Tractor mediano", "Compra fase 2", "Más aperos anchos"),
                ("Cosechadora propia", "Cuando ROI claro", "Deja el alquiler"),
                ("2+ remolques", "Crítico", "Cosecha continua"),
                ("Silo farm", "Media", "Espera precios"),
            ],
            economia=[
                ("Colchón mínimo", "Semillas+abono 2 ciclos", "No negociable"),
                ("Ha adicionales", "Solo si cosechas a tiempo", "Si no, sobrecoste"),
                ("ROI aperos anchos", "Tiempo ahorrado × campañas", "Calcula"),
            ],
            checklist=["Colchón OK", "Hito completado", "Rotación actualizada", "Logística coherente", "Save"],
            consejos=[
                "Es mejor 8 ha bien abonadas que 20 ha abandonadas.",
                "Los DLC grandes (NEXAT, Plains) brillan cuando ya tienes bloques grandes: no los fuerces aún.",
                "Zielonka permite unir campos rectangulares con facilidad: aprovechévalo.",
            ],
            errores=[
                "Comprar tierra cara lejos del hub.",
                "Expandir sin segundo trailer.",
                "Romper rotaciones y empobrecer el plan anual.",
                "Comprar autopropulsados de lujo demasiado pronto.",
            ],
            diagrama="expansion",
            tabla_extra=[("Año 1", "4–12 ha"), ("Año 2", "12–30 ha"), ("Año 3+", "30 ha+ y producciones")],
            tabla_extra_titulo="Hitos de superficie orientativos",
            siguiente="Con la base expandida, profesionaliza almacenamiento y ventas.",
        ))
    return out


# ---------------------------------------------------------------------------
# 171-210 Logística
# ---------------------------------------------------------------------------
def build_logistica() -> list[dict]:
    c = "Almacenamiento, logística y ventas"
    topics = [
        "Leer historial de precios de cada cultivo",
        "Entender picos estacionales de venta",
        "Silo propio vs punto de venta directo",
        "Colocar el primer silo en el hub",
        "Descarga: tolvas, augers y trailers",
        "Evitar colas: dos puntos de vaciado",
        "Rutas óptimas en Zielonka al Grain Pool",
        "Ruta al molino / supermercado / mercado",
        "Camión vs tractor en carretera",
        "Primer camión económico (si compensa)",
        "Mercedes Actros/Arocs (DLC) para logística tardía",
        "Hooklift y contenedores (Mercedes Pack)",
        "Big bags: semillas y fertilizante a campo",
        "Pallets: producción y venta",
        "Cargador telescópico / pala para pallets",
        "Organizaciónde cobertizo: zonas A/B/C",
        "Evitar atascos con AI en caminos",
        "Marcas en el mapa para silos y ventas",
        "Vender solo el 50 % y especular el resto",
        "Calendario de ventas del trimestre",
        "Transporte de paja y henolaje",
        "Transporte de ensilado a bunker",
        "Logística de leche (anticipación ganadera)",
        "Logística de estiércol/purín",
        "Estación de combustible en granja",
        "Taller propio vs taller del mapa",
        "Pesaje mental: no salir con media carga siempre",
        "Turnos de cosecha: cosechadora nunca parada",
        "Conductor AI de trailer (tren de vuelco)",
        "Preparar flota para campaña de verano",
        "Preparar flota para campaña de otoño",
        "Seguros de tiempo: guardar antes de vender lotes grandes",
        "Registro contable simple por mes",
        "Detectar cultivos que no te compensan",
        "Negociar mentalmente: ¿producir o vender raw?",
        "Capacidad de silo vs plan de siembra",
        "Ampliar almacenamiento horizontal",
        "Punto de venta preferido por producto (tabla)",
        "Simulacro: cosecha 10 ha en un día de juego",
        "Cierre logístico: cadena cerealista fluida",
    ]
    out = []
    for i, n in enumerate(range(171, 211)):
        titulo = topics[i]
        nota = ""
        if "Mercedes" in titulo or "Hooklift" in titulo:
            nota = "Requiere Mercedes-Benz Trucks Pack."
        out.append(_base_step(
            n, titulo, c,
            f"Optimizar movimiento de mercancía y timing de venta: {titulo.lower()}.",
            contexto="La logística bien hecha puede valer más que un 10 % extra de yield: vendes en pico y no paras la cosechadora.",
            procedimiento=[
                f"Centra la sesión en: {titulo}.",
                "Revisa precios actuales de tus cultivos almacenados.",
                "Planifica la ruta puerta a puerta (campo → silo → venta).",
                "Prepara vehículos con combustible y mantenimiento al día.",
                "Ejecuta cargas completas siempre que el camino lo permita.",
                "Si usas AI, vigila atascos y puntos estrechos de Zielonka.",
                "Confirma descarga correcta (producto en silo o dinero cobrado).",
                "Anota precio de venta real vs media histórica.",
                "Reajusta el plan si el pico aún no llegó: almacena.",
                "Deja la flota aparcada en el hub lista para el siguiente ciclo.",
            ],
            maquinaria=[
                ("Remolques cereal", "2+", "Cadena de vuelco"),
                ("Camión (opcional)", "Fase media", "Rutas largas"),
                ("Silo farm", "Sí", "Especulación"),
                ("Telehandler", "Con pallets", "Producción"),
            ],
            economia=[
                ("Diferencia pico vs valle", "Puede ser enorme", "Espera si puedes"),
                ("Viajes medios", "Combustible+tiempo", "Rutas cortas"),
                ("Parada de cosechadora", "Coste oculto alto", "Más trailers"),
            ],
            checklist=["Precios mirados", "Ruta clara", "Cargas llenas", "Descarga OK", "Registro"],
            consejos=[
                "Un silo propio te convierte en especulador: es una de las mejores inversiones medias.",
                "Con Mercedes Pack, los hooklift organizan estiércol, pellets y contenedores con elegancia.",
                "No construyas el silo en el rincón más bonito: constrúyelo donde entren los trailers fácil.",
            ],
            errores=[
                "Vender todo al volver de la primera cosecha sin mirar precios.",
                "Un solo trailer para una cosechadora rápida.",
                "Silo sin espacio de maniobra.",
                "Mezclar prioridades: ir a vender lejos mientras el campo maduro espera.",
            ],
            diagrama="logistica",
            nota_dlc=nota,
            tabla_extra=[("Cereal", "Grain Pool / molino"), ("Pan/comida", "Supermercado"),
                         ("Leche", "Dairy"), ("Madera", "Aserradero"), ("Biomasa", "Heating plant")],
            tabla_extra_titulo="Destinos frecuentes en Zielonka",
            siguiente="Con la logística estable, entra el forraje serio.",
        ))
    return out


# ---------------------------------------------------------------------------
# 211-250 Forraje
# ---------------------------------------------------------------------------
def build_forraje() -> list[dict]:
    c = "Forraje, henificación y ensilado"
    topics = [
        "Por qué el forraje sostiene la granja mixta",
        "Sembrar hierba en campo dedicado",
        "Primer corte: segadora frontal/trasera",
        "Hilerado correcto",
        "Henificación: ordeñar el secado",
        "Empacadora de pacas cuadradas pequeñas",
        "Empacadora de pacas redondas",
        "Recogedor de pacas / remolque autocargador",
        "Almacenar heno bajo techo",
        "Henolaje (silage bales) paso a paso",
        "Ensilado de hierba en bunker",
        "Compactar ensilado con tractor/peso",
        "Cerrar y fermentar el bunker",
        "Maíz forrajero: siembra",
        "Picar maíz con picadora",
        "Remolques de transporte de picado",
        "Ensilado de maíz: bunker dedicado",
        "TMR: idea básica de ración mezclada",
        "Comprar mixer wagon sencillo",
        "Recetas de TMR según animales futuros",
        "Paja como cama y componente",
        "Empacar paja tras cereal",
        "Pellets de paja (Straw Harvest Pack)",
        "Línea KRONE del Straw Harvest Pack",
        "Bressel und Lade: manejo de material",
        "Vredo: resiembra de pradera degradada",
        "Daños de jabalíes en praderas/cultivos (Vredo Pack)",
        "Reparar pradera: overseeding",
        "Plan de cortes de hierba anuales",
        "Autocargador vs control + empacadora",
        "Segadora autopropulsada (evaluación tardía)",
        "Forraje comprado en tienda vs producido",
        "Vender heno/pacas en picos",
        "Reservar stock para invierno ganadero",
        "Diseñar el área de forraje junto a establos futuros",
        "Bunker silage: tamaño y accesos",
        "Evitar contaminación tierra/piedras en ensilado",
        "Checklist campaña de henificación",
        "Checklist campaña de maíz forrajero",
        "Cierre forrajero: listo para animales",
    ]
    out = []
    for i, n in enumerate(range(211, 251)):
        titulo = topics[i]
        nota = ""
        if "Straw Harvest" in titulo or "KRONE" in titulo or "Bressel" in titulo:
            nota = "Straw Harvest Pack."
        if "Vredo" in titulo or "jabalí" in titulo or "overseeding" in titulo or "Resiembra" in titulo:
            nota = "Vredo Pack."
        out.append(_base_step(
            n, titulo, c,
            f"Construir la cadena de forraje: {titulo.lower()}.",
            contexto=(
                "Hierba y maíz forrajero alimentan vacas, ovejas y TMR. Además, pacas y pellets (DLC) son cash flow. "
                "Sin forraje estable no abras una gran vaquería."
            ),
            procedimiento=[
                f"Trabaja el hito forrajero: {titulo}.",
                "Prepara el campo de hierba o maíz forrajero correspondiente.",
                "Verifica el estado de crecimiento/secado antes de empacar o picar.",
                "Configura altura de siega / hilerado / pickup correctamente.",
                "Ejecuta la cadena completa sin dejar andanas olvidadas.",
                "Transporta al almacén, bunker o punto de venta.",
                "Si es ensilado, compacta en capas finas y cierra cuando toque.",
                "Actualiza inventario de pacas/ensilado disponible.",
                "Calcula cuántos animales podrías alimentar 3–6 meses con ese stock.",
                "Guarda al terminar la campaña del día.",
            ],
            maquinaria=[
                ("Segadora", "Sí", "Primer eslabón"),
                ("Hileradora", "Sí", "Antes de empacar"),
                ("Empacadora", "Sí", "Heno/henolaje"),
                ("Picadora + headers", "Maíz forrajero", "Inversión media"),
                ("Mixer wagon", "Pre-ganadería", "TMR"),
            ],
            economia=[
                ("Heno", "Ingreso menor", "Gran utilidad interna"),
                ("Ensilado", "Alto valor interno", "Vacas"),
                ("Pellets (DLC)", "Buen margen", "Straw Harvest"),
                ("Comprar forraje tienda", "Caro", "Solo emergencia"),
            ],
            checklist=["Corte/picado OK", "Transporte OK", "Stock actualizado", "Sin pérdidas en campo", "Save"],
            consejos=[
                "Coloca bunkers pegados a la futura vaquería, no al otro lado del mapa.",
                "Con Vredo Pack, vigila jabalíes: dañan cultivos y praderas.",
                "El Straw Harvest Pack da una segunda vida económica a la paja.",
            ],
            errores=[
                "Empacar hierba húmeda cuando buscabas heno seco.",
                "No compactar el bunker y obtener mal ensilado.",
                "Abrir vaquería con 2 pacas de stock.",
                "Picar maíz sin suficientes remolques.",
            ],
            diagrama="forraje",
            nota_dlc=nota,
            siguiente="Con forraje en marcha, abre la ganadería paso a paso.",
        ))
    return out


# ---------------------------------------------------------------------------
# 251-300 Ganadería
# ---------------------------------------------------------------------------
def build_ganaderia() -> list[dict]:
    c = "Ganadería completa"
    topics = [
        "Estrategia ganadera desde cero",
        "Gallinas: primer corral barato",
        "Comprar gallinas y gestionar huevos",
        "Venta de huevos y reposición",
        "Ovejas: lana y estiércol",
        "Alimentación de ovejas con hierba/heno",
        "Esquila y venta de lana",
        "Cabras (si disponibles en build) / manejo ovino avanzado",
        "Vacas lecheras: requisitos previos",
        "Construir establo de vacas dimensionado",
        "Comprar primer lote de vacas",
        "Robot o salas: higiene y productividad",
        "Alimentar vacas con TMR correcto",
        "Agua, paja de cama y bienestar",
        "Recoger leche y vender en dairy",
        "Estiércol líquido/sólido de vacas",
        "Reproducción y crecimiento del rebaño",
        "Ampliar establo de vacas",
        "Cerdos: comida mixta y rentabilidad",
        "Construir pocilga",
        "Recetas de alimentación de cerdos",
        "Venta de cerdos al dealer",
        "Estiércol de cerdo al campo",
        "Caballos: cuidado y equitación/ventas",
        "Establo de caballos y paddocks",
        "Abejas: colmenas cerca de cultivos",
        "Miel y plus de cultivo",
        "Highland cattle (DLC Highlands)",
        "Comparativa rentabilidad: gallinas vs vacas vs cerdos",
        "Ruta diaria ganadera (10–15 min reales)",
        "Automatizar alimentación con AI/workers",
        "Diseño de granja: corrales sin cruces sucios",
        "Cuarentena mental: no mezclar logística limpia/sucia",
        "Seguro de forraje para invierno",
        "Venta estratégica de animales",
        "Comprar animales jóvenes vs adultos",
        "Capacidad máxima vs confort",
        "Integrar ganadería con producciones (leche→queso etc.)",
        "Plan de expansión ganadera año 2",
        "Bioseguridad light: limpieza de rutas",
        "Registro de producción láctea mensual",
        "Gastos veterinarios/mantenimiento de edificios",
        "Multiespecie: límites de microgestión",
        "Priorizar 2 especies core + 1 side",
        "Gallinas+vacas como combo estable",
        "Cerdos como motor de cash cíclico",
        "Ovejas como complemento de lana/pradera",
        "Preparar transición a alpacas (Catuaí / DLC)",
        "Checklist semanal ganadero",
        "Cierre ganadero: granja mixta operativa",
    ]
    out = []
    for i, n in enumerate(range(251, 301)):
        titulo = topics[i]
        nota = "Highlands Fishing Expansion." if "Highland" in titulo else ""
        if "alpacas" in titulo.lower() or "Catuaí" in titulo:
            nota = "Beans & Alpacas Expansion (cuando entres en ese mapa/contenido)."
        out.append(_base_step(
            n, titulo, c,
            f"Desarrollar la rama ganadera: {titulo.lower()}.",
            contexto=(
                "Orden recomendado sin mods: gallinas → ovejas/pradera → vacas (cuando hay TMR) → cerdos → caballos/abejas. "
                "Highland cattle y alpacas llegan con sus DLC/mapas."
            ),
            procedimiento=[
                f"Completa el hito ganadero: {titulo}.",
                "Verifica que tienes forraje/agua/edificio antes de comprar animales.",
                "Construye o amplía el alojamiento con acceso de trailer y pala.",
                "Compra el lote en el animal dealer y transpórtalo con remolque adecuado.",
                "Configura alimentación automática o realiza la rutina manual completa.",
                "Revisa indicadores de salud/productividad del menú de animales.",
                "Recoge productos (huevos, leche, lana) y almacénalos o véndelos.",
                "Gestiona estiércol hacia cisterna/esparcidor o almacenamiento.",
                "Ajusta el tamaño del rebaño a tu stock de forraje real.",
                "Guarda tras cualquier compra/venta de animales.",
            ],
            maquinaria=[
                ("Remolque de animales", "Sí", "Compras/ventas"),
                ("Mixer wagon", "Vacas/cerdos", "TMR"),
                ("Cisterna purín", "Vacas/cerdos", "Abono barato"),
                ("Pala / telehandler", "Cama y pallets", "Diario"),
            ],
            economia=[
                ("Gallinas", "Bajo coste", "Flujo pasivo huevos"),
                ("Vacas", "Alta inversión", "Leche estable"),
                ("Cerdos", "Comida diversa", "Venta cíclica"),
                ("Ovejas", "Pradera", "Lana + abono"),
            ],
            checklist=["Edificio listo", "Comida/agua OK", "Animales colocados", "Producto recogido", "Estiércol gestionado"],
            consejos=[
                "No empieces por vacas aunque 'sean lo típico': sin forraje es ruina.",
                "El estiércol cierra el círculo con tus campos y baja costes de abono.",
                "En Zielonka, sitúa corrales cerca del forraje y lejos de atascos de cosecha.",
            ],
            errores=[
                "Comprar vacas el mismo día que el primer campo.",
                "Olvidar paja de cama y perder productividad.",
                "No revisar el menú de animales durante semanas.",
                "Vender leche sin mirar el precio del dairy.",
            ],
            diagrama="animales",
            nota_dlc=nota,
            siguiente="Con animales productivos, industrializa con producciones.",
        ))
    return out


# ---------------------------------------------------------------------------
# 301-345 Producción
# ---------------------------------------------------------------------------
def build_produccion() -> list[dict]:
    c = "Cadenas de producción"
    topics = [
        "Filosofía: vender raw vs procesar",
        "Menú de producción: inputs/outputs/costes",
        "Primera producción barata y útil",
        "Panadería: cereal → pan",
        "Molino / harinas (si aplica en cadena)",
        "Fábrica de sopas",
        "Conservas / preserved food",
        "Procesado de patata",
        "Hilandería: algodón/lana → tela",
        "Aserradero: troncos → tablas",
        "Planta de biogás",
        "Fábrica de cemento",
        "Fabricante de pianos (cadena larga)",
        "Colocar producciones propias vs comprar las del mapa",
        "Invernaderos: tomates/lechugas/etc.",
        "Cadena aceite (colza/girasol/aceituna)",
        "Cadena láctea: leche → mantequilla/queso",
        "Pellets y biomasa (Straw Harvest)",
        "Gestión de almacenes de pallets",
        "Recoger pallets con forklift/telehandler",
        "Activar/desactivar líneas según precio",
        "Distribuir inputs automáticamente",
        "Empleados de producción y coste",
        "Priorizar cadenas de alto margen",
        "Cadena cereal-pan-supermercado",
        "Cadena madera-muebles/pianos",
        "Cadena forraje-biogás-digestato",
        "Equilibrar campos para alimentar fábricas",
        "No saturar una producción sin logística de salida",
        "Construir almacén de pallets cubierto",
        "Rutas de entrega diarias/ semanales",
        "Producción de hilados + venta",
        "Cemento: inputs minerales/logística pesada",
        "Calcular margen neto por cadena",
        "Apagar cadenas ruinosas sin drama",
        "Sinergia animales ↔ producciones",
        "Sinergia silvicultura ↔ aserradero",
        "Escalado: segunda unidad de la mejor cadena",
        "Preparar logística Mercedes para pallets",
        "Dashboard mental semanal de fábricas",
        "Optimizar horas de recogida de pallets",
        "Evitar overflow de output",
        "Checklist de fábrica saludable",
        "Plan industrial año 2–3",
        "Cierre: holding agroindustrial en Zielonka",
    ]
    out = []
    for i, n in enumerate(range(301, 346)):
        titulo = topics[i]
        out.append(_base_step(
            n, titulo, c,
            f"Montar y optimizar industria agrícola: {titulo.lower()}.",
            contexto=(
                "En Zielonka hay panadería, biogás, cemento, pianos, procesado de patata, conservas, aserradero, sopas e hilandería. "
                "Procesar multiplica el valor, pero exige inputs constantes y recogida de pallets."
            ),
            procedimiento=[
                f"Desarrolla: {titulo}.",
                "Abre Esc → Producción y estudia inputs, outputs y almacenamiento.",
                "Asegura stock de materia prima para varias semanas de juego.",
                "Activa la línea y verifica que consume/produce correctamente.",
                "Organiza la salida: zona de pallets con espacio de maniobra.",
                "Equipa pala/carretilla/camión según el volumen.",
                "Vende outputs en el punto de mejor precio del momento.",
                "Revisa costes de funcionamiento vs margen semanal.",
                "Ajusta campos/animales para alimentar la cadena sin rupturas.",
                "Documenta la cadena receta → venta en tu bloc.",
            ],
            maquinaria=[
                ("Telehandler / forklift", "Imprescindible", "Pallets"),
                ("Camión plataforma", "Volumen", "Entregas"),
                ("Trailers cereal/insumos", "Inputs", "Fábricas"),
            ],
            economia=[
                ("Raw cereal", "Base", "OK al inicio"),
                ("Procesado", "+margen", "Más microgestión"),
                ("Cadena larga (pianos)", "Alto potencial", "Más eslabones"),
                ("Biogás", "Usa residuos/forraje", "Bonus digestato"),
            ],
            checklist=["Inputs OK", "Línea activa", "Pallets recogidos", "Venta hecha", "Margen revisado"],
            consejos=[
                "Empieza por 1 cadena simple (panadería o sopas) antes de pianos/cemento.",
                "Si los pallets se acumulan, la producción se ahoga: recoge siempre.",
                "El aserradero justifica una operación forestal seria.",
            ],
            errores=[
                "Comprar todas las fábricas a la vez.",
                "Activar producción sin insumos.",
                "Dejar pallets bloqueando la salida.",
                "Medir el éxito solo por 'se mueve' y no por margen.",
            ],
            diagrama="produccion",
            nota_dlc="Straw Harvest Pack para pellets." if "Pellets" in titulo else "",
            siguiente="Añade silvicultura para alimentar madera y biogás.",
        ))
    return out


# ---------------------------------------------------------------------------
# 346-380 Silvicultura
# ---------------------------------------------------------------------------
def build_silvicultura() -> list[dict]:
    c = "Silvicultura y biomasa"
    topics = [
        "Zonas forestales de Zielonka",
        "Contratos forestales como escuela",
        "Motosierra y tala manual inicial",
        "Comprar remolque forestal básico",
        "Taladora / harvester forestal",
        "Forwarder para extracción",
        "Desramado y troceado correcto",
        "Cargar troncos sin atascos",
        "Ruta al aserradero",
        "Venta de madera vs procesar tablas",
        "Plantación de árboles nuevos",
        "Chopos de ciclo corto",
        "BioBaler y biomasa de chopos",
        "Astillas / wood chips",
        "Caldera / biomasa heating plant",
        "Seguridad: no tumbar sobre caminos",
        "Limpieza de tocones (si aplica)",
        "Maquinaria forestal vs tractor adaptado",
        "Winch y pendientes",
        "Operación de dos personas (AI + tú)",
        "Almacén de troncos en granja",
        "Cadena madera → tablas → fábrica de pianos",
        "Coste de tiempo forestal vs cereal",
        "Rotación de parcelas forestales",
        "Evitar destruir cables/props del mapa",
        "Mantenimiento de cabezales forestales",
        "Campañas forestales de invierno",
        "Integrar madera en biogás/biomasa",
        "Comprar parcela con bosque maduro",
        "Valorar reforestar siempre",
        "DLC máquinas que ayudan al transporte pesado",
        "Checklist de tala diaria",
        "Checklist de plantación",
        "Optimizar cargas completas al aserradero",
        "Cierre forestal: suministro leñoso estable",
    ]
    out = []
    for i, n in enumerate(range(346, 381)):
        titulo = topics[i]
        out.append(_base_step(
            n, titulo, c,
            f"Operar silvicultura rentable: {titulo.lower()}.",
            contexto="La madera alimenta aserradero, producciones y biomasa. Es más lenta que el cereal, pero diversifica y usa DLC de transporte pesado.",
            procedimiento=[
                f"Ejecuta: {titulo}.",
                "Elige rodal o contrato forestal con acceso de camión.",
                "Tala de forma ordenada (calles de extracción).",
                "Trocea a longitudes transportables.",
                "Carga el remolque/forwarder al máximo seguro.",
                "Conduce con cuidado en caminos estrechos de Zielonka.",
                "Entrega en aserradero o almacén propio.",
                "Si procesas, alimenta la producción y recoge outputs.",
                "Reforesta o planta chopos según tu plan.",
                "Actualiza el stock de madera y el tiempo invertido.",
            ],
            maquinaria=[
                ("Chainsaw / taladora", "Sí", "Tala"),
                ("Remolque forestal", "Sí", "Extracción"),
                ("Forwarder", "Ideal", "Volumen"),
                ("Camión madera", "Late", "Largas rutas"),
            ],
            economia=[
                ("Contrato forestal", "Buen learning", "Pago fijo"),
                ("Madera raw", "OK", "Rápido"),
                ("Tablas procesadas", "Mejor margen", "Más pasos"),
                ("Chopos/biomasa", "Ciclo propio", "Planificar"),
            ],
            checklist=["Tala segura", "Carga OK", "Entrega OK", "Reforestación", "Save"],
            consejos=[
                "No combines forestal pesado con cosecha cereal el mismo día si vas solo.",
                "Los chopos son el 'cultivo forestal' más agrícola del set.",
                "Un aserradero propio cambia la rentabilidad de cada tronco.",
            ],
            errores=[
                "Tapar la carretera con un árbol.",
                "Llevar medias cargas continuamente.",
                "No reforestar y quedarte sin recurso.",
                "Comprar harvester forestal sin volumen de trabajo.",
            ],
            diagrama="forestal",
            siguiente="Dominados los pilares, entra a cultivos especiales.",
        ))
    return out


# ---------------------------------------------------------------------------
# 381-420 Especiales
# ---------------------------------------------------------------------------
def build_especiales() -> list[dict]:
    c = "Cultivos especiales y hortícolas"
    crops_focus = [
        ("patata", "plantadora y cosechadora Grimme/Ropa"),
        ("remolacha", "defoliado + cosechadora de raíces"),
        ("algodon", "cosechadora Case/JD + módulo"),
        ("cana", "plantadora Gessner + Austoft"),
        ("arroz", "campo de arroz + Iseki"),
        ("arroz_largo", "siembra normal en arrozal + cabezal grano"),
        ("espinacas", "cosechadora Oxbo"),
        ("guisantes", "cosechadora Oxbo"),
        ("judias", "plantadora + Oxbo beans"),
        ("zanahoria", "línea Dewulf / hortalizas"),
        ("chirivia", "línea hortalizas"),
        ("remolacha_roja", "cosechadoras de remolacha compatibles"),
        ("uva", "viñedo build mode + vendimiadora"),
        ("aceituna", "olivar + Braud/Grégoire"),
        ("cebolla", "Monosem + Holaras + config onion"),
        ("maiz", "planter + corn header"),
        ("girasol", "planter + header girasol/maíz"),
        ("soja", "sembradora + swathing opcional MacDon"),
        ("colza", "sembradora + cosecha cereal"),
        ("chopo", "Damcon + picadora/biobaler"),
    ]
    out = []
    for n in range(381, 421):
        i = n - 381
        if i < len(crops_focus):
            crop, equipo = crops_focus[i]
            data = CROPS[crop]
            titulo = f"Cultivo especial: {crop.replace('_', ' ')} — preparación y siembra"
            if i % 2:
                titulo = f"Cultivo especial: {crop.replace('_', ' ')} — cosecha y venta"
            objetivo = f"Ejecutar el ciclo de {crop.replace('_', ' ')} con el equipo adecuado ({equipo})."
            contexto = (
                f"{crop.replace('_', ' ').title()}: ~{data['rendimiento']} l/ha, precio medio {money(data['precio'])}/1000l, "
                f"siembra {data['siembra']}, cosecha {data['cosecha']}. Tipo: {data['tipo']}."
            )
            nota = "Highlands Fishing Expansion (cebollas)." if crop == "cebolla" else ""
            if crop == "soja":
                nota = "MacDon Pack opcional para swathing."
        else:
            extras = [
                "Diseñar parcela hortícola cerca del agua/rutas",
                "Compartir cosechadoras entre root crops",
                "Alquilar equipo especial caro solo en campaña",
                "Comparativa margen hortaliza vs cereal",
                "Calendario multi-cultivo de primavera",
                "Calendario multi-cultivo de otoño",
                "Almacén para raíces y hortalizas",
                "Contratos de cultivos especiales",
                "Errores caros en arrozales",
                "Errores caros en viñedo/olivar",
                "Plan de inversión en maquinaria especial",
                "Cuándo NO hacer azúcar/algodón aún",
                "Sinergia hortalizas → fábrica de sopas/conservas",
                "Riego y preparación de lechos hortícolas",
                "Semilleros y densidad de siembra",
                "Cosecha escalonada para no saturar logística",
                "Venta a procesadores vs mercado",
                "Seguro de campaña: spare trailer",
                "Checklist de cultivo especial rentable",
                "Cierre del capítulo de especiales",
            ]
            titulo = extras[i - len(crops_focus)]
            objetivo = f"Optimizar la rama de especiales: {titulo.lower()}."
            contexto = "Los cultivos especiales pagan más pero exigen maquinaria dedicada. Alquila hasta que una campaña entera justifique la compra."
            nota = ""
            equipo = "Según cultivo"
            data = CROPS["trigo"]
        proc = [
            f"Enfoca el trabajo en: {titulo}.",
            "Verifica ventana de siembra/cosecha con estaciones activas.",
            "Prepara el suelo al estándar premium (cal, laboreo, piedras).",
            f"Usa el equipo correcto: {equipo if i < len(crops_focus) else 'el del cultivo elegido'}.",
            "Si el aperos es caro, alquila para la campaña completa y calcula ROI.",
            "Siembra/planta a la densidad adecuada y fertiliza a 100 %.",
            "Controla hierbas; en hortalizas el timing es crítico.",
            "Cosecha solo en madurez plena y con logística lista.",
            "Vende a procesador/mapa o almacena si el precio está bajo.",
            "Anota margen real tras restar alquileres.",
        ]
        out.append(_base_step(
            n, titulo, c, objetivo, contexto=contexto, procedimiento=proc,
            maquinaria=[(equipo if i < len(crops_focus) else "Equipo especial", "Alquiler→compra", "Campañas")],
            economia=[
                ("Precio medio ref.", money(data["precio"]) if i < len(crops_focus) else "Variable", "Wiki FS25"),
                ("Coste maquinaria", "Alto", "Alquilar primero"),
                ("Margen potencial", "Alto", "Si logística OK"),
            ],
            checklist=["Ventana OK", "Suelo OK", "Equipo correcto", "Cosecha/siembra hecha", "Margen calculado"],
            consejos=[
                "Patata y remolacha son el puente natural desde cereal hacia especiales.",
                "Arroz exige infraestructura; no lo improvises en un campo normal.",
                "Viñedo/olivar son inversión a largo plazo en build mode.",
            ],
            errores=[
                "Comprar cosechadora de algodón para 1 ha.",
                "Sembrar arroz sin arrozal.",
                "Cosechar hortalizas con cabezal de cereal.",
                "Ignorar el procesado que multiplica el valor (sopas/conservas).",
            ],
            diagrama="especial",
            nota_dlc=nota,
            tabla_extra=[(k, money(v["precio"])) for k, v in list(CROPS.items()) if v["tipo"] in ("hortaliza", "raiz", "especial", "permanent")][:12],
            tabla_extra_titulo="Precios medios orientativos",
            siguiente="Ahora sí: maquinaria DLC a gran escala.",
        ))
    return out


# ---------------------------------------------------------------------------
# 421-455 DLC maquinaria
# ---------------------------------------------------------------------------
def build_dlc_maquinaria() -> list[dict]:
    c = "DLC de maquinaria avanzada"
    topics = [
        ("MacDon: entender swathing", "MacDon Pack"),
        ("MacDon M1240 + D140 XL: hacer andanas", "MacDon Pack"),
        ("Recoger andanas con PW8 / pickup", "MacDon Pack"),
        ("Swathing en trigo, cebada, avena, colza y soja", "MacDon Pack"),
        ("New Holland CR11 Gold: mega cosecha", "CR11 Gold"),
        ("NEXAT: concepto Wide-Span", "NEXAT Pack"),
        ("NEXAT: módulos de laboreo y siembra", "NEXAT Pack"),
        ("NEXAT: fertilización y pulverización", "NEXAT Pack"),
        ("NEXAT: módulo NEXCO de cosecha", "NEXAT Pack"),
        ("Cuándo NEXAT es rentable (bloques grandes)", "NEXAT Pack"),
        ("Plains & Prairies: visión del pack", "Plains & Prairies"),
        ("Tractores Ford clásicos y modernos", "Plains & Prairies"),
        ("Versatile y equipos de gran anchura", "Plains & Prairies"),
        ("Salford disc / air boom", "Plains & Prairies"),
        ("Väderstad Seed Hawk y tanques", "Plains & Prairies"),
        ("GEA: purines a gran escala", "Plains & Prairies"),
        ("Straw Harvest: nueva industria de paja", "Straw Harvest"),
        ("KRONE en la línea de pellets", "Straw Harvest"),
        ("Bressel und Lade: manejo y transporte", "Straw Harvest"),
        ("Producción y venta de pellets", "Straw Harvest"),
        ("Mercedes MB-trac y Unimog utilitarios", "Mercedes-Benz Trucks"),
        ("Actros/Arocs para carretera", "Mercedes-Benz Trucks"),
        ("Heizotruck y tippers", "Mercedes-Benz Trucks"),
        ("Hooklift Meiller TECTRUM: contenedores", "Mercedes-Benz Trucks"),
        ("JCB World's Fastest Tractor: uso realista", "JCB WFT"),
        ("Vredo: cisternas e inyección de purín", "Vredo Pack"),
        ("Vredo: overseeding de praderas", "Vredo Pack"),
        ("Jabalíes: detección y respuesta", "Vredo Pack"),
        ("SKY Agriculture: equipos y suciedad realista", "SKY Agriculture"),
        ("Emergency Pack: misiones y recompensas", "Emergency Pack"),
        ("Camiones de bomberos y herramientas Schlingmann", "Emergency Pack"),
        ("Integrar DLC en tu hub sin caos de cobertizos", "Varios"),
        ("Flota A (diario) vs Flota B (campaña DLC)", "Varios"),
        ("ROI: tabla de decisión alquilar/comprar DLC", "Varios"),
        ("Cierre: parque de maquinaria premium oficial", "Varios"),
    ]
    out = []
    for i, n in enumerate(range(421, 456)):
        titulo, dlc = topics[i]
        out.append(_base_step(
            n, titulo, c,
            f"Integrar contenido DLC oficial: {titulo}.",
            contexto=f"DLC foco: {dlc}. Úsalo cuando el tamaño de tu operación ya justifique la máquina; si no, alquila o pospone.",
            procedimiento=[
                f"Localiza en la tienda el equipo del DLC: {dlc}.",
                "Compara potencia/anchura/precio con tu flota actual.",
                "Si es un cambio de sistema (NEXAT, swathing, pellets), prueba un ciclo completo pequeño.",
                "Reorganiza cobertizos: deja el equipo DLC accesible en campaña.",
                "Entrena la configuración (headers, módulos, hooklift containers).",
                "Ejecuta un trabajo real en tus campos o un contrato exigente.",
                "Mide tiempo ahorrado y coste operativo.",
                "Decide compra definitiva vs quedarte con flujo anterior.",
                "Actualiza tu lista de flota A/B.",
                "Guarda tras la inversión.",
            ],
            maquinaria=[(titulo.split(":")[0], "DLC", dlc)],
            economia=[
                ("Precio DLC in-game", "Alto en packs grandes", "Calcula ROI"),
                ("Ahorro de tiempo", "Crítico en campaña", "Mide horas"),
                ("Coste operativo", "Combustible+mant.", "No ignorar"),
                ("Alternativa", "Alquiler/contrato", "Hasta justificar"),
            ],
            checklist=["DLC instalado", "Equipo configurado", "Trabajo real hecho", "ROI anotado", "Flota actualizada"],
            consejos=[
                "NEXAT y Plains brillan en bloques grandes; en microparcelas pierdes dinero.",
                "MacDon swathing añade un paso, pero puede mejorar logísticas de cosecha.",
                "Emergency Pack es contenido lateral: úsalo como extra de caja/diversión, no como núcleo.",
            ],
            errores=[
                "Comprar NEXAT con 5 ha totales.",
                "Usar JCB WFT como tractor de laboreo principal (no es su rol).",
                "Ignorar jabalíes del Vredo Pack hasta que arruinen un campo.",
                "Llenar la granja de máquinas DLC sin cobertizos ni rutas.",
            ],
            diagrama="dlc",
            nota_dlc=dlc,
            tabla_extra=DLC_LIST,
            tabla_extra_titulo="Inventario DLC de la guía",
            siguiente="Tras el parque DLC, conquista Kinlaig y la pesca.",
        ))
    return out


# ---------------------------------------------------------------------------
# 456-485 Kinlaig / Highlands
# ---------------------------------------------------------------------------
def build_kinlaig() -> list[dict]:
    c = "Highlands Fishing y Kinlaig"
    topics = [
        "Preparar traslado de conocimiento a Kinlaig",
        "Crear / abrir partida en mapa Kinlaig",
        "Orientación del mapa escocés: granjas, muelles y pueblo",
        "Economía inicial en Highlands Fishing",
        "Contratos locales para capitalizar rápido",
        "Primera parcela y hub costero/rural",
        "Cultivo nuevo: cebolla — siembra Monosem",
        "Cebolla: despuntado Holaras y andanas",
        "Cebolla: cosecha con config onion",
        "Cebolla: empaquetado y venta",
        "Highland cattle: requisitos y establo",
        "Comprar y cuidar highland cattle",
        "Productos y estiércol de highland cattle",
        "Introducción al sistema de pesca / acuicultura",
        "Embarcación y controles básicos en el agua",
        "Tipos de peces y zonas de captura",
        "Ruta de pesca eficiente (ida/vuelta a muelle)",
        "Almacenar y vender pescado",
        "Cadena de valor del pescado (si hay procesado)",
        "Maquinaria del expansion: JCB, Can-Am, Bunning, Monosem",
        "Can-Am para movilidad en granja Kinlaig",
        "Equipos Holaras en la línea de cebolla",
        "Bunning y abonado orgánico en Highlands",
        "Integrar praderas escocesas y forraje húmedo",
        "Clima y ventanas de trabajo en Kinlaig",
        "Duplicar aprendizajes de Zielonka en el nuevo mapa",
        "Hub mixto: cebollas + ganado highland + pesca",
        "Logística costera vs interior",
        "Plan de beneficios del expansion",
        "Cierre Kinlaig: operación Highlands estable",
    ]
    out = []
    for i, n in enumerate(range(456, 486)):
        titulo = topics[i]
        out.append(_base_step(
            n, titulo, c,
            f"Dominar Highlands Fishing Expansion: {titulo.lower()}.",
            contexto=(
                "Kinlaig (Escocia) añade cebollas, highland cattle, pesca y maquinaria nueva. "
                "No tires tu save de Zielonka: usa Kinlaig como segunda operación o partida dedicada."
            ),
            procedimiento=[
                f"Completa en Kinlaig: {titulo}.",
                "Localiza en el mapa muelles, dealer, tienda y parcelas clave.",
                "Aplica las mismas reglas de colchón económico que en Zielonka.",
                "Si el paso es de cebolla, usa la cadena Monosem → Holaras → cosechadora onion.",
                "Si el paso es ganadero highland, asegura forraje de pradera antes de comprar.",
                "Si el paso es pesca, prepara ruta de muelle, combustible y capacidad de bodega/almacén.",
                "Vende en los puntos adecuados y compara márgenes con tus cultivos terrestres.",
                "Integra al menos dos pilares (p.ej. cebolla + pesca) antes de expandir de más.",
                "Anota diferencias de ritmo respecto a Zielonka.",
                "Guarda con nombre claro (Kinlaig_vX).",
            ],
            maquinaria=[
                ("Monosem planter", "Cebollas", "DLC Highlands"),
                ("Holaras topper/windrower", "Cebollas", "DLC Highlands"),
                ("Barco / equipo pesca", "Acuicultura", "Núcleo del expansion"),
                ("Can-Am / JCB varios", "Utilidad", "Movilidad"),
            ],
            economia=[
                ("Cebolla", money(CROPS["cebolla"]["precio"]) + "/1000l", "Buen especial"),
                ("Pesca", "Variable", "Nueva fuente"),
                ("Highland cattle", "Inversión media", "Inmersión + productos"),
            ],
            checklist=["Ubicación clara", "Recurso/comida OK", "Acción completada", "Venta/registro", "Save Kinlaig"],
            consejos=[
                "Trata Kinlaig como DLC de gameplay, no solo como mapa bonito.",
                "La cebolla es el puente agrícola perfecto entre Zielonka y Highlands.",
                "No abandones la disciplina de precios: el pescado también fluctúa.",
            ],
            errores=[
                "Empezar a pescar sin entender el almacenamiento/venta.",
                "Comprar highland cattle sin pradera.",
                "Montar cebolla sin la línea Holaras completa.",
                "Dispersar dinero en dos mapas sin colchón.",
            ],
            diagrama="kinlaig",
            nota_dlc="Highlands Fishing Expansion",
            tabla_extra=[
                ("Cebolla siembra", CROPS["cebolla"]["siembra"]),
                ("Cebolla cosecha", CROPS["cebolla"]["cosecha"]),
                ("Rendimiento", f"{CROPS['cebolla']['rendimiento']} l/ha"),
                ("Precio medio", money(CROPS["cebolla"]["precio"])),
            ],
            tabla_extra_titulo="Ficha rápida cebolla",
            siguiente="Fase final: Catuaí, imperio y cierre de los 500 pasos.",
        ))
    return out


# ---------------------------------------------------------------------------
# 486-500 Imperio final
# ---------------------------------------------------------------------------
def build_imperio() -> list[dict]:
    c = "Imperio final, Catuaí y cierre"
    specs = [
        (486, "Evaluar Year 2 y Beans & Alpacas Expansion",
         "Preparar la entrada al contenido Year 2: mapa Catuaí, café, alpacas y brahman."),
        (487, "Mapa Catuaí: orientación y oportunidades",
         "Recorrer Catuaí y localizar hubs, cultivos tropicales/café y logística."),
        (488, "Café como nuevo cultivo industrial",
         "Montar la cadena de café: plantación, cuidado, cosecha y procesado/venta."),
        (489, "Alpacas: manejo y productos",
         "Construir alojamiento, comprar alpacas y gestionar su producción."),
        (490, "Brahman y ganadería del expansion",
         "Integrar brahman en tu sistema ganadero sin romper la economía."),
        (491, "Nuevas cadenas: pigmento y resina",
         "Activar producciones nuevas del expansion y medir márgenes."),
        (492, "Unificar doctrina multi-mapa",
         "Definir qué haces en Zielonka, qué en Kinlaig y qué en Catuaí."),
        (493, "Flota final: recorte de máquinas inútiles",
         "Vender equipos redundantes y dejar flota A/B/C clara."),
        (494, "Dashboard económico anual",
         "Cerrar un año de juego con balance por rama: campos, animales, fábricas, DLC."),
        (495, "Objetivos de imperio a 50/100 horas",
         "Fijar metas medibles de ha, rebaño, cadenas activas y liquidez."),
        (496, "Rutina diaria del late game (solo)",
         "Diseñar una rutina de sesión de 60–90 minutos que mueva todo el holding."),
        (497, "Checklist maestro de campaña de cosecha",
         "Tener una lista única imprimible para no fallar en picos de trabajo."),
        (498, "Checklist maestro ganadero + producciones",
         "Una sola pasada semanal que evite olvidos caros."),
        (499, "Auditoría final sin mods",
         "Verificar que todo tu progreso usa solo base + DLC oficiales."),
        (500, "Cierre de la guía: tu granja, tus reglas",
         "Celebrar el paso 500 con un plan libre: ya dominas el marco completo de FS25."),
    ]
    out = []
    for n, titulo, objetivo in specs:
        nota = ""
        if n <= 491:
            nota = "Beans & Alpacas Expansion / Year 2."
        out.append(_base_step(
            n, titulo, c, objetivo,
            contexto=(
                "Esta fase consolida todo: cereal, forraje, animales, fábricas, forestal, especiales y DLC. "
                "Catuaí añade café, alpacas, brahman, pigmento y resina. El paso 500 cierra el método, no el juego."
            ),
            procedimiento=[
                f"Hito final #{n}: {titulo}.",
                "Revisa el estado global de tus saves (Zielonka / Kinlaig / Catuaí).",
                "Comprueba liquidez, préstamos e intereses antes de nuevas compras del expansion.",
                "Si entras en Catuaí, aplica el mismo arranque disciplinado: contratos → tierra → especialización.",
                "Para café/alpacas/brahman/pigmento/resina: asegura inputs y logística de pallets/animales.",
                "Actualiza tu dashboard: ingresos por rama y cuellos de botella.",
                "Elimina complejidad inútil (máquinas o cadenas con margen pobre).",
                "Deja por escrito la rutina de la próxima semana de juego.",
                "Guarda versiones limpias de cada mapa (…_FINAL_PASO_N).",
                "Si es el paso 500: elige un objetivo libre creativo (mega-bloque, 100 vacas, café export, etc.).",
            ],
            maquinaria=[
                ("Flota cerealista", "Core", "Zielonka"),
                ("Flota forraje/ganadería", "Core", "Mixta"),
                ("Flota DLC ancha", "Campañas", "NEXAT/Plains"),
                ("Equipo Catuaí/café", "Expansion", "Year 2"),
            ],
            economia=[
                ("Holding multi-rama", "Objetivo late", "Diversificado"),
                ("Colchón", "≥ 1 campaña completa", "Siempre"),
                ("Inversión expansion", "Solo con ROI claro", "Sin mods"),
            ],
            checklist=["Saves OK", "Hito hecho", "Dashboard actualizado", "Flota limpia", "Plan siguiente semana"],
            consejos=[
                "Un imperio estable aburre menos si rotas foco por temporadas (cereal / animales / DLC mapa).",
                "Catuaí no invalida Zielonka: multiplica opciones.",
                "La mejor guía eres tú tras 500 pasos disciplinados: improvisa con datos, no a ciegas.",
            ],
            errores=[
                "Empezar Catuaí en bancarrota.",
                "Mantener 40 máquinas para usar 12.",
                "Olvidar que el late game también se arruina por malos precios.",
                "Dar por 'terminado' el juego y no fijar un nuevo reto.",
            ],
            diagrama="imperio",
            nota_dlc=nota,
            tabla_extra=[(str(a) + "–" + str(b), name) for a, b, name, _ in CHAPTERS],
            tabla_extra_titulo="Mapa completo de la guía (500 pasos)",
            siguiente="Fin de la secuencia." if n == 500 else f"Avanza al paso {n + 1}.",
        ))
    return out


if __name__ == "__main__":
    steps = build_all_steps()
    print(f"OK: {len(steps)} pasos generados. Último: {steps[-1]['titulo']}")
