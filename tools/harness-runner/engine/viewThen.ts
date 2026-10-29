import type { GameState } from "../../../src/rules/GameState.ts";
import { viewFor } from "../../../src/rules/viewFor.ts";
import type { SeatNumber } from "../../../src/shared/SeatNumber.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import { absentLogItems } from "./absentLogItems.ts";
import { matchingLogEntries } from "./matchingLogEntries.ts";

const SEAT_NUMBERS: ReadonlyArray<SeatNumber> = [1, 2, 3, 4];

function seatNumberOf(value: unknown): SeatNumber {
  const seat = SEAT_NUMBERS.find((candidate) => candidate === value);
  if (seat === undefined) {
    throw new Error(`view of seat ${JSON.stringify(value)}, which does not exist`);
  }
  return seat;
}

function namesOf(value: unknown): ReadonlyArray<string> {
  return Array.isArray(value) ? value.map(String) : [];
}

function isHidden(name: string, text: string, state: GameState): boolean {
  switch (name) {
    case "deck_order":
      return !state.deck.some((card) => text.includes(JSON.stringify(card)));
    case "seed":
      return !text.includes('"seed":');
    default:
      return !text.includes(JSON.stringify(name));
  }
}

export function viewThen(state: GameState, expected: unknown): Readonly<Record<string, unknown>> {
  const asked = isRecord(expected) ? expected : {};
  const view = viewFor(state, seatNumberOf(asked["seat"]));
  const text = JSON.stringify(view);
  const ofSeat = view.seats.find((seat) => seat.seat === asked["of_seat"]);
  const seatFields =
    ofSeat === undefined
      ? {}
      : {
          of_seat: ofSeat.seat,
          stats: ofSeat.stats,
          hand: ofSeat.kind === "own" ? ofSeat.hand : undefined,
          hand_count: ofSeat.kind === "own" ? ofSeat.hand.length : ofSeat.handCount,
          city: ofSeat.city,
          build_passes: ofSeat.buildPasses,
          done: ofSeat.isDone,
          time_bank_ms: ofSeat.timeBankMs,
        };
  return {
    seat: view.seat,
    deck_count: view.deckCount,
    discard: view.discard,
    contains: namesOf(asked["contains"]).filter((name) => text.includes(JSON.stringify(name))),
    hides: namesOf(asked["hides"]).filter((name) => isHidden(name, text, state)),
    log_contains: matchingLogEntries(view.drawLog, asked["log_contains"]),
    log_excludes: absentLogItems(view.drawLog, asked["log_excludes"]),
    ...seatFields,
  };
}
