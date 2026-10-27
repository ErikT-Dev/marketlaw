import type { CardName } from "./CardName";
import type { CardStats } from "./CardStats";
import type { CardTypeCount } from "./CardTypeCount";
import type { Combo } from "./Combo";
import type { Sector } from "./Sector";
import type { Tier } from "./Tier";

export type Card = {
  readonly number: number;
  readonly name: CardName;
  readonly sector: Sector;
  readonly tier: Tier;
  readonly baseCost: number;
  readonly stats: CardStats;
  readonly types: ReadonlyArray<CardTypeCount>;
  readonly combos: ReadonlyArray<Combo>;
  readonly photo: string;
};
