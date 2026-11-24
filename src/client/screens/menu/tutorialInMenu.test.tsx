import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GameResult } from "../../../shared/GameResult";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import { LobbyTopBar } from "../lobby/LobbyTopBar";
import type { GameMenuPlace } from "./GameMenuPlace";
import { TutorialStart } from "./TutorialStart";
import { scorePartsAddingUpTo } from "../../testing/scorePartsAddingUpTo";
import { NO_SUMMARY_COUNTS } from "../../../shared/testing/NO_SUMMARY_COUNTS";

const UNAVAILABLE = "Not available while you are in a game, a room or the ranked queue";

function tutorialEntryIn(buttonName: string) {
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
  const menu = screen.getByRole("list", { name: "Game menu" });
  return within(menu).getByRole("button", { name: "Tutorial" });
}

function showLobbyBar(place: Exclude<GameMenuPlace, "game" | "tutorial">) {
  const startTutorial = vi.fn();
  render(
    <TutorialStart.Provider value={startTutorial}>
      <LobbyTopBar menuPlace={place}>{null}</LobbyTopBar>
    </TutorialStart.Provider>,
  );
  return startTutorial;
}

const RESULT: GameResult = {
  endedBy: "turn_limit" as const,
  places: ([2, 3, 4, 1] as const).map((seat, index) => ({
    seat,
    score: 400 - index,
    scorePartsInHundredths: scorePartsAddingUpTo(400 - index),
    bonusTypePoints: 6,
    leftInTurn: null,
    hasReachedEndGoal: false,
    income: 15,
    fundsAndHand: 20,
    counts: NO_SUMMARY_COUNTS,
  })),
};

describe("the tutorial in the game menu", () => {
  it("starts the tutorial from the lobby and closes the menu", () => {
    const startTutorial = showLobbyBar("lobby");
    fireEvent.click(tutorialEntryIn("Game menu"));
    expect(startTutorial).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("list", { name: "Game menu" })).toBeNull();
  });

  it.each(["waiting_room", "ranked_queue"] as const)(
    "shows the tutorial disabled with its reason in the place %s and does not start it",
    (place) => {
      const startTutorial = showLobbyBar(place);
      const entry = tutorialEntryIn("Game menu");
      expect(entry.getAttribute("aria-disabled")).toBe("true");
      expect(within(entry).getByText(UNAVAILABLE)).toBeDefined();
      fireEvent.click(entry);
      expect(startTutorial).not.toHaveBeenCalled();
      expect(screen.getByRole("list", { name: "Game menu" })).toBeDefined();
    },
  );

  it("shows the tutorial disabled with its reason during a game", () => {
    const startTutorial = vi.fn();
    render(
      <TutorialStart.Provider value={startTutorial}>
        <GamePage {...gamePageProps(roomUpdateWith({}))} />
      </TutorialStart.Provider>,
    );
    const entry = tutorialEntryIn("Menu");
    expect(entry.getAttribute("aria-disabled")).toBe("true");
    expect(within(entry).getByText(UNAVAILABLE)).toBeDefined();
    fireEvent.click(entry);
    expect(startTutorial).not.toHaveBeenCalled();
  });

  it("offers the tutorial once the game is over", () => {
    const startTutorial = vi.fn();
    render(
      <TutorialStart.Provider value={startTutorial}>
        <GamePage
          {...gamePageProps(roomUpdateWith({ phase: "ended", turn: 40, result: RESULT }))}
        />
      </TutorialStart.Provider>,
    );
    const entry = tutorialEntryIn("Menu");
    expect(entry.getAttribute("aria-disabled")).toBe("false");
    fireEvent.click(entry);
    expect(startTutorial).toHaveBeenCalledTimes(1);
  });
});
