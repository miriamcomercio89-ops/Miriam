/**
 * Hubs/estaciones: nodos reales densificados + muchos ficticios de relleno.
 */

const realHubs = [
  // Tier 1
  ["berlin-hbf", "Berlín Central", "be", 52.525, 13.369, 1, ["av", "ld", "s", "u", "ae"]],
  ["hamburg-hbf", "Hamburgo Central", "hh", 53.553, 10.006, 1, ["av", "ld", "s", "u", "ae"]],
  ["muenchen-hbf", "Múnich Central", "by", 48.14, 11.558, 1, ["av", "ld", "s", "u", "ae"]],
  ["frankfurt-hbf", "Fráncfort del Meno Central", "he", 50.107, 8.663, 1, ["av", "ld", "s", "u", "ae"]],
  ["koeln-hbf", "Colonia Central", "nw", 50.943, 6.958, 1, ["av", "ld", "s", "t"]],
  ["stuttgart-hbf", "Stuttgart Central", "bw", 48.784, 9.182, 1, ["av", "ld", "s", "t", "ae"]],
  ["duesseldorf-hbf", "Düsseldorf Central", "nw", 51.22, 6.794, 1, ["ld", "s", "t", "ae"]],
  ["hannover-hbf", "Hannover Central", "ni", 52.377, 9.742, 1, ["av", "ld", "s", "t"]],
  ["nuernberg-hbf", "Núremberg Central", "by", 49.446, 11.082, 1, ["av", "ld", "s", "u"]],
  ["leipzig-hbf", "Leipzig Central", "sn", 51.345, 12.381, 1, ["av", "ld", "s", "t"]],
  ["dresden-hbf", "Dresde Central", "sn", 51.04, 13.732, 1, ["ld", "s", "t"]],
  ["dortmund-hbf", "Dortmund Central", "nw", 51.518, 7.459, 1, ["ld", "s", "re"]],
  ["essen-hbf", "Essen Central", "nw", 51.451, 7.014, 1, ["ld", "s", "re"]],
  ["bremen-hbf", "Bremen Central", "hb", 53.083, 8.814, 1, ["ld", "re", "t"]],
  ["mannheim-hbf", "Mannheim Central", "bw", 49.479, 8.469, 1, ["av", "ld", "re"]],
  ["erfurt-hbf", "Erfurt Central", "th", 50.973, 11.038, 1, ["av", "ld", "re"]],
  // Tier 2
  ["karlsruhe-hbf", "Karlsruhe Central", "bw", 48.993, 8.401, 2, ["ld", "re", "tt"]],
  ["freiburg-hbf", "Friburgo Central", "bw", 47.998, 7.842, 2, ["ld", "re", "tur"]],
  ["augsburg-hbf", "Augsburgo Central", "by", 48.365, 10.886, 2, ["ld", "re", "s"]],
  ["regensburg-hbf", "Ratisbona Central", "by", 49.011, 12.099, 2, ["ld", "re"]],
  ["wuerzburg-hbf", "Wurzburgo Central", "by", 49.801, 9.936, 2, ["av", "ld", "re"]],
  ["magdeburg-hbf", "Magdeburgo Central", "st", 52.13, 11.627, 2, ["ld", "re", "t"]],
  ["potsdam-hbf", "Potsdam Central", "bb", 52.392, 13.067, 2, ["re", "s"]],
  ["rostock-hbf", "Rostock Central", "mv", 54.078, 12.131, 2, ["ld", "re", "t"]],
  ["kiel-hbf", "Kiel Central", "sh", 54.315, 10.132, 2, ["ld", "re", "ae"]],
  ["luebeck-hbf", "Lübeck Central", "sh", 53.867, 10.669, 2, ["ld", "re", "tur"]],
  ["saarbruecken-hbf", "Sarrebruck Central", "sl", 49.241, 6.991, 2, ["ld", "re"]],
  ["mainz-hbf", "Maguncia Central", "rp", 50.001, 8.259, 2, ["ld", "re", "s"]],
  ["koblenz-hbf", "Coblenza Central", "rp", 50.351, 7.588, 2, ["ld", "re", "tur"]],
  ["aachen-hbf", "Aquisgrán Central", "nw", 50.768, 6.091, 2, ["av", "ld", "re"]],
  ["kassel-wilhelmshoehe", "Kassel Wilhelmshöhe", "he", 51.312, 9.447, 2, ["av", "ld", "re"]],
  ["ulm-hbf", "Ulm Central", "bw", 48.399, 9.983, 2, ["ld", "re"]],
  ["heilbronn-hbf", "Heilbronn Central", "bw", 49.143, 9.21, 2, ["re", "tt"]],
  ["offenburg", "Offenburg", "bw", 48.476, 7.946, 2, ["ld", "re"]],
  ["basel-bad", "Basilea Bad Bf", "bw", 47.567, 7.607, 2, ["ld", "av", "ir"]],
  ["ingolstadt-hbf", "Ingolstadt Central", "by", 48.744, 11.437, 2, ["ld", "re"]],
  ["landshut-hbf", "Landshut Central", "by", 48.547, 12.147, 2, ["re", "rb"]],
  ["passau-hbf", "Passau Central", "by", 48.574, 13.451, 2, ["ld", "re"]],
  ["bamberg", "Bamberg", "by", 49.901, 10.899, 2, ["ld", "re"]],
  ["hof-hbf", "Hof Central", "by", 50.308, 11.923, 2, ["re", "rb"]],
  ["schweinfurt-hbf", "Schweinfurt Central", "by", 50.057, 10.211, 2, ["re", "rb"]],
  ["wiesbaden-hbf", "Wiesbaden Central", "he", 50.071, 8.244, 2, ["re", "s", "tt"]],
  ["darmstadt-hbf", "Darmstadt Central", "he", 49.872, 8.629, 2, ["re", "s"]],
  ["fulda", "Fulda", "he", 50.554, 9.684, 2, ["av", "ld", "re"]],
  ["giessen", "Giessen", "he", 50.579, 8.666, 2, ["re", "rb"]],
  ["marburg", "Marburg", "he", 50.819, 8.775, 2, ["re", "rb"]],
  ["bonn-hbf", "Bonn Central", "nw", 50.732, 7.097, 2, ["ld", "re", "t"]],
  ["wuppertal-hbf", "Wuppertal Central", "nw", 51.255, 7.15, 2, ["re", "s"]],
  ["bochum-hbf", "Bochum Central", "nw", 51.479, 7.223, 2, ["re", "s"]],
  ["duisburg-hbf", "Duisburgo Central", "nw", 51.43, 6.776, 2, ["ld", "s", "re"]],
  ["muenster-hbf", "Münster Central", "nw", 51.957, 7.635, 2, ["ld", "re"]],
  ["bielefeld-hbf", "Bielefeld Central", "nw", 52.029, 8.533, 2, ["ld", "re"]],
  ["hagen-hbf", "Hagen Central", "nw", 51.363, 7.46, 2, ["re", "s"]],
  ["solingen-hbf", "Solingen Central", "nw", 51.162, 7.004, 2, ["re", "s"]],
  ["krefeld-hbf", "Krefeld Central", "nw", 51.326, 6.568, 2, ["re", "rb"]],
  ["moenchengladbach-hbf", "Mönchengladbach Central", "nw", 51.197, 6.446, 2, ["re", "rb"]],
  ["osnabrueck-hbf", "Osnabrück Central", "ni", 52.273, 8.061, 2, ["ld", "re"]],
  ["oldenburg-hbf", "Oldemburgo Central", "ni", 53.144, 8.222, 2, ["ld", "re"]],
  ["goettingen", "Gotinga", "ni", 51.537, 9.928, 2, ["av", "ld", "re"]],
  ["braunschweig-hbf", "Brunswick Central", "ni", 52.252, 10.54, 2, ["ld", "re"]],
  ["wolfsburg-hbf", "Wolfsburgo Central", "ni", 52.429, 10.788, 2, ["ld", "re"]],
  ["hildesheim-hbf", "Hildesheim Central", "ni", 52.16, 9.952, 2, ["re", "rb"]],
  ["celle", "Celle", "ni", 52.621, 10.063, 2, ["re", "rb"]],
  ["luneburg", "Luneburgo", "ni", 53.25, 10.42, 2, ["re", "rb"]],
  ["flensburg", "Flensburgo", "sh", 54.775, 9.436, 2, ["re", "ld"]],
  ["neumuenster", "Neumünster", "sh", 54.076, 9.984, 2, ["re", "rb"]],
  ["schwerin-hbf", "Schwerin Central", "mv", 53.634, 11.408, 2, ["ld", "re"]],
  ["stralsund-hbf", "Stralsund Central", "mv", 54.309, 13.077, 2, ["re", "tur"]],
  ["greifswald", "Greifswald", "mv", 54.093, 13.371, 2, ["re", "rb"]],
  ["neuruppin", "Neuruppin Rheinsberger Tor", "bb", 52.927, 12.81, 2, ["re", "rb"]],
  ["cottbus-hbf", "Cottbus Central", "bb", 51.756, 14.326, 2, ["ld", "re"]],
  ["frankfurt-oder", "Fráncfort del Óder", "bb", 52.337, 14.547, 2, ["ld", "re"]],
  ["brandenburg-hbf", "Brandeburgo Central", "bb", 52.401, 12.564, 2, ["re", "rb"]],
  ["dessau-hbf", "Dessau Central", "st", 51.84, 12.235, 2, ["re", "tur"]],
  ["halle-hbf", "Halle Central", "st", 51.479, 11.987, 2, ["ld", "re", "s"]],
  ["chemnitz-hbf", "Chemnitz Central", "sn", 50.84, 12.931, 2, ["re", "tt"]],
  ["zwickau-hbf", "Zwickau Central", "sn", 50.715, 12.477, 2, ["re", "rb"]],
  ["gera-hbf", "Gera Central", "th", 50.883, 12.077, 2, ["re", "rb"]],
  ["jena-paradies", "Jena Paradies", "th", 50.925, 11.594, 2, ["re", "rb"]],
  ["weimar", "Weimar", "th", 50.992, 11.328, 2, ["re", "ld"]],
  ["eisenach", "Eisenach", "th", 50.977, 10.332, 2, ["ld", "re"]],
  ["trier-hbf", "Tréveris Central", "rp", 49.757, 6.652, 2, ["re", "tur"]],
  ["kaiserslautern-hbf", "Kaiserslautern Central", "rp", 49.436, 7.769, 2, ["re", "rb"]],
  ["ludwigshafen-hbf", "Ludwigshafen Central", "rp", 49.478, 8.434, 2, ["re", "s"]],
  ["heidelberg-hbf", "Heidelberg Central", "bw", 49.404, 8.675, 2, ["ld", "re", "s"]],
  ["reutlingen-hbf", "Reutlingen Central", "bw", 48.496, 9.209, 2, ["re", "rb"]],
  ["konstanz", "Constanza", "bw", 47.659, 9.178, 2, ["re", "tur"]],
  ["friedrichshafen-stadt", "Friedrichshafen Ciudad", "bw", 47.653, 9.473, 2, ["re", "tur"]],
  ["rosenheim", "Rosenheim", "by", 47.85, 12.119, 2, ["ld", "re"]],
  ["kempten", "Kempten", "by", 47.715, 10.316, 2, ["re", "tur"]],
  ["garmisch", "Garmisch-Partenkirchen", "by", 47.492, 11.097, 2, ["re", "tur"]],
  ["berlin-suedkreuz", "Berlín Südkreuz", "be", 52.475, 13.365, 2, ["ld", "s", "ae"]],
  ["berlin-gesundbrunnen", "Berlín Gesundbrunnen", "be", 52.549, 13.389, 2, ["ld", "s", "u"]],
  ["berlin-ost", "Berlín Ostbahnhof", "be", 52.51, 13.435, 2, ["ld", "s"]],
  ["berlin-spandau", "Berlín Spandau", "be", 52.535, 13.197, 2, ["ld", "s", "re"]],
  ["hamburg-altona", "Hamburgo-Altona", "hh", 53.552, 9.935, 2, ["ld", "s", "re"]],
  ["hamburg-dammtor", "Hamburgo Dammtor", "hh", 53.561, 9.99, 2, ["ld", "s"]],
  ["hamburg-harburg", "Hamburgo-Harburgo", "hh", 53.456, 9.992, 2, ["re", "s"]],
  ["muenchen-ost", "Múnich Este", "by", 48.127, 11.607, 2, ["ld", "s", "u"]],
  ["muenchen-pasing", "Múnich-Pasing", "by", 48.149, 11.461, 2, ["ld", "s", "re"]],
  ["frankfurt-sued", "Fráncfort Sur", "he", 50.099, 8.686, 2, ["re", "s"]],
  ["frankfurt-flughafen", "Fráncfort Aeropuerto", "he", 50.051, 8.571, 1, ["av", "ld", "ae", "s"]],
  ["koeln-messe", "Colonia Messe/Deutz", "nw", 50.941, 6.975, 2, ["ld", "s", "re"]],
  ["duesseldorf-flughafen", "Düsseldorf Aeropuerto", "nw", 51.292, 6.787, 2, ["ae", "s", "re"]],
  ["muenchen-flughafen", "Múnich Aeropuerto", "by", 48.354, 11.786, 2, ["ae", "s"]],
  ["berlin-brandenburg-flughafen", "Berlín Brandeburgo Aeropuerto", "bb", 52.366, 13.502, 2, ["ae", "s", "re"]],
  ["hamburg-flughafen", "Hamburgo Aeropuerto", "hh", 53.633, 10.006, 2, ["ae", "s"]],
  ["stuttgart-flughafen", "Stuttgart Aeropuerto/Feria", "bw", 48.69, 9.193, 2, ["ae", "s", "t"]],
  ["hannover-flughafen", "Hannover Aeropuerto", "ni", 52.461, 9.691, 2, ["ae", "s"]],
  ["koeln-bonn-flughafen", "Colonia/Bonn Aeropuerto", "nw", 50.879, 7.119, 2, ["ae", "s"]],
];

