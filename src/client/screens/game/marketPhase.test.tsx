import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MarketplaceSlot } from "../../../shared/MarketplaceSlot";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { gamePageProps } from "../../testing/gamePageProps";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";

const MARKETPLACE: ReadonlyArray<MarketplaceSlot> = [
  { place: "residential", card: "Log House", phasesShown: 0 },
  { place: "industry", card: null, phasesShown: 0 },
  { place: "service", card: null, phasesShown: 0 },
  { place: "public_quality", card: "Trauma Center", phasesShown: 1 },
  { place: "public_satisfaction", card: "Green Park", phasesShown: 1 },
  { place: "open_1", card: "Law Firm", phasesShown: 0 },
  { place: "open_2", card: "Saw Mill", phasesShown: 0 },
  { place: "open_3", card: "Idyllic View Condominium", phasesShown: 0 },
];
const MARKET_VIEW: Partial<PlayerView> = {
  phase: "market",
  marketplace: MARKETPLACE,
  bonusTypes: ["Farm", "Luxury"],
};
const ON_YOUR_GO: Partial<OwnSeatView> = {
  turnDrawRejection: null,
  marketCardRejection: null,
  sellRejection: "wrong_phase",
  endTurnRejection: "wrong_phase",
};

function showGame(view: Partial<PlayerView>, own: Partial<OwnSeatView> = {}) {
  const props = gamePageProps(roomUpdateWith({ ...MARKET_VIEW, ...view }, own));
  render(<GamePage {...props} />);
  return props;
}

function marketplace() {
  return within(screen.getByRole("list", { name: "Marketplace places" }));
}

describe("the marketplace", () => {
  it("shows the 8 places in order with their cards and turns left or Empty until next turn", () => {
    showGame({ marketGo: 3 });
    expect(
      marketplace()
        .getAllByRole("listitem")
        .map((place) => place.textContent),
    ).toEqual([
      "ResidentialTier 1Log House2 turns left",
      "IndustryEmpty until next turn",
      "ServiceEmpty until next turn",
      "PublicTier 1Trauma Center1 turn left",
      "PublicTier 1Green Park1 turn left",
      "Open place 1Tier 2Law Firm2 turns left",
      "Open place 2Tier 2Saw Mill2 turns left",
      "Open place 3Tier 3Idyllic View Condominium2 turns left",
    ]);
    expect(
      marketplace()
        .getAllByRole("img")
        .map((icon) => icon.getAttribute("alt")),
    ).toEqual(["quality", "satisfaction"]);
    fireEvent.click(marketplace().getByRole("button", { name: "Law Firm" }));
    expect(marketplace().queryByRole("button", { name: "Draw" })).toBeNull();
  });

  it("says a card that has had its last market phase leaves next turn", () => {
    showGame({
      phase: "main",
      marketplace: MARKETPLACE.map((slot) =>
        slot.card === "Trauma Center" ? { ...slot, phasesShown: 2 } : slot,
      ),
    });
    expect(
      marketplace()
        .getAllByRole("listitem")
        .map((place) => place.textContent),
    ).toContain("PublicTier 1Trauma CenterLeaves next turn");
  });

  it("shows the bonus types with their points, the deck and the discard pile", () => {
    showGame({ deckCount: 112, discardCount: 1 });
    const panel = within(screen.getByRole("region", { name: "Marketplace" }));
    expect(panel.getByText(/Bonus types/).textContent).toBe("Bonus types:Farm3 ptsLuxury2 pts");
    expect(panel.getByText("Deck 112")).toBeDefined();
    expect(panel.getByText("Discard 1")).toBeDefined();
  });
});

