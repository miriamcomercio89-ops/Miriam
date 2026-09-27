let ctx = null;
let muted = false;
let ambient = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(v) {
  muted = v;
  if (muted && ambient) {
    ambient.stop();
    ambient = null;
  }
}

export function isMuted() {
  return muted;
}

function beep(freq, dur, type = "sine", gain = 0.05) {
  if (muted || typeof window === "undefined") return;
  try {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  } catch {
    /* ignore */
  }
}

export function sfx(name) {
  if (name === "place") beep(420, 0.06, "triangle", 0.04);
  else if (name === "remove") beep(220, 0.08, "square", 0.03);
  else if (name === "error") beep(140, 0.12, "sawtooth", 0.04);
  else if (name === "order") {
    beep(523, 0.08, "sine", 0.05);
    setTimeout(() => beep(659, 0.1, "sine", 0.05), 80);
  } else if (name === "fail") beep(110, 0.2, "sawtooth", 0.05);
  else if (name === "click") beep(600, 0.04, "sine", 0.03);
  else if (name === "copy") beep(880, 0.05, "triangle", 0.04);
}

export function pulseAmbient(eraCount) {
  if (muted || typeof window === "undefined") return;
  try {
    const a = ac();
    if (ambient) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.value = 90 + eraCount * 8;
    g.gain.value = 0.012;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    ambient = o;
  } catch {
    /* ignore */
  }
}
