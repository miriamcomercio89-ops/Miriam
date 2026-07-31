/**
 * Operadores del Reino Unido: actuales, futuros e inventados (nombres inventados en español).
 */
export const lands = [
  { id: "lon", nombre: "Gran Londres", capital: "Londres" },
  { id: "se", nombre: "Sudeste de Inglaterra", capital: "Reading" },
  { id: "sw", nombre: "Sudoeste de Inglaterra", capital: "Bristol" },
  { id: "ee", nombre: "Este de Inglaterra", capital: "Cambridge" },
  { id: "em", nombre: "Midlands Orientales", capital: "Nottingham" },
  { id: "wm", nombre: "Midlands Occidentales", capital: "Birmingham" },
  { id: "nw", nombre: "Noroeste de Inglaterra", capital: "Manchester" },
  { id: "ne", nombre: "Noreste de Inglaterra", capital: "Newcastle" },
  { id: "yh", nombre: "Yorkshire y Humber", capital: "Leeds" },
  { id: "sct", nombre: "Escocia", capital: "Edimburgo" },
  { id: "wls", nombre: "Gales", capital: "Cardiff" },
  { id: "nir", nombre: "Irlanda del Norte", capital: "Belfast" },
];

const ALL = lands.map((l) => l.id);
const GB = ALL.filter((id) => id !== "nir");

const C = {
  red: "#C8102E", navy: "#003865", purple: "#6B2D5B", teal: "#007A7A", orange: "#E87722",
  green: "#1B7A3D", blue: "#0057B8", yellow: "#F2A900", black: "#111827", pink: "#D5006D",
  cyan: "#0097A7", brown: "#6D4C41", lime: "#7CB342", indigo: "#3949AB", coral: "#EF5350",
  slate: "#455A64", wine: "#8E1B3D", forest: "#2E7D32", sky: "#039BE5", gold: "#C9A227",
};

function op(partial) {
  return {
    color_secundario: "#FFFFFF",
    competencia: "dominante",
    logo_estilo: "barra",
    eslogan: "",
    ...partial,
  };
}