/** Ciudades medias / estaciones tier 3 por Land (reales o semi-reales). */
const mediumTowns = {
  be: [
    ["berlin-zoo", "Berlín Zoologischer Garten", 52.507, 13.332],
    ["berlin-friedrichstrasse", "Berlín Friedrichstraße", 52.52, 13.387],
    ["berlin-alexanderplatz", "Berlín Alexanderplatz", 52.521, 13.411],
    ["berlin-lichtenberg", "Berlín Lichtenberg", 52.51, 13.496],
    ["berlin-wannsee", "Berlín-Wannsee", 52.421, 13.179],
  ],
  bb: [
    ["oranienburg", "Oranienburg", 52.754, 13.249],
    ["bernau", "Bernau", 52.676, 13.593],
    ["koenigs-wusterhausen", "Königs Wusterhausen", 52.298, 13.633],
    ["eberswalde", "Eberswalde", 52.834, 13.797],
    ["juterbog", "Jüterbog", 51.984, 13.067],
    ["wittenberge", "Wittenberge", 53.0, 11.75],
    ["rathenow", "Rathenow", 52.6, 12.33],
    ["fuerstenwalde", "Fürstenwalde", 52.36, 14.07],
  ],
  bw: [
    ["tuebingen", "Tubinga", 48.52, 9.055],
    ["pforzheim", "Pforzheim", 48.894, 8.703],
    ["baden-baden", "Baden-Baden", 48.79, 8.191],
    ["villingen", "Villingen-Schwenningen", 48.064, 8.464],
    ["ravensburg", "Ravensburg", 47.785, 9.612],
    ["aschaffenburg", "Aschaffenburg", 49.98, 9.144],
    ["schwaebisch-hall", "Schwäbisch Hall", 49.112, 9.743],
    ["ludwigsburg", "Ludwigsburgo", 48.892, 9.186],
    ["esslingen", "Esslingen", 48.739, 9.3],
    ["sindelfingen", "Sindelfingen", 48.709, 9.005],
    ["goeppingen", "Göppingen", 48.702, 9.652],
    ["singen", "Singen", 47.759, 8.84],
  ],
  by: [
    ["fuerth-hbf", "Fürth Central", 49.47, 11.0],
    ["erlangen", "Erlangen", 49.596, 11.002],
    ["ansbach", "Ansbach", 49.301, 10.578],
    ["bayreuth-hbf", "Bayreuth Central", 49.95, 11.58],
    ["coburg", "Coburgo", 50.263, 10.957],
    ["memmingen", "Memmingen", 47.986, 10.186],
    ["neu-ulm", "Neu-Ulm", 48.393, 10.005],
    ["freising", "Freising", 48.395, 11.744],
    ["dachau", "Dachau", 48.255, 11.445],
    ["germering", "Germering-Unterpfaffenhofen", 48.13, 11.37],
    ["starnberg", "Starnberg", 47.997, 11.344],
    ["bad-toelz", "Bad Tölz", 47.76, 11.558],
    ["traunstein", "Traunstein", 47.87, 12.64],
    ["weilheim", "Weilheim", 47.841, 11.148],
    ["deggendorf", "Deggendorf", 48.83, 12.96],
    ["straubing", "Straubing", 48.877, 12.574],
  ],
  hb: [
    ["bremen-neustadt", "Bremen Neustadt", 53.07, 8.79],
    ["bremen-vahr", "Bremen Vahr", 53.08, 8.89],
    ["bremerhaven-hbf", "Bremerhaven Central", 53.535, 8.599],
  ],
  he: [
    ["hanau-hbf", "Hanau Central", 50.121, 8.929],
    ["offenbach-hbf", "Offenbach Central", 50.099, 8.761],
    ["bad-homburg", "Bad Homburg", 50.22, 8.621],
    ["friedberg", "Friedberg", 50.333, 8.76],
    ["limburg", "Limburgo", 50.384, 8.068],
    ["wetzlar", "Wetzlar", 50.564, 8.504],
    ["bad-nauheim", "Bad Nauheim", 50.367, 8.749],
    ["ruedesheim", "Rüdesheim", 49.977, 7.915],
  ],
  hh: [
    ["hamburg-bergedorf", "Hamburgo-Bergedorf", 53.489, 10.206],
    ["hamburg-billwerder", "Hamburgo Billwerder", 53.51, 10.12],
    ["hamburg-ohlsdorf", "Hamburgo Ohlsdorf", 53.621, 10.032],
    ["hamburg-blankenese", "Hamburgo Blankenese", 53.564, 9.814],
  ],
  mv: [
    ["wismar", "Wismar", 53.892, 11.466],
    ["guestrow", "Güstrow", 53.796, 12.174],
    ["neubrandenburg", "Neubrandenburg", 53.562, 13.261],
    ["waren", "Waren Müritz", 53.52, 12.68],
    ["bergen-ruegen", "Bergen auf Rügen", 54.418, 13.429],
  ],
  ni: [
    ["wilhelmshaven", "Wilhelmshaven", 53.52, 8.115],
    ["empten", "Emden Central", 53.37, 7.196],
    ["nordhorn", "Nordhorn", 52.43, 7.07],
    ["meppen", "Meppen", 52.694, 7.297],
    ["nienburg", "Nienburg", 52.643, 9.22],
    ["hameln", "Hameln", 52.101, 9.35],
    ["goslar", "Goslar", 51.907, 10.426],
    ["goettingen-geismar", "Gotinga Geismar", 51.52, 9.95],
    ["stade", "Stade", 53.596, 9.477],
    ["cuxhaven", "Cuxhaven", 53.862, 8.703],
  ],
  nw: [
    ["paderborn-hbf", "Paderborn Central", 51.713, 8.741],
    ["siegen", "Siegen", 50.876, 8.016],
    ["arnsberg", "Arnsberg", 51.437, 8.066],
    ["iserlohn", "Iserlohn", 51.375, 7.693],
    ["remscheid", "Remscheid", 51.178, 7.2],
    ["neuss-hbf", "Neuss Central", 51.204, 6.684],
    ["reclinghausen", "Recklinghausen Central", 51.616, 7.203],
    ["gelsenkirchen-hbf", "Gelsenkirchen Central", 51.505, 7.102],
    ["oberhausen-hbf", "Oberhausen Central", 51.474, 6.852],
    ["hamm-hbf", "Hamm Central", 51.678, 7.808],
    ["unna", "Unna", 51.538, 7.689],
    ["lippstadt", "Lippstadt", 51.673, 8.349],
    ["kleve", "Kleve", 51.789, 6.138],
    ["wesel", "Wesel", 51.656, 6.619],
  ],
  rp: [
    ["neustadt-weinstrasse", "Neustadt an der Weinstraße", 49.35, 8.14],
    ["speyer", "Speyer", 49.317, 8.431],
    ["worms-hbf", "Worms Central", 49.635, 8.356],
    ["bad-kreuznach", "Bad Kreuznach", 49.843, 7.866],
    ["idarleberstein", "Idar-Oberstein", 49.704, 7.303],
    ["andernach", "Andernach", 50.44, 7.4],
    ["bingen", "Bingen Central", 49.969, 7.883],
  ],
  sh: [
    ["husum", "Husum", 54.474, 9.054],
    ["heide", "Heide", 54.196, 9.098],
    ["itzehoe", "Itzehoe", 53.925, 9.515],
    ["elmshorn", "Elmshorn", 53.755, 9.66],
    ["bad-oldesloe", "Bad Oldesloe", 53.81, 10.374],
    ["norderstedt", "Norderstedt Mitte", 53.707, 9.994],
  ],
  sl: [
    ["neunkirchen", "Neunkirchen Saar", 49.351, 7.186],
    ["homburg", "Homburg Saar", 49.328, 7.337],
    ["saarlouis", "Saarlouis", 49.316, 6.751],
    ["merzig", "Merzig", 49.444, 6.637],
    ["sankt-wendel", "Sankt Wendel", 49.467, 7.168],
  ],
  sn: [
    ["bautzen", "Bautzen", 51.175, 14.429],
    ["goerlitz", "Görlitz", 51.147, 14.979],
    ["plauen", "Plauen", 50.506, 12.13],
    ["freiberg", "Freiberg", 50.909, 13.345],
    ["radebeul", "Radebeul Ost", 51.098, 13.679],
    ["meissen", "Meissen", 51.163, 13.483],
    ["pirna", "Pirna", 50.962, 13.938],
    ["hoyerswerda", "Hoyerswerda", 51.438, 14.25],
  ],
  st: [
    ["stendal", "Stendal", 52.595, 11.855],
    ["salzwedel", "Salzwedel", 52.85, 11.16],
    ["wernigerode", "Wernigerode", 51.84, 10.785],
    ["halberstadt", "Halberstadt", 51.896, 11.05],
    ["naumburg", "Naumburgo", 51.161, 11.795],
    ["wittenberg", "Lutherstadt Wittenberg", 51.867, 12.648],
    ["bernburb", "Bernburg", 51.8, 11.74],
  ],
  th: [
    ["suhl", "Suhl", 50.611, 10.693],
    ["ilmenau", "Ilmenau", 50.685, 10.921],
    ["nordhausen", "Nordhausen", 51.493, 10.793],
    ["muehlhausen", "Mühlhausen", 51.21, 10.46],
    ["altenburg", "Altenburgo", 50.993, 12.444],
    ["saalfeld", "Saalfeld", 50.65, 11.37],
    ["meiningen", "Meiningen", 50.563, 10.415],
  ],
};

