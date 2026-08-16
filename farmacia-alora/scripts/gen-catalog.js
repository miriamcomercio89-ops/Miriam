#!/usr/bin/env node
/**
 * Genera js/catalog.js — catálogo curado Farmacia Álora (363 productos).
 * Ejecutar: node scripts/gen-catalog.js
 */
const fs = require("fs");
const path = require("path");

const BASE = Date.UTC(2026, 7, 13);
const MS_DIA = 86400000;

const CAT_META = [
  { id: "resfriado", nombre: "Resfriado y gripe", icon: "🤧", color: "#3B82F6", requiereReceta: false, count: 32 },
  { id: "digestivo", nombre: "Digestivo", icon: "🤢", color: "#10B981", requiereReceta: false, count: 20 },
  { id: "dolor", nombre: "Alivio del dolor", icon: "💊", color: "#EF4444", requiereReceta: false, count: 14 },
  { id: "piel", nombre: "Piel / Dermatología", icon: "🧴", color: "#F59E0B", requiereReceta: false, count: 38 },
  { id: "sexual", nombre: "Salud sexual", icon: "❤️", color: "#EC4899", requiereReceta: false, count: 17 },
  { id: "vitaminas", nombre: "Vitaminas", icon: "🍊", color: "#84CC16", requiereReceta: false, count: 32 },
  { id: "viaje", nombre: "Viaje", icon: "✈️", color: "#06B6D4", requiereReceta: false, count: 9 },
  { id: "mascotas", nombre: "Mascotas", icon: "🐾", color: "#A855F7", requiereReceta: false, count: 11 },
  { id: "revistas", nombre: "Revistas", icon: "📰", color: "#64748B", requiereReceta: false, count: 1 },
  { id: "snacks", nombre: "Snacks / Aperitivos", icon: "🍫", color: "#D97706", requiereReceta: false, count: 10 },
  { id: "bebidas", nombre: "Bebidas", icon: "💧", color: "#0EA5E9", requiereReceta: false, count: 4 },
  { id: "antibioticos", nombre: "Antibióticos", icon: "🦠", color: "#DC2626", requiereReceta: true, count: 13 },
  { id: "cardio", nombre: "Cardiovascular", icon: "❤️‍🩹", color: "#BE123C", requiereReceta: true, count: 38 },
  { id: "controlados", nombre: "Controlados", icon: "🔒", color: "#7C2D12", requiereReceta: true, count: 24 },
  { id: "diabetes", nombre: "Diabetes", icon: "🩸", color: "#2563EB", requiereReceta: true, count: 8 },
  { id: "digestivo-rx", nombre: "Digestivo con receta", icon: "📋", color: "#059669", requiereReceta: true, count: 23 },
  { id: "dispensario", nombre: "Dispensario", icon: "🏥", color: "#4B5563", requiereReceta: true, count: 8 },
  { id: "hormonas", nombre: "Hormonas", icon: "⚖️", color: "#C026D3", requiereReceta: true, count: 6 },
  { id: "mental", nombre: "Salud mental", icon: "🧠", color: "#7C3AED", requiereReceta: true, count: 19 },
  { id: "neuro", nombre: "Neurología", icon: "⚡", color: "#4338CA", requiereReceta: true, count: 13 },
  { id: "frigo", nombre: "Frigorífico", icon: "❄️", color: "#0284C7", requiereReceta: true, count: 7 },
  { id: "respiratorio", nombre: "Respiratorio", icon: "🌬️", color: "#0891B2", requiereReceta: true, count: 7 },
  { id: "corticoides", nombre: "Corticoides / Esteroides", icon: "💉", color: "#B45309", requiereReceta: true, count: 9 },
];

const colorByCat = Object.fromEntries(CAT_META.map((c) => [c.nombre, c.color]));

