import type { PlayerView } from "../../../src/shared/PlayerView.ts";
import type { GameLogEntry } from "./GameLogEntry.ts";

export function gameLogOf(view: PlayerView): ReadonlyArray<GameLogEntry> {
  return [...view.drawLog, ...view.mainPhaseLog];
}
