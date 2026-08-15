/** Logos SVG distintivos por producto y por edificio */
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
    papel: '#E2E8F0',
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
    educacion: '#2563EB',
    medios: '#E11D48',
    turismo_ind: '#EA580C',
    impresion_3d: '#7C3AED',
    baterias_estac: '#16A34A',
    hidrogeno: '#0891B2',
    drones: '#4338CA',
    robotica: '#0F766E',
  },

  buildingColor: {
    extraccion: '#A16207',
    procesado: '#64748B',
    quimica: '#7C3AED',
    alimentacion: '#CA8A04',
    energia: '#EAB308',
    alta_tech: '#2563EB',
    logistica: '#0EA5E9',
    reciclaje: '#10B981',
    investigacion: '#8B5CF6',
    admin: '#F59E0B',
  },

  categoryGlyph: {
    minerales: '◆', agricolas: '❀', energia: '⚡', residuos: '♻', metales: '▣',
    quimicos: '⚗', farmaceuticos: '✚', construccion: '⌂', textiles: '≋', electronica: '▣',
    mecanicos: '⚙', alimentacion: '♨', embalaje: '▢', bienes_capital: '🏭', papel: '▤',
    agroquimicos: '⚘', consumo: '★', naval: '⚓', aeroespacial: '✈', mobiliario: '🪑',
    cosmetica: '✦', juguetes: '♟', deportes: '⚽', joyeria: '◈', ceramica_arte: '◌',
    vitivinicultura: '🍇', corcho_iberico: '🪵', biotecnologia: '🧬', renovables_eq: '☀',
    software_ind: '⌘', agua_tratamiento: '💧', optica_iluminacion: '💡', ferroviario: '🚆',
    seguridad_ind: '⛨', hogar_smart: '⌂', instrumentos: '⌖', educacion: '📘', medios: '🎬',
    turismo_ind: '🎫', impresion_3d: '⬡', baterias_estac: '🔋', hidrogeno: 'H₂', drones: '🛸',
    robotica: '🤖',
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

  shiftHue(hex, deg) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    const f = 1 + deg / 200;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  },

  colorFor(item) {
    const base = this.categoryColor[item?.category] || '#64748B';
    return this.shiftHue(base, (this.hash(item?.id || '') % 40) - 20);
  },

  monogram(name) {
    const parts = String(name || '?')
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9 ]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  },

  /** Logo de producto “de marca”: monograma + forma única */
  svg(item, size = 40) {
    const color = this.colorFor(item);
    const bg2 = this.shiftHue(color, 35);
    const h = this.hash(item?.id || item?.name || 'x');
    const gid = `pg${h.toString(16)}`;
    const mono = this.monogram(item?.name);
    const glyph = this.categoryGlyph[item?.category] || '';
    const variant = h % 5;
    let badge = '';
    if (variant === 0) badge = `<circle cx="20" cy="20" r="15" fill="rgba(255,255,255,0.14)"/>`;
    else if (variant === 1) badge = `<rect x="5" y="5" width="30" height="30" rx="8" fill="rgba(255,255,255,0.14)"/>`;
    else if (variant === 2) badge = `<polygon points="20,4 36,34 4,34" fill="rgba(255,255,255,0.14)"/>`;
    else if (variant === 3) badge = `<rect x="7" y="7" width="26" height="26" rx="4" transform="rotate(15 20 20)" fill="rgba(255,255,255,0.14)"/>`;
    else badge = `<ellipse cx="20" cy="20" rx="16" ry="12" fill="rgba(255,255,255,0.14)"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${bg2}"/>
      </linearGradient></defs>
      <rect width="40" height="40" rx="12" fill="url(#${gid})"/>
      ${badge}
      <text x="20" y="23" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Sora,Manrope,sans-serif">${mono}</text>
      <text x="31" y="12" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.85)">${glyph}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  },

  /** Logo de edificio por categoría + familia */
  buildingSvg(building, size = 48) {
    const cat = building?.category || 'procesado';
    const color = this.buildingColor[cat] || '#64748B';
    const bg2 = this.shiftHue(color, 28);
    const h = this.hash(building?.id || building?.name || 'b');
    const gid = `bg${h.toString(16)}`;
    const mono = this.monogram(building?.name);
    // silhouette factory
    const sil = `
      <rect x="6" y="18" width="28" height="16" rx="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="10" y="10" width="8" height="8" fill="rgba(255,255,255,0.25)"/>
      <rect x="22" y="12" width="6" height="6" fill="rgba(255,255,255,0.2)"/>
      <rect x="28" y="8" width="4" height="10" fill="rgba(255,255,255,0.3)"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bg2}"/><stop offset="100%" stop-color="${color}"/>
      </linearGradient></defs>
      <rect width="40" height="40" rx="10" fill="url(#${gid})"/>
      ${sil}
      <text x="20" y="36" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="Sora,Manrope,sans-serif">${mono}</text>
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

  buildingEl(building, size = 44) {
    const img = document.createElement('img');
    img.className = 'building-icon';
    img.width = size;
    img.height = size;
    img.alt = building?.name || '';
    img.src = this.buildingSvg(building, size);
    img.loading = 'lazy';
    return img;
  },
};
