import { describe, expect, it, vi } from "vitest";

describe("openAiService", () => {
  it("can be imported before an API key is configured", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    vi.resetModules();

    const module = await import("./openaiService");

    expect(module.openAiService).toBeDefined();

    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });
});
