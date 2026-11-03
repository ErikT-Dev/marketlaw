import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GameResult } from "../../../shared/GameResult";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const LAST_PLAYER: GameResult = {
  endedBy: "last_player",
  places: ([2, 4, 3, 1] as const).map((seat) => ({
    seat,
    score: 400 - seat,
    bonusTypePoints: 3,
    hasLeft: seat !== 2,
    hasReachedEndGoal: false,
    income: 12,
    fundsAndHand: 20,
  })),
};

const LAST_PLACE = LAST_PLAYER.places[0] ?? {
  seat: 2,
  score: 0,
  bonusTypePoints: 0,
  hasLeft: false,
  hasReachedEndGoal: false,
  income: 3,
  fundsAndHand: 0,
};

describe("leaving the game", () => {
  it("asks before leaving and says what happens, and staying changes nothing", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(<GamePage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Leave game" }));
    const dialog = screen.getByRole("dialog", { name: "Leave the game?" });
    expect(dialog.textContent).toContain("you cannot come back and cannot win");
    expect(dialog.textContent).toContain("Your city stays, your hand goes to the discard pile");
    expect(dialog.textContent).toContain("You stay in the room and its chat");
    fireEvent.click(within(dialog).getByRole("button", { name: "Stay in the game" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(props.onAction).not.toHaveBeenCalled();
  });

  it("sends leave_game when the player confirms", () => {
    const props = gamePageProps(roomUpdateWith({}));
    render(<GamePage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Leave game" }));
    fireEvent.click(screen.getByRole("button", { name: "Leave the game" }));
    expect(props.onAction).toHaveBeenCalledWith({ type: "leave_game" });
  });

  it("offers no Leave game once the game is over", () => {
    render(
      <GamePage {...gamePageProps(roomUpdateWith({ phase: "ended", result: LAST_PLAYER }))} />,
    );
    expect(screen.queryByRole("button", { name: "Leave game" })).toBeNull();
  });
});

describe("after leaving", () => {
  it("shows that you left instead of the game, with an exit to the lobby", () => {
    const props = gamePageProps(roomUpdateWith({}, { hasLeft: true, isDone: true }));
    render(<GamePage {...props} />);
    expect(screen.getByRole("heading", { name: "You left the game" })).toBeDefined();
    expect(screen.queryByRole("list", { name: "Your hand" })).toBeNull();
    expect(screen.getByRole("main").textContent).toContain(
      "When the game ends, its result appears here.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Exit to lobby" }));
    expect(props.onExitToLobby).toHaveBeenCalledTimes(1);
  });

  it("shows the result when the game ends, and again after closing it", () => {
    const update = roomUpdateWith(
      {
        phase: "ended",
        turn: 18,
        result: {
          ...LAST_PLAYER,
          places: ([3, 2, 4, 1] as const).map((seat) => ({
            ...LAST_PLACE,
            seat,
            hasLeft: seat !== 3,
          })),
        },
      },
      { hasLeft: true, isDone: true },
    );
    render(<GamePage {...gamePageProps(update)} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show result" }));
    expect(screen.getByRole("dialog").textContent).toContain("All other players left the game");
  });
});

describe("endings by leaving and abandoning", () => {
  it("names the last player as the winner and places the others by when they left", () => {
    render(
      <GamePage
        {...gamePageProps(roomUpdateWith({ phase: "ended", turn: 18, result: LAST_PLAYER }))}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "You win: everyone else left" });
    expect(dialog.textContent).toContain(
      "All other players left the game in turn 18, so the game ended at once and you are 1st.",
    );
    expect(dialog.textContent).toContain(
      "Players who left are placed by when they left: the one who left first is last.",
    );
  });

  it("shows an abandoned game with no winner and no table", () => {
    const result: GameResult = { endedBy: "paused_too_long", places: LAST_PLAYER.places };
    render(<GamePage {...gamePageProps(roomUpdateWith({ phase: "ended", result }))} />);
    const dialog = screen.getByRole("dialog", { name: "The game was abandoned" });
    expect(dialog.textContent).toContain("The game stayed paused for 24 hours");
    expect(within(dialog).queryByRole("table")).toBeNull();
  });

  it("says when every player left at the same moment", () => {
    const result: GameResult = { endedBy: "everyone_left", places: LAST_PLAYER.places };
    render(<GamePage {...gamePageProps(roomUpdateWith({ phase: "ended", turn: 7, result }))} />);
    expect(screen.getByRole("dialog", { name: "The game was abandoned" }).textContent).toContain(
      "Every player still in the game left at the same moment in turn 7",
    );
  });
});
