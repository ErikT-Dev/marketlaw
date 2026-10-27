import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { ConnectionState } from "./ConnectionState";
import type { RoomRecord } from "./RoomRecord";

export type MessageOutcome = {
  readonly record: RoomRecord;
  readonly connection: ConnectionState;
  readonly shouldSave: boolean;
  readonly reply: ServerMessage;
  readonly shouldUpdateEveryone: boolean;
  readonly shouldClose: boolean;
};
