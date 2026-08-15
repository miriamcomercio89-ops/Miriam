/** Ambience + DJ procedural por bioma (Web Audio) — sin archivos externos */
window.IM = window.IM || {};

IM.Audio = {
  ctx: null,
  master: null,
  nodes: [],
  enabled: true,
  volume: 0.18,
  currentZone: null,
  seed: 1,

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

  reshuffle(dj) {
    this.seed = (Date.now() ^ Math.floor((dj?.variety || 0.5) * 9999)) >>> 0;
  },

  applyDj(dj, city) {
    if (!dj) return;
    this.setVolume(dj.volume ?? 0.2);
    this.setEnabled(dj.enabled !== false);
    let zone = dj.biome || 'auto';
    if (zone === 'auto') zone = this.biomeFromCity(city);
    if (zone === 'malaga') zone = 'almazara';
    this._intensity = dj.intensity ?? 0.55;
    this._variety = dj.variety ?? 0.8;
    this.playZone(zone);
  },

  biomeFromCity(city) {
    if (!city) return 'oficina';
    const lat = city.lat || 36.7;
    const name = (city.name || '').toLowerCase();
    if (name.includes('málaga') || name.includes('malaga')) return 'almazara';
    if (city.hasPort || /puerto|costa|vigo|rotterdam|shanghai|singapur/.test(name)) return 'puerto';
    if (lat > 50) return 'noche';
    if (lat < 20) return 'campo';
    return 'oficina';
  },

  setBiomeFromState(state, city) {
    if (state?.dj) this.applyDj(state.dj, city);
  },

  playZone(zone) {
    this.currentZone = zone;
    if (!this.enabled) return;
    if (!this.ensure()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.stop();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const inten = this._intensity ?? 0.55;
    const varY = this._variety ?? 0.8;
    const rnd = IM.mulberry32 ? IM.mulberry32(this.seed + zone.length * 13) : Math.random;

    const tone = (freq, type, gainVal, lfoHz) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      const detune = (rnd() - 0.5) * 40 * varY;
      osc.frequency.value = freq * (1 + detune / 1000);
      g.gain.value = gainVal * inten;
      if (lfoHz) {
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        lfo.frequency.value = lfoHz * (0.7 + rnd() * 0.6);
        lg.gain.value = freq * 0.01 * varY;
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
      g.gain.value = gainVal * inten;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      src.start(now);
      this.nodes.push(src, filter, g);
    };

    const pulse = (freq, rate) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.value = 0.012 * inten;
      lfo.frequency.value = rate;
      lg.gain.value = 0.01 * inten;
      lfo.connect(lg);
      lg.connect(g.gain);
      osc.connect(g);
      g.connect(this.master);
      osc.start(now);
      lfo.start(now);
      this.nodes.push(osc, g, lfo, lg);
    };

    if (zone === 'almazara' || zone === 'campo') {
      tone(110, 'sine', 0.04, 0.08);
      tone(164.5, 'triangle', 0.025, 0.05);
      tone(220 + rnd() * 40, 'sine', 0.012, 0.2);
      noise(0.015, 800);
      if (varY > 0.5) pulse(330, 0.25);
    } else if (zone === 'fundicion') {
      tone(55, 'sawtooth', 0.03, 0.2);
      tone(82, 'square', 0.012, 0.35);
      tone(41, 'sawtooth', 0.02, 0.1);
      noise(0.04, 1200);
    } else if (zone === 'puerto') {
      tone(98, 'sine', 0.03, 0.04);
      noise(0.035, 600);
      tone(196, 'triangle', 0.015, 0.12);
      if (varY > 0.4) tone(146, 'sine', 0.01, 0.07);
    } else if (zone === 'electronica') {
      tone(220, 'square', 0.018, 1.5);
      tone(330, 'sine', 0.02, 0.7);
      tone(440 + rnd() * 80, 'square', 0.008, 2.2);
      noise(0.01, 3000);
      pulse(110, 1.8);
    } else if (zone === 'noche') {
      tone(65, 'sine', 0.035, 0.03);
      tone(98, 'triangle', 0.02, 0.05);
      noise(0.008, 400);
    } else if (zone === 'tormenta') {
      noise(0.05, 900);
      tone(48, 'sawtooth', 0.02, 0.4);
      pulse(80, 0.15);
    } else {
      tone(130, 'sine', 0.028, 0.1);
      tone(195, 'triangle', 0.015, 0.06);
      if (varY > 0.6) tone(260, 'sine', 0.01, 0.15);
    }
  },

  zoneFromLocation(loc, site) {
    if (!loc) return 'oficina';
    if (loc.hasPort || loc.zone === 'puerto' || loc.zone === 'costa') return 'puerto';
    const buildings = site?.buildings || [];
    if (buildings.some((b) => ['fundicion', 'laminacion', 'mina'].includes(b.type) || (b.type || '').includes('fundicion'))) return 'fundicion';
    if (buildings.some((b) => ['electronica'].includes(b.type) || (b.type || '').includes('fab_'))) return 'electronica';
    if (buildings.some((b) => ['almazara', 'granja', 'molino_harinero'].includes(b.type) || (b.type || '').includes('almazara'))) return 'almazara';
    if (loc.specialization === 'agro') return 'campo';
    return 'oficina';
  },
};
