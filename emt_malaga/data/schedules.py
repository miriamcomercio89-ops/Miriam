# -*- coding: utf-8 -*-
"""Horarios tipo CTS (salidas cabecera) y tiempos entre paradas."""

from __future__ import annotations


def parse_hhmm(s: str) -> int:
    h, m = s.split(":")
    return int(h) * 60 + int(m)


def fmt_hhmm(mins: int) -> str:
    mins = mins % (24 * 60)
    return f"{mins // 60:02d}:{mins % 60:02d}"


def segment_times_min(runtime_min: int, n_stops: int) -> list[int]:
    """Minutos entre paradas consecutivas (aprox. uniforme + 0,5 redondeo)."""
    if n_stops < 2:
        return []
    segs = n_stops - 1
    base = runtime_min // segs
    rem = runtime_min % segs
    out = [base] * segs
    # repartir resto en tramos centrales
    mid = segs // 2
    for i in range(rem):
        out[(mid + i) % segs] += 1
    # mínimo 1 min
    return [max(1, x) for x in out]


def build_departures(start: str, end: str, headway: int) -> list[str]:
    if not headway or headway <= 0:
        return []
    a, b = parse_hhmm(start), parse_hhmm(end)
    if b <= a:
        b += 24 * 60
    out = []
    t = a
    while t <= b:
        out.append(fmt_hhmm(t))
        t += headway
    return out


def _first_hhmm(token: str) -> str | None:
    import re
    m = re.search(r"(\d{1,2}:\d{2})", token)
    return m.group(1) if m else None


def day_templates(line: dict) -> dict:
    """Plantillas de intervalo para Line Editor CTS."""
    raw = line["service"]
    svc = raw.split("·")[0].strip().split("(")[0].strip()
    # take first HH:MM as start and last HH:MM of first segment as end
    import re
    times = re.findall(r"\d{1,2}:\d{2}", svc.split("/")[0])
    start = times[0] if times else "06:00"
    end = times[1] if len(times) > 1 else "22:00"
    # if end is after midnight (00:xx), use 23:45 for evening sample
    eve_end = "23:45" if end.startswith("00") else end
    # peak-only lines (no evening): headway_eve 0
    eve_hw = line["headway_eve_min"] or line["headway_off_min"] or 15
    eve_salidas = []
    if line["headway_eve_min"]:
        eve_salidas = build_departures("20:00", eve_end if eve_end > "20:00" or eve_end.startswith("00") else "22:00", eve_hw)
        if eve_end.startswith("00"):
            eve_salidas = build_departures("20:00", "23:45", eve_hw)

    return {
        "punta_am": {
            "ventana": "07:00–09:30",
            "intervalo_min": line["headway_peak_min"],
            "salidas": build_departures("07:00", "09:30", line["headway_peak_min"]),
        },
        "valle": {
            "ventana": "09:30–16:30",
            "intervalo_min": line["headway_off_min"],
            "salidas": build_departures("09:30", "16:30", line["headway_off_min"]),
        },
        "punta_pm": {
            "ventana": "16:30–20:00",
            "intervalo_min": line["headway_peak_min"],
            "salidas": build_departures("16:30", "20:00", line["headway_peak_min"]),
        },
        "tarde_noche": {
            "ventana": "20:00–cierre",
            "intervalo_min": line["headway_eve_min"] or 0,
            "salidas": eve_salidas,
        },
        "servicio": svc,
        "inicio": start,
        "cierre": end,
    }


def apply_calendar_factor(headway: int, factor: float) -> int:
    """factor < 1 => más frecuente."""
    if not headway:
        return headway
    return max(3, int(round(headway * factor)))
