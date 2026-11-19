import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { ComboStatus } from "../../../shared/ComboStatus";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import { gamePageProps } from "../../testing/gamePageProps";
import { photoLoaderThatDecodes } from "../../testing/photoLoaderThatDecodes";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";
import { PhotoLoading } from "./PhotoLoading";

const MAIN_PHASE: Partial<PlayerView> = {
  phase: "main",
  marketplace: [
    { place: "residential", card: "Loft", phasesShown: 0 },
    { place: "industry", card: null, phasesShown: 0 },
    { place: "service", card: null, phasesShown: 0 },
    { place: "public_quality", card: null, phasesShown: 0 },
    { place: "public_satisfaction", card: null, phasesShown: 0 },
    { place: "open_1", card: null, phasesShown: 0 },
    { place: "open_2", card: null, phasesShown: 0 },
    { place: "open_3", card: null, phasesShown: 0 },
  ],
};

function status(card: CardName, combo: number, claimedTimes = 0): ComboStatus {
  return { card, combo, claimedTimes, readyTimes: 0 };
}

function ownSeat(hand: ReadonlyArray<CardName>, combos: ReadonlyArray<ComboStatus>) {
  return {
    city: ["Cottage", "Lake Park", "Fire Station"],
    hand,
    handDetails: hand.map((card) => ({
      card,
      realCost: 5,
      sameSectorAndTierInCity: 0,
      playRejection: null,
    })),
    combos,
  } satisfies Partial<OwnSeatView>;
}

const OPEN_COMBOS = [status("Cottage", 1), status("Cottage", 2), status("Lake Park", 3)];

function withCyCity(update: RoomUpdate): RoomUpdate {
  const game = update.game;
  if (game === null) {
    return update;
  }
  const seats = game.view.seats.map((seat) =>
    seat.seat === 3 ? { ...seat, city: ["Loft"] as const } : seat,
  );
  return { ...update, game: { ...game, view: { ...game.view, seats } } };
}

async function showGame(own: Partial<OwnSeatView>) {
  render(
    <PhotoLoading value={photoLoaderThatDecodes(() => true)}>
      <GamePage {...gamePageProps(withCyCity(roomUpdateWith(MAIN_PHASE, own)))} />
    </PhotoLoading>,
  );
  await act(async () => Promise.resolve());
}

function selectHandCard(name: string) {
  const hand = within(screen.getByRole("list", { name: "Your hand" }));
  fireEvent.click(hand.getByRole("button", { name }));
  return screen.getByRole("region", { name: `Selected card: ${name}` });
}

function comboNames(region: HTMLElement) {
  return within(region)
    .getAllByRole("group")
    .map((combo) => combo.getAttribute("aria-label"));
}

describe("card-name combos on the big card", () => {
  it("shows a hand card's name in red with the combos it would make ready in both directions", async () => {
    await showGame(ownSeat(["Hiking Trail", "Warehouse"], OPEN_COMBOS));
    const shown = within(selectHandCard("Hiking Trail"));
    const name = shown.getByRole("button", { name: "Hiking Trail!" });
    expect(name.textContent).toContain("Hiking Trail !");
    const tooltip = shown.getByRole("tooltip");
    expect(name.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(textWithIconNames(tooltip)).toBe(
      "Playing it makes these combos ready:#2 Cottage [Satisfaction +1]#212 Lake Park [Satisfaction +1]Total: [Satisfaction 2]",
    );
  });

  it("highlights a combo red when its card is in your city and orange when it is only in your hand, in the sorted combos", async () => {
    await showGame(ownSeat(["Hiking Trail", "Warehouse"], OPEN_COMBOS));
    fireEvent.click(
      within(screen.getByRole("list", { name: "Marketplace places" })).getByRole("button", {
        name: "Loft",
      }),
    );
    const region = screen.getByRole("region", { name: "Selected card: Loft" });
    const shown = within(region);
    expect(comboNames(region)).toEqual([
      "Combo: 1 Mercantile gives 1 satisfaction, again each time",
      "Combo: 1 Mass Transit gives 1 workforce",
      "Combo: Fire Station gives 1 quality, that card is in your city",
      "Combo: Warehouse gives 1 satisfaction, that card is in your hand",
    ]);
    expect(textWithIconNames(shown.getByRole("tooltip"))).toContain("Total: [Quality 1]");
  });

  it("does not count one-time combos already claimed", async () => {
    const own = ownSeat(
      ["Hiking Trail"],
      [status("Cottage", 2, 1), status("Hiking Trail", 2, 1), status("Lake Park", 3)],
    );
    await showGame({ ...own, city: [...own.city, "Hiking Trail"] });
    const shown = within(selectHandCard("Hiking Trail"));
    expect(shown.queryByRole("button", { name: "Hiking Trail!" })).toBeNull();
    expect(shown.queryByRole("tooltip")).toBeNull();
  });

  it("marks a card in another player's city against your own city and hand", async () => {
    await showGame(ownSeat(["Warehouse"], OPEN_COMBOS));
    fireEvent.click(screen.getByRole("button", { name: "Detailed summary table of Cy" }));
    const board = within(screen.getByRole("dialog", { name: "Detailed summary table of Cy" }));
    fireEvent.click(board.getByRole("button", { name: "Loft" }));
    const region = board.getByRole("region", { name: "Selected card: Loft" });
    const shown = within(region);
    expect(shown.getByRole("button", { name: "Loft!" })).toBeDefined();
    expect(comboNames(region).slice(2)).toEqual([
      "Combo: Fire Station gives 1 quality, that card is in your city",
      "Combo: Warehouse gives 1 satisfaction, that card is in your hand",
    ]);
  });

  it("shows no marks on a card of your own city", async () => {
    await showGame(ownSeat(["Hiking Trail"], OPEN_COMBOS));
    fireEvent.click(
      within(screen.getByRole("region", { name: /^Your city/ })).getByRole("button", {
        name: "Cottage",
      }),
    );
    const region = screen.getByRole("region", { name: "Selected card: Cottage" });
    const shown = within(region);
    expect(shown.queryByRole("tooltip")).toBeNull();
    expect(comboNames(region).every((name) => name?.endsWith("gives 1 satisfaction"))).toBe(true);
  });
});
