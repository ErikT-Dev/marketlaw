import { createContext } from "react";
import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";

export const PlayerIcons = createContext<ReadonlyArray<PlayerIconChoice>>([]);
