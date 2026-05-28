import fs from "node:fs";
import { unlink } from "node:fs/promises";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { AiService, ReviewRecordingInput } from "./types";

const generatedIdiomSchema = z.object({
  idioms: z.array(
    z.object({
      phrase: z.string(),
      meaning: z.string(),
      topics: z.array(z.string()),
      formality: z.enum(["neutral", "casual", "formal"]),
      riskLevel: z.enum(["low", "medium", "high"]),
      example: z.string(),
      usageWarning: z.string()
    })
  )
});

const feedbackSchema = z.object({
  naturalUsage: z.array(z.string()),
  forcedUsage: z.array(z.string()),
  betterAlternatives: z.array(z.string()),
  improvedSampleSentence: z.string(),
  nextStep: z.string(),
  transcript: z.string()
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const feedbackModel = process.env.OPENAI_FEEDBACK_MODEL ?? "gpt-5.4-mini";
const transcriptionModel = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe";

export const openAiService: AiService = {
  async generateIdioms(input) {
    const response = await client.responses.parse({
      model: feedbackModel,
      input: [
        {
          role: "system",
          content:
            "You help IELTS Speaking learners around Band 6.5-7.5 use idioms naturally. Suggest safe, topic-relevant expressions and warn against forced usage."
        },
        {
          role: "user",
          content: `Generate 5 idioms or natural expressions for IELTS ${input.ieltsPart}, topic: ${input.topic}.`
        }
      ],
      text: {
        format: zodTextFormat(generatedIdiomSchema, "generated_idioms")
      }
    });

    return response.output_parsed ?? { idioms: [] };
  },

  async reviewRecording(input: ReviewRecordingInput) {
    let transcript = "";

    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(input.filePath),
        model: transcriptionModel
      });
      transcript = transcription.text;
    } finally {
      await unlink(input.filePath).catch(() => undefined);
    }

    const response = await client.responses.parse({
      model: feedbackModel,
      input: [
        {
          role: "system",
          content:
            "You are an IELTS Speaking vocabulary coach. Do not give an official IELTS score. Focus on whether idioms sound natural, whether they are overused, and safer alternatives."
        },
        {
          role: "user",
          content: [
            `IELTS part: ${input.ieltsPart}`,
            `Topic: ${input.topic}`,
            `Prompt: ${input.prompt}`,
            `Selected idioms: ${input.selectedIdioms.join(", ") || "none"}`,
            `Transcript: ${transcript}`
          ].join("\n")
        }
      ],
      text: {
        format: zodTextFormat(feedbackSchema, "ielts_idiom_feedback")
      }
    });

    return {
      feedback: response.output_parsed ?? {
        naturalUsage: [],
        forcedUsage: [],
        betterAlternatives: [],
        improvedSampleSentence: "",
        nextStep: "Review the recording and try again.",
        transcript
      }
    };
  }
};
