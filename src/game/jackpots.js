import { hashSeed, mulberry32 } from './rng.js';
import { gameDate, gameYmd } from './time.js';
import { formatEuro } from '../data/money.js';

/** Importes en céntimos (17.000.000 € = 1_700_000_000 céntimos) */
const JACKPOT_GAMES = [
  { id: 'lae-euromillones', name: 'Euromillones', base: 1700000000, min: 1700000000, step: 500000000 },
  { id: 'lae-primitiva', name: 'Primitiva', base: 2500000000, min: 140000000, step: 500000000 },
  { id: 'lae-bonoloto', name: 'Bonoloto', base: 100000000, min: 40000000, step: 20000000 },
  { id: 'lae-gordo-primitiva', name: 'Gordo Primitiva', base: 700000000, min: 500000000, step: 100000000 },
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
    const prev = Number(state.jackpots.values?.[g.id]) || g.base;
    const roll = rng();
    let next;
    if (roll < 0.18) next = g.min;
    else if (roll < 0.55) next = prev + g.step;
    else next = prev + Math.round(g.step * (0.5 + rng()));
    values[g.id] = Math.max(g.min, Math.round(next));
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
    label: formatJackpotShort(state.jackpots.values[g.id] || g.base),
  }));
}

export function formatJackpotShort(cents) {
  const euros = Math.round(Number(cents) / 100);
  if (euros >= 1000000) {
    const m = euros / 1000000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1)} M€`;
  }
  if (euros >= 1000) return `${Math.round(euros / 1000)} mil €`;
  return formatEuro(cents);
}

/** Botes “calientes” que empujan afluencia y deseo de ese juego. */
export function hotJackpots(state) {
  ensureJackpots(state);
  return JACKPOT_GAMES.map((g) => {
    const cents = state.jackpots.values[g.id] || g.base;
    const hot = cents >= g.base * 1.35 || cents >= 3000000000;
    const veryHot = cents >= 5000000000 || cents >= g.base * 2;
    return { id: g.id, name: g.name, cents, hot, veryHot, label: formatJackpotShort(cents) };
  }).filter((j) => j.hot);
}

/** Multiplicador de afluencia por botes altos (0–0.45). */
export function jackpotCrowdBonus(state) {
  const list = jackpotList(state);
  if (!list.length) return 0;
  const maxJ = Math.max(...list.map((j) => j.cents));
  if (maxJ >= 5000000000) return 0.45;
  if (maxJ >= 3500000000) return 0.3;
  if (maxJ >= 2500000000) return 0.18;
  if (maxJ >= 1800000000) return 0.1;
  return 0;
}
