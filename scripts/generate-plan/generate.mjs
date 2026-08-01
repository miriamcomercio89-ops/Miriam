#!/usr/bin/env node
/**
 * Genera 1 PDF por región (+ PDF maestro de orden).
 * Lee plan-construccion/REGIONES.json (10.000 hoteles).
 *
 * Carpetas:
 *   plan-construccion/pdfs/{CC}-{Pais}/{NNN}_{Region}.pdf
 *   plan-construccion/ORDEN-CONSTRUCCION.pdf
 *
 * Uso: npm run plan:pdfs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const PLAN = path.join(ROOT, 'plan-construccion')
const OUT_PDF = path.join(PLAN, 'pdfs')
const OUT_IDX = path.join(PLAN, 'indices')

const SUBS = [
  { id: 'azure-coast', name: 'Orbis Azure Coast', min: 4, max: 5, targets: ['playa', 'lujo', 'parejas'] },
  { id: 'marina-bay', name: 'Orbis Marina Bay', min: 4, max: 5, targets: ['playa', 'lujo', 'negocios'] },
  { id: 'palm-collection', name: 'Orbis Palm Collection', min: 3, max: 5, targets: ['playa', 'familiar', 'parejas'] },
  { id: 'coral-keys', name: 'Orbis Coral Keys', min: 4, max: 5, targets: ['playa', 'aventura', 'parejas'] },
  { id: 'dune-resorts', name: 'Orbis Dune Resorts', min: 4, max: 5, targets: ['lujo', 'wellness', 'aventura'] },
  { id: 'urban-core', name: 'Orbis Urban Core', min: 3, max: 5, targets: ['negocios', 'lujo'] },
  { id: 'metro-line', name: 'Orbis Metro Line', min: 2, max: 4, targets: ['negocios', 'familiar'] },
  { id: 'capitol-suites', name: 'Orbis Capitol Suites', min: 4, max: 5, targets: ['negocios', 'lujo'] },
  { id: 'skyline-inn', name: 'Orbis Skyline Inn', min: 3, max: 5, targets: ['negocios', 'parejas'] },
  { id: 'boulevard-house', name: 'Orbis Boulevard House', min: 3, max: 4, targets: ['negocios', 'familiar'] },
  { id: 'alpine-lodge', name: 'Orbis Alpine Lodge', min: 3, max: 5, targets: ['aventura', 'wellness', 'familiar'] },
  { id: 'forest-retreat', name: 'Orbis Forest Retreat', min: 3, max: 5, targets: ['wellness', 'aventura', 'familiar'] },
  { id: 'lake-manor', name: 'Orbis Lake Manor', min: 3, max: 5, targets: ['parejas', 'familiar', 'wellness'] },
  { id: 'canyon-view', name: 'Orbis Canyon View', min: 3, max: 5, targets: ['aventura', 'parejas'] },
  { id: 'vineyard-inn', name: 'Orbis Vineyard Inn', min: 3, max: 5, targets: ['parejas', 'lujo', 'wellness'] },
  { id: 'spa-sanctum', name: 'Orbis Spa Sanctum', min: 4, max: 5, targets: ['wellness', 'lujo', 'parejas'] },
  { id: 'thermal-springs', name: 'Orbis Thermal Springs', min: 3, max: 5, targets: ['wellness', 'familiar'] },
  { id: 'zen-garden', name: 'Orbis Zen Garden', min: 4, max: 5, targets: ['wellness', 'parejas'] },
  { id: 'family-village', name: 'Orbis Family Village', min: 2, max: 4, targets: ['familiar', 'playa'] },
  { id: 'kids-bay', name: 'Orbis Kids Bay', min: 2, max: 4, targets: ['familiar', 'playa'] },
  { id: 'heritage-house', name: 'Orbis Heritage House', min: 3, max: 5, targets: ['parejas', 'lujo', 'negocios'] },
  { id: 'palace-wing', name: 'Orbis Palace Wing', min: 5, max: 5, targets: ['lujo', 'parejas'] },
  { id: 'atelier-hotels', name: 'Orbis Atelier Hotels', min: 4, max: 5, targets: ['lujo', 'parejas', 'negocios'] },
  { id: 'noir-collection', name: 'Orbis Noir Collection', min: 4, max: 5, targets: ['lujo', 'parejas'] },
  { id: 'business-hub', name: 'Orbis Business Hub', min: 3, max: 5, targets: ['negocios'] },
  { id: 'congress-plaza', name: 'Orbis Congress Plaza', min: 3, max: 5, targets: ['negocios', 'lujo'] },
  { id: 'airport-gate', name: 'Orbis Airport Gate', min: 2, max: 4, targets: ['negocios', 'familiar'] },
  { id: 'railside', name: 'Orbis Railside', min: 2, max: 3, targets: ['negocios', 'familiar'] },
  { id: 'adventure-base', name: 'Orbis Adventure Base', min: 2, max: 4, targets: ['aventura', 'familiar'] },
  { id: 'safari-camp', name: 'Orbis Safari Camp', min: 3, max: 5, targets: ['aventura', 'lujo'] },
  { id: 'surf-lodge', name: 'Orbis Surf Lodge', min: 2, max: 4, targets: ['aventura', 'playa', 'parejas'] },
  { id: 'trail-inn', name: 'Orbis Trail Inn', min: 2, max: 4, targets: ['aventura', 'familiar'] },
  { id: 'island-key', name: 'Orbis Island Key', min: 4, max: 5, targets: ['playa', 'lujo', 'parejas'] },
  { id: 'lagoon-house', name: 'Orbis Lagoon House', min: 3, max: 5, targets: ['playa', 'familiar', 'wellness'] },
  { id: 'cliffside', name: 'Orbis Cliffside', min: 4, max: 5, targets: ['lujo', 'parejas', 'aventura'] },
  { id: 'harbor-light', name: 'Orbis Harbor Light', min: 3, max: 5, targets: ['negocios', 'playa', 'parejas'] },
  { id: 'garden-court', name: 'Orbis Garden Court', min: 3, max: 4, targets: ['familiar', 'wellness'] },
  { id: 'rose-quarter', name: 'Orbis Rose Quarter', min: 3, max: 5, targets: ['parejas', 'lujo'] },
  { id: 'nordic-light', name: 'Orbis Nordic Light', min: 3, max: 5, targets: ['wellness', 'aventura', 'negocios'] },
  { id: 'mediterranean', name: 'Orbis Mediterranean', min: 3, max: 5, targets: ['playa', 'familiar', 'parejas'] },
  { id: 'atlantic-view', name: 'Orbis Atlantic View', min: 3, max: 5, targets: ['playa', 'aventura'] },
  { id: 'pacific-rim', name: 'Orbis Pacific Rim', min: 3, max: 5, targets: ['negocios', 'playa', 'lujo'] },
  { id: 'caribbean-sun', name: 'Orbis Caribbean Sun', min: 3, max: 5, targets: ['playa', 'familiar', 'lujo'] },
  { id: 'andes-peak', name: 'Orbis Andes Peak', min: 3, max: 5, targets: ['aventura', 'wellness'] },
  { id: 'savanna-rest', name: 'Orbis Savanna Rest', min: 3, max: 5, targets: ['aventura', 'lujo'] },
  { id: 'silk-road', name: 'Orbis Silk Road', min: 3, max: 5, targets: ['negocios', 'lujo', 'aventura'] },
  { id: 'temple-view', name: 'Orbis Temple View', min: 3, max: 5, targets: ['wellness', 'parejas', 'aventura'] },
  { id: 'desert-mirage', name: 'Orbis Desert Mirage', min: 4, max: 5, targets: ['lujo', 'wellness'] },
  { id: 'aurora-inn', name: 'Orbis Aurora Inn', min: 3, max: 5, targets: ['aventura', 'parejas', 'wellness'] },
  { id: 'equator-house', name: 'Orbis Equator House', min: 3, max: 5, targets: ['aventura', 'playa', 'familiar'] },
]

const BOARDS = [
  { id: 'solo', label: 'Solo alojamiento' },
  { id: 'desayuno', label: 'Alojamiento y desayuno' },
  { id: 'media', label: 'Media pensión' },
  { id: 'completa', label: 'Pensión completa' },
  { id: 'ti', label: 'Todo incluido' },
  { id: 'ti_premium', label: 'Todo incluido premium' },
  { id: 'ti_gold', label: 'Todo incluido gold' },
  { id: 'ti_imperial', label: 'Todo incluido imperial' },
]

const SERVICES = [
  'wifi_premium', 'parking', 'lavanderia', 'restaurante', 'bar_azotea', 'all_inclusive',
  'piscina', 'spa', 'sauna', 'gimnasio', 'yoga', 'kids_club', 'mascotas', 'playa_privada',
  'buceo', 'golf', 'casino', 'helipuerto', 'boda', 'teatro', 'coworking', 'room_service_24h',
  'concierge', 'transfer_aeropuerto', 'tienda', 'biblioteca', 'medico', 'ev_chargers',
  'cine', 'jardines', 'mirador', 'pista_padel', 'guarderia_noche',
]

const STAFF = ['basico', 'estandar', 'premium', 'lujo']
const MIX = ['estandar', 'mixto', 'suites', 'familiar']
const QUALITY = ['simple', 'bueno', 'alto', 'lujo']
const GREEN = ['ninguno', 'basico', 'avanzado', 'elite']
const FOCUS = ['vistas', 'silencio', 'fiesta', 'trabajo', 'familia']
const SECURITY = ['bajo', 'medio', 'alto']
const TECH = ['basico', 'moderno', 'futuro']

/** Cadenas reales (marcas globales) — se combinan con la ciudad de la región */
const REAL_CHAINS = [
  'Hilton', 'Hilton Garden Inn', 'DoubleTree by Hilton', 'Hampton by Hilton',
  'Marriott', 'Courtyard by Marriott', 'Residence Inn', 'Renaissance', 'Sheraton', 'Westin', 'W Hotel',
  'Hyatt', 'Hyatt Place', 'Hyatt Regency', 'Andaz',
  'InterContinental', 'Crowne Plaza', 'Holiday Inn', 'Holiday Inn Express', 'Hotel Indigo', 'voco',
  'Novotel', 'Mercure', 'ibis', 'ibis Styles', 'Pullman', 'Sofitel', 'Mövenpick',
  'Radisson Blu', 'Park Inn by Radisson', 'Best Western', 'Best Western Plus',
  'NH Hotel', 'NH Collection', 'Melia', 'Barceló', 'Iberostar', 'AC Hotel',
  'Catalonia', 'Eurostars', 'Sercotel', 'Ilunion', 'Tryp by Wyndham', 'Wyndham',
  'Four Seasons', 'Ritz-Carlton', 'Mandarin Oriental', 'Fairmont', 'Rosewood',
  'Kimpton', 'CitizenM', 'Aloft', 'Element', 'Tribute Portfolio',
]

