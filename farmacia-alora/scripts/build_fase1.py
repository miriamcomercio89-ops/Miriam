#!/usr/bin/env python3
"""
Fase 1 — Catálogo España ampliado + manuales PDF por categoría.
Un producto por página, diseño en color. Envases ilustrados (no fotos de marca).
"""
from __future__ import annotations

import json
import math
import os
import re
from pathlib import Path

from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER

ROOT = Path(__file__).resolve().parents[1]
OUT_JS = ROOT / "js" / "catalog.js"
OUT_JSON = ROOT / "scripts" / "catalog-fase1.json"
OUT_PDF_DIR = ROOT / "manuales"
BASE_MS = 1786406400000  # ~2026-08-10 UTC
MS_DIA = 86400000

# ——— Taxonomía España (más ramas) ———
CATEGORIAS = [
  # OTC / parafarmacia
  {"id": "resfriado", "nombre": "Resfriado y gripe", "icon": "🤧", "color": "#3B82F6", "rx": False, "rama": "OTC respiratorio"},
  {"id": "tos", "nombre": "Tos y mucolíticos", "icon": "🫁", "color": "#60A5FA", "rx": False, "rama": "OTC respiratorio"},
  {"id": "alergia", "nombre": "Alergia / antihistamínicos", "icon": "🌸", "color": "#F472B6", "rx": False, "rama": "OTC respiratorio"},
  {"id": "dolor", "nombre": "Dolor y fiebre", "icon": "💊", "color": "#EF4444", "rx": False, "rama": "OTC analgésicos"},
  {"id": "digestivo", "nombre": "Digestivo OTC", "icon": "🤢", "color": "#10B981", "rx": False, "rama": "OTC digestivo"},
  {"id": "probioticos", "nombre": "Probióticos y flora", "icon": "🦠", "color": "#34D399", "rx": False, "rama": "OTC digestivo"},
  {"id": "piel", "nombre": "Piel y dermatología", "icon": "🧴", "color": "#F59E0B", "rx": False, "rama": "Parafarmacia"},
  {"id": "solar", "nombre": "Solar y fotoprotección", "icon": "☀", "color": "#FBBF24", "rx": False, "rama": "Parafarmacia"},
  {"id": "capilar", "nombre": "Capilar", "icon": "💇", "color": "#D97706", "rx": False, "rama": "Parafarmacia"},
  {"id": "bucal", "nombre": "Higiene bucal", "icon": "😁", "color": "#22D3EE", "rx": False, "rama": "Parafarmacia"},
  {"id": "sexual", "nombre": "Salud íntima y sexual", "icon": "❤️", "color": "#EC4899", "rx": False, "rama": "Parafarmacia"},
  {"id": "infantil", "nombre": "Infantil / pediatría OTC", "icon": "🧒", "color": "#A78BFA", "rx": False, "rama": "Materno-infantil"},
  {"id": "lactancia", "nombre": "Embarazo y lactancia", "icon": "🤰", "color": "#C084FC", "rx": False, "rama": "Materno-infantil"},
  {"id": "vitaminas", "nombre": "Vitaminas y minerales", "icon": "🍊", "color": "#84CC16", "rx": False, "rama": "Nutrición"},
  {"id": "fitoterapia", "nombre": "Fitoterapia", "icon": "🌿", "color": "#65A30D", "rx": False, "rama": "Nutrición"},
  {"id": "dietetica", "nombre": "Nutrición / dietética", "icon": "🥗", "color": "#16A34A", "rx": False, "rama": "Nutrición"},
  {"id": "deporte", "nombre": "Deporte y articulaciones", "icon": "🏃", "color": "#0D9488", "rx": False, "rama": "OTC musculoesquelético"},
  {"id": "viaje", "nombre": "Viaje y botiquín", "icon": "✈️", "color": "#06B6D4", "rx": False, "rama": "OTC general"},
  {"id": "apósitos", "nombre": "Apósitos y primeros auxilios", "icon": "🩹", "color": "#FB7185", "rx": False, "rama": "Ortopedia / cura"},
  {"id": "ortopedia", "nombre": "Ortopedia ligera", "icon": "🦴", "color": "#78716C", "rx": False, "rama": "Ortopedia / cura"},
  {"id": "optica", "nombre": "Óptica y lentillas", "icon": "👓", "color": "#6366F1", "rx": False, "rama": "Óptica / audio"},
  {"id": "audio", "nombre": "Audición / pilas", "icon": "👂", "color": "#818CF8", "rx": False, "rama": "Óptica / audio"},
  {"id": "vet", "nombre": "Veterinaria", "icon": "🐾", "color": "#A855F7", "rx": False, "rama": "Veterinaria"},
  {"id": "snacks", "nombre": "Snacks y chicles", "icon": "🍫", "color": "#D97706", "rx": False, "rama": "Conveniencia"},
  {"id": "bebidas", "nombre": "Bebidas", "icon": "💧", "color": "#0EA5E9", "rx": False, "rama": "Conveniencia"},
  {"id": "revistas", "nombre": "Revistas y prensa", "icon": "📰", "color": "#64748B", "rx": False, "rama": "Conveniencia"},
  # Rx
  {"id": "antibioticos", "nombre": "Antibióticos", "icon": "🦠", "color": "#DC2626", "rx": True, "rama": "Rx infecciosas"},
  {"id": "cardio", "nombre": "Cardiovascular", "icon": "❤️‍🩹", "color": "#BE123C", "rx": True, "rama": "Rx crónica"},
  {"id": "anticoag", "nombre": "Anticoagulantes", "icon": "🩸", "color": "#9F1239", "rx": True, "rama": "Rx crónica"},
  {"id": "diabetes", "nombre": "Diabetes y endocrino", "icon": "💉", "color": "#2563EB", "rx": True, "rama": "Rx crónica"},
  {"id": "respiratorio_rx", "nombre": "Respiratorio / asma Rx", "icon": "🌬️", "color": "#0284C7", "rx": True, "rama": "Rx respiratorio"},
  {"id": "digestivo_rx", "nombre": "Digestivo con receta", "icon": "📋", "color": "#059669", "rx": True, "rama": "Rx digestivo"},
  {"id": "neuro", "nombre": "Neurología", "icon": "⚡", "color": "#4338CA", "rx": True, "rama": "Rx neuro"},
  {"id": "mental", "nombre": "Salud mental", "icon": "🧠", "color": "#7C3AED", "rx": True, "rama": "Rx neuro"},
  {"id": "controlados", "nombre": "Controlados / estupefacientes", "icon": "🔒", "color": "#7C2D12", "rx": True, "rama": "Rx controlados"},
  {"id": "hormonas", "nombre": "Hormonas y tiroides", "icon": "⚖️", "color": "#C026D3", "rx": True, "rama": "Rx hormonal"},
  {"id": "anticonceptivos", "nombre": "Anticonceptivos Rx", "icon": "圆环", "color": "#DB2777", "rx": True, "rama": "Rx hormonal"},
  {"id": "corticoides", "nombre": "Corticoides sistémicos", "icon": "💉", "color": "#B45309", "rx": True, "rama": "Rx inflamación"},
  {"id": "reuma", "nombre": "Reumatología / dolor Rx", "icon": "🦴", "color": "#C2410C", "rx": True, "rama": "Rx inflamación"},
  {"id": "derma_rx", "nombre": "Dermatología Rx", "icon": "🩺", "color": "#CA8A04", "rx": True, "rama": "Rx dermatología"},
  {"id": "oftalmo", "nombre": "Oftalmología Rx", "icon": "👁️", "color": "#0891B2", "rx": True, "rama": "Rx especialidades"},
  {"id": "urologia", "nombre": "Urología", "icon": "🚽", "color": "#0F766E", "rx": True, "rama": "Rx especialidades"},
  {"id": "gine", "nombre": "Ginecología Rx", "icon": "🎀", "color": "#E11D48", "rx": True, "rama": "Rx especialidades"},
  {"id": "frigo", "nombre": "Frigorífico / biológicos", "icon": "❄️", "color": "#0284C7", "rx": True, "rama": "Cadena de frío"},
  {"id": "dispensario", "nombre": "Dispensario / hospitalarios", "icon": "🏥", "color": "#4B5563", "rx": True, "rama": "Rx hospitalario"},
]

CAT_BY_NAME = {c["nombre"]: c for c in CATEGORIAS}

PROCEDIMIENTOS = {
  "otc": "1) Saludo y escucha · 2) Preguntas (quién, síntomas, alergias, otros fármacos, embarazo) · 3) Indicación / derivación · 4) Posología · 5) Cobro y consejo de seguimiento 48–72 h.",
  "rx": "1) Identificar paciente (DNI) · 2) Validar receta papel/e-receta y fase · 3) Alergias e interacciones · 4) Dispensar cantidad correcta · 5) Información de uso y adherencia · 6) Cobro SNS/mutua/particular.",
  "ctrl": "1) Receta válida y vigente · 2) DNI del paciente · 3) Visado si aplica · 4) Asiento en libro de estupefacientes · 5) Firma del farmacéutico · 6) Dispensar SOLO la cantidad prescrita · 7) Consejos de seguridad.",
  "nevera": "1) Verificar cadena de frío (2–8 °C) · 2) No dispensar si ha roto frío · 3) Sacar de nevera al cobro · 4) Bolsa isotérmica + hielo gel · 5) Explicar conservación en domicilio y caducidad tras apertura.",
  "vet": "1) Confirmar especie, peso y edad · 2) No sustituir por medicamento humano sin criterio veterinario · 3) Revisar dosis mg/kg · 4) Explicar administración · 5) Cobro.",
  "optica": "1) Confirmar tipo de lentilla / líquido / pila · 2) Higiene de manos y no compartir · 3) Revisar caducidad del envase · 4) Consejo de uso diario/mensual · 5) Cobro.",
  "orto": "1) Preguntar lesión y lateralidad · 2) Medir talla / elegir apósito · 3) Probar ajuste · 4) Explicar horas de uso y signos de alarma · 5) Derivar a urgencias/traumatólogo si grave.",
  "solar": "1) Tipo de piel y exposición · 2) FPS y textura · 3) Cantidad y reaplicación · 4) Complementar con ropa/sombra · 5) Cobro.",
  "infantil": "1) Edad y peso · 2) Calcular dosis mg/kg · 3) Forma farmacéutica adecuada · 4) Alarmas (fiebre <3 meses, letargo) → derivar · 5) Explicar a tutor.",
  "embarazo": "1) Confirmar trimestre / lactancia · 2) Evitar AINE en 3.er trimestre salvo criterio médico · 3) Preferir opciones seguras documentadas · 4) Derivar si duda · 5) Registrar consejo.",
  "antibiotico": "1) Validar receta · 2) Alergias (penicilina…) · 3) Cumplir pauta completa · 4) Interacciones · 5) Consejo de microbiota / efectos · 6) Cobro.",
  "cardio": "1) Validar crónica / e-receta · 2) Adherencia y horarios · 3) Interacciones (AINE, zumo pomelo…) · 4) Consejos TA/síncope · 5) Cobro SNS.",
  "diabetes": "1) Validar tratamiento · 2) Hipo/hiperglucemia: signos · 3) Conservación (si nevera) · 4) Material de punción si aplica · 5) Cobro.",
  "mental": "1) Discreción y respeto · 2) Validar receta · 3) Inicio de efecto / no abandonar brusco · 4) Sueño, alcohol, conducción · 5) Cobro.",
  "digestivo": "1) Distinguir acidez / diarrea / estreñimiento / gases · 2) Alarmas (sangre, pérdida peso) → médico · 3) Posología · 4) Dieta breve · 5) Cobro.",
  "alergia": "1) Síntomas (rinitis, urticaria, ocular) · 2) Somnolencia de 1.ª generación · 3) Embarazo/lactancia · 4) Posología · 5) Cobro.",
  "sigre_hint": "Recordar al paciente el punto SIGRE para envases vacíos o caducados.",
}


def proc_for(p):
  cat = p.get("categoria", "")
  bits = []
  if p.get("controlado"):
    return PROCEDIMIENTOS["ctrl"]
  if p.get("nevera"):
    bits.append(PROCEDIMIENTOS["nevera"])
  if cat == "Veterinaria":
    return PROCEDIMIENTOS["vet"]
  if cat in ("Óptica y lentillas", "Audición / pilas"):
    return PROCEDIMIENTOS["optica"]
  if cat in ("Ortopedia ligera", "Apósitos y primeros auxilios"):
    return PROCEDIMIENTOS["orto"]
  if cat == "Solar y fotoprotección":
    return PROCEDIMIENTOS["solar"]
  if cat == "Infantil / pediatría OTC":
    return PROCEDIMIENTOS["infantil"]
  if cat == "Embarazo y lactancia":
    return PROCEDIMIENTOS["embarazo"]
  if cat == "Antibióticos":
    return PROCEDIMIENTOS["antibiotico"]
  if cat in ("Cardiovascular", "Anticoagulantes"):
    return PROCEDIMIENTOS["cardio"]
  if cat == "Diabetes y endocrino":
    return PROCEDIMIENTOS["diabetes"]
  if cat == "Salud mental":
    return PROCEDIMIENTOS["mental"]
  if "Digestivo" in cat:
    return PROCEDIMIENTOS["digestivo"]
  if "Alergia" in cat:
    return PROCEDIMIENTOS["alergia"]
  base = PROCEDIMIENTOS["rx"] if p.get("requiereReceta") else PROCEDIMIENTOS["otc"]
  # Añadir detalle de producto
  extra = f" Producto: {p.get('nombre')} ({p.get('principioActivo')}). Presentación {p.get('presentacion')} · {p.get('dosis')}."
  if p.get("esGenerico"):
    extra += " Ofrecer equivalencia EFG si el paciente pregunta por precio."
  if p.get("grupoInteraccion") == "nsaid":
    extra += " Preguntar anticoagulación, úlcera, embarazo y asma."
  if p.get("grupoInteraccion") == "analgesico":
    extra += " No superar 3–4 g/día de paracetamol adulto; revisar otros productos con paracetamol."
  return base + extra

