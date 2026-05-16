let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function scheduleNote(
  audioCtx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** Gentle 3-note chime — plays when a new job request arrives */
export function playNewJobChime() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    scheduleNote(c, 523.25, t + 0.00, 0.7, 0.25);
    scheduleNote(c, 659.25, t + 0.18, 0.7, 0.22);
    scheduleNote(c, 783.99, t + 0.36, 1.0, 0.28);
  } catch {}
}

/** Urgent two-tone beep — used for SOS alerts */
export function playAlertBeep() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    [0, 0.22, 0.44].forEach((offset) => {
      scheduleNote(c, 880, t + offset, 0.18, 0.2, "square");
      scheduleNote(c, 1100, t + offset + 0.1, 0.1, 0.15, "square");
    });
  } catch {}
}

/** Soft success tone — plays on booking completion */
export function playSuccessChime() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    scheduleNote(c, 659.25, t + 0.00, 0.5, 0.2);
    scheduleNote(c, 783.99, t + 0.15, 0.5, 0.2);
    scheduleNote(c, 1046.5, t + 0.30, 0.8, 0.25);
  } catch {}
}

/** Soft cancel tone */
export function playCancelTone() {
  try {
    const c = getCtx();
    const t = c.currentTime;
    scheduleNote(c, 440, t + 0.00, 0.4, 0.15);
    scheduleNote(c, 349.23, t + 0.20, 0.6, 0.12);
  } catch {}
}