const SITE_SUFFIX = ['', ' Centro', ' City Center', ' Airport', ' Playa', ' Resort', ' Suites', ' Palace', ' Garden']

/** Hoteles reales curados por id de región (prioridad) */
const CURATED = {
  'es-malaga-costa-sol': [
    'Gran Hotel Miramar', 'Hotel Villa Padierna Palace', 'Marbella Club Hotel', 'Puente Romano Marbella',
    'Hotel Fuerte Marbella', 'Iberostar Selection Marbella Coral Beach', 'Don Carlos Marbella',
    'Melia Costa del Sol', 'Hotel Cervantes Torremolinos', 'Sol Príncipe Torremolinos',
    'Hotel Las Palmeras Fuengirola', 'Hotel MS Maestranza', 'Barceló Málaga', 'AC Hotel Málaga Palacio',
    'Hotel Guadalpin Banus', 'Hotel Catalonia Puerta del Mar', 'Parador de Málaga Gibralfaro',
    'Hotel Balcón de Europa Nerja', 'Holiday Inn Málaga - Costa del Sol', 'NH Málaga',
  ],
  'es-malaga-capital': [
    'Barceló Málaga', 'NH Málaga', 'AC Hotel Málaga Palacio', 'Parador de Málaga Gibralfaro',
    'Hotel MS Maestranza', 'Hotel Molina Lario', 'Room Mate Larios', 'Hotel Claude Málaga',
  ],
  'es-marbella': [
    'Marbella Club Hotel', 'Puente Romano Marbella', 'Hotel Villa Padierna Palace',
    'Don Carlos Marbella', 'Hotel Fuerte Marbella', 'Iberostar Selection Marbella Coral Beach',
  ],
  'es-barcelona': [
    'Hotel Casa Fuster', 'Hotel Majestic Barcelona', 'W Barcelona', 'Hotel Arts Barcelona',
    'Hotel El Palace Barcelona', 'Hotel España Barcelona', 'Ohla Barcelona', 'Hotel 1898',
    'Barceló Raval', 'Melia Barcelona Sky', 'AC Hotel Barcelona Forum', 'Hotel Cotton House',
  ],
  'es-madrid': [
    'Hotel Ritz Madrid', 'Hotel Villa Magna', 'The Westin Palace Madrid', 'Hotel Urban',
    'Hotel Emperador', 'Only YOU Boutique Hotel Madrid', 'Hotel Wellington', 'Barceló Emperatriz',
    'NH Collection Madrid Gran Vía', 'Hotel Único Madrid',
  ],
  'es-mallorca': [
    'Hotel Formentor', 'Jumeirah Port Soller', 'Puro Hotel Palma', 'Hotel Can Alomar',
    'Iberostar Grand Portals Nous', 'Melia Palma Bay', 'Hotel Nixe Palace',
  ],
  'es-ibiza': [
    'Hotel Hacienda Na Xamena', 'Nobu Hotel Ibiza Bay', 'Ushuaïa Ibiza Beach Hotel',
    'Hard Rock Hotel Ibiza', 'ME Ibiza',
  ],
  'es-tenerife': [
    'Bahía del Duque', 'Ritz-Carlton Abama', 'Hotel Botánico', 'Iberostar Selection Anthelia',
    'Melia Jardines del Teide',
  ],
  'es-gran-canaria': [
    'Santa Catalina Hotel', 'Lopesan Costa Meloneras', 'Hotel Riu Palace Meloneras',
    'Bohemia Suites & Spa',
  ],
  'es-sevilla': ['Hotel Alfonso XIII', 'Hotel Casa del Poeta', 'Hotel Mercer Sevilla', 'Hotel England'],
  'es-granada': ['Hotel Alhambra Palace', 'Parador de Granada', 'Hotel Casa 1800 Granada', 'Barceló Granada Congress'],
  'es-valencia': ['Hotel Las Arenas Balneario', 'Caro Hotel Valencia', 'The Westin Valencia', 'SH Inglés Boutique Hotel'],
  'es-benidorm': ['Hotel Villa Capricho', 'Melia Benidorm', 'Hotel Deloix Aqua Center', 'Barceló Asia Gardens'],
  'fr-paris': [
    'Hôtel Ritz Paris', 'Le Bristol Paris', 'Hôtel de Crillon', 'Le Meurice', 'Shangri-La Paris',
    'Hôtel Plaza Athénée', 'Mandarin Oriental Paris', 'Hôtel Lutetia', 'Pullman Paris Tour Eiffel',
  ],
  'fr-cote-azur': ['Hôtel Negresco', 'Hotel Martinez Cannes', 'Grand-Hôtel du Cap-Ferrat', 'Hotel Barrière Le Majestic Cannes'],
  'it-roma': ['Hotel de Russie', 'Hotel Hassler Roma', 'The St. Regis Rome', 'Hotel Eden Rome', 'Rome Cavalieri'],
  'it-milan': ['Hotel Principe di Savoia', 'Bulgari Hotel Milano', 'Park Hyatt Milan', 'Excelsior Hotel Gallia'],
  'it-venecia': ['Hotel Danieli', 'The Gritti Palace', 'Hotel Cipriani', 'Bauer Palazzo'],
  'it-florencia': ['Hotel Savoy Florence', 'Four Seasons Firenze', 'Hotel Brunelleschi', 'Portrait Firenze'],
  'gb-london': ['The Savoy', 'Claridge\'s', 'The Ritz London', 'Shangri-La The Shard', 'The Ned', 'Hotel Café Royal'],
  'us-nueva-york': ['The Plaza', 'Waldorf Astoria New York', 'The St. Regis New York', 'Four Seasons New York', 'The Pierre'],
  'us-los-angeles': ['Beverly Hills Hotel', 'Hotel Bel-Air', 'Shutters on the Beach', 'The Hollywood Roosevelt'],
  'us-miami': ['Fontainebleau Miami Beach', 'The Setai Miami Beach', 'Faena Hotel Miami Beach', '1 Hotel South Beach'],
  'us-las-vegas': ['Bellagio', 'Aria Resort', 'The Venetian', 'Wynn Las Vegas', 'Caesars Palace'],
  'us-orlando': ['Disney\'s Grand Floridian', 'Waldorf Astoria Orlando', 'Universal\'s Hard Rock Hotel'],
  'jp-tokio': ['Park Hyatt Tokyo', 'The Peninsula Tokyo', 'Aman Tokyo', 'Hotel Okura Tokyo', 'Imperial Hotel Tokyo'],
  'cn-shanghai': ['The Peninsula Shanghai', 'Waldorf Astoria Shanghai', 'Fairmont Peace Hotel', 'Pudong Shangri-La'],
  'cn-beijing': ['The Peninsula Beijing', 'Waldorf Astoria Beijing', 'China World Summit Wing'],
  'cn-hong-kong': ['The Peninsula Hong Kong', 'Mandarin Oriental Hong Kong', 'Island Shangri-La'],
  'ae-dubai': ['Burj Al Arab', 'Atlantis The Palm', 'Address Downtown', 'Jumeirah Beach Hotel', 'One&Only Royal Mirage'],
  'th-bangkok': ['Mandarin Oriental Bangkok', 'The Peninsula Bangkok', 'Shangri-La Bangkok', 'Lebua at State Tower'],
  'th-phuket': ['Trisara Phuket', 'Amanpuri', 'Banyan Tree Phuket', 'JW Marriott Phuket'],
  'mx-cancun': ['Nizuc Resort', 'Live Aqua Cancún', 'Hyatt Zilara Cancún', 'Grand Fiesta Americana Coral Beach'],
  'pt-lisboa': ['Pestana Palace Lisboa', 'Four Seasons Hotel Ritz Lisbon', 'Olissippo Lapa Palace'],
  'pt-algarve': ['Vila Vita Parc', 'Epic Sana Algarve', 'Pine Cliffs Resort'],
  'gr-santorini': ['Canaves Oia', 'Katikies Santorini', 'Grace Hotel Santorini'],
  'tr-estambul': ['Çırağan Palace Kempinski', 'Four Seasons Sultanahmet', 'Pera Palace Hotel'],
  'eg-el-cairo': ['Marriott Mena House', 'Four Seasons Nile Plaza', 'The Nile Ritz-Carlton'],
  'sg-singapur': ['Raffles Singapore', 'Marina Bay Sands', 'Fullerton Hotel Singapore'],
  'au-sydney': ['Park Hyatt Sydney', 'Shangri-La Sydney', 'Quay West Suites Sydney'],
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN(rng, arr, n) {
  const copy = [...arr]
  const out = []
  while (out.length < n && copy.length) {
    const i = Math.floor(rng() * copy.length)
    out.push(copy.splice(i, 1)[0])
  }
  return out
}

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

function cityFromRegion(name) {
  // "Costa del Sol (Málaga)" → Málaga; "Nueva York" → Nueva York
  const m = name.match(/\(([^)]+)\)/)
  if (m) return m[1].split('/')[0].trim()
  return name.split('/')[0].split(',')[0].trim()
}

