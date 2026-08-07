"""Building catalog helpers — systematic house-by-house inventories."""

from __future__ import annotations

HOUSE_ROOMS_1F = [
    "Porche / entrada",
    "Salón",
    "Cocina",
    "Baño",
    "Dormitorio 1",
    "Dormitorio 2 / oficina",
    "Trastero / lavadero",
    "Patio trasero",
]

HOUSE_ROOMS_2F = HOUSE_ROOMS_1F + [
    "Escaleras / hall superior",
    "Dormitorio principal",
    "Baño superior",
    "Ático / trastero superior (si existe)",
]

HOUSE_ROOMS_GARAGE = HOUSE_ROOMS_2F + [
    "Garaje (vehículo/herramientas)",
    "Taller lateral",
]

SHOP_ROOMS = [
    "Entrada / escaparate",
    "Sala de ventas",
    "Mostrador / caja",
    "Almacén trasero",
    "Oficina / baño empleados",
    "Tejado / acceso trasero",
]

WAREHOUSE_ROOMS = [
    "Muelle / carga",
    "Nave principal",
    "Estanterías A-C",
    "Estanterías D-F",
    "Oficinas",
    "Cuarto de herramientas",
    "Exterior perimetral",
]


def house(
    bid: str,
    name: str,
    coords: str,
    risk: str = "bajo",
    floors: str = "1-2",
    garage: bool = True,
    basement: bool = True,
    notes: str = "",
    rooms: list[str] | None = None,
) -> dict:
    if rooms is None:
        rooms = HOUSE_ROOMS_GARAGE if garage else (HOUSE_ROOMS_2F if "2" in floors else HOUSE_ROOMS_1F)
    return {
        "id": bid,
        "name": name,
        "coords": coords,
        "type": "Vivienda",
        "floors": floors,
        "garage": garage,
        "basement": basement,
        "risk": risk,
        "rooms": rooms,
        "notes": notes,
        "order": "Perímetro → puerta → PB → P1 → garaje → sótano → patio → spray",
    }


def poi(
    bid: str,
    name: str,
    coords: str,
    btype: str,
    risk: str,
    rooms: list[str],
    notes: str = "",
    floors: str = "1+",
) -> dict:
    return {
        "id": bid,
        "name": name,
        "coords": coords,
        "type": btype,
        "floors": floors,
        "garage": False,
        "basement": True,
        "risk": risk,
        "rooms": rooms,
        "notes": notes,
        "order": "Perímetro silencioso → entradas → piso a piso → azotea → marcado",
    }


def residential_block(
    prefix: str,
    street: str,
    side: str,
    start_n: int,
    count: int,
    base_x: int,
    base_y: int,
    step_x: int = 12,
    step_y: int = 0,
    risk: str = "bajo",
    garage: bool = True,
    style: str = "suburbana",
) -> list[dict]:
    """Generate sequential house cards along a street side."""
    out = []
    for i in range(count):
        num = start_n + i * 2  # odd/even addressing feel
        x = base_x + i * step_x
        y = base_y + i * step_y
        floors = "2" if i % 3 != 0 else "1"
        out.append(
            house(
                bid=f"{prefix}-{i+1:02d}",
                name=f"{street} #{num} ({side}) — {style}",
                coords=f"{x}x{y}",
                risk=risk,
                floors=floors,
                garage=garage if i % 4 != 3 else False,
                basement=i % 2 == 0,
                notes="Marca puerta principal y valla trasera. Revisa coches en driveway.",
            )
        )
    return out


def numbered_units(
    prefix: str,
    label: str,
    count: int,
    base_x: int,
    base_y: int,
    risk: str,
    unit_type: str = "Unidad",
    rooms: list[str] | None = None,
) -> list[dict]:
    rooms = rooms or ["Puerta", "Interior principal", "Trastero", "Exterior inmediato"]
    out = []
    for i in range(count):
        out.append(
            poi(
                bid=f"{prefix}-{i+1:02d}",
                name=f"{label} — {unit_type} {i+1:02d}",
                coords=f"{base_x + (i % 8) * 8}x{base_y + (i // 8) * 10}",
                btype=unit_type,
                risk=risk,
                rooms=rooms,
                notes="Una unidad = un checkbox. No saltes números.",
            )
        )
    return out
