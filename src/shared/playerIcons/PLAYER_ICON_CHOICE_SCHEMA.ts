import * as v from "valibot";
import { ICON_COLOR } from "./ICON_COLOR";
import { PLAYER_ICON_PICTURES } from "./PLAYER_ICON_PICTURES";

export const PLAYER_ICON_CHOICE_SCHEMA = v.object({
  picture: v.picklist(PLAYER_ICON_PICTURES),
  background: ICON_COLOR,
  color: ICON_COLOR,
});
