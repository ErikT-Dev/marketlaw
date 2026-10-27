import type { Quest } from "./Quest";
import { QUEST_NAMES_BY_TIER } from "./QUEST_NAMES_BY_TIER";

export const QUESTS: ReadonlyArray<Quest> = QUEST_NAMES_BY_TIER.flatMap(({ tier, names }) =>
  names.map((name) => ({ name, tier })),
);
