import type { PlayerView } from "../../shared/PlayerView";
import type { TutorialProgress } from "../../shared/TutorialProgress";
import type { TutorialView } from "../../shared/TutorialView";
import { roomUpdateWith } from "./roomUpdateWith";

export function tutorialViewAt(
  progress: TutorialProgress,
  changes: Partial<PlayerView> = {},
): TutorialView {
  const view = roomUpdateWith({}).game?.view;
  if (view === undefined) {
    throw new Error("The test room update has no game");
  }
  return {
    progress,
    game: {
      ...view,
      seats: view.seats.filter((seat) => seat.kind === "own"),
      turn: 1,
      firstPlayer: view.seat,
      playerOrder: [view.seat],
      doneOrder: [],
      ...changes,
    },
  };
}
