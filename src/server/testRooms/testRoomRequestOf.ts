import * as v from "valibot";
import type { GameState } from "../../rules/GameState";
import { withMainPhaseStart } from "../../rules/withMainPhaseStart";
import { TEST_ROOM_REQUEST } from "./TEST_ROOM_REQUEST";

export function testRoomRequestOf(
  value: unknown,
): { readonly state: GameState; readonly playerNames: ReadonlyArray<string> } | null {
  const parsed = v.safeParse(TEST_ROOM_REQUEST, value);
  return parsed.success
    ? { state: withMainPhaseStart(parsed.output.state), playerNames: parsed.output.playerNames }
    : null;
}
