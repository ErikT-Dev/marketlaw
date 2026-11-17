import type { HostSocket } from "./HostSocket";
import { Reconnector } from "./Reconnector";
import type { ReopeningSocketOptions } from "./ReopeningSocketOptions";

export class ReopeningSocket {
  private readonly options: ReopeningSocketOptions;
  private socket: HostSocket | null = null;
  private isOpen = false;
  private readonly reconnector: Reconnector;

  constructor(options: ReopeningSocketOptions) {
    this.options = options;
    this.reconnector = new Reconnector(options.runLater);
    this.connect();
  }

  send(text: string): boolean {
    return this.socket !== null && this.isOpen && this.socket.send(text);
  }

  close(): void {
    this.reconnector.close();
    this.socket?.close();
  }

  private connect(): void {
    this.socket = this.options.openSocket(this.options.url, {
      onOpen: () => {
        this.isOpen = true;
        this.reconnector.connected();
        this.options.onOpen();
      },
      onMessage: (text) => {
        this.options.onMessage(text);
      },
      onClose: () => {
        this.socket = null;
        this.isOpen = false;
        this.reconnector.afterDrop(() => {
          this.connect();
        });
      },
    });
  }
}
