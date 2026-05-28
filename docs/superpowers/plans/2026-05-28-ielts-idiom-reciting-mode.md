# IELTS Idiom Reciting Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an IELTS idiom reciting mode with an 80-idiom topic deck, daily/weak-first review, typed example practice, and local progress tracking.

**Architecture:** Keep the app local-first. Add a focused domain deck module, a pure review scheduler module, a new `RecitePage`, and small storage changes that seed missing built-in idioms without overwriting learner progress.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, IndexedDB through `idb`.

---

## File Structure

- Create `src/domain/idiomDeck.ts`: built-in 80-idiom IELTS deck.
- Create `src/domain/idiomDeck.test.ts`: content validation for the built-in deck.
- Modify `src/domain/types.ts`: add optional study metadata fields to `Idiom`.
- Modify `src/domain/starterContent.ts`: keep prompts in this file and re-export `starterIdioms` from `idiomDeck`.
- Create `src/domain/reviewScheduler.ts`: pure functions for defaulting study fields, building queues, and applying review marks.
- Create `src/domain/reviewScheduler.test.ts`: scheduler and mark-result tests.
- Modify `src/storage/repositories.ts`: seed missing starter idioms and preserve existing progress.
- Modify `src/storage/repositories.test.ts`: cover new seed behavior.
- Create `src/features/recite/RecitePage.tsx`: reciting study screen.
- Create `src/features/recite/RecitePage.test.tsx`: UI tests for reveal, typed example, marking, and topic filtering.
- Modify `src/App.tsx`: add `Recite` to navigation.
- Create `src/App.test.tsx`: navigation test for the Recite page.
- Modify `src/styles.css`: compact layout for recite card, tags, and controls.
- Modify `README.md`: mention Recite mode in the local app description.

---

### Task 1: Expand Idiom Domain And Built-In Deck

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/domain/idiomDeck.ts`
- Create: `src/domain/idiomDeck.test.ts`
- Modify: `src/domain/starterContent.ts`

- [ ] **Step 1: Write the failing deck validation tests**

Create `src/domain/idiomDeck.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { starterIdioms } from "./idiomDeck";

const requiredTopics = [
  "Work and Careers",
  "Education",
  "Technology",
  "Health",
  "Environment",
  "Travel",
  "Relationships",
  "Society"
];

