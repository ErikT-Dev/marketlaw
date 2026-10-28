import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const TestSeatRequest = v.strictObject({ token: SessionToken });