/** Actuales (TOCs, open access, metro/tranvía UK) */
const actuales = [
  op({ id: "awc", nombre: "Avanti West Coast", nombre_corto: "AWC", tipo: "nacional", estado: "actual", color: "#6B2D5B", lands: ["lon", "wm", "nw", "sct"], sede: "Londres Euston", servicios: ["av", "ld", "px"], eslogan: "West Coast mainline", logo_estilo: "flecha" }),
  op({ id: "c2c", nombre: "c2c", nombre_corto: "C2C", tipo: "regional", estado: "actual", color: "#B3001B", lands: ["lon", "ee"], sede: "Londres Fenchurch Street", servicios: ["re", "rb", "s"], eslogan: "Essex Thameside" }),
  op({ id: "chl", nombre: "Chiltern Railways", nombre_corto: "CHL", tipo: "regional", estado: "actual", color: "#00A3E0", lands: ["lon", "se", "wm"], sede: "Londres Marylebone", servicios: ["ld", "re", "rb"], logo_estilo: "valle" }),
  op({ id: "xc", nombre: "CrossCountry", nombre_corto: "XC", tipo: "nacional", estado: "actual", color: "#8C1D40", lands: GB, sede: "Birmingham New Street", servicios: ["ld", "ir", "px"], competencia: "competitiva", logo_estilo: "malla" }),
  op({ id: "emr", nombre: "East Midlands Railway", nombre_corto: "EMR", tipo: "regional", estado: "actual", color: "#6F2C91", lands: ["lon", "em", "wm", "yh"], sede: "Derby", servicios: ["ld", "re", "rb"] }),
  op({ id: "gex", nombre: "Gatwick Express", nombre_corto: "GX", tipo: "especializado", estado: "actual", color: "#EE3124", lands: ["lon", "se"], sede: "Londres Victoria", servicios: ["ae", "px"], competencia: "nicho", logo_estilo: "ala" }),
  op({ id: "gc", nombre: "Grand Central", nombre_corto: "GC", tipo: "nacional", estado: "actual", color: "#000000", color_secundario: "#F2A900", lands: ["lon", "yh", "ne"], sede: "York", servicios: ["ld", "px"], competencia: "competitiva", logo_estilo: "diamante" }),
  op({ id: "gn", nombre: "Great Northern", nombre_corto: "GN", tipo: "regional", estado: "actual", color: "#4B2E83", lands: ["lon", "ee", "em"], sede: "Londres King's Cross", servicios: ["re", "rb", "s"] }),
  op({ id: "gwr", nombre: "Great Western Railway", nombre_corto: "GWR", tipo: "nacional", estado: "actual", color: "#0A2240", color_secundario: "#F2A900", lands: ["lon", "se", "sw", "wls"], sede: "Swindon", servicios: ["av", "ld", "re", "rb", "n"], logo_estilo: "escudo" }),
  op({ id: "ga", nombre: "Greater Anglia", nombre_corto: "GA", tipo: "regional", estado: "actual", color: "#D5002B", lands: ["lon", "ee"], sede: "Londres Liverpool Street", servicios: ["ld", "re", "rb", "ae"] }),
  op({ id: "hx", nombre: "Heathrow Express", nombre_corto: "HX", tipo: "especializado", estado: "actual", color: "#532E8E", lands: ["lon"], sede: "Londres Paddington", servicios: ["ae"], competencia: "nicho", logo_estilo: "ala" }),
  op({ id: "ht", nombre: "Hull Trains", nombre_corto: "HT", tipo: "nacional", estado: "actual", color: "#E87722", lands: ["lon", "em", "yh"], sede: "Hull", servicios: ["ld", "px"], competencia: "competitiva" }),
  op({ id: "lner", nombre: "LNER", nombre_corto: "LNER", tipo: "nacional", estado: "actual", color: "#C8102E", lands: ["lon", "ee", "yh", "ne", "sct"], sede: "York", servicios: ["av", "ld", "px"], logo_estilo: "flecha" }),
  op({ id: "lnw", nombre: "London Northwestern Railway", nombre_corto: "LNW", tipo: "regional", estado: "actual", color: "#00A3A1", lands: ["lon", "se", "wm", "nw"], sede: "Birmingham", servicios: ["re", "rb", "ld"] }),
  op({ id: "mer", nombre: "Merseyrail", nombre_corto: "MER", tipo: "metropolitano", estado: "actual", color: "#FFD100", color_secundario: "#111827", lands: ["nw"], sede: "Liverpool", servicios: ["s", "or", "rb"], logo_estilo: "anillo" }),
  op({ id: "nor", nombre: "Northern", nombre_corto: "NOR", tipo: "regional", estado: "actual", color: "#000066", lands: ["nw", "yh", "ne", "em"], sede: "York", servicios: ["re", "rb", "rl", "s"] }),
  op({ id: "sco", nombre: "ScotRail", nombre_corto: "SCO", tipo: "regional", estado: "actual", color: "#001E60", color_secundario: "#5BC2E7", lands: ["sct"], sede: "Glasgow", servicios: ["ld", "re", "rb", "rl", "s"], logo_estilo: "ola" }),
  op({ id: "se", nombre: "Southeastern", nombre_corto: "SE", tipo: "regional", estado: "actual", color: "#00AEEF", lands: ["lon", "se"], sede: "Londres", servicios: ["av", "re", "rb", "s"] }),
  op({ id: "sn", nombre: "Southern", nombre_corto: "SN", tipo: "regional", estado: "actual", color: "#8CC63F", lands: ["lon", "se"], sede: "Croydon", servicios: ["re", "rb", "s", "ae"] }),
  op({ id: "swr", nombre: "South Western Railway", nombre_corto: "SWR", tipo: "regional", estado: "actual", color: "#EE3124", lands: ["lon", "se", "sw"], sede: "Londres Waterloo", servicios: ["ld", "re", "rb", "s"] }),
  op({ id: "tl", nombre: "Thameslink", nombre_corto: "TL", tipo: "metropolitano", estado: "actual", color: "#FF5A00", lands: ["lon", "se", "ee"], sede: "Londres", servicios: ["s", "mc", "re", "or"], logo_estilo: "rio" }),
  op({ id: "tpe", nombre: "TransPennine Express", nombre_corto: "TPE", tipo: "nacional", estado: "actual", color: "#00ADEF", lands: ["nw", "yh", "ne", "sct"], sede: "Manchester", servicios: ["ld", "ir", "px"], competencia: "competitiva" }),
  op({ id: "tfw", nombre: "Transport for Wales", nombre_corto: "TFW", tipo: "regional", estado: "actual", color: "#E31C3D", lands: ["wls", "wm", "nw"], sede: "Cardiff", servicios: ["ld", "re", "rb", "rl"], logo_estilo: "dragon" }),
  op({ id: "wmr", nombre: "West Midlands Railway", nombre_corto: "WMR", tipo: "regional", estado: "actual", color: "#F57C28", lands: ["wm"], sede: "Birmingham", servicios: ["re", "rb", "s"] }),
  op({ id: "liz", nombre: "Elizabeth line", nombre_corto: "LIZ", tipo: "metropolitano", estado: "actual", color: "#6950A1", lands: ["lon", "se", "ee"], sede: "Londres", servicios: ["s", "mc", "ae"], logo_estilo: "anillo" }),
  op({ id: "lo", nombre: "London Overground", nombre_corto: "LO", tipo: "metropolitano", estado: "actual", color: "#EE7C0E", lands: ["lon"], sede: "Londres", servicios: ["s", "or", "mc"], logo_estilo: "anillo" }),
  op({ id: "csl", nombre: "Caledonian Sleeper", nombre_corto: "CSL", tipo: "especializado", estado: "actual", color: "#003865", color_secundario: "#C9A227", lands: ["lon", "nw", "sct"], sede: "Inverness", servicios: ["n"], competencia: "nicho", logo_estilo: "luna" }),
  op({ id: "lumo", nombre: "Lumo", nombre_corto: "LUMO", tipo: "nacional", estado: "actual", color: "#00C7B1", lands: ["lon", "ne", "sct"], sede: "Newcastle", servicios: ["ld", "px"], competencia: "competitiva", logo_estilo: "rayo" }),
  op({ id: "eur", nombre: "Eurostar", nombre_corto: "EUR", tipo: "internacional", estado: "actual", color: "#001F5B", color_secundario: "#FFD100", lands: ["lon", "se"], sede: "Londres St Pancras", servicios: ["av", "ld"], competencia: "nicho", logo_estilo: "estrella" }),
  op({ id: "stx", nombre: "Stansted Express", nombre_corto: "STX", tipo: "especializado", estado: "actual", color: "#6CACE4", lands: ["lon", "ee"], sede: "Londres Liverpool Street", servicios: ["ae"], competencia: "nicho", logo_estilo: "ala" }),
  op({ id: "nir", nombre: "NI Railways", nombre_corto: "NIR", tipo: "regional", estado: "actual", color: "#0072CE", lands: ["nir"], sede: "Belfast", servicios: ["ld", "re", "rb", "s"] }),
  op({ id: "lu", nombre: "London Underground", nombre_corto: "LU", tipo: "urbano", estado: "actual", color: "#E32017", lands: ["lon"], sede: "Londres", servicios: ["u"], logo_estilo: "anillo" }),
  op({ id: "dlr", nombre: "Docklands Light Railway", nombre_corto: "DLR", tipo: "urbano", estado: "actual", color: "#00A4A7", lands: ["lon"], sede: "Londres", servicios: ["u", "t"], logo_estilo: "hex" }),
  op({ id: "ltr", nombre: "London Trams", nombre_corto: "LTR", tipo: "urbano", estado: "actual", color: "#84B817", lands: ["lon"], sede: "Croydon", servicios: ["t"], logo_estilo: "t" }),
  op({ id: "mm", nombre: "Manchester Metrolink", nombre_corto: "MM", tipo: "urbano", estado: "actual", color: "#FFCC00", color_secundario: "#111827", lands: ["nw"], sede: "Manchester", servicios: ["t", "tt"], logo_estilo: "t" }),
  op({ id: "sst", nombre: "Sheffield Supertram", nombre_corto: "SST", tipo: "urbano", estado: "actual", color: "#6B2D5B", lands: ["yh"], sede: "Sheffield", servicios: ["t", "tt"] }),
  op({ id: "net", nombre: "Nottingham Express Transit", nombre_corto: "NET", tipo: "urbano", estado: "actual", color: "#00ADEF", lands: ["em"], sede: "Nottingham", servicios: ["t"] }),
  op({ id: "wmm", nombre: "West Midlands Metro", nombre_corto: "WMM", tipo: "urbano", estado: "actual", color: "#F57C28", lands: ["wm"], sede: "Birmingham", servicios: ["t", "tt"] }),
  op({ id: "edt", nombre: "Edinburgh Trams", nombre_corto: "EDT", tipo: "urbano", estado: "actual", color: "#8A1538", lands: ["sct"], sede: "Edimburgo", servicios: ["t", "ae"] }),
  op({ id: "twm", nombre: "Tyne and Wear Metro", nombre_corto: "TWM", tipo: "urbano", estado: "actual", color: "#F2A900", color_secundario: "#111827", lands: ["ne"], sede: "Newcastle", servicios: ["u", "s"], logo_estilo: "u" }),
  op({ id: "gls", nombre: "Glasgow Subway", nombre_corto: "GLS", tipo: "urbano", estado: "actual", color: "#F57C28", lands: ["sct"], sede: "Glasgow", servicios: ["u"], logo_estilo: "anillo" }),
  op({ id: "btr", nombre: "Blackpool Tramway", nombre_corto: "BTR", tipo: "urbano", estado: "actual", color: "#E31C3D", lands: ["nw"], sede: "Blackpool", servicios: ["t", "tur"], competencia: "nicho" }),
  op({ id: "isl", nombre: "Island Line", nombre_corto: "ISL", tipo: "regional", estado: "actual", color: "#EE3124", lands: ["se"], sede: "Ryde", servicios: ["rb", "rl"], competencia: "nicho", logo_estilo: "ola" }),
];

