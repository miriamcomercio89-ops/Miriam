import type { Subsidiary } from '../types'

export type GalleryMood = 'day' | 'dusk' | 'night' | 'aerial' | 'storm' | 'sunny' | 'winter' | 'spring'

export function galleryImages(sub: Subsidiary, hotelName: string, climateHint = ''): string[] {
  const moods: GalleryMood[] = climateMoods(climateHint || sub.imageStyle)
  return moods.map((mood) => renderScene(sub, hotelName, mood, climateHint))
}

function climateMoods(hint: string): GalleryMood[] {
  const h = hint.toLowerCase()
  if (h.includes('arctic') || h.includes('winter') || h.includes('cold') || h.includes('nord')) {
    return ['winter', 'day', 'dusk', 'night', 'aerial', 'sunny', 'storm', 'spring']
  }
  if (
    h.includes('tropic') ||
    h.includes('coast') ||
    h.includes('beach') ||
    h.includes('warm') ||
    h.includes('caribbean') ||
    h.includes('med') ||
    h.includes('seasia')
  ) {
    return ['sunny', 'day', 'dusk', 'aerial', 'night', 'storm', 'spring', 'winter']
  }
  if (h.includes('desert') || h.includes('mideast') || h.includes('arid')) {
    return ['sunny', 'dusk', 'day', 'night', 'aerial', 'storm', 'spring', 'winter']
  }
  if (h.includes('urban') || h.includes('city')) {
    return ['day', 'dusk', 'night', 'aerial', 'storm', 'sunny', 'spring', 'winter']
  }
  if (h.includes('nature') || h.includes('adventure') || h.includes('forest')) {
    return ['spring', 'day', 'dusk', 'aerial', 'sunny', 'storm', 'night', 'winter']
  }
  if (h.includes('luxury') || h.includes('premium')) {
    return ['dusk', 'night', 'day', 'aerial', 'sunny', 'spring', 'storm', 'winter']
  }
  if (h.includes('family')) {
    return ['sunny', 'day', 'spring', 'dusk', 'aerial', 'night', 'storm', 'winter']
  }
  return ['day', 'dusk', 'night', 'aerial', 'sunny', 'storm', 'spring', 'winter']
}

function blendHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace('#', ''), 16)
  const pb = parseInt(b.replace('#', ''), 16)
  const ar = (pa >> 16) & 255
  const ag = (pa >> 8) & 255
  const ab = pa & 255
  const br = (pb >> 16) & 255
  const bg = (pb >> 8) & 255
  const bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

function climateSkyShift(climate: string, mood: GalleryMood): [string, string] | null {
  const c = climate.toLowerCase()
  if (c.includes('tropic') || c.includes('caribbean') || c.includes('seasia') || c.includes('coast')) {
    if (mood === 'sunny' || mood === 'day') return ['#2E8BC0', '#F0C27A']
    if (mood === 'dusk') return ['#0B3A4A', '#E07A3A']
  }
  if (c.includes('arctic') || c.includes('winter') || c.includes('cold') || c.includes('nord')) {
    if (mood === 'day' || mood === 'winter') return ['#A8C4D8', '#E8F0F6']
    if (mood === 'dusk') return ['#3A4A5C', '#8FA0B2']
  }
  if (c.includes('desert') || c.includes('mideast') || c.includes('arid')) {
    if (mood === 'sunny' || mood === 'day') return ['#C4A35A', '#E8D5A8']
    if (mood === 'dusk') return ['#4A2F1A', '#C47B4A']
  }
  if (c.includes('med')) {
    if (mood === 'sunny' || mood === 'day') return ['#4A90A4', '#E8C97A']
  }
  return null
}

