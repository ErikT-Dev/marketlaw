import type { CardName } from "../../shared/catalogue/CardName";
import type { QuestName } from "../../shared/catalogue/QuestName";
import type { TypeName } from "../../shared/catalogue/TypeName";
import type { MarketplacePlace } from "../../shared/MarketplacePlace";

export const TUTORIAL_SETUP: {
  readonly hand: ReadonlyArray<CardName>;
  readonly quests: ReadonlyArray<QuestName>;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly marketplace: Readonly<Record<MarketplacePlace, CardName>>;
} = {
  hand: ["Row House", "Stone Quarry", "Liquor Shop", "Library", "Cottage", "Pub", "Hiking Trail"],
  quests: ["Trading post", "Working district", "Green city", "Fishing village"],
  bonusTypes: ["Retail", "Safety"],
  marketplace: {
    residential: "Farm House",
    industry: "Metal Mining",
    service: "Dentist",
    public_quality: "Fire Station",
    public_satisfaction: "Basketball Court",
    open_1: "Apparel Store",
    open_2: "Clinic",
    open_3: "Forest Plantation",
  },
};
