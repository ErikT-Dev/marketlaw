import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ProjectName } from "../../../shared/ProjectName";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function withOthersCompleted(
  update: RoomUpdate,
  project: ProjectName,
  seats: ReadonlyArray<number>,
): RoomUpdate {
  if (update.game === null) {
    return update;
  }
  const view: PlayerView = {
    ...update.game.view,
    seats: update.game.view.seats.map((seat) =>
      seat.kind === "other" && seats.includes(seat.seat) ? { ...seat, projects: [project] } : seat,
    ),
  };
  return { ...update, game: { ...update.game, view } };
}

function projectRow(title: string) {
  const rows = within(screen.getByRole("list", { name: "Your projects" })).getAllByRole("listitem");
  const row = rows.find((item) => item.textContent.startsWith(title));
  if (row === undefined) {
    throw new Error(`no project row ${title}`);
  }
  return row;
}

function show(update: RoomUpdate) {
  render(<GamePage {...gamePageProps(update)} />);
}

describe("the projects area", () => {
  it("has the PROJECTS title and shows only your progress while nobody has completed", () => {
    show(roomUpdateWith({}));
    expect(screen.getByRole("heading", { name: "Projects" })).toBeDefined();
    const row = projectRow("Clean up the streets");
    expect(within(row).queryByRole("img", { name: "Funds" })).toBeNull();
    expect(row.textContent).not.toContain("Completed by");
  });

  it("names the other players who completed a project", () => {
    show(withOthersCompleted(roomUpdateWith({}), "quality", [1, 3]));
    const row = projectRow("Clean up the streets");
    expect(row.textContent).toContain("Completed by");
    expect(
      within(row)
        .getAllByRole("button")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Ann", "Cy"]);
  });

  it("shows neither line when only you have completed a project", () => {
    show(roomUpdateWith({}, { projects: ["quality"] }));
    expect(projectRow("Clean up the streets").textContent).toBe(
      "Clean up the streets · you completed ✓",
    );
  });
});

describe("the help buttons", () => {
  it("opens the quests help on click and closes it with the button", () => {
    show(roomUpdateWith({}));
    const button = screen.getByRole("button", { name: "How quests work" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const help = screen.getByRole("region", { name: "How quests work" });
    expect(help.textContent).toContain("Quests are shared goals.");
    expect(help.textContent).toContain(
      "everyone who completes it gets 2 Funds more for every tier of the quest. It then stays one more turn for the others, and leaves.",
    );
    expect(help.textContent).toContain(
      "A quest nobody completes leaves after 6 turns (tier 1), 5 (tier 2) or 4 (tier 3).",
    );
    expect(
      within(help)
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Workforce", "Quality", "Satisfaction", "Funds"]);
    fireEvent.click(button);
    expect(screen.queryByRole("region", { name: "How quests work" })).toBeNull();
  });

  it("closes the projects help with Escape and with a click elsewhere", () => {
    show(roomUpdateWith({}));
    const button = screen.getByRole("button", { name: "How projects work" });
    fireEvent.click(button);
    const help = screen.getByRole("region", { name: "How projects work" });
    expect(help.textContent).toContain("You have 3 projects.");
    expect(help.textContent).toContain(
      "and 1 card, every time. The end goal needs all 3 projects and Income 200.",
    );
    expect(
      within(help)
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual([
      "Income",
      "Workforce",
      "Quality",
      "Satisfaction",
      "Income",
      "Funds",
      "Influence",
      "Income",
    ]);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "How projects work" })).toBeNull();
    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByRole("region", { name: "How projects work" }));
    expect(screen.getByRole("region", { name: "How projects work" })).toBeDefined();
    fireEvent.pointerDown(screen.getByRole("heading", { name: "Your stats" }));
    expect(screen.queryByRole("region", { name: "How projects work" })).toBeNull();
  });
});
