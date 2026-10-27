import * as v from "valibot";
import { RoomResponse } from "../../shared/api/RoomResponse";
import { postJson } from "./postJson";

const NO_ANSWER: RoomResponse = { isOk: false, reason: "no_answer" };

export async function requestRoom(
  path: string,
  body: unknown,
  token: string,
): Promise<RoomResponse> {
  const parsed = v.safeParse(RoomResponse, await postJson(path, body, token));
  return parsed.success ? parsed.output : NO_ANSWER;
}
