import * as v from "valibot";
import { GIVEN_SCHEMA } from "../tools/harness-runner/engine/GIVEN_SCHEMA";
import { stateFromGiven } from "../tools/harness-runner/engine/stateFromGiven";

export function testRoomRequestOf(given: unknown): unknown {
  const state = stateFromGiven(v.parse(GIVEN_SCHEMA, given));
  return { state, playerNames: state.seats.map((seat) => `Seat ${String(seat.seat)}`) };
}
