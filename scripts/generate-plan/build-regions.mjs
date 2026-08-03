#!/usr/bin/env node
/**
 * Country-first allocation of 10,000 hotels, then regional split
 * only when a country has enough hotels to justify it.
 * No PDFs — writes plan-construccion/REGIONES.{json,md}
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'plan-construccion');
const TOTAL = 10000;

/** @typedef {{ id: string, name: string, lat: number, lng: number, weight?: number }} RegDef */

/**
 * Country hotel weights ≈ tourism arrivals + hotel stock (relative).
 * Sum does not need to be exact — we normalize to TOTAL.
 */
const COUNTRIES = [
  // code, name, weight, regions[]
  // ——— Top markets ———
  ['US', 'Estados Unidos', 95, [
    ['nueva-york', 'Nueva York', 40.71, -74.01, 12],
    ['los-angeles', 'Los Ángeles', 34.05, -118.24, 10],
    ['miami', 'Miami / Sur de Florida', 25.76, -80.19, 9],
    ['las-vegas', 'Las Vegas', 36.17, -115.14, 8],
    ['orlando', 'Orlando', 28.54, -81.38, 7],
    ['san-francisco', 'San Francisco / Bahía', 37.77, -122.42, 6],
    ['chicago', 'Chicago', 41.88, -87.63, 5],
    ['hawaii', 'Hawái', 21.31, -157.86, 6],
    ['washington', 'Washington D.C. / Virginia', 38.91, -77.04, 4],
    ['boston', 'Boston / Nueva Inglaterra', 42.36, -71.06, 4],
    ['seattle', 'Seattle / Pacífico Noroeste', 47.61, -122.33, 4],
    ['san-diego', 'San Diego', 32.72, -117.16, 3],
    ['nueva-orleans', 'Nueva Orleans', 29.95, -90.07, 3],
    ['denver', 'Denver / Rocosas', 39.74, -104.99, 3],
    ['phoenix', 'Phoenix / Arizona', 33.45, -112.07, 3],
    ['texas', 'Texas (Houston / Dallas / Austin)', 29.76, -95.37, 5],
    ['atlanta', 'Atlanta / Sureste', 33.75, -84.39, 3],
    ['nashville', 'Nashville / Tennessee', 36.16, -86.78, 2],
    ['napa', 'Napa / California vino', 38.50, -122.29, 2],
    ['alaska', 'Alaska', 61.22, -149.90, 2],
    ['key-west', 'Keys / Key West', 24.56, -81.78, 2],
    ['grand-canyon', 'Grand Canyon / Utah parques', 36.11, -112.11, 2],
    ['charleston', 'Charleston / Carolina', 32.78, -79.93, 2],
    ['aspen', 'Aspen / Colorado esquí', 39.19, -106.82, 2],
  ]],
  ['CN', 'China', 55, [
    ['shanghai', 'Shanghái', 31.23, 121.47, 10],
    ['beijing', 'Pekín', 39.90, 116.41, 9],
    ['hong-kong', 'Hong Kong', 22.32, 114.17, 7],
    ['guangzhou', 'Cantón / Guangdong', 23.13, 113.26, 5],
    ['chengdu', 'Chengdú / Sichuan', 30.57, 104.07, 4],
    ['xian', "Xi'an", 34.34, 108.94, 3],
    ['hangzhou', 'Hangzhou', 30.27, 120.16, 3],
    ['sanya', 'Sanya / Hainan', 18.25, 109.50, 4],
    ['shenzhen', 'Shenzhen', 22.54, 114.06, 3],
    ['macao', 'Macao', 22.20, 113.54, 3],
    ['guilin', 'Guilin / Guangxi', 25.27, 110.29, 2],
    ['qingdao', 'Qingdao', 36.07, 120.38, 2],
  ]],
  ['FR', 'Francia', 45, [
    ['paris', 'París / Île-de-France', 48.86, 2.35, 14],
    ['cote-azur', 'Costa Azul (Niza / Cannes)', 43.70, 7.27, 10],
    ['provence', 'Provenza', 43.95, 4.81, 6],
    ['alpes-fr', 'Alpes franceses (Chamonix / Annecy)', 45.92, 6.87, 5],
    ['bordeaux', 'Burdeos / Aquitania', 44.84, -0.58, 4],
    ['lyon', 'Lyon / Auvernia-Ródano', 45.76, 4.84, 4],
    ['normandie', 'Normandía', 49.18, -0.37, 3],
    ['bretagne', 'Bretaña', 48.39, -4.49, 3],
    ['loire', 'Valle del Loira', 47.39, 0.69, 3],
    ['alsace', 'Alsacia', 48.58, 7.75, 3],
    ['corsica', 'Córcega', 41.92, 8.74, 3],
    ['biarritz', 'Biarritz / País Vasco francés', 43.48, -1.56, 3],
    ['marseille', 'Marsella / Costa azul occidental', 43.30, 5.37, 2],
    ['toulouse', 'Toulouse / Occitania', 43.60, 1.44, 2],
  ]],
  ['ES', 'España', 42, [
    // Empieza por Málaga / Costa del Sol
    ['malaga-costa-sol', 'Costa del Sol (Málaga)', 36.62, -4.50, 10],
    ['malaga-capital', 'Málaga capital', 36.72, -4.42, 6],
    ['marbella', 'Marbella / Estepona', 36.51, -4.88, 6],
    ['barcelona', 'Barcelona / área metropolitana', 41.39, 2.17, 9],
    ['costa-brava', 'Costa Brava', 41.82, 3.08, 5],
    ['costa-dourada', 'Costa Daurada', 41.12, 1.25, 4],
    ['madrid', 'Madrid capital', 40.42, -3.70, 8],
    ['valencia', 'Valencia capital', 39.47, -0.38, 5],
    ['benidorm', 'Benidorm / Costa Blanca', 38.54, -0.13, 6],
    ['alicante', 'Alicante', 38.35, -0.48, 3],
    ['sevilla', 'Sevilla', 37.39, -5.99, 4],
    ['granada', 'Granada / Sierra Nevada', 37.18, -3.60, 4],
    ['cadiz-costa', 'Costa de la Luz (Cádiz)', 36.53, -6.29, 3],
    ['mallorca', 'Mallorca', 39.57, 2.65, 8],
    ['ibiza', 'Ibiza / Formentera', 38.91, 1.43, 4],
    ['menorca', 'Menorca', 39.89, 4.26, 2],
    ['tenerife', 'Tenerife', 28.05, -16.72, 6],
    ['gran-canaria', 'Gran Canaria', 28.12, -15.43, 5],
    ['lanzarote', 'Lanzarote', 28.96, -13.55, 3],
    ['fuerteventura', 'Fuerteventura', 28.36, -14.02, 2],
    ['galicia', 'Galicia (Santiago / Rías)', 42.88, -8.54, 3],
    ['pais-vasco', 'País Vasco (Bilbao / San Sebastián)', 43.26, -2.93, 3],
    ['asturias-cantabria', 'Asturias / Cantabria', 43.46, -3.80, 2],
    ['murcia', 'Murcia / Costa Cálida', 37.64, -0.70, 2],
    ['cordoba', 'Córdoba', 37.89, -4.78, 2],
    ['castilla-leon', 'Castilla y León (Salamanca / Segovia)', 40.97, -5.66, 2],
    ['aragon-navarra', 'Aragón / Navarra / La Rioja', 41.65, -0.88, 2],
    ['extremadura', 'Extremadura', 39.48, -6.37, 1],
  ]],
  ['IT', 'Italia', 40, [
    ['roma', 'Roma / Lacio', 41.90, 12.50, 12],
    ['milan', 'Milán / Lombardía', 45.46, 9.19, 8],
    ['venecia', 'Venecia / Véneto', 45.44, 12.32, 7],
    ['florencia', 'Florencia / Toscana', 43.77, 11.26, 7],
    ['amalfi', 'Costa Amalfitana / Nápoles', 40.63, 14.60, 6],
    ['sicilia', 'Sicilia', 37.50, 14.00, 5],
    ['sardinia', 'Cerdeña', 39.22, 9.12, 4],
    ['lago-garda', 'Lagos del norte (Garda / Como)', 45.60, 10.70, 4],
    ['riviera-ligur', 'Riviera Ligur / Cinque Terre', 44.41, 8.93, 3],
    ['puglia', 'Puglia', 41.12, 16.87, 3],
    ['turin', 'Turín / Piamonte', 45.07, 7.69, 2],
    ['bolonia', 'Bolonia / Emilia-Romaña', 44.49, 11.34, 2],
    ['rimini', 'Rímini / Adriático', 44.06, 12.57, 2],
  ]],
  ['DE', 'Alemania', 32, [
    ['berlin', 'Berlín', 52.52, 13.40, 9],
    ['munich', 'Múnich / Baviera', 48.14, 11.58, 8],
    ['hamburg', 'Hamburgo', 53.55, 9.99, 5],
    ['frankfurt', 'Fráncfort / Rin-Meno', 50.11, 8.68, 4],
    ['colonia', 'Colonia / Rin-Ruhr', 50.94, 6.96, 4],
    ['alpes-baviera', 'Alpes bávaros', 47.57, 10.70, 3],
    ['dresde', 'Dresde / Sajonia', 51.05, 13.74, 2],
    ['stuttgart', 'Stuttgart / Baden-Württemberg', 48.78, 9.18, 2],
    ['selva-negra', 'Selva Negra', 48.00, 8.20, 2],
    ['heidelberg', 'Heidelberg / Rin', 49.40, 8.67, 2],
  ]],
  ['GB', 'Reino Unido', 30, [
    ['london', 'Londres', 51.51, -0.13, 14],
    ['edinburgh', 'Edimburgo / Escocia', 55.95, -3.19, 5],
    ['manchester', 'Mánchester / Norte de Inglaterra', 53.48, -2.24, 4],
    ['bath', 'Bath / Cotswolds', 51.38, -2.36, 3],
    ['cornwall', 'Cornualles / Devon', 50.27, -5.05, 3],
    ['lake-district', 'Lake District', 54.46, -3.09, 2],
    ['glasgow', 'Glasgow / Highlands', 55.86, -4.25, 2],
    ['brighton', 'Brighton / Costa sur', 50.82, -0.14, 2],
    ['cardiff', 'Cardiff / Gales', 51.48, -3.18, 2],
    ['belfast', 'Belfast / Irlanda del Norte', 54.60, -5.93, 2],
  ]],
  ['JP', 'Japón', 28, [
    ['tokio', 'Tokio', 35.68, 139.69, 12],
    ['osaka', 'Osaka / Kansai', 34.69, 135.50, 7],
    ['kioto', 'Kioto / Nara', 35.01, 135.77, 6],
    ['hokkaido', 'Hokkaido (Sapporo)', 43.06, 141.35, 4],
    ['okinawa', 'Okinawa', 26.21, 127.68, 4],
    ['hiroshima', 'Hiroshima', 34.39, 132.46, 2],
    ['fukuoka', 'Fukuoka / Kyushu', 33.59, 130.40, 2],
    ['nagoya', 'Nagoya / Chubu', 35.18, 136.91, 2],
  ]],
  ['MX', 'México', 25, [
    ['cancun', 'Cancún / Riviera Maya', 21.16, -86.85, 12],
    ['ciudad-mexico', 'Ciudad de México', 19.43, -99.13, 7],
    ['los-cabos', 'Los Cabos', 22.89, -109.91, 5],
    ['puerto-vallarta', 'Puerto Vallarta / Riviera Nayarit', 20.65, -105.23, 4],
    ['guadalajara', 'Guadalajara / Jalisco', 20.66, -103.35, 3],
    ['oaxaca', 'Oaxaca', 17.07, -96.72, 2],
    ['merida', 'Mérida / Yucatán', 20.97, -89.62, 2],
    ['monterrey', 'Monterrey', 25.69, -100.32, 2],
    ['acapulco', 'Acapulco / Pacífico sur', 16.85, -99.82, 2],
  ]],
  ['TR', 'Turquía', 24, [
    ['estambul', 'Estambul', 41.01, 28.98, 10],
    ['antalya', 'Antalya / Costa turquesa', 36.90, 30.70, 8],
    ['bodrum', 'Bodrum / Mugla', 37.03, 27.43, 4],
    ['capadocia', 'Capadocia', 38.64, 34.83, 3],
    ['izmir', 'Esmirna / Éfeso', 38.42, 27.14, 3],
    ['ankara', 'Ankara', 39.93, 32.86, 2],
  ]],
  ['TH', 'Tailandia', 20, [
    ['bangkok', 'Bangkok', 13.76, 100.50, 8],
    ['phuket', 'Phuket / Andamán', 7.88, 98.39, 7],
    ['chiang-mai', 'Chiang Mai / Norte', 18.79, 98.98, 4],
    ['koh-samui', 'Koh Samui / Golfo', 9.51, 100.00, 3],
    ['pattaya', 'Pattaya', 12.92, 100.88, 2],
    ['krabi', 'Krabi', 8.09, 98.91, 2],
  ]],
  ['GR', 'Grecia', 18, [
    ['atenas', 'Atenas', 37.98, 23.73, 6],
    ['crete', 'Creta', 35.34, 25.13, 5],
    ['santorini', 'Santorini', 36.39, 25.46, 4],
    ['mykonos', 'Mykonos / Cícladas', 37.45, 25.33, 3],
    ['rodas', 'Rodas / Dodecaneso', 36.43, 28.22, 3],
    ['corfu', 'Corfú / Islas Jónicas', 39.62, 19.92, 2],
    ['tesalonica', 'Salónica / Norte', 40.64, 22.94, 2],
  ]],
  ['CA', 'Canadá', 16, [
    ['toronto', 'Toronto / Ontario', 43.65, -79.38, 6],
    ['vancouver', 'Vancouver / Columbia Británica', 49.28, -123.12, 5],
    ['montreal', 'Montreal / Quebec', 45.50, -73.57, 4],
    ['banff', 'Banff / Rocosas canadienses', 51.18, -115.57, 3],
    ['quebec-city', 'Ciudad de Quebec', 46.81, -71.21, 2],
    ['calgary', 'Calgary / Alberta', 51.04, -114.07, 2],
  ]],
  ['IN', 'India', 15, [
    ['delhi', 'Nueva Delhi / NCR', 28.61, 77.21, 5],
    ['mumbai', 'Bombay / Maharashtra', 19.08, 72.88, 5],
    ['goa', 'Goa', 15.30, 74.12, 4],
    ['jaipur', 'Jaipur / Rajastán', 26.91, 75.79, 3],
    ['kerala', 'Kerala', 9.93, 76.27, 3],
    ['agra', 'Agra / Triángulo de Oro', 27.18, 78.01, 2],
    ['bengaluru', 'Bengaluru', 12.97, 77.59, 2],
  ]],
  ['PT', 'Portugal', 14, [
    ['lisboa', 'Lisboa / Estoril', 38.72, -9.14, 7],
    ['algarve', 'Algarve', 37.02, -7.93, 6],
    ['porto', 'Porto / Norte', 41.15, -8.61, 5],
    ['madeira', 'Madeira', 32.67, -16.92, 3],
    ['acores', 'Azores', 37.74, -25.67, 2],
  ]],
  ['AU', 'Australia', 14, [
    ['sydney', 'Sídney / Nueva Gales del Sur', -33.87, 151.21, 7],
    ['melbourne', 'Melbourne / Victoria', -37.81, 144.96, 5],
    ['queensland', 'Queensland (Brisbane / Gold Coast)', -27.47, 153.03, 5],
    ['cairns', 'Cairns / Gran Barrera', -16.92, 145.78, 3],
    ['perth', 'Perth / Australia Occidental', -31.95, 115.86, 2],
    ['adelaide', 'Adelaida / Australia Meridional', -34.93, 138.60, 2],
  ]],
  ['AT', 'Austria', 12, [
    ['viena', 'Viena', 48.21, 16.37, 6],
    ['salzburgo', 'Salzburgo', 47.81, 13.04, 4],
    ['tirol', 'Tirol / Innsbruck', 47.27, 11.39, 4],
    ['estiria', 'Estiria / Graz', 47.07, 15.44, 2],
  ]],
  ['ID', 'Indonesia', 12, [
    ['bali', 'Bali', -8.41, 115.19, 8],
    ['yakarta', 'Yakarta / Java', -6.21, 106.85, 3],
    ['lombok', 'Lombok', -8.65, 116.32, 2],
    ['yogyakarta', 'Yogyakarta', -7.80, 110.36, 2],
  ]],
  ['AE', 'Emiratos Árabes', 12, [
    ['dubai', 'Dubái', 25.20, 55.27, 9],
    ['abu-dhabi', 'Abu Dabi', 24.45, 54.38, 4],
    ['ras-al-khaimah', 'Ras al-Khaimah / Norte', 25.79, 55.94, 2],
  ]],
  ['BR', 'Brasil', 12, [
    ['rio', 'Río de Janeiro', -22.91, -43.17, 6],
    ['sao-paulo', 'São Paulo', -23.55, -46.63, 4],
    ['nordeste', 'Nordeste (Salvador / Fortaleza / Natal)', -12.97, -38.50, 4],
    ['florianopolis', 'Florianópolis / Sur', -27.60, -48.55, 2],
    ['amazonas', 'Manaus / Amazonas', -3.12, -60.02, 2],
  ]],
  ['MY', 'Malasia', 10, [
    ['kuala-lumpur', 'Kuala Lumpur', 3.14, 101.69, 5],
    ['langkawi', 'Langkawi', 6.35, 99.79, 3],
    ['penang', 'Penang', 5.41, 100.33, 2],
    ['borneo-my', 'Sabah / Sarawak', 5.98, 116.07, 2],
  ]],
  ['NL', 'Países Bajos', 10, [
    ['amsterdam', 'Ámsterdam', 52.37, 4.90, 7],
    ['rotterdam', 'Róterdam / La Haya', 51.92, 4.48, 3],
  ]],
  ['CH', 'Suiza', 10, [
    ['zurich', 'Zúrich', 47.38, 8.54, 4],
    ['ginebra', 'Ginebra', 46.20, 6.14, 3],
    ['alpes-ch', 'Alpes suizos (Zermatt / Interlaken)', 46.02, 7.75, 4],
    ['lucerna', 'Lucerna', 47.05, 8.31, 2],
  ]],
  ['KR', 'Corea del Sur', 10, [
    ['seul', 'Seúl', 37.57, 126.98, 7],
    ['busan', 'Busán', 35.18, 129.08, 3],
    ['jeju', 'Jeju', 33.50, 126.53, 2],
  ]],
  ['EG', 'Egipto', 10, [
    ['el-cairo', 'El Cairo', 30.04, 31.24, 4],
    ['sharm', 'Sharm el-Sheij / Sinaí', 27.92, 34.33, 4],
    ['hurghada', 'Hurghada / Mar Rojo', 27.26, 33.81, 3],
    ['luxor', 'Luxor / Asuán', 25.69, 32.64, 2],
  ]],
  ['VN', 'Vietnam', 9, [
    ['ho-chi-minh', 'Ho Chi Minh', 10.82, 106.63, 4],
    ['hanoi', 'Hanói', 21.03, 105.85, 3],
    ['da-nang', 'Da Nang / Hoi An', 16.05, 108.20, 3],
    ['phu-quoc', 'Phu Quoc', 10.23, 103.96, 2],
  ]],
  ['PL', 'Polonia', 9, [
    ['varsovia', 'Varsovia', 52.23, 21.01, 4],
    ['cracovia', 'Cracovia', 50.06, 19.94, 4],
    ['gdansk', 'Gdansk / Costa báltica', 54.35, 18.65, 2],
  ]],
  ['HR', 'Croacia', 9, [
    ['dubrovnik', 'Dubrovnik / Dalmacia sur', 42.65, 18.09, 4],
    ['split', 'Split / Dalmacia central', 43.51, 16.44, 3],
    ['istria', 'Istria', 45.23, 13.77, 2],
    ['zagreb', 'Zagreb', 45.81, 15.98, 2],
  ]],
  ['SA', 'Arabia Saudí', 8, [
    ['riyadh', 'Riad', 24.71, 46.68, 4],
    ['yeddah', 'Yeda / La Meca', 21.49, 39.18, 3],
    ['alula', 'AlUla / Norte', 26.61, 37.92, 2],
  ]],
  ['AR', 'Argentina', 8, [
    ['buenos-aires', 'Buenos Aires', -34.60, -58.38, 5],
    ['patagonia-ar', 'Patagonia (Bariloche / Calafate)', -41.13, -71.31, 3],
    ['mendoza', 'Mendoza', -32.89, -68.84, 2],
  ]],
  ['ZA', 'Sudáfrica', 8, [
    ['ciudad-cabo', 'Ciudad del Cabo', -33.92, 18.42, 5],
    ['johannesburgo', 'Johannesburgo / Pretoria', -26.20, 28.04, 3],
    ['kruger', 'Kruger / Mpumalanga', -24.00, 31.50, 2],
  ]],
  ['MA', 'Marruecos', 8, [
    ['marrakech', 'Marrakech', 31.63, -8.00, 4],
    ['casablanca', 'Casablanca / Rabat', 33.57, -7.59, 2],
    ['fez', 'Fez / Norte', 34.02, -5.00, 2],
    ['agadir', 'Agadir / Costa atlántica', 30.43, -9.60, 2],
  ]],
  ['SG', 'Singapur', 8, [['singapur', 'Singapur', 1.35, 103.82, 1]]],
  ['IE', 'Irlanda', 7, [
    ['dublin', 'Dublín', 53.35, -6.26, 5],
    ['oeste-ie', 'Oeste (Galway / Cork / Cliffs)', 53.27, -9.05, 3],
  ]],
  ['BE', 'Bélgica', 7, [
    ['bruselas', 'Bruselas', 50.85, 4.35, 4],
    ['brujas', 'Brujas / Flandes', 51.21, 3.22, 3],
  ]],
  ['CZ', 'Chequia', 7, [
    ['praga', 'Praga', 50.08, 14.44, 6],
    ['bohemia', 'Bohemia / Český Krumlov', 48.81, 14.32, 2],
  ]],
  ['HU', 'Hungría', 7, [
    ['budapest', 'Budapest', 47.50, 19.04, 6],
    ['balaton', 'Lago Balatón', 46.83, 17.75, 2],
  ]],
  ['SE', 'Suecia', 7, [
    ['estocolmo', 'Estocolmo', 59.33, 18.07, 5],
    ['gotemburgo', 'Gotemburgo / Oeste', 57.71, 11.97, 2],
  ]],
  ['PH', 'Filipinas', 7, [
    ['manila', 'Manila', 14.60, 120.98, 3],
    ['boracay', 'Boracay / Visayas', 11.97, 121.93, 3],
    ['palawan', 'Palawan', 9.83, 118.74, 2],
  ]],
  ['NZ', 'Nueva Zelanda', 7, [
    ['auckland', 'Auckland', -36.85, 174.76, 3],
    ['queenstown', 'Queenstown / Isla Sur', -45.03, 168.66, 3],
    ['wellington', 'Wellington / Norte', -41.29, 174.78, 2],
  ]],
  ['CL', 'Chile', 6, [
    ['santiago-cl', 'Santiago de Chile', -33.45, -70.67, 4],
    ['patagonia-cl', 'Patagonia / Atacama', -51.00, -73.00, 3],
  ]],
  ['CO', 'Colombia', 6, [
    ['bogota', 'Bogotá', 4.71, -74.07, 3],
    ['cartagena-co', 'Cartagena / Caribe', 10.40, -75.51, 3],
    ['medellin', 'Medellín', 6.25, -75.56, 2],
  ]],
  ['PE', 'Perú', 6, [
    ['cusco', 'Cusco / Machu Picchu', -13.53, -71.97, 4],
    ['lima', 'Lima', -12.05, -77.04, 3],
  ]],
  ['DO', 'República Dominicana', 6, [
    ['punta-cana', 'Punta Cana / Este', 18.58, -68.40, 5],
    ['santo-domingo', 'Santo Domingo', 18.49, -69.93, 2],
  ]],
  ['TW', 'Taiwán', 6, [
    ['taipei', 'Taipéi', 25.03, 121.57, 5],
    ['kaohsiung', 'Kaohsiung / Sur', 22.63, 120.30, 2],
  ]],
  ['NO', 'Noruega', 6, [
    ['oslo', 'Oslo', 59.91, 10.75, 3],
    ['bergen', 'Bergen / Fiordos', 60.39, 5.32, 3],
    ['tromso', 'Tromsø / Norte', 69.65, 18.96, 2],
  ]],
  ['DK', 'Dinamarca', 6, [['copenhague', 'Copenhague / Dinamarca', 55.68, 12.57, 1]]],
  ['FI', 'Finlandia', 5, [
    ['helsinki', 'Helsinki', 60.17, 24.94, 4],
    ['laponia', 'Laponia', 66.50, 25.70, 2],
  ]],
  ['QA', 'Catar', 5, [['doha', 'Doha', 25.29, 51.53, 1]]],
  ['CU', 'Cuba', 5, [
    ['la-habana', 'La Habana', 23.11, -82.37, 3],
    ['varadero', 'Varadero / Varadero-Matanzas', 23.14, -81.29, 2],
  ]],
  ['CR', 'Costa Rica', 5, [
    ['pacifico-cr', 'Pacífico (Guanacaste / Jacó)', 10.50, -85.50, 3],
    ['san-jose-cr', 'San José / Valle Central', 9.93, -84.09, 2],
  ]],
  ['KE', 'Kenia', 5, [
    ['nairobi', 'Nairobi / Safaris', -1.29, 36.82, 3],
    ['mombasa', 'Mombasa / Costa', -4.04, 39.67, 2],
  ]],
  ['TZ', 'Tanzania', 5, [
    ['zanzibar', 'Zanzíbar', -6.16, 39.20, 3],
    ['serengeti', 'Serengueti / Kilimanjaro', -2.33, 34.83, 2],
  ]],
  ['JO', 'Jordania', 5, [
    ['amman', 'Amán', 31.95, 35.91, 2],
    ['petra', 'Petra / Wadi Rum / Áqaba', 30.33, 35.44, 3],
  ]],
  ['IL', 'Israel', 5, [
    ['tel-aviv', 'Tel Aviv', 32.09, 34.78, 3],
    ['jerusalen', 'Jerusalén', 31.77, 35.21, 2],
    ['eilat', 'Eilat', 29.56, 34.95, 2],
  ]],
  ['MV', 'Maldivas', 5, [['maldivas', 'Maldivas', 4.18, 73.51, 1]]],
  ['LK', 'Sri Lanka', 4, [
    ['colombo', 'Colombo / Sur', 6.93, 79.85, 3],
    ['kandy', 'Kandy / Centro', 7.29, 80.63, 2],
  ]],
  ['RO', 'Rumanía', 4, [
    ['bucarest', 'Bucarest', 44.43, 26.10, 3],
    ['transilvania', 'Transilvania', 46.77, 23.59, 2],
  ]],
  ['BG', 'Bulgaria', 4, [
    ['sofia', 'Sofía', 42.70, 23.32, 2],
    ['costa-negra', 'Costa del Mar Negro', 43.21, 27.91, 3],
  ]],
  ['IS', 'Islandia', 4, [['reikiavik', 'Reikiavik / Anillo de Oro', 64.15, -21.94, 1]]],
  ['TN', 'Túnez', 4, [
    ['tunez', 'Túnez / Norte', 36.81, 10.18, 2],
    ['djerba', 'Djerba / Costa', 33.81, 10.85, 2],
  ]],
  ['OM', 'Omán', 4, [['mascate', 'Mascate / Omán', 23.59, 58.41, 1]]],
  ['PA', 'Panamá', 4, [['ciudad-panama', 'Ciudad de Panamá / Bocas', 8.98, -79.52, 1]]],
  ['UY', 'Uruguay', 4, [
    ['montevideo', 'Montevideo', -34.90, -56.16, 2],
    ['punta-del-este', 'Punta del Este', -34.95, -54.93, 2],
  ]],
  ['EC', 'Ecuador', 4, [
    ['quito', 'Quito', -0.18, -78.47, 2],
    ['galapagos', 'Galápagos', -0.95, -90.97, 2],
  ]],
  ['KH', 'Camboya', 4, [
    ['siem-reap', 'Siem Reap / Angkor', 13.36, 103.86, 3],
    ['phnom-penh', 'Nom Pen', 11.56, 104.93, 2],
  ]],
  ['GE', 'Georgia', 3, [['tiflis', 'Tiflis / Batumi', 41.72, 44.79, 1]]],
  ['AZ', 'Azerbaiyán', 3, [['baku', 'Bakú', 40.41, 49.87, 1]]],
  ['RS', 'Serbia', 3, [['belgrado', 'Belgrado', 44.79, 20.45, 1]]],
  ['SI', 'Eslovenia', 3, [['liubliana', 'Liubliana / Bled', 46.05, 14.51, 1]]],
  ['SK', 'Eslovaquia', 3, [['bratislava', 'Bratislava / Tatras', 48.15, 17.11, 1]]],
  ['EE', 'Estonia', 3, [['tallin', 'Tallin', 59.44, 24.75, 1]]],
  ['LV', 'Letonia', 3, [['riga', 'Riga', 56.95, 24.11, 1]]],
  ['LT', 'Lituania', 3, [['vilna', 'Vilna', 54.69, 25.28, 1]]],
  ['MT', 'Malta', 4, [['malta', 'Malta / Gozo', 35.90, 14.51, 1]]],
  ['CY', 'Chipre', 4, [['chipre', 'Chipre', 34.92, 33.63, 1]]],
  ['MU', 'Mauricio', 4, [['mauricio', 'Mauricio', -20.35, 57.55, 1]]],
  ['SC', 'Seychelles', 3, [['seychelles', 'Seychelles', -4.68, 55.49, 1]]],
  ['JM', 'Jamaica', 4, [['montego-bay', 'Montego Bay / Jamaica', 18.48, -77.92, 1]]],
  ['BS', 'Bahamas', 3, [['nassau', 'Nasáu / Bahamas', 25.04, -77.35, 1]]],
  ['BB', 'Barbados', 3, [['barbados', 'Barbados', 13.10, -59.61, 1]]],
  ['PR', 'Puerto Rico', 4, [['san-juan', 'San Juan / Puerto Rico', 18.47, -66.11, 1]]],
  ['AW', 'Aruba', 3, [['aruba', 'Aruba', 12.52, -70.04, 1]]],
  ['CW', 'Curazao', 2, [['willemstad', 'Curazao', 12.12, -68.93, 1]]],
  ['BH', 'Baréin', 3, [['manama', 'Manama', 26.23, 50.59, 1]]],
  ['KW', 'Kuwait', 2, [['kuwait', 'Kuwait', 29.38, 47.98, 1]]],
  ['LU', 'Luxemburgo', 2, [['luxemburgo', 'Luxemburgo', 49.61, 6.13, 1]]],
  ['AD', 'Andorra', 3, [['andorra', 'Andorra', 42.51, 1.52, 1]]],
  ['MC', 'Mónaco', 2, [['monaco', 'Mónaco', 43.74, 7.42, 1]]],
  ['GI', 'Gibraltar', 1, [['gibraltar', 'Gibraltar', 36.14, -5.35, 1]]],
  ['ME', 'Montenegro', 3, [['kotor', 'Bahía de Kotor / Budva', 42.42, 18.77, 1]]],
  ['AL', 'Albania', 3, [['tirana', 'Tirana / Costa albanesa', 41.33, 19.82, 1]]],
  ['BA', 'Bosnia y Herzegovina', 2, [['sarajevo', 'Sarajevo / Mostar', 43.86, 18.41, 1]]],
  ['MK', 'Macedonia del Norte', 2, [['skopje', 'Skopie / Ohrid', 41.99, 21.43, 1]]],
  ['UA', 'Ucrania', 3, [
    ['kiev', 'Kiev', 50.45, 30.52, 2],
    ['lviv', 'Leópolis', 49.84, 24.03, 1],
  ]],
  ['NP', 'Nepal', 3, [['katmandu', 'Katmandú / Pokhara', 27.72, 85.32, 1]]],
  ['UZ', 'Uzbekistán', 3, [['samarcanda', 'Samarcanda / Bujará', 39.63, 66.97, 1]]],
  ['KZ', 'Kazajistán', 2, [['almaty', 'Almatý', 43.22, 76.85, 1]]],
  ['MN', 'Mongolia', 1, [['ulan-bator', 'Ulán Bator', 47.92, 106.92, 1]]],
  ['LA', 'Laos', 2, [['luang-prabang', 'Luang Prabang', 19.89, 102.14, 1]]],
  ['MM', 'Myanmar', 2, [['yangon', 'Yangón / Bagan', 16.87, 96.20, 1]]],
  ['BD', 'Bangladés', 2, [['dhaka', 'Daca', 23.81, 90.41, 1]]],
  ['PK', 'Pakistán', 2, [['islamabad', 'Islamabad / Lahore', 33.68, 73.05, 1]]],
  ['IR', 'Irán', 3, [
    ['teheran', 'Teherán', 35.69, 51.39, 2],
    ['isfahan', 'Isfahán / Shiraz', 32.65, 51.67, 1],
  ]],
  ['LB', 'Líbano', 2, [['beirut', 'Beirut', 33.89, 35.50, 1]]],
  ['AM', 'Armenia', 2, [['erevan', 'Ereván', 40.18, 44.51, 1]]],
  ['GT', 'Guatemala', 2, [['antigua-gt', 'Antigua / Tikal', 14.56, -90.73, 1]]],
  ['BZ', 'Belice', 2, [['san-pedro-bz', 'San Pedro / Belice', 17.92, -87.96, 1]]],
  ['HN', 'Honduras', 2, [['roatan', 'Roatán / Honduras', 16.33, -86.53, 1]]],
  ['SV', 'El Salvador', 1, [['san-salvador', 'San Salvador', 13.69, -89.22, 1]]],
  ['NI', 'Nicaragua', 1, [['granada-ni', 'Granada (Nicaragua)', 11.93, -85.96, 1]]],
  ['BO', 'Bolivia', 2, [['la-paz', 'La Paz / Uyuni', -16.50, -68.15, 1]]],
  ['PY', 'Paraguay', 1, [['asuncion', 'Asunción', -25.26, -57.58, 1]]],
  ['VE', 'Venezuela', 2, [['caracas', 'Caracas / Margarita', 10.48, -66.90, 1]]],
  ['GY', 'Guyana', 1, [['georgetown', 'Georgetown', 6.80, -58.16, 1]]],
  ['SR', 'Surinam', 1, [['paramaribo', 'Paramaribo', 5.85, -55.20, 1]]],
  ['NA', 'Namibia', 2, [['windhoek', 'Windhoek / Sossusvlei', -22.56, 17.08, 1]]],
  ['BW', 'Botsuana', 2, [['okavango', 'Delta del Okavango', -19.30, 22.90, 1]]],
  ['ZW', 'Zimbabue', 2, [['victoria-falls', 'Cataratas Victoria', -17.92, 25.86, 1]]],
  ['ZM', 'Zambia', 1, [['lusaka', 'Lusaka / Victoria Falls', -15.39, 28.32, 1]]],
  ['GH', 'Ghana', 2, [['accra', 'Accra', 5.60, -0.19, 1]]],
  ['NG', 'Nigeria', 3, [
    ['lagos', 'Lagos', 6.52, 3.38, 2],
    ['abuja', 'Abuya', 9.08, 7.40, 1],
  ]],
  ['SN', 'Senegal', 2, [['dakar', 'Dakar', 14.72, -17.47, 1]]],
  ['CI', 'Costa de Marfil', 1, [['abidjan', 'Abiyán', 5.36, -4.01, 1]]],
  ['ET', 'Etiopía', 2, [['adis', 'Adís Abeba', 9.03, 38.74, 1]]],
  ['RW', 'Ruanda', 1, [['kigali', 'Kigali', -1.94, 30.06, 1]]],
  ['UG', 'Uganda', 1, [['kampala', 'Kampala', 0.35, 32.58, 1]]],
  ['AO', 'Angola', 1, [['luanda', 'Luanda', -8.84, 13.23, 1]]],
  ['MZ', 'Mozambique', 1, [['maputo', 'Maputo', -25.97, 32.57, 1]]],
  ['CV', 'Cabo Verde', 2, [['cabo-verde', 'Cabo Verde', 14.92, -23.51, 1]]],
  ['MG', 'Madagascar', 1, [['antananarivo', 'Antananarivo', -18.88, 47.51, 1]]],
  ['RE', 'Reunión', 1, [['reunion', 'Reunión', -21.12, 55.54, 1]]],
  ['DZ', 'Argelia', 2, [['argel', 'Argel', 36.75, 3.06, 1]]],
  ['LY', 'Libia', 1, [['tripoli', 'Trípoli', 32.89, 13.19, 1]]],
  ['FJ', 'Fiyi', 2, [['nadi', 'Nadi / Fiyi', -17.78, 177.44, 1]]],
  ['PF', 'Polinesia Francesa', 3, [['tahiti', 'Tahití / Bora Bora', -17.55, -149.57, 1]]],
  ['NC', 'Nueva Caledonia', 1, [['noumea', 'Numea', -22.28, 166.46, 1]]],
  ['GU', 'Guam', 1, [['guam', 'Guam', 13.44, 144.79, 1]]],
  ['CK', 'Islas Cook', 1, [['rarotonga', 'Rarotonga', -21.21, -159.78, 1]]],
  ['WS', 'Samoa', 1, [['apia', 'Apia', -13.83, -171.77, 1]]],
  ['BT', 'Bután', 1, [['timbu', 'Timbu', 27.47, 89.64, 1]]],
  ['BN', 'Brunéi', 1, [['bandar', 'Bandar Seri Begawan', 4.90, 114.94, 1]]],
  ['MO', 'Macao', 0, []], // already under China as region — skip standalone if weight 0
  ['SM', 'San Marino', 1, [['san-marino', 'San Marino', 43.94, 12.45, 1]]],
  ['LI', 'Liechtenstein', 1, [['vaduz', 'Vaduz', 47.14, 9.52, 1]]],
  ['FO', 'Islas Feroe', 1, [['torshavn', 'Tórshavn', 62.01, -6.77, 1]]],
  ['GL', 'Groenlandia', 1, [['nuuk', 'Nuuk', 64.18, -51.72, 1]]],
  ['KY', 'Islas Caimán', 2, [['gran-caiman', 'Gran Caimán', 19.29, -81.37, 1]]],
  ['VI', 'Islas Vírgenes', 2, [['st-thomas', 'St. Thomas / USVI', 18.34, -64.93, 1]]],
  ['SX', 'Sint Maarten', 2, [['philipsburg', 'Sint Maarten', 18.03, -63.05, 1]]],
  ['TT', 'Trinidad y Tobago', 1, [['puerto-espana', 'Puerto España', 10.65, -61.52, 1]]],
  ['HT', 'Haití', 1, [['puerto-principe', 'Puerto Príncipe', 18.59, -72.31, 1]]],
  ['IQ', 'Irak', 1, [['bagdad', 'Bagdad', 33.32, 44.37, 1]]],
  ['SY', 'Siria', 1, [['damasco', 'Damasco', 33.51, 36.29, 1]]],
  ['YE', 'Yemen', 1, [['sana', 'Saná', 15.37, 44.19, 1]]],
  ['AF', 'Afganistán', 1, [['kabul', 'Kabul', 34.56, 69.21, 1]]],
  ['TL', 'Timor Oriental', 1, [['dili', 'Dili', -8.56, 125.57, 1]]],
  ['PG', 'Papúa Nueva Guinea', 1, [['port-moresby', 'Port Moresby', -9.44, 147.18, 1]]],
  ['TO', 'Tonga', 1, [['nukualofa', 'Nukualofa', -21.14, -175.20, 1]]],
  ['VU', 'Vanuatu', 1, [['port-vila', 'Port Vila', -17.73, 168.33, 1]]],
  ['AS', 'Samoa Americana', 1, [['pago-pago', 'Pago Pago', -14.28, -170.70, 1]]],
  ['MP', 'Islas Marianas', 1, [['saipan', 'Saipán', 15.18, 145.75, 1]]],
  ['GF', 'Guayana Francesa', 1, [['cayena', 'Cayena', 4.92, -52.33, 1]]],
].filter(([, , w]) => w > 0);

