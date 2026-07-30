import {
  ALL_DENOMS,
  countTotalCents,
  addToDrawer,
  removeFromDrawer,
  makeChange,
  emptyDrawer,
  formatEuro,
  drawerTotalCents,
} from '../data/money.js';
import { getProduct } from '../data/products.js';
import { createTicketsFromSale } from './tickets.js';

export { formatEuro, ALL_DENOMS, emptyDrawer, drawerTotalCents, countTotalCents };

/**
 * Inicia sesión de cobro en mostrador.
 * items: [{ productId, qty, unitCents }]
 */
export function startPayment(state, { items, client, purpose = 'sale' }) {
  const totalCents = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  state.ui.paymentSession = {
    purpose,
    clientId: client?.id || null,
    clientName: client?.name || 'Cliente',
    preferredPayment: client?.prefersPayment || 'cash',
    items,
    totalCents,
    method: null, // cash | card | bizum | transfer
    tendered: emptyDrawer(), // lo que da el cliente
    changeGiven: emptyDrawer(), // lo que eliges devolver
    step: 'method', // method | cash-tender | cash-change | done
    error: null,
  };
  state.ui.screen = 'cash';
  return state;
}

export function selectPaymentMethod(state, method) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  ps.method = method;
  ps.error = null;
  if (method === 'cash') {
    ps.step = 'cash-tender';
    ps.tendered = emptyDrawer();
    ps.changeGiven = emptyDrawer();
  } else {
    // Fallos realistas de cobro electrónico
    const fail = rollPaymentFailure(method, ps.totalCents);
    if (fail) {
      ps.method = null;
      ps.step = 'method';
      ps.error = fail;
      ps.failCount = (ps.failCount || 0) + 1;
      state.finance.paymentFailsToday = (state.finance.paymentFailsToday || 0) + 1;
      state.dayLog.push({
        at: state.clock.gameTimeMs,
        text: `Cobro fallido (${labelMethod(method)}): ${fail}`,
      });
      state.ui.toast = fail;
      return state;
    }
    completeNonCash(state);
  }
  return state;
}

/** Simula rechazos de tarjeta / Bizum / transferencia */
function rollPaymentFailure(method, totalCents) {
  const r = Math.random();
  if (method === 'card') {
    if (r < 0.08) return 'Tarjeta rechazada: contacte con su banco.';
    if (r < 0.12) return 'TPV sin cobertura. Prueba otra vez o efectivo.';
    if (r < 0.15 && totalCents >= 10000) return 'Tarjeta denegada por límite.';
  }
  if (method === 'bizum') {
    if (r < 0.1) return 'Bizum no recibido. El cliente debe repetir el envío.';
    if (r < 0.14) return 'Bizum: usuario no encontrado. Revisa el móvil.';
    if (r < 0.17) return 'Bizum caducado. Pide uno nuevo.';
  }
  if (method === 'transfer') {
    if (r < 0.06) return 'Transferencia no llegada. Espera o cobra en efectivo.';
    if (r < 0.09) return 'IBAN incorrecto. Corrige y reintenta.';
  }
  return null;
}

/** Reintento manual tras fallo (misma vía) */
export function retryPaymentMethod(state, method) {
  return selectPaymentMethod(state, method);
}

function completeNonCash(state) {
  const ps = state.ui.paymentSession;
  applySaleAccounting(state, ps, ps.method);
  ps.step = 'done';
  state.ui.toast = `Cobrado ${formatEuro(ps.totalCents)} por ${labelMethod(ps.method)}`;
  finishSaleSideEffects(state);
}

export function adjustTender(state, denomId, delta) {
  const ps = state.ui.paymentSession;
  if (!ps || ps.step !== 'cash-tender') return state;
  const next = Math.max(0, (ps.tendered[denomId] || 0) + delta);
  ps.tendered[denomId] = next;
  ps.error = null;
  return state;
}