describe("idiomDeck", () => {
  it("contains 80 IELTS idioms across the required topic packs", () => {
    expect(starterIdioms).toHaveLength(80);

    for (const topic of requiredTopics) {
      expect(starterIdioms.filter((idiom) => idiom.topics.includes(topic))).toHaveLength(10);
    }
  });

  it("gives every idiom complete study metadata", () => {
    const ids = new Set(starterIdioms.map((idiom) => idiom.id));

    expect(ids.size).toBe(starterIdioms.length);

    for (const idiom of starterIdioms) {
      expect(idiom.id).toMatch(/^idiom-/);
      expect(idiom.phrase.length).toBeGreaterThan(2);
      expect(idiom.meaning.length).toBeGreaterThan(12);
      expect(idiom.example.length).toBeGreaterThan(24);
      expect(idiom.usageWarning.length).toBeGreaterThan(20);
      expect(idiom.source).toBe("starter");
      expect(["easy", "medium", "advanced"]).toContain(idiom.difficulty);
      expect(["safe", "careful", "risky"]).toContain(idiom.ieltsSafety);
    }
  });

  it("marks risky idioms with explicit warnings", () => {
    const riskyIdioms = starterIdioms.filter((idiom) => idiom.ieltsSafety === "risky");

    expect(riskyIdioms.length).toBeGreaterThan(0);
    expect(riskyIdioms.every((idiom) => idiom.riskLevel === "high")).toBe(true);
    expect(
      riskyIdioms.every((idiom) =>
        /only|avoid|careful|specific|informal/i.test(idiom.usageWarning)
      )
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the deck test and verify it fails**

Run:

```bash
npm run test -- src/domain/idiomDeck.test.ts
```

Expected: FAIL because `src/domain/idiomDeck.ts` does not exist yet.

- [ ] **Step 3: Extend the `Idiom` type**

Modify `src/domain/types.ts`:

```ts
export type IeltsPart = "Part 1" | "Part 2" | "Part 3";
export type IdiomSource = "starter" | "user" | "ai";
export type FeedbackStatus = "none" | "pending" | "complete" | "failed";
export type RiskLevel = "low" | "medium" | "high";
export type Formality = "neutral" | "casual" | "formal";
export type Confidence = "new" | "practicing" | "confident";
export type Difficulty = "easy" | "medium" | "advanced";
export type IeltsSafety = "safe" | "careful" | "risky";

export interface Idiom {
  id: string;
  phrase: string;
  meaning: string;
  topics: string[];
  formality: Formality;
  riskLevel: RiskLevel;
  difficulty?: Difficulty;
  ieltsSafety?: IeltsSafety;
  example: string;
  usageWarning: string;
  source: IdiomSource;
  confidence: Confidence;
  lastReviewedAt?: string;
  reviewCount?: number;
  mistakeCount?: number;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 4: Create the expanded built-in deck**

Create `src/domain/idiomDeck.ts` with a helper and exactly 80 entries. Use 10 entries for each required topic.

Required phrase set:

```ts
const phrasesByTopic = {
  "Work and Careers": [
    "hit the ground running",
    "learn the ropes",
    "go the extra mile",
    "pull your weight",
    "a steep learning curve",
    "climb the career ladder",
    "keep your options open",
    "a dead-end job",
    "burn the candle at both ends",
    "in the driver's seat"
  ],
  Education: [
    "pass with flying colors",
    "learn by heart",
    "get the hang of something",
    "a thirst for knowledge",
    "put theory into practice",
    "hit the books",
    "fall behind",
    "catch up",
    "a wake-up call",
    "open doors"
  ],
  Technology: [
    "at the touch of a button",
    "be glued to a screen",
    "streamline the process",
    "bridge the gap",
    "keep up with the times",
    "a double-edged sword",
    "in the loop",
    "information overload",
    "trial and error",
    "at your fingertips"
  ],
  Health: [
    "in good shape",
    "back on your feet",
    "a balanced diet",
    "take a toll on",
    "under the weather",
    "peace of mind",
    "recharge your batteries",
    "break a bad habit",
    "a healthy outlet",
    "on the mend"
  ],
  Environment: [
    "go green",
    "reduce your carbon footprint",
    "the tip of the iceberg",
    "a drop in the ocean",
    "raise awareness",
    "throwaway culture",
    "make a difference",
    "at risk",
    "take action",
    "in the long run"
  ],
  Travel: [
    "off the beaten track",
    "travel light",
    "a change of scenery",
    "get itchy feet",
    "soak up the culture",
    "a home away from home",
    "a once-in-a-lifetime experience",
    "packed like sardines",
    "take the scenic route",
    "lose track of time"
  ],
  Relationships: [
    "break the ice",
    "get along with",
    "see eye to eye",
    "on the same wavelength",
    "a shoulder to lean on",
    "keep in touch",
    "clear the air",
    "build bridges",
    "take someone for granted",
    "through thick and thin"
  ],
  Society: [
    "quality of life",
    "a level playing field",
    "the bigger picture",
    "make ends meet",
    "social mobility",
    "the generation gap",
    "public awareness",
    "a safety net",
    "have a voice",
    "the common good"
  ]
} as const;
```

For each phrase, write a plain meaning, a natural IELTS-style example sentence, and a usage warning. Mark slangy or image-heavy expressions such as `packed like sardines`, `a drop in the ocean`, and `burn the candle at both ends` as `ieltsSafety: "risky"` with `riskLevel: "high"`. Use stable IDs like `idiom-hit-the-ground-running`.

- [ ] **Step 5: Re-export the starter idioms from the old content module**

Modify `src/domain/starterContent.ts` so existing imports keep working:

```ts
import type { SpeakingPrompt } from "./types";
export { starterIdioms } from "./idiomDeck";

export const starterPrompts: SpeakingPrompt[] = [
  // keep the existing prompt objects unchanged
];
```

- [ ] **Step 6: Run the deck test and verify it passes**

Run:

```bash
npm run test -- src/domain/idiomDeck.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 7: Commit**

```bash
git add src/domain/types.ts src/domain/idiomDeck.ts src/domain/idiomDeck.test.ts src/domain/starterContent.ts
git commit -m "feat: add IELTS idiom study deck"
```

---

### Task 2: Add Review Scheduler Domain Logic

**Files:**
- Create: `src/domain/reviewScheduler.ts`
- Create: `src/domain/reviewScheduler.test.ts`

- [ ] **Step 1: Write the failing scheduler tests**

Create `src/domain/reviewScheduler.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { starterIdioms } from "./idiomDeck";
import { buildReviewQueue, markIdiomReviewed, normalizeStudyFields } from "./reviewScheduler";
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
});
```

- [ ] **Step 2: Run the scheduler test and verify it fails**

Run:

```bash
npm run test -- src/domain/reviewScheduler.test.ts
```

Expected: FAIL because `reviewScheduler.ts` does not exist yet.

- [ ] **Step 3: Implement scheduler functions**

Create `src/domain/reviewScheduler.ts`:

```ts
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

  return [...filtered].sort((first, second) => score(second, now) - score(first, now)).slice(0, limit);
}

export function markIdiomReviewed(idiom: Idiom, result: ReviewResult, reviewedAt = new Date()): Idiom {
  const normalized = normalizeStudyFields(idiom);
  const nextReviewAt = new Date(reviewedAt.getTime() + delayFor(result, normalized.reviewCount ?? 0));
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
  const dueBonus = !idiom.nextReviewAt || new Date(idiom.nextReviewAt).getTime() <= now.getTime() ? 100 : 0;
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
```

- [ ] **Step 4: Run the scheduler tests and verify they pass**

Run:

```bash
npm run test -- src/domain/reviewScheduler.test.ts
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/domain/reviewScheduler.ts src/domain/reviewScheduler.test.ts
git commit -m "feat: add idiom review scheduler"
```

---

### Task 3: Seed Missing Starter Idioms Without Overwriting Progress

**Files:**
- Modify: `src/storage/repositories.ts`
- Modify: `src/storage/repositories.test.ts`

- [ ] **Step 1: Write the failing repository test**

Add this test to `src/storage/repositories.test.ts`:

```ts
it("adds missing starter idioms without overwriting saved progress", async () => {
  await saveIdiom({
    ...starterIdioms[0],
    reviewCount: 4,
    mistakeCount: 1,
    confidence: "practicing",
    updatedAt: "2026-05-28T12:00:00.000Z"
  });

  const idioms = await listIdioms();
  const preserved = idioms.find((idiom) => idiom.id === starterIdioms[0].id);

  expect(idioms).toHaveLength(starterIdioms.length);
  expect(preserved?.reviewCount).toBe(4);
  expect(preserved?.mistakeCount).toBe(1);
  expect(preserved?.confidence).toBe("practicing");
});
```

- [ ] **Step 2: Run repository tests and verify the new test fails**

Run:

```bash
npm run test -- src/storage/repositories.test.ts
```

Expected: FAIL because current seed logic does not add missing starter idioms when the idiom store already has one item.

- [ ] **Step 3: Update seed logic**

Modify `src/storage/repositories.ts`:

```ts
import { deleteDB } from "idb";
import { starterIdioms } from "../domain/starterContent";
import { normalizeStudyFields } from "../domain/reviewScheduler";
import type { Idiom, PracticeSession } from "../domain/types";
import { getDb, resetDbConnection } from "./db";

let seeded = false;

async function seedIdiomsIfNeeded() {
  if (seeded) {
    return;
  }

  const db = await getDb();
  const existing = await db.getAll("idioms");
  const existingIds = new Set(existing.map((idiom) => idiom.id));
  const missing = starterIdioms.filter((idiom) => !existingIds.has(idiom.id));

  if (missing.length > 0) {
    const tx = db.transaction("idioms", "readwrite");
    await Promise.all(missing.map((idiom) => tx.store.put(normalizeStudyFields(idiom))));
    await tx.done;
  }

  seeded = true;
}

export async function listIdioms() {
  await seedIdiomsIfNeeded();
  const db = await getDb();
  const idioms = await db.getAllFromIndex("idioms", "by-updated");
  return idioms.map(normalizeStudyFields).reverse();
}
```

Keep `saveIdiom`, `listSessions`, `saveSession`, and `clearDatabase` exports as they are.

- [ ] **Step 4: Run repository tests and verify they pass**

Run:

```bash
npm run test -- src/storage/repositories.test.ts
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/storage/repositories.ts src/storage/repositories.test.ts
git commit -m "feat: seed idiom deck without resetting progress"
```

---

### Task 4: Build Recite Page With TDD

**Files:**
- Create: `src/features/recite/RecitePage.tsx`
- Create: `src/features/recite/RecitePage.test.tsx`

- [ ] **Step 1: Write failing Recite page tests**

Create `src/features/recite/RecitePage.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { starterIdioms } from "../../domain/starterContent";
import * as repositories from "../../storage/repositories";
import { RecitePage } from "./RecitePage";

vi.mock("../../storage/repositories");

describe("RecitePage", () => {
  beforeEach(() => {
    vi.mocked(repositories.listIdioms).mockResolvedValue(starterIdioms);
    vi.mocked(repositories.saveIdiom).mockResolvedValue(undefined);
  });

  it("shows a daily review card front and reveals the idiom", async () => {
    const user = userEvent.setup();
    render(<RecitePage />);

    expect(await screen.findByRole("heading", { name: /recite idioms/i })).toBeInTheDocument();
    expect(screen.getByText(starterIdioms[0].meaning)).toBeInTheDocument();
    expect(screen.queryByText(starterIdioms[0].phrase)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reveal idiom/i }));

    expect(screen.getByText(starterIdioms[0].phrase)).toBeInTheDocument();
    expect(screen.getByLabelText(/write your own IELTS-style sentence/i)).toBeInTheDocument();
  });

  it("saves progress and advances after the learner marks a card", async () => {
    const user = userEvent.setup();
    render(<RecitePage />);

    await screen.findByText(starterIdioms[0].meaning);
    await user.click(screen.getByRole("button", { name: /reveal idiom/i }));
    await user.type(
      screen.getByLabelText(/write your own IELTS-style sentence/i),
      "This internship helped me hit the ground running."
    );
    await user.click(screen.getByRole("button", { name: /good/i }));

    await waitFor(() => {
      expect(repositories.saveIdiom).toHaveBeenCalledWith(
        expect.objectContaining({
          id: starterIdioms[0].id,
          reviewCount: 1,
          lastReviewedAt: expect.any(String)
        })
      );
    });
  });

  it("filters topic practice by selected topic", async () => {
    const user = userEvent.setup();
    render(<RecitePage />);

    await screen.findByRole("heading", { name: /recite idioms/i });
    await user.click(screen.getByRole("button", { name: /topic practice/i }));
    await user.selectOptions(screen.getByLabelText(/topic/i), "Health");

    expect(await screen.findByText(/health/i)).toBeInTheDocument();
  });

  it("shows an empty state when no cards are available", async () => {
    vi.mocked(repositories.listIdioms).mockResolvedValue([]);
    render(<RecitePage />);

    expect(await screen.findByText(/no idioms are ready/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the Recite page tests and verify they fail**

Run:

```bash
npm run test -- src/features/recite/RecitePage.test.tsx
```

Expected: FAIL because `RecitePage.tsx` does not exist yet.

- [ ] **Step 3: Implement `RecitePage`**

Create `src/features/recite/RecitePage.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { buildReviewQueue, markIdiomReviewed, type ReviewMode, type ReviewResult } from "../../domain/reviewScheduler";
import type { Idiom } from "../../domain/types";
import { listIdioms, saveIdiom } from "../../storage/repositories";

const topics = [
  "Work and Careers",
  "Education",
  "Technology",
  "Health",
  "Environment",
  "Travel",
  "Relationships",
  "Society"
];

export function RecitePage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [mode, setMode] = useState<ReviewMode>("daily");
  const [topic, setTopic] = useState(topics[0]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sentence, setSentence] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    listIdioms()
      .then(setIdioms)
      .catch(() => setMessage("Could not load reciting cards."));
  }, []);

  const queue = useMemo(
    () =>
      buildReviewQueue(idioms, {
        mode,
        topic,
        limit: 10
      }),
    [idioms, mode, topic]
  );

  const current = queue[cardIndex];

  function resetCardState() {
    setIsRevealed(false);
    setSentence("");
  }

  function changeMode(nextMode: ReviewMode) {
    setMode(nextMode);
    setCardIndex(0);
    resetCardState();
  }

  async function handleMark(result: ReviewResult) {
    if (!current) {
      return;
    }

    setMessage("");
    try {
      const reviewed = markIdiomReviewed(current, result);
      await saveIdiom(reviewed);
      setIdioms((items) => items.map((item) => (item.id === reviewed.id ? reviewed : item)));
      setCardIndex((index) => Math.min(index + 1, Math.max(queue.length - 1, 0)));
      resetCardState();
    } catch {
      setMessage("Could not save review progress.");
    }
  }

  return (
    <section className="content-section recite-section">
      <p className="eyebrow">Active recall</p>
      <h1>Recite idioms</h1>

      <div className="button-row" role="group" aria-label="Recite mode">
        <button aria-current={mode === "daily"} onClick={() => changeMode("daily")}>
          Daily Review
        </button>
        <button aria-current={mode === "topic"} onClick={() => changeMode("topic")}>
          Topic Practice
        </button>
      </div>

      {mode === "topic" && (
        <label className="field">
          Topic
          <select
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setCardIndex(0);
              resetCardState();
            }}
          >
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      )}

      {!current && <p className="status">No idioms are ready for this review.</p>}

      {current && (
        <article className="recite-card">
          <div className="tag-row">
            <span>{current.topics[0]}</span>
            <span>{current.difficulty}</span>
            <span>{current.ieltsSafety}</span>
          </div>
          <h2>{isRevealed ? current.phrase : "What idiom fits this meaning?"}</h2>
          <p>{current.meaning}</p>

          {!isRevealed ? (
            <button className="primary-button" onClick={() => setIsRevealed(true)}>
              Reveal idiom
            </button>
          ) : (
            <div className="recite-answer">
              <p className="feedback-box">{current.example}</p>
              <p className="status">{current.usageWarning}</p>
              <label className="field">
                Write your own IELTS-style sentence
                <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} />
              </label>
              <div className="button-row">
                <button className="secondary-button" onClick={() => handleMark("Again")}>
                  Again
                </button>
                <button className="secondary-button" onClick={() => handleMark("Hard")}>
                  Hard
                </button>
                <button className="primary-button" onClick={() => handleMark("Good")}>
                  Good
                </button>
              </div>
            </div>
          )}
        </article>
      )}

      {message && <p className="status error">{message}</p>}
    </section>
  );
}
```

- [ ] **Step 4: Run the Recite page tests and verify they pass**

Run:

```bash
npm run test -- src/features/recite/RecitePage.test.tsx
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/recite/RecitePage.tsx src/features/recite/RecitePage.test.tsx
git commit -m "feat: build idiom reciting page"
```

---

### Task 5: Wire Navigation, Styling, And README

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`
- Modify: `src/styles.css`
- Modify: `README.md`

