import { describe, it, expect } from "vitest";
import { Resampler, Segmenter, TARGET_SAMPLE_RATE } from "../audio";
import { encodeWav } from "../wav";
import { cleanTranscript } from "../transcript";

const SR = TARGET_SAMPLE_RATE;
const silence = (ms: number) => new Float32Array((SR * ms) / 1000);
const tone = (ms: number, amp = 0.3) => {
  const a = new Float32Array((SR * ms) / 1000);
  for (let i = 0; i < a.length; i++) a[i] = amp * Math.sin((2 * Math.PI * 220 * i) / SR);
  return a;
};
function run(chunks: Float32Array[], size = 512) {
  const out: Float32Array[] = [];
  const seg = new Segmenter((p) => out.push(p));
  for (const c of chunks) for (let i = 0; i < c.length; i += size) seg.push(c.subarray(i, i + size));
  seg.flush();
  return out;
}

describe("Segmenter", () => {
  it("emits one phrase for speech surrounded by silence", () => {
    const out = run([silence(1000), tone(1000), silence(1500)]);
    expect(out).toHaveLength(1);
    const ms = (out[0].length / SR) * 1000;
    expect(ms).toBeGreaterThan(1000); // the speech plus pre-roll
    expect(ms).toBeLessThan(2300); // but not the whole trailing silence
  });

  it("splits two phrases separated by a pause", () => {
    const out = run([silence(500), tone(800), silence(1200), tone(800), silence(1200)]);
    expect(out).toHaveLength(2);
  });

  it("drops a short click", () => {
    expect(run([silence(500), tone(90), silence(1500)])).toHaveLength(0);
  });

  it("flushes speech that is still in progress when capture stops", () => {
    expect(run([silence(500), tone(900)])).toHaveLength(1);
  });

  it("force-cuts very long speech so no phrase exceeds the model window", () => {
    const out = run([silence(300), tone(60_000)]);
    expect(out.length).toBeGreaterThanOrEqual(2);
    for (const p of out) expect(p.length / SR).toBeLessThanOrEqual(26);
  });

  it("ignores steady low-level noise", () => {
    expect(run([tone(5000, 0.004)])).toHaveLength(0);
  });
});

describe("Resampler", () => {
  it("passes 16 kHz through unchanged", () => {
    const r = new Resampler(16000);
    const x = Float32Array.from([0.1, 0.2, 0.3]);
    expect(r.process(x)).toBe(x);
  });

  it("downsamples 48 kHz to 16 kHz (3:1) by averaging", () => {
    const r = new Resampler(48000);
    const out = r.process(Float32Array.from([1, 2, 3, 4, 5, 6]));
    expect(Array.from(out)).toEqual([2, 5]);
  });

  it("keeps the right output length across chunk boundaries for 44.1 kHz", () => {
    const r = new Resampler(44100);
    let total = 0;
    for (let i = 0; i < 100; i++) total += r.process(new Float32Array(441)).length;
    expect(Math.abs(total - 16000)).toBeLessThanOrEqual(1); // 44100 samples -> ~16000
  });
});

describe("encodeWav", () => {
  it("writes a valid 16-bit mono 16 kHz header", () => {
    const buf = encodeWav(Float32Array.from([0, 1, -1]), 16000);
    const v = new DataView(buf);
    const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
    expect(tag(0)).toBe("RIFF");
    expect(tag(8)).toBe("WAVE");
    expect(v.getUint16(22, true)).toBe(1);
    expect(v.getUint32(24, true)).toBe(16000);
    expect(v.getUint32(40, true)).toBe(6);
    expect(v.getInt16(46, true)).toBe(32767);
    expect(v.getInt16(48, true)).toBe(-32768);
  });
});

describe("cleanTranscript", () => {
  it("removes non-speech markers", () => {
    expect(cleanTranscript("[BLANK_AUDIO]")).toBe("");
    expect(cleanTranscript("Hello (music) there")).toBe("Hello there");
  });
  it("drops known hallucinations but keeps real speech", () => {
    expect(cleanTranscript("Thanks for watching!")).toBe("");
    expect(cleanTranscript("you")).toBe("");
    expect(cleanTranscript("Thank you for the update.")).toBe("Thank you for the update.");
  });
});
