import type { Random } from "./Random";
import type { SavedGame } from "./SavedGame";
import { seededRandom } from "./seededRandom";

export function randomForNextAction(saved: SavedGame): Random {
  return seededRandom(saved.seed, saved.actionLog.length + 1);
}
