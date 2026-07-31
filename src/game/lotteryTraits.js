import { getProduct } from '../data/products.js';

/**
 * Rasgos de juego / sabor por lotería (para enciclopedia y simulación).
 */
const TRAIT_OVERRIDES = {
  'lae-nacional': { pace: 'clásico', queueWeight: 1.3, jackpotBoost: 1.1, payBias: ['cash', 'card'] },
  'lae-primitiva': { pace: 'semanal', queueWeight: 1.2, jackpotBoost: 1.4, payBias: ['cash', 'card', 'bizum'] },
  'lae-bonoloto': { pace: 'diario', queueWeight: 1.1, jackpotBoost: 1.15, payBias: ['cash', 'bizum'] },
  'lae-euromillones': { pace: 'bote alto', queueWeight: 1.5, jackpotBoost: 1.8, payBias: ['card', 'cash'] },
  'lae-gordo-primitiva': { pace: 'domingo', queueWeight: 1.1, jackpotBoost: 1.35, payBias: ['cash'] },
  'lae-quiniela': { pace: 'futbolero', queueWeight: 1.0, jackpotBoost: 1.05, payBias: ['cash'] },
  'lae-navidad': { pace: 'estacional', queueWeight: 2.0, jackpotBoost: 2.2, payBias: ['cash', 'transfer'] },
  'lae-nino': { pace: 'estacional', queueWeight: 1.6, jackpotBoost: 1.7, payBias: ['cash'] },
  'once-cupon': { pace: 'diario', queueWeight: 1.25, jackpotBoost: 1.0, payBias: ['cash'] },
  'once-cuponazo': { pace: 'viernes', queueWeight: 1.35, jackpotBoost: 1.3, payBias: ['cash', 'card'] },
  'once-sueldazo': { pace: 'premio vitalicio', queueWeight: 1.2, jackpotBoost: 1.25, payBias: ['cash'] },
  'once-eurojackpot': { pace: 'europeo', queueWeight: 1.15, jackpotBoost: 1.5, payBias: ['card'] },
  'once-super-once': { pace: 'combinaciones', queueWeight: 0.95, jackpotBoost: 1.1, payBias: ['cash', 'bizum'] },
  'once-triplex': { pace: 'rápido', queueWeight: 0.9, jackpotBoost: 0.9, payBias: ['cash'] },
};

function defaultPace(p) {
  if (!p) return 'normal';
  if (p.category === 'rasca') return 'inmediato';
  if (p.category === 'especial' || p.seasonMonths) return 'estacional';
  if ((p.drawDays || []).length >= 5) return 'diario';
  if ((p.drawDays || []).length === 1) return 'semanal';
  return 'regular';
}

function defaultPayBias(p) {
  if (!p) return ['cash'];
  if (p.priceCents >= 10000) return ['cash', 'card', 'transfer'];
  if (p.org === 'ONCE') return ['cash', 'bizum'];
  if (p.category === 'rasca') return ['cash'];
  return ['cash', 'card'];
}

export function lotteryTraits(productOrId) {
  const p = typeof productOrId === 'string' ? getProduct(productOrId) : productOrId;
  if (!p) {
    return { pace: '—', queueWeight: 1, jackpotBoost: 1, payBias: [], flavor: '', scratchStyle: null };
  }
  const o = TRAIT_OVERRIDES[p.id] || {};
  return {
    pace: o.pace || defaultPace(p),
    queueWeight: o.queueWeight ?? (p.org === 'LAE' ? 1.1 : p.org === 'ONCE' ? 1.05 : 0.85),
    jackpotBoost: o.jackpotBoost ?? (p.prizeTier === 'big' ? 1.3 : 1),
    payBias: o.payBias || defaultPayBias(p),
    flavor: p.flavor || '',
    scratchStyle: p.category === 'rasca' ? p.trait || 'rasca y gana' : null,
    org: p.org,
    category: p.category,
    numberMode: p.numberMode || null,
  };
}
