import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";

export type ChatMessage = {
  readonly from: PlayerId;
  readonly name: string;
  readonly text: string;
  readonly at: EpochMs;
  readonly hiddenFrom: ReadonlyArray<PlayerId>;
};
