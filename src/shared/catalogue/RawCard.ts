import * as v from "valibot";
import { ComboStat } from "./ComboStat";
import { Sector } from "./Sector";
import { Tier } from "./Tier";

const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));
const OPTIONAL_NAME = v.string();
const COMBO_COUNT = v.nullable(v.pipe(v.number(), v.integer(), v.minValue(1)));
const COMBO_STAT = v.union([ComboStat, v.literal("")]);
const COMBO_INFINITE = v.nullable(v.boolean());

export const RawCard = v.strictObject({
  cardId: v.pipe(v.number(), v.integer(), v.minValue(1)),
  cardName: v.pipe(v.string(), v.minLength(1)),
  imgName: v.pipe(v.string(), v.minLength(1)),
  tier: Tier,
  sector: Sector,
  doubleType1: OPTIONAL_NAME,
  doubleType2: OPTIONAL_NAME,
  type1: OPTIONAL_NAME,
  type2: OPTIONAL_NAME,
  type3: OPTIONAL_NAME,
  type4: OPTIONAL_NAME,
  type5: OPTIONAL_NAME,
  cost: COUNT,
  workforce: COUNT,
  quality: COUNT,
  satisfaction: COUNT,
  sales: COUNT,
  product: COUNT,
  c1ReqN: COMBO_COUNT,
  c1ReqType: OPTIONAL_NAME,
  c1GainsN: COMBO_COUNT,
  c1GainsType: COMBO_STAT,
  c1Infinite: COMBO_INFINITE,
  c2ReqN: COMBO_COUNT,
  c2ReqType: OPTIONAL_NAME,
  c2GainsN: COMBO_COUNT,
  c2GainsType: COMBO_STAT,
  c2Infinite: COMBO_INFINITE,
  c3ReqN: COMBO_COUNT,
  c3ReqType: OPTIONAL_NAME,
  c3GainsN: COMBO_COUNT,
  c3GainsType: COMBO_STAT,
  c3Infinite: COMBO_INFINITE,
  c4ReqN: COMBO_COUNT,
  c4ReqType: OPTIONAL_NAME,
  c4GainsN: COMBO_COUNT,
  c4GainsType: COMBO_STAT,
  c4Infinite: COMBO_INFINITE,
});

export type RawCard = v.InferOutput<typeof RawCard>;
