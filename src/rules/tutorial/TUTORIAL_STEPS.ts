import type { TutorialStepId } from "../../shared/TutorialStepId";
import type { TutorialStep } from "./TutorialStep";

const SEAT = 1;

export const TUTORIAL_STEPS: Readonly<Record<TutorialStepId, TutorialStep>> = {
  "T1.1": { accepts: { type: "continue" }, draws: [] },
  "T1.2": { accepts: { type: "play_card", seat: SEAT, card: "Row House" }, draws: [] },
  "T1.3": { accepts: { type: "sell", seat: SEAT, cards: ["Hiking Trail"] }, draws: [] },
  "T1.4": { accepts: { type: "end_turn", seat: SEAT }, draws: [] },
  "T2.1": { accepts: { type: "continue" }, draws: [] },
  "T2.2": {
    accepts: { type: "turn_draw", seat: SEAT, choice: { option: "A", card: "Fire Station" } },
    draws: ["Elementary School"],
  },
  "T2.3": { accepts: { type: "play_card", seat: SEAT, card: "Fire Station" }, draws: [] },
  "T2.4": { accepts: { type: "claim_all", seat: SEAT }, draws: [] },
  "T2.5": { accepts: { type: "end_turn", seat: SEAT }, draws: ["Trauma Center"] },
  "T3.1": {
    accepts: { type: "turn_draw", seat: SEAT, choice: { option: "B", sector: "Public" } },
    draws: ["Public Playground", "Tennis Court"],
  },
  "T3.2": { accepts: { type: "play_card", seat: SEAT, card: "Public Playground" }, draws: [] },
  "T3.3": {
    accepts: { type: "end_turn", seat: SEAT },
    draws: [
      "Log House",
      "Orchard",
      "Fast Food Restaurant",
      "Green Park",
      "Gym",
      "Bus Depot",
      "Poultry Farm",
    ],
  },
  "T4.1": {
    accepts: { type: "turn_draw", seat: SEAT, choice: { option: "A", card: "Orchard" } },
    draws: ["Extensive Wheat Farm"],
  },
  "T4.2": { accepts: { type: "play_card", seat: SEAT, card: "Orchard" }, draws: [] },
  "T4.3": { accepts: { type: "end_turn", seat: SEAT }, draws: ["Livestock Farm", "Landfill"] },
  "T5.1": {
    accepts: { type: "turn_draw", seat: SEAT, choice: { option: "B", sector: "Service" } },
    draws: ["Cafe", "Night Club"],
  },
  "T5.2": { accepts: { type: "play_card", seat: SEAT, card: "Liquor Shop" }, draws: ["Small Home"] },
  "T5.3": { accepts: { type: "complete_quest", seat: SEAT, quest: "Trading post" }, draws: [] },
  "T5.4": { accepts: { type: "continue" }, draws: [] },
};