/** Campos: [nombre, marca, lab, pa, sub, presentacion, dosis, unidades, precio, iva, grupo, icon, sintomas?, opts?] */
const DATA = {
  "Resfriado y gripe": [
    ["Frenadol Complex sobres", "Frenadol", "J&J", "Paracetamol + clorfenamina + dextrometorfano", "Gripe", "Sobres", "10 sobres", 10, 9.95, 4, "analgesico", "🤧", ["fiebre", "tos", "congestión", "dolor de cabeza"]],
    ["Frenadol Junior sobres", "Frenadol", "J&J", "Paracetamol + dextrometorfano", "Pediátrico", "Sobres", "10 sobres", 10, 8.5, 4, "analgesico", "🧒", ["fiebre", "tos"]],
    ["Frenadol Descongestivo", "Frenadol", "J&J", "Paracetamol + pseudoefedrina", "Congestión", "Cápsulas", "16 cáps", 16, 10.2, 4, "otro", "👃", ["congestión", "fiebre"]],
    ["Bisolvon Compositum jarabe", "Bisolvon", "Boehringer", "Bromhexina + dextrometorfano", "Tos", "Jarabe 200 ml", "200 ml", 1, 11.4, 4, "otro", "🫁", ["tos", "congestión"]],
    ["Bisolvon Mucolítico comprimidos", "Bisolvon", "Boehringer", "Bromhexina", "Tos productiva", "Comprimidos", "8 mg × 20", 20, 7.8, 4, "otro", "💊", ["tos"]],
    ["Mucosan jarabe", "Mucosan", "Boehringer", "Ambroxol", "Mucolítico", "Jarabe 200 ml", "15 mg/5 ml", 1, 8.9, 4, "otro", "🫁", ["tos", "congestión"]],
    ["Fluimucil 600 mg", "Fluimucil", "Zambon", "Acetilcisteína", "Mucolítico", "Sobres efervescentes", "600 mg × 10", 10, 9.75, 4, "otro", "🫧", ["tos", "congestión"]],
    ["Fluimucil 200 mg", "Fluimucil", "Zambon", "Acetilcisteína", "Mucolítico", "Sobres", "200 mg × 30", 30, 8.2, 4, "otro", "🫧", ["tos"]],
    ["Cinfatos 15 mg", "Cinfatos", "Cinfa", "Dextrometorfano", "Antitusivo", "Comprimidos", "15 mg × 20", 20, 6.5, 4, "otro", "💊", ["tos"]],
    ["Romilar jarabe", "Romilar", "Sanofi", "Dextrometorfano", "Antitusivo", "Jarabe 125 ml", "15 mg/5 ml", 1, 7.95, 4, "otro", "🍯", ["tos"]],
    ["Iniston Tos y Congestión", "Iniston", "J&J", "Dextrometorfano + pseudoefedrina", "Tos + congestión", "Jarabe 120 ml", "120 ml", 1, 10.5, 4, "otro", "🤧", ["tos", "congestión"]],
    ["Iniston Antigripal", "Iniston", "J&J", "Paracetamol + clorfenamina + fenilefrina", "Gripe", "Comprimidos", "16 comp", 16, 9.2, 4, "analgesico", "🤒", ["fiebre", "congestión", "dolor de cabeza"]],
    ["Termalgin Resfriado", "Termalgin", "GSK", "Paracetamol + fenilefrina + clorfenamina", "Gripe", "Cápsulas", "16 cáps", 16, 8.75, 4, "analgesico", "🤒", ["fiebre", "congestión"]],
    ["Aspirina Complex", "Aspirina", "Bayer", "AAS + pseudoefedrina + clorfenamina", "Gripe", "Sobres", "10 sobres", 10, 9.4, 4, "nsaid", "🤧", ["fiebre", "congestión", "dolor de cabeza"]],
    ["Rinobanedif pomada nasal", "Rinobanedif", "Almirall", "Bacitracina + neomicina + prednisolona", "Nasal", "Pomada 10 g", "10 g", 1, 7.6, 4, "otro", "👃", ["congestión"]],
    ["Vicks VapoRub", "Vicks", "P&G", "Alcanfor + mentol + eucalipto", "Descongestivo tópico", "Pomada 50 g", "50 g", 1, 8.3, 4, "otro", "🧴", ["congestión", "tos"]],
    ["Narine solución nasal", "Narine", "Alcon", "Cloruro sódico", "Lavado nasal", "Spray 100 ml", "0,9%", 1, 6.9, 4, "otro", "💦", ["congestión"]],
    ["Rhinomer Fuerza Media", "Rhinomer", "GSK", "Agua de mar", "Lavado nasal", "Spray 135 ml", "Isotónica", 1, 8.1, 21, "otro", "🌊", ["congestión"]],
    ["Respibien spray nasal", "Respibien", "Uriach", "Oximetazolina", "Descongestivo", "Spray 15 ml", "0,5 mg/ml", 1, 7.25, 4, "otro", "👃", ["congestión"]],
    ["Ilvico comprimidos", "Ilvico", "Boehringer", "Paracetamol + cafeína + clorfenamina", "Gripe", "Comprimidos", "20 comp", 20, 7.5, 4, "analgesico", "💊", ["fiebre", "dolor de cabeza", "alergia"]],
    ["Cinfalair 5 mg", "Cinfalair", "Cinfa", "Montelukast", "Alergia / asma leve", "Comprimidos masticables", "5 mg × 28", 28, 12.8, 4, "otro", "🌬️", ["alergia"]],
    ["Clarityne 10 mg", "Clarityne", "Bayer", "Loratadina", "Antihistamínico", "Comprimidos", "10 mg × 7", 7, 6.95, 4, "antihistaminico", "🌸", ["alergia"]],
    ["Zyrtec 10 mg", "Zyrtec", "UCB", "Cetirizina", "Antihistamínico", "Comprimidos", "10 mg × 7", 7, 7.4, 4, "antihistaminico", "🌸", ["alergia"]],
    ["Aerius 5 mg", "Aerius", "MSD", "Desloratadina", "Antihistamínico", "Comprimidos", "5 mg × 7", 7, 8.9, 4, "antihistaminico", "🌸", ["alergia"]],
    ["Polaramine jarabe", "Polaramine", "MSD", "Dexclorfeniramina", "Antihistamínico", "Jarabe 100 ml", "2 mg/5 ml", 1, 6.8, 4, "antihistaminico", "🍯", ["alergia"]],
    ["Prospan jarabe", "Prospan", "Engelhard", "Hedera helix", "Tos", "Jarabe 100 ml", "100 ml", 1, 9.15, 4, "otro", "🌿", ["tos"]],
    ["Pectox Mucolítico", "Pectox", "Ferrer", "Carbocisteína", "Mucolítico", "Jarabe 200 ml", "5%", 1, 8.4, 4, "otro", "🫁", ["tos", "congestión"]],
    ["Grippostad C", "Grippostad", "Stada", "Paracetamol + cafeína + clorfenamina + ácido ascórbico", "Gripe", "Cápsulas", "12 cáps", 12, 8.6, 4, "analgesico", "🤒", ["fiebre", "dolor de cabeza"]],
    ["Tosédin Jarabe", "Tosédin", "Faes Farma", "Dextrometorfano", "Antitusivo", "Jarabe 125 ml", "125 ml", 1, 7.1, 4, "otro", "🍯", ["tos"]],
    ["Bálsamo de Tiger (mentol)", "Tiger Balm", "Haw Par", "Mentol + alcanfor", "Alivio tópico", "Bálsamo 19 g", "19 g", 1, 9.5, 21, "otro", "🐯", ["congestión", "dolor muscular"]],
    ["Cinfamucol acetilcisteína", "Cinfamucol", "Cinfa", "Acetilcisteína", "Mucolítico", "Sobres", "600 mg × 20", 20, 7.9, 4, "otro", "🫧", ["tos"]],
    ["Stopcold Plus", "Stopcold", "Kern", "Paracetamol + pseudoefedrina", "Gripe", "Comprimidos", "12 comp", 12, 8.25, 4, "analgesico", "🤧", ["fiebre", "congestión"]],
  ],
  Digestivo: [
    ["Omeprazol Cinfa 20 mg", "Cinfa", "Cinfa", "Omeprazol", "Acidez", "Cápsulas gastrorresistentes", "20 mg × 14", 14, 4.95, 4, "ipp", "🔥", ["acidez"]],
    ["Omeprazol Normon 20 mg", "Normon", "Normon", "Omeprazol", "Acidez", "Cápsulas", "20 mg × 28", 28, 6.2, 4, "ipp", "🔥", ["acidez"]],
    ["Almax Forte sobres", "Almax", "Almirall", "Almagato", "Antiácido", "Sobres", "1,5 g × 24", 24, 8.9, 4, "otro", "🫠", ["acidez"]],
    ["Gaviscon doble acción", "Gaviscon", "Reckitt", "Alginato + bicarbonato + carbonato", "Reflujo", "Comprimidos masticables", "24 comp", 24, 9.75, 4, "otro", "🫧", ["acidez"]],
    ["Rennie Digestarom", "Rennie", "Bayer", "Carbonato cálcico + magnesio", "Antiácido", "Comprimidos", "48 comp", 48, 7.4, 4, "otro", "🍬", ["acidez"]],
    ["Fortasec 2 mg", "Fortasec", "J&J", "Loperamida", "Diarrea", "Cápsulas", "2 mg × 10", 10, 6.5, 4, "otro", "🚽", ["diarrea"]],
    ["Imodium Instant", "Imodium", "J&J", "Loperamida", "Diarrea", "Liotabs", "2 mg × 12", 12, 8.2, 4, "otro", "🚽", ["diarrea"]],
    ["Smecta naranja", "Smecta", "Ipsen", "Diosmectita", "Diarrea", "Sobres", "3 g × 30", 30, 10.5, 4, "otro", "🍊", ["diarrea"]],
    ["Enterol 250 mg", "Enterol", "Biocodex", "Saccharomyces boulardii", "Probiótico", "Cápsulas", "250 mg × 10", 10, 11.9, 4, "otro", "🦠", ["diarrea"]],
    ["Ulcorem 20 mg", "Ulcorem", "Almirall", "Pantoprazol", "Acidez", "Comprimidos", "20 mg × 7", 7, 7.8, 4, "ipp", "🔥", ["acidez"]],
    ["Buscapina Compositum OTC", "Buscapina", "Boehringer", "Butilescopolamina + paracetamol", "Cólico", "Comprimidos", "10 comp", 10, 8.6, 4, "analgesico", "💊", ["dolor de cabeza", "acidez"]],
    ["Aero-Red gotas", "Aero-Red", "Uriach", "Simeticona", "Gases", "Gotas 30 ml", "100 mg/ml", 1, 7.2, 4, "otro", "💨", ["acidez"]],
    ["Espaven Digesti", "Espaven", "Armstrong", "Dimeticona + enzimas", "Digestión", "Cápsulas", "20 cáps", 20, 9.3, 4, "otro", "🥗", ["acidez"]],
    ["Duphalac solución", "Duphalac", "Abbott", "Lactulosa", "Estreñimiento", "Solución 200 ml", "200 ml", 1, 6.9, 4, "otro", "💧", ["estreñimiento"]],
    ["Movicol sobres", "Movicol", "Norgine", "Macrogol 3350", "Estreñimiento", "Sobres", "20 sobres", 20, 12.4, 4, "otro", "📦", ["estreñimiento"]],
    ["Plantaben sobres", "Plantaben", "Madaus", "Ispaghula (Plantago ovata)", "Fibra", "Sobres", "3,5 g × 20", 20, 8.75, 4, "otro", "🌿", ["estreñimiento"]],
    ["Bioralsuero naranja", "Bioralsuero", "Casen", "Sales de rehidratación", "Rehidratación", "Sobres", "5 sobres", 5, 7.5, 4, "otro", "🥤", ["diarrea"]],
    ["Aquilea Gas", "Aquilea", "Uriach", "Carbón vegetal + hinojo", "Gases", "Cápsulas", "30 cáps", 30, 10.2, 21, "otro", "💨", ["acidez"]],
    ["Omepral 20 mg", "Omepral", "Teva", "Omeprazol", "Acidez", "Cápsulas", "20 mg × 14", 14, 5.1, 4, "ipp", "🔥", ["acidez"]],
    ["Gelocatil Digestivo", "Gelocatil", "Ferrer", "Paracetamol + simeticona", "Dispepsia", "Comprimidos", "12 comp", 12, 6.4, 4, "analgesico", "💊", ["acidez", "dolor de cabeza"]],
  ],
  "Alivio del dolor": [
    ["Nolotil 575 mg", "Nolotil", "Boehringer", "Metamizol magnésico", "Analgésico", "Cápsulas", "575 mg × 20", 20, 4.2, 4, "analgesico", "💊", ["dolor de cabeza", "dolor muscular", "fiebre"]],
    ["Dalsy 40 mg/ml", "Dalsy", "AbbVie", "Ibuprofeno", "Pediátrico", "Suspensión 200 ml", "40 mg/ml", 1, 6.95, 4, "nsaid", "🧒", ["fiebre", "dolor de cabeza"]],
    ["Apiretal 100 mg/ml", "Apiretal", "ERN", "Paracetamol", "Pediátrico", "Solución 60 ml", "100 mg/ml", 1, 5.5, 4, "analgesico", "🌡️", ["fiebre", "dolor de cabeza"]],
    ["Gelocatil 1 g", "Gelocatil", "Ferrer", "Paracetamol", "Analgésico", "Comprimidos", "1 g × 12", 12, 4.8, 4, "analgesico", "💊", ["dolor de cabeza", "fiebre"]],
    ["Efferalgan 1 g", "Efferalgan", "UPSA", "Paracetamol", "Analgésico", "Efervescentes", "1 g × 8", 8, 5.2, 4, "analgesico", "🫧", ["dolor de cabeza", "fiebre"]],
    ["Ibuprofeno Cinfa 400 mg", "Cinfa", "Cinfa", "Ibuprofeno", "AINE", "Comprimidos", "400 mg × 20", 20, 3.9, 4, "nsaid", "💊", ["dolor de cabeza", "dolor muscular", "fiebre"]],
    ["Neobrufen 600 mg", "Neobrufen", "AbbVie", "Ibuprofeno", "AINE", "Comprimidos", "600 mg × 20", 20, 5.6, 4, "nsaid", "💊", ["dolor muscular", "fiebre"]],
    ["Enantyum 25 mg", "Enantyum", "Menarini", "Dexketoprofeno", "AINE", "Comprimidos", "25 mg × 20", 20, 7.8, 4, "nsaid", "💊", ["dolor de cabeza", "dolor muscular"]],
    ["Voltaren Emulgel", "Voltaren", "GSK", "Diclofenaco", "Tópico", "Gel 100 g", "1%", 1, 12.9, 4, "nsaid", "🧴", ["dolor muscular"]],
    ["Flector Tissugel", "Flector", "IBSA", "Diclofenaco", "Parche", "Parches", "140 mg × 5", 5, 14.5, 4, "nsaid", "🩹", ["dolor muscular"]],
    ["Aspirina 500 mg", "Aspirina", "Bayer", "Ácido acetilsalicílico", "Analgésico", "Comprimidos", "500 mg × 20", 20, 4.5, 4, "nsaid", "💊", ["dolor de cabeza", "fiebre"]],
    ["Termalgin 650 mg", "Termalgin", "GSK", "Paracetamol", "Analgésico", "Comprimidos", "650 mg × 20", 20, 4.1, 4, "analgesico", "💊", ["dolor de cabeza", "fiebre"]],
    ["Frenadol Soft (dolor)", "Frenadol", "J&J", "Paracetamol", "Analgésico", "Cápsulas blandas", "500 mg × 16", 16, 6.2, 4, "analgesico", "💊", ["dolor de cabeza"]],
    ["Naproxeno Kern 500 mg", "Kern", "Kern Pharma", "Naproxeno", "AINE", "Comprimidos", "500 mg × 20", 20, 5.3, 4, "nsaid", "💊", ["dolor muscular", "dolor de cabeza"]],
  ],
};

// Continue building remaining categories in the script...
// Due to size, we'll append more DATA below.

