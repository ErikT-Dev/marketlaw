import * as v from "valibot";

export const TestSeatResponse = v.strictObject({ isTestRoomSeat: v.boolean() });

export type TestSeatResponse = v.InferOutput<typeof TestSeatResponse>;
