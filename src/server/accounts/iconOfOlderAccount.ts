import type { PlayerId } from "../../shared/PlayerId";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import { playerIconFromRandom } from "./playerIconFromRandom";

const TWO_TO_THE_32 = 4_294_967_296;
const HASH_MULTIPLIER = 0x01000193;
const HASH_START = 0x811c9dc5;
const STEP = 0x6d2b79f5;

function seedOf(playerId: PlayerId): number {
  return Array.from(playerId).reduce(
    (hash, character) => Math.imul(hash ^ (character.codePointAt(0) ?? 0), HASH_MULTIPLIER) >>> 0,
    HASH_START,
  );
}

export function iconOfOlderAccount(playerId: PlayerId): PlayerIconChoice {
  let state = seedOf(playerId);
  return playerIconFromRandom(() => {
    state = (state + STEP) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / TWO_TO_THE_32;
  });
}
