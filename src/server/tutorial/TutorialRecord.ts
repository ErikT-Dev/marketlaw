import type { TutorialState } from "../../rules/tutorial/TutorialState";
import type { Identity } from "../room/Identity";

export type TutorialRecord = {
  readonly schemaVersion: number;
  readonly player: Identity;
  readonly tutorial: TutorialState;
  readonly stateVersion: number;
  readonly acceptedActionIds: ReadonlyArray<string>;
};
