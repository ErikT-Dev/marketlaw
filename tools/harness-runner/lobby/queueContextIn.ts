import { siteGameLimitOf } from "../../../src/server/lobby/siteGameLimitOf.ts";
import type { QueueContext } from "../../../src/server/queue/QueueContext.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";

export function queueContextIn(session: { readonly now: EpochMs }): QueueContext {
  return { now: session.now, siteGamesPerDay: siteGameLimitOf({}) };
}
