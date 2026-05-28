import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { starterIdioms } from "./domain/starterContent";
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
