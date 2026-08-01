import type { Subsidiary } from '../types'

export function galleryImages(sub: Subsidiary, hotelName: string): string[] {
  return [
    renderScene(sub, hotelName, 'day'),
    renderScene(sub, hotelName, 'dusk'),
    renderScene(sub, hotelName, 'night'),
    renderScene(sub, hotelName, 'aerial'),
  ]
}

function renderScene(sub: Subsidiary, hotelName: string, mood: 'day' | 'dusk' | 'night' | 'aerial'): string {
  const skies: Record<string, [string, string, string]> = {
    day: [sub.color, '#3D6F86', sub.accent],
    dusk: ['#1B2A41', '#C47B4A', sub.accent],
    night: ['#070D16', '#1A3348', sub.accent],
    aerial: ['#87A8B8', sub.color, '#D9C7A0'],
  }
  const [c1, c2, c3] = skies[mood]
  const style = sub.imageStyle
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
