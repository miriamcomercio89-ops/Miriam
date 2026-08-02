import type { Subsidiary } from '../types'
import { subsidiaryLogoDataUrl } from '../lib/brandLogos'

const palette = [
  ['#6E2020', '#DD6363'],
  ['#20873D', '#73E794'],
  ['#6B1FA1', '#C285EF'],
  ['#BDA81D', '#F5E998'],
  ['#0E6D7F', '#50D6F0'],
  ['#822558', '#E278B2'],
  ['#439C25', '#A1EB89'],
  ['#2924B7', '#9E9BF2'],
  ['#7B3613', '#EE8652'],
  ['#119663', '#68F2BD'],
  ['#8D2B96', '#DF8DE6'],
  ['#95B02A', '#DEEE9F'],
  ['#174777', '#58A0E9'],
  ['#911631', '#F16987'],
  ['#14AD21', '#7FF489'],
  ['#5D31A9', '#BDA2EB'],
  ['#72551B', '#E3B65D'],
  ['#1B8C86', '#6EECE5'],
  ['#A71A84', '#F381D6'],
  ['#67C417', '#C3F697'],
  ['#202D6E', '#6377DD'],
  ['#872C20', '#E78073'],
  ['#1FA156', '#85EFB1'],
  ['#8D1DBD', '#D998F5'],
  ['#7F7F0E', '#F0F050'],
  ['#256882', '#78C4E2'],
  ['#9C2557', '#EB89B2'],
  ['#37B724', '#A7F29B'],
  ['#24137B', '#6C52EE'],
  ['#964D11', '#F2A668'],
  ['#2B967B', '#8DE6D0'],
  ['#B02AAC', '#EE9FEC'],
  ['#577717', '#B8E958'],
  ['#164591', '#699DF1'],
  ['#AD1421', '#F47F89'],
  ['#31A949', '#A2EBB1'],
  ['#471B72', '#A05DE3'],
  ['#8C741B', '#ECD16E'],
  ['#1A9BA7', '#81E9F3'],
  ['#C41784', '#F697D3'],
  ['#3A6E20', '#8CDD63'],
  ['#202587', '#7379E7'],
  ['#A1401F', '#EF9F85'],
  ['#1DBD72', '#98F5CA'],
  ['#6D0E7F', '#D650F0'],
  ['#778225', '#D6E278'],
  ['#256A9C', '#89C2EB'],
  ['#B72450', '#F29BB5'],
  ['#137B13', '#52EE52'],
  ['#371196', '#8F68F2']
]

type Spec = Omit<Subsidiary, 'color' | 'accent' | 'id'> & { id: string }

