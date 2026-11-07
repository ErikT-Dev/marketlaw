import type { EpochMs } from "../../shared/EpochMs";
import type { ChatRefusalCode } from "./ChatRefusalCode";

export type RefusedChatMessage = {
  readonly code: ChatRefusalCode;
  readonly sendAgainAt: EpochMs | null;
  readonly text: string;
};
