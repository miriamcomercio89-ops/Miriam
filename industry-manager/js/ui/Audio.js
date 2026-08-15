/** Ambience procedural por zona (Web Audio) — sin archivos externos */
window.IM = window.IM || {};

IM.Audio = {
  ctx: null,
  master: null,
  nodes: [],
  enabled: true,
  volume: 0.18,
  currentZone: null,

  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    return true;
  },

  setEnabled(on) {
    this.enabled = !!on;
    if (!on) this.stop();
    else if (this.currentZone) this.playZone(this.currentZone);
  },

  setVolume(v) {
    this.volume = IM.clamp(Number(v) || 0, 0, 0.5);
    if (this.master) this.master.gain.value = this.volume;
  },

  stop() {
    this.nodes.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch (e) {
        /* ignore */
      }
    });
    this.nodes = [];
  },

  /** zone: almazara | fundicion | puerto | electronica | campo | oficina */
  playZone(zone) {
    this.currentZone = zone;
    if (!this.enabled) return;
    if (!this.ensure()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.stop();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const tone = (freq, type, gainVal, lfoHz) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gainVal;
      if (lfoHz) {
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        lfo.frequency.value = lfoHz;
        lg.gain.value = freq * 0.01;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        lfo.start(now);
        this.nodes.push(lfo);
      }
      osc.connect(g);
      g.connect(this.master);
      osc.start(now);
      this.nodes.push(osc, g);
    };

    const noise = (gainVal, filterFreq) => {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      const g = ctx.createGain();
      g.gain.value = gainVal;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      src.start(now);
      this.nodes.push(src, filter, g);
    };

    if (zone === 'almazara' || zone === 'campo') {
      tone(110, 'sine', 0.04, 0.08);
      tone(164.5, 'triangle', 0.025, 0.05);
      noise(0.015, 800);
    } else if (zone === 'fundicion') {
      tone(55, 'sawtooth', 0.03, 0.2);
      tone(82, 'square', 0.012, 0.35);
      noise(0.04, 1200);
    } else if (zone === 'puerto') {
      tone(98, 'sine', 0.03, 0.04);
      noise(0.035, 600);
      tone(196, 'triangle', 0.015, 0.12);
    } else if (zone === 'electronica') {
      tone(220, 'square', 0.018, 1.5);
      tone(330, 'sine', 0.02, 0.7);
      noise(0.01, 3000);
    } else {
      tone(130, 'sine', 0.028, 0.1);
      tone(195, 'triangle', 0.015, 0.06);
    }
  },

  zoneFromLocation(loc, site) {
    if (!loc) return 'oficina';
    if (loc.hasPort || loc.zone === 'puerto' || loc.zone === 'costa') return 'puerto';
    const buildings = site?.buildings || [];
    if (buildings.some((b) => ['fundicion', 'laminacion', 'mina'].includes(b.type))) return 'fundicion';
    if (buildings.some((b) => ['electronica'].includes(b.type))) return 'electronica';
    if (buildings.some((b) => ['almazara', 'granja', 'molino_harinero'].includes(b.type))) return 'almazara';
    if (loc.specialization === 'agro') return 'campo';
    return 'oficina';
  },
};
