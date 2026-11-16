import { RANKED_GAME_SIZES } from "../../shared/RANKED_GAME_SIZES";
import type { RankedGameSize } from "../../shared/RankedGameSize";
import type { Result } from "../../shared/Result";

const DEFAULT_SIZES: ReadonlyArray<RankedGameSize> = [3];

export function gameSizesOf(
  requested: ReadonlyArray<number> | null,
): Result<ReadonlyArray<RankedGameSize>, "invalid_game_sizes"> {
  if (requested === null) {
    return { isOk: true, value: DEFAULT_SIZES };
  }
  const chosen = RANKED_GAME_SIZES.filter((size) => requested.includes(size));
  const isEveryKnown = requested.every((size) => chosen.some((known) => known === size));
  return chosen.length > 0 && isEveryKnown
    ? { isOk: true, value: chosen }
    : { isOk: false, error: "invalid_game_sizes" };
}
