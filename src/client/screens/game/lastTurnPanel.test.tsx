import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LastTurn } from "../../../shared/LastTurn";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const NOTHING: LastTurn = { quests: [], projects: [], incomeGains: [], support: [] };

const BUSY_TURN: LastTurn = {
  quests: [
    { quest: "Growing suburbs", seats: [1, 2], firstCompletionFunds: 0 },
    { quest: "Working district", seats: [3], firstCompletionFunds: 2 },
  ],
  projects: [{ project: "quality", seats: [4] }],
  incomeGains: [
    { seat: 2, income: 2 },
    { seat: 3, income: 1 },
  ],
  support: [{ seat: 4, funds: 20 }],
};

function showLastTurn(lastTurn: LastTurn, turn = 3) {
  render(<GamePage {...gamePageProps(roomUpdateWith({ turn, lastTurn }))} />);
}

function rowTexts(name: string): ReadonlyArray<string | null> {
  const panel = screen.getByRole("region", { name: "Last turn" });
  return within(within(panel).getByRole("list", { name }))
    .getAllByRole("listitem")
    .map((row) => row.textContent);
}

describe("last turn panel", () => {
  it("is titled with the turn before and lists its quests projects income and Support", () => {
    showLastTurn(BUSY_TURN, 7);
    const panel = screen.getByRole("region", { name: "Last turn" });
    expect(within(panel).getByRole("heading", { level: 2 }).textContent).toBe("Last turn · Turn 6");
    expect(rowTexts("Quests completed")).toEqual([
      expect.stringContaining("AnnGrowing suburbs"),
      expect.stringContaining("YouGrowing suburbs"),
      expect.stringContaining("CyWorking district"),
    ]);
    expect(rowTexts("Projects completed")).toEqual([expect.stringContaining("Di")]);
    expect(rowTexts("Income gained")).toEqual([
      expect.stringMatching(/You\+2\.0$/),
      expect.stringMatching(/Cy\+1\.0$/),
    ]);
    expect(rowTexts("Support")).toEqual([expect.stringMatching(/Di\+2$/)]);
  });

  it("shows each quest reward and each gain as icons named by their stats", () => {
    showLastTurn(BUSY_TURN);
    const panel = screen.getByRole("region", { name: "Last turn" });
    const [ann] = within(
      within(panel).getByRole("list", { name: "Quests completed" }),
    ).getAllByRole("listitem");
    expect(
      within(ann ?? panel)
        .getAllByRole("img")
        .map((part) => part.getAttribute("aria-label") ?? part.getAttribute("alt")),
    ).toEqual(["gain 1 Town Housing", "+1 quality"]);
    const income = within(panel).getByRole("list", { name: "Income gained" });
    expect(within(income).getAllByRole("img", { name: "Income" })).toHaveLength(2);
    const projects = within(panel).getByRole("list", { name: "Projects completed" });
    expect(within(projects).getByRole("img", { name: "Quality" })).toBeDefined();
    expect(within(panel).getByRole("button", { name: "Ann" })).toBeDefined();
  });

  it("adds the extra funds of a first completion to the quest reward's funds", () => {
    showLastTurn(BUSY_TURN);
    const panel = screen.getByRole("region", { name: "Last turn" });
    const cy = within(within(panel).getByRole("list", { name: "Quests completed" })).getAllByRole(
      "listitem",
    )[2];
    expect(
      within(cy ?? panel)
        .getAllByRole("img")
        .map((part) => part.getAttribute("aria-label") ?? part.getAttribute("alt")),
    ).toEqual(["+2 funds", "+1 influence", "+1 quality"]);
  });

  it("says nothing new when nothing happened in the turn before", () => {
    showLastTurn(NOTHING);
    const panel = screen.getByRole("region", { name: "Last turn" });
    expect(within(panel).getByText("Nothing new last turn.")).toBeDefined();
    expect(within(panel).queryAllByRole("list")).toHaveLength(0);
  });

  it("is not shown in turn 1", () => {
    showLastTurn(BUSY_TURN, 1);
    expect(screen.queryByRole("region", { name: "Last turn" })).toBeNull();
  });
});
