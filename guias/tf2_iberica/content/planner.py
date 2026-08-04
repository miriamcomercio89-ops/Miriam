# -*- coding: utf-8 -*-
"""Planificador mes a mes 1850-01 → 2050-12."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from guias.tf2_iberica import criteria as C
from guias.tf2_iberica.data.cities import (
    ADDED_CITIES_NOTE,
    CITIES,
    STATION_NAME,
    cities_by_priority,
    coastal_cities,
)
from guias.tf2_iberica.data.corridors import AIR_ROUTES, RAIL_CORRIDORS, SEA_ROUTES
from guias.tf2_iberica.data.industries import INDUSTRIES, industries_for_year
from guias.tf2_iberica.data.milestones import milestone_for
from guias.tf2_iberica.data.mods import (
    CORE_MODS,
    FLEET,
    VANILLA_FALLBACK,
    mods_for_month,
)


def platform_spec(year: int, kind: str = "regional") -> tuple[int, int]:
    n, length = 2, 100
    for y, pn, pl in C.PLATFORM_ERA:
        if year >= y:
            n, length = pn, pl
    if kind == "ave":
        return max(n, 6), max(length, 400)
    if kind == "hub":
        # Crecimiento histórico del hub: no empezar con demasiados andenes
        if year < 1860:
            return 3, length
        if year < 1900:
            return n + 1, length
        return n + 2, length
    if kind == "mercancías":
        return max(2, n - 1), length + 40
    if kind == "apeadero":
        return 2, min(length, 140)
    return n, length


def station_label(city: str) -> str:
    return STATION_NAME.get(city, city)


@dataclass
class MonthPlan:
    year: int
    month: int
    title: str
    context: str
    objectives: list[str] = field(default_factory=list)
    construction: list[str] = field(default_factory=list)
    lines: list[str] = field(default_factory=list)
    fleet: list[str] = field(default_factory=list)
    industries: list[str] = field(default_factory=list)
    mods_new: list[dict[str, Any]] = field(default_factory=list)
    budget: list[str] = field(default_factory=list)
    checklist: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    diagram_hint: str | None = None
    company: str = "Red Ibérica"

    @property
    def label(self) -> str:
        return f"{C.MONTHS_ES[self.month - 1]} {self.year}"


class GuideState:
    def __init__(self):
        self.connected: set[str] = set()
        self.stations: dict[str, tuple[int, int]] = {}  # city -> platforms, length
        self.industries_built: list[str] = []
        self.mods_seen: set[str] = set()
        self.corridors_done: set[str] = set()
        self.sea_done: set[str] = set()
        self.air_done: set[str] = set()
        self.tram_done: set[str] = set()
        self.metro_done: set[str] = set()
        self.bus_done: set[str] = set()
        self.ports_done: set[str] = set()
        self.airports_done: set[str] = set()
        self.double_track: set[str] = set()
        self.electrified: set[str] = set()
        self.industry_idx = 0
        self.city_queue = [c[0] for c in cities_by_priority()]
        self.month_index = 0
        self.loan_hint_count = 0

    def ensure_city(self, city: str, year: int, kind: str = "regional"):
        actions = []
        if city not in self.connected:
            n, L = platform_spec(year, "hub" if city == C.MAIN_HUB else kind)
            name = station_label(city)
            actions.append(
                f"Estación pasajeros «{name}»: {n} andenes × {L} m "
                f"(pasante si el corredor lo atraviesa; terminal solo en fondo de saco costero)."
            )
            actions.append(
                f"Estación mercancías anexa a {city}: {max(2, n - 2)} andenes × {L + 40} m, "
                f"muelle cubierto y playa de 4–8 vías de apartadero."
            )
            actions.append(
                f"Depósito/cochera en {city}: 2–4 vías cubiertas + taller ligero "
                f"(en hubs: rotonda o nave larga)."
            )
            self.connected.add(city)
            self.stations[city] = (n, L)
        return actions


def _phase_name(year: int) -> str:
    phases = C.EXPANSION_PHASES
    if year < 1865:
        return phases[0]
    if year < 1880:
        return phases[1]
    if year < 1895:
        return phases[2]
    if year < 1910:
        return phases[3]
    if year < 1925:
        return phases[4]
    if year < 1940:
        return phases[5]
    if year < 1960:
        return phases[6]
    if year < 1980:
        return phases[7]
    if year < 1995:
        return phases[8]
    if year < 2010:
        return phases[9]
    if year < 2030:
        return phases[10]
    return phases[11]


def _maintenance_tasks(state: GuideState, year: int, month: int) -> list[str]:
    tasks = []
    cities = sorted(state.connected)
    if not cities:
        return ["Revisar caja y préstamos; no hay red aún."]
    # rotate through cities
    i = (state.month_index + month) % len(cities)
    city = cities[i]
    city2 = cities[(i + 3) % len(cities)]
    n, L = state.stations.get(city, (2, 100))
    target_n, target_L = platform_spec(year, "hub" if city == C.MAIN_HUB else "regional")
    if n < target_n or L < target_L:
        tasks.append(
            f"Ampliar {station_label(city)}: pasar de {n}×{L} m a {target_n} andenes × {target_L} m."
        )
        state.stations[city] = (target_n, target_L)
    else:
        tasks.append(
            f"Inspección de capacidad en {station_label(city)}: si ocupación > {int(C.OCCUPANCY_EXPAND*100)} %, "
            f"añadir 1 andén o +40 m de longitud."
        )
    # double track / electrify rotation
    corridors = [c for c in RAIL_CORRIDORS if c[0] in state.corridors_done]
    if corridors:
        c = corridors[state.month_index % len(corridors)]
        if c[0] not in state.double_track and year >= c[3] + 8:
            tasks.append(f"Desdoblar vía en corredor {c[1]} (tramos saturados primero).")
            state.double_track.add(c[0])
        elif c[0] not in state.electrified and year >= max(C.ELECTRIFY_PILOT, c[3] + 15):
            if year >= C.ELECTRIFY_PILOT:
                tasks.append(
                    f"Electrificar {c[1]} con mod «{C.TRACKS_MOD}»; catenaria continua y subtensión en túneles."
                )
                state.electrified.add(c[0])
    # always something about roads/signals
    mode_rot = state.month_index % 6
    if mode_rot == 0:
        tasks.append("Revisar señales path en cruces; evitar deadlocks en playas de vías.")
    elif mode_rot == 1:
        tasks.append("Ajustar frecuencias: subir oferta donde idle=0 y demanda reprimida.")
    elif mode_rot == 2:
        tasks.append("Renovar 10–20 % de flota más antigua en la línea más rentable.")
    elif mode_rot == 3:
        tasks.append("Mejorar caminos propios: radio de curva y pendientes hacia polígonos.")
    elif mode_rot == 4:
        tasks.append("Equilibrar carga: eliminar esperas > 4 meses en industrias.")
    else:
        tasks.append("Auditoría de correos/pasajeros: conectar barrios sin cobertura peatonal.")

    # Extra mensual obligatorio (nunca mes vacío de micro-obras)
    extras = [
        f"Camino propio de 2 carriles entre polígono de {city} y {station_label(city)} (suavizar pendientes).",
        f"Añadir 1–2 paradas peatonales/bus cubriendo el distrito comercial de {city2}.",
        f"Apartadero de cruce a mitad de camino en la línea más lenta que toque {city}.",
        f"Almacén cubierto + rampa en mercancías de {city}: +30 % capacidad de carga.",
        f"Iluminación/detalles de andén en {station_label(city2)} (assets de bagaje si el mod está activo).",
        f"Correo: habilitar transporte de mail en la mejor línea pasajeros de {city}.",
        f"Recorte de vegetación y desmonte en curva cerrada del acceso sur de {city}.",
        f"Revisar enlaces peatonales estación–casco en {city2}; máximo 2–3 min a pie a la demanda.",
        f"Subestación/depósito auxiliar: vía muerta de rescate en {station_label(city)}.",
        f"Cartelería de línea y topes de vía en {station_label(city2)} (mods de señales/buffers si apply).",
        f"Balanceo de composiciones: medir tiempo de viaje {city}–{city2} y reducir esperas en origen.",
        f"Simular pico: añadir vehículo extra solo en hora punta si el juego lo permite por frecuencia.",
    ]
    tasks.append(extras[state.month_index % len(extras)])
    tasks.append(
        f"Financiero: anotar beneficio de la línea top; si < mantenimiento, subir tarifa o frecuencia en {city}."
    )
    return tasks


def _pick_industries(state: GuideState, year: int, count: int = 1) -> list[str]:
    available = industries_for_year(year)
    out = []
    # prefer not yet built names
    built = set(state.industries_built)
    pool = [i for i in available if i[0] not in built] or available
    for k in range(count):
        ind = pool[(state.industry_idx + k) % len(pool)]
        name, cat, inputs, outputs, zona, buy = ind
        city_anchor = (
            sorted(state.connected)[state.industry_idx % max(1, len(state.connected))]
            if state.connected
            else "Madrid"
        )
        buy_txt = " (SOLO COMPRA — candado Akalipsia)" if buy else ""
        route = ""
        if inputs:
            route = f" Entradas: {', '.join(inputs)}."
        if outputs:
            route += f" Salidas: {', '.join(outputs)}."
        out.append(
            f"Construir «{name}»{buy_txt} — ubicación: {zona}, anclada a {city_anchor} "
            f"(relativo: 4–12 km según relieve).{route} "
            f"Camión/lanzadera a estación mercancías de {city_anchor}."
        )
        state.industries_built.append(name)
    state.industry_idx += count
    return out


def _bus_tram_metro(state: GuideState, year: int, month: int) -> tuple[list[str], list[str]]:
    lines, construction = [], []
    # buses: cities > connected, staggered
    for city, _, role, _, prio in cities_by_priority():
        if city not in state.connected:
            continue
        if city in state.bus_done:
            continue
        # start buses when city connected and year>=1880 or hub earlier with horse? TF2 has early buses later
        if year < 1900 and role not in ("hub",):
            continue
        if year < 1920 and prio > 20:
            continue
        if (year * 12 + month + prio) % 11 != 0 and city != C.MAIN_HUB:
            continue
        construction.append(
            f"Red de bus en {city}: 8–14 paradas cubriendo residencial, comercial e industrial; "
            f"estación de bus junto a {station_label(city)}; intercambiador."
        )
        lines.append(
            f"Bus urbano {city} L1/L2: frecuencia {C.FREQ['bus_urbano']}; "
            f"vehículo: {VANILLA_FALLBACK['bus'] if year < 1994 else 'ALSA/Citaro según año'}."
        )
        state.bus_done.add(city)
        break

    for city, y0 in C.TRAM_CITIES.items():
        if not y0 or year < y0 or city in state.tram_done or city not in state.connected:
            continue
        if (year, month) >= (y0, 1) and month in (3, 6, 9, 11):
            construction.append(
                f"Tranvía {city}: vía doble en avenida principal, 10–16 paradas, depósito propio."
            )
            lines.append(
                f"Tranvía {city} T1: frecuencia {C.FREQ['tranvia']}; "
                f"{VANILLA_FALLBACK['tranvia'] if year < 2000 else 'Alstom Citadis 302'}."
            )
            state.tram_done.add(city)
            break

    for city, y0 in C.METRO_CITIES.items():
        if year < y0 or city in state.metro_done or city not in state.connected:
            continue
        if month in (4, 10):
            construction.append(
                f"Metro {city} L1: túnel bajo centro, 8–12 estaciones, andenes 90–120 m "
                f"(ampliar a 140–160 m si articulados)."
            )
            lines.append(
                f"Metro {city} L1: frecuencia {C.FREQ['metro']}; {VANILLA_FALLBACK['metro']}."
            )
            state.metro_done.add(city)
            break
    return lines, construction


def build_month(state: GuideState, year: int, month: int) -> MonthPlan:
    state.month_index += 1
    ms = milestone_for(year, month)
    phase = _phase_name(year)
    title = ms["title"] if ms else f"Operación {phase}"
    context = (
        ms["detail"]
        if ms
        else (
            f"Fase «{phase}». Mantener economía real: reinvertir "
            f"~{int(C.REINVEST_NEW*100)} % en red nueva, "
            f"{int(C.REINVEST_FLEET*100)} % flota, "
            f"{int(C.REINVEST_MAINT*100)} % mantenimiento. "
            f"Si falta liquidez, pedir préstamo y continuar (versión estricta)."
        )
    )
    company = ms["company"] if ms else "Red Ibérica"

    plan = MonthPlan(
        year=year,
        month=month,
        title=title,
        context=context,
        company=company,
        diagram_hint=phase,
    )

    # Mods
    new_mods = mods_for_month(year, month)
    if year == 1850 and month == 1:
        new_mods = list(CORE_MODS) + [m for m in new_mods if m not in CORE_MODS]
    for m in new_mods:
        name = m["name"]
        if name in state.mods_seen:
            continue
        state.mods_seen.add(name)
        plan.mods_new.append(m)
        wid = m.get("id", "")
        stats = m.get("stats") or m.get("note", "")
        plan.fleet.append(
            f"DESCARGAR Workshop: «{name}»"
            + (f" (id {wid})" if wid else "")
            + (f" — {stats}" if stats else "")
            + (f" · rol: {m['role']}" if m.get("role") else "")
        )

    # January 1850 special bootstrap
    if year == 1850 and month == 1:
        plan.objectives = [
            "Crear partida 1850, dificultad media, economía real, monopolio, UI en español.",
            "Suscribir mods core del mes y activarlos sin conflictos obvios.",
            "Fijar Madrid como hub: estación, depósito, caminos propios radiales.",
            "Colocar primeras industrias agro/mina cerca de Madrid y un camino de camión.",
        ]
        plan.construction.extend(state.ensure_city("Madrid", year, "hub"))
        plan.construction.append(
            "Caminos propios: 4 radiales provisionales desde Madrid Atocha (N, NE, SE, S), "
            "calzada simple, arcenes limpios de árboles del mapa."
        )
        plan.construction.append(
            "Señales: instalar path signals en entrada/salida de estación Madrid; "
            "más adelante «Spanish Mechanical Signals…»."
        )
        plan.industries.extend(_pick_industries(state, year, 3))
        plan.lines.append(
            "Línea camión Madrid Polígono–Madrid Mercancías: lanzadera continua, 3–5 camiones vanilla."
        )
        plan.lines.append(
            "Aún sin tren de viajeros: preparar trazado hacia Aranjuez (desmonte suave, radio amplio)."
        )
        plan.budget = [
            "Reservar 40 % caja a estación+depósito, 30 % industrias, 20 % caminos, 10 % colchón.",
            "Activar préstamo si la estación hub deja la caja bajo 3 meses de mantenimiento.",
        ]
        plan.checklist = [
            "Mods core activos y partida guardada «1850-01-hub».",
            "Madrid Atocha 2 andenes × 100 m + mercancías + depósito.",
            "≥3 industrias Akalipsia conectadas por camión.",
            "Pausa al 1 de febrero tras verificar beneficios ≥ 0 o préstamo cubierto.",
        ]
        plan.warnings = [
            "Incompatibilidad: no mezclar packs de catenaria distintos sin probar; "
            f"priorizar «{C.TRACKS_MOD}» cuando electrifiques.",
        ]
        plan.fleet.append(
            f"Tren provisional: {VANILLA_FALLBACK.get('bus')} no aplica; usar vapor vanilla "
            f"si 'La Mataró' aún no carga; preferir Workshop 'La Mataró' 1-1-1."
        )
        return plan

    # Objectives generic
    plan.objectives.append(f"Avanzar fase «{phase}» con al menos una obra de red visible.")
    plan.objectives.append("Mantener ocupación media < 90 % ampliando oferta o andenes.")
    if ms:
        plan.objectives.insert(0, f"Hito: {ms['title']}.")

    # Connect next cities / corridors (one corridor slot per month max)
    corridor_built = False
    for corr in RAIL_CORRIDORS:
        cid, cname, cities, y0, kind, _ = corr
        if cid in state.corridors_done or year < y0:
            continue
        # Activate in start year on a deterministic month, or catch up later in January
        target_month = (int(cid[1:]) * 3) % 12 + 1
        if year == y0 and month != target_month and not ms:
            continue
        if year > y0 and month != 1:
            continue
        for city in cities:
            plan.construction.extend(
                state.ensure_city(
                    city,
                    year,
                    "hub" if city in C.SUB_HUBS or city == C.MAIN_HUB else kind,
                )
            )
        n, L = platform_spec(
            year, "ave" if kind == "ave" else ("hub" if cities[0] == C.MAIN_HUB else "regional")
        )
        via = "doble" if kind in ("magistral", "ave", "internacional") or year >= y0 + 10 else "única"
        plan.construction.append(
            f"Trazado ferroviario «{cname}»: vía {via} entre {' – '.join(cities)}; "
            f"pendiente suave; túneles en sierras; apeaderos {max(2, n-1)} andenes × {L} m."
        )
        veh = "vapor Workshop disponible / vanilla"
        for item in reversed(FLEET):
            if item[0] <= year and item[4] == "tren":
                veh = item[2]
                break
        freq = C.FREQ["ave"] if kind == "ave" else (
            C.FREQ["largo_recorrido"]
            if kind in ("magistral", "internacional", "francia")
            else C.FREQ["regional"]
        )
        plan.lines.append(
            f"Tren {cname} ({kind}): frecuencia {freq}; material «{veh}»; "
            f"composiciones de {3 if year < 1900 else 6 if year < 1980 else 8} coches / UT."
        )
        if year >= 1860 and kind != "ave":
            plan.lines.append(
                f"Mercancías {cname}: trenes dedicados minerales/agro del corredor; "
                f"apartaderos cada 15–25 km."
            )
        elif kind == "ave":
            plan.lines.append(
                f"AVE {cname}: solo viajeros; mercancías pesadas permanecen en la convencional paralela."
            )
            plan.construction.append(
                f"Estaciones AVE intermedias: 4–6 andenes × 400 m; terminales hub hasta 8–10×400 m."
            )
        state.corridors_done.add(cid)
        corridor_built = True
        break

    if corridor_built:
        pass  # city ramal skipped this month

    # If no corridor this month, connect next city from queue
    if not any("Trazado ferroviario" in x for x in plan.construction):
        for city in state.city_queue:
            if city in state.connected:
                continue
            # gate by year roughly via priority
            prio = next(p for n, _, _, _, p in CITIES if n == city)
            if year < 1855 and prio > 5:
                continue
            if year < 1870 and prio > 20:
                continue
            if year < 1890 and prio > 35:
                continue
            if year < 1920 and prio > 50:
                continue
            if year < 1960 and prio > 60:
                continue
            # link from nearest connected
            if not state.connected:
                break
            anchor = C.MAIN_HUB if C.MAIN_HUB in state.connected else sorted(state.connected)[0]
            # prefer geographic-ish anchors from corridors
            for corr in RAIL_CORRIDORS:
                if city in corr[2]:
                    for c2 in corr[2]:
                        if c2 in state.connected:
                            anchor = c2
                            break
            plan.construction.extend(state.ensure_city(city, year))
            n, L = platform_spec(year)
            plan.construction.append(
                f"Ramal {anchor}–{city}: vía única (desdoblar en 8–12 años), "
                f"estación {station_label(city)} {n}×{L} m."
            )
            plan.lines.append(
                f"Regional {anchor}–{city}: frecuencia {C.FREQ['regional']}; vapor/diésel/eléctrico según década."
            )
            break

    # Sea
    for sid, sname, cities, y0, kind in SEA_ROUTES:
        if year < y0 or sid in state.sea_done:
            continue
        if (hash(sid) % 12) + 1 != month and month not in (5, 6):
            continue
        for city in cities:
            plan.construction.extend(state.ensure_city(city, year, "hub" if city in C.SUB_HUBS else "regional"))
            if city in coastal_cities() and city not in state.ports_done:
                muelles = 2 if year < 1900 else 4 if year < 1960 else 6
                plan.construction.append(
                    f"Puerto {city}: {muelles} muelles (ampliar +2 si espera > 2 meses); "
                    f"conexión ferroviaria/caminera al muelle; almacén cubierto."
                )
                state.ports_done.add(city)
        plan.lines.append(
            f"Ruta marítima «{sname}» ({kind}): frecuencia {C.FREQ['ferry']}; "
            f"{VANILLA_FALLBACK['barco']}."
        )
        state.sea_done.add(sid)
        break

    # Air
    for aid, aname, cities, y0, kind in AIR_ROUTES:
        if year < y0 or aid in state.air_done:
            continue
        if (hash(aid) % 12) + 1 != month and month != 4:
            continue
        for city in cities:
            plan.construction.extend(state.ensure_city(city, year))
            if city not in state.airports_done and year >= y0:
                pistas = 1 if year < 1970 else 2
                plan.construction.append(
                    f"Aeropuerto {city}: {pistas} pista(s), terminal pequeña "
                    f"{'(ampliar a 2 terminales)' if year >= 1990 else ''}; "
                    f"bus lanzadera a {station_label(city)}."
                )
                state.airports_done.add(city)
        av = "IBERIA: historical fleet" if year >= 1933 else VANILLA_FALLBACK["avion"]
        if year >= 2017:
            av = "Airbus A319/A320 Vueling / Iberia según ruta"
        plan.lines.append(
            f"Aéreo «{aname}» ({kind}): {C.FREQ['avion_hub']}; material «{av}»."
        )
        state.air_done.add(aid)
        break

    # Urban
    ulines, uconst = _bus_tram_metro(state, year, month)
    plan.lines.extend(ulines)
    plan.construction.extend(uconst)

    # Industries every month
    n_ind = 2 if year < 1900 else 1 if month % 2 == 0 else 2
    if year >= 2000 and month % 3 == 0:
        n_ind = 2
    plan.industries.extend(_pick_industries(state, year, n_ind))

    # Maintenance always
    plan.construction.extend(_maintenance_tasks(state, year, month))

    # Fleet replacement hints
    if year >= 1965 and month == 9:
        plan.fleet.append(
            "Retirar vapor restante en magistrales planas; reasignar a maniobras o museos/assets."
        )
    if year >= 1992 and month == 4 and "AVE" not in "".join(plan.lines):
        plan.fleet.append(
            "Preparar material AVE S100/S101; andenes 400 m en Madrid Atocha / Sevilla Santa Justa."
        )
    if not plan.fleet:
        # always mention current recommended vehicle for a random active corridor
        plan.fleet.append(
            "Sin mod nuevo este mes: reforzar flota existente (+2 vehículos) en la línea con mayor ocupación."
        )
        if year < 1933:
            plan.fleet.append(f"Barco/aéreo si aplica: {VANILLA_FALLBACK['barco']} / {VANILLA_FALLBACK['avion']}.")

    # Budget
    plan.budget = [
        f"Regla: {int(C.REINVEST_NEW*100)}/{int(C.REINVEST_FLEET*100)}/{int(C.REINVEST_MAINT*100)} "
        f"(red / flota / mantenimiento).",
        "Si el saldo proyectado a 3 meses es negativo: préstamo inmediato y no pausar el hito del mes.",
    ]
    if ms:
        plan.budget.append("Prioridad de gasto: hito histórico > ampliación andenes > industrias nuevas.")

    # Checklist
    plan.checklist = [
        "Obras del mes construidas y enlazadas (sin tramos huérfanos).",
        "Líneas nuevas con vehículos asignados y frecuencia objetivo.",
        "Industrias del mes con ruta de entrada/salida activa.",
        "Guardado nombrado AAAA-MM + anotación de préstamo si lo hubo.",
    ]
    if plan.mods_new:
        plan.checklist.insert(0, "Mods nuevos suscritos, ordenados y probados 10 s en pausa.")

    # Warnings rare
    if any("catenaria" in (m.get("name", "") + m.get("stats", "")).lower() or m.get("mode") == "infra" and "track" in m.get("name", "").lower() for m in plan.mods_new):
        plan.warnings.append(
            "Posible conflicto entre packs de vía/catenaria: deja activo solo el pack español recomendado."
        )
    if year == 1941 and month == 1:
        plan.warnings.append("Renombrar líneas a librea RENFE; no demoler estaciones históricas útiles.")

    # Ensure never empty sections
    if not plan.construction:
        plan.construction.append("Mejora local: añadir apartadero y señalización en la estación más congestión.")
    if not plan.lines:
        plan.lines.append(
            f"Refuerzo: duplicar composición en la mejor línea de pasajeros; frecuencia {C.FREQ['regional']}."
        )
    if not plan.industries:
        plan.industries.extend(_pick_industries(state, year, 1))

    # Added cities note once
    if year == 1850 and month == 2:
        plan.context += " Ciudades extra añadidas por la guía: " + "; ".join(ADDED_CITIES_NOTE) + "."

    return plan


def build_decade(start_year: int) -> tuple[GuideState, list[MonthPlan]]:
    """Build plans for a decade; state should be continued externally for full run."""
    raise NotImplementedError


def build_all_months() -> list[MonthPlan]:
    state = GuideState()
    plans: list[MonthPlan] = []
    for year in range(1850, 2051):
        for month in range(1, 13):
            plans.append(build_month(state, year, month))
    return plans


def plans_for_decade(plans: list[MonthPlan], start_year: int) -> list[MonthPlan]:
    end = start_year + 9
    if start_year == 2050:
        return [p for p in plans if p.year == 2050]
    return [p for p in plans if start_year <= p.year <= end]


def decade_starts() -> list[int]:
    years = list(range(1850, 2050, 10)) + [2050]
    return years
