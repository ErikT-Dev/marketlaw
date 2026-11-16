import type { PlayerId } from "../../shared/PlayerId";
import type { BusyPlace } from "./BusyPlace";

export type BusyPlayer = {
  readonly playerId: PlayerId;
  readonly code: BusyPlace;
};
