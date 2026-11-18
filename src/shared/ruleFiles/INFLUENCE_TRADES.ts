import type { Trade } from "../Trade";
import { INFLUENCE_ACTIONS } from "./INFLUENCE_ACTIONS";

export const INFLUENCE_TRADES: ReadonlyArray<Trade> = INFLUENCE_ACTIONS.flatMap((action) =>
  action.kind === "trade" ? [action] : [],
);
