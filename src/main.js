import './style.css';
import {
  advanceClock,
  setSpeed,
  togglePause,
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
  exportDayPackage,
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
  advanceCheckQueue,
  checkQueueProgress,
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
import {
  buildDayCloseSummary,
  closeDay,
  dayProfitBreakdown,
  settlementExplain,
} from './game/economy.js';
import {
  PRODUCTS,
  TPV_CATEGORIES,
  productsByTpvCategory,
  getProduct,
  productMetaLabel,
} from './data/products.js';
import { BILLS, COINS, emptyDrawer } from './data/money.js';
import {
  sfx,
  startMusic,
  setMusicEnabled,
  setSfxEnabled,
  isMusicEnabled,
  setMusicVolume,
  setSfxVolume,
} from './game/sounds.js';
import {
  ensureDrawsResolved,
  listDrawHistory,
  modeHint,
  nextDrawLabel,
  drawsHappeningNow,
} from './game/draws.js';
import {
  formatSelection,
  lastIssuedTicket,
  LARGE_PRIZE_CENTS,
  MEDIUM_PRIZE_CENTS,
} from './game/tickets.js';
import {
  payTicketPrize,
  startPrizeManagement,
  advancePrizeCase,
  PRIZE_MGMT_STATUS,
  PAPERWORK_BY_STATUS,
  ensureCasePaperwork,
  togglePrizePaperwork,
  paperworkDone,
  dismissHighPrizeAlert,
  MEDIUM_PAPERWORK,
  ensureMediumPaperwork,
  mediumPaperworkDone,
  toggleMediumPaperwork,
} from './game/prizes.js';
import { logoHTML } from './data/logos.js';
import {
  encyclopediaFamilies,
  encyclopediaStats,
  encyclopediaDaily,
  renderEncyclopediaDetail,
} from './game/encyclopedia.js';
import {
  downloadTicketPdf,
  downloadSaleReceiptPdf,
  downloadStatsPdf,
  downloadWeeklyPdf,
  downloadMonthlyPdf,
  downloadDayClosePdf,
  downloadPrizeCasePdf,
} from './game/pdf.js';
import { stockCriticalList, stockAlertBanner, pendingOrdersSummary } from './game/stockAlerts.js';
import { eventOn } from './data/events.js';
import { birthdayBanner } from './data/birthdays.js';
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
  undoLastTpvLine,
  dailyTpvShortcuts,
  confirmAbonoOnTpv,
  setLineFraction,
  setLineSeries,
  applyNumberSlots,
  setNumberEntrySlot,
  randomizeNumberEntrySlot,
  randomizeAllNumberEntrySlots,
  clearNumberEntrySlots,
  CANCEL_REASONS,
} from './game/tpv.js';
import {
  addShowcaseDecimo,
  removeShowcaseDecimo,
  sellShowcaseToTpv,
  ensureShowcase,
  validateShowcaseAgainstTpv,
  showcaseableProducts,
} from './game/showcase.js';
import { placeSupplierOrder, mondayScratchInventory, restockLowScratches, supplierUnitCostCents } from './game/supplier.js';
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
  todaysDrawDetails,
  specialOrderDeadlines,
  createCalendarOrder,
  isOnceExtraSellable,
  onceExtraToday,
} from './game/notices.js';
import { depositCashToBank, withdrawBankToCash } from './game/bank.js';
import { buildTownBoard } from './data/board.js';
import { currentMonthStatement } from './game/monthly.js';
import { maybeLowCashAlert, dismissLowCashAlert } from './game/alerts.js';
import { recentCloses } from './game/closeHistory.js';

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
  if (state?.settings?.musicVolume != null) setMusicVolume(state.settings.musicVolume);
  if (state?.settings?.sfxVolume != null) setSfxVolume(state.settings.sfxVolume);
  applyTheme();
}

function applyTheme() {
  const theme = state?.settings?.theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const scale = Number(state?.settings?.fontScale) || 1;
  document.documentElement.style.fontSize = `${16 * scale}px`;
}

function confirmImportant(message) {
  return window.confirm(message);
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
      if (before !== after || qBefore !== qAfter) {
        if (after && after !== before) sfx.door();
        else if (qAfter > qBefore) sfx.notice();
        needsFullRender = true;
      }
    }

    const prevAutosave = lastAutosaveRealMs;
    lastAutosaveRealMs = maybeAutosave(state, lastAutosaveRealMs);
    if (lastAutosaveRealMs !== prevAutosave) {
      if (state.ui.toast?.startsWith('Partida guardada')) state.ui.toast = null;
      const el = document.getElementById('autosave-badge');
      if (el) {
        const slot = state.ui.lastAutosaveSlot || state.meta?.activeSlot || 1;
        el.textContent = `Autoguardado · hueco ${slot}`;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 1200);
      }
    }

    maybeMondayHint();
    if (maybeLowCashAlert(state)) {
      sfx.alert();
      needsFullRender = true;
    }

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
  const { low } = mondayScratchInventory(state);
  if (low.length) {
    showToast(`Lunes: ${low.length} rascas bajos de stock · Extracto semanal + inventario rascas`);
  } else {
    showToast('Lunes: revisa el extracto semanal e inventario de rascas.');
  }
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
  applyTheme();
  if (!state || state.ui.screen === 'menu') return renderMenu();
  if (state.ui.screen === 'cash') return renderCash();
  if (state.ui.screen === 'tpv') return renderTpv();
  if (state.ui.screen === 'close') return renderClose();
  if (state.ui.screen === 'day-results') return renderDayResults();
  if (state.ui.screen === 'closes') return renderCloses();
  if (state.ui.screen === 'saves') return renderSavesInGame();
  if (state.ui.screen === 'stock') return renderStock();
  if (state.ui.screen === 'showcase') return renderShowcase();
  if (state.ui.screen === 'prize') return renderPrize();
  if (state.ui.screen === 'draws') return renderDraws();
  if (state.ui.screen === 'management') return renderManagement();
  if (state.ui.screen === 'fichas') return renderFichas();
  if (state.ui.screen === 'arqueo') return renderArqueo();
  if (state.ui.screen === 'weekly') return renderWeekly();
  if (state.ui.screen === 'stats') return renderStats();
  if (state.ui.screen === 'board') return renderBoard();
  if (state.ui.screen === 'bank') return renderBank();
  if (state.ui.screen === 'settings') return renderSettings();
  if (state.ui.screen === 'monthly') return renderMonthly();
  if (state.ui.screen === 'encyclopedia') return renderEncyclopedia();
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
  const ymd = gameYmd(state);
  const ev = eventOn(ymd, state.events);
  const bday = birthdayBanner(state, ymd);
  const parts = [];
  if (ev) parts.push(`Evento en Álora: ${ev.name}`);
  if (bday) parts.push(bday);
  return parts.join(' · ');
}

function highPrizeAlertHTML() {
  const a = state.ui?.highPrizeAlert;
  if (!a) return '';
  return `<div class="alert-banner" id="high-prize-alert">
    <strong>⚠ Premio alto</strong>
    <div>${escapeHtml(a.clientName || 'Cliente')} · ${escapeHtml(a.productName || '')} · ${formatEuro(a.amountCents)}</div>
    <div class="actions" style="margin-top:8px">
      <button class="btn" id="btn-dismiss-high-prize">Entendido</button>
      <button class="btn primary" id="btn-goto-mgmt-prize">Ir a gestión</button>
    </div>
  </div>`;
}

function lowCashAlertHTML() {
  const a = state.ui?.lowCashAlert;
  if (!a) return '';
  return `<div class="alert-banner alert-banner--cash" id="low-cash-alert">
    <strong>⚠ Caja baja</strong>
    <div>${formatEuro(a.drawerCents)} en cajón (umbral ${formatEuro(a.thresholdCents)}). Considera sacar cambio del banco.</div>
    <div class="actions" style="margin-top:8px">
      <button class="btn" id="btn-dismiss-low-cash">Entendido</button>
      <button class="btn primary" id="btn-goto-bank-cash">Ir a Caja ↔ banco</button>
    </div>
  </div>`;
}

function pauseSummaryHTML() {
  const p = state.ui?.pauseSummary;
  if (!p || !state.clock?.paused) return '';
  const current = p.current ? `cliente actual: ${escapeHtml(p.current)}` : 'sin cliente en mostrador';
  return `<div class="pause-banner" id="pause-summary">
    <strong>Oficina en pausa</strong>
    <div>${p.queue ?? 0} en cola · ${current} · ventas hoy ${formatEuro(p.salesToday || 0)}</div>
    <div class="actions" style="margin-top:8px">
      <button class="btn primary" id="btn-resume">Reanudar</button>
    </div>
  </div>`;
}

