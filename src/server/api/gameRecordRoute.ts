import * as v from "valibot";
import type { GameRecordResponse } from "../../shared/api/GameRecordResponse";
import { GameId } from "../../shared/GameId";
import { gameRecordResponseOf } from "../records/gameRecordResponseOf";
import { readUsernames } from "../records/readUsernames";

const NOT_FOUND: GameRecordResponse = { kind: "not_found" };

export async function gameRecordRoute(env: Env, gameIdText: string): Promise<Response> {
  const gameId = v.safeParse(GameId, gameIdText);
  if (!gameId.success) {
    return Response.json(NOT_FOUND, { status: 404 });
  }
  const answer = await gameRecordResponseOf(
    env.DB,
    async (ids) => readUsernames(env.DB, ids),
    gameId.output,
  );
  return Response.json(answer, { status: answer.kind === "found" ? 200 : 404 });
}
