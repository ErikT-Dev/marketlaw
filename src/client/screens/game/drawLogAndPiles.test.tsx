import { render, screen, within } from "@testing-library/react";
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
      "T3Turn 3: Di drew 1 card: Public, tier 2 (income)",
      "T2Turn 2: Ann drew 1 card: Service, tier 1 (income)",
    ]);
  });

  it("shows each market go on one line, whatever tiers it drew", () => {
    const go = { kind: "turn_draw", turn: 4, choice: { option: "B", sector: "Public" } } as const;
    const update = roomUpdateWith({
      drawLog: [
        { ...go, seat: 1, count: 1, asked: { by: "sector", sector: "Public", tier: 1 } },
        { ...go, seat: 1, count: 1, asked: { by: "sector", sector: "Public", tier: 2 } },
        { ...go, seat: 2, count: 1, asked: { by: "sector", sector: "Public", tier: 1 } },
        { ...go, seat: 2, count: 0, asked: { by: "sector", sector: "Public", tier: 2 } },
        { ...go, seat: 3, count: 0, asked: { by: "sector", sector: "Public", tier: 1 } },
      ],
    });
    render(<GamePage {...gamePageProps(update)} />);
    const rows = within(screen.getByRole("list", { name: "Draw log entries" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(rows).toEqual([
      "T4Turn 4: Cy skipped the marketplace and drew no cards",
      "T4Turn 4: Bea skipped the marketplace and drew 1 card: Public, tier 1",
      "T4Turn 4: Ann skipped the marketplace and drew 2 cards: Public, 1 of tier 1 and 1 of tier 2",
    ]);
  });

  it("says when nothing has been drawn yet", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    expect(screen.getByText("No cards drawn yet.")).toBeDefined();
  });
});

describe("deck and discard pile", () => {
  it("shows the deck and the discard pile as numbers only", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({ deckCount: 112, discardCount: 2 }))} />);
    const marketplace = screen.getByRole("region", { name: "Marketplace" });
    expect(within(marketplace).getByText("Deck 112")).toBeDefined();
    expect(within(marketplace).getByText("Discard 2")).toBeDefined();
    expect(within(marketplace).queryByRole("button", { name: /Discard/ })).toBeNull();
  });
});
