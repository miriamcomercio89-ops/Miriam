/**
 * Logos visuales por lotería (CSS/SVG generados — sin assets externos).
 */

const ORG_HUE = {
  LAE: 195,
  ONCE: 28,
  Autonómica: 155,
  Provincial: 210,
  Local: 340,
};

const MODE_SYMBOL = {
  nacional: '★',
  '6from49': '❻',
  euro: '✦',
  eurojackpot: '✦',
  gordo: '♛',
  quiniela: '⚽',
  quinigol: '🥅',
  lototurf: '♞',
  quintuple: '🏇',
  triplex: '❸',
  superonce: '◈',
  '5from40': '❺',
  '6from36': '❻',
  '4from30': '❹',
  '7from45': '❼',
  '2from20': '❷',
  colorball: '●',
  ruleta: '◎',
  fecha: '📅',
  horaSuerte: '⏱',
  pares: '⚖',
  dados: '⚀',
  carta: '🂡',
  bingo75: 'Ⓑ',
  serieLocal: '№',
};

function hashHue(str, base = 180) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (base + (h % 50) - 10 + 360) % 360;
}

/** Abreviatura de 2–3 letras para el logo. */
export function logoAbbr(product) {
  if (!product) return '?';
  if (product.short) {
    const s = product.short.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g, '');
    if (s.length >= 2) return s.slice(0, 3).toUpperCase();
  }
  const parts = String(product.name || product.id)
    .replace(/^(El|La|Los|Las)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(product.name || '?').slice(0, 2).toUpperCase();
}

export function productLogo(product) {
  if (!product) {
    return { abbr: '?', symbol: '•', hue: 180, bg: 'hsl(180 40% 40%)', fg: '#fff', org: '' };
  }
  const base = ORG_HUE[product.org] ?? 180;
  const hue = hashHue(product.id || product.name, base);
  const symbol =
    product.category === 'rasca'
      ? '◈'
      : MODE_SYMBOL[product.numberMode] || (product.org === 'ONCE' ? '○' : '★');
  const bg =
    product.category === 'rasca'
      ? `linear-gradient(135deg, hsl(${hue} 70% 42%), hsl(${(hue + 40) % 360} 75% 48%))`
      : product.org === 'ONCE'
        ? `linear-gradient(135deg, hsl(${hue} 85% 48%), hsl(${(hue + 25) % 360} 80% 40%))`
        : product.org === 'LAE'
          ? `linear-gradient(135deg, hsl(${hue} 55% 38%), hsl(${(hue + 20) % 360} 60% 48%))`
          : `linear-gradient(145deg, hsl(${hue} 50% 40%), hsl(${(hue + 35) % 360} 55% 50%))`;
  return {
    abbr: logoAbbr(product),
    symbol,
    hue,
    bg,
    fg: '#fff',
    org: product.org || '',
    id: product.id,
  };
}

/** HTML del logo (inline). Acepta producto u objeto id/name/org. */
export function logoHTML(product, size = 'md') {
  const p =
    typeof product === 'string'
      ? { id: product, name: product, org: '', short: product }
      : product;
  const L = productLogo(p);
  const cls = size === 'lg' ? 'logo-mark logo-lg' : size === 'sm' ? 'logo-mark logo-sm' : 'logo-mark';
  return `<span class="${cls}" data-logo="${escapeAttr(L.id || '')}" style="--logo-bg:${L.bg};color:${L.fg}" title="${escapeAttr(
    p?.name || '',
  )}"><span class="logo-symbol">${L.symbol}</span><span class="logo-abbr">${L.abbr}</span></span>`;
}

function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
