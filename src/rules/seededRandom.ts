import { Sector } from "../shared/catalogue/Sector";
import type { Tier } from "../shared/catalogue/Tier";
import type { Random } from "./Random";
import type { TierChances } from "./TierChances";

const TWO_TO_THE_32 = 4_294_967_296;

function itemAt<T>(items: ReadonlyArray<T>, fraction: number): T {
  const item = items[Math.floor(fraction * items.length)];
  if (item === undefined) {
    throw new Error("cannot pick from an empty list");
  }
  return item;
}

function tierAt(chances: TierChances, fraction: number): Tier {
  if (fraction < chances[1]) {
    return 1;
  }
  return fraction < chances[1] + chances[2] ? 2 : 3;
}

export function seededRandom(seed: number, stream: number): Random {
  let state = (seed ^ Math.imul(stream + 1, 0x9e3779b9)) >>> 0;
  function nextFraction(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / TWO_TO_THE_32;
  }
  return {
    pickSector: () => itemAt(Sector.options, nextFraction()),
    pickTier: (chances) => tierAt(chances, nextFraction()),
    pickQuest: (candidates) => itemAt(candidates, nextFraction()),
    pickType: (candidates) => itemAt(candidates, nextFraction()),
    shuffle: (cards) =>
      cards.reduce<ReadonlyArray<(typeof cards)[number]>>((shuffled, card) => {
        const position = Math.floor(nextFraction() * (shuffled.length + 1));
        return [...shuffled.slice(0, position), card, ...shuffled.slice(position)];
      }, []),
  };
}
