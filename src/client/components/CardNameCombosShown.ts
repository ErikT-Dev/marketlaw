import type { Combo } from "../../shared/catalogue/Combo";
import type { ComboHighlight } from "./ComboHighlight";

export type CardNameCombosShown = {
  readonly readyingCombos: ReadonlyArray<Extract<Combo, { readonly kind: "card_name" }>>;
  readonly comboHighlights: ReadonlyArray<ComboHighlight>;
};
