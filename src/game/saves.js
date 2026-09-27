export const SAVE_SLOTS = [
  { id: "periodica-slot-a", label: "Ranura A" },
  { id: "periodica-slot-b", label: "Ranura B" },
  { id: "periodica-slot-c", label: "Ranura C" },
  { id: "periodica-save-v4", label: "Autoguardado" },
];

export const ACTIVE_SLOT_KEY = "periodica-active-slot";
export const AUTOSAVE_KEY = "periodica-save-v4";
export const LEGACY_KEY = "periodica-save-v3";

export function resolveSaveKey() {
  const active = typeof localStorage !== "undefined" ? localStorage.getItem(ACTIVE_SLOT_KEY) : null;
  if (active && localStorage.getItem(active)) return active;
  if (typeof localStorage === "undefined") return AUTOSAVE_KEY;
  if (localStorage.getItem(AUTOSAVE_KEY)) return AUTOSAVE_KEY;
  if (localStorage.getItem(LEGACY_KEY)) return LEGACY_KEY;
  return AUTOSAVE_KEY;
}

export function listSaves() {
  if (typeof localStorage === "undefined") {
    return SAVE_SLOTS.map((s) => ({ ...s, empty: true }));
  }
  return SAVE_SLOTS.map((s) => {
    const raw = localStorage.getItem(s.id);
    if (!raw) return { ...s, empty: true };
    try {
      const d = JSON.parse(raw);
      return {
        ...s,
        empty: false,
        tick: d.tick ?? 0,
        rep: d.reputation ?? 50,
        orders: d.ordersCompleted ?? 0,
        seed: d.seed,
      };
    } catch {
      return { ...s, empty: true, corrupt: true };
    }
  });
}

export function writeSave(slotId, json) {
  localStorage.setItem(slotId, json);
  localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
}

export function clearSave(slotId) {
  localStorage.removeItem(slotId);
}
