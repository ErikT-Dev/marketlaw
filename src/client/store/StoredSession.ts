import type { RoomCode } from "../../shared/RoomCode";

export type StoredSession = {
  readonly token: string;
  readonly name: string;
  readonly isGuest: boolean;
  readonly roomCode: RoomCode | null;
};
