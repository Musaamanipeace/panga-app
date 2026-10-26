// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { detectPlatform, installInstructions } from "../../pwa/install";

describe("detectPlatform", () => {
  const ua = {
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    ipadDesktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    androidChrome: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0",
  };
  it("recognises each browser family", () => {
    expect(detectPlatform(ua.iphone)).toBe("ios");
    expect(detectPlatform(ua.ipadDesktop, 5)).toBe("ios"); // iPadOS reports a Mac UA
    expect(detectPlatform(ua.macSafari, 0)).toBe("safari");
    expect(detectPlatform(ua.chrome)).toBe("chromium");
    expect(detectPlatform(ua.edge)).toBe("chromium");
    expect(detectPlatform(ua.androidChrome)).toBe("chromium");
    expect(detectPlatform(ua.firefox)).toBe("firefox");
    expect(detectPlatform(ua.androidFirefox)).toBe("android-firefox");
  });
  it("has instructions for every platform", () => {
    for (const p of ["ios", "safari", "firefox", "android-firefox", "chromium", "other"] as const) {
      expect(installInstructions(p).length).toBeGreaterThan(0);
    }
  });
});

describe("install prompt capture", () => {
  it("captures the browser's install event as soon as the module loads, then prompts once", async () => {
    vi.resetModules();
    const mod = await import("../../pwa/install");
    expect(mod.promptInstall).toBeTypeOf("function");

    // The event fires BEFORE any component exists, as it does in a real page load.
    const prompt = vi.fn().mockResolvedValue(undefined);
    const evt = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });
    window.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true); // we suppress the mini-infobar to show our own button

    expect(await mod.promptInstall()).toBe("accepted");
    expect(prompt).toHaveBeenCalledTimes(1);
    // The event is single-use; a second press must not reuse it.
    expect(await mod.promptInstall()).toBe("unavailable");
  });
});