const specs: Spec[] = [
  { id: 'azure-coast', name: 'Orbis Azure Coast', specialty: 'Resorts de playa premium', tagline: 'Donde el horizonte es la suite', letter: 'A', beachAffinity: 0.98, costMultiplier: 1.35, demandBonus: 0.18, targets: ['playa', 'lujo', 'parejas'], minStars: 4, maxStars: 5, lore: 'La joya playera del grupo. Suites frente al mar y servicio invisible.', imageStyle: 'coast' },
  { id: 'marina-bay', name: 'Orbis Marina Bay', specialty: 'Hoteles frente a marinas', tagline: 'Amarre y descanso', letter: 'M', beachAffinity: 0.92, costMultiplier: 1.28, demandBonus: 0.14, targets: ['playa', 'lujo', 'negocios'], minStars: 4, maxStars: 5, lore: 'Diseñada para quienes llegan por mar y no quieren alejarse del muelle.', imageStyle: 'coast' },
  { id: 'palm-collection', name: 'Orbis Palm Collection', specialty: 'Oasis tropicales', tagline: 'Palmeras y calma', letter: 'P', beachAffinity: 0.95, costMultiplier: 1.2, demandBonus: 0.16, targets: ['playa', 'familiar', 'parejas'], minStars: 3, maxStars: 5, lore: 'Oasis tropicales con ritmos lentos y jardines densos.', imageStyle: 'coast' },
  { id: 'coral-keys', name: 'Orbis Coral Keys', specialty: 'Islas y arrecifes', tagline: 'Frente al coral', letter: 'C', beachAffinity: 0.99, costMultiplier: 1.45, demandBonus: 0.2, targets: ['playa', 'aventura', 'parejas'], minStars: 4, maxStars: 5, lore: 'Presencia en islas y arrecifes; buceo y quietud.', imageStyle: 'adventure' },
  { id: 'dune-resorts', name: 'Orbis Dune Resorts', specialty: 'Desierto costero', tagline: 'Arena, viento y lujo', letter: 'D', beachAffinity: 0.7, costMultiplier: 1.15, demandBonus: 0.1, targets: ['lujo', 'wellness', 'aventura'], minStars: 4, maxStars: 5, lore: 'Lujo mineral donde el desierto besa la costa.', imageStyle: 'luxury' },
  { id: 'lagoon', name: 'Orbis Lagoon', specialty: 'Lagunas y bahías', tagline: 'Aguas quietas', letter: 'L', beachAffinity: 0.9, costMultiplier: 1.22, demandBonus: 0.15, targets: ['playa', 'familiar', 'wellness'], minStars: 3, maxStars: 5, lore: 'Bahías calmadas, familias y wellness ligero.', imageStyle: 'coast' },
  { id: 'surf-house', name: 'Orbis Surf House', specialty: 'Surf y lifestyle', tagline: 'Olas primero', letter: 'S', beachAffinity: 0.97, costMultiplier: 0.95, demandBonus: 0.12, targets: ['aventura', 'playa', 'parejas'], minStars: 2, maxStars: 4, lore: 'Lifestyle de olas: informal, preciso, memorable.', imageStyle: 'adventure' },
  { id: 'tide', name: 'Orbis Tide', specialty: 'Boutique costera', tagline: 'Marea alta de diseño', letter: 'T', beachAffinity: 0.88, costMultiplier: 1.1, demandBonus: 0.13, targets: ['parejas', 'lujo', 'playa'], minStars: 3, maxStars: 5, lore: 'Boutique costera de diseño editorial.', imageStyle: 'coast' },
  { id: 'horizon-club', name: 'Orbis Horizon Club', specialty: 'Clubs de playa exclusivos', tagline: 'Solo miembros del horizonte', letter: 'H', beachAffinity: 0.94, costMultiplier: 1.5, demandBonus: 0.17, targets: ['lujo', 'parejas'], minStars: 5, maxStars: 5, lore: 'Clubs exclusivos solo para miembros del horizonte.', imageStyle: 'luxury' },
  { id: 'sail', name: 'Orbis Sail', specialty: 'Náutica y yates', tagline: 'Cubierta y suite', letter: 'Y', beachAffinity: 0.91, costMultiplier: 1.32, demandBonus: 0.14, targets: ['lujo', 'aventura', 'negocios'], minStars: 4, maxStars: 5, lore: 'Náutica y yates: la cubierta como lobby.', imageStyle: 'coast' },
  { id: 'breeze', name: 'Orbis Breeze', specialty: 'Vacaciones familiares playa', tagline: 'Arena para todos', letter: 'B', beachAffinity: 0.93, costMultiplier: 0.9, demandBonus: 0.11, targets: ['familiar', 'playa'], minStars: 2, maxStars: 4, lore: 'Vacaciones familiares sin fricción en primera línea.', imageStyle: 'family' },
  { id: 'cape', name: 'Orbis Cape', specialty: 'Cabos y acantilados', tagline: 'Vistas de faro', letter: 'K', beachAffinity: 0.85, costMultiplier: 1.18, demandBonus: 0.12, targets: ['parejas', 'lujo', 'aventura'], minStars: 3, maxStars: 5, lore: 'Cabos y acantilados con vistas de faro.', imageStyle: 'coast' },
  { id: 'reef-lodge', name: 'Orbis Reef Lodge', specialty: 'Ecolodge marino', tagline: 'Lujo con conciencia', letter: 'R', beachAffinity: 0.96, costMultiplier: 1.25, demandBonus: 0.13, targets: ['aventura', 'wellness', 'playa'], minStars: 3, maxStars: 5, lore: 'Ecolodge marino con lujo consciente.', imageStyle: 'nature' },
  { id: 'sunset-inn', name: 'Orbis Sunset Inn', specialty: 'Atardeceres costeros', tagline: 'La hora dorada', letter: 'U', beachAffinity: 0.89, costMultiplier: 1.05, demandBonus: 0.12, targets: ['parejas', 'playa'], minStars: 3, maxStars: 4, lore: 'Hoteles de atardecer: la hora dorada como producto.', imageStyle: 'coast' },
  { id: 'pearl', name: 'Orbis Pearl', specialty: 'Lujo urbano costero', tagline: 'Perlas de ciudad y mar', letter: 'E', beachAffinity: 0.75, costMultiplier: 1.4, demandBonus: 0.16, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5, lore: 'Lujo urbano con alma costera.', imageStyle: 'luxury' },
  { id: 'harbor', name: 'Orbis Harbor', specialty: 'Puertos y waterfront', tagline: 'El puerto como lobby', letter: 'O', beachAffinity: 0.8, costMultiplier: 1.12, demandBonus: 0.11, targets: ['negocios', 'playa', 'familiar'], minStars: 3, maxStars: 5, lore: 'Waterfront operativo: puerto, ciudad y descanso.', imageStyle: 'urban' },
  { id: 'island-house', name: 'Orbis Island House', specialty: 'Casas de isla', tagline: 'Tu isla, tu ritmo', letter: 'I', beachAffinity: 0.98, costMultiplier: 1.38, demandBonus: 0.19, targets: ['lujo', 'parejas', 'playa'], minStars: 4, maxStars: 5, lore: 'Casas de isla con servicio de gran hotel.', imageStyle: 'luxury' },
  { id: 'coastline', name: 'Orbis Coastline', specialty: 'Cadena costera global', tagline: 'Siempre cerca del mar', letter: 'G', beachAffinity: 0.86, costMultiplier: 1.0, demandBonus: 0.1, targets: ['playa', 'familiar', 'negocios'], minStars: 2, maxStars: 5, lore: 'La red costera estándar de Orbis en el mundo.', imageStyle: 'coast' },
  { id: 'bayfront', name: 'Orbis Bayfront', specialty: 'Bahías urbanas', tagline: 'Ciudad con marea', letter: 'F', beachAffinity: 0.78, costMultiplier: 1.08, demandBonus: 0.1, targets: ['negocios', 'familiar', 'playa'], minStars: 3, maxStars: 5, lore: 'Bahías urbanas donde la ciudad mira al agua.', imageStyle: 'urban' },
  { id: 'atlantica', name: 'Orbis Atlantica', specialty: 'Costa atlántica', tagline: 'Océano abierto', letter: 'N', beachAffinity: 0.9, costMultiplier: 1.14, demandBonus: 0.13, targets: ['playa', 'aventura', 'familiar'], minStars: 3, maxStars: 5, lore: 'Costa atlántica abierta: viento, luz y espacio.', imageStyle: 'coast' },
  { id: 'mediterranea', name: 'Orbis Mediterránea', specialty: 'Estilo mediterráneo', tagline: 'Luz, cal y mar', letter: 'V', beachAffinity: 0.88, costMultiplier: 1.16, demandBonus: 0.15, targets: ['playa', 'parejas', 'familiar'], minStars: 3, maxStars: 5, lore: 'Luz, cal y mar. El Mediterráneo como lenguaje.', imageStyle: 'coast' },
  { id: 'pacific', name: 'Orbis Pacific Rim', specialty: 'Pacífico y atardeceres', tagline: 'Del este al oeste azul', letter: 'W', beachAffinity: 0.92, costMultiplier: 1.2, demandBonus: 0.14, targets: ['playa', 'lujo', 'aventura'], minStars: 3, maxStars: 5, lore: 'Pacífico de este a oeste: atardeceres largos.', imageStyle: 'coast' },
  { id: 'caribbean', name: 'Orbis Caribbean Soft', specialty: 'Caribe todo incluido', tagline: 'Ritmo y arena', letter: 'Q', beachAffinity: 0.97, costMultiplier: 1.1, demandBonus: 0.17, targets: ['familiar', 'playa', 'parejas'], minStars: 3, maxStars: 5, lore: 'Caribe todo incluido con ritmo y arena.', imageStyle: 'family' },
  { id: 'nordic-fjord', name: 'Orbis Nordic Fjord', specialty: 'Fiordos y costas frías', tagline: 'Agua fría, hospitalidad cálida', letter: 'J', beachAffinity: 0.55, costMultiplier: 1.22, demandBonus: 0.09, targets: ['aventura', 'wellness', 'parejas'], minStars: 3, maxStars: 5, lore: 'Fiordos y costas frías, hospitalidad cálida.', imageStyle: 'nature' },
  { id: 'alpine-lake', name: 'Orbis Alpine Lake', specialty: 'Lagos de montaña', tagline: 'Espejo de cumbres', letter: 'Z', beachAffinity: 0.25, costMultiplier: 1.18, demandBonus: 0.1, targets: ['wellness', 'parejas', 'aventura'], minStars: 3, maxStars: 5, lore: 'Lagos de montaña como resorts silenciosos.', imageStyle: 'nature' },
  { id: 'city-grand', name: 'Orbis City Grand', specialty: 'Grandes hoteles urbanos', tagline: 'La ciudad como resort', letter: 'X', beachAffinity: 0.2, costMultiplier: 1.3, demandBonus: 0.12, targets: ['negocios', 'lujo'], minStars: 4, maxStars: 5, lore: 'Grandes firmas urbanas de la colección Orbis.', imageStyle: 'urban' },
  { id: 'business-hub', name: 'Orbis Business Hub', specialty: 'Negocios y congresos', tagline: 'Productividad con estilo', letter: 'BH', beachAffinity: 0.15, costMultiplier: 1.05, demandBonus: 0.08, targets: ['negocios'], minStars: 3, maxStars: 5, lore: 'Productividad con estándares de marca global.', imageStyle: 'urban' },
  { id: 'airport-gate', name: 'Orbis Airport Gate', specialty: 'Aeropuertos y escala', tagline: 'Conexión sin fricción', letter: 'AG', beachAffinity: 0.1, costMultiplier: 0.85, demandBonus: 0.06, targets: ['negocios', 'familiar'], minStars: 2, maxStars: 4, lore: 'Escalas impecables junto a aeropuertos.', imageStyle: 'urban' },
  { id: 'spa-sanctum', name: 'Orbis Spa Sanctum', specialty: 'Wellness y spa', tagline: 'Silencio terapéutico', letter: 'SS', beachAffinity: 0.45, costMultiplier: 1.35, demandBonus: 0.14, targets: ['wellness', 'lujo', 'parejas'], minStars: 4, maxStars: 5, lore: 'Santuario wellness: silencio terapéutico.', imageStyle: 'luxury' },
  { id: 'family-village', name: 'Orbis Family Village', specialty: 'Resorts familiares', tagline: 'Diversión en bloque', letter: 'FV', beachAffinity: 0.7, costMultiplier: 0.92, demandBonus: 0.11, targets: ['familiar', 'playa'], minStars: 2, maxStars: 4, lore: 'Resorts familiares con programación completa.', imageStyle: 'family' },
  { id: 'boutique-noir', name: 'Orbis Boutique Noir', specialty: 'Boutique de diseño', tagline: 'Pocas llaves, mucho carácter', letter: 'BN', beachAffinity: 0.4, costMultiplier: 1.25, demandBonus: 0.12, targets: ['lujo', 'parejas'], minStars: 4, maxStars: 5, lore: 'Pocas llaves, mucho carácter.', imageStyle: 'luxury' },
  { id: 'heritage', name: 'Orbis Heritage', specialty: 'Edificios históricos', tagline: 'Historia con servicio', letter: 'HE', beachAffinity: 0.3, costMultiplier: 1.42, demandBonus: 0.13, targets: ['lujo', 'parejas', 'negocios'], minStars: 4, maxStars: 5, lore: 'Edificios con historia y servicio contemporáneo.', imageStyle: 'luxury' },
  { id: 'garden', name: 'Orbis Garden Court', specialty: 'Jardines y patios', tagline: 'Verde entre muros', letter: 'GC', beachAffinity: 0.35, costMultiplier: 1.08, demandBonus: 0.1, targets: ['wellness', 'familiar', 'parejas'], minStars: 3, maxStars: 5, lore: 'Jardines y patios como corazón del hotel.', imageStyle: 'nature' },
  { id: 'skyline', name: 'Orbis Skyline', specialty: 'Torres con vista', tagline: 'La ciudad a tus pies', letter: 'SK', beachAffinity: 0.25, costMultiplier: 1.48, demandBonus: 0.15, targets: ['lujo', 'negocios'], minStars: 4, maxStars: 5, lore: 'Torres con vista: la ciudad a tus pies.', imageStyle: 'urban' },
  { id: 'retreat', name: 'Orbis Retreat', specialty: 'Retiros remotos', tagline: 'Desconectar de verdad', letter: 'RT', beachAffinity: 0.5, costMultiplier: 1.2, demandBonus: 0.11, targets: ['wellness', 'aventura', 'parejas'], minStars: 3, maxStars: 5, lore: 'Retiros remotos para desconectar de verdad.', imageStyle: 'nature' },
  { id: 'adventure', name: 'Orbis Adventure Base', specialty: 'Turismo activo', tagline: 'Basecamp con amenidades', letter: 'AB', beachAffinity: 0.55, costMultiplier: 0.95, demandBonus: 0.1, targets: ['aventura', 'familiar'], minStars: 2, maxStars: 4, lore: 'Basecamp con amenidades Orbis.', imageStyle: 'adventure' },
  { id: 'golf-links', name: 'Orbis Golf Links', specialty: 'Golf y resorts', tagline: 'Green y suite', letter: 'GL', beachAffinity: 0.6, costMultiplier: 1.28, demandBonus: 0.12, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5, lore: 'Green y suite en un mismo gesto.', imageStyle: 'luxury' },
  { id: 'casino-royale', name: 'Orbis Royale', specialty: 'Casino resort', tagline: 'Noche larga, servicio largo', letter: 'RY', beachAffinity: 0.65, costMultiplier: 1.55, demandBonus: 0.16, targets: ['lujo', 'parejas'], minStars: 4, maxStars: 5, lore: 'Noche larga, servicio largo.', imageStyle: 'luxury' },
  { id: 'allsuite', name: 'Orbis AllSuite', specialty: 'Solo suites', tagline: 'Cada habitación es suite', letter: 'AS', beachAffinity: 0.5, costMultiplier: 1.45, demandBonus: 0.14, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5, lore: 'Cada habitación es suite. Sin compromiso.', imageStyle: 'luxury' },
  { id: 'select', name: 'Orbis Select', specialty: 'Select service', tagline: 'Esencial, bien hecho', letter: 'SE', beachAffinity: 0.4, costMultiplier: 0.8, demandBonus: 0.07, targets: ['negocios', 'familiar'], minStars: 2, maxStars: 4, lore: 'Select service: esencial, bien hecho.', imageStyle: 'urban' },
  { id: 'residence', name: 'Orbis Residence', specialty: 'Estancias largas', tagline: 'Vivir, no solo dormir', letter: 'RS', beachAffinity: 0.35, costMultiplier: 1.02, demandBonus: 0.08, targets: ['negocios', 'familiar'], minStars: 3, maxStars: 5, lore: 'Estancias largas con alma residencial.', imageStyle: 'urban' },
  { id: 'congress', name: 'Orbis Congress', specialty: 'Ferias y eventos', tagline: 'Capacidad y precisión', letter: 'CG', beachAffinity: 0.2, costMultiplier: 1.15, demandBonus: 0.09, targets: ['negocios'], minStars: 3, maxStars: 5, lore: 'Capacidad y precisión para ferias y eventos.', imageStyle: 'urban' },
  { id: 'art-house', name: 'Orbis Art House', specialty: 'Arte y cultura', tagline: 'Galería con camas', letter: 'AH', beachAffinity: 0.3, costMultiplier: 1.2, demandBonus: 0.11, targets: ['parejas', 'lujo'], minStars: 3, maxStars: 5, lore: 'Galería con camas: cultura como amenidad.', imageStyle: 'urban' },
  { id: 'vineyard', name: 'Orbis Vineyard', specialty: 'Enoturismo', tagline: 'Cosecha y descanso', letter: 'VN', beachAffinity: 0.2, costMultiplier: 1.18, demandBonus: 0.12, targets: ['parejas', 'lujo', 'wellness'], minStars: 3, maxStars: 5, lore: 'Enoturismo con hospitalidad Orbis.', imageStyle: 'nature' },
  { id: 'thermal', name: 'Orbis Thermal', specialty: 'Termas y balnearios', tagline: 'Agua mineral, mente clara', letter: 'TH', beachAffinity: 0.15, costMultiplier: 1.3, demandBonus: 0.13, targets: ['wellness', 'lujo'], minStars: 4, maxStars: 5, lore: 'Termas y balnearios de firma.', imageStyle: 'luxury' },
  { id: 'safari-coast', name: 'Orbis Safari Coast', specialty: 'Safari + costa', tagline: 'Sabana y marea', letter: 'SC', beachAffinity: 0.8, costMultiplier: 1.35, demandBonus: 0.15, targets: ['aventura', 'lujo', 'playa'], minStars: 4, maxStars: 5, lore: 'Sabana y marea en un solo itinerario.', imageStyle: 'adventure' },
  { id: 'polar-light', name: 'Orbis Polar Light', specialty: 'Auroras y costas boreales', tagline: 'Noche blanca, servicio dorado', letter: 'PL', beachAffinity: 0.4, costMultiplier: 1.4, demandBonus: 0.12, targets: ['aventura', 'parejas', 'lujo'], minStars: 4, maxStars: 5, lore: 'Auroras y costas boreales.', imageStyle: 'adventure' },
  { id: 'jungle-canopy', name: 'Orbis Jungle Canopy', specialty: 'Selva y eco-turismo', tagline: 'Dosel y hospitalidad', letter: 'JC', beachAffinity: 0.35, costMultiplier: 1.22, demandBonus: 0.11, targets: ['aventura', 'wellness'], minStars: 3, maxStars: 5, lore: 'Dosel y hospitalidad en selva.', imageStyle: 'nature' },
  { id: 'desert-mirage', name: 'Orbis Desert Mirage', specialty: 'Desierto de lujo', tagline: 'Oasis de precisión', letter: 'DM', beachAffinity: 0.1, costMultiplier: 1.38, demandBonus: 0.13, targets: ['lujo', 'wellness', 'parejas'], minStars: 4, maxStars: 5, lore: 'Oasis de precisión en desierto.', imageStyle: 'luxury' },
  { id: 'world-collection', name: 'Orbis World Collection', specialty: 'Colección global insignia', tagline: 'La firma de Orbis', letter: 'WC', beachAffinity: 0.7, costMultiplier: 1.6, demandBonus: 0.2, targets: ['lujo', 'playa', 'negocios', 'parejas'], minStars: 5, maxStars: 5, lore: 'La firma insignia de Orbis Hotels Group.', imageStyle: 'luxury' },
]

