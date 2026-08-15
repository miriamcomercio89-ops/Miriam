window.IM = window.IM || {};
IM.Audio = {
  ctx: null,
  enabled: false,
  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    return true;
  },
  setEnabled() {},
  playZone() {},
};
