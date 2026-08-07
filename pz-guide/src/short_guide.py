#!/usr/bin/env python3
"""Guía corta B42.20: 1 PDF por zona (pueblo/POI), extras de loot/acceso/tipo."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output"
MAPS = ROOT / "assets" / "maps" / "pdf"

INK = HexColor("#0E1A24")
TEAL = HexColor("#00B4A6")
CORAL = HexColor("#FF5A36")
SOFT = HexColor("#3A4A5A")
PAPER = HexColor("#FAFBFF")
LINE = HexColor("#D5DEE8")
WARN = HexColor("#C23B22")
LINK = HexColor("#0B5FFF")
SECT = HexColor("#0A6B63")

PAGE_W, PAGE_H = A4
ML, MR, MT, MB = 14 * mm, 14 * mm, 14 * mm, 12 * mm
CW = PAGE_W - ML - MR


def fonts():
    pdfmetrics.registerFont(TTFont("DisplayBold", "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/macos/PublicSans-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("BodyBold", "/usr/share/fonts/truetype/macos/PublicSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Mono", "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"))


def map_url(coords: str) -> str:
    c = coords.lower().replace(" ", "").split("/")[0]
    if "x" in c:
        return f"https://map.projectzomboid.com/#{c}"
    return "https://map.projectzomboid.com/"


def houses(street: str, count: int, anchor: str, axis: str = "x", step: int = 10,
           kind: str = "casa", floors: str = "1 planta · sótano posible"):
    try:
        x, y = map(int, anchor.lower().split("x"))
    except Exception:
        x = y = 0
    out = []
    for i in range(1, count + 1):
        coords = f"{x + (i - 1) * step}x{y}" if axis == "x" else f"{x}x{y + (i - 1) * step}"
        num = 100 + (i * 2 - (1 if i % 2 else 0))
        out.append(b(f"{street} nº {num} (casa {i}/{count})", coords, "", kind, floors))
    return out


def b(name, coords, important="", kind="casa", floors="1 planta", alarm=""):
    """Edificio: nombre, coords, loot, tipo, pisos, alarma."""
    return (name, coords, important, kind, floors, alarm)


def sec(title: str):
    return ("§", "", "", title, "", "")


def zone(filename, code, title, mapf, acceso, orden, note, buildings, *,
         ciudad="", map_item="", vehiculos="", base="", croquis=""):
    return {
        "filename": filename,
        "code": code,
        "title": title,
        "map": mapf,
        "acceso": acceso,
        "orden": orden,
        "note": note,
        "buildings": buildings,
        "ciudad": ciudad or title.split("·")[0].strip(),
        "map_item": map_item,
        "vehiculos": vehiculos,
        "base": base,
        "croquis": croquis,
    }


class ShortPDF:
    def __init__(self, path: Path, code: str, title: str, map_file: str | None,
                 acceso: str = "", orden: str = "", note: str = "",
                 map_item: str = "", vehiculos: str = "", base: str = "", croquis: str = ""):
        fonts()
        self.path = path
        self.code = code
        self.title = title
        self.map_file = map_file
        self.acceso = acceso
        self.orden = orden
        self.note = note
        self.map_item = map_item
        self.vehiculos = vehiculos
        self.base = base
        self.croquis = croquis
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.page = 0
        self.n = 0
        self._chrome()
        self._header()

    def _chrome(self):
        self.page += 1
        c = self.c
        c.setFillColor(PAPER)
        c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.rect(0, PAGE_H - 5 * mm, PAGE_W, 5 * mm, fill=1, stroke=0)
        c.setFillColor(CORAL)
        c.rect(0, PAGE_H - 5 * mm, 20 * mm, 5 * mm, fill=1, stroke=0)
        c.setFillColor(SOFT)
        c.setFont("Mono", 7)
        c.drawString(ML, 5 * mm, f"{self.code} · B42.20 · PZwiki")
        c.drawRightString(PAGE_W - MR, 5 * mm, f"{self.page:02d}")
        self.y = PAGE_H - MT

    def new_page(self):
        self.c.showPage()
        self._chrome()

    def ensure(self, h):
        if self.y - h < MB + 4 * mm:
            self.new_page()

    def _text(self, text, font="Body", size=8.5, color=SOFT, gap=3.8 * mm):
        c = self.c
        c.setFillColor(color)
        c.setFont(font, size)
        for line in self._wrap(text, 92):
            self.ensure(gap + 0.5 * mm)
            c.drawString(ML, self.y, line)
            self.y -= gap

    def _header(self):
        c = self.c
        c.setFillColor(INK)
        c.setFont("Mono", 8)
        c.drawString(ML, self.y, self.code)
        self.y -= 5.5 * mm
        c.setFont("DisplayBold", 14)
        for line in self._wrap(self.title, 40):
            self.ensure(7 * mm)
            c.drawString(ML, self.y, line)
            self.y -= 6 * mm
        if self.acceso:
            self._text(f"Acceso: {self.acceso}", "BodyBold", 8.5, INK, 4 * mm)
        if self.orden:
            self._text(f"Orden en zona: {self.orden}", "Body", 8, SOFT, 3.6 * mm)
        if self.map_item:
            self._text(f"Map item: {self.map_item}", "BodyBold", 8, TEAL, 3.6 * mm)
        if self.vehiculos:
            self._text(f"Vehículos / parking: {self.vehiculos}", "Body", 8, SOFT, 3.6 * mm)
        if self.base:
            self._text(f"Base candidata: {self.base}", "BodyBold", 8, CORAL, 3.6 * mm)
        if self.croquis:
            self._draw_croquis(self.croquis)
        if self.note:
            self._text(self.note, "Body", 8, SOFT, 3.6 * mm)
        self.y -= 1 * mm
        if self.map_file:
            self._map(self.map_file)

    def _draw_croquis(self, text: str):
        """Mini-croquis de recorrido (flechas / ASCII corto)."""
        self.ensure(14 * mm)
        c = self.c
        c.setStrokeColor(LINE)
        c.setFillColor(HexColor("#EEF6F5"))
        h = 11 * mm
        c.roundRect(ML, self.y - h, CW, h, 2 * mm, fill=1, stroke=1)
        c.setFillColor(SECT)
        c.setFont("BodyBold", 7.5)
        c.drawString(ML + 2 * mm, self.y - 3.5 * mm, "Croquis de ruta")
        c.setFillColor(INK)
        c.setFont("Mono", 7.5)
        # one or two lines
        lines = self._wrap(text, 88)
        yy = self.y - 7 * mm
        for line in lines[:2]:
            c.drawString(ML + 2 * mm, yy, line)
            yy -= 3.2 * mm
        self.y -= h + 2.5 * mm

    def _map(self, filename: str):
        stem = Path(filename).stem
        candidates = [
            MAPS / filename,
            MAPS / f"{stem}.jpg",
            MAPS / f"{stem}.png",
            ROOT / "assets" / "maps" / filename,
        ]
        path = next((c for c in candidates if c.exists()), None)
        if path is None:
            return
        self.ensure(72 * mm)
        img = ImageReader(str(path))
        iw, ih = img.getSize()
        scale = min(CW / iw, 68 * mm / ih)
        w, h = iw * scale, ih * scale
        c = self.c
        c.setStrokeColor(LINE)
        c.rect(ML, self.y - h - 1 * mm, w + 2 * mm, h + 2 * mm, fill=0, stroke=1)
        c.drawImage(img, ML + 1 * mm, self.y - h, width=w, height=h, preserveAspectRatio=True, mask="auto")
        self.y -= h + 2.5 * mm
        c.setFillColor(SOFT)
        c.setFont("Mono", 6.5)
        c.drawString(ML, self.y, f"Mapa wiki: {path.name}")
        self.y -= 4.5 * mm

    def section(self, title: str):
        self.ensure(8 * mm)
        c = self.c
        self.y -= 1.5 * mm
        c.setFillColor(SECT)
        c.rect(ML, self.y - 1 * mm, CW, 0.6 * mm, fill=1, stroke=0)
        self.y -= 4.5 * mm
        c.setFont("BodyBold", 9)
        c.drawString(ML, self.y, title.upper())
        self.y -= 5 * mm

    def building(self, name: str, coords: str = "", important: str = "",
                 kind: str = "casa", floors: str = "1 planta", alarm: str = ""):
        if name == "§" or kind.startswith("§"):
            self.section(floors or kind.replace("§", "").strip() or coords)
            return
        self.n += 1
        meta = " · ".join(p for p in [kind, floors] if p)
        if alarm:
            meta = f"{meta} · ALARMA" if meta else "ALARMA"
        need = 7 * mm + (4 * mm if important else 0) + (3 * mm if alarm else 0)
        self.ensure(need)
        c = self.c
        c.setFillColor(SOFT)
        c.setFont("Mono", 6.5)
        c.drawString(ML, self.y, f"[{meta}]"[:70])
        self.y -= 3.2 * mm
        c.setFillColor(INK)
        c.setFont("Body", 9)
        c.drawString(ML, self.y, f"{self.n}. {name}"[:78])
        if coords:
            c.setFillColor(LINK)
            c.setFont("Mono", 7)
            url = map_url(coords)
            tw = c.stringWidth(coords, "Mono", 7)
            x = PAGE_W - MR - tw
            c.drawString(x, self.y, coords)
            c.linkURL(url, (x - 1, self.y - 1.5 * mm, x + tw + 1, self.y + 3 * mm), relative=0)
        self.y -= 3.6 * mm
        if alarm:
            c.setFillColor(WARN)
            c.setFont("Body", 7.5)
            c.drawString(ML, self.y, f"Alarma típica: {alarm}")
            self.y -= 3.2 * mm
        if important:
            c.setFillColor(WARN)
            c.setFont("BodyBold", 8)
            for part in self._wrap(f"→ RECOGER: {important}", 95):
                self.ensure(3.6 * mm)
                c.drawString(ML, self.y, part)
                self.y -= 3.4 * mm
        self.y -= 0.8 * mm

    def save(self):
        self.c.save()

    def _wrap(self, text: str, n: int) -> list[str]:
        words = text.split()
        lines, cur = [], ""
        for w in words:
            t = (cur + " " + w).strip()
            if len(t) <= n:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines or [text]


# ─── Zonas (1 PDF = 1 zona / pueblo / POI nombrado) ─────────────────────────


def riverside():
    m, mt = "Riversidemap.jpg", "riverside_tourist.jpg"
    bl = [
        sec("Suburbios sur-centro (spawn)"),
        *houses("Pine Court", 5, "6300x5600", "x"),
        *houses("Mary Court", 5, "6320x5620", "x"),
        *houses("Marvin Place", 5, "6280x5580", "y"),
        *houses("Maria Place", 4, "6260x5610", "x"),
        *houses("Grove St.", 3, "6400x5550", "x"),
        *houses("Sweet St.", 3, "6380x5580", "x"),
        *houses("Sycamore Ln.", 3, "6420x5600", "y"),
        sec("Suburbios oeste"),
        *houses("Walnut St.", 5, "6150x5550", "x"),
        *houses("Granite St.", 4, "6120x5580", "x"),
        *houses("Cemetary Dr.", 4, "5900x5350", "x"),
        *houses("Ohio St.", 4, "6000x5500", "y"),
        sec("Frontera este (fuera del gated)"),
        *houses("Kennedy St.", 4, "6550x5450", "x"),
        *houses("Lincoln St.", 4, "6580x5480", "x"),
        *houses("Kavanagh St.", 3, "6620x5500", "y"),
        sec("Extensión sur / rural cercana"),
        *houses("Dogwood Rd.", 2, "5900x5700", "y"),
        *houses("Fern Rd.", 2, "5850x5750", "y"),
        *houses("Summer Shade Rd.", 2, "6480x5750", "x"),
        *houses("Easter Ln.", 2, "6500x5700", "y"),
        *houses("Sandy Rd.", 2, "6200x5850", "y"),
        *houses("Sawyer Ln.", 2, "6250x5900", "y"),
        *houses("Nixon Ln.", 2, "6350x5800", "x"),
        sec("Comunidad cerrada (34 casas)"),
    ]
    for i in range(1, 13):
        imp = "garaje: tools / gas / posible vehículo"
        if i == 8:
            imp += " · flier July 4th Block Party"
        bl.append(b(f"Kelly Dr. — casa {i}/12", f"{6760+(i-1)*12}x5320", imp, "mansión", "2 plantas · sótano posible"))
    for i in range(1, 9):
        bl.append(b(f"Mansión anillo norte {i}/8", f"{6700+(i-1)*14}x5280",
                    "garaje: tools / gas / posible vehículo", "mansión", "2 plantas · sótano posible"))
    for i in range(1, 9):
        bl.append(b(f"Mansión anillo sur {i}/8", f"{6700+(i-1)*14}x5480",
                    "garaje: tools / gas / posible vehículo", "mansión", "2 plantas · sótano posible"))
    for i in range(1, 7):
        imp = "garaje: tools / gas / posible vehículo"
        if i == 3:
            imp += " · candidata BASE"
        bl.append(b(f"Mansión centro {i}/6", f"{6760+(i-1)*12}x5360", imp, "mansión", "2 plantas · sótano posible"))

    bl += [
        sec("Rock Ridge / orilla oeste"),
        b("Fossoil — 160 Rock Ridge Rd.", "6078x5305",
          "gas + mapa Riverside · neveras tienda", "gasolinera", "1 planta"),
        b("Spiffo's (junto Fossoil)", "6128x5309", "comida · neveras", "tienda", "1 planta"),
        b("Police Station — 210 Rock Ridge Rd.", "6081x5261", "armas / ammo", "policía", "2 plantas"),
        b("Morris' Bait Shop", "5916x5243", "equipo de pesca", "tienda", "1 planta"),
        b("Burgers", "5961x5260", "comida · neveras", "tienda", "1 planta"),
        b("Bar (Riverside)", "5964x5416", "alcohol", "tienda", "1 planta"),
        b("Food market (west)", "5970x5390", "comida · neveras grandes", "tienda", "1 planta"),
        b("General store (west)", "5970x5356", "suministros", "tienda", "1 planta"),
        b("Laundromat (west)", "5952x5388", "", "tienda", "1 planta"),
        sec("Rogers Ave / strip central"),
        b("Nails & Nuts Tool Store — 15 Rogers Ave.", "6359x5327",
          "sledge / axe / tools / seeds / revistas generator", "tienda", "1 planta"),
        b("Slimtax Accounting", "6359x5318", "", "oficina", "1 planta"),
        b("Spitfire Fashion", "6360x5311", "telas / aguja / hilo / ropa", "tienda", "1 planta"),
        b("Clothing store", "6358x5298", "telas / ropa", "tienda", "1 planta"),
        b("Grocery store", "6343x5296", "comida · neveras grandes", "tienda", "1 planta"),
        b("Seat Yourself Furniture", "6241x5267", "materiales carpintería", "tienda", "1 planta"),
        b("Hugo Plush", "6257x5268", "", "tienda", "1 planta"),
        b("Time 4 Sport", "6259x5266", "armas melee deportivas", "tienda", "1 planta"),
        b("Nourish Food Mart", "6265x5264", "comida · neveras", "tienda", "1 planta"),
        b("U.S. Mail Service", "6315x5265", "posible base temporal", "oficina", "1 planta"),
        b("Riverside Suites (hotel)", "6365x5255", "bolsas / ropa por habitación", "hotel", "2+ plantas"),
        b("Go Flash", "6191x5346", "", "tienda", "1 planta"),
        b("Hit Vids!", "6208x5344", "VHS", "tienda", "1 planta"),
        b("Liquorty-Split", "6189x5368", "alcohol", "tienda", "1 planta"),
        b("Sweet Pea Restaurant", "6192x5341", "comida · neveras", "tienda", "1 planta"),
        b("Back To The Nurture Chiropractic", "6190x5355", "", "clínica", "1 planta"),
        b("Pile o' Crepe", "6396x5303", "comida", "tienda", "1 planta"),
        sec("Strip este · loot crítico"),
        b("Enigma Books", "6429x5265", "skillbooks", "librería", "1 planta"),
        b("Palm Travel", "6421x5265", "", "oficina", "1 planta"),
        b("Hair O Genesis", "6411x5266", "", "tienda", "1 planta"),
        b("Saucy", "6397x5266", "", "tienda", "1 planta"),
        b("Jimmy's", "6445x5265", "comida", "tienda", "1 planta"),
        b("Pharmahug", "6468x5266", "meds / antibiotics", "farmacia", "1 planta", "cristales / alarma"),
        b("Sheba Jewellers", "6473x5266", "joyería", "tienda", "1 planta", "alarma joyería"),
        b("Mama McFudgington's", "6483x5266", "comida", "tienda", "1 planta"),
        b("Coin Op Laundromat", "6413x5333", "", "tienda", "1 planta"),
        b("Strip mall / toy store block", "6450x5298", "", "tienda", "1 planta"),
        b("Knox Bank", "6504x5301", "", "banco", "1–2 plantas", "alarma banco"),
        b("Lola Limon", "6505x5266", "telas / ropa", "tienda", "1 planta"),
        b("GigaMart", "6515x5350", "comida masiva · neveras · posible generator zona", "almacén", "1 planta"),
        b("Church", "6556x5308", "", "iglesia", "1 planta"),
        b("Dotty 4 Donuts", "6491x5223", "comida", "tienda", "1 planta"),
        b("Churns-R-Us", "6472x5217", "", "tienda", "1 planta"),
        b("Riparian Entertainment", "6380x5206", "alcohol", "tienda", "1 planta"),
        b("Riverwood Boat Club", "6560x5215", "", "oficina", "1 planta"),
        sec("Escuela / cementerio / desguace"),
        b("School — edificio principal", "6443x5441", "", "escuela", "2 plantas"),
        b("School library", "6430x5450", "skillbooks", "librería", "1 planta"),
        b("School clinic", "6450x5450", "meds menores", "clínica", "1 planta"),
        b("Cemetery", "5710x5334", "", "cementerio", "exterior"),
        b("Wrecking yard — office", "5839x5391", "", "desguace", "1 planta"),
        b("Wrecking yard — vehículos", "5839x5391", "coches / scrap / propane / parts", "parking", "exterior"),
        sec("Industrial Olin Rd. (KY-163)"),
        b("Gas N More", "5429x5870", "gas · neveras", "gasolinera", "1 planta"),
        b("Diner (SO)", "5425x5907", "comida · neveras", "tienda", "1 planta"),
        b("Al's Auto Shop", "5436x5950", "parts / mechanics", "garaje", "1 planta"),
        b("Lectromax Manufacturing", "5568x5914",
          "tools / sledge / industrial / generator posible", "fábrica", "1–2 plantas"),
        b("U-Store It", "5540x6055", "units: tools / possible generator", "almacén", "1 planta"),
        b("Olin Rd. nº 739", "5681x5747", "", "casa", "1 planta · sótano posible"),
        b("Olin Rd. nº 740", "5579x5929", "", "casa", "1 planta · sótano posible"),
        b("Long Needle Rd. zona nº 6650", "5440x5967", "", "casa", "1 planta"),
        sec("West Maple Country Club"),
        b("Country Club — parking", "5750x6400", "", "parking", "exterior"),
        b("West Maple Country Club — main hall", "5772x6416", "loot interior / rich zombies", "club", "2 plantas"),
        b("Country Club — gym", "5780x6440", "", "club", "1 planta"),
        b("Country Club — ballroom", "5760x6460", "", "club", "1 planta"),
        b("Country Club — lockers", "5740x6460", "", "club", "1 planta"),
        b("Country Club — bar", "5770x6475", "alcohol", "club", "1 planta"),
        b("Country Club — pro shop / annex", "5720x6420", "tools menores", "tienda", "1 planta"),
        b("Greens / campo", "5800x6550", "", "exterior", "exterior"),
    ]
    return [zone(
        "001_Riverside.pdf", "RV",
        "Riverside · pueblo completo (suburbios, strip, gated, industrial, country club)",
        mt, "Spawn suburbano sur-centro. Limpia casas → Rock Ridge → strip → gated (un solo gate) → industrial KY-163 → Country Club.",
        "Suburbios 70 casas → Rock Ridge/PD/Fossoil → strip Rogers/este → escuela → desguace → Olin industrial → gated 34 → Country Club.",
        "70 casas fuera del gated + 34 dentro (PZwiki). No abras todos los gates del gated.",
        bl, ciudad="Riverside",
        map_item="Consigue el mapa Riverside en Fossoil 160 Rock Ridge (gasolineras / gloveboxes / cadáveres). Léelo antes de salir del pueblo.",
        vehiculos="Parking denso en strip y GigaMart; wrecking yard oeste (~5839x5391) para coches/parts; gated = garajes con vehículos posibles.",
        base="Mansiones del gated (centro) o U.S. Mail / hotel como temporal; Country Club si ya controlas el sur.",
        croquis="SPAWN → courts/suburbios → Rock Ridge (Fossoil/PD) → strip E → escuela → [gate único] gated → Olin/KY-163 → Country Club",
    )]


def rural_pois():
    m = "Riversidemap.jpg"
    z = []
    trailers = [b(f"Mobile home {i:02d}/36", f"{5300+(i%6)*12}x{6000+(i//6)*14}", "",
                  "trailer", "1 planta") for i in range(1, 37)]
    z.append(zone(
        "002_Scenic_Grove_Mobile_Home_Park.pdf", "ScenicGrove",
        "Scenic Grove Mobile Home Park · sur de Riverside (oeste de Long Needle)",
        m, "Esquina KY-163 y Long Needle Road. Al oeste de Long Needle (PZwiki).",
        "Office → filas de trailers → casa 1 planta → shed. Este de Long Needle = U-Store/factory (ya en Riverside).",
        "Wiki: 36 mobile homes + 1 casa + 1 shed.",
        [sec("Entrada y trailers"),
         b("Office / entrada del parque", "5350x6000", "", "oficina", "1 planta")]
        + trailers
        + [sec("Casa y shed"),
           b("Casa 1 planta del parque", "5380x6100", "", "casa", "1 planta · sótano posible"),
           b("Shed del parque", "5390x6110", "tools posibles", "garaje", "1 planta")],
        ciudad="Rural · Scenic Grove",
        map_item="Sin map item propio. Usa mapa Riverside + exploración.",
        vehiculos="Parking del office; coches entre trailers.",
        base="Office o casa del parque si el perímetro está limpio.",
        croquis="KY-163/Long Needle → OFFICE → filas O→E → casa → shed",
    ))
    z.append(zone(
        "003_Rural_Long_Branch_Rd.pdf", "LongBranch",
        "Zona rural · Long Branch Rd. (oeste de Riverside)",
        m, "Desde Riverside hacia el oeste; Long Branch Rd. nº 3 @ 5174x5525.",
        "Este → oeste, casa a casa.", "",
        [b("Long Branch Rd. nº 3", "5174x5525", "", "casa", "1 planta · sótano posible")]
        + houses("Long Branch Rd.", 4, "5200x5525", "x", 30),
        ciudad="Rural oeste",
        map_item="Sin map item. Corredor hacia Brandenburg.",
        vehiculos="Roadside farms: pickups posibles en entradas.",
        base="Casa aislada con pozo/shed si hay.",
        croquis="Riverside O → Long Branch E→O → sigue a Wilson / Brandenburg",
    ))
    z.append(zone(
        "004_Rural_Wilson_Rd.pdf", "WilsonRd",
        "Zona rural · Wilson Rd. (corredor oeste hacia Brandenburg)",
        m, "Más al oeste; Wilson Rd. nº 575 @ 4214x6264.",
        "Este → oeste.", "",
        [b("Wilson Rd. nº 575", "4214x6264", "", "casa", "1 planta · sótano posible")]
        + houses("Wilson Rd.", 3, "4300x6264", "x", 40),
        ciudad="Rural oeste",
        map_item="Sin map item.",
        vehiculos="Pocos; prioriza granjas con garaje.",
        base="Solo si necesitas salto hacia Brandenburg.",
        croquis="Long Branch → Wilson E→O → Brandenburg / Abandoned town",
    ))
    z.append(zone(
        "005_Rural_Radio_Relay.pdf", "RadioRelay",
        "Zona rural · estación de radio relay (oeste Riverside)",
        m, "Desde corredor oeste hacia 4843x6280 (PZwiki).",
        "Perímetro → edificio control → torre.", "",
        [b("Radio relay station", "4843x6280", "electronics / generator room", "estación", "1–2 plantas")],
        ciudad="Rural oeste",
        map_item="Sin map item.",
        vehiculos="Parking técnico pequeño.",
        base="Generator room útil; no ideal como hogar largo.",
        croquis="Carretera oeste → perímetro → CONTROL → TORRE",
    ))
    z.append(zone(
        "006_Rural_Abandoned_Town_Tanglewood.pdf", "AbandonedTown",
        "Zona rural · Abandoned town / Tanglewood (oeste Riverside)",
        m, "Coords wiki ~4048x6154. Poco zombie, poco loot.",
        "Factory C.G.E. → strip → casa habitada → resto de estructuras.", "",
        [
            b("Abandoned town — C.G.E. Corp / factory", "4048x6154", "industrial ligero / tools", "fábrica", "1–2 plantas"),
            b("Abandoned town — strip mall", "4048x6154", "posible safehouse", "tienda", "1 planta"),
            b("Abandoned town — casa en uso", "4048x6154", "", "casa", "1 planta"),
        ] + [b(f"Estructura abandonada {i}/8", f"{4000+(i*20)}x6150", "", "ruina", "1 planta") for i in range(1, 9)],
        ciudad="Rural oeste",
        map_item="Sin map item.",
        vehiculos="Pocos; scrap en factory.",
        base="Strip mall abandonado = posible safehouse tranquila.",
        croquis="Wilson/oeste → FACTORY → strip → casas",
    ))
    z.append(zone(
        "007_Rural_Farms_Oeste_Riverside.pdf", "FarmsOeste",
        "Zona rural · granjas entre Riverside y Brandenburg",
        m, "Carreteras rurales al oeste de Riverside / hacia Brandenburg.",
        "Una granja completa (casa+shed+campos) antes de la siguiente.", "",
        [b(f"Granja roadside oeste {i}/10", f"{5000-(i*80)}x{5800+(i%3)*40}",
           "tools / seeds · posible generator · neveras", "granja", "casa 1–2 · granero")
         for i in range(1, 11)],
        ciudad="Rural oeste",
        map_item="Sin map item. Brandenburg map al llegar a Boyd Rd. Fossoil.",
        vehiculos="Tractores/pickups en granjas; gas en latas.",
        base="Granja con pozo + granero + cerca = excelente base avanzada.",
        croquis="Riverside O → granja₁ → … → granja₁₀ → Brandenburg",
    ))
    z.append(zone(
        "008_Rural_Doe_Valley_Cabanas.pdf", "DoeValley",
        "Zona rural · Doe Valley · cabañas y POIs de bosque",
        "Fallas_Lake.jpg", "Entre Brandenburg, Riverside, Echo Creek y Fallas Lake.",
        "Camino forestal → cabaña → perímetro 20 tiles.",
        "Doe Valley / Fallas Lake: sin map item propio (PZwiki Map item).",
        [b(f"Cabaña / POI Doe Valley {i}/12", f"{5000+(i%4)*60}x{7500+(i//4)*80}",
           "", "cabaña", "1 planta") for i in range(1, 13)],
        ciudad="Rural · Doe Valley",
        map_item="Sin map item (Doe Valley / Fallas Lake).",
        vehiculos="Muy pocos; a pie o 4x4.",
        base="Cabaña aislada con lago/pozo cercano.",
        croquis="Bosque → cabaña → perímetro → siguiente sendero",
    ))
    return z


def brandenburg():
    bb = "BrandenburgMap.jpg"
    bl = [
        sec("Centro y policía"),
        b("Police Station Brandenburg", "2043x5978", "armas / ammo", "policía", "2 plantas"),
        b("Edificios municipales / centro", "2314x6253", "", "oficina", "1–2 plantas"),
        *houses("Centro Brandenburg", 8, "2250x6200", "x", 16),
        sec("Fossoil y storage"),
        b("Fossoil — 582 Boyd Rd.", "2059x6425", "gas + mapa Brandenburg · neveras", "gasolinera", "1 planta"),
        b("U-Store It (junto Fossoil, wiki)", "2059x6425", "storage / possible generator", "almacén", "1 planta"),
        sec("Pondview Shopping Center"),
        b("Nails & Nuts — Pondview Shopping Center", "1943x6361", "tools / sledge", "tienda", "1 planta"),
        b("Awl Work (junto, wiki)", "1943x6361", "tools", "tienda", "1 planta"),
        b("Sew Play (junto, wiki)", "1943x6361", "telas / aguja / hilo", "tienda", "1 planta"),
        sec("Residencial norte (orilla Ohio)"),
        *houses("Residencial norte Brandenburg", 14, "2100x6050", "x", 14),
        sec("Zona tornado (sureste)"),
    ] + [b(f"Estructura zona tornado {i}/20", f"{2400+(i%5)*18}x{6550+(i//5)*20}",
           "", "ruina", "1 planta") for i in range(1, 21)]
    return [zone(
        "009_Brandenburg.pdf", "BR",
        "Brandenburg · pueblo completo (centro, Fossoil, Pondview, residencial, tornado)",
        bb, "Desde corredor oeste (~2314x6253).",
        "PD/centro → Fossoil Boyd → Pondview → residencial norte → zona tornado SE.",
        "", bl, ciudad="Brandenburg",
        map_item="Mapa Brandenburg en Fossoil 582 Boyd Rd. (también gloveboxes/cadáveres).",
        vehiculos="Parking Pondview y Fossoil; coches en residencial norte.",
        base="Cerca del río norte o U-Store si limpio; evita zona tornado como hogar.",
        croquis="Entrada → PD/centro → Boyd Fossoil → Pondview → norte río → SE tornado",
    )]


def fallas_lake():
    fl = "Fallas_Lake.jpg"
    bl = [
        sec("Pueblo"),
        b("Police Station (Fallas Lake)", "7252x8378", "armas / ammo", "policía", "2 plantas"),
        b("General store (Fallas Lake)", "7293x8254", "suministros · neveras", "tienda", "1 planta"),
        b("Restaurant (Fallas Lake)", "7293x8296", "comida · neveras", "tienda", "1 planta"),
        b("Medical clinic (Fallas Lake)", "7295x8388", "meds", "clínica", "1 planta"),
        b("Fallas Lake Church", "7386x8352", "", "iglesia", "1 planta"),
        b("Assembly hall (Fallas Lake)", "7414x8385", "", "oficina", "1 planta"),
        *houses("Residencial Fallas Lake", 12, "7300x8200", "x", 14),
        sec("Orilla y cabañas"),
    ] + [b(f"Cabaña del lago {i}/10", f"{7450+(i%5)*14}x{8450+(i//5)*18}", "", "cabaña", "1 planta")
         for i in range(1, 11)]
    return [zone(
        "010_Fallas_Lake.pdf", "FL",
        "Fallas Lake · pueblo, orilla del lago y cabañas",
        fl, "Desde Old Mill Rd. (Muldraugh) o sur desde corredor Riverside. Centro ~7348x8371.",
        "PD → tiendas/clínica/iglesia → residencial → orilla/cabañas.",
        "Sin map item propio (PZwiki).", bl, ciudad="Fallas Lake",
        map_item="No hay map item de Fallas Lake / Doe Valley. Explora a pie.",
        vehiculos="Pocos en pueblo; parking pequeño en tiendas.",
        base="Casa junto al lago o clinic limpia como hub sur.",
        croquis="Entrada → PD → comercios → casas → ORILLA → cabañas",
    )]


def echo_creek():
    m = "Riversidemap.jpg"
    bl = [
        sec("Pueblo Echo Creek"),
        *houses("Residencial Echo Creek", 16, "4150x11020", "x", 14),
        b("Gas / general store Echo Creek", "4235x11069", "gas / supplies · neveras", "gasolinera", "1 planta"),
        b("Farm supply / taller", "4280x11100", "tools / farming / seeds", "tienda", "1 planta"),
        b("Diner / café", "4260x11080", "comida · neveras", "tienda", "1 planta"),
        b("Church / community", "4220x11040", "", "iglesia", "1 planta"),
        b("Small clinic / aid", "4245x11055", "meds menores", "clínica", "1 planta"),
        sec("Chicken farm y granjas este"),
        b("Chicken farm este", "4500x11050", "comida / animals B42", "granja", "granero + casas"),
    ] + [b(f"Granja Echo Creek {i}/8", f"{4400+(i*25)}x11200",
           "tools / seeds · posible generator", "granja", "casa + granero") for i in range(1, 9)]
    return [zone(
        "011_Echo_Creek.pdf", "EC",
        "Echo Creek · pueblo rural B42, chicken farm y granjas",
        m, "Desde KY-60 / corredor sur-oeste. Centro ~4235x11069.",
        "Residencial/pueblo → gas/farm supply → chicken farm este → granjas.",
        "Sin map item propio (PZwiki).", bl, ciudad="Echo Creek",
        map_item="Echo Creek no tiene map item. Usa mapas vecinos (Ekron/Irvington) si los tienes.",
        vehiculos="Pickups en granjas; gas en general store.",
        base="Granja con granero y cerca, o farm supply limpio.",
        croquis="KY-60 → pueblo → GAS/farm → chicken farm → granjas E",
    )]


def ekron():
    ek = "EkronMap.jpg"
    bl = [
        sec("Plaza este / Pharmahug"),
        b("Pharmahug Ekron (plaza este de las vías)", "402x9870", "meds / antibiotics",
          "farmacia", "1 planta", "cristales / alarma"),
        *houses("Residencial Ekron este", 10, "1100x9800", "x", 14),
        sec("Oeste del tren (usa cruce norte)"),
        *houses("Residencial Ekron oeste", 10, "800x9800", "x", 14),
        b("Ekron Community College (wiki stash)", "1020x9838", "libros / skillbooks posibles", "escuela", "2 plantas"),
        b("Strip mall Ekron", "950x9850", "suministros · neveras", "tienda", "1 planta"),
        sec("Industrial / Fossoil"),
        b("Fossoil — 104 Haysville Rd.", "649x9923", "gas + mapa Ekron · neveras", "gasolinera", "1 planta"),
        b("Steelworks / planta principal", "1020x9900", "metalworking / tools / industrial", "fábrica", "1–2 plantas"),
        b("Nave industrial secundaria", "950x9950", "industrial / possible generator", "fábrica", "1 planta"),
        b("Rail / storage yard", "1100x9920", "warehouse tools", "almacén", "exterior"),
        b("Chicken farm (ruta sur, wiki stash)", "1100x10100", "animals / comida", "granja", "granero"),
        b("Private retreat / fenced lake (wiki)", "700x10150", "pozos / barn", "granja", "casa + barn"),
    ]
    return [zone(
        "012_Ekron.pdf", "EK",
        "Ekron · pueblo oeste extremo (Pharmahug, residencial, Fossoil, steelworks)",
        ek, "Desde Echo Creek al oeste. Tren roto corta main street: usa cruce norte.",
        "Este (Pharmahug) → residencial este → cruce norte → oeste → Fossoil/steelworks → farms sur.",
        "Map item: Ekron. Hay annotated maps (EkronStashMap1–8).", bl, ciudad="Ekron",
        map_item="Mapa Ekron en Fossoil 104 Haysville Rd. / gloveboxes / cadáveres. Recógelo antes de ir a Irvington.",
        vehiculos="Parking steelworks y Fossoil; yard del rail.",
        base="Casa oeste lejos del steelworks, o private retreat si lo despejas.",
        croquis="Echo Creek → E Pharmahug → cruce N → O residencial → Fossoil/steel → farms",
    )]


def irvington():
    ir = "IrvingtonMap.jpg"
    bl = [
        sec("Pueblo sobre KY-79"),
        b("Police Irvington", "2485x13940", "armas / ammo", "policía", "2 plantas"),
        b("Pharmahug Irvington", "2475x14478", "meds", "farmacia", "1 planta", "cristales / alarma"),
        b("Fossoil Irvington", "2525x14484", "gas + mapa Irvington · neveras", "gasolinera", "1 planta"),
        b("Ol' Rodney's Countrytime Steakhouse (wiki)", "2600x14050", "comida · neveras", "tienda", "1 planta"),
        b("Greene's / Mr. Sunshine Diner (wiki)", "2580x14080", "comida", "tienda", "1 planta"),
        b("Laundromat (SO, wiki)", "2450x14120", "", "tienda", "1 planta"),
        b("Townhouses / plaza KY-79", "2550x13850", "", "casa", "2 plantas"),
        b("School Irvington", "2650x13900", "libros", "escuela", "2 plantas"),
        *houses("Residencial Irvington", 24, "2600x13750", "x", 14),
        sec("Irvington Speedway (norte)"),
        b("Irvington Speedway — complex", "2720x13200", "tools / parts", "pista", "1 planta"),
        b("Speedway — parking", "2720x13150", "coches densos", "parking", "exterior"),
        b("Speedway — pits / garajes", "2750x13250", "parts / mechanics", "garaje", "1 planta"),
        b("Speedway — tribunas / concessions", "2700x13280", "comida · neveras", "tienda", "1 planta"),
        sec("Factory farms este (livestock)"),
    ] + [b(f"Factory farm este {i}/8", f"{3200+(i*30)}x13800",
           "farming / animals · tools", "granja", "naves + casa") for i in range(1, 9)]
    return [zone(
        "013_Irvington.pdf", "IR",
        "Irvington · pueblo KY-79, Speedway y factory farms del este",
        ir, "Sur-oeste del mapa por KY-79. Centro ~2729x13797.",
        "PD/Pharmahug/Fossoil → residencial → Speedway norte → factory farms este.",
        "Map item: Irvington. Annotated maps IrvingtonStashMap1–10 (incl. Speedway).",
        bl, ciudad="Irvington",
        map_item="Mapa Irvington en Fossoil / gloveboxes / cadáveres. Hay 10 annotated maps.",
        vehiculos="Speedway parking = mejor zona de coches del sur; pits para parts.",
        base="Casa residencial lejos del Speedway, o farm este con naves.",
        croquis="KY-79 → PD/Fossoil/Pharma → casas → N Speedway → E factory farms",
    )]


def rosewood_block():
    rw, rwi = "Rosewoodmap.jpg", "Rosewood.jpg"
    z = []
    bl = [
        sec("North Main St. comercio"),
        b("Spiffo's", "8069x11343", "comida · neveras", "tienda", "1 planta"),
        b("Pizza Whirled", "8074x11308", "comida", "tienda", "1 planta"),
        b("Thunder Gas", "8153x11263", "gas · neveras", "gasolinera", "1 planta"),
        b("Grocery store", "8142x11386", "comida · neveras grandes", "tienda", "1 planta"),
        b("Auto shop", "8154x11321", "parts", "garaje", "1 planta"),
        b("E¢ono Room$ (motel)", "8074x11416", "", "hotel", "2 plantas"),
        b("Bright Flag Inn", "8017x11427", "alcohol / comida", "hotel", "2 plantas"),
        b("Jenny's Table", "8078x11454", "comida", "tienda", "1 planta"),
        b("FashionaBelle", "8089x11490", "telas / ropa", "tienda", "1 planta"),
        b("Bowling alley", "8079x11505", "", "tienda", "1 planta"),
        b("Book Naked", "8082x11506", "skillbooks", "librería", "1 planta"),
        b("Rosewood Country Buffet", "8086x11500", "comida · neveras", "tienda", "1 planta"),
        b("Laundromat", "8135x11506", "", "tienda", "1 planta"),
        b("Rosewood Medical", "8091x11524", "meds", "clínica", "1–2 plantas"),
        b("Marple & Christie Legal Services", "8090x11537", "", "oficina", "1 planta"),
        b("Haircuts n' More", "8090x11552", "", "tienda", "1 planta"),
        b("Church", "8123x11550", "", "iglesia", "1 planta"),
        b("Palm Travel", "8082x11561", "", "oficina", "1 planta"),
        b("Zippee Market", "8105x11578", "comida · neveras", "tienda", "1 planta"),
        b("Knox Bank", "8081x11588", "", "banco", "1–2 plantas", "alarma banco"),
        b("Markson & Co.", "8089x11600", "", "oficina", "1 planta"),
        b("Mama McFudgington's", "8082x11616", "comida", "tienda", "1 planta"),
        b("Kentucky Court of Justice", "8065x11652", "", "oficina", "2 plantas"),
        sec("Fire / Police"),
        b("Rosewood Fire Department", "8134x11735", "axes / fire gear / camas — BASE", "estación", "2 plantas"),
        b("Police Station Rosewood", "8063x11737", "armas / ammo", "policía", "2 plantas"),
        sec("Residencial y escuela"),
        *houses("Residencial Rosewood", 24, "8300x11480", "x", 14),
        b("Elementary school", "8342x11610", "libros / skillbooks", "escuela", "2 plantas"),
        b("Bail Bonds", "7992x11449", "", "oficina", "1 planta"),
        sec("Sur · Fossoil y alrededores"),
        b("Fossoil — 2838 Rosewood Rd.", "8312x12218", "gas + mapa Rosewood · neveras", "gasolinera", "1 planta"),
        b("Bus station", "8242x12231", "", "estación", "1 planta"),
        b("Onyx Drive-In Theater", "8425x12246", "", "exterior", "exterior"),
        b("Farmer's market", "9071x12154", "comida / produce", "tienda", "1 planta"),
        b("Produce warehouses", "9170x11846", "farming storage / possible generator", "almacén", "1 planta"),
    ]
    z.append(zone(
        "014_Rosewood.pdf", "RW",
        "Rosewood · pueblo completo (Main St., FD/PD, residencial, Fossoil sur)",
        rw, "Entra por North Main St. / carreteras sur. Centro ~8446x11556.",
        "North Main comercio → FD/PD → residencial/escuela → sur Fossoil/warehouses.",
        "", bl, ciudad="Rosewood",
        map_item="Mapa Rosewood en Fossoil 2838 Rosewood Rd. / gloveboxes / cadáveres.",
        vehiculos="Thunder Gas, auto shop, parking FD; sur Fossoil.",
        base="Fire Department = mejor base clásica del sur (camas, axes, muro).",
        croquis="N Main → comercios → FD/PD → casas/escuela → S Fossoil",
    ))
    z.append(zone(
        "015_Rosewood_Prision.pdf", "RW-Prision",
        "Rosewood · Kentucky State Prison (oeste/sur-oeste)",
        rwi, "Al oeste/sur-oeste de Rosewood (~7718x11881).",
        "Parking/gates → admin → yards → cell blocks → infirmary/kitchen.",
        "Peligro máximo del sur.",
        [
            b("Kentucky State Prison — parking / gates", "7718x11881", "", "parking", "exterior"),
            b("Prisión — administration", "7718x11881", "posible armería", "oficina", "2 plantas"),
            b("Prisión — cell blocks", "7718x11881", "riot gear / armas posibles", "prisión", "2+ plantas"),
            b("Prisión — infirmary", "7718x11881", "meds", "clínica", "1 planta"),
            b("Prisión — kitchen / warehouse", "7718x11881", "comida / tools / generator posible", "almacén", "1 planta"),
        ],
        ciudad="Rosewood",
        map_item="Usa mapa Rosewood. No hay map item de la prisión.",
        vehiculos="Parking entrada; pocos dentro.",
        base="No. Usa FD de Rosewood como staging.",
        croquis="Rosewood O → parking → GATE → admin → yards → blocks → servicios",
    ))
    z.append(zone(
        "016_Military_Research_Facility.pdf", "MilLab",
        "Zona rural · Military Research Facility (cerca Rosewood)",
        rwi, "POI secreto wiki ~5687x12472 (oeste/sur de Rosewood).",
        "Aproxima con sigilo; limpia edificio a edificio del complejo.", "",
        [b("Military Research Facility", "5687x12472", "loot militar / high value / possible generator",
           "militar", "2+ plantas")],
        ciudad="Rural · militar",
        map_item="Sin map item. Marca coords en tu mapa.",
        vehiculos="Parking militar posible.",
        base="No residencial; loot and leave.",
        croquis="Aproximación sigilo → perímetro → edificios uno a uno",
    ))
    return z


def classic_south():
    z = []
    z.append(zone(
        "017_March_Ridge.pdf", "MR",
        "March Ridge · pueblo housing militar",
        "Muldraughmap.jpg", "Desde Fiddler's Trail / sur. Centro ~9921x12603.",
        "Housing → school/community → Pharmahug/food/gas.", "",
        [
            b("March Ridge School", "10000x12656", "libros / skillbooks", "escuela", "2 plantas"),
            b("March Ridge Community Center", "10034x12733", "", "oficina", "1–2 plantas"),
            b("Pharmahug March Ridge", "10143x12752", "meds", "farmacia", "1 planta", "cristales / alarma"),
            b("Food Market March Ridge", "9980x12620", "comida · neveras grandes", "tienda", "1 planta"),
            b("Gas March Ridge", "9950x12550", "gas + mapa March Ridge · neveras", "gasolinera", "1 planta"),
        ] + houses("Military housing March Ridge", 20, "9800x12520", "x", 14),
        ciudad="March Ridge",
        map_item="Mapa March Ridge en gasolinera / gloveboxes / cadáveres.",
        vehiculos="Parking school/community; housing garajes.",
        base="Housing militar con cerca + community center.",
        croquis="Entrada → housing → school/community → Pharma/food/gas",
    ))

    mu, mui = "Muldraughmap.jpg", "Muldraugh.jpg"
    bl = [
        sec("Dixie Highway norte"),
        b("Smokey's Saloon & Restaurant", "10621x9224", "alcohol / comida", "tienda", "1 planta"),
        b("Mass-Genfac Co.", "10617x9313", "warehouse tools / possible generator", "almacén", "1–2 plantas"),
        b("Secure Storage", "10615x9376", "storage / generator posible", "almacén", "1 planta"),
        b("Auto shop (Muldraugh)", "10606x9406", "parts", "garaje", "1 planta"),
        b("Family Fashion", "10613x9440", "telas / ropa", "tienda", "1 planta"),
        b("Buffet", "10629x9441", "comida · neveras", "tienda", "1 planta"),
        b("Burgers", "10608x9475", "comida", "tienda", "1 planta"),
        b("Coin Op Laundromat", "10608x9469", "", "tienda", "1 planta"),
        b("Pile o' Crepe", "10621x9511", "comida", "tienda", "1 planta"),
        b("Jay's Chicken", "10618x9566", "comida", "tienda", "1 planta"),
        b("Bakery", "10619x9609", "comida", "tienda", "1 planta"),
        b("Zippee Market", "10605x9613", "comida · neveras", "tienda", "1 planta"),
        b("Spiffo's", "10623x9651", "comida", "tienda", "1 planta"),
        b("H. Smith Attorney", "10650x9651", "", "oficina", "1 planta"),
        b("Knox Bank", "10629x9697", "", "banco", "1–2 plantas", "alarma banco"),
        b("First Baptist Chapel", "10721x9712", "", "iglesia", "1 planta"),
        b("Fossoil — 119 Dixie Highway", "10625x9762", "gas + mapa Muldraugh · neveras", "gasolinera", "1 planta"),
        b("Sunstar Motel", "10628x9815", "motel loot", "hotel", "2 plantas"),
        b("U-Store It", "10686x9830", "storage / generator posible", "almacén", "1 planta"),
        b("Waites Motel", "10899x9756", "", "hotel", "2 plantas"),
        b("Food Market", "10850x9763", "comida · neveras grandes", "tienda", "1 planta"),
        sec("Centro · escuela / Cortman"),
        b("Appliance store", "10616x9881", "electronics / possible generator parts", "tienda", "1 planta"),
        b("Liquorty-Split", "10612x9906", "alcohol", "tienda", "1 planta"),
        b("Genteel-y Used", "10631x9905", "ropa", "tienda", "1 planta"),
        b("Adult Education Center", "10646x9905", "libros / skillbooks", "escuela", "1–2 plantas"),
        b("Cafe", "10649x9928", "comida", "tienda", "1 planta"),
        b("Muldraugh Elementary", "10618x9968", "libros / skillbooks", "escuela", "2 plantas"),
        b("Soccer field / basketball", "10668x9978", "", "exterior", "exterior"),
        b("Cortman Medical", "10878x10030", "meds endgame-tier pueblo", "clínica", "1–2 plantas"),
        b("Conven-U-Mart", "10840x10031", "comida · neveras", "tienda", "1 planta"),
        b("Baseball field", "10957x9943", "", "exterior", "exterior"),
        b("Coin Op Laundromat (este)", "10917x9844", "", "tienda", "1 planta"),
        sec("Sur · PD / Rusty Rifle"),
        b("Pizza Whirled", "10606x10111", "comida", "tienda", "1 planta"),
        b("Clark Storage", "10708x10121", "storage", "almacén", "1 planta"),
        b("Valu In$urance", "10628x10132", "", "oficina", "1 planta"),
        b("Bail Bonds", "10629x10138", "", "oficina", "1 planta"),
        b("Legal Services", "10626x10156", "", "oficina", "1 planta"),
        b("Tattoo 42", "10619x10158", "", "tienda", "1 planta"),
        b("Holy Grace Church", "10778x10172", "", "iglesia", "1 planta"),
        b("Soup kitchen", "10610x10304", "comida", "tienda", "1 planta"),
        b("Hair salon", "10610x10323", "", "tienda", "1 planta"),
        b("Clothing store", "10611x10331", "telas / ropa", "tienda", "1 planta"),
        b("Office complex", "10694x10340", "", "oficina", "2 plantas"),
        b("Stor-A-Max", "10752x10348", "storage / generator posible", "almacén", "1 planta"),
        b("Book store", "10611x10366", "skillbooks", "librería", "1 planta"),
        b("Police station / Muldraugh PD", "10636x10411", "armas / ammo", "policía", "2 plantas"),
        b("L&B Warehousing", "10712x10443", "warehouse / tools / generator posible", "almacén", "1–2 plantas"),
        b("Hit Vids!", "10609x10452", "VHS", "tienda", "1 planta"),
        b("Restaurant (Muldraugh)", "10620x10528", "comida · neveras", "tienda", "1 planta"),
        b("The Rusty Rifle", "10762x10550", "alcohol / armas temáticas posibles", "tienda", "1 planta"),
        b("Diner", "10619x10561", "comida", "tienda", "1 planta"),
        b("Gas 2 Go", "10663x10625", "gas · neveras", "gasolinera", "1 planta"),
        sec("McCoy / industrial"),
        b("McCoy Logging Co.", "10372x9637", "tools / generators / gas", "fábrica", "1–2 plantas"),
        b("T.I.S. Construction", "10079x9593", "tools / construction", "fábrica", "1 planta"),
        b("Factories (sur)", "10095x10940", "industrial / tools / generator posible", "fábrica", "1–2 plantas"),
        b("Railyard", "11645x9938", "industrial cargo", "almacén", "exterior"),
        b("Diner (sur extra)", "10110x11151", "comida", "tienda", "1 planta"),
        sec("Residencial"),
        *houses("Residencial Muldraugh", 28, "10950x9800", "y", 18),
    ]
    z.append(zone(
        "018_Muldraugh.pdf", "MU",
        "Muldraugh · pueblo completo (Dixie, Cortman, PD, McCoy, factories, residencial)",
        mu, "Entra por Dixie Highway (31W).",
        "Dixie N→S → centro/Cortman → sur PD/Rusty Rifle → McCoy/oeste → factories/railyard → residencial.",
        "", bl, ciudad="Muldraugh",
        map_item="Mapa Muldraugh en Fossoil 119 Dixie Highway. Cortman Medical = meds clave del pueblo.",
        vehiculos="Auto shop norte; parking strip; McCoy yard; railyard este.",
        base="Casa trasera lejos de Dixie, o Secure Storage limpio.",
        croquis="Dixie N→S → Cortman → PD/Rusty → McCoy O → factories/rail → casas",
    ))

    z.append(zone(
        "019_Dixie_Mobile_Park.pdf", "Dixie",
        "Dixie Mobile Park · entre Muldraugh y West Point (Dixie Highway)",
        mu, "Sobre Dixie Highway, norte de Muldraugh. Enlace Riverside Rd / Tioga Rd.",
        "Diner/Spiffo's → parking/containers → trailers fila a fila.",
        "Wiki: trailers con survivor stories; 3 shipping containers en parking.",
        [
            b("Diner (Dixie)", "11462x8809", "comida · neveras", "tienda", "1 planta"),
            b("Spiffo's (Dixie)", "11663x8302", "comida", "tienda", "1 planta"),
            b("Parking / shipping containers", "11600x8700", "soda / pop / logs (wiki)", "parking", "exterior"),
        ] + [b(f"Trailer Dixie {i:02d}/24", f"{11550+(i%6)*12}x{8600+(i//6)*14}",
               "posible firearm en trailer", "trailer", "1 planta") for i in range(1, 25)],
        ciudad="Dixie Mobile Park",
        map_item="Sin map item propio. Entre mapas Muldraugh y West Point.",
        vehiculos="Parking + containers; trailers con coches pegados.",
        base="Temporal solo; sigue a West Point.",
        croquis="Dixie Hwy → diner/Spiffo → parking/containers → filas trailers",
    ))
    return z


def west_point():
    wp = "WestPoint.jpg"
    bl = [
        sec("Main St. / downtown"),
        b("West Point Town Hall", "11940x6869", "", "oficina", "2 plantas"),
        b("Post office", "11961x6912", "", "oficina", "1 planta"),
        b("Police station", "11897x6942", "armas / ammo", "policía", "2 plantas"),
        b("West Point DIY", "11973x6912", "tools / sledge", "tienda", "1 planta"),
        b("Food Market", "11984x6914", "comida · neveras grandes", "tienda", "1 planta"),
        b("Furniture store", "11931x6942", "carpintería", "tienda", "1 planta"),
        b("General store", "11831x6913", "suministros", "tienda", "1 planta"),
        b("Knox Bank", "11905x6915", "", "banco", "1–2 plantas", "alarma banco"),
        b("Enigma Books", "11895x6886", "skillbooks", "librería", "1 planta"),
        b("Hair O Genesis", "11859x6886", "", "tienda", "1 planta"),
        b("Valu In$urance", "11871x6886", "", "oficina", "1 planta"),
        b("Dentistry Dr. R. B. Mat, DMD", "11882x6884", "meds menores", "clínica", "1 planta"),
        b("Medical clinic", "11867x6911", "meds", "clínica", "1 planta"),
        b("The Drake", "11906x6852", "alcohol", "tienda", "1 planta"),
        b("Bakery", "11907x6866", "comida", "tienda", "1 planta"),
        b("Mendy's Eatery", "11903x6880", "comida · neveras", "tienda", "1 planta"),
        b("Seahorse Coffee", "11963x6882", "comida", "tienda", "1 planta"),
        b("Spiffo's", "11978x6812", "comida", "tienda", "1 planta"),
        b("Pharmahug", "11932x6802", "meds", "farmacia", "1 planta", "cristales / alarma"),
        b("Car Fix-Ation", "11897x6807", "parts", "garaje", "1 planta"),
        b("Coin Op Laundromat", "11931x6786", "", "tienda", "1 planta"),
        b("Thunder Gas", "11824x6870", "gas · neveras", "gasolinera", "1 planta"),
        b("GigaMart", "12029x6858", "comida masiva · neveras · generator zona", "almacén", "1 planta"),
        b("Motel", "12024x6917", "", "hotel", "2 plantas"),
        b("Stendo's Firearms Emporium", "12066x6760", "armas / ammo", "armeria", "1 planta", "alarma armería"),
        b("Twiggy's", "12066x6800", "alcohol", "tienda", "1 planta"),
        sec("2nd Street / Fossoil"),
        b("Fossoil — 205 Second St.", "12078x7142", "gas + mapa West Point · neveras", "gasolinera", "1 planta"),
        b("Burgers", "12078x7076", "comida", "tienda", "1 planta"),
        b("Factory", "12141x7085", "industrial / tools", "fábrica", "1–2 plantas"),
        b("Self storage", "12136x7021", "storage / generator posible", "almacén", "1 planta"),
        sec("Oeste · school / cemetery / KY"),
        b("Cemetery", "11069x6711", "", "cementerio", "exterior"),
        b("Church (oeste)", "11089x6713", "", "iglesia", "1 planta"),
        b("School", "11342x6774", "libros / posible firearm", "escuela", "2 plantas"),
        b("Grocery store (oeste)", "11354x6723", "comida · neveras", "tienda", "1 planta"),
        b("Daycare", "11739x6923", "", "oficina", "1 planta"),
        b("Conven-U-Mart", "11670x7037", "comida · neveras", "tienda", "1 planta"),
        b("Genteel-y Used", "11680x7037", "ropa", "tienda", "1 planta"),
        b("Zippee Market", "11663x7069", "comida", "tienda", "1 planta"),
        b("Pizza Whirled", "11662x7085", "comida", "tienda", "1 planta"),
        b("American Tire (Clarke Way)", "12258x6931", "parts", "garaje", "1 planta"),
        b("Diner in the Woods", "12047x7377", "comida", "tienda", "1 planta"),
        sec("Residencial 2nd–10th St."),
        *houses("Residencial West Point", 30, "11600x6950", "x", 12),
    ]
    return [zone(
        "020_West_Point.pdf", "WP",
        "West Point · pueblo completo (Main St., 2nd St., oeste, residencial)",
        wp, "Desde Dixie Hwy por 2nd St. o Clarke Way hacia Main St.",
        "Main downtown (gun store al este) → 2nd/Fossoil → oeste school → residencial 2nd–10th.",
        "Calles: Main, 2nd–10th, Clarke Way (PZwiki Street_names).",
        bl, ciudad="West Point",
        map_item="Mapa West Point en Fossoil 205 Second St. Stendo's = armas clave.",
        vehiculos="Car Fix-Ation, American Tire, parking GigaMart/Motel.",
        base="Casa residencial oeste o self storage limpio; no el gun store como hogar.",
        croquis="Dixie → Main O→E (Stendo's) → 2nd Fossoil → O school → 2nd–10th casas",
    )]


def valley_and_louisville():
    z = []
    z.append(zone(
        "021_Valley_Station.pdf", "VS",
        "Valley Station · antesala de Louisville (Dixie Hwy norte)",
        "LouisvilleMap7.jpg", "Norte por Dixie Hwy desde West Point. Centro ~13056x6031.",
        "Fossoil → residencial/roadside → exclusion hacia LV.",
        "Sin map item propio. Busca mapas Louisville 1–9.",
        [
            b("Fossoil Valley Station", "12693x6534", "gas · mapas Louisville 1–9 · neveras", "gasolinera", "1 planta"),
        ] + houses("Valley Station / roadside", 16, "12950x6000", "x", 16),
        ciudad="Valley Station",
        map_item="No hay map item de Valley Station. Prioriza mapas Louisville en este Fossoil.",
        vehiculos="Fossoil + roadside; último gas fiable antes de LV.",
        base="Temporal; staging hacia Louisville SW.",
        croquis="West Point N → Dixie → Fossoil → casas → exclusion → LV SW",
    ))

    maps = {
        "SW": "LouisvilleMap7.jpg", "W": "LouisvilleMap4.jpg", "C": "LouisvilleMap5.jpg",
        "S": "LouisvilleMap8.jpg", "SE": "LouisvilleMap9.jpg", "E": "LouisvilleMap6.jpg",
        "N": "LouisvilleMap2.jpg", "NE": "LouisvilleMap3.jpg", "NW": "LouisvilleMap1.jpg",
    }
    z.append(zone(
        "022_Louisville_SW.pdf", "LV-SW",
        "Louisville · suroeste · Dixie / Rockford Ln. / Manslick Rd. / Outer Loop",
        maps["SW"], "Desde Valley Station: Dixie → exclusion → South / Farnly / Rockford.",
        "Fossoils → South Louisville Elementary → mall sur → residencial (Bluebird/Crow/Dove/Finch).",
        "Calles B42: Dixie Highway, Rockford Ln., Manslick Rd., Farnly Rd., Lower River Rd., "
        "Bluebird St., Crow Court, Dove St., Finch St., Sparrow St., Starling St., Cardinal Dr., "
        "Pigeon St., Jay St., Duckling Ave., Turkey Ave., South Dr., Moormen Rd.",
        [
            b("Fossoil — 4 Rockford Ln.", "12442x3535", "gas · neveras", "gasolinera", "1 planta"),
            b("Fossoil — 3259 Manslick Rd.", "12910x3028", "gas · neveras", "gasolinera", "1 planta"),
            b("Louisville border camp", "12497x4050", "", "militar", "1 planta"),
            b("South Louisville Elementary", "12970x3223", "libros / skillbooks", "escuela", "2 plantas"),
            b("South Louisville mall", "13345x3063", "loot masivo · neveras · generator zona", "almacén", "1–2 plantas"),
            *houses("Bluebird St. / Crow Court", 6, "12890x3600", "x", 14),
            *houses("Dove St. / Finch St.", 6, "12790x3500", "x", 14),
            *houses("Residencial Louisville SW", 10, "12400x3400", "x", 16),
        ],
        ciudad="Louisville",
        map_item="Louisville Southwest (gasolineras / gloveboxes / cadáveres).",
        vehiculos="Fossoils Rockford/Manslick; parking mall sur.",
        base="Casa SW lejos del mall; mall = loot no hogar.",
        croquis="Exclusion → Rockford Fossoil → Manslick → Elementary → mall → calles ave",
    ))
    z.append(zone(
        "023_Louisville_West.pdf", "LV-W",
        "Louisville · oeste · Industry Rd. / río / Fossoil refinery / University",
        maps["W"], "Desde SW/West edge hacia el río oeste.",
        "Industrial substation → Fossoil refinery → Animal Shelter → LSU edge → residencial.",
        "Calles B42: Industry Rd., Bourbon Way, Old Seminary Rd., 3rd St., 4th St., Lower Ridge Rd.",
        [
            b("Louisville industrial substation", "12089x1752", "industrial / electronics", "estación", "1 planta"),
            b("Fossoil Refinery / industrial park", "12077x1615", "gas / industrial / generator", "fábrica", "2+ plantas"),
            b("Louisville Animal Shelter", "12255x1435", "", "oficina", "1 planta"),
            b("West riverside house / edge", "12030x2590", "posible BASE", "casa", "2 plantas · sótano posible"),
            b("Louisville State University (campus oeste)", "12367x2264", "libros / skillbooks / loot campus",
              "escuela", "2+ plantas"),
            *houses("Bourbon Way / 3rd–4th St.", 8, "12150x1900", "y", 16),
            *houses("Residencial Louisville West", 8, "12150x2400", "x", 16),
        ],
        ciudad="Louisville",
        map_item="Louisville West.",
        vehiculos="Refinery parking; industrial yard.",
        base="West riverside house si controlas el borde.",
        croquis="SW → Industry Rd → refinery → shelter → LSU → residencial río",
    ))
    z.append(zone(
        "024_Louisville_Central.pdf", "LV-C",
        "Louisville · central · PD Industry Rd., hospital, library, expo, Jefferson/Main",
        maps["C"], "Desde oeste/sur hacia downtown.",
        "PD → library/gallery → expo → hospital → community center → train station.",
        "Calles B42: Industry Rd., Main St., East Main St., East Market St., Jefferson St., "
        "North 1st St., Jackson St., Danson St., Grady St., Kilkenny St., Waterfront Park.",
        [
            b("Louisville Police Department — Industry Rd.", "12466x1609", "armas / armor", "policía", "2+ plantas"),
            b("Brooks Public Library of Louisville", "12559x1468", "skillbooks", "librería", "2 plantas"),
            b("Art Gallery of Louisville", "12552x1386", "", "oficina", "1–2 plantas"),
            b("Louisville Expo Center", "12956x1298", "", "oficina", "1–2 plantas"),
            b("Central Louisville Community Center", "12849x1692", "", "oficina", "1–2 plantas"),
            b("Louisville General Hospital", "12936x2047", "meds endgame · neveras clínicas", "hospital", "varios pisos"),
            b("Louisville Animal Hospital", "12574x1988", "meds/vet", "clínica", "1–2 plantas"),
            b("Louisville Train Station", "12686x2339", "", "estación", "1–2 plantas"),
            b("Louisville Boat Club", "12756x1143", "", "club", "1–2 plantas"),
            b("Knox Bank Central / downtown", "12600x1500", "", "banco", "2 plantas", "alarma banco"),
            *houses("Jefferson / Main / North 1st", 10, "12650x1450", "x", 12),
        ],
        ciudad="Louisville",
        map_item="Louisville Central. Prioridad absoluta tras entrar a LV.",
        vehiculos="Parking hospital/expo/PD; densidad alta = ruido.",
        base="No downtown. Staging desde West/SW limpios.",
        croquis="W → PD Industry → Library → Expo → Hospital → Train/Boat",
    ))
    z.append(zone(
        "025_Louisville_South.pdf", "LV-S",
        "Louisville · sur · suburbios Outer Loop / Southside / Manslick",
        maps["S"], "Sur de central / desde SW.",
        "Residencial sur → PD south suburbs → completa Outer Loop si falta.",
        "Calles B42: Outer Loop, Southside Dr., Manslick Rd., Moormen Rd.",
        [b("Police south suburbs", "13221x3086", "armas / ammo", "policía", "2 plantas")]
        + houses("Southside / Outer Loop residencial", 12, "13100x3100", "x", 14)
        + houses("Residencial Louisville South", 10, "12900x3000", "x", 16),
        ciudad="Louisville",
        map_item="Louisville South.",
        vehiculos="Parking PD sur; suburbios con garajes.",
        base="Casa Outer Loop con garaje.",
        croquis="SW/Central S → PD sur → Outer Loop / Southside casas",
    ))
    z.append(zone(
        "026_Louisville_SE.pdf", "LV-SE",
        "Louisville · sureste",
        maps["SE"], "Desde South hacia el este.",
        "Manzana a manzana sureste.",
        "Calles B42: Outer Loop este, Southside Dr. prolongación.",
        houses("Residencial Louisville SE", 16, "13500x3000", "x", 16)
        + houses("SE side streets", 8, "13650x2900", "y", 14),
        ciudad="Louisville",
        map_item="Louisville Southeast.",
        vehiculos="Garajes residenciales.",
        base="Casa SE tranquila tras limpiar densidades.",
        croquis="South → E manzanas → Outer Loop SE",
    ))
    z.append(zone(
        "027_Louisville_East.pdf", "LV-E",
        "Louisville · este · East PD, Hikes Ln., Shelby Rd., mansions valladas",
        maps["E"], "Este de la ciudad.",
        "East PD → residencial Hikes/Shelby → fenced mansions ~14150x2610 → festival grounds.",
        "Calles B42: Hikes Ln., Shelby Rd., Romuald Dron Memorial Park area.",
        [
            b("Police eastern suburbs", "13783x2554", "armas / ammo", "policía", "2 plantas"),
            b("Fenced mansions cluster", "14150x2610", "garajes / vehículos / tools", "mansión", "2 plantas"),
            b("Louisville Music Festival grounds", "13750x1939", "", "exterior", "exterior"),
            *houses("Hikes Ln. / Shelby Rd.", 10, "13750x1800", "x", 14),
            *houses("Residencial Louisville East", 8, "13850x2400", "x", 16),
        ] + [b(f"Mansión vallada {i}/8", f"{14120+(i*14)}x2580", "garaje / loot rico / possible generator",
               "mansión", "2 plantas · sótano posible") for i in range(1, 9)],
        ciudad="Louisville",
        map_item="Louisville East.",
        vehiculos="Mansions valladas = mejor flota de LV este.",
        base="Mansión vallada con perímetro cerrado.",
        croquis="Central/SE → East PD → Hikes/Shelby → mansions → festival",
    ))
    z.append(zone(
        "028_Louisville_North.pdf", "LV-N",
        "Louisville · norte · Grand Ohio Mall / Bruiser Ave. / East Main / costa",
        maps["N"], "Norte desde central hacia el Ohio.",
        "Pharmahug coast → Fossoil mall → Grand Ohio Mall tienda a tienda → Bruiser factory.",
        "Calles B42: Bruiser Ave., East Main St., Shelby Rd. norte, Waterfront Park.",
        [
            b("Pharmahug north coast (cerca mall)", "13235x1291", "meds", "farmacia", "1 planta", "cristales / alarma"),
            b("Fossoil west of Grand Ohio Mall", "13376x1417", "gas · neveras", "gasolinera", "1 planta"),
            b("Grand Ohio Mall", "13520x1264", "loot masivo — tienda a tienda · neveras · generator",
              "almacén", "2+ plantas"),
            b("Louisville Bruiser (bat factory) — Bruiser Ave.", "13243x1240", "melee / industrial",
              "fábrica", "1–2 plantas"),
            b("Police Expo / north-central", "12968x1366", "armas", "policía", "2 plantas"),
            b("Sunset Pines Funeral Home", "13160x1520", "", "oficina", "1–2 plantas"),
            b("U-Store It", "13660x1620", "storage / generator posible", "almacén", "1 planta"),
            b("Riding school", "13040x2820", "", "escuela", "1 planta"),
            *houses("East Main / Waterfront edge", 8, "13150x1500", "x", 12),
        ],
        ciudad="Louisville",
        map_item="Louisville North (usa también NW/NE si solapan).",
        vehiculos="Parking Grand Ohio Mall; U-Store.",
        base="No el mall. U-Store o casa Waterfront si limpia.",
        croquis="Central N → Pharma/Fossoil → Grand Ohio Mall → Bruiser → U-Store",
    ))
    z.append(zone(
        "029_Louisville_NE.pdf", "LV-NE",
        "Louisville · noreste",
        maps["NE"], "Noreste / map item Northeast.",
        "Residencial NE casa a casa (Hikes/Shelby prolongación).",
        "Calles B42: Hikes Ln. este, Shelby Rd. norte-este.",
        houses("Residencial Louisville NE", 14, "13800x1600", "x", 16)
        + houses("NE side streets", 8, "13950x1700", "y", 14),
        ciudad="Louisville",
        map_item="Louisville Northeast.",
        vehiculos="Garajes residenciales.",
        base="Casa NE tras East limpio.",
        croquis="East/North → NE manzanas → cierre NE",
    ))
    z.append(zone(
        "030_Louisville_NW.pdf", "LV-NW",
        "Louisville · noroeste · orilla / 3rd–4th / Bourbon Way",
        maps["NW"], "Noroeste / map item Northwest.",
        "Residencial NW y orilla del Ohio.",
        "Calles B42: 3rd St., 4th St., Bourbon Way, Waterfront Park oeste.",
        houses("3rd / 4th / Bourbon residencial", 10, "12200x1600", "x", 14)
        + houses("Residencial Louisville NW", 8, "12300x1700", "x", 16)
        + [b(f"Riverfront NW {i}/6", f"{12050+(i*25)}x1400", "", "casa", "2 plantas") for i in range(1, 7)],
        ciudad="Louisville",
        map_item="Louisville Northwest.",
        vehiculos="Pocos en orilla; prioriza West industrial si falta flota.",
        base="Riverfront NW si densidades bajas.",
        croquis="West/North → NW casas → riverfront cierre",
    ))
    return z


def stash_maps():
    """Un PDF de stash por ciudad (todas las marcas wiki juntas)."""
    z = []
    rv = [
        ("RiversideStashMap1", "6801x5487", "SurvivorCache1"),
        ("RiversideStashMap2", "6375x5249", "ToolsCache1"),
        ("RiversideStashMap3", "6207x5346", "stash"),
        ("RiversideStashMap4", "6784x5328", "SurvivorCache1"),
        ("RiversideStashMap5", "6306x5310", "SurvivorCache1"),
        ("RiversideStashMap6", "6201x5471", "GunCache1"),
        ("RiversideStashMap7", "6629x5330", "SurvivorCache1"),
        ("RiversideStashMap8", "6502x5584", "FoodCache1"),
        ("RiversideStashMap9", "6057x5347", "SurvivorCache1"),
        ("RiversideStashMap10", "6495x5265", "stash"),
    ]
    z.append(zone(
        "031_Stash_Riverside.pdf", "Stash-RV",
        "Mapas anotados · Riverside (10 marcas)",
        "Riversidemap.jpg",
        "Consigue Annotated Maps en gloveboxes/cadáveres; luego visita cada marca.",
        "Una marca del mapa anotado cada vez; no limpies manzanas enteras por el stash.",
        "Fuente: PZwiki Annotated Map (Riverside).",
        [b(f"{sid}", coords, f"stash anotado ({cache})", "stash", "casa/POI")
         for sid, coords, cache in rv],
        ciudad="Stash maps",
        map_item="Los annotated maps usan el mapa de la ciudad como base.",
        vehiculos="Según la casa marcada.",
        base="Algunos SurvivorCache son safehouses temporales.",
        croquis="Leer mapa anotado → ir SOLO a la marca → loot → siguiente mapa",
    ))
    z.append(zone(
        "032_Stash_Rosewood.pdf", "Stash-RW",
        "Mapas anotados · Rosewood (4 marcas)",
        "Rosewoodmap.jpg",
        "Annotated Map (Rosewood) → casa marcada.",
        "Solo la casa/POI marcado.",
        "PZwiki Annotated Map (Rosewood).",
        [b(sid, coords, f"stash ({cache})", "stash", "casa/POI") for sid, coords, cache in [
            ("RosewoodStashMap1", "8238x11555", "GunCache1"),
            ("RosewoodStashMap2", "8301x11552", "ShotgunCache1"),
            ("RosewoodStashMap3", "8419x11581", "ToolsCache1"),
            ("RosewoodStashMap4", "7995x11451", "FoodCache1"),
        ]],
        ciudad="Stash maps", map_item="Base: mapa Rosewood.", vehiculos="", base="",
        croquis="Mapa anotado → marca única → loot",
    ))
    z.append(zone(
        "033_Stash_Muldraugh.pdf", "Stash-MU",
        "Mapas anotados · Muldraugh (5 marcas)",
        "Muldraughmap.jpg",
        "Annotated Map (Muldraugh) → casa marcada.",
        "Solo el edificio del stash.",
        "PZwiki Annotated Map.",
        [b(sid, coords, f"stash ({cache})", "stash", "casa/POI") for sid, coords, cache in [
            ("MulStashMap1", "10663x9764", "GunCache1"),
            ("MulStashMap3", "10673x10188", "stash"),
            ("MulStashMap4", "10760x10083", "stash"),
            ("MulStashMap10", "10725x9984", "stash"),
            ("MulStashMap11", "10622x9654", "stash"),
        ]],
        ciudad="Stash maps", map_item="Base: mapa Muldraugh.", vehiculos="", base="",
        croquis="Mapa anotado → marca → loot",
    ))
    z.append(zone(
        "034_Stash_WestPoint.pdf", "Stash-WP",
        "Mapas anotados · West Point (4 marcas)",
        "WestPoint.jpg",
        "Annotated Map (West Point) → marca.",
        "Solo la casa marcada (a menudo armas).",
        "PZwiki Annotated Map (West Point).",
        [b(sid, coords, f"stash ({cache})", "stash", "casa/POI") for sid, coords, cache in [
            ("WpStashMap1", "10941x6726", "GunCache1"),
            ("WpStashMap11", "11980x6813", "stash"),
            ("WpStashMap13", "10890x6743", "stash"),
            ("WpStashMap14", "11288x6583", "stash"),
        ]],
        ciudad="Stash maps", map_item="Base: mapa West Point.", vehiculos="", base="",
        croquis="Mapa anotado → marca → loot",
    ))
    z.append(zone(
        "035_Stash_Brandenburg.pdf", "Stash-BR",
        "Mapas anotados · Brandenburg (8 marcas)",
        "BrandenburgMap.jpg",
        "Annotated Map (Brandenburg) → marca.",
        "Solo el edificio marcado.",
        "PZwiki Annotated Map (Brandenburg).",
        [b(sid, coords, f"stash ({cache})", "stash", "casa/POI") for sid, coords, cache in [
            ("BBurgStashMap1", "2174x6011", "GunCache1"),
            ("BBurgStashMap2", "1720x5934", "ToolsCache1"),
            ("BBurgStashMap3", "2132x6344", "GunCache2"),
            ("BBurgStashMap4", "2736x6291", "FoodCache1"),
            ("BBurgStashMap5", "1936x6583", "stash"),
            ("BBurgStashMap6", "1675x6109", "ShotgunCache1"),
            ("BBurgStashMap7", "2243x5820", "SurvivorCache2"),
            ("BBurgStashMap8", "2774x5907", "ToolsCache1"),
        ]],
        ciudad="Stash maps", map_item="Base: mapa Brandenburg.", vehiculos="", base="",
        croquis="Mapa anotado → marca → loot",
    ))
    z.append(zone(
        "036_Stash_Ekron_Irvington.pdf", "Stash-EK-IR",
        "Mapas anotados · Ekron e Irvington (B42)",
        "EkronMap.jpg",
        "Annotated Maps de Ekron (8) e Irvington (10) en gloveboxes/cadáveres.",
        "Ve solo a la marca del mapa; inventarios en PZwiki Annotated Map.",
        "Incluye Speedway, Community College, chicken farm, private retreat, etc.",
        [
            sec("Ekron (ejemplos wiki)"),
            b("EkronStashMap1 — Abandoned Factory", "1020x9900", "stash factory", "stash", "fábrica"),
            b("EkronStashMap5 — Community College", "1020x9838", "marca school/aid", "stash", "escuela"),
            b("EkronStashMap7 — Chicken Trail", "1100x10100", "chicken farm", "stash", "granja"),
            b("EkronStashMap8 — Private Retreat", "700x10150", "lake/barn/wells", "stash", "granja"),
            sec("Irvington (ejemplos wiki)"),
            b("IrvingtonStashMap1 — Speedway", "2720x13200", "stash Speedway", "stash", "pista"),
            b("IrvingtonStashMap3 — Don't Run (school ref)", "2650x13900", "safehouse", "stash", "casa"),
            b("IrvingtonStashMap8 — Only One Left (steakhouse)", "2600x14050", "comida/marcas", "stash", "tienda"),
            b("IrvingtonStashMap10 — We'll be Here (NW outskirts)", "2400x13600", "casa aislada", "stash", "casa"),
        ],
        ciudad="Stash maps",
        map_item="Requieren mapas Ekron / Irvington como base del annotated map.",
        vehiculos="", base="",
        croquis="Conseguir annotated → ir a marca → loot → siguiente",
    ))
    return z


def write_index(rows: list[dict]):
    pdf = ShortPDF(
        OUT / "000_Indice_por_Ciudad.pdf",
        "000",
        "Índice por ciudad · orden de limpieza · enlaces al mapa",
        "Riversidemap.jpg",
        acceso="Empieza por 001_Riverside.pdf y sigue el número de archivo.",
        orden="Un PDF = una zona (pueblo o POI nombrado). Coords enlazan a map.projectzomboid.com",
        note="Sin checklists. Cada edificio indica tipo / pisos / alarma. → RECOGER = loot importante "
             "(armas, meds, skillbooks, tools, gas, generator, neveras, telas).",
        map_item="Los map items de ciudad se indican en cada PDF (gasolineras Fossoil, etc.).",
        vehiculos="Ver línea Vehículos en cada zona.",
        base="Ver línea Base candidata en cada zona.",
        croquis="SPAWN Riverside → rural oeste → Brandenburg → Fallas/Echo/Ekron/Irvington → "
                "Rosewood/MU/WP → Valley → Louisville (SW→…→NW) → Stash",
    )
    current = None
    for z in rows:
        city = z.get("ciudad") or "?"
        if city != current:
            current = city
            pdf.section(city)
        pdf.ensure(5 * mm)
        c = pdf.c
        c.setFillColor(INK)
        c.setFont("Mono", 7)
        c.drawString(ML, pdf.y, z["filename"].replace(".pdf", "")[:22])
        c.setFont("Body", 7.5)
        c.drawString(ML + 42 * mm, pdf.y, z["title"][:48])
        if z["buildings"]:
            # first real building coords
            for entry in z["buildings"]:
                if entry[0] != "§" and entry[1]:
                    url = map_url(entry[1])
                    c.setFillColor(LINK)
                    c.setFont("Mono", 6.5)
                    c.drawRightString(PAGE_W - MR, pdf.y, "mapa")
                    c.linkURL(url, (PAGE_W - MR - 12 * mm, pdf.y - 1.5 * mm, PAGE_W - MR, pdf.y + 3 * mm), relative=0)
                    break
        pdf.y -= 4.2 * mm
    pdf.save()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        if old.suffix in {".pdf", ".txt"}:
            old.unlink()

    zones = (
        riverside()
        + rural_pois()
        + brandenburg()
        + fallas_lake()
        + echo_creek()
        + ekron()
        + irvington()
        + rosewood_block()
        + classic_south()
        + west_point()
        + valley_and_louisville()
        + stash_maps()
    )
    print(f"Generando {len(zones)} PDFs de zona...")
    for z in zones:
        path = OUT / z["filename"]
        pdf = ShortPDF(
            path, z["code"], z["title"], z["map"], z["acceso"], z["orden"], z["note"],
            map_item=z.get("map_item", ""),
            vehiculos=z.get("vehiculos", ""),
            base=z.get("base", ""),
            croquis=z.get("croquis", ""),
        )
        for entry in z["buildings"]:
            name, coords, important, kind, floors, alarm = (entry + ("",) * 6)[:6]
            if name == "§":
                pdf.section(kind or floors or "Sección")
            else:
                pdf.building(name, coords, important, kind, floors, alarm)
        pdf.save()
        nbuild = sum(1 for e in z["buildings"] if e[0] != "§")
        print(f"  {z['filename']} ({nbuild} edificios, {pdf.page} págs)")

    write_index(zones)
    (OUT / "000_LEEEME.txt").write_text(
        "GUÍA CORTA B42.20 — un PDF por zona\n\n"
        "• Un PDF = un pueblo / POI (Riverside, Scenic Grove, Brandenburg, etc.)\n"
        "• Índice 000 agrupado por ciudad\n"
        "• Acceso + Orden + Map item + Vehículos + Base + Croquis\n"
        "• Cada edificio: tipo · pisos/sótano · ALARMA si aplica\n"
        "• → RECOGER: armas, meds, skillbooks, tools, gas, generator, neveras, telas…\n"
        "• Louisville con calles B42 (Rockford, Manslick, Industry, Bruiser, Hikes…)\n"
        "• POIs B42: Echo Creek, Ekron, Irvington (+ Speedway), Cortman, etc.\n"
        "• Stash maps consolidados por ciudad (031+)\n"
        "• Coords clicables → map.projectzomboid.com\n\n"
        "Empieza por 000_Indice_por_Ciudad.pdf\n",
        encoding="utf-8",
    )
    print("OK total", len(zones) + 1)


if __name__ == "__main__":
    main()
