import type { PlayerId } from "../../shared/PlayerId";
import type { RankedStanding } from "./RankedStanding";

export type QueueJoiner = {
  readonly playerId: PlayerId;
  readonly standing: RankedStanding;
};
