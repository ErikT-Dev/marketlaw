import { countGameStart } from "../lobby/countGameStart";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueMatch } from "./QueueMatch";
import type { QueueState } from "./QueueState";
import { rematched } from "./rematched";
import { withMatchUndone } from "./withMatchUndone";

export function startConfirmedMatch(
  state: QueueState,
  match: QueueMatch,
  context: QueueContext,
): QueueChange {
  const players = match.players.map(({ playerId }) => playerId);
  const counted = countGameStart(state.lobby, players, context);
  const unchanged = { ...state, notices: [], starts: [] };
  if (counted.isOk) {
    const { queue } = state;
    return {
      queue: {
        ...queue,
        matches: queue.matches.filter((other) => other !== match),
        closedConnections: queue.closedConnections.filter(
          ({ playerId }) => !players.includes(playerId),
        ),
      },
      lobby: counted.value,
      notices: [],
      starts: [{ players, size: match.size }],
    };
  }
  if (counted.error.kind === "site_game_limit") {
    return withMatchUndone(unchanged, match, [], { kind: "site_game_limit" });
  }
  const leaving = counted.error.players.map(({ playerId, reason }) => ({
    playerId,
    notice: { kind: "daily_limit" as const, reason },
    rejoinAt: null,
  }));
  const undone = withMatchUndone(unchanged, match, leaving, {
    kind: "match_not_started",
    reason: "player_daily_limit",
  });
  return rematched(undone, context);
}
