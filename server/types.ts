import type { FeedbackPayload } from "../src/domain/feedbackSchema";
import type { Formality, IeltsPart, RiskLevel } from "../src/domain/types";

export interface GeneratedIdiomPayload {
  phrase: string;
  meaning: string;
  topics: string[];
  formality: Formality;
  riskLevel: RiskLevel;
  example: string;
  usageWarning: string;
}

export interface GenerateIdiomsResult {
  idioms: GeneratedIdiomPayload[];
}

export interface ReviewRecordingInput {
  filePath: string;
  mimeType: string;
  ieltsPart: IeltsPart;
  topic: string;
  prompt: string;
  selectedIdioms: string[];
}

export interface ReviewRecordingResult {
  feedback: FeedbackPayload;
}

export interface AiService {
  generateIdioms(input: {
    topic: string;
    ieltsPart: IeltsPart;
  }): Promise<GenerateIdiomsResult>;
  reviewRecording(input: ReviewRecordingInput): Promise<ReviewRecordingResult>;
}
