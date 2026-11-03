import type { GeneratedNameResponse } from "../../shared/api/GeneratedNameResponse";
import { firstFreeName } from "../accounts/firstFreeName";
import { generatedNames } from "../accounts/generatedNames";
import { takenNameKeys } from "./takenNameKeys";

const CANDIDATES = 10;

function randomBelow(limit: number): number {
  const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
  return value % limit;
}

export async function generatedNameRoute(env: Env): Promise<Response> {
  const candidates = generatedNames(randomBelow, CANDIDATES);
  const name = firstFreeName(candidates, await takenNameKeys(env.DB, candidates));
  if (name === null) {
    return new Response("No free name, try again", { status: 503 });
  }
  const body: GeneratedNameResponse = { name };
  return Response.json(body);
}
