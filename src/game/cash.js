import {
  ALL_DENOMS,
  BILLS,
  COINS,
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
import { hashSeed, mulberry32 } from './rng.js';

export { formatEuro, ALL_DENOMS, emptyDrawer, drawerTotalCents, countTotalCents };

/**
 * Inicia sesión de cobro. El CLIENTE decide el método → se abre su ventana.
 * En efectivo: el cliente entrega el dinero solo; Miriam solo calcula el cambio.
 */
export function startPayment(state, { items, client, purpose = 'sale' }) {
  const totalCents = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const method = resolveClientPaymentMethod(client);
  state.ui.paymentSession = {
    purpose,
    clientId: client?.id || null,
    clientName: client?.name || 'Cliente',
    preferredPayment: method,
    clientChose: true,
    items,
    totalCents,
    method,
    tendered: emptyDrawer(),
    changeGiven: emptyDrawer(),
    changeNeededCents: 0,
    tenderLocked: false,
    step: 'method', // se sustituye abajo
    error: null,
    failCount: 0,
  };
  state.ui.screen = 'cash';
  openClientPaymentWindow(state);
  return state;
}

/** Método que elige el cliente para esta venta (su preferencia). */
function resolveClientPaymentMethod(client) {
  const m = client?.prefersPayment;
  if (['cash', 'card', 'bizum', 'transfer'].includes(m)) return m;
  return 'cash';
}

/**
 * Abre la ventana según cómo paga el cliente.
 * cash → entrega automática + pantalla de cambio
 * card/bizum/transfer → pantalla electrónica de confirmación
 */
export function openClientPaymentWindow(state) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  const method = ps.method || ps.preferredPayment || 'cash';
  ps.method = method;
  ps.error = null;

  if (method === 'cash') {
    const rng = mulberry32(
      hashSeed('tender', state.clock.gameTimeMs, ps.clientId || 'x', ps.totalCents),
    );
    ps.tendered = generateClientTender(ps.totalCents, rng);
    ps.tenderLocked = true;
    const given = countTotalCents(ps.tendered);
    ps.changeNeededCents = Math.max(0, given - ps.totalCents);
    // Miriam calcula el cambio a mano: sin sugerencia automática
    ps.changeGiven = emptyDrawer();
    ps.step = 'cash-change';
    state.ui.toast =
      ps.changeNeededCents > 0
        ? `${ps.clientName} entrega ${formatEuro(given)}. Calcula el cambio.`
        : `${ps.clientName} entrega el importe exacto.`;
  } else {
    ps.tenderLocked = false;
    ps.step = 'electronic';
    state.ui.toast = `${ps.clientName} quiere pagar con ${labelMethod(method)}.`;
  }
  return state;
}

/**
 * El cliente cambia de forma de pago (p. ej. tras un fallo electrónico).
 */
export function clientSwitchPayment(state, method) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  if (!['cash', 'card', 'bizum', 'transfer'].includes(method)) return state;
  ps.preferredPayment = method;
  ps.method = method;
  ps.failCount = ps.failCount || 0;
  return openClientPaymentWindow(state);
}

/** Miriam confirma el cobro electrónico que eligió el cliente. */
export function confirmElectronicPayment(state) {
  const ps = state.ui.paymentSession;
  if (!ps || ps.step !== 'electronic') return state;
  const method = ps.method;
  const fail = rollPaymentFailure(method, ps.totalCents, ps.failCount || 0);
  if (fail) {
    ps.failCount = (ps.failCount || 0) + 1;
    ps.error = fail;
    state.finance.paymentFailsToday = (state.finance.paymentFailsToday || 0) + 1;
    state.dayLog.push({
      at: state.clock.gameTimeMs,
      text: `Cobro fallido (${labelMethod(method)}): ${fail}`,
    });
    state.ui.toast = fail;
    // Permanece en electronic; el cliente puede probar otra forma
    return state;
  }
  completeNonCash(state);
  return state;
}

/**
 * Compat: si se llama selectPaymentMethod, es el cliente quien cambia de vía.
 */
export function selectPaymentMethod(state, method) {
  return clientSwitchPayment(state, method);
}

/**
 * Genera lo que entrega el cliente en efectivo (≥ total).
 * Suele pagar con billetes redondos; a veces exacto.
 */
