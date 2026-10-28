import type { GameState } from "../../../src/rules/GameState.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import { seatThen } from "./seatThen.ts";
import { viewThen } from "./viewThen.ts";

function seatsThen(state: GameState, expected: unknown): ReadonlyArray<unknown> {
  const asked: ReadonlyArray<unknown> = Array.isArray(expected) ? expected : [];
  return asked.map((entry) => {
    const seat = state.seats.find(
      (candidate) => isRecord(entry) && candidate.seat === entry["seat"],
    );
    return seat === undefined ? undefined : seatThen(seat);
  });
}

export function readEngineThen(state: GameState, field: string, expected: unknown): unknown {
  const fields: Readonly<Record<string, () => unknown>> = {
    seats: () => seatsThen(state, expected),
    view: () => viewThen(state, expected),
    turn: () => state.turn,
    phase: () => state.phase,
    deck: () => state.deck,
    deck_count: () => state.deck.length,
    discard: () => state.discard,
    holding_pile: () => state.holdingPile,
    marketplace: () =>
      state.marketplace.map(({ place, card, phasesShown }) => ({
        place,
        card,
        phases_shown: phasesShown,
      })),
    quests: () =>
      state.quests.map(({ quest, turnsOnTable }) => ({ quest, turns_on_table: turnsOnTable })),
    quest_list: () => state.questList,
    bonus_types: () => state.bonusTypes,
    done_order: () => state.doneOrder,
    first_completions: () => state.firstCompletions,
  };
  const read = fields[field];
  if (read === undefined) {
    throw new Error(`the engine driver cannot read then.${field}`);
  }
  return read();
}
