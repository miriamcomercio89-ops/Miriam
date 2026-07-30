import { getProduct } from '../data/products.js';
import { SCRATCH_CARDS, rollScratchPrize } from '../data/scratch.js';
import { getDraw, nextDrawYmd, generateBetSelection } from './draws.js';
import { hashSeed, mulberry32, pad5 } from './rng.js';
import { gameDate } from './time.js';
import { formatEuro } from '../data/money.js';

/** Umbral: por encima hay que gestionar (no pago libre de caja) */
export const LARGE_PRIZE_CENTS = 200000; // 2.000 €
export const HUGE_PRIZE_CENTS = 1500000; // 15.000 €

let ticketSeq = 1;

export function nextTicketId(state) {
  state.nextIds = state.nextIds || { ticket: 1 };
  return `T-${state.nextIds.ticket++}`;
}

/**
 * Crea tickets a partir de una venta cobrada.
 */
export function createTicketsFromSale(state, { items, clientId, clientName, method }) {
  if (!state.tickets) state.tickets = [];
  const created = [];
  const rng = mulberry32(hashSeed('sale', state.clock.gameTimeMs, clientId || 'x', ticketSeq++));

  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) continue;
    for (let q = 0; q < item.qty; q++) {
      const ticket = buildTicket(state, product, clientId, clientName, rng, item);
      ticket.saleMethod = method;
      state.tickets.push(ticket);
      created.push(ticket);
    }
  }
  return created;
}

function buildTicket(state, product, clientId, clientName, rng, item = {}) {
  const id = nextTicketId(state);
  const base = {
    id,
    productId: product.id,
    productName: product.name,
    org: product.org,
    clientId,
    clientName,
    createdAt: state.clock.gameTimeMs,
    priceCents: product.priceCents,
    status: 'active',
    prizeCents: 0,
    checkedAt: null,
    paidAt: null,
  };

  if (product.category === 'rasca') {
    const card = SCRATCH_CARDS.find((c) => c.id === product.id);
    const prize = card ? rollScratchPrize(card, rng) : 0;
    return {
      ...base,
      kind: 'rasca',
      hiddenPrizeCents: prize,
      selection: { code: `R${pad5(Math.floor(rng() * 1e5))}` },
    };
  }

  const drawYmd = nextDrawYmd(product.id, gameDate(state));
  const selection = item.selection || generateBetSelection(product.id, rng);
  return {
    ...base,
    kind: 'draw',
    drawYmd,
    selection,
    numberSource: item.numberSource || 'random',
    hiddenPrizeCents: null,
  };
}

/**
 * Evalúa premio de un ticket de sorteo contra el resultado.
 */
export function evaluateDrawPrize(ticket, draw) {
  if (!draw) return { prizeCents: 0, detail: 'Sorteo aún no celebrado' };
  const id = ticket.productId;
  const sel = ticket.selection || {};

  if (id === 'lae-primitiva' || id === 'lae-bonoloto') {
    const hits = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
    const reintegroHit = sel.reintegro === draw.reintegro;
    let prize = 0;
    let detail = `${hits} aciertos`;
    if (hits === 6) prize = id === 'lae-primitiva' ? 80000000 : 40000000;
    else if (hits === 5) prize = id === 'lae-primitiva' ? 120000 : 40000;
    else if (hits === 4) prize = 2500;
    else if (hits === 3) prize = 800;
    else if (reintegroHit) {
      prize = getProduct(id).priceCents;
      detail = 'Reintegro';
    } else detail = 'Sin premio';
    return { prizeCents: prize, detail, hits };
  }

  if (id === 'lae-euromillones' || id === 'once-eurojackpot') {
    const hits = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
    const stars = (sel.stars || []).filter((n) => draw.stars.includes(n)).length;
    let prize = 0;
    if (hits === 5 && stars === 2) prize = id === 'once-eurojackpot' ? 3000000000 : 5000000000;
    else if (hits === 5 && stars === 1) prize = 25000000;
    else if (hits === 5) prize = 4000000;
    else if (hits === 4 && stars === 2) prize = 150000;
    else if (hits === 4 && stars === 1) prize = 25000;
    else if (hits === 3 && stars === 2) prize = 8000;
    else if (hits === 3 && stars === 1) prize = 1200;
    else if (hits === 2 && stars === 2) prize = 1500;
    else if (hits === 3) prize = 1000;
    else if (hits === 1 && stars === 2) prize = 800;
    else if (stars === 2) prize = 600;
    const detail = prize ? `${hits}+${stars} estrellas` : 'Sin premio';
    return { prizeCents: prize, detail, hits, stars };
  }

  if (id === 'lae-gordo-primitiva') {
    const hits = (sel.numbers || []).filter((n) => draw.numbers.includes(n)).length;
    const clave = sel.clave === draw.clave;
    let prize = 0;
    if (hits === 5 && clave) prize = 500000000;
    else if (hits === 5) prize = 800000;
    else if (hits === 4 && clave) prize = 40000;
    else if (hits === 4) prize = 8000;
    else if (hits === 3 && clave) prize = 3000;
    else if (hits === 3) prize = 1000;
    else if (clave) prize = getProduct(id).priceCents;
    return { prizeCents: prize, detail: prize ? `${hits} + clave` : 'Sin premio' };
  }

  if (id === 'lae-quiniela') {
    const hits = (sel.column || []).filter((v, i) => v === (draw.column || [])[i]).length;
    let prize = 0;
    if (hits >= 14) prize = 200000000;
    else if (hits === 13) prize = 500000;
    else if (hits === 12) prize = 20000;
    else if (hits === 11) prize = 4000;
    else if (hits === 10) prize = 1000;
    return { prizeCents: prize, detail: `${hits} aciertos` };
  }

  if (id === 'lae-quinigol') {
    const hits = (sel.goals || []).filter((v, i) => v === (draw.goals || [])[i]).length;
    const prize = hits === 6 ? 5000000 : hits === 5 ? 20000 : hits === 4 ? 2000 : 0;
    return { prizeCents: prize, detail: `${hits} partidos` };
  }

  if (
    id === 'lae-nacional' ||
    id === 'lae-nacional-jueves' ||
    id === 'lae-navidad' ||
    id === 'lae-nino' ||
    id === 'once-cupon' ||
    id === 'once-cuponazo' ||
    id === 'once-sueldazo' ||
    id === 'once-triplex'
  ) {
    const mine = String(sel.number || '');
    const win = String(draw.winningNumber || '');
    let prize = 0;
    let detail = 'Sin premio';
    if (mine === win) {
      prize = id === 'once-cupon' ? 35000000 : id === 'lae-nacional' ? 30000000 : 400000000;
      detail = 'Número completo';
    } else if (mine.slice(-4) === win.slice(-4)) {
      prize = id === 'once-cupon' ? 50000 : 100000;
      detail = '4 últimas cifras';
    } else if (mine.slice(-3) === win.slice(-3)) {
      prize = id === 'once-cupon' ? 2000 : 10000;
      detail = '3 últimas cifras';
    } else if (mine.slice(-2) === win.slice(-2)) {
      prize = id === 'once-cupon' ? 400 : 3000;
      detail = '2 últimas cifras (aproximación)';
    } else if (mine.slice(-1) === win.slice(-1)) {
      prize = getProduct(id).priceCents; // reintegro simplificado
      detail = 'Reintegro (última cifra)';
    }
    return { prizeCents: prize, detail };
  }

  // inventadas
  const hits = (sel.numbers || []).filter((n) => (draw.numbers || []).includes(n)).length;
  const table = { 5: 500000, 4: 20000, 3: 2000, 2: 200 };
  const prize = table[hits] || 0;
  return { prizeCents: prize, detail: prize ? `${hits} aciertos` : 'Sin premio', hits };
}

