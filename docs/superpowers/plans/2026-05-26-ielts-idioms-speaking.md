# IELTS Idioms Speaking App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first IELTS Speaking idioms practice web app where users choose a prompt, select idioms, record an answer, receive AI feedback, and save sessions locally.

**Architecture:** Use a React + TypeScript single-page app for the learning experience, IndexedDB for local idioms/sessions/audio, and a small Node API proxy for OpenAI calls so API keys do not enter the browser. The AI flow uses a transcription-first feedback pipeline: upload recorded audio to the API, transcribe it, then request structured idiom feedback.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, IndexedDB via `idb`, Express, Multer, Zod, OpenAI Node SDK, `tsx`.

---

## Source Documents

- Design spec: `docs/superpowers/specs/2026-05-26-ielts-idioms-speaking-design.md`
- OpenAI Responses API: `https://platform.openai.com/docs/api-reference/responses`
- OpenAI Structured Outputs guide: `https://platform.openai.com/docs/guides/structured-outputs`
- OpenAI Speech-to-Text guide: `https://platform.openai.com/docs/guides/speech-to-text`
- OpenAI Models guide: `https://platform.openai.com/docs/models`

## Scope Check

The spec describes one coherent MVP, not separate independent products. This single plan covers the SPA scaffold, local data layer, recording lifecycle, AI API proxy, main screens, and verification.

## File Structure

Create these files:

- `package.json` - scripts and package metadata.
- `index.html` - Vite entry document.
- `tsconfig.json` - TypeScript project references.
- `tsconfig.app.json` - browser TypeScript settings.
- `tsconfig.node.json` - Node/server TypeScript settings.
- `vite.config.ts` - Vite dev server, API proxy, and React plugin.
- `vitest.config.ts` - Vitest browser-like test environment.
- `src/main.tsx` - React entry point.
- `src/App.tsx` - app shell, navigation, shared state loading.
- `src/styles.css` - production UI styles.
- `src/test/setup.ts` - Testing Library and IndexedDB test setup.
- `src/domain/types.ts` - core domain types.
- `src/domain/starterContent.ts` - built-in IELTS prompts and idioms.
- `src/domain/feedbackSchema.ts` - Zod schema for AI feedback parsing.
- `src/storage/db.ts` - IndexedDB connection.
- `src/storage/repositories.ts` - idiom and session persistence.
- `src/api/aiClient.ts` - browser client for API proxy.
- `src/features/practice/useRecorder.ts` - microphone recording hook.
- `src/features/practice/PracticePage.tsx` - guided speaking flow.
- `src/features/idiom-bank/IdiomBankPage.tsx` - personal idiom bank.
- `src/features/history/HistoryPage.tsx` - saved session log.
- `server/index.ts` - Express server startup.
- `server/routes.ts` - API routes with injectable AI service.
- `server/openaiService.ts` - OpenAI transcription, generation, and feedback service.
- `server/types.ts` - server-side request and response types.

Tests:

- `src/domain/feedbackSchema.test.ts`
- `src/storage/repositories.test.ts`
- `src/api/aiClient.test.ts`
- `src/features/practice/useRecorder.test.tsx`
- `src/features/practice/PracticePage.test.tsx`
- `src/features/idiom-bank/IdiomBankPage.test.tsx`
- `src/features/history/HistoryPage.test.tsx`
- `server/routes.test.ts`

## Task 1: Scaffold The App And Test Harness

**Files:**

- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "ielts-idioms-speaking",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:web\"",
    "dev:web": "vite --host 127.0.0.1",
    "dev:api": "tsx watch server/index.ts",
    "typecheck": "tsc -b",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "check": "npm run typecheck && npm run test && npm run build"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install react react-dom idb zod express cors dotenv multer openai
npm install -D @vitejs/plugin-react vite typescript vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event fake-indexeddb tsx supertest @types/node @types/react @types/react-dom @types/express @types/cors @types/multer @types/supertest concurrently
```

Expected: `package-lock.json` is created and `package.json` now contains `dependencies` and `devDependencies`.

- [ ] **Step 3: Create TypeScript and Vite configuration**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["vite.config.ts", "vitest.config.ts", "server/**/*.ts"]
}
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8787"
    }
  }
});
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true
  }
});
```

- [ ] **Step 4: Create the initial React entry point**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IELTS Idiom Speaking Coach</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { vi } from "vitest";

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  value: vi.fn(() => "blob:test-recording")
});

Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  value: vi.fn()
});
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">IELTS Speaking</p>
        <h1>Practice idioms in real answers.</h1>
        <p>
          Choose a prompt, prepare a few natural expressions, record your answer,
          and review feedback that keeps idioms useful instead of forced.
        </p>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #172033;
  background: #f7f4ef;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
}

.hero {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: 72px 0;
}

.eyebrow {
  margin: 0 0 12px;
  color: #5d6c89;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  max-width: 680px;
  margin: 0 0 18px;
  font-size: clamp(2.2rem, 5vw, 4.5rem);
  line-height: 0.95;
}

p {
  max-width: 660px;
  margin: 0;
  color: #47536b;
  font-size: 1.06rem;
}
```

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: all three commands finish with exit code `0`; Vitest reports no tests found or an empty passing suite depending on installed Vitest behavior.

- [ ] **Step 6: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts vitest.config.ts src
git commit -m "feat: scaffold IELTS idioms app"
```

