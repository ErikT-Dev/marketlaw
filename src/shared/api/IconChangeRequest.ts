import * as v from "valibot";
import { ICON_COLOR } from "../playerIcons/ICON_COLOR";
import { SessionToken } from "./SessionToken";

export const IconChangeRequest = v.strictObject({
  token: SessionToken,
  icon: v.strictObject({
    picture: v.pipe(v.string(), v.maxLength(100)),
    background: ICON_COLOR,
    color: ICON_COLOR,
  }),
});

export type IconChangeRequest = v.InferOutput<typeof IconChangeRequest>;
