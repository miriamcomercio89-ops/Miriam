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
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Gestión de premio ${level}: ${ticket.clientName} · ${formatEuro(ticket.prizeCents)}`,
  });
  state.ui.toast = `Premio de ${formatEuro(ticket.prizeCents)} enviado a gestión.`;
  return { ok: true, managed: true, case: caseItem };
}

/** Al liquidar el día, los casos "submitted" pueden pasar a settled y el cliente cobra vía org */
export function advancePrizeManagement(state) {
  for (const c of state.prizeManagement || []) {
    if (c.status === 'open') {
      c.status = 'submitted';
      c.submittedAt = state.clock.gameTimeMs;
    } else if (c.status === 'submitted') {
      c.status = 'settled';
      c.settledAt = state.clock.gameTimeMs;
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
    }
  }
}
