import { DurableObject } from "cloudflare:workers";
import { OPENED_ELSEWHERE_CLOSE_CODE } from "../shared/OPENED_ELSEWHERE_CLOSE_CODE";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseTutorialClientMessage } from "../shared/protocol/parseTutorialClientMessage";
import type { ServerMessage } from "../shared/protocol/ServerMessage";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import { acceptRoomSocket } from "./acceptRoomSocket";
import { attachmentOf } from "./attachmentOf";
import { nowMs } from "./nowMs";
import { openSocketsOf } from "./openSocketsOf";
import type { Identity } from "./room/Identity";
import { ROOM_TIMES } from "./room/ROOM_TIMES";
import { senderOfToken } from "./senderOfToken";
import { TUTORIAL_PLACE } from "./lobby/TUTORIAL_PLACE";
import { lobbyOf } from "./lobbyOf";
import { restartingPlayerOf } from "./tutorial/restartingPlayerOf";
import { kvTutorialStorage } from "./tutorial/kvTutorialStorage";
import { receiveTutorialMessage } from "./tutorial/receiveTutorialMessage";
import { startTutorialIn } from "./tutorial/startTutorialIn";
import type { TutorialRecord } from "./tutorial/TutorialRecord";
import { tutorialUpdateFor } from "./tutorial/tutorialUpdateFor";

const GONE_TEXT = "This tutorial no longer exists";

export class TutorialRoom extends DurableObject<Env> {
  private readonly storage = kvTutorialStorage(this.ctx.storage.kv);

  async start(player: Identity): Promise<void> {
    const now = nowMs();
    startTutorialIn(this.storage, player, now);
    const record = this.storage.read();
    if (record !== undefined) {
      this.sendToAll(tutorialUpdateFor(record, null, now));
    }
    await this.ctx.storage.setAlarm(now + ROOM_TIMES.tutorialAwayMs);
  }

  isPlayerBusy(): boolean {
    return this.storage.read() !== undefined;
  }

  override fetch(request: Request): Response {
    return acceptRoomSocket(this.ctx, request);
  }

  override async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    const parsed = parseTutorialClientMessage(text);
    const attachment = attachmentOf(socket);
    const sender = parsed.isOk
      ? await senderOfToken(this.env.DB, parsed.value.token, attachment)
      : null;
    const record = this.storage.read();
    const now = nowMs();
    const restarting = restartingPlayerOf(record, parsed, sender?.identity ?? null);
    const restartRefusal =
      restarting === null ? null : await lobbyOf(this.env).startTutorial(restarting, now);
    const outcome = receiveTutorialMessage(this.storage, {
      connection: attachment,
      parsed,
      sender: sender?.identity ?? null,
      now,
      restartRefusal,
    });
    if (outcome.reply !== null) {
      socket.send(JSON.stringify(outcome.reply));
    }
    if (outcome.kind === "closing") {
      await this.removeRoom(record);
      return;
    }
    if (attachment.identity === null && outcome.connection.identity !== null) {
      this.closeOtherTabs(socket);
    }
    socket.serializeAttachment({
      ...outcome.connection,
      tokenHash: sender?.tokenHash ?? attachment.tokenHash,
    });
  }

  override async webSocketClose(socket: WebSocket): Promise<void> {
    const isLastSocket = openSocketsOf(this.ctx).every((open) => open === socket);
    if (isLastSocket && this.storage.read() !== undefined) {
      await this.ctx.storage.setAlarm(nowMs() + ROOM_TIMES.tutorialAwayMs);
    }
  }

  override async alarm(): Promise<void> {
    if (openSocketsOf(this.ctx).length === 0) {
      await this.removeRoom(this.storage.read());
    }
  }

  private closeOtherTabs(current: WebSocket): void {
    const elsewhere: ServerMessage = {
      type: "opened_elsewhere",
      protocolVersion: PROTOCOL_VERSION,
    };
    for (const socket of openSocketsOf(this.ctx).filter((open) => open !== current)) {
      socket.send(JSON.stringify(elsewhere));
      socket.close(OPENED_ELSEWHERE_CLOSE_CODE, "The tutorial was opened in another tab");
    }
  }

  private sendToAll(message: ServerMessage): void {
    for (const socket of openSocketsOf(this.ctx)) {
      if (attachmentOf(socket).identity !== null) {
        socket.send(JSON.stringify(message));
      }
    }
  }

  private async removeRoom(record: TutorialRecord | undefined): Promise<void> {
    for (const socket of this.ctx.getWebSockets()) {
      socket.close(ROOM_GONE_CLOSE_CODE, GONE_TEXT);
    }
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    if (record !== undefined) {
      await lobbyOf(this.env)
        .release(record.player.playerId, TUTORIAL_PLACE)
        .catch(() => undefined);
    }
  }
}
