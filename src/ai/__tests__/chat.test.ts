import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "../../data/db";
import { setAIApiKey, setAIProvider } from "../../data/settings";
import { chatCompletion } from "../chat";
import { clearResolvedModelCache } from "../providers";

afterEach(async () => {
  vi.restoreAllMocks();
  clearResolvedModelCache();
  await db.settings.clear();
  localStorage.clear(); // BYOK keys are account-level and live outside the settings table
});

describe("chatCompletion with API key only", () => {
  it("resolves a free live model for openrouter when no model is selected", async () => {
    await setAIProvider("openrouter");
    await setAIApiKey("openrouter", "sk-or-test");

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (free)" },
              { id: "openai/gpt-4o", name: "GPT-4o" },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "Hello back" } }] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

    const res = await chatCompletion([{ role: "user", content: "Hi" }]);
    expect(res).toEqual({
      text: "Hello back",
      provider: "openrouter",
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to a sensible default model when only an OpenAI API key is set", async () => {
    await setAIProvider("openai");
    await setAIApiKey("openai", "sk-openai-test");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "Done" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await chatCompletion([{ role: "user", content: "Test" }]);
    expect(res).toEqual({
      text: "Done",
      provider: "openai",
      model: "gpt-4o-mini",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.model).toBe("gpt-4o-mini");
  });

  it("throws when no provider has an API key", async () => {
    await setAIProvider("gemini");
    await expect(chatCompletion([{ role: "user", content: "Hi" }])).rejects.toThrow(
      /No API key for Google Gemini/
    );
  });

  it("falls back to another configured provider when active provider has no key", async () => {
    await setAIProvider("openrouter");
    await setAIApiKey("openai", "sk-openai-only");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "Fallback worked" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await chatCompletion([{ role: "user", content: "Hi" }]);
    expect(res).toEqual({
      text: "Fallback worked",
      provider: "openai",
      model: "gpt-4o-mini",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
