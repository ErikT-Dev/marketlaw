import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { RemovalReason } from "../../shared/protocol/RemovalReason";

export type RoomRemoval = {
  readonly playerId: PlayerId;
  readonly reason: RemovalReason;
  readonly rejoinAt: EpochMs | null;
};
