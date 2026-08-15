/**
 * Genera miles de ciudades industriales + recursos regionales.
 * Se invoca desde generate-data.js o solo: node tools/generate-cities.js
 */
const fs = require('fs');
const path = require('path');

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t = t ^ (t + Math.imul(t ^ (t >>> 7), t | 61));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function idify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

const PREFIX = [
  'San', 'Santa', 'Puerto', 'Villa', 'Nueva', 'Alto', 'Bajo', 'Monte', 'Valle', 'Costa',
  'Lago', 'Río', 'Sierra', 'Campo', 'Central', 'Norte', 'Sur', 'Este', 'Oeste', 'Gran',
];
const ROOTS = [
  'aurora', 'bruma', 'cedro', 'delta', 'espejo', 'faro', 'greda', 'huerta', 'isla', 'jade',
  'kanela', 'linden', 'mirasol', 'nexo', 'orilla', 'pino', 'quimera', 'roca', 'salvia', 'trigo',
  'umbra', 'vega', 'windor', 'xilo', 'yermo', 'zeta', 'ándes', 'boreal', 'cobalto', 'dunar',
  'estepar', 'férreo', 'glaciar', 'híbrido', 'índigo', 'juncal', 'káiser', 'litoral', 'minero', 'náutico',
];
const SUFFIX = [
  'ia', 'ópolis', 'burgo', 'grad', 'stadt', 'ton', 'ville', 'dorf', 'heim', 'ford',
  'bridge', 'haven', 'port', 'city', 'town', 'hafen', 'berg', 'tal', 'bad', 'werth',
];

const RESOURCE_POOLS = {
  mining: [
    ['mena_de_hierro', 1.3], ['mena_de_cobre', 1.4], ['bauxita', 1.2], ['carbon_mineral', 1.3],
    ['mena_de_litio', 1.1], ['mena_de_niquel', 1.2], ['mena_de_cinc', 1.1], ['fosfato_natural', 1.0],
  ],
  energy: [
    ['petroleo_crudo', 1.5], ['gas_natural', 1.4], ['carbon_mineral', 1.1], ['uranio_natural', 1.0],
  ],
  agro: [
    ['trigo', 1.3], ['maiz', 1.2], ['oliva', 1.4], ['algodon', 1.1], ['soja', 1.2], ['cana_de_azucar', 1.1],
  ],
  industrial: [
    ['arena_de_silice', 1.0], ['caliza', 1.1], ['arcilla_industrial', 1.0], ['madera_de_pino', 1.1],
  ],
  port: [
    ['petroleo_crudo', 1.0], ['gas_natural', 1.0], ['trigo', 1.0],
  ],
  electronics: [
    ['arena_de_silice', 1.2], ['concentrado_de_tierras_raras', 1.3],
  ],
  hub: [
    ['caliza', 0.9], ['arcilla_industrial', 0.9],
  ],
  logistics: [
    ['arena_de_construccion', 1.0], ['grava', 1.0],
  ],
};

// Fix litio id - in data it's espodumeno_litio
RESOURCE_POOLS.mining = RESOURCE_POOLS.mining.map((x) =>
  x[0] === 'mena_de_litio' ? ['espodumeno_litio', 1.1] : x
);

