import type { PlayerIconPicture } from "../../shared/playerIcons/PlayerIconPicture";

export function playerIconPictureUrl(picture: PlayerIconPicture): string {
  const [artist = "", name = ""] = picture.split("/");
  return new URL(`../../../player-icons/${artist}/${name}.svg`, import.meta.url).href;
}
