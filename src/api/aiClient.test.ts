import { describe, expect, it, vi } from "vitest";
import { generateIdioms, requestFeedback, requestTextFeedback } from "./aiClient";

describe("aiClient", () => {
  it("posts topic context to generate idioms", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        idioms: [
          {
            phrase: "a steep learning curve",
            meaning: "a hard learning process",
            topics: ["Education"],
            formality: "neutral",
            riskLevel: "low",
            example: "University was a steep learning curve.",
            usageWarning: "Use for serious learning challenges."
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateIdioms({ topic: "Education", ieltsPart: "Part 2" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/idioms/generate",
      expect.objectContaining({ method: "POST" })
    );
    expect(result[0].phrase).toBe("a steep learning curve");
  });

  it("uploads audio and selected idioms for feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        feedback: {
          naturalUsage: [],
          forcedUsage: [],
          betterAlternatives: [],
          improvedSampleSentence: "",
          nextStep: "Try again with one idiom.",
          transcript: "My course had a steep learning curve."
        }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestFeedback({
      recordingBlob: new Blob(["audio"], { type: "audio/webm" }),
      ieltsPart: "Part 2",
      topic: "Education",
      prompt: "Describe a teacher.",
      selectedIdioms: ["a steep learning curve"]
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(result.nextStep).toContain("one idiom");
  });

  it("posts a typed answer for text feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        feedback: {
          naturalUsage: ["The idiom fits the education topic."],
          forcedUsage: [],
          betterAlternatives: ["Try one clearer example."],
          improvedSampleSentence: "The course had a steep learning curve, but I kept going.",
          nextStep: "Use the idiom once, then explain it naturally.",
          transcript: "The course had a steep learning curve."
        }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestTextFeedback({
      answerText: "The course had a steep learning curve.",
      ieltsPart: "Part 2",
      topic: "Education",
      prompt: "Describe a teacher.",
      selectedIdioms: ["a steep learning curve"]
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/feedback/text",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerText: "The course had a steep learning curve.",
          ieltsPart: "Part 2",
          topic: "Education",
          prompt: "Describe a teacher.",
          selectedIdioms: ["a steep learning curve"]
        })
      })
    );
    expect(result.nextStep).toContain("Use the idiom once");
  });
});