const COUNTRY_SEEDS = [
  { country: 'España', region: 'Europa', tariffs: 0.05, labor: 1.0, energy: 1.0, box: [36.0, -9.5, 43.8, 3.3], n: 120, types: ['industrial', 'agro', 'port', 'mining', 'hub'] },
  { country: 'Portugal', region: 'Europa', tariffs: 0.05, labor: 0.85, energy: 1.1, box: [37.0, -9.5, 42.2, -6.2], n: 40, types: ['port', 'industrial', 'agro'] },
  { country: 'Francia', region: 'Europa', tariffs: 0.06, labor: 1.25, energy: 1.15, box: [42.3, -4.8, 51.1, 8.2], n: 140, types: ['industrial', 'agro', 'hub', 'port'] },
  { country: 'Alemania', region: 'Europa', tariffs: 0.06, labor: 1.3, energy: 1.2, box: [47.3, 5.9, 55.1, 15.0], n: 160, types: ['industrial', 'hub', 'port', 'energy'] },
  { country: 'Italia', region: 'Europa', tariffs: 0.07, labor: 1.15, energy: 1.3, box: [36.6, 6.6, 47.1, 18.5], n: 110, types: ['industrial', 'port', 'agro'] },
  { country: 'Reino Unido', region: 'Europa', tariffs: 0.08, labor: 1.4, energy: 1.35, box: [50.0, -5.7, 58.7, 1.8], n: 100, types: ['hub', 'port', 'industrial'] },
  { country: 'Polonia', region: 'Europa', tariffs: 0.04, labor: 0.7, energy: 0.9, box: [49.0, 14.1, 54.8, 24.1], n: 80, types: ['industrial', 'mining', 'port'] },
  { country: 'Países Bajos', region: 'Europa', tariffs: 0.05, labor: 1.35, energy: 1.25, box: [51.3, 3.3, 53.5, 7.2], n: 35, types: ['port', 'logistics', 'hub'] },
  { country: 'Bélgica', region: 'Europa', tariffs: 0.05, labor: 1.3, energy: 1.2, box: [49.5, 2.5, 51.5, 6.4], n: 30, types: ['port', 'industrial'] },
  { country: 'Turquía', region: 'Europa', tariffs: 0.1, labor: 0.55, energy: 0.8, box: [36.0, 26.0, 42.1, 44.8], n: 90, types: ['industrial', 'hub', 'port', 'agro'] },
  { country: 'Rusia', region: 'Europa', tariffs: 0.12, labor: 0.5, energy: 0.6, box: [48.0, 30.0, 60.0, 60.0], n: 120, types: ['energy', 'mining', 'industrial', 'hub'] },
  { country: 'EE.UU.', region: 'América', tariffs: 0.08, labor: 1.4, energy: 0.95, box: [25.0, -125.0, 49.0, -67.0], n: 280, types: ['hub', 'industrial', 'energy', 'port', 'agro', 'electronics'] },
  { country: 'México', region: 'América', tariffs: 0.09, labor: 0.55, energy: 0.85, box: [14.5, -117.0, 32.7, -86.7], n: 90, types: ['industrial', 'mining', 'port', 'agro'] },
  { country: 'Brasil', region: 'América', tariffs: 0.12, labor: 0.6, energy: 0.85, box: [-33.7, -73.9, -5.0, -34.8], n: 150, types: ['agro', 'mining', 'port', 'industrial', 'hub'] },
  { country: 'Argentina', region: 'América', tariffs: 0.13, labor: 0.5, energy: 0.7, box: [-54.8, -73.5, -21.8, -53.6], n: 70, types: ['agro', 'energy', 'port'] },
  { country: 'Chile', region: 'América', tariffs: 0.1, labor: 0.65, energy: 0.9, box: [-55.9, -75.6, -17.5, -67.0], n: 50, types: ['mining', 'port'] },
  { country: 'Canadá', region: 'América', tariffs: 0.07, labor: 1.35, energy: 0.8, box: [42.0, -130.0, 60.0, -60.0], n: 80, types: ['mining', 'energy', 'hub', 'port'] },
  { country: 'China', region: 'Asia', tariffs: 0.09, labor: 0.55, energy: 0.75, box: [22.0, 100.0, 45.0, 122.0], n: 300, types: ['electronics', 'industrial', 'port', 'hub', 'mining'] },
  { country: 'India', region: 'Asia', tariffs: 0.11, labor: 0.35, energy: 0.7, box: [8.0, 70.0, 32.0, 90.0], n: 200, types: ['industrial', 'agro', 'hub', 'port', 'electronics'] },
  { country: 'Japón', region: 'Asia', tariffs: 0.07, labor: 1.45, energy: 1.4, box: [31.0, 129.5, 45.5, 145.8], n: 100, types: ['electronics', 'industrial', 'port', 'hub'] },
  { country: 'Corea del Sur', region: 'Asia', tariffs: 0.07, labor: 1.2, energy: 1.15, box: [34.3, 126.0, 38.6, 129.5], n: 50, types: ['electronics', 'industrial', 'port'] },
  { country: 'Indonesia', region: 'Asia', tariffs: 0.1, labor: 0.4, energy: 0.7, box: [-8.5, 95.0, 5.5, 140.0], n: 80, types: ['mining', 'agro', 'port'] },
  { country: 'Vietnam', region: 'Asia', tariffs: 0.09, labor: 0.38, energy: 0.75, box: [8.5, 102.1, 23.4, 109.5], n: 50, types: ['electronics', 'industrial', 'agro'] },
  { country: 'Tailandia', region: 'Asia', tariffs: 0.09, labor: 0.42, energy: 0.8, box: [5.6, 97.3, 20.5, 105.6], n: 40, types: ['agro', 'industrial', 'port'] },
  { country: 'Singapur', region: 'Asia', tariffs: 0.02, labor: 1.1, energy: 1.0, box: [1.2, 103.6, 1.47, 104.0], n: 8, types: ['port', 'hub', 'electronics'] },
  { country: 'EAU', region: 'Asia', tariffs: 0.03, labor: 0.9, energy: 0.5, box: [22.6, 51.5, 26.1, 56.4], n: 20, types: ['energy', 'port', 'hub'] },
  { country: 'Arabia Saudí', region: 'Asia', tariffs: 0.04, labor: 0.7, energy: 0.35, box: [16.3, 34.5, 32.2, 55.7], n: 40, types: ['energy', 'industrial'] },
  { country: 'Australia', region: 'Oceanía', tariffs: 0.07, labor: 1.35, energy: 1.0, box: [-43.6, 113.0, -10.7, 153.6], n: 70, types: ['mining', 'agro', 'port', 'hub'] },
  { country: 'Sudáfrica', region: 'África', tariffs: 0.11, labor: 0.45, energy: 0.75, box: [-34.8, 16.5, -22.1, 32.9], n: 50, types: ['mining', 'port', 'industrial'] },
  { country: 'Nigeria', region: 'África', tariffs: 0.14, labor: 0.3, energy: 0.55, box: [4.3, 2.7, 13.9, 14.7], n: 50, types: ['energy', 'port', 'agro'] },
  { country: 'Marruecos', region: 'África', tariffs: 0.09, labor: 0.4, energy: 0.8, box: [27.7, -13.2, 35.9, -1.0], n: 35, types: ['port', 'agro', 'industrial'] },
  { country: 'Egipto', region: 'África', tariffs: 0.12, labor: 0.35, energy: 0.65, box: [22.0, 24.7, 31.7, 36.9], n: 40, types: ['energy', 'port', 'agro', 'hub'] },
  { country: 'Kenia', region: 'África', tariffs: 0.12, labor: 0.32, energy: 0.7, box: [-4.7, 33.9, 4.6, 41.9], n: 25, types: ['agro', 'port'] },
  { country: 'Suecia', region: 'Europa', tariffs: 0.06, labor: 1.4, energy: 0.85, box: [55.3, 11.1, 69.1, 24.2], n: 40, types: ['mining', 'industrial', 'hub'] },
  { country: 'Noruega', region: 'Europa', tariffs: 0.05, labor: 1.5, energy: 0.55, box: [58.0, 4.5, 71.2, 31.1], n: 30, types: ['energy', 'port', 'industrial'] },
  { country: 'Finlandia', region: 'Europa', tariffs: 0.06, labor: 1.35, energy: 0.9, box: [59.8, 20.5, 70.1, 31.6], n: 25, types: ['industrial', 'forestry', 'hub'] },
  { country: 'Chequia', region: 'Europa', tariffs: 0.05, labor: 0.85, energy: 1.05, box: [48.5, 12.1, 51.1, 18.9], n: 30, types: ['industrial', 'automotive'] },
  { country: 'Rumanía', region: 'Europa', tariffs: 0.05, labor: 0.6, energy: 0.9, box: [43.6, 20.2, 48.3, 29.7], n: 35, types: ['industrial', 'energy', 'agro'] },
  { country: 'Ucrania', region: 'Europa', tariffs: 0.08, labor: 0.45, energy: 0.85, box: [44.4, 22.1, 52.4, 40.2], n: 50, types: ['agro', 'industrial', 'mining'] },
  { country: 'Kazajistán', region: 'Asia', tariffs: 0.1, labor: 0.5, energy: 0.55, box: [40.9, 46.5, 55.4, 87.3], n: 40, types: ['mining', 'energy'] },
  { country: 'Malasia', region: 'Asia', tariffs: 0.08, labor: 0.5, energy: 0.75, box: [1.2, 99.6, 6.7, 119.3], n: 35, types: ['electronics', 'port', 'agro'] },
  { country: 'Filipinas', region: 'Asia', tariffs: 0.1, labor: 0.4, energy: 0.85, box: [5.0, 117.0, 18.6, 126.6], n: 40, types: ['electronics', 'port', 'agro'] },
  { country: 'Nueva Zelanda', region: 'Oceanía', tariffs: 0.06, labor: 1.25, energy: 0.95, box: [-47.3, 166.4, -34.4, 178.6], n: 20, types: ['agro', 'port'] },
  { country: 'Colombia', region: 'América', tariffs: 0.11, labor: 0.5, energy: 0.7, box: [-4.2, -79.0, 12.5, -66.9], n: 40, types: ['agro', 'energy', 'port'] },
  { country: 'Perú', region: 'América', tariffs: 0.1, labor: 0.48, energy: 0.8, box: [-18.4, -81.3, -0.0, -68.7], n: 35, types: ['mining', 'port', 'agro'] },
];

