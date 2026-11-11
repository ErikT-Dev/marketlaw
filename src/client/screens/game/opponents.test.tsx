import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

function withDiCity(update: RoomUpdate): RoomUpdate {
  const game = update.game;
  if (game === null) {
    return update;
  }
  return {
    ...update,
    game: {
      ...game,
      view: {
        ...game.view,
        seats: game.view.seats.map((seat) =>
          seat.seat === 4 ? { ...seat, city: ["Cottage", "Loft", "Pub"], handCount: 5 } : seat,
        ),
      },
    },
  };
}

function opponents() {
  return within(screen.getByRole("region", { name: "Opponents" }));
}

describe("opponents overview", () => {
  it("shows a card for every other player with status, funds, income, hand and cards per sector", () => {
    render(<GamePage {...gamePageProps(withDiCity(roomUpdateWith({})))} />);
    expect(
      opponents()
        .getAllByRole("article")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual(["Ann", "Cy", "Di"]);
    const di = within(opponents().getByRole("article", { name: "Di" }));
    expect(di.getByRole("img", { name: "Funds 7" })).toBeDefined();
    expect(di.getByRole("img", { name: "Income 14" })).toBeDefined();
    expect(di.getByText("Hand 5")).toBeDefined();
    expect(
      within(di.getByRole("list", { name: "Cards in play of Di" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Residential 2", "Industry 0", "Service 1", "Public 0"]);
    expect(
      within(opponents().getByRole("article", { name: "Cy" })).getByText("done"),
    ).toBeDefined();
    expect(
      within(opponents().getByRole("article", { name: "Ann" })).getByText("left"),
    ).toBeDefined();
  });
});

describe("opponent's board", () => {
  it("opens from the card, says it shows the start of the main phase, and lists the city by sector", () => {
    render(<GamePage {...gamePageProps(withDiCity(roomUpdateWith({})))} />);
    fireEvent.click(opponents().getByRole("button", { name: "See Di's board ›" }));
    const board = within(screen.getByRole("dialog", { name: "Di's board" }));
    expect(
      board.getByText(
        "Shown as at the start of this main phase: what they do in it is revealed when the main phase ends. Their hand: 5 cards.",
      ),
    ).toBeDefined();
    expect(board.getByRole("img", { name: "Influence 3" })).toBeDefined();
    expect(board.getByRole("img", { name: "Build passes 2" })).toBeDefined();
    const residential = within(board.getByRole("region", { name: "Residential cards of Di" }));
    expect(
      residential.getAllByRole("button").map((item) => item.getAttribute("aria-label")),
    ).toEqual(["Cottage", "Loft"]);
    expect(board.getByText("This turn: playing, not done yet")).toBeDefined();
  });

  it("closes with Close or Escape", () => {
    render(<GamePage {...gamePageProps(roomUpdateWith({}))} />);
    fireEvent.click(opponents().getByRole("button", { name: "See Cy's board ›" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(opponents().getByRole("button", { name: "See Cy's board ›" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
