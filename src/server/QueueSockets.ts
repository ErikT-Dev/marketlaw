import type { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { QueueServerMessage } from "../shared/protocol/QueueServerMessage";
import type { ReasonCode } from "../shared/ReasonCode";
import { attachmentOf } from "./attachmentOf";
import { closeLoginSockets } from "./closeLoginSockets";
import type { LoginClosing } from "./LoginClosing";
import { openSocketsOf } from "./openSocketsOf";
import type { QueueContext } from "./queue/QueueContext";
import type { QueueNoticeTo } from "./queue/QueueNoticeTo";
import type { QueueState } from "./queue/QueueState";
import { queueViewFor } from "./queue/queueViewFor";

export class QueueSockets {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  private openSockets(): ReadonlyArray<WebSocket> {
    return openSocketsOf(this.ctx);
  }

  private static send(socket: WebSocket, message: QueueServerMessage): void {
    socket.send(JSON.stringify(message));
  }

  sendView(socket: WebSocket, state: QueueState, context: QueueContext): void {
    const playerId = attachmentOf(socket).identity?.playerId ?? null;
    QueueSockets.send(socket, {
      type: "queue",
      protocolVersion: PROTOCOL_VERSION,
      queue: queueViewFor(state, playerId, context),
      serverNow: context.now,
    });
  }

  sendViews(state: QueueState, context: QueueContext): void {
    for (const socket of this.openSockets()) {
      this.sendView(socket, state, context);
    }
  }

  sendNotices(notices: ReadonlyArray<QueueNoticeTo>): void {
    for (const { playerId, notice } of notices) {
      for (const socket of this.socketsOf(playerId)) {
        QueueSockets.send(socket, {
          type: "queue_notice",
          protocolVersion: PROTOCOL_VERSION,
          notice,
        });
      }
    }
  }

  reject(socket: WebSocket, code: ReasonCode): void {
    QueueSockets.send(socket, { type: "queue_rejected", protocolVersion: PROTOCOL_VERSION, code });
  }

  isConnected(playerId: PlayerId, closing: WebSocket | null): boolean {
    return this.socketsOf(playerId).some((socket) => socket !== closing);
  }

  closeLogins(closing: LoginClosing): void {
    closeLoginSockets(this.openSockets(), closing);
  }

  private socketsOf(playerId: PlayerId): ReadonlyArray<WebSocket> {
    return this.openSockets().filter(
      (socket) => attachmentOf(socket).identity?.playerId === playerId,
    );
  }
}
