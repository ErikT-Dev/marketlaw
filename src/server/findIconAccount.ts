import * as v from "valibot";
import { PlayerId } from "../shared/PlayerId";
import type { PlayerIconChoice } from "../shared/playerIcons/PlayerIconChoice";
import { loginStateOf } from "./accounts/loginStateOf";
import { storedPlayerIconOf } from "./accounts/storedPlayerIconOf";

const ICON_ROW = v.object({
  id: PlayerId,
  icon: v.unknown(),
  last_used_ms: v.number(),
  icon_changes_ms: v.pipe(v.string(), v.parseJson(), v.array(v.number())),
});

type IconAccount = {
  readonly playerId: PlayerId;
  readonly icon: PlayerIconChoice;
  readonly iconChangesMs: ReadonlyArray<number>;
};

export async function findIconAccount(
  db: D1Database,
  tokenHash: string,
  now: number,
): Promise<IconAccount | null> {
  const row = await db
    .prepare(
      "SELECT players.id AS id, players.icon AS icon, logins.last_used_ms AS last_used_ms, players.icon_changes_ms AS icon_changes_ms FROM logins JOIN players ON players.id = logins.player_id WHERE logins.token_hash = ?",
    )
    .bind(tokenHash)
    .first();
  const parsed = v.safeParse(ICON_ROW, row);
  if (!parsed.success || loginStateOf(parsed.output.last_used_ms, now) === "expired") {
    return null;
  }
  const { id, icon, icon_changes_ms: iconChangesMs } = parsed.output;
  return { playerId: id, icon: storedPlayerIconOf(icon, id), iconChangesMs };
}
