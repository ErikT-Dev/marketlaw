import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { QuestPlaceView } from "../../../shared/QuestPlaceView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const TRADING_POST: QuestPlaceView = {
  quest: "Trading post",
  turnsLeft: 3,
  completeRejection: null,
  progress: [
    { seat: 1, isCompleted: false, have: [3, 0] },
    { seat: 2, isCompleted: false, have: [4, 1] },
    { seat: 3, isCompleted: true, have: [5, 2] },
  ],
};

const WORKING_DISTRICT: QuestPlaceView = {
  quest: "Working district",
  turnsLeft: 1,
  completeRejection: "quest_already_completed",
  progress: [{ seat: 2, isCompleted: true, have: [3, 1] }],
};

function showQuests(quests: ReadonlyArray<QuestPlaceView>) {
  const props = gamePageProps(roomUpdateWith({ quests }));
  render(<GamePage {...props} />);
  return props;
}

describe("quests panel", () => {
  it("shows each quest with its tier, turns left, requirement, reward and everyone's progress", () => {
    showQuests([TRADING_POST, { quest: null }]);
    const card = screen.getByRole("region", { name: "Trading post" });
    expect(within(card).getByText("Tier 1 · 3 turns left")).toBeDefined();
    expect(within(card).getByRole("img", { name: "4 income" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "1 Retail" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "+1 funds" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "+2 influence" })).toBeDefined();
    const progress = within(card).getByRole("list", { name: "Progress on Trading post" });
    const lines = within(progress)
      .getAllByRole("listitem")
      .map((line) =>
        within(line)
          .queryAllByRole("img")
          .map((part) => part.getAttribute("aria-label"))
          .join(" | "),
      );
    expect(lines).toEqual(["income 4 of 4 | Retail 1 of 1", "income 3 of 4 | Retail 0 of 1", ""]);
    expect(
      within(progress)
        .getAllByText(/^(You|Ann|Cy)/)
        .map((name) => name.textContent),
    ).toEqual(["You", "Ann", "Cy · completed"]);
    expect(screen.getByText("Empty place")).toBeDefined();
  });

  it("completes a quest the player can complete", () => {
    const { onAction } = showQuests([TRADING_POST]);
    const card = screen.getByRole("region", { name: "Trading post" });
    fireEvent.click(within(card).getByRole("button", { name: "Complete" }));
    expect(onAction).toHaveBeenCalledWith({ type: "complete_quest", quest: "Trading post" });
  });

  it("shows no Complete button on a quest the player already completed", () => {
    showQuests([WORKING_DISTRICT]);
    const card = screen.getByRole("region", { name: "Working district" });
    expect(within(card).queryByRole("button", { name: "Complete" })).toBeNull();
    expect(within(card).getByText("You · completed")).toBeDefined();
    expect(within(card).getByText("Tier 1 · 1 turn left")).toBeDefined();
    expect(within(card).getByRole("img", { name: "3 Residential cards" })).toBeDefined();
  });
});
