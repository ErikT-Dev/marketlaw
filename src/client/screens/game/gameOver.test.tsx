import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GameResult } from "../../../shared/GameResult";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";
import { scorePartsAddingUpTo } from "../../testing/scorePartsAddingUpTo";
import { NO_SUMMARY_COUNTS } from "../../../shared/testing/NO_SUMMARY_COUNTS";

function place(
  seat: 1 | 2 | 3 | 4,
  score: number,
  changes: Partial<GameResult["places"][number]> = {},
) {
  return {
    seat,
    score,
    scorePartsInHundredths: scorePartsAddingUpTo(score),
    bonusTypePoints: 6,
    leftInTurn: null,
    hasReachedEndGoal: false,
    income: 15,
    fundsAndHand: 20,
    counts: NO_SUMMARY_COUNTS,
    ...changes,
  };
}

const END_GOAL: GameResult = {
  endedBy: "end_goal",
  places: [
    place(3, 512, {
      hasReachedEndGoal: true,
      income: 23,
      counts: { questsCompleted: 2, types: 14, combosClaimed: 3, worthGained: 615 },
    }),
    place(2, 487),
    place(4, 455),
    place(1, 301, { leftInTurn: 12 }),
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
      "Cy reached [Income 20] and all 3 projects in turn 24, so the game ended after that main phase.",
    );
    const rows = within(within(dialog).getByRole("table", { name: "Places" }))
      .getAllByRole("row")
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      );
    expect(rows).toEqual([
      ["1st", "won", "512", "yes", "Q2T14C3F61.5"],
      ["2nd", "lost", "487", "no", "Q0T0C0F0.0"],
      ["3rd", "lost", "455", "no", "Q0T0C0F0.0"],
      ["4th", "left", "301", "no", "Q0T0C0F0.0"],
    ]);
    expect(
      within(dialog)
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual(["Cy", "You", "Di", "Ann", "Cy", "You", "Di", "Ann"]);
    expect(dialog.textContent).toContain(
      "Players who reached the end goal place first, then the higher score, then the higher total worth gained (F), then the earlier place in the final turn's player order.",
    );
    expect(dialog.textContent).toContain(
      "Players who left are placed by when they left: the one who left first is last.",
    );
  });

  it("explains every player's score part by part adding up to the score", () => {
    const parts = {
      income: 13_000,
      workforce: 280,
      quality: 385,
      satisfaction: -150,
      product: 550,
      distribution: 0,
      fundsAndHand: 420,
      bonusTypes: 600,
    };
    showResult({
      endedBy: "turn_limit",
      places: [place(2, 150, { scorePartsInHundredths: parts }), place(1, 12)],
    });
    const table = within(screen.getByRole("dialog", { name: "Bea wins!" })).getByRole("table", {
      name: "How each score adds up",
    });
    expect(within(table).getAllByRole("columnheader").map(textWithIconNames)).toEqual([
      "Player",
      "[Income]",
      "[Workforce]",
      "[Quality]",
      "[Satisfaction]",
      "[Product]",
      "[Distribution]",
      "[Funds] + hand",
      "Bonus types",
      "Total",
    ]);
    const rows = within(table)
      .getAllByRole("row")
      .slice(1)
      .map((row) => [
        within(row).getByRole("rowheader").textContent,
        ...within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      ]);
    expect(rows).toEqual([
      ["You", "130", "2.8", "3.85", "−1.5", "5.5", "0", "4.2", "6", "150.85"],
      ["Ann", "0", "0", "0", "0", "0", "0", "0", "12", "12"],
    ]);
  });

  it("says when the game ended at the turn limit", () => {
    showResult({ endedBy: "turn_limit", places: [place(2, 40), place(1, 12)] });
    const dialog = screen.getByRole("dialog", { name: "Bea wins!" });
    expect(dialog.textContent).toContain("Nobody reached the end goal by turn 24");
  });

  it("says a casual game leaves ratings unchanged and shows no rating column", () => {
    showResult({ endedBy: "turn_limit", places: [place(2, 40), place(1, 12)] });
    const dialog = screen.getByRole("dialog", { name: "Bea wins!" });
    expect(dialog.textContent).toContain("Casual game: ratings do not change.");
    expect(within(dialog).queryByRole("columnheader", { name: "Rating" })).toBeNull();
  });

  it("shows every player's rating before and after a ranked game", () => {
    const update = roomUpdateWith({
      phase: "ended",
      turn: 40,
      result: { endedBy: "turn_limit", places: [place(3, 402), place(2, 389), place(1, 12)] },
    });
    const ratings = [
      { seat: 1 as const, before: 1000, after: 980 },
      { seat: 2 as const, before: 1000, after: 1000 },
      { seat: 3 as const, before: 1000, after: 1020 },
    ];
    render(<GamePage {...gamePageProps({ ...update, room: { ...update.room, ratings } })} />);
    const dialog = screen.getByRole("dialog", { name: "Cy wins!" });
    expect(dialog.textContent).toContain("Ranked game: ratings changed.");
    expect(dialog.textContent).not.toContain("Casual game");
    expect(within(dialog).getByRole("columnheader", { name: "Rating" })).toBeTruthy();
    const ratingCells = within(within(dialog).getByRole("table", { name: "Places" }))
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell").at(-1)?.textContent);
    expect(ratingCells).toEqual(["1000 → 1020 (+20)", "1000 → 1000 (0)", "1000 → 980 (−20)"]);
    expect(dialog.textContent).toContain(
      "Each pair of players counts as one result. A rematch of a ranked game is casual.",
    );
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