function allocate(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const floors = raw.map((x) => Math.floor(x));
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, frac: x - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < left; k++) out[order[k % order.length].i]++;
  // ensure min 1 if weight > 0
  for (let i = 0; i < out.length; i++) {
    if (weights[i] > 0 && out[i] < 1) out[i] = 1;
  }
  // fix sum again
  let diff = total - out.reduce((a, b) => a + b, 0);
  let j = 0;
  while (diff !== 0) {
    const idx = order[j % order.length].i;
    if (diff > 0) {
      out[idx]++;
      diff--;
    } else if (out[idx] > 1) {
      out[idx]--;
      diff++;
    }
    j++;
    if (j > out.length * 20) break;
  }
  return out;
}

function splitCountryHotels(countryHotels, regionDefs) {
  if (regionDefs.length === 0) return [];
  // If very few hotels, keep a single region (whole country = first or only)
  if (countryHotels <= 12 || regionDefs.length === 1) {
    const [id, name, lat, lng] = regionDefs[0];
    return [{ id, name, lat, lng, hotels: countryHotels }];
  }
  const weights = regionDefs.map((r) => r[4] ?? 1);
  const hotels = allocate(countryHotels, weights);
  return regionDefs.map(([id, name, lat, lng], i) => ({
    id,
    name,
    lat,
    lng,
    hotels: hotels[i],
  }));
}