function detectVibe(name, lat) {
  const n = name.toLowerCase()
  if (/costa|playa|beach|island|isla|maldives|maldiv|carib|bali|phuket|ibiza|mallorca|canaria|tenerife|algarve|riviera|cancun|miami|hawaii|seychell|mauritius|zanzibar/.test(n)) return 'coast'
  if (/alpes|alpine|ski|sierra|mountain|patagonia|safari|kruger|serengeti|fiordo|nature|parque|national/.test(n)) return 'nature'
  if (/palace|heritage|historic|roma|paris|venecia|florencia|praga|kyoto|kioto|cusco|petra|angkor/.test(n)) return 'heritage'
  if (Math.abs(lat) < 35 && /desert|dubai|doha|marrakech|cairo|cairo/.test(n)) return 'luxury'
  return 'urban'
}

function themeFor(vibe, countryCode, order) {
  const themes = {
    coast: ['#0B3D4A', '#C4A35A', '#F2E6C8'],
    nature: ['#163028', '#7BA88A', '#E4F0E8'],
    heritage: ['#2A1F18', '#C9A227', '#F3E5C4'],
    luxury: ['#1A1028', '#C9A86C', '#F5EFE3'],
    urban: ['#111827', '#C4A35A', '#F5F0E6'],
  }
  const base = [...(themes[vibe] || themes.urban)]
  // ligera variación por orden/país
  const hueShift = (order * 17 + countryCode.charCodeAt(0)) % 40
  if (hueShift > 20) base[1] = '#B8956A'
  return base
}

