import * as v from "valibot";
import { randomPlayerIcon } from "../../../src/server/accounts/randomPlayerIcon.ts";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../../../src/shared/playerIcons/PLAYER_ICON_CHOICE_SCHEMA.ts";
import type { AccountChanges } from "./AccountChanges.ts";
import { NO_ACCOUNT_CHANGES } from "./NO_ACCOUNT_CHANGES.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";

export function scriptedGuestChanges(random: ScriptedRandom): AccountChanges {
  const draw = random.next("icon", "setup");
  const listed = v.safeParse(PLAYER_ICON_CHOICE_SCHEMA, draw.kind === "listed" ? draw.value : null);
  return { ...NO_ACCOUNT_CHANGES, icon: listed.success ? listed.output : randomPlayerIcon() };
}
