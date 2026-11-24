import { describe, expect, it } from "vitest";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { TURN_LIMIT } from "../shared/TURN_LIMIT";
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

function threePlayerGame(turn: number): GameState {
  const state = startSavedGame({ players: 3, kind: "casual", startedAt: GAME_STARTED_AT }, 13).state;
  return withMainPhaseStart({
    ...state,
    turn,
    firstPlayer: 2,
    seats: state.seats.map((seat) => ({
      ...seat,
      hand: ["Liquor Shop"],
      stats: { ...STARTING_STATS, funds: 90, workforce: 1, quality: 1, product: 1 },
    })),
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

const EVERYONE_ENDS: ReadonlyArray<GameAction> = [
  { type: "end_turn", seat: 1 },
  { type: "end_turn", seat: 2 },
  { type: "end_turn", seat: 3 },
];

describe("the game log of what players did in the main phase", () => {
  it("lists each player's actions in player order once the main phase ends", () => {
    const after = played(threePlayerGame(2), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      { type: "influence", seat: 3, trade: "fund_to_influence" },
      { type: "influence", seat: 2, trade: "buy_build_pass" },
      { type: "influence", seat: 1, trade: "fund_to_influence" },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 3).mainPhaseLog).toEqual([
      { kind: "influence", turn: 2, seat: 2, trade: "buy_build_pass" },
      { kind: "influence", turn: 2, seat: 3, trade: "fund_to_influence" },
      { kind: "played", turn: 2, seat: 1, card: "Liquor Shop" },
      { kind: "influence", turn: 2, seat: 1, trade: "fund_to_influence" },
      { kind: "income_gained", turn: 3, seat: 1, income: 10 },
    ]);
  });

  it("shows nobody a player's actions before the main phase ends, the player included", () => {
    const after = played(threePlayerGame(2), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      { type: "end_turn", seat: 1 },
    ]);
    expect(([1, 2, 3] as const).map((seat) => viewFor(after, seat).mainPhaseLog)).toEqual([
      [],
      [],
      [],
    ]);
  });

  it("leaves out an undone action and keeps the ones before it", () => {
    const after = played(threePlayerGame(2), [
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      { type: "influence", seat: 1, trade: "fund_to_influence" },
      { type: "undo", seat: 1 },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 2).mainPhaseLog).toEqual([
      { kind: "played", turn: 2, seat: 1, card: "Liquor Shop" },
      { kind: "income_gained", turn: 3, seat: 1, income: 10 },
    ]);
  });

  it("lists at the start of the next turn how much each player's income went up", () => {
    const after = played(threePlayerGame(2), [
      { type: "play_card", seat: 3, card: "Liquor Shop" },
      { type: "play_card", seat: 1, card: "Liquor Shop" },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 2).mainPhaseLog.filter(({ kind }) => kind === "income_gained")).toEqual([
      { kind: "income_gained", turn: 3, seat: 3, income: 10 },
      { kind: "income_gained", turn: 3, seat: 1, income: 10 },
    ]);
    expect(viewFor(after, 2).lastTurn.incomeGains).toEqual([
      { seat: 3, income: 10 },
      { seat: 1, income: 10 },
    ]);
  });

  it("lists a completed project", () => {
    const game = threePlayerGame(2);
    const ready = {
      ...game,
      seats: game.seats.map((seat) => ({
        ...seat,
        stats: {
          ...seat.stats,
          funds: 20,
          income: 100,
          workforce: 10,
          quality: 10,
          satisfaction: 10,
        },
      })),
    };
    const after = played(withMainPhaseStart(ready), [
      { type: "complete_project", seat: 2, project: "quality" },
      ...EVERYONE_ENDS,
    ]);
    expect(viewFor(after, 1).mainPhaseLog).toEqual([
      { kind: "completed_project", turn: 2, seat: 2, project: "quality" },
      { kind: "income_gained", turn: 3, seat: 2, income: 10 },
    ]);
  });

  it("writes the last main phase into the log when the game ends", () => {
    const after = played(threePlayerGame(TURN_LIMIT), [
      { type: "play_card", seat: 3, card: "Liquor Shop" },
      ...EVERYONE_ENDS,
    ]);
    expect(after.phase).toBe("ended");
    expect(viewFor(after, 1).mainPhaseLog).toEqual([
      { kind: "played", turn: TURN_LIMIT, seat: 3, card: "Liquor Shop" },
    ]);
  });
});