const PIEL = [
  ["Bepanthol crema", "Bepanthol", "Bayer", "Dexpantenol", "Reparadora", "Crema 30 g", "5%", 1, 9.9, 21, "otro", "🧴", ["piel irritada"]],
  ["Bepanthol pomada", "Bepanthol", "Bayer", "Dexpantenol", "Reparadora", "Pomada 30 g", "5%", 1, 10.5, 21, "otro", "🧴", ["piel irritada", "heridas"]],
  ["Cicatricure gel", "Cicatricure", "Genomma", "Allantoína + extractos", "Cicatrices", "Gel 30 g", "30 g", 1, 14.9, 21, "otro", "✨", ["piel irritada"]],
  ["Cicaplast Baume B5", "La Roche-Posay", "L'Oréal", "Pantenol + madecassoside", "Reparadora", "Bálsamo 40 ml", "40 ml", 1, 14.5, 21, "otro", "🧴", ["piel irritada"]],
  ["CeraVe Crema hidratante", "CeraVe", "L'Oréal", "Ceramidas + HA", "Hidratación", "Crema 177 ml", "177 ml", 1, 12.9, 21, "otro", "🧴", ["piel irritada"]],
  ["Avène Cicalfate+", "Avène", "Pierre Fabre", "Sulfato de cobre/zinc", "Reparadora", "Crema 40 ml", "40 ml", 1, 13.8, 21, "otro", "🧴", ["piel irritada"]],
  ["Isdin Fotoprotector Fusion Water SPF50+", "Isdin", "Isdin", "Filtros UV", "Solar", "Fluido 50 ml", "SPF 50+", 1, 22.5, 21, "otro", "☀️", ["solar"]],
  ["Isdin Fotoprotector Pediatrics SPF50+", "Isdin", "Isdin", "Filtros UV", "Solar infantil", "Loción 200 ml", "SPF 50+", 1, 24.9, 21, "otro", "🧒", ["solar"]],
  ["Eucerin AtopiControl", "Eucerin", "Beiersdorf", "Omega + ceramidas", "Atopia", "Crema 400 ml", "400 ml", 1, 28.5, 21, "otro", "🧴", ["piel irritada"]],
  ["Bioderma Atoderm Intensive", "Bioderma", "NAOS", "Complejo Skin Barrier", "Atopia", "Bálsamo 500 ml", "500 ml", 1, 26.9, 21, "otro", "🧴", ["piel irritada"]],
  ["Canesten crema 1%", "Canesten", "Bayer", "Clotrimazol", "Antifúngico", "Crema 20 g", "1%", 1, 8.4, 4, "otro", "🦶", ["piel irritada"]],
  ["Lamisil crema", "Lamisil", "GSK", "Terbinafina", "Antifúngico", "Crema 15 g", "1%", 1, 11.2, 4, "otro", "🦶", ["piel irritada"]],
  ["Quadriderm crema", "Quadriderm", "Schering", "Betametasona + gentamicina + clotrimazol", "Dermatitis", "Crema 15 g", "15 g", 1, 9.8, 4, "corticoide", "🧴", ["piel irritada"]],
  ["Hydrocortisona ISDIN 1%", "Isdin", "Isdin", "Hidrocortisona", "Corticoide tópico", "Crema 30 g", "1%", 1, 7.5, 4, "corticoide", "🧴", ["piel irritada"]],
  ["Calmatopic crema", "Calmatopic", "Isdin", "Piroctona + avena", "Picor", "Crema 100 ml", "100 ml", 1, 16.9, 21, "otro", "😌", ["piel irritada"]],
  ["Urgo Quemaduras", "Urgo", "Urgo", "Hidrocoloide", "Quemaduras", "Apósitos", "6 uds", 6, 9.5, 21, "otro", "🩹", ["heridas"]],
  ["Hansaplast Universal", "Hansaplast", "Beiersdorf", "Apósito adhesivo", "Heridas", "Surtido 40 uds", "40 uds", 40, 4.9, 21, "otro", "🩹", ["heridas"]],
  ["Compeed ampollas", "Compeed", "J&J", "Hidrocoloide", "Ampollas", "Apósitos", "5 uds", 5, 7.8, 21, "otro", "🦶", ["heridas"]],
  ["Betadine solución", "Betadine", "Meda", "Povidona yodada", "Antiséptico", "Solución 125 ml", "10%", 1, 6.5, 4, "otro", "🟤", ["heridas"]],
  ["Cristalmina solución", "Cristalmina", "Salvat", "Clorhexidina", "Antiséptico", "Spray 25 ml", "1%", 1, 5.9, 4, "otro", "💦", ["heridas"]],
  ["Aquaphor pomada", "Aquaphor", "Eucerin", "Petrolato", "Barrera", "Pomada 45 g", "45 g", 1, 11.5, 21, "otro", "🧴", ["piel irritada"]],
  ["Uriage Bariéderm", "Uriage", "Uriage", "Poli-2p + triglicéridos", "Fisuras", "Crema 75 ml", "75 ml", 1, 15.2, 21, "otro", "🧴", ["piel irritada"]],
  ["SVR Cicavit+", "SVR", "SVR", "Complejo reparador", "Reparadora", "Crema 40 ml", "40 ml", 1, 13.4, 21, "otro", "🧴", ["piel irritada"]],
  ["Martiderm Proteos Screen SPF50+", "Martiderm", "Martiderm", "Filtros UV + proteoglicanos", "Solar", "Fluido 40 ml", "SPF 50+", 1, 27.9, 21, "otro", "☀️", ["solar"]],
  ["Sesderma C-Vit", "Sesderma", "Sesderma", "Vitamina C liposomada", "Antioxidante", "Crema 50 ml", "50 ml", 1, 32.5, 21, "otro", "✨", ["piel irritada"]],
  ["Vichy Capital Soleil SPF50+", "Vichy", "L'Oréal", "Filtros UV", "Solar", "Fluido 50 ml", "SPF 50+", 1, 19.9, 21, "otro", "☀️", ["solar"]],
  ["Mustela Crema bálsamo", "Mustela", "Expanscience", "Óxido de zinc", "Pañal", "Crema 100 ml", "100 ml", 1, 11.8, 21, "otro", "👶", ["piel irritada"]],
  ["A-Derma Epitheliale A.H.", "A-Derma", "Pierre Fabre", "Avena Rhealba", "Reparadora", "Crema 40 ml", "40 ml", 1, 14.2, 21, "otro", "🧴", ["piel irritada"]],
  ["LetiAT4 Intensive", "Leti", "Leti Pharma", "Complejo atópico", "Atopia", "Crema 100 ml", "100 ml", 1, 18.5, 21, "otro", "🧴", ["piel irritada"]],
  ["Ducray Dexyane MeD", "Ducray", "Pierre Fabre", "Complejo barrera", "Eccema", "Crema 100 ml", "100 ml", 1, 17.9, 21, "otro", "🧴", ["piel irritada"]],
  ["Filorga Oxygen-Glow", "Filorga", "Filorga", "Complejo oxigenante", "Luminosidad", "Crema 50 ml", "50 ml", 1, 45.0, 21, "otro", "✨", ["piel irritada"]],
  ["Nuxe Rêve de Miel", "Nuxe", "Nuxe", "Miel + aceites", "Manos", "Crema 50 ml", "50 ml", 1, 12.5, 21, "otro", "🍯", ["piel irritada"]],
  ["Lutsine Eryplast", "Lutsine", "Isdin", "Óxido de zinc", "Pañal", "Pasta 75 g", "75 g", 1, 10.9, 21, "otro", "👶", ["piel irritada"]],
  ["Mepiform lámina", "Mepiform", "Mölnlycke", "Silicona", "Cicatrices", "Lámina 5×7 cm", "1 ud", 1, 28.0, 21, "otro", "🩹", ["piel irritada"]],
  ["Comfeel Plus", "Comfeel", "Coloplast", "Hidrocoloide", "Úlceras", "Apósitos 10×10", "10 uds", 10, 32.5, 21, "otro", "🩹", ["heridas"]],
  ["Biatain Adhesive", "Biatain", "Coloplast", "Espuma", "Heridas", "Apósitos 10×10", "10 uds", 10, 45.0, 21, "otro", "🩹", ["heridas"]],
  ["Isdin Acniben Control", "Isdin", "Isdin", "Ácido salicílico + retinoides", "Acné", "Gel crema 40 ml", "40 ml", 1, 18.9, 21, "otro", "🪞", ["piel irritada"]],
  ["La Roche-Posay Effaclar Duo+", "La Roche-Posay", "L'Oréal", "Niacinamida + LHA", "Acné", "Crema 40 ml", "40 ml", 1, 19.5, 21, "otro", "🪞", ["piel irritada"]],
];

const SEXUAL = [
  ["Durex Originales", "Durex", "Reckitt", "Látex natural", "Preservativos", "Caja", "12 uds", 12, 8.9, 21, "otro", "🔒", ["higiene íntima"]],
  ["Durex Real Feel", "Durex", "Reckitt", "Poliisopropeno", "Sin látex", "Caja", "10 uds", 10, 11.5, 21, "otro", "🔒", ["higiene íntima"]],
  ["Durex Placer Prolongado", "Durex", "Reckitt", "Látex + benzocaína", "Preservativos", "Caja", "12 uds", 12, 10.9, 21, "otro", "🔒", ["higiene íntima"]],
  ["Control Nature", "Control", "Art. Ginec.", "Látex", "Preservativos", "Caja", "12 uds", 12, 6.5, 21, "otro", "🔒", ["higiene íntima"]],
  ["Control Adapta Sensitivo", "Control", "Art. Ginec.", "Látex", "Preservativos", "Caja", "12 uds", 12, 7.2, 21, "otro", "🔒", ["higiene íntima"]],
  ["Gynea Gel hidratante", "Gynea", "Procare", "Ácido hialurónico", "Lubricante", "Gel 30 ml", "30 ml", 1, 14.5, 21, "otro", "💧", ["higiene íntima"]],
  ["Cumlaude Lubripiu", "Cumlaude", "Candioli", "Glicerina + HA", "Lubricante", "Gel 30 ml", "30 ml", 1, 13.9, 21, "otro", "💧", ["higiene íntima"]],
  ["Durex Play Feel", "Durex", "Reckitt", "Glicerina", "Lubricante", "Gel 50 ml", "50 ml", 1, 9.5, 21, "otro", "💧", ["higiene íntima"]],
  ["Clearblue Digital", "Clearblue", "SPD", "hCG", "Test embarazo", "Test", "1 ud", 1, 14.9, 21, "otro", "🤰", []],
  ["Clearblue Ovulación", "Clearblue", "SPD", "LH", "Test ovulación", "Tests", "10 uds", 10, 24.5, 21, "otro", "📅", []],
  ["Preductor Ovulación", "Preductor", "Quidel", "LH", "Test ovulación", "Tests", "5 uds", 5, 16.9, 21, "otro", "📅", []],
  ["Femme Test embarazo", "Femme", "Quidel", "hCG", "Test embarazo", "Test", "1 ud", 1, 7.5, 21, "otro", "🤰", []],
  ["Gine-Canestén óvulos", "Gine-Canestén", "Bayer", "Clotrimazol", "Candidiasis", "Óvulos", "500 mg × 1", 1, 9.8, 4, "otro", "💊", ["higiene íntima"]],
  ["Fluomizin comprimidos vaginales", "Fluomizin", "Medinova", "Cloruro de dequalinio", "Infección vaginal", "Comprimidos vag.", "10 mg × 6", 6, 18.5, 4, "otro", "💊", ["higiene íntima"]],
  ["Lactacyd Gel íntimo", "Lactacyd", "GSK", "Ácido láctico", "Higiene", "Gel 200 ml", "200 ml", 1, 8.9, 21, "otro", "🧼", ["higiene íntima"]],
  ["Isdin Woman Hidratante", "Isdin", "Isdin", "Ácido hialurónico", "Sequedad", "Gel 30 g", "30 g", 1, 16.5, 21, "otro", "💧", ["higiene íntima"]],
  ["Durex Mutual Pleasure", "Durex", "Reckitt", "Látex", "Preservativos", "Caja", "12 uds", 12, 11.2, 21, "otro", "🔒", ["higiene íntima"]],
];

