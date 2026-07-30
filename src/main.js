import './style.css';
import {
  advanceClock,
  setSpeed,
  formatGameClock,
  gameDate,
  gameYmd,
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
  maybeAutosave,
} from './game/save.js';
import {
  maybeSpawnCustomers,
  reserveForCurrent,
  dismissCurrent,
  orderStock,
  processArrivingOrders,
  checkCurrentTicket,
  crowdFactor,
  isTouristSeason,
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
  startPayment,
  countTotalCents,
  drawerTotalCents,
} from './game/cash.js';
import { buildDayCloseSummary, closeDay, dayProfitBreakdown } from './game/economy.js';
import {
  PRODUCTS,
  TPV_CATEGORIES,
  productsByTpvCategory,
  getProduct,
} from './data/products.js';
import { BILLS, COINS } from './data/money.js';
import {
  sfx,
  startMusic,
  setMusicEnabled,
  setSfxEnabled,
  isMusicEnabled,
} from './game/sounds.js';
import { ensureDrawsResolved, listDrawHistory } from './game/draws.js';
import { formatSelection } from './game/tickets.js';
import { payTicketPrize, startPrizeManagement } from './game/prizes.js';
import { downloadTicketPdf, downloadSaleReceiptPdf } from './game/pdf.js';
import { eventOn } from './data/events.js';
import { GAME_VERSION } from './game/state.js';
import {
  openTpv,
  closeTpv,
  setTpvCategory,
  addTpvProduct,
  removeTpvLine,
  setLineQty,
  applyDictatedNumbers,
  cancelNumberEntry,
  rerollLineNumbers,
  startDictateLine,
  tpvTotalCents,
  tpvReadyToCharge,
  tpvToSaleItems,
  formatLineSelection,
  validateWishlist,
  goTpvReceipt,
  backTpvEdit,
  confirmCancelLine,
  dismissCancelPrompt,
  CANCEL_REASONS,
} from './game/tpv.js';
import {
  startArqueo,
  adjustArqueoCount,
  confirmArqueo,
  closeArqueo,
  buildWeeklyStatement,
  isMonday,
} from './game/audit.js';
import { jackpotList, ensureJackpots, formatJackpotShort } from './game/jackpots.js';
import {
  todaysDrawNotices,
  specialOrderDeadlines,
  createCalendarOrder,
} from './game/notices.js';

let state = null;
let toastTimer = null;
let needsFullRender = true;
let lastClockMinute = -1;
let lastAutosaveRealMs = Date.now();
let tpvKeysBound = false;

const app = document.getElementById('app');

function showToast(msg) {
  if (!state) return;
  state.ui.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (state) state.ui.toast = null;
    needsFullRender = true;
    render();
  }, 3500);
}

function maybeStartMusic() {
  if (state?.settings?.music) {
    setMusicEnabled(true);
    startMusic();
  } else if (state?.settings) {
    setMusicEnabled(false);
  }
  if (state?.settings?.sfx != null) setSfxEnabled(!!state.settings.sfx);
}

function loop() {
  if (state && state.ui.screen !== 'menu') {
    advanceClock(state);
    ensureDrawsResolved(state);
    ensureJackpots(state);
    if (state.ui.screen === 'counter') {
      const before = state.customers.current?.id || null;
      const qBefore = state.customers.queue?.length || 0;
      maybeSpawnCustomers(state);
      const after = state.customers.current?.id || null;
      const qAfter = state.customers.queue?.length || 0;
      if (before !== after || qBefore !== qAfter) needsFullRender = true;
    }

    const prevAutosave = lastAutosaveRealMs;
    lastAutosaveRealMs = maybeAutosave(state, lastAutosaveRealMs);
    if (lastAutosaveRealMs !== prevAutosave) {
      // Silent autosave — clear toast from saveToSlot
      if (state.ui.toast?.startsWith('Partida guardada')) state.ui.toast = null;
    }

    maybeMondayHint();

    const minute = Math.floor(state.clock.gameTimeMs / 60000);
    if (needsFullRender) {
      render();
      needsFullRender = false;
      lastClockMinute = minute;
    } else {
      renderClockOnly();
      if (state.ui.screen === 'counter' && minute !== lastClockMinute) {
        lastClockMinute = minute;
        const hint = document.getElementById('crowd-hint');
        if (hint) hint.textContent = crowdHint();
        const evEl = document.getElementById('event-banner');
        if (evEl) evEl.textContent = eventBannerText();
      }
    }
  }
  requestAnimationFrame(loop);
}

function maybeMondayHint() {
  if (!state || !isMonday(state)) return;
  const ymd = gameYmd(state);
  if (state.ui.mondayHintYmd === ymd) return;
  state.ui.mondayHintYmd = ymd;
  showToast('Lunes: revisa el extracto semanal (menú Extracto semanal).');
  needsFullRender = true;
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
  if (!state || state.ui.screen === 'menu') return renderMenu();
  if (state.ui.screen === 'cash') return renderCash();
  if (state.ui.screen === 'tpv') return renderTpv();
  if (state.ui.screen === 'close') return renderClose();
  if (state.ui.screen === 'saves') return renderSavesInGame();
  if (state.ui.screen === 'stock') return renderStock();
  if (state.ui.screen === 'prize') return renderPrize();
  if (state.ui.screen === 'draws') return renderDraws();
  if (state.ui.screen === 'management') return renderManagement();
  if (state.ui.screen === 'fichas') return renderFichas();
  if (state.ui.screen === 'arqueo') return renderArqueo();
  if (state.ui.screen === 'weekly') return renderWeekly();
  if (state.ui.screen === 'stats') return renderStats();
  return renderCounter();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function toastHTML() {
  if (!state?.ui?.toast) return '';
  return `<div class="toast">${escapeHtml(state.ui.toast)}</div>`;
}

function payLabel(m) {
  return { cash: 'efectivo', card: 'tarjeta', bizum: 'Bizum', transfer: 'transferencia', managed: 'gestión' }[m] || m;
}

function crowdHint() {
  const d = gameDate(state);
  const m = d.getUTCMonth() + 1;
  const ev = eventOn(gameYmd(state), state.events);
  if (ev) return `alta (${ev.name})`;
  if (m === 12) return 'mucha (Navidad)';
  if (m === 1 && d.getUTCDate() <= 10) return 'alta (El Niño)';
  if (d.getUTCDay() === 5) return 'media-alta (Euromillones)';
  return 'normal';
}

function eventBannerText() {
  const ev = eventOn(gameYmd(state), state.events);
  return ev ? `Evento en Álora: ${ev.name}` : '';
}

function dictateHint(mode) {
  const hints = {
    nacional: '5 cifras (ej. 45821)',
    triplex: '3 cifras (ej. 742)',
    '6from49': '6 números 1–49 y reintegro (ej. 1 8 15 22 33 41 r3)',
    euro: '5 números | 2 estrellas (ej. 1 2 3 4 5 | 6 7)',
    eurojackpot: '5 números | 2 estrellas (ej. 1 2 3 4 5 | 6 7)',
    gordo: '5 números 1–54 y clave (ej. 3 12 20 33 50 clave 7)',
    quiniela: '14 signos 1/X/2 (ej. 1X2112X12X121)',
    quinigol: '6 resultados 0/1/2/M',
    superonce: '5 números del 1 al 49',
    '5from40': '5 números del 1 al 40',
    lototurf: '5 números del 1 al 49',
  };
  return hints[mode] || 'Escribe la combinación dictada';
}

function renderMenu() {
  const slots = listSlots();
  app.innerHTML = `
    <div class="menu-screen">
      <div class="menu-card">
        <div class="muted">Álora · Málaga · v${GAME_VERSION}</div>
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
                  <div class="muted">${when} · Día ${s.daysPlayed ?? 0} · v${s.gameVersion || '?'}</div>
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
          Juego responsable · +18. Versión ${GAME_VERSION}: TPV con ticket, arqueo, botes, extracto semanal y encargos de calendario.
        </p>
      </div>
    </div>
  `;

  document.getElementById('btn-new').onclick = () => {
    sfx.open();
    state = newGame();
    processArrivingOrders(state);
    ensureDrawsResolved(state);
    maybeStartMusic();
    state.ui.screen = 'counter';
    lastAutosaveRealMs = Date.now();
    showToast('Bienvenida, Miriam. Versión 0.3 lista. Abre el TPV para vender.');
    needsFullRender = true;
    render();
  };

  document.getElementById('import-file').onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      state = await importGame(f);
      maybeStartMusic();
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
      maybeStartMusic();
      sfx.click();
      showToast(`Partida cargada (hueco ${slot})`);
      needsFullRender = true;
      render();
    };
  });
}

