#!/usr/bin/env python3
"""Horizon Restaurant Group — Plan de Expansión Global (PDF).

Documento estratégico: la fase 0 abre con el local piloto de Cártama (Málaga),
sede fundacional del grupo, y cubre a la vez toda la provincia de Málaga; a
partir de ahí, la expansión avanza por círculos de administración (provincia,
comunidad autónoma, país, continente, mundo) pero dentro de cada círculo el
orden de apertura es lógico y realista — ciudades grandes y zonas turísticas
reales primero, municipios pequeños del interior al final — no un orden de
cercanía geográfica al punto de partida. Todos los números (municipios,
locales potenciales, direcciones, marcas, alquileres reales por m² y ciudad)
se calculan con el mismo motor de datos del atlas (tools/build_atlas.py):
población real de GeoNames, la misma fórmula de nº de locales por población,
el mismo reparto de marcas por cocina dominante del país y los mismos 13
formatos (kiosco, bistró, local, local grande, flagship, food hall, estadio,
cocina fantasma, kiosco de playa/estación, mall, drive-thru, rooftop).

Uso:
    python3 tools/build_expansion_plan.py
    -> /workspace/descargas/horizon_plan_expansion.pdf
"""
from __future__ import annotations

import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_atlas as B  # noqa: E402  (reutiliza fuentes, logos, datos y motor de venues)

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

ROOT = Path("/workspace")
OUT_PDF = ROOT / "descargas" / "horizon_plan_expansion.pdf"

W, H = A4
NAVY = (0.11, 0.21, 0.34)
CREAM = (0.96, 0.94, 0.88)
RED = (0.85, 0.25, 0.18)
GREEN = (0.11, 0.35, 0.30)
TEXT = (0.15, 0.18, 0.16)
GRAY = (0.42, 0.47, 0.44)
LIGHT = (0.90, 0.92, 0.895)

MX = 16 * mm / mm  # margen horizontal en pt (16pt, coherente con el atlas)
MARGIN = 16
CONTENT_W = W - 2 * MARGIN


def fmt_n(n) -> str:
    return f"{n:,.0f}".replace(",", ".")


def fmt_eur(n) -> str:
    return f"{n:,.0f} €".replace(",", ".")


def city_priority_score(c) -> float:
    """Orden de apertura 'lógico' dentro de una misma región: primero las ciudades
    grandes (más locales potenciales) y, como único desempate, las de costa/playa real
    (turismo verificado). Se deja fuera cualquier otro factor para que el orden mostrado
    en las tablas sea siempre coherente con las columnas visibles (habitantes, costa, locales)."""
    nv = B.n_venues(c["pop"])
    mult = 1.25 if c.get("coast_ok") else 1.0
    return nv * mult


