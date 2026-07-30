import { LARGE_PRIZE_CENTS, HUGE_PRIZE_CENTS } from './tickets.js';
import { formatEuro, drawerTotalCents, makeChange, removeFromDrawer } from '../data/money.js';

/**
 * Intenta pagar un premio de ticket.
 * options: { defer: bool, forceManage: bool }
 */
export function payTicketPrize(state, ticketId, { method = 'cash', defer = false } = {}) {
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (!ticket) return { ok: false, message: 'Ticket no encontrado' };
  if (ticket.status === 'paid') return { ok: false, message: 'Ya pagado' };
  if (ticket.prizeCents <= 0) return { ok: false, message: 'No hay premio' };

  if (defer) {
    ticket.status = 'checked';
    ticket.deferred = true;
    state.ui.toast = `Premio de ${formatEuro(ticket.prizeCents)} pendiente de cobro. El cliente puede volver otro día.`;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Premio diferido: ${ticket.clientName} · ${formatEuro(ticket.prizeCents)} (${ticket.productName})`,
    });
    return { ok: true, deferred: true, ticket };
  }

  // Premios grandes → gestión obligatoria
  if (ticket.prizeCents >= LARGE_PRIZE_CENTS) {
    return startPrizeManagement(state, ticket);
  }

  return paySmallPrize(state, ticket, method);
}

function paySmallPrize(state, ticket, method) {
  const amount = ticket.prizeCents;
  if (method === 'cash') {
    const total = drawerTotalCents(state.finance.drawer);
    if (total < amount) {
      return { ok: false, message: 'No hay efectivo suficiente. Usa transferencia o difiere el pago.' };
    }
    const give = makeChange(state.finance.drawer, amount);
    if (!give) {
      return { ok: false, message: 'No se puede componer el efectivo. Usa transferencia o difiere.' };
    }
    const next = removeFromDrawer(state.finance.drawer, give);
    if (!next) return { ok: false, message: 'Error de caja' };
    state.finance.drawer = next;
  } else {
    if (state.finance.bankCents < amount) {
      return { ok: false, message: 'Saldo de banco insuficiente. Difiere el pago o gestiona.' };
    }
    state.finance.bankCents -= amount;
  }

  ticket.status = 'paid';
  ticket.paidAt = state.clock.gameTimeMs;
  ticket.paidMethod = method;
  state.finance.dayPrizesPaidCents += amount;
  state.finance.dayPrizesReimbursableCents = (state.finance.dayPrizesReimbursableCents || 0) + amount;
  state.stats.totalPrizesPaidCents = (state.stats.totalPrizesPaidCents || 0) + amount;
  state.finance.ledger.push({
    id: `prize-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'prize',
    method,
    totalCents: amount,
    ticketId: ticket.id,
    clientName: ticket.clientName,
    org: ticket.org,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Premio pagado: ${ticket.clientName} · ${formatEuro(amount)} · ${ticket.productName}`,
  });
  state.ui.toast = `Premio pagado: ${formatEuro(amount)}`;
  return { ok: true, ticket, amount };
}

export function startPrizeManagement(state, ticket) {
  if (!state.prizeManagement) state.prizeManagement = [];
  const existing = state.prizeManagement.find((m) => m.ticketId === ticket.id && m.status === 'open');
  if (existing) {
    state.ui.toast = 'Este premio ya está en gestión.';
    return { ok: true, managed: true, case: existing };
  }

  const level = ticket.prizeCents >= HUGE_PRIZE_CENTS ? 'huge' : 'large';
  const caseItem = {
    id: `pm-${Date.now()}`,
    ticketId: ticket.id,
    clientName: ticket.clientName,
    productName: ticket.productName,
    org: ticket.org,
    amountCents: ticket.prizeCents,
    level,
    status: 'open', // open | submitted | settled
    createdAt: state.clock.gameTimeMs,
    note:
      level === 'huge'
        ? 'Premio muy elevado: formalizar con SELAE/ONCE. No se paga de caja.'
        : 'Premio elevado: gestionar cobro. No sale entero de tu caja.',
  };
  state.prizeManagement.push(caseItem);
  ticket.status = 'managed';
  ticket.managementId = caseItem.id;
  raiseHighPrizeAlert(state, ticket);
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Gestión de premio ${level}: ${ticket.clientName} · ${formatEuro(ticket.prizeCents)}`,
  });
  state.ui.toast = `Premio de ${formatEuro(ticket.prizeCents)} enviado a gestión.`;
  return { ok: true, managed: true, case: caseItem };
}

