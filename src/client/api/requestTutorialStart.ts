import * as v from "valibot";
import { TutorialStartResponse } from "../../shared/api/TutorialStartResponse";
import { postJson } from "./postJson";

const NO_ANSWER: TutorialStartResponse = { isOk: false, reason: "no_answer" };

export async function requestTutorialStart(token: string): Promise<TutorialStartResponse> {
  const parsed = v.safeParse(
    TutorialStartResponse,
    await postJson("/api/tutorials", { token }).catch(() => null),
  );
  return parsed.success ? parsed.output : NO_ANSWER;
}
