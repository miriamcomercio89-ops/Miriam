import './style.css';
import {
  advanceClock,
  setSpeed,
  formatGameClock,
  gameDate,
  isOpenHours,
  closedReason,
  isClosedDay,
  speedLabel,
} from './game/time.js';
import {
  listSlots,
  saveToSlot,
  loadFromSlot,
  exportGame,
  importGame,
  newGame,
} from './game/save.js';
import {
  maybeSpawnCustomers,
  sellToCurrent,
  reserveForCurrent,
  dismissCurrent,
  orderStock,
  processArrivingOrders,
} from './game/customers.js';
import {
  selectPaymentMethod,
  adjustTender,
  confirmTender,
  adjustChange,
  confirmChange,
  closePaymentSession,
  cancelPayment,
  payPrize,
  formatEuro,
  ALL_DENOMS,
  countTotalCents,
  drawerTotalCents,
} from './game/cash.js';
import { buildDayCloseSummary, closeDay } from './game/economy.js';
import { PRODUCTS } from './data/products.js';
import { BILLS, COINS } from './data/money.js';
import { sfx } from './game/sounds.js';

let state = null;
let toastTimer = null;
let lastFullRender = 0;
let needsFullRender = true;
let lastClientId = null;
let lastClockMinute = -1;

const app = document.getElementById('app');

function showToast(msg) {
  state.ui.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (state) state.ui.toast = null;
    needsFullRender = true;
    render();
  }, 3200);
}

function loop(ts) {
  if (state && state.ui.screen !== 'menu') {
    advanceClock(state);
    if (state.ui.screen === 'counter') {
      const before = state.customers.current?.id || null;
      maybeSpawnCustomers(state);
      const after = state.customers.current?.id || null;
      if (before !== after) needsFullRender = true;
    }

    const minute = Math.floor(state.clock.gameTimeMs / 60000);
    if (needsFullRender) {
      render();
      needsFullRender = false;
      lastFullRender = ts;
      lastClientId = state.customers.current?.id || null;
      lastClockMinute = minute;
    } else {
      renderClockOnly();
      // Actualizar texto de espera cada minuto de juego sin re-montar botones
      if (state.ui.screen === 'counter' && minute !== lastClockMinute) {
        lastClockMinute = minute;
        const hint = document.getElementById('crowd-hint');
        if (hint) hint.textContent = crowdHint();
      }
    }
  }
  requestAnimationFrame(loop);
}

function renderClockOnly() {
  const el = document.getElementById('live-clock');
  const st = document.getElementById('live-status');
  if (!el || !state) return;
  el.textContent = formatGameClock(state);
  if (st) {
    const open = isOpenHours(state) && !isClosedDay(state);
    st.textContent = open ? 'Abierta' : closedReason(state) || 'Fuera de horario';
    st.className = `status-pill ${open ? 'open' : 'closed'}`;
  }
}

function render() {
  if (!state) {
    renderMenu();
    return;
  }
  if (state.ui.screen === 'menu') {
    renderMenu();
    return;
  }
  if (state.ui.screen === 'cash') {
    renderCash();
    return;
  }
  if (state.ui.screen === 'close') {
    renderClose();
    return;
  }
  if (state.ui.screen === 'saves') {
    renderSavesInGame();
    return;
  }
  if (state.ui.screen === 'stock') {
    renderStock();
    return;
  }
  if (state.ui.screen === 'prize') {
    renderPrize();
    return;
  }
  renderCounter();
}