const REAL_ANCHORS = [
  { name: 'Madrid', country: 'España', region: 'Europa', lat: 40.4168, lng: -3.7038, type: 'hub', tariffs: 0.05, laborCost: 1.0, energyCost: 1.0 },
  { name: 'Barcelona', country: 'España', region: 'Europa', lat: 41.3874, lng: 2.1686, type: 'port', tariffs: 0.05, laborCost: 1.05, energyCost: 1.05 },
  { name: 'Bilbao', country: 'España', region: 'Europa', lat: 43.263, lng: -2.935, type: 'industrial', tariffs: 0.05, laborCost: 1.02, energyCost: 0.95 },
  { name: 'Valencia', country: 'España', region: 'Europa', lat: 39.4699, lng: -0.3763, type: 'port', tariffs: 0.05, laborCost: 0.95, energyCost: 1.0 },
  { name: 'Sevilla', country: 'España', region: 'Europa', lat: 37.3891, lng: -5.9845, type: 'agro', tariffs: 0.05, laborCost: 0.9, energyCost: 1.05 },
  { name: 'Huelva', country: 'España', region: 'Europa', lat: 37.2614, lng: -6.9447, type: 'mining', tariffs: 0.05, laborCost: 0.88, energyCost: 0.9 },
  { name: 'Gijón', country: 'España', region: 'Europa', lat: 43.5322, lng: -5.6611, type: 'industrial', tariffs: 0.05, laborCost: 0.92, energyCost: 0.85 },
  { name: 'Zaragoza', country: 'España', region: 'Europa', lat: 41.6488, lng: -0.8891, type: 'logistics', tariffs: 0.05, laborCost: 0.93, energyCost: 1.0 },
  { name: 'Lisboa', country: 'Portugal', region: 'Europa', lat: 38.7223, lng: -9.1393, type: 'port', tariffs: 0.05, laborCost: 0.85, energyCost: 1.1 },
  { name: 'París', country: 'Francia', region: 'Europa', lat: 48.8566, lng: 2.3522, type: 'hub', tariffs: 0.06, laborCost: 1.25, energyCost: 1.15 },
  { name: 'Lyon', country: 'Francia', region: 'Europa', lat: 45.764, lng: 4.8357, type: 'industrial', tariffs: 0.06, laborCost: 1.15, energyCost: 1.1 },
  { name: 'Ruhr', country: 'Alemania', region: 'Europa', lat: 51.4556, lng: 7.0116, type: 'industrial', tariffs: 0.06, laborCost: 1.3, energyCost: 1.2 },
  { name: 'Hamburgo', country: 'Alemania', region: 'Europa', lat: 53.5511, lng: 9.9937, type: 'port', tariffs: 0.06, laborCost: 1.28, energyCost: 1.15 },
  { name: 'Róterdam', country: 'Países Bajos', region: 'Europa', lat: 51.9244, lng: 4.4777, type: 'port', tariffs: 0.05, laborCost: 1.35, energyCost: 1.25 },
  { name: 'Amberes', country: 'Bélgica', region: 'Europa', lat: 51.2194, lng: 4.4025, type: 'port', tariffs: 0.05, laborCost: 1.3, energyCost: 1.2 },
  { name: 'Milán', country: 'Italia', region: 'Europa', lat: 45.4642, lng: 9.19, type: 'industrial', tariffs: 0.07, laborCost: 1.15, energyCost: 1.3 },
  { name: 'Génova', country: 'Italia', region: 'Europa', lat: 44.4056, lng: 8.9463, type: 'port', tariffs: 0.07, laborCost: 1.1, energyCost: 1.25 },
  { name: 'Londres', country: 'Reino Unido', region: 'Europa', lat: 51.5074, lng: -0.1278, type: 'hub', tariffs: 0.08, laborCost: 1.4, energyCost: 1.35 },
  { name: 'Gdansk', country: 'Polonia', region: 'Europa', lat: 54.352, lng: 18.6466, type: 'port', tariffs: 0.04, laborCost: 0.7, energyCost: 0.9 },
  { name: 'Katowice', country: 'Polonia', region: 'Europa', lat: 50.2649, lng: 19.0238, type: 'industrial', tariffs: 0.04, laborCost: 0.68, energyCost: 0.85 },
  { name: 'Estambul', country: 'Turquía', region: 'Europa', lat: 41.0082, lng: 28.9784, type: 'hub', tariffs: 0.1, laborCost: 0.55, energyCost: 0.8 },
  { name: 'Moscú', country: 'Rusia', region: 'Europa', lat: 55.7558, lng: 37.6173, type: 'hub', tariffs: 0.12, laborCost: 0.5, energyCost: 0.6 },
  { name: 'Dubái', country: 'EAU', region: 'Asia', lat: 25.2048, lng: 55.2708, type: 'port', tariffs: 0.03, laborCost: 0.9, energyCost: 0.5 },
  { name: 'Riad', country: 'Arabia Saudí', region: 'Asia', lat: 24.7136, lng: 46.6753, type: 'energy', tariffs: 0.04, laborCost: 0.7, energyCost: 0.35 },
  { name: 'Mumbai', country: 'India', region: 'Asia', lat: 19.076, lng: 72.8777, type: 'hub', tariffs: 0.11, laborCost: 0.35, energyCost: 0.7 },
  { name: 'Singapur', country: 'Singapur', region: 'Asia', lat: 1.3521, lng: 103.8198, type: 'port', tariffs: 0.02, laborCost: 1.1, energyCost: 1.0 },
  { name: 'Shanghái', country: 'China', region: 'Asia', lat: 31.2304, lng: 121.4737, type: 'port', tariffs: 0.09, laborCost: 0.55, energyCost: 0.75 },
  { name: 'Shenzhen', country: 'China', region: 'Asia', lat: 22.5431, lng: 114.0579, type: 'electronics', tariffs: 0.09, laborCost: 0.6, energyCost: 0.8 },
  { name: 'Tokio', country: 'Japón', region: 'Asia', lat: 35.6762, lng: 139.6503, type: 'hub', tariffs: 0.07, laborCost: 1.45, energyCost: 1.4 },
  { name: 'Seúl', country: 'Corea del Sur', region: 'Asia', lat: 37.5665, lng: 126.978, type: 'electronics', tariffs: 0.07, laborCost: 1.2, energyCost: 1.15 },
  { name: 'Nueva York', country: 'EE.UU.', region: 'América', lat: 40.7128, lng: -74.006, type: 'hub', tariffs: 0.08, laborCost: 1.5, energyCost: 1.2 },
  { name: 'Houston', country: 'EE.UU.', region: 'América', lat: 29.7604, lng: -95.3698, type: 'energy', tariffs: 0.08, laborCost: 1.3, energyCost: 0.7 },
  { name: 'Detroit', country: 'EE.UU.', region: 'América', lat: 42.3314, lng: -83.0458, type: 'industrial', tariffs: 0.08, laborCost: 1.25, energyCost: 0.95 },
  { name: 'Chicago', country: 'EE.UU.', region: 'América', lat: 41.8781, lng: -87.6298, type: 'logistics', tariffs: 0.08, laborCost: 1.28, energyCost: 1.0 },
  { name: 'São Paulo', country: 'Brasil', region: 'América', lat: -23.5558, lng: -46.6396, type: 'hub', tariffs: 0.12, laborCost: 0.6, energyCost: 0.85 },
  { name: 'Santos', country: 'Brasil', region: 'América', lat: -23.9608, lng: -46.3336, type: 'port', tariffs: 0.12, laborCost: 0.55, energyCost: 0.85 },
  { name: 'Buenos Aires', country: 'Argentina', region: 'América', lat: -34.6037, lng: -58.3816, type: 'agro', tariffs: 0.13, laborCost: 0.5, energyCost: 0.7 },
  { name: 'Santiago', country: 'Chile', region: 'América', lat: -33.4489, lng: -70.6693, type: 'mining', tariffs: 0.1, laborCost: 0.65, energyCost: 0.9 },
  { name: 'Antofagasta', country: 'Chile', region: 'América', lat: -23.6509, lng: -70.3975, type: 'mining', tariffs: 0.1, laborCost: 0.7, energyCost: 0.85 },
  { name: 'Johannesburgo', country: 'Sudáfrica', region: 'África', lat: -26.2041, lng: 28.0473, type: 'mining', tariffs: 0.11, laborCost: 0.45, energyCost: 0.75 },
  { name: 'Lagos', country: 'Nigeria', region: 'África', lat: 6.5244, lng: 3.3792, type: 'energy', tariffs: 0.14, laborCost: 0.3, energyCost: 0.55 },
  { name: 'Casablanca', country: 'Marruecos', region: 'África', lat: 33.5731, lng: -7.5898, type: 'port', tariffs: 0.09, laborCost: 0.4, energyCost: 0.8 },
  { name: 'Sídney', country: 'Australia', region: 'Oceanía', lat: -33.8688, lng: 151.2093, type: 'hub', tariffs: 0.07, laborCost: 1.35, energyCost: 1.1 },
  { name: 'Perth', country: 'Australia', region: 'Oceanía', lat: -31.9505, lng: 115.8605, type: 'mining', tariffs: 0.07, laborCost: 1.4, energyCost: 0.95 },
];

