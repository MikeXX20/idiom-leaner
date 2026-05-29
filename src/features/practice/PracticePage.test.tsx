import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { starterIdioms, starterPrompts } from "../../domain/starterContent";
import * as aiClient from "../../api/aiClient";
import * as repositories from "../../storage/repositories";
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
    vi.stubEnv("VITE_ENABLE_AI_FEATURES", "true");
    vi.stubEnv("VITE_ENABLE_FEEDBACK_FEATURES", "true");
    vi.mocked(repositories.listIdioms).mockResolvedValue(starterIdioms);
    vi.mocked(repositories.saveSession).mockResolvedValue(undefined);
    vi.mocked(repositories.saveIdiom).mockResolvedValue(undefined);
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

    await waitFor(() => {
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

  it("explains when idiom generation needs the API", async () => {
    const user = userEvent.setup();
    vi.mocked(aiClient.generateIdioms).mockRejectedValue(new Error("Not found"));
    render(<PracticePage />);

    await screen.findByText("a steep learning curve");
    await user.click(screen.getByRole("button", { name: /generate/i }));

    expect(
      await screen.findByText(/AI generation needs the API/i)
    ).toBeInTheDocument();
  });

  it("uses the curated deck when AI features are disabled", async () => {
    vi.stubEnv("VITE_ENABLE_AI_FEATURES", "false");
    vi.stubEnv("VITE_ENABLE_FEEDBACK_FEATURES", "false");

    render(<PracticePage />);

    expect(await screen.findByText("a steep learning curve")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get feedback/i })).not.toBeInTheDocument();
    expect(screen.getByText(/study with the curated deck/i)).toBeInTheDocument();
  });

  it("can enable generation without audio feedback", async () => {
    vi.stubEnv("VITE_ENABLE_AI_FEATURES", "true");
    vi.stubEnv("VITE_ENABLE_FEEDBACK_FEATURES", "false");

    render(<PracticePage />);

    expect(await screen.findByText("a steep learning curve")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get feedback/i })).not.toBeInTheDocument();
    expect(screen.getByText(/deepseek generation is on/i)).toBeInTheDocument();
  });
});
