import type { CardName } from "../../../shared/catalogue/CardName";
import type { Sector } from "../../../shared/catalogue/Sector";
import type { TutorialStepId } from "../../../shared/TutorialStepId";
import type { TutorialFocus } from "./TutorialFocus";

function handCard(card: CardName): TutorialFocus {
  return { highlighted: [{ kind: "hand_card", card }], usableColumn: "right" };
}

function marketCard(card: CardName): TutorialFocus {
  return { highlighted: [{ kind: "market_card", card }], usableColumn: "middle" };
}

function sector(sector: Sector): TutorialFocus {
  return { highlighted: [{ kind: "sector", sector }], usableColumn: "middle" };
}

const END_TURN: TutorialFocus = {
  highlighted: [{ kind: "button", button: "end_turn" }],
  usableColumn: "right",
};

export const TUTORIAL_FOCUS: Readonly<Record<TutorialStepId, TutorialFocus>> = {
  "T1.1": {
    highlighted: [
      { kind: "panel", panel: "hand" },
      { kind: "panel", panel: "stats" },
    ],
    usableColumn: "none",
  },
  "T1.2": handCard("Row House"),
  "T1.3": handCard("Hiking Trail"),
  "T1.4": END_TURN,
  "T2.1": {
    highlighted: [
      { kind: "panel", panel: "marketplace" },
      { kind: "panel", panel: "market_go" },
    ],
    usableColumn: "none",
  },
  "T2.2": marketCard("Fire Station"),
  "T2.3": handCard("Fire Station"),
  "T2.4": { highlighted: [{ kind: "button", button: "claim_all" }], usableColumn: "right" },
  "T2.5": END_TURN,
  "T3.1": sector("Public"),
  "T3.2": handCard("Public Playground"),
  "T3.3": END_TURN,
  "T4.1": marketCard("Orchard"),
  "T4.2": handCard("Orchard"),
  "T4.3": END_TURN,
  "T5.1": sector("Service"),
  "T5.2": handCard("Liquor Shop"),
  "T5.3": { highlighted: [{ kind: "quest", quest: "Trading post" }], usableColumn: "middle" },
  "T5.4": { highlighted: [], usableColumn: "none" },
};
