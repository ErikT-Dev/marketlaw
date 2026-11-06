import type { GameHost } from "../shared/GameHost";
import type { HostEvent } from "../shared/HostEvent";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import type { RoomIntent } from "../shared/protocol/RoomIntent";
import type { ServerMessage } from "../shared/protocol/ServerMessage";
import { parseServerMessage } from "../shared/protocol/parseServerMessage";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { OPENED_ELSEWHERE_CLOSE_CODE } from "../shared/OPENED_ELSEWHERE_CLOSE_CODE";
import { ROOM_GONE_CLOSE_CODE } from "../shared/ROOM_GONE_CLOSE_CODE";
import type { HostSocket } from "./HostSocket";
import { Reconnector } from "./Reconnector";
import type { RemoteHostOptions } from "./RemoteHostOptions";

export class RemoteGameHost implements GameHost {
  private readonly options: RemoteHostOptions;
  private listeners: ReadonlyArray<(event: HostEvent) => void> = [];
  private socket: HostSocket | null = null;
  private stateVersion: number | null = null;
  private readonly reconnector: Reconnector;

  constructor(options: RemoteHostOptions) {
    this.options = options;
    this.reconnector = new Reconnector(options.runLater);
    this.connect();
  }

  readonly sendAction = (action: ActionIntent): string | null => {
    const actionId = this.options.newActionId();
    const isSent = this.socket?.send(
      JSON.stringify({
        protocolVersion: PROTOCOL_VERSION,
        token: this.options.token,
        type: "action",
        actionId,
        stateVersion: this.stateVersion ?? 0,
        action,
      }),
    );
    return isSent === true ? actionId : null;
  };

  readonly sendRoomAction = (action: RoomIntent): boolean =>
    this.socket?.send(
      JSON.stringify({
        protocolVersion: PROTOCOL_VERSION,
        token: this.options.token,
        type: "room",
        action,
      }),
    ) === true;

  readonly requestResync = (): void => {
    this.socket?.send(
      JSON.stringify({
        protocolVersion: PROTOCOL_VERSION,
        token: this.options.token,
        type: "resync",
      }),
    );
  };

  readonly subscribe = (listener: (event: HostEvent) => void): (() => void) => {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((known) => known !== listener);
    };
  };

  readonly close = (): void => {
    this.reconnector.close();
    this.socket?.close();
  };

  private emit(event: HostEvent): void {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  private receive(text: string): void {
    const message = parseServerMessage(text);
    if (message?.type === "update") {
      this.receiveUpdate(message);
    } else if (message?.type === "opened_elsewhere") {
      this.reconnector.close();
      this.emit({ type: "connection", status: "opened_elsewhere" });
    } else if (message?.type === "removed") {
      this.reconnector.close();
      this.emit({ type: "removed", reason: message.reason, rejoinAt: message.rejoinAt });
    } else if (message?.type === "notice") {
      this.emit({ type: "notice", notice: message.notice });
    } else if (message?.type === "chat") {
      const { entries, mutedNames, isFullList } = message;
      this.emit({ type: "chat", entries, mutedNames, isFullList });
    } else if (message?.type === "rejected") {
      this.emit({ type: "rejected", code: message.code, actionId: message.actionId });
      if (message.code === "stale_state") {
        this.requestResync();
      }
    }
  }

  private receiveUpdate(message: Extract<ServerMessage, { readonly type: "update" }>): void {
    const next = message.update.game?.stateVersion ?? null;
    const hasGap = next !== null && this.stateVersion !== null && next > this.stateVersion + 1;
    this.stateVersion = next;
    this.reconnector.connected();
    this.emit({
      type: "update",
      update: message.update,
      acceptedActionId: message.acceptedActionId,
      serverNow: message.serverNow,
    });
    if (hasGap) {
      this.requestResync();
    }
  }

  private connect(): void {
    this.emit({ type: "connection", status: "connecting" });
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.emit({ type: "connection", status: "open" });
        this.requestResync();
      },
      onMessage: (text) => {
        this.receive(text);
      },
      onClose: (code) => {
        this.socket = null;
        const isRoomGone = code === ROOM_GONE_CLOSE_CODE;
        if (code === OPENED_ELSEWHERE_CLOSE_CODE) {
          this.reconnector.close();
          this.emit({ type: "connection", status: "opened_elsewhere" });
          return;
        }
        this.emit({ type: "connection", status: isRoomGone ? "room_gone" : "closed" });
        if (!isRoomGone) {
          this.reconnector.afterDrop(() => {
            this.connect();
          });
        }
      },
    });
  }
}
