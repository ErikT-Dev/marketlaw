import type { PlayerId } from "../../shared/PlayerId";
import { PLAYER_ICON_COLOR_COUNT } from "../../shared/PLAYER_ICON_COLOR_COUNT";

const HASH_MULTIPLIER = 31;
const HASH_MODULUS = 2 ** 31;

export function playerIconColorOf(playerId: PlayerId): number {
  const codes = Array.from({ length: playerId.length }, (unused, index) =>
    playerId.charCodeAt(index),
  );
  const hash = codes.reduce((soFar, code) => (soFar * HASH_MULTIPLIER + code) % HASH_MODULUS, 0);
  return hash % PLAYER_ICON_COLOR_COUNT;
}