function renderMenu() {
  const slots = listSlots();
  app.innerHTML = `
    <div class="menu-screen">
      <div class="menu-card">
        <div class="muted">Álora · Málaga · Única administración del pueblo</div>
        <h1>Loterías Álora</h1>
        <p class="tagline">Simulador realista de mostrador. Tú eres Miriam, la única empleada.</p>
        <div class="actions">
          <button class="btn primary" id="btn-new">Nueva partida</button>
          <label class="btn ghost" style="cursor:pointer">
            Importar archivo
            <input id="import-file" type="file" accept="application/json" hidden />
          </label>
        </div>
        <h3 style="margin-top:22px;font-family:var(--font-display);color:var(--brand-deep)">Partidas guardadas</h3>
        <div class="slot-grid">
          ${slots
            .map((s) => {
              if (s.empty) {
                return `<div class="slot"><div><strong>Hueco ${s.slot}</strong><div class="muted">Vacío</div></div></div>`;
              }
              const when = s.gameTimeMs
                ? new Date(s.gameTimeMs).toLocaleString('es-ES', { timeZone: 'UTC' })
                : '';
              return `<div class="slot">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${when} · Día ${s.daysPlayed ?? 0}</div>
                </div>
                <div class="actions">
                  <button class="btn primary" data-load="${s.slot}">Continuar</button>
                </div>
              </div>`;
            })
            .join('')}
        </div>
        <p class="disclaimer">
          Fan-made / no oficial. Nombres de Loterías y Apuestas del Estado y ONCE usados solo con fines de simulación.
          Juego responsable · +18. El tiempo avanza 4× más lento. Horario: L–V 08:00–20:00.
        </p>
      </div>
    </div>
  `;

  document.getElementById('btn-new').onclick = () => {
    sfx.open();
    state = newGame();
    processArrivingOrders(state);
    state.ui.screen = 'counter';
    showToast('Bienvenida, Miriam. La administración abre a las 08:00.');
    needsFullRender = true;
    render();
  };

  document.getElementById('import-file').onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      state = await importGame(f);
      showToast('Partida importada');
      sfx.success();
      needsFullRender = true;
      render();
    } catch {
      sfx.error();
      alert('No se pudo importar el archivo');
    }
  };

  app.querySelectorAll('[data-load]').forEach((btn) => {
    btn.onclick = () => {
      const slot = Number(btn.getAttribute('data-load'));
      state = loadFromSlot(slot);
      if (!state) return;
      sfx.click();
      showToast(`Partida cargada (hueco ${slot})`);
      needsFullRender = true;
      render();
    };
  });
}

