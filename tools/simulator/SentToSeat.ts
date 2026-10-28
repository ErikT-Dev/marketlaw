import type { PlayerView } from "../../src/shared/PlayerView.ts";

export type SentToSeat = {
  readonly text: string;
  readonly view: PlayerView | undefined;
  readonly isFrameSent: boolean;
  readonly isUnchanged: boolean;
};
