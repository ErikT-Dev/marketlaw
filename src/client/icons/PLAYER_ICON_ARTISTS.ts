import licenceText from "../../../player-icons/license.txt?raw";
import { PLAYER_ICON_PICTURES } from "../../shared/playerIcons/PLAYER_ICON_PICTURES";
import { playerIconArtistsOf } from "../../shared/playerIcons/playerIconArtistsOf";

export const PLAYER_ICON_ARTISTS = playerIconArtistsOf(licenceText).filter(({ folder }) =>
  PLAYER_ICON_PICTURES.some((picture) => picture.startsWith(`${folder}/`)),
);
