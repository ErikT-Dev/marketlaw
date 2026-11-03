import { reconnectDelayMs } from "./reconnectDelayMs";

export class Reconnector {
  private readonly runLater: (delayMs: number, run: () => void) => void;
  private failedConnects = 0;
  private isClosed = false;

  constructor(runLater: (delayMs: number, run: () => void) => void) {
    this.runLater = runLater;
  }

  connected(): void {
    this.failedConnects = 0;
  }

  close(): void {
    this.isClosed = true;
  }

  afterDrop(reconnect: () => void): void {
    if (this.isClosed) {
      return;
    }
    const delay = reconnectDelayMs(this.failedConnects);
    this.failedConnects += 1;
    this.runLater(delay, () => {
      if (!this.isClosed) {
        reconnect();
      }
    });
  }
}
