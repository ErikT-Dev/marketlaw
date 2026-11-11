import * as v from "valibot";
import { STARTING_STATS } from "../../../src/rules/STARTING_STATS.ts";
import { CardName } from "../../../src/shared/catalogue/CardName.ts";
import { QuestName } from "../../../src/shared/catalogue/QuestName.ts";
import { TypeName } from "../../../src/shared/catalogue/TypeName.ts";
import { ProjectName } from "../../../src/shared/ProjectName.ts";
import { TradeName } from "../../../src/shared/TradeName.ts";

const COUNT = v.pipe(v.number(), v.integer());
const CARDS = v.array(CardName);
const SEAT_NUMBER = v.picklist([1, 2, 3, 4]);
const QUEST_NAME = QuestName;

const STATS = v.strictObject({
  funds: v.optional(COUNT, STARTING_STATS.funds),
  income: v.optional(COUNT, STARTING_STATS.income),
  influence: v.optional(COUNT, STARTING_STATS.influence),
  workforce: v.optional(COUNT, STARTING_STATS.workforce),
  quality: v.optional(COUNT, STARTING_STATS.quality),
  satisfaction: v.optional(COUNT, STARTING_STATS.satisfaction),
  product: v.optional(COUNT, STARTING_STATS.product),
  distribution: v.optional(COUNT, STARTING_STATS.distribution),
  bonus: v.optional(COUNT, STARTING_STATS.bonus),
});

const SEAT = v.strictObject({
  seat: SEAT_NUMBER,
  stats: v.optional(STATS),
  hand: v.optional(CARDS),
  city: v.optional(CARDS),
  gained_types: v.optional(v.record(TypeName, COUNT)),
  combos_claimed: v.optional(
    v.array(v.strictObject({ card: CardName, combo: v.string(), times: COUNT })),
  ),
  projects: v.optional(v.array(ProjectName)),
  quests_completed: v.optional(v.array(QUEST_NAME)),
  build_passes: v.optional(COUNT),
  build_passes_bought: v.optional(COUNT),
  played_this_turn: v.optional(v.boolean()),
  skipped_build: v.optional(v.boolean()),
  influence_uses: v.optional(v.record(TradeName, COUNT)),
  actions_this_turn: v.optional(COUNT),
  done: v.optional(v.boolean()),
  out_of_time: v.optional(v.boolean()),
  left: v.optional(v.boolean()),
  time_bank_ms: v.optional(COUNT),
  timeouts_in_a_row: v.optional(COUNT),
  market: v.optional(v.picklist(["in", "out"])),
  new_cards: v.optional(CARDS),
});

const MARKETPLACE_SLOT = v.strictObject({
  place: v.picklist([
    "residential",
    "industry",
    "service",
    "public_quality",
    "public_satisfaction",
    "open_1",
    "open_2",
    "open_3",
  ]),
  card: v.nullable(CardName),
  phases_shown: v.optional(COUNT),
});

export const GIVEN_SCHEMA = v.strictObject({
  kind: v.optional(v.picklist(["casual", "ranked"])),
  players: v.optional(v.picklist([1, 2, 3, 4])),
  turn: v.optional(COUNT),
  phase: v.optional(v.picklist(["new_game", "market", "main", "ended"])),
  first_player: v.optional(SEAT_NUMBER),
  market_go: v.optional(v.strictObject({ seat: SEAT_NUMBER })),
  seats: v.optional(v.array(SEAT)),
  deck: v.optional(CARDS),
  discard: v.optional(CARDS),
  marketplace: v.optional(v.array(MARKETPLACE_SLOT)),
  quests: v.optional(
    v.array(v.strictObject({ quest: v.nullable(QUEST_NAME), turns_on_table: v.optional(COUNT) })),
  ),
  quest_list: v.optional(v.array(QUEST_NAME)),
  bonus_types: v.optional(v.array(TypeName)),
  first_completions: v.optional(v.array(ProjectName)),
  clock_ms: v.optional(COUNT),
  paused: v.optional(v.boolean()),
  last_vote_turn: v.optional(COUNT),
});
