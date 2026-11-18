import type { PlayerId } from "../../shared/PlayerId";
import type { RoomCode } from "../../shared/RoomCode";

export type StoredSession = {
  readonly token: string;
  readonly playerId: PlayerId | null;
  readonly name: string;
  readonly isGuest: boolean;
  readonly roomCode: RoomCode | null;
  readonly isInTutorial: boolean;
};
