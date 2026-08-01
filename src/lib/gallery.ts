import type { Subsidiary } from '../types'

export type GalleryMood = 'day' | 'dusk' | 'night' | 'aerial' | 'storm' | 'sunny' | 'winter' | 'spring'

export function galleryImages(sub: Subsidiary, hotelName: string, climateHint = ''): string[] {
  const moods: GalleryMood[] = climateMoods(climateHint || sub.imageStyle)
  return moods.map((mood) => renderScene(sub, hotelName, mood))
}

function climateMoods(hint: string): GalleryMood[] {
  const h = hint.toLowerCase()
  if (h.includes('arctic') || h.includes('winter') || h.includes('cold')) {
    return ['winter', 'day', 'dusk', 'night', 'aerial', 'sunny', 'storm', 'spring']
  }
  if (h.includes('tropic') || h.includes('coast') || h.includes('beach') || h.includes('warm')) {
    return ['sunny', 'day', 'dusk', 'aerial', 'night', 'storm', 'spring', 'winter']
  }
  if (h.includes('urban')) {
    return ['day', 'dusk', 'night', 'aerial', 'storm', 'sunny', 'spring', 'winter']
  }
  if (h.includes('nature') || h.includes('adventure')) {
    return ['spring', 'day', 'dusk', 'aerial', 'sunny', 'storm', 'night', 'winter']
  }
  if (h.includes('luxury')) {
    return ['dusk', 'night', 'day', 'aerial', 'sunny', 'spring', 'storm', 'winter']
  }
  return ['day', 'dusk', 'night', 'aerial', 'sunny', 'storm', 'spring', 'winter']
}

function renderScene(sub: Subsidiary, hotelName: string, mood: GalleryMood): string {
  const skies: Record<GalleryMood, [string, string, string]> = {
    day: [sub.color, '#3D6F86', sub.accent],
    dusk: ['#1B2A41', '#C47B4A', sub.accent],
    night: ['#070D16', '#1A3348', sub.accent],
    aerial: ['#87A8B8', sub.color, '#D9C7A0'],
    storm: ['#2A3340', '#4A5564', '#6B7C8A'],
    sunny: ['#4FA3C7', '#F2D083', sub.accent],
    winter: ['#D7E4EE', '#8FA9BC', '#F7F3EA'],
    spring: ['#6FAE8A', '#C7D9A0', sub.accent],
  }
  const [c1, c2, c3] = skies[mood]
  const style = sub.imageStyle
  const weatherFx =
    mood === 'storm'
      ? `<path d="M120 80 L140 160 M200 60 L210 150 M520 70 L540 155" stroke="#F7F3EA" stroke-width="2" opacity="0.35"/>`
      : mood === 'sunny'
        ? `<circle cx="680" cy="90" r="46" fill="#F7E7A0" opacity="0.85"/>`
        : mood === 'winter'
          ? `<circle cx="160" cy="120" r="3" fill="#fff" opacity="0.8"/><circle cx="300" cy="90" r="2" fill="#fff" opacity="0.7"/><circle cx="520" cy="130" r="2.5" fill="#fff" opacity="0.75"/>`
          : mood === 'spring'
            ? `<circle cx="180" cy="360" r="8" fill="#E8A0B0" opacity="0.55"/><circle cx="620" cy="340" r="10" fill="#E8A0B0" opacity="0.45"/>`
            : ''

  const extra =
    style === 'coast'
      ? `<ellipse cx="400" cy="460" rx="420" ry="90" fill="${c3}" opacity="0.55"/>
         <path d="M0 390 Q200 350 400 390 T800 390 L800 500 L0 500Z" fill="#1a4a5c" opacity="0.45"/>`
      : style === 'urban'
        ? `<rect x="120" y="140" width="70" height="260" fill="#F7F3EA" opacity="0.5"/>
           <rect x="210" y="100" width="90" height="300" fill="#F7F3EA" opacity="0.65"/>
           <rect x="520" y="120" width="80" height="280" fill="#F7F3EA" opacity="0.55"/>`
        : style === 'nature'
          ? `<path d="M0 420 L120 260 L220 420Z" fill="#1B4D3E" opacity="0.5"/>
             <path d="M180 420 L320 200 L460 420Z" fill="#245C48" opacity="0.45"/>
             <path d="M500 420 L640 240 L780 420Z" fill="#1B4D3E" opacity="0.5"/>`
          : style === 'luxury'
            ? `<rect x="250" y="150" width="300" height="200" rx="6" fill="#F7F3EA" opacity="0.9"/>
               <rect x="280" y="180" width="240" height="20" fill="${c3}" opacity="0.7"/>
               <rect x="360" y="280" width="80" height="70" fill="${c3}"/>`
            : style === 'family'
              ? `<circle cx="160" cy="420" r="40" fill="${c3}" opacity="0.4"/>
                 <circle cx="640" cy="400" r="55" fill="${c3}" opacity="0.35"/>
                 <rect x="260" y="180" width="280" height="200" rx="10" fill="#F7F3EA" opacity="0.88"/>`
              : `<path d="M100 400 L250 220 L400 400Z" fill="#2C3E50" opacity="0.45"/>
                 <path d="M350 400 L520 180 L700 400Z" fill="#1A2F4A" opacity="0.4"/>`

  const building =
    mood === 'aerial'
      ? `<rect x="300" y="200" width="200" height="140" rx="8" fill="#F7F3EA" opacity="0.9" transform="rotate(-8 400 270)"/>`
      : `<rect x="240" y="170" width="320" height="210" rx="8" fill="#F7F3EA" opacity="0.92"/>
         <rect x="270" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="350" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="430" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="370" y="300" width="50" height="80" fill="${c3}"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky)"/>
  ${weatherFx}
  ${extra}
  ${building}
  <text x="400" y="56" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#F7F3EA">${esc(sub.name)}</text>
  <text x="400" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#F7F3EA" opacity="0.9">${esc(hotelName || 'Nuevo hotel')} · ${mood}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