const VITAMINAS = [
  ["Redoxon Triple Acción", "Redoxon", "Bayer", "Vitamina C + zinc + D", "Inmunidad", "Comprimidos efervescentes", "15 comp", 15, 9.95, 21, "otro", "🍊", ["vitaminas"]],
  ["Berocca Performance", "Berocca", "Bayer", "Vitaminas B + C + zinc + magnesio", "Energía", "Efervescentes", "15 comp", 15, 12.5, 21, "otro", "⚡", ["vitaminas", "estres"]],
  ["Supradyn Activo", "Supradyn", "Bayer", "Multivitamínico + coQ10", "General", "Comprimidos", "30 comp", 30, 14.9, 21, "otro", "💊", ["vitaminas"]],
  ["Supradyn Energy", "Supradyn", "Bayer", "Multivitamínico + ginseng", "Energía", "Comprimidos", "30 comp", 30, 15.5, 21, "otro", "⚡", ["vitaminas", "estres"]],
  ["Centrum Adultos", "Centrum", "Haleon", "Multivitamínico", "General", "Comprimidos", "30 comp", 30, 11.9, 21, "otro", "💊", ["vitaminas"]],
  ["Pharmaton Complex", "Pharmaton", "Sanofi", "Ginseng + vitaminas", "Tónico", "Cápsulas", "30 cáps", 30, 16.8, 21, "otro", "🌿", ["vitaminas", "estres"]],
  ["Juvamine Vitamina D3", "Juvamine", "Urgo", "Colecalciferol", "Vitamina D", "Cápsulas", "1000 UI × 60", 60, 8.5, 21, "otro", "☀️", ["vitaminas"]],
  ["Aquilea Magnesio", "Aquilea", "Uriach", "Magnesio", "Mineral", "Comprimidos", "400 mg × 40", 40, 9.2, 21, "otro", "💪", ["vitaminas", "dolor muscular"]],
  ["Aquilea Sueño", "Aquilea", "Uriach", "Melatonina + pasiflora", "Sueño", "Comprimidos", "1,95 mg × 30", 30, 11.5, 21, "otro", "😴", ["insomnio"]],
  ["Arkocápsulas Valeriana", "Arkopharma", "Arkopharma", "Valeriana officinalis", "Sueño", "Cápsulas", "350 mg × 50", 50, 10.9, 21, "otro", "🌿", ["insomnio", "estres"]],
  ["Hidropolivit mineral", "Hidropolivit", "Menarini", "Multivitamínico", "General", "Comprimidos", "30 comp", 30, 8.9, 21, "otro", "💊", ["vitaminas"]],
  ["Cebión 1000 mg", "Cebión", "Merck", "Ácido ascórbico", "Vitamina C", "Efervescentes", "1000 mg × 10", 10, 6.5, 21, "otro", "🍊", ["vitaminas"]],
  ["Ferrer Ferroprotina", "Ferroprotina", "Ferrer", "Hierro protein-succinilato", "Hierro", "Sobres", "40 mg × 20", 20, 14.2, 4, "otro", "🩸", ["vitaminas"]],
  ["Actiferol Fe", "Actiferol", "Pierre Fabre", "Hierro + vitamina C", "Hierro", "Cápsulas", "30 cáps", 30, 12.8, 21, "otro", "🩸", ["vitaminas"]],
  ["Becozyme C Forte", "Becozyme", "Bayer", "Complejo B + C", "Vitaminas B", "Comprimidos", "30 comp", 30, 10.5, 21, "otro", "💊", ["vitaminas"]],
  ["Elevit Pronatal", "Elevit", "Bayer", "Multivitamínico prenatal", "Embarazo", "Comprimidos", "30 comp", 30, 18.9, 21, "otro", "🤰", ["vitaminas"]],
  ["Natalben Supra", "Natalben", "Italfarmaco", "Ácido fólico + DHA + vitaminas", "Embarazo", "Cápsulas", "30 cáps", 30, 19.5, 21, "otro", "🤰", ["vitaminas"]],
  ["Omega 3 Aquilea", "Aquilea", "Uriach", "EPA + DHA", "Omega 3", "Cápsulas", "90 cáps", 90, 16.9, 21, "otro", "🐟", ["vitaminas"]],
  ["Colágeno Confort", "Aquilea", "Uriach", "Colágeno + ácido hialurónico", "Articulaciones", "Sobres", "30 sobres", 30, 22.5, 21, "otro", "🦴", ["dolor muscular", "vitaminas"]],
  ["Vitamina D3 Kern 25.000 UI", "Kern", "Kern Pharma", "Colecalciferol", "Vitamina D", "Cápsulas", "25.000 UI × 4", 4, 9.8, 4, "otro", "☀️", ["vitaminas"]],
  ["Magnesio Cinfa", "Cinfa", "Cinfa", "Óxido de magnesio", "Mineral", "Comprimidos", "400 mg × 60", 60, 6.9, 21, "otro", "💪", ["vitaminas"]],
  ["Potasio Cinfa", "Cinfa", "Cinfa", "Cloruro potásico", "Mineral", "Comprimidos", "600 mg × 50", 50, 5.5, 21, "otro", "🧂", ["vitaminas"]],
  ["Zinc + Vitamina C", "Juvamine", "Urgo", "Zinc + ácido ascórbico", "Inmunidad", "Comprimidos", "30 comp", 30, 7.8, 21, "otro", "🛡️", ["vitaminas"]],
  ["Ginseng Arkopharma", "Arkopharma", "Arkopharma", "Panax ginseng", "Tónico", "Cápsulas", "45 cáps", 45, 13.5, 21, "otro", "🌿", ["estres", "vitaminas"]],
  ["Rhodiola Arkocápsulas", "Arkopharma", "Arkopharma", "Rhodiola rosea", "Estrés", "Cápsulas", "45 cáps", 45, 14.2, 21, "otro", "🌿", ["estres"]],
  ["Melatonina Aquilea 1,95 mg", "Aquilea", "Uriach", "Melatonina", "Sueño", "Comprimidos", "1,95 mg × 60", 60, 12.9, 21, "otro", "😴", ["insomnio"]],
  ["Probiótico Aquilea Flora", "Aquilea", "Uriach", "Lactobacillus + Bifidobacterium", "Flora", "Cápsulas", "30 cáps", 30, 15.5, 21, "otro", "🦠", ["diarrea", "vitaminas"]],
  ["Calcio + Vitamina D3", "Cinfa", "Cinfa", "Carbonato cálcico + colecalciferol", "Hueso", "Comprimidos", "600 mg/400 UI × 60", 60, 8.2, 21, "otro", "🦴", ["vitaminas"]],
  ["Q10 Pharmaton", "Pharmaton", "Sanofi", "Coenzima Q10", "Energía", "Cápsulas", "30 cáps", 30, 17.5, 21, "otro", "⚡", ["vitaminas"]],
  ["Spirulina Arkopharma", "Arkopharma", "Arkopharma", "Spirulina platensis", "Superalimento", "Cápsulas", "45 cáps", 45, 11.8, 21, "otro", "🟢", ["vitaminas"]],
  ["Aloe Vera Juvamine", "Juvamine", "Urgo", "Aloe vera", "Digestivo / bienestar", "Cápsulas", "30 cáps", 30, 9.5, 21, "otro", "🌿", ["vitaminas"]],
  ["Multicentrum Kids", "Centrum", "Haleon", "Multivitamínico infantil", "Pediátrico", "Gominolas", "30 uds", 30, 10.9, 21, "otro", "🧒", ["vitaminas", "pediatría"]],
];

const VIAJE = [
  ["Biodramina 50 mg", "Biodramina", "Uriach", "Dimenhidrinato", "Cinetosis", "Comprimidos", "50 mg × 12", 12, 6.5, 4, "antihistaminico", "✈️", ["viaje"]],
  ["Biodramina Infantil", "Biodramina", "Uriach", "Dimenhidrinato", "Cinetosis pediátrica", "Chicles", "12 uds", 12, 7.2, 4, "antihistaminico", "🧒", ["viaje", "pediatría"]],
  ["Cinfamar 50 mg", "Cinfamar", "Cinfa", "Dimenhidrinato", "Cinetosis", "Comprimidos", "50 mg × 10", 10, 4.9, 4, "antihistaminico", "🚢", ["viaje"]],
  ["Repelente Autan Family", "Autan", "SC Johnson", "Icaridina", "Insectos", "Spray 100 ml", "100 ml", 1, 9.5, 21, "otro", "🦟", ["viaje"]],
  ["Repelente Relec Extra Fuerte", "Relec", "Bayer", "DEET", "Insectos", "Spray 75 ml", "50%", 1, 11.2, 21, "otro", "🦟", ["viaje"]],
  ["After Bite Classic", "After Bite", "Tender", "Amoníaco", "Picaduras", "Aplicador 14 ml", "14 ml", 1, 6.8, 21, "otro", "🦟", ["piel irritada", "viaje"]],
  ["Dioralyte sobres", "Dioralyte", "Sanofi", "Sales de rehidratación", "Diarrea del viajero", "Sobres", "8 sobres", 8, 8.9, 4, "otro", "💧", ["diarrea", "viaje"]],
  ["Botiquín viaje básico", "Farmalastic", "Textil Planas", "Material sanitario", "Botiquín", "Estuche", "1 ud", 1, 18.5, 21, "otro", "🧰", ["viaje", "heridas"]],
  ["Compeed Viaje ampollas", "Compeed", "J&J", "Hidrocoloide", "Ampollas", "Kit viaje", "5 uds", 5, 8.5, 21, "otro", "🦶", ["viaje", "heridas"]],
];

const MASCOTAS = [
  ["Frontline Spot On perros M", "Frontline", "Boehringer", "Fipronil", "Antiparasitario", "Pipetas", "3 uds", 3, 24.9, 21, "otro", "🐶", ["mascotas"]],
  ["Frontline Combo gatos", "Frontline", "Boehringer", "Fipronil + (S)-metopreno", "Antiparasitario", "Pipetas", "3 uds", 3, 22.5, 21, "otro", "🐱", ["mascotas"]],
  ["Advantix Spot On perros L", "Advantix", "Elanco", "Imidacloprid + permetrina", "Antiparasitario", "Pipetas", "4 uds", 4, 32.9, 21, "otro", "🐶", ["mascotas"]],
  ["Seresto collar perros", "Seresto", "Elanco", "Imidacloprid + flumetrina", "Collar", "Collar 70 cm", "1 ud", 1, 42.0, 21, "otro", "🐶", ["mascotas"]],
  ["Seresto collar gatos", "Seresto", "Elanco", "Imidacloprid + flumetrina", "Collar", "Collar 38 cm", "1 ud", 1, 38.5, 21, "otro", "🐱", ["mascotas"]],
  ["Drontal perro sabor", "Drontal", "Elanco", "Prazicuantel + pirantel + febantel", "Desparasitante", "Comprimidos", "2 comp", 2, 14.5, 21, "otro", "🐶", ["mascotas"]],
  ["Milibó gatos", "Milibó", "Virbac", "Milbemicina + prazicuantel", "Desparasitante", "Comprimidos", "2 comp", 2, 12.9, 21, "otro", "🐱", ["mascotas"]],
  ["Hills Science Plan Adult", "Hills", "Hill's", "Nutrición completa", "Alimento", "Saco 3 kg", "3 kg", 1, 28.9, 21, "otro", "🥣", ["mascotas"]],
  ["Royal Canin Adult Medium", "Royal Canin", "Mars", "Nutrición completa", "Alimento", "Saco 4 kg", "4 kg", 1, 32.5, 21, "otro", "🥣", ["mascotas"]],
  ["Affinity Advance Sensitive", "Advance", "Affinity", "Nutrición sensible", "Alimento", "Saco 3 kg", "3 kg", 1, 26.9, 21, "otro", "🥣", ["mascotas"]],
  ["Beaphar Pasta vitaminas", "Beaphar", "Beaphar", "Vitaminas + taurina", "Complemento", "Pasta 100 g", "100 g", 1, 9.5, 21, "otro", "🐱", ["mascotas"]],
];

const REVISTAS = [
  ["Hola Farmacia — Especial Salud", "¡Hola!", "Hola S.L.", "—", "Revista", "Ejemplar", "1 ud", 1, 3.5, 21, "otro", "📰", []],
];

const SNACKS = [
  ["Chicles Nicotinell Freshmint 2 mg", "Nicotinell", "Haleon", "Nicotina", "Dejar de fumar", "Chicles", "2 mg × 96", 96, 24.9, 21, "otro", "🚭", ["dejar de fumar"]],
  ["Chicles Stimorol Spearmint", "Stimorol", "Mondelez", "—", "Chicles", "Paquete", "14 uds", 14, 1.8, 21, "otro", "🍬", []],
  ["Chicles Trident Menta", "Trident", "Mondelez", "—", "Chicles", "Paquete", "14 uds", 14, 1.6, 21, "otro", "🍬", []],
  ["Barrita Cereal Nestlé Fitness", "Fitness", "Nestlé", "—", "Barrita", "Barrita 23,5 g", "1 ud", 1, 1.2, 21, "otro", "🍫", []],
  ["Barrita Nature Valley avena", "Nature Valley", "General Mills", "—", "Barrita", "Barrita", "2×", 2, 1.5, 21, "otro", "🌾", []],
  ["Caramelos Halls Mentol", "Halls", "Mondelez", "Mentol", "Caramelos", "Paquete", "20 uds", 20, 1.4, 21, "otro", "❄️", ["tos"]],
  ["Caramelos Ricola Hierbas", "Ricola", "Ricola", "Hierbas suizas", "Caramelos", "Bolsa 70 g", "70 g", 1, 2.9, 21, "otro", "🌿", ["tos"]],
  ["Galletas María Fontaneda", "Fontaneda", "Mondelēz", "—", "Galletas", "Paquete 200 g", "200 g", 1, 1.9, 21, "otro", "🍪", []],
  ["Frutos secos Cocktail", "Borges", "Borges", "—", "Frutos secos", "Bolsa 150 g", "150 g", 1, 2.8, 21, "otro", "🥜", []],
  ["Chocolatina Kinder Bueno Mini", "Kinder", "Ferrero", "—", "Chocolate", "Pack", "5 uds", 5, 2.5, 21, "otro", "🍫", []],
];

