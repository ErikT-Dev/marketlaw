import type { TutorialStepId } from "../../../shared/TutorialStepId";
import type { TutorialStepText } from "./TutorialStepText";

export const TUTORIAL_TEXTS: Readonly<Record<TutorialStepId, TutorialStepText>> = {
  "T1.1": {
    text: "Welcome, Mayor! You build a city by playing cards from your hand. This is your hand, and these are your stats.",
    textAfter: null,
    waitingFor: "press Continue",
  },
  "T1.2": {
    text: "Residential cards bring workforce, the people who staff your city. Play Row House.",
    textAfter:
      "Every card also uses something up. Residents need quality and satisfaction, so those dropped below zero. While any of them is negative, you cannot earn income.",
    waitingFor: "play Row House",
  },
  "T1.3": {
    text: "You can play one card per turn. Cards you don't need can be sold for 1 fund each. Sell Hiking Trail.",
    textAfter: null,
    waitingFor: "sell Hiking Trail",
  },
  "T1.4": {
    text: "End your turn when you are done.",
    textAfter:
      "At the end of every turn you get your income in funds, 1 influence, and bonus from your stats. Every full 10 bonus turns into 1 fund.",
    waitingFor: "end your turn",
  },
  "T2.1": {
    text: "From turn 2 on, every turn starts with the market phase. You get one go in it, your turn draw: take a free card from the marketplace, plus one card of the same sector from the deck. Or skip the market and draw 2 cards of one sector from the deck.",
    textAfter: null,
    waitingFor: "press Continue",
  },
  "T2.2": {
    text: null,
    textAfter:
      "Fire Station is yours, and you drew Elementary School from the deck. Cards marked new arrived this turn.",
    waitingFor: "take Fire Station from the marketplace",
  },
  "T2.3": {
    text: "Public cards bring quality or satisfaction. Play Fire Station.",
    textAfter: null,
    waitingFor: "play Fire Station",
  },
  "T2.4": {
    text: "Cards have combos. Row House gives +1 quality when you have a Safety card, and Fire Station is a Safety card. Claim all ready combos.",
    textAfter: null,
    waitingFor: "claim all ready combos",
  },
  "T2.5": { text: null, textAfter: null, waitingFor: "end your turn" },
  "T3.1": {
    text: "This time, skip the marketplace: choose Public and draw 2 cards from the deck.",
    textAfter: null,
    waitingFor: "draw 2 Public cards from the deck",
  },
  "T3.2": {
    text: "Each card costs 1 more for every card of the same sector and tier already in your city. Public Playground costs 5 now, not 4.",
    textAfter: "No stat is negative any more.",
    waitingFor: "play Public Playground",
  },
  "T3.3": { text: null, textAfter: null, waitingFor: "end your turn" },
  "T4.1": { text: null, textAfter: null, waitingFor: "take Orchard from the marketplace" },
  "T4.2": {
    text: "Industry cards make product. Play Orchard.",
    textAfter: "Income needs product and distribution together. Service cards make distribution.",
    waitingFor: "play Orchard",
  },
  "T4.3": {
    text: null,
    textAfter: "Your bonus passed 10, so 10 bonus became 1 fund.",
    waitingFor: "end your turn",
  },
  "T5.1": { text: null, textAfter: null, waitingFor: "draw 2 Service cards from the deck" },
  "T5.2": {
    text: "Liquor Shop is a Service card. Play it.",
    textAfter:
      "1 product and 1 distribution became +1 income and a new card. This happens by itself whenever you have both and no stat is negative.",
    waitingFor: "play Liquor Shop",
  },
  "T5.3": {
    text: "Quests on the table give rewards to every player who meets them. Trading post needs income 4 and the Retail type. Liquor Shop has the Retail type. Complete it.",
    textAfter: "Each quest stays a few turns, and any player can complete it once.",
    waitingFor: "complete Trading post",
  },
  "T5.4": {
    text: "Two more things to know. Projects: when you collect 8 quality, 8 satisfaction or 8 workforce, you can complete a project for income, funds and influence. The game ends after the turn in which a player has income 22 and all 3 projects; then the highest score wins. In a real game, you play against 1 to 3 other players at the same time, and every turn has a time limit. You can read all the rules any time from the menu.",
    textAfter: null,
    waitingFor: "press Finish",
  },
};
