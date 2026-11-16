import type { LobbyRecord } from "../lobby/LobbyRecord";
import type { QueueRecord } from "./QueueRecord";

export type QueueState = {
  readonly queue: QueueRecord;
  readonly lobby: LobbyRecord;
};
