import type { SavedGame } from "../../src/rules/SavedGame.ts";
import { FUNDS_SAMPLE_TURNS } from "./FUNDS_SAMPLE_TURNS.ts";

export function gameLengthMeasuresOf(
  saved: SavedGame,
  fundsAtTurnStart: Readonly<Record<number, number>>,
): Readonly<Record<string, number>> {
  const { result, turn } = saved.state;
  const scores = (result?.places ?? []).map(({ score }) => score);
  const fundsSamples = FUNDS_SAMPLE_TURNS.flatMap<readonly [string, number]>((sampleTurn) => {
    const funds = fundsAtTurnStart[sampleTurn];
    return funds === undefined
      ? []
      : [
          [`funds@${String(sampleTurn)}`, funds],
          [`reached@${String(sampleTurn)}`, 1],
        ];
  });
  return {
    turns: turn,
    endedByEndGoal: result?.endedBy === "end_goal" ? 1 : 0,
    endedByTurnLimit: result?.endedBy === "turn_limit" ? 1 : 0,
    winnerScore: scores[0] ?? 0,
    averageScore:
      scores.length === 0 ? 0 : scores.reduce((sum, score) => sum + score, 0) / scores.length,
    ...Object.fromEntries(fundsSamples),
  };
}
