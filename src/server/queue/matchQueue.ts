import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import type { RankedGameSize } from "../../shared/RankedGameSize";
import { isSiteGameLimitReached } from "./isSiteGameLimitReached";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueEntry } from "./QueueEntry";
import type { QueueNoticeTo } from "./QueueNoticeTo";
import type { QueueRecord } from "./QueueRecord";
import type { QueueState } from "./QueueState";
import { QUEUE_TIMES } from "./QUEUE_TIMES";

type FoundMatch = {
  readonly players: ReadonlyArray<QueueEntry>;
  readonly size: RankedGameSize;
};

type MatchesMade = {
  readonly queue: QueueRecord;
  readonly notices: ReadonlyArray<QueueNoticeTo>;
};

function matchIn(entries: ReadonlyArray<QueueEntry>): FoundMatch | null {
  const tries = entries.flatMap((entry) =>
    [...entry.sizes].sort((first, second) => second - first).map((size) => ({ entry, size })),
  );
  const working = tries.find(
    ({ size }) => entries.filter((other) => other.sizes.includes(size)).length >= size,
  );
  if (working === undefined) {
    return null;
  }
  const { entry, size } = working;
  const others = entries
    .filter((other) => other !== entry && other.sizes.includes(size))
    .slice(0, size - 1);
  return {
    players: entries.filter((other) => other === entry || others.includes(other)),
    size,
  };
}

function withMatchesMade(made: MatchesMade, deadline: EpochMs): MatchesMade {
  const { queue, notices } = made;
  const found = matchIn(queue.entries);
  if (found === null) {
    return made;
  }
  const { players, size } = found;
  const matchFound = players.map(({ playerId }) => ({
    playerId,
    notice: { kind: "match_found" as const, size },
  }));
  return withMatchesMade(
    {
      queue: {
        ...queue,
        entries: queue.entries.filter((entry) => !players.includes(entry)),
        matches: [...queue.matches, { players, size, deadline, confirmed: [] }],
      },
      notices: [...notices, ...matchFound],
    },
    deadline,
  );
}

export function matchQueue(state: QueueState, context: QueueContext): QueueChange {
  if (isSiteGameLimitReached(state.lobby, context)) {
    return { ...state, notices: [] };
  }
  const deadline = v.parse(EpochMs, context.now + QUEUE_TIMES.confirmMs);
  const { queue, notices } = withMatchesMade({ queue: state.queue, notices: [] }, deadline);
  return { queue, lobby: state.lobby, notices };
}
