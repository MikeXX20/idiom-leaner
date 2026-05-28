export type IeltsPart = "Part 1" | "Part 2" | "Part 3";
export type IdiomSource = "starter" | "user" | "ai";
export type FeedbackStatus = "none" | "pending" | "complete" | "failed";
export type RiskLevel = "low" | "medium" | "high";
export type Formality = "neutral" | "casual" | "formal";
export type Confidence = "new" | "practicing" | "confident";

export interface Idiom {
  id: string;
  phrase: string;
  meaning: string;
  topics: string[];
  formality: Formality;
  riskLevel: RiskLevel;
  example: string;
  usageWarning: string;
  source: IdiomSource;
  confidence: Confidence;
  createdAt: string;
  updatedAt: string;
}

export interface SpeakingPrompt {
  id: string;
  ieltsPart: IeltsPart;
  topic: string;
  prompt: string;
}

export interface Feedback {
  naturalUsage: string[];
  forcedUsage: string[];
  betterAlternatives: string[];
  improvedSampleSentence: string;
  nextStep: string;
  transcript: string;
  rawModelResponse?: unknown;
}

export interface PracticeSession {
  id: string;
  ieltsPart: IeltsPart;
  topic: string;
  prompt: string;
  selectedIdiomIds: string[];
  recordingBlob: Blob;
  recordingDuration: number;
  feedbackStatus: FeedbackStatus;
  feedback?: Feedback;
  createdAt: string;
  updatedAt: string;
}
