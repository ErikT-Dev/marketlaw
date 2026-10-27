import type { RoomCode } from "../../shared/RoomCode";

export type StoredSession = {
  readonly token: string;
  readonly name: string;
  readonly roomCode: RoomCode | null;
};
