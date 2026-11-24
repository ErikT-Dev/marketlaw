import type { IconTextPart } from "../../components/IconTextPart";

export const QUESTS_HELP: ReadonlyArray<IconTextPart> = [
  "Quests are shared goals. In the main phase, complete a quest when you have what it asks for: nothing is used up, and you get the reward at once. ",
  { stat: "workforce" },
  ", ",
  { stat: "quality" },
  " and ",
  { stat: "satisfaction" },
  " must all be 0 or more. Each player can complete each quest once, and several players can complete the same quest in the same turn. In the turn a quest is first completed, everyone who completes it gets 2 ",
  { stat: "funds" },
  " more for every tier of the quest. It then stays one more turn for the others, and leaves. A quest nobody completes leaves after 6 turns (tier 1), 5 (tier 2) or 4 (tier 3).",
];
