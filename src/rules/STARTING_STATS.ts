import { fundsInTenths } from "../shared/fundsInTenths";
import type { Stats } from "../shared/Stats";

export const STARTING_STATS: Stats = {
  funds: fundsInTenths(7),
  income: 3,
  influence: 0,
  workforce: 0,
  quality: 0,
  satisfaction: 0,
  product: 0,
  distribution: 0,
};
