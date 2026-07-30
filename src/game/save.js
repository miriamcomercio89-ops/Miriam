import { createNewGame, SAVE_VERSION, SLOT_COUNT, STORAGE_PREFIX, migrateState } from './state.js';

export function slotKey(slot) {
  return `${STORAGE_PREFIX}${slot}`;
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
      });
    } catch {
      slots.push({ slot: i, empty: true, corrupt: true });
    }
  }
  return slots;
}

export function saveToSlot(state, slot, { silent = false } = {}) {
  state.meta.updatedAt = new Date().toISOString();
  state.version = SAVE_VERSION;
  localStorage.setItem(slotKey(slot), JSON.stringify(state));
  state.ui = state.ui || {};
  state.ui.lastAutosaveAt = Date.now();
  state.ui.lastAutosaveSlot = slot;
  if (!silent) state.ui.toast = `Partida guardada en hueco ${slot}`;
  return state;
}

export function loadFromSlot(slot) {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) return null;
  const data = migrateState(JSON.parse(raw));
  data.clock.lastRealMs = Date.now();
  data.ui = data.ui || { screen: 'counter', toast: null, paymentSession: null };
  data.ui.paymentSession = null;
  data.ui.screen = 'counter';
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
  const payload = {
    ...state,
    meta: { ...state.meta, exportedAt: new Date().toISOString() },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const ymd = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `loterias-alora-${ymd}.json`);
}

/**
 * Paquete del día: JSON de partida + PDF de cierre (si hay resumen).
 * Dos descargas seguidas (sin dependencia de ZIP).
 */
export async function exportDayPackage(state, { downloadDayClosePdf } = {}) {
  const summary = state.ui?.lastCloseSummary;
  const ymd = summary?.date || new Date(state.clock?.gameTimeMs || Date.now()).toISOString().slice(0, 10);
  const payload = {
    ...state,
    meta: {
      ...state.meta,
      exportedAt: new Date().toISOString(),
      dayPackage: ymd,
    },
    dayPackage: {
      closeSummary: summary || null,
      exportedAt: new Date().toISOString(),
    },
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
    ? `Paquete del día ${ymd}: partida + PDF de cierre`
    : `Paquete del día ${ymd}: partida (sin cierre reciente)`;
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
        data.ui.paymentSession = null;
        data.ui.screen = 'counter';
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
