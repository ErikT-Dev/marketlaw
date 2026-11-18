import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const BONUS_TYPES = ["Luxury", "Low Wealth"] as const;

const DI_CHANGES: Partial<OtherSeatView> = {
  city: ["Cottage", "Farm House", "Loft", "Garden Apartment", "Row House", "Lake Park", "Pub"],
  typeCounts: { Luxury: 1, "Low Wealth": 2, Retail: 2, Safety: 1, "Town Housing": 3 },
  combosClaimed: [
    { card: "Cottage", combo: 0, times: 1 },
    { card: "Lake Park", combo: 1, times: 3 },
  ],
  questsCompleted: ["Trading post"],
  worthGained: 52,
};

const OWN_CHANGES: Partial<OwnSeatView> = {
  city: ["Cottage", "Lake Park"],
  typeCounts: { Safety: 1, Retail: 3, Luxury: 2, "Low Wealth": 2, Leisure: 3 },
  combos: [
    { card: "Cottage", combo: 0, claimedTimes: 1, readyTimes: 0 },
    { card: "Lake Park", combo: 1, claimedTimes: 3, readyTimes: 0 },
  ],
  questsCompleted: ["Trading post"],
  worthGained: 31,
};

function showGame() {
  const update = roomUpdateWith({ bonusTypes: BONUS_TYPES }, OWN_CHANGES);
  const game = update.game;
  if (game === null) {
    throw new Error("no game");
  }
  const view: PlayerView = {
    ...game.view,
    seats: game.view.seats.map((seat) =>
      seat.seat === 4 && seat.kind === "other" ? { ...seat, ...DI_CHANGES } : seat,
    ),
  };
  render(<GamePage {...gamePageProps({ ...update, game: { ...game, view } })} />);
}

function chipsOf(list: HTMLElement) {
  return within(list)
    .getAllByRole("listitem")
    .map((item) => ({
      chip: within(item).getByRole("img").getAttribute("aria-label"),
      isBonus: item.className.includes("bonusType"),
    }));
}

function quickSummaryTableOfDi() {
  return within(screen.getByRole("region", { name: "Opponents" })).getByRole("article", {
    name: "Quick summary table of Di",
  });
}

describe("your stats", () => {
  it("shows the Q, T, C and F boxes for yourself", () => {
    showGame();
    const counts = within(screen.getByRole("list", { name: "Your counts" }));
    expect(counts.getAllByRole("img").map((box) => box.getAttribute("aria-label"))).toEqual([
      "Quests completed 1",
      "Types in your city 4",
      "Combos claimed 4",
      "Total worth gained 31",
    ]);
  });

  it("sorts the type counts by count then name inside the bonus part and the rest, bonus types highlighted", () => {
    showGame();
    expect(
      chipsOf(screen.getByRole("list", { name: "Your type counts, bonus types first" })),
    ).toEqual([
      { chip: "Low Wealth 2", isBonus: true },
      { chip: "Luxury 2", isBonus: true },
      { chip: "Leisure 3", isBonus: false },
      { chip: "Retail 3", isBonus: false },
      { chip: "Safety 1", isBonus: false },
    ]);
  });
});

describe("quick summary table", () => {
  it("shows the T, C and F boxes beside Q", () => {
    showGame();
    const di = within(quickSummaryTableOfDi());
    expect(di.getByRole("img", { name: "Quests completed 1" })).toBeDefined();
    expect(di.getByRole("img", { name: "Types in their city 13" })).toBeDefined();
    expect(di.getByRole("img", { name: "Combos claimed 4" })).toBeDefined();
    expect(di.getByRole("img", { name: "Total worth gained 52" })).toBeDefined();
  });

  it("shows the five types played most in the city, ties by name, a bonus type highlighted", () => {
    showGame();
    expect(
      chipsOf(
        within(quickSummaryTableOfDi()).getByRole("list", { name: "Types played most by Di" }),
      ),
    ).toEqual([
      { chip: "Town Housing 3", isBonus: false },
      { chip: "Beautification 2", isBonus: false },
      { chip: "Low Wealth 2", isBonus: true },
      { chip: "Suburban Housing 2", isBonus: false },
      { chip: "City Housing 1", isBonus: false },
    ]);
  });
});

describe("detailed summary table", () => {
  it("shows the type counts with the bonus types first, each part sorted, bonus types highlighted", () => {
    showGame();
    fireEvent.click(
      within(quickSummaryTableOfDi()).getByRole("button", { name: "Detailed summary table of Di" }),
    );
    const table = within(screen.getByRole("dialog", { name: "Detailed summary table of Di" }));
    expect(
      chipsOf(table.getByRole("list", { name: "Type counts of Di, bonus types first" })),
    ).toEqual([
      { chip: "Low Wealth 2", isBonus: true },
      { chip: "Luxury 1", isBonus: true },
      { chip: "Town Housing 3", isBonus: false },
      { chip: "Retail 2", isBonus: false },
      { chip: "Safety 1", isBonus: false },
    ]);
  });
});
