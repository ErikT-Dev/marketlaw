import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const READY: Partial<OwnSeatView> = {
  city: ["Row House", "Fire Station", "Fast Food Restaurant"],
  typeCounts: { "Town Housing": 1, Safety: 1, Food: 1 },
  combos: [
    { card: "Row House", combo: 0, claimedTimes: 0, readyTimes: 1 },
    { card: "Row House", combo: 1, claimedTimes: 1, readyTimes: 0 },
    { card: "Fire Station", combo: 0, claimedTimes: 0, readyTimes: 0 },
  ],
  claimAllRejection: null,
  projectRejections: {
    quality: null,
    satisfaction: "project_needs_not_met",
    workforce: "project_already_completed",
  },
  projects: ["workforce"],
  stats: {
    funds: 7,
    income: 3,
    influence: 0,
    workforce: 2,
    quality: 9,
    satisfaction: 4,
    product: 0,
    distribution: 0,
    bonus: 0,
  },
};

function showGame(changes: Partial<OwnSeatView> = READY) {
  const props = gamePageProps(roomUpdateWith({ bonusTypes: ["Safety"] }, changes));
  render(<GamePage {...props} />);
  return props;
}

describe("your city and combos", () => {
  it("shows the city by sector and the combos with how many are ready", () => {
    showGame();
    expect(
      within(screen.getByRole("list", { name: "Your Residential cards" }))
        .getAllByRole("listitem")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual(["Row House"]);
    const combos = within(screen.getByRole("region", { name: "Combos · 1 ready" }));
    expect(combos.getAllByRole("listitem").map((row) => row.textContent)).toEqual([
      "Row House · 1 Safety+1 qualityready",
      "Row House · 1 Rental Space+1 satisfactionclaimed",
      "Fire Station · 1 Suburban Housing+1 quality",
    ]);
  });
});

describe("your stats", () => {
  it("shows type counts with the bonus types first, and project progress", () => {
    showGame();
    const types = within(screen.getByRole("list", { name: "Your type counts, bonus types first" }))
      .getAllByRole("img")
      .map((chip) => chip.getAttribute("aria-label"));
    expect(types[0]).toBe("Safety 1");
    expect(types).toHaveLength(3);
    const projects = within(screen.getByRole("list", { name: "Your projects" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(projects[0]).toContain("Clean up the streets");
    expect(projects[0]).toContain("First to complete gets +2");
    expect(projects[2]).toBe("Help the homeless · you completed ✓");
  });

  it("shows a project completed this turn as completed, without the first-completion note", () => {
    showGame({ ...READY, projects: ["quality"] });
    const projects = within(screen.getByRole("list", { name: "Your projects" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(projects[0]).toBe("Clean up the streets · you completed ✓");
  });
});

describe("claim all", () => {
  it("lists the ready combos with the totals and claims them", () => {
    const { onAction } = showGame();
    fireEvent.click(screen.getByRole("button", { name: "Claim all (1)" }));
    const dialog = within(screen.getByRole("dialog", { name: "Claim all combos" }));
    expect(dialog.getByText("This combo is ready:")).toBeDefined();
    expect(dialog.getByText("+0 workforce · +1 quality · +0 satisfaction")).toBeDefined();
    fireEvent.click(dialog.getByRole("button", { name: "Claim all" }));
    expect(onAction).toHaveBeenCalledWith({ type: "claim_all" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cannot be opened when no combo is ready", () => {
    showGame({ ...READY, claimAllRejection: "nothing_to_claim", combos: [] });
    expect(screen.getByRole("button", { name: "Claim all (0)" })).toHaveProperty("disabled", true);
  });
});

describe("projects", () => {
  it("shows each project's need and lets the player complete the one they can", () => {
    const { onAction } = showGame();
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    const dialog = within(screen.getByRole("dialog", { name: "Projects" }));
    const streets = within(dialog.getByRole("listitem", { name: "Clean up the streets" }));
    expect(streets.getByText("Needs 8 quality · you have 9")).toBeDefined();
    const campaign = within(dialog.getByRole("listitem", { name: "Culture campaign" }));
    expect(campaign.getByRole("button", { name: "Need 4 more" })).toHaveProperty("disabled", true);
    const homeless = within(dialog.getByRole("listitem", { name: "Help the homeless" }));
    expect(homeless.getByRole("button", { name: "Completed ✓" })).toHaveProperty("disabled", true);
    fireEvent.click(streets.getByRole("button", { name: "Complete" }));
    expect(onAction).toHaveBeenCalledWith({ type: "complete_project", project: "quality" });
  });

  it("says why a project with enough of its stat cannot be completed", () => {
    showGame({
      ...READY,
      stats: {
        funds: 7,
        income: 3,
        influence: 0,
        workforce: -1,
        quality: 9,
        satisfaction: 4,
        product: 0,
        distribution: 0,
        bonus: 0,
      },
      projectRejections: {
        quality: "project_needs_not_met",
        satisfaction: "project_needs_not_met",
        workforce: "project_already_completed",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    const streets = within(screen.getByRole("listitem", { name: "Clean up the streets" }));
    expect(streets.getByRole("button", { name: "Complete" })).toHaveProperty("disabled", true);
    expect(
      streets.getByText(
        "You need 8 of the stat, and no negative workforce, quality or satisfaction.",
      ),
    ).toBeDefined();
  });

  it("says when the next project would be the third", () => {
    showGame({ ...READY, projects: ["workforce", "satisfaction"] });
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    expect(
      screen.getByText(
        "This would be your 3rd project: it also gives +1 more income and 1 more card.",
      ),
    ).toBeDefined();
  });
});
