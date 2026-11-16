import type { QueueIntent } from "./protocol/QueueIntent";

export type QueueFeed = {
  readonly send: (token: string, intent: QueueIntent) => boolean;
  readonly close: () => void;
};
