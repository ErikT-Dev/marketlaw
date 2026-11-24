import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { gamePageProps } from "../../testing/gamePageProps";
import { photoLoaderThatDecodes } from "../../testing/photoLoaderThatDecodes";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { textWithIconNames } from "../../testing/textWithIconNames";
import { GamePage } from "../GamePage";
import { PhotoLoading } from "./PhotoLoading";

function playable(card: CardName) {
  return { card, realCost: 5, sameSectorAndTierInCity: 0, playRejection: null };
}

const OWN: Partial<OwnSeatView> = {
  hand: ["Loft", "Farm House"],
  handDetails: [playable("Loft"), playable("Farm House")],
  city: ["Fire Station"],
  typeCounts: { Mercantile: 2 },
  combos: [],
};

async function showGame(own: Partial<OwnSeatView> = {}) {
  const props = gamePageProps(roomUpdateWith({ phase: "main" }, { ...OWN, ...own }));
  render(
    <PhotoLoading value={photoLoaderThatDecodes(() => true)}>
      <GamePage {...props} />
    </PhotoLoading>,
  );
  await act(async () => Promise.resolve());
  return props;
}

function selectHandCard(name: string) {
  const hand = within(screen.getByRole("list", { name: "Your hand" }));
  fireEvent.click(hand.getByRole("button", { name }));
  return screen.getByRole("region", { name: `Selected card: ${name}` });
}

describe("selling from the big card", () => {
  it("asks before selling and then sells only the card shown in one action", async () => {
    const { onAction } = await showGame();
    const shown = within(selectHandCard("Loft"));
    fireEvent.click(shown.getByRole("button", { name: "Sell" }));
    expect(onAction).not.toHaveBeenCalled();
    expect(textWithIconNames(shown.getByText(/^Sell for/))).toBe("Sell for [Funds 10]?");
    fireEvent.click(shown.getByRole("button", { name: "Sell" }));
    expect(onAction).toHaveBeenCalledWith({ type: "sell", cards: ["Loft"] });
    expect(screen.queryByRole("region", { name: /^Selected card/ })).toBeNull();
  });

  it("keeps the card when the player does not confirm", async () => {
    const { onAction } = await showGame();
    const shown = within(selectHandCard("Loft"));
    fireEvent.click(shown.getByRole("button", { name: "Sell" }));
    fireEvent.click(shown.getByRole("button", { name: "Keep card" }));
    expect(shown.queryByText(/^Sell for/)).toBeNull();
    expect(shown.getByRole("button", { name: "Play card" })).toBeDefined();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("does not let a card be sold when the view says selling is not allowed", async () => {
    await showGame({ sellRejection: "action_limit_reached" });
    const shown = within(selectHandCard("Loft"));
    expect(shown.getByRole("button", { name: "Sell" })).toHaveProperty("disabled", true);
  });
});

describe("a hand card's combos on the big card", () => {
  it("highlights the combos playing it would make ready, an infinite one with its count", async () => {
    await showGame();
    const shown = within(selectHandCard("Loft"));
    const combos = shown.getAllByRole("group");
    expect(combos.map((combo) => combo.getAttribute("aria-label"))).toEqual([
      "Combo: 1 Mercantile gives 1 satisfaction, again each time, ready 2 times when played",
      "Combo: 1 Mass Transit gives 1 workforce",
      "Combo: Fire Station gives 1 quality, that card is in your city, ready when played",
      "Combo: Warehouse gives 1 satisfaction",
    ]);
    expect(combos[0]?.textContent).toContain("×2");
    expect(combos[1]?.textContent).not.toContain("×");
  });

  it("does not count times an infinite combo was already claimed", async () => {
    await showGame({
      city: ["Fire Station", "Loft"],
      combos: [{ card: "Loft", combo: 0, claimedTimes: 2, readyTimes: 0 }],
      typeCounts: { Mercantile: 3 },
    });
    const shown = within(selectHandCard("Loft"));
    expect(shown.getAllByRole("group")[0]?.getAttribute("aria-label")).toBe(
      "Combo: 1 Mercantile gives 1 satisfaction, again each time, ready 1 times when played",
    );
  });

  it("names the card a card-name combo needs when its number is focused", async () => {
    await showGame();
    const shown = within(selectHandCard("Loft"));
    const number = shown.getByRole("button", {
      name: `Card #${String(cardOf("Fire Station").number)}`,
    });
    const tooltip = shown.getByRole("tooltip", { name: "Fire Station" });
    expect(number.getAttribute("aria-describedby")).toBe(tooltip.id);
  });
});
