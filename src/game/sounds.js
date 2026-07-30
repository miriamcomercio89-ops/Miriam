/** Sonidos + música de fondo (Web Audio, sin archivos) */

let ctx;
let musicNodes = null;
let musicOn = true;
let sfxOn = true;
let musicVol = 0.45;
let sfxVol = 0.7;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep({ freq = 880, dur = 0.08, type = 'sine', gain = 0.04, slideTo } = {}) {
  if (!sfxOn) return;
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), c.currentTime + dur);
    g.gain.value = gain * sfxVol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => beep({ freq: 620, dur: 0.04, type: 'triangle', gain: 0.03 }),
  scan: () => beep({ freq: 1400, dur: 0.06, type: 'square', gain: 0.025 }),
  tpv: () => beep({ freq: 980, dur: 0.05, type: 'square', gain: 0.03 }),
  cash: () => {
    beep({ freq: 880, dur: 0.07, type: 'sine', gain: 0.04 });
    setTimeout(() => beep({ freq: 1175, dur: 0.09, type: 'sine', gain: 0.035 }), 70);
  },
  drawer: () => beep({ freq: 180, dur: 0.12, type: 'triangle', gain: 0.05, slideTo: 90 }),
  ticket: () => {
    beep({ freq: 1500, dur: 0.04, type: 'square', gain: 0.02 });
    setTimeout(() => beep({ freq: 1200, dur: 0.04, type: 'square', gain: 0.02 }), 50);
  },
  draw: () => {
    beep({ freq: 440, dur: 0.1 });
    setTimeout(() => beep({ freq: 554, dur: 0.1 }), 100);
    setTimeout(() => beep({ freq: 659, dur: 0.16 }), 200);
  },
  error: () => beep({ freq: 200, dur: 0.15, type: 'sawtooth', gain: 0.03 }),
  success: () => {
    beep({ freq: 523, dur: 0.08 });
    setTimeout(() => beep({ freq: 659, dur: 0.08 }), 80);
    setTimeout(() => beep({ freq: 784, dur: 0.12 }), 160);
  },
  open: () => beep({ freq: 400, dur: 0.2, type: 'triangle', gain: 0.04, slideTo: 800 }),
};

export function startMusic() {
  if (!musicOn || musicNodes) return;
  try {
    const c = ac();
    const master = c.createGain();
    master.gain.value = 0.035 * musicVol;
    master.connect(c.destination);
    const notes = [196, 247, 294, 330, 294, 247];
    const oscs = notes.map((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(master);
      o.start();
      const pulse = () => {
        if (!musicNodes) return;
        const t = c.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.4);
        g.gain.linearRampToValueAtTime(0, t + 2.2);
        setTimeout(pulse, 2200 + i * 180);
      };
      setTimeout(pulse, i * 400);
      return { o, g };
    });
    musicNodes = { master, oscs };
  } catch {
    /* ignore */
  }
}

export function stopMusic() {
  if (!musicNodes) return;
  try {
    musicNodes.oscs.forEach(({ o }) => o.stop());
  } catch {
    /* ignore */
  }
  musicNodes = null;
}

export function setMusicEnabled(on) {
  musicOn = on;
  if (on) startMusic();
  else stopMusic();
}

export function setSfxEnabled(on) {
  sfxOn = on;
}

export function setMusicVolume(v) {
  musicVol = Math.max(0, Math.min(1, Number(v) || 0));
  if (musicNodes?.master) musicNodes.master.gain.value = 0.035 * musicVol;
}

export function setSfxVolume(v) {
  sfxVol = Math.max(0, Math.min(1, Number(v) || 0));
}

export function isMusicEnabled() {
  return musicOn;
}
