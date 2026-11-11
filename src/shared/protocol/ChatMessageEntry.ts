import type { EpochMs } from "../EpochMs";
import type { PlayerId } from "../PlayerId";

export type ChatMessageEntry = {
  readonly kind: "message";
  readonly from: string;
  readonly fromId: PlayerId;
  readonly text: string;
  readonly at: EpochMs;
  readonly isOwn: boolean;
};
