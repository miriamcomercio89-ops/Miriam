/**
 * Estaciones del Reino Unido: nodos reales densos + ficticios de relleno.
 */
const major = [
  ["london-euston", "Londres Euston", "lon", 51.528, -0.133, 1, ["av", "ld", "s"]],
  ["london-kings-cross", "Londres King's Cross", "lon", 51.532, -0.123, 1, ["av", "ld", "s", "u"]],
  ["london-st-pancras", "Londres St Pancras", "lon", 51.531, -0.126, 1, ["av", "ld", "s", "u"]],
  ["london-paddington", "Londres Paddington", "lon", 51.515, -0.175, 1, ["av", "ld", "s", "ae", "u"]],
  ["london-waterloo", "Londres Waterloo", "lon", 51.503, -0.113, 1, ["ld", "re", "s", "u"]],
  ["london-victoria", "Londres Victoria", "lon", 51.495, -0.144, 1, ["re", "s", "ae", "u"]],
  ["london-liverpool-street", "Londres Liverpool Street", "lon", 51.518, -0.081, 1, ["ld", "re", "s", "ae", "u"]],
  ["london-london-bridge", "Londres London Bridge", "lon", 51.505, -0.086, 1, ["re", "s", "u"]],
  ["london-charing-cross", "Londres Charing Cross", "lon", 51.508, -0.125, 1, ["re", "s"]],
  ["london-fenchurch", "Londres Fenchurch Street", "lon", 51.511, -0.078, 1, ["re", "s"]],
  ["london-marylebone", "Londres Marylebone", "lon", 51.522, -0.163, 1, ["ld", "re"]],
  ["london-cannon-street", "Londres Cannon Street", "lon", 51.511, -0.09, 2, ["re", "s"]],
  ["london-blackfriars", "Londres Blackfriars", "lon", 51.512, -0.103, 2, ["s", "u"]],
  ["stratford", "Stratford", "lon", 51.541, -0.004, 1, ["s", "u", "re", "ae"]],
  ["clapham-junction", "Clapham Junction", "lon", 51.464, -0.17, 1, ["s", "re", "mc"]],
  ["birmingham-new-street", "Birmingham New Street", "wm", 52.478, -1.899, 1, ["av", "ld", "re", "s"]],
  ["birmingham-moor-street", "Birmingham Moor Street", "wm", 52.479, -1.892, 2, ["re", "ld"]],
  ["birmingham-curzon", "Birmingham Curzon Street", "wm", 52.482, -1.885, 1, ["av", "px"], "ficticia"],
  ["manchester-piccadilly", "Manchester Piccadilly", "nw", 53.477, -2.23, 1, ["ld", "re", "s", "ae"]],
  ["manchester-victoria", "Manchester Victoria", "nw", 53.487, -2.243, 1, ["re", "s", "t"]],
  ["liverpool-lime-street", "Liverpool Lime Street", "nw", 53.408, -2.978, 1, ["ld", "re", "s"]],
  ["leeds", "Leeds", "yh", 53.795, -1.548, 1, ["ld", "re", "s"]],
  ["sheffield", "Sheffield", "yh", 53.378, -1.462, 1, ["ld", "re", "t"]],
  ["york", "York", "yh", 53.958, -1.093, 1, ["av", "ld", "re"]],
  ["newcastle", "Newcastle", "ne", 54.968, -1.617, 1, ["av", "ld", "u"]],
  ["edinburgh-waverley", "Edimburgo Waverley", "sct", 55.952, -3.188, 1, ["av", "ld", "re", "s"]],
  ["edinburgh-haymarket", "Edimburgo Haymarket", "sct", 55.945, -3.218, 2, ["ld", "re", "t"]],
  ["glasgow-central", "Glasgow Central", "sct", 55.859, -4.258, 1, ["ld", "re", "s"]],
  ["glasgow-queen-street", "Glasgow Queen Street", "sct", 55.862, -4.251, 1, ["re", "ld", "s"]],
  ["cardiff-central", "Cardiff Central", "wls", 51.476, -3.179, 1, ["ld", "re", "s"]],
  ["bristol-temple-meads", "Bristol Temple Meads", "sw", 51.449, -2.58, 1, ["ld", "re", "s"]],
  ["reading", "Reading", "se", 51.458, -0.971, 1, ["av", "ld", "re", "s"]],
  ["gatwick-airport", "Gatwick Airport", "se", 51.156, -0.161, 1, ["ae", "s", "re"]],
  ["heathrow-t2-3", "Heathrow Terminals 2 & 3", "lon", 51.471, -0.454, 1, ["ae", "s"]],
  ["stansted-airport", "Stansted Airport", "ee", 51.889, 0.261, 1, ["ae", "re"]],
  ["luton-airport-parkway", "Luton Airport Parkway", "ee", 51.873, -0.396, 2, ["ae", "s"]],
  ["birmingham-airport", "Birmingham International", "wm", 52.451, -1.725, 2, ["ae", "re", "ld"]],
  ["manchester-airport", "Manchester Airport", "nw", 53.365, -2.273, 1, ["ae", "s", "re"]],
  ["belfast-grand-central", "Belfast Grand Central", "nir", 54.595, -5.941, 1, ["ld", "re", "s"]],
  ["belfast-lanyon", "Belfast Lanyon Place", "nir", 54.595, -5.917, 2, ["re", "s"]],
];

