import type { EpochMs } from "../EpochMs";
import type { TutorialView } from "../TutorialView";

export type TutorialUpdateMessage = {
  readonly type: "tutorial_update";
  readonly protocolVersion: number;
  readonly acceptedActionId: string | null;
  readonly stateVersion: number;
  readonly view: TutorialView;
  readonly serverNow: EpochMs;
};
