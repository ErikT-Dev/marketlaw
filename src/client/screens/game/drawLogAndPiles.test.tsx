import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

describe("draw log", () => {
  it("lists the draws newest first with their turn", () => {
    const update = roomUpdateWith({
      drawLog: [
        {
          kind: "draw",
          turn: 2,
          seat: 1,
          cause: "income",
          count: 1,
          asked: { by: "sector", sector: "Service", tier: 1 },
        },
        {
          kind: "draw",
          turn: 3,
          seat: 4,
          cause: "income",
          count: 1,
          asked: { by: "sector", sector: "Public", tier: 2 },
        },
      ],
    });
    render(<GamePage {...gamePageProps(update)} />);
    const rows = within(screen.getByRole("list", { name: "Draw log entries" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(rows).toEqual([
      "T3Di drew 1 card: Public, tier 2 (income)",
      "T2Ann drew 1 card: Service, tier 1 (income)",
    ]);
  });

  it("says when nothing has been drawn yet", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    expect(screen.getByText("No cards drawn yet.")).toBeDefined();
  });
});

describe("deck and discard pile", () => {
  it("shows the deck count and opens the discard pile", () => {
    render(
      <GamePage {...gamePageProps(roomUpdateWith({ deckCount: 112, discard: ["Pub", "Loft"] }))} />,
    );
    const marketplace = screen.getByRole("region", { name: "Marketplace" });
    expect(within(marketplace).getByText("Deck 112")).toBeDefined();
    fireEvent.click(within(marketplace).getByRole("button", { name: "Discard 2 · view ›" }));
    const dialog = screen.getByRole("dialog", { name: "Discard pile · 2 cards" });
    expect(within(dialog).getByText(/Pub · Service, tier 1/)).toBeDefined();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
