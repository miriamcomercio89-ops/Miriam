/** Productos con nombre e historia. El catálogo enorme sigue existiendo; la UI destaca estos. */

export const FEATURED = [
  {
    id: "plate-fe",
    blurb: "La placa de hierro es el ladrillo de España: cintas, hornos y casi todo nace aquí.",
    why: "Cimentación industrial.",
  },
  {
    id: "gear-basic",
    blurb: "Sin engranajes no hay movimiento. El primer pedido que entiende cualquier país.",
    why: "Mecánica básica.",
  },
  {
    id: "wire-cu",
    blurb: "El cobre conduce. Un cable barato electrifica un pueblo.",
    why: "Electricidad.",
  },
  {
    id: "glass-silica",
    blurb: "Vidrio de sílice: ventanas, laboratorios y lentes. El Mediterráneo siempre pide más.",
    why: "Construcción y ciencia.",
  },
  {
    id: "el-c",
    blurb: "Carbono: carbón para quemar y grafito para la química. El pulmón sucio de la fábrica.",
    why: "Energía y reductor.",
  },
  {
    id: "steel",
    blurb: "Hierro + carbono a lo bestia. Puentes, raíles, cascos. Alemania y Corea lo firman sin leer.",
    why: "Estructura.",
  },
  {
    id: "stainless",
    blurb: "Acero que no se oxida. Hospitales, cocinas, plantas químicas.",
    why: "Higiene e industria.",
  },
  {
    id: "bronze",
    blurb: "Cobre y estaño. Cojinetes, hélices, campanas. Viejo y todavía útil.",
    why: "Aleación clásica.",
  },
  {
    id: "brass",
    blurb: "Latón: grifería, instrumentos, cartuchos. Italia y Portugal lo piden por toneladas.",
    why: "Fontanería y máquina.",
  },
  {
    id: "h2so4",
    blurb: "El rey de los ácidos. Sin sulfúrico no hay fertilizante ni batería. Trátalo con respeto.",
    why: "Química pesada.",
  },
  {
    id: "hcl",
    blurb: "Ácido clorhídrico: limpia metales y abre puertas a las sales.",
    why: "Decapado.",
  },
  {
    id: "nh3",
    blurb: "Amoníaco: el invento que alimenta al mundo. India y Brasil lo convierten en trigo.",
    why: "Fertilizantes.",
  },
  {
    id: "hno3",
    blurb: "Nítrico: explosivos, tintes y purificación de metales nobles.",
    why: "Química fina.",
  },
  {
    id: "nacl",
    blurb: "Sal. Aburrida hasta que te falta. Conservas, cloro y sosa salen de aquí.",
    why: "Materia prima.",
  },
  {
    id: "naoh",
    blurb: "Sosa cáustica: jabón, papel, aluminio. El hidróxido que mueve fábricas.",
    why: "Álcali industrial.",
  },
  {
    id: "plastic-pe",
    blurb: "Polietileno: envases, tuberías, invernaderos. El plástico que todos odian y todos usan.",
    why: "Polímero de masas.",
  },
  {
    id: "nylon",
    blurb: "Nylon: redes, cuerdas, engranajes ligeros. Japón lo hiló primero.",
    why: "Fibra técnica.",
  },
  {
    id: "rubber",
    blurb: "Caucho sintético: ruedas y juntas. Sin esto se para el transporte.",
    why: "Movilidad.",
  },
  {
    id: "motor-basic",
    blurb: "Un motor pequeño. El paso de “tengo placas” a “la fábrica se mueve sola”.",
    why: "Automatización.",
  },
  {
    id: "silicon-wafer",
    blurb: "Oblea de silicio. Taiwán, Corea y EE. UU. se pelean por ellas. España también puede hacerlas.",
    why: "Semiconductores.",
  },
  {
    id: "circuit-basic",
    blurb: "El primer chip de verdad. Sensores, controladores, radios.",
    why: "Electrónica.",
  },
  {
    id: "circuit-advanced",
    blurb: "Circuito avanzado: oro, soldadura y paciencia. Vale más que su peso.",
    why: "Alta tecnología.",
  },
  {
    id: "battery-li",
    blurb: "Batería de litio. Coches, redes, móviles. Chile y Australia extraen el Li; tú lo ensamblas.",
    why: "Almacenar el sol.",
  },
  {
    id: "magnet-nd",
    blurb: "Imán de neodimio. Aerogeneradores y auriculares. China domina las tierras raras; un pedido tuyo cambia el tablero.",
    why: "Imanes permanentes.",
  },
  {
    id: "catalyst-pt",
    blurb: "Platino en polvo sobre alúmina. Un gramo acelera mil litros de reacción.",
    why: "Catálisis.",
  },
  {
    id: "duralumin",
    blurb: "Aluminio de avión. Ligero y tozudo. Airbus y Embraer son clientes naturales.",
    why: "Aeronáutica.",
  },
  {
    id: "titanium-alloy",
    blurb: "Titanio de grado médico y aeroespacial. Caro, ligero, no se rinde.",
    why: "Prestigio.",
  },
  {
    id: "pipe-basic",
    blurb: "Tubería de hierro. El agua y los ácidos tienen que ir a algún sitio.",
    why: "Fluidos.",
  },
  {
    id: "cao",
    blurb: "Cal viva: cemento, depuración, acero. El Mediterráneo se construye con esto.",
    why: "Construcción.",
  },
  {
    id: "fuel-u",
    blurb: "Combustible de uranio para reactores civiles. Francia y Suecia firman con letra pequeña.",
    why: "Energía nuclear.",
  },
  {
    id: "superwire",
    blurb: "Cable superconductor. Trenes, resonancias, redes sin pérdida. Todavía de laboratorio, ya de pedido.",
    why: "Frontera.",
  },
  {
    id: "sci-mining",
    blurb: "Ciencia de minería. El primer paquete que demuestra que España sabe extraer y fundir.",
    why: "Investigación.",
  },
];

