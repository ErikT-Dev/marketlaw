import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import type { CardName } from "../shared/catalogue/CardName";
import type { OtherSeatView } from "../shared/OtherSeatView";
import { apply } from "./apply";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { STARTING_STATS } from "./STARTING_STATS";
import { startSavedGame } from "./startSavedGame";
import { viewFor } from "./viewFor";
import { withMainPhaseStart } from "./withMainPhaseStart";

const PUBLIC_TIER_1: Random = {
  pickSector: () => "Public",
  pickTier: () => 1,
  pickQuest: (candidates) => candidates[0] ?? "Farmland",
  pickType: (candidates) => candidates[0] ?? "Farm",
  shuffle: (cards) => [...cards].reverse(),
};

function gameWith(deck: ReadonlyArray<CardName>, discard: ReadonlyArray<CardName>): GameState {
  const state = startSavedGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, 13).state;
  return withMainPhaseStart({
    ...state,
    deck,
    discard,
    seats: state.seats.map((seat) =>
      seat.seat === 1
        ? {
            ...seat,
            hand: ["Liquor Shop", "Cottage"],
            stats: { ...STARTING_STATS, workforce: 1, quality: 1, product: 1 },
          }
        : { ...seat, hand: ["Pub"] },
    ),
  });
}

function played(state: GameState, actions: ReadonlyArray<GameAction>): GameState {
  return actions.reduce((current, action) => {
    const result = apply(current, action, PUBLIC_TIER_1, GAME_STARTED_AT);
    if (!result.isOk) {
      throw new Error(`${action.type} rejected: ${result.error.code}`);
    }
    return result.value;
  }, state);
}

function seatOneSeenBySeatTwo(state: GameState): OtherSeatView | undefined {
  const seen = viewFor(state, 2).seats.find((seat) => seat.seat === 1);
  return seen?.kind === "other" ? seen : undefined;
}

function progressOfSeat1(state: GameState, viewer: 1 | 2) {
  const [place] = viewFor(state, viewer).quests;
  return place?.quest === null ? undefined : place?.progress.find(({ seat }) => seat === 1);
}

