import type { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import type { GameStart } from "./room/GameStart";

function randomBelow(limit: number): number {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
  return value % limit;
}

function shuffled(players: ReadonlyArray<PlayerId>): ReadonlyArray<PlayerId> {
  return players.reduce<ReadonlyArray<PlayerId>>((order, player, index) => {
    const at = randomBelow(index + 1);
    return [...order.slice(0, at), player, ...order.slice(at)];
  }, []);
}

export function newGameStart(now: EpochMs): GameStart {
  const [seed = 0] = crypto.getRandomValues(new Uint32Array(1));
  return { seed, now, seatOrder: shuffled };
}
