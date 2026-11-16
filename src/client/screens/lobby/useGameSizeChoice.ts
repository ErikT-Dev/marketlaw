import { useState } from "react";
import * as v from "valibot";
import { RANKED_GAME_SIZES } from "../../../shared/RANKED_GAME_SIZES";
import type { RankedGameSize } from "../../../shared/RankedGameSize";

const GAME_SIZES_KEY = "marketlaw.rankedGameSizes";
const DEFAULT_SIZES: ReadonlyArray<RankedGameSize> = [3];
const STORED_SIZES = v.pipe(v.array(v.picklist(RANKED_GAME_SIZES)), v.minLength(1));

function readStoredSizes(): ReadonlyArray<RankedGameSize> {
  try {
    const parsed = v.safeParse(
      STORED_SIZES,
      JSON.parse(localStorage.getItem(GAME_SIZES_KEY) ?? ""),
    );
    return parsed.success ? parsed.output : DEFAULT_SIZES;
  } catch {
    return DEFAULT_SIZES;
  }
}

function storeSizes(sizes: ReadonlyArray<RankedGameSize>): void {
  try {
    localStorage.setItem(GAME_SIZES_KEY, JSON.stringify(sizes));
  } catch {
    return;
  }
}

export function useGameSizeChoice() {
  const [sizes, setSizes] = useState(readStoredSizes);
  return {
    sizes,
    choose: (chosen: ReadonlyArray<RankedGameSize>) => {
      storeSizes(chosen);
      setSizes(chosen);
    },
  };
}
