import { areIconColorsTooAlike } from "../../shared/playerIcons/areIconColorsTooAlike";
import { PLAYER_ICON_PICTURES } from "../../shared/playerIcons/PLAYER_ICON_PICTURES";
import type { PlayerIconPicture } from "../../shared/playerIcons/PlayerIconPicture";
import { changeAllowedAtUnder } from "./changeAllowedAtUnder";
import { ICON_CHANGE_LIMIT } from "./ICON_CHANGE_LIMIT";
import type { IconChange } from "./IconChange";
import type { IconChangeDecision } from "./IconChangeDecision";

function pictureNamed(picture: string): PlayerIconPicture | undefined {
  return PLAYER_ICON_PICTURES.find((known) => known === picture);
}

export function decideIconChange(change: IconChange): IconChangeDecision {
  const { current, wanted } = change;
  const picture = pictureNamed(wanted.picture);
  if (picture === undefined) {
    return { kind: "refused", reason: "unknown_icon" };
  }
  const icon = { picture, background: wanted.background, color: wanted.color };
  if (areIconColorsTooAlike(icon.background, icon.color)) {
    return { kind: "refused", reason: "icon_colors_too_alike" };
  }
  const isSame =
    icon.picture === current.picture &&
    icon.background === current.background &&
    icon.color === current.color;
  if (isSame) {
    return { kind: "unchanged" };
  }
  if (changeAllowedAtUnder(ICON_CHANGE_LIMIT, change.changesMs, change.now) !== null) {
    return { kind: "refused", reason: "icon_change_too_soon" };
  }
  return { kind: "changed", icon };
}
