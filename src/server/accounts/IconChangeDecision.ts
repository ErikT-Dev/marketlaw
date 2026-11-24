import type { PlayerIconChoice } from "../../shared/playerIcons/PlayerIconChoice";

export type IconChangeDecision =
  | { readonly kind: "unchanged" }
  | {
      readonly kind: "refused";
      readonly reason: "unknown_icon" | "icon_colors_too_alike" | "icon_change_too_soon";
    }
  | { readonly kind: "changed"; readonly icon: PlayerIconChoice };
