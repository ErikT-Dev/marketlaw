import type { HelpTextPart } from "../../components/HelpTextPart";

export const QUESTS_HELP: ReadonlyArray<HelpTextPart> = [
  "Quests are shared goals. In the main phase, complete a quest when you have what it asks for: nothing is used up, and you get the reward at once. ",
  { stat: "workforce" },
  ", ",
  { stat: "quality" },
  " and ",
  { stat: "satisfaction" },
  " must all be 0 or more. Each player can complete each quest once, and several players can complete the same quest in the same turn. A completed quest leaves the table at the end of the turn; a quest nobody completes leaves after 5 turns.",
];
