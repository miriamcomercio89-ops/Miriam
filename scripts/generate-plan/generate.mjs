#!/usr/bin/env node
/**
 * Genera PDFs del plan: 1 hotel/página, nombres reales (OSM), ciudad concreta,
 * enlace web e imagen si hay URL en OSM.
 *
 * Requiere: plan-construccion/REGIONES.json
 *           scripts/generate-plan/cache/osm/ES.json (+ cache/osm/regions/*.json)
 *
 * Uso: npm run plan:pdfs
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const PLAN = path.join(ROOT, 'plan-construccion')
const CACHE = path.join(__dirname, 'cache/osm')
const REG_CACHE = path.join(CACHE, 'regions')
const OUT_PDF = path.join(PLAN, 'pdfs')
const OUT_IDX = path.join(PLAN, 'indices')
const OUT_PUBLIC = path.join(ROOT, 'public/plan')
const IMG_CACHE = path.join(__dirname, 'cache/images')

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

/** Ciudades ancla por región (para no poner solo la capital) */
const CITY_ANCHORS = {
  'es-malaga-costa-sol': [
    ['Marbella', 36.51, -4.88], ['Fuengirola', 36.54, -4.62], ['Torremolinos', 36.62, -4.5],
    ['Benalmádena', 36.6, -4.52], ['Estepona', 36.43, -5.15], ['Mijas', 36.6, -4.64],
    ['Nerja', 36.75, -3.87], ['Málaga', 36.72, -4.42],
  ],
  'es-malaga-capital': [['Málaga', 36.72, -4.42]],
  'es-marbella': [['Marbella', 36.51, -4.88], ['Estepona', 36.43, -5.15], ['San Pedro Alcántara', 36.49, -4.99]],
  'es-barcelona': [['Barcelona', 41.39, 2.17], ['Hospitalet', 41.36, 2.1], ['Badalona', 41.45, 2.25]],
  'es-madrid': [['Madrid', 40.42, -3.7]],
  'es-mallorca': [['Palma', 39.57, 2.65], ['Alcúdia', 39.85, 3.12], ['Calvià', 39.56, 2.5]],
  'es-ibiza': [['Ibiza', 38.91, 1.43], ['Sant Antoni', 38.98, 1.3], ['Santa Eulària', 38.98, 1.53]],
  'es-tenerife': [['Adeje', 28.12, -16.72], ['Arona', 28.1, -16.68], ['Puerto de la Cruz', 28.41, -16.55]],
  'es-gran-canaria': [['Las Palmas', 28.12, -15.43], ['Maspalomas', 27.76, -15.59]],
  'es-benidorm': [['Benidorm', 38.54, -0.13], ['Altea', 38.6, -0.05], ['Calpe', 38.64, 0.04]],
  'es-valencia': [['Valencia', 39.47, -0.38]],
  'es-sevilla': [['Sevilla', 37.39, -5.99]],
  'es-granada': [['Granada', 37.18, -3.6], ['Sierra Nevada', 37.09, -3.39]],
  'es-alicante': [['Alicante', 38.35, -0.48]],
  'es-costa-brava': [['Lloret de Mar', 41.7, 2.85], ['Roses', 42.26, 3.18], ['Tossa de Mar', 41.72, 2.93]],
  'es-costa-dourada': [['Salou', 41.08, 1.13], ['Cambrils', 41.07, 1.06], ['Tarragona', 41.12, 1.25]],
}

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
function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}
function boardLabel(id) {
  return BOARDS.find((b) => b.id === id)?.label ?? id
}
function dist2(a, b) {
  const dy = a.lat - b.lat
  const dx = a.lng - b.lng
  return dy * dy + dx * dx
}
function detectVibe(name) {
  const n = name.toLowerCase()
  if (/costa|playa|beach|island|isla|maldives|carib|bali|phuket|ibiza|mallorca|canaria|tenerife|algarve|riviera|cancun|miami|hawaii/.test(n)) return 'coast'
  if (/alpes|alpine|ski|sierra|mountain|patagonia|safari|fiordo/.test(n)) return 'nature'
  if (/roma|paris|venecia|florencia|praga|kyoto|kioto|cusco|petra/.test(n)) return 'heritage'
  return 'urban'
}
function themeFor(vibe) {
  return {
    coast: ['#0B3D4A', '#C4A35A', '#F2E6C8'],
    nature: ['#163028', '#7BA88A', '#E4F0E8'],
    heritage: ['#2A1F18', '#C9A227', '#F3E5C4'],
    urban: ['#111827', '#C4A35A', '#F5F0E6'],
  }[vibe] || ['#111827', '#C4A35A', '#F5F0E6']
}

