"""Volumes 00-01: index, protocol, character, marking system."""

from __future__ import annotations

from pdf_engine import GuidePDF
from theme import CONTENT_W, mm
from map_data import LOOT_BY_VOLUME, RIVERSIDE_HOUSE_COUNT_SUBURBS, RIVERSIDE_HOUSE_COUNT_GATED


def vol_00_indice(path: str):
    pdf = GuidePDF(
        path,
        "00",
        "Índice maestro y orden de realización",
        "Serie completa · Solo · Sandbox alta · Sin respawn · Con migración · B42.20",
    )
    pdf.cover(
        "OPERACIÓN LIMPIEZA TOTAL — KNOX COUNTRY",
        [
            "Orden estricto de volúmenes (no saltes regiones).",
            "Protocolo de marcado obligatorio (spray + mapa + guía).",
            "Ruta optimizada desde Riverside hacia el oeste, sur y finalmente Louisville.",
            "Checklists casa por casa / calle por calle / POI por POI.",
            "Bases avanzadas por fase y logística de vehículo/combustible.",
        ],
        {
            "Spawn": "Riverside",
            "Mods": "Ninguno",
            "Formato": "A4 vertical",
            "Idioma": "ES",
        },
    )

    pdf.h1("Cómo usar esta serie")
    pdf.p(
        "Esta no es una guía de “tips”. Es un <b>plan operativo de limpieza total</b> del mapa "
        "vanilla de Build 42.20. Cada volumen se completa en orden. Solo abres el siguiente "
        "cuando el checklist de cierre del volumen actual está al 100%."
    )
    pdf.callout(
        "DATOS DE MAPA",
        f"Riverside: {RIVERSIDE_HOUSE_COUNT_SUBURBS} casas suburbios + {RIVERSIDE_HOUSE_COUNT_GATED} gated (PZwiki). "
        "Calles = Street_names B42. POIs con coords wiki. "
        "Cada volumen tiene tabla de LOOT CRÍTICO. Compañero: map.projectzomboid.com (Streets ON).",
    )
    pdf.sector_map_schematic(
        "Campaña completa — flecha de frentes",
        [
            ["BA-1 RV", "→", "BRAND", "→", "FALLAS", "→", "ECHO"],
            ["↓", "EKRON", "→", "IRVING", "→", "ROSE+P", "→"],
            ["MARCH", "→", "MULD", "→", "WP", "→", "VALLEY"],
            ["→", "LV-SW", "→", "LV-C", "→", "LV-E/N", "OK"],
        ],
        "No saltes frentes. Louisville al final.",
    )
    pdf.p(
        "Tu configuración: <b>Sandbox</b>, población <b>alta</b>, <b>sin respawn</b>, "
        "<b>migración sí</b>, solo, sin mods. Eso significa: lo que matas no vuelve a spawnear "
        "en esa celda, pero los zombis <b>pueden migrar</b> hacia ruido/actividad. Por eso "
        "limpiamos en frentes compactos y sellamos manzanas antes de abrir frentes nuevos."
    )

    pdf.h1("Orden de realización (estricto)")
    rows = [
        ["00", "Este índice", "Leer completo"],
        ["01", "Protocolo, personaje y días 1-14", "Antes de salir a limpiar"],
        ["02", "Riverside — Suburbios sur", "Primera zona limpia"],
        ["03", "Riverside — Comunidad cerrada (este)", "Base avanzada #1"],
        ["04", "Riverside — Distrito comercial norte", "Mayor densidad local"],
        ["05", "Riverside — Oeste industrial + Country Club", "Cierre de Riverside"],
        ["06", "Corredor oeste: farms, Scenic Grove, radio", "Expansión rural"],
        ["07", "Brandenburg", "Ciudad B42 noroeste"],
        ["08", "Fallas Lake + Doe Valley", "Puente sur"],
        ["09", "Echo Creek", "Pueblo rural B42"],
        ["10", "Ekron", "Industrial oeste"],
        ["11", "Irvington + Speedway", "Sur-oeste"],
        ["12", "Rosewood + Prisión", "Sur clásico"],
        ["13", "March Ridge", "Sur-este militar"],
        ["14", "Muldraugh + Dixie", "Eje central"],
        ["15", "West Point", "Norte denso"],
        ["16", "Valley Station + acceso Louisville", "Antesala"],
        ["17", "Louisville SO / Oeste", "Ciudad fase 1"],
        ["18", "Louisville Centro / Sur", "Ciudad fase 2"],
        ["19", "Louisville Este / Norte", "Ciudad fase 3"],
        ["20", "Checklist maestro y cierre del mapa", "Certificación final"],
    ]
    pdf.table(
        ["Vol", "Contenido", "Condición"],
        rows,
        [18 * mm, 95 * mm, 65 * mm],
    )

    pdf.h1("Por qué este orden (ruta elegida)")
    pdf.step(
        1,
        "Anclar Riverside primero",
        "Spawn seguro, río infinito, densidad relativamente manejable para principiante. "
        "Construyes músculo, vehículo, tools y hábitos de marcado sin morir en West Point.",
    )
    pdf.step(
        2,
        "Expandir oeste (Brandenburg) antes que este",
        "El oeste B42 está más vacío entre POIs. Limpiarlo temprano evita que la migración "
        "recontamine tu retaguardia cuando metas ruido en Muldraugh/West Point.",
    )
    pdf.step(
        3,
        "Sur (Echo Creek → Irvington → Rosewood → March Ridge)",
        "Cierras el flanco sur y consigues prisión/fire station/loot militar ligero con frentes controlables.",
    )
    pdf.step(
        4,
        "Eje Dixie (Muldraugh → West Point → Valley Station)",
        "Solo cuando tengas armas de fuego, 2 vehículos y bases avanzadas. Densidad alta + migración.",
    )
    pdf.step(
        5,
        "Louisville al final, por distritos",
        "Endgame. Tres volúmenes. Silencio absoluto, cortes de manzana, nunca tiroteos largos.",
    )

    pdf.h1("Leyenda visual de la serie")
    pdf.table(
        ["Elemento", "Significado"],
        [
            ["Badge VERDE (bajo)", "Residencial ligero / rural"],
            ["Badge AMARILLO (medio)", "Comercio, escuela, gasolinera"],
            ["Badge NARANJA (alto)", "Police, factory, prison wings"],
            ["Badge ROJO (extremo)", "Louisville denso / mall / hospital"],
            ["Checkbox vacío", "Pendiente — no marques de memoria"],
            ["ID tipo RV-S-A-01", "Código único de edificio en la guía"],
        ],
        [55 * mm, 123 * mm],
    )

    pdf.callout(
        "COMPAÑERO DE MAPA",
        "Usa map.projectzomboid.com (capa B42) en paralelo. Esta guía te da el orden y el "
        "checklist; el mapa interactivo te da la forma exacta de cada manzana tras el redesign 42.20.",
    )

    pdf.h1("Checklist de apertura de campaña")
    pdf.checkbox_grid(
        [
            "Sandbox alta / no respawn / migración ON",
            "Spawn Riverside confirmado",
            "Sin mods activos",
            "Volumen 01 leído",
            "Sistema de spray preparado",
            "Carpeta de PDFs impresa o tablet",
            "Regla: un frente a la vez",
            "Regla: sellar manzana antes de abrir otra",
        ]
    )
    pdf.save()


