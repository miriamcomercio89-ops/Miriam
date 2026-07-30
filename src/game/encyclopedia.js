import { PRODUCTS, REGIONAL_LOTTERIES } from '../data/products.js';
import { logoHTML } from '../data/logos.js';
import { lotteryTraits } from './lotteryTraits.js';
import { formatEuro } from '../data/money.js';

export function encyclopediaEntries() {
  return PRODUCTS.map((p) => {
    const traits = lotteryTraits(p);
    return {
      id: p.id,
      name: p.name,
      short: p.short || '',
      family: p.tpvCategory || p.org || 'Otros',
      org: p.org || '',
      region: p.region || '',
      description: p.description || '',
      flavor: p.flavor || traits.flavor || '',
      priceCents: p.priceCents,
      tip: p.tip || '',
      trait: p.trait || '',
      topPrizeHint: p.topPrizeHint || '',
      sellable: p.sellable !== false,
      logo: logoHTML(p, 'lg'),
      logoSm: logoHTML(p, 'sm'),
      traits,
      drawDays: p.drawDays || [],
      drawHour: p.drawHour,
      category: p.category,
      numberMode: p.numberMode || '',
      commissionRate: p.commissionRate,
      stockType: p.stockType,
      product: p,
    };
  });
}

export function encyclopediaById(id) {
  return encyclopediaEntries().find((e) => e.id === id) || null;
}

export function encyclopediaFamilies() {
  const map = new Map();
  for (const e of encyclopediaEntries()) {
    if (!map.has(e.family)) map.set(e.family, []);
    map.get(e.family).push(e);
  }
  return map;
}

export function encyclopediaStats() {
  return {
    total: PRODUCTS.length,
    lae: PRODUCTS.filter((p) => p.org === 'LAE').length,
    once: PRODUCTS.filter((p) => p.org === 'ONCE').length,
    inventada: PRODUCTS.filter((p) => p.org !== 'LAE' && p.org !== 'ONCE').length,
    sellable: PRODUCTS.filter((p) => p.sellable !== false).length,
    regional: REGIONAL_LOTTERIES.length,
  };
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function renderEncyclopediaDetail(id) {
  const e = encyclopediaById(id);
  if (!e) return '<p class="muted">Producto no encontrado.</p>';
  const t = e.traits;
  const days = (e.drawDays || []).map((d) => DAY_NAMES[d] || d).join(', ') || '—';
  const hour = e.drawHour != null ? `${String(e.drawHour).padStart(2, '0')}:00` : '—';
  return `
    <article class="ency-detail">
      <header class="ency-detail-head">
        ${e.logo}
        <div>
          <h2>${escapeHtml(e.name)}</h2>
          <p class="muted">${escapeHtml(e.family)} · ${escapeHtml(e.org)}${
            e.region ? ` · ${escapeHtml(e.region)}` : ''
          }</p>
        </div>
      </header>
      <p class="ency-lead">${escapeHtml(e.description || 'Sin descripción.')}</p>
      ${e.flavor ? `<blockquote class="ency-flavor">${escapeHtml(e.flavor)}</blockquote>` : ''}
      <div class="ency-grid">
        <div><strong>Precio base</strong><span>${e.priceCents != null ? formatEuro(e.priceCents) : '—'}</span></div>
        <div><strong>En venta</strong><span>${e.sellable ? 'Sí' : 'Solo consulta / pedido'}</span></div>
        <div><strong>Mecánica</strong><span>${escapeHtml(e.trait || e.numberMode || '—')}</span></div>
        <div><strong>Premio orientativo</strong><span>${escapeHtml(e.topPrizeHint || '—')}</span></div>
        <div><strong>Ritmo</strong><span>${escapeHtml(t.pace || '—')}</span></div>
        <div><strong>Pago típico</strong><span>${escapeHtml((t.payBias || []).join(', ') || '—')}</span></div>
        <div><strong>Peso en cola</strong><span>${t.queueWeight ?? '—'}</span></div>
        <div><strong>Impulso bote</strong><span>${t.jackpotBoost ?? '—'}</span></div>
        <div><strong>Sorteo</strong><span>${escapeHtml(days)} · ${escapeHtml(hour)}</span></div>
        <div><strong>Comisión</strong><span>${
          e.commissionRate != null ? `${(e.commissionRate * 100).toFixed(1)}%` : '—'
        }</span></div>
        <div><strong>Stock</strong><span>${e.stockType === 'physical' ? 'Físico' : 'Terminal'}</span></div>
        <div><strong>Categoría</strong><span>${escapeHtml(e.category || '—')}</span></div>
      </div>
      ${e.tip ? `<p class="tip"><strong>Consejo Miriam:</strong> ${escapeHtml(e.tip)}</p>` : ''}
      ${t.scratchStyle ? `<p class="muted">Estilo rasca: ${escapeHtml(t.scratchStyle)}</p>` : ''}
    </article>
  `;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
