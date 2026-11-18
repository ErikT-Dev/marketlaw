import type { GameMenuItem } from "./GameMenuItem";
import { gameMenuEntriesOf } from "./gameMenuEntriesOf";
import type { GameMenuPlace } from "./GameMenuPlace";
import { TUTORIAL_LABEL } from "./TUTORIAL_LABEL";
import { TUTORIAL_UNAVAILABLE_LINE } from "./TUTORIAL_UNAVAILABLE_LINE";

const UNAVAILABLE_TUTORIAL: GameMenuItem = {
  entry: { label: TUTORIAL_LABEL, line: TUTORIAL_UNAVAILABLE_LINE, choice: { kind: "tutorial" } },
  isAvailable: false,
};

export function gameMenuItemsOf(place: GameMenuPlace): ReadonlyArray<GameMenuItem> {
  const entries = gameMenuEntriesOf(place);
  const offered = entries.map((entry) => ({ entry, isAvailable: true }));
  const isTutorialOffered = entries.some(({ choice }) => choice.kind === "tutorial");
  return isTutorialOffered ? offered : [...offered, UNAVAILABLE_TUTORIAL];
}
