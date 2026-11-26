import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAutoReloadController, isUserTyping } from "../autoReload";

describe("PWA autoReload controller", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reloads immediately when idle and enforces 10s loop cooldown", () => {
    let nowMs = 1_000_000;
    const reload = vi.fn();
    const ctrl = createAutoReloadController({ reload, now: () => nowMs });

    expect(ctrl.scheduleReload()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);

    // Same controller won't double-reload
    expect(ctrl.scheduleReload()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    // Fresh page load within cooldown window is blocked by sessionStorage guard
    nowMs += 3_000;
    const freshWithinCooldown = createAutoReloadController({ reload, now: () => nowMs });
    expect(freshWithinCooldown.scheduleReload()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    // Fresh page load after cooldown expires is allowed
    nowMs += 10_000;
    const freshAfterCooldown = createAutoReloadController({ reload, now: () => nowMs });
    expect(freshAfterCooldown.scheduleReload()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("defers reload while typing in a text input/textarea and reloads once blurred", () => {
    const input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    input.focus();

    expect(isUserTyping()).toBe(true);

    const reload = vi.fn();
    const ctrl = createAutoReloadController({ reload, now: () => 50_000 });

    expect(ctrl.scheduleReload()).toBe(false);
    expect(ctrl.isPending()).toBe(true);
    expect(reload).not.toHaveBeenCalled();

    input.blur();
    input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));

    expect(ctrl.isPending()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not treat checkboxes as active typing", () => {
    const box = document.createElement("input");
    box.type = "checkbox";
    document.body.appendChild(box);
    box.focus();

    expect(isUserTyping()).toBe(false);

    const reload = vi.fn();
    const ctrl = createAutoReloadController({ reload, now: () => 50_000 });
    expect(ctrl.scheduleReload()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
