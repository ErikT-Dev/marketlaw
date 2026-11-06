import type { Identity } from "../../../src/server/room/Identity.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";

export function seatOrderDrawn(
  random: ScriptedRandom,
  players: ReadonlyArray<PlayerId>,
  identityNamed: (name: string) => Identity,
): ReadonlyArray<PlayerId> {
  const draw = random.next("seats", "setup");
  if (draw.kind !== "listed" || !Array.isArray(draw.value)) {
    return players;
  }
  const names: ReadonlyArray<unknown> = draw.value;
  return names.map((name) => identityNamed(String(name)).playerId);
}