const metroDistricts = {
  be: ["Mitte", "Prenzlauer Berg", "Kreuzberg", "Neukölln", "Charlottenburg", "Spandau Nord", "Köpenick", "Marzahn", "Reinickendorf", "Tempelhof", "Steglitz", "Pankow Ost"],
  hh: ["HafenCity", "St. Pauli", "Wandsbek", "Eimsbüttel", "Harburg Süd", "Altona Norte", "Billstedt", "Veddel"],
  by_mu: ["Schwabing", "Sendling", "Giesing", "Moosach", "Trudering", "Laim", "Bogenhausen", "Hasenbergl", "Neuperlach", "Freiham"],
  by_nu: ["Langwasser", "Röthenbach", "Thon", "Maxfeld", "Schweinau", "Mögeldorf"],
  nw_ko: ["Ehrenfeld", "Kalk", "Nippes", "Rodenkirchen", "Mülheim", "Chorweiler"],
  nw_ru: ["Ruhr Mitte", "Ruhr Norte", "Ruhr Sur", "Emscher Park", "Phoenix See", "Campus Ruhr"],
  he_ff: ["Westend", "Sachsenhausen", "Bockenheim", "Höchst", "Niederrad", "Gateway Gardens"],
  bw_st: ["Bad Cannstatt", "Vaihingen", "Zuffenhausen", "Feuerbach", "Möhringen", "Ostfildern Hub"],
  sn_dd: ["Neustadt", "Prohlis", "Cotta", "Klotzsche", "Plauen DD"],
  sn_le: ["Plagwitz", "Connewitz", "Gohlis", "Paunsdorf", "Mockau"],
  ni_ha: ["Laatzen Hub", "Langenhagen Mitte", "Linden", "Misburg", "Wettbergen"],
};

