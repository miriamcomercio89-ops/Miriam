/** Soft UI sounds via Web Audio — no asset files required */
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.04, when = 0) {
  const audio = ac()
  if (!audio) return
  const t0 = audio.currentTime + when
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playBuildSound(enabled: boolean) {
  if (!enabled) return
  void ac()?.resume()
  tone(392, 0.08, 'triangle', 0.05)
  tone(523, 0.12, 'triangle', 0.045, 0.07)
  tone(659, 0.16, 'sine', 0.035, 0.14)
}

export function playDaySound(enabled: boolean) {
  if (!enabled) return
  void ac()?.resume()
  tone(220, 0.1, 'sine', 0.03)
  tone(330, 0.12, 'sine', 0.025, 0.08)
}

export function playClickSound(enabled: boolean) {
  if (!enabled) return
  void ac()?.resume()
  tone(480, 0.04, 'square', 0.02)
}

export function playSellSound(enabled: boolean) {
  if (!enabled) return
  void ac()?.resume()
  tone(523, 0.07, 'triangle', 0.04)
  tone(392, 0.1, 'sine', 0.035, 0.06)
  tone(311, 0.14, 'sine', 0.03, 0.12)
}

export function playAmbienceTick(enabled: boolean) {
  if (!enabled) return
  void ac()?.resume()
  tone(180 + Math.random() * 40, 0.35, 'sine', 0.008)
}
