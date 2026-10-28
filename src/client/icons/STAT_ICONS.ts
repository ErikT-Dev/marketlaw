import type { StatName } from "./StatName";

export const STAT_ICONS: Readonly<
  Record<StatName, { readonly file: string; readonly label: string }>
> = {
  funds: { file: "FUNDS", label: "Funds" },
  income: { file: "INCOME", label: "Income" },
  influence: { file: "INFLUENCE", label: "Influence" },
  workforce: { file: "WORKFORCE", label: "Workforce" },
  quality: { file: "QUALITY", label: "Quality" },
  satisfaction: { file: "SATISFACTION", label: "Satisfaction" },
  product: { file: "PRODUCT", label: "Product" },
  distribution: { file: "DISTRIBUTION", label: "Distribution" },
  bonus: { file: "BONUS", label: "Bonus" },
  buildPasses: { file: "BUILD_PASS", label: "Build passes" },
  cost: { file: "COST", label: "Cost" },
  tier: { file: "TIER", label: "Tier" },
};
