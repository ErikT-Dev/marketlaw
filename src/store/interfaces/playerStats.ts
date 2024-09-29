import { GameCard } from "./cardInAction"
import { TierData } from "./tierData"
import { Project } from "./project"
import { Type } from "./gameTypes"
import { Combo } from "./combo"
import { InfluenceUses } from "./influenceUses"
import { PlayedBonusTypes } from "./playedBonusTypes"

export interface PlayerStats {
    turnsPlayed: number
    displayedCard: GameCard | null
    funds: number
    workforce: number
    quality: number
    satisfaction: number
    product: number
    sales: number
    income: number
    bonus: number
    influence: number
    gameCards: GameCard[]
    types: Type[]
    playedCombos: Combo[]
    tierData: TierData
    playedCardThisTurn: boolean
    skippedBuildThisTurn: boolean
    gameRunning: boolean
    timesUsedBuildPass: number
    hasBuildPassCurrently: boolean
    buildPassesRemaining: number
    projects: Project[]
    influenceUses: InfluenceUses
    gameDate: string
    playedBonusTypes: PlayedBonusTypes
}