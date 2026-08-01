/**
 * Generador del plan de construcción Orbis: 50.000 hoteles, 1 PDF por provincia.
 * Orden global: empieza en Málaga (España) y continúa por el resto.
 *
 * Uso: node scripts/generate-plan/generate.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const OUT_PDF = path.join(ROOT, 'plan-construccion', 'pdfs')
const OUT_IDX = path.join(ROOT, 'plan-construccion', 'indices')
const TOTAL = 50_000

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

/** Provincias en orden de construcción. weight relativo → se normaliza a 50.000 */
function buildProvinces() {
  /** @type {{code:string,country:string,countryCode:string,name:string,weight:number,theme:[string,string,string],vibe:string,cities:string[],realHotels:string[]}[]} */
  const list = []

  const spain = [
    ['ES-MA', 'Málaga', 420, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast',
      ['Málaga', 'Marbella', 'Torremolinos', 'Fuengirola', 'Nerja', 'Ronda', 'Estepona', 'Antequera', 'Benalmádena', 'Mijas'],
      ['Gran Hotel Miramar', 'Hotel Villa Padierna Palace', 'Marbella Club Hotel', 'Puente Romano Marbella', 'Hotel Fuerte Marbella',
        'Barceló Málaga', 'NH Málaga', 'AC Hotel Málaga Palacio', 'Parador de Málaga Gibralfaro', 'Hotel MS Maestranza',
        'Iberostar Selection Marbella Coral Beach', 'Hotel Guadalpin Banus', 'Don Carlos Marbella', 'Melia Costa del Sol',
        'Hotel Cervantes Torremolinos', 'Sol Príncipe Torremolinos', 'Hotel Las Palmeras Fuengirola', 'Hotel Balcón de Europa Nerja',
        'Parador de Ronda', 'Hotel Catalonia Puerta del Mar']],
    ['ES-GR', 'Granada', 280, ['#2C1F1A', '#B08D57', '#E8DCC8'], 'heritage',
      ['Granada', 'Motril', 'Almuñécar', 'Sierra Nevada', 'Baza'],
      ['Hotel Alhambra Palace', 'Parador de Granada', 'Hotel Casa 1800 Granada', 'Barceló Granada Congress', 'Hotel Palacio de Santa Paula']],
    ['ES-AL', 'Almería', 180, ['#1A3A4A', '#D4A574', '#F5E6D3'], 'coast',
      ['Almería', 'Roquetas de Mar', 'Mojácar', 'El Ejido', 'Carboneras'],
      ['Hotel Barceló Cabo de Gata', 'Hotel Playadulce', 'Parador de Mojácar', 'Hotel Costacabana']],
    ['ES-CA', 'Cádiz', 260, ['#0E3B4F', '#E0B15A', '#F7EEDC'], 'coast',
      ['Cádiz', 'Jerez de la Frontera', 'Chiclana', 'Tarifa', 'Sanlúcar de Barrameda', 'Conil'],
      ['Parador de Cádiz', 'Hotel Hipotels Sherry', 'Hotel Duque de Nájera', 'Hurricane Hotel Tarifa']],
    ['ES-SE', 'Sevilla', 300, ['#4A1C1C', '#D4A017', '#F3E5C4'], 'heritage',
      ['Sevilla', 'Écija', 'Utrera', 'Carmona', 'Osuna'],
      ['Hotel Alfonso XIII', 'Hotel Casa del Poeta', 'Hotel Mercer Sevilla', 'Hotel England']],
    ['ES-CO', 'Córdoba', 170, ['#3A2A1A', '#C9A227', '#EFE2C8'], 'heritage',
      ['Córdoba', 'Lucena', 'Priego de Córdoba', 'Montilla'],
      ['Hospes Palacio del Bailío', 'Hotel Macià Alfaros', 'Parador de Córdoba']],
    ['ES-JA', 'Jaén', 90, ['#1F3A24', '#A3B86C', '#E8EED9'], 'nature',
      ['Jaén', 'Úbeda', 'Baeza', 'Cazorla'],
      ['Parador de Jaén', 'Hotel Avenida Jiennense', 'Parador de Cazorla']],
    ['ES-H', 'Huelva', 140, ['#0F3D3A', '#C2A46B', '#F0E6D2'], 'coast',
      ['Huelva', 'Isla Cristina', 'Punta Umbría', 'Aracena', 'Ayamonte'],
      ['Parador de Ayamonte', 'Hotel Fuerte El Rompido', 'Hotel Monte Conquero']],
    ['ES-MU', 'Murcia', 200, ['#123447', '#C9A46A', '#F2E8D5'], 'coast',
      ['Murcia', 'Cartagena', 'La Manga', 'Águilas', 'Mazarrón'],
      ['Hotel Nelva Murcia', 'Hotel NH Cartagena', 'Hotel Servigroup Galúa']],
    ['ES-A', 'Alicante', 340, ['#0B4A5C', '#E8B84A', '#FFF4DC'], 'coast',
      ['Alicante', 'Benidorm', 'Torrevieja', 'Altea', 'Elche', 'Denia', 'Calpe'],
      ['Hotel Asia Alicante', 'Hotel Deloix Aqua Center', 'Hotel Villa Venecia', 'Asia Gardens Hotel']],
    ['ES-V', 'Valencia', 320, ['#1B2F4A', '#F29E38', '#FFE8CC'], 'urban',
      ['Valencia', 'Gandía', 'Sagunto', 'Cullera', 'Xàtiva'],
      ['Hotel Las Arenas Balneario', 'The Westin Valencia', 'Hotel SH Valencia Palace']],
    ['ES-CS', 'Castellón', 120, ['#163A45', '#C7B07A', '#F3EBDA'], 'coast',
      ['Castellón de la Plana', 'Peñíscola', 'Benicàssim', 'Vinaròs'],
      ['Hotel RH Bayren Parc', 'Hotel Peñíscola Plaza Suites']],
    ['ES-T', 'Tarragona', 160, ['#2A1F18', '#C49A6C', '#F0E4D4'], 'coast',
      ['Tarragona', 'Salou', 'Cambrils', 'Tortosa', 'Reus'],
      ['Hotel SB Corona Tarragona', 'Hotel Best Cap Salou', 'Hotel PortAventura']],
    ['ES-B', 'Barcelona', 480, ['#0D2137', '#C4A35A', '#F7F3EA'], 'urban',
      ['Barcelona', 'Sitges', 'Badalona', 'Mataró', 'Hospitalet', 'Vilanova i la Geltrú'],
      ['Hotel Arts Barcelona', 'W Barcelona', 'Hotel Casa Fuster', 'Majestic Hotel & Spa', 'Hotel El Palace Barcelona',
        'Hotel Ohla Barcelona', 'Cotton House Hotel', 'Hotel Me Barcelona', 'Hotel ME Sitges Terramar']],
    ['ES-GI', 'Girona', 180, ['#1A3A3A', '#A8C4B0', '#EAF2EC'], 'nature',
      ['Girona', 'Lloret de Mar', 'Roses', 'Figueres', 'Blanes', 'Cadaqués'],
      ['Hotel Historic Girona', 'Hotel Santa Clara Lloret', 'Hotel Cap Sa Sal']],
    ['ES-L', 'Lleida', 70, ['#2A3320', '#B7A078', '#EDE4D4'], 'nature',
      ['Lleida', 'La Seu d’Urgell', 'Vielha', 'Balaguer'],
      ['Hotel Real Lleida', 'Parador de Vielha']],
    ['ES-HU', 'Huesca', 80, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'nature',
      ['Huesca', 'Jaca', 'Benasque', 'Barbastro'],
      ['Hotel Pedro I de Aragón', 'Hotel Conde Aznar Jaca']],
    ['ES-Z', 'Zaragoza', 150, ['#2B1F1A', '#C9A66B', '#F2E6D4'], 'urban',
      ['Zaragoza', 'Calatayud', 'Tarazona'],
      ['Hotel Palafox Zaragoza', 'Hotel Alfonso Zaragoza', 'Hotel Catalonia El Pilar']],
    ['ES-TE', 'Teruel', 45, ['#3A2A22', '#B8956A', '#EFE4D6'], 'heritage',
      ['Teruel', 'Albarracín', 'Alcañiz'],
      ['Parador de Teruel', 'Hotel Reina Cristina']],
    ['ES-GU', 'Guadalajara', 50, ['#2A3038', '#A09078', '#E8E2D8'], 'nature',
      ['Guadalajara', 'Sigüenza', 'Molina de Aragón'],
      ['Parador de Sigüenza', 'Hotel España Guadalajara']],
    ['ES-M', 'Madrid', 500, ['#111827', '#C4A35A', '#F5F0E6'], 'urban',
      ['Madrid', 'Alcalá de Henares', 'Aranjuez', 'El Escorial', 'Pozuelo', 'Getafe'],
      ['Hotel Ritz Madrid', 'Hotel Palace Madrid', 'Four Seasons Madrid', 'Hotel Urban Madrid', 'Only YOU Boutique Hotel',
        'Hotel Villa Magna', 'VP Plaza España', 'Hotel Emperador']],
    ['ES-TO', 'Toledo', 90, ['#3A2418', '#C9A05A', '#F0E2CC'], 'heritage',
      ['Toledo', 'Talavera de la Reina', 'Oropesa'],
      ['Hotel Eugenia de Montijo', 'Parador de Toledo', 'Hotel Domus Selecta']],
    ['ES-CR', 'Ciudad Real', 55, ['#2F3A28', '#B8A078', '#EBE4D6'], 'nature',
      ['Ciudad Real', 'Valdepeñas', 'Almagro', 'Alcázar de San Juan'],
      ['Parador de Almagro', 'Hotel NH Ciudad Real']],
    ['ES-AB', 'Albacete', 60, ['#243038', '#A8B0A0', '#E8EBE6'], 'urban',
      ['Albacete', 'Hellín', 'Almansa'],
      ['Hotel Beatriz Albacete', 'Parador de Albacete']],
    ['ES-CU', 'Cuenca', 55, ['#2A2A32', '#B0A090', '#EAE4DC'], 'heritage',
      ['Cuenca', 'Tarancón', 'San Clemente'],
      ['Parador de Cuenca', 'Hotel Cueva del Fraile']],
    ['ES-AV', 'Ávila', 50, ['#2C3038', '#9AA8B8', '#E8EEF2'], 'heritage',
      ['Ávila', 'Arévalo', 'Arenas de San Pedro'],
      ['Parador de Ávila', 'Hotel Palacio Valderrábanos']],
    ['ES-SG', 'Segovia', 70, ['#2A2430', '#C4A882', '#F0E6D8'], 'heritage',
      ['Segovia', 'La Granja', 'El Espinar'],
      ['Hotel Palacio San Facundo', 'Parador de Segovia']],
    ['ES-VA', 'Valladolid', 100, ['#1F2A35', '#B89A6A', '#EFE6D6'], 'urban',
      ['Valladolid', 'Medina del Campo', 'Peñafiel'],
      ['Hotel Olid Meliá', 'Hotel Enara', 'Hotel Felipe IV']],
    ['ES-SA', 'Salamanca', 110, ['#3A2A1C', '#D4B06A', '#F5EBD8'], 'heritage',
      ['Salamanca', 'Ciudad Rodrigo', 'Béjar'],
      ['Hotel Rector', 'Hotel Abba Fonseca', 'Parador de Salamanca']],
    ['ES-ZA', 'Zamora', 40, ['#2A3030', '#A0B0A8', '#E6EBE8'], 'heritage',
      ['Zamora', 'Benavente', 'Toro'],
      ['Parador de Zamora', 'Hotel NH Palacio del Duero']],
    ['ES-LE', 'León', 90, ['#1A2430', '#C0A878', '#EFE6D8'], 'heritage',
      ['León', 'Ponferrada', 'Astorga'],
      ['Hotel Real Colegiata San Isidoro', 'Parador de León', 'Hotel Alfonso V']],
    ['ES-P', 'Palencia', 40, ['#243038', '#A8A090', '#E8E4DC'], 'urban',
      ['Palencia', 'Aguilar de Campoo'],
      ['Hotel AC Palencia', 'Hotel Colón Palencia']],
    ['ES-BU', 'Burgos', 85, ['#1E2835', '#B8A070', '#EFE6D6'], 'heritage',
      ['Burgos', 'Aranda de Duero', 'Miranda de Ebro'],
      ['Hotel NH Collection Palacio de Burgos', 'Hotel Landa']],
    ['ES-SO', 'Soria', 35, ['#2A3228', '#A8B090', '#E8ECDD'], 'nature',
      ['Soria', 'El Burgo de Osma'],
      ['Parador de Soria', 'Hotel Alfonso VIII']],
    ['ES-LO', 'La Rioja', 75, ['#3A1A22', '#8B1E3F', '#F2E4E8'], 'wine',
      ['Logroño', 'Haro', 'Calahorra'],
      ['Hotel Carlton Rioja', 'Hotel Los Agustinos Haro']],
    ['ES-NA', 'Navarra', 95, ['#1A2A3A', '#C4A35A', '#F0E8D8'], 'nature',
      ['Pamplona', 'Tudela', 'Estella'],
      ['Hotel Maisonnave', 'Hotel Tres Reyes', 'Parador de Olite']],
    ['ES-SS', 'Gipuzkoa', 130, ['#0F2F3A', '#4A90A4', '#E4F0F4'], 'coast',
      ['San Sebastián', 'Irún', 'Zarautz', 'Hondarribia'],
      ['Hotel María Cristina', 'Hotel de Londres y de Inglaterra', 'Hotel Niza']],
    ['ES-BI', 'Bizkaia', 160, ['#12202E', '#C4A35A', '#F2EBD8'], 'urban',
      ['Bilbao', 'Getxo', 'Durango', 'Bermeo'],
      ['Hotel López de Haro', 'Hotel Miró Bilbao', 'Gran Hotel Domine']],
    ['ES-VI', 'Araba', 55, ['#1A2830', '#A0B8A8', '#E8F0EC'], 'urban',
      ['Vitoria-Gasteiz', 'Laguardia'],
      ['Hotel NH Canciller Ayala', 'Hotel Silken Ciudad de Vitoria']],
    ['ES-S', 'Cantabria', 120, ['#0E2F3A', '#6FA8B8', '#E4F2F6'], 'coast',
      ['Santander', 'Laredo', 'Comillas', 'San Vicente de la Barquera'],
      ['Hotel Real Santander', 'Hotel Bahía Santander', 'Parador de Santillana']],
    ['ES-O', 'Asturias', 140, ['#163028', '#7BA88A', '#E4F0E8'], 'coast',
      ['Oviedo', 'Gijón', 'Avilés', 'Llanes', 'Cudillero'],
      ['Hotel de la Reconquista', 'Hotel Miramar Gijón', 'Parador de Gijón']],
    ['ES-LU', 'Lugo', 55, ['#1E2A28', '#8FA898', '#E6EEEA'], 'nature',
      ['Lugo', 'Ribadeo', 'Viveiro'],
      ['Hotel Méndez Núñez', 'Parador de Ribadeo']],
    ['ES-C', 'A Coruña', 150, ['#0E2A3A', '#5A8FA8', '#E2EEF4'], 'coast',
      ['A Coruña', 'Santiago de Compostela', 'Ferrol', 'Finisterre'],
      ['Hotel Finisterre', 'Parador de Santiago', 'Hotel Compostela']],
    ['ES-PO', 'Pontevedra', 140, ['#12322E', '#6A9A88', '#E4F0EA'], 'coast',
      ['Vigo', 'Pontevedra', 'Sanxenxo', 'Baiona', 'A Toxa'],
      ['Gran Hotel La Toja', 'Parador de Baiona', 'Hotel Carris Porto Vigo']],
    ['ES-OR', 'Ourense', 50, ['#243028', '#A0B080', '#E8EEDC'], 'nature',
      ['Ourense', 'Verín', 'Ribadavia'],
      ['Hotel Francisco II', 'Parador de Santo Estevo']],
    ['ES-CC', 'Cáceres', 70, ['#2A241C', '#B8A078', '#EFE6D6'], 'heritage',
      ['Cáceres', 'Trujillo', 'Plasencia', 'Guadalupe'],
      ['Hotel NH Collection Palacio de Oquendo', 'Parador de Cáceres', 'Parador de Trujillo']],
    ['ES-BA', 'Badajoz', 65, ['#2A2A22', '#A89870', '#EBE4D6'], 'heritage',
      ['Badajoz', 'Mérida', 'Zafra'],
      ['Hotel Río Badajoz', 'Parador de Mérida', 'Parador de Zafra']],
    ['ES-PM', 'Illes Balears', 360, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast',
      ['Palma', 'Ibiza', 'Mahón', 'Alcúdia', 'Calvià', 'Ciutadella'],
      ['Hotel Nixe Palace', 'Hotel Can Alomar', 'Ushuaïa Ibiza', 'Hotel Port Mahón']],
    ['ES-GC', 'Las Palmas', 220, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast',
      ['Las Palmas de Gran Canaria', 'Maspalomas', 'Puerto del Rosario', 'Corralejo'],
      ['Hotel Santa Catalina', 'Lopesan Costa Meloneras', 'Hotel Riu Palace Maspalomas']],
    ['ES-TF', 'Santa Cruz de Tenerife', 240, ['#123A4A', '#E0A84A', '#FFF0D8'], 'coast',
      ['Santa Cruz de Tenerife', 'Adeje', 'Puerto de la Cruz', 'Los Cristianos', 'La Laguna'],
      ['Hotel Botánico', 'Bahía del Duque', 'Hotel Iberostar Sábila']],
    ['ES-CE', 'Ceuta', 20, ['#1A2A3A', '#C4A35A', '#F0E8D8'], 'coast',
      ['Ceuta'], ['Hotel Ulises', 'Parador de Ceuta']],
    ['ES-ML', 'Melilla', 18, ['#1A2835', '#B89A6A', '#EFE6D6'], 'coast',
      ['Melilla'], ['Hotel Melilla Puerto', 'Parador de Melilla']],
  ]

  for (const [code, name, weight, theme, vibe, cities, realHotels] of spain) {
    list.push({ code, country: 'España', countryCode: 'ES', name, weight, theme, vibe, cities, realHotels })
  }

  // Resto del mundo (provincias / estados / departamentos turísticos)
  const world = [
    // Portugal
    ['PT-11', 'Portugal', 'PT', 'Lisboa', 220, ['#0E2F3A', '#C4A35A', '#F2EBD8'], 'urban', ['Lisboa', 'Cascais', 'Sintra'], ['Four Seasons Ritz Lisbon', 'Hotel Avenida Palace']],
    ['PT-13', 'Portugal', 'PT', 'Porto', 160, ['#1A2430', '#B08D57', '#EFE6D6'], 'urban', ['Porto', 'Vila Nova de Gaia'], ['The Yeatman', 'Pestana Porto']],
    ['PT-08', 'Portugal', 'PT', 'Faro (Algarve)', 200, ['#0B3D4A', '#E0B15A', '#FFF4DC'], 'coast', ['Faro', 'Albufeira', 'Lagos'], ['Vila Vita Parc', 'Pine Cliffs Resort']],
    ['PT-30', 'Portugal', 'PT', 'Madeira', 90, ['#12322E', '#6A9A88', '#E4F0EA'], 'coast', ['Funchal'], ['Reid’s Palace', 'Pestana Casino Park']],
    // France
    ['FR-75', 'Francia', 'FR', 'Paris', 400, ['#111827', '#C4A35A', '#F7F3EA'], 'urban', ['Paris'], ['Hôtel Ritz Paris', 'Le Meurice', 'Hôtel de Crillon']],
    ['FR-06', 'Francia', 'FR', 'Alpes-Maritimes', 220, ['#0B3D55', '#E8C56A', '#FFF6E0'], 'coast', ['Nice', 'Cannes', 'Antibes'], ['Hôtel Negresco', 'Carlton Cannes']],
    ['FR-13', 'Francia', 'FR', 'Bouches-du-Rhône', 120, ['#2A1F18', '#C49A6C', '#F0E4D4'], 'coast', ['Marseille', 'Aix-en-Provence'], ['InterContinental Marseille']],
    ['FR-74', 'Francia', 'FR', 'Haute-Savoie', 100, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'nature', ['Chamonix', 'Annecy'], ['Hôtel Mont-Blanc']],
    ['FR-33', 'Francia', 'FR', 'Gironde', 90, ['#3A1A22', '#8B1E3F', '#F2E4E8'], 'wine', ['Bordeaux'], ['InterContinental Bordeaux']],
    // Italy
    ['IT-RM', 'Italia', 'IT', 'Roma', 350, ['#2A1F18', '#C9A227', '#F3E5C4'], 'heritage', ['Roma', 'Fiumicino'], ['Hotel de Russie', 'Hassler Roma']],
    ['IT-MI', 'Italia', 'IT', 'Milano', 220, ['#111827', '#C4A35A', '#F5F0E6'], 'urban', ['Milano'], ['Hotel Principe di Savoia', 'Bulgari Hotel Milano']],
    ['IT-VE', 'Italia', 'IT', 'Venezia', 180, ['#0E2F3A', '#4A90A4', '#E4F0F4'], 'heritage', ['Venezia', 'Mestre'], ['Hotel Danieli', 'Gritti Palace']],
    ['IT-FI', 'Italia', 'IT', 'Firenze', 150, ['#3A2418', '#C9A05A', '#F0E2CC'], 'heritage', ['Firenze'], ['Hotel Savoy Florence', 'Four Seasons Firenze']],
    ['IT-NA', 'Italia', 'IT', 'Napoli', 140, ['#1A3A4A', '#D4A574', '#F5E6D3'], 'coast', ['Napoli', 'Sorrento', 'Capri'], ['Grand Hotel Vesuvio', 'Hotel Excelsior Napoli']],
    ['IT-PA', 'Italia', 'IT', 'Palermo', 110, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Palermo', 'Cefalù'], ['Grand Hotel Villa Igiea']],
    // UK / Ireland
    ['GB-LND', 'Reino Unido', 'GB', 'Greater London', 380, ['#0D2137', '#C4A35A', '#F7F3EA'], 'urban', ['London'], ['The Savoy', 'Claridge’s', 'The Ritz London']],
    ['GB-EDH', 'Reino Unido', 'GB', 'Edinburgh', 100, ['#1A2430', '#8FA9BC', '#E6EEF3'], 'heritage', ['Edinburgh'], ['The Balmoral', 'Waldorf Astoria Edinburgh']],
    ['GB-MAN', 'Reino Unido', 'GB', 'Greater Manchester', 90, ['#1F2A35', '#B89A6A', '#EFE6D6'], 'urban', ['Manchester'], ['The Midland', 'Kimpton Clocktower']],
    ['IE-D', 'Irlanda', 'IE', 'Dublin', 110, ['#163028', '#7BA88A', '#E4F0E8'], 'urban', ['Dublin'], ['The Shelbourne', 'The Merrion']],
    // Germany / Benelux / Nordics
    ['DE-BE', 'Alemania', 'DE', 'Berlin', 200, ['#111827', '#A0A8B0', '#E8EBE6'], 'urban', ['Berlin'], ['Hotel Adlon Kempinski', 'Das Stue']],
    ['DE-BY', 'Alemania', 'DE', 'Bayern', 160, ['#1E2835', '#B8A070', '#EFE6D6'], 'urban', ['München', 'Nürnberg'], ['Bayerischer Hof', 'Hotel Vier Jahreszeiten']],
    ['DE-HH', 'Alemania', 'DE', 'Hamburg', 90, ['#0E2A3A', '#5A8FA8', '#E2EEF4'], 'urban', ['Hamburg'], ['Fairmont Hotel Vier Jahreszeiten']],
    ['NL-NH', 'Países Bajos', 'NL', 'Noord-Holland', 160, ['#0D2137', '#C4A35A', '#F7F3EA'], 'urban', ['Amsterdam'], ['Hotel de l’Europe', 'Conservatorium Hotel']],
    ['BE-BRU', 'Bélgica', 'BE', 'Bruxelles', 100, ['#1A2430', '#C4A35A', '#F2EBD8'], 'urban', ['Bruxelles'], ['Hotel Amigo', 'Steigenberger Icon Wiltcher’s']],
    ['CH-ZH', 'Suiza', 'CH', 'Zürich', 90, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'urban', ['Zürich'], ['Baur au Lac', 'Dolder Grand']],
    ['CH-GE', 'Suiza', 'CH', 'Genève', 80, ['#0F2F3A', '#4A90A4', '#E4F0F4'], 'urban', ['Genève'], ['Hotel des Bergues', 'Four Seasons Geneva']],
    ['AT-9', 'Austria', 'AT', 'Wien', 120, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Wien'], ['Hotel Sacher', 'Hotel Imperial']],
    ['SE-AB', 'Suecia', 'SE', 'Stockholm', 100, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'urban', ['Stockholm'], ['Grand Hôtel Stockholm', 'Ett Hem']],
    ['NO-03', 'Noruega', 'NO', 'Oslo', 80, ['#0E2F3A', '#6FA8B8', '#E4F2F6'], 'urban', ['Oslo'], ['Hotel Continental', 'The Thief']],
    ['DK-84', 'Dinamarca', 'DK', 'Hovedstaden', 90, ['#111827', '#C4A35A', '#F5F0E6'], 'urban', ['København'], ['Hotel d’Angleterre', 'Nimb Hotel']],
    ['FI-18', 'Finlandia', 'FI', 'Uusimaa', 70, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'urban', ['Helsinki'], ['Hotel Kämp', 'Klaus K']],
    // Greece / Balkans / Turkey
    ['GR-A', 'Grecia', 'GR', 'Attiki (Atenas)', 180, ['#1A3A4A', '#D4A574', '#F5E6D3'], 'heritage', ['Athína', 'Pireas'], ['Hotel Grande Bretagne', 'Hotel King George']],
    ['GR-M', 'Grecia', 'GR', 'Notio Aigaio', 160, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast', ['Mykonos', 'Santorini', 'Rodos'], ['Cavo Tagoo', 'Canaves Oia']],
    ['GR-71', 'Grecia', 'GR', 'Kriti', 120, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Iraklio', 'Chania'], ['Amirandes', 'Blue Palace Crete']],
    ['TR-34', 'Turquía', 'TR', 'İstanbul', 220, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['İstanbul'], ['Four Seasons Sultanahmet', 'Çırağan Palace']],
    ['TR-07', 'Turquía', 'TR', 'Antalya', 200, ['#0B3D55', '#E8C56A', '#FFF6E0'], 'coast', ['Antalya', 'Belek', 'Alanya'], ['Maxx Royal', 'Rixos Premium Belek']],
    ['HR-17', 'Croacia', 'HR', 'Splitsko-dalmatinska', 100, ['#0E3B4F', '#E0B15A', '#F7EEDC'], 'coast', ['Split', 'Hvar'], ['Hotel Park Split', 'Adriana Hvar']],
    // Americas
    ['US-NY', 'EE.UU.', 'US', 'New York', 420, ['#111827', '#C4A35A', '#F7F3EA'], 'urban', ['New York City'], ['The Plaza', 'The St. Regis New York', 'The Carlyle']],
    ['US-CA', 'EE.UU.', 'US', 'California', 380, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast', ['Los Angeles', 'San Francisco', 'San Diego', 'Napa'], ['Hotel Bel-Air', 'Fairmont San Francisco']],
    ['US-FL', 'EE.UU.', 'US', 'Florida', 320, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast', ['Miami', 'Orlando', 'Tampa'], ['Fontainebleau Miami Beach', 'The Breakers Palm Beach']],
    ['US-NV', 'EE.UU.', 'US', 'Nevada', 160, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Las Vegas'], ['Bellagio', 'Wynn Las Vegas']],
    ['US-HI', 'EE.UU.', 'US', 'Hawaii', 140, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Honolulu', 'Maui'], ['The Royal Hawaiian', 'Four Seasons Maui']],
    ['US-IL', 'EE.UU.', 'US', 'Illinois', 100, ['#1A2430', '#A0A8B0', '#E8EBE6'], 'urban', ['Chicago'], ['The Peninsula Chicago', 'Waldorf Astoria Chicago']],
    ['US-TX', 'EE.UU.', 'US', 'Texas', 140, ['#3A2418', '#C9A05A', '#F0E2CC'], 'urban', ['Houston', 'Austin', 'Dallas'], ['Post Oak Hotel', 'Hotel Saint Cecilia']],
    ['CA-ON', 'Canadá', 'CA', 'Ontario', 140, ['#0D2137', '#C4A35A', '#F7F3EA'], 'urban', ['Toronto', 'Ottawa'], ['Fairmont Royal York', 'Shangri-La Toronto']],
    ['CA-QC', 'Canadá', 'CA', 'Québec', 110, ['#1A2430', '#8B1E3F', '#F2E4E8'], 'urban', ['Montréal', 'Québec'], ['Ritz-Carlton Montreal', 'Fairmont Le Château Frontenac']],
    ['CA-BC', 'Canadá', 'CA', 'British Columbia', 100, ['#163028', '#7BA88A', '#E4F0E8'], 'nature', ['Vancouver', 'Victoria'], ['Fairmont Hotel Vancouver']],
    ['MX-DF', 'México', 'MX', 'Ciudad de México', 180, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Ciudad de México'], ['Four Seasons Mexico City', 'Hotel St. Regis Mexico City']],
    ['MX-QR', 'México', 'MX', 'Quintana Roo', 280, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast', ['Cancún', 'Playa del Carmen', 'Tulum'], ['Nizuc Resort', 'Rosewood Mayakoba']],
    ['MX-JAL', 'México', 'MX', 'Jalisco', 120, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast', ['Guadalajara', 'Puerto Vallarta'], ['Four Seasons Tamarindo', 'Casa Velas']],
    ['BR-SP', 'Brasil', 'BR', 'São Paulo', 180, ['#111827', '#C4A35A', '#F5F0E6'], 'urban', ['São Paulo'], ['Palácio Tangará', 'Unique Hotel']],
    ['BR-RJ', 'Brasil', 'BR', 'Rio de Janeiro', 200, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Rio de Janeiro', 'Búzios'], ['Copacabana Palace', 'Fasano Rio']],
    ['AR-C', 'Argentina', 'AR', 'Ciudad de Buenos Aires', 150, ['#1A2430', '#C4A35A', '#F2EBD8'], 'urban', ['Buenos Aires'], ['Alvear Palace', 'Palacio Duhau']],
    ['CL-RM', 'Chile', 'CL', 'Región Metropolitana', 90, ['#1E2835', '#B8A070', '#EFE6D6'], 'urban', ['Santiago'], ['The Ritz-Carlton Santiago', 'Noi Vitacura']],
    ['CO-DC', 'Colombia', 'CO', 'Bogotá D.C.', 90, ['#2A241C', '#B8A078', '#EFE6D6'], 'urban', ['Bogotá'], ['Four Seasons Casa Medina', 'Hotel de la Ópera']],
    ['PE-LIM', 'Perú', 'PE', 'Lima', 100, ['#2A1F18', '#C9A05A', '#F0E2CC'], 'urban', ['Lima', 'Miraflores'], ['Belmond Miraflores Park', 'Hotel B']],
    // Caribbean
    ['DO-32', 'Rep. Dominicana', 'DO', 'La Altagracia (Punta Cana)', 180, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast', ['Punta Cana', 'Bávaro'], ['Eden Roc Cap Cana', 'Tortuga Bay']],
    ['CU-03', 'Cuba', 'CU', 'La Habana', 90, ['#0E3B4F', '#E0B15A', '#F7EEDC'], 'heritage', ['La Habana'], ['Hotel Nacional de Cuba', 'Gran Hotel Manzana']],
    ['JM-01', 'Jamaica', 'JM', 'Kingston / Montego Bay', 80, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Montego Bay', 'Negril'], ['Round Hill Hotel', 'Half Moon']],
    // Middle East / Africa
    ['AE-DU', 'EAU', 'AE', 'Dubai', 280, ['#111827', '#C4A35A', '#F7F3EA'], 'urban', ['Dubai'], ['Burj Al Arab', 'Atlantis The Palm', 'Armani Hotel Dubai']],
    ['AE-AZ', 'EAU', 'AE', 'Abu Dhabi', 140, ['#0D2137', '#C9A227', '#F3E5C4'], 'urban', ['Abu Dhabi'], ['Emirates Palace', 'The St. Regis Saadiyat']],
    ['QA-DA', 'Catar', 'QA', 'Ad-Dawhah', 100, ['#1A2430', '#8B1E3F', '#F2E4E8'], 'urban', ['Doha'], ['Mandarin Oriental Doha', 'Four Seasons Doha']],
    ['SA-01', 'Arabia Saudí', 'SA', 'Riyadh', 100, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Riyadh'], ['The Ritz-Carlton Riyadh', 'Four Seasons Riyadh']],
    ['EG-C', 'Egipto', 'EG', 'Al Qahirah (El Cairo)', 120, ['#3A2418', '#C9A05A', '#F0E2CC'], 'heritage', ['El Cairo', 'Giza'], ['Four Seasons Nile Plaza', 'Marriott Mena House']],
    ['EG-BA', 'Egipto', 'EG', 'Al Bahr al Ahmar', 140, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast', ['Hurghada', 'Sharm el-Sheikh'], ['Four Seasons Sharm', 'Steigenberger Pure Life']],
    ['MA-07', 'Marruecos', 'MA', 'Marrakech-Safi', 140, ['#3A1A22', '#C9A227', '#F3E5C4'], 'heritage', ['Marrakech'], ['La Mamounia', 'Royal Mansour']],
    ['MA-06', 'Marruecos', 'MA', 'Casablanca-Settat', 80, ['#0D2137', '#C4A35A', '#F2EBD8'], 'urban', ['Casablanca'], ['Four Seasons Casablanca']],
    ['ZA-WC', 'Sudáfrica', 'ZA', 'Western Cape', 140, ['#163028', '#7BA88A', '#E4F0E8'], 'coast', ['Cape Town', 'Stellenbosch'], ['One&Only Cape Town', 'Ellerman House']],
    ['KE-30', 'Kenia', 'KE', 'Nairobi City', 70, ['#2A3320', '#B7A078', '#EDE4D4'], 'nature', ['Nairobi'], ['Giraffe Manor', 'Hemingways Nairobi']],
    ['SC-01', 'Seychelles', 'SC', 'Mahé', 50, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Victoria', 'Beau Vallon'], ['Four Seasons Seychelles', 'North Island']],
    // Asia / Oceania
    ['JP-13', 'Japón', 'JP', 'Tokio', 300, ['#111827', '#C4A35A', '#F7F3EA'], 'urban', ['Tokio', 'Yokohama'], ['Aman Tokyo', 'The Peninsula Tokyo', 'Hoshinoya Tokyo']],
    ['JP-27', 'Japón', 'JP', 'Osaka', 120, ['#1A2430', '#B08D57', '#EFE6D6'], 'urban', ['Osaka', 'Kyoto'], ['The Ritz-Carlton Osaka', 'Four Seasons Kyoto']],
    ['JP-47', 'Japón', 'JP', 'Okinawa', 90, ['#0B3D55', '#E8C56A', '#FFF6E0'], 'coast', ['Naha', 'Onna'], ['Halekulani Okinawa', 'Busena Terrace']],
    ['CN-SH', 'China', 'CN', 'Shanghai', 260, ['#0D2137', '#C4A35A', '#F5F0E6'], 'urban', ['Shanghai'], ['The Peninsula Shanghai', 'Fairmont Peace Hotel']],
    ['CN-BJ', 'China', 'CN', 'Beijing', 220, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Beijing'], ['The Peninsula Beijing', 'Aman Summer Palace']],
    ['CN-GD', 'China', 'CN', 'Guangdong', 160, ['#1A2430', '#A0A8B0', '#E8EBE6'], 'urban', ['Guangzhou', 'Shenzhen'], ['The Ritz-Carlton Guangzhou']],
    ['HK-HK', 'Hong Kong', 'HK', 'Hong Kong', 160, ['#111827', '#C4A35A', '#F7F3EA'], 'urban', ['Hong Kong'], ['The Peninsula Hong Kong', 'Mandarin Oriental HK']],
    ['SG-01', 'Singapur', 'SG', 'Singapore', 160, ['#0D2137', '#C4A35A', '#F2EBD8'], 'urban', ['Singapore'], ['Raffles Singapore', 'Marina Bay Sands', 'Capella Singapore']],
    ['KR-11', 'Corea del Sur', 'KR', 'Seoul', 160, ['#111827', '#A0A8B0', '#E8EBE6'], 'urban', ['Seoul'], ['The Shilla Seoul', 'Four Seasons Seoul']],
    ['TH-10', 'Tailandia', 'TH', 'Bangkok', 180, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['Bangkok'], ['Mandarin Oriental Bangkok', 'Capella Bangkok']],
    ['TH-83', 'Tailandia', 'TH', 'Phuket', 160, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast', ['Phuket', 'Patong', 'Kamala'], ['Amanpuri', 'Trisara']],
    ['ID-BA', 'Indonesia', 'ID', 'Bali', 200, ['#0B3D4A', '#C4A35A', '#F2E6C8'], 'coast', ['Denpasar', 'Ubud', 'Seminyak'], ['Four Seasons Sayan', 'The Mulia']],
    ['MY-14', 'Malasia', 'MY', 'Kuala Lumpur', 110, ['#0D2137', '#C4A35A', '#F5F0E6'], 'urban', ['Kuala Lumpur'], ['The Ritz-Carlton KL', 'Mandarin Oriental KL']],
    ['VN-HN', 'Vietnam', 'VN', 'Hà Nội', 90, ['#1A3A3A', '#A8C4B0', '#EAF2EC'], 'urban', ['Hà Nội'], ['Sofitel Legend Metropole', 'Capella Hanoi']],
    ['VN-SG', 'Vietnam', 'VN', 'Hồ Chí Minh', 100, ['#2A1F18', '#C9A05A', '#F0E2CC'], 'urban', ['Hồ Chí Minh'], ['Park Hyatt Saigon', 'Hotel des Arts']],
    ['IN-DL', 'India', 'IN', 'Delhi', 140, ['#2A1F18', '#C9A227', '#F3E5C4'], 'urban', ['New Delhi'], ['The Oberoi New Delhi', 'Taj Palace']],
    ['IN-MH', 'India', 'IN', 'Maharashtra', 150, ['#111827', '#C4A35A', '#F5F0E6'], 'urban', ['Mumbai', 'Pune'], ['Taj Mahal Palace', 'The Oberoi Mumbai']],
    ['IN-GA', 'India', 'IN', 'Goa', 100, ['#0B3D55', '#F0C14A', '#FFF3D6'], 'coast', ['Panaji', 'Calangute'], ['Taj Fort Aguada', 'W Goa']],
    ['MV-00', 'Maldivas', 'MV', 'Malé / Atolones', 120, ['#0A3A4A', '#E8C56A', '#FFF6E0'], 'coast', ['Malé', 'North Malé Atoll'], ['Soneva Fushi', 'One&Only Reethi Rah']],
    ['AU-NSW', 'Australia', 'AU', 'New South Wales', 180, ['#0E2A3A', '#5A8FA8', '#E2EEF4'], 'coast', ['Sydney', 'Byron Bay'], ['Park Hyatt Sydney', 'Capella Sydney']],
    ['AU-VIC', 'Australia', 'AU', 'Victoria', 120, ['#1A2430', '#B08D57', '#EFE6D6'], 'urban', ['Melbourne'], ['Hotel Windsor', 'Crown Towers Melbourne']],
    ['AU-QLD', 'Australia', 'AU', 'Queensland', 140, ['#0B3D55', '#E8C56A', '#FFF6E0'], 'coast', ['Brisbane', 'Gold Coast', 'Cairns'], ['Sheraton Grand Mirage', 'QUALIA']],
    ['NZ-AUK', 'Nueva Zelanda', 'NZ', 'Auckland', 70, ['#163028', '#7BA88A', '#E4F0E8'], 'urban', ['Auckland'], ['Hotel Britomart', 'Park Hyatt Auckland']],
    ['NZ-OTC', 'Nueva Zelanda', 'NZ', 'Otago', 60, ['#1E2F3A', '#8FA9BC', '#E6EEF3'], 'nature', ['Queenstown', 'Dunedin'], ['Eichardt’s Private Hotel', 'Blanket Bay']],
  ]

  for (const [code, country, countryCode, name, weight, theme, vibe, cities, realHotels] of world) {
    list.push({ code, country, countryCode, name, weight, theme, vibe, cities, realHotels })
  }

  // Relleno de provincias adicionales para llegar a ~400 PDF y repartir el resto de cupos
  const fillers = [
    ['IT-TO', 'Italia', 'IT', 'Torino', 70, 'urban', ['Torino']],
    ['IT-BO', 'Italia', 'IT', 'Bologna', 60, 'urban', ['Bologna']],
    ['FR-69', 'Francia', 'FR', 'Rhône', 70, 'urban', ['Lyon']],
    ['FR-31', 'Francia', 'FR', 'Haute-Garonne', 55, 'urban', ['Toulouse']],
    ['DE-NW', 'Alemania', 'DE', 'Nordrhein-Westfalen', 120, 'urban', ['Köln', 'Düsseldorf']],
    ['PL-MZ', 'Polonia', 'PL', 'Mazowieckie', 90, 'urban', ['Warszawa']],
    ['CZ-10', 'Chequia', 'CZ', 'Praha', 90, 'urban', ['Praha']],
    ['HU-BU', 'Hungría', 'HU', 'Budapest', 90, 'urban', ['Budapest']],
    ['PT-02', 'Portugal', 'PT', 'Beja / Alentejo', 40, 'nature', ['Évora', 'Beja']],
    ['GR-54', 'Grecia', 'GR', 'Thessaloniki', 70, 'urban', ['Thessaloniki']],
    ['US-MA', 'EE.UU.', 'US', 'Massachusetts', 80, 'urban', ['Boston']],
    ['US-WA', 'EE.UU.', 'US', 'Washington', 70, 'urban', ['Seattle']],
    ['US-CO', 'EE.UU.', 'US', 'Colorado', 70, 'nature', ['Denver', 'Aspen']],
    ['US-AZ', 'EE.UU.', 'US', 'Arizona', 70, 'nature', ['Phoenix', 'Scottsdale']],
    ['BR-BA', 'Brasil', 'BR', 'Bahia', 80, 'coast', ['Salvador']],
    ['BR-SC', 'Brasil', 'BR', 'Santa Catarina', 60, 'coast', ['Florianópolis']],
    ['AR-Z', 'Argentina', 'AR', 'Santa Cruz / Patagonia', 40, 'nature', ['El Calafate']],
    ['CL-AP', 'Chile', 'CL', 'Arica y Parinacota', 25, 'nature', ['Arica']],
    ['PE-CUS', 'Perú', 'PE', 'Cusco', 70, 'heritage', ['Cusco', 'Aguas Calientes']],
    ['CR-SJ', 'Costa Rica', 'CR', 'San José / Puntarenas', 70, 'nature', ['San José', 'Manuel Antonio']],
    ['PA-8', 'Panamá', 'PA', 'Panamá', 60, 'urban', ['Ciudad de Panamá']],
    ['TN-11', 'Túnez', 'TN', 'Tunis', 50, 'coast', ['Tunis', 'Hammamet']],
    ['TZ-02', 'Tanzania', 'TZ', 'Arusha / Zanzíbar', 55, 'nature', ['Arusha', 'Zanzibar']],
    ['MU-PL', 'Mauricio', 'MU', 'Port Louis / Grand Port', 45, 'coast', ['Port Louis']],
    ['PH-00', 'Filipinas', 'PH', 'Metro Manila / Cebu', 90, 'coast', ['Manila', 'Cebu', 'Boracay']],
    ['KH-12', 'Camboya', 'KH', 'Phnom Penh / Siem Reap', 55, 'heritage', ['Siem Reap']],
    ['LK-1', 'Sri Lanka', 'LK', 'Western / Southern', 55, 'coast', ['Colombo', 'Galle']],
    ['NP-BA', 'Nepal', 'NP', 'Bagmati', 40, 'nature', ['Kathmandu']],
    ['BT-11', 'Bután', 'BT', 'Thimphu', 20, 'nature', ['Thimphu']],
    ['FJ-C', 'Fiyi', 'FJ', 'Central / Western', 35, 'coast', ['Nadi', 'Suva']],
    ['PF-U', 'Polinesia Francesa', 'PF', 'Îles du Vent', 35, 'coast', ['Papeete', 'Bora Bora']],
  ]

  const fillerThemes = {
    urban: ['#111827', '#C4A35A', '#F5F0E6'],
    coast: ['#0B3D4A', '#C4A35A', '#F2E6C8'],
    nature: ['#163028', '#7BA88A', '#E4F0E8'],
    heritage: ['#2A1F18', '#C9A227', '#F3E5C4'],
  }

  for (const row of fillers) {
    const [code, country, countryCode, name, weight, vibe, cities] = row
    list.push({
      code,
      country,
      countryCode,
      name,
      weight,
      theme: fillerThemes[vibe] || fillerThemes.urban,
      vibe,
      cities,
      realHotels: cities.map((c) => `Hotel Central ${c}`),
    })
  }

  return list
}

function allocateCounts(provinces, total) {
  const sum = provinces.reduce((s, p) => s + p.weight, 0)
  const raw = provinces.map((p) => (p.weight / sum) * total)
  const floors = raw.map((x) => Math.floor(x))
  let left = total - floors.reduce((a, b) => a + b, 0)
  const frac = raw.map((x, i) => ({ i, f: x - floors[i] })).sort((a, b) => b.f - a.f)
  const counts = [...floors]
  for (let k = 0; k < left; k++) counts[frac[k % frac.length].i]++
  return counts
}

function realHotelName(prov, idx, rng) {
  const base = prov.realHotels[idx % prov.realHotels.length]
  if (idx < prov.realHotels.length) return base
  const city = pick(rng, prov.cities)
  const prefixes = ['Hotel', 'Hostal', 'Resort', 'Palace', 'Grand Hotel', 'Boutique Hotel', 'Villa', 'Parador', 'Inn']
  const suffixes = ['Plaza', 'Park', 'Garden', 'Beach', 'Center', 'Royal', 'Palace', 'View', 'Suites', 'Collection', 'Bay', 'Hills']
  // Variantes realistas del mismo patrón de nombre local
  return `${pick(rng, prefixes)} ${city} ${pick(rng, suffixes)} ${Math.floor(idx / prov.realHotels.length) + 1}`
}

function orbisHotelName(sub, city, order) {
  const short = sub.name.replace('Orbis ', '')
  return `${short} ${city} #${order}`
}

function buildHotel(order, prov, localIdx, rng) {
  const sub = SUBS[(order + localIdx) % SUBS.length]
  const city = pick(rng, prov.cities)
  const stars = sub.min + Math.floor(rng() * (sub.max - sub.min + 1))
  const rooms = 40 + Math.floor(rng() * 260) + (stars >= 5 ? 40 : 0)
  const target = pick(rng, sub.targets)
  const vibeBoard =
    prov.vibe === 'coast'
      ? ['desayuno', 'media', 'completa', 'ti', 'ti_premium']
      : prov.vibe === 'urban'
        ? ['solo', 'desayuno', 'media']
        : ['solo', 'desayuno', 'media', 'completa']

  let availableRegimes = pickN(rng, BOARDS.map((b) => b.id), 3 + Math.floor(rng() * 4))
  // Asegurar que haya regímenes coherentes con el sitio
  for (const b of vibeBoard.slice(0, 2)) {
    if (!availableRegimes.includes(b)) availableRegimes.push(b)
  }
  availableRegimes = [...new Set(availableRegimes)]
  const preferred = availableRegimes.filter((b) => vibeBoard.includes(b))
  const boardRegime = pick(rng, preferred.length ? preferred : availableRegimes)

  const serviceCount = 4 + Math.floor(rng() * 8)
  const services = pickN(rng, SERVICES, serviceCount)
  if (boardRegime.startsWith('ti') && !services.includes('all_inclusive')) services.push('all_inclusive')
  if (prov.vibe === 'coast' && rng() > 0.55 && !services.includes('piscina')) services.push('piscina')

  const staffLevel = stars >= 5 ? pick(rng, ['premium', 'lujo']) : pick(rng, STAFF)
  const roomMix = target === 'familiar' ? 'familiar' : stars >= 5 ? pick(rng, ['mixto', 'suites']) : pick(rng, MIX)
  const buildQuality = stars >= 5 ? pick(rng, ['alto', 'lujo']) : pick(rng, QUALITY)
  const greenLevel = pick(rng, GREEN)
  const designFocus = prov.vibe === 'coast' ? pick(rng, ['vistas', 'fiesta', 'familia']) : pick(rng, FOCUS)
  const securityLevel = stars >= 4 ? pick(rng, ['medio', 'alto']) : pick(rng, SECURITY)
  const techLevel = pick(rng, TECH)

  return {
    order,
    realHotel: realHotelName(prov, localIdx, rng),
    name: orbisHotelName(sub, city, order),
    subsidiaryId: sub.id,
    subsidiaryName: sub.name,
    country: prov.country,
    countryCode: prov.countryCode,
    province: prov.name,
    provinceCode: prov.code,
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
    seaViewShare: prov.vibe === 'coast' ? 20 + Math.floor(rng() * 70) : Math.floor(rng() * 15),
    loyaltyProgram: rng() > 0.55,
    quietHours: designFocus === 'silencio' || rng() > 0.7,
    bikeRental: prov.vibe === 'nature' || rng() > 0.75,
    shuttleCity: rng() > 0.6,
    boardRegime,
    availableRegimes,
    services,
    imageKey: `${['coast', 'urban', 'nature', 'luxury', 'family', 'adventure'][order % 6]}:${['day', 'dusk', 'night', 'aerial', 'sunny'][order % 5]}`,
  }
}

function boardLabel(id) {
  return BOARDS.find((b) => b.id === id)?.label ?? id
}

function writeProvincePdf(prov, hotels, filePath) {
  return new Promise((resolve, reject) => {
    const [c1, c2, c3] = prov.theme
    const doc = new PDFDocument({ size: 'A4', margin: 36, info: { Title: `Orbis · ${prov.name}`, Author: 'Orbis Hotels Group' } })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const header = () => {
      doc.rect(0, 0, doc.page.width, 64).fill(c1)
      doc.fillColor(c3).font('Helvetica-Bold').fontSize(16)
        .text('ORBIS HOTELS GROUP', 36, 16, { continued: false })
      doc.font('Helvetica').fontSize(10).fillColor(c2)
        .text(`Plan de construcción · ${prov.country} · ${prov.name}`, 36, 38)
      doc.fillColor('#222')
    }

    header()
    doc.moveDown(2.2)
    doc.font('Helvetica-Bold').fontSize(18).fillColor(c1)
      .text(`${prov.name}`, { align: 'left' })
    doc.font('Helvetica').fontSize(10).fillColor('#444')
      .text(`País: ${prov.country} (${prov.countryCode}) · Código: ${prov.code}`)
      .text(`Hoteles en esta provincia: ${hotels.length}`)
      .text(`Orden global: del #${hotels[0].order} al #${hotels[hotels.length - 1].order}`)
      .text('Sigue el número de orden en el simulador. Cada ficha tiene todos los parámetros del constructor.')
    doc.moveDown(0.6)
    doc.rect(36, doc.y, doc.page.width - 72, 3).fill(c2)
    doc.moveDown(1)

    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      if (doc.y > doc.page.height - 220) {
        doc.addPage()
        header()
        doc.moveDown(2.2)
      }

      const top = doc.y
      doc.roundedRect(36, top, doc.page.width - 72, 200, 8).lineWidth(1).strokeColor(c2).stroke()
      doc.rect(36, top, 8, 200).fill(c1)

      doc.fillColor(c1).font('Helvetica-Bold').fontSize(12)
        .text(`#${h.order}  ${h.name}`, 52, top + 10, { width: doc.page.width - 100 })
      doc.font('Helvetica').fontSize(9).fillColor('#333')
        .text(`Sustituye a: ${h.realHotel}`, 52, top + 28, { width: doc.page.width - 100 })
        .text(`Marca: ${h.subsidiaryName}  ·  Ciudad: ${h.city}  ·  ${h.stars}★  ·  ${h.rooms} hab.`, 52, top + 42)

      const col1 = [
        `Clientes: ${h.target}`,
        `Personal: ${h.staffLevel}`,
        `Habitaciones tipo: ${h.roomMix}`,
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
        `Oferta apertura: ${h.openingPromoDays} días`,
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
        `Régimen principal: ${boardLabel(h.boardRegime)}`,
        `Foto: ${h.imageKey}`,
        `Provincia: ${h.province}`,
        `País: ${h.country}`,
        `Orden local: ${i + 1}/${hotels.length}`,
      ]

      doc.fontSize(8).fillColor('#222')
      let y = top + 58
      for (let r = 0; r < col1.length; r++) {
        doc.text(col1[r], 52, y, { width: 160, lineBreak: false })
        doc.text(col2[r], 220, y, { width: 160, lineBreak: false })
        doc.text(col3[r], 390, y, { width: 170, lineBreak: false })
        y += 11
      }

      doc.font('Helvetica-Bold').fontSize(8).fillColor(c1)
        .text('Regímenes disponibles:', 52, y + 4)
      doc.font('Helvetica').fillColor('#222')
        .text(h.availableRegimes.map(boardLabel).join(' · '), 52, y + 15, { width: doc.page.width - 100 })

      doc.font('Helvetica-Bold').fillColor(c1)
        .text('Servicios:', 52, y + 30)
      doc.font('Helvetica').fillColor('#222')
        .text(h.services.join(', '), 52, y + 41, { width: doc.page.width - 100 })

      doc.y = top + 208
      doc.moveDown(0.35)
    }

    // pie final
    doc.fontSize(8).fillColor('#666')
      .text(`Orbis Hotels Group · Plan de construcción · ${prov.code} · Generado para construir a mano en el simulador`, 36, doc.page.height - 28, {
        width: doc.page.width - 72,
        align: 'center',
      })

    doc.end()
  })
}

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

async function main() {
  fs.mkdirSync(OUT_PDF, { recursive: true })
  fs.mkdirSync(OUT_IDX, { recursive: true })
  // limpia salidas previas
  for (const f of fs.readdirSync(OUT_PDF)) fs.unlinkSync(path.join(OUT_PDF, f))
  for (const f of fs.readdirSync(OUT_IDX)) fs.unlinkSync(path.join(OUT_IDX, f))

  const provinces = buildProvinces()
  const counts = allocateCounts(provinces, TOTAL)
  let order = 1
  const master = []
  const t0 = Date.now()

  console.log(`Provincias: ${provinces.length} · Hoteles: ${TOTAL}`)

  for (let pi = 0; pi < provinces.length; pi++) {
    const prov = provinces[pi]
    const n = counts[pi]
    const rng = mulberry32(1000 + pi * 997 + n)
    const hotels = []
    for (let i = 0; i < n; i++) {
      hotels.push(buildHotel(order, prov, i, rng))
      order++
    }

    const safe = `${String(pi + 1).padStart(3, '0')}_${slugify(prov.code)}_${slugify(prov.name)}`
    const pdfName = `${safe}.pdf`
    const pdfPath = path.join(OUT_PDF, pdfName)
    await writeProvincePdf(prov, hotels, pdfPath)

    const idx = {
      orderStart: hotels[0].order,
      orderEnd: hotels[hotels.length - 1].order,
      province: prov.name,
      country: prov.country,
      code: prov.code,
      count: n,
      pdf: `pdfs/${pdfName}`,
    }
    master.push(idx)
    fs.writeFileSync(path.join(OUT_IDX, `${safe}.json`), JSON.stringify({ ...idx, hotels }, null, 0))

    if ((pi + 1) % 10 === 0 || pi === 0 || pi === provinces.length - 1) {
      console.log(`[${pi + 1}/${provinces.length}] ${prov.name}: ${n} hoteles → ${pdfName}`)
    }
  }

  fs.writeFileSync(path.join(ROOT, 'plan-construccion', 'INDEX.json'), JSON.stringify({
    totalHotels: TOTAL,
    provinces: master.length,
    generatedAt: new Date().toISOString(),
    startProvince: master[0],
    items: master,
  }, null, 2))

  const md = [
    '# Plan de construcción Orbis (50.000 hoteles)',
    '',
    'Orden global continuo empezando por **Málaga (España)**.',
    '',
    'Cada PDF = una provincia. En cada hotel: hotel real al que sustituye, marca Orbis y **todos** los parámetros del constructor (incluidos regímenes disponibles).',
    '',
    `| # | Provincia | País | Hoteles | Orden | PDF |`,
    `|---:|---|---|---:|---|---|`,
    ...master.map((m, i) => `| ${i + 1} | ${m.province} | ${m.country} | ${m.count} | #${m.orderStart}–#${m.orderEnd} | \`${m.pdf}\` |`),
    '',
    `Generado en ${((Date.now() - t0) / 1000).toFixed(1)}s.`,
  ].join('\n')
  fs.writeFileSync(path.join(ROOT, 'plan-construccion', 'README.md'), md)

  console.log(`Listo: ${master.length} PDFs · ${TOTAL} hoteles · ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log(`Salida: plan-construccion/pdfs/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
