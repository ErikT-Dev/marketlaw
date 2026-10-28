import { describe, expect, it } from "vitest";
import type { OwnSeatView } from "../shared/OwnSeatView";
import type { PlayerView } from "../shared/PlayerView";
import type { BotChooser } from "./BotChooser";
import { chaosBot } from "./chaosBot";
import { legalBot } from "./legalBot";

const STATS = {
  funds: 7,
  income: 3,
  influence: 0,
  workforce: 0,
  quality: 0,
  satisfaction: 0,
  product: 0,
  distribution: 0,
  bonus: 0,
};

function viewWith(own: Partial<OwnSeatView>): PlayerView {
  const seat: OwnSeatView = {
    kind: "own",
    seat: 1,
    stats: STATS,
    city: [],
    buildPasses: 0,
    isDone: false,
    hasLeft: false,
    timeBankMs: 0,
    hand: ["Farm House", "Dorm", "Pub", "Cottage", "Loft"],
    handDetails: [
      { card: "Farm House", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
      { card: "Dorm", realCost: 9, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
      { card: "Pub", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
      { card: "Cottage", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
      { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: "tier_not_allowed" },
    ],
    sellRejection: null,
    endTurnRejection: null,
    hasPlayedThisTurn: false,
    hasSkippedBuild: false,
    actionsThisTurn: 0,
    ...own,
  };
  return {
    seat: 1,
    turn: 1,
    phase: "main",
    seats: [seat],
    deckCount: 200,
    discard: [],
    marketplace: [],
    quests: [],
    bonusTypes: [],
    doneOrder: [],
    playerOrder: [1],
    drawLog: [],
  };
}

function chooserFrom(seed: number): BotChooser {
  let state = seed >>> 0;
  return {
    pickIndex: (count) => {
      state = (state + 0x6d2b79f5) >>> 0;
      let mixed = Math.imul(state ^ (state >>> 15), state | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      const fraction = ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
      return Math.floor(fraction * Math.max(count, 1));
    },
  };
}

const SEEDS = Array.from({ length: 300 }, (unused, index) => index + 1);

describe("legal bot", () => {
  it("only plays cards its view marks playable and only sells cards it holds", () => {
    const view = viewWith({});
    const moves = SEEDS.map((seed) => legalBot(view, chooserFrom(seed)));
    const played = moves.flatMap((move) => (move?.type === "play_card" ? [move.card] : []));
    const sold = moves.flatMap((move) => (move?.type === "sell" ? move.cards : []));
    expect(played.every((card) => ["Farm House", "Pub", "Cottage"].includes(card))).toBe(true);
    expect(new Set(played)).toContain("Farm House");
    expect(new Set(played)).toContain("Cottage");
    expect(
      sold.every((card) => view.seats[0]?.kind === "own" && view.seats[0].hand.includes(card)),
    ).toBe(true);
  });

  it("ends its turn when nothing worth playing is left", () => {
    const view = viewWith({ handDetails: [] });
    const moves = SEEDS.map((seed) => legalBot(view, chooserFrom(seed))?.type);
    expect(moves).toContain("end_turn");
    expect(moves).not.toContain("play_card");
  });

  it("prefers the kind of card that fixes its weakest stat", () => {
    const view = viewWith({ stats: { ...STATS, workforce: 3, quality: 0, satisfaction: 2 } });
    const played = SEEDS.map((seed) => legalBot(view, chooserFrom(seed))).flatMap((move) =>
      move?.type === "play_card" ? [move.card] : [],
    );
    expect(played.filter((card) => card === "Pub").length).toBeLessThan(played.length / 2);
    const withQualityCard = viewWith({
      stats: { ...STATS, workforce: 3, quality: 0, satisfaction: 2 },
      hand: ["Fire Station", "Pub"],
      handDetails: [
        { card: "Fire Station", realCost: 4, sameSectorAndTierInCity: 0, playRejection: null },
        { card: "Pub", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
      ],
    });
    const choices = SEEDS.map((seed) => legalBot(withQualityCard, chooserFrom(seed)));
    expect(
      choices.filter((move) => move?.type === "play_card" && move.card === "Fire Station").length,
    ).toBeGreaterThan(
      choices.filter((move) => move?.type === "play_card" && move.card === "Pub").length,
    );
  });

  it("does not sell when selling would be rejected and makes no move when done", () => {
    const cannotSell = viewWith({ sellRejection: "action_limit_reached", handDetails: [] });
    expect(SEEDS.map((seed) => legalBot(cannotSell, chooserFrom(seed))?.type)).not.toContain(
      "sell",
    );
    expect(legalBot(viewWith({ endTurnRejection: "already_done" }), chooserFrom(1))).toBeNull();
  });
});

describe("chaos bot", () => {
  it("sends legal moves, illegal moves, stale moves and malformed text", () => {
    const view = viewWith({});
    const moves = SEEDS.map((seed) => chaosBot(view, chooserFrom(seed)));
    expect(new Set(moves.map((move) => move.kind))).toEqual(new Set(["intent", "stale", "raw"]));
    const plays = moves.flatMap((move) =>
      move.kind !== "raw" && move.intent.type === "play_card" ? [move.intent.card] : [],
    );
    expect(plays).toContain("Dorm");
    expect(
      plays.some((card) => !["Farm House", "Dorm", "Pub", "Cottage", "Loft"].includes(card)),
    ).toBe(true);
  });
});
