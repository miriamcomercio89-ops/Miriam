"""Visual theme for the Project Zomboid B42.20 total-clear guide series."""

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor

# Page
PAGE = A4
PAGE_W, PAGE_H = A4
MARGIN_L = 16 * mm
MARGIN_R = 16 * mm
MARGIN_T = 18 * mm
MARGIN_B = 16 * mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# Palette — bright, clean, tactical atlas (avoid purple/cream/terracotta AI defaults)
INK = HexColor("#0E1A24")
INK_SOFT = HexColor("#3A4A5A")
PAPER = HexColor("#FAFBFF")
PAPER_ALT = HexColor("#F0F4F8")
TEAL = HexColor("#00B4A6")
TEAL_DARK = HexColor("#007A72")
CORAL = HexColor("#FF5A36")
SUN = HexColor("#FFB800")
SAFE = HexColor("#1FBF75")
DANGER = HexColor("#E63946")
INFO = HexColor("#2F80ED")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#D5DEE8")
CHIP_BG = HexColor("#E8F8F6")

RISK_COLORS = {
    "bajo": SAFE,
    "medio": SUN,
    "alto": CORAL,
    "extremo": DANGER,
}

FONTS = {
    "display": "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf",
    "display_bold": "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf",
    "body": "/usr/share/fonts/truetype/macos/PublicSans-Regular.ttf",
    "body_bold": "/usr/share/fonts/truetype/macos/PublicSans-Bold.ttf",
    "body_italic": "/usr/share/fonts/truetype/macos/PublicSans-Italic.ttf",
    "mono": "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf",
    "mono_bold": "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf",
}


def register_fonts():
    pdfmetrics.registerFont(TTFont("Display", FONTS["display"]))
    pdfmetrics.registerFont(TTFont("DisplayBold", FONTS["display_bold"]))
    pdfmetrics.registerFont(TTFont("Body", FONTS["body"]))
    pdfmetrics.registerFont(TTFont("BodyBold", FONTS["body_bold"]))
    pdfmetrics.registerFont(TTFont("BodyItalic", FONTS["body_italic"]))
    pdfmetrics.registerFont(TTFont("Mono", FONTS["mono"]))
    pdfmetrics.registerFont(TTFont("MonoBold", FONTS["mono_bold"]))
