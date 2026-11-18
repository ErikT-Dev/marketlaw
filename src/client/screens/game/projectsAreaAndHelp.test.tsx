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
  it("has the PROJECTS title and offers the first-completion funds while nobody has completed", () => {
    show(roomUpdateWith({}));
    expect(screen.getByRole("heading", { name: "Projects" })).toBeDefined();
    const row = projectRow("Clean up the streets");
    expect(row.textContent).toContain("First to complete gets +2");
    expect(within(row).getByRole("img", { name: "Funds" })).toBeDefined();
    expect(row.textContent).not.toContain("Completed by");
  });

  it("names the other players who completed a project instead of the +2", () => {
    show(withOthersCompleted(roomUpdateWith({}), "quality", [1, 3]));
    const row = projectRow("Clean up the streets");
    expect(row.textContent).toContain("Completed by Ann, Cy");
    expect(row.textContent).not.toContain("First to complete");
    expect(within(row).queryByRole("img", { name: "Funds" })).toBeNull();
  });

  it("shows neither line when only you have completed a project", () => {
    show(roomUpdateWith({}, { projects: ["quality"] }));
    expect(projectRow("Clean up the streets").textContent).toBe(
      "Clean up the streets · you completed ✓",
    );
  });

  it("drops the +2 once a first completion was made", () => {
    show(roomUpdateWith({ firstCompletions: ["quality"] }));
    expect(projectRow("Clean up the streets").textContent).not.toContain("First to complete");
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
    expect(help.textContent).toContain("a quest nobody completes leaves after 5 turns.");
    expect(
      within(help)
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("aria-label")),
    ).toEqual(["Workforce", "Quality", "Satisfaction"]);
    fireEvent.click(button);
    expect(screen.queryByRole("region", { name: "How quests work" })).toBeNull();
  });

  it("closes the projects help with Escape and with a click elsewhere", () => {
    show(roomUpdateWith({}));
    const button = screen.getByRole("button", { name: "How projects work" });
    fireEvent.click(button);
    const help = screen.getByRole("region", { name: "How projects work" });
    expect(help.textContent).toContain("You have 3 projects.");
    expect(help.textContent).toContain("The end goal needs all 3 projects and");
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
      "Funds",
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
