// Lightweight Web Audio API synthesizer for game sounds.
// No asset loading, all sounds synthesized on demand.

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContext = new Ctx();
    } catch {
      return null;
    }
  }

  // Resume on user gesture (browsers block autoplay)
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

/**
 * Play a short synthesized tone.
 * @param frequency Hz (e.g. 440 = A4, higher = higher pitch)
 * @param duration seconds
 * @param type oscillator waveform
 * @param volume 0-1
 */
export function playTone(
  frequency: number,
  duration: number = 0.1,
  type: OscillatorType = "sine",
  volume: number = 0.06
): void {
  const ctx = getContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail — audio is non-critical
  }
}

/**
 * Play a rising chord sequence (e.g. for wave start).
 */
export function playChord(frequencies: number[], duration: number = 0.3): void {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, "sine", 0.04), i * 60);
  });
}