# Notas de entrada específicas por país: licencia clave, restricción a inversión
# extranjera, competencia local dominante y riesgo de divisa/repatriación de
# beneficios. Cobertura de los países que más pesan en cada continente (los que
# aparecen en el top de "locales potenciales" de cada uno en este documento).
COUNTRY_RISK = {
    "DE": "Licencia de establecimiento de hostelería (Gaststättenerlaubnis) a nivel de "
          "cada Land, sin restricción a la inversión extranjera (libre establecimiento UE). "
          "Competencia local muy fragmentada (Gasthaus y döner independientes) más las "
          "grandes cadenas ya presentes; euro, sin riesgo de cambio.",
    "FR": "Licencia de venta de alcohol (licence IV/petite licence) y cumplimiento estricto "
          "del código laboral (35 h, indemnizaciones altas); sin restricción a inversión "
          "extranjera en hostelería. Fuerte competencia de la cultura de bistró y brasserie "
          "local; euro, sin riesgo de cambio.",
    "GB": "Premises licence (alcohol) y personal licence del gerente, más el sistema público "
          "de calificación higiénica (Food Hygiene Rating). Sin restricción a la inversión "
          "extranjera tras el brexit, pero con fricción aduanera en importación de género "
          "desde la UE; libra con riesgo de cambio moderado.",
    "IT": "SCIA (comunicación de inicio de actividad) ante el ayuntamiento y licencia de "
          "alimentos (ASL); sin restricción a inversión extranjera. Competencia local muy "
          "fuerte de trattorias y pizzerías familiares con marca de barrio consolidada; "
          "euro, sin riesgo de cambio.",
    "PL": "Registro sanitario-veterinario y licencia de alcohol municipal; sin restricción a "
          "inversión extranjera (UE). Competencia local en expansión de cadenas polacas de "
          "comida rápida y bares de leche (bary mleczne); zloty con riesgo de cambio moderado.",
    "NL": "Licencia de establecimiento (Drank- en Horecawet) y registro en la cámara de "
          "comercio (KvK); sin restricción a inversión extranjera. Alta densidad de terrazas "
          "y cadenas locales de comida rápida; euro, sin riesgo de cambio.",
    "RU": "Licencia sanitaria (Rospotrebnadzor) y de alcohol; desde 2022, fuerte riesgo "
          "regulatorio y de sanciones para inversión occidental, con controles de capital "
          "estrictos y repatriación de beneficios muy restringida; rublo con riesgo de "
          "cambio alto. Entrada no recomendada mientras se mantengan las sanciones vigentes.",
    "TR": "Permiso municipal de actividad (işyeri açma ruhsatı) y registro sanitario; sin "
          "restricción a inversión extranjera. Competencia local muy fuerte del kebab y la "
          "pastelería de barrio; lira turca con riesgo de cambio muy alto por inflación "
          "crónica — conviene indexar alquileres a divisa fuerte.",
    "CN": "Licencia de empresa con inversión extranjera (FICE) más el certificado sanitario "
          "SC de cada local; la restauración ya no está en la lista negativa, pero el "
          "papeleo local es lento. Competencia feroz de cadenas nacionales y del ecosistema "
          "de delivery (Meituan/Ele.me); yuan con control de capital y repatriación sujeta a "
          "aprobación del banco central.",
    "IN": "La restauración (servicio, no venta al por menor) admite el 100% de inversión "
          "extranjera por vía automática, pero exige licencia sanitaria FSSAI y de "
          "establecimiento municipal. Competencia local muy fuerte del street food y "
          "cadenas regionales; rupia con riesgo de cambio moderado.",
    "ID": "Lista de inversión negativa: algunos formatos de restauración exigen socio local "
          "mayoritario (PT PMA con condiciones) y certificación halal obligatoria (BPJPH). "
          "Competencia local de warung y cadenas nacionales muy asentada; rupia indonesia con "
          "riesgo de cambio alto.",
    "PK": "Licencia municipal y certificado sanitario provincial; inversión extranjera "
          "permitida sin socio local obligatorio en la mayoría de formatos. Fuerte "
          "competencia informal de puestos callejeros; rupia paquistaní con riesgo de cambio "
          "muy alto y control de divisas para importar maquinaria.",
    "BD": "Licencia de la autoridad municipal (City Corporation) y certificado de la "
          "autoridad de alimentos (BSTI/BFSA); inversión extranjera permitida vía BIDA. "
          "Competencia local informal muy densa; taka con riesgo de cambio alto y controles "
          "de repatriación.",
    "JP": "Licencia sanitaria del centro de salud pública local (hokenjo) y, si hay alcohol, "
          "permiso de la policía; sin restricción a inversión extranjera. Alquileres muy "
          "altos en Tokio/Osaka y competencia local extremadamente fiel a cadenas "
          "domésticas; yen con riesgo de cambio bajo pero debilidad estructural reciente.",
    "KR": "Registro de negocio de restauración ante el distrito y, con alcohol, licencia "
          "adicional; sin restricción a inversión extranjera. Mercado de restauración muy "
          "denso y competitivo (alta rotación de locales); won con riesgo de cambio moderado.",
    "TH": "La Ley de Negocio Extranjero limita a extranjeros a un máximo del 49% en muchos "
          "servicios salvo promoción BOI o socio tailandés mayoritario; licencia sanitaria "
          "Or.Sor.4 obligatoria. Competencia feroz del street food; baht con riesgo de "
          "cambio moderado.",
    "VN": "Certificado de registro de inversión y licencia de negocio por cada local "
          "(prueba de necesidad económica en algunos casos); sin socio local obligatorio en "
          "general. Competencia local de street food muy densa; dong con control de capital "
          "y repatriación sujeta a aprobación del banco central.",
    "PH": "Licencia municipal (Mayor's Permit) y certificado sanitario; la ley de venta al "
          "por menor limita la propiedad extranjera salvo capital mínimo alto, aunque la "
          "restauración suele encajar como servicio. Competencia local de carinderías y "
          "cadenas nacionales; peso filipino con riesgo de cambio moderado.",
    "AE": "Licencia comercial del DED (o de zona franca, con 100% de propiedad extranjera "
          "posible desde 2021) más permiso sanitario municipal. Alquileres altos en zonas "
          "turísticas; dirham fijo al dólar, riesgo de cambio prácticamente nulo.",
    "SA": "Licencia de inversión extranjera del ministerio de inversión (MISA) y cuotas de "
          "personal saudí (Nitaqat). Competencia local en fuerte crecimiento por la apertura "
          "de Visión 2030; riyal fijo al dólar, riesgo de cambio prácticamente nulo.",
    "IL": "Licencia municipal de negocio (rishayon esek) y certificado sanitario del "
          "ministerio de salud; sin restricción relevante a inversión extranjera. "
          "Competencia local de cadenas de comida rápida muy consolidada; shéquel con riesgo "
          "de cambio bajo-moderado.",
    "US": "Licencia de negocio estatal/municipal y, con alcohol, licencia específica estado "
          "a estado; sin restricción a inversión extranjera. Mercado enorme y fragmentado, "
          "muy competitivo, con salario mínimo y normativa laboral distintos por estado; "
          "dólar, sin riesgo de cambio (divisa de referencia del grupo).",
    "MX": "Registro sanitario COFEPRIS y licencia municipal de uso de suelo; sin "
          "restricción relevante a inversión extranjera en restauración. Fuerte competencia "
          "informal de puestos y fondas; peso mexicano con riesgo de cambio moderado.",
    "CA": "Licencia provincial de alcohol y permiso municipal de salud; sin restricción a "
          "inversión extranjera. Competencia de cadenas canadienses y estadounidenses ya "
          "asentadas; dólar canadiense con riesgo de cambio bajo-moderado.",
    "GT": "Licencia municipal y registro sanitario del ministerio de salud; inversión "
          "extranjera sin restricción relevante. Competencia local de comedores y cadenas "
          "regionales centroamericanas; quetzal relativamente estable, riesgo de cambio bajo.",
    "CU": "Marco de inversión extranjera muy restringido (empresa mixta o contrato con el "
          "estado obligatorio en la mayoría de sectores) y doble sistema cambiario de facto; "
          "riesgo de cambio y de repatriación de beneficios muy alto. Entrada solo viable a "
          "medio plazo con socio estatal.",
    "DO": "Licencia municipal y registro sanitario; ley de inversión extranjera favorable "
          "sin restricciones relevantes para restauración. Fuerte peso del turismo en la "
          "demanda; peso dominicano con riesgo de cambio moderado.",
    "BR": "Registro sanitario ante ANVISA (estatal y municipal) y aranceles de importación "
          "altos para maquinaria de cocina; sin restricción relevante a inversión "
          "extranjera. Fuerte cultura local de boteco/lanchonete; real con riesgo de cambio "
          "alto y registro obligatorio ante el Banco Central para repatriar beneficios (RDE-IED).",
    "CO": "Registro sanitario del INVIMA y licencia municipal (Cámara de Comercio); sin "
          "restricción relevante a inversión extranjera. Competencia local de comida "
          "callejera y cadenas regionales; peso colombiano con riesgo de cambio alto.",
    "AR": "Control de cambios (cepo) e inflación crónica muy altos: la repatriación de "
          "beneficios está fuertemente restringida y conviene indexar contratos a dólar. "
          "Registro sanitario ANMAT y licencia municipal; fuerte cultura local de parrilla y "
          "café de esquina como competencia.",
    "PE": "Licencia municipal de funcionamiento y registro sanitario (DIGESA); sin "
          "restricción relevante a inversión extranjera. Competencia local muy fuerte de la "
          "gastronomía peruana de marca propia; sol peruano con riesgo de cambio moderado.",
    "VE": "Control de cambios oficial con tipo múltiple de facto, hiperinflación histórica "
          "reciente y repatriación de beneficios prácticamente inviable sin estructura "
          "especial; riesgo de cambio y expropiatorio muy altos. Entrada no recomendada a "
          "corto plazo.",
    "CL": "Licencia municipal (patente comercial) y registro sanitario (SEREMI de Salud); "
          "sin restricción a inversión extranjera, uno de los marcos más abiertos de la "
          "región. Peso chileno con riesgo de cambio moderado.",
    "EC": "Licencia municipal y registro sanitario (ARCSA); dolarización oficial desde 2000, "
          "por lo que el riesgo de cambio es nulo frente al euro-dólar. Competencia local de "
          "comida callejera y cadenas regionales andinas.",
    "NG": "Licencias de importación de maquinaria y registro NAFDAC son el mayor cuello de "
          "botella; escasez de divisas y devaluaciones frecuentes de la naira hacen el "
          "riesgo de cambio muy alto — se recomienda indexar alquileres a dólar. Fuerte "
          "competencia informal de bukka y chop houses.",
    "ET": "Licencia de inversión de la comisión etíope (EIC) y fuerte control de cambio de "
          "divisas, con escasez crónica de dólares para importar; birr con riesgo de cambio "
          "muy alto. Competencia local dominada por cadenas de café e injera tradicionales.",
    "EG": "Registro ante la autoridad general de inversión (GAFI) y licencias de "
          "importación restrictivas; libra egipcia con historial de devaluaciones fuertes y "
          "riesgo de cambio muy alto. Competencia local muy densa de comida callejera "
          "(foul, taameya) y cadenas regionales.",
    "CD": "Marco de inversión inestable, con licencias de importación lentas y escasez de "
          "divisas fuertes en el interior del país; riesgo de cambio y de repatriación muy "
          "altos, recomendable solo en Kinshasa con contratos en dólares.",
    "ZA": "Registro sanitario municipal y, para inversores extranjeros de cierto tamaño, "
          "consideraciones de B-BBEE (empoderamiento económico); sin restricción legal "
          "dura a la propiedad extranjera. Competencia local muy fuerte de cadenas "
          "sudafricanas ya consolidadas (Nando's, Steers); rand con riesgo de cambio moderado-alto.",
    "KE": "Licencia sanitaria de KEBS/autoridad municipal y aranceles de importación de "
          "maquinaria; sin restricción relevante a inversión extranjera. Competencia local "
          "en expansión de cadenas nacionales (Java House y similares); chelín keniano con "
          "riesgo de cambio moderado.",
    "TZ": "Licencia de inversión del TIC (Tanzania Investment Centre) y registro sanitario "
          "municipal; sin restricción relevante para restauración. Competencia local "
          "informal muy extendida; chelín tanzano con riesgo de cambio moderado.",
    "MA": "Registro sanitario ONSSA y licencia municipal; sin restricción relevante a "
          "inversión extranjera. Fuerte competencia de la restauración tradicional en zonas "
          "turísticas (medinas); dirham marroquí con banda de flotación controlada, riesgo "
          "de cambio bajo-moderado.",
    "GH": "Licencia del centro de promoción de inversiones (GIPC, con capital mínimo para "
          "extranjeros) y registro sanitario (FDA); competencia local de chop bars muy "
          "extendida; cedi ganés con riesgo de cambio alto.",
    "AU": "Aprobación del FIRB solo necesaria por encima de umbrales de inversión altos (no "
          "aplica a la mayoría de locales); licencia de alcohol y salud estatal. Costes "
          "laborales altos (salario mínimo por convenio); dólar australiano con riesgo de "
          "cambio moderado.",
    "NZ": "Aprobación de la Overseas Investment Office solo para operaciones sensibles o de "
          "gran tamaño; licencia de alcohol y salud del consejo local. Mercado pequeño fuera "
          "de las grandes ciudades costeras; dólar neozelandés con riesgo de cambio moderado.",
    "PG": "Licencia de inversión extranjera (IPA) y registro sanitario; infraestructura "
          "limitada fuera de Port Moresby. Kina con riesgo de cambio alto y disponibilidad "
          "limitada de divisa fuerte.",
    "FJ": "Licencia de inversión extranjera (Investment Fiji) y registro sanitario "
          "municipal; fuerte peso del turismo en la demanda. Dólar fiyiano con riesgo de "
          "cambio moderado.",
    "ES": "Licencia municipal de actividad (apertura) y comunicación previa de puesta en "
          "marcha; sin restricción a inversión extranjera (libre establecimiento UE). "
          "Competencia local muy fuerte de bares y restaurantes de barrio independientes; "
          "euro, sin riesgo de cambio — es el mercado de origen del grupo.",
    "IR": "Licencia de actividad comercial y sanitaria del municipio; la inversión "
          "extranjera exige autorización previa de la organización de inversión (OIETAI) "
          "y está sujeta a sanciones internacionales que dificultan la repatriación de "
          "beneficios; rial con riesgo de cambio y de sanciones muy alto.",
    "HN": "Licencia municipal y registro sanitario; ley de inversión extranjera sin "
          "restricción relevante para restauración. Competencia local de comedores y "
          "cadenas regionales centroamericanas; lempira relativamente estable, riesgo de "
          "cambio bajo-moderado.",
    "CI": "Licencia del centro de promoción de inversiones (CEPICI) y registro sanitario; "
          "sin restricción relevante a inversión extranjera. Fuerte competencia informal de "
          "maquis (puestos de comida callejera); franco CFA fijo al euro, riesgo de cambio "
          "prácticamente nulo pero con controles de transferencia fuera de la zona franco.",
    "DZ": "Régimen de inversión extranjera con reglas de participación local en sectores "
          "estratégicos (no siempre aplicable a restauración) y control de cambios estricto; "
          "dinar argelino con acceso limitado a divisa fuerte y riesgo de cambio muy alto. "
          "Competencia local de la restauración tradicional muy asentada.",
    "NC": "Territorio francés de ultramar: marco regulatorio francés con particularidades "
          "locales de aduanas; franco CFP fijo al euro, riesgo de cambio prácticamente nulo. "
          "Fuerte peso del turismo y de la importación de género.",
    "TL": "Licencia municipal y registro sanitario del ministerio de salud; inversión "
          "extranjera sin restricción relevante. Dólar estadounidense como moneda oficial, "
          "riesgo de cambio nulo frente al dólar; mercado pequeño y muy dependiente de la "
          "importación.",
    "PF": "Territorio francés de ultramar: marco regulatorio francés con particularidades "
          "locales; franco CFP fijo al euro, riesgo de cambio prácticamente nulo. Fuerte peso "
          "del turismo de alta gama en la demanda.",
}