function drawNoticeBannerHTML() {
  const notices = todaysDrawNotices(state);
  if (!notices.length) return '';
  return `<div class="notice-banner">Hoy hay sorteo de: ${escapeHtml(notices.join(', '))}</div>`;
}

function jackpotStripHTML() {
  const list = jackpotList(state).slice(0, 4);
  if (!list.length) return '';
  return `<div class="jackpot-strip">${list
    .map((j) => `<span><strong>${escapeHtml(j.name)}</strong> ${escapeHtml(formatJackpotShort(j.cents))}</span>`)
    .join('')}</div>`;
}

function touristHintHTML() {
  if (!isTouristSeason(state)) return '';
  return `<div class="muted" style="font-size:0.85rem;margin-top:4px">Temporada turística (Caminito / El Chorro): más visitantes.</div>`;
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
  const ev = eventBannerText();
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-name">Loterías Álora</div>
        <div class="brand-sub">Miriam · Álora · v${GAME_VERSION}${ev ? ` · ${escapeHtml(ev)}` : ''}</div>
        ${touristHintHTML()}
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
    ${drawNoticeBannerHTML()}
    ${jackpotStripHTML()}
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
  const profit = dayProfitBreakdown(state);
  const openMgmt = (state.prizeManagement || []).filter((c) => c.status !== 'settled').length;
  const musicOn = state.settings?.music !== false && isMusicEnabled();
  return `
    <aside class="panel nav-side">
      <h3>Oficina</h3>
      <button class="btn" data-nav="counter">Mostrador</button>
      <button class="btn" data-nav="fichas">Abonados / Peñas</button>
      <button class="btn" data-nav="draws">Sorteos</button>
      <button class="btn" data-nav="prize">Pagar premio</button>
      <button class="btn" data-nav="management">Gestión premios${openMgmt ? ` (${openMgmt})` : ''}</button>
      <button class="btn" data-nav="stock">Stock y pedidos</button>
      <button class="btn" data-nav="arqueo">Arqueo</button>
      <button class="btn" data-nav="weekly">Extracto semanal</button>
      <button class="btn" data-nav="stats">Estadísticas</button>
      <button class="btn" data-nav="close">Cierre y balance</button>
      <button class="btn" data-nav="saves">Guardar / exportar</button>
      <button class="btn" id="btn-music-toggle">${musicOn ? '♪ Música: ON' : '♪ Música: OFF'}</button>
      <hr style="border:none;border-top:1px solid var(--line);margin:14px 0" />
      <div class="stat-row"><span>Banco</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
      <div class="stat-row"><span>Caja</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      <div class="stat-row"><span>Ventas hoy</span><strong>${formatEuro(state.finance.daySalesCents)}</strong></div>
      <div class="stat-row"><span>Comisión hoy</span><strong>${formatEuro(profit.commissionCents)}</strong></div>
      <div class="stat-row"><span>Beneficio hoy*</span><strong>${formatEuro(profit.profitCents)}</strong></div>
      <div class="stat-row"><span>Clientes hoy</span><strong>${state.customers.servedToday}</strong></div>
      <div class="stat-row"><span>En cola</span><strong>${state.customers.queue?.length || 0}</strong></div>
      <div class="stat-row"><span>Velocidad</span><strong>${speedLabel(state.clock.speed, state.clock.paused)}</strong></div>
      <p class="muted" style="font-size:0.78rem;margin-top:8px">*Comisiones − gastos del día</p>
    </aside>
  `;
}