def P(nombre, marca, lab, pa, cat, sub, presentacion, dosis, uds, precio, iva=4, grupo="otro", icon="💊",
      sintomas=None, rx=None, ctrl=False, nevera=False, efg=False, **extra):
  meta = CAT_BY_NAME[cat]
  if rx is None:
    rx = meta["rx"]
  return {
    "nombre": nombre, "marca": marca, "laboratorio": lab, "principioActivo": pa,
    "categoria": cat, "subcategoria": sub, "rama": meta["rama"],
    "presentacion": presentacion, "dosis": dosis, "unidadesEnvase": uds,
    "precio": round(precio, 2), "coste": round(precio * 0.62, 2), "iva": iva,
    "requiereReceta": rx, "controlado": ctrl, "nevera": nevera, "esGenerico": efg,
    "grupoInteraccion": grupo, "icon": icon, "sintomas": sintomas or [],
    "colorCategoria": meta["color"], "stockMinimo": 5 + (uds % 7),
    **extra,
  }


def build_products():
  items = []

  # ——— Resfriado ———
  items += [
    P("Frenadol Complex sobres", "Frenadol", "J&J", "Paracetamol + clorfenamina + dextrometorfano", "Resfriado y gripe", "Gripe", "Sobres", "10 sobres", 10, 9.95, grupo="analgesico", icon="🤧", sintomas=["fiebre","tos","congestión","dolor de cabeza"]),
    P("Frenadol Junior sobres", "Frenadol", "J&J", "Paracetamol + dextrometorfano", "Resfriado y gripe", "Pediátrico", "Sobres", "10 sobres", 10, 8.50, grupo="analgesico", icon="🧒", sintomas=["fiebre","tos"]),
    P("Iniston Antigripal", "Iniston", "J&J", "Paracetamol + clorfenamina + fenilefrina", "Resfriado y gripe", "Gripe", "Comprimidos", "16 comp", 16, 9.20, grupo="analgesico", icon="🤒", sintomas=["fiebre","congestión"]),
    P("Termalgin Resfriado", "Termalgin", "GSK", "Paracetamol + fenilefrina + clorfenamina", "Resfriado y gripe", "Gripe", "Cápsulas", "16 cáps", 16, 8.75, grupo="analgesico", icon="🤒", sintomas=["fiebre"]),
    P("Aspirina Complex", "Aspirina", "Bayer", "AAS + pseudoefedrina + clorfenamina", "Resfriado y gripe", "Gripe", "Sobres", "10 sobres", 10, 9.40, grupo="nsaid", icon="🤧", sintomas=["fiebre","congestión"]),
    P("Ilvico comprimidos", "Ilvico", "Boehringer", "Paracetamol + cafeína + clorfenamina", "Resfriado y gripe", "Gripe", "Comprimidos", "20 comp", 20, 7.50, grupo="analgesico", icon="💊", sintomas=["fiebre","dolor de cabeza"]),
    P("Respibien spray nasal", "Respibien", "Uriach", "Oximetazolina", "Resfriado y gripe", "Descongestivo", "Spray 15 ml", "0,5 mg/ml", 1, 7.25, icon="👃", sintomas=["congestión"]),
    P("Rhinomer Fuerza Media", "Rhinomer", "GSK", "Agua de mar", "Resfriado y gripe", "Lavado nasal", "Spray 135 ml", "Isotónica", 1, 8.10, iva=21, icon="🌊", sintomas=["congestión"]),
    P("Narine solución nasal", "Narine", "Alcon", "Cloruro sódico", "Resfriado y gripe", "Lavado nasal", "Spray 100 ml", "0,9%", 1, 6.90, icon="💦", sintomas=["congestión"]),
    P("Vicks VapoRub", "Vicks", "P&G", "Alcanfor + mentol + eucalipto", "Resfriado y gripe", "Tópico", "Pomada 50 g", "50 g", 1, 8.30, icon="🧴", sintomas=["congestión","tos"]),
  ]

  # Tos
  items += [
    P("Bisolvon Compositum jarabe", "Bisolvon", "Boehringer", "Bromhexina + dextrometorfano", "Tos y mucolíticos", "Tos", "Jarabe 200 ml", "200 ml", 1, 11.40, icon="🫁", sintomas=["tos"]),
    P("Fluimucil 600 mg", "Fluimucil", "Zambon", "Acetilcisteína", "Tos y mucolíticos", "Mucolítico", "Sobres", "600 mg × 10", 10, 9.75, icon="🫧", sintomas=["tos"]),
    P("Mucosan jarabe", "Mucosan", "Boehringer", "Ambroxol", "Tos y mucolíticos", "Mucolítico", "Jarabe 200 ml", "15 mg/5 ml", 1, 8.90, icon="🫁", sintomas=["tos"]),
    P("Romilar jarabe", "Romilar", "Sanofi", "Dextrometorfano", "Tos y mucolíticos", "Antitusivo", "Jarabe 125 ml", "15 mg/5 ml", 1, 7.95, icon="🍯", sintomas=["tos"]),
    P("Cinfatos 15 mg", "Cinfatos", "Cinfa", "Dextrometorfano", "Tos y mucolíticos", "Antitusivo", "Comprimidos", "15 mg × 20", 20, 6.50, efg=True, icon="💊", sintomas=["tos"]),
    P("Prospan jarabe", "Prospan", "Engelhard", "Hedera helix", "Tos y mucolíticos", "Fitoterapia", "Jarabe 100 ml", "100 ml", 1, 9.15, icon="🌿", sintomas=["tos"]),
    P("Pectox jarabe", "Pectox", "Ferrer", "Carbocisteína", "Tos y mucolíticos", "Mucolítico", "Jarabe 200 ml", "5%", 1, 8.40, icon="🫁", sintomas=["tos"]),
  ]

  # Alergia
  for nombre, marca, lab, pa, precio in [
    ("Clarityne 10 mg", "Clarityne", "Bayer", "Loratadina", 6.95),
    ("Zyrtec 10 mg", "Zyrtec", "UCB", "Cetirizina", 7.40),
    ("Aerius 5 mg", "Aerius", "MSD", "Desloratadina", 8.90),
    ("Polaramine jarabe", "Polaramine", "MSD", "Dexclorfeniramina", 6.80),
    ("Rinialer 5 mg", "Rinialer", "Faes", "Rupatadina", 9.20),
    ("Cinfahistina 10 mg", "Cinfahistina", "Cinfa", "Cetirizina", 5.50),
  ]:
    items.append(P(nombre, marca, lab, pa, "Alergia / antihistamínicos", "Antihistamínico", "Comprimidos/jarabe", "según ficha", 7, precio, grupo="antihistaminico", icon="🌸", sintomas=["alergia"], efg="Cinfa" in marca or "Cinfa" in lab))

  # Dolor
  items += [
    P("Gelocatil 1 g", "Gelocatil", "Ferrer", "Paracetamol", "Dolor y fiebre", "Analgésico", "Comprimidos", "1 g × 12", 12, 5.95, grupo="analgesico", icon="💊", sintomas=["dolor de cabeza","fiebre"]),
    P("Termalgin 650 mg", "Termalgin", "GSK", "Paracetamol", "Dolor y fiebre", "Analgésico", "Comprimidos", "650 mg × 20", 20, 4.80, grupo="analgesico", icon="💊", sintomas=["fiebre","dolor de cabeza"]),
    P("Nolotil cápsulas", "Nolotil", "Boehringer", "Metamizol", "Dolor y fiebre", "Analgésico", "Cápsulas", "575 mg × 20", 20, 3.20, grupo="analgesico", icon="💊", sintomas=["dolor"], rx=True),
    P("Ibuprofeno Cinfa 600 mg", "Cinfa", "Cinfa", "Ibuprofeno", "Dolor y fiebre", "AINE", "Comprimidos", "600 mg × 40", 40, 3.95, grupo="nsaid", icon="💊", sintomas=["dolor","fiebre"], efg=True),
    P("Espidifen 400 mg", "Espidifen", "Zambon", "Ibuprofeno arginina", "Dolor y fiebre", "AINE", "Sobres", "400 mg × 20", 20, 8.50, grupo="nsaid", icon="⚡", sintomas=["dolor"]),
    P("Enantyum 25 mg", "Enantyum", "Menarini", "Dexketoprofeno", "Dolor y fiebre", "AINE", "Comprimidos", "25 mg × 20", 20, 6.40, grupo="nsaid", icon="💊", sintomas=["dolor"]),
    P("Voltarén Emulgel", "Voltarén", "GSK", "Diclofenaco", "Dolor y fiebre", "Tópico", "Gel 100 g", "1%", 1, 12.90, grupo="nsaid", icon="🧴", sintomas=["dolor muscular"]),
    P("Frenadol forte?", "—", "—", "—", "Dolor y fiebre", "x", "x", "x", 1, 1),  # placeholder remove
  ]
  items = [x for x in items if x["nombre"] != "Frenadol forte?"]

  # Digestivo OTC + probióticos
  items += [
    P("Omeprazol Cinfa 20 mg OTC", "Cinfa", "Cinfa", "Omeprazol", "Digestivo OTC", "IPP", "Cápsulas", "20 mg × 14", 14, 4.95, grupo="ipp", icon="🔥", sintomas=["acidez"], efg=True),
    P("Almax Forte sobres", "Almax", "Almirall", "Almagato", "Digestivo OTC", "Antiácido", "Sobres", "1,5 g × 24", 24, 8.90, icon="🫠", sintomas=["acidez"]),
    P("Gaviscon doble acción", "Gaviscon", "Reckitt", "Alginato + bicarbonato", "Digestivo OTC", "Reflujo", "Comprimidos", "24 comp", 24, 9.75, icon="🫧", sintomas=["acidez"]),
    P("Fortasec 2 mg", "Fortasec", "J&J", "Loperamida", "Digestivo OTC", "Antidiarreico", "Cápsulas", "2 mg × 20", 20, 7.20, icon="💊", sintomas=["diarrea"]),
    P("Smecta naranja", "Smecta", "Ipsen", "Diosmectita", "Digestivo OTC", "Antidiarreico", "Sobres", "3 g × 30", 30, 9.80, icon="🍊", sintomas=["diarrea"]),
    P("Aero-Red", "Aero-Red", "Uriach", "Simeticona", "Digestivo OTC", "Gases", "Comprimidos", "40 mg × 30", 30, 6.50, icon="💨", sintomas=["gases"]),
    P("Duphalac solución", "Duphalac", "Abbott", "Lactulosa", "Digestivo OTC", "Laxante", "Solución 200 ml", "200 ml", 1, 7.10, icon="💧", sintomas=["estreñimiento"]),
    P("Plantaben", "Plantaben", "Madaus", "Plantago ovata", "Digestivo OTC", "Laxante", "Sobres", "3,5 g × 30", 30, 11.20, icon="🌿", sintomas=["estreñimiento"]),
    P("Actimel no — skip", "x", "x", "x", "Probióticos y flora", "x", "x", "x", 1, 1),
  ]
  items = [x for x in items if not x["nombre"].startswith("Actimel")]
  items += [
    P("Casenbiotic sobres", "Casenbiotic", "Casen", "Lactobacillus + Bifidobacterium", "Probióticos y flora", "Probiótico", "Sobres", "10 sobres", 10, 12.50, icon="🦠", sintomas=["diarrea"]),
    P("Inmunoferon", "Inmunoferon", "Angelini", "Glicofosfopeptical", "Probióticos y flora", "Inmunomodulador", "Sobres", "15 sobres", 15, 18.90, icon="🛡️"),
    P("Ultra-Levura 250 mg", "Ultra-Levura", "Biocodex", "Saccharomyces boulardii", "Probióticos y flora", "Probiótico", "Cápsulas", "250 mg × 20", 20, 11.40, icon="🦠", sintomas=["diarrea"]),
  ]

  # Piel, solar, capilar, bucal
  items += [
    P("Bepanthol crema", "Bepanthol", "Bayer", "Dexpantenol", "Piel y dermatología", "Reparadora", "Crema 30 g", "30 g", 1, 8.90, iva=21, icon="🧴", sintomas=["piel irritada"]),
    P("Restylane — skip", "x", "x", "x", "Piel y dermatología", "x", "x", "x", 1, 1),
  ]
  items = [x for x in items if "skip" not in x["nombre"].lower()]
  items += [
    P("Isdin Ureadin 10", "Isdin", "Isdin", "Urea", "Piel y dermatología", "Hidratante", "Loción 400 ml", "10%", 1, 16.90, iva=21, icon="🧴"),
    P("Cicaplast Baume B5", "La Roche-Posay", "L'Oréal", "Pantenol + madecassoside", "Piel y dermatología", "Reparadora", "Bálsamo 40 ml", "40 ml", 1, 14.50, iva=21, icon="🧴", sintomas=["piel irritada"]),
    P("Photoderm AKN Mat SPF30", "Bioderma", "NAOS", "Filtros solares", "Solar y fotoprotección", "Facial", "Fluido 40 ml", "SPF30", 1, 19.90, iva=21, icon="☀", sintomas=["solar"]),
    P("Isdin Fusion Water SPF50", "Isdin", "Isdin", "Filtros solares", "Solar y fotoprotección", "Facial", "50 ml", "SPF50+", 1, 24.90, iva=21, icon="☀", sintomas=["solar"]),
    P("Anthelios UVMune 400", "La Roche-Posay", "L'Oréal", "Filtros solares", "Solar y fotoprotección", "Facial", "50 ml", "SPF50+", 1, 26.50, iva=21, icon="☀", sintomas=["solar"]),
    P("Vichy Capital Soleil kids", "Vichy", "L'Oréal", "Filtros solares", "Solar y fotoprotección", "Infantil", "200 ml", "SPF50+", 1, 18.90, iva=21, icon="☀", sintomas=["solar"]),
    P("Priorin cápsulas", "Priorin", "Bayer", "Mijo + L-cisteína + pantotenato", "Capilar", "Anticaída", "Cápsulas", "60 cáps", 60, 29.90, iva=21, icon="💇"),
    P("Vichy Dercos aminexil", "Vichy", "L'Oréal", "Aminexil", "Capilar", "Anticaída", "Ampollas", "12 amp", 12, 32.50, iva=21, icon="💇"),
    P("Lacer pasta con flúor", "Lacer", "Lacer", "Fluoruro", "Higiene bucal", "Pasta", "75 ml", "75 ml", 1, 4.50, iva=21, icon="😁"),
    P("GUM Ortho cepillo", "GUM", "Sunstar", "—", "Higiene bucal", "Cepillo", "Unidad", "1 ud", 1, 5.20, iva=21, icon="😁"),
    P("Chlorhexidine Lacer colutorio", "Lacer", "Lacer", "Clorhexidina", "Higiene bucal", "Colutorio", "200 ml", "0,12%", 1, 7.80, icon="😁"),
  ]

  # Sexual, infantil, lactancia
  items += [
    P("Durex Natural Plus", "Durex", "Reckitt", "Látex", "Salud íntima y sexual", "Preservativos", "Caja", "12 uds", 12, 8.50, iva=21, icon="❤️"),
    P("Control Nature", "Control", "Artsana", "Látex", "Salud íntima y sexual", "Preservativos", "Caja", "12 uds", 12, 6.90, iva=21, icon="❤️"),
    P("Gyneas ovulos", "Gyneas", "Effik", "Ácido láctico", "Salud íntima y sexual", "Íntima", "Óvulos", "10 uds", 10, 11.20, icon="❤️"),
    P("Apiretal solución", "Apiretal", "ERN", "Paracetamol", "Infantil / pediatría OTC", "Analgésico", "Solución 60 ml", "100 mg/ml", 1, 5.40, grupo="analgesico", icon="🧒", sintomas=["fiebre"]),
    P("Dalsy 40 mg/ml", "Dalsy", "AbbVie", "Ibuprofeno", "Infantil / pediatría OTC", "AINE", "Suspensión 150 ml", "40 mg/ml", 1, 6.80, grupo="nsaid", icon="🧒", sintomas=["fiebre","dolor"]),
    P("Frenadol Complex Junior", "Frenadol", "J&J", "Paracetamol + dextrometorfano", "Infantil / pediatría OTC", "Gripe", "Sobres", "10 sobres", 10, 8.20, grupo="analgesico", icon="🧒", sintomas=["fiebre","tos"]),
    P("SUERO ORAL casen", "Casen", "Casen", "Sales de rehidratación", "Infantil / pediatría OTC", "Rehidratación", "Sobres", "5 sobres", 5, 6.50, icon="💧", sintomas=["diarrea"]),
    P("Femibion 1", "Femibion", "Procter", "Ácido fólico + vitaminas", "Embarazo y lactancia", "Gestación", "Comprimidos", "30 comp", 30, 18.90, iva=21, icon="🤰"),
    P("Natalben Supra", "Natalben", "Italfarmaco", "Ácido fólico + DHA + vitaminas", "Embarazo y lactancia", "Gestación", "Cápsulas", "30 cáps", 30, 21.50, iva=21, icon="🤰"),
    P("Lansinoh crema lanolina", "Lansinoh", "Lansinoh", "Lanolina", "Embarazo y lactancia", "Lactancia", "Crema 40 ml", "40 ml", 1, 14.20, iva=21, icon="🤰"),
  ]

  # Vitaminas, fitoterapia, dietética, deporte, viaje
  items += [
    P("Redoxon Triple Acción", "Redoxon", "Bayer", "Vitamina C + Zn + D", "Vitaminas y minerales", "Defensas", "Comprimidos", "30 comp", 30, 12.90, iva=21, icon="🍊"),
    P("Supradyn Energy", "Supradyn", "Bayer", "Multivitamínico", "Vitaminas y minerales", "Multivitamínico", "Comprimidos", "30 comp", 30, 14.50, iva=21, icon="⚡"),
    P("Centrum Adultos", "Centrum", "Haleon", "Multivitamínico", "Vitaminas y minerales", "Multivitamínico", "Comprimidos", "30 comp", 30, 13.80, iva=21, icon="🍊"),
    P("Hidropolivit Mineral", "Hidropolivit", "Menarini", "Multivitamínico", "Vitaminas y minerales", "Multivitamínico", "Comprimidos", "30 comp", 30, 9.50, iva=21, icon="🍊"),
    P("Jalea Real 1000 mg", "Special Food", "Special Food", "Jalea real", "Fitoterapia", "Tonificante", "Ampollas", "20 amp", 20, 12.40, iva=21, icon="🌿"),
    P("Valeriana Level", "Level", "Level", "Valeriana", "Fitoterapia", "Sueño", "Comprimidos", "60 comp", 60, 8.90, icon="😴", sintomas=["insomnio","estres"]),
    P("Passiflora Arkocapsulas", "Arkocápsulas", "Arkopharma", "Passiflora", "Fitoterapia", "Ansiedad leve", "Cápsulas", "45 cáps", 45, 10.20, icon="🌿", sintomas=["estres"]),
    P("Optisana proteína", "Optisana", "Lidl pharma line", "Proteína", "Nutrición / dietética", "Proteínas", "Bote 400 g", "400 g", 1, 15.90, iva=21, icon="🥗"),
    P("Ensure Plus vainilla", "Ensure", "Abbott", "Nutrición completa", "Nutrición / dietética", "Suplemento", "Brick 200 ml", "200 ml", 1, 3.80, iva=4, icon="🥗"),
    P("Fortimel Energy", "Fortimel", "Nutricia", "Nutrición completa", "Nutrición / dietética", "Suplemento", "Brick 200 ml", "200 ml", 1, 3.60, iva=4, icon="🥗"),
    P("Cartílago de tiburón — skip", "x", "x", "x", "Deporte y articulaciones", "x", "x", "x", 1, 1),
  ]
  items = [x for x in items if "skip" not in x["nombre"].lower()]
  items += [
    P("Condrosan 800 mg", "Condrosan", "Bioibérica", "Condroitina", "Deporte y articulaciones", "Articulaciones", "Cápsulas", "800 mg × 60", 60, 28.90, icon="🦴", sintomas=["dolor muscular"]),
    P("Go On Magnesio", "Go On", "Pharma OTC", "Magnesio", "Deporte y articulaciones", "Mineral", "Comprimidos", "60 comp", 60, 9.50, iva=21, icon="🏃"),
    P("Repelente Relec infantil", "Relec", "Reckitt", "Icaridina", "Viaje y botiquín", "Insectos", "Spray 100 ml", "100 ml", 1, 9.80, iva=21, icon="🦟", sintomas=["picaduras"]),
    P("Dormidina viaje", "Dormidina", "Teva", "Doxilamina", "Viaje y botiquín", "Sueño", "Comprimidos", "25 mg × 14", 14, 6.40, icon="😴", sintomas=["insomnio"]),
    P("Suero oral adultos", "Normon", "Normon", "Sales rehidratación", "Viaje y botiquín", "Rehidratación", "Sobres", "5 sobres", 5, 5.90, icon="💧", sintomas=["diarrea"]),
  ]

  # Apósitos, ortopedia, óptica, audio, vet, snacks, bebidas, revistas
  items += [
    P("Hansaplast Universal", "Hansaplast", "Beiersdorf", "Apósito", "Apósitos y primeros auxilios", "Tiritas", "Caja", "40 uds", 40, 4.20, iva=21, icon="🩹"),
    P("Steri-Strip 3M", "3M", "3M", "Sutura cutánea", "Apósitos y primeros auxilios", "Cierre", "Sobres", "6 tiras", 6, 7.50, iva=21, icon="🩹"),
    P("Betadine solución", "Betadine", "Meda", "Povidona yodada", "Apósitos y primeros auxilios", "Antiséptico", "125 ml", "10%", 1, 6.80, icon="🧴"),
    P("Aquacel Ag", "Aquacel", "Convatec", "Hidrofibra plata", "Apósitos y primeros auxilios", "Avanzado", "Apósito", "10×10", 1, 18.50, icon="🩹"),
    P("Muñequera Farmalastic", "Farmalastic", "Farmalastic", "—", "Ortopedia ligera", "Muñeca", "Talla M", "1 ud", 1, 14.90, iva=21, icon="🦴"),
    P("Tobillera elástica", "Futuro", "3M", "—", "Ortopedia ligera", "Tobillo", "Talla L", "1 ud", 1, 16.50, iva=21, icon="🦴"),
    P("Bastón regulable aluminio", "Forta", "Forta", "—", "Ortopedia ligera", "Marcha", "Unidad", "1 ud", 1, 22.00, iva=21, icon="🦴"),
    P("Biotrue solución única", "Biotrue", "Bausch+Lomb", "Solución lentillas", "Óptica y lentillas", "Mantenimiento", "300 ml", "300 ml", 1, 12.90, iva=21, icon="👓"),
    P("Opti-Free PureMoist", "Opti-Free", "Alcon", "Solución lentillas", "Óptica y lentillas", "Mantenimiento", "300 ml", "300 ml", 1, 13.50, iva=21, icon="👓"),
    P("Lágrimas artificiales Systane", "Systane", "Alcon", "Polietilenglicol", "Óptica y lentillas", "Ojo seco", "Gotas 10 ml", "10 ml", 1, 11.20, icon="👁️", sintomas=["ojo seco"]),
    P("Pilas auditivas 312 Rayovac", "Rayovac", "Rayovac", "—", "Audición / pilas", "Pilas", "Blíster", "6 uds", 6, 6.50, iva=21, icon="👂"),
    P("Frontline Combo perros M", "Frontline", "Boehringer", "Fipronil + (S)-metoprene", "Veterinaria", "Antiparasitario", "Pipetas", "3 pipetas", 3, 28.90, iva=21, icon="🐾"),
    P("Milbemax gatos", "Milbemax", "Elanco", "Milbemicina + praziquantel", "Veterinaria", "Desparasitante", "Comprimidos", "2 comp", 2, 14.50, iva=21, icon="🐾"),
    P("Advance Adult pollo", "Advance", "Affinity", "Pienso", "Veterinaria", "Alimentación", "Saco 3 kg", "3 kg", 1, 19.90, iva=21, icon="🐾"),
    P("Chicle Nicotinell 2 mg", "Nicotinell", "Haleon", "Nicotina", "Snacks y chicles", "Cesación", "Chicles", "2 mg × 96", 96, 24.90, iva=21, icon="🚭"),
    P("Halls mentol", "Halls", "Mondelēz", "Mentol", "Snacks y chicles", "Caramelo", "Paquete", "1 ud", 1, 1.20, iva=21, icon="🍬"),
    P("Trident menta", "Trident", "Mondelēz", "—", "Snacks y chicles", "Chicle", "Paquete", "1 ud", 1, 1.50, iva=21, icon="🍬"),
    P("Aquarius naranja", "Aquarius", "Coca-Cola", "Bebida isotónica", "Bebidas", "Isotónica", "Botella 50 cl", "50 cl", 1, 1.80, iva=21, icon="💧"),
    P("Agua Font Vella 50 cl", "Font Vella", "Danone", "Agua", "Bebidas", "Agua", "Botella", "50 cl", 1, 0.90, iva=21, icon="💧"),
    P("¡Hola! Semanal", "¡Hola!", "Eduardo Sánchez", "—", "Revistas y prensa", "Prensa", "Ejemplar", "1 ud", 1, 2.50, iva=4, icon="📰"),
  ]

  # ——— Rx blocks: expand with real Spanish products + common EFG ———
  labs_efg = ["Cinfa", "Normon", "Kern Pharma", "Stada", "Teva", "Aurovitas", "Sandoz", "Mylan"]

  # Antibióticos
  ab_base = [
    ("Amoxicilina", "500 mg", 8.5, "penicilina"),
    ("Amoxicilina/clavulánico", "875/125 mg", 9.8, "penicilina"),
    ("Azitromicina", "500 mg", 7.2, "otro"),
    ("Ciprofloxacino", "500 mg", 6.5, "otro"),
    ("Doxiciclina", "100 mg", 5.4, "otro"),
    ("Cefuroxima", "500 mg", 10.2, "otro"),
    ("Claritromicina", "500 mg", 8.9, "otro"),
    ("Levofloxacino", "500 mg", 7.8, "otro"),
    ("Metronidazol", "250 mg", 4.2, "otro"),
    ("Fosfomicina trometamol", "3 g", 9.5, "otro"),
  ]
  for i, (pa, dosis, precio, grupo) in enumerate(ab_base):
    lab = labs_efg[i % len(labs_efg)]
    items.append(P(f"{pa} {lab} {dosis}", lab, lab, pa, "Antibióticos", "Oral", "Comprimidos/sobres", f"{dosis} × 14", 14, precio, grupo=grupo, icon="🦠", efg=True, rx=True))
  items += [
    P("Augmentine 875/125", "Augmentine", "GSK", "Amoxicilina/clavulánico", "Antibióticos", "Oral", "Comprimidos", "875/125 × 20", 20, 12.40, grupo="penicilina", icon="🦠", rx=True),
    P("Zinnat 500 mg", "Zinnat", "GSK", "Cefuroxima", "Antibióticos", "Oral", "Comprimidos", "500 mg × 10", 10, 14.20, icon="🦠", rx=True),
    P("Zitromax 500 mg", "Zitromax", "Pfizer", "Azitromicina", "Antibióticos", "Oral", "Comprimidos", "500 mg × 3", 3, 11.80, icon="🦠", rx=True),
  ]

  # Cardio + anticoag
  cardio = [
    ("Enalapril", "10 mg", 3.2, "ieca"), ("Enalapril", "20 mg", 3.5, "ieca"),
    ("Ramipril", "5 mg", 4.1, "ieca"), ("Amlodipino", "5 mg", 3.8, "otro"),
    ("Amlodipino", "10 mg", 4.0, "otro"), ("Bisoprolol", "5 mg", 3.6, "beta"),
    ("Atorvastatina", "20 mg", 5.2, "estatina"), ("Atorvastatina", "40 mg", 5.8, "estatina"),
    ("Simvastatina", "20 mg", 4.5, "estatina"), ("Losartán", "50 mg", 4.2, "otro"),
    ("Valsartán", "160 mg", 5.0, "otro"), ("Furosemida", "40 mg", 2.8, "otro"),
    ("Hidroclorotiazida", "25 mg", 2.5, "otro"), ("Doxazosina", "4 mg", 4.8, "otro"),
  ]
  for i, (pa, dosis, precio, grupo) in enumerate(cardio):
    lab = labs_efg[i % len(labs_efg)]
    items.append(P(f"{pa} {lab} {dosis}", lab, lab, pa, "Cardiovascular", "Oral", "Comprimidos", f"{dosis} × 28", 28, precio, grupo=grupo, icon="❤️‍🩹", efg=True, rx=True))
  items += [
    P("Adiro 100 mg", "Adiro", "Bayer", "Ácido acetilsalicílico", "Cardiovascular", "Antiagregante", "Comprimidos", "100 mg × 30", 30, 3.10, grupo="nsaid", icon="❤️‍🩹", rx=True),
    P("Seguril 40 mg", "Seguril", "Sanofi", "Furosemida", "Cardiovascular", "Diurético", "Comprimidos", "40 mg × 30", 30, 2.90, icon="❤️‍🩹", rx=True),
    P("Sintrom 4 mg", "Sintrom", "FFA", "Acenocumarol", "Anticoagulantes", "AVK", "Comprimidos", "4 mg × 20", 20, 3.50, icon="🩸", rx=True),
    P("Eliquis 5 mg", "Eliquis", "BMS/Pfizer", "Apixabán", "Anticoagulantes", "ACOD", "Comprimidos", "5 mg × 60", 60, 78.00, icon="🩸", rx=True),
    P("Xarelto 20 mg", "Xarelto", "Bayer", "Rivaroxabán", "Anticoagulantes", "ACOD", "Comprimidos", "20 mg × 28", 28, 72.50, icon="🩸", rx=True),
    P("Pradaxa 150 mg", "Pradaxa", "Boehringer", "Dabigatrán", "Anticoagulantes", "ACOD", "Cápsulas", "150 mg × 60", 60, 75.00, icon="🩸", rx=True),
  ]

  # Diabetes
  items += [
    P("Metformina Cinfa 850 mg", "Cinfa", "Cinfa", "Metformina", "Diabetes y endocrino", "Oral", "Comprimidos", "850 mg × 50", 50, 3.80, efg=True, icon="💉", rx=True),
    P("Januvia 100 mg", "Januvia", "MSD", "Sitagliptina", "Diabetes y endocrino", "Oral", "Comprimidos", "100 mg × 28", 28, 42.00, icon="💉", rx=True),
    P("Jardiance 10 mg", "Jardiance", "Boehringer", "Empagliflozina", "Diabetes y endocrino", "Oral", "Comprimidos", "10 mg × 30", 30, 58.00, icon="💉", rx=True),
    P("Ozempic 0,25 mg", "Ozempic", "Novo Nordisk", "Semaglutida", "Frigorífico / biológicos", "Inyectable", "Pluma", "0,25 mg", 1, 95.00, nevera=True, icon="❄️", rx=True),
    P("Lantus SoloStar", "Lantus", "Sanofi", "Insulina glargina", "Frigorífico / biológicos", "Insulina", "Pluma", "100 UI/ml", 1, 48.00, nevera=True, icon="❄️", rx=True),
    P("NovoRapid FlexPen", "NovoRapid", "Novo Nordisk", "Insulina aspart", "Frigorífico / biológicos", "Insulina", "Pluma", "100 UI/ml", 1, 42.00, nevera=True, icon="❄️", rx=True),
    P("Victoza 6 mg/ml", "Victoza", "Novo Nordisk", "Liraglutida", "Frigorífico / biológicos", "Inyectable", "Pluma", "6 mg/ml", 1, 88.00, nevera=True, icon="❄️", rx=True),
    P("Eutirox 50 mcg", "Eutirox", "Merck", "Levotiroxina", "Hormonas y tiroides", "Tiroides", "Comprimidos", "50 mcg × 30", 30, 2.80, icon="⚖️", rx=True),
    P("Eutirox 100 mcg", "Eutirox", "Merck", "Levotiroxina", "Hormonas y tiroides", "Tiroides", "Comprimidos", "100 mcg × 30", 30, 3.10, icon="⚖️", rx=True),
  ]

  # Respiratorio Rx
  items += [
    P("Ventolin Inhaler", "Ventolin", "GSK", "Salbutamol", "Respiratorio / asma Rx", "Rescate", "Inhalador", "100 mcg", 1, 4.50, icon="🌬️", rx=True, sintomas=["asma"]),
    P("Symbicort Turbuhaler", "Symbicort", "AstraZeneca", "Budesonida + formoterol", "Respiratorio / asma Rx", "Mantenimiento", "Inhalador", "160/4,5", 1, 42.00, icon="🌬️", rx=True, sintomas=["asma"]),
    P("Relvar Ellipta", "Relvar", "GSK", "Fluticasona + vilanterol", "Respiratorio / asma Rx", "Mantenimiento", "Inhalador", "92/22", 1, 48.00, icon="🌬️", rx=True),
    P("Spiriva Respimat", "Spiriva", "Boehringer", "Tiotropio", "Respiratorio / asma Rx", "EPOC", "Inhalador", "2,5 mcg", 1, 45.00, icon="🌬️", rx=True),
    P("Singulair 10 mg", "Singulair", "MSD", "Montelukast", "Respiratorio / asma Rx", "Oral", "Comprimidos", "10 mg × 28", 28, 18.50, icon="🌬️", rx=True, sintomas=["alergia","asma"]),
  ]

  # Digestivo Rx
  for i, (pa, dosis, precio) in enumerate([
    ("Omeprazol", "20 mg", 2.8), ("Omeprazol", "40 mg", 3.2), ("Pantoprazol", "40 mg", 3.5),
    ("Esomeprazol", "40 mg", 4.2), ("Domperidona", "10 mg", 2.5), ("Metoclopramida", "10 mg", 2.2),
    ("Mesalazina", "500 mg", 12.0), ("Budesonida intestinal", "3 mg", 28.0),
  ]):
    lab = labs_efg[i % len(labs_efg)]
    items.append(P(f"{pa} {lab} {dosis}", lab, lab, pa, "Digestivo con receta", "Oral", "Comprimidos", f"{dosis} × 28", 28, precio, grupo="ipp" if "prazol" in pa.lower() else "otro", icon="📋", efg=True, rx=True))

  # Neuro + mental + controlados
  items += [
    P("Paracetamol Normon 1 g", "Normon", "Normon", "Paracetamol", "Neurología", "Analgésico", "Comprimidos", "1 g × 40", 40, 2.90, grupo="analgesico", efg=True, icon="⚡", rx=True),
    P("Gabapentina Cinfa 300 mg", "Cinfa", "Cinfa", "Gabapentina", "Neurología", "Neuropático", "Cápsulas", "300 mg × 50", 50, 6.50, efg=True, icon="⚡", rx=True),
    P("Pregabalina Kern 75 mg", "Kern", "Kern Pharma", "Pregabalina", "Neurología", "Neuropático", "Cápsulas", "75 mg × 56", 56, 8.20, efg=True, icon="⚡", rx=True),
    P("Keppra 500 mg", "Keppra", "UCB", "Levetiracetam", "Neurología", "Antiepiléptico", "Comprimidos", "500 mg × 60", 60, 32.00, icon="⚡", rx=True),
    P("Orfidal 1 mg", "Orfidal", "Pfizer", "Lorazepam", "Controlados / estupefacientes", "Benzodiacepina", "Comprimidos", "1 mg × 25", 25, 2.40, ctrl=True, icon="🔒", rx=True, sintomas=["ansiedad","insomnio"]),
    P("Valium 5 mg", "Valium", "Roche", "Diazepam", "Controlados / estupefacientes", "Benzodiacepina", "Comprimidos", "5 mg × 25", 25, 2.20, ctrl=True, icon="🔒", rx=True),
    P("Trankimazin 0,5 mg", "Trankimazin", "Pfizer", "Alprazolam", "Controlados / estupefacientes", "Benzodiacepina", "Comprimidos", "0,5 mg × 30", 30, 2.60, ctrl=True, icon="🔒", rx=True),
    P("Zolpidem Cinfa 10 mg", "Cinfa", "Cinfa", "Zolpidem", "Controlados / estupefacientes", "Hipnótico", "Comprimidos", "10 mg × 28", 28, 3.10, ctrl=True, efg=True, icon="🔒", rx=True, sintomas=["insomnio"]),
    P("MST Continus 30 mg", "MST Continus", "Mundipharma", "Morfina", "Controlados / estupefacientes", "Opioide", "Comprimidos", "30 mg × 30", 30, 18.00, ctrl=True, icon="🔒", rx=True),
    P("Durogesic 25 mcg/h", "Durogesic", "Janssen", "Fentanilo", "Controlados / estupefacientes", "Opioide", "Parches", "25 mcg/h × 5", 5, 42.00, ctrl=True, icon="🔒", rx=True),
    P("Sertralina Cinfa 50 mg", "Cinfa", "Cinfa", "Sertralina", "Salud mental", "ISRS", "Comprimidos", "50 mg × 28", 28, 4.20, efg=True, icon="🧠", rx=True),
    P("Escitalopram Normon 10 mg", "Normon", "Normon", "Escitalopram", "Salud mental", "ISRS", "Comprimidos", "10 mg × 28", 28, 4.80, efg=True, icon="🧠", rx=True),
    P("Fluoxetina Kern 20 mg", "Kern", "Kern Pharma", "Fluoxetina", "Salud mental", "ISRS", "Cápsulas", "20 mg × 60", 60, 3.90, efg=True, icon="🧠", rx=True),
    P("Quetiapina Teva 100 mg", "Teva", "Teva", "Quetiapina", "Salud mental", "Antipsicótico", "Comprimidos", "100 mg × 60", 60, 9.50, efg=True, icon="🧠", rx=True),
    P("Risperdal 1 mg", "Risperdal", "Janssen", "Risperidona", "Salud mental", "Antipsicótico", "Comprimidos", "1 mg × 20", 20, 8.20, icon="🧠", rx=True),
  ]

  # Hormonas, anticonceptivos, corticoides, reuma, derma rx, oftalmo, urologia, gine, dispensario
  items += [
    P("Prednisona Cinfa 5 mg", "Cinfa", "Cinfa", "Prednisona", "Corticoides sistémicos", "Oral", "Comprimidos", "5 mg × 30", 30, 2.40, efg=True, icon="💉", rx=True),
    P("Dacortin 30 mg", "Dacortin", "Merck", "Prednisona", "Corticoides sistémicos", "Oral", "Comprimidos", "30 mg × 30", 30, 4.10, icon="💉", rx=True),
    P("Fortecortin 4 mg", "Fortecortin", "Merck", "Dexametasona", "Corticoides sistémicos", "Oral", "Comprimidos", "4 mg × 20", 20, 5.20, icon="💉", rx=True),
    P("Yasmin", "Yasmin", "Bayer", "Drospirenona + etinilestradiol", "Anticonceptivos Rx", "Oral", "Comprimidos", "21 comp", 21, 12.50, icon="圆环", rx=True),
    P("Diane 35", "Diane", "Bayer", "Ciproterona + etinilestradiol", "Anticonceptivos Rx", "Oral", "Comprimidos", "21 comp", 21, 11.80, icon="圆环", rx=True),
    P("Cerazette", "Cerazette", "Organon", "Desogestrel", "Anticonceptivos Rx", "Mini-píldora", "Comprimidos", "28 comp", 28, 10.90, icon="圆环", rx=True),
    P("Evra parches", "Evra", "Janssen", "Norelgestromina + etinilestradiol", "Anticonceptivos Rx", "Parche", "Parches", "3 parches", 3, 18.50, icon="圆环", rx=True),
    P("Ibuprofeno Kern 600 mg Rx", "Kern", "Kern Pharma", "Ibuprofeno", "Reumatología / dolor Rx", "AINE", "Comprimidos", "600 mg × 40", 40, 3.20, grupo="nsaid", efg=True, icon="🦴", rx=True),
    P("Tramadol/Paracetamol Cinfa", "Cinfa", "Cinfa", "Tramadol + paracetamol", "Reumatología / dolor Rx", "Opioide menor", "Comprimidos", "37,5/325 × 20", 20, 5.60, efg=True, icon="🦴", rx=True),
    P("Adolonta retard 100 mg", "Adolonta", "Grünenthal", "Tramadol", "Reumatología / dolor Rx", "Opioide menor", "Comprimidos", "100 mg × 30", 30, 7.80, icon="🦴", rx=True),
    P("Daivobet gel", "Daivobet", "Leo", "Calcipotriol + betametasona", "Dermatología Rx", "Psoriasis", "Gel 60 g", "60 g", 1, 48.00, icon="🩺", rx=True),
    P("Protopic 0,1%", "Protopic", "Leo", "Tacrolimus", "Dermatología Rx", "Dermatitis", "Pomada 30 g", "0,1%", 1, 42.00, icon="🩺", rx=True),
    P("Roaccutane 20 mg", "Roaccutane", "Roche", "Isotretinoína", "Dermatología Rx", "Acné", "Cápsulas", "20 mg × 30", 30, 28.00, icon="🩺", rx=True),
    P("Colircusi Antibiótico", "Colircusi", "Alcon", "Tobramicina", "Oftalmología Rx", "Colirio", "5 ml", "5 ml", 1, 6.50, icon="👁️", rx=True),
    P("Oftalmotrim", "Oftalmotrim", "Alcon", "Trimetoprima + polimixina", "Oftalmología Rx", "Colirio", "5 ml", "5 ml", 1, 5.80, icon="👁️", rx=True),
    P("Omnicef — skip", "x", "x", "x", "Urología", "x", "x", "x", 1, 1),
  ]
  items = [x for x in items if "skip" not in x["nombre"].lower()]
  items += [
    P("Omnic 0,4 mg", "Omnic", "Astellas", "Tamsulosina", "Urología", "HBP", "Cápsulas", "0,4 mg × 30", 30, 12.50, icon="🚽", rx=True),
    P("Finasterida Cinfa 5 mg", "Cinfa", "Cinfa", "Finasterida", "Urología", "HBP", "Comprimidos", "5 mg × 28", 28, 6.80, efg=True, icon="🚽", rx=True),
    P("Vesicare 10 mg", "Vesicare", "Astellas", "Solifenacina", "Urología", "Vejiga", "Comprimidos", "10 mg × 30", 30, 28.00, icon="🚽", rx=True),
    P("Utrogestan 200 mg", "Utrogestan", "Besins", "Progesterona", "Ginecología Rx", "Progestágeno", "Cápsulas", "200 mg × 15", 15, 14.50, icon="🎀", rx=True),
    P("Ovestin crema", "Ovestin", "Aspen", "Estriol", "Ginecología Rx", "Local", "Crema 15 g", "15 g", 1, 9.80, icon="🎀", rx=True),
    P("Humira 40 mg", "Humira", "AbbVie", "Adalimumab", "Frigorífico / biológicos", "Biológico", "Pluma", "40 mg", 1, 450.00, nevera=True, icon="❄️", rx=True),
    P("Enbrel 50 mg", "Enbrel", "Pfizer", "Etanercept", "Frigorífico / biológicos", "Biológico", "Pluma", "50 mg", 1, 420.00, nevera=True, icon="❄️", rx=True),
    P("Neupogen 30 MU", "Neupogen", "Amgen", "Filgrastim", "Dispensario / hospitalarios", "Hematología", "Jeringa", "30 MU", 1, 85.00, nevera=True, icon="🏥", rx=True),
    P("Clexane 40 mg", "Clexane", "Sanofi", "Enoxaparina", "Dispensario / hospitalarios", "Heparina", "Jeringa", "40 mg", 1, 8.50, icon="🏥", rx=True),
    P("Fragmin 5000 UI", "Fragmin", "Pfizer", "Dalteparina", "Dispensario / hospitalarios", "Heparina", "Jeringa", "5000 UI", 1, 7.90, icon="🏥", rx=True),
  ]

  # Expand systematically: more EFG dosis for common molecules to reach "as needed" volume
  extra_mols = [
    ("Paracetamol", "Dolor y fiebre", [500, 650, 1000], 4.0, "analgesico", False),
    ("Ibuprofeno", "Dolor y fiebre", [200, 400, 600], 3.5, "nsaid", False),
    ("Omeprazol", "Digestivo OTC", [20], 4.5, "ipp", False),
    ("Loratadina", "Alergia / antihistamínicos", [10], 5.5, "antihistaminico", False),
    ("Cetirizina", "Alergia / antihistamínicos", [10], 5.2, "antihistaminico", False),
    ("Amoxicilina", "Antibióticos", [250, 500, 1000], 6.0, "penicilina", True),
    ("Enalapril", "Cardiovascular", [5, 10, 20], 3.0, "ieca", True),
    ("Atorvastatina", "Cardiovascular", [10, 20, 40, 80], 4.5, "estatina", True),
    ("Metformina", "Diabetes y endocrino", [850, 1000], 3.2, "otro", True),
    ("Sertralina", "Salud mental", [50, 100], 4.0, "otro", True),
    ("Pantoprazol", "Digestivo con receta", [20, 40], 3.3, "ipp", True),
    ("Simvastatina", "Cardiovascular", [10, 20, 40], 3.8, "estatina", True),
    ("Amlodipino", "Cardiovascular", [5, 10], 3.5, "otro", True),
    ("Losartán", "Cardiovascular", [50, 100], 4.0, "otro", True),
    ("Levotiroxina", "Hormonas y tiroides", [25, 50, 75, 100, 125, 150], 2.5, "otro", True),
  ]
  # Más moléculas EFG reales frecuentes en farmacia española
  extra_mols += [
    ("Ramipril", "Cardiovascular", [2.5, 5, 10], 3.4, "ieca", True),
    ("Bisoprolol", "Cardiovascular", [2.5, 5, 10], 3.2, "beta", True),
    ("Furosemida", "Cardiovascular", [40], 2.4, "otro", True),
    ("Clopidogrel", "Cardiovascular", [75], 5.5, "otro", True),
    ("Omeprazol", "Digestivo con receta", [20, 40], 2.9, "ipp", True),
    ("Esomeprazol", "Digestivo con receta", [20, 40], 3.6, "ipp", True),
    ("Azitromicina", "Antibióticos", [250, 500], 6.8, "otro", True),
    ("Ciprofloxacino", "Antibióticos", [250, 500], 5.9, "otro", True),
    ("Doxiciclina", "Antibióticos", [100], 4.8, "otro", True),
    ("Tramadol", "Reumatología / dolor Rx", [50, 100], 4.2, "otro", True),
    ("Gabapentina", "Neurología", [300, 600], 5.5, "otro", True),
    ("Pregabalina", "Neurología", [75, 150], 6.2, "otro", True),
    ("Quetiapina", "Salud mental", [25, 100, 200], 5.0, "otro", True),
    ("Venlafaxina", "Salud mental", [75, 150], 5.8, "otro", True),
    ("Mirtazapina", "Salud mental", [15, 30], 4.9, "otro", True),
    ("Tamsulosina", "Urología", [0.4], 5.2, "otro", True),
    ("Finasterida", "Urología", [5], 5.0, "otro", True),
    ("Montelukast", "Respiratorio / asma Rx", [10], 7.5, "otro", True),
    ("Cetirizina", "Alergia / antihistamínicos", [10], 4.8, "antihistaminico", False),
    ("Desloratadina", "Alergia / antihistamínicos", [5], 5.5, "antihistaminico", False),
    ("Acetilcisteína", "Tos y mucolíticos", [200, 600], 5.0, "otro", False),
    ("Ambroxol", "Tos y mucolíticos", [30], 4.5, "otro", False),
    ("Loperamida", "Digestivo OTC", [2], 4.2, "otro", False),
    ("Simeticona", "Digestivo OTC", [40], 4.0, "otro", False),
    ("Metformina", "Diabetes y endocrino", [500, 850, 1000], 3.0, "otro", True),
    ("Gliclazida", "Diabetes y endocrino", [30, 60], 4.4, "otro", True),
    ("Alopurinol", "Reumatología / dolor Rx", [100, 300], 3.5, "otro", True),
    ("Colchicina", "Reumatología / dolor Rx", [0.5, 1], 4.0, "otro", True),
    ("Prednisona", "Corticoides sistémicos", [5, 10, 30], 2.8, "otro", True),
    ("Dexametasona", "Corticoides sistémicos", [4], 3.5, "otro", True),
  ]

  seen = {(x["nombre"], x["marca"]) for x in items}
  for pa, cat, dosis_list, base_price, grupo, rx in extra_mols:
    for dosis in dosis_list:
      for lab in labs_efg:  # all labs
        dosis_txt = f"{dosis} mg" if dosis >= 1 else f"{dosis} mg"
        nombre = f"{pa} {lab} {dosis_txt}"
        key = (nombre, lab)
        if key in seen:
          continue
        seen.add(key)
        items.append(P(
          nombre, lab, lab, pa, cat, "EFG", "Comprimidos",
          f"{dosis_txt} × 28", 28, round(base_price + (dosis if dosis >= 1 else dosis * 10) / 200, 2),
          grupo=grupo, icon="💊", efg=True, rx=rx or CAT_BY_NAME[cat]["rx"],
        ))

  # Parafarmacia extra marcas
  para = [
    ("Isdin Lambdapil cápsulas", "Isdin", "Isdin", "Cystine+", "Capilar", "Anticaída", "60 cáps", 28.9),
    ("Sesderma C-Vit", "Sesderma", "Sesderma", "Vitamina C", "Piel y dermatología", "Antiedad", "30 ml", 32.0),
    ("Martiderm Proteos Screen", "Martiderm", "Martiderm", "Filtros", "Solar y fotoprotección", "Facial", "40 ml", 29.5),
    ("SVR Sebiaclear", "SVR", "SVR", "Cuidado acné", "Piel y dermatología", "Acné", "40 ml", 15.9),
    ("Uriach Aquilea Sueño", "Aquilea", "Uriach", "Melatonina + plantas", "Fitoterapia", "Sueño", "30 comp", 11.5),
    ("Arkocápsulas Harpagofito", "Arkocápsulas", "Arkopharma", "Harpagofito", "Fitoterapia", "Articulaciones", "45 cáps", 10.8),
    ("Cinfa Dental pasta", "Cinfa", "Cinfa", "Fluoruro", "Higiene bucal", "Pasta", "75 ml", 3.9),
    ("Fluocaril pasta", "Fluocaril", "Zambon", "Fluoruro", "Higiene bucal", "Pasta", "75 ml", 5.2),
    ("Kiss My Eyes — skip", "x", "x", "x", "Óptica y lentillas", "x", "x", 1),
  ]
  for row in para:
    if "skip" in row[0].lower():
      continue
    nombre, marca, lab, pa, cat, sub, presentacion, precio = row
    if (nombre, marca) in seen:
      continue
    items.append(P(nombre, marca, lab, pa, cat, sub, presentacion, presentacion, 1, precio, iva=21, icon="🧴"))

  # Solar / piel / vitaminas more brand variety
  more_otc = [
    ("Isdin Fotoprotector Fusion Water SPF50+", "Isdin", "Isdin", "Filtros", "Solar y fotoprotección", "Facial", "50 ml", 24.9),
    ("Heliocare 360 Gel Oil-Free", "Heliocare", "Cantabria Labs", "Filtros", "Solar y fotoprotección", "Facial", "50 ml", 27.5),
    ("Avene Cleanance", "Avène", "Pierre Fabre", "Cuidado acné", "Piel y dermatología", "Acné", "40 ml", 14.9),
    ("CeraVe Crema hidratante", "CeraVe", "L'Oréal", "Ceramidas", "Piel y dermatología", "Hidratante", "340 ml", 16.5),
    ("Bioderma Sensibio H2O", "Bioderma", "NAOS", "Agua micelar", "Piel y dermatología", "Limpieza", "500 ml", 13.9),
    ("Pharmaton Complex", "Pharmaton", "Sanofi", "Multivitamínico + ginseng", "Vitaminas y minerales", "Energía", "30 cáps", 15.9),
    ("Dormidina 25 mg", "Dormidina", "Teva", "Doxilamina", "Viaje y botiquín", "Sueño", "14 comp", 6.2),
    ("Buco Rhinathiol", "Rhinathiol", "Sanofi", "Carbocisteína", "Tos y mucolíticos", "Mucolítico", "200 ml", 8.7),
  ]
  for nombre, marca, lab, pa, cat, sub, presentacion, precio in more_otc:
    if (nombre, marca) in seen:
      continue
    items.append(P(nombre, marca, lab, pa, cat, sub, presentacion, presentacion, 1, precio, iva=21 if cat.startswith("Solar") or cat.startswith("Piel") or cat.startswith("Vitaminas") else 4, icon="🧴"))
    seen.add((nombre, marca))

  # ——— FASE 2: rellenar categorías finas + más marcas España ———
  fase2 = [
    # Resfriado
    ("Frenadol Descongestivo", "Frenadol", "J&J", "Paracetamol + fenilefrina", "Resfriado y gripe", "Gripe", "Comprimidos", "16 comp", 16, 8.95, 4, "analgesico", "🤧", ["fiebre", "congestión"]),
    ("Bisolgrip sobres", "Bisolgrip", "Boehringer", "Paracetamol + fenilefrina + clorfenamina", "Resfriado y gripe", "Gripe", "Sobres", "10 sobres", 10, 9.10, 4, "analgesico", "🤒", ["fiebre", "congestión"]),
    ("Couldina Instantánea", "Couldina", "Uriach", "AAS + clorfenamina + cafeína", "Resfriado y gripe", "Gripe", "Sobres", "10 sobres", 10, 8.40, 4, "nsaid", "🤧", ["fiebre"]),
    ("Rinovin spray", "Rinovin", "Cinfa", "Oximetazolina", "Resfriado y gripe", "Descongestivo", "Spray 15 ml", "0,5 mg/ml", 1, 6.50, 4, "otro", "👃", ["congestión"]),
    ("Physiomer Adultos", "Physiomer", "Laboratoires de la Mer", "Agua de mar", "Resfriado y gripe", "Lavado nasal", "Spray 135 ml", "Isotónica", 1, 9.20, 21, "otro", "🌊", ["congestión"]),
    # Tos
    ("Paxirasol pastillas", "Paxirasol", "Ferrer", "Dextrometorfano", "Tos y mucolíticos", "Antitusivo", "Pastillas", "20 uds", 20, 7.10, 4, "otro", "🍬", ["tos"]),
    ("Bisolvon Mucolitico", "Bisolvon", "Boehringer", "Bromhexina", "Tos y mucolíticos", "Mucolítico", "Comprimidos", "8 mg × 20", 20, 6.80, 4, "otro", "🫁", ["tos"]),
    ("Fluimucil Infantíl", "Fluimucil", "Zambon", "Acetilcisteína", "Tos y mucolíticos", "Pediátrico", "Sobres", "100 mg × 30", 30, 8.50, 4, "otro", "🧒", ["tos"]),
    ("Cinfamucol acetilcisteína", "Cinfamucol", "Cinfa", "Acetilcisteína", "Tos y mucolíticos", "Mucolítico", "Sobres", "600 mg × 20", 20, 7.90, 4, "otro", "🫧", ["tos"]),
    # Probióticos
    ("Casenbiotic sobres", "Casenbiotic", "Casen", "Lactobacillus", "Probióticos y flora", "Flora", "Sobres", "10 sobres", 10, 12.50, 21, "otro", "🦠", ["diarrea"]),
    ("Ultra Levura 250 mg", "Ultra-Levura", "Biocodex", "Saccharomyces boulardii", "Probióticos y flora", "Flora", "Cápsulas", "250 mg × 20", 20, 11.80, 4, "otro", "🦠", ["diarrea"]),
    ("Lactophilus", "Lactophilus", "Sanofi", "Lactobacillus", "Probióticos y flora", "Flora", "Cápsulas", "30 cáps", 30, 10.90, 21, "otro", "🦠", ["diarrea"]),
    ("Enterolactis Plus", "Enterolactis", "Sofar", "L. casei", "Probióticos y flora", "Flora", "Cápsulas", "30 cáps", 30, 13.50, 21, "otro", "🦠", []),
    # Capilar
    ("Priorin cápsulas", "Priorin", "Bayer", "Mijo + vitaminas", "Capilar", "Anticaída", "Cápsulas", "60 cáps", 60, 26.90, 21, "otro", "💇", []),
    ("Pantene clínica — skip", "x", "x", "x", "Capilar", "x", "x", "x", 1, 1, 21, "otro", "💇", []),
    ("Vichy Dercos Aminexil", "Vichy", "L'Oréal", "Aminexil", "Capilar", "Anticaída", "Ampollas", "12 amp", 12, 34.00, 21, "otro", "💇", []),
    ("Ducray Anaphase champú", "Ducray", "Pierre Fabre", "Champú anticaída", "Capilar", "Champú", "400 ml", "400 ml", 1, 16.50, 21, "otro", "💇", []),
    ("Pilopeptan Woman", "Pilopeptan", "Ferrer", "Complejo capilar", "Capilar", "Anticaída", "Comprimidos", "30 comp", 30, 29.90, 21, "otro", "💇", []),
    # Salud íntima
    ("Gynea Gine-canestén", "Gine-Canestén", "Bayer", "Clotrimazol", "Salud íntima y sexual", "Antifúngico", "Crema 20 g", "1%", 1, 9.80, 4, "otro", "❤️", []),
    ("Durex Natural Plus", "Durex", "Reckitt", "Preservativo", "Salud íntima y sexual", "Preservativo", "Caja 12", "12 uds", 12, 9.50, 21, "otro", "❤️", []),
    ("Control Nature", "Control", "Artsana", "Preservativo", "Salud íntima y sexual", "Preservativo", "Caja 12", "12 uds", 12, 7.90, 21, "otro", "❤️", []),
    ("Gynosoft gel", "Gynosoft", "Isdin", "Lubricante", "Salud íntima y sexual", "Lubricante", "Gel 50 ml", "50 ml", 1, 11.20, 21, "otro", "❤️", []),
    ("Fluomizin óvulos", "Fluomizin", "Pierre Fabre", "Cloruro de dequalinio", "Salud íntima y sexual", "Óvulos", "6 óvulos", "6", 6, 14.50, 4, "otro", "❤️", []),
    # Infantil
    ("Apiretal solución", "Apiretal", "Ern", "Paracetamol", "Infantil / pediatría OTC", "Analgésico", "Solución 60 ml", "100 mg/ml", 1, 5.20, 4, "analgesico", "🧒", ["fiebre", "dolor"]),
    ("Dalsy suspensión", "Dalsy", "Abbott", "Ibuprofeno", "Infantil / pediatría OTC", "AINE", "Suspensión 200 ml", "20 mg/ml", 1, 6.80, 4, "nsaid", "🧒", ["fiebre", "dolor"]),
    ("Blevit digest", "Blevit", "Ordesa", "Infusión", "Infantil / pediatría OTC", "Digestivo", "Bote 150 g", "150 g", 1, 8.90, 21, "otro", "🧒", ["gases"]),
    ("Suero Oral Pedialyte", "Pedialyte", "Abbott", "Sales rehidratación", "Infantil / pediatría OTC", "Rehidratación", "Botella 500 ml", "500 ml", 1, 4.50, 4, "otro", "🧒", ["diarrea"]),
    ("NasoFaes Fluid+", "NasoFaes", "Faes", "Suero fisiológico", "Infantil / pediatría OTC", "Nasal", "Monodosis", "30 uds", 30, 6.40, 4, "otro", "🧒", ["congestión"]),
    ("Bactil infantil — skip", "x", "x", "x", "Infantil / pediatría OTC", "x", "x", "x", 1, 1, 4, "otro", "🧒", []),
    # Embarazo
    ("Supradyn Prenatal", "Supradyn", "Bayer", "Multivitamínico prenatal", "Embarazo y lactancia", "Vitaminas", "Comprimidos", "30 comp", 30, 14.90, 21, "otro", "🤰", ["vitaminas"]),
    ("Natalben Supra", "Natalben", "Italfarmaco", "Ácido fólico + DHA", "Embarazo y lactancia", "Vitaminas", "Cápsulas", "30 cáps", 30, 16.50, 21, "otro", "🤰", ["vitaminas"]),
    ("Cariban cápsulas", "Cariban", "Inibsa", "Doxilamina + piridoxina", "Embarazo y lactancia", "Náuseas", "Cápsulas", "24 cáps", 24, 9.80, 4, "otro", "🤰", ["náuseas"]),
    ("Seidibion Mater", "Seidibion", "Seid", "Complejo prenatal", "Embarazo y lactancia", "Vitaminas", "Cápsulas", "30 cáps", 30, 15.20, 21, "otro", "🤰", ["vitaminas"]),
    # Nutrición
    ("Ensure Plus vainilla", "Ensure", "Abbott", "Nutrición oral", "Nutrición / dietética", "Complemento", "Botella 200 ml", "200 ml", 1, 3.80, 4, "otro", "🥗", []),
    ("Meritene Force", "Meritene", "Nestlé", "Proteínas + vitaminas", "Nutrición / dietética", "Complemento", "Bote 400 g", "400 g", 1, 18.90, 21, "otro", "🥗", ["vitaminas"]),
    ("Resource Diabet", "Resource", "Nestlé", "Nutrición diabetes", "Nutrición / dietética", "Complemento", "Brick 200 ml", "200 ml", 1, 3.50, 4, "otro", "🥗", []),
    ("Optisource High Protein", "Optisource", "Nestlé", "Proteína", "Nutrición / dietética", "Complemento", "Brick", "200 ml", 1, 3.20, 4, "otro", "🥗", []),
    # Deporte
    ("Voltaren Dolorex — skip", "x", "x", "x", "Deporte y articulaciones", "x", "x", "x", 1, 1, 4, "otro", "🏃", []),
    ("Fisiocrem gel", "Fisiocrem", "Laboratorios Viñas", "Árnica + Hypericum", "Deporte y articulaciones", "Tópico", "Gel 250 ml", "250 ml", 1, 14.90, 21, "otro", "🏃", ["dolor muscular"]),
    ("Thrombocid Forte", "Thrombocid", "Lacer", "Pentosano polisulfato", "Deporte y articulaciones", "Tópico", "Gel 60 g", "60 g", 1, 12.50, 4, "otro", "🏃", ["dolor muscular"]),
    ("Illasis rodillera", "Illasis", "Farmalastic", "Tejido elástico", "Deporte y articulaciones", "Soporte", "Talla M", "1 ud", 1, 11.90, 21, "otro", "🏃", ["dolor muscular"]),
    ("Magnesio Sport Aquilea", "Aquilea", "Uriach", "Magnesio", "Deporte y articulaciones", "Mineral", "Comprimidos", "30 comp", 30, 9.50, 21, "otro", "🏃", []),
    # Viaje
    ("Biodramina 50 mg", "Biodramina", "Uriach", "Dimenhidrinato", "Viaje y botiquín", "Mareo", "Comprimidos", "50 mg × 12", 12, 6.20, 4, "otro", "✈️", ["mareo"]),
    ("Cinfamar 50 mg", "Cinfamar", "Cinfa", "Difenhidramina", "Viaje y botiquín", "Mareo", "Comprimidos", "50 mg × 12", 12, 5.40, 4, "otro", "✈️", ["mareo"]),
    ("Relec Familiar spray", "Relec", "Reckitt", "Icaridina", "Viaje y botiquín", "Insectos", "Spray 100 ml", "100 ml", 1, 10.50, 21, "otro", "✈️", ["picaduras"]),
    ("After Bite clásico", "After Bite", "Tender", "Amoníaco", "Viaje y botiquín", "Picaduras", "Lápiz", "1 ud", 1, 5.90, 21, "otro", "✈️", ["picaduras"]),
    # Apósitos
    ("Hansaplast Universal", "Hansaplast", "Beiersdorf", "Apósito", "Apósitos y primeros auxilios", "Tiras", "Caja 40", "40 uds", 40, 4.50, 21, "otro", "🩹", ["heridas"]),
    ("Compeed Ampollas medianas", "Compeed", "J&J", "Hidrocoloide", "Apósitos y primeros auxilios", "Ampollas", "Sobre", "5 uds", 5, 7.90, 21, "otro", "🩹", ["heridas"]),
    ("Betadine solución", "Betadine", "Meda", "Povidona yodada", "Apósitos y primeros auxilios", "Antiséptico", "125 ml", "10%", 1, 6.80, 4, "otro", "🩹", ["heridas"]),
    ("Cristalmina spray", "Cristalmina", "Salvat", "Clorhexidina", "Apósitos y primeros auxilios", "Antiséptico", "Spray 125 ml", "125 ml", 1, 7.20, 4, "otro", "🩹", ["heridas"]),
    ("Suavinex gasas — skip", "x", "x", "x", "Apósitos y primeros auxilios", "x", "x", "x", 1, 1, 21, "otro", "🩹", []),
    ("Steri-Strip 3M", "Steri-Strip", "3M", "Sutura cutánea", "Apósitos y primeros auxilios", "Cierre", "Sobre", "6 tiras", 6, 8.50, 21, "otro", "🩹", ["heridas"]),
    # Ortopedia
    ("Farmalastic tobillera", "Farmalastic", "Farmalastic", "Elástica", "Ortopedia ligera", "Tobillo", "Talla M", "1 ud", 1, 14.90, 21, "otro", "🦴", ["dolor muscular"]),
    ("Farmalastic muñequera", "Farmalastic", "Farmalastic", "Elástica", "Ortopedia ligera", "Muñeca", "Talla Única", "1 ud", 1, 12.50, 21, "otro", "🦴", ["dolor muscular"]),
    ("Cervical collar blando", "Orliman", "Orliman", "Collarín", "Ortopedia ligera", "Cuello", "Talla M", "1 ud", 1, 18.90, 21, "otro", "🦴", ["dolor"]),
    ("Bastón aluminio regulable", "Forta", "Forta", "Ayuda marcha", "Ortopedia ligera", "Marcha", "1 ud", "1 ud", 1, 22.00, 21, "otro", "🦴", []),
    # Óptica
    ("Opti-Free Puremoist 300 ml", "Opti-Free", "Alcon", "Solución lentillas", "Óptica y lentillas", "Mantenimiento", "300 ml", "300 ml", 1, 12.90, 21, "otro", "👓", []),
    ("Renu MultiPlus", "Renu", "Bausch+Lomb", "Solución lentillas", "Óptica y lentillas", "Mantenimiento", "360 ml", "360 ml", 1, 11.50, 21, "otro", "👓", []),
    ("Acuvue lágrimas — Systane", "Systane", "Alcon", "Lágrimas artificiales", "Óptica y lentillas", "Ojo seco", "10 ml", "10 ml", 1, 9.80, 4, "otro", "👓", []),
    ("Avizor Compleat", "Avizor", "Avizor", "Solución lentillas", "Óptica y lentillas", "Mantenimiento", "350 ml", "350 ml", 1, 10.90, 21, "otro", "👓", []),
    # Audio
    ("Pilas Audilo 312", "Audilo", "Audilo", "Zinc-aire", "Audición / pilas", "Pilas", "Blíster 6", "6 uds", 6, 5.50, 21, "otro", "👂", []),
    ("Pilas Power One 13", "Power One", "Varta", "Zinc-aire", "Audición / pilas", "Pilas", "Blíster 6", "6 uds", 6, 6.20, 21, "otro", "👂", []),
    ("Pilas Rayovac 675", "Rayovac", "Spectrum", "Zinc-aire", "Audición / pilas", "Pilas", "Blíster 6", "6 uds", 6, 5.90, 21, "otro", "👂", []),
    # Vet
    ("Frontline Spot-On perro", "Frontline", "Boehringer", "Fipronilo", "Veterinaria", "Antiparasitario", "Pipetas", "3 uds", 3, 24.90, 21, "otro", "🐾", []),
    ("Advantix perro M", "Advantix", "Elanco", "Imidacloprid + permetrina", "Veterinaria", "Antiparasitario", "Pipetas", "4 uds", 4, 28.50, 21, "otro", "🐾", []),
    ("Drontal gato", "Drontal", "Elanco", "Praziquantel + pirantel", "Veterinaria", "Desparasitante", "Comprimidos", "2 comp", 2, 9.80, 21, "otro", "🐾", []),
    ("Saco arena Catsan", "Catsan", "Mars", "Arena", "Veterinaria", "Higiene", "Saco 10 L", "10 L", 1, 8.50, 21, "otro", "🐾", []),
    # Snacks / bebidas / revistas
    ("Chicles Trident menta", "Trident", "Mondelez", "Xilitol", "Snacks y chicles", "Chicles", "Paquete", "1 ud", 1, 1.80, 21, "otro", "🍫", []),
    ("Chicles Smint", "Smint", "Perfetti", "Edulcorantes", "Snacks y chicles", "Pastillas", "Bote", "1 ud", 1, 2.20, 21, "otro", "🍫", []),
    ("Chocolate Nestlé pequeño", "Nestlé", "Nestlé", "Cacao", "Snacks y chicles", "Snack", "Barrita", "1 ud", 1, 1.50, 21, "otro", "🍫", []),
    ("Haribo Ositos", "Haribo", "Haribo", "Gominolas", "Snacks y chicles", "Snack", "Bolsa 90 g", "90 g", 1, 1.70, 21, "otro", "🍫", []),
    ("Agua Lanjarón 50 cl", "Lanjarón", "Danone", "Agua mineral", "Bebidas", "Agua", "Botella", "50 cl", 1, 0.90, 10, "otro", "💧", []),
    ("Aquarius naranja 50 cl", "Aquarius", "Coca-Cola", "Bebida isotónica", "Bebidas", "Isotónica", "Botella", "50 cl", 1, 1.60, 10, "otro", "💧", []),
    ("Red Bull 25 cl", "Red Bull", "Red Bull", "Cafeína", "Bebidas", "Energética", "Lata", "25 cl", 1, 1.90, 10, "otro", "💧", []),
    ("¡Hola! semanal", "¡Hola!", "Hola SA", "Prensa", "Revistas y prensa", "Revista", "Ejemplar", "1 ud", 1, 2.50, 4, "otro", "📰", []),
    ("Pronto semanal", "Pronto", "Zinet Media", "Prensa", "Revistas y prensa", "Revista", "Ejemplar", "1 ud", 1, 1.80, 4, "otro", "📰", []),
    ("Muy Interesante", "Muy Interesante", "Zinet", "Prensa", "Revistas y prensa", "Revista", "Ejemplar", "1 ud", 1, 3.50, 4, "otro", "📰", []),
    # Vitaminas / fitoterapia extra
    ("Supradyn Activo", "Supradyn", "Bayer", "Multivitamínico", "Vitaminas y minerales", "Energía", "Comprimidos", "30 comp", 30, 12.90, 21, "otro", "🍊", ["vitaminas"]),
    ("Juvamine Vitamina C", "Juvamine", "Urgo", "Ácido ascórbico", "Vitaminas y minerales", "Vit C", "Comprimidos", "30 comp", 30, 6.50, 21, "otro", "🍊", ["vitaminas"]),
    ("Cinfa Vitamina D3 1000 UI", "Cinfa", "Cinfa", "Colecalciferol", "Vitaminas y minerales", "Vit D", "Comprimidos", "30 comp", 30, 7.20, 21, "otro", "🍊", ["vitaminas"]),
    ("Valerianorm", "Valerianorm", "Cinfa", "Valeriana", "Fitoterapia", "Sueño", "Comprimidos", "30 comp", 30, 8.40, 21, "otro", "🌿", ["estres", "insomnio"]),
    ("Passiflora Arkocápsulas", "Arkocápsulas", "Arkopharma", "Passiflora", "Fitoterapia", "Ansiedad leve", "Cápsulas", "50 cáps", 50, 9.90, 21, "otro", "🌿", ["estres"]),
    # Bucal
    ("Lacer pasta con flúor", "Lacer", "Lacer", "Fluoruro", "Higiene bucal", "Pasta", "75 ml", "75 ml", 1, 4.80, 21, "otro", "😁", []),
    ("Vitis encías colutorio", "Vitis", "Dentaid", "Clorhexidina baja", "Higiene bucal", "Colutorio", "500 ml", "500 ml", 1, 8.90, 21, "otro", "😁", []),
    ("GUM hilo dental", "GUM", "Sunstar", "Hilo", "Higiene bucal", "Hilo", "1 ud", "1 ud", 1, 3.50, 21, "otro", "😁", []),
    # Solar extra
    ("Ladival niños SPF50+", "Ladival", "Stada", "Filtros", "Solar y fotoprotección", "Pediátrico", "200 ml", "200 ml", 1, 18.90, 21, "otro", "☀", ["solar"]),
    ("Isdin Pediatrics Fusion Fluid", "Isdin", "Isdin", "Filtros", "Solar y fotoprotección", "Pediátrico", "50 ml", "50 ml", 1, 22.50, 21, "otro", "☀", ["solar"]),
    ("Eucerin Oil Control SPF50+", "Eucerin", "Beiersdorf", "Filtros", "Solar y fotoprotección", "Facial", "50 ml", "50 ml", 1, 21.90, 21, "otro", "☀", ["solar"]),
    # Anticoagulantes / oftalmo / gine / derma / frigo / dispensario
    ("Sintrom 4 mg", "Sintrom", "Novartis", "Acenocumarol", "Anticoagulantes", "AVK", "Comprimidos", "4 mg × 20", 20, 3.20, 4, "otro", "🩸", []),
    ("Aldocumar 5 mg", "Aldocumar", "Aldo-Unión", "Warfarina", "Anticoagulantes", "AVK", "Comprimidos", "5 mg × 50", 50, 4.10, 4, "otro", "🩸", []),
    ("Eliquis 5 mg", "Eliquis", "BMS", "Apixabán", "Anticoagulantes", "ACOD", "Comprimidos", "5 mg × 60", 60, 85.00, 4, "otro", "🩸", []),
    ("Xarelto 20 mg", "Xarelto", "Bayer", "Rivaroxabán", "Anticoagulantes", "ACOD", "Comprimidos", "20 mg × 28", 28, 78.00, 4, "otro", "🩸", []),
    ("Colircusi Gentamicina", "Colircusi", "Alcon", "Gentamicina", "Oftalmología Rx", "Colirio", "5 ml", "5 ml", 1, 5.90, 4, "otro", "👁️", []),
    ("Oftalmotrim UD", "Oftalmotrim", "Alcon", "Trimetoprima + polimixina", "Oftalmología Rx", "Colirio", "Monodosis", "20 uds", 20, 8.50, 4, "otro", "👁️", []),
    ("Visine clásico OTC skip rx", "Visine", "J&J", "Tetrizolina", "Oftalmología Rx", "Colirio", "15 ml", "15 ml", 1, 7.20, 4, "otro", "👁️", []),
    ("Zoely", "Zoely", "Theramex", "Nomegestrol + estradiol", "Anticonceptivos Rx", "Oral", "Comprimidos", "28 comp", 28, 14.50, 4, "otro", "圆环", []),
    ("Seasonique", "Seasonique", "Teva", "Levonorgestrel + EE", "Anticonceptivos Rx", "Oral", "Comprimidos", "91 comp", 91, 22.00, 4, "otro", "圆环", []),
    ("Mirena DIU (simulado)", "Mirena", "Bayer", "Levonorgestrel", "Ginecología Rx", "DIU", "Dispositivo", "1 ud", 1, 180.00, 4, "otro", "🎀", []),
    ("Cyclogest 400 mg", "Cyclogest", "Gedeon", "Progesterona", "Ginecología Rx", "Óvulos", "Óvulos", "15 uds", 15, 28.00, 4, "otro", "🎀", []),
    ("Differin gel 0,1%", "Differin", "Galderma", "Adapaleno", "Dermatología Rx", "Acné", "Gel 30 g", "0,1%", 1, 18.50, 4, "otro", "🩺", []),
    ("Epiduo gel", "Epiduo", "Galderma", "Adapaleno + BPO", "Dermatología Rx", "Acné", "Gel 30 g", "30 g", 1, 32.00, 4, "otro", "🩺", []),
    ("Protopic 0,03%", "Protopic", "Leo", "Tacrolimus", "Dermatología Rx", "Dermatitis", "Pomada 30 g", "0,03%", 1, 38.00, 4, "otro", "🩺", []),
    ("Ozempic 1 mg", "Ozempic", "Novo Nordisk", "Semaglutida", "Frigorífico / biológicos", "GLP-1", "Pluma", "1 mg", 1, 120.00, 4, "otro", "❄️", []),
    ("Tresiba 100 U/ml", "Tresiba", "Novo Nordisk", "Insulina degludec", "Frigorífico / biológicos", "Insulina", "Pluma", "3 ml", 1, 55.00, 4, "otro", "❄️", []),
    ("Lantus SoloStar", "Lantus", "Sanofi", "Insulina glargina", "Frigorífico / biológicos", "Insulina", "Pluma", "3 ml", 1, 48.00, 4, "otro", "❄️", []),
    ("Humalog KwikPen", "Humalog", "Lilly", "Insulina lispro", "Frigorífico / biológicos", "Insulina", "Pluma", "3 ml", 1, 42.00, 4, "otro", "❄️", []),
    ("Clexane 60 mg", "Clexane", "Sanofi", "Enoxaparina", "Dispensario / hospitalarios", "Heparina", "Jeringa", "60 mg", 1, 9.80, 4, "otro", "🏥", []),
    ("Fragmin 7500 UI", "Fragmin", "Pfizer", "Dalteparina", "Dispensario / hospitalarios", "Heparina", "Jeringa", "7500 UI", 1, 9.20, 4, "otro", "🏥", []),
    ("Neulasta 6 mg", "Neulasta", "Amgen", "Pegfilgrastim", "Dispensario / hospitalarios", "Hematología", "Jeringa", "6 mg", 1, 950.00, 4, "otro", "🏥", []),
    # Controlados extra
    ("MST Continus 30 mg", "MST Continus", "Mundipharma", "Morfina", "Controlados / estupefacientes", "Opioide", "Comprimidos", "30 mg × 30", 30, 12.00, 4, "otro", "🔒", []),
    ("Oxynorm 10 mg", "Oxynorm", "Mundipharma", "Oxicodona", "Controlados / estupefacientes", "Opioide", "Cápsulas", "10 mg × 28", 28, 14.50, 4, "otro", "🔒", []),
    ("Fentanilo matriz 25 mcg", "Matrifen", "Takeda", "Fentanilo", "Controlados / estupefacientes", "Opioide", "Parches", "25 mcg × 5", 5, 28.00, 4, "otro", "🔒", []),
  ]
  for row in fase2:
    if "skip" in row[0].lower():
      continue
    nombre, marca, lab, pa, cat, sub, presentacion, dosis, uds, precio, iva, grupo, icon, sintomas = row
    if (nombre, marca) in seen:
      continue
    # nevera / controlado flags
    nevera = cat.startswith("Frigorífico") or pa.lower().startswith("insulina") or "semaglutida" in pa.lower() or "pegfilgrastim" in pa.lower() or "filgrastim" in pa.lower()
    if nombre.startswith(("Ozempic", "Tresiba", "Lantus", "Humalog", "Neulasta", "Humira", "Enbrel")):
      nevera = True
    ctrl = cat.startswith("Controlados")
    rx = CAT_BY_NAME[cat]["rx"]
    # Mark nevera products properly for insulin/GLP1 already in frigo cat
    if cat.startswith("Frigorífico"):
      nevera = True
    items.append(P(
      nombre, marca, lab, pa, cat, sub, presentacion, dosis, uds, precio,
      iva=iva, grupo=grupo, icon=icon, sintomas=sintomas,
      efg=("Cinfa" in marca or "Cinfa" in lab) and "EFG" not in nombre,
      rx=rx, ctrl=ctrl, nevera=nevera,
    ))
    seen.add((nombre, marca))

  # Assign ids, sku, ean, stock, lote, caducidad, procedimiento
  for i, p in enumerate(items, start=1):
    p["id"] = i
    pref = "RX" if p["requiereReceta"] else "OTC"
    p["sku"] = f"{pref}-{i:04d}"
    p["ean"] = f"840{i:010d}"
    p["stock"] = 8 + (i * 7) % 90
    p["stockInicial"] = p["stock"]
    p["lote"] = f"L{100000 + (i * 17) % 899999}"
    p["caducidadMs"] = BASE_MS + (120 + (i * 13) % 600) * MS_DIA
    p["procedimiento"] = proc_for(p)
    p["manualPagina"] = True

  return items


