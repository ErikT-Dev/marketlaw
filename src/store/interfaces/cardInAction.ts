import { SectorTypes, TierTypes } from "./gameTypes"

export interface GameCard {
    cardId: number
    cardName: string
    location: "Deck" | "Hand" | "Play" | "Sold"
    newInHand: boolean
    sector: SectorTypes
    tier: TierTypes
    cost: number
}