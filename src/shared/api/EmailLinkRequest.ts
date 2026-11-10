import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const EmailLinkRequest = v.strictObject({ link: SessionToken });

export type EmailLinkRequest = v.InferOutput<typeof EmailLinkRequest>;
