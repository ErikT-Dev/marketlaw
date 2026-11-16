import * as v from "valibot";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RANKED_GAME_SIZES } from "../../shared/RANKED_GAME_SIZES";

const SIZE = v.picklist(RANKED_GAME_SIZES);
const ENTRY = v.object({ playerId: PlayerId, sizes: v.array(SIZE) });

export const QUEUE_RECORD_SCHEMA = v.object({
  entries: v.array(ENTRY),
  matches: v.array(
    v.object({
      players: v.array(ENTRY),
      size: SIZE,
      deadline: EpochMs,
      confirmed: v.array(PlayerId),
    }),
  ),
  rejoinWaits: v.array(v.object({ playerId: PlayerId, until: EpochMs })),
  closedConnections: v.array(v.object({ playerId: PlayerId, since: EpochMs })),
});