export function checkTicket(state, ticketId) {
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (!ticket) return { ok: false, message: 'Ticket no encontrado' };
  if (ticket.status === 'paid') return { ok: false, message: 'Este premio ya está pagado', ticket };
  if (ticket.status === 'managed') return { ok: false, message: 'Premio en gestión', ticket };

  if (ticket.kind === 'rasca') {
    ticket.prizeCents = ticket.hiddenPrizeCents || 0;
    ticket.checkedAt = state.clock.gameTimeMs;
    ticket.status = 'checked';
    ticket.checkDetail = ticket.prizeCents ? `Premio rasca ${formatEuro(ticket.prizeCents)}` : 'Sin premio';
    return {
      ok: true,
      ticket,
      prizeCents: ticket.prizeCents,
      detail: ticket.checkDetail,
      large: ticket.prizeCents >= LARGE_PRIZE_CENTS,
    };
  }

  const draw = getDraw(state, ticket.productId, ticket.drawYmd);
  if (!draw) {
    return {
      ok: true,
      ticket,
      prizeCents: 0,
      pending: true,
      detail: `Sorteo del ${ticket.drawYmd} aún no celebrado`,
    };
  }

  const result = evaluateDrawPrize(ticket, draw);
  ticket.prizeCents = result.prizeCents;
  ticket.checkedAt = state.clock.gameTimeMs;
  ticket.status = 'checked';
  ticket.checkDetail = result.detail;
  return {
    ok: true,
    ticket,
    prizeCents: result.prizeCents,
    detail: result.detail,
    large: result.prizeCents >= LARGE_PRIZE_CENTS,
    huge: result.prizeCents >= HUGE_PRIZE_CENTS,
  };
}

export function ticketsForClient(state, clientId) {
  return (state.tickets || []).filter((t) => t.clientId === clientId);
}

export function pendingClaimTickets(state) {
  return (state.tickets || []).filter(
    (t) => t.status === 'checked' && t.prizeCents > 0 && !t.paidAt,
  );
}

export function formatSelection(ticket) {
  const s = ticket.selection || {};
  if (ticket.kind === 'rasca') return `Código ${s.code || '—'}`;
  if (s.number) return `Nº ${s.number}`;
  if (s.races) return `Carreras ${s.races.join('-')}${s.plus != null ? ` +${s.plus}` : ''}`;
  if (s.stars) return `${(s.numbers || []).join(', ')} ★ ${(s.stars || []).join(', ')}`;
  if (s.clave != null) return `${(s.numbers || []).join(', ')} clave ${s.clave}`;
  if (s.column) return `Columna ${s.column.join('')}`;
  if (s.goals) return `Goles ${s.goals.join('')}`;
  if (s.numbers) {
    const extra = s.reintegro != null ? ` · R${s.reintegro}` : '';
    return `${(s.numbers || []).join(', ')}${extra}`;
  }
  return '—';
}
