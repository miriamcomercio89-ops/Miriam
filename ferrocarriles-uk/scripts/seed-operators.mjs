/**
 * Operadores de Alemania: actuales, futuros e inventados (nombres en español según tipo y ubicación).
 * Ampliado para máxima variedad regional, metro y tranvía.
 */
export const lands = [
  {
    "id": "be",
    "nombre": "Berlín",
    "capital": "Berlín"
  },
  {
    "id": "bb",
    "nombre": "Brandeburgo",
    "capital": "Potsdam"
  },
  {
    "id": "mv",
    "nombre": "Mecklemburgo-Pomerania Occidental",
    "capital": "Schwerin"
  },
  {
    "id": "sh",
    "nombre": "Schleswig-Holstein",
    "capital": "Kiel"
  },
  {
    "id": "hh",
    "nombre": "Hamburgo",
    "capital": "Hamburgo"
  },
  {
    "id": "ni",
    "nombre": "Baja Sajonia",
    "capital": "Hannover"
  },
  {
    "id": "hb",
    "nombre": "Bremen",
    "capital": "Bremen"
  },
  {
    "id": "nw",
    "nombre": "Renania del Norte-Westfalia",
    "capital": "Düsseldorf"
  },
  {
    "id": "he",
    "nombre": "Hesse",
    "capital": "Wiesbaden"
  },
  {
    "id": "rp",
    "nombre": "Renania-Palatinado",
    "capital": "Maguncia"
  },
  {
    "id": "sl",
    "nombre": "Sarre",
    "capital": "Sarrebruck"
  },
  {
    "id": "bw",
    "nombre": "Baden-Wurtemberg",
    "capital": "Stuttgart"
  },
  {
    "id": "by",
    "nombre": "Baviera",
    "capital": "Múnich"
  },
  {
    "id": "th",
    "nombre": "Turingia",
    "capital": "Erfurt"
  },
  {
    "id": "sn",
    "nombre": "Sajonia",
    "capital": "Dresde"
  },
  {
    "id": "st",
    "nombre": "Sajonia-Anhalt",
    "capital": "Magdeburgo"
  }
];

