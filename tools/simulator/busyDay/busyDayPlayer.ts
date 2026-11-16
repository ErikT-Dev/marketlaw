import * as v from "valibot";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { PlayerId } from "../../../src/shared/PlayerId.ts";

export function busyDayPlayer(game: number, seat: number): Identity {
  const hex = (game * 16 + seat).toString(16).padStart(12, "0");
  return { playerId: v.parse(PlayerId, `00000000-0000-4000-8000-${hex}`), name: `P${hex}` };
}