function topbarHTML() {
  const d = gameDate(state);
  const dateStr = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const open = isOpenHours(state) && !isClosedDay(state);
  const speed = state.clock.paused ? 0 : state.clock.speed;
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-name">Loterías Álora</div>
        <div class="brand-sub">Miriam · Álora (Málaga) · ~13.000 hab.</div>
      </div>
      <div class="clock-block">
        <div class="clock-time" id="live-clock">${formatGameClock(state)}</div>
        <div class="clock-date">${dateStr}</div>
        <div id="live-status" class="status-pill ${open ? 'open' : 'closed'}">${
          open ? 'Abierta' : closedReason(state) || 'Fuera de horario'
        }</div>
      </div>
      <div class="speed-controls">
        <button class="btn ${speed === 0 ? 'active' : ''}" data-speed="0">Pausa</button>
        <button class="btn ${speed === 1 ? 'active' : ''}" data-speed="1">Normal</button>
        <button class="btn ${speed === 15 ? 'active' : ''}" data-speed="15">Rápido</button>
        <button class="btn ${speed === 60 ? 'active' : ''}" data-speed="60">Muy rápido</button>
      </div>
    </header>
  `;
}

function bindTopbar() {
  app.querySelectorAll('[data-speed]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      setSpeed(state, Number(btn.getAttribute('data-speed')));
      needsFullRender = true;
      render();
    };
  });
}

function sideNav() {
  return `
    <aside class="panel nav-side">
      <h3>Oficina</h3>
      <button class="btn" data-nav="counter">Mostrador</button>
      <button class="btn" data-nav="prize">Pagar premio</button>
      <button class="btn" data-nav="stock">Stock y pedidos</button>
      <button class="btn" data-nav="close">Cierre y balance</button>
      <button class="btn" data-nav="saves">Guardar / exportar</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:14px 0" />
      <div class="stat-row"><span>Banco</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
      <div class="stat-row"><span>Caja</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      <div class="stat-row"><span>Ventas hoy</span><strong>${formatEuro(state.finance.daySalesCents)}</strong></div>
      <div class="stat-row"><span>Comisión hoy</span><strong>${formatEuro(state.finance.dayCommissionCents)}</strong></div>
      <div class="stat-row"><span>Clientes hoy</span><strong>${state.customers.servedToday}</strong></div>
      <div class="stat-row"><span>Velocidad</span><strong>${speedLabel(state.clock.speed, state.clock.paused)}</strong></div>
    </aside>
  `;
}

function bindNav() {
  app.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      state.ui.screen = btn.getAttribute('data-nav');
      needsFullRender = true;
      render();
    };
  });
}

function toastHTML() {
  if (!state.ui.toast) return '';
  return `<div class="toast">${escapeHtml(state.ui.toast)}</div>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderCounter() {
  const client = state.customers.current;
  let clientBlock;
  if (!isOpenHours(state) || isClosedDay(state)) {
    clientBlock = `
      <div class="hero-counter">
        <h2>Oficina cerrada</h2>
        <p>${closedReason(state) || 'Fuera de horario (08:00–20:00). Puedes revisar stock o hacer el cierre del día.'}</p>
      </div>`;
  } else if (!client) {
    clientBlock = `
      <div class="hero-counter">
        <h2>Mostrador listo</h2>
        <p>Esperando clientes en Álora… El tiempo corre ${state.clock.paused ? 'en pausa' : '4× más lento (con tu velocidad)'}.
        Hoy hay <span id="crowd-hint">${crowdHint()}</span> afluencia.</p>
      </div>`;
  } else {
    const req = client.request;
    clientBlock = `
      <div class="client-card">
        <div class="muted">${client.regular ? 'Cliente habitual' : 'Visitante de paso'} · ${escapeHtml(client.street || '')}</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Quiere: <strong>${escapeHtml(req.productName)}</strong> × ${req.qty}
          — ${formatEuro(req.totalCents)}</p>
        <p class="muted">Pago preferido: ${payLabel(client.prefersPayment)}</p>
        <div class="actions">
          <button class="btn primary" id="btn-sell">Vender y cobrar</button>
          <button class="btn" id="btn-reserve">Reservar sin pagar</button>
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
  }

  const log = [...state.dayLog].slice(-12).reverse();

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout">
        ${sideNav()}
        <section class="panel counter-stage">
          ${clientBlock}
          <div>
            <h3>Registro del día</h3>
            <div class="log">
              ${
                log.length
                  ? log.map((l) => `<div class="log-item">${escapeHtml(l.text)}</div>`).join('')
                  : '<div class="muted">Aún no hay movimientos.</div>'
              }
            </div>
          </div>
        </section>
        <aside class="panel">
          <h3>Caja rápida</h3>
          <p class="muted">Fondo de cambio y arqueo completo en el cierre.</p>
          <div class="stat-row"><span>En cajón</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
          <div class="stat-row"><span>Pedidos pendientes</span><strong>${state.orders.filter((o) => o.status === 'pending').length}</strong></div>
          <div class="stat-row"><span>Habituales</span><strong>${state.customers.regulars.length}</strong></div>
          <p class="disclaimer" style="margin-top:16px">Fan-made · no oficial · +18</p>
        </aside>
      </div>
    </div>
    ${toastHTML()}
  `;

  bindTopbar();
  bindNav();

  const sell = document.getElementById('btn-sell');
  if (sell) {
    sell.onclick = () => {
      sfx.scan();
      const before = state.ui.screen;
      sellToCurrent(state);
      if (state.ui.toast && state.ui.screen === before) sfx.error();
      needsFullRender = true;
      render();
    };
  }
  const reserve = document.getElementById('btn-reserve');
  if (reserve) {
    reserve.onclick = () => {
      sfx.click();
      reserveForCurrent(state);
      needsFullRender = true;
      render();
    };
  }
  const skip = document.getElementById('btn-skip');
  if (skip) {
    skip.onclick = () => {
      sfx.click();
      dismissCurrent(state, `${state.customers.current?.name || 'Cliente'} se va sin comprar`);
      state.customers.current = null;
      needsFullRender = true;
      render();
    };
  }
}

function crowdHint() {
  const d = gameDate(state);
  const m = d.getUTCMonth() + 1;
  if (m === 12) return 'mucha (Navidad)';
  if (m === 1 && d.getUTCDate() <= 10) return 'alta (El Niño)';
  if (d.getUTCDay() === 5) return 'media-alta (Euromillones)';
  return 'normal';
}

function payLabel(m) {
  return { cash: 'efectivo', card: 'tarjeta', bizum: 'Bizum', transfer: 'transferencia' }[m] || m;
}

function renderCash() {
  const ps = state.ui.paymentSession;
  if (!ps) {
    state.ui.screen = 'counter';
    render();
    return;
  }

  const tendered = countTotalCents(ps.tendered);
  const changeSum = countTotalCents(ps.changeGiven || {});

  let body = '';
  if (ps.step === 'method') {
    body = `
      <p>Cliente: <strong>${escapeHtml(ps.clientName)}</strong> · Prefiere ${payLabel(ps.preferredPayment)}</p>
      <div class="totals" style="margin:12px 0">
        <div class="total-box">Total a cobrar<strong>${formatEuro(ps.totalCents)}</strong></div>
      </div>
      <div class="method-grid">
        <button class="btn primary" data-method="cash">Efectivo</button>
        <button class="btn" data-method="card">Tarjeta</button>
        <button class="btn" data-method="bizum">Bizum</button>
        <button class="btn" data-method="transfer">Transferencia</button>
      </div>
      <p class="muted" style="margin-top:10px">Tarjeta, Bizum y transferencia cobran el importe exacto (sin cambio).</p>
    `;
  } else if (ps.step === 'cash-tender') {
    body = `
      <p>El cliente te da billetes y monedas. Marca lo recibido.</p>
      <div class="totals">
        <div class="total-box">A cobrar<strong>${formatEuro(ps.totalCents)}</strong></div>
        <div class="total-box">Entregado<strong>${formatEuro(tendered)}</strong></div>
        <div class="total-box">Cambio teórico<strong>${formatEuro(Math.max(0, tendered - ps.totalCents))}</strong></div>
      </div>
      ${denomEditor('tender')}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-tender">Continuar al cambio</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>
    `;
  } else if (ps.step === 'cash-change') {
    body = `
      <p>Elige el cambio en billetes y monedas. Debe cuadrar exactamente.</p>
      <div class="totals">
        <div class="total-box">Cambio a devolver<strong>${formatEuro(ps.changeNeededCents || 0)}</strong></div>
        <div class="total-box">Tu selección<strong>${formatEuro(changeSum)}</strong></div>
        <div class="total-box">En caja<strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      </div>
      ${denomEditor('change')}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-change">Confirmar cobro</button>
        <button class="btn" id="btn-back-tender">Volver</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>
    `;
  } else if (ps.step === 'done') {
    body = `
      <div class="hero-counter">
        <h2>Cobro completado</h2>
        <p>${escapeHtml(ps.clientName)} · ${formatEuro(ps.totalCents)} · ${payLabel(ps.method)}</p>
      </div>
      <div class="actions">
        <button class="btn primary" id="btn-next-client">Siguiente</button>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel cash-screen" style="margin-top:16px">
        <h2>Caja</h2>
        <div class="muted">${ps.items.map((i) => `${i.name} ×${i.qty}`).join(' · ')}</div>
        ${ps.error ? `<div class="error-box" style="margin:10px 0">${escapeHtml(ps.error)}</div>` : ''}
        ${body}
      </div>
    </div>
    ${toastHTML()}
  `;

  bindTopbar();

  app.querySelectorAll('[data-method]').forEach((btn) => {
    btn.onclick = () => {
      const m = btn.getAttribute('data-method');
      selectPaymentMethod(state, m);
      if (m !== 'cash') sfx.cash();
      else sfx.click();
      if (state.ui.toast) showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-adj]').forEach((btn) => {
    btn.onclick = () => {
      const kind = btn.getAttribute('data-adj');
      const id = btn.getAttribute('data-id');
      const delta = Number(btn.getAttribute('data-delta'));
      if (kind === 'tender') adjustTender(state, id, delta);
      else adjustChange(state, id, delta);
      sfx.click();
      needsFullRender = true;
      render();
    };
  });

  const ct = document.getElementById('btn-confirm-tender');
  if (ct) {
    ct.onclick = () => {
      confirmTender(state);
      if (state.ui.paymentSession?.error) sfx.error();
      else sfx.scan();
      needsFullRender = true;
      render();
    };
  }
  const cc = document.getElementById('btn-confirm-change');
  if (cc) {
    cc.onclick = () => {
      confirmChange(state);
      if (state.ui.paymentSession?.error) sfx.error();
      else {
        sfx.cash();
        if (state.ui.toast) showToast(state.ui.toast);
      }
      needsFullRender = true;
      render();
    };
  }
  const back = document.getElementById('btn-back-tender');
  if (back) {
    back.onclick = () => {
      state.ui.paymentSession.step = 'cash-tender';
      state.ui.paymentSession.error = null;
      needsFullRender = true;
      render();
    };
  }
  const cancel = document.getElementById('btn-cancel-pay');
  if (cancel) {
    cancel.onclick = () => {
      cancelPayment(state);
      needsFullRender = true;
      render();
    };
  }
  const next = document.getElementById('btn-next-client');
  if (next) {
    next.onclick = () => {
      closePaymentSession(state);
      sfx.success();
      needsFullRender = true;
      render();
    };
  }
}

function denomEditor(kind) {
  const ps = state.ui.paymentSession;
  const counts = kind === 'tender' ? ps.tendered : ps.changeGiven;
  const groups = [
    ['Billetes', BILLS],
    ['Monedas', COINS],
  ];
  return groups
    .map(
      ([title, list]) => `
      <h3 style="margin-top:14px">${title}</h3>
      <div class="denom-grid">
        ${list
          .map((d) => {
            const n = counts[d.id] || 0;
            return `<div class="denom">
              <div class="label">${d.label}</div>
              <div class="row">
                <button data-adj="${kind}" data-id="${d.id}" data-delta="-1">−</button>
                <strong>${n}</strong>
                <button data-adj="${kind}" data-id="${d.id}" data-delta="1">+</button>
              </div>
            </div>`;
          })
          .join('')}
      </div>`,
    )
    .join('');
}

function renderClose() {
  const summary = buildDayCloseSummary(state);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Cierre y balance</h2>
          <p class="muted">Al confirmar, se aplican gastos del día y saltas al siguiente día laborable a las 08:00.</p>
          <div class="close-summary">
            <div class="stat-row"><span>Fecha</span><strong>${summary.date}</strong></div>
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(summary.salesCents)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(summary.commissionCents)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(summary.prizesPaidCents)}</strong></div>
            <div class="stat-row"><span>Gastos (hoy al cerrar)</span><strong>${formatEuro(summary.expensesCents)}</strong></div>
            <div class="stat-row"><span>Cajón</span><strong>${formatEuro(summary.drawerCents)}</strong></div>
            <div class="stat-row"><span>Banco</span><strong>${formatEuro(summary.bankCents)}</strong></div>
            <div class="stat-row"><span>Clientes atendidos</span><strong>${summary.customersServed}</strong></div>
            <div class="stat-row"><span>Siguiente día laborable</span><strong>${summary.nextDay}</strong></div>
          </div>
          ${
            summary.nextDayReasonSkip?.length
              ? `<p class="muted" style="margin-top:10px">Se saltan: ${summary.nextDayReasonSkip.join(' · ')}</p>`
              : ''
          }
          <h3 style="margin-top:18px">Arqueo de caja</h3>
          <div class="denom-grid">
            ${ALL_DENOMS.map((d) => {
              const n = state.finance.drawer[d.id] || 0;
              if (!n) return '';
              return `<div class="denom"><div class="label">${d.label}</div><strong>× ${n}</strong></div>`;
            }).join('')}
          </div>
          <div class="actions" style="margin-top:18px">
            <button class="btn accent" id="btn-do-close">Hacer balance y cerrar día</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-do-close').onclick = () => {
    // Autosave slot 1 soft reminder — actual save is separate; also auto-save slot last used if any
    const { summary: s } = closeDay(state);
    sfx.success();
    // Guardar automáticamente en el hueco 1 si existe o está vacío? Plan: save on day close — use slot 1 as autosave working copy OR ask. We'll autosave to slot marked via state.meta.activeSlot or default 1.
    const slot = state.meta.activeSlot || 1;
    state.meta.activeSlot = slot;
    saveToSlot(state, slot);
    showToast(`Día cerrado. Siguiente: ${s.nextDay}. Guardado en hueco ${slot}.`);
    needsFullRender = true;
    render();
  };
}

function renderSavesInGame() {
  const slots = listSlots();
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Guardar / exportar</h2>
          <div class="slot-grid">
            ${slots
              .map(
                (s) => `
              <div class="slot">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${s.empty ? 'Vacío' : `Días ${s.daysPlayed ?? 0}`}</div>
                </div>
                <div class="actions">
                  <button class="btn primary" data-save="${s.slot}">Guardar aquí</button>
                  ${s.empty ? '' : `<button class="btn" data-load="${s.slot}">Cargar</button>`}
                </div>
              </div>`,
              )
              .join('')}
          </div>
          <div class="actions" style="margin-top:12px">
            <button class="btn" id="btn-export">Exportar archivo JSON</button>
            <label class="btn ghost" style="cursor:pointer">
              Importar archivo
              <input id="import-file" type="file" accept="application/json" hidden />
            </label>
            <button class="btn danger" id="btn-menu">Volver al menú</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  app.querySelectorAll('[data-save]').forEach((btn) => {
    btn.onclick = () => {
      const slot = Number(btn.getAttribute('data-save'));
      state.meta.activeSlot = slot;
      saveToSlot(state, slot);
      sfx.success();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
  app.querySelectorAll('[data-load]').forEach((btn) => {
    btn.onclick = () => {
      const slot = Number(btn.getAttribute('data-load'));
      const loaded = loadFromSlot(slot);
      if (!loaded) return;
      state = loaded;
      state.meta.activeSlot = slot;
      sfx.click();
      showToast(`Cargado hueco ${slot}`);
      needsFullRender = true;
      render();
    };
  });
  document.getElementById('btn-export').onclick = () => {
    exportGame(state);
    sfx.click();
    showToast('Archivo exportado');
  };
  document.getElementById('import-file').onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      state = await importGame(f);
      sfx.success();
      showToast('Partida importada');
      needsFullRender = true;
      render();
    } catch {
      sfx.error();
      alert('Archivo no válido');
    }
  };
  document.getElementById('btn-menu').onclick = () => {
    if (confirm('¿Volver al menú? Guarda antes si no quieres perder el progreso.')) {
      state = null;
      renderMenu();
    }
  };
}

function renderPrize() {
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Pagar premio</h2>
          <p class="muted">Si hay efectivo suficiente en caja, puedes pagarlo al momento. Si no, usa transferencia desde el banco.</p>
          <label>Nombre del cliente<br/>
            <input id="prize-name" value="${escapeHtml(state.customers.current?.name || '')}" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" />
          </label>
          <label>Importe (€)<br/>
            <input id="prize-amount" type="number" min="0.01" step="0.01" value="5" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" />
          </label>
          <label>Nota<br/>
            <input id="prize-note" placeholder="Ej. Primitiva acierto 3" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" />
          </label>
          <div class="actions">
            <button class="btn primary" id="btn-prize-cash">Pagar en efectivo</button>
            <button class="btn" id="btn-prize-transfer">Pagar por transferencia</button>
          </div>
          <div class="stat-row" style="margin-top:16px"><span>Caja disponible</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
          <div class="stat-row"><span>Banco disponible</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  const doPay = (method) => {
    const name = document.getElementById('prize-name').value.trim() || 'Cliente';
    const euros = parseFloat(document.getElementById('prize-amount').value);
    const note = document.getElementById('prize-note').value.trim();
    const cents = Math.round((euros || 0) * 100);
    const ok = payPrize(state, { amountCents: cents, clientName: name, method, note });
    if (ok) sfx.cash();
    else sfx.error();
    showToast(state.ui.toast);
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-prize-cash').onclick = () => doPay('cash');
  document.getElementById('btn-prize-transfer').onclick = () => doPay('transfer');
}

function renderStock() {
  const physical = PRODUCTS.filter((p) => p.stockType === 'physical');
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Stock y pedidos</h2>
          <p class="muted">Los productos de terminal no llevan stock físico. Pedidos: plazo según producto. Reservas de clientes sin pago previo.</p>
          <div class="stock-list">
            ${physical
              .map((p) => {
                const qty = state.stock[p.id] ?? 0;
                return `<div class="stock-item">
                  <span><strong>${escapeHtml(p.name)}</strong> <span class="muted">(${p.org})</span></span>
                  <span>
                    ${qty}
                    <button class="btn" style="padding:4px 8px;margin-left:8px" data-order="${p.id}">Pedir 20</button>
                  </span>
                </div>`;
              })
              .join('')}
          </div>
          <h3 style="margin-top:18px">Pedidos / reservas</h3>
          <div class="log">
            ${
              state.orders.length
                ? state.orders
                    .slice()
                    .reverse()
                    .slice(0, 30)
                    .map(
                      (o) =>
                        `<div class="log-item">${o.status} · ${escapeHtml(o.productName)} ×${o.qty} · llegada ${o.arriveOnYmd}${
                          o.clientName ? ` · ${escapeHtml(o.clientName)}` : ''
                        }</div>`,
                    )
                    .join('')
                : '<div class="muted">Sin pedidos.</div>'
            }
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  app.querySelectorAll('[data-order]').forEach((btn) => {
    btn.onclick = () => {
      orderStock(state, btn.getAttribute('data-order'), 20);
      sfx.click();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
}

// Boot
state = null;
renderMenu();
requestAnimationFrame(loop);

// Expose for debug
window.__loterias = () => state;
