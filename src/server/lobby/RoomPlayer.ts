import type { PlayerId } from "../../shared/PlayerId";

export type RoomPlayer = {
  readonly playerId: PlayerId;
  readonly name: string;
};
