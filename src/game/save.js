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

export function saveToSlot(state, slot) {
  state.meta.updatedAt = new Date().toISOString();
  state.version = SAVE_VERSION;
  localStorage.setItem(slotKey(slot), JSON.stringify(state));
  state.ui.toast = `Partida guardada en hueco ${slot}`;
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

export function exportGame(state) {
  const payload = {
    ...state,
    meta: { ...state.meta, exportedAt: new Date().toISOString() },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ymd = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `loterias-alora-${ymd}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
