/** Guardado / carga localStorage */
window.IM = window.IM || {};

IM.Save = {
  save(state, key) {
    try {
      const payload = JSON.stringify(state);
      localStorage.setItem(key || IM_CONFIG.saveKey, payload);
      return true;
    } catch (e) {
      console.error('Save failed', e);
      return false;
    }
  },

  autosave(state) {
    try {
      localStorage.setItem(IM_CONFIG.saveKey + '_auto', JSON.stringify(state));
      localStorage.setItem(IM_CONFIG.saveKey, JSON.stringify(state));
    } catch (e) {
      /* quota */
    }
  },

  load(key) {
    try {
      const raw = localStorage.getItem(key || IM_CONFIG.saveKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  exportJson(state) {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `industry-manager-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  clear() {
    localStorage.removeItem(IM_CONFIG.saveKey);
    localStorage.removeItem(IM_CONFIG.saveKey + '_auto');
    localStorage.removeItem('industry_manager_save_v1');
    localStorage.removeItem('industry_manager_save_v1_auto');
    localStorage.removeItem('industry_manager_save_v2');
    localStorage.removeItem('industry_manager_save_v2_auto');
    localStorage.removeItem('industry_manager_save_v3');
    localStorage.removeItem('industry_manager_save_v3_auto');
    localStorage.removeItem('industry_manager_save_v4');
    localStorage.removeItem('industry_manager_save_v4_auto');
    localStorage.removeItem('industry_manager_save_v5');
    localStorage.removeItem('industry_manager_save_v5_auto');
  },
};
