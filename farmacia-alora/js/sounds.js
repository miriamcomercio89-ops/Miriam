/** Sonidos distintos: cobro, alerta, receta, escáner, firma. */
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
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function beepOk() { tone(660, 0.08, "sine", 0.05); tone(880, 0.1, "sine", 0.04, 0.07); }
  function beepCoin() { tone(980, 0.05, "triangle", 0.03); tone(1240, 0.07, "triangle", 0.025, 0.05); }
  function beepCustomer() { tone(440, 0.1, "sine", 0.035); tone(554, 0.12, "sine", 0.03, 0.09); }
  function beepWarn() { tone(200, 0.16, "square", 0.02); tone(160, 0.14, "square", 0.018, 0.12); }
  function beepPrint() { tone(300, 0.04, "sawtooth", 0.015); tone(300, 0.04, "sawtooth", 0.015, 0.07); }
  function beepPay() { tone(523, 0.07, "sine", 0.045); tone(659, 0.07, "sine", 0.04, 0.07); tone(784, 0.12, "sine", 0.05, 0.14); }
  function beepAlert() { tone(880, 0.05, "square", 0.02); tone(440, 0.08, "square", 0.025, 0.06); tone(880, 0.05, "square", 0.02, 0.14); }
  function beepReceta() { tone(392, 0.1, "triangle", 0.035); tone(494, 0.1, "triangle", 0.03, 0.1); tone(587, 0.14, "triangle", 0.035, 0.2); }
  function beepScan() { tone(1400, 0.04, "square", 0.02); tone(1800, 0.06, "square", 0.018, 0.04); }
  function beepFirma() { tone(300, 0.2, "sine", 0.03); tone(340, 0.15, "sine", 0.025, 0.15); }
  function beepMiniOk() { tone(740, 0.06, "sine", 0.04); tone(990, 0.1, "sine", 0.035, 0.06); }
  function beepMiniFail() { tone(180, 0.2, "sawtooth", 0.02); }
  function setEnabled(v) { enabled = !!v; }

  global.FarmaciaSounds = {
    beepOk, beepCoin, beepCustomer, beepWarn, beepPrint,
    beepPay, beepAlert, beepReceta, beepScan, beepFirma, beepMiniOk, beepMiniFail, setEnabled,
  };
})(typeof window !== "undefined" ? window : globalThis);