describe("the market go panel", () => {
  it("on your go takes a selected marketplace card with Draw or draws from a chosen sector", () => {
    const { onAction } = showGame({ marketGo: 2 }, ON_YOUR_GO);
    const panel = within(screen.getByRole("region", { name: "Your go: choose your turn draw" }));
    expect(
      panel.getByText(
        "Choose one of the two options. If your time runs out, your go ends without a draw, and you choose a sector for your 2 cards later in your main phase.",
      ),
    ).toBeDefined();
    expect(marketplace().queryByRole("button", { name: "Draw" })).toBeNull();
    fireEvent.click(marketplace().getByRole("button", { name: "Saw Mill" }));
    fireEvent.click(marketplace().getByRole("button", { name: "Law Firm" }));
    expect(onAction).not.toHaveBeenCalled();
    expect(
      marketplace().getByRole("button", { name: "Law Firm" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      marketplace().getByRole("button", { name: "Saw Mill" }).getAttribute("aria-pressed"),
    ).toBe("false");
    const lawFirm = marketplace()
      .getAllByRole("listitem")
      .find((place) => place.textContent.includes("Law Firm"));
    fireEvent.click(within(lawFirm ?? document.body).getByRole("button", { name: "Draw" }));
    expect(onAction).toHaveBeenLastCalledWith({
      type: "turn_draw",
      choice: { option: "A", card: "Law Firm" },
    });
    fireEvent.click(panel.getByRole("button", { name: "Industry" }));
    expect(onAction).toHaveBeenLastCalledWith({
      type: "turn_draw",
      choice: { option: "B", sector: "Industry" },
    });
  });

  it("on your go keeps the marketplace card selected for Draw after the big card is closed", () => {
    const { onAction } = showGame({ marketGo: 2 }, ON_YOUR_GO);
    fireEvent.click(marketplace().getByRole("button", { name: "Saw Mill" }));
    const bigCard = within(screen.getByRole("region", { name: "Selected card: Saw Mill" }));
    fireEvent.click(bigCard.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: "Selected card: Saw Mill" })).toBeNull();
    expect(
      marketplace().getByRole("button", { name: "Saw Mill" }).getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(marketplace().getByRole("button", { name: "Draw" }));
    expect(onAction).toHaveBeenLastCalledWith({
      type: "turn_draw",
      choice: { option: "A", card: "Saw Mill" },
    });
  });

  it("offers only the sectors when the marketplace is empty", () => {
    showGame(
      { marketGo: 2, marketplace: MARKETPLACE.map((slot) => ({ ...slot, card: null })) },
      { ...ON_YOUR_GO, marketCardRejection: "marketplace_empty" },
    );
    const panel = within(screen.getByRole("region", { name: "The marketplace is empty" }));
    expect(panel.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Residential",
      "Industry",
      "Service",
      "Public",
    ]);
  });

  it("before your go says whose go it is and who goes before you", () => {
    showGame({ marketGo: 3 }, { turnDrawRejection: "not_your_go" });
    const panel = within(screen.getByRole("region", { name: "Cy's go" }));
    expect(
      panel.getByText(
        "They are choosing their turn draw. Your go comes after Cy and Di, in player order.",
      ),
    ).toBeDefined();
    expect(panel.queryAllByRole("button")).toEqual([]);
  });

  it("after your go shows your city and the main-phase actions while later players have their go", () => {
    showGame(
      { phase: "main", marketGo: 4 },
      { hasHadMarketGo: true, turnDrawRejection: "out_of_market" },
    );
    expect(screen.queryByRole("region", { name: "MARKET PHASE" })).toBeNull();
    expect(screen.getByRole("button", { name: "Play card" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Your city · 0 cards" })).toBeDefined();
    expect(screen.getByText("Main phase")).toBeDefined();
    fireEvent.click(marketplace().getByRole("button", { name: "Law Firm" }));
    expect(marketplace().queryByRole("button", { name: "Draw" })).toBeNull();
  });

  it("hides the main-phase actions and the city in the market phase", () => {
    showGame({ marketGo: 3 }, { turnDrawRejection: "not_your_go" });
    expect(screen.queryByRole("button", { name: "Play card" })).toBeNull();
    expect(screen.queryByRole("button", { name: "End turn" })).toBeNull();
    expect(
      screen.getByText(
        "Market phase: play, sell and the other main-phase actions open when your market go ends. Quests cannot be completed before then.",
      ),
    ).toBeDefined();
    expect(screen.getByText("Market phase")).toBeDefined();
  });
});

describe("the market phase banner", () => {
  it("says whose go it is when it is another player's go", () => {
    showGame({ marketGo: 3 }, { turnDrawRejection: "not_your_go" });
    const banner = within(screen.getByRole("region", { name: "MARKET PHASE" }));
    expect(banner.getByText("Cy's go")).toBeDefined();
  });

  it("says Your go on your go", () => {
    showGame({ marketGo: 2 }, ON_YOUR_GO);
    const banner = within(screen.getByRole("region", { name: "MARKET PHASE" }));
    expect(banner.getByText("Your go")).toBeDefined();
  });

  it("is gone in the main phase", () => {
    showGame({ phase: "main", marketGo: null });
    expect(screen.queryByRole("region", { name: "MARKET PHASE" })).toBeNull();
    expect(screen.getByText("Main phase")).toBeDefined();
  });
});

describe("a turn draw left open", () => {
  it("offers the sectors for the 2 cards and says a random one is used otherwise", () => {
    const { onAction } = showGame(
      { phase: "main", marketGo: 4 },
      { hasHadMarketGo: true, turnDrawRejection: null, marketCardRejection: "out_of_market" },
    );
    const group = within(screen.getByRole("group", { name: "Turn draw left open" }));
    expect(screen.getByRole("group", { name: "Turn draw left open" }).textContent).toContain(
      "Your time ran out on your market go. Choose a sector for your 2 cards. If you end your turn without choosing, a random sector is used.",
    );
    fireEvent.click(marketplace().getByRole("button", { name: "Law Firm" }));
    expect(marketplace().queryByRole("button", { name: "Draw" })).toBeNull();
    fireEvent.click(group.getByRole("button", { name: "Public" }));
    expect(onAction).toHaveBeenLastCalledWith({
      type: "turn_draw",
      choice: { option: "B", sector: "Public" },
    });
  });

  it("is not offered once the turn draw is taken", () => {
    showGame({ phase: "main" }, { hasHadMarketGo: true, turnDrawRejection: "out_of_market" });
    expect(screen.queryByRole("group", { name: "Turn draw left open" })).toBeNull();
  });
});

describe("new cards", () => {
  it("marks the cards you got this turn as new in your hand", () => {
    showGame(
      { phase: "main" },
      {
        hand: ["Loft", "Pub"],
        newCards: ["Pub"],
        handDetails: [
          { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: null },
          { card: "Pub", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
        ],
      },
    );
    const hand = within(screen.getByRole("list", { name: "Your hand" }));
    expect(
      hand.getByRole("button", { name: "Pub" }).getAttribute("aria-describedby"),
    ).not.toBeNull();
    expect(hand.getByText("Number 122, real cost $5, new")).toBeDefined();
    expect(hand.queryByText(/real cost \$8, new/)).toBeNull();
  });
});
