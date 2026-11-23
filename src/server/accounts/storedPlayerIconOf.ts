import * as v from "valibot";
import type { PlayerId } from "../../shared/PlayerId";
import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../../shared/playerIcons/PLAYER_ICON_CHOICE_SCHEMA";
import { iconOfOlderAccount } from "./iconOfOlderAccount";

const STORED_ICON = v.pipe(v.string(), v.parseJson(), PLAYER_ICON_CHOICE_SCHEMA);

export function storedPlayerIconOf(stored: unknown, playerId: PlayerId): PlayerIconChoice {
  const parsed = v.safeParse(STORED_ICON, stored);
  return parsed.success ? parsed.output : iconOfOlderAccount(playerId);
}
