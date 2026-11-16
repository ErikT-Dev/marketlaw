import type { PlayerId } from "../../shared/PlayerId";
import type { QueueJoiner } from "./QueueJoiner";

export type QueueOperation =
  | {
      readonly kind: "join";
      readonly joiner: QueueJoiner;
      readonly sizes: ReadonlyArray<number> | null;
    }
  | {
      readonly kind: "change_sizes";
      readonly playerId: PlayerId;
      readonly sizes: ReadonlyArray<number>;
    }
  | { readonly kind: "leave"; readonly playerId: PlayerId }
  | { readonly kind: "confirm"; readonly playerId: PlayerId }
  | { readonly kind: "decline"; readonly playerId: PlayerId }
  | { readonly kind: "connection"; readonly playerId: PlayerId; readonly isConnected: boolean }
  | { readonly kind: "alarm" };
