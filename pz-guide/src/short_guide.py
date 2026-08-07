#!/usr/bin/env python3
"""Guía corta B42.20: 1 PDF por zona/calle, nombres wiki, acceso, stash maps, links."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
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


def houses(street: str, count: int, anchor: str, axis: str = "x", step: int = 10):
    """Casas en orden de calle. axis x = O→E; y = N→S."""
    try:
        x, y = map(int, anchor.lower().split("x"))
    except Exception:
        x = y = 0
    out = []
    for i in range(1, count + 1):
        if axis == "x":
            coords = f"{x + (i - 1) * step}x{y}"
        else:
            coords = f"{x}x{y + (i - 1) * step}"
        # numeración estilo flier: impares un lado, pares otro (orden de ruta)
        num = 100 + (i * 2 - (1 if i % 2 else 0))
        out.append((f"{street} nº {num} (casa {i}/{count})", coords, ""))
    return out


def b(name, coords, important=""):
    return (name, coords, important)


class ShortPDF:
    def __init__(self, path: Path, code: str, title: str, map_file: str | None,
                 acceso: str = "", orden: str = "", note: str = ""):
        fonts()
        self.path = path
        self.code = code
        self.title = title
        self.map_file = map_file
        self.acceso = acceso
        self.orden = orden
        self.note = note
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
            self._text(f"Orden en calle: {self.orden}", "Body", 8, SOFT, 3.6 * mm)
        if self.note:
            self._text(self.note, "Body", 8, SOFT, 3.6 * mm)
        self.y -= 1 * mm
        if self.map_file:
            self._map(self.map_file)

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

    def building(self, name: str, coords: str = "", important: str = ""):
        self.n += 1
        need = 5 * mm + (4 * mm if important else 0)
        self.ensure(need)
        c = self.c
        c.setFillColor(INK)
        c.setFont("Body", 9)
        label = f"{self.n}. {name}"
        c.drawString(ML, self.y, label[:78])
        if coords:
            c.setFillColor(LINK)
            c.setFont("Mono", 7)
            url = map_url(coords)
            tw = c.stringWidth(coords, "Mono", 7)
            x = PAGE_W - MR - tw
            c.drawString(x, self.y, coords)
            c.linkURL(url, (x - 1, self.y - 1.5 * mm, x + tw + 1, self.y + 3 * mm), relative=0)
        self.y -= 3.8 * mm
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


def zone(filename, code, title, mapf, acceso, orden, note, buildings):
    return {
        "filename": filename,
        "code": code,
        "title": title,
        "map": mapf,
        "acceso": acceso,
        "orden": orden,
        "note": note,
        "buildings": buildings,
    }


def riverside():
    m, mt = "Riversidemap.jpg", "riverside_tourist.jpg"
    z = []
    # Una calle = un PDF
    streets = [
        ("001_Riverside_Pine_Court.pdf", "RV-PineCourt", "Riverside · zona residencial sur-centro · Pine Court",
         "Desde el spawn suburbano, camina a los cul-de-sac al sur del colegio.",
         "Entrada del cul-de-sac → fondo → retorno por el otro lado.", 5, "6300x5600", "x"),
        ("002_Riverside_Mary_Court.pdf", "RV-MaryCourt", "Riverside · zona residencial sur-centro · Mary Court",
         "Junto a Pine Court, sur del strip comercial.",
         "Cul-de-sac horario desde la boca de la calle.", 5, "6320x5620", "x"),
        ("003_Riverside_Marvin_Place.pdf", "RV-MarvinPl", "Riverside · zona residencial sur-centro · Marvin Place",
         "Calle corta entre courts y Walnut St.",
         "Norte → sur, acera este luego acera oeste.", 5, "6280x5580", "y"),
        ("004_Riverside_Maria_Place.pdf", "RV-MariaPl", "Riverside · zona residencial sur-centro · Maria Place",
         "Loop residencial cerca del spawn.",
         "Recorrido en anillo empezando por la esquina NO.", 4, "6260x5610", "x"),
        ("005_Riverside_Walnut_St.pdf", "RV-Walnut", "Riverside · suburbios oeste · Walnut St.",
         "Desde courts hacia el oeste, alejándote del gated.",
         "Oeste → este por acera norte; retorno este → oeste por acera sur.", 5, "6150x5550", "x"),
        ("006_Riverside_Granite_St.pdf", "RV-Granite", "Riverside · suburbios oeste · Granite St.",
         "Paralela a Walnut St., suburbios oeste.",
         "Oeste → este, luego retorno.", 4, "6120x5580", "x"),
        ("007_Riverside_Cemetary_Dr.pdf", "RV-Cemetary", "Riverside · suburbios oeste · Cemetary Dr.",
         "Hacia el cementerio oeste de Riverside (wiki: Cemetery 5710x5334).",
         "Este → oeste hacia el cementerio.", 4, "5900x5350", "x"),
        ("008_Riverside_Ohio_St.pdf", "RV-Ohio", "Riverside · suburbios oeste · Ohio St.",
         "Eje local oeste, cerca del riverfront/comercial oeste.",
         "Sur → norte; casas a ambos lados.", 4, "6000x5500", "y"),
        ("009_Riverside_Kennedy_St.pdf", "RV-Kennedy", "Riverside · frontera este · Kennedy St.",
         "Desde suburbios hacia la valla del gated. No entres al gated aquí.",
         "Oeste → este hasta ver iron fence.", 4, "6550x5450", "x"),
        ("010_Riverside_Lincoln_St.pdf", "RV-Lincoln", "Riverside · frontera este · Lincoln St.",
         "Paralela a Kennedy St., fuera del gated.",
         "Oeste → este.", 4, "6580x5480", "x"),
        ("011_Riverside_Kavanagh_St.pdf", "RV-Kavanagh", "Riverside · frontera este · Kavanagh St.",
         "Última calle residencial antes del perímetro gated.",
         "Norte → sur a lo largo de la frontera.", 3, "6620x5500", "y"),
        ("012_Riverside_Grove_St.pdf", "RV-Grove", "Riverside · sur del colegio · Grove St.",
         "Sur de School (6443x5441).",
         "Oeste → este.", 3, "6400x5550", "x"),
        ("013_Riverside_Sweet_St.pdf", "RV-Sweet", "Riverside · sur-centro · Sweet St.",
         "Residencial sur-centro.", "Oeste → este.", 3, "6380x5580", "x"),
        ("014_Riverside_Sycamore_Ln.pdf", "RV-Sycamore", "Riverside · sur-centro · Sycamore Ln.",
         "Lane residencial sur.", "Norte → sur.", 3, "6420x5600", "y"),
        ("015_Riverside_Dogwood_Rd.pdf", "RV-Dogwood", "Riverside · sur-oeste rural · Dogwood Rd.",
         "Hacia Olin Rd. (KY-163).", "Norte → sur.", 2, "5900x5700", "y"),
        ("016_Riverside_Fern_Rd.pdf", "RV-Fern", "Riverside · sur-oeste rural · Fern Rd.",
         "Sur-oeste hacia industrial.", "Norte → sur.", 2, "5850x5750", "y"),
        ("017_Riverside_Summer_Shade_Rd.pdf", "RV-SummerShade", "Riverside · sur-este · Summer Shade Rd.",
         "Sur-este residencial.", "Oeste → este.", 2, "6480x5750", "x"),
        ("018_Riverside_Easter_Ln.pdf", "RV-Easter", "Riverside · sur-este · Easter Ln.",
         "Lane este-sur.", "Norte → sur.", 2, "6500x5700", "y"),
        ("019_Riverside_Sandy_Rd.pdf", "RV-Sandy", "Riverside · extensión sur · Sandy Rd.",
         "Hacia Country Club / Olin.", "Norte → sur.", 2, "6200x5850", "y"),
        ("020_Riverside_Sawyer_Ln.pdf", "RV-Sawyer", "Riverside · extensión sur · Sawyer Ln.",
         "Extensión sur.", "Norte → sur.", 2, "6250x5900", "y"),
        ("021_Riverside_Nixon_Ln.pdf", "RV-Nixon", "Riverside · extensión sur · Nixon Ln.",
         "Lane sur.", "Oeste → este.", 2, "6350x5800", "x"),
    ]
    for fn, code, title, acceso, orden, n, anc, axis in streets:
        z.append(zone(fn, code, title, m, acceso, orden,
                      "Conteo suburbios Riverside = 70 casas fuera del gated (PZwiki).",
                      houses(title.split("·")[-1].strip(), n, anc, axis)))

    # Gated streets
    kelly = []
    for i in range(1, 13):
        if i == 8:
            kelly.append(b("Kelly Dr. nº 8", "6784x5329", "garaje: tools / gas / posible vehículo raro"))
        else:
            kelly.append(b(f"Kelly Dr. — casa {i}/12", f"{6760+(i-1)*12}x5320", "garaje: tools / gas / posible vehículo"))
    z.append(zone("022_Riverside_Gated_Kelly_Dr.pdf", "RV-Gated-Kelly",
                  "Riverside · comunidad cerrada (este) · Kelly Dr.",
                  m, "Entra por UN solo gate del perímetro este (~6695x5418). No abras todos los gates.",
                  "Recorre Kelly Dr. de oeste a este; nº 8 es el flier July 4th Block Party.",
                  "34 casas en total dentro del gated (PZwiki).", kelly))
    z.append(zone("023_Riverside_Gated_Loop_Norte.pdf", "RV-Gated-N",
                  "Riverside · comunidad cerrada · anillo interior norte",
                  m, "Dentro del gated, tras Kelly Dr., toma el anillo norte.",
                  "Horario empezando en la esquina NO del anillo.",
                  "8 mansiones del anillo norte (parte de las 34).",
                  [(f"Mansión anillo norte {i}/8", f"{6700+(i-1)*14}x5280", "garaje: tools / gas / posible vehículo") for i in range(1, 9)]))
    z.append(zone("024_Riverside_Gated_Loop_Sur.pdf", "RV-Gated-S",
                  "Riverside · comunidad cerrada · anillo interior sur",
                  m, "Dentro del gated, anillo sur.",
                  "Antihorario desde la esquina SE.",
                  "8 mansiones del anillo sur.",
                  [(f"Mansión anillo sur {i}/8", f"{6700+(i-1)*14}x5480", "garaje: tools / gas / posible vehículo") for i in range(1, 9)]))
    z.append(zone("025_Riverside_Gated_Centro.pdf", "RV-Gated-Centro",
                  "Riverside · comunidad cerrada · manzanas centrales",
                  m, "Centro del gated (~6770x5320). Buena zona para base.",
                  "Casa a casa hacia el centro.",
                  "6 mansiones centrales (cierre de las 34).",
                  [(f"Mansión centro {i}/6", f"{6760+(i-1)*12}x5360",
                    "garaje: tools / gas / posible vehículo" + (" · candidata BASE" if i == 3 else ""))
                   for i in range(1, 7)]))

    # Comercial: un PDF por bloque de negocios wiki
    z.append(zone("026_Riverside_Rock_Ridge_Policia_Fossoil.pdf", "RV-RockRidge",
                  "Riverside · distrito comercial oeste · Rock Ridge Rd.",
                  mt, "Sigue Rock Ridge Rd. / Main St. desde suburbios hacia el río.",
                  "Sur → norte por Rock Ridge: Fossoil (#160) luego Police (#210).",
                  "Direcciones wiki/fliers.",
                  [
                      b("Fossoil — 160 Rock Ridge Rd.", "6078x5305", "gas + mapa Riverside"),
                      b("Spiffo's (junto Fossoil)", "6128x5309", "comida"),
                      b("Police Station — 210 Rock Ridge Rd.", "6081x5261", "armas / ammo"),
                  ]))
    z.append(zone("027_Riverside_Riverfront_Oeste.pdf", "RV-RiverOeste",
                  "Riverside · orilla oeste del Ohio · bait / bar / tiendas",
                  mt, "Desde Rock Ridge hacia el oeste, pegado al río.",
                  "Este → oeste por la orilla.",
                  "POIs PZwiki Riverside.",
                  [
                      b("Morris' Bait Shop", "5916x5243", "equipo de pesca"),
                      b("Burgers", "5961x5260", "comida"),
                      b("Bar (Riverside)", "5964x5416", "alcohol"),
                      b("Food market (west)", "5970x5390", "comida"),
                      b("General store (west)", "5970x5356", "suministros"),
                      b("Laundromat (west)", "5952x5388", ""),
                  ]))
    z.append(zone("028_Riverside_Rogers_Ave_Ferreteria.pdf", "RV-Rogers",
                  "Riverside · Rogers Ave · Nails & Nuts y alrededores",
                  mt, "Desde Rock Ridge hacia el este por el strip; Rogers Ave. #15.",
                  "Oeste → este por Rogers / bloque de tiendas.",
                  "",
                  [
                      b("Nails & Nuts Tool Store — 15 Rogers Ave.", "6359x5327", "sledge / axe / tools / seeds / revistas generator"),
                      b("Slimtax Accounting", "6359x5318", ""),
                      b("Spitfire Fashion", "6360x5311", ""),
                      b("Clothing store", "6358x5298", ""),
                      b("Grocery store", "6343x5296", "comida"),
                      b("Seat Yourself Furniture", "6241x5267", "materiales carpintería"),
                      b("Hugo Plush", "6257x5268", ""),
                      b("Time 4 Sport", "6259x5266", "armas melee deportivas"),
                      b("Nourish Food Mart", "6265x5264", "comida"),
                  ]))
    z.append(zone("029_Riverside_Suites_y_Correo.pdf", "RV-Suites",
                  "Riverside · Riverside Suites (hotel) y U.S. Mail",
                  mt, "Strip norte, bloque hotel/correo.",
                  "Hotel habitación a habitación tras recepción.",
                  "",
                  [
                      b("U.S. Mail Service", "6315x5265", "posible base temporal"),
                      b("Riverside Suites (hotel)", "6365x5255", "bolsas / ropa por habitación"),
                      b("Go Flash", "6191x5346", ""),
                      b("Hit Vids!", "6208x5344", "VHS"),
                      b("Liquorty-Split", "6189x5368", "alcohol"),
                      b("Sweet Pea Restaurant", "6192x5341", "comida"),
                      b("Back To The Nurture Chiropractic", "6190x5355", ""),
                      b("Pile o' Crepe", "6396x5303", "comida"),
                  ]))
    z.append(zone("030_Riverside_Strip_Este_Enigma_Pharma.pdf", "RV-StripEste",
                  "Riverside · strip este · Enigma Books / Pharmahug / GigaMart",
                  mt, "Continúa el strip hacia el este hasta GigaMart y la iglesia.",
                  "Oeste → este: Enigma → Pharmahug → GigaMart → Church.",
                  "Loot crítico del pueblo (PZwiki).",
                  [
                      b("Enigma Books", "6429x5265", "skillbooks"),
                      b("Palm Travel", "6421x5265", ""),
                      b("Hair O Genesis", "6411x5266", ""),
                      b("Saucy", "6397x5266", ""),
                      b("Jimmy's", "6445x5265", "comida"),
                      b("Pharmahug", "6468x5266", "meds / antibiotics"),
                      b("Sheba Jewellers", "6473x5266", ""),
                      b("Mama McFudgington's", "6483x5266", "comida"),
                      b("Coin Op Laundromat", "6413x5333", ""),
                      b("Strip mall / toy store block", "6450x5298", ""),
                      b("Knox Bank", "6504x5301", ""),
                      b("Lola Limon", "6505x5266", ""),
                      b("GigaMart", "6515x5350", "comida masiva"),
                      b("Church", "6556x5308", ""),
                      b("Dotty 4 Donuts", "6491x5223", "comida"),
                      b("Churns-R-Us", "6472x5217", ""),
                      b("Riparian Entertainment", "6380x5206", "alcohol"),
                      b("Riverwood Boat Club", "6560x5215", ""),
                  ]))
    z.append(zone("031_Riverside_Escuela.pdf", "RV-Escuela",
                  "Riverside · escuela pública (sur del strip)",
                  m, "Desde GigaMart/strip baja al sur; school ~6443x5441.",
                  "Parking → halls → library → clinic.",
                  "",
                  [
                      b("School — edificio principal", "6443x5441", ""),
                      b("School library", "6430x5450", "skillbooks"),
                      b("School clinic", "6450x5450", "meds menores"),
                  ]))
    z.append(zone("032_Riverside_Cementerio.pdf", "RV-Cementerio",
                  "Riverside · cementerio oeste",
                  m, "Por Cemetary Dr. hacia 5710x5334.",
                  "Perímetro completo.",
                  "",
                  [b("Cemetery", "5710x5334", "")]))
    z.append(zone("033_Riverside_Wrecking_Yard.pdf", "RV-Desguace",
                  "Riverside · desguace / wrecking yard (oeste)",
                  m, "Oeste del pueblo, cerca del río (~5839x5391).",
                  "Gate → office → filas de coches.",
                  "",
                  [
                      b("Wrecking yard — office", "5839x5391", ""),
                      b("Wrecking yard — vehículos", "5839x5391", "coches / scrap / propane / parts"),
                  ]))
    z.append(zone("034_Riverside_Industrial_Olin_Rd.pdf", "RV-Industrial",
                  "Riverside · industrial sur-oeste · Olin Rd. (KY-163)",
                  m, "Baja por Olin Rd. / KY-163 desde suburbios SO. Long Needle Rd. cerca.",
                  "Norte → sur: Gas N More → Al's → Lectromax → U-Store It.",
                  "PZwiki outskirts.",
                  [
                      b("Gas N More", "5429x5870", "gas"),
                      b("Diner (SO)", "5425x5907", "comida"),
                      b("Al's Auto Shop", "5436x5950", "parts / mechanics"),
                      b("Lectromax Manufacturing", "5568x5914", "tools / sledge / industrial / generator posible"),
                      b("U-Store It", "5540x6055", "units: tools / possible generator"),
                      b("Olin Rd. nº 739", "5681x5747", ""),
                      b("Olin Rd. nº 740", "5579x5929", ""),
                      b("Long Needle Rd. zona nº 6650", "5440x5967", ""),
                  ]))
    z.append(zone("035_Riverside_Country_Club.pdf", "RV-CountryClub",
                  "Riverside · West Maple Country Club (sur)",
                  m, "Por Olin Rd. / Lakeshore Parkway al sur (~5772x6416).",
                  "Parking → main hall → gym/ballroom/lockers/bar → greens.",
                  "Rich zombies.",
                  [
                      b("Country Club — parking", "5750x6400", ""),
                      b("West Maple Country Club — main hall", "5772x6416", "loot interior / rich zombies"),
                      b("Country Club — gym", "5780x6440", ""),
                      b("Country Club — ballroom", "5760x6460", ""),
                      b("Country Club — lockers", "5740x6460", ""),
                      b("Country Club — bar", "5770x6475", "alcohol"),
                      b("Country Club — pro shop / annex", "5720x6420", "tools menores"),
                      b("Greens / campo", "5800x6550", ""),
                  ]))
    return z


def rural_and_west():
    m = "Riversidemap.jpg"
    z = []
    # Scenic Grove — 36 mobile homes + house + shed (wiki)
    trailers = [b(f"Mobile home {i:02d}/36", f"{5300+(i%6)*12}x{6000+(i//6)*14}", "") for i in range(1, 37)]
    z.append(zone("036_Rural_Scenic_Grove_Trailer_Park.pdf", "Rural-ScenicGrove",
                  "Zona rural · Scenic Grove Mobile Home Park (sur de Riverside)",
                  m, "Esquina KY-163 y Long Needle Road. Al oeste de Long Needle (PZwiki).",
                  "Office → filas de trailers oeste de Long Needle; luego casa y shed.",
                  "Wiki: 36 mobile homes + 1 casa 1 planta + 1 shed. Este de Long Needle = U-Store/factory (ya en Riverside industrial).",
                  [b("Office / entrada del parque", "5350x6000", "")] + trailers
                  + [b("Casa 1 planta del parque", "5380x6100", ""), b("Shed del parque", "5390x6110", "")]))

    z.append(zone("037_Rural_Long_Branch_Rd.pdf", "Rural-LongBranch",
                  "Zona rural · Long Branch Rd. (oeste de Riverside)",
                  m, "Desde Riverside hacia el oeste; Long Branch Rd. nº 3 @ 5174x5525.",
                  "Este → oeste.",
                  "",
                  [b("Long Branch Rd. nº 3", "5174x5525", "")]
                  + houses("Long Branch Rd.", 4, "5200x5525", "x", 30)))

    z.append(zone("038_Rural_Wilson_Rd.pdf", "Rural-Wilson",
                  "Zona rural · Wilson Rd. (corredor oeste)",
                  m, "Más al oeste; Wilson Rd. nº 575 @ 4214x6264.",
                  "Este → oeste.",
                  "",
                  [b("Wilson Rd. nº 575", "4214x6264", "")]
                  + houses("Wilson Rd.", 3, "4300x6264", "x", 40)))

    z.append(zone("039_Rural_Radio_Relay.pdf", "Rural-Radio",
                  "Zona rural · estación de radio relay (oeste Riverside)",
                  m, "Desde corredor oeste hacia 4843x6280 (PZwiki).",
                  "Perímetro → edificio control → torre.",
                  "",
                  [b("Radio relay station", "4843x6280", "electronics / generator room")]))

    z.append(zone("040_Rural_Abandoned_Town_Tanglewood.pdf", "Rural-Abandoned",
                  "Zona rural · Abandoned town / Tanglewood (oeste Riverside)",
                  m, "Coords wiki ~4048x6154. Poco zombie, poco loot.",
                  "Estructura a estructura: factory C.G.E. / strip / casa habitada.",
                  "",
                  [
                      b("Abandoned town — C.G.E. Corp / factory", "4048x6154", "industrial ligero"),
                      b("Abandoned town — strip mall", "4048x6154", "posible safehouse"),
                      b("Abandoned town — casa en uso", "4048x6154", ""),
                  ] + [(f"Estructura abandonada {i}/8", f"{4000+(i*20)}x6150", "") for i in range(1, 9)]))

    z.append(zone("041_Rural_Farms_Oeste_Riverside.pdf", "Rural-FarmsOeste",
                  "Zona rural · granjas entre Riverside y Brandenburg",
                  m, "Carreteras rurales al oeste de Riverside / hacia Brandenburg.",
                  "Una granja completa (casa+shed+campos) antes de la siguiente.",
                  "",
                  [(f"Granja roadside oeste {i}/10", f"{5000-(i*80)}x{5800+(i%3)*40}", "tools / seeds si spawnean") for i in range(1, 11)]))

    z.append(zone("042_Rural_Doe_Valley_Cabanas.pdf", "Rural-DoeValley",
                  "Zona rural · Doe Valley · cabañas y POIs de bosque",
                  "Fallas_Lake.jpg", "Entre Brandenburg, Riverside, Echo Creek y Fallas Lake.",
                  "Camino forestal → cabaña → perímetro 20 tiles.",
                  "",
                  [(f"Cabaña / POI Doe Valley {i}/12", f"{5000+(i%4)*60}x{7500+(i//4)*80}", "") for i in range(1, 13)]))

    # Brandenburg
    bb = "BrandenburgMap.jpg"
    z.append(zone("043_Brandenburg_Policia_y_Centro.pdf", "BR-Centro",
                  "Brandenburg · centro / policía",
                  bb, "Desde corredor oeste hasta Brandenburg (~2314x6253). Map item: Brandenburg.",
                  "Localiza PD primero, luego comercios del centro.",
                  "",
                  [
                      b("Police Station Brandenburg", "2043x5978", "armas / ammo"),
                      b("Edificios municipales / centro", "2314x6253", ""),
                  ] + houses("Centro Brandenburg", 8, "2250x6200", "x", 16)))
    z.append(zone("044_Brandenburg_Fossoil_Boyd_Rd.pdf", "BR-Fossoil",
                  "Brandenburg · Fossoil · 582 Boyd Rd.",
                  bb, "En Brandenburg, busca Boyd Rd.",
                  "Bombas → tienda → almacén.",
                  "",
                  [
                      b("Fossoil — 582 Boyd Rd.", "2059x6425", "gas + mapa Brandenburg"),
                      b("U-Store It (junto Fossoil, wiki)", "2059x6425", "storage"),
                  ]))
    z.append(zone("045_Brandenburg_Pondview_Nails_Nuts.pdf", "BR-Pondview",
                  "Brandenburg · Pondview Shopping Center · Nails & Nuts",
                  bb, "Pondview Shopping Center (wiki Nails & Nuts).",
                  "Local a local del centro comercial.",
                  "",
                  [
                      b("Nails & Nuts — Pondview Shopping Center", "1943x6361", "tools / sledge"),
                      b("Awl Work (junto, wiki)", "1943x6361", ""),
                      b("Sew Play (junto, wiki)", "1943x6361", ""),
                  ]))
    z.append(zone("046_Brandenburg_Residencial_Norte.pdf", "BR-ResN",
                  "Brandenburg · residencial norte (orilla Ohio)",
                  bb, "Norte de Brandenburg hacia el río.",
                  "Oeste → este, acera norte luego sur.",
                  "",
                  houses("Residencial norte Brandenburg", 14, "2100x6050", "x", 14)))
    z.append(zone("047_Brandenburg_Zona_Tornado.pdf", "BR-Tornado",
                  "Brandenburg · sureste · zona devastada por tornado",
                  bb, "SE de Brandenburg (PZwiki Knox Country / Brandenburg).",
                  "Estructura/ruina a ruina; no saltes escombros accesibles.",
                  "",
                  [(f"Estructura zona tornado {i}/20", f"{2400+(i%5)*18}x{6550+(i//5)*20}", "") for i in range(1, 21)]))

    # Fallas
    fl = "Fallas_Lake.jpg"
    z.append(zone("048_Fallas_Lake_Pueblo.pdf", "FL-Pueblo",
                  "Fallas Lake · pueblo (entre Riverside corridor y Rosewood)",
                  fl, "Desde Old Mill Rd. (desde Muldraugh) o sur desde Riverside corridor. Centro ~7348x8371.",
                  "Police → general store → restaurant → clinic → church → assembly.",
                  "Sin map item propio (PZwiki Map item).",
                  [
                      b("Police Station (Fallas Lake)", "7252x8378", "armas"),
                      b("General store (Fallas Lake)", "7293x8254", "suministros"),
                      b("Restaurant (Fallas Lake)", "7293x8296", "comida"),
                      b("Medical clinic (Fallas Lake)", "7295x8388", "meds"),
                      b("Fallas Lake Church", "7386x8352", ""),
                      b("Assembly hall (Fallas Lake)", "7414x8385", ""),
                  ] + houses("Residencial Fallas Lake", 12, "7300x8200", "x", 14)))
    z.append(zone("049_Fallas_Lake_Orilla_y_Cabanas.pdf", "FL-Lago",
                  "Fallas Lake · orilla del lago y cabañas",
                  fl, "Desde el pueblo hacia el agua.",
                  "Orilla norte → cabañas → orilla sur.",
                  "",
                  [(f"Cabaña del lago {i}/10", f"{7450+(i%5)*14}x{8450+(i//5)*18}", "") for i in range(1, 11)]))

    # Echo Creek
    z.append(zone("050_Echo_Creek_Pueblo.pdf", "EC-Pueblo",
                  "Echo Creek · pueblo rural (B42)",
                  m, "Desde KY-60 / corredor sur-oeste. Centro ~4235x11069.",
                  "Pueblo compacto casa a casa, luego tiendas.",
                  "Sin map item propio.",
                  houses("Residencial Echo Creek", 16, "4150x11020", "x", 14)
                  + [
                      b("Gas / general store Echo Creek", "4235x11069", "gas / supplies"),
                      b("Farm supply / taller", "4280x11100", "tools / farming"),
                      b("Diner / café", "4260x11080", "comida"),
                  ]))
    z.append(zone("051_Echo_Creek_Chicken_Farm_y_Granjas.pdf", "EC-Granjas",
                  "Echo Creek · chicken farm este y granjas",
                  m, "Al este del pueblo Echo Creek.",
                  "Chicken farm completo, luego granjas sur-este una a una.",
                  "",
                  [b("Chicken farm este", "4500x11050", "comida / animals B42")]
                  + [(f"Granja Echo Creek {i}/8", f"{4400+(i*25)}x11200", "tools / seeds") for i in range(1, 9)]))

    # Ekron
    ek = "EkronMap.jpg"
    z.append(zone("052_Ekron_Pueblo_y_Pharmahug.pdf", "EK-Pueblo",
                  "Ekron · pueblo (oeste extremo) · Pharmahug",
                  ek, "Desde Echo Creek al oeste. Tren roto corta main street: usa cruce norte.",
                  "Este residencial → Pharmahug plaza → oeste por puente norte.",
                  "Map item: Ekron.",
                  [
                      b("Pharmahug Ekron (plaza este de las vías)", "402x9870", "meds"),
                  ] + houses("Residencial Ekron este", 10, "1100x9800", "x", 14)
                  + houses("Residencial Ekron oeste", 10, "800x9800", "x", 14)))
    z.append(zone("053_Ekron_Fossoil_Haysville_Steelworks.pdf", "EK-Industrial",
                  "Ekron · Fossoil 104 Haysville Rd. y steelworks",
                  ek, "Sur/outskirts y planta industrial.",
                  "Fossoil → steelworks → naves.",
                  "",
                  [
                      b("Fossoil — 104 Haysville Rd.", "649x9923", "gas + mapa Ekron"),
                      b("Steelworks / planta principal", "1020x9900", "metalworking / tools"),
                      b("Nave industrial secundaria", "950x9950", "industrial"),
                      b("Rail / storage yard", "1100x9920", ""),
                  ]))

    # Irvington
    ir = "IrvingtonMap.jpg"
    z.append(zone("054_Irvington_Pueblo_KY79.pdf", "IR-Pueblo",
                  "Irvington · pueblo sobre Kentucky 79",
                  ir, "Sur-oeste del mapa por KY-79. Centro ~2729x13797.",
                  "Police → Pharmahug → Fossoil → residencial por manzanas.",
                  "Map item: Irvington.",
                  [
                      b("Police Irvington", "2485x13940", "armas"),
                      b("Pharmahug Irvington", "2475x14478", "meds"),
                      b("Fossoil Irvington", "2525x14484", "gas + mapa Irvington"),
                  ] + houses("Residencial Irvington", 24, "2600x13750", "x", 14)))
    z.append(zone("055_Irvington_Speedway.pdf", "IR-Speedway",
                  "Irvington · Irvington Speedway (norte del pueblo)",
                  ir, "Al norte de Irvington.",
                  "Acceso → parking → pits → track perimetral → concessions.",
                  "",
                  [
                      b("Irvington Speedway — complex", "2720x13200", "tools / parts"),
                      b("Speedway — parking", "2720x13150", ""),
                      b("Speedway — pits / garajes", "2750x13250", "parts"),
                      b("Speedway — tribunas / concessions", "2700x13280", "comida"),
                  ]))
    z.append(zone("056_Irvington_Factory_Farms_Este.pdf", "IR-Farms",
                  "Irvington · factory farms del este (livestock)",
                  ir, "Al este de Irvington, campos y naves ganaderas (PZwiki).",
                  "Una granja industrial completa antes de la siguiente.",
                  "",
                  [(f"Factory farm este {i}/8", f"{3200+(i*30)}x13800", "farming / animals") for i in range(1, 9)]))
    return z


def classic():
    z = []
    rw, rwi = "Rosewoodmap.jpg", "Rosewood.jpg"
    z.append(zone("057_Rosewood_North_Main_Comercio.pdf", "RW-Main",
                  "Rosewood · North Main St. · comercio del pueblo",
                  rw, "Entra a Rosewood por North Main St. / carreteras sur. Centro ~8446x11556.",
                  "Norte → sur por North Main: Spiffo's → Pizza → inns → Book Naked → buffet.",
                  "Nombres PZwiki Businesses / Rosewood.",
                  [
                      b("Spiffo's", "8069x11343", "comida"),
                      b("Pizza Whirled", "8074x11308", "comida"),
                      b("Thunder Gas", "8153x11263", "gas"),
                      b("Grocery store", "8142x11386", "comida"),
                      b("Auto shop", "8154x11321", "parts"),
                      b("E¢ono Room$ (motel)", "8074x11416", ""),
                      b("Bright Flag Inn", "8017x11427", "alcohol / comida"),
                      b("Jenny's Table", "8078x11454", "comida"),
                      b("FashionaBelle", "8089x11490", ""),
                      b("Bowling alley", "8079x11505", ""),
                      b("Book Naked", "8082x11506", "skillbooks"),
                      b("Rosewood Country Buffet", "8086x11500", "comida"),
                      b("Laundromat", "8135x11506", ""),
                      b("Rosewood Medical", "8091x11524", "meds"),
                      b("Marple & Christie Legal Services", "8090x11537", ""),
                      b("Haircuts n' More", "8090x11552", ""),
                      b("Church", "8123x11550", ""),
                      b("Palm Travel", "8082x11561", ""),
                      b("Zippee Market", "8105x11578", "comida"),
                      b("Knox Bank", "8081x11588", ""),
                      b("Markson & Co.", "8089x11600", ""),
                      b("Mama McFudgington's", "8082x11616", "comida"),
                      b("Kentucky Court of Justice", "8065x11652", ""),
                  ]))
    z.append(zone("058_Rosewood_Fire_Police.pdf", "RW-FD-PD",
                  "Rosewood · Fire Department y Police Station",
                  rw, "En Rosewood, bloque de emergencias (frente a frente en layout clásico).",
                  "Fire Station primero (base), luego Police.",
                  "",
                  [
                      b("Rosewood Fire Department", "8134x11735", "axes / fire gear / camas — BASE"),
                      b("Police Station Rosewood", "8063x11737", "armas / ammo"),
                  ]))
    z.append(zone("059_Rosewood_Residencial.pdf", "RW-Res",
                  "Rosewood · calles residenciales del pueblo",
                  rw, "Manzanas alrededor de North Main / escuela.",
                  "Calle a calle; impares un lado, pares el otro.",
                  "",
                  houses("Residencial Rosewood", 24, "8300x11480", "x", 14)
                  + [b("Elementary school", "8342x11610", "libros"),
                     b("Bail Bonds", "7992x11449", "")]))
    z.append(zone("060_Rosewood_Fossoil_y_Sur.pdf", "RW-Sur",
                  "Rosewood · sur · Fossoil 2838 Rosewood Rd. y alrededores",
                  rw, "Sur del pueblo por Rosewood Rd.",
                  "Pueblo → Fossoil → bus station → drive-in.",
                  "",
                  [
                      b("Fossoil — 2838 Rosewood Rd.", "8312x12218", "gas + mapa Rosewood"),
                      b("Bus station", "8242x12231", ""),
                      b("Onyx Drive-In Theater", "8425x12246", ""),
                      b("Farmer's market", "9071x12154", "comida / produce"),
                      b("Produce warehouses", "9170x11846", "farming storage"),
                  ]))
    z.append(zone("061_Rosewood_Prision.pdf", "RW-Prision",
                  "Rosewood · Kentucky State Prison",
                  rwi, "Al oeste/sur-oeste de Rosewood (~7718x11881).",
                  "Parking/gates → admin → yards → cell blocks A-D → servicios.",
                  "Peligro máximo del sur.",
                  [
                      b("Kentucky State Prison — parking / gates", "7718x11881", ""),
                      b("Prisión — administration", "7718x11881", "posible armería"),
                      b("Prisión — cell blocks", "7718x11881", "riot gear / armas posibles"),
                      b("Prisión — infirmary", "7718x11881", "meds"),
                      b("Prisión — kitchen / warehouse", "7718x11881", "comida / tools"),
                  ]))
    z.append(zone("062_Rural_Military_Research_Facility.pdf", "Rural-MilLab",
                  "Zona rural · Military Research Facility (cerca Rosewood)",
                  rwi, "POI secreto wiki ~5687x12472 (oeste/sur de Rosewood).",
                  "Aproxima con sigilo; limpia edificio a edificio del complejo.",
                  "",
                  [b("Military Research Facility", "5687x12472", "loot militar / high value")]))

    # March Ridge
    z.append(zone("063_March_Ridge.pdf", "MR-Pueblo",
                  "March Ridge · pueblo housing militar",
                  "Muldraughmap.jpg", "Desde Fiddler's Trail / sur. Centro ~9921x12603. Map: March Ridge.",
                  "Housing → school/community → Pharmahug/food/gas.",
                  "",
                  [
                      b("March Ridge School", "10000x12656", "libros"),
                      b("March Ridge Community Center", "10034x12733", ""),
                      b("Pharmahug March Ridge", "10143x12752", "meds"),
                      b("Food Market March Ridge", "9980x12620", "comida"),
                      b("Gas March Ridge", "9950x12550", "gas + mapa"),
                  ] + houses("Military housing March Ridge", 20, "9800x12520", "x", 14)))

    # Muldraugh split
    mu, mui = "Muldraughmap.jpg", "Muldraugh.jpg"
    z.append(zone("064_Muldraugh_Dixie_Hwy_Norte.pdf", "MU-DixieN",
                  "Muldraugh · Dixie Highway norte · Spiffo's / Knox Bank / moteles",
                  mu, "Entra a Muldraugh por Dixie Highway (31W).",
                  "Norte → sur por Dixie: Smokey's → warehouses → Spiffo's → Bank → Fossoil → Sunstar.",
                  "Nombres PZwiki Businesses.",
                  [
                      b("Smokey's Saloon & Restaurant", "10621x9224", "alcohol / comida"),
                      b("Mass-Genfac Co.", "10617x9313", "warehouse tools"),
                      b("Secure Storage", "10615x9376", "storage / generator posible"),
                      b("Auto shop (Muldraugh)", "10606x9406", "parts"),
                      b("Family Fashion", "10613x9440", ""),
                      b("Buffet", "10629x9441", "comida"),
                      b("Burgers", "10608x9475", "comida"),
                      b("Coin Op Laundromat", "10608x9469", ""),
                      b("Pile o' Crepe", "10621x9511", "comida"),
                      b("Jay's Chicken", "10618x9566", "comida"),
                      b("Bakery", "10619x9609", "comida"),
                      b("Zippee Market", "10605x9613", "comida"),
                      b("Spiffo's", "10623x9651", "comida"),
                      b("H. Smith Attorney", "10650x9651", ""),
                      b("Knox Bank", "10629x9697", ""),
                      b("First Baptist Chapel", "10721x9712", ""),
                      b("Fossoil — 119 Dixie Highway", "10625x9762", "gas + mapa Muldraugh"),
                      b("Sunstar Motel", "10628x9815", "posible zona gun store / motel loot"),
                      b("U-Store It", "10686x9830", "storage"),
                      b("Waites Motel", "10899x9756", ""),
                      b("Food Market", "10850x9763", "comida"),
                  ]))
    z.append(zone("065_Muldraugh_Centro_Escuela_Cortman.pdf", "MU-Centro",
                  "Muldraugh · centro · escuela / Cortman / tiendas",
                  mu, "Centro de Muldraugh tras el strip norte.",
                  "Escuela → appliance/liquor → Cortman → Conven-U-Mart.",
                  "",
                  [
                      b("Appliance store", "10616x9881", "electronics"),
                      b("Liquorty-Split", "10612x9906", "alcohol"),
                      b("Genteel-y Used", "10631x9905", ""),
                      b("Adult Education Center", "10646x9905", "libros"),
                      b("Cafe", "10649x9928", "comida"),
                      b("Muldraugh Elementary", "10618x9968", "libros"),
                      b("Soccer field / basketball", "10668x9978", ""),
                      b("Cortman Medical", "10878x10030", "meds"),
                      b("Conven-U-Mart", "10840x10031", "comida"),
                      b("Baseball field", "10957x9943", ""),
                      b("Coin Op Laundromat (este)", "10917x9844", ""),
                  ]))
    z.append(zone("066_Muldraugh_Sur_PD_Rusty_Rifle.pdf", "MU-Sur",
                  "Muldraugh · sur · Police / The Rusty Rifle / Hit Vids",
                  mu, "Sur por Dixie / Wilson St.",
                  "PD → soup kitchen → Hit Vids → Rusty Rifle → Gas 2 Go.",
                  "",
                  [
                      b("Pizza Whirled", "10606x10111", "comida"),
                      b("Clark Storage", "10708x10121", "storage"),
                      b("Valu In$urance", "10628x10132", ""),
                      b("Bail Bonds", "10629x10138", ""),
                      b("Legal Services", "10626x10156", ""),
                      b("Tattoo 42", "10619x10158", ""),
                      b("Holy Grace Church", "10778x10172", ""),
                      b("Soup kitchen", "10610x10304", "comida"),
                      b("Hair salon", "10610x10323", ""),
                      b("Clothing store", "10611x10331", ""),
                      b("Office complex", "10694x10340", ""),
                      b("Stor-A-Max", "10752x10348", "storage"),
                      b("Book store", "10611x10366", "skillbooks"),
                      b("Police station / Muldraugh PD", "10636x10411", "armas / ammo"),
                      b("L&B Warehousing", "10712x10443", "warehouse"),
                      b("Hit Vids!", "10609x10452", "VHS"),
                      b("Restaurant (Muldraugh)", "10620x10528", "comida"),
                      b("The Rusty Rifle", "10762x10550", "alcohol / posible armas temáticas"),
                      b("Diner", "10619x10561", "comida"),
                      b("Gas 2 Go", "10663x10625", "gas"),
                  ]))
    z.append(zone("067_Muldraugh_McCoy_Logging.pdf", "MU-McCoy",
                  "Muldraugh · oeste · McCoy Logging Co. / Old Mill Rd.",
                  mui, "Desde Muldraugh por Old Mill Road al oeste.",
                  "Yard → warehouses McCoy → T.I.S. Construction.",
                  "",
                  [
                      b("McCoy Logging Co.", "10372x9637", "tools / generators / gas"),
                      b("T.I.S. Construction", "10079x9593", "tools / construction"),
                  ]))
    z.append(zone("068_Muldraugh_Factories_Sur_Railyard.pdf", "MU-IndSur",
                  "Muldraugh · factories sur y railyard este",
                  mui, "Sur/este industrial de Muldraugh.",
                  "Factories → railyard.",
                  "",
                  [
                      b("Factories (sur)", "10095x10940", "industrial / tools"),
                      b("Railyard", "11645x9938", "industrial cargo"),
                      b("Diner (sur extra)", "10110x11151", "comida"),
                  ]))
    z.append(zone("069_Muldraugh_Residencial.pdf", "MU-Res",
                  "Muldraugh · bandas residenciales fuera del strip",
                  mu, "Casas detrás de Dixie Highway, ambos lados.",
                  "Bandas oeste→este; no dejes traseros sin cubrir.",
                  "",
                  houses("Residencial Muldraugh", 28, "10950x9800", "y", 18)))

    # Dixie
    z.append(zone("070_Dixie_Mobile_Park.pdf", "Dixie-Park",
                  "Zona rural / roadside · Dixie Mobile Park (entre Muldraugh y West Point)",
                  mu, "Sobre Dixie Highway, norte de Muldraugh. Enlace Riverside Rd / Tioga Rd.",
                  "Diner/Spiffo's → parking/containers → trailers fila a fila.",
                  "Wiki: trailers con survivor stories; 3 shipping containers en parking.",
                  [
                      b("Diner (Dixie)", "11462x8809", "comida"),
                      b("Spiffo's (Dixie)", "11663x8302", "comida"),
                      b("Parking / shipping containers", "11600x8700", "soda / pop / logs (wiki)"),
                  ] + [(f"Trailer Dixie {i:02d}/24", f"{11550+(i%6)*12}x{8600+(i//6)*14}", "posible firearm en trailer") for i in range(1, 25)]))

    # West Point
    wp = "WestPoint.jpg"
    z.append(zone("071_West_Point_Main_St_Downtown.pdf", "WP-Main",
                  "West Point · Main St. / downtown",
                  wp, "Desde Dixie Hwy por 2nd St. o Clarke Way hacia Main St.",
                  "Oeste → este por Main: Town Hall → DIY → Food Market → GigaMart → gun store.",
                  "Calles: Main, 2nd–10th, Clarke Way (PZwiki Street_names).",
                  [
                      b("West Point Town Hall", "11940x6869", ""),
                      b("Post office", "11961x6912", ""),
                      b("Police station", "11897x6942", "armas"),
                      b("West Point DIY", "11973x6912", "tools"),
                      b("Food Market", "11984x6914", "comida"),
                      b("Furniture store", "11931x6942", ""),
                      b("General store", "11831x6913", "suministros"),
                      b("Knox Bank", "11905x6915", ""),
                      b("Enigma Books", "11895x6886", "skillbooks"),
                      b("Hair O Genesis", "11859x6886", ""),
                      b("Valu In$urance", "11871x6886", ""),
                      b("Dentistry Dr. R. B. Mat, DMD", "11882x6884", ""),
                      b("Medical clinic", "11867x6911", "meds"),
                      b("The Drake", "11906x6852", "alcohol"),
                      b("Bakery", "11907x6866", "comida"),
                      b("Mendy's Eatery", "11903x6880", "comida"),
                      b("Seahorse Coffee", "11963x6882", "comida"),
                      b("Spiffo's", "11978x6812", "comida"),
                      b("Pharmahug", "11932x6802", "meds"),
                      b("Car Fix-Ation", "11897x6807", "parts"),
                      b("Coin Op Laundromat", "11931x6786", ""),
                      b("Thunder Gas", "11824x6870", "gas"),
                      b("GigaMart", "12029x6858", "comida masiva"),
                      b("Motel", "12024x6917", ""),
                      b("Stendo's Firearms Emporium", "12066x6760", "armas / ammo"),
                      b("Twiggy's", "12066x6800", "alcohol"),
                  ]))
    z.append(zone("072_West_Point_2nd_St_Fossoil.pdf", "WP-2nd",
                  "West Point · 2nd Street · Fossoil 205 Second St.",
                  wp, "Sur de West Point por 2nd St. desde Dixie Hwy.",
                  "Sur → norte por 2nd hasta conectar con downtown.",
                  "",
                  [
                      b("Fossoil — 205 Second St.", "12078x7142", "gas + mapa West Point"),
                      b("Burgers", "12078x7076", "comida"),
                      b("Factory", "12141x7085", "industrial"),
                      b("Self storage", "12136x7021", "storage"),
                  ]))
    z.append(zone("073_West_Point_Oeste_Escuela_Cementerio.pdf", "WP-Oeste",
                  "West Point · oeste · school / cemetery / tiendas KY",
                  wp, "Oeste de Main St. hacia school y cementerio.",
                  "Cementerio/church → school → grocery → Zippee/Pizza → American Tire (Clarke Way).",
                  "",
                  [
                      b("Cemetery", "11069x6711", ""),
                      b("Church (oeste)", "11089x6713", ""),
                      b("School", "11342x6774", "libros / posible firearm"),
                      b("Grocery store (oeste)", "11354x6723", "comida"),
                      b("Daycare", "11739x6923", ""),
                      b("Conven-U-Mart", "11670x7037", "comida"),
                      b("Genteel-y Used", "11680x7037", ""),
                      b("Zippee Market", "11663x7069", "comida"),
                      b("Pizza Whirled", "11662x7085", "comida"),
                      b("American Tire (Clarke Way)", "12258x6931", "parts"),
                      b("Diner in the Woods", "12047x7377", "comida"),
                  ]))
    z.append(zone("074_West_Point_Residencial.pdf", "WP-Res",
                  "West Point · residencial (2nd–10th St. / manzanas)",
                  wp, "Manzanas fuera del strip Main St.",
                  "Por calles numeradas 2nd→10th; un lado completo antes del otro.",
                  "",
                  houses("Residencial West Point", 30, "11600x6950", "x", 12)))

    # Valley
    z.append(zone("075_Valley_Station.pdf", "VS",
                  "Valley Station · antesala de Louisville (Dixie Hwy norte)",
                  "LouisvilleMap7.jpg", "Norte por Dixie Hwy desde West Point. Centro ~13056x6031.",
                  "Fossoil → residencial/roadside → exclusion hacia LV.",
                  "Sin map item propio. Busca mapas Louisville 1-9.",
                  [
                      b("Fossoil Valley Station", "12693x6534", "gas · mapas Louisville 1-9"),
                  ] + houses("Valley Station / roadside", 16, "12950x6000", "x", 16)))
    return z


def louisville():
    z = []
    maps = {
        "SW": "LouisvilleMap7.jpg", "W": "LouisvilleMap4.jpg", "C": "LouisvilleMap5.jpg",
        "S": "LouisvilleMap8.jpg", "SE": "LouisvilleMap9.jpg", "E": "LouisvilleMap6.jpg",
        "N": "LouisvilleMap2.jpg", "NE": "LouisvilleMap3.jpg", "NW": "LouisvilleMap1.jpg",
    }
    z.append(zone("076_Louisville_SW_Acceso_y_Fossoil.pdf", "LV-SW",
                  "Louisville · suroeste · acceso Dixie / Fossoil Rockford y Manslick",
                  maps["SW"], "Desde Valley Station: Dixie → exclusion → South 1st / KY-1394 / Farnly Rd.",
                  "Fossoils primero, luego residencial SO.",
                  "Map item: Louisville Southwest.",
                  [
                      b("Fossoil — 4 Rockford Ln.", "12442x3535", "gas"),
                      b("Fossoil — 3259 Manslick Rd.", "12910x3028", "gas"),
                      b("Louisville border camp", "12497x4050", ""),
                      b("South Louisville Elementary", "12970x3223", "libros"),
                      b("South Louisville mall", "13345x3063", "loot masivo"),
                  ] + houses("Residencial Louisville SW", 16, "12400x3400", "x", 16)))
    z.append(zone("077_Louisville_West_Industrial.pdf", "LV-W",
                  "Louisville · oeste · industrial / río / Fossoil refinery",
                  maps["W"], "Desde SW/West edge hacia el río oeste.",
                  "Industrial substation → Fossoil refinery → animal shelter → university edge.",
                  "Map item: Louisville West.",
                  [
                      b("Louisville industrial substation", "12089x1752", "industrial"),
                      b("Fossoil Refinery / industrial park", "12077x1615", "gas / industrial"),
                      b("Louisville Animal Shelter", "12255x1435", ""),
                      b("West riverside house / edge", "12030x2590", "posible BASE"),
                      b("Louisville State University (campus oeste)", "12367x2264", "libros / loot campus"),
                  ] + houses("Residencial Louisville West", 14, "12150x2400", "x", 16)))
    z.append(zone("078_Louisville_Central_PD_Hospital_Core.pdf", "LV-C",
                  "Louisville · central · PD, hospital, library, expo",
                  maps["C"], "Desde oeste/sur hacia downtown.",
                  "PD → library/gallery → expo → hospital → community center.",
                  "Map item: Louisville Central. Nombres PZwiki.",
                  [
                      b("Louisville Police Department and Detention Services — Industry Rd.", "12466x1609", "armas / armor"),
                      b("Brooks Public Library of Louisville", "12559x1468", "skillbooks"),
                      b("Art Gallery of Louisville", "12552x1386", ""),
                      b("Louisville Expo Center", "12956x1298", ""),
                      b("Central Louisville Community Center", "12849x1692", ""),
                      b("Louisville General Hospital", "12936x2047", "meds endgame"),
                      b("Louisville Animal Hospital", "12574x1988", "meds/vet"),
                      b("Louisville Train Station", "12686x2339", ""),
                      b("Louisville Boat Club", "12756x1143", ""),
                  ]))
    z.append(zone("079_Louisville_South.pdf", "LV-S",
                  "Louisville · sur · suburbios y mall sur",
                  maps["S"], "Sur de central / desde SW.",
                  "Residencial sur → mall sur si no lo cubriste en SW.",
                  "Map item: Louisville South.",
                  [b("Police south suburbs", "13221x3086", "armas")]
                  + houses("Residencial Louisville South", 18, "12900x3000", "x", 16)))
    z.append(zone("080_Louisville_SE.pdf", "LV-SE",
                  "Louisville · sureste",
                  maps["SE"], "Desde South hacia el este.",
                  "Manzana a manzana sureste.",
                  "Map item: Louisville Southeast.",
                  houses("Residencial Louisville SE", 16, "13500x3000", "x", 16)))
    z.append(zone("081_Louisville_East_Mansions_PD.pdf", "LV-E",
                  "Louisville · este · East PD y mansions valladas",
                  maps["E"], "Este de la ciudad.",
                  "East PD → residencial → fenced mansions cluster ~14150x2610.",
                  "Map item: Louisville East.",
                  [
                      b("Police eastern suburbs", "13783x2554", "armas"),
                      b("Fenced mansions cluster", "14150x2610", "garajes / vehículos / tools"),
                      b("Louisville Music Festival grounds", "13750x1939", ""),
                  ] + houses("Residencial Louisville East", 14, "13850x2400", "x", 16)
                  + [(f"Mansión vallada {i}/8", f"{14120+(i*14)}x2580", "garaje / loot rico") for i in range(1, 9)]))
    z.append(zone("082_Louisville_North_Mall_Coast.pdf", "LV-N",
                  "Louisville · norte · Grand Ohio Mall / costa",
                  maps["N"], "Norte desde central hacia el Ohio.",
                  "Pharmahug coast → Fossoil mall → Grand Ohio Mall tienda a tienda → Bruiser factory.",
                  "Map items North / usa también NW-NE si solapan.",
                  [
                      b("Pharmahug north coast (cerca mall)", "13235x1291", "meds"),
                      b("Fossoil west of Grand Ohio Mall", "13376x1417", "gas"),
                      b("Grand Ohio Mall", "13520x1264", "loot masivo — tienda a tienda"),
                      b("Louisville Bruiser (bat factory)", "13243x1240", "melee / industrial"),
                      b("Police Expo / north-central", "12968x1366", "armas"),
                      b("Sunset Pines Funeral Home", "13160x1520", ""),
                      b("U-Store It", "13660x1620", "storage"),
                      b("Riding school", "13040x2820", ""),
                  ]))
    z.append(zone("083_Louisville_NE.pdf", "LV-NE",
                  "Louisville · noreste",
                  maps["NE"], "Noreste de la ciudad / map item Northeast.",
                  "Residencial NE casa a casa.",
                  "",
                  houses("Residencial Louisville NE", 14, "13800x1600", "x", 16)))
    z.append(zone("084_Louisville_NW.pdf", "LV-NW",
                  "Louisville · noroeste",
                  maps["NW"], "Noroeste / map item Northwest.",
                  "Residencial NW y orilla.",
                  "",
                  houses("Residencial Louisville NW", 12, "12200x1600", "x", 16)
                  + [(f"Riverfront NW {i}/6", f"{12050+(i*25)}x1400", "") for i in range(1, 7)]))
    return z


def stash_maps():
    """PDFs de mapas anotados (stash) según PZwiki Annotated Map."""
    z = []
    rv = [
        ("RiversideStashMap1", "6801x5487", "SurvivorCache1"),
        ("RiversideStashMap2", "6375x5249", "ToolsCache1"),
        ("RiversideStashMap3", "6207x5346", ""),
        ("RiversideStashMap4", "6784x5328", "SurvivorCache1"),
        ("RiversideStashMap5", "6306x5310", "SurvivorCache1"),
        ("RiversideStashMap6", "6201x5471", "GunCache1"),
        ("RiversideStashMap7", "6629x5330", "SurvivorCache1"),
        ("RiversideStashMap8", "6502x5584", "FoodCache1"),
        ("RiversideStashMap9", "6057x5347", "SurvivorCache1"),
        ("RiversideStashMap10", "6495x5265", ""),
    ]
    for i, (sid, coords, cache) in enumerate(rv, 1):
        imp = f"stash anotado ({cache})" if cache else "casa/POI marcado en mapa anotado"
        z.append(zone(
            f"085_Stash_Riverside_{i:02d}.pdf", f"Stash-RV-{i:02d}",
            f"Mapa anotado · Riverside · {sid}",
            "Riversidemap.jpg",
            "Consigue el Annotated Map en gloveboxes/cadáveres; luego ve a la casa marcada.",
            "Entra solo a la estructura marcada en el mapa anotado.",
            "Fuente: PZwiki Annotated Map (Riverside).",
            [b(f"Casa / edificio marcado — {sid}", coords, imp)],
        ))

    for i, (sid, coords, cache) in enumerate([
        ("RosewoodStashMap1", "8238x11555", "GunCache1"),
        ("RosewoodStashMap2", "8301x11552", "ShotgunCache1"),
        ("RosewoodStashMap3", "8419x11581", "ToolsCache1"),
        ("RosewoodStashMap4", "7995x11451", "FoodCache1"),
    ], 1):
        z.append(zone(
            f"086_Stash_Rosewood_{i:02d}.pdf", f"Stash-RW-{i:02d}",
            f"Mapa anotado · Rosewood · {sid}",
            "Rosewoodmap.jpg",
            "Lee el Annotated Map (Rosewood) y ve a la marca.",
            "Solo la casa/POI marcado.",
            "PZwiki Annotated Map (Rosewood).",
            [b(f"Marca {sid}", coords, f"stash ({cache})")],
        ))

    for i, (sid, coords, cache) in enumerate([
        ("MulStashMap1", "10663x9764", "GunCache1"),
        ("MulStashMap3", "10673x10188", "stash"),
        ("MulStashMap4", "10760x10083", "stash"),
        ("MulStashMap10", "10725x9984", "stash"),
        ("MulStashMap11", "10622x9654", "stash"),
    ], 1):
        z.append(zone(
            f"087_Stash_Muldraugh_{i:02d}.pdf", f"Stash-MU-{i:02d}",
            f"Mapa anotado · Muldraugh · {sid}",
            "Muldraughmap.jpg",
            "Annotated Map (Muldraugh) → casa marcada.",
            "Solo el edificio del stash.",
            "PZwiki Annotated Map.",
            [b(f"Marca {sid}", coords, f"stash ({cache})")],
        ))

    for i, (sid, coords, cache) in enumerate([
        ("WpStashMap1", "10941x6726", "GunCache1"),
        ("WpStashMap11", "11980x6813", "stash"),
        ("WpStashMap13", "10890x6743", "stash"),
        ("WpStashMap14", "11288x6583", "stash"),
    ], 1):
        z.append(zone(
            f"088_Stash_WestPoint_{i:02d}.pdf", f"Stash-WP-{i:02d}",
            f"Mapa anotado · West Point · {sid}",
            "WestPoint.jpg",
            "Annotated Map (West Point) → marca.",
            "Solo la casa marcada (a menudo armas).",
            "PZwiki Annotated Map (West Point).",
            [b(f"Marca {sid}", coords, f"stash ({cache})")],
        ))

    for i, (sid, coords, cache) in enumerate([
        ("BBurgStashMap1", "2174x6011", "GunCache1"),
        ("BBurgStashMap2", "1720x5934", "ToolsCache1"),
        ("BBurgStashMap3", "2132x6344", "GunCache2"),
        ("BBurgStashMap4", "2736x6291", "FoodCache1"),
        ("BBurgStashMap5", "1936x6583", "stash"),
        ("BBurgStashMap6", "1675x6109", "ShotgunCache1"),
        ("BBurgStashMap7", "2243x5820", "SurvivorCache2"),
        ("BBurgStashMap8", "2774x5907", "ToolsCache1"),
    ], 1):
        z.append(zone(
            f"089_Stash_Brandenburg_{i:02d}.pdf", f"Stash-BR-{i:02d}",
            f"Mapa anotado · Brandenburg · {sid}",
            "BrandenburgMap.jpg",
            "Annotated Map (Brandenburg) → marca.",
            "Solo el edificio marcado.",
            "PZwiki Annotated Map (Brandenburg).",
            [b(f"Marca {sid}", coords, f"stash ({cache})")],
        ))
    return z


def write_index(rows: list[dict]):
    pdf = ShortPDF(
        OUT / "000_Indice_Orden_y_Enlaces.pdf",
        "000",
        "Índice · orden de zonas (español) · enlaces al mapa",
        "Riversidemap.jpg",
        acceso="Empieza por Riverside (001+) y sigue el número de archivo.",
        orden="Cada PDF = una zona/calle. Coords del índice enlazan a map.projectzomboid.com",
        note="Sin checklists. → RECOGER solo si hay loot importante. Fuentes: PZwiki.",
    )
    for z in rows:
        pdf.ensure(5 * mm)
        c = pdf.c
        c.setFillColor(INK)
        c.setFont("Mono", 7)
        c.drawString(ML, pdf.y, z["code"][:16])
        c.setFont("Body", 7.5)
        c.drawString(ML + 28 * mm, pdf.y, z["title"][:62])
        # link first building coords if any
        if z["buildings"]:
            coords = z["buildings"][0][1]
            if coords:
                url = map_url(coords)
                c.setFillColor(LINK)
                c.setFont("Mono", 6.5)
                c.drawRightString(PAGE_W - MR, pdf.y, "mapa")
                c.linkURL(url, (PAGE_W - MR - 12 * mm, pdf.y - 1.5 * mm, PAGE_W - MR, pdf.y + 3 * mm), relative=0)
        pdf.y -= 4.2 * mm
    pdf.save()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        if old.suffix in {".pdf", ".txt"}:
            old.unlink()

    zones = riverside() + rural_and_west() + classic() + louisville() + stash_maps()
    # renumber filenames already set; just generate
    print(f"Generando {len(zones)} PDFs...")
    for z in zones:
        path = OUT / z["filename"]
        pdf = ShortPDF(path, z["code"], z["title"], z["map"], z["acceso"], z["orden"], z["note"])
        for name, coords, important in z["buildings"]:
            pdf.building(name, coords, important)
        pdf.save()
        print(f"  {z['filename']} ({len(z['buildings'])})")

    write_index(zones)
    (OUT / "000_LEEEME.txt").write_text(
        "GUÍA CORTA B42.20 — muchas subzonas\n\n"
        "• Un PDF = una zona/calle (también rurales)\n"
        "• Título en español con la zona exacta\n"
        "• Línea Acceso + Orden en calle\n"
        "• Mapa PZwiki\n"
        "• Lista edificio a edificio\n"
        "• → RECOGER solo si hay loot importante\n"
        "• Coords clicables → map.projectzomboid.com\n"
        "• PDFs 085+ = mapas anotados (stash) de la wiki\n\n"
        "Empieza por 000_Indice_Orden_y_Enlaces.pdf\n",
        encoding="utf-8",
    )
    print("OK total", len(zones) + 1)


if __name__ == "__main__":
    main()
