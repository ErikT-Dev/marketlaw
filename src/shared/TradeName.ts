import * as v from "valibot";
import { INFLUENCE_TRADES } from "./ruleFiles/INFLUENCE_TRADES";

export const TradeName = v.picklist(INFLUENCE_TRADES.map(({ name }) => name));

export type TradeName = v.InferOutput<typeof TradeName>;
