import type { PlayerIconPicture } from "../../shared/playerIcons/PlayerIconPicture";
import { PLAYER_ICON_ARTISTS } from "./PLAYER_ICON_ARTISTS";

export function playerIconPictureLabel(picture: PlayerIconPicture): string {
  const [folder = "", file = ""] = picture.split("/");
  const artist = PLAYER_ICON_ARTISTS.find((candidate) => candidate.folder === folder)?.name;
  const words = file.replaceAll("-", " ");
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} by ${artist ?? folder}`;
}
