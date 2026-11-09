import * as v from "valibot";
import { GuestResponse } from "../../shared/api/GuestResponse";
import { postJson } from "./postJson";

const NO_ANSWER: GuestResponse = { isOk: false, reason: "no_answer" };

export async function requestAccount(path: string, body: unknown): Promise<GuestResponse> {
  const answer = await postJson(path, body).catch(() => null);
  const parsed = v.safeParse(GuestResponse, answer);
  return parsed.success ? parsed.output : NO_ANSWER;
}
