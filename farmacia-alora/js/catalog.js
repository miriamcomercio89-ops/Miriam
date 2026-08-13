/**
 * Catálogo de Farmacia Álora — generador de miles de productos realistas
 * (marcas y principios activos de uso habitual en farmacia española).
 * Solo para simulación / práctica. No es consejo médico ni fuente oficial.
 */
(function (global) {
  const CATEGORIAS = [
    "Medicamentos OTC",
    "Medicamentos con receta",
    "Antibióticos",
    "Cardiovascular",
    "Respiratorio",
    "Digestivo",
    "Analgésicos y antiinflamatorios",
    "Sistema nervioso",
    "Dermatología",
    "Dermocosmética",
    "Higiene personal",
    "Higiene bucal",
    "Bebé y maternidad",
    "Vitaminas y suplementos",
    "Nutrición",
    "Ortopedia",
    "Primeros auxilios",
    "Salud sexual",
    "Óptica",
    "Homeopatía",
    "Veterinaria",
    "Diabetes",
    "Alergia",
    "Ginecología",
    "Otorrino y oftalmología",
  ];

  const MARCAS_FARMA = [
    "Cinfa", "Kern Pharma", "Normon", "Teva", "Sandoz", "Stada", "Ratiopharm",
    "Bayer", "Pfizer", "GSK", "Sanofi", "Novartis", "AstraZeneca", "Boehringer",
    "Esteve", "Almirall", "Ferrer", "Uriach", "ERN", "Mylan", "Aurovitas",
    "Aristo", "Qualigen", "Pensa", "Alter", "Viatris", "Lilly", "MSD",
    "Janssen", "Roche", "AbbVie", "Gedeon Richter", "Menarini", "Servier",
    "Faes Farma", "Chiesi", "Italfarmaco", "Gebro", "Lacer", "Isdin Farma",
  ];

  const MARCAS_PARA = [
    "Isdin", "La Roche-Posay", "Avène", "Bioderma", "Vichy", "Eucerin", "CeraVe",
    "Mustela", "Chicco", "Dodot", "Durex", "Hansaplast", "Compeed", "Bepanthol",
    "Leti", "Sesderma", "Martiderm", "Uriage", "SVR", "Ducray", "A-Derma",
    "Nuxe", "Filorga", "Lutsine", "Cumlaude", "Gynea", "Pharmaton", "Supradyn",
    "Redoxon", "Berocca", "Centrum", "Juvamine", "Aquilea", "Arkopharma",
    "Weleda", "Boiron", "Heel", "Elgydium", "Vitis", "Oral-B", "Colgate",
    "Sensodyne", "Listerine", "Philips Avent", "Medela", "Suavinex", "Lansinoh",
    "Farmalastic", "Prim", "Futuro", "Bauerfeind", "Thuasne", "Comfeel",
    "Urgo", "Mepiform", "Biatain", "OneTouch", "Accu-Chek", "FreeStyle",
    "Frontline", "Advantix", "Seresto", "Hills", "Royal Canin", "Affinity",
  ];

  const PRINCIPIOS = [
    // OTC / analgésicos
    { nombre: "Paracetamol", receta: false, cats: ["Medicamentos OTC", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Ibuprofeno", receta: false, cats: ["Medicamentos OTC", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Ácido acetilsalicílico", receta: false, cats: ["Medicamentos OTC", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Metamizol", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Dexketoprofeno", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Naproxeno", receta: false, cats: ["Medicamentos OTC", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Diclofenaco", receta: false, cats: ["Medicamentos OTC", "Dermatología", "Analgésicos y antiinflamatorios"], controlado: false },
    { nombre: "Tramadol", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: true },
    { nombre: "Codeína + Paracetamol", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: true },
    { nombre: "Fentanilo", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: true },
    { nombre: "Morfina", receta: true, cats: ["Medicamentos con receta", "Analgésicos y antiinflamatorios"], controlado: true },
    // Antibióticos
    { nombre: "Amoxicilina", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Amoxicilina/Ácido clavulánico", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Azitromicina", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Ciprofloxacino", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Doxiciclina", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Claritromicina", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Cefuroxima", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Levofloxacino", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Metronidazol", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    { nombre: "Fosfomicina", receta: true, cats: ["Antibióticos", "Medicamentos con receta"], controlado: false },
    // Cardiovascular
    { nombre: "Enalapril", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Ramipril", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Losartán", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Amlodipino", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Atenolol", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Bisoprolol", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Atorvastatina", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Simvastatina", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Ácido acetilsalicílico 100 mg", receta: false, cats: ["Cardiovascular", "Medicamentos OTC"], controlado: false },
    { nombre: "Clopidogrel", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Furosemida", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Warfarina", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    { nombre: "Apixabán", receta: true, cats: ["Cardiovascular", "Medicamentos con receta"], controlado: false },
    // Respiratorio / alergia
    { nombre: "Salbutamol", receta: true, cats: ["Respiratorio", "Medicamentos con receta"], controlado: false },
    { nombre: "Budesonida", receta: true, cats: ["Respiratorio", "Medicamentos con receta"], controlado: false },
    { nombre: "Montelukast", receta: true, cats: ["Respiratorio", "Alergia", "Medicamentos con receta"], controlado: false },
    { nombre: "Loratadina", receta: false, cats: ["Alergia", "Medicamentos OTC"], controlado: false },
    { nombre: "Cetirizina", receta: false, cats: ["Alergia", "Medicamentos OTC"], controlado: false },
    { nombre: "Desloratadina", receta: false, cats: ["Alergia", "Medicamentos OTC"], controlado: false },
    { nombre: "Fexofenadina", receta: false, cats: ["Alergia", "Medicamentos OTC"], controlado: false },
    { nombre: "Dextrometorfano", receta: false, cats: ["Respiratorio", "Medicamentos OTC"], controlado: false },
    { nombre: "Ambroxol", receta: false, cats: ["Respiratorio", "Medicamentos OTC"], controlado: false },
    { nombre: "Acetilcisteína", receta: false, cats: ["Respiratorio", "Medicamentos OTC"], controlado: false },
    { nombre: "Pseudoefedrina", receta: false, cats: ["Respiratorio", "Medicamentos OTC"], controlado: false },
    // Digestivo
    { nombre: "Omeprazol", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Pantoprazol", receta: true, cats: ["Digestivo", "Medicamentos con receta"], controlado: false },
    { nombre: "Esomeprazol", receta: true, cats: ["Digestivo", "Medicamentos con receta"], controlado: false },
    { nombre: "Ranitidina", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Domperidona", receta: true, cats: ["Digestivo", "Medicamentos con receta"], controlado: false },
    { nombre: "Metoclopramida", receta: true, cats: ["Digestivo", "Medicamentos con receta"], controlado: false },
    { nombre: "Loperamida", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Lactulosa", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Macrogol", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Simeticona", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    { nombre: "Saccharomyces boulardii", receta: false, cats: ["Digestivo", "Medicamentos OTC"], controlado: false },
    // Sistema nervioso
    { nombre: "Sertralina", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Escitalopram", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Fluoxetina", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Alprazolam", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: true },
    { nombre: "Lorazepam", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: true },
    { nombre: "Diazepam", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: true },
    { nombre: "Zolpidem", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: true },
    { nombre: "Quetiapina", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Gabapentina", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Pregabalina", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: false },
    { nombre: "Metilfenidato", receta: true, cats: ["Sistema nervioso", "Medicamentos con receta"], controlado: true },
    // Diabetes
    { nombre: "Metformina", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    { nombre: "Gliclazida", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    { nombre: "Sitagliptina", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    { nombre: "Insulina glargina", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    { nombre: "Insulina aspart", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    { nombre: "Empagliflozina", receta: true, cats: ["Diabetes", "Medicamentos con receta"], controlado: false },
    // Dermatología
    { nombre: "Hidrocortisona", receta: false, cats: ["Dermatología", "Medicamentos OTC"], controlado: false },
    { nombre: "Clotrimazol", receta: false, cats: ["Dermatología", "Medicamentos OTC"], controlado: false },
    { nombre: "Mupirocina", receta: true, cats: ["Dermatología", "Medicamentos con receta"], controlado: false },
    { nombre: "Aciclovir tópico", receta: false, cats: ["Dermatología", "Medicamentos OTC"], controlado: false },
    { nombre: "Isotretinoína", receta: true, cats: ["Dermatología", "Medicamentos con receta"], controlado: false },
    { nombre: "Permetrina", receta: false, cats: ["Dermatología", "Medicamentos OTC"], controlado: false },
    // Ginecología
    { nombre: "Levonorgestrel", receta: false, cats: ["Ginecología", "Medicamentos OTC"], controlado: false },
    { nombre: "Etinilestradiol/Levonorgestrel", receta: true, cats: ["Ginecología", "Medicamentos con receta"], controlado: false },
    { nombre: "Clotrimazol vaginal", receta: false, cats: ["Ginecología", "Medicamentos OTC"], controlado: false },
    // Oftalmo / ORL
    { nombre: "Lágrimas artificiales", receta: false, cats: ["Otorrino y oftalmología", "Óptica"], controlado: false },
    { nombre: "Tobramicina oftálmica", receta: true, cats: ["Otorrino y oftalmología", "Medicamentos con receta"], controlado: false },
    { nombre: "Xilometazolina", receta: false, cats: ["Otorrino y oftalmología", "Medicamentos OTC"], controlado: false },
    { nombre: "Fluticasona nasal", receta: false, cats: ["Otorrino y oftalmología", "Alergia"], controlado: false },
  ];

  const MARCAS_COMERCIALES = {
    "Paracetamol": ["Gelocatil", "Efferalgan", "Termalgin", "Paracetamol"],
    "Ibuprofeno": ["Dalsy", "Neobrufen", "Espidifen", "Ibuprofeno"],
    "Metamizol": ["Nolotil", "Metamizol"],
    "Dexketoprofeno": ["Enantyum", "Dexketoprofeno"],
    "Diclofenaco": ["Voltaren", "Diclofenaco"],
    "Omeprazol": ["Omeprazol", "Losec"],
    "Amoxicilina": ["Clamoxyl", "Amoxicilina"],
    "Amoxicilina/Ácido clavulánico": ["Augmentine", "Clavucid", "Amoxicilina/Clavulánico"],
    "Loratadina": ["Clarityne", "Loratadina"],
    "Cetirizina": ["Zyrtec", "Cetirizina"],
    "Salbutamol": ["Ventolin", "Salbutamol"],
    "Atorvastatina": ["Zarator", "Atorvastatina"],
    "Metformina": ["Dianben", "Metformina"],
    "Alprazolam": ["Trankimazin", "Alprazolam"],
    "Lorazepam": ["Orfidal", "Lorazepam"],
    "Sertralina": ["Besitran", "Sertralina"],
    "Escitalopram": ["Esertia", "Escitalopram"],
    "Levonorgestrel": ["NorLevo", "Postinor", "Levonorgestrel"],
    "Acetilcisteína": ["Fluimucil", "Acetilcisteína"],
    "Ambroxol": ["Mucosan", "Ambroxol"],
    "Dextrometorfano": ["Romilar", "Dextrometorfano"],
    "Loperamida": ["Fortasec", "Loperamida"],
    "Simeticona": ["Aerored", "Simonet"],
  };

  const PRESENTACIONES_FARMA = [
    { tipo: "comprimidos", packs: [10, 20, 28, 30, 40, 60], dosis: ["500 mg", "600 mg", "1 g", "10 mg", "20 mg", "25 mg", "50 mg", "100 mg", "250 mg", "400 mg"] },
    { tipo: "cápsulas", packs: [14, 28, 30, 56], dosis: ["10 mg", "20 mg", "40 mg", "75 mg", "150 mg", "300 mg"] },
    { tipo: "sobres", packs: [10, 20, 30], dosis: ["500 mg", "600 mg", "1 g", "3 g"] },
    { tipo: "jarabe", packs: [1], dosis: ["100 ml", "120 ml", "150 ml", "200 ml"] },
    { tipo: "suspensión", packs: [1], dosis: ["60 ml", "100 ml", "120 ml"] },
    { tipo: "gotas", packs: [1], dosis: ["15 ml", "20 ml", "30 ml"] },
    { tipo: "crema", packs: [1], dosis: ["15 g", "30 g", "40 g", "60 g"] },
    { tipo: "gel", packs: [1], dosis: ["30 g", "50 g", "100 g"] },
    { tipo: "pomada", packs: [1], dosis: ["15 g", "30 g"] },
    { tipo: "spray nasal", packs: [1], dosis: ["10 ml", "15 ml", "20 ml"] },
    { tipo: "inhalador", packs: [1], dosis: ["100 mcg", "200 mcg", "120 dosis"] },
    { tipo: "parche", packs: [5, 7, 10], dosis: ["12 mcg/h", "25 mcg/h", "50 mcg/h", "75 mcg/h"] },
    { tipo: "inyectable", packs: [1, 5], dosis: ["1 ml", "2 ml", "5 ml"] },
    { tipo: "óvulos", packs: [3, 6], dosis: ["100 mg", "500 mg"] },
    { tipo: "colirio", packs: [1], dosis: ["5 ml", "10 ml"] },
  ];

  const PARA_LINEAS = [
    // Dermocosmética
    { marca: "La Roche-Posay", linea: "Effaclar Gel", cat: "Dermocosmética", sub: "Acné", precios: [12.9, 16.5, 19.9], tamanos: ["200 ml", "400 ml"] },
    { marca: "La Roche-Posay", linea: "Cicaplast Baume B5", cat: "Dermocosmética", sub: "Reparación", precios: [9.9, 14.5], tamanos: ["40 ml", "100 ml"] },
    { marca: "La Roche-Posay", linea: "Anthelios Fluido", cat: "Dermocosmética", sub: "Solar", precios: [18.9, 22.5], tamanos: ["50 ml"] },
    { marca: "Avène", linea: "Cicalfate+", cat: "Dermocosmética", sub: "Reparación", precios: [8.5, 12.9], tamanos: ["40 ml", "100 ml"] },
    { marca: "Avène", linea: "Cleanance Gel", cat: "Dermocosmética", sub: "Acné", precios: [11.5, 15.9], tamanos: ["200 ml", "400 ml"] },
    { marca: "Avène", linea: "Agua termal", cat: "Dermocosmética", sub: "Calmante", precios: [6.9, 9.5, 12.9], tamanos: ["50 ml", "150 ml", "300 ml"] },
    { marca: "Bioderma", linea: "Sensibio H2O", cat: "Dermocosmética", sub: "Limpieza", precios: [10.9, 14.9, 18.9], tamanos: ["250 ml", "500 ml", "1 L"] },
    { marca: "Bioderma", linea: "Atoderm Crema", cat: "Dermocosmética", sub: "Atopia", precios: [13.5, 19.9], tamanos: ["200 ml", "500 ml"] },
    { marca: "Bioderma", linea: "Photoderm MAX", cat: "Dermocosmética", sub: "Solar", precios: [16.9, 21.5], tamanos: ["40 ml"] },
    { marca: "Isdin", linea: "Fusion Water SPF50", cat: "Dermocosmética", sub: "Solar", precios: [19.9, 24.5], tamanos: ["50 ml"] },
    { marca: "Isdin", linea: "Ureadin Crema", cat: "Dermocosmética", sub: "Hidratación", precios: [14.5, 18.9], tamanos: ["50 ml", "200 ml"] },
    { marca: "Isdin", linea: "Si-Nails", cat: "Dermocosmética", sub: "Uñas", precios: [17.9], tamanos: ["2.5 ml"] },
    { marca: "Eucerin", linea: "AtopiControl", cat: "Dermocosmética", sub: "Atopia", precios: [15.9, 22.5], tamanos: ["250 ml", "400 ml"] },
    { marca: "Eucerin", linea: "Hyaluron-Filler", cat: "Dermocosmética", sub: "Antiedad", precios: [28.9, 34.5], tamanos: ["50 ml"] },
    { marca: "Eucerin", linea: "DermoPure Gel", cat: "Dermocosmética", sub: "Acné", precios: [13.9], tamanos: ["200 ml"] },
    { marca: "Vichy", linea: "Mineral 89", cat: "Dermocosmética", sub: "Hidratación", precios: [22.9, 29.9], tamanos: ["50 ml"] },
    { marca: "Vichy", linea: "Capital Soleil", cat: "Dermocosmética", sub: "Solar", precios: [17.5, 21.9], tamanos: ["50 ml"] },
    { marca: "CeraVe", linea: "Crema hidratante", cat: "Dermocosmética", sub: "Hidratación", precios: [12.9, 18.5], tamanos: ["177 ml", "340 ml"] },
    { marca: "CeraVe", linea: "Gel limpiador", cat: "Dermocosmética", sub: "Limpieza", precios: [11.9, 16.9], tamanos: ["236 ml", "473 ml"] },
    { marca: "Sesderma", linea: "C-Vit Serum", cat: "Dermocosmética", sub: "Antiedad", precios: [32.9], tamanos: ["30 ml"] },
    { marca: "Martiderm", linea: "Proteos Hydra Plus", cat: "Dermocosmética", sub: "Ampollas", precios: [28.5, 39.9], tamanos: ["10 amp", "30 amp"] },
    { marca: "Bepanthol", linea: "Pomada protectora", cat: "Dermocosmética", sub: "Reparación", precios: [7.9, 11.5], tamanos: ["30 g", "100 g"] },
    { marca: "Leti", linea: "AT4 Crema", cat: "Dermocosmética", sub: "Atopia", precios: [14.9, 21.5], tamanos: ["200 ml"] },
    // Higiene
    { marca: "Vitis", linea: "Pasta orthodontic", cat: "Higiene bucal", sub: "Pasta", precios: [5.9, 7.5], tamanos: ["100 ml"] },
    { marca: "Vitis", linea: "Enjuague Gingival", cat: "Higiene bucal", sub: "Enjuague", precios: [8.9, 12.5], tamanos: ["500 ml"] },
    { marca: "Elgydium", linea: "Pasta antiplaca", cat: "Higiene bucal", sub: "Pasta", precios: [6.5], tamanos: ["75 ml"] },
    { marca: "Sensodyne", linea: "Repair & Protect", cat: "Higiene bucal", sub: "Pasta", precios: [5.5, 7.9], tamanos: ["75 ml"] },
    { marca: "Oral-B", linea: "Pro-Expert", cat: "Higiene bucal", sub: "Pasta", precios: [4.9, 6.5], tamanos: ["75 ml"] },
    { marca: "Listerine", linea: "Total Care", cat: "Higiene bucal", sub: "Enjuague", precios: [6.9, 9.5], tamanos: ["500 ml", "1 L"] },
    { marca: "Lactovit", linea: "Gel de ducha", cat: "Higiene personal", sub: "Ducha", precios: [3.5, 4.9], tamanos: ["250 ml", "500 ml"] },
    { marca: "Lactovit", linea: "Desodorante", cat: "Higiene personal", sub: "Desodorante", precios: [3.9, 5.2], tamanos: ["50 ml"] },
    { marca: "Nivea", linea: "Crema manos", cat: "Higiene personal", sub: "Manos", precios: [2.9, 4.5], tamanos: ["75 ml", "100 ml"] },
    { marca: "Dove", linea: "Jabón pastilla", cat: "Higiene personal", sub: "Jabón", precios: [1.5, 2.2], tamanos: ["90 g"] },
    // Bebé
    { marca: "Mustela", linea: "Hydra Bébé", cat: "Bebé y maternidad", sub: "Hidratación", precios: [9.9, 14.5], tamanos: ["300 ml", "500 ml"] },
    { marca: "Mustela", linea: "Creme change", cat: "Bebé y maternidad", sub: "Pañal", precios: [8.5, 11.9], tamanos: ["100 ml"] },
    { marca: "Dodot", linea: "Pañales Sensitive", cat: "Bebé y maternidad", sub: "Pañales", precios: [12.9, 18.5, 24.9], tamanos: ["T1 28 u", "T2 40 u", "T3 56 u", "T4 48 u", "T5 42 u"] },
    { marca: "Dodot", linea: "Toallitas Aqua", cat: "Bebé y maternidad", sub: "Toallitas", precios: [2.5, 4.9], tamanos: ["56 u", "144 u"] },
    { marca: "Chicco", linea: "Biberón Natural Feeling", cat: "Bebé y maternidad", sub: "Biberón", precios: [9.5, 12.9], tamanos: ["150 ml", "250 ml"] },
    { marca: "Philips Avent", linea: "Biberón Natural", cat: "Bebé y maternidad", sub: "Biberón", precios: [11.5, 14.9], tamanos: ["125 ml", "260 ml"] },
    { marca: "Medela", linea: "Extractor Swing Flex", cat: "Bebé y maternidad", sub: "Extractor", precios: [129.0], tamanos: ["1 ud"] },
    { marca: "Suavinex", linea: "Chupete Physiological", cat: "Bebé y maternidad", sub: "Chupete", precios: [6.5, 8.9], tamanos: ["0-6 m", "6-18 m"] },
    { marca: "Lansinoh", linea: "Lanolina HPA", cat: "Bebé y maternidad", sub: "Lactancia", precios: [12.9], tamanos: ["40 ml"] },
    // Vitaminas
    { marca: "Supradyn", linea: "Activo", cat: "Vitaminas y suplementos", sub: "Multivitamínico", precios: [12.5, 18.9], tamanos: ["30 comp", "60 comp"] },
    { marca: "Supradyn", linea: "Energy", cat: "Vitaminas y suplementos", sub: "Multivitamínico", precios: [14.9], tamanos: ["30 comp"] },
    { marca: "Redoxon", linea: "Doble Acción", cat: "Vitaminas y suplementos", sub: "Vitamina C", precios: [9.9, 14.5], tamanos: ["30 comp", "45 comp"] },
    { marca: "Berocca", linea: "Performance", cat: "Vitaminas y suplementos", sub: "Energía", precios: [13.5, 19.9], tamanos: ["30 comp"] },
    { marca: "Pharmaton", linea: "Complex", cat: "Vitaminas y suplementos", sub: "Multivitamínico", precios: [16.9, 24.5], tamanos: ["30 cap", "60 cap"] },
    { marca: "Centrum", linea: "Adultos", cat: "Vitaminas y suplementos", sub: "Multivitamínico", precios: [11.9, 17.5], tamanos: ["30 comp", "60 comp"] },
    { marca: "Aquilea", linea: "Sueño", cat: "Vitaminas y suplementos", sub: "Descanso", precios: [10.9, 15.5], tamanos: ["30 comp", "60 comp"] },
    { marca: "Aquilea", linea: "Magnesio", cat: "Vitaminas y suplementos", sub: "Minerales", precios: [8.9, 12.5], tamanos: ["28 comp"] },
    { marca: "Arkopharma", linea: "Arkovital Magnesio", cat: "Vitaminas y suplementos", sub: "Minerales", precios: [9.5], tamanos: ["30 cap"] },
    { marca: "Juvamine", linea: "Vitamina D3", cat: "Vitaminas y suplementos", sub: "Vitamina D", precios: [7.9, 11.5], tamanos: ["30 cap", "60 cap"] },
    { marca: "Uriach", linea: "Aquilea Articulaciones", cat: "Vitaminas y suplementos", sub: "Articular", precios: [18.9], tamanos: ["30 comp"] },
    // Nutrición
    { marca: "Ensure", linea: "Nutrivigor", cat: "Nutrición", sub: "Complemento", precios: [14.5, 22.9], tamanos: ["220 ml x4", "400 g"] },
    { marca: "Fortimel", linea: "Extra", cat: "Nutrición", sub: "Complemento", precios: [12.9, 19.5], tamanos: ["200 ml x4"] },
    { marca: "Meritene", linea: "Fuerza y vitalidad", cat: "Nutrición", sub: "Complemento", precios: [13.9], tamanos: ["15 sobres"] },
    { marca: "Resource", linea: "Diabet Plus", cat: "Nutrición", sub: "Diabetes", precios: [16.5], tamanos: ["200 ml x4"] },
    // Ortopedia
    { marca: "Farmalastic", linea: "Tobillera", cat: "Ortopedia", sub: "Tobillo", precios: [14.9, 19.5], tamanos: ["Talla S", "Talla M", "Talla L"] },
    { marca: "Farmalastic", linea: "Muñequera", cat: "Ortopedia", sub: "Muñeca", precios: [12.5, 16.9], tamanos: ["Talla S/M", "Talla L/XL"] },
    { marca: "Prim", linea: "Rodillera elástica", cat: "Ortopedia", sub: "Rodilla", precios: [11.9, 15.5], tamanos: ["Talla M", "Talla L", "Talla XL"] },
    { marca: "Futuro", linea: "Coderas Comfort", cat: "Ortopedia", sub: "Codo", precios: [13.5], tamanos: ["Talla M", "Talla L"] },
    { marca: "Thuasne", linea: "Faja lumbar", cat: "Ortopedia", sub: "Lumbar", precios: [29.9, 39.5], tamanos: ["Talla 1", "Talla 2", "Talla 3"] },
    { marca: "Bauerfeind", linea: "GenuTrain", cat: "Ortopedia", sub: "Rodilla", precios: [79.0, 89.0], tamanos: ["Talla 3", "Talla 4", "Talla 5"] },
    { marca: "Compeed", linea: "Apósitos ampollas", cat: "Primeros auxilios", sub: "Ampollas", precios: [6.5, 8.9], tamanos: ["5 u", "10 u"] },
    // Primeros auxilios
    { marca: "Hansaplast", linea: "Apósitos surtidos", cat: "Primeros auxilios", sub: "Apósitos", precios: [3.5, 5.9], tamanos: ["20 u", "40 u"] },
    { marca: "Hansaplast", linea: "Spray antiséptico", cat: "Primeros auxilios", sub: "Antiséptico", precios: [6.9], tamanos: ["50 ml"] },
    { marca: "Urgo", linea: "Cicatrizante", cat: "Primeros auxilios", sub: "Heridas", precios: [7.5, 10.9], tamanos: ["3.5 ml"] },
    { marca: "Betadine", linea: "Solución dérmica", cat: "Primeros auxilios", sub: "Antiséptico", precios: [5.5, 8.9], tamanos: ["50 ml", "125 ml"] },
    { marca: "Alcohol", linea: "Alcohol 70º", cat: "Primeros auxilios", sub: "Antiséptico", precios: [1.8, 2.5], tamanos: ["250 ml", "500 ml"] },
    { marca: "Suero", linea: "Suero fisiológico", cat: "Primeros auxilios", sub: "Suero", precios: [2.2, 3.5], tamanos: ["30 monodosis", "250 ml"] },
    // Salud sexual
    { marca: "Durex", linea: "Preservativos Natural", cat: "Salud sexual", sub: "Preservativos", precios: [5.9, 9.5, 14.9], tamanos: ["6 u", "12 u", "24 u"] },
    { marca: "Durex", linea: "Preservativos Sensitive", cat: "Salud sexual", sub: "Preservativos", precios: [6.5, 10.9], tamanos: ["6 u", "12 u"] },
    { marca: "Durex", linea: "Gel Play", cat: "Salud sexual", sub: "Lubricante", precios: [8.9, 12.5], tamanos: ["50 ml"] },
    { marca: "Control", linea: "Preservativos Adapta", cat: "Salud sexual", sub: "Preservativos", precios: [4.9, 7.5], tamanos: ["6 u", "12 u"] },
    { marca: "Gynea", linea: "Cumlaude CLX", cat: "Ginecología", sub: "Higiene íntima", precios: [11.9, 15.5], tamanos: ["500 ml"] },
    // Óptica
    { marca: "Opti-Free", linea: "PureMoist", cat: "Óptica", sub: "Lentillas", precios: [9.9, 14.5], tamanos: ["300 ml", "2x300 ml"] },
    { marca: "ReNu", linea: "MultiPlus", cat: "Óptica", sub: "Lentillas", precios: [8.5, 12.9], tamanos: ["360 ml"] },
    { marca: "Systane", linea: "Ultra", cat: "Óptica", sub: "Lágrimas", precios: [12.9, 16.5], tamanos: ["10 ml"] },
    { marca: "Artelac", linea: "Rebalance", cat: "Óptica", sub: "Lágrimas", precios: [11.5], tamanos: ["10 ml"] },
    // Homeopatía
    { marca: "Boiron", linea: "Oscillococcinum", cat: "Homeopatía", sub: "Gripe", precios: [9.5, 14.9], tamanos: ["6 dosis", "30 dosis"] },
    { marca: "Boiron", linea: "Arnigel", cat: "Homeopatía", sub: "Traumatismos", precios: [8.9], tamanos: ["45 g"] },
    { marca: "Boiron", linea: "Coryzalia", cat: "Homeopatía", sub: "Resfriado", precios: [7.5], tamanos: ["40 comp"] },
    { marca: "Heel", linea: "Traumeel", cat: "Homeopatía", sub: "Traumatismos", precios: [11.9], tamanos: ["50 g"] },
    { marca: "Weleda", linea: "Caléndula pomada", cat: "Homeopatía", sub: "Piel", precios: [8.5], tamanos: ["25 g"] },
    // Veterinaria
    { marca: "Frontline", linea: "Combo Spot-On Perro", cat: "Veterinaria", sub: "Antiparasitario", precios: [18.9, 28.5, 39.9], tamanos: ["S", "M", "L", "XL"] },
    { marca: "Frontline", linea: "Combo Spot-On Gato", cat: "Veterinaria", sub: "Antiparasitario", precios: [16.9, 24.5], tamanos: ["1 pipeta", "3 pipetas"] },
    { marca: "Advantix", linea: "Spot-On Perro", cat: "Veterinaria", sub: "Antiparasitario", precios: [19.5, 29.9], tamanos: ["S", "M", "L"] },
    { marca: "Seresto", linea: "Collar Perro", cat: "Veterinaria", sub: "Collar", precios: [34.9, 39.9], tamanos: ["≤8 kg", ">8 kg"] },
    { marca: "Hills", linea: "Prescription Diet", cat: "Veterinaria", sub: "Alimento", precios: [22.9, 34.5], tamanos: ["1.5 kg", "4 kg"] },
    // Diabetes material
    { marca: "Accu-Chek", linea: "Guide tiras", cat: "Diabetes", sub: "Tiras", precios: [24.9, 39.9], tamanos: ["50 u", "100 u"] },
    { marca: "Accu-Chek", linea: "FastClix lancetas", cat: "Diabetes", sub: "Lancetas", precios: [9.5, 14.9], tamanos: ["102 u", "204 u"] },
    { marca: "OneTouch", linea: "Select Plus tiras", cat: "Diabetes", sub: "Tiras", precios: [22.5, 36.9], tamanos: ["50 u", "100 u"] },
    { marca: "FreeStyle", linea: "Libre sensores", cat: "Diabetes", sub: "Sensor", precios: [59.9], tamanos: ["1 sensor"] },
  ];

  const MARCAS_COMERCIALES_EXTRA = [
    { nombre: "Frenadol Complex", pa: "Paracetamol + Clorfenamina + Cafeína", marca: "Frenadol", cat: "Medicamentos OTC", receta: false, precio: 8.95, presentacion: "sobres 10 u", iva: 4 },
    { nombre: "Frenadol Junior", pa: "Paracetamol + Clorfenamina", marca: "Frenadol", cat: "Medicamentos OTC", receta: false, precio: 7.5, presentacion: "sobres 10 u", iva: 4 },
    { nombre: "Bisolvon Antitusivo", pa: "Dextrometorfano", marca: "Bisolvon", cat: "Respiratorio", receta: false, precio: 9.2, presentacion: "jarabe 200 ml", iva: 4 },
    { nombre: "Apiretal 100 mg/ml", pa: "Paracetamol", marca: "Apiretal", cat: "Medicamentos OTC", receta: false, precio: 4.85, presentacion: "gotas 30 ml", iva: 4 },
    { nombre: "Dalsy 20 mg/ml", pa: "Ibuprofeno", marca: "Dalsy", cat: "Medicamentos OTC", receta: false, precio: 5.45, presentacion: "suspensión 200 ml", iva: 4 },
    { nombre: "Almax Forte", pa: "Almagato", marca: "Almax", cat: "Digestivo", receta: false, precio: 7.8, presentacion: "sobres 24 u", iva: 4 },
    { nombre: "Buscapina Compositum", pa: "Butilescopolamina + Metamizol", marca: "Buscapina", cat: "Digestivo", receta: true, precio: 6.5, presentacion: "comprimidos 20 u", iva: 4 },
    { nombre: "Daflon 500", pa: "Diosmina + Hesperidina", marca: "Daflon", cat: "Cardiovascular", receta: true, precio: 14.9, presentacion: "comprimidos 30 u", iva: 4 },
    { nombre: "Venoruton", pa: "Oxerutina", marca: "Venoruton", cat: "Cardiovascular", receta: false, precio: 12.5, presentacion: "comprimidos 30 u", iva: 4 },
    { nombre: "Hirudoid Forte", pa: "Polisulfato de mucopolisacárido", marca: "Hirudoid", cat: "Dermatología", receta: false, precio: 9.8, presentacion: "gel 50 g", iva: 4 },
    { nombre: "Canesten", pa: "Clotrimazol", marca: "Canesten", cat: "Dermatología", receta: false, precio: 8.5, presentacion: "crema 30 g", iva: 4 },
    { nombre: "GineCanesdin", pa: "Clotrimazol", marca: "Canesdin", cat: "Ginecología", receta: false, precio: 10.9, presentacion: "crema 20 g", iva: 4 },
    { nombre: "Xyzall", pa: "Levocetirizina", marca: "Xyzall", cat: "Alergia", receta: true, precio: 7.2, presentacion: "comprimidos 20 u", iva: 4 },
    { nombre: "Singulair 10 mg", pa: "Montelukast", marca: "Singulair", cat: "Respiratorio", receta: true, precio: 18.5, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Spiriva HandiHaler", pa: "Tiotropio", marca: "Spiriva", cat: "Respiratorio", receta: true, precio: 42.0, presentacion: "inhalador 30 cáps", iva: 4 },
    { nombre: "Eutirox 50 mcg", pa: "Levotiroxina", marca: "Eutirox", cat: "Medicamentos con receta", receta: true, precio: 3.5, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Eutirox 75 mcg", pa: "Levotiroxina", marca: "Eutirox", cat: "Medicamentos con receta", receta: true, precio: 3.8, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Eutirox 100 mcg", pa: "Levotiroxina", marca: "Eutirox", cat: "Medicamentos con receta", receta: true, precio: 4.1, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Orfidal 1 mg", pa: "Lorazepam", marca: "Orfidal", cat: "Sistema nervioso", receta: true, precio: 2.9, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Trankimazin 0.5 mg", pa: "Alprazolam", marca: "Trankimazin", cat: "Sistema nervioso", receta: true, precio: 3.2, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Trankimazin 1 mg", pa: "Alprazolam", marca: "Trankimazin", cat: "Sistema nervioso", receta: true, precio: 3.6, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Stilnox 10 mg", pa: "Zolpidem", marca: "Stilnox", cat: "Sistema nervioso", receta: true, precio: 4.5, presentacion: "comprimidos 28 u", iva: 4, controlado: true },
    { nombre: "Adolonta 50 mg", pa: "Tramadol", marca: "Adolonta", cat: "Analgésicos y antiinflamatorios", receta: true, precio: 3.8, presentacion: "cápsulas 20 u", iva: 4, controlado: true },
    { nombre: "Durogesic Matrix 25", pa: "Fentanilo", marca: "Durogesic", cat: "Analgésicos y antiinflamatorios", receta: true, precio: 28.0, presentacion: "parches 5 u", iva: 4, controlado: true },
    { nombre: "Rivotril 0.5 mg", pa: "Clonazepam", marca: "Rivotril", cat: "Sistema nervioso", receta: true, precio: 3.1, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Concerta 18 mg", pa: "Metilfenidato", marca: "Concerta", cat: "Sistema nervioso", receta: true, precio: 32.0, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Rubifen 10 mg", pa: "Metilfenidato", marca: "Rubifen", cat: "Sistema nervioso", receta: true, precio: 8.5, presentacion: "comprimidos 30 u", iva: 4, controlado: true },
    { nombre: "Eliquis 5 mg", pa: "Apixabán", marca: "Eliquis", cat: "Cardiovascular", receta: true, precio: 85.0, presentacion: "comprimidos 60 u", iva: 4 },
    { nombre: "Xarelto 20 mg", pa: "Rivaroxabán", marca: "Xarelto", cat: "Cardiovascular", receta: true, precio: 78.0, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Lantus SoloStar", pa: "Insulina glargina", marca: "Lantus", cat: "Diabetes", receta: true, precio: 48.0, presentacion: "pluma 3 ml", iva: 4 },
    { nombre: "NovoRapid FlexPen", pa: "Insulina aspart", marca: "NovoRapid", cat: "Diabetes", receta: true, precio: 42.0, presentacion: "pluma 3 ml", iva: 4 },
    { nombre: "Jardiance 10 mg", pa: "Empagliflozina", marca: "Jardiance", cat: "Diabetes", receta: true, precio: 55.0, presentacion: "comprimidos 30 u", iva: 4 },
    { nombre: "Januvia 100 mg", pa: "Sitagliptina", marca: "Januvia", cat: "Diabetes", receta: true, precio: 48.5, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "Ozempic 0.25/0.5 mg", pa: "Semaglutida", marca: "Ozempic", cat: "Diabetes", receta: true, precio: 120.0, presentacion: "pluma 1.5 ml", iva: 4 },
    { nombre: "Roaccutane 20 mg", pa: "Isotretinoína", marca: "Roaccutane", cat: "Dermatología", receta: true, precio: 28.0, presentacion: "cápsulas 30 u", iva: 4 },
    { nombre: "Diane 35", pa: "Ciproterona + Etinilestradiol", marca: "Diane", cat: "Ginecología", receta: true, precio: 9.5, presentacion: "comprimidos 21 u", iva: 4 },
    { nombre: "Yasmin", pa: "Drospirenona + Etinilestradiol", marca: "Yasmin", cat: "Ginecología", receta: true, precio: 12.9, presentacion: "comprimidos 21 u", iva: 4 },
    { nombre: "Cerazette", pa: "Desogestrel", marca: "Cerazette", cat: "Ginecología", receta: true, precio: 11.5, presentacion: "comprimidos 28 u", iva: 4 },
    { nombre: "NuvaRing", pa: "Etonogestrel + Etinilestradiol", marca: "NuvaRing", cat: "Ginecología", receta: true, precio: 18.9, presentacion: "anillo 1 u", iva: 4 },
  ];

  function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function precioBase(principio, dosis, pack, rng) {
    let base = principio.receta ? 4 + rng() * 40 : 2.5 + rng() * 12;
    if (principio.controlado) base *= 1.3;
    if (String(dosis).includes("mg") && parseInt(dosis, 10) >= 500) base *= 1.15;
    if (pack >= 60) base *= 1.4;
    else if (pack >= 30) base *= 1.15;
    return Math.round(base * 100) / 100;
  }

  function ivaParaCategoria(cat, esMedicamento) {
    if (esMedicamento) return 4;
    if (cat === "Nutrición" || cat === "Bebé y maternidad") return 10;
    return 21;
  }

  function generarCatalogo() {
    const productos = [];
    let id = 1;
    const rng = mulberry32(20260813);

    // 1) Medicamentos genéricos / marcas por principio activo
    for (const principio of PRINCIPIOS) {
      const marcasNom = MARCAS_COMERCIALES[principio.nombre] || [principio.nombre];
      const labs = principio.receta
        ? MARCAS_FARMA
        : MARCAS_FARMA.slice(0, 18);
      const presentaciones = principio.controlado
        ? PRESENTACIONES_FARMA.filter((p) => ["comprimidos", "cápsulas", "parche", "inyectable"].includes(p.tipo))
        : PRESENTACIONES_FARMA;

      const variantes = 8 + Math.floor(rng() * 10); // 8–17 por principio
      for (let v = 0; v < variantes; v++) {
        const presentacion = pick(rng, presentaciones);
        const dosis = pick(rng, presentacion.dosis);
        const pack = pick(rng, presentacion.packs);
        const lab = pick(rng, labs);
        const marcaComercial = pick(rng, marcasNom);
        const cat = pick(rng, principio.cats);
        const esGenérico = marcaComercial === principio.nombre || rng() > 0.45;
        const nombre = esGenérico
          ? `${principio.nombre} ${lab} ${dosis} ${presentacion.tipo} ${pack > 1 ? pack + " u" : ""}`.trim()
          : `${marcaComercial} ${dosis} ${presentacion.tipo}${pack > 1 ? " " + pack + " u" : ""}`;

        const precio = precioBase(principio, dosis, pack, rng);
        productos.push({
          id: id++,
          sku: `MED-${String(id).padStart(5, "0")}`,
          ean: String(8400000000000 + id),
          nombre,
          marca: esGenérico ? lab : marcaComercial,
          laboratorio: lab,
          principioActivo: principio.nombre,
          categoria: cat,
          subcategoria: presentacion.tipo,
          requiereReceta: principio.receta,
          controlado: !!principio.controlado,
          presentacion: `${presentacion.tipo} ${dosis}${pack > 1 ? " × " + pack : ""}`,
          dosis,
          unidadesEnvase: pack,
          precio,
          iva: 4,
          stock: 20 + Math.floor(rng() * 180),
          stockInicial: 0,
        });
      }
    }

    // 2) Especialidades comerciales fijas
    for (const esp of MARCAS_COMERCIALES_EXTRA) {
      productos.push({
        id: id++,
        sku: `ESP-${String(id).padStart(5, "0")}`,
        ean: String(8400000000000 + id),
        nombre: esp.nombre + (esp.presentacion ? " — " + esp.presentacion : ""),
        marca: esp.marca,
        laboratorio: esp.marca,
        principioActivo: esp.pa,
        categoria: esp.cat,
        subcategoria: "Especialidad",
        requiereReceta: !!esp.receta,
        controlado: !!esp.controlado,
        presentacion: esp.presentacion,
        dosis: "",
        unidadesEnvase: 1,
        precio: esp.precio,
        iva: esp.iva ?? 4,
        stock: 15 + Math.floor(rng() * 80),
        stockInicial: 0,
      });
    }

    // 3) Parafarmacia / líneas de marca
    for (const linea of PARA_LINEAS) {
      for (const tam of linea.tamanos) {
        for (let p = 0; p < linea.precios.length; p++) {
          // Evitar explosión: 1 precio por tamaño, rotando
          if (p > 0 && linea.tamanos.length > 1 && p !== (linea.tamanos.indexOf(tam) % linea.precios.length)) {
            continue;
          }
          const precio = linea.precios[Math.min(p, linea.precios.length - 1)] + (rng() * 0.4 - 0.2);
          const precioR = Math.round(Math.max(0.5, precio) * 100) / 100;
          productos.push({
            id: id++,
            sku: `PAR-${String(id).padStart(5, "0")}`,
            ean: String(8410000000000 + id),
            nombre: `${linea.marca} ${linea.linea} ${tam}`,
            marca: linea.marca,
            laboratorio: linea.marca,
            principioActivo: "—",
            categoria: linea.cat,
            subcategoria: linea.sub,
            requiereReceta: false,
            controlado: false,
            presentacion: tam,
            dosis: tam,
            unidadesEnvase: 1,
            precio: precioR,
            iva: ivaParaCategoria(linea.cat, false),
            stock: 10 + Math.floor(rng() * 120),
            stockInicial: 0,
          });
        }
      }
    }

    // 4) Expansión masiva para alcanzar miles: variantes de sabor/formato/lote lógico
    const sabores = ["", "sabor naranja", "sabor limón", "sabor fresa", "sabor menta", "sin azúcar"];
    const extras = ["", "EFG", "Forte", "Plus", "Retard", "Instant", "Junior", "Adultos"];
    const baseMeds = productos.filter((p) => p.sku.startsWith("MED-")).slice(0, 400);
    const target = 4500;
    let extraIdx = 0;
    while (productos.length < target && extraIdx < 20000) {
      const base = baseMeds[extraIdx % baseMeds.length];
      const rng2 = mulberry32(hashSeed(base.sku + ":" + extraIdx));
      const sabor = pick(rng2, sabores);
      const extra = pick(rng2, extras);
      const lab = pick(rng2, MARCAS_FARMA);
      const packMult = pick(rng2, [1, 1, 1, 2]);
      const unidades = base.unidadesEnvase * packMult;
      const nombre = [
        base.principioActivo,
        lab,
        extra,
        base.dosis,
        base.subcategoria,
        unidades > 1 ? unidades + " u" : "",
        sabor,
      ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

      // Evitar duplicados exactos de nombre
      const precio = Math.round(base.precio * (0.85 + rng2() * 0.5) * packMult * 100) / 100;
      productos.push({
        id: id++,
        sku: `MED-${String(id).padStart(5, "0")}`,
        ean: String(8400000000000 + id),
        nombre,
        marca: lab,
        laboratorio: lab,
        principioActivo: base.principioActivo,
        categoria: base.categoria,
        subcategoria: base.subcategoria,
        requiereReceta: base.requiereReceta,
        controlado: base.controlado,
        presentacion: `${base.subcategoria} ${base.dosis}${unidades > 1 ? " × " + unidades : ""}`,
        dosis: base.dosis,
        unidadesEnvase: unidades,
        precio,
        iva: 4,
        stock: 5 + Math.floor(rng2() * 200),
        stockInicial: 0,
      });
      extraIdx++;
    }

    // Más parafarmacia expandida
    const fragancias = ["", "perfume suave", "sin perfume", "piel sensible", "FPS 30", "FPS 50", "textura ligera"];
    const basePara = productos.filter((p) => p.sku.startsWith("PAR-"));
    let pIdx = 0;
    while (productos.length < 5500 && pIdx < 5000) {
      const base = basePara[pIdx % basePara.length];
      const rng2 = mulberry32(hashSeed(base.sku + "-p-" + pIdx));
      const frag = pick(rng2, fragancias);
      if (!frag && pIdx > basePara.length) {
        pIdx++;
        continue;
      }
      const nombre = frag ? `${base.nombre} (${frag})` : `${base.nombre} ed. ${1 + (pIdx % 5)}`;
      productos.push({
        ...base,
        id: id++,
        sku: `PAR-${String(id).padStart(5, "0")}`,
        ean: String(8410000000000 + id),
        nombre,
        precio: Math.round(base.precio * (0.95 + rng2() * 0.15) * 100) / 100,
        stock: 5 + Math.floor(rng2() * 100),
        stockInicial: 0,
      });
      pIdx++;
    }

    for (const p of productos) {
      p.stockInicial = p.stock;
    }

    return {
      productos,
      categorias: CATEGORIAS,
      marcasFarma: MARCAS_FARMA,
      marcasPara: MARCAS_PARA,
      generadoEn: new Date().toISOString(),
      total: productos.length,
    };
  }

  let cache = null;
  function getCatalogo() {
    if (!cache) cache = generarCatalogo();
    return cache;
  }

  global.FarmaciaCatalogo = {
    getCatalogo,
    CATEGORIAS,
    generarCatalogo,
  };
})(typeof window !== "undefined" ? window : globalThis);
