/**
 * Web Audio API synthesizer for ambient soundscapes, voice notes, and test audio playback.
 * Ensures audio playback works reliably even without external audio assets.
 */

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let activeStopCallback: (() => void) | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopCurrentAudio() {
  if (activeStopCallback) {
    activeStopCallback();
    activeStopCallback = null;
  }
  if (currentSourceNode) {
    try {
      (currentSourceNode as any).stop?.();
      currentSourceNode.disconnect();
    } catch {
      // ignore
    }
    currentSourceNode = null;
  }
}

/**
 * Plays a generated soothing ambient soundscape based on clip identifier
 */
export function playSynthesizedClip(
  clipId: string,
  durationSec: number,
  onProgress: (elapsedSec: number) => void,
  onEnded: () => void
): () => void {
  stopCurrentAudio();
  const ctx = getAudioContext();

  const isRain = clipId.includes('rain');
  const isRidge = clipId.includes('ridge') || clipId.includes('mountain');
  const isWheel = clipId.includes('wheel') || clipId.includes('elena');
  const isVoice = clipId.includes('voice') || clipId.includes('intro');

  // Master Gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.8);
  masterGain.connect(ctx.destination);

  let intervalId: any = null;
  let elapsed = 0;

  // Sound generation based on type
  if (isRain) {
    // Pink noise generator for rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft rain on tarp
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    currentSourceNode = whiteNoise;
  } else if (isRidge) {
    // Gentle wind drone with harmonic chime (pentatonic)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = 220; // A3
    osc2.frequency.value = 329.63; // E4

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 2;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();
    currentSourceNode = osc1;
  } else if (isWheel) {
    // Low mechanical spinning hum with soft rhythmic ceramic friction
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 110; // A2

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();
    currentSourceNode = osc;
  } else {
    // Warm voice-like harmonic sequence
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime); // Middle C-ish
    // Modulate pitch slightly to simulate human cadence
    for (let t = 1; t < durationSec; t += 2) {
      osc.frequency.exponentialRampToValueAtTime(220 + Math.sin(t) * 40, ctx.currentTime + t);
    }
    osc.connect(masterGain);
    osc.start();
    currentSourceNode = osc;
  }

  // Ticking progress
  intervalId = setInterval(() => {
    elapsed += 0.5;
    onProgress(Math.min(elapsed, durationSec));
    if (elapsed >= durationSec) {
      cleanup();
      onEnded();
    }
  }, 500);

  const cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    try {
      masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      setTimeout(() => {
        try {
          (currentSourceNode as any)?.stop?.();
          currentSourceNode?.disconnect();
          masterGain.disconnect();
        } catch {
          // ignore
        }
      }, 350);
    } catch {
      // ignore
    }
  };

  activeStopCallback = cleanup;
  return cleanup;
}
