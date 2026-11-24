import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
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
    funds: 70,
    income: 100,
    influence: 0,
    workforce: 2,
    quality: 9,
    satisfaction: 4,
    product: 0,
    distribution: 0,
  },
};

function showGame(changes: Partial<OwnSeatView> = READY) {
  const props = gamePageProps(roomUpdateWith({ bonusTypes: ["Safety"] }, changes));
  render(<GamePage {...props} />);
  return props;
}

describe("your city and combos", () => {
  it("shows the city by sector and the combos with how many are ready, without claimed one-time combos", () => {
    showGame();
    expect(
      within(screen.getByRole("list", { name: "Your Residential cards" }))
        .getAllByRole("button")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual(["Row House"]);
    const combos = within(screen.getByRole("region", { name: "Combos · 1 ready" }));
    expect(combos.getAllByRole("listitem").map(textWithIconNames)).toEqual([
      "Row House · 1 [Safety][Quality +1]ready",
      "Fire Station · 1 [Suburban Housing][Quality +1]",
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
    expect(projects[0]).toBe("Clean up the streets 8/8Quality");
    expect(projects[2]).toBe("Help the homeless · you completed ✓");
  });

  it("shows a project completed this turn as completed", () => {
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
    expect(
      within(dialog.getByRole("list", { name: "Ready combos" }))
        .getAllByRole("listitem")
        .map(textWithIconNames),
    ).toEqual(["Row House · 1 [Safety][Quality +1]"]);
    expect(textWithIconNames(screen.getByRole("dialog", { name: "Claim all combos" }))).toContain(
      "You will get in total[Workforce +0] · [Quality +1] · [Satisfaction +0]",
    );
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
    const streetsItem = dialog.getByRole("listitem", { name: "Clean up the streets" });
    expect(textWithIconNames(streetsItem)).toContain(
      "Needs [Quality 8] and at least [Income 100] · you have [Quality 9] and [Income 100]",
    );
    const streets = within(streetsItem);
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
        funds: 70,
        income: 30,
        influence: 0,
        workforce: -1,
        quality: 9,
        satisfaction: 4,
        product: 0,
        distribution: 0,
      },
      projectRejections: {
        quality: "project_needs_not_met",
        satisfaction: "project_needs_not_met",
        workforce: "project_already_completed",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    const streetsItem = screen.getByRole("listitem", { name: "Clean up the streets" });
    expect(within(streetsItem).getByRole("button", { name: "Complete" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(textWithIconNames(streetsItem)).toContain(
      "You need 8 of the stat, at least 100 [Income], and no negative [Workforce], [Quality] or [Satisfaction].",
    );
  });

  it("gives the third project the same reward as the others", () => {
    showGame({ ...READY, projects: ["workforce", "satisfaction"] });
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    const dialog = textWithIconNames(screen.getByRole("dialog", { name: "Projects" }));
    expect(dialog).toContain(
      "gives [Income +10], [Funds +20], [Influence +3] and 1 card, every time.",
    );
    expect(dialog).not.toContain("3rd project");
    expect(dialog).not.toContain("first-completion");
  });

  it("shows each project with its own picture, loaded only when shown", () => {
    showGame();
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    const dialog = within(screen.getByRole("dialog", { name: "Projects" }));
    const pictures = ["Clean up the streets", "Culture campaign", "Help the homeless"].map(
      (title) =>
        within(dialog.getByRole("listitem", { name: title })).getByRole("img", {
          name: title,
        }),
    );
    expect(pictures.map((picture) => picture.getAttribute("src"))).toEqual([
      expect.stringMatching(/clean-the-streets\.webp$/),
      expect.stringMatching(/culture-campaign\.webp$/),
      expect.stringMatching(/help-the-homeless\.webp$/),
    ]);
    expect(pictures.map((picture) => picture.getAttribute("loading"))).toEqual([
      "lazy",
      "lazy",
      "lazy",
    ]);
  });
});

describe("highlighted actions", () => {
  it("highlights Claim all while it would claim something and Projects while a project can be completed", () => {
    showGame();
    expect(
      screen.getByRole("button", {
        name: "Claim all (1)",
        description: "You have combos ready to claim",
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: "Projects",
        description: "You can complete a project now",
      }),
    ).toBeDefined();
  });

  it("does not highlight Claim all or Projects when there is nothing to claim or complete", () => {
    showGame({
      ...READY,
      claimAllRejection: "nothing_to_claim",
      combos: [],
      projectRejections: {
        quality: "project_needs_not_met",
        satisfaction: "project_needs_not_met",
        workforce: "project_already_completed",
      },
    });
    expect(screen.getByRole("button", { name: "Claim all (0)" })).toBeDefined();
    expect(
      screen.queryByRole("button", { description: "You have combos ready to claim" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { description: "You can complete a project now" }),
    ).toBeNull();
  });

  it("shows the player's influence on the Use influence button", () => {
    showGame({
      ...READY,
      stats: {
        funds: 70,
        income: 100,
        influence: 6,
        workforce: 2,
        quality: 9,
        satisfaction: 4,
        product: 0,
        distribution: 0,
      },
    });
    expect(screen.getByRole("button", { name: "Use Influence 6" })).toBeDefined();
  });
});
