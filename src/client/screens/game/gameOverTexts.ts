import type { GameResult } from "../../../shared/GameResult";
import type { SeatNumber } from "../../../shared/SeatNumber";
import type { IconText } from "../../components/IconText";
import { listedNames } from "./listedNames";

const CASUAL = "Casual game: ratings do not change.";
const NO_WINNER = "Abandoned games have no winner and no game record, and ratings stay the same.";

type GameOverTexts = { readonly title: string; readonly why: IconText };

function lastPlayerTexts(winner: string, isViewer: boolean, turn: number): GameOverTexts {
  return {
    title: isViewer ? "You win: everyone else left" : `${winner} wins: everyone else left`,
    why: `All other players left the game in turn ${String(turn)}, so the game ended at once and ${isViewer ? "you are" : `${winner} is`} 1st. ${CASUAL}`,
  };
}

export function gameOverTexts(
  result: GameResult,
  turn: number,
  nameOf: (seat: SeatNumber) => string,
  viewer: SeatNumber,
): GameOverTexts {
  const winner = result.places[0];
  const title = winner === undefined ? "The game is over" : `${nameOf(winner.seat)} wins!`;
  switch (result.endedBy) {
    case "everyone_left":
      return {
        title: "The game was abandoned",
        why: `Every player still in the game left at the same moment in turn ${String(turn)}, so the game ended with no winner. ${NO_WINNER}`,
      };
    case "paused_too_long":
      return {
        title: "The game was abandoned",
        why: `The game stayed paused for 24 hours with every player away, so it ended with no winner. ${NO_WINNER}`,
      };
    case "last_player":
      return lastPlayerTexts(nameOf(winner?.seat ?? viewer), winner?.seat === viewer, turn);
    case "turn_limit":
      return {
        title,
        why: `Nobody reached the end goal by turn ${String(turn)}, the last turn, so the game ended after that main phase. ${CASUAL}`,
      };
    case "end_goal": {
      const reached = result.places
        .filter((place) => place.hasReachedEndGoal)
        .map((place) => nameOf(place.seat));
      return {
        title,
        why: [
          `${listedNames(reached)} reached `,
          { stat: "income", value: 22 },
          ` and all 3 projects in turn ${String(turn)}, so the game ended after that main phase. ${CASUAL}`,
        ],
      };
    }
  }
}