const BEBIDAS = [
  ["Agua Font Vella 50 cl", "Font Vella", "Danone", "—", "Agua", "Botella 50 cl", "50 cl", 1, 0.85, 21, "otro", "💧", []],
  ["Agua Lanjarón 50 cl", "Lanjarón", "Danone", "—", "Agua", "Botella 50 cl", "50 cl", 1, 0.9, 21, "otro", "💧", []],
  ["Aquarius Naranja 50 cl", "Aquarius", "Coca-Cola", "Sales minerales", "Isotónica", "Botella 50 cl", "50 cl", 1, 1.6, 21, "otro", "🟠", ["deporte"]],
  ["Powerade Mountain Blast 50 cl", "Powerade", "Coca-Cola", "Sales minerales", "Isotónica", "Botella 50 cl", "50 cl", 1, 1.8, 21, "otro", "🔵", ["deporte"]],
];

const ANTIBIOTICOS = [
  ["Augmentine 875/125 mg", "Augmentine", "GSK", "Amoxicilina/Ácido clavulánico", "Betalactámico", "Comprimidos", "875/125 mg × 20", 20, 8.5, 4, "antibiotico", "🦠", []],
  ["Amoxicilina Cinfa 500 mg", "Cinfa", "Cinfa", "Amoxicilina", "Betalactámico", "Cápsulas", "500 mg × 24", 24, 3.2, 4, "antibiotico", "💊", []],
  ["Amoxicilina Normon 1 g", "Normon", "Normon", "Amoxicilina", "Betalactámico", "Comprimidos", "1 g × 12", 12, 4.1, 4, "antibiotico", "💊", []],
  ["Zitromax 500 mg", "Zitromax", "Pfizer", "Azitromicina", "Macrólido", "Comprimidos", "500 mg × 3", 3, 9.8, 4, "antibiotico_macrolido", "💊", []],
  ["Azitromicina Cinfa 500 mg", "Cinfa", "Cinfa", "Azitromicina", "Macrólido", "Comprimidos", "500 mg × 3", 3, 5.5, 4, "antibiotico_macrolido", "💊", []],
  ["Claritromicina Kern 500 mg", "Kern", "Kern Pharma", "Claritromicina", "Macrólido", "Comprimidos", "500 mg × 14", 14, 7.9, 4, "antibiotico_macrolido", "💊", []],
  ["Ciprofloxacino Normon 500 mg", "Normon", "Normon", "Ciprofloxacino", "Quinolona", "Comprimidos", "500 mg × 10", 10, 4.8, 4, "antibiotico", "💊", []],
  ["Levofloxacino Cinfa 500 mg", "Cinfa", "Cinfa", "Levofloxacino", "Quinolona", "Comprimidos", "500 mg × 7", 7, 6.2, 4, "antibiotico", "💊", []],
  ["Doxiciclina Normon 100 mg", "Normon", "Normon", "Doxiciclina", "Tetraciclina", "Cápsulas", "100 mg × 14", 14, 3.9, 4, "antibiotico", "💊", []],
  ["Zinnat 500 mg", "Zinnat", "GSK", "Cefuroxima", "Cefalosporina", "Comprimidos", "500 mg × 10", 10, 11.5, 4, "antibiotico", "💊", []],
  ["Flagyl 250 mg", "Flagyl", "Sanofi", "Metronidazol", "Nitroimidazol", "Comprimidos", "250 mg × 20", 20, 4.5, 4, "antibiotico", "💊", []],
  ["Monurol 3 g", "Monurol", "Zambon", "Fosfomicina", "ITU", "Sobres", "3 g × 1", 1, 8.9, 4, "antibiotico", "💊", []],
  ["Septrin Forte", "Septrin", "GSK", "Sulfametoxazol + trimetoprima", "Sulfamida", "Comprimidos", "800/160 mg × 10", 10, 5.8, 4, "antibiotico", "💊", []],
];

const CARDIO = [
  ["Enalapril Cinfa 10 mg", "Cinfa", "Cinfa", "Enalapril", "IECA", "Comprimidos", "10 mg × 28", 28, 2.8, 4, "ieca", "❤️", []],
  ["Enalapril Normon 20 mg", "Normon", "Normon", "Enalapril", "IECA", "Comprimidos", "20 mg × 28", 28, 3.1, 4, "ieca", "❤️", []],
  ["Ramipril Teva 5 mg", "Teva", "Teva", "Ramipril", "IECA", "Cápsulas", "5 mg × 28", 28, 3.5, 4, "ieca", "❤️", []],
  ["Ramipril Cinfa 10 mg", "Cinfa", "Cinfa", "Ramipril", "IECA", "Cápsulas", "10 mg × 28", 28, 3.8, 4, "ieca", "❤️", []],
  ["Losartán Cinfa 50 mg", "Cinfa", "Cinfa", "Losartán", "ARA-II", "Comprimidos", "50 mg × 28", 28, 3.2, 4, "ieca", "❤️", []],
  ["Losartán Normon 100 mg", "Normon", "Normon", "Losartán", "ARA-II", "Comprimidos", "100 mg × 28", 28, 4.0, 4, "ieca", "❤️", []],
  ["Valsartán Sandoz 80 mg", "Sandoz", "Sandoz", "Valsartán", "ARA-II", "Comprimidos", "80 mg × 28", 28, 4.2, 4, "ieca", "❤️", []],
  ["Valsartán/HCTZ Cinfa 160/12,5", "Cinfa", "Cinfa", "Valsartán + hidroclorotiazida", "ARA-II + diurético", "Comprimidos", "160/12,5 mg × 28", 28, 5.5, 4, "ieca", "❤️", []],
  ["Amlodipino Cinfa 5 mg", "Cinfa", "Cinfa", "Amlodipino", "Calcioantagonista", "Comprimidos", "5 mg × 28", 28, 2.5, 4, "otro", "💊", []],
  ["Amlodipino Normon 10 mg", "Normon", "Normon", "Amlodipino", "Calcioantagonista", "Comprimidos", "10 mg × 28", 28, 2.9, 4, "otro", "💊", []],
  ["Adalat Oros 30 mg", "Adalat", "Bayer", "Nifedipino", "Calcioantagonista", "Comprimidos OROS", "30 mg × 28", 28, 9.8, 4, "otro", "💊", []],
  ["Atenolol Cinfa 50 mg", "Cinfa", "Cinfa", "Atenolol", "Betabloqueante", "Comprimidos", "50 mg × 28", 28, 2.4, 4, "otro", "💊", []],
  ["Bisoprolol Kern 5 mg", "Kern", "Kern Pharma", "Bisoprolol", "Betabloqueante", "Comprimidos", "5 mg × 28", 28, 3.0, 4, "otro", "💊", []],
  ["Bisoprolol Normon 10 mg", "Normon", "Normon", "Bisoprolol", "Betabloqueante", "Comprimidos", "10 mg × 28", 28, 3.4, 4, "otro", "💊", []],
  ["Carvedilol Cinfa 25 mg", "Cinfa", "Cinfa", "Carvedilol", "Betabloqueante", "Comprimidos", "25 mg × 28", 28, 3.6, 4, "otro", "💊", []],
  ["Atorvastatina Cinfa 20 mg", "Cinfa", "Cinfa", "Atorvastatina", "Estatina", "Comprimidos", "20 mg × 28", 28, 4.5, 4, "estatina", "💊", []],
  ["Atorvastatina Normon 40 mg", "Normon", "Normon", "Atorvastatina", "Estatina", "Comprimidos", "40 mg × 28", 28, 5.2, 4, "estatina", "💊", []],
  ["Simvastatina Cinfa 20 mg", "Cinfa", "Cinfa", "Simvastatina", "Estatina", "Comprimidos", "20 mg × 28", 28, 3.8, 4, "estatina", "💊", []],
  ["Rosuvastatina Teva 10 mg", "Teva", "Teva", "Rosuvastatina", "Estatina", "Comprimidos", "10 mg × 28", 28, 6.5, 4, "estatina", "💊", []],
  ["Rosuvastatina Cinfa 20 mg", "Cinfa", "Cinfa", "Rosuvastatina", "Estatina", "Comprimidos", "20 mg × 28", 28, 7.2, 4, "estatina", "💊", []],
  ["Pravastatina Normon 40 mg", "Normon", "Normon", "Pravastatina", "Estatina", "Comprimidos", "40 mg × 28", 28, 4.1, 4, "estatina", "💊", []],
  ["Adiro 100 mg", "Adiro", "Bayer", "Ácido acetilsalicílico", "Antiagregante", "Comprimidos gastrorresistentes", "100 mg × 30", 30, 3.5, 4, "nsaid", "💊", []],
  ["Clopidogrel Cinfa 75 mg", "Cinfa", "Cinfa", "Clopidogrel", "Antiagregante", "Comprimidos", "75 mg × 28", 28, 6.8, 4, "anticoagulante", "💊", []],
  ["Plavix 75 mg", "Plavix", "Sanofi", "Clopidogrel", "Antiagregante", "Comprimidos", "75 mg × 28", 28, 28.5, 4, "anticoagulante", "💊", []],
  ["Sintrom 4 mg", "Sintrom", "Meda", "Acenocumarol", "Anticoagulante", "Comprimidos", "4 mg × 20", 20, 2.9, 4, "anticoagulante", "💊", []],
  ["Eliquis 5 mg", "Eliquis", "BMS/Pfizer", "Apixabán", "ACO", "Comprimidos", "5 mg × 60", 60, 85.0, 4, "anticoagulante", "💊", []],
  ["Xarelto 20 mg", "Xarelto", "Bayer", "Rivaroxabán", "ACO", "Comprimidos", "20 mg × 28", 28, 78.5, 4, "anticoagulante", "💊", []],
  ["Pradaxa 150 mg", "Pradaxa", "Boehringer", "Dabigatrán", "ACO", "Cápsulas", "150 mg × 60", 60, 82.0, 4, "anticoagulante", "💊", []],
  ["Seguril 40 mg", "Seguril", "Sanofi", "Furosemida", "Diurético", "Comprimidos", "40 mg × 30", 30, 2.2, 4, "diuretico", "💊", []],
  ["Furosemida Cinfa 40 mg", "Cinfa", "Cinfa", "Furosemida", "Diurético", "Comprimidos", "40 mg × 30", 30, 1.9, 4, "diuretico", "💊", []],
  ["Hidrósaluretil 50 mg", "Hidrósaluretil", "Chiesi", "Hidroclorotiazida", "Diurético", "Comprimidos", "50 mg × 20", 20, 2.5, 4, "diuretico", "💊", []],
  ["Aldactone 25 mg", "Aldactone", "Pfizer", "Espironolactona", "Diurético ahorrador K", "Comprimidos", "25 mg × 20", 20, 4.8, 4, "diuretico", "💊", []],
  ["Digoxina Kern 0,25 mg", "Kern", "Kern Pharma", "Digoxina", "Cardiotónico", "Comprimidos", "0,25 mg × 30", 30, 3.2, 4, "otro", "💊", []],
  ["Isordil 5 mg", "Isordil", "Wyeth", "Dinitrato de isosorbida", "Nitrato", "Comprimidos", "5 mg × 50", 50, 4.0, 4, "otro", "💊", []],
  ["Cordarone 200 mg", "Cordarone", "Sanofi", "Amiodarona", "Antiarrítmico", "Comprimidos", "200 mg × 30", 30, 8.5, 4, "otro", "💊", []],
  ["Diltiazem Normon 60 mg", "Normon", "Normon", "Diltiazem", "Calcioantagonista", "Comprimidos", "60 mg × 30", 30, 3.7, 4, "otro", "💊", []],
  ["Nebivolol Cinfa 5 mg", "Cinfa", "Cinfa", "Nebivolol", "Betabloqueante", "Comprimidos", "5 mg × 28", 28, 5.9, 4, "otro", "💊", []],
  ["Olmesartán Teva 20 mg", "Teva", "Teva", "Olmesartán", "ARA-II", "Comprimidos", "20 mg × 28", 28, 6.2, 4, "ieca", "❤️", []],
];

