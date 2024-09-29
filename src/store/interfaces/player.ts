import { HighScore } from "./highScore";
import { Medal } from "./medal";

export interface Player {
    displayName: string
    uid: string
    playedGames: HighScore[]
    medals: Medal[]
}