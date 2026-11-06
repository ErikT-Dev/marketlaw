import type { EpochMs } from "../EpochMs";

export type ChatMessageEntry = {
  readonly kind: "message";
  readonly from: string;
  readonly text: string;
  readonly at: EpochMs;
  readonly isOwn: boolean;
};
