import { z } from "zod";
import type { Feedback } from "./types";

export const feedbackSchema = z.object({
  naturalUsage: z.array(z.string()).default([]),
  forcedUsage: z.array(z.string()).default([]),
  betterAlternatives: z.array(z.string()).default([]),
  improvedSampleSentence: z.string().default(""),
  nextStep: z.string().default("Review the recording and try again."),
  transcript: z.string().default("")
});

export type FeedbackPayload = z.infer<typeof feedbackSchema>;

export function parseFeedback(value: unknown): Feedback {
  const parsed = feedbackSchema.safeParse(value);

  if (parsed.success) {
    return {
      ...parsed.data,
      rawModelResponse: value
    };
  }

  return {
    naturalUsage: [],
    forcedUsage: [],
    betterAlternatives: [],
    improvedSampleSentence: "",
    nextStep: "Review the recording and try again.",
    transcript: "",
    rawModelResponse: value
  };
}
