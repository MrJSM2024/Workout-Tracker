let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function tone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.15, freqEnd, delay = 0 }) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)
    osc.type = type
    const t = c.currentTime + delay
    osc.frequency.setValueAtTime(freq, t)
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  } catch {}
}

export function playMoveSound() {
  tone({ freq: 700, freqEnd: 350, duration: 0.12, gain: 0.12 })
}

export function playCaptureSound() {
  tone({ freq: 500, type: 'square', duration: 0.08, gain: 0.1 })
  tone({ freq: 300, type: 'square', duration: 0.08, gain: 0.1, delay: 0.07 })
}

export function playCheckSound() {
  tone({ freq: 250, type: 'sawtooth', freqEnd: 900, duration: 0.25, gain: 0.18 })
}

export function playGameEndSound(won) {
  const notes = won ? [261, 329, 392, 523] : [523, 392, 329, 220]
  notes.forEach((freq, i) => {
    tone({ freq, duration: 0.28, gain: 0.14, delay: i * 0.14 })
  })
}
