import { TIME_RULES } from "../../rules/TIME_RULES";
import type { AddressedNotice } from "./AddressedNotice";
import type { RoomRecord } from "./RoomRecord";

export function resumeNoticesBetween(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<AddressedNotice> {
  const pause = before?.game?.saved.state.pause ?? null;
  const game = after?.game ?? null;
  if (pause === null || game === null || game.saved.state.pause !== null) {
    return [];
  }
  const freeMs = game.saved.state.phase === "main" ? TIME_RULES.mainFreeMs : TIME_RULES.goFreeMs;
  return game.seats.map(({ playerId }) => ({
    playerId,
    notice: { kind: "resumed", seat: pause.seat, freeMs },
  }));
}