function realHotelName(region, localIdx, city, rng) {
  const curated = CURATED[region.id]
  if (curated && localIdx < curated.length) return curated[localIdx]
  if (curated) {
    const base = curated[localIdx % curated.length]
    const suffix = SITE_SUFFIX[Math.floor(localIdx / curated.length) % SITE_SUFFIX.length]
    if (suffix) return `${base}${suffix}`.replace(/  +/g, ' ')
  }
  // Marca real + ciudad de la región + sufijo de tipo de sede (patrón real de cadenas)
  const chain = REAL_CHAINS[(localIdx + region.order) % REAL_CHAINS.length]
  const suffix = SITE_SUFFIX[localIdx % SITE_SUFFIX.length]
  return `${chain} ${city}${suffix}`.trim()
}

function orbisHotelName(sub, city, order) {
  const short = sub.name.replace(/^Orbis\s+/, '')
  return `${short} ${city} #${order}`
}

function boardLabel(id) {
  return BOARDS.find((b) => b.id === id)?.label ?? id
}

function buildHotel(order, region, localIdx, rng) {
  const city = cityFromRegion(region.name)
  const vibe = region.vibe
  const sub = SUBS[(order + localIdx) % SUBS.length]
  const stars = sub.min + Math.floor(rng() * (sub.max - sub.min + 1))
  const rooms = 40 + Math.floor(rng() * 260) + (stars >= 5 ? 40 : 0)
  const target = pick(rng, sub.targets)

  const vibeBoard =
    vibe === 'coast'
      ? ['desayuno', 'media', 'completa', 'ti', 'ti_premium']
      : vibe === 'urban'
        ? ['solo', 'desayuno', 'media']
        : ['solo', 'desayuno', 'media', 'completa']

  let availableRegimes = pickN(rng, BOARDS.map((b) => b.id), 3 + Math.floor(rng() * 4))
  for (const b of vibeBoard.slice(0, 2)) {
    if (!availableRegimes.includes(b)) availableRegimes.push(b)
  }
  availableRegimes = [...new Set(availableRegimes)]
  const preferred = availableRegimes.filter((b) => vibeBoard.includes(b))
  const boardRegime = pick(rng, preferred.length ? preferred : availableRegimes)

  const serviceCount = 4 + Math.floor(rng() * 8)
  const services = pickN(rng, SERVICES, serviceCount)
  if (boardRegime.startsWith('ti') && !services.includes('all_inclusive')) services.push('all_inclusive')
  if (vibe === 'coast' && rng() > 0.55 && !services.includes('piscina')) services.push('piscina')

  const staffLevel = stars >= 5 ? pick(rng, ['premium', 'lujo']) : pick(rng, STAFF)
  const roomMix = target === 'familiar' ? 'familiar' : stars >= 5 ? pick(rng, ['mixto', 'suites']) : pick(rng, MIX)
  const buildQuality = stars >= 5 ? pick(rng, ['alto', 'lujo']) : pick(rng, QUALITY)
  const greenLevel = pick(rng, GREEN)
  const designFocus = vibe === 'coast' ? pick(rng, ['vistas', 'fiesta', 'familia']) : pick(rng, FOCUS)
  const securityLevel = stars >= 4 ? pick(rng, ['medio', 'alto']) : pick(rng, SECURITY)
  const techLevel = pick(rng, TECH)

  return {
    order,
    realHotel: realHotelName(region, localIdx, city, rng),
    name: orbisHotelName(sub, city, order),
    subsidiaryId: sub.id,
    subsidiaryName: sub.name,
    country: region.country,
    countryCode: region.countryCode,
    regionId: region.id,
    regionName: region.name,
    city,
    stars,
    rooms,
    target,
    staffLevel,
    roomMix,
    buildQuality,
    floors: 2 + Math.floor(rng() * (stars >= 4 ? 18 : 8)),
    greenLevel,
    meetingRooms: target === 'negocios' ? 2 + Math.floor(rng() * 8) : Math.floor(rng() * 3),
    parkingSpots: 10 + Math.floor(rng() * 120),
    restaurantLevel: stars >= 4 ? 2 + Math.floor(rng() * 4) : Math.floor(rng() * 3),
    openingPromoDays: Math.floor(rng() * 15),
    designFocus,
    buffet: boardRegime !== 'solo' && rng() > 0.4,
    lateCheckout: rng() > 0.35,
    airportDesk: target === 'negocios' || rng() > 0.7,
    securityLevel,
    techLevel,
    breakfastIncluded: boardRegime !== 'solo',
    seaViewShare: vibe === 'coast' ? 20 + Math.floor(rng() * 70) : Math.floor(rng() * 15),
    loyaltyProgram: rng() > 0.55,
    quietHours: designFocus === 'silencio' || rng() > 0.7,
    bikeRental: vibe === 'nature' || rng() > 0.75,
    shuttleCity: rng() > 0.6,
    boardRegime,
    availableRegimes,
    services,
    imageKey: `${['coast', 'urban', 'nature', 'luxury', 'family', 'adventure'][order % 6]}:${['day', 'dusk', 'night', 'aerial', 'sunny'][order % 5]}`,
  }
}