def country_risk_text(cc: str, cont_code: str) -> str:
    if cc in COUNTRY_RISK:
        return COUNTRY_RISK[cc]
    ce = B.COUNTRY_ECON.get(cc, {})
    tax = ce.get("tax")
    tax_txt = f"{tax * 100:.0f}%" if tax is not None else "sin dato"
    return (
        f"Sin ficha propia todavía: se aplica la nota regional — {B.REGION_RISK.get(cont_code, '')} "
        f"Impuesto de sociedades de referencia: {tax_txt}."
    )


class Doc:
    def __init__(self, path: Path):
        self.c = canvas.Canvas(str(path), pagesize=A4)
        self.page_no = 0
        self.phase = ""
        self.y = H

    # ---- páginas -------------------------------------------------
    def cover(self, title, subtitle, kicker):
        c = self.c
        c.setFillColorRGB(*NAVY)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 210, W, 5, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVuBold", 12)
        c.drawString(MARGIN, H - 90, kicker.upper())
        c.setFont("DejaVuBold", 30)
        for i, line in enumerate(title):
            c.drawString(MARGIN, H - 140 - i * 36, line)
        c.setFont("DejaVu", 13)
        y0 = H - 140 - len(title) * 36 - 26
        for line in subtitle:
            c.drawString(MARGIN, y0, line)
            y0 -= 18

        # logos de una muestra de marcas, en rejilla
        sample = ["olivo", "cinta", "seul", "roble", "empanada", "poke", "seda", "taco", "polar", "arena"]
        gx, gy, sz, gap = MARGIN, 90, 34, 12
        for i, bid in enumerate(sample):
            x = gx + i * (sz + gap)
            if x + sz > W - MARGIN:
                break
            c.setFillColorRGB(1, 1, 1)
            c.roundRect(x, gy, sz, sz, 5, fill=1, stroke=0)
            B.draw_logo(c, bid, x + 3, gy + 3, sz - 6)
        c.setFillColorRGB(0.75, 0.8, 0.78)
        c.setFont("DejaVu", 8.2)
        c.drawString(MARGIN, 62, "10 de las 50 marcas propias del grupo · el resto en la última página de este documento")
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, 28, "Horizon Restaurant Group  ·  Documento estratégico interno  ·  no distribuir fuera del grupo")

    def new_page(self, phase_label, title):
        c = self.c
        c.showPage()
        self.page_no += 1
        self.phase = phase_label
        c.setFillColorRGB(*CREAM)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColorRGB(*NAVY)
        c.rect(0, H - 54, W, 54, fill=1, stroke=0)
        c.setFillColorRGB(*RED)
        c.rect(0, H - 58, W, 4, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("DejaVu", 8.5)
        c.drawString(MARGIN, H - 20, phase_label.upper())
        c.setFont("DejaVuBold", 15)
        c.drawString(MARGIN, H - 42, title)
        self._footer()
        self.y = H - 74
        return self.y

    def _footer(self):
        c = self.c
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7.2)
        c.drawString(MARGIN, 12, "Horizon Restaurant Group · Plan de Expansión Global · De la provincia de Málaga al mundo")
        c.drawRightString(W - MARGIN, 12, str(self.page_no))

    def ensure(self, need, phase_label=None, title=None):
        if self.y - need < 30:
            self.new_page(phase_label or self.phase, title or "(cont.)")

    def para(self, text, size=9.3, leading=12.6, color=TEXT, width=None, font="DejaVu"):
        c = self.c
        w = width or CONTENT_W
        c.setFont(font, size)
        c.setFillColorRGB(*color)
        for line in B.wrap(c, text, font, size, w):
            self.ensure(leading)
            c.drawString(MARGIN, self.y, line)
            self.y -= leading

    def gap(self, n=8):
        self.y -= n

    def h2(self, text, color=NAVY):
        c = self.c
        self.ensure(20)
        c.setFillColorRGB(*color)
        c.setFont("DejaVuBold", 12.5)
        c.drawString(MARGIN, self.y, text)
        self.y -= 16

    def bullets(self, items, size=9.1, leading=12.2):
        c = self.c
        for it in items:
            c.setFont(font := "DejaVu", size)
            lines = B.wrap(c, it, font, size, CONTENT_W - 12)
            self.ensure(leading * len(lines) + 2)
            c.setFillColorRGB(*RED)
            c.circle(MARGIN + 2.5, self.y + 3.2, 1.6, fill=1, stroke=0)
            c.setFillColorRGB(*TEXT)
            for j, line in enumerate(lines):
                c.drawString(MARGIN + 11, self.y, line)
                self.y -= leading

    def kpis(self, cards):
        """cards: lista de (valor, etiqueta)."""
        c = self.c
        n = len(cards)
        gap = 8
        cw = (CONTENT_W - gap * (n - 1)) / n
        h = 46
        self.ensure(h + 6)
        x = MARGIN
        for val, label in cards:
            c.setFillColorRGB(1, 1, 1)
            c.roundRect(x, self.y - h, cw, h, 5, fill=1, stroke=0)
            c.setFillColorRGB(*RED)
            c.rect(x, self.y - h, 3, h, fill=1, stroke=0)
            c.setFillColorRGB(*NAVY)
            c.setFont("DejaVuBold", 15)
            c.drawString(x + 10, self.y - 20, str(val))
            c.setFillColorRGB(*GRAY)
            c.setFont("DejaVu", 7.6)
            for k, line in enumerate(B.wrap(c, label, "DejaVu", 7.6, cw - 16)):
                c.drawString(x + 10, self.y - 32 - k * 9, line)
            x += cw + gap
        self.y -= h + 12

    def table(self, headers, rows, col_w, size=8.2, row_h=14.2, align=None, phase_label=None, title=None, total_row=None):
        c = self.c
        align = align or ["l"] * len(headers)

        def draw_header():
            self.ensure(row_h + 4)
            c.setFillColorRGB(*NAVY)
            c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("DejaVuBold", size)
            x = MARGIN + 5
            for h, w, a in zip(headers, col_w, align):
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, h)
                else:
                    c.drawString(x, self.y - row_h + 8, h)
                x += w
            self.y -= row_h

        draw_header()
        for i, row in enumerate(rows):
            if self.y - row_h < 30:
                self.new_page(phase_label or self.phase, (title or "(cont.)") + "  (cont.)")
                draw_header()
            if i % 2 == 1:
                c.setFillColorRGB(*LIGHT)
                c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(*TEXT)
            c.setFont("DejaVu", size)
            x = MARGIN + 5
            for val, w, a in zip(row, col_w, align):
                s = str(val)
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, s)
                else:
                    if c.stringWidth(s, "DejaVu", size) > w - 8:
                        while s and c.stringWidth(s + "…", "DejaVu", size) > w - 8:
                            s = s[:-1]
                        s += "…"
                    c.drawString(x, self.y - row_h + 8, s)
                x += w
            self.y -= row_h
        if total_row:
            self.ensure(row_h + 2)
            c.setFillColorRGB(*GREEN)
            c.rect(MARGIN, self.y - row_h + 3, CONTENT_W, row_h, fill=1, stroke=0)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("DejaVuBold", size)
            x = MARGIN + 5
            for val, w, a in zip(total_row, col_w, align):
                s = str(val)
                if a == "r":
                    c.drawRightString(x + w - 6, self.y - row_h + 8, s)
                else:
                    c.drawString(x, self.y - row_h + 8, s)
                x += w
            self.y -= row_h
        self.y -= 8

    def save(self):
        self.c.showPage()
        self.c.save()


