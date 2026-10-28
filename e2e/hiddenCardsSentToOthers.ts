import { handOf } from "./handOf";
import type { Player } from "./Player";

export async function hiddenCardsSentToOthers(
  players: ReadonlyArray<Player>,
): Promise<ReadonlyArray<string>> {
  const hands = await Promise.all(players.map(async (player) => handOf(player.page)));
  return players.flatMap((receiver, receiverIndex) =>
    hands
      .filter((ownerHand, ownerIndex) => ownerHand.length > 0 && ownerIndex !== receiverIndex)
      .flat()
      .filter((card) => receiver.frames.some((frame) => frame.includes(`"${card}"`))),
  );
}
