import type { GameHost } from "../shared/GameHost";
import type { HostEvent } from "../shared/HostEvent";
import type { ActionIntent } from "../shared/protocol/ActionIntent";
import { parseServerMessage } from "../shared/protocol/parseServerMessage";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import type { HostSocket } from "./HostSocket";
import type { RemoteHostOptions } from "./RemoteHostOptions";

const FIRST_RECONNECT_DELAY_MS = 1000;
const LONGEST_RECONNECT_DELAY_MS = 10_000;

export class RemoteGameHost implements GameHost {
  private readonly options: RemoteHostOptions;
  private listeners: ReadonlyArray<(event: HostEvent) => void> = [];
  private socket: HostSocket | null = null;
  private stateVersion: number | null = null;
  private failedConnects = 0;
  private isClosedByPlayer = false;

  constructor(options: RemoteHostOptions) {
    this.options = options;
    this.connect();
  }

  readonly sendAction = (action: ActionIntent): string => {
    const actionId = this.options.newActionId();
    this.socket?.send(
      JSON.stringify({
        protocolVersion: PROTOCOL_VERSION,
        token: this.options.token,
        type: "action",
        actionId,
        stateVersion: this.stateVersion ?? 0,
        action,
      }),
    );
    return actionId;
  };

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
    this.isClosedByPlayer = true;
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
      const next = message.update.game?.stateVersion ?? null;
      const hasGap = next !== null && this.stateVersion !== null && next > this.stateVersion + 1;
      this.stateVersion = next;
      this.emit({
        type: "update",
        update: message.update,
        acceptedActionId: message.acceptedActionId,
      });
      if (hasGap) {
        this.requestResync();
      }
    } else if (message?.type === "rejected") {
      this.emit({ type: "rejected", code: message.code, actionId: message.actionId });
      if (message.code === "stale_state") {
        this.requestResync();
      }
    }
  }

  private connect(): void {
    this.emit({ type: "connection", status: "connecting" });
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.failedConnects = 0;
        this.emit({ type: "connection", status: "open" });
        this.requestResync();
      },
      onMessage: (text) => {
        this.receive(text);
      },
      onClose: () => {
        this.socket = null;
        this.emit({ type: "connection", status: "closed" });
        if (!this.isClosedByPlayer) {
          const delay = Math.min(
            FIRST_RECONNECT_DELAY_MS * 2 ** this.failedConnects,
            LONGEST_RECONNECT_DELAY_MS,
          );
          this.failedConnects += 1;
          this.options.runLater(delay, () => {
            this.connect();
          });
        }
      },
    });
  }
}
