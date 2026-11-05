import type { GameStart } from "../../src/server/room/GameStart.ts";
import type { EpochMs } from "../../src/shared/EpochMs.ts";

export function gameStartInJoinOrder(seed: number, now: EpochMs): GameStart {
  return { seed, now, seatOrder: (players) => players, limitRejectionFor: () => null };
}
