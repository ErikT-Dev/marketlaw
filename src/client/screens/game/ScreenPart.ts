import type { CardName } from "../../../shared/catalogue/CardName";
import type { QuestName } from "../../../shared/catalogue/QuestName";
import type { Sector } from "../../../shared/catalogue/Sector";

export type ScreenPart =
  | { readonly kind: "panel"; readonly panel: "hand" | "stats" | "marketplace" | "market_go" }
  | { readonly kind: "hand_card"; readonly card: CardName }
  | { readonly kind: "market_card"; readonly card: CardName }
  | { readonly kind: "button"; readonly button: "end_turn" | "claim_all" }
  | { readonly kind: "sector"; readonly sector: Sector }
  | { readonly kind: "quest"; readonly quest: QuestName };
