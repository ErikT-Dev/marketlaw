import type { CardName } from "./catalogue/CardName";
import type { Sector } from "./catalogue/Sector";

export type TurnDrawChoice =
  | { readonly option: "A"; readonly card: CardName }
  | { readonly option: "B"; readonly sector: Sector };
