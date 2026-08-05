"""Identidad visual editorial de lujo — Colección ORBIS."""

from reportlab.lib.colors import Color, HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Paleta base editorial (evita púrpuras / cream-terracotta genéricos)
NAVY = HexColor("#0B1F33")
INK = HexColor("#1A2430")
GOLD = HexColor("#C6A75E")
GOLD_SOFT = HexColor("#E2D0A2")
STONE = HexColor("#EDE7DB")
PAPER = HexColor("#F7F4EE")
WHITE = HexColor("#FFFFFF")
TEAL = HexColor("#1F6F78")
TEAL_SOFT = HexColor("#D7E8E9")
CHARCOAL = HexColor("#2C333A")
MUTED = HexColor("#6B7280")
RULE = HexColor("#D9D2C5")

# Colores de uso en planta
USE_COLORS = {
    "habitacion": HexColor("#C9D7E3"),
    "suite": HexColor("#AFC4D8"),
    "banio": HexColor("#E4EEF4"),
    "circulacion": HexColor("#F0EDE6"),
    "publico": HexColor("#E8D9B5"),
    "fb": HexColor("#D8C4A8"),
    "servicio": HexColor("#D8CFC4"),
    "tecnico": HexColor("#CDB8B0"),
    "exterior": HexColor("#D5E6D8"),
    "piscina": HexColor("#9EC9CF"),
    "verde": HexColor("#B9CDB5"),
    "acceso": HexColor("#D0D4D8"),
    "terraza": HexColor("#E5E0D4"),
    "vacio": HexColor("#FAFAF7"),
}

USE_LABELS = {
    "habitacion": "Habitación",
    "suite": "Suite",
    "banio": "Baño",
    "circulacion": "Circulación",
    "publico": "Público / Lobby",
    "fb": "F&B / Restauración",
    "servicio": "Servicio / Staff",
    "tecnico": "Local técnico",
    "exterior": "Exterior duro",
    "piscina": "Piscina / Agua",
    "verde": "Jardín / Verde",
    "acceso": "Acceso / Vial",
    "terraza": "Terraza / Solárium",
}


def rgba(hex_color: str, alpha: float = 1.0) -> Color:
    c = HexColor(hex_color)
    return Color(c.red, c.green, c.blue, alpha)


def register_fonts() -> dict:
    """Registra fuentes del sistema con aspecto editorial."""
    candidates = {
        "serif": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
        ],
        "serif_bold": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
        ],
        "sans": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        ],
        "sans_bold": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ],
    }
    mapping = {}
    for key, paths in candidates.items():
        for path in paths:
            if os.path.exists(path):
                name = f"Orbis-{key}"
                try:
                    pdfmetrics.registerFont(TTFont(name, path))
                    mapping[key] = name
                    break
                except Exception:
                    continue
        if key not in mapping:
            mapping[key] = "Times-Roman" if "serif" in key else "Helvetica"
            if "bold" in key:
                mapping[key] = "Times-Bold" if "serif" in key else "Helvetica-Bold"
    return mapping
