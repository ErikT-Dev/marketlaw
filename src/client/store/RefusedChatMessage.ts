import type { EpochMs } from "../../shared/EpochMs";
import type { ChatLimitCode } from "./ChatLimitCode";

export type RefusedChatMessage = {
  readonly code: ChatLimitCode;
  readonly sendAgainAt: EpochMs | null;
  readonly text: string;
};