describe("what other players see during the main phase", () => {
  it("shows another player as at the start of the main phase, with whether they are done", () => {
    const start = gameWith(["Landfill"], []);
    const after = played(start, [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      { type: "end_turn", seat: 1 },
    ]);
    const seen = seatOneSeenBySeatTwo(after);
    expect(seen?.city).toEqual([]);
    expect(seen?.handCount).toBe(2);
    expect(seen?.stats).toEqual(start.seats[0]?.stats);
    expect(seen?.isDone).toBe(true);
  });

  it("shows another player's quest progress as at the start of the main phase", () => {
    const base = gameWith(["Landfill"], []);
    const start = withMainPhaseStart({
      ...base,
      quests: [{ quest: "Trading post", turnsOnTable: 1, isInExtraTurn: false }],
      seats: base.seats.map((seat) =>
        seat.seat === 1
          ? { ...seat, city: ["Apparel Store"], stats: { ...seat.stats, income: 40 } }
          : seat,
      ),
    });
    const after = played(start, [{ type: "complete_quest", seat: 1, quest: "Trading post" }]);
    expect(progressOfSeat1(after, 1)).toEqual({
      seat: 1,
      isCompleted: true,
      canCompleteNow: false,
      have: [40, 1],
      negativeStats: [],
    });
    expect(progressOfSeat1(after, 2)).toEqual({
      seat: 1,
      isCompleted: false,
      canCompleteNow: true,
      have: [40, 1],
      negativeStats: [],
    });
    expect(viewFor(after, 1).quests[0]).toHaveProperty("completeRejection", "quest_already_completed");
    expect(viewFor(after, 1).seats[0]).toHaveProperty("questsCompleted", ["Trading post"]);
    expect(seatOneSeenBySeatTwo(after)?.questsCompleted).toEqual([]);
  });

  it("shows a negative workforce, quality or satisfaction in the quest progress", () => {
    const base = gameWith(["Landfill"], []);
    const start = withMainPhaseStart({
      ...base,
      quests: [{ quest: "Trading post", turnsOnTable: 1, isInExtraTurn: false }],
      seats: base.seats.map((seat) =>
        seat.seat === 1
          ? {
              ...seat,
              city: ["Apparel Store"],
              stats: { ...seat.stats, income: 40, workforce: -1, satisfaction: -2 },
            }
          : seat,
      ),
    });
    expect(progressOfSeat1(start, 2)).toEqual({
      seat: 1,
      isCompleted: false,
      canCompleteNow: false,
      have: [40, 1],
      negativeStats: [
        { stat: "satisfaction", value: -2 },
        { stat: "workforce", value: -1 },
      ],
    });
    expect(viewFor(start, 1).quests[0]).toHaveProperty("completeRejection", "quest_needs_not_met");
  });

  it("does not count a player who left among those who could complete a quest", () => {
    const base = gameWith(["Landfill"], []);
    const start = withMainPhaseStart({
      ...base,
      quests: [{ quest: "Trading post", turnsOnTable: 1, isInExtraTurn: false }],
      seats: base.seats.map((seat) =>
        seat.seat === 1
          ? {
              ...seat,
              city: ["Apparel Store"],
              stats: { ...seat.stats, income: 40 },
              departure: { turn: 1, cardsInHand: 2 },
            }
          : seat,
      ),
    });
    expect(progressOfSeat1(start, 2)).toHaveProperty("canCompleteNow", false);
  });

  it("hides another player's draws, and the deck change they cause, until the phase ends", () => {
    const after = played(gameWith(["Landfill", "Pub"], []), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
    ]);
    expect(viewFor(after, 2).drawLog).toEqual([]);
    expect(viewFor(after, 2).deckCount).toBe(2);
    expect(viewFor(after, 1).drawLog).toHaveLength(1);
    expect(viewFor(after, 1).deckCount).toBe(1);
  });

  it("shows the viewer's own discard shuffle straight away and others' only when the phase ends", () => {
    const after = played(gameWith(["Pub"], ["Landfill", "Library", "Dorm"]), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
    ]);
    expect(viewFor(after, 1).discardCount).toBe(1);
    expect(viewFor(after, 1).deckCount).toBe(2);
    expect(viewFor(after, 2).discardCount).toBe(3);
    expect(viewFor(after, 2).deckCount).toBe(1);
  });

  it("reveals everything when the main phase ends", () => {
    const after = played(gameWith(["Landfill", "Pub", "Dorm"], []), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      { type: "end_turn", seat: 1 },
      { type: "end_turn", seat: 2 },
    ]);
    expect(seatOneSeenBySeatTwo(after)?.city).toEqual(["Liquor Shop"]);
    expect(viewFor(after, 2).drawLog).toHaveLength(1);
    expect(viewFor(after, 2).deckCount).toBe(2);
    expect(viewFor(after, 1).deckCount).toBe(2);
  });

  it("takes my own draw of a card another player reshuffled off the discard shown, not off the deck", () => {
    const start = gameWith([], ["Landfill", "Library"]);
    const bothReady = withMainPhaseStart({
      ...start,
      seats: start.seats.map((seat) => ({
        ...seat,
        hand: seat.seat === 1 ? ["Liquor Shop"] : ["Pub"],
        stats: { ...STARTING_STATS, workforce: 1, quality: 1, product: 1 },
      })),
    });
    const after = played(bothReady, [
      { type: "play_card", seat: 2, card: "Pub" },
      { type: "play_card", seat: 1, card: "Liquor Shop" },
    ]);
    const mine = viewFor(after, 1);
    const ownSeat = mine.seats.find((seat) => seat.kind === "own");
    const drawn = ownSeat?.kind === "own" ? ownSeat.hand : [];
    expect(mine.deckCount).toBe(0);
    expect(mine.discardCount).toBe(1);
    expect(drawn).toHaveLength(1);
  });
});
