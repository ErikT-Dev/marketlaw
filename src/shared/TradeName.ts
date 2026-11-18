import * as v from "valibot";

export const TradeName = v.picklist([
  "influence_to_funds",
  "influence_to_quality",
  "influence_to_satisfaction",
  "influence_to_workforce",
  "fund_to_influence",
  "buy_build_pass",
  "influence_to_build_pass",
  "quality_to_satisfaction_with_influence",
  "satisfaction_to_quality_with_influence",
  "product_to_distribution",
  "distribution_to_product",
  "quality_to_workforce_with_influence",
  "satisfaction_to_workforce_with_influence",
  "workforce_to_satisfaction",
  "workforce_to_quality",
  "two_quality_to_satisfaction",
  "two_satisfaction_to_quality",
  "four_quality_to_workforce",
  "four_satisfaction_to_workforce",
]);

export type TradeName = v.InferOutput<typeof TradeName>;
