import { RANKED_GAME_SIZES } from "../../../shared/RANKED_GAME_SIZES";
import type { RankedGameSize } from "../../../shared/RankedGameSize";

export function toggledGameSizes(
  sizes: ReadonlyArray<RankedGameSize>,
  size: RankedGameSize,
): ReadonlyArray<RankedGameSize> {
  const isChosen = sizes.includes(size);
  if (isChosen && sizes.length === 1) {
    return sizes;
  }
  return RANKED_GAME_SIZES.filter((known) => (known === size ? !isChosen : sizes.includes(known)));
}
