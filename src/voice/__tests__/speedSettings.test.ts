import { describe, it, expect } from "vitest";
import { modelForQuality, qualityForModel, WHISPER_QUALITY_OPTIONS } from "../models";
import { Segmenter, TARGET_SAMPLE_RATE } from "../audio";

const SR = TARGET_SAMPLE_RATE;

describe("whisper speed selector", () => {
  it("defaults to the fastest model and maps each tier to a model", () => {
    expect(modelForQuality("fast")).toBe("tiny.en");
    expect(WHISPER_QUALITY_OPTIONS[0].id).toBe("fast");
    expect(qualityForModel("tiny.en")).toBe("fast");
    expect(qualityForModel("base")).toBe("balanced");
    expect(qualityForModel("small")).toBe("accurate");
  });
});

describe("partial transcription", () => {
  it("emits a partial transcript while speech is still in progress", () => {
    const partials: Float32Array[] = [];
    const finals: Float32Array[] = [];
    const tone = new Float32Array(SR * 5);
    for (let i = 0; i < tone.length; i++) tone[i] = 0.3 * Math.sin((2 * Math.PI * 220 * i) / SR);

    const seg = new Segmenter((pcm) => finals.push(pcm), {}, undefined, (pcm) => partials.push(pcm));
    for (let i = 0; i < tone.length; i += 512) seg.push(tone.subarray(i, i + 512));

    expect(partials.length).toBeGreaterThan(0);
    seg.flush();
    expect(finals).toHaveLength(1);
  });
});
