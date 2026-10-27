import * as v from "valibot";
import { CARD_NAMES } from "./CARD_NAMES";

export const CardName = v.picklist(CARD_NAMES);

export type CardName = v.InferOutput<typeof CardName>;