const CONTROLADOS = [
  ["Orfidal 1 mg", "Orfidal", "Pfizer", "Lorazepam", "Benzodiacepina", "Comprimidos", "1 mg × 25", 25, 2.5, 4, "benzo", "🔒", [], { controlado: true }],
  ["Valium 5 mg", "Valium", "Roche", "Diazepam", "Benzodiacepina", "Comprimidos", "5 mg × 30", 30, 3.2, 4, "benzo", "🔒", [], { controlado: true }],
  ["Valium 10 mg", "Valium", "Roche", "Diazepam", "Benzodiacepina", "Comprimidos", "10 mg × 25", 25, 3.8, 4, "benzo", "🔒", [], { controlado: true }],
  ["Trankimazin 0,5 mg", "Trankimazin", "Pfizer", "Alprazolam", "Benzodiacepina", "Comprimidos", "0,5 mg × 30", 30, 2.8, 4, "benzo", "🔒", [], { controlado: true }],
  ["Trankimazin 1 mg", "Trankimazin", "Pfizer", "Alprazolam", "Benzodiacepina", "Comprimidos", "1 mg × 30", 30, 3.5, 4, "benzo", "🔒", [], { controlado: true }],
  ["Noctamid 2 mg", "Noctamid", "Bayer", "Lormetazepam", "Benzodiacepina", "Comprimidos", "2 mg × 20", 20, 3.0, 4, "benzo", "🔒", [], { controlado: true }],
  ["Dormicum 7,5 mg", "Dormicum", "Roche", "Midazolam", "Benzodiacepina", "Comprimidos", "7,5 mg × 14", 14, 4.5, 4, "benzo", "🔒", [], { controlado: true }],
  ["Stilnox 10 mg", "Stilnox", "Sanofi", "Zolpidem", "Hipnótico", "Comprimidos", "10 mg × 28", 28, 5.2, 4, "zolpidem", "🔒", [], { controlado: true }],
  ["Zolpidem Cinfa 10 mg", "Cinfa", "Cinfa", "Zolpidem", "Hipnótico", "Comprimidos", "10 mg × 28", 28, 3.9, 4, "zolpidem", "🔒", [], { controlado: true }],
  ["Zopiclona Normon 7,5 mg", "Normon", "Normon", "Zopiclona", "Hipnótico", "Comprimidos", "7,5 mg × 28", 28, 4.1, 4, "zolpidem", "🔒", [], { controlado: true }],
  ["Adolonta 50 mg", "Adolonta", "Grünenthal", "Tramadol", "Opioide", "Cápsulas", "50 mg × 20", 20, 4.8, 4, "tramadol_opioide", "🔒", [], { controlado: true }],
  ["Adolonta retard 100 mg", "Adolonta", "Grünenthal", "Tramadol", "Opioide", "Comprimidos retard", "100 mg × 20", 20, 8.5, 4, "tramadol_opioide", "🔒", [], { controlado: true }],
  ["Tramadol/Paracetamol Normon", "Normon", "Normon", "Tramadol + paracetamol", "Opioide", "Comprimidos", "37,5/325 mg × 20", 20, 5.5, 4, "tramadol_opioide", "🔒", [], { controlado: true }],
  ["Codeisan 30 mg", "Codeisan", "Almirall", "Codeína", "Opioide", "Comprimidos", "30 mg × 20", 20, 3.6, 4, "opioide", "🔒", [], { controlado: true }],
  ["Termalgin Codeína", "Termalgin", "GSK", "Paracetamol + codeína", "Opioide", "Comprimidos", "500/30 mg × 20", 20, 4.9, 4, "opioide", "🔒", [], { controlado: true }],
  ["Durogesic Matrix 25 µg/h", "Durogesic", "Janssen", "Fentanilo", "Opioide", "Parches", "25 µg/h × 5", 5, 42.0, 4, "opioide", "🔒", [], { controlado: true }],
  ["Durogesic Matrix 50 µg/h", "Durogesic", "Janssen", "Fentanilo", "Opioide", "Parches", "50 µg/h × 5", 5, 68.0, 4, "opioide", "🔒", [], { controlado: true }],
  ["MST Continus 30 mg", "MST Continus", "Mundipharma", "Morfina", "Opioide", "Comprimidos retard", "30 mg × 30", 30, 18.5, 4, "opioide", "🔒", [], { controlado: true }],
  ["Sevredol 10 mg", "Sevredol", "Mundipharma", "Morfina", "Opioide", "Comprimidos", "10 mg × 20", 20, 9.2, 4, "opioide", "🔒", [], { controlado: true }],
  ["Oxicodona/Naloxona Targin 10/5", "Targin", "Mundipharma", "Oxicodona + naloxona", "Opioide", "Comprimidos retard", "10/5 mg × 28", 28, 55.0, 4, "opioide", "🔒", [], { controlado: true }],
  ["Rubifén 10 mg", "Rubifén", "Rubió", "Metilfenidato", "Estimulante", "Comprimidos", "10 mg × 30", 30, 8.9, 4, "otro", "🔒", [], { controlado: true }],
  ["Concerta 36 mg", "Concerta", "Janssen", "Metilfenidato", "Estimulante OROS", "Comprimidos", "36 mg × 30", 30, 48.0, 4, "otro", "🔒", [], { controlado: true }],
  ["Rivotril 2 mg", "Rivotril", "Roche", "Clonazepam", "Benzodiacepina", "Comprimidos", "2 mg × 30", 30, 4.2, 4, "benzo", "🔒", [], { controlado: true }],
  ["Lexatin 1,5 mg", "Lexatin", "Roche", "Bromazepam", "Benzodiacepina", "Cápsulas", "1,5 mg × 30", 30, 3.4, 4, "benzo", "🔒", [], { controlado: true }],
];

const DIABETES = [
  ["Metformina Cinfa 850 mg", "Cinfa", "Cinfa", "Metformina", "Biguanida", "Comprimidos", "850 mg × 50", 50, 3.5, 4, "metformina", "🩸", []],
  ["Metformina Normon 1000 mg", "Normon", "Normon", "Metformina", "Biguanida", "Comprimidos", "1000 mg × 50", 50, 4.2, 4, "metformina", "🩸", []],
  ["Diamicron MR 60 mg", "Diamicron", "Servier", "Gliclazida", "Sulfonilurea", "Comprimidos MR", "60 mg × 30", 30, 8.5, 4, "antidiabetico", "🩸", []],
  ["Januvia 100 mg", "Januvia", "MSD", "Sitagliptina", "iDPP-4", "Comprimidos", "100 mg × 28", 28, 42.0, 4, "antidiabetico", "🩸", []],
  ["Jardiance 10 mg", "Jardiance", "Boehringer/Lilly", "Empagliflozina", "iSGLT2", "Comprimidos", "10 mg × 30", 30, 55.0, 4, "antidiabetico", "🩸", []],
  ["Victoza 6 mg/ml", "Victoza", "Novo Nordisk", "Liraglutida", "GLP-1", "Pluma precargada", "6 mg/ml × 3 ml", 1, 98.0, 4, "antidiabetico", "💉", [], { nevera: true }],
  ["Lantus Solostar", "Lantus", "Sanofi", "Insulina glargina", "Insulina basal", "Pluma", "100 UI/ml × 3 ml", 1, 45.0, 4, "antidiabetico", "💉", [], { nevera: true }],
  ["NovoRapid FlexPen", "NovoRapid", "Novo Nordisk", "Insulina aspart", "Insulina rápida", "Pluma", "100 UI/ml × 3 ml", 1, 38.5, 4, "antidiabetico", "💉", [], { nevera: true }],
];

const DIGESTIVO_RX = [
  ["Pantoprazol Cinfa 40 mg", "Cinfa", "Cinfa", "Pantoprazol", "IBP", "Comprimidos gastrorresistentes", "40 mg × 28", 28, 5.5, 4, "ipp", "🔥", []],
  ["Pantoprazol Normon 20 mg", "Normon", "Normon", "Pantoprazol", "IBP", "Comprimidos", "20 mg × 28", 28, 4.2, 4, "ipp", "🔥", []],
  ["Nexium 40 mg", "Nexium", "AstraZeneca", "Esomeprazol", "IBP", "Comprimidos", "40 mg × 28", 28, 18.5, 4, "ipp", "🔥", []],
  ["Esomeprazol Cinfa 40 mg", "Cinfa", "Cinfa", "Esomeprazol", "IBP", "Cápsulas", "40 mg × 28", 28, 7.8, 4, "ipp", "🔥", []],
  ["Lansoprazol Kern 30 mg", "Kern", "Kern Pharma", "Lansoprazol", "IBP", "Cápsulas", "30 mg × 28", 28, 6.5, 4, "ipp", "🔥", []],
  ["Rabeprazol Normon 20 mg", "Normon", "Normon", "Rabeprazol", "IBP", "Comprimidos", "20 mg × 28", 28, 8.2, 4, "ipp", "🔥", []],
  ["Motilium 10 mg", "Motilium", "J&J", "Domperidona", "Procinético", "Comprimidos", "10 mg × 30", 30, 5.9, 4, "otro", "🤢", []],
  ["Primperan 10 mg", "Primperan", "Sanofi", "Metoclopramida", "Procinético", "Comprimidos", "10 mg × 40", 40, 3.8, 4, "otro", "🤢", []],
  ["Buscapina 10 mg", "Buscapina", "Boehringer", "Butilescopolamina", "Antiespasmódico", "Comprimidos", "10 mg × 20", 20, 4.5, 4, "otro", "💊", []],
  ["Buscapina Compositum", "Buscapina", "Boehringer", "Butilescopolamina + metamizol", "Cólico", "Comprimidos", "10+250 mg × 20", 20, 6.8, 4, "analgesico", "💊", []],
  ["Ulcogant 1 g", "Ulcogant", "Merck", "Sucralfato", "Protector gástrico", "Comprimidos", "1 g × 40", 40, 9.5, 4, "otro", "🛡️", []],
  ["Urdox 300 mg", "Urdox", "Faes", "Ácido ursodesoxicólico", "Hepático", "Cápsulas", "300 mg × 60", 60, 28.0, 4, "otro", "🫁", []],
  ["Salofalk 500 mg", "Salofalk", "Falk", "Mesalazina", "EII", "Comprimidos", "500 mg × 100", 100, 45.0, 4, "otro", "💊", []],
  ["Pentasa 1 g", "Pentasa", "Ferring", "Mesalazina", "EII", "Sobres", "1 g × 50", 50, 68.0, 4, "otro", "📦", []],
  ["Entocort 3 mg", "Entocort", "Tillotts", "Budesonida", "EII / corticoide", "Cápsulas", "3 mg × 100", 100, 85.0, 4, "corticoide", "💊", []],
  ["Resolor 2 mg", "Resolor", "Shire", "Prucaloprida", "Estreñimiento crónico", "Comprimidos", "2 mg × 28", 28, 52.0, 4, "otro", "💊", []],
  ["Constella 290 µg", "Constella", "Allergan", "Linaclotida", "SII-E", "Cápsulas", "290 µg × 28", 28, 58.0, 4, "otro", "💊", []],
  ["Debridat 100 mg", "Debridat", "Pfizer", "Trimebutina", "Espasmolítico", "Comprimidos", "100 mg × 20", 20, 6.2, 4, "otro", "💊", []],
  ["Aloxi 0,25 mg (sim. oral)", "Aloxi", "Helsinn", "Palonosetrón", "Antiemético", "Cápsulas", "0,5 mg × 1", 1, 95.0, 4, "otro", "💊", []],
  ["Ondansetrón Normon 8 mg", "Normon", "Normon", "Ondansetrón", "Antiemético", "Comprimidos", "8 mg × 10", 10, 12.5, 4, "otro", "💊", []],
  ["Creon 25000", "Creon", "Mylan", "Pancreatina", "Enzimas pancreáticas", "Cápsulas", "25000 × 100", 100, 42.0, 4, "otro", "💊", []],
  ["Ursofalk 250 mg", "Ursofalk", "Falk", "Ácido ursodesoxicólico", "Hepático", "Cápsulas", "250 mg × 60", 60, 32.0, 4, "otro", "💊", []],
  ["Pariet 20 mg", "Pariet", "Janssen", "Rabeprazol", "IBP", "Comprimidos", "20 mg × 28", 28, 22.0, 4, "ipp", "🔥", []],
];

