import * as v from "valibot";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../shared/playerIcons/PLAYER_ICON_CHOICE_SCHEMA";
import { EpochMs } from "../shared/EpochMs";
import { PlayerId } from "../shared/PlayerId";

export const ConnectionAttachment = v.object({
  identity: v.nullable(
    v.object({ playerId: PlayerId, name: v.string(), icon: PLAYER_ICON_CHOICE_SCHEMA }),
  ),
  tokenHash: v.nullable(v.string()),
  rejectionTimes: v.array(EpochMs),
});

export type ConnectionAttachment = v.InferOutput<typeof ConnectionAttachment>;
