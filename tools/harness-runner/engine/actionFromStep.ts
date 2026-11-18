import * as v from "valibot";
import type { GameAction } from "../../../src/rules/GameAction.ts";
import { CardName } from "../../../src/shared/catalogue/CardName.ts";
import { Kind } from "../../../src/shared/catalogue/Kind.ts";
import { QuestName } from "../../../src/shared/catalogue/QuestName.ts";
import { Sector } from "../../../src/shared/catalogue/Sector.ts";
import { ProjectName } from "../../../src/shared/ProjectName.ts";
import { INFLUENCE_DRAWS } from "../../../src/shared/ruleFiles/INFLUENCE_DRAWS.ts";
import { TradeName } from "../../../src/shared/TradeName.ts";

const SEAT = v.picklist([1, 2, 3, 4]);
const DRAW_TRADE = v.picklist(INFLUENCE_DRAWS.map(({ name }) => name));

const STEP_SCHEMA = v.variant("action", [
  v.strictObject({ seat: SEAT, action: v.literal("play_card"), card: CardName }),
  v.strictObject({
    seat: SEAT,
    action: v.literal("sell"),
    cards: v.pipe(v.array(CardName), v.nonEmpty()),
  }),
  v.strictObject({ seat: SEAT, action: v.literal("end_turn") }),
  v.strictObject({ seat: SEAT, action: v.literal("claim_all") }),
  v.strictObject({ seat: SEAT, action: v.literal("undo") }),
  v.strictObject({ seat: SEAT, action: v.literal("leave_game") }),
  v.strictObject({ seat: SEAT, action: v.literal("call_vote") }),
  v.strictObject({ seat: SEAT, action: v.literal("vote"), vote: v.picklist(["yes", "no"]) }),
  v.strictObject({
    seat: SEAT,
    action: v.literal("turn_draw"),
    option: v.picklist(["A", "B"]),
    card: v.optional(CardName),
    sector: v.optional(Sector),
  }),
  v.strictObject({ seat: SEAT, action: v.literal("complete_project"), project: ProjectName }),
  v.strictObject({ seat: SEAT, action: v.literal("complete_quest"), quest: QuestName }),
  v.strictObject({
    seat: SEAT,
    action: v.literal("influence"),
    trade: v.union([TradeName, DRAW_TRADE]),
    kind: v.optional(Kind),
  }),
]);

function influenceAction(
  seat: v.InferOutput<typeof SEAT>,
  trade: string,
  kind: Kind | undefined,
): GameAction {
  const draw = INFLUENCE_DRAWS.find(({ name }) => name === trade);
  if (draw !== undefined) {
    if (kind === undefined) {
      throw new Error(`${trade} names no kind`);
    }
    return { type: "draw_action", seat, kind, tier: draw.tier };
  }
  if (kind !== undefined) {
    throw new Error(`${trade} takes no kind`);
  }
  return { type: "influence", seat, trade };
}

function turnDrawAction(
  seat: v.InferOutput<typeof SEAT>,
  option: "A" | "B",
  card: CardName | undefined,
  sector: Sector | undefined,
): GameAction {
  if (option === "A" && card !== undefined && sector === undefined) {
    return { type: "turn_draw", seat, choice: { option, card } };
  }
  if (option === "B" && sector !== undefined && card === undefined) {
    return { type: "turn_draw", seat, choice: { option, sector } };
  }
  throw new Error(
    `turn_draw option ${option} needs ${option === "A" ? "a card" : "a sector"} only`,
  );
}

export function actionFromStep(step: Readonly<Record<string, unknown>>): GameAction {
  const parsed = v.parse(STEP_SCHEMA, step);
  switch (parsed.action) {
    case "play_card":
      return { type: "play_card", seat: parsed.seat, card: parsed.card };
    case "sell": {
      const [first, ...rest] = parsed.cards;
      if (first === undefined) {
        throw new Error("sell names no cards");
      }
      return { type: "sell", seat: parsed.seat, cards: [first, ...rest] };
    }
    case "end_turn":
      return { type: "end_turn", seat: parsed.seat };
    case "claim_all":
      return { type: "claim_all", seat: parsed.seat };
    case "undo":
      return { type: "undo", seat: parsed.seat };
    case "leave_game":
      return { type: "leave_game", seat: parsed.seat };
    case "call_vote":
      return { type: "call_vote", seat: parsed.seat };
    case "vote":
      return { type: "vote", seat: parsed.seat, answer: parsed.vote };
    case "complete_project":
      return { type: "complete_project", seat: parsed.seat, project: parsed.project };
    case "complete_quest":
      return { type: "complete_quest", seat: parsed.seat, quest: parsed.quest };
    case "influence":
      return influenceAction(parsed.seat, parsed.trade, parsed.kind);
    case "turn_draw":
      return turnDrawAction(parsed.seat, parsed.option, parsed.card, parsed.sector);
    default: {
      const unknownStep: never = parsed;
      throw new Error(`unknown step ${JSON.stringify(unknownStep)}`);
    }
  }
}