/** Futuros / en transición */
const futuros = [
  op({ id: "gbr", nombre: "Great British Railways", nombre_corto: "GBR", tipo: "nacional", estado: "futuro", color: "#012169", color_secundario: "#C8102E", lands: GB, sede: "Derby", servicios: ["av", "ld", "ir", "re", "px"], eslogan: "La red nacional unificada", logo_estilo: "escudo", competencia: "dominante" }),
  op({ id: "hs2", nombre: "HS2 High Speed", nombre_corto: "HS2", tipo: "nacional", estado: "futuro", color: "#00A19A", lands: ["lon", "wm", "nw"], sede: "Birmingham Curzon Street", servicios: ["av", "px"], eslogan: "Alta velocidad británica", logo_estilo: "rayo", competencia: "nicho" }),
  op({ id: "gtr", nombre: "Greater Thameslink Railway", nombre_corto: "GTR", tipo: "metropolitano", estado: "futuro", color: "#6C3A00", lands: ["lon", "se", "ee"], sede: "Londres", servicios: ["s", "re", "ae", "mc"], eslogan: "Marca unificada Thameslink/Southern/GN/GX" }),
  op({ id: "nrc", nombre: "Northern Regional Combine", nombre_corto: "NRC", tipo: "regional", estado: "futuro", color: "#1A237E", lands: ["nw", "yh", "ne"], sede: "Leeds", servicios: ["re", "rb", "s", "ir"], eslogan: "Integración del norte" }),
  op({ id: "wcr", nombre: "West Coast Regional", nombre_corto: "WCR", tipo: "regional", estado: "futuro", color: "#4A148C", lands: ["lon", "wm", "nw"], sede: "Crewe", servicios: ["re", "rb", "ld"], eslogan: "Servicios locales West Coast" }),
  op({ id: "oas", nombre: "Open Access South", nombre_corto: "OAS", tipo: "nacional", estado: "futuro", color: "#BF360C", lands: ["lon", "se", "sw"], sede: "Reading", servicios: ["ld", "px"], competencia: "competitiva", eslogan: "Nuevos operadores abiertos al sur" }),
  op({ id: "oan", nombre: "Open Access North", nombre_corto: "OAN", tipo: "nacional", estado: "futuro", color: "#00695C", lands: ["lon", "yh", "ne", "sct"], sede: "York", servicios: ["ld", "px"], competencia: "competitiva" }),
  op({ id: "cym", nombre: "Cymru Express Futuro", nombre_corto: "CYM", tipo: "regional", estado: "futuro", color: "#7B1FA2", lands: ["wls", "nw", "wm"], sede: "Cardiff", servicios: ["ld", "re", "av"], eslogan: "Gales de alta conectividad" }),
  op({ id: "sco2", nombre: "ScotRail Express 2030", nombre_corto: "SX3", tipo: "regional", estado: "futuro", color: "#0D47A1", lands: ["sct"], sede: "Edimburgo", servicios: ["ld", "re", "av"], eslogan: "Escocia más rápida" }),
  op({ id: "nir2", nombre: "Belfast Metro Rail", nombre_corto: "BMR", tipo: "metropolitano", estado: "futuro", color: "#1565C0", lands: ["nir"], sede: "Belfast", servicios: ["s", "u", "t"], eslogan: "Red metropolitana de Belfast" }),
];

