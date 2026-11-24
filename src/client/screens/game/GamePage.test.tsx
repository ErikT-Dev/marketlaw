import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

describe("game page top bar", () => {
  it("shows the turn out of the turn limit and the phase", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    expect(screen.getByRole("heading", { level: 1, name: "Turn 3 of 40" })).toBeDefined();
    expect(screen.getByText("Main phase")).toBeDefined();
  });

  it("shows the player order from the first player, then players who left, with their status", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    const badges = within(screen.getByRole("list", { name: "Player order" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(badges).toEqual(["Cydonefirst player", "Di", "Bea", "Annleft"]);
  });

  it("shows no player status once the game is over", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({ phase: "ended" }))} />);
    const badges = within(screen.getByRole("list", { name: "Player order" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(badges).toEqual(["Cyfirst player", "Di", "Bea", "Ann"]);
  });
});

describe("your stats panel", () => {
  it("shows every stat of S6.2 as an icon named after the stat", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    const stats = within(screen.getByRole("list", { name: "Stat values" }))
      .getAllByRole("img")
      .map((chip) => chip.getAttribute("aria-label"));
    expect(stats).toEqual([
      "Funds 70",
      "Income 140",
      "Workforce 6",
      "Quality 5",
      "Satisfaction 4",
      "Product 2",
      "Distribution 1",
      "Build passes 2",
      "Influence 3",
    ]);
  });
});