const DISPENSARIO = [
  ["Suero fisiológico Braun 500 ml", "Braun", "B. Braun", "Cloruro sódico 0,9%", "Suero", "Bolsa IV", "500 ml", 1, 2.5, 4, "otro", "💧", []],
  ["Glucosa 5% Fresenius 500 ml", "Fresenius", "Fresenius Kabi", "Glucosa", "Suero", "Bolsa IV", "500 ml", 1, 2.8, 4, "otro", "💧", []],
  ["Agujas BD Microlance 21G", "BD", "Becton Dickinson", "—", "Material", "Caja", "100 uds", 100, 8.5, 21, "otro", "💉", []],
  ["Jeringas BD Plastipak 5 ml", "BD", "Becton Dickinson", "—", "Material", "Caja", "100 uds", 100, 12.0, 21, "otro", "💉", []],
  ["Gasas estériles Indas", "Indas", "Absorvic", "Algodón", "Curas", "Sobres", "100 uds", 100, 6.5, 21, "otro", "🩹", ["heridas"]],
  ["Vendas elásticas Idealbin", "Idealbin", "Texpol", "Tejido elástico", "Vendaje", "Rollo 10×10", "1 ud", 1, 3.2, 21, "otro", "🩹", ["heridas"]],
  ["Guantes nitrilo talla M", "Sempercare", "Sempermed", "Nitrilo", "Protección", "Caja", "100 uds", 100, 9.5, 21, "otro", "🧤", []],
  ["Alcohol 70° Acofar", "Acofar", "Acofarma", "Etanol", "Antiséptico", "Frasco 250 ml", "250 ml", 1, 2.1, 4, "otro", "🧴", ["heridas"]],
];

const HORMONAS = [
  ["Eutirox 50 µg", "Eutirox", "Merck", "Levotiroxina", "Tiroides", "Comprimidos", "50 µg × 30", 30, 3.5, 4, "otro", "⚖️", []],
  ["Eutirox 100 µg", "Eutirox", "Merck", "Levotiroxina", "Tiroides", "Comprimidos", "100 µg × 30", 30, 3.9, 4, "otro", "⚖️", []],
  ["Levothroid 75 µg", "Levothroid", "Aspen", "Levotiroxina", "Tiroides", "Comprimidos", "75 µg × 30", 30, 3.7, 4, "otro", "⚖️", []],
  ["Duphaston 10 mg", "Duphaston", "Abbott", "Didrogesterona", "Progestágeno", "Comprimidos", "10 mg × 20", 20, 12.5, 4, "otro", "⚖️", []],
  ["Progyluton", "Progyluton", "Bayer", "Estradiol + norgestrel", "THS / ciclo", "Comprimidos", "21 comp", 21, 9.8, 4, "otro", "⚖️", []],
  ["Yasmin", "Yasmin", "Bayer", "Etinilestradiol + drospirenona", "Anticonceptivo", "Comprimidos", "21 comp", 21, 14.5, 4, "otro", "💊", []],
];

const MENTAL = [
  ["Sertralina Cinfa 50 mg", "Cinfa", "Cinfa", "Sertralina", "ISRS", "Comprimidos", "50 mg × 30", 30, 4.5, 4, "isrs", "🧠", []],
  ["Sertralina Normon 100 mg", "Normon", "Normon", "Sertralina", "ISRS", "Comprimidos", "100 mg × 30", 30, 5.2, 4, "isrs", "🧠", []],
  ["Escitalopram Cinfa 10 mg", "Cinfa", "Cinfa", "Escitalopram", "ISRS", "Comprimidos", "10 mg × 28", 28, 5.8, 4, "isrs", "🧠", []],
  ["Escitalopram Normon 20 mg", "Normon", "Normon", "Escitalopram", "ISRS", "Comprimidos", "20 mg × 28", 28, 6.5, 4, "isrs", "🧠", []],
  ["Fluoxetina Cinfa 20 mg", "Cinfa", "Cinfa", "Fluoxetina", "ISRS", "Cápsulas", "20 mg × 28", 28, 3.9, 4, "isrs", "🧠", []],
  ["Prozac 20 mg", "Prozac", "Lilly", "Fluoxetina", "ISRS", "Cápsulas", "20 mg × 28", 28, 18.5, 4, "isrs", "🧠", []],
  ["Paroxetina Normon 20 mg", "Normon", "Normon", "Paroxetina", "ISRS", "Comprimidos", "20 mg × 28", 28, 5.5, 4, "isrs", "🧠", []],
  ["Venlafaxina Retard Cinfa 75 mg", "Cinfa", "Cinfa", "Venlafaxina", "IRSN", "Cápsulas retard", "75 mg × 30", 30, 7.8, 4, "isrs", "🧠", []],
  ["Duloxetina Kern 60 mg", "Kern", "Kern Pharma", "Duloxetina", "IRSN", "Cápsulas", "60 mg × 28", 28, 12.5, 4, "isrs", "🧠", []],
  ["Mirtazapina Cinfa 30 mg", "Cinfa", "Cinfa", "Mirtazapina", "Antidepresivo", "Comprimidos", "30 mg × 30", 30, 6.2, 4, "otro", "🧠", []],
  ["Trazodona Normon 100 mg", "Normon", "Normon", "Trazodona", "Antidepresivo", "Comprimidos", "100 mg × 30", 30, 5.9, 4, "otro", "🧠", []],
  ["Quetiapina Cinfa 25 mg", "Cinfa", "Cinfa", "Quetiapina", "Antipsicótico", "Comprimidos", "25 mg × 60", 60, 8.5, 4, "otro", "🧠", []],
  ["Quetiapina Normon 100 mg", "Normon", "Normon", "Quetiapina", "Antipsicótico", "Comprimidos", "100 mg × 60", 60, 14.0, 4, "otro", "🧠", []],
  ["Olanzapina Teva 5 mg", "Teva", "Teva", "Olanzapina", "Antipsicótico", "Comprimidos", "5 mg × 28", 28, 18.0, 4, "otro", "🧠", []],
  ["Risperdal 1 mg", "Risperdal", "Janssen", "Risperidona", "Antipsicótico", "Comprimidos", "1 mg × 20", 20, 12.5, 4, "otro", "🧠", []],
  ["Aripiprazol Cinfa 10 mg", "Cinfa", "Cinfa", "Aripiprazol", "Antipsicótico", "Comprimidos", "10 mg × 28", 28, 22.0, 4, "otro", "🧠", []],
  ["Haloperidol Esteve 10 mg", "Esteve", "Esteve", "Haloperidol", "Antipsicótico", "Comprimidos", "10 mg × 30", 30, 4.8, 4, "otro", "🧠", []],
  ["Orfidal 1 mg (salud mental)", "Orfidal", "Pfizer", "Lorazepam", "Benzodiacepina", "Comprimidos", "1 mg × 50", 50, 3.2, 4, "benzo", "🔒", [], { controlado: true }],
  ["Alprazolam Cinfa 0,5 mg", "Cinfa", "Cinfa", "Alprazolam", "Benzodiacepina", "Comprimidos", "0,5 mg × 30", 30, 2.6, 4, "benzo", "🔒", [], { controlado: true }],
];

const NEURO = [
  ["Gabapentina Cinfa 300 mg", "Cinfa", "Cinfa", "Gabapentina", "Antiepiléptico", "Cápsulas", "300 mg × 50", 50, 6.5, 4, "otro", "⚡", []],
  ["Gabapentina Normon 600 mg", "Normon", "Normon", "Gabapentina", "Antiepiléptico", "Comprimidos", "600 mg × 50", 50, 9.8, 4, "otro", "⚡", []],
  ["Lyrica 75 mg", "Lyrica", "Pfizer", "Pregabalina", "Antiepiléptico / dolor", "Cápsulas", "75 mg × 56", 56, 32.0, 4, "otro", "⚡", []],
  ["Pregabalina Cinfa 150 mg", "Cinfa", "Cinfa", "Pregabalina", "Antiepiléptico", "Cápsulas", "150 mg × 56", 56, 18.5, 4, "otro", "⚡", []],
  ["Keppra 500 mg", "Keppra", "UCB", "Levetiracetam", "Antiepiléptico", "Comprimidos", "500 mg × 60", 60, 28.0, 4, "otro", "⚡", []],
  ["Levetiracetam Normon 1000 mg", "Normon", "Normon", "Levetiracetam", "Antiepiléptico", "Comprimidos", "1000 mg × 60", 60, 22.0, 4, "otro", "⚡", []],
  ["Depakine Crono 500 mg", "Depakine", "Sanofi", "Ácido valproico", "Antiepiléptico", "Comprimidos", "500 mg × 30", 30, 8.5, 4, "otro", "⚡", []],
  ["Tegretol 200 mg", "Tegretol", "Novartis", "Carbamazepina", "Antiepiléptico", "Comprimidos", "200 mg × 50", 50, 6.2, 4, "otro", "⚡", []],
  ["Lamictal 100 mg", "Lamictal", "GSK", "Lamotrigina", "Antiepiléptico", "Comprimidos", "100 mg × 56", 56, 24.0, 4, "otro", "⚡", []],
  ["Sinemet Plus", "Sinemet", "MSD", "Levodopa + carbidopa", "Parkinson", "Comprimidos", "25/100 mg × 100", 100, 18.5, 4, "otro", "⚡", []],
  ["Rivotril gotas 2,5 mg/ml", "Rivotril", "Roche", "Clonazepam", "Antiepiléptico / benzo", "Gotas 20 ml", "2,5 mg/ml", 1, 6.8, 4, "benzo", "🔒", [], { controlado: true }],
  ["Topiramato Cinfa 50 mg", "Cinfa", "Cinfa", "Topiramato", "Antiepiléptico", "Comprimidos", "50 mg × 60", 60, 9.5, 4, "otro", "⚡", []],
  ["Trileptal 300 mg", "Trileptal", "Novartis", "Oxcarbazepina", "Antiepiléptico", "Comprimidos", "300 mg × 50", 50, 16.0, 4, "otro", "⚡", []],
];

