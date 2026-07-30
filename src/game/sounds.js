/** Sonidos simples con Web Audio (sin archivos externos) */

let ctx;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep({ freq = 880, dur = 0.08, type = 'sine', gain = 0.04, slideTo } = {}) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    g.gain.value = gain;
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
  cash: () => {
    beep({ freq: 880, dur: 0.07, type: 'sine', gain: 0.04 });
    setTimeout(() => beep({ freq: 1175, dur: 0.09, type: 'sine', gain: 0.035 }), 70);
  },
  error: () => beep({ freq: 200, dur: 0.15, type: 'sawtooth', gain: 0.03 }),
  success: () => {
    beep({ freq: 523, dur: 0.08 });
    setTimeout(() => beep({ freq: 659, dur: 0.08 }), 80);
    setTimeout(() => beep({ freq: 784, dur: 0.12 }), 160);
  },
  open: () => beep({ freq: 400, dur: 0.2, type: 'triangle', gain: 0.04, slideTo: 800 }),
};