function parseOsmFile(filePath) {
  if (!fs.existsSync(filePath)) return []
  let raw
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return []
  }
  if (raw.useCountry) return []
  const out = []
  for (const e of raw.elements || []) {
    const tags = e.tags || {}
    const name = tags.name
    if (!name || name.length < 2) continue
    // skip pure apartments labeled as such if too generic? keep hotels
    const lat = e.lat ?? e.center?.lat
    const lng = e.lon ?? e.center?.lon
    if (lat == null || lng == null) continue
    const website = tags.website || tags['contact:website'] || tags['contact:facebook'] || null
    const image = tags.image || tags.wikimedia_commons || null
    const city =
      tags['addr:city'] ||
      tags['addr:town'] ||
      tags['addr:suburb'] ||
      tags['addr:place'] ||
      null
    const osmType = e.type === 'way' ? 'way' : 'node'
    out.push({
      name: name.trim(),
      lat,
      lng,
      website,
      image: image && String(image).startsWith('http') ? image : null,
      city,
      osmUrl: `https://www.openstreetmap.org/${osmType}/${e.id}`,
      key: `${osmType}/${e.id}`,
    })
  }
  return out
}

function loadCountryPool(cc) {
  return parseOsmFile(path.join(CACHE, `${cc}.json`))
}

function loadRegionPool(regionId) {
  return parseOsmFile(path.join(REG_CACHE, `${regionId}.json`))
}

function nearestCity(lat, lng, region) {
  const anchors = CITY_ANCHORS[region.id]
  if (anchors?.length) {
    let best = anchors[0]
    let bestD = Infinity
    for (const a of anchors) {
      const d = dist2({ lat, lng }, { lat: a[1], lng: a[2] })
      if (d < bestD) {
        bestD = d
        best = a
      }
    }
    return best[0]
  }
  // fallback: first word of region name or paren city
  const m = region.name.match(/\(([^)]+)\)/)
  if (m) return m[1].split('/')[0].trim()
  return region.name.split('/')[0].split(',')[0].trim()
}

function hotelWebsite(h, city) {
  if (h.website && /^https?:\/\//i.test(h.website)) return h.website
  if (h.osmUrl) return h.osmUrl
  const q = encodeURIComponent(`${h.name} ${city} hotel`)
  return `https://www.google.com/search?q=${q}`
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (!url || !/^https?:\/\//i.test(url)) return resolve(null)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) return resolve(dest)
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(
      url,
      {
        headers: { 'User-Agent': 'OrbisHotelsPlan/0.6', Accept: 'image/*,*/*' },
        timeout: 12000,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          return downloadImage(res.headers.location, dest).then(resolve)
        }
        if (res.statusCode !== 200) {
          res.resume()
          return resolve(null)
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          if (buf.length < 400 || buf.length > 2_500_000) return resolve(null)
          fs.mkdirSync(path.dirname(dest), { recursive: true })
          fs.writeFileSync(dest, buf)
          resolve(dest)
        })
      },
    )
    req.on('error', () => resolve(null))
    req.on('timeout', () => {
      req.destroy()
      resolve(null)
    })
  })
}

function assignHotels(regions) {
  const used = new Set()
  const byRegion = new Map()
  const countryPools = new Map()

  for (const r of regions) {
    let pool = loadRegionPool(r.id)
    if (r.countryCode === 'ES' || pool.length < r.hotels) {
      if (!countryPools.has(r.countryCode)) {
        countryPools.set(r.countryCode, loadCountryPool(r.countryCode))
      }
      const country = countryPools.get(r.countryCode) || []
      // merge unique
      const map = new Map(pool.map((h) => [h.key, h]))
      for (const h of country) map.set(h.key, h)
      pool = [...map.values()]
    }
    // sort by distance to region center
    pool.sort((a, b) => dist2(a, r) - dist2(b, r))
    const picked = []
    for (const h of pool) {
      if (picked.length >= r.hotels) break
      if (used.has(h.key)) continue
      // filter nonsense names
      if (/^hotel\s*$/i.test(h.name)) continue
      used.add(h.key)
      const city = h.city || nearestCity(h.lat, h.lng, r)
      picked.push({ ...h, city })
    }
    byRegion.set(r.id, picked)
  }
  return byRegion
}

