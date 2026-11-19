import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function withDiCity(update: RoomUpdate): RoomUpdate {
  const game = update.game;
  if (game === null) {
    return update;
  }
  return {
    ...update,
    game: {
      ...game,
      view: {
        ...game.view,
        seats: game.view.seats.map((seat) =>
          seat.seat === 4 ? { ...seat, city: ["Cottage", "Loft", "Pub"], handCount: 5 } : seat,
        ),
      },
    },
  };
}

function opponents() {
  return within(screen.getByRole("region", { name: "Opponents" }));
}

describe("quick summary table", () => {
  it("shows a card for every other player with status, funds, income, hand and cards per sector", () => {
    render(<GamePage {...gamePageProps(withDiCity(roomUpdateWith({})))} />);
    expect(
      opponents()
        .getAllByRole("article")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual([
      "Quick summary table of Ann",
      "Quick summary table of Cy",
      "Quick summary table of Di",
    ]);
    const di = within(opponents().getByRole("article", { name: "Quick summary table of Di" }));
    expect(di.getByRole("img", { name: "Funds 7" })).toBeDefined();
    expect(di.getByRole("img", { name: "Income 14" })).toBeDefined();
    expect(di.getByRole("img", { name: "Influence 3" })).toBeDefined();
    expect(di.getByRole("img", { name: "Quests completed 0" })).toBeDefined();
    expect(di.getByText("Hand 5")).toBeDefined();
    expect(
      within(di.getByRole("list", { name: "Cards in play of Di" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Residential 2", "Industry 0", "Service 1", "Public 0"]);
    expect(
      within(opponents().getByRole("article", { name: "Quick summary table of Cy" })).getByText(
        "done",
      ),
    ).toBeDefined();
    expect(
      within(opponents().getByRole("article", { name: "Quick summary table of Ann" })).getByText(
        "left",
      ),
    ).toBeDefined();
  });
});

describe("detailed summary table", () => {
  it("shows the type and combo counts and the five basic stats, with negative ones in a red table", () => {
    const update = roomUpdateWith({});
    const game = update.game;
    const view = game?.view;
    if (game === null || view === undefined) {
      throw new Error("no game");
    }
    const seats = view.seats.map((seat) =>
      seat.seat === 4 && seat.kind === "other"
        ? {
            ...seat,
            city: ["Cottage", "Lake Park"] as const,
            combosClaimed: [
              { card: "Cottage", combo: 0, times: 1 },
              { card: "Lake Park", combo: 1, times: 3 },
            ] as const,
            stats: {
              ...seat.stats,
              workforce: 2,
              quality: -1,
              satisfaction: 0,
              product: 4,
              distribution: 5,
            },
          }
        : seat,
    );
    render(
      <GamePage {...gamePageProps({ ...update, game: { ...game, view: { ...view, seats } } })} />,
    );
    fireEvent.click(opponents().getByRole("button", { name: "Detailed summary table of Di" }));
    const board = within(screen.getByRole("dialog", { name: "Detailed summary table of Di" }));
    expect(board.getByRole("img", { name: "Types in their city 4" })).toBeDefined();
    expect(board.getByRole("img", { name: "Combos claimed 4" })).toBeDefined();
    const table = board.getByRole("list", { name: "Workforce, quality and satisfaction of Di" });
    expect(table.className).toContain("projectStatsNegative");
    expect(
      within(table)
        .getAllByRole("img")
        .map((chip) => chip.getAttribute("aria-label")),
    ).toEqual(["Workforce 2", "Quality -1", "Satisfaction 0"]);
    expect(board.getByRole("img", { name: "Product 4" })).toBeDefined();
    expect(board.getByRole("img", { name: "Distribution 5" })).toBeDefined();
  });

  it("opens from the card, says it shows the start of the main phase, and lists the city by sector", () => {
    render(<GamePage {...gamePageProps(withDiCity(roomUpdateWith({})))} />);
    fireEvent.click(opponents().getByRole("button", { name: "Detailed summary table of Di" }));
    const board = within(screen.getByRole("dialog", { name: "Detailed summary table of Di" }));
    expect(
      board.getByText(
        "Shown as at the start of this main phase: what they do in it is revealed when the main phase ends. Their hand: 5 cards.",
      ),
    ).toBeDefined();
    expect(board.getByRole("img", { name: "Influence 3" })).toBeDefined();
    expect(board.getByRole("img", { name: "Build passes 2" })).toBeDefined();
    const residential = within(board.getByRole("region", { name: "Residential cards of Di" }));
    expect(
      residential.getAllByRole("button").map((item) => item.getAttribute("aria-label")),
    ).toEqual(["Cottage", "Loft"]);
    expect(board.getByText("This turn: playing, not done yet")).toBeDefined();
  });

  it("closes with Close or Escape", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    fireEvent.click(opponents().getByRole("button", { name: "Detailed summary table of Cy" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(opponents().getByRole("button", { name: "Detailed summary table of Cy" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
