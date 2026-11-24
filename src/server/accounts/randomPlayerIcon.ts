import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import { playerIconFromRandom } from "./playerIconFromRandom";

const TWO_TO_THE_32 = 4_294_967_296;

function randomFraction(): number {
  return (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / TWO_TO_THE_32;
}

export function randomPlayerIcon(): PlayerIconChoice {
  return playerIconFromRandom(randomFraction);
}
