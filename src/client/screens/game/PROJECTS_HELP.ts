import type { IconTextPart } from "../../components/IconTextPart";

export const PROJECTS_HELP: ReadonlyArray<IconTextPart> = [
  "You have 3 projects. In the main phase, complete one when you have 8 of its stat, at least 10 ",
  { stat: "income" },
  ", and ",
  { stat: "workforce" },
  ", ",
  { stat: "quality" },
  " and ",
  { stat: "satisfaction" },
  " are all 0 or more. It uses up the 8 and gives +1 ",
  { stat: "income" },
  ", +2 ",
  { stat: "funds" },
  ", +3 ",
  { stat: "influence" },
  " and 1 card, every time. The end goal needs all 3 projects and ",
  { stat: "income" },
  " 20.",
];
