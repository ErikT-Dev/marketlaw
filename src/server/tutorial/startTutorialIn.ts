import { startTutorial } from "../../rules/tutorial/startTutorial";
import type { EpochMs } from "../../shared/EpochMs";
import type { Identity } from "../room/Identity";
import { TUTORIAL_SCHEMA_VERSION } from "./TUTORIAL_SCHEMA_VERSION";
import type { TutorialStorage } from "./TutorialStorage";

export function startTutorialIn(storage: TutorialStorage, player: Identity, now: EpochMs): void {
  const previous = storage.read();
  storage.write({
    schemaVersion: TUTORIAL_SCHEMA_VERSION,
    player,
    tutorial: startTutorial(now),
    stateVersion: previous === undefined ? 0 : previous.stateVersion + 1,
    acceptedActionIds: previous?.acceptedActionIds ?? [],
  });
}