function hubFromTuple([id, nombre, land, lat, lon, tier, roles], origen_datos = "real") {
  return { id, nombre, land, lat, lon, tier, roles, origen_datos };
}

function expandMedium() {
  const out = [];
  for (const [land, towns] of Object.entries(mediumTowns)) {
    for (const [id, nombre, lat, lon] of towns) {
      out.push({
        id,
        nombre,
        land: land === "by_mu" ? "by" : land,
        lat,
        lon,
        tier: 3,
        roles: ["re", "rb", "rl"],
        origen_datos: "real",
      });
    }
  }
  return out;
}

function expandMetroNodes() {
  const mapping = [
    ["be", "be", 52.52, 13.4, ["u", "s", "t"]],
    ["hh", "hh", 53.55, 10.0, ["u", "s", "t"]],
    ["by_mu", "by", 48.14, 11.58, ["u", "s", "t"]],
    ["by_nu", "by", 49.45, 11.08, ["u", "s", "t"]],
    ["nw_ko", "nw", 50.94, 6.96, ["t", "u", "s"]],
    ["nw_ru", "nw", 51.48, 7.15, ["s", "t", "mc", "or"]],
    ["he_ff", "he", 50.11, 8.68, ["u", "s", "t"]],
    ["bw_st", "bw", 48.78, 9.18, ["t", "u", "s"]],
    ["sn_dd", "sn", 51.05, 13.74, ["t", "s"]],
    ["sn_le", "sn", 51.34, 12.37, ["t", "s"]],
    ["ni_ha", "ni", 52.37, 9.74, ["t", "u", "s"]],
  ];
  const out = [];
  for (const [key, land, baseLat, baseLon, roles] of mapping) {
    const names = metroDistricts[key] || [];
    names.forEach((name, i) => {
      const id = `${key.replace("_", "-")}-n${i + 1}`;
      out.push({
        id,
        nombre: `${name}`,
        land,
        lat: baseLat + ((i % 5) - 2) * 0.02,
        lon: baseLon + (Math.floor(i / 5) - 1) * 0.03,
        tier: 4,
        roles,
        origen_datos: "hibrida",
        metro_area: key,
      });
    });
  }
  return out;
}