function buildHotelCard(order, region, osmHotel, localIdx, rng) {
  const city = osmHotel.city
  const sub = SUBS[(order + localIdx) % SUBS.length]
  const stars = sub.min + Math.floor(rng() * (sub.max - sub.min + 1))
  const rooms = 40 + Math.floor(rng() * 260) + (stars >= 5 ? 40 : 0)
  const target = pick(rng, sub.targets)
  const vibe = region.vibe
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
  const services = pickN(rng, SERVICES, 4 + Math.floor(rng() * 8))
  if (boardRegime.startsWith('ti') && !services.includes('all_inclusive')) services.push('all_inclusive')
  const brandShort = sub.name.replace(/^Orbis\s+/, '')
  const orbisName = `${brandShort} ${city} #${order}`
  const website = hotelWebsite(osmHotel, city)

  return {
    order,
    realHotel: osmHotel.name,
    name: orbisName,
    subsidiaryId: sub.id,
    subsidiaryName: sub.name,
    country: region.country,
    countryCode: region.countryCode,
    regionId: region.id,
    regionName: region.name,
    city,
    lat: osmHotel.lat,
    lng: osmHotel.lng,
    website,
    imageUrl: osmHotel.image || null,
    osmUrl: osmHotel.osmUrl,
    stars,
    rooms,
    target,
    staffLevel: stars >= 5 ? pick(rng, ['premium', 'lujo']) : pick(rng, STAFF),
    roomMix: target === 'familiar' ? 'familiar' : stars >= 5 ? pick(rng, ['mixto', 'suites']) : pick(rng, MIX),
    buildQuality: stars >= 5 ? pick(rng, ['alto', 'lujo']) : pick(rng, QUALITY),
    floors: 2 + Math.floor(rng() * (stars >= 4 ? 18 : 8)),
    greenLevel: pick(rng, GREEN),
    meetingRooms: target === 'negocios' ? 2 + Math.floor(rng() * 8) : Math.floor(rng() * 3),
    parkingSpots: 10 + Math.floor(rng() * 120),
    restaurantLevel: stars >= 4 ? 2 + Math.floor(rng() * 4) : Math.floor(rng() * 3),
    openingPromoDays: Math.floor(rng() * 15),
    designFocus: vibe === 'coast' ? pick(rng, ['vistas', 'fiesta', 'familia']) : pick(rng, FOCUS),
    buffet: boardRegime !== 'solo' && rng() > 0.4,
    lateCheckout: rng() > 0.35,
    airportDesk: target === 'negocios' || rng() > 0.7,
    securityLevel: stars >= 4 ? pick(rng, ['medio', 'alto']) : pick(rng, SECURITY),
    techLevel: pick(rng, TECH),
    breakfastIncluded: boardRegime !== 'solo',
    seaViewShare: vibe === 'coast' ? 20 + Math.floor(rng() * 70) : Math.floor(rng() * 15),
    loyaltyProgram: rng() > 0.55,
    quietHours: rng() > 0.7,
    bikeRental: vibe === 'nature' || rng() > 0.75,
    shuttleCity: rng() > 0.6,
    boardRegime,
    availableRegimes,
    services,
    imageKey: `${['coast', 'urban', 'nature', 'luxury', 'family', 'adventure'][order % 6]}:${['day', 'dusk', 'night', 'aerial', 'sunny'][order % 5]}`,
  }
}

