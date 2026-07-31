import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stopsPath = path.join(root, "data/stops.json");
const doc = JSON.parse(fs.readFileSync(stopsPath, "utf8"));
const stops = doc.stops;

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const existing = new Set(stops.map((s) => slug(s.nombre_juego || s.nombre)));
const byPais = {};
for (const s of stops) {
  (byPais[s.pais] ||= []).push(s);
}

function center(pais) {
  const arr = byPais[pais] || stops;
  const x = arr.reduce((a, s) => a + s.x, 0) / arr.length;
  const y = arr.reduce((a, s) => a + s.y, 0) / arr.length;
  const z = arr.reduce((a, s) => a + s.z, 0) / arr.length;
  return { x, y, z };
}

function nearest(pais, hash) {
  const arr = byPais[pais] || stops;
  return arr[hash % arr.length];
}

/** [nombre ES, nombre juego, país ES, pais_id, addons[], tier] */
const invent = [
  // España / Portugal (Iberia DLC + inventados)
  ["Madrid", "Madrid", "España", "spain", ["ets2+promods"], 1],
  ["Barcelona", "Barcelona", "España", "spain", ["ets2+promods"], 1],
  ["Valencia", "Valencia", "España", "spain", ["ets2+promods"], 1],
  ["Sevilla", "Sevilla", "España", "spain", ["ets2+promods"], 1],
  ["Málaga", "Malaga", "España", "spain", ["ets2+promods"], 2],
  ["Bilbao", "Bilbao", "España", "spain", ["ets2+promods"], 2],
  ["Zaragoza", "Zaragoza", "España", "spain", ["ets2+promods"], 2],
  ["Alicante", "Alicante", "España", "spain", ["ets2+promods"], 2],
  ["Murcia", "Murcia", "España", "spain", ["ets2+promods"], 2],
  ["Granada", "Granada", "España", "spain", ["ets2+promods"], 2],
  ["Córdoba", "Cordoba", "España", "spain", ["ets2+promods"], 2],
  ["Valladolid", "Valladolid", "España", "spain", ["ets2+promods"], 2],
  ["Vigo", "Vigo", "España", "spain", ["ets2+promods"], 2],
  ["A Coruña", "A Coruna", "España", "spain", ["ets2+promods"], 2],
  ["Oviedo", "Oviedo", "España", "spain", ["ets2+promods"], 2],
  ["Gijón", "Gijon", "España", "spain", ["ets2+promods"], 3],
  ["Santander", "Santander", "España", "spain", ["ets2+promods"], 2],
  ["San Sebastián", "San Sebastian", "España", "spain", ["ets2+promods"], 2],
  ["Pamplona", "Pamplona", "España", "spain", ["ets2+promods"], 2],
  ["Logroño", "Logrono", "España", "spain", ["ets2+promods"], 3],
  ["Burgos", "Burgos", "España", "spain", ["ets2+promods"], 3],
  ["León", "Leon", "España", "spain", ["ets2+promods"], 3],
  ["Salamanca", "Salamanca", "España", "spain", ["ets2+promods"], 2],
  ["Toledo", "Toledo", "España", "spain", ["ets2+promods"], 3],
  ["Albacete", "Albacete", "España", "spain", ["ets2+promods"], 3],
  ["Badajoz", "Badajoz", "España", "spain", ["ets2+promods"], 3],
  ["Cáceres", "Caceres", "España", "spain", ["ets2+promods"], 3],
  ["Almería", "Almeria", "España", "spain", ["ets2+promods"], 3],
  ["Cádiz", "Cadiz", "España", "spain", ["ets2+promods"], 3],
  ["Jerez", "Jerez", "España", "spain", ["ets2+promods"], 3],
  ["Marbella", "Marbella", "España", "spain", ["ets2+promods"], 3],
  ["Cartagena", "Cartagena", "España", "spain", ["ets2+promods"], 3],
  ["Castellón", "Castellon", "España", "spain", ["ets2+promods"], 3],
  ["Tarragona", "Tarragona", "España", "spain", ["ets2+promods"], 3],
  ["Girona", "Girona", "España", "spain", ["ets2+promods"], 3],
  ["Lleida", "Lleida", "España", "spain", ["ets2+promods"], 3],
  ["Santiago de Compostela", "Santiago", "España", "spain", ["ets2+promods"], 2],
  ["Ourense", "Ourense", "España", "spain", ["ets2+promods"], 3],
  ["Ponferrada", "Ponferrada", "España", "spain", ["ets2+promods"], 4],
  ["Segovia", "Segovia", "España", "spain", ["ets2+promods"], 3],
  ["Ávila", "Avila", "España", "spain", ["ets2+promods"], 3],
  ["Cuenca", "Cuenca", "España", "spain", ["ets2+promods"], 3],
  ["Ciudad Real", "Ciudad Real", "España", "spain", ["ets2+promods"], 3],
  ["Huelva", "Huelva", "España", "spain", ["ets2+promods"], 3],
  ["Jaén", "Jaen", "España", "spain", ["ets2+promods"], 3],
  ["Lisboa", "Lisbon", "Portugal", "portugal", ["ets2+promods"], 1],
  ["Porto", "Porto", "Portugal", "portugal", ["ets2+promods"], 1],
  ["Coimbra", "Coimbra", "Portugal", "portugal", ["ets2+promods"], 2],
  ["Faro", "Faro", "Portugal", "portugal", ["ets2+promods"], 2],
  ["Braga", "Braga", "Portugal", "portugal", ["ets2+promods"], 2],
  ["Aveiro", "Aveiro", "Portugal", "portugal", ["ets2+promods"], 3],
  ["Évora", "Evora", "Portugal", "portugal", ["ets2+promods"], 3],
  ["Setúbal", "Setubal", "Portugal", "portugal", ["ets2+promods"], 3],
  ["Guarda", "Guarda", "Portugal", "portugal", ["ets2+promods"], 4],
  ["Viseu", "Viseu", "Portugal", "portugal", ["ets2+promods"], 3],
  // Francia densificación
  ["París", "Paris", "Francia", "france", ["ets2+promods"], 1],
  ["Lyon", "Lyon", "Francia", "france", ["ets2+promods"], 1],
  ["Marsella", "Marseille", "Francia", "france", ["ets2+promods"], 1],
  ["Toulouse", "Toulouse", "Francia", "france", ["ets2+promods"], 1],
  ["Niza", "Nice", "Francia", "france", ["ets2+promods"], 2],
  ["Nantes", "Nantes", "Francia", "france", ["ets2+promods"], 2],
  ["Estrasburgo", "Strasbourg", "Francia", "france", ["ets2+promods"], 2],
  ["Burdeos", "Bordeaux", "Francia", "france", ["ets2+promods"], 2],
  ["Lille", "Lille", "Francia", "france", ["ets2+promods"], 2],
  ["Rennes", "Rennes", "Francia", "france", ["ets2+promods"], 2],
  ["Reims", "Reims", "Francia", "france", ["ets2+promods"], 2],
  ["Dijon", "Dijon", "Francia", "france", ["ets2+promods"], 2],
  ["Grenoble", "Grenoble", "Francia", "france", ["ets2+promods"], 2],
  ["Montpellier", "Montpellier", "Francia", "france", ["ets2+promods"], 2],
  ["Clermont-Ferrand", "Clermont", "Francia", "france", ["ets2+promods"], 3],
  ["Limoges", "Limoges", "Francia", "france", ["ets2+promods"], 3],
  ["Amiens", "Amiens", "Francia", "france", ["ets2+promods"], 3],
  ["Caen", "Caen", "Francia", "france", ["ets2+promods"], 2],
  ["Rouen", "Rouen", "Francia", "france", ["ets2+promods"], 2],
  ["Le Havre", "Le Havre", "Francia", "france", ["ets2+promods"], 2],
  ["Brest", "Brest", "Francia", "france", ["ets2+promods"], 2],
  ["Perpiñán", "Perpignan", "Francia", "france", ["ets2+promods"], 3],
  ["Aviñón", "Avignon", "Francia", "france", ["ets2+promods"], 3],
  ["Toulon", "Toulon", "Francia", "france", ["ets2+promods"], 3],
  ["Metz", "Metz", "Francia", "france", ["ets2+promods"], 2],
  ["Nancy", "Nancy", "Francia", "france", ["ets2+promods"], 2],
  ["Mulhouse", "Mulhouse", "Francia", "france", ["ets2+promods"], 3],
  ["Orleans", "Orleans", "Francia", "france", ["ets2+promods"], 3],
  ["Tours", "Tours", "Francia", "france", ["ets2+promods"], 3],
  ["Angers", "Angers", "Francia", "france", ["ets2+promods"], 3],
  ["Poitiers", "Poitiers", "Francia", "france", ["ets2+promods"], 3],
  ["La Rochelle", "La Rochelle", "Francia", "france", ["ets2+promods"], 3],
  ["Bayona", "Bayonne", "Francia", "france", ["ets2+promods"], 3],
  ["Pau", "Pau", "Francia", "france", ["ets2+promods"], 3],
  ["Calais", "Calais", "Francia", "france", ["ets2+promods"], 2],
  ["Dunkerque", "Dunkirk", "Francia", "france", ["ets2+promods"], 3],
  ["Cherburgo", "Cherbourg", "Francia", "france", ["ets2+promods"], 3],
  // Italia
  ["Roma", "Rome", "Italia", "italy", ["ets2+promods"], 1],
  ["Milán", "Milan", "Italia", "italy", ["ets2+promods"], 1],
  ["Nápoles", "Naples", "Italia", "italy", ["ets2+promods"], 1],
  ["Turín", "Turin", "Italia", "italy", ["ets2+promods"], 1],
  ["Florencia", "Florence", "Italia", "italy", ["ets2+promods"], 2],
  ["Bolonia", "Bologna", "Italia", "italy", ["ets2+promods"], 2],
  ["Venecia", "Venice", "Italia", "italy", ["ets2+promods"], 2],
  ["Génova", "Genoa", "Italia", "italy", ["ets2+promods"], 2],
  ["Palermo", "Palermo", "Italia", "italy", ["ets2+promods"], 2],
  ["Catania", "Catania", "Italia", "italy", ["ets2+promods"], 2],
  ["Bari", "Bari", "Italia", "italy", ["ets2+promods"], 2],
  ["Verona", "Verona", "Italia", "italy", ["ets2+promods"], 2],
  ["Padua", "Padua", "Italia", "italy", ["ets2+promods"], 3],
  ["Pisa", "Pisa", "Italia", "italy", ["ets2+promods"], 3],
  ["Trieste", "Trieste", "Italia", "italy", ["ets2+promods"], 2],
  ["Ancona", "Ancona", "Italia", "italy", ["ets2+promods"], 3],
  ["Pescara", "Pescara", "Italia", "italy", ["ets2+promods"], 3],
  ["Perugia", "Perugia", "Italia", "italy", ["ets2+promods"], 3],
  ["Cagliari", "Cagliari", "Italia", "italy", ["ets2+promods"], 2],
  ["Messina", "Messina", "Italia", "italy", ["ets2+promods"], 3],
  ["Lecce", "Lecce", "Italia", "italy", ["ets2+promods"], 3],
  ["Tarento", "Taranto", "Italia", "italy", ["ets2+promods"], 3],
  // Finlandia / Baltics extras
  ["Helsinki", "Helsinki", "Finlandia", "finland", ["promods"], 1],
  ["Turku", "Turku", "Finlandia", "finland", ["promods"], 2],
  ["Tampere", "Tampere", "Finlandia", "finland", ["promods"], 2],
  ["Oulu", "Oulu", "Finlandia", "finland", ["promods"], 2],
  ["Jyväskylä", "Jyvaskyla", "Finlandia", "finland", ["promods"], 3],
  ["Kuopio", "Kuopio", "Finlandia", "finland", ["promods"], 3],
  ["Lahti", "Lahti", "Finlandia", "finland", ["promods"], 3],
  ["Vaasa", "Vaasa", "Finlandia", "finland", ["promods"], 3],
  ["Rovaniemi", "Rovaniemi", "Finlandia", "finland", ["promods"], 2],
  ["Tallin", "Tallinn", "Estonia", "estonia", ["promods"], 1],
  ["Tartu", "Tartu", "Estonia", "estonia", ["promods"], 2],
  ["Narva", "Narva", "Estonia", "estonia", ["promods"], 3],
  ["Pärnu", "Parnu", "Estonia", "estonia", ["promods"], 3],
  ["Riga", "Riga", "Letonia", "latvia", ["promods"], 1],
  ["Daugavpils", "Daugavpils", "Letonia", "latvia", ["promods"], 2],
  ["Liepāja", "Liepaja", "Letonia", "latvia", ["promods"], 2],
  ["Ventspils", "Ventspils", "Letonia", "latvia", ["promods"], 3],
  ["Vilna", "Vilnius", "Lituania", "lithuania", ["promods"], 1],
  ["Kaunas", "Kaunas", "Lituania", "lithuania", ["promods"], 2],
  ["Klaipėda", "Klaipeda", "Lituania", "lithuania", ["promods"], 2],
  ["Šiauliai", "Siauliai", "Lituania", "lithuania", ["promods"], 3],
  // Irlanda / UK extras
  ["Dublín", "Dublin", "Irlanda", "ireland", ["ets2+promods"], 1],
  ["Cork", "Cork", "Irlanda", "ireland", ["ets2+promods"], 2],
  ["Galway", "Galway", "Irlanda", "ireland", ["ets2+promods"], 2],
  ["Limerick", "Limerick", "Irlanda", "ireland", ["ets2+promods"], 2],
  ["Waterford", "Waterford", "Irlanda", "ireland", ["ets2+promods"], 3],
  ["Belfast", "Belfast", "Reino Unido", "uk", ["ets2+promods"], 1],
  ["Derry", "Derry", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Inverness", "Inverness", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Plymouth", "Plymouth", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Exeter", "Exeter", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Norwich", "Norwich", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["York", "York", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Oxford", "Oxford", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Cambridge", "Cambridge", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Bath", "Bath", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Canterbury", "Canterbury", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Swansea", "Swansea", "Reino Unido", "uk", ["ets2+promods"], 2],
  ["Reading", "Reading", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Luton", "Luton", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Blackpool", "Blackpool", "Reino Unido", "uk", ["ets2+promods"], 3],
  ["Holyhead", "Holyhead", "Reino Unido", "uk", ["ets2+promods"], 3],
  // Balcanes / Grecia extras
  ["Atenas", "Athens", "Grecia", "greece", ["balkans-addon", "promods"], 1],
  ["Salónica", "Thessaloniki", "Grecia", "greece", ["balkans-addon", "promods"], 1],
  ["Patras", "Patras", "Grecia", "greece", ["balkans-addon"], 2],
  ["Heraclión", "Heraklion", "Grecia", "greece", ["balkans-addon"], 2],
  ["Ioánina", "Ioannina", "Grecia", "greece", ["balkans-addon"], 3],
  ["Larisa", "Larissa", "Grecia", "greece", ["balkans-addon"], 3],
  ["Tirana", "Tirana", "Albania", "albania", ["balkans-addon"], 1],
  ["Durrës", "Durres", "Albania", "albania", ["balkans-addon"], 2],
  ["Skopie", "Skopje", "Macedonia del Norte", "macedonia", ["balkans-addon"], 1],
  ["Ohrid", "Ohrid", "Macedonia del Norte", "macedonia", ["balkans-addon"], 3],
  ["Pristina", "Pristina", "Kosovo", "kosovo", ["balkans-addon"], 1],
  ["Podgorica", "Podgorica", "Montenegro", "montenegro", ["balkans-addon"], 1],
  ["Budva", "Budva", "Montenegro", "montenegro", ["balkans-addon"], 3],
  ["Novi Sad", "Novi Sad", "Serbia", "serbia", ["balkans-addon"], 2],
  ["Niš", "Nis", "Serbia", "serbia", ["balkans-addon"], 2],
  ["Banja Luka", "Banja Luka", "Bosnia y Herzegovina", "bosnia", ["balkans-addon"], 2],
  ["Mostar", "Mostar", "Bosnia y Herzegovina", "bosnia", ["balkans-addon"], 3],
  ["Dubrovnik", "Dubrovnik", "Croacia", "croatia", ["balkans-addon"], 2],
  ["Zadar", "Zadar", "Croacia", "croatia", ["balkans-addon"], 3],
  ["Osijek", "Osijek", "Croacia", "croatia", ["balkans-addon"], 3],
  // Turquía / Cáucaso
  ["Estambul", "Istanbul", "Turquía", "turkey", ["promods", "promods-middle-east"], 1],
  ["Ankara", "Ankara", "Turquía", "turkey", ["promods-middle-east"], 1],
  ["Esmirna", "Izmir", "Turquía", "turkey", ["promods-middle-east"], 1],
  ["Antalya", "Antalya", "Turquía", "turkey", ["promods-middle-east"], 2],
  ["Bursa", "Bursa", "Turquía", "turkey", ["promods-middle-east"], 2],
  ["Adana", "Adana", "Turquía", "turkey", ["promods-middle-east"], 2],
  ["Samsun", "Samsun", "Turquía", "turkey", ["promods-middle-east"], 2],
  ["Trabzon", "Trabzon", "Turquía", "turkey", ["promods-middle-east"], 2],
  ["Tiflis", "Tbilisi", "Georgia", "georgia", ["promods"], 1],
  ["Batumi", "Batumi", "Georgia", "georgia", ["promods"], 2],
  ["Ereván", "Yerevan", "Armenia", "armenia", ["promods"], 1],
  ["Bakú", "Baku", "Azerbaiyán", "azerbaijan", ["promods"], 1],
  // Magreb
  ["Tánger", "Tangier", "Marruecos", "morocco", ["promods"], 1],
  ["Casablanca", "Casablanca", "Marruecos", "morocco", ["promods"], 1],
  ["Rabat", "Rabat", "Marruecos", "morocco", ["promods"], 1],
  ["Fez", "Fez", "Marruecos", "morocco", ["promods"], 2],
  ["Marrakech", "Marrakech", "Marruecos", "morocco", ["promods"], 2],
  ["Agadir", "Agadir", "Marruecos", "morocco", ["promods"], 2],
  ["Túnez", "Tunis", "Túnez", "tunisia", ["promods"], 1],
  ["Sfax", "Sfax", "Túnez", "tunisia", ["promods"], 2],
  // Pueblos inventados densos (relleno regional)
  ["Neustadt an der Oder", "Neustadt Oder", "Alemania", "germany", ["promods"], 4],
  ["Kleinbergen", "Kleinbergen", "Alemania", "germany", ["promods"], 4],
  ["Waldheim Nord", "Waldheim Nord", "Alemania", "germany", ["promods"], 4],
  ["Seefeld Ost", "Seefeld Ost", "Austria", "austria", ["promods"], 4],
  ["Alpenblick", "Alpenblick", "Austria", "austria", ["promods"], 4],
  ["Fjordvik", "Fjordvik", "Noruega", "norway", ["promods"], 4],
  ["Nordelv", "Nordelv", "Noruega", "norway", ["promods"], 4],
  ["Skogdal", "Skogdal", "Suecia", "sweden", ["promods"], 4],
  ["Sjököping", "Sjokoping", "Suecia", "sweden", ["promods"], 4],
  ["Lakebridge", "Lakebridge", "Reino Unido", "uk", ["ets2+promods"], 4],
  ["Millhaven", "Millhaven", "Reino Unido", "uk", ["ets2+promods"], 4],
  ["Pont-sur-Lys", "Pont-sur-Lys", "Francia", "france", ["ets2+promods"], 4],
  ["Saint-Roch-du-Val", "Saint-Roch", "Francia", "france", ["ets2+promods"], 4],
  ["Villaverde del Camino", "Villaverde Camino", "España", "spain", ["ets2+promods"], 4],
  ["Puentealto", "Puentealto", "España", "spain", ["ets2+promods"], 4],
  ["Monteverde", "Monteverde", "Italia", "italy", ["ets2+promods"], 4],
  ["Castelnuovo Mare", "Castelnuovo Mare", "Italia", "italy", ["ets2+promods"], 4],
  ["Nowy Brzeg", "Nowy Brzeg", "Polonia", "poland", ["promods"], 4],
  ["Zielonka Górna", "Zielonka Gorna", "Polonia", "poland", ["promods"], 4],
  ["Staré Údolí", "Stare Udoli", "Chequia", "czech", ["promods"], 4],
  ["Dunavac", "Dunavac", "Serbia", "serbia", ["balkans-addon"], 4],
  ["Gora Plava", "Gora Plava", "Croacia", "croatia", ["balkans-addon"], 4],
];

const PORT_CITIES = new Set([
  "Bilbao", "Vigo", "A Coruña", "Santander", "Barcelona", "Valencia", "Cádiz", "Cartagena", "Alicante",
  "Lisboa", "Porto", "Setúbal", "Faro", "Marsella", "Le Havre", "Calais", "Dunkerque", "Cherburgo",
  "Brest", "La Rochelle", "Niza", "Toulon", "Génova", "Venecia", "Nápoles", "Palermo", "Bari", "Ancona",
  "Cagliari", "Trieste", "Dublín", "Cork", "Belfast", "Holyhead", "Plymouth", "Atenas", "Patras",
  "Salónica", "Estambul", "Esmirna", "Samsun", "Trabzon", "Batumi", "Bakú", "Tánger", "Casablanca",
  "Agadir", "Túnez", "Sfax", "Dubrovnik", "Zadar", "Durrës", "Budva", "Klaipėda", "Ventspils", "Liepāja",
  "Riga", "Tallin", "Helsinki", "Turku",
]);

let added = 0;
for (const [nombre, nombreJuego, pais, pais_id, addons, tier] of invent) {
  const key = slug(nombreJuego);
  if (existing.has(key) || existing.has(slug(nombre))) continue;
  const h = [...nombreJuego].reduce((a, c) => a + c.charCodeAt(0), 0);
  const near = nearest(pais, h);
  const c = center(pais);
  const ang = ((h % 360) * Math.PI) / 180;
  const rad = 6000 + (h % 16000);
  const x = (near?.x ?? c.x) + Math.cos(ang) * rad;
  const y = near?.y ?? c.y;
  const z = (near?.z ?? c.z) + Math.sin(ang) * rad;
  const id = key;
  const city = {
    id,
    nombre,
    nombre_juego: nombreJuego,
    gameName: id,
    pais,
    pais_id,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    z: Math.round(z * 10) / 10,
    addons,
    tier,
    origen_datos: "inventada",
    parada_tipo: tier >= 4 ? "pueblo" : "ciudad",
  };
  stops.push(city);
  existing.add(key);
  (byPais[pais] ||= []).push(city);
  added++;

  if (tier <= 2 || (tier === 3 && nombre.length > 5)) {
    const extras = [
      ["aeropuerto", "Aeropuerto", 9000 + (h % 2000), 4500, "aeropuerto"],
      ["puerto", "Terminal Puerto", -5000, 2200, "puerto"],
      ["universidad", "Campus Universitario", 1800, -1600, "universidad"],
      ["norte", "Barrio Norte", 800, -3200, "norte"],
    ];
    for (const [suf, label, dx, dz, tipo] of extras) {
      if (tipo === "puerto" && !PORT_CITIES.has(nombre) && tier > 2) continue;
      if (tipo === "aeropuerto" && tier > 2 && h % 3 === 0) continue;
      if (tipo === "universidad" && tier > 2) continue;
      const sid = `${id}-${suf}`;
      if (existing.has(sid)) continue;
      stops.push({
        id: sid,
        nombre: `${nombre} — ${label}`,
        nombre_juego: nombreJuego,
        gameName: sid,
        pais,
        pais_id,
        x: Math.round((x + dx) * 10) / 10,
        y: Math.round(y * 10) / 10,
        z: Math.round((z + dz - (h % 400)) * 10) / 10,
        addons,
        tier: Math.min(4, tier + 1),
        origen_datos: "inventada",
        parada_tipo: tipo,
        parent: id,
      });
      existing.add(sid);
      added++;
    }
  }
}

doc.stops = stops;
doc.total = stops.length;
doc.version = "0.2.0";
doc.generado = new Date().toISOString();
fs.writeFileSync(stopsPath, JSON.stringify(doc, null, 2));
console.log(`Densified: +${added} stops → total ${stops.length}; ciudades ${new Set(stops.map((s) => s.nombre_juego)).size}`);