function bindNav() {
  app.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      const screen = btn.getAttribute('data-nav');
      if (screen === 'fichas') state.ui.fichaId = null;
      if (screen === 'arqueo') {
        startArqueo(state, 'midday');
      } else {
        state.ui.screen = screen;
      }
      needsFullRender = true;
      render();
    };
  });
  const musicBtn = document.getElementById('btn-music-toggle');
  if (musicBtn) {
    musicBtn.onclick = () => {
      const next = !(state.settings?.music !== false && isMusicEnabled());
      state.settings = state.settings || {};
      state.settings.music = next;
      setMusicEnabled(next);
      if (next) startMusic();
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
}

function queueHTML() {
  const queue = state.customers.queue || [];
  if (!queue.length) {
    return `<div class="muted" style="margin-top:8px">Cola vacía</div>`;
  }
  return `
    <div class="queue-list" style="margin-top:8px">
      ${queue
        .slice(0, 12)
        .map((c, i) => {
          const kind =
            c.kind === 'pena' ? 'Peña' : c.kind === 'abonado' ? 'Abonado' : c.regular ? 'Habitual' : 'Visitante';
          const wish = (c.wishlist || [])
            .slice(0, 2)
            .map((w) => w.productName)
            .join(', ');
          return `<div class="queue-item"><strong>${i + 1}. ${escapeHtml(c.name)}</strong>
            <span class="muted"> · ${kind}${c.intent ? ` · ${escapeHtml(c.intent)}` : ''}</span>
            ${wish ? `<div class="muted">${escapeHtml(wish)}</div>` : ''}
          </div>`;
        })
        .join('')}
      ${queue.length > 12 ? `<div class="muted">… y ${queue.length - 12} más</div>` : ''}
    </div>`;
}

function wishlistHTML(client) {
  const list = client.wishlist || [];
  if (!list.length) {
    if (client.request) {
      return `<ul class="wish-list"><li><strong>${escapeHtml(client.request.productName)}</strong> × ${client.request.qty}</li></ul>`;
    }
    return '';
  }
  return `<ul class="wish-list">${list
    .map(
      (w) =>
        `<li>• <strong>${escapeHtml(w.productName)}</strong> × ${w.qty}${
          w.preferDictate ? ' <span class="muted">(dictado)</span>' : ''
        }</li>`,
    )
    .join('')}</ul>`;
}

function calendarOrderButtonsHTML(prefix = 'cal') {
  const d = specialOrderDeadlines(state);
  return `
    <div class="actions" style="margin-top:8px;flex-wrap:wrap">
      <button class="btn" id="btn-${prefix}-navidad" title="Entrega ${d.navidad.deliverBy}">Encargo Navidad</button>
      <button class="btn" id="btn-${prefix}-nino" title="Entrega ${d.nino.deliverBy}">Encargo Niño</button>
    </div>`;
}

function bindCalendarOrderButtons(prefix, client) {
  const deadlines = specialOrderDeadlines(state);
  const make = (kind) => {
    const d = deadlines[kind];
    const name =
      client?.name ||
      prompt('Nombre del cliente para el encargo:', 'Cliente') ||
      'Cliente';
    const qtyRaw = prompt(`Cantidad de ${getProduct(d.productId)?.name || kind}:`, '10');
    const qty = Math.max(1, Math.min(200, Number(qtyRaw) || 10));
    createCalendarOrder(state, {
      productId: d.productId,
      qty,
      clientId: client?.id || null,
      clientName: name,
      deliverBy: d.deliverBy,
    });
    sfx.success();
    showToast(`Encargo ${getProduct(d.productId)?.name}: ×${qty} · entrega ${d.deliverBy}`);
    needsFullRender = true;
    render();
  };
  const nav = document.getElementById(`btn-${prefix}-navidad`);
  const nino = document.getElementById(`btn-${prefix}-nino`);
  if (nav) nav.onclick = () => make('navidad');
  if (nino) nino.onclick = () => make('nino');
}

function renderCounter() {
  const client = state.customers.current;
  const ev = eventBannerText();
  let clientBlock;

  if (!isOpenHours(state) || isClosedDay(state)) {
    clientBlock = `
      <div class="hero-counter">
        <h2>Oficina cerrada</h2>
        <p>${closedReason(state) || 'Fuera de horario (08:00–20:00).'}</p>
      </div>`;
  } else if (!client) {
    clientBlock = `
      <div class="hero-counter">
        <h2>Mostrador listo</h2>
        <p>Esperando clientes… Afluencia <span id="crowd-hint">${crowdHint()}</span>
        ${ev ? `· <span id="event-banner">${escapeHtml(ev)}</span>` : '<span id="event-banner"></span>'}</p>
        ${isTouristSeason(state) ? '<p class="muted">Hay turistas del Caminito: más cola y rascas.</p>' : ''}
        <div class="actions" style="margin-top:12px">
          <button class="btn" id="btn-arqueo-open">Arqueo de apertura</button>
        </div>
        ${calendarOrderButtonsHTML('counter')}
      </div>`;
  } else {
    clientBlock = renderClientPanel(client);
  }

  const log = [...state.dayLog].slice(-12).reverse();

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout">
        ${sideNav()}
        <section class="panel counter-stage">
          ${clientBlock}
          ${
            client && isOpenHours(state) && !isClosedDay(state)
              ? `<div style="margin-top:12px" class="actions">
                  <button class="btn" id="btn-arqueo-open">Arqueo de apertura</button>
                </div>
                ${calendarOrderButtonsHTML('counter')}`
              : ''
          }
          <div style="margin-top:16px">
            <h3>Cola (${state.customers.queue?.length || 0})</h3>
            ${queueHTML()}
          </div>
          <div style="margin-top:16px">
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
          <h3>Hoy</h3>
          <div class="stat-row"><span>Tickets emitidos</span><strong>${(state.tickets || []).length}</strong></div>
          <div class="stat-row"><span>Pedidos pendientes</span><strong>${state.orders.filter((o) => o.status === 'pending').length}</strong></div>
          <div class="stat-row"><span>Afluencia</span><strong>×${crowdFactor(state).toFixed(1)}</strong></div>
          <p class="disclaimer" style="margin-top:16px">Fan-made · no oficial · +18 · v${GAME_VERSION}</p>
        </aside>
      </div>
    </div>
    ${toastHTML()}
  `;

  bindTopbar();
  bindNav();
  bindClientActions();
  bindCalendarOrderButtons('counter', state.customers.current);
  const arqueoOpen = document.getElementById('btn-arqueo-open');
  if (arqueoOpen) {
    arqueoOpen.onclick = () => {
      sfx.click();
      startArqueo(state, 'open');
      needsFullRender = true;
      render();
    };
  }
}

function renderClientPanel(client) {
  const intent = client.intent || 'buy';
  const trait = client.trait ? ` · ${client.trait}` : '';
  const quote = client.line || client.note || '';
  const kindLabel =
    client.kind === 'pena' ? 'Peña' : client.kind === 'abonado' ? 'Abonado' : client.regular ? 'Habitual' : 'Visitante';

  if (intent === 'buy' || intent === 'reserve_special') {
    const totalWish = (client.wishlist || []).reduce((s, w) => {
      const p = getProduct(w.productId);
      return s + (p?.priceCents || 0) * w.qty;
    }, 0);
    return `
      <div class="client-card">
        <div class="muted">${kindLabel}${trait} · ${escapeHtml(client.street || '')}</div>
        <h3>${escapeHtml(client.name)}</h3>
        ${quote ? `<p class="muted">“${escapeHtml(quote)}”</p>` : ''}
        <p>${intent === 'reserve_special' ? 'Encargo / petición:' : 'Quiere:'}</p>
        ${wishlistHTML(client)}
        ${totalWish ? `<p class="muted">Estimado: ${formatEuro(totalWish)}</p>` : ''}
        <p class="muted">Pago preferido: ${payLabel(client.prefersPayment)}</p>
        <div class="actions">
          <button class="btn primary" id="btn-open-tpv">Abrir TPV</button>
          <button class="btn" id="btn-load-wish">Cargar petición</button>
          ${
            intent === 'reserve_special'
              ? `<button class="btn" id="btn-reserve">Reservar sin pagar</button>`
              : `<button class="btn" id="btn-reserve">Reservar sin pagar</button>`
          }
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
  }

  if (intent === 'check') {
    const t = client.ticketFocus;
    const result = client.checkResult;
    return `
      <div class="client-card">
        <div class="muted">Comprobación${trait}</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Trae <strong>${escapeHtml(t.productName)}</strong> (${t.id})</p>
        <p class="muted">${formatSelection(t)}${t.drawYmd ? ` · Sorteo ${t.drawYmd}` : ''}</p>
        ${
          result
            ? `<div class="${result.prizeCents ? 'total-box' : 'error-box'}" style="margin:10px 0">
                ${
                  result.pending
                    ? escapeHtml(result.detail)
                    : result.prizeCents
                      ? `¡Premio: ${formatEuro(result.prizeCents)}! (${escapeHtml(result.detail || '')})`
                      : `Sin premio. ${escapeHtml(result.detail || '')}`
                }
              </div>`
            : ''
        }
        <div class="actions">
          ${
            !result
              ? `<button class="btn primary" id="btn-check">Comprobar</button>`
              : result.prizeCents > 0
                ? `<button class="btn primary" id="btn-pay-now">Pagar ahora</button>
                   <button class="btn" id="btn-defer">Cobrar otro día</button>
                   <button class="btn accent" id="btn-manage">Gestionar (premio grande)</button>`
                : `<button class="btn primary" id="btn-done-check">Listo</button>`
          }
          <button class="btn" id="btn-pdf-ticket">PDF ticket</button>
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
  }

  if (intent === 'claim') {
    const t = client.ticketFocus;
    return `
      <div class="client-card">
        <div class="muted">Cobro de premio${trait}</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Premio pendiente: <strong>${formatEuro(t.prizeCents)}</strong> · ${escapeHtml(t.productName)}</p>
        <div class="actions">
          <button class="btn primary" id="btn-pay-now">Pagar ahora</button>
          <button class="btn" id="btn-defer">Seguir pendiente</button>
          <button class="btn accent" id="btn-manage">Pasar a gestión</button>
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
  }

  if (intent === 'managed_ask') {
    const t = client.ticketFocus;
    const mgmt = (state.prizeManagement || []).find((m) => m.ticketId === t.id);
    return `
      <div class="client-card">
        <div class="muted">Consulta de gestión</div>
        <h3>${escapeHtml(client.name)}</h3>
        <p>Premio en gestión: <strong>${formatEuro(t.prizeCents)}</strong></p>
        <p class="muted">Estado: ${mgmt?.status || 'en trámite'} · ${escapeHtml(mgmt?.note || '')}</p>
        <div class="actions">
          <button class="btn primary" id="btn-done-check">Explicar y despedir</button>
        </div>
      </div>`;
  }

  return `<div class="client-card"><h3>${escapeHtml(client.name)}</h3><button class="btn" id="btn-skip">Despedir</button></div>`;
}

function loadWishlistIntoTpv(client) {
  openTpv(state, client);
  const items = client.wishlist?.length
    ? client.wishlist
    : client.request
      ? [client.request]
      : [];
  for (const w of items) {
    const src = w.preferDictate ? 'dictate' : 'random';
    for (let i = 0; i < (w.qty || 1); i++) {
      addTpvProduct(state, w.productId, { qty: 1, numberSource: src });
    }
  }
}

