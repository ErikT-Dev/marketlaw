import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ComboStatus } from "../../../shared/ComboStatus";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";

const CITY = [
  "Farm House",
  "Countryside Stone House",
  "Large Country Manor",
  "Garden Apartment",
] as const;

function status(
  card: (typeof CITY)[number],
  combo: number,
  times: { readonly claimed?: number; readonly ready?: number } = {},
): ComboStatus {
  return { card, combo, claimedTimes: times.claimed ?? 0, readyTimes: times.ready ?? 0 };
}

const COMBOS: ReadonlyArray<ComboStatus> = [
  status("Farm House", 0, { claimed: 1 }),
  status("Farm House", 1),
  status("Farm House", 2),
  status("Farm House", 3),
  status("Countryside Stone House", 0, { claimed: 1, ready: 3 }),
  status("Countryside Stone House", 1),
  status("Countryside Stone House", 2),
  status("Countryside Stone House", 3),
  status("Large Country Manor", 0, { claimed: 2 }),
  status("Large Country Manor", 1),
  status("Large Country Manor", 2),
  status("Large Country Manor", 3),
  status("Garden Apartment", 0),
  status("Garden Apartment", 1, { ready: 1 }),
  status("Garden Apartment", 2, { ready: 1 }),
  status("Garden Apartment", 3),
];

function showGame() {
  const update = roomUpdateWith({}, { city: CITY, combos: COMBOS, claimAllRejection: null });
  render(<GamePage {...gamePageProps(update)} />);
}

function comboRows(list: HTMLElement): ReadonlyArray<string> {
  return within(list).getAllByRole("listitem").map(textWithIconNames);
}

describe("combos list", () => {
  it("lists ready combos first, then combos by the type your city needs most, then card-name combos", () => {
    showGame();
    const panel = screen.getByRole("region", { name: "Combos · 3 ready" });
    expect(comboRows(within(panel).getByRole("list"))).toEqual([
      "Countryside Stone House · 2 [Farm], again at every multiple[Quality +1]ready ×3",
      "Garden Apartment · 1 [Health][Satisfaction +1]ready",
      "Garden Apartment · 1 [Safety][Quality +1]ready",
      "Large Country Manor · 1 [Farm], again at every multiple[Quality +1]claimed",
      "Garden Apartment · 1 [Farm][Satisfaction +1]",
      "Farm House · 2 [Farm][Workforce +1]",
      "Farm House · 5 [Farm][Workforce +1]",
      "Large Country Manor · 5 [Farm][Quality +1]",
      "Garden Apartment · 1 [Beautification], again at every multiple[Quality +1]",
      "Large Country Manor · 3 [Beautification][Satisfaction +1]",
      "Countryside Stone House · 1 [Health][Quality +1]",
      "Large Country Manor · 2 [Luxury][Satisfaction +1]",
      "Farm House · Farmers Market in your city[Satisfaction +1]",
      "Countryside Stone House · Publisher in your city[Quality +1]",
      "Countryside Stone House · Stone Quarry in your city[Quality +1]",
    ]);
  });

  it("counts every claim Claim all would make and lists the ready combos in the same order", () => {
    showGame();
    fireEvent.click(screen.getByRole("button", { name: "Claim all (5)" }));
    const dialog = within(screen.getByRole("dialog", { name: "Claim all combos" }));
    expect(comboRows(dialog.getByRole("list", { name: "Ready combos" }))).toEqual([
      "Countryside Stone House · 2 [Farm], again at every multiple[Quality +1] ×3",
      "Garden Apartment · 1 [Health][Satisfaction +1]",
      "Garden Apartment · 1 [Safety][Quality +1]",
    ]);
  });
});

function withClaimedCombosOfDi(update: RoomUpdate): RoomUpdate {
  const game = update.game;
  if (game === null) {
    return update;
  }
  const seats = game.view.seats.map((seat) =>
    seat.seat === 4 && seat.kind === "other"
      ? {
          ...seat,
          city: ["Farm House", "Large Country Manor"] as const,
          combosClaimed: [
            { card: "Farm House", combo: 3, times: 1 },
            { card: "Large Country Manor", combo: 3, times: 1 },
            { card: "Farm House", combo: 0, times: 1 },
            { card: "Large Country Manor", combo: 0, times: 4 },
          ] as const,
        }
      : seat,
  );
  return { ...update, game: { ...game, view: { ...game.view, seats } } };
}

describe("detailed summary table", () => {
  it("lists the combos a player has claimed in the order of the combos list without the cards they are printed on", () => {
    render(<GamePage {...gamePageProps(withClaimedCombosOfDi(roomUpdateWith({})))} />);
    fireEvent.click(
      within(screen.getByRole("region", { name: "Opponents" })).getByRole("button", {
        name: "Detailed summary table of Di",
      }),
    );
    const board = within(screen.getByRole("dialog", { name: "Detailed summary table of Di" }));
    expect(comboRows(board.getByRole("list", { name: "Combos claimed by Di" }))).toEqual([
      "1 [Farm], again at every multiple[Quality +1]×4",
      "1 [Farm][Workforce +1]",
      "5 [Farm][Quality +1]",
      "Farmers Market in their city[Satisfaction +1]",
    ]);
  });
});
