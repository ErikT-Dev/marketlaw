import type { PlayerId } from "../../shared/PlayerId";
import type { QueueView } from "../../shared/protocol/QueueView";
import { isSiteGameLimitReached } from "./isSiteGameLimitReached";
import { ownQueueStateOf } from "./ownQueueStateOf";
import type { QueueContext } from "./QueueContext";
import { queueCountsOf } from "./queueCountsOf";
import type { QueueState } from "./QueueState";

export function queueViewFor(
  state: QueueState,
  playerId: PlayerId | null,
  context: QueueContext,
): QueueView {
  return {
    counts: queueCountsOf(state.queue),
    own: ownQueueStateOf(state, playerId, context.now),
    isSiteGameLimitReached: isSiteGameLimitReached(state.lobby, context),
  };
}