const countryWeights = COUNTRIES.map((c) => c[2]);
const countryHotels = allocate(TOTAL, countryWeights);

const regions = [];
const countrySummary = [];

for (let i = 0; i < COUNTRIES.length; i++) {
  const [code, name, weight, defs] = COUNTRIES[i];
  const hotels = countryHotels[i];
  const parts = splitCountryHotels(hotels, defs);
  // If allocate left some defs with 0, drop them and re-merge? allocate always >=0; ensure no zeros for listed
  const cleaned = parts.filter((p) => p.hotels > 0);
  // If we had many defs but some got 0, redistribute those slots
  if (cleaned.length < parts.length) {
    // already filtered
  }
  for (const p of cleaned) {
    regions.push({
      id: `${code.toLowerCase()}-${p.id}`,
      name: p.name,
      country: name,
      countryCode: code,
      lat: p.lat,
      lng: p.lng,
      hotels: p.hotels,
    });
  }
  countrySummary.push({
    code,
    name,
    weight,
    hotels,
    regions: cleaned.length,
  });
}

// Order: Costa del Sol first, then rest of Spain, then world by country hotels desc
const START = 'es-malaga-costa-sol';
const ordered = [];
const start = regions.find((r) => r.id === START);
if (start) ordered.push(start);
const spainRest = regions
  .filter((r) => r.countryCode === 'ES' && r.id !== START)
  .sort((a, b) => b.hotels - a.hotels || a.name.localeCompare(b.name, 'es'));
