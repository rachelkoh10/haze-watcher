/**
 * Polite synthesized Web Audio alerts for critical threshold alerts
 */

class AlertSoundService {
  private audioCtx: AudioContext | null = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playWarningChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      
      // Dual tone polite warning chime (A5 880Hz then F5 698Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(700, now + 0.25);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.45);

      // Second note
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now + 0.18); // D5
      gain2.gain.setValueAtTime(0.001, now + 0.18);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.18);
      osc2.stop(now + 0.7);
    } catch {
      // Audio autoplay may be constrained by browser policies until user interaction
    }
  }

  playCriticalHazeAlarm() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      [0, 0.22, 0.44].forEach((offset, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 1 ? 920 : 780, now + offset);

        gain.gain.setValueAtTime(0.01, now + offset);
        gain.gain.linearRampToValueAtTime(0.22, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {
      // Fail quietly
    }
  }
}

export const alertSoundService = new AlertSoundService();