async function writeRegionPdf(region, hotels, filePath) {
  const [c1, c2, c3] = region.theme
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: { Title: `Orbis · ${region.name}`, Author: 'Orbis Hotels Group' },
  })
  const stream = fs.createWriteStream(filePath)
  doc.pipe(stream)

  const finish = new Promise((resolve, reject) => {
    stream.on('finish', resolve)
    stream.on('error', reject)
  })

  for (let i = 0; i < hotels.length; i++) {
    if (i > 0) doc.addPage()
    const h = hotels[i]

    doc.rect(0, 0, doc.page.width, 70).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(16).text('ORBIS HOTELS GROUP', 40, 18)
    doc.font('Helvetica').fontSize(10).fillColor(c2)
      .text(`Plan · ${region.country} · ${region.name} · Hotel ${i + 1}/${hotels.length}`, 40, 42)

    let y = 95
    doc.fillColor(c1).font('Helvetica-Bold').fontSize(22).text(`#${h.order}`, 40, y)
    y = doc.y + 8

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#8B1E1E')
      .text(`Compra: ${h.realHotel}`, 40, y, { width: 515 })
    y = doc.y + 6
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0B4F2F')
      .text(`Nuevo: ${h.name}`, 40, y, { width: 515 })
    y = doc.y + 10

    doc.font('Helvetica').fontSize(10).fillColor('#333')
      .text(`Marca Orbis: ${h.subsidiaryName}`, 40, y)
      .text(`Ciudad: ${h.city}  ·  ${h.stars}★  ·  ${h.rooms} habitaciones`, 40, doc.y + 2)
      .text(`País: ${h.country} (${h.countryCode})`, 40, doc.y + 2)
    y = doc.y + 12

    // Image if available
    let imgPath = null
    if (h.imageUrl) {
      const dest = path.join(IMG_CACHE, `${slugify(h.realHotel).slice(0, 40)}_${h.order}.img`)
      imgPath = await downloadImage(h.imageUrl, dest)
    }
    if (imgPath) {
      try {
        doc.image(imgPath, 40, y, { fit: [240, 150], align: 'left' })
        y += 160
      } catch {
        // ignore bad image
      }
    } else {
      doc.roundedRect(40, y, 240, 120, 8).strokeColor(c2).stroke()
      doc.fillColor('#666').fontSize(9)
        .text('Sin foto local. Ábrela en la web del hotel o en OpenStreetMap.', 50, y + 50, { width: 220, align: 'center' })
      y += 130
    }

    doc.fillColor(c1).font('Helvetica-Bold').fontSize(10).text('Enlaces', 40, y)
    y = doc.y + 4
    doc.font('Helvetica').fontSize(9).fillColor('#1a4a8a')
    doc.text(`Web / ficha: ${h.website}`, 40, y, { link: h.website, underline: true, width: 515 })
    y = doc.y + 4
    if (h.osmUrl && h.osmUrl !== h.website) {
      doc.text(`OpenStreetMap: ${h.osmUrl}`, 40, y, { link: h.osmUrl, underline: true, width: 515 })
      y = doc.y + 10
    } else {
      y += 8
    }

    doc.fillColor(c1).font('Helvetica-Bold').fontSize(10).text('Parámetros del constructor', 40, y)
    y = doc.y + 6
    const rows = [
      [`Clientes: ${h.target}`, `Personal: ${h.staffLevel}`, `Habitaciones: ${h.roomMix}`],
      [`Calidad: ${h.buildQuality}`, `Plantas: ${h.floors}`, `Plan verde: ${h.greenLevel}`],
      [`Seguridad: ${h.securityLevel}`, `Tecnología: ${h.techLevel}`, `Enfoque: ${h.designFocus}`],
      [`Salas reuniones: ${h.meetingRooms}`, `Parking: ${h.parkingSpots}`, `Restaurante: ${h.restaurantLevel}`],
      [`Oferta apertura: ${h.openingPromoDays} d`, `Vistas mar: ${h.seaViewShare}%`, `Desayuno: ${h.breakfastIncluded ? 'Sí' : 'No'}`],
      [`Fidelidad: ${h.loyaltyProgram ? 'Sí' : 'No'}`, `Buffet: ${h.buffet ? 'Sí' : 'No'}`, `Salida tarde: ${h.lateCheckout ? 'Sí' : 'No'}`],
      [`Mostrador aero.: ${h.airportDesk ? 'Sí' : 'No'}`, `Silencio: ${h.quietHours ? 'Sí' : 'No'}`, `Bicis: ${h.bikeRental ? 'Sí' : 'No'}`],
      [`Bus centro: ${h.shuttleCity ? 'Sí' : 'No'}`, `Régimen: ${boardLabel(h.boardRegime)}`, `Foto juego: ${h.imageKey}`],
    ]
    doc.font('Helvetica').fontSize(8).fillColor('#222')
    for (const row of rows) {
      doc.text(row[0], 40, y, { width: 170, lineBreak: false })
      doc.text(row[1], 220, y, { width: 170, lineBreak: false })
      doc.text(row[2], 400, y, { width: 160, lineBreak: false })
      y += 12
    }
    y += 6
    doc.font('Helvetica-Bold').fontSize(8).fillColor(c1).text('Regímenes disponibles', 40, y)
    y = doc.y + 3
    doc.font('Helvetica').fillColor('#222').text(h.availableRegimes.map(boardLabel).join(' · '), 40, y, { width: 515 })
    y = doc.y + 6
    doc.font('Helvetica-Bold').fillColor(c1).text('Servicios', 40, y)
    y = doc.y + 3
    doc.font('Helvetica').fillColor('#222').text(h.services.join(', '), 40, y, { width: 515 })

    doc.fontSize(8).fillColor('#666')
      .text(
        `Orbis · Zona #${region.order} · Solo hoteles reales (OpenStreetMap) · Construir a mano`,
        40,
        doc.page.height - 30,
        { width: 515, align: 'center' },
      )
  }

  doc.end()
  await finish
}

