import { Type } from "./gameTypes"
import { PlayedBonusTypes } from "./playedBonusTypes"

export interface HighScore {
    turnsPlayed: number
    funds: number
    workforce: number
    quality: number
    satisfaction: number
    product: number
    sales: number
    income: number
    types: Type[]
    score: number
    dateAndTimeUTC: string
    gameDate: string
    gameId: string
    userUid: string
    userDisplayName: string
    playingAsGuest: boolean
    uploadedToDb: boolean
    playedBonusTypes: PlayedBonusTypes
    season: number
}