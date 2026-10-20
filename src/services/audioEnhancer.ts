class AudioEnhancerService {
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private speechFilterNode: BiquadFilterNode | null = null;
  private isAttached = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  attachToVideo(videoEl: HTMLVideoElement) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (!this.isAttached) {
        this.sourceNode = this.audioCtx.createMediaElementSource(videoEl);
        this.gainNode = this.audioCtx.createGain();
        this.compressorNode = this.audioCtx.createDynamicsCompressor();
        this.speechFilterNode = this.audioCtx.createBiquadFilter();

        // Speech clarity frequency boost around 2.5kHz
        this.speechFilterNode.type = 'peaking';
        this.speechFilterNode.frequency.value = 2500;
        this.speechFilterNode.Q.value = 1.2;
        this.speechFilterNode.gain.value = 0; // default flat

        // Dynamic range compressor for Night Mode
        this.compressorNode.threshold.value = -24;
        this.compressorNode.knee.value = 12;
        this.compressorNode.ratio.value = 6;
        this.compressorNode.attack.value = 0.003;
        this.compressorNode.release.value = 0.25;

        // Chain: Source -> SpeechFilter -> Compressor -> Gain -> Destination
        this.sourceNode.connect(this.speechFilterNode);
        this.speechFilterNode.connect(this.compressorNode);
        this.compressorNode.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        this.isAttached = true;
      }
    } catch {
      // AudioContext already attached or cross-origin restrictions
    }
  }

  setGain(multiplier: number) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(multiplier, this.audioCtx.currentTime);
    }
  }

  setNightMode(enabled: boolean) {
    if (this.speechFilterNode && this.compressorNode && this.audioCtx) {
      if (enabled) {
        // Boost dialogue and compress explosions
        this.speechFilterNode.gain.setValueAtTime(5, this.audioCtx.currentTime);
        this.compressorNode.threshold.setValueAtTime(-32, this.audioCtx.currentTime);
      } else {
        // Flat natural response
        this.speechFilterNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.compressorNode.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
      }
    }
  }

  // Synthesized UI sound effect for TV remote clicks
  playNavigationTick() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {
      // AudioContext suppressed before user interaction
    }
  }
}

export const audioEnhancer = new AudioEnhancerService();
