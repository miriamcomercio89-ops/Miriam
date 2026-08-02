import type { Subsidiary } from '../types'

/** Hash estable 0–1 a partir del id de marca */
function hash01(id: string, salt = 0): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10_000) / 10_000
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

/** Motivos elaborados “generativos” según tipo de marca + variación por id */
function elaborateMotif(sub: Subsidiary): string {
  const { id, imageStyle, accent, color } = sub
  const a = accent
  const c = color
  const v = hash01(id, 1)
  const v2 = hash01(id, 2)
  const v3 = hash01(id, 3)
  const rot = Math.round((v - 0.5) * 18)
  const shift = Math.round((v2 - 0.5) * 10)

  switch (imageStyle) {
    case 'coast':
      return `
        <g opacity="0.95">
          <ellipse cx="${88 + shift}" cy="${32 + Math.round(v3 * 8)}" rx="16" ry="16" fill="${a}" opacity="0.28"/>
          <ellipse cx="${88 + shift}" cy="${32 + Math.round(v3 * 8)}" rx="9" ry="9" fill="#F7F3EA" opacity="0.35"/>
          <path d="M10 92 C28 ${70 - rot}, 48 ${58 + rot}, 64 ${62 + shift}, 80 ${66 - rot}, 100 ${78}, 118 94"
            fill="none" stroke="${a}" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M14 84 C34 ${62 - rot}, 52 54, 66 ${56 + shift}, 84 60, 102 72, 116 86"
            fill="none" stroke="#F7F3EA" stroke-width="2.2" opacity="0.45" stroke-linecap="round"/>
          <path d="M8 100 C30 88, 50 84, 70 86, 92 90, 108 96, 122 104"
            fill="none" stroke="${a}" stroke-width="2.8" opacity="0.55" stroke-linecap="round"/>
          <path d="M22 74 Q40 52 58 68 Q72 80 90 58" fill="none" stroke="${a}" stroke-width="1.6" opacity="0.4"/>
          <circle cx="${40 + shift}" cy="48" r="2.2" fill="#F7F3EA" opacity="0.5"/>
          <circle cx="${72 - shift}" cy="42" r="1.6" fill="#F7F3EA" opacity="0.4"/>
          <path d="M48 38 L52 46 L60 47 L54 52 L56 60 L48 55 L40 60 L42 52 L36 47 L44 46 Z"
            fill="${a}" opacity="${0.25 + v * 0.25}" transform="translate(${shift * 0.4} ${-v3 * 6}) scale(${0.55 + v2 * 0.2})"/>
        </g>`

    case 'urban': {
      const h1 = 38 + Math.round(v * 14)
      const h2 = 22 + Math.round(v2 * 18)
      const h3 = 48 + Math.round(v3 * 12)
      return `
        <g transform="translate(${shift * 0.3} 0)">
          <rect x="18" y="${128 - 20 - h1}" width="22" height="${h1}" rx="2.5" fill="${a}" opacity="0.92"/>
          <rect x="44" y="${128 - 20 - h2}" width="28" height="${h2}" rx="2.5" fill="${a}" opacity="0.72"/>
          <rect x="76" y="${128 - 20 - h3}" width="18" height="${h3}" rx="2.5" fill="${a}" opacity="0.55"/>
          <rect x="98" y="${128 - 20 - (h1 - 8)}" width="14" height="${h1 - 8}" rx="2" fill="${c}" opacity="0.45"/>
          ${[0, 1, 2, 3, 4].map((row) =>
            [0, 1].map((col) =>
              `<rect x="${22 + col * 8}" y="${128 - 28 - h1 + 10 + row * 10}" width="5" height="5" rx="0.8" fill="#F7F3EA" opacity="${0.2 + v * 0.25}"/>`,
            ).join(''),
          ).join('')}
          ${[0, 1, 2, 3, 4, 5].map((row) =>
            [0, 1, 2].map((col) =>
              `<rect x="${48 + col * 8}" y="${128 - 28 - h2 + 8 + row * 9}" width="5" height="5" rx="0.8" fill="#F7F3EA" opacity="${0.15 + v2 * 0.2}"/>`,
            ).join(''),
          ).join('')}
          <path d="M18 108 H112" stroke="#F7F3EA" stroke-width="1.5" opacity="0.2"/>
          <circle cx="${104 + shift * 0.2}" cy="${28 + v3 * 10}" r="7" fill="${a}" opacity="0.25"/>
          <path d="M44 ${128 - 20 - h2} L58 ${128 - 20 - h2 - 10} L72 ${128 - 20 - h2}" fill="none" stroke="${a}" stroke-width="2" opacity="0.5"/>
        </g>`
    }

    case 'nature':
      return `
        <g>
          <path d="M64 ${96 + shift * 0.2} C48 78, 36 ${50 + rot}, 64 ${22 + v * 8} C92 ${50 + rot}, 80 78, 64 ${96 + shift * 0.2} Z"
            fill="${a}" opacity="0.82"/>
          <path d="M64 94 C54 78, 46 58, 64 36 C82 58, 74 78, 64 94 Z" fill="#F7F3EA" opacity="0.16"/>
          <path d="M40 88 C28 70, 34 48, 52 58 C44 72, 46 82, 40 88 Z" fill="${a}" opacity="0.55"/>
          <path d="M88 88 C100 70, 94 48, 76 58 C84 72, 82 82, 88 88 Z" fill="${a}" opacity="0.5"/>
          <rect x="60" y="90" width="8" height="18" rx="1.5" fill="${c}" opacity="0.7"/>
          <circle cx="${36 + shift}" cy="${40 + v * 10}" r="3" fill="${a}" opacity="0.45"/>
          <circle cx="${92 - shift}" cy="${36 + v2 * 12}" r="2.4" fill="#F7F3EA" opacity="0.35"/>
          <path d="M20 102 Q64 88 108 102" fill="none" stroke="${a}" stroke-width="2" opacity="0.35"/>
        </g>`

    case 'luxury':
      return `
        <g transform="rotate(${rot * 0.4} 64 64)">
          <circle cx="64" cy="68" r="28" fill="none" stroke="${a}" stroke-width="2.2" opacity="0.55"/>
          <circle cx="64" cy="68" r="20" fill="none" stroke="${a}" stroke-width="3.5"/>
          <circle cx="64" cy="68" r="11" fill="${a}" opacity="0.32"/>
          <circle cx="64" cy="68" r="4.5" fill="#F7F3EA" opacity="0.55"/>
          <polygon points="64,18 68,40 64,36 60,40" fill="${a}"/>
          <polygon points="64,18 70,42 64,37 58,42" fill="${a}" opacity="0.45"/>
          <circle cx="64" cy="18" r="3.2" fill="${a}"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const ang = (i / 8) * Math.PI * 2 + v * 0.4
            const x = 64 + Math.cos(ang) * 34
            const y = 68 + Math.sin(ang) * 34
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" fill="${a}" opacity="${0.35 + (i % 2) * 0.2}"/>`
          }).join('')}
          <path d="M42 92 Q64 104 86 92" fill="none" stroke="${a}" stroke-width="1.8" opacity="0.45"/>
        </g>`

    case 'family':
      return `
        <g>
          <circle cx="${42 + shift * 0.5}" cy="50" r="15" fill="${a}" opacity="0.95"/>
          <circle cx="${86 - shift * 0.5}" cy="50" r="15" fill="${a}" opacity="0.7"/>
          <circle cx="64" cy="78" r="18" fill="${a}" opacity="0.88"/>
          <circle cx="${42 + shift * 0.5}" cy="46" r="4.5" fill="#F7F3EA" opacity="0.4"/>
          <circle cx="${86 - shift * 0.5}" cy="46" r="4.5" fill="#F7F3EA" opacity="0.32"/>
          <circle cx="64" cy="72" r="5" fill="#F7F3EA" opacity="0.38"/>
          <path d="M28 96 Q64 112 100 96" fill="none" stroke="${a}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>
          <circle cx="${64 + shift}" cy="${28 + v * 8}" r="6" fill="${a}" opacity="0.35"/>
          <path d="M58 ${28 + v * 8} Q64 ${18 + v2 * 6} 70 ${28 + v * 8}" fill="none" stroke="#F7F3EA" stroke-width="1.5" opacity="0.5"/>
          <rect x="30" y="100" width="68" height="6" rx="3" fill="${a}" opacity="0.25"/>
        </g>`

    default: // adventure
      return `
        <g transform="translate(0 ${shift * 0.2})">
          <path d="M16 98 L44 ${48 - rot} L64 78 L84 ${36 + rot} L112 98 Z"
            fill="none" stroke="${a}" stroke-width="4" stroke-linejoin="round"/>
          <path d="M28 98 L44 ${62 - rot * 0.5} L58 86 L76 ${52 + rot * 0.4} L100 98 Z"
            fill="${a}" opacity="0.28"/>
          <path d="M64 98 L78 70 L92 98 Z" fill="${a}" opacity="0.45"/>
          <circle cx="${96 + shift * 0.3}" cy="${30 + v * 10}" r="8" fill="${a}" opacity="0.3"/>
          <path d="M20 104 H108" stroke="#F7F3EA" stroke-width="1.5" opacity="0.25"/>
          <path d="M50 44 L54 52 L62 53 L56 58 L58 66 L50 61 L42 66 L44 58 L38 53 L46 52 Z"
            fill="#F7F3EA" opacity="${0.35 + v2 * 0.3}" transform="scale(${0.7 + v3 * 0.25}) translate(${10 + shift} ${-8})"/>
        </g>`
  }
}

function frameOrnament(sub: Subsidiary): string {
  const { accent: a, id, imageStyle } = sub
  const v = hash01(id, 7)
  if (imageStyle === 'luxury' || imageStyle === 'coast') {
    return `
      <path d="M20 20 H36" stroke="${a}" stroke-width="2" opacity="0.55"/>
      <path d="M92 20 H108" stroke="${a}" stroke-width="2" opacity="0.55"/>
      <path d="M20 108 H36" stroke="${a}" stroke-width="2" opacity="0.45"/>
      <path d="M92 108 H108" stroke="${a}" stroke-width="2" opacity="0.45"/>
      <circle cx="20" cy="20" r="2.2" fill="${a}" opacity="0.7"/>
      <circle cx="108" cy="20" r="2.2" fill="${a}" opacity="0.7"/>
      <circle cx="20" cy="108" r="2.2" fill="${a}" opacity="0.55"/>
      <circle cx="108" cy="108" r="2.2" fill="${a}" opacity="0.55"/>
      <path d="M64 8 Q${68 + v * 4} 14 64 18 Q${60 - v * 4} 14 64 8" fill="${a}" opacity="0.4"/>`
  }
  if (imageStyle === 'urban') {
    return `<rect x="16" y="16" width="96" height="96" rx="8" fill="none" stroke="${a}" stroke-width="1.2" opacity="0.25" stroke-dasharray="4 3"/>`
  }
  return `<circle cx="64" cy="64" r="52" fill="none" stroke="${a}" stroke-width="1" opacity="0.18"/>`
}

/**
 * Logo elaborativo por filial: composición generativa según imageStyle
 * (costa, urbano, naturaleza, lujo, familia, aventura) + variación por id.
 */
export function buildSubsidiaryLogoSvg(sub: Subsidiary, size = 128): string {
  const { color, accent, letter, name, id } = sub
  const uid = id.replace(/[^a-z0-9]/gi, '')
  const fontSize = letter.length > 1 ? 22 : 34
  const letterY = letter.length > 1 ? 108 : 106
  const v = hash01(id, 9)
  const gradAngle = v > 0.5

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img">
  <defs>
    <linearGradient id="bg_${uid}" x1="${gradAngle ? 0 : 1}" y1="0" x2="${gradAngle ? 1 : 0}" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="48%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.72"/>
    </linearGradient>
    <radialGradient id="glow_${uid}" cx="32%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </radialGradient>
    <linearGradient id="rim_${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F7F3EA" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="${accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#F7F3EA" stop-opacity="0.35"/>
    </linearGradient>
    <filter id="soft_${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="128" height="128" rx="30" fill="url(#bg_${uid})"/>
  <rect width="128" height="128" rx="30" fill="url(#glow_${uid})"/>
  <rect x="5.5" y="5.5" width="117" height="117" rx="26" fill="none" stroke="url(#rim_${uid})" stroke-width="2.8"/>
  <rect x="12" y="12" width="104" height="104" rx="22" fill="none" stroke="#F7F3EA" stroke-width="0.9" opacity="0.18"/>
  ${frameOrnament(sub)}
  <g filter="url(#soft_${uid})" opacity="0.98">
    ${elaborateMotif(sub)}
  </g>
  <rect x="22" y="${letterY - 18}" width="84" height="22" rx="11" fill="${color}" opacity="0.42"/>
  <text x="64" y="${letterY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}" font-weight="700" fill="#F7F3EA" letter-spacing="0.06em">${letter}</text>
  <title>${name}</title>
</svg>`

  return svg
}

export function subsidiaryLogoDataUrl(sub: Subsidiary, size = 128): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildSubsidiaryLogoSvg(sub, size))}`
}

export function logoComplexityHint(style: Subsidiary['imageStyle']): string {
  switch (style) {
    case 'coast':
      return 'olas, horizonte y sol'
    case 'urban':
      return 'skyline y ventanas'
    case 'nature':
      return 'dosel / montaña vegetal'
    case 'luxury':
      return 'sello y corona'
    case 'family':
      return 'figuras y arco'
    default:
      return 'cumbres y estrella'
  }
}

export function pickLogoScale(size: number): number {
  return clamp(size, 48, 1024)
}
