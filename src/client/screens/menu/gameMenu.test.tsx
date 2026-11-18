import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EpochMs } from "../../../shared/EpochMs";
import type { GameResult } from "../../../shared/GameResult";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import { LobbyTopBar } from "../lobby/LobbyTopBar";

const NOW = 1_000_000;

function openMenu(buttonName: string) {
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
  return screen.getByRole("list", { name: "Game menu" });
}

function entryNamesIn(menu: HTMLElement): ReadonlyArray<string> {
  return within(menu)
    .getAllByRole("button")
    .map((entry) => entry.getAttribute("aria-labelledby") ?? "")
    .map((labelId) => document.getElementById(labelId)?.textContent ?? "");
}

function showGame() {
  const update = roomUpdateWith(
    {},
    {
      timeBankMs: 900_000,
      clock: {
        bankMs: 900_000,
        freeUntil: v.parse(EpochMs, NOW + 75_000),
        deadline: v.parse(EpochMs, NOW + 975_000),
      },
    },
  );
  const props = gamePageProps(update);
  render(<GamePage {...props} />);
  return props;
}

describe("the game menu", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers rules, card set and tutorial with their lines in the lobby", () => {
    render(<LobbyTopBar menuPlace="lobby">{null}</LobbyTopBar>);
    const menu = openMenu("Game menu");
    expect(entryNamesIn(menu)).toEqual(["Rules", "Card set", "Tutorial"]);
    expect(
      within(menu)
        .getByRole("button", {
          name: "Tutorial",
          description: "A guided one-player game that teaches the first turns",
        })
        .getAttribute("aria-disabled"),
    ).toBe("false");
    expect(
      within(menu).getByRole("button", {
        name: "Rules",
        description: "How to play, with examples",
      }),
    ).toBeDefined();
    expect(
      within(menu).getByRole("button", {
        name: "Card set",
        description: "All 240 cards, with filters and search",
      }),
    ).toBeDefined();
  });

  it("offers rules and card set with the lobby lines in a waiting room", () => {
    render(<LobbyTopBar menuPlace="waiting_room">{null}</LobbyTopBar>);
    const menu = openMenu("Game menu");
    expect(entryNamesIn(menu)).toEqual(["Rules", "Card set", "Tutorial"]);
    expect(
      within(menu).getByRole("button", { description: "How to play, with examples" }),
    ).toBeDefined();
  });

  it("puts the focus on the first entry and closes on Escape with the focus back on its button", () => {
    render(<LobbyTopBar menuPlace="lobby">{null}</LobbyTopBar>);
    const menu = openMenu("Game menu");
    expect(within(menu).getByRole("button", { name: "Rules" }).matches(":focus")).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("list", { name: "Game menu" })).toBeNull();
    expect(screen.getByRole("button", { name: "Game menu" }).matches(":focus")).toBe(true);
  });

  it("closes when the player clicks outside it", () => {
    render(<LobbyTopBar menuPlace="lobby">{null}</LobbyTopBar>);
    openMenu("Game menu");
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("list", { name: "Game menu" })).toBeNull();
  });

  it("opens the card set and closes itself when the player chooses it", () => {
    render(<LobbyTopBar menuPlace="lobby">{null}</LobbyTopBar>);
    const menu = openMenu("Game menu");
    fireEvent.click(within(menu).getByRole("button", { name: "Card set" }));
    expect(window.location.hash).toBe("#card-set");
    expect(screen.queryByRole("list", { name: "Game menu" })).toBeNull();
  });

  it("says during a game that the clock keeps running", () => {
    showGame();
    const menu = openMenu("Menu");
    expect(entryNamesIn(menu)).toEqual(["Rules", "Card set", "Tutorial"]);
    expect(
      within(menu).getByRole("button", {
        name: "Rules",
        description: "Your clock keeps running while you read",
      }),
    ).toBeDefined();
    expect(
      within(menu).getByRole("button", {
        name: "Card set",
        description: "Your clock keeps running while you look",
      }),
    ).toBeDefined();
  });

  it("keeps the lobby lines once the game is over", () => {
    const result: GameResult = {
      endedBy: "turn_limit" as const,
      places: ([2, 3, 4, 1] as const).map((seat, index) => ({
        seat,
        score: 400 - index,
        bonusTypePoints: 6,
        leftInTurn: null,
        hasReachedEndGoal: false,
        income: 15,
        fundsAndHand: 20,
      })),
    };
    render(<GamePage {...gamePageProps(roomUpdateWith({ phase: "ended", turn: 40, result }))} />);
    const menu = openMenu("Menu");
    expect(
      within(menu).getByRole("button", {
        name: "Rules",
        description: "How to play, with examples",
      }),
    ).toBeDefined();
    expect(
      within(menu).getByRole("button", {
        name: "Card set",
        description: "All 240 cards, with filters and search",
      }),
    ).toBeDefined();
  });

  it("opening the menu and the rules during a game sends nothing and the clock keeps counting", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const props = showGame();
    const bar = screen.getByRole("banner");
    expect(within(bar).getByRole("timer", { name: "Bank 15:00" })).toBeDefined();
    const menu = openMenu("Menu");
    fireEvent.click(within(menu).getByRole("button", { name: "Rules" }));
    expect(window.location.hash).toBe("#rules");
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(within(bar).getByRole("timer", { name: "Bank 14:45" })).toBeDefined();
    expect(props.onAction).not.toHaveBeenCalled();
    expect(props.chat.onSend).not.toHaveBeenCalled();
  });
});