const corridorStations = {
  wcml: [
    ["watford-junction", "Watford Junction", "lon", 51.663, -0.396],
    ["milton-keynes", "Milton Keynes Central", "se", 52.034, -0.774],
    ["northampton", "Northampton", "em", 52.238, -0.907],
    ["rugby", "Rugby", "wm", 52.379, -1.25],
    ["coventry", "Coventry", "wm", 52.401, -1.513],
    ["birmingham-international", "Birmingham International", "wm", 52.451, -1.725],
    ["wolverhampton", "Wolverhampton", "wm", 52.587, -2.12],
    ["stafford", "Stafford", "wm", 52.804, -2.122],
    ["stoke", "Stoke-on-Trent", "wm", 53.008, -2.181],
    ["crewe", "Crewe", "nw", 53.089, -2.433],
    ["warrington-bank-quay", "Warrington Bank Quay", "nw", 53.386, -2.603],
    ["wigan-north-western", "Wigan North Western", "nw", 53.543, -2.633],
    ["preston", "Preston", "nw", 53.756, -2.708],
    ["lancaster", "Lancaster", "nw", 54.049, -2.808],
    ["oxenholme", "Oxenholme Lake District", "nw", 54.305, -2.722],
    ["penrith", "Penrith", "nw", 54.662, -2.757],
    ["carlisle", "Carlisle", "nw", 54.891, -2.933],
    ["lockerbie", "Lockerbie", "sct", 55.123, -3.354],
    ["motherwell", "Motherwell", "sct", 55.791, -3.994],
  ],
  ecml: [
    ["stevenage", "Stevenage", "ee", 51.902, -0.207],
    ["hitchin", "Hitchin", "ee", 51.953, -0.263],
    ["peterborough", "Peterborough", "ee", 52.575, -0.25],
    ["grantham", "Grantham", "em", 52.906, -0.642],
    ["newark-north-gate", "Newark North Gate", "em", 53.081, -0.81],
    ["retford", "Retford", "em", 53.315, -0.948],
    ["doncaster", "Doncaster", "yh", 53.522, -1.14],
    ["selby", "Selby", "yh", 53.783, -1.064],
    ["northallerton", "Northallerton", "yh", 54.333, -1.441],
    ["darlington", "Darlington", "ne", 54.524, -1.547],
    ["durham", "Durham", "ne", 54.779, -1.582],
    ["morpeth", "Morpeth", "ne", 55.162, -1.683],
    ["alnmouth", "Alnmouth", "ne", 55.392, -1.728],
    ["berwick", "Berwick-upon-Tweed", "ne", 55.774, -2.01],
    ["dunbar", "Dunbar", "sct", 55.998, -2.513],
  ],
  gwml: [
    ["slough", "Slough", "se", 51.512, -0.592],
    ["maidenhead", "Maidenhead", "se", 51.519, -0.722],
    ["twyford", "Twyford", "se", 51.476, -0.863],
    ["didcot", "Didcot Parkway", "se", 51.611, -1.243],
    ["swindon", "Swindon", "sw", 51.565, -1.785],
    ["chippenham", "Chippenham", "sw", 51.462, -2.116],
    ["bath-spa", "Bath Spa", "sw", 51.378, -2.357],
    ["bristol-parkway", "Bristol Parkway", "sw", 51.514, -2.543],
    ["newport", "Newport", "wls", 51.589, -2.999],
    ["bridgend", "Bridgend", "wls", 51.507, -3.575],
    ["port-talbot", "Port Talbot Parkway", "wls", 51.592, -3.781],
    ["neath", "Neath", "wls", 51.662, -3.807],
    ["swansea", "Swansea", "wls", 51.625, -3.941],
  ],
  mml: [
    ["st-albans", "St Albans City", "ee", 51.75, -0.327],
    ["luton", "Luton", "ee", 51.882, -0.414],
    ["bedford", "Bedford", "ee", 52.136, -0.479],
    ["wellingborough", "Wellingborough", "em", 52.304, -0.674],
    ["kettering", "Kettering", "em", 52.393, -0.732],
    ["market-harborough", "Market Harborough", "em", 52.479, -0.909],
    ["leicester", "Leicester", "em", 52.631, -1.125],
    ["loughborough", "Loughborough", "em", 52.779, -1.196],
    ["derby", "Derby", "em", 52.916, -1.463],
    ["chesterfield", "Chesterfield", "em", 53.238, -1.37],
  ],
  anglia: [
    ["stratford-intl", "Stratford International", "lon", 51.545, -0.009],
    ["romford", "Romford", "lon", 51.575, 0.183],
    ["chelmsford", "Chelmsford", "ee", 51.736, 0.469],
    ["colchester", "Colchester", "ee", 51.901, 0.893],
    ["ipswich", "Ipswich", "ee", 52.051, 1.144],
    ["norwich", "Norwich", "ee", 52.627, 1.307],
    ["cambridge", "Cambridge", "ee", 52.194, 0.137],
    ["ely", "Ely", "ee", 52.391, 0.267],
    ["kings-lynn", "King's Lynn", "ee", 52.754, 0.403],
  ],
  southwest: [
    ["woking", "Woking", "se", 51.318, -0.557],
    ["basingstoke", "Basingstoke", "se", 51.268, -1.087],
    ["winchester", "Winchester", "se", 51.067, -1.32],
    ["southampton-central", "Southampton Central", "se", 50.908, -1.414],
    ["bournemouth", "Bournemouth", "se", 50.727, -1.864],
    ["poole", "Poole", "se", 50.719, -1.983],
    ["dorchester", "Dorchester South", "sw", 50.711, -2.437],
    ["weymouth", "Weymouth", "sw", 50.616, -2.455],
    ["salisbury", "Salisbury", "sw", 51.071, -1.806],
    ["exeter-st-davids", "Exeter St Davids", "sw", 50.729, -3.544],
    ["newton-abbot", "Newton Abbot", "sw", 50.53, -3.599],
    ["plymouth", "Plymouth", "sw", 50.378, -4.143],
    ["truro", "Truro", "sw", 50.264, -5.064],
    ["penzance", "Penzance", "sw", 50.122, -5.533],
  ],
  southeast: [
    ["ashford-intl", "Ashford International", "se", 51.143, 0.875],
    ["canterbury-west", "Canterbury West", "se", 51.284, 1.075],
    ["dover-priory", "Dover Priory", "se", 51.126, 1.305],
    ["ramsgate", "Ramsgate", "se", 51.341, 1.406],
    ["brighton", "Brighton", "se", 50.829, -0.141],
    ["eastbourne", "Eastbourne", "se", 50.769, 0.281],
    ["hastings", "Hastings", "se", 50.855, 0.577],
    ["guildford", "Guildford", "se", 51.237, -0.58],
    ["portsmouth-harbour", "Portsmouth Harbour", "se", 50.797, -1.108],
    ["brighton-airport-fictional", "Brighton Airport Parkway", "se", 50.84, -0.2],
  ],
  cross: [
    ["oxford", "Oxford", "se", 51.753, -1.27],
    ["banbury", "Banbury", "se", 52.06, -1.328],
    ["leamington", "Leamington Spa", "wm", 52.285, -1.536],
    ["nottingham", "Nottingham", "em", 52.947, -1.147],
    ["lincoln", "Lincoln", "em", 53.226, -0.539],
    ["hull", "Hull", "yh", 53.744, -0.346],
    ["bradford-interchange", "Bradford Interchange", "yh", 53.791, -1.749],
    ["huddersfield", "Huddersfield", "yh", 53.648, -1.785],
    ["wakefield-westgate", "Wakefield Westgate", "yh", 53.682, -1.506],
    ["chester", "Chester", "nw", 53.197, -2.88],
    ["shrewsbury", "Shrewsbury", "wm", 52.711, -2.75],
    ["hereford", "Hereford", "wm", 52.061, -2.708],
    ["worcester-foregate", "Worcester Foregate Street", "wm", 52.195, -2.221],
    ["gloucester", "Gloucester", "sw", 51.865, -2.239],
  ],
  scotland: [
    ["stirling", "Stirling", "sct", 56.119, -3.935],
    ["perth", "Perth", "sct", 56.392, -3.44],
    ["dundee", "Dundee", "sct", 56.457, -2.971],
    ["aberdeen", "Aberdeen", "sct", 57.144, -2.098],
    ["inverness", "Inverness", "sct", 57.48, -4.223],
    ["fort-william", "Fort William", "sct", 56.82, -5.106],
    ["oban", "Oban", "sct", 56.412, -5.475],
    ["mallaig", "Mallaig", "sct", 57.006, -5.83],
    ["kyle", "Kyle of Lochalsh", "sct", 57.28, -5.714],
    ["wick", "Wick", "sct", 58.442, -3.098],
    ["thurso", "Thurso", "sct", 58.59, -3.528],
    ["aviermore", "Aviemore", "sct", 57.189, -3.827],
    ["kirkcaldy", "Kirkcaldy", "sct", 56.112, -3.167],
    ["paisley-gilmour", "Paisley Gilmour Street", "sct", 55.847, -4.424],
    ["ayr", "Ayr", "sct", 55.458, -4.626],
  ],
  wales: [
    ["wrexham-general", "Wrexham General", "wls", 53.05, -3.0],
    ["bangor", "Bangor", "wls", 53.223, -4.136],
    ["holyhead", "Holyhead", "wls", 53.308, -4.631],
    ["aberystwyth", "Aberystwyth", "wls", 52.414, -4.082],
    ["machynlleth", "Machynlleth", "wls", 52.595, -3.855],
    ["llandudno", "Llandudno", "wls", 53.321, -3.827],
    ["carmarthen", "Carmarthen", "wls", 51.853, -4.306],
    ["pembroke-dock", "Pembroke Dock", "wls", 51.694, -4.938],
  ],
  ni: [
    ["lisburn", "Lisburn", "nir", 54.514, -6.044],
    ["portadown", "Portadown", "nir", 54.424, -6.443],
    ["newry", "Newry", "nir", 54.188, -6.362],
    ["coleraine", "Coleraine", "nir", 55.134, -6.661],
    ["derry", "Derry~Londonderry", "nir", 54.998, -7.315],
    ["bangor-ni", "Bangor (NI)", "nir", 54.657, -5.67],
    ["larne", "Larne Harbour", "nir", 54.854, -5.798],
  ],
  london_metro: [
    ["london-bridge-corridor", "London Bridge East", "lon", 51.505, -0.07],
    ["canary-wharf", "Canary Wharf", "lon", 51.505, -0.02],
    ["woolwich", "Woolwich", "lon", 51.492, 0.07],
    ["abbey-wood", "Abbey Wood", "lon", 51.491, 0.12],
    ["tottenham-hale", "Tottenham Hale", "lon", 51.588, -0.06],
    ["finsbury-park", "Finsbury Park", "lon", 51.564, -0.106],
    ["highbury", "Highbury & Islington", "lon", 51.546, -0.104],
    ["willesden-junction", "Willesden Junction", "lon", 51.532, -0.245],
    ["richmond", "Richmond", "lon", 51.463, -0.301],
    ["wimbledon", "Wimbledon", "lon", 51.421, -0.206],
    ["east-croydon", "East Croydon", "lon", 51.375, -0.092],
    ["west-croydon", "West Croydon", "lon", 51.378, -0.102],
    ["lewisham", "Lewisham", "lon", 51.465, -0.014],
    ["greenwich", "Greenwich", "lon", 51.478, -0.013],
  ],
};

