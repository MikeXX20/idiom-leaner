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
