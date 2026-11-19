import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { TutorialProgress } from "../../../shared/TutorialProgress";
import type { TutorialView } from "../../../shared/TutorialView";
import type { RejectedMove } from "../../store/RejectedMove";
import { tutorialViewAt } from "../../testing/tutorialViewAt";
import { TutorialPage } from "./TutorialPage";

const HAND: ReadonlyArray<CardName> = ["Row House", "Hiking Trail"];

function tutorialWithHand(progress: TutorialProgress): TutorialView {
  const tutorial = tutorialViewAt(progress);
  return {
    ...tutorial,
    game: {
      ...tutorial.game,
      seats: tutorial.game.seats.map((seat) =>
        seat.kind === "own"
          ? {
              ...seat,
              hand: HAND,
              handDetails: HAND.map((card) => ({
                card,
                realCost: 1,
                sameSectorAndTierInCity: 0,
                playRejection: null,
              })),
            }
          : seat,
      ),
    },
  };
}

function showTutorial(progress: TutorialProgress, rejectedMove: RejectedMove | null = null) {
  const props = {
    tutorial: tutorialWithHand(progress),
    playerName: "Ann",
    playerIconColor: 2,
    pendingActions: [],
    rejectedMove,
    connection: "open" as const,
    isOutdated: false,
    serverClockOffsetMs: 0,
    onAction: vi.fn(),
    onContinue: vi.fn(),
    onRestart: vi.fn(),
    onLeave: vi.fn(),
    onDismissRejection: vi.fn(),
    onPlayHere: vi.fn(),
  };
  render(<TutorialPage {...props} />);
  return props;
}

describe("the tutorial screen's highlights and steps", () => {
  it("highlights the card the step asks to play", () => {
    showTutorial({ kind: "step", step: "T1.2", number: 2 });
    const highlights = screen.getAllByTestId("tutorial-highlight");
    expect(highlights).toHaveLength(1);
    expect(
      within(highlights[0] ?? document.body).getByRole("button", { name: /^Row House/ }),
    ).toBeTruthy();
    expect(
      within(highlights[0] ?? document.body).queryByRole("button", { name: /^Hiking Trail/ }),
    ).toBeNull();
  });

  it("highlights the hand and the stats on the welcome step", () => {
    showTutorial({ kind: "step", step: "T1.1", number: 1 });
    const [stats, hand] = screen.getAllByTestId("tutorial-highlight");
    expect(within(hand ?? document.body).getByRole("list", { name: "Your hand" })).toBeTruthy();
    expect(within(stats ?? document.body).getByRole("list", { name: "Stat values" })).toBeTruthy();
  });

  it("highlights nothing on the last step", () => {
    showTutorial({ kind: "step", step: "T5.4", number: 19 });
    expect(screen.queryAllByTestId("tutorial-highlight")).toEqual([]);
  });

  it("says what the tutorial is waiting for when a move is not this step", () => {
    const props = showTutorial(
      { kind: "step", step: "T1.2", number: 2 },
      { action: { type: "play_card", card: "Hiking Trail" }, code: "not_this_step" },
    );
    const toast = screen.getByRole("status", { name: "" });
    expect(within(toast).getByText("Not this step")).toBeTruthy();
    expect(
      within(toast).getByText(
        "The tutorial is waiting for you to play Row House. Nothing changed.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Move rejected")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close: Not this step" }));
    expect(props.onDismissRejection).toHaveBeenCalledOnce();
  });

  it("shows any other rejection as a rejected move", () => {
    showTutorial(
      { kind: "step", step: "T1.2", number: 2 },
      { action: null, code: "site_daily_cap" },
    );
    expect(screen.getByText("Move rejected")).toBeTruthy();
  });
});

function isInsideInert(name: string) {
  return screen.getByRole("list", { name }).closest("[inert]") !== null;
}

describe("the side of the table the step is not on", () => {
  it("makes the marketplace side unusable on a hand step", () => {
    showTutorial({ kind: "step", step: "T1.2", number: 2 });
    expect(isInsideInert("Marketplace places")).toBe(true);
    expect(isInsideInert("Your hand")).toBe(false);
  });

  it("makes the hand side unusable on a marketplace step", () => {
    showTutorial({ kind: "step", step: "T2.2", number: 6 });
    expect(isInsideInert("Your hand")).toBe(true);
    expect(isInsideInert("Marketplace places")).toBe(false);
  });

  it("makes both sides unusable on a text step", () => {
    showTutorial({ kind: "step", step: "T1.1", number: 1 });
    expect(isInsideInert("Your hand")).toBe(true);
    expect(isInsideInert("Marketplace places")).toBe(true);
  });
});

describe("the game menu in the tutorial", () => {
  it("shows the lobby lines and the tutorial disabled with its reason", () => {
    showTutorial({ kind: "step", step: "T1.2", number: 2 });
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const menu = screen.getByRole("list", { name: "Game menu" });
    expect(within(menu).getByText("How to play, with examples")).toBeTruthy();
    expect(within(menu).getByText("All 240 cards, with filters and search")).toBeTruthy();
    expect(within(menu).queryByText(/clock keeps running/)).toBeNull();
    const tutorial = within(menu).getByRole("button", { name: "Tutorial" });
    expect(tutorial.getAttribute("aria-disabled")).toBe("true");
    expect(
      within(tutorial).getByText(
        "Not available while you are in a game, a room or the ranked queue",
      ),
    ).toBeTruthy();
  });
});

describe("tutorial complete", () => {
  it("says what the player did and offers the rules, another go and the lobby", () => {
    const props = showTutorial({ kind: "complete" });
    const dialog = screen.getByRole("dialog", { name: "Tutorial complete" });
    expect(
      within(dialog).getByText(
        "You played your first turns, got your first income and completed your first quest.",
      ),
    ).toBeTruthy();
    expect(
      within(dialog).getByText(
        "The tutorial creates no game record and does not change your rating.",
      ),
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Play it again" }));
    expect(props.onRestart).toHaveBeenCalledOnce();
    fireEvent.click(within(dialog).getByRole("button", { name: "Go to the lobby" }));
    expect(props.onLeave).toHaveBeenCalledOnce();
  });

  it("leaves the tutorial and opens the rules from Read the rules", () => {
    const props = showTutorial({ kind: "complete" });
    fireEvent.click(screen.getByRole("button", { name: "Read the rules" }));
    expect(window.location.hash).toBe("#rules");
    expect(props.onLeave).toHaveBeenCalledOnce();
  });
});