## Task 2: Add Domain Types, Starter Content, And Feedback Parsing

**Files:**

- Create: `src/domain/types.ts`
- Create: `src/domain/starterContent.ts`
- Create: `src/domain/feedbackSchema.ts`
- Test: `src/domain/feedbackSchema.test.ts`

- [ ] **Step 1: Write feedback schema tests**

Create `src/domain/feedbackSchema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- src/domain/feedbackSchema.test.ts
```

Expected: FAIL because `src/domain/feedbackSchema.ts` does not exist.

- [ ] **Step 3: Implement domain types and feedback parsing**

Create `src/domain/types.ts`:

```ts
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
```

Create `src/domain/feedbackSchema.ts`:

```ts
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
```

Create `src/domain/starterContent.ts`:

```ts
import type { Idiom, SpeakingPrompt } from "./types";

const now = "2026-05-26T00:00:00.000Z";

export const starterPrompts: SpeakingPrompt[] = [
  {
    id: "prompt-work-part2",
    ieltsPart: "Part 2",
    topic: "Work and Careers",
    prompt:
      "Describe a skill you learned that was useful for your work or studies. You should say what the skill was, how you learned it, why it was useful, and how you felt about learning it."
  },
  {
    id: "prompt-technology-part3",
    ieltsPart: "Part 3",
    topic: "Technology",
    prompt:
      "Do you think technology has changed the way people communicate at work? Why or why not?"
  },
  {
    id: "prompt-education-part2",
    ieltsPart: "Part 2",
    topic: "Education",
    prompt:
      "Describe a teacher who influenced you. You should say who the teacher was, what they taught, what made them special, and how they influenced you."
  }
];

export const starterIdioms: Idiom[] = [
  {
    id: "idiom-steep-learning-curve",
    phrase: "a steep learning curve",
    meaning: "a situation where someone has to learn many difficult things quickly",
    topics: ["Work and Careers", "Education"],
    formality: "neutral",
    riskLevel: "low",
    example:
      "My first internship had a steep learning curve, but it helped me become more confident.",
    usageWarning: "Use it for a challenging learning experience, not for every small difficulty.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "idiom-on-the-same-wavelength",
    phrase: "on the same wavelength",
    meaning: "sharing a similar way of thinking or understanding",
    topics: ["Work and Careers", "Relationships", "Technology"],
    formality: "neutral",
    riskLevel: "low",
    example:
      "Video calls help remote teams stay on the same wavelength when projects move quickly.",
    usageWarning: "Best for people or teams, not objects or abstract systems.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "idiom-break-the-ice",
    phrase: "break the ice",
    meaning: "make people feel more comfortable at the start of a conversation",
    topics: ["Relationships", "Work and Careers", "Education"],
    formality: "casual",
    riskLevel: "medium",
    example:
      "Group activities can break the ice and make new students feel less nervous.",
    usageWarning: "Safe in informal examples, but avoid using it repeatedly in one answer.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  }
];
```

- [ ] **Step 4: Run domain tests**

Run:

```bash
npm run test -- src/domain/feedbackSchema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit domain layer**

Run:

```bash
git add src/domain
git commit -m "feat: add IELTS idiom domain model"
```

## Task 3: Add IndexedDB Persistence

**Files:**

- Create: `src/storage/db.ts`
- Create: `src/storage/repositories.ts`
- Test: `src/storage/repositories.test.ts`

- [ ] **Step 1: Write persistence tests**

Create `src/storage/repositories.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { starterIdioms } from "../domain/starterContent";
import type { PracticeSession } from "../domain/types";
import { clearDatabase, listIdioms, listSessions, saveIdiom, saveSession } from "./repositories";

describe("repositories", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("seeds starter idioms when the bank is empty", async () => {
    const idioms = await listIdioms();

    expect(idioms.map((idiom) => idiom.id)).toEqual(
      starterIdioms.map((idiom) => idiom.id)
    );
  });

  it("saves user idioms after starter idioms", async () => {
    await saveIdiom({
      ...starterIdioms[0],
      id: "user-idiom-1",
      phrase: "hit the ground running",
      source: "user"
    });

    const idioms = await listIdioms();

    expect(idioms.some((idiom) => idiom.id === "user-idiom-1")).toBe(true);
  });

  it("persists a practice session with audio blob", async () => {
    const session: PracticeSession = {
      id: "session-1",
      ieltsPart: "Part 2",
      topic: "Work and Careers",
      prompt: "Describe a skill you learned.",
      selectedIdiomIds: ["idiom-steep-learning-curve"],
      recordingBlob: new Blob(["audio"], { type: "audio/webm" }),
      recordingDuration: 42,
      feedbackStatus: "failed",
      createdAt: "2026-05-26T00:00:00.000Z",
      updatedAt: "2026-05-26T00:00:00.000Z"
    };

    await saveSession(session);
    const sessions = await listSessions();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].recordingBlob.type).toBe("audio/webm");
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm run test -- src/storage/repositories.test.ts
```

Expected: FAIL because storage modules do not exist.

- [ ] **Step 3: Implement IndexedDB connection and repositories**

Create `src/storage/db.ts`:

```ts
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Idiom, PracticeSession } from "../domain/types";