function bindClientActions() {
  const openTpvBtn = document.getElementById('btn-open-tpv');
  if (openTpvBtn) {
    openTpvBtn.onclick = () => {
      const client = state.customers.current;
      if (!client) return;
      sfx.tpv();
      openTpv(state, client);
      needsFullRender = true;
      render();
    };
  }
  const loadWish = document.getElementById('btn-load-wish');
  if (loadWish) {
    loadWish.onclick = () => {
      const client = state.customers.current;
      if (!client) return;
      sfx.tpv();
      loadWishlistIntoTpv(client);
      if (state.ui.tpv?.message) showToast(state.ui.tpv.message);
      needsFullRender = true;
      render();
    };
  }
  const reserve = document.getElementById('btn-reserve');
  if (reserve) {
    reserve.onclick = () => {
      sfx.click();
      reserveForCurrent(state);
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  }
  const skip = document.getElementById('btn-skip');
  if (skip) {
    skip.onclick = () => {
      sfx.click();
      const name = state.customers.current?.name || 'Cliente';
      dismissCurrent(state, `${name} se va`);
      state.customers.current = null;
      needsFullRender = true;
      render();
    };
  }
  const check = document.getElementById('btn-check');
  if (check) {
    check.onclick = () => {
      sfx.scan();
      checkCurrentTicket(state);
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  }
  const done = document.getElementById('btn-done-check');
  if (done) {
    done.onclick = () => {
      state.customers.current = null;
      needsFullRender = true;
      render();
    };
  }
  const payNow = document.getElementById('btn-pay-now');
  if (payNow) {
    payNow.onclick = () => {
      const t = state.customers.current?.ticketFocus;
      if (!t) return;
      const res = payTicketPrize(state, t.id, { method: 'cash' });
      if (!res.ok && res.message?.includes('efectivo')) {
        const res2 = payTicketPrize(state, t.id, { method: 'transfer' });
        if (!res2.ok) {
          sfx.error();
          showToast(res2.message || res.message);
        } else {
          sfx.cash();
          showToast(state.ui.toast);
          state.customers.current = null;
        }
      } else if (!res.ok) {
        sfx.error();
        showToast(res.message);
      } else {
        sfx.cash();
        showToast(state.ui.toast);
        if (!res.deferred) state.customers.current = null;
      }
      needsFullRender = true;
      render();
    };
  }
  const defer = document.getElementById('btn-defer');
  if (defer) {
    defer.onclick = () => {
      const t = state.customers.current?.ticketFocus;
      if (!t) return;
      payTicketPrize(state, t.id, { defer: true });
      sfx.click();
      showToast(state.ui.toast);
      state.customers.current = null;
      needsFullRender = true;
      render();
    };
  }
  const manage = document.getElementById('btn-manage');
  if (manage) {
    manage.onclick = () => {
      const t = state.customers.current?.ticketFocus;
      if (!t) return;
      startPrizeManagement(state, t);
      sfx.click();
      showToast(state.ui.toast);
      state.customers.current = null;
      needsFullRender = true;
      render();
    };
  }
  const pdfBtn = document.getElementById('btn-pdf-ticket');
  if (pdfBtn) {
    pdfBtn.onclick = () => {
      const t = state.customers.current?.ticketFocus;
      if (!t) return;
      downloadTicketPdf(t);
      sfx.click();
      showToast('PDF del ticket descargado');
    };
  }
}

function wishlistValidationHTML(tpv) {
  if (!tpv?.wishlist?.length) return '';
  const v = validateWishlist(tpv);
  const rows = [];
  for (const c of v.covered) {
    rows.push(
      `<div class="wish-ok">✓ ${escapeHtml(c.productName)} ×${c.qty}</div>`,
    );
  }
  for (const m of v.missing) {
    rows.push(
      `<div class="wish-miss">✗ ${escapeHtml(m.productName)} · faltan ${m.need} (hay ${m.have})</div>`,
    );
  }
  for (const e of v.extras) {
    rows.push(
      `<div class="wish-extra">+ Extra: ${escapeHtml(e.productName)} ×${e.qty}</div>`,
    );
  }
  return `<div class="wish-panel" style="margin:10px 0">
    <strong>Petición del cliente</strong>
    ${rows.join('') || '<div class="muted">Sin líneas aún</div>'}
  </div>`;
}

function cancelPromptHTML(tpv) {
  if (!tpv?.cancelPrompt) return '';
  const line = tpv.lines.find((l) => l.id === tpv.cancelPrompt.lineId);
  return `<div class="dictate-box" style="margin:10px 0">
    <strong>Cancelar línea${line ? `: ${escapeHtml(line.name)}` : ''}</strong>
    <p class="muted">Elige motivo</p>
    <div class="actions" style="flex-wrap:wrap">
      ${CANCEL_REASONS.map(
        (r) => `<button class="btn danger" data-cancel-reason="${escapeHtml(r)}">${escapeHtml(r)}</button>`,
      ).join('')}
      <button class="btn ghost" id="btn-cancel-dismiss">No cancelar</button>
    </div>
  </div>`;
}

function resolveTpvClient(tpv) {
  return state.customers.current?.id === tpv.clientId
    ? state.customers.current
    : state.customers.regulars.find((c) => c.id === tpv.clientId) ||
        state.customers.abonados?.find((c) => c.id === tpv.clientId) ||
        state.customers.penas?.find((c) => c.id === tpv.clientId) || {
          id: tpv.clientId,
          name: tpv.clientName,
          prefersPayment: state.customers.current?.prefersPayment || 'cash',
        };
}

function confirmTpvCharge() {
  const tpv = state.ui.tpv;
  if (!tpv) return;
  const ready = tpvReadyToCharge(tpv);
  if (!ready.ok) {
    tpv.message = ready.error;
    sfx.error();
    needsFullRender = true;
    render();
    return;
  }
  const items = tpvToSaleItems(tpv);
  const client = resolveTpvClient(tpv);
  startPayment(state, { items, client });
  state.ui.tpv = null;
  sfx.drawer();
  needsFullRender = true;
  render();
}

function goTpvChargeOrReceipt() {
  const tpv = state.ui.tpv;
  if (!tpv) return;
  if (tpv.step === 'receipt') {
    confirmTpvCharge();
    return;
  }
  goTpvReceipt(state);
  if (state.ui.tpv?.step !== 'receipt') sfx.error();
  else sfx.scan();
  needsFullRender = true;
  render();
}

function renderTpvReceipt(tpv) {
  const total = tpvTotalCents(tpv);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel" style="margin-top:16px;max-width:720px">
        <h2>Ticket de venta · ${escapeHtml(tpv.clientName || 'Cliente')}</h2>
        <p class="muted">Revisa el ticket antes de cobrar. Puedes descargar PDF.</p>
        ${wishlistValidationHTML(tpv)}
        <div class="log" style="margin:12px 0">
          ${tpv.lines
            .map(
              (l) =>
                `<div class="log-item"><strong>${escapeHtml(l.name)}</strong> ×${l.qty} · ${formatEuro(l.unitCents * l.qty)}
                ${l.needsNumbers ? `<div class="muted">${escapeHtml(formatLineSelection(l))}</div>` : ''}</div>`,
            )
            .join('')}
        </div>
        <div class="total-box">Total<strong>${formatEuro(total)}</strong></div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" id="btn-tpv-pdf">PDF ticket</button>
          <button class="btn primary" id="btn-tpv-confirm-pay" style="min-height:52px">Confirmar cobro</button>
          <button class="btn ghost" id="btn-tpv-back-edit">Volver a editar</button>
        </div>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  document.getElementById('btn-tpv-pdf').onclick = () => {
    downloadSaleReceiptPdf({
      items: tpvToSaleItems(tpv),
      totalCents: total,
      clientName: tpv.clientName,
      method: 'pendiente',
      tickets: [],
    });
    sfx.click();
    showToast('PDF del ticket descargado');
  };
  document.getElementById('btn-tpv-confirm-pay').onclick = () => confirmTpvCharge();
  document.getElementById('btn-tpv-back-edit').onclick = () => {
    backTpvEdit(state);
    sfx.click();
    needsFullRender = true;
    render();
  };
  ensureTpvKeyboard();
}

function renderTpv() {
  const tpv = state.ui.tpv;
  if (!tpv) {
    state.ui.screen = 'counter';
    return render();
  }

  if (tpv.step === 'receipt') return renderTpvReceipt(tpv);

  const cat = tpv.category || 'LAE';
  const products = productsByTpvCategory(cat);
  const total = tpvTotalCents(tpv);
  const entry = tpv.numberEntry;

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">TPV · ${escapeHtml(tpv.clientName || 'Cliente')}</h2>
            <p class="muted" style="margin:4px 0 0">F1–F6 categorías · Enter cobrar · Esc atrás</p>
          </div>
          <button class="btn ghost" id="btn-tpv-back">Volver al mostrador</button>
        </div>
        ${tpv.message ? `<div class="error-box" style="margin:10px 0">${escapeHtml(tpv.message)}</div>` : ''}
        ${wishlistValidationHTML(tpv)}
        ${cancelPromptHTML(tpv)}
        ${
          entry
            ? `<div class="dictate-box">
                <strong>Dictado: ${escapeHtml(entry.productName || '')}</strong>
                <p class="muted">${escapeHtml(dictateHint(entry.mode))}</p>
                <textarea id="dictate-input" placeholder="Números que dicta el cliente…">${escapeHtml(entry.draft || '')}</textarea>
                <div class="actions" style="margin-top:8px">
                  <button class="btn primary" id="btn-dictate-ok">Marcar números</button>
                  <button class="btn ghost" id="btn-dictate-cancel">Cancelar dictado</button>
                </div>
              </div>`
            : ''
        }
        <div class="tpv-wrap">
          <div class="tpv-cats">
            ${TPV_CATEGORIES.map(
              (c, i) =>
                `<button class="btn ${c === cat ? 'primary' : ''}" data-tpv-cat="${c}">F${i + 1} ${escapeHtml(c)}</button>`,
            ).join('')}
          </div>
          <div class="tpv-products">
            ${products
              .map((p) => {
                const stock =
                  p.stockType === 'physical'
                    ? `Stock ${state.stock[p.id] ?? 0}`
                    : 'Terminal';
                return `<div class="tpv-product">
                  <strong>${escapeHtml(p.name)}</strong>
                  <span>${formatEuro(p.priceCents)} · ${escapeHtml(stock)}</span>
                  <div class="actions" style="margin-top:8px;gap:6px">
                    <button class="btn primary" style="flex:1;min-height:42px;padding:8px" data-add-random="${p.id}">Aleatorio</button>
                    ${
                      p.needsNumbers
                        ? `<button class="btn" style="flex:1;min-height:42px;padding:8px" data-add-dictate="${p.id}">Dictado</button>`
                        : `<button class="btn" style="flex:1;min-height:42px;padding:8px" data-add-random="${p.id}">+1</button>`
                    }
                  </div>
                </div>`;
              })
              .join('')}
          </div>
          <aside class="tpv-cart">
            <h3 style="margin:0 0 8px">Ticket</h3>
            <div style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
              ${
                tpv.lines.length
                  ? tpv.lines
                      .map(
                        (l) => `<div class="tpv-line">
                          <div><strong>${escapeHtml(l.name)}</strong> · ${formatEuro(l.unitCents * l.qty)}</div>
                          ${
                            l.needsNumbers
                              ? `<div class="muted">${escapeHtml(formatLineSelection(l))}</div>`
                              : ''
                          }
                          <div class="actions" style="margin-top:6px;gap:4px;flex-wrap:wrap">
                            <button class="btn" style="padding:6px 10px" data-qty="${l.id}" data-delta="-1">−</button>
                            <strong style="min-width:1.5rem;text-align:center">${l.qty}</strong>
                            <button class="btn" style="padding:6px 10px" data-qty="${l.id}" data-delta="1">+</button>
                            ${
                              l.needsNumbers
                                ? `<button class="btn" style="padding:6px 10px" data-reroll="${l.id}">Aleat.</button>
                                   <button class="btn" style="padding:6px 10px" data-dictate-line="${l.id}">Dictar</button>`
                                : ''
                            }
                            <button class="btn danger" style="padding:6px 10px" data-remove="${l.id}">Quitar</button>
                          </div>
                        </div>`,
                      )
                      .join('')
                  : '<div class="muted">Carrito vacío. Añade productos.</div>'
              }
            </div>
            <div class="total-box" style="margin-top:8px">Total<strong>${formatEuro(total)}</strong></div>
            <div class="actions" style="margin-top:8px">
              <button class="btn primary" id="btn-tpv-charge" style="flex:1;min-height:52px;font-size:1.05rem">Cobrar</button>
              <button class="btn danger" id="btn-tpv-cancel" style="min-height:52px">Cancelar</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
    ${toastHTML()}
  `;

  bindTopbar();
  ensureTpvKeyboard();

  document.getElementById('btn-tpv-back').onclick = () => {
    sfx.click();
    closeTpv(state);
    needsFullRender = true;
    render();
  };

  app.querySelectorAll('[data-tpv-cat]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      setTpvCategory(state, btn.getAttribute('data-tpv-cat'));
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-add-random]').forEach((btn) => {
    btn.onclick = () => {
      sfx.tpv();
      addTpvProduct(state, btn.getAttribute('data-add-random'), { numberSource: 'random' });
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-add-dictate]').forEach((btn) => {
    btn.onclick = () => {
      sfx.tpv();
      addTpvProduct(state, btn.getAttribute('data-add-dictate'), { numberSource: 'dictate' });
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-qty]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-qty');
      const delta = Number(btn.getAttribute('data-delta'));
      const line = tpv.lines.find((l) => l.id === id);
      if (!line) return;
      setLineQty(state, id, line.qty + delta);
      sfx.click();
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.onclick = () => {
      removeTpvLine(state, btn.getAttribute('data-remove'));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-cancel-reason]').forEach((btn) => {
    btn.onclick = () => {
      confirmCancelLine(state, btn.getAttribute('data-cancel-reason'));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });
  const dismissCancel = document.getElementById('btn-cancel-dismiss');
  if (dismissCancel) {
    dismissCancel.onclick = () => {
      dismissCancelPrompt(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }

  app.querySelectorAll('[data-reroll]').forEach((btn) => {
    btn.onclick = () => {
      rerollLineNumbers(state, btn.getAttribute('data-reroll'));
      sfx.scan();
      needsFullRender = true;
      render();
    };
  });

  app.querySelectorAll('[data-dictate-line]').forEach((btn) => {
    btn.onclick = () => {
      startDictateLine(state, btn.getAttribute('data-dictate-line'));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });

  const dictateOk = document.getElementById('btn-dictate-ok');
  if (dictateOk) {
    dictateOk.onclick = () => {
      const text = document.getElementById('dictate-input')?.value || '';
      applyDictatedNumbers(state, text);
      if (
        state.ui.tpv?.message?.includes('Falta') ||
        state.ui.tpv?.message?.includes('Indica') ||
        state.ui.tpv?.message?.includes('Formato') ||
        state.ui.tpv?.message?.includes('números') ||
        state.ui.tpv?.numberEntry
      ) {
        sfx.error();
      } else {
        sfx.success();
      }
      needsFullRender = true;
      render();
    };
  }
  const dictateCancel = document.getElementById('btn-dictate-cancel');
  if (dictateCancel) {
    dictateCancel.onclick = () => {
      cancelNumberEntry(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }

  document.getElementById('btn-tpv-charge').onclick = () => goTpvChargeOrReceipt();

  document.getElementById('btn-tpv-cancel').onclick = () => {
    sfx.click();
    closeTpv(state);
    showToast('TPV cancelado');
    needsFullRender = true;
    render();
  };
}

function ensureTpvKeyboard() {
  if (tpvKeysBound) return;
  tpvKeysBound = true;
  document.addEventListener('keydown', (e) => {
    if (!state || state.ui.screen !== 'tpv' || !state.ui.tpv) return;
    const tpv = state.ui.tpv;
    const tag = (e.target?.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea';

    if (e.key === 'Escape') {
      e.preventDefault();
      if (tpv.cancelPrompt) {
        dismissCancelPrompt(state);
      } else if (tpv.numberEntry) {
        cancelNumberEntry(state);
      } else if (tpv.step === 'receipt') {
        backTpvEdit(state);
      } else {
        closeTpv(state);
        showToast('TPV cerrado');
      }
      needsFullRender = true;
      render();
      return;
    }

    if (e.key === 'Enter' && !typing) {
      e.preventDefault();
      goTpvChargeOrReceipt();
      return;
    }

    if (!typing && /^F[1-6]$/.test(e.key)) {
      e.preventDefault();
      const idx = Number(e.key.slice(1)) - 1;
      const cat = TPV_CATEGORIES[idx];
      if (cat && tpv.step !== 'receipt') {
        setTpvCategory(state, cat);
        sfx.click();
        needsFullRender = true;
        render();
      }
    }
  });
}

function renderCash() {
  const ps = state.ui.paymentSession;
  if (!ps) {
    state.ui.screen = 'counter';
    return render();
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
      </div>`;
  } else if (ps.step === 'cash-tender') {
    body = `
      <p>Marca lo que entrega el cliente.</p>
      <div class="totals">
        <div class="total-box">A cobrar<strong>${formatEuro(ps.totalCents)}</strong></div>
        <div class="total-box">Entregado<strong>${formatEuro(tendered)}</strong></div>
        <div class="total-box">Cambio<strong>${formatEuro(Math.max(0, tendered - ps.totalCents))}</strong></div>
      </div>
      ${denomEditor('tender')}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-tender">Continuar al cambio</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>`;
  } else if (ps.step === 'cash-change') {
    body = `
      <p>Elige el cambio exacto.</p>
      <div class="totals">
        <div class="total-box">A devolver<strong>${formatEuro(ps.changeNeededCents || 0)}</strong></div>
        <div class="total-box">Selección<strong>${formatEuro(changeSum)}</strong></div>
        <div class="total-box">En caja<strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      </div>
      ${denomEditor('change')}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" id="btn-confirm-change">Confirmar cobro</button>
        <button class="btn" id="btn-back-tender">Volver</button>
        <button class="btn danger" id="btn-cancel-pay">Cancelar</button>
      </div>`;
  } else if (ps.step === 'done') {
    const tickets = ps.createdTickets || [];
    body = `
      <div class="hero-counter">
        <h2>Cobro completado</h2>
        <p>${escapeHtml(ps.clientName)} · ${formatEuro(ps.totalCents)} · ${payLabel(ps.method)}</p>
      </div>
      <h3>Tickets emitidos</h3>
      <div class="log">
        ${
          tickets
            .map(
              (t) =>
                `<div class="log-item"><strong>${t.id}</strong> · ${escapeHtml(t.productName)} · ${escapeHtml(formatSelection(t))}${
                  t.drawYmd ? ` · sorteo ${t.drawYmd}` : ''
                }
                <button class="btn" style="padding:4px 8px;margin-left:8px" data-pdf="${t.id}">PDF</button>
                </div>`,
            )
            .join('') || '<div class="muted">Sin tickets</div>'
        }
      </div>
      <div class="actions" style="margin-top:12px">
        <button class="btn" id="btn-pdf-sale">PDF venta</button>
        <button class="btn primary" id="btn-next-client">Siguiente</button>
      </div>`;
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
      selectPaymentMethod(state, btn.getAttribute('data-method'));
      sfx.click();
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
  if (ct)
    ct.onclick = () => {
      confirmTender(state);
      state.ui.paymentSession?.error ? sfx.error() : sfx.scan();
      needsFullRender = true;
      render();
    };
  const cc = document.getElementById('btn-confirm-change');
  if (cc)
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
  const back = document.getElementById('btn-back-tender');
  if (back)
    back.onclick = () => {
      state.ui.paymentSession.step = 'cash-tender';
      state.ui.paymentSession.error = null;
      needsFullRender = true;
      render();
    };
  const cancel = document.getElementById('btn-cancel-pay');
  if (cancel)
    cancel.onclick = () => {
      cancelPayment(state);
      needsFullRender = true;
      render();
    };
  const next = document.getElementById('btn-next-client');
  if (next)
    next.onclick = () => {
      closePaymentSession(state);
      sfx.success();
      needsFullRender = true;
      render();
    };
  const pdfSale = document.getElementById('btn-pdf-sale');
  if (pdfSale)
    pdfSale.onclick = () => {
      downloadSaleReceiptPdf({
        items: ps.items,
        totalCents: ps.totalCents,
        clientName: ps.clientName,
        method: payLabel(ps.method),
        tickets: ps.createdTickets,
      });
      sfx.click();
      showToast('PDF de venta descargado');
    };
  app.querySelectorAll('[data-pdf]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-pdf');
      const t = (ps.createdTickets || []).find((x) => x.id === id);
      if (t) downloadTicketPdf(t);
      sfx.click();
    };
  });
}

