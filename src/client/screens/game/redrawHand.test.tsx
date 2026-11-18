import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function showGame(changes: Partial<OwnSeatView>) {
  const props = gamePageProps(roomUpdateWith({}, changes));
  render(<GamePage {...props} />);
  return props;
}

describe("redrawing the starting hand", () => {
  it("shows how many redraws are left while the room would accept one", () => {
    showGame({ redrawRejection: null, redrawsLeft: 2 });
    expect(screen.getByRole("button", { name: "Redraw hand (2 left)" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("redraws at once, without asking", () => {
    const { onAction } = showGame({ redrawRejection: null, redrawsLeft: 3 });
    fireEvent.click(screen.getByRole("button", { name: "Redraw hand (3 left)" }));
    expect(onAction).toHaveBeenCalledWith({ type: "redraw_hand" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("goes away after the first action or the third redraw", () => {
    showGame({ redrawRejection: "no_redraw_left", redrawsLeft: 0 });
    expect(screen.queryByRole("button", { name: /^Redraw hand/ })).toBeNull();
  });

  it("logs a redraw with how many times", () => {
    const update = roomUpdateWith({
      mainPhaseLog: [{ kind: "redrew", turn: 1, seat: 1, times: 2 }],
    });
    render(<GamePage {...gamePageProps(update)} />);
    const rows = within(screen.getByRole("list", { name: "Game log entries" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(rows).toEqual(["T1Turn 1: Ann redrew their starting hand 2 times"]);
  });
});
