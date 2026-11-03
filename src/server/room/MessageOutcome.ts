import type { PlayerId } from "../../shared/PlayerId";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { ConnectionState } from "./ConnectionState";
import type { RoomRecord } from "./RoomRecord";

export type MessageOutcome = {
  readonly record: RoomRecord | null;
  readonly connection: ConnectionState;
  readonly shouldSave: boolean;
  readonly reply: ServerMessage;
  readonly playersToUpdate: ReadonlyArray<PlayerId>;
  readonly shouldClose: boolean;
};