function denomEditor(kind) {
  const ps = state.ui.paymentSession;
  const counts = kind === 'tender' ? ps.tendered : ps.changeGiven;
  return [
    ['Billetes', BILLS],
    ['Monedas', COINS],
  ]
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
  const orgs = summary.orgs || dayProfitBreakdown(state).orgs;
  const settle = summary.settlement || state.finance.lastSettlement;
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Cierre y balance</h2>
          <p class="muted">Al confirmar: gastos del día, liquidación LAE/ONCE, avance de gestiones de premios y salto al siguiente laborable.</p>
          <div class="close-summary">
            <div class="stat-row"><span>Fecha</span><strong>${summary.date}</strong></div>
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(summary.salesCents)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(summary.commissionCents)}</strong></div>
            <div class="stat-row"><span>Beneficio del día*</span><strong>${formatEuro(summary.profitCents)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(summary.prizesPaidCents)}</strong></div>
            <div class="stat-row"><span>Gastos (al cerrar)</span><strong>${formatEuro(summary.expensesCents)}</strong></div>
            <div class="stat-row"><span>Cajón</span><strong>${formatEuro(summary.drawerCents)}</strong></div>
            <div class="stat-row"><span>Banco</span><strong>${formatEuro(summary.bankCents)}</strong></div>
            <div class="stat-row"><span>Clientes</span><strong>${summary.customersServed}</strong></div>
            <div class="stat-row"><span>Siguiente laborable</span><strong>${summary.nextDay}</strong></div>
          </div>

          <h3 style="margin-top:18px">Desglose por organización</h3>
          <div class="close-summary">
            ${['LAE', 'ONCE', 'Otros']
              .map((org) => {
                const o = orgs?.[org] || { sales: 0, commission: 0, prizes: 0 };
                return `<div class="stat-row"><span>${org} ventas</span><strong>${formatEuro(o.sales)}</strong></div>
                  <div class="stat-row"><span>${org} comisión</span><strong>${formatEuro(o.commission)}</strong></div>
                  <div class="stat-row"><span>${org} premios</span><strong>${formatEuro(o.prizes || 0)}</strong></div>`;
              })
              .join('')}
          </div>

          <h3 style="margin-top:18px">Liquidación prevista / última</h3>
          ${
            settle
              ? `<div class="close-summary">
                  <div class="stat-row"><span>LAE remesa</span><strong>${formatEuro(settle.lae?.remittance || 0)}</strong></div>
                  <div class="stat-row"><span>LAE comisión retenida</span><strong>${formatEuro(settle.lae?.commission || 0)}</strong></div>
                  <div class="stat-row"><span>ONCE remesa</span><strong>${formatEuro(settle.once?.remittance || 0)}</strong></div>
                  <div class="stat-row"><span>ONCE comisión retenida</span><strong>${formatEuro(settle.once?.commission || 0)}</strong></div>
                  <div class="stat-row"><span>Otros remesa</span><strong>${formatEuro(settle.otros?.remittance || 0)}</strong></div>
                  <div class="stat-row"><span>Reembolso premios</span><strong>${formatEuro(
                    (settle.lae?.prizesReimbursed || 0) +
                      (settle.once?.prizesReimbursed || 0) +
                      (settle.otros?.prizesReimbursed || 0),
                  )}</strong></div>
                </div>`
              : `<p class="muted">Se calculará al cerrar el día (ventas − comisión por org, más reembolso de premios).</p>
                <div class="close-summary">
                  <div class="stat-row"><span>LAE remesa estimada</span><strong>${formatEuro((orgs?.LAE?.sales || 0) - (orgs?.LAE?.commission || 0))}</strong></div>
                  <div class="stat-row"><span>ONCE remesa estimada</span><strong>${formatEuro((orgs?.ONCE?.sales || 0) - (orgs?.ONCE?.commission || 0))}</strong></div>
                  <div class="stat-row"><span>Otros remesa estimada</span><strong>${formatEuro((orgs?.Otros?.sales || 0) - (orgs?.Otros?.commission || 0))}</strong></div>
                </div>`
          }

          <p class="muted">*Beneficio ≈ comisiones − gastos (antes de liquidar)</p>
          <p class="muted" style="margin-top:12px">Recomendado: haz el arqueo de caja antes de cerrar.</p>
          <div class="actions" style="margin-top:18px">
            <button class="btn" id="btn-arqueo-before-close">Arqueo de caja primero</button>
            <button class="btn accent" id="btn-do-close">Liquidar, balance y cerrar día</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-arqueo-before-close').onclick = () => {
    sfx.click();
    startArqueo(state, 'close');
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-do-close').onclick = () => {
    const { summary: s } = closeDay(state);
    const slot = state.meta.activeSlot || 1;
    state.meta.activeSlot = slot;
    saveToSlot(state, slot);
    sfx.success();
    showToast(
      `Día cerrado → ${s.nextDay}. Beneficio ${formatEuro(s.profitCents)}. Liquidación hecha. Guardado hueco ${slot}.`,
    );
    needsFullRender = true;
    render();
  };
}