def write_catalog_js(products):
  # Categorias UI with counts
  counts = {}
  for p in products:
    counts[p["categoria"]] = counts.get(p["categoria"], 0) + 1
  cats_ui = []
  for c in CATEGORIAS:
    n = counts.get(c["nombre"], 0)
    if n == 0:
      continue
    cats_ui.append({
      "id": c["id"], "nombre": c["nombre"], "icon": c["icon"], "color": c["color"],
      "requiereReceta": c["rx"], "rama": c["rama"], "count": n,
    })

  sintomas = sorted({s for p in products for s in p.get("sintomas", [])})

  # Slim products for JS (same fields app expects)
  slim = []
  for p in products:
    slim.append({k: p[k] for k in [
      "id", "sku", "ean", "nombre", "marca", "laboratorio", "principioActivo",
      "categoria", "subcategoria", "rama", "presentacion", "dosis", "unidadesEnvase",
      "requiereReceta", "controlado", "nevera", "icon", "sintomas", "grupoInteraccion",
      "precio", "coste", "iva", "stock", "stockInicial", "stockMinimo", "lote",
      "caducidadMs", "esGenerico", "colorCategoria", "procedimiento",
    ] if k in p})

  js = f"""/**
 * Catálogo Farmacia Álora — Fase 2 España ampliada
 * Generado por scripts/build_fase1.py — {len(slim)} productos · {len(cats_ui)} categorías
 */
(function (global) {{
  const PRODUCTOS = {json.dumps(slim, ensure_ascii=False)};
  const CATEGORIAS_UI = {json.dumps(cats_ui, ensure_ascii=False)};
  const SINTOMAS = {json.dumps(sintomas, ensure_ascii=False)};
  const RAMAS = {json.dumps(sorted({c['rama'] for c in cats_ui}), ensure_ascii=False)};

  function getCatalogo() {{
    return {{
      productos: PRODUCTOS,
      categoriasUI: CATEGORIAS_UI,
      sintomas: SINTOMAS,
      ramas: RAMAS,
      total: PRODUCTOS.length,
      version: "fase2-es",
    }};
  }}

  global.FarmaciaCatalogo = {{ getCatalogo, PRODUCTOS, CATEGORIAS_UI, SINTOMAS, RAMAS }};
}})(typeof window !== "undefined" ? window : globalThis);
"""
  OUT_JS.write_text(js, encoding="utf-8")
  OUT_JSON.write_text(json.dumps({"categorias": cats_ui, "productos": slim}, ensure_ascii=False, indent=2), encoding="utf-8")
  print(f"catalog.js → {len(slim)} productos, {len(cats_ui)} categorías")