export function confirmTender(state) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  const given = countTotalCents(ps.tendered);
  if (given < ps.totalCents) {
    ps.error = `Falta dinero. Entregado ${formatEuro(given)}, total ${formatEuro(ps.totalCents)}.`;
    return state;
  }
  const changeNeeded = given - ps.totalCents;
  ps.changeNeededCents = changeNeeded;
  // Sugerencia automática (opcional, el jugador puede editar)
  const suggestion = makeChange(state.finance.drawer, changeNeeded);
  ps.changeGiven = suggestion || emptyDrawer();
  ps.step = 'cash-change';
  ps.error = null;
  if (!suggestion && changeNeeded > 0) {
    ps.error = 'No hay suficiente cambio en caja para la sugerencia. Elige el cambio a mano.';
  }
  return state;
}

export function adjustChange(state, denomId, delta) {
  const ps = state.ui.paymentSession;
  if (!ps || ps.step !== 'cash-change') return state;
  const next = Math.max(0, (ps.changeGiven[denomId] || 0) + delta);
  // No puedes dar más de lo que hay en caja (+ lo que acaba de entregar el cliente aún no está en caja)
  const available = (state.finance.drawer[denomId] || 0) + (ps.tendered[denomId] || 0);
  if (next > available) {
    ps.error = 'No hay tantas piezas de esa denominación.';
    return state;
  }
  ps.changeGiven[denomId] = next;
  ps.error = null;
  return state;
}

export function confirmChange(state) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  const changeNeeded = ps.changeNeededCents || 0;
  const changeSum = countTotalCents(ps.changeGiven);
  if (changeSum !== changeNeeded) {
    const diff = changeSum - changeNeeded;
    ps.error =
      diff > 0
        ? `Cambio de más: sobran ${formatEuro(diff)}. Debes devolver exactamente ${formatEuro(changeNeeded)}.`
        : `Cambio de menos: faltan ${formatEuro(-diff)}. Debes devolver ${formatEuro(changeNeeded)}.`;
    state.finance.changeErrorsToday = (state.finance.changeErrorsToday || 0) + 1;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Error de cambio: dado ${formatEuro(changeSum)} · debía ${formatEuro(changeNeeded)}`,
    });
    return state;
  }

  // Aplicar: añadir tendered, quitar change
  let drawer = addToDrawer(state.finance.drawer, ps.tendered);
  drawer = removeFromDrawer(drawer, ps.changeGiven);
  if (!drawer) {
    ps.error = 'No hay suficientes billetes/monedas en caja para ese cambio.';
    return state;
  }
  state.finance.drawer = drawer;
  applySaleAccounting(state, ps, 'cash');
  ps.step = 'done';
  state.ui.toast = changeNeeded
    ? `Venta OK. Cambio: ${formatEuro(changeNeeded)}`
    : `Venta OK. Importe exacto.`;
  finishSaleSideEffects(state);
  return state;
}

function applySaleAccounting(state, ps, method) {
  const commission = Math.round(
    ps.items.reduce((s, i) => {
      const p = getProduct(i.productId);
      const rate = p?.commissionRate || 0.05;
      return s + i.unitCents * i.qty * rate;
    }, 0),
  );

  state.finance.daySalesCents += ps.totalCents;
  state.finance.dayCommissionCents += commission;
  state.stats.totalSalesCents += ps.totalCents;
  state.stats.totalCommissionCents = (state.stats.totalCommissionCents || 0) + commission;

  if (method !== 'cash') {
    state.finance.bankCents += ps.totalCents;
  }
  // En efectivo el dinero queda en el cajón (ya aplicado)

  state.finance.ledger.push({
    id: `led-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'sale',
    method,
    totalCents: ps.totalCents,
    commissionCents: commission,
    items: ps.items,
    clientName: ps.clientName,
  });
}

