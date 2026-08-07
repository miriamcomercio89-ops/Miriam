#!/usr/bin/env python3
"""Guía corta B42.20: solo edificio a edificio + aviso de loot importante + mapa wiki."""

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

PAGE_W, PAGE_H = A4
ML, MR, MT, MB = 14 * mm, 14 * mm, 14 * mm, 12 * mm
CW = PAGE_W - ML - MR


def fonts():
    pdfmetrics.registerFont(TTFont("DisplayBold", "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/macos/PublicSans-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("BodyBold", "/usr/share/fonts/truetype/macos/PublicSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Mono", "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"))


class ShortPDF:
    def __init__(self, path: Path, code: str, title: str, map_file: str | None, note: str = ""):
        fonts()
        self.path = path
        self.code = code
        self.title = title
        self.map_file = map_file
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
        c.rect(0, PAGE_H - 5 * mm, 22 * mm, 5 * mm, fill=1, stroke=0)
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

    def _header(self):
        c = self.c
        c.setFillColor(INK)
        c.setFont("Mono", 8)
        c.drawString(ML, self.y, self.code)
        self.y -= 6 * mm
        c.setFont("DisplayBold", 16)
        for line in self._wrap(self.title, 34):
            self.ensure(8 * mm)
            c.drawString(ML, self.y, line)
            self.y -= 7 * mm
        if self.note:
            c.setFillColor(SOFT)
            c.setFont("Body", 8.5)
            for line in self._wrap(self.note, 88):
                self.ensure(4.5 * mm)
                c.drawString(ML, self.y, line)
                self.y -= 4 * mm
        self.y -= 2 * mm
        if self.map_file:
            self._map(self.map_file)

    def _map(self, filename: str):
        candidates = [MAPS / filename, MAPS / (Path(filename).stem + ".jpg"), MAPS / (Path(filename).stem + ".png"),
                      ROOT / "assets" / "maps" / filename]
        path = next((c for c in candidates if c.exists()), None)
        if path is None:
            return
        self.ensure(85 * mm)
        img = ImageReader(str(path))
        iw, ih = img.getSize()
        max_w = CW
        max_h = 78 * mm
        scale = min(max_w / iw, max_h / ih)
        w, h = iw * scale, ih * scale
        c = self.c
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.rect(ML, self.y - h - 1 * mm, w + 2 * mm, h + 2 * mm, fill=0, stroke=1)
        c.drawImage(img, ML + 1 * mm, self.y - h, width=w, height=h, preserveAspectRatio=True, mask="auto")
        self.y -= h + 3 * mm
        c.setFillColor(SOFT)
        c.setFont("Mono", 6.5)
        c.drawString(ML, self.y, f"Mapa wiki: {filename}")
        self.y -= 5 * mm

    def building(self, name: str, coords: str = "", important: str = ""):
        self.n += 1
        line = f"{self.n}. {name}"
        if coords:
            line += f"  ·  {coords}"
        # estimate height
        need = 5.2 * mm + (4.5 * mm if important else 0)
        self.ensure(need)
        c = self.c
        c.setFillColor(INK)
        c.setFont("Body", 9)
        c.drawString(ML, self.y, line[:110])
        self.y -= 4.2 * mm
        if important:
            c.setFillColor(WARN)
            c.setFont("BodyBold", 8.5)
            msg = f"   → RECOGER: {important}"
            for part in self._wrap(msg, 95):
                self.ensure(4 * mm)
                c.drawString(ML, self.y, part)
                self.y -= 3.8 * mm
            c.setFillColor(INK)
        self.y -= 1.0 * mm

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


def houses(street: str, count: int, anchor: str):
    """Generate ordinary houses — no loot alerts."""
    try:
        x, y = map(int, anchor.lower().split("x"))
    except Exception:
        x = y = 0
    out = []
    for i in range(1, count + 1):
        coords = f"{x + (i-1)*8}x{y + ((i-1)%3)*4}" if x else ""
        out.append((f"{street} — casa {i}/{count}", coords, ""))
    return out


# ---------- ZONE DATA (wiki-based) ----------
# Each zone: (filename, code, title, map_png, note, buildings[(name,coords,important)])

def riverside_zones():
    m = "Riversidemap.jpg"
    m2 = "riverside_tourist.jpg"
    zones = []

    # Suburbios split
    zones.append(("01_RV_Suburbios_Courts.pdf", "RV-01", "Riverside — Courts (spawn)", m,
                  "70 casas fuera del gated (PZwiki). Esta subzona: courts sur-centro.",
                  houses("Pine Court", 5, "6300x5600")
                  + houses("Mary Court", 5, "6320x5620")
                  + houses("Marvin Place", 5, "6280x5580")
                  + houses("Maria Place", 4, "6260x5610")))

    zones.append(("02_RV_Suburbios_Oeste.pdf", "RV-02", "Riverside — Suburbios oeste", m,
                  "Calles Walnut / Granite / Cemetary Dr. / Ohio St.",
                  houses("Walnut St.", 5, "6150x5550")
                  + houses("Granite St.", 4, "6120x5580")
                  + houses("Cemetary Dr.", 4, "5800x5350")
                  + houses("Ohio St.", 4, "6000x5500")
                  + [("Cemetery", "5710x5334", "")]))

    zones.append(("03_RV_Suburbios_Este_Frontera.pdf", "RV-03", "Riverside — Este (antes del gated)", m,
                  "Para al ver la valla. El gated es RV-05/06.",
                  houses("Kennedy St.", 4, "6550x5450")
                  + houses("Lincoln St.", 4, "6580x5480")
                  + houses("Kavanagh St.", 3, "6620x5500")))

    zones.append(("04_RV_Suburbios_Sur.pdf", "RV-04", "Riverside — Suburbios sur", m,
                  "Sur del colegio / hacia Olin Rd.",
                  houses("Grove St.", 3, "6400x5550")
                  + houses("Sweet St.", 3, "6380x5580")
                  + houses("Sycamore Ln.", 3, "6420x5600")
                  + houses("Dogwood Rd.", 2, "5900x5700")
                  + houses("Fern Rd.", 2, "5850x5750")
                  + houses("Summer Shade Rd.", 2, "6480x5750")
                  + houses("Easter Ln.", 2, "6500x5700")
                  + houses("Sandy Rd.", 2, "6200x5850")
                  + houses("Sawyer Ln.", 2, "6250x5900")
                  + houses("Nixon Ln.", 2, "6350x5800")))

    kelly = []
    for i in range(1, 13):
        if i == 8:
            kelly.append(("Kelly Dr. #8", "6784x5329", "garaje: tools / gas / posible vehículo raro"))
        else:
            kelly.append((
                f"Kelly Dr. — casa {i}/12",
                f"{6760+(i-1)*12}x{5320+(i%3)*6}",
                "garaje: tools / gas / posible vehículo",
            ))
    zones.append(("05_RV_Gated_Kelly_Dr.pdf", "RV-05", "Riverside — Gated: Kelly Dr.", m,
                  "Comunidad cerrada ~6695x5418. 12 casas en Kelly Dr. (incl. #8 @ 6784x5329).",
                  kelly))

    zones.append(("06_RV_Gated_Interior.pdf", "RV-06", "Riverside — Gated: interior (22 casas)", m,
                  "Resto del gated hasta 34. Elige una mansión central como base.",
                  [(f"Gated loop norte — casa {i}/8", f"{6700+(i-1)*14}x5280", "garaje: tools / gas / posible vehículo") for i in range(1, 9)]
                  + [(f"Gated loop sur — casa {i}/8", f"{6700+(i-1)*14}x5480", "garaje: tools / gas / posible vehículo") for i in range(1, 9)]
                  + [(f"Gated centro — casa {i}/6", f"{6760+(i-1)*12}x5360", "garaje: tools / gas / posible vehículo" + (" · candidata BASE" if i == 3 else "")) for i in range(1, 7)]))

    zones.append(("07_RV_Strip_Oeste_Rock_Ridge.pdf", "RV-07", "Riverside — Strip oeste (Rock Ridge Rd.)", m2,
                  "Eje Rock Ridge / riverfront oeste. Fuentes: PZwiki Riverside.",
                  [
                      ("Police Station — 210 Rock Ridge Rd.", "6081x5261", "armas / ammo (únicas fiables del pueblo)"),
                      ("Fossoil — 160 Rock Ridge Rd.", "6078x5305", "gas + mapa Riverside"),
                      ("Spiffo's", "6128x5309", "comida rápida"),
                      ("Morris' Bait Shop", "5916x5243", "equipo de pesca"),
                      ("Bar (Riverside)", "5964x5416", "alcohol (molotovs)"),
                      ("Food market (west)", "5970x5390", "comida"),
                      ("General store (west)", "5970x5356", "suministros generales"),
                      ("Laundromat (west)", "5952x5388", ""),
                      ("Burgers", "5961x5260", "comida"),
                      ("Wrecking yard (entrada zona)", "5839x5391", "ver RV-12 — coches/parts"),
                  ]))

    zones.append(("08_RV_Strip_Rogers_Suites.pdf", "RV-08", "Riverside — Rogers Ave / Suites", m2,
                  "15 Rogers Ave = Nails & Nuts. Hotel Riverside Suites.",
                  [
                      ("Nails & Nuts Tool Store — 15 Rogers Ave.", "6359x5327", "sledge / axe / tools / seeds / revistas generator"),
                      ("Slimtax Accounting", "6359x5318", ""),
                      ("Spitfire Fashion", "6360x5311", ""),
                      ("Clothing store", "6358x5298", ""),
                      ("Grocery store", "6343x5296", "comida"),
                      ("Riverside Suites (hotel)", "6365x5255", "loot habitación a habitación; ropa/bolsas"),
                      ("Seat Yourself Furniture", "6241x5267", "materiales carpintería"),
                      ("Hugo Plush", "6257x5268", ""),
                      ("Time 4 Sport", "6259x5266", "armas melee deportivas"),
                      ("Nourish Food Mart", "6265x5264", "comida"),
                      ("U.S. Mail Service", "6315x5265", "posible base temporal / storage"),
                      ("Pile o' Crepe", "6396x5303", "comida"),
                      ("Go Flash", "6191x5346", ""),
                      ("Hit Vids!", "6208x5344", "VHS"),
                      ("Liquorty-Split", "6189x5368", "alcohol"),
                      ("Sweet Pea Restaurant", "6192x5341", "comida"),
                      ("Back To The Nurture Chiropractic", "6190x5355", ""),
                  ]))

    zones.append(("09_RV_Strip_Este_Enigma_Giga.pdf", "RV-09", "Riverside — Strip este / GigaMart", m2,
                  "Pharmahug, Enigma Books, GigaMart — loot crítico del pueblo.",
                  [
                      ("Enigma Books", "6429x5265", "skillbooks (prioridad)"),
                      ("Palm Travel", "6421x5265", ""),
                      ("Hair O Genesis", "6411x5266", ""),
                      ("Saucy", "6397x5266", ""),
                      ("Jimmy's", "6445x5265", "comida"),
                      ("Pharmahug", "6468x5266", "meds / antibiotics / painkillers"),
                      ("Sheba Jewellers", "6473x5266", ""),
                      ("Mama McFudgington's", "6483x5266", "comida"),
                      ("Coin Op Laundromat", "6413x5333", ""),
                      ("Strip mall block", "6450x5298", "locales del bloque"),
                      ("Knox Bank", "6504x5301", ""),
                      ("Lola Limon", "6505x5266", ""),
                      ("GigaMart", "6515x5350", "comida masiva no perecedera"),
                      ("Church", "6556x5308", ""),
                      ("Dotty 4 Donuts", "6491x5223", "comida"),
                      ("Churns-R-Us", "6472x5217", ""),
                      ("Riparian Entertainment", "6380x5206", "alcohol"),
                      ("Riverwood Boat Club", "6560x5215", ""),
                  ]))

    zones.append(("10_RV_Escuela.pdf", "RV-10", "Riverside — Escuela", m,
                  "School ~6443x5441 (sur del strip).",
                  [
                      ("School — halls / aulas", "6443x5441", ""),
                      ("School library", "6430x5450", "skillbooks"),
                      ("School clinic", "6450x5450", "meds menores"),
                  ]))

    zones.append(("11_RV_Industrial_SO.pdf", "RV-11", "Riverside — Industrial SO (Olin Rd / KY-163)", m,
                  "Lectromax, U-Store It, Al's Auto, Gas N More. PZwiki outskirts.",
                  [
                      ("Lectromax Manufacturing", "5568x5914", "tools pesados / sledge / industrial / generator posible"),
                      ("U-Store It", "5540x6055", "units: tools / possible generator"),
                      ("Al's Auto Shop", "5436x5950", "parts / mechanics"),
                      ("Gas N More", "5429x5870", "gas"),
                      ("Diner (SO)", "5425x5907", "comida"),
                      ("Olin Rd. #739 (casa roadside)", "5681x5747", ""),
                      ("Olin Rd. #740 (casa roadside)", "5579x5929", ""),
                      ("Long Needle Rd. área #6650", "5440x5967", ""),
                  ]))

    zones.append(("12_RV_Wrecking_Yard.pdf", "RV-12", "Riverside — Wrecking yard", m,
                  "Desguace oeste ~5839x5391.",
                  [
                      ("Wrecking yard — office", "5839x5391", ""),
                      ("Wrecking yard — filas de vehículos", "5839x5391", "coches / scrap / propane / parts"),
                  ]))

    zones.append(("13_RV_Country_Club.pdf", "RV-13", "Riverside — West Maple Country Club", m,
                  "Lakeshore Parkway / ~5772x6416. Rich zombies.",
                  [
                      ("Country Club — parking", "5750x6400", ""),
                      ("Country Club — main hall", "5772x6416", "loot interior / posibles armas en rich zombies"),
                      ("Country Club — gym", "5780x6440", ""),
                      ("Country Club — ballroom", "5760x6460", ""),
                      ("Country Club — lockers", "5740x6460", ""),
                      ("Country Club — bar", "5770x6475", "alcohol"),
                      ("Country Club — pro shop / annex", "5720x6420", "tools menores"),
                      ("Greens / campo", "5800x6550", ""),
                  ]))

    return zones


def west_zones():
    z = []
    z.append(("14_Corredor_Scenic_Grove.pdf", "W-01", "Scenic Grove Mobile Home Park", "Riversidemap.jpg",
              "Esquina KY-163 & Long Needle Rd. ~5350x6020 (PZwiki).",
              [("Office / entrada Scenic Grove", "5350x6000", "")]
              + [(f"Mobile home {i:02d}/28", f"{5320+(i%7)*10}x{6020+(i//7)*12}", "") for i in range(1, 29)]))

    z.append(("15_Corredor_Radio_Abandoned.pdf", "W-02", "Radio relay + Abandoned town", "Riversidemap.jpg",
              "Radio 4843x6280 · Abandoned town 4048x6154 (PZwiki).",
              [
                  ("Radio relay station", "4843x6280", "electronics / generator room"),
                  ("Abandoned town — C.G.E. / factory area", "4048x6154", "industrial ligero"),
                  ("Abandoned town — strip mall / estructuras", "4048x6154", "posible safehouse"),
                  ("Long Branch Rd. #3", "5174x5525", ""),
                  ("Wilson Rd. #575", "4214x6264", ""),
              ] + [(f"Casa roadside corredor {i}/10", f"{4800-(i*40)}x{6100+(i%3)*20}", "") for i in range(1, 11)]))

    z.append(("16_Brandenburg_Norte_Centro.pdf", "BR-01", "Brandenburg — norte / centro", "BrandenburgMap.jpg",
              "Centro ~2314x6253. Map item: Brandenburg.",
              [
                  ("Police Station Brandenburg", "2043x5978", "armas / ammo"),
                  ("Fossoil — 582 Boyd Rd.", "2059x6425", "gas + mapa Brandenburg"),
                  ("Nails & Nuts — Pondview Shopping Center", "1943x6361", "tools / sledge"),
                  ("U-Store It (junto Fossoil, wiki)", "2059x6425", "storage units"),
              ] + [(f"Casa Brandenburg N/centro {i}/20", f"{2200+(i%8)*20}x{6100+(i//8)*25}", "") for i in range(1, 21)]
              + [(f"Local comercial centro {i}/8", f"{2300+(i*12)}x6220", "loot comercial") for i in range(1, 9)]))

    z.append(("17_Brandenburg_Sur_Tornado.pdf", "BR-02", "Brandenburg — sur / zona tornado", "BrandenburgMap.jpg",
              "SE devastado por tornado (PZwiki Knox Country / Brandenburg).",
              [(f"Estructura zona tornado {i}/20", f"{2400+(i%6)*18}x{6550+(i//6)*20}", "") for i in range(1, 21)]
              + [(f"Casa Brandenburg sur {i}/12", f"{2100+(i%6)*18}x{6450+(i//6)*20}", "") for i in range(1, 13)]))

    z.append(("18_Fallas_Lake.pdf", "FL-01", "Fallas Lake", "Fallas_Lake.jpg",
              "Centro ~7348x8371. Police ~7252x8378. Sin map item propio.",
              [
                  ("Police Station Fallas Lake", "7252x8378", "armas"),
                  ("Gas / servicios Fallas Lake", "7350x8350", "gas"),
              ] + [(f"Casa Fallas Lake {i}/18", f"{7200+(i%6)*16}x{8200+(i//6)*22}", "") for i in range(1, 19)]
              + [(f"Cabaña lago {i}/10", f"{7450+(i%5)*14}x{8450+(i//5)*18}", "") for i in range(1, 11)]))

    z.append(("19_Echo_Creek.pdf", "EC-01", "Echo Creek", "Riversidemap.jpg",
              "Centro ~4235x11069. Pueblo rural B42 + chicken farm este.",
              [(f"Casa Echo Creek {i}/16", f"{4150+(i%5)*16}x{11020+(i//5)*20}", "") for i in range(1, 17)]
              + [
                  ("Gas / general store Echo Creek", "4235x11069", "gas / supplies"),
                  ("Farm supply / taller", "4280x11100", "tools / farming"),
                  ("Chicken farm este", "4500x11050", "comida / animals B42"),
              ] + [(f"Granja Echo Creek {i}/8", f"{4400+(i*25)}x11200", "tools / seeds") for i in range(1, 9)]))

    z.append(("20_Ekron.pdf", "EK-01", "Ekron", "EkronMap.jpg",
              "Centro ~1020x9838. Tren bloquea main street — cruza más al norte.",
              [
                  ("Pharmahug Ekron (plaza este vías)", "402x9870", "meds"),
                  ("Fossoil — 104 Haysville Rd.", "649x9923", "gas + mapa Ekron"),
                  ("Steelworks / planta principal", "1020x9900", "metalworking / tools industriales"),
              ] + [(f"Casa Ekron {i}/18", f"{900+(i%6)*18}x{9780+(i//6)*22}", "") for i in range(1, 19)]
              + [(f"Local / nave Ekron {i}/10", f"{1000+(i*12)}x9850", "loot industrial/comercial") for i in range(1, 11)]))

    z.append(("21_Irvington_Pueblo.pdf", "IR-01", "Irvington — pueblo", "IrvingtonMap.jpg",
              "Centro ~2729x13797. Eje KY-79.",
              [
                  ("Police Irvington", "2485x13940", "armas"),
                  ("Pharmahug Irvington", "2475x14478", "meds"),
                  ("Fossoil Irvington", "2525x14484", "gas + mapa Irvington"),
              ] + [(f"Casa Irvington {i}/30", f"{2500+(i%8)*16}x{13700+(i//8)*22}", "") for i in range(1, 31)]
              + [(f"Local Irvington {i}/10", f"{2700+(i*12)}x13820", "loot comercial") for i in range(1, 11)]))

    z.append(("22_Irvington_Speedway_Farms.pdf", "IR-02", "Irvington — Speedway + farms este", "IrvingtonMap.jpg",
              "Speedway al norte del pueblo; factory farms al este.",
              [
                  ("Irvington Speedway — complex", "2720x13200", "tools / parts / concessions"),
              ] + [(f"Factory farm este {i}/8", f"{3200+(i*30)}x13800", "farming / animals") for i in range(1, 9)]))

    return z


def classic_zones():
    z = []
    z.append(("23_Rosewood_Pueblo.pdf", "RW-01", "Rosewood — pueblo", "Rosewoodmap.jpg",
              "Calles: North Main St., Rosewood Rd., Flaherty Rd.… Fire Station = mejor base.",
              [
                  ("Fire Station Rosewood", "8450x11500", "axes / fire gear / camas — BASE recomendada"),
                  ("Police Station Rosewood", "8063x11737", "armas / ammo"),
                  ("Fossoil — 2838 Rosewood Rd.", "8312x12218", "gas + mapa Rosewood"),
                  ("Town Hall", "8420x11580", ""),
                  ("School / schoolhouse", "8500x11650", "libros"),
                  ("Grocery / food", "8520x11540", "comida"),
              ] + [(f"Casa Rosewood {i}/28", f"{8300+(i%7)*16}x{11450+(i//7)*22}", "") for i in range(1, 29)]
              + [(f"Local Rosewood {i}/8", f"{8440+(i*12)}x11570", "") for i in range(1, 9)]))

    z.append(("24_Rosewood_Prision.pdf", "RW-02", "Rosewood — Kentucky State Penitentiary", "Rosewood.jpg",
              "Limpiar ala por ala. Máximo peligro del sur.",
              [
                  ("Prisión — parking / gates", "8600x11700", ""),
                  ("Prisión — administration", "8600x11700", "posible armería admin"),
                  ("Prisión — visitation", "8600x11700", ""),
                  ("Prisión — cell block A", "8600x11700", "riot gear / armas posibles"),
                  ("Prisión — cell block B", "8600x11700", "riot gear / armas posibles"),
                  ("Prisión — cell block C", "8600x11700", "riot gear / armas posibles"),
                  ("Prisión — cell block D", "8600x11700", "riot gear / armas posibles"),
                  ("Prisión — infirmary", "8600x11700", "meds"),
                  ("Prisión — kitchen / mess", "8600x11700", "comida"),
                  ("Prisión — workshop / warehouse", "8600x11700", "tools"),
                  ("Prisión — solitary / laundry", "8600x11700", ""),
              ]))

    z.append(("25_March_Ridge.pdf", "MR-01", "March Ridge", "Muldraughmap.jpg",
              "Centro ~9921x12603. Housing militar + business compacto. Map: March Ridge.",
              [
                  ("Pharmahug March Ridge", "10143x12752", "meds"),
                  ("Food Market March Ridge", "9980x12620", "comida"),
                  ("Gas March Ridge", "9950x12550", "gas + mapa"),
              ] + [(f"Military housing {i}/24", f"{9800+(i%6)*16}x{12500+(i//6)*20}", "") for i in range(1, 25)]
              + [(f"Local March Ridge {i}/8", f"{9900+(i*12)}x12600", "") for i in range(1, 9)]))

    z.append(("26_Muldraugh_Sur_Centro.pdf", "MU-01", "Muldraugh — sur / centro", "Muldraughmap.jpg",
              "Dixie Hwy · Wilson St PD · Fossoil 119 Dixie Hwy.",
              [
                  ("Fossoil — 119 Dixie Highway", "10625x9762", "gas + mapa Muldraugh"),
                  ("Muldraugh Police — 230 Wilson St.", "10636x10408", "armas / ammo"),
                  ("Spiffo's Muldraugh", "11180x9750", "comida"),
                  ("Cortman Medical", "11220x9680", "meds"),
                  ("Gun store / Sunstar zone", "11240x9600", "armas / ammo (alto valor)"),
                  ("Grocery / food stores", "11190x9720", "comida"),
              ] + [(f"Casa Muldraugh sur-centro {i}/24", f"{11050+(i%6)*18}x{9900+(i//6)*28}", "") for i in range(1, 25)]
              + [(f"Local Muldraugh {i}/12", f"{11160+(i*10)}x9760", "") for i in range(1, 13)]))

    z.append(("27_Muldraugh_Norte_McCoy_Dixie.pdf", "MU-02", "Muldraugh — norte / McCoy / Dixie", "Muldraugh.jpg",
              "Old Mill Rd → McCoy. Dixie Mobile Park @ Riverside Rd / Tioga Rd.",
              [
                  ("McCoy Logging Warehouse", "10300x9400", "tools / generators / gas"),
                  ("Warehouses norte", "11050x9200", "tools / electronics / parts — candidata BASE"),
              ] + [(f"Casa Muldraugh norte {i}/14", f"{11050+(i%5)*18}x{9300+(i//5)*22}", "") for i in range(1, 15)]
              + [("Dixie Mobile Park — office", "11650x8800", "")]
              + [(f"Trailer Dixie {i}/20", f"{11620+(i%5)*12}x{8850+(i//5)*14}", "posible firearm en trailer") for i in range(1, 21)]))

    z.append(("28_West_Point_Oeste_Main.pdf", "WP-01", "West Point — oeste / Main St.", "WestPoint.jpg",
              "Main St., 2nd–10th, Clarke Way. Fossoil 205 Second St. Densidad alta.",
              [
                  ("Fossoil — 205 Second St.", "12078x7142", "gas + mapa West Point"),
                  ("Police West Point", "11902x6945", "armas"),
                  ("Pharmahug West Point", "11929x6804", "meds"),
                  ("Gun store West Point", "11600x6850", "armas / ammo"),
                  ("GigaMart West Point", "11620x6800", "comida masiva"),
                  ("Hardware West Point", "11540x6880", "tools"),
                  ("Enigma Books / shops Main St.", "11895x6890", "skillbooks"),
              ] + [(f"Casa West Point W/Main {i}/22", f"{11400+(i%6)*16}x{6900+(i//6)*20}", "") for i in range(1, 23)]
              + [(f"Local Main/downtown {i}/14", f"{11560+(i*10)}x6910", "") for i in range(1, 15)]))

    z.append(("29_West_Point_Este_AMZ_School.pdf", "WP-02", "West Point — este / AMZ / school", "WestPoint.jpg",
              "AMZ steel factory · secondary school · riverfront.",
              [
                  ("AMZ steel factory", "11850x7050", "industrial / metal"),
                  ("Secondary school", "11700x7000", "libros / posible firearm"),
                  ("Art gallery", "11640x6930", ""),
                  ("Sunset Bar", "11520x6900", "alcohol"),
              ] + [(f"Casa West Point este {i}/16", f"{11750+(i%5)*16}x{7000+(i//5)*20}", "") for i in range(1, 17)]
              + [(f"Riverfront WP {i}/8", f"{11500+(i*20)}x6600", "") for i in range(1, 9)]))

    z.append(("30_Valley_Station.pdf", "VS-01", "Valley Station — acceso Louisville", "LouisvilleMap7.jpg",
              "Centro ~13056x6031. Fossoil ~12693x6534. Sin map item propio.",
              [
                  ("Fossoil Valley Station", "12693x6534", "gas · busca mapas Louisville 1-9"),
              ] + [(f"Casa / POI Valley Station {i}/16", f"{12950+(i%5)*18}x{6000+(i//5)*22}", "") for i in range(1, 17)]
              + [(f"Roadside hacia Louisville {i}/8", f"{13200+(i*20)}x{5600-(i*30)}", "") for i in range(1, 9)]))

    return z


def louisville_zones():
    z = []
    lv_maps = {
        "NW": "LouisvilleMap1.jpg",
        "N": "LouisvilleMap2.jpg",
        "NE": "LouisvilleMap3.jpg",
        "W": "LouisvilleMap4.jpg",
        "C": "LouisvilleMap5.jpg",
        "E": "LouisvilleMap6.jpg",
        "SW": "LouisvilleMap7.jpg",
        "S": "LouisvilleMap8.jpg",
        "SE": "LouisvilleMap9.jpg",
    }
    z.append(("31_LV_SW.pdf", "LV-SW", "Louisville — Southwest", lv_maps["SW"],
              "Map item: Louisville Southwest. Entrada desde Dixie / exclusion.",
              [
                  ("Fossoil — 4 Rockford Ln.", "12442x3535", "gas"),
                  ("Fossoil — 3259 Manslick Rd.", "12910x3028", "gas"),
              ] + [(f"Casa / edificio LV-SW {i}/24", f"{12300+(i%6)*18}x{3200+(i//6)*25}", "") for i in range(1, 25)]))

    z.append(("32_LV_West.pdf", "LV-W", "Louisville — West", lv_maps["W"],
              "Map item: Louisville West. Industrial park / river west.",
              [
                  ("Fossoil industrial / refinery area", "12077x1615", "gas / industrial"),
                  ("West riverside / edge base candidate", "12030x2590", "posible BASE"),
                  ("Pawn shop area", "12370x1480", "loot variado"),
              ] + [(f"Casa / edificio LV-West {i}/22", f"{12100+(i%6)*18}x{2300+(i//6)*25}", "") for i in range(1, 23)]))

    z.append(("33_LV_Central.pdf", "LV-C", "Louisville — Central", lv_maps["C"],
              "Map item: Louisville Central. Downtown.",
              [
                  ("Louisville PD / Detention — 635 Industry Rd.", "12496x1615", "armas / armor"),
                  ("Downtown block comercial", "12970x2230", "loot urbano denso"),
              ] + [(f"Bloque / edificio Central {i}/20", f"{12900+(i%5)*16}x{2100+(i//5)*20}", "") for i in range(1, 21)]))

    z.append(("34_LV_South.pdf", "LV-S", "Louisville — South", lv_maps["S"],
              "Map item: Louisville South. Hospital zone.",
              [
                  ("Louisville Hospital / medical south", "13118x2126", "meds endgame"),
                  ("Pharmahug south (cerca hospital)", "13118x2126", "meds"),
                  ("Police south suburbs", "13221x3086", "armas"),
              ] + [(f"Casa LV-South {i}/20", f"{12850+(i%5)*18}x{2900+(i//5)*22}", "") for i in range(1, 21)]))

    z.append(("35_LV_SE.pdf", "LV-SE", "Louisville — Southeast", lv_maps["SE"],
              "Map item: Louisville Southeast.",
              [(f"Casa / edificio LV-SE {i}/18", f"{13500+(i%5)*18}x{2900+(i//5)*22}", "") for i in range(1, 19)]))

    z.append(("36_LV_East.pdf", "LV-E", "Louisville — East", lv_maps["E"],
              "Map item: Louisville East. Mansions + East PD.",
              [
                  ("Police eastern suburbs", "13783x2554", "armas"),
                  ("Fenced mansions cluster", "14150x2610", "garajes / vehículos / tools"),
              ] + [(f"Casa LV-East {i}/18", f"{13800+(i%5)*18}x{2400+(i//5)*22}", "") for i in range(1, 19)]
              + [(f"Mansion vallada {i}/10", f"{14100+(i%5)*16}x{2550+(i//5)*18}", "garaje / loot rico") for i in range(1, 11)]))

    z.append(("37_LV_North_NE_NW.pdf", "LV-N", "Louisville — North / NE / NW", lv_maps["N"],
              "Mapas: North, Northeast, Northwest. Mall / coast.",
              [
                  ("Pharmahug north coast (cerca Grand Ohio Mall)", "13235x1291", "meds"),
                  ("Fossoil west of Grand Ohio Mall", "13376x1417", "gas"),
                  ("Grand Ohio Mall / mall complex", "13520x1264", "loot masivo — tienda a tienda"),
                  ("Police Expo / north-central", "12968x1366", "armas"),
                  ("Sunset Pines Funeral Home", "13160x1520", ""),
                  ("U-Store It", "13660x1620", "storage / possible generator"),
                  ("Riding school", "13040x2820", ""),
              ] + [(f"Casa / edificio LV-Norte {i}/16", f"{13000+(i%5)*18}x{1500+(i//5)*22}", "") for i in range(1, 17)]))

    return z


def write_index(all_files: list[tuple[str, str, str]]):
    pdf = ShortPDF(OUT / "00_Indice_y_Orden.pdf", "00", "Índice — orden de subzonas",
                   "Riversidemap.jpg",
                   "Solo edificio a edificio. Sin checklists. → RECOGER solo si hay loot importante. Mapas: PZwiki.")
    pdf.c.setFillColor(SOFT)
    pdf.c.setFont("Body", 8.5)
    pdf.ensure(6 * mm)
    for fn, code, title in all_files:
        pdf.ensure(5 * mm)
        pdf.c.setFillColor(INK)
        pdf.c.setFont("Mono", 7.5)
        pdf.c.drawString(ML, pdf.y, f"{code}")
        pdf.c.setFont("Body", 8)
        pdf.c.drawString(ML + 18 * mm, pdf.y, title[:70])
        pdf.y -= 4.5 * mm
    pdf.save()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.pdf"):
        old.unlink()
    for old in OUT.glob("*.txt"):
        old.unlink()

    zones = riverside_zones() + west_zones() + classic_zones() + louisville_zones()
    index_rows = []
    print(f"Generando {len(zones)} PDFs cortos...")
    for filename, code, title, mapf, note, buildings in zones:
        path = OUT / filename
        pdf = ShortPDF(path, code, title, mapf, note)
        for name, coords, important in buildings:
            pdf.building(name, coords, important)
        pdf.save()
        index_rows.append((filename, code, title))
        print(f"  {filename} ({len(buildings)} edificios)")

    write_index(index_rows)
    (OUT / "00_LEEEME.txt").write_text(
        "GUÍA CORTA B42.20 — Limpieza total\n\n"
        "Formato: un PDF por subzona.\n"
        "Contenido: mapa wiki + lista numerada de casas/edificios.\n"
        "Solo aparece → RECOGER cuando hay loot importante en ese edificio.\n"
        "Sin checklists.\n\n"
        "Orden: empieza por 00_Indice_y_Orden.pdf y sigue los números de archivo.\n"
        "Fuentes: PZwiki (Riverside businesses, Street_names, Map items, town pages).\n",
        encoding="utf-8",
    )
    print("OK", len(zones) + 1, "pdfs")


if __name__ == "__main__":
    main()