def draw_pack(c: canvas.Canvas, x, y, w, h, color, nombre, marca, rx, nevera, ctrl):
  c.setFillColor(HexColor(color))
  c.roundRect(x, y, w, h, 8, fill=1, stroke=0)
  c.setFillColor(HexColor("#0f172a"))
  c.rect(x, y + h - 18, w, 18, fill=1, stroke=0)
  c.setFillColor(white)
  c.setFont("Helvetica-Bold", 9)
  c.drawCentredString(x + w / 2, y + h - 12, (marca or "Álora")[:18])
  c.setFillColor(HexColor("#0f172a"))
  c.setFont("Helvetica", 8)
  # wrap name
  text = nombre[:42] + ("…" if len(nombre) > 42 else "")
  c.drawCentredString(x + w / 2, y + h / 2, text[:22])
  if len(text) > 22:
    c.drawCentredString(x + w / 2, y + h / 2 - 12, text[22:44])
  if rx:
    c.setFillColor(HexColor("#db2777"))
    c.roundRect(x + w - 28, y + h - 34, 24, 12, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x + w - 16, y + h - 31, "Rx")
  if nevera:
    c.setFillColor(HexColor("#0284c7"))
    c.circle(x + 14, y + h - 28, 8, fill=1, stroke=0)
  if ctrl:
    c.setFillColor(HexColor("#7c2d12"))
    c.roundRect(x + 6, y + 8, 36, 12, 3, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(x + 24, y + 11, "CTRL")


def gen_pdfs(products):
  OUT_PDF_DIR.mkdir(parents=True, exist_ok=True)
  by_cat = {}
  for p in products:
    by_cat.setdefault(p["categoria"], []).append(p)

  for cat, plist in by_cat.items():
    meta = CAT_BY_NAME.get(cat, {"color": "#0f766e", "icon": "💊", "rama": ""})
    safe = re.sub(r"[^\w\-]+", "_", cat, flags=re.UNICODE).strip("_")
    path = OUT_PDF_DIR / f"{safe}.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    W, H = A4
    color = meta.get("color", "#0f766e")

    for i, p in enumerate(plist, 1):
      # background band
      c.setFillColor(HexColor("#f8fafc"))
      c.rect(0, 0, W, H, fill=1, stroke=0)
      c.setFillColor(HexColor(color))
      c.rect(0, H - 70, W, 70, fill=1, stroke=0)
      c.setFillColor(white)
      c.setFont("Helvetica-Bold", 16)
      c.drawString(25, H - 32, f"Farmacia Álora · Manual de categoría")
      c.setFont("Helvetica", 11)
      c.drawString(25, H - 50, f"{meta.get('icon', '')} {cat}  ·  {meta.get('rama', '')}")
      c.drawRightString(W - 25, H - 40, f"{i} / {len(plist)}")

      # pack
      draw_pack(c, 40, H - 280, 160, 180, color, p["nombre"], p["marca"], p["requiereReceta"], p["nevera"], p["controlado"])

      # title block
      c.setFillColor(HexColor("#0f172a"))
      c.setFont("Helvetica-Bold", 18)
      y = H - 100
      c.drawString(220, y, p["nombre"][:48])
      c.setFont("Helvetica", 11)
      c.setFillColor(HexColor("#334155"))
      c.drawString(220, y - 22, f"Marca: {p['marca']}  ·  Lab: {p['laboratorio']}")
      c.drawString(220, y - 40, f"Principio activo: {p['principioActivo']}")
      c.drawString(220, y - 58, f"Subcategoría: {p.get('subcategoria', '—')}")

      # info table
      rows = [
        ("SKU / EAN", f"{p['sku']} · {p['ean']}"),
        ("Presentación", p["presentacion"]),
        ("Dosis / contenido", p["dosis"]),
        ("Unidades envase", str(p["unidadesEnvase"])),
        ("PVP (simulado)", f"{p['precio']:.2f} €  ·  IVA {p['iva']}%"),
        ("Receta", "Sí" if p["requiereReceta"] else "No (OTC)"),
        ("Controlado", "Sí" if p["controlado"] else "No"),
        ("Frigorífico", "Sí (2–8 °C)" if p["nevera"] else "No"),
        ("Genérico EFG", "Sí" if p.get("esGenerico") else "No"),
        ("Lote / caducidad (sim.)", f"{p['lote']}"),
        ("Stock inicial", str(p["stockInicial"])),
        ("Grupo interacción", p.get("grupoInteraccion", "—")),
        ("Síntomas asociados", ", ".join(p.get("sintomas") or ["—"])),
      ]
      y0 = H - 320
      c.setFont("Helvetica-Bold", 12)
      c.setFillColor(HexColor(color))
      c.drawString(40, y0, "Ficha del producto")
      y0 -= 18
      for label, val in rows:
        c.setFillColor(HexColor("#0f766e"))
        c.setFont("Helvetica-Bold", 9)
        c.drawString(40, y0, label)
        c.setFillColor(HexColor("#1e293b"))
        c.setFont("Helvetica", 9)
        c.drawString(180, y0, str(val)[:90])
        y0 -= 14

      # procedure box
      y0 -= 10
      c.setFillColor(HexColor(color))
      c.roundRect(40, 60, W - 80, max(90, y0 - 50), 10, fill=1, stroke=0)
      c.setFillColor(white)
      c.setFont("Helvetica-Bold", 11)
      c.drawString(55, y0 - 10, "Procedimiento de mostrador")
      c.setFont("Helvetica", 9)
      proc = p.get("procedimiento", "")
      # simple wrap
      words = proc.split()
      line = ""
      ly = y0 - 28
      for w_ in words:
        test = (line + " " + w_).strip()
        if c.stringWidth(test, "Helvetica", 9) > W - 120:
          c.drawString(55, ly, line)
          ly -= 12
          line = w_
        else:
          line = test
      if line:
        c.drawString(55, ly, line)

      c.setFillColor(HexColor("#64748b"))
      c.setFont("Helvetica", 8)
      c.drawCentredString(W / 2, 28, "Documento educativo Farmacia Álora · No sustituye ficha técnica AEMPS · Envase ilustrado (no foto comercial)")
      c.showPage()

    c.save()
    print(f"PDF {path.name}: {len(plist)} págs")


def main():
  products = build_products()
  write_catalog_js(products)
  gen_pdfs(products)
  # index readme
  (OUT_PDF_DIR / "README.md").write_text(
    "# Manuales PDF por categoría\n\n"
    "Generados con `python3 scripts/build_fase1.py`.\n\n"
    "- Un PDF por categoría\n"
    "- Una página por producto (ficha + procedimiento)\n"
    "- Envases **ilustrados** (no fotos comerciales de marca)\n"
    "- Precios y stocks **simulados** para práctica\n",
    encoding="utf-8",
  )
  print("DONE", len(products))


if __name__ == "__main__":
  main()
