import type { Player } from "./Player";
import { timeMove } from "./timeMove";

const END_TURN_SHOWN = { selector: "button", texts: ["End turn", "Waiting for the server…"] };

export async function endTurnForEveryone(
  players: ReadonlyArray<Player>,
): Promise<ReadonlyArray<number>> {
  const times: number[] = [];
  for (const player of players) {
    times.push(
      await timeMove(player, player.page.getByRole("button", { name: "End turn" }), END_TURN_SHOWN),
    );
  }
  return times;
}
