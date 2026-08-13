/** Sonidos suaves del TPV (Web Audio, sin archivos externos). */
(function (global) {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, at) {
    const c = ac();
    if (!c || !enabled) return;
    const t0 = c.currentTime + (at || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function beepOk() { tone(660, 0.09, "sine", 0.05); tone(880, 0.1, "sine", 0.04, 0.08); }
  function beepCoin() { tone(980, 0.06, "triangle", 0.035); tone(1200, 0.08, "triangle", 0.03, 0.05); }
  function beepCustomer() { tone(440, 0.12, "sine", 0.04); tone(554, 0.14, "sine", 0.035, 0.1); }
  function beepWarn() { tone(220, 0.18, "square", 0.025); }
  function beepPrint() { tone(300, 0.05, "sawtooth", 0.02); tone(300, 0.05, "sawtooth", 0.02, 0.08); tone(300, 0.05, "sawtooth", 0.02, 0.16); }
  function setEnabled(v) { enabled = !!v; }

  global.FarmaciaSounds = { beepOk, beepCoin, beepCustomer, beepWarn, beepPrint, setEnabled };
})(typeof window !== "undefined" ? window : globalThis);
