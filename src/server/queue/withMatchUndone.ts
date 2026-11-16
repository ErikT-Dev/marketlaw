import type { PlayerId } from "../../shared/PlayerId";
import type { QueueNotice } from "../../shared/protocol/QueueNotice";
import { RANKED_QUEUE_PLACE } from "../lobby/RANKED_QUEUE_PLACE";
import { releasePlayer } from "../lobby/releasePlayer";
import type { LeavingPlayer } from "./LeavingPlayer";
import type { QueueChange } from "./QueueChange";
import type { QueueMatch } from "./QueueMatch";

export function withMatchUndone(
  change: QueueChange,
  match: QueueMatch,
  leaving: ReadonlyArray<LeavingPlayer>,
  noticeToOthers: QueueNotice,
): QueueChange {
  const { queue } = change;
  function isLeaving(playerId: PlayerId): boolean {
    return leaving.some((player) => player.playerId === playerId);
  }
  const back = match.players.filter(({ playerId }) => !isLeaving(playerId));
  const rejoinWaits = leaving.flatMap(({ playerId, rejoinAt }) =>
    rejoinAt === null ? [] : [{ playerId, until: rejoinAt }],
  );
  return {
    queue: {
      entries: [...back, ...queue.entries],
      matches: queue.matches.filter((other) => other !== match),
      rejoinWaits: [
        ...queue.rejoinWaits.filter(({ playerId }) => !isLeaving(playerId)),
        ...rejoinWaits,
      ],
      closedConnections: queue.closedConnections.filter(({ playerId }) => !isLeaving(playerId)),
    },
    lobby: leaving.reduce(
      (lobby, { playerId }) => releasePlayer(lobby, playerId, RANKED_QUEUE_PLACE),
      change.lobby,
    ),
    notices: [
      ...change.notices,
      ...leaving.map(({ playerId, notice }) => ({ playerId, notice })),
      ...back.map(({ playerId }) => ({ playerId, notice: noticeToOthers })),
    ],
    starts: change.starts,
  };
}