const FRIGO = [
  ["Humira 40 mg", "Humira", "AbbVie", "Adalimumab", "Biológico", "Pluma precargada", "40 mg", 1, 950.0, 4, "otro", "❄️", [], { nevera: true }],
  ["Enbrel 50 mg", "Enbrel", "Pfizer", "Etanercept", "Biológico", "Pluma", "50 mg", 1, 480.0, 4, "otro", "❄️", [], { nevera: true }],
  ["Stelara 90 mg", "Stelara", "Janssen", "Ustekinumab", "Biológico", "Jeringa", "90 mg", 1, 2800.0, 4, "otro", "❄️", [], { nevera: true }],
  ["Prolia 60 mg", "Prolia", "Amgen", "Denosumab", "Biológico", "Jeringa precargada", "60 mg", 1, 220.0, 4, "otro", "❄️", [], { nevera: true }],
  ["Neulasta 6 mg", "Neulasta", "Amgen", "Pegfilgrastim", "Factor crecimiento", "Jeringa", "6 mg", 1, 1100.0, 4, "otro", "❄️", [], { nevera: true }],
  ["Ozempic 1 mg", "Ozempic", "Novo Nordisk", "Semaglutida", "GLP-1", "Pluma", "1 mg", 1, 145.0, 4, "antidiabetico", "❄️", [], { nevera: true }],
  ["EpiPen 0,3 mg", "EpiPen", "Mylan", "Adrenalina", "Anafilaxia", "Autoinyector", "0,3 mg", 1, 85.0, 4, "otro", "❄️", [], { nevera: true }],
];

const RESPIRATORIO = [
  ["Ventolin Inhalador", "Ventolin", "GSK", "Salbutamol", "Broncodilatador", "Inhalador MDI", "100 µg × 200 dosis", 1, 4.5, 4, "otro", "🌬️", []],
  ["Salbutamol Cinfa inhalador", "Cinfa", "Cinfa", "Salbutamol", "Broncodilatador", "Inhalador", "100 µg × 200 dosis", 1, 3.2, 4, "otro", "🌬️", []],
  ["Pulmicort Turbuhaler 200", "Pulmicort", "AstraZeneca", "Budesonida", "Corticoide inhalado", "Inhalador polvo", "200 µg × 100 dosis", 1, 18.5, 4, "corticoide", "🌬️", []],
  ["Symbicort Turbuhaler 160/4,5", "Symbicort", "AstraZeneca", "Budesonida + formoterol", "Asociación", "Inhalador polvo", "160/4,5 µg × 120", 1, 42.0, 4, "corticoide", "🌬️", []],
  ["Seretide Accuhaler 50/500", "Seretide", "GSK", "Fluticasona + salmeterol", "Asociación", "Inhalador polvo", "50/500 µg × 60", 1, 48.0, 4, "corticoide", "🌬️", []],
  ["Spiriva Respimat", "Spiriva", "Boehringer", "Tiotropio", "Anticolinérgico", "Inhalador solución", "2,5 µg × 60 dosis", 1, 55.0, 4, "otro", "🌬️", []],
  ["Singulair 10 mg", "Singulair", "MSD", "Montelukast", "Antileucotrieno", "Comprimidos", "10 mg × 28", 28, 22.0, 4, "otro", "💊", []],
];

const CORTICOIDES = [
  ["Prednisona Cinfa 5 mg", "Cinfa", "Cinfa", "Prednisona", "Corticoide oral", "Comprimidos", "5 mg × 30", 30, 2.8, 4, "corticoide", "💊", []],
  ["Prednisona Normon 10 mg", "Normon", "Normon", "Prednisona", "Corticoide oral", "Comprimidos", "10 mg × 30", 30, 3.2, 4, "corticoide", "💊", []],
  ["Dacortin 30 mg", "Dacortin", "Merck", "Prednisona", "Corticoide oral", "Comprimidos", "30 mg × 30", 30, 4.5, 4, "corticoide", "💊", []],
  ["Urbason 16 mg", "Urbason", "Sanofi", "Metilprednisolona", "Corticoide oral", "Comprimidos", "16 mg × 20", 20, 5.8, 4, "corticoide", "💊", []],
  ["Fortecortin 4 mg", "Fortecortin", "Merck", "Dexametasona", "Corticoide oral", "Comprimidos", "4 mg × 20", 20, 4.2, 4, "corticoide", "💊", []],
  ["Celestone Cronodose", "Celestone", "MSD", "Betametasona", "Corticoide inyectable", "Ampollas", "1 ml × 1", 1, 8.5, 4, "corticoide", "💉", []],
  ["Deflazacort Cinfa 30 mg", "Cinfa", "Cinfa", "Deflazacort", "Corticoide oral", "Comprimidos", "30 mg × 20", 20, 6.9, 4, "corticoide", "💊", []],
  ["Hidroaltesona 20 mg", "Hidroaltesona", "Almirall", "Hidrocortisona", "Corticoide oral", "Comprimidos", "20 mg × 50", 50, 7.5, 4, "corticoide", "💊", []],
  ["Estilsona gotas", "Estilsona", "ERN", "Prednisolona", "Corticoide pediátrico", "Gotas 20 ml", "13,3 mg/ml", 1, 5.5, 4, "corticoide", "🧒", []],
];

Object.assign(DATA, {
  "Piel / Dermatología": PIEL,
  "Salud sexual": SEXUAL,
  Vitaminas: VITAMINAS,
  Viaje: VIAJE,
  Mascotas: MASCOTAS,
  Revistas: REVISTAS,
  "Snacks / Aperitivos": SNACKS,
  Bebidas: BEBIDAS,
  Antibióticos: ANTIBIOTICOS,
  Cardiovascular: CARDIO,
  Controlados: CONTROLADOS,
  Diabetes: DIABETES,
  "Digestivo con receta": DIGESTIVO_RX,
  Dispensario: DISPENSARIO,
  Hormonas: HORMONAS,
  "Salud mental": MENTAL,
  Neurología: NEURO,
  Frigorífico: FRIGO,
  Respiratorio: RESPIRATORIO,
  "Corticoides / Esteroides": CORTICOIDES,
});

// Verify counts
for (const meta of CAT_META) {
  const list = DATA[meta.nombre];
  if (!list) throw new Error(`Missing data for ${meta.nombre}`);
  if (list.length !== meta.count) {
    throw new Error(`${meta.nombre}: got ${list.length}, expected ${meta.count}`);
  }
}

const GENERIC_MARKS = /Cinfa|Normon|Kern|Teva|Sandoz|Stada|Ratiopharm|Aurovitas|Pensa|Alter|Mylan|Viatris|Qualigen|Aristo/i;

function loteFromId(id) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const a = letters[id % letters.length];
  const b = letters[(id * 7) % letters.length];
  return `${a}${b}${String(2026 + (id % 3)).slice(2)}${String(1000 + ((id * 17) % 9000)).slice(0, 4)}`;
}

function buildProduct(id, catNombre, row, requiereReceta) {
  const [nombre, marca, laboratorio, principioActivo, subcategoria, presentacion, dosis, unidadesEnvase, precio, iva, grupoInteraccion, icon, sintomas = [], opts = {}] = row;
  const controlado = catNombre === "Controlados" ? true : !!opts.controlado;
  const nevera = catNombre === "Frigorífico" ? true : !!opts.nevera;
  const dias = 60 + ((id * 41 + 7) % 841); // 60..900
  const stock = 8 + ((id * 13) % 90);
  const stockMinimo = 5 + (id % 10);
  const coste = Math.round(precio * 0.6 * 100) / 100;
  const esGenerico = GENERIC_MARKS.test(marca) || GENERIC_MARKS.test(laboratorio) || /EFG/i.test(nombre);
  const skuPrefix = requiereReceta ? (controlado ? "CTL" : nevera ? "FRI" : "RX") : "OTC";
  return {
    id,
    sku: `${skuPrefix}-${String(id).padStart(4, "0")}`,
    ean: String(8400000000000 + id),
    nombre,
    marca,
    laboratorio,
    principioActivo,
    categoria: catNombre,
    subcategoria,
    presentacion,
    dosis,
    unidadesEnvase,
    requiereReceta,
    controlado,
    nevera,
    icon,
    sintomas: Array.isArray(sintomas) ? sintomas.slice() : [],
    grupoInteraccion,
    precio: Math.round(precio * 100) / 100,
    coste,
    iva,
    stock,
    stockInicial: stock,
    stockMinimo,
    lote: loteFromId(id),
    caducidadMs: BASE + dias * MS_DIA,
    esGenerico,
    colorCategoria: colorByCat[catNombre],
  };
}

// Build JS file content
const productos = [];
let id = 1;
const SINTOMAS_SET = new Set();

for (const meta of CAT_META) {
  for (const row of DATA[meta.nombre]) {
    const p = buildProduct(id++, meta.nombre, row, meta.requiereReceta);
    productos.push(p);
    for (const s of p.sintomas) SINTOMAS_SET.add(s);
  }
}

if (productos.length !== 363) throw new Error(`Total ${productos.length} !== 363`);

const SINTOMAS = [
  "dolor de cabeza", "fiebre", "tos", "alergia", "acidez", "diarrea",
  "estreñimiento", "congestión", "dolor muscular", "piel irritada",
  "insomnio", "estres", "vitaminas", "higiene íntima", "solar",
  "heridas", "dejar de fumar", "deporte", "pediatría", "viaje", "mascotas",
];

function esc(s) {
  return JSON.stringify(s);
}

function emitProduct(p) {
  return `    ${JSON.stringify(p)}`;
}

let out = `/**
 * Catálogo curado de Farmacia Álora — 363 productos reales de práctica.
 * Simulación educativa. No es consejo médico ni fuente oficial.
 */
(function (global) {
  const CATEGORIAS_UI = ${JSON.stringify(CAT_META, null, 2).replace(/^/gm, "  ").trim()};

  const CATEGORIAS = CATEGORIAS_UI.map((c) => c.nombre);

  const SINTOMAS = ${JSON.stringify(SINTOMAS, null, 2).replace(/^/gm, "  ").trim()};

  const PRODUCTOS = [
${productos.map(emitProduct).join(",\n")}
  ];

  function getCatalogo() {
    return {
      productos: PRODUCTOS.map((p) => ({ ...p, sintomas: (p.sintomas || []).slice() })),
      categorias: CATEGORIAS.slice(),
      categoriasUI: CATEGORIAS_UI.map((c) => ({ ...c })),
      sintomas: SINTOMAS.slice(),
      total: PRODUCTOS.length,
      generadoEn: new Date().toISOString(),
    };
  }

  global.FarmaciaCatalogo = {
    getCatalogo,
    CATEGORIAS,
    CATEGORIAS_UI,
    SINTOMAS,
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

const outPath = path.join(__dirname, "..", "js", "catalog.js");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath, "products:", productos.length);

// Print counts table
console.log("\nCategoría".padEnd(32), "N", "RX", "CTRL", "FRIGO");
console.log("-".repeat(55));
for (const meta of CAT_META) {
  const list = productos.filter((p) => p.categoria === meta.nombre);
  const ctrl = list.filter((p) => p.controlado).length;
  const fri = list.filter((p) => p.nevera).length;
  console.log(
    meta.nombre.padEnd(32),
    String(list.length).padStart(3),
    meta.requiereReceta ? " Sí" : " No",
    String(ctrl).padStart(4),
    String(fri).padStart(5)
  );
}
console.log("-".repeat(55));
console.log("TOTAL".padEnd(32), String(productos.length).padStart(3));