export function generateClientTender(totalCents, rng = Math.random) {
  const result = emptyDrawer();
  if (totalCents <= 0) return result;

  const r = typeof rng === 'function' ? rng : () => Math.random();
  let payCents = totalCents;

  // ~25% entrega exacta si es razonable
  const exactOk = totalCents <= 10000 || totalCents % 100 === 0;
  if (exactOk && r() < 0.25) {
    payCents = totalCents;
  } else {
    // Redondear al alza a un billete/cantidad típica
    const ceilings = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
    let chosen = null;
    for (const c of ceilings) {
      if (c >= totalCents) {
        chosen = c;
        break;
      }
    }
    if (!chosen) {
      // Totales grandes: 1–3 billetes de 50/100/200
      chosen = Math.ceil(totalCents / 10000) * 10000;
    }
    // A veces pagan “de más” con el siguiente techo
    if (r() < 0.2 && chosen < 50000) {
      const idx = ceilings.indexOf(chosen);
      if (idx >= 0 && idx < ceilings.length - 1 && ceilings[idx + 1] >= totalCents) {
        chosen = ceilings[idx + 1];
      }
    }
    payCents = Math.max(totalCents, chosen);
  }

  // Componer payCents con pocas piezas grandes (como entrega un cliente)
  let remaining = payCents;
  const denoms = [...BILLS, ...COINS].sort((a, b) => b.cents - a.cents);
  for (const d of denoms) {
    if (remaining <= 0) break;
    // Evitar llenar de monedas pequeñas salvo lo necesario
    if (d.kind === 'coin' && remaining >= 500 && d.cents < 100) continue;
    const n = Math.floor(remaining / d.cents);
    if (n <= 0) continue;
    // Como mucho unas pocas piezas de cada billete
    const take = d.kind === 'bill' ? Math.min(n, d.cents >= 10000 ? 2 : 4) : Math.min(n, 8);
    if (take > 0) {
      result[d.id] = (result[d.id] || 0) + take;
      remaining -= take * d.cents;
    }
  }
  // Ajuste final con monedas si falta
  if (remaining > 0) {
    for (const d of [...COINS].sort((a, b) => b.cents - a.cents)) {
      const n = Math.floor(remaining / d.cents);
      if (n > 0) {
        result[d.id] = (result[d.id] || 0) + n;
        remaining -= n * d.cents;
      }
    }
  }
  // Garantía: nunca menos que el total
  if (countTotalCents(result) < totalCents) {
    result.b50 = (result.b50 || 0) + Math.ceil((totalCents - countTotalCents(result)) / 5000);
  }
  return result;
}

/** Simula rechazos de tarjeta / Bizum / transferencia */
function rollPaymentFailure(method, totalCents, failCount = 0) {
  // Tras varios fallos, baja la probabilidad (el cliente insiste)
  const ease = Math.max(0.35, 1 - failCount * 0.25);
  const r = Math.random();
  if (method === 'card') {
    if (r < 0.08 * ease) return 'Tarjeta rechazada: contacte con su banco.';
    if (r < 0.12 * ease) return 'TPV sin cobertura. Prueba otra vez o efectivo.';
    if (r < 0.15 * ease && totalCents >= 10000) return 'Tarjeta denegada por límite.';
  }
  if (method === 'bizum') {
    if (r < 0.1 * ease) return 'Bizum no recibido. El cliente debe repetir el envío.';
    if (r < 0.14 * ease) return 'Bizum: usuario no encontrado. Revisa el móvil.';
    if (r < 0.17 * ease) return 'Bizum caducado. Pide uno nuevo.';
  }
  if (method === 'transfer') {
    if (r < 0.06 * ease) return 'Transferencia no llegada. Espera o cobra en efectivo.';
    if (r < 0.09 * ease) return 'IBAN incorrecto. Corrige y reintenta.';
  }
  return null;
}

/** Reintento manual tras fallo (misma vía o otra) */
export function retryPaymentMethod(state, method) {
  return clientSwitchPayment(state, method || state.ui.paymentSession?.method || 'cash');
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

/** @deprecated El cliente ya entrega solo; se mantiene por compat. */
export function confirmTender(state) {
  const ps = state.ui.paymentSession;
  if (!ps) return state;
  const given = countTotalCents(ps.tendered);
  if (given < ps.totalCents) {
    ps.error = `Falta dinero. Entregado ${formatEuro(given)}, total ${formatEuro(ps.totalCents)}.`;
    return state;
  }
  ps.changeNeededCents = given - ps.totalCents;
  ps.changeGiven = emptyDrawer(); // Miriam calcula a mano
  ps.step = 'cash-change';
  ps.error = null;
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
