import { Blob as NodeBlob } from "node:buffer";
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

  it("persists a practice session with audio blob", async () => {
    const session: PracticeSession = {
      id: "session-1",
      ieltsPart: "Part 2",
      topic: "Work and Careers",
      prompt: "Describe a skill you learned.",
      selectedIdiomIds: ["idiom-steep-learning-curve"],
      recordingBlob: new NodeBlob(["audio"], { type: "audio/webm" }) as unknown as Blob,
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
