import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    { place: "residential", card: "Log House", phasesShown: 0 },
    { place: "industry", card: null, phasesShown: 0 },
    { place: "service", card: null, phasesShown: 0 },
    { place: "public_quality", card: null, phasesShown: 0 },
    { place: "public_satisfaction", card: null, phasesShown: 0 },
    { place: "open_1", card: "Law Firm", phasesShown: 0 },
    { place: "open_2", card: null, phasesShown: 0 },
    { place: "open_3", card: null, phasesShown: 0 },
  ],
};
const OWN: Partial<OwnSeatView> = {
  city: ["Row House", "Lake Park"],
  hand: ["Farm House"],
  handDetails: [
    { card: "Farm House", realCost: 6, sameSectorAndTierInCity: 2, playRejection: null },
  ],
};

function withCyCity(update: RoomUpdate): RoomUpdate {
  const game = update.game;
  if (game === null) {
    return update;
  }
  const seats = game.view.seats.map((seat) =>
    seat.seat === 3 ? { ...seat, city: ["Cottage", "Lake Park"] as const } : seat,
  );
  return { ...update, game: { ...game, view: { ...game.view, seats } } };
}

async function showGame() {
  const props = gamePageProps(withCyCity(roomUpdateWith(MAIN_PHASE, OWN)));
  render(
    <PhotoLoading value={photoLoaderThatDecodes(() => true)}>
      <GamePage {...props} />
    </PhotoLoading>,
  );
  await act(async () => Promise.resolve());
  return props;
}

function selectedCard() {
  return within(screen.getByRole("region", { name: /^Selected card: / }));
}

function cityCard(name: string) {
  return within(screen.getByRole("region", { name: /^Your city/ })).getByRole("button", { name });
}

describe("looking at a card in the big card", () => {
  it("shows a marketplace card with its base cost and Close only, and takes nothing", async () => {
    const { onAction } = await showGame();
    const marketplace = within(screen.getByRole("list", { name: "Marketplace places" }));
    fireEvent.click(marketplace.getByRole("button", { name: "Law Firm" }));
    expect(screen.getByRole("region", { name: "Selected card: Law Firm" })).toBeDefined();
    expect(textWithIconNames(screen.getByRole("heading", { name: /^Base cost/ }))).toBe(
      "Base cost [Funds 9]",
    );
    expect(selectedCard().getByRole("img", { name: "Cost 9" })).toBeDefined();
    expect(
      selectedCard()
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Close"]);
    expect(marketplace.getByRole("button", { name: "Law Firm" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(marketplace.queryByRole("button", { name: "Draw" })).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
    fireEvent.click(selectedCard().getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: /^Selected card: / })).toBeNull();
  });

  it("shows a card in your city and a type it counts twice as its icon twice", async () => {
    await showGame();
    fireEvent.click(cityCard("Lake Park"));
    expect(screen.getByRole("region", { name: "Selected card: Lake Park" })).toBeDefined();
    expect(cityCard("Lake Park").getAttribute("aria-pressed")).toBe("true");
    expect(selectedCard().getAllByRole("img", { name: "Beautification" })).toHaveLength(2);
    expect(selectedCard().queryByRole("button", { name: "Play card" })).toBeNull();
  });

  it("switches between a hand card and a looked at card, showing one at a time", async () => {
    await showGame();
    const hand = within(screen.getByRole("list", { name: "Your hand" }));
    fireEvent.click(hand.getByRole("button", { name: "Farm House" }));
    fireEvent.click(cityCard("Row House"));
    expect(screen.getByRole("region", { name: "Selected card: Row House" })).toBeDefined();
    expect(hand.getByRole("button", { name: "Farm House" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    fireEvent.click(hand.getByRole("button", { name: "Farm House" }));
    expect(screen.getByRole("region", { name: "Selected card: Farm House" })).toBeDefined();
    expect(cityCard("Row House").getAttribute("aria-pressed")).toBe("false");
  });

  it("shows a card in another player's city inside their detailed summary table, with Close back to the stats", async () => {
    await showGame();
    fireEvent.click(screen.getByRole("button", { name: "Detailed summary table of Cy" }));
    const board = within(screen.getByRole("dialog", { name: "Detailed summary table of Cy" }));
    fireEvent.click(board.getByRole("button", { name: "Lake Park" }));
    const shown = within(board.getByRole("region", { name: "Selected card: Lake Park" }));
    expect(shown.getByRole("img", { name: "Cost 9" })).toBeDefined();
    expect(shown.getAllByRole("img", { name: "Beautification" })).toHaveLength(2);
    expect(board.queryByRole("region", { name: "Stats of Cy" })).toBeNull();
    fireEvent.click(shown.getByRole("button", { name: "Close" }));
    expect(board.getByRole("region", { name: "Stats of Cy" })).toBeDefined();
    expect(screen.getByRole("dialog", { name: "Detailed summary table of Cy" })).toBeDefined();
  });
});
