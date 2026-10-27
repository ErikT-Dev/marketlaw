import type { CardName } from "../shared/catalogue/CardName";
import type { QuestName } from "../shared/catalogue/QuestName";
import type { Sector } from "../shared/catalogue/Sector";
import type { Tier } from "../shared/catalogue/Tier";
import type { TypeName } from "../shared/catalogue/TypeName";
import type { TierChances } from "./TierChances";

export type Random = {
  readonly pickSector: () => Sector;
  readonly pickTier: (chances: TierChances) => Tier;
  readonly pickQuest: (candidates: ReadonlyArray<QuestName>) => QuestName;
  readonly pickType: (candidates: ReadonlyArray<TypeName>) => TypeName;
  readonly shuffle: (cards: ReadonlyArray<CardName>) => ReadonlyArray<CardName>;
};
