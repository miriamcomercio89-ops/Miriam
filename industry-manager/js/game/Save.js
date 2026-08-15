window.IM = window.IM || {};

IM.Save = {
  save(state) {
    try {
      localStorage.setItem(IM_CONFIG.saveKey, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(IM_CONFIG.saveKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  autosave(state) {
    this.save(state);
  },
  clear() {
    localStorage.removeItem(IM_CONFIG.saveKey);
  },
};