# ------------------------------------------------------------------
# Recopilación de datos reales (mismo motor que el atlas)
# ------------------------------------------------------------------

def gather_data():
    B.load_world_js()
    all_cities = B.load_cities()
    es = [c for c in all_cities if c["cc"] == "ES"]
    poi_idx = B.mark_mall_stadium(es)
    addrs = B.build_index(es)
    for c in es:
        c["addrs"] = addrs.get(c["id"], [])
    import global_poi as G
    G.annotate_addresses(es, poi_idx)

    cartama = next(c for c in es if c["name"] == "Cártama")
    cartama_venues = B.make_venues(cartama, B.n_venues(cartama["pop"]))

    malaga_prov = sorted([c for c in es if c["admin2"] == "Málaga"], key=lambda c: -city_priority_score(c))
    andalucia = [c for c in es if c["admin1"] == "Andalucía"]
    andalucia_rest = sorted([c for c in andalucia if c["admin2"] != "Málaga"], key=lambda c: -city_priority_score(c))
    es_rest = sorted([c for c in es if c["admin1"] != "Andalucía"], key=lambda c: -city_priority_score(c))

    by_prov_and = defaultdict(list)
    for c in andalucia:
        by_prov_and[c["admin2"]].append(c)

    by_ccaa = defaultdict(list)
    for c in es:
        by_ccaa[c["admin1"]].append(c)

    cont = B.load_continents()

    by_cc = defaultdict(list)
    for c in all_cities:
        by_cc[c["cc"]].append(c)

    country_stats = {}
    for cc, cs in by_cc.items():
        nv = sum(B.n_venues(c["pop"]) for c in cs)
        country_stats[cc] = (len(cs), nv, B.COUNTRY_ES.get(cc) or B.TERRITORY_ES.get(cc, cc))

    by_cont = defaultdict(list)
    for cc, (nmuni, nv, name) in country_stats.items():
        by_cont[cont.get(cc, "??")].append((nv, nmuni, cc, name))

    # Reparto mundial de las 50 marcas (mismo motor que el atlas y que el plan por marca):
    # cuántos locales le tocan a cada marca en el conjunto de los ~148.000 municipios del mundo.
    brand_counts = [0] * len(B.BRANDS)
    for c in all_cities:
        n = B.n_venues(c["pop"])
        for bi in B.pick_brand_sequence(c, n):
            brand_counts[bi] += 1

    return {
        "cartama": cartama,
        "cartama_venues": cartama_venues,
        "malaga_prov": malaga_prov,
        "andalucia": andalucia,
        "andalucia_rest": andalucia_rest,
        "es_rest": es_rest,
        "by_prov_and": by_prov_and,
        "by_ccaa": by_ccaa,
        "es": es,
        "by_cont": by_cont,
        "all_cities": all_cities,
        "by_cc": by_cc,
        "cont": cont,
        "brand_counts": brand_counts,
    }


def n_v(cities):
    return sum(B.n_venues(c["pop"]) for c in cities)


def n_pop(cities):
    return sum(c["pop"] for c in cities)


# ------------------------------------------------------------------
# Construcción del documento
# ------------------------------------------------------------------