function hub(id, nombre, land, lat, lon, tier, roles, origen_datos = "real") {
  return { id, nombre, land, lat, lon, tier, roles, origen_datos };
}

function expandCorridorGroups() {
  const out = [];
  for (const [group, list] of Object.entries(corridorStations)) {
    for (const row of list) {
      const [id, nombre, land, lat, lon] = row;
      const fict = id.includes("fictional") || id.includes("curzon");
      out.push(
        hub(
          id,
          nombre,
          land,
          lat,
          lon,
          2,
          group.includes("metro") ? ["s", "u", "t", "mc"] : ["ld", "re", "rb", "s"],
          fict ? "ficticia" : "real"
        )
      );
    }
  }
  return out;
}

function expandLocals(count = 280) {
  const centers = {
    lon: [51.5, -0.12],
    se: [51.2, -0.5],
    sw: [50.8, -3.5],
    ee: [52.2, 0.3],
    em: [52.8, -1.2],
    wm: [52.5, -1.9],
    nw: [53.5, -2.5],
    ne: [54.9, -1.6],
    yh: [53.8, -1.5],
    sct: [56.5, -4.0],
    wls: [52.0, -3.5],
    nir: [54.6, -6.0],
  };
  const prefixes = ["Villa", "Nueva", "Alto", "Bajo", "Puerto", "Campo", "Parque", "Cruz", "Valle", "Muelles", "Universidad", "Feria"];
  const suffixes = ["Estación", "Apeadero", "Central", "Parkway", "Junction", "Bridge", "Gate", "Quay", "North", "South"];
  const lands = Object.keys(centers);
  const out = [];
  for (let i = 0; i < count; i++) {
    const land = lands[i % lands.length];
    const [blat, blon] = centers[land];
    const ring = Math.floor(i / lands.length) + 1;
    out.push(
      hub(
        `fx-${land}-${String(i + 1).padStart(3, "0")}`,
        `${prefixes[i % prefixes.length]} ${suffixes[(i * 5) % suffixes.length]} ${ring}`,
        land,
        blat + ((i * 17) % 40) * 0.015 - 0.3,
        blon + ((i * 29) % 40) * 0.02 - 0.4,
        4,
        i % 5 === 0 ? ["tur", "rl"] : ["rb", "rl", "re"],
        "ficticia"
      )
    );
  }
  // orbitales / cruces ficticios
  const orbitals = [
    ["london-orbital-n", "Londres Orbital Norte", "lon", 51.62, -0.12, ["s", "or", "mc"]],
    ["london-orbital-s", "Londres Orbital Sur", "lon", 51.38, -0.12, ["s", "or", "mc"]],
    ["london-orbital-e", "Londres Orbital Este", "lon", 51.52, 0.1, ["s", "or", "mc"]],
    ["london-orbital-w", "Londres Orbital Oeste", "lon", 51.52, -0.35, ["s", "or", "mc"]],
    ["manchester-orbital", "Manchester Orbital", "nw", 53.48, -2.2, ["s", "or", "t"]],
    ["birmingham-orbital", "Birmingham Orbital", "wm", 52.48, -1.9, ["s", "or", "tt"]],
    ["leeds-orbital", "Leeds Orbital", "yh", 53.8, -1.55, ["s", "or"]],
    ["glasgow-orbital", "Glasgow Orbital", "sct", 55.86, -4.25, ["s", "or", "u"]],
    ["cardiff-bay-hub", "Cardiff Bay Hub", "wls", 51.46, -3.16, ["s", "t", "re"]],
    ["hs2-old-oak", "Old Oak Common HS2", "lon", 51.525, -0.248, ["av", "s", "ae"]],
    ["middlesbrough", "Middlesbrough", "yh", 54.579, -1.234, ["re", "ld"]],
    ["antrim", "Antrim", "nir", 54.718, -6.205, ["re", "rb"]],
    ["liverpool-central", "Liverpool Central", "nw", 53.404, -2.98, ["s", "u"]],
    ["southport", "Southport", "nw", 53.647, -3.002, ["s", "re"]],
    ["ormskirk", "Ormskirk", "nw", 53.569, -2.989, ["s", "rb"]],
    ["new-cross", "New Cross", "lon", 51.476, -0.033, ["s", "re"]],
  ];
  for (const [id, nombre, land, lat, lon, roles] of orbitals) {
    out.push(hub(id, nombre, land, lat, lon, 3, roles, "ficticia"));
  }
  return out;
}

export function buildHubsDocument() {
  const hubs = [];
  for (const row of major) {
    const origen = row[7] || "real";
    hubs.push(hub(row[0], row[1], row[2], row[3], row[4], row[5], row[6], origen));
  }
  hubs.push(...expandCorridorGroups(), ...expandLocals(300));
  const map = new Map();
  for (const h of hubs) map.set(h.id, h);
  const list = [...map.values()];
  return {
    version: "0.3.0",
    pais: "Reino Unido",
    nota: "Estaciones reales UK + nodos metropolitanos + ficticios de densificación.",
    total: list.length,
    hubs: list,
  };
}
