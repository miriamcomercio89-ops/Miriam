/**
 * Generador de catálogo industrial realista (español, época actual).
 * Ejecutar: node tools/generate-data.js
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'js', 'data');

function idify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

const items = [];
const recipes = [];
const itemIndex = new Map();

function addItem(def) {
  const id = def.id || idify(def.name);
  if (itemIndex.has(id)) return itemIndex.get(id);
  const item = {
    id,
    name: def.name,
    category: def.category,
    tier: def.tier || 1,
    unit: def.unit || 't',
    basePrice: def.basePrice,
    qualityRelevant: def.qualityRelevant !== false,
    isWaste: !!def.isWaste,
    isEnergy: !!def.isEnergy,
    description: def.description || `${def.name} — recurso industrial contemporáneo.`,
  };
  items.push(item);
  itemIndex.set(id, item);
  return item;
}

function addRecipe(def) {
  const id = def.id || idify(`rec_${def.name || def.outputs[0].item}`);
  recipes.push({
    id,
    name: def.name,
    building: def.building,
    machine: def.machine,
    inputs: def.inputs,
    outputs: def.outputs,
    byproducts: def.byproducts || [],
    energyKwh: def.energyKwh || 10,
    waterM3: def.waterM3 || 0,
    timeMinutes: def.timeMinutes || 60,
    pollution: def.pollution || 1,
    tech: def.tech || null,
    qualityBase: def.qualityBase || 50,
  });
}

// ——— Materias primas base (minerales) ———
const minerals = [
  ['Hierro', 45], ['Cobre', 8200], ['Bauxita', 55], ['Carbón', 120], ['Caliza', 18],
  ['Cuarcita', 25], ['Yeso', 22], ['Sal gema', 40], ['Fosfato', 95], ['Potasa', 280],
  ['Azufre', 110], ['Níquel', 16000], ['Cinc', 2400], ['Plomo', 1900], ['Estaño', 25000],
  ['Manganeso', 1400], ['Cromo', 2200], ['Titanio', 8500], ['Wolframio', 32000], ['Molibdeno', 45000],
  ['Litio', 18000], ['Cobalto', 32000], ['Grafito', 900], ['Caolín', 85], ['Feldespato', 70],
  ['Arena sílice', 30], ['Arcilla', 20], ['Mármol', 180], ['Granito', 95], ['Pizarra', 60],
  ['Barita', 140], ['Fluorita', 320], ['Magnesita', 210], ['Olivino', 160], ['Bentonita', 110],
  ['Tierras raras concentrado', 55000], ['Uranio natural', 90000], ['Plata mena', 12000],
  ['Oro mena', 45000], ['Platino mena', 80000], ['Diamante industrial', 120000],
  ['Turba', 35], ['Lignito', 55], ['Antracita', 160], ['Petróleo crudo', 480], ['Gas natural', 0.35],
];

minerals.forEach(([name, price], i) => {
  addItem({
    name: `Mena de ${name}`.replace('Mena de Petróleo crudo', 'Petróleo crudo').replace('Mena de Gas natural', 'Gas natural').replace('Mena de Carbón', 'Carbón mineral').replace('Mena de Arena sílice', 'Arena de sílice').replace('Mena de Arcilla', 'Arcilla industrial').replace('Mena de Turba', 'Turba').replace('Mena de Lignito', 'Lignito').replace('Mena de Antracita', 'Antracita').replace('Mena de Tierras raras concentrado', 'Concentrado de tierras raras').replace('Mena de Uranio natural', 'Uranio natural').replace('Mena de Diamante industrial', 'Diamante industrial'),
    category: 'minerales',
    tier: 1,
    unit: name.includes('Gas') ? 'm³' : 't',
    basePrice: price,
    description: `Materia prima mineral extraída: ${name}.`,
  });
});

// Fix names that got mangled - rebuild mineral items cleanly
items.length = 0;
itemIndex.clear();

const mineralDefs = [
  { name: 'Carbón mineral', price: 120 },
  { name: 'Lignito', price: 55 },
  { name: 'Antracita', price: 160 },
  { name: 'Turba', price: 35 },
  { name: 'Petróleo crudo', price: 480, unit: 't' },
  { name: 'Gas natural', price: 0.35, unit: 'm³' },
  { name: 'Mena de hierro', price: 45 },
  { name: 'Mena de cobre', price: 8200 },
  { name: 'Bauxita', price: 55 },
  { name: 'Caliza', price: 18 },
  { name: 'Cuarcita', price: 25 },
  { name: 'Yeso', price: 22 },
  { name: 'Sal gema', price: 40 },
  { name: 'Fosfato natural', price: 95 },
  { name: 'Potasa', price: 280 },
  { name: 'Azufre elemental', price: 110 },
  { name: 'Mena de níquel', price: 16000 },
  { name: 'Mena de cinc', price: 2400 },
  { name: 'Mena de plomo', price: 1900 },
  { name: 'Mena de estaño', price: 25000 },
  { name: 'Mena de manganeso', price: 1400 },
  { name: 'Mena de cromo', price: 2200 },
  { name: 'Mena de titanio', price: 8500 },
  { name: 'Mena de wolframio', price: 32000 },
  { name: 'Mena de molibdeno', price: 45000 },
  { name: 'Espodumeno (litio)', price: 18000 },
  { name: 'Mena de cobalto', price: 32000 },
  { name: 'Grafito natural', price: 900 },
  { name: 'Caolín', price: 85 },
  { name: 'Feldespato', price: 70 },
  { name: 'Arena de sílice', price: 30 },
  { name: 'Arcilla industrial', price: 20 },
  { name: 'Mármol en bruto', price: 180 },
  { name: 'Granito en bruto', price: 95 },
  { name: 'Pizarra en bruto', price: 60 },
  { name: 'Barita', price: 140 },
  { name: 'Fluorita', price: 320 },
  { name: 'Magnesita', price: 210 },
  { name: 'Olivino', price: 160 },
  { name: 'Bentonita', price: 110 },
  { name: 'Concentrado de tierras raras', price: 55000 },
  { name: 'Uranio natural', price: 90000 },
  { name: 'Mena de plata', price: 12000 },
  { name: 'Mena de oro', price: 45000 },
  { name: 'Mena de platino', price: 80000 },
  { name: 'Diamante industrial', price: 120000 },
  { name: 'Dolomita', price: 28 },
  { name: 'Basalto', price: 22 },
  { name: 'Pómez', price: 45 },
  { name: 'Perlita', price: 95 },
  { name: 'Vermiculita', price: 180 },
  { name: 'Talco industrial', price: 220 },
  { name: 'Mica', price: 350 },
  { name: 'Cuarzo industrial', price: 80 },
  { name: 'Arena de fundición', price: 55 },
  { name: 'Grava', price: 12 },
  { name: 'Arena de construcción', price: 15 },
];

mineralDefs.forEach((m) => addItem({
  name: m.name, category: 'minerales', tier: 1, unit: m.unit || 't', basePrice: m.price,
}));

// Agrícolas
const crops = [
  ['Trigo', 220], ['Maíz', 195], ['Cebada', 180], ['Arroz', 310], ['Avena', 170],
  ['Soja', 420], ['Girasol', 380], ['Colza', 400], ['Algodón', 1450], ['Caña de azúcar', 55],
  ['Remolacha azucarera', 48], ['Patata', 180], ['Tomate industrial', 210], ['Oliva', 890],
  ['Uva vinífera', 650], ['Naranja', 320], ['Manzana industrial', 280], ['Café verde', 3200],
  ['Cacao en grano', 2800], ['Té hoja', 2100], ['Tabaco hoja', 4500], ['Lino fibra', 980],
  ['Cáñamo industrial', 720], ['Yute', 650], ['Sisal', 580], ['Caucho natural látex', 1600],
  ['Madera de pino', 95], ['Madera de eucalipto', 85], ['Madera de roble', 280],
  ['Madera tropical', 450], ['Corcho', 1200], ['Resina natural', 890], ['Lana', 4200],
  ['Algodón orgánico', 2100], ['Leche cruda', 0.42, 'l'], ['Huevos industriales', 1.8, 'ud'],
  ['Carne de vacuno', 5200], ['Carne de cerdo', 2800], ['Carne de ave', 2100],
  ['Pescado industrial', 3200], ['Algas industriales', 680], ['Levadura industrial', 2400],
];

crops.forEach(([name, price, unit]) => addItem({
  name, category: 'agricolas', tier: 1, unit: unit || 't', basePrice: price,
}));

// Energéticos / utilities
[
  ['Electricidad', 0.12, 'kWh', true],
  ['Agua industrial', 1.8, 'm³', false],
  ['Agua ultrapura', 12, 'm³', false],
  ['Vapor industrial', 25, 't', false],
  ['Hidrógeno', 4.5, 'kg', false],
  ['Oxígeno industrial', 0.8, 'm³', false],
  ['Nitrógeno industrial', 0.4, 'm³', false],
  ['Argón industrial', 2.2, 'm³', false],
  ['CO₂ industrial', 0.15, 'kg', false],
  ['Gasolina', 1.55, 'l', false],
  ['Diésel', 1.48, 'l', false],
  ['Fuelóleo', 0.65, 'l', false],
  ['Queroseno', 1.2, 'l', false],
  ['GPL', 0.85, 'l', false],
  ['Biomasa pellets', 180, 't', false],
  ['Biogás', 0.55, 'm³', false],
  ['Etanol combustible', 1.1, 'l', false],
  ['Biodiésel', 1.25, 'l', false],
].forEach(([name, price, unit, isEnergy]) => addItem({
  name, category: 'energia', tier: 1, unit, basePrice: price, isEnergy, qualityRelevant: false,
}));

// Residuos
[
  ['Escoria metalúrgica', 5], ['Polvo de alto horno', 8], ['Lodos industriales', 3],
  ['Aguas residuales', 0.05], ['CO₂ emitido', 0], ['SO₂ emitido', 0],
  ['NOx emitido', 0], ['Residuo plástico mixto', 40], ['Chatarra férrea', 280],
  ['Chatarra de cobre', 6500], ['Chatarra de aluminio', 1400], ['Papel recuperado', 95],
  ['Vidrio recuperado', 45], ['Aceite usado', 120], ['Baterías usadas', 800],
  ['Residuo electrónico', 350], ['Cenizas volantes', 25], ['Yeso de desulfuración', 15],
  ['Lodos de depuradora', 10], ['Residuo textil', 60], ['Compost industrial', 35],
].forEach(([name, price]) => addItem({
  name, category: 'residuos', tier: 1, unit: name.includes('emitido') || name.includes('Aguas') ? (name.includes('Aguas') ? 'm³' : 'kg') : 't',
  basePrice: price, isWaste: true, qualityRelevant: false,
}));

// Metal processing stages
const metalChains = [
  { ore: 'Mena de hierro', concentrate: 'Concentrado de hierro', sinter: 'Sínter de hierro', pig: 'Arrabio', metal: 'Acero líquido', product: 'Acero laminado', billet: 'Palanquilla de acero', sheet: 'Chapa de acero', coil: 'Bobina de acero', wire: 'Alambre de acero', tube: 'Tubo de acero', prices: [55, 70, 320, 480, 620, 700, 780, 850, 920, 1100] },
  { ore: 'Mena de cobre', concentrate: 'Concentrado de cobre', sinter: 'Mata de cobre', pig: 'Cobre blíster', metal: 'Cobre ánodo', product: 'Cobre electrolítico', billet: 'Lingote de cobre', sheet: 'Chapa de cobre', coil: 'Bobina de cobre', wire: 'Hilo de cobre', tube: 'Tubo de cobre', prices: [9000, 11000, 12000, 13000, 14500, 15000, 15500, 16000, 17000, 18000] },
  { ore: 'Bauxita', concentrate: 'Alúmina', sinter: 'Alúmina calcinada', pig: 'Aluminio primario', metal: 'Aluminio líquido', product: 'Aluminio puro', billet: 'Tocho de aluminio', sheet: 'Chapa de aluminio', coil: 'Bobina de aluminio', wire: 'Alambre de aluminio', tube: 'Extrusión de aluminio', prices: [380, 420, 2100, 2300, 2400, 2500, 2700, 2900, 3100, 3400] },
  { ore: 'Mena de cinc', concentrate: 'Concentrado de cinc', sinter: 'Calcinado de cinc', pig: 'Cinc imperial', metal: 'Cinc refinado', product: 'Cinc SHG', billet: 'Lingote de cinc', sheet: 'Chapa de cinc', coil: 'Bobina de cinc', wire: 'Alambre de cinc', tube: 'Perfil de cinc', prices: [2600, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3600, 3800] },
  { ore: 'Mena de níquel', concentrate: 'Concentrado de níquel', sinter: 'Mata de níquel', pig: 'Ferroníquel', metal: 'Níquel cátodo', product: 'Níquel puro', billet: 'Lingote de níquel', sheet: 'Chapa de níquel', coil: 'Bobina de níquel', wire: 'Alambre de níquel', tube: 'Tubo de níquel', prices: [18000, 20000, 21000, 22000, 24000, 25000, 26000, 28000, 30000, 32000] },
  { ore: 'Mena de plomo', concentrate: 'Concentrado de plomo', sinter: 'Sínter de plomo', pig: 'Plomo de obra', metal: 'Plomo refinado', product: 'Plomo puro', billet: 'Lingote de plomo', sheet: 'Chapa de plomo', coil: 'Bobina de plomo', wire: 'Alambre de plomo', tube: 'Tubo de plomo', prices: [2000, 2100, 2150, 2200, 2300, 2400, 2500, 2600, 2800, 3000] },
  { ore: 'Mena de estaño', concentrate: 'Concentrado de estaño', sinter: 'Óxido de estaño', pig: 'Estaño crudo', metal: 'Estaño refinado', product: 'Estaño puro', billet: 'Lingote de estaño', sheet: 'Hoja de estaño', coil: 'Bobina de estaño', wire: 'Soldadura de estaño', tube: 'Perfil de estaño', prices: [26000, 27000, 27500, 28000, 29000, 30000, 31000, 32000, 34000, 36000] },
  { ore: 'Mena de titanio', concentrate: 'Ilmenita concentrada', sinter: 'Escoria de titanio', pig: 'Esponja de titanio', metal: 'Titanio lingote', product: 'Titanio puro', billet: 'Tocho de titanio', sheet: 'Chapa de titanio', coil: 'Bobina de titanio', wire: 'Alambre de titanio', tube: 'Tubo de titanio', prices: [9000, 12000, 18000, 22000, 25000, 28000, 32000, 38000, 42000, 48000] },
  { ore: 'Mena de cromo', concentrate: 'Concentrado de cromo', sinter: 'Ferrocromo', pig: 'Cromo metal', metal: 'Cromo refinado', product: 'Cromo puro', billet: 'Lingote de cromo', sheet: 'Chapa de cromo', coil: 'Bobina de cromo', wire: 'Alambre de cromo', tube: 'Perfil de cromo', prices: [2400, 3200, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000] },
  { ore: 'Mena de manganeso', concentrate: 'Concentrado de manganeso', sinter: 'Ferromanganeso', pig: 'Manganeso metal', metal: 'Manganeso refinado', product: 'Manganeso puro', billet: 'Lingote de manganeso', sheet: 'Chapa de manganeso', coil: 'Bobina de manganeso', wire: 'Alambre de manganeso', tube: 'Perfil de manganeso', prices: [1500, 1800, 2200, 2800, 3200, 3600, 4000, 4500, 5000, 5500] },
];

const stages = ['concentrate', 'sinter', 'pig', 'metal', 'product', 'billet', 'sheet', 'coil', 'wire', 'tube'];
metalChains.forEach((chain) => {
  stages.forEach((st, i) => {
    addItem({
      name: chain[st],
      category: 'metales',
      tier: i + 2,
      unit: 't',
      basePrice: chain.prices[i],
    });
  });
});

// Steel grades / alloys (depth)
const steelGrades = [
  'Acero dulce', 'Acero al carbono C45', 'Acero aleado 42CrMo4', 'Acero inoxidable 304',
  'Acero inoxidable 316', 'Acero para herramientas', 'Acero para muelles', 'Acero naval',
  'Acero para raíles', 'Acero para envases', 'Acero electrical', 'Acero AHSS',
  'Acero galvanizado', 'Acero electrocincado', 'Acero pintado coil', 'Acero corten',
  'Fundición gris', 'Fundición nodular', 'Acero para rodamientos', 'Acero para engranajes',
];
steelGrades.forEach((name, i) => addItem({
  name, category: 'metales', tier: 4, unit: 't', basePrice: 800 + i * 120,
}));

const alloyExtras = [
  ['Latón', 5200], ['Bronce', 6800], ['Alpaca', 7200], ['Invar', 14000],
  ['Hastelloy', 45000], ['Inconel', 52000], ['Monel', 28000], ['Zamak', 3200],
  ['Duraluminio', 3800], ['Aluminio aeronáutico', 6200], ['Magnesio metal', 3500],
  ['Silicio metalúrgico', 2100], ['Silicio solar', 12000], ['Silicio electrónico', 45000],
  ['Litio metal', 28000], ['Cobalto metal', 35000], ['Wolframio metal', 48000],
  ['Molibdeno metal', 52000], ['Vanadio metal', 38000], ['Niobio metal', 60000],
  ['Tántalo metal', 180000], ['Oro 24k', 65000000], ['Plata fina', 780000],
  ['Platino refinado', 32000000], ['Paladio', 38000000],
];
alloyExtras.forEach(([name, price]) => addItem({
  name, category: 'metales', tier: 5, unit: name.includes('Oro') || name.includes('Plata') || name.includes('Platino') || name.includes('Paladio') ? 'kg' : 't',
  basePrice: price,
}));

// Chemicals - large set
const basicChems = [
  ['Ácido sulfúrico', 120], ['Ácido clorhídrico', 95], ['Ácido nítrico', 280],
  ['Ácido acético', 650], ['Ácido fosfórico', 420], ['Sosa cáustica', 380],
  ['Carbonato sódico', 210], ['Bicarbonato sódico', 320], ['Amoníaco', 450],
  ['Urea', 380], ['Nitrato amónico', 320], ['Cloro', 280], ['Hipoclorito sódico', 180],
  ['Peróxido de hidrógeno', 520], ['Metanol', 290], ['Etanol industrial', 780],
  ['Acetona', 950], ['Tolueno', 880], ['Benceno', 920], ['Xileno', 900],
  ['Etileno', 1100], ['Propileno', 1050], ['Butadieno', 1400], ['Estireno', 1350],
  ['Cloruro de vinilo', 980], ['Óxido de etileno', 1600], ['Formaldehído', 420],
  ['Fenol', 1250], ['Anilina', 1800], ['Ácido tereftálico', 980],
  ['Monoetilenglicol', 720], ['Glicerina', 650], ['Ácido cítrico', 1100],
  ['Sulfato de cobre', 1800], ['Sulfato de aluminio', 280], ['Cloruro férrico', 320],
  ['Catalizador FCC', 8500], ['Zeolita industrial', 2200], ['Carbón activado', 1800],
  ['Negro de humo', 1400], ['Dióxido de titanio', 2800], ['Óxido de cinc', 2100],
  ['Carbonato cálcico precipitado', 320], ['Sílices precipitada', 1100],
  ['Poliol', 1600], ['Isocianato MDI', 2400], ['Isocianato TDI', 2200],
  ['PVC resina', 980], ['PEAD granza', 1200], ['PEBD granza', 1150],
  ['PP granza', 1180], ['PS granza', 1300], ['ABS granza', 1850],
  ['PET granza', 1250], ['PA6 granza', 2400], ['PA66 granza', 2800],
  ['PC granza', 3200], ['PMMA granza', 2600], ['PTFE polvo', 18000],
  ['Caucho SBR', 1600], ['Caucho NBR', 2200], ['Caucho EPDM', 2100],
  ['Silicona HTV', 4500], ['Adhesivo epoxi', 3800], ['Resina poliéster', 1600],
  ['Resina epoxi', 3200], ['Poliuretano sistema', 2800], ['Pintura industrial', 2100],
  ['Barniz industrial', 2400], ['Tinta de impresión', 3200], ['Disolvente mixto', 890],
  ['Lubricante industrial', 1800], ['Grasa industrial', 2200], ['Anticongelante', 950],
  ['Detergente industrial', 780], ['Surfactante', 1400], ['Espesante industrial', 1600],
];

basicChems.forEach(([name, price]) => addItem({
  name, category: 'quimicos', tier: 2, unit: 't', basePrice: price,
}));

// Pharma precursors & products
const pharma = [
  ['Paracetamol API', 18000], ['Ibuprofeno API', 22000], ['Amoxicilina API', 45000],
  ['Insulina a granel', 120000], ['Vacuna a granel', 250000], ['Vitamina C', 8000],
  ['Vitamina D', 35000], ['Aspirina API', 12000], ['Omeprazol API', 28000],
  ['Metformina API', 9000], ['Excipiente MCC', 3200], ['Excipiente lactosa', 1800],
  ['Comprimido genérico', 0.05, 'ud'], ['Jarabe farmacéutico', 2.5, 'l'],
  ['Inyectable farmacéutico', 8, 'ud'], ['Crema dermatológica', 12, 'kg'],
];
pharma.forEach(([name, price, unit]) => addItem({
  name, category: 'farmaceuticos', tier: 5, unit: unit || 'kg', basePrice: price,
}));

// Construction materials
const construction = [
  ['Clínker', 55], ['Cemento Portland', 95], ['Cemento blanco', 180],
  ['Hormigón fresco', 75], ['Mortero seco', 120], ['Yeso de construcción', 85],
  ['Pladur / cartón-yeso', 180], ['Ladrillo cerámico', 0.35, 'ud'],
  ['Bloque de hormigón', 1.2, 'ud'], ['Teja cerámica', 0.8, 'ud'],
  ['Baldosa cerámica', 8, 'm²'], ['Gres porcelánico', 18, 'm²'],
  ['Vidrio float', 320], ['Vidrio templado', 680], ['Vidrio laminado', 890],
  ['Aislante lana de roca', 420], ['Aislante XPS', 380], ['Aislante PUR', 450],
  ['Impermeabilizante', 1200], ['Asfalto', 380], ['Betún', 420],
  ['Árido 0-4', 18], ['Árido 4-12', 20], ['Árido 12-20', 22],
  ['Prefabricado de hormigón', 180], ['Viga de acero', 950],
  ['Perfil IPN', 920], ['Perfil HEB', 980], ['Malla electrosoldada', 780],
  ['Varilla corrugada', 720], ['Panel sándwich', 45, 'm²'],
];
construction.forEach(([name, price, unit]) => addItem({
  name, category: 'construccion', tier: 3, unit: unit || 't', basePrice: price,
}));

// Textiles
const textiles = [
  ['Hilo de algodón', 3200], ['Hilo de poliéster', 2100], ['Hilo de nylon', 2800],
  ['Tejido de algodón', 8, 'm²'], ['Tejido denim', 12, 'm²'], ['Tejido técnico', 25, 'm²'],
  ['No tejido', 4, 'm²'], ['Fieltro industrial', 6, 'm²'], ['Cuerda industrial', 2800],
  ['Cinta transportadora', 45, 'm'], ['Filtro textil', 18, 'ud'], ['Prenda básica', 6, 'ud'],
  ['Uniforme laboral', 18, 'ud'], ['EPI textil', 12, 'ud'],
];
textiles.forEach(([name, price, unit]) => addItem({
  name, category: 'textiles', tier: 3, unit: unit || 't', basePrice: price,
}));

// Electronics components - generate many SKUs
const electronicBases = [
  'Resistencia', 'Condensador cerámico', 'Condensador electrolítico', 'Inductor',
  'Diodo', 'LED', 'Transistor BJT', 'MOSFET', 'IGBT', 'Tiristor',
  'Op-amp', 'Microcontrolador', 'FPGA', 'Memoria DRAM', 'Memoria NAND',
  'Sensor de temperatura', 'Sensor de presión', 'Acelerómetro', 'Gyro',
  'Conector USB', 'Conector RJ45', 'PCB desnuda', 'PCB ensamblada',
  'Fuente switching', 'Transformador', 'Relé', 'Contactor', 'PLC módulo',
  'Pantalla LCD', 'Pantalla OLED', 'Cámara módulo', 'Antena RF',
  'Batería Li-ion celda', 'BMS', 'Cargador', 'Cable de datos',
];
const grades = ['comercial', 'industrial', 'automoción', 'militar', 'espacial'];
const sizes = ['0402', '0603', '0805', '1206', 'SOT-23', 'TO-220', 'QFN', 'BGA'];

electronicBases.forEach((base, bi) => {
  grades.forEach((g, gi) => {
    const name = `${base} ${g}`;
    addItem({
      name,
      category: 'electronica',
      tier: 4 + gi,
      unit: 'ud',
      basePrice: Math.round((0.05 + bi * 0.8 + gi * 2.5) * 100) / 100 * (gi === 4 ? 40 : gi === 3 ? 12 : 1),
    });
  });
});

// Extra passive variants
['Resistencia', 'Condensador cerámico'].forEach((base) => {
  sizes.slice(0, 4).forEach((sz) => {
    addItem({
      name: `${base} ${sz}`,
      category: 'electronica',
      tier: 4,
      unit: 'ud',
      basePrice: sz === '0402' ? 0.01 : sz === '0603' ? 0.015 : 0.02,
    });
  });
});

// Mechanical components
const mechParts = [
  ['Tornillo M6', 0.08, 'ud'], ['Tornillo M8', 0.12, 'ud'], ['Tornillo M10', 0.18, 'ud'],
  ['Tuerca M6', 0.04, 'ud'], ['Tuerca M8', 0.06, 'ud'], ['Arandela M8', 0.02, 'ud'],
  ['Rodamiento 6205', 4.5, 'ud'], ['Rodamiento 6308', 8.2, 'ud'], ['Rodamiento axial', 12, 'ud'],
  ['Engranaje recto', 18, 'ud'], ['Engranaje cónico', 28, 'ud'], ['Correa dentada', 15, 'ud'],
  ['Cadena industrial', 35, 'm'], ['Eje mecanizado', 45, 'ud'], ['Casquillo', 6, 'ud'],
  ['Junta tórica', 0.35, 'ud'], ['Retén', 2.8, 'ud'], ['Válvula de bola', 42, 'ud'],
  ['Válvula de asiento', 65, 'ud'], ['Bomba centrífuga', 420, 'ud'], ['Bomba de engranajes', 580, 'ud'],
  ['Compresor de aire', 1200, 'ud'], ['Motor eléctrico 5 kW', 380, 'ud'],
  ['Motor eléctrico 15 kW', 720, 'ud'], ['Motor eléctrico 55 kW', 2100, 'ud'],
  ['Reductor', 450, 'ud'], ['Variador de frecuencia', 680, 'ud'],
  ['Cilindro neumático', 95, 'ud'], ['Cilindro hidráulico', 220, 'ud'],
  ['Sensor inductivo', 28, 'ud'], ['Encoder', 85, 'ud'], ['Servomotor', 520, 'ud'],
];
mechParts.forEach(([name, price, unit]) => addItem({
  name, category: 'mecanicos', tier: 4, unit, basePrice: price,
}));

// Food products
const foods = [
  ['Harina de trigo', 380], ['Sémola', 420], ['Aceite de oliva', 4200],
  ['Aceite de girasol', 1400], ['Azúcar refinado', 620], ['Sal refinada', 120],
  ['Leche UHT', 0.85, 'l'], ['Queso industrial', 4800], ['Yogur a granel', 1200],
  ['Pan industrial', 1.2, 'ud'], ['Pasta alimentaria', 980], ['Conserva de tomate', 1100],
  ['Zumos concentrados', 1800], ['Cerveza a granel', 0.6, 'l'], ['Vino a granel', 1.8, 'l'],
  ['Pienso compuesto', 320], ['Alimento para mascotas', 980], ['Chocolate cobertura', 4200],
  ['Café tostado', 6800], ['Especias mix', 5200], ['Congelado vegetal', 1400],
];
foods.forEach(([name, price, unit]) => addItem({
  name, category: 'alimentacion', tier: 3, unit: unit || 't', basePrice: price,
}));

// Packaging
const packaging = [
  ['Caja de cartón', 0.45, 'ud'], ['Film stretch', 1.8, 'kg'], ['Film retráctil', 2.2, 'kg'],
  ['Palé de madera', 12, 'ud'], ['Palé de plástico', 28, 'ud'], ['Bidón 200 L', 18, 'ud'],
  ['IBC 1000 L', 85, 'ud'], ['Saco de rafia', 0.35, 'ud'], ['Big bag', 8, 'ud'],
  ['Botella PET', 0.08, 'ud'], ['Bote de vidrio', 0.15, 'ud'], ['Lata de aluminio', 0.06, 'ud'],
  ['Etiqueta adhesiva', 0.02, 'ud'], ['Tinta flexográfica', 8, 'kg'],
];
packaging.forEach(([name, price, unit]) => addItem({
  name, category: 'embalaje', tier: 3, unit, basePrice: price,
}));

// Vehicles & heavy products
const vehicles = [
  ['Automóvil compacto', 18000, 'ud'], ['Furgoneta industrial', 28000, 'ud'],
  ['Camión rígido', 65000, 'ud'], ['Cabeza tractora', 95000, 'ud'],
  ['Autobús urbano', 220000, 'ud'], ['Locomotora diésel', 1800000, 'ud'],
  ['Vagón de mercancías', 85000, 'ud'], ['Contenedor 20 pies', 2200, 'ud'],
  ['Contenedor 40 pies', 3500, 'ud'], ['Barco freighter módulo', 2500000, 'ud'],
  ['Turbina eólica pala', 180000, 'ud'], ['Góndola eólica', 450000, 'ud'],
  ['Panel solar', 120, 'ud'], ['Inversor solar', 450, 'ud'],
  ['Batería estacionaria', 8500, 'ud'], ['Transformador de potencia', 120000, 'ud'],
];
vehicles.forEach(([name, price, unit]) => addItem({
  name, category: 'bienes_capital', tier: 6, unit, basePrice: price,
}));

// Paper
[
  ['Pasta de papel', 520], ['Papel prensa', 680], ['Papel offset', 890],
  ['Cartón kraft', 720], ['Cartón ondulado', 650], ['Papel tissue', 1100],
  ['Papel estucado', 980], ['Celulosa disolving', 1400],
].forEach(([name, price]) => addItem({
  name, category: 'papel', tier: 3, unit: 't', basePrice: price,
}));

// Fertilizers
[
  ['Fertilizante NPK 15-15-15', 420], ['Fertilizante NPK 20-10-10', 400],
  ['Fertilizante foliar', 1800], ['Abono orgánico', 180], ['Herbicida', 6200],
  ['Insecticida', 7800], ['Fungicida', 8500], ['Semilla certificada', 3200],
].forEach(([name, price]) => addItem({
  name, category: 'agroquimicos', tier: 3, unit: 't', basePrice: price,
}));

// Generate systematic intermediate chemicals (thousands via families)
const chemFamilies = [
  { prefix: 'Ácido', bases: ['fórmico', 'láctico', 'oxálico', 'benzoico', 'salicílico', 'esteárico', 'oleico', 'palmítico', 'ftálico', 'maleico', 'adípico', 'cítrico anhidro', 'ascórbico', 'bórico', 'fluorhídrico', 'cromotrópico', 'picrico', 'sulfámico', 'perclórico', 'yodhídrico'], price: 800 },
  { prefix: 'Óxido de', bases: ['hierro', 'cobre', 'níquel', 'cobalto', 'manganeso', 'cromo', 'vanadio', 'tungsteno', 'molibdeno', 'cerio', 'lantano', 'itrio', 'circonio', 'hafnio', 'niobio', 'tantalio', 'escandio', 'galio', 'indio', 'germanio'], price: 2500 },
  { prefix: 'Cloruro de', bases: ['sodio', 'potasio', 'calcio', 'magnesio', 'aluminio', 'hierro', 'cobre', 'cinc', 'níquel', 'amonío', 'metileno', 'etilo', 'vinilo', 'alilo', 'bencilo', 'tionilo', 'sulfurilo', 'fosforilo', 'silicio', 'titanio'], price: 600 },
  { prefix: 'Sulfato de', bases: ['sodio', 'potasio', 'calcio', 'magnesio', 'amonio', 'hierro', 'cobre', 'cinc', 'níquel', 'manganeso', 'aluminio', 'cromo', 'cobalto', 'cadmio', 'bario', 'estroncio', 'litio', 'cesio', 'plata', 'talio'], price: 500 },
  { prefix: 'Nitrato de', bases: ['sodio', 'potasio', 'calcio', 'amonio', 'plata', 'plomo', 'cobre', 'cinc', 'hierro', 'magnesio', 'bario', 'estroncio', 'litio', 'cesio', 'aluminio', 'cromo', 'níquel', 'cobalto', 'manganeso', 'uranilo'], price: 700 },
  { prefix: 'Carbonato de', bases: ['sodio', 'potasio', 'calcio', 'magnesio', 'litio', 'bario', 'estroncio', 'cinc', 'cobre', 'níquel', 'cobalto', 'manganeso', 'hierro', 'plomo', 'cadmio', 'plata', 'amonío', 'cesio', 'rubidio', 'berilio'], price: 450 },
  { prefix: 'Polímero', bases: ['EVA', 'SAN', 'ASA', 'POM', 'PBT', 'PETG', 'PPS', 'PEEK', 'PES', 'PSU', 'PVDF', 'ETFE', 'FEP', 'PFA', 'LCP', 'PA11', 'PA12', 'TPU', 'TPE', 'TPC'], price: 3500 },
  { prefix: 'Catalizador', bases: ['de hidrogenación', 'de oxidación', 'de reformado', 'de polimerización Ziegler', 'de metatesis', 'de Fischer-Tropsch', 'de desulfuración', 'de Denox', 'de Claus', 'de síntesis de amoníaco', 'de metanol', 'de oxo', 'de alquilación', 'de isomerización', 'de cracking térmico', 'de cracking catalítico', 'de hidrotratamiento', 'de reformado de vapor', 'de shift', 'de selectiva'], price: 15000 },
  { prefix: 'Disolvente', bases: ['DMF', 'DMSO', 'NMP', 'THF', 'dioxano', 'acetato de etilo', 'acetato de butilo', 'MIBK', 'MEK', 'ciclohexano', 'heptano', 'hexano', 'isopropanol', 'n-butanol', 'isobutanol', 'glicol éter', 'white spirit', 'queroseno disolvente', 'percloroetileno', 'tricloroetileno'], price: 1100 },
  { prefix: 'Pigmento', bases: ['rojo óxido', 'amarillo óxido', 'azul ftalocianina', 'verde ftalocianina', 'negro carbón', 'blanco TiO2 rutilo', 'blanco TiO2 anatasa', 'ocre', 'siena', 'ultramar', 'cadmio rojo', 'cadmio amarillo', 'cobalto azul', 'cromo verde', 'zinc blanco', 'litopón', 'amarillo de níquel', 'rojo de quinacridona', 'azul de indantrona', 'violeta de dioxazina'], price: 2800 },
];

chemFamilies.forEach((fam) => {
  fam.bases.forEach((b, i) => {
    addItem({
      name: `${fam.prefix} ${b}`,
      category: 'quimicos',
      tier: 3,
      unit: 't',
      basePrice: Math.round(fam.price * (0.7 + i * 0.08)),
    });
  });
});

// Regional agricultural variants to push count
const agRegions = ['Andalucía', 'Castilla', 'Aragón', 'Valencia', 'Murcia', 'Galicia', 'Cataluña', 'Extremadura', 'Navarra', 'La Rioja'];
const agProducts = ['Aceite de oliva virgen', 'Vino tinto', 'Vino blanco', 'Jamón curado', 'Queso curado', 'Conserva vegetal', 'Zumos NFC', 'Frutos secos', 'Miel', 'Harina especial'];
agRegions.forEach((r) => {
  agProducts.forEach((p, i) => {
    addItem({
      name: `${p} (${r})`,
      category: 'alimentacion',
      tier: 4,
      unit: p.includes('Vino') || p.includes('Aceite') || p.includes('Zumos') || p.includes('Miel') ? 'l' : 't',
      basePrice: 800 + i * 200 + r.length * 10,
    });
  });
});

// Industrial gases grades
const gases = ['Oxígeno', 'Nitrógeno', 'Argón', 'Helio', 'Hidrógeno', 'CO₂', 'Acetileno', 'Amoníaco gas', 'Cloro gas', 'SF6'];
const gasGrades = ['técnico', 'industrial', 'alimentario', 'médico', 'electrónico', 'alta pureza 5.0', 'alta pureza 6.0'];
gases.forEach((g) => {
  gasGrades.forEach((gr, i) => {
    addItem({
      name: `${g} ${gr}`,
      category: 'energia',
      tier: 2 + Math.floor(i / 2),
      unit: 'm³',
      basePrice: Math.round((0.5 + i * 1.8) * 100) / 100,
      qualityRelevant: true,
    });
  });
});

// Machine tool / finished goods SKUs
const machineGoods = [
  'Torno CNC', 'Fresadora CNC', 'Centro de mecanizado', 'Prensa hidráulica',
  'Prensa de estampación', 'Robot soldadura', 'Robot picking', 'Línea de ensamblaje',
  'Extrusora de plástico', 'Inyectora de plástico', 'Sopladora', 'Termoformadora',
  'Horno de temple', 'Horno de fusión', 'Laminador', 'Trenes de laminación',
  'Rectificadora', 'Electroerosión', 'Cortadora láser', 'Cortadora plasma',
  'Impresora 3D industrial', 'Escáner 3D', 'CMM metrología', 'Balanza industrial',
];
machineGoods.forEach((name, i) => {
  ['estándar', 'avanzado', 'alta precisión'].forEach((g, gi) => {
    addItem({
      name: `${name} ${g}`,
      category: 'bienes_capital',
      tier: 5 + gi,
      unit: 'ud',
      basePrice: 25000 * (i + 1) * (1 + gi * 0.8),
    });
  });
});

// Consumer durables
const consumers = [
  'Lavadora', 'Frigorífico', 'Lavavajillas', 'Horno doméstico', 'Aire acondicionado',
  'Televisor', 'Smartphone', 'Portátil', 'Tablet', 'Router', 'Impresora doméstica',
  'Aspiradora', 'Microondas', 'Calentador', 'Bicicleta', 'Patinete eléctrico',
];
consumers.forEach((name, i) => {
  ['básico', 'medio', 'premium'].forEach((g, gi) => {
    addItem({
      name: `${name} ${g}`,
      category: 'consumo',
      tier: 5,
      unit: 'ud',
      basePrice: Math.round((80 + i * 40) * (1 + gi * 1.5)),
    });
  });
});

// Bulk generate recycled / quality variants for core metals to deepen catalog
const coreMetals = ['Acero laminado', 'Cobre electrolítico', 'Aluminio puro', 'Cinc SHG', 'Níquel puro'];
const qLabels = ['calidad comercial', 'calidad industrial', 'calidad automoción', 'calidad aeroespacial', 'calidad médica'];
coreMetals.forEach((m) => {
  qLabels.forEach((q, qi) => {
    addItem({
      name: `${m} (${q})`,
      category: 'metales',
      tier: 4 + qi,
      unit: 't',
      basePrice: Math.round((itemIndex.get(idify(m))?.basePrice || 1000) * (1 + qi * 0.25)),
    });
  });
});

// ——— Expansión masiva para alcanzar miles de SKUs reales ———
const isoSteels = [];
for (let c = 10; c <= 60; c += 5) {
  for (let cr of [0, 0.5, 1, 1.5, 2]) {
    for (let ni of [0, 0.3, 1, 2]) {
      const name = `Acero C${c}${cr ? `-Cr${cr}` : ''}${ni ? `-Ni${ni}` : ''}`;
      isoSteels.push([name, 700 + c * 8 + cr * 200 + ni * 400]);
    }
  }
}
isoSteels.forEach(([name, price]) => addItem({ name, category: 'metales', tier: 4, unit: 't', basePrice: Math.round(price) }));

const plasticForms = ['granza', 'lámina', 'film', 'perfil', 'inyección', 'espuma', 'fibra', 'compuesto'];
const plasticResins = ['PEAD', 'PEBD', 'PP', 'PVC', 'PET', 'PS', 'ABS', 'PA6', 'PA66', 'PC', 'PMMA', 'POM', 'PBT', 'PPS', 'PEEK', 'TPU', 'EVA', 'SAN'];
plasticResins.forEach((r) => {
  plasticForms.forEach((f, fi) => {
    addItem({
      name: `${r} ${f}`,
      category: 'quimicos',
      tier: 3 + Math.floor(fi / 3),
      unit: f === 'inyección' || f === 'perfil' ? 'ud' : 't',
      basePrice: 1000 + fi * 180 + r.length * 40,
    });
  });
});

const wireGauges = [];
for (let awg = 8; awg <= 30; awg++) {
  ['cobre', 'aluminio', 'acero'].forEach((mat) => {
    wireGauges.push([`Cable ${mat} AWG ${awg}`, Math.round((40 - awg) * (mat === 'cobre' ? 3 : mat === 'aluminio' ? 1.2 : 0.8) * 10) / 10]);
  });
}
wireGauges.forEach(([name, price]) => addItem({ name, category: 'mecanicos', tier: 4, unit: 'm', basePrice: price }));

const boltSizes = ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M14', 'M16', 'M20', 'M24', 'M30'];
const boltMaterials = ['acero 8.8', 'acero 10.9', 'acero 12.9', 'inox A2', 'inox A4', 'latón', 'titanio'];
const boltTypes = ['hexagonal', 'allen', 'brida', 'carroceria'];
boltSizes.forEach((sz) => {
  boltMaterials.forEach((mat) => {
    boltTypes.forEach((tp) => {
      addItem({
        name: `Tornillería ${sz} ${tp} ${mat}`,
        category: 'mecanicos',
        tier: 3,
        unit: 'ud',
        basePrice: Math.round((0.05 + boltSizes.indexOf(sz) * 0.04 + boltMaterials.indexOf(mat) * 0.08) * 100) / 100,
      });
    });
  });
});

const bearingSeries = [];
for (let series of [62, 63, 60, 32, 22]) {
  for (let size = 00; size <= 16; size++) {
    const code = `${series}${String(size).padStart(2, '0')}`;
    bearingSeries.push([`Rodamiento ${code}`, 3 + series * 0.1 + size * 0.4]);
  }
}
bearingSeries.forEach(([name, price]) => addItem({ name, category: 'mecanicos', tier: 4, unit: 'ud', basePrice: Math.round(price * 100) / 100 }));

const pcbLayers = [1, 2, 4, 6, 8, 10, 12];
const pcbSizes = ['50x50', '100x80', '150x100', '200x150', '300x200'];
const pcbMats = ['FR4', 'aluminio', 'flex', 'Rogers'];
pcbLayers.forEach((ly) => {
  pcbSizes.forEach((sz) => {
    pcbMats.forEach((mat) => {
      addItem({
        name: `PCB ${ly}L ${sz} ${mat}`,
        category: 'electronica',
        tier: 4,
        unit: 'ud',
        basePrice: Math.round((2 + ly * 1.5 + pcbMats.indexOf(mat) * 3) * 100) / 100,
      });
    });
  });
});

const pharmaForms = ['API', 'comprimido', 'cápsula', 'jarabe', 'inyectable', 'crema', 'parche', 'inhalador'];
const pharmaActives = [
  'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol', 'Metformina', 'Atorvastatina',
  'Losartán', 'Amlodipino', 'Salbutamol', 'Cetirizina', 'Diclofenaco', 'Tramadol',
  'Sertralina', 'Escitalopram', 'Levotiroxina', 'Warfarina', 'Clopidogrel', 'Pantoprazol',
  'Azitromicina', 'Ciprofloxacino', 'Dexametasona', 'Prednisona', 'Insulina glargina', 'Heparina',
];
pharmaActives.forEach((act) => {
  pharmaForms.forEach((form, fi) => {
    addItem({
      name: `${act} ${form}`,
      category: 'farmaceuticos',
      tier: 5,
      unit: form === 'API' ? 'kg' : 'ud',
      basePrice: form === 'API' ? 15000 + act.length * 500 : Math.round((0.05 + fi * 0.4) * 100) / 100,
    });
  });
});

const foodVariants = ['fresco', 'congelado', 'en conserva', 'deshidratado', 'ecológico', 'industrial a granel'];
const foodBases = [
  'Tomate', 'Pimiento', 'Cebolla', 'Patata', 'Zanahoria', 'Guisante', 'Judía', 'Maíz dulce',
  'Atún', 'Sardina', 'Salmón', 'Merluza', 'Pollo', 'Cerdo', 'Ternera', 'Pavo',
  'Manzana', 'Pera', 'Plátano', 'Fresa', 'Melocotón', 'Uva', 'Naranja', 'Limón',
];
foodBases.forEach((b) => {
  foodVariants.forEach((v, vi) => {
    addItem({
      name: `${b} ${v}`,
      category: 'alimentacion',
      tier: 2 + Math.floor(vi / 2),
      unit: 't',
      basePrice: 400 + vi * 150 + b.length * 10,
    });
  });
});

const constructionDims = [];
['IPN', 'IPE', 'HEB', 'HEA', 'UPN', 'tubo cuadrado', 'tubo redondo'].forEach((profile) => {
  [80, 100, 120, 140, 160, 180, 200, 220, 240, 300, 400, 500].forEach((dim) => {
    constructionDims.push([`Perfil ${profile} ${dim}`, 800 + dim * 2]);
  });
});
constructionDims.forEach(([name, price]) => addItem({ name, category: 'construccion', tier: 3, unit: 't', basePrice: price }));

const ceramicTiles = [];
['gres', 'porcelánico', 'azulejo', 'mosaico', 'terrazo'].forEach((t) => {
  ['30x30', '45x45', '60x60', '80x80', '120x60', '120x120'].forEach((sz) => {
    ['mate', 'brillo', 'antideslizante', 'rectificado'].forEach((fin) => {
      ceramicTiles.push([`Baldosa ${t} ${sz} ${fin}`, 8 + sz.length + fin.length]);
    });
  });
});
ceramicTiles.forEach(([name, price]) => addItem({ name, category: 'construccion', tier: 3, unit: 'm²', basePrice: price }));

const textileGsm = [80, 120, 150, 180, 220, 280, 350, 500];
const textileFibers = ['algodón', 'poliéster', 'nylon', 'viscosa', 'lana', 'lino', 'acrílico', 'aramida', 'carbono'];
textileFibers.forEach((f) => {
  textileGsm.forEach((gsm) => {
    addItem({
      name: `Tejido ${f} ${gsm} g/m²`,
      category: 'textiles',
      tier: 3,
      unit: 'm²',
      basePrice: Math.round((gsm / 50) * (f === 'carbono' || f === 'aramida' ? 8 : 1) * 100) / 100,
    });
  });
});

const rareEarths = ['Lantano', 'Cerio', 'Praseodimio', 'Neodimio', 'Samario', 'Europio', 'Gadolinio', 'Terbio', 'Disprosio', 'Holmio', 'Erbio', 'Iterbio', 'Itrio', 'Escandio'];
rareEarths.forEach((re) => {
  ['óxido', 'metal', 'aleación magnética', 'sal'].forEach((form, fi) => {
    addItem({
      name: `${re} ${form}`,
      category: 'metales',
      tier: 5,
      unit: 'kg',
      basePrice: 80 + fi * 200 + re.length * 15,
    });
  });
});

const industrialGasesExtended = ['Neón', 'Kriptón', 'Xenón', 'Deuterio', 'Metano', 'Etano', 'Propano', 'Butano', 'Óxido nitroso', 'Monóxido de carbono'];
industrialGasesExtended.forEach((g) => {
  ['industrial', 'alta pureza', 'investigación'].forEach((gr, i) => {
    addItem({ name: `${g} ${gr}`, category: 'energia', tier: 2 + i, unit: 'm³', basePrice: 2 + i * 15 + g.length });
  });
});

// Lubricants / oils catalog
const viscosity = ['0W-20', '5W-30', '5W-40', '10W-40', '15W-40', '20W-50', 'ISO 32', 'ISO 46', 'ISO 68', 'ISO 100', 'ISO 220', 'ISO 320'];
viscosity.forEach((v) => {
  ['motor', 'hidráulico', 'engranajes', 'compresor', 'turbina'].forEach((use) => {
    addItem({
      name: `Lubricante ${use} ${v}`,
      category: 'quimicos',
      tier: 3,
      unit: 'l',
      basePrice: Math.round((2.5 + use.length * 0.1) * 100) / 100,
    });
  });
});

// Paint / coating SKUs
const paintColors = ['blanco', 'negro', 'gris', 'rojo óxido', 'azul RAL', 'verde RAL', 'amarillo seguridad', 'naranja', 'transparente'];
const paintBases = ['alquídica', 'epoxi', 'poliuretano', 'acrílica', 'anticorrosiva', 'intumescente'];
paintBases.forEach((base) => {
  paintColors.forEach((col) => {
    addItem({
      name: `Pintura ${base} ${col}`,
      category: 'quimicos',
      tier: 3,
      unit: 'l',
      basePrice: 4 + base.length * 0.3,
    });
  });
});

// Valve / pipe catalog
['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN150', 'DN200'].forEach((dn) => {
  ['acero carbono', 'inox 304', 'inox 316', 'PVC', 'PEAD', 'cobre'].forEach((mat) => {
    addItem({ name: `Tubería ${dn} ${mat}`, category: 'construccion', tier: 3, unit: 'm', basePrice: 8 + mat.length });
    addItem({ name: `Válvula mariposa ${dn} ${mat}`, category: 'mecanicos', tier: 4, unit: 'ud', basePrice: 40 + mat.length * 3 });
  });
});

// ——— Recipes ———
function ensure(name) {
  const it = itemIndex.get(idify(name));
  if (!it) throw new Error('Missing item: ' + name);
  return it.id;
}

// Mining / extraction style recipes from ores
metalChains.forEach((chain) => {
  const oreId = ensure(chain.ore);
  let prev = oreId;
  const names = stages.map((s) => chain[s]);
  names.forEach((n, i) => {
    const outId = ensure(n);
    addRecipe({
      name: `Procesar ${n}`,
      building: i < 3 ? 'planta_concentracion' : i < 6 ? 'fundicion' : 'laminacion',
      machine: i < 3 ? 'trituradora' : i < 6 ? 'horno_arco' : 'laminador',
      inputs: [{ item: prev, qty: i === 0 ? 1.2 : 1.05 }],
      outputs: [{ item: outId, qty: 1 }],
      byproducts: i < 4 ? [{ item: ensure('Escoria metalúrgica'), qty: 0.15 }] : [{ item: ensure('Chatarra férrea'), qty: 0.02 }],
      energyKwh: 50 + i * 40,
      waterM3: 2 + i,
      timeMinutes: 30 + i * 15,
      pollution: 2 + i,
      tech: i >= 4 ? 'metalurgia_avanzada' : i >= 2 ? 'metalurgia_basica' : null,
      qualityBase: 40 + i * 5,
    });
    prev = outId;
  });
});

// Oil refining
const oilProducts = [
  { name: 'Gasolina', qty: 0.25 },
  { name: 'Diésel', qty: 0.3 },
  { name: 'Queroseno', qty: 0.1 },
  { name: 'Fuelóleo', qty: 0.2 },
  { name: 'GPL', qty: 0.08 },
];
addRecipe({
  name: 'Refino de petróleo',
  building: 'refineria',
  machine: 'unidad_destilacion',
  inputs: [{ item: ensure('Petróleo crudo'), qty: 1 }],
  outputs: oilProducts.map((p) => ({ item: ensure(p.name), qty: p.qty })),
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 80 }, { item: ensure('SO₂ emitido'), qty: 2 }],
  energyKwh: 120,
  waterM3: 5,
  timeMinutes: 60,
  pollution: 8,
  tech: 'refino_basico',
});

// Cement
addRecipe({
  name: 'Fabricar clínker',
  building: 'cementera',
  machine: 'horno_rotatorio',
  inputs: [
    { item: ensure('Caliza'), qty: 1.2 },
    { item: ensure('Arcilla industrial'), qty: 0.3 },
  ],
  outputs: [{ item: ensure('Clínker'), qty: 1 }],
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 700 }, { item: ensure('Cenizas volantes'), qty: 0.05 }],
  energyKwh: 100,
  timeMinutes: 90,
  pollution: 10,
  tech: 'cemento_basico',
});
addRecipe({
  name: 'Moler cemento',
  building: 'cementera',
  machine: 'molino_bolas',
  inputs: [
    { item: ensure('Clínker'), qty: 0.95 },
    { item: ensure('Yeso'), qty: 0.05 },
  ],
  outputs: [{ item: ensure('Cemento Portland'), qty: 1 }],
  energyKwh: 40,
  timeMinutes: 45,
  pollution: 2,
  tech: 'cemento_basico',
});
addRecipe({
  name: 'Hormigón fresco',
  building: 'planta_hormigon',
  machine: 'amasadora',
  inputs: [
    { item: ensure('Cemento Portland'), qty: 0.3 },
    { item: ensure('Arena de construcción'), qty: 0.4 },
    { item: ensure('Grava'), qty: 0.5 },
    { item: ensure('Agua industrial'), qty: 0.15 },
  ],
  outputs: [{ item: ensure('Hormigón fresco'), qty: 1 }],
  energyKwh: 15,
  timeMinutes: 20,
  pollution: 1,
});

// Chemicals basics
addRecipe({
  name: 'Síntesis de amoníaco',
  building: 'planta_quimica',
  machine: 'reactor_haber',
  inputs: [
    { item: ensure('Hidrógeno'), qty: 180 },
    { item: ensure('Nitrógeno industrial'), qty: 60 },
  ],
  outputs: [{ item: ensure('Amoníaco'), qty: 1 }],
  energyKwh: 400,
  timeMinutes: 120,
  pollution: 3,
  tech: 'quimica_basica',
});
addRecipe({
  name: 'Ácido sulfúrico (contacto)',
  building: 'planta_quimica',
  machine: 'reactor_contacto',
  inputs: [{ item: ensure('Azufre elemental'), qty: 0.33 }],
  outputs: [{ item: ensure('Ácido sulfúrico'), qty: 1 }],
  byproducts: [{ item: ensure('SO₂ emitido'), qty: 5 }],
  energyKwh: 80,
  timeMinutes: 60,
  pollution: 4,
  tech: 'quimica_basica',
});
addRecipe({
  name: 'Sosa cáustica (electrólisis)',
  building: 'planta_quimica',
  machine: 'celda_electrolisis',
  inputs: [
    { item: ensure('Sal gema'), qty: 1.5 },
    { item: ensure('Agua industrial'), qty: 2 },
  ],
  outputs: [
    { item: ensure('Sosa cáustica'), qty: 1 },
    { item: ensure('Cloro'), qty: 0.9 },
  ],
  energyKwh: 250,
  timeMinutes: 90,
  pollution: 3,
  tech: 'quimica_basica',
});

// Plastics
['PEAD granza', 'PEBD granza', 'PP granza', 'PVC resina', 'PET granza', 'PS granza', 'ABS granza'].forEach((poly, i) => {
  const feed = i < 3 ? 'Etileno' : i === 3 ? 'Cloruro de vinilo' : i === 4 ? 'Ácido tereftálico' : 'Estireno';
  addRecipe({
    name: `Polimerizar ${poly}`,
    building: 'planta_polimeros',
    machine: 'reactor_polimerizacion',
    inputs: [
      { item: ensure(feed), qty: 1.05 },
      { item: ensure('Catalizador de polimerización Ziegler'), qty: 0.001 },
    ],
    outputs: [{ item: ensure(poly), qty: 1 }],
    energyKwh: 180,
    timeMinutes: 100,
    pollution: 2,
    tech: 'polimeros',
  });
});

// Food
addRecipe({
  name: 'Moler harina',
  building: 'molino_harinero',
  machine: 'molino_rodillos',
  inputs: [{ item: ensure('Trigo'), qty: 1.05 }],
  outputs: [{ item: ensure('Harina de trigo'), qty: 1 }],
  byproducts: [{ item: ensure('Pienso compuesto'), qty: 0.1 }],
  energyKwh: 40,
  timeMinutes: 40,
  pollution: 0.5,
});
addRecipe({
  name: 'Refinar azúcar',
  building: 'azucarera',
  machine: 'difusor',
  inputs: [{ item: ensure('Remolacha azucarera'), qty: 7 }],
  outputs: [{ item: ensure('Azúcar refinado'), qty: 1 }],
  energyKwh: 90,
  waterM3: 4,
  timeMinutes: 80,
  pollution: 2,
});
addRecipe({
  name: 'Prensar aceite de oliva',
  building: 'almazara',
  machine: 'prensa_aceite',
  inputs: [{ item: ensure('Oliva'), qty: 5 }],
  outputs: [{ item: ensure('Aceite de oliva'), qty: 1 }],
  energyKwh: 30,
  timeMinutes: 50,
  pollution: 0.5,
});

// Glass
addRecipe({
  name: 'Fundir vidrio float',
  building: 'vidriera',
  machine: 'horno_vidrio',
  inputs: [
    { item: ensure('Arena de sílice'), qty: 0.7 },
    { item: ensure('Carbonato sódico'), qty: 0.2 },
    { item: ensure('Caliza'), qty: 0.1 },
  ],
  outputs: [{ item: ensure('Vidrio float'), qty: 1 }],
  energyKwh: 200,
  timeMinutes: 100,
  pollution: 3,
  tech: 'vidrio',
});

// Paper
addRecipe({
  name: 'Pasta de papel',
  building: 'papelera',
  machine: 'digestor',
  inputs: [
    { item: ensure('Madera de eucalipto'), qty: 2.2 },
    { item: ensure('Sosa cáustica'), qty: 0.1 },
  ],
  outputs: [{ item: ensure('Pasta de papel'), qty: 1 }],
  byproducts: [{ item: ensure('Lodos industriales'), qty: 0.2 }],
  energyKwh: 150,
  waterM3: 20,
  timeMinutes: 120,
  pollution: 5,
  tech: 'papel',
});
addRecipe({
  name: 'Papel offset',
  building: 'papelera',
  machine: 'maquina_papel',
  inputs: [{ item: ensure('Pasta de papel'), qty: 1.05 }],
  outputs: [{ item: ensure('Papel offset'), qty: 1 }],
  energyKwh: 80,
  waterM3: 8,
  timeMinutes: 60,
  pollution: 2,
  tech: 'papel',
});

// Recycling
addRecipe({
  name: 'Reciclar chatarra férrea',
  building: 'reciclaje',
  machine: 'horno_induccion',
  inputs: [{ item: ensure('Chatarra férrea'), qty: 1.1 }],
  outputs: [{ item: ensure('Acero líquido'), qty: 1 }],
  energyKwh: 90,
  timeMinutes: 50,
  pollution: 2,
  tech: 'reciclaje',
});
addRecipe({
  name: 'Reciclar plástico mixto',
  building: 'reciclaje',
  machine: 'extrusora_reciclado',
  inputs: [{ item: ensure('Residuo plástico mixto'), qty: 1.2 }],
  outputs: [{ item: ensure('PEAD granza'), qty: 0.7 }],
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 40 }],
  energyKwh: 70,
  timeMinutes: 60,
  pollution: 2,
  tech: 'reciclaje',
});
addRecipe({
  name: 'Reciclar papel',
  building: 'reciclaje',
  machine: 'pulper',
  inputs: [{ item: ensure('Papel recuperado'), qty: 1.15 }],
  outputs: [{ item: ensure('Pasta de papel'), qty: 1 }],
  energyKwh: 50,
  waterM3: 10,
  timeMinutes: 45,
  pollution: 1,
  tech: 'reciclaje',
});

// Power
addRecipe({
  name: 'Generar electricidad (carbón)',
  building: 'central_termica',
  machine: 'turbina_vapor',
  inputs: [{ item: ensure('Carbón mineral'), qty: 0.4 }],
  outputs: [{ item: ensure('Electricidad'), qty: 1000 }],
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 900 }, { item: ensure('Cenizas volantes'), qty: 0.05 }],
  energyKwh: 0,
  timeMinutes: 60,
  pollution: 15,
});
addRecipe({
  name: 'Generar electricidad (gas)',
  building: 'central_ciclo_combinado',
  machine: 'turbina_gas',
  inputs: [{ item: ensure('Gas natural'), qty: 200 }],
  outputs: [{ item: ensure('Electricidad'), qty: 1000 }],
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 400 }],
  energyKwh: 0,
  timeMinutes: 60,
  pollution: 6,
  tech: 'energia_gas',
});
addRecipe({
  name: 'Generar electricidad (biomasa)',
  building: 'central_biomasa',
  machine: 'turbina_vapor',
  inputs: [{ item: ensure('Biomasa pellets'), qty: 0.5 }],
  outputs: [{ item: ensure('Electricidad'), qty: 1000 }],
  byproducts: [{ item: ensure('CO₂ emitido'), qty: 50 }],
  energyKwh: 0,
  timeMinutes: 60,
  pollution: 2,
  tech: 'energia_renovable',
});

// Extra components required by assembly recipes
addItem({ name: 'Carcasa plástico', category: 'mecanicos', tier: 3, unit: 'ud', basePrice: 2.5 });
addItem({ name: 'Neumático', category: 'mecanicos', tier: 4, unit: 'ud', basePrice: 65 });

// Electronics assembly samples
addRecipe({
  name: 'Ensamblar PCB',
  building: 'electronica',
  machine: 'linea_smt',
  inputs: [
    { item: ensure('PCB desnuda comercial'), qty: 1 },
    { item: ensure('Resistencia comercial'), qty: 40 },
    { item: ensure('Condensador cerámico comercial'), qty: 25 },
    { item: ensure('Microcontrolador comercial'), qty: 1 },
  ],
  outputs: [{ item: ensure('PCB ensamblada comercial'), qty: 1 }],
  energyKwh: 5,
  timeMinutes: 30,
  pollution: 0.5,
  tech: 'electronica_basica',
});

addRecipe({
  name: 'Ensamblar smartphone básico',
  building: 'electronica',
  machine: 'linea_ensamblaje',
  inputs: [
    { item: ensure('PCB ensamblada comercial'), qty: 1 },
    { item: ensure('Pantalla OLED comercial'), qty: 1 },
    { item: ensure('Batería Li-ion celda comercial'), qty: 1 },
    { item: ensure('Carcasa plástico'), qty: 1 },
  ],
  outputs: [{ item: ensure('Smartphone básico'), qty: 1 }],
  energyKwh: 8,
  timeMinutes: 45,
  pollution: 0.5,
  tech: 'electronica_consumo',
});

// Fertilizers
addRecipe({
  name: 'NPK 15-15-15',
  building: 'planta_fertilizantes',
  machine: 'granulador',
  inputs: [
    { item: ensure('Urea'), qty: 0.35 },
    { item: ensure('Fosfato natural'), qty: 0.35 },
    { item: ensure('Potasa'), qty: 0.3 },
  ],
  outputs: [{ item: ensure('Fertilizante NPK 15-15-15'), qty: 1 }],
  energyKwh: 60,
  timeMinutes: 50,
  pollution: 2,
  tech: 'agroquimica',
});

// Pharma
addRecipe({
  name: 'Sintetizar paracetamol API',
  building: 'planta_farmaceutica',
  machine: 'reactor_farmaceutico',
  inputs: [
    { item: ensure('Fenol'), qty: 0.8 },
    { item: ensure('Ácido acético'), qty: 0.4 },
  ],
  outputs: [{ item: ensure('Paracetamol API'), qty: 1 }],
  energyKwh: 120,
  waterM3: 3,
  timeMinutes: 180,
  pollution: 2,
  tech: 'farma_basica',
  qualityBase: 70,
});

addRecipe({
  name: 'Comprimido genérico',
  building: 'planta_farmaceutica',
  machine: 'comprimidora',
  inputs: [
    { item: ensure('Paracetamol API'), qty: 0.0005 },
    { item: ensure('Excipiente MCC'), qty: 0.0003 },
  ],
  outputs: [{ item: ensure('Comprimido genérico'), qty: 1 }],
  energyKwh: 0.01,
  timeMinutes: 1,
  pollution: 0.01,
  tech: 'farma_basica',
  qualityBase: 75,
});

// Auto parts → vehicle
addRecipe({
  name: 'Montar furgoneta industrial',
  building: 'planta_automocion',
  machine: 'linea_montaje',
  inputs: [
    { item: ensure('Chapa de acero'), qty: 0.8 },
    { item: ensure('Motor eléctrico 55 kW'), qty: 1 },
    { item: ensure('Vidrio templado'), qty: 0.05 },
    { item: ensure('ABS granza'), qty: 0.1 },
    { item: ensure('Neumático'), qty: 4 },
  ],
  outputs: [{ item: ensure('Furgoneta industrial'), qty: 1 }],
  energyKwh: 500,
  timeMinutes: 480,
  pollution: 4,
  tech: 'automocion',
});

addRecipe({
  name: 'Vulcanizar neumático',
  building: 'planta_caucho',
  machine: 'prensa_vulcanizado',
  inputs: [
    { item: ensure('Caucho SBR'), qty: 0.008 },
    { item: ensure('Negro de humo'), qty: 0.003 },
    { item: ensure('Alambre de acero'), qty: 0.001 },
  ],
  outputs: [{ item: ensure('Neumático'), qty: 1 }],
  energyKwh: 12,
  timeMinutes: 40,
  pollution: 1,
  tech: 'caucho',
});

// Generate many more recipes linking chem families (simplified intermediates)
const simpleChemRecipes = [
  ['Carbonato de calcio', 'Caliza', 1.1],
  ['Cloruro de sodio', 'Sal gema', 1.0],
  ['Óxido de hierro', 'Mena de hierro', 1.4],
  ['Óxido de cobre', 'Mena de cobre', 1.3],
  ['Óxido de cinc', 'Mena de cinc', 1.3],
];
simpleChemRecipes.forEach(([out, inp, qty]) => {
  if (itemIndex.has(idify(out)) && itemIndex.has(idify(inp))) {
    addRecipe({
      name: `Obtener ${out}`,
      building: 'planta_quimica',
      machine: 'reactor_generico',
      inputs: [{ item: ensure(inp), qty }],
      outputs: [{ item: ensure(out), qty: 1 }],
      energyKwh: 60,
      timeMinutes: 50,
      pollution: 2,
      tech: 'quimica_basica',
    });
  }
});

// Packaging recipes
addRecipe({
  name: 'Caja de cartón',
  building: 'cartonaje',
  machine: 'troqueladora',
  inputs: [{ item: ensure('Cartón ondulado'), qty: 0.5 }],
  outputs: [{ item: ensure('Caja de cartón'), qty: 1 }],
  energyKwh: 0.5,
  timeMinutes: 5,
  pollution: 0.1,
});
addRecipe({
  name: 'Cartón ondulado',
  building: 'cartonaje',
  machine: 'onduladora',
  inputs: [{ item: ensure('Cartón kraft'), qty: 1.05 }],
  outputs: [{ item: ensure('Cartón ondulado'), qty: 1 }],
  energyKwh: 40,
  timeMinutes: 30,
  pollution: 1,
  tech: 'papel',
});
addRecipe({
  name: 'Cartón kraft',
  building: 'papelera',
  machine: 'maquina_papel',
  inputs: [{ item: ensure('Pasta de papel'), qty: 1.1 }],
  outputs: [{ item: ensure('Cartón kraft'), qty: 1 }],
  energyKwh: 70,
  timeMinutes: 50,
  pollution: 1.5,
  tech: 'papel',
});

// Textiles
addRecipe({
  name: 'Hilar algodón',
  building: 'textil',
  machine: 'hiladora',
  inputs: [{ item: ensure('Algodón'), qty: 1.05 }],
  outputs: [{ item: ensure('Hilo de algodón'), qty: 1 }],
  energyKwh: 50,
  timeMinutes: 60,
  pollution: 1,
});
addRecipe({
  name: 'Tejer algodón',
  building: 'textil',
  machine: 'telar',
  inputs: [{ item: ensure('Hilo de algodón'), qty: 0.25 }],
  outputs: [{ item: ensure('Tejido de algodón'), qty: 1 }],
  energyKwh: 20,
  timeMinutes: 40,
  pollution: 0.5,
});

// Bulk recipe generator for polymer grades / alloys to deepen
steelGrades.forEach((grade, i) => {
  addRecipe({
    name: `Aleación ${grade}`,
    building: 'fundicion',
    machine: 'horno_arco',
    inputs: [
      { item: ensure('Acero líquido'), qty: 1 },
      { item: ensure('Ferrocromo'), qty: i % 3 === 0 ? 0.08 : 0.02 },
      { item: ensure('Níquel cátodo'), qty: i % 4 === 0 ? 0.05 : 0.01 },
    ],
    outputs: [{ item: ensure(grade), qty: 1 }],
    energyKwh: 120,
    timeMinutes: 70,
    pollution: 3,
    tech: i > 10 ? 'aceros_especiales' : 'metalurgia_avanzada',
    qualityBase: 55 + (i % 10),
  });
});

// Consumer assembly recipes
consumers.forEach((c) => {
  const out = `${c} básico`;
  if (!itemIndex.has(idify(out))) return;
  addRecipe({
    name: `Ensamblar ${out}`,
    building: 'planta_consumo',
    machine: 'linea_ensamblaje',
    inputs: [
      { item: ensure('Chapa de acero'), qty: 0.02 },
      { item: ensure('ABS granza'), qty: 0.01 },
      { item: ensure('Motor eléctrico 5 kW'), qty: c.includes('Lavadora') || c.includes('Frigorífico') ? 1 : 0 },
      { item: ensure('PCB ensamblada comercial'), qty: 1 },
    ].filter((x) => x.qty > 0),
    outputs: [{ item: ensure(out), qty: 1 }],
    energyKwh: 25,
    timeMinutes: 60,
    pollution: 0.5,
    tech: 'bienes_consumo',
  });
});

// Fix consumer recipes that may have empty motor - already filtered

// ——— Buildings ———
const buildings = [
  { id: 'mina', name: 'Mina a cielo abierto', category: 'extraccion', cost: 250000, slots: 4, power: 200, water: 50, storage: 5000, pollutionBase: 5, desc: 'Extracción de minerales.' },
  { id: 'pozo_petroleo', name: 'Pozo petrolífero', category: 'extraccion', cost: 800000, slots: 3, power: 300, water: 80, storage: 8000, pollutionBase: 8, desc: 'Extracción de crudo.' },
  { id: 'pozo_gas', name: 'Pozo de gas', category: 'extraccion', cost: 600000, slots: 3, power: 250, water: 40, storage: 6000, pollutionBase: 4, desc: 'Extracción de gas natural.' },
  { id: 'granja', name: 'Complejo agrícola', category: 'extraccion', cost: 120000, slots: 6, power: 80, water: 200, storage: 3000, pollutionBase: 1, desc: 'Producción agrícola.' },
  { id: 'aserradero', name: 'Aserradero', category: 'extraccion', cost: 90000, slots: 3, power: 60, water: 30, storage: 2000, pollutionBase: 1, desc: 'Procesado forestal.' },
  { id: 'planta_concentracion', name: 'Planta de concentración', category: 'procesado', cost: 400000, slots: 6, power: 400, water: 150, storage: 4000, pollutionBase: 4, desc: 'Concentración de menas.' },
  { id: 'fundicion', name: 'Fundición', category: 'procesado', cost: 1200000, slots: 8, power: 2000, water: 300, storage: 6000, pollutionBase: 12, desc: 'Metalurgia primaria.' },
  { id: 'laminacion', name: 'Tren de laminación', category: 'procesado', cost: 900000, slots: 6, power: 1500, water: 200, storage: 5000, pollutionBase: 5, desc: 'Laminados metálicos.' },
  { id: 'refineria', name: 'Refinería', category: 'energia', cost: 5000000, slots: 10, power: 3000, water: 800, storage: 20000, pollutionBase: 15, desc: 'Refino de petróleo.' },
  { id: 'cementera', name: 'Cementera', category: 'procesado', cost: 1500000, slots: 6, power: 1800, water: 250, storage: 8000, pollutionBase: 14, desc: 'Clínker y cemento.' },
  { id: 'planta_hormigon', name: 'Planta de hormigón', category: 'procesado', cost: 200000, slots: 3, power: 100, water: 100, storage: 1500, pollutionBase: 2, desc: 'Hormigón fresco.' },
  { id: 'planta_quimica', name: 'Planta química', category: 'quimica', cost: 2500000, slots: 10, power: 2500, water: 600, storage: 10000, pollutionBase: 10, desc: 'Química básica y fina.' },
  { id: 'planta_polimeros', name: 'Planta de polímeros', category: 'quimica', cost: 2200000, slots: 8, power: 2200, water: 400, storage: 8000, pollutionBase: 6, desc: 'Polimerización.' },
  { id: 'planta_fertilizantes', name: 'Planta de fertilizantes', category: 'quimica', cost: 1800000, slots: 6, power: 1200, water: 350, storage: 7000, pollutionBase: 7, desc: 'NPK y agroquímica.' },
  { id: 'planta_farmaceutica', name: 'Planta farmacéutica', category: 'quimica', cost: 4000000, slots: 8, power: 1500, water: 500, storage: 3000, pollutionBase: 3, desc: 'API y formulados.' },
  { id: 'molino_harinero', name: 'Molino harinero', category: 'alimentacion', cost: 250000, slots: 4, power: 200, water: 80, storage: 4000, pollutionBase: 1, desc: 'Harinas.' },
  { id: 'azucarera', name: 'Azucarera', category: 'alimentacion', cost: 900000, slots: 5, power: 600, water: 400, storage: 5000, pollutionBase: 3, desc: 'Azúcar.' },
  { id: 'almazara', name: 'Almazara', category: 'alimentacion', cost: 180000, slots: 3, power: 80, water: 60, storage: 2000, pollutionBase: 1, desc: 'Aceite de oliva.' },
  { id: 'vidriera', name: 'Vidriera industrial', category: 'procesado', cost: 1100000, slots: 5, power: 1600, water: 200, storage: 4000, pollutionBase: 5, desc: 'Vidrio float.' },
  { id: 'papelera', name: 'Papelera', category: 'procesado', cost: 1600000, slots: 7, power: 1400, water: 900, storage: 6000, pollutionBase: 8, desc: 'Pasta y papel.' },
  { id: 'cartonaje', name: 'Planta de cartonaje', category: 'procesado', cost: 350000, slots: 4, power: 250, water: 50, storage: 3000, pollutionBase: 1, desc: 'Embalajes.' },
  { id: 'textil', name: 'Planta textil', category: 'procesado', cost: 450000, slots: 6, power: 400, water: 200, storage: 2500, pollutionBase: 2, desc: 'Hilatura y tejido.' },
  { id: 'planta_caucho', name: 'Planta de caucho', category: 'procesado', cost: 700000, slots: 5, power: 500, water: 120, storage: 3000, pollutionBase: 3, desc: 'Neumáticos y elastómeros.' },
  { id: 'reciclaje', name: 'Centro de reciclaje', category: 'reciclaje', cost: 600000, slots: 6, power: 700, water: 250, storage: 5000, pollutionBase: 2, desc: 'Recuperación de materiales.' },
  { id: 'central_termica', name: 'Central térmica carbón', category: 'energia', cost: 3000000, slots: 4, power: 0, water: 1000, storage: 10000, pollutionBase: 20, desc: 'Electricidad a carbón.' },
  { id: 'central_ciclo_combinado', name: 'Ciclo combinado', category: 'energia', cost: 3500000, slots: 4, power: 0, water: 600, storage: 8000, pollutionBase: 8, desc: 'Electricidad a gas.' },
  { id: 'central_biomasa', name: 'Central de biomasa', category: 'energia', cost: 1800000, slots: 3, power: 0, water: 400, storage: 5000, pollutionBase: 3, desc: 'Electricidad renovable.' },
  { id: 'parque_solar', name: 'Parque solar', category: 'energia', cost: 2200000, slots: 2, power: 0, water: 20, storage: 500, pollutionBase: 0, desc: 'Generación fotovoltaica.' },
  { id: 'parque_eolico', name: 'Parque eólico', category: 'energia', cost: 2800000, slots: 2, power: 0, water: 10, storage: 500, pollutionBase: 0, desc: 'Generación eólica.' },
  { id: 'electronica', name: 'Planta electrónica', category: 'alta_tech', cost: 3500000, slots: 10, power: 1200, water: 300, storage: 2000, pollutionBase: 2, desc: 'SMT y ensamblaje.' },
  { id: 'planta_automocion', name: 'Planta de automoción', category: 'alta_tech', cost: 8000000, slots: 12, power: 3000, water: 500, storage: 8000, pollutionBase: 5, desc: 'Montaje de vehículos.' },
  { id: 'planta_consumo', name: 'Planta de bienes de consumo', category: 'procesado', cost: 1500000, slots: 8, power: 800, water: 200, storage: 4000, pollutionBase: 2, desc: 'Electrodomésticos y similares.' },
  { id: 'almacen', name: 'Almacén logístico', category: 'logistica', cost: 180000, slots: 0, power: 40, water: 10, storage: 25000, pollutionBase: 0, desc: 'Almacenamiento por ubicación.' },
  { id: 'puerto', name: 'Terminal portuaria', category: 'logistica', cost: 2000000, slots: 2, power: 400, water: 100, storage: 50000, pollutionBase: 2, desc: 'Carga marítima.' },
  { id: 'terminal_ferroviaria', name: 'Terminal ferroviaria', category: 'logistica', cost: 900000, slots: 2, power: 200, water: 40, storage: 30000, pollutionBase: 1, desc: 'Carga ferroviaria.' },
  { id: 'centro_investigacion', name: 'Centro de I+D', category: 'investigacion', cost: 2500000, slots: 4, power: 300, water: 50, storage: 500, pollutionBase: 0, desc: 'Investigación tecnológica.' },
  { id: 'oficina', name: 'Sede corporativa', category: 'admin', cost: 500000, slots: 0, power: 50, water: 20, storage: 200, pollutionBase: 0, desc: 'Gestión y contratos.' },
];

const machines = [
  { id: 'trituradora', name: 'Trituradora', cost: 80000, power: 120, speed: 1, quality: 0 },
  { id: 'horno_arco', name: 'Horno de arco eléctrico', cost: 450000, power: 800, speed: 1.1, quality: 5 },
  { id: 'laminador', name: 'Laminador', cost: 380000, power: 600, speed: 1, quality: 3 },
  { id: 'unidad_destilacion', name: 'Unidad de destilación', cost: 900000, power: 500, speed: 1, quality: 2 },
  { id: 'horno_rotatorio', name: 'Horno rotatorio', cost: 700000, power: 900, speed: 0.9, quality: 0 },
  { id: 'molino_bolas', name: 'Molino de bolas', cost: 200000, power: 250, speed: 1, quality: 1 },
  { id: 'amasadora', name: 'Amasadora de hormigón', cost: 60000, power: 40, speed: 1.2, quality: 0 },
  { id: 'reactor_haber', name: 'Reactor Haber-Bosch', cost: 1200000, power: 1000, speed: 1, quality: 4 },
  { id: 'reactor_contacto', name: 'Reactor de contacto', cost: 500000, power: 300, speed: 1, quality: 2 },
  { id: 'celda_electrolisis', name: 'Celda de electrólisis', cost: 650000, power: 900, speed: 1, quality: 3 },
  { id: 'reactor_polimerizacion', name: 'Reactor de polimerización', cost: 800000, power: 500, speed: 1, quality: 4 },
  { id: 'reactor_generico', name: 'Reactor químico genérico', cost: 350000, power: 280, speed: 1, quality: 2 },
  { id: 'granulador', name: 'Granulador', cost: 280000, power: 180, speed: 1, quality: 1 },
  { id: 'reactor_farmaceutico', name: 'Reactor farmacéutico', cost: 1500000, power: 400, speed: 0.8, quality: 15 },
  { id: 'comprimidora', name: 'Comprimidora', cost: 400000, power: 80, speed: 1.5, quality: 10 },
  { id: 'molino_rodillos', name: 'Molino de rodillos', cost: 150000, power: 100, speed: 1, quality: 2 },
  { id: 'difusor', name: 'Difusor azucarero', cost: 320000, power: 200, speed: 1, quality: 1 },
  { id: 'prensa_aceite', name: 'Prensa de aceite', cost: 90000, power: 40, speed: 1, quality: 5 },
  { id: 'horno_vidrio', name: 'Horno de vidrio', cost: 950000, power: 1100, speed: 0.9, quality: 4 },
  { id: 'digestor', name: 'Digestor de pasta', cost: 600000, power: 400, speed: 1, quality: 1 },
  { id: 'maquina_papel', name: 'Máquina de papel', cost: 1100000, power: 500, speed: 1, quality: 3 },
  { id: 'troqueladora', name: 'Troqueladora', cost: 120000, power: 60, speed: 1.3, quality: 1 },
  { id: 'onduladora', name: 'Onduladora', cost: 280000, power: 150, speed: 1.1, quality: 1 },
  { id: 'hiladora', name: 'Hiladora', cost: 180000, power: 90, speed: 1, quality: 2 },
  { id: 'telar', name: 'Telar industrial', cost: 160000, power: 70, speed: 1, quality: 2 },
  { id: 'prensa_vulcanizado', name: 'Prensa de vulcanizado', cost: 250000, power: 160, speed: 1, quality: 3 },
  { id: 'horno_induccion', name: 'Horno de inducción', cost: 400000, power: 450, speed: 1.1, quality: 4 },
  { id: 'extrusora_reciclado', name: 'Extrusora de reciclado', cost: 220000, power: 180, speed: 1, quality: 0 },
  { id: 'pulper', name: 'Pulper', cost: 140000, power: 100, speed: 1, quality: 0 },
  { id: 'turbina_vapor', name: 'Turbina de vapor', cost: 2000000, power: 0, speed: 1, quality: 0 },
  { id: 'turbina_gas', name: 'Turbina de gas', cost: 2500000, power: 0, speed: 1, quality: 0 },
  { id: 'linea_smt', name: 'Línea SMT', cost: 1800000, power: 200, speed: 1.2, quality: 8 },
  { id: 'linea_ensamblaje', name: 'Línea de ensamblaje', cost: 1200000, power: 250, speed: 1, quality: 5 },
  { id: 'linea_montaje', name: 'Línea de montaje vehicular', cost: 5000000, power: 800, speed: 0.8, quality: 6 },
  { id: 'panel_fv', name: 'Campo fotovoltaico', cost: 800000, power: 0, speed: 1, quality: 0 },
  { id: 'aerogenerador', name: 'Aerogenerador', cost: 1200000, power: 0, speed: 1, quality: 0 },
  { id: 'extractor_minero', name: 'Extractor minero', cost: 150000, power: 150, speed: 1, quality: 0 },
  { id: 'bomba_extraccion', name: 'Bomba de extracción', cost: 200000, power: 180, speed: 1, quality: 0 },
  { id: 'cosechadora', name: 'Cosechadora industrial', cost: 100000, power: 50, speed: 1, quality: 2 },
];

// Extraction recipes for mines/farms
const extractables = [
  ...mineralDefs.map((m) => ({ item: m.name, building: m.name.includes('Petróleo') ? 'pozo_petroleo' : m.name.includes('Gas') ? 'pozo_gas' : 'mina', machine: m.name.includes('Petróleo') || m.name.includes('Gas') ? 'bomba_extraccion' : 'extractor_minero', qty: 1, time: 30 })),
  ...crops.filter((c) => !String(c[0]).includes('Madera') && !String(c[0]).includes('Carne') && !String(c[0]).includes('Leche')).slice(0, 30).map((c) => ({ item: c[0], building: 'granja', machine: 'cosechadora', qty: 1, time: 60 })),
  { item: 'Madera de pino', building: 'aserradero', machine: 'extractor_minero', qty: 1, time: 40 },
  { item: 'Madera de eucalipto', building: 'aserradero', machine: 'extractor_minero', qty: 1, time: 40 },
];

extractables.forEach((ex) => {
  if (!itemIndex.has(idify(ex.item))) return;
  addRecipe({
    name: `Extraer ${ex.item}`,
    building: ex.building,
    machine: ex.machine,
    inputs: [],
    outputs: [{ item: ensure(ex.item), qty: ex.qty }],
    byproducts: ex.building === 'mina' ? [{ item: ensure('Lodos industriales'), qty: 0.05 }] : [],
    energyKwh: 20,
    waterM3: ex.building === 'granja' ? 5 : 1,
    timeMinutes: ex.time,
    pollution: ex.building === 'mina' ? 3 : 0.5,
    qualityBase: 45,
  });
});

// Solar/wind power recipes
addRecipe({
  name: 'Generar electricidad solar',
  building: 'parque_solar',
  machine: 'panel_fv',
  inputs: [],
  outputs: [{ item: ensure('Electricidad'), qty: 800 }],
  energyKwh: 0,
  timeMinutes: 60,
  pollution: 0,
  tech: 'energia_renovable',
});
addRecipe({
  name: 'Generar electricidad eólica',
  building: 'parque_eolico',
  machine: 'aerogenerador',
  inputs: [],
  outputs: [{ item: ensure('Electricidad'), qty: 1200 }],
  energyKwh: 0,
  timeMinutes: 60,
  pollution: 0,
  tech: 'energia_renovable',
});

// ——— Tech tree ———
const techs = [
  { id: 'metalurgia_basica', name: 'Metalurgia básica', cost: 50000, time: 120, requires: [], desc: 'Fundición primaria.' },
  { id: 'metalurgia_avanzada', name: 'Metalurgia avanzada', cost: 200000, time: 300, requires: ['metalurgia_basica'], desc: 'Aleaciones y laminados.' },
  { id: 'aceros_especiales', name: 'Aceros especiales', cost: 500000, time: 480, requires: ['metalurgia_avanzada'], desc: 'Grados de acero avanzados.' },
  { id: 'refino_basico', name: 'Refino de petróleo', cost: 300000, time: 360, requires: [], desc: 'Destilación atmosférica.' },
  { id: 'cemento_basico', name: 'Tecnología del cemento', cost: 80000, time: 150, requires: [], desc: 'Clínker y cemento.' },
  { id: 'quimica_basica', name: 'Química básica', cost: 150000, time: 240, requires: [], desc: 'Ácidos, bases y gases.' },
  { id: 'polimeros', name: 'Polímeros', cost: 350000, time: 400, requires: ['quimica_basica'], desc: 'Plásticos de granel.' },
  { id: 'vidrio', name: 'Vidrio industrial', cost: 120000, time: 200, requires: [], desc: 'Float y templado.' },
  { id: 'papel', name: 'Industria papelera', cost: 140000, time: 220, requires: [], desc: 'Pasta y papel.' },
  { id: 'reciclaje', name: 'Reciclaje industrial', cost: 100000, time: 180, requires: [], desc: 'Economía circular.' },
  { id: 'energia_gas', name: 'Ciclo combinado', cost: 250000, time: 300, requires: [], desc: 'Electricidad a gas.' },
  { id: 'energia_renovable', name: 'Energías renovables', cost: 400000, time: 420, requires: [], desc: 'Solar, eólica y biomasa.' },
  { id: 'electronica_basica', name: 'Electrónica básica', cost: 500000, time: 500, requires: [], desc: 'SMT y PCB.' },
  { id: 'electronica_consumo', name: 'Electrónica de consumo', cost: 900000, time: 600, requires: ['electronica_basica'], desc: 'Dispositivos finales.' },
  { id: 'automocion', name: 'Automoción', cost: 1200000, time: 720, requires: ['metalurgia_avanzada', 'electronica_basica'], desc: 'Montaje de vehículos.' },
  { id: 'farma_basica', name: 'Farmacéutica básica', cost: 800000, time: 600, requires: ['quimica_basica'], desc: 'API y comprimidos.' },
  { id: 'agroquimica', name: 'Agroquímica', cost: 200000, time: 260, requires: ['quimica_basica'], desc: 'Fertilizantes y fitosanitarios.' },
  { id: 'caucho', name: 'Tecnología del caucho', cost: 180000, time: 240, requires: ['polimeros'], desc: 'Elastómeros y neumáticos.' },
  { id: 'bienes_consumo', name: 'Bienes de consumo', cost: 300000, time: 320, requires: ['electronica_basica'], desc: 'Electrodomésticos.' },
  { id: 'logistica_avanzada', name: 'Logística avanzada', cost: 220000, time: 280, requires: [], desc: 'Rutas intermodales eficientes.' },
  { id: 'automatizacion', name: 'Automatización industrial', cost: 600000, time: 480, requires: ['electronica_basica'], desc: 'Mayor velocidad y calidad.' },
  { id: 'calidad_six_sigma', name: 'Six Sigma industrial', cost: 450000, time: 400, requires: ['automatizacion'], desc: 'Calidad profunda.' },
  { id: 'finanzas_corporativas', name: 'Finanzas corporativas', cost: 100000, time: 120, requires: [], desc: 'Mejores préstamos y rating.' },
  { id: 'comercio_global', name: 'Comercio global', cost: 350000, time: 360, requires: ['logistica_avanzada'], desc: 'Aranceles reducidos.' },
];

// ——— Locations (world industrial hubs) ———
const locations = [
  { id: 'madrid', name: 'Madrid', country: 'España', region: 'Europa', lat: 40.4168, lng: -3.7038, type: 'hub', tariffs: 0.05, laborCost: 1.0, energyCost: 1.0 },
  { id: 'barcelona', name: 'Barcelona', country: 'España', region: 'Europa', lat: 41.3874, lng: 2.1686, type: 'port', tariffs: 0.05, laborCost: 1.05, energyCost: 1.05 },
  { id: 'bilbao', name: 'Bilbao', country: 'España', region: 'Europa', lat: 43.263, lng: -2.935, type: 'industrial', tariffs: 0.05, laborCost: 1.02, energyCost: 0.95 },
  { id: 'valencia', name: 'Valencia', country: 'España', region: 'Europa', lat: 39.4699, lng: -0.3763, type: 'port', tariffs: 0.05, laborCost: 0.95, energyCost: 1.0 },
  { id: 'sevilla', name: 'Sevilla', country: 'España', region: 'Europa', lat: 37.3891, lng: -5.9845, type: 'agro', tariffs: 0.05, laborCost: 0.9, energyCost: 1.05 },
  { id: 'huelva', name: 'Huelva', country: 'España', region: 'Europa', lat: 37.2614, lng: -6.9447, type: 'mining', tariffs: 0.05, laborCost: 0.88, energyCost: 0.9 },
  { id: 'gijon', name: 'Gijón', country: 'España', region: 'Europa', lat: 43.5322, lng: -5.6611, type: 'industrial', tariffs: 0.05, laborCost: 0.92, energyCost: 0.85 },
  { id: 'zaragoza', name: 'Zaragoza', country: 'España', region: 'Europa', lat: 41.6488, lng: -0.8891, type: 'logistics', tariffs: 0.05, laborCost: 0.93, energyCost: 1.0 },
  { id: 'lisboa', name: 'Lisboa', country: 'Portugal', region: 'Europa', lat: 38.7223, lng: -9.1393, type: 'port', tariffs: 0.05, laborCost: 0.85, energyCost: 1.1 },
  { id: 'paris', name: 'París', country: 'Francia', region: 'Europa', lat: 48.8566, lng: 2.3522, type: 'hub', tariffs: 0.06, laborCost: 1.25, energyCost: 1.15 },
  { id: 'lyon', name: 'Lyon', country: 'Francia', region: 'Europa', lat: 45.764, lng: 4.8357, type: 'industrial', tariffs: 0.06, laborCost: 1.15, energyCost: 1.1 },
  { id: 'ruhr', name: 'Cuenca del Ruhr', country: 'Alemania', region: 'Europa', lat: 51.4556, lng: 7.0116, type: 'industrial', tariffs: 0.06, laborCost: 1.3, energyCost: 1.2 },
  { id: 'hamburgo', name: 'Hamburgo', country: 'Alemania', region: 'Europa', lat: 53.5511, lng: 9.9937, type: 'port', tariffs: 0.06, laborCost: 1.28, energyCost: 1.15 },
  { id: 'rotterdam', name: 'Róterdam', country: 'Países Bajos', region: 'Europa', lat: 51.9244, lng: 4.4777, type: 'port', tariffs: 0.05, laborCost: 1.35, energyCost: 1.25 },
  { id: 'amberes', name: 'Amberes', country: 'Bélgica', region: 'Europa', lat: 51.2194, lng: 4.4025, type: 'port', tariffs: 0.05, laborCost: 1.3, energyCost: 1.2 },
  { id: 'milan', name: 'Milán', country: 'Italia', region: 'Europa', lat: 45.4642, lng: 9.19, type: 'industrial', tariffs: 0.07, laborCost: 1.15, energyCost: 1.3 },
  { id: 'genova', name: 'Génova', country: 'Italia', region: 'Europa', lat: 44.4056, lng: 8.9463, type: 'port', tariffs: 0.07, laborCost: 1.1, energyCost: 1.25 },
  { id: 'london', name: 'Londres', country: 'Reino Unido', region: 'Europa', lat: 51.5074, lng: -0.1278, type: 'hub', tariffs: 0.08, laborCost: 1.4, energyCost: 1.35 },
  { id: 'gdansk', name: 'Gdansk', country: 'Polonia', region: 'Europa', lat: 54.352, lng: 18.6466, type: 'port', tariffs: 0.04, laborCost: 0.7, energyCost: 0.9 },
  { id: 'katowice', name: 'Katowice', country: 'Polonia', region: 'Europa', lat: 50.2649, lng: 19.0238, type: 'industrial', tariffs: 0.04, laborCost: 0.68, energyCost: 0.85 },
  { id: 'estambul', name: 'Estambul', country: 'Turquía', region: 'Europa', lat: 41.0082, lng: 28.9784, type: 'hub', tariffs: 0.1, laborCost: 0.55, energyCost: 0.8 },
  { id: 'moscu', name: 'Moscú', country: 'Rusia', region: 'Europa', lat: 55.7558, lng: 37.6173, type: 'hub', tariffs: 0.12, laborCost: 0.5, energyCost: 0.6 },
  { id: 'dubai', name: 'Dubái', country: 'EAU', region: 'Asia', lat: 25.2048, lng: 55.2708, type: 'port', tariffs: 0.03, laborCost: 0.9, energyCost: 0.5 },
  { id: 'riyadh', name: 'Riad', country: 'Arabia Saudí', region: 'Asia', lat: 24.7136, lng: 46.6753, type: 'energy', tariffs: 0.04, laborCost: 0.7, energyCost: 0.35 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', region: 'Asia', lat: 19.076, lng: 72.8777, type: 'hub', tariffs: 0.11, laborCost: 0.35, energyCost: 0.7 },
  { id: 'singapur', name: 'Singapur', country: 'Singapur', region: 'Asia', lat: 1.3521, lng: 103.8198, type: 'port', tariffs: 0.02, laborCost: 1.1, energyCost: 1.0 },
  { id: 'shanghai', name: 'Shanghái', country: 'China', region: 'Asia', lat: 31.2304, lng: 121.4737, type: 'port', tariffs: 0.09, laborCost: 0.55, energyCost: 0.75 },
  { id: 'shenzhen', name: 'Shenzhen', country: 'China', region: 'Asia', lat: 22.5431, lng: 114.0579, type: 'electronics', tariffs: 0.09, laborCost: 0.6, energyCost: 0.8 },
  { id: 'tokio', name: 'Tokio', country: 'Japón', region: 'Asia', lat: 35.6762, lng: 139.6503, type: 'hub', tariffs: 0.07, laborCost: 1.45, energyCost: 1.4 },
  { id: 'seul', name: 'Seúl', country: 'Corea del Sur', region: 'Asia', lat: 37.5665, lng: 126.978, type: 'electronics', tariffs: 0.07, laborCost: 1.2, energyCost: 1.15 },
  { id: 'newyork', name: 'Nueva York', country: 'EE.UU.', region: 'América', lat: 40.7128, lng: -74.006, type: 'hub', tariffs: 0.08, laborCost: 1.5, energyCost: 1.2 },
  { id: 'houston', name: 'Houston', country: 'EE.UU.', region: 'América', lat: 29.7604, lng: -95.3698, type: 'energy', tariffs: 0.08, laborCost: 1.3, energyCost: 0.7 },
  { id: 'detroit', name: 'Detroit', country: 'EE.UU.', region: 'América', lat: 42.3314, lng: -83.0458, type: 'industrial', tariffs: 0.08, laborCost: 1.25, energyCost: 0.95 },
  { id: 'chicago', name: 'Chicago', country: 'EE.UU.', region: 'América', lat: 41.8781, lng: -87.6298, type: 'logistics', tariffs: 0.08, laborCost: 1.28, energyCost: 1.0 },
  { id: 'sao_paulo', name: 'São Paulo', country: 'Brasil', region: 'América', lat: 23.5558, lng: -46.6396, type: 'hub', tariffs: 0.12, laborCost: 0.6, energyCost: 0.85 },
  { id: 'santos', name: 'Santos', country: 'Brasil', region: 'América', lat: -23.9608, lng: -46.3336, type: 'port', tariffs: 0.12, laborCost: 0.55, energyCost: 0.85 },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', region: 'América', lat: -34.6037, lng: -58.3816, type: 'agro', tariffs: 0.13, laborCost: 0.5, energyCost: 0.7 },
  { id: 'santiago', name: 'Santiago', country: 'Chile', region: 'América', lat: -33.4489, lng: -70.6693, type: 'mining', tariffs: 0.1, laborCost: 0.65, energyCost: 0.9 },
  { id: 'antofagasta', name: 'Antofagasta', country: 'Chile', region: 'América', lat: -23.6509, lng: -70.3975, type: 'mining', tariffs: 0.1, laborCost: 0.7, energyCost: 0.85 },
  { id: 'johannesburgo', name: 'Johannesburgo', country: 'Sudáfrica', region: 'África', lat: -26.2041, lng: 28.0473, type: 'mining', tariffs: 0.11, laborCost: 0.45, energyCost: 0.75 },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', region: 'África', lat: 6.5244, lng: 3.3792, type: 'energy', tariffs: 0.14, laborCost: 0.3, energyCost: 0.55 },
  { id: 'casablanca', name: 'Casablanca', country: 'Marruecos', region: 'África', lat: 33.5731, lng: -7.5898, type: 'port', tariffs: 0.09, laborCost: 0.4, energyCost: 0.8 },
  { id: 'sydney', name: 'Sídney', country: 'Australia', region: 'Oceanía', lat: -33.8688, lng: 151.2093, type: 'hub', tariffs: 0.07, laborCost: 1.35, energyCost: 1.1 },
  { id: 'perth', name: 'Perth', country: 'Australia', region: 'Oceanía', lat: -31.9505, lng: 115.8605, type: 'mining', tariffs: 0.07, laborCost: 1.4, energyCost: 0.95 },
];

// ——— Missions (thousands via templates) ———
const missionTemplates = [];
const missionGoals = [
  { type: 'produce', label: 'Producir' },
  { type: 'sell', label: 'Vender' },
  { type: 'stock', label: 'Acumular' },
  { type: 'build', label: 'Construir' },
  { type: 'research', label: 'Investigar' },
  { type: 'profit', label: 'Obtener beneficio' },
  { type: 'transport', label: 'Transportar' },
  { type: 'quality', label: 'Alcanzar calidad' },
  { type: 'employees', label: 'Contratar' },
  { type: 'locations', label: 'Expandirse a' },
];

const produceTargets = items.filter((i) => i.tier <= 4 && !i.isWaste && i.category !== 'energia').slice(0, 400);
let missionId = 0;
for (let chapter = 1; chapter <= 40; chapter++) {
  for (let n = 0; n < 80; n++) {
    missionId++;
    const goal = missionGoals[n % missionGoals.length];
    const target = produceTargets[(chapter * 80 + n) % produceTargets.length];
    const qty = Math.round(10 * chapter * (1 + (n % 5)));
    let title; let desc; let reward; let requirement;
    if (goal.type === 'produce') {
      title = `Cap. ${chapter}: ${goal.label} ${qty} ${target.unit} de ${target.name}`;
      requirement = { type: 'produce', item: target.id, qty };
      reward = { money: 5000 * chapter + qty * target.basePrice * 0.1, xp: 100 * chapter };
    } else if (goal.type === 'sell') {
      title = `Cap. ${chapter}: ${goal.label} ${qty} ${target.unit} de ${target.name}`;
      requirement = { type: 'sell', item: target.id, qty };
      reward = { money: 6000 * chapter, xp: 120 * chapter };
    } else if (goal.type === 'stock') {
      title = `Cap. ${chapter}: ${goal.label} ${qty} ${target.unit} de ${target.name}`;
      requirement = { type: 'stock', item: target.id, qty };
      reward = { money: 4000 * chapter, xp: 90 * chapter };
    } else if (goal.type === 'build') {
      const b = buildings[n % buildings.length];
      title = `Cap. ${chapter}: Construir ${b.name}`;
      requirement = { type: 'build', building: b.id, qty: 1 + Math.floor(chapter / 8) };
      reward = { money: b.cost * 0.15, xp: 150 * chapter };
    } else if (goal.type === 'research') {
      const t = techs[n % techs.length];
      title = `Cap. ${chapter}: Investigar ${t.name}`;
      requirement = { type: 'research', tech: t.id };
      reward = { money: 20000 * chapter, xp: 200 * chapter };
    } else if (goal.type === 'profit') {
      const amt = 50000 * chapter;
      title = `Cap. ${chapter}: Beneficio neto de ${amt.toLocaleString('es-ES')} €`;
      requirement = { type: 'profit', amount: amt };
      reward = { money: amt * 0.1, xp: 180 * chapter };
    } else if (goal.type === 'transport') {
      title = `Cap. ${chapter}: Transportar ${qty} ${target.unit} de ${target.name}`;
      requirement = { type: 'transport', item: target.id, qty };
      reward = { money: 7000 * chapter, xp: 110 * chapter };
    } else if (goal.type === 'quality') {
      const q = 50 + chapter * 2;
      title = `Cap. ${chapter}: Calidad ${q} en ${target.name}`;
      requirement = { type: 'quality', item: target.id, quality: q };
      reward = { money: 8000 * chapter, xp: 140 * chapter };
    } else if (goal.type === 'employees') {
      const emp = 10 * chapter;
      title = `Cap. ${chapter}: Contratar ${emp} empleados`;
      requirement = { type: 'employees', qty: emp };
      reward = { money: 3000 * chapter, xp: 80 * chapter };
    } else {
      const loc = locations[n % locations.length];
      title = `Cap. ${chapter}: Expandirse a ${loc.name}`;
      requirement = { type: 'locations', location: loc.id };
      reward = { money: 25000 * chapter, xp: 160 * chapter };
    }
    missionTemplates.push({
      id: `m_${missionId}`,
      chapter,
      order: n,
      title,
      description: `Misión de progresión ${missionId}. Completa el objetivo para avanzar en Industry Manager.`,
      requirement,
      reward,
      unlocks: missionId % 40 === 0 ? [techs[missionId % techs.length].id] : [],
    });
  }
}

// Competitors
const competitors = [
  { id: 'ai_iberia_steel', name: 'Iberia Steel S.A.', focus: 'metales', aggressiveness: 0.6, capital: 5000000 },
  { id: 'ai_eurochem', name: 'EuroChem Holdings', focus: 'quimicos', aggressiveness: 0.7, capital: 8000000 },
  { id: 'ai_medagro', name: 'Mediterránea Agro', focus: 'agricolas', aggressiveness: 0.4, capital: 2000000 },
  { id: 'ai_globalport', name: 'GlobalPort Logistics', focus: 'logistica', aggressiveness: 0.5, capital: 4000000 },
  { id: 'ai_voltpower', name: 'VoltPower Energy', focus: 'energia', aggressiveness: 0.65, capital: 6000000 },
  { id: 'ai_nexus_elec', name: 'Nexus Electronics', focus: 'electronica', aggressiveness: 0.8, capital: 7000000 },
  { id: 'ai_autobahn', name: 'Autobahn Motors', focus: 'bienes_capital', aggressiveness: 0.55, capital: 9000000 },
  { id: 'ai_greenloop', name: 'GreenLoop Recycling', focus: 'residuos', aggressiveness: 0.45, capital: 2500000 },
];

// Transport modes
const transportModes = [
  { id: 'camion', name: 'Camión', speedKmh: 70, costPerKmTon: 0.18, capacity: 24, unlock: null },
  { id: 'tren', name: 'Tren', speedKmh: 90, costPerKmTon: 0.08, capacity: 1000, unlock: 'logistica_avanzada' },
  { id: 'barco', name: 'Barco', speedKmh: 35, costPerKmTon: 0.03, capacity: 20000, unlock: 'logistica_avanzada' },
  { id: 'avion', name: 'Avión', speedKmh: 750, costPerKmTon: 1.2, capacity: 50, unlock: 'comercio_global' },
];

function writeJs(filename, exportName, data) {
  const file = path.join(outDir, filename);
  const json = JSON.stringify(data, null, 0);
  fs.writeFileSync(file, `/** Auto-generado — no editar a mano */\nwindow.IM_DATA = window.IM_DATA || {};\nwindow.IM_DATA.${exportName} = ${json};\n`);
  console.log('Wrote', filename, Array.isArray(data) ? data.length : typeof data);
}

fs.mkdirSync(outDir, { recursive: true });
writeJs('items.js', 'items', items);
writeJs('recipes.js', 'recipes', recipes);
writeJs('buildings.js', 'buildings', buildings);
writeJs('machines.js', 'machines', machines);
writeJs('techs.js', 'techs', techs);
writeJs('locations.js', 'locations', locations);
writeJs('missions.js', 'missions', missionTemplates);
writeJs('competitors.js', 'competitors', competitors);
writeJs('transport.js', 'transportModes', transportModes);

const summary = {
  items: items.length,
  recipes: recipes.length,
  buildings: buildings.length,
  machines: machines.length,
  techs: techs.length,
  locations: locations.length,
  missions: missionTemplates.length,
  competitors: competitors.length,
  categories: [...new Set(items.map((i) => i.category))],
};
fs.writeFileSync(path.join(outDir, 'summary.js'), `window.IM_DATA = window.IM_DATA || {};\nwindow.IM_DATA.summary = ${JSON.stringify(summary)};\n`);
console.log('SUMMARY', summary);