function writeRegionPdf(region, hotels, filePath) {
  return new Promise((resolve, reject) => {
    const [c1, c2, c3] = region.theme
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36,
      info: { Title: `Orbis · ${region.name}`, Author: 'Orbis Hotels Group' },
    })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const header = () => {
      doc.rect(0, 0, doc.page.width, 64).fill(c1)
      doc.fillColor(c3).font('Helvetica-Bold').fontSize(16).text('ORBIS HOTELS GROUP', 36, 16)
      doc.font('Helvetica').fontSize(10).fillColor(c2)
        .text(`Plan de construcción · ${region.country} · ${region.name}`, 36, 38)
      doc.fillColor('#222')
    }

    header()
    doc.moveDown(2.2)
    doc.font('Helvetica-Bold').fontSize(18).fillColor(c1).text(region.name)
    doc.font('Helvetica').fontSize(10).fillColor('#444')
      .text(`País: ${region.country} (${region.countryCode}) · Orden de zona: #${region.order}`)
      .text(`Hoteles en esta zona: ${hotels.length}`)
      .text(`Orden global: del #${hotels[0].order} al #${hotels[hotels.length - 1].order}`)
      .text('Compra el hotel real indicado y constrúyelo en el simulador con el nombre Orbis y estos parámetros.')
    doc.moveDown(0.5)
    doc.rect(36, doc.y, doc.page.width - 72, 3).fill(c2)
    doc.moveDown(0.9)

    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      if (doc.y > doc.page.height - 230) {
        doc.addPage()
        header()
        doc.moveDown(2.2)
      }

      const top = doc.y
      const cardH = 210
      doc.roundedRect(36, top, doc.page.width - 72, cardH, 8).lineWidth(1).strokeColor(c2).stroke()
      doc.rect(36, top, 8, cardH).fill(c1)

      doc.fillColor(c1).font('Helvetica-Bold').fontSize(11)
        .text(`#${h.order}`, 52, top + 10, { width: 60, continued: false })
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#8B1E1E')
        .text(`Compra: ${h.realHotel}`, 52, top + 26, { width: doc.page.width - 100 })
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0B4F2F')
        .text(`Nuevo: ${h.name}`, 52, top + 42, { width: doc.page.width - 100 })
      doc.font('Helvetica').fontSize(9).fillColor('#333')
        .text(`${h.subsidiaryName}  ·  ${h.city}  ·  ${h.stars}★  ·  ${h.rooms} hab.`, 52, top + 58)

      const col1 = [
        `Clientes: ${h.target}`,
        `Personal: ${h.staffLevel}`,
        `Habitaciones: ${h.roomMix}`,
        `Calidad: ${h.buildQuality}`,
        `Plantas: ${h.floors}`,
        `Plan verde: ${h.greenLevel}`,
        `Seguridad: ${h.securityLevel}`,
        `Tecnología: ${h.techLevel}`,
        `Enfoque: ${h.designFocus}`,
      ]
      const col2 = [
        `Salas reuniones: ${h.meetingRooms}`,
        `Parking: ${h.parkingSpots}`,
        `Restaurante niv.: ${h.restaurantLevel}`,
        `Oferta apertura: ${h.openingPromoDays} d`,
        `Vistas mar: ${h.seaViewShare}%`,
        `Desayuno: ${h.breakfastIncluded ? 'Sí' : 'No'}`,
        `Fidelidad: ${h.loyaltyProgram ? 'Sí' : 'No'}`,
        `Buffet: ${h.buffet ? 'Sí' : 'No'}`,
        `Salida tarde: ${h.lateCheckout ? 'Sí' : 'No'}`,
      ]
      const col3 = [
        `Mostrador aero.: ${h.airportDesk ? 'Sí' : 'No'}`,
        `Horas silencio: ${h.quietHours ? 'Sí' : 'No'}`,
        `Bicis: ${h.bikeRental ? 'Sí' : 'No'}`,
        `Bus centro: ${h.shuttleCity ? 'Sí' : 'No'}`,
        `Régimen: ${boardLabel(h.boardRegime)}`,
        `Foto: ${h.imageKey}`,
        `Zona: ${h.regionName}`,
        `País: ${h.country}`,
        `Local: ${i + 1}/${hotels.length}`,
      ]

      doc.fontSize(8).fillColor('#222')
      let y = top + 74
      for (let r = 0; r < col1.length; r++) {
        doc.text(col1[r], 52, y, { width: 160, lineBreak: false })
        doc.text(col2[r], 220, y, { width: 160, lineBreak: false })
        doc.text(col3[r], 390, y, { width: 170, lineBreak: false })
        y += 11
      }

      doc.font('Helvetica-Bold').fontSize(8).fillColor(c1).text('Regímenes disponibles:', 52, y + 4)
      doc.font('Helvetica').fillColor('#222')
        .text(h.availableRegimes.map(boardLabel).join(' · '), 52, y + 15, { width: doc.page.width - 100 })
      doc.font('Helvetica-Bold').fillColor(c1).text('Servicios:', 52, y + 30)
      doc.font('Helvetica').fillColor('#222')
        .text(h.services.join(', '), 52, y + 41, { width: doc.page.width - 100 })

      doc.y = top + cardH + 8
    }

    doc.fontSize(8).fillColor('#666')
      .text(
        `Orbis Hotels Group · Zona #${region.order} · ${region.countryCode} · Construir a mano en el simulador`,
        36,
        doc.page.height - 28,
        { width: doc.page.width - 72, align: 'center' },
      )
    doc.end()
  })
}

