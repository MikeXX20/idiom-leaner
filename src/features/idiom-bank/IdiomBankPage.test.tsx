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
