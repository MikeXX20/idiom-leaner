import { parseFeedback } from "../domain/feedbackSchema";
import type { Feedback, Formality, IeltsPart, RiskLevel } from "../domain/types";

export interface GeneratedIdiomPayload {
  phrase: string;
  meaning: string;
  topics: string[];
  formality: Formality;
  riskLevel: RiskLevel;
  example: string;
  usageWarning: string;
}

export async function generateIdioms(input: {
  topic: string;
  ieltsPart: IeltsPart;
}): Promise<GeneratedIdiomPayload[]> {
  const response = await fetch("/api/idioms/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Could not generate idioms.");
  }

  const data = (await response.json()) as { idioms?: GeneratedIdiomPayload[] };
  return data.idioms ?? [];
}

export async function requestFeedback(input: {
  recordingBlob: Blob;
  ieltsPart: IeltsPart;
  topic: string;
  prompt: string;
  selectedIdioms: string[];
}): Promise<Feedback> {
  const formData = new FormData();
  formData.set("recording", input.recordingBlob, "answer.webm");
  formData.set("ieltsPart", input.ieltsPart);
  formData.set("topic", input.topic);
  formData.set("prompt", input.prompt);
  formData.set("selectedIdioms", JSON.stringify(input.selectedIdioms));

  const response = await fetch("/api/feedback", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Could not review recording.");
  }

  const data = (await response.json()) as { feedback?: unknown };
  return parseFeedback(data.feedback);
}