def build():
    d = gather_data()
    doc = Doc(OUT_PDF)

    total_world = n_v(d["all_cities"])
    total_muni_world = len(d["all_cities"])

    doc.cover(
        title=["PLAN DE EXPANSIÓN", "GLOBAL"],
        subtitle=[
            "De la provincia de Málaga al mundo: 13 formatos de local, 50 marcas propias",
            f"y un mapa de {fmt_n(total_muni_world)} municipios en todos los países.",
        ],
        kicker="Horizon Restaurant Group",
    )

    # ---------------- Visión ----------------
    doc.new_page("Visión", "Un plan lógico: primero las ciudades grandes y las zonas turísticas")
    doc.para(
        "Horizon Restaurant Group nace con su primer local piloto en Cártama (Málaga, Andalucía), "
        "sede fundacional del grupo, pero el despliegue real de la provincia no sigue un orden de "
        "cercanía a esa sede: sigue el orden en que de verdad se abriría una cadena de restauración, "
        "priorizando primero las ciudades con más población y las zonas turísticas reales (costa, "
        "playa, estación) y dejando para el final los municipios más pequeños del interior."
    )
    doc.gap(4)
    doc.para(
        "El criterio de orden dentro de cada fase es el mismo en toda la provincia, el país y el "
        "mundo: cuantos más locales potenciales tiene un municipio (población real de GeoNames) y "
        "cuanto más peso turístico real tiene (playa u ola de calor de costa, estación, centro "
        "comercial, todo verificado con datos reales, no supuesto), antes entra en el calendario. "
        "La expansión avanza por círculos de administración — provincia, comunidad autónoma, país, "
        "continente, mundo — pero dentro de cada círculo manda el tamaño y el turismo real, no la "
        "cercanía geográfica al punto de partida. En cada salto se reutiliza el mismo motor de "
        "asignación: tamaño del local según población real, formato según el distrito real del "
        "municipio (playa, estación, polígono, centro comercial, azotea de gran ciudad), alquiler "
        "real por m² según el país y el tamaño de la ciudad, y mezcla de marcas ponderada por la "
        "cocina que más se consume en cada país."
    )
    doc.gap(10)
    doc.h2("Hoja de ruta en una tabla")
    phase_rows = [
        ["Fase 0", "Provincia de Málaga (con el piloto de Cártama)", fmt_n(n_v(d["malaga_prov"])) + " locales"],
        ["Fase 1", "Andalucía (resto de provincias)", fmt_n(n_v(d["andalucia_rest"])) + " locales"],
        ["Fase 2", "España (resto de comunidades)", fmt_n(n_v(d["es_rest"])) + " locales"],
        ["Fase 3", "Europa (resto)", fmt_n(sum(x[0] for x in d["by_cont"].get("EU", [])) - n_v(d["es"])) + " locales"],
        ["Fase 4", "Asia y Oriente Medio", fmt_n(sum(x[0] for x in d["by_cont"].get("AS", []))) + " locales"],
        ["Fase 5", "América del Norte y Central", fmt_n(sum(x[0] for x in d["by_cont"].get("NA", []))) + " locales"],
        ["Fase 6", "América del Sur", fmt_n(sum(x[0] for x in d["by_cont"].get("SA", []))) + " locales"],
        ["Fase 7", "África", fmt_n(sum(x[0] for x in d["by_cont"].get("AF", []))) + " locales"],
        ["Fase 8", "Oceanía → cobertura mundial total", fmt_n(total_world) + " locales"],
    ]
    doc.table(["Fase", "Ámbito", "Objetivo de locales"], phase_rows, [55, 330, CONTENT_W - 55 - 330], align=["l", "l", "r"])
    doc.gap(4)
    doc.para(
        "Dentro de cada fase, el orden de apertura municipio a municipio (o país a país, dentro de "
        "cada continente) sigue siempre el mismo criterio de tamaño y turismo real explicado arriba; "
        "las tablas de este documento ya están ordenadas así, de mayor a menor prioridad de apertura.",
        size=8.4, color=GRAY,
    )

    # ---------------- Modelo de formatos ----------------
    doc.new_page("Modelo", "Cómo decidimos el formato de cada local")
    doc.para(
        "En cada municipio, el tamaño y el formato del local no se eligen a mano: dependen de la "
        "población real (GeoNames) y de si existe de verdad esa característica en el municipio, según "
        "OpenStreetMap (calle peatonal, playa, estación de metro o tren). Este es el catálogo de formatos "
        "que ya usa el motor del atlas y que replicamos en cada fase de esta expansión:"
    )
    doc.gap(6)
    size_rows = []
    for sid, (label, seats, m2) in B.SIZES.items():
        cond = {
            "kiosco": "Población mínima; formato de entrada en cualquier municipio",
            "local": "Formato base, disponible en cualquier municipio",
            "ghost": "Desde ≈3.500 hab.: cocina fantasma centrada en delivery",
            "flagship": "Desde ≈22.000 hab.: buque insignia de la marca en la zona",
            "food_hall": "Desde ≈70.000 hab. y solo en las ciudades más grandes del país",
            "estadio": "Desde ≈220.000 hab. y solo en las ciudades más grandes del país",
            "kiosco_playa": "Solo si hay playa real cerca (OSM)",
            "kiosco_estacion": "Solo si hay metro/cercanías real cerca (OSM)",
            "local_mall": "Desde ≈35.000 hab., en ciudades con centro comercial",
            "drive_thru": "Desde ≈15.000 hab., en polígono o periferia con tráfico",
            "rooftop": "Desde ≈300.000 hab., en el centro de grandes ciudades",
        }.get(sid, "")
        size_rows.append([label, f"{seats} pl", f"{m2} m²", cond])
    doc.table(
        ["Formato", "Aforo", "Superficie", "Condición real de asignación"],
        size_rows,
        [110, 45, 55, CONTENT_W - 110 - 45 - 55],
        align=["l", "r", "r", "l"],
    )
    doc.gap(4)
    doc.para(
        "Además, las 50 marcas del grupo no se reparten igual en todos los países: en cada uno pesa más "
        "la cocina que de verdad se consume allí (japonesa en Japón, india en India, mediterránea y "
        "tapas en España, barbacoa y hamburguesas en Estados Unidos…), con variedad aleatoria real entre "
        "municipios de tamaño parecido."
    )

    # ---------------- Fase 0: Provincia de Málaga (con el piloto de Cártama) ----------------
    doc.new_page("Fase 0 · Provincia", "Málaga: el piloto de Cártama y la cabecera turística de la provincia")
    c0 = d["cartama"]
    mp = d["malaga_prov"]
    doc.kpis([
        (str(len(mp)), "Municipios de la provincia"),
        (fmt_n(n_pop(mp)), "Habitantes"),
        (fmt_n(n_v(mp)), "Locales potenciales"),
        (str(len(d["cartama_venues"])), "Locales del piloto de Cártama"),
    ])
    doc.para(
        "El primer local del grupo abre en Cártama —casco antiguo, ensanche del este y estación de "
        "cercanías propia, a 19 km de Málaga capital—, sede fundacional de Horizon Restaurant Group. "
        "Pero en paralelo, ese mismo trimestre, el plan ya entra en las cabeceras grandes y turísticas "
        "de la provincia: Málaga capital, Marbella, Torremolinos, Fuengirola, Benalmádena y Mijas "
        "concentran la mayoría del volumen inicial (flagship y food hall en la capital, kiosco de "
        "playa en todo el litoral, el primer rooftop del grupo si la ciudad supera el umbral de "
        "población). El resto de los municipios de la provincia —hasta completar los " + str(len(mp)) +
        "— se abre por orden de tamaño y peso turístico real, no por cercanía a Cártama."
    )
    doc.gap(6)
    doc.h2("Orden de apertura de la provincia (mayor a menor prioridad)")
    mp_rows = [[
        c["name"] + (" ★ piloto" if c["id"] == c0["id"] else ""),
        fmt_n(c["pop"]),
        "Sí" if c.get("coast_ok") else "",
        str(B.n_venues(c["pop"])),
    ] for c in mp]
    doc.table(
        ["Municipio (orden real de apertura)", "Habitantes", "Costa/playa real", "Locales"],
        mp_rows,
        [230, 110, 100, CONTENT_W - 230 - 110 - 100],
        align=["l", "r", "l", "r"],
        total_row=["TOTAL provincia de Málaga", fmt_n(n_pop(mp)), "", fmt_n(n_v(mp))],
    )
    doc.gap(6)
    doc.h2("El piloto de Cártama, local a local")
    doc.para(
        "La cocina dominante en España es mediterránea, tapas y brunch, así que el primer lote de "
        "Cártama prioriza esas marcas y añade algo de lujo y comida rápida para completar la oferta "
        "del pueblo:"
    )
    doc.gap(4)
    rows = []
    for v in d["cartama_venues"]:
        rows.append([
            v["brand"], v["cuisine"], v["size_name"], f"{v['seats']} pl", v["district"],
            ("Compra " + fmt_eur(v["price"])) if v["owned"] else ("Alq. " + fmt_eur(v["rent"]) + "/mes"),
        ])
    doc.table(
        ["Marca", "Cocina", "Formato", "Aforo", "Barrio", "Inversión"],
        rows,
        [95, 105, 62, 40, 55, CONTENT_W - 95 - 105 - 62 - 40 - 55],
        align=["l", "l", "l", "r", "l", "r"],
        title="Cártama",
    )

    # ---------------- Fase 1: Andalucía (resto) ----------------
    doc.new_page("Fase 1 · Comunidad autónoma", "Andalucía: el resto de provincias, capital y costa primero")
    an = d["andalucia"]
    ar = d["andalucia_rest"]
    doc.kpis([
        (str(len(an)), "Municipios (Andalucía completa)"),
        (fmt_n(n_pop(an)), "Habitantes"),
        (fmt_n(n_v(an)), "Locales potenciales (con Málaga)"),
        (fmt_n(n_v(ar)), "Locales de esta fase (resto)"),
    ])
    doc.para(
        "Con la provincia de Málaga ya cubierta en la fase 0, esta fase abre el resto de Andalucía. "
        "Dentro de cada provincia manda el mismo criterio: la capital y las cabeceras turísticas "
        "primero (Sevilla capital, Granada capital y su costa tropical, Cádiz y la Costa de la Luz, "
        "Córdoba capital, Almería y su litoral, Jaén capital y Huelva con Punta Umbría), y los "
        "municipios más pequeños del interior al final de cada provincia."
    )
    prov_rows = []
    for prov, cs in sorted(d["by_prov_and"].items(), key=lambda kv: -n_v(kv[1])):
        if prov == "Málaga":
            continue
        prov_rows.append([prov, str(len(cs)), fmt_n(n_pop(cs)), str(n_v(cs))])
    doc.table(
        ["Provincia (orden de apertura)", "Municipios", "Habitantes", "Locales"],
        prov_rows,
        [160, 110, 130, CONTENT_W - 160 - 110 - 130],
        align=["l", "r", "r", "r"],
        total_row=["TOTAL resto de Andalucía", str(len(ar)), fmt_n(n_pop(ar)), str(n_v(ar))],
    )
    doc.gap(4)
    top_ar = ar[:14]
    doc.h2("Las 14 primeras cabeceras que abren fuera de Málaga")
    doc.table(
        ["Municipio", "Provincia", "Habitantes", "Costa real", "Locales"],
        [[c["name"], c["admin2"], fmt_n(c["pop"]), "Sí" if c.get("coast_ok") else "", str(B.n_venues(c["pop"]))] for c in top_ar],
        [150, 110, 90, 65, CONTENT_W - 150 - 110 - 90 - 65],
        align=["l", "l", "r", "l", "r"],
    )

    # ---------------- Fase 2: España (resto) ----------------
    doc.new_page("Fase 2 · País", "España: el resto de comunidades, Madrid y Barcelona primero")
    es = d["es"]
    er = d["es_rest"]
    doc.kpis([
        (str(len(es)), "Municipios (España completa)"),
        (fmt_n(n_pop(es)), "Habitantes"),
        (fmt_n(n_v(es)), "Locales potenciales (con Andalucía)"),
        (fmt_n(n_v(er)), "Locales de esta fase (resto)"),
        (f"×{n_v(es) / max(1, B.n_venues(c0['pop'])):,.0f}".replace(",", "."), "Crecimiento desde el piloto de Cártama"),
    ])
    doc.para(
        "Con toda Andalucía cubierta, la fase 2 entra en el resto de comunidades autónomas, ordenadas "
        "por volumen de locales potenciales (Madrid y Cataluña primero, por sus grandes ciudades). "
        "Dentro de cada comunidad, el criterio de la fase 0 se mantiene: la capital y las cabeceras "
        "turísticas reales abren antes que los municipios pequeños del interior — en Baleares y "
        "Canarias, con playa real en todas sus islas, esto adelanta a casi toda su red frente a "
        "comunidades de interior de tamaño de población parecido."
    )
    ccaa_rows = []
    for ccaa, cs in sorted(d["by_ccaa"].items(), key=lambda kv: -n_v(kv[1])):
        if ccaa == "Andalucía":
            continue
        ccaa_rows.append([B.ADMIN1_ES.get(ccaa, ccaa), str(len(cs)), fmt_n(n_pop(cs)), str(n_v(cs))])
    doc.table(
        ["Comunidad autónoma (orden de apertura)", "Municipios", "Habitantes", "Locales"],
        ccaa_rows,
        [175, 105, 120, CONTENT_W - 175 - 105 - 120],
        align=["l", "r", "r", "r"],
        total_row=["TOTAL resto de España", str(len(er)), fmt_n(n_pop(er)), str(n_v(er))],
    )

    # ---------------- Fases 3-8: continentes ----------------
    cont_defs = [
        ("Fase 3 · Continente", "Europa (resto, sin España)", "EU", True),
        ("Fase 4 · Continente", "Asia y Oriente Medio", "AS", False),
        ("Fase 5 · Continente", "América del Norte y Central", "NA", False),
        ("Fase 6 · Continente", "América del Sur", "SA", False),
        ("Fase 7 · Continente", "África", "AF", False),
        ("Fase 8 · Continente", "Oceanía", "OC", False),
    ]
    for phase_label, title, code, exclude_es in cont_defs:
        doc.new_page(phase_label, title)
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if exclude_es:
            lst = [x for x in lst if x[2] != "ES"]
        tot_v = sum(x[0] for x in lst)
        tot_m = sum(x[1] for x in lst)
        doc.kpis([
            (str(len(lst)), "Países"),
            (fmt_n(tot_m), "Municipios"),
            (fmt_n(tot_v), "Locales potenciales"),
        ])
        rows = [[name, cc, fmt_n(nmuni), fmt_n(nv)] for nv, nmuni, cc, name in lst[:18]]
        doc.table(
            ["País", "ISO", "Municipios", "Locales"],
            rows,
            [200, 45, 110, CONTENT_W - 200 - 45 - 110],
            align=["l", "l", "r", "r"],
            total_row=["TOTAL " + title, "", fmt_n(tot_m), fmt_n(tot_v)],
        )
        if len(lst) > 18:
            doc.para(f"Se muestran los 18 países con más locales potenciales; el resto —hasta {len(lst)}— completa la cobertura continental.")

    # ---------------- Cierre: mundo ----------------
    doc.new_page("Cierre del círculo", "Cobertura mundial total")
    doc.kpis([
        (fmt_n(total_muni_world), "Municipios"),
        (fmt_n(total_world), "Locales potenciales"),
        ("50", "Marcas propias"),
        (str(len(B.SIZES)), "Formatos de local"),
    ])
    doc.para(
        "El punto de llegada es el mismo modelo que hoy alimenta el atlas mundial de Horizon: "
        f"{fmt_n(total_world)} locales potenciales en {fmt_n(total_muni_world)} municipios de todos los "
        "países, cada uno con dirección real de OpenStreetMap, tamaño según su población, formato según "
        "las características reales de la ciudad y mezcla de marcas ponderada por la cocina que más se "
        "consume en esa zona."
    )
    doc.gap(6)
    doc.h2("Progresión acumulada, fase a fase")
    cum_rows = []
    seq = [
        ("Fase 0", n_v(d["malaga_prov"])),
        ("Fase 1", n_v(d["andalucia"])),
        ("Fase 2", n_v(d["es"])),
        ("Fase 3", n_v(d["es"]) + sum(x[0] for x in d["by_cont"].get("EU", []) if x[2] != "ES")),
    ]
    running_extra = seq[-1][1]
    for label, code in [("Fase 4", "AS"), ("Fase 5", "NA"), ("Fase 6", "SA"), ("Fase 7", "AF"), ("Fase 8", "OC")]:
        running_extra += sum(x[0] for x in d["by_cont"].get(code, []))
        seq.append((label, running_extra))
    labels_scope = [
        "Prov. Málaga (piloto Cártama)", "Andalucía", "España",
        "+ Europa", "+ Asia/O. Medio", "+ América N/C", "+ América del Sur", "+ África", "Mundo completo",
    ]
    for (label, cumval), scope in zip(seq, labels_scope):
        pct = 100.0 * cumval / total_world
        cum_rows.append([label, scope, fmt_n(cumval), f"{pct:.1f}%"])
    doc.table(
        ["Fase", "Alcance acumulado", "Locales acumulados", "% del objetivo mundial"],
        cum_rows,
        [70, 170, 140, CONTENT_W - 70 - 170 - 140],
        align=["l", "l", "r", "r"],
    )

    # ---------------- Riesgos y palancas ----------------
    doc.new_page("Estrategia", "Riesgos y palancas de la expansión")
    doc.h2("Palancas a favor")
    doc.bullets([
        "El motor de datos es el mismo en todas las fases: no hay que rediseñar el modelo al cruzar fronteras, solo cambia el país de entrada.",
        "La cocina dominante por país ya prioriza sabores locales, lo que reduce el riesgo de lanzar una marca equivocada en el primer lote.",
        "Los formatos ligados a la ciudad real (playa, estación, mall, polígono, azotea) evitan sobreconstruir formatos caros donde no hay demanda para ellos.",
        "Cada fase reutiliza la infraestructura de la anterior: proveedores, personal formado y conocimiento de marca de la zona vecina.",
    ])
    doc.gap(6)
    doc.h2("Riesgos a vigilar")
    doc.bullets([
        "Food hall y estadio se aproximan a partir de la población de la ciudad, no de un mercado o estadio verificado uno a uno; conviene validar sobre el terreno antes de construir esos formatos concretos.",
        "La estacionalidad turística de la Costa del Sol y de las cabeceras costeras de la fase 0 puede distorsionar la demanda real frente a la estimada por población censada.",
        "En mercados con alquileres muy altos (grandes capitales asiáticas y norteamericanas) el ritmo de apertura debe ajustarse al flujo de caja, no solo al mapa.",
        "La normativa local de licencias y horarios varía mucho entre fases; cada salto de país requiere validación legal propia antes de firmar el primer local (ver el detalle país a país en «Marco legal»).",
    ])

    # ---------------- Del plan regional al calendario por marca ----------------
    labele = B.phase_period(B.N_PHASES)[2]
    total_brand_target = sum(d["brand_counts"])
    doc.new_page("Ejecución", "Del plan regional al calendario por marca")
    total_pdfs = fmt_n(50 * B.N_PHASES)
    doc.para(
        f"Las fases 0 a 8 reparten el territorio (de la provincia de Málaga al mundo, con el piloto de "
        f"Cártama como origen fundacional); a partir de aquí, cada una de "
        f"las 50 marcas propias ejecuta ese reparto con su propio calendario de apertura, dividido en "
        f"{B.N_PHASES} fases — un PDF por fase, {total_pdfs} documentos en total, entregados en 50 ZIP "
        "(uno por marca, con sus 500 fases dentro)."
    )
    doc.gap(4)
    doc.para(
        "Ojo a la diferencia entre los dos documentos: este plan maestro ordena el TERRITORIO de forma "
        "lógica (ciudades grandes y zonas turísticas primero, municipio pequeño al final de cada "
        "región), para decidir en qué orden el grupo entra en cada mercado. El calendario de cada MARCA, "
        "en cambio, es aleatorio real y muy salteado por el mundo dentro de ese territorio ya ordenado: "
        "no sigue el orden geográfico de este documento, así que una marca puede abrir en Londres, "
        "seguir por doce ciudades de otros continentes y volver a abrir en Londres varias fases después. "
        "Lo único fijo es el calendario: la fase N cae siempre en el mismo mes para las 50 marcas, así "
        "que los planes son comparables fase a fase."
    )
    doc.gap(8)
    doc.kpis([
        (B.phase_period(1)[2], "Fase 1 (inicio del calendario)"),
        (str(B.N_PHASES), "Fases por marca"),
        ("50", "Marcas · calendario propio"),
        (f"{50 * B.N_PHASES:,}".replace(",", "."), "PDF de fase en total"),
    ])
    doc.gap(4)
    doc.h2("Calendario común")
    cal_rows = [
        ["Cadencia", "1 fase = 1 mes natural, igual para las 50 marcas"],
        ["Fase 1", B.phase_period(1)[2]],
        [f"Fase {B.N_PHASES}", labele],
        ["Duración total del calendario", f"{B.N_PHASES} meses (~{B.N_PHASES / 12:.0f} años)"],
        ["Locales del modelo (50 marcas, 500 fases)", fmt_n(total_brand_target)],
        ["Ritmo medio por marca y fase", f"≈{total_brand_target / 50 / B.N_PHASES:.0f} locales/fase"],
        ["Ritmo medio del grupo (50 marcas) por fase", f"≈{total_brand_target / B.N_PHASES:.0f} locales/mes"],
    ]
    doc.table(["Parámetro", "Valor"], cal_rows, [230, CONTENT_W - 230], align=["l", "l"])
    doc.gap(4)
    doc.para(
        "El total de 500 fases por marca reparte, en cada una, los locales que le corresponden a esa "
        "marca según la cocina dominante de cada país (igual que en el atlas): unas marcas de comida "
        "rápida superan los 38.000 locales a lo largo del calendario; algunas marcas de lujo, más "
        "selectivas, se quedan cerca de los 30.000. El detalle exacto de cada marca está en el anexo "
        "final de este documento y, fase a fase, en su propio ZIP."
    )

    # ---------------- Modelo de inversión ----------------
    doc.new_page("Ejecución", "Modelo de inversión por local")
    doc.para(
        "Cada local de los PDF de fase por marca lleva cuatro partidas de inversión estimada, calculadas "
        "a partir del tamaño real del formato (m² y aforo), del nivel de costes del país (salario/hora "
        "de js/world.js, la misma fuente que usa el simulador para sueldos e inflación) y, en el "
        "alquiler, también del tamaño real de la ciudad — el mismo dato que fija el alquiler de cada "
        "local del atlas y del simulador, no una media plana por país:"
    )
    doc.gap(4)
    doc.bullets([
        "Alquiler / Compra: €/m²/mes = 9 € × (índice de renta del país ÷ 72) × factor de ciudad; el "
        "factor de ciudad sube con la población real (de ≈0,55× en un pueblo a ≈2,8× en una megaciudad), "
        "así que dos locales del mismo formato en el mismo país pueden pagar un alquiler muy distinto "
        "según la zona. El 72% de los locales se abren en alquiler (fianza + 6 meses de renta); el "
        "resto se compra, a un precio ≈ alquiler mensual × 108 (misma fórmula que el simulador).",
        "Obra: ≈950 €/m² en España, escalado por el salario/hora del país frente al de España (4,2 €/h) "
        "y, en una proporción menor, por el mismo factor de tamaño de ciudad (la obra también es más "
        "cara de ejecutar en una gran ciudad que en un pueblo).",
        "Mobiliario: ≈300 €/m² en España, con el mismo doble escalado (coste laboral del país + tamaño de ciudad).",
        "Stock inicial: ≈140 €/plaza en España (materia prima, vajilla, uniformes de arranque), escalado solo por coste laboral del país.",
    ], size=8.4, leading=11.6)
    doc.gap(6)
    doc.h2("Alquiler real por m² y mes, según tamaño de la ciudad y país")
    tiers = [("Pueblo (≈5.000 hab.)", 5000), ("Ciudad media (≈60.000 hab.)", 60000),
             ("Gran ciudad (≈500.000 hab.)", 500000), ("Megaciudad (≈5.000.000 hab.)", 5000000)]
    rent_countries = ["ES", "GB", "US", "AE", "IN"]
    rent_rows = []
    for label, pop in tiers:
        row = [label]
        for cc in rent_countries:
            row.append(fmt_eur(B.rent_per_m2_month(cc, pop)))
        rent_rows.append(row)
    rc_names = [B.COUNTRY_ECON.get(cc, {}).get("name", cc) for cc in rent_countries]
    ncols = len(rent_countries)
    colw = [150] + [(CONTENT_W - 150) / ncols] * ncols
    doc.table(
        ["Tamaño de la ciudad"] + rc_names,
        rent_rows,
        colw,
        align=["l"] + ["r"] * ncols,
    )
    doc.para("Alquiler base por m² y mes (formato Local, antes del multiplicador de formato); mismo cálculo real que fija el alquiler de cada local del atlas.", size=7.6, color=GRAY)
    doc.gap(8)
    doc.h2("Ejemplo completo: un Local (42 plazas, 140 m²) en una gran ciudad (≈500.000 hab.)")
    ex_rows = []
    for cc, m2, seats, pop in [("ES", 140, 42, 500000), ("US", 140, 42, 500000), ("IN", 140, 42, 500000)]:
        ce = B.COUNTRY_ECON.get(cc, {"wage": 15.0, "name": cc})
        scale = max(0.12, ce["wage"] / 4.2)
        cfac = B.city_rent_factor(pop)
        obra = m2 * 950 * scale * (0.85 + 0.15 * cfac)
        mob = m2 * 300 * scale * (0.85 + 0.15 * cfac)
        stock = seats * 140 * scale
        rent_m = m2 * B.rent_per_m2_month(cc, pop)
        ex_rows.append([ce["name"], fmt_eur(rent_m) + "/mes", fmt_eur(obra), fmt_eur(mob), fmt_eur(stock), fmt_eur(obra + mob + stock)])
    doc.table(
        ["País", "Alquiler/mes", "Obra", "Mobiliario", "Stock inicial", "Subtotal obra+mob.+stock*"],
        ex_rows,
        [110, 85, 85, 85, 85, CONTENT_W - 110 - 85 - 85 - 85 - 85],
        align=["l", "r", "r", "r", "r", "r"],
    )
    doc.para("* No incluye alquiler/compra del local, que ya se muestra en su propia columna.", size=7.6, color=GRAY)

    # ---------------- Marco legal y fiscal por continente ----------------
    doc.new_page("Marco legal", "Barreras de entrada por país: licencias, competencia local y divisa")
    doc.para(
        "Cada vez que una marca entra por primera vez en un país nuevo, su PDF de fase incluye esta "
        "misma nota de riesgo, con el impuesto de sociedades y el IVA reales del país (js/world.js). "
        "Aquí va el detalle país a país (no solo el resumen regional) de los seis países de más peso "
        "de cada continente: la licencia clave para abrir, si hay restricción a la inversión "
        "extranjera, quién es la competencia local dominante y el riesgo real de tipo de cambio y de "
        "repatriación de beneficios."
    )
    doc.gap(6)
    cont_order = [("EU", "Europa"), ("AS", "Asia"), ("NA", "América del Norte y Central"),
                  ("SA", "América del Sur"), ("AF", "África"), ("OC", "Oceanía")]
    for code, cname in cont_order:
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if not lst:
            continue
        doc.new_page("Marco legal", cname)
        doc.para(B.REGION_RISK.get(code, ""), size=8.8, leading=11.8)
        doc.gap(2)
        top6 = lst[:6]
        rows = []
        for nv, nmuni, cc, name in top6:
            ce = B.COUNTRY_ECON.get(cc, {})
            tax = ce.get("tax")
            vat = ce.get("vat")
            rows.append([
                name,
                f"{tax * 100:.0f}%" if tax is not None else "—",
                f"{vat * 100:.0f}%" if vat is not None else "—",
                fmt_n(nv),
            ])
        doc.table(
            ["País de referencia", "Imp. sociedades", "IVA", "Locales potenciales"],
            rows,
            [200, 110, 90, CONTENT_W - 200 - 110 - 90],
            align=["l", "r", "r", "r"],
        )
        doc.gap(6)
        for nv, nmuni, cc, name in top6:
            doc.h2(name, color=RED)
            doc.para(country_risk_text(cc, code), size=8.4, leading=11.4)
            doc.gap(4)

    # ---------------- Directorio mundial de municipios ----------------
    doc.new_page("Directorio mundial", "Todos los municipios del mundo, país a país")
    doc.para(
        f"Listado completo de los {fmt_n(total_muni_world)} municipios del mundo con población registrada "
        "en GeoNames — el mismo universo que alimenta el atlas y el reparto de las 50 marcas — ordenado "
        "de forma jerárquica y geográfica: continente, país (de mayor a menor tamaño) y, dentro de cada "
        "país, municipio de mayor a menor población. Es la base territorial completa sobre la que se "
        "construye el calendario aleatorio de cada marca."
    )
    doc.gap(6)
    for code, cname in cont_order:
        lst = sorted(d["by_cont"].get(code, []), key=lambda x: -x[0])
        if not lst:
            continue
        doc.new_page("Directorio mundial", cname)
        tot_nv = sum(x[0] for x in lst)
        tot_nm = sum(x[1] for x in lst)
        doc.kpis([
            (str(len(lst)), "Países"),
            (fmt_n(tot_nm), "Municipios"),
            (fmt_n(tot_nv), "Locales potenciales"),
        ])
        for nv, nmuni, cc, name in lst:
            cs = sorted(d["by_cc"].get(cc, []), key=lambda c: -c["pop"])
            if not cs:
                continue
            doc.h2(f"{name}  ·  {nmuni} municipios  ·  {fmt_n(nv)} locales potenciales")
            rows = [[c["name"], c["admin1"], fmt_n(c["pop"]), str(B.n_venues(c["pop"]))] for c in cs]
            doc.table(
                ["Municipio", "Región", "Habitantes", "Locales"],
                rows,
                [190, 175, 100, CONTENT_W - 190 - 175 - 100],
                size=7.4,
                align=["l", "l", "r", "r"],
                phase_label=f"Directorio mundial · {cname}",
                title=name,
                total_row=[f"TOTAL {name}", f"{nmuni} municipios", fmt_n(n_pop(cs)), fmt_n(nv)],
            )
            doc.gap(4)

    # ---------------- Portafolio de marcas ----------------
    doc.new_page("Anexo", "Portafolio de las 50 marcas")
    doc.para(
        "Las mismas 50 marcas viajan por todas las fases; lo que cambia es su peso relativo según la "
        "cocina dominante de cada país y el formato disponible en cada municipio. El número bajo cada "
        "marca es su objetivo total a lo largo de sus 500 fases (mismo reparto que el atlas mundial); "
        "el detalle fase a fase está en horizon_plan_marca_<código>.zip."
    )
    doc.gap(6)
    c = doc.c
    cols = 5
    cell_w = CONTENT_W / cols
    cell_h = 82
    x0, y0 = MARGIN, doc.y
    pos = 0  # índice relativo a la página actual de la rejilla (se reinicia en cada salto de página)
    for idx, (bid, name, cuisine, tier, tag) in enumerate(B.BRANDS):
        col = pos % cols
        row = pos // cols
        if row * cell_h > y0 - 30:
            doc.new_page("Anexo", "Portafolio de las 50 marcas (cont.)")
            x0, y0 = MARGIN, doc.y
            pos = 0
            col, row = 0, 0
        x = x0 + col * cell_w
        y = y0 - row * cell_h
        c.setFillColorRGB(1, 1, 1)
        c.roundRect(x + 2, y - cell_h + 6, cell_w - 4, cell_h - 8, 4, fill=1, stroke=0)
        B.draw_logo(c, bid, x + 8, y - 30, 22)
        c.setFillColorRGB(*NAVY)
        c.setFont("DejaVuBold", 8)
        c.drawString(x + 34, y - 16, name[:20])
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 7)
        cuisine_lines = B.wrap(c, cuisine, "DejaVu", 7, cell_w - 40)
        c.drawString(x + 34, y - 26, cuisine_lines[0] if cuisine_lines else cuisine)
        c.setFillColorRGB(*GREEN)
        c.setFont("DejaVuBold", 7.2)
        c.drawString(x + 8, y - 40, f"{fmt_n(d['brand_counts'][idx])} locales · 500 fases")
        c.setFillColorRGB(*GRAY)
        c.setFont("DejaVu", 6.2)
        c.drawString(x + 8, y - 51, f"horizon_plan_marca_{bid}.zip")
        c.setFillColorRGB(*RED)
        c.setFont("DejaVu", 6.6)
        c.drawString(x + 8, y - cell_h + 14, B.TIER_LABEL.get(tier, tier))
        pos += 1
    doc.y = y0 - (((pos - 1) // cols) + 1) * cell_h

    doc.save()
    print("PDF escrito:", OUT_PDF, OUT_PDF.stat().st_size, "bytes", "páginas~", doc.page_no + 2)


if __name__ == "__main__":
    build()
