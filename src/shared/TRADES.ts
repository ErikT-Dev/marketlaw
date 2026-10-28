import type { Trade } from "./Trade";
import type { TradeName } from "./TradeName";

function trade(costs: Trade["costs"], gains: Trade["gains"], limitPerGame: number | null): Trade {
  return { costs, gains, doesGiveBuildPass: false, limitPerGame };
}

function buildPassTrade(costs: Trade["costs"], limitPerGame: number | null): Trade {
  return { costs, gains: {}, doesGiveBuildPass: true, limitPerGame };
}

export const TRADES: Readonly<Record<TradeName, Trade>> = {
  influence_to_funds: trade({ influence: 4 }, { funds: 2 }, 1),
  influence_to_quality: trade({ influence: 4 }, { quality: 1 }, 1),
  influence_to_satisfaction: trade({ influence: 4 }, { satisfaction: 1 }, 1),
  influence_to_workforce: trade({ influence: 6 }, { workforce: 1 }, 1),
  fund_to_influence: trade({ funds: 1 }, { influence: 1 }, null),
  buy_build_pass: buildPassTrade({ funds: 2 }, null),
  influence_to_build_pass: buildPassTrade({ influence: 5 }, 1),
  skip_build: buildPassTrade({}, 3),
  quality_to_satisfaction_with_influence: trade(
    { influence: 1, quality: 1 },
    { satisfaction: 1 },
    1,
  ),
  satisfaction_to_quality_with_influence: trade(
    { influence: 1, satisfaction: 1 },
    { quality: 1 },
    1,
  ),
  product_to_distribution: trade(
    { influence: 2, product: 1 },
    { distribution: 1, satisfaction: 1 },
    1,
  ),
  distribution_to_product: trade(
    { influence: 2, distribution: 1, satisfaction: 1 },
    { product: 1 },
    1,
  ),
  quality_to_workforce_with_influence: trade({ influence: 2, quality: 1 }, { workforce: 1 }, 1),
  satisfaction_to_workforce_with_influence: trade(
    { influence: 2, satisfaction: 1 },
    { workforce: 1 },
    1,
  ),
  workforce_to_satisfaction: trade({ workforce: 1 }, { satisfaction: 1 }, 1),
  workforce_to_quality: trade({ workforce: 1 }, { quality: 1 }, 1),
  two_quality_to_satisfaction: trade({ quality: 2 }, { satisfaction: 1 }, null),
  two_satisfaction_to_quality: trade({ satisfaction: 2 }, { quality: 1 }, null),
  four_quality_to_workforce: trade({ quality: 4 }, { workforce: 1 }, null),
  four_satisfaction_to_workforce: trade({ satisfaction: 4 }, { workforce: 1 }, null),
};
