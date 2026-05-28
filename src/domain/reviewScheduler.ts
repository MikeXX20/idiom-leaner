import type { Confidence, Idiom } from "./types";

export type ReviewMode = "daily" | "topic";
export type ReviewResult = "Again" | "Hard" | "Good";

export interface ReviewQueueOptions {
  mode: ReviewMode;
  topic?: string;
  now?: Date;
  limit?: number;
}

const defaultLimit = 10;
const hour = 60 * 60 * 1000;

export function normalizeStudyFields(idiom: Idiom): Idiom {
  return {
    ...idiom,
    difficulty: idiom.difficulty ?? "medium",
    ieltsSafety: idiom.ieltsSafety ?? "careful",
    confidence: idiom.confidence ?? "new",
    reviewCount: idiom.reviewCount ?? 0,
    mistakeCount: idiom.mistakeCount ?? 0
  };
}

export function buildReviewQueue(idioms: Idiom[], options: ReviewQueueOptions) {
  const now = options.now ?? new Date();
  const limit = options.limit ?? defaultLimit;
  const normalized = idioms.map(normalizeStudyFields);

  const filtered =
    options.mode === "topic"
      ? normalized.filter((idiom) => idiom.topics.includes(options.topic ?? ""))
      : normalized.filter((idiom) => isDueOrNew(idiom, now));

  return [...filtered]
    .sort((first, second) => score(second, now) - score(first, now))
    .slice(0, limit);
}

export function markIdiomReviewed(
  idiom: Idiom,
  result: ReviewResult,
  reviewedAt = new Date()
): Idiom {
  const normalized = normalizeStudyFields(idiom);
  const nextReviewAt = new Date(
    reviewedAt.getTime() + delayFor(result, normalized.reviewCount ?? 0)
  );
  const mistakeCount = (normalized.mistakeCount ?? 0) + (result === "Again" ? 1 : 0);
  const reviewCount = (normalized.reviewCount ?? 0) + 1;

  return {
    ...normalized,
    confidence: confidenceFor(result, reviewCount, mistakeCount),
    reviewCount,
    mistakeCount,
    lastReviewedAt: reviewedAt.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
    updatedAt: reviewedAt.toISOString()
  };
}

function isDueOrNew(idiom: Idiom, now: Date) {
  if (idiom.confidence === "new") {
    return true;
  }

  if (!idiom.nextReviewAt) {
    return true;
  }

  return new Date(idiom.nextReviewAt).getTime() <= now.getTime();
}

function score(idiom: Idiom, now: Date) {
  const dueBonus =
    !idiom.nextReviewAt || new Date(idiom.nextReviewAt).getTime() <= now.getTime() ? 100 : 0;
  const mistakeBonus = (idiom.mistakeCount ?? 0) * 10;
  const newBonus = idiom.confidence === "new" ? 5 : 0;
  return dueBonus + mistakeBonus + newBonus;
}

function delayFor(result: ReviewResult, reviewCount: number) {
  if (result === "Again") {
    return 2 * hour;
  }

  if (result === "Hard") {
    return 24 * hour;
  }

  return Math.min(7, Math.max(2, reviewCount + 1)) * 24 * hour;
}

function confidenceFor(result: ReviewResult, reviewCount: number, mistakeCount: number): Confidence {
  if (result !== "Good") {
    return "practicing";
  }

  return reviewCount >= 3 && mistakeCount === 0 ? "confident" : "practicing";
}
