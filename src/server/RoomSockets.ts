import * as v from "valibot";
import { EpochMs } from "../shared/EpochMs";
import type { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { ServerMessage } from "../shared/protocol/ServerMessage";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import { attachmentOf } from "./attachmentOf";
import type { AddressedNotice } from "./room/AddressedNotice";
import type { RoomRecord } from "./room/RoomRecord";
import type { RoomRemoval } from "./room/RoomRemoval";
import { updateFor } from "./room/updateFor";

export class RoomSockets {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  closeAll(reason: string): void {
    for (const socket of this.ctx.getWebSockets()) {
      socket.close(ROOM_GONE_CLOSE_CODE, reason);
    }
  }

  isConnectedElsewhere(playerId: PlayerId, closing: WebSocket): boolean {
    return this.ctx
      .getWebSockets()
      .some(
        (socket) =>
          socket !== closing &&
          socket.readyState === WebSocket.OPEN &&
          attachmentOf(socket).identity?.playerId === playerId,
      );
  }

  sendTo(playerIds: ReadonlyArray<PlayerId>, messageFor: (playerId: PlayerId) => ServerMessage) {
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      if (identity !== null && playerIds.includes(identity.playerId)) {
        socket.send(JSON.stringify(messageFor(identity.playerId)));
      }
    }
  }

  sendRemovals(removals: ReadonlyArray<RoomRemoval>): void {
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      const removal = removals.find(({ playerId }) => playerId === identity?.playerId);
      if (removal !== undefined) {
        const message: ServerMessage = {
          type: "removed",
          protocolVersion: PROTOCOL_VERSION,
          reason: removal.reason,
          rejoinAt: removal.rejoinAt,
        };
        socket.send(JSON.stringify(message));
        socket.close(ROOM_GONE_CLOSE_CODE, "Removed from the room");
      }
    }
  }

  sendNotices(notices: ReadonlyArray<AddressedNotice>): void {
    for (const { playerId, notice } of notices) {
      this.sendTo([playerId], () => ({
        type: "notice",
        protocolVersion: PROTOCOL_VERSION,
        notice,
      }));
    }
  }

  updatePlayers(
    record: RoomRecord | null,
    playerIds: ReadonlyArray<PlayerId>,
    except: WebSocket | null,
  ): void {
    if (record === null || playerIds.length === 0) {
      return;
    }
    for (const socket of this.ctx.getWebSockets()) {
      const { identity } = attachmentOf(socket);
      if (socket !== except && identity !== null && playerIds.includes(identity.playerId)) {
        const update: ServerMessage = {
          type: "update",
          protocolVersion: PROTOCOL_VERSION,
          acceptedActionId: null,
          update: updateFor(record, identity.playerId),
          serverNow: v.parse(EpochMs, Date.now()),
        };
        socket.send(JSON.stringify(update));
      }
    }
  }
}
