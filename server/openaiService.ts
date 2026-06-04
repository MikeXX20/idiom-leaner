import fs from "node:fs";
import { unlink } from "node:fs/promises";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { AiService, ReviewRecordingInput, ReviewTextInput } from "./types";

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

type AiProvider = "openai" | "deepseek";

interface AiProviderConfig {
  provider: AiProvider;
  apiKey?: string;
  baseURL?: string;
  feedbackModel: string;
  transcriptionModel: string;
}

let client: OpenAI | undefined;
let clientConfigKey = "";

export function resolveAiProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): AiProviderConfig {
  const provider = env.LLM_PROVIDER === "deepseek" ? "deepseek" : "openai";

  if (provider === "deepseek") {
    return {
      provider,
      apiKey: env.DEEPSEEK_API_KEY,
      baseURL: env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      feedbackModel: env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      transcriptionModel: env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe"
    };
  }

  return {
    provider,
    apiKey: env.OPENAI_API_KEY,
    feedbackModel: env.OPENAI_FEEDBACK_MODEL ?? "gpt-5.4-mini",
    transcriptionModel: env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe"
  };
}

function getClient(config = resolveAiProviderConfig()) {
  const nextConfigKey = JSON.stringify({
    provider: config.provider,
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });

  if (!client || clientConfigKey !== nextConfigKey) {
    client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    clientConfigKey = nextConfigKey;
  }

  return client;
}

function parseGeneratedIdioms(rawContent: string | null | undefined) {
  if (!rawContent) {
    return { idioms: [] };
  }

  return generatedIdiomSchema.parse(JSON.parse(rawContent));
}

function fallbackFeedback(transcript: string) {
  return {
    naturalUsage: [],
    forcedUsage: [],
    betterAlternatives: [],
    improvedSampleSentence: "",
    nextStep: "Review the answer and try again.",
    transcript
  };
}

function parseFeedbackContent(rawContent: string | null | undefined, transcript: string) {
  if (!rawContent) {
    return fallbackFeedback(transcript);
  }

  return feedbackSchema.parse(JSON.parse(rawContent));
}

function buildFeedbackPrompt(input: ReviewTextInput, transcript: string) {
  return [
    `IELTS part: ${input.ieltsPart}`,
    `Topic: ${input.topic}`,
    `Prompt: ${input.prompt}`,
    `Selected idioms: ${input.selectedIdioms.join(", ") || "none"}`,
    `Answer: ${transcript}`
  ].join("\n");
}

async function reviewTranscript(input: ReviewTextInput, transcript: string) {
  const config = resolveAiProviderConfig();

  if (config.provider === "deepseek") {
    const response = await getClient(config).chat.completions.create({
      model: config.feedbackModel,
      messages: [
        {
          role: "system",
          content:
            "You are an IELTS Speaking vocabulary coach. Return only valid JSON. Do not give an official IELTS score. Focus on whether idioms sound natural, whether they are overused, and safer alternatives."
        },
        {
          role: "user",
          content: [
            buildFeedbackPrompt(input, transcript),
            "Return JSON with this shape:",
            '{"naturalUsage":["..."],"forcedUsage":["..."],"betterAlternatives":["..."],"improvedSampleSentence":"...","nextStep":"...","transcript":"..."}'
          ].join("\n")
        }
      ],
      response_format: { type: "json_object" }
    });

    return { feedback: parseFeedbackContent(response.choices[0]?.message.content, transcript) };
  }

  const response = await getClient(config).responses.parse({
    model: config.feedbackModel,
    input: [
      {
        role: "system",
        content:
          "You are an IELTS Speaking vocabulary coach. Do not give an official IELTS score. Focus on whether idioms sound natural, whether they are overused, and safer alternatives."
      },
      {
        role: "user",
        content: buildFeedbackPrompt(input, transcript)
      }
    ],
    text: {
      format: zodTextFormat(feedbackSchema, "ielts_idiom_feedback")
    }
  });

  return {
    feedback: response.output_parsed ?? fallbackFeedback(transcript)
  };
}

export const openAiService: AiService = {
  async generateIdioms(input) {
    const config = resolveAiProviderConfig();

    if (config.provider === "deepseek") {
      const response = await getClient(config).chat.completions.create({
        model: config.feedbackModel,
        messages: [
          {
            role: "system",
            content:
              "You help IELTS Speaking learners around Band 6.5-7.5 use idioms naturally. Return only valid JSON."
          },
          {
            role: "user",
            content: [
              `Generate 5 idioms or natural expressions for IELTS ${input.ieltsPart}, topic: ${input.topic}.`,
              "Return JSON with this shape:",
              '{"idioms":[{"phrase":"...","meaning":"...","topics":["..."],"formality":"neutral","riskLevel":"low","example":"...","usageWarning":"..."}]}',
              "Use formality as neutral, casual, or formal.",
              "Use riskLevel as low, medium, or high."
            ].join("\n")
          }
        ],
        response_format: { type: "json_object" }
      });

      return parseGeneratedIdioms(response.choices[0]?.message.content);
    }

    const response = await getClient(config).responses.parse({
      model: config.feedbackModel,
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
    const config = resolveAiProviderConfig();

    if (config.provider === "deepseek") {
      throw new Error("Audio feedback needs a transcription provider.");
    }

    let transcript = "";

    try {
      const transcription = await getClient(config).audio.transcriptions.create({
        file: fs.createReadStream(input.filePath),
        model: config.transcriptionModel
      });
      transcript = transcription.text;
    } finally {
      await unlink(input.filePath).catch(() => undefined);
    }

    return reviewTranscript(
      {
        answerText: transcript,
        ieltsPart: input.ieltsPart,
        topic: input.topic,
        prompt: input.prompt,
        selectedIdioms: input.selectedIdioms
      },
      transcript
    );
  },

  async reviewText(input: ReviewTextInput) {
    return reviewTranscript(input, input.answerText);
  }
};
