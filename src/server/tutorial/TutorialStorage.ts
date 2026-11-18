import type { TutorialRecord } from "./TutorialRecord";

export type TutorialStorage = {
  readonly read: () => TutorialRecord | undefined;
  readonly write: (record: TutorialRecord) => void;
  readonly remove: () => void;
};