def vol_01_protocolo(path: str):
    pdf = GuidePDF(
        path,
        "01",
        "Protocolo, personaje y primeros 14 días",
        "Fundamentos obligatorios antes de la limpieza total",
    )
    pdf.cover(
        "VOLUMEN 01 — FUNDAMENTOS",
        [
            "Build de personaje recomendada para principiante limpieza-total.",
            "Protocolo de combate silencioso y anti-migración.",
            "Sistema de marcado triple (spray / mapa / guía).",
            "Plan día 1 → día 14 hasta Base Avanzada #1.",
            "Logística de vehículo, combustible y herramientas.",
        ],
        {"Prioridad": "Supervivencia→Limpieza", "Estilo": "Frente compacto", "Base": "Avanzada"},
    )

    pdf.h1("Personaje recomendado (principiante)")
    pdf.p(
        "Objetivo: no morir, limpiar mucho, mantener ritmo. Priorizamos resistencia, "
        "lectura temprana y combate melee fiable."
    )
    pdf.h2("Profesión")
    pdf.bullet("<b>Carpenter</b> (recomendado) — bases avanzadas rápidas, barricadas, muebles de storage.")
    pdf.bullet("Alternativa: <b>Fire Officer</b> si prefieres axe + fitness desde día 1.")
    pdf.bullet("Alternativa limpia-total agresiva: <b>Veteran</b> (solo si controlas pánico; no ideal principiante).")

    pdf.h2("Rasgos positivos")
    pdf.checkbox_grid(
        [
            "Strong (+4) o Stout (+6)",
            "Fit (+6) o Athletic (+10)",
            "Lucky (+4)",
            "Keen Hearing (+6)",
            "Fast Reader (+2)",
            "Outdoorsman (+2)",
            "Dextrous (+2)",
            "Organized (+6) — muy útil para loot masivo",
        ]
    )
    pdf.h2("Rasgos negativos (para pagar puntos)")
    pdf.checkbox_grid(
        [
            "Weak Stomach (-3)",
            "Conspicuous (-4) — asumible si limpias frentes",
            "Smoker (-4)",
            "High Thirst (-6) — río en Riverside lo mitiga",
            "Pacifist (-4) — solo si aceptas melee lento",
            "Sunday Driver (-6) — NO si vas a Louisville",
            "Illiterate — PROHIBIDO",
            "Deaf / Blind — PROHIBIDO para esta campaña",
        ]
    )
    pdf.callout(
        "BUILD OBJETIVO",
        "Carpenter + Strong + Fit + Lucky + Keen Hearing + Fast Reader + Organized. "
        "Compensa con Smoker, Weak Stomach, High Thirst, Conspicuous. Evita Sunday Driver.",
    )

    pdf.h1("Sandbox: checklist de confirmación")
    pdf.table(
        ["Ajuste", "Valor tuyo", "Implicación operativa"],
        [
            ["Zombie population", "Alta", "Manzanas más llenas; limpia lento"],
            ["Respawn", "No", "El progreso es permanente en celda"],
            ["Migration", "Sí", "Ruido = recontaminación"],
            ["Mods", "Ninguno", "Layouts vanilla 42.20"],
            ["Modo", "Solo", "Sin backup de fuego amigo"],
        ],
        [45 * mm, 35 * mm, 98 * mm],
    )

    pdf.h1("Protocolo de limpieza de un edificio (SOP)")
    for i, (t, b) in enumerate(
        [
            ("Reconocimiento exterior", "Da la vuelta completa. Cuenta zombis visibles. Identifica 2 salidas."),
            ("Aislamiento de puerta", "Atrae 1-3 con silbido corto. Nunca abras con 8+ pegados a la puerta."),
            ("Entrada controlada", "Abre, retrocede, pelea en umbral. No te metas al pasillo ciego."),
            ("Barrido por habitaciones", "Siempre izquierda→derecha o el orden impreso en la ficha del edificio."),
            ("Plantas superiores", "Sube solo con stamina >60%. Escucha escaleras 3 segundos."),
            ("Garaje y sótano (B42)", "Trata sótanos como edificio nuevo. Linterna + arma secundaria."),
            ("Loot priorizado", "Armas/tools/bolsas/comida no perecedera/mapas/gas. Deja lo pesado para furgoneta."),
            ("Marcado triple", "1) Spray en puerta 2) X en mapa del juego 3) Checkbox de esta guía."),
            ("Sello de manzana", "Si es el último edificio de la calle, marca también la esquina con spray SECTOR OK."),
        ],
        start=1,
    ):
        pdf.step(i, t, b)

    pdf.h1("Sistema de marcado (obligatorio)")
    pdf.h2("Códigos de spray recomendados")
    pdf.table(
        ["Marca", "Color", "Significado"],
        [
            ["L", "Verde / teal", "Limpio (edificio)"],
            ["P", "Amarillo", "Parcial — faltan plantas/sótano"],
            ["X", "Rojo", "Peligroso / no entrar aún"],
            ["B#", "Azul", "Base avanzada número #"],
            ["G", "Naranja", "Gas / fuel cache"],
            ["OK", "Verde grande", "Manzana/sector cerrado"],
        ],
        [25 * mm, 40 * mm, 113 * mm],
    )
    pdf.h2("Notas en mapa del juego")
    pdf.bullet("Una nota por manzana con texto: <b>RV-S-A OK 14/14</b> (código sector + contador).")
    pdf.bullet("Nota de base: <b>BASE-1 GATED</b> con lista de loot crítico almacenado.")
    pdf.bullet("Nota de peligro migratorio: <b>RUIDO-KEEP OUT</b> si tuviste tiroteo.")

    pdf.h2("Checklist físico de esta guía")
    pdf.p(
        "Cada edificio tiene checkboxes. Imprime o usa PDF anotable. "
        "Si no puedes marcar el PDF, lleva un cuaderno espejo con los IDs."
    )

    pdf.h1("Combate anti-migración (reglas de oro)")
    pdf.checkbox_grid(
        [
            "Prioriza melee y silencio",
            "Silbido corto > grito",
            "Nunca disparar salvo emergencia o Louisville planificado",
            "Máx. 3-4 zombis a la vez (kite)",
            "Si vienen 10+, abandona edificio y resetea",
            "No limpies de noche al principio",
            "Cierra puertas al salir (control de flujo)",
            "Tras un combate ruidoso: 10 min de escucha",
        ]
    )

    pdf.h1("Días 1-14 — plan de arranque Riverside")
    pdf.street_header("FASE 0 · Supervivencia mínima", "Casa spawn → barrio inmediato", "bajo", "No abras el distrito comercial todavía")
    days = [
        ("Día 1", "Loota casa spawn + 2-3 casas adyacentes. Bolsa, arma melee (bate/crowbar/axe), comida, agua. Duerme temprano."),
        ("Día 2", "Expande 1 manzana del barrio spawn. Busca sheet rope, hammer, nails, screwdriver. Marca casas con L."),
        ("Día 3", "Localiza vehículo funcional cerca. No vayas al business district. Practica kite de 2-3 zombis."),
        ("Día 4-5", "Ruta a ferretería / gasolinera oeste solo si hay ventana clara. Prioriza tools + gas can. Vuelve al barrio."),
        ("Día 6-7", "Termina el sector spawn completo (Vol 02 sector A). Primera furgoneta/pickup si aparece."),
        ("Día 8-9", "Establece stash intermedio. Lee skillbooks (Carpentry, Aiming no prioritario aún)."),
        ("Día 10-11", "Empieza Vol 02 en serio: suburbios sur manzana a manzana. Ritmo lento > heroico."),
        ("Día 12-14", "Cierra suburbios sur parciales y prepara asalto a Comunidad Cerrada (Vol 03). Base Avanzada #1."),
    ]
    for d, t in days:
        pdf.h3(d)
        pdf.p(t)
        pdf.checkbox(f"Completado: {d}")

    pdf.loot_critical("01", LOOT_BY_VOLUME["01"])

    pdf.h1("Kit de limpieza estándar (lleva siempre)")
    pdf.checkbox_grid(
        [
            "Arma melee principal + backup",
            "2 bolsas / hiking bag",
            "Comida 1 día + agua",
            "Vendas / disinfectant",
            "Spray paint (2+ colores)",
            "Flashlight + baterías",
            "Crowbar o axe",
            "Sheet rope (2)",
            "Gas can (si hay coche)",
            "Mapa Riverside + lápiz",
            "Martillo + clavos (emergencia)",
            "Cómodo / good shoes",
        ]
    )

    pdf.h1("Bases avanzadas — doctrina")
    pdf.p(
        "No mantengas una sola fortaleza para siempre. Por cada región grande instalas una "
        "<b>Base Avanzada (BA)</b>: cama, stash, generator si procede, 1 vehículo de reserva, "
        "y puerta marcada B#. Cuando una región está OK, la BA se convierte en depósito y sigues."
    )
    pdf.table(
        ["BA#", "Ubicación objetivo", "Cuándo"],
        [
            ["BA-1", "Comunidad cerrada Riverside", "Tras Vol 03"],
            ["BA-2", "Brandenburg (casa reforzada)", "Tras Vol 07"],
            ["BA-3", "Echo Creek / granja este", "Tras Vol 09"],
            ["BA-4", "Rosewood Fire Station", "Tras Vol 12"],
            ["BA-5", "Muldraugh warehouse norte", "Tras Vol 14"],
            ["BA-6", "West Point periferia oeste", "Tras Vol 15"],
            ["BA-7", "Valley Station / edge Louisville", "Tras Vol 16"],
            ["BA-8+", "Distritos Louisville", "Vol 17-19"],
        ],
        [20 * mm, 90 * mm, 68 * mm],
    )

    pdf.h1("Vehículos (decisión de la guía)")
    pdf.bullet("Prioridad 1: <b>Pickup / Van</b> para loot de limpieza.")
    pdf.bullet("Prioridad 2: coche rápido de huida (sport) guardado en BA.")
    pdf.bullet("Nunca dejes el único vehículo dentro de una zona no sellada.")
    pdf.bullet("Cache de gas cada 2 sectores limpios (marca G).")

    pdf.h1("Cierre del Volumen 01")
    pdf.checkbox_grid(
        [
            "Personaje creado con build acordada",
            "SOP de edificio memorizado",
            "Códigos de spray listos",
            "Días 1-3 sobrevividos",
            "Primeras casas marcadas L",
            "Listo para abrir Volumen 02",
        ]
    )
    pdf.save()