ordered.push(...spainRest);
const world = regions
  .filter((r) => r.countryCode !== 'ES')
  .sort((a, b) => {
    const ca = countrySummary.find((c) => c.code === a.countryCode)?.hotels ?? 0;
    const cb = countrySummary.find((c) => c.code === b.countryCode)?.hotels ?? 0;
    if (cb !== ca) return cb - ca;
    if (a.country !== b.country) return a.country.localeCompare(b.country, 'es');
    return b.hotels - a.hotels || a.name.localeCompare(b.name, 'es');
  });
ordered.push(...world);
ordered.forEach((r, i) => {
  r.order = i + 1;
});

countrySummary.sort((a, b) => b.hotels - a.hotels);

const totalHotels = ordered.reduce((s, r) => s + r.hotels, 0);
const spain = countrySummary.find((c) => c.code === 'ES');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(
  path.join(OUT, 'REGIONES.json'),
  JSON.stringify(
    {
      version: '0.5-plan',
      totalHotels,
      totalRegions: ordered.length,
      totalCountries: countrySummary.length,
      startRegionId: START,
      method:
        'Primero se reparte por país (peso turístico mundial). Solo si el país tiene bastantes hoteles se subdivide en regiones.',
      note: 'Sin PDFs todavía. Confirmar listado antes de generar.',
      countries: countrySummary.map(({ code, name, hotels, regions }) => ({
        code,
        name,
        hotels,
        regions,
      })),
      regions: ordered,
    },
    null,
    2,
  ),
);

