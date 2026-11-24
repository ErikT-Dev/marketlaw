import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { QuestPlaceView } from "../../../shared/QuestPlaceView";
import { playerIconPictureUrl } from "../../icons/playerIconPictureUrl";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const TRADING_POST: QuestPlaceView = {
  quest: "Trading post",
  turnsLeft: 3,
  isInExtraTurn: false,
  completeRejection: null,
  progress: [
    { seat: 1, isCompleted: false, canCompleteNow: false, have: [3, 0], negativeStats: [] },
    { seat: 2, isCompleted: false, canCompleteNow: true, have: [4, 1], negativeStats: [] },
    { seat: 3, isCompleted: true, canCompleteNow: false, have: [5, 2], negativeStats: [] },
  ],
};

const WORKING_DISTRICT: QuestPlaceView = {
  quest: "Working district",
  turnsLeft: 1,
  isInExtraTurn: false,
  completeRejection: "quest_already_completed",
  progress: [
    { seat: 2, isCompleted: true, canCompleteNow: false, have: [3, 1], negativeStats: [] },
  ],
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
        .getAllByRole("button")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["You", "Ann", "Cy"]);
    expect(within(progress).getAllByRole("listitem")[2]?.textContent).toContain("· completed");
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
    const line = within(card).getByRole("listitem");
    expect(within(line).getByRole("button", { name: "You" })).toBeDefined();
    expect(line.textContent).toContain("· completed");
    expect(within(card).getByText("Tier 1 · 1 turn left")).toBeDefined();
    expect(within(card).getByRole("img", { name: "3 Residential cards" })).toBeDefined();
  });

  it("words a requirement of one completed project in the singular", () => {
    showQuests([
      {
        quest: "Civic pride",
        turnsLeft: 5,
        isInExtraTurn: false,
        completeRejection: "quest_needs_not_met",
        progress: [
          {
            seat: 2,
            isCompleted: false,
            canCompleteNow: false,
            have: [0, 2],
            negativeStats: [],
          },
        ],
      },
    ]);
    const card = screen.getByRole("region", { name: "Civic pride" });
    expect(within(card).getByRole("img", { name: "1 completed project" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "completed project 0 of 1" })).toBeDefined();
  });

  it("writes the sector name of a requirement in its sector colour", () => {
    showQuests([
      {
        quest: "Penthouses",
        turnsLeft: 5,
        isInExtraTurn: false,
        completeRejection: "quest_needs_not_met",
        progress: [
          {
            seat: 2,
            isCompleted: false,
            canCompleteNow: false,
            have: [2, 0, 1],
            negativeStats: [],
          },
        ],
      },
    ]);
    const card = screen.getByRole("region", { name: "Penthouses" });
    const need = within(card).getByRole("img", { name: "2 tier 3 Residential cards" });
    expect(need.textContent).toBe("2tier 3 Residential cards");
    expect(within(need).getByText("Residential").style.color).toBe(
      "var(--color-sector-residential-light)",
    );
  });

  it("shows another player's negative stat only when the quest names it", () => {
    showQuests([
      {
        quest: "Workers' housing",
        turnsLeft: 2,
        isInExtraTurn: false,
        completeRejection: "quest_needs_not_met",
        progress: [
          {
            seat: 1,
            isCompleted: false,
            canCompleteNow: false,
            have: [-1, 0],
            negativeStats: [
              { stat: "workforce", value: -1 },
              { stat: "satisfaction", value: -2 },
            ],
          },
        ],
      },
    ]);
    const card = screen.getByRole("region", { name: "Workers' housing" });
    expect(within(card).getByRole("img", { name: "Workforce -1 of 0" })).toBeDefined();
    expect(within(card).queryByRole("img", { name: /^Satisfaction/ })).toBeNull();
  });

  it("shows a player icon with the seat's picture in its picture colour on its background colour", () => {
    showQuests([TRADING_POST]);
    const card = screen.getByRole("region", { name: "Trading post" });
    const ann = within(card).getByRole("button", { name: "Ann" });
    expect(ann.style.background).toBe("rgb(30, 58, 138)");
    expect(ann.firstElementChild?.getAttribute("style")).toContain(
      playerIconPictureUrl("delapouite/bat"),
    );
    expect(ann.firstElementChild?.getAttribute("style")).toContain(
      "background-color: rgb(253, 230, 138)",
    );
    const you = within(card).getByRole("button", { name: "You" });
    expect(you.style.background).toBe("rgb(20, 83, 45)");
    expect(you.firstElementChild?.getAttribute("style")).toContain(
      playerIconPictureUrl("lorc/wolf-head"),
    );
  });

  it("gives the icon of another player who could complete the quest now an orange border", () => {
    showQuests([
      {
        ...TRADING_POST,
        progress: [
          { seat: 1, isCompleted: false, canCompleteNow: true, have: [4, 1], negativeStats: [] },
          { seat: 2, isCompleted: false, canCompleteNow: true, have: [4, 1], negativeStats: [] },
        ],
      },
    ]);
    const card = screen.getByRole("region", { name: "Trading post" });
    expect(within(card).getByRole("button", { name: "Ann" }).className).toContain("marked");
    expect(within(card).getByText("could complete it now")).toBeDefined();
    expect(within(card).getByRole("button", { name: "You" }).className).not.toContain("marked");
  });

  it("shows a negative workforce, quality or satisfaction as a part not yet met", () => {
    showQuests([
      {
        ...TRADING_POST,
        completeRejection: "quest_needs_not_met",
        progress: [
          {
            seat: 2,
            isCompleted: false,
            canCompleteNow: false,
            have: [4, 1],
            negativeStats: [
              { stat: "workforce", value: -1 },
              { stat: "satisfaction", value: -2 },
            ],
          },
        ],
      },
    ]);
    const card = screen.getByRole("region", { name: "Trading post" });
    expect(within(card).queryByRole("button", { name: "Complete" })).toBeNull();
    expect(within(card).getByRole("img", { name: "Workforce -1 of 0" })).toBeDefined();
    expect(within(card).getByRole("img", { name: "Satisfaction -2 of 0" })).toBeDefined();
    expect(within(card).queryByRole("img", { name: /^quality/ })).toBeNull();
  });
});
