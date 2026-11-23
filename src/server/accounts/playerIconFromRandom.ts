import { areIconColorsTooAlike } from "../../shared/playerIcons/areIconColorsTooAlike";
import { PLAYER_ICON_PICTURES } from "../../shared/playerIcons/PLAYER_ICON_PICTURES";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";

const COLOR_RANGE = 0x1000000;
const HEX_DIGITS = 6;
const FALLBACK_COLORS = { background: "#000000", color: "#ffffff" } as const;
const COLOR_TRIES = 50;

function colorFrom(nextFraction: () => number): string {
  const value = Math.floor(nextFraction() * COLOR_RANGE);
  return `#${value.toString(16).padStart(HEX_DIGITS, "0")}`;
}

function colorsFrom(
  nextFraction: () => number,
  triesLeft: number,
): Pick<PlayerIconChoice, "background" | "color"> {
  const background = colorFrom(nextFraction);
  const color = colorFrom(nextFraction);
  if (!areIconColorsTooAlike(background, color)) {
    return { background, color };
  }
  return triesLeft > 1 ? colorsFrom(nextFraction, triesLeft - 1) : FALLBACK_COLORS;
}

export function playerIconFromRandom(nextFraction: () => number): PlayerIconChoice {
  const index = Math.floor(nextFraction() * PLAYER_ICON_PICTURES.length);
  const picture = PLAYER_ICON_PICTURES[index] ?? PLAYER_ICON_PICTURES[0];
  return { picture, ...colorsFrom(nextFraction, COLOR_TRIES) };
}
