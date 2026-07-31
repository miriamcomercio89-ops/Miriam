/**
 * Operadores de Alemania: actuales, futuros e inventados (nombres en español según tipo y ubicación).
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
  }
];
