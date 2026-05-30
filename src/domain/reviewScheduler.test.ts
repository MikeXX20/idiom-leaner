import { describe, expect, it } from "vitest";
import { starterIdioms } from "./idiomDeck";
import {
  buildReviewQueue,
  buildStudyStats,
  markIdiomReviewed,
  normalizeStudyFields
} from "./reviewScheduler";
import type { Idiom } from "./types";

const now = new Date("2026-05-28T12:00:00.000Z");

function idiom(overrides: Partial<Idiom>): Idiom {
  return {
    ...starterIdioms[0],
    id: overrides.id ?? starterIdioms[0].id,
    phrase: overrides.phrase ?? starterIdioms[0].phrase,
    topics: overrides.topics ?? starterIdioms[0].topics,
    confidence: overrides.confidence ?? "new",
    updatedAt: overrides.updatedAt ?? "2026-05-28T00:00:00.000Z",
    ...overrides
  };
}

describe("reviewScheduler", () => {
  it("normalizes old idioms with default study fields", () => {
    const normalized = normalizeStudyFields({
      ...starterIdioms[0],
      difficulty: undefined,
      ieltsSafety: undefined,
      reviewCount: undefined,
      mistakeCount: undefined
    });

    expect(normalized.difficulty).toBe("medium");
    expect(normalized.ieltsSafety).toBe("careful");
    expect(normalized.reviewCount).toBe(0);
    expect(normalized.mistakeCount).toBe(0);
  });

  it("builds daily review from due, weak, and new cards", () => {
    const dueWeak = idiom({
      id: "idiom-due-weak",
      phrase: "due weak",
      mistakeCount: 3,
      nextReviewAt: "2026-05-28T09:00:00.000Z"
    });
    const future = idiom({
      id: "idiom-future",
      phrase: "future",
      confidence: "confident",
      nextReviewAt: "2026-06-01T09:00:00.000Z"
    });
    const fresh = idiom({
      id: "idiom-fresh",
      phrase: "fresh",
      confidence: "new"
    });

    const queue = buildReviewQueue([future, fresh, dueWeak], {
      mode: "daily",
      now,
      limit: 10
    });

    expect(queue.map((item) => item.id)).toEqual(["idiom-due-weak", "idiom-fresh"]);
  });

  it("filters topic practice by selected topic and ignores due dates", () => {
    const work = idiom({ id: "idiom-work", topics: ["Work and Careers"] });
    const health = idiom({
      id: "idiom-health",
      topics: ["Health"],
      nextReviewAt: "2026-06-01T09:00:00.000Z"
    });

    const queue = buildReviewQueue([work, health], {
      mode: "topic",
      topic: "Health",
      now,
      limit: 10
    });

    expect(queue.map((item) => item.id)).toEqual(["idiom-health"]);
  });

  it("updates progress when a card is marked", () => {
    const reviewed = markIdiomReviewed(starterIdioms[0], "Again", now);

    expect(reviewed.confidence).toBe("practicing");
    expect(reviewed.reviewCount).toBe(1);
    expect(reviewed.mistakeCount).toBe(1);
    expect(reviewed.lastReviewedAt).toBe("2026-05-28T12:00:00.000Z");
    expect(new Date(reviewed.nextReviewAt ?? "").getTime()).toBeGreaterThan(now.getTime());
  });

  it("counts hard reviews as weak and good reviews as confident", () => {
    const hard = markIdiomReviewed(idiom({ id: "idiom-hard" }), "Hard", now);
    const good = markIdiomReviewed(idiom({ id: "idiom-good" }), "Good", now);
    const recovered = markIdiomReviewed(
      idiom({
        id: "idiom-recovered",
        confidence: "practicing",
        mistakeCount: 2
      }),
      "Good",
      now
    );

    const stats = buildStudyStats([hard, good, recovered], now);

    expect(hard.confidence).toBe("practicing");
    expect(good.confidence).toBe("confident");
    expect(recovered.confidence).toBe("confident");
    expect(stats.weak).toBe(1);
    expect(stats.confident).toBe(2);
  });

  it("summarizes review readiness and weak cards", () => {
    const stats = buildStudyStats(
      [
        idiom({ id: "idiom-new", confidence: "new" }),
        idiom({
          id: "idiom-weak",
          confidence: "practicing",
          mistakeCount: 2,
          nextReviewAt: "2026-05-28T09:00:00.000Z"
        }),
        idiom({
          id: "idiom-confident",
          confidence: "confident",
          nextReviewAt: "2026-06-01T09:00:00.000Z"
        })
      ],
      now
    );

    expect(stats).toEqual({
      total: 3,
      due: 2,
      new: 1,
      weak: 1,
      confident: 1
    });
  });
});
