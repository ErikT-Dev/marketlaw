import * as v from "valibot";
import { TestSeatRequest } from "../../shared/api/TestSeatRequest";
import type { TestSeatResponse } from "../../shared/api/TestSeatResponse";
import { isTestRoomSeat } from "./isTestRoomSeat";

export async function confirmTestSeat(request: Request, env: Env): Promise<Response> {
  const body = v.safeParse(TestSeatRequest, await request.json().catch(() => null));
  const answer: TestSeatResponse = {
    isTestRoomSeat: body.success && (await isTestRoomSeat(env.DB, body.output.token)),
  };
  return Response.json(answer);
}