let md = `# Plan de construcción — países y regiones (sin PDFs aún)\n\n`;
md += `Reparto **primero por país** (turismo / stock hotelero relativo). Un país pequeño = 1 zona. Un país grande = varias regiones.\n\n`;
md += `- **Hoteles totales:** ${totalHotels}\n`;
md += `- **Países / territorios:** ${countrySummary.length}\n`;
md += `- **Zonas (regiones o país entero):** ${ordered.length}\n`;
md += `- **Empieza por:** Costa del Sol (Málaga)\n`;
md += `- **España:** ${spain.regions} zonas · **${spain.hotels} hoteles** (~${((spain.hotels / totalHotels) * 100).toFixed(1)}% del mundo)\n\n`;
md += `## Países (por hoteles)\n\n| # | País | Hoteles | Zonas |\n|---|------|---------|-------|\n`;
countrySummary.forEach((c, i) => {
  md += `| ${i + 1} | ${c.name} | ${c.hotels} | ${c.regions} |\n`;
});
md += `\n## Zonas (orden de generación)\n\n| # | Zona | País | Hoteles |\n|---|------|------|--------|\n`;
for (const r of ordered) {
  md += `| ${r.order} | ${r.name} | ${r.country} | ${r.hotels} |\n`;
}
fs.writeFileSync(path.join(OUT, 'REGIONES.md'), md);

console.log(
  JSON.stringify(
    {
      totalHotels,
      totalRegions: ordered.length,
      totalCountries: countrySummary.length,
      spain,
      top12: countrySummary.slice(0, 12),
      start: ordered.slice(0, 5).map((r) => `${r.name}:${r.hotels}`),
      minMax: [Math.min(...ordered.map((r) => r.hotels)), Math.max(...ordered.map((r) => r.hotels))],
    },
    null,
    2,
  ),
);
