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

    expect(await screen.findByText("healthy and physically fit")).toBeInTheDocument();
  });

  it("shows an empty state when no cards are available", async () => {
    vi.mocked(repositories.listIdioms).mockResolvedValue([]);
    render(<RecitePage />);

    expect(await screen.findByText(/no idioms are ready/i)).toBeInTheDocument();
  });
});