function writeMasterPdf(master, countries, meta, filePath) {
  return new Promise((resolve, reject) => {
    const c1 = '#0B3D4A'
    const c2 = '#C4A35A'
    const c3 = '#F2E6C8'
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: 'Orbis · Orden de construcción' } })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(26).text('ORBIS HOTELS GROUP', 50, 160, { align: 'center' })
    doc.fontSize(14).fillColor(c2).text('Orden de construcción', 50, 210, { align: 'center' })
    doc.font('Helvetica').fontSize(11).fillColor(c3)
      .text(`${meta.totalHotels} hoteles · ${meta.totalRegions} zonas · ${meta.totalCountries} países`, 50, 250, { align: 'center' })
      .text('Empieza por Costa del Sol (Málaga)', 50, 275, { align: 'center' })
      .text('1 hotel = 1 página en el PDF de su zona', 50, 310, { align: 'center' })

    doc.addPage()
    doc.rect(0, 0, doc.page.width, 50).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(13).text('Países (por hoteles)', 40, 18)
    doc.moveDown(2)
    doc.fillColor('#222').font('Helvetica').fontSize(8)
    for (let i = 0; i < countries.length; i++) {
      if (doc.y > 770) {
        doc.addPage()
        doc.fillColor('#222').font('Helvetica').fontSize(8)
      }
      const c = countries[i]
      const y = doc.y
      doc.text(`${i + 1}. ${c.name}`, 40, y, { width: 220 })
      doc.text(`${c.hotels} hoteles`, 270, y, { width: 80 })
      doc.text(`${c.regions} zonas`, 360, y, { width: 80 })
      doc.y = y + 12
    }

    doc.addPage()
    doc.rect(0, 0, doc.page.width, 50).fill(c1)
    doc.fillColor(c3).font('Helvetica-Bold').fontSize(13).text('Orden de zonas', 40, 18)
    doc.moveDown(2)
    doc.fillColor('#222').font('Helvetica').fontSize(7.5)
    for (const m of master) {
      if (doc.y > 775) {
        doc.addPage()
        doc.fillColor('#222').font('Helvetica').fontSize(7.5)
      }
      const y = doc.y
      doc.text(`${m.order}. ${m.region}`, 40, y, { width: 200 })
      doc.text(m.country, 245, y, { width: 100 })
      doc.text(String(m.count), 350, y, { width: 40 })
      doc.text(`#${m.orderStart}–${m.orderEnd}`, 395, y, { width: 80 })
      doc.text(m.folder, 480, y, { width: 75 })
      doc.y = y + 11
    }
    doc.end()
  })
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isDirectory()) rmrf(p)
    else fs.unlinkSync(p)
  }
  fs.rmdirSync(dir)
}

