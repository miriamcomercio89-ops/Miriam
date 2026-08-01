import type { Subsidiary } from '../types'

const palette = [
  ['#0B3A4A', '#C4A35A'],
  ['#123C4F', '#E8D5A3'],
  ['#1B4D3E', '#D4AF37'],
  ['#163A5F', '#7EB6C9'],
  ['#2C3E50', '#F0C27B'],
  ['#0F2C3A', '#A8C5B0'],
  ['#1A2F4A', '#E0B084'],
  ['#243B55', '#9AD0C4'],
  ['#0E2F2A', '#D9B45B'],
  ['#1F3A5F', '#F2E6C8'],
]

type Spec = Omit<Subsidiary, 'color' | 'accent' | 'letter' | 'id'> & { id: string; letter: string }

const specs: Spec[] = [
  { id: 'azure-coast', name: 'Orbis Azure Coast', specialty: 'Resorts de playa premium', tagline: 'Donde el horizonte es la suite', letter: 'A', beachAffinity: 0.98, costMultiplier: 1.35, demandBonus: 0.18, targets: ['playa', 'lujo', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'marina-bay', name: 'Orbis Marina Bay', specialty: 'Hoteles frente a marinas', tagline: 'Amarre y descanso', letter: 'M', beachAffinity: 0.92, costMultiplier: 1.28, demandBonus: 0.14, targets: ['playa', 'lujo', 'negocios'], minStars: 4, maxStars: 5 },
  { id: 'palm-collection', name: 'Orbis Palm Collection', specialty: 'Oasis tropicales', tagline: 'Palmeras y calma', letter: 'P', beachAffinity: 0.95, costMultiplier: 1.2, demandBonus: 0.16, targets: ['playa', 'familiar', 'parejas'], minStars: 3, maxStars: 5 },
  { id: 'coral-keys', name: 'Orbis Coral Keys', specialty: 'Islas y arrecifes', tagline: 'Frente al coral', letter: 'C', beachAffinity: 0.99, costMultiplier: 1.45, demandBonus: 0.2, targets: ['playa', 'aventura', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'dune-resorts', name: 'Orbis Dune Resorts', specialty: 'Desierto costero', tagline: 'Arena, viento y lujo', letter: 'D', beachAffinity: 0.7, costMultiplier: 1.15, demandBonus: 0.1, targets: ['lujo', 'wellness', 'aventura'], minStars: 4, maxStars: 5 },
  { id: 'lagoon', name: 'Orbis Lagoon', specialty: 'Lagunas y bahías', tagline: 'Aguas quietas', letter: 'L', beachAffinity: 0.9, costMultiplier: 1.22, demandBonus: 0.15, targets: ['playa', 'familiar', 'wellness'], minStars: 3, maxStars: 5 },
  { id: 'surf-house', name: 'Orbis Surf House', specialty: 'Surf y lifestyle', tagline: 'Olas primero', letter: 'S', beachAffinity: 0.97, costMultiplier: 0.95, demandBonus: 0.12, targets: ['aventura', 'playa', 'parejas'], minStars: 2, maxStars: 4 },
  { id: 'tide', name: 'Orbis Tide', specialty: 'Boutique costera', tagline: 'Marea alta de diseño', letter: 'T', beachAffinity: 0.88, costMultiplier: 1.1, demandBonus: 0.13, targets: ['parejas', 'lujo', 'playa'], minStars: 3, maxStars: 5 },
  { id: 'horizon-club', name: 'Orbis Horizon Club', specialty: 'Clubs de playa exclusivos', tagline: 'Solo miembros del horizonte', letter: 'H', beachAffinity: 0.94, costMultiplier: 1.5, demandBonus: 0.17, targets: ['lujo', 'parejas'], minStars: 5, maxStars: 5 },
  { id: 'sail', name: 'Orbis Sail', specialty: 'Náutica y yates', tagline: 'Cubierta y suite', letter: 'Y', beachAffinity: 0.91, costMultiplier: 1.32, demandBonus: 0.14, targets: ['lujo', 'aventura', 'negocios'], minStars: 4, maxStars: 5 },
  { id: 'breeze', name: 'Orbis Breeze', specialty: 'Vacaciones familiares playa', tagline: 'Arena para todos', letter: 'B', beachAffinity: 0.93, costMultiplier: 0.9, demandBonus: 0.11, targets: ['familiar', 'playa'], minStars: 2, maxStars: 4 },
  { id: 'cape', name: 'Orbis Cape', specialty: 'Cabos y acantilados', tagline: 'Vistas de faro', letter: 'K', beachAffinity: 0.85, costMultiplier: 1.18, demandBonus: 0.12, targets: ['parejas', 'lujo', 'aventura'], minStars: 3, maxStars: 5 },
  { id: 'reef-lodge', name: 'Orbis Reef Lodge', specialty: 'Ecolodge marino', tagline: 'Lujo con conciencia', letter: 'R', beachAffinity: 0.96, costMultiplier: 1.25, demandBonus: 0.13, targets: ['aventura', 'wellness', 'playa'], minStars: 3, maxStars: 5 },
  { id: 'sunset-inn', name: 'Orbis Sunset Inn', specialty: 'Atardeceres costeros', tagline: 'La hora dorada', letter: 'U', beachAffinity: 0.89, costMultiplier: 1.05, demandBonus: 0.12, targets: ['parejas', 'playa'], minStars: 3, maxStars: 4 },
  { id: 'pearl', name: 'Orbis Pearl', specialty: 'Lujo urbano costero', tagline: 'Perlas de ciudad y mar', letter: 'E', beachAffinity: 0.75, costMultiplier: 1.4, demandBonus: 0.16, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'harbor', name: 'Orbis Harbor', specialty: 'Puertos y waterfront', tagline: 'El puerto como lobby', letter: 'O', beachAffinity: 0.8, costMultiplier: 1.12, demandBonus: 0.11, targets: ['negocios', 'playa', 'familiar'], minStars: 3, maxStars: 5 },
  { id: 'island-house', name: 'Orbis Island House', specialty: 'Casas de isla', tagline: 'Tu isla, tu ritmo', letter: 'I', beachAffinity: 0.98, costMultiplier: 1.38, demandBonus: 0.19, targets: ['lujo', 'parejas', 'playa'], minStars: 4, maxStars: 5 },
  { id: 'coastline', name: 'Orbis Coastline', specialty: 'Cadena costera global', tagline: 'Siempre cerca del mar', letter: 'G', beachAffinity: 0.86, costMultiplier: 1.0, demandBonus: 0.1, targets: ['playa', 'familiar', 'negocios'], minStars: 2, maxStars: 5 },
  { id: 'bayfront', name: 'Orbis Bayfront', specialty: 'Bahías urbanas', tagline: 'Ciudad con marea', letter: 'F', beachAffinity: 0.78, costMultiplier: 1.08, demandBonus: 0.1, targets: ['negocios', 'familiar', 'playa'], minStars: 3, maxStars: 5 },
  { id: 'atlantica', name: 'Orbis Atlantica', specialty: 'Costa atlántica', tagline: 'Océano abierto', letter: 'N', beachAffinity: 0.9, costMultiplier: 1.14, demandBonus: 0.13, targets: ['playa', 'aventura', 'familiar'], minStars: 3, maxStars: 5 },
  { id: 'mediterranea', name: 'Orbis Mediterránea', specialty: 'Estilo mediterráneo', tagline: 'Luz, cal y mar', letter: 'V', beachAffinity: 0.88, costMultiplier: 1.16, demandBonus: 0.15, targets: ['playa', 'parejas', 'familiar'], minStars: 3, maxStars: 5 },
  { id: 'pacific', name: 'Orbis Pacific Rim', specialty: 'Pacífico y atardeceres', tagline: 'Del este al oeste azul', letter: 'W', beachAffinity: 0.92, costMultiplier: 1.2, demandBonus: 0.14, targets: ['playa', 'lujo', 'aventura'], minStars: 3, maxStars: 5 },
  { id: 'caribbean', name: 'Orbis Caribbean Soft', specialty: 'Caribe todo incluido', tagline: 'Ritmo y arena', letter: 'Q', beachAffinity: 0.97, costMultiplier: 1.1, demandBonus: 0.17, targets: ['familiar', 'playa', 'parejas'], minStars: 3, maxStars: 5 },
  { id: 'nordic-fjord', name: 'Orbis Nordic Fjord', specialty: 'Fiordos y costas frías', tagline: 'Agua fría, hospitalidad cálida', letter: 'J', beachAffinity: 0.55, costMultiplier: 1.22, demandBonus: 0.09, targets: ['aventura', 'wellness', 'parejas'], minStars: 3, maxStars: 5 },
  { id: 'alpine-lake', name: 'Orbis Alpine Lake', specialty: 'Lagos de montaña', tagline: 'Espejo de cumbres', letter: 'Z', beachAffinity: 0.25, costMultiplier: 1.18, demandBonus: 0.1, targets: ['wellness', 'parejas', 'aventura'], minStars: 3, maxStars: 5 },
  { id: 'city-grand', name: 'Orbis City Grand', specialty: 'Grandes hoteles urbanos', tagline: 'La ciudad como resort', letter: 'X', beachAffinity: 0.2, costMultiplier: 1.3, demandBonus: 0.12, targets: ['negocios', 'lujo'], minStars: 4, maxStars: 5 },
  { id: 'business-hub', name: 'Orbis Business Hub', specialty: 'Negocios y congresos', tagline: 'Productividad con estilo', letter: 'BH', beachAffinity: 0.15, costMultiplier: 1.05, demandBonus: 0.08, targets: ['negocios'], minStars: 3, maxStars: 5 },
  { id: 'airport-gate', name: 'Orbis Airport Gate', specialty: 'Aeropuertos y escala', tagline: 'Conexión sin fricción', letter: 'AG', beachAffinity: 0.1, costMultiplier: 0.85, demandBonus: 0.06, targets: ['negocios', 'familiar'], minStars: 2, maxStars: 4 },
  { id: 'spa-sanctum', name: 'Orbis Spa Sanctum', specialty: 'Wellness y spa', tagline: 'Silencio terapéutico', letter: 'SS', beachAffinity: 0.45, costMultiplier: 1.35, demandBonus: 0.14, targets: ['wellness', 'lujo', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'family-village', name: 'Orbis Family Village', specialty: 'Resorts familiares', tagline: 'Diversión en bloque', letter: 'FV', beachAffinity: 0.7, costMultiplier: 0.92, demandBonus: 0.11, targets: ['familiar', 'playa'], minStars: 2, maxStars: 4 },
  { id: 'boutique-noir', name: 'Orbis Boutique Noir', specialty: 'Boutique de diseño', tagline: 'Pocas llaves, mucho carácter', letter: 'BN', beachAffinity: 0.4, costMultiplier: 1.25, demandBonus: 0.12, targets: ['lujo', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'heritage', name: 'Orbis Heritage', specialty: 'Edificios históricos', tagline: 'Historia con servicio', letter: 'HE', beachAffinity: 0.3, costMultiplier: 1.42, demandBonus: 0.13, targets: ['lujo', 'parejas', 'negocios'], minStars: 4, maxStars: 5 },
  { id: 'garden', name: 'Orbis Garden Court', specialty: 'Jardines y patios', tagline: 'Verde entre muros', letter: 'GC', beachAffinity: 0.35, costMultiplier: 1.08, demandBonus: 0.1, targets: ['wellness', 'familiar', 'parejas'], minStars: 3, maxStars: 5 },
  { id: 'skyline', name: 'Orbis Skyline', specialty: 'Torres con vista', tagline: 'La ciudad a tus pies', letter: 'SK', beachAffinity: 0.25, costMultiplier: 1.48, demandBonus: 0.15, targets: ['lujo', 'negocios'], minStars: 4, maxStars: 5 },
  { id: 'retreat', name: 'Orbis Retreat', specialty: 'Retiros remotos', tagline: 'Desconectar de verdad', letter: 'RT', beachAffinity: 0.5, costMultiplier: 1.2, demandBonus: 0.11, targets: ['wellness', 'aventura', 'parejas'], minStars: 3, maxStars: 5 },
  { id: 'adventure', name: 'Orbis Adventure Base', specialty: 'Turismo activo', tagline: 'Basecamp con amenidades', letter: 'AB', beachAffinity: 0.55, costMultiplier: 0.95, demandBonus: 0.1, targets: ['aventura', 'familiar'], minStars: 2, maxStars: 4 },
  { id: 'golf-links', name: 'Orbis Golf Links', specialty: 'Golf y resorts', tagline: 'Green y suite', letter: 'GL', beachAffinity: 0.6, costMultiplier: 1.28, demandBonus: 0.12, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'casino-royale', name: 'Orbis Royale', specialty: 'Casino resort', tagline: 'Noche larga, servicio largo', letter: 'RY', beachAffinity: 0.65, costMultiplier: 1.55, demandBonus: 0.16, targets: ['lujo', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'allsuite', name: 'Orbis AllSuite', specialty: 'Solo suites', tagline: 'Cada habitación es suite', letter: 'AS', beachAffinity: 0.5, costMultiplier: 1.45, demandBonus: 0.14, targets: ['lujo', 'negocios', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'select', name: 'Orbis Select', specialty: 'Select service', tagline: 'Esencial, bien hecho', letter: 'SE', beachAffinity: 0.4, costMultiplier: 0.8, demandBonus: 0.07, targets: ['negocios', 'familiar'], minStars: 2, maxStars: 4 },
  { id: 'residence', name: 'Orbis Residence', specialty: 'Estancias largas', tagline: 'Vivir, no solo dormir', letter: 'RS', beachAffinity: 0.35, costMultiplier: 1.02, demandBonus: 0.08, targets: ['negocios', 'familiar'], minStars: 3, maxStars: 5 },
  { id: 'congress', name: 'Orbis Congress', specialty: 'Ferias y eventos', tagline: 'Capacidad y precisión', letter: 'CG', beachAffinity: 0.2, costMultiplier: 1.15, demandBonus: 0.09, targets: ['negocios'], minStars: 3, maxStars: 5 },
  { id: 'art-house', name: 'Orbis Art House', specialty: 'Arte y cultura', tagline: 'Galería con camas', letter: 'AH', beachAffinity: 0.3, costMultiplier: 1.2, demandBonus: 0.11, targets: ['parejas', 'lujo'], minStars: 3, maxStars: 5 },
  { id: 'vineyard', name: 'Orbis Vineyard', specialty: 'Enoturismo', tagline: 'Cosecha y descanso', letter: 'VN', beachAffinity: 0.2, costMultiplier: 1.18, demandBonus: 0.12, targets: ['parejas', 'lujo', 'wellness'], minStars: 3, maxStars: 5 },
  { id: 'thermal', name: 'Orbis Thermal', specialty: 'Termas y balnearios', tagline: 'Agua mineral, mente clara', letter: 'TH', beachAffinity: 0.15, costMultiplier: 1.3, demandBonus: 0.13, targets: ['wellness', 'lujo'], minStars: 4, maxStars: 5 },
  { id: 'safari-coast', name: 'Orbis Safari Coast', specialty: 'Safari + costa', tagline: 'Sabana y marea', letter: 'SC', beachAffinity: 0.8, costMultiplier: 1.35, demandBonus: 0.15, targets: ['aventura', 'lujo', 'playa'], minStars: 4, maxStars: 5 },
  { id: 'polar-light', name: 'Orbis Polar Light', specialty: 'Auroras y costas boreales', tagline: 'Noche blanca, servicio dorado', letter: 'PL', beachAffinity: 0.4, costMultiplier: 1.4, demandBonus: 0.12, targets: ['aventura', 'parejas', 'lujo'], minStars: 4, maxStars: 5 },
  { id: 'jungle-canopy', name: 'Orbis Jungle Canopy', specialty: 'Selva y eco-turismo', tagline: 'Dosel y hospitalidad', letter: 'JC', beachAffinity: 0.35, costMultiplier: 1.22, demandBonus: 0.11, targets: ['aventura', 'wellness'], minStars: 3, maxStars: 5 },
  { id: 'desert-mirage', name: 'Orbis Desert Mirage', specialty: 'Desierto de lujo', tagline: 'Oasis de precisión', letter: 'DM', beachAffinity: 0.1, costMultiplier: 1.38, demandBonus: 0.13, targets: ['lujo', 'wellness', 'parejas'], minStars: 4, maxStars: 5 },
  { id: 'world-collection', name: 'Orbis World Collection', specialty: 'Colección global insignia', tagline: 'La firma de Orbis', letter: 'WC', beachAffinity: 0.7, costMultiplier: 1.6, demandBonus: 0.2, targets: ['lujo', 'playa', 'negocios', 'parejas'], minStars: 5, maxStars: 5 },
]

export const SUBSIDIARIES: Subsidiary[] = specs.map((s, i) => {
  const [color, accent] = palette[i % palette.length]
  return { ...s, color, accent }
})

export function getSubsidiary(id: string): Subsidiary | undefined {
  return SUBSIDIARIES.find((s) => s.id === id)
}

export function subsidiaryLogoSvg(sub: Subsidiary, size = 64): string {
  const { color, accent, letter, name } = sub
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>
  <text x="32" y="38" text-anchor="middle" font-family="Georgia, serif" font-size="${letter.length > 1 ? 16 : 22}" font-weight="700" fill="#F7F3EA">${letter}</text>
  <title>${name}</title>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function hotelPlaceholderImage(sub: Subsidiary, name: string): string {
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
  <rect x="250" y="190" width="70" height="50" fill="${sub.color}" opacity="0.35"/>
  <rect x="340" y="190" width="70" height="50" fill="${sub.color}" opacity="0.35"/>
  <rect x="430" y="190" width="70" height="50" fill="${sub.color}" opacity="0.35"/>
  <rect x="520" y="190" width="30" height="50" fill="${sub.color}" opacity="0.35"/>
  <rect x="250" y="260" width="70" height="50" fill="${sub.color}" opacity="0.28"/>
  <rect x="340" y="260" width="70" height="50" fill="${sub.color}" opacity="0.28"/>
  <rect x="430" y="260" width="70" height="50" fill="${sub.color}" opacity="0.28"/>
  <rect x="375" y="310" width="50" height="70" fill="${sub.accent}"/>
  <text x="400" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#F7F3EA">${escapeXml(sub.name)}</text>
  <text x="400" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#F7F3EA" opacity="0.85">${escapeXml(name || 'Nuevo hotel')}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
