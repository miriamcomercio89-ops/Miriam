import { createNewGame, SAVE_VERSION, SLOT_COUNT, STORAGE_PREFIX, migrateState, GAME_VERSION } from './state.js';

export function slotKey(slot) {
  return `${STORAGE_PREFIX}${slot}`;
}

/** Clona profundo para no mutar referencias al serializar. */
function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

/** Snapshot completo: absolutamente todo el estado jugable. */
export function fullSavePayload(state, extraMeta = {}) {
  const payload = cloneState(state);
  payload.version = SAVE_VERSION;
  payload.gameVersion = GAME_VERSION;
  payload.meta = {
    ...(payload.meta || {}),
    updatedAt: new Date().toISOString(),
    ...extraMeta,
    complete: true,
    counts: {
      tickets: (payload.tickets || []).length,
      orders: (payload.orders || []).length,
      draws: Object.keys(payload.draws || {}).length,
      ledger: (payload.finance?.ledger || []).length,
      prizeManagement: (payload.prizeManagement || []).length,
      showcase: (payload.showcase || []).length,
      closeHistory: (payload.closeHistory || []).length,
      dayLog: (payload.dayLog || []).length,
      queue: (payload.customers?.queue || []).length,
      regulars: (payload.customers?.regulars || []).length,
    },
  };
  // Asegurar que UI en curso se incluye
  payload.ui = payload.ui || {};
  return payload;
}

export function listSlots() {
  const slots = [];
  for (let i = 1; i <= SLOT_COUNT; i++) {
    const raw = localStorage.getItem(slotKey(i));
    if (!raw) {
      slots.push({ slot: i, empty: true });
      continue;
    }
    try {
      const data = JSON.parse(raw);
      slots.push({
        slot: i,
        empty: false,
        meta: data.meta,
        gameTimeMs: data.clock?.gameTimeMs,
        bankCents: data.finance?.bankCents,
        daysPlayed: data.stats?.daysPlayed,
        gameVersion: data.gameVersion || '0.0',
        tickets: data.tickets?.length,
        complete: !!data.meta?.complete,
      });
    } catch {
      slots.push({ slot: i, empty: true, corrupt: true });
    }
  }
  return slots;
}

export function saveToSlot(state, slot, { silent = false } = {}) {
  const payload = fullSavePayload(state);
  payload.meta.activeSlot = slot;
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(payload));
  } catch (e) {
    state.ui = state.ui || {};
    state.ui.toast = 'No se pudo guardar (almacenamiento lleno). Exporta JSON.';
    throw e;
  }
  // Reflejar meta en estado vivo
  state.meta = { ...state.meta, ...payload.meta, activeSlot: slot };
  state.version = SAVE_VERSION;
  state.gameVersion = GAME_VERSION;
  state.ui = state.ui || {};
  state.ui.lastAutosaveAt = Date.now();
  state.ui.lastAutosaveSlot = slot;
  if (!silent) state.ui.toast = `Partida completa guardada en hueco ${slot}`;
  return state;
}

export function loadFromSlot(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) return null;
  const data = migrateState(JSON.parse(raw));
  data.clock.lastRealMs = Date.now();
  data.ui = data.ui || { screen: 'counter', toast: null };
  data.meta = data.meta || {};
  data.meta.activeSlot = slot;
  // Restaurar pantalla si era jugable; si no, mostrador
  const okScreens = new Set([
    'counter',
    'tpv',
    'cash',
    'stock',
    'showcase',
    'bank',
    'draws',
    'prize',
    'management',
    'close',
    'closes',
    'stats',
    'weekly',
    'monthly',
    'settings',
    'saves',
    'board',
    'fichas',
    'encyclopedia',
    'arqueo',
    'day-results',
  ]);
  if (!okScreens.has(data.ui.screen)) data.ui.screen = 'counter';
  // Si había TPV/caja a medias, se restauran tal cual (guardado absoluto)
  return data;
}

export function deleteSlot(slot) {
  localStorage.removeItem(slotKey(slot));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportGame(state) {
  const payload = fullSavePayload(state, { exportedAt: new Date().toISOString(), exportKind: 'full' });
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const ymd = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `loterias-alora-completa-${ymd}.json`);
  state.ui.toast = 'Exportación completa: absolutamente todo el estado';
}

/**
 * Paquete del día: JSON de partida completa + PDF de cierre (si hay resumen).
 */
export async function exportDayPackage(state, { downloadDayClosePdf } = {}) {
  const summary = state.ui?.lastCloseSummary;
  const ymd = summary?.date || new Date(state.clock?.gameTimeMs || Date.now()).toISOString().slice(0, 10);
  const payload = fullSavePayload(state, {
    exportedAt: new Date().toISOString(),
    dayPackage: ymd,
    exportKind: 'day-package',
  });
  payload.dayPackage = {
    closeSummary: summary || null,
    exportedAt: new Date().toISOString(),
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `paquete-dia-${ymd}.json`,
  );
  if (summary && typeof downloadDayClosePdf === 'function') {
    await new Promise((r) => setTimeout(r, 350));
    downloadDayClosePdf(summary);
  }
  state.ui.toast = summary
    ? `Paquete del día ${ymd}: partida completa + PDF de cierre`
    : `Paquete del día ${ymd}: partida completa (sin cierre reciente)`;
  return { ymd, hasPdf: !!summary };
}

export function importGame(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = migrateState(JSON.parse(reader.result));
        if (!data.clock || !data.finance) throw new Error('Archivo no válido');
        data.clock.lastRealMs = Date.now();
        data.ui = data.ui || {};
        // Restaurar pantalla guardada si existe
        if (!data.ui.screen) data.ui.screen = 'counter';
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function newGame() {
  return createNewGame();
}

/** Autosave periódico al hueco activo (o 1) */
export function maybeAutosave(state, lastAutosaveRealMs, intervalMs) {
  const mins = state.settings?.autosaveMinutes || 2;
  const wait = intervalMs ?? mins * 60 * 1000;
  const now = Date.now();
  if (now - lastAutosaveRealMs < wait) return lastAutosaveRealMs;
  const slot = state.meta?.activeSlot || 1;
  try {
    state.meta.activeSlot = slot;
    saveToSlot(state, slot, { silent: true });
  } catch {
    /* ignore */
  }
  return now;
}