interface IeltsCoachDb extends DBSchema {
  idioms: {
    key: string;
    value: Idiom;
    indexes: {
      "by-updated": string;
    };
  };
  sessions: {
    key: string;
    value: PracticeSession;
    indexes: {
      "by-created": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<IeltsCoachDb>> | undefined;

export function getDb() {
  dbPromise ??= openDB<IeltsCoachDb>("ielts-idioms-speaking", 1, {
    upgrade(db) {
      const idioms = db.createObjectStore("idioms", { keyPath: "id" });
      idioms.createIndex("by-updated", "updatedAt");

      const sessions = db.createObjectStore("sessions", { keyPath: "id" });
      sessions.createIndex("by-created", "createdAt");
    }
  });

  return dbPromise;
}

export async function resetDbConnection() {
  const db = await getDb();
  db.close();
  dbPromise = undefined;
}
```

Create `src/storage/repositories.ts`:

```ts
import { deleteDB } from "idb";
import { starterIdioms } from "../domain/starterContent";
import type { Idiom, PracticeSession } from "../domain/types";
import { getDb, resetDbConnection } from "./db";

let seeded = false;

async function seedIdiomsIfNeeded() {
  if (seeded) {
    return;
  }

  const db = await getDb();
  const count = await db.count("idioms");

  if (count === 0) {
    const tx = db.transaction("idioms", "readwrite");
    await Promise.all(starterIdioms.map((idiom) => tx.store.put(idiom)));
    await tx.done;
  }

  seeded = true;
}

export async function listIdioms() {
  await seedIdiomsIfNeeded();
  const db = await getDb();
  const idioms = await db.getAllFromIndex("idioms", "by-updated");
  return idioms.reverse();
}

export async function saveIdiom(idiom: Idiom) {
  const db = await getDb();
  await db.put("idioms", idiom);
}

export async function listSessions() {
  const db = await getDb();
  const sessions = await db.getAllFromIndex("sessions", "by-created");
  return sessions.reverse();
}

export async function saveSession(session: PracticeSession) {
  const db = await getDb();
  await db.put("sessions", session);
}

export async function clearDatabase() {
  const db = await getDb();
  db.close();
  await deleteDB("ielts-idioms-speaking");
  seeded = false;
  await resetDbConnection();
}
```

- [ ] **Step 4: Run persistence tests**

Run:

```bash
npm run test -- src/storage/repositories.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit persistence**

Run:

```bash
git add src/storage
git commit -m "feat: persist idioms and sessions locally"
```

## Task 4: Add API Client And OpenAI Proxy

**Files:**

- Create: `src/api/aiClient.ts`
- Test: `src/api/aiClient.test.ts`
- Create: `server/types.ts`
- Create: `server/routes.ts`
- Create: `server/openaiService.ts`
- Create: `server/index.ts`
- Test: `server/routes.test.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Write browser API client tests**

Create `src/api/aiClient.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { generateIdioms, requestFeedback } from "./aiClient";

describe("aiClient", () => {
  it("posts topic context to generate idioms", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        idioms: [
          {
            phrase: "a steep learning curve",
            meaning: "a hard learning process",
            topics: ["Education"],
            formality: "neutral",
            riskLevel: "low",
            example: "University was a steep learning curve.",
            usageWarning: "Use for serious learning challenges."
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateIdioms({ topic: "Education", ieltsPart: "Part 2" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/idioms/generate",
      expect.objectContaining({ method: "POST" })
    );
    expect(result[0].phrase).toBe("a steep learning curve");
  });

  it("uploads audio and selected idioms for feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        feedback: {
          naturalUsage: [],
          forcedUsage: [],
          betterAlternatives: [],
          improvedSampleSentence: "",
          nextStep: "Try again with one idiom.",
          transcript: "My course had a steep learning curve."
        }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestFeedback({
      recordingBlob: new Blob(["audio"], { type: "audio/webm" }),
      ieltsPart: "Part 2",
      topic: "Education",
      prompt: "Describe a teacher.",
      selectedIdioms: ["a steep learning curve"]
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(result.nextStep).toContain("one idiom");
  });
});
```

- [ ] **Step 2: Write server route tests**

Create `server/routes.test.ts`:

```ts
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApiRouter } from "./routes";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createApiRouter({
      generateIdioms: async () => ({
        idioms: [
          {
            phrase: "on the same wavelength",
            meaning: "thinking similarly",
            topics: ["Work and Careers"],
            formality: "neutral",
            riskLevel: "low",
            example: "The team stayed on the same wavelength.",
            usageWarning: "Use for people or teams."
          }
        ]
      }),
      reviewRecording: async () => ({
        feedback: {
          naturalUsage: ["The idiom sounded natural."],
          forcedUsage: [],
          betterAlternatives: [],
          improvedSampleSentence: "Our team stayed on the same wavelength during the project.",
          nextStep: "Keep using one idiom per answer.",
          transcript: "Our team stayed on the same wavelength."
        }
      })
    })
  );
  return app;
}

describe("api routes", () => {
  it("generates idioms", async () => {
    const response = await request(createTestApp())
      .post("/api/idioms/generate")
      .send({ topic: "Work and Careers", ieltsPart: "Part 3" })
      .expect(200);

    expect(response.body.idioms[0].phrase).toBe("on the same wavelength");
  });

  it("rejects feedback requests without audio", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback")
      .field("topic", "Work and Careers")
      .expect(400);

    expect(response.body.error).toBe("Recording file is required.");
  });

  it("returns feedback for uploaded audio", async () => {
    const response = await request(createTestApp())
      .post("/api/feedback")
      .field("ieltsPart", "Part 2")
      .field("topic", "Work and Careers")
      .field("prompt", "Describe a project.")
      .field("selectedIdioms", JSON.stringify(["on the same wavelength"]))
      .attach("recording", Buffer.from("audio"), {
        filename: "answer.webm",
        contentType: "audio/webm"
      })
      .expect(200);

    expect(response.body.feedback.naturalUsage).toEqual(["The idiom sounded natural."]);
  });
});
```

- [ ] **Step 3: Run failing API tests**

Run:

```bash
npm run test -- src/api/aiClient.test.ts server/routes.test.ts
```

Expected: FAIL because API client and server modules do not exist.

- [ ] **Step 4: Implement browser API client**

Create `src/api/aiClient.ts`:

```ts
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
```

- [ ] **Step 5: Implement server routes and OpenAI service**

Create `server/types.ts`:

```ts
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
```

Create `server/routes.ts`:

```ts
import { Router } from "express";
import multer from "multer";
import type { IeltsPart } from "../src/domain/types";
import type { AiService } from "./types";

const upload = multer({ dest: "tmp/uploads" });

export function createApiRouter(aiService: AiService) {
  const router = Router();

  router.post("/idioms/generate", async (req, res) => {
    try {
      const { topic, ieltsPart } = req.body as { topic?: string; ieltsPart?: string };

      if (!topic || !ieltsPart) {
        res.status(400).json({ error: "Topic and IELTS part are required." });
        return;
      }

      const result = await aiService.generateIdioms({
        topic,
        ieltsPart: ieltsPart as IeltsPart
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Idiom generation failed." });
    }
  });

  router.post("/feedback", upload.single("recording"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Recording file is required." });
        return;
      }

      const selectedIdioms = JSON.parse(String(req.body.selectedIdioms ?? "[]")) as string[];
      const result = await aiService.reviewRecording({
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        ieltsPart: req.body.ieltsPart,
        topic: req.body.topic,
        prompt: req.body.prompt,
        selectedIdioms
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Feedback failed." });
    }
  });

  return router;
}
```

Create `server/openaiService.ts`:

```ts
import fs from "node:fs";
import { unlink } from "node:fs/promises";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
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
```

Create `server/index.ts`:

```ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { mkdirSync } from "node:fs";
import { createApiRouter } from "./routes";
import { openAiService } from "./openaiService";

dotenv.config();
mkdirSync("tmp/uploads", { recursive: true });

const app = express();
const port = Number(process.env.API_PORT ?? 8787);

app.use(cors({ origin: "http://127.0.0.1:5173" }));
app.use(express.json());
app.use("/api", createApiRouter(openAiService));

app.listen(port, "127.0.0.1", () => {
  console.log(`IELTS idioms API listening on http://127.0.0.1:${port}`);
});
```

Modify `.gitignore`:

```gitignore
.superpowers/
node_modules/
dist/
.env
tmp/
```

- [ ] **Step 6: Run API tests**

Run:

```bash
npm run test -- src/api/aiClient.test.ts server/routes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit API layer**

Run:

```bash
git add .gitignore src/api server
git commit -m "feat: add AI API proxy"
```

## Task 5: Add Browser Recording Hook

**Files:**

- Create: `src/features/practice/useRecorder.ts`
- Test: `src/features/practice/useRecorder.test.tsx`

- [ ] **Step 1: Write recording hook tests**

Create `src/features/practice/useRecorder.test.tsx`:

```tsx
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRecorder } from "./useRecorder";

class FakeMediaRecorder extends EventTarget {
  static isTypeSupported = vi.fn(() => true);
  state: RecordingState = "inactive";
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) } as BlobEvent);
    this.onstop?.();
  }
}

describe("useRecorder", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      }
    });
  });

  it("records an audio blob", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("recording");

    await act(async () => {
      result.current.stop();
    });

    expect(result.current.status).toBe("stopped");
    expect(result.current.recording?.blob.type).toBe("audio/webm");
  });

  it("reports unsupported browsers", async () => {
    vi.stubGlobal("MediaRecorder", undefined);
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("This browser does not support audio recording.");
  });
});
```

- [ ] **Step 2: Run failing recording tests**

Run:

```bash
npm run test -- src/features/practice/useRecorder.test.tsx
```

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement recording hook**

Create `src/features/practice/useRecorder.ts`:

```ts
import { useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopped" | "error";

export interface RecordedAnswer {
  blob: Blob;
  url: string;
  duration: number;
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState<RecordedAnswer | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  async function start() {
    setError("");

    if (typeof MediaRecorder === "undefined") {
      setStatus("error");
      setError("This browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      startedAtRef.current = Date.now();
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm"
        });
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        setRecording({
          blob,
          duration,
          url: URL.createObjectURL(blob)
        });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setStatus("stopped");
      };

      recorder.start();
      setStatus("recording");
    } catch {
      setStatus("error");
      setError("Microphone permission was denied or recording could not start.");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function reset() {
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setStatus("idle");
    setError("");
  }

  return {
    status,
    error,
    recording,
    start,
    stop,
    reset
  };
}
```

- [ ] **Step 4: Run recording tests**

Run:

```bash
npm run test -- src/features/practice/useRecorder.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit recording hook**

Run:

```bash
git add src/features/practice/useRecorder.ts src/features/practice/useRecorder.test.tsx
git commit -m "feat: add browser recording hook"
```

## Task 6: Build The Guided Practice Screen

**Files:**

- Create: `src/features/practice/PracticePage.tsx`
- Test: `src/features/practice/PracticePage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write Practice page tests**

Create `src/features/practice/PracticePage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { starterIdioms, starterPrompts } from "../../domain/starterContent";
import * as repositories from "../../storage/repositories";
import * as aiClient from "../../api/aiClient";
import { PracticePage } from "./PracticePage";

vi.mock("../../storage/repositories");
vi.mock("../../api/aiClient");
vi.mock("./useRecorder", () => ({
  useRecorder: () => ({
    status: "stopped",
    error: "",
    recording: {
      blob: new Blob(["audio"], { type: "audio/webm" }),
      duration: 34,
      url: "blob:recording"
    },
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn()
  })
}));

describe("PracticePage", () => {
  beforeEach(() => {
    vi.mocked(repositories.listIdioms).mockResolvedValue(starterIdioms);
    vi.mocked(repositories.saveSession).mockResolvedValue(undefined);
    vi.mocked(aiClient.requestFeedback).mockResolvedValue({
      naturalUsage: ["Good use of a steep learning curve."],
      forcedUsage: [],
      betterAlternatives: [],
      improvedSampleSentence: "The course had a steep learning curve.",
      nextStep: "Use one idiom in the next answer.",
      transcript: "The course had a steep learning curve."
    });
  });

  it("shows a prompt and starter idioms", async () => {
    render(<PracticePage />);

    expect(await screen.findByText(starterPrompts[0].topic)).toBeInTheDocument();
    expect(screen.getByText("a steep learning curve")).toBeInTheDocument();
  });

  it("saves a reviewed session after feedback", async () => {
    const user = userEvent.setup();
    render(<PracticePage />);

    await screen.findByText("a steep learning curve");
    await user.click(screen.getByRole("checkbox", { name: /a steep learning curve/i }));
    await user.click(screen.getByRole("button", { name: /get feedback/i }));

    expect(aiClient.requestFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedIdioms: ["a steep learning curve"]
      })
    );
    expect(repositories.saveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbackStatus: "complete",
        selectedIdiomIds: ["idiom-steep-learning-curve"]
      })
    );
  });
});
```

- [ ] **Step 2: Run failing Practice tests**

Run:

```bash
npm run test -- src/features/practice/PracticePage.test.tsx
```

Expected: FAIL because `PracticePage.tsx` does not exist.

- [ ] **Step 3: Implement Practice page and app navigation**

Create `src/features/practice/PracticePage.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { generateIdioms, requestFeedback, type GeneratedIdiomPayload } from "../../api/aiClient";
import { starterPrompts } from "../../domain/starterContent";
import type { Idiom, SpeakingPrompt } from "../../domain/types";
import { listIdioms, saveIdiom, saveSession } from "../../storage/repositories";
import { useRecorder } from "./useRecorder";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function generatedToIdiom(payload: GeneratedIdiomPayload, topic: string): Idiom {
  const timestamp = now();
  return {
    id: createId("idiom"),
    phrase: payload.phrase,
    meaning: payload.meaning,
    topics: payload.topics.length ? payload.topics : [topic],
    formality: payload.formality,
    riskLevel: payload.riskLevel,
    example: payload.example,
    usageWarning: payload.usageWarning,
    source: "ai",
    confidence: "new",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function PracticePage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState(starterPrompts[0].id);
  const [selectedIdiomIds, setSelectedIdiomIds] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRecorder();

  const prompt = useMemo<SpeakingPrompt>(
    () => starterPrompts.find((item) => item.id === selectedPromptId) ?? starterPrompts[0],
    [selectedPromptId]
  );

  useEffect(() => {
    listIdioms().then(setIdioms).catch(() => setMessage("Could not load idioms."));
  }, []);

  const topicIdioms = idioms.filter((idiom) => idiom.topics.includes(prompt.topic));
  const selectedIdioms = idioms.filter((idiom) => selectedIdiomIds.includes(idiom.id));

  function toggleIdiom(id: string) {
    setSelectedIdiomIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function handleGenerateIdioms() {
    setIsGenerating(true);
    setMessage("");
    try {
      const generated = await generateIdioms({
        topic: prompt.topic,
        ieltsPart: prompt.ieltsPart
      });
      const newIdioms = generated.map((item) => generatedToIdiom(item, prompt.topic));
      await Promise.all(newIdioms.map(saveIdiom));
      setIdioms(await listIdioms());
      setMessage(`Saved ${newIdioms.length} generated idioms.`);
    } catch {
      setMessage("Could not generate idioms right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFeedback() {
    if (!recorder.recording) {
      setMessage("Record an answer before requesting feedback.");
      return;
    }

    setIsFeedbackLoading(true);
    setFeedbackText("");
    setMessage("");

    const sessionBase = {
      id: createId("session"),
      ieltsPart: prompt.ieltsPart,
      topic: prompt.topic,
      prompt: prompt.prompt,
      selectedIdiomIds,
      recordingBlob: recorder.recording.blob,
      recordingDuration: recorder.recording.duration,
      createdAt: now(),
      updatedAt: now()
    };

    try {
      const feedback = await requestFeedback({
        recordingBlob: recorder.recording.blob,
        ieltsPart: prompt.ieltsPart,
        topic: prompt.topic,
        prompt: prompt.prompt,
        selectedIdioms: selectedIdioms.map((idiom) => idiom.phrase)
      });
      await saveSession({
        ...sessionBase,
        feedbackStatus: "complete",
        feedback
      });
      setFeedbackText(feedback.nextStep);
      setMessage("Session saved with feedback.");
    } catch {
      await saveSession({
        ...sessionBase,
        feedbackStatus: "failed"
      });
      setMessage("Feedback failed. The recording was saved and can be reviewed later.");
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  return (
    <section className="page-grid">
      <div className="practice-panel">
        <p className="eyebrow">Guided practice</p>
        <h1>Record an answer with 2-3 natural idioms.</h1>
        <label className="field">
          Prompt
          <select
            value={selectedPromptId}
            onChange={(event) => {
              setSelectedPromptId(event.target.value);
              setSelectedIdiomIds([]);
              setFeedbackText("");
            }}
          >
            {starterPrompts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.topic} - {item.ieltsPart}
              </option>
            ))}
          </select>
        </label>
        <article className="prompt-card">
          <strong>{prompt.topic}</strong>
          <p>{prompt.prompt}</p>
        </article>
        <div className="button-row">
          {recorder.status !== "recording" ? (
            <button className="primary-button" onClick={recorder.start}>
              Start recording
            </button>
          ) : (
            <button className="danger-button" onClick={recorder.stop}>
              Stop recording
            </button>
          )}
          <button
            className="secondary-button"
            disabled={isFeedbackLoading}
            onClick={handleFeedback}
          >
            {isFeedbackLoading ? "Reviewing..." : "Get feedback"}
          </button>
        </div>
        {recorder.error && <p className="status error">{recorder.error}</p>}
        {recorder.recording && (
          <audio aria-label="Recorded answer playback" controls src={recorder.recording.url} />
        )}
        {message && <p className="status">{message}</p>}
        {feedbackText && <p className="feedback-box">{feedbackText}</p>}
      </div>

      <aside className="idiom-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Prep</p>
            <h2>Topic idioms</h2>
          </div>
          <button className="secondary-button" disabled={isGenerating} onClick={handleGenerateIdioms}>
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
        <div className="idiom-list">
          {topicIdioms.map((idiom) => (
            <label key={idiom.id} className="idiom-choice">
              <input
                type="checkbox"
                checked={selectedIdiomIds.includes(idiom.id)}
                onChange={() => toggleIdiom(idiom.id)}
              />
              <span>
                <strong>{idiom.phrase}</strong>
                <small>{idiom.meaning}</small>
              </span>
            </label>
          ))}
        </div>
      </aside>
    </section>
  );
}
```

Modify `src/App.tsx`:

```tsx
import { useState } from "react";
import { HistoryPage } from "./features/history/HistoryPage";
import { IdiomBankPage } from "./features/idiom-bank/IdiomBankPage";
import { PracticePage } from "./features/practice/PracticePage";

type View = "practice" | "idioms" | "history";

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
          <button aria-current={view === "idioms"} onClick={() => setView("idioms")}>
            Idiom Bank
          </button>
          <button aria-current={view === "history"} onClick={() => setView("history")}>
            History
          </button>
        </div>
      </nav>
      {view === "practice" && <PracticePage />}
      {view === "idioms" && <IdiomBankPage />}
      {view === "history" && <HistoryPage />}
    </main>
  );
}
```

Add temporary compile-only screens so `App.tsx` compiles until Tasks 7 and 8 replace them:

Create `src/features/idiom-bank/IdiomBankPage.tsx`:

```tsx
export function IdiomBankPage() {
  return <section className="content-section">Idiom bank is ready for implementation.</section>;
}
```

Create `src/features/history/HistoryPage.tsx`:

```tsx
export function HistoryPage() {
  return <section className="content-section">History is ready for implementation.</section>;
}
```

Append to `src/styles.css`:

```css
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0;
}

.top-nav div,
.button-row,
.panel-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-nav button,
.secondary-button,
.primary-button,
.danger-button {
  border: 1px solid #c9d1df;
  border-radius: 8px;
  padding: 10px 14px;
  color: #172033;
  background: #fffdfa;
}

.top-nav button[aria-current="true"],
.primary-button {
  color: #fff;
  border-color: #254f8f;
  background: #254f8f;
}

.danger-button {
  color: #fff;
  border-color: #a13838;
  background: #a13838;
}

.page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
  gap: 28px;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 36px 0 64px;
}

.practice-panel,
.idiom-panel,
.content-section {
  border: 1px solid #d9dfeb;
  border-radius: 8px;
  padding: 24px;
  background: #fffdfa;
}

.field {
  display: grid;
  gap: 8px;
  margin: 22px 0;
  color: #34415a;
  font-weight: 700;
}

.field select,
.field input,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #c9d1df;
  border-radius: 8px;
  padding: 12px;
  color: #172033;
  background: #fff;
}

.prompt-card,
.feedback-box {
  border-left: 4px solid #254f8f;
  margin: 18px 0;
  padding: 16px;
  background: #eef3fb;
}

.idiom-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.idiom-choice {
  display: flex;
  gap: 10px;
  border: 1px solid #d9dfeb;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.idiom-choice small {
  display: block;
  color: #5d6c89;
}

.status {
  margin-top: 12px;
  color: #47536b;
}

.status.error {
  color: #a13838;
}

audio {
  display: block;
  width: 100%;
  margin-top: 16px;
}

@media (max-width: 820px) {
  .top-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run Practice tests**

Run:

```bash
npm run test -- src/features/practice/PracticePage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Practice screen**

Run:

```bash
git add src/App.tsx src/styles.css src/features
git commit -m "feat: build guided speaking practice"
```

## Task 7: Build Idiom Bank

**Files:**

- Modify: `src/features/idiom-bank/IdiomBankPage.tsx`
- Test: `src/features/idiom-bank/IdiomBankPage.test.tsx`

- [ ] **Step 1: Write Idiom Bank tests**

Create `src/features/idiom-bank/IdiomBankPage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { starterIdioms } from "../../domain/starterContent";
import * as repositories from "../../storage/repositories";
import { IdiomBankPage } from "./IdiomBankPage";

vi.mock("../../storage/repositories");

describe("IdiomBankPage", () => {
  beforeEach(() => {
    vi.mocked(repositories.listIdioms).mockResolvedValue(starterIdioms);
    vi.mocked(repositories.saveIdiom).mockResolvedValue(undefined);
  });

  it("lists saved idioms", async () => {
    render(<IdiomBankPage />);

    expect(await screen.findByText("a steep learning curve")).toBeInTheDocument();
    expect(screen.getByText(/challenging learning experience/i)).toBeInTheDocument();
  });

  it("adds a user idiom", async () => {
    const user = userEvent.setup();
    render(<IdiomBankPage />);

    await user.type(screen.getByLabelText(/phrase/i), "hit the ground running");
    await user.type(screen.getByLabelText(/meaning/i), "start something effectively");
    await user.type(screen.getByLabelText(/example/i), "I had to hit the ground running.");
    await user.click(screen.getByRole("button", { name: /save idiom/i }));

    expect(repositories.saveIdiom).toHaveBeenCalledWith(
      expect.objectContaining({
        phrase: "hit the ground running",
        source: "user"
      })
    );
  });
});
```

- [ ] **Step 2: Run failing Idiom Bank tests**

Run:

```bash
npm run test -- src/features/idiom-bank/IdiomBankPage.test.tsx
```

Expected: FAIL because the compile-only page does not list or save idioms.

- [ ] **Step 3: Implement Idiom Bank page**

Replace `src/features/idiom-bank/IdiomBankPage.tsx`:

```tsx
import { FormEvent, useEffect, useState } from "react";
import type { Idiom } from "../../domain/types";
import { listIdioms, saveIdiom } from "../../storage/repositories";

function now() {
  return new Date().toISOString();
}

export function IdiomBankPage() {
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [phrase, setPhrase] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setIdioms(await listIdioms());
  }

  useEffect(() => {
    refresh().catch(() => setMessage("Could not load idioms."));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const timestamp = now();
    await saveIdiom({
      id: `idiom-${crypto.randomUUID()}`,
      phrase,
      meaning,
      topics: ["Work and Careers"],
      formality: "neutral",
      riskLevel: "medium",
      example,
      usageWarning: "Use it only when it directly fits the answer.",
      source: "user",
      confidence: "new",
      createdAt: timestamp,
      updatedAt: timestamp
    });
    setPhrase("");
    setMeaning("");
    setExample("");
    setMessage("Idiom saved.");
    await refresh();
  }

  return (
    <section className="content-section">
      <p className="eyebrow">My vocabulary</p>
      <h1>Idiom Bank</h1>
      <form className="idiom-form" onSubmit={handleSubmit}>
        <label className="field">
          Phrase
          <input value={phrase} onChange={(event) => setPhrase(event.target.value)} required />
        </label>
        <label className="field">
          Meaning
          <input value={meaning} onChange={(event) => setMeaning(event.target.value)} required />
        </label>
        <label className="field">
          Example
          <textarea value={example} onChange={(event) => setExample(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit">
          Save idiom
        </button>
      </form>
      {message && <p className="status">{message}</p>}
      <div className="idiom-list">
        {idioms.map((idiom) => (
          <article key={idiom.id} className="idiom-choice">
            <span>
              <strong>{idiom.phrase}</strong>
              <small>{idiom.meaning}</small>
              <small>{idiom.usageWarning}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run Idiom Bank tests**

Run:

```bash
npm run test -- src/features/idiom-bank/IdiomBankPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Idiom Bank**

Run:

```bash
git add src/features/idiom-bank
git commit -m "feat: build idiom bank"
```

## Task 8: Build History Screen

**Files:**

- Modify: `src/features/history/HistoryPage.tsx`
- Test: `src/features/history/HistoryPage.test.tsx`

- [ ] **Step 1: Write History tests**

Create `src/features/history/HistoryPage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PracticeSession } from "../../domain/types";
import * as repositories from "../../storage/repositories";
import { HistoryPage } from "./HistoryPage";

vi.mock("../../storage/repositories");

const session: PracticeSession = {
  id: "session-1",
  ieltsPart: "Part 2",
  topic: "Education",
  prompt: "Describe a teacher.",
  selectedIdiomIds: ["idiom-steep-learning-curve"],
  recordingBlob: new Blob(["audio"], { type: "audio/webm" }),
  recordingDuration: 61,
  feedbackStatus: "complete",
  feedback: {
    naturalUsage: ["Good use of a steep learning curve."],
    forcedUsage: [],
    betterAlternatives: [],
    improvedSampleSentence: "The class had a steep learning curve.",
    nextStep: "Try a Part 3 answer next.",
    transcript: "The class had a steep learning curve."
  },
  createdAt: "2026-05-26T08:00:00.000Z",
  updatedAt: "2026-05-26T08:00:00.000Z"
};

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.mocked(repositories.listSessions).mockResolvedValue([session]);
  });

  it("shows saved sessions and feedback summaries", async () => {
    render(<HistoryPage />);

    expect(await screen.findByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Try a Part 3 answer next.")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    vi.mocked(repositories.listSessions).mockResolvedValue([]);
    render(<HistoryPage />);

    expect(await screen.findByText(/no practice sessions yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing History tests**

Run:

```bash
npm run test -- src/features/history/HistoryPage.test.tsx
```

Expected: FAIL because the compile-only page does not load sessions.

- [ ] **Step 3: Implement History page**

Replace `src/features/history/HistoryPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { PracticeSession } from "../../domain/types";
import { listSessions } from "../../storage/repositories";

export function HistoryPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => setMessage("Could not load practice history."));
  }, []);

  return (
    <section className="content-section">
      <p className="eyebrow">Review</p>
      <h1>Practice History</h1>
      {message && <p className="status error">{message}</p>}
      {sessions.length === 0 && <p>No practice sessions yet. Record an answer to start your log.</p>}
      <div className="idiom-list">
        {sessions.map((session) => (
          <article key={session.id} className="prompt-card">
            <strong>{session.topic}</strong>
            <p>{session.prompt}</p>
            <small>
              {session.ieltsPart} - {session.recordingDuration}s - {session.feedbackStatus}
            </small>
            {session.feedback?.nextStep && <p>{session.feedback.nextStep}</p>}
            <audio
              aria-label={`Playback for ${session.topic}`}
              controls
              src={URL.createObjectURL(session.recordingBlob)}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run History tests**

Run:

```bash
npm run test -- src/features/history/HistoryPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit History screen**

Run:

```bash
git add src/features/history
git commit -m "feat: build practice history"
```

## Task 9: Final Verification And Browser QA

**Files:**

- Create: `README.md`
- Create: `.env.example`

- [ ] **Step 1: Add run instructions**

Create `README.md`:

````md
# IELTS Idiom Speaking Coach

Local-first web app for IELTS Speaking learners who want to practice idioms in recorded answers.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs at `http://127.0.0.1:5173`.
The API runs at `http://127.0.0.1:8787`.

## Environment

Create `.env` with:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_FEEDBACK_MODEL=gpt-5.4-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
```

## Local data

Idioms, practice sessions, feedback, and recordings are stored in browser IndexedDB.
No account is required.
````

Create `.env.example`:

```bash
OPENAI_API_KEY=
OPENAI_FEEDBACK_MODEL=gpt-5.4-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
```

- [ ] **Step 2: Run full automated checks**

Run:

```bash
npm run check
```

Expected: typecheck, tests, and production build all finish with exit code `0`.

- [ ] **Step 3: Run the app**

Run:

```bash
npm run dev
```

Expected: API logs `IELTS idioms API listening on http://127.0.0.1:8787`; Vite logs a local URL at `http://127.0.0.1:5173`.

- [ ] **Step 4: Verify in browser**

Open `http://127.0.0.1:5173` in the in-app browser and verify:

- Practice screen renders with a prompt and starter idioms.
- Start recording asks for microphone permission.
- Denying microphone permission shows the microphone error message.
- With microphone permission granted, stop recording shows audio playback.
- Selecting an idiom and requesting feedback saves a session even if API feedback fails.
- Idiom Bank saves a manually entered idiom and it remains after refresh.
- History displays the saved failed or completed session after refresh.
- Mobile viewport keeps navigation, prompt, idiom list, and controls visible without overlap.

- [ ] **Step 5: Commit docs and final polish**

Run:

```bash
git add README.md .env.example
git commit -m "docs: add local run instructions"
```

## Plan Self-Review Notes

- Spec coverage: guided practice, local idiom bank, recording, feedback, history, AI generation, local persistence, malformed feedback handling, and microphone error handling each have a task.
- Red-flag scan: this plan avoids incomplete markers and every code-changing step includes concrete file content.
- Type consistency: domain fields use the names from the design spec; `feedbackStatus`, `selectedIdiomIds`, `recordingBlob`, and feedback section names are consistent across tests, storage, API, and UI tasks.