function bindHighPrizeAlert() {
  const d = document.getElementById('btn-dismiss-high-prize');
  if (d) {
    d.onclick = () => {
      dismissHighPrizeAlert(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
  const g = document.getElementById('btn-goto-mgmt-prize');
  if (g) {
    g.onclick = () => {
      dismissHighPrizeAlert(state);
      state.ui.screen = 'management';
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
}

function bindLowCashAlert() {
  const d = document.getElementById('btn-dismiss-low-cash');
  if (d) {
    d.onclick = () => {
      dismissLowCashAlert(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
  const g = document.getElementById('btn-goto-bank-cash');
  if (g) {
    g.onclick = () => {
      dismissLowCashAlert(state);
      state.ui.screen = 'bank';
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
}

function bindPauseSummary() {
  const r = document.getElementById('btn-resume');
  if (!r) return;
  r.onclick = () => {
    if (state.clock.paused) togglePause(state);
    if (state.clock.speed === 0 || state.clock.paused) setSpeed(state, 1);
    state.ui.pauseSummary = null;
    sfx.click();
    needsFullRender = true;
    render();
  };
}

/** Tras comprobar, suena jackpot si hay alerta de premio alto. */
function maybeJackpotSfx() {
  if (state.ui?.highPrizeAlert) sfx.jackpot();
}

/** Tras cobro/despedida de comprobación: siguiente ticket o salir. */
function finishOrAdvanceCheck() {
  const adv = advanceCheckQueue(state);
  if (adv.advanced) {
    showToast(state.ui.toast || 'Siguiente ticket');
    return true;
  }
  state.customers.current = null;
  return false;
}

function dictateHint(mode) {
  return modeHint(mode);
}

function renderMenu() {
  const slots = listSlots();
  app.innerHTML = `
    <div class="menu-screen menu-v1">
      <div class="menu-blobs" aria-hidden="true">
        <span class="blob b1"></span>
        <span class="blob b2"></span>
        <span class="blob b3"></span>
        <span class="blob b4"></span>
      </div>
      <div class="menu-card menu-card-color">
        <div class="menu-brand-row">
          <span class="menu-logo-mark" aria-hidden="true">LA</span>
          <div>
            <div class="menu-kicker">Álora · Málaga · v${GAME_VERSION}</div>
            <h1>Loterías Álora</h1>
          </div>
        </div>
        <p class="tagline">Simulador estricto de mostrador. Tú eres Miriam: cobras, documentas y eliges cada décimo a mano.</p>
        <div class="menu-chip-row" aria-hidden="true">
          <span class="menu-chip c-teal">Mostrador</span>
          <span class="menu-chip c-amber">TPV</span>
          <span class="menu-chip c-coral">Premios</span>
          <span class="menu-chip c-sky">Enciclopedia</span>
          <span class="menu-chip c-lime">Tablón</span>
          <span class="menu-chip c-violet">Caja</span>
          <span class="menu-chip c-rose">Stock</span>
          <span class="menu-chip c-indigo">Sorteos</span>
          <span class="menu-chip c-orange">Botes</span>
          <span class="menu-chip c-mint">PDF</span>
        </div>
        <div class="actions">
          <button class="btn primary menu-cta" id="btn-new">Nueva partida</button>
          <label class="btn ghost" style="cursor:pointer">
            Importar archivo
            <input id="import-file" type="file" accept="application/json" hidden />
          </label>
        </div>
        <h3 class="menu-slots-title">Partidas guardadas</h3>
        <p class="muted" style="margin:0 0 8px;font-size:0.88rem">Guardado absoluto: TPV, caja, cola, premios y todo el estado.</p>
        <div class="slot-grid">
          ${slots
            .map((s) => {
              if (s.empty) {
                return `<div class="slot slot-empty"><div><strong>Hueco ${s.slot}</strong><div class="muted">Vacío</div></div></div>`;
              }
              const when = s.gameTimeMs
                ? new Date(s.gameTimeMs).toLocaleString('es-ES', { timeZone: 'UTC' })
                : '';
              return `<div class="slot slot-filled">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${when} · Día ${s.daysPlayed ?? 0} · v${s.gameVersion || '?'}${
                    s.complete ? ' · completa' : ''
                  }</div>
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
          Juego responsable · +18. Versión ${GAME_VERSION}: cifras del cliente, atajos TPV, errores de cobro, PDF con estilo y menús a todo color.
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
    showToast('Bienvenida, Miriam. Versión 1.2: casillas por número en cada lotería.');
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
      sfx.open();
      loadSummaryToast(state);
      needsFullRender = true;
      render();
    };
  });
}

function drawNoticeBannerHTML() {
  const live = drawsHappeningNow(state);
  let liveHtml = '';
  if (live.length) {
    const label = live
      .map((d) => {
        const tag = d.phase === 'soon' ? 'en breve' : d.phase === 'just' ? 'acaba de salir' : 'EN DIRECTO';
        return `${d.name} (${tag})`;
      })
      .join(' · ');
    liveHtml = `<div class="notice-banner draw-live sticky-notice">
      <strong>¡Hora del sorteo!</strong>
      <div class="notice-banner-detail">${escapeHtml(label)} · más comprobaciones en cola</div>
    </div>`;
  }
  const extras = onceExtraToday(state);
  const extraHtml = extras.length
    ? `<div class="notice-banner sticky-notice">
        <strong>ONCE extraordinario</strong>
        <div class="notice-banner-detail">${escapeHtml(extras.map((e) => e.name).join(' · '))} · a la venta hoy</div>
      </div>`
    : '';
  const details = todaysDrawDetails(state);
  if (!details.length && !liveHtml && !extraHtml) {
    const notices = todaysDrawNotices(state);
    if (!notices.length) return '';
    return `<div class="notice-banner">Hoy hay sorteo de: ${escapeHtml(notices.join(', '))}</div>`;
  }
  const items = details
    .map((d) => `${d.name} ${String(d.hour).padStart(2, '0')}:00`)
    .join(' · ');
  const dayHtml = details.length
    ? `<div class="notice-banner sticky-notice">
    <strong>Hoy: ${details.length} sorteo${details.length === 1 ? '' : 's'}</strong>
    <div class="notice-banner-detail">${escapeHtml(items)}</div>
  </div>`
    : '';
  return `${liveHtml}${extraHtml}${dayHtml}`;
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
  const autosaveBadge = (() => {
    if (!state.ui?.lastAutosaveAt) {
      return `<div class="autosave-badge muted" id="autosave-badge">Sin autoguardado aún</div>`;
    }
    const mins = Math.max(0, Math.round((Date.now() - state.ui.lastAutosaveAt) / 60000));
    const slot = state.ui.lastAutosaveSlot || state.meta?.activeSlot || 1;
    const when = mins === 0 ? 'ahora' : `hace ${mins}m`;
    return `<div class="autosave-badge" id="autosave-badge">Autoguardado ${when} · hueco ${slot}</div>`;
  })();
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-name">Loterías Álora</div>
        <div class="brand-sub">Miriam · Álora · v${GAME_VERSION}${ev ? ` · ${escapeHtml(ev)}` : ''}</div>
        ${touristHintHTML()}
        ${autosaveBadge}
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
    ${pauseSummaryHTML()}
    ${jackpotStripHTML()}
  `;
}

function bindTopbar() {
  app.querySelectorAll('[data-speed]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      const speed = Number(btn.getAttribute('data-speed'));
      setSpeed(state, speed);
      if (speed === 0) {
        state.ui.pauseSummary = {
          queue: state.customers.queue?.length || 0,
          current: state.customers.current?.name || null,
          salesToday: state.finance.daySalesCents || 0,
        };
      } else {
        state.ui.pauseSummary = null;
      }
      needsFullRender = true;
      render();
    };
  });
  bindPauseSummary();
}

function sideNav() {
  const profit = dayProfitBreakdown(state);
  const openMgmt = (state.prizeManagement || []).filter((c) => c.status !== 'settled').length;
  const musicOn = state.settings?.music !== false && isMusicEnabled();
  const dark = state.settings?.theme === 'dark';
  const navBtn = (id, label) =>
    `<button class="btn ${state.ui.screen === id ? 'primary' : ''}" data-nav="${id}">${label}</button>`;
  return `
    <aside class="panel nav-side">
      <div class="nav-group">
        <div class="nav-group-title">Mostrador</div>
        ${navBtn('counter', 'Mostrador')}
        ${navBtn('board', 'Tablón')}
        ${navBtn('fichas', 'Abonados / Peñas')}
        ${navBtn('draws', 'Sorteos')}
      </div>
      <div class="nav-group">
        <div class="nav-group-title">Caja y premios</div>
        ${navBtn('prize', 'Pagar premio')}
        ${navBtn('management', `Gestión premios${openMgmt ? ` (${openMgmt})` : ''}`)}
        ${navBtn('bank', 'Caja↔Banco')}
        <button class="btn" data-nav="arqueo">Arqueo</button>
      </div>
      <div class="nav-group">
        <div class="nav-group-title">Oficina</div>
        ${navBtn('encyclopedia', 'Enciclopedia')}
        ${navBtn('stock', 'Stock y pedidos')}
        ${navBtn('showcase', 'Escaparate')}
        ${navBtn('close', 'Cierre y balance')}
        ${navBtn('closes', 'Histórico cierres')}
      </div>
      <div class="nav-group">
        <div class="nav-group-title">Informes</div>
        ${navBtn('weekly', 'Extracto semanal')}
        ${navBtn('monthly', 'Liquidación mensual')}
        ${navBtn('stats', 'Estadísticas')}
      </div>
      <div class="nav-group">
        <div class="nav-group-title">Sistema</div>
        ${navBtn('settings', 'Ajustes')}
        ${navBtn('saves', 'Guardar / exportar')}
        <button class="btn" id="btn-music-toggle">${musicOn ? '♪ Música: ON' : '♪ Música: OFF'}</button>
        <button class="btn" id="btn-theme-toggle">${dark ? 'Tema: oscuro' : 'Tema: claro'}</button>
      </div>
      <hr style="border:none;border-top:1px solid var(--line);margin:14px 0" />
      <div class="stat-row"><span>Banco</span><strong>${formatEuro(state.finance.bankCents)}</strong></div>
      <div class="stat-row"><span>Caja</span><strong>${formatEuro(drawerTotalCents(state.finance.drawer))}</strong></div>
      <div class="stat-row"><span>Ventas hoy</span><strong>${formatEuro(state.finance.daySalesCents)}</strong></div>
      <div class="stat-row"><span>Comisión hoy</span><strong>${formatEuro(profit.commissionCents)}</strong></div>
      <div class="stat-row"><span>Beneficio hoy*</span><strong>${formatEuro(profit.profitCents)}</strong></div>
      <div class="stat-row"><span>Faltante hoy</span><strong>${formatEuro(profit.shortageCents || 0)}</strong></div>
      <div class="stat-row"><span>Clientes hoy</span><strong>${state.customers.servedToday}</strong></div>
      <div class="stat-row"><span>En cola</span><strong>${state.customers.queue?.length || 0}</strong></div>
      <div class="stat-row"><span>Velocidad</span><strong>${speedLabel(state.clock.speed, state.clock.paused)}</strong></div>
      <p class="muted" style="font-size:0.78rem;margin-top:8px">*Comisiones − gastos − faltantes</p>
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
      if (state.settings.musicVolume != null) setMusicVolume(state.settings.musicVolume);
      if (state.settings.sfxVolume != null) setSfxVolume(state.settings.sfxVolume);
      if (next) startMusic();
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.onclick = () => {
      state.settings = state.settings || {};
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
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
    .map((w) => {
      const extra = [];
      if (w.showcaseNumber) extra.push(`nº ${w.showcaseNumber} vitrina`);
      if (w.fromPickup) extra.push('encargo');
      if (w.note) extra.push(w.note);
      if (w.askLabel) extra.push(w.askLabel);
      else if (w.numberAsk?.label) extra.push(w.numberAsk.label);
      else if (w.preferDictate && !w.showcaseNumber) extra.push('dictado');
      else if (w.numberAsk?.kind === 'random') extra.push('aleatorio');
      return `<li>• <strong>${escapeHtml(w.productName)}</strong> × ${w.qty}${
        extra.length ? ` <span class="muted">(${escapeHtml(extra.join(' · '))})</span>` : ''
      }</li>`;
    })
    .join('')}</ul>`;
}

/** Resumen al cargar partida */
function loadSummaryToast(game) {
  if (!game) return;
  const q = game.customers?.queue?.length || 0;
  const cur = game.customers?.current?.name;
  const tpv = game.ui?.tpv ? 'TPV a medias' : null;
  const pay = game.ui?.paymentSession ? 'cobro a medias' : null;
  const mgmt = (game.prizeManagement || []).filter((c) => c.status !== 'settled').length;
  const day = game.stats?.daysPlayed ?? 0;
  const bits = [
    `Día ${day}`,
    cur ? `cliente: ${cur}` : 'sin cliente',
    `cola ${q}`,
    tpv,
    pay,
    mgmt ? `${mgmt} premios en gestión` : null,
  ].filter(Boolean);
  showToast(`Partida cargada · ${bits.join(' · ')}`);
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

function scratchOverlayHTML() {
  const sr = state.ui?.scratchReveal;
  if (!sr) return '';
  if (sr.step === 'scratching') {
    return `<div class="scratch-overlay" id="scratch-overlay">
      <div class="scratch-card">
        <div class="scratch-anim">✦</div>
        <h2>Rascando…</h2>
        <p class="muted">En mostrador, con la moneda</p>
      </div>
    </div>`;
  }
  const prize = sr.prizeCents || 0;
  return `<div class="scratch-overlay" id="scratch-overlay">
    <div class="scratch-card">
      <h2>${prize > 0 ? '¡Premio!' : 'Sin premio'}</h2>
      <p class="total-box" style="margin:12px 0">${prize > 0 ? formatEuro(prize) : 'Sigue jugando'}</p>
      <div class="actions">
        <button class="btn primary" id="btn-scratch-continue">Continuar</button>
      </div>
    </div>
  </div>`;
}

function bindScratchOverlay() {
  const cont = document.getElementById('btn-scratch-continue');
  if (!cont) return;
  cont.onclick = () => {
    state.ui.scratchReveal = null;
    sfx.click();
    needsFullRender = true;
    render();
  };
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
          ${highPrizeAlertHTML()}
          ${lowCashAlertHTML()}
          ${
            stockAlertBanner(state)
              ? `<div class="alert-banner stock-alert-banner">${escapeHtml(stockAlertBanner(state))}
                  <button class="btn" style="margin-left:8px;padding:4px 10px" data-nav="stock">Ir a stock</button>
                </div>`
              : ''
          }
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
          <div class="actions" style="margin-top:14px">
            <button class="btn" id="btn-reprint-last" ${lastIssuedTicket(state) ? '' : 'disabled'}>
              Reimprimir último ticket
            </button>
          </div>
          <p class="disclaimer" style="margin-top:16px">Fan-made · no oficial · +18 · v${GAME_VERSION}</p>
        </aside>
      </div>
    </div>
    ${scratchOverlayHTML()}
    ${toastHTML()}
  `;

  bindTopbar();
  bindNav();
  bindHighPrizeAlert();
  bindLowCashAlert();
  bindClientActions();
  bindScratchOverlay();
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
  const reprint = document.getElementById('btn-reprint-last');
  if (reprint) {
    reprint.onclick = () => {
      const t = lastIssuedTicket(state);
      if (!t) {
        sfx.error();
        showToast('No hay tickets emitidos para reimprimir');
        return;
      }
      downloadTicketPdf(t);
      sfx.success();
      showToast(`Reimpreso: ${t.productName} (${t.id})`);
    };
  }
}

function renderClientPanel(client) {
  const intent = client.intent || 'buy';
  const trait = client.trait ? ` · ${client.trait}` : '';
  const quote = client.line || client.note || '';
  const kindLabel =
    client.kind === 'pena' ? 'Peña' : client.kind === 'abonado' ? 'Abonado' : client.regular ? 'Habitual' : 'Visitante';

  if (
    intent === 'buy' ||
    intent === 'reserve_special' ||
    intent === 'abono' ||
    intent === 'pena_day' ||
    intent === 'pickup' ||
    intent === 'showcase_ask'
  ) {
    const totalWish = (client.wishlist || []).reduce((s, w) => {
      const p = getProduct(w.productId);
      return s + (p?.priceCents || 0) * w.qty;
    }, 0);
    const title =
      intent === 'reserve_special'
        ? 'Encargo / petición:'
        : intent === 'abono'
          ? 'Abono a confirmar en TPV:'
          : intent === 'pena_day'
            ? 'Pedido de peña:'
            : intent === 'pickup'
              ? 'Recoge su encargo:'
              : intent === 'showcase_ask'
                ? 'Pide del escaparate:'
                : 'Quiere:';
    return `
      <div class="client-card intent-${escapeHtml(intent)}">
        <div class="muted">${kindLabel}${trait} · ${escapeHtml(client.street || '')}${
          client.specialDay === 'birthday' ? ' · Cumpleaños' : client.specialDay === 'santo' ? ' · Santo' : ''
        }${intent === 'pickup' ? ' · Encargo listo' : ''}${intent === 'showcase_ask' ? ' · Vitrina' : ''}</div>
        <h3>${escapeHtml(client.name)}</h3>
        ${quote ? `<p class="muted">“${escapeHtml(quote)}”</p>` : ''}
        <p>${title}</p>
        ${wishlistHTML(client)}
        ${client.subscription ? `<p class="muted">Suscripción: ${escapeHtml(client.subscription)}</p>` : ''}
        ${totalWish ? `<p class="muted">Estimado: ${formatEuro(totalWish)}</p>` : ''}
        <p class="muted">Pago preferido: ${payLabel(client.prefersPayment)}</p>
        <p class="tip" style="margin:8px 0 0">La petición no se carga sola: ábrela en el TPV y selecciona tú cada producto.</p>
        <div class="actions">
          <button class="btn primary" id="btn-open-tpv">Abrir TPV</button>
          <button class="btn ghost" id="btn-load-wish" title="Opcional: solo si quieres meter la petición de golpe">Cargar petición (opcional)</button>
          ${
            intent === 'pickup' || intent === 'showcase_ask'
              ? ''
              : `<button class="btn" id="btn-reserve">Reservar sin pagar</button>`
          }
          <button class="btn ghost" id="btn-skip">Despedir</button>
        </div>
      </div>`;
  }

  if (intent === 'check') {
    const t = client.ticketFocus;
    const result = client.checkResult;
    const progress = checkQueueProgress(client);
    const progressLabel = progress
      ? `<p class="muted"><strong>Ticket ${progress.index + 1}/${progress.total}</strong>${
          progress.remaining ? ` · ${progress.remaining} más en cola` : ''
        }</p>`
      : '';
    const nextBtn =
      result && progress?.remaining
        ? `<button class="btn primary" id="btn-next-check">Siguiente ticket</button>`
        : '';
    return `
      <div class="client-card">
        <div class="muted">Comprobación${trait}</div>
        <h3>${escapeHtml(client.name)}</h3>
        ${progressLabel}
        <p>Trae <strong>${escapeHtml(t.productName)}</strong> (${t.id})</p>
        <p class="muted">${formatSelection(t)}${t.drawYmd ? ` · Sorteo ${t.drawYmd}` : ''}</p>
        ${
          result
            ? `<div class="check-compare">
                <div class="check-compare-col">
                  <span class="check-compare-label">Tu apuesta</span>
                  <strong>${escapeHtml(result.betText || formatSelection(t))}</strong>
                </div>
                <div class="check-compare-vs">vs</div>
                <div class="check-compare-col">
                  <span class="check-compare-label">Sorteo${t.drawYmd ? ` ${escapeHtml(t.drawYmd)}` : ''}</span>
                  <strong>${escapeHtml(result.drawText || '—')}</strong>
                </div>
              </div>
              <div class="${result.prizeCents ? 'total-box' : 'error-box'}" style="margin:10px 0">
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
              ? t.kind === 'rasca'
                ? `<button class="btn primary" id="btn-scratch">Rascar en mostrador</button>`
                : `<button class="btn primary" id="btn-check">Comprobar</button>`
              : result.prizeCents > 0
                ? `<button class="btn primary" id="btn-pay-now">Pagar ahora</button>
                   <button class="btn" id="btn-defer">Cobrar otro día</button>
                   <button class="btn accent" id="btn-manage">Gestionar (premio grande)</button>`
                : `${nextBtn}
                   <button class="btn ${nextBtn ? '' : 'primary'}" id="btn-done-check">${
                     nextBtn ? 'Terminar' : 'Listo'
                   }</button>`
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
    if (w.showcaseId || w.showcaseNumber) {
      const byId = w.showcaseId
        ? (state.showcase || []).find((d) => d.id === w.showcaseId)
        : null;
      if (byId) {
        sellShowcaseToTpv(state, byId.id);
        continue;
      }
      if (w.showcaseNumber) {
        addTpvProduct(state, w.productId, {
          qty: w.qty || 1,
          numberSource: 'dictate',
          selection: { number: String(w.showcaseNumber), fractions: w.qty || 1, series: false },
        });
        continue;
      }
    }
    const ask = w.numberAsk;
    if (ask?.selection) {
      addTpvProduct(state, w.productId, {
        qty: w.qty || 1,
        numberSource: 'dictate',
        selection: { ...ask.selection },
      });
      continue;
    }
    const src = ask?.kind === 'random' || (!w.preferDictate && ask?.kind !== 'dictate')
      ? 'random'
      : w.preferDictate || ask?.preferDictate
        ? 'dictate'
        : 'random';
    for (let i = 0; i < (w.qty || 1); i++) {
      addTpvProduct(state, w.productId, {
        qty: 1,
        numberSource: src,
      });
      // Prefill draft hint on last line
      if (src === 'dictate' && state.ui.tpv?.numberEntry) {
        // Reiniciar casillas con pista del cliente
        const line = state.ui.tpv.lines[state.ui.tpv.lines.length - 1];
        if (line && ask) {
          startDictateLine(state, line.id);
        }
      }
    }
  }
}

function bindClientActions() {
  const openTpvBtn = document.getElementById('btn-open-tpv');
  if (openTpvBtn) {
    openTpvBtn.onclick = () => {
      const client = state.customers.current;
      if (!client) return;
      if (client.intent === 'pena_day') sfx.pena();
      else sfx.tpv();
      // v1.0: nunca auto-cargar la petición; Miriam selecciona a mano
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
      maybeJackpotSfx();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  }
  const scratchBtn = document.getElementById('btn-scratch');
  if (scratchBtn) {
    scratchBtn.onclick = () => {
      const t = state.customers.current?.ticketFocus;
      if (!t) return;
      sfx.scratch();
      state.ui.scratchReveal = { ticketId: t.id, step: 'scratching', prizeCents: null };
      needsFullRender = true;
      render();
      setTimeout(() => {
        if (!state?.ui?.scratchReveal || state.ui.scratchReveal.ticketId !== t.id) return;
        checkCurrentTicket(state);
        maybeJackpotSfx();
        const prize = state.customers.current?.checkResult?.prizeCents ?? 0;
        state.ui.scratchReveal = { ticketId: t.id, step: 'done', prizeCents: prize };
        showToast(state.ui.toast);
        needsFullRender = true;
        render();
      }, 1400);
    };
  }
  const done = document.getElementById('btn-done-check');
  if (done) {
    done.onclick = () => {
      finishOrAdvanceCheck();
      needsFullRender = true;
      render();
    };
  }
  const nextCheck = document.getElementById('btn-next-check');
  if (nextCheck) {
    nextCheck.onclick = () => {
      const adv = advanceCheckQueue(state);
      if (adv.advanced) {
        sfx.scan();
        showToast(state.ui.toast || 'Siguiente ticket');
      } else {
        state.customers.current = null;
        sfx.click();
      }
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
          finishOrAdvanceCheck();
        }
      } else if (!res.ok) {
        sfx.error();
        showToast(res.message);
      } else {
        sfx.cash();
        showToast(state.ui.toast);
        if (!res.deferred) finishOrAdvanceCheck();
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
      finishOrAdvanceCheck();
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
      finishOrAdvanceCheck();
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

function numberEntryHTML(entry) {
  const slots = entry.slots || [];
  const groups = [];
  let cur = null;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!cur || cur.name !== s.group) {
      cur = { name: s.group, items: [] };
      groups.push(cur);
    }
    cur.items.push({ slot: s, index: i });
  }
  const slotsHtml = groups
    .map(
      (g) => `<div class="slot-group">
        <div class="slot-group-title">${escapeHtml(g.name)}</div>
        <div class="number-slots">
          ${g.items
            .map(({ slot: s, index: i }) => {
              const input =
                s.type === 'choice'
                  ? `<select class="slot-input slot-choice" data-slot-idx="${i}" aria-label="${escapeHtml(s.label)}">
                      <option value="">—</option>
                      ${(s.choices || [])
                        .map(
                          (c) =>
                            `<option value="${escapeHtml(c)}" ${
                              String(s.value) === String(c) ? 'selected' : ''
                            }>${escapeHtml(c)}</option>`,
                        )
                        .join('')}
                    </select>`
                  : `<input class="slot-input" data-slot-idx="${i}" inputmode="numeric" maxlength="${
                      s.type === 'digit' ? 1 : 3
                    }" value="${escapeHtml(s.value || '')}" aria-label="${escapeHtml(s.label)}" />`;
              return `<div class="number-slot" data-group="${escapeHtml(s.group)}">
                <label>${escapeHtml(s.label)}</label>
                ${input}
                <button type="button" class="btn slot-rand" data-slot-rand="${i}" title="Generar esta casilla">🎲</button>
              </div>`;
            })
            .join('')}
        </div>
      </div>`,
    )
    .join('');

  return `<div class="dictate-box number-entry-box">
    <strong>Marcar: ${escapeHtml(entry.productName || '')}</strong>
    <p class="muted">${escapeHtml(dictateHint(entry.mode))} · Escribe en cada casilla o genera una a una</p>
    ${slotsHtml}
    <div class="actions" style="margin-top:10px;flex-wrap:wrap">
      <button class="btn primary" id="btn-dictate-ok">Confirmar números</button>
      <button class="btn" id="btn-slots-all">Generar todas</button>
      <button class="btn ghost" id="btn-slots-clear">Vaciar</button>
      <button class="btn ghost" id="btn-dictate-cancel">Cancelar</button>
    </div>
    <details class="slot-advanced" style="margin-top:8px">
      <summary class="muted">Texto libre (avanzado)</summary>
      <textarea id="dictate-input" placeholder="Números en una sola línea…">${escapeHtml(entry.draft || '')}</textarea>
    </details>
  </div>`;
}

function wishlistValidationHTML(tpv) {
  if (!tpv?.wishlist?.length) return '';
  const v = validateWishlist(tpv);
  const rows = [];
  for (const c of v.covered) {
    const ask = c.askLabel ? ` · ${c.askLabel}` : '';
    rows.push(
      `<div class="wish-ok">✓ ${escapeHtml(c.productName)} ×${c.qty}${escapeHtml(ask)}</div>`,
    );
  }
  for (const m of v.missing) {
    const ask = m.askLabel ? ` · pedía: ${m.askLabel}` : '';
    rows.push(
      `<div class="wish-miss">✗ ${escapeHtml(m.productName)} · faltan ${m.need} (hay ${m.have})${escapeHtml(ask)}</div>`,
    );
  }
  for (const n of v.numberMismatches || []) {
    rows.push(
      `<div class="wish-miss">⚠ Cifras: ${escapeHtml(n.productName)} — ${escapeHtml(n.askLabel || '')} (${escapeHtml(n.reason || '')})</div>`,
    );
  }
  for (const e of v.extras) {
    rows.push(
      `<div class="wish-extra">+ Extra: ${escapeHtml(e.productName)} ×${e.qty}</div>`,
    );
  }
  let status;
  if (!v.complete) {
    status = '<div class="wish-miss" style="margin-top:6px"><strong>Faltan productos de la petición</strong></div>';
  } else if (!v.numbersOk) {
    status =
      '<div class="wish-extra" style="margin-top:6px"><strong>Productos OK · cifras distintas (puedes cobrar igual)</strong></div>';
  } else {
    status = '<div class="wish-ok" style="margin-top:6px"><strong>Petición cubierta</strong></div>';
  }
  return `<div class="wish-panel" style="margin:10px 0">
    <strong>Checklist petición</strong>
    ${rows.join('') || '<div class="muted">Sin líneas aún</div>'}
    ${status}
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
  const total = tpvTotalCents(tpv);
  if (!confirmImportant(`¿Confirmar cobro de ${formatEuro(total)} a ${tpv.clientName || 'cliente'}?`)) return;
  const items = tpvToSaleItems(tpv);
  const client = resolveTpvClient(tpv);
  startPayment(state, { items, client });
  state.ui.tpv = null;
  sfx.drawer();
  needsFullRender = true;
  render();
}

function showcaseWarningsHTML(tpv) {
  const warnings = tpv?.showcaseWarnings?.length
    ? tpv.showcaseWarnings
    : validateShowcaseAgainstTpv(state, tpv).warnings;
  if (!warnings?.length) return '';
  return `<div class="error-box showcase-warn" style="margin:10px 0">
    <strong>Aviso escaparate</strong>
    <ul style="margin:6px 0 0;padding-left:1.2rem">
      ${warnings.map((w) => `<li>${escapeHtml(w.message || w)}</li>`).join('')}
    </ul>
  </div>`;
}

function goTpvChargeOrReceipt() {
  const tpv = state.ui.tpv;
  if (!tpv) return;
  if (tpv.step === 'receipt') {
    const warn = validateShowcaseAgainstTpv(state, tpv);
    if (warn.warnings?.length) {
      showToast(warn.warnings.map((w) => w.message).join(' · '));
    }
    confirmTpvCharge();
    return;
  }
  goTpvReceipt(state);
  if (state.ui.tpv?.step !== 'receipt') sfx.error();
  else {
    sfx.scan();
    if (state.ui.tpv?.showcaseWarnings?.length) {
      showToast(state.ui.tpv.showcaseWarnings.map((w) => w.message).join(' · '));
    }
  }
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
        ${showcaseWarningsHTML(tpv)}
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
  const products = productsByTpvCategory(cat).filter((p) => isOnceExtraSellable(state, p.id));
  const total = tpvTotalCents(tpv);
  const entry = tpv.numberEntry;

  const catHue = { LAE: 195, ONCE: 28, Rascas: 310, Autonómicas: 155, Provinciales: 210, Locales: 340 };
  const shortcuts = dailyTpvShortcuts(state);
  app.innerHTML = `
    <div class="shell tpv-shell">
      ${topbarHTML()}
      <div class="panel tpv-panel" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <h2 style="margin:0">TPV · ${escapeHtml(tpv.clientName || 'Cliente')}</h2>
            <p class="muted" style="margin:4px 0 0">F1–F6 categorías · Enter cobrar · Esc atrás · Selección manual</p>
          </div>
          <button class="btn ghost" id="btn-tpv-back">Volver al mostrador</button>
        </div>
        ${tpv.message ? `<div class="error-box" style="margin:10px 0">${escapeHtml(tpv.message)}</div>` : ''}
        ${wishlistValidationHTML(tpv)}
        ${cancelPromptHTML(tpv)}
        <div class="tpv-shortcuts">
          <span class="tpv-shortcuts-label">Hoy</span>
          ${shortcuts
            .map(
              (s, i) =>
                `<button class="btn tpv-shortcut" data-shortcut="${s.id}" style="--sh-hue:${(i * 47 + 20) % 360}" title="${escapeHtml(s.fullName)}">${escapeHtml(s.name)}</button>`,
            )
            .join('')}
        </div>
        ${entry ? numberEntryHTML(entry) : ''}
        <div class="tpv-wrap">
          <div class="tpv-cats">
            ${TPV_CATEGORIES.map((c, i) => {
              const hue = catHue[c] ?? 180;
              return `<button class="btn tpv-cat-btn ${c === cat ? 'primary' : ''}" data-tpv-cat="${c}" style="--cat-hue:${hue}">F${i + 1} ${escapeHtml(c)}</button>`;
            }).join('')}
          </div>
          <div class="tpv-products">
            ${products
              .map((p) => {
                const stock =
                  p.stockType === 'physical'
                    ? `Stock ${state.stock[p.id] ?? 0}`
                    : 'Terminal';
                const meta =
                  productMetaLabel(p) ||
                  `Com. ${((p.commissionRate ?? 0.05) * 100).toFixed(1)}%${p.trait ? ` · ${p.trait}` : ''}`;
                const next = nextDrawLabel(p.id, gameDate(state));
                return `<div class="tpv-product tpv-product-rich" data-org="${escapeHtml(p.org || '')}">
                  <div class="tpv-product-head">
                    ${logoHTML(p, 'md')}
                    <div style="flex:1;min-width:0">
                      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                        <strong>${escapeHtml(p.name)}</strong>
                        <button class="btn ghost" style="padding:2px 8px;font-size:0.8rem" data-detail="${p.id}" title="Ficha">Info</button>
                      </div>
                      <span>${formatEuro(p.priceCents)} · ${escapeHtml(stock)}</span>
                    </div>
                  </div>
                  ${next ? `<div class="muted product-next">Próximo: ${escapeHtml(next)}</div>` : ''}
                  <div class="product-meta">${escapeHtml(meta)}</div>
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
          <aside class="tpv-cart tpv-cart-rich">
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
                              (() => {
                                const lp = getProduct(l.productId);
                                if (lp && (lp.numberMode === 'nacional' || lp.fractionable)) {
                                  return `<button class="btn" style="padding:6px 10px" data-frac="${l.id}" data-n="1">1 décimo</button>
                                   <button class="btn" style="padding:6px 10px" data-frac="${l.id}" data-n="2">x2</button>
                                   <button class="btn" style="padding:6px 10px" data-frac="${l.id}" data-n="5">x5</button>
                                   <button class="btn" style="padding:6px 10px" data-series="${l.id}">serie</button>`;
                                }
                                return '';
                              })()
                            }
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
            <div class="actions" style="margin-top:8px;flex-wrap:wrap">
              <button class="btn primary" id="btn-tpv-charge" style="flex:1;min-height:52px;font-size:1.05rem">Cobrar</button>
              <button class="btn" id="btn-tpv-undo" style="min-height:52px" title="Ctrl+Z">Deshacer</button>
              ${
                state.customers.current?.kind === 'abonado' || state.customers.current?.kind === 'pena'
                  ? `<button class="btn accent" id="btn-tpv-abono" style="min-height:52px">Confirmar abono</button>`
                  : ''
              }
              <button class="btn danger" id="btn-tpv-cancel" style="min-height:52px">Cancelar</button>
            </div>
            ${
              (state.showcase || []).length
                ? `<div style="margin-top:10px">
                    <div class="muted" style="margin-bottom:6px">Escaparate</div>
                    ${(state.showcase || [])
                      .slice(0, 6)
                      .map(
                        (d) =>
                          `<button class="btn" style="width:100%;margin-bottom:4px;justify-content:flex-start" data-sell-showcase="${d.id}">nº ${escapeHtml(d.number)} · ${escapeHtml(d.productName)} ×${d.qty}</button>`,
                      )
                      .join('')}
                  </div>`
                : ''
            }
          </aside>
        </div>
      </div>
    </div>
    ${productSheetHTML()}
    ${toastHTML()}
  `;

  bindTopbar();
  ensureTpvKeyboard();
  bindProductSheet();

  document.getElementById('btn-tpv-back').onclick = () => {
    sfx.click();
    state.ui.productSheet = null;
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

  app.querySelectorAll('[data-shortcut]').forEach((btn) => {
    btn.onclick = () => {
      sfx.tpv();
      const id = btn.getAttribute('data-shortcut');
      const p = getProduct(id);
      if (p?.tpvCategory) setTpvCategory(state, p.tpvCategory);
      addTpvProduct(state, id, { numberSource: 'random' });
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

  app.querySelectorAll('[data-detail]').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      sfx.click();
      state.ui.productSheet = { productId: btn.getAttribute('data-detail') };
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

  app.querySelectorAll('[data-frac]').forEach((btn) => {
    btn.onclick = () => {
      setLineFraction(state, btn.getAttribute('data-frac'), Number(btn.getAttribute('data-n')));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });
  app.querySelectorAll('[data-series]').forEach((btn) => {
    btn.onclick = () => {
      setLineSeries(state, btn.getAttribute('data-series'));
      sfx.click();
      needsFullRender = true;
      render();
    };
  });

  const dictateOk = document.getElementById('btn-dictate-ok');
  if (dictateOk) {
    dictateOk.onclick = () => {
      const details = document.querySelector('.slot-advanced');
      const usingText = details?.open && document.getElementById('dictate-input')?.value?.trim();
      if (usingText) {
        applyDictatedNumbers(state, document.getElementById('dictate-input').value);
      } else {
        applyNumberSlots(state);
      }
      if (state.ui.tpv?.numberEntry) sfx.error();
      else sfx.success();
      if (state.ui.tpv?.message) showToast(state.ui.tpv.message);
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
  app.querySelectorAll('[data-slot-idx]').forEach((el) => {
    const idx = Number(el.getAttribute('data-slot-idx'));
    const commit = () => {
      setNumberEntrySlot(state, idx, el.value);
      // Auto-avance a la siguiente casilla vacía
      const inputs = [...app.querySelectorAll('[data-slot-idx]')];
      const next = inputs.find((inp, i) => i > idx && !inp.value);
      if (next && el.value !== '') next.focus();
    };
    el.oninput = () => {
      setNumberEntrySlot(state, idx, el.value);
      // Digito: avanzar al escribir
      const slot = state.ui.tpv?.numberEntry?.slots?.[idx];
      if (slot?.type === 'digit' && el.value) {
        const inputs = [...app.querySelectorAll('[data-slot-idx]')];
        const next = inputs[idx + 1];
        if (next) next.focus();
      }
    };
    el.onchange = commit;
    el.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        dictateOk?.click();
      }
    };
  });
  app.querySelectorAll('[data-slot-rand]').forEach((btn) => {
    btn.onclick = () => {
      randomizeNumberEntrySlot(state, Number(btn.getAttribute('data-slot-rand')));
      sfx.tpv();
      needsFullRender = true;
      render();
      // Refocus same index after re-render roughly
    };
  });
  const allBtn = document.getElementById('btn-slots-all');
  if (allBtn) {
    allBtn.onclick = () => {
      randomizeAllNumberEntrySlots(state);
      sfx.success();
      showToast(state.ui.tpv?.message);
      needsFullRender = true;
      render();
    };
  }
  const clearBtn = document.getElementById('btn-slots-clear');
  if (clearBtn) {
    clearBtn.onclick = () => {
      clearNumberEntrySlots(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }

  document.getElementById('btn-tpv-charge').onclick = () => goTpvChargeOrReceipt();

  const undoBtn = document.getElementById('btn-tpv-undo');
  if (undoBtn) {
    undoBtn.onclick = () => {
      undoLastTpvLine(state);
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
  const abonoBtn = document.getElementById('btn-tpv-abono');
  if (abonoBtn) {
    abonoBtn.onclick = () => {
      if (!confirmImportant('¿Confirmar abono del cliente en el ticket?')) return;
      confirmAbonoOnTpv(state);
      sfx.success();
      needsFullRender = true;
      render();
    };
  }
  app.querySelectorAll('[data-sell-showcase]').forEach((btn) => {
    btn.onclick = () => {
      sellShowcaseToTpv(state, btn.getAttribute('data-sell-showcase'));
      sfx.tpv();
      needsFullRender = true;
      render();
    };
  });

  document.getElementById('btn-tpv-cancel').onclick = () => {
    if (tpv.lines.length && !confirmImportant('¿Cancelar el TPV y perder el ticket actual?')) return;
    sfx.click();
    closeTpv(state);
    showToast('TPV cancelado');
    needsFullRender = true;
    render();
  };
}

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function productSheetHTML() {
  const id = state.ui?.productSheet?.productId;
  if (!id) return '';
  const p = getProduct(id);
  if (!p) return '';
  const days = (p.drawDays || []).map((d) => DAY_NAMES_SHORT[d]).join(', ') || 'Especial / sin día fijo';
  const hour = p.drawHour != null ? `${String(p.drawHour).padStart(2, '0')}:00` : '—';
  const stock =
    p.stockType === 'physical' ? `${state.stock[p.id] ?? 0} uds` : 'Terminal (sin stock físico)';
  const jack = (state.jackpots?.values || {})[p.id];
  return `
    <div class="product-sheet-overlay" id="product-sheet">
      <div class="product-sheet panel">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
          <div style="display:flex;gap:12px;align-items:flex-start">
            ${logoHTML(p, 'lg')}
            <div>
              <div class="muted">${escapeHtml(p.org || '')} · ${escapeHtml(p.tpvCategory || '')}</div>
              <h2 style="margin:4px 0 8px">${escapeHtml(p.name)}</h2>
            </div>
          </div>
          <button class="btn ghost" id="btn-sheet-close">Cerrar</button>
        </div>
        <p>${escapeHtml(p.description || '')}</p>
        ${p.flavor ? `<p class="muted">“${escapeHtml(p.flavor)}”</p>` : ''}
        <div class="close-summary" style="margin-top:12px">
          <div class="stat-row"><span>Precio</span><strong>${formatEuro(p.priceCents)}</strong></div>
          <div class="stat-row"><span>Comisión</span><strong>${((p.commissionRate ?? 0.05) * 100).toFixed(1)}%</strong></div>
          <div class="stat-row"><span>Mecánica</span><strong>${escapeHtml(p.trait || p.numberMode || '—')}</strong></div>
          <div class="stat-row"><span>Premio orientativo</span><strong>${escapeHtml(p.topPrizeHint || '—')}</strong></div>
          <div class="stat-row"><span>Días de sorteo</span><strong>${escapeHtml(days)}</strong></div>
          <div class="stat-row"><span>Hora</span><strong>${escapeHtml(hour)}</strong></div>
          <div class="stat-row"><span>Stock</span><strong>${escapeHtml(stock)}</strong></div>
          ${jack ? `<div class="stat-row"><span>Bote actual</span><strong>${escapeHtml(formatJackpotShort(jack))}</strong></div>` : ''}
          ${p.orderDays != null && p.stockType === 'physical' ? `<div class="stat-row"><span>Pedido proveedor</span><strong>${p.orderDays} día(s)</strong></div>` : ''}
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn primary" id="btn-sheet-add">Añadir al ticket (aleatorio)</button>
          ${p.needsNumbers ? `<button class="btn" id="btn-sheet-dictate">Dictado</button>` : ''}
        </div>
      </div>
    </div>`;
}

function bindProductSheet() {
  const close = document.getElementById('btn-sheet-close');
  if (close) {
    close.onclick = () => {
      state.ui.productSheet = null;
      sfx.click();
      needsFullRender = true;
      render();
    };
  }
  const overlay = document.getElementById('product-sheet');
  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        state.ui.productSheet = null;
        needsFullRender = true;
        render();
      }
    };
  }
  const add = document.getElementById('btn-sheet-add');
  if (add) {
    add.onclick = () => {
      const id = state.ui.productSheet?.productId;
      state.ui.productSheet = null;
      if (id) {
        sfx.tpv();
        addTpvProduct(state, id, { numberSource: 'random' });
      }
      needsFullRender = true;
      render();
    };
  }
  const dict = document.getElementById('btn-sheet-dictate');
  if (dict) {
    dict.onclick = () => {
      const id = state.ui.productSheet?.productId;
      state.ui.productSheet = null;
      if (id) {
        sfx.tpv();
        addTpvProduct(state, id, { numberSource: 'dictate' });
      }
      needsFullRender = true;
      render();
    };
  }
}

function ensureTpvKeyboard() {
  if (tpvKeysBound) return;
  tpvKeysBound = true;
  document.addEventListener('keydown', (e) => {
    if (!state || state.ui.screen !== 'tpv' || !state.ui.tpv) return;
    const tpv = state.ui.tpv;
    const tag = (e.target?.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea';

    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !typing) {
      e.preventDefault();
      if (tpv.step !== 'receipt') {
        undoLastTpvLine(state);
        sfx.click();
        needsFullRender = true;
        render();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (state.ui.productSheet) {
        state.ui.productSheet = null;
      } else if (tpv.cancelPrompt) {
        dismissCancelPrompt(state);
      } else if (tpv.numberEntry) {
        cancelNumberEntry(state);
      } else if (tpv.step === 'receipt') {
        backTpvEdit(state);
      } else {
        if (tpv.lines.length && !confirmImportant('¿Cerrar el TPV y perder el ticket?')) return;
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
        ${
          ps.step === 'cash-tender' || ps.step === 'cash-change'
            ? `<p class="muted cash-keys-hint">Atajos: 1–7 billetes (5–500€) · Q–I monedas (2€→1c) · Shift=restar · Enter=continuar</p>`
            : ''
        }
        ${ps.error ? `<div class="error-box" style="margin:10px 0">${escapeHtml(ps.error)}</div>` : ''}
        ${body}
      </div>
    </div>
    ${toastHTML()}
  `;

  bindTopbar();
  ensureCashKeyboard();
  app.querySelectorAll('[data-method]').forEach((btn) => {
    btn.onclick = () => {
      const before = state.ui.paymentSession?.step;
      selectPaymentMethod(state, btn.getAttribute('data-method'));
      if (state.ui.paymentSession?.error && state.ui.paymentSession?.step === 'method') sfx.deny();
      else if (state.ui.paymentSession?.step === 'done') sfx.cash();
      else if (before === 'method' && state.ui.paymentSession?.method === 'cash') sfx.drawerOpen();
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

let cashKeysBound = false;
function ensureCashKeyboard() {
  if (cashKeysBound) return;
  cashKeysBound = true;
  const BILL_KEYS = {
    '1': 'b5',
    '2': 'b10',
    '3': 'b20',
    '4': 'b50',
    '5': 'b100',
    '6': 'b200',
    '7': 'b500',
  };
  const COIN_KEYS = {
    q: 'e2',
    w: 'e1',
    e: 'c50',
    r: 'c20',
    t: 'c10',
    y: 'c5',
    u: 'c2',
    i: 'c1',
  };
  document.addEventListener('keydown', (ev) => {
    if (!state || state.ui.screen !== 'cash') return;
    const ps = state.ui.paymentSession;
    if (!ps || (ps.step !== 'cash-tender' && ps.step !== 'cash-change')) return;
    const tag = (ev.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (ps.step === 'cash-tender') {
        confirmTender(state);
        state.ui.paymentSession?.error ? sfx.error() : sfx.scan();
      } else {
        confirmChange(state);
        if (state.ui.paymentSession?.error) sfx.error();
        else {
          sfx.cash();
          if (state.ui.toast) showToast(state.ui.toast);
        }
      }
      needsFullRender = true;
      render();
      return;
    }
    const k = ev.key?.toLowerCase?.() || '';
    const denomId = BILL_KEYS[ev.key] || COIN_KEYS[k];
    if (!denomId) return;
    ev.preventDefault();
    const delta = ev.shiftKey ? -1 : 1;
    if (ps.step === 'cash-tender') adjustTender(state, denomId, delta);
    else adjustChange(state, denomId, delta);
    sfx.click();
    needsFullRender = true;
    render();
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
          <p class="muted">Al confirmar: gastos del día, liquidación LAE/ONCE/otros y salto al siguiente laborable. Las gestiones de premios las avanzas tú a mano.</p>
          <div class="close-summary">
            <div class="stat-row"><span>Fecha</span><strong>${summary.date}</strong></div>
            <div class="stat-row"><span>Ventas</span><strong>${formatEuro(summary.salesCents)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(summary.commissionCents)}</strong></div>
            <div class="stat-row"><span>Beneficio del día*</span><strong>${formatEuro(summary.profitCents)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(summary.prizesPaidCents)}</strong></div>
            <div class="stat-row"><span>Gastos (al cerrar)</span><strong>${formatEuro(summary.expensesCents)}</strong></div>
            <div class="stat-row"><span>Faltantes arqueo</span><strong>${formatEuro(summary.shortageCents || 0)}</strong></div>
            <div class="stat-row"><span>Sobrantes arqueo</span><strong>${formatEuro(summary.surplusCents || 0)}</strong></div>
            <div class="stat-row"><span>Cajón</span><strong>${formatEuro(summary.drawerCents)}</strong></div>
            <div class="stat-row"><span>Banco</span><strong>${formatEuro(summary.bankCents)}</strong></div>
            <div class="stat-row"><span>Clientes</span><strong>${summary.customersServed}</strong></div>
            <div class="stat-row"><span>Siguiente laborable</span><strong>${summary.nextDay}</strong></div>
          </div>

          <h3 style="margin-top:18px">Desglose por organización</h3>
          <p class="muted">Comisión = lo que te quedas. Remesa = ventas − comisión (sale del banco al organismo).</p>
          <div class="close-summary">
            ${['LAE', 'ONCE', 'Otros']
              .map((org) => {
                const o = orgs?.[org] || { sales: 0, commission: 0, prizes: 0 };
                const remit = (o.sales || 0) - (o.commission || 0);
                return `<div class="stat-row"><span>${org} ventas</span><strong>${formatEuro(o.sales)}</strong></div>
                  <div class="stat-row"><span>${org} comisión retenida</span><strong>${formatEuro(o.commission)}</strong></div>
                  <div class="stat-row"><span>${org} remesa</span><strong>${formatEuro(remit)}</strong></div>
                  <div class="stat-row"><span>${org} premios pagados</span><strong>${formatEuro(o.prizes || 0)}</strong></div>`;
              })
              .join('')}
          </div>

          <h3 style="margin-top:18px">Liquidación prevista / última</h3>
          ${
            settle
              ? `<div class="close-summary">
                  ${settlementExplain(settle)
                    .map((line) => `<p class="muted" style="margin:4px 0">${escapeHtml(line)}</p>`)
                    .join('')}
                </div>`
              : `<p class="muted">Se calculará al cerrar: remesa = ventas − comisión; el banco recibe el reembolso de premios.</p>
                <div class="close-summary">
                  <div class="stat-row"><span>LAE remesa estimada</span><strong>${formatEuro((orgs?.LAE?.sales || 0) - (orgs?.LAE?.commission || 0))}</strong></div>
                  <div class="stat-row"><span>ONCE remesa estimada</span><strong>${formatEuro((orgs?.ONCE?.sales || 0) - (orgs?.ONCE?.commission || 0))}</strong></div>
                  <div class="stat-row"><span>Otros remesa estimada</span><strong>${formatEuro((orgs?.Otros?.sales || 0) - (orgs?.Otros?.commission || 0))}</strong></div>
                </div>`
          }

          <p class="muted">*Beneficio ≈ comisiones − gastos − faltantes de arqueo</p>
          <p class="muted" style="margin-top:12px">Recomendado: haz el arqueo de caja antes de cerrar.</p>
          <div class="actions" style="margin-top:18px">
            <button class="btn" id="btn-close-pdf">PDF del cierre</button>
            <button class="btn" id="btn-arqueo-before-close">Arqueo de caja primero</button>
            <button class="btn" data-nav="closes">Histórico cierres</button>
            <button class="btn accent" id="btn-do-close">Liquidar, balance y cerrar día</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-close-pdf').onclick = () => {
    downloadDayClosePdf(summary);
    sfx.success();
    showToast('PDF del cierre descargado');
  };
  document.getElementById('btn-arqueo-before-close').onclick = () => {
    sfx.click();
    startArqueo(state, 'close');
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-do-close').onclick = () => {
    if (!confirmImportant('¿Liquidar organizaciones, cerrar el día y pasar al siguiente laborable?')) return;
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
          <div class="actions" style="margin-top:16px">
            <button class="btn primary" id="btn-weekly-pdf">Descargar PDF</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-weekly-pdf').onclick = () => {
    downloadWeeklyPdf(w);
    sfx.success();
    showToast('PDF del extracto semanal descargado');
  };
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
          <p class="muted">Acumulado de la partida · v${GAME_VERSION}</p>
          <div class="close-summary">
            <div class="stat-row"><span>Días jugados</span><strong>${s.daysPlayed ?? 0}</strong></div>
            <div class="stat-row"><span>Ventas totales</span><strong>${formatEuro(s.totalSalesCents || 0)}</strong></div>
            <div class="stat-row"><span>Comisiones totales</span><strong>${formatEuro(s.totalCommissionCents || 0)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(s.totalPrizesPaidCents || 0)}</strong></div>
            <div class="stat-row"><span>Faltantes de caja</span><strong>${formatEuro(s.totalShortageCents || 0)}</strong></div>
            <div class="stat-row"><span>Clientes atendidos</span><strong>${s.totalCustomers ?? 0}</strong></div>
            <div class="stat-row"><span>Alertas premio alto</span><strong>${s.highPrizesAlerted ?? 0}</strong></div>
          </div>
          <div class="actions" style="margin-top:16px">
            <button class="btn primary" id="btn-stats-pdf">Descargar PDF</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-stats-pdf').onclick = () => {
    downloadStatsPdf(state);
    sfx.success();
    showToast('PDF de estadísticas descargado');
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
          <p class="muted">Se guarda <strong>absolutamente todo</strong>: TPV a medias, cobro, cola, tickets, premios, escaparate, arqueo, ajustes…</p>
          <div class="slot-grid">
            ${slots
              .map(
                (s) => `
              <div class="slot">
                <div>
                  <strong>Hueco ${s.slot}</strong>
                  <div class="muted">${
                    s.empty
                      ? 'Vacío'
                      : `Días ${s.daysPlayed ?? 0} · v${s.gameVersion || '?'}${s.tickets != null ? ` · ${s.tickets} tickets` : ''}${
                          s.complete ? ' · completa' : ''
                        }`
                  }</div>
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
            <button class="btn" id="btn-export">Exportar partida completa</button>
            <button class="btn accent" id="btn-day-package">Paquete del día</button>
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
      sfx.open();
      loadSummaryToast(state);
      needsFullRender = true;
      render();
    };
  });
  document.getElementById('btn-export').onclick = () => {
    exportGame(state);
    sfx.printer();
    showToast(state.ui.toast || 'Exportación completa');
  };
  document.getElementById('btn-day-package').onclick = async () => {
    await exportDayPackage(state, { downloadDayClosePdf });
    sfx.success();
    showToast(state.ui.toast || 'Paquete del día descargado');
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
  const monday = isMonday(state);
  const scratchLow = monday ? mondayScratchInventory(state).low : [];
  const criticalMap = new Map(stockCriticalList(state).map((c) => [c.id, c]));
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Stock y pedidos</h2>
          <p class="muted">Pedidos a proveedor con coste (banco) y fecha de llegada. Los críticos aparecen en rojo.</p>
          ${
            (() => {
              const crit = stockCriticalList(state);
              const orders = pendingOrdersSummary(state);
              if (!crit.length && !orders.arrivedCount) return '';
              return `<div class="alert-banner stock-alert-banner">
                ${crit.length ? `<strong>Bajo mínimo:</strong> ${crit.slice(0, 6).map((c) => `${escapeHtml(c.name)} (${c.qty})`).join(' · ')}` : ''}
                ${orders.arrivedCount ? `<div>Pedidos llegados: ${orders.arrivedCount}</div>` : ''}
                ${orders.pendingCount ? `<div class="muted">En camino: ${orders.pendingCount}</div>` : ''}
              </div>`;
            })()
          }
          ${
            monday
              ? `<div class="alert-banner" style="border-color:rgba(14,107,122,0.35);background:rgba(14,107,122,0.1)">
                  <strong>Lunes · inventario de rascas</strong>
                  <div class="muted">${scratchLow.length ? `${scratchLow.length} por debajo de 15` : 'Todos los rascas OK (≥15)'}</div>
                  <div class="actions" style="margin-top:8px">
                    <button class="btn primary" id="btn-restock-scratches">Reponer rascas bajos</button>
                  </div>
                </div>`
              : ''
          }
          <div style="margin-bottom:14px">
            <h3 style="margin:0 0 6px">Encargos de calendario</h3>
            <p class="muted" style="margin:0 0 8px">Navidad / Niño con fecha de entrega.</p>
            ${calendarOrderButtonsHTML('stock')}
          </div>
          <div class="stock-list">
            ${physical
              .map((p) => {
                const qty = state.stock[p.id] ?? 0;
                const cost = supplierUnitCostCents(p);
                const alert = criticalMap.get(p.id);
                return `<div class="stock-item ${alert ? (alert.critical ? 'stock-critical' : 'stock-low') : ''}">
                  <span><strong>${escapeHtml(p.name)}</strong> <span class="muted">(${p.org} · coste ~${formatEuro(cost)})</span>
                  ${alert ? `<span class="stock-badge">${alert.critical ? 'CRÍTICO' : 'bajo'}</span>` : ''}
                  </span>
                  <span>${qty}
                    <button class="btn" style="padding:4px 8px;margin-left:8px" data-supplier="${p.id}">Pedir 20</button>
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
                        `<div class="log-item">${o.status}${o.supplier ? ' · PROVEEDOR' : ''}${o.special ? ' · ENCARGO' : ''} · ${escapeHtml(o.productName)} ×${o.qty} · ${o.arriveOnYmd}${
                          o.totalCostCents != null ? ` · ${formatEuro(o.totalCostCents)}` : ''
                        }${o.clientName ? ` · ${escapeHtml(o.clientName)}` : ''}</div>`,
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
  const restock = document.getElementById('btn-restock-scratches');
  if (restock) {
    restock.onclick = () => {
      if (!confirmImportant('¿Pedir reposición de rascas bajos al proveedor (cargo en banco)?')) return;
      restockLowScratches(state);
      sfx.success();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  }
  app.querySelectorAll('[data-supplier]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-supplier');
      const p = getProduct(id);
      if (!confirmImportant(`¿Pedir 20 × ${p?.name || id} al proveedor? Se cobra el coste del banco.`)) return;
      placeSupplierOrder(state, id, 20);
      sfx.click();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
}

function claimableTickets() {
  return (state.tickets || []).filter(
    (t) => (t.status === 'checked' || t.status === 'managed') && (t.prizeCents || 0) > 0,
  );
}

function renderPrize() {
  const q = (state.ui.prizeSearch || '').trim().toLowerCase();
  const list = claimableTickets().filter((t) => {
    if (!q) return true;
    return (
      t.id.toLowerCase().includes(q) ||
      (t.clientName || '').toLowerCase().includes(q) ||
      (t.productName || '').toLowerCase().includes(q) ||
      formatSelection(t).toLowerCase().includes(q)
    );
  });
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Pagar premio</h2>
          <p class="muted">Busca un ticket comprobado o paga un premio suelto. Desde ${formatEuro(MEDIUM_PRIZE_CENTS)}: papeleo breve. Desde ${formatEuro(LARGE_PRIZE_CENTS)}: gestión.</p>
          <h3>Buscar ticket</h3>
          <label>ID, cliente o producto<br/>
            <input id="prize-search" value="${escapeHtml(state.ui.prizeSearch || '')}" placeholder="Ej. T12 o Miriam" style="width:100%;margin:6px 0 12px;padding:10px;border-radius:10px;border:1px solid var(--line)" />
          </label>
          <div class="log" style="max-height:320px;overflow:auto">
            ${
              list.length
                ? list
                    .slice(0, 40)
                    .map((t) => {
                      const medium =
                        t.prizeCents >= MEDIUM_PRIZE_CENTS && t.prizeCents < LARGE_PRIZE_CENTS;
                      if (medium) ensureMediumPaperwork(t);
                      const medDone = medium && mediumPaperworkDone(t);
                      const medHtml = medium
                        ? `<div class="paperwork-box" style="margin-top:8px">
                            <div class="paperwork-title">Papeleo mediano ${medDone ? '✓' : '(obligatorio)'}</div>
                            <ul class="paperwork-list">
                              ${MEDIUM_PAPERWORK.map(
                                (item) => `<li><label class="paperwork-item">
                                  <input type="checkbox" data-med-ticket="${escapeHtml(t.id)}" data-med-item="${item.id}" ${
                                    t.mediumPaperwork?.[item.id] ? 'checked' : ''
                                  } />
                                  <span>${escapeHtml(item.label)}</span>
                                </label></li>`,
                              ).join('')}
                            </ul>
                          </div>`
                        : '';
                      const actions =
                        t.status === 'managed' || t.prizeCents >= LARGE_PRIZE_CENTS
                          ? `<button class="btn accent" style="padding:4px 10px" data-manage-ticket="${t.id}">${
                              t.status === 'managed' ? 'Ver gestión' : 'Gestionar'
                            }</button>`
                          : `<button class="btn primary" style="padding:4px 10px" data-pay-ticket="${t.id}" data-method="cash" ${
                              medium && !medDone ? 'disabled title="Completa el papeleo mediano"' : ''
                            }>Efectivo</button>
                          <button class="btn" style="padding:4px 10px" data-pay-ticket="${t.id}" data-method="transfer" ${
                            medium && !medDone ? 'disabled' : ''
                          }>Transfer.</button>`;
                      return `<div class="log-item">
                        <strong>${escapeHtml(t.id)}</strong> · ${escapeHtml(t.clientName || '—')} · ${escapeHtml(t.productName)}
                        <br/>${escapeHtml(formatSelection(t))} · <strong>${formatEuro(t.prizeCents)}</strong>
                        <span class="muted"> · ${escapeHtml(t.status)}${medium ? ' · mediano' : ''}</span>
                        ${medHtml}
                        <div class="actions" style="margin-top:6px">${actions}</div>
                      </div>`;
                    })
                    .join('')
                : '<div class="muted">Ningún ticket con premio pendiente. Comprueba en el mostrador o usa pago suelto.</div>'
            }
          </div>
          <h3 style="margin-top:18px">Premio suelto (sin ticket)</h3>
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
  const search = document.getElementById('prize-search');
  search.oninput = () => {
    state.ui.prizeSearch = search.value;
  };
  search.onkeydown = (e) => {
    if (e.key === 'Enter') {
      needsFullRender = true;
      render();
    }
  };
  search.onblur = () => {
    needsFullRender = true;
    render();
  };
  app.querySelectorAll('[data-med-ticket]').forEach((inp) => {
    inp.onchange = () => {
      toggleMediumPaperwork(state, inp.getAttribute('data-med-ticket'), inp.getAttribute('data-med-item'));
      sfx.click();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
  app.querySelectorAll('[data-pay-ticket]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-pay-ticket');
      const method = btn.getAttribute('data-method') || 'cash';
      const res = payTicketPrize(state, id, { method });
      res.ok ? sfx.cash() : sfx.error();
      showToast(res.message || state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
  app.querySelectorAll('[data-manage-ticket]').forEach((btn) => {
    btn.onclick = () => {
      const t = state.tickets.find((x) => x.id === btn.getAttribute('data-manage-ticket'));
      if (!t) return;
      if (t.status !== 'managed') startPrizeManagement(state, t);
      sfx.click();
      showToast(state.ui.toast || 'Gestión de premios');
      state.ui.screen = 'management';
      needsFullRender = true;
      render();
    };
  });
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

function paperworkHTML(c) {
  ensureCasePaperwork(c);
  if (c.status === 'settled') {
    return `<p class="muted" style="margin-top:8px">Expediente cerrado. Papeleo archivado.</p>`;
  }
  const items = PAPERWORK_BY_STATUS[c.status] || [];
  const done = paperworkDone(c, c.status);
  return `
    <div class="paperwork-box">
      <div class="paperwork-title">Papeleo del paso · ${escapeHtml(PRIZE_MGMT_STATUS[c.status] || c.status)} ${
        done ? '✓' : '(incompleto)'
      }</div>
      <ul class="paperwork-list">
        ${items
          .map((item) => {
            const checked = !!c.paperwork[c.status]?.[item.id];
            return `<li>
              <label class="paperwork-item">
                <input type="checkbox" data-paper-case="${escapeHtml(c.id)}" data-paper-status="${escapeHtml(
                  c.status,
                )}" data-paper-item="${escapeHtml(item.id)}" ${checked ? 'checked' : ''} />
                <span>${escapeHtml(item.label)}</span>
              </label>
            </li>`;
          })
          .join('')}
      </ul>
    </div>`;
}

function renderManagement() {
  const list = [...(state.prizeManagement || [])].reverse();
  const nextLabel = {
    open: 'Documentar (tras papeleo)',
    documented: 'Presentar a organismo',
    submitted: 'Marcar liquidado',
  };
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Gestión de premios grandes</h2>
          <p class="muted">No salen de tu caja. Cada paso exige papeleo completo: abierto → documentado → presentado → liquidado (paga LAE/ONCE).</p>
          <div class="log">
            ${
              list.length
                ? list
                    .map((c) => {
                      ensureCasePaperwork(c);
                      const st = PRIZE_MGMT_STATUS[c.status] || c.status;
                      const ready = c.status === 'settled' || paperworkDone(c, c.status);
                      const btn =
                        c.status !== 'settled'
                          ? `<button class="btn primary" style="margin-top:8px;padding:6px 12px" data-adv-case="${c.id}" ${
                              ready ? '' : 'disabled title="Completa el papeleo"'
                            }>${nextLabel[c.status] || 'Avanzar'}${ready ? '' : ' · falta papeleo'}</button>`
                          : '';
                      return `<div class="log-item prize-case-card">
                        <strong>${escapeHtml(c.clientName)}</strong> · ${formatEuro(c.amountCents)} · ${escapeHtml(c.productName)}
                        <br/>Ticket ${escapeHtml(c.ticketId || '—')} · ${escapeHtml(c.org || '')} · ${c.level}
                        <br/>Estado: <strong>${escapeHtml(st)}</strong>
                        <br/><span class="muted">${escapeHtml(c.note || '')}</span>
                        ${paperworkHTML(c)}
                        <div class="actions" style="margin-top:8px;flex-wrap:wrap">
                          <button class="btn" data-case-pdf="${c.id}">PDF expediente</button>
                          ${btn}
                        </div>
                      </div>`;
                    })
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
  app.querySelectorAll('[data-paper-case]').forEach((inp) => {
    inp.onchange = () => {
      const res = togglePrizePaperwork(
        state,
        inp.getAttribute('data-paper-case'),
        inp.getAttribute('data-paper-status'),
        inp.getAttribute('data-paper-item'),
      );
      res.ok ? sfx.click() : sfx.error();
      showToast(res.message || state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
  app.querySelectorAll('[data-case-pdf]').forEach((btn) => {
    btn.onclick = () => {
      const c = (state.prizeManagement || []).find((x) => x.id === btn.getAttribute('data-case-pdf'));
      if (!c) return;
      const ticket = state.tickets.find((t) => t.id === c.ticketId);
      downloadPrizeCasePdf(c, ticket);
      sfx.printer();
      showToast('PDF del expediente descargado');
    };
  });
  app.querySelectorAll('[data-adv-case]').forEach((btn) => {
    btn.onclick = () => {
      const res = advancePrizeCase(state, btn.getAttribute('data-adv-case'));
      res.ok ? sfx.success() : sfx.error();
      showToast(res.message || state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
}

function renderEncyclopedia() {
  const families = encyclopediaFamilies();
  const stats = encyclopediaStats();
  const daily = encyclopediaDaily(state);
  const selected = state.ui.encyclopediaId || daily.todayFocus?.id || null;
  const familyOrder = ['LAE', 'ONCE', 'Rascas', 'Autonómicas', 'Provinciales', 'Locales'];
  const keys = [
    ...familyOrder.filter((k) => families.has(k)),
    ...[...families.keys()].filter((k) => !familyOrder.includes(k)),
  ];
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel ency-panel">
          <h2>Enciclopedia de loterías</h2>
          <p class="muted">${stats.total} productos · LAE ${stats.lae} · ONCE ${stats.once} · regionales ${stats.regional}</p>
          <div class="ency-daily">
            <div class="ency-daily-tip"><strong>Tip del día</strong><p>${escapeHtml(daily.tip)}</p></div>
            ${
              daily.todayFocus
                ? `<button class="ency-daily-focus" data-ency="${daily.todayFocus.id}">
                    ${logoHTML(daily.todayFocus.product, 'md')}
                    <span><strong>Hoy destaca</strong><br/>${escapeHtml(daily.todayFocus.name)}</span>
                  </button>`
                : ''
            }
            ${
              daily.hot.length
                ? `<div class="ency-hot">${daily.hot
                    .map(
                      (h) =>
                        `<button class="btn" data-ency="${h.id}" data-nav-board="1">${escapeHtml(h.p.short || h.p.name)} bote</button>`,
                    )
                    .join('')}
                    <button class="btn accent" data-nav="board">Ver tablón</button>
                  </div>`
                : `<div class="actions"><button class="btn accent" data-nav="board">Ver tablón del pueblo</button></div>`
            }
          </div>
          <div class="ency-layout">
            <div class="ency-catalog">
              ${keys
                .map((fam) => {
                  const entries = families.get(fam) || [];
                  return `<div class="ency-family">
                    <h3 class="ency-family-title">${escapeHtml(fam)}</h3>
                    <div class="ency-grid-cards">
                      ${entries
                        .map(
                          (e) => `<button class="ency-card ${selected === e.id ? 'active' : ''}" data-ency="${e.id}">
                            ${e.logoSm || logoHTML(e.product, 'sm')}
                            <span class="ency-card-name">${escapeHtml(e.short || e.name)}</span>
                          </button>`,
                        )
                        .join('')}
                    </div>
                  </div>`;
                })
                .join('')}
            </div>
            <div class="ency-detail-pane">
              ${
                selected
                  ? renderEncyclopediaDetail(selected)
                  : '<p class="muted">Elige una lotería para consultar precio, mecánica, sorteos y sabor.</p>'
              }
            </div>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  app.querySelectorAll('[data-ency]').forEach((btn) => {
    btn.onclick = () => {
      sfx.click();
      state.ui.encyclopediaId = btn.getAttribute('data-ency');
      needsFullRender = true;
      render();
    };
  });
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

function renderDayResults() {
  const s = state.ui.lastCloseSummary;
  if (!s) {
    state.ui.screen = 'counter';
    return render();
  }
  const settle = s.settlement;
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="panel day-results" style="margin-top:16px;max-width:720px">
        <h2>Resultados del día</h2>
        <p class="muted">Cierre de ${escapeHtml(s.date)} · siguiente laborable ${escapeHtml(s.nextDay)}</p>
        <div class="close-summary">
          <div class="stat-row"><span>Ventas</span><strong>${formatEuro(s.salesCents)}</strong></div>
          <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(s.commissionCents)}</strong></div>
          <div class="stat-row"><span>Beneficio</span><strong>${formatEuro(s.profitCents)}</strong></div>
          <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(s.prizesPaidCents)}</strong></div>
          <div class="stat-row"><span>Gastos</span><strong>${formatEuro(s.expensesCents)}</strong></div>
          <div class="stat-row"><span>Faltantes</span><strong>${formatEuro(s.shortageCents || 0)}</strong></div>
          <div class="stat-row"><span>Sobrantes</span><strong>${formatEuro(s.surplusCents || 0)}</strong></div>
          <div class="stat-row"><span>Clientes</span><strong>${s.customersServed}</strong></div>
          <div class="stat-row"><span>Banco tras cierre</span><strong>${formatEuro(s.bankCents)}</strong></div>
        </div>
        ${
          settle
            ? `<h3 style="margin-top:16px">Liquidación</h3>
               <p class="muted">Remesa = ventas − comisión retenida</p>
               <div class="close-summary">
                 ${settlementExplain(settle)
                   .slice(2)
                   .map((line) => `<div class="stat-row"><span>${escapeHtml(line)}</span></div>`)
                   .join('')}
               </div>`
            : ''
        }
        ${
          s.nextDayReasonSkip?.length
            ? `<p class="muted" style="margin-top:12px">Días saltados: ${escapeHtml(s.nextDayReasonSkip.join(', '))}</p>`
            : ''
        }
        <div class="actions" style="margin-top:18px">
          <button class="btn" id="btn-day-close-pdf">PDF del cierre</button>
          <button class="btn accent" id="btn-day-package">Paquete del día</button>
          <button class="btn" id="btn-day-closes">Histórico cierres</button>
          <button class="btn primary" id="btn-day-results-ok">Abrir mostrador</button>
        </div>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  document.getElementById('btn-day-close-pdf').onclick = () => {
    downloadDayClosePdf(s);
    sfx.success();
    showToast('PDF del cierre descargado');
  };
  document.getElementById('btn-day-package').onclick = async () => {
    await exportDayPackage(state, { downloadDayClosePdf });
    sfx.success();
    showToast(state.ui.toast || 'Paquete del día descargado');
  };
  document.getElementById('btn-day-closes').onclick = () => {
    sfx.click();
    state.ui.screen = 'closes';
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-day-results-ok').onclick = () => {
    sfx.click();
    state.ui.screen = 'counter';
    needsFullRender = true;
    render();
  };
}

function renderCloses() {
  const rows = recentCloses(state, 7);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Histórico de cierres</h2>
          <p class="muted">Últimos ${rows.length || 7} días cerrados (máx. 7 en vista).</p>
          ${
            rows.length
              ? `<div class="table-wrap" style="overflow:auto;margin-top:12px">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Ventas</th>
                        <th>Comisión</th>
                        <th>Beneficio</th>
                        <th>Clientes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (r) => `<tr>
                            <td>${escapeHtml(r.date)}</td>
                            <td>${formatEuro(r.salesCents)}</td>
                            <td>${formatEuro(r.commissionCents)}</td>
                            <td>${formatEuro(r.profitCents)}</td>
                            <td>${r.customersServed ?? 0}</td>
                          </tr>`,
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>`
              : '<p class="muted" style="margin-top:12px">Aún no hay cierres registrados. Cierra un día para empezar el histórico.</p>'
          }
          <div class="actions" style="margin-top:18px">
            <button class="btn" data-nav="close">Cierre y balance</button>
            <button class="btn primary" data-nav="counter">Mostrador</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
}

function renderShowcase() {
  ensureShowcase(state);
  const items = state.showcase || [];
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Escaparate</h2>
          <p class="muted">Décimos de administración a la vista (10–20). Véndelos desde el TPV.</p>
          <div class="showcase-grid">
            ${
              items.length
                ? items
                    .map(
                      (d) => `<div class="showcase-item">
                        <strong>nº ${escapeHtml(d.number)}</strong>
                        <div>${escapeHtml(d.productName)} ×${d.qty}</div>
                        <div class="muted">${formatEuro(d.unitCents * d.qty)}${d.note ? ` · ${escapeHtml(d.note)}` : ''}</div>
                        <button class="btn danger" style="margin-top:8px;padding:6px 10px" data-rm-sc="${d.id}">Quitar</button>
                      </div>`,
                    )
                    .join('')
                : '<div class="muted">Escaparate vacío.</div>'
            }
          </div>
          <h3 style="margin-top:18px">Añadir décimo</h3>
          <p class="muted">Nacional, especiales y décimos regionales fractionables.</p>
          <div class="actions" style="flex-wrap:wrap;align-items:flex-end">
            <label>Producto<br/>
              <select id="sc-product" style="padding:8px;border-radius:10px;border:1px solid var(--line);max-width:280px">
                ${showcaseableProducts()
                  .map(
                    (p) =>
                      `<option value="${p.id}">${escapeHtml(p.short || p.name)} · ${escapeHtml(p.org || '')}</option>`,
                  )
                  .join('')}
              </select>
            </label>
            <label>Número<br/><input id="sc-number" maxlength="5" placeholder="45821" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:110px" /></label>
            <label>Cant.<br/><input id="sc-qty" type="number" min="1" max="10" value="1" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:70px" /></label>
            <label>Nota<br/><input id="sc-note" placeholder="Vitrina" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:140px" /></label>
            <button class="btn primary" id="btn-sc-add">Añadir</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-sc-add').onclick = () => {
    addShowcaseDecimo(state, {
      productId: document.getElementById('sc-product').value,
      number: document.getElementById('sc-number').value,
      qty: Number(document.getElementById('sc-qty').value || 1),
      note: document.getElementById('sc-note').value,
    });
    sfx.click();
    showToast(state.ui.toast);
    needsFullRender = true;
    render();
  };
  app.querySelectorAll('[data-rm-sc]').forEach((btn) => {
    btn.onclick = () => {
      removeShowcaseDecimo(state, btn.getAttribute('data-rm-sc'));
      sfx.click();
      showToast(state.ui.toast);
      needsFullRender = true;
      render();
    };
  });
}


function renderBoard() {
  const ymd = gameYmd(state);
  const items = buildTownBoard(state, ymd);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Tablón del pueblo</h2>
          <p class="muted">Álora · ${escapeHtml(ymd)}</p>
          <div class="board-list" style="margin-top:12px;display:flex;flex-direction:column;gap:10px">
            ${
              items.length
                ? items
                    .map(
                      (it) => `<article class="board-item" data-kind="${escapeHtml(it.kind || '')}" style="padding:12px;border:1px solid var(--line);border-radius:12px">
                        <div class="muted" style="font-size:0.8rem;text-transform:uppercase">${escapeHtml(it.kind || '')}</div>
                        <h3 style="margin:4px 0 6px;font-family:var(--font-display)">${escapeHtml(it.title)}</h3>
                        <p style="margin:0">${escapeHtml(it.body || '')}</p>
                      </article>`,
                    )
                    .join('')
                : '<div class="muted">Nada en el tablón hoy.</div>'
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

function renderBank() {
  const cash = drawerTotalCents(state.finance.drawer);
  const bank = state.finance.bankCents;
  if (!state.ui.bankWithdrawCounts) state.ui.bankWithdrawCounts = emptyDrawer();
  const counts = state.ui.bankWithdrawCounts;
  const sum = countTotalCents(counts);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Caja ↔ Banco</h2>
          <p class="muted">Ingresa efectivo al banco o retira cambio eligiendo billetes y monedas.</p>
          <div class="close-summary" style="margin:12px 0">
            <div class="stat-row"><span>Efectivo en caja</span><strong>${formatEuro(cash)}</strong></div>
            <div class="stat-row"><span>Saldo banco</span><strong>${formatEuro(bank)}</strong></div>
          </div>
          <div class="actions" style="flex-wrap:wrap;align-items:flex-end;gap:12px">
            <label>Ingresar a banco (€)<br/>
              <input id="bank-deposit" type="number" min="0" step="0.01" placeholder="100" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:140px" />
            </label>
            <button class="btn primary" id="btn-bank-deposit">Ingresar</button>
          </div>
          <h3 style="margin-top:20px">Retirar a caja (denominaciones)</h3>
          <p class="muted">Marca qué billetes y monedas quieres del banco.</p>
          <div class="totals" style="margin:10px 0">
            <div class="total-box">Selección<strong id="wd-sum">${formatEuro(sum)}</strong></div>
          </div>
          ${['Billetes', 'Monedas']
            .map((title, i) => {
              const list = i === 0 ? BILLS : COINS;
              return `<h3 style="margin-top:12px">${title}</h3>
              <div class="denom-grid">
                ${list
                  .map(
                    (d) => `<div class="denom">
                  <div class="label">${d.label}</div>
                  <div class="row">
                    <button data-wd="${d.id}" data-delta="-1">−</button>
                    <strong>${counts[d.id] || 0}</strong>
                    <button data-wd="${d.id}" data-delta="1">+</button>
                  </div>
                </div>`,
                  )
                  .join('')}
              </div>`;
            })
            .join('')}
          <div class="actions" style="margin-top:14px;flex-wrap:wrap">
            <button class="btn" id="btn-wd-clear">Vaciar</button>
            <button class="btn" id="btn-wd-preset-small">Preset cambio</button>
            <button class="btn primary" id="btn-bank-withdraw" ${sum <= 0 ? 'disabled' : ''}>Retirar ${formatEuro(sum)}</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  const eurosToCents = (el) => Math.round((Number(el?.value) || 0) * 100);
  document.getElementById('btn-bank-deposit').onclick = () => {
    const ok = depositCashToBank(state, eurosToCents(document.getElementById('bank-deposit')));
    if (ok) sfx.cash();
    else sfx.error();
    showToast(state.ui.toast);
    needsFullRender = true;
    render();
  };
  app.querySelectorAll('[data-wd]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-wd');
      const delta = Number(btn.getAttribute('data-delta'));
      counts[id] = Math.max(0, (counts[id] || 0) + delta);
      sfx.click();
      needsFullRender = true;
      render();
    };
  });
  document.getElementById('btn-wd-clear').onclick = () => {
    state.ui.bankWithdrawCounts = emptyDrawer();
    sfx.click();
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-wd-preset-small').onclick = () => {
    state.ui.bankWithdrawCounts = {
      ...emptyDrawer(),
      b5: 10,
      b10: 5,
      b20: 3,
      e2: 10,
      e1: 10,
      c50: 10,
      c20: 10,
      c10: 10,
    };
    sfx.click();
    needsFullRender = true;
    render();
  };
  document.getElementById('btn-bank-withdraw').onclick = () => {
    const amt = countTotalCents(state.ui.bankWithdrawCounts);
    const ok = withdrawBankToCash(state, amt, state.ui.bankWithdrawCounts);
    if (ok) {
      sfx.cash();
      state.ui.bankWithdrawCounts = emptyDrawer();
    } else sfx.error();
    showToast(state.ui.toast);
    needsFullRender = true;
    render();
  };
}

function renderSettings() {
  const s = state.settings || {};
  const font = s.fontScale || 1;
  const speed = s.defaultSpeed ?? 1;
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Ajustes</h2>
          <p class="muted">Preferencias de Miriam · v${GAME_VERSION}</p>
          <div style="display:flex;flex-direction:column;gap:14px;margin-top:12px;max-width:420px">
            <label>Tema<br/>
              <select id="set-theme" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:100%">
                <option value="light" ${s.theme !== 'dark' ? 'selected' : ''}>Claro</option>
                <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
              </select>
            </label>
            <label style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" id="set-music" ${s.music !== false ? 'checked' : ''} /> Música
            </label>
            <label>Volumen música<br/>
              <input id="set-music-vol" type="range" min="0" max="1" step="0.05" value="${s.musicVolume ?? 0.45}" style="width:100%" />
            </label>
            <label style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" id="set-sfx" ${s.sfx !== false ? 'checked' : ''} /> Efectos de sonido
            </label>
            <label>Volumen SFX<br/>
              <input id="set-sfx-vol" type="range" min="0" max="1" step="0.05" value="${s.sfxVolume ?? 0.7}" style="width:100%" />
            </label>
            <label>Tamaño de letra<br/>
              <select id="set-font" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:100%">
                <option value="0.9" ${font === 0.9 ? 'selected' : ''}>Pequeño (0.9)</option>
                <option value="1" ${font === 1 ? 'selected' : ''}>Normal (1)</option>
                <option value="1.1" ${font === 1.1 ? 'selected' : ''}>Grande (1.1)</option>
                <option value="1.2" ${font === 1.2 ? 'selected' : ''}>Muy grande (1.2)</option>
              </select>
            </label>
            <label>Velocidad por defecto<br/>
              <select id="set-speed" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:100%">
                <option value="1" ${speed === 1 ? 'selected' : ''}>Normal</option>
                <option value="15" ${speed === 15 ? 'selected' : ''}>Rápido</option>
                <option value="60" ${speed === 60 ? 'selected' : ''}>Muy rápido</option>
              </select>
            </label>
            <label>Autoguardado (minutos)<br/>
              <input id="set-autosave" type="number" min="1" max="30" value="${s.autosaveMinutes || 2}" style="padding:8px;border-radius:10px;border:1px solid var(--line);width:100%" />
            </label>
            <button class="btn primary" id="btn-settings-save">Aplicar</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-settings-save').onclick = () => {
    state.settings = state.settings || {};
    state.settings.theme = document.getElementById('set-theme').value === 'dark' ? 'dark' : 'light';
    state.settings.music = document.getElementById('set-music').checked;
    state.settings.sfx = document.getElementById('set-sfx').checked;
    state.settings.musicVolume = Number(document.getElementById('set-music-vol').value);
    state.settings.sfxVolume = Number(document.getElementById('set-sfx-vol').value);
    state.settings.fontScale = Number(document.getElementById('set-font').value) || 1;
    state.settings.defaultSpeed = Number(document.getElementById('set-speed').value) || 1;
    state.settings.autosaveMinutes = Math.max(1, Math.min(30, Number(document.getElementById('set-autosave').value) || 2));
    setMusicEnabled(!!state.settings.music);
    setSfxEnabled(!!state.settings.sfx);
    setMusicVolume(state.settings.musicVolume);
    setSfxVolume(state.settings.sfxVolume);
    if (state.settings.music) startMusic();
    applyTheme();
    sfx.success();
    showToast('Ajustes aplicados');
    needsFullRender = true;
    render();
  };
}

function renderMonthly() {
  const st = currentMonthStatement(state);
  app.innerHTML = `
    <div class="shell">
      ${topbarHTML()}
      <div class="layout" style="grid-template-columns:280px 1fr">
        ${sideNav()}
        <section class="panel">
          <h2>Liquidación mensual</h2>
          <p class="muted">${escapeHtml(st.label)}</p>
          <p class="muted">Remesa = ventas − comisión. Los faltantes de arqueo restan del neto del mes.</p>
          <div class="close-summary">
            <div class="stat-row"><span>Ventas totales</span><strong>${formatEuro(st.totalSales)}</strong></div>
            <div class="stat-row"><span>Comisiones</span><strong>${formatEuro(st.totalCommission)}</strong></div>
            <div class="stat-row"><span>Premios pagados</span><strong>${formatEuro(st.totalPrizes)}</strong></div>
            <div class="stat-row"><span>Gastos local</span><strong>${formatEuro(st.expenses)}</strong></div>
            <div class="stat-row"><span>Proveedor</span><strong>${formatEuro(st.supplier)}</strong></div>
            <div class="stat-row"><span>Faltantes</span><strong>${formatEuro(st.shortage)}</strong></div>
            <div class="stat-row"><span>Sobrantes</span><strong>${formatEuro(st.surplus || 0)}</strong></div>
            <div class="stat-row"><span>Neto mes*</span><strong>${formatEuro(st.netMonth ?? st.totalCommission - st.expenses - st.shortage)}</strong></div>
          </div>
          <p class="muted">*Comisiones − gastos − faltantes</p>
          <h3 style="margin-top:16px">Por organización</h3>
          ${['LAE', 'ONCE', 'Otros']
            .map((org) => {
              const o = st.orgs[org];
              return `<div class="close-summary" style="margin-top:8px">
                <strong>${org}</strong>
                <div class="stat-row"><span>Ventas</span><strong>${formatEuro(o.sales)}</strong></div>
                <div class="stat-row"><span>Comisión retenida</span><strong>${formatEuro(o.commission)}</strong></div>
                <div class="stat-row"><span>Remesa (ventas−com.)</span><strong>${formatEuro(o.remittance)}</strong></div>
                <div class="stat-row"><span>Premios</span><strong>${formatEuro(o.prizes)}</strong></div>
              </div>`;
            })
            .join('')}
          <div class="actions" style="margin-top:16px">
            <button class="btn primary" id="btn-monthly-pdf">Descargar PDF</button>
          </div>
        </section>
      </div>
    </div>
    ${toastHTML()}
  `;
  bindTopbar();
  bindNav();
  document.getElementById('btn-monthly-pdf').onclick = () => {
    downloadMonthlyPdf(st);
    sfx.success();
    showToast('PDF de liquidación mensual descargado');
  };
}

let globalKeysBound = false;
function ensureGlobalShortcuts() {
  if (globalKeysBound) return;
  globalKeysBound = true;
  document.addEventListener('keydown', (e) => {
    if (!state || state.ui.screen === 'menu') return;
    const tag = (e.target?.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
    if (typing) return;
    if (state.ui.screen === 'tpv') return; // leave F-keys / Enter / Esc to TPV handler
    const key = e.key?.toLowerCase?.() || '';
    if (key === 'n') {
      const client = state.customers.current;
      if (!client) return;
      e.preventDefault();
      if (client.intent === 'pena_day') sfx.pena();
      else sfx.tpv();
      openTpv(state, client);
      needsFullRender = true;
      render();
      return;
    }
    if (key === 'a') {
      e.preventDefault();
      sfx.click();
      startArqueo(state, 'midday');
      needsFullRender = true;
      render();
      return;
    }
    if (key === 'c') {
      e.preventDefault();
      if (!confirmImportant('¿Ir a cierre y balance del día?')) return;
      state.ui.screen = 'close';
      sfx.click();
      needsFullRender = true;
      render();
    }
  });
}


// Boot
state = null;
ensureGlobalShortcuts();
renderMenu();
requestAnimationFrame(loop);
window.__loterias = () => state;
