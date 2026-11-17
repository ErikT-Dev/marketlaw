import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { statAndTypeWordsShownIn } from "../../testing/statAndTypeWordsShownIn";
import { runningGameClockOf } from "../game/runningGameClockOf";
import { CardSetPage } from "./CardSetPage";

const NOW = 5_000_000;

function showCardSet(gameClock: Parameters<typeof CardSetPage>[0]["gameClock"] = null) {
  render(<CardSetPage gameClock={gameClock} />);
  return screen.getByRole("dialog", { name: "Card set" });
}

function tileNames(cardSet: HTMLElement): ReadonlyArray<string | null> {
  const grid = within(cardSet).getByRole("list", { name: "Cards" });
  return within(grid)
    .queryAllByRole("listitem")
    .map((tile) => tile.getAttribute("aria-label"));
}

function choose(cardSet: HTMLElement, group: string, choice: string): void {
  const buttons = within(within(cardSet).getByRole("group", { name: group }));
  fireEvent.click(buttons.getByRole("button", { name: choice }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("card set", () => {
  it("shows all 240 cards as tiles with the number that match", () => {
    const cardSet = showCardSet();
    expect(tileNames(cardSet)).toHaveLength(240);
    expect(tileNames(cardSet)[0]).toBe("Farm House");
    expect(within(cardSet).getByRole("status").textContent).toBe("240 cards match");
  });

  it("filters by sector, tier and type together and back to all", () => {
    const cardSet = showCardSet();
    choose(cardSet, "Sector", "Public");
    choose(cardSet, "Tier", "1");
    choose(cardSet, "Type", "Safety");
    expect(tileNames(cardSet)).toEqual(["Trauma Center", "Fire Station"]);
    expect(within(cardSet).getByRole("status").textContent).toBe("2 cards match");
    const sector = within(within(cardSet).getByRole("group", { name: "Sector" }));
    expect(sector.getByRole("button", { name: "Public" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    choose(cardSet, "Sector", "All");
    choose(cardSet, "Tier", "All");
    choose(cardSet, "Type", "All");
    expect(tileNames(cardSet)).toHaveLength(240);
  });

  it("finds cards by any part of their name whatever the case", () => {
    const cardSet = showCardSet();
    fireEvent.change(within(cardSet).getByRole("searchbox", { name: "Search by card name" }), {
      target: { value: "row house" },
    });
    expect(tileNames(cardSet)).toEqual(["Row House", "Modern Row House", "Tall Row Houses"]);
    fireEvent.change(within(cardSet).getByRole("searchbox", { name: "Search by card name" }), {
      target: { value: "no such card" },
    });
    expect(tileNames(cardSet)).toEqual([]);
    expect(within(cardSet).getByRole("status").textContent).toBe("0 cards match");
  });

  it("shows the type filter as icons with their names", () => {
    const cardSet = showCardSet();
    const types = within(cardSet).getByRole("group", { name: "Type" });
    expect(within(types).getByRole("img", { name: "Low Wealth" })).toBeTruthy();
    expect(statAndTypeWordsShownIn(types)).toEqual([]);
  });

  it("says the clock keeps running and shows the time left when opened during a game", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const update = roomUpdateWith(
      {},
      {
        timeBankMs: 600_000,
        clock: {
          bankMs: 600_000,
          freeUntil: v.parse(EpochMs, NOW + 30_000),
          deadline: v.parse(EpochMs, NOW + 90_000),
        },
      },
    );
    const note = within(showCardSet(runningGameClockOf(update, 0))).getByRole("note");
    expect(note.textContent).toContain("Your clock keeps running while the card set is open.");
    expect(within(note).getByRole("timer", { name: "Time left 1:30" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(within(note).getByRole("timer", { name: "Time left 1:20" })).toBeTruthy();
  });

  it("shows no clock line outside a game", () => {
    expect(within(showCardSet()).queryByRole("note")).toBeNull();
  });
});