export const SUBSIDIARIES: Subsidiary[] = specs.map((s, i) => {
  const [color, accent] = palette[i % palette.length]
  return { ...s, color, accent }
})

export const SUBSIDIARY_COLOR: Record<string, string> = Object.fromEntries(
  SUBSIDIARIES.map((s) => [s.id, s.color]),
)

export const SUBSIDIARY_ACCENT: Record<string, string> = Object.fromEntries(
  SUBSIDIARIES.map((s) => [s.id, s.accent]),
)

export function getSubsidiary(id: string): Subsidiary | undefined {
  return SUBSIDIARIES.find((s) => s.id === id)
}

/** Logo de marca elaborativo (SVG data-URL). Por defecto 128px — usar tamaño grande en UI. */
export function subsidiaryLogoSvg(sub: Subsidiary, size = 128): string {
  return subsidiaryLogoDataUrl(sub, size)
}

export function hotelPlaceholderImage(sub: Subsidiary, name: string): string {
  return defaultHotelImage(sub, name)
}

function defaultHotelImage(sub: Subsidiary, name: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sub.color}"/>
      <stop offset="55%" stop-color="#3D6F86"/>
      <stop offset="100%" stop-color="${sub.accent}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky)"/>
  <ellipse cx="400" cy="430" rx="380" ry="80" fill="#0B1F33" opacity="0.25"/>
  <rect x="220" y="160" width="360" height="220" rx="8" fill="#F7F3EA" opacity="0.92"/>
  <rect x="375" y="310" width="50" height="70" fill="${sub.accent}"/>
  <text x="400" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#F7F3EA">${escapeXml(sub.name)}</text>
  <text x="400" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#F7F3EA" opacity="0.85">${escapeXml(name || 'Nuevo hotel')}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
