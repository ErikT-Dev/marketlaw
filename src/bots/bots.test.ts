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
  let state = seed;
  return {
    pickIndex: (count) => {
      state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
      return count === 0 ? 0 : state % count;
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
    expect(new Set(played)).toEqual(new Set(["Farm House", "Pub", "Cottage"]));
    expect(
      sold.every((card) => view.seats[0]?.kind === "own" && view.seats[0].hand.includes(card)),
    ).toBe(true);
    expect(moves.some((move) => move?.type === "end_turn")).toBe(true);
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