function renderScene(sub: Subsidiary, hotelName: string, mood: GalleryMood, climateHint = ''): string {
  const skies: Record<GalleryMood, [string, string, string]> = {
    day: [sub.color, blendHex(sub.color, '#3D6F86', 0.55), sub.accent],
    dusk: [blendHex(sub.color, '#1B2A41', 0.7), '#C47B4A', sub.accent],
    night: ['#070D16', blendHex(sub.color, '#1A3348', 0.5), sub.accent],
    aerial: ['#87A8B8', sub.color, '#D9C7A0'],
    storm: ['#2A3340', '#4A5564', '#6B7C8A'],
    sunny: [blendHex(sub.color, '#4FA3C7', 0.4), '#F2D083', sub.accent],
    winter: ['#D7E4EE', '#8FA9BC', '#F7F3EA'],
    spring: [blendHex(sub.color, '#6FAE8A', 0.45), '#C7D9A0', sub.accent],
  }
  let [c1, c2, c3] = skies[mood]
  const shift = climateSkyShift(climateHint || sub.imageStyle, mood)
  if (shift) {
    c1 = blendHex(c1, shift[0], 0.45)
    c2 = blendHex(c2, shift[1], 0.4)
  }
  const style = sub.imageStyle
  const weatherFx =
    mood === 'storm'
      ? `<path d="M120 80 L140 160 M200 60 L210 150 M520 70 L540 155" stroke="#F7F3EA" stroke-width="2" opacity="0.35"/>`
      : mood === 'sunny'
        ? `<circle cx="680" cy="90" r="46" fill="#F7E7A0" opacity="0.85"/><circle cx="680" cy="90" r="70" fill="#F7E7A0" opacity="0.18"/>`
        : mood === 'winter'
          ? `<circle cx="160" cy="120" r="3" fill="#fff" opacity="0.8"/><circle cx="300" cy="90" r="2" fill="#fff" opacity="0.7"/><circle cx="520" cy="130" r="2.5" fill="#fff" opacity="0.75"/><circle cx="420" cy="70" r="2" fill="#fff" opacity="0.65"/>`
          : mood === 'spring'
            ? `<circle cx="180" cy="360" r="8" fill="#E8A0B0" opacity="0.55"/><circle cx="620" cy="340" r="10" fill="#E8A0B0" opacity="0.45"/><circle cx="260" cy="380" r="6" fill="${sub.accent}" opacity="0.4"/>`
            : ''

  const brandBadge = `<rect x="24" y="420" width="120" height="36" rx="8" fill="${sub.color}" opacity="0.92"/>
    <text x="84" y="443" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#F7F3EA">${esc(sub.letter)}</text>`

  const extra =
    style === 'coast'
      ? `<ellipse cx="400" cy="460" rx="420" ry="90" fill="${c3}" opacity="0.55"/>
         <path d="M0 390 Q200 350 400 390 T800 390 L800 500 L0 500Z" fill="#1a4a5c" opacity="0.45"/>
         <path d="M0 410 Q250 380 500 415 T800 405" fill="none" stroke="#F7F3EA" stroke-width="2" opacity="0.25"/>`
      : style === 'urban'
        ? `<rect x="120" y="140" width="70" height="260" fill="#F7F3EA" opacity="0.5"/>
           <rect x="210" y="100" width="90" height="300" fill="#F7F3EA" opacity="0.65"/>
           <rect x="520" y="120" width="80" height="280" fill="#F7F3EA" opacity="0.55"/>
           <rect x="610" y="160" width="55" height="240" fill="${sub.accent}" opacity="0.35"/>`
        : style === 'nature'
          ? `<path d="M0 420 L120 260 L220 420Z" fill="#1B4D3E" opacity="0.5"/>
             <path d="M180 420 L320 200 L460 420Z" fill="#245C48" opacity="0.45"/>
             <path d="M500 420 L640 240 L780 420Z" fill="#1B4D3E" opacity="0.5"/>
             <ellipse cx="400" cy="430" rx="280" ry="40" fill="${sub.accent}" opacity="0.15"/>`
          : style === 'luxury'
            ? `<rect x="250" y="150" width="300" height="200" rx="6" fill="#F7F3EA" opacity="0.9"/>
               <rect x="280" y="180" width="240" height="20" fill="${c3}" opacity="0.7"/>
               <rect x="360" y="280" width="80" height="70" fill="${c3}"/>
               <rect x="300" y="220" width="200" height="4" fill="${sub.color}" opacity="0.5"/>`
            : style === 'family'
              ? `<circle cx="160" cy="420" r="40" fill="${c3}" opacity="0.4"/>
                 <circle cx="640" cy="400" r="55" fill="${c3}" opacity="0.35"/>
                 <rect x="260" y="180" width="280" height="200" rx="10" fill="#F7F3EA" opacity="0.88"/>
                 <circle cx="400" cy="250" r="28" fill="${sub.color}" opacity="0.25"/>`
              : `<path d="M100 400 L250 220 L400 400Z" fill="#2C3E50" opacity="0.45"/>
                 <path d="M350 400 L520 180 L700 400Z" fill="#1A2F4A" opacity="0.4"/>
                 <rect x="360" y="260" width="80" height="120" fill="${sub.accent}" opacity="0.3"/>`

  const building =
    mood === 'aerial'
      ? `<rect x="300" y="200" width="200" height="140" rx="8" fill="#F7F3EA" opacity="0.9" transform="rotate(-8 400 270)"/>
         <rect x="330" y="230" width="40" height="30" fill="${sub.color}" opacity="0.4"/>`
      : `<rect x="240" y="170" width="320" height="210" rx="8" fill="#F7F3EA" opacity="0.92"/>
         <rect x="270" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="350" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="430" y="200" width="60" height="40" fill="${sub.color}" opacity="0.35"/>
         <rect x="370" y="300" width="50" height="80" fill="${c3}"/>
         <rect x="250" y="165" width="300" height="8" fill="${sub.accent}" opacity="0.55"/>`

  const climateTag = (climateHint || sub.imageStyle || '').slice(0, 24)

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
  ${brandBadge}
  <text x="400" y="56" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#F7F3EA">${esc(sub.name)}</text>
  <text x="400" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#F7F3EA" opacity="0.9">${esc(hotelName || 'Nuevo hotel')} · ${mood}${climateTag ? ` · ${esc(climateTag)}` : ''}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