function arqueoDenomEditor() {
  const counted = state.ui.arqueo?.counted || {};
  return [
    ['Billetes', BILLS],
    ['Monedas', COINS],
  ]
    .map(
      ([title, list]) => `
      <h3 style="margin-top:14px">${title}</h3>
      <div class="denom-grid">
        ${list
          .map((d) => {
            const n = counted[d.id] || 0;
            return `<div class="denom">
              <div class="label">${d.label}</div>
              <div class="row">
                <button data-arqueo="${d.id}" data-delta="-1">−</button>
                <strong>${n}</strong>
                <button data-arqueo="${d.id}" data-delta="1">+</button>
              </div>
            </div>`;
          })
          .join('')}
      </div>`,
    )
    .join('');
}

function renderArqueo() {
  const a = state.ui.arqueo;
  if (!a) {
    state.ui.screen = 'counter';
    return render();
  }
  const kindLabel =
    a.kind === 'open' ? 'apertura' : a.kind === 'close' ? 'cierre' : 'caja';
  let body;
  if (a.step === 'result' && a.result) {
    const { expected, counted, diff } = a.result;
    body = `
      <div class="hero-counter">
        <h2>Resultado del arqueo</h2>
        <p>${escapeHtml(a.message || '')}</p>
      </div>
      <div class="close-summary">
        <div class="stat-row"><span>Esperado (caja)</span><strong>${formatEuro(expected)}</strong></div>
        <div class="stat-row"><span>Contado</span><strong>${formatEuro(counted)}</strong></div>
        <div class="stat-row"><span>Diferencia</span><strong>${formatEuro(diff)}</strong></div>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="btn primary" id="btn-arqueo-done">Cerrar arqueo</button>
      </div>`;
  } else {
    const counted = countTotalCents(a.counted);
    body = `
      <p class="muted">Cuenta billetes y monedas del cajón (${kindLabel}).</p>
      <div class="totals" style="margin:12px 0">
        <div class="total-box">Contado<strong>${formatEuro(counted)}</strong></div>
        <div class="total-box">En sistema<strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      </div>
      ${arqueoDenomEditor()}
      ${a.message ? `<div class="error-box" style="margin:10px 0">${escapeHtml(a.message)}</div>` : ''}
      <div class="actions" style="margin-top:16px">
        <button class="btn primary" id="btn-arqueo-confirm">Confirmar conteo</button>
        <button class="btn ghost" id="btn-arqueo-cancel">Cancelar</button>
      </div>`;
  }

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Arqueo de ${kindLabel}</h2>
          ${body}
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  app.querySelectorAll('[data-arqueo]').forEach((btn) => {
    btn.onclick = () => {
      adjustArqueoCount(state, btn.getAttribute('data-arqueo'), Number(btn.getAttribute('data-delta')));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });
  const conf = document.getElementById('btn-arqueo-confirm');
  if (conf) {
    conf.onclick = () => {
      confirmArqueo(state);
      sfx.scan();
      needsFullRender = true;
      render();
    };
  }
  const done = document.getElementById('btn-arqueo-done');
  if (done) {
    done.onclick = () => {
      closeArqueo(state);
      sfx.success();
      needsFullRender = true;
      render();
    };
  }
  const cancel = document.getElementById('btn-arqueo-cancel');
  if (cancel) {
    cancel.onclick = () => {
      closeArqueo(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
}

function renderWeekly() {
  const w = buildWeeklyStatement(state);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Extracto semanal</h2>
          <p class="muted">${w.fromYmd} → ${w.toYmd}${isMonday(state) ? ' · Hoy es lunes (revisión recomendada)' : ''}</p>
          <div class="close-summary">
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(w.sales)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(w.commission)}</strong></div>
            <div class="stat-row"><span>Premios</span><strong>${formatEuro(w.prizes)}</strong></div>
            <div class="stat-row"><span>Gastos</span><strong>${formatEuro(w.expenses)}</strong></div>
            <div class="stat-row"><span>Faltantes</span><strong>${formatEuro(w.shortage)}</strong></div>
            <div class="stat-row"><span>Liquidaciones</span><strong>${w.settlements}</strong></div>
            <div class="stat-row"><span>Neto (comisión − gastos − faltantes)</span><strong>${formatEuro(w.net)}</strong></div>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
}

function renderStats() {
  const s = state.stats || {};
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Estadísticas</h2>
          <p class="muted">Acumulado de la partida</p>
          <div class="close-summary">
            <div class="stat-row"><span>Días jugados</span><strong>${s.daysPlayed ?? 0}</strong></div>
            <div class="stat-row"><span>Ventas totales</span><strong>${formatEuro(s.totalSalesCents || 0)}</strong></div>
            <div class="stat-row"><span>Comisiones totales</span><strong>${formatEuro(s.totalCommissionCents || 0)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(s.totalPrizesPaidCents || 0)}</strong></div>
            <div class="stat-row"><span>Faltantes de caja</span><strong>${formatEuro(s.totalShortageCents || 0)}</strong></div>
            <div class="stat-row"><span>Clientes atendidos</span><strong>${s.totalCustomers ?? 0}</strong></div>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
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
                  <div class="muted">${s.empty ? 'Vacío' : `Días ${s.daysPlayed ?? 0} · v${s.gameVersion || '?'}`}</div>
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
            <button class="btn" id="btn-export">Exportar JSON</button>
            <label class="btn ghost" style="cursor:pointer">Importar<input id="import-file" type="file" accept="application/json" hidden /></label>
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
      state = loadFromSlot(Number(btn.getAttribute('data-load')));
      maybeStartMusic();
      sfx.click();
      showToast('Partida cargada');
      needsFullRender = true;
      render();
    };
  });
  document.getElementById('btn-export').onclick = () => {
    exportGame(state);
    showToast('Exportado');
  };
  document.getElementById('import-file').onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      state = await importGame(f);
      maybeStartMusic();
      showToast('Importado');
      needsFullRender = true;
      render();
    } catch {
      alert('Archivo no válido');
    }
  };
  document.getElementById('btn-menu').onclick = () => {
    if (confirm('¿Volver al menú? Guarda antes si hace falta.')) {
      state = null;
      renderMenu();
    }
  };
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
          <div style="margin-bottom:14px">
            <h3 style="margin:0 0 6px">Encargos de calendario</h3>
            <p class="muted" style="margin:0 0 8px">Navidad / Niño con fecha de entrega.</p>
            ${calendarOrderButtonsHTML('stock')}
          </div>
          <div class="stock-list">
            ${physical
              .map((p) => {
                const qty = state.stock[p.id] ?? 0;
                return `<div class="stock-item">
                  <span><strong>${escapeHtml(p.name)}</strong> <span class="muted">(${p.org})</span></span>
                  <span>${qty}
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
                    .slice(0, 40)
                    .map(
                      (o) =>
                        `<div class="log-item">${o.status}${o.special ? ' · ENCARGO' : ''} · ${escapeHtml(o.productName)} ×${o.qty} · ${o.arriveOnYmd}${
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
  bindCalendarOrderButtons('stock', state.customers.current);
  app.querySelectorAll('[data-order]').forEach((btn) => {
    btn.onclick = () => {
      orderStock(state, btn.getAttribute('data-order'), 20);
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
}

function renderPrize() {
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Pagar premio (manual)</h2>
          <p class="muted">Para premios sueltos. Los de ticket se gestionan en el mostrador al comprobar.</p>
          <label>Cliente<br/><input id="prize-name" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" /></label>
          <label>Importe (€)<br/><input id="prize-amount" type="number" min="0.01" step="0.01" value="5" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" /></label>
          <div class="actions">
            <button class="btn primary" id="btn-prize-cash">Efectivo</button>
            <button class="btn" id="btn-prize-transfer">Transferencia</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  const doPay = (method) => {
    const name = document.getElementById('prize-name').value.trim() || 'Cliente';
    const cents = Math.round(parseFloat(document.getElementById('prize-amount').value || '0') * 100);
    const ok = payPrize(state, { amountCents: cents, clientName: name, method });
    ok ? sfx.cash() : sfx.error();
    showToast(state.ui.toast);
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-prize-cash').onclick = () => doPay('cash');
  document.getElementById('btn-prize-transfer').onclick = () => doPay('transfer');
}

function formatDrawDetail(d) {
  let detail = '';
  if (d.numbers) detail = d.numbers.join(', ');
  if (d.stars) detail += ` ★ ${d.stars.join(', ')}`;
  if (d.reintegro != null) detail += ` · R${d.reintegro}`;
  if (d.clave != null) detail += ` · clave ${d.clave}`;
  if (d.winningNumber) detail = `Nº ${d.winningNumber}`;
  if (d.column) detail = `Columna ${d.column.join('')}${d.pleno ? ` · pleno ${d.pleno}` : ''}`;
  if (d.goals) detail = `Goles ${d.goals.join('')}`;
  if (d.complementary != null) detail += ` · C${d.complementary}`;
  return detail || '—';
}

function renderDraws() {
  ensureDrawsResolved(state);
  const entries = listDrawHistory(state, 60);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Sorteos resueltos</h2>
          <p class="muted">Se resuelven solos a la hora del sorteo (aprox. 21:00). Nacional, Primitiva, Bonoloto, Euromillones, Cupón ONCE…</p>
          <div class="log">
            ${
              entries.length
                ? entries
                    .map((d) => {
                      const p = getProduct(d.productId);
                      return `<div class="log-item"><strong>${escapeHtml(p?.name || d.productId)}</strong> · ${d.ymd}<br/>${escapeHtml(formatDrawDetail(d))}</div>`;
                    })
                    .join('')
                : '<div class="muted">Aún no hay sorteos. Avanza el tiempo hasta después de las 21:00.</div>'
            }
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
}

function renderManagement() {
  const list = [...(state.prizeManagement || [])].reverse();
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Gestión de premios grandes</h2>
          <p class="muted">No se pagan de tu caja. Al cerrar días avanzan: abierto → presentado → liquidado (paga LAE/ONCE).</p>
          <div class="log">
            ${
              list.length
                ? list
                    .map(
                      (c) =>
                        `<div class="log-item"><strong>${escapeHtml(c.clientName)}</strong> · ${formatEuro(c.amountCents)} · ${escapeHtml(c.productName)}<br/>
                        Estado: <strong>${c.status}</strong> (${c.level}) · ${escapeHtml(c.note || '')}</div>`,
                    )
                    .join('')
                : '<div class="muted">No hay casos de gestión.</div>'
            }
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
}

function findFicha(id) {
  return (
    (state.customers.abonados || []).find((c) => c.id === id) ||
    (state.customers.penas || []).find((c) => c.id === id) ||
    null
  );
}

function renderFichas() {
  const abonados = state.customers.abonados || [];
  const penas = state.customers.penas || [];
  const detail = state.ui.fichaId ? findFicha(state.ui.fichaId) : null;

  let body;
  if (detail) {
    const favIds = detail.preferredProducts || (detail.favoriteProduct ? [detail.favoriteProduct] : []);
    const favNames = favIds.map((id) => getProduct(id)?.name || id);
    const history = [...(detail.history || [])].slice(-20).reverse();
    const prizes = detail.prizesClaimed || [];
    const orders = detail.orders || [];
    const clientOrders = (state.orders || []).filter((o) => o.clientId === detail.id).slice(-15).reverse();
    body = `
      <button class="btn ghost" id="btn-ficha-back" style="margin-bottom:12px">← Volver al listado</button>
      <h2>${escapeHtml(detail.name)}</h2>
      <p class="muted">${detail.kind === 'pena' ? 'Peña' : 'Abonado'}${detail.street ? ` · ${escapeHtml(detail.street)}` : ''}${
        detail.members ? ` · ${detail.members} socios` : ''
      }</p>
      <div class="close-summary" style="margin-top:12px">
        <div class="stat-row"><span>Suscripción</span><strong>${escapeHtml(detail.subscription || '—')}</strong></div>
        <div class="stat-row"><span>Pago preferido</span><strong>${payLabel(detail.prefersPayment || 'cash')}</strong></div>
        <div class="stat-row"><span>Favoritos</span><strong>${escapeHtml(favNames.join(', ') || '—')}</strong></div>
      </div>
      <h3 style="margin-top:16px">Historial de compras</h3>
      <div class="log">
        ${
          history.length
            ? history
                .map((h) => {
                  const items = (h.items || []).map((i) => `${i.name || i.productId}×${i.qty}`).join(', ');
                  return `<div class="log-item">${formatEuro(h.totalCents || 0)} · ${escapeHtml(items || 'venta')}${
                    h.ticketIds?.length ? ` · tickets ${h.ticketIds.join(', ')}` : ''
                  }</div>`;
                })
                .join('')
            : '<div class="muted">Sin compras registradas aún.</div>'
        }
      </div>
      <h3 style="margin-top:16px">Premios cobrados</h3>
      <div class="log">
        ${
          prizes.length
            ? prizes
                .map(
                  (p) =>
                    `<div class="log-item">${escapeHtml(p.productName || p.id || 'Premio')} · ${formatEuro(p.amountCents || p.prizeCents || 0)}</div>`,
                )
                .join('')
            : '<div class="muted">Ningún premio cobrado en ficha.</div>'
        }
      </div>
      <h3 style="margin-top:16px">Pedidos / encargos</h3>
      <div class="log">
        ${
          orders.length || clientOrders.length
            ? [...orders, ...clientOrders]
                .slice(0, 20)
                .map(
                  (o) =>
                    `<div class="log-item">${escapeHtml(o.productName || o.productId || 'Pedido')} ×${o.qty || 1}${
                      o.arriveOnYmd ? ` · ${o.arriveOnYmd}` : ''
                    }${o.status ? ` · ${o.status}` : ''}</div>`,
                )
                .join('')
            : '<div class="muted">Sin pedidos en ficha.</div>'
        }
      </div>
      <h3 style="margin-top:16px">Nuevo encargo calendario</h3>
      ${calendarOrderButtonsHTML('ficha')}
    `;
  } else {
    body = `
      <h2>Abonados y peñas</h2>
      <p class="muted">Fichas de clientes con suscripción o peña. Pulsa para ver detalle.</p>
      <h3 style="margin-top:14px">Abonados (${abonados.length})</h3>
      <div class="slot-grid">
        ${abonados
          .map(
            (a) => `<button class="slot" data-ficha="${a.id}" style="cursor:pointer;text-align:left;width:100%">
              <div>
                <strong>${escapeHtml(a.name)}</strong>
                <div class="muted">${escapeHtml(a.subscription || '')} · ${escapeHtml(getProduct(a.favoriteProduct)?.name || '')}</div>
              </div>
            </button>`,
          )
          .join('')}
      </div>
      <h3 style="margin-top:18px">Peñas (${penas.length})</h3>
      <div class="slot-grid">
        ${penas
          .map(
            (p) => `<button class="slot" data-ficha="${p.id}" style="cursor:pointer;text-align:left;width:100%">
              <div>
                <strong>${escapeHtml(p.name)}</strong>
                <div class="muted">${escapeHtml(p.subscription || '')}${p.members ? ` · ${p.members} socios` : ''}</div>
              </div>
            </button>`,
          )
          .join('')}
      </div>
    `;
  }

  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">${body}</section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  if (detail) bindCalendarOrderButtons('ficha', detail);
  app.querySelectorAll('[data-ficha]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      state.ui.fichaId = btn.getAttribute('data-ficha');
      needsFullRender = true;
      render();
    };
  });
  const back = document.getElementById('btn-ficha-back');
  if (back) {
    back.onclick = () => {
      sfx.click();
      state.ui.fichaId = null;
      needsFullRender = true;
      render();
    };
  }
}

// Boot
state = null;
renderMenu();
requestAnimationFrame(loop);
window.__loterias = () => state;
