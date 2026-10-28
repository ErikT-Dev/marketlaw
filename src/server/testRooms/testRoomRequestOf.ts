import * as v from "valibot";
import type { GameState } from "../../rules/GameState";
import { TEST_ROOM_REQUEST } from "./TEST_ROOM_REQUEST";

export function testRoomRequestOf(
  value: unknown,
): { readonly state: GameState; readonly playerNames: ReadonlyArray<string> } | null {
  const parsed = v.safeParse(TEST_ROOM_REQUEST, value);
  return parsed.success ? parsed.output : null;
}
