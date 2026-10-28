import type { BotChooser } from "../../src/bots/BotChooser.ts";

const TWO_TO_THE_32 = 4_294_967_296;

export function seededChooser(seed: number): BotChooser {
  let state = (seed * 2_654_435_761) >>> 0;
  return {
    pickIndex: (count) => {
      state = (state + 0x6d2b79f5) >>> 0;
      let mixed = Math.imul(state ^ (state >>> 15), state | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      const fraction = ((mixed ^ (mixed >>> 14)) >>> 0) / TWO_TO_THE_32;
      return Math.floor(fraction * Math.max(count, 1));
    },
  };
}
