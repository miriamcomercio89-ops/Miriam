/** Iconos de producto (SVG procedural por categoría + hash del id) */
window.IM = window.IM || {};

IM.Icons = {
  categoryColor: {
    minerales: '#8B7355',
    agricolas: '#5B8C3E',
    energia: '#E6A817',
    residuos: '#6B7280',
    metales: '#94A3B8',
    quimicos: '#7C3AED',
    farmaceuticos: '#0EA5E9',
    construccion: '#D97706',
    textiles: '#EC4899',
    electronica: '#2563EB',
    mecanicos: '#475569',
    alimentacion: '#F59E0B',
    embalaje: '#A16207',
    bienes_capital: '#0F766E',
    papel: '#F8FAFC',
    agroquimicos: '#65A30D',
    consumo: '#F43F5E',
    naval: '#1D4ED8',
    aeroespacial: '#4F46E5',
    mobiliario: '#B45309',
    cosmetica: '#DB2777',
    juguetes: '#F97316',
    deportes: '#16A34A',
    joyeria: '#CA8A04',
    ceramica_arte: '#C026D3',
    vitivinicultura: '#9F1239',
    corcho_iberico: '#92400E',
    biotecnologia: '#059669',
    renovables_eq: '#65A30D',
    software_ind: '#4F46E5',
    agua_tratamiento: '#0284C7',
    optica_iluminacion: '#FBBF24',
    ferroviario: '#334155',
    seguridad_ind: '#DC2626',
    hogar_smart: '#7C3AED',
    instrumentos: '#0D9488',
  },

  categoryGlyph: {
    minerales: '◆',
    agricolas: '❀',
    energia: '⚡',
    residuos: '♻',
    metales: '▣',
    quimicos: '⚗',
    farmaceuticos: '✚',
    construccion: '⌂',
    textiles: '≋',
    electronica: '▣',
    mecanicos: '⚙',
    alimentacion: '♨',
    embalaje: '▢',
    bienes_capital: '🏭',
    papel: '▤',
    agroquimicos: '⚘',
    consumo: '★',
    naval: '⚓',
    aeroespacial: '✈',
    mobiliario: '🪑',
    cosmetica: '✦',
    juguetes: '♟',
    deportes: '⚽',
    joyeria: '◈',
    ceramica_arte: '◌',
    vitivinicultura: '🍇',
    corcho_iberico: '🪵',
    biotecnologia: '🧬',
    renovables_eq: '☀',
    software_ind: '⌘',
    agua_tratamiento: '💧',
    optica_iluminacion: '💡',
    ferroviario: '🚆',
    seguridad_ind: '⛨',
    hogar_smart: '⌂',
    instrumentos: '⌖',
  },

  hash(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  colorFor(item) {
    const base = this.categoryColor[item?.category] || '#64748B';
    const h = this.hash(item?.id || item?.name || '');
    const shift = (h % 40) - 20;
    return this.shiftHue(base, shift);
  },

  shiftHue(hex, deg) {
    // simple lightness tweak
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    const f = 1 + deg / 200;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  },

  svg(item, size = 40) {
    const color = this.colorFor(item);
    const glyph = this.categoryGlyph[item?.category] || '•';
    const h = this.hash(item?.id || '');
    const variant = h % 4;
    const bg2 = this.shiftHue(color, 30);
    let shape = '';
    if (variant === 0) {
      shape = `<circle cx="20" cy="20" r="16" fill="${color}"/>`;
    } else if (variant === 1) {
      shape = `<rect x="4" y="4" width="32" height="32" rx="8" fill="${color}"/>`;
    } else if (variant === 2) {
      shape = `<polygon points="20,3 37,37 3,37" fill="${color}"/>`;
    } else {
      shape = `<rect x="6" y="6" width="28" height="28" rx="4" fill="${color}" transform="rotate(12 20 20)"/>`;
    }
    const gid = `g${this.hash(item?.id || 'x').toString(16)}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${bg2}"/>
      </linearGradient></defs>
      <rect width="40" height="40" rx="10" fill="url(#${gid})"/>
      ${shape.replace(/fill="[^"]+"/, 'fill="rgba(255,255,255,0.18)"')}
      <text x="20" y="25" text-anchor="middle" font-size="16" fill="#fff" font-family="Manrope,sans-serif">${glyph}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  },

  el(item, size = 36) {
    const img = document.createElement('img');
    img.className = 'product-icon';
    img.width = size;
    img.height = size;
    img.alt = item?.name || '';
    img.src = this.svg(item, size);
    img.loading = 'lazy';
    return img;
  },
};
