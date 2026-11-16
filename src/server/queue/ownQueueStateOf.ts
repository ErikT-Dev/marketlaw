import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { OwnQueueState } from "../../shared/protocol/OwnQueueState";
import { dailyLimitRejection } from "../lobby/dailyLimitRejection";
import type { QueueState } from "./QueueState";

function outStateOf(state: QueueState, playerId: PlayerId | null, now: EpochMs): OwnQueueState {
  const wait = state.queue.rejoinWaits.find(
    (rejoinWait) => rejoinWait.playerId === playerId && rejoinWait.until > now,
  );
  return {
    kind: "out",
    rejoinAt: wait?.until ?? null,
    dailyLimit: playerId === null ? null : dailyLimitRejection(state.lobby, playerId, now),
  };
}

export function ownQueueStateOf(
  state: QueueState,
  playerId: PlayerId | null,
  now: EpochMs,
): OwnQueueState {
  const waiting = state.queue.entries.find((entry) => entry.playerId === playerId);
  if (waiting !== undefined) {
    return { kind: "waiting", sizes: waiting.sizes };
  }
  const match = state.queue.matches.find(({ players }) =>
    players.some((entry) => entry.playerId === playerId),
  );
  if (match === undefined) {
    return outStateOf(state, playerId, now);
  }
  return {
    kind: "confirming",
    size: match.size,
    deadline: match.deadline,
    isConfirmed: match.confirmed.some((confirmed) => confirmed === playerId),
  };
}