function pickResources(type, rnd) {
  const pool = RESOURCE_POOLS[type] || RESOURCE_POOLS.hub;
  const count = 2 + Math.floor(rnd() * 3);
  const shuffled = [...pool].sort(() => rnd() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(([item, richness]) => ({
    item,
    richness: Math.round((richness * (0.85 + rnd() * 0.4)) * 100) / 100,
  }));
}

function pollutionLimit(region, type) {
  const base = { Europa: 80, América: 100, Asia: 120, África: 140, Oceanía: 90 }[region] || 100;
  const mod = { electronics: -20, hub: -10, energy: 30, mining: 40, industrial: 10, port: 5, agro: -5 }[type] || 0;
  return base + mod;
}

function generateCities() {
  const rnd = mulberry32(20260815);
  const locations = [];
  const usedIds = new Set();

  function pushLoc(loc) {
    let id = loc.id || idify(loc.name + '_' + loc.country);
    let n = 2;
    while (usedIds.has(id)) {
      id = idify((loc.id || loc.name) + '_' + loc.country + '_' + n++);
    }
    usedIds.add(id);
    locations.push({
      id,
      name: loc.name,
      country: loc.country,
      region: loc.region,
      lat: Math.round(loc.lat * 10000) / 10000,
      lng: Math.round(loc.lng * 10000) / 10000,
      type: loc.type,
      tariffs: loc.tariffs,
      laborCost: loc.laborCost,
      energyCost: loc.energyCost,
      resources: loc.resources || pickResources(loc.type, rnd),
      pollutionLimit: pollutionLimit(loc.region, loc.type),
      hubLevel: loc.type === 'port' || loc.type === 'hub' ? 2 : 1,
      hasPort: loc.type === 'port' || rnd() > 0.85,
      hasRail: loc.type !== 'mining' || rnd() > 0.4,
      hasAirport: loc.type === 'hub' || rnd() > 0.92,
    });
  }

  REAL_ANCHORS.forEach((a) =>
    pushLoc({
      ...a,
      id: idify(a.name),
      resources: pickResources(a.type, rnd),
    })
  );

  COUNTRY_SEEDS.forEach((seed, si) => {
    const localRnd = mulberry32(1000 + si * 97);
    for (let i = 0; i < seed.n; i++) {
      const lat = seed.box[0] + localRnd() * (seed.box[2] - seed.box[0]);
      const lng = seed.box[1] + localRnd() * (seed.box[3] - seed.box[1]);
      const type = seed.types[Math.floor(localRnd() * seed.types.length)] || 'industrial';
      const name =
        `${PREFIX[Math.floor(localRnd() * PREFIX.length)]} ` +
        `${ROOTS[Math.floor(localRnd() * ROOTS.length)]}` +
        `${SUFFIX[Math.floor(localRnd() * SUFFIX.length)]}`;
      pushLoc({
        name,
        country: seed.country,
        region: seed.region,
        lat,
        lng,
        type,
        tariffs: seed.tariffs * (0.9 + localRnd() * 0.2),
        laborCost: seed.labor * (0.9 + localRnd() * 0.25),
        energyCost: seed.energy * (0.9 + localRnd() * 0.25),
        resources: pickResources(type, localRnd),
      });
    }
  });

  return locations;
}

function writeCities(outDir) {
  const locations = generateCities();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'locations.js'),
    `/** Auto-generado — ciudades industriales */\nwindow.IM_DATA = window.IM_DATA || {};\nwindow.IM_DATA.locations = ${JSON.stringify(locations)};\n`
  );
  console.log('cities', locations.length);
  return locations;
}

if (require.main === module) {
  writeCities(path.join(__dirname, '..', 'js', 'data'));
}

module.exports = { generateCities, writeCities };