function finishSaleSideEffects(state) {
  const ps = state.ui.paymentSession;
  // Descontar stock
  for (const item of ps.items) {
    const p = getProduct(item.productId);
    if (p && p.stockType === 'physical' && state.stock[item.productId] != null) {
      state.stock[item.productId] = Math.max(0, (state.stock[item.productId] || 0) - item.qty);
    }
  }
  // Crear tickets / rascas
  const tickets = createTicketsFromSale(state, {
    items: ps.items,
    clientId: ps.clientId,
    clientName: ps.clientName,
    method: ps.method,
  });
  ps.createdTickets = tickets;
  state.ui.lastTickets = tickets;

  // Historial cliente (incluye abonados / peñas persistentes)
  const entry = {
    at: state.clock.gameTimeMs,
    items: ps.items,
    totalCents: ps.totalCents,
    ticketIds: tickets.map((t) => t.id),
  };
  const client =
    state.customers.regulars.find((c) => c.id === ps.clientId) ||
    state.customers.abonados?.find((c) => c.id === ps.clientId) ||
    state.customers.penas?.find((c) => c.id === ps.clientId) ||
    (state.customers.current?.id === ps.clientId ? state.customers.current : null);
  if (client) {
    if (!client.history) client.history = [];
    client.history.push(entry);
  }
  state.stats.totalCustomers += 1;
  state.customers.servedToday += 1;
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Venta a ${ps.clientName}: ${formatEuro(ps.totalCents)} (${labelMethod(ps.method)}) · ${tickets.length} ticket(s)`,
  });

  // Si venía a recoger encargo, marcar entregado
  const cur = state.customers.current;
  if (cur && (cur.intent === 'pickup' || cur.pickupOrders?.length) && cur.id === ps.clientId) {
    for (const o of state.orders || []) {
      if (o.reserved && o.status === 'arrived' && o.clientId === cur.id) {
        o.status = 'delivered';
        o.deliveredAt = state.clock.gameTimeMs;
      }
    }
  }
}

export function closePaymentSession(state) {
  state.ui.paymentSession = null;
  // Liberar cliente actual
  state.customers.current = null;
  state.ui.screen = 'counter';
  return state;
}

export function cancelPayment(state) {
  state.ui.paymentSession = null;
  state.ui.screen = 'counter';
  state.ui.toast = 'Cobro cancelado';
  return state;
}

/**
 * Pago de premio desde caja/banco.
 * Si cabe en caja (efectivo), descuenta del cajón de forma simple por total;
 * si no, paga desde banco (transferencia a cliente).
 */
export function payPrize(state, { amountCents, clientName, method = 'cash', note = '' }) {
  if (amountCents <= 0) {
    state.ui.toast = 'Importe no válido';
    return false;
  }
  if (method === 'cash') {
    const total = drawerTotalCents(state.finance.drawer);
    if (total < amountCents) {
      state.ui.toast = 'No hay suficiente efectivo en caja. Usa banco/transferencia.';
      return false;
    }
    // Vaciar cajón proporcionalmente con makeChange
    const give = makeChange(state.finance.drawer, amountCents);
    if (!give) {
      state.ui.toast = 'No se puede componer el importe con las denominaciones actuales. Usa transferencia.';
      return false;
    }
    const next = removeFromDrawer(state.finance.drawer, give);
    if (!next) return false;
    state.finance.drawer = next;
  } else {
    if (state.finance.bankCents < amountCents) {
      state.ui.toast = 'No hay saldo suficiente en el banco.';
      return false;
    }
    state.finance.bankCents -= amountCents;
  }

  state.finance.dayPrizesPaidCents += amountCents;
  state.finance.ledger.push({
    id: `prize-${Date.now()}`,
    at: state.clock.gameTimeMs,
    type: 'prize',
    method,
    totalCents: amountCents,
    clientName,
    note,
  });
  state.dayLog.push({
    at: state.clock.gameTimeMs,
    text: `Premio pagado a ${clientName || 'cliente'}: ${formatEuro(amountCents)} (${method})`,
  });
  state.ui.toast = `Premio pagado: ${formatEuro(amountCents)}`;
  return true;
}

function labelMethod(m) {
  return (
    {
      cash: 'efectivo',
      card: 'tarjeta',
      bizum: 'Bizum',
      transfer: 'transferencia',
    }[m] || m
  );
}

/** Arqueo: resumen del cajón */
export function drawerSummary(state) {
  return {
    totalCents: drawerTotalCents(state.finance.drawer),
    drawer: { ...state.finance.drawer },
  };
}
