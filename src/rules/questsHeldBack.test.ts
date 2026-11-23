import { describe, expect, it } from "vitest";
import type { QuestName } from "../shared/catalogue/QuestName";
import { incomeToPlaceQuestOf } from "../shared/ruleFiles/incomeToPlaceQuestOf";
import { QUEST_LINES } from "../shared/ruleFiles/QUEST_LINES";
import { questOf } from "../shared/ruleFiles/questOf";
import { GAME_STARTED_AT } from "../shared/testing/GAME_STARTED_AT";
import { apply } from "./apply";
import type { GameState } from "./GameState";
import { pickStartingQuests } from "./pickStartingQuests";
import type { Random } from "./Random";
import { seededRandom } from "./seededRandom";
import { setUpGame } from "./setUpGame";
import { withMainPhaseStart } from "./withMainPhaseStart";

const HELD_BACK = QUEST_LINES.find(({ terms }) =>
  terms.needs.some((need) => need.kind === "income"),
);
const ALWAYS_PLACEABLE = QUEST_LINES.find(
  ({ tier, terms }) =>
    tier !== HELD_BACK?.tier && incomeToPlaceQuestOf(terms) === Number.NEGATIVE_INFINITY,
);
const TURN_WITH_EVERY_TIER = 13;

type RecordingRandom = {
  readonly random: Random;
  readonly candidatesOffered: () => ReadonlyArray<QuestName>;
};

function randomPicking(tier: 1 | 2 | 3): RecordingRandom {
  let offered: ReadonlyArray<QuestName> = [];
  return {
    random: {
      pickSector: () => "Public",
      pickTier: () => tier,
      pickQuest: (candidates) => {
        offered = [...offered, ...candidates];
        return candidates[0] ?? "Farmland";
      },
      pickType: (candidates) => candidates[0] ?? "Farm",
      shuffle: (cards) => cards,
    },
    candidatesOffered: () => offered,
  };
}

function refilledWith(heldBack: QuestName, others: QuestName, income: number): GameState {
  const start = setUpGame({ players: 2, kind: "casual", startedAt: GAME_STARTED_AT }, seededRandom(5, 0));
  const state = withMainPhaseStart({
    ...start,
    turn: TURN_WITH_EVERY_TIER,
    quests: [null],
    questList: [heldBack, others],
    seats: start.seats.map((seat) => ({ ...seat, stats: { ...seat.stats, income } })),
  });
  const { random } = randomPicking(questOf(heldBack).tier);
  return [1, 2].reduce<GameState>((current, seat) => {
    const result = apply(current, { type: "end_turn", seat: seat === 1 ? 1 : 2 }, random, GAME_STARTED_AT);
    if (!result.isOk) {
      throw new Error(`end_turn rejected: ${result.error.code}`);
    }
    return result.value;
  }, state);
}

describe("quests held back by income", () => {
  if (HELD_BACK === undefined || ALWAYS_PLACEABLE === undefined) {
    throw new Error("the quest list needs a quest with an income requirement and one without");
  }
  const heldBackIncome = incomeToPlaceQuestOf(HELD_BACK.terms);

  it("skips a quest whose income is too high and treats its tier as having no quests left", () => {
    const after = refilledWith(HELD_BACK.name, ALWAYS_PLACEABLE.name, heldBackIncome - 1);
    expect(after.quests.map((place) => place?.quest)).toEqual([ALWAYS_PLACEABLE.name]);
    expect(after.questList).toEqual([HELD_BACK.name]);
  });

  it("places the quest once some player has its income minus 2", () => {
    const after = refilledWith(HELD_BACK.name, ALWAYS_PLACEABLE.name, heldBackIncome);
    expect(after.quests.map((place) => place?.quest)).toEqual([HELD_BACK.name]);
  });

  it("leaves quests a starting income cannot reach off the starting table", () => {
    const recording = randomPicking(1);
    pickStartingQuests(heldBackIncome - 1, recording.random);
    expect(recording.candidatesOffered()).not.toContain(HELD_BACK.name);
    expect(recording.candidatesOffered().every((quest) => incomeToPlaceQuestOf(questOf(quest).terms) < heldBackIncome)).toBe(true);
  });
});
