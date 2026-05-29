import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("openAiService", () => {
  it("can be imported before an API key is configured", async () => {
    delete process.env.OPENAI_API_KEY;
    vi.resetModules();

    const module = await import("./openaiService");

    expect(module.openAiService).toBeDefined();
  });

  it("resolves DeepSeek as an OpenAI-compatible chat provider", async () => {
    const { resolveAiProviderConfig } = await import("./openaiService");

    const config = resolveAiProviderConfig({
      LLM_PROVIDER: "deepseek",
      DEEPSEEK_API_KEY: "test-deepseek-key",
      DEEPSEEK_MODEL: "deepseek-v4-pro"
    });

    expect(config).toEqual({
      provider: "deepseek",
      apiKey: "test-deepseek-key",
      baseURL: "https://api.deepseek.com",
      feedbackModel: "deepseek-v4-pro",
      transcriptionModel: "gpt-4o-transcribe"
    });
  });

  it("generates idioms with DeepSeek chat completions", async () => {
    const chatCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              idioms: [
                {
                  phrase: "break new ground",
                  meaning: "to do something innovative",
                  topics: ["Technology"],
                  formality: "neutral",
                  riskLevel: "low",
                  example: "This app breaks new ground in language learning.",
                  usageWarning: "Use it for genuinely new or innovative things."
                }
              ]
            })
          }
        }
      ]
    });
    const OpenAIMock = vi.fn(function MockOpenAI() {
      return {
        chat: { completions: { create: chatCreate } }
      };
    });
    vi.doMock("openai", () => ({ default: OpenAIMock }));
    process.env.LLM_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

    const { openAiService } = await import("./openaiService");
    const result = await openAiService.generateIdioms({
      topic: "Technology",
      ieltsPart: "Part 3"
    });

    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: "test-deepseek-key",
      baseURL: "https://api.deepseek.com"
    });
    expect(chatCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "deepseek-v4-flash",
        response_format: { type: "json_object" }
      })
    );
    expect(result.idioms[0].phrase).toBe("break new ground");
  });
});
