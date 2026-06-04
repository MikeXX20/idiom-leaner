import { describe, expect, it } from "vitest";
import { feedbackSchema, parseFeedback } from "./feedbackSchema";

describe("feedbackSchema", () => {
  it("accepts the structured feedback shape used by the UI", () => {
    const result = feedbackSchema.parse({
      naturalUsage: ["Used 'a steep learning curve' naturally for a new job."],
      forcedUsage: [],
      betterAlternatives: ["Try 'challenging at first' if the idiom feels too heavy."],
      improvedSampleSentence:
        "Starting university was a steep learning curve, but it helped me become more independent.",
      nextStep: "Use one idiom and one precise adjective in the next answer.",
      transcript: "Starting university was a steep learning curve."
    });

    expect(result.naturalUsage).toHaveLength(1);
    expect(result.transcript).toContain("steep learning curve");
  });

  it("returns a fallback object when model output is malformed", () => {
    const result = parseFeedback({ naturalUsage: "not an array" });

    expect(result.naturalUsage).toEqual([]);
    expect(result.forcedUsage).toEqual([]);
    expect(result.nextStep).toBe("Review the recording and try again.");
  });
});