function expandFictionalFillers(count = 220) {
  const landCenters = {
    bw: [48.7, 9.1],
    by: [48.8, 11.5],
    be: [52.52, 13.4],
    bb: [52.4, 13.0],
    hb: [53.08, 8.8],
    hh: [53.55, 10.0],
    he: [50.6, 8.9],
    mv: [53.8, 12.5],
    ni: [52.6, 9.5],
    nw: [51.4, 7.2],
    rp: [49.9, 7.8],
    sl: [49.35, 6.9],
    sn: [51.1, 13.2],
    st: [51.9, 11.7],
    sh: [54.2, 9.8],
    th: [50.9, 11.0],
  };
  const lands = Object.keys(landCenters);
  const prefixes = ["Valle", "Monte", "Puerto", "Campo", "Nueva", "Alta", "Baja", "Villa", "Puente", "Lago", "Bosque", "Cruz"];
  const suffixes = ["Estación", "Apeadero", "Centro", "Parque", "Universidad", "Feria", "Norte", "Sur", "Este", "Oeste", "Industrial", "Jardín"];
  const out = [];
  for (let i = 0; i < count; i++) {
    const land = lands[i % lands.length];
    const [blat, blon] = landCenters[land];
    const ring = Math.floor(i / lands.length);
    const nombre = `${prefixes[i % prefixes.length]} ${suffixes[(i * 3) % suffixes.length]} ${ring + 1}`;
    out.push({
      id: `fx-${land}-${String(i + 1).padStart(3, "0")}`,
      nombre,
      land,
      lat: blat + ((i * 17) % 50) * 0.01 - 0.25,
      lon: blon + ((i * 29) % 50) * 0.01 - 0.25,
      tier: 5,
      roles: i % 7 === 0 ? ["tur", "rl"] : i % 3 === 0 ? ["rl", "rb"] : ["rb", "re"],
      origen_datos: "ficticia",
    });
  }
  // Nodos orbitales / cruces ficticios metropolitanos
  const orbitals = [
    ["berlin-orbital-n", "Berlín Orbital Norte", "be", 52.58, 13.36, ["s", "or", "mc"]],
    ["berlin-orbital-s", "Berlín Orbital Sur", "be", 52.45, 13.38, ["s", "or", "mc"]],
    ["berlin-orbital-e", "Berlín Orbital Este", "be", 52.52, 13.55, ["s", "or", "mc"]],
    ["berlin-orbital-w", "Berlín Orbital Oeste", "be", 52.52, 13.2, ["s", "or", "mc"]],
    ["ruhr-orbital", "Ruhr Orbital Central", "nw", 51.48, 7.15, ["s", "or", "mc", "re"]],
    ["ruhr-orbital-w", "Ruhr Orbital Oeste", "nw", 51.45, 6.9, ["s", "or", "mc"]],
    ["ruhr-orbital-e", "Ruhr Orbital Este", "nw", 51.5, 7.45, ["s", "or", "mc"]],
    ["muenchen-suedkreuz", "Múnich Cruce Sur", "by", 48.1, 11.56, ["s", "mc", "re"]],
    ["muenchen-nordkreuz", "Múnich Cruce Norte", "by", 48.2, 11.56, ["s", "mc"]],
    ["frankfurt-westkreuz", "Fráncfort Cruce Oeste", "he", 50.11, 8.56, ["s", "mc", "ae"]],
    ["frankfurt-ostkreuz", "Fráncfort Cruce Este", "he", 50.12, 8.75, ["s", "mc"]],
    ["hamburg-hafencity", "Hamburgo Puerto Nuevo", "hh", 53.54, 9.99, ["s", "u", "t"]],
    ["hamburg-orbital", "Hamburgo Anillo", "hh", 53.57, 10.05, ["s", "or"]],
    ["stuttgart-ring", "Stuttgart Anillo", "bw", 48.77, 9.2, ["s", "or", "tt"]],
    ["koeln-ring", "Colonia Anillo", "nw", 50.95, 6.97, ["s", "t", "or"]],
    ["leipzig-ring", "Leipzig Anillo", "sn", 51.35, 12.4, ["s", "or", "t"]],
    ["dresden-ring", "Dresde Anillo", "sn", 51.06, 13.75, ["s", "or", "t"]],
    ["hannover-ring", "Hannover Anillo", "ni", 52.38, 9.75, ["s", "or", "t"]],
  ];
  for (const [id, nombre, land, lat, lon, roles] of orbitals) {
    out.push({ id, nombre, land, lat, lon, tier: 3, roles, origen_datos: "ficticia" });
  }
  return out;
}

export function buildHubsDocument() {
  const hubs = [
    ...realHubs.map((t) => hubFromTuple(t)),
    ...expandMedium(),
    ...expandMetroNodes(),
    ...expandFictionalFillers(240),
  ];
  // dedupe by id
  const map = new Map();
  for (const h of hubs) map.set(h.id, h);
  const list = [...map.values()];
  return {
    version: "0.2.0",
    nota: "Nodos reales densificados + distritos metropolitanos + estaciones ficticias de densificación.",
    total: list.length,
    hubs: list,
  };
}
