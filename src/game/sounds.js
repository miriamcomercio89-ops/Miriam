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
  drawer: () => {
    beep({ freq: 180, dur: 0.12, type: 'triangle', gain: 0.05, slideTo: 90 });
    setTimeout(() => beep({ freq: 320, dur: 0.05, type: 'sine', gain: 0.02 }), 80);
  },
  ticket: () => {
    beep({ freq: 1500, dur: 0.04, type: 'square', gain: 0.02 });
    setTimeout(() => beep({ freq: 1200, dur: 0.04, type: 'square', gain: 0.02 }), 50);
    setTimeout(() => beep({ freq: 1900, dur: 0.03, type: 'square', gain: 0.015 }), 100);
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
  scratch: () => {
    beep({ freq: 320, dur: 0.05, type: 'sawtooth', gain: 0.03 });
    setTimeout(() => beep({ freq: 480, dur: 0.05, type: 'sawtooth', gain: 0.025 }), 60);
    setTimeout(() => beep({ freq: 260, dur: 0.08, type: 'triangle', gain: 0.03 }), 120);
    setTimeout(() => beep({ freq: 520, dur: 0.06, type: 'square', gain: 0.02 }), 200);
  },
  pena: () => {
    beep({ freq: 392, dur: 0.1, type: 'triangle', gain: 0.04 });
    setTimeout(() => beep({ freq: 494, dur: 0.1, type: 'triangle', gain: 0.035 }), 110);
    setTimeout(() => beep({ freq: 587, dur: 0.14, type: 'sine', gain: 0.04 }), 220);
  },
  jackpot: () => {
    beep({ freq: 523, dur: 0.1, type: 'sine', gain: 0.05 });
    setTimeout(() => beep({ freq: 659, dur: 0.1, type: 'sine', gain: 0.05 }), 100);
    setTimeout(() => beep({ freq: 784, dur: 0.1, type: 'sine', gain: 0.05 }), 200);
    setTimeout(() => beep({ freq: 1046, dur: 0.22, type: 'triangle', gain: 0.045 }), 320);
  },
  alert: () => {
    beep({ freq: 880, dur: 0.08, type: 'square', gain: 0.035 });
    setTimeout(() => beep({ freq: 660, dur: 0.12, type: 'square', gain: 0.03 }), 100);
  },
  /** Timbre de puerta / cliente entra */
  door: () => {
    beep({ freq: 740, dur: 0.09, type: 'triangle', gain: 0.045 });
    setTimeout(() => beep({ freq: 980, dur: 0.12, type: 'triangle', gain: 0.04 }), 90);
    setTimeout(() => beep({ freq: 620, dur: 0.08, type: 'sine', gain: 0.03 }), 200);
  },
  /** Impresora térmica de tickets */
  printer: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(
        () => beep({ freq: 1800 + i * 40, dur: 0.03, type: 'square', gain: 0.018 }),
        i * 35,
      );
    }
    setTimeout(() => beep({ freq: 240, dur: 0.08, type: 'triangle', gain: 0.035, slideTo: 160 }), 200);
  },
  /** Cajón que se abre con más cuerpo */
  drawerOpen: () => {
    beep({ freq: 160, dur: 0.14, type: 'triangle', gain: 0.055, slideTo: 70 });
    setTimeout(() => beep({ freq: 420, dur: 0.05, type: 'sine', gain: 0.025 }), 90);
  },
  /** Fallo de cobro electrónico */
  deny: () => {
    beep({ freq: 180, dur: 0.12, type: 'sawtooth', gain: 0.035 });
    setTimeout(() => beep({ freq: 140, dur: 0.16, type: 'sawtooth', gain: 0.03 }), 110);
  },
  /** Stock / aviso oficina */
  notice: () => {
    beep({ freq: 660, dur: 0.06, type: 'sine', gain: 0.03 });
    setTimeout(() => beep({ freq: 880, dur: 0.08, type: 'sine', gain: 0.028 }), 70);
  },
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
