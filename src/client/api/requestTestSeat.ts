import * as v from "valibot";
import { TestSeatResponse } from "../../shared/api/TestSeatResponse";
import { postJson } from "./postJson";

export async function requestTestSeat(token: string): Promise<boolean> {
  const parsed = v.safeParse(TestSeatResponse, await postJson("/api/test-room-seats", { token }));
  return parsed.success && parsed.output.isTestRoomSeat;
}