/** Inventados — nombres en español, operación en UK */
const inventados = [
  op({ id: "raf", nombre: "Rápidos del Támesis", nombre_corto: "RDT", tipo: "nacional", estado: "inventado", color: "#0B3D91", lands: ["lon", "se", "ee"], sede: "Londres", servicios: ["av", "ld", "px"], competencia: "competitiva", logo_estilo: "rio" }),
  op({ id: "exc", nombre: "Expreso Caledonio", nombre_corto: "EXC", tipo: "nacional", estado: "inventado", color: "#1B4F72", lands: ["sct", "ne", "lon"], sede: "Edimburgo", servicios: ["ld", "px", "n"], competencia: "competitiva", logo_estilo: "pico" }),
  op({ id: "cdn", nombre: "Corredores del Norte", nombre_corto: "CDN", tipo: "nacional", estado: "inventado", color: "#0E4D64", lands: ["nw", "yh", "ne", "sct"], sede: "Manchester", servicios: ["ld", "ir", "px"], competencia: "competitiva", logo_estilo: "ola" }),
  op({ id: "vrp", nombre: "VeloRápido Británico", nombre_corto: "VRB", tipo: "nacional", estado: "inventado", color: "#B71C1C", lands: ["lon", "wm", "nw", "yh"], sede: "Birmingham", servicios: ["av", "px"], competencia: "nicho", logo_estilo: "rayo" }),
  op({ id: "lma", nombre: "Líneas Maestras UK", nombre_corto: "LMU", tipo: "nacional", estado: "inventado", color: "#37474F", lands: GB, sede: "Derby", servicios: ["ld", "ir"], competencia: "competitiva", logo_estilo: "malla" }),
  op({ id: "ica", nombre: "InterCiudades Británicas", nombre_corto: "ICB", tipo: "nacional", estado: "inventado", color: "#00695C", lands: GB, sede: "York", servicios: ["ld", "ir", "re"], competencia: "competitiva", logo_estilo: "circulos" }),
  op({ id: "noc", nombre: "Nocturno Insular", nombre_corto: "NOI", tipo: "especializado", estado: "inventado", color: "#1A237E", color_secundario: "#F2A900", lands: GB, sede: "Londres", servicios: ["n"], competencia: "nicho", logo_estilo: "luna" }),
  op({ id: "peu", nombre: "Puente Europeo UK", nombre_corto: "PEU", tipo: "internacional", estado: "inventado", color: "#1565C0", lands: ["lon", "se"], sede: "Ashford", servicios: ["av", "ld"], competencia: "nicho", logo_estilo: "puente" }),
  op({ id: "aex", nombre: "AeroEnlace Británico", nombre_corto: "AEB", tipo: "especializado", estado: "inventado", color: "#004D40", lands: ["lon", "se", "nw", "sct", "wm"], sede: "Heathrow", servicios: ["ae", "px"], competencia: "nicho", logo_estilo: "ala" }),
  op({ id: "pan", nombre: "Panorámicos Británicos", nombre_corto: "PAB", tipo: "especializado", estado: "inventado", color: "#33691E", lands: ["sct", "wls", "sw", "nw"], sede: "Fort William", servicios: ["tur", "rl"], competencia: "nicho", logo_estilo: "marco" }),
  op({ id: "lib", nombre: "Líneas Libres UK", nombre_corto: "LLU", tipo: "nacional", estado: "inventado", color: "#E65100", lands: GB, sede: "Londres", servicios: ["ld", "px", "ir"], competencia: "competitiva", logo_estilo: "rayo" }),
  op({ id: "via", nombre: "Vía Abierta Regional", nombre_corto: "VAR", tipo: "regional", estado: "inventado", color: "#5D4037", lands: ["em", "wm", "yh", "nw"], sede: "Sheffield", servicios: ["re", "rb", "ir"], competencia: "competitiva", logo_estilo: "flecha" }),
  op({ id: "nex", nombre: "Nexo Ciudades UK", nombre_corto: "NEX", tipo: "nacional", estado: "inventado", color: "#263238", lands: ["lon", "wm", "nw", "yh", "sct"], sede: "Birmingham", servicios: ["px", "ld", "ae"], competencia: "competitiva", logo_estilo: "diamante" }),
  op({ id: "uni", nombre: "Universidad Express UK", nombre_corto: "UEX", tipo: "especializado", estado: "inventado", color: "#4E342E", lands: ["lon", "ee", "em", "wm", "sct"], sede: "Cambridge", servicios: ["re", "ir", "mc"], competencia: "nicho", logo_estilo: "libro" }),
  op({ id: "fer", nombre: "Feria y Congresos Rail", nombre_corto: "FCR", tipo: "especializado", estado: "inventado", color: "#880E4F", lands: ["lon", "wm", "nw", "sct"], sede: "Birmingham", servicios: ["px", "ae", "ld"], competencia: "nicho", logo_estilo: "hex" }),
  op({ id: "val", nombre: "Valles Verdes UK", nombre_corto: "VVU", tipo: "regional", estado: "inventado", color: "#1B5E20", lands: ["wls", "sw", "nw", "sct"], sede: "Swansea", servicios: ["rl", "rb", "tur"], competencia: "nicho", logo_estilo: "hoja" }),
  op({ id: "cos", nombre: "Costa a Costa Británica", nombre_corto: "CAC", tipo: "especializado", estado: "inventado", color: "#006064", lands: ["nw", "yh", "ne", "sct"], sede: "Carlisle", servicios: ["tur", "ir", "ld"], competencia: "nicho", logo_estilo: "ola" }),
  op({ id: "mid", nombre: "Mediodía Inglés", nombre_corto: "MDI", tipo: "regional", estado: "inventado", color: "#BF360C", lands: ["sw", "se", "lon"], sede: "Exeter", servicios: ["re", "rb", "ir", "ld"], competencia: "competitiva", logo_estilo: "sol" }),
  op({ id: "ang", nombre: "Anglia Conecta", nombre_corto: "ANC", tipo: "regional", estado: "inventado", color: "#AD1457", lands: ["ee", "lon"], sede: "Norwich", servicios: ["re", "rb", "rl"], competencia: "competitiva" }),
  op({ id: "ken", nombre: "Kent Rápido", nombre_corto: "KER", tipo: "regional", estado: "inventado", color: "#0277BD", lands: ["se", "lon"], sede: "Ashford", servicios: ["re", "rb", "av"], competencia: "competitiva" }),
  op({ id: "dev", nombre: "Devon y Cornualles Rail", nombre_corto: "DCR", tipo: "regional", estado: "inventado", color: "#2E7D32", lands: ["sw"], sede: "Plymouth", servicios: ["re", "rb", "rl", "tur"], logo_estilo: "ola" }),
  op({ id: "cot", nombre: "Cotswolds Líneas", nombre_corto: "COT", tipo: "regional", estado: "inventado", color: "#558B2F", lands: ["sw", "se", "wm"], sede: "Oxford", servicios: ["re", "rb", "tur"], logo_estilo: "hoja" }),
  op({ id: "pen", nombre: "Penninos Express", nombre_corto: "PEX", tipo: "regional", estado: "inventado", color: "#4527A0", lands: ["nw", "yh"], sede: "Huddersfield", servicios: ["re", "ir", "ld"], competencia: "competitiva", logo_estilo: "pico" }),
  op({ id: "bor", nombre: "Borde Escocés", nombre_corto: "BES", tipo: "regional", estado: "inventado", color: "#00695C", lands: ["sct", "ne"], sede: "Berwick", servicios: ["re", "rb", "ld"], competencia: "competitiva", logo_estilo: "puente" }),
  op({ id: "cly", nombre: "Clyde Urbano", nombre_corto: "CLU", tipo: "metropolitano", estado: "inventado", color: "#C62828", lands: ["sct"], sede: "Glasgow", servicios: ["s", "or", "mc"], logo_estilo: "anillo" }),
  op({ id: "loy", nombre: "Loyola Capital Rail", nombre_corto: "LCR", tipo: "metropolitano", estado: "inventado", color: "#6A1B9A", lands: ["lon"], sede: "Londres", servicios: ["s", "or", "mc", "u"], competencia: "competitiva", logo_estilo: "malla" }),
  op({ id: "man", nombre: "Manchester Orbital", nombre_corto: "MAO", tipo: "metropolitano", estado: "inventado", color: "#F9A825", color_secundario: "#111827", lands: ["nw"], sede: "Manchester", servicios: ["s", "or", "mc", "tt"], logo_estilo: "anillo" }),
  op({ id: "brm", nombre: "Birmingham Cruzado", nombre_corto: "BCX", tipo: "metropolitano", estado: "inventado", color: "#EF6C00", lands: ["wm"], sede: "Birmingham", servicios: ["s", "mc", "tt"], logo_estilo: "hex" }),
  op({ id: "lee", nombre: "Leeds Distrito Rail", nombre_corto: "LDR", tipo: "metropolitano", estado: "inventado", color: "#2E7D32", lands: ["yh"], sede: "Leeds", servicios: ["s", "re", "mc"] }),
  op({ id: "bri", nombre: "Bristol Bahía Rail", nombre_corto: "BBR", tipo: "metropolitano", estado: "inventado", color: "#00838F", lands: ["sw"], sede: "Bristol", servicios: ["s", "re", "tt"], logo_estilo: "ola" }),
  op({ id: "car", nombre: "Cardiff Bahía Express", nombre_corto: "CBE", tipo: "metropolitano", estado: "inventado", color: "#C62828", lands: ["wls"], sede: "Cardiff", servicios: ["s", "t", "re"] }),
  op({ id: "bel", nombre: "Belfast Rápidos", nombre_corto: "BER", tipo: "regional", estado: "inventado", color: "#1565C0", lands: ["nir"], sede: "Belfast", servicios: ["re", "rb", "s"], competencia: "competitiva" }),
  op({ id: "hig", nombre: "Highlands Vías", nombre_corto: "HIV", tipo: "regional", estado: "inventado", color: "#1B5E20", lands: ["sct"], sede: "Inverness", servicios: ["rl", "rb", "tur", "re"], logo_estilo: "pico" }),
  op({ id: "wal", nombre: "Gales del Norte Rail", nombre_corto: "GNR", tipo: "regional", estado: "inventado", color: "#AD1457", lands: ["wls", "nw"], sede: "Bangor", servicios: ["re", "rb", "tur"], logo_estilo: "ola" }),
  op({ id: "eas", nombre: "Essex Orbital", nombre_corto: "ESO", tipo: "metropolitano", estado: "inventado", color: "#D84315", lands: ["ee", "lon"], sede: "Chelmsford", servicios: ["s", "re", "mc"] }),
  op({ id: "sur", nombre: "Surrey Conexión", nombre_corto: "SUC", tipo: "regional", estado: "inventado", color: "#558B2F", lands: ["se", "lon"], sede: "Guildford", servicios: ["re", "rb", "s"], competencia: "competitiva" }),
  op({ id: "ham", nombre: "Hampshire Costero", nombre_corto: "HAC", tipo: "regional", estado: "inventado", color: "#0277BD", lands: ["se", "sw"], sede: "Southampton", servicios: ["re", "rb", "tur"], logo_estilo: "ancla" }),
  op({ id: "lin", nombre: "Lincolnshire Llanura", nombre_corto: "LIL", tipo: "regional", estado: "inventado", color: "#6D4C41", lands: ["em", "yh"], sede: "Lincoln", servicios: ["re", "rb", "rl"] }),
  op({ id: "cum", nombre: "Cumbria Lagos Rail", nombre_corto: "CLR", tipo: "regional", estado: "inventado", color: "#00695C", lands: ["nw", "sct"], sede: "Carlisle", servicios: ["rb", "rl", "tur"], logo_estilo: "ola" }),
  op({ id: "nor2", nombre: "Norte Abierto UK", nombre_corto: "NOA", tipo: "regional", estado: "inventado", color: "#283593", lands: ["nw", "yh", "ne"], sede: "Leeds", servicios: ["re", "rb", "ir"], competencia: "competitiva", logo_estilo: "flecha" }),
  op({ id: "met", nombre: "Metro Capital Plus", nombre_corto: "MCP", tipo: "urbano", estado: "inventado", color: "#F9A825", color_secundario: "#111827", lands: ["lon"], sede: "Londres", servicios: ["u", "t"], competencia: "competitiva", logo_estilo: "u" }),
  op({ id: "trl", nombre: "Tranvías del Reino", nombre_corto: "TRR", tipo: "urbano", estado: "inventado", color: "#C2185B", lands: ["lon", "nw", "wm", "yh", "sct"], sede: "Manchester", servicios: ["t", "tt"], competencia: "competitiva", logo_estilo: "t" }),
  op({ id: "riv", nombre: "Riberas del Mersey", nombre_corto: "RDM", tipo: "especializado", estado: "inventado", color: "#1565C0", lands: ["nw"], sede: "Liverpool", servicios: ["tur", "re"], competencia: "nicho", logo_estilo: "rio" }),
  op({ id: "alp", nombre: "Alpes Escoceses Rail", nombre_corto: "AER", tipo: "especializado", estado: "inventado", color: "#1A237E", lands: ["sct"], sede: "Aviemore", servicios: ["tur", "rl"], competencia: "nicho", logo_estilo: "pico" }),
  op({ id: "occ", nombre: "Occidente Atlántico UK", nombre_corto: "OAU", tipo: "regional", estado: "inventado", color: "#0D47A1", lands: ["sw", "wls", "nw"], sede: "Cardiff", servicios: ["re", "ir", "ld"], competencia: "competitiva", logo_estilo: "flecha" }),
  op({ id: "est", nombre: "Estrecho de Dover Rail", nombre_corto: "EDR", tipo: "especializado", estado: "inventado", color: "#B71C1C", lands: ["se"], sede: "Dover", servicios: ["ae", "ld", "av"], competencia: "nicho", logo_estilo: "puente" }),
  op({ id: "sol", nombre: "Solent Urbano", nombre_corto: "SOU", tipo: "metropolitano", estado: "inventado", color: "#00838F", lands: ["se"], sede: "Portsmouth", servicios: ["s", "re", "tt"], logo_estilo: "ancla" }),
  op({ id: "tyn", nombre: "Tyne Express Sur", nombre_corto: "TES", tipo: "regional", estado: "inventado", color: "#F57F17", color_secundario: "#111827", lands: ["ne", "yh"], sede: "Sunderland", servicios: ["re", "rb", "s"], competencia: "competitiva" }),
];

export const operators = [...actuales, ...futuros, ...inventados];
