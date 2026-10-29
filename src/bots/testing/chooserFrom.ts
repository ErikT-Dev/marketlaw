import type { BotChooser } from "../BotChooser";

export function chooserFrom(seed: number): BotChooser {
  let state = seed >>> 0;
  return {
    pickIndex: (count) => {
      state = (state + 0x6d2b79f5) >>> 0;
      let mixed = Math.imul(state ^ (state >>> 15), state | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      const fraction = ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
      return Math.floor(fraction * Math.max(count, 1));
    },
  };
}
