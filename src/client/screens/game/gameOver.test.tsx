import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GameResult } from "../../../shared/GameResult";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";

function place(
  seat: 1 | 2 | 3 | 4,
  score: number,
  changes: Partial<GameResult["places"][number]> = {},
) {
  return {
    seat,
    score,
    bonusTypePoints: 6,
    hasLeft: false,
    hasReachedEndGoal: false,
    income: 15,
    fundsAndHand: 20,
    ...changes,
  };
}

const END_GOAL: GameResult = {
  endedBy: "end_goal",
  places: [
    place(3, 512, { hasReachedEndGoal: true, income: 23 }),
    place(2, 487),
    place(4, 455),
    place(1, 301, { hasLeft: true }),
  ],
};

function showResult(result: GameResult) {
  const props = gamePageProps(roomUpdateWith({ phase: "ended", turn: 24, result }));
  render(<GamePage {...props} />);
  return props;
}

describe("end-of-game screen", () => {
  it("names the winner, why the game ended and every player's place and values", () => {
    showResult(END_GOAL);
    const dialog = screen.getByRole("dialog", { name: "Cy wins!" });
    expect(textWithIconNames(dialog)).toContain(
      "Cy reached [Income 22] and all 3 projects in turn 24, so the game ended after that main phase.",
    );
    const rows = within(dialog)
      .getAllByRole("row")
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      );
    expect(rows).toEqual([
      ["1st", "won", "512", "yes", "23", "20", "6"],
      ["2nd", "lost", "487", "no", "15", "20", "6"],
      ["3rd", "lost", "455", "no", "15", "20", "6"],
      ["4th", "left", "301", "no", "15", "20", "6"],
    ]);
    expect(
      within(dialog)
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual(["Cy", "You", "Di", "Ann"]);
    expect(dialog.textContent).toContain(
      "Players who left are placed by when they left: the one who left first is last.",
    );
  });

  it("says when the game ended at the turn limit", () => {
    showResult({ endedBy: "turn_limit", places: [place(2, 40), place(1, 12)] });
    const dialog = screen.getByRole("dialog", { name: "Bea wins!" });
    expect(dialog.textContent).toContain("Nobody reached the end goal by turn 24");
  });

  it("exits to the lobby, closes to the room and has no rematch button when none is possible", () => {
    const props = showResult(END_GOAL);
    expect(screen.queryByRole("button", { name: "Ask for a rematch" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Exit to lobby" }));
    expect(props.onExitToLobby).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(props.onCloseResult).toHaveBeenCalledTimes(1);
  });

  it("asks for a rematch from the end-of-game screen", () => {
    const onAskRematch = vi.fn();
    const update = roomUpdateWith({ phase: "ended", turn: 24, result: END_GOAL });
    render(<GamePage {...gamePageProps(update)} onAskRematch={onAskRematch} />);
    fireEvent.click(screen.getByRole("button", { name: "Ask for a rematch" }));
    expect(onAskRematch).toHaveBeenCalledTimes(1);
  });
});
