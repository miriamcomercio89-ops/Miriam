import { hashSeed, mulberry32, pickInt } from './rng.js';
import { gameDate, gameYmd } from './time.js';
import { formatEuro } from '../data/money.js';

const JACKPOT_GAMES = [
  { id: 'lae-euromillones', name: 'Euromillones', base: 1700000000, min: 1700000000, step: 500000000 },
  { id: 'lae-primitiva', name: 'Primitiva', base: 800000000, min: 140000000, step: 200000000 },
  { id: 'lae-bonoloto', name: 'Bonoloto', base: 40000000, min: 40000000, step: 20000000 },
  { id: 'lae-gordo-primitiva', name: 'Gordo Primitiva', base: 500000000, min: 500000000, step: 100000000 },
  { id: 'once-eurojackpot', name: 'Eurojackpot', base: 1000000000, min: 1000000000, step: 400000000 },
  { id: 'once-cuponazo', name: 'Cuponazo', base: 900000000, min: 900000000, step: 100000000 },
];

export function ensureJackpots(state) {
  if (!state.jackpots) state.jackpots = {};
  const ymd = gameYmd(state);
  const weekKey = weekId(gameDate(state));
  if (state.jackpots.weekKey === weekKey && Object.keys(state.jackpots.values || {}).length) {
    return state;
  }

  const rng = mulberry32(hashSeed('jackpot', weekKey));
  const values = {};
  for (const g of JACKPOT_GAMES) {
    const prev = state.jackpots.values?.[g.id] || g.base;
    const roll = rng();
    let next;
    if (roll < 0.18) next = g.min; // cae el bote
    else if (roll < 0.55) next = prev + g.step;
    else next = prev + Math.floor(g.step * (0.5 + rng()));
    values[g.id] = Math.max(g.min, next);
  }
  state.jackpots = { weekKey, updatedYmd: ymd, values };
  return state;
}

function weekId(d) {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function jackpotList(state) {
  ensureJackpots(state);
  return JACKPOT_GAMES.map((g) => ({
    id: g.id,
    name: g.name,
    cents: state.jackpots.values[g.id] || g.base,
    label: formatEuro(state.jackpots.values[g.id] || g.base),
  }));
}

export function formatJackpotShort(cents) {
  if (cents >= 100000000) return `${(cents / 100000000).toFixed(1)} M€`;
  return formatEuro(cents);
}