export const FEATURED_BY_ID = Object.fromEntries(FEATURED.map((f) => [f.id, f]));
export const FEATURED_IDS = FEATURED.map((f) => f.id);

export const ORDER_POOL = [
  { id: "plate-fe", research: "start", min: 12, max: 40 },
  { id: "gear-basic", research: "start", min: 8, max: 24 },
  { id: "wire-cu", research: "start", min: 16, max: 40 },
  { id: "glass-silica", research: "start", min: 6, max: 20 },
  { id: "el-c", research: "start", min: 20, max: 50 },
  { id: "pipe-basic", research: "fluids", min: 8, max: 20 },
  { id: "motor-basic", research: "logistics", min: 4, max: 12 },
  { id: "steel", research: "steel", min: 8, max: 20 },
  { id: "bronze", research: "steel", min: 6, max: 16 },
  { id: "brass", research: "steel", min: 6, max: 16 },
  { id: "stainless", research: "steel", min: 4, max: 12 },
  { id: "h2so4", research: "chemistry", min: 6, max: 18 },
  { id: "nh3", research: "chemistry", min: 8, max: 20 },
  { id: "hcl", research: "chemistry", min: 8, max: 18 },
  { id: "nacl", research: "chemistry", min: 12, max: 30 },
  { id: "naoh", research: "electrolysis", min: 6, max: 16 },
  { id: "plastic-pe", research: "organics", min: 10, max: 24 },
  { id: "nylon", research: "polymers", min: 6, max: 14 },
  { id: "rubber", research: "polymers", min: 6, max: 14 },
  { id: "silicon-wafer", research: "solar", min: 4, max: 10 },
  { id: "circuit-basic", research: "electronics", min: 4, max: 12 },
  { id: "circuit-advanced", research: "electronics", min: 2, max: 6 },
  { id: "battery-li", research: "batteries", min: 3, max: 8 },
  { id: "magnet-nd", research: "rare-earths", min: 2, max: 6 },
  { id: "catalyst-pt", research: "catalysis", min: 1, max: 4 },
  { id: "duralumin", research: "steel", min: 6, max: 14 },
  { id: "fuel-u", research: "nuclear", min: 1, max: 4 },
  { id: "superwire", research: "superconductors", min: 1, max: 3 },
];
