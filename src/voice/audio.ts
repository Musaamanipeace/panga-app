export const TARGET_SAMPLE_RATE = 16000;

/**
 * Stateful box-filter resampler (any input rate -> output rate). State is kept
 * across calls so chunk boundaries do not introduce glitches.
 */
export class Resampler {
  private acc = 0;
  private cnt = 0;
  private phase = 0;
  private readonly ratio: number;
  private readonly inRate: number;
  private readonly outRate: number;

  constructor(inRate: number, outRate: number = TARGET_SAMPLE_RATE) {
    this.inRate = inRate;
    this.outRate = outRate;
    this.ratio = inRate / outRate;
  }

  process(input: Float32Array): Float32Array {
    if (this.inRate === this.outRate) return input;
    const out: number[] = [];
    for (let i = 0; i < input.length; i++) {
      this.acc += input[i];
      this.cnt++;
      this.phase += 1;
      if (this.phase >= this.ratio) {
        out.push(this.acc / this.cnt);
        this.acc = 0;
        this.cnt = 0;
        this.phase -= this.ratio;
      }
    }
    return Float32Array.from(out);
  }
}

export interface SegmenterOptions {
  sampleRate?: number;
  frameMs?: number;
  /** Speech shorter than this is treated as a click/cough and dropped. */
  minSpeechMs?: number;
  /** Silence this long ends a phrase. */
  silenceMs?: number;
  /** Audio kept from before speech was detected so word starts are not clipped. */
  preRollMs?: number;
  /** Phrases are force-cut at this length (Whisper handles up to 30 s). */
  maxSegmentMs?: number;
  /** Absolute floor for the speech-detection level (RMS, 0..1). */
  minThreshold?: number;
}

/**
 * Energy-based voice activity detector that cuts a continuous 16 kHz stream
 * into phrases at natural pauses, so a model that needs whole utterances
 * (Whisper) can transcribe each one as soon as the speaker pauses.
 */
export class Segmenter {
  private readonly frameSize: number;
  private readonly o: Required<SegmenterOptions>;
  private leftover = new Float32Array(0);
  private noise = 0.005;
  private preRoll: Float32Array[] = [];
  private frames: Float32Array[] = [];
  private inSpeech = false;
  private voiced = 0;
  private silent = 0;
  private readonly onSegment: (pcm: Float32Array) => void;
  private readonly onSpeaking?: (speaking: boolean) => void;

  constructor(
    onSegment: (pcm: Float32Array) => void,
    options: SegmenterOptions = {},
    onSpeaking?: (speaking: boolean) => void,
  ) {
    this.onSegment = onSegment;
    this.onSpeaking = onSpeaking;
    this.o = {
      sampleRate: TARGET_SAMPLE_RATE,
      frameMs: 30,
      minSpeechMs: 250,
      silenceMs: 700,
      preRollMs: 300,
      maxSegmentMs: 25000,
      minThreshold: 0.012,
      ...options,
    };
    this.frameSize = Math.round((this.o.sampleRate * this.o.frameMs) / 1000);
  }

  push(samples: Float32Array): void {
    let data = samples;
    if (this.leftover.length) {
      data = new Float32Array(this.leftover.length + samples.length);
      data.set(this.leftover, 0);
      data.set(samples, this.leftover.length);
    }
    let i = 0;
    for (; i + this.frameSize <= data.length; i += this.frameSize) {
      this.frame(data.subarray(i, i + this.frameSize));
    }
    this.leftover = data.slice(i);
  }

  /** Emits any speech still in progress (call when capture stops). */
  flush(): void {
    if (this.inSpeech) this.finish();
    this.leftover = new Float32Array(0);
  }

  private frame(f: Float32Array): void {
    const frame = f.slice();
    let sum = 0;
    for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
    const rms = Math.sqrt(sum / frame.length);
    const threshold = Math.max(this.o.minThreshold, this.noise * 3);
    const loud = rms > threshold;

    if (!this.inSpeech) {
      this.noise = this.noise * 0.95 + rms * 0.05;
      if (loud) {
        this.inSpeech = true;
        this.onSpeaking?.(true);
        this.frames = [...this.preRoll, frame];
        this.preRoll = [];
        this.voiced = 1;
        this.silent = 0;
      } else {
        this.preRoll.push(frame);
        const keep = Math.ceil(this.o.preRollMs / this.o.frameMs);
        if (this.preRoll.length > keep) this.preRoll.shift();
      }
      return;
    }

    this.frames.push(frame);
    if (loud) {
      this.voiced++;
      this.silent = 0;
    } else {
      this.silent++;
    }
    const totalMs = this.frames.length * this.o.frameMs;
    if (this.silent * this.o.frameMs >= this.o.silenceMs || totalMs >= this.o.maxSegmentMs) {
      this.finish();
    }
  }

  private finish(): void {
    const voicedMs = this.voiced * this.o.frameMs;
    const frames = this.frames;
    this.frames = [];
    this.inSpeech = false;
    this.voiced = 0;
    this.silent = 0;
    this.preRoll = [];
    this.onSpeaking?.(false);
    if (voicedMs < this.o.minSpeechMs) return;
    const total = frames.reduce((n, f) => n + f.length, 0);
    const pcm = new Float32Array(total);
    let off = 0;
    for (const f of frames) {
      pcm.set(f, off);
      off += f.length;
    }
    this.onSegment(pcm);
  }
}

export interface CaptureHandle {
  /** Stops the microphone and emits any phrase still in progress. */
  stop(): void;
}

export function isCaptureSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof AudioContext !== "undefined" &&
    "audioWorklet" in AudioContext.prototype &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/**
 * Opens the microphone and delivers whole spoken phrases as 16 kHz mono PCM.
 */
export async function startSegmentedCapture(opts: {
  onSegment: (pcm: Float32Array) => void;
  onSpeaking?: (speaking: boolean) => void;
}): Promise<CaptureHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioContext();
    await ctx.audioWorklet.addModule("/voice/pcm-worklet.js");
    if (ctx.state === "suspended") await ctx.resume();

    const resampler = new Resampler(ctx.sampleRate);
    const segmenter = new Segmenter(opts.onSegment, {}, opts.onSpeaking);
    const source = ctx.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(ctx, "pcm-capture");
    node.port.onmessage = (e: MessageEvent<Float32Array>) => {
      segmenter.push(resampler.process(e.data));
    };
    source.connect(node);

    const context = ctx;
    return {
      stop() {
        try {
          node.port.onmessage = null;
          source.disconnect();
          node.disconnect();
        } catch {
          /* already disconnected */
        }
        segmenter.flush();
        stream.getTracks().forEach((t) => t.stop());
        void context.close();
      },
    };
  } catch (err) {
    stream.getTracks().forEach((t) => t.stop());
    void ctx?.close();
    throw err;
  }
}
