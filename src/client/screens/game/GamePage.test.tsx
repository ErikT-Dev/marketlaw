import { render, screen, within } from "@testing-library/react";
import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { RoomCode } from "../../../shared/RoomCode";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { GamePage } from "../GamePage";

const STATS = {
  funds: 7,
  income: 14,
  influence: 3,
  workforce: 6,
  quality: 5,
  satisfaction: 4,
  product: 2,
  distribution: 1,
  bonus: 8,
};
const SEAT_COMMON = {
  stats: STATS,
  city: [],
  buildPasses: 2,
  isDone: false,
  hasLeft: false,
  timeBankMs: 0,
};
const MINE: OwnSeatView = {
  ...SEAT_COMMON,
  kind: "own",
  seat: 2,
  hand: ["Loft"],
  hasPlayedThisTurn: false,
  hasSkippedBuild: false,
  actionsThisTurn: 0,
};

function other(seat: SeatNumber, changes: Partial<OtherSeatView>): OtherSeatView {
  return { ...SEAT_COMMON, kind: "other", seat, handCount: 7, ...changes };
}

function updateWith(changes: Partial<PlayerView>): RoomUpdate {
  const view: PlayerView = {
    seat: 2,
    turn: 3,
    phase: "main",
    seats: [other(1, { hasLeft: true }), MINE, other(3, { isDone: true }), other(4, {})],
    deckCount: 100,
    discard: [],
    marketplace: [],
    quests: [],
    bonusTypes: [],
    doneOrder: [3],
    playerOrder: [3, 4, 2],
    ...changes,
  };
  return {
    room: {
      code: v.parse(RoomCode, "ABCDEF"),
      size: 4,
      playerNames: ["Ann", "Bea", "Cy", "Di"],
      mySeat: 2,
    },
    game: { stateVersion: 1, view },
  };
}

describe("game page top bar", () => {
  it("shows the turn out of the turn limit and the phase", () => {
    const view = render(<GamePage update={updateWith({})} onAction={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1, name: "Turn 3 of 40" })).toBeDefined();
    expect(screen.getByText("Main phase")).toBeDefined();
    view.unmount();
  });

  it("shows the player order from the first player, then players who left, with their status", () => {
    const view = render(<GamePage update={updateWith({})} onAction={vi.fn()} />);
    const badges = within(screen.getByRole("list", { name: "Player order" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(badges).toEqual(["Cydonefirst player", "Di", "You", "Annleft"]);
    view.unmount();
  });
});

describe("your stats panel", () => {
  it("shows every stat of S6.2 as an icon named after the stat", () => {
    const view = render(<GamePage update={updateWith({})} onAction={vi.fn()} />);
    const stats = within(screen.getByRole("list", { name: "Your stats" }))
      .getAllByRole("img")
      .map((chip) => chip.getAttribute("aria-label"));
    expect(stats).toEqual([
      "Funds 7",
      "Income 14",
      "Workforce 6",
      "Quality 5",
      "Satisfaction 4",
      "Product 2",
      "Distribution 1",
      "Bonus 8",
      "Build passes 2",
      "Influence 3",
    ]);
    view.unmount();
  });
});