function writeMasterPdf(master, countries, meta, filePath) {
  return new Promise((resolve, reject) => {
    const c1 = '#0B3D4A'
    const c2 = '#C4A35A'
    const c3 = '#F2E6C8'
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: { Title: 'Orbis · Orden de construcción', Author: 'Orbis Hotels Group' },
    })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    // Portada
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(28).text('ORBIS HOTELS GROUP', 50, 160, { align: 'center' })
    doc.fontSize(16).fillColor(c2).text('Plan de construcción', 50, 210, { align: 'center' })
    doc.font('Helvetica').fontSize(12).fillColor(c3)
      .text(`${meta.totalHotels} hoteles · ${meta.totalRegions} zonas · ${meta.totalCountries} países`, 50, 250, { align: 'center' })
      .text('Empieza por: Costa del Sol (Málaga)', 50, 275, { align: 'center' })
      .text('Este PDF indica el orden de las regiones.', 50, 320, { align: 'center' })
      .text('Cada zona tiene su propio PDF en la carpeta pdfs/.', 50, 340, { align: 'center' })

    // Resumen países
    doc.addPage()
    doc.rect(0, 0, doc.page.width, 56).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(14).text('ORDEN DE CONSTRUCCIÓN · Países', 40, 20)
    doc.font('Helvetica').fontSize(9).fillColor(c2).text('Hoteles totales por país (mayor → menor)', 40, 38)
    doc.moveDown(2)
    doc.fillColor('#222').font('Helvetica-Bold').fontSize(9)
    doc.text('#', 40, doc.y, { continued: true, width: 30 })
    doc.text('País', 70, doc.y, { continued: true, width: 200 })
    doc.text('Hoteles', 280, doc.y, { continued: true, width: 60 })
    doc.text('Zonas', 350, doc.y, { width: 50 })
    doc.moveDown(0.4)
    doc.strokeColor(c2).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.3)
    doc.font('Helvetica').fontSize(9)
    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]
      if (doc.y > 760) {
        doc.addPage()
        doc.rect(0, 0, doc.page.width, 40).fill(c1)
        doc.fillColor(c3).font('Helvetica-Bold').fontSize(11).text('Países (cont.)', 40, 14)
        doc.moveDown(2)
        doc.fillColor('#222').font('Helvetica').fontSize(9)
      }
      const y = doc.y
      doc.text(String(i + 1), 40, y, { width: 28 })
      doc.text(c.name, 70, y, { width: 200 })
      doc.text(String(c.hotels), 280, y, { width: 60 })
      doc.text(String(c.regions), 350, y, { width: 50 })
      doc.y = y + 14
    }

    // Orden de regiones
    doc.addPage()
    doc.rect(0, 0, doc.page.width, 56).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(14).text('ORDEN DE ZONAS (construir en este orden)', 40, 20)
    doc.font('Helvetica').fontSize(9).fillColor(c2)
      .text('Sigue el número. Carpeta = país. Archivo = NNN_nombre.pdf', 40, 38)
    doc.moveDown(2)
    doc.fillColor('#222').font('Helvetica-Bold').fontSize(8)
    let y = doc.y
    doc.text('#', 40, y, { width: 28 })
    doc.text('Zona', 70, y, { width: 170 })
    doc.text('País', 245, y, { width: 100 })
    doc.text('Hoteles', 350, y, { width: 45 })
    doc.text('Orden hoteles', 400, y, { width: 80 })
    doc.text('Carpeta', 485, y, { width: 70 })
    doc.y = y + 12
    doc.strokeColor(c2).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.25)
    doc.font('Helvetica').fontSize(7.5)

    for (const m of master) {
      if (doc.y > 770) {
        doc.addPage()
        doc.rect(0, 0, doc.page.width, 40).fill(c1)
        doc.fillColor(c3).font('Helvetica-Bold').fontSize(11).text('Orden de zonas (cont.)', 40, 14)
        doc.moveDown(1.8)
        doc.fillColor('#222').font('Helvetica').fontSize(7.5)
      }
      const rowY = doc.y
      doc.text(String(m.order), 40, rowY, { width: 28 })
      doc.text(m.region, 70, rowY, { width: 170 })
      doc.text(m.country, 245, rowY, { width: 100 })
      doc.text(String(m.count), 350, rowY, { width: 45 })
      doc.text(`#${m.orderStart}–#${m.orderEnd}`, 400, rowY, { width: 80 })
      doc.text(m.folder, 485, rowY, { width: 70 })
      doc.y = rowY + 11
    }

    doc.end()
  })
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    const st = fs.statSync(p)
    if (st.isDirectory()) rmrf(p)
    else fs.unlinkSync(p)
  }
  fs.rmdirSync(dir)
}

