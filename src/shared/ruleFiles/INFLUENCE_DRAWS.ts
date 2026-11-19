import { INFLUENCE_ACTIONS } from "./INFLUENCE_ACTIONS";
import type { InfluenceDraw } from "./InfluenceDraw";

export const INFLUENCE_DRAWS: ReadonlyArray<InfluenceDraw> = INFLUENCE_ACTIONS.flatMap((action) =>
  action.kind === "draw" ? [action] : [],
);