export const operators = [
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "escudo",
    "eslogan": "Red troncal nacional",
    "id": "fa",
    "nombre": "FerroAlemania",
    "nombre_corto": "FA",
    "tipo": "nacional",
    "estado": "actual",
    "color": "#C1121F",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Berlín",
    "servicios": [
      "av",
      "ld",
      "ir",
      "px",
      "n"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "rayo",
    "eslogan": "",
    "id": "ice",
    "nombre": "Alta Velocidad Rin-Danubio",
    "nombre_corto": "ARD",
    "tipo": "nacional",
    "estado": "actual",
    "color": "#E30613",
    "lands": [
      "nw",
      "he",
      "bw",
      "by",
      "rp",
      "be"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "av",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "malla",
    "eslogan": "",
    "id": "icx",
    "nombre": "InterCiudades Alemania",
    "nombre_corto": "ICA",
    "tipo": "nacional",
    "estado": "actual",
    "color": "#8B0000",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Hannover",
    "servicios": [
      "ld",
      "ir",
      "px"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "competitiva",
    "logo_estilo": "flecha",
    "eslogan": "",
    "id": "flx",
    "nombre": "Larga Distancia Libre",
    "nombre_corto": "LDL",
    "tipo": "nacional",
    "estado": "actual",
    "color": "#74D300",
    "lands": [
      "be",
      "hh",
      "nw",
      "by",
      "bw",
      "sn"
    ],
    "sede": "Berlín",
    "servicios": [
      "ld",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "estrella",
    "eslogan": "",
    "id": "eur",
    "nombre": "Puente Europeo Central",
    "nombre_corto": "PEC",
    "tipo": "internacional",
    "estado": "actual",
    "color": "#003399",
    "lands": [
      "nw",
      "rp",
      "bw",
      "by",
      "sl"
    ],
    "sede": "Colonia",
    "servicios": [
      "av",
      "ld"
    ]
  },
  {
    "color_secundario": "#F2A900",
    "competencia": "nicho",
    "logo_estilo": "luna",
    "eslogan": "",
    "id": "noc",
    "nombre": "Nocturno Alemán",
    "nombre_corto": "NOA",
    "tipo": "especializado",
    "estado": "actual",
    "color": "#1A237E",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Múnich",
    "servicios": [
      "n"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "ala",
    "eslogan": "",
    "id": "aef",
    "nombre": "AeroEnlace Fráncfort",
    "nombre_corto": "AEF",
    "tipo": "especializado",
    "estado": "actual",
    "color": "#532E8E",
    "lands": [
      "he",
      "rp"
    ],
    "sede": "Fráncfort Aeropuerto",
    "servicios": [
      "ae",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "ala",
    "eslogan": "",
    "id": "aem",
    "nombre": "AeroEnlace Múnich",
    "nombre_corto": "AEM",
    "tipo": "especializado",
    "estado": "actual",
    "color": "#0B6E4F",
    "lands": [
      "by"
    ],
    "sede": "Múnich Aeropuerto",
    "servicios": [
      "ae",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "ala",
    "eslogan": "",
    "id": "aeb",
    "nombre": "AeroEnlace Brandeburgo",
    "nombre_corto": "AEB",
    "tipo": "especializado",
    "estado": "actual",
    "color": "#3949AB",
    "lands": [
      "be",
      "bb"
    ],
    "sede": "Berlín Brandeburgo",
    "servicios": [
      "ae",
      "s",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rby",
    "nombre": "Regio Baviera",
    "nombre_corto": "RBY",
    "tipo": "regional",
    "estado": "actual",
    "color": "#007C3F",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rnw",
    "nombre": "Regio Renania-Westfalia",
    "nombre_corto": "RNW",
    "tipo": "regional",
    "estado": "actual",
    "color": "#E30613",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rhe",
    "nombre": "Regio Hesse",
    "nombre_corto": "RHE",
    "tipo": "regional",
    "estado": "actual",
    "color": "#C8102E",
    "lands": [
      "he",
      "rp"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "re",
      "rb",
      "s",
      "rl"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rbw",
    "nombre": "Regio Baden-Wurtemberg",
    "nombre_corto": "RBW",
    "tipo": "regional",
    "estado": "actual",
    "color": "#FFCC00",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s",
      "tt"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rsn",
    "nombre": "Regio Sajonia",
    "nombre_corto": "RSN",
    "tipo": "regional",
    "estado": "actual",
    "color": "#1E88E5",
    "lands": [
      "sn",
      "st",
      "th"
    ],
    "sede": "Leipzig",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rbb",
    "nombre": "Regio Brandeburgo",
    "nombre_corto": "RBB",
    "tipo": "regional",
    "estado": "actual",
    "color": "#C62828",
    "lands": [
      "bb",
      "be",
      "mv"
    ],
    "sede": "Potsdam",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rni",
    "nombre": "Regio Baja Sajonia",
    "nombre_corto": "RNI",
    "tipo": "regional",
    "estado": "actual",
    "color": "#1565C0",
    "lands": [
      "ni",
      "hb",
      "hh"
    ],
    "sede": "Hannover",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rsh",
    "nombre": "Regio Schleswig-Holstein",
    "nombre_corto": "RSH",
    "tipo": "regional",
    "estado": "actual",
    "color": "#0277BD",
    "lands": [
      "sh",
      "hh"
    ],
    "sede": "Kiel",
    "servicios": [
      "re",
      "rb",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "ola",
    "eslogan": "",
    "id": "rmv",
    "nombre": "Regio Báltico",
    "nombre_corto": "RMV",
    "tipo": "regional",
    "estado": "actual",
    "color": "#00838F",
    "lands": [
      "mv",
      "bb",
      "sh"
    ],
    "sede": "Rostock",
    "servicios": [
      "re",
      "rb",
      "rl",
      "tur"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rth",
    "nombre": "Regio Turingia",
    "nombre_corto": "RTH",
    "tipo": "regional",
    "estado": "actual",
    "color": "#6A1B9A",
    "lands": [
      "th",
      "sn",
      "st",
      "by"
    ],
    "sede": "Erfurt",
    "servicios": [
      "re",
      "rb",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rrp",
    "nombre": "Regio Palatinado-Sarre",
    "nombre_corto": "RPS",
    "tipo": "regional",
    "estado": "actual",
    "color": "#EF6C00",
    "lands": [
      "rp",
      "sl",
      "bw"
    ],
    "sede": "Maguncia",
    "servicios": [
      "re",
      "rb",
      "rl",
      "tt"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sbe",
    "nombre": "Cercanías Berlín",
    "nombre_corto": "SBE",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#003399",
    "lands": [
      "be",
      "bb"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "or",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "shh",
    "nombre": "Cercanías Hamburgo",
    "nombre_corto": "SHH",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#E30613",
    "lands": [
      "hh",
      "sh",
      "ni"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "s",
      "or",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "smu",
    "nombre": "Cercanías Múnich",
    "nombre_corto": "SMU",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#0077C8",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "s",
      "or",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "srr",
    "nombre": "Cercanías Rin-Ruhr",
    "nombre_corto": "SRR",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#00A3E0",
    "lands": [
      "nw"
    ],
    "sede": "Essen",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sfr",
    "nombre": "Cercanías Fráncfort-Rin-Meno",
    "nombre_corto": "SFR",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#C8102E",
    "lands": [
      "he",
      "rp"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "s",
      "or",
      "mc",
      "ae"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sst",
    "nombre": "Cercanías Stuttgart",
    "nombre_corto": "SST",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#F5A700",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "s",
      "or",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "sha",
    "nombre": "Cercanías Hannover",
    "nombre_corto": "SHA",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#D5002B",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "s",
      "re",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "sle",
    "nombre": "Cercanías Leipzig-Halle",
    "nombre_corto": "SLE",
    "tipo": "metropolitano",
    "estado": "actual",
    "color": "#1565C0",
    "lands": [
      "sn",
      "st"
    ],
    "sede": "Leipzig",
    "servicios": [
      "s",
      "mc",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "ube",
    "nombre": "Metro Berlín",
    "nombre_corto": "UBE",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#E30613",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "uhh",
    "nombre": "Metro Hamburgo",
    "nombre_corto": "UHH",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#003399",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "umu",
    "nombre": "Metro Múnich",
    "nombre_corto": "UMU",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#005AA0",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "unu",
    "nombre": "Metro Núremberg",
    "nombre_corto": "UNU",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#C8102E",
    "lands": [
      "by"
    ],
    "sede": "Núremberg",
    "servicios": [
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tbe",
    "nombre": "Tranvías Berlín",
    "nombre_corto": "TBE",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#EE3124",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "t"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tmu",
    "nombre": "Tranvías Múnich",
    "nombre_corto": "TMU",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#84B817",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "t"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tko",
    "nombre": "Tranvías Colonia",
    "nombre_corto": "TKO",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#E30613",
    "lands": [
      "nw"
    ],
    "sede": "Colonia",
    "servicios": [
      "t",
      "tt",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tdu",
    "nombre": "Tranvías Düsseldorf",
    "nombre_corto": "TDU",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#C8102E",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "t",
      "tt",
      "u"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tst",
    "nombre": "Tranvías Stuttgart",
    "nombre_corto": "TST",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#F5A700",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "t",
      "tt",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tle",
    "nombre": "Tranvías Leipzig",
    "nombre_corto": "TLE",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#1B7A3D",
    "lands": [
      "sn"
    ],
    "sede": "Leipzig",
    "servicios": [
      "t"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tdr",
    "nombre": "Tranvías Dresde",
    "nombre_corto": "TDR",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#E87722",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "t"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tka",
    "nombre": "Tranvía-Tren Karlsruhe",
    "nombre_corto": "TKA",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#F2A900",
    "lands": [
      "bw",
      "rp"
    ],
    "sede": "Karlsruhe",
    "servicios": [
      "tt",
      "t",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tfr",
    "nombre": "Tranvías Fráncfort",
    "nombre_corto": "TFR",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#0097A7",
    "lands": [
      "he"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "t",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tha",
    "nombre": "Tranvías Hannover",
    "nombre_corto": "THA",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#C45C26",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "t",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tbr",
    "nombre": "Tranvías Bremen",
    "nombre_corto": "TBR",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#E31C3D",
    "lands": [
      "hb",
      "ni"
    ],
    "sede": "Bremen",
    "servicios": [
      "t"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "escudo",
    "eslogan": "Horario nacional cadenciado",
    "id": "dfa",
    "nombre": "Deutschlandtakt FerroAlemania",
    "nombre_corto": "DTK",
    "tipo": "nacional",
    "estado": "futuro",
    "color": "#012169",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Berlín",
    "servicios": [
      "av",
      "ld",
      "ir",
      "re",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "rayo",
    "eslogan": "",
    "id": "hsa",
    "nombre": "Alta Velocidad Maguncia-Múnich",
    "nombre_corto": "AVM",
    "tipo": "nacional",
    "estado": "futuro",
    "color": "#00A19A",
    "lands": [
      "he",
      "bw",
      "by"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "av",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "rayo",
    "eslogan": "",
    "id": "hsn",
    "nombre": "Alta Velocidad Norte",
    "nombre_corto": "AVN",
    "tipo": "nacional",
    "estado": "futuro",
    "color": "#00695C",
    "lands": [
      "hh",
      "ni",
      "be",
      "nw"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "av",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "Integración metropolitana RR",
    "id": "mrr",
    "nombre": "Metro Rin-Ruhr Unificado",
    "nombre_corto": "MRR",
    "tipo": "metropolitano",
    "estado": "futuro",
    "color": "#6C3A00",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "s",
      "u",
      "t",
      "tt",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "sbe2",
    "nombre": "Cercanías Berlín 2035",
    "nombre_corto": "SB3",
    "tipo": "metropolitano",
    "estado": "futuro",
    "color": "#1A237E",
    "lands": [
      "be",
      "bb"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "or",
      "mc",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "ost",
    "nombre": "Corredor Este Rápido",
    "nombre_corto": "CER",
    "tipo": "regional",
    "estado": "futuro",
    "color": "#4A148C",
    "lands": [
      "be",
      "bb",
      "sn",
      "st",
      "th"
    ],
    "sede": "Leipzig",
    "servicios": [
      "re",
      "ir",
      "ld",
      "av"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "sud",
    "nombre": "Sur Abierto Alemania",
    "nombre_corto": "SUA",
    "tipo": "nacional",
    "estado": "futuro",
    "color": "#BF360C",
    "lands": [
      "by",
      "bw",
      "he"
    ],
    "sede": "Múnich",
    "servicios": [
      "ld",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "nor",
    "nombre": "Norte Abierto Alemania",
    "nombre_corto": "NOG",
    "tipo": "nacional",
    "estado": "futuro",
    "color": "#0D47A1",
    "lands": [
      "hh",
      "sh",
      "ni",
      "mv",
      "be"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "ld",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "pico",
    "eslogan": "",
    "id": "alp",
    "nombre": "Alpes Bávaros Express",
    "nombre_corto": "ABX",
    "tipo": "regional",
    "estado": "futuro",
    "color": "#1B5E20",
    "lands": [
      "by"
    ],
    "sede": "Garmisch",
    "servicios": [
      "re",
      "tur",
      "rl",
      "av"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "rhv",
    "nombre": "Rin Valle Futuro",
    "nombre_corto": "RVF",
    "tipo": "regional",
    "estado": "futuro",
    "color": "#7B1FA2",
    "lands": [
      "nw",
      "rp",
      "he",
      "bw"
    ],
    "sede": "Maguncia",
    "servicios": [
      "re",
      "tt",
      "ir",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "rio",
    "eslogan": "",
    "id": "raf",
    "nombre": "Rápidos del Spree",
    "nombre_corto": "RDS",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#0B3D91",
    "lands": [
      "be",
      "bb",
      "sn",
      "st"
    ],
    "sede": "Berlín",
    "servicios": [
      "av",
      "ld",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "ola",
    "eslogan": "",
    "id": "exn",
    "nombre": "Expreso Nórdico Alemán",
    "nombre_corto": "ENA",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#1B4F72",
    "lands": [
      "hh",
      "sh",
      "ni",
      "mv",
      "be"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "ld",
      "px",
      "n"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "malla",
    "eslogan": "",
    "id": "cdn",
    "nombre": "Corredores del Ruhr",
    "nombre_corto": "CDR",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#0E4D64",
    "lands": [
      "nw",
      "he",
      "ni"
    ],
    "sede": "Essen",
    "servicios": [
      "ld",
      "ir",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "rayo",
    "eslogan": "",
    "id": "vrp",
    "nombre": "VeloRápido Alemán",
    "nombre_corto": "VRA",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#B71C1C",
    "lands": [
      "be",
      "he",
      "bw",
      "by"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "av",
      "px"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "lma",
    "nombre": "Líneas Maestras Alemania",
    "nombre_corto": "LMA",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#37474F",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Hannover",
    "servicios": [
      "ld",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "rayo",
    "eslogan": "",
    "id": "lib",
    "nombre": "Líneas Libres Alemania",
    "nombre_corto": "LLA",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#E65100",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Colonia",
    "servicios": [
      "ld",
      "px",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "diamante",
    "eslogan": "",
    "id": "nex",
    "nombre": "Nexo Ciudades Alemanas",
    "nombre_corto": "NCA",
    "tipo": "nacional",
    "estado": "inventado",
    "color": "#263238",
    "lands": [
      "be",
      "hh",
      "nw",
      "by",
      "bw",
      "sn"
    ],
    "sede": "Leipzig",
    "servicios": [
      "px",
      "ld",
      "ae"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "puente",
    "eslogan": "",
    "id": "peu",
    "nombre": "Puente Alpes-Mar del Norte",
    "nombre_corto": "PAM",
    "tipo": "internacional",
    "estado": "inventado",
    "color": "#1565C0",
    "lands": [
      "by",
      "bw",
      "nw",
      "hh"
    ],
    "sede": "Múnich",
    "servicios": [
      "av",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "marco",
    "eslogan": "",
    "id": "pan",
    "nombre": "Panorámicos Alemanes",
    "nombre_corto": "PAG",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#33691E",
    "lands": [
      "by",
      "bw",
      "sh",
      "mv",
      "sn"
    ],
    "sede": "Friburgo",
    "servicios": [
      "tur",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "libro",
    "eslogan": "",
    "id": "uni",
    "nombre": "Universidad Express Alemania",
    "nombre_corto": "UEA",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#4E342E",
    "lands": [
      "be",
      "by",
      "bw",
      "he",
      "sn",
      "ni"
    ],
    "sede": "Heidelberg",
    "servicios": [
      "re",
      "ir",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hex",
    "eslogan": "",
    "id": "fer",
    "nombre": "Feria y Congresos Rail",
    "nombre_corto": "FCR",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#880E4F",
    "lands": [
      "he",
      "nw",
      "by",
      "be",
      "sn"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "px",
      "ae",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "ola",
    "eslogan": "",
    "id": "cos",
    "nombre": "Costa a Costa Alemana",
    "nombre_corto": "CCA",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#006064",
    "lands": [
      "sh",
      "mv",
      "ni",
      "hh"
    ],
    "sede": "Rostock",
    "servicios": [
      "tur",
      "ir",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "rio",
    "eslogan": "",
    "id": "riv",
    "nombre": "Riberas del Elba",
    "nombre_corto": "RDE",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#1565C0",
    "lands": [
      "hh",
      "ni",
      "st",
      "sn"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "tur",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "sel",
    "nombre": "Selva Negra Vías",
    "nombre_corto": "SNV",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#1B5E20",
    "lands": [
      "bw"
    ],
    "sede": "Offenburg",
    "servicios": [
      "tur",
      "rl",
      "rb"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "rio",
    "eslogan": "",
    "id": "mos",
    "nombre": "Mosela Romántico Rail",
    "nombre_corto": "MRR2",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#6A1B9A",
    "lands": [
      "rp",
      "sl"
    ],
    "sede": "Coblenza",
    "servicios": [
      "tur",
      "rb",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "via",
    "nombre": "Vía Abierta Central",
    "nombre_corto": "VAC",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#5D4037",
    "lands": [
      "th",
      "st",
      "sn",
      "he"
    ],
    "sede": "Erfurt",
    "servicios": [
      "re",
      "rb",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "sol",
    "eslogan": "",
    "id": "mid",
    "nombre": "Mediodía Bávaro",
    "nombre_corto": "MDB",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#BF360C",
    "lands": [
      "by"
    ],
    "sede": "Augsburgo",
    "servicios": [
      "re",
      "rb",
      "ir",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "ang",
    "nombre": "Anglia Sajona Conecta",
    "nombre_corto": "ASC",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#AD1457",
    "lands": [
      "sn",
      "bb",
      "be"
    ],
    "sede": "Dresde",
    "servicios": [
      "re",
      "rb",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "ancla",
    "eslogan": "",
    "id": "ken",
    "nombre": "Kiel Rápido",
    "nombre_corto": "KIR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#0277BD",
    "lands": [
      "sh",
      "hh"
    ],
    "sede": "Kiel",
    "servicios": [
      "re",
      "rb"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "rio",
    "eslogan": "",
    "id": "dev",
    "nombre": "Weser y Aller Rail",
    "nombre_corto": "WAR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#2E7D32",
    "lands": [
      "ni",
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "re",
      "rb",
      "rl",
      "tur"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "cot",
    "nombre": "Harz Líneas Verdes",
    "nombre_corto": "HLV",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#558B2F",
    "lands": [
      "st",
      "ni",
      "th"
    ],
    "sede": "Wernigerode",
    "servicios": [
      "re",
      "rb",
      "tur",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "pico",
    "eslogan": "",
    "id": "pen",
    "nombre": "Eifel Express",
    "nombre_corto": "EEX",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#4527A0",
    "lands": [
      "nw",
      "rp"
    ],
    "sede": "Aquisgrán",
    "servicios": [
      "re",
      "ir",
      "rb"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "puente",
    "eslogan": "",
    "id": "bor",
    "nombre": "Borde Checo-Sajón",
    "nombre_corto": "BCS",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#00695C",
    "lands": [
      "sn",
      "by"
    ],
    "sede": "Chemnitz",
    "servicios": [
      "re",
      "rb",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "pico",
    "eslogan": "",
    "id": "hig",
    "nombre": "Altos Alpes Bávaros",
    "nombre_corto": "AAB",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#1B5E20",
    "lands": [
      "by"
    ],
    "sede": "Innsbruck Gate",
    "servicios": [
      "rl",
      "rb",
      "tur",
      "re"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "wal",
    "nombre": "Bosque Bávaro Rail",
    "nombre_corto": "BBR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#AD1457",
    "lands": [
      "by"
    ],
    "sede": "Passau",
    "servicios": [
      "re",
      "rb",
      "tur"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "sur",
    "nombre": "Suabia Conexión",
    "nombre_corto": "SUC",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#558B2F",
    "lands": [
      "bw",
      "by"
    ],
    "sede": "Ulm",
    "servicios": [
      "re",
      "rb",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "ancla",
    "eslogan": "",
    "id": "ham",
    "nombre": "Helgoland Costero",
    "nombre_corto": "HEC",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#0277BD",
    "lands": [
      "sh",
      "ni",
      "hh"
    ],
    "sede": "Cuxhaven",
    "servicios": [
      "re",
      "rb",
      "tur"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "lin",
    "nombre": "Llanura Magdeburgo",
    "nombre_corto": "LLM",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#6D4C41",
    "lands": [
      "st",
      "bb",
      "ni"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "re",
      "rb",
      "rl"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "ola",
    "eslogan": "",
    "id": "cum",
    "nombre": "Lago Constanza Rail",
    "nombre_corto": "LCR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#00695C",
    "lands": [
      "bw",
      "by"
    ],
    "sede": "Constanza",
    "servicios": [
      "rb",
      "rl",
      "tur"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "tyn",
    "nombre": "Teutoburgo Express",
    "nombre_corto": "TEX",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#F57F17",
    "lands": [
      "nw",
      "ni"
    ],
    "sede": "Bielefeld",
    "servicios": [
      "re",
      "rb",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "occ",
    "nombre": "Occidente Atlántico Rin",
    "nombre_corto": "OAR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#0D47A1",
    "lands": [
      "nw",
      "rp",
      "sl"
    ],
    "sede": "Colonia",
    "servicios": [
      "re",
      "ir",
      "ld"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "puente",
    "eslogan": "",
    "id": "est",
    "nombre": "Oder Frontera Rail",
    "nombre_corto": "OFR",
    "tipo": "especializado",
    "estado": "inventado",
    "color": "#B71C1C",
    "lands": [
      "bb",
      "sn"
    ],
    "sede": "Fráncfort del Óder",
    "servicios": [
      "re",
      "ld",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "orb",
    "nombre": "Orbital Capital Berlín",
    "nombre_corto": "OCB",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#C62828",
    "lands": [
      "be",
      "bb"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "or",
      "mc",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "malla",
    "eslogan": "",
    "id": "loy",
    "nombre": "Anillo Capital Plus",
    "nombre_corto": "ACP",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#6A1B9A",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "or",
      "mc",
      "u"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "dominante",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "man",
    "nombre": "Ruhr Orbital",
    "nombre_corto": "RUO",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#F9A825",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "s",
      "or",
      "mc",
      "tt"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "hex",
    "eslogan": "",
    "id": "brm",
    "nombre": "Múnich Cruzado",
    "nombre_corto": "MCX",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#EF6C00",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "s",
      "mc",
      "tt",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "lee",
    "nombre": "Leipzig Distrito Rail",
    "nombre_corto": "LDR",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#2E7D32",
    "lands": [
      "sn",
      "st"
    ],
    "sede": "Leipzig",
    "servicios": [
      "s",
      "re",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "ola",
    "eslogan": "",
    "id": "bri",
    "nombre": "Hamburgo Bahía Rail",
    "nombre_corto": "HBR",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#00838F",
    "lands": [
      "hh",
      "sh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "s",
      "re",
      "tt"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "car",
    "nombre": "Colonia Bahía Express",
    "nombre_corto": "CBX",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#C62828",
    "lands": [
      "nw"
    ],
    "sede": "Colonia",
    "servicios": [
      "s",
      "t",
      "re",
      "u"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "eas",
    "nombre": "Brandeburgo Orbital",
    "nombre_corto": "BRO",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#D84315",
    "lands": [
      "bb",
      "be"
    ],
    "sede": "Potsdam",
    "servicios": [
      "s",
      "re",
      "mc"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "rio",
    "eslogan": "",
    "id": "sol",
    "nombre": "Neckar Urbano",
    "nombre_corto": "NEU",
    "tipo": "metropolitano",
    "estado": "inventado",
    "color": "#00838F",
    "lands": [
      "bw"
    ],
    "sede": "Heilbronn",
    "servicios": [
      "s",
      "re",
      "tt"
    ]
  },
  {
    "color_secundario": "#111827",
    "competencia": "competitiva",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "met",
    "nombre": "Metro Capital Plus",
    "nombre_corto": "MCP",
    "tipo": "urbano",
    "estado": "inventado",
    "color": "#F9A825",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "u",
      "t"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "trl",
    "nombre": "Tranvías de Alemania",
    "nombre_corto": "TDA",
    "tipo": "urbano",
    "estado": "inventado",
    "color": "#C2185B",
    "lands": [
      "be",
      "nw",
      "by",
      "bw",
      "sn",
      "ni",
      "he"
    ],
    "sede": "Colonia",
    "servicios": [
      "t",
      "tt"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bel",
    "nombre": "Bremen Rápidos",
    "nombre_corto": "BER",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#1565C0",
    "lands": [
      "hb",
      "ni"
    ],
    "sede": "Bremen",
    "servicios": [
      "re",
      "rb",
      "s"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "flecha",
    "eslogan": "",
    "id": "nor2",
    "nombre": "Norte Abierto Regional",
    "nombre_corto": "NAR",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#283593",
    "lands": [
      "hh",
      "sh",
      "ni",
      "mv"
    ],
    "sede": "Lübeck",
    "servicios": [
      "re",
      "rb",
      "ir"
    ]
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "val",
    "nombre": "Valles Verdes Alemania",
    "nombre_corto": "VVA",
    "tipo": "regional",
    "estado": "inventado",
    "color": "#1B5E20",
    "lands": [
      "bw",
      "by",
      "rp",
      "th"
    ],
    "sede": "Friburgo",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ]
  },
  {
    "id": "tdo",
    "nombre": "Tranvías Dortmund",
    "nombre_corto": "TDO",
    "tipo": "urbano",
    "estado": "actual",
    "color": "#C45C26",
    "color_secundario": "#FFFFFF",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "t",
      "u"
    ],
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": ""
  },
  {
    "id": "tmg",
    "nombre": "Tranvías Magdeburgo",
    "nombre_corto": "TMG",
    "tipo": "urbano",
    "estado": "inventado",
    "color": "#5C6BC0",
    "color_secundario": "#FFFFFF",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "t"
    ],
    "competencia": "dominante",
    "logo_estilo": "t",
    "eslogan": ""
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-be",
    "nombre": "Regionales Berlín",
    "nombre_corto": "RBE",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#004D40"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-be",
    "nombre": "Exprés Berlín",
    "nombre_corto": "EBE",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#D93D53"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-be",
    "nombre": "Ramales Berlín",
    "nombre_corto": "LBE",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#409860"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-bb",
    "nombre": "Regionales Brandeburgo",
    "nombre_corto": "RBB10",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bb"
    ],
    "sede": "Potsdam",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#6F2B6D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-bb",
    "nombre": "Exprés Brandeburgo",
    "nombre_corto": "EBB",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bb"
    ],
    "sede": "Potsdam",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#9E867A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-bb",
    "nombre": "Ramales Brandeburgo",
    "nombre_corto": "LBB",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bb"
    ],
    "sede": "Potsdam",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#CD1987"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-mv",
    "nombre": "Regionales Mecklemburgo-Pomerania Occidental",
    "nombre_corto": "RMV11",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "mv"
    ],
    "sede": "Schwerin",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#347494"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-mv",
    "nombre": "Exprés Mecklemburgo-Pomerania Occidental",
    "nombre_corto": "EMV",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "mv"
    ],
    "sede": "Schwerin",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#63CFA1"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-mv",
    "nombre": "Ramales Mecklemburgo-Pomerania Occidental",
    "nombre_corto": "LMV",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "mv"
    ],
    "sede": "Schwerin",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#9262AE"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-sh",
    "nombre": "Regionales Schleswig-Holstein",
    "nombre_corto": "RSH12",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sh"
    ],
    "sede": "Kiel",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#C1BDBB"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-sh",
    "nombre": "Exprés Schleswig-Holstein",
    "nombre_corto": "ESH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sh"
    ],
    "sede": "Kiel",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#2850C8"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-sh",
    "nombre": "Ramales Schleswig-Holstein",
    "nombre_corto": "LSH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sh"
    ],
    "sede": "Kiel",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#57ABD5"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-hh",
    "nombre": "Regionales Hamburgo",
    "nombre_corto": "RHH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#863E1A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-hh",
    "nombre": "Exprés Hamburgo",
    "nombre_corto": "EHH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#B59927"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-hh",
    "nombre": "Ramales Hamburgo",
    "nombre_corto": "LHH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#1C2C34"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-ni",
    "nombre": "Regionales Baja Sajonia",
    "nombre_corto": "RNI13",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#4B8741"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-ni",
    "nombre": "Exprés Baja Sajonia",
    "nombre_corto": "ENI",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#7A1A4E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-ni",
    "nombre": "Ramales Baja Sajonia",
    "nombre_corto": "LNI",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#A9755B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-hb",
    "nombre": "Regionales Bremen",
    "nombre_corto": "RHB",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#D8D068"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-hb",
    "nombre": "Exprés Bremen",
    "nombre_corto": "EHB",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#3F6375"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-hb",
    "nombre": "Ramales Bremen",
    "nombre_corto": "LHB",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#6EBE82"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-nw",
    "nombre": "Regionales Renania del Norte-Westfalia",
    "nombre_corto": "RNW14",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#9D518F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-nw",
    "nombre": "Exprés Renania del Norte-Westfalia",
    "nombre_corto": "ENW",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#CCAC9C"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-nw",
    "nombre": "Ramales Renania del Norte-Westfalia",
    "nombre_corto": "LNW",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#333FA9"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-he",
    "nombre": "Regionales Hesse",
    "nombre_corto": "RHE15",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#629AB6"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-he",
    "nombre": "Exprés Hesse",
    "nombre_corto": "EHE",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#912DC3"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-he",
    "nombre": "Ramales Hesse",
    "nombre_corto": "LHE",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#C088D0"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-rp",
    "nombre": "Regionales Renania-Palatinado",
    "nombre_corto": "RRP",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "rp"
    ],
    "sede": "Maguncia",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#271B15"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-rp",
    "nombre": "Exprés Renania-Palatinado",
    "nombre_corto": "ERP",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "rp"
    ],
    "sede": "Maguncia",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#567622"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-rp",
    "nombre": "Ramales Renania-Palatinado",
    "nombre_corto": "LRP",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "rp"
    ],
    "sede": "Maguncia",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#85D12F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-sl",
    "nombre": "Regionales Sarre",
    "nombre_corto": "RSL",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sl"
    ],
    "sede": "Sarrebruck",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#B4643C"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-sl",
    "nombre": "Exprés Sarre",
    "nombre_corto": "ESL",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sl"
    ],
    "sede": "Sarrebruck",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#1BBF49"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-sl",
    "nombre": "Ramales Sarre",
    "nombre_corto": "LSL",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sl"
    ],
    "sede": "Sarrebruck",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#4A5256"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-bw",
    "nombre": "Regionales Baden-Wurtemberg",
    "nombre_corto": "RBW16",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#79AD63"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-bw",
    "nombre": "Exprés Baden-Wurtemberg",
    "nombre_corto": "EBW",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#A84070"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-bw",
    "nombre": "Ramales Baden-Wurtemberg",
    "nombre_corto": "LBW",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#D79B7D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-by",
    "nombre": "Regionales Baviera",
    "nombre_corto": "RBY17",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#3E2E8A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-by",
    "nombre": "Exprés Baviera",
    "nombre_corto": "EBY",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#6D8997"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-by",
    "nombre": "Ramales Baviera",
    "nombre_corto": "LBY",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#9C1CA4"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-th",
    "nombre": "Regionales Turingia",
    "nombre_corto": "RTH18",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "th"
    ],
    "sede": "Erfurt",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#CB77B1"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-th",
    "nombre": "Exprés Turingia",
    "nombre_corto": "ETH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "th"
    ],
    "sede": "Erfurt",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#32D2BE"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-th",
    "nombre": "Ramales Turingia",
    "nombre_corto": "LTH",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "th"
    ],
    "sede": "Erfurt",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#6165CB"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-sn",
    "nombre": "Regionales Sajonia",
    "nombre_corto": "RSN19",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#90C0D8"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-sn",
    "nombre": "Exprés Sajonia",
    "nombre_corto": "ESN",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#BF531D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-sn",
    "nombre": "Ramales Sajonia",
    "nombre_corto": "LSN",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#26AE2A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "reg-st",
    "nombre": "Regionales Sajonia-Anhalt",
    "nombre_corto": "RST",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "re",
      "rb",
      "rl",
      "s"
    ],
    "color": "#554137"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "exp-st",
    "nombre": "Exprés Sajonia-Anhalt",
    "nombre_corto": "EST",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "re",
      "ir",
      "ld"
    ],
    "color": "#849C44"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "hoja",
    "eslogan": "",
    "id": "ram-st",
    "nombre": "Ramales Sajonia-Anhalt",
    "nombre_corto": "LST",
    "tipo": "regional",
    "estado": "inventado",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "rl",
      "rb",
      "tur"
    ],
    "color": "#B32F51"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-berlin",
    "nombre": "Metro Berlín",
    "nombre_corto": "MUBER",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "u"
    ],
    "color": "#1A8A5E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-berlin",
    "nombre": "Tranvías Berlín",
    "nombre_corto": "TRBER",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#491D6B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-berlin",
    "nombre": "Cercanías Berlín",
    "nombre_corto": "SBBER",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "be"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#787878"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-hamburg",
    "nombre": "Metro Hamburgo",
    "nombre_corto": "MUHAM",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "u"
    ],
    "color": "#A7D385"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-hamburg",
    "nombre": "Tranvías Hamburgo",
    "nombre_corto": "TRHAM",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#D66692"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-hamburg",
    "nombre": "Cercanías Hamburgo",
    "nombre_corto": "SBHAM",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "hh"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#3DC19F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-munich",
    "nombre": "Metro Múnich",
    "nombre_corto": "MUMUN",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "u"
    ],
    "color": "#6C54AC"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-munich",
    "nombre": "Tranvías Múnich",
    "nombre_corto": "TRMUN",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#9BAFB9"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-munich",
    "nombre": "Cercanías Múnich",
    "nombre_corto": "SBMUN",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Múnich",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#CA42C6"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-cologne",
    "nombre": "Metro Colonia",
    "nombre_corto": "MUCOL",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "nw"
    ],
    "sede": "Colonia",
    "servicios": [
      "u"
    ],
    "color": "#319DD3"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-cologne",
    "nombre": "Tranvías Colonia",
    "nombre_corto": "TRCOL",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Colonia",
    "servicios": [
      "u",
      "t",
      "tt"
    ],
    "color": "#603018"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-cologne",
    "nombre": "Cercanías Colonia",
    "nombre_corto": "SBCOL",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Colonia",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#8F8B25"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-duesseldorf",
    "nombre": "Metro Düsseldorf",
    "nombre_corto": "MUDUE",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "u"
    ],
    "color": "#BE1E32"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-duesseldorf",
    "nombre": "Tranvías Düsseldorf",
    "nombre_corto": "TRDUE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "u",
      "t",
      "tt"
    ],
    "color": "#25793F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-duesseldorf",
    "nombre": "Cercanías Düsseldorf",
    "nombre_corto": "SBDUE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#54D44C"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-frankfurt",
    "nombre": "Metro Fráncfort",
    "nombre_corto": "MUFRA",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "he"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "u"
    ],
    "color": "#836759"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-frankfurt",
    "nombre": "Tranvías Fráncfort",
    "nombre_corto": "TRFRA",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#B2C266"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-frankfurt",
    "nombre": "Cercanías Fráncfort",
    "nombre_corto": "SBFRA",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Fráncfort",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#195573"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-stuttgart",
    "nombre": "Metro Stuttgart",
    "nombre_corto": "MUSTU",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "u"
    ],
    "color": "#48B080"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-stuttgart",
    "nombre": "Tranvías Stuttgart",
    "nombre_corto": "TRSTU",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "u",
      "t",
      "tt"
    ],
    "color": "#77438D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-stuttgart",
    "nombre": "Cercanías Stuttgart",
    "nombre_corto": "SBSTU",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#A69E9A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-hannover",
    "nombre": "Metro Hannover",
    "nombre_corto": "MUHAN",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "u"
    ],
    "color": "#D531A7"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-hannover",
    "nombre": "Tranvías Hannover",
    "nombre_corto": "TRHAN",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#3C8CB4"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-hannover",
    "nombre": "Cercanías Hannover",
    "nombre_corto": "SBHAN",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "ni"
    ],
    "sede": "Hannover",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#6B1FC1"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-leipzig",
    "nombre": "Metro Leipzig",
    "nombre_corto": "MULEI",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "sn"
    ],
    "sede": "Leipzig",
    "servicios": [
      "u"
    ],
    "color": "#9A7ACE"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-leipzig",
    "nombre": "Tranvías Leipzig",
    "nombre_corto": "TRLEI",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Leipzig",
    "servicios": [
      "t",
      "u"
    ],
    "color": "#C9D5DB"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-leipzig",
    "nombre": "Cercanías Leipzig",
    "nombre_corto": "SBLEI",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Leipzig",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#306820"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-dresden",
    "nombre": "Tranvías Dresde",
    "nombre_corto": "TRDRE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "t"
    ],
    "color": "#5FC32D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-dresden",
    "nombre": "Cercanías Dresde",
    "nombre_corto": "SBDRE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Dresde",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#8E563A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-nuremberg",
    "nombre": "Metro Núremberg",
    "nombre_corto": "MUNUR",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "by"
    ],
    "sede": "Núremberg",
    "servicios": [
      "u"
    ],
    "color": "#BDB147"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-nuremberg",
    "nombre": "Tranvías Núremberg",
    "nombre_corto": "TRNUR",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Núremberg",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#244454"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-nuremberg",
    "nombre": "Cercanías Núremberg",
    "nombre_corto": "SBNUR",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Núremberg",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#539F61"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-bremen",
    "nombre": "Tranvías Bremen",
    "nombre_corto": "TRBRE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "t"
    ],
    "color": "#82326E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-bremen",
    "nombre": "Cercanías Bremen",
    "nombre_corto": "SBBRE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "hb"
    ],
    "sede": "Bremen",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#B18D7B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-dortmund",
    "nombre": "Metro Dortmund",
    "nombre_corto": "MUDOR",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "u"
    ],
    "color": "#182088"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-dortmund",
    "nombre": "Tranvías Dortmund",
    "nombre_corto": "TRDOR",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#477B95"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-dortmund",
    "nombre": "Cercanías Dortmund",
    "nombre_corto": "SBDOR",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Dortmund",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#76D6A2"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-essen",
    "nombre": "Metro Essen",
    "nombre_corto": "MUESS",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "nw"
    ],
    "sede": "Essen",
    "servicios": [
      "u"
    ],
    "color": "#A569AF"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-essen",
    "nombre": "Tranvías Essen",
    "nombre_corto": "TRESS",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Essen",
    "servicios": [
      "u",
      "t"
    ],
    "color": "#D4C4BC"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-essen",
    "nombre": "Cercanías Essen",
    "nombre_corto": "SBESS",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Essen",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#3B57C9"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-bonn",
    "nombre": "Metro Bonn",
    "nombre_corto": "MUBON",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Bonn",
    "servicios": [
      "u"
    ],
    "color": "#6AB2D6"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-bonn",
    "nombre": "Tranvías Bonn",
    "nombre_corto": "TRBON",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Bonn",
    "servicios": [
      "t",
      "tt",
      "u"
    ],
    "color": "#99451B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-bonn",
    "nombre": "Cercanías Bonn",
    "nombre_corto": "SBBON",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Bonn",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#C8A028"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-mannheim",
    "nombre": "Tranvías Mannheim",
    "nombre_corto": "TRMAN",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Mannheim",
    "servicios": [
      "t",
      "tt"
    ],
    "color": "#2F3335"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-mannheim",
    "nombre": "Cercanías Mannheim",
    "nombre_corto": "SBMAN",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Mannheim",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#5E8E42"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-karlsruhe",
    "nombre": "Tranvías Karlsruhe",
    "nombre_corto": "TRKAR",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Karlsruhe",
    "servicios": [
      "tt",
      "t"
    ],
    "color": "#8D214F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-karlsruhe",
    "nombre": "Cercanías Karlsruhe",
    "nombre_corto": "SBKAR",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Karlsruhe",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#BC7C5C"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-augsburg",
    "nombre": "Tranvías Augsburgo",
    "nombre_corto": "TRAUG",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Augsburgo",
    "servicios": [
      "t"
    ],
    "color": "#23D769"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-augsburg",
    "nombre": "Cercanías Augsburgo",
    "nombre_corto": "SBAUG",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "by"
    ],
    "sede": "Augsburgo",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#526A76"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-kiel",
    "nombre": "Tranvías Kiel",
    "nombre_corto": "TRKIE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "sh"
    ],
    "sede": "Kiel",
    "servicios": [
      "t"
    ],
    "color": "#81C583"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-kiel",
    "nombre": "Cercanías Kiel",
    "nombre_corto": "SBKIE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "sh"
    ],
    "sede": "Kiel",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#B05890"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-rostock",
    "nombre": "Tranvías Rostock",
    "nombre_corto": "TRROS",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "mv"
    ],
    "sede": "Rostock",
    "servicios": [
      "t"
    ],
    "color": "#17B39D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-rostock",
    "nombre": "Cercanías Rostock",
    "nombre_corto": "SBROS",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "mv"
    ],
    "sede": "Rostock",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#4646AA"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-magdeburg",
    "nombre": "Tranvías Magdeburgo",
    "nombre_corto": "TRMAG",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "t"
    ],
    "color": "#75A1B7"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-magdeburg",
    "nombre": "Cercanías Magdeburgo",
    "nombre_corto": "SBMAG",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "st"
    ],
    "sede": "Magdeburgo",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#A434C4"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-erfurt",
    "nombre": "Tranvías Erfurt",
    "nombre_corto": "TRERF",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "th"
    ],
    "sede": "Erfurt",
    "servicios": [
      "t"
    ],
    "color": "#D38FD1"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-erfurt",
    "nombre": "Cercanías Erfurt",
    "nombre_corto": "SBERF",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "th"
    ],
    "sede": "Erfurt",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#3A2216"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-mainz",
    "nombre": "Tranvías Maguncia",
    "nombre_corto": "TRMAI",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "rp"
    ],
    "sede": "Maguncia",
    "servicios": [
      "t"
    ],
    "color": "#697D23"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-mainz",
    "nombre": "Cercanías Maguncia",
    "nombre_corto": "SBMAI",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "rp"
    ],
    "sede": "Maguncia",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#98D830"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-wiesbaden",
    "nombre": "Tranvías Wiesbaden",
    "nombre_corto": "TRWIE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "t"
    ],
    "color": "#C76B3D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-wiesbaden",
    "nombre": "Cercanías Wiesbaden",
    "nombre_corto": "SBWIE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "he"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#2EC64A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-potsdam",
    "nombre": "Tranvías Potsdam",
    "nombre_corto": "TRPOT",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bb"
    ],
    "sede": "Potsdam",
    "servicios": [
      "t"
    ],
    "color": "#5D5957"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-potsdam",
    "nombre": "Cercanías Potsdam",
    "nombre_corto": "SBPOT",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bb"
    ],
    "sede": "Potsdam",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#8CB464"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-chemnitz",
    "nombre": "Tranvías Chemnitz",
    "nombre_corto": "TRCHE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Chemnitz",
    "servicios": [
      "t"
    ],
    "color": "#BB4771"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-chemnitz",
    "nombre": "Cercanías Chemnitz",
    "nombre_corto": "SBCHE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "sn"
    ],
    "sede": "Chemnitz",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#22A27E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-freiburg",
    "nombre": "Tranvías Friburgo",
    "nombre_corto": "TRFRE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Friburgo",
    "servicios": [
      "t"
    ],
    "color": "#51358B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-freiburg",
    "nombre": "Cercanías Friburgo",
    "nombre_corto": "SBFRE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Friburgo",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#809098"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-ulm",
    "nombre": "Tranvías Ulm",
    "nombre_corto": "TRULM",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Ulm",
    "servicios": [
      "t"
    ],
    "color": "#AF23A5"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-ulm",
    "nombre": "Cercanías Ulm",
    "nombre_corto": "SBULM",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Ulm",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#167EB2"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "dominante",
    "logo_estilo": "u",
    "eslogan": "",
    "id": "mu-wuppertal",
    "nombre": "Metro Wuppertal",
    "nombre_corto": "MUWUP",
    "tipo": "urbano",
    "estado": "actual",
    "lands": [
      "nw"
    ],
    "sede": "Wuppertal",
    "servicios": [
      "u"
    ],
    "color": "#45D9BF"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-wuppertal",
    "nombre": "Tranvías Wuppertal",
    "nombre_corto": "TRWUP",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Wuppertal",
    "servicios": [
      "t",
      "u"
    ],
    "color": "#746CCC"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-wuppertal",
    "nombre": "Cercanías Wuppertal",
    "nombre_corto": "SBWUP",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Wuppertal",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#A3C7D9"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "t",
    "eslogan": "",
    "id": "tr-bielefeld",
    "nombre": "Tranvías Bielefeld",
    "nombre_corto": "TRBIE",
    "tipo": "urbano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Bielefeld",
    "servicios": [
      "t"
    ],
    "color": "#D25A1E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "anillo",
    "eslogan": "",
    "id": "sb-bielefeld",
    "nombre": "Cercanías Bielefeld",
    "nombre_corto": "SBBIE",
    "tipo": "metropolitano",
    "estado": "inventado",
    "lands": [
      "nw"
    ],
    "sede": "Bielefeld",
    "servicios": [
      "s",
      "or",
      "mc",
      "re"
    ],
    "color": "#39B52B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "corredor-sur",
    "nombre": "Corredor Sur Alemán",
    "nombre_corto": "CSA",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "by",
      "bw",
      "he"
    ],
    "sede": "Múnich",
    "servicios": [
      "av",
      "ld",
      "px"
    ],
    "color": "#684838"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "corredor-este",
    "nombre": "Corredor Este Libre",
    "nombre_corto": "CEL",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "be",
      "bb",
      "sn",
      "st"
    ],
    "sede": "Berlín",
    "servicios": [
      "ld",
      "ir",
      "px"
    ],
    "color": "#97A345"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "corredor-oeste",
    "nombre": "Corredor Oeste Rin",
    "nombre_corto": "COR",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "nw",
      "rp",
      "sl",
      "he"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "ld",
      "ir",
      "re"
    ],
    "color": "#C63652"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "corredor-norte",
    "nombre": "Corredor Norte Marítimo",
    "nombre_corto": "CNM",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "hh",
      "sh",
      "ni",
      "mv"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "ld",
      "re",
      "tur"
    ],
    "color": "#2D915F"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "premium-aleman",
    "nombre": "Premium Ciudades DE",
    "nombre_corto": "PCD",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "be",
      "hh",
      "nw",
      "by",
      "bw"
    ],
    "sede": "Berlín",
    "servicios": [
      "px",
      "ld",
      "ae"
    ],
    "color": "#5C246C"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "noche-plus",
    "nombre": "Noche Plus Alemania",
    "nombre_corto": "NPA",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "be",
      "by",
      "nw",
      "hh",
      "sn"
    ],
    "sede": "Berlín",
    "servicios": [
      "n"
    ],
    "color": "#8B7F79"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "aero-red",
    "nombre": "Red AeroAlemania",
    "nombre_corto": "RAA",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "be",
      "he",
      "by",
      "bw",
      "hh",
      "nw"
    ],
    "sede": "Berlín",
    "servicios": [
      "ae",
      "px"
    ],
    "color": "#BADA86"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "turismo-alpes",
    "nombre": "Turismo Alpes y Lagos",
    "nombre_corto": "TAL",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "by",
      "bw"
    ],
    "sede": "Múnich",
    "servicios": [
      "tur",
      "rl"
    ],
    "color": "#216D93"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "turismo-baltico",
    "nombre": "Turismo Báltico",
    "nombre_corto": "TBA",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "sh",
      "mv",
      "hh"
    ],
    "sede": "Kiel",
    "servicios": [
      "tur",
      "re"
    ],
    "color": "#50C8A0"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "feria-express",
    "nombre": "Feria Express Alemania",
    "nombre_corto": "FEA",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "he",
      "nw",
      "by",
      "sn",
      "be"
    ],
    "sede": "Wiesbaden",
    "servicios": [
      "px",
      "ae",
      "ld"
    ],
    "color": "#7F5BAD"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "uni-rail",
    "nombre": "Campus Rail Alemania",
    "nombre_corto": "CRA",
    "tipo": "especializado",
    "estado": "inventado",
    "lands": [
      "be",
      "by",
      "bw",
      "he",
      "ni",
      "sn"
    ],
    "sede": "Berlín",
    "servicios": [
      "re",
      "ir",
      "mc"
    ],
    "color": "#AEB6BA"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "carga-pasajeros",
    "nombre": "Mixtos Rápidos DE",
    "nombre_corto": "MRD",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "nw",
      "he",
      "by",
      "be"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "ld",
      "ir"
    ],
    "color": "#1549C7"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "open-south",
    "nombre": "Acceso Abierto Sur",
    "nombre_corto": "AAS",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "by",
      "bw"
    ],
    "sede": "Múnich",
    "servicios": [
      "ld",
      "px"
    ],
    "color": "#44A4D4"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "open-east",
    "nombre": "Acceso Abierto Este",
    "nombre_corto": "AAE",
    "tipo": "nacional",
    "estado": "inventado",
    "lands": [
      "be",
      "sn",
      "bb"
    ],
    "sede": "Berlín",
    "servicios": [
      "ld",
      "px"
    ],
    "color": "#733719"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-nl",
    "nombre": "Puente Países Bajos",
    "nombre_corto": "PPB",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "nw",
      "ni"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "av",
      "ld"
    ],
    "color": "#A29226"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-at",
    "nombre": "Puente Austria",
    "nombre_corto": "PAU",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "by",
      "bw"
    ],
    "sede": "Múnich",
    "servicios": [
      "av",
      "ld"
    ],
    "color": "#D12533"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-pl",
    "nombre": "Puente Polonia",
    "nombre_corto": "PPO",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "bb",
      "sn"
    ],
    "sede": "Potsdam",
    "servicios": [
      "ld",
      "ir"
    ],
    "color": "#388040"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-ch",
    "nombre": "Puente Suiza",
    "nombre_corto": "PSU",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "bw"
    ],
    "sede": "Stuttgart",
    "servicios": [
      "av",
      "ld"
    ],
    "color": "#67DB4D"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-cz",
    "nombre": "Puente Chequia",
    "nombre_corto": "PCH",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "sn",
      "by"
    ],
    "sede": "Dresde",
    "servicios": [
      "ld",
      "re"
    ],
    "color": "#966E5A"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "nicho",
    "logo_estilo": "barra",
    "eslogan": "",
    "id": "bridge-dk",
    "nombre": "Puente Dinamarca",
    "nombre_corto": "PDI",
    "tipo": "internacional",
    "estado": "inventado",
    "lands": [
      "sh",
      "hh"
    ],
    "sede": "Kiel",
    "servicios": [
      "ld",
      "av"
    ],
    "color": "#C5C967"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "hyperloop-no",
    "nombre": "Hiperconexión Norte 2040",
    "nombre_corto": "HN4",
    "tipo": "nacional",
    "estado": "futuro",
    "lands": [
      "hh",
      "be",
      "ni"
    ],
    "sede": "Hamburgo",
    "servicios": [
      "av",
      "px"
    ],
    "color": "#2C5C74"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "u-bahn-ruhr",
    "nombre": "Metro Ruhr Completo",
    "nombre_corto": "MRC",
    "tipo": "metropolitano",
    "estado": "futuro",
    "lands": [
      "nw"
    ],
    "sede": "Düsseldorf",
    "servicios": [
      "u",
      "s",
      "tt"
    ],
    "color": "#5BB781"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "s-bahn-east",
    "nombre": "S-Bahn Este Unificado",
    "nombre_corto": "SEU",
    "tipo": "metropolitano",
    "estado": "futuro",
    "lands": [
      "be",
      "bb",
      "sn"
    ],
    "sede": "Berlín",
    "servicios": [
      "s",
      "mc",
      "or"
    ],
    "color": "#8A4A8E"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "tram-nation",
    "nombre": "Red Tranviaria Federal",
    "nombre_corto": "RTF",
    "tipo": "urbano",
    "estado": "futuro",
    "lands": [
      "be",
      "nw",
      "by",
      "bw",
      "sn",
      "ni",
      "he"
    ],
    "sede": "Berlín",
    "servicios": [
      "t",
      "tt"
    ],
    "color": "#B9A59B"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "ice-next",
    "nombre": "ICE Next Generation",
    "nombre_corto": "ING",
    "tipo": "nacional",
    "estado": "futuro",
    "lands": [
      "be",
      "hh",
      "nw",
      "by",
      "bw",
      "he"
    ],
    "sede": "Berlín",
    "servicios": [
      "av",
      "px"
    ],
    "color": "#2038A8"
  },
  {
    "color_secundario": "#FFFFFF",
    "competencia": "competitiva",
    "logo_estilo": "barra",
    "eslogan": "Plan 2035–2040",
    "id": "region-plus",
    "nombre": "RegioPlus Alemania",
    "nombre_corto": "RPA",
    "tipo": "regional",
    "estado": "futuro",
    "lands": [
      "be",
      "bb",
      "mv",
      "sh",
      "hh",
      "ni",
      "hb",
      "nw",
      "he",
      "rp",
      "sl",
      "bw",
      "by",
      "th",
      "sn",
      "st"
    ],
    "sede": "Berlín",
    "servicios": [
      "re",
      "rb",
      "ir"
    ],
    "color": "#4F93B5"
  }
];
