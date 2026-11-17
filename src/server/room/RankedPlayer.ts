import type { PlayerRatingBeforeGame } from "../ratings/PlayerRatingBeforeGame";
import type { Identity } from "./Identity";

export type RankedPlayer = Identity & PlayerRatingBeforeGame;