- [ ] **Step 1: Write the failing navigation test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { starterIdioms } from "./domain/starterContent";
import App from "./App";
import * as repositories from "./storage/repositories";

vi.mock("./storage/repositories");
vi.mock("./api/aiClient");
vi.mock("./features/practice/useRecorder", () => ({
  useRecorder: () => ({
    status: "stopped",
    error: "",
    recording: null,
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn()
  })
}));

describe("App", () => {
  beforeEach(() => {
    vi.mocked(repositories.listIdioms).mockResolvedValue(starterIdioms);
    vi.mocked(repositories.listSessions).mockResolvedValue([]);
    vi.mocked(repositories.saveIdiom).mockResolvedValue(undefined);
  });

  it("navigates to the Recite page", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /recite/i }));

    expect(await screen.findByRole("heading", { name: /recite idioms/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the App test and verify it fails**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: FAIL because the Recite navigation button is not wired yet.

- [ ] **Step 3: Wire `RecitePage` into the app**

Modify `src/App.tsx`:

```tsx
import { useState } from "react";
import { HistoryPage } from "./features/history/HistoryPage";
import { IdiomBankPage } from "./features/idiom-bank/IdiomBankPage";
import { PracticePage } from "./features/practice/PracticePage";
import { RecitePage } from "./features/recite/RecitePage";

type View = "practice" | "recite" | "idioms" | "history";

export default function App() {
  const [view, setView] = useState<View>("practice");

  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <strong>IELTS Idiom Coach</strong>
        <div>
          <button aria-current={view === "practice"} onClick={() => setView("practice")}>
            Practice
          </button>
          <button aria-current={view === "recite"} onClick={() => setView("recite")}>
            Recite
          </button>
          <button aria-current={view === "idioms"} onClick={() => setView("idioms")}>
            Idiom Bank
          </button>
          <button aria-current={view === "history"} onClick={() => setView("history")}>
            History
          </button>
        </div>
      </nav>
      {view === "practice" && <PracticePage />}
      {view === "recite" && <RecitePage />}
      {view === "idioms" && <IdiomBankPage />}
      {view === "history" && <HistoryPage />}
    </main>
  );
}
```

- [ ] **Step 4: Add recite styling**

Append to `src/styles.css`:

```css
.recite-section {
  width: min(840px, calc(100% - 32px));
  margin: 36px auto 64px;
}

.recite-card {
  display: grid;
  gap: 16px;
  border: 1px solid #d9dfeb;
  border-radius: 8px;
  margin-top: 22px;
  padding: 22px;
  background: #fff;
}

.recite-card h2 {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row span {
  border: 1px solid #c9d1df;
  border-radius: 999px;
  padding: 4px 10px;
  color: #34415a;
  background: #eef3fb;
  font-size: 0.9rem;
  font-weight: 700;
}

.recite-answer {
  display: grid;
  gap: 12px;
}
```

- [ ] **Step 5: Update README**

Modify the first paragraph of `README.md`:

```md
Local-first web app for IELTS Speaking learners who want to recite idioms, practice topic vocabulary, record answers, and review idiom feedback.
```

- [ ] **Step 6: Run the navigation test and verify it passes**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: PASS with 1 test.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/styles.css README.md
git commit -m "feat: add recite navigation"
```

---

### Task 6: Full Verification And Browser QA

**Files:**
- No planned source edits unless verification reveals a defect.

- [ ] **Step 1: Run the full project check**

Run:

```bash
npm run check
```

Expected: typecheck passes, Vitest reports all tests passing, and Vite build exits 0.

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Vite serves `http://127.0.0.1:5173/` and the API serves `http://127.0.0.1:8787/`.

- [ ] **Step 3: Verify Recite in the browser**

Open `http://127.0.0.1:5173/` in the in-app browser and verify:

- navigation shows `Practice`, `Recite`, `Idiom Bank`, and `History`,
- clicking `Recite` shows the `Recite idioms` heading,
- a daily review card shows a meaning before the idiom phrase,
- `Reveal idiom` shows the phrase, model example, warning, textarea, and mark buttons,
- typing an IELTS-style sentence and clicking `Good` advances the card,
- `Topic Practice` plus topic selection changes the card topic.

- [ ] **Step 4: Stop the dev server after QA**

Send Ctrl-C to the dev server session.

Expected: no listeners remain on `127.0.0.1:5173` or `127.0.0.1:8787`.

- [ ] **Step 5: Check final git status**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/ielts-idioms-app` with a clean working tree, apart from ignored `dist/`, `node_modules/`, or local temp files.

