import type { PlayerId } from "../shared/PlayerId";
import type { QueueClientMessage } from "../shared/protocol/QueueClientMessage";
import type { QueueOperation } from "./queue/QueueOperation";

export function queueOperationOf(
  message: Exclude<QueueClientMessage, { readonly type: "resync" | "join_queue" }>,
  playerId: PlayerId,
): QueueOperation {
  switch (message.type) {
    case "change_sizes":
      return { kind: "change_sizes", playerId, sizes: message.sizes };
    case "leave_queue":
      return { kind: "leave", playerId };
    case "confirm_match":
      return { kind: "confirm", playerId };
    case "decline_match":
      return { kind: "decline", playerId };
  }
}
