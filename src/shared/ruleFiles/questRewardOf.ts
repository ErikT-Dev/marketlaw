import type { QuestReward } from "../catalogue/QuestReward";
import type { Result } from "../Result";
import { addedAmounts } from "./addedAmounts";
import type { RuleFileProblem } from "./RuleFileProblem";
import { statKeyOfWord } from "./statKeyOfWord";
import { typeNameOfWords } from "./typeNameOfWords";
import { wholeNumberOf } from "./wholeNumberOf";

type RewardResult = Result<QuestReward, RuleFileProblem>;

const STAT_GAIN = /^\+(\S+) (.+)$/;
const TYPE_GAIN = /^gain (\S+) (.+)$/;
const DRAW = /^draw (\S+) cards?$/;
const NO_REWARD: QuestReward = { stats: {}, gainedType: null, draws: 0 };

function countOf(word: string, line: number): Result<number, RuleFileProblem> {
  const count = wholeNumberOf(word);
  return count === null
    ? { isOk: false, error: { line, word, message: "needs a whole number from 1 to 99" } }
    : { isOk: true, value: count };
}

function withStatGain(reward: QuestReward, match: RegExpExecArray, line: number): RewardResult {
  const count = countOf(match[1] ?? "", line);
  const statWord = match[2] ?? "";
  const stat = statKeyOfWord(statWord);
  if (!count.isOk) {
    return count;
  }
  if (stat === null) {
    return { isOk: false, error: { line, word: statWord, message: "unknown stat" } };
  }
  return { isOk: true, value: { ...reward, stats: addedAmounts(reward.stats, stat, count.value) } };
}

function withTypeGain(reward: QuestReward, match: RegExpExecArray, line: number): RewardResult {
  const count = countOf(match[1] ?? "", line);
  const type = typeNameOfWords(match[2] ?? "", line);
  if (!count.isOk) {
    return count;
  }
  if (!type.isOk) {
    return type;
  }
  if (count.value !== 1 || reward.gainedType !== null) {
    return {
      isOk: false,
      error: { line, word: match[0], message: "needs new code: a quest gains at most 1 type" },
    };
  }
  return { isOk: true, value: { ...reward, gainedType: type.value } };
}

function withDraws(reward: QuestReward, match: RegExpExecArray, line: number): RewardResult {
  const count = countOf(match[1] ?? "", line);
  return count.isOk
    ? { isOk: true, value: { ...reward, draws: reward.draws + count.value } }
    : count;
}

function withRewardPart(reward: QuestReward, part: string, line: number): RewardResult {
  const statGain = STAT_GAIN.exec(part);
  if (statGain !== null) {
    return withStatGain(reward, statGain, line);
  }
  const typeGain = TYPE_GAIN.exec(part);
  if (typeGain !== null) {
    return withTypeGain(reward, typeGain, line);
  }
  const draw = DRAW.exec(part);
  if (draw !== null) {
    return withDraws(reward, draw, line);
  }
  return {
    isOk: false,
    error: {
      line,
      word: part,
      message: 'a reward is "+N <stat>", "gain N <type>" or "draw N cards"',
    },
  };
}

export function questRewardOf(rewardText: string, line: number): RewardResult {
  return rewardText
    .split(", ")
    .reduce<RewardResult>(
      (reward, part) => (reward.isOk ? withRewardPart(reward.value, part, line) : reward),
      { isOk: true, value: NO_REWARD },
    );
}