/** Alerta visible de premio alto (≥ 2.000 €). */
export function raiseHighPrizeAlert(state, ticket) {
  if (!ticket || (ticket.prizeCents || 0) < LARGE_PRIZE_CENTS) return state;
  state.ui.highPrizeAlert = {
    ticketId: ticket.id,
    clientName: ticket.clientName,
    productName: ticket.productName,
    amountCents: ticket.prizeCents,
    at: state.clock.gameTimeMs,
  };
  state.stats.highPrizesAlerted = (state.stats.highPrizesAlerted || 0) + 1;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `⚠ ALERTA premio alto: ${ticket.clientName || 'cliente'} · ${formatEuro(ticket.prizeCents)} · ${ticket.productName}`,
  });
  return state;
}

export function dismissHighPrizeAlert(state) {
  if (state.ui) state.ui.highPrizeAlert = null;
  return state;
}

/** Etiquetas de estado para la UI. */
export const PRIZE_MGMT_STATUS = {
  open: 'Abierto',
  documented: 'Documentado',
  submitted: 'Presentado',
  settled: 'Liquidado',
};

/**
 * Avanza un caso de gestión un paso (manual, Miriam).
 * open → documented → submitted → settled
 */
export function advancePrizeCase(state, caseId) {
  const c = (state.prizeManagement || []).find((x) => x.id === caseId);
  if (!c) return { ok: false, message: 'Caso no encontrado' };
  if (c.status === 'settled') return { ok: false, message: 'Ya está liquidado' };

  if (c.status === 'open') {
    c.status = 'documented';
    c.documentedAt = state.clock.gameTimeMs;
    c.note = 'Documentación lista (DNI, ticket, formulario). Pendiente presentar.';
    state.ui.toast = 'Caso documentado. Siguiente: presentar a LAE/ONCE.';
  } else if (c.status === 'documented') {
    c.status = 'submitted';
    c.submittedAt = state.clock.gameTimeMs;
    c.note = `Presentado a ${c.org || 'organismo'}. Esperando liquidación.`;
    state.ui.toast = `Presentado a ${c.org || 'organismo'}.`;
  } else if (c.status === 'submitted') {
    c.status = 'settled';
    c.settledAt = state.clock.gameTimeMs;
    c.note = `Liquidado: paga ${c.org || 'organismo'} (no sale de tu caja).`;
    const ticket = state.tickets.find((t) => t.id === c.ticketId);
    if (ticket) {
      ticket.status = 'paid';
      ticket.paidAt = state.clock.gameTimeMs;
      ticket.paidMethod = 'managed';
    }
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Premio gestionado liquidado: ${c.clientName} · ${formatEuro(c.amountCents)} (paga ${c.org})`,
    });
    state.ui.toast = `Premio liquidado: ${formatEuro(c.amountCents)}`;
  } else {
    // Compat: saves antiguos con open/submitted/settled
    if (c.status === 'open') {
      /* handled above */
    } else {
      c.status = 'submitted';
      c.submittedAt = state.clock.gameTimeMs;
    }
  }

  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Gestión premio → ${PRIZE_MGMT_STATUS[c.status] || c.status}: ${c.clientName} · ${formatEuro(c.amountCents)}`,
  });
  return { ok: true, case: c };
}

/** @deprecated No auto-avanza en cierre v0.8; se mantiene por saves antiguos. */
export function advancePrizeManagement(_state) {
  // Intencionadamente vacío: Miriam avanza casos a mano.
}