async function main() {
  const data = JSON.parse(fs.readFileSync(path.join(PLAN, 'REGIONES.json'), 'utf8'))
  const regions = data.regions.map((r) => ({
    ...r,
    vibe: detectVibe(r.name),
    theme: themeFor(detectVibe(r.name)),
  }))

  console.log('Asignando hoteles reales OSM…')
  const assigned = assignHotels(regions)

  let missing = 0
  for (const r of regions) {
    const n = assigned.get(r.id)?.length ?? 0
    if (n < r.hotels) {
      missing += r.hotels - n
      console.warn(`FALTAN ${r.hotels - n} en ${r.id} (hay ${n}/${r.hotels})`)
    }
  }
  if (missing > 0) {
    console.warn(`Total faltantes: ${missing}. Espera a que termine la descarga OSM o vuelve a generar.`)
  }

  if (fs.existsSync(OUT_PDF)) rmrf(OUT_PDF)
  if (fs.existsSync(OUT_IDX)) rmrf(OUT_IDX)
  fs.mkdirSync(OUT_PDF, { recursive: true })
  fs.mkdirSync(OUT_IDX, { recursive: true })
  fs.mkdirSync(path.join(OUT_PUBLIC, 'regions'), { recursive: true })
  fs.mkdirSync(IMG_CACHE, { recursive: true })

  let order = 1
  const master = []
  const t0 = Date.now()

  for (const region of regions) {
    const osmList = assigned.get(region.id) || []
    // Use only real hotels we have; if short, reduce region count to available (honest)
    const n = Math.min(region.hotels, osmList.length)
    if (n === 0) {
      console.warn(`SKIP empty ${region.id}`)
      continue
    }
    const rng = mulberry32(3000 + region.order * 997)
    const hotels = []
    for (let i = 0; i < n; i++) {
      hotels.push(buildHotelCard(order, region, osmList[i], i, rng))
      order++
    }

    const folderName = `${region.countryCode}-${slugify(region.country)}`
    const folderPath = path.join(OUT_PDF, folderName)
    fs.mkdirSync(folderPath, { recursive: true })
    const fileBase = `${String(region.order).padStart(3, '0')}_${slugify(region.name)}`
    const pdfRel = `pdfs/${folderName}/${fileBase}.pdf`
    await writeRegionPdf(region, hotels, path.join(folderPath, `${fileBase}.pdf`))

    const idx = {
      order: region.order,
      orderStart: hotels[0].order,
      orderEnd: hotels[hotels.length - 1].order,
      region: region.name,
      regionId: region.id,
      country: region.country,
      countryCode: region.countryCode,
      count: hotels.length,
      folder: folderName,
      pdf: pdfRel,
    }
    master.push(idx)
    fs.writeFileSync(path.join(OUT_IDX, `${fileBase}.json`), JSON.stringify({ ...idx, hotels }))

    // slim for in-game plan panel
    fs.writeFileSync(
      path.join(OUT_PUBLIC, 'regions', `${String(region.order).padStart(3, '0')}.json`),
      JSON.stringify({
        hotels: hotels.map((h) => ({
          order: h.order,
          realHotel: h.realHotel,
          name: h.name,
          city: h.city,
          subsidiaryName: h.subsidiaryName,
          stars: h.stars,
          rooms: h.rooms,
          lat: h.lat,
          lng: h.lng,
          website: h.website,
          imageUrl: h.imageUrl,
        })),
      }),
    )

    if (region.order % 20 === 0 || region.order === 1) {
      console.log(`[${region.order}/${regions.length}] ${region.name}: ${hotels.length} págs`)
    }
  }

  const totalHotels = master.reduce((s, m) => s + m.count, 0)
  await writeMasterPdf(master, data.countries, { ...data, totalHotels, totalRegions: master.length }, path.join(PLAN, 'ORDEN-CONSTRUCCION.pdf'))

  const slimIndex = {
    totalHotels,
    totalRegions: master.length,
    totalCountries: data.totalCountries,
    generatedAt: new Date().toISOString(),
    items: master,
  }
  fs.writeFileSync(path.join(PLAN, 'INDEX.json'), JSON.stringify(slimIndex, null, 2))
  fs.writeFileSync(path.join(OUT_PUBLIC, 'index.json'), JSON.stringify(slimIndex))
  fs.writeFileSync(path.join(OUT_PUBLIC, 'README.txt'), 'Índice del plan Orbis para el panel Plan del juego.\n')

  const md = [
    '# Plan de construcción Orbis',
    '',
    `- Hoteles (reales OSM): **${totalHotels}**`,
    `- Zonas / PDFs: **${master.length}**`,
    `- 1 hotel = 1 página`,
    `- PDF maestro: [ORDEN-CONSTRUCCION.pdf](./ORDEN-CONSTRUCCION.pdf)`,
    '',
    '| # | Zona | País | Hoteles | PDF |',
    '|---:|---|---|---:|---|',
    ...master.map((m) => `| ${m.order} | ${m.region} | ${m.country} | ${m.count} | \`${m.pdf}\` |`),
    '',
    `Generado en ${((Date.now() - t0) / 1000).toFixed(1)}s.`,
  ].join('\n')
  fs.writeFileSync(path.join(PLAN, 'README.md'), md)

  console.log(`Listo: ${master.length} PDFs · ${totalHotels} hoteles · ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