async function main() {
  const dataPath = path.join(PLAN, 'REGIONES.json')
  if (!fs.existsSync(dataPath)) {
    console.error('Falta REGIONES.json. Ejecuta primero: npm run plan:regions')
    process.exit(1)
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  const regions = data.regions
  const t0 = Date.now()

  // Limpiar salidas previas
  if (fs.existsSync(OUT_PDF)) rmrf(OUT_PDF)
  if (fs.existsSync(OUT_IDX)) rmrf(OUT_IDX)
  fs.mkdirSync(OUT_PDF, { recursive: true })
  fs.mkdirSync(OUT_IDX, { recursive: true })

  // Enrich regions
  for (const r of regions) {
    r.vibe = detectVibe(r.name, r.lat)
    r.theme = themeFor(r.vibe, r.countryCode, r.order)
  }

  let order = 1
  const master = []
  console.log(`Zonas: ${regions.length} · Hoteles: ${data.totalHotels}`)

  for (const region of regions) {
    const n = region.hotels
    const rng = mulberry32(2000 + region.order * 7919 + n)
    const hotels = []
    for (let i = 0; i < n; i++) {
      hotels.push(buildHotel(order, region, i, rng))
      order++
    }

    const folderName = `${region.countryCode}-${slugify(region.country)}`
    const folderPath = path.join(OUT_PDF, folderName)
    fs.mkdirSync(folderPath, { recursive: true })

    const fileBase = `${String(region.order).padStart(3, '0')}_${slugify(region.name)}`
    const pdfName = `${fileBase}.pdf`
    const pdfRel = `pdfs/${folderName}/${pdfName}`
    await writeRegionPdf(region, hotels, path.join(folderPath, pdfName))

    const idx = {
      order: region.order,
      orderStart: hotels[0].order,
      orderEnd: hotels[hotels.length - 1].order,
      region: region.name,
      regionId: region.id,
      country: region.country,
      countryCode: region.countryCode,
      count: n,
      folder: folderName,
      pdf: pdfRel,
    }
    master.push(idx)
    fs.writeFileSync(path.join(OUT_IDX, `${fileBase}.json`), JSON.stringify({ ...idx, hotels }, null, 0))

    if (region.order % 25 === 0 || region.order === 1 || region.order === regions.length) {
      console.log(`[${region.order}/${regions.length}] ${region.country} · ${region.name}: ${n} → ${pdfRel}`)
    }
  }

  const masterPath = path.join(PLAN, 'ORDEN-CONSTRUCCION.pdf')
  await writeMasterPdf(master, data.countries, data, masterPath)

  fs.writeFileSync(
    path.join(PLAN, 'INDEX.json'),
    JSON.stringify(
      {
        totalHotels: data.totalHotels,
        totalRegions: master.length,
        totalCountries: data.totalCountries,
        generatedAt: new Date().toISOString(),
        startRegion: master[0],
        masterPdf: 'ORDEN-CONSTRUCCION.pdf',
        items: master,
      },
      null,
      2,
    ),
  )

  const md = [
    '# Plan de construcción Orbis (10.000 hoteles)',
    '',
    '**Empieza por Costa del Sol (Málaga).** Sigue el orden del PDF maestro.',
    '',
    '## Archivos clave',
    '',
    `- [\`ORDEN-CONSTRUCCION.pdf\`](./ORDEN-CONSTRUCCION.pdf) — orden de todas las zonas`,
    `- \`pdfs/{PAIS}/NNN_Zona.pdf\` — un PDF por región, con fichas Compra → Nuevo`,
    '',
    `| | |`,
    `|---|---|`,
    `| Hoteles | ${data.totalHotels} |`,
    `| Zonas / PDFs | ${master.length} |`,
    `| Países | ${data.totalCountries} |`,
    '',
    '## Orden de zonas',
    '',
    `| # | Zona | País | Hoteles | Orden | PDF |`,
    `|---:|---|---|---:|---|---|`,
    ...master.map(
      (m) =>
        `| ${m.order} | ${m.region} | ${m.country} | ${m.count} | #${m.orderStart}–#${m.orderEnd} | \`${m.pdf}\` |`,
    ),
    '',
    `Generado en ${((Date.now() - t0) / 1000).toFixed(1)}s.`,
  ].join('\n')
  fs.writeFileSync(path.join(PLAN, 'README.md'), md)

  console.log(`Listo: ${master.length} PDFs + maestro · ${data.totalHotels} hoteles · ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log(`Maestro: plan-construccion/ORDEN-CONSTRUCCION.pdf`)
  console.log(`PDFs: plan-construccion/pdfs/